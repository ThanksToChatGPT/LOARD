---
name: "Loard Construcciones - Hito 2 MVP"
description: "Sistema operativo de alta precisión para gestión de cortes de obra, dossier de calidad Chevron y control estricto de habilitación SST."
stack: "Django + DRF | React + TypeScript + Tailwind CSS | PostgreSQL | S3"
---

## 1. Overview

Sistema corporativo de misión crítica para **Loard Construcciones S.A.S.** Diseñado con una estética sobria, limpia y de ingeniería industrial con mínima saturación de color. La paleta se fundamenta en un **azul petróleo institucional** y en **neutros tintados de azul** (no grises), reservando los colores de estado estrictamente para estados funcionales (verde para validado/habilitado, ámbar para alertas preventivas/observaciones y carmín para bloqueos normativos). Se eliminan colores accesorios decorativos para evitar sobrecarga cognitiva en entornos operativos y de campo.

---

## 2. Colors & Semantic Tokens

- **Primary:** Azul petróleo profundo para encabezados y botones de confirmación primaria.
- **Nav:** Fondo propio del menú lateral, oscuro en ambos temas (`nav-surface`, `on-nav`, `on-nav-muted`, `nav-active`, `nav-indicator`).
- **Neutros:** Superficies, textos y bordes con tinte azul.
- **Success:** Verde bosque para ítems validados, cortes visados y personal SST habilitado (> 30 días de vigencia).
- **Warning:** Ámbar oscuro para alertas preventivas SST (30 y 15 días), plazo de dossier en riesgo, requisitos/cortes observados y aviso de sin conexión.
- **Error:** Carmín para bloqueo terminante de personal no habilitado/vencido y vencimiento del plazo de 10 días del dossier.
- **Info:** Azul para estados en curso (`En Revisión (Enviado)`, `Archivo Cargado`, sincronización).

```yaml
colors:
  light:
    primary: "#0B3C5D"
    primary-hover: "#072A42"
    on-primary: "#FFFFFF"
    surface: "#F4F8FB"
    on-surface: "#0A1F2E"
    on-surface-muted: "#1F4A66"
    surface-container: "#FFFFFF"
    surface-container-low: "#E8F0F6"
    surface-container-high: "#D3E2EC"
    outline: "#4F7A96"          # bordes de controles interactivos (≥ 3:1)
    outline-variant: "#C7D9E5"  # solo decorativo: separadores y bordes de tarjeta
    focus-ring: "#0B3C5D"
    success: "#14532D"
    success-subtle: "#ECFBF1"
    success-border: "#A7E3BF"
    warning: "#7A3A06"
    warning-subtle: "#FFF6E6"
    warning-border: "#F2C98C"
    on-warning: "#FFFFFF"
    error: "#8B1A1A"
    error-subtle: "#FFF0F0"
    error-border: "#F2B3B3"
    info: "#123F6E"
    info-subtle: "#EAF3FC"
    info-border: "#B5D3F0"
    inverse-surface: "#0A1F2E"     # toasts
    inverse-on-surface: "#E8F2F8"
    inverse-primary: "#8CCFF0"     # acción dentro de un toast (ej. «Deshacer»)
    scrim: "rgba(6, 23, 34, 0.60)" # fondo atenuado detrás de modales
    nav-surface: "#0B3C5D"         # menú lateral
    on-nav: "#E8F2F8"
    on-nav-muted: "#C6DEEC"
    nav-active: "#1A5279"          # fondo del ítem activo
    nav-indicator: "#8CCFF0"       # barra de 3px del ítem activo
  dark:
    primary: "#8CCFF0"
    primary-hover: "#B5E2F7"
    on-primary: "#061722"
    surface: "#061722"
    on-surface: "#E8F2F8"
    on-surface-muted: "#A9CCE0"
    surface-container: "#0C2331"
    surface-container-low: "#08202D"
    surface-container-high: "#14344A"
    outline: "#6F9AB5"
    outline-variant: "#24465C"
    focus-ring: "#8CCFF0"
    success: "#6EE7A0"
    success-subtle: "#0B2A1A"
    success-border: "#1F5A38"
    warning: "#FCC86B"
    warning-subtle: "#2E1F08"
    warning-border: "#6B4A12"
    on-warning: "#061722"
    error: "#FCA5A5"
    error-subtle: "#331314"
    error-border: "#6B2A2A"
    info: "#9CC9F5"
    info-subtle: "#0D2740"
    info-border: "#1F4A70"
    inverse-surface: "#E8F2F8"
    inverse-on-surface: "#0A1F2E"
    inverse-primary: "#0B3C5D"
    scrim: "rgba(0, 0, 0, 0.70)"
    nav-surface: "#030E15"
    on-nav: "#E8F2F8"
    on-nav-muted: "#A9CCE0"
    nav-active: "#14344A"
    nav-indicator: "#8CCFF0"

elevation:
  light:
    shadow-1: "0 1px 2px rgba(10, 31, 46, 0.06)"
    shadow-2: "0 10px 25px -5px rgba(10, 31, 46, 0.14), 0 8px 10px -6px rgba(10, 31, 46, 0.08)"
  dark:
    shadow-1: "none"   # en oscuro la profundidad la da el borde outline-variant
    shadow-2: "0 10px 25px -5px rgba(0, 0, 0, 0.55)"
```

### 2.1. Reglas de contraste (meta AAA)

