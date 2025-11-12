const express = require("express");
const { searchPostController } = require("../controllers/search.controller");
const authenticate = require("../../../media-service/src/middlewares/auth-middleware");

const router = express.Router();

// Route to handle search requests
router.get("/posts", authenticate, searchPostController);

module.exports = router;
