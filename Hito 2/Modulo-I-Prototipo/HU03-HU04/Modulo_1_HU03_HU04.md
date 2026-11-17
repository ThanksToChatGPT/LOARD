# Módulo I · Prototipo y uso de IA · HU-M03 y HU-M04

Loard Construcciones S.A.S. · Hito 2 · Aporte de Sebastián Gutiérrez.

## HU-M03 · Adjuntar fotografías y soportes al corte

**Como** Ingeniero Residente **quiero** adjuntar fotografías y soportes en PDF al corte que registré **para** que lo reportado tenga evidencia y quien lo revise no tenga que pedírmela aparte. Prioridad MUST · 2 puntos.

Dolor del Hito 1 que atiende: el avance se reportaba por WhatsApp y la evidencia llegaba aparte o no llegaba. Ahora las fotos y los PDF viajan dentro del corte y el Director los ve en el mismo lugar.

| Criterio de aceptación | Cómo responde el prototipo |
| --- | --- |
| Adjuntar una o varias fotos y PDF | Sección «Soportes del corte» con «Seleccionar archivos» o arrastrar y soltar, con selección múltiple. |
| Rechazar tipo o peso con explicación | Se valida en el navegador antes de subir: «“informe.docx” no es PDF, JPG ni PNG…» o el peso real frente al máximo de 15 MB. |
| Ver, abrir y descargar los adjuntos | Lista con miniatura, tipo, tamaño, autor y fecha. «Ver» abre el visor lateral con «Descargar». |
| Quitar un adjunto mientras no esté visado | «Quitar» con aviso «Deshacer» de 5 segundos. En un corte visado no aparecen ni la carga ni «Quitar». |
| El Director ve los mismos adjuntos | La misma sección aparece en modo consulta para Director, Calidad y Gerencia. |

## HU-M04 · Visar o devolver el corte

**Como** Director de Proyectos **quiero** revisar cada corte y visarlo o devolverlo con observaciones puntuales **para** asegurar que lo reportado es correcto sin frenar el trabajo en el frente. Prioridad MUST · 3 puntos.

| Criterio de aceptación | Cómo responde el prototipo |
| --- | --- |
| Lista de cortes pendientes | El Director entra a «Cortes por revisar», filtrada en «En Revisión (Enviado)», con el indicador «Pendientes de visado» y la acción «Revisar». |
| Ver avance, horas, insumos y adjuntos | El detalle reúne cantidades, horas-hombre, insumos y soportes. Las acciones quedan fijas al pie mientras se revisa. |
| Visar y que no se pueda modificar | «Visar corte» pide confirmación con el foco en «Cancelar». Un corte visado ya no se edita y la pantalla explica por qué. |
| Devolver solo con observación | El diálogo exige 10 caracteres y ofrece causas frecuentes que completan el texto. |
| El residente ve la observación y reenvía | Aviso ámbar con la observación, quién la escribió y «Corregir corte». Al guardar, el corte vuelve a revisión. |
| No bloquear el frente | «Registrar corte» sigue disponible con cortes pendientes o devueltos. El diálogo lo recuerda. |

## Cómo recorrer el prototipo

Ejecutar `npm ci` y `npm run dev` desde la raíz del repositorio y abrir `http://127.0.0.1:5173`. Todas las cuentas usan la contraseña de ejemplo `Demo2026!`.

1. **Residente** (`residente@loard.demo`): abrir el Corte #08 y agregar fotos o PDF en «Soportes del corte». Los archivos de prueba están en `prototipo/public/ejemplos`.
2. **Director** (`director@loard.demo`): abrir «Revisar» en el Corte #08 y devolverlo con una observación.
3. **Residente**: ver la observación, oprimir «Corregir corte», escribir el motivo y guardar.
4. **Director**: visar la nueva versión y revisar el «Historial de versiones».

| Ruta | Qué se ve |
| --- | --- |
| `/cortes` | Bandeja del Director filtrada en pendientes, con columna de soportes. |
| `/cortes/:id` | Detalle con «Soportes del corte», barra de revisión del Director y aviso de devolución para el Residente. |
| `/cortes/:id/editar` | Corrección con la observación del Director visible. En un corte visado muestra el bloqueo. |

