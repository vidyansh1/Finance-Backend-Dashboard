const express = require("express");
const { ROLES } = require("../config");
const { authorize } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/asyncHandler");
const { validatePagination, validateRecordPayload } = require("../lib/validators");
const {
  listRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord
} = require("../services/recordService");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const pagination = validatePagination(req.query);
    const result = await listRecords(
      {
        type: req.query.type,
        category: req.query.category,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search
      },
      pagination
    );

    res.json(result);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const record = await getRecordById(req.params.id);
    res.json({ item: record });
  })
);

router.post(
  "/",
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    validateRecordPayload(req.body || {});
    const record = await createRecord(req.body, req.user.id);
    res.status(201).json({ item: record });
  })
);

router.patch(
  "/:id",
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    validateRecordPayload(req.body || {}, { partial: true });
    const record = await updateRecord(req.params.id, req.body);
    res.json({ item: record });
  })
);

router.delete(
  "/:id",
  authorize(ROLES.ADMIN),
  asyncHandler(async (req, res) => {
    const record = await deleteRecord(req.params.id);
    res.json({ item: record });
  })
);

module.exports = router;
