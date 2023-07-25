const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");

const createPost = async (req, res) => {
  // TODO, user-ul trebuie luat din request

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

  const post = await Post.create(req.body);
  return res.status(StatusCodes.CREATED).json({ post });
};

const getPosts = async (req, res) => {
  const posts = await Post.find({});
  return res.status(StatusCodes.OK).json({ posts, count: posts.length });
};

const getOnePost = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `No post with id ${postId} ` });
  }
  return res.status(StatusCodes.OK).json({ post });
};

const deletePost = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `No post with id ${postId} ` });
  }

  await post.deleteOne();

  return res
    .status(StatusCodes.OK)
    .json({ msg: `Succesfully deleted post id: ${postId}` });
};

const updatePost = async (req, res) => {
  const { postId } = req.params;
  const post = await Post.findOneAndUpdate({ _id: postId }, req.body, {
    new: true,
    runValidators: true,
  });
  if (!post) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `No post with id ${postId} ` });
  }
  return res.status(StatusCodes.OK).json({ post });
};

module.exports = {
  createPost,
  getPosts,
  getOnePost,
  deletePost,
  updatePost,
};
