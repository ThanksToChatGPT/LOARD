import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import {
  Banner,
  Button,
  DateField,
  FileUpload,
  FormLayout,
  PageHeader,
  RadioCardGroup,
  Select,
  TextField,
  UploadItem,
  useToast,
  type UploadStatus,
} from '@/components';
import { formatoFecha, numeroDeDia } from '@/lib/formato';
import { VistaPreviaSemaforo, Volver } from './componentes';
import { evaluar } from './evaluacion';
import { HOY_SST, ahora } from './fechas';
import { useSst, useTrabajador } from './SstContext';
import { TIPOS_CURSO, type Curso, type TipoCurso } from './tipos';

interface Subida {
  archivo: File;
  url: string;
  estado: UploadStatus;
  progreso: number;
}

type Errores = Partial<Record<'tipo' | 'entidad' | 'expedicion' | 'vencimiento' | 'certificado', string>>;

const esTipo = (v: string | null): v is TipoCurso => v != null && (TIPOS_CURSO as readonly string[]).includes(v);

export function RegistrarCurso() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const datos = useTrabajador(id);
  const { registrarCurso, enLinea } = useSst();

  const anterior: Curso | undefined = datos?.cursos.find((c) => c.id === params.get('reemplaza'));
  const tipoInicial = anterior?.tipo ?? (esTipo(params.get('tipo')) ? (params.get('tipo') as TipoCurso) : '');

  const [tipo, setTipo] = useState<TipoCurso | ''>(tipoInicial);
  const [motivo, setMotivo] = useState<'renovacion' | 'correccion'>('renovacion');
  const [entidad, setEntidad] = useState(anterior?.entidad ?? '');
  const [expedicion, setExpedicion] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [subida, setSubida] = useState<Subida | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [guardando, setGuardando] = useState(false);

  // Carga simulada del certificado: avanza con señal, espera sin ella.
  useEffect(() => {
    if (!subida) return;
    if (!enLinea && subida.estado === 'uploading') {
      setSubida((s) => s && { ...s, estado: 'queued' });
      return;
    }
    if (enLinea && subida.estado === 'queued') {
      setSubida((s) => s && { ...s, estado: 'uploading' });
      return;
    }
    if (subida.estado === 'uploading') {
      const t = window.setTimeout(() => {
        setSubida((s) => {
          if (!s || s.estado !== 'uploading') return s;
          const progreso = Math.min(100, s.progreso + 9 + Math.random() * 14);
          return { ...s, progreso, estado: progreso >= 100 ? 'confirming' : 'uploading' };
        });
      }, 180);
      return () => window.clearTimeout(t);
    }
    if (subida.estado === 'confirming') {
      const t = window.setTimeout(() => setSubida((s) => s && { ...s, estado: 'done' }), 700);
      return () => window.clearTimeout(t);
    }
  }, [subida, enLinea]);

  const impacto = useMemo(() => {
    if (!datos || !tipo || !vencimiento) return undefined;
    const t = datos.trabajador;
    const hipotetico: Curso = {
      id: 'vista-previa',
      trabajadorId: t.id,
      tipo,
      entidad,
      expedicion,
      vencimiento,
      certificado: { nombre: '', bytes: 0 },
      registradoPor: '',
      registradoEn: ahora(),
    };
    const despues = evaluar(t, [...datos.cursos, hipotetico], datos.aptitudes, HOY_SST);
    return { nombre: t.nombre, antes: datos.evaluacion.estado, despues: despues.estado, motivo: despues.motivo };
  }, [datos, tipo, entidad, expedicion, vencimiento]);

  if (!datos) {
    return (
      <div className="grid-page">
        <div className="col-span-full flex flex-col gap-gutter-md">
          <Volver to="/sst">Personal SST</Volver>
          <Banner tone="warning" title="No encontramos este trabajador">
            Vuelve a la lista de personal y ábrelo desde allí.
          </Banner>
        </div>
      </div>
    );
  }

  const t = datos.trabajador;
  const subiendo = subida != null && subida.estado !== 'done';

  const validar = (): Errores => {
    const e: Errores = {};
    if (!tipo) e.tipo = 'Selecciona el tipo de curso.';
    if (!entidad.trim()) e.entidad = 'Escribe la entidad que expidió el certificado.';
    if (!expedicion) e.expedicion = 'Elige la fecha de expedición que aparece en el certificado.';
    else if (numeroDeDia(expedicion) > numeroDeDia(HOY_SST))
      e.expedicion = `La expedición no puede ser posterior a hoy (${formatoFecha(HOY_SST)}).`;
    if (!vencimiento) e.vencimiento = 'Elige la fecha de vencimiento que aparece en el certificado.';
    else if (expedicion && numeroDeDia(vencimiento) <= numeroDeDia(expedicion))
      e.vencimiento = 'El vencimiento debe ser posterior a la expedición. Revisa las dos fechas.';
    if (!subida) e.certificado = 'Adjunta el certificado en PDF, JPG o PNG.';
    return e;
  };

  const guardar = () => {
    const e = validar();
    setErrores(e);
    const primero = (['tipo', 'entidad', 'expedicion', 'vencimiento'] as const).find((k) => e[k]);
    if (primero) {
      document.getElementById(`curso-${primero}`)?.focus();
      return;
    }
    if (e.certificado) return;

    setGuardando(true);
    window.setTimeout(() => {
      const curso = registrarCurso({
        trabajadorId: t.id,
        tipo: tipo as TipoCurso,
        entidad: entidad.trim(),
        expedicion,
        vencimiento,
        certificado: { nombre: subida!.archivo.name, bytes: subida!.archivo.size, url: subida!.url, tipoMime: subida!.archivo.type },
        reemplazaA: anterior && motivo === 'correccion' ? anterior.id : undefined,
      });
      toast.show({ message: `Curso «${curso.tipo}» registrado para ${t.nombre}.` });
      navigate(`/sst/${t.id}`);
    }, 900);
  };

  const motivoBloqueo = !enLinea
    ? 'Necesitas conexión para guardar el curso. Lo que llenaste se conserva mientras sigas en esta pantalla.'
    : subiendo
      ? 'Espera a que termine la carga del certificado.'
      : undefined;

  return (
    <FormLayout
        onSubmit={guardar}
        header={
          <div className="flex flex-col gap-gutter-sm">
            <Volver to={`/sst/${t.id}`}>{t.nombre}</Volver>
            <PageHeader
              title={anterior ? `Renovar o corregir · ${anterior.tipo}` : 'Registrar curso normativo'}
              description={`${t.nombre} · ${t.cargo}`}
            />
          </div>
        }
        footer={
          <>
            <Button variant="secondary" size="field" onClick={() => navigate(`/sst/${t.id}`)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              size="field"
              icon={<Save aria-hidden="true" className="h-4 w-4" />}
              loading={guardando}
              loadingText="Guardando curso…"
              blocked={motivoBloqueo != null}
              blockedReason={motivoBloqueo}
            >
              Guardar curso
            </Button>
          </>
        }
      >
        {anterior ? (
          <Banner tone="info" title="El registro actual no se modifica">
            Se creará un registro nuevo de {anterior.tipo}. El que vence el {formatoFecha(anterior.vencimiento)} queda en el
            historial como reemplazado.
          </Banner>
        ) : (
          <Banner tone="info">Después de guardar, el curso no se puede editar ni borrar. Si algo queda mal, se corrige registrándolo de nuevo.</Banner>
        )}

        {anterior && (
          <RadioCardGroup
            legend="¿Por qué registras de nuevo este curso?"
            value={motivo}
            onChange={(v) => setMotivo(v as typeof motivo)}
            options={[
              { value: 'renovacion', label: 'Renovación', description: 'El trabajador tomó el curso otra vez y tiene un certificado nuevo.' },
              { value: 'correccion', label: 'Corrección', description: 'El registro anterior tiene un dato mal digitado.' },
            ]}
          />
        )}

        <div className="grid grid-cols-1 gap-gutter-md tablet:grid-cols-2">
          <Select
            id="curso-tipo"
            className="tablet:col-span-2"
            size="field"
            label="Tipo de curso"
            required
            placeholder="Selecciona un tipo de curso"
            options={TIPOS_CURSO.map((x) => ({
              value: x,
              label: t.cursosRequeridos.includes(x) ? `${x} (obligatorio para el cargo)` : x,
            }))}
            value={tipo}
            disabled={anterior != null}
            hint={anterior ? 'Se mantiene el tipo del curso que se renueva o corrige.' : undefined}
            error={errores.tipo}
            onChange={(ev) => setTipo(ev.target.value as TipoCurso | '')}
          />
          <TextField
            id="curso-entidad"
            className="tablet:col-span-2"
            size="field"
            label="Entidad que lo expidió"
            required
            autoComplete="off"
            value={entidad}
            error={errores.entidad}
            onChange={(ev) => setEntidad(ev.target.value)}
          />
          <DateField
            id="curso-expedicion"
            size="field"
            label="Fecha de expedición"
            required
            max={HOY_SST}
            value={expedicion}
            error={errores.expedicion}
            onChange={(ev) => setExpedicion(ev.target.value)}
          />
          <DateField
            id="curso-vencimiento"
            size="field"
            label="Fecha de vencimiento"
            required
            min={expedicion || undefined}
            value={vencimiento}
            error={errores.vencimiento}
            onChange={(ev) => setVencimiento(ev.target.value)}
          />
        </div>

        <VistaPreviaSemaforo sujeto="el curso" vencimiento={vencimiento} impacto={impacto} />

        <div className="flex flex-col gap-gutter-xs">
          <FileUpload
            label="Certificado del curso *"
            multiple={false}
            size="field"
            onFiles={([archivo]) => {
              if (subida) URL.revokeObjectURL(subida.url);
              setSubida({ archivo, url: URL.createObjectURL(archivo), estado: enLinea ? 'uploading' : 'queued', progreso: 0 });
              setErrores((e) => ({ ...e, certificado: undefined }));
            }}
          >
            {subida && (
              <UploadItem
                name={subida.archivo.name}
                sizeBytes={subida.archivo.size}
                status={subida.estado}
                progress={subida.progreso}
                size="field"
                onCancel={() => {
                  URL.revokeObjectURL(subida.url);
                  setSubida(null);
                }}
              />
            )}
          </FileUpload>
          {errores.certificado && (
            <p role="alert" className="text-body-sm text-error">
              {errores.certificado}
            </p>
          )}
        </div>
    </FormLayout>
  );
}