1. **Todo texto alcanza al menos 7:1** contra su fondo, en ambos temas. Incluye textos secundarios, insignias de estado, enlaces, mensajes de error y el texto de los toasts.
2. **Bordes de controles interactivos y anillo de foco: al menos 3:1.** Inputs, botón secundario y zona de carga usan `outline`; el foco usa `focus-ring`.
3. **`outline-variant` es solo decorativo** (separadores de tabla, bordes de tarjeta). Nunca es la única pista de que algo es interactivo.
4. **Texto de estado (`success`, `warning`, `error`, `info`) solo sobre** `surface`, `surface-container`, `surface-container-low` o su propio `*-subtle`. Nunca sobre `surface-container-high`, donde algunos bajan de 7:1.
5. **El color nunca es el único indicador.** Cada estado lleva texto y, cuando aplica, ícono.
6. **Controles deshabilitados:** opacidad 50 %; el texto que explica el bloqueo se escribe en `on-surface-muted` a contraste completo.

| Par verificado | Claro | Oscuro |
| :--- | ---: | ---: |
| `on-surface` / `surface` | 15.8:1 | 16.0:1 |
| `on-surface-muted` / `surface-container` | 9.4:1 | 9.5:1 |
| `on-primary` / `primary` | 11.6:1 | 10.7:1 |
| `success` / `success-subtle` | 8.5:1 | 10.0:1 |
| `warning` / `warning-subtle` | 8.0:1 | 10.4:1 |
| `error` / `error-subtle` | 8.4:1 | 8.9:1 |
| `info` / `info-subtle` | 9.5:1 | 8.8:1 |
| `on-warning` / `warning` (botón «Confirmar Devolución») | 8.6:1 | 11.8:1 |
| `focus-ring` / `surface` | 10.8:1 | 10.7:1 |
| `on-nav` / `nav-active` (menú lateral) | 7.3:1 | 11.4:1 |
| `outline` / `surface-container` (borde de control) | 4.6:1 | 5.4:1 |

### 2.2. Token `focus-ring` y espacio del anillo

El anillo de foco mide `2px`, se separa `2px` del control y **el espacio entre el control y el anillo toma el color de la superficie donde está el control**. Se implementa con una variable heredable `--focus-offset`: vale `surface` en la página y cada contenedor (tarjeta, drawer, modal, toast) la redefine con su propio fondo (`surface-container`, `inverse-surface`…).

```css
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--focus-offset), 0 0 0 4px var(--focus-ring);
}
```

---

## 3. Typography

Utiliza **Inter** para todas las jerarquías de texto operativo, etiquetas técnicas y números tabulares, garantizando máxima legibilidad en tablas densas de corte, listas de chequeo y bitácoras de auditoría.

> **Regla Tipográfica Crítica:** Todos los porcentajes de avance, días restantes, conteos de horas-hombre, fechas y códigos de juntas/formatos (ej. `GT-FR64`) **deben** aplicar la propiedad CSS `font-variant-numeric: tabular-nums` (clase `tabular-nums` en Tailwind) para garantizar alineación vertical perfecta en tablas y contadores.

```yaml
typography:
  display-lg:
    fontFamily: "Inter"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: "Inter"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: "Inter"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: "Inter"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: "Inter"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
  headline-sm:
    fontFamily: "Inter"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 24px
  title-lg:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
  title-md:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
  body-lg:
    fontFamily: "Inter"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-md:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-sm:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-lg:
    fontFamily: "Inter"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  label-md:
    fontFamily: "Inter"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
  label-sm:
    fontFamily: "Inter"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 14px
    letterSpacing: 0.04em
```

---

## 4. Layout, Spacing, Shapes & Elevation

### Layout & Spacing
El sistema sigue una estructura de **Sidebar lateral fijo (`256px` en escritorio, temporal en tableta/móvil)** + **Topbar de contexto (`64px` de alto)** que mantiene el Proyecto/Contrato activo, el indicador de conexión (§8.3) y el acceso a las alertas. En escritorio muestra también el rol del usuario autenticado. En tableta y móvil, el rol queda en el menú de cuenta. El contenido se organiza sobre una **retícula 12–8–4** (detallada en §11.1) con un ritmo base de `8px` (`4px` para micro-espaciado).

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px    # separación mínima entre controles táctiles
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section: 40px

grid:
  mobile:  { from: 0px,    columns: 4,  gutter: 16px, margin: 16px }
  tablet:  { from: 600px,  columns: 8,  gutter: 16px, margin: 24px }
  desktop: { from: 1024px, columns: 12, gutter: 24px, margin: 24px }  # la retícula ocupa el área a la derecha del sidebar

tailwind-screens:   # reemplaza los breakpoints por defecto de Tailwind (sm/md/lg)
  tablet: 600px
  desktop: 1024px

touch-target:
  default: 48px  # alto y ancho mínimo de toda acción
  field: 56px    # vistas de campo por debajo de 1024 px (ver §6.1)
  gap: 8px       # separación mínima entre bordes táctiles
```

### Elevation & Depth
Jerarquía basada en capas de superficie (`surface` -> `surface-container`) y bordes definidos con sutileza técnica (`1px solid outline-variant`). Se evitan sombras pesadas o difusas para mantener un aspecto limpio de herramienta de ingeniería:
- **Tarjetas estáticas y tablas:** borde `1px solid outline-variant` + sombra `shadow-1`.
- **Paneles flotantes, Drawers y Modales:** sombra `shadow-2`; detrás de un modal, fondo `scrim`.

### Shapes
Formas sobrias y precisas. Botones, inputs y tarjetas poseen esquinas suavemente redondeadas (`6px` a `8px`) para mantener seriedad industrial sin parecer toscas.

```yaml
rounded:
  sm: 4px       # Badges de estado y tags técnicos
  DEFAULT: 6px  # Botones, inputs, selectores
  md: 8px       # Tarjetas de carpetas, contenedores de tabla
  lg: 12px      # Modales de confirmación y paneles laterales
  xl: 16px
  full: 9999px  # Indicadores tipo semáforo (dots)
