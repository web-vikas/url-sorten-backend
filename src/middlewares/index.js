const jwt = require("jsonwebtoken");
const Config = require("../config/vars");
const {
  UnauthorizedError,
  IsExists,
  FindAndUpdate,
} = require("../controllers/BaseController");
const { User } = require("../models");

const VerifyToken = (req, res, next) => {
  try {
    if (typeof req.headers.authorization !== "undefined") {
      let token = req.headers.authorization.split(" ")[1];
      jwt.verify(token, Config.secret, async (err, user) => {
        if (err) return UnauthorizedError(res);
        const isUserExists = await IsExists({
          model: User,
          where: { _id: user.id, access_token: token },
        });

        if (!isUserExists) return UnauthorizedError(res);
        req.user = isUserExists[0];
        next();
      });
    } else return UnauthorizedError(res);
  } catch (err) {
    HandleServerError(res, req, err);
  }
};

exports.VerifyToken = VerifyToken;

