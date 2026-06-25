import { cn } from '../utils/cn';

export function Field({
  label, value, onChange, placeholder, type = 'text', id,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; id?: string;
}) {
  const fid = id ?? label.replace(/\s+/g, '-').toLowerCase();
  return (
    <label className="block" htmlFor={fid}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        id={fid}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  );
}

export function TextArea({
  label, value, onChange, placeholder, rows = 3, id,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; id?: string;
}) {
  const fid = id ?? label.replace(/\s+/g, '-').toLowerCase();
  return (
    <label className="block" htmlFor={fid}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <textarea
        id={fid}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  );
}

export function Button({
  children, onClick, variant = 'primary', className, type = 'button', disabled, title,
}: {
  children: React.ReactNode; onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'outline' | 'danger' | 'ai';
  className?: string; type?: 'button' | 'submit'; disabled?: boolean; title?: string;
}) {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger: 'text-rose-600 hover:bg-rose-50',
    ai: 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-700 hover:to-fuchsia-700 shadow-sm',
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-300',
        variants[variant], className,
      )}
    >
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-xl border border-slate-200 bg-white p-4 shadow-sm', className)}>{children}</div>;
}

export function Collapsible({
  title, children, defaultOpen = true, right,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean; right?: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-xl border border-slate-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-slate-800">
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 text-slate-400 transition group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          {title}
        </span>
        {right}
      </summary>
      <div className="space-y-3 border-t border-slate-100 p-4">{children}</div>
    </details>
  );
}