```

---

## 5. Arquitectura de Información y Jerarquía Inicial (First-View Priority)

Para favorecer el trabajo en equipo en React (reutilización de componentes, rutas limpias y fácil mantenimiento) sin sacrificar la eficiencia de cada rol (HU-M01, HU-M12), se implementa un **Shell de Inicio Unificado con Priorización Dinámica por Rol**:

### 5.1. Estructura de la Pantalla Principal (`/dashboard`)
Todos los roles aterrizan en una estructura común dividida en **3 zonas verticales**, pero los widgets y el orden de las filas se adaptan automáticamente según los permisos del JWT:

1. **Zona Superior (Action & Alert Banner - Prioridad 1):**
   Muestra únicamente alertas accionables urgentes que requieren intervención inmediata del usuario logueado. Si no hay bloqueos o alertas, este espacio se colapsa para no ocupar pantalla. El aviso de sin conexión (§8.3) se muestra en su propia franja bajo la topbar.
   - *Si es Calidad / Director / Gerencia:* Muestra la **Barra de Cuenta Regresiva de 10 Días del Dossier** (si el acta de facturación ya fue aceptada) resaltando cuántos requisitos faltan por validar.
   - *Si es Ingeniero Residente:* Muestra una cinta `warning-subtle` con borde `warning-border` si tiene **Cortes Devueltos con Observaciones** pendientes de corrección, junto al CTA primario fijo `"Registrar Corte de Obra"`.
   - *Si es Coordinación SST:* Muestra el conteo de trabajadores **Vencidos (`error`)** y **Próximos a vencer a 15/30 días (`warning`)**.

2. **Zona Media (KPIs Operativos del Proyecto Activo - Prioridad 2):**
   Tres tarjetas resumen sobre la retícula (`grid-cols-4 tablet:grid-cols-8 desktop:grid-cols-12`, cada tarjeta `col-span-4`): una por fila en móvil, dos en tableta (la tercera pasa a la fila siguiente) y tres en escritorio.
   - **Avance Físico vs. Tiempo Contractual:** Barra comparativa doble (ej. *Avance físico: 68% | Tiempo transcurrido: 72%*).
   - **Estado del Dossier (6 Carpetas):** Porcentaje global de completitud y desglose rápido de ítems *Validados / Observados / Pendientes*.
   - **Fuerza Laboral SST Activa:** Total de personal asignable (`Habilitado`) frente a personal bloqueado (`No Habilitado / Vencido`).

3. **Zona Inferior (Bandeja de Trabajo Contextual - Prioridad 3):**
   Tabla o matriz directa según el rol principal para que el usuario opere a un solo clic sin navegar por menús profundos:
   - **Ingeniero Residente:** Historial de cortes del frente de obra (con botón rápido de continuar borrador local si existe y cortes `Pendiente de envío` si los hay, §8.3).
   - **Director de Proyectos (Yonny):** Bandeja «Pendientes de visado» con cortes en estado oficial `En Revisión (Enviado)`.
   - **Coordinación SIG / Calidad (Dilan):** Matriz de las 6 carpetas contractuales del Dossier y registro de ensayos NDT.
   - **Coordinación SST:** Matriz de personal ordenada por defecto bajo la regla **Críticos Primero** (1° Rojos/Vencidos, 2° Ámbar/15 días, 3° Ámbar/30 días, 4° Verdes/Habilitados).

---

## 6. Comportamiento Interactivo de Botones y Acciones Críticas

Cada botón e interacción en el frontend debe responder con retroalimentación física e inequívoca siguiendo la curva `state-change` (`150ms ease-out`, §9).

### 6.1. Tamaño y Estados Físicos de los Botones

**Tamaño mínimo (token `touch-target`):**
- **Escritorio y vistas de oficina:** alto y ancho mínimo de **48px** para toda acción, incluidos íconos interactivos.
- **Vistas de campo por debajo de 1024px:** **56px**. Son las pantallas que se usan en obra desde celular o tableta: registro de corte (§11.3), selector de personal SST (§6.2A), consulta de personal SST e inspección SST, y la carga de evidencias.
- **Separación:** al menos **8px** (`gutter-sm`) entre los bordes táctiles de dos controles vecinos.

**Estados:**
- **Default:** Primario: fondo `primary`, texto `on-primary`. Secundario: fondo `surface-container`, texto `on-surface`, borde `1px solid outline`. Texto `label-lg` (`14px`, `font-medium`).
- **Hover:** Primario cambia a `primary-hover`; secundario cambia a `surface-container-low` (`state-change`).
- **Active (Al oprimir / Clic):** Ligera compresión táctil `transform: scale(0.98)` + borde `primary`. Da sensación inmediata de respuesta mecánica.
- **Focus Visible (Teclado/Accesibilidad):** anillo `focus-ring` de `2px` separado `2px`, con el espacio del color de la superficie (§2.2).
- **Loading (Procesando Petición API):**
  - El botón **conserva su ancho mínimo** para evitar saltos de layout.
  - Se deshabilita inmediatamente (`disabled: true`, `pointer-events-none`) para impedir dobles envíos (ej. doble creación de corte o doble visado).
  - El ícono izquierdo se reemplaza por un `Spinner` lineal de `16px` y el texto cambia al gerundio de la acción: de `"Guardar Corte"` a `"Guardando corte..."`, o de `"Visar Corte"` a `"Registrando visado..."`.
- **Disabled (Bloqueado por Regla de Negocio):** `opacity-50`, `cursor-not-allowed`, sin efecto hover ni `scale`. Se marca con `aria-disabled="true"` (no con `disabled`): sigue recibiendo foco con teclado y anuncia el motivo. **Obligatorio:** Mostrar junto al botón, en `on-surface-muted` a contraste completo, el motivo del bloqueo y, cuando aplique, la acción necesaria para resolverlo. Vincular la explicación al control mediante `aria-describedby`. Un tooltip puede complementar el mensaje visible.

### 6.2. Reglas UX en Flujos de Negocio Críticos

#### A. Bloqueo Estricto de Personal SST en el Corte de Obra (HU-M10)
Cuando el Ingeniero Residente abre el selector o buscador para agregar trabajadores a un corte de obra:
- **Transparencia Operativa (Opción A):** Todos los trabajadores registrados aparecen en la lista, pero aquellos con concepto médico `"No Habilitado"` o con cualquier curso normativo vencido se renderizan en la parte inferior o con bloqueo estricto:
  - Fila con fondo `error-subtle`, texto `on-surface-muted` y `cursor-not-allowed`.
  - Checkbox de selección con `aria-disabled="true"` acompañado de un ícono de candado (`LockIcon`) en `error`. Sigue siendo alcanzable con teclado (§11.4).
  - Badge explícito en la misma fila (texto `error` sobre `error-subtle`, borde `error-border`) indicando la causa exacta: ej. `[Bloqueado: Alturas vencido hace 4 días]` o `[Bloqueado: Concepto Médico No Habilitado]`.
  - Si el usuario intenta seleccionar la fila bloqueada (clic, toque, `Espacio` o `Enter`), la fila ejecuta una micro-animación de sacudida horizontal (`error-shake`, `150ms`) y resalta el motivo del bloqueo, educando al usuario sin permitirle violar la regla de negocio.
  - Sin conexión, el selector usa el último estado SST sincronizado y muestra la hora de esa sincronización (§8.3).

#### B. Flujo de "Visar" vs. "Devolver con Observaciones" (HU-M04 y Checklist HU-M06/08)
Para evitar rechazos ambiguos por parte del Director de Proyectos o Calidad y no detener la operación en campo:
- **Al oprimir `"Validar Requisito"` (ítem individual de la checklist): aviso con «Deshacer» por 5 segundos.**
  1. El ítem cambia de inmediato a `"Validado"` (badge `success`) y la barra de progreso de la carpeta se actualiza.
  2. Aparece un toast (`inverse-surface`, texto `inverse-on-surface`) con el texto *"Requisito validado."* y el botón **«Deshacer»** en `inverse-primary`.
  3. **Durante esos 5 segundos no se envía nada a la API ni se escribe en la bitácora.** Al terminar el plazo se envía la validación y se registra en la bitácora (HU-M11).
  4. «Deshacer» devuelve el ítem a su estado anterior sin dejar registro. También funciona con `Ctrl+Z` mientras el aviso está visible.
  5. El conteo se pausa mientras el puntero está sobre el toast o este tiene el foco.
  6. Si el usuario valida otro ítem, sale de la pantalla o cierra la app, la validación pendiente se confirma en ese momento.
- **Al oprimir `"Visar Corte"` (Corte de Obra completo):** muestra un *Popover* de confirmación rápida: *"¿Confirmar visado técnico del Corte #04? Esta acción quedará registrada en la bitácora de auditoría."* El foco inicial queda en «Cancelar».
- **Al oprimir `"Devolver con Observaciones"` u `"Observar Requisito"`:**
  - Despliega un **Popover o Modal compacto contextual** enfocado automáticamente (`autoFocus`) en un campo `textarea` obligatorio.
  - Incluye **chips de selección rápida** de causas frecuentes (ej. *"Soporte PDF ilegible"*, *"Falta firma residente"*, *"Desfase en horas-hombre"*, *"Certificado NDT no coincide con junta"*) que autocompletan o complementan el texto para ahorrar tiempo.
  - El botón de confirmación `"Confirmar Devolución"` (fondo `warning`, texto `on-warning`) permanece **deshabilitado** hasta que el comentario tenga al menos 10 caracteres.
  - Una vez confirmado, el registro pasa a estado `"Observado"` / `"Devuelto con Observaciones"`, se registra en la bitácora (HU-M11) y el Ingeniero Residente sigue teniendo habilitado el botón de crear nuevos cortes sin bloqueo (visado no bloqueante).

#### C. Exportación del Paquete Dossier en ZIP: Borradores vs. Cierre Definitivo (HU-M08)
Dado que el equipo necesita permitir descargas parciales de revisión pero garantizar el control del 100% para el cierre contractual con Chevron:
- **Cuando el avance global de las 6 carpetas es `< 100%`:**
  - El botón principal muestra el estado dual:
    1. Botón secundario habilitado: `"Exportar Borrador Parcial (.ZIP)"` (ícono `FolderDown`). Al oprimirlo, genera el `.zip` con las 6 carpetas, incluyendo una marca o prefijo `BORRADOR_INCOMPLETO_` en el nombre del archivo y en el acta resumen de `ReportLab`, detallando qué ítems faltan.
    2. Botón primario deshabilitado: `"Emitir Dossier Final Validado"` con una explicación visible junto al botón: *"Requiere 100% de validación. Actualmente al 78% (faltan 4 requisitos en Carpeta 2 y Carpeta 4)"*.
- **Cuando el avance global alcanza el `100%` (Todos los ítems en estado `"Validado"`):**
  - El botón primario `"Emitir y Exportar Dossier Final (.ZIP)"` se habilita en `primary` con un indicador `success` de listo.
- **Secuencia de Compilación y Descarga (`zipfile` + `ReportLab` + `openpyxl`):**
  - Al hacer clic en exportar (borrador o final), el botón entra en estado de procesamiento activo: muestra spinner + texto dinámico `"Compilando 6 carpetas y acta PDF..."`.
  - Al completarse la respuesta del backend, se dispara la descarga del navegador y emerge un `Toast` de confirmación en la esquina inferior derecha con el resumen del paquete descargado.
  - Requiere conexión. Sin señal, el botón se muestra deshabilitado con el motivo *"Necesitas conexión para compilar el dossier."*

---

## 7. Estados de Carga (Skeletons), Subida a S3 y Previsualización

### 7.1. Política de Cero Spinners de Pantalla Completa (Skeleton Loaders)
Queda prohibido bloquear toda la pantalla con un spinner circular genérico durante las peticiones `GET` a la API de Django. Para evitar saltos bruscos de diseño (*Cumulative Layout Shift*):
- **Tablas (Cortes, Personal SST, Bitácora):** Mientras la petición está en curso (`isLoading`), se renderiza la cabecera real de la tabla junto con **5 a 8 filas de Skeleton** (`animate-pulse` con fondo `surface-container-high`) que respetan exactamente el ancho de cada columna.
- **Matriz de las 6 Carpetas del Dossier:** Se muestran las 6 tarjetas estructurales con sus títulos fijos (*Carpeta 1: Documentación contractual*, etc.) y barras de progreso en estado *skeleton* hasta que hidratan los porcentajes reales.
- **Recargas en segundo plano (Refetching tras un filtro o cambio de estado):** Si los datos ya están en pantalla y el usuario cambia un filtro o valida un ítem, se mantiene la tabla visible con una barra de progreso lineal ultradelgada (`2px`, color `primary`) en la parte superior del contenedor, sin borrar el contenido actual.

### 7.2. Carga de Archivos a S3 (Drag & Drop) y Previsualizador Lateral (HU-M03, HU-M06, HU-M07)
La carga de fotografías de obra, certificados de materiales, reportes NDT y soportes PDF sigue un flujo blindado contra conexiones inestables:

1. **Zona de Drag & Drop Interactiva:**
   - Mostrar un botón «Seleccionar archivos» que abra el selector del dispositivo mediante toque o teclado. En equipos con puntero, la zona admite también arrastrar archivos.
   - Borde punteado `2px dashed outline` que cambia a `2px dashed primary` con fondo `surface-container-low` cuando el usuario arrastra un archivo encima (`onDragOver`).
   - Especifica claramente los formatos y límites antes de subir: *"Selecciona archivos PDF, JPG o PNG (máx. 15 MB por archivo)"*.
2. **Validación Instantánea en Cliente (Pre-Upload):**
   - Si el archivo no es `.pdf`, `.jpg`, `.jpeg` o `.png`, o supera el peso límite, se rechaza en `0ms` en el navegador mostrando un borde `error` y un mensaje claro debajo del dropzone sin consumir ancho de banda hacia el servidor.
3. **Barra de Progreso Real de Subida:**
   - Durante la carga hacia el bucket compatible con S3, cada archivo muestra una tarjeta compacta con su nombre, tamaño en MB, una barra de progreso horizontal con el porcentaje exacto (`0%` a `100%` en `tabular-nums`) y un botón `"Cancelar"` (`X`).
   - Al llegar al `100%`, mostrar «Confirmando carga…» hasta que se confirme el almacenamiento y la asociación del archivo con el registro. Después, mostrar «Archivo cargado» y actualizar la checklist.
   - Si falla la carga, conservar los campos del formulario y los archivos confirmados. Mostrar el error junto al archivo y un botón «Reintentar».
   - Si la falla es por falta de señal, el archivo pasa a la cola local y se sube solo al recuperar conexión (§8.3). Si el dispositivo no tiene espacio para guardarlo, pedir que se seleccione de nuevo cuando vuelva la señal.
4. **Previsualizador Integrado en Drawer Lateral (Split-View Inspection):**
   - Al hacer clic en cualquier soporte PDF o fotografía ya cargada (tanto en el Dossier como en la revisión de un Corte de Obra por el Director), **nunca se saca al usuario de la pantalla ni se fuerza la descarga a su disco local por defecto**.
   - Desde `1024px`, se abre un **drawer lateral derecho** de `min(45vw, 640px)` con animación `surface-enter` (`200ms`). Por debajo de `1024px`, se abre un visor de pantalla completa dentro de la aplicación, según la sección 11.
   - El Drawer contiene un visor nativo de PDF/Imagen en el cuerpo central, metadatos en la cabecera (autor del cargue, fecha/hora exacta, junta NDT vinculada si aplica) y en el pie del Drawer los botones de acción directa para Calidad/Director: `"Validar Documento"` o `"Observar Documento"`, permitiendo auditar y calificar sin perder de vista la checklist a la izquierda. «Validar Documento» sigue la regla de 5 segundos con «Deshacer» de §6.2B.

---

## 8. Resiliencia en Campo y Persistencia Local (Auto-Save Drafts)

El registro de un Corte de Obra (HU-M02: avance físico por actividad, horas-hombre por trabajador e insumos consumidos) y la asociación de ensayos NDT a juntas soldadas (HU-M07) son tareas extensas propensas a cierres accidentales de pestaña o caídas de señal en obra, donde puede no haber cobertura hasta por 6 horas.

### 8.1. Autoguardado Silencioso en `localStorage`
- Cada vez que el Ingeniero Residente modifica un campo en el formulario de creación de corte (`onChange` con un *debounce* de `500ms`), el estado completo del formulario (actividades, personal SST seleccionado e insumos) se serializa en `localStorage` bajo una clave vinculada al proyecto y usuario: `loard_draft_corte_proj_{id}_user_{id}`.
- En la esquina superior derecha del formulario se muestra un indicador discreto de estado:
  - Mientras escribe: `"Guardando borrador local..."` (ícono de nube/disco en `on-surface-muted`).
  - Tras `500ms`: `"Borrador guardado localmente a las 14:32"` (`body-sm`, color `on-surface-muted`).

### 8.2. Recuperación y Limpieza del Borrador
- Si el residente recarga la página o vuelve a entrar al módulo de Cortes y existe un borrador no enviado, aparece un banner informativo (`info-subtle`, borde `info-border`) en la parte superior del formulario:
  > *"Tienes un corte de obra en borrador guardado hoy a las 14:32. [Continuar editando] | [Descartar borrador]"*
- Si el usuario intenta cerrar la pestaña o navegar fuera mientras hay archivos subiendo a S3 con conexión activa, se dispara el evento nativo `beforeunload` advirtiendo que hay una carga de archivos en curso. Lo que ya está en la cola sin conexión (§8.3) no se pierde al cerrar.
- Una vez que el endpoint `POST /api/v1/cortes/` responde `201 Created`, el sistema limpia automáticamente la clave de `localStorage` y redirige al detalle del corte recién creado con un `Toast` de éxito.

### 8.3. Caída de Señal y Cola de Sincronización (`OfflineQueueBanner`)

**Indicador permanente de conexión (topbar).** Junto a las alertas, un ícono de nube con texto corto, siempre visible:

| Estado | Ícono y texto | Color |
| :--- | :--- | :--- |
| En línea | Nube · «En línea» (en móvil solo el ícono, con `aria-label`) | `on-surface-muted` |
| Sin conexión | Nube tachada · «Sin señal» | `warning` |
| Sincronizando | Nube con flechas · «Enviando 2 de 3» | `info` |
| Error de envío | Nube con alerta · «1 envío falló» | `error` |

**Franja de aviso (`OfflineQueueBanner`).** Aparece bajo la topbar, fija al hacer scroll, con `role="status"`:
- **Sin conexión** (`warning-subtle`, borde `warning-border`): *"Sin conexión. 3 cambios guardados en este dispositivo; se enviarán al recuperar señal."*
- **Sincronizando** (`info-subtle`): *"Señal recuperada. Enviando 2 de 3…"* con barra de progreso.
- **Todo enviado** (`success-subtle`): *"Todo sincronizado a las 15:04."* Se oculta sola a los 5 segundos.
- **Envío rechazado** (`error-subtle`, permanece hasta que el usuario actúa): *"No se pudo enviar el Corte #07: Jhon Angulo tiene el curso de alturas vencido desde ayer. [Revisar corte]"*

**Qué se puede hacer sin señal:**
- Crear y editar cortes, agregar actividades, horas-hombre e insumos, y adjuntar fotos o PDF.
- Oprimir «Enviar corte»: el corte queda en la cola local con el estado `Pendiente de envío` (solo local, §10) y aparece así en el historial.
- Consultar el estado SST de los trabajadores con la hora de la última sincronización: *"Datos SST actualizados hoy a las 06:10"*.

**Qué requiere señal** (el botón se muestra deshabilitado con el motivo *"Necesitas conexión para…"*): visar cortes, validar u observar requisitos del dossier y exportar el dossier.

**Reglas de la cola:**
- Se guarda en el dispositivo (IndexedDB), incluidos los archivos, y se conserva al cerrar la app.
- Se envía en el orden en que se creó, apenas vuelve la señal, sin que el usuario tenga que hacer nada.
- Cada envío lleva una clave única (`Idempotency-Key`); si un reintento llega dos veces, el servidor no duplica el corte.
- Al sincronizar, el servidor vuelve a revisar la habilitación SST. Si un trabajador se venció mientras no había señal, responde `409 Conflict`; el corte vuelve a borrador, se marca el trabajador bloqueado y la franja muestra el motivo exacto.

---

## 9. Motion & Micro-interactions

Micro-interacciones sobrias, funcionales y rápidas, **entre `150ms` y `200ms`**, para estados de hover, validación de checklist, apertura de visores PDF y confirmaciones de visado. Ninguna transición baja de `150ms` ni supera `350ms`. Con `prefers-reduced-motion: reduce`, suprimir la sacudida, el pulso de los skeletons y los desplazamientos animados. Mantener la retroalimentación mediante texto, iconos y cambios de estado.

```yaml
motion:
  state-change:
    duration: 150ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 200ms
    delay: 0ms
    timingFunction: cubic-bezier(0.16, 1, 0.3, 1)   # ease-out: lo que entra
  surface-exit:
    duration: 150ms
    delay: 0ms
    timingFunction: cubic-bezier(0.7, 0, 0.84, 0)   # ease-in: lo que sale
  error-shake:
    duration: 150ms
    keyframes: "translateX(-4px) -> translateX(4px) -> translateX(0)"
  undo-window:
    duration: 5000ms   # plazo de «Deshacer» antes de escribir en la bitácora (§6.2B)
