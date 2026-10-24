/* @family. — staff.js THE STAFF HUB (405): the tutor terms, pricing with where a booking's money goes, the monthly statement.
   Rank Staff and an admin who teaches; the server gates each part again. */

/* THE MOST AN HOUR MAY BE — the server's `RATE_MAX` (constants.gs) is the same number; check-staff compares them. */
const STAFF_RATE_MAX = 200;

/* ---------- WHO HAS A HUB ---------- */
const hubFor_ = () => typeof USER !== 'undefined' && !!USER && (rank_() === 'staff' || (isAdmin() && tutorHeld_()));

/* ---------- THE TUTOR TERMS: `brand` KEYS WITH THIS DRAFT BEHIND THEM ----------
   `tutor_terms` (a "## " line starts a section) and `tutor_terms_version` in data/settings/brand.json. A new version asks again. */
const TERMS_VERSION = 'v1-2026-10-24';
const TERMS_DRAFT = [
  '## About these terms',
  'These terms are between you and @family. They apply to every session you teach that was booked through this site, and they replace the earlier tutor agreement.',
  '## You are self-employed',
  '- You work for @family. as an independent contractor, not as an employee or a worker.',
  '- You are responsible for your own tax and National Insurance, and for registering with HMRC for Self Assessment.',
  '- There is no holiday pay, sick pay or pension from @family. You are free to work for others, and you decide how to teach within what was booked.',
  '## Bookings',
  '- Families book and pay through this site. You take on only the sessions you can teach well.',
  '- Keep your availability, venues and subjects up to date on your card, so you are only booked for what you can do.',
  '- Arrive on time and prepared, and tell the family through Messages if anything about a session changes.',
  '## Cancellations',
  '- If you cannot make a session, give at least 24 hours’ notice to the family and to @family., except in a real emergency.',
  '- Repeated late cancellations may end this arrangement.',
  '- When a family cancels, what is paid follows the family terms in force when they booked.',
  '## Pay and the business’s share',
  '- The family pays the price shown when they book. You are paid your own hourly rate for the first student, plus your part of each extra seat.',
  '- @family. keeps its share of each extra seat. Room hire goes to the venue, and card fees come out of @family.’s share, not yours.',
  '- The Staff hub shows exactly where each booking’s money goes before you set your rate. You can change your rate once a month; a change applies to new bookings.',
  '- You are paid for the sessions you teach, monthly. Your statement on the Staff hub lists each session. It is a statement, not a payslip.',
  '- Families pay through this platform only. Never take payment directly, and do not take on a family you met through us privately while you work with us or for 6 months after.',
  '## Safeguarding and DBS',
  '- You hold an enhanced DBS check, and you tell @family. straight away if anything about it changes.',
  '- Safeguarding comes first. Report any concern about a child to @family. the same day.',
  '- Never meet a student alone somewhere that has not been agreed, and keep contact with students on this site, not on personal social media or phone numbers.',
  '## Conduct',
  '- Be polite and professional with students, parents, venues and staff, in person and in messages.',
  '- No alcohol, smoking or drugs before or during a session, and treat the rooms we hire with care.',
  '## Data protection',
  '- Use what you learn about students and families only to teach them. Keep it private and secure, and do not share it.',
  '- Tell @family. straight away if any of it is lost or seen by somebody who should not have it. When you stop teaching here, delete what you hold.',
  '## Ending the arrangement',
  '- Either side can end this with 2 weeks’ written notice, or straight away for a serious breach such as a safeguarding failure.',
  '- Sessions you have taught are still paid, and booked sessions are finished or handed over as agreed.',
  '## Changes to these terms',
  '- @family. may change these terms. A new version appears in your Staff hub and you are asked to agree again; until you do, your card on You says so and @family. sees it.',
].join('\n');
/* A BARE DATE IS PREFIXED: the sheet stores "2026-11-01" as a date, and a version that comes back as a date never matches again. */
const termsVersion_ = () => { const v = String(brand('tutor_terms_version', TERMS_VERSION)).trim(); return /^\d{4}-\d{1,2}(-\d{1,2})?$/.test(v) ? 'v' + v : v; };
const termsDraft_ = () => !(typeof DATA !== 'undefined' && DATA && DATA.brand && DATA.brand.tutor_terms);
const termsAgreed_ = () => !!(USER && USER.agreementSignedAt && String(USER.agreementVersion || '') === termsVersion_());
/* "## Heading" STARTS A SECTION; what follows is `termsProse_`'s (terms.js): paragraphs, "- " lists, **bold**. */
function termsSections_(src) {
  const out = [];
  String(src || '').replace(/\r/g, '').split('\n').forEach(line => {
    const h = /^##\s+(.*)$/.exec(line);
    if (h || !out.length) out.push({ h: h ? h[1].trim() : '', lines: [] });
    if (!h) out[out.length - 1].lines.push(line);
  });
  /* "- " LINES IN A RUN ARE ONE LIST: a blank line between paragraphs, none between bullets. */
  return out.map(s => ({ h: s.h, body: s.lines.reduce((acc, l) => {
    const prev = acc.length ? acc[acc.length - 1] : '';
    if (!l.trim()) return acc;
    if (/^\s*[-•]\s+/.test(l) && /^\s*[-•]\s+/.test(prev)) acc.push(l); else acc.push('', l);
    return acc;
  }, []).join('\n').trim() }));
}
function agreementCard_() {
  const at = USER && USER.agreementSignedAt, now = termsAgreed_(), was = String((USER && USER.agreementVersion) || '');
  const prose = s => typeof termsProse_ === 'function' ? termsProse_(s) : `<p>${esc(s)}</p>`;
  return `<div class="hub-terms agree">
    <h3>Tutor Terms &amp; Conditions${termsDraft_() ? ' <span class="agree-draft">Draft</span>' : ''}</h3>
    <p class="faint hub-ver">Version ${esc(termsVersion_())}</p>
    <div class="doc">${termsSections_(brand('tutor_terms', TERMS_DRAFT)).map(s =>
      `<div class="doc-part">${s.h ? `<h4>${esc(s.h)}</h4>` : ''}${prose(s.body)}</div>`).join('')}</div>
    <label class="check"><input type="checkbox" data-do="agree-sign"${now ? ' checked disabled' : ''}>
      <span class="box"></span><span>I have read these terms and I agree to them</span></label>
    <p class="faint agree-said">${now ? 'Agreed on ' + esc(at) + ' · version ' + esc(was) + '.'
      : at ? 'These terms have changed since you agreed to version ' + esc(was) + ' on ' + esc(at) + '. Please read them and agree again.'
      : 'Your agreement, the version and the time are recorded.'}</p>
  </div>`;
}
on('agree-sign', el => {
  if (!USER || el.disabled) return;
  el.disabled = true;
  const said = el.closest('.agree') && el.closest('.agree').querySelector('.agree-said');
  const version = termsVersion_();
  send({ action: 'signAgreement', name: USER.name, personId: USER.personId, version })
    .then(d => {
      USER.agreementSignedAt = (d && d.signedAt) || 'today';
      USER.agreementVersion = (d && d.version) || version;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
      el.checked = true;
      if (said) said.textContent = 'Agreed on ' + USER.agreementSignedAt + ' · version ' + USER.agreementVersion + '.';
      toast('Agreed');
      hubTilesRedraw_();
      try { paint('account'); } catch (e) {}
    })
    .catch(err => { el.checked = false; el.disabled = false; toast(String((err && err.message) || 'Not saved.')); });
});

