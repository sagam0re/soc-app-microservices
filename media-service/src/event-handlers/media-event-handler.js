const logger = require("../utils/logger");
const Media = require("../models/Media");
const { deleteMediaFromCloudinary } = require("../utils/cloudinary");

const handlePostDeleted = async (event) => {
  logger.info("Post deleted event handled in media service");
  const { postId, mediaIds } = event;
  // Logic to handle media deletion based on mediaIds
  // For example, remove media files from Cloudinary or local storage

  try {
    // Simulate media deletion logic
    const mediaToDelete = await Media.find({ _id: { $in: mediaIds } });

    for (const media of mediaToDelete) {
      // Here you would add the logic to delete the media from storage
      await deleteMediaFromCloudinary(media.publicId);
      await Media.findByIdAndDelete(media._id);
      logger.info(`Deleted media with ID: ${media._id} from postId: ${postId}`);
    }

    logger.info(`All media for postId: ${postId} have been deleted`);
  } catch (error) {
    logger.error(`Error deleting media for postId: ${postId}`, error);
  }
};

module.exports = {
  handlePostDeleted,
};
