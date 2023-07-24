const register = async (req, res) => {
  res.send("register user");
};
const login = (req, res) => {
  res.send("login user");
};
const logout = (req, res) => {
  res.send("logout user");
};

module.exports = { register, login, logout };
