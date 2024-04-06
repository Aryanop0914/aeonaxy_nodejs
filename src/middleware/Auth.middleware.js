const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { vToken } = require("../utils/handleToken");
const prisma = require("../utils/prisma");

const verifyJWT = async (req, res, next) => {
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
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.error_message || "Token Expired"
        )
      );
  }
};

module.exports = { verifyJWT };
