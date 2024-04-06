const SendVerifyToken = (token) => {
  return `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <a href="http://localhost:5000/api/user/verifyToken/${token}" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 3px;">Click Here to Verify</a>
  </div>
</body>`;
};

module.exports = { SendVerifyToken };
