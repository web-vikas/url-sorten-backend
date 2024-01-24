const path = require("path");
const dotenv = require("dotenv").config();
const dotenvExample = require("dotenv").config({
  path: path.resolve(process.cwd(), ".env.example"),
});

// if (
//   Object !== null &&
//   JSON.stringify(Object.keys(dotenv.parsed).sort()) !==
//     JSON.stringify(Object.keys(dotenvExample.parsed).sort())
// ) {
//   throw Error("Missing values in .env. Please refer to .env.example");
// }

module.exports = {
  port: process.env.PORT,
  mongodb: process.env.MONGO_CONNECTION_STRING,
  secret: process.env.JWT_SECRET,
  env: process.env.NODE_ENV,
  tokenExpiryLimit: 86400,
  otpExpiryLimit: 1,
  isAppSocketIOEnable: false,
  host_url: process.env.HOST_URL,
  // frontend_host_url: process.env.FRONTEND_HOST_URL,
};
