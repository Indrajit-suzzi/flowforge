import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const { validateEnv } = await import("./src/utils/envValidation.js");
validateEnv();

const { default: app } = await import("./src/app.js");
const { default: connectDB } = await import("./src/config/db.js");
const { startScheduler, stopScheduler } = await import("./src/services/scheduler.js");
const logger = (await import("./src/utils/logger.js")).default;

const PORT = process.env.PORT || 3000;

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled rejection');
});

process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception');
  process.exit(1);
});

await connectDB();

startScheduler();

const server = app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, 'Server started');
});

const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutdown signal received');
  stopScheduler();
  server.close(async () => {
    await mongoose.connection.close();
    logger.info('Server shut down gracefully');
    process.exit(0);
  });
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
