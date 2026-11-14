import type { Cut } from '../lib/types';

const labels = { review: 'En Revisión (Enviado)', approved: 'Visado', observed: 'Devuelto con Observaciones' };
export function StatusBadge({ status }: { status: Cut['status'] }) {
  return <span className={`badge ${status}`}><span className="status-dot" />{labels[status]}</span>;
}
