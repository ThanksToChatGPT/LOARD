# Módulo I · Prototipo de alta fidelidad

Artefactos de este módulo:

- **Prototipo interactivo** (`prototipo/`): flujo navegable con los flujos de excepción (bloqueos, errores, observaciones).
- **Cobertura de HU:** matriz *HU → pantalla(s)* con el 100 % de las historias del MVP.
- **Informe de creacion / uso de IA:** prompt inicial → resultado de la IA → refactorización humana, con capturas antes/después.

## Cómo está organizado `prototipo/`

| Carpeta | Qué va ahí |
| :--- | :--- |
| `src/styles` | `tokens.css` es el único archivo con códigos de color. En el resto se usan nombres de token (`bg-surface`, `text-error`). |
| `src/components` | Componentes compartidos por todo el equipo (átomos, moléculas, organismos y plantillas). Se importan desde `@/components`. |
| `src/lib` | Reglas y constantes de negocio: estados oficiales, semáforo SST, formatos de fecha, validación de archivos. |
| `src/hooks` | Tema claro/oscuro, foco dentro de diálogos, ancho de pantalla, estado de conexión. |
| `src/features` | Una carpeta por módulo funcional. Cada pantalla se construye dentro de la suya. |
| `src/muestra` | Página que enseña todos los componentes compartidos. |

| Carpeta en `features` | Historias de usuario |
| :--- | :--- |
| `acceso` | HU-M01 |
| `cortes` | HU-M02, HU-M03, HU-M04, HU-M10 |
| `dossier` | HU-M05, HU-M06, HU-M07, HU-M08, HU-M11 |
| `sst` | HU-M09 |
| `tablero` | HU-M12 |

## Reglas para construir una pantalla

1. Antes de crear un componente, revisar si ya existe en `@/components`.
2. No escribir códigos de color ni tamaños sueltos: usar los tokens de Tailwind.
3. Los textos de estado salen de `@/lib/estados`; no se escriben a mano.
4. Lo que solo usa un módulo se queda en su carpeta de `features`. Si lo necesita un segundo módulo, se pasa a `components`.

## Comandos

```bash
npm run dev        # abre la página de muestra
npm run typecheck  # revisa tipos
npm run test       # pruebas del semáforo SST
npm run build      # compila
```
