import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router';
import { Banner, Button, Select, Skeleton } from '@/components';
import { LayoutPrototipo } from '@/LayoutPrototipo';
import { useSst } from '@/lib/sst/SstContext';
import { PROYECTOS } from './datos';

export function SeguimientoLayout() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const proyecto = PROYECTOS.find(p => p.id === params.get('proyecto')) ?? PROYECTOS[0];
  return <LayoutPrototipo usuario={{ nombre: 'Sesión de demostración', rol: pathname.startsWith('/dashboard') ? 'Director / Gerencia' : 'SIG / Calidad' }}
    proyecto={`${proyecto.id} · ${proyecto.nombre}`}
    mensajeSinSenal="Sin conexión. Los datos de demostración siguen visibles; no se consulta información nueva." />;
}
export function useConsulta() {
  const [params, setParams] = useSearchParams();
  const proyectoId = params.get('proyecto') ?? PROYECTOS[0].id;
  const proyecto = PROYECTOS.find(p => p.id === proyectoId);
  const escenario = params.get('escenario') ?? 'normal';
  const [recarga, setRecarga] = useState(0);
  const clave = `${proyectoId}-${escenario}`;
  const [resuelta, setResuelta] = useState('');
  const { enLinea } = useSst();
  useEffect(() => { const t = setTimeout(() => setResuelta(clave), 350); return () => clearTimeout(t); }, [clave]);
  const [actualizando, setActualizando] = useState(false);
  useEffect(() => { if (!recarga) return; setActualizando(true); const t = setTimeout(() => setActualizando(false), 350); return () => clearTimeout(t); }, [recarga]);
  function cambiar(cambios: Record<string, string | null>) {
    setParams(prev => { const next = new URLSearchParams(prev); Object.entries(cambios).forEach(([k,v]) => v == null ? next.delete(k) : next.set(k,v)); return next; });
  }
  return { params, proyecto, proyectoId, escenario, actualizando, cargando: resuelta !== clave, enLinea, cambiar,
    recargar: () => { if (enLinea) { cambiar({ escenario: 'normal' }); setRecarga(n => n+1); } } };
}
export type Consulta = ReturnType<typeof useConsulta>;
export function ControlesConsulta({ consulta: q }: { consulta: Consulta }) {
  return <div className="flex flex-col gap-gutter-md">
    <div className="flex flex-col gap-gutter-md tablet:flex-row tablet:items-end">
      <Select label="Proyecto" className="min-w-0 flex-1" value={q.proyectoId} options={PROYECTOS.map(p => ({ value:p.id, label:`${p.id} · ${p.nombre}` }))}
        onChange={e => q.cambiar({ proyecto:e.target.value, registro:null, carpeta:null })} />
      <Button variant="secondary" onClick={q.recargar} loading={q.cargando || q.actualizando} loadingText="Consultando…" blocked={!q.enLinea} blockedReason="Necesitas conexión para actualizar.">Actualizar consulta</Button>
    </div>
    <details className="rounded border border-outline-variant p-gutter-sm text-body-sm text-on-surface-muted">
      <summary className="min-h-touch cursor-pointer py-gutter-sm">Demostración · datos ficticios del 17/11/2026</summary>
      <Select label="Escenario de demostración" value={q.escenario} options={[
        {value:'normal',label:'Consulta normal'}, {value:'vacio',label:'Sin registros'}, {value:'error',label:'Error de consulta'},
        {value:'sin-permiso',label:'Acceso denegado'}, {value:'incompleto',label:'Información incompleta'},
      ]} onChange={e => q.cambiar({ escenario:e.target.value })} />
      <p className="mt-gutter-sm">Se simulan las respuestas y los perfiles; el acceso usa la sesión de ejemplo compartida del prototipo.</p>
    </details>
  </div>;
}
export function EstadoConsulta({ consulta:q }: { consulta:Consulta }) {
  if (!q.proyecto) return <Banner tone="error" title="Proyecto no disponible" actions={<Button onClick={() => q.cambiar({proyecto:PROYECTOS[0].id,registro:null})}>Volver a proyectos</Button>}>No encontramos el proyecto solicitado.</Banner>;
  if (q.escenario === 'sin-permiso') return <Banner tone="error" title="Acceso denegado">El perfil de esta demostración no tiene permiso para consultar estos datos. No se muestra información del proyecto.</Banner>;
  if (q.cargando) return <div aria-busy="true" role="status" className="card p-gutter-md"><span className="sr-only">Cargando consulta</span>{Array.from({length:6},(_,i)=><Skeleton key={i} className="my-gutter-md h-6 w-full" />)}</div>;
  if (q.escenario === 'error') return <Banner tone="error" title="No pudimos cargar la consulta" actions={<Button onClick={q.recargar} blocked={!q.enLinea} blockedReason="Necesitas conexión para reintentar.">Reintentar</Button>}>Intenta de nuevo. El proyecto seleccionado se conserva.</Banner>;
  return null;
}
export function consultaDisponible(q:Consulta) { return Boolean(q.proyecto) && !q.cargando && !['error','sin-permiso'].includes(q.escenario); }
