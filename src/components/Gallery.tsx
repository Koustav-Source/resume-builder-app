import { TEMPLATES } from '../data/templates';
import type { ResumeProject, User } from '../types';
import { FRESHER, SENIOR, makeProject, emptyResume } from '../data/samples';
import { Button } from './ui';

export function Gallery({
  user, projects, onOpen, onCreate, onDelete, onLogout, onAccount,
}: {
  user: User;
  projects: ResumeProject[];
  onOpen: (p: ResumeProject) => void;
  onCreate: (p: ResumeProject) => void;
  onDelete: (id: string) => void;
  onLogout: () => void;
  onAccount: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-xl">📄</span>
          <span className="font-bold text-slate-800">ResumeForge India</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="hidden text-slate-500 sm:inline">Hi, {user.name}</span>
          <Button variant="ghost" onClick={onAccount}>Account & Privacy</Button>
          <Button variant="outline" onClick={onLogout}>Log out</Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-6 py-8">
        {/* Saved projects */}
        {projects.length > 0 && (
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-800">Your resumes</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div>
                    <p className="font-medium text-slate-800">{p.title}</p>
                    <p className="text-xs text-slate-400">Updated {new Date(p.updatedAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button onClick={() => onOpen(p)}>Open</Button>
                    <Button variant="danger" onClick={() => onDelete(p.id)} title="Delete">✕</Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick starts */}
        <section>
          <h2 className="mb-1 text-lg font-semibold text-slate-800">Start a new resume</h2>
          <p className="mb-3 text-sm text-slate-500">Pick a template, then fill → preview → customize → download.</p>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onCreate(makeProject('Fresher Sample', FRESHER, 'fresher-focus'))}>
              ⚡ Load Fresher (CS Grad) sample
            </Button>
            <Button variant="outline" onClick={() => onCreate(makeProject('Senior SDE Sample', SENIOR, 'tech-compact'))}>
              ⚡ Load Senior SDE sample
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => onCreate(makeProject(`${t.name} Resume`, emptyResume(), t.id))}
                className="group rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <TemplateThumb id={t.id} accent={t.palette[0]} />
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{t.name}</span>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">ATS {t.atsScore}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{t.tagline}</p>
                <p className="mt-1 text-[10px] text-slate-400">{t.columns === 2 ? 'Two-column' : 'Single column'}</p>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

// Tiny CSS skeleton thumbnail — no image assets needed.
function TemplateThumb({ id, accent }: { id: string; accent: string }) {
  const twoCol = id === 'modern-sidebar' || id === 'executive-two';
  const band = id === 'executive-two';
  return (
    <div className="aspect-[1/1.3] overflow-hidden rounded-md border border-slate-200 bg-white p-2">
      {band ? (
        <div className="-mx-2 -mt-2 mb-1 px-2 py-1.5" style={{ background: accent }}>
          <div className="h-1.5 w-2/3 rounded bg-white/80" />
          <div className="mt-1 h-1 w-1/2 rounded bg-white/50" />
        </div>
      ) : (
        <div className="mb-1.5 text-center">
          <div className="mx-auto h-1.5 w-1/2 rounded" style={{ background: accent }} />
          <div className="mx-auto mt-1 h-1 w-2/3 rounded bg-slate-300" />
        </div>
      )}
      {twoCol ? (
        <div className="flex gap-1.5">
          <div className="w-1/3 space-y-1 rounded p-1" style={{ background: `${accent}14` }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-1 rounded bg-slate-300" />)}
          </div>
          <div className="flex-1 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-1 rounded bg-slate-200" style={{ width: `${70 + (i % 3) * 10}%` }} />)}
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="h-1.5 w-1/3 rounded" style={{ background: accent }} />
          {Array.from({ length: 9 }).map((_, i) => <div key={i} className="h-1 rounded bg-slate-200" style={{ width: `${65 + (i % 4) * 9}%` }} />)}
        </div>
      )}
    </div>
  );
}
