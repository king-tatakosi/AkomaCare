/**
 * SymptomChip
 *
 * A real, VISIBLE <input type="checkbox"> next to its label, laid out as
 * a tappable row (used inside a 2-per-row grid by the caller). Native
 * checkbox semantics throughout — space to toggle, "checkbox, checked/
 * not checked" for screen readers — with no aria-checked/role bookkeeping
 * to keep in sync by hand. SYMPTOM_OPTIONS / DANGER_SIGN_OPTIONS in
 * triageEngine.js stay the only place a new symptom gets added; this
 * component never changes to support one.
 *
 * The whole row is the tap target (wrapping <label>, min-h-12 — not just
 * the checkbox square), and selection is shown two ways — the native
 * check glyph AND a tinted row background — so state isn't conveyed by
 * color alone.
 */
export function SymptomChip({ id, label, selected, onToggle }) {
  return (
    <label
      htmlFor={id}
      className={[
        'flex items-center gap-3 min-h-12 px-3 py-2 rounded-lg border-2',
        'transition-colors duration-150 cursor-pointer select-none touch-manipulation',
        'bg-card border-border hover:border-primary',
        'has-[:checked]:border-primary has-[:checked]:bg-primary/10',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--color-ring)',
      ].join(' ')}
    >
      <input
        type="checkbox"
        id={id}
        checked={selected}
        onChange={onToggle}
        className="h-5 w-5 shrink-0 rounded border-2 border-border accent-(--color-primary) cursor-pointer"
      />
      <span className="text-sm font-bold text-card-foreground leading-snug">{label}</span>
    </label>
  );
}
