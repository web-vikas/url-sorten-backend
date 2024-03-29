const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Config = require("../config/vars");
const { Mail } = require("../services");
const { Mongoose, User, URL } = require("../models");

const {
  Insert,
  Find,
  FindAndUpdate,
  HandleSuccess,
  HandleError,
  HandleServerError,
  GeneratePassword,
  IsExistsOne,
  isValidUrl,
  FindOne,
} = require("./BaseController");

module.exports = {
  InsertURL: async (req, res, next) => {
    try {
      const { full_url, custom_endpoint = "" } = req.body;
      const { _id, limit } = req.user;
      if (
        !isValidUrl(full_url) ||
        full_url.startsWith("https://hit-go.vercel.app/")
      )
        return HandleError(res, "Invalid URL");
      if (limit <= 0) return HandleError(res, "You Are Out Of Limit.");
      const maxLength = 4;
      let checkIsExist = null;
      let urlId = null;
      if (custom_endpoint != "") {
        const checkIsExist = await IsExistsOne({
          model: URL,
          where: { id: custom_endpoint },
        });
        if (checkIsExist) {
          return HandleError(res, "EndPoint Already Exist.");
        }
        const insertNewURL = await Insert({
          model: URL,
          data: { user: _id, full_url, id: custom_endpoint },
        });
        return HandleSuccess(res, insertNewURL);
      }
      do {
        urlId = GeneratePassword(maxLength);
        checkIsExist = await IsExistsOne({
          model: URL,
          where: { id: urlId },
        });
      } while (checkIsExist);

      const insertNewURL = await Insert({
        model: URL,
        data: { user: _id, full_url, id: urlId },
      });
      if (!insertNewURL) return HandleError(res, "Failed To Shorten The URL");

      const updatedUser = await FindAndUpdate({
        model: User,
        where: { _id },
        update: { limit: limit - 1 },
      });
      if (!updatedUser) return HandleError(res, "Failed To change Limit!");
      return HandleSuccess(res, insertNewURL);
    } catch (err) {
      HandleServerError(res, req, err);
    }
  },
  GetURLs: async (req, res, next) => {
    try {
      const { _id } = req.user;
      let { page = 1, perPage = 10 } = req.query;

      // Set default values if not provided
      page = parseInt(page) || 1;
      perPage = parseInt(perPage) || 10;

      const skip = (page - 1) * perPage;
      const totalRecords = await URL.countDocuments({
        user: Mongoose.Types.ObjectId(_id),
      })
        .lean()
        .exec();
      const data = await Find({
        model: URL,
        where: { user: Mongoose.Types.ObjectId(_id) },
        skip,
        limit: perPage,
      });
      const totalPages = Math.ceil(totalRecords / perPage);
      const hasMore = page < totalPages;

      return HandleSuccess(res, {
        results: data,
        hasMore,
        totalRecords: totalRecords,
        totalPages: totalPages,
      });
    } catch (err) {
      HandleServerError(res, req, err);
    }
  },
  GetURL: async (req, res, next) => {
    try {
      const { id } = req.param;

      const data = await FindOne({
        model: URL,
        where: { id },
      });

      return HandleSuccess(res, data);
    } catch (err) {
      HandleServerError(res, req, err);
    }
  },
};
