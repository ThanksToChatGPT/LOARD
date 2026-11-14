import { describe, expect, it } from 'vitest';
import { DATOS_INICIALES } from '@/lib/sst/datos';
import { evaluar } from '@/lib/sst/evaluacion';
import { HOY_SST } from '@/lib/sst/fechas';
import { alertasDeVigencia, conteoAlertas, opcionesPersonal, textoAlerta } from './personal';

// Mismos datos de ejemplo que el prototipo, calculados al 17/11/2026.
const { trabajadores, cursos, aptitudes } = DATOS_INICIALES;
const filas = trabajadores.map((trabajador) => ({
  trabajador,
  evaluacion: evaluar(
    trabajador,
    cursos.filter((c) => c.trabajadorId === trabajador.id),
    aptitudes.filter((a) => a.trabajadorId === trabajador.id),
    HOY_SST,
  ),
}));
const fila = (nombre: string) => filas.find((f) => f.trabajador.nombre === nombre)!;
const nombres = (lista: typeof filas) => lista.map((f) => f.trabajador.nombre);

describe('opcionesPersonal', () => {
  it('muestra a todos, con vencidos y No Habilitado aparte', () => {
    const { asignables, bloqueados } = opcionesPersonal(filas, '');
    expect(asignables.length + bloqueados.length).toBe(filas.length);
    expect(nombres(bloqueados)).toEqual(['Carlos Arboleda', 'Jhon Angulo', 'Kevin Ortiz', 'Martha Ríos', 'Nelson Quiñónez']);
    expect(nombres(asignables)).toContain('Luis Mosquera'); // vence hoy: todavía se puede asignar
  });

  it('busca sin tildes y por cédula con puntos', () => {
    expect(nombres(opcionesPersonal(filas, 'quinonez').bloqueados)).toEqual(['Nelson Quiñónez']);
    expect(nombres(opcionesPersonal(filas, '1.144.082.315').bloqueados)).toEqual(['Jhon Angulo']);
  });
});

describe('motivo del bloqueo', () => {
  it('dice el curso y hace cuántos días venció', () => {
    expect(fila('Jhon Angulo').evaluacion.motivo).toBe('Bloqueado: Trabajo en alturas vencido hace 4 días');
  });

  it('dice cuando el concepto médico es No Habilitado', () => {
    expect(fila('Martha Ríos').evaluacion.motivo).toBe('Bloqueado: Aptitud médica concepto No Habilitado');
  });
});

describe('alertas de 15 y 30 días', () => {
  it('lista cada vencimiento próximo, el más cercano primero', () => {
    expect(alertasDeVigencia(fila('Paola Hurtado').evaluacion).map(textoAlerta)).toEqual([
      'Aptitud médica vence en 22 días',
      'Trabajo en alturas vence en 28 días',
    ]);
  });

  it('cuenta a cada trabajador una vez, por su alerta más urgente', () => {
    const elegidos = ['Ana Valencia', 'Diego Caicedo', 'Yesid Torres', 'Sandra Mina'].map(fila);
    expect(conteoAlertas(elegidos)).toEqual({ d15: 2, d30: 1 });
  });
});
