# LOARD · Prototipo de alta fidelidad

Entrega navegable de ejemplo para el Hito 2 de Loard Construcciones S.A.S.

## Ejecutar

Requiere Node.js 22.12 o superior. Ejecuta estos comandos desde la raíz del repositorio.

```powershell
npm ci
npm run dev
```

Abre http://127.0.0.1:5173. Los comandos de la raíz ejecutan el prototipo ubicado en `Hito 2/Modulo-I-Prototipo/prototipo`.

## Recorrido de la demostración

1. En «Perfil de ejemplo», elige un rol.
2. Ingresa con el correo mostrado y la contraseña `Demo2026!`.
3. El perfil Residente abre «Cortes de obra». Puede registrar actividades, seleccionar personal habilitado, indicar horas e insumos y guardar un corte de ejemplo.
4. Abre el detalle, edita un corte propio y escribe un motivo. El historial conserva autor, fecha, motivo y valores de las versiones anteriores. Editar el corte visado de ejemplo lo devuelve a revisión.
5. El perfil SST abre «Personal SST» y conserva los recorridos del compañero para cursos, aptitud y bloqueo de personal.
6. Director, Calidad y Gerencia consultan los módulos habilitados para sus perfiles. «Cerrar sesión de ejemplo» permite cambiar de rol.

Todas las cuentas usan la misma contraseña de demostración.

| Perfil | Correo de ejemplo |
| --- | --- |
| Residente | residente@loard.demo |
| Director | director@loard.demo |
| Calidad | calidad@loard.demo |
| SST | sst@loard.demo |
| Gerencia | gerencia@loard.demo |

Las cantidades, personas y credenciales son ejemplos para presentar la interacción. Los perfiles y accesos se simulan en el navegador. Los cortes y sus borradores se conservan en `localStorage`, y la sesión de ejemplo en `sessionStorage`. SST conserva el reloj fijo al 17/11/2026 y sus registros en memoria durante la sesión. Los cambios SST se reflejan en el selector de personal mientras se recorre la demostración.

## Verificación

```powershell
npm test
npm run typecheck
npm run build
```

La compilación se genera en `Hito 2/Modulo-I-Prototipo/prototipo/dist`. Para previsualizarla:

```powershell
npm run preview --workspace loard-prototipo -- --host 127.0.0.1 --port 5175
```

## Organización

- `src/features/acceso` implementa HU-M01 con perfiles, sesión y validaciones de ejemplo.
- `src/features/cortes` implementa HU-M02, su historial local y el selector SST compartido.
- `src/features/sst` conserva las pantallas de HU-M09.
- `src/components` reúne los componentes reutilizados de formularios, tablas, avisos y navegación.
- `src/lib/sst` comparte trabajadores y reglas de habilitación entre SST y cortes.

Las rutas anteriores son relativas a `Hito 2/Modulo-I-Prototipo/prototipo`.

## Trabajo funcional apartado

La aplicación funcional anterior está conservada en la rama `codex/backend-en-pausa`. Esta rama principal contiene el prototipo de la entrega y sus documentos. Los comandos de ejecución y compilación están dirigidos al prototipo compartido del equipo.

## Documentos del equipo

- [Sistema de diseño](Hito%202/design.md)
- [Módulo I · Prototipo](Hito%202/Modulo-I-Prototipo)
- [Módulo II · Componentización](Hito%202/Modulo-II-Frontend)
- [Módulo III · Usabilidad y accesibilidad](Hito%202/Modulo-III-QC)
- [Módulo IV · Modelo y mapa de API](Hito%202/Modulo-IV-Persistencia)
