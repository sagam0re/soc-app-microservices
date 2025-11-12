const logger = require("../utils/logger");
const { validateCreatePost } = require("../utils/validation");
const Post = require("../models/Post");
const { publishEvent } = require("../utils/rabbitmq");

const invalidateCache = async (req, input) => {
  const cachedKey = `post:${input}`;
  await req.redisClient.del(cachedKey);

  const keys = await req.redisClient.keys("posts:*");
  if (keys.length > 0) {
    await req.redisClient.del(...keys);
  }
};

const createPost = async (req, res) => {
  try {
    // Post creation logic here
    const { content, mediaIds } = req.body;

    const { error } = validateCreatePost(req.body);
    if (error) {
      logger.warn(
        `Validation Error: ${error.details[0].message} - ${req.method} ${req.originalUrl} - ${req.ip}`
      );
      return res.status(400).json({
        success: false,
        error: error.details[0].message,
      });
    }

    const newPost = new Post({ user: req.user.id, content, mediaIds });
    await newPost.save();

    await publishEvent("post.created", {
      postId: newPost._id.toString(),
      userId: req.user.id,
      content,
      createdAt: newPost.createdAt,
    });

    await invalidateCache(req, newPost._id.toString());

    res
      .status(201)
      .json({ success: true, message: "Post created successfully" });
  } catch (err) {
    console.log(err);
    logger.error(
      `Post Creation Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`
    );
    res.status(500).json({ success: false, error: "Post creation failed" });
  }
};

const GetAllPosts = async (req, res) => {
  try {
    // Post creation logic here
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const cashKey = `posts:${page}:${limit}`;

    const cachedPosts = await req.redisClient.get(cashKey);

    if (cachedPosts) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedPosts),
      });
    }

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const result = {
      posts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      totalPosts,
    };

    await req.redisClient.setex(cashKey, 300, JSON.stringify(result));

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    logger.error(
      `Get All Posts Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`
    );
    res.status(500).json({ success: false, error: "Get all posts failed" });
  }
};

const getPost = async (req, res) => {
  try {
    // Post creation logic here
    const postId = req.params.id;

    const cachedPost = await req.redisClient.get(`post:${postId}`);

    if (cachedPost) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedPost),
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    await req.redisClient.setex(`post:${postId}`, 300, JSON.stringify(post));

    res.status(200).json({ success: true, post });
  } catch (err) {
    logger.error(
      `Post Retrieval Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`
    );
    res.status(500).json({ success: false, error: "Post retrieval failed" });
  }
};

const deletePost = async (req, res) => {
  try {
    // Post creation logic here
    const postId = req.params.id;

    const deletedPost = await Post.findOneAndDelete({
      _id: postId,
      user: req.user.id,
    });

    if (!deletedPost) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    await publishEvent("post.deleted", {
      postId,
      userId: req.user.id,
      mediaIds: deletedPost.mediaIds,
    });

    await invalidateCache(req, postId);

    res
      .status(200)
      .json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    logger.error(
      `Post Deletion Error: ${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`
    );
    res.status(500).json({ success: false, error: "Post deletion failed" });
  }
};

module.exports = {
  createPost,
  getPost,
  deletePost,
  GetAllPosts,
};
