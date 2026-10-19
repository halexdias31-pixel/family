/* @family. — check-mail-load.js THE BACKEND WITH ITS MAIL, TRIGGERS, LOCK AND CLOCK STUBBED § */
'use strict';
const path = require('path');
const { backend } = require('./check-gas-load.js');

const REPO = path.resolve(__dirname, '..');

/* ---------- A CALENDAR THAT KNOWS WHERE LONDON IS § */
const dayIn = (d, tz) => {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone: tz || 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' })
      .format(new Date(d));
  } catch (e) { return new Date(d).toISOString().slice(0, 10); }
};
const wallIn = (d, tz) => {
  try {
    const p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: tz || 'UTC', hourCycle: 'h23', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(d)).forEach(x => { p[x.type] = x.value; });
    return p.year + '-' + p.month + '-' + p.day + ' ' + p.hour + ':' + p.minute;
  } catch (e) { return new Date(d).toISOString().slice(0, 16).replace('T', ' '); }
};
const iso = d => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0, 10);

/* ---------- MAIL, TRIGGERS AND THE CLOCK, STUBBED ---------------------------------------------------- */
const RealDate = Date;
function world(opts) {
  opts = opts || {};
  const receipt = opts.receipt || { tab: 'digest_log', keyCol: 'week_of' };
  const mail = { sent: [], quota: opts.quota == null ? 100 : opts.quota, fail: false, unreceipted: [], locked: [] };
  /* THE RECEIPT IS ASKED FOR AT THE MOMENT OF SENDING. § */
  let tabsRef = null;
  const MailApp = {
    sendEmail(m) {
      if (lock.held) mail.locked.push(m && m.to);
      const g = tabsRef && tabsRef[receipt.tab], h = g && g[0];
      const ok = g && g.slice(1).some(r => String(r[h.indexOf('to')]) === String(m && m.to)
        && String(r[h.indexOf('status')]) === 'sending' && /^'?\d{4}-\d{2}-\d{2}$/.test(String(r[h.indexOf(receipt.keyCol)])));
      if (!ok) mail.unreceipted.push(m && m.to);
      if (mail.fail) throw new Error('Invalid email: ' + (m && m.to));
      if (mail.quota <= 0) throw new Error('Service invoked too many times for one day: email.');
      mail.quota--; mail.sent.push(m);
    },
    getRemainingDailyQuota: () => mail.quota,
  };
  const trig = [];
  /* AND EACH TRIGGER HAS ITS ID, as a real one does (`getUniqueId`) — written for the old marking pass's
     run-up (gone since 18 Oct), which deleted its one-off BY that id. */
  let uid = 0;
  const ScriptApp = {
    getScriptId: () => 'local', getOAuthToken: () => '', getService: () => ({ getUrl: () => '' }),
    getAuthorizationInfo: () => ({ getAuthorizationStatus: () => 'NOT_REQUIRED' }), AuthMode: { FULL: 'FULL' },
    WeekDay: { MONDAY: 'MONDAY', TUESDAY: 'TUESDAY', WEDNESDAY: 'WEDNESDAY', THURSDAY: 'THURSDAY',
               FRIDAY: 'FRIDAY', SATURDAY: 'SATURDAY', SUNDAY: 'SUNDAY' },
    getProjectTriggers: () => trig.slice(),
    deleteTrigger: t => { const i = trig.indexOf(t); if (i >= 0) trig.splice(i, 1); },
    newTrigger(fn) {
      const spec = { fn: fn };
      const make = () => { const id = 'trig-' + (++uid); const t = { spec: spec, getHandlerFunction: () => spec.fn, getUniqueId: () => id }; trig.push(t); return t; };
      const clock = {
        onWeekDay: d => { spec.weekDay = d; return clock; }, atHour: h => { spec.hour = h; return clock; },
        nearMinute: m => { spec.minute = m; return clock; }, inTimezone: z => { spec.tz = z; return clock; },
        everyDays: n => { spec.everyDays = n; return clock; }, everyMinutes: n => { spec.everyMinutes = n; return clock; },
        everyHours: n => { spec.everyHours = n; return clock; },
        everyWeeks: n => { spec.everyWeeks = n; return clock; }, after: ms => { spec.after = ms; return clock; },
        create: make,
      };
      return { timeBased: () => clock, forSpreadsheet: () => ({ onChange: () => ({ create: make }) }) };
    },
  };
  const lock = { free: true, held: false };
  const take = () => { if (!lock.free) return false; lock.held = true; return true; };
  const LockService = { getScriptLock: () => ({ tryLock: take, waitLock: take, releaseLock: () => { lock.held = false; } }) };
  const b = backend({ MailApp, ScriptApp, LockService });
  tabsRef = b.tabs;
  const G = b.ev('globalThis');
  const fmt0 = G.Utilities.formatDate;
  G.Utilities.formatDate = (d, tz, f) => (f === 'yyyy-MM-dd' ? dayIn(d, tz) : f === 'yyyy-MM-dd HH:mm' ? wallIn(d, tz) : fmt0(d, tz, f));
  /* THE CLOCK. `new Date()` with no argument, inside the backend, is this instant; everything else is a
     real Date, and a Date the harness made is still `instanceof Date` to the backend's `isoDate_`. */
  const setClock = ms => {
    class Clock extends RealDate {
      constructor(...a) { if (a.length) super(...a); else super(ms); }
      static now() { return ms; }
      static [Symbol.hasInstance](x) { return x instanceof RealDate; }
    }
    G.Date = Clock;
  };
  return { b, mail, trig, lock, G, setClock };
}

const cfgSet = (b, k, v) => {
  const g = b.tabs.config, h = g[0], ki = h.indexOf('key'), vi = h.indexOf('value');
  const r = g.find((x, i) => i > 0 && x[ki] === k);
  if (r) r[vi] = v;
  else { const row = h.map(() => ''); row[ki] = k; row[vi] = v; g.push(row); }
  b.ev('clearCache()');
};
const rowsOf = (b, tab) => {
  const g = b.tabs[tab], h = g[0];
  return g.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i] instanceof Date ? iso(r[i]) : r[i]; }); return o; });
};
const at = s => new RealDate(s).getTime();

/* ---------- READING THE SOURCE FOR WHO NAMES WHAT § */
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
const calls = (src, name) => [...src.matchAll(new RegExp('(^|[^\\w.])' + name + '\\s*\\(', 'g'))]
  .filter(m => !/function\s+$/.test(src.slice(Math.max(0, m.index - 10), m.index + m[1].length)));
const unquote = t => t.replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, "''");
const mentions = (src0, name) => { const src = unquote(src0); return [...src.matchAll(new RegExp('(^|[^\\w.$])' + name + '(?![\\w$])', 'g'))]
  .filter(m => !/function\s+$/.test(src.slice(Math.max(0, m.index - 10), m.index + m[1].length))); };

module.exports = { world, cfgSet, rowsOf, at, iso, dayIn, wallIn, RealDate, REPO, strip, calls, unquote, mentions };
