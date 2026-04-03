const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const { HttpError } = require("../lib/httpError");
const { USER_STATUSES } = require("../config");
const User = require("../models/User");

function sanitizeUser(user) {
  const source = typeof user.toObject === "function" ? user.toObject() : user;
  const { passwordHash, _id, ...safeUser } = source;
  return {
    id: _id?.toString?.() || source.id,
    ...safeUser
  };
}

async function listUsers() {
  const users = await User.find().sort({ createdAt: -1 });
  return users.map(sanitizeUser);
}

async function findUserByEmail(email) {
  return User.findOne({ email: email.toLowerCase() });
}

async function findUserById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  return User.findById(id);
}

async function createUser(payload) {
  const exists = await User.exists({ email: payload.email.toLowerCase() });
  if (exists) {
    throw new HttpError(409, "A user with this email already exists.");
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const newUser = await User.create({
    name: payload.name.trim(),
    email: payload.email.toLowerCase(),
    passwordHash,
    role: payload.role,
    status: payload.status || USER_STATUSES.ACTIVE
  });

  return sanitizeUser(newUser);
}

async function updateUser(id, payload) {
  const user = await findUserById(id);
  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  if (payload.email) {
    const duplicate = await User.exists({
      _id: { $ne: user._id },
      email: payload.email.toLowerCase()
    });
    if (duplicate) {
      throw new HttpError(409, "Another user already uses this email.");
    }
  }

  if (payload.name) user.name = payload.name.trim();
  if (payload.email) user.email = payload.email.toLowerCase();
  if (payload.role) user.role = payload.role;
  if (payload.status) user.status = payload.status;

  if (payload.password) {
    user.passwordHash = await bcrypt.hash(payload.password, 10);
  }

  await user.save();
  return sanitizeUser(user);
}

async function validateCredentials(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new HttpError(401, "Invalid email or password.");
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);
  if (!passwordOk) {
    throw new HttpError(401, "Invalid email or password.");
  }

  if (user.status !== USER_STATUSES.ACTIVE) {
    throw new HttpError(403, "This user is inactive and cannot log in.");
  }

  return user;
}

module.exports = {
  sanitizeUser,
  listUsers,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  validateCredentials
};
