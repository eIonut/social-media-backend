const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");

const createPost = async (req, res) => {
  // TODO, user-ul trebuie luat din request
  // TODO, adaugam imagini

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

  const post = { ...req.body };
  post.user = user;
  const savedPost = await Post.create(post);
  return res.status(StatusCodes.CREATED).json({ post: savedPost });
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
  const { id: user } = req.user;
  const { postId } = req.params;
  const post = await Post.findOne({ _id: postId });
  if (!post) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `No post with id ${postId} ` });
  }

  if (post.user.toString() !== user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: `Not allowed to delete this post` });
  }

  await post.deleteOne();

  return res
    .status(StatusCodes.OK)
    .json({ msg: `Succesfully deleted post id: ${postId}` });
};

const updatePost = async (req, res) => {
  const { id: user } = req.user;
  const { postId } = req.params;
  const { description } = req.body;

  const post = await Post.findOne({ _id: postId });
  if (!post) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ msg: `No post with id ${postId} ` });
  }

  if (post.user.toString() !== user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: `Not allowed to update this post` });
  }

  post.description = description;
  await post.save();
  return res.status(StatusCodes.OK).json({ post });
};

const getUserPosts = async (req, res) => {
  const { id: userId } = req.user;
  const posts = await Post.find({ user: userId });
  if (!posts) {
    return res.status(StatusCodes.NOT_FOUND).json({ msg: "User has no posts" });
  }
  return res.status(StatusCodes.OK).json({ posts, count: posts.length });
};

const likePost = async (req, res) => {
  const { postId } = req.params;
  const { id: user } = req.user;

  const oldPost = await Post.findOne({ _id: postId, likedBy: user });

  if (oldPost) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "User already liked the post" });
  }

  const post = await Post.findOneAndUpdate(
    { _id: postId },
    { $inc: { likes: 1 }, $push: { likedBy: user } },
    { new: true, runValidators: true }
  );
  return res.status(StatusCodes.OK).json({ post });
};

module.exports = {
  createPost,
  getPosts,
  getOnePost,
  deletePost,
  updatePost,
  getUserPosts,
  likePost,
};
