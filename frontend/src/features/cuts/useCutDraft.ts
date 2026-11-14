import { useEffect, useState } from 'react';
import type { CutForm } from '../../lib/types';

interface Draft { schema: 1; updatedAt: string; form: CutForm }

function readDraft(key: string): Draft | null {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null') as Draft | null;
    if (!value || value.schema !== 1 || !value.form || !value.updatedAt) return null;
    const form = value.form;
    if (typeof form.request_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(form.request_id)) return null;
    if (!Array.isArray(form.activities) || !Array.isArray(form.labor) || !Array.isArray(form.supplies)) return null;
    if (!form.activities.every(row => Number.isInteger(row.activity) && typeof row.quantity === 'string') ||
        !form.labor.every(row => Number.isInteger(row.worker) && typeof row.hours === 'string') ||
        !form.supplies.every(row => Number.isInteger(row.supply) && typeof row.quantity === 'string')) return null;
    if (typeof form.period_start !== 'string' || typeof form.period_end !== 'string' || typeof form.notes !== 'string' ||
        !Number.isInteger(form.project) || !Number.isInteger(form.front)) return null;
    return value;
  } catch { return null; }
}

export function useCutDraft(key: string, form: CutForm, dirty: boolean) {
  const [pending, setPending] = useState(() => readDraft(key));
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!dirty || pending) return;
    function persist() {
      try {
        const updatedAt = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify({ schema: 1, updatedAt, form } satisfies Draft));
        setMessage(`Borrador guardado localmente a las ${new Date(updatedAt).toLocaleTimeString('es-CO')}`);
      } catch { setMessage('El navegador no permitió guardar el borrador local. Conserva esta pestaña abierta.'); }
    }
    const timer = window.setTimeout(persist, 500);
    window.addEventListener('beforeunload', persist);
    window.addEventListener('pagehide', persist);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeunload', persist);
      window.removeEventListener('pagehide', persist);
    };
  }, [key, form, dirty, pending]);

  function discard() {
    try { localStorage.removeItem(key); } catch { /* Storage can be disabled by browser policy. */ }
    setPending(null);
    setMessage('');
  }
  return { pending, message, discard, resume: () => setPending(null) };
}
