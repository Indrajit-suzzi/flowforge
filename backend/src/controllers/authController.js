import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'member'
    });

    const { password: _password, ...safeUser } = user.toObject();

    res.status(201).json({
      message: "User registered",
      user: safeUser,
    });
  } catch (err) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({ error: isProduction ? 'Registration failed' : err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({
      id: user._id,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      jti: crypto.randomUUID(),
    }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const { password: _password, ...safeUser } = user.toObject();

    res.json({ token, user: safeUser });
  } catch (err) {
    const isProduction = process.env.NODE_ENV === 'production';
    res.status(500).json({ error: isProduction ? 'Login failed' : err.message });
  }
};
