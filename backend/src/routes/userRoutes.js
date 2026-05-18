import express from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUser, getMe } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/me', authMiddleware, getMe);
router.get('/', authMiddleware, roleMiddleware('userManagement'), getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware('userManagement'), getUser);
router.post('/', authMiddleware, roleMiddleware('userManagement'), createUser);
router.put('/:id', authMiddleware, roleMiddleware('userManagement'), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware('userManagement'), deleteUser);

export default router;