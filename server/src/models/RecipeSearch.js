import mongoose from 'mongoose';

const recipeSearchSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    username: { type: String },
    query: { type: String, required: true },
    resultsCount: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model('RecipeSearch', recipeSearchSchema);
