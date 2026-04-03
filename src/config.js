const JWT_SECRET = process.env.JWT_SECRET || "finance-assignment-secret";
const PORT = Number(process.env.PORT || 3000);
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/finance_dashboard_assignment";

const ROLES = {
  ADMIN: "admin",
  ANALYST: "analyst",
  VIEWER: "viewer"
};

const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive"
};

module.exports = {
  JWT_SECRET,
  MONGO_URI,
  PORT,
  ROLES,
  USER_STATUSES
};
