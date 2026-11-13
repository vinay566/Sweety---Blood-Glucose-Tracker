import { Router } from 'express';
import { getReadings, getReadingById, createReading, updateReading, deleteReading } from '../controllers/readingController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getReadings);
router.get('/:id', getReadingById);
router.post('/', createReading);
router.put('/:id', updateReading);
router.delete('/:id', deleteReading);

export default router;
