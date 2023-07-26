const express = require("express");
const router = express.Router();

const {
  createComment,
  likeComment,
  getAllComments,
  getOneComment,
  deleteComment,
  updateComment,
} = require("../controllers/commentController");

const authMiddleware = require("../middleware/auth");

router
  .route("/")
  .get(authMiddleware, getAllComments)
  .post(authMiddleware, createComment);
router
  .route("/:commentId")
  .patch(authMiddleware, updateComment)
  .get(authMiddleware, getOneComment)
  .delete(authMiddleware, deleteComment);
router.route("/like/:commentId").patch(authMiddleware, likeComment);

module.exports = router;
