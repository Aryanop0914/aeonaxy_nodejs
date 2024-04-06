const { Router } = require("express");
const { verifyJWT } = require("../middleware/Auth.middleware");
const {
  addCourse,
  updateCourseDetails,
  getCourseInfoById,
} = require("../controller/course.controller");
const router = Router();

router.route("/addCourse").post(verifyJWT, addCourse);

router
  .route("/updateCourseDetails/:courseId")
  .put(verifyJWT, updateCourseDetails);

router.route("/getCourseInfo/:courseId").get(getCourseInfoById);
module.exports = router;
