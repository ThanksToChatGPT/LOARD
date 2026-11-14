# Loard Construcciones · HU-M01 y HU-M02

Base del MVP con autenticación por correo y contraseña, permisos por rol/proyecto y registro de cortes de obra. Incluye listado, búsqueda, detalle, edición con motivo obligatorio, historial de versiones y recuperación de borradores locales.

## Organización

```text
backend/
  config/                 Configuración y rutas de Django
  accounts/               Usuario por correo, roles y autenticación JWT
  projects/               Proyectos, miembros y catálogos mínimos
  cuts/                   Modelos, permisos, validaciones y servicios de cortes
frontend/
  src/
    app/                  Rutas protegidas y estructura de navegación
    components/           Controles, estados de carga y etiquetas compartidos
    features/auth/        Sesión y pantalla de acceso
    features/cuts/        Listado, formulario reutilizable, detalle e historial
    lib/                  Cliente HTTP, tipos y formatos
```

El backend usa Django 5.2, DRF, Simple JWT y migraciones versionadas. El frontend usa React, TypeScript, Vite, Tailwind e Inter local. TanStack Query centraliza las consultas y la invalidación de caché.

## Ejecución local en Windows

Requisitos: Python 3.12 o superior y Node.js 22.12 o superior.

Desde la raíz, prepara el backend.

```powershell
py -m venv .venv
.venv/Scripts/python.exe -m pip install -r backend/requirements.txt
.venv/Scripts/python.exe backend/manage.py migrate
.venv/Scripts/python.exe backend/manage.py createsuperuser
.venv/Scripts/python.exe backend/manage.py runserver 127.0.0.1:8000
```

En otra terminal, prepara el frontend.

```powershell
cd frontend
npm ci
npm run dev
```

