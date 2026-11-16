# Documentación de HU1, HU2, HU7 y HU8

Esta carpeta reúne nuestra parte. Los documentos del equipo conservan sus páginas y llevan el aporte nuevo al final. La matriz de cobertura se actualizó directamente.

| Qué documentamos | Archivo editable | PDF |
| --- | --- | --- |
| Cómo trabajamos con IA y qué decidió el integrante | [Uso de IA](01-uso-ia.md) | [Aporte](01-uso-ia.pdf) |
| Cómo se ve en computador y celular | [Diseño responsivo](02-responsivo.md) | [Aporte](02-responsivo.pdf) |
| Componentes y seis reglas de usabilidad | [Componentes](03-componentes-heuristicas.md) | [Aporte](03-componentes-heuristicas.pdf) |
| Teclado, mensajes, tamaño y contraste del texto | [Accesibilidad](04-accesibilidad.md) | [Aporte](04-accesibilidad.pdf) |
| Cómo llenar una prueba con usuarios | [Ejemplo RITE](05-rite-ejemplo.md) | [Ejemplo SIMULADO](05-rite-ejemplo.pdf) |
| Qué datos y conexiones necesitaríamos después | [Propuesta de datos y API](06-persistencia-api.md) | [Propuesta](06-persistencia-api.pdf) |
| Pantallas de cada historia | [Cobertura](07-cobertura.md) | [Matriz del equipo](../Modulo-I-Prototipo/Cobertura%20de%20HU/Cobertura%20de%20HU.pdf) |

## Documentos compartidos actualizados

- [Informe de uso de IA](../Modulo-I-Prototipo/Informe%20de%20uso%20de%20ia/Creacion%20de%20prototipo%20-%20Uso%20de%20IA.pdf).
- [Diseño responsivo](../Modulo-II-Frontend/Dise%C3%B1o%20responsivo/Dise%C3%B1o%20responsivo.pdf).
- [Inventario de componentes](../Modulo-II-Frontend/Inventario%20de%20componentes/Inventario%20de%20componentes.pdf).
- [Auditoría de accesibilidad](../Modulo-III-QC/Auditoria%20de%20accesibilidad/Auditoria%20de%20accesibilidad.pdf).

## Qué es real y qué es de ejemplo

Las capturas de la carpeta capturas son reales de la versión actual. La aplicación muestra datos ficticios y usa el día fijo 17/11/2026. El registro de captura guarda la fecha real. Las comprobaciones técnicas se hicieron con un navegador y se volvieron a ejecutar las 101 pruebas automáticas y la compilación.

El documento 05-rite-ejemplo es SIMULADO. Se aclara en su título, al inicio, en las tablas, en el comentario, en la mejora propuesta y al pie de todas sus páginas PDF. S1 y S2 no son personas reales. El informe de IA y la matriz también lo recuerdan al mencionar esa evaluación.

La propuesta de datos y API describe un trabajo futuro. No significa que exista un servidor activo.

## Checklist de nuestra parte

- [x] Matriz de cobertura actualizada.
- [x] Aporte al informe de uso de IA con decisiones reales y referencias a Git.
- [x] Capturas actuales en computador y celular.
- [x] Componentes reutilizados y seis reglas de usabilidad explicadas.
- [x] Revisión técnica de accesibilidad con resultados y límites.
- [x] Idea de tablas, relaciones y API para compartir con el equipo.
- [x] Ejemplo de informe RITE, claramente marcado como simulado.
- [ ] Realizar y documentar las sesiones con dos personas reales.

## Cómo actualizar los PDF

Las fuentes de nuestros aportes son los archivos .md de esta carpeta. El script generar_pdf.py crea los PDF y agrega nuestros aportes a las páginas originales del equipo. Necesita Python con reportlab, pypdf y Pillow.

Ejecutar desde cualquier carpeta: `python "Hito 2/Aportes-HU01-HU02-HU07-HU08/generar_pdf.py"`, usando la ruta correcta del repositorio si se ejecuta fuera de su raíz.

El script toma los documentos originales del commit 2c0bee5 para no repetir los anexos cada vez. Si el equipo cambia esos documentos, hay que revisar y actualizar esa base antes de volver a generarlos. Las fuentes LaTeX compartidas incluyen nuestros PDF al final; la matriz tiene también su fuente LaTeX actualizada.
