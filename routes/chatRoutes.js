const express = require("express");
const router = express.Router();

const { getChatHistory } = require("../controllers/chatController");

const authMiddleware = require("../middleware/auth");

router.route("/chatHistory/:recipientId").get(authMiddleware, getChatHistory);

module.exports = router;
