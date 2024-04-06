const JWT = require("jsonwebtoken");
const generateToken = async (payload) => {
  const token = JWT.sign(payload, process.env.TOKEN_SECRET, {
    expiresIn: "6h",
  });
  return token;
};

const vToken = async (token) => {
  const decrypted = JWT.verify(token, process.env.TOKEN_SECRET);
  return decrypted;
};

module.exports = { generateToken, vToken };
