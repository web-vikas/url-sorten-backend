const express = require("express");
const router = express.Router();
const { VerifyToken } = require("../middlewares");
const { env, secret } = require("../config/vars");

router.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if ("OPTIONS" == req.method) {
    res.sendStatus(200);
  } else {
    next();
  }
});

//Server Test API
router.get("/v1/", (req, res) => {
  res.status(200);
  res.json({ status: "success", message: "API Server Running." });
});

//Server API Docs
if (env == "development") {
}

//Import APIs
router.use("/v1/auth", require("./auth"));
router.use("/", require("./redirect"));

// Protect all routes after this middleware
router.use(VerifyToken);
router.use("/v1/urls", require("./urls"));

//Global error handler
router.use((req, res) => {
  res.status(500);
  res.json({ status: "failed", error: "Internal Server Error." });
});

module.exports = router;
