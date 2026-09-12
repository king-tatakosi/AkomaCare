/**
 * VitalsField
 *
 * Numeric vitals entry. inputMode="numeric" pulls up the number pad
 * directly (no keyboard toggle needed), visible <label> (never
 * placeholder-only — ux-guidelines "Focusable Error Summary" /
 * "Error Placement" category flags placeholder-as-label as a fail),
 * 16px+ text, consistent h-12 sizing across all vitals inputs.
 */
export function VitalsField({ id, label, unit, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-bold text-muted-foreground">
        {label} <span className="font-normal">({unit})</span>
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder={placeholder}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
        className={[
          'h-12 w-full rounded-lg border-2 border-border bg-card px-3 text-base',
          'text-card-foreground placeholder:text-muted-foreground',
          'focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--color-ring)',
        ].join(' ')}
      />
    </div>
  );
}
