interface Tokens { access: string; refresh: string }
const TOKEN_KEY = 'loard_session';
let refreshRequest: Promise<boolean> | null = null;

function readTokens(): Tokens | null {
  try {
    return JSON.parse(sessionStorage.getItem(TOKEN_KEY) || 'null') as Tokens | null;
  } catch {
    return null;
  }
}

export function saveTokens(tokens: Tokens) {
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function hasSession() { return Boolean(readTokens()); }

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

function errorMessage(value: unknown): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(errorMessage).join(' ');
  if (value && typeof value === 'object') {
    const labels: Record<string, string> = {
      project: 'Proyecto', front: 'Frente', period_start: 'Inicio del periodo', period_end: 'Fin del periodo',
      activities: 'Actividades', activity: 'Actividad', quantity: 'Cantidad', labor: 'Horas-hombre',
      worker: 'Trabajador', hours: 'Horas', supplies: 'Insumos', supply: 'Insumo', notes: 'Observaciones',
      reason: 'Motivo', version: 'Versión', email: 'Correo', password: 'Contraseña', request_id: 'Solicitud',
    };
    return Object.entries(value).map(([key, message]) =>
      `${labels[key] ? `${labels[key]}: ` : ''}${errorMessage(message)}`,
    ).join(' ');
  }
  return 'No fue posible completar la solicitud.';
}

async function refreshSession(): Promise<boolean> {
  const tokens = readTokens();
  if (!tokens) return false;
  const response = await fetch('/api/auth/refresh/', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh }),
  });
  if (!response.ok) return false;
  saveTokens(await response.json() as Tokens);
  return true;
}

export async function api<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const tokens = readTokens();
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json',
        ...(tokens ? { Authorization: `Bearer ${tokens.access}` } : {}), ...options.headers },
    });
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor. Tus campos se conservan. Intenta de nuevo.');
  }
  if (response.status === 401 && tokens && retry && !['/auth/login/', '/auth/refresh/', '/auth/logout/'].includes(path)) {
    refreshRequest ??= refreshSession().finally(() => { refreshRequest = null; });
    if (await refreshRequest) return api<T>(path, options, false);
    clearTokens();
    window.dispatchEvent(new Event('loard-session-expired'));
  }
  if (!response.ok) {
    const data: unknown = await response.json().catch(() => null);
    throw new ApiError(response.status, errorMessage(data));
  }
  return response.status === 204 ? undefined as T : await response.json() as T;
}

export async function login(email: string, password: string) {
  saveTokens(await api<Tokens>('/auth/login/', { method: 'POST', body: JSON.stringify({ email, password }) }));
}

export async function logout() {
  const tokens = readTokens();
  try {
    if (tokens) {
      await api('/auth/logout/', { method: 'POST', body: JSON.stringify({ refresh: tokens.refresh }) });
    }
  } finally {
    clearTokens();
  }
}
