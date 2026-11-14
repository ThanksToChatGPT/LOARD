# Historias de usuario del MVP

Este documento recoge las 12 historias de usuario que componen el MVP (Release 1) del sistema de información para Loard Construcciones S.A.S. En total suman 47 puntos de esfuerzo.

El MVP ataca dos problemas concretos que hoy le generan a la empresa dolores de cabeza y pérdida de tiempo: entregar a tiempo el dossier de calidad que exige Chevron, y evitar que alguien sin la habilitación de SST al día termine asignado a un frente de obra.

## Por qué estas historias

La planeación anterior del proyecto no fue buena y eso nos dejó sin una base clara sobre la cual construir. Para poder avanzar, replanteamos el alcance y definimos estas 12 historias como un MVP acotado. El objetivo es poder avanzar, construir los prototipos y llevarlos a pruebas de usabilidad.

Este no es el backlog definitivo. A medida que iteremos y recojamos lo que salga de las pruebas, iremos agregando más historias de usuario.

## Resumen

| Código | Historia | Rol principal | Prioridad | Puntos |
|---|---|---|---|---|
| HU-M01 | Iniciar sesión y ver solo lo que corresponde al rol | Todos los usuarios | MUST | 3 |
| HU-M02 | Registrar el corte de obra | Ingeniero Residente | MUST | 5 |
| HU-M03 | Adjuntar fotografías y soportes al corte | Ingeniero Residente | MUST | 2 |
| HU-M04 | Visar o devolver el corte | Director de Proyectos | MUST | 3 |
| HU-M05 | Publicar documentos vigentes y armar la checklist | Coordinación SIG / Calidad | MUST | 5 |
| HU-M06 | Cargar soportes en la checklist y buscar documentos | Residente / Calidad | MUST | 3 |
| HU-M07 | Registrar ensayos NDT ligados a una junta | Calidad | MUST | 5 |
| HU-M08 | Monitorear el avance del dossier y exportarlo | Calidad / Gerencia | MUST | 5 |
| HU-M09 | Registrar cursos y aptitud médica con semáforo | Coordinación SST | MUST | 5 |
| HU-M10 | Asignar personal al corte con bloqueo SST | Ingeniero Residente | MUST | 3 |
| HU-M11 | Consultar la bitácora de cambios | Coordinación SIG / Calidad | MUST | 3 |
| HU-M12 | Consultar el tablero de avance | Director / Gerencia | MUST | 5 |
| | **Total** | | | **47** |

---

## HU-M01: Iniciar sesión y ver solo lo que corresponde al rol [MUST · 3 pts]

| | |
|---|---|
| **Módulo** | Control de acceso por roles. |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Usuario de Loard (Ingeniero Residente, Director de Proyectos, Coordinación SIG/Calidad, Responsable SST o Gerencia). |
| **Quiero** | iniciar sesión y encontrar únicamente las pantallas que tienen que ver con mi trabajo. |
| **Para** | no perderme entre opciones que no uso y que nadie toque información que no le corresponde. |

**Criterios de aceptación**

1. Con usuario y contraseña correctos, el sistema me deja entrar y me lleva a la pantalla de inicio de mi rol.
2. Si los datos están mal, veo un mensaje claro de error que no dice cuál de los dos campos falló.
3. El menú solo muestra los módulos autorizados para mi rol.
4. Si intento abrir por dirección directa una pantalla que no es de mi rol, el sistema no me deja y me avisa que no tengo permiso.
5. No existen cuentas para clientes externos: solo entra personal de Loard.
6. Puedo cerrar sesión cuando quiera y, después de hacerlo, nadie puede volver a las pantallas sin autenticarse de nuevo.

---

## HU-M02: Registrar el corte de obra [MUST · 5 pts]

| | |
|---|---|
| **Módulo** | Captura de cortes de obra. |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Ingeniero Residente. |
| **Quiero** | registrar desde mi portátil el corte semanal o mensual con el avance físico por actividad, las horas-hombre trabajadas y los insumos consumidos. |
| **Para** | dejar el avance del frente en un solo lugar y dejar de reportarlo por WhatsApp. |

**Criterios de aceptación**

1. Puedo crear un corte eligiendo el proyecto, el frente de obra y el periodo que cubre (semanal o mensual).
2. Por cada actividad registro el avance físico, las horas-hombre y los insumos consumidos.
3. El sistema no acepta avances negativos ni acumulados por encima del 100 % de la actividad.
4. Puedo guardar el corte como borrador y terminarlo después sin perder lo que llevaba.
5. Cuando lo envío, el corte queda pendiente de visado y le aparece al Director de Proyectos.
6. Tener un corte pendiente de visado no me impide registrar el siguiente.

---

## HU-M03: Adjuntar fotografías y soportes al corte [MUST · 2 pts]

| | |
|---|---|
| **Módulo** | Captura de cortes de obra. |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Ingeniero Residente. |
| **Quiero** | adjuntar fotografías y soportes en PDF al corte que registré. |
| **Para** | que lo reportado tenga evidencia y quien lo revise no tenga que pedírmela aparte. |

**Criterios de aceptación**

