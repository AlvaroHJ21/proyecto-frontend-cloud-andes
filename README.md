# TaskFlow — Frontend

Interfaz React, TypeScript, Vite y Tailwind para iniciar sesión, administrar tareas y editar el perfil.
Este repositorio se despliega de manera independiente del backend.

## Arquitectura prevista

Navegador → frontend en AWS Amplify Hosting → API HTTPS en Elastic Beanstalk → MySQL en RDS.
El despliegue en AWS está pendiente de configurar y verificar.

## Desarrollo local

Desde este repositorio:

```bash
# Instala las versiones fijadas en package-lock.json.
npm ci
# Crea la configuración local; ejecutar solo si todavía no existe .env.
cp .env.example .env
# Inicia Vite para desarrollar con recarga de cambios.
npm run dev
```

Configura `VITE_API_URL` en `.env` con la URL del backend, por ejemplo
`http://localhost:3000/api`. Incluye `/api` y omite la barra final.
El backend y MySQL deben estar disponibles para iniciar sesión.

`VITE_API_URL` se incorpora al JavaScript durante la construcción: cambiarla requiere
un nuevo build. Las variables `VITE_` son públicas; no deben contener secretos.

## Construcción

```bash
# Genera HTML, CSS y JavaScript estáticos en dist/.
npm run build
```

Para la futura configuración de Amplify: instalación `npm ci`, construcción
`npm run build`, salida `dist` y variable `VITE_API_URL` apuntando a la API HTTPS.

El archivo `amplify.yml` guarda esa configuración dentro del repositorio. En la
consola de Amplify se debe crear `VITE_API_URL` con una dirección como
`https://api.ejemplo.com/api`, sin barra final. Vite incorpora su valor durante
el build, por lo que cambiar la variable requiere iniciar un nuevo despliegue.

| Parámetro de `amplify.yml` | Motivo |
| --- | --- |
| `version: 1` | Selecciona el formato de build reconocido por Amplify |
| `preBuild` | Instala dependencias antes de compilar |
| `npm ci` | Respeta exactamente `package-lock.json` |
| `baseDirectory: dist` | Publica el directorio generado por Vite |
| `files: "**/*"` | Incluye todos los recursos estáticos del build |
| `cache.paths: .npm/**/*` | Reutiliza descargas de npm entre ejecuciones |

El Dockerfile sirve el build con Nginx. Su configuración hace proxy de `/api/` al
servicio `backend:3000`, por lo que está preparada para el Docker Compose de la
carpeta de trabajo común. Amplify servirá los archivos estáticos de `dist`.

## Archivos relevantes

- `src/App.tsx`: pantallas, formularios y estado de la interfaz.
- `src/api.ts`: peticiones HTTP y almacenamiento del token de sesión.
- `.env.example`: plantilla pública de configuración.
- `.gitignore`: excluye configuración local, dependencias y archivos generados.

## Verificación local realizada

Se comprobó el login en el navegador y la recuperación de sesión y tareas al
recargar. Las operaciones de tareas y perfil también se probaron mediante la API
pasando por el proxy de Nginx.

URL pública de Amplify: pendiente.

## Componentes shadcn/ui

Integramos `Button`, `Input` y `Textarea` desde el registro oficial, estilo
`new-york`, tipados con TypeScript para React 18 y Tailwind 4. Su código vive en
`src/components/ui/` y se utiliza en login, tareas y perfil. El selector de estado utiliza `Select` de shadcn.

`Button` recibe `variant`: `default` para acciones principales, `outline` para
acciones discretas, `secondary` para completar/reabrir y `destructive` para eliminar.
`size` selecciona las dimensiones (`sm`, `default`, `lg`); `asChild` permite aplicar
el comportamiento a un hijo, aunque todavía no lo usamos. `className` adapta el
estilo y `ref` permite acceder al elemento, por ejemplo para enfocarlo.

Las dependencias nuevas tienen propósitos concretos: `radix-ui` aporta primitivas
accesibles para Tabs, Select y Slot; `class-variance-authority` organiza variantes;
`cn` combina clases; `lucide-react` aporta los iconos usados por Select.

Los JSON de shadcn no admiten comentarios; sus parámetros se explican aquí.
`tsconfig.json` sí permite comentarios y también los incluye:

