import express from 'express';
import { Op } from 'sequelize';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import crypto from 'node:crypto';
import razorpay, { razorpayConfigured } from '../config/razorpay.js';

const router = express.Router();

function toClient(b) {
  const vehicle = b.vehicle?.toClient ? b.vehicle.toClient() : b.vehicle;
  const customer = b.customer
    ? {
        id: b.customer.id,
        name: b.customer.name,
        email: b.customer.email,
        phone: b.customer.phone,
      }
    : {
        name: b.customerName,
        email: b.customerEmail,
        phone: b.customerPhone,
      };
  const vendor = b.vendor
    ? {
        id: b.vendor.id,
        name: b.vendor.businessName || b.vendor.name,
        businessName: b.vendor.businessName,
      }
    : null;

  return {
    id: b.bookingId,
    _id: b.id,
    vehicleId: b.vehicleId,
    vehicle,
    customer,
    vendor,
    bookingDate: b.bookingDate,
    vehiclePrice: Number(b.vehiclePrice),
    bookingFee: Number(b.bookingFee),
    tax: Number(b.tax),
    amount: Number(b.amount),
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    transactionId: b.transactionId,
    razorpayOrderId: b.razorpayOrderId,
    feedback: b.feedbackRating
      ? { rating: b.feedbackRating, comment: b.feedbackComment, submittedAt: b.feedbackAt }
      : null,
    status: b.status,
    createdAt: b.createdAt ? new Date(b.createdAt).toISOString().slice(0, 10) : null,
  };
}

const includeAll = [
  {
    model: Vehicle,
    as: 'vehicle',
    include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName', 'email', 'phone'] }],
  },
  { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
  { model: User, as: 'vendor', attributes: ['id', 'name', 'businessName', 'email', 'phone'] },
];

router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const where = {};
    if (req.user.role === 'user') where.customerId = req.user.id;
    else if (req.user.role === 'vendor') where.vendorId = req.user.id;

    const bookings = await Booking.findAll({
      where,
      include: includeAll,
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings.map(toClient));
  })
);

router.get(
  '/my',
  protect,
  authorize('user'),
  asyncHandler(async (req, res) => {
    const bookings = await Booking.findAll({
      where: { customerId: req.user.id },
      include: includeAll,
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings.map(toClient));
  })
);

async function findBooking(id) {
  let booking = await Booking.findOne({ where: { bookingId: id }, include: includeAll });
  if (!booking && /^\d+$/.test(String(id))) {
    booking = await Booking.findByPk(id, { include: includeAll });
  }
  return booking;
}

function canAccessBooking(booking, user) {
  if (user.role === 'admin') return true;
  if (user.role === 'vendor') return booking.vendorId === user.id;
  return booking.customerId === user.id;
}

router.get(
  '/:id',
  protect,
  asyncHandler(async (req, res) => {
    const booking = await findBooking(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!canAccessBooking(booking, req.user)) return res.status(403).json({ message: 'Not your booking' });
    res.json(toClient(booking));
  })
);

router.post(
  '/',
  protect,
  authorize('user'),
  asyncHandler(async (req, res) => {
    const { vehicleId, bookingDate, name, email, phone, address } = req.body;

    const vehicle = await Vehicle.findByPk(vehicleId || req.body.vehicle);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status !== 'Available') {
      return res.status(400).json({ message: 'Vehicle is not available' });
    }

    if (!razorpayConfigured) {
      return res.status(503).json({ message: 'Razorpay is not configured on the server' });
    }
    const vendor = await User.findByPk(vehicle.vendorId);
    if (!vendor?.razorpayAccountId) {
      return res.status(409).json({ message: 'This vendor is not configured to receive Razorpay payments' });
    }

    const vp = Number(vehicle.price);
    const fee = 5000;
    const taxAmt = 4000;
    const amount = vp + fee + taxAmt;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `booking_${Date.now()}`,
      payment_capture: 1,
      notes: { vehicleId: String(vehicle.id), vendorId: String(vehicle.vendorId) },
    });

    const booking = await Booking.create({
      vehicleId: vehicle.id,
      customerId: req.user.id,
      vendorId: vehicle.vendorId,
      bookingDate: bookingDate || new Date().toISOString().slice(0, 10),
      vehiclePrice: vp,
      bookingFee: fee,
      tax: taxAmt,
      amount,
      status: 'Pending',
      customerName: name || req.user.name,
      customerEmail: email || req.user.email,
      customerPhone: phone || req.user.phone,
      customerAddress: address || '',
      paymentStatus: 'Pending',
      razorpayOrderId: order.id,
    });

    vehicle.status = 'Booked';
    await vehicle.save();

    const full = await findBooking(booking.bookingId);
    res.status(201).json({
      booking: toClient(full),
      paymentOrder: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  })
);

router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'vendor'),
  asyncHandler(async (req, res) => {
    const booking = await findBooking(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!canAccessBooking(booking, req.user)) return res.status(403).json({ message: 'Not your booking' });
    if (!['Pending', 'Confirmed', 'Cancelled', 'Completed'].includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }
    booking.status = req.body.status;
    await booking.save();
    res.json({ id: booking.bookingId, status: booking.status });
  })
);