Abre [la aplicación](http://127.0.0.1:5173) y [la administración](http://127.0.0.1:8000/admin/). Vite redirige `/api`, `/admin` y `/static` hacia Django durante el desarrollo.

La configuración lee variables del entorno del proceso. `backend/.env.example` enumera las variables disponibles. Para usar PostgreSQL, define `DATABASE_URL` antes de ejecutar las migraciones. Sin esa variable, el desarrollo local usa SQLite. Para un despliegue, configura un secreto propio, hosts permitidos, `DJANGO_DEBUG=0`, HTTPS y un proxy que sirva el frontend y dirija `/api` y `/admin` al backend. La base incluye configuración de conexión a PostgreSQL. Las verificaciones locales se realizaron con SQLite.

### Datos ficticios para explorar el flujo

El comando crea cuentas, un proyecto, catálogos y tres cortes de ejemplo. Solo funciona en modo de desarrollo. Define una contraseña local propia, de al menos 12 caracteres.

```powershell
$env:LOARD_DEMO_PASSWORD = Read-Host 'Contraseña para las cuentas nuevas de demostración'
.venv/Scripts/python.exe backend/manage.py seed_demo
Remove-Item Env:LOARD_DEMO_PASSWORD
```

Cuentas creadas: `resident@loard.test`, `director@loard.test`, `quality@loard.test`, `sst@loard.test`, `management@loard.test` y `admin@loard.test`. La última accede a Django Admin. Volver a ejecutar el comando conserva las contraseñas y los cortes ya creados.

Para cargar datos propios desde la administración, crea usuarios y proyectos, asigna sus miembros y registra frentes, actividades con unidad/cantidad prevista, trabajadores e insumos. Activa los proyectos que deban estar disponibles. Los usuarios administradores se crean con `createsuperuser`.

## Permisos iniciales

| Rol | Consultar cortes del proyecto asignado | Crear cortes | Editar cortes |
| --- | --- | --- | --- |
| Residente | Sí | Sí | Solo los propios |
| Director | Sí | No | No |
| SIG / Calidad | Sí | No | No |
| Gerencia | Sí | No | No |
| SST | No | No | No |

El administrador consulta todos los proyectos activos y gestiona usuarios/catálogos. Los cortes y las versiones son de solo lectura en Django Admin. El backend comprueba los permisos en cada solicitud con el usuario actual de la base de datos.

La sesión usa un JWT de acceso de 10 minutos y uno de renovación de 8 horas, con rotación y revocación del token de renovación al salir. El navegador guarda los tokens en `sessionStorage`, y la sesión se recupera al recargar la misma pestaña. El token de acceso emitido expira por su vigencia. Las renovaciones requieren una cuenta activa. El ingreso tiene un límite inicial de 10 intentos por minuto e IP, usando la caché de Django.

## Reglas del corte

- Cada corte pertenece a un proyecto, un frente y un periodo con fechas de inicio y fin.
- El residente registra cantidades del periodo por actividad, horas del periodo por trabajador e insumos por cantidad y unidad. Se requiere una actividad y un trabajador. Los insumos y las observaciones son opcionales.
- Las cantidades y horas deben ser positivas. Las actividades, trabajadores e insumos se pueden incluir una vez por corte y deben pertenecer al proyecto. Las horas por trabajador no pueden superar las horas calendario disponibles en el periodo.
- El avance de cada actividad es su cantidad acumulada hasta el fin del periodo dividida entre la cantidad prevista. Cada versión conserva el acumulado calculado al guardarla. Los valores reales superiores a lo previsto se conservan y pueden dar porcentajes superiores al 100 %. Las unidades heterogéneas se presentan por actividad.
- Crear un corte lo deja en `En Revisión (Enviado)`. El motivo de edición exige al menos 10 caracteres. Editar crea otra versión con autor, rol, fecha, hora y una copia completa de los valores. Una versión visada se conserva y la corrección vuelve a revisión.
- El guardado es transaccional. La edición exige la versión que se leyó y responde `409` si cambió. Una clave UUID por solicitud de creación evita duplicar un corte al reintentar la misma solicitud.
- El borrador se guarda después de 500 ms de inactividad y al cerrar/recargar la página. Está separado por usuario, proyecto y corte en `localStorage`. Se elimina al confirmar el guardado en el servidor. Los borradores de versiones anteriores permiten consultar su contenido antes de descartarlos.

## API e integración con el equipo

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/auth/login/` | Correo y contraseña → tokens |
| POST | `/api/auth/refresh/` | Rotar token de renovación |
| POST | `/api/auth/logout/` | Revocar token de renovación |
| GET | `/api/auth/me/` | Usuario y rol actuales |
| GET | `/api/projects/` | Proyectos activos autorizados |
| GET | `/api/projects/{id}/catalogs/` | Frentes, actividades, trabajadores e insumos |
| GET / POST | `/api/cuts/` | Listar o crear cortes |
| GET / PUT | `/api/cuts/{id}/` | Consultar o guardar otra versión completa |
| GET | `/api/cuts/{id}/history/` | Consultar versiones de solo lectura |

`GET /api/cuts/?project={id}` filtra por proyecto. Las respuestas de listado son arreglos JSON. Una solicitud de creación tiene esta forma.

```json
{
  "request_id": "4cf025d6-8c91-4fe2-9274-197aff9f4bbc",
  "project": 1,
  "front": 1,
  "period_start": "2026-11-01",
  "period_end": "2026-11-07",
  "activities": [{ "activity": 1, "quantity": "20.500" }],
  "labor": [{ "worker": 1, "hours": "40.00" }],
  "supplies": [{ "supply": 1, "quantity": "2.500" }],
  "notes": "Avance del periodo"
}
```

Para editar, envía el mismo documento completo por `PUT`, conserva `request_id` y añade `version` y `reason`. Las respuestas incluyen `data`, con los valores conservados en la versión, y `can_edit` para habilitar la acción en la interfaz.

Los compañeros pueden integrar las historias restantes como apps de Django y módulos en `frontend/src/features`. HU-M03 debe relacionar sus soportes con el corte y la versión correspondiente. HU-M10 debe conectar su validación de habilitación con el guardado de personal en `cuts/services.py`. `Worker` es el catálogo básico para HU-M02. Los campos y decisiones de SST corresponden al módulo del compañero.

Para HU-M04, `cuts.services.transition_cut` recibe `cut`, `user`, `status`, `reason` y `expected_version`. Comprueba Director/proyecto, registra el cambio y crea una versión conservando los valores. La entrega de HU-M04 puede exponer ese servicio desde su endpoint y construir su interfaz de visado. Todos los cambios de estado deben pasar por ese servicio para conservar el historial. El historial de cortes está disponible para su integración con HU-M11.

## Verificación

```powershell
.venv/Scripts/python.exe backend/manage.py test cuts
.venv/Scripts/python.exe backend/manage.py makemigrations --check --dry-run
cd frontend
npm run build
```

Las pruebas cubren autenticación, renovación/revocación, acceso por rol y proyecto, validaciones de recursos, reintentos, versiones concurrentes, conservación de la versión aprobada y acumulados por periodo.
