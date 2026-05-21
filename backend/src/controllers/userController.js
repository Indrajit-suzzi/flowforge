import User from '../models/user.js';
import bcrypt from 'bcryptjs';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id, { password: 0 });
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

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!user) return res.status(404).json({ message: "User not found" });

        const { password: _password, ...safeUser } = user.toObject();
        res.json(safeUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
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
