# Documentación de HU1, HU2, HU7 y HU8

Esta carpeta reúne nuestra parte. Los documentos del equipo conservan sus páginas y llevan el aporte nuevo al final. La matriz de cobertura se actualizó directamente.

| Qué documentamos | Archivo editable | PDF |
| --- | --- | --- |
| Cómo trabajamos con IA y qué decidió el integrante | [Uso de IA](01-uso-ia.md) | [Aporte](01-uso-ia.pdf) |
| Cómo se ve en computador y celular | [Diseño responsivo](02-responsivo.md) | [Aporte](02-responsivo.pdf) |
| Componentes y seis reglas de usabilidad | [Componentes](03-componentes-heuristicas.md) | [Aporte](03-componentes-heuristicas.pdf) |
| Teclado, mensajes, tamaño y contraste del texto | [Accesibilidad](04-accesibilidad.md) | [Aporte](04-accesibilidad.pdf) |
| Informe de las pruebas con usuarios | [Word del autor](05-rite-ejemplo.docx) | [Informe RITE](05-rite-ejemplo.pdf) |
| Qué datos y conexiones necesitaríamos después | [Propuesta de datos y API](06-persistencia-api.md) | [Propuesta](06-persistencia-api.pdf) |
| Pantallas de cada historia | [Cobertura](07-cobertura.md) | [Matriz del equipo](../Modulo-I-Prototipo/Cobertura%20de%20HU/Cobertura%20de%20HU.pdf) |

## Documentos compartidos actualizados

- [Informe de uso de IA](../Modulo-I-Prototipo/Informe%20de%20uso%20de%20ia/Creacion%20de%20prototipo%20-%20Uso%20de%20IA.pdf).
- [Diseño responsivo](../Modulo-II-Frontend/Dise%C3%B1o%20responsivo/Dise%C3%B1o%20responsivo.pdf).
- [Inventario de componentes](../Modulo-II-Frontend/Inventario%20de%20componentes/Inventario%20de%20componentes.pdf).
- [Auditoría de accesibilidad](../Modulo-III-QC/Auditoria%20de%20accesibilidad/Auditoria%20de%20accesibilidad.pdf).

## Qué es real y qué es de ejemplo

Las capturas de la carpeta capturas son reales de la versión actual. La aplicación muestra datos ficticios y usa el día fijo 17/11/2026. El registro de captura guarda la fecha real. Las comprobaciones técnicas se hicieron con un navegador y se volvieron a ejecutar las 101 pruebas automáticas y la compilación.

El informe RITE actual viene del Word aportado por Juan David Peña. El autor confirmó que S1 y S2 corresponden a dos personas reales y que ambas sesiones fueron el 16 de noviembre de 2026. Se quitó el color azul y se corrigieron las sangrías de las tablas. El ejemplo simulado anterior se conserva en el historial de Git.

No se tomaron capturas durante esas sesiones. Las dos figuras del anexo muestran una revisión posterior del mismo día. En esta revisión se completaron los ajustes que faltaban en la rama del repositorio: el acceso al historial desde el aviso de guardado y la ayuda junto al resultado NDT. Estas imágenes muestran la versión actual; no se presentan como fotos de las pruebas. Los originales y las comprobaciones están en [el registro de la revisión](capturas/rite-revision-actual.json).

El Word es la fuente principal del informe. El PDF y el texto .md reflejan esa versión. Para cambiar el contenido, editar el Word y exportar otra vez el PDF. El generador conserva este PDF y no lo sustituye por el ejemplo antiguo.

La propuesta de datos y API describe un trabajo futuro. No significa que exista un servidor activo.

## Checklist de nuestra parte

- [x] Matriz de cobertura actualizada.
- [x] Aporte al informe de uso de IA con decisiones reales y referencias a Git.
- [x] Capturas actuales en computador y celular.
- [x] Componentes reutilizados y seis reglas de usabilidad explicadas.
- [x] Revisión técnica de accesibilidad con resultados y límites.
- [x] Idea de tablas, relaciones y API para compartir con el equipo.
- [x] Incorporar el informe RITE aportado por el autor, quien confirma dos participantes reales.
- [x] Registrar la fecha de S1 y S2: 16 de noviembre de 2026, confirmada por el autor.
- [x] Completar y comprobar los dos ajustes en el código del repositorio.
- [x] Añadir capturas de la revisión actual con su fecha y una nota que las distingue de las sesiones originales.

## Cómo actualizar los PDF

Las fuentes de nuestros aportes son los archivos .md de esta carpeta, salvo el informe RITE, que se edita en Word. El script generar_pdf.py crea los demás PDF y agrega nuestros aportes a las páginas originales del equipo. Conserva el RITE sin modificarlo. Necesita Python con reportlab, pypdf y Pillow.

Ejecutar desde cualquier carpeta: `python "Hito 2/Aportes-HU01-HU02-HU07-HU08/generar_pdf.py"`, usando la ruta correcta del repositorio si se ejecuta fuera de su raíz.

El script toma los documentos originales del commit 2c0bee5 para no repetir los anexos cada vez. Si el equipo cambia esos documentos, hay que revisar y actualizar esa base antes de volver a generarlos. Las fuentes LaTeX compartidas incluyen nuestros PDF al final; la matriz tiene también su fuente LaTeX actualizada.
