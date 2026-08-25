import express from 'express';
import { Op } from 'sequelize';
import User from '../models/User.js';
import { protect, signToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    const exists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      role: 'user',
    });

    res.status(201).json({ message: 'Registration successful. Please login.' });
  })
);

router.post(
  '/vendor/register',
  asyncHandler(async (req, res) => {
    const { ownerName, name, email, phone, businessName, address, gst, gstNumber, password } =
      req.body;
    if (!email || !password || !(ownerName || name)) {
      return res.status(400).json({ message: 'Owner name, email and password are required' });
    }
    const exists = await User.findOne({ where: { email: email.toLowerCase() } });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    await User.create({
      name: ownerName || name,
      email: email.toLowerCase(),
      phone: phone || '',
      password,
      role: 'vendor',
      businessName: businessName || '',
      address: address || '',
      gstNumber: gstNumber || gst || '',
      vendorStatus: 'Pending',
    });

    res.status(201).json({
      message: 'Vendor registration submitted. Please wait for administrator approval.',
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({ message: `Please use the ${user.role} login page` });
    }
    if (user.status === 'Disabled') {
      return res.status(403).json({ message: 'Account is disabled' });
    }
    if (user.role === 'vendor' && user.vendorStatus === 'Pending') {
      return res.status(403).json({ message: 'Your vendor account is pending approval' });
    }
    if (user.role === 'vendor' && user.vendorStatus === 'Disabled') {
      return res.status(403).json({ message: 'Your vendor account is disabled' });
    }

    const token = signToken(user);
    res.json({ user: user.toSafeJSON(), token });
  })
);

router.get(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    res.json(req.user.toSafeJSON());
  })
);

router.put(
  '/profile',
  protect,
  asyncHandler(async (req, res) => {
    const { name, phone, address, businessName } = req.body;
    if (name !== undefined) req.user.name = name;
    if (phone !== undefined) req.user.phone = phone;
    if (address !== undefined) req.user.address = address;
    if (businessName !== undefined && req.user.role === 'vendor') {
      req.user.businessName = businessName;
    }
    await req.user.save();
    res.json(req.user.toSafeJSON());
  })
);

export default router;
