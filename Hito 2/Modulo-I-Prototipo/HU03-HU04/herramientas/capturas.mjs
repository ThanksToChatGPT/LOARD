// Toma las capturas de HU-M03 y HU-M04 en escritorio (1440 × 900) y celular (390 × 844).
// Requiere el prototipo corriendo: npm run dev (o la URL en la variable LOARD_URL).
// Uso: node "Hito 2/Modulo-I-Prototipo/HU03-HU04/herramientas/capturas.mjs"
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { abrirEdge } from './edge.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const SALIDA = resolve(AQUI, '../../../Modulo-II-Frontend/HU03-HU04/capturas');
const URL_BASE = (process.env.LOARD_URL ?? 'http://127.0.0.1:5174').replace(/\/$/, '');
const TAMANOS = {
  escritorio: { ancho: 1440, alto: 900, movil: false, escala: 1 },
  movil: { ancho: 390, alto: 844, movil: true, escala: 2 },
};

// Funciones que se inyectan en la página para actuar como una persona.
const AYUDAS = `
  window.__loard = {
    boton(texto) {
      const b = [...document.querySelectorAll('button')].find(x =>
        (x.getAttribute('aria-label') ?? '').trim() === texto || x.innerText.trim() === texto ||
        x.textContent.replace(/\\s+/g, ' ').trim() === texto);
      if (!b) throw new Error('No encontré el botón «' + texto + '»');
      return b;
    },
    ver(selector, margen = 96) {
      const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!el) throw new Error('No encontré ' + selector);
      el.scrollIntoView({ block: 'start' });
      window.scrollBy(0, -margen);
    },
    titulo(texto) {
      return [...document.querySelectorAll('h1, h2')].find(h => h.innerText.trim() === texto);
    },
    async soltar(archivos) {
      const dt = new DataTransfer();
      for (const [ruta, nombre, tipo] of archivos) {
        const datos = ruta ? await (await fetch(ruta)).blob() : new Blob(['ejemplo']);
        dt.items.add(new File([datos], nombre, { type: tipo }));
      }
      const zona = [...document.querySelectorAll('div')].find(d => d.className.includes('border-dashed'));
      zona.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
    },
    escribir(selector, texto) {
      const el = document.querySelector(selector);
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(el, texto);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    senal() { document.querySelector('button[aria-label^="Prototipo:"]').click(); },
  };
`;

