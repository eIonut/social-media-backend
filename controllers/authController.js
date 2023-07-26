const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { email, name, password } = req.body;
  console.log(req.body);
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Email already exists." });
  }
  console.log(req.body);

  const user = await User.create({ email, name, password });
  return res.status(StatusCodes.CREATED).json({ user });
};

const login = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid email or password" });
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Invalid email or password" });
  }

  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: "Provide email and password" });
  }

  const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  return res.status(StatusCodes.OK).json({ msg: "User logged in", token });
};

const logout = (req, res) => {
  return res.status(StatusCodes.OK).json({ msg: "User logged out." });
};

module.exports = { register, login, logout };
