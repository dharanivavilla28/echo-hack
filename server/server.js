import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.config.js";
import { createServer } from 'node:http';
import { initialiseSocketServer } from './src/socket/socketServer.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const httpServer = createServer(app);
    initialiseSocketServer(httpServer);
    httpServer.listen(PORT, () => {
      console.log(`\n Server is running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(` URL: http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
