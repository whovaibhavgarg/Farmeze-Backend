import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    default: 'kg'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'out_of_stock'],
    default: 'active'
  },
  imageUrl: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Virtual for farmer population
productSchema.virtual('farmer', {
  ref: 'Farmer',
  localField: 'farmerId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

export default mongoose.model('Product', productSchema);