import { useState } from 'react';
import type { FormEvent } from 'react';
import { Building2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button, ErrorNotice, Field } from '../../components/ui';
import { useAuth } from './AuthProvider';

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try { await signIn(email, password); }
    catch (failure) { setError(failure); }
    finally { setBusy(false); }
  }
  return <main className="login-page">
    <section className="login-brand">
      <div className="brand"><span className="brand-icon"><Building2 /></span><div>LOARD<span>CONSTRUCCIONES S.A.S.</span></div></div>
      <div className="login-intro"><p className="eyebrow">OPERACIÓN Y CONTROL DE OBRA</p>
        <h1>Cada avance,<br />con respaldo.</h1>
        <p>Registra la ejecución de obra y conserva la trazabilidad de cada corte.</p>
      </div>
      <div className="login-foot"><ShieldCheck size={18} /> Acceso corporativo por roles</div>
    </section>
    <section className="login-form-panel"><form onSubmit={submit} className="login-form">
      <p className="eyebrow">BIENVENIDO A LOARD</p><h2>Iniciar sesión</h2>
      <p className="muted">Ingresa con tu cuenta de trabajo.</p>
      <ErrorNotice error={error} />
      <Field label="Correo electrónico"><input type="email" autoComplete="username" required value={email}
        onChange={event => setEmail(event.target.value)} placeholder="nombre@empresa.com" /></Field>
      <Field label="Contraseña"><input type="password" autoComplete="current-password" required value={password}
        onChange={event => setPassword(event.target.value)} /></Field>
      <Button type="submit" busy={busy}>{busy ? 'Ingresando…' : 'Ingresar'}<ArrowRight size={16} /></Button>
      <p className="login-help">Para crear o recuperar tu cuenta, contacta al administrador del sistema.</p>
    </form></section>
  </main>;
}
