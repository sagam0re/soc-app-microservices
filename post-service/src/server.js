require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const postRoutes = require("./routes/post.routes");
const logger = require("./utils/logger");
const cors = require("cors");
const helmet = require("helmet");
const errorHandler = require("./middlewares/errorHandler");
const Redis = require("ioredis");
const { connectRabbitMQ } = require("./utils/rabbitmq");

const app = express();
const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;

mongoose
  .connect(DB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error(`MongoDB Connection Error: ${err.message}`));

const redisClient = new Redis(process.env.REDIS_URL);

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received: ${req.method} to ${req.url}`);
  logger.info(`Body: ${JSON.stringify(req.body)}`);
  next();
});

app.use(
  "/api/posts",
  (req, res, next) => {
    req.redisClient = redisClient;
    next();
  },
  postRoutes
);

app.use(errorHandler);

(async () => {
  try {
    await connectRabbitMQ();
    app.listen(PORT, () => {
      logger.info(`Post Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Error starting server: ", error);
    process.exit(1);
  }
})();

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});
