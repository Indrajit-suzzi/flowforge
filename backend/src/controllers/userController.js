import User from '../models/user.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const skip = (page - 1) * limit;
        const filter = { tenantId: req.tenant };
        if (req.query.role) filter.role = req.query.role;
        if (req.query.search) {
          const searchEscaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 100);
          filter.$or = [{ username: { $regex: searchEscaped, $options: 'i' } }, { email: { $regex: searchEscaped, $options: 'i' } }];
        }
        const [users, total] = await Promise.all([
            User.find(filter, { password: 0 }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            User.countDocuments(filter)
        ]);
        res.json({ data: users, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, tenantId: req.tenant }, { password: 0 });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const createUser = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            tenantId: req.tenant,
            username,
            email,
            password: hashedPassword,
            role: role || 'member'
        });

        const { password: _password, ...safeUser } = user.toObject();
        res.status(201).json(safeUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { role, isActive } = req.body;
        const updates = {};
        if (role) updates.role = role;
        if (isActive !== undefined) updates.isActive = isActive;

        const user = await User.findOneAndUpdate(
          { _id: req.params.id, tenantId: req.tenant },
          updates,
          { new: true },
        );
        if (!user) return res.status(404).json({ message: "User not found" });
        if (role || isActive === false) {
          await User.updateOne({ _id: user._id }, { $set: { activeSessions: [] } });
          user.activeSessions = [];
        }

        const { password: _password, ...safeUser } = user.toObject();
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findOneAndDelete({ _id: req.params.id, tenantId: req.tenant });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id, { password: 0 });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const updateMe = async (req, res) => {
    try {
        const allowed = ['username', 'preferences'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }
        if (req.body.email !== undefined) {
            const existing = await User.findOne({ email: req.body.email, _id: { $ne: req.user.id } });
            if (existing) {
                return res.status(409).json({ error: 'Email is already in use' });
            }
            updates.email = req.body.email;
        }
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, select: { password: 0 } });
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteMe = async (req, res) => {
    try {
        const result = await User.deleteOne({ _id: req.user.id });
        if (result.deletedCount === 0) return res.status(404).json({ message: "User not found" });

        res.json({ message: "Account deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
