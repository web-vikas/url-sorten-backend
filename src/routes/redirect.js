const express = require("express");
const router = express.Router();

const Controllers = require("../controllers");
const Redirect = Controllers.Redirect;

router.get("/:id", Redirect.Redirect);
router.get("/", Redirect.NotFound);

module.exports = router;