1. Puedo adjuntar una o varias fotografías y archivos PDF a un corte.
2. Si subo un archivo de otro tipo o demasiado pesado, el sistema lo rechaza y me explica por qué.
3. Los adjuntos se ven listados dentro del corte y se pueden abrir o descargar.
4. Puedo quitar un adjunto mientras el corte no haya sido visado.
5. El Director de Proyectos ve los mismos adjuntos cuando revisa el corte.

---

## HU-M04: Visar o devolver el corte [MUST · 3 pts]

| | |
|---|---|
| **Módulo** | Captura de cortes de obra y visado. |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Director de Proyectos. |
| **Quiero** | revisar cada corte y aprobarlo (visarlo) o devolverlo con observaciones puntuales. |
| **Para** | asegurar que lo reportado es correcto sin frenar el trabajo en el frente. |

**Criterios de aceptación**

1. Veo la lista de cortes pendientes de visado, con su proyecto, frente y periodo.
2. Al abrir un corte veo el avance, las horas-hombre, los insumos y los adjuntos.
3. Puedo visar el corte, y desde ese momento queda aprobado y ya no se puede modificar.
4. Puedo devolverlo, pero solo si escribo la observación que explica qué hay que corregir.
5. El residente ve el corte devuelto junto con mi observación y puede corregirlo y reenviarlo.
6. Mientras un corte está pendiente o devuelto, el residente puede seguir registrando cortes nuevos en ese frente.

---

## HU-M05: Publicar documentos vigentes y armar la checklist [MUST · 5 pts]

| | |
|---|---|
| **Módulo** | Dossier de calidad (checklist). |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Coordinación SIG / Calidad. |
| **Quiero** | publicar las versiones vigentes de los formatos del SIG y definir los ítems que exige la checklist en cada una de las 6 carpetas contractuales. |
| **Para** | que todos trabajen con el formato correcto y el dossier se vaya armando desde el primer día, no al cierre del contrato. |

**Criterios de aceptación**

1. Puedo publicar un documento del SIG indicando su código, nombre y versión.
2. Al publicar una versión nueva, la anterior deja de aparecer como vigente pero se conserva en el historial.
3. Cada proyecto activo tiene su checklist organizada en las 6 carpetas: documentación contractual y legal, actas de corte de obra, planos de ingeniería, certificados de materiales, equipos y NDT, informes técnicos de obra y memorias de cálculo.
4. Puedo agregar, editar o retirar ítems requeridos dentro de cada carpeta.
5. Todo ítem nuevo arranca en estado Pendiente.
6. Solo Coordinación SIG / Calidad puede publicar documentos y modificar la estructura de la checklist.

---

## HU-M06: Cargar soportes en la checklist y buscar documentos [MUST · 3 pts]

| | |
|---|---|
| **Módulo** | Dossier de calidad (checklist). |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Ingeniero Residente o integrante de Calidad. |
| **Quiero** | cargar el soporte PDF en cada ítem de la checklist y buscar con filtros los documentos vigentes. |
| **Para** | ir completando el dossier a medida que avanza la obra y encontrar rápido el formato que necesito. |

**Criterios de aceptación**

1. Puedo cargar un PDF en un ítem de la checklist y el ítem pasa a estado Archivo Cargado.
2. Calidad puede marcar el ítem como Validado, o como Observado dejando escrito el motivo.
3. Si un ítem queda Observado, puedo reemplazar el archivo y el ítem vuelve a Archivo Cargado.
4. Puedo buscar documentos vigentes filtrando al menos por nombre o código, carpeta y estado.
5. La búsqueda solo me muestra versiones vigentes, nunca las obsoletas.
6. Si no hay resultados, el sistema lo dice con claridad en lugar de mostrar una lista vacía sin explicación.

---

## HU-M07: Registrar ensayos NDT ligados a una junta [MUST · 5 pts]

| | |
|---|---|
| **Módulo** | Dossier de calidad (checklist). |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Integrante de Calidad. |
| **Quiero** | registrar cada ensayo no destructivo de laboratorio asociado a la junta soldada que se inspeccionó y vincularlo a la checklist. |
| **Para** | tener la trazabilidad de cada junta y que el reporte quede de una vez dentro del dossier. |

**Criterios de aceptación**

1. Puedo registrar un ensayo indicando la junta soldada, el tipo de ensayo, la fecha, el laboratorio y el resultado.
2. El sistema no deja guardar un ensayo sin junta asociada.
3. Puedo adjuntar el reporte PDF que entrega el laboratorio.
4. El ensayo queda vinculado al ítem correspondiente de la carpeta 4 (certificados de materiales, equipos y NDT).
5. Desde una junta puedo ver todos los ensayos que se le han hecho.
6. Un ensayo con resultado rechazado queda visible como tal y no cuenta como requisito cumplido.

---

## HU-M08: Monitorear el avance del dossier y exportarlo [MUST · 5 pts]

| | |
|---|---|
| **Módulo** | Dossier de calidad (checklist). |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Integrante de Calidad o de Gerencia. |
| **Quiero** | ver el porcentaje de avance de las 6 carpetas, saber qué requisitos faltan, controlar los días que quedan del plazo y exportar el paquete validado. |
| **Para** | radicar el dossier dentro de los 10 días calendario posteriores a la aceptación del acta de facturación. |

