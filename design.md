---
name: "Loard Construcciones - Hito 2 MVP"
description: "Sistema operativo de alta precisión para gestión de cortes de obra, dossier de calidad Chevron y control estricto de habilitación SST."
stack: "Django + DRF | React + TypeScript + Tailwind CSS | PostgreSQL | S3"
---

## 1. Overview

Sistema corporativo de misión crítica para **Loard Construcciones S.A.S.** Diseñado con una estética sobria, limpia y de ingeniería industrial con mínima saturación de color. La paleta se fundamenta en un tono pizarra oscuro institucional y neutros arquitectónicos, reservando el color estrictamente para estados funcionales (éxito para validado/habilitado, ámbar para alertas preventivas/observaciones y carmín para bloqueos normativos). Se eliminan colores accesorios decorativos (como cianes y azules eléctricos innecesarios) para evitar sobrecarga cognitiva en entornos operativos y de campo.

---

## 2. Colors & Semantic Tokens

La paleta se consolida en un esquema refinado de alto contraste: base pizarra profunda (`#1E293B`), neutros de escala de grises con mínima tintura y acento funcional contenido. Los estados de advertencia y bloqueo se aplican con delicadeza en bordes (`1px solid`), indicadores puntuales (dots de `8px`) e insignias sutiles en lugar de fondos saturados masivos.

- **Primary (`#1E293B`):** Azul pizarra industrial profundo y sobrio para barras de navegación, encabezados y botones de confirmación primaria.
- **Accent (`#1E293B` / `#334155`):** Azul marino/pizarra sobrio para enlaces, bordes activos y anillos de foco (`focus-visible`).
- **Success (`#15803D`):** Verde bosque normativo para ítems validados, cortes visados y personal SST habilitado (> 30 días de vigencia).
- **Warning (`#B45309`):** Ámbar técnico sobrio para alertas preventivas de SST (30 y 15 días), plazo de dossier en riesgo y requisitos/cortes observados.
- **Error (`#B91C1C`):** Rojo carmesí para bloqueo terminante de personal no habilitado/vencido y vencimiento del plazo de 10 días del dossier.

```yaml
colors:
  accent: "#1E293B"
  success: "#15803D"
  success-subtle: "#F0FDF4"
  success-border: "#BBF7D0"
  warning: "#B45309"
  warning-subtle: "#FFFBEB"
  warning-border: "#FDE68A"
  error: "#B91C1C"
  error-subtle: "#FEF2F2"
  error-border: "#FECACA"
  info: "#334155"
  light:
    primary: "#1E293B"
    primary-hover: "#0F172A"
    on-primary: "#FFFFFF"
    surface: "#F8FAFC"
    on-surface: "#0F172A"
    on-surface-muted: "#475569"
    surface-container: "#FFFFFF"
    surface-container-low: "#F1F5F9"
    surface-container-high: "#E2E8F0"
    outline: "#64748B"
    outline-variant: "#E2E8F0"
  dark:
    primary: "#94A3B8"
    primary-hover: "#CBD5E1"
    on-primary: "#0F172A"
    surface: "#0B1320"
    on-surface: "#F1F5F9"
    on-surface-muted: "#94A3B8"
    surface-container: "#131F33"
    surface-container-low: "#0F172A"
    surface-container-high: "#1E293B"
    outline: "#94A3B8"
    outline-variant: "#334155"
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
El sistema sigue una estructura de **Sidebar lateral fijo (`256px` en desktop, colapsable en tablet/móvil)** + **Topbar de contexto (`64px` de alto)** que mantiene el Proyecto/Contrato activo y el acceso a las alertas. En escritorio muestra también el rol del usuario autenticado. En tablet y móvil, el rol queda en el menú de cuenta. El contenedor principal utiliza una rejilla fluida con un ritmo base de `8px` (`4px` para micro-espaciado). Los márgenes y la navegación se adaptan según las reglas de la sección 11.

```yaml
spacing:
  gutter-xs: 4px
  gutter-sm: 8px
  gutter-md: 16px
  gutter-lg: 24px
  gutter-xl: 32px
  section: 40px
  page-margin: 24px
