const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      required: [true, "Please provide a message"],
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    post: { type: mongoose.Types.ObjectId, ref: "Post" },
    postDescription: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);
