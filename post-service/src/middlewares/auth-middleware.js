const logger = require("../utils/logger");

const authenticate = (req, res, next) => {
  const id = req.headers["x-user-id"];

  if (!id) {
    logger.warn(`Access attempted without user ID`);
    return res.status(401).json({
      success: false,
      message: "Authentication required! Please login to continue",
    });
  }

  req.user = { id };
  next();
};

module.exports = authenticate;
