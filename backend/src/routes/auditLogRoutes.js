import express from 'express';
import { getAuditLogs, getAuditStats } from '../controllers/auditLogController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, tenantMiddleware, getAuditLogs);
router.get('/stats', authMiddleware, tenantMiddleware, getAuditStats);

export default router;