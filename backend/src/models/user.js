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
      default: 'member'
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true },
);

userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
