interface SwitchProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

/** 28x16 toggle; "on" is the near-black primary, never a brand colour. */
export function Switch({ checked, label, onChange }: SwitchProps) {
  return (
    <button
      aria-checked={checked}
      aria-label={label}
      className={`relative h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        checked ? "bg-primary" : "bg-control hover:bg-muted/60"
      }`}
      onClick={() => onChange(!checked)}
      role="switch"
      title={label}
      type="button"
    >
      <span
        className={`absolute top-0.5 left-0.5 size-3 rounded-full transition-transform duration-150 ${
          checked ? "translate-x-3 bg-on-primary" : "translate-x-0 bg-surface"
        }`}
      />
    </button>
  );
}
