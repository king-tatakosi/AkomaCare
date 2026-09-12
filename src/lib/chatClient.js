/**
 * chatClient.js
 *
 * STUB — mock replies only. The real backend is the Supabase +
 * pgvector + gte-small + Gemini RAG pipeline sketched in the session
 * decisions log (guideline_documents / guideline_chunks tables, a
 * query-time Edge Function). None of that exists yet. This file is the
 * single seam to swap: when the Edge Function is deployed, replace the
 * body of `sendChatMessage` with a `supabase.functions.invoke(...)`
 * call and nothing else in the app needs to change — useChat.js only
 * knows about this function's signature, not how it's implemented.
 *
 * Scope discipline (per the architecture plan): this chat explains and
 * expands on GHS STG guidance already surfaced elsewhere in the app —
 * it is not open medical Q&A, and it never contradicts an active red
 * flag from the current encounter. Keep mock replies in that voice so
 * the UI/UX is representative of the real thing.
 */

const MOCK_LATENCY_MS = 900;

/**
 * Scoped starter questions shown on the empty chat state. Deliberately
 * about *understanding* cited guidance, not diagnosis or dosing — see
 * scope note above.
 */
export const SUGGESTED_QUESTIONS = [
  'Why does a negative mRDT still allow antipyretics but not antimalarials?',
  'What counts as a danger sign in pregnancy?',
  'Walk me through the FAST pathway for suspected stroke.',
  'Why is fever duration relevant for a pediatric patient?',
];

/**
 * A tiny fixed set of canned responses keyed by rough topic match, so
 * the mock feels representative instead of returning the same string
 * every time. This is NOT a rules engine — just enough variety for UI
 * review. Falls back to a generic "not wired up yet" reply.
 */
const MOCK_REPLIES = [
  {
    match: /mrdt|antimalarial|negative/i,
    text:
      "Per the GHS Standard Treatment Guidelines, a negative malaria RDT result advises against " +
      'presumptive antimalarial treatment for that episode — fever management (antipyretics, ' +
      'fluids, monitoring) still applies, and a same-day refer is appropriate if danger signs are ' +
      'present regardless of the RDT result. (Mock reply — not yet backed by a real citation lookup.)',
  },
  {
    match: /pregnan/i,
    text:
      'Obstetric danger signs your screening already checks for include severe headache/visual ' +
      'disturbance, heavy bleeding, severe abdominal pain, reduced fetal movement, and convulsions. ' +
      'Any one of these should route to refer, independent of the other symptom checklist. (Mock ' +
      'reply — not yet backed by a real citation lookup.)',
  },
  {
    match: /fast|stroke/i,
    text:
      'FAST is Face drooping, Arm weakness, Speech difficulty, Time to call for transport — any one ' +
      'sign present is treated as a danger-sign trigger, not a diagnosis, and routes straight to an ' +
      'emergency referral. (Mock reply — not yet backed by a real citation lookup.)',
  },
  {
    match: /fever duration|pediatric|child/i,
    text:
      'In children, fever lasting several days without an obvious source is itself a discriminator ' +
      "the checklist tracks, separate from any single danger sign — it's one of the inputs that can " +
      'push a routine-looking fever toward refer. (Mock reply — not yet backed by a real citation lookup.)',
  },
];

const FALLBACK_REPLY =
  "This chat isn't wired up to real guideline retrieval yet — you're seeing a placeholder " +
  'reply so the interface can be reviewed. Once the Supabase RAG pipeline is deployed, answers ' +
  'here will cite the specific GHS STG passage they come from, the same way the rest of the app does.';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * sendChatMessage — the one function to swap for the real backend.
 *
 * @param {{ text: string, history: Array<{role: string, text: string}> }} params
 * @returns {Promise<{ id: string, role: 'assistant', text: string, citations: Array }>}
 */
export async function sendChatMessage({ text }) {
  await delay(MOCK_LATENCY_MS);

  const matched = MOCK_REPLIES.find((r) => r.match.test(text));

  return {
    id: `mock-${Date.now()}`,
    role: 'assistant',
    text: matched ? matched.text : FALLBACK_REPLY,
    citations: [],
  };
}
