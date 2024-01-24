const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Config = require("../config/vars");
const { User } = require("../models");
const saltRounds = 10;
const {
  IsExists,
  Insert,
  Find,
  FindAndUpdate,
  Delete,
  HandleSuccess,
  HandleError,
  HandleServerError,
  Aggregate,
  ValidateEmail,
  PasswordStrength,
  ValidateAlphanumeric,
  ValidateLength,
  ValidateMobile,
  GeneratePassword,
  IsExistsOne,
} = require("./BaseController");

module.exports = {
  CreateUser: async (req, res, next) => {
    try {
      const { email = "", phone = "", password = "", role = "" } = req.body;

      let validateError = null;
      if (!ValidateEmail(email.trim()))
        validateError = "Please enter a valid email id i.e abc@gmail.com";
      else if (password === "" || role === "" || phone == "")
        validateError = "Required fields cannot be blank!";

      if (validateError) return HandleError(res, validateError);

      let isUserExists = await IsExists({
        model: User,
        where: { email: email },
      });

      if (isUserExists) return HandleError(res, "Email Already Exists!");
      let isUserPhoneExists = await IsExists({
        model: User,
        where: { phone: phone },
      });
      if (isUserPhoneExists) return HandleError(res, "Phone Already Exists!");

      let expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() - Config.otpExpiryLimit);

      const password_hash = await bcrypt.hash(password, saltRounds);
      let data = { email, phone, password: password_hash, role };
      data.active_session_refresh_token = GeneratePassword();
      let inserted = await Insert({
        model: User,
        data: data,
      });
      if (!inserted)
        return HandleError(
          res,
          "Failed to create account. Please contact system admin."
        );

      inserted = { ...inserted._doc };
      const access_token = jwt.sign(
        {
          id: inserted._id,
          email: inserted.email,
        },
        Config.secret,
        {
          expiresIn: Config.tokenExpiryLimit, // 86400 expires in 24 hours -- It should be 1 hour in production
        }
      );

      let updated = await FindAndUpdate({
        model: User,
        where: { _id: inserted._id },
        update: { $set: { access_token: access_token } },
      });
      if (!updated) return HandleError(res, "Failed to update access token.");

      let user = { ...updated._doc };
      user = {
        _id: user._id,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        access_token: access_token,
        active_session_refresh_token: user.active_session_refresh_token,
      };

      return HandleSuccess(res, user);
    } catch (err) {
      HandleServerError(res, req, err);
    }
  },
};
