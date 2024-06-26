const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const prisma = require("../utils/prisma");
const addCourse = async (req, res) => {
  try {
    const user = req.user;
    const ownerId = user.id;
    const { title, description, category, level } = req.body;
    if (
      [title, description, category, level].some(
        (filter) => filter?.trim() === ""
      )
    ) {
      throw new ApiError(400, "All The Fields Are Required");
    }
    const courseObj = { title, description, category, level, ownerId };
    const createCourse = await prisma.courses.create({ data: courseObj });
    if (!createCourse) {
      throw new ApiError(500, "SomeThing Went Wrong While creating Course");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, createCourse, "Course Created Successfully"));
  } catch (error) {
    logger.log({
      level: "error",
      message: error.error_message,
      status_Code: error.statusCode || 500,
    });
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

const updateCourseDetails = async (req, res) => {
  try {
    const user = req.user;
    const ownerId = user.id;
    const { courseId } = req.params;
    const findOwner = await prisma.courses.findFirst({
      where: { id: courseId },
    });
    if (ownerId !== findOwner.ownerId) {
      throw new ApiError(400, "You are Not the owner");
    }
    const { title, description, category, level } = req.body;
    const courseObj = {};
    if (title !== undefined) courseObj.title = title;
    if (description !== undefined) courseObj.description = description;
    if (category !== undefined) courseObj.category = category;
    if (level !== undefined) courseObj.level = level;
    if (Object.keys(courseObj).length === 0) {
      throw new ApiError(400, "No fields to update provided");
    }
    const updatedCourse = await prisma.courses.update({
      where: { id: courseId },
      data: courseObj,
    });
    if (!updatedCourse) {
      throw new ApiError(
        400,
        "Something Went wrong while Updating Course Details"
      );
    }
    return res
      .status(200)
      .json(new ApiResponse(200, updatedCourse, "Course Updated Successfully"));
  } catch (error) {
    logger.log({
      level: "error",
      message: error.error_message,
      status_Code: error.statusCode || 500,
    });
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

const getCourseInfoById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const courseInfo = await prisma.courses.findFirst({
      where: { id: courseId },
      include: {
        owner: true,
      },
    });
    const countTotalUser = await prisma.enrollment.findMany({
      where: { courseId },
      include: { user: true },
    });
    courseInfo.totalCount = countTotalUser.length;
    courseInfo.allUsers = countTotalUser;
    if (!courseInfo) {
      throw new ApiError(400, "There Is no Course Related to this Id");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, courseInfo, "Course Info Fetch successfully"));
  } catch (error) {
    logger.log({
      level: "error",
      message: error.error_message,
      status_Code: error.statusCode || 500,
    });
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

const getAllCourse = async (req, res) => {
  try {
    const { title, category, level, page, limit } = req.query;
    if (page < 0) {
      throw new ApiError(400, "Page number should be greater than 0");
    }
    const query = {};
    if (title && title !== undefined) query.title = title;
    if (category && category !== "All") query.category = category;
    if (level && level !== "All") query.level = level;
    const courses = await prisma.courses.findMany({
      skip: (page - 1) * limit,
      take: limit * 1,
      where: query,
    });
    if (!courses) {
      throw new ApiError(500, "Something Went Wrong While While filtering");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, courses, "Courses Fetched Successfully"));
  } catch (error) {
    logger.log({
      level: "error",
      message: error.error_message,
      status_Code: error.statusCode || 500,
    });
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
  addCourse,
  updateCourseDetails,
  getCourseInfoById,
  getAllCourse,
};
