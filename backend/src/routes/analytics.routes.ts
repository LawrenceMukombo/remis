import { Router } from 'express';
import { getDashboardStats, getRevenueChart, getPropertyPerformance } from '../controllers/analytics.controller';

const router = Router();

router.get('/stats', getDashboardStats);
router.get('/revenue-chart', getRevenueChart);
router.get('/property-chart', getPropertyPerformance);

export default router;
