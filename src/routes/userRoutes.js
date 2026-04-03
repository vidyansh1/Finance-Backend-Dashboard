const express = require("express");
const { asyncHandler } = require("../middleware/asyncHandler");
const { validateUserPayload } = require("../lib/validators");
const { listUsers, createUser, updateUser } = require("../services/userService");

const router = express.Router();

router.get("/",asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.json({ items: users });
  })
);

router.post("/",asyncHandler(async (req, res) => {
    validateUserPayload(req.body || {});
    const user = await createUser(req.body);
    res.status(201).json({ item: user });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    validateUserPayload(req.body || {}, { partial: true });
    const user = await updateUser(req.params.id, req.body);
    res.json({ item: user });
  })
);

module.exports = router;
