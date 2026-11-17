// Comprobaciones de accesibilidad de HU-M03 y HU-M04 sobre el prototipo en ejecución:
// teclado, foco, tamaños táctiles, avisos para lectores de pantalla y reflujo a 320 px.
// Uso: node "Hito 2/Modulo-I-Prototipo/HU03-HU04/herramientas/verificacion.mjs"
import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirEdge } from './edge.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = resolve(AQUI, '../../../Modulo-III-QC/HU03-HU04/verificacion.json');
const URL_BASE = (process.env.LOARD_URL ?? 'http://127.0.0.1:5174').replace(/\/$/, '');

const p = await abrirEdge({ puerto: 9336 });
const resultados = [];
const anotar = (criterio, comprobacion, cumple, observado) => {
  resultados.push({ criterio, comprobacion, cumple, observado });
  console.log(`${cumple ? '✓' : '✗'} [${criterio}] ${comprobacion} → ${JSON.stringify(observado)}`);
};
const tecla = async (key, code, keyCode, modificadores = 0) => {
  await p.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode, modifiers: modificadores, text: key === 'Enter' ? '\r' : undefined });
  await p.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode, modifiers: modificadores });
};
const ENTER = () => tecla('Enter', 'Enter', 13);
const ESC = () => tecla('Escape', 'Escape', 27);
const TAB = () => tecla('Tab', 'Tab', 9);
const boton = (texto) => `[...document.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === ${JSON.stringify(texto)} || b.textContent.replace(/\\s+/g, ' ').trim() === ${JSON.stringify(texto)})`;
const entrar = async (correo, ruta, reiniciar = false) => {
  await p.ir(`${URL_BASE}/acceso`);
  await p.js(`${reiniciar ? "['loard_prototipo_cortes_v1','loard_prototipo_soportes_v1'].forEach(k => localStorage.removeItem(k));" : ''}
    localStorage.setItem('loard_tema', 'light'); sessionStorage.setItem('loard_prototipo_sesion', JSON.stringify('${correo}'));`);
  await p.ir(`${URL_BASE}${ruta}`);
};

