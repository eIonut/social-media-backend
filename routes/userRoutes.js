const express = require("express");
const router = express.Router();

const {
  getCurrentUser,
  updateUserPassword,
  getOneUser,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/auth");

router.route("/").get(authMiddleware, getCurrentUser);
router.route("/updatePassword").patch(authMiddleware, updateUserPassword);
router.route("/user/:userId").get(authMiddleware, getOneUser);

module.exports = router;
