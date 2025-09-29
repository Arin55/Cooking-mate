import mongoose from 'mongoose';

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    ingredients: [{ type: String }],
    steps: [{ type: String }],
    calories: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Recipe', recipeSchema);
