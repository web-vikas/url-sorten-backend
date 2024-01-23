const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Config = require("../config/vars");
const { Mail } = require("../services");
const {
  User,
  ProfilePicture,
  Customer,
  Employee,
  OTPModel,
} = require("../models");
const saltRounds = 10;
const {
  IsExists,
  Insert,
  FindOne,
  Find,
  CompressImageAndUpload,
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
  /**
   * @api {post} /auth/login Login
   * @apiName Login
   * @apiGroup Auth
   * @apiVersion 1.0.0
   * @apiDescription Login api.
   *
   * @apiBody {String} email Email.
   * @apiBody {String} password Password.
   *
   * @apiExample {json} Example usage:
        {
      "email": "emptyman@myhspp.com",
      "password": "Qwert@12345"
    }
   */
  Login: async (req, res, next) => {
    try {
      const { email = "", password = "" } = req.body;

      let validateError = null;
      if (!ValidateEmail(email.trim()))
        validateError = "Please enter a valid email id i.e abc@gmail.com";

      if (validateError) return HandleError(res, validateError);

      let isUserExists = await IsExistsOne({
        model: User,
        where: { email: email },
      });
      if (!isUserExists) {
        return HandleError(res, "User doesn't exists!");
      }
      console.log(isUserExists);
      const isPasswordCorrect = await bcrypt.compare(
        password,
        isUserExists.password
      );

      if (!isPasswordCorrect) return HandleError(res, "Incorrect Password!");

      let user = { ...isUserExists };

      const active_session_refresh_token = GeneratePassword();
      const access_token = jwt.sign(
        { id: user._id, email: user.email },
        Config.secret,
        {
          expiresIn: Config.tokenExpiryLimit, // 86400 expires in 24 hours -- It should be 1 hour in production
        }
      );

      let updated = await FindAndUpdate({
        model: User,
        where: { _id: user._id },
        update: {
          $set: {
            access_token: access_token,
            active_session_refresh_token: active_session_refresh_token,
          },
        },
      });
      let userData = { ...updated._doc };

      if (!updated) return HandleError(res, "Failed to generate access token.");
      userData = {
        _id: user._id,
        email: user.email,
        name: user.name,
        mobile: user.mobile,
        role: user.role,
        access_token: access_token,
        active_session_refresh_token: active_session_refresh_token,
      };

      return HandleSuccess(res, userData);
    } catch (err) {
      HandleServerError(res, req, err);
    }
  },

  RefreshToken: async (req, res, next) => {
    try {
      const { token = "", email = "" } = req.params;
      if (!token.trim() || !email.trim())
        return HandleError(res, "Invalid mobile or token.");

      const isUserExists = await IsExists({
        model: User,
        where: { email: email, active_session_refresh_token: token },
      });

      if (!isUserExists) return HandleError(res, "User doesn't exists.");

      const access_token = jwt.sign(
        {
          id: isUserExists[0]._id,
          email: isUserExists[0].email,
        },
        Config.secret,
        {
          expiresIn: Config.tokenExpiryLimit, // 86400 expires in 24 hours -- It should be 1 hour in production
        }
      );

      let updated = await FindAndUpdate({
        model: User,
        where: { _id: isUserExists[0]._id },
        update: { $set: { access_token: access_token } },
      });
      if (!updated) return HandleError(res, "Failed to generate access token.");

      return HandleSuccess(res, { access_token: access_token });
    } catch (err) {
      HandleServerError(res, req, err);
    }
  },

  LoginByToken: async (req, res, next) => {
    try {
      const { token = "", email = "" } = req.params;
      if (!token.trim() || !email.trim())
        return HandleError(res, "Invalid mobile or token.");

      const isUserExists = await IsExists({
        model: User,
        where: { email: email, active_session_refresh_token: token },
      });

      let isEmailExists = await IsExists({
        model: Customer,
        where: { email: email },
      });

      if (!isUserExists || !isEmailExists)
        return HandleSuccess(res, { isUserExists: false });

      const access_token = jwt.sign(
        {
          id: isUserExists[0]._id,
          email: isUserExists[0].email,
        },
        Config.secret,
        {
          expiresIn: Config.tokenExpiryLimit, // 86400 expires in 24 hours -- It should be 1 hour in production
        }
      );

      let updated = await FindAndUpdate({
        model: User,
        where: { _id: isUserExists[0]._id },
        update: { $set: { access_token: access_token } },
      });
      if (!updated) return HandleError(res, "Failed to generate access token.");

      let user = { ...updated._doc };

      user = {
        _id: user._id,
        customer_id: isEmailExists[0]._id,
        email: user.email,
        mobile: user.mobile,
        access_token: access_token,
        active_session_refresh_token: user.active_session_refresh_token,
      };
      return HandleSuccess(res, user);
    } catch (err) {
      HandleServerError(res, req, err);
    }
  },

  SendForgetOTP: async (req, res, next) => {
    const { email } = req.body;

    let name = "";

    try {
      const isEmailExists = await IsExistsOne({
        model: User,
        where: { email: email },
      });
      name = isEmailExists.name;
      if (!isEmailExists) {
        return HandleError(res, "No user found with this email id.");
      }
      // Generate a random OTP
      const generatedOTP = Math.floor(1000 + Math.random() * 9000);

      try {
        const existingOTP = await IsExistsOne({
          model: OTPModel,
          where: { email: email },
        });

        if (existingOTP) {
          // Update the existing OTP

          const updateOTP = await FindAndUpdate({
            model: OTPModel,
            where: { email: email },
            update: {
              otp: generatedOTP,
            },
          });
          if (!updateOTP) {
            return HandleError(res, "OTP Not Updated");
          }
        } else {
          // Insert a new OTP

          const newOTP = await Insert({
            model: OTPModel,
            data: { email, otp: generatedOTP },
          });
          if (!newOTP) {
            return HandleError(res, "OTP Not Inserted");
          }
        }
      } catch (error) {
        return HandleServerError(
          res,
          "Error inserting/updating OTP: " + error.message
        );
      }

      Mail.ForgetPasswordOTP({
        email: email,
        name: name,
        otp: generatedOTP,
      });
      return HandleSuccess(res, "OTP Send Successfully !");
    } catch (error) {
      return HandleError(res, "Error sending OTP: " + error.message);
    }
  },

  VerifyOTP: async (req, res, next) => {
    const { email, otp } = req.body;
    try {
      if (email == "" || otp == "") {
        return HandleError(res, "Please Enter Email And OTP.");
      }
      // Find the OTP entry for the given email
      const otpEntry = await IsExistsOne({
        model: OTPModel,
        where: { email: email },
      });

      if (!otpEntry) {
        return HandleError(res, "Invalid OTP.");
      }

      if (otpEntry.otp != otp) {
        return HandleError(res, "Invalid OTP.");
      }

      const otpUpdateTime = otpEntry.updatedAt;

      const timeElapsed = Date.now() - otpUpdateTime;

      const otpValidityThreshold = 5 * 60 * 1000; // 5 minutes in milliseconds

      if (timeElapsed > otpValidityThreshold) {
        return HandleError(res, "OTP has expired.");
      }
      await Delete({
        model: OTPModel,
        where: { email: email },
      });

      return HandleSuccess(res, "OTP verified successfully.");
    } catch (error) {
      return HandleServerError(res, "Error verifying OTP: " + error.message);
    }
  },
  ResetPassword: async (req, res, next) => {
    try {
      const { email, password, confirm_password } = req.body;

      if (!password || !confirm_password)
        return HandleError(res, "Password can not be empty.");
      else if (password != confirm_password)
        return HandleError(res, "Confirm password didn't matched.");

      const user = await IsExistsOne({
        model: User,
        where: {
          email: email,
        },
      });
      if (!user) return HandleError(res, "Invalid user.");

      if (user.is_password_changed == true) {
        const password_hash = await bcrypt.hash(password, saltRounds);

        const update = await FindAndUpdate({
          model: User,
          where: {
            email: email,
          },
          update: {
            password: password_hash,
          },
        });
        if (!update) return HandleError(res, "Failed to update password.");
      } else {
        const password_hash = await bcrypt.hash(password, saltRounds);

        const update = await FindAndUpdate({
          model: User,
          where: {
            email: email,
          },
          update: {
            password: password_hash,
            is_password_changed: true,
          },
        });
        if (!update) return HandleError(res, "Failed to update password.");
      }

      return HandleSuccess(res, true);
    } catch (err) {
      return HandleServerError(res, req, err);
    }
  },
};
