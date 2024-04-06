const { ApiResponse } = require("../utils/ApiResponse");

const healthCheck = async (req, res) => {
  res.status(200).json(new ApiResponse(200, null, "Server Is running"));
};

module.exports = { healthCheck };
