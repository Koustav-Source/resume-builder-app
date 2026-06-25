import { useState, useMemo } from 'react';
import type { ResumeData, SectionConfig } from '../types';
import { runAtsCheck } from '../lib/validation';
import { TextArea } from './ui';

export function AtsPanel({ data, sections }: { data: ResumeData; sections: SectionConfig[] }) {
  const [jd, setJd] = useState('');
  const report = useMemo(() => runAtsCheck(data, sections, jd), [data, sections, jd]);

  const ring = report.score >= 85 ? '#16a34a' : report.score >= 70 ? '#d97706' : '#dc2626';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0">
          <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={ring} strokeWidth="3"
              strokeDasharray={`${report.score} 100`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-slate-800">{report.score}</span>
            <span className="text-[9px] text-slate-400">ATS</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">ATS Compliance</p>
          <p className="text-xs text-slate-500">{report.issues.length} issue(s), {report.passed.length} check(s) passed.</p>
        </div>
      </div>

      <TextArea label="Paste target JD to match keywords" rows={4} value={jd} onChange={setJd}
        placeholder="Paste the job description to compute keyword gaps…" />

      {report.missingKeywords.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-semibold text-slate-600">Missing keywords</p>
          <div className="flex flex-wrap gap-1.5">
            {report.missingKeywords.map((k) => (
              <span key={k} className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-700">{k}</span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {report.issues.map((f, i) => (
          <p key={`i${i}`} className={`rounded-md px-2 py-1 text-xs ${f.level === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
            {f.level === 'error' ? '⛔' : '⚠'} {f.message}
          </p>
        ))}
        {report.passed.map((f, i) => (
          <p key={`p${i}`} className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700">✓ {f.message}</p>
        ))}
      </div>
    </div>
  );
}
