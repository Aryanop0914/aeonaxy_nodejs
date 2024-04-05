const SendVerifyToken = (token) => {
  return `<h2>Your Verify Token is ${token}.</h2>
            <a href="">Click Here to Verify your Accn</a>`;
};

module.exports = { SendVerifyToken };
