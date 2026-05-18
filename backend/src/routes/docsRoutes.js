import express from 'express';
import { getDocs, getDocsMarkdown } from '../controllers/docsController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, tenantMiddleware, getDocs);
router.get('/markdown', authMiddleware, tenantMiddleware, getDocsMarkdown);

export default router;