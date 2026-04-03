const express = require("express");
const path = require("path");
const { ROLES } = require("./config");
const { connectToDatabase } = require("./db/connect");
const { seedDatabase } = require("./db/seed");
const { authenticate, authorize } = require("./middleware/auth");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recordRoutes = require("./routes/recordRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

function jsonBodyParser(req, res, next) {
  if (req.method === "GET" || req.method === "DELETE") {
    req.body = {};
    next();
    return;
  }

  const contentType = req.headers["content-type"] || "";
  if (!contentType.includes("application/json")) {
    req.body = {};
    next();
    return;
  }

  let raw = "";
  req.setEncoding("utf8");
  req.on("data", (chunk) => {
    raw += chunk;
  });
  req.on("end", () => {
    if (!raw) {
      req.body = {};
      next();
      return;
    }

    try {
      req.body = JSON.parse(raw);
      next();
    } catch {
      res.status(400).json({
        error: {
          message: "Request body contains invalid JSON."
        }
      });
    }
  });
  req.on("error", next);
}

async function createApp() {
  await connectToDatabase();
  await seedDatabase();

  const app = express();
  app.use(jsonBodyParser);
  app.use(express.static(path.join(process.cwd(), "public")));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/users", authenticate, authorize(ROLES.ADMIN), userRoutes);
  app.use("/api/records", authenticate, authorize(ROLES.ADMIN, ROLES.ANALYST), recordRoutes);
  app.use("/api/dashboard", authenticate, authorize(ROLES.ADMIN, ROLES.ANALYST, ROLES.VIEWER), dashboardRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
