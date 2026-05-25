import express from 'express';
import { create, getAll, getOne, update, remove, submit, getSubmissions } from '../controllers/formController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import tenantMiddleware from '../middlewares/tenantMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

// Public submit endpoint (no auth)
router.post('/submit/:slug', submit);

// Protected routes
router.post('/', authMiddleware, tenantMiddleware, roleMiddleware('contentEntries'), create);
router.get('/', authMiddleware, tenantMiddleware, getAll);
router.get('/:id', authMiddleware, tenantMiddleware, getOne);
router.put('/:id', authMiddleware, tenantMiddleware, roleMiddleware('contentEntries'), update);
router.delete('/:id', authMiddleware, tenantMiddleware, roleMiddleware('contentEntries'), remove);
router.get('/:id/submissions', authMiddleware, tenantMiddleware, getSubmissions);

export default router;
