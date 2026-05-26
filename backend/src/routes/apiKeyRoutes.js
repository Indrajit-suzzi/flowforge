import express from 'express';
import { create, getAll, remove, getUsage } from '../controllers/apiKeyController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, tenantMiddleware, roleMiddleware('apiKeys'), create);
router.get('/', authMiddleware, tenantMiddleware, roleMiddleware('apiKeys'), getAll);
router.delete('/:id', authMiddleware, tenantMiddleware, roleMiddleware('apiKeys'), remove);
router.get('/:id/usage', authMiddleware, tenantMiddleware, roleMiddleware('apiKeys'), getUsage);

export default router;
