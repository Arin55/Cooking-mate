import { Router } from 'express';
import { addCalorie, getCalories, deleteCalorie } from '../controllers/calorieController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, getCalories);
router.post('/', authRequired, addCalorie);
router.delete('/:id', authRequired, deleteCalorie);

export default router;
