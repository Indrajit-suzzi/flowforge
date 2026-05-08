import express from "express";
import cors from "cors";

import dynamicRoutes from "./routes/dynamicRoutes.js";
import authRoutes from './routes/authRoutes.js';
import authMiddleware from './middlewares/authMiddleware.js';
import tenantMiddleware from './middlewares/tenantMiddleware.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/dynamic", authMiddleware, tenantMiddleware, dynamicRoutes);
app.use('/api/auth', authRoutes);

app.get("/", (req, res) => {
  res.send("FlowForge API running 🚀");
});

export default app;
