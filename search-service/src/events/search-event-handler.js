const logger = require("../utils/logger");
const Search = require("../models/Search");

const handlePostCreated = async (event) => {
  logger.info("Handling post.created event");
  try {
    const newSearchPost = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt,
    });
    await newSearchPost.save();
    logger.info(`Search post created for postId: ${event.postId}`);
  } catch (error) {
    logger.error(`Error handling post.created event: ${error.message}`);
  }
};

const handlePostDeleted = async (event) => {
  logger.info("Handling post.deleted event");
  try {
    await Search.deleteOne({ postId: event.postId });
    logger.info(`Search post deleted for postId: ${event.postId}`);
  } catch (error) {
    logger.error(`Error handling post.deleted event: ${error.message}`);
  }
};

module.exports = { handlePostCreated, handlePostDeleted };
