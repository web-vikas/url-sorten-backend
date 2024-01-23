const express = require("express");
const router = express.Router();

const Controllers = require("../controllers");
const Auth = Controllers.Auth;
const User = Controllers.User;

router.post("/login", Auth.Login);
router.post("/sign-up", User.CreateUser);
router.get("/refresh-token/:email/:token", Auth.RefreshToken);
router.get("/login-by-token/:email/:token", Auth.LoginByToken);

module.exports = router;
