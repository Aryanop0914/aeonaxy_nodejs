const { Router } = require("express");
const upload = require("../middleware/multer.middleware");
const {
  registerUser,
  sendEmail,
  verifyTokenAndUpdate,
  login,
  logout,
  deleteUser,
} = require("../controller/user.controller");
const { verifyJWT } = require("../middleware/Auth.middleware");
const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);

router.route("/sendmail").get(sendEmail);

router.route("/verifyToken/:clientToken").get(verifyTokenAndUpdate);

router.route("/login").post(login);

router.route("/logout").get(verifyJWT, logout);

router.route("/deleteUser").delete(verifyJWT, deleteUser);

module.exports = router;
