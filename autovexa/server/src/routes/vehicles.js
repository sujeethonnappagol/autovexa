import express from 'express';
import { Op } from 'sequelize';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const where = { status: { [Op.ne]: 'Disabled' } };
    if (req.query.brand) where.brand = req.query.brand;
    if (req.query.type) where.type = req.query.type;
    if (req.query.fuelType) where.fuelType = req.query.fuelType;
    if (req.query.status) where.status = req.query.status;

    const vehicles = await Vehicle.findAll({
      where,
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName', 'email', 'phone'] }],
      order: [['createdAt', 'DESC']],
    });

    res.json(vehicles.map((v) => v.toClient()));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findByPk(req.params.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName', 'email', 'phone'] }],
    });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle.toClient());
  })
);

router.post(
  '/',
  protect,
  authorize('vendor', 'admin'),
  asyncHandler(async (req, res) => {
    const vendorId =
      req.user.role === 'admin' && req.body.vendorId ? req.body.vendorId : req.user.id;
    const vehicle = await Vehicle.create({ ...req.body, vendorId });
    await vehicle.reload({
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName', 'email', 'phone'] }],
    });
    res.status(201).json(vehicle.toClient());
  })
);

router.put(
  '/:id',
  protect,
  authorize('vendor', 'admin'),
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (req.user.role === 'vendor' && vehicle.vendorId !== req.user.id) {
      return res.status(403).json({ message: 'Not your vehicle' });
    }
    await vehicle.update(req.body);
    await vehicle.reload({
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName', 'email', 'phone'] }],
    });
    res.json(vehicle.toClient());
  })
);

router.delete(
  '/:id',
  protect,
  authorize('vendor', 'admin'),
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (req.user.role === 'vendor' && vehicle.vendorId !== req.user.id) {
      return res.status(403).json({ message: 'Not your vehicle' });
    }
    await vehicle.destroy();
    res.json({ message: 'Vehicle deleted', id: Number(req.params.id) });
  })
);

router.patch(
  '/:id/availability',
  protect,
  authorize('vendor', 'admin'),
  asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findByPk(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    if (req.user.role === 'vendor' && vehicle.vendorId !== req.user.id) {
      return res.status(403).json({ message: 'Not your vehicle' });
    }
    vehicle.status = vehicle.status === 'Available' ? 'Booked' : 'Available';
    await vehicle.save();
    await vehicle.reload({
      include: [{ model: User, as: 'User', attributes: ['id', 'name', 'businessName', 'email', 'phone'] }],
    });
    res.json(vehicle.toClient());
  })
);

export default router;
