/**
 * triageEngine.js
 *
 * Single source of truth for red-flag / referral logic (GHS Standard
 * Treatment Guidelines derived rules). Per project guidance: this logic
 * must live in one findable, testable place — not scattered across
 * `supabase.from(...)` calls or spread through UI components.
 *
 * This module has NO knowledge of React, Supabase, or Dexie. It is a pure
 * function of (symptoms, vitals, ageGroup, context) -> { flags, overallSeverity,
 * prescribingGuidance }. UI components call `evaluateTriage` and render the
 * result; they never re-implement or duplicate a rule.
 *
 * CITATION POLICY: every `citation` string here names only what the source
 * research document actually stated (guideline name + edition year). The
 * source document does NOT contain section numbers for any condition —
 * do not invent them (e.g. "Sec 1.3", "Sec 4.2"). If a specific section
 * number is later confirmed against the real STG 7th edition PDF, update
 * the citation string then, not before.
 *
 * Offline mode uses this directly. Online mode (RAG/Edge Function enrichment)
 * should call this same function first for the deterministic red-flag layer,
 * then layer AI-enriched narrative on top of — not instead of — these flags.
 */

export const SEVERITY = {
  EMERGENCY: 'emergency', // immediate physical referral, do not dispense and wait
  URGENT: 'urgent',       // refer same-day
  ROUTINE: 'routine',     // no red flag triggered
};

/**
 * The one clear answer the app is supposed to give per PDF feature spec
 * ("Dispense-or-Refer Decision Logic") — everything upstream (flags,
 * severity) collapses into exactly one of these two values. ROUTINE
 * severity is the only case that resolves to DISPENSE; URGENT and
 * EMERGENCY both resolve to REFER. Nothing else should derive a
 * dispense/refer answer independently of this mapping.
 */
export const DECISION = {
  DISPENSE: 'dispense',
  REFER: 'refer',
};

export const AGE_GROUP = {
  ADULT: 'adult',
  PEDIATRIC: 'pediatric',
};

export const MRDT_RESULT = {
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  NOT_DONE: 'not_done',
};

export const SYMPTOM_OPTIONS = [
  { id: 'fever', label: 'Fever' },
  { id: 'cough', label: 'Cough' },
  { id: 'chest_pain', label: 'Chest Pain' },
  { id: 'breathlessness', label: 'Breathlessness' },
  { id: 'headache', label: 'Severe Headache' },
  { id: 'vomiting', label: 'Persistent Vomiting' },
  { id: 'diarrhea', label: 'Diarrhea' },
  { id: 'abdominal_pain', label: 'Abdominal Pain' },
  { id: 'convulsion', label: 'Convulsion' },
  { id: 'rash', label: 'Rash' },
];

/** Danger-sign checklist items feeding the fever, stroke, and obstetric
 * pathways. Presented as tap chips — same interaction pattern as symptoms —
 * but modeled separately since they're clinical discriminators, not the
 * presenting complaint itself. */
export const DANGER_SIGN_OPTIONS = [
  { id: 'neck_stiffness', label: 'Neck Stiffness / Photophobia' },
  { id: 'altered_consciousness', label: 'Confusion / Altered Consciousness' },
  { id: 'sudden_weakness', label: 'Sudden One-Sided Weakness' },
  { id: 'speech_difficulty', label: 'Slurred Speech / Speech Difficulty' },
  { id: 'facial_droop', label: 'Facial Drooping' },
  { id: 'vision_changes', label: 'Blurred Vision' },
  { id: 'epigastric_pain', label: 'Epigastric Pain' },
  { id: 'vaginal_bleeding', label: 'Vaginal Bleeding' },
  { id: 'chest_radiation', label: 'Chest Pain Radiating to Arm/Jaw' },
  { id: 'diaphoresis', label: 'Sweating with Chest Pain' },
];

/**
 * @typedef {Object} Vitals
 * @property {number|null} bpSystolic
 * @property {number|null} bpDiastolic
 * @property {number|null} tempC
 * @property {number|null} pulse
 * @property {number|null} feverDays
 *
 * @typedef {Object} TriageContext
 * @property {boolean} pregnant
 * @property {'positive'|'negative'|'not_done'} mrdt - malaria rapid diagnostic test result
 * @property {string[]} dangerSigns - array of ids from DANGER_SIGN_OPTIONS
 *
 * @typedef {Object} TriageFlag
 * @property {string} id
 * @property {string} label
 * @property {'emergency'|'urgent'} severity
 * @property {string} reason
 * @property {string} citation
 *
 * @typedef {Object} PrescribingGuidance
 * @property {string} id
 * @property {string} text
 * @property {string} citation
 *
 * @param {string[]} symptoms
 * @param {Vitals} vitals
 * @param {'adult'|'pediatric'} ageGroup
 * @param {TriageContext} context
 * @returns {{ flags: TriageFlag[], overallSeverity: string, prescribingGuidance: PrescribingGuidance[] }}
 */
