const app = require("./express");
const http = require("http");
const socket = require("socket.io");

/*
 * Creating socket routes
 * Sockets are divided into namespace, used as router
 * The namespace / socket router are imported from router/socket.js
 * The middleware to verify token for all socket connection exists at middleware/index.js and imported to router/socket.js
 * All socket controllers exists in controller/SocketController.js
 */

const server = http.createServer(app);
module.exports = server;