/* ---------- ON YOUR OWN CARD: THE TILE BESIDE "SHARE MY PROFILE", AND ONE LINE UNDER THE ROW UNTIL THE TERMS ARE AGREED ---------- */
const hubTile_ = () => hubFor_() ? tile_({ icon: 'key', label: 'Staff hub', note: termsAgreed_() ? 'terms, pricing, statement' : 'terms to agree',
  act: 'hub-open', tone: termsAgreed_() ? '' : 'admin' }) : '';
const hubWarn_ = () => hubFor_() && !termsAgreed_()
  ? `<p class="hub-warn" role="status">${USER.agreementSignedAt ? 'The tutor terms have changed.' : 'You have not agreed to the tutor terms yet.'}
     Open Staff hub to read them and tick I agree — until then @family. sees you as not agreed.</p>` : '';

/* ---------- THE HUB: ONE SHEET, THREE PARTS ---------- */
const HUB = { part: 'terms' };
const HUB_PARTS = [['terms', 'doc', 'Terms'], ['pricing', 'edit', 'Pricing'], ['statement', 'print', 'Statement']];
function hubTilesHtml_() {
  return `<div class="tile-row hub-tabs">${HUB_PARTS.map(([k, icon, label]) => tile_({ icon, label, act: 'hub-part', data: { part: k },
    on: HUB.part === k, pressed: HUB.part === k,
    note: k === 'terms' ? (termsAgreed_() ? 'agreed' : 'to agree') : k === 'pricing' ? 'what you charge' : 'each month' })).join('')}</div>`;
}
const hubTilesRedraw_ = () => { const r = document.querySelector('#sheet-body .hub-tabs'); if (r) r.outerHTML = hubTilesHtml_(); };
function hubHtml_() {
  const body = HUB.part === 'pricing' ? priceHtml_() : HUB.part === 'statement' ? stmtHtml_() : agreementCard_();
  return `<div class="hub" data-hub="${esc(HUB.part)}">${hubTilesHtml_()}<div class="hub-body">${body}</div></div>`;
}
function hubOpen_(part) {
  if (!hubFor_()) return;
  if (part) HUB.part = part;
  if (HUB.part === 'statement') { STMT.tutorId = ''; STMT.tutorName = ''; }
  if (HUB.part === 'pricing') priceStart_();
  openSheet('Staff hub', hubHtml_());
  if (HUB.part === 'statement') stmtAsk_();
}
on('hub-open', () => hubOpen_(termsAgreed_() ? '' : 'terms'));
on('hub-part', el => hubOpen_(el.dataset.part));

