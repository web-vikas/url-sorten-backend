const express = require("express");
const router = express.Router();

const Controllers = require("../controllers");
const URL = Controllers.URL;

router.post("/insert", URL.InsertURL);
router.get("/get-urls", URL.GetURLs);

module.exports = router;
