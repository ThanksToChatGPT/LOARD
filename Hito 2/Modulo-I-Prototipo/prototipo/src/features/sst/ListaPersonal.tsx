import { CircleCheck, Lock, TriangleAlert } from 'lucide-react';
import { useMemo, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, KpiCard, PageHeader, ResponsiveTable, SearchField, StatusBadge, type TableColumn } from '@/components';
import type { EstadoSST } from '@/lib/estados';
import { formatoFecha, formatoHora, plural } from '@/lib/formato';
import { compararCriticosPrimero, esAsignable } from '@/lib/semaforo';
import { formatoCedula } from './componentes';
import { textoOtros } from './evaluacion';
import { HOY_SST, SINCRONIZADO_EN } from './fechas';
import { useSst, type FilaPersonal } from './SstContext';

/** Grupos de los indicadores. Cada uno filtra la tabla por uno o dos estados oficiales. */
const GRUPOS = {
  bloqueados: { titulo: 'Bloqueados', estados: ['Vencido', 'No Habilitado'] as EstadoSST[], tono: 'error' as const },
  '15d': { titulo: 'Vencen en 15 días o menos', estados: ['Próximo a Vencer (15d)'] as EstadoSST[], tono: 'warning' as const },
  '30d': { titulo: 'Vencen en 16 a 30 días', estados: ['Próximo a Vencer (30d)'] as EstadoSST[], tono: 'warning' as const },
  habilitados: { titulo: 'Habilitados', estados: ['Habilitado'] as EstadoSST[], tono: 'success' as const },
};
type Grupo = keyof typeof GRUPOS;
const esGrupo = (v: string | null): v is Grupo => v != null && v in GRUPOS;

const ICONO_GRUPO: Record<Grupo, ReactNode> = {
  bloqueados: <Lock aria-hidden="true" className="h-4 w-4 text-error" />,
  '15d': <TriangleAlert aria-hidden="true" className="h-4 w-4 text-warning" />,
  '30d': <TriangleAlert aria-hidden="true" className="h-4 w-4 text-warning" />,
  habilitados: <CircleCheck aria-hidden="true" className="h-4 w-4 text-success" />,
};

/** Críticos primero; dentro del mismo estado, el que vence antes; luego por nombre. */
function ordenar(a: FilaPersonal, b: FilaPersonal): number {
  const porEstado = compararCriticosPrimero(a.evaluacion.estado, b.evaluacion.estado);
  if (porEstado !== 0) return porEstado;
  const da = a.evaluacion.principal.dias ?? -Infinity;
  const db = b.evaluacion.principal.dias ?? -Infinity;
  if (da !== db) return da - db;
  return a.trabajador.nombre.localeCompare(b.trabajador.nombre, 'es');
}