/* ---------- PRICING: YOUR RATE AND EXTRA SEAT, AND WHERE A BOOKING'S MONEY GOES ----------
   Every figure is `priceFrom` → `bookMoney_` (core.js) over the row being typed — the booking's own sum, never a second one. */
const PRICE = { rate: 0, seat: 0, loc: '', moved: {}, open: false };
const priceMine_ = () => ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).find(t => typeof mineIs_ === 'function' && mineIs_(t)) || {};
const priceRooms_ = () => ((typeof DATA !== 'undefined' && DATA && DATA.venues) || []).filter(v => v && v.title && parseFloat(v.bestRate) > 0);
/* WHAT A SEAT ADDS IN POUNDS, for the row as saved: their own part, else the config's `c`, through `seatShare_`. */
const priceUsualSeat_ = rate => typeof seatShare_ === 'function' ? Math.round(rate * seatShare_(null).cUsed * 100) / 100 : 0;
function priceStart_() {
  const t = priceMine_();
  /* NO RATE YET IS PRICED AT THE OPEN RATE (`priceFrom`'s own fallback), so the slider starts where the bars are; Save makes it theirs. */
  PRICE.open = !(Number(t.rate) > 0);
  PRICE.rate = PRICE.open ? OPEN_RATE : Number(t.rate);
  const s = typeof seatShare_ === 'function' ? seatShare_(t) : { seatOwn: false, cRaw: 0 };
  PRICE.seat = s.seatOwn ? Math.round(s.cRaw * PRICE.rate * 100) / 100 : 0;
  const rooms = priceRooms_();
  if (!PRICE.loc || !rooms.some(v => v.title === PRICE.loc)) PRICE.loc = (rooms.find(v => (t.venues || []).indexOf(v.title) !== -1) || rooms[0] || {}).title || '';
  PRICE.moved = PRICE.open ? { rate: true } : {};
}
/* ONE BOOKING OF ONE HOUR FOR N STUDENTS, split four ways. Business is what is left — negative when fees outrun its share. */
function priceSplit_(n) {
  const t = priceMine_();
  const frac = PRICE.rate > 0 && PRICE.seat > 0 ? PRICE.seat / PRICE.rate : 0;
  const row = Object.assign({}, t, { rate: PRICE.rate, extraSeat: frac });
  let p = null;
  try { p = priceFrom({ tutorRow: row, n, slots: 1, hoursPerWeek: 1, loc: PRICE.loc, format: 'Tutoring' }); } catch (e) { p = null; }
  const e = (p && p.earn) || {};
  return { n, charged: e.charged || 0, tutor: e.tutorPayout || 0, room: e.venue || 0, fees: e.cardFees || 0, business: e.net || 0 };
}
/* WHAT IS WRONG WITH THE BOXES, in the words the server would use — '' when Save may go. */
function priceWrong_() {
  if (!(PRICE.rate > 0)) return 'Your rate is pounds an hour — more than £0.';
  if (PRICE.rate > STAFF_RATE_MAX) return 'Your rate is at most ' + money(STAFF_RATE_MAX) + ' an hour.';
  if (PRICE.seat < 0 || PRICE.seat > PRICE.rate * 2) return 'An extra seat adds £0 to ' + money(PRICE.rate * 2) + ' an hour — twice your rate.';
  return '';
}
const PRICE_SEGS = [['tutor', 'You'], ['room', 'Room'], ['fees', 'Card fees'], ['business', '@family.']];
function priceBarsHtml_() {
  const rows = [1, 2, 3].map(priceSplit_);
  const full = Math.max(1, ...rows.map(r => r.tutor + r.room + r.fees + Math.max(0, r.business)));
  const w = x => (Math.max(0, x) / full * 100).toFixed(2) + '%';
  return rows.map(r => `<div class="pb-row" data-n="${r.n}">
      <p class="pb-cap"><b>${r.n} ${r.n === 1 ? 'student' : 'students'}</b> <span class="pb-paid">family pays ${esc(money(r.charged))} an hour</span></p>
      <div class="pb-bar" role="img" aria-label="${esc(PRICE_SEGS.map(([k, l]) => l + ' ' + money(r[k])).join(', '))}">${
        PRICE_SEGS.map(([k]) => `<span class="pb-seg is-${k}" style="width:${w(r[k])}"></span>`).join('')}</div>
      <p class="pb-say">${PRICE_SEGS.map(([k, l]) => `<span class="pb-k is-${k}">${esc(l)} <b>${esc((r[k] < 0 ? '−' : '') + money(Math.abs(r[k])))}</b></span>`).join('')}</p>
    </div>`).join('') + (rows[0].business < 0
      ? `<p class="faint pb-note">With one student @family. keeps no share and pays the card fee itself.</p>` : '');
}
function priceHtml_() {
  const t = priceMine_();
  const usual = priceUsualSeat_(PRICE.rate);
  const s = typeof seatShare_ === 'function' ? seatShare_(t) : { bUsed: 0 };
  const v = ((typeof DATA !== 'undefined' && DATA && DATA.constants) || {}).vars || {};
  const fee = [Number(v.card_fee_pct) > 0 ? v.card_fee_pct + '%' : '', Number(v.card_fee_fixed) > 0 ? money(v.card_fee_fixed) + ' a payment' : ''].filter(Boolean).join(' + ');
  const ctl = (k, label, min, max, step, val, note) => `<div class="pf-var hub-var" data-pv="${k}">
      <p class="pf-name">${esc(label)}<span class="pf-from">${esc(note)}</span></p>
      <input type="range" data-pv="${k}" data-noswipe min="${min}" max="${max}" step="${step}" value="${val}" aria-label="${esc(label)}">
      <input type="number" class="pf-num" data-pv="${k}" min="0" max="${k === 'rate' ? STAFF_RATE_MAX : max}" step="${step}" value="${val}" inputmode="decimal" aria-label="${esc(label + ', typed')}">
    </div>`;
  const rooms = priceRooms_();
  const opt = (val, txt) => `<option value="${esc(val)}"${PRICE.loc === val ? ' selected' : ''}>${esc(txt)}</option>`;
  return `<div class="hub-price me-form">
    <h3>Pricing</h3>
    <p class="faint hub-lead">Move your rate and your extra seat and watch where an hour’s booking goes — worked out by the booking form’s own sum.</p>
    <div class="pf-vars">
      ${ctl('rate', 'Your rate, £ an hour', 5, Math.max(80, PRICE.rate), 0.5, PRICE.rate, PRICE.open ? 'none yet: the open rate' : 'the first student')}
      ${ctl('seat', 'Each extra seat adds, £ an hour', 0, Math.max(1, PRICE.rate * 2), 0.25, PRICE.seat, '0 is the usual ' + money(usual))}
    </div>
    <label class="field hub-room"><span>room</span><select data-pv="loc" aria-label="Room">${opt('', 'No room hire (online or at home)')}${
      rooms.map(r => opt(r.title, r.title + ' · ' + money(parseFloat(r.bestRate)) + '/h')).join('')}</select></label>
    <div class="pb" aria-live="polite">${priceBarsHtml_()}</div>
    <p class="faint hub-note">@family.’s share of each extra seat is ${esc(money((PRICE.rate || 0) * (s.bUsed || 0)))} an hour, set by @family.${
      fee ? ' Card fees are ' + esc(fee) + '.' : ''} What you charge can change once a month.</p>
    <div class="tile-row">${tile_({ icon: 'save', label: 'Save', note: 'your rate and seat', act: 'price-save' })}</div>
    <p class="faint me-said hub-said" aria-live="polite">${esc(priceWrong_())}</p>
  </div>`;
}
/* IN PLACE, as the thumb moves: widths and words change, so the bars slide (the CSS transition) and the slider stays held. */
function priceRedraw_() {
  const box = document.querySelector('#sheet-body .pb');
  if (!box) return;
  const rows = [1, 2, 3].map(priceSplit_);
  const full = Math.max(1, ...rows.map(r => r.tutor + r.room + r.fees + Math.max(0, r.business)));
  rows.forEach(r => {
    const row = box.querySelector('.pb-row[data-n="' + r.n + '"]');
    if (!row) return;
    PRICE_SEGS.forEach(([k, l], i) => {
      const seg = row.querySelector('.pb-seg.is-' + k);
      if (seg) seg.style.width = (Math.max(0, r[k]) / full * 100).toFixed(2) + '%';
      const say = row.querySelectorAll('.pb-k b')[i];
      if (say) say.textContent = (r[k] < 0 ? '−' : '') + money(Math.abs(r[k]));
    });
    row.querySelector('.pb-paid').textContent = 'family pays ' + money(r.charged) + ' an hour';
    row.querySelector('.pb-bar').setAttribute('aria-label', PRICE_SEGS.map(([k, l]) => l + ' ' + money(r[k])).join(', '));
  });
  const note = box.querySelector('.pb-note');
  if (note) note.hidden = !(rows[0].business < 0);
  const said = document.querySelector('#sheet-body .hub-said');
  if (said) said.textContent = priceWrong_();
}
function priceInput_(el) {
  const k = el.dataset.pv;
  if (k === 'loc') { PRICE.loc = el.value; priceRedraw_(); return; }
  const x = num(el.value);
  PRICE[k] = isNaN(x) ? 0 : x;
  PRICE.moved[k] = true;
  /* THE TWIN FOLLOWS: slider ↔ box, and the seat slider's end follows the rate (twice it). */
  document.querySelectorAll('#sheet-body [data-pv="' + k + '"]').forEach(o => { if (o !== el && o.tagName === 'INPUT') o.value = String(PRICE[k]); });
  if (k === 'rate') document.querySelectorAll('#sheet-body input[data-pv="seat"]').forEach(o => { o.max = String(Math.max(1, PRICE.rate * 2)); });
  priceRedraw_();
}
document.addEventListener('input', e => { const el = e.target; if (el && el.dataset && el.dataset.pv && el.closest('#sheet-body .hub-price')) priceInput_(el); });
document.addEventListener('change', e => { const el = e.target; if (el && el.dataset && el.dataset.pv && el.closest('#sheet-body .hub-price')) priceInput_(el); });
/* SAVE GOES THROUGH `updateProfile`, the card's own door: its refusals (the month, twice the rate, the most an hour) are the server's. */
on('price-save', el => {
  if (!hubFor_() || !USER) return;
  const said = document.querySelector('#sheet-body .hub-said');
  const no = priceWrong_();
  if (no) { if (said) said.textContent = no + ' Nothing was saved.'; toast(no); return; }
  const t = priceMine_();
  const fields = {};
  if (PRICE.moved.rate && (PRICE.open || PRICE.rate !== Number(t.rate))) fields.rate_per_hour = PRICE.rate;
  if (PRICE.moved.seat || fields.rate_per_hour !== undefined) {
    const was = typeof seatShare_ === 'function' ? seatShare_(t) : { seatOwn: false };
    const frac = PRICE.seat > 0 ? String(Math.round(PRICE.seat / PRICE.rate * 1e6) / 1e6) : '';
    if (PRICE.moved.seat || was.seatOwn) fields.extra_seat_rate = frac;
  }
  if (!Object.keys(fields).length) { toast('Nothing had changed'); return; }
  send_({ action: 'updateProfile', name: USER.name, personId: USER.personId || '', target: USER.name, targetId: USER.personId, fields },
        { button: el, busy: 'Saving…', where: said })
    .then(d => {
      USER.profile = (d && d.profile) ? d.profile : Object.assign({}, USER.profile || {}, fields);
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
      if (typeof cardPatchRow_ === 'function') cardPatchRow_(USER.personId, Object.assign({}, USER.profile, fields), fields);
      PRICE.moved = {}; PRICE.open = false;
      if (said) said.textContent = 'Saved — new bookings use it.';
      toast('Saved');
      try { load(); } catch (e) {}
    })
    .catch(() => { /* `send_` wrote the refusal under the form. */ });
});

