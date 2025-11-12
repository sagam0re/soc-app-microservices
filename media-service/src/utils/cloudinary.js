const cloudinary = require("cloudinary").v2;
const logger = require("./logger");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
      },
      (err, result) => {
        if (err) {
          logger.error(`Cloudinary Upload Error: ${err.message}`);
          return reject(err);
        }
        resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    logger.info(`Media Deletion Success in Cloudinary: ${publicId}`);
    return result;
  } catch (err) {
    logger.error(`Cloudinary Deletion Error: ${err.message}`);
    throw err;
  }
};

module.exports = {
  uploadMediaToCloudinary,
  deleteMediaFromCloudinary,
};
