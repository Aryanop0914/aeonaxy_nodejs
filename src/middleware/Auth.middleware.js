const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { vToken } = require("../utils/handleToken");
const prisma = require("../utils/prisma");

const verifyJWT = async (req, _, next) => {
  try {
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies.accessToken;
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    const { userId } = await vToken(token);
    const userObj = await prisma.user.findFirst({ where: { id: userId } });
    if (!userObj) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = userObj;
    next();
  } catch (error) {
    throw new ApiError(500, error?.message || "Invalid access Token");
  }
};

module.exports = { verifyJWT };
