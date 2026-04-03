const express = require("express");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../middleware/asyncHandler");
const { authenticate } = require("../middleware/auth");
const { JWT_SECRET } = require("../config");
const { validateCredentials, sanitizeUser } = require("../services/userService");
const { assert } = require("../lib/validators");

const router = express.Router();

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    assert(typeof email === "string" && typeof password === "string", "Email and password are required.");

    const user = await validateCredentials(email, password);
    const token = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });

    res.json({
      token,
      user: sanitizeUser(user)
    });
  })
);

router.get(
  "/me",
  authenticate,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  })
);

module.exports = router;
