import { Request, Response } from "express";
import Search from "../models/Search";
import logger from "../utils/logger";

export const searchPostController = async (
  req: Request,
  res: Response
): Promise<void> => {
  logger.info("Search Post Controller Invoked");
  const query =
    typeof req.query.query === "string" ? req.query.query.trim() : "";

  if (!query) {
    res.status(400).json({ error: "Query parameter is required" });
    return;
  }

  try {
    const results = await Search.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(20)
      .lean();

    res.status(200).json({ results });
  } catch (error) {
    logger.error(`Search Post Error: ${(error as Error).message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
