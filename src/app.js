const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
require("./utils/prisma");

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

const userRoutes = require("./routes/user.routes");
const healthCheck = require("./routes/healthCheck.routes");
app.use("/api/user", userRoutes);
app.use("/api", healthCheck);

module.exports = { app };
