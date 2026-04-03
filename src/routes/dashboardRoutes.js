const express = require("express");
const { asyncHandler } = require("../middleware/asyncHandler");
const { buildDashboardSummary } = require("../services/recordService");

const router = express.Router();

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const summary = await buildDashboardSummary({
      startDate: req.query.startDate,
      endDate: req.query.endDate
    });

    res.json(summary);
  })
);

module.exports = router;
