const { twilio } = require("../config/vars");
const TwilioClient = require("twilio")(twilio.account_sid, twilio.auth_token);
module.exports = {
  customerSignup: async (data) => {
    try {
      const MessageBody = `Dear ${data.name},
        Here is your account details:
        Username: ${data.phone}
        Temporary Password: ${data.password}
        For security reasons, we recommend that you change your password immediately after logging in for the first time.`;
      const info = await TwilioClient.messages.create({
        body: MessageBody,
        from: twilio.number,
        to: `${twilio.country_code}${data.phone}`,
      });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  },
};
