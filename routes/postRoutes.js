const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  getOnePost,
  deletePost,
  updatePost,
} = require("../controllers/postController");

router.route("/").post(createPost).get(getPosts);
router.route("/:postId").get(getOnePost).delete(deletePost).patch(updatePost);

module.exports = router;
