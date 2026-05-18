import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
    },
    role: {
      type: String,
      enum: ['user', 'subadmin', 'admin'],
      default: 'user'
    },
    permissions: {
      contentTypes: { type: Boolean, default: true },
      contentEntries: { type: Boolean, default: true },
      apiKeys: { type: Boolean, default: true },
      analytics: { type: Boolean, default: true },
      auditLogs: { type: Boolean, default: false },
      webhooks: { type: Boolean, default: false },
      mediaLibrary: { type: Boolean, default: true },
      userManagement: { type: Boolean, default: false },
      systemSettings: { type: Boolean, default: false }
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true },
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;