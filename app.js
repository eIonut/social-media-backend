require("dotenv").config();

const authRouter = require("./routes/authRoutes");

const express = require("express");
const app = express();

app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.send("Asd");
});
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
