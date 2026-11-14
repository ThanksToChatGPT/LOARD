import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { SstProvider } from '@/lib/sst/SstContext';
import { ListaPersonal } from './ListaPersonal';

describe('filtro de estado en la URL', () => {
  it.each(['toString', 'constructor', '__proto__', 'desconocido'])(
    'ignora el estado inválido %s y conserva la lista de personal',
    (estado) => {
      const html = renderToString(
        <MemoryRouter initialEntries={[`/sst?estado=${estado}`]}>
          <SstProvider><ListaPersonal /></SstProvider>
        </MemoryRouter>,
      );
      expect(html).toContain('14 trabajadores');
      expect(html).toContain('Fredy Cuero');
    },
  );
});
