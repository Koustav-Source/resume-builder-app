import { useState } from 'react';
import { store } from '../lib/store';
import type { User } from '../types';
import { Button, Field } from './ui';

export function Auth({ onAuth }: { onAuth: (u: User) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      const u = mode === 'signup'
        ? await store.signup(name.trim() || 'User', email.trim(), password)
        : await store.login(email.trim(), password);
      onAuth(u);
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl md:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white md:flex">
          <div>
            <div className="mb-6 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 text-2xl">📄</div>
            <h1 className="text-2xl font-bold leading-tight">ResumeForge India</h1>
            <p className="mt-3 text-sm text-indigo-100">
              ATS-friendly resumes built for Indian recruiters. WYSIWYG editor with pixel-perfect PDF & DOCX download parity.
            </p>
          </div>
          <ul className="space-y-2 text-sm text-indigo-100">
            <li>✓ 6 recruiter-approved templates</li>
            <li>✓ AI assist (summaries, quantified bullets, ATS keywords)</li>
            <li>✓ A4 default · US Letter override</li>
            <li>✓ WCAG AA accessible forms</li>
          </ul>
        </div>

        <div className="p-8">
          <div className="mb-6 flex gap-2">
            <button onClick={() => setMode('signup')} className={`flex-1 rounded-lg py-2 text-sm font-medium ${mode === 'signup' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Sign up</button>
            <button onClick={() => setMode('login')} className={`flex-1 rounded-lg py-2 text-sm font-medium ${mode === 'login' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Log in</button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === 'signup' && <Field label="Full Name" value={name} onChange={setName} placeholder="Ananya Sharma" />}
            <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
            {err && <p className="rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700">{err}</p>}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-slate-400">
            Demo auth (SHA-256, localStorage). Production uses argon2 + encrypted PostgreSQL.
          </p>
        </div>
      </div>
    </div>
  );
}
