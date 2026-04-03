const mongoose = require("mongoose");
const { HttpError } = require("../lib/httpError");
const Record = require("../models/Record");

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildFilterQuery(filters) {
  const query = {};

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.category) {
    query.category = new RegExp(`^${escapeRegex(filters.category)}$`, "i");
  }

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = filters.startDate;
    if (filters.endDate) query.date.$lte = filters.endDate;
  }

  if (filters.search) {
    query.$or = [
      { category: new RegExp(escapeRegex(filters.search), "i") },
      { notes: new RegExp(escapeRegex(filters.search), "i") }
    ];
  }

  return query;
}

async function listRecords(filters = {}, pagination = { page: 1, limit: 10 }) {
  const start = (pagination.page - 1) * pagination.limit;
  const query = buildFilterQuery(filters);

  const [items, totalItems] = await Promise.all([
    Record.find(query)
      .populate("createdBy", "name email role")
      .sort({ date: -1, createdAt: -1 })
      .skip(start)
      .limit(pagination.limit),
    Record.countDocuments(query)
  ]);

  return {
    items,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pagination.limit))
    }
  };
}

async function getRecordById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(404, "Record not found.");
  }

  const record = await Record.findById(id).populate("createdBy", "name email role");
  if (!record) {
    throw new HttpError(404, "Record not found.");
  }
  return record;
}

async function createRecord(payload, userId) {
  return Record.create({
    amount: payload.amount,
    type: payload.type,
    category: payload.category.trim(),
    date: payload.date,
    notes: payload.notes?.trim() || "",
    createdBy: userId
  });
}

async function updateRecord(id, payload) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(404, "Record not found.");
  }

  const record = await Record.findById(id);
  if (!record) {
    throw new HttpError(404, "Record not found.");
  }

  if (payload.amount !== undefined) record.amount = payload.amount;
  if (payload.type) record.type = payload.type;
  if (payload.category) record.category = payload.category.trim();
  if (payload.date) record.date = payload.date;
  if (payload.notes !== undefined) record.notes = payload.notes.trim();

  await record.save();
  return record;
}

async function deleteRecord(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(404, "Record not found.");
  }

  const deleted = await Record.findByIdAndDelete(id);
  if (!deleted) {
    throw new HttpError(404, "Record not found.");
  }

  return deleted;
}

async function buildDashboardSummary({ startDate, endDate } = {}) {
  const match = buildFilterQuery({ startDate, endDate });
  const [totalsAgg, categoryTotals, monthlyTrends, recentActivity] = await Promise.all([
    Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" }
        }
      }
    ]),
    Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $toLower: "$category" },
          category: { $first: "$category" },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { total: -1 } },
      {
        $project: {
          _id: 0,
          category: 1,
          income: 1,
          expense: 1,
          total: 1
        }
      }
    ]),
    Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "income"] }, "$amount", 0]
            }
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          period: "$_id",
          income: 1,
          expense: 1,
          net: { $subtract: ["$income", "$expense"] }
        }
      }
    ]),
    Record.find(match)
      .populate("createdBy", "name email role")
      .sort({ date: -1, createdAt: -1 })
      .limit(5)
  ]);

  const totalIncome = totalsAgg.find((item) => item._id === "income")?.total || 0;
  const totalExpenses = totalsAgg.find((item) => item._id === "expense")?.total || 0;

  return {
    totals: {
      income: totalIncome,
      expenses: totalExpenses,
      netBalance: totalIncome - totalExpenses
    },
    categoryTotals,
    monthlyTrends,
    recentActivity
  };
}

module.exports = {
  listRecords,
  getRecordById,
  createRecord,
  updateRecord,
  deleteRecord,
  buildDashboardSummary
};
