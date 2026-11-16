# Prueba RITE del prototipo Loard: ejemplo simulado

## Qué representé en este ejercicio

Preparé un caso completo para las HU1, HU2, HU7 y HU8. Representé dos recorridos, las dificultades encontradas y una mejora entre ambos. Todos los participantes, tiempos y observaciones son ficticios. No hice estas sesiones con personas ni apliqué al prototipo los cambios que supuse para comparar los recorridos.

## Datos que usé en el caso

Elegí datos concretos para mostrar qué se registraría y qué resultado debería quedar en la aplicación. Partí del mismo estado inicial en cada recorrido, sin acumular los registros de S1 en el caso de S2. Usé el día fijo del prototipo, 17 de noviembre de 2026, como referencia del plazo; no es la fecha de una sesión real.

**Tabla 1**

*Datos de entrada del caso simulado*

| Registro | Datos de ejemplo |
| --- | --- |
| Acceso | Residente: residente@loard.demo. Calidad: calidad@loard.demo. Contraseña de ejemplo: Demo2026! |
| Corte #09 | Frente: Estación compresora. Periodo: 10 al 17 de noviembre de 2026. Soldadura y tendido de tubería: 120 m. |
| Personal e insumos | Fredy Cuero: 40 horas. Electrodo E7018: 12,5 kg. |
| Corrección del corte | De 120 m a 128 m. Motivo: «Incluí los 8 m del cierre del frente». Resultado esperado: versión 2, conservando la versión 1. |
| Ensayo NDT | Junta JW-16-042. Laboratorio Delta. Informe RT-DEMO-001. Radiografía del 16 de noviembre de 2026. Resultado: Conforme. Archivo: RT-DEMO-001.pdf. |
| Dossier | Acta #07 aceptada el 11 de noviembre. Fecha límite: 21 de noviembre. Cuatro días restantes según el reloj del prototipo. |

*Nota.* Los nombres y registros pertenecen al caso de demostración. No representan documentos de obra reales.

## Primer recorrido de ejemplo

Para S1 planteé un perfil con experiencia media, usando un computador. En el caso, completó el acceso sin ayuda. Al corregir el corte, guardó los 128 m, pero necesitó ayuda para encontrar el historial y comprobar que los 120 m seguían en la versión anterior.

En el registro NDT representé una segunda dificultad: S1 interpretó Conforme como si el documento ya estuviera validado. Anoté como comentario ficticio: «Pensé que ya estaba aprobado porque decía Conforme». En el ejemplo aclaré que ese resultado pertenece al laboratorio y que el PDF todavía necesita revisión.

Para el dossier, representé cuatro requisitos validados de dieciocho, equivalentes al 22%. Cargar el reporte no cambió ese valor. Solo después de validar su soporte, el caso pasó a cinco de dieciocho, equivalentes al 28%. El borrador ZIP quedó disponible y el cierre siguió bloqueado por los requisitos pendientes.

## Mejora que supuse para el segundo recorrido

Entre los dos recorridos planteé los cambios de la tabla 2. Son cambios hipotéticos de este ejercicio: no los implementé ni obtuve evidencia de que funcionaran con personas.

**Tabla 2**

*Comparación antes y después dentro de la simulación*

| Dificultad ficticia | Antes del cambio supuesto | Después del cambio supuesto |
| --- | --- | --- |
| No encontrar el historial | S1 buscó la versión anterior entre los datos del corte. | Supuse un acceso «Ver historial» junto al mensaje de guardado. S2 lo encontró sin ayuda. |
| Confundir Conforme con Validado | S1 creyó que el resultado del laboratorio cerraba la revisión del PDF. | Supuse una ayuda junto al resultado: «El PDF debe ser revisado por Calidad». S2 distinguió ambos estados. |

## Segundo recorrido de ejemplo

Para S2 planteé un perfil con poca experiencia, usando un celular. Representé las mismas cuatro tareas después de los cambios supuestos. En este caso, S2 ubicó el historial y distinguió el resultado del ensayo del estado del documento. Conservé otra dificultad: necesitó ayuda para entender que las horas se registran por trabajador.

**Tabla 3**

*Resultados y tiempos del ejercicio simulado*

| Perfil ficticio | Tarea | Resultado de ejemplo | Tiempo de ejemplo |
| --- | --- | --- | --- |
| S1 | Entrar | Sin ayuda | 35 s |
| S1 | Registrar y editar un corte | Con ayuda para encontrar el historial | 4 min 10 s |
| S1 | Registrar un NDT | Con ayuda sobre la validación | 3 min 20 s |
| S1 | Revisar el dossier y descargar | Sin ayuda | 2 min 05 s |
| S2 | Entrar | Sin ayuda | 45 s |
| S2 | Registrar y editar un corte | Con ayuda sobre las horas | 3 min 30 s |
| S2 | Registrar un NDT | Sin ayuda en este ejemplo | 2 min 30 s |
| S2 | Revisar el dossier y descargar | Sin ayuda | 2 min 15 s |

*Nota.* Inventé estos tiempos y resultados para completar el ejemplo. No son mediciones de usuarios reales.

## Qué muestra este ejemplo

Al sumar los datos de la tabla, obtuve 10 minutos y 10 segundos para S1 y 9 minutos para S2. Ambos completaron cuatro tareas; S1 tuvo ayuda en dos y S2 en una. Son cuentas del caso simulado, no una prueba de que los cambios mejoren el rendimiento real.

Este ejercicio deja un registro completo de entradas, resultados, problemas y cambios supuestos. Para convertirlo en una evaluación real, me falta observar a dos personas, registrar sus resultados y conservar evidencia de los cambios que sí aplique.
