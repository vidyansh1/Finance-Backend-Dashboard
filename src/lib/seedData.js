module.exports = {
  seedUsers: [
    {
      name: "System Admin",
      email: "admin@finance.local",
      passwordHash: "$2b$10$aIfjA/kEbrWhtIC0j.D4NOc.cfMSaXn0TjJNfeHeXv4vL/kr.d1Yy",
      role: "admin",
      status: "active"
    },
    {
      name: "Data Analyst",
      email: "analyst@finance.local",
      passwordHash: "$2b$10$iKQmBAZWsh2eyBVmVv.qc.TXkTN/YfFMFYpuScUY10qPW14jzbJsy",
      role: "analyst",
      status: "active"
    },
    {
      name: "Dashboard Viewer",
      email: "viewer@finance.local",
      passwordHash: "$2b$10$xHXYjNGpTTp3pFTKmT05ruFix8BFx/PT37acMvfb0yCFPF9LV8RFm",
      role: "viewer",
      status: "active"
    },
    {
      name: "Inactive Analyst",
      email: "inactive@finance.local",
      passwordHash: "$2b$10$iKQmBAZWsh2eyBVmVv.qc.TXkTN/YfFMFYpuScUY10qPW14jzbJsy",
      role: "analyst",
      status: "inactive"
    }
  ],
  seedRecords: [
    {
      amount: 5600,
      type: "income",
      category: "Salary",
      date: "2026-03-01",
      notes: "Monthly salary credit",
      createdByEmail: "admin@finance.local"
    },
    {
      amount: 850,
      type: "expense",
      category: "Rent",
      date: "2026-03-03",
      notes: "Office rent contribution",
      createdByEmail: "admin@finance.local"
    },
    {
      amount: 420,
      type: "expense",
      category: "Utilities",
      date: "2026-03-08",
      notes: "Internet and electricity",
      createdByEmail: "admin@finance.local"
    },
    {
      amount: 1200,
      type: "income",
      category: "Consulting",
      date: "2026-03-16",
      notes: "Freelance consulting payment",
      createdByEmail: "admin@finance.local"
    },
    {
      amount: 275,
      type: "expense",
      category: "Marketing",
      date: "2026-03-22",
      notes: "Campaign design tools",
      createdByEmail: "admin@finance.local"
    }
  ]
};
