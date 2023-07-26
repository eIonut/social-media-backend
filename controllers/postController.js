const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");
const Comment = require("../models/Comment");

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

  // Find all comments associated with the post
  const comments = await Comment.find({ post: postId });

  // Delete the comments first
  for (const comment of comments) {
    await comment.deleteOne();
  }

  // Delete the post after its comments have been deleted
  await post.deleteOne();

  return res
    .status(StatusCodes.OK)
    .json({ msg: `Successfully deleted post id: ${postId}` });
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

const dislikePost = async (req, res) => {
  const { postId } = req.params;
  const { id: user } = req.user;

  const oldPost = await Post.findOne({ _id: postId, likedBy: user });

  if (!oldPost) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "You must like the post first!" });
  }

  const post = await Post.findOneAndUpdate(
    { _id: postId },
    { $inc: { likes: -1 }, $pull: { likedBy: user } },
    { new: true, runValidators: true }
  );
  return res.status(StatusCodes.OK).json({ post });
};

const createPostComment = async (req, res) => {
  const { id: user } = req.user;
  const { description } = req.body;
  const { postId } = req.params;

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

  if (!postId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Provide a post!" });
  }

  const comment = { ...req.body, post: postId };
  comment.user = user;

  const savedComment = await Comment.create(comment);

  await Post.findOneAndUpdate(
    { _id: postId },
    { $push: { comments: savedComment._id } },
    {
      new: true,
      runValidators: true,
    }
  );

  return res.status(StatusCodes.CREATED).json({ comment: savedComment });
};

module.exports = {
  createPost,
  getPosts,
  getOnePost,
  deletePost,
  updatePost,
  getUserPosts,
  likePost,
  createPostComment,
  dislikePost,
};
