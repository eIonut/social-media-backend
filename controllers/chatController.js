const Message = require("../models/Message");
const { StatusCodes } = require("http-status-codes");
const getChatHistory = async (req, res) => {
  const { recipientId } = req.params;
  const { id: senderId } = req.user;

  const chatHistory = await Message.find({
    $or: [
      { sender: senderId, recipient: recipientId },
      { sender: recipientId, recipient: senderId },
    ],
  }).sort({ timestamp: 1 });

  res.status(StatusCodes.OK).json({ chatHistory });
};

const createMessage = async (req, res) => {
  console.log(req.body);
  const message = await Message.create(req.body);
  return res.status(StatusCodes.CREATED).json({ message });
};

module.exports = { createMessage, getChatHistory };
