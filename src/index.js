const { app } = require("./app");
require("dotenv").config({
  path: "./.env",
});

app.listen(process.env.PORT, () => {
  console.log(`Server Running on ${process.env.PORT}`);
});
