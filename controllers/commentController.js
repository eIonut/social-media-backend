const Comment = require("../models/Comment");
const { StatusCodes } = require("http-status-codes");

const createComment = async (req, res) => {
  const { description, user } = req.body;
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

  const comment = await Comment.create(req.body);
  return res.status(StatusCodes.CREATED).json({ comment });
};

const likeComment = async (req, res) => {
  const { commentId } = req.params;
  const { user } = req.body;

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

const getAllComments = async (req, res) => {
  const comments = await Comment.find({});
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
  const { commentId } = req.params;
  const comment = await Comment.findOne({ _id: commentId });
  if (!comment) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `Comment with id ${commentId} not found` });
  }

  await comment.deleteOne();
  return res
    .status(StatusCodes.OK)
    .json({ msg: `Succesfully deleted comment id: ${commentId}` });
};

const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findOneAndUpdate({ _id: commentId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!comment) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `Comment with id ${commentId} not found` });
  }
  return res.status(StatusCodes.OK).json({ comment });
};

module.exports = {
  createComment,
  likeComment,
  getAllComments,
  getOneComment,
  deleteComment,
  updateComment,
};
