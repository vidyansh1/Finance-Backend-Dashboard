const { HttpError } = require("./httpError");
const { ROLES, USER_STATUSES } = require("../config");

function assert(condition, message, status = 400, details) {
  if (!condition) {
    throw new HttpError(status, message, details);
  }
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

function validateEmail(email) {
  assert(typeof email === "string" && email.includes("@"), "A valid email is required.");
}

function validatePassword(password) {
  assert(typeof password === "string" && password.length >= 6, "Password must be at least 6 characters long.");
}

function validateUserPayload(payload, { partial = false } = {}) {
  if (!partial || payload.name !== undefined) {
    assert(typeof payload.name === "string" && payload.name.trim().length >= 2, "Name must be at least 2 characters long.");
  }

  if (!partial || payload.email !== undefined) {
    validateEmail(payload.email);
  }

  if (!partial || payload.password !== undefined) {
    validatePassword(payload.password);
  }

  if (!partial || payload.role !== undefined) {
    assert(Object.values(ROLES).includes(payload.role), "Role must be one of admin, analyst, or viewer.");
  }

  if (payload.status !== undefined) {
    assert(Object.values(USER_STATUSES).includes(payload.status), "Status must be active or inactive.");
  }
}

function validateRecordPayload(payload, { partial = false } = {}) {
  if (!partial || payload.amount !== undefined) {
    assert(typeof payload.amount === "number" && Number.isFinite(payload.amount) && payload.amount > 0, "Amount must be a positive number.");
  }

  if (!partial || payload.type !== undefined) {
    assert(payload.type === "income" || payload.type === "expense", "Type must be income or expense.");
  }

  if (!partial || payload.category !== undefined) {
    assert(typeof payload.category === "string" && payload.category.trim().length >= 2, "Category must be at least 2 characters long.");
  }

  if (!partial || payload.date !== undefined) {
    assert(typeof payload.date === "string" && isValidDate(payload.date), "Date must be in YYYY-MM-DD format.");
  }

  if (payload.notes !== undefined) {
    assert(typeof payload.notes === "string" && payload.notes.length <= 250, "Notes must be a string up to 250 characters.");
  }
}

function validatePagination(query) {
  const page = query.page ? Number(query.page) : 1;
  const limit = query.limit ? Number(query.limit) : 10;

  assert(Number.isInteger(page) && page > 0, "Page must be a positive integer.");
  assert(Number.isInteger(limit) && limit > 0 && limit <= 100, "Limit must be an integer between 1 and 100.");

  return { page, limit };
}

module.exports = {
  assert,
  validateUserPayload,
  validateRecordPayload,
  validatePagination
};
