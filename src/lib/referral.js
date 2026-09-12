/**
 * referral.js
 *
 * Simplified per product decision: no draft/sent/confirmed lifecycle,
 * no referral code, no QR/lookup URL, no WhatsApp option. A referral is
 * just the screening data needed to write the note, plus a `sent`
 * boolean the pharmacist sets themselves after tapping "Send SMS".
 *
 * Pure module — no Supabase, no React.
 */

/**
 * @param {{ ageGroup: string, symptoms: string[], vitals: object, pregnant: boolean,
 *   mrdt: string, dangerSigns: string[],
 *   result: { flags: Array, overallSeverity: string, prescribingGuidance: Array } }} triageState
 * @returns referral record, sent = false
 */
export function buildReferralDraft(triageState) {
  return {
    createdAt: new Date().toISOString(),
    sent: false,
    ageGroup: triageState.ageGroup,
    symptoms: triageState.symptoms,
    vitals: triageState.vitals,
    pregnant: triageState.pregnant,
    mrdt: triageState.mrdt,
    dangerSigns: triageState.dangerSigns,
    flags: triageState.result.flags,
    overallSeverity: triageState.result.overallSeverity,
    prescribingGuidance: triageState.result.prescribingGuidance,
  };
}

/**
 * Native "open my own messaging app with this filled in" link, now with
 * the patient's number prefilled. The number is only ever used to build
 * this href — it lives in ReferralScreen's own component state, never
 * in the referral record, Dexie, or Supabase, so the earlier "no phone
 * number stored" principle still holds; it's just no longer "no phone
 * number collected at all".
 *
 * `sms:NUMBER?body=...` is the standard form and works this way on both
 * iOS and Android once a number is present — the historical `&` vs `?`
 * quirk only applies to the no-recipient form, which no longer applies
 * here now that a number is always supplied.
 */
export function buildSmsLink(phone, bodyText) {
  return `sms:${encodeURIComponent(phone)}?body=${encodeURIComponent(bodyText)}`;
}

/**
 * Plain-text, human-readable referral note — the entire deliverable.
 */
export function buildReferralNoteText(referral) {
  const lines = [
    `REFERRAL NOTE`,
    `${referral.ageGroup === 'pediatric' ? 'Pediatric' : 'Adult'} patient${referral.pregnant ? ', pregnant' : ''}.`,
  ];

  if (referral.symptoms?.length) {
    lines.push(`Presenting complaint(s): ${referral.symptoms.join(', ')}.`);
  }
  if (referral.mrdt && referral.mrdt !== 'not_done') {
    lines.push(`Malaria RDT: ${referral.mrdt}.`);
  }
  if (referral.flags?.length) {
    lines.push('Screened for danger signs — findings:');
    referral.flags.forEach((f) => lines.push(`- ${f.label}: ${f.reason}`));
  }
  lines.push(
    referral.overallSeverity === 'emergency'
      ? 'Screened and referred as an EMERGENCY. Please assess urgently.'
      : referral.overallSeverity === 'urgent'
        ? 'Screened and referred for same-day clinical evaluation.'
        : 'Screened at point of sale; no danger signs identified. Referred for further evaluation as requested.'
  );

  return lines.join('\n');
}
