import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Habilita la transformación de JSX y la actualización de componentes en desarrollo.
  // Tailwind 4 genera CSS directamente en Vite, sin configuración PostCSS adicional.
  plugins: [react(), tailwindcss()],
  resolve: {
    // @ apunta a src para que los componentes usen imports independientes de su profundidad.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) }
  }
});
