import { Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Banner, Button, Select, TextField } from '@/components';
import { CLAVE_DEMO, CUENTAS_DEMO, rutaInicial, useAuthDemo } from './AuthDemo';

export function Acceso() {
  const { usuario, ingresar } = useAuthDemo();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(CUENTAS_DEMO[0].correo);
  const [correo, setCorreo] = useState(CUENTAS_DEMO[0].correo);
  const [clave, setClave] = useState(CLAVE_DEMO);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  if (usuario) return <Navigate to={rutaInicial(usuario)} replace />;

  async function entrar(event: FormEvent) {
    event.preventDefault();
    if (cargando) return;
    setError('');
    setCargando(true);
    await new Promise(resolve => window.setTimeout(resolve, 400));
    try {
      ingresar(correo, clave);
      navigate('/', { replace: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No fue posible abrir la sesión de ejemplo.');
    } finally { setCargando(false); }
  }

  return <main className="demo-login">
    <section className="demo-login-brand sf-nav">
      <div className="flex items-center gap-gutter-sm text-title-lg"><Building2 className="h-7 w-7" />LOARD CONSTRUCCIONES S.A.S.</div>
      <div className="flex flex-col gap-gutter-lg"><p className="text-label-sm uppercase tracking-widest">Operaciones y calidad</p>
        <h1 className="text-display-lg-mobile tablet:text-display-lg">Cada avance de obra,<br />con trazabilidad.</h1>
        <p className="max-w-sm text-body-lg">Registra cantidades, horas e insumos y consulta el historial de cada corte.</p>
      </div>
      <p className="flex items-center gap-gutter-sm text-body-sm"><ShieldCheck className="h-5 w-5" />Prototipo de alta fidelidad · Datos de ejemplo</p>
    </section>
    <section className="demo-login-form"><form className="flex w-full max-w-md flex-col gap-gutter-lg" onSubmit={entrar}>
      <div><h2 className="text-headline-lg">Iniciar sesión</h2><p className="mt-gutter-sm text-body-md text-on-surface-muted">Elige una cuenta para recorrer las pantallas de su rol.</p></div>
      <Select label="Perfil de ejemplo" value={perfil} options={CUENTAS_DEMO.map(cuenta => ({ value: cuenta.correo, label: cuenta.etiqueta }))}
        onChange={event => { setPerfil(event.target.value); setCorreo(event.target.value); setClave(CLAVE_DEMO); setError(''); }} />
      <Banner tone="info">Correo de ejemplo: <strong>{perfil}</strong><br />Contraseña de ejemplo: <strong>{CLAVE_DEMO}</strong></Banner>
      <TextField label="Correo electrónico" type="email" autoComplete="off" required value={correo} onChange={event => setCorreo(event.target.value)} />
      <TextField label="Contraseña" type="password" autoComplete="off" required value={clave} onChange={event => setClave(event.target.value)} />
      {error && <Banner tone="error" title="No se pudo iniciar sesión">{error}</Banner>}
      <Button type="submit" size="field" fullWidth loading={cargando} loadingText="Ingresando…" icon={<ArrowRight className="h-4 w-4" />}>Ingresar</Button>
    </form></section>
  </main>;
}
