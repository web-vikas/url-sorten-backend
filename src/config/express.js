const express = require("express");
const bodyParser = require("body-parser");
//const socket = require("socket.io");
const cors = require("cors");
const { env } = require("./vars");
const routes = require("../routes");

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(bodyParser.raw({ limit: "50mb" }));

app.use(express.static("public"));

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

//mount api routes
app.use("/", routes);

module.exports = app;
