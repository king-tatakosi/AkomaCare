import { db } from './db';

/**
 * referralLog.js
 *
 * The on-device proof-of-referral record discussed in the design
 * session: a Pharmacy Council dispute or an operator's own liability
 * protection needs "did I actually screen and refer, and when" — not
 * "who exactly was the patient". Per that discussion, this deliberately
 * stores NO phone number, even though ReferralScreen now collects one —
 * that number lives only in ReferralScreen's own component state, is
 * used solely to build the sms: link, and is never passed to this
 * module. A shared retail device holding a running list of patients'
 * numbers is a bigger liability than the gap this log is meant to fix.
 *
 * Entries are never edited after creation except to flip `sent` —
 * this is a log, not an editable record; going back to re-screen
 * creates a new entry rather than mutating history.
 */

/**
 * @param {object} referral - the object built by buildReferralDraft()
 * @returns {Promise<number>} the new entry's id, so the caller (useReferral)
 *   can later flip `sent` on the same row via markLogEntrySent.
 */
export async function addLogEntry(referral) {
  return db.referralLog.add({
    createdAt: referral.createdAt,
    ageGroup: referral.ageGroup,
    pregnant: referral.pregnant,
    symptoms: referral.symptoms,
    mrdt: referral.mrdt,
    dangerSigns: referral.dangerSigns,
    flags: referral.flags,
    overallSeverity: referral.overallSeverity,
    sent: false,
  });
}

export async function markLogEntrySent(id) {
  if (id == null) return;
  await db.referralLog.update(id, { sent: true });
}

/**
 * Most-recent-first, capped at `limit` — this is a point-of-care app,
 * not an analytics dashboard, so an unbounded query isn't the right
 * default even though the underlying table has no size limit itself.
 */
export function recentLogEntriesQuery(limit = 50) {
  return db.referralLog.orderBy('createdAt').reverse().limit(limit).toArray();
}
