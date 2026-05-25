import dotenv from "dotenv";

dotenv.config();

const { default: app } = await import("./src/app.js");
const { default: connectDB } = await import("./src/config/db.js");
const { startScheduler } = await import("./src/services/scheduler.js");

const PORT = process.env.PORT || 3000;

await connectDB();

startScheduler();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
