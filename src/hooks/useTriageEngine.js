import { useMemo, useState, useCallback } from 'react';
import { evaluateTriage, AGE_GROUP, MRDT_RESULT } from '../lib/triageEngine';
import { matchFreeTextSymptom } from '../lib/symptomTextMatcher';

/**
 * useTriageEngine
 *
 * The one interface the UI is allowed to talk to for screening state +
 * red-flag evaluation. Deep module, shallow interface (Philosophy of
 * Software Design): components get state + setters + { result }
 * and never touch evaluateTriage() or the rule thresholds directly.
 *
 * Re-evaluates on every change — no submit button required, per the
 * "real-time triage evaluation on keypress" UX constraint.
 */
export function useTriageEngine() {
  const [ageGroup, setAgeGroup] = useState(AGE_GROUP.ADULT);
  const [symptoms, setSymptoms] = useState(() => new Set());
  const [vitals, setVitals] = useState({
    bpSystolic: null,
    bpDiastolic: null,
    tempC: null,
    pulse: null,
    feverDays: null,
  });
  const [pregnant, setPregnant] = useState(false);
  const [mrdt, setMrdt] = useState(MRDT_RESULT.NOT_DONE);
  const [dangerSigns, setDangerSigns] = useState(() => new Set());
  const [otherSymptoms, setOtherSymptoms] = useState(() => []);

  const toggleSymptom = useCallback((id) => {
    setSymptoms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleDangerSign = useCallback((id) => {
    setDangerSigns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setVital = useCallback((key, rawValue) => {
    const value = rawValue === '' ? null : Number(rawValue);
    setVitals((prev) => ({ ...prev, [key]: Number.isNaN(value) ? null : value }));
  }, []);

  /** Free-text symptoms not covered by SYMPTOM_OPTIONS. Deduped
   * case-insensitively. Each entry is { text, match }: `match` (from
   * symptomTextMatcher) is non-null only when the typed text is an exact
   * phrasing match for a KNOWN checklist item, in which case that item's
   * real checkbox is auto-ticked here — so it runs through the exact
   * same evaluateTriage() rule as if the pharmacist had ticked it
   * themselves. Auto-ticking only ever ADDS a tick, never removes one:
   * un-adding an other-symptom entry does not untick its matched
   * checklist item, so a pharmacist who separately (manually) confirmed
   * that item stays confirmed regardless of what happens to the text
   * entry. Unmatched text stays exactly what it always was —
   * informational only, shown on the referral note, never evaluated. */
  const addOtherSymptom = useCallback((text) => {
    const match = matchFreeTextSymptom(text);
    setOtherSymptoms((prev) =>
      prev.some((item) => item.text.toLowerCase() === text.toLowerCase())
        ? prev
        : [...prev, { text, match }]
    );
    if (match?.type === 'symptom') {
      setSymptoms((prev) => (prev.has(match.id) ? prev : new Set(prev).add(match.id)));
    } else if (match?.type === 'dangerSign') {
      setDangerSigns((prev) => (prev.has(match.id) ? prev : new Set(prev).add(match.id)));
    }
  }, []);

  const removeOtherSymptom = useCallback((text) => {
    setOtherSymptoms((prev) => prev.filter((item) => item.text !== text));
  }, []);

  /** Clears the form back to its initial state. Used when the decision
   * is DISPENSE (no referral to generate) so the pharmacist can move to
   * the next patient in one tap — keeps the "under 2 minutes" workflow
   * intact instead of leaving stale ticks for the next customer. */
  const reset = useCallback(() => {
    setAgeGroup(AGE_GROUP.ADULT);
    setSymptoms(new Set());
    setVitals({ bpSystolic: null, bpDiastolic: null, tempC: null, pulse: null, feverDays: null });
    setPregnant(false);
    setMrdt(MRDT_RESULT.NOT_DONE);
    setDangerSigns(new Set());
    setOtherSymptoms([]);
  }, []);

  const symptomList = useMemo(
    () => [...Array.from(symptoms), ...otherSymptoms.map((item) => item.text)],
    [symptoms, otherSymptoms]
  );
  const dangerSignList = useMemo(() => Array.from(dangerSigns), [dangerSigns]);

  const context = useMemo(
    () => ({ pregnant, mrdt, dangerSigns: dangerSignList }),
    [pregnant, mrdt, dangerSignList]
  );

  const result = useMemo(
    () => evaluateTriage(symptomList, vitals, ageGroup, context),
    [symptomList, vitals, ageGroup, context]
  );

  return {
    ageGroup,
    setAgeGroup,
    symptoms,
    toggleSymptom,
    vitals,
    setVital,
    pregnant,
    setPregnant,
    mrdt,
    setMrdt,
    dangerSigns,
    toggleDangerSign,
    otherSymptoms,
    addOtherSymptom,
    removeOtherSymptom,
    result,
    reset,
  };
}
