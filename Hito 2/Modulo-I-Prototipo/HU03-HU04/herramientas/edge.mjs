// Controla Microsoft Edge sin ventana mediante el protocolo de depuración (CDP).
// Solo usa Node.js 22+ (fetch y WebSocket incluidos); no instala dependencias.
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const RUTAS_EDGE = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

export async function abrirEdge({ puerto = 9333 } = {}) {
  const perfil = mkdtempSync(join(tmpdir(), 'loard-edge-'));
  const ejecutable = process.env.EDGE ?? RUTAS_EDGE.find((r) => existsSync(r));
  if (!ejecutable) throw new Error('No se encontró Microsoft Edge. Indica su ruta en la variable EDGE.');
  const proceso = spawn(ejecutable, [
    '--headless=new', `--remote-debugging-port=${puerto}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--hide-scrollbars', 'about:blank',
  ], { stdio: 'ignore' });

  let destino;
  for (let i = 0; i < 50 && !destino; i++) {
    await esperar(200);
    try {
      const r = await fetch(`http://127.0.0.1:${puerto}/json/new?about:blank`, { method: 'PUT' });
      if (r.ok) destino = await r.json();
    } catch { /* Edge todavía no responde */ }
  }
  if (!destino) throw new Error('Edge no respondió en el puerto de depuración.');

  const ws = new WebSocket(destino.webSocketDebuggerUrl);
  await new Promise((ok, mal) => { ws.onopen = ok; ws.onerror = mal; });
  let id = 0;
  const pendientes = new Map();
  const oyentes = new Map();
  ws.onmessage = ({ data }) => {
    const msg = JSON.parse(data);
    if (msg.id && pendientes.has(msg.id)) {
      const { ok, mal } = pendientes.get(msg.id);
      pendientes.delete(msg.id);
      msg.error ? mal(new Error(`${msg.error.message}`)) : ok(msg.result);
    } else if (msg.method && oyentes.has(msg.method)) {
      oyentes.get(msg.method).forEach((f) => f(msg.params));
      oyentes.delete(msg.method);
    }
  };
  const enviar = (method, params = {}) => new Promise((ok, mal) => {
    const n = ++id;
    pendientes.set(n, { ok, mal });
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const una = (method) => new Promise((ok) => {
    oyentes.set(method, [...(oyentes.get(method) ?? []), ok]);
  });

  await enviar('Page.enable');
  await enviar('Runtime.enable');

  const pagina = {
    enviar,
    async tamano(ancho, alto, movil = false, escala = 1) {
      await enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: escala, mobile: movil });
      await enviar('Emulation.setTouchEmulationEnabled', { enabled: movil, maxTouchPoints: movil ? 5 : 1 });
    },
    async ir(url) {
      const cargada = una('Page.loadEventFired');
      await enviar('Page.navigate', { url });
      await cargada;
      await esperar(700);
    },
    async js(codigo) {
      const r = await enviar('Runtime.evaluate', { expression: `(async () => { ${codigo} })()`, awaitPromise: true, returnByValue: true });
      if (r.exceptionDetails) throw new Error(`Error en la página: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`);
      return r.result.value;
    },
    async tecla(key, code = key, keyCode = 0) {
      for (const type of ['keyDown', 'keyUp']) {
        await enviar('Input.dispatchKeyEvent', { type, key, code, windowsVirtualKeyCode: keyCode });
      }
    },
    async captura() {
      const { data } = await enviar('Page.captureScreenshot', { format: 'png' });
      return Buffer.from(data, 'base64');
    },
    async pdf() {
      const { data } = await enviar('Page.printToPDF', {
        printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false,
      });
      return Buffer.from(data, 'base64');
    },
    esperar,
    async cerrar() {
      ws.close();
      proceso.kill();
      await esperar(500);
      try { rmSync(perfil, { recursive: true, force: true }); } catch { /* Edge puede tardar en soltar el perfil */ }
    },
  };
  return pagina;
}