const sinTildes = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export function ListaPersonal() {
  const navigate = useNavigate();
  const { filas, enLinea } = useSst();
  // Filtro y búsqueda en la URL: al volver de la ficha se conservan.
  const [params, setParams] = useSearchParams();
  const grupoParam = params.get('estado');
  const grupo = esGrupo(grupoParam) ? grupoParam : null;
  const busqueda = params.get('q') ?? '';

  const actualizar = (cambios: Record<string, string | null>) => {
    const siguiente = new URLSearchParams(params);
    for (const [k, v] of Object.entries(cambios)) {
      if (v) siguiente.set(k, v);
      else siguiente.delete(k);
    }
    setParams(siguiente, { replace: true });
  };

  const conteo = useMemo(() => {
    const c = { bloqueados: 0, '15d': 0, '30d': 0, habilitados: 0 } as Record<Grupo, number>;
    for (const f of filas) {
      const g = (Object.keys(GRUPOS) as Grupo[]).find((k) => GRUPOS[k].estados.includes(f.evaluacion.estado));
      if (g) c[g]++;
    }
    return c;
  }, [filas]);

  const visibles = useMemo(() => {
    const q = sinTildes(busqueda.trim());
    return filas
      .filter((f) => !grupo || GRUPOS[grupo].estados.includes(f.evaluacion.estado))
      .filter((f) => {
        if (!q) return true;
        const t = f.trabajador;
        return sinTildes(`${t.nombre} ${t.cedula} ${t.cargo} ${t.frente}`).includes(q.replace(/\./g, ''));
      })
      .sort(ordenar);
  }, [filas, grupo, busqueda]);

  const columnas: TableColumn<FilaPersonal>[] = [
    {
      key: 'trabajador',
      header: 'Trabajador',
      primary: true,
      cell: ({ trabajador: t }) => (
        <span className="flex flex-col">
          <span className="text-title-md">{t.nombre}</span>
          <span className="text-body-sm tabular-nums text-on-surface-muted">
            C.C. {formatoCedula(t.cedula)} · {t.cargo}
          </span>
        </span>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: ({ evaluacion }) => <StatusBadge estado={evaluacion.estado} />,
    },
    {
      key: 'motivo',
      header: 'Motivo',
      cell: ({ evaluacion: e }) => {
        const otros = textoOtros(e.otrosEnAlerta);
        return (
          <span className="flex flex-col">
            <span className={!esAsignable(e.estado) ? 'font-semibold text-error' : undefined}>{e.motivo}</span>
            {otros && <span className="text-body-sm text-on-surface-muted">y {otros}</span>}
          </span>
        );
      },
    },
    {
      key: 'vence',
      header: 'Vencimiento',
      numeric: true,
      cell: ({ evaluacion: e }) => (e.principal.vencimiento ? formatoFecha(e.principal.vencimiento) : '—'),
    },
    {
      key: 'accion',
      header: 'Acciones',
      action: true,
      align: 'end',
      cell: ({ trabajador: t }) => (
        <Button
          variant="secondary"
          size="field"
          aria-label={`Ver ficha de ${t.nombre}`}
          onClick={() => navigate(`/sst/${t.id}`)}
        >
          Ver ficha
        </Button>
      ),
    },
  ];

  const filtroTexto = grupo ? GRUPOS[grupo].titulo.toLowerCase() : null;

  return (
    <div className="grid-page gap-y-gutter-lg">
      <PageHeader
        className="col-span-full"
        title="Personal SST"
        description="Cursos normativos y aptitud médica de cada trabajador del proyecto."
        meta={
          <>
            Semáforo calculado al {formatoFecha(HOY_SST)}
            {!enLinea && ` · datos SST actualizados hoy a las ${formatoHora(SINCRONIZADO_EN)}`}
          </>
        }
      />

      <div role="group" aria-label="Filtrar por estado" className="col-span-full grid grid-cols-2 gap-gutter-sm tablet:grid-cols-4 desktop:gap-gutter-md">
        {(Object.keys(GRUPOS) as Grupo[]).map((k) => (
          <KpiCard
            key={k}
            className="!col-span-1"
            title={GRUPOS[k].titulo}
            icon={ICONO_GRUPO[k]}
            tone={GRUPOS[k].tono}
            value={conteo[k]}
            description={grupo === k ? 'Filtro activo · oprime para quitarlo' : plural(conteo[k], 'trabajador', 'trabajadores')}
            selected={grupo === k}
            onClick={() => actualizar({ estado: grupo === k ? null : k })}
          />
        ))}
      </div>

      <div className="col-span-full flex flex-col gap-gutter-sm tablet:flex-row tablet:items-end">
        <SearchField
          className="flex-1"
          size="field"
          label="Buscar trabajador"
          placeholder="Nombre, cédula, cargo o frente"
          value={busqueda}
          onChange={(v) => actualizar({ q: v || null })}
        />
        {grupo && (
          <Button variant="ghost" size="field" onClick={() => actualizar({ estado: null })}>
            Quitar filtro «{GRUPOS[grupo].titulo}»
          </Button>
        )}
      </div>

      <p role="status" className="col-span-full -mb-gutter-sm text-body-sm tabular-nums text-on-surface-muted">
        {plural(visibles.length, 'trabajador', 'trabajadores')}
        {filtroTexto && ` · ${filtroTexto}`}
        {busqueda.trim() && ` · búsqueda «${busqueda.trim()}»`} · críticos primero
      </p>

      <ResponsiveTable
        className="col-span-full"
        caption="Personal SST, críticos primero"
        columns={columnas}
        rows={visibles}
        rowKey={(f) => f.trabajador.id}
        rowTone={(f) => (!esAsignable(f.evaluacion.estado) ? 'error' : undefined)}
        empty={
          busqueda.trim()
            ? `Ningún trabajador coincide con «${busqueda.trim()}»${filtroTexto ? ` en ${filtroTexto}` : ''}. Revisa el texto o quita el filtro.`
            : 'No hay trabajadores en este estado.'
        }
      />
    </div>
  );
}
