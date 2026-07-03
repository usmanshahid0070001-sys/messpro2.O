export default function ToggleSwitch({ checked, onChange, label, disabled }) {
  return (
    <label className="relative inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-200">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="inline-flex h-7 w-12 items-center rounded-full border border-white/10 bg-slate-800 transition peer-checked:bg-orange-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
        <span className="ml-1 h-5 w-5 rounded-full bg-slate-100 shadow transition peer-checked:translate-x-5 peer-checked:bg-white" />
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
