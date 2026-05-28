import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      index: true,
      sparse: true,
    },
    githubId: {
      type: String,
      index: true,
      sparse: true,
    },
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      default: 'member'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    activeSessions: [{
      jti: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }],
    preferences: {
      language: { type: String, default: 'en' },
      notifications: {
        email: { type: Boolean, default: true },
        webhook: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true },
);

userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
