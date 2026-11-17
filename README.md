# LOARD - Sistema de información para Loard Construcciones S.A.S.

Repositorio del proyecto: historias de usuario (Hito 1), prototipo de alta fidelidad y documentación de los cuatro módulos del Hito 2.

**Prototipo publicado: <https://thankstochatgpt.github.io/LOARD/>**


| Perfil | Correo | Qué puede recorrer |
| --- | --- | --- |
| Residente | `residente@loard.demo` | [Cortes de obra](https://thankstochatgpt.github.io/LOARD/cortes), soportes y personal del corte |
| Director | `director@loard.demo` | Cortes por revisar (visar o devolver) y [tablero](https://thankstochatgpt.github.io/LOARD/dashboard) |
| Calidad | `calidad@loard.demo` | [Dossier de calidad](https://thankstochatgpt.github.io/LOARD/dossier), ensayos NDT y [bitácora](https://thankstochatgpt.github.io/LOARD/dossier/bitacora) |
| SST | `sst@loard.demo` | [Personal SST](https://thankstochatgpt.github.io/LOARD/sst): cursos y aptitud médica |
| Gerencia | `gerencia@loard.demo` | Consulta de cortes y tablero del proyecto |

Los datos son de ejemplo, el reloj está fijo en el 17/11/2026 y todo se guarda en el navegador: no hay un servidor activo. La página [/muestra](https://thankstochatgpt.github.io/LOARD/muestra) reúne los componentes del sistema de diseño.

## Mapa del repositorio

| Carpeta | Contenido |
| --- | --- |
| [Hito 1](Hito%201) | [Historias de usuario del MVP](Hito%201/Historias%20de%20usuario/Historias%20de%20usuario.pdf): las 12 historias, sus criterios y la pantalla del prototipo que las resuelve. |
| [Hito 2](Hito%202) | Prototipo y documentos de los cuatro módulos. |
| [Hito 2 - Módulo I](Hito%202/Modulo-I-Prototipo) | Prototipo (código), cobertura de HU e informe de uso de IA. |
| [Hito 2 - Módulo II](Hito%202/Modulo-II-Frontend) | Inventario de componentes, diseño responsivo y heurísticas de Nielsen. |
| [Hito 2 - Módulo III](Hito%202/Modulo-III-QC) | Reporte de validación RITE y auditoría de accesibilidad. |
| [Hito 2 - Módulo IV](Hito%202/Modulo-IV-Persistencia) | Modelo entidad-relación y mapa de API. |
| [Hito 2/design.md](Hito%202/design.md) | Sistema de diseño: colores, tipografía, retícula, componentes y comportamiento sin señal. |

## Documentos (PDF)

| Hito / módulo | Documento |
| --- | --- |
| Hito 1 | [Historias de usuario](Hito%201/Historias%20de%20usuario/Historias%20de%20usuario.pdf) |
| Módulo I | [Cobertura de HU](Hito%202/Modulo-I-Prototipo/Cobertura%20de%20HU/Cobertura%20de%20HU.pdf) |
| Módulo I | [Creación del prototipo: uso de IA](Hito%202/Modulo-I-Prototipo/Informe%20de%20uso%20de%20ia/Creacion%20de%20prototipo%20-%20Uso%20de%20IA.pdf) |
| Módulo II | [Inventario de componentes](Hito%202/Modulo-II-Frontend/Inventario%20de%20componentes/Inventario%20de%20componentes.pdf) |
| Módulo II | [Diseño responsivo](Hito%202/Modulo-II-Frontend/Dise%C3%B1o%20responsivo/Dise%C3%B1o%20responsivo.pdf) |
| Módulo II | [Heurísticas de Nielsen](Hito%202/Modulo-II-Frontend/Heur%C3%ADsticas%20de%20Nielsen/Heur%C3%ADsticas%20de%20Nielsen.pdf) |
| Módulo III | [Reporte de validación RITE](Hito%202/Modulo-III-QC/Reporte%20de%20validacion%20RITE/Reporte%20de%20validacion%20RITE.pdf), |
| Módulo III | [Auditoría de accesibilidad](Hito%202/Modulo-III-QC/Auditoria%20de%20accesibilidad/Auditoria%20de%20accesibilidad.pdf) |
| Módulo IV | [Modelo de datos y API](Hito%202/Modulo-IV-Persistencia/Modelo%20de%20datos%20y%20API/Modelo%20de%20datos%20y%20API.pdf) |

## Ejecutar el prototipo en local

Requiere Node.js 22.12 o superior. Desde la raíz del repositorio:

```bash
npm ci
```

```bash
npm run dev
```

Abre <http://127.0.0.1:5173>. Los comandos de la raíz ejecutan el prototipo de [`Hito 2/Modulo-I-Prototipo/prototipo`](Hito%202/Modulo-I-Prototipo/prototipo). Para comprobarlo:

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run build
```

