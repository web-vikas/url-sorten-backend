const mongoose = require("mongoose");
const { mongodb, env } = require("./vars");

//Init DB Connection
exports.connect = () => {
  return new Promise((resolve, reject) => {
    // print mongoose logs in dev env
    if (env === "development") {
      mongoose.set("debug", true);
    }
    mongoose.set('strictQuery', false)
    mongoose
      .connect(mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        autoIndex: true,
      })
      .then(() => {
        console.log("DB Connected.");
        resolve(true);
      })
      .catch((error) => {
        reject(error);
        process.exit(-1);
      });
  });
};
