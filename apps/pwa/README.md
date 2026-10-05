# Gestor de gastos 💰 - Progressive Web App (PWA)

Aplicación web progresiva (PWA) completa, moderna, responsive y orientada a la filosofía **Local-First**, diseñada para el control integral de las finanzas personales: registro de gastos e ingresos, administración de deudas y préstamos, seguimiento de metas de ahorro y monitoreo de presupuestos mensuales.

---

## 1. Objetivo General

Proporcionar a cualquier persona una herramienta financiera ágil, privada, accesible y funcional tanto en línea como sin conexión a internet. La aplicación resuelve la desorganización financiera mediante:

- **Conocimiento de gastos:** Clasificación por categorías con gráficos e indicadores de impacto.
- **Historial de movimientos:** Registro con soporte para métodos de pago, notas, búsqueda en tiempo real y filtros avanzados.
- **Control de deudas:** Gestión de cuentas por pagar (lo que debes) y por cobrar (lo que te deben), con historial de abonos parciales y fechas límite.
- **Metas de ahorro:** Visualización de metas con barras de porcentaje alcanzado, aportes periódicos y celebración al completarlas.
- **Presupuestos mensuales:** Asignación de límites por categoría con advertencias preventivas (80%) y alertas de sobregiro (100%).

---

## 2. Tecnologías Utilizadas

