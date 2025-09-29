import { Router } from 'express';
import { addDiet, getDiets, deleteDiet } from '../controllers/dietController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/', authRequired, getDiets);
router.post('/', authRequired, addDiet);
router.delete('/:id', authRequired, deleteDiet);

export default router;
