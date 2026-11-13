import { Router } from 'express';
import { getDailyReport, getMtdReport, getMonthlyReport, getStats } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateToken);

router.get('/daily', getDailyReport);
router.get('/mtd', getMtdReport);
router.get('/month-to-date', getMtdReport); // Alias for frontend compatibility
router.get('/monthly', getMonthlyReport);
router.get('/stats', getStats);

export default router;
