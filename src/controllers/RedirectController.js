const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Config = require("../config/vars");
const { User, URL } = require("../models");
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
  FindOne,
} = require("./BaseController");

module.exports = {
  Redirect: async (req, res, next) => {
    try {
      const { id = "" } = req.params;
      const data = await FindOne({
        model: URL,
        where: { id },
      });
      if (data) {
        return res.redirect(data.full_url);
      }

      const someHTML = "<h1>404</h1>";
      res.set("Content-Type", "text/html");
      return res.status(404).send(someHTML);
    } catch (err) {
      return HandleServerError(res, req, err);
    }
  },
  NotFound: (req, res) => {
    return res.redirect("https://ijkl.vercel.app/");
  },
};