**Criterios de aceptación**

1. Veo el porcentaje de avance de cada carpeta y el global, y se actualizan apenas cambia el estado de un ítem.
2. El sistema resalta los ítems que faltan (Pendiente u Observado) para que sepa exactamente qué perseguir.
3. Al registrar la fecha de aceptación del acta de facturación, arranca la cuenta regresiva de 10 días calendario.
4. Los días restantes se muestran siempre a la vista y la alerta se hace más notoria a medida que se acerca el vencimiento.
5. El cierre y la exportación solo se habilitan cuando el 100 % de los ítems está Validado.
6. La exportación genera un archivo .ZIP organizado en las 6 carpetas contractuales.

---

## HU-M09: Registrar cursos y aptitud médica con semáforo [MUST · 5 pts]

| | |
|---|---|
| **Módulo** | Seguridad y Salud en el Trabajo (SST). |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Responsable de SST. |
| **Quiero** | registrar la vigencia de los cursos críticos de cada trabajador y su concepto médico ocupacional, con un semáforo que me avise antes de que algo se venza. |
| **Para** | renovar a tiempo y que nadie llegue a obra con la habilitación vencida. |

**Criterios de aceptación**

1. Por cada trabajador registro sus cursos críticos (trabajo en alturas, espacios confinados, inducciones) con fecha de vencimiento.
2. Registro el concepto médico únicamente como Habilitado o No habilitado.
3. El sistema no pide ni guarda historias clínicas ni diagnósticos, por reserva legal.
4. El semáforo muestra verde cuando todo está vigente, una alerta preventiva cuando faltan 30 días o menos, una alerta más fuerte cuando faltan 15 días o menos y rojo cuando ya venció.
5. Un trabajador con algún curso vencido o con concepto No habilitado aparece como no habilitado para obra.
6. Puedo filtrar la lista de personal por estado del semáforo para ver primero a quienes están por vencerse.

---

## HU-M10: Asignar personal al corte con bloqueo SST [MUST · 3 pts]

| | |
|---|---|
| **Módulo** | Captura de cortes de obra / SST. |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Ingeniero Residente. |
| **Quiero** | asignar al corte de obra el personal que trabajó en el frente, y que el sistema no me deje escoger a quien no esté habilitado. |
| **Para** | no exponer a la empresa ni al trabajador por asignar a alguien con la habilitación vencida. |

**Criterios de aceptación**

1. Al asignar personal, veo a cada trabajador con el estado de su semáforo SST.
2. No puedo seleccionar a un trabajador vencido o No habilitado: el bloqueo es terminante y no hay forma de saltárselo.
3. El sistema me dice por qué está bloqueado (curso vencido o concepto médico), sin mostrar información clínica.
4. Sí puedo asignar a quienes están en alerta de 30 o 15 días, y la advertencia queda a la vista.
5. Si un trabajador ya asignado se vence antes de que envíe el corte, el sistema me avisa y no me deja enviarlo con esa persona.

---

## HU-M11: Consultar la bitácora de cambios [MUST · 3 pts]

| | |
|---|---|
| **Módulo** | Trazabilidad y seguimiento directivo. |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Coordinación SIG / Calidad. |
| **Quiero** | consultar el historial de cambios de estado y aprobaciones de un registro. |
| **Para** | saber quién hizo qué y cuándo, y poder responder con respaldo ante una auditoría. |

**Criterios de aceptación**

1. Cada cambio de estado o de documento queda guardado con fecha, hora y autor.
2. Desde un corte, un ítem de la checklist o un documento puedo abrir su historial en orden cronológico.
3. El historial muestra el estado anterior, el nuevo y la observación, cuando la hubo.
4. Nadie puede editar ni borrar entradas de la bitácora.
5. Puedo filtrar el historial por rango de fechas y por autor.

---

## HU-M12: Consultar el tablero de avance [MUST · 5 pts]

| | |
|---|---|
| **Módulo** | Trazabilidad y seguimiento directivo. |

**Descripción de la historia de usuario**

| | |
|---|---|
| **Como** | Director de Proyectos o integrante de Gerencia. |
| **Quiero** | ver en un tablero el avance físico de cada proyecto frente al tiempo contractual transcurrido, junto con el progreso del dossier. |
| **Para** | detectar a tiempo los proyectos atrasados y decidir dónde intervenir sin tener que pedir informes. |

**Criterios de aceptación**

1. El tablero lista los proyectos activos con su porcentaje de avance físico y el porcentaje de tiempo contractual transcurrido.
2. El avance físico se calcula con los cortes visados.
3. Se distingue a simple vista cuándo un proyecto va por debajo de lo que debería según el tiempo transcurrido.
4. Cada proyecto muestra el porcentaje de avance de la checklist del dossier.
5. Puedo entrar a un proyecto para ver el detalle de sus cortes y de sus carpetas.
6. El tablero es solo de consulta: desde ahí no se modifica ningún dato.
