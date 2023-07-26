const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  getOnePost,
  deletePost,
  updatePost,
  getUserPosts,
  likePost,
} = require("../controllers/postController");

const authMiddleware = require("../middleware/auth");

router
  .route("/")
  .post(authMiddleware, createPost)
  .get(authMiddleware, getPosts);
router.route("/userPosts").get(authMiddleware, getUserPosts);
router.route("/like/:postId").patch(authMiddleware, likePost);
router
  .route("/:postId")
  .get(authMiddleware, getOnePost)
  .delete(authMiddleware, deletePost)
  .patch(authMiddleware, updatePost);

module.exports = router;
