const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");

const getCurrentUser = async (req, res) => {
  const currentUser = req.user;
  const user = await User.findOne({ _id: currentUser.id }, "-password");
  if (!user) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: "There is no user" });
  }
  res.status(StatusCodes.OK).json({ user });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Please provide both values" });
  }

  const user = await User.findOne({ _id: req.user.id });

  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    res.status(StatusCodes.BAD_REQUEST).json({ msg: "Invalid Credentials" });
  }

  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Password updated!" });
};

module.exports = { getCurrentUser, updateUserPassword };
