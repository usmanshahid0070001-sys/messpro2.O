export default function ToggleSwitch({ checked, onChange, label, disabled }) {
  return (
    <label className={`relative inline-flex cursor-pointer items-center gap-3 text-sm font-black text-[#404040] dark:text-[#888888] ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className="peer sr-only"
      />
      <span className="inline-flex h-7 w-12 items-center rounded-full border border-[#d4d4d4] dark:border-[#333333] bg-[#e0e0e0] dark:bg-[#111111] transition-colors peer-checked:bg-[#171717] dark:peer-checked:bg-white peer-disabled:cursor-not-allowed">
        <span className="ml-1 h-5 w-5 rounded-full bg-white dark:bg-[#1a1a1a] shadow-sm transition-transform peer-checked:translate-x-5" />
      </span>
      {label && <span className="peer-checked:text-[#111111] dark:peer-checked:text-white transition-colors">{label}</span>}
    </label>
  );
}