```

---

## 10. Voice, Content Strategy & Auditoría (Bitácora)

### Tono y Terminología Oficial
Tono riguroso, formal y de ingeniería civil y petrolera en español neutro colombiano. Los estados son categóricos e idénticos entre la base de datos (Django TextChoices), la API REST y las insignias de React. Cada insignia usa el texto del token indicado sobre su `*-subtle`, con borde `*-border` y un punto de `8px` del mismo color:

| Módulo | Estados Oficiales Permitidos | Token Semántico |
| :--- | :--- | :--- |
| **Personal SST (HU-M09, HU-M10)** | `Habilitado` | `success` |
| | `Próximo a Vencer (30d / 15d)` | `warning` |
| | `No Habilitado` / `Vencido` | `error` |
| **Cortes de Obra (HU-M02, HU-M04)** | `En Revisión (Enviado)` | `info` |
| | `Visado` | `success` |
| | `Devuelto con Observaciones` | `warning` |
| **Checklist Dossier (HU-M05 a M08)** | `Pendiente` | `on-surface-muted` sobre `surface-container`, borde `outline` |
| | `Archivo Cargado` | `info` |
| | `Observado` | `warning` |
| | `Validado` | `success` |

**Estado solo local (no existe en la base de datos):** `Pendiente de envío` para cortes en la cola sin conexión (§8.3). Se muestra con `on-surface-muted`, borde punteado `outline` e ícono de nube tachada.

### Reserva Legal e Invisibilidad Clínica (SST)
En ningún formulario, tabla, *tooltip* o bitácora se mostrarán campos para diagnósticos médicos, patologías o historias clínicas. El campo de aptitud médica es estrictamente binario/categórico (`Habilitado` / `No Habilitado`) acompañado de su fecha de expedición y fecha de vencimiento.

### Bitácora de Auditoría (HU-M11)
Cada cambio de estado en un corte o en un ítem del dossier renderiza una línea de tiempo (*Timeline* vertical) de solo lectura con formato inmutable:
`[DD/MM/AAAA HH:mm:ss] — [Nombre y Rol del Usuario] cambió el estado de [Estado Anterior] a [Estado Nuevo]. Motivo/Observación: "[Texto si aplica]"`

Una validación deshecha dentro de los 5 segundos de §6.2B no genera línea en la bitácora.

---

## 11. Comportamiento responsive y criterios de aceptación

### 11.1. Retícula 12–8–4, navegación y márgenes

El diseño parte de móvil y crece. Todas las pantallas se maquetan sobre la retícula definida en §4 (tokens `grid` y `tailwind-screens`):

| Dispositivo | Ancho del viewport | Columnas | Gutter | Margen lateral | Navegación | KPIs (`col-span-4`) |
| --- | --- | :---: | :---: | :---: | --- | --- |
| **Móvil** | Menos de 600 px | **4** | 16 px | 16 px | Menú lateral temporal desde un botón en la barra superior | 1 por fila |
| **Tableta** | 600–1023 px | **8** | 16 px | 24 px | Menú lateral temporal desde un botón en la barra superior | 2 por fila; la tercera pasa a la fila siguiente |
| **Escritorio** | Desde 1024 px | **12** | 24 px | 24 px | Menú lateral fijo de 256 px; la retícula ocupa el área restante | 3 por fila |

**Uso de columnas por tipo de pantalla:**
- **Formularios** (registro de corte, observaciones): 4 de 4 en móvil, 8 de 8 en tableta y 8 de 12 centradas en escritorio.
- **Revisión con visor** (Director, Calidad): en escritorio, la lista o checklist ocupa 7 columnas y el drawer del visor el resto (§7.2). Por debajo de 1024 px, el visor es de pantalla completa.
- **Tablas y matrices:** ocupan todas las columnas disponibles.

En pantallas estrechas, la barra superior mantiene el botón de menú, el nombre del proyecto activo, el indicador de conexión y el acceso a las alertas. El selector de proyecto muestra el nombre completo al abrirse si estaba truncado. El rol se muestra en el menú de cuenta, accesible desde la barra superior. Las alertas críticas del flujo activo permanecen visibles al inicio del contenido, según la prioridad por rol.

La página se ajusta al viewport sin desplazamiento horizontal global. Los títulos, mensajes y botones con textos largos admiten saltos de línea.

### 11.2. Tablas y bandejas de trabajo

- **Cortes de obra.** En móvil, cada fila se presenta como un resumen con identificador, fecha, estado y acción según el rol. «Ver detalle» da acceso a avances, horas-hombre, insumos y soportes. Los cortes `Pendiente de envío` aparecen primero.
- **Personal SST.** Mostrar nombre, estado y motivo exacto del bloqueo en la misma fila o tarjeta. Conservar la búsqueda y el orden «Críticos Primero» en todos los anchos.
- **Dossier.** Apilar las seis carpetas en móvil. Cada carpeta muestra nombre, progreso y conteos de requisitos por estado. Cada requisito conserva su estado y su acceso al soporte.
- **Matrices comparativas.** Cuando la comparación entre columnas sea parte de la tarea, conservar la tabla y limitar el desplazamiento horizontal a su contenedor. Los indicadores de carga reproducen la estructura visible de la tabla o de las tarjetas según el ancho.

### 11.3. Formularios, visores y acciones táctiles

- **Registro de corte.** En móvil, usar una sola columna. Presentar actividades, personal e insumos en secciones con acciones «Agregar» junto a cada grupo. Mantener visible el estado del borrador cerca del encabezado del formulario. Mostrar la acción principal en un pie fijo con espacio suficiente debajo del contenido para evitar que cubra el último campo. Con el teclado abierto, el campo activo y su mensaje de error deben quedar visibles.
- **Visor de soportes.** En la variante de pantalla completa, el documento se desplaza dentro del visor. La cabecera conserva el botón «Cerrar» y los metadatos. El pie mantiene «Validar Documento» y «Observar Documento» para los roles autorizados. Al volver, conservar filtros y posición de la lista.
- **Confirmaciones y observaciones.** En móvil, usar un diálogo con cuerpo desplazable y espacio suficiente para el comentario y sus sugerencias. Mostrar debajo del campo el requisito de 10 caracteres y mantener accesibles las acciones con el teclado abierto.
- **Interacción táctil.** Áreas táctiles de 48 px en escritorio y 56 px en las vistas de campo por debajo de 1024 px, con 8 px entre controles (§6.1). Mostrar el estado mediante texto además del color y mantener visibles las instrucciones necesarias para desbloquear una acción.
- **Recuperación de carga.** Si se pierde la conexión, cada archivo afectado indica el fallo y pasa a la cola local (§8.3). El borrador del formulario sigue disponible y la lista distingue los archivos confirmados de los que esperan señal o deben seleccionarse de nuevo.

### 11.4. Navegación por teclado

Toda la aplicación se puede operar sin ratón ni pantalla táctil.

**Orden y foco**
- El primer elemento que recibe foco es un enlace **«Saltar al contenido»**, visible solo al recibir foco.
- `Tab` recorre los controles en el mismo orden en que se ven: barra superior → franja de alertas → contenido → pie fijo de acciones. `Shift+Tab` recorre en sentido inverso.
- El foco siempre es visible: anillo `focus-ring` de §2.2, en ambos temas.
- Las filas de tablas no reciben foco; sí lo reciben las acciones dentro de ellas. Un contenedor con desplazamiento horizontal recibe foco (`tabindex="0"`, con `aria-label`) para recorrerlo con las flechas.
- Los controles bloqueados por regla de negocio usan `aria-disabled="true"`, siguen recibiendo foco y anuncian el motivo (§6.1, §6.2A).

**Activación**
- `Enter` y `Espacio` activan botones; `Espacio` marca casillas; `Enter` sigue enlaces.
- En una fila SST bloqueada, `Espacio` o `Enter` ejecuta la sacudida y resalta el motivo, igual que un clic.
- `Ctrl+Z` deshace la última validación mientras el aviso de §6.2B está visible.

**Diálogos, popovers, drawers y menú temporal**
- Al abrir, el foco va al primer campo (ej. el comentario de una observación). En confirmaciones de acciones que quedan en la bitácora, como «Visar Corte», el foco inicial va a «Cancelar».
- Mientras están abiertos, `Tab` y `Shift+Tab` circulan solo dentro de ellos (el foco no se escapa a la página de fondo).
- `Esc` los cierra. Si el comentario de una observación ya tiene texto, `Esc` primero pregunta en el mismo diálogo: *"¿Descartar la observación? [Descartar] [Seguir escribiendo]"*.
- Un clic o toque en el fondo `scrim` también cierra, con la misma pregunta si hay texto escrito.
- Al cerrar, el foco vuelve al control que los abrió.
- No hay trampas de foco fuera de estos componentes: desde cualquier punto se puede salir con `Tab`.

**Avisos**
- Los toasts y la franja `OfflineQueueBanner` se anuncian con `role="status"` sin robar el foco. Sus botones («Deshacer», «Revisar corte») se alcanzan con `Tab`.

### 11.5. Verificación antes de dar por terminado el MVP

Probar a 360 y 390 px de ancho con toque y teclado en pantalla. Revisar también 600 y 1024 px para verificar los cambios de retícula y navegación, y 1280 px para comprobar la vista de escritorio. Repetir en modo claro y oscuro.

1. **Registrar un corte con evidencia.** Agregar una actividad, un trabajador habilitado y un insumo. Seleccionar una foto o PDF. Cortar la conexión, oprimir «Enviar corte» y comprobar que aparece `Pendiente de envío` y la franja de sin conexión. Recuperar la señal y verificar que se envía solo, sin duplicarse.
2. **Consultar un bloqueo SST.** Buscar un trabajador bloqueado y comprobar que el motivo se puede leer desde la lista y que el selector impide agregarlo. Verificar lo mismo usando solo el teclado.
3. **Revisar un soporte del dossier.** Abrir un PDF, consultar sus metadatos, validarlo y usar «Deshacer» antes de 5 segundos; comprobar que no queda línea en la bitácora. Luego devolver otro con observaciones, comprobar el requisito del comentario, cerrar con `Esc` y verificar que el foco vuelve al soporte.

En los tres recorridos, verificar que la página no tenga desplazamiento horizontal global, que los controles conserven el foco visible, que las áreas táctiles de campo midan 56 px y que los mensajes largos no oculten acciones.
