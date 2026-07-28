interface SwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

export function Switch({ checked, label, onChange }: SwitchProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 py-3">
      <span className="text-[13px] font-medium text-stone-800 dark:text-stone-100">
        {label}
      </span>
      <button
        aria-checked={checked}
        aria-label={label}
        className={`cursor-pointer relative h-6 w-10 shrink-0 rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 ${
          checked
            ? "border-orange-500 bg-orange-500"
            : "border-stone-300 bg-stone-200 dark:border-stone-600 dark:bg-stone-700"
        }`}
        onClick={() => onChange(!checked)}
        role="switch"
        type="button"
      >
        <span
          className={`absolute top-0.5 left-0.5 size-4.5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>
    </label>
  );
}
