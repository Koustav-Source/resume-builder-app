import type { ResumeData, SectionConfig, ThemeConfig, SectionKey } from '../types';
import { uid } from '../data/samples';
import { Field, TextArea, Button, Collapsible } from './ui';
import { AiPanel } from './AiPanel';

interface Props {
  data: ResumeData;
  setData: (updater: (d: ResumeData) => ResumeData) => void;
  sections: SectionConfig[];
  setSections: (s: SectionConfig[]) => void;
  theme: ThemeConfig;
}

export function Editor({ data, setData, sections, setSections }: Props) {
  const patch = (p: Partial<ResumeData>) => setData((d) => ({ ...d, ...p }));
  const patchContact = (p: Partial<ResumeData['contact']>) =>
    setData((d) => ({ ...d, contact: { ...d.contact, ...p } }));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...sections];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setSections(next);
  };
  const toggle = (key: SectionKey) =>
    setSections(sections.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)));

  return (
    <div className="space-y-3">
      {/* Contact */}
      <Collapsible title="Contact Header">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name" value={data.contact.name} onChange={(v) => patchContact({ name: v })} />
          <Field label="Target Role" value={data.contact.role} onChange={(v) => patchContact({ role: v })} />
          <Field label="Email" type="email" value={data.contact.email} onChange={(v) => patchContact({ email: v })} />
          <Field label="Phone" value={data.contact.phone} onChange={(v) => patchContact({ phone: v })} />
          <Field label="Location (City, State)" value={data.contact.location} onChange={(v) => patchContact({ location: v })} placeholder="Bengaluru, Karnataka" />
          <Field label="LinkedIn" value={data.contact.linkedin} onChange={(v) => patchContact({ linkedin: v })} />
          <Field label="GitHub" value={data.contact.github} onChange={(v) => patchContact({ github: v })} />
          <Field label="Portfolio" value={data.contact.portfolio} onChange={(v) => patchContact({ portfolio: v })} />
        </div>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Experience Level (tunes AI tone)</span>
          <select
            value={data.level}
            onChange={(e) => patch({ level: e.target.value as ResumeData['level'] })}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="fresher">Fresher</option>
            <option value="mid">Mid-level</option>
            <option value="senior">Senior</option>
          </select>
        </label>
      </Collapsible>

      {/* AI assistant */}
      <Collapsible title="✦ AI Assistant" defaultOpen={false}>
        <AiPanel
          data={data}
          onApplySummary={(s) => patch({ summary: s })}
          onAddBullet={(b) => setData((d) => {
            const exp = [...d.experience];
            if (exp.length) exp[0] = { ...exp[0], bullets: [...exp[0].bullets, b] };
            return { ...d, experience: exp };
          })}
        />
      </Collapsible>

      {/* Summary */}
      <Collapsible title="Professional Summary">
        <TextArea label="2–3 line summary" rows={4} value={data.summary} onChange={(v) => patch({ summary: v })} />
      </Collapsible>

      {/* Skills */}
      <Collapsible title="Key Skills">
        {data.skills.map((s, i) => (
          <div key={s.id} className="flex items-end gap-2">
            <div className="w-1/3"><Field label="Category" value={s.category} onChange={(v) => updateArr('skills', i, { category: v })} /></div>
            <div className="flex-1"><Field label="Items (comma separated)" value={s.items} onChange={(v) => updateArr('skills', i, { items: v })} /></div>
            <Button variant="danger" onClick={() => removeArr('skills', i)} title="Remove">✕</Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => addArr('skills', { id: uid(), category: '', items: '' })}>+ Add skill group</Button>
      </Collapsible>

      {/* Experience */}
      <Collapsible title="Work Experience">
        {data.experience.map((e, i) => (
          <div key={e.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Company" value={e.company} onChange={(v) => updateArr('experience', i, { company: v })} />
              <Field label="City, State" value={e.city} onChange={(v) => updateArr('experience', i, { city: v })} />
              <Field label="Role" value={e.role} onChange={(v) => updateArr('experience', i, { role: v })} />
              <div className="grid grid-cols-2 gap-2">
                <Field label="Start" value={e.start} onChange={(v) => updateArr('experience', i, { start: v })} placeholder="Jun 2021" />
                <Field label="End" value={e.end} onChange={(v) => updateArr('experience', i, { end: v })} placeholder="Present" />
              </div>
            </div>
            <BulletEditor
              bullets={e.bullets}
              onChange={(b) => updateArr('experience', i, { bullets: b })}
            />
            <Button variant="danger" onClick={() => removeArr('experience', i)}>Remove experience</Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => addArr('experience', { id: uid(), company: '', city: '', role: '', start: '', end: '', bullets: [''] })}>+ Add experience</Button>
      </Collapsible>

      {/* Projects */}
      <Collapsible title="Projects" defaultOpen={false}>
        {data.projects.map((p, i) => (
          <div key={p.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Project name" value={p.name} onChange={(v) => updateArr('projects', i, { name: v })} />
              <Field label="Tech stack" value={p.tech} onChange={(v) => updateArr('projects', i, { tech: v })} />
              <Field label="Link" value={p.link} onChange={(v) => updateArr('projects', i, { link: v })} />
            </div>
            <BulletEditor bullets={p.bullets} onChange={(b) => updateArr('projects', i, { bullets: b })} />
            <Button variant="danger" onClick={() => removeArr('projects', i)}>Remove project</Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => addArr('projects', { id: uid(), name: '', tech: '', link: '', bullets: [''] })}>+ Add project</Button>
      </Collapsible>

      {/* Education */}
      <Collapsible title="Education">
        {data.education.map((e, i) => (
          <div key={e.id} className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-3">
            <Field label="Degree" value={e.degree} onChange={(v) => updateArr('education', i, { degree: v })} />
            <Field label="Institute" value={e.institute} onChange={(v) => updateArr('education', i, { institute: v })} />
            <Field label="City, State" value={e.city} onChange={(v) => updateArr('education', i, { city: v })} />
            <Field label="Year" value={e.year} onChange={(v) => updateArr('education', i, { year: v })} />
            <Field label="Score (CGPA/%)" value={e.score} onChange={(v) => updateArr('education', i, { score: v })} />
            <div className="col-span-2"><Button variant="danger" onClick={() => removeArr('education', i)}>Remove</Button></div>
          </div>
        ))}
        <Button variant="outline" onClick={() => addArr('education', { id: uid(), degree: '', institute: '', city: '', year: '', score: '' })}>+ Add education</Button>
      </Collapsible>

      {/* Internships */}
      <Collapsible title="Internships" defaultOpen={false}>
        {data.internships.map((it, i) => (
          <div key={it.id} className="space-y-2 rounded-lg border border-slate-200 p-3">
            <Field label="Title" value={it.title} onChange={(v) => updateArr('internships', i, { title: v })} />
            <TextArea label="Detail" rows={2} value={it.detail} onChange={(v) => updateArr('internships', i, { detail: v })} />
            <Button variant="danger" onClick={() => removeArr('internships', i)}>Remove</Button>
          </div>
        ))}
        <Button variant="outline" onClick={() => addArr('internships', { id: uid(), title: '', detail: '' })}>+ Add internship</Button>
      </Collapsible>

      {/* Certifications */}
      <Collapsible title="Certifications" defaultOpen={false}>
        {data.certifications.map((c, i) => (
          <div key={c.id} className="grid grid-cols-3 gap-2 rounded-lg border border-slate-200 p-3">
            <Field label="Name" value={c.name} onChange={(v) => updateArr('certifications', i, { name: v })} />
            <Field label="Issuer" value={c.issuer} onChange={(v) => updateArr('certifications', i, { issuer: v })} />
            <Field label="Year" value={c.year} onChange={(v) => updateArr('certifications', i, { year: v })} />
            <div className="col-span-3"><Button variant="danger" onClick={() => removeArr('certifications', i)}>Remove</Button></div>
          </div>
        ))}
        <Button variant="outline" onClick={() => addArr('certifications', { id: uid(), name: '', issuer: '', year: '' })}>+ Add certification</Button>
      </Collapsible>

      {/* Achievements */}
      <Collapsible title="Achievements" defaultOpen={false}>
        {data.achievements.map((a, i) => (
          <div key={a.id} className="grid grid-cols-2 gap-2 rounded-lg border border-slate-200 p-3">
            <Field label="Title" value={a.title} onChange={(v) => updateArr('achievements', i, { title: v })} />
            <Field label="Detail" value={a.detail} onChange={(v) => updateArr('achievements', i, { detail: v })} />
            <div className="col-span-2"><Button variant="danger" onClick={() => removeArr('achievements', i)}>Remove</Button></div>
          </div>
        ))}
        <Button variant="outline" onClick={() => addArr('achievements', { id: uid(), title: '', detail: '' })}>+ Add achievement</Button>
      </Collapsible>

      {/* Section ordering & toggles */}
      <Collapsible title="Section Order & Visibility" defaultOpen={false}>
        <p className="text-xs text-slate-500">Reorder sections (DOM order preserved for ATS) and toggle optional ones.</p>
        <ul className="space-y-1.5">
          {sections.map((s, i) => (
            <li key={s.key} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={s.enabled} onChange={() => toggle(s.key)} className="h-4 w-4 accent-indigo-600" />
                {s.label}
              </label>
              <div className="flex gap-1">
                <Button variant="ghost" onClick={() => move(i, -1)} title="Move up" className="px-2 py-1">↑</Button>
                <Button variant="ghost" onClick={() => move(i, 1)} title="Move down" className="px-2 py-1">↓</Button>
              </div>
            </li>
          ))}
        </ul>
      </Collapsible>
    </div>
  );

  // ---- helpers for array sections -----------------------------------------
  function updateArr<K extends keyof ResumeData>(key: K, idx: number, p: object) {
    setData((d) => {
      const arr = [...(d[key] as unknown as object[])];
      arr[idx] = { ...arr[idx], ...p };
      return { ...d, [key]: arr } as ResumeData;
    });
  }
  function addArr<K extends keyof ResumeData>(key: K, item: object) {
    setData((d) => ({ ...d, [key]: [...(d[key] as unknown as object[]), item] } as ResumeData));
  }
  function removeArr<K extends keyof ResumeData>(key: K, idx: number) {
    setData((d) => ({ ...d, [key]: (d[key] as unknown as object[]).filter((_, i) => i !== idx) } as ResumeData));
  }
}

function BulletEditor({ bullets, onChange }: { bullets: string[]; onChange: (b: string[]) => void }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-xs font-medium text-slate-600">Bullets</span>
      {bullets.map((b, i) => (
        <div key={i} className="flex items-start gap-2">
          <textarea
            rows={2}
            value={b}
            onChange={(e) => onChange(bullets.map((x, j) => (j === i ? e.target.value : x)))}
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="Quantified achievement…"
          />
          <Button variant="danger" onClick={() => onChange(bullets.filter((_, j) => j !== i))} className="px-2 py-1">✕</Button>
        </div>
      ))}
      <Button variant="ghost" onClick={() => onChange([...bullets, ''])} className="text-xs">+ Add bullet</Button>
    </div>
  );
}
