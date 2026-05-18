import express from 'express';
import { create, getAll, update, remove } from '../controllers/webhookController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, tenantMiddleware, create);
router.get('/', authMiddleware, tenantMiddleware, getAll);
router.put('/:id', authMiddleware, tenantMiddleware, update);
router.delete('/:id', authMiddleware, tenantMiddleware, remove);

export default router;