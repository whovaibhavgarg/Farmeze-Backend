import express from 'express';
import InventoryEntry from '../models/InventoryEntry.js';

const router = express.Router();

// GET /api/inventory-entries
router.get('/', async (req, res) => {
  try {
    const entries = await InventoryEntry.find().populate('farmer').sort({ createdAt: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/inventory-entries
router.post('/', async (req, res) => {
  try {
    const entry = new InventoryEntry(req.body);
    const savedEntry = await entry.save();
    await savedEntry.populate('farmer');
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;