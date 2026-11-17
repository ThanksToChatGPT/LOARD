# Módulo I - Prototipo de alta fidelidad

[Hito 2](../README.md) | [Módulo II](../Modulo-II-Frontend/README.md)

## Entregables

| Entregable | Documento | Qué contiene |
| --- | --- | --- |
| Prototipo interactivo | <https://thankstochatgpt.github.io/LOARD/> | Flujo navegable de las 12 historias, con los flujos de excepción (bloqueos, errores, falta de señal y observaciones). |
| Cobertura de HU | [PDF](Cobertura%20de%20HU/Cobertura%20de%20HU.pdf) | Matriz *HU > pantalla(s)* con el 100 % de las historias del MVP, responsable y estado, y el detalle de criterios y flujos de excepción de cada historia. |
| Informe de uso de IA | [PDF](Informe%20de%20uso%20de%20ia/Creacion%20de%20prototipo%20-%20Uso%20de%20IA.pdf) | *Prompt inicial > resultado de la IA > refactorización humana* del sistema de diseño y de cada grupo de historias, con capturas y enlaces a los commits. |

## Recorrido de la demostración

Todas las cuentas usan la contraseña `Demo2026!`.

1. En [/acceso](https://thankstochatgpt.github.io/LOARD/acceso), elige un "Perfil de ejemplo": el correo y la contraseña se completan solos.
2. **Residente** (`residente@loard.demo`): en [Cortes de obra](https://thankstochatgpt.github.io/LOARD/cortes) registra un corte con actividades, personal habilitado, horas e insumos. Abre el [Corte #08](https://thankstochatgpt.github.io/LOARD/cortes/ejemplo-3) y adjunta fotos o PDF en "Soportes del corte" (hay archivos de prueba en [`prototipo/public/ejemplos`](prototipo/public/ejemplos)). El botón "Prototipo: simular sin señal" deja los archivos en espera.
3. **Director** (`director@loard.demo`): en "Cortes por revisar" abre el Corte #08 y devuélvelo con una observación, o vísalo con confirmación.
4. **Residente**: corrige el corte devuelto; vuelve a revisión y el historial conserva cada versión.
5. **SST** (`sst@loard.demo`): en [Personal SST](https://thankstochatgpt.github.io/LOARD/sst) registra cursos y aptitud médica; los bloqueos aparecen en el selector de personal del corte.
6. **Calidad** (`calidad@loard.demo`): en el [Dossier](https://thankstochatgpt.github.io/LOARD/dossier) revisa la checklist, publica documentos, registra un [ensayo NDT](https://thankstochatgpt.github.io/LOARD/dossier/ensayos/nuevo), consulta el [avance y la entrega](https://thankstochatgpt.github.io/LOARD/dossier/avance) y la [bitácora](https://thankstochatgpt.github.io/LOARD/dossier/bitacora).
7. **Director o Gerencia**: consulta el [tablero del proyecto](https://thankstochatgpt.github.io/LOARD/dashboard).

El botón con el símbolo de apagar cierra la sesión para cambiar de perfil. Los cortes, versiones, soportes y el dossier se guardan en `localStorage`; los registros SST se mantienen en memoria durante la sesión. El reloj está fijo en el 17/11/2026.

## Cómo está organizado `prototipo/`

| Carpeta | Qué va ahí |
| :--- | :--- |
| [`src/styles`](prototipo/src/styles) | `tokens.css` es el único archivo con códigos de color. En el resto se usan nombres de token (`bg-surface`, `text-error`). |
| [`src/components`](prototipo/src/components) | Componentes compartidos (átomos, moléculas, organismos y plantillas). Se importan desde `@/components`. |
| [`src/lib`](prototipo/src/lib) | Reglas y constantes de negocio: estados oficiales, semáforo SST, fechas, archivos, datos SST compartidos y consultas de seguimiento. |
| [`src/hooks`](prototipo/src/hooks) | Tema claro/oscuro, foco dentro de diálogos, ancho de pantalla y estado de conexión. |
| [`src/features`](prototipo/src/features) | Una carpeta por módulo funcional. |
| [`src/muestra`](prototipo/src/muestra) | Página que enseña todos los componentes ([/muestra](https://thankstochatgpt.github.io/LOARD/muestra)). |

| Carpeta en `features` | Historias de usuario |
| :--- | :--- |
| [`acceso`](prototipo/src/features/acceso) | HU-M01 |
| [`cortes`](prototipo/src/features/cortes) | HU-M02, HU-M03, HU-M04, HU-M10 |
| [`dossier`](prototipo/src/features/dossier) | HU-M05, HU-M06, HU-M07, HU-M08, HU-M11 |
| [`sst`](prototipo/src/features/sst) | HU-M09 |
| [`tablero`](prototipo/src/features/tablero) | HU-M12 |

## Comandos

Desde la raíz del repositorio: `npm ci`, `npm run dev` (abre <http://127.0.0.1:5173>), `npm test`, `npm run typecheck` y `npm run build`. Ver el [README principal](../../README.md#ejecutar-el-prototipo-en-local).
