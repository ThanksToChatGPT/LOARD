# Componentes que reutilizamos

Nuestra parte: HU1, HU2, HU7 y HU8.

No agregamos botones o campos nuevos a la biblioteca común. Armamos nuestras pantallas con las piezas que ya tenía el equipo.

| Componente | Para qué lo usamos | Opciones o estados |
| --- | --- | --- |
| Button | Entrar, guardar y exportar. | Normal, cargando o bloqueado con una explicación. |
| TextField, DateField y Select | Texto, fechas y selección de datos. | Etiqueta, valor, ayuda y error. |
| FormLayout | Organizar el corte por secciones. | Encabezado, mensaje del borrador y acciones. |
| FileUpload y UploadItem | Elegir el PDF NDT y mostrar su carga. | Progreso, confirmación, listo, espera de señal y error. |
| Banner y StatusBadge | Informar errores, plazo y estado. | Texto, color e icono. |
| ProgressBar | Mostrar el avance del dossier. | Porcentaje global y por carpeta. |
| Dialog, Drawer y Timeline | Abrir detalles, confirmar datos y ver cambios. | Abrir/cerrar, acciones, autor, fecha y motivo. |

Las pantallas propias están en features/acceso, features/cortes y features/dossier. Las reglas del dossier están en modelo.ts y entrega.ts. El archivo lib/seguimiento/dossier.ts lleva esos datos al tablero y a la bitácora. Se comparte la información; no se crea otra checklist.

## Seis reglas de usabilidad aplicadas

Las heurísticas de Nielsen son recomendaciones para hacer una aplicación más fácil de usar. Estas son las que se pueden ver en nuestra parte:

| Regla | Ejemplo en la aplicación |
| --- | --- |
| Mostrar qué está pasando | Progreso del PDF, estado del corte y días que faltan. |
| Usar palabras del trabajo real | Corte, frente, junta, laboratorio y acta. |
| Dar control al usuario | Volver, descartar un borrador y deshacer una validación. |
| Mantener la misma forma de uso | Se reutilizan los botones, estados y paneles del equipo. |
| Evitar errores | Se rechazan cantidades inválidas, PDF grandes y cierres con requisitos pendientes. |
| Explicar cómo corregir | Los mensajes dicen qué falta y conservan los campos del formulario. |

Esta tabla es una revisión del diseño. No contiene resultados de pruebas con usuarios.
