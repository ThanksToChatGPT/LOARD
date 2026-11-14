/**
 * Página de muestra: enseña cada componente compartido con sus variantes y estados.
 * Los textos son de relleno escritos aquí mismo; no hay datos de ejemplo del negocio.
 */

import { Bell, Eye, Layers, Moon, Plus, Sun } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import {
  AppShell,
  Badge,
  Banner,
  Button,
  Checkbox,
  Chip,
  Combobox,
  ConnectionIndicator,
  DateField,
  Dialog,
  Drawer,
  FileUpload,
  FilterChips,
  FormLayout,
  IconButton,
  KpiCard,
  OfflineQueueBanner,
  PageHeader,
  ProgressBar,
  RadioCardGroup,
  ResponsiveTable,
  SearchField,
  Select,
  Skeleton,
  Spinner,
  StatusBadge,
  TextArea,
  TextField,
  Timeline,
  UploadItem,
  useToast,
  type ConnectionState,
  type OfflineQueueState,
  type TableColumn,
} from '@/components';
import { useTheme } from '@/hooks';
import { cn } from '@/lib/cn';
import { OBSERVACION_MIN_CARACTERES } from '@/lib/constantes';
import {
  ESTADO_LOCAL,
  ESTADOS_CORTE,
  ESTADOS_REQUISITO,
  ESTADOS_SST,
  type EstadoOficial,
} from '@/lib/estados';
import { calcularEstadoSST, textoVencimiento } from '@/lib/semaforo';

const SECCIONES = [
  { id: 'fundamentos', label: 'Fundamentos' },
  { id: 'atomos', label: 'Átomos' },
  { id: 'moleculas', label: 'Moléculas' },
  { id: 'organismos', label: 'Organismos' },
  { id: 'plantillas', label: 'Plantillas' },
];

const COLORES = [
  'primary', 'surface', 'surface-container', 'surface-container-low', 'surface-container-high',
  'outline', 'outline-variant', 'success', 'success-subtle', 'warning', 'warning-subtle',
  'error', 'error-subtle', 'info', 'info-subtle', 'inverse-surface', 'nav-surface', 'nav-active',
];

const TIPOGRAFIA = [
  ['text-display-lg-mobile tablet:text-display-lg', 'display-lg'],
  ['text-headline-lg', 'headline-lg'],
  ['text-headline-md', 'headline-md'],
  ['text-headline-sm', 'headline-sm'],
  ['text-title-lg', 'title-lg'],
  ['text-body-lg', 'body-lg'],
  ['text-body-md', 'body-md'],
  ['text-label-lg', 'label-lg'],
  ['text-body-sm', 'body-sm'],
  ['text-label-sm', 'label-sm'],
];

interface FilaMuestra {
  id: string;
  nombre: string;
  detalle: string;
  cifra: string;
  estado: EstadoOficial;
}

const FILAS: FilaMuestra[] = [
  { id: '1', nombre: 'Registro de muestra A', detalle: 'Texto secundario', cifra: '12', estado: 'Vencido' },
  { id: '2', nombre: 'Registro de muestra B', detalle: 'Texto secundario', cifra: '104', estado: 'Próximo a Vencer (15d)' },
  { id: '3', nombre: 'Registro de muestra C', detalle: 'Texto secundario', cifra: '8', estado: 'Habilitado' },
];

const OPCIONES = [
  { value: 'a', label: 'Opción A', description: 'Descripción de la opción' },
  { value: 'b', label: 'Opción B', description: 'Descripción de la opción' },
  { value: 'c', label: 'Opción C', description: 'Descripción de la opción' },
];

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="grid-page mb-section scroll-mt-24">
      <h2 id={`${id}-titulo`} className="col-span-full text-headline-md">
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Bloque({ titulo, ancho = 'medio', children }: { titulo: string; ancho?: 'medio' | 'completo'; children: ReactNode }) {
  return (
    <div
      className={cn(
        'card col-span-full flex flex-col gap-gutter-md p-gutter-md',
        ancho === 'medio' && 'desktop:col-span-6',
      )}
    >
      <h3 className="text-title-lg">{titulo}</h3>
      {children}
    </div>
  );
}

