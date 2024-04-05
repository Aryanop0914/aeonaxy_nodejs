const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendMail = async ({ to, subject, JSXelement }) => {
  const response = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: to,
    subject: subject,
    html: JSXelement,
  });
  return response;
};

module.exports = sendMail;
