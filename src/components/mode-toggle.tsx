import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    // relative sirve como referencia para ubicar el panel debajo del botón.
    <div className="theme-menu-anchor relative">
    <DropdownMenu>
      {/* asChild evita crear un botón dentro de otro botón. */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          {/* La clase dark alterna ambos iconos sin desmontar el botón. */}
          <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      {/*
        align=end alinea el panel a la derecha; sideOffset deja espacio bajo el botón.
        theme-menu-anchor posiciona el contenedor interno de Radix bajo el botón.
        portalled=false evita el fallo de pintura de portales del navegador embebido.
      */}
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        portalled={false}
        className="z-[100] w-40 border border-border bg-popover text-popover-foreground shadow-lg"
      >
        <DropdownMenuItem onClick={() => setTheme("light")}>Claro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Oscuro</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>Sistema</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );
}
