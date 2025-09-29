import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    exercise: { type: String, required: true },
    duration: { type: Number, required: true }, // minutes
    caloriesBurned: { type: Number, required: true },
    type: { type: String },
    sets: { type: Number },
    reps: { type: Number },
    weight: { type: Number },
    distance: { type: Number },
    notes: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('Workout', workoutSchema);