```

### Elevation & Depth
Jerarquía basada en capas de superficie (`surface` -> `surface-container`) y bordes definidos con sutileza técnica (`1px solid outline-variant`). Se evitan sombras pesadas o difusas para mantener un aspecto limpio de herramienta de ingeniería:
- **Tarjetas estáticas y tablas:** `border: 1px solid #E2E8F0`, `box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04)`.
- **Paneles flotantes, Drawers y Modales:** `box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.08)`.

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
   Muestra únicamente alertas accionables urgentes que requieren intervención inmediata del usuario logueado. Si no hay bloqueos o alertas, este espacio se colapsa para no ocupar pantalla.
   - *Si es Calidad / Director / Gerencia:* Muestra la **Barra de Cuenta Regresiva de 10 Días del Dossier** (si el acta de facturación ya fue aceptada) resaltando cuántos requisitos faltan por validar.
   - *Si es Ingeniero Residente:* Muestra una cinta ámbar si tiene **Cortes Devueltos con Observaciones** pendientes de corrección, junto al CTA primario fijo `"Registrar Corte de Obra"`.
   - *Si es Coordinación SST:* Muestra el conteo de trabajadores **Vencidos (`Error`)** y **Próximos a vencer a 15/30 días (`Warning`)**.

2. **Zona Media (KPIs Operativos del Proyecto Activo - Prioridad 2):**
   Rejilla de 3 tarjetas resumen (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`):
   - **Avance Físico vs. Tiempo Contractual:** Barra comparativa doble (ej. *Avance físico: 68% | Tiempo transcurrido: 72%*).
   - **Estado del Dossier (6 Carpetas):** Porcentaje global de completitud y desglose rápido de ítems *Validados / Observados / Pendientes*.
   - **Fuerza Laboral SST Activa:** Total de personal asignable (`Habilitado`) frente a personal bloqueado (`No Habilitado / Vencido`).

3. **Zona Inferior (Bandeja de Trabajo Contextual - Prioridad 3):**
   Tabla o matriz directa según el rol principal para que el usuario opere a un solo clic sin navegar por menús profundos:
   - **Ingeniero Residente:** Historial de cortes del frente de obra (con botón rápido de continuar borrador local si existe).
   - **Director de Proyectos (Yonny):** Bandeja «Pendientes de visado» con cortes en estado oficial `En Revisión (Enviado)`.
   - **Coordinación SIG / Calidad (Dilan):** Matriz de las 6 carpetas contractuales del Dossier y registro de ensayos NDT.
   - **Coordinación SST:** Matriz de personal ordenada por defecto bajo la regla **Críticos Primero** (1° Rojos/Vencidos, 2° Ámbar/15 días, 3° Ámbar/30 días, 4° Verdes/Habilitados).

---

## 6. Comportamiento Interactivo de Botones y Acciones Críticas

Cada botón e interacción en el frontend debe responder con retroalimentación física e inequívoca siguiendo la curva `state-change` (`100ms ease-out`).

### 6.1. Estados Físicos de los Botones
- **Default:** Fondo `#1E293B` (primario) o `#FFFFFF` con borde `#CBD5E1` (secundario). Texto `label-lg` (`14px`, `font-medium`).
- **Hover:** Oscurecimiento sutil a `#0F172A` en primario o fondo `#F1F5F9` en secundario (`duration-100`).
- **Active (Al oprimir / Clic):** Ligera compresión táctil `transform: scale(0.98)` + oscurecimiento de borde. Da sensación inmediata de respuesta mecánica.
- **Focus Visible (Teclado/Accesibilidad):** `outline: none`, `ring-2 ring-[#1E293B] ring-offset-2`.
- **Loading (Procesando Petición API):**
  - El botón **conserva su ancho mínimo** para evitar saltos de layout.
  - Se deshabilita inmediatamente (`disabled: true`, `pointer-events-none`) para impedir dobles envíos (ej. doble creación de corte o doble visado).
  - El ícono izquierdo se reemplaza por un `Spinner` lineal de `16px` y el texto cambia al gerundio de la acción: de `"Guardar Corte"` a `"Guardando corte..."`, o de `"Visar Corte"` a `"Registrando visado..."`.
- **Disabled (Bloqueado por Regla de Negocio):** `opacity-50`, `cursor-not-allowed`, sin efecto hover ni `scale`. **Obligatorio:** Mostrar junto al botón el motivo del bloqueo y, cuando aplique, la acción necesaria para resolverlo. Vincular la explicación al control mediante `aria-describedby`. Un tooltip puede complementar el mensaje visible.

### 6.2. Reglas UX en Flujos de Negocio Críticos

#### A. Bloqueo Estricto de Personal SST en el Corte de Obra (HU-M10)
Cuando el Ingeniero Residente abre el selector o buscador para agregar trabajadores a un corte de obra:
- **Transparencia Operativa (Opción A):** Todos los trabajadores registrados aparecen en la lista, pero aquellos con concepto médico `"No Habilitado"` o con cualquier curso normativo vencido se renderizan en la parte inferior o con bloqueo estricto:
  - Fila con fondo sutil `#FEF2F2` (`error-subtle`), texto atenuado y `cursor-not-allowed`.
  - Checkbox de selección bloqueado (`disabled`) acompañado de un ícono de candado (`LockIcon`) en rojo `#B91C1C`.
  - Badge explícito en la misma fila indicando la causa exacta: ej. `[Bloqueado: Alturas vencido hace 4 días]` o `[Bloqueado: Concepto Médico No Habilitado]`.
  - Si el usuario intenta hacer clic sobre la fila bloqueada, la fila ejecuta una micro-animación de sacudida horizontal (`shake` de `150ms`) y resalta el motivo del bloqueo, educando al usuario sin permitirle violar la regla de negocio.

#### B. Flujo de "Visar" vs. "Devolver con Observaciones" (HU-M04 y Checklist HU-M06/08)
Para evitar rechazos ambiguos por parte del Director de Proyectos o Calidad y no detener la operación en campo:
- **Al oprimir `"Visar Corte"` o `"Validar Requisito"`:**
  - Si es un ítem individual de la checklist, cambia de estado con transición optimista a `"Validado"` (badge verde `#15803D`) y actualiza la barra de progreso de la carpeta en tiempo real.
  - Si es un Corte de Obra completo, muestra un *Popover* de confirmación rápida: *"¿Confirmar visado técnico del Corte #04? Esta acción quedará registrada en la bitácora de auditoría."*
- **Al oprimir `"Devolver con Observaciones"` u `"Observar Requisito"`:**
  - Despliega un **Popover o Modal compacto contextual** enfocado automáticamente (`autoFocus`) en un campo `textarea` obligatorio.
  - Incluye **chips de selección rápida** de causas frecuentes (ej. *"Soporte PDF ilegible"*, *"Falta firma residente"*, *"Desfase en horas-hombre"*, *"Certificado NDT no coincide con junta"*) que autocompletan o complementan el texto para ahorrar tiempo.
  - El botón de confirmación `"Confirmar Devolución"` (en color ámbar `#B45309`) permanece **deshabilitado** hasta que el comentario tenga al menos 10 caracteres.
  - Una vez confirmado, el registro pasa a estado `"Observado"` / `"Devuelto con Observaciones"`, se registra en la bitácora (HU-M11) y el Ingeniero Residente sigue teniendo habilitado el botón de crear nuevos cortes sin bloqueo (visado no bloqueante).

#### C. Exportación del Paquete Dossier en ZIP: Borradores vs. Cierre Definitivo (HU-M08)
Dado que el equipo necesita permitir descargas parciales de revisión pero garantizar el control del 100% para el cierre contractual con Chevron:
- **Cuando el avance global de las 6 carpetas es `< 100%`:**
  - El botón principal muestra el estado dual:
    1. Botón secundario habilitado: `"Exportar Borrador Parcial (.ZIP)"` (ícono `FolderDown`). Al oprimirlo, genera el `.zip` con las 6 carpetas, incluyendo una marca o prefijo `BORRADOR_INCOMPLETO_` en el nombre del archivo y en el acta resumen de `ReportLab`, detallando qué ítems faltan.
    2. Botón primario deshabilitado: `"Emitir Dossier Final Validado"` con una explicación visible junto al botón: *"Requiere 100% de validación. Actualmente al 78% (faltan 4 requisitos en Carpeta 2 y Carpeta 4)"*.
- **Cuando el avance global alcanza el `100%` (Todos los ítems en estado `"Validado"`):**
  - El botón primario `"Emitir y Exportar Dossier Final (.ZIP)"` se habilita en color primario `#1E293B` con un indicador verde de listo.
- **Secuencia de Compilación y Descarga (`zipfile` + `ReportLab` + `openpyxl`):**
  - Al hacer clic en exportar (borrador o final), el botón entra en estado de procesamiento activo: muestra spinner + texto dinámico `"Compilando 6 carpetas y acta PDF..."`.
  - Al completarse la respuesta del backend, se dispara la descarga del navegador y emerge un `Toast` de confirmación en la esquina inferior derecha con el resumen del paquete descargado.

---

## 7. Estados de Carga (Skeletons), Subida a S3 y Previsualización

### 7.1. Política de Cero Spinners de Pantalla Completa (Skeleton Loaders)
Queda prohibido bloquear toda la pantalla con un spinner circular genérico durante las peticiones `GET` a la API de Django. Para evitar saltos bruscos de diseño (*Cumulative Layout Shift*):
- **Tablas (Cortes, Personal SST, Bitácora):** Mientras la petición está en curso (`isLoading`), se renderiza la cabecera real de la tabla junto con **5 a 8 filas de Skeleton** (`animate-pulse` en Tailwind con fondo `#E2E8F0` en modo claro / `#1E293B` en oscuro) que respetan exactamente el ancho de cada columna.
- **Matriz de las 6 Carpetas del Dossier:** Se muestran las 6 tarjetas estructurales con sus títulos fijos (*Carpeta 1: Documentación contractual*, etc.) y barras de progreso en estado *skeleton* hasta que hidratan los porcentajes reales.
- **Recargas en segundo plano (Refetching tras un filtro o cambio de estado):** Si los datos ya están en pantalla y el usuario cambia un filtro o valida un ítem, se mantiene la tabla visible con una barra de progreso lineal ultradelgada (`2px`) en la parte superior del contenedor, sin borrar el contenido actual.

### 7.2. Carga de Archivos a S3 (Drag & Drop) y Previsualizador Lateral (HU-M03, HU-M06, HU-M07)
La carga de fotografías de obra, certificados de materiales, reportes NDT y soportes PDF sigue un flujo blindado contra conexiones inestables:

1. **Zona de Drag & Drop Interactiva:**
   - Mostrar un botón «Seleccionar archivos» que abra el selector del dispositivo mediante toque o teclado. En equipos con puntero, la zona admite también arrastrar archivos.
   - Borde punteado técnico (`2px dashed #CBD5E1`) que cambia a `#1E293B` con fondo `#F1F5F9` cuando el usuario arrastra un archivo encima (`onDragOver`).
   - Especifica claramente los formatos y límites antes de subir: *"Selecciona archivos PDF, JPG o PNG (máx. 15 MB por archivo)"*.
2. **Validación Instantánea en Cliente (Pre-Upload):**
   - Si el archivo no es `.pdf`, `.jpg`, `.jpeg` o `.png`, o supera el peso límite, se rechaza en `0ms` en el navegador mostrando un borde `#B91C1C` y un mensaje claro debajo del dropzone sin consumir ancho de banda hacia el servidor.
3. **Barra de Progreso Real de Subida:**
   - Durante la carga hacia el bucket compatible con S3, cada archivo muestra una tarjeta compacta con su nombre, tamaño en MB, una barra de progreso horizontal con el porcentaje exacto (`0%` a `100%` en `tabular-nums`) y un botón `"Cancelar"` (`X`).
   - Al llegar al `100%`, mostrar «Confirmando carga…» hasta que se confirme el almacenamiento y la asociación del archivo con el registro. Después, mostrar «Archivo cargado» y actualizar la checklist.
   - Si falla la carga, conservar los campos del formulario y los archivos confirmados. Mostrar el error junto al archivo y un botón «Reintentar». Si el archivo original ya no está disponible después de recargar, pedir que se seleccione de nuevo.
4. **Previsualizador Integrado en Drawer Lateral (Split-View Inspection):**
   - Al hacer clic en cualquier soporte PDF o fotografía ya cargada (tanto en el Dossier como en la revisión de un Corte de Obra por el Director), **nunca se saca al usuario de la pantalla ni se fuerza la descarga a su disco local por defecto**.
   - Desde `1024px`, se abre un **drawer lateral derecho** de `min(45vw, 640px)` con animación `surface-enter` (`200ms`). Por debajo de `1024px`, se abre un visor de pantalla completa dentro de la aplicación, según la sección 11.
   - El Drawer contiene un visor nativo de PDF/Imagen en el cuerpo central, metadatos en la cabecera (autor del cargue, fecha/hora exacta, junta NDT vinculada si aplica) y en el pie del Drawer los botones de acción directa para Calidad/Director: `"Validar Documento"` o `"Observar Documento"`, permitiendo auditar y calificar sin perder de vista la checklist a la izquierda.

---

## 8. Resiliencia en Campo y Persistencia Local (Auto-Save Drafts)

El registro de un Corte de Obra (HU-M02: avance físico por actividad, horas-hombre por trabajador e insumos consumidos) y la asociación de ensayos NDT a juntas soldadas (HU-M07) son tareas extensas propensas a cierres accidentales de pestaña o caídas de señal en obra.

### 8.1. Autoguardado Silencioso en `localStorage`
- Cada vez que el Ingeniero Residente modifica un campo en el formulario de creación de corte (`onChange` con un *debounce* de `500ms`), el estado completo del formulario (actividades, personal SST seleccionado e insumos) se serializa en `localStorage` bajo una clave vinculada al proyecto y usuario: `loard_draft_corte_proj_{id}_user_{id}`.
- En la esquina superior derecha del formulario se muestra un indicador discreto de estado:
  - Mientras escribe: `"Guardando borrador local..."` (ícono de nube/disco tenue).
  - Tras `500ms`: `"Borrador guardado localmente a las 14:32"` (`text-xs text-[#64748B]`).

### 8.2. Recuperación y Limpieza del Borrador
- Si el residente recarga la página o vuelve a entrar al módulo de Cortes y existe un borrador no enviado, aparece un banner informativo en la parte superior del formulario:
  > *"Tienes un corte de obra en borrador guardado hoy a las 14:32. [Continuar editando] | [Descartar borrador]"*
- Si el usuario intenta cerrar la pestaña o navegar fuera con cambios sin enviar y archivos aún subiendo a S3, se dispara el evento nativo `beforeunload` advirtiendo que hay una carga de archivos en curso.
- Una vez que el endpoint `POST /api/cortes/` responde `201 Created`, el sistema limpia automáticamente la clave de `localStorage` y redirige al detalle del corte recién creado con un `Toast` de éxito.

---

## 9. Motion & Micro-interactions

Micro-interacciones sobrias, funcionales y rápidas (`100ms` - `200ms`) para estados de hover, validación de checklist, apertura de visores PDF y confirmaciones de visado. Con `prefers-reduced-motion: reduce`, suprimir la sacudida, el pulso y los desplazamientos animados. Mantener la retroalimentación mediante texto, iconos y cambios de estado.

```yaml
motion:
  state-change:
    duration: 100ms
    delay: 0ms
    timingFunction: ease-out
  surface-enter:
    duration: 200ms
    delay: 0ms
    timingFunction: cubic-bezier(0.16, 1, 0.3, 1)
  surface-exit:
    duration: 150ms
    delay: 0ms
    timingFunction: cubic-bezier(0.7, 0, 0.84, 0)
  error-shake:
    duration: 150ms
    keyframes: "translateX(-4px) -> translateX(4px) -> translateX(0)"
```

---

## 10. Voice, Content Strategy & Auditoría (Bitácora)

### Tono y Terminología Oficial
Tono riguroso, formal y de ingeniería civil y petrolera en español neutro colombiano. Los estados son categóricos e idénticos entre la base de datos (Django TextChoices), la API REST y las insignias de React:

| Módulo | Estados Oficiales Permitidos | Color Semántico Asociado |
| :--- | :--- | :--- |
| **Personal SST (HU-M09, HU-M10)** | `Habilitado` | Success (`#15803D`) |
| | `Próximo a Vencer (30d / 15d)` | Warning (`#B45309`) |
| | `No Habilitado` / `Vencido` | Error (`#B91C1C`) |
| **Cortes de Obra (HU-M02, HU-M04)** | `En Revisión (Enviado)` | Info (`#334155`) |
| | `Visado` | Success (`#15803D`) |
| | `Devuelto con Observaciones` | Warning (`#B45309`) |
| **Checklist Dossier (HU-M05 a M08)** | `Pendiente` | Outline (`#64748B`) |
| | `Archivo Cargado` | Info (`#334155`) |
| | `Observado` | Warning (`#B45309`) |
| | `Validado` | Success (`#15803D`) |

### Reserva Legal e Invisibilidad Clínica (SST)
En ningún formulario, tabla, *tooltip* o bitácora se mostrarán campos para diagnósticos médicos, patologías o historias clínicas. El campo de aptitud médica es estrictamente binario/categórico (`Habilitado` / `No Habilitado`) acompañado de su fecha de expedición y fecha de vencimiento.

### Bitácora de Auditoría (HU-M11)
Cada cambio de estado en un corte o en un ítem del dossier renderiza una línea de tiempo (*Timeline* vertical) de solo lectura con formato inmutable:
`[DD/MM/AAAA HH:mm:ss] — [Nombre y Rol del Usuario] cambió el estado de [Estado Anterior] a [Estado Nuevo]. Motivo/Observación: "[Texto si aplica]"`
---

## 11. Comportamiento responsive y criterios de aceptación

### 11.1. Navegación, márgenes y rejilla

| Ancho del viewport | Navegación | Margen lateral | KPIs |
| --- | --- | --- | --- |
| Menos de 768 px | Menú lateral temporal desde un botón en la barra superior | 16 px | 1 columna |
| 768–1023 px | Menú lateral temporal desde un botón en la barra superior | 24 px | 2 columnas. La tercera tarjeta ocupa la fila siguiente. |
| Desde 1024 px | Menú lateral fijo de 256 px | 24 px | 3 columnas |

En pantallas estrechas, la barra superior mantiene el botón de menú, el nombre del proyecto activo y el acceso a las alertas. El selector de proyecto muestra el nombre completo al abrirse si estaba truncado. El rol se muestra en el menú de cuenta, accesible desde la barra superior. Las alertas críticas del flujo activo permanecen visibles al inicio del contenido, según la prioridad por rol.

La página se ajusta al viewport sin desplazamiento horizontal global. Los títulos, mensajes y botones con textos largos admiten saltos de línea. Los menús y diálogos temporales devuelven el foco al control que los abrió al cerrarse.

### 11.2. Tablas y bandejas de trabajo

- **Cortes de obra.** En móvil, cada fila se presenta como un resumen con identificador, fecha, estado y acción según el rol. «Ver detalle» da acceso a avances, horas-hombre, insumos y soportes.
- **Personal SST.** Mostrar nombre, estado y motivo exacto del bloqueo en la misma fila o tarjeta. Conservar la búsqueda y el orden «Críticos Primero» en todos los anchos.
- **Dossier.** Apilar las seis carpetas en móvil. Cada carpeta muestra nombre, progreso y conteos de requisitos por estado. Cada requisito conserva su estado y su acceso al soporte.
- **Matrices comparativas.** Cuando la comparación entre columnas sea parte de la tarea, conservar la tabla y limitar el desplazamiento horizontal a su contenedor. El contenedor se puede recorrer con teclado. Los indicadores de carga reproducen la estructura visible de la tabla o de las tarjetas según el ancho.

### 11.3. Formularios, visores y acciones táctiles

- **Registro de corte.** En móvil, usar una sola columna. Presentar actividades, personal e insumos en secciones con acciones «Agregar» junto a cada grupo. Mantener visible el estado del borrador cerca del encabezado del formulario. Mostrar la acción principal en un pie fijo con espacio suficiente debajo del contenido para evitar que cubra el último campo. Con el teclado abierto, el campo activo y su mensaje de error deben quedar visibles.
- **Visor de soportes.** En la variante de pantalla completa, el documento se desplaza dentro del visor. La cabecera conserva el botón «Cerrar» y los metadatos. El pie mantiene «Validar Documento» y «Observar Documento» para los roles autorizados. Al volver, conservar filtros y posición de la lista y devolver el foco al soporte que abrió el visor.
- **Confirmaciones y observaciones.** En móvil, usar un diálogo con cuerpo desplazable y espacio suficiente para el comentario y sus sugerencias. Mostrar debajo del campo el requisito de 10 caracteres y mantener accesibles las acciones con el teclado abierto.
- **Interacción táctil y teclado.** Usar áreas táctiles de al menos 44 × 44 px para acciones, incluidos iconos interactivos. Mantener el foco visible en ambos temas. Mostrar el estado mediante texto además del color y mantener visibles las instrucciones necesarias para desbloquear una acción.
- **Recuperación de carga.** Si se pierde la conexión, cada archivo afectado indica el fallo y ofrece reintento. El borrador del formulario sigue disponible y la lista distingue los archivos confirmados de los que deben reintentarse o seleccionarse de nuevo.

### 11.4. Verificación antes de dar por terminado el MVP

Probar a 360 y 390 px de ancho con toque y teclado en pantalla. Revisar también 768 y 1024 px para verificar los cambios de navegación y rejilla, y 1280 px para comprobar la vista de escritorio.

1. **Registrar un corte con evidencia.** Agregar una actividad, un trabajador habilitado y un insumo. Seleccionar una foto o PDF. Interrumpir la conexión durante la subida, recuperarla y reintentar. Verificar que se conserven los campos y archivos confirmados y que se pueda enviar el corte.
2. **Consultar un bloqueo SST.** Buscar un trabajador bloqueado y comprobar que el motivo se puede leer desde la lista y que el selector impide agregarlo. Verificar que la misma información esté disponible con teclado.
3. **Revisar un soporte del dossier.** Abrir un PDF, consultar sus metadatos y ejecutar por separado la validación y la devolución con observaciones en registros de prueba. Comprobar el requisito del comentario, las acciones con el teclado abierto y la recuperación de la posición al regresar a la lista.

En los tres recorridos, verificar que la página no tenga desplazamiento horizontal global, que los controles conserven el foco visible y que los mensajes largos no oculten acciones.
