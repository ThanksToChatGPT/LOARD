import type { CorteDemo } from '@/features/cortes/modeloDemo';
import type { Registro } from './datos';
import type { TimelineEntry } from '@/components';
export function registrosCortes(cortes: CorteDemo[]): Registro[] {
 return cortes.map(corte => {
  const versiones = [...corte.versiones].sort((a,b)=>a.version-b.version);
  const eventos: TimelineEntry[] = versiones.map((v,i)=>({id:`${corte.id}-v${v.version}`,fecha:new Date(v.fecha),usuario:v.autor,rol:v.rol,estadoAnterior:i ? versiones[i-1].estado : 'Sin registro',estadoNuevo:v.estado,motivo:v.motivo}));
  return { id:corte.id, proyecto:'CW-118',nombre:`Corte #${corte.numero}`,tipo:'corte',estado:versiones[versiones.length-1].estado,eventos };
 });
}
