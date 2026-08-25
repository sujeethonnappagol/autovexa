import express from 'express';
import jwt from 'jsonwebtoken';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

const SYSTEM_PROMPT = `You are VexaBot, the official AI assistant for AutoVexa — a premium online vehicle marketplace in India.

Your job:
- Help users browse, compare, and book vehicles
- Explain login roles: Customer, Vendor, Admin
- Guide vendors on listing vehicles and managing bookings
- Answer only about AutoVexa features, vehicles, bookings, invoices, and the website
- Be concise, friendly, and professional
- Prices are in Indian Rupees (INR)
- Contact: support@autovexa.com, phone +91 8123097054, Bangalore, Karnataka, India

Key flows:
- Customers must sign up / log in before booking a vehicle
- Vendors register and need admin approval before listing
- Demo accounts (for testing): Customer sujeet@example.com / user123, Vendor abc@motors.com / vendor123, Admin admin@autovexa.com / admin123
- Booking creates a booking ID; invoices can be downloaded from My Bookings
- Vendor dashboard: My Vehicles, Add Vehicle, Bookings

If asked something unrelated to AutoVexa or cars on this platform, politely redirect to AutoVexa topics.
Use the conversation history to remember what the user said earlier in this chat.`;

/** Optional auth — attaches req.user if token present */
async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user && user.status !== 'Disabled') req.user = user;
    }
  } catch {
    /* guest chat allowed */
  }
  next();
}

/** GET /api/chat/history?sessionId=xxx */
router.get(
  '/history',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const sessionId = String(req.query.sessionId || '').trim();
    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const where = { sessionId };
    // If logged in, also allow loading by userId for same session
    const messages = await ChatMessage.findAll({
      where,
      order: [['createdAt', 'ASC']],
      limit: 100,
      attributes: ['id', 'role', 'content', 'createdAt'],
    });

    res.json(
      messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          id: m.id,
          role: m.role === 'assistant' ? 'bot' : m.role,
          text: m.content,
          createdAt: m.createdAt,
        }))
    );
  })
);

/** POST /api/chat — { sessionId, message } */
router.post(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const sessionId = String(req.body.sessionId || '').trim();
    const message = String(req.body.message || '').trim();

    if (!sessionId || !message) {
      return res.status(400).json({ message: 'sessionId and message are required' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ message: 'Message too long (max 2000 characters)' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        message: 'Chat AI is not configured. Set OPENROUTER_API_KEY in server/.env',
      });
    }

    const userId = req.user?.id || null;

    // Save user message
    await ChatMessage.create({
      sessionId,
      userId,
      role: 'user',
      content: message,
    });

    // Load recent history for context (last 20 messages)
    const history = await ChatMessage.findAll({
      where: { sessionId },
      order: [['createdAt', 'ASC']],
      limit: 40,
    });

    const openaiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-20)
        .map((m) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
    ];

    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
        'X-Title': 'AutoVexa VexaBot',
      },
      body: JSON.stringify({
        model,
        messages: openaiMessages,
        temperature: 0.5,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', response.status, errText);
      return res.status(502).json({
        message: 'AI service error. Please try again in a moment.',
      });
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a reply. Please try again.";

    await ChatMessage.create({
      sessionId,
      userId,
      role: 'assistant',
      content: reply,
    });

    res.json({
      reply,
      sessionId,
    });
  })
);

/** DELETE /api/chat/history — clear session history */
router.delete(
  '/history',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const sessionId = String(req.query.sessionId || req.body.sessionId || '').trim();
    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }
    await ChatMessage.destroy({ where: { sessionId } });
    res.json({ message: 'Chat history cleared' });
  })
);

export default router;
