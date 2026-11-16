# Especificación de prototipo · HU-M03 y HU-M04

Documento de trabajo para construir el prototipo de alta fidelidad de las historias 3 y 4 del MVP. Sigue el mismo método que las HU-M09 y HU-M10 (ver *Creación de prototipo - Uso de IA*): **prompt inicial → resultado de la IA → refactorización humana**, sobre los componentes compartidos y las reglas de `Hito 2/design.md`.

> **Ojo con la paleta.** El código usa `Hito 2/design.md` (azul petróleo, contraste 7:1, «Deshacer» de 5 s, cola sin conexión). El `design.md` de la raíz del repo es una copia idéntica. Como las pantallas solo usan tokens (`bg-primary`, `text-warning`…), no hay que escribir colores: basta con seguir `Hito 2/design.md`.

---

## 1. Punto de partida

| HU | Estado en *Cobertura de HU* | Qué ya existe en el prototipo |
| --- | --- | --- |
| HU-M03 · Adjuntar fotografías y soportes | **Pendiente** | `FileUpload`, `UploadItem`, `Drawer`, reglas de `lib/archivos.ts` (PDF/JPG/PNG, 15 MB). SST ya los usa para el certificado de un curso. |
| HU-M04 · Visar o devolver el corte | **Parcial** | `/cortes` (lista con filtro por estado) y `/cortes/:id` (detalle con historial de versiones). Faltan las acciones de visar y devolver. |

