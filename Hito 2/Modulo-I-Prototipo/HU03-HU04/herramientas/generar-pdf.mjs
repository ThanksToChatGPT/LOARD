// Convierte los documentos .md de HU-M03 y HU-M04 en PDF con Microsoft Edge.
// Los .md son la fuente editable; este script vuelve a generar los PDF a su lado.
// Uso: node "Hito 2/Modulo-I-Prototipo/HU03-HU04/herramientas/generar-pdf.mjs"
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { abrirEdge } from './edge.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const HITO = resolve(AQUI, '../../..');
const DOCUMENTOS = [
  'Modulo-I-Prototipo/HU03-HU04/Modulo_1_HU03_HU04.md',
  'Modulo-II-Frontend/HU03-HU04/Modulo_2_HU03_HU04.md',
  'Modulo-III-QC/HU03-HU04/Modulo_3_HU03_HU04.md',
  'Modulo-IV-Persistencia/HU03-HU04/Modulo_4_HU03_HU04.md',
].map((r) => join(HITO, r));

const escapar = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function enLinea(s) {
  return escapar(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2">$1</a>');
}
const imagen = (alt, src) => `<figure class="${/-movil\.png$/.test(src) ? 'movil' : ''}"><img src="${src}" alt="${escapar(alt)}"><figcaption>${enLinea(alt)}</figcaption></figure>`;

function markdownAHtml(md) {
  const lineas = md.replace(/\r/g, '').split('\n');
  const html = [];
  let i = 0;
  while (i < lineas.length) {
    const l = lineas[i];
    if (!l.trim()) { i++; continue; }
    if (l.startsWith('```')) {
      const bloque = [];
      for (i++; i < lineas.length && !lineas[i].startsWith('```'); i++) bloque.push(lineas[i]);
      html.push(`<pre>${escapar(bloque.join('\n'))}</pre>`); i++; continue;
    }
    const h = l.match(/^(#{1,3})\s+(.*)$/);
    if (h) { html.push(`<h${h[1].length}>${enLinea(h[2])}</h${h[1].length}>`); i++; continue; }
    const imgs = [...l.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)];
    if (imgs.length && l.replace(/!\[[^\]]*\]\([^)]+\)/g, '').trim() === '') {
      html.push(imgs.length > 1 ? `<div class="fila">${imgs.map((m) => imagen(m[1], m[2])).join('')}</div>` : imagen(imgs[0][1], imgs[0][2]));
      i++; continue;
    }
    if (l.startsWith('|')) {
      const filas = [];
      for (; i < lineas.length && lineas[i].startsWith('|'); i++) filas.push(lineas[i]);
      const celdas = (f) => f.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const [cab, , ...cuerpo] = filas;
      html.push(`<table><thead><tr>${celdas(cab).map((c) => `<th>${enLinea(c)}</th>`).join('')}</tr></thead><tbody>${
        cuerpo.map((f) => `<tr>${celdas(f).map((c) => `<td>${enLinea(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if (l.startsWith('>')) {
      const cita = [];
      for (; i < lineas.length && lineas[i].startsWith('>'); i++) cita.push(lineas[i].replace(/^>\s?/, ''));
      html.push(`<blockquote>${enLinea(cita.join(' '))}</blockquote>`); continue;
    }
    const lista = l.match(/^(\d+\.|-)\s/);
    if (lista) {
      const ordenada = lista[1] !== '-';
      const items = [];
      for (; i < lineas.length && /^(\d+\.|-)\s/.test(lineas[i]); i++) items.push(lineas[i].replace(/^(\d+\.|-)\s/, ''));
      html.push(`<${ordenada ? 'ol' : 'ul'}>${items.map((x) => `<li>${enLinea(x)}</li>`).join('')}</${ordenada ? 'ol' : 'ul'}>`); continue;
    }
    const parrafo = [];
    for (; i < lineas.length && lineas[i].trim() && !/^(#|\||>|```|!\[|\d+\.\s|-\s)/.test(lineas[i]); i++) parrafo.push(lineas[i]);
    html.push(`<p>${enLinea(parrafo.join(' '))}</p>`);
  }
  return html.join('\n');
}

const CSS = `
  @page { size: A4; margin: 16mm 16mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.45; color: #0A1F2E; margin: 0; }
  h1 { font-size: 18pt; color: #0B3C5D; margin: 0 0 4pt; line-height: 1.2; }
  h1 + p { color: #1F4A66; margin-top: 0; }
  h2 { font-size: 13pt; color: #0B3C5D; margin: 16pt 0 6pt; border-bottom: 1px solid #C7D9E5; padding-bottom: 3pt; break-after: avoid; }
  h3 { font-size: 11pt; color: #0B3C5D; margin: 12pt 0 4pt; break-after: avoid; }
  p { margin: 0 0 7pt; }
  code { font-family: Consolas, monospace; font-size: 8.8pt; color: #0B3C5D; background: #EAF3FC; padding: 0 2pt; border-radius: 2pt; }
  pre { font-family: Consolas, monospace; font-size: 8.5pt; background: #F4F8FB; border: 1px solid #C7D9E5; padding: 7pt 9pt; border-radius: 4pt; white-space: pre-wrap; break-inside: avoid; }
  blockquote { margin: 6pt 0 9pt; padding: 5pt 10pt; border-left: 3pt solid #0B3C5D; background: #F4F8FB; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 4pt 0 10pt; font-size: 8.6pt; line-height: 1.35; }
  th { background: #DCEAF3; color: #0A1F2E; text-align: left; }
  th, td { border: 0.6pt solid #B8CDDA; padding: 4pt 5pt; vertical-align: top; }
  tr { break-inside: avoid; }
  tbody tr:nth-child(even) td { background: #F7FAFC; }
  ul, ol { margin: 0 0 8pt 16pt; padding: 0; } li { margin-bottom: 3pt; }
  figure { margin: 6pt 0 12pt; break-inside: avoid; text-align: center; }
  figure img { max-width: 100%; max-height: 112mm; border: 0.6pt solid #C7D9E5; border-radius: 3pt; }
  figure.movil img { max-height: 118mm; }
  figcaption { font-size: 8.3pt; font-style: italic; color: #0B3C5D; margin-top: 3pt; }
  .fila { display: flex; gap: 10mm; justify-content: center; break-inside: avoid; }
  .fila figure { flex: 0 1 auto; margin: 6pt 0 12pt; }
  a { color: #0B3C5D; }
`;

const pie = `<div style="font-family:Arial;font-size:7.5px;width:100%;padding:0 16mm;color:#4F7A96;display:flex;justify-content:space-between">
  <span>Loard Construcciones · Hito 2 · HU-M03 y HU-M04</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`;

const temporal = mkdtempSync(join(tmpdir(), 'loard-pdf-'));
const pagina = await abrirEdge({ puerto: 9337 });
try {
  for (const md of DOCUMENTOS) {
    const titulo = readFileSync(md, 'utf8').match(/^#\s+(.*)$/m)?.[1] ?? basename(md);
    const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><base href="${pathToFileURL(dirname(md) + '/').href}">
      <title>${escapar(titulo)}</title><style>${CSS}</style></head><body>${markdownAHtml(readFileSync(md, 'utf8'))}</body></html>`;
    const archivoHtml = join(temporal, `${basename(md, '.md')}.html`);
    writeFileSync(archivoHtml, html);
    await pagina.ir(pathToFileURL(archivoHtml).href);
    await pagina.js(`await Promise.all([...document.images].map(i => i.complete ? null : new Promise(r => { i.onload = i.onerror = r; })))`);
    const { data } = await pagina.enviar('Page.printToPDF', {
      printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true,
      headerTemplate: '<span></span>', footerTemplate: pie,
    });
    const salida = md.replace(/\.md$/, '.pdf');
    writeFileSync(salida, Buffer.from(data, 'base64'));
    console.log('✓', salida.slice(HITO.length + 1));
  }
} finally {
  await pagina.cerrar();
  rmSync(temporal, { recursive: true, force: true });
}