router.patch(
  '/:id/cancel',
  protect,
  asyncHandler(async (req, res) => {
    const booking = await findBooking(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (!canAccessBooking(booking, req.user)) {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only customers can cancel bookings here' });
    }
    if (!['Pending', 'Confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Only active bookings can be cancelled' });
    }
    booking.status = 'Cancelled';
    await booking.save();
    const vehicle = await Vehicle.findByPk(booking.vehicleId);
    if (vehicle) {
      vehicle.status = 'Available';
      await vehicle.save();
    }
    res.json({ id: booking.bookingId, status: 'Cancelled' });
  })
);

router.post(
  '/:id/pay',
  protect,
  authorize('user'),
  asyncHandler(async (req, res) => {
    const booking = await findBooking(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customerId !== req.user.id) return res.status(403).json({ message: 'Not your booking' });
    if (booking.status === 'Cancelled') return res.status(400).json({ message: 'Cancelled bookings cannot be paid' });
    if (booking.paymentStatus === 'Paid') return res.json(toClient(booking));
    if (!razorpayConfigured) {
      return res.status(503).json({ message: 'Razorpay is not configured on the server' });
    }
    const vendor = await User.findByPk(booking.vendorId);
    if (!vendor?.razorpayAccountId) {
      return res.status(409).json({ message: 'This vendor is not configured to receive Razorpay payments' });
    }

    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      const order = await razorpay.orders.create({
        amount: Math.round(Number(booking.amount) * 100),
        currency: 'INR',
        receipt: `booking_${booking.bookingId}`,
        payment_capture: 1,
        notes: { vehicleId: String(booking.vehicleId), vendorId: String(booking.vendorId) },
      });
      booking.razorpayOrderId = order.id;
      await booking.save();
      return res.json({
        paymentRequired: true,
        booking: toClient(booking),
        paymentOrder: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          keyId: process.env.RAZORPAY_KEY_ID,
        },
      });
    }

    if (razorpayOrderId !== booking.razorpayOrderId) {
      return res.status(400).json({ message: 'Payment order does not match this booking' });
    }
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ message: 'Invalid Razorpay payment signature' });
    }

    let payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (payment.order_id !== booking.razorpayOrderId) {
      return res.status(400).json({ message: 'Payment is not linked to this booking order' });
    }
    if (payment.status === 'authorized') {
      payment = await razorpay.payments.capture(
        razorpayPaymentId,
        Math.round(Number(booking.amount) * 100),
        'INR'
      );
    }
    if (payment.status !== 'captured') {
      return res.status(400).json({ message: 'Razorpay payment was not captured' });
    }

    const transfer = await razorpay.payments.transfer(razorpayPaymentId, {
      transfers: [{
        account: vendor.razorpayAccountId,
        amount: Math.round(Number(booking.amount) * 100),
        currency: 'INR',
        notes: { bookingId: booking.bookingId, vendorId: String(vendor.id) },
        linked_account_notes: ['bookingId', 'vendorId'],
        on_hold: false,
      }],
    });
    const transferId = transfer.items?.[0]?.id || '';
    booking.paymentStatus = 'Paid';
    booking.paymentMethod = `Razorpay (${payment.method || 'online'})`;
    booking.transactionId = razorpayPaymentId;
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpaySignature = razorpaySignature;
    booking.razorpayTransferId = transferId;
    booking.status = 'Confirmed';
    await booking.save();
    res.json(toClient(booking));
  })
);

router.patch(
  '/:id/feedback',
  protect,
  authorize('user'),
  asyncHandler(async (req, res) => {
    const booking = await findBooking(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.customerId !== req.user.id) return res.status(403).json({ message: 'Not your booking' });
    if (booking.status !== 'Completed') return res.status(400).json({ message: 'Feedback is available after completion' });

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || '').trim();
    if (!Number.isInteger(rating) || rating < 1 || rating > 5 || !comment) {
      return res.status(400).json({ message: 'Please provide a rating from 1 to 5 and a comment' });
    }
    booking.feedbackRating = rating;
    booking.feedbackComment = comment;
    booking.feedbackAt = new Date();
    await booking.save();
    res.json(toClient(booking));
  })
);

router.get(
  '/:id/invoice',
  protect,
  asyncHandler(async (req, res) => {
    const booking = await findBooking(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Invoice not found' });
    if (!canAccessBooking(booking, req.user)) return res.status(403).json({ message: 'Not your booking' });
    res.json({
      invoiceNo: `INV-2026-${String(booking.bookingId).replace(/\D/g, '').padStart(5, '0')}`,
      date: booking.bookingDate,
      customer: {
        name: booking.customerName,
        email: booking.customerEmail,
        phone: booking.customerPhone,
        address: booking.customerAddress,
      },
      vehicle: booking.vehicle?.toClient ? booking.vehicle.toClient() : booking.vehicle,
      vendor: booking.vendor,
      vehicleAmount: Number(booking.vehiclePrice),
      bookingFee: Number(booking.bookingFee),
      tax: Number(booking.tax),
      total: Number(booking.amount),
      status: booking.status,
    });
  })
);

export default router;
