import crypto from 'node:crypto';
import express from 'express';
import Booking from '../models/Booking.js';
import { razorpayWebhookSecret } from '../config/razorpay.js';

const router = express.Router();

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    if (!razorpayWebhookSecret) return res.status(503).json({ message: 'Razorpay webhook is not configured' });

    const signature = req.headers['x-razorpay-signature'];
    const expected = crypto
      .createHmac('sha256', razorpayWebhookSecret)
      .update(req.body)
      .digest('hex');
    const signatureBuffer = Buffer.from(String(signature || ''));
    const expectedBuffer = Buffer.from(expected);
    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return res.status(400).json({ message: 'Invalid Razorpay webhook signature' });
    }

    const event = JSON.parse(req.body.toString('utf8'));
    if (event.event === 'payment.captured') {
      const payment = event.payload?.payment?.entity;
      const booking = payment?.order_id
        ? await Booking.findOne({ where: { razorpayOrderId: payment.order_id } })
        : null;
      if (booking && booking.paymentStatus !== 'Paid') {
        booking.paymentStatus = 'Paid';
        booking.paymentProvider = 'razorpay';
        booking.paymentMethod = `Razorpay (${payment.method || 'online'})`;
        booking.transactionId = payment.id || '';
        booking.razorpayPaymentId = payment.id || '';
        booking.paidAt = new Date();
        booking.receiptNumber = booking.receiptNumber || `AVX-RCP-${new Date().getFullYear()}-${String(booking.id).padStart(5, '0')}`;
        booking.status = 'Confirmed';
        await booking.save();
      }
    }

    res.json({ received: true });
  }
);

export default router;
