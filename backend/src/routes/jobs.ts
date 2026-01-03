import { Router } from 'express';
import { JobController } from '../controllers/jobController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.post('/', JobController.createJob);
router.get('/', JobController.getAllJobs);
router.get('/:id', JobController.getJob);
router.delete('/:id', JobController.deleteJob);
router.get('/:id/download', JobController.downloadVideo);

export default router;
