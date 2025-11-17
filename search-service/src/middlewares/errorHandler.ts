import { ErrorRequestHandler } from "express";
import logger from "../utils/logger";

const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  logger.error(
    `${err.message} - ${req.method} ${req.originalUrl} - ${req.ip ?? "unknown"}`
  );
  res
    .status(err.status ?? 500)
    .json({ error: err.message ?? "Internal Server Error" });
};

export default errorHandler;