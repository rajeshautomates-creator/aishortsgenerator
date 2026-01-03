import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', AuthController.login);
router.get('/verify', authMiddleware, AuthController.verify);

export default router;
