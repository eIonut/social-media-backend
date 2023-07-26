const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const authenticationMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { id, email } = decoded;
    req.user = { id, email };
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ msg: "Unauthorized" });
  }
};

module.exports = authenticationMiddleware;
