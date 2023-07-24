require("dotenv").config();

const authRouter = require("./routes/authRoutes");

const express = require("express");
const app = express();

const connectDB = require("./db/connect");

app.use(express.json());

app.use("/api/auth", authRouter);

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
