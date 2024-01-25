const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: { type: String, trim: true },
    email: { type: String, trim: true, unique: true },
    phone: { type: String, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    limit: { type: Number, required: true, default: 200 },
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["SuperAdmin", "Customer", "Employee"],
      default: "Customer",
    },
    active_session_refresh_token: { type: String },
    access_token: { type: String },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
