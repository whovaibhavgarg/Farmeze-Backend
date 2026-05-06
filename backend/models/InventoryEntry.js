import mongoose from 'mongoose';

const inventoryEntrySchema = new mongoose.Schema({
  product: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    required: true,
    default: 'A'
  },
  quantity: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['addition', 'subtraction'],
    required: true
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer'
  }
}, {
  timestamps: true
});

// Virtual for farmer population
inventoryEntrySchema.virtual('farmer', {
  ref: 'Farmer',
  localField: 'farmerId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
inventoryEntrySchema.set('toJSON', { virtuals: true });
inventoryEntrySchema.set('toObject', { virtuals: true });

export default mongoose.model('InventoryEntry', inventoryEntrySchema);