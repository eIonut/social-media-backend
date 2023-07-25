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

const getOnePost = async (req, res) => {};

const deletePost = async (req, res) => {};

const updatePost = async (req, res) => {};

module.exports = {
  createPost,
  getPosts,
};
