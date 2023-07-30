const express = require("express");
const router = express.Router();

const {
  getChatHistory,
  createMessage,
} = require("../controllers/chatController");

const authMiddleware = require("../middleware/auth");

router.route("/addMessage").post(authMiddleware, createMessage);
router.route("/chatHistory/:recipientId").get(authMiddleware, getChatHistory);

module.exports = router;
