import type { ThemeConfig } from '../types';
import { getTemplate } from '../data/templates';

export function CustomizeBar({
  theme, setTheme,
}: {
  theme: ThemeConfig;
  setTheme: (t: ThemeConfig) => void;
}) {
  const tpl = getTemplate(theme.templateId);
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Accent</span>
        <div className="flex gap-1">
          {tpl.palette.map((c) => (
            <button
              key={c}
              onClick={() => setTheme({ ...theme, accent: c })}
              aria-label={`Accent ${c}`}
              className={`h-6 w-6 rounded-full border-2 transition ${theme.accent === c ? 'border-slate-900 scale-110' : 'border-white shadow'}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Font</span>
        <select
          value={theme.fontFamily}
          onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value as ThemeConfig['fontFamily'] })}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
        >
          <option value="sans">Sans (Inter)</option>
          <option value="serif">Serif (Georgia)</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Density</span>
        <select
          value={theme.fontScale}
          onChange={(e) => setTheme({ ...theme, fontScale: e.target.value as ThemeConfig['fontScale'] })}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
        >
          <option value="compact">Compact</option>
          <option value="normal">Normal</option>
          <option value="roomy">Roomy</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-500">Paper</span>
        <select
          value={theme.paper}
          onChange={(e) => setTheme({ ...theme, paper: e.target.value as ThemeConfig['paper'] })}
          className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
        >
          <option value="A4">A4 (India)</option>
          <option value="Letter">US Letter</option>
        </select>
      </div>
    </div>
  );
}
