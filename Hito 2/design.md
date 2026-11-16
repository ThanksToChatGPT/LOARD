---
name: "Loard Construcciones - Hito 2 MVP"
description: "Sistema operativo de alta precisión para gestión de cortes de obra, dossier de calidad Chevron y control estricto de habilitación SST."
stack: "Django + DRF | React + TypeScript + Tailwind CSS | PostgreSQL | S3"
---

## 1. Overview

Sistema corporativo de misión crítica para **Loard Construcciones S.A.S.** Diseñado con una estética sobria, limpia y de ingeniería industrial con mínima saturación de color. La paleta se fundamenta en un **azul petróleo institucional** y en **neutros tintados de azul** (no grises), reservando los colores de estado estrictamente para estados funcionales (verde para validado/habilitado, ámbar para alertas preventivas/observaciones y carmín para bloqueos normativos). Se eliminan colores accesorios decorativos para evitar sobrecarga cognitiva en entornos operativos y de campo.

Este documento describe el producto y el prototipo de alta fidelidad (`Hito 2/Modulo-I-Prototipo/prototipo`). Lo que el prototipo solo simula está reunido en #12.

---

## 2. Colors & Semantic Tokens

- **Primary:** Azul petróleo profundo para encabezados y botones de confirmación primaria.
- **Nav:** Fondo propio del menú lateral, oscuro en ambos temas (`nav-surface`, `on-nav`, `on-nav-muted`, `nav-active`, `nav-indicator`).
- **Neutros:** Superficies, textos y bordes con tinte azul.
- **Success:** Verde bosque para ítems validados, cortes visados y personal SST habilitado (> 30 días de vigencia).
- **Warning:** Ámbar oscuro para alertas preventivas SST (30 y 15 días), plazo de dossier en riesgo, requisitos/cortes observados y aviso de sin conexión.
- **Error:** Carmín para bloqueo terminante de personal no habilitado/vencido y vencimiento del plazo de 10 días del dossier.
- **Info:** Azul para estados en curso (`En Revisión (Enviado)`, `Archivo Cargado`, sincronización).

Los valores viven en `src/styles/tokens.css`, el único archivo del proyecto donde se escriben códigos de color. Tailwind los expone como clases con el nombre del token (`bg-surface`, `text-error`, `border-outline-variant`). El tema oscuro se activa con `data-theme="dark"` en `<html>`.

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
| `on-warning` / `warning` (botón «Confirmar devolución») | 8.6:1 | 11.8:1 |
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

Para no repetir la regla, los contenedores usan las clases de superficie en lugar de un `bg-*` suelto:

| Clase | Fondo | Ajuste del foco |
| :--- | :--- | :--- |
| `sf-page` | `surface` | Espacio en `surface`. |
| `sf-container` | `surface-container` | Espacio en `surface-container`. Base de `.card`, drawers y diálogos. |
| `sf-low` | `surface-container-low` | Espacio en `surface-container-low`. |
| `sf-inverse` | `inverse-surface` (toasts) | Espacio en `inverse-surface`; el anillo pasa a `inverse-primary`. |
| `sf-nav` | `nav-surface` (menú lateral) | Espacio en `nav-surface`; el anillo pasa a `nav-indicator`. |

