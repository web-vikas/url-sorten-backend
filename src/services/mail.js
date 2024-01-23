const { mail, host_url, frontend_host_url } = require("../config/vars");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const transport = nodemailer.createTransport({
  host: mail.host,
  port: mail.port,
  debug: true,
  secure: false,
  auth: {
    user: mail.auth.user,
    pass: mail.auth.password,
  },
});

module.exports = {
  sendMail: async (data) => {},
};
