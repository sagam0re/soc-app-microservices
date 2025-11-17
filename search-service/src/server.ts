import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import cors from "cors";
import searchRoutes from "./routes/search.route";
import { connectRabbitMQ, consumeEvent } from "./utils/rabbitmq";
import errorHandler from "./middlewares/errorHandler";
import {
  handlePostCreated,
  handlePostDeleted,
} from "./events/search-event-handler";
import logger from "./utils/logger";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3004;
const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  logger.error("DB_URI environment variable is not defined");
  process.exit(1);
}

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  logger.info(`Received: ${req.method} ${req.url}`);
  if (req.body && Object.keys(req.body).length > 0) {
    logger.info(`Body: ${JSON.stringify(req.body)}`);
  }
  next();
});

app.use("/api/search", searchRoutes);

app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    await mongoose.connect(DB_URI);
    logger.info("Connected to MongoDB");

    await connectRabbitMQ();
    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);

    app.listen(PORT, () => {
      logger.info(`Search Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Startup Error: ${(error as Error).message}`);
    process.exit(1);
  }
};

void start();
