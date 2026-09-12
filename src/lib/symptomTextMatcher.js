/**
 * symptomTextMatcher.js
 *
 * Maps a free-text "other symptom" entry onto an EXISTING SYMPTOM_OPTIONS /
 * DANGER_SIGN_OPTIONS id, so typing a plain-English phrasing of a checklist
 * item can trigger the exact same evaluateTriage() rule as ticking the
 * checkbox. There is no parallel rule logic here and no new clinical
 * claims — this file only ever resolves free text back onto the one set
 * of ids triageEngine.js already knows how to evaluate.
 *
 * NOT a clinical source: the synonym phrases below are lay paraphrases of
 * the SAME fixed vocabulary already in triageEngine.js, written for this
 * feature, not drawn from GHS STG. Extend with care — see the safety
 * notes below before adding contains/fuzzy matching.
 *
 * SAFETY DESIGN
 * -------------
 * - Matching is EXACT-PHRASE only, after normalizing case/punctuation/
 *   whitespace — never substring/contains. A "no chest pain" or "not
 *   vomiting" entry must NOT match "chest pain" / "vomiting": a
 *   contains-check would create a negation trap where denying a symptom
 *   silently raises the same flag as reporting it. Exact-phrase matching
 *   avoids that, at the cost of only catching short, symptom-only entries
 *   — which is what the field's placeholder ("e.g. joint pain") already
 *   signals it's for. Do not loosen this to substring matching without
 *   solving negation first.
 * - A failed match is not an error. Unmatched text is treated purely as
 *   informational free text, exactly as it was before this file existed.
 *   Silence (no match) is always the safe default — this file only ever
 *   ADDS confidence to the checklist, it never substitutes for it and
 *   never removes a tick that's already there.
 */

import { SYMPTOM_OPTIONS, DANGER_SIGN_OPTIONS } from './triageEngine';

function normalize(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
}

// Lay-language paraphrases of the SAME checklist items — not new clinical
// categories, just other ways a pharmacist might type the same thing.
const SYNONYMS = [
  { type: 'symptom', id: 'fever', phrases: ['high temperature', 'hot body', 'running a temperature'] },
  { type: 'symptom', id: 'cough', phrases: ['coughing'] },
  {
    type: 'symptom',
    id: 'chest_pain',
    phrases: ['chest pains', 'pain in chest', 'pains in my chest', 'my chest hurts'],
  },
  {
    type: 'symptom',
    id: 'breathlessness',
    phrases: [
      'cant breathe',
      'difficulty breathing',
      'shortness of breath',
      'trouble breathing',
      'hard to breathe',
    ],
  },
  {
    type: 'symptom',
    id: 'headache',
    phrases: ['bad headache', 'head pain', 'severe head pain', 'my head hurts'],
  },
  {
    type: 'symptom',
    id: 'vomiting',
    phrases: ['throwing up', 'throwing up repeatedly', 'vomits', 'keeps vomiting'],
  },
  {
    type: 'symptom',
    id: 'diarrhea',
    phrases: ['loose stools', 'watery stool', 'running stomach', 'diarrhoea'],
  },
  {
    type: 'symptom',
    id: 'abdominal_pain',
    phrases: ['stomach pain', 'stomach ache', 'belly pain', 'tummy pain'],
  },
  { type: 'symptom', id: 'convulsion', phrases: ['fits', 'seizure', 'seizures', 'fitting'] },
  { type: 'symptom', id: 'rash', phrases: ['skin rash', 'body rash', 'rashes'] },
  { type: 'dangerSign', id: 'neck_stiffness', phrases: ['stiff neck', 'neck is stiff'] },
  {
    type: 'dangerSign',
    id: 'altered_consciousness',
    phrases: ['confused', 'not making sense', 'disoriented', 'confusion'],
  },
  {
    type: 'dangerSign',
    id: 'sudden_weakness',
    phrases: ['one side weak', 'weakness on one side', 'cant move one side', 'weak on one side'],
  },
  {
    type: 'dangerSign',
    id: 'speech_difficulty',
    phrases: ['slurred speech', 'cant speak properly', 'difficulty speaking', 'speech is slurred'],
  },
  {
    type: 'dangerSign',
    id: 'facial_droop',
    phrases: ['face drooping', 'one side of face drooping', 'face is drooping'],
  },
  {
    type: 'dangerSign',
    id: 'vision_changes',
    phrases: ['blurry vision', 'cant see well', 'vision is blurry'],
  },
  {
    type: 'dangerSign',
    id: 'epigastric_pain',
    phrases: ['upper stomach pain', 'pain under ribs', 'pain below chest'],
  },
  { type: 'dangerSign', id: 'vaginal_bleeding', phrases: ['bleeding down there'] },
  {
    type: 'dangerSign',
    id: 'chest_radiation',
    phrases: ['chest pain going to arm', 'pain spreading to arm or jaw', 'pain radiating to arm'],
  },
  {
    type: 'dangerSign',
    id: 'diaphoresis',
    phrases: ['sweating a lot with chest pain', 'sweaty with chest pain'],
  },
];

const EXACT_LOOKUP = new Map();

for (const { id, label } of SYMPTOM_OPTIONS) {
  EXACT_LOOKUP.set(normalize(label), { type: 'symptom', id, label });
  EXACT_LOOKUP.set(normalize(id.replace(/_/g, ' ')), { type: 'symptom', id, label });
}
for (const { id, label } of DANGER_SIGN_OPTIONS) {
  EXACT_LOOKUP.set(normalize(label), { type: 'dangerSign', id, label });
  EXACT_LOOKUP.set(normalize(id.replace(/_/g, ' ')), { type: 'dangerSign', id, label });
}
for (const { type, id, phrases } of SYNONYMS) {
  const source = type === 'symptom' ? SYMPTOM_OPTIONS : DANGER_SIGN_OPTIONS;
  const label = source.find((o) => o.id === id)?.label ?? id;
  for (const phrase of phrases) {
    EXACT_LOOKUP.set(normalize(phrase), { type, id, label });
  }
}

/**
 * @param {string} text - raw free-text symptom entry
 * @returns {{ type: 'symptom'|'dangerSign', id: string, label: string } | null}
 */
export function matchFreeTextSymptom(text) {
  return EXACT_LOOKUP.get(normalize(text)) ?? null;
}
