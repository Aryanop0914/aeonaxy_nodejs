const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const prisma = require("../utils/prisma");

const joinCourse = async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id;
    const { courseId } = req.params;
    const enroleObject = { courseId, userId };
    const alreadyEnrolled = await prisma.enrollment.findFirst({
      where: enroleObject,
    });
    if (alreadyEnrolled) {
      throw new ApiError(400, "User has already been enrolled");
    }
    const enrole = await prisma.enrollment.create({ data: enroleObject });
    if (!enrole) {
      throw new ApiError(401, "Something Went Wrong Try Again Later");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, null, "User Enrolled The Course Successfully")
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
const totalCourseUserEnrolled = async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id;
    const enrole = await prisma.enrollment.findMany({
      where: { userId },
      include: { course: true },
    });
    if (!enrole) {
      throw new ApiError(500, "Something Went Wrong");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { enrole, totalCourses: enrole.length },
          "Total Courses Enrolled By User"
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
module.exports = { joinCourse, totalCourseUserEnrolled };
