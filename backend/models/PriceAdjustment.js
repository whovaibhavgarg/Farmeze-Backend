import mongoose from 'mongoose';

const priceAdjustmentSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0
  },
  newPrice: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('PriceAdjustment', priceAdjustmentSchema);