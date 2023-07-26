const express = require("express");
const router = express.Router();

const {
  getCurrentUser,
  updateUserPassword,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/auth");

router.route("/").get(authMiddleware, getCurrentUser);
router.route("/updatePassword").patch(authMiddleware, updateUserPassword);

module.exports = router;
