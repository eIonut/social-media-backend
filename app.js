require("dotenv").config();
require("express-async-errors");

const authRouter = require("./routes/authRoutes");
const postRouter = require("./routes/postRoutes");
const commentRouter = require("./routes/commentRoutes");
const userRouter = require("./routes/userRoutes");
const notificationRouter = require("./routes/notificationRoutes");
const chatRouter = require("./routes/chatRoutes");

const Message = require("./models/Message");

const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server({
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

const port = process.env.PORT || 5000;

io.listen(4000);
io.on("connection", async (socket) => {
  console.log("user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("send-message", async ({ message, sender, recipient }) => {
    const newMessage = {
      sender,
      message,
      recipient,
    };

    // observe pe colectia respectiva
    // inlcouiesc socket send message
    //sa adaug un post pt mesaje
    // si inlocuiesc in frontend emitter-ul

    await Message.create(newMessage);

    io.emit("new-message", newMessage);
  });
});

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    server.listen(port, () =>
      console.log(`Server is listening on port ${port}`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
