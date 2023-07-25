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

router.route("/").get(getAllComments).post(createComment);
router
  .route("/:commentId")
  .patch(updateComment)
  .get(getOneComment)
  .delete(deleteComment);
router.route("/like/:commentId").patch(likeComment);

module.exports = router;
