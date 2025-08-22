import mongoose from 'mongoose';

const DonationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  images: [{ type: String }],
  category: { type: String, required: true },
  condition: { type: String },
  location: { type: String },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'reserved', 'delivered', 'removed'], default: 'available' },
  pickupMethod: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Donation', DonationSchema);
