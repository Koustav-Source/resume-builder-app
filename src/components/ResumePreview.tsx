import { forwardRef } from 'react';
import type { ResumeData, SectionConfig, ThemeConfig, SectionKey } from '../types';

// ---------------------------------------------------------------------------
// The single source of truth for resume layout. The SAME component renders the
// on-screen preview and is the node captured for PDF/print — guaranteeing
// download parity. Six template ids switch sub-layouts; all keep logical DOM
// order (header → summary → skills → experience → ...) for ATS parsing.
// ---------------------------------------------------------------------------

interface Props {
  data: ResumeData;
  theme: ThemeConfig;
  sections: SectionConfig[];
}

const SCALE = { compact: 0.86, normal: 1, roomy: 1.12 } as const;

function useVars(theme: ThemeConfig): React.CSSProperties {
  const s = SCALE[theme.fontScale];
  return {
    // Use px-based typography tokens for more stable html2canvas text metrics.
    ['--accent' as string]: theme.accent,
    ['--fs-base' as string]: `${14 * s}px`,
    ['--fs-name' as string]: `${29 * s}px`,
    ['--fs-role' as string]: `${16 * s}px`,
    ['--fs-section' as string]: `${14.75 * s}px`,
    ['--lh' as string]: '1.4',
    ['--gap' as string]: `${10 * s}px`,
    fontFamily:
      theme.fontFamily === 'serif'
        ? "'Georgia', 'Times New Roman', serif"
        : "'Inter', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  };
}

function ContactLine({ data }: { data: ResumeData }) {
  const c = data.contact;
  const parts = [c.phone, c.email, c.location, c.linkedin, c.github, c.portfolio].filter(Boolean);
  return (
    <div className="rp-contact">
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span className="rp-sep"> • </span>}
          {p}
        </span>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rp-section">
      <h2 className="rp-h2">{title}</h2>
      {children}
    </section>
  );
}

function bullets(items: string[]) {
  const filtered = items.filter((b) => b.trim());
  if (!filtered.length) return null;
  return (
    <ul className="rp-ul">
      {filtered.map((b, i) => <li key={i}>{b}</li>)}
    </ul>
  );
}

// Body sections shared across all templates (rendered in section order).
function Body({ data, sections, label }: { data: ResumeData; sections: SectionConfig[]; label: (k: SectionKey) => string }) {
  const on = (k: SectionKey) => sections.find((s) => s.key === k)?.enabled;
  const ordered = sections.filter((s) => s.enabled);

  const render: Record<SectionKey, () => React.ReactNode> = {
    summary: () => data.summary ? <Section title={label('summary')}><p className="rp-summary">{data.summary}</p></Section> : null,
    skills: () => data.skills.some((s) => s.items) ? (
      <Section title={label('skills')}>
        <div className="rp-skills">
          {data.skills.filter((s) => s.items).map((s) => (
            <div className="rp-skillrow" key={s.id}>
              <span className="rp-skillcat">{s.category}:</span> {s.items}
            </div>
          ))}
        </div>
      </Section>
    ) : null,
    experience: () => data.experience.some((e) => e.company || e.role) ? (
      <Section title={label('experience')}>
        {data.experience.filter((e) => e.company || e.role).map((e) => (
          <div className="rp-entry" key={e.id}>
            <div className="rp-entry-head">
              <span className="rp-entry-title">{e.role}</span>
              <span className="rp-entry-date">{[e.start, e.end].filter(Boolean).join(' – ')}</span>
            </div>
            <div className="rp-entry-sub">{[e.company, e.city].filter(Boolean).join(', ')}</div>
            {bullets(e.bullets)}
          </div>
        ))}
      </Section>
    ) : null,
    projects: () => data.projects.length ? (
      <Section title={label('projects')}>
        {data.projects.map((p) => (
          <div className="rp-entry" key={p.id}>
            <div className="rp-entry-head">
              <span className="rp-entry-title">{p.name}</span>
              {p.link && <span className="rp-entry-date">{p.link}</span>}
            </div>
            {p.tech && <div className="rp-entry-sub">{p.tech}</div>}
            {bullets(p.bullets)}
          </div>
        ))}
      </Section>
    ) : null,
    education: () => data.education.some((e) => e.degree) ? (
      <Section title={label('education')}>
        {data.education.filter((e) => e.degree).map((e) => (
          <div className="rp-entry" key={e.id}>
            <div className="rp-entry-head">
              <span className="rp-entry-title">{e.degree}</span>
              <span className="rp-entry-date">{e.year}</span>
            </div>
            <div className="rp-entry-sub">{[e.institute, e.city, e.score].filter(Boolean).join(' • ')}</div>
          </div>
        ))}
      </Section>
    ) : null,
    internships: () => data.internships.length ? (
      <Section title={label('internships')}>
        {data.internships.map((i) => (
          <div className="rp-entry" key={i.id}>
            <div className="rp-entry-title">{i.title}</div>
            {i.detail && <div className="rp-entry-detail">{i.detail}</div>}
          </div>
        ))}
      </Section>
    ) : null,
    certifications: () => data.certifications.length ? (
      <Section title={label('certifications')}>
        <ul className="rp-ul">
          {data.certifications.map((c) => <li key={c.id}>{c.name} — {c.issuer} ({c.year})</li>)}
        </ul>
      </Section>
    ) : null,
    achievements: () => data.achievements.length ? (
      <Section title={label('achievements')}>
        <ul className="rp-ul">
          {data.achievements.map((a) => <li key={a.id}><strong>{a.title}:</strong> {a.detail}</li>)}
        </ul>
      </Section>
    ) : null,
  };

  return <>{ordered.map((s) => <div key={s.key}>{on(s.key) && render[s.key]()}</div>)}</>;
}

export const ResumePreview = forwardRef<HTMLDivElement, Props>(({ data, theme, sections }, ref) => {
  const vars = useVars(theme);
  const tpl = theme.templateId;
  const label = (k: SectionKey) => sections.find((s) => s.key === k)?.label ?? k;
  const c = data.contact;

  const twoCol = tpl === 'modern-sidebar' || tpl === 'executive-two';

  // Sidebar gets skills + certifications; main column keeps experience-first order.
  const sidebarKeys: SectionKey[] = ['skills', 'certifications', 'achievements'];
  const mainSections = twoCol ? sections.filter((s) => !sidebarKeys.includes(s.key)) : sections;
  const sideSections = sections.filter((s) => sidebarKeys.includes(s.key));

  return (
    <div ref={ref} id="resume-page" className={`rp rp-${tpl}`} style={vars}>
      {/* Header */}
      <header className={`rp-header ${tpl === 'executive-two' ? 'rp-header-band' : ''}`}>
        <h1 className="rp-name">{c.name}</h1>
        {c.role && <div className="rp-role">{c.role}</div>}
        <ContactLine data={data} />
      </header>

      {twoCol ? (
        <div className="rp-cols">
          <aside className="rp-side">
            <Body data={data} sections={sideSections} label={label} />
          </aside>
          <main className="rp-main">
            <Body data={data} sections={mainSections} label={label} />
          </main>
        </div>
      ) : (
        <Body data={data} sections={mainSections} label={label} />
      )}
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
