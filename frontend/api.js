// api.js
// Central place for all communication with the Node.js/Express backend.
// Every component uses these functions instead of touching fetch() directly.

const API_BASE = "http://localhost:5000/api";

// ---- Token helpers ----
function getToken() {
  return localStorage.getItem("moderntech_token");
}

function setToken(token) {
  localStorage.setItem("moderntech_token", token);
}

function clearToken() {
  localStorage.removeItem("moderntech_token");
  localStorage.removeItem("moderntech_user");
}

function getStoredUser() {
  const raw = localStorage.getItem("moderntech_user");
  return raw ? JSON.parse(raw) : null;
}

function setStoredUser(user) {
  localStorage.setItem("moderntech_user", JSON.stringify(user));
}

// ---- Core request helper ----
// Adds the Authorization header automatically and throws a readable
// error (with the server's message) if the request fails.
async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(API_BASE + path, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    // No JSON body (e.g. some error pages) — leave data as null
  }

  if (!response.ok) {
    const message = (data && data.error) || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data;
}

// ---- Auth ----
async function login(email, password) {
  const data = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  setStoredUser(data.user);
  return data.user;
}

function logout() {
  clearToken();
}

// ---- Employees ----
function getEmployees() {
  return apiRequest("/employees");
}

function getEmployee(id) {
  return apiRequest(`/employees/${id}`);
}

function createEmployee(employee) {
  return apiRequest("/employees", {
    method: "POST",
    body: JSON.stringify(employee),
  });
}

function updateEmployee(id, employee) {
  return apiRequest(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(employee),
  });
}

function deleteEmployee(id) {
  return apiRequest(`/employees/${id}`, {
    method: "DELETE",
  });
}

// ---- Departments ----
function getDepartments() {
  return apiRequest("/departments");
}

// ---- Time off ----
function getTimeOffRequests() {
  return apiRequest("/timeoff");
}

function createTimeOffRequest(request) {
  return apiRequest("/timeoff", {
    method: "POST",
    body: JSON.stringify(request),
  });
}

function updateTimeOffStatus(id, status) {
  return apiRequest(`/timeoff/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

// Expose everything on a single global object so plain <script> tags
// (no bundler, same pattern as the rest of this project) can use it.
window.api = {
  getToken,
  getStoredUser,
  login,
  logout,
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getDepartments,
  getTimeOffRequests,
  createTimeOffRequest,
  updateTimeOffStatus,
};
