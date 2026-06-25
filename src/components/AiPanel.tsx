import { useState } from 'react';
import type { ResumeData } from '../types';
import { generateSummary, quantifyBullet, suggestKeywords, PROMPT_TEMPLATES } from '../lib/ai';
import { validateAiOutput, type ValidationFlag } from '../lib/validation';
import { Button, TextArea, Card } from './ui';

type Mode = 'summary' | 'quantify' | 'keywords';

export function AiPanel({
  data, onApplySummary, onAddBullet,
}: {
  data: ResumeData;
  onApplySummary: (s: string) => void;
  onAddBullet: (b: string) => void;
}) {
  const [mode, setMode] = useState<Mode>('summary');
  const [input, setInput] = useState('');
  const [domain, setDomain] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [flags, setFlags] = useState<ValidationFlag[]>([]);
  const [clarify, setClarify] = useState<string | undefined>();
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const run = async () => {
    setBusy(true);
    setResults([]); setFlags([]); setClarify(undefined); setNeedsConfirm(false);
    // Simulate the backend round-trip latency / rate-limit window.
    await new Promise((r) => setTimeout(r, 450));

    let res;
    if (mode === 'summary') {
      const topSkills = data.skills.map((s) => s.items).filter(Boolean).join(', ');
      res = generateSummary({ level: data.level, role: data.contact.role, domain, topSkills });
    } else if (mode === 'quantify') {
      res = quantifyBullet(input);
    } else {
      res = suggestKeywords(input);
    }

    // Validation pipeline runs on EVERY AI output before it can be saved.
    const allFlags = res.output.flatMap((o) => validateAiOutput(o, data));
    setResults(res.output);
    setFlags(allFlags);
    setClarify(res.clarifyingQuestion);
    setNeedsConfirm(res.needsConfirmation);
    setBusy(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-lg bg-violet-50 px-3 py-2 text-xs text-violet-800">
        <span className="font-semibold">Sonnet 4.6</span> assist · outputs are validated before saving · estimated metrics need your confirmation.
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(['summary', 'quantify', 'keywords'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setResults([]); setFlags([]); setClarify(undefined); }}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${mode === m ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {m === 'summary' ? 'Summary' : m === 'quantify' ? 'Quantify bullet' : 'ATS keywords'}
          </button>
        ))}
      </div>

      {mode === 'summary' && (
        <TextArea label="Target domain / industry" value={domain} onChange={setDomain} rows={2}
          placeholder="e.g. fintech backend, e-commerce, data engineering" />
      )}
      {mode === 'quantify' && (
        <TextArea label="Responsibility to quantify" value={input} onChange={setInput} rows={3}
          placeholder="e.g. Responsible for improving API performance" />
      )}
      {mode === 'keywords' && (
        <TextArea label="Paste the job description (JD)" value={input} onChange={setInput} rows={5}
          placeholder="Paste the JD text here…" />
      )}

      <Button variant="ai" onClick={run} disabled={busy} className="w-full">
        {busy ? 'Generating…' : '✦ Generate with AI'}
      </Button>

      {clarify && (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-xs font-semibold text-amber-800">Clarifying question</p>
          <p className="mt-1 text-sm text-amber-900">{clarify}</p>
        </Card>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {needsConfirm && (
            <p className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
              ⚠ Contains estimated metrics — review and edit before saving. Nothing is saved automatically.
            </p>
          )}
          {flags.map((f, i) => (
            <p key={`f${i}`} className={`rounded-md px-2 py-1 text-xs ${f.level === 'error' ? 'bg-rose-50 text-rose-700' : f.level === 'warn' ? 'bg-amber-50 text-amber-700' : 'bg-sky-50 text-sky-700'}`}>
              {f.level === 'error' ? '⛔' : f.level === 'warn' ? '⚠' : 'ℹ'} {f.message}
            </p>
          ))}
          {results.map((r, i) => (
            <Card key={i} className="flex items-start justify-between gap-2 py-2">
              <p className="text-sm text-slate-700">{r}</p>
              {mode === 'summary' && (
                <Button variant="outline" onClick={() => onApplySummary(r)} className="shrink-0 py-1 text-xs">Use</Button>
              )}
              {mode === 'quantify' && (
                <Button variant="outline" onClick={() => onAddBullet(r)} className="shrink-0 py-1 text-xs">Add</Button>
              )}
            </Card>
          ))}
        </div>
      )}

      <details className="rounded-lg border border-slate-200 bg-slate-50 text-xs">
        <summary className="cursor-pointer px-3 py-2 font-medium text-slate-600">View prompt templates (editable in prod)</summary>
        <div className="space-y-2 px-3 py-2">
          {Object.values(PROMPT_TEMPLATES).map((t) => (
            <div key={t.label}>
              <p className="font-semibold text-slate-700">{t.label}</p>
              <p className="mt-0.5 text-slate-500"><span className="font-mono">system:</span> {t.system}</p>
              <p className="text-slate-500"><span className="font-mono">user:</span> {t.user}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