export function evaluateTriage(
  symptoms,
  vitals,
  ageGroup = AGE_GROUP.ADULT,
  context = { pregnant: false, mrdt: MRDT_RESULT.NOT_DONE, dangerSigns: [] }
) {
  const flags = [];
  const prescribingGuidance = [];
  const { bpSystolic, bpDiastolic, tempC, pulse, feverDays } = vitals;
  const { pregnant, mrdt, dangerSigns } = context;
  const hasDanger = (id) => dangerSigns.includes(id);

  // --- Existing vitals-based rules ---

  // Hypertensive crisis — BP >= 180/110 mmHg
  if (isNum(bpSystolic) && isNum(bpDiastolic) && (bpSystolic >= 180 || bpDiastolic >= 110)) {
    flags.push({
      id: 'hypertensive_crisis',
      label: 'Hypertensive crisis',
      severity: SEVERITY.EMERGENCY,
      reason: `BP ${bpSystolic}/${bpDiastolic} mmHg meets or exceeds 180/110 mmHg threshold`,
      citation: 'Ghana cardiovascular guideline (current version)',
    });
  }

  // Pediatric high fever persisting >= 3 days
  if (
    ageGroup === AGE_GROUP.PEDIATRIC &&
    isNum(tempC) &&
    tempC > 38.5 &&
    isNum(feverDays) &&
    feverDays >= 3
  ) {
    flags.push({
      id: 'pediatric_persistent_fever',
      label: 'Persistent high fever in a child',
      severity: SEVERITY.URGENT,
      reason: `Temperature ${tempC}\u00b0C for ${feverDays} day(s) in a pediatric patient exceeds 38.5\u00b0C for \u2265 3 days`,
      citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017) — Fever',
    });
  }

  // Convulsion — always urgent/emergency regardless of other findings
  if (symptoms.includes('convulsion')) {
    flags.push({
      id: 'convulsion',
      label: 'Convulsion reported',
      severity: SEVERITY.EMERGENCY,
      reason: 'Any convulsion warrants immediate physical referral',
      citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017)',
    });
  }

  // Elevated pulse alongside fever — possible sepsis warning in adults
  if (ageGroup === AGE_GROUP.ADULT && isNum(pulse) && pulse > 120 && isNum(tempC) && tempC > 38) {
    flags.push({
      id: 'tachycardia_with_fever',
      label: 'Fast pulse with fever',
      severity: SEVERITY.URGENT,
      reason: `Pulse ${pulse} bpm with temperature ${tempC}\u00b0C — monitor closely, consider referral`,
      citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017) — Fever',
    });
  }

  // --- Pathway 1: Undifferentiated fever (presentation-first, not a disease classifier) ---

  if (symptoms.includes('fever')) {
    if (hasDanger('neck_stiffness') || hasDanger('altered_consciousness')) {
      flags.push({
        id: 'fever_meningitis_pattern',
        label: 'Fever with neck stiffness or altered consciousness',
        severity: SEVERITY.EMERGENCY,
        reason:
          'Fever combined with neck stiffness/photophobia or altered consciousness is a recognized pattern for acute meningitis or severe systemic infection — refer immediately, do not attempt to classify further at point of sale',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017) — Fever; WHO malaria guidance',
      });
    }

    if (symptoms.includes('breathlessness')) {
      flags.push({
        id: 'fever_with_dyspnoea',
        label: 'Fever with breathlessness',
        severity: SEVERITY.URGENT,
        reason: 'Fever with dyspnoea warrants assessment for pneumonia or other respiratory/systemic causes',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017) — Fever',
      });
    }

    if (pregnant) {
      flags.push({
        id: 'fever_in_pregnancy',
        label: 'Fever in pregnancy',
        severity: SEVERITY.URGENT,
        reason: 'Fever in a pregnant patient warrants prompt clinical assessment',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017)',
      });
    }

    // STG stewardship note — informational guidance, not a dispensing directive.
    // Only surfaced when there is no emergency flag already driving the encounter.
    const hasEmergencyAlready = flags.some((f) => f.severity === SEVERITY.EMERGENCY);
    if (mrdt === MRDT_RESULT.NEGATIVE && !hasEmergencyAlready) {
      prescribingGuidance.push({
        id: 'negative_mrdt_stewardship',
        text:
          'With a negative malaria test result, an antimalarial is not indicated on fever alone. Consider symptomatic care and reassessment; refer if fever persists beyond 48 hours or new danger signs appear.',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017) — Fever; WHO malaria guidance',
      });
    }
    if (mrdt === MRDT_RESULT.NOT_DONE) {
      prescribingGuidance.push({
        id: 'mrdt_not_done_note',
        text: 'Malaria testing has not been recorded for this fever. Parasitological confirmation (RDT or microscopy) is recommended before antimalarial treatment where available.',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017); WHO malaria guidance',
      });
    }
  }

  // --- Pathway 2: Sudden focal neuro deficit (stroke pattern) / acute chest pain ---

  if (hasDanger('sudden_weakness') || hasDanger('speech_difficulty') || hasDanger('facial_droop')) {
    flags.push({
      id: 'stroke_pattern',
      label: 'Sudden focal neurological deficit',
      severity: SEVERITY.EMERGENCY,
      reason:
        'Sudden facial drooping, one-sided weakness, or speech disturbance is treated as an emergency referral trigger regardless of suspected subtype',
      citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017)',
    });
  }

  if (symptoms.includes('chest_pain')) {
    if (hasDanger('chest_radiation') || hasDanger('diaphoresis') || symptoms.includes('breathlessness')) {
      flags.push({
        id: 'chest_pain_acs_pattern',
        label: 'Chest pain with features of possible cardiac emergency',
        severity: SEVERITY.EMERGENCY,
        reason:
          'Chest pain with radiation, sweating, or breathlessness should never be routed to over-the-counter management — refer for urgent evaluation',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017)',
      });
    } else {
      flags.push({
        id: 'chest_pain_unspecified',
        label: 'Chest pain reported',
        severity: SEVERITY.URGENT,
        reason: 'Chest pain requires structured clinical risk assessment and should not be managed with OTC medication alone',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017)',
      });
    }
  }

  // --- Pathway 3: Obstetric danger signs ---

  if (pregnant) {
    if (hasDanger('vaginal_bleeding')) {
      flags.push({
        id: 'obstetric_bleeding',
        label: 'Vaginal bleeding in pregnancy',
        severity: SEVERITY.EMERGENCY,
        reason: 'Vaginal bleeding in a pregnant patient is an emergency referral trigger regardless of other findings',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017) — Obstetric emergencies',
      });
    }
    if (symptoms.includes('headache') && hasDanger('vision_changes') && hasDanger('epigastric_pain')) {
      flags.push({
        id: 'obstetric_preeclampsia_pattern',
        label: 'Severe headache, vision changes, and epigastric pain in pregnancy',
        severity: SEVERITY.EMERGENCY,
        reason:
          'This combination is a recognized pattern for severe pre-eclampsia/impending eclampsia — refer immediately',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017) — Obstetric emergencies',
      });
    }
  }

  // --- Suggested OTC Guidance (Free Tier feature) ---
  // Only surfaced when the encounter is fully routine — flags.length === 0
  // means no red flag anywhere above fired, so this can never compete with
  // or contradict a refer-out. Deliberately a general medicine CATEGORY,
  // never a brand name, per the feature spec ("not specific brands") and
  // this file's citation policy — only the categories below are grounded
  // in the source research document; do not add more without checking the
  // actual STG text first (see file header re: fabricated section numbers).
  if (flags.length === 0) {
    if (symptoms.includes('fever') && mrdt !== MRDT_RESULT.POSITIVE) {
      prescribingGuidance.push({
        id: 'otc_fever_category',
        text: 'Consider an antipyretic/analgesic category (e.g. paracetamol-class) for symptomatic fever relief. Not a specific brand recommendation — reassess if fever persists beyond 48 hours or new danger signs appear.',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017) — Fever',
      });
    }
    if (symptoms.includes('headache')) {
      prescribingGuidance.push({
        id: 'otc_headache_category',
        text: 'Consider a simple analgesic category for headache relief. Not a specific brand recommendation — refer if headache is severe, sudden, or accompanied by any danger sign.',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017)',
      });
    }
    if (symptoms.includes('cough')) {
      prescribingGuidance.push({
        id: 'otc_cough_category',
        text: 'Consider a general cough remedy category appropriate to cough type (dry vs. productive). Not a specific brand recommendation — refer if breathlessness, chest pain, or fever accompany the cough.',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017)',
      });
    }
    if (symptoms.includes('diarrhea')) {
      prescribingGuidance.push({
        id: 'otc_diarrhea_category',
        text: 'Consider oral rehydration salts as the general category for uncomplicated diarrhea. Not a specific brand recommendation — refer if symptoms persist beyond 48 hours, or blood/danger signs appear.',
        citation: 'Ghana Standard Treatment Guidelines, 7th ed. (2017) — Diarrhoea',
      });
    }
  }

  const overallSeverity = flags.some((f) => f.severity === SEVERITY.EMERGENCY)
    ? SEVERITY.EMERGENCY
    : flags.length > 0
      ? SEVERITY.URGENT
      : SEVERITY.ROUTINE;

  const decision = overallSeverity === SEVERITY.ROUTINE ? DECISION.DISPENSE : DECISION.REFER;

  return { flags, overallSeverity, decision, prescribingGuidance };
}

function isNum(v) {
  return typeof v === 'number' && !Number.isNaN(v);
}