Datos de ejemplo ya disponibles: tres cortes (#06 Visado, #07 Devuelto con Observaciones, #08 En Revisión) del residente Mauricio Palacios, revisados por Yonny Pérez (Director). Reloj fijo al 17/11/2026.

**Dolor del Hito 1 que resuelven:** el avance se reportaba por WhatsApp, la evidencia llegaba aparte (o no llegaba) y el director tenía que pedirla. Con HU-M03 la evidencia viaja dentro del corte. Con HU-M04 el director revisa todo en una sola pantalla y devuelve con una observación concreta, sin frenar el frente.

---

## 2. HU-M03 · Adjuntar fotografías y soportes al corte

**Como** Ingeniero Residente **quiero** adjuntar fotografías y soportes en PDF al corte que registré **para** que lo reportado tenga evidencia y quien lo revise no tenga que pedírmela aparte.

### Criterios de aceptación (Hito 1) y cómo se ven en el prototipo

| # | Criterio | Cómo se demuestra |
| --- | --- | --- |
| 1 | Adjuntar una o varias fotos y PDF | Zona «Soportes del corte» con botón «Seleccionar archivos» y arrastrar-soltar, selección múltiple. |
| 2 | Rechazo de tipo o peso con explicación | Validación en el navegador con los mensajes de `validarArchivo` (ej.: «“acta.docx” no es PDF, JPG ni PNG…»). El archivo no entra a la lista. |
| 3 | Adjuntos listados, se abren o descargan | Lista con miniatura/ícono, nombre, tamaño, autor y fecha. «Ver» abre el visor lateral; «Descargar» es una acción secundaria. |
| 4 | Quitar adjunto mientras no esté visado | «Quitar» con aviso «Deshacer» de 5 s. En un corte Visado el botón no aparece y se explica por qué. |
| 5 | El Director ve los mismos adjuntos | La misma sección aparece en el detalle del corte para el director, en modo consulta. |

### Pantallas y rutas

| Ruta | Cambio |
| --- | --- |
| `/cortes/:id/editar` | La misma sección «Soportes del corte» al final del formulario. |
| `/cortes/nuevo` | Aviso: «Guarda el corte para adjuntar fotografías y PDF». Al guardar se abre el detalle y un aviso invita a adjuntar los soportes. |
| `/cortes/:id` | Nueva sección «Soportes del corte» con la lista. Si el usuario es el residente autor y el corte no está Visado, puede agregar o quitar soportes desde aquí sin abrir el formulario. |
| Visor (sin ruta propia) | `Drawer` de `min(45vw, 640px)` desde 1024 px. Pantalla completa por debajo de 1024 px. Cabecera con nombre, autor, fecha y hora. |

### Flujo principal

1. El residente abre el Corte #08 (En Revisión) y va a «Soportes del corte».
2. Selecciona 2 fotos y 1 PDF. Cada archivo muestra su tarjeta con barra de progreso `0–100 %`, luego «Confirmando carga…» y por último «Archivo cargado».
3. La sección muestra el resumen «3 soportes · 2 fotografías, 1 PDF».
4. Abre una foto en el visor, la revisa y cierra con «Cerrar» o `Esc`. El foco vuelve al soporte que abrió.

### Flujos de excepción (la rúbrica los pide todos)

| Situación | Respuesta del prototipo |
| --- | --- |
| Archivo `.docx`, `.heic`, etc. | Borde de error en la zona y mensaje con el formato permitido. No se sube. |
| Archivo de más de 15 MB | Mensaje con el peso real y el máximo, y la sugerencia de reducirlo. |
| Mismo archivo dos veces (nombre y tamaño iguales) | Aviso «Este archivo ya está en el corte». No se duplica. |
| Se cae la señal durante la subida | La tarjeta pasa a «En cola» (`UploadItem status="queued"`). Los demás campos y archivos confirmados se conservan. Al volver la señal se sube solo. |
| Falla la subida por otra causa | Mensaje junto al archivo y botón «Reintentar». |
| El usuario cancela una subida | Botón «Cancelar» (X) en la tarjeta. El archivo sale de la lista. |
| Quitar un soporte por error | Toast «Soporte retirado. [Deshacer]» durante 5 s. Nada se registra en la bitácora hasta que termina el plazo. |
| Corte Visado | No hay zona de carga ni «Quitar». Aviso: «El corte está visado. Sus soportes ya no se pueden modificar.» |
| Perfil sin permiso (Director, Calidad, Gerencia) | Solo consulta y descarga. |
| Corte sin soportes | Estado vacío: «Este corte aún no tiene soportes. Agrega fotografías o PDF del periodo.» Para el director: «El residente no adjuntó soportes en este corte.» |
| Intentar salir con archivos subiendo | Aviso nativo `beforeunload` (design.md #8.2). |

---

## 3. HU-M04 · Visar o devolver el corte

**Como** Director de Proyectos **quiero** revisar cada corte y aprobarlo (visarlo) o devolverlo con observaciones puntuales **para** asegurar que lo reportado es correcto sin frenar el trabajo en el frente.

### Criterios de aceptación (Hito 1) y cómo se ven en el prototipo

| # | Criterio | Cómo se demuestra |
| --- | --- | --- |
| 1 | Lista de pendientes con proyecto, frente y periodo | Al entrar como Director, `/cortes` abre filtrada en «En Revisión (Enviado)» con una tarjeta KPI «Pendientes de visado». La acción de la fila dice «Revisar». |
| 2 | Al abrir: avance, HH, insumos y adjuntos | El detalle muestra todo en una sola página. Los soportes se abren en el visor lateral sin perder de vista las cantidades. |
| 3 | Visar → aprobado e inmodificable | «Visar corte» abre una confirmación: «¿Confirmar visado técnico del Corte #08? Esta acción quedará registrada en la bitácora de auditoría.» Foco inicial en «Cancelar». Al confirmar, el estado pasa a Visado y desaparecen las acciones de edición. |
| 4 | Devolver solo con observación | «Devolver con observaciones» abre un diálogo con un campo enfocado, chips de causas frecuentes y «Confirmar devolución» deshabilitado hasta 10 caracteres. |
| 5 | El residente ve la observación y reenvía | En el detalle del corte, el residente ve un aviso ámbar con la observación, el autor y la fecha, y el botón «Corregir corte». Al guardar, el corte vuelve a En Revisión. |
| 6 | El visado no bloquea nuevos cortes | «Registrar corte» sigue habilitado con cortes pendientes o devueltos. El diálogo de devolución lo recuerda: «El residente podrá seguir registrando cortes en este frente.» |

### Pantallas y rutas

| Ruta | Cambio |
| --- | --- |
| `/cortes` (Director) | Filtro inicial «En Revisión (Enviado)», KPI de pendientes y acción «Revisar». |
| `/cortes/:id` (Director, corte En Revisión) | Barra de acciones al final del detalle (fija abajo en móvil): «Devolver con observaciones» (secundario) y «Visar corte» (primario). |
| `/cortes/:id` (Residente, corte Devuelto) | Aviso con la observación y botón «Corregir corte». |
| Historial de versiones | La decisión del director aparece como una entrada más: autor, rol, estado anterior → nuevo y observación. |

Chips de causas frecuentes sugeridos: «Desfase en horas-hombre», «Falta soporte fotográfico», «Soporte PDF ilegible», «Cantidades no coinciden con el avance», «Falta firma del residente».

### Flujos de excepción

| Situación | Respuesta del prototipo |
| --- | --- |
| Observación con menos de 10 caracteres | «Confirmar devolución» deshabilitado. Debajo del campo: «Escribe al menos 10 caracteres (faltan 4).» |
| Cerrar el diálogo con texto escrito | Pregunta «¿Descartar la observación?» (`Dialog` con `dirty`). |
| Sin conexión | «Visar corte» y «Devolver» se ven deshabilitados con el motivo «Necesitas conexión para visar cortes» (design.md #8.3). |
| El residente editó el corte mientras el director lo revisaba | «El corte cambió (versión 3). Revisa la versión actual antes de visar.» Usa la misma regla de `versionEsperada` que ya existe. |
| Corte ya Visado o Devuelto | No hay acciones para el director. Solo consulta. |
| Corte sin soportes | Aviso informativo al director antes de visar: «Este corte no tiene soportes adjuntos.» No bloquea la decisión. |
| Clic doble en «Confirmar» | El botón pasa a «Registrando visado…» y se deshabilita (design.md #6.1). |
| Perfil Calidad o Gerencia | Consulta sin acciones. |

---

## 4. Heurísticas de Nielsen aplicadas

El entregable pide documentar al menos 5. Esta tabla cubre las 10 para ambas historias. Cada fila sirve como evidencia para el Módulo II.

| # | Heurística | HU-M03 · Soportes | HU-M04 · Visado |
| --- | --- | --- | --- |
| 1 | Visibilidad del estado del sistema | Progreso por archivo en %, «Confirmando carga…» y «Archivo cargado». Resumen de cuántos soportes hay. | Insignia de estado del corte. KPI de pendientes. Botón en estado de carga y toast al terminar. |
| 2 | Coincidencia con el mundo real | «Soportes», «fotografías del frente», «Corte #08». | «Visar», «Devolver con observaciones», chips con causas de obra («Desfase en horas-hombre»). |
| 3 | Control y libertad del usuario | Cancelar subida. «Deshacer» de 5 s al quitar un soporte. Cerrar el visor con `Esc`. | Foco inicial en «Cancelar» al visar. Confirmación antes de descartar una observación escrita. |
| 4 | Consistencia y estándares | Mismo `FileUpload` y `UploadItem` que SST. Mismos textos de `lib/archivos.ts`. | Estados de `lib/estados.ts`. Mismo `Dialog` y orden de botones en todo el prototipo. |
| 5 | Prevención de errores | Tipo y peso validados antes de subir. No se duplican archivos. No se modifica un corte visado. | Confirmación de visado. Devolución bloqueada sin observación de 10 caracteres. Control de versión. |
| 6 | Reconocer antes que recordar | Miniaturas e íconos por tipo de archivo. | Cantidades, HH, insumos y soportes en una sola vista. La observación queda visible para el residente. Chips de causas. |
| 7 | Flexibilidad y eficiencia | Arrastrar y soltar además del botón. Selección múltiple. | Bandeja ya filtrada en pendientes. Chips que llenan el texto. `Ctrl+Z` mientras se muestra «Deshacer». |
| 8 | Diseño estético y minimalista | Cada rol ve solo sus acciones. Color solo para estados. | Dos acciones claras al final del detalle. Sin datos que el director no necesita. |
| 9 | Reconocer, diagnosticar y recuperarse de errores | Mensajes con el archivo, la causa y la solución. «Reintentar» por archivo y cola sin señal. | Mensajes de conexión y de versión con la acción que los resuelve. |
| 10 | Ayuda y documentación | Formatos y límite visibles antes de subir. | Texto del diálogo que explica que el visado queda en la bitácora y que la devolución no frena el frente. |

---

## 5. Lo que aportan estas historias a cada módulo del entregable

### Módulo I · Prototipo e informe de IA

Prompts propuestos para el informe, con el mismo formato del compañero.

**Prompt HU-M03**

```text
Haz el prototipo de la HU-03 en Hito 2/Modulo-I-Prototipo/prototipo, en src/features/cortes.
HU-03: como Ingeniero Residente quiero adjuntar fotografías y soportes en PDF al corte que
registré, para que lo reportado tenga evidencia y el director no tenga que pedírmela aparte.
Lee primero Hito 2/design.md (sobre todo 7.2, 8.3 y 6.1) y el README del módulo. Usa
FileUpload, UploadItem, Drawer y ToastProvider de @/components y las reglas de @/lib/archivos.
Lo que necesito:
* Sección «Soportes del corte» en el formulario y en el detalle del corte.
* Selección múltiple y arrastrar-soltar. Rechazo inmediato de tipo o peso con el mensaje de lib/archivos.
* Progreso simulado por archivo, «Confirmando carga…» y «Archivo cargado». Botón para cancelar.
* Si se pierde la conexión, el archivo queda en cola y se sube al volver.
* Visor lateral desde 1024 px y de pantalla completa en móvil. Al cerrar, el foco vuelve al soporte.
* Quitar un soporte con «Deshacer» de 5 s. En un corte Visado no se puede quitar ni agregar.
* El director ve los mismos soportes en modo consulta.
Agrega una foto y un PDF de ejemplo a los cortes de ejemplo. Usa el reloj fijo del 17/11.
```

**Prompt HU-M04**

```text
Haz el prototipo de la HU-04 en Hito 2/Modulo-I-Prototipo/prototipo, en src/features/cortes.
HU-04: como Director de Proyectos quiero revisar cada corte y visarlo o devolverlo con
observaciones puntuales, para asegurar que lo reportado es correcto sin frenar el frente.
Lee primero Hito 2/design.md (sobre todo 6.2B, 8.3 y 10) y el README del módulo. Usa Dialog,
Chip, Banner, Timeline y ToastProvider de @/components y los estados de @/lib/estados.
Lo que necesito:
* Para el director, /cortes abre filtrada en «En Revisión (Enviado)» con un KPI de pendientes.
* En el detalle, «Visar corte» con confirmación (foco inicial en Cancelar) y «Devolver con
  observaciones» con un diálogo: campo enfocado, chips de causas, mínimo 10 caracteres.
* Cada decisión crea una versión nueva con autor, rol, estado y observación en el historial.
* El residente ve la observación y puede corregir y reenviar. Registrar cortes nuevos nunca se bloquea.
* Sin conexión las acciones quedan deshabilitadas con el motivo. Si el corte cambió de versión, avisa.
El diálogo de devolución debe poder reutilizarse para «Observar requisito» del dossier.
```

La sección de **refactorización humana** se llena después de revisar lo que entregue la IA: qué se corrigió para que cumpliera las reglas del negocio.

### Módulo II · Componentes, responsive y heurísticas

- **Se reutilizan:** `FileUpload`, `UploadItem`, `Drawer`, `Dialog`, `Chip`, `Banner`, `StatusBadge`, `Timeline`, `KpiCard`, `ResponsiveTable`, `ToastProvider` (con `undo`), `Button` (`loading`, `blocked`).
- **Componentes nuevos:**
  - `SoportesCorte` (en `features/cortes`): sección con zona de carga y lista.
  - `VisorSoporte`: envoltura de `Drawer` para imagen o PDF. Calidad lo necesitará en el dossier, así que irá en `components`.
  - `DialogoObservacion`: textarea, chips y mínimo de caracteres. Lo reutilizan HU-M04 y «Observar requisito» de HU-M06, así que irá en `components`.
- **Responsive:** en escritorio, el visor abre a la derecha y el detalle sigue visible. En móvil, el visor ocupa toda la pantalla y las acciones del director quedan fijas al pie. Capturas para el documento: 390 px y 1280 px.
- **Heurísticas:** usar la tabla de la sección 4.

### Módulo III · RITE y accesibilidad

**Tareas de prueba (mínimo 2 usuarios reales):**

1. *Como residente:* adjunta dos fotos y un PDF al Corte #08. Intenta adjuntar un archivo no permitido. Quita una foto y recupérala.
2. *Como director:* encuentra los cortes pendientes, revisa el Corte #08 y su PDF, y devuélvelo con una observación. Después visa otro corte.

Para cada tarea se registra si se completó, el tiempo, los errores y los comentarios. La evidencia se presenta en la tabla del entregable:

| Problema detectado | Usuario | Cambio aplicado en el prototipo |
| --- | --- | --- |
| *(por llenar tras cada sesión)* | | |

**Puntos WCAG a revisar:**

- Foco atrapado dentro del diálogo y del visor. Al cerrarlos, el foco vuelve al control que los abrió.
- Botones deshabilitados con el motivo visible, enlazado con `aria-describedby`.
- Progreso de carga anunciado (`role="progressbar"` con valor) y resultados en una región `aria-live`.
- Contraste del botón ámbar «Confirmar devolución» (`on-warning` sobre `warning`).
- Áreas táctiles de al menos 44 × 44 px en «Quitar», «Cancelar» y «Ver».
- Recorrido completo solo con teclado: `Tab`, `Enter`, `Esc`.

### Módulo IV · Datos y API

**Entidades mínimas para estas pantallas:**

```text
Corte            (id, numero, frente, periodo_inicio, periodo_fin, estado, version, residente_id)
AdjuntoCorte     (id, corte_id, nombre_original, tipo [foto|pdf], tamano_bytes, clave_s3,
                  subido_por, fecha_subida, retirado_por?, fecha_retiro?)
RevisionCorte    (id, corte_id, version_corte, decision [Visado|Devuelto con Observaciones],
                  observacion?, causas[], director_id, fecha)
EventoBitacora   (id, entidad, entidad_id, usuario_id, estado_anterior, estado_nuevo, observacion, fecha)
```

Los adjuntos retirados no se borran. Se marcan como retirados para conservar la trazabilidad de la bitácora (HU-M11).

**Mapa de API:**

| Método y ruta | Uso |
| --- | --- |
| `GET /api/cortes/?estado=En Revisión (Enviado)` | Bandeja de pendientes del director |
| `GET /api/cortes/{id}/` | Detalle con avance, HH, insumos y adjuntos |
| `POST /api/cortes/{id}/adjuntos/solicitud-carga/` | URL firmada para subir el archivo a S3 |
| `POST /api/cortes/{id}/adjuntos/` | Confirma la carga y asocia el archivo al corte |
| `GET /api/cortes/{id}/adjuntos/{adjunto_id}/descarga/` | URL temporal para ver o descargar |
| `DELETE /api/cortes/{id}/adjuntos/{adjunto_id}/` | Retira un soporte. Responde `409` si el corte está Visado. |
| `POST /api/cortes/{id}/visar/` | Visa el corte. Envía `version_esperada` y responde `409` si cambió. |
| `POST /api/cortes/{id}/devolver/` | Devuelve el corte con `observacion` (mínimo 10 caracteres) y `causas`. |
| `GET /api/cortes/{id}/bitacora/` | Historial de cambios del corte |

---

## 6. Decisiones por confirmar con el equipo

1. **Un corte visado no se puede editar (decidido).** Se alineó el prototipo con HU-M03 y HU-M04. En el detalle, «Editar corte» aparece bloqueado con el motivo visible. La ruta `/cortes/:id/editar` de un corte visado muestra el aviso en lugar del formulario. El modelo rechaza guardar sobre un corte visado. La corrección de un corte devuelto sigue volviendo a revisión. Hay que avisar a quien hizo HU-M02 porque el cambio toca `FormularioCorte` y `DetalleCorte`.
2. **Agregar o quitar soportes no crea una versión nueva del corte (implementado).** Los soportes se guardan aparte (`features/cortes/soportes.ts`). Uno retirado no se borra: queda marcado con autor y fecha para la bitácora (HU-M11). Todavía falta mostrar esos eventos en la línea de tiempo del corte.
3. **Archivos en la demostración (implementado).** `public/ejemplos/` tiene tres fotos marcadas «Fotografía de ejemplo» y un PDF de ejemplo. Los cortes #06 y #07 traen soportes. El #08 empieza vacío para probar el estado sin soportes y la carga. Los archivos nuevos se guardan en memoria durante la sesión. Después de recargar conservan sus datos, y el visor avisa que la vista previa ya no está disponible.

### Implementación de HU-M03

| Archivo | Qué hace |
| --- | --- |
| `features/cortes/soportes.ts` | Modelo: datos de ejemplo, validación, permisos, duplicados, retiro sin borrado y resumen. |
| `features/cortes/SoportesCorte.tsx` | Sección con lista, carga simulada con progreso y cola sin señal, «Deshacer» al quitar y visor lateral. |
| `features/cortes/CortesDemoContext.tsx` | Expone `soportes`, `agregarSoporte` y `retirarSoporte`. |
| `features/cortes/soportes.test.ts` | Pruebas de las reglas: formatos, peso, duplicados, corte visado, perfil sin permiso y retiro. |

### Implementación de HU-M04

| Archivo | Qué hace |
| --- | --- |
| `features/cortes/modeloDemo.ts` | `revisarCorteDemo`: solo el Director, solo cortes en revisión y sobre la versión vigente. Devolver exige 10 caracteres. Cada decisión es una versión nueva con autor, rol y observación. |
| `features/cortes/RevisionCorte.tsx` | Barra de revisión fija al pie, confirmación de visado con el foco en «Cancelar», aviso de corte sin soportes y de versión cambiada, bloqueo sin señal. También el aviso de devolución para el residente con «Corregir corte». |
| `features/cortes/DialogoObservacion.tsx` | Diálogo con el campo enfocado, causas frecuentes, mínimo de 10 caracteres y pregunta antes de descartar el texto. |
| `features/cortes/ListaCortes.tsx` | El Director entra filtrado en «En Revisión (Enviado)», con KPI «Pendientes de visado», columna de soportes y acción «Revisar». |
| `features/cortes/FormularioCorte.tsx` | Al corregir un corte devuelto, la observación del director queda visible arriba del formulario. |
| `features/cortes/modeloDemo.test.ts` | Pruebas de visado, devolución, reenvío, visado no bloqueante, permisos y conflicto de versión. |

`DialogoObservacion` se queda en `features/cortes` hasta que «Observar requisito» (HU-M06) lo use. En ese momento pasa a `components`.

El visor quedó dentro de `features/cortes` porque por ahora solo lo usan los cortes (regla 4 del README del módulo). Pasa a `components` cuando el dossier lo necesite.