const Fila = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-start gap-gutter-sm">{children}</div>
);

export function Muestra() {
  const { tema, alternar } = useTheme();
  const toast = useToast();

  const [seccion, setSeccion] = useState('fundamentos');
  const [conexion, setConexion] = useState<ConnectionState>('online');
  const [cola, setCola] = useState<OfflineQueueState | 'ninguna'>('ninguna');

  const [cargando, setCargando] = useState(false);
  const [marcada, setMarcada] = useState(true);
  const [sacudir, setSacudir] = useState(false);
  const [chip, setChip] = useState(false);

  const [texto, setTexto] = useState('');
  const [fecha, setFecha] = useState('');
  const [tipo, setTipo] = useState('');
  const [combo, setCombo] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [radio, setRadio] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<string | null>(null);
  const [kpi, setKpi] = useState(false);

  const [tablaCargando, setTablaCargando] = useState(false);
  const [tablaRecargando, setTablaRecargando] = useState(false);
  const [archivos, setArchivos] = useState<File[]>([]);
  const [bitacora, setBitacora] = useState(0);

  const [confirmar, setConfirmar] = useState(false);
  const [observar, setObservar] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [drawer, setDrawer] = useState(false);

  const columnas: TableColumn<FilaMuestra>[] = [
    {
      key: 'nombre',
      header: 'Nombre',
      primary: true,
      cell: (f) => (
        <>
          {f.nombre}
          <span className="block text-body-sm text-on-surface-muted">{f.detalle}</span>
        </>
      ),
    },
    { key: 'cifra', header: 'Cifra', numeric: true, align: 'end', cell: (f) => f.cifra },
    { key: 'estado', header: 'Estado', cell: (f) => <StatusBadge estado={f.estado} /> },
    {
      key: 'accion',
      header: 'Acciones',
      action: true,
      align: 'end',
      cell: (f) => (
        <Button variant="ghost" onClick={() => setDrawer(true)} aria-label={`Ver detalle de ${f.nombre}`}>
          Ver detalle
        </Button>
      ),
    },
  ];

  const cerrarObservacion = () => {
    setObservar(false);
    setObservacion('');
  };

  return (
    <AppShell
      nav={{
        brand: (
          <span className="flex items-center gap-gutter-sm">
            <Layers aria-hidden="true" className="h-5 w-5" /> Loard · Componentes
          </span>
        ),
        items: SECCIONES.map((s) => ({ ...s, href: `#${s.id}` })),
        activeId: seccion,
        onNavigate: setSeccion,
      }}
      topbar={{
        project: 'Página de muestra',
        connection: <ConnectionIndicator state={conexion} />,
        role: 'Sistema de diseño',
        actions: (
          <>
            <IconButton label="Alertas, 2 pendientes" badge={2}>
              <Bell aria-hidden="true" className="h-5 w-5" />
            </IconButton>
            <IconButton label={tema === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'} onClick={alternar}>
              {tema === 'dark' ? (
                <Sun aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Moon aria-hidden="true" className="h-5 w-5" />
              )}
            </IconButton>
          </>
        ),
      }}
      banner={
        cola !== 'ninguna' && (
          <OfflineQueueBanner
            state={cola}
            pending={3}
            sent={2}
            total={3}
            syncedAt={new Date()}
            onHide={() => setCola('ninguna')}
            action={
              cola === 'rejected' && (
                <Button variant="secondary" onClick={() => setCola('ninguna')}>
                  Revisar registro
                </Button>
              )
            }
          />
        )
      }
    >
      <div className="grid-page mb-section">
        <PageHeader
          className="col-span-full"
          title="Componentes compartidos"
          description="Variantes y estados de cada componente. Revisar en claro y oscuro, y a 360, 600 y 1024 px."
          meta="Fuente de verdad: Hito 2/design.md"
          actions={
            <Button variant="secondary" onClick={alternar}>
              {tema === 'dark' ? 'Ver en claro' : 'Ver en oscuro'}
            </Button>
          }
        />
      </div>

      <Seccion id="fundamentos" titulo="Fundamentos">
        <Bloque titulo="Color (tokens)" ancho="completo">
          <ul className="grid grid-cols-2 gap-gutter-sm tablet:grid-cols-4 desktop:grid-cols-6">
            {COLORES.map((c) => (
              <li key={c} className="flex flex-col gap-gutter-xs">
                <span
                  className="h-12 rounded border border-outline-variant"
                  style={{ backgroundColor: `var(--${c})` }}
                />
                <code className="text-body-sm">{c}</code>
              </li>
            ))}
          </ul>
        </Bloque>
        <Bloque titulo="Tipografía (Inter)">
          <ul className="flex flex-col gap-gutter-sm">
            {TIPOGRAFIA.map(([clase, nombre]) => (
              <li key={nombre} className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
                <span className={clase}>Corte de obra 04</span>
                <code className="text-body-sm text-on-surface-muted">{nombre}</code>
              </li>
            ))}
          </ul>
        </Bloque>
        <Bloque titulo="Retícula 12–8–4">
          <div className="grid grid-cols-4 gap-gutter-md tablet:grid-cols-8 desktop:grid-cols-12 desktop:gap-gutter-lg">
            {Array.from({ length: 12 }, (_, i) => (
              <span
                key={i}
                className={cn(
                  'h-12 rounded-sm bg-surface-container-high',
                  i >= 4 && 'hidden tablet:block',
                  i >= 8 && 'tablet:hidden desktop:block',
                )}
              />
            ))}
          </div>
          <p className="text-body-sm text-on-surface-muted">
            4 columnas en móvil, 8 desde 600 px y 12 desde 1024 px. Clase <code>grid-page</code>.
          </p>
        </Bloque>
      </Seccion>

      <Seccion id="atomos" titulo="Átomos">
        <Bloque titulo="Button">
          <Fila>
            <Button icon={<Plus aria-hidden="true" className="h-4 w-4" />}>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="warning">Advertencia</Button>
            <Button variant="ghost">Fantasma</Button>
          </Fila>
          <Fila>
            <Button
              loading={cargando}
              loadingText="Guardando…"
              onClick={() => {
                setCargando(true);
                window.setTimeout(() => setCargando(false), 2000);
              }}
            >
              Guardar (probar carga)
            </Button>
            <Button size="field" variant="secondary">
              Tamaño de campo (56 px en móvil)
            </Button>
          </Fila>
          <Button blocked blockedReason="Requiere 100 % de validación. Faltan 4 requisitos.">
            Bloqueado con motivo
          </Button>
        </Bloque>

        <Bloque titulo="StatusBadge y Badge">
          {[ESTADOS_SST, ESTADOS_CORTE, ESTADOS_REQUISITO, [ESTADO_LOCAL]].map((grupo, i) => (
            <Fila key={i}>
              {grupo.map((e) => (
                <StatusBadge key={e} estado={e} />
              ))}
            </Fila>
          ))}
          <Fila>
            <StatusBadge estado="Vencido">Bloqueado: curso vencido hace 4 días</StatusBadge>
            <Badge tone="info">3 de 5 validados</Badge>
          </Fila>
        </Bloque>

        <Bloque titulo="Checkbox y Chip">
          <Checkbox label="Casilla normal" checked={marcada} onChange={(e) => setMarcada(e.target.checked)} />
          <div
            className={cn('rounded bg-error-subtle px-gutter-sm', sacudir && 'animate-error-shake')}
            onAnimationEnd={() => setSacudir(false)}
          >
            <Checkbox
              label="Casilla bloqueada"
              description="Al intentar marcarla, la fila se sacude y no cambia."
              checked={false}
              onChange={() => {}}
              blocked
              onBlockedAttempt={() => setSacudir(true)}
            />
          </div>
          <Fila>
            <Chip selected={chip} onClick={() => setChip(!chip)}>
              Chip seleccionable
            </Chip>
            <Chip>Soporte ilegible</Chip>
          </Fila>
        </Bloque>

        <Bloque titulo="Progreso y carga">
          <ProgressBar label="Avance físico" value={68} showLabel />
          <ProgressBar label="Tiempo transcurrido" value={72} tone="warning" showLabel />
          <ProgressBar label="Carga indeterminada" />
          <Fila>
            <Spinner />
            <span className="text-body-sm text-on-surface-muted">Spinner de 16 px, solo dentro de botones.</span>
          </Fila>
          <div className="flex flex-col gap-gutter-sm">
            <Skeleton className="w-2/3" />
            <Skeleton className="w-1/2" />
          </div>
          <Fila>
            <IconButton label="Ver soporte">
              <Eye aria-hidden="true" className="h-5 w-5" />
            </IconButton>
            <span className="self-center text-body-sm text-on-surface-muted">IconButton (48 × 48 px)</span>
          </Fila>
        </Bloque>
      </Seccion>

      <Seccion id="moleculas" titulo="Moléculas">
        <Bloque titulo="Campos de texto">
          <TextField
            label="Campo de texto"
            hint="Ayuda permanente bajo el campo."
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
          />
          <TextField
            label="Campo con error"
            defaultValue="Valor inválido"
            error="Qué pasó y cómo corregirlo, junto al campo."
          />
          <DateField
            label="Fecha de vencimiento"
            hint="Al elegirla se calcula el semáforo SST."
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
          {fecha && (
            <Fila>
              <StatusBadge estado={calcularEstadoSST(fecha)} />
              <span className="self-center text-body-md tabular-nums">{textoVencimiento(fecha)}</span>
            </Fila>
          )}
        </Bloque>

        <Bloque titulo="Selección">
          <Select
            label="Select"
            placeholder="Selecciona una opción"
            options={OPCIONES}
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          />
          <Combobox label="Combobox con búsqueda" options={OPCIONES} value={combo} onChange={setCombo} />
          <SearchField label="Buscar" value={busqueda} onChange={setBusqueda} />
          <RadioCardGroup
            legend="RadioCardGroup"
            options={[
              { value: 'si', label: 'Habilitado' },
              { value: 'no', label: 'No Habilitado' },
            ]}
            value={radio}
            onChange={setRadio}
          />
          <FilterChips
            label="Filtrar por estado"
            options={[
              { value: 'x', label: 'Vencidos', count: 2 },
              { value: 'y', label: 'Habilitados', count: 5 },
            ]}
            value={filtro}
            onChange={setFiltro}
          />
        </Bloque>

        <div className="col-span-full grid grid-cols-4 gap-gutter-md tablet:grid-cols-8 desktop:grid-cols-12 desktop:gap-gutter-lg">
          <KpiCard title="KpiCard" value="68 %" description="Con barras comparativas">
            <ProgressBar label="Avance físico" value={68} showLabel />
            <ProgressBar label="Tiempo transcurrido" value={72} tone="warning" showLabel />
          </KpiCard>
          <KpiCard title="KpiCard con estado" value="2" tone="error" description="Cifra en color de estado" />
          <KpiCard
            title="KpiCard como filtro"
            value="5"
            tone="success"
            description={kpi ? 'Filtro activo' : 'Oprime para filtrar'}
            onClick={() => setKpi(!kpi)}
            selected={kpi}
          />
        </div>

        <Bloque titulo="Banner">
          <Banner tone="info" actions={<Button variant="secondary">Continuar editando</Button>}>
            Aviso informativo con una acción.
          </Banner>
          <Banner tone="warning" title="Título del aviso">
            Aviso preventivo.
          </Banner>
          <Banner tone="error">Aviso de bloqueo o error.</Banner>
          <Banner tone="success">Aviso de confirmación.</Banner>
        </Bloque>

        <Bloque titulo="ConnectionIndicator y UploadItem">
          <Fila>
            <ConnectionIndicator state="online" />
            <ConnectionIndicator state="offline" />
            <ConnectionIndicator state="syncing" text="Enviando 2 de 3" />
            <ConnectionIndicator state="error" text="1 envío falló" />
          </Fila>
          <ul className="flex flex-col gap-gutter-sm">
            <UploadItem name="archivo-en-carga.pdf" sizeBytes={2_400_000} status="uploading" progress={42} onCancel={() => {}} />
            <UploadItem name="archivo-confirmando.pdf" sizeBytes={1_100_000} status="confirming" />
            <UploadItem name="archivo-cargado.pdf" sizeBytes={880_000} status="done" onOpen={() => setDrawer(true)} />
            <UploadItem name="archivo-en-espera.jpg" sizeBytes={3_300_000} status="queued" onCancel={() => {}} />
            <UploadItem name="archivo-con-error.png" sizeBytes={5_000_000} status="error" onRetry={() => {}} onCancel={() => {}} />
          </ul>
        </Bloque>
      </Seccion>

      <Seccion id="organismos" titulo="Organismos">
        <Bloque titulo="ResponsiveTable" ancho="completo">
          <Fila>
            <Chip selected={tablaCargando} onClick={() => setTablaCargando(!tablaCargando)}>
              Primera carga
            </Chip>
            <Chip selected={tablaRecargando} onClick={() => setTablaRecargando(!tablaRecargando)}>
              Recarga en segundo plano
            </Chip>
          </Fila>
          <ResponsiveTable
            caption="Tabla de muestra"
            columns={columnas}
            rows={FILAS}
            rowKey={(f) => f.id}
            loading={tablaCargando}
            refetching={tablaRecargando}
            rowTone={(f) => (f.estado === 'Vencido' ? 'error' : undefined)}
          />
        </Bloque>

        <Bloque titulo="Topbar y franja de conexión">
          <Select
            label="Indicador de la topbar"
            options={[
              { value: 'online', label: 'En línea' },
              { value: 'offline', label: 'Sin señal' },
              { value: 'syncing', label: 'Sincronizando' },
              { value: 'error', label: 'Error de envío' },
            ]}
            value={conexion}
            onChange={(e) => setConexion(e.target.value as ConnectionState)}
          />
          <Select
            label="Franja OfflineQueueBanner"
            options={[
              { value: 'ninguna', label: 'Oculta' },
              { value: 'offline', label: 'Sin conexión' },
              { value: 'syncing', label: 'Sincronizando' },
              { value: 'synced', label: 'Todo enviado (se oculta a los 5 s)' },
              { value: 'rejected', label: 'Envío rechazado' },
            ]}
            value={cola}
            onChange={(e) => setCola(e.target.value as OfflineQueueState | 'ninguna')}
          />
        </Bloque>

        <Bloque titulo="Toast, Dialog y Drawer">
          <Fila>
            <Button variant="secondary" onClick={() => toast.show({ message: 'Aviso informativo.' })}>
              Mostrar aviso
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                toast.showUndo({
                  message: 'Requisito validado.',
                  onCommit: () => setBitacora((n) => n + 1),
                })
              }
            >
              Validar con «Deshacer»
            </Button>
          </Fila>
          <p className="text-body-sm tabular-nums text-on-surface-muted">
            Registros confirmados tras los 5 segundos: {bitacora}
          </p>
          <Fila>
            <Button variant="secondary" onClick={() => setConfirmar(true)}>
              Abrir confirmación
            </Button>
            <Button variant="secondary" onClick={() => setObservar(true)}>
              Abrir observación
            </Button>
            <Button variant="secondary" onClick={() => setDrawer(true)}>
              Abrir drawer
            </Button>
          </Fila>
        </Bloque>

        <Bloque titulo="FileUpload">
          <FileUpload label="Soportes" onFiles={(nuevos) => setArchivos((a) => [...a, ...nuevos])}>
            {archivos.map((a, i) => (
              <UploadItem key={`${a.name}-${i}`} name={a.name} sizeBytes={a.size} status="done" />
            ))}
          </FileUpload>
        </Bloque>

        <Bloque titulo="Timeline (bitácora)">
          <Timeline
            label="Bitácora de muestra"
            entries={[
              {
                id: '2',
                fecha: new Date('2026-11-13T19:32:10Z'),
                usuario: 'Nombre Apellido',
                rol: 'Rol',
                estadoAnterior: 'En Revisión (Enviado)',
                estadoNuevo: 'Devuelto con Observaciones',
                motivo: 'Texto de la observación.',
              },
              {
                id: '1',
                fecha: new Date('2026-11-12T14:05:44Z'),
                usuario: 'Nombre Apellido',
                rol: 'Rol',
                estadoAnterior: 'Borrador',
                estadoNuevo: 'En Revisión (Enviado)',
              },
            ]}
          />
        </Bloque>
      </Seccion>

      <section id="plantillas" aria-labelledby="plantillas-titulo" className="scroll-mt-24">
        <div className="grid-page mb-gutter-md">
          <h2 id="plantillas-titulo" className="col-span-full text-headline-md">
            Plantillas
          </h2>
          <p className="col-span-full text-body-md text-on-surface-muted">
            Esta página usa <code>AppShell</code> y <code>PageHeader</code>. Abajo, <code>FormLayout</code>: 8 de
            12 columnas centradas en escritorio y pie fijo de acciones.
          </p>
        </div>
        <FormLayout
          header={<h3 className="text-headline-sm">FormLayout</h3>}
          status="Borrador guardado localmente a las 14:32"
          footer={
            <>
              <Button variant="secondary" size="field">
                Cancelar
              </Button>
              <Button type="submit" size="field">
                Guardar
              </Button>
            </>
          }
        >
          <TextField label="Primer campo" size="field" />
          <TextField label="Segundo campo" size="field" />
        </FormLayout>
      </section>

      <Dialog
        open={confirmar}
        onClose={() => setConfirmar(false)}
        title="¿Confirmar la acción?"
        description="Esta acción quedará registrada en la bitácora de auditoría."
        footer={
          <>
            <Button variant="secondary" data-autofocus onClick={() => setConfirmar(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setConfirmar(false)}>Confirmar</Button>
          </>
        }
      />

      <Dialog
        open={observar}
        onClose={cerrarObservacion}
        title="Devolver con observaciones"
        dirty={observacion.trim() !== ''}
        discardQuestion="¿Descartar la observación?"
        keepLabel="Seguir escribiendo"
        footer={
          <>
            <Button variant="secondary" onClick={cerrarObservacion}>
              Cancelar
            </Button>
            <Button
              variant="warning"
              blocked={observacion.trim().length < OBSERVACION_MIN_CARACTERES}
              onClick={cerrarObservacion}
            >
              Confirmar Devolución
            </Button>
          </>
        }
      >
        <TextArea
          label="Observación"
          required
          value={observacion}
          onChange={(e) => setObservacion(e.target.value)}
          minCharacters={OBSERVACION_MIN_CARACTERES}
        />
        <Fila>
          {['Soporte PDF ilegible', 'Falta firma residente'].map((causa) => (
            <Chip key={causa} onClick={() => setObservacion((o) => (o ? `${o} ${causa}.` : `${causa}.`))}>
              {causa}
            </Chip>
          ))}
        </Fila>
      </Dialog>

      <Drawer
        open={drawer}
        onClose={() => setDrawer(false)}
        title="Drawer"
        meta="Metadatos: autor del cargue · fecha y hora"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDrawer(false)}>
              Observar Documento
            </Button>
            <Button onClick={() => setDrawer(false)}>Validar Documento</Button>
          </>
        }
      >
        <p className="text-body-md">
          Panel lateral desde 1024 px; pantalla completa por debajo. <kbd>Esc</kbd> lo cierra y el foco vuelve
          al botón que lo abrió.
        </p>
      </Drawer>
    </AppShell>
  );
}
