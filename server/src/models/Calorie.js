import mongoose from 'mongoose';

const calorieSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    food: { type: String, required: true },
    calories: { type: Number, required: true },
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Calorie', calorieSchema);
