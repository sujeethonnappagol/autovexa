import express from 'express';
import { Op } from 'sequelize';
import Booking from '../models/Booking.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

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
    const { vehicleId, bookingDate, vehiclePrice, bookingFee, tax, name, email, phone, address } =
      req.body;

    const vehicle = await Vehicle.findByPk(vehicleId || req.body.vehicle);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (vehicle.status !== 'Available') {
      return res.status(400).json({ message: 'Vehicle is not available' });
    }

    const vp = Number(vehiclePrice) || 50000;
    const fee = Number(bookingFee) || 5000;
    const taxAmt = Number(tax) || 4000;

    const booking = await Booking.create({
      vehicleId: vehicle.id,
      customerId: req.user.id,
      vendorId: vehicle.vendorId,
      bookingDate: bookingDate || new Date().toISOString().slice(0, 10),
      vehiclePrice: vp,
      bookingFee: fee,
      tax: taxAmt,
      amount: vp + fee + taxAmt,
      status: 'Confirmed',
      customerName: name || req.user.name,
      customerEmail: email || req.user.email,
      customerPhone: phone || req.user.phone,
      customerAddress: address || '',
    });

    vehicle.status = 'Booked';
    await vehicle.save();

    const full = await findBooking(booking.bookingId);
    res.status(201).json(toClient(full));
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
