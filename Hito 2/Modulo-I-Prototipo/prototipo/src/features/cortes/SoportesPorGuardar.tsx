import { CircleAlert, CircleCheck, FileText, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useId, useState } from 'react';
import { Button, FileUpload } from '@/components';
import { esDuplicado, formatoTamano, resumenSoportes, tipoSoporte } from './soportes';

/** Archivo elegido mientras se registra el corte. Se asocia al corte al guardarlo. */
export interface SoportePendiente { clave: string; archivo: File; url: string }

/**
 * HU-M03 · Soportes de un corte que aún no se ha guardado.
 * Cada fotografía o PDF queda a la vista apenas se elige, con su nombre, su tipo y la opción de quitarlo.
 */
export function SoportesPorGuardar({ pendientes, onChange }: { pendientes: SoportePendiente[]; onChange: (pendientes: SoportePendiente[]) => void }) {
  const tituloId = useId();
  const [repetidos, setRepetidos] = useState<string[]>([]);
  const descritos = pendientes.map(item => ({ nombre: item.archivo.name, tipoMime: item.archivo.type, bytes: item.archivo.size }));

  function recibir(archivos: File[]) {
    const conocidos = [...descritos];
    const nuevos: SoportePendiente[] = [];
    const avisos: string[] = [];
    for (const archivo of archivos) {
      if (esDuplicado(conocidos, archivo)) { avisos.push(`«${archivo.name}» ya está en la lista.`); continue; }
      conocidos.push({ nombre: archivo.name, tipoMime: archivo.type, bytes: archivo.size });
      nuevos.push({ clave: crypto.randomUUID(), archivo, url: URL.createObjectURL(archivo) });
    }
    setRepetidos(avisos);
    if (nuevos.length) onChange([...pendientes, ...nuevos]);
  }

  function quitar(item: SoportePendiente) {
    URL.revokeObjectURL(item.url);
    setRepetidos([]);
    onChange(pendientes.filter(otro => otro.clave !== item.clave));
  }

  return (
    <section aria-labelledby={tituloId} className="card flex flex-col gap-gutter-md p-gutter-md">
      <div className="flex flex-wrap items-baseline justify-between gap-gutter-sm">
        <h2 id={tituloId} className="text-headline-sm">Soportes del corte</h2>
        <span role="status" className="text-body-md tabular-nums text-on-surface-muted">{resumenSoportes(descritos)}</span>
      </div>
      <p className="text-body-md text-on-surface-muted">
        Agrega aquí las fotografías y los PDF del periodo. Quedan en el corte cuando oprimes «Guardar corte».
      </p>

      {pendientes.length > 0 && (
        <ul aria-label="Archivos listos para guardar con el corte" className="flex flex-col gap-gutter-sm">
          {pendientes.map(item => {
            const foto = tipoSoporte({ nombre: item.archivo.name, tipoMime: item.archivo.type }) === 'foto';
            const Icono = foto ? ImageIcon : FileText;
            return (
              <li key={item.clave} className="sf-container flex flex-col gap-gutter-sm rounded-md border border-outline-variant p-3 tablet:flex-row tablet:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-gutter-sm">
                  {foto
                    ? <img src={item.url} alt="" className="h-12 w-12 shrink-0 rounded border border-outline-variant object-cover" />
                    : <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded border border-outline-variant"><Icono aria-hidden="true" className="h-5 w-5 text-on-surface-muted" /></span>}
                  <div className="min-w-0">
                    <p className="break-words text-title-md">{item.archivo.name}</p>
                    <p className="text-body-sm tabular-nums text-on-surface-muted">{foto ? 'Fotografía' : 'PDF'} · {formatoTamano(item.archivo.size)}</p>
                    <p className="flex items-center gap-gutter-xs text-body-sm text-success">
                      <CircleCheck aria-hidden="true" className="h-4 w-4 shrink-0" />Listo. Se guarda con el corte.
                    </p>
                  </div>
                </div>
                <Button variant="ghost" icon={<Trash2 className="h-4 w-4" />} aria-label={`Quitar ${item.archivo.name}`} onClick={() => quitar(item)}>Quitar</Button>
              </li>
            );
          })}
        </ul>
      )}

      <FileUpload label="Agregar fotografías o PDF" onFiles={recibir} />
      {repetidos.length > 0 && (
        <ul role="alert" className="flex flex-col gap-gutter-xs">
          {repetidos.map(aviso => (
            <li key={aviso} className="flex items-start gap-gutter-xs text-body-sm text-warning">
              <CircleAlert aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>{aviso} No se volvió a agregar.</span>
            </li>
          ))}
        </ul>
      )}
      {pendientes.length > 0 && (
        <p className="text-body-sm text-on-surface-muted">Si recargas la página antes de guardar el corte, vuelve a seleccionar los archivos.</p>
      )}
    </section>
  );
}
