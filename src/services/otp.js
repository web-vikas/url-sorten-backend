const { mail } = require("../config/vars");
const nodemailer = require("nodemailer");

module.exports = {
  sendOtp: async (to, otpValue) => {
    try {
      let transport = await nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        debug: true,
        auth: {
          user: mail.auth.user,
          pass: mail.auth.pass,
        },
      });
      //console.log(transport)
      const option = {
        from: mail.auth.user,
        to: to,
        subject: "OTP Verification",
        text:
          "Hello, Your otp is " +
          otpValue +
          ". Please donot share with others!",
      };
      let email = await transport.sendMail(option);
      //console.log(mail)
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};
