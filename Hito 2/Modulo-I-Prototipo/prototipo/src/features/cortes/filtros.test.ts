import { describe, expect, it } from 'vitest';
import { SIN_FILTROS, buscaEnTodosLosEstados, filtrarCortes } from './filtros';
import { cortesIniciales, type CorteDemo } from './modeloDemo';

// Ejemplos: #06 Visado · Medellín, #07 Devuelto · Cartagena, #08 En Revisión · Cartago.
const cortes = cortesIniciales();
const EN_REVISION = 'En Revisión (Enviado)';
const numeros = (lista: CorteDemo[]) => lista.map(corte => corte.numero);

describe('búsqueda y filtros de cortes', () => {
  it('sin texto, el estado elegido limita la lista', () => {
    expect(numeros(filtrarCortes(cortes, { ...SIN_FILTROS, estado: EN_REVISION }))).toEqual(['08']);
    expect(filtrarCortes(cortes, SIN_FILTROS)).toHaveLength(3);
  });
  it('al escribir en el buscador mira todos los estados', () => {
    const filtros = { ...SIN_FILTROS, estado: EN_REVISION, busqueda: '06' };
    expect(numeros(filtrarCortes(cortes, filtros))).toEqual(['06']);
    expect(buscaEnTodosLosEstados(filtros)).toBe(true);
    expect(buscaEnTodosLosEstados({ ...filtros, busqueda: '  ' })).toBe(false);
    expect(numeros(filtrarCortes(cortes, { ...filtros, busqueda: '  ' }))).toEqual(['08']);
  });
  it('busca por residente, frente, ciudad y cliente sin importar tildes ni mayúsculas', () => {
    expect(filtrarCortes(cortes, { ...SIN_FILTROS, estado: EN_REVISION, busqueda: 'mauricio' })).toHaveLength(3);
    expect(filtrarCortes(cortes, { ...SIN_FILTROS, busqueda: 'ESTACION' })).toHaveLength(3);
    expect(numeros(filtrarCortes(cortes, { ...SIN_FILTROS, busqueda: 'medellin' }))).toEqual(['06']);
    expect(numeros(filtrarCortes(cortes, { ...SIN_FILTROS, busqueda: 'energía del valle' }))).toEqual(['07']);
    expect(filtrarCortes(cortes, { ...SIN_FILTROS, busqueda: 'no existe' })).toHaveLength(0);
  });
  it('filtra por ciudad y por cliente, también junto con la búsqueda', () => {
    expect(numeros(filtrarCortes(cortes, { ...SIN_FILTROS, ciudad: 'Cartagena' }))).toEqual(['07']);
    expect(numeros(filtrarCortes(cortes, { ...SIN_FILTROS, cliente: 'Tuberías Andinas S.A.' }))).toEqual(['08']);
    expect(filtrarCortes(cortes, { ...SIN_FILTROS, ciudad: 'Cartago', busqueda: '06' })).toHaveLength(0);
    expect(filtrarCortes(cortes, { ...SIN_FILTROS, ciudad: 'Cartago', cliente: 'Gases del Litoral S.A.' })).toHaveLength(0);
  });
  it('filtra por fechas según el periodo del corte', () => {
    const [primero, ...resto] = cortes;
    const octubre: CorteDemo = { ...primero, versiones: [{ ...primero.versiones[0], datos: { ...primero.versiones[0].datos, inicio: '2026-10-01', fin: '2026-10-15' } }] };
    const lista = [octubre, ...resto];
    expect(numeros(filtrarCortes(lista, { ...SIN_FILTROS, desde: '2026-11-01' }))).toEqual(['07', '08']);
    expect(numeros(filtrarCortes(lista, { ...SIN_FILTROS, hasta: '2026-10-31' }))).toEqual(['06']);
    expect(numeros(filtrarCortes(lista, { ...SIN_FILTROS, desde: '2026-10-15', hasta: '2026-11-10' }))).toEqual(['06', '07', '08']);
    expect(filtrarCortes(lista, { ...SIN_FILTROS, desde: '2026-10-16', hasta: '2026-11-09' })).toHaveLength(0);
  });
  it('los cortes guardados sin ciudad ni cliente no rompen la lista', () => {
    const viejo: CorteDemo = structuredClone(cortes[2]);
    delete viejo.versiones[0].datos.ciudad;
    delete viejo.versiones[0].datos.cliente;
    expect(filtrarCortes([viejo], SIN_FILTROS)).toHaveLength(1);
    expect(filtrarCortes([viejo], { ...SIN_FILTROS, busqueda: 'patio' })).toHaveLength(0);
    expect(filtrarCortes([viejo], { ...SIN_FILTROS, busqueda: 'estación' })).toHaveLength(1);
    expect(filtrarCortes([viejo], { ...SIN_FILTROS, ciudad: 'Cartago' })).toHaveLength(0);
  });
});
