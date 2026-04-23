import express from 'express';

import getModel from '../models/genericModel.js';
import {
  create,
  getAll,
  getOne,
  update,
  remove
} from '../controllers/genericController.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

const userSchema = {
  username: String,
  email: String
};

const User = getModel('User', userSchema);

router.post('/users', create(User));
router.get('/users', authMiddleware, getAll(User));

export default router;