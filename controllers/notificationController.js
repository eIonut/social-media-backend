const Comment = require("../models/Comment");
const { StatusCodes } = require("http-status-codes");

const createNotification = async (req, res) => {
  const { user, message } = req.body;
  if (!message) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No message provided!" });
  }

  if (!user) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "No user provided!" });
  }
};

module.exports = { createNotification };
