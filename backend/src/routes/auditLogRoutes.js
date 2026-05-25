import express from 'express';
import { getAuditLogs, getAuditStats, exportAuditLogsCSV } from '../controllers/auditLogController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, tenantMiddleware, getAuditLogs);
router.get('/export/csv', authMiddleware, tenantMiddleware, exportAuditLogsCSV);
router.get('/stats', authMiddleware, tenantMiddleware, getAuditStats);

export default router;