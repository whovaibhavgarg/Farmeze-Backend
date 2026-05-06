import express from 'express';
import Farmer from '../models/Farmer.js';

const router = express.Router();

// GET /api/farmers
router.get('/', async (req, res) => {
  try {
    const farmers = await Farmer.find();
    res.json(farmers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/farmers
router.post('/', async (req, res) => {
  try {
    const farmer = new Farmer(req.body);
    const savedFarmer = await farmer.save();
    res.status(201).json(savedFarmer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;