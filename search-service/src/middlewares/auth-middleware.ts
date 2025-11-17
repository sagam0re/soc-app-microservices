import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const idHeader = req.headers["x-user-id"];
  const id = Array.isArray(idHeader) ? idHeader[0] : idHeader;

  if (!id) {
    logger.warn("Access attempted without user ID");
    res.status(401).json({
      success: false,
      message: "Authentication required! Please login to continue",
    });
    return;
  }

  req.user = { id };
  next();
};

export default authenticate;
