const ForgotPasswordToken = (token) => {
  return `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333;">Your Forgot Password Token is ${token}.</h2>
    <a href="#" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 3px;">Click Here to Update Your Password</a>
  </div>
</body>`;
};

module.exports = { ForgotPasswordToken };