async function recorrido(pagina, tamano, guardar) {
  const { esperar } = pagina;
  const js = (codigo) => pagina.js(`${AYUDAS}; const L = window.__loard; ${codigo}`);
  const entrar = async (correo, ruta, { reiniciar = false, tema = 'light' } = {}) => {
    await pagina.ir(`${URL_BASE}/acceso`);
    await js(`
      ${reiniciar ? "['loard_prototipo_cortes_v1','loard_prototipo_soportes_v1','loard_prototipo_dossier_v1'].forEach(k => localStorage.removeItem(k));" : ''}
      localStorage.setItem('loard_tema', '${tema}');
      sessionStorage.setItem('loard_prototipo_sesion', JSON.stringify('${correo}'));`);
    await pagina.ir(`${URL_BASE}${ruta}`);
  };
  const enter = () => pagina.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' })
    .then(() => pagina.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 }));
  const escape = () => pagina.enviar('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
    .then(() => pagina.enviar('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 }));

  await pagina.tamano(tamano.ancho, tamano.alto, tamano.movil, tamano.escala);

  // HU-M03 · Residente: soportes del Corte #08 (empieza sin soportes).
  await entrar('residente@loard.demo', '/cortes/ejemplo-3', { reiniciar: true });
  await js(`await L.soltar([
    ['/ejemplos/patio-tuberias.jpg', 'patio-tuberias.jpg', 'image/jpeg'],
    ['/ejemplos/acta-avance-periodo.pdf', 'acta-avance-corte-08.pdf', 'application/pdf'],
    [null, 'informe.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']]);`);
  await esperar(400);
  await js(`L.ver(L.titulo('Soportes del corte'))`);
  await guardar('soportes-cargando');
  await esperar(4500);
  await js(`L.ver(L.titulo('Soportes del corte'))`);
  await guardar('soportes-cargados');

  await js(`L.senal(); await new Promise(r => setTimeout(r, 300));
    await L.soltar([['/ejemplos/soportes-estacion.jpg', 'soportes-estacion.jpg', 'image/jpeg']]);`);
  await esperar(1200);
  // Se encuadra el archivo en espera para que se lea el aviso «En espera de señal».
  await js(`[...document.querySelectorAll('[role=status]')].find(e => e.innerText.includes('En espera de señal'))
    .scrollIntoView({ block: 'end' }); window.scrollBy(0, 24);`);
  await guardar('soportes-sin-senal');
  await js(`L.senal()`);
  await esperar(4500);

  await js(`L.boton('Quitar acta-avance-corte-08.pdf').click()`);
  await esperar(500);
  await guardar('soportes-deshacer');
  await js(`L.boton('Deshacer').click()`);
  await esperar(400);

  await js(`L.boton('Ver patio-tuberias.jpg').click()`);
  await esperar(900);
  await guardar('visor');
  await escape();
  await esperar(500);

  await entrar('residente@loard.demo', '/cortes/ejemplo-1');
  await guardar('visado-bloqueado');

  // HU-M04 · Director: bandeja, revisión y devolución.
  await entrar('director@loard.demo', '/cortes');
  await guardar('bandeja-director');
  await entrar('director@loard.demo', '/cortes/ejemplo-3');
  await guardar('revision');
  await js(`L.senal()`);
  await esperar(400);
  await js(`window.scrollTo(0, document.body.scrollHeight)`);
  await esperar(300);
  await guardar('revision-sin-senal');
  await js(`L.senal()`);
  await esperar(300);

  await js(`L.boton('Devolver con observaciones').focus()`);
  await enter();
  await esperar(900);
  await guardar('devolucion-foco');
  await js(`L.boton('Desfase en horas-hombre').click(); L.boton('Falta soporte fotográfico').click();`);
  await esperar(400);
  await guardar('devolucion');
  await js(`L.boton('Confirmar devolución').click()`);
  await esperar(1500);
  await js(`window.scrollTo(0, 0)`);
  await guardar('devuelto');

  // HU-M04 · Residente: ve la observación, corrige y reenvía.
  await entrar('residente@loard.demo', '/cortes/ejemplo-3');
  await guardar('aviso-residente');
  await js(`L.boton('Corregir corte').click()`);
  await esperar(900);
  await guardar('correccion');
  // El último campo de texto del formulario es «Motivo de la edición».
  await js(`const t = [...document.querySelectorAll('form textarea')].pop();
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(t, 'Ajusté las horas-hombre y adjunté las fotos del frente.');
    t.dispatchEvent(new Event('input', { bubbles: true }));`);
  await esperar(700);
  await js(`[...document.querySelectorAll('button[type=submit]')].find(b => b.innerText.includes('Guardar')).click()`);
  await esperar(1500);

  // HU-M04 · Director: visa la versión corregida.
  await entrar('director@loard.demo', '/cortes/ejemplo-3');
  await js(`L.boton('Visar corte').focus()`);
  await enter();
  await esperar(900);
  await guardar('visado-confirmacion');
  await js(`[...document.querySelectorAll('[role=dialog] button')].find(b => b.innerText.includes('Confirmar visado')).click()`);
  await esperar(1500);
  await js(`window.scrollTo(0, 0)`);
  await guardar('visado-resultado');
  await js(`L.boton('Historial de versiones').click(); await new Promise(r => setTimeout(r, 400)); L.ver(L.titulo('Cambios del corte'), 150);`);
  await esperar(400);
  await guardar('historial');

  // Tema oscuro: la misma bandeja del director.
  await entrar('director@loard.demo', '/cortes', { tema: 'dark' });
  await guardar('bandeja-director-oscuro');
}

const pagina = await abrirEdge();
mkdirSync(SALIDA, { recursive: true });
const registro = [];
let commit = 'desconocido';
try { commit = execSync('git rev-parse --short HEAD', { cwd: AQUI }).toString().trim(); } catch { /* sin git */ }
try {
  for (const [nombre, tamano] of Object.entries(TAMANOS)) {
    await recorrido(pagina, tamano, async (paso) => {
      const archivo = `${paso}-${nombre}.png`;
      const png = await pagina.captura();
      writeFileSync(join(SALIDA, archivo), png);
      registro.push({ archivo, dimensiones: [tamano.ancho * tamano.escala, tamano.alto * tamano.escala],
        sha256: createHash('sha256').update(png).digest('hex') });
      console.log('✓', archivo);
    });
  }
} finally {
  await pagina.cerrar();
}
writeFileSync(join(SALIDA, 'manifest.json'), JSON.stringify({
  commitAplicacion: commit, fecha: new Date().toISOString(), url: URL_BASE,
  procedencia: 'Capturas automáticas con Microsoft Edge sin ventana, datos de demostración del prototipo; sin participantes.',
  archivos: registro,
}, null, 2));
console.log(`Listo: ${registro.length} capturas en ${SALIDA}`);
