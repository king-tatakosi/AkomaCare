/**
 * referral.js
 *
 * Single source of truth for the referral object and its status
 * state machine: draft -> sent -> confirmed-received. Per project
 * guidance, this lifecycle must live in one place rather than being
 * inferred ad hoc wherever a referral row is read or written.
 *
 * Pure module — no Supabase, no React. The online sync layer (Edge
 * Function + Realtime) should only ever move a referral through
 * `nextStatus`/`REFERRAL_STATUS`, never invent new status strings.
 */

export const REFERRAL_STATUS = {
  DRAFT: 'draft',
  SENT: 'sent',
  CONFIRMED_RECEIVED: 'confirmed-received',
};

const STATUS_ORDER = [
  REFERRAL_STATUS.DRAFT,
  REFERRAL_STATUS.SENT,
  REFERRAL_STATUS.CONFIRMED_RECEIVED,
];

export function nextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx === -1 || idx === STATUS_ORDER.length - 1) return current;
  return STATUS_ORDER[idx + 1];
}

/** 6-digit numeric code, zero-padded, never starting with a leading run a
 * pharmacist could misread as a phone prefix (kept simple: 100000-999999). */
export function generateReferralCode() {
  const n = Math.floor(100000 + Math.random() * 900000);
  return String(n);
}

/**
 * @param {{ ageGroup: string, symptoms: string[], vitals: object, pregnant: boolean,
 *   mrdt: string, dangerSigns: string[],
 *   result: { flags: Array, overallSeverity: string, prescribingGuidance: Array } }} triageState
 * @returns referral record, status = draft
 */
export function buildReferralDraft(triageState) {
  return {
    code: generateReferralCode(),
    createdAt: new Date().toISOString(),
    status: REFERRAL_STATUS.DRAFT,
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

/** URL the receiving hospital staff enter/scan the code into. NOTE: this
 * is a placeholder domain — there is no lookup backend behind it yet.
 * Treat any UI surfacing this as "not a working feature today", not an
 * implied promise that scanning it does something. */
export function referralLookupUrl(code, baseUrl = 'https://referrals.yourdomain.com') {
  return `${baseUrl}/r/${code}`;
}

/**
 * Native "open my own messaging app with this filled in" links. Deliberately
 * NOT an SMS gateway/API call — those need the pharmacist's device to have
 * data at that exact moment, plus an account/billing setup. These links
 * just hand the note to a native app the pharmacist already has and
 * already trusts, with the recipient chosen there — exactly like sending
 * any other text. No phone number ever passes through this app's state,
 * Dexie, or Supabase; it's not even collected.
 *
 * iOS Safari has a real, documented quirk: an `sms:` link with no phone
 * number must use `&` before its first parameter, not `?` (every other
 * platform accepts `?`). isIOS is passed in rather than detected here,
 * since browser/platform sniffing is a UI-environment concern that
 * doesn't belong in this pure, React-free module.
 */
export function buildSmsLink(bodyText, isIOS = false) {
  const separator = isIOS ? '&' : '?';
  return `sms:${separator}body=${encodeURIComponent(bodyText)}`;
}

/** No phone number in the URL — WhatsApp's click-to-chat opens its own
 * contact picker when the number is omitted. */
export function buildWhatsAppLink(bodyText) {
  return `https://wa.me/?text=${encodeURIComponent(bodyText)}`;
}

/**
 * Plain-text, human-readable referral note. This is the PRIMARY artifact —
 * SMS/WhatsApp/printout — designed to be read directly by OPD staff with
 * zero dependency on them visiting a URL or scanning a code. The QR/code
 * lookup is a supplementary audit trail, not a requirement for care.
 */
export function buildReferralNoteText(referral) {
  const lines = [
    `REFERRAL NOTE — Code #${referral.code}`,
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
