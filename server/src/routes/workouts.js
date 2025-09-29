import { Router } from 'express';
import { addWorkout, getWorkouts, deleteWorkout } from '../controllers/workoutController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, getWorkouts);
router.post('/', authRequired, addWorkout);
router.delete('/:id', authRequired, deleteWorkout);

export default router;