| Archivo / parámetro | Motivo |
| --- | --- |
| `components.json`: `$schema` | Valida la configuración de shadcn en el editor |
| `style: new-york` | Selecciona la familia visual del registro |
| `rsc: false` | Usamos React en el navegador, sin Server Components |
| `tsx: true` | Los nuevos componentes se generan en TypeScript/TSX |
| `tailwind.config: ""` y `tailwind.css` | Tailwind 4 se configura en el CSS indicado |
| `baseColor: neutral` | Selecciona el tema neutral oficial |
| `cssVariables: true` | Centraliza colores del tema en variables CSS |
| `prefix: ""` | Las clases Tailwind no tienen prefijo personalizado |
| `aliases` | Define dónde guardar componentes, utilidades y futuros hooks |
| `tsconfig.json`: `baseUrl` | Resuelve rutas desde la raíz del frontend |
| `paths: @/* → ./src/*` | Enseña al editor el mismo alias configurado en Vite |
| `include: src, vite.config.ts` | Comprueba el código fuente y la configuración de Vite |

Guía oficial compatible con este proyecto: [shadcn/ui con Vite](https://ui.shadcn.com/docs/installation/vite).

## TypeScript

El frontend usa comprobación estricta. `src/types.ts` describe usuarios, tareas,
resúmenes y respuestas HTTP; `TaskInput` contiene los campos editables y `Task`
agrega los campos que devuelve el servidor. `TaskStatus` limita los estados a
`pending` y `completed`. Las fechas de la API se tipan como `string` porque viajan
serializadas en JSON.

```bash
# Revisa los tipos sin generar archivos: noEmit deja la construcción a Vite.
npm run typecheck
# Comprueba tipos y, solo si pasan, genera la aplicación estática.
npm run build
```

`strict` exige manejar valores nulos, parámetros y errores de tipo `unknown`.
`RequestInit` tipa las opciones de fetch y el genérico `request<T>` indica la forma
esperada de cada respuesta. La conversión del JSON a `T` es un contrato estático:
no valida datos HTTP durante la ejecución. El backend mantiene sus validaciones.

`typescript` aporta el compilador; `@types/react` y `@types/react-dom` describen
componentes, eventos y montaje; `@types/node` describe las APIs que utiliza Vite.
Son dependencias de desarrollo: el navegador recibe JavaScript compilado.

Los archivos con JSX usan `.tsx`; tipos y utilidades usan `.ts`.
`vite-env.d.ts` declara la variable pública `VITE_API_URL`. Los parámetros del
compilador se explican junto a su configuración en `tsconfig.json`.

## Tailwind 4 y componentes oficiales

Los componentes se generaron mediante la CLI oficial más reciente:

```bash
# --yes evita preguntas interactivas; --overwrite regenera los componentes existentes para Tailwind 4.
npx --yes shadcn@latest add card badge tabs skeleton select button input textarea --yes --overwrite
```

`Card` estructura login, resumen, formulario de tareas, lista y perfil. `Badge`
comunica el estado con variantes oficiales. `Tabs` sustituye la navegación manual:
`defaultValue="tasks"` abre Tareas y los `value` enlazan pestañas y paneles.
`Select` sustituye el selector HTML; `value` y `onValueChange` sincronizan el estado
con el formulario y `id` lo asocia con su etiqueta. `Skeleton` se muestra mientras
se recuperan sesión y tareas, sin demoras artificiales; `aria-busy` indica la espera.

Tailwind 4 se integra mediante `@tailwindcss/vite` en `vite.config.ts`.
`src/styles.css` importa Tailwind y `tw-animate-css`, declara los colores OKLCH del
[tema neutral oficial](https://ui.shadcn.com/r/colors/neutral.json) y los expone con
`@theme inline`. Los radios también provienen del tema. Se retiraron las antiguas
configuraciones de Tailwind y PostCSS, y los plugins que ya no se utilizan.

`tw-animate-css` aporta transiciones del desplegable; Radix administra el foco y
la interacción de Select y Tabs; Lucide aporta los iconos generados por shadcn.
Los parámetros importantes tienen comentarios en el código o en esta guía.

## Tema claro, oscuro y del sistema

`ThemeProvider` sigue inicialmente la apariencia del sistema y guarda la selección
en `localStorage` bajo `taskflow-ui-theme`. La clase `dark` se aplica al elemento
`html`, donde Tailwind activa los tokens oscuros generados por shadcn.

`ModeToggle` sigue el patrón de la documentación de shadcn para Vite: un `Button`
abre un `DropdownMenu` con Claro, Oscuro y Sistema. `asChild` reutiliza el botón como
disparador y `align="end"` alinea el menú con su borde derecho. `sideOffset={8}`
separa el panel del botón. `portalled={false}` mantiene este menú junto al disparador
porque el navegador integrado abre el Portal de Radix, pero no llega a dibujarlo.
El componente conserva `portalled=true` como valor predeterminado. La opción Sistema
también reacciona a cambios de apariencia de macOS mientras TaskFlow está abierto.

Guía utilizada: [modo oscuro de shadcn para Vite](https://ui.shadcn.com/docs/dark-mode/vite).
