import { Router } from 'express';
import { chatbotQuery } from '../controllers/chatbotController.js';

const router = Router();

router.post('/', chatbotQuery);

export default router;
