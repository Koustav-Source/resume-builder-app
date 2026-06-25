import { useRef, useState, useEffect, useCallback } from 'react';
import type { ResumeData, ResumeProject, SectionConfig } from '../types';
import { getTemplate, TEMPLATES } from '../data/templates';
import { Editor } from './Editor';
import { ResumePreview } from './ResumePreview';
import { CustomizeBar } from './CustomizeBar';
import { AtsPanel } from './AtsPanel';
import { Button } from './ui';
import { exportPdf, exportDocx, buildFilename, renderPreviewPng } from '../lib/export';

type Tab = 'edit' | 'ats';

export function Builder({
  project, onSave, onBack,
}: {
  project: ResumeProject;
  onSave: (p: ResumeProject) => void;
  onBack: () => void;
}) {
  const [data, setDataState] = useState<ResumeData>(project.data);
  const [sections, setSections] = useState<SectionConfig[]>(project.sections);
  const [theme, setTheme] = useState(project.theme);
  const [tab, setTab] = useState<Tab>('edit');
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [parity, setParity] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  const setData = (u: (d: ResumeData) => ResumeData) => setDataState((d) => u(d));
  const tplMeta = getTemplate(theme.templateId);

  useEffect(() => {
    const id = setTimeout(() => {
      onSave({ ...project, data, sections, theme, updatedAt: Date.now() });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 1500);
    }, 600);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, sections, theme]);

  const getExportNode = useCallback(() => exportRef.current ?? previewRef.current, []);

  const doPdf = async () => {
    const node = getExportNode();
    if (!node) return;
    setExporting(true);
    try {
      await exportPdf(node, {
        paper: theme.paper,
        fileName: buildFilename(data.contact.name, tplMeta.name, 'pdf'),
      });
    } finally {
      setExporting(false);
    }
  };

  const doDocx = async () => {
    setExporting(true);
    try {
      await exportDocx(data, sections, buildFilename(data.contact.name, tplMeta.name, 'docx'));
    } finally {
      setExporting(false);
    }
  };

  const checkParity = async () => {
    const node = getExportNode();
    if (!node) return;
    const png = await renderPreviewPng(node);
    const ok = png.startsWith('data:image/png') && png.length > 5000;
    setParity(ok ? 'pass' : 'fail');
    window.setTimeout(() => setParity(null), 4000);
  };

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}>← Templates</Button>
          <select
            value={theme.templateId}
            onChange={(e) => {
              const tpl = getTemplate(e.target.value);
              setTheme({ ...theme, templateId: tpl.id, accent: tpl.palette[0] });
            }}
            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-medium"
          >
            {TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <span className={`text-xs transition ${saved ? 'text-emerald-600' : 'text-slate-300'}`}>
            {saved ? '✓ Saved' : 'Autosave on'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={checkParity} title="Verify preview→download parity">
            {parity === 'pass' ? '✓ Parity OK' : parity === 'fail' ? '✕ Parity fail' : 'Test parity'}
          </Button>
          <Button variant="outline" onClick={doDocx} disabled={exporting}>⬇ DOCX</Button>
          <Button onClick={doPdf} disabled={exporting}>{exporting ? 'Rendering…' : '⬇ Download PDF'}</Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <div className="flex w-full max-w-md flex-col border-r border-slate-200 bg-white md:w-[42%] lg:max-w-lg">
          <div className="flex border-b border-slate-200">
            {(['edit', 'ats'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-sm font-medium transition ${tab === t ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t === 'edit' ? 'Edit Content' : 'ATS Checker'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {tab === 'edit'
              ? <Editor data={data} setData={setData} sections={sections} setSections={setSections} theme={theme} />
              : <AtsPanel data={data} sections={sections} />}
          </div>
        </div>

        <div className="hidden flex-1 flex-col overflow-hidden md:flex">
          <div className="px-4 pt-3">
            <CustomizeBar theme={theme} setTheme={setTheme} />
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className="mx-auto w-fit origin-top scale-[0.78] shadow-xl lg:scale-90 xl:scale-100">
              <ResumePreview ref={previewRef} data={data} theme={theme} sections={sections} />
            </div>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none fixed left-[-200vw] top-0">
        <ResumePreview ref={exportRef} data={data} theme={theme} sections={sections} />
      </div>
    </div>
  );
}
