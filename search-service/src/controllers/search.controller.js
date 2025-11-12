const Search = require("../models/Search");
const logger = require("../utils/logger");

const searchPostController = async (req, res) => {
  logger.info("Search Post Controller Invoked");
  try {
    const { query } = req.query;

    const results = await Search.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(20);

    res.status(200).json({ results });
  } catch (error) {
    logger.error(`Search Post Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { searchPostController };
