import express from 'express';

import getModel from '../models/genericModel.js';
import {
  create,
  getAll,
  getOne,
  update,
  remove
} from '../controllers/genericController.js';

const router = express.Router();

const userSchema = {
  username: String,
  email: String
};

const DynamicUser = getModel("DynamicUser", userSchema);

router.post('/users', create(DynamicUser));
router.get('/users', getAll(DynamicUser));

export default router;