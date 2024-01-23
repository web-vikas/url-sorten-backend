const { port, env, isAppSocketIOEnable } = require("./src/config/vars");
const app = require("./src/config/express");
const socket = require("./src/config/socket");
const mongoose = require("./src/config/mongoose");

// open mongoose connection
mongoose.connect();

// listen to requests
const server = isAppSocketIOEnable ? socket : app;
server.listen(port, () =>
	console.log(`Server started on port ${port} (${env})`)
);
