import express from 'express';

import { completePhoneProfile, githubCallback, githubStart, googleLogin, phoneLogin, requestOTP, verifyOTP } from '../controllers/authController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import validate from '../middlewares/validateMiddleware.js';
import { completePhoneProfileSchema, googleLoginSchema, phoneLoginSchema, requestOTPSchema, verifyOTPSchema } from '../utils/validationSchemas.js';

const router = express.Router();

router.post('/google', validate(googleLoginSchema), googleLogin);
router.get('/github', githubStart);
router.get('/github/callback', githubCallback);
router.post('/otp/request', validate(requestOTPSchema), requestOTP);
router.post('/otp/verify', validate(verifyOTPSchema), verifyOTP);
router.post('/phone/login', validate(phoneLoginSchema), phoneLogin);
router.post('/phone/complete-profile', authMiddleware, validate(completePhoneProfileSchema), completePhoneProfile);

export default router;
