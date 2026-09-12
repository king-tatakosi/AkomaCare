/**
 * SegmentedToggle
 *
 * Generic tap-first segmented control — used for pregnancy status and
 * malaria RDT result. Same interaction pattern as AgeGroupToggle, kept
 * generic here so we're not duplicating this markup a third time.
 */
export function SegmentedToggle({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-bold text-muted-foreground">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="inline-flex rounded-lg border-2 border-border bg-card p-1 gap-1 flex-wrap"
      >
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={value === opt.id}
            onClick={() => onChange(opt.id)}
            className={[
              'min-h-11 min-w-20 px-3 rounded-md text-sm font-bold cursor-pointer',
              'transition-colors duration-150 touch-manipulation',
              'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
              value === opt.id ? 'bg-accent text-accent-foreground' : 'text-muted-foreground',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
