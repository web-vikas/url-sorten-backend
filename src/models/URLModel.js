const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UrlSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "users", required: true },
    id: { type: String, trim: true, required: true },
    full_url: { type: String, trim: true, required: true },
  },
  { timestamps: true }
);

const UrlModel = mongoose.model("urls", UrlSchema);
module.exports = UrlModel;
