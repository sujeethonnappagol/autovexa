import express from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import ChatMessage from '../models/ChatMessage.js';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
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
- Project ownership: Sujeet is the owner and main lead of the AutoVexa project. If asked who owns, leads, created, founded, made, or is behind this project, answer that it is Sujeet.
- You have live inventory tools. Use them whenever a user asks to find, compare, inspect, or check a vehicle. Never invent vehicle availability, price, specs, or vendor details.

Key flows:
- Customers must sign up / log in before booking a vehicle
- Vendors register and need admin approval before listing
- Demo accounts (for testing): Customer sujeet@example.com / user123, Vendor abc@motors.com / vendor123, Admin admin@autovexa.com / admin123
- Booking creates a booking ID; invoices can be downloaded from My Bookings
- Vendor dashboard: My Vehicles, Add Vehicle, Bookings

If asked something unrelated to AutoVexa or cars on this platform, politely redirect to AutoVexa topics.
Use the conversation history to remember what the user said earlier in this chat.`;

const tools = [
  {
    type: 'function',
    function: {
      name: 'search_vehicles',
      description: 'Search currently listed vehicles by optional brand, type, fuel, maximum price, and availability.',
      parameters: {
        type: 'object',
        properties: {
          brand: { type: 'string' },
          type: { type: 'string' },
          fuelType: { type: 'string' },
          maxPrice: { type: 'number' },
          status: { type: 'string', enum: ['Available', 'Booked'] },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_vehicle_details',
      description: 'Get full details for one vehicle by numeric vehicle ID.',
      parameters: {
        type: 'object',
        properties: { vehicleId: { type: 'number' } },
        required: ['vehicleId'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'check_availability',
      description: 'Check whether one vehicle is currently available by numeric vehicle ID.',
      parameters: {
        type: 'object',
        properties: { vehicleId: { type: 'number' } },
        required: ['vehicleId'],
        additionalProperties: false,
      },
    },
  },
];

async function runTool(name, rawArguments) {
  let args = {};
  try {
    args = JSON.parse(rawArguments || '{}');
  } catch {
    return { error: 'The tool arguments were invalid.' };
  }

  if (name === 'search_vehicles') {
    const where = { status: { [Op.ne]: 'Disabled' } };
    if (args.brand) where.brand = { [Op.like]: `%${String(args.brand).slice(0, 80)}%` };
    if (args.type) where.type = { [Op.like]: `%${String(args.type).slice(0, 40)}%` };
    if (args.fuelType) where.fuelType = { [Op.like]: `%${String(args.fuelType).slice(0, 40)}%` };
    if (args.status) where.status = args.status;
    if (Number.isFinite(Number(args.maxPrice))) where.price = { [Op.lte]: Number(args.maxPrice) };
    const vehicles = await Vehicle.findAll({
      where,
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName'] }],
      order: [['price', 'ASC']],
      limit: 10,
    });
    return vehicles.map((vehicle) => vehicle.toClient());
  }

  const vehicle = await Vehicle.findByPk(Number(args.vehicleId), {
    include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName'] }],
  });
  if (!vehicle) return { error: 'Vehicle not found.' };
  if (name === 'check_availability') {
    return { vehicleId: vehicle.id, name: `${vehicle.brand} ${vehicle.model}`, status: vehicle.status, available: vehicle.status === 'Available' };
  }
  if (name === 'get_vehicle_details') return vehicle.toClient();
  return { error: `Unknown tool: ${name}` };
}

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

    let reply = '';
    for (let attempt = 0; attempt < 4; attempt += 1) {
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
          tools,
          tool_choice: 'auto',
          temperature: 0.5,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('OpenRouter error:', response.status, errText);
        return res.status(502).json({ message: 'AI service error. Please try again in a moment.' });
      }

      const assistant = (await response.json()).choices?.[0]?.message;
      if (!assistant) break;
      openaiMessages.push(assistant);
      if (!assistant.tool_calls?.length) {
        reply = typeof assistant.content === 'string' ? assistant.content.trim() : '';
        break;
      }
      for (const call of assistant.tool_calls) {
        const result = await runTool(call.function.name, call.function.arguments);
        openaiMessages.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.function.name,
          content: JSON.stringify(result),
        });
      }
    }
    reply ||= "I'm sorry, I couldn't generate a reply. Please try again.";

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
