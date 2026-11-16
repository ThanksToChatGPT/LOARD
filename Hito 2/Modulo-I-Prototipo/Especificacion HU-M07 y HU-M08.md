# HU-M07 y HU-M08 · Prototipo de calidad

Implementación académica de alta fidelidad en `prototipo/src/features/dossier`, integrada con HU-M05/HU-M06. Todos los datos son ficticios. Las acciones se resuelven en el navegador y usan el reloj compartido del 17/11/2026.

| Historia | Pantalla | Comportamiento demostrable |
| --- | --- | --- |
| HU-M07 | `/dossier/ensayos` | Listado y búsqueda por junta, laboratorio e informe; resultado del ensayo y estado documental separados; acceso al visor y revisión existentes. |
| HU-M07 | `/dossier/ensayos/nuevo` | Calidad registra junta, laboratorio, número de informe, método, fecha, resultado y PDF obligatorio de máximo 15 MB. Incluye progreso de carga, cola sin señal, recuperación del borrador y errores de validación. |
| HU-M08 | `/dossier/avance` | Avance global y por carpeta, filtro de faltantes, requisitos observados, apertura de detalle, acta aceptada, fecha límite y descargas ZIP. |

## Recorrido para presentar

1. Ejecutar `npm ci` y `npm run dev` en la raíz. Entrar con el perfil **Calidad**: `calidad@loard.demo`, contraseña `Demo2026!`. La pantalla de acceso completa las credenciales de ejemplo.
2. Abrir **Dossier de calidad → Ensayos NDT → Registrar ensayo NDT**. Elegir una junta, completar el informe y seleccionar un PDF. La cabecera del archivo debe ser PDF y la fecha no puede superar el reloj de la demostración.
3. Para probar la recuperación, completar campos y volver al listado: al regresar al formulario se recuperan los metadatos. Seleccionar el PDF nuevamente. El borrador se guarda por usuario en el navegador.
4. Alternar **Simular sin señal** y seleccionar un reporte: la carga espera en cola. Recuperar la conexión y esperar su confirmación. Registrar el ensayo.
5. Abrir **Ver reporte y requisito**. El ensayo aparece en la Carpeta 4 con estado **Archivo Cargado**. Validarlo o registrar una observación usando los controles de HU-M06. La validación tiene un plazo para deshacerla; hasta confirmarla, la exportación permanece bloqueada.
6. Consultar **Avance y entrega**. Cambiar de carpeta para localizar faltantes. Solo **Validado** incrementa el avance; cada requisito tiene el mismo peso, independientemente de su carpeta.
7. Calidad puede registrar o editar la referencia y fecha de aceptación del acta. Por defecto, el ejemplo inicial usa el 11/11/2026: vence el 21/11/2026 y restan cuatro días. El día de aceptación es el día cero y el décimo día se incluye completo. Para mostrar vencimiento, usar 06/11/2026; para mostrar «vence hoy», usar 07/11/2026.
8. Descargar **Exportar borrador parcial (.ZIP)**. Abrir el ZIP: contiene seis carpetas, `RESUMEN.txt` con los faltantes y `TRAZABILIDAD.json`. El cierre se habilita cuando hay un acta aceptada y todas las carpetas tienen requisitos con soporte validado. El vencimiento se muestra, pero permite preparar la entrega tardía.
9. Abrir la bitácora como Calidad y seleccionar el requisito NDT. Consultar el tablero como Director o Gerencia: CW-118 usa el mismo dossier y la misma aceptación del acta. CW-204 conserva los ejemplos del módulo de seguimiento.

## Integración y conservación de datos

- `modelo.ts`: guarda en una sola operación el ensayo y su requisito. Aprovecha el requisito NDT inicial vacío para el primer informe; crea uno distinto para cada reporte posterior. Nunca sustituye el informe de otra junta. Rechaza duplicados por laboratorio y número de informe; repetir un mismo envío no lo duplica.
- `DossierContext.tsx`: proveedor compartido de checklist, documentos, NDT y avance. Mantiene compatibilidad con registros locales anteriores sin campos de ensayos o acta. Los datos confirmados alimentan bitácora y tablero; una validación todavía reversible no se registra allí.
- `EnsayosNdt.tsx`: formularios y búsqueda; reutiliza componentes y la cola de carga existente. Los PDF se visualizan con `DetalleItem`, que conserva autor, fecha e historial.
- `entrega.ts`: calcula diez días calendario y prepara el ZIP usando `fflate`, cargado solo al exportar. El ZIP se genera sin servidor.
- `AvanceDossier.tsx`: reúne avance, faltantes, plazo y descarga; bloquea el cierre mientras existan cargas o validaciones sin confirmar.
- `src/lib/seguimiento/dossier.ts`: transforma los requisitos compartidos para los módulos de bitácora y tablero.

Los metadatos e historiales se conservan en `localStorage`. Los PDF originales están disponibles durante la sesión de la página. Tras recargar, los originales dejan de estar disponibles: el visor informa de ello y el ZIP incorpora fichas `.FICHA_DEMO.txt`, sin presentarlas como PDF reales. El resumen enumera esos archivos. Incluso un dossier con todos sus requisitos validados es una **exportación de demostración**, sin radicación contractual.

El resultado **No conforme** del laboratorio no equivale al estado documental **Observado**. Un reporte puede estar correctamente documentado y revelar una junta que requiere tratamiento; validar su soporte no autoriza la soldadura.

## Comprobaciones

Ejecutar `npm test`, `npm run typecheck` y `npm run build` desde la raíz. Las pruebas de `entrega.test.ts` cubren vinculación, revisión, duplicados, permisos, fechas, compatibilidad, fallos de almacenamiento, límites de plazo, bloqueo y contenido de los ZIP.

Verificación del 16/11/2026: 101 pruebas correctas; compilación con comprobación de tipos correcta. Se recorrieron en navegador el borrador recuperado, la carga en cola sin señal, dos reportes independientes, la revisión de Calidad, la persistencia al recargar, la bitácora vinculada, el tablero de Gerencia y las restricciones de registro/edición. Se descargaron y abrieron los ZIP parcial y validado; el cierre al 100% se comprobó con datos temporales en el navegador de prueba, restaurando luego los registros. Se revisó el diseño de las pantallas nuevas a 390 px y en escritorio.
