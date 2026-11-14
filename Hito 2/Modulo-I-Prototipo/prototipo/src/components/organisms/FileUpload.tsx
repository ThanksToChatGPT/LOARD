import { CircleAlert, Upload } from 'lucide-react';
import { useId, useRef, useState, type DragEvent, type ReactNode } from 'react';
import { ARCHIVO_ACCEPT, ARCHIVO_AYUDA, validarArchivo } from '@/lib/archivos';
import { cn } from '@/lib/cn';
import { Button } from '../atoms/Button';
import type { ControlSize } from '../atoms/sizes';

export interface FileUploadProps {
  /** Qué se está adjuntando: «Soporte del certificado». */
  label: string;
  /** Formatos y límites, visibles antes de subir. */
  hint?: string;
  multiple?: boolean;
  /** Recibe solo los archivos que pasaron la validación de formato y peso. */
  onFiles: (archivos: File[]) => void;
  size?: ControlSize;
  /** Lista de `UploadItem` con los archivos en carga o ya cargados. */
  children?: ReactNode;
  className?: string;
}

/**
 * Zona de carga (§7.2). El botón abre el selector del dispositivo con toque o teclado;
 * con puntero también se puede arrastrar. Rechaza en el navegador lo que no es
 * PDF/JPG/PNG o supera 15 MB, sin gastar datos.
 */
export function FileUpload({
  label,
  hint = ARCHIVO_AYUDA,
  multiple = true,
  onFiles,
  size = 'default',
  children,
  className,
}: FileUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const tituloId = useId();
  const ayudaId = useId();
  const [arrastrando, setArrastrando] = useState(false);
  const [rechazos, setRechazos] = useState<string[]>([]);

  const recibir = (lista: FileList | null) => {
    if (!lista) return;
    const archivos = multiple ? Array.from(lista) : Array.from(lista).slice(0, 1);
    const validos: File[] = [];
    const motivos: string[] = [];
    for (const archivo of archivos) {
      const motivo = validarArchivo(archivo);
      if (motivo) motivos.push(motivo);
      else validos.push(archivo);
    }
    setRechazos(motivos);
    if (validos.length > 0) onFiles(validos);
  };

  const alSoltar = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setArrastrando(false);
    recibir(e.dataTransfer.files);
  };

  return (
    <div role="group" aria-labelledby={tituloId} className={cn('flex flex-col gap-gutter-sm', className)}>
      <span id={tituloId} className="text-label-lg">
        {label}
      </span>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastrando(true);
        }}
        onDragLeave={() => setArrastrando(false)}
        onDrop={alSoltar}
        className={cn(
          'flex flex-col items-center gap-gutter-sm rounded-md border-2 border-dashed p-gutter-lg text-center',
          'transition-colors duration-state ease-out',
          arrastrando ? 'sf-low border-primary' : rechazos.length > 0 ? 'border-error' : 'border-outline',
        )}
      >
        <Upload aria-hidden="true" className="h-6 w-6 text-on-surface-muted" />
        <p className="hidden text-body-md desktop:block">Arrastra los archivos aquí o</p>
        <Button
          variant="secondary"
          size={size}
          aria-describedby={ayudaId}
          onClick={() => input.current?.click()}
        >
          {multiple ? 'Seleccionar archivos' : 'Seleccionar archivo'}
        </Button>
        <p id={ayudaId} className="text-body-sm text-on-surface-muted">
          {hint}
        </p>
        <input
          ref={input}
          type="file"
          hidden
          tabIndex={-1}
          accept={ARCHIVO_ACCEPT}
          multiple={multiple}
          onChange={(e) => {
            recibir(e.target.files);
            e.target.value = ''; // permite volver a elegir el mismo archivo
          }}
        />
      </div>

      {rechazos.length > 0 && (
        <ul role="alert" className="flex flex-col gap-gutter-xs">
          {rechazos.map((motivo) => (
            <li key={motivo} className="flex items-start gap-gutter-xs text-body-sm text-error">
              <CircleAlert aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>{motivo}</span>
            </li>
          ))}
        </ul>
      )}

      {children && <ul className="flex flex-col gap-gutter-sm">{children}</ul>}
    </div>
  );
}
