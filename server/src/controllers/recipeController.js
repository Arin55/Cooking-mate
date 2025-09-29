import axios from 'axios';
import Recipe from '../models/Recipe.js';
import RecipeView from '../models/RecipeView.js';
import RecipeSearch from '../models/RecipeSearch.js';

export const addRecipe = async (req, res) => {
  try {
    const { title, image, ingredients, steps, calories } = req.body;
    const recipe = await Recipe.create({ title, image, ingredients, steps, calories, createdBy: req.user?.id });
    res.status(201).json(recipe);
  } catch (e) {
    res.status(500).json({ message: 'Failed to add recipe', error: e.message });
  }
};

// Current user's recipes
export const myRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, recipes });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load recipes', error: e.message });
  }
};

// Save an external recipe into our DB
export const saveExternalRecipe = async (req, res) => {
  try {
    const { title, image, ingredients = [], instructions = [], calories = 0, description = '' } = req.body || {};
    if (!title) return res.status(400).json({ success: false, message: 'Title required' });
    const recipe = await Recipe.create({
      title,
      image,
      ingredients,
      steps: instructions,
      calories,
      createdBy: req.user?.id,
      description,
    });
    res.status(201).json({ success: true, recipe });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to save recipe', error: e.message });
  }
};

// Delete a recipe owned by current user
export const deleteRecipe = async (req, res) => {
  try {
    const r = await Recipe.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!r) return res.status(404).json({ success: false, message: 'Recipe not found' });
    await r.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete', error: e.message });
  }
};

// Log that a recipe was viewed (MealDB id)
export const viewedRecipe = async (req, res) => {
  try {
    const { username, recipeId, recipeName } = req.body || {};
    await RecipeView.create({
      username,
      userId: req.user?.id || undefined,
      recipeId,
      recipeName,
    });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to record view', error: e.message });
  }
};

export const getRecipes = async (req, res) => {
  try {
    const { q, maxCalories, ingredient } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (maxCalories) filter.calories = { $lte: Number(maxCalories) };
    if (ingredient) filter.ingredients = { $elemMatch: { $regex: ingredient, $options: 'i' } };
    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get recipes', error: e.message });
  }
};

export const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Not found' });
    res.json(recipe);
  } catch (e) {
    res.status(500).json({ message: 'Failed to get recipe', error: e.message });
  }
};

export const fetchFromMealDB = async (req, res) => {
  try {
    const { q, id } = req.query;
    const base = process.env.THEMEALDB_API_BASE || 'https://www.themealdb.com/api/json/v1/1';
    let url;
    if (id) url = `${base}/lookup.php?i=${encodeURIComponent(id)}`;
    else if (q) url = `${base}/search.php?s=${encodeURIComponent(q)}`;
    else url = `${base}/random.php`;
    const { data } = await axios.get(url);
    // Log searches when a query is used
    if (q) {
      try {
        await RecipeSearch.create({
          userId: req.user?.id,
          username: req.user?.username,
          query: String(q),
          resultsCount: Array.isArray(data?.meals) ? data.meals.length : 0,
        });
      } catch {}
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ message: 'Failed to fetch from TheMealDB', error: e.message });
  }
};

export const logSearch = async (req, res) => {
  try {
    const { query, resultsCount, username } = req.body || {};
    if (!query) return res.status(400).json({ success:false, message:'query is required' });
    await RecipeSearch.create({
      userId: req.user?.id,
      username: req.user?.username || username,
      query: String(query),
      resultsCount: Number(resultsCount) || 0,
    });
    res.json({ success:true });
  } catch (e) {
    res.status(500).json({ success:false, message:'Failed to log search', error:e.message });
  }
};
