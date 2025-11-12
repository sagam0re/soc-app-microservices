const express = require("express");

const {
  createPost,
  getPost,
  deletePost,
  GetAllPosts,
} = require("../controllers/post.controller");
const authenticate = require("../middlewares/auth-middleware");

const router = express.Router();

router.use(authenticate);

router.post("/create", createPost);
router.get("/", GetAllPosts);
router.get("/:id", getPost);
router.delete("/:id", deletePost);

module.exports = router;
