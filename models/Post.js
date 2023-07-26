const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      trim: true,
      required: [true, "Please provide a description"],
      maxlength: [100, "Description cannot be longer than 100 characters"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", PostSchema);
