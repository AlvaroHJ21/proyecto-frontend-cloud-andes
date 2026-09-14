// Variable pública opcional: si falta, el cliente usa /api para el proxy local.
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
