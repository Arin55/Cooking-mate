import mongoose from 'mongoose';

const recipeViewSchema = new mongoose.Schema(
  {
    username: { type: String },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    recipeId: { type: String, required: true },
    recipeName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('RecipeView', recipeViewSchema);
