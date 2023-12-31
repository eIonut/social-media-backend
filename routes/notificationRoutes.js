const express = require("express");
const router = express.Router();

const {
  createNotification,
  deleteNotification,
  getUserNotifications,
  readNotification,
  readAllNotifications,
} = require("../controllers/notificationController");

const authMiddleware = require("../middleware/auth");

router.route("/").post(authMiddleware, createNotification);
router.route("/:notificationId").delete(authMiddleware, deleteNotification);
router.route("/:userId").get(authMiddleware, getUserNotifications);
router
  .route("/readNotification/:notificationId")
  .patch(authMiddleware, readNotification);
router.route("/readNotification").patch(authMiddleware, readAllNotifications);

module.exports = router;
