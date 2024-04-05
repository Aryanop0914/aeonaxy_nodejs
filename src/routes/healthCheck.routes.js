const { Router } = require("express");
const router = Router();
const { healthCheck } = require("../controller/healthCheck.controller");

router.route("/healthCheck").get(healthCheck);

module.exports = router;
