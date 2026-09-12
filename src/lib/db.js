import Dexie from 'dexie';

/**
 * db.js — the app's single Dexie instance.
 *
 * First real use of Dexie in this codebase (it's been an installed
 * dependency without a schema until now). One table for now:
 * `referralLog` — an on-device, offline-first audit trail of referral
 * decisions, deliberately holding NO patient-identifying data (see
 * referralLog.js doc comment for why the phone number specifically is
 * excluded). More tables (e.g. a future chat-answer cache) can be added
 * here later without touching this file's existing `version(1)` block —
 * Dexie schema changes go in a new `.version(2).stores({...})` call,
 * never edited in place.
 */
export const db = new Dexie('healthTriageApp');

db.version(1).stores({
  // '++id' = auto-incrementing primary key. 'createdAt' is indexed so
  // the history screen can query in chronological order cheaply.
  referralLog: '++id, createdAt',
});
