export default function ToggleSwitch({ checked, onChange, label, disabled }) {
 return (
 <div className="inline-flex items-center gap-3">
 <button
 type="button"
 role="switch"
 aria-checked={checked}
 aria-label={label || undefined}
 disabled={disabled}
 onClick={onChange}
 className={`
 relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent 
 transition-colors duration-200 ease-in-out
 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 dark:focus-visible:ring-zinc-50 dark:focus-visible:ring-offset-zinc-950
 ${checked 
 ?'bg-zinc-900 dark:bg-zinc-50'
 :'bg-zinc-200 dark:bg-zinc-700'}
 ${disabled ?'opacity-50 cursor-not-allowed':'cursor-pointer'}
 `}
 >
 <span
 className={`
 pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-zinc-950 shadow-sm ring-0
 transition-transform duration-200 ease-in-out
 ${checked ?'translate-x-5':'translate-x-0.5'}
 `}
 />
 </button>
 {label && (
 <span className={`text-sm font-bold transition-colors ${checked ?'text-zinc-900 dark:text-zinc-50':'text-zinc-500 dark:text-zinc-400'}`}>
 {label}
 </span>
 )}
 </div>
 );
}
