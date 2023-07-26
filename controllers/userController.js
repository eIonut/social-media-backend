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
module.exports = { getCurrentUser, updateUserPassword, getOneUser };
