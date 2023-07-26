const express = require("express");
const router = express.Router();

const {
  createNotification,
  deleteNotification,
  getUserNotifications,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/auth");

router
  .route("/")
  .post(authMiddleware, createNotification)
  .get(authMiddleware, getUserNotifications);
router.route("/:notificationId").delete(authMiddleware, deleteNotification);

module.exports = router;
