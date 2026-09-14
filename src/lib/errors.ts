// catch recibe unknown: solo leemos message si el valor realmente es un Error.
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "No se pudo completar la operación.";
}
