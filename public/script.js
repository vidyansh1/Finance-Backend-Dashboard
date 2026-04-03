const state = {
  token: "",
  user: null
};

const authStatus = document.getElementById("auth-status");
const adminPanel = document.getElementById("admin-panel");
const recordStatus = document.getElementById("record-status");
const recordsBody = document.getElementById("records-body");
const recordsNote = document.getElementById("records-note");
const categoryList = document.getElementById("category-list");
const recentList = document.getElementById("recent-list");

function money(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function setStatus(message, isError = false) {
  authStatus.textContent = message;
  authStatus.className = isError ? "error-text" : "muted";
}

function setRecordStatus(message, isError = false) {
  recordStatus.textContent = message;
  recordStatus.className = isError ? "error-text" : "muted";
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Request failed");
  }
  return data;
}

function renderSummary(summary) {
  document.getElementById("income-total").textContent = money(summary.totals.income);
  document.getElementById("expense-total").textContent = money(summary.totals.expenses);
  document.getElementById("net-total").textContent = money(summary.totals.netBalance);

  categoryList.innerHTML = "";
  if (!summary.categoryTotals.length) {
    categoryList.innerHTML = '<li class="empty">No categories found.</li>';
  } else {
    summary.categoryTotals.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.category}: ${money(item.total)}`;
      categoryList.appendChild(li);
    });
  }

  recentList.innerHTML = "";
  if (!summary.recentActivity.length) {
    recentList.innerHTML = '<li class="empty">No recent activity.</li>';
  } else {
    summary.recentActivity.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.date} - ${item.category} - ${money(item.amount)}`;
      recentList.appendChild(li);
    });
  }
}

function renderRecords(records) {
  recordsBody.innerHTML = "";

  if (!records.length) {
    recordsBody.innerHTML = '<tr><td colspan="5" class="empty">No records found.</td></tr>';
    return;
  }

  records.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.date}</td>
      <td>${item.type}</td>
      <td>${item.category}</td>
      <td>${money(item.amount)}</td>
      <td>${item.notes || "-"}</td>
    `;
    recordsBody.appendChild(row);
  });
}

async function loadDashboard() {
  const summary = await api("/api/dashboard/summary");
  renderSummary(summary);
}

async function loadRecords() {
  if (state.user?.role === "viewer") {
    recordsBody.innerHTML = '<tr><td colspan="5" class="empty">Viewer role cannot open records.</td></tr>';
    recordsNote.textContent = "Viewer can only see summary data.";
    return;
  }

  const type = document.getElementById("filter-type").value;
  const category = document.getElementById("filter-category").value.trim();
  const search = document.getElementById("filter-search").value.trim();

  const params = new URLSearchParams();
  if (type) params.set("type", type);
  if (category) params.set("category", category);
  if (search) params.set("search", search);

  const result = await api(`/api/records?${params.toString()}`);
  renderRecords(result.items);
  recordsNote.textContent = `Showing ${result.items.length} of ${result.pagination.totalItems} record(s).`;
}

async function loadAll() {
  if (!state.token) {
    return;
  }

  await loadDashboard();
  await loadRecords();
  adminPanel.classList.toggle("hidden", state.user?.role !== "admin");
}

document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const result = await api("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });

    state.token = result.token;
    state.user = result.user;
    setStatus(`Logged in as ${result.user.name} (${result.user.role})`);
    await loadAll();
  } catch (error) {
    setStatus(error.message, true);
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  state.token = "";
  state.user = null;
  setStatus("Logged out");
  setRecordStatus("");
  adminPanel.classList.add("hidden");
  recordsNote.textContent = "Login to load records.";
  recordsBody.innerHTML = '<tr><td colspan="5" class="empty">No data loaded.</td></tr>';
  categoryList.innerHTML = "";
  recentList.innerHTML = '<li class="empty">Nothing to show yet.</li>';
  document.getElementById("income-total").textContent = "-";
  document.getElementById("expense-total").textContent = "-";
  document.getElementById("net-total").textContent = "-";
});

document.getElementById("load-btn").addEventListener("click", async () => {
  try {
    await loadAll();
    setStatus(state.user ? `Data refreshed for ${state.user.name}` : "Please login first", !state.user);
  } catch (error) {
    setStatus(error.message, true);
  }
});

document.getElementById("filter-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await loadRecords();
  } catch (error) {
    recordsNote.textContent = error.message;
  }
});

document.getElementById("record-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const payload = {
      amount: Number(document.getElementById("record-amount").value),
      type: document.getElementById("record-type").value,
      category: document.getElementById("record-category").value.trim(),
      date: document.getElementById("record-date").value,
      notes: document.getElementById("record-notes").value.trim()
    };

    await api("/api/records", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    document.getElementById("record-form").reset();
    setRecordStatus("Record created successfully.");
    await loadAll();
  } catch (error) {
    setRecordStatus(error.message, true);
  }
});
