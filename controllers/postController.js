const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");

const createPost = async (req, res) => {
  // TODO, user-ul trebuie luat din request

  const { description, user } = req.body;
  if (!description) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "No description provided!" });
    throw new CustomError.BAD_REQUEST("No description Provided");
  }

  if (!user) {
    res.status(StatusCodes.BAD_REQUEST).json({ message: "No user provided!" });
    throw new CustomError.BAD_REQUEST("No user Provided");
  }

  try {
    const post = await Post.create(req.body);
    res.status(StatusCodes.CREATED).json({ post });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Something went wrong!" });
    throw new Error("Something went wrong");
  }
};

const getPosts = async (req, res) => {
  const posts = await Post.find({});
  res.status(StatusCodes.OK).json({ posts, count: posts.length });
};

const getOnePost = async (req, res) => {};

const deletePost = async (req, res) => {};

module.exports = {
  createPost,
  getPosts,
};
