import express from "express";

import getModel from "../models/genericModel.js";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/genericController.js";

const router = express.Router();

// Example
const userSchema = {
  username: String,
  email: String,
};

const User = getModel("User", userSchema);

// Routes for users
router.post("/users", create(User));
router.get("/users", getAll(User));
router.get("/users/:id", getOne(User));
router.put("/users/:id", update(User));
router.delete("/users/:id", remove(User));

export default router;
