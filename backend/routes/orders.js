import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

// GET /api/orders
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/orders
router.post('/', async (req, res) => {
  try {
    const { items = [], ...orderData } = req.body;
    const order = new Order({ ...orderData, items, status: 'new' });

    if (items.length > 0) {
      const productIds = items
        .map((item) => item.productId)
        .filter(Boolean);
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product;
        return map;
      }, {});

      const allAvailable = items.every((item) => {
        const product = productMap[item.productId];
        return (
          product &&
          product.status === 'active' &&
          product.quantity >= item.quantity
        );
      });

      if (allAvailable) {
        order.status = 'approved';
        await Promise.all(
          items.map(async (item) => {
            const product = productMap[item.productId];
            if (product) {
              product.quantity -= item.quantity;
              product.quantity = Math.max(product.quantity, 0);
              await product.save();
            }
          })
        );
      }
    }

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PATCH /api/orders/:id
router.patch('/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /api/orders/:id/items
router.get('/:id/items', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order.items || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;