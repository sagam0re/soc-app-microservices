require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const helmet = require("helmet");
const mediaRoutes = require("./routes/media.route");
const logger = require("./utils/logger");
const errorHandler = require("./middlewares/errorHandler");
const { connectRabbitMQ, consumeEvent } = require("./utils/rabbitmq");
const { handlePostDeleted } = require("./event-handlers/media-event-handler");

const app = express();
const PORT = process.env.PORT || 3003;
const DB_URI = process.env.DB_URI;

mongoose
  .connect(DB_URI)
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error(`MongoDB Connection Error: ${err.message}`));

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received: ${req.method} to ${req.url}`);
  logger.info(`Body: ${JSON.stringify(req.body)}`);
  next();
});

app.use("/api/media", mediaRoutes);

app.use(errorHandler);

(async () => {
  try {
    await connectRabbitMQ();
    logger.info("RabbitMQ Consumer set up successfully");
    await consumeEvent("post.deleted", handlePostDeleted);
    app.listen(PORT, () => {
      logger.info(`Media service running on port ${PORT}`);
    });
  } catch (err) {
    logger.error(`Failed to set up RabbitMQ Consumer: ${err.message}`);
  }
})();

process.on("unhandledRejection", (reason, promise) => {
  console.log("Unhandled Rejection at:", promise, "reason:", reason);
  logger.error("Unhandled Rejection at:", promise, "reason:", reason);
});
