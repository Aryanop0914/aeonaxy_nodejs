const prisma = require("../utils/prisma");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/sendEmail");
const { SendVerifyToken } = require("../Emails/SendVerifyToken");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { generateToken, vToken } = require("../utils/handleToken");
const {
  uploadOnCloudinary,
  deleteFromCloudinary,
} = require("../utils/Cloudinary");
const { ForgotPasswordToken } = require("../Emails/ForgotPasswordToken");

const options = {
  httpOnly: true,
  // secure: true,
  SameSite: "None",
};
const registerUser = async (req, res) => {
  //validate username,email,password
  //user already Exist or not
  //files available or not
  //upload on cloudinary
  //hash password
  //save to database
  //generate verify Token
  //send in Mail provided
  //store in Auth table
  //response
  try {
    const { username, email, password } = req.body;
    if ([username, email, password].some((filter) => filter?.trim() === "")) {
      throw new ApiError(400, "All The Fields Are Required");
    }
    const userExist = await prisma.user.findFirst({ where: { email } });
    if (userExist) {
      throw new ApiError(400, "User Already Exist");
    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required");
    }
    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    if (!avatarResponse) {
      throw new ApiError(500, "Something went Wrong while Uploading Avatar");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userObject = {
      username,
      email,
      password: hashedPassword,
      avatar_url: avatarResponse.url,
      avatar_public_id: avatarResponse.public_id,
    };
    const userResponse = await prisma.user.create({
      data: userObject,
    });
    const verifyToken = await generateToken({ userId: userResponse.id });
    await prisma.authToken.create({
      data: { userId: userResponse.id, verifyToken },
    });
    const response = await sendMail({
      to: "patelaryan0914@gmail.com",
      subject: "Your Verification Token",
      JSXelement: SendVerifyToken(verifyToken),
    });
    if (!response) {
      throw new ApiError(
        500,
        "Something Went Wrong While Sending Verify Token"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userResponse,
          "User Registered Successfully Verify Token has been mailed"
        )
      );
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.error_message || "Internal Server Error"
        )
      );
  }
};

const verifyTokenAndUpdate = async (req, res) => {
  try {
    const { clientToken } = req.params;
    const { userId } = await vToken(clientToken);
    const userObj = await prisma.authToken.findFirst({
      where: { userId, verifyToken: clientToken },
    });
    if (!userObj) {
      throw new ApiError(400, "Invalid Token Or Token Expired");
    }
    await prisma.user.update({
      where: {
        id: userObj.userId,
      },
      data: {
        isVerified: {
          set: true,
        },
      },
    });
    await prisma.authToken.update({
      where: {
        id: userObj.id,
      },
      data: {
        verifyToken: { set: null },
      },
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "User Verified successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.error_message || "Internal Server Error"
        )
      );
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new ApiError(400, "Both The fields are necessary");
    }
    const findUser = await prisma.user.findFirst({ where: { email } });
    if (!findUser) {
      throw new ApiError(400, "User Does Not Exist");
    }
    if (!findUser.isVerified) {
      throw new ApiError(400, "User is Not Verified verify through mail");
    }
    const decryptPassword = await bcrypt.compare(password, findUser.password);
    if (!decryptPassword) {
      throw new ApiError(400, "Password is Incorrect");
    }
    const accessToken = await generateToken({ userId: findUser.id, email });
    if (!accessToken) {
      throw new ApiError(500, "Something Went Wrong Try Again");
    }
    await prisma.authToken.update({
      where: { userId: findUser.id },
      data: { accessToken: { set: accessToken } },
    });
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new ApiResponse(200, findUser, "User LoggedIn successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.error_message || "Internal Server Error"
        )
      );
  }
};

const logout = async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id;
    const updated = await prisma.authToken.update({
      where: { userId },
      data: { accessToken: { set: null } },
    });
    if (!updated) {
      throw new ApiError(500, "Something Went Wrong Try Again");
    }
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, null, "User LoggedOut SuccessFully"));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.error_message || "Internal Server Error"
        )
      );
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id;
    await prisma.authToken.delete({ where: { userId } });
    const avatarDelete = await deleteFromCloudinary(user.avatar_public_id);
    if (!avatarDelete) {
      throw new ApiError(500, "Something Went Wrong While deleting Avatar");
    }
    const deleteUser = await prisma.user.delete({ where: { id: userId } });
    if (!deleteUser) {
      throw new ApiError(500, "Something Went Wrong While deleting User");
    }
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, null, "User Deleted SuccessFully"));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.error_message || "Internal Server Error"
        )
      );
  }
};

const updateDetails = async (req, res) => {
  try {
    const { username, email } = req.body;
    let avatarLocalPath;
    const user = req.user;
    const userId = user.id;
    const userObject = {};
    if (username !== undefined) userObject.username = username;
    if (email !== undefined) userObject.email = email;
    if (req.files.avatar !== undefined) {
      avatarLocalPath = req.files?.avatar[0]?.path;
      const avatarDelete = await deleteFromCloudinary(user.avatar_public_id);
      if (!avatarDelete) {
        throw new ApiError(500, "File not deleted From cloudinary");
      }
      const uploadNew = await uploadOnCloudinary(avatarLocalPath);
      userObject.avatar_url = uploadNew.url;
      userObject.avatar_public_id = uploadNew.public_id;
    }
    if (Object.keys(userObject).length === 0) {
      throw new ApiError(400, "No fields to update provided");
    }
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userObject,
    });
    if (!updatedUser) {
      throw new ApiError(400, "Something Went wrong while Updating user");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User updated Successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.error_message || "Internal Server Error"
        )
      );
  }
};

const forgotPasswordTokenSend = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw new ApiError(400, "User with this email id does not exist");
    }
    const token = await generateToken({ userId: user.id });
    await prisma.authToken.update({
      where: { userId: user.id },
      data: { forgetPasswordToken: { set: token } },
    });
    const response = await sendMail({
      to: email,
      subject: "Your Password Reset Token",
      JSXelement: ForgotPasswordToken(token),
    });
    if (!response) {
      throw new ApiError(
        500,
        "Something Went Wrong While Sending Password Reset Token"
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "Email Successfully send to change Password")
      );
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.error_message || "Internal Server Error"
        )
      );
  }
};

const updatePassword = async (req, res) => {
  try {
    const { verifyToken } = req.params;
    const { newPassword } = req.body;
    const decryptToken = await vToken(verifyToken);
    const userObj = await prisma.authToken.findFirst({
      where: { userId: decryptToken.userId, forgetPasswordToken: verifyToken },
    });
    if (!userObj) {
      throw new ApiError(400, "Invalid Token Or Token Expired");
    }
    const newHasedPassword = await bcrypt.hash(newPassword, 10);
    const updated = await prisma.user.update({
      where: { id: userObj.userId },
      data: { password: { set: newHasedPassword } },
    });
    await prisma.authToken.update({
      where: {
        id: userObj.id,
      },
      data: {
        forgetPasswordToken: { set: null },
      },
    });
    if (!updated) {
      throw new ApiError(500, "Something went wrong while updating password");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password Updated Successfully"));
  } catch (error) {
    console.log(error);
    return res
      .status(error.statusCode || 500)
      .json(
        new ApiResponse(
          error.statusCode || 500,
          null,
          error.error_message || "Internal Server Error"
        )
      );
  }
};
module.exports = {
  registerUser,
  verifyTokenAndUpdate,
  login,
  logout,
  deleteUser,
  updateDetails,
  forgotPasswordTokenSend,
  updatePassword,
};
