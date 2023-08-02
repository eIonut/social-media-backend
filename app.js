require("dotenv").config();
require("express-async-errors");

const authRouter = require("./routes/authRoutes");
const postRouter = require("./routes/postRoutes");
const commentRouter = require("./routes/commentRoutes");
const userRouter = require("./routes/userRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const chatRouter = require("./routes/chatRoutes");

const Message = require("./models/Message");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const User = require("./models/User");
const Notification = require("./models/Notification");

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const fileUpload = require("express-fileupload");
const cors = require("cors");

const connectDB = require("./db/connect");

const errorHandlerMiddleware = require("./middleware/error-handler");

app.use(cors());
app.use(express.json());
app.use(express.static("./public"));
app.use(fileUpload());
app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);
app.use("/api/comment", commentRouter);
app.use("/api/me", userRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/chat", chatRouter);

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 4000;

const setupChangeStream = () => {
  try {
    Message.watch().on("change", async (change) => {
      if (change.operationType === "insert") {
        const newMessage = change.fullDocument;

        const sender = await User.findOne({ _id: newMessage.sender });
        const recipient = await User.findOne({ _id: newMessage.recipient });
        newMessage.senderName = sender.name;
        newMessage.recipientName = recipient.name;
        console.log(newMessage);
        io.emit("new-message", newMessage);
      }
    });

    Post.watch().on("change", async (change) => {
      if (change.operationType === "delete") {
        const deletedPostId = change.documentKey._id;
        io.emit("delete-post", deletedPostId);
      }

      if (change.operationType === "insert") {
        const insertedPost = change.fullDocument;

        io.emit("add-post", insertedPost);
      }

      if (change.operationType === "update") {
        const updatedPostId = change.documentKey._id;
        const updatedPost = await Post.findById(updatedPostId);
        io.emit("edit-post", updatedPost);
      }
    });

    Comment.watch().on("change", async (change) => {
      if (change.operationType === "delete") {
        const deletedCommentId = change.documentKey._id;
        io.emit("delete-comment", deletedCommentId);
      }

      if (change.operationType === "insert") {
        const insertedComment = change.fullDocument;
        io.emit("add-comment", insertedComment);
      }

      if (change.operationType === "update") {
        const updatedCommentId = change.documentKey._id;
        const updatedComment = await Comment.findById(updatedCommentId);
        io.emit("edit-comment", updatedComment);
      }
    });

    Notification.watch().on("change", async (change) => {
      if (change.operationType === "insert") {
        const notification = change.fullDocument;
        io.emit("add-notification", notification);
      }

      if (change.operationType === "delete") {
        const deletedNotificationId = change.documentKey._id;
        io.emit("delete-notification", deletedNotificationId);
      }

      if (change.operationType === "update") {
        const updatedNotificationId = change.documentKey._id;
        io.emit("read-notification", updatedNotificationId);
      }
    });

    User.watch().on("change", async (change) => {
      if (change.operationType === "update") {
        const userId = change.documentKey._id;
        const updatedUser = await User.findById(userId);
        const updatedUserFriends = updatedUser.friends;

        io.emit("add-friend", updatedUserFriends);
      }
    });
  } catch (error) {
    console.error("Error setting up change stream:", error);
  }
};

connectDB(process.env.MONGO_URL)
  .then(() => {
    server.listen(port, async () => {
      console.log(`Server is listening on port ${port}`);
      setupChangeStream();
    });
  })
  .catch((error) => {
    console.log(error);
  });
