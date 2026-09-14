import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "@/components/theme-provider";
import "./styles.css";

// Comprueba el contenedor HTML antes de montar React; evita asumir que siempre existe.
const root = document.getElementById("root");
if (!root) throw new Error("No se encontró el contenedor root de TaskFlow.");

createRoot(root).render(
  <React.StrictMode>
    {/* system respeta la apariencia del equipo; storageKey conserva la selección local. */}
    <ThemeProvider defaultTheme="system" storageKey="taskflow-ui-theme">
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
