const mongoose = require("mongoose");
const { ROLES, USER_STATUSES } = require("../config");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUSES),
      default: USER_STATUSES.ACTIVE
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