try {
  await p.tamano(1440, 900);

  // ── HU-M03 · Soportes ─────────────────────────────────────────────
  await entrar('residente@loard.demo', '/cortes/ejemplo-3', true);
  await p.js(`const dt = new DataTransfer();
    for (const [r, n, t] of [['/ejemplos/patio-tuberias.jpg','patio-tuberias.jpg','image/jpeg'], [null,'informe.docx','application/msword']])
      dt.items.add(new File([r ? await (await fetch(r)).blob() : new Blob(['x'])], n, { type: t }));
    [...document.querySelectorAll('div')].find(d => d.className.includes('border-dashed')).dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true }));`);
  await p.esperar(400);
  anotar('4.1.3 Mensajes de estado', 'El rechazo de un archivo se anuncia con role="alert"', ...await p.js(`
    const a = [...document.querySelectorAll('[role=alert]')].find(e => e.innerText.includes('informe.docx'));
    return [Boolean(a), a?.innerText.trim()];`));
  anotar('4.1.3 Mensajes de estado', 'El progreso de carga se expone como barra de progreso con valor', ...await p.js(`
    const b = document.querySelector('[role=progressbar]');
    return [Boolean(b && b.getAttribute('aria-valuenow') != null), b && { etiqueta: b.getAttribute('aria-label'), valor: b.getAttribute('aria-valuenow') }];`));
  await p.esperar(4000);

  anotar('2.5.8 Tamaño del objetivo', 'Botones Ver, Quitar y Seleccionar archivos miden al menos 44 × 44 px', ...await p.js(`
    const bs = [...document.querySelectorAll('button')].filter(b => /^(Ver |Quitar |Seleccionar archivos)/.test(b.getAttribute('aria-label') ?? b.innerText));
    const m = bs.map(b => { const r = b.getBoundingClientRect(); return { boton: b.getAttribute('aria-label') ?? b.innerText.trim(), alto: Math.round(r.height), ancho: Math.round(r.width) }; });
    return [m.length > 0 && m.every(x => x.alto >= 44 && x.ancho >= 44), m];`));

  await p.js(`${boton('Ver patio-tuberias.jpg')}.focus()`);
  await ENTER();
  await p.esperar(700);
  anotar('2.4.3 Orden del foco', 'Al abrir el visor con Enter, el foco entra al panel', ...await p.js(`
    const d = document.querySelector('[role=dialog]'); return [Boolean(d && d.contains(document.activeElement)), document.activeElement.getAttribute('aria-label') ?? document.activeElement.innerText];`));
  await ESC();
  await p.esperar(500);
  anotar('2.1.2 Sin trampas de teclado', 'Escape cierra el visor y el foco vuelve a «Ver»', ...await p.js(`
    return [!document.querySelector('[role=dialog]') && document.activeElement.getAttribute('aria-label') === 'Ver patio-tuberias.jpg', document.activeElement.getAttribute('aria-label')];`));

  await p.js(`${boton('Quitar patio-tuberias.jpg')}.focus()`);
  await ENTER();
  await p.esperar(400);
  const oculto = await p.js(`return !${boton('Ver patio-tuberias.jpg')}`);
  await tecla('z', 'KeyZ', 90, 2);
  await p.esperar(400);
  anotar('2.1.1 Teclado', 'Quitar con Enter y deshacer con Ctrl+Z dentro de los 5 segundos', ...await p.js(`
    return [${JSON.stringify(oculto)} && Boolean(${boton('Ver patio-tuberias.jpg')}), { ocultoTrasQuitar: ${JSON.stringify(oculto)}, recuperadoConCtrlZ: Boolean(${boton('Ver patio-tuberias.jpg')}) }];`));

  await entrar('residente@loard.demo', '/cortes/ejemplo-1');
  anotar('3.3.1 Identificación de errores', 'En un corte visado, «Editar corte» explica el bloqueo con aria-describedby', ...await p.js(`
    const b = ${boton('Editar corte')}; const id = b?.getAttribute('aria-describedby');
    const t = id && document.getElementById(id.split(' ')[0])?.innerText;
    return [b?.getAttribute('aria-disabled') === 'true' && Boolean(t), t];`));

  // ── HU-M04 · Revisión del director ────────────────────────────────
  await entrar('director@loard.demo', '/cortes/ejemplo-3');
  await p.js(`${boton('Devolver con observaciones')}.focus()`);
  await ENTER();
  await p.esperar(700);
  anotar('2.4.3 Orden del foco', 'Al abrir «Devolver», el foco queda en el campo de la observación', ...await p.js(`
    return [document.activeElement.tagName === 'TEXTAREA', document.activeElement.labels?.[0]?.innerText];`));
  anotar('3.3.2 Etiquetas o instrucciones', '«Confirmar devolución» bloqueado explica cuántos caracteres faltan', ...await p.js(`
    const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.innerText.includes('Confirmar devolución'));
    const t = document.getElementById(b.getAttribute('aria-describedby')?.split(' ')[0] ?? '')?.innerText;
    return [b.getAttribute('aria-disabled') === 'true' && Boolean(t), t];`));
  await p.enviar('Input.insertText', { text: 'Falta soporte fotográfico del frente.' });
  await p.esperar(300);
  anotar('3.3.4 Prevención de errores', 'Con 10 o más caracteres el botón se habilita', ...await p.js(`
    const b = [...document.querySelectorAll('[role=dialog] button')].find(x => x.innerText.includes('Confirmar devolución'));
    return [b.getAttribute('aria-disabled') !== 'true', b.getAttribute('aria-disabled') ?? 'habilitado'];`));
  await ESC();
  await p.esperar(300);
  anotar('3.3.4 Prevención de errores', 'Escape con texto escrito pregunta antes de descartar la observación', ...await p.js(`
    const g = [...document.querySelectorAll('[role=group]')].find(x => x.getAttribute('aria-label')?.includes('Descartar'));
    return [Boolean(g), g?.getAttribute('aria-label')];`));
  await p.js(`[...document.querySelectorAll('[role=dialog] button')].find(b => b.innerText.includes('Descartar observación')).click()`);
  await p.esperar(500);

  await p.js(`${boton('Visar corte')}.focus()`);
  await ENTER();
  await p.esperar(700);
  anotar('3.3.4 Prevención de errores', 'La confirmación de visado abre con el foco en «Cancelar»', ...await p.js(`
    return [document.activeElement.innerText.trim() === 'Cancelar', document.activeElement.innerText.trim()];`));
  for (let i = 0; i < 4; i++) await TAB();
  anotar('2.1.2 Sin trampas de teclado', 'Con Tab el foco recorre el diálogo sin salir de él', ...await p.js(`
    const d = document.querySelector('[role=dialog]'); return [Boolean(d && d.contains(document.activeElement)), document.activeElement.getAttribute('aria-label') ?? document.activeElement.innerText.trim()];`));
  await p.js(`[...document.querySelectorAll('[role=dialog] button')].find(b => b.innerText.includes('Confirmar visado')).focus()`);
  await ENTER();
  await p.esperar(1500);
  anotar('2.4.3 Orden del foco', 'Tras visar, el foco pasa al nuevo estado del corte', ...await p.js(`
    return [document.activeElement.innerText.includes('Visado'), document.activeElement.innerText.trim().slice(0, 40)];`));

  await entrar('director@loard.demo', '/cortes/ejemplo-2');
  anotar('1.3.1 Información y relaciones', 'Un corte ya devuelto no muestra acciones de visado', ...await p.js(`
    return [!${boton('Visar corte')}, Boolean(${boton('Visar corte')}) ? 'visible' : 'sin acciones'];`));

  // Corte en revisión para probar el bloqueo sin señal.
  await entrar('director@loard.demo', '/cortes/ejemplo-3', true);
  await p.js(`document.querySelector('button[aria-label^="Prototipo:"]').click()`);
  await p.esperar(300);
  anotar('3.3.2 Etiquetas o instrucciones', 'Sin señal, Visar y Devolver quedan bloqueados con el motivo enlazado', ...await p.js(`
    const lista = [...document.querySelectorAll('[role=group] button')];
    const motivos = lista.map(b => document.getElementById(b.getAttribute('aria-describedby') ?? '')?.innerText);
    return [lista.length === 2 && lista.every(b => b.getAttribute('aria-disabled') === 'true') && motivos.every(Boolean), motivos[0]];`));

  // ── Reflujo a 320 px (equivale a 1280 px con zoom del 400 %) ───────
  for (const [correo, ruta, nombre] of [['residente@loard.demo', '/cortes/ejemplo-1', 'detalle con soportes'], ['director@loard.demo', '/cortes/ejemplo-3', 'revisión del director'], ['director@loard.demo', '/cortes', 'bandeja del director']]) {
    await p.tamano(320, 640, true, 2);
    await entrar(correo, ruta, ruta === '/cortes/ejemplo-3');
    anotar('1.4.10 Reflujo', `Sin desplazamiento horizontal a 320 px: ${nombre}`, ...await p.js(`
      return [document.documentElement.scrollWidth <= 320, { anchoPagina: document.documentElement.scrollWidth, anchoPantalla: innerWidth }];`));
  }
} finally {
  await p.cerrar();
}

writeFileSync(SALIDA, JSON.stringify({ fecha: new Date().toISOString(), url: URL_BASE, navegador: 'Microsoft Edge sin ventana (Chromium)',
  procedencia: 'Comprobación automática sobre datos de demostración; sin participantes.', resultados }, null, 2));
const fallas = resultados.filter((r) => !r.cumple).length;
console.log(`\n${resultados.length - fallas} de ${resultados.length} comprobaciones cumplen.`);
