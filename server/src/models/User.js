import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    phone: { type: String },
    profilePic: { type: String },
    savedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Recipe' }],
    workoutLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Workout' }],
    calorieLogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Calorie' }],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
