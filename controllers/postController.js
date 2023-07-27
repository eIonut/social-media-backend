const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const User = require("../models/User");
const path = require("path");

const createPost = async (req, res) => {
  if (!req.files) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "No file uploaded" });
  }

  const postImage = req.files.image;

  if (!postImage.mimetype.startsWith("image")) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "Upload an image" });
  }

  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${postImage.name}`
  );
  await postImage.mv(imagePath);

  const { id: user } = req.user;
  const { description } = req.body;
  const savedUser = await User.findOne({ _id: user });
  const users = await User.find({ _id: { $ne: user } });

  if (!description) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No description provided!" });
  }

  const post = { ...req.body, image: `/uploads/${postImage.name}` };
  post.user = user;
  const savedPost = await Post.create(post);

  for (let user of users) {
    const message = `User ${savedUser.name} created a new post`;

    const notification = {
      user: user._id,
      post: savedPost._id,
      postDescription: savedPost.description,
      message,
    };
    const savedNotification = await Notification.create(notification);

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $push: {
          notifications: { ...notification, _id: savedNotification._id },
        },
      },
      { new: true, runValidators: true }
    );
  }

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
  const users = await User.find({});

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

  const comments = await Comment.find({ post: postId });

  for (const comment of comments) {
    await comment.deleteOne();
  }

  const notifications = await Notification.find({ post: postId });

  for (const notification of notifications) {
    await notification.deleteOne();
  }

  for (let user of users) {
    for (let notification of user.notifications) {
      if (notification.post.toString() === postId) {
        await User.findOneAndUpdate(
          { _id: user },
          { $pull: { notifications: notification } },
          { new: true, runValidators: true }
        );
      }
    }
  }

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

  if (req.files) {
    const postImage = req.files.image;

    if (!postImage.mimetype.startsWith("image")) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "Upload an image" });
    }

    const imagePath = path.join(
      __dirname,
      "../public/uploads/" + `${postImage.name}`
    );
    await postImage.mv(imagePath);
    post.image = `/uploads/${postImage.name}`;
  }

  if (description) {
    post.description = description;
  }

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

  const savedUser = await User.findOne({ _id: user });

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

  if (post.user.toString() === user) {
    const message = `User ${savedUser.name} liked the post`;

    const notification = {
      user,
      post: postId,
      postDescription: post.description,
      message,
    };
    await Notification.create(notification);
  }

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