/* ---------- THE MONTHLY STATEMENT: SESSIONS, WHAT THE FAMILY PAID, THE BUSINESS'S SHARE AND YOURS ----------
   `payStatement` is the asker's own; an admin names a tutor (`tutorId`) from Business. A statement, not a payslip. */
const ymOf_ = d => d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
const STMT = { month: ymOf_(new Date()), tutorId: '', tutorName: '', data: null, error: '', asking: false, seq: 0 };
const ymSay_ = ym => { const m = /^(\d{4})-(\d{2})$/.exec(ym || ''); return m ? MONTH_NAMES[+m[2] - 1] + ' ' + m[1] : ym; };
function stmtMonths_() {
  const out = [], d = new Date(); d.setDate(1);
  for (let i = 0; i < 12; i++) { out.push(ymOf_(d)); d.setMonth(d.getMonth() - 1); }
  return out;
}
function stmtPaper_(s) {
  const own = !STMT.tutorId || (USER && String(STMT.tutorId) === String(USER.personId));
  const day = iso => { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); return m ? (+m[3]) + ' ' + MONTH_NAMES[+m[2] - 1].slice(0, 3) : iso; };
  const rows = (s.sessions || []).map(r => `<tr><td><b>${esc(day(r.date))}</b><span>${esc(r.what)}</span></td><td>${esc(String(r.hours))}</td>
      <td>${esc(String(r.students))}</td><td>${esc(money(r.paid))}</td><td>${esc(money(r.business))}</td><td>${esc(money(r.tutor))}</td></tr>`).join('');
  const T = s.totals || {};
  return `<div class="stmt">
    <div class="stmt-head"><b>${esc(brand('name', '@family.'))}</b><span>Statement</span></div>
    <p class="stmt-who">${esc(s.tutor || '')} · ${esc(ymSay_(s.month))}</p>
    ${rows ? `<table class="stmt-t"><thead><tr><th>Session</th><th>Hrs</th><th>Pupils</th><th>Paid</th><th title="@family.’s share">Share</th><th>${own ? 'You' : 'Tutor'}</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td>${esc(String(T.sessions || 0))} ${T.sessions === 1 ? 'session' : 'sessions'}</td><td>${esc(String(T.hours || 0))}</td><td></td>
        <td>${esc(money(T.paid))}</td><td>${esc(money(T.business))}</td><td>${esc(money(T.tutor))}</td></tr></tfoot></table>`
      : `<p class="stmt-none">No paid sessions in ${esc(ymSay_(s.month))}.</p>`}
    <p class="stmt-note">A statement of sessions taught, not a payslip. Paid is what the family paid for each session and Share is @family.’s; ${own ? 'you are' : 'the tutor is'} self-employed and responsible for ${own ? 'your' : 'their'} own tax and National Insurance.</p>
  </div>`;
}
function stmtOutHtml_() {
  if (STMT.asking) return loading_();
  if (STMT.error) return `<p class="faint stmt-said">${esc(STMT.error)}</p>`;
  return STMT.data ? stmtPaper_(STMT.data) : '';
}
function stmtHtml_() {
  const opt = ym => `<option value="${ym}"${ym === STMT.month ? ' selected' : ''}>${esc(ymSay_(ym))}</option>`;
  return `<div class="hub-stmt">
    <h3>Statement${STMT.tutorName ? ' · ' + esc(STMT.tutorName) : ''}</h3>
    <label class="field"><span>month</span><select data-stmt="month" aria-label="Month">${stmtMonths_().map(opt).join('')}</select></label>
    <div class="stmt-out"${STMT.asking ? ' aria-busy="true"' : ''}>${stmtOutHtml_()}</div>
    <div class="tile-row">${tile_({ icon: 'print', label: 'Download PDF', note: 'print or save', act: 'stmt-print', off: !STMT.data })}</div>
  </div>`;
}
function stmtDraw_() {
  const out = document.querySelector('#sheet-body .stmt-out');
  if (!out) return;
  out.innerHTML = stmtOutHtml_();
  if (STMT.asking) out.setAttribute('aria-busy', 'true'); else out.removeAttribute('aria-busy');
  const p = document.querySelector('#sheet-body [data-do="stmt-print"]');
  if (p) p.disabled = !STMT.data;
}
function stmtAsk_() {
  const seq = ++STMT.seq;
  STMT.asking = true; STMT.error = ''; STMT.data = null;
  stmtDraw_();
  api({ action: 'payStatement', month: STMT.month, tutorId: STMT.tutorId || '', personId: (USER && USER.personId) || '' })
    .then(d => {
      if (seq !== STMT.seq) return;
      STMT.asking = false;
      if (!d || d.error || !d.success) { STMT.error = String((d && d.error) || 'The statement did not come.'); return; }
      STMT.data = d;
    })
    .catch(() => { if (seq === STMT.seq) { STMT.asking = false; STMT.error = 'The statement could not be fetched — check the connection.'; } })
    .then(() => { if (seq === STMT.seq) stmtDraw_(); });
}
document.addEventListener('change', e => {
  const el = e.target;
  if (!el || !el.matches || !el.matches('#sheet-body select[data-stmt="month"]')) return;
  STMT.month = el.value;
  stmtAsk_();
});
/* "DOWNLOAD PDF" IS THE PRINT DIALOGUE: a paper copy at the end of the body, everything else hidden (`.printing-stmt`), as the mat prints. */
on('stmt-print', () => {
  const src = document.querySelector('#sheet-body .stmt');
  if (!src || !STMT.data) return;
  const paper = document.createElement('div');
  paper.className = 'stmt-paper';
  paper.innerHTML = src.outerHTML;
  document.body.appendChild(paper);
  document.body.classList.add('printing-stmt');
  const was = document.title;
  document.title = 'Statement ' + (STMT.data.tutor || '') + ' ' + STMT.data.month;
  const done = () => {
    document.body.classList.remove('printing-stmt');
    paper.remove();
    document.title = was;
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  /* AND A TIMER: some browsers never fire `afterprint` on a cancelled dialogue, which would leave the app hidden. */
  setTimeout(done, 4000);
  window.print();
});

/* ---------- IN BUSINESS: WHO TEACHES, WHO HAS AGREED TO THE CURRENT TERMS, AND ANY TUTOR'S STATEMENT ---------- */
const STAFF = { list: null, error: '', asking: false };
const staffAgreed_ = s => String(s.termsVersion || '') === termsVersion_();
function staffCard_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  return `<div class="card biz staff-card" data-staff data-need="terms">${staffInner_(!STAFF.list && !STAFF.error)}</div>`;
}
function staffInner_(wait) {
  const list = STAFF.list || [];
  const n = list.filter(s => !staffAgreed_(s)).length;
  const item = s => `<div class="biz-item staff-item" data-id="${esc(s.personId)}">
      <p class="biz-cap"><b>${esc(s.name)}</b> <span class="biz-when">· ${esc(s.rank === 'admin' ? 'admin' : 'staff')}</span>
        ${staffAgreed_(s) ? '' : `<b class="biz-flag">${s.termsVersion ? 'Old terms' : 'Not agreed'}</b>`}</p>
      <p class="faint staff-terms">${staffAgreed_(s) ? 'Agreed to the terms on ' + esc(s.termsAt) : s.termsVersion
        ? 'Agreed to version ' + esc(s.termsVersion) + ', not the current ' + esc(termsVersion_()) : 'Has not agreed to the tutor terms'}</p>
      <div class="tile-row">${tile_({ icon: 'print', label: 'Statement', note: 'any month', act: 'stmt-for', data: { id: s.personId, name: s.name } })}</div>
    </div>`;
  return `<h3>Staff</h3>
    ${bizNeed_('terms', STAFF.list ? n : 0, n + ' not agreed to the terms')}
    <div class="biz-body staff-body"${wait ? ' aria-busy="true"' : ''}>
      ${STAFF.list && !list.length ? '<p class="faint">Nobody teaches yet.</p>' : ''}
      ${list.map(item).join('')}
    ${wait ? loading_() : ''}</div>
    <p class="faint me-said staff-said">${esc(STAFF.error)}</p>`;
}
const staffDraw_ = () => { document.querySelectorAll('[data-staff]').forEach(c => { c.innerHTML = staffInner_(false); }); if (typeof bizNeedsPaint_ === 'function') bizNeedsPaint_(); };
function staffStart_() {
  if (!(typeof isAdmin === 'function' && isAdmin()) || STAFF.asking) return;
  STAFF.asking = true;
  api({ action: 'listStaff' })
    .then(d => {
      STAFF.asking = false;
      if (!d || d.error) { STAFF.error = String((d && d.error) || 'The staff list did not come.'); return; }
      STAFF.error = ''; STAFF.list = Array.isArray(d.staff) ? d.staff : [];
    })
    .catch(() => { STAFF.asking = false; STAFF.error = 'The staff list could not be fetched — check the connection.'; })
    .then(staffDraw_);
}
on('stmt-for', el => {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  STMT.tutorId = el.dataset.id || ''; STMT.tutorName = el.dataset.name || '';
  openSheet('Statement', `<div class="hub">${stmtHtml_()}</div>`);
  stmtAsk_();
});
