import type { LoginResponse, UserResponse, TaskResponse, TasksResponse, TaskInput, ProfileInput, Task } from "./types";

const API_URL = import.meta.env.VITE_API_URL || "/api";
const TOKEN_KEY = "taskflow_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// T describe la respuesta esperada; RequestInit conserva los tipos nativos de fetch.
// Este contrato estático no sustituye la validación de datos del backend.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  // Headers acepta todos los formatos válidos de RequestInit.headers.
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers
  });

  // DELETE devuelve 204 sin cuerpo; su contrato público es Promise<void>.
  if (response.status === 204) return undefined as T;

  const data: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    // El cuerpo HTTP es desconocido: comprobamos message antes de mostrarlo.
    const message = typeof data === "object" && data !== null && "message" in data && typeof data.message === "string"
      ? data.message : "No se pudo completar la operación.";
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  me: () => request<UserResponse>("/auth/me"),
  getProfile: () => request<UserResponse>("/profile"),
  updateProfile: (profile: ProfileInput) =>
    request<UserResponse>("/profile", {
      method: "PUT",
      body: JSON.stringify(profile)
    }),
  listTasks: () => request<TasksResponse>("/tasks"),
  createTask: (task: TaskInput) =>
    request<TaskResponse>("/tasks", {
      method: "POST",
      body: JSON.stringify(task)
    }),
  updateTask: (id: Task["id"], task: TaskInput) =>
    request<TaskResponse>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(task)
    }),
  deleteTask: (id: Task["id"]) =>
    request<void>(`/tasks/${id}`, {
      method: "DELETE"
    })
};