## Flujos de excepción cubiertos

| Situación | Respuesta |
| --- | --- |
| Archivo de otro tipo o de más de 15 MB | Mensaje con la causa y la solución; no se sube. |
| Archivo repetido | «“patio-tuberias.jpg” ya está adjunto a este corte. No se volvió a cargar.» |
| Se cae la señal durante la carga | El archivo queda «En espera de señal» y se sube solo al volver la conexión. |
| Quitar por error | «Deshacer» durante 5 segundos o `Ctrl+Z`. |
| Director sin señal | Visar y Devolver quedan bloqueados con el motivo visible. |
| El corte cambió mientras se revisaba | «El corte cambió (versión N)» y no se puede decidir hasta revisar la versión actual. |
| Cerrar la devolución con texto escrito | Pregunta «¿Descartar la observación escrita?». |
| Corte sin soportes | Aviso al Director; no le impide decidir. |

## Uso de IA

Construí estas pantallas con **Claude** (Claude Code, de Anthropic) dentro del repositorio. La IA leyó los documentos del equipo, escribió el código y las pruebas, y comprobó el resultado en el navegador. Yo definí el alcance, tomé las decisiones de negocio y exigí probar todo en local antes de subirlo. El código no se presenta como escrito a mano.

### Prompt inicial

Le entregué la propuesta del MVP, la guía del Hito 2, el resumen de las heurísticas de Nielsen, el informe de IA del compañero, el README y el `design.md`. La instrucción fue:

> tengo que realizar el prototipo de la interfaz en dos historias de usuario … basicamente tengo que entregar la Historia 3 y 4, para ello quisiera utilizar las 10 heuristicas de nielsen

### Resultado de la IA

1. **Especificación** (`Especificacion HU-M03 y HU-M04.md`): criterios, pantallas, flujos de excepción, las 10 heurísticas y lo que pide cada módulo. Ahí señaló una contradicción: el prototipo de HU-M02 permitía editar un corte visado, y las historias lo prohíben.
2. **HU-M03**: modelo de soportes, sección con carga simulada, cola sin señal, visor y retiro con «Deshacer». Agregó fotos y un PDF de ejemplo marcados como ficticios.
3. **HU-M04**: bandeja del Director, barra de revisión, diálogo de devolución reutilizable y aviso para el residente.

### Refactorización humana

| Problema o decisión | Quién lo detectó | Cambio aplicado |
| --- | --- | --- |
| HU-M02 dejaba editar un corte visado, en contra de HU-M03 y HU-M04. | La IA lo señaló; yo decidí alinearlo con las historias. | El modelo rechaza guardar sobre un corte visado y la pantalla explica el bloqueo. Commit `63ff2ef`. |
| El código se escribió sin poder compilarlo: el equipo no tenía Node.js. | Yo pedí probar en local antes de cualquier commit. | Instalé Node.js; se ejecutaron las pruebas, la revisión de tipos y la compilación antes de subir. |
| En celular, la barra de revisión ocupaba casi media pantalla y tapaba los datos. | Prueba en el navegador que pedí antes de subir. | Solo la fila de botones queda fija; la explicación y los avisos pasan al contenido. Commit `90f7d85`. |
| Después de visar o devolver, el foco del teclado se perdía. | La misma prueba. | El foco pasa al nuevo estado del corte. Commit `90f7d85`. |
| «Cancelar» se estiraba junto a un botón bloqueado. | La misma prueba. | Se alineó al inicio. Commit `90f7d85`. |
| «Devolver con observaciones» se partía en dos líneas a 1440 px. | Al tomar las capturas de esta documentación. | El botón mantiene su ancho natural desde tableta. Commit de esta documentación. |

Las capturas de estos documentos son reales, tomadas del prototipo actual con datos de ejemplo. Las comprobaciones de accesibilidad del Módulo III son automáticas y no reemplazan las pruebas con usuarios.

## Cobertura

HU-M03 y HU-M04 figuran como **Cubiertas** en la matriz del equipo (`Cobertura de HU`). El detalle de pantallas y decisiones está en `Especificacion HU-M03 y HU-M04.md`.