- **Core:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Empaquetador y Servidor:** [Vite 8](https://vitejs.dev/)
- **Progressive Web App:** [`vite-plugin-pwa`](https://vite-pwa-org.netlify.app/) con Workbox 7 y `workbox-window`
- **Enrutamiento:** [React Router 7](https://reactrouter.com/)
- **Almacenamiento Local:** **IndexedDB** nativo tipado con capa de abstracción desacoplada y fallback en memoria + **localStorage** para preferencias.
- **Estilos:** CSS Modular con variables de diseño (Design Tokens), arquitectura mobile-first, soporte para tema claro/oscuro y `prefers-reduced-motion`.
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Efectos:** `canvas-confetti` para celebración al completar metas.
- **Testing:** [Vitest 5](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) + JSDOM.
- **Calidad de Código:** ESLint 10 + TypeScript ESLint.

---

## 3. Requisitos Previos

- **Node.js:** Versión 18.x, 20.x o 22.x+ (recomendado Node 20 LTS o superior).
- **Gestor de paquetes:** `pnpm` (versión 9 o 12) o `npm` / `yarn`.

---

## 4. Instalación y Ejecución

### Clonar o ubicarse en el proyecto:
```bash
cd d:/gestor-gastos/apps/pwa
```

### Instalar dependencias:
```bash
pnpm install
# o con npm:
npm install
```

### Ejecutar en entorno de desarrollo:
```bash
pnpm run dev
# o con npm:
npm run dev
```
La aplicación estará disponible en `http://localhost:5173/` con recarga rápida (HMR).

### Ejecutar Pruebas Unitarias e Integración:
```bash
pnpm run test
# o con npm:
npm test
```

### Comprobación de Linter:
```bash
pnpm run lint
```

### Generación del Build de Producción:
```bash
pnpm run build
```
Este comando compilará TypeScript (`tsc -b`) y generará los archivos optimizados junto con el **Service Worker** y el **Web Manifest** en la carpeta `dist/`.

### Previsualizar el Build de Producción localmente:
```bash
pnpm run preview
```

---

## 5. Estructura del Proyecto

```text
apps/pwa/
├── public/
│   ├── favicon.svg                  # Favicon SVG vectorial
│   ├── robots.txt                   # Instrucciones para indexadores
│   ├── pwa-192x192.png              # Icono PWA estándar (192x192)
│   ├── pwa-512x512.png              # Icono PWA alta resolución (512x512)
│   └── apple-touch-icon.png         # Icono para dispositivos iOS Safari
├── src/
│   ├── components/
│   │   ├── common/                  # Componentes base reutilizables
│   │   │   ├── Button.tsx           # Botones con variantes y estados
│   │   │   ├── IconButton.tsx       # Botones de icono accesibles
│   │   │   ├── Input.tsx            # Inputs con validación y labels
│   │   │   ├── Select.tsx           # Selectores accesibles
│   │   │   ├── Textarea.tsx         # Áreas de texto multilínea
│   │   │   ├── Switch.tsx           # Interruptores toggle
│   │   │   ├── Card.tsx             # Tarjetas con elevación y bordes
│   │   │   ├── Badge.tsx            # Insignias de estado y categoría
│   │   │   ├── Modal.tsx            # Diálogos modales con foco atrapado
│   │   │   ├── Drawer.tsx           # Paneles inferiores móviles (Slide-up)
│   │   │   ├── ConfirmDialog.tsx    # Diálogos de confirmación destructiva
│   │   │   ├── DataTable.tsx        # Tabla responsive (tabla en PC, tarjetas en móvil)
│   │   │   ├── Pagination.tsx       # Paginación accesible
│   │   │   ├── SearchBar.tsx        # Barra de búsqueda en vivo con limpiar
│   │   │   └── FilterPanel.tsx      # Filtros colapsables (tipo, fecha, categoría)
│   │   ├── feedback/                # Indicadores de estado y feedback
│   │   │   ├── Alert.tsx            # Avisos contextuales
│   │   │   ├── ToastContainer.tsx   # Notificaciones flotantes
│   │   │   ├── Loader.tsx           # Spinners y skeletons
│   │   │   ├── EmptyState.tsx       # Pantallas vacías accesibles
│   │   │   └── ErrorState.tsx       # Manejo visual de errores con reintento
│   │   ├── layout/                  # Estructura visual de la app
│   │   │   ├── AppLayout.tsx        # Layout maestro contenedor
│   │   │   ├── Header.tsx           # Cabecera fija con saldo y tema
│   │   │   ├── Sidebar.tsx          # Barra lateral de escritorio
│   │   │   └── BottomNavigation.tsx # Barra inferior táctil para móviles
│   │   └── pwa/                     # Elementos de Progressive Web App
│   │       ├── OfflineBanner.tsx    # Indicador de modo desconectado
│   │       ├── InstallAppButton.tsx # Botón/banner de instalación PWA
│   │       └── UpdateAvailableBanner.tsx # Aviso de actualización disponible
│   ├── context/
│   │   ├── ThemeContext.tsx         # Gestión de tema claro/oscuro
│   │   ├── ToastContext.tsx         # Sistema de alertas Toast
│   │   └── DataContext.tsx          # Estado reactivo global y operaciones
│   ├── hooks/
│   │   └── usePWA.ts                # Detección de conectividad e instalación PWA
│   ├── pages/                       # Vistas de la aplicación
│   │   ├── DashboardPage.tsx        # Resumen financiero y métricas KPI
│   │   ├── MovementsPage.tsx        # Historial con filtros y paginación
│   │   ├── MovementCreatePage.tsx   # Formulario con validación en tiempo real
│   │   ├── MovementDetailPage.tsx   # Detalle, compartir y acciones
│   │   ├── MovementEditPage.tsx     # Edición con detección de cambios sucios
│   │   ├── DebtsPage.tsx            # Por pagar / Por cobrar con abonos
│   │   ├── SavingsPage.tsx          # Metas de ahorro con confeti
│   │   ├── AnalyticsPage.tsx        # Límites de presupuesto y gráficos
│   │   ├── SettingsPage.tsx         # Preferencias, exportar/importar JSON
│   │   ├── HelpPage.tsx             # Preguntas frecuentes y guía
│   │   └── NotFoundPage.tsx         # Página 404 personalizada
│   ├── routes/
│   │   └── AppRoutes.tsx            # Definición de rutas con React Router
│   ├── services/
│   │   ├── db.ts                    # Cliente IndexedDB con fallback en memoria
│   │   ├── storageService.ts        # Capa desacoplada CRUD y datos Demo
│   │   └── settingsService.ts       # Preferencias en localStorage
│   ├── styles/
│   │   ├── variables.css            # Tokens de diseño y paletas HSL
│   │   ├── components.css           # Clases modulares de componentes
│   │   └── index.css                # Reset global y utilidades
│   ├── test/                        # Suite de pruebas unitarias
│   │   ├── setupTests.ts            # Mocks de entorno JSDOM
│   │   ├── formatters.test.ts       # Pruebas de formato de moneda y fecha
│   │   ├── theme.test.tsx           # Pruebas de cambio de tema
│   │   ├── crud.test.ts             # Pruebas de operaciones en IndexedDB
│   │   └── navigation.test.tsx      # Pruebas de renderizado y navegación
│   ├── types/
│   │   └── index.ts                 # Tipos TypeScript centralizados
│   ├── utils/
│   │   └── formatters.ts            # Formateadores de fecha y moneda
│   ├── App.tsx                      # Componente raíz con proveedores
│   └── main.tsx                     # Punto de entrada React 19
├── vite.config.ts                   # Configuración Vite + VitePWA
├── vitest.config.ts                 # Configuración del entorno de pruebas
├── tsconfig.json                    # Configuración TypeScript
└── package.json                     # Scripts y dependencias
```

---

## 6. Configuración PWA y Estrategia de Caché

La aplicación implementa `vite-plugin-pwa` configurado en `vite.config.ts`:

- **Registro automático:** `registerType: 'autoUpdate'`.
- **Precache:** Todos los recursos estáticos (`html`, `js`, `css`, `svg`, `png`, `woff2`) quedan almacenados en la caché del navegador para arranque instantáneo.
- **Estrategias de Caché con Workbox:**
  - **Imágenes:** Estrategia `CacheFirst` con expiración a 30 días o máximo 60 entradas.
  - **Scripts y Estilos:** Estrategia `StaleWhileRevalidate` para permitir uso inmediato mientras se actualizan en segundo plano.
  - **Navegación:** `navigateFallback: '/index.html'` garantizando que las rutas semánticas de React Router funcionen sin conexión.

---

## 7. Funcionamiento Offline (Sin Conexión)

1. **Almacenamiento Local-First:** Cada vez que creas, editas o eliminas un gasto, ingreso, deuda o meta, la operación se escribe inmediatamente en **IndexedDB**.
2. **Detección Automática de Conexión:** El hook `usePWA` escucha los eventos `window.online` y `window.offline`. Si se pierde la conexión, un banner informativo avisa amigablemente que la app está operando en modo local.
3. **Persistencia Garantizada:** Al no depender de una conexión HTTP constante para guardar cambios, el usuario puede trabajar en aviones, zonas rurales o subterráneos sin temor a perder información.

---

## 8. Guía de Instalación en Dispositivos

### En Computadores (Windows, macOS, Linux con Chrome o Edge):
1. Abre la aplicación en el navegador.
2. Verás el botón **"Instalar app"** en la cabecera, o el ícono de instalación en la barra de direcciones del navegador.
3. Haz clic en "Instalar". La aplicación se abrirá en una ventana independiente sin controles de navegador y creará un acceso directo en tu escritorio.

### En Dispositivos Móviles Android (Chrome / Edge):
1. Accede a la URL de la aplicación.
2. El navegador mostrará un banner inferior o podrás pulsar los tres puntos del menú del navegador y seleccionar **"Instalar aplicación"** / **"Agregar a la pantalla principal"**.
3. La app se integrará al menú de aplicaciones y funcionará como una aplicación nativa.

### En Dispositivos iOS (iPhone / iPad en Safari):
1. Abre la app en **Safari**.
2. Pulsa el botón **Compartir** (icono cuadrado con flecha hacia arriba).
3. Desplázate hacia abajo y selecciona **"Agregar al inicio"** (Add to Home Screen).
4. Asigna el nombre y pulsa "Agregar".

> **Nota sobre limitaciones en iOS:** Safari en iOS limita el almacenamiento de Service Workers e IndexedDB si el dispositivo tiene poco espacio o la app no se abre en semanas. Por esta razón, se recomienda usar la función **"Exportar copia JSON"** en Configuración de forma periódica.

---

## 9. Cómo Reemplazar el Almacenamiento Local por una API REST

La arquitectura de la aplicación está deliberadamente desacoplada a través de `src/services/storageService.ts`. Ningún componente de React interactúa directamente con IndexedDB.

Para conectar un backend real (por ejemplo Node.js/Express, Python/FastAPI, Go o Supabase):

1. Abre [`src/services/storageService.ts`](file:///d:/gestor-gastos/apps/pwa/src/services/storageService.ts).
2. Reemplaza las llamadas de `dbClient` por llamadas `fetch` o `axios` a tu API:
   ```ts
   // Ejemplo:
   async getMovements(filters?: MovementFilterOptions): Promise<Movement[]> {
     const params = new URLSearchParams(filters as any);
     const res = await fetch(`/api/movements?${params}`);
     return res.json();
   }
   ```
3. Ningún componente visual ni página requerirá cambios, ya que consumen la misma interfaz TypeScript (`Movement`, `Debt`, `SavingsGoal`, etc.).

---

## 10. Despliegue en Plataformas Cloud

### Vercel:
1. Conecta el repositorio de GitHub.
2. Configura el directorio raíz como `apps/pwa`.
3. Comando de build: `pnpm run build` o `npm run build`.
4. Directorio de salida: `dist`.

### Netlify:
1. Crea un nuevo sitio desde Git.
2. Base directory: `apps/pwa`.
3. Build command: `npm run build`.
4. Publish directory: `apps/pwa/dist`.
5. Para soportar el enrutamiento de React Router en recarga, crea un archivo `public/_redirects` con:
   ```text
   /*    /index.html   200
   ```

### GitHub Pages:
1. En `vite.config.ts`, define `base: '/nombre-del-repositorio/'`.
2. Ejecuta `pnpm run build`.
3. Publica la carpeta `dist` en la rama `gh-pages`.

---

## 11. Lista de Mejoras Futuras

- [ ] Sincronización en segundo plano (Background Sync) para encolar peticiones cuando vuelva el internet en arquitecturas con backend.
- [ ] Escaneo de facturas mediante cámara y OCR para auto-completar gastos.
- [ ] Exportación de reportes mensuales en formato PDF o Excel (XLSX).
- [ ] Múltiples billeteras o cuentas bancarias diferenciadas (Efectivo, Tarjeta 1, Tarjeta 2, Billetera digital).
- [ ] Notificaciones push locales de recordatorio para deudas próximas a vencer.
