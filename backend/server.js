import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./src/app.js");
const { default: connectDB } = await import("./src/config/db.js");
const { startScheduler } = await import("./src/services/scheduler.js");
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

app.listen(PORT, () => {
  logger.info({ port: PORT, env: process.env.NODE_ENV || 'development' }, `Server started`);
});
