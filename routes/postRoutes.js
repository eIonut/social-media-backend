const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  getOnePost,
  deletePost,
  updatePost,
  getUserPosts,
} = require("../controllers/postController");

router.route("/").post(createPost).get(getPosts);
router.route("/userPosts/:userId").get(getUserPosts);
router.route("/:postId").get(getOnePost).delete(deletePost).patch(updatePost);

module.exports = router;
