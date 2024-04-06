const { Router } = require("express");
const { verifyJWT } = require("../middleware/Auth.middleware");
const {
  joinCourse,
  totalCourseUserEnrolled,
} = require("../controller/enrollment.controller");
const router = Router();

router.route("/joinCourse/:courseId").post(verifyJWT, joinCourse);

router.route("/totalCourseEnrolled").get(verifyJWT, totalCourseUserEnrolled);
module.exports = router;
