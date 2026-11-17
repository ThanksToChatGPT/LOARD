// Calcula el contraste WCAG de los pares de color que usan HU-M03 y HU-M04,
// leyendo los valores directamente de styles/tokens.css (tema claro y oscuro).
// Uso: node "Hito 2/Modulo-I-Prototipo/HU03-HU04/herramientas/contraste.mjs"
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const CSS = readFileSync(resolve(AQUI, '../../prototipo/src/styles/tokens.css'), 'utf8');
const SALIDA = resolve(AQUI, '../../../Modulo-III-QC/HU03-HU04/contraste.json');

function tokens(bloque) {
  return Object.fromEntries([...bloque.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)].map(([, k, v]) => [k, v]));
}
const claro = tokens(CSS.slice(CSS.indexOf(':root'), CSS.indexOf("[data-theme='dark']")));
const oscuro = { ...claro, ...tokens(CSS.slice(CSS.indexOf("[data-theme='dark']"))) };

const lineal = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const luminancia = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => lineal(parseInt(hex.slice(i, i + 2), 16)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const razon = (a, b) => {
  const [x, y] = [luminancia(a), luminancia(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

// [uso en pantalla, texto o elemento, fondo, mínimo exigido]
const PARES = [
  ['Texto principal de las tarjetas', 'on-surface', 'surface-container', 4.5],
  ['Texto secundario (tamaño, autor, fecha del soporte)', 'on-surface-muted', 'surface-container', 4.5],
  ['Botón principal «Visar corte» y «Revisar»', 'on-primary', 'primary', 4.5],
  ['Botón ámbar «Confirmar devolución»', 'on-warning', 'warning', 4.5],
  ['Insignia «En Revisión (Enviado)»', 'info', 'info-subtle', 4.5],
  ['Insignia «Visado» y «Archivo cargado»', 'success', 'success-subtle', 4.5],
  ['Insignia y aviso «Devuelto con Observaciones»', 'warning', 'warning-subtle', 4.5],
  ['Mensaje de archivo rechazado', 'error', 'surface-container', 4.5],
  ['Aviso «Deshacer» (texto del toast)', 'inverse-on-surface', 'inverse-surface', 4.5],
  ['Botón «Deshacer» dentro del toast', 'inverse-primary', 'inverse-surface', 4.5],
  ['Anillo de foco del teclado', 'focus-ring', 'surface-container', 3],
  ['Borde de botones secundarios y campos', 'outline', 'surface-container', 3],
];

const resultado = PARES.map(([uso, texto, fondo, minimo]) => {
  const fila = { uso, tokens: `${texto} / ${fondo}`, minimo };
  for (const [tema, t] of [['claro', claro], ['oscuro', oscuro]]) {
    const r = razon(t[texto], t[fondo]);
    fila[tema] = { colores: `${t[texto]} / ${t[fondo]}`, razon: Number(r.toFixed(2)), cumple: r >= minimo };
  }
  return fila;
});

writeFileSync(SALIDA, JSON.stringify({ fuente: 'prototipo/src/styles/tokens.css', criterio: 'WCAG 2.2: 1.4.3 (texto 4,5:1) y 1.4.11 (elementos no textuales 3:1)', pares: resultado }, null, 2));
for (const f of resultado) {
  console.log(`${f.claro.cumple && f.oscuro.cumple ? '✓' : '✗'} ${f.uso}: claro ${f.claro.razon}:1 · oscuro ${f.oscuro.razon}:1 (mín. ${f.minimo}:1)`);
}
