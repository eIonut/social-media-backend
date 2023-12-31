const Comment = require("../models/Comment");
const { StatusCodes } = require("http-status-codes");
const Post = require("../models/Post");

const createComment = async (req, res) => {
  const { id: user } = req.user;
  const { description } = req.body;
  if (!description) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No description provided!" });
  }

  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No user provided!" });
  }

  const comment = { ...req.body };
  comment.user = user;
  const savedComment = await Comment.create(comment);

  return res.status(StatusCodes.CREATED).json({ comment: savedComment });
};

const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const { id: user } = req.user;

  const oldComment = await Comment.findOne({ _id: commentId, likedBy: user });

  if (oldComment) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "User already liked the comment" });
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId },
    { $inc: { likes: 1 }, $push: { likedBy: user } },
    { new: true, runValidators: true }
  );
  return res.status(StatusCodes.OK).json({ comment });
};

const dislikeComment = async (req, res) => {
  const { commentId } = req.params;
  const { id: user } = req.user;

  const oldComment = await Comment.findOne({ _id: commentId, likedBy: user });

  if (!oldComment) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "You must like the comment first!" });
  }

  if (oldComment) {
    const comment = await Comment.findOneAndUpdate(
      { _id: commentId },
      { $inc: { likes: -1 }, $pull: { likedBy: user } },
      { new: true, runValidators: true }
    );
    return res.status(StatusCodes.OK).json({ comment });
  }
};

const getAllComments = async (req, res) => {
  const { postId } = req.params;
  const comments = await Comment.find({ post: postId });
  return res.status(StatusCodes.OK).json({ comments, count: comments.length });
};

const getOneComment = async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findOne({ _id: commentId });
  if (!comment) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `Comment with id ${commentId} not found` });
  }

  return res.status(StatusCodes.OK).json({ comment });
};

const deleteComment = async (req, res) => {
  const { id: user } = req.user;
  const { commentId } = req.params;
  const comment = await Comment.findOne({ _id: commentId });

  if (!comment) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `Comment with id ${commentId} not found` });
  }

  // Check if the user is allowed to delete the comment
  if (comment.user.toString() !== user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: `Not allowed to delete this comment` });
  }

  // Get the postId from the comment
  const postId = comment.post;

  // Remove the comment's reference from the post's comments array
  await Post.findOneAndUpdate(
    { _id: postId },
    { $pull: { comments: commentId } }
  );

  await comment.deleteOne();
  return res
    .status(StatusCodes.OK)
    .json({ msg: `Successfully deleted comment id: ${commentId}` });
};

const updateComment = async (req, res) => {
  const { id: user } = req.user;
  const { commentId } = req.params;
  const { description } = req.body;
  const comment = await Comment.findOne({ _id: commentId });

  if (!comment) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `Comment with id ${commentId} not found` });
  }

  if (comment.user.toString() !== user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: `Not allowed to update this comment` });
  }

  comment.description = description;
  await comment.save();
  return res.status(StatusCodes.OK).json({ comment });
};

module.exports = {
  createComment,
  likeComment,
  dislikeComment,
  getAllComments,
  getOneComment,
  deleteComment,
  updateComment,
};
