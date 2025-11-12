const express = require("express");
const multer = require("multer");

const mediaController = require("../controllers/media.controller");
const authenticate = require("../middlewares/auth-middleware");
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 10MB limit

const router = express.Router();

router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  mediaController.uploadMedia
);

router.get("/", authenticate, mediaController.getAllMedia);

module.exports = router;
