import logger from "../utils/logger";
import Search from "../models/Search";

export interface PostCreatedEvent {
  postId: string;
  userId: string;
  content: string;
  createdAt?: string | Date;
}

export interface PostDeletedEvent {
  postId: string;
}

export const handlePostCreated = async (
  event: PostCreatedEvent
): Promise<void> => {
  logger.info("Handling post.created event");
  try {
    const newSearchPost = new Search({
      postId: event.postId,
      userId: event.userId,
      content: event.content,
      createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
    });
    await newSearchPost.save();
    logger.info(`Search post created for postId: ${event.postId}`);
  } catch (error) {
    logger.error(
      `Error handling post.created event: ${(error as Error).message}`
    );
  }
};

export const handlePostDeleted = async (
  event: PostDeletedEvent
): Promise<void> => {
  logger.info("Handling post.deleted event");
  try {
    await Search.deleteOne({ postId: event.postId });
    logger.info(`Search post deleted for postId: ${event.postId}`);
  } catch (error) {
    logger.error(
      `Error handling post.deleted event: ${(error as Error).message}`
    );
  }
};
