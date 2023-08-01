const express = require("express");
const router = express.Router();

const {
  getCurrentUser,
  updateUserPassword,
  getOneUser,
  addFriend,
  removeFriend,
  getAllFriends,
  getAllUsers,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/auth");

router.route("/").get(authMiddleware, getCurrentUser);
router.route("/updatePassword").patch(authMiddleware, updateUserPassword);
router.route("/getFriends").get(authMiddleware, getAllFriends);
router.route("/getAllUsers").get(authMiddleware, getAllUsers);

router.route("/addFriend/:friendId").patch(authMiddleware, addFriend);
router.route("/removeFriend/:friendId").patch(authMiddleware, removeFriend);
router.route("/user/:userId").get(authMiddleware, getOneUser);

module.exports = router;
