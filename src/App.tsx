import React, { useEffect, useState } from "react";
import { api, clearToken, getToken, saveToken } from "./api";

// Controles compartidos: centralizan estilo, foco y estado deshabilitado.
// variant distingue acciones principales, secundarias y destructivas; size ajusta su tamaño.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { ModeToggle } from "@/components/mode-toggle";

// Los contratos compartidos describen datos de API, formularios y estados permitidos.
import type { User, Task, TaskInput, TaskSummary, TaskStatus, ProfileInput } from "./types";
import { getErrorMessage } from "./lib/errors";

// Cada componente declara los datos y callbacks que necesita de su padre.
type LoginProps = { error: string; onLogin: (email: string, password: string) => Promise<void> };
type TasksProps = { tasks: Task[]; onRefresh: () => Promise<void> };
type ProfileProps = { user: User; setUser: (user: User) => void };
type DashboardProps = TasksProps & ProfileProps & { summary: TaskSummary; onLogout: () => void };
type StatProps = { label: string; value: number };

const emptyTask: TaskInput = {
  title: "",
  description: "",
  status: "pending"
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<TaskSummary>({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState("");

  async function loadSession() {
    try {
      const data = await api.me();
      setUser(data.user);
      await loadTasks();
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks() {
    const data = await api.listTasks();
    setTasks(data.tasks);
    setSummary(data.summary);
  }

  useEffect(() => {
    if (getToken()) {
      loadSession();
    } else {
      setLoading(false);
    }
  }, []);

  async function handleLogin(email: string, password: string) {
    setError("");
    try {
      const data = await api.login(email, password);
      saveToken(data.token);
      setUser(data.user);
      await loadTasks();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function handleLogout() {
    clearToken();
    setUser(null);
    setTasks([]);
    setSummary({ total: 0, pending: 0, completed: 0 });
  }

  // Skeleton representa la espera real de sesión y datos; no se agrega un retraso artificial.
  if (loading) return <DashboardSkeleton />;

  if (!user) {
    return <LoginPage error={error} onLogin={handleLogin} />;
  }

  return (
    <Dashboard
      user={user}
      setUser={setUser}
      tasks={tasks}
      summary={summary}
      onRefresh={loadTasks}
      onLogout={handleLogout}
    />
  );
}

function LoginPage({ error, onLogin }: LoginProps) {
  const [email, setEmail] = useState("demo@taskflow.local");
  const [password, setPassword] = useState("TaskFlow123");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    await onLogin(email, password);
    setSubmitting(false);
  }

  return (
    <main className="relative min-h-screen bg-background">
      <div className="absolute right-6 top-6">
        <ModeToggle />
      </div>
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="text-foreground">
          <h1 className="text-5xl font-black tracking-tight sm:text-6xl">
            TaskFlow
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            Organiza tus pendientes, revisa tu avance y mantén tus tareas al día
            desde un solo lugar.
          </p>
          <p className="mt-3 max-w-xl text-base leading-8 text-muted-foreground">
            Proyecto desarrollado para ANDES.
          </p>
        </section>

        <Card>
          <CardHeader><CardTitle><h2>Iniciar sesión</h2></CardTitle></CardHeader>
          <CardContent>

          <form className="space-y-5" onSubmit={submit}>
            <label className="block">
              <span className="text-sm font-semibold text-foreground">Correo</span>
              <Input
                className="mt-2"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-foreground">
                Contraseña
              </span>
              <Input
                className="mt-2"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error && (
              <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
                {error}
              </div>
            )}

            <Button
              className="w-full" size="lg"
              disabled={submitting}
            >
              {submitting ? "Ingresando..." : "Entrar"}
            </Button>
          </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function Dashboard({ user, setUser, tasks, summary, onRefresh, onLogout }: DashboardProps) {

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-sm font-semibold text-primary">TaskFlow</p>
            <h1 className="text-xl font-black text-foreground">
              Panel de tareas
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <span className="hidden text-sm text-muted-foreground sm:block">
              {user.name}
            </span>
            <Button
              variant="outline"
              onClick={onLogout}
            >
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total de tareas" value={summary.total} />
          <StatCard label="Pendientes" value={summary.pending} />
          <StatCard label="Completadas" value={summary.completed} />
        </section>

        {/* defaultValue abre Tareas; cada value enlaza su disparador con el panel accesible. */}
        <Tabs defaultValue="tasks" className="mt-8">
          <TabsList aria-label="Secciones del panel">
            <TabsTrigger value="tasks">Tareas</TabsTrigger>
            <TabsTrigger value="profile">Perfil</TabsTrigger>
          </TabsList>
          <TabsContent value="tasks" className="mt-6">
            <TasksPanel tasks={tasks} onRefresh={onRefresh} />
          </TabsContent>
          <TabsContent value="profile" className="mt-6">
            <ProfilePanel user={user} setUser={setUser} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function TasksPanel({ tasks, onRefresh }: TasksProps) {
  const [form, setForm] = useState<TaskInput>(emptyTask);
  const [editingId, setEditingId] = useState<Task["id"] | null>(null);
  const [error, setError] = useState("");


  function startEdit(task: Task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyTask);
    setError("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.updateTask(editingId, form);
      } else {
        await api.createTask(form);
      }
      resetForm();
      await onRefresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function toggleStatus(task: Task) {
    await api.updateTask(task.id, {
      ...task,
      status: task.status === "completed" ? "pending" : "completed"
    });
    await onRefresh();
  }

  async function deleteTask(task: Task) {
    await api.deleteTask(task.id);
    await onRefresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <CardHeader><CardTitle><h2>{editingId ? "Editar tarea" : "Nueva tarea"}</h2></CardTitle></CardHeader>
        <CardContent><form className="space-y-4" onSubmit={submit}>
          <label className="block">
            <span className="text-sm font-semibold text-foreground">Título</span>
            <Input
              className="mt-2"
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="Ej. Revisar logs en CloudWatch"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Descripción
            </span>
            <Textarea
              className="mt-2 min-h-28"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value
                }))
              }
              placeholder="Detalle breve de la tarea"
            />
          </label>

          <div className="space-y-2">
            <label htmlFor="task-status" className="text-sm font-medium">Estado</label>
            {/* value mantiene el formulario controlado; validamos la cadena recibida por Radix. */}
            <Select value={form.status} onValueChange={(value) => {
              if (value === "pending" || value === "completed") {
                setForm((current) => ({ ...current, status: value }));
              }
            }}>
              <SelectTrigger id="task-status" className="w-full">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="completed">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button size="lg">
              {editingId ? "Guardar cambios" : "Crear tarea"}
            </Button>
            {editingId && (
              <Button
                variant="outline" size="lg"
                type="button"
                onClick={resetForm}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form></CardContent>
      </Card>

      <Card>
        <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-foreground">Mis tareas</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Crea, completa o edita tareas desde la API REST.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={onRefresh}
          >
            Actualizar
          </Button>
        </div>

        <div className="mt-5 space-y-3">
          {tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No hay tareas registradas.
            </div>
          )}

          {tasks.map((task) => (
            <article
              className="rounded-xl border border-border p-4 transition hover:bg-muted/50"
              key={task.id}
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-foreground">{task.title}</h3>
                    <StatusBadge status={task.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {task.description || "Sin descripción."}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Creada: {formatDate(task.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary" size="sm"
                    onClick={() => toggleStatus(task)}
                  >
                    {task.status === "completed" ? "Reabrir" : "Completar"}
                  </Button>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => startEdit(task)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive" size="sm"
                    onClick={() => deleteTask(task)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProfilePanel({ user, setUser }: ProfileProps) {
  const [form, setForm] = useState<ProfileInput>({ name: user.name, email: user.email });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const data = await api.updateProfile(form);
      setUser(data.user);
      setMessage("Perfil actualizado correctamente.");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle><h2>Perfil</h2></CardTitle></CardHeader>
      <CardContent><form className="space-y-4" onSubmit={submit}>
        <label className="block">
          <span className="text-sm font-semibold text-foreground">Nombre</span>
          <Input
            className="mt-2"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold text-foreground">Correo</span>
          <Input
            className="mt-2"
            type="email"
            value={form.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
          />
        </label>

        {message && (
          <div className="rounded-xl bg-muted px-4 py-3 text-sm font-medium text-foreground">
            {message}
          </div>
        )}
        {error && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        <Button size="lg">
          Guardar perfil
        </Button>
      </form></CardContent>
    </Card>
  );
}

// Card separa estructura y contenido; los colores y bordes provienen del tema oficial.
function StatCard({ label, value }: StatProps) {
  return (
    <Card>
      <CardHeader><CardDescription>{label}</CardDescription></CardHeader>
      <CardContent><strong className="text-4xl font-semibold">{value}</strong></CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  // Variantes oficiales: el texto también comunica el estado sin depender del color.
  return <Badge variant={status === "completed" ? "default" : "secondary"}>
    {status === "completed" ? "Completada" : "Pendiente"}
  </Badge>;
}

function DashboardSkeleton() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl space-y-8 px-6 py-8" aria-busy="true" aria-label="Cargando TaskFlow">
      {/* El texto anuncia la carga; las figuras decorativas se ocultan al lector de pantalla. */}
      <p role="status" className="sr-only">Cargando TaskFlow...</p>
      <div aria-hidden="true" className="space-y-8">
        <Skeleton className="h-10 w-52" />
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((index) => <Card key={index}><CardContent className="space-y-4">
            <Skeleton className="h-4 w-32" /><Skeleton className="h-10 w-16" />
          </CardContent></Card>)}
        </div>
        <Skeleton className="h-9 w-44" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96 w-full" /><Skeleton className="h-96 w-full" />
        </div>
      </div>
    </main>
  );
}

function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("es-PE", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export default App;
