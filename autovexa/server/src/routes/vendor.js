import express from 'express';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
router.use(protect, authorize('vendor'));

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    const [
      totalVehicles,
      availableVehicles,
      bookedVehicles,
      totalBookings,
      pendingBookings,
      confirmedBookings,
    ] = await Promise.all([
      Vehicle.count({ where: { vendorId } }),
      Vehicle.count({ where: { vendorId, status: 'Available' } }),
      Vehicle.count({ where: { vendorId, status: 'Booked' } }),
      Booking.count({ where: { vendorId } }),
      Booking.count({ where: { vendorId, status: 'Pending' } }),
      Booking.count({ where: { vendorId, status: 'Confirmed' } }),
    ]);
    res.json({
      totalVehicles,
      availableVehicles,
      bookedVehicles,
      totalBookings,
      pendingBookings,
      confirmedBookings,
    });
  })
);

router.get(
  '/vehicles',
  asyncHandler(async (req, res) => {
    const vehicles = await Vehicle.findAll({
      where: { vendorId: req.user.id },
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(vehicles.map((v) => v.toClient()));
  })
);

router.get(
  '/bookings',
  asyncHandler(async (req, res) => {
    const bookings = await Booking.findAll({
      where: { vendorId: req.user.id },
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(bookings);
  })
);

router.get(
  '/profile',
  asyncHandler(async (req, res) => {
    res.json(req.user.toSafeJSON());
  })
);

router.put(
  '/profile',
  asyncHandler(async (req, res) => {
    const { name, phone, businessName, address } = req.body;
    if (name) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (businessName !== undefined) req.user.businessName = businessName;
    if (address !== undefined) req.user.address = address;
    await req.user.save();
    res.json(req.user.toSafeJSON());
  })
);

export default router;
