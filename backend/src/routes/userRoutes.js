import express from 'express';
import { getAllUsers, getUser, createUser, updateUser, deleteUser, getMe, updateMe, deleteMe } from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { roleMiddleware } from '../middlewares/roleMiddleware.js';
import ApiKey from '../models/apiKey.js';

const router = express.Router();

router.get('/me', authMiddleware, getMe);
router.put('/me', authMiddleware, updateMe);
router.delete('/me', authMiddleware, deleteMe);

router.post('/me/revoke-keys', authMiddleware, async (req, res) => {
    try {
        const result = await ApiKey.deleteMany({ tenantId: req.tenant || req.user.id });
        res.json({ message: `Revoked ${result.deletedCount} API key(s)` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', authMiddleware, roleMiddleware('userManagement'), getAllUsers);
router.get('/:id', authMiddleware, roleMiddleware('userManagement'), getUser);
router.post('/', authMiddleware, roleMiddleware('userManagement'), createUser);
router.put('/:id', authMiddleware, roleMiddleware('userManagement'), updateUser);
router.delete('/:id', authMiddleware, roleMiddleware('userManagement'), deleteUser);

export default router;