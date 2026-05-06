import express from 'express';
import PriceAdjustment from '../models/PriceAdjustment.js';

const router = express.Router();

// GET /api/price-adjustments
router.get('/', async (req, res) => {
  try {
    const adjustments = await PriceAdjustment.find().sort({ createdAt: -1 });
    res.json(adjustments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/price-adjustments
router.post('/', async (req, res) => {
  try {
    const adjustment = new PriceAdjustment(req.body);
    const savedAdjustment = await adjustment.save();
    res.status(201).json(savedAdjustment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;