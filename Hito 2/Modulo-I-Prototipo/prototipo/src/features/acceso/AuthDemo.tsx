import { createContext, useContext, useState, type ReactNode } from 'react';

export type RolDemo = 'residente' | 'director' | 'calidad' | 'sst' | 'gerencia';
export interface UsuarioDemo { nombre: string; correo: string; rol: RolDemo; etiqueta: string }
export const CLAVE_DEMO = 'Demo2026!';
export const CUENTAS_DEMO: UsuarioDemo[] = [
  { nombre: 'Mauricio Palacios', correo: 'residente@loard.demo', rol: 'residente', etiqueta: 'Ingeniero Residente' },
  { nombre: 'Yonny Pérez', correo: 'director@loard.demo', rol: 'director', etiqueta: 'Director de Proyectos' },
  { nombre: 'Dilan Castro', correo: 'calidad@loard.demo', rol: 'calidad', etiqueta: 'Coordinación SIG / Calidad' },
  { nombre: 'Laura Gómez', correo: 'sst@loard.demo', rol: 'sst', etiqueta: 'Coordinación SST' },
  { nombre: 'María Rojas', correo: 'gerencia@loard.demo', rol: 'gerencia', etiqueta: 'Gerencia' },
];
const CLAVE_SESION = 'loard_prototipo_sesion';

export function autenticarDemo(correo: string, clave: string): UsuarioDemo {
  const cuenta = CUENTAS_DEMO.find(item => item.correo === correo.trim().toLowerCase());
  if (!cuenta || clave !== CLAVE_DEMO) throw new Error('Revisa el correo y la contraseña de ejemplo.');
  return cuenta;
}

function leerSesion(): UsuarioDemo | null {
  try {
    const correo: unknown = JSON.parse(sessionStorage.getItem(CLAVE_SESION) ?? 'null');
    return CUENTAS_DEMO.find(cuenta => cuenta.correo === correo) ?? null;
  } catch { return null; }
}

interface AuthDemoApi {
  usuario: UsuarioDemo | null;
  ingresar: (correo: string, clave: string) => void;
  salir: () => void;
}
const Contexto = createContext<AuthDemoApi | null>(null);

export function AuthDemoProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioDemo | null>(leerSesion);
  function ingresar(correo: string, clave: string) {
    const cuenta = autenticarDemo(correo, clave);
    sessionStorage.setItem(CLAVE_SESION, JSON.stringify(cuenta.correo));
    setUsuario(cuenta);
  }
  function salir() {
    sessionStorage.removeItem(CLAVE_SESION);
    setUsuario(null);
  }
  return <Contexto.Provider value={{ usuario, ingresar, salir }}>{children}</Contexto.Provider>;
}

export function useAuthDemo() {
  const value = useContext(Contexto);
  if (!value) throw new Error('AuthDemoProvider es obligatorio.');
  return value;
}

export function rutaInicial(usuario: UsuarioDemo) { return usuario.rol === 'sst' ? '/sst' : '/cortes'; }
