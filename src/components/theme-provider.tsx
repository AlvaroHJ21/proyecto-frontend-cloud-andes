import { createContext, useContext, useEffect, useMemo, useState } from "react";

// system sigue la preferencia del sistema hasta que el usuario elige un tema explícito.
export type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "taskflow-ui-theme"
}: ThemeProviderProps) {
  // storageKey separa esta preferencia de otras aplicaciones guardadas en el navegador.
  const [theme, setThemeState] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(storageKey);
    return storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
      ? storedTheme
      : defaultTheme;
  });
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">(getSystemTheme);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    // Mantiene system sincronizado si macOS cambia de apariencia mientras la app está abierta.
    const updateSystemTheme = () => setSystemTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    // La variante dark de Tailwind responde a esta clase en el elemento html.
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme,
    setTheme: (nextTheme) => {
      localStorage.setItem(storageKey, nextTheme);
      setThemeState(nextTheme);
    }
  }), [resolvedTheme, storageKey, theme]);

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeProviderContext);
  if (!context) throw new Error("useTheme debe utilizarse dentro de ThemeProvider.");
  return context;
}
