import express from 'express';

import { githubCallback, githubStart, googleLogin } from '../controllers/authController.js';
import validate from '../middlewares/validateMiddleware.js';
import { googleLoginSchema } from '../utils/validationSchemas.js';

const router = express.Router();

router.post('/google', validate(googleLoginSchema), googleLogin);
router.get('/github', githubStart);
router.get('/github/callback', githubCallback);

export default router;
