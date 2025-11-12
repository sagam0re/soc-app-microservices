const logger = require("../utils/logger");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const Media = require("../models/Media");

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      logger.warn(
        `Validation Error: No file uploaded - ${req.method} ${req.originalUrl} - ${req.ip}`
      );
      return res.status(400).json({
        success: false,
        error: "No file uploaded",
      });
    }

    const { originalname, mimetype, buffer } = req.file;

    const uploadResult = await uploadMediaToCloudinary(req.file);

    const newMedia = new Media({
      publicId: uploadResult.public_id,
      originalName: originalname,
      mimeType: mimetype,
      url: uploadResult.secure_url,
      user: req.user.id,
    });

    await newMedia.save();

    res.status(201).json({ success: true, data: newMedia });
  } catch (err) {
    console.error("Media Upload Error:", err);
    logger.error(
      `Media Upload Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`
    );
    res.status(500).json({ success: false, error: "Media upload failed" });
  }
};

const getAllMedia = async (req, res) => {
  try {
    const mediaList = await Media.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: mediaList });
  } catch (err) {
    console.error("Get All Media Error:", err);
    logger.error(
      `Get All Media Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`
    );
    res.status(500).json({ success: false, error: "Failed to get media" });
  }
};

module.exports = {
  uploadMedia,
  getAllMedia,
};
