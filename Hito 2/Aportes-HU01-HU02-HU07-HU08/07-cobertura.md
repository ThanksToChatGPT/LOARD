# Cobertura de historias de usuario

Loard · Hito 2 · Actualización del aporte HU-M01, HU-M02, HU-M07 y HU-M08.

Cubierta: flujo documentado para el prototipo; en HU3/4/9/10 se conserva la cobertura previa del equipo. Integrada: se verificó su presencia y conexión en el código actual, pero este aporte no sustituye la validación detallada de su responsable. Los estados describen el prototipo, no un backend productivo.

| HU | Historia | Pantallas y evidencia | Estado |
| --- | --- | --- | --- |
| HU-M01 | Acceso por perfil | /acceso; sesión de ejemplo y menú por rol. | Cubierta |
| HU-M02 | Registro y edición de cortes | /cortes, /cortes/nuevo, /cortes/:id y /cortes/:id/editar; cantidades por unidad, HH, borrador y versiones. | Cubierta |
| HU-M03 | Soportes del corte | /cortes/:id y edición; fotos/PDF, visor, retiro y cola. Se conserva la cobertura documentada por su responsable. | Cubierta |
| HU-M04 | Visado o devolución | /cortes y /cortes/:id como Director; devolución con motivo y confirmación de visado. Se conserva la cobertura previa. | Cubierta |
| HU-M05 | Documentos y checklist | /dossier, /dossier/documentos y /dossier/documentos/publicar; pantallas integradas por el compañero. | Integrada |
| HU-M06 | Soportes y búsqueda del dossier | /dossier y /dossier/documentos; DetalleItem para carga, validación y observación. Integración compartida. | Integrada |
| HU-M07 | Ensayos NDT por junta | /dossier/ensayos y /dossier/ensayos/nuevo; laboratorio, método, fecha, resultado, PDF y requisito por informe. | Cubierta |
| HU-M08 | Avance y entrega del dossier | /dossier/avance; seis carpetas, faltantes, aceptación del acta, diez días y ZIP parcial/validado de ejemplo. | Cubierta |
| HU-M09 | Cursos y aptitud SST | /sst, /sst/:id, /sst/:id/cursos/nuevo y /sst/:id/aptitud; se conserva la cobertura documentada del equipo. | Cubierta |
| HU-M10 | Personal del corte con bloqueo SST | /cortes/nuevo y /cortes/nuevo/personal; selector compartido, motivos de bloqueo y horas. | Cubierta |
| HU-M11 | Bitácora de cambios | /dossier/bitacora; consulta de cortes y requisitos confirmados. /cortes/:id y /sst/:id conservan historiales propios. | Integrada |
| HU-M12 | Tablero del proyecto | /dashboard para Director/Gerencia; avance y seis carpetas. CW-118 usa el dossier compartido confirmado. | Integrada |

## Resumen

Ocho historias con cobertura documentada y cuatro integradas con validación detallada a cargo de sus responsables. Ninguna carece de ruta en el código actual. Las cuatro historias de este aporte cuentan con capturas actuales, inspección técnica y pruebas automatizadas compartidas. Las sesiones RITE de ejemplo son SIMULADAS y no justifican ninguno de estos estados.
