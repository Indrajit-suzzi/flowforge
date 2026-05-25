import express from 'express';
import { create, getAll, remove, getUsage } from '../controllers/apiKeyController.js';

const router = express.Router();

router.post('/', create);
router.get('/', getAll);
router.delete('/:id', remove);
router.get('/:id/usage', getUsage);

export default router;
