# Documentación de HU-M03 y HU-M04

Aporte de Sebastián Gutiérrez: soportes del corte (HU-M03) y visado o devolución del corte (HU-M04). Cada módulo del Hito 2 tiene su carpeta `HU03-HU04` con el documento editable (`.md`) y su PDF.

| Módulo | Qué contiene | Documento |
| --- | --- | --- |
| I · Prototipo | Historias, criterios, recorrido, flujos de excepción y uso de IA (prompt → resultado → refactorización humana). | [Modulo_1_HU03_HU04](Modulo_1_HU03_HU04.pdf) |
| II · Frontend | Inventario de componentes, estructura en React, diseño responsivo y las 10 heurísticas de Nielsen. | [Modulo_2_HU03_HU04](../../Modulo-II-Frontend/HU03-HU04/Modulo_2_HU03_HU04.pdf) |
| III · QC | Auditoría WCAG (contraste, teclado, tamaños, reflujo), revisión técnica y protocolo RITE. | [Modulo_3_HU03_HU04](../../Modulo-III-QC/HU03-HU04/Modulo_3_HU03_HU04.pdf) |
| IV · Persistencia | Diagrama entidad-relación mínimo y mapa de API. | [Modulo_4_HU03_HU04](../../Modulo-IV-Persistencia/HU03-HU04/Modulo_4_HU03_HU04.pdf) |

La especificación original está en [Especificacion HU-M03 y HU-M04.md](../Especificacion%20HU-M03%20y%20HU-M04.md).

## Qué es real y qué está pendiente

- Las capturas son reales, tomadas del prototipo actual con datos de ejemplo. Su registro está en `Modulo-II-Frontend/HU03-HU04/capturas/manifest.json`.
- Las comprobaciones de accesibilidad son automáticas y no usan participantes. Sus resultados están en `Modulo-III-QC/HU03-HU04/contraste.json` y `verificacion.json`.
- **Pendiente:** las sesiones RITE con dos usuarios reales. El protocolo y las tablas para llenarlas están en el documento del Módulo III.

## Cómo regenerar capturas, comprobaciones y PDF

Requiere Node.js 22 o superior y Microsoft Edge; no instala dependencias. Desde la raíz del repositorio, con el prototipo corriendo en `http://127.0.0.1:5174` (o la URL en la variable `LOARD_URL`):

```bash
node "Hito 2/Modulo-I-Prototipo/HU03-HU04/herramientas/capturas.mjs"
node "Hito 2/Modulo-I-Prototipo/HU03-HU04/herramientas/contraste.mjs"
node "Hito 2/Modulo-I-Prototipo/HU03-HU04/herramientas/verificacion.mjs"
node "Hito 2/Modulo-I-Prototipo/HU03-HU04/herramientas/generar-pdf.mjs"
```

`contraste.mjs` y `generar-pdf.mjs` no necesitan el prototipo corriendo.
