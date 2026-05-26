import express from 'express';
import { upload, getAll, remove, serveFile } from '../controllers/mediaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, tenantMiddleware, upload);
router.get('/', authMiddleware, tenantMiddleware, getAll);
router.delete('/:id', authMiddleware, tenantMiddleware, remove);
router.get('/:fileName', authMiddleware, tenantMiddleware, serveFile);

export default router;