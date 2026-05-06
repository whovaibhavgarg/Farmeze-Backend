import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['banner', 'story', 'article'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    trim: true
  },
  body: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  placement: {
    type: String,
    required: true,
    default: 'home'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Content', contentSchema);