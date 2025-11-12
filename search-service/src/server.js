require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const cors = require("cors");
const searchRoutes = require("./routes/search.route");
const { connectRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const errorHandler = require("./middlewares/errorHandler");
const {
  handlePostCreated,
  handlePostDeleted,
} = require("./events/search-event-handler");
const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT;
const DB_URI = process.env.DB_URI;

mongoose
  .connect(DB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error(`MongoDB Connection Error: ${err.message}`));

//const redisClient = new Redis(process.env.REDIS_URL);

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received: ${req.method} to ${req.url}`);
  logger.info(`Body: ${JSON.stringify(req.body)}`);
  next();
});

app.use("/api/search", searchRoutes);

app.use(errorHandler);

(async () => {
  try {
    await connectRabbitMQ();
    await consumeEvent("post.created", handlePostCreated);
    await consumeEvent("post.deleted", handlePostDeleted);
    app.listen(PORT, () => {
      logger.info(`Search Service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`RabbitMQ Connection Error: ${error.message}`);
    process.exit(1);
  }
})();
