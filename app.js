require("dotenv").config();
// require("express-async-errors");

const authRouter = require("./routes/authRoutes");
const postRouter = require("./routes/postRoutes");

const express = require("express");
const app = express();

const connectDB = require("./db/connect");

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/post", postRouter);

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => console.log(`Server is listening on port ${port}`));
  } catch (error) {
    console.log(error);
  }
};

app.get("/", (req, res) => {
  res.send("Asd");
});

start();
