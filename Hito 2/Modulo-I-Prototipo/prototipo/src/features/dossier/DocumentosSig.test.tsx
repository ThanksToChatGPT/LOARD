import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthDemoProvider } from '@/features/acceso/AuthDemo';
import { DocumentosSig } from './DocumentosSig';
import { DossierProvider } from './DossierContext';

/** Dibuja la pantalla con la URL indicada y la sesión de ese perfil. */
function pantalla(url: string, correo?: string) {
  vi.stubGlobal('sessionStorage', { getItem: () => (correo ? JSON.stringify(correo) : null) });
  return renderToString(
    <MemoryRouter initialEntries={[url]}>
      <AuthDemoProvider><DossierProvider><DocumentosSig /></DossierProvider></AuthDemoProvider>
    </MemoryRouter>,
  ).replace(/<!-- -->/g, '');
}

describe('búsqueda de documentos vigentes', () => {
  beforeEach(() => vi.stubGlobal('localStorage', { getItem: () => null, setItem: vi.fn() }));
  afterEach(() => vi.unstubAllGlobals());

  it('lista solo las versiones vigentes', () => {
    const html = pantalla('/dossier/documentos');
    expect(html).toContain('8 documentos vigentes');
    expect(html).toContain('Libro de tubería');
    expect(html).toContain('v3');
    expect(html).not.toContain('Obsoleta');
  });
  it('filtra por nombre o código, carpeta y estado desde la URL', () => {
    const html = pantalla('/dossier/documentos?q=gt-fr&carpeta=4&estado=Archivo%20Cargado');
    expect(html).toContain('1 de 8 documentos vigentes');
    expect(html).toContain('GT-FR64');
    expect(html).not.toContain('GT-FR08');
  });
  it('explica con claridad cuando no hay resultados', () => {
    const html = pantalla('/dossier/documentos?q=plano%20inexistente&carpeta=6');
    expect(html).toContain('0 de 8 documentos vigentes');
    expect(html).toContain('No hay documentos vigentes para «plano inexistente», la Carpeta 6.');
    expect(html).toContain('Limpiar filtros');
  });
  it.each(['toString', 'constructor', '__proto__', '99'])('ignora el filtro inválido %s y conserva la lista', (valor) => {
    const html = pantalla(`/dossier/documentos?carpeta=${valor}&estado=${valor}`);
    expect(html).toContain('8 documentos vigentes');
    expect(html).toContain('GC-FR40');
  });
  it('solo Calidad ve las acciones de publicación', () => {
    expect(pantalla('/dossier/documentos', 'calidad@loard.demo')).toContain('Publicar documento');
    expect(pantalla('/dossier/documentos', 'calidad@loard.demo')).toContain('Nueva versión');
    for (const correo of ['residente@loard.demo', 'director@loard.demo', 'gerencia@loard.demo']) {
      const html = pantalla('/dossier/documentos', correo);
      expect(html).not.toContain('Publicar documento');
      expect(html).not.toContain('Nueva versión');
      expect(html).toContain('Historial');
    }
  });
});
