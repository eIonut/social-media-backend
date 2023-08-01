const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const getCurrentUser = async (req, res) => {
  const currentUser = req.user;
  const user = await User.findOne({ _id: currentUser.id }, "-password");
  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "There is no user" });
  }
  return res.status(StatusCodes.OK).json({ user });
};

const getAllUsers = async (req, res) => {
  const { id: user } = req.user;

  const users = await User.find({ _id: { $ne: user } }, "-password");
  console.log(users);
  if (!users) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "There is no users" });
  }
  return res.status(StatusCodes.OK).json({ users });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide both values" });
  }

  const user = await User.findOne({ _id: req.user.id });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid Credentials" });
  }

  user.password = newPassword;

  await user.save();
  return res.status(StatusCodes.OK).json({ msg: "Password updated!" });
};

const getOneUser = async (req, res) => {
  const { userId } = req.params;
  const user = await User.findOne(
    { _id: userId },
    { password: 0, notifications: 0, email: 0 }
  );
  if (!user) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: "User not found" });
  }

  return res.status(StatusCodes.OK).json({ user });
};

const addFriend = async (req, res) => {
  const { id: user } = req.user;
  const { friendId } = req.params;

  if (friendId === user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Cannot add yourself to friends" });
  }

  if (!friendId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Friend does not exist" });
  }

  const friend = await User.findOne({ _id: friendId });
  const currentUser = await User.findOne({ _id: user });

  for (let userFriend of currentUser.friends) {
    if (userFriend._id.toString() === friendId) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: `User ${userFriend.name} is already your friend` });
    }
  }

  await User.findOneAndUpdate(
    { _id: user },
    { $push: { friends: { _id: friendId, name: friend.name } } },
    { new: true, runValidators: true }
  );

  return res.status(StatusCodes.OK).json({ msg: "Friend added successfully" });
};

const removeFriend = async (req, res) => {
  const { id: user } = req.user;
  const { friendId } = req.params;

  if (!friendId) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Friend does not exist" });
  }

  const friend = await User.findOne({ _id: friendId });
  const currentUser = await User.findOne({ _id: user });

  let isFriend = false;
  for (let userFriend of currentUser.friends) {
    if (userFriend._id.toString() === friend._id.toString()) {
      isFriend = true;
    }
  }

  if (!isFriend) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: `User ${friend.name} is not your friend` });
  }

  await User.findOneAndUpdate(
    { _id: user },
    { $pull: { friends: { _id: friendId } } },
    { new: true, runValidators: true }
  );

  return res
    .status(StatusCodes.OK)
    .json({ msg: "Friend removed successfully" });
};

const getAllFriends = async (req, res) => {
  const { id: user } = req.user;
  const currentUser = await User.findOne({ _id: user });
  const friends = currentUser.friends;
  return res.status(StatusCodes.OK).json({ friends, count: friends.length });
};

module.exports = {
  getCurrentUser,
  updateUserPassword,
  getOneUser,
  getAllFriends,
  addFriend,
  removeFriend,
  getAllUsers,
};
