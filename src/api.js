const API_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "taskflow_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "No se pudo completar la operación.");
  }

  return data;
}

export const api = {
  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  me: () => request("/auth/me"),
  getProfile: () => request("/profile"),
  updateProfile: (profile) =>
    request("/profile", {
      method: "PUT",
      body: JSON.stringify(profile)
    }),
  listTasks: () => request("/tasks"),
  createTask: (task) =>
    request("/tasks", {
      method: "POST",
      body: JSON.stringify(task)
    }),
  updateTask: (id, task) =>
    request(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task)
    }),
  deleteTask: (id) =>
    request(`/tasks/${id}`, {
      method: "DELETE"
    })
};
