const { Router } = require("express");
const upload = require("../middleware/multer.middleware");
const {
  registerUser,
  sendEmail,
  verifyTokenAndUpdate,
  login,
  logout,
  deleteUser,
  updateDetails,
  forgotPasswordTokenSend,
  updatePassword,
} = require("../controller/user.controller");
const { verifyJWT } = require("../middleware/Auth.middleware");
const router = Router();

router
  .route("/register")
  .post(upload.fields([{ name: "avatar", maxCount: 1 }]), registerUser);

router.route("/verifyToken/:clientToken").get(verifyTokenAndUpdate);

router.route("/login").post(login);

router.route("/logout").get(verifyJWT, logout);

router
  .route("/updateDetails")
  .post(
    verifyJWT,
    upload.fields([{ name: "avatar", maxCount: 1 }]),
    updateDetails
  );

router.route("/deleteUser").delete(verifyJWT, deleteUser);

router.route("/forgotPassword").post(forgotPasswordTokenSend);

router.route("/forgotPasswordTokenVerify/:verifyToken").post(updatePassword);

module.exports = router;
