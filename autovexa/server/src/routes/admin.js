import express from 'express';
import User from '../models/User.js';
import Vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();
router.use(protect, authorize('admin'));

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [
      totalVendors,
      activeVendors,
      totalVehicles,
      availableVehicles,
      totalCustomers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
    ] = await Promise.all([
      User.count({ where: { role: 'vendor' } }),
      User.count({ where: { role: 'vendor', vendorStatus: 'Active' } }),
      Vehicle.count(),
      Vehicle.count({ where: { status: 'Available' } }),
      User.count({ where: { role: 'user' } }),
      Booking.count(),
      Booking.count({ where: { status: 'Pending' } }),
      Booking.count({ where: { status: 'Confirmed' } }),
    ]);

    res.json({
      totalVendors,
      activeVendors,
      totalVehicles,
      availableVehicles,
      totalCustomers,
      totalBookings,
      pendingBookings,
      confirmedBookings,
    });
  })
);

router.get(
  '/vendors',
  asyncHandler(async (_req, res) => {
    const vendors = await User.findAll({
      where: { role: 'vendor' },
      order: [['createdAt', 'DESC']],
    });
    const withCounts = await Promise.all(
      vendors.map(async (v) => {
        const totalVehicles = await Vehicle.count({ where: { vendorId: v.id } });
        return {
          ...v.toSafeJSON(),
          totalVehicles,
          status: v.vendorStatus || v.status,
        };
      })
    );
    res.json(withCounts);
  })
);

router.post(
  '/vendors',
  asyncHandler(async (req, res) => {
    const { name, email, phone, businessName, address, gstNumber, password } = req.body;
    const exists = await User.findOne({ where: { email: email?.toLowerCase() } });
    if (exists) return res.status(400).json({ message: 'Email already exists' });

    const plainPassword = password || 'vendor123';
    const vendor = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: plainPassword,
      role: 'vendor',
      businessName,
      address,
      gstNumber,
      vendorStatus: 'Active',
    });
    // Return credentials once so admin can share with the vendor
    res.status(201).json({
      ...vendor.toSafeJSON(),
      loginEmail: email.toLowerCase(),
      loginPassword: plainPassword,
      message: 'Vendor created. Share the email and password with the vendor.',
    });
  })
);

router.patch(
  '/vendors/:id/approve',
  asyncHandler(async (req, res) => {
    const vendor = await User.findOne({ where: { id: req.params.id, role: 'vendor' } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.vendorStatus = 'Active';
    await vendor.save();
    res.json(vendor.toSafeJSON());
  })
);

router.patch(
  '/vendors/:id/disable',
  asyncHandler(async (req, res) => {
    const vendor = await User.findOne({ where: { id: req.params.id, role: 'vendor' } });
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    vendor.vendorStatus = 'Disabled';
    vendor.status = 'Disabled';
    await vendor.save();
    res.json(vendor.toSafeJSON());
  })
);

router.delete(
  '/vendors/:id',
  asyncHandler(async (req, res) => {
    await User.destroy({ where: { id: req.params.id, role: 'vendor' } });
    res.json({ message: 'Vendor removed' });
  })
);

router.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const users = await User.findAll({
      where: { role: 'user' },
      order: [['createdAt', 'DESC']],
    });
    const withBookings = await Promise.all(
      users.map(async (u) => {
        const totalBookings = await Booking.count({ where: { customerId: u.id } });
        return { ...u.toSafeJSON(), totalBookings, joinedDate: u.createdAt };
      })
    );
    res.json(withBookings);
  })
);

router.get(
  '/vehicles',
  asyncHandler(async (_req, res) => {
    const vehicles = await Vehicle.findAll({
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName', 'email'] }],
      order: [['createdAt', 'DESC']],
    });
    res.json(vehicles.map((v) => v.toClient()));
  })
);

router.get(
  '/bookings',
  asyncHandler(async (_req, res) => {
    const bookings = await Booking.findAll({
      include: [
        { model: Vehicle, as: 'vehicle' },
        { model: User, as: 'customer', attributes: ['id', 'name', 'email', 'phone'] },
        { model: User, as: 'vendor', attributes: ['id', 'name', 'businessName'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(
      bookings.map((b) => ({
        id: b.bookingId,
        vehicle: b.vehicle,
        customer: b.customer,
        vendor: b.vendor,
        bookingDate: b.bookingDate,
        amount: Number(b.amount),
        status: b.status,
      }))
    );
  })
);

export default router;