La franja `OfflineQueueBanner` (#8.3) redefine el espacio con el `*-subtle` de su estado.

---

## 3. Typography

Utiliza **IBM Plex Sans** para todas las jerarquías de texto operativo, etiquetas técnicas y números tabulares, garantizando máxima legibilidad en tablas densas de corte, listas de chequeo y bitácoras de auditoría. Su origen en documentación técnica de ingeniería refuerza el carácter industrial del sistema sin recurrir a las tipografías genéricas de interfaz. Se usa la versión variable (pesos 100 a 700) empaquetada con la aplicación (`@fontsource-variable/ibm-plex-sans`), así que no depende de servicios externos ni de la señal en obra. No se usan tipografías con serifa en la interfaz.

> **Regla Tipográfica Crítica:** Todos los porcentajes de avance, días restantes, conteos de horas-hombre, fechas y códigos de juntas/formatos (ej. `GT-FR64`) **deben** aplicar la propiedad CSS `font-variant-numeric: tabular-nums` (clase `tabular-nums` en Tailwind) para garantizar alineación vertical perfecta en tablas y contadores. IBM Plex Sans ya trae cifras de ancho fijo; la clase se mantiene para que la regla no dependa de la fuente.

Cada estilo es una clase de Tailwind con su tamaño, interlineado y peso (`text-headline-sm`, `text-body-md`, `text-label-lg`…). El texto base de la página es `body-md`.

```yaml
typography:
  display-lg:
    fontFamily: "IBM Plex Sans"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 44px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: "IBM Plex Sans"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: "IBM Plex Sans"
    fontSize: 28px
    fontWeight: 600
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: "IBM Plex Sans"
    fontSize: 24px
    fontWeight: 600
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: "IBM Plex Sans"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 28px
  headline-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: 18px
    fontWeight: 600
    lineHeight: 24px
  title-lg:
    fontFamily: "IBM Plex Sans"
    fontSize: 16px
    fontWeight: 600
    lineHeight: 22px
  title-md:
    fontFamily: "IBM Plex Sans"
    fontSize: 14px
    fontWeight: 600
    lineHeight: 20px
  body-lg:
    fontFamily: "IBM Plex Sans"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
  body-md:
    fontFamily: "IBM Plex Sans"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
  body-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
  label-lg:
    fontFamily: "IBM Plex Sans"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  label-md:
    fontFamily: "IBM Plex Sans"
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
  label-sm:
    fontFamily: "IBM Plex Sans"
    fontSize: 11px
    fontWeight: 500
    lineHeight: 14px
    letterSpacing: 0.04em
```

---

## 4. Layout, Spacing, Shapes & Elevation

### Layout & Spacing
El sistema sigue una estructura de **Sidebar lateral (`256px`, fijo desde 1024px y temporal por debajo)** + **Topbar de contexto (`64px` de alto, fija arriba)** + **franja de avisos** fija bajo la topbar + contenido. El contenido se organiza sobre una **retícula 12–8–4** (detallada en #11.1) con un ritmo base de `8px` (`4px` para micro-espaciado).

- **Topbar:** botón de menú (solo por debajo de 1024px), Proyecto/Contrato activo (se trunca si no cabe), indicador de conexión (#8.3), rol del usuario (solo en escritorio) y acciones: alertas, cambio de tema claro/oscuro y cerrar sesión.
- **Sidebar:** nombre de la aplicación arriba, ítems del menú según el rol (#5.1) y, al pie, el nombre y el rol del usuario. El ítem activo usa fondo `nav-active`, texto `on-nav` y una barra de `3px` en `nav-indicator` a la izquierda; los demás van en `on-nav-muted`. Cada ítem mide al menos `48px` de alto.
- **Franja de avisos:** `OfflineQueueBanner` (#8.3) y, en el prototipo, el aviso de datos de ejemplo (#12).
- **Tema:** se elige con el botón de la topbar y se recuerda en el dispositivo. La primera vez sigue la preferencia del sistema operativo.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px    # separación mínima entre controles táctiles
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section: 40px
  sidebar: 256px
  topbar: 64px

grid:
  mobile:  { from: 0px,    columns: 4,  gutter: 16px, margin: 16px }
  tablet:  { from: 600px,  columns: 8,  gutter: 16px, margin: 24px }
  desktop: { from: 1024px, columns: 12, gutter: 24px, margin: 24px }  # la retícula ocupa el área a la derecha del sidebar

tailwind-screens:   # reemplaza los breakpoints por defecto de Tailwind (sm/md/lg)
  tablet: 600px
  desktop: 1024px

touch-target:
  default: 48px  # alto y ancho mínimo de toda acción (token `touch`)
  field: 56px    # vistas de campo por debajo de 1024 px (token `touch-field`, ver #6.1)
  gap: 8px       # separación mínima entre bordes táctiles
```

### Elevation & Depth
Jerarquía basada en capas de superficie (`surface` -> `surface-container`) y bordes definidos con sutileza técnica (`1px solid outline-variant`). Se evitan sombras pesadas o difusas para mantener un aspecto limpio de herramienta de ingeniería:
- **Tarjetas estáticas y tablas:** clase `.card` = `sf-container` + radio `md` + borde `1px solid outline-variant` + sombra `shadow-1`.
- **Paneles flotantes, Drawers, Modales y la barra de revisión del director (#6.2B):** sombra `shadow-2`; detrás de un modal, fondo `scrim`.

### Shapes
Formas sobrias y precisas. Botones, inputs y tarjetas poseen esquinas suavemente redondeadas (`6px` a `8px`) para mantener seriedad industrial sin parecer toscas.

```yaml
rounded:
  sm: 4px       # Badges de estado y tags técnicos
  DEFAULT: 6px  # Botones, inputs, selectores, ítems del menú
  md: 8px       # Tarjetas, contenedores de tabla, zona de carga
  lg: 12px      # Diálogos (máx. 520px de ancho) y paneles laterales
  xl: 16px
  full: 9999px  # Indicadores tipo semáforo (dots)
```

---

## 5. Arquitectura de Información y Jerarquía Inicial (First-View Priority)

No hay una pantalla de inicio común. Cada perfil entra directo a su bandeja de trabajo y ve en el menú solo los módulos de su rol (HU-M01). Todas las pantallas comparten la misma estructura (#4) y los mismos componentes (`@/components`).

### 5.1. Menú y pantalla de entrada por rol

| Perfil | Entra a | Menú lateral |
| :--- | :--- | :--- |
| **Ingeniero Residente** | `/cortes` · «Cortes de obra» | Cortes de obra · Dossier de calidad |
| **Director de Proyectos** | `/cortes` filtrada en `En Revisión (Enviado)` · «Cortes por revisar» | Cortes de obra · Dossier de calidad · Tablero del proyecto · Personal SST |
| **Coordinación SIG / Calidad** | `/cortes` | Cortes de obra · Dossier de calidad · Bitácora del registro · Personal SST |
| **Coordinación SST** | `/sst` · «Personal SST» | Personal SST |
| **Gerencia** | `/cortes` | Cortes de obra · Dossier de calidad · Tablero del proyecto · Personal SST |

**Rutas y permisos:**

| Ruta | Pantalla | Quién entra | Quién actúa |
| :--- | :--- | :--- | :--- |
| `/acceso` | Inicio de sesión | Todos | — |
| `/cortes`, `/cortes/:id` | Lista y detalle de cortes (HU-M02, HU-M03, HU-M04) | Residente, Director, Calidad, Gerencia | Residente autor: registra, corrige y adjunta. Director: visa o devuelve. |
| `/cortes/nuevo`, `/cortes/:id/editar` | Formulario del corte (HU-M02, HU-M10) | Residente | Residente |
| `/dossier` | Checklist de las 6 carpetas (HU-M05, HU-M06) | Residente, Director, Calidad, Gerencia | Calidad arma la checklist, valida y observa. Residente y Calidad cargan soportes. |
| `/dossier/documentos` | Documentos del SIG (HU-M05, HU-M06) | Ídem | Calidad publica (`/dossier/documentos/publicar`). |
| `/dossier/ensayos` | Ensayos NDT (HU-M07) | Ídem | Calidad registra (`/dossier/ensayos/nuevo`). |
| `/dossier/avance` | Avance y entrega (HU-M08) | Ídem | Calidad registra el acta. Todos exportan. |
| `/dossier/bitacora` | Bitácora del registro (HU-M11) | Calidad | Solo consulta. |
| `/dashboard` | Tablero del proyecto (HU-M12) | Director, Gerencia | Solo consulta. |
| `/sst`, `/sst/:id` | Lista y ficha del trabajador (HU-M09) | SST, Director, Calidad, Gerencia | SST registra cursos (`/sst/:id/cursos/nuevo`) y aptitud (`/sst/:id/aptitud`). Los demás consultan. |

Una ruta fuera del rol muestra un aviso `warning` («Acceso restringido para este perfil») con un enlace para volver al inicio; nunca una pantalla en blanco. En una pantalla de consulta, las acciones de otro rol se muestran bloqueadas con el motivo (ej. *"Este perfil tiene acceso de consulta a SST."*) o no se muestran.

### 5.2. Bandejas de trabajo

Cada módulo abre con la misma jerarquía: **encabezado** (`PageHeader`: título, descripción y acción principal) → **avisos accionables** (`Banner`, solo si hay algo que resolver) → **KPIs** (`KpiCard`) → **bandeja** (tabla o lista).

- **Cortes de obra (Residente).** Acción principal «Registrar corte». KPIs: *Cortes registrados*, *En revisión* y *Horas-hombre*. Tabla con corte y periodo, frente y residente, horas-hombre, número de soportes, estado, versión y «Ver detalle». Búsqueda por número, frente o residente y filtro por estado.
- **Cortes por revisar (Director).** La misma pantalla abre filtrada en `En Revisión (Enviado)`. El KPI *Pendientes de visado* (en `info` si hay pendientes) funciona como filtro y la acción de la fila es «Revisar» (primaria). Si no hay pendientes, el estado vacío explica cómo ver los visados y devueltos.
- **Dossier de calidad.** Pestañas `Checklist` · `Documentos del SIG` · `Ensayos NDT` · `Avance y entrega`. La pestaña activa lleva borde inferior `primary` y `aria-current`.
- **Personal SST.** Cuatro `KpiCard` que también filtran la tabla (dos por fila en móvil, cuatro desde 600px): *Bloqueados* (`error`), *Vencen en 15 días o menos* y *Vencen en 16 a 30 días* (`warning`), *Habilitados* (`success`). Debajo, la fecha del semáforo («Semáforo calculado al 17/11/2026»; sin señal, la hora de la última sincronización), la búsqueda por nombre, cédula, cargo o frente y la matriz en orden **Críticos Primero** (1° No Habilitado y Vencidos, 2° 15 días, 3° 30 días, 4° Habilitados; entre iguales, el que vence antes). Las filas bloqueadas usan fondo `error-subtle` y el motivo en `error` y `font-semibold`.
- **Bitácora del registro (Calidad).** Selector de proyecto y de registro (un corte o un requisito del dossier) y la línea de tiempo del registro elegido (#10).

### 5.3. Tablero del proyecto (`/dashboard`, HU-M12)

Consulta de solo lectura para Director y Gerencia, en este orden:

1. **Controles de consulta:** selector de proyecto y «Actualizar consulta» (requiere conexión).
2. **Plazo del dossier:** `Banner` `warning` con los días restantes («Quedan 4 días para el dossier»), `error` si venció y neutro («Plazo del dossier sin iniciar») si el acta no se ha aceptado.
3. **KPIs operativos** (`col-span-4`: uno por fila en móvil, dos en tableta y tres en escritorio): *Avance físico*, *Tiempo contractual transcurrido* (con las fechas del contrato) y *Dossier validado* («8 de 12 requisitos validados»), cada uno con su barra. Debajo, una frase compara el avance físico con el tiempo transcurrido en puntos porcentuales.
4. **Las seis carpetas del dossier:** una tarjeta por carpeta con su porcentaje validado, barra `success`, conteo por estado y «Ver requisitos», que abre un drawer con `scrim` y sin acciones de validación.

Un dato ausente se muestra como «Sin datos», nunca como `0 %`. Un archivo cargado u observado no cuenta como validado. El porcentaje global se calcula con todos los requisitos, no promediando las carpetas.

---

## 6. Comportamiento Interactivo de Botones y Acciones Críticas

Cada botón e interacción en el frontend debe responder con retroalimentación física e inequívoca siguiendo la curva `state-change` (`150ms ease-out`, #9).

### 6.1. Tamaño y Estados Físicos de los Botones

**Tamaño mínimo (token `touch-target`):**
- **Escritorio y vistas de oficina:** alto y ancho mínimo de **48px** para toda acción, incluidos íconos interactivos (`IconButton`).
- **Vistas de campo por debajo de 1024px:** **56px** (`size="field"`). Son las pantallas que se usan en obra desde celular o tableta: registro de corte (#11.3), selector de personal SST (#6.2A), consulta y registro SST, checklist del dossier y la carga de evidencias.
- **Separación:** al menos **8px** (`gutter-sm`) entre los bordes táctiles de dos controles vecinos.

**Variantes** (texto `label-lg`, `14px`, `font-medium`; radio `DEFAULT`):

| Variante | Default | Hover | Uso |
| :--- | :--- | :--- | :--- |
| `primary` | Fondo `primary`, texto `on-primary` | `primary-hover` | Acción principal de la pantalla o del diálogo. |
| `secondary` | Fondo `surface-container`, texto `on-surface`, borde `1px solid outline` | `surface-container-low` | Acciones alternativas y «Cancelar». |
| `warning` | Fondo `warning`, texto `on-warning` | Opacidad 90 % | Confirmar una devolución, una observación o el retiro de un requisito. |
| `ghost` | Sin fondo ni borde, texto `primary` | `surface-container-low` | Acciones terciarias: «Descartar borrador», «Ver todas las carpetas». |

**Estados:**
- **Active (Al oprimir / Clic):** Ligera compresión táctil `transform: scale(0.98)` + borde `primary`. Da sensación inmediata de respuesta mecánica.
- **Focus Visible (Teclado/Accesibilidad):** anillo `focus-ring` de `2px` separado `2px`, con el espacio del color de la superficie (#2.2).
- **Loading (Procesando Petición API):**
  - El botón **conserva su ancho mínimo** para evitar saltos de layout.
  - Queda inactivo de inmediato (`aria-disabled="true"`, `aria-busy="true"`, `pointer-events-none`) para impedir dobles envíos (ej. doble creación de corte o doble visado).
  - El ícono izquierdo se reemplaza por un indicador giratorio de `16px` y el texto cambia al gerundio de la acción: de `"Guardar corte"` a `"Guardando corte…"`, o de `"Confirmar visado"` a `"Registrando visado…"`.
- **Disabled (Bloqueado por Regla de Negocio):** `opacity-50`, `cursor-not-allowed`, sin efecto hover ni `scale`. Se marca con `aria-disabled="true"` (no con `disabled`): sigue recibiendo foco con teclado y anuncia el motivo. **Obligatorio:** Mostrar debajo del botón, en `body-sm` y `on-surface-muted` a contraste completo, el motivo del bloqueo y, cuando aplique, la acción necesaria para resolverlo (ej. *"Necesitas conexión para guardar el curso. Lo que llenaste se conserva mientras sigas en esta pantalla."*). Vincular la explicación al control mediante `aria-describedby`. Un tooltip puede complementar el mensaje visible.

### 6.2. Reglas UX en Flujos de Negocio Críticos

#### A. Bloqueo Estricto de Personal SST en el Corte de Obra (HU-M10)
Cuando el Ingeniero Residente agrega trabajadores a un corte de obra (sección de personal del formulario):
- **Transparencia Operativa (Opción A):** Todos los trabajadores registrados aparecen en la lista. Los habilitados y los próximos a vencer van primero; los que tienen concepto médico `"No Habilitado"`, un curso obligatorio vencido o sin registrar, o no tienen aptitud registrada van en un grupo aparte al final, con bloqueo estricto:
  - Fila con fondo `error-subtle`, texto `on-surface-muted` y `cursor-not-allowed`.
  - Checkbox de selección con `aria-disabled="true"` acompañado de un ícono de candado (`LockIcon`) en `error`. Sigue siendo alcanzable con teclado (#11.4).
  - Badge explícito en la misma fila (texto `error` sobre `error-subtle`, borde `error-border`) indicando la causa exacta: ej. `[Bloqueado: Trabajo en alturas vencido hace 4 días]` o `[Bloqueado: Aptitud médica concepto No Habilitado]`.
  - Si el usuario intenta seleccionar la fila bloqueada (clic, toque, `Espacio` o `Enter`), la fila ejecuta una micro-animación de sacudida horizontal (`error-shake`, `150ms`), resalta el motivo y se anuncia en una región `aria-live`: *"No puedes agregar a Jhon Angulo. Bloqueado: Trabajo en alturas vencido hace 4 días."*
- Sobre la lista se indica el origen de los datos: *"Datos SST en línea · semáforo calculado al 17/11/2026"*. Sin conexión, el selector usa el último estado SST sincronizado y muestra la hora de esa sincronización (#8.3).
- Si un trabajador ya elegido queda bloqueado (por ejemplo, porque SST registró un vencimiento), «Guardar corte» se bloquea con el motivo *"Retira los trabajadores bloqueados por SST."*.

#### B. Flujo de "Visar" vs. "Devolver con Observaciones" (HU-M04 y Checklist HU-M06)
Para evitar rechazos ambiguos por parte del Director de Proyectos o Calidad y no detener la operación en campo:
- **Al oprimir `"Validar requisito"` (ítem individual de la checklist): aviso con «Deshacer» por 5 segundos.**
  1. El panel del requisito se cierra, el ítem cambia de inmediato a `"Validado"` (badge `success`) y la barra de progreso de la carpeta se actualiza.
  2. Aparece un toast (`inverse-surface`, texto `inverse-on-surface`) con el texto *"Requisito validado: «Nombre del requisito»."* y el botón **«Deshacer»** en `inverse-primary`.
  3. **Durante esos 5 segundos no se envía nada a la API ni se escribe en la bitácora.** El requisito muestra *"Validación por confirmar: aún puedes deshacerla"* y la exportación del dossier espera (#6.2C). Al terminar el plazo se envía la validación y se registra en la bitácora (HU-M11).
  4. «Deshacer» devuelve el ítem a su estado anterior sin dejar registro. También funciona con `Ctrl+Z` mientras el aviso está visible (salvo si el foco está en un campo de texto, donde `Ctrl+Z` deshace la escritura).
  5. El conteo se pausa mientras el puntero está sobre el toast o este tiene el foco.
  6. Si el usuario valida otro ítem, sale de la pantalla o cierra la app, la validación pendiente se confirma en ese momento.
  7. Un requisito validado ya no admite cambiar su soporte. Si necesita corrección, Calidad lo observa y vuelve a quedar abierto.
- **Al oprimir `"Visar corte"` (Corte de Obra completo):** abre un diálogo de confirmación: *"¿Confirmar visado técnico del Corte #04?"* con la descripción *"Esta acción quedará registrada en la bitácora de auditoría. El corte quedará aprobado y ya no se podrá modificar."* El foco inicial queda en «Cancelar». «Confirmar visado» pasa a *"Registrando visado…"* mientras se registra. Al terminar, un toast lo confirma y el foco pasa al nuevo estado del corte.
- **Barra de revisión del director:** en el detalle de un corte `En Revisión (Enviado)`, una tarjeta «Revisión del director» explica la decisión y muestra los avisos (corte sin soportes en `info`, versión cambiada en `warning`). Debajo, una barra con `shadow-2`, fija al pie mientras se recorre el corte, reúne «Devolver con observaciones» (secundario) y «Visar corte» (primario). En móvil los dos botones comparten el ancho y el primero se abrevia a «Devolver».
- **Al oprimir `"Devolver con observaciones"` u `"Observar requisito"`:**
  - Abre un **diálogo** con el campo de texto obligatorio enfocado automáticamente («Observación para el residente» o «Motivo de la observación»).
  - Incluye **chips de selección rápida** de causas frecuentes (opcionales) que agregan su frase al texto y se quitan al volver a tocarlos:
    - Cortes: *"Desfase en horas-hombre"*, *"Falta soporte fotográfico"*, *"Soporte PDF ilegible"*, *"Cantidades no coinciden con el avance"*, *"Falta firma del residente"*.
    - Requisitos del dossier: *"Soporte PDF ilegible"*, *"Falta la firma del residente"*, *"Formato en versión obsoleta"*, *"El documento no corresponde al requisito"*.
  - El botón de confirmación (`"Confirmar devolución"` u `"Confirmar observación"`, variante `warning`) permanece **deshabilitado** hasta que el comentario tenga al menos 10 caracteres, con el motivo visible: *"Escribe la observación: faltan 4 caracteres para confirmar."*
  - Una vez confirmado, el registro pasa a estado `"Devuelto con Observaciones"` / `"Observado"`, se registra en la bitácora (HU-M11) y el Ingeniero Residente sigue teniendo habilitado el botón de crear nuevos cortes sin bloqueo (visado no bloqueante).
- **Del lado del residente:** el detalle del corte devuelto muestra un aviso `warning` con la observación entre comillas, el autor, el rol, la fecha y el botón «Corregir corte». Al guardar la corrección se crea una versión nueva y el corte vuelve a `En Revisión (Enviado)`. Un requisito observado muestra la observación en la lista y en su panel, con la acción «Reemplazar soporte».
- **Versiones y conflictos:** cada guardado del residente y cada decisión del director crean una versión del corte con autor, rol, fecha, estado y motivo (al editar, el residente escribe un «Motivo de la edición» de al menos 10 caracteres). Si el corte cambió mientras el director lo revisaba, las acciones se bloquean con *"El corte cambió mientras lo revisabas. Consulta la versión actual antes de decidir."* y un aviso ofrece «Revisar versión actual». Un corte `Visado` ya no se edita: «Editar corte» se muestra bloqueado con el motivo *"El corte está visado y ya no se puede modificar. Registra un corte nuevo para el siguiente periodo."*

#### C. Avance, Plazo y Exportación del Dossier en ZIP (HU-M08)
La pestaña «Avance y entrega» (`/dossier/avance`) reúne el plazo, el avance y la descarga:
- **Plazo contractual de 10 días calendario.** Empieza con la aceptación del acta de facturación, que registra Calidad (referencia y fecha) en un diálogo; no empieza con la creación de un corte. El día de aceptación es el día cero y el décimo día se incluye completo. Cuentan fines de semana y festivos. El aviso es `info` con más de 3 días, `warning` con 3 días o menos y `error` cuando vence. El vencimiento queda visible pero no impide preparar la entrega.
- **Avance.** Solo `Validado` suma. Cada requisito pesa lo mismo, sin importar su carpeta. Se muestra el porcentaje global con su barra, el conteo por estado y una tarjeta por carpeta que filtra la lista de faltantes.
- **Requisitos que faltan para cerrar.** Lista filtrable por carpeta con el motivo (observación, *"Esperando revisión de Calidad."* o *"Falta el soporte PDF."*), el estado y «Abrir requisito», que abre el mismo panel de la checklist.
- **Botones de exportación:**
  1. Secundario `"Exportar borrador parcial (.ZIP)"`: siempre disponible, salvo mientras haya cargas en curso o validaciones por confirmar. Genera el `.zip` con las 6 carpetas, el prefijo `BORRADOR_INCOMPLETO_` en el nombre del archivo y un resumen que detalla qué requisitos faltan.
  2. Primario `"Exportar dossier validado (.ZIP)"`: bloqueado con el motivo visible hasta que haya un acta aceptada, las 6 carpetas tengan al menos un requisito y todos los requisitos estén validados con soporte (ej. *"Faltan 4 requisitos con soporte validado para habilitar el cierre."*).
- **Compilación y descarga.** Al exportar, el botón pasa a *"Preparando ZIP…"*. Al terminar se dispara la descarga y un mensaje de estado (`role="status"`, en `success`) confirma el nombre del paquete y su contenido: las seis carpetas, el resumen de faltantes y la trazabilidad. Si falla, un `Banner` `error` explica la causa y permite reintentar.
- **En el producto** el backend compila el paquete (`zipfile` + `ReportLab` para el acta resumen + `openpyxl`), por lo que exportar requiere conexión: sin señal, el botón se bloquea con *"Necesitas conexión para compilar el dossier."* (En el prototipo el ZIP se genera en el navegador, #12.)

#### D. Checklist y Documentos del SIG (HU-M05, HU-M06, HU-M07)
- **Checklist.** Una tarjeta por carpeta con su barra de avance (`success` al 100 %), el conteo por estado y sus requisitos. Los chips de filtro por estado muestran cuántos hay de cada uno. El botón de cada requisito nombra la tarea del perfil: «Cargar soporte» (Pendiente), «Reemplazar soporte» (Observado), «Revisar soporte» (Calidad con Archivo Cargado) o «Ver detalle».
- **Estructura (solo Calidad).** «Agregar requisito» por carpeta y, en cada requisito, íconos para editar y retirar. El diálogo pide nombre, soporte esperado (opcional) y el documento del SIG que se debe usar (opcional, solo versiones vigentes). Un requisito nuevo arranca en `Pendiente`. Retirar pide confirmación con el foco en «Cancelar» y un botón `warning`. El requisito retirado deja de contar en el avance pero no se borra: queda registrado para la bitácora.
- **Documentos del SIG.** Lista de documentos **vigentes** con código, versión, carpeta y estado en la checklist (el más atrasado entre los requisitos que lo usan). Búsqueda por nombre o código y filtros por carpeta y estado; los filtros se guardan en la URL y se conservan al volver. Las versiones obsoletas solo aparecen en el «Historial» de cada documento (drawer con insignias `Vigente` en `success` y `Obsoleta` en neutro).
- **Publicar documento (Calidad).** Código, versión, nombre, carpeta, nota y PDF. Si el código ya existe, se publica como versión nueva: el formulario propone la versión siguiente, exige una nota de al menos 10 caracteres sobre qué cambió y avisa que la versión anterior pasa al historial.
- **Ensayos NDT (Calidad).** Cada informe se registra con junta soldada, tipo de ensayo, laboratorio, número de informe, fecha (no posterior a hoy), resultado y PDF obligatorio, y crea un requisito propio en la Carpeta 4 en `Archivo Cargado`. No se aceptan duplicados por laboratorio y número de informe. El resultado del laboratorio (`Conforme` / `No conforme`) es distinto del estado documental: un informe `No conforme` se muestra en `error` con la nota *"Requiere tratamiento de la junta. Validar el documento no habilita la soldadura."*

#### E. Registro SST: cursos y aptitud médica (HU-M09)
- **Ficha del trabajador.** Estado general, cursos que exige su cargo, aptitud médica e historial. Un curso obligatorio sin registrar o la falta de aptitud se muestran como aviso `error` y dejan al trabajador `No Habilitado`.
- **Semáforo.** Cada curso y la aptitud se evalúan por su vencimiento: `Vencido` (fecha pasada), `Próximo a Vencer (15d)` (de 0 a 15 días; el día del vencimiento se lee «Vence hoy»), `Próximo a Vencer (30d)` (de 16 a 30 días) y `Habilitado` (más de 30). El estado general es el peor de todos; el motivo nombra el ítem que lo causa y cuántos más están en alerta («y 1 bloqueo más»).
- **Registros inmutables.** Un curso guardado no se edita ni se borra. Para renovarlo o corregirlo se registra otro del mismo tipo, indicando si es «Renovación» o «Corrección», y el anterior queda en el historial como reemplazado. Antes de guardar, el formulario muestra cómo cambiaría el estado del trabajador.
- **Validaciones.** La expedición no puede ser posterior a hoy y el vencimiento debe ser posterior a la expedición. El certificado del curso es obligatorio (#7.2).
- **Aptitud médica.** Solo concepto (`Habilitado` / `No Habilitado`, con tarjetas de opción) y fechas, bajo un aviso de «Reserva legal» (#10).
- **Permisos.** Solo Coordinación SST registra. Director, Calidad y Gerencia consultan y ven las acciones bloqueadas con el motivo.

---

## 7. Estados de Carga (Skeletons), Subida a S3 y Previsualización

### 7.1. Política de Cero Spinners de Pantalla Completa (Skeleton Loaders)
Queda prohibido bloquear toda la pantalla con un spinner circular genérico durante las peticiones `GET` a la API de Django. Para evitar saltos bruscos de diseño (*Cumulative Layout Shift*):
- **Tablas (Cortes, Personal SST, Documentos):** Mientras la petición está en curso (`isLoading`), se renderiza la cabecera real de la tabla junto con **5 a 8 filas de Skeleton** (`animate-pulse` con fondo `surface-container-high`) que respetan exactamente el ancho de cada columna (`ResponsiveTable` con `loading`).
- **Matriz de las 6 Carpetas del Dossier:** Se muestran las 6 tarjetas estructurales con sus títulos fijos (*Carpeta 1 · Documentación contractual y legal*, etc.) y barras de progreso en estado *skeleton* hasta que hidratan los porcentajes reales.
- **Consultas (Bitácora, Tablero):** una tarjeta con líneas *skeleton* y `aria-busy="true"` ocupa el lugar del resultado mientras se consulta.
- **Recargas en segundo plano (Refetching tras un filtro o cambio de estado):** Si los datos ya están en pantalla y el usuario cambia un filtro o valida un ítem, se mantiene la tabla visible con una barra de progreso lineal ultradelgada (`2px`, color `primary`) en la parte superior del contenedor, sin borrar el contenido actual (`ResponsiveTable` con `refetching`).
- **Módulos cargados bajo demanda:** mientras se abren, un mensaje de estado en el área de contenido (ej. *"Abriendo módulo de calidad…"*), nunca un bloqueo de pantalla.

### 7.2. Carga de Archivos a S3 (Drag & Drop) y Previsualizador Lateral (HU-M03, HU-M06, HU-M07)
La carga de fotografías de obra, certificados de materiales, reportes NDT y soportes PDF sigue un flujo blindado contra conexiones inestables:

1. **Zona de Drag & Drop Interactiva (`FileUpload`):**
   - Mostrar un botón «Seleccionar archivos» (o «Seleccionar archivo» si solo admite uno) que abra el selector del dispositivo mediante toque o teclado. En equipos con puntero, la zona admite también arrastrar archivos.
   - Borde punteado `2px dashed outline` que cambia a `2px dashed primary` con fondo `surface-container-low` cuando el usuario arrastra un archivo encima (`onDragOver`), y a borde `error` si se rechazó un archivo.
   - Especifica claramente los formatos y límites antes de subir, según el contexto:

   | Contexto | Formatos | Archivos | Ayuda visible |
   | :--- | :--- | :--- | :--- |
   | Soportes del corte (HU-M03) | PDF, JPG, PNG | Varios | *"Selecciona archivos PDF, JPG o PNG (máx. 15 MB por archivo)"* |
   | Certificado de un curso SST (HU-M09) | PDF, JPG, PNG | Uno | Ídem |
   | Soporte de un requisito, documento del SIG, reporte NDT | Solo PDF | Uno | *"Selecciona un archivo PDF (máx. 15 MB)"* |

2. **Validación Instantánea en Cliente (Pre-Upload):**
   - Si el archivo no tiene un formato permitido o supera el peso límite, se rechaza en `0ms` en el navegador mostrando un borde `error` y un mensaje claro debajo del dropzone sin consumir ancho de banda hacia el servidor. El mensaje nombra el archivo, la causa y la solución: *"«acta.docx» no es PDF, JPG ni PNG. Selecciona un archivo en uno de esos formatos."* o *"«foto.jpg» pesa 18,2 MB y el máximo es 15 MB. Reduce el archivo y vuelve a seleccionarlo."*
   - Un archivo con el mismo nombre y tamaño que uno ya adjunto al corte no se duplica: *"«foto.jpg» ya está adjunto a este corte."*
   - Los reportes NDT comprueban además que el contenido sea un PDF real, no solo la extensión.
3. **Barra de Progreso Real de Subida (`UploadItem`):**
   - Durante la carga hacia el bucket compatible con S3, cada archivo muestra una tarjeta compacta con su nombre, tamaño en MB, una barra de progreso horizontal con el porcentaje exacto (`0%` a `100%` en `tabular-nums`) y un botón `"Cancelar"` (`X`).
   - Al llegar al `100%`, mostrar «Confirmando carga…» hasta que se confirme el almacenamiento y la asociación del archivo con el registro. Después, mostrar «Archivo cargado» y actualizar la checklist o la lista de soportes.
   - Si falla la carga, conservar los campos del formulario y los archivos confirmados. Mostrar el error junto al archivo y un botón «Reintentar».
   - Si la falla es por falta de señal, el archivo pasa a «En cola» y se sube solo al recuperar conexión (#8.3). La cola vive por encima de las pantallas: la carga sigue aunque se cierre el panel o se cambie de módulo, y la lista muestra su avance (*"«reporte.pdf» espera la señal. Se subirá solo al recuperar la conexión."*). Si el dispositivo no tiene espacio para guardarlo, pedir que se seleccione de nuevo cuando vuelva la señal.
4. **Soportes del corte (HU-M03):**
   - Se agregan desde el detalle del corte o desde su edición. En un corte nuevo, la sección explica *"Guarda el corte para adjuntar fotografías y PDF."*
   - Cada soporte muestra miniatura o ícono, tipo, tamaño, autor y fecha, con «Ver». «Descargar» es una acción secundaria dentro del visor. La sección resume cuántos hay («3 soportes · 2 fotografías, 1 PDF») y, si no hay ninguno, lo explica según el perfil (*"Este corte aún no tiene soportes. Agrega fotografías o PDF del periodo."* / *"El residente no adjuntó soportes en este corte."*).
   - El residente autor puede «Quitar» un soporte mientras el corte no esté visado, con el aviso «Deshacer» de 5 segundos (#6.2B). Un soporte retirado no se borra: queda marcado con autor y fecha para la bitácora. Agregar o quitar soportes no crea una versión nueva del corte.
   - En un corte `Visado` no hay zona de carga ni «Quitar»: *"El corte está visado. Sus soportes ya no se pueden modificar."* Director, Calidad y Gerencia ven los mismos soportes en modo consulta.
5. **Previsualizador Integrado en Drawer Lateral (Split-View Inspection):**
   - Al hacer clic en cualquier soporte PDF o fotografía ya cargada (tanto en el Dossier como en la revisión de un Corte de Obra por el Director), **nunca se saca al usuario de la pantalla ni se fuerza la descarga a su disco local por defecto**.
   - Desde `1024px`, se abre un **drawer lateral derecho** de `min(45vw, 640px)` con animación `surface-enter` (`200ms`) y **sin `scrim`**, para que la lista de la izquierda siga visible. Por debajo de `1024px`, se abre un visor de pantalla completa dentro de la aplicación, según la sección 11.
   - El Drawer contiene en la cabecera el título y los metadatos (carpeta, autor del cargue, fecha/hora exacta, junta NDT vinculada si aplica) con el botón «Cerrar»; en el cuerpo, el estado, las indicaciones (documento vigente del SIG que se debe usar, observación pendiente), el visor nativo de PDF/Imagen y el historial del requisito; y en el pie los botones de acción para Calidad: `"Observar requisito"` y `"Validar requisito"`. Así se audita y califica sin perder de vista la checklist. «Validar requisito» sigue la regla de 5 segundos con «Deshacer» de #6.2B.

---

## 8. Resiliencia en Campo y Persistencia Local (Auto-Save Drafts)

El registro de un Corte de Obra (HU-M02: avance físico por actividad, horas-hombre por trabajador e insumos consumidos) y el registro de ensayos NDT ligados a juntas soldadas (HU-M07) son tareas extensas propensas a cierres accidentales de pestaña o caídas de señal en obra, donde puede no haber cobertura hasta por 6 horas.

### 8.1. Autoguardado Silencioso en `localStorage`
- **Formulario de corte.** Cada vez que el Ingeniero Residente modifica un campo (`onChange` con un *debounce* de `500ms`), el estado completo del formulario (frente, periodo, actividades, personal SST seleccionado con sus horas, insumos, observaciones y motivo de la edición) se serializa en `localStorage` bajo una clave vinculada al usuario y al corte: `loard_draft_corte_proj_{id}_user_{id}` en el producto; en el prototipo, `loard_prototipo_borrador_{correo}_{id del corte o «nuevo»}`. El borrador también se guarda al salir de la pantalla.
- **Formulario NDT.** Los metadatos se guardan en cada cambio por usuario. El PDF no se guarda: al volver hay que seleccionarlo de nuevo, y el formulario lo dice.
- Encima del formulario se muestra un indicador discreto de estado (`role="status"`, `body-sm`, `on-surface-muted`):
  - Mientras escribe: `"Guardando borrador local…"`.
  - Tras `500ms`: `"Borrador guardado en este navegador."`
  - Si el navegador no lo permite: `"El navegador no permitió guardar el borrador. Conserva esta pantalla abierta."`

### 8.2. Recuperación y Limpieza del Borrador
- Si el residente recarga la página o vuelve a entrar al formulario y existe un borrador no enviado, aparece un banner informativo (`info-subtle`, borde `info-border`) en la parte superior del formulario:
  > *"Hay un borrador del 17/11/2026 14:32. Recupera los campos guardados en este navegador. [Continuar editando] | [Descartar borrador]"*
- Mientras el aviso está visible, los campos quedan inactivos y «Guardar corte» se bloquea con el motivo *"Recupera o descarta el borrador antes de continuar."* Si el corte tiene una versión más reciente que la del borrador, solo se ofrece «Descartar borrador», con la explicación.
- Si el usuario intenta cerrar la pestaña o navegar fuera con cambios sin guardar o con archivos subiendo a S3 con conexión activa, se dispara el evento nativo `beforeunload`. Lo que ya está en la cola sin conexión (#8.3) no se pierde al cerrar.
- Una vez que el endpoint `POST /api/v1/cortes/` responde `201 Created`, el sistema limpia automáticamente la clave de `localStorage` y redirige al detalle del corte recién creado con un `Toast` de éxito que invita a adjuntar los soportes.

### 8.3. Caída de Señal y Cola de Sincronización (`OfflineQueueBanner`)

**Indicador permanente de conexión (topbar).** Junto a las alertas, un ícono de nube con texto corto, siempre visible (`role="status"`):

| Estado | Ícono y texto | Color |
| :--- | :--- | :--- |
| En línea | Nube · «En línea» (en móvil solo el ícono, con texto para lectores de pantalla) | `on-surface-muted` |
| Sin conexión | Nube tachada · «Sin señal» | `warning` |
| Sincronizando | Flechas circulares · «Enviando 2 de 3» | `info` |
| Error de envío | Nube con alerta · «1 envío falló» | `error` |

**Franja de aviso (`OfflineQueueBanner`).** Aparece bajo la topbar, fija al hacer scroll, con `role="status"`:
- **Sin conexión** (`warning-subtle`, borde `warning-border`): *"Sin conexión. 3 cambios guardados en este dispositivo; se enviarán al recuperar señal."* Cada módulo puede reemplazar el texto para decir qué se puede hacer sin señal (ej. en el dossier: *"Puedes consultar la checklist y los documentos vigentes. Los archivos que selecciones esperan la señal. Validar, observar, publicar y cambiar la checklist requieren conexión."*).
- **Sincronizando** (`info-subtle`): *"Señal recuperada. Enviando 2 de 3…"* con barra de progreso.
- **Todo enviado** (`success-subtle`): *"Todo sincronizado a las 15:04."* Se oculta sola a los 5 segundos.
- **Envío rechazado** (`error-subtle`, permanece hasta que el usuario actúa): *"No se pudo enviar el Corte #07: Jhon Angulo tiene el curso de alturas vencido desde ayer. [Revisar corte]"*

**Qué se puede hacer sin señal:**
- Crear y editar cortes, agregar actividades, horas-hombre e insumos, y adjuntar fotos o PDF.
- Oprimir «Enviar corte»: el corte queda en la cola local con el estado `Pendiente de envío` (solo local, #10) y aparece así en el historial.
- Seleccionar soportes, certificados y reportes: quedan «En cola» y se suben solos al volver la señal.
- Consultar el estado SST de los trabajadores con la hora de la última sincronización: *"Datos SST actualizados hoy a las 06:10"*.
- Consultar la checklist, los documentos vigentes, la bitácora y el tablero con los últimos datos cargados.

**Qué requiere señal** (el botón se muestra deshabilitado con el motivo *"Necesitas conexión para…"*, y lo ya escrito se conserva en pantalla): visar o devolver cortes; validar u observar requisitos; agregar, editar o retirar requisitos; publicar documentos del SIG; registrar ensayos NDT; registrar la aceptación del acta; exportar el dossier; registrar cursos y aptitud médica; y actualizar una consulta.

**Reglas de la cola:**
- Se guarda en el dispositivo (IndexedDB), incluidos los archivos, y se conserva al cerrar la app.
- Se envía en el orden en que se creó, apenas vuelve la señal, sin que el usuario tenga que hacer nada.
- Cada envío lleva una clave única (`Idempotency-Key`); si un reintento llega dos veces, el servidor no duplica el corte.
- Al sincronizar, el servidor vuelve a revisar la habilitación SST. Si un trabajador se venció mientras no había señal, responde `409 Conflict`; el corte vuelve a borrador, se marca el trabajador bloqueado y la franja muestra el motivo exacto.
- Las cargas pertenecen a quien las inició: al cerrar sesión se descartan.

---

## 9. Motion & Micro-interactions

Micro-interacciones sobrias, funcionales y rápidas, **entre `150ms` y `200ms`**, para estados de hover, validación de checklist, apertura de visores PDF y confirmaciones de visado. Ninguna transición baja de `150ms` ni supera `350ms`. La única excepción son los indicadores de progreso indeterminado y el giro del indicador de carga, que se repiten mientras dura la espera. Con `prefers-reduced-motion: reduce`, se suprimen todas las animaciones y transiciones (la sacudida, el pulso de los skeletons y los desplazamientos). La retroalimentación se mantiene mediante texto, iconos y cambios de estado.

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
    duration: 5000ms   # plazo de «Deshacer» antes de escribir en la bitácora (#6.2B)
  indeterminate:
    duration: 1200ms   # barra de progreso sin porcentaje; se repite
```

| Animación (clase de Tailwind) | Curva | Uso |
| :--- | :--- | :--- |
| `animate-slide-in-right` / `animate-slide-out-right` | `surface-enter` / `surface-exit` | Drawer y visor lateral. |
| `animate-slide-in-left` / `animate-slide-out-left` | `surface-enter` / `surface-exit` | Menú lateral temporal. |
| `animate-pop-in` | `surface-enter` | Diálogos y toasts: entran subiendo `8px` con fundido. |
| `animate-fade-in` / `animate-fade-out` | `surface-enter` / `surface-exit` | Fondo `scrim`. |
| `animate-error-shake` | `ease-out` | Fila bloqueada del selector SST (#6.2A). |

---

## 10. Voice, Content Strategy & Auditoría (Bitácora)

### Tono y Terminología Oficial
Tono riguroso, formal y de ingeniería civil y petrolera en español neutro colombiano. Los estados son categóricos e idénticos entre la base de datos (Django TextChoices), la API REST y las insignias de React (en el código salen de `@/lib/estados`, nunca se escriben a mano). Cada insignia (`StatusBadge`) usa el texto del token indicado sobre su `*-subtle`, con borde `*-border`, radio `sm`, texto `label-md` y un punto de `8px` del mismo color. Cuando el color no basta para distinguir dos estados, un ícono reemplaza el punto:

| Módulo | Estados Oficiales Permitidos | Token Semántico | Marca |
| :--- | :--- | :--- | :--- |
| **Personal SST (HU-M09, HU-M10)** | `Habilitado` | `success` | Punto |
| | `Próximo a Vencer (30d)` | `warning` | Punto |
| | `Próximo a Vencer (15d)` | `warning` | Triángulo de alerta y texto en negrita |
| | `Vencido` / `No Habilitado` | `error` | Candado |
| **Cortes de Obra (HU-M02, HU-M04)** | `En Revisión (Enviado)` | `info` | Punto |
| | `Visado` | `success` | Punto |
| | `Devuelto con Observaciones` | `warning` | Punto |
| **Checklist Dossier (HU-M05 a M08)** | `Pendiente` | `on-surface-muted` sobre `surface-container`, borde `outline` | Punto |
| | `Archivo Cargado` | `info` | Punto |
| | `Observado` | `warning` | Punto |
| | `Validado` | `success` | Punto |

**Estado solo local (no existe en la base de datos):** `Pendiente de envío` para cortes en la cola sin conexión (#8.3). Se muestra con `on-surface-muted`, borde punteado `outline` e ícono de nube tachada.

Una insignia puede llevar un texto más específico que el nombre del estado, conservando su color e ícono: `Bloqueado: Trabajo en alturas vencido hace 4 días`.

**Otras etiquetas que no son estados oficiales:**
- Resultado del laboratorio NDT: `Conforme` (texto `success`) / `No conforme` (texto `error`). Es independiente del estado documental del requisito.
- Versiones de documentos del SIG: `Vigente` (`success`) / `Obsoleta` (neutro).

**Vocabulario de acciones:** «Registrar corte», «Corregir corte», «Visar corte», «Devolver con observaciones», «Cargar / Reemplazar / Revisar soporte», «Validar requisito», «Observar requisito», «Retirar requisito», «Publicar documento», «Registrar ensayo NDT», «Registrar curso», «Actualizar aptitud médica». Los mensajes de error dicen qué pasó y qué hacer, y los estados vacíos explican qué significa la ausencia de datos y cómo resolverla (ej. *"La ausencia de información no representa un avance de cero."*).

**Formato de datos:** fechas `DD/MM/AAAA`, fecha y hora `DD/MM/AAAA HH:mm:ss` en hora de Bogotá, horas-hombre con la unidad `HH`, porcentajes con un decimal como máximo y coma decimal (`68,5 %`).

### Reserva Legal e Invisibilidad Clínica (SST)
En ningún formulario, tabla, *tooltip* o bitácora se mostrarán campos para diagnósticos médicos, patologías o historias clínicas. El campo de aptitud médica es estrictamente binario/categórico (`Habilitado` / `No Habilitado`) acompañado de su fecha de expedición y fecha de vencimiento. El formulario de aptitud lo recuerda con un aviso «Reserva legal».

### Bitácora de Auditoría (HU-M11)
Cada cambio de estado en un corte o en un ítem del dossier renderiza una línea de tiempo (`Timeline` vertical, de la más reciente a la más antigua) de solo lectura con formato inmutable:
`[DD/MM/AAAA HH:mm:ss] — [Nombre y Rol del Usuario] cambió el estado de [Estado Anterior] a [Estado Nuevo]. Motivo/Observación: "[Texto si aplica]"`

La misma línea de tiempo aparece en:
- **Bitácora del registro** (`/dossier/bitacora`, Calidad): se elige el proyecto y el registro (corte o requisito) y se ve su estado actual y el conteo de eventos confirmados.
- **Historial de versiones del corte**, con la opción de consultar cada versión.
- **Historial del requisito**, dentro de su panel.
- **Historial del trabajador SST**, en su ficha.

Una validación deshecha dentro de los 5 segundos de #6.2B no genera línea en la bitácora. Retirar un requisito o un soporte tampoco borra nada: queda registrado quién lo retiró y cuándo.

---

## 11. Comportamiento responsive y criterios de aceptación

### 11.1. Retícula 12–8–4, navegación y márgenes

El diseño parte de móvil y crece. Todas las pantallas se maquetan sobre la retícula definida en #4 (tokens `grid` y `tailwind-screens`, clase `grid-page`):

| Dispositivo | Ancho del viewport | Columnas | Gutter | Margen lateral | Navegación | KPIs (`col-span-4`) |
| --- | --- | :---: | :---: | :---: | --- | --- |
| **Móvil** | Menos de 600 px | **4** | 16 px | 16 px | Menú lateral temporal desde un botón en la barra superior | 1 por fila |
| **Tableta** | 600–1023 px | **8** | 16 px | 24 px | Menú lateral temporal desde un botón en la barra superior | 2 por fila; la tercera pasa a la fila siguiente |
| **Escritorio** | Desde 1024 px | **12** | 24 px | 24 px | Menú lateral fijo de 256 px; la retícula ocupa el área restante | 3 por fila |

**Uso de columnas por tipo de pantalla:**
- **Formularios** (registro de corte, cursos, aptitud, documentos): 4 de 4 en móvil, 8 de 8 en tableta y 8 de 12 centradas en escritorio (`FormLayout`).
- **Revisión con visor** (Director, Calidad): en escritorio, la lista o checklist sigue visible y el drawer del visor ocupa la derecha (#7.2). Por debajo de 1024 px, el visor es de pantalla completa.
- **Personal del corte**: en escritorio, el selector ocupa 7 columnas y el resumen de los elegidos 5.
- **Tablas y matrices:** ocupan todas las columnas disponibles.

En pantallas estrechas, la barra superior mantiene el botón de menú, el nombre del proyecto activo, el indicador de conexión y sus acciones. El rol deja de mostrarse en la barra y se consulta, junto con el nombre del usuario, al pie del menú lateral. Las alertas críticas del flujo activo permanecen visibles al inicio del contenido.

La página se ajusta al viewport sin desplazamiento horizontal global. Los títulos, mensajes y botones con textos largos admiten saltos de línea. Cada pantalla nueva arranca desde arriba.

### 11.2. Tablas y bandejas de trabajo

- **Tablas responsivas (`ResponsiveTable`).** Desde 600 px son tablas; en móvil, cada fila pasa a una tarjeta: la columna principal es el título, cada dato lleva como etiqueta el nombre de su columna y las acciones van al pie. Las filas bloqueadas usan fondo `error-subtle` y las de alerta `warning-subtle`.
- **Cortes de obra.** En móvil, cada fila se presenta como un resumen con identificador, periodo, estado y acción según el rol. «Ver detalle» da acceso a avances, horas-hombre, insumos y soportes. Los cortes `Pendiente de envío` aparecen primero.
- **Personal SST.** Mostrar nombre, cédula, cargo, estado y motivo exacto del bloqueo en la misma fila o tarjeta, con «Ver ficha». Conservar la búsqueda y el orden «Críticos Primero» en todos los anchos.
- **Dossier.** Apilar las seis carpetas en móvil. Cada carpeta muestra nombre, progreso y conteos de requisitos por estado. Cada requisito conserva su estado y su acceso al soporte.
- **Matrices comparativas.** Cuando la comparación entre columnas sea parte de la tarea, conservar la tabla (`keepTableOnMobile`) y limitar el desplazamiento horizontal a su contenedor. Los indicadores de carga reproducen la estructura visible de la tabla o de las tarjetas según el ancho.

### 11.3. Formularios, visores y acciones táctiles

- **Registro de corte.** En móvil, usar una sola columna. Presentar información del corte (frente y periodo), actividades ejecutadas, personal (#6.2A), horas-hombre por trabajador, insumos consumidos y observaciones en secciones con acciones «Agregar» junto a cada grupo. Mantener visible el estado del borrador cerca del encabezado del formulario. Mostrar la acción principal en un pie fijo («Volver a cortes» y «Guardar corte», o «Guardar nueva versión» al editar), con espacio suficiente debajo del contenido para evitar que cubra el último campo. Con el teclado abierto, el campo activo y su mensaje de error deben quedar visibles.
- **Detalle del corte.** Encabezado con estado y «Editar corte», aviso de devolución si aplica, conmutador entre «Detalle del corte» e «Historial de versiones», tablas de actividades, horas-hombre e insumos, observaciones, soportes y, para el director, la barra de revisión fija al pie (#6.2B).
- **Visor de soportes.** En la variante de pantalla completa, el documento se desplaza dentro del visor. La cabecera conserva el botón «Cerrar» y los metadatos. El pie mantiene «Observar requisito» y «Validar requisito» para los roles autorizados. Al volver, conservar filtros y posición de la lista.
- **Confirmaciones y observaciones.** En móvil, usar un diálogo con cuerpo desplazable y espacio suficiente para el comentario y sus sugerencias. Mostrar debajo del campo el requisito de 10 caracteres y mantener accesibles las acciones con el teclado abierto.
- **Interacción táctil.** Áreas táctiles de 48 px en escritorio y 56 px en las vistas de campo por debajo de 1024 px, con 8 px entre controles (#6.1). Mostrar el estado mediante texto además del color y mantener visibles las instrucciones necesarias para desbloquear una acción.
- **Recuperación de carga.** Si se pierde la conexión, cada archivo afectado indica el fallo y pasa a la cola local (#8.3). El borrador del formulario sigue disponible y la lista distingue los archivos confirmados de los que esperan señal o deben seleccionarse de nuevo.

### 11.4. Navegación por teclado

Toda la aplicación se puede operar sin ratón ni pantalla táctil.

**Orden y foco**
- El primer elemento que recibe foco es un enlace **«Saltar al contenido»**, visible solo al recibir foco.
- `Tab` recorre los controles en el mismo orden en que se ven: barra superior → franja de alertas → contenido → pie fijo de acciones. `Shift+Tab` recorre en sentido inverso.
- El foco siempre es visible: anillo `focus-ring` de #2.2, en ambos temas.
- Las filas de tablas no reciben foco; sí lo reciben las acciones dentro de ellas. Un contenedor con desplazamiento horizontal recibe foco (`tabindex="0"`, con `aria-label`) para recorrerlo con las flechas.
- Los controles bloqueados por regla de negocio usan `aria-disabled="true"`, siguen recibiendo foco y anuncian el motivo (#6.1, #6.2A).
- Cuando una acción hace desaparecer el control que tenía el foco (visar un corte, retirar un requisito, limpiar filtros), el foco pasa al elemento que la reemplaza: el nuevo estado del corte, el título de la carpeta o el campo de búsqueda.

**Activación**
- `Enter` y `Espacio` activan botones; `Espacio` marca casillas; `Enter` sigue enlaces.
- En una fila SST bloqueada, `Espacio` o `Enter` ejecuta la sacudida y resalta el motivo, igual que un clic.
- `Ctrl+Z` deshace la última validación mientras el aviso de #6.2B está visible.

**Diálogos, popovers, drawers y menú temporal**
- Al abrir, el foco va al primer campo (ej. el comentario de una observación). En confirmaciones de acciones que quedan en la bitácora o que retiran algo, como «Visar corte» o «Retirar requisito», el foco inicial va a «Cancelar». En el panel de un requisito, el foco inicial va a su estado, para que el lector de pantalla empiece por ahí.
- Mientras están abiertos, `Tab` y `Shift+Tab` circulan solo dentro de ellos (el foco no se escapa a la página de fondo).
- `Esc` los cierra. Si el formulario ya tiene texto, `Esc` primero pregunta en el mismo diálogo: *"¿Descartar la observación escrita? [Descartar observación] [Seguir escribiendo]"* (en otros formularios: *"¿Descartar los cambios? [Descartar] [Seguir editando]"*).
- Un clic o toque en el fondo `scrim` también cierra, con la misma pregunta si hay texto escrito.
- Al cerrar, el foco vuelve al control que los abrió.
- No hay trampas de foco fuera de estos componentes: desde cualquier punto se puede salir con `Tab`.

**Avisos**
- Los toasts y la franja `OfflineQueueBanner` se anuncian con `role="status"` sin robar el foco. Sus botones («Deshacer», «Revisar corte») se alcanzan con `Tab`.

### 11.5. Verificación antes de dar por terminado el MVP

Probar a 360 y 390 px de ancho con toque y teclado en pantalla. Revisar también 600 y 1024 px para verificar los cambios de retícula y navegación, y 1280 px para comprobar la vista de escritorio. Repetir en modo claro y oscuro.

1. **Registrar un corte con evidencia.** Como residente, agregar una actividad, un trabajador habilitado con sus horas y un insumo, y guardar. En el detalle, seleccionar una foto y un PDF. Cortar la conexión durante la carga y comprobar que el archivo queda «En cola» y la franja de sin conexión aparece. Recuperar la señal y verificar que se sube solo, sin duplicarse.
2. **Consultar un bloqueo SST.** Buscar un trabajador bloqueado y comprobar que el motivo se puede leer desde la lista y que el selector del corte impide agregarlo. Verificar lo mismo usando solo el teclado.
3. **Revisar un corte.** Como director, abrir un corte en revisión, devolverlo con una observación (comprobar el mínimo de 10 caracteres y la pregunta al cerrar con `Esc`) y visar otro con el foco inicial en «Cancelar». Como residente, comprobar que el corte devuelto muestra la observación y se puede corregir.
4. **Revisar un soporte del dossier.** Como Calidad, abrir un PDF, consultar sus metadatos, validarlo y usar «Deshacer» antes de 5 segundos; comprobar que no queda línea en la bitácora. Luego observar otro requisito, cerrar con `Esc` y verificar que el foco vuelve al requisito.

En todos los recorridos, verificar que la página no tenga desplazamiento horizontal global, que los controles conserven el foco visible, que las áreas táctiles de campo midan 56 px y que los mensajes largos no oculten acciones.

---

## 12. Alcance del prototipo

El prototipo de alta fidelidad demuestra todas las historias del MVP sin backend. Estas son sus diferencias con el producto descrito arriba:

- **Datos y reloj.** Todos los datos son ficticios. El reloj está fijo al 17/11/2026 para reproducir todos los estados SST y el plazo del dossier. El contrato principal es CW-118 · Estación compresora; la bitácora y el tablero agregan CW-204 para comparar proyectos.
- **Acceso.** `/acceso` muestra cinco perfiles de ejemplo en un selector que completa el correo; todos usan la misma contraseña de ejemplo. La sesión dura lo que la pestaña. El botón «Cerrar sesión» de la topbar vuelve a `/acceso`. Las alertas de la topbar y el menú de cuenta no están implementados: el nombre y el rol se ven al pie del menú lateral.
- **Persistencia.** Cortes, versiones, borradores, soportes y dossier se guardan en el navegador (`localStorage`). Los cursos y la aptitud SST se mantienen en memoria y se reinician al recargar. Los archivos originales solo existen durante la sesión: después de recargar, el visor dice *"Vista previa no disponible"* y conserva los datos del soporte.
- **Sin señal.** Se simula con el botón «Prototipo: simular sin señal» de la topbar. Están implementados el indicador «En línea» / «Sin señal», la franja de sin conexión con el texto de cada módulo, la cola de archivos (quedan «En cola» y suben solos al volver) y el bloqueo de las acciones que requieren señal. No están implementados la cola de cortes con el estado `Pendiente de envío`, IndexedDB, `Idempotency-Key`, el rechazo `409` al sincronizar ni los estados «Sincronizando» y «Error de envío» del indicador.
- **Exportación del dossier.** El ZIP se genera en el navegador (`fflate`), incluso sin señal. Contiene una carpeta por cada una de las seis (con un `LEEME.txt`), `RESUMEN.txt` con los faltantes y `TRAZABILIDAD.json`. Se nombra `BORRADOR_INCOMPLETO_CW-118_{fecha}.zip` o `DOSSIER_DEMO_VALIDADO_CW-118_{fecha}.zip`. Los soportes cuyo original no está disponible se incluyen como fichas `.FICHA_DEMO.txt`. No constituye una radicación contractual.
- **Avisos propios del prototipo.** Bajo la topbar, una franja `info` permanente dice *"Prototipo de alta fidelidad · Datos de ejemplo guardados en este navegador."* La bitácora y el tablero tienen un panel plegable «Demostración» para simular escenarios: consulta normal, sin registros, error de consulta, acceso denegado e información incompleta.
- **Página de muestra.** `/muestra` («Componentes» en el menú, para todos los perfiles) enseña los colores, la tipografía, la retícula y cada componente compartido en sus estados.
