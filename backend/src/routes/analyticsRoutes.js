import express from 'express';
import { getAnalytics, getTopEndpoints } from '../controllers/analyticsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, tenantMiddleware, getAnalytics);
router.get('/top-endpoints', authMiddleware, tenantMiddleware, getTopEndpoints);

export default router;