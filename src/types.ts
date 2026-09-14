// Contratos de la API: describen los datos esperados, sin validarlos durante la ejecución.
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// Unión literal: únicamente permite los estados admitidos por el backend.
export type TaskStatus = "pending" | "completed";

// Campos editables enviados al crear o modificar una tarea.
export interface TaskInput {
  title: string;
  description: string;
  status: TaskStatus;
}

// El servidor agrega identidad y fechas serializadas como texto JSON.
export interface Task extends TaskInput {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSummary {
  total: number;
  pending: number;
  completed: number;
}

// Solo nombre y correo pueden modificarse desde el formulario de perfil.
export type ProfileInput = Pick<User, "name" | "email">;
export interface UserResponse { user: User }
export interface LoginResponse extends UserResponse { token: string }
export interface TaskResponse { task: Task }
export interface TasksResponse { tasks: Task[]; summary: TaskSummary }
