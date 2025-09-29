import { Router } from 'express';
import {
  addRecipe,
  getRecipes,
  getRecipeById,
  fetchFromMealDB,
  myRecipes,
  deleteRecipe,
  saveExternalRecipe,
  viewedRecipe,
  logSearch,
} from '../controllers/recipeController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', getRecipes);
router.get('/external', fetchFromMealDB);
router.get('/externalById', fetchFromMealDB); // handled by controller via id when provided
router.get('/my-recipes', authRequired, myRecipes);
router.get('/:id', getRecipeById);
router.post('/', authRequired, addRecipe);
router.post('/save', authRequired, saveExternalRecipe);
router.post('/viewed', viewedRecipe);
router.post('/search-log', logSearch);
router.delete('/:id', authRequired, deleteRecipe);

export default router;
