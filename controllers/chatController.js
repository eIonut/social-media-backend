const Message = require("../models/Message");
const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const getChatHistory = async (req, res) => {
  const { recipientId } = req.params;
  const { id: senderId } = req.user;

  const recipient = await User.findOne({ _id: recipientId });
  const sender = await User.findOne({ _id: senderId });

  const chatHistory = await Message.find({
    $or: [
      { sender: senderId, recipient: recipientId },
      { sender: recipientId, recipient: senderId },
    ],
  }).sort({ timestamp: 1 });

  res
    .status(StatusCodes.OK)
    .json({ chatHistory, recipient: recipient.name, sender: sender.name });
};

const createMessage = async (req, res) => {
  const { recipient: recipientId, sender: senderId } = req.body;
  const recipient = await User.findOne({ _id: recipientId });
  const sender = await User.findOne({ _id: senderId });

  const newMessage = {
    ...req.body,
    recipientName: recipient.name,
    senderName: sender.name,
  };
  console.log(newMessage);
  const savedMessage = await Message.create(newMessage);
  return res.status(StatusCodes.CREATED).json({ savedMessage });
};

module.exports = { createMessage, getChatHistory };
