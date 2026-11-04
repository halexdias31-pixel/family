/* @family. — digest.gs THE SUNDAY PARENT EMAIL, AND THE MARKS IN IT § */


/* ---------- THE SWITCH, AND THE TWO NUMBERS BESIDE IT § */
function digestMode_(cfg) {
  const m = norm(cfg && cfg.weekly_digest);
  return DIGEST_MODES.indexOf(m) !== -1 ? m : 'off';
}
function digestHour_(cfg) {
  const c = S(cfg && cfg.weekly_digest_hour);
  return /^\d{1,2}$/.test(c) && Number(c) <= 23 ? Number(c) : 21;
}
function digestReserve_(cfg) {
  const c = S(cfg && cfg.weekly_digest_reserve);
  return /^\d+$/.test(c) ? Number(c) : 10;
}


/* ---------- WHAT A WEEK IS: MONDAY 00:00 TO SUNDAY 23:59, LONDON § */
function digestDay_(now) {
  const d = now instanceof Date && !isNaN(now) ? now : new Date();
  return Utilities.formatDate(d, DIGEST_TZ, 'yyyy-MM-dd');
}
function digestShift_(iso, days) {
  const t = Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) + days * 864e5;
  return new Date(t).toISOString().slice(0, 10);
}
/* The Monday and the Sunday of the week a London day is in. */
function digestWeekOf_(iso) {
  const dow = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10))).getUTCDay();
  const back = (dow + 6) % 7;                   // Monday 0 … Sunday 6
  return { start: digestShift_(iso, -back), end: digestShift_(iso, 6 - back) };
}
/* The week `now` is in — what the admin's Preview shows: this week so far. */
function digestWeek_(now) {
  const today = digestDay_(now);
  return Object.assign(digestWeekOf_(today), { today: today });
}
/* ---------- AND THE WEEK A RUN SENDS § */
function digestWeekToSend_(now) {
  const w = digestWeek_(now);
  if (w.today === w.end) return w;
  return Object.assign(digestWeekOf_(digestShift_(w.start, -1)), { today: w.today });
}
/* `28 Sep – 4 Oct`, off the two strings — no Date, so no time zone to get wrong. */
function digestSpan_(week) {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const say = iso => (+iso.slice(8, 10)) + ' ' + MON[+iso.slice(5, 7) - 1];
  return say(week.start) + ' – ' + say(week.end);
}


/* ---------- THE PLAN: WHO DID WHAT, AND WHO IS TOLD § */
function digestPlan_(week, subRows, peopleRows, parentsOf, look) {
  const byId = {};
  (peopleRows || []).forEach(p => { const id = S(p && p.person_id); if (id && !byId[id]) byId[id] = p; });

  /* ONE QUESTION, HOWEVER MANY BOXES IT HAS. § */
  /* AND NO "60 min" IN A NAME. § */
  const tidy = v => attemptLabel_(v).split(' · ').filter(x => !/^\d+ min$/.test(x)).join(' · ');
  /* ---------- EVERY PRESS, FOLDED INTO ONE LINE PER QUESTION § */
  const joined = {};
  (subRows || []).forEach(r => {
    const pid = S(r && r.person_id), q = S(r && r.key).split('#')[0], slot = S(r && r.key).split('#')[1] || '';
    if (!pid || !q) return;
    const came = answerAtMs_(r.submitted_at);
    if (!came) return;
    const ms = answerAtMs_(r.pressed_at) || came;
    const day = digestDay_(new Date(came));
    if (day > week.end) return;
    const id = pid + '\u0001' + q;
    const J = joined[id] || (joined[id] = { pid: pid, key: q, before: false, inWeek: false, at: -1, last: '',
                                            verdict: '', label: '', labelAt: -1, words: '', wordsAt: -1, ans: {}, days: {} });
    const l = tidy(r.label), w = attemptWords_(r.words);
    if (l && ms >= J.labelAt) { J.label = l; J.labelAt = ms; }
    if (w && ms >= J.wordsAt) { J.words = w; J.wordsAt = ms; }
    /* WORK CARRIED OVER FROM BEFORE THE SWITCH IS HISTORY, WHENEVER IT ARRIVED (`SUBMISSION_CARRIED`): § */
    if (SUBMISSION_CARRIED.test(S(r.event_id))) { J.before = true; return; }
    if (day < week.start) { J.before = true; return; }
    J.inWeek = true;
    J.days[day] = 1;
    if (ms >= J.at) { J.at = ms; J.last = day; J.verdict = S(r.verdict); }
    /* WHAT THE CHILD LAST SENT, box by box — a worksheet's three boxes are one question (380). */
    const had = J.ans[slot];
    if (!had || ms >= had.ms) J.ans[slot] = { ms: ms, a: S(r.answer).replace(/^'/, '') };
  });

  const per = {};
  Object.keys(joined).forEach(id => {
    const J = joined[id];
    if (!J.inWeek) return;
    const fresh = !J.before;
    const L = per[J.pid] || (per[J.pid] = { id: J.pid, fresh: [], again: [], days: [] });
    Object.keys(J.days).forEach(d => { if (L.days.indexOf(d) === -1) L.days.push(d); });
    /* THE NAME A PARENT CAN READ — see SCHEMA.submissions for why the backend cannot look a key up for itself. § */
    const label = digestSafe_(J.label) ? J.label : '';
    /* AND THE QUESTION'S WORDS (SCHEMA.submissions), by the same rule over the whole of them: § */
    const words = label && DIGEST_KEY_SHAPE.test(J.key) && digestWordsSafe_(J.words) ? J.words : '';
    /* AND HOW IT WENT, the week's last word on it — a verdict outside the vocabulary prints no mark. */
    const verdict = SUBMISSION_VERDICT.test(J.verdict) ? J.verdict : '';
    const answer = Object.keys(J.ans).sort().map(k => J.ans[k].a.trim()).filter(Boolean).join(' ; ');
    const item = { key: J.key, label: label, words: words, hidden: !label, last: J.last, verdict: verdict, answer: answer };
    (fresh ? L.fresh : L.again).push(item);
  });

  const order = (a, b) => (a.last < b.last ? -1 : a.last > b.last ? 1 : a.label < b.label ? -1 : a.label > b.label ? 1 : 0);
  const learners = [], emails = [], unreachable = [];
  Object.keys(per).forEach(pid => {
    const L = per[pid];
    L.fresh.sort(order); L.again.sort(order); L.days.sort();
    L.count = L.fresh.length + L.again.length;
    const me = byId[pid];
    /* `nameFor_` — the admin's Preview names a child by first name like everything else (the owner,
       10 Oct: *"dont show children's last name"*); the email itself only ever said `L.first`. */
    L.name = me ? nameFor_(me) : '';
    /* THE CHILD'S FIRST NAME GOES IN THE SUBJECT LINE, and it is a cell the child can edit. A name
       that is a link, an address or a sentence is "Your child" instead. */
    L.first = me && digestSafe_(me.first_name) && S(me.first_name).length <= 30 ? S(me.first_name) : '';
    L.to = []; L.skipped = []; L.why = '';
    if (!me) {
      L.why = 'not on the people tab';
    } else {
      const R = digestReach_(pid, parentsOf);
      L.to = R.to; L.skipped = R.skipped;
      /* THE REASON IN WORDS, naming each parent, because "unreachable" alone sends the owner to the
         family tab to work out which of three things it is. */
      if (!L.to.length) {
        L.why = !R.linked ? 'no parent has accepted a link to them'
              : 'no parent can be told — ' + L.skipped.map(s => (s.name || s.id) + ': ' + s.why).join('; ');
      }
    }
    learners.push(L);
    if (L.why) { unreachable.push({ id: pid, name: L.name, count: L.count, why: L.why }); return; }
    L.to.forEach(p => {
      const m = digestRender_(L, p, week, look);
      emails.push({ week: week.start, learner_id: pid, parent_id: p.id, learner: L.name, parent: p.name,
                    to: p.email, subject: m.subject, text: m.text, html: m.html, count: L.count });
    });
  });
  learners.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return { week: week, learners: learners, emails: emails, unreachable: unreachable, look: look || {} };
}


/* ---------- WHICH OF A LEARNER'S PARENTS IS TOLD, AND WHY NOT THE REST § */
function digestReach_(pid, parentsOf) {
  let parents = [];
  try { parents = parentsOf(pid) || []; } catch (err) { parents = []; }
  const to = [], skipped = [], seenId = {}, seenMail = {};
  let linked = 0;
  parents.forEach(p => {
    const id = S(p && p.person_id);
    /* NEVER THE LEARNER, whatever the family tab says — a row linking somebody to themselves is a
       typo, and "not emailed to themselves" is the rule. */
    if (!id || id === pid || seenId[id]) return;
    seenId[id] = 1;
    linked++;
    const who = { id: id, name: personDisplayName(p), first: S(p.first_name), email: S(p.email) };
    if (!who.email) { skipped.push(Object.assign(who, { why: 'no email address' })); return; }
    /* NEVER AN ADDRESS NOBODY CONFIRMED. § */
    if (addressPending_(p)) { skipped.push(Object.assign(who, { why: 'email not confirmed' })); return; }
    /* THEIR OWN CHOICE, through the one reader every sender asks (`wants_` in people.gs) — still the `weekly_email` cell, blank is yes, and now also the Weekly § */
    if (!wants_(p, 'weekly')) { skipped.push(Object.assign(who, { why: 'asked not to get it' })); return; }
    /* ONE MAILBOX ONCE PER CHILD, if two parent rows share an address. */
    const m = norm(who.email);
    if (seenMail[m]) { skipped.push(Object.assign(who, { why: 'same address as another parent' })); return; }
    seenMail[m] = 1;
    to.push(who);
  });
  return { to: to, skipped: skipped, linked: linked };
}

/* ---------- ONE EMAIL: A SUBJECT, A PLAIN BODY AND THE SAME IN HTML § */
function digestRender_(L, P, week, look) {
  const kid = S(L.first) || 'Your child';
  /* THE OWNER (372): each parent by their first name, casual, no branding anywhere. A name that is not safe to print is just "Hi,". */
  const pf = S(P && P.first).split(/\s+/)[0];
  const W = (look && look.words) || digestWords_({});
  const items = (L.fresh || []).concat(L.again || []);
  const n = items.length;
  const qs = x => x + ' question' + (x === 1 ? '' : 's');
  /* "WORKED ON", NOT "DID". § */
  const hour = look && typeof look.hour === 'number' ? look.hour : -1;
  const minute = look && typeof look.minute === 'number' && look.minute > 0 && look.minute < 60 ? look.minute : 0;
  const clock = minute ? ((hour % 12) || 12) + ':' + String(minute).padStart(2, '0') + (hour < 12 ? 'am' : 'pm')
    : hour === 0 ? 'midnight' : hour === 12 ? 'noon' : (hour % 12) + (hour < 12 ? 'am' : 'pm');
  const upTo = hour >= 0 && hour <= 23 ? ', up to ' + clock + ' on Sunday' : '';
  const ink = digestInk_();

  /* THE WEEK'S QUESTIONS, AT MOST `DIGEST_WEEK_LIST_MAX`, THEN "…and N more." A question with no name
     `digestPlan_` would print — hidden, or only its own key — is counted in `n` and never listed, so it
     is part of the "more". */
  /* EACH QUESTION AS IT IS ON THE SITE when the library has it (`look.lib`, 18 Oct) — see `digestPartOut_`. */
  const opts = { lib: look && look.lib, site: S(look && look.site) || SITE_URL, kid: kid, cut: {} };
  /* ONE PLAIN LINE TO STOP, and no business name, logo or link (372). */
  const fill = { child: kid, parent: pf && pf.length <= 30 && digestSafe_(pf) ? pf : '', count: qs(n), span: digestSpan_(week) + upTo };
  const hi = digestFill_(W.digest_greeting, fill);
  const foot = digestFill_(W.digest_footer, fill);
  const subject = digestFill_(W.digest_subject, fill);
  const S0 = digestSummary_(items, L.days, opts.lib, week);
  const make = Q => {
    /* THE KEY IS SAID FOR THE MARKS THE LIST PRINTS — not every item of the week. § */
    const legend = [];
    if (Q.marks.indexOf('✓') !== -1) legend.push('✓ right');
    if (Q.marks.indexOf('✗') !== -1) legend.push('✗ not right');
    if (Q.marks.some(m => / of \d+ marks?$/.test(m))) legend.push('the marks an AI marker gave a written answer');
    const said = legend.length < 2 ? legend.join('')
      : legend.slice(0, -1).join(', ') + (legend.length > 2 ? ',' : '') + ' or ' + legend[legend.length - 1];
    const unnamed = n && !Q.printed
      ? (n === 1 ? ' It could not be named here, so it is not listed.' : ' They could not be named here, so they are not listed.')
      : '';
    const first = digestFill_(W.digest_intro, fill);
    /* THE KEY IS FOR THE PLAIN BODY: in the HTML each card says its verdict in words (380). */
    const lead = first + (said ? (Q.fromLib ? ' How each one went: ' : ' Beside each one is how it went: ') + said + '.' : '') + unnamed;
    const p = (t, st) => '<p style="margin:0 0 12px;' + (st || '') + '">' + t + '</p>';
    const body = p(digestEsc_(hi)) + p(digestEsc_(first + unnamed)) + S0.html + Q.html
      + p(digestEsc_(foot), 'margin:24px 0 0;color:' + ink.dim + ';font-size:12px');
    return {
      text: [hi, '', lead].concat(S0.lines, ['']).concat(Q.lines, [foot]).join('\n'),
      /* ONE TABLE THE WIDTH OF A PHONE, AT MOST 600 — the `width` for Outlook, which reads no max-width; every colour said, so a dark inbox inverts all of it or none (380). */
      html: digestDarkDoc_(ink, '<table role="presentation" class="kb" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + ink.page + '" style="background:' + ink.page + '">'
        + '<tr><td align="center" class="kb" bgcolor="' + ink.page + '" style="padding:12px 8px;background:' + ink.page + '">'
        + '<table role="presentation" class="kb" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="' + ink.page + '" style="width:100%;max-width:600px">'
        + '<tr><td class="kb" bgcolor="' + ink.page + '" style="font-family:' + ink.mono + ';font-size:14px;line-height:1.5;color:' + ink.ink + ';text-align:left">'
        + '<div class="gs"><div class="gd">' + body + '</div></div></td></tr></table></td></tr></table>'),
    };
  };
  let Q = digestQuestions_(items, DIGEST_WEEK_LIST_MAX, opts), m = make(Q);
  /* ---------- AND UNDER GMAIL'S CLIP, EVERY QUESTION KEPT § */
  for (let turn = 0; turn < 12 && digestBytes_(m.html) > DIGEST_CLIP_BYTES; turn++) {
    let over = digestBytes_(m.html) - DIGEST_CLIP_BYTES;
    const next = Q.sizes.filter(z => z.bytes && !opts.cut[z.id])
      .sort((a, b) => (a.kind === b.kind ? b.bytes - a.bytes : DIGEST_CUT_FIRST.indexOf(a.kind) - DIGEST_CUT_FIRST.indexOf(b.kind)));
    if (!next.length) break;
    for (let k = 0; k < next.length && over > 0; k++) { opts.cut[next[k].id] = 1; over -= next[k].bytes - 80; }
    Q = digestQuestions_(items, DIGEST_WEEK_LIST_MAX, opts);
    m = make(Q);
  }
  return { subject: subject, text: m.text, html: m.html };
}

/* WHAT THE CLIP GIVES UP FIRST: a long source, then a later card's repeat of its paper's tags, then a question's own words. */
const DIGEST_CUT_FIRST = ['stem', 'tags', 'part'];
/* THE EMAIL'S COLOURS: the site's black-and-gold screen (style.css `:root`) — page, pane, card, ink, verdicts; no paper, even for the answer box (25 Oct, 457). */
function digestInk_() {
  return { page: '#000', pane: '#101010', paneLine: '#383838', card: '#0b0b0b', line: '#232323', ink: '#e6e6e6', dim: '#9a9a9a',
           faint: '#848484', chip: '#3d3d3d', gold: '#ffb454', right: '#3ddc84', wrong: '#ff5f56',
           box: '#1a1a1a', mono: "ui-monospace,'SF Mono','Cascadia Mono',Menlo,Consolas,'Courier New',monospace" };
}

/* DARK EVERYWHERE (the owner, 20 Oct): said dark to every client, Outlook's [data-ogsb]/[data-ogsc] held; no Gmail-app gradient, which keeps the black but not the white words (380). */
function digestDarkDoc_(ink, inner) {
  const k = '.kb{background:' + ink.page + '}.kp{background:' + ink.pane + '}.kc{background:' + ink.card + '}';
  return '<!DOCTYPE html><html lang="en" style="background:' + ink.page + '"><head><meta charset="utf-8">'
    + '<meta name="color-scheme" content="dark"><meta name="supported-color-schemes" content="dark">'
    + '<style>:root{color-scheme:dark;supported-color-schemes:dark}html,body{background:' + ink.page + '!important;color:' + ink.ink + '}' + k
    + '[data-ogsb] .kb{background-color:' + ink.page + '!important}[data-ogsb] .kp{background-color:' + ink.pane + '!important}[data-ogsb] .kc{background-color:' + ink.card + '!important}'
    + '[data-ogsc] .kb{color:' + ink.ink + '!important}'
    /* THE GMAIL APP'S DARK MODE INVERTS A DARK EMAIL TO LIGHT (the owner's screenshot, 25 Oct, 457): screen then difference undo it; `.gi` undoes it again for a picture or a colour. */
    + 'u+.body .kb{background-image:linear-gradient(#000,#000)}u+.body .gs{background:#000;mix-blend-mode:screen}u+.body .gd{background:#000;mix-blend-mode:difference}u+.body .gi{mix-blend-mode:difference}</style></head>'
    + '<body class="body" bgcolor="' + ink.page + '" style="margin:0;padding:0;background:' + ink.page + ';color:' + ink.ink + '">' + inner + '</body></html>';
}

/* HOW ONE QUESTION WENT, by the week's last word on it: right, part marks, not right, not marked — never how many goes it took (the owner, 20 Oct). */
function digestHow_(verdict) {
  const m = /^(?:ai|rule):(\d{1,3})\/(\d{1,3})$/.exec(S(verdict));
  if (S(verdict) === 'right' || (m && +m[1] >= +m[2])) return 'right';
  if (m && +m[1] > 0) return 'part';
  if (S(verdict) === 'wrong' || m) return 'wrong';
  return 'open';
}
/* THE WORDS AND COLOUR FOR EACH WAY A QUESTION WENT — the summary's figures and each card's verdict say the same thing. */
function digestHowSay_() {
  const ink = digestInk_();
  return [{ id: 'right', many: 'right', one: '✓ Right', tone: ink.right },
          { id: 'part', many: 'with part marks', one: '', tone: ink.gold },
          { id: 'wrong', many: 'not right', one: '✗ Not right', tone: ink.wrong },
          { id: 'open', many: 'not marked yet', one: 'Not marked yet', tone: ink.dim }];
}
/* A NAME THAT IS A PAPER'S AND NOT A TOPIC'S — "Paper 1F (Non-calculator) — June 2024", "Paper X", a mock, a 5-a-day's date, a board, a year or a month (380, 20 Oct). */
const DIGEST_NOT_TOPIC = /\bpapers?\b|\bmock\b|\bspecimen\b|5-a-day|\b(?:19|20)\d\d\b|\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b|\b(?:aqa|edexcel|ocr|wjec|eduqas|ccea)\b|testing agency/i;
/* WHAT ONE QUESTION WAS ABOUT: the library's `topics`; else its topic worksheet's own name; else, for a paper, only its subject (`own: false`). */
function digestTopicOf_(q, libRow) {
  const ok = t => !!t && t.length <= 60 && digestSafe_(t);
  const tags = S(libRow && libRow.topics).split(',').map(t => t.trim()).filter(ok);
  if (tags.length) return { own: true, list: tags };
  const sheet = t => S(t).replace(/\s*\((?:foundation|higher)\)$/i, '').trim();
  const bits = S(q && q.label).split(' · ').map(x => x.trim()).filter(Boolean);
  if (bits.length && /^worksheet$/i.test(bits[bits.length - 1])) bits.pop();
  /* A QUESTION'S LABEL ENDS IN ITS NUMBER ("Q3", "Q8ii"); a content card's ends in its own title, so nothing is cut from it. */
  if (/^q:/.test(S(q && q.key)) && bits.length > 1 && /^Q?\d+[a-z]*(?:\(?[ivx]+\)?)*$/i.test(bits[bits.length - 1])) bits.pop();
  const paperish = libRow ? /paper|5-a-day/i.test(S(libRow.document_type)) : false;
  const name = libRow ? sheet(libRow.name) : bits.length > 1 ? sheet(bits[bits.length - 1]) : '';
  if (!paperish && ok(name) && !DIGEST_NOT_TOPIC.test(name)) return { own: true, list: [name] };
  const subj = S(libRow && libRow.subject) || (bits.length > 1 ? bits[0] : '');
  return { own: false, list: ok(subj) && !DIGEST_NOT_TOPIC.test(subj) ? [subj] : [] };
}
/* "a, b and c" */
function digestAnd_(list) {
  return list.length < 2 ? list.join('') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
}

/* ---------- THE SUMMARY ABOVE THE QUESTIONS (20 Oct, docs/history/380): how many, how they went, the topics, the days */
function digestSummary_(items, days, lib, week) {
  const ink = digestInk_(), says = digestHowSay_();
  const count = {};
  (items || []).forEach(q => { const h = digestHow_(q && q.verdict); count[h] = (count[h] || 0) + 1; });
  const shown = says.filter(w => count[w.id]);
  const sentence = shown.map(w => count[w.id] + ' ' + w.many);
  const said = sentence.length ? sentence[0].charAt(0).toUpperCase() + digestAnd_(sentence).slice(1) + '.' : '';
  /* THE TOPICS (`digestTopicOf_`), the commonest first; a paper's bare subject only when nothing in the week has a topic of its own. */
  const tally = {}, subj = {};
  (items || []).forEach(q => {
    const T = digestTopicOf_(q, digestLibRow_(lib && lib.rows ? lib : null, q && q.key));
    T.list.forEach(t => { const into = T.own ? tally : subj; into[t] = (into[t] || 0) + 1; });
  });
  const from = Object.keys(tally).length ? tally : subj;
  const topics = Object.keys(from).sort((a, b) => from[b] - from[a] || a.localeCompare(b));
  /* ALWAYS A TOPICS LINE when there was work, even one the week cannot name — its absence is what the owner noticed (20 Oct). */
  const topicSay = topics.length > 6 ? topics.slice(0, 6).concat([(topics.length - 6) + ' more'])
    : topics.length ? topics : ['not recorded'];
  const NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayNames = (days || []).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && (!week || (d >= week.start && d <= week.end)))
    .sort().map(d => NAMES[new Date(d + 'T12:00:00Z').getUTCDay()]);
  const lines = [];
  if (said) lines.push(said);
  if (topicSay.length) lines.push('Topics: ' + digestAnd_(topicSay) + '.');
  if (dayNames.length) lines.push('Days: ' + digestAnd_(dayNames) + '.');
  if (!(items || []).length) return { lines: [], html: '' };
  /* THE FIGURES, A ROW OF THEM: the total, then each way it went that happened at all. */
  const cells = [{ n: items.length, say: items.length === 1 ? 'question' : 'questions', tone: ink.ink }]
    .concat(shown.map(w => ({ n: count[w.id], say: w.many, tone: w.tone })));
  /* THREE TO A ROW, so five figures fit a phone 390 wide without a sideways scroll. */
  const per = cells.length > 3 ? 3 : cells.length, wide = Math.floor(100 / per);
  const rows = [];
  for (let i = 0; i < cells.length; i += per) rows.push(cells.slice(i, i + per));
  const cell = c => '<td width="' + wide + '%" valign="top" style="padding:0 6px 10px 0">'
    + '<div' + (c.tone === ink.ink ? '' : ' class="gi"') + ' style="font-size:24px;line-height:1.1;font-weight:bold;color:' + c.tone + '">' + c.n + '</div>'
    + '<div style="font-size:11px;line-height:1.3;color:' + ink.dim + '">' + digestEsc_(c.say) + '</div></td>';
  const small = (label, text) => '<p style="margin:4px 0 0;font-size:13px;line-height:1.45;color:' + ink.ink + '">'
    + '<span style="color:' + ink.dim + '">' + label + '</span> ' + digestEsc_(text) + '</p>';
  /* THE SITE'S PANE — `.pane`, #101010 inside a faint rim, rounded — every fill said, so a dark inbox has nothing to invert into mud. */
  const html = '<table role="presentation" class="kp" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + ink.pane + '" style="border:1px solid ' + ink.paneLine
    + ';border-radius:14px;margin:4px 0 16px"><tr><td style="padding:16px 14px">'
    /* A HEADING NOBODY SCROLLS PAST (the owner missed the first one, 20 Oct): the size of a title, then the topics before any figure. */
    + '<p class="gi" style="margin:0 0 10px;font-size:17px;line-height:1.3;font-weight:bold;color:' + ink.gold + '">Summary of the week</p>'
    + (said ? '<p style="margin:0 0 8px">' + digestEsc_(said) + '</p>' : '')
    + (topicSay.length ? '<p style="margin:0 0 12px"><b>Topics:</b> ' + digestEsc_(digestAnd_(topicSay)) + '</p>' : '')
    + '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">'
    + rows.map(r => '<tr>' + r.map(cell).join('') + (r.length < per ? '<td width="' + wide * (per - r.length) + '%" colspan="' + (per - r.length) + '"></td>' : '') + '</tr>').join('')
    + '</table>'
    + (dayNames.length ? small('Days', dayNames.map(d => d.slice(0, 3)).join(' · ')) : '')
    + '</td></tr></table>';
  return { lines: lines, html: html };
}

/* ---------- THE QUESTIONS, EACH WITH ITS OWN WORDS § */
function digestQuestions_(items, max, o) {
  items = items || [];
  o = o || {};
  const n = items.length;
  const ink = digestInk_(), says = digestHowSay_();
  /* THE LIBRARY'S ROWS FOR THE WEEK (`digestEmailLibrary_`), and what the clip has asked to be said as "on the site" (`digestRender_`): § */
  const lib = o.lib && o.lib.rows ? o.lib : null, pre = lib && lib.pre ? lib.pre : [];
  const said = o.cut || {}, kid = S(o.kid) || 'Your child', site = S(o.site) || SITE_URL;
  const cut = (t, most) => { const x = S(t).replace(/\s*\n+\s*/g, ' ').trim(); return x.length > most ? x.slice(0, most - 1).replace(/\s+\S*$/, '') + '…' : x; };
  const heads = {};
  items.forEach(q => {
    const label = S(q && q.label);
    if (!label || (q && q.hidden) || label === S(q && q.key)) return;
    const bits = label.split(' · ');
    const head = bits.length > 1 ? bits.slice(0, -1).join(' · ') : label;
    const num = bits.length > 1 ? bits[bits.length - 1] : '';
    /* THE STEM AND THE ASK, either side of a `---` line — which may be the last line, when a part's own
       ask is only its picture and the cell was trimmed. */
    const w = S(q && q.words), cutAt = /\n---(?:\n|$)/.exec(w);
    const row = digestLibRow_(lib, q && q.key);
    (heads[head] || (heads[head] = [])).push({ mark: digestMark_(q && q.verdict), how: digestHow_(q && q.verdict),
      key: S(q && q.key), row: row, num: num, stem: cutAt ? w.slice(0, cutAt.index) : '', ask: cutAt ? w.slice(cutAt.index + cutAt[0].length) : w,
      theirs: digestTheirAnswer_(row, q && q.answer), right: digestRightAnswer_(row),
      tags: digestWornTags_(lib, row, bits, num) });
  });
  /* A CAP THAT IS NOT A NUMBER IS THE WEEK'S, never "all of them": `slice(0, undefined)` is the whole
     list, and the cap is what keeps an email under the size a mail client clips it at. */
  let room = typeof max === 'number' && max >= 0 ? max : DIGEST_WEEK_LIST_MAX, printed = 0;
  const shown = [];
  Object.keys(heads).sort((a, b) => a.localeCompare(b)).forEach(h => {
    if (room <= 0) return;
    const list = heads[h].slice().sort((a, b) => a.num.localeCompare(b.num, undefined, { numeric: true }));
    const take = list.slice(0, room);
    room -= take.length; printed += take.length;
    shown.push({ head: h, items: take, worded: take.some(it => S(it.ask) || it.row) });
  });
  const more = n - printed;
  /* A NAME OF ONE SEGMENT HAS NO NUMBER, so no number in its tag: its mark alone, and its words after —
     never ": What is 7 × 8?". */
  const tag = it => (it.num ? it.num + ' ' + it.mark : it.mark);
  /* ---------- ONE QUESTION AS THE SITE'S CARD (20 Oct, 380): the pane, the card in it, its tags, its words and picture, then how it went § */
  /* LEAN, BECAUSE IT IS SAID 80 TIMES UNDER GMAIL'S CLIP: `bgcolor` for every fill, the font and ink inherited from the email's own cell. */
  const head = (t, top) => '<p style="margin:' + (top || 14) + 'px 0 4px;font-size:10px;letter-spacing:1px;color:' + ink.faint + '">' + t + '</p>';
  const card = (it, inner, tags) => {
    const w = says.filter(x => x.id === it.how)[0] || says[says.length - 1];
    /* THE PANE IS THE CARD'S OWN BORDER — 10px of `.pane`'s #101010 round `.qcard`'s #0b0b0b, rounded — one table where the site has two boxes. */
    return '<table role="presentation" class="kc" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + ink.card + '" style="border:10px solid ' + ink.pane
      + ';border-radius:14px;margin:0 0 14px"><tr><td style="padding:12px 11px">'
      + (tags ? '<div style="font-size:10px;line-height:24px;margin:0 0 8px">' + tags + '</div>' : '') + inner
      /* IN THE SITE CARD'S ORDER (547): THEIR ANSWER in the answer box, then the VERDICT under it as Check says it, then the ANSWER as the Answers page sets it. */
      + (it.theirs ? head('THEIR ANSWER', 10) + '<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="' + ink.box
        + '" style="border:1px solid ' + ink.paneLine + ';border-radius:18px;padding:4px 14px;color:' + ink.ink + '">' + it.theirs.html + '</td></tr></table>' : '')
      + '<p class="gi" style="margin:' + (it.theirs ? 8 : 12) + 'px 0 0;font-weight:bold;color:' + w.tone + '">' + digestEsc_(w.one || it.mark) + '</p>'
      + (it.right ? head('ANSWER') + '<p style="margin:0;color:' + ink.ink + '">' + it.right.html + '</p>' : '')
      + '</td></tr></table>';
  };
  /* THE TAGS AS PILLS, each its facet's colour (`DIGEST_TAG_INK`); the border takes the text's colour, and a facet with none wears the plain outline. */
  const pill = t => '<span class="gi" style="color:' + (DIGEST_TAG_INK[t.kind] || ink.dim) + ';border:1px solid' + (DIGEST_TAG_INK[t.kind] ? '' : ' ' + ink.chip)
    + ';border-radius:9px;padding:0 6px">' + digestEsc_(t.text).replace(/ /g, '\u00a0') + '</span>';
  const tagsHtml = list => (list || []).map(pill).join(' ');
  const answerLines = it => (it.theirs ? ['Their answer: ' + it.theirs.text] : []).concat(it.right ? ['Answer: ' + it.right.text] : []);
  /* NO HEADING OVER A PAPER: § */
  let prev = null;
  const tagsFor = it => {
    const above = prev;
    prev = it;
    if (!above || !said['tags:' + it.key]) return tagsHtml(it.tags);
    const had = {};
    (above.tags || []).forEach(t => { had[t.text] = 1; });
    return tagsHtml((it.tags || []).filter(t => !had[t.text]));
  };
  const weigh = it => {
    if (!prev) return;
    const had = {};
    (prev.tags || []).forEach(t => { had[t.text] = 1; });
    const less = digestBytes_(tagsHtml(it.tags)) - digestBytes_(tagsHtml((it.tags || []).filter(t => !had[t.text])));
    if (less > 0) sizes.push({ id: 'tags:' + it.key, kind: 'tags', bytes: less + 80 });
  };

  const lines = [];
  const parts = [];
  /* WHAT THE CLIP MAY SAY AS "ON THE SITE" INSTEAD, with what its words weigh — `digestRender_` picks from it. */
  const sizes = [];
  let fromLib = 0;
  shown.forEach(h => {
    let html = '';
    if (!h.worded) {
      /* A NAME OF ONE SEGMENT WITH NO WORDS IS ITS HEADING AND NOTHING ELSE, so its mark goes on the heading
         ("Times tables: ✓") rather than alone on a line under it; numbered ones are the line of numbers. */
      const bare = h.items.filter(it => !it.num), numbered = h.items.filter(it => it.num);
      lines.push(h.head + (bare.length ? ': ' + bare.map(it => it.mark).join(', ') : ''));
      if (numbered.length) lines.push(numbered.map(tag).join(', '));
      lines.push('');
      h.items.forEach(it => { weigh(it); html += card(it, '', tagsFor(it)); });
      parts.push(html);
      return;
    }
    lines.push(h.head);
    let stem = '';
    const done = {};
    h.items.forEach(it => {
      weigh(it);
      /* ---------- AS IT IS ON THE SITE (18 Oct): the row the card draws, from the library ---------- */
      const P = it.row ? digestPartOut_(it, pre, done, said, site) : null;
      if (P) {
        fromLib++;
        let inner = '';
        P.stems.forEach(st => { lines.push.apply(lines, st.lines); inner += st.html; sizes.push({ id: st.id, kind: 'stem', bytes: st.bytes }); });
        if (P.bytes) sizes.push({ id: 'part:' + it.key, kind: 'part', bytes: P.bytes });
        const head = [it.num, P.marks].filter(Boolean).join(' · ');
        if (head) lines.push(head);
        lines.push.apply(lines, P.lines);
        lines.push(kid + ': ' + it.mark);
        lines.push.apply(lines, answerLines(it));
        lines.push('');
        html += card(it, inner + P.html, tagsFor(it));
        stem = '';
        return;
      }
      /* THE WORDS ITS SUBMISSION CARRIED, which the clip may say as on the site as it may a library row's (380: a card weighs more than a line did). */
      const wid = 'words:' + it.key;
      if (said[wid]) {
        lines.push(tag(it) + ': (the question’s words are on the site)');
        lines.push.apply(lines, answerLines(it));
        html += card(it, '<p style="margin:0"><i>(the question’s words are on the site)</i></p>', tagsFor(it));
        stem = it.stem;
        return;
      }
      let inner = '';
      if (it.stem && it.stem !== stem) {
        lines.push(cut(it.stem, DIGEST_STEM_SHOWN));
        inner += '<p style="margin:0 0 10px;padding:0 0 8px;border-bottom:1px dashed ' + ink.chip + ';color:' + ink.dim + '"><i>' + digestEsc_(cut(it.stem, DIGEST_STEM_SHOWN)) + '</i></p>';
      }
      stem = it.stem;
      const said1 = cut(it.ask, DIGEST_WORDS_SHOWN);
      lines.push(said1 ? tag(it) + ': ' + said1 : tag(it));
      lines.push.apply(lines, answerLines(it));
      if (said1) inner += '<p style="margin:0">' + digestEsc_(said1) + '</p>';
      if (inner) sizes.push({ id: wid, kind: 'part', bytes: digestBytes_(inner) });
      html += card(it, inner, tagsFor(it));
    });
    if (lines[lines.length - 1] !== '') lines.push('');
    parts.push(html);
  });
  if (printed && more > 0) lines.push('…and ' + more + ' more.', '');
  const marks = [];
  shown.forEach(h => h.items.forEach(it => marks.push(it.mark)));
  return { lines: lines, html: parts.join('') + (printed && more > 0 ? '<p style="margin:12px 0 0">…and ' + more + ' more.</p>' : ''),
           printed: printed, marks: marks, more: more, fromLib: fromLib, sizes: sizes };
}

/* A QUESTION THE LIBRARY DOES NOT HAVE WEARS WHAT ITS LABEL SAYS, as the tags would: its subject, its paper or sheet, its number — and its marks where a row gives them. */
function digestWornTags_(lib, libRow, bits, num) {
  const id = S(libRow && libRow.row_id);
  return id && lib && lib.tags && lib.tags[id] ? lib.tags[id] : digestLabelTags_(bits, num, libRow);
}
function digestLabelTags_(bits, num, libRow) {
  const b = (bits || []).map(S).filter(Boolean), out = [];
  if (num) b.pop();
  if (b.length > 1) out.push({ kind: 'subject', text: b.shift() });
  if (b.length) out.push({ kind: 'paper', text: b.join(' · ') });
  if (num) out.push({ kind: 'paper', text: num });
  const m = Number(libRow && libRow.marks);
  if (m > 0) out.push({ kind: '', text: m + ' mark' + (m === 1 ? '' : 's') });
  return out;
}

/* ---------- THE RIGHT ANSWER, FROM THE LIBRARY'S ROW (380): the right options, the cells' values, the mark scheme's answer up to its "—", else what it accepts */
function digestRightAnswer_(q) {
  if (!q) return null;
  const out = (html, text) => (S(text).trim() ? { html: html, text: S(text).trim() } : null);
  const opts = S(q.choices).split('|').map(t => t.trim()).filter(Boolean);
  const way = S(q.choice_right).split('|')[0].split(',').map(t => parseInt(t, 10)).filter(k => k > 0 && k <= opts.length);
  const order = S(q.answer_type) === 'order' || !!S(q.order_ends).trim();
  if (opts.length && way.length) {
    const list = way.map(k => opts[k - 1]), sep = order ? ', ' : ' and ';
    return out(list.map(digestHtml_).join(sep), list.map(digestText_).join(sep));
  }
  const cells = digestCells_(q);
  if (cells.length) {
    const got = cells.filter(c => c.ways).map(c => ({ label: c.label, v: c.ways.split('|')[0].trim(), num: /^\d+$/.test(c.label) }));
    return out(got.map(c => (c.num ? '' : digestEsc_(c.label) + ' = ') + digestHtml_(c.v)).join('; '),
               got.map(c => (c.num ? '' : c.label + ' = ') + digestText_(c.v)).join('; '));
  }
  const ans = S(q.answer).trim();
  if (ans) {
    const lead = ans.split(/\s*(?:&mdash;|—)\s*/)[0];
    const text = digestText_(lead).replace(/\s*\n\s*/g, ' ');
    /* NO <b> OF ITS OWN: the card sets the whole answer in bold. */
    if (text.length <= 300) return out(digestHtml_(lead).replace(/<\/?(?:p|div|b|strong)\b[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), text);
    const short = text.slice(0, 280).replace(/\s+\S*$/, '') + '…';
    return out(digestEsc_(short), short);
  }
  const acc = S(q.accept).split('|')[0].trim();
  return acc ? out(digestHtml_(acc), digestText_(acc)) : null;
}
/* A ROW'S `cells` AS `cellsOf_` (js/find.js) READS THEM: `label = ways; …`, a cell with no label numbered, `-` a blank nothing fills. */
function digestCells_(q) {
  const raw = S(q && q.cells).trim();
  if (!raw) return [];
  return raw.split(';').map((c, i) => {
    const m = /^\s*([^=|]{1,12}?)\s*=\s*(.*)$/.exec(c);
    const ways = (m ? m[2] : c).trim();
    return { label: m ? m[1].trim() : String(i + 1), ways: ways === '-' ? '' : ways };
  });
}
/* ---------- WHAT THE CHILD LAST SENT (380): a tapped option as its words, a cell by its label, a drawing said as one, the rest as typed */
function digestTheirAnswer_(q, a) {
  let t = S(a).trim();
  if (!t) return null;
  /* A COLUMN VECTOR TYPED ON THE KEYPAD (`⟮5,-4⟯`, 385) stacked in one pair of brackets, as the site draws it */
  const vec = /\u27ee([^\u27ee\u27ef,]*),([^\u27ee\u27ef]*)\u27ef/g;
  const plain = s => ({ text: s.replace(vec, '($1 over $2)'), html: digestEsc_(s).replace(vec,
    '<span style="display:inline-block;vertical-align:middle;text-align:center;line-height:1.15;padding:0 4px;border-left:1.5px solid currentColor;border-right:1.5px solid currentColor;border-radius:7px/16px">$1<br>$2</span>') });
  if (/^drawing · /.test(t)) return { text: 'a drawing (it is on the site)', html: '<i>a drawing (it is on the site)</i>' };
  if (q) {
    const opts = S(q.choices).split('|').map(x => x.trim()).filter(Boolean);
    const order = S(q.answer_type) === 'order' || !!S(q.order_ends).trim();
    if (opts.length && /^\d{1,2}(?:,\d{0,2})*$/.test(t)) {
      const list = t.split(',').map(k => opts[parseInt(k, 10) - 1] || ''), sep = order ? ', ' : ' and ';
      return { text: list.map(x => (x ? digestText_(x) : '?')).join(sep), html: list.map(x => (x ? digestHtml_(x) : '?')).join(sep) };
    }
    const cells = digestCells_(q);
    if (cells.length > 1 && t.indexOf(' ; ') !== -1) {
      const vals = t.split(' ; ');
      const got = cells.map((c, i) => ({ c: c, v: S(vals[i]).trim() })).filter(x => x.c.ways && x.v);
      if (got.length && got.every(x => !DIGEST_WORDS_REFUSE.some(re => re.test(x.v)))) {
        const say = got.map(x => (/^\d+$/.test(x.c.label) ? '' : x.c.label + ' = ') + x.v).join('; ');
        return plain(say.length > 400 ? say.slice(0, 399) + '…' : say);
      }
    }
  }
  t = t.replace(/\s*\n+\s*/g, ' ');
  if (t.length > 400) t = t.slice(0, 399).replace(/\s+\S*$/, '') + '…';
  /* A CHILD'S OWN TYPING CAN BE A LINK OR A NUMBER, and the email goes out under the owner's name — the words' refusal, as for the question. */
  if (DIGEST_WORDS_REFUSE.some(re => re.test(t))) return { text: '(it is on the site)', html: '<i>(it is on the site)</i>' };
  return plain(t);
}

/* ---------- ONE QUESTION AS THE SITE'S CARD DRAWS IT (18 Oct) § */
function digestPartOut_(it, pre, done, said, site) {
  const q = it.row;
  const refused = t => DIGEST_WORDS_REFUSE.some(re => re.test(t));
  /* EACH PIECE ON ITS OWN — the lead is a block of its own on the card (`.qsheet-lead`), and run together with
     the words "…of the source." and "Read again…" read as "source.Read", which is a domain to the refusal. */
  if ([q.lead, q.html].some(h => refused(digestText_(h)))) return null;
  const fig = digestDiagram_(q.diagram, site);
  /* WHERE THE PICTURE STANDS AMONG THE WORDS — `figBlocks_` / `partPlan_` in js/find.js: after the words before
     a `<!--fig-->` marker; else after the lead; else in front of the words. */
  const mark = /<!--\s*fig\s*-->/i, html = S(q.html), at = html.search(mark);
  const lead = S(q.lead).replace(/<!--\s*fig\s*-->/gi, '');
  const before = at >= 0 ? html.slice(0, at) : '', after = at >= 0 ? html.slice(at).replace(mark, '') : html;
  const cutOut = !!said['part:' + it.key];
  const piece = h => (S(h).replace(/<!--[\s\S]*?-->/g, '').trim() ? '<div style="margin:0 0 6px">' + digestHtml_(h) + '</div>' : '');
  const out = { stems: [], lines: [], html: '', bytes: 0,
                marks: Number(q.marks) > 0 ? Number(q.marks) + ' mark' + (Number(q.marks) === 1 ? '' : 's') : '' };
  digestStemRows_(q, pre).forEach(p => {
    const id = 'stem:' + (S(p.row_id) || S(p.html).slice(0, 80));
    if (done[id]) return;
    done[id] = 1;
    const pf = digestDiagram_(p.diagram, site);
    const ph = S(p.html), pat = ph.search(mark), text = digestText_(ph);
    const gone = !!said[id] || refused(text);
    /* A STAND-IN FOR A SOURCE THE PAPER PRINTS IN A SEPARATE BOOKLET is in a dashed box, as on the site
       (`.qsheet-stem.is-standin`), so nobody takes it for the exam's own words. */
    const ink = digestInk_();
    const box = TRUE_(p.placeholder) ? 'border:1px dashed ' + ink.dim + ';padding:6px 8px;' : 'border-bottom:1px dashed ' + ink.chip + ';padding:0 0 6px;';
    const before = pat >= 0 ? ph.slice(0, pat) : ph, after = pat >= 0 ? ph.slice(pat).replace(mark, '') : '';
    const l = S(p.lines) ? [S(p.lines)] : [];
    let h = S(p.lines) ? '<p style="margin:0 0 4px"><i>' + digestEsc_(p.lines) + '</i></p>' : '';
    if (gone) {
      h += (text ? '<p style="margin:0 0 6px"><i>(the source text is on the site)</i></p>' : '') + (pf ? pf.html : '');
      if (text) l.push('(the source text is on the site)');
      if (pf) l.push(pf.text);
    } else {
      h += piece(before) + (pf ? pf.html : '') + piece(after);
      l.push.apply(l, digestLines_(before));
      if (pf) l.push(pf.text);
      l.push.apply(l, digestLines_(after));
    }
    h = '<div style="margin:0 0 10px;color:' + ink.dim + ';' + box + '">' + h + '</div>';
    out.stems.push({ id: id, html: h, lines: l, bytes: gone ? 0 : digestBytes_(h) });
  });
  if (cutOut) {
    out.html = '<p style="margin:0 0 6px"><i>(the question’s words are on the site)</i></p>' + (fig ? fig.html : '');
    out.lines = ['(the question’s words are on the site)'].concat(fig ? [fig.text] : []);
    return out;
  }
  const figFirst = at < 0 && !lead;
  out.html = (figFirst && fig ? fig.html : '') + piece(lead) + piece(before) + (!figFirst && fig ? fig.html : '') + piece(after);
  out.lines = (figFirst && fig ? [fig.text] : []).concat(digestLines_(lead), digestLines_(before), !figFirst && fig ? [fig.text] : [], digestLines_(after));
  out.bytes = digestBytes_(out.html);
  return out;
}
/* THE ROW A KEY NAMES, WHEN THE CARD WOULD DRAW IT: § */
function digestLibRow_(lib, key) {
  const k = S(key);
  if (!lib || !lib.rows || !/^q:/.test(k)) return null;
  const q = lib.rows[k.slice(2)];
  return q && q.kind === 'question' && ON_(q.active) && (S(q.html) || S(q.lead) || S(q.diagram)) ? q : null;
}

/* ---------- THE LIBRARY'S MARKUP, AS AN EMAIL MAY CARRY IT § */
function digestHtml_(html) {
  const src = digestPrep_(html);
  const KEEP = /^(p|br|b|strong|i|em|sup|sub|ul|ol|li|table|thead|tbody|tr|th|td|span|div)$/;
  const SAY = { p: 'margin:0 0 8px', ul: 'margin:0 0 8px;padding-left:24px', ol: 'margin:0 0 8px;padding-left:24px',
                table: 'border-collapse:collapse;margin:4px 0 10px;font-size:11px', th: 'border:1px solid #3d3d3d;padding:3px 4px;text-align:left',
                td: 'border:1px solid #3d3d3d;padding:3px 4px' };
  const AS = { blockquote: ['<div style="margin:0 0 8px 12px;padding-left:10px;border-left:3px solid #3d3d3d">', '</div>'],
               u: ['<span style="text-decoration:underline">', '</span>'], s: ['<span style="text-decoration:line-through">', '</span>'] };
  const VOID = /^(img|hr|input|wbr|col|area|source|meta|link|base|embed|param|track)$/;
  const text = t => t
    .replace(/&(?!(?:#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);)/gi, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/&([a-z][a-z0-9]*);/gi, (m, e) => (!/^(amp|lt|gt|quot|nbsp)$/.test(e) && Object.prototype.hasOwnProperty.call(DIGEST_ENTITIES, e) ? DIGEST_ENTITIES[e] : m))
    .replace(/\^\(([^()<>]{1,40})\)/g, '<sup>$1</sup>').replace(/\^(-?[0-9A-Za-z.]{1,12})/g, '<sup>$1</sup>');
  const out = [], open = [];
  const re = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^<>]*)>/g;
  let from = 0, m;
  while ((m = re.exec(src))) {
    out.push(text(src.slice(from, m.index)));
    from = re.lastIndex;
    const name = m[2].toLowerCase(), attrs = m[3] || '';
    if (m[1]) {
      let k = open.length - 1;
      while (k >= 0 && open[k].name !== name) k--;
      while (k >= 0 && open.length > k) out.push(open.pop().close);
      continue;
    }
    if (name === 'br') { out.push('<br>'); continue; }
    if (VOID.test(name) || /\/\s*$/.test(attrs)) continue;
    let start = '', close = '';
    if (/^h[1-6]$/.test(name)) { start = '<p style="margin:0 0 8px"><b>'; close = '</b></p>'; }
    else if (AS[name]) { start = AS[name][0]; close = AS[name][1]; }
    else if (KEEP.test(name)) {
      let extra = '';
      if (name === 'td' || name === 'th') {
        const cs = /\bcolspan\s*=\s*["']?(\d{1,2})\b/i.exec(attrs), rs = /\browspan\s*=\s*["']?(\d{1,2})\b/i.exec(attrs);
        if (cs) extra += ' colspan="' + cs[1] + '"';
        if (rs) extra += ' rowspan="' + rs[1] + '"';
      }
      const style = name === 'span' && /text-decoration\s*:\s*overline/i.test(attrs) ? 'text-decoration:overline' : (SAY[name] || '');
      start = '<' + name + extra + (style ? ' style="' + style + '"' : '') + '>';
      close = '</' + name + '>';
    }
    out.push(start);
    open.push({ name: name, close: close });
  }
  out.push(text(src.slice(from)));
  while (open.length) out.push(open.pop().close);
  return out.join('');
}
/* WHAT BOTH THE HTML AND THE PLAIN BODY START FROM: § */
function digestPrep_(html) {
  return S(html)
    .replace(/<(script|style|svg|math)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<span class="frac">\s*<span class="frac-n">([\s\S]*?)<\/span>\s*<span class="frac-d">([\s\S]*?)<\/span>\s*<\/span>/g, '<sup>$1</sup>&frasl;<sub>$2</sub>')
    .replace(/<span aria-hidden="true"[^>]*>\s*(?:&bull;|•|&middot;|·)\s*<\/span>/g, '&#775;');
}
/* AND AS TEXT, for the plain body: `digestPlain_` (the library's markup as text, unchanged) over the same start,
   with a table's cells kept apart and a block's end a line's end. */
function digestText_(html) {
  /* A FRACTION AND A POWER AS A PARENT WRITES THEM — `5/x`, `x^2`, brackets only round more than one term —
     where `digestPlain_` brackets every one, and a tag inside them (`<i>x</i>`) is no reason to
     lose the fraction. */
  const bare = t => t.replace(/<[^<>]*>/g, '');
  const term = t => (/^[\w.\u00b2\u00b3\u03b1-\u03c9\u221a]+$/.test(t) ? t : '(' + t + ')');
  return digestPlain_(digestPrep_(html)
    .replace(/<sup>((?:(?!<\/?sup\b)[\s\S])*?)<\/sup>\s*(?:&frasl;|\u2044|&#8260;)\s*<sub>((?:(?!<\/?sub\b)[\s\S])*?)<\/sub>/g,
      (m, a, b) => term(bare(a).trim()) + '/' + term(bare(b).trim()))
    .replace(/<sup>((?:(?!<\/?sup\b)[\s\S])*?)<\/sup>/g, (m, a) => (/^[*†‡§]+$/.test(bare(a).trim()) ? bare(a).trim() : '^' + term(bare(a).trim())))
    .replace(/<\/t[dh]>\s*(?=<t[dh]\b)/gi, ' | ').replace(/<\/(h[1-6]|blockquote|ul|ol|table)>/gi, '$&<br>'));
}
function digestLines_(html) {
  return digestText_(html).split('\n').map(x => x.trim()).filter(Boolean);
}
/* WHAT A STRING WEIGHS IN UTF-8 — what Gmail's clip counts. */
function digestBytes_(s) {
  const t = S(s);
  let n = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) { n += 4; i++; } else n += c < 0x80 ? 1 : c < 0x800 ? 2 : 3;
  }
  return n;
}

/* ---------- A DRAWING, AS AN EMAIL CAN SHOW IT § */
function digestDiagram_(svg, site) {
  const s = S(svg);
  if (!/^\s*<svg\b/i.test(s)) return null;
  /* EVERY <svg> IN THE CELL — one holds two (Figures 4 and 5 of one question), drawn one above the other in
     one twin: its alt text says both, and it is as wide as the wider. */
  const labels = [];
  let width = 0;
  (s.match(/<svg\b[^>]*>/gi) || []).forEach(open => {
    const label = /\baria-label="([^"]*)"/i.exec(open);
    if (label && digestPlain_(label[1]).trim()) labels.push(digestPlain_(label[1]).replace(/\s+/g, ' ').trim());
    const vb = /\bviewBox="\s*-?[\d.]+[\s,]+-?[\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*"/i.exec(open);
    const wide = /\bwidth="([\d.]+)(?:px)?"/i.exec(open);
    width = Math.max(width, Math.round(Number(wide ? wide[1] : vb ? vb[1] : DIGEST_PNG_WIDTH)) || DIGEST_PNG_WIDTH);
  });
  const alt = labels.join(' / ') || 'A diagram';
  width = width || DIGEST_PNG_WIDTH;
  let hash = '';
  try {
    /* Signed bytes, as Java hands them over; `map.call` so an array-like answer is read the same. */
    hash = Array.prototype.map.call(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8),
      b => ((b + 256) % 256).toString(16).padStart(2, '0')).join('').slice(0, DIGEST_PNG_HEX);
  } catch (err) { hash = ''; }
  if (hash.length !== DIGEST_PNG_HEX) return { html: '', text: '[Picture: ' + alt + ']', alt: alt, width: width, src: '' };
  const src = S(site || SITE_URL).replace(/\/*$/, '/') + DIGEST_PNG_DIR + hash + '.png';
  return { src: src, alt: alt, width: width, hash: hash, text: '[Picture: ' + alt + ']',
           html: '<div class="gi" style="margin:8px 0;background:#000"><img src="' + digestEsc_(src) + '" width="' + width + '" alt="' + digestEsc_(alt)
                 + '" style="display:block;width:100%;max-width:' + width + 'px;height:auto;border:0"></div>' };
}

/* ---------- THE ROWS THE WEEK'S EMAIL PRINTS, FETCHED ONCE FOR THE WHOLE RUN § */
function digestEmailLibrary_(week, subRows, cfg) {
  const ids = {};
  (subRows || []).forEach(r => {
    const k = S(r && r.key).split('#')[0];
    if (!/^q:/.test(k) || !DIGEST_KEY_SHAPE.test(k)) return;
    const came = answerAtMs_(r.submitted_at);
    if (!came) return;
    const day = digestDay_(new Date(came));
    if (day >= week.start && day <= week.end) ids[k.slice(2)] = 1;
  });
  const want = Object.keys(ids);
  if (!want.length) return { rows: {}, pre: [] };
  const got = digestLibrary_(S(cfg && cfg.site_url) || SITE_URL);
  if (got.error) return { rows: {}, pre: [], error: got.error };
  const found = digestLibraryFind_(got.text, want);
  /* THE WORDS ARE IN THE LEDGER NOW (397): the file gives the card, `lib_questions` the question. A miss costs the words, never the email. */
  try { digestLibraryFill_(found); } catch (err) { found.fillError = S(err && err.message || err); }
  return found;
}

/* EACH ROW THE EMAIL PRINTS, WITH ITS PRIVATE FIELDS PUT BACK — a row whose file copy says `lib_has` has words in the Ledger. */
function digestLibraryFill_(found) {
  const rows = Object.keys(found.rows || {}).map(k => found.rows[k]).concat(found.pre || []);
  const want = rows.filter(one => one && S(one.lib_has));
  for (let i = 0; i < want.length; i += 200) {
    const part = want.slice(i, i + 200);
    const got = libContent_(part.map(one => 'q:' + S(one.row_id))).items;
    part.forEach(one => {
      const c = got['q:' + S(one.row_id)];
      if (!c) return;
      Object.keys(c).forEach(k => { one[k] = c[k]; });
      delete one.lib_has;
    });
  }
  return found;
}

/* A VERDICT AS THE EMAIL MARKS IT — ✓ right, ✗ wrong (the site says "Not yet"; in a list of numbers a cross is the mark a parent reads at a glance), the AI's § */
function digestMark_(v) {
  const t = S(v);
  if (t === 'right') return '✓';
  if (t === 'wrong') return '✗';
  const m = /^(?:ai|rule):(\d{1,3})\/(\d{1,3})$/.exec(t);
  return m ? m[1] + ' of ' + m[2] + ' mark' + (m[2] === '1' ? '' : 's') : 'not marked';
}

function digestEsc_(s) {
  return S(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* ---------- TEXT THAT CAME OFF A PHONE, AND MAY GO OUT UNDER THE BUSINESS'S NAME § */
function digestSafe_(s) {
  const t = attemptLabel_(s);
  return !!t && !/:\/\/|\bwww\.|@|\b[a-z0-9-]{2,}\.[a-z]{2,}\b/i.test(t);
}

/* `digestSafe_` FOR A QUESTION'S WORDS — the same refusal over the WHOLE text. § */
function digestWordsSafe_(s) {
  const t = attemptWords_(s);
  return !!t && !DIGEST_WORDS_REFUSE.some(re => re.test(t));
}

/* THE BUSINESS'S NAME AND THE SITE'S ADDRESS — each from the one place it is written, each with the constant beside it as the floor, so a broken config tab still § */
function digestLook_(now, week) {
  let brand = '', site = '', cfg = {};
  try { brand = S(brandName()); } catch (err) {}
  try { cfg = config() || {}; site = S(cfg.site_url); } catch (err) {}
  const d = now instanceof Date && !isNaN(now) ? now : new Date();
  const today = digestDay_(d);
  let hour = -1, minute = 0;
  if (week && today === week.end) {
    const wall = Utilities.formatDate(d, DIGEST_TZ, 'yyyy-MM-dd HH:mm');
    hour = Number(wall.slice(11, 13)); minute = Number(wall.slice(14, 16));
  } else if (!week || today < week.end) {
    hour = digestBookedHour_(cfg);
  }
  return { brand: brand || BRAND_NAME, site: site || SITE_URL, hour: hour, minute: minute, words: digestWords_(cfg) };
}
/* THE EMAIL'S FOUR LINES (491): the config row where an admin wrote one, else the default. */
function digestWords_(cfg) {
  const out = {};
  Object.keys(DIGEST_WORDS).forEach(k => { const v = S(cfg && cfg[k]); out[k] = v || DIGEST_WORDS[k]; });
  return out;
}
/* {child} {parent} {count} {span} filled in; a parent with no printable name leaves "Hi," as before. */
function digestFill_(t, v) {
  return String(t).replace(/\{(child|parent|count|span)\}/g, (m, k) => v[k] == null ? '' : String(v[k])).replace(/ +([,.!?])/g, '$1').replace(/ {2,}/g, ' ');
}

/* THE PLAN FOR A WEEK, OFF THE SHEET AS IT IS. The only impure step: three reads and the real
   `acceptedParents`. `now` is the moment the list is made up to (`digestLook_`); the clock when none. */
function digestPlanNow_(week, now, lib, words) {
  const look = digestLook_(now, week);
  /* THE ADMIN'S UNSAVED WORDS, for the Preview alone (547): the same renderer with what is being typed; a run never passes any. */
  if (words) look.words = digestWordsOver_(look.words, words);
  /* AND THE LIBRARY'S ROWS, when the caller fetched them (`digestEmailLibrary_`): each question as it is on
     the site. Without them each goes as its words cell — the check's plans, and a run whose fetch failed. */
  if (lib && lib.rows) look.lib = lib;
  return digestPlan_(week, read(TAB.submissions).rows, read(TAB.people).rows, acceptedParents, look);
}

/* THE HOUR THE EMAIL IS BOOKED FOR — what `installWeeklyDigest` booked (`DIGEST_BOOKED`), because Apps
   Script cannot read a trigger's hour back; the config cell's when nothing was booked by this backend. */
function digestBookedHour_(cfg) {
  const booked = digestBooked_();
  return booked >= 0 ? booked : digestHour_(cfg);
}
/* THE HOUR `installWeeklyDigest` RECORDED, and -1 when there is none: § */
function digestBooked_() {
  let booked = '';
  try { booked = S(PropertiesService.getScriptProperties().getProperty(DIGEST_BOOKED)); } catch (err) { booked = ''; }
  return /^\d{1,2}$/.test(booked) && Number(booked) <= 23 ? Number(booked) : -1;
}

/* ---------- WHEN THIS WEEK'S EMAIL GOES, AS AN INSTANT — 0 WHEN THAT IS NOT STILL TO COME § */
function digestSendAt_(now, hour) {
  const d = now instanceof Date && !isNaN(now) ? now : new Date();
  const wall = Utilities.formatDate(d, DIGEST_TZ, 'yyyy-MM-dd HH:mm');
  const today = wall.slice(0, 10), sunday = digestWeekOf_(today).end;
  const at = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  const days = Math.round((at(sunday) - at(today)) / 864e5);
  const mins = days * 1440 + hour * 60 - (Number(wall.slice(11, 13)) * 60 + Number(wall.slice(14, 16)));
  if (mins <= 0) return 0;
  const t = d.getTime();
  let when = t - (t % 60000) + mins * 60000;
  /* THE CLOCKS CHANGE ON A SUNDAY (25 Oct 2026): minutes counted from now land an hour out, so move by what London's clock says then. */
  const then = Utilities.formatDate(new Date(when), DIGEST_TZ, 'yyyy-MM-dd HH:mm');
  const off = Number(then.slice(11, 13)) * 60 + Number(then.slice(14, 16)) - hour * 60;
  if (off) when -= (off > 720 ? off - 1440 : off < -720 ? off + 1440 : off) * 60000;
  return when;
}


/* ---------- THE SUNDAY RUN § */
function weeklyDigestRun(e) {
  const out = digestRun_(new Date());
  if (out && /^NOT fetched/.test(S(out.library))) console.log('weeklyDigestRun: the question library was ' + out.library);
  if (out && (out.error || out.held || out.failed || out.busy)) {
    throw new Error('The weekly parent email did not finish: '
      + (out.error ? out.error : 'sent ' + out.sent + ', held ' + out.held + ' (mail quota), failed '
         + out.failed + ', busy ' + out.busy + ' (lock) — see the digest_log tab, then run '
         + 'weeklyDigestRun again from the editor before next Sunday; it sends only what is not sent.'));
  }
  return out;
}

/* ---------- THE LOCK IS HELD TO CLAIM AN EMAIL, NEVER TO SEND IT § */
function digestRun_(now) {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const mode = digestMode_(cfg);
  if (mode === 'off') return { mode: 'off', did: 'nothing — weekly_digest on the config tab is off' };

  if (!digestLog_().sheet) return { mode: mode, error: 'The sheet has no digest_log tab. Open the site once as an admin to add it. Nothing was sent.' };
  /* NO `submissions` TAB IS NOT A QUIET WEEK. § */
  const noSubmissions = digestNoSubmissions_();
  if (noSubmissions) return { mode: mode, error: noSubmissions };
  /* THE PLAN IS MADE WITHOUT THE LOCK. It reads `submissions` and `people` and writes nothing; what it
     decides is checked against the log, fresh, under the lock, one email at a time. */
  const week = digestWeekToSend_(now);
  /* EACH QUESTION AS IT IS ON THE SITE (18 Oct): the library's rows for the week's questions, fetched once.
     A fetch that fails stops nothing — the run says so in its log and the questions go as their words. */
  let lib = null;
  try { lib = digestEmailLibrary_(week, read(TAB.submissions).rows, cfg); }
  catch (err) { lib = { rows: {}, pre: [], error: S(err && err.message || err) }; }
  const plan = digestPlanNow_(week, now, lib);
  const out = { mode: mode, week: { start: week.start, end: week.end }, learners: plan.learners.length,
                emails: plan.emails.length, previewed: 0, sent: 0, already: 0, held: 0, failed: 0, busy: 0,
                unreachable: plan.unreachable.length, skipped: 0,
                library: lib && lib.error ? 'NOT fetched, so each question went as its words cell — ' + lib.error : 'each question as it is on the site' };
  const mailed = digestMail_(plan.emails, {
    mode: mode, reserve: digestReserve_(cfg), readLog: digestLog_, brand: plan.look.brand,
    find: (log, m) => digestLogFind_(log, week.start, m.learner_id, m.parent_id),
    put: (log, row, m, v) => digestLogPut_(log, row, week.start, m.learner_id, m.parent_id, v),
    heldNote: 'daily mail quota — run weeklyDigestRun again tomorrow',
  });
  ['previewed', 'sent', 'already', 'held', 'failed', 'busy'].forEach(k => { out[k] += mailed[k]; });

  /* AND WHO WAS NOT TOLD, AND WHY — a row each, so the log answers both questions. § */
  const noted = digestLocked_(digestLog_, log => {
    plan.learners.forEach(L => {
      if (L.why) {
        const row = digestLogFind_(log, week.start, L.id, '');
        digestLogPut_(log, row, week.start, L.id, '', { to: '', subject: '', questions: L.count,
          status: 'not sent', at: new Date(), note: L.why });
        out.skipped++;
      }
      L.skipped.filter(p => p.why === 'asked not to get it').forEach(p => {
        const row = digestLogFind_(log, week.start, L.id, p.id);
        if (norm(row && row.status) === 'sent') return;
        digestLogPut_(log, row, week.start, L.id, p.id, { to: '', subject: '', questions: L.count,
          status: 'opted out', at: new Date(), note: 'weekly_email on their row says no (Settings → Notifications)' });
        out.skipped++;
      });
    });
    return true;
  });
  if (!noted) out.busy++;
  return out;
}

/* ---------- UNDER THE LOCK, BRIEFLY § */
function digestLocked_(readLog, fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return null;
  try { return fn(readLog()); } finally { lock.releaseLock(); }
}

/* ---------- CLAIM, SEND, RECEIPT § */
function digestMail_(emails, o) {
  const out = { previewed: 0, sent: 0, already: 0, held: 0, failed: 0, busy: 0 };
  (emails || []).forEach(m => {
    const claim = digestLocked_(o.readLog, log => {
      const row = o.find(log, m);
      const was = norm(row && row.status);
      /* `again`: an admin's press (378) sends over a receipt, never over a send still in flight. */
      if ((was === 'sent' && !o.again) || was === 'sending') return { already: true };
      const v = { to: m.to, subject: m.subject, questions: m.count, at: new Date(), note: S(o.note) };
      if (o.mode === 'preview') {
        o.put(log, row, m, Object.assign(v, { status: 'preview' }));
        return { previewed: true };
      }
      if (digestQuota_() <= o.reserve) {
        o.put(log, row, m, Object.assign(v, { status: 'held', note: o.heldNote }));
        return { held: true };
      }
      const r = o.put(log, row, m, Object.assign(v, { status: 'sending' }));
      /* FLUSHED BEFORE THE LOCK GOES, so the next run to take it reads the claim off the sheet. */
      try { SpreadsheetApp.flush(); } catch (err) {}
      return { row: r, log: log };
    });
    if (!claim) { out.busy++; return; }
    if (claim.already) { out.already++; return; }
    if (claim.previewed) { out.previewed++; return; }
    if (claim.held) { out.held++; return; }
    try {
      /* `firstNamesOnly`: the net in `mailOut_` leaves a child's whole name as the first name alone here,
         never "First (@handle)" — a parent's email carries no username (the note over `digestRender_`). */
      mailOut_({ to: m.to, subject: m.subject, body: m.text, htmlBody: m.html, firstNamesOnly: true });
    } catch (err) {
      try { setCells(claim.log, claim.row, { status: 'failed', note: S(err && err.message || err).slice(0, 200) }); } catch (e2) {}
      out.failed++;
      return;
    }
    out.sent++;
    try { setCells(claim.log, claim.row, { status: 'sent', at: new Date() }); } catch (err) {}
  });
  return out;
}

/* ---------- NO `submissions` TAB, IN WORDS § */
function digestNoSubmissions_() {
  let there = false;
  try { there = !!read(TAB.submissions).sheet; } catch (err) { there = false; }
  return there ? ''
    : 'The Ledger has no submissions tab, so nothing says what anybody sent. Open the site once as an admin '
    + 'to add it; answers sent from then on are what these emails report. Nothing was sent.';
}

/* THE LOG AS IT IS NOW — its cached copy dropped first, because a copy read before the lock was taken is the one another run has since written to. § */
function digestLog_() {
  try { delete _cache[TAB.digest_log]; } catch (err) {}
  return read(TAB.digest_log);
}

function digestLogFind_(log, weekStart, learnerId, parentId) {
  return log.rows.find(r => isoDate_(r.week_of) === weekStart && S(r.learner_id) === S(learnerId)
                             && S(r.parent_id) === S(parentId)) || null;
}
/* A ROW UPDATED, OR ONE ADDED. `week_of` is written as text — see SCHEMA.digest_log. */
function digestLogPut_(log, row, weekStart, learnerId, parentId, values) {
  if (row) { setCells(log, row, values); return row; }
  return addRow(log, Object.assign({ week_of: "'" + weekStart, learner_id: S(learnerId), parent_id: S(parentId) }, values));
}
function digestQuota_() {
  try { return Number(MailApp.getRemainingDailyQuota()) || 0; } catch (err) { return 0; }
}


/* ---------- BOOKING THE SUNDAY — BY ITSELF NOW (361): only `digestKeepBooked_` calls this, so it is private. */
function installWeeklyDigest_() {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const hour = digestHour_(cfg);
  const gone = removeWeeklyDigest();
  ScriptApp.newTrigger(DIGEST_RUN).timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(hour).nearMinute(0).inTimezone(DIGEST_TZ).create();
  try { PropertiesService.getScriptProperties().setProperty(DIGEST_BOOKED, String(hour)); } catch (err) {}
  const mode = digestMode_(cfg);
  const fns = Object.keys(gone.retired), old = fns.reduce((n, fn) => n + gone.retired[fn], 0);
  const out = { installed: 'every Sunday at about ' + hour + ':00, London time — the only trigger the email has',
           replaced: gone.removed, mode: mode,
           means: mode === 'off' ? 'it runs and does nothing until weekly_digest on the config tab is preview or send'
                : mode === 'preview' ? 'it writes what it would send to the digest_log tab and sends nothing'
                : 'it EMAILS PARENTS',
           retired: old ? 'removed ' + old + ' old trigger' + (old === 1 ? '' : 's') + ' that nothing runs any more: '
                          + fns.map(fn => fn + ' ×' + gone.retired[fn]).join(', ') : 'no old trigger was booked',
           next: 'run checkSundayEmail to see that everything is ready' };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}
/* KEEPS THE SUNDAY BOOKED, on an admin's page load and as a run-once job (361): re-books only when there is not exactly one
   trigger, an old one lingers, or the booked hour is not the config tab's. Null when nothing needed doing. */
function digestKeepBooked_(cfg) {
  if (!cfg) { try { cfg = config(); } catch (err) { cfg = {}; } }
  const sun = digestScheduled_(DIGEST_RUN);
  if (sun === null) throw new Error('the triggers could not be listed');
  let old = 0;
  DIGEST_RETIRED_RUNS.forEach(fn => { old += Number(digestScheduled_(fn)) || 0; });
  if (sun === 1 && !old && digestBooked_() === digestHour_(cfg)) return null;
  return installWeeklyDigest_();
}
/* FOR THE SETUP CARD (361): when the Sunday trigger runs, in words, and null for any other handler. */
function digestTriggerWhen_(fn, hour) {
  return fn === DIGEST_RUN ? 'Sundays, about ' + hour + ':00 London time' : null;
}
/* AND THE EMAIL'S MODE, ITS HOUR AND ITS NEXT SEND, for the same card. `next` is '' when nothing is booked. */
function digestSetupSays_(cfg, now) {
  const hour = digestBookedHour_(cfg), booked = !!digestScheduled_(DIGEST_RUN);
  let next = 0;
  try { next = booked ? (digestSendAt_(now, hour) || digestSendAt_(new Date(now.getTime() + 864e5), hour)) : 0; } catch (err) { next = 0; }
  return { mode: digestMode_(cfg), hour: hour, booked: booked, next: next ? new Date(next).toISOString() : '' };
}
/* THE WAY BACK: every trigger of the email's handler, and every one in `DIGEST_RETIRED_RUNS`, gone, and nothing else; and the Script Properties that describe § */
function removeWeeklyDigest() {
  let n = 0;
  const retired = {};
  ScriptApp.getProjectTriggers().forEach(t => {
    const fn = t.getHandlerFunction();
    if (fn === DIGEST_RUN) { ScriptApp.deleteTrigger(t); n++; }
    else if (DIGEST_RETIRED_RUNS.indexOf(fn) !== -1) { ScriptApp.deleteTrigger(t); retired[fn] = (retired[fn] || 0) + 1; }
  });
  try {
    const props = PropertiesService.getScriptProperties();
    [DIGEST_BOOKED].concat(DIGEST_RETIRED_PROPS).forEach(k => props.deleteProperty(k));
  } catch (err) {}
  return { removed: n, retired: retired };
}
/* How many of `fn`'s triggers are booked — the email's by default — for the admin's card and
   `checkSundayEmail`. Null when it cannot be asked. */
function digestScheduled_(fn) {
  try { return ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === (fn || DIGEST_RUN)).length; }
  catch (err) { return null; }
}
/* ---------- WHAT THE ADMIN'S PREVIEW IS SENT — `digestPreview` in dopost.gs § */
function digestPreviewOut_(now, words) {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const week = digestWeek_(now);
  /* THE SAME LIBRARY AS THE RUN'S, so the Preview is the email as it will go (18 Oct). */
  let lib = null;
  try { lib = digestEmailLibrary_(week, read(TAB.submissions).rows, cfg); } catch (err) { lib = null; }
  const plan = digestPlanNow_(week, now, lib, words);
  /* THE EMAIL THE CARD SHOWS, AS IS (547): this week's first, byte for byte; with none, a made-up child through the same `digestRender_`. */
  const first = plan.emails[0];
  const sample = first ? null : digestRender_(DIGEST_SAMPLE_CHILD, { first: 'Alex' }, week, plan.look);
  const shown = first ? { subject: first.subject, html: first.html, learner: first.learner, parent: first.parent, sample: false }
    : { subject: sample.subject, html: sample.html, learner: DIGEST_SAMPLE_CHILD.first, parent: 'Alex', sample: true };
  /* AND WHETHER THERE IS ANYTHING TO READ: with no `submissions` tab the plan is empty for a reason, and
     the card says the reason rather than "nobody has done a question". */
  const warning = digestNoSubmissions_();
  /* `words` SAYS THIS BACKEND LISTS EACH QUESTION WITH ITS WORDS. § */
  return {
    success: true, mode: digestMode_(cfg), hour: digestBookedHour_(cfg), scheduled: digestScheduled_(),
    submissions: !warning, warning: warning, words: true,
    week: { start: week.start, end: week.end, span: digestSpan_(week) },
    learners: plan.learners.map(L => ({ id: L.id, name: L.name, count: L.count, fresh: L.fresh.length,
      again: L.again.length, to: L.to.map(p => p.name), why: L.why })),
    emails: plan.emails.map(m => ({ learner: m.learner, parent: m.parent, to: m.to, subject: m.subject,
      text: m.text, html: m.html, count: m.count })),
    unreachable: plan.unreachable,
    shown: shown,
  };
}
/* THE MADE-UP CHILD the Preview shows when no family has an email this week: three questions, their words and answers, every way one goes. */
const DIGEST_SAMPLE_CHILD = { first: 'Sam', days: [], again: [], fresh: [
  { key: 'q:SAMPLE-1', label: 'Maths · Fractions · Q1', words: 'Work out 2/3 + 1/4.', verdict: 'right', answer: '11/12' },
  { key: 'q:SAMPLE-2', label: 'Maths · Fractions · Q2', words: 'Simplify 18/24.', verdict: 'wrong', answer: '9/12' },
  { key: 'q:SAMPLE-3', label: 'Maths · Ratio · Q1', words: 'Share 20 in the ratio 3 : 2.', verdict: 'ai:1/2', answer: '12 and 8' }] };
/* WORDS AN ADMIN IS TYPING, held to what `digestWordsSave` would keep: the four keys, each at most DIGEST_WORD_MAX; blank is the default. */
function digestWordsOver_(base, words) {
  const out = Object.assign({}, base || {});
  if (!words || typeof words !== 'object') return out;
  Object.keys(DIGEST_WORDS).forEach(k => { if (k in words) out[k] = S(words[k]).slice(0, DIGEST_WORD_MAX).trim() || DIGEST_WORDS[k]; });
  return out;
}


/* THE LIBRARY, FOR THE EMAIL — EACH QUESTION PRINTED AS IT IS ON THE SITE (18 Oct, docs/history/351) § */
/* THE FILE ITSELF: the site's copy first — the one the phones read — then raw.githubusercontent.com § */
function digestLibrary_(site) {
  const urls = [S(site || SITE_URL).replace(/\/*$/, '/') + DIGEST_LIBRARY_PATH];
  try { urls.push(RAW + DIGEST_LIBRARY_PATH); } catch (err) { /* sync.gs is not in this scope */ }
  const said = [];
  for (let i = 0; i < urls.length; i++) {
    const t = Date.now();
    try {
      const res = UrlFetchApp.fetch(urls[i] + '?v=' + Date.now(), { muteHttpExceptions: true, followRedirects: true });
      const code = res.getResponseCode();
      const text = code === 200 ? String(res.getContentText('UTF-8')) : '';
      if (code === 200 && /^\s*\[/.test(text.slice(0, 50)) && text.indexOf('"row_id":"') !== -1) {
        return { text: text, url: urls[i], ms: Date.now() - t, size: text.length };
      }
      said.push(urls[i] + ' answered ' + code + (code === 200 ? ' with something that is not the library' : ''));
    } catch (err) {
      said.push(urls[i] + ' could not be reached (' + S(err && err.message || err).slice(0, 120) + ')');
    }
  }
  return { error: 'the question library could not be fetched, so each question goes as its words — ' + said.join('; ') };
}

/* ---------- THE CARD'S TAGS, AS THE SITE DRAWS THEM (20 Oct, docs/history/380): `tagRow_` (js/find.js) for a question, ported § */
/* THE TAG FACETS A QUESTION ANSWERS, with their `TAG_OF` colour kind. The ORDER is data/settings/facets.json's (`digestFacetOrder_`, 546). */
/* This list's own order is only the fallback when that file cannot be fetched; check-digest holds it to the file. */
/* `function` is not here: Function verified is read off the question type's protocol by qtypes.js, in the browser, and the email says no Function tag. */
const DIGEST_TAG_FACETS = [['forLabel', 'kind'], ['kindLabel', 'kind'], ['subject', 'subject'], ['documentType', 'type'], ['fiveLevel', 'level'],
  ['fiveMonth', 'sitting'], ['fiveDay', 'paper'], ['level', 'level'], ['keystage', 'level'], ['yearGroup', 'level'], ['bandValue', 'level'],
  ['examBoard', 'board'], ['tier', 'tier'], ['examYear', 'sitting'], ['examMonth', 'sitting'], ['accuracy', 'check'], ['paperId', 'paper'], ['qNumber', 'paper'],
  ['qPart', 'paper'], ['qSub', 'paper'], ['marks', 'paper'], ['needs', 'needs'], ['source', 'board']];
/* `DOC_TYPE_UNDER` (find.js, 545): a type that is a kind of another answers both, on the card and so in the email. */
const DIGEST_DOC_TYPE_UNDER = { 'Specimen paper': 'Past paper', '5-a-day': 'Worksheet' };
const DIGEST_FACETS_PATH = 'data/settings/facets.json';
/* THE FACETS FILE THE PHONE ORDERS ITS TAGS BY (546): the site's copy first, then raw.githubusercontent.com; null when neither answers. */
function digestFacetOrder_(site) {
  const urls = [S(site || SITE_URL).replace(/\/*$/, '/') + DIGEST_FACETS_PATH];
  try { urls.push(RAW + DIGEST_FACETS_PATH); } catch (err) { /* sync.gs is not in this scope */ }
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = UrlFetchApp.fetch(urls[i] + '?v=' + Date.now(), { muteHttpExceptions: true, followRedirects: true });
      if (res.getResponseCode() !== 200) continue;
      const rows = JSON.parse(String(res.getContentText('UTF-8')));
      if (Array.isArray(rows) && rows.some(r => r && r.field)) return rows;
    } catch (err) { /* the next URL, then the fallback order */ }
  }
  return null;
}
/* THE EMAIL'S TAG FACETS IN THE FILE'S ORDER — one order, the card's: a facet the file switches off is not said; one it does not list keeps its place. */
function digestTagFacets_(rows) {
  if (!Array.isArray(rows)) return DIGEST_TAG_FACETS;
  const at = {}, off = {};
  rows.forEach(r => { if (r && r.field) { if (r.active === false) off[r.field] = 1; else if (isFinite(Number(r.sort_order)) && S(r.sort_order) !== '') at[r.field] = Number(r.sort_order); } });
  return DIGEST_TAG_FACETS.map((f, i) => ({ f: f, i: i, at: at[f[0]] })).filter(o => !off[o.f[0]])
    .sort((a, b) => (a.at === undefined || b.at === undefined ? a.i - b.i : a.at - b.at || a.i - b.i)).map(o => o.f);
}
/* `LIB_SOURCES` (js/find.js): a worksheet maker is a Source and its sheet has no exam board (O3). */
const DIGEST_SOURCES = ['1st Class Maths', 'Corbettmaths', 'Access Tuition'];
const digestTagSource_ = q => DIGEST_SOURCES.find(s => digestSpell_(s) === digestSpell_(digestLibS_(q.company))) || '';
/* `[data-tag]`'s colours (style.css `--tag-*`), one for every kind `TAG_OF` gives. */
const DIGEST_TAG_INK = { paper: '#ff7b72', subject: '#3ddc84', level: '#6cb6ff', sitting: '#c8a2ff', tier: '#ff8fc4', board: '#4fd1c5',
  type: '#c3e88d', topic: '#ff9e64', needs: '#f0f08a', kind: '#e2cfa6', check: '#9ec5e8', other: '#bdbdbd' };
const DIGEST_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DIGEST_ROMAN = /^(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;

/* THE LIBRARY FOR THE TAGS, IN ONE PASS OVER THE FILE: § */
function digestTagIndex_(text, pids, facets) {
  const out = { docs: {}, heads: {}, rows: {}, facets: digestTagFacets_(facets) }, want = {};
  (pids || []).forEach(p => { want[S(p)] = 1; });
  const parse = line => { try { return JSON.parse(line.replace(/,?\s*$/, '')); } catch (err) { return null; } };
  const live = q => q && q.kind !== 'preamble' && q.kind !== 'document' && digestLibOn_(q.active);
  S(text).split('\n').forEach(line => {
    const m = /"paper_id":("(?:[^"\\]|\\.)*")/.exec(line);
    if (!m) return;
    let pid;
    try { pid = JSON.parse(m[1]); } catch (err) { return; }
    const doc = line.indexOf('"kind":"document"') !== -1;
    if (doc && out.docs[pid]) return;
    if (!doc && !want[pid] && (out.heads[pid] || line.indexOf('"kind":"preamble"') !== -1)) return;
    const q = parse(line);
    if (!q || S(q.paper_id) !== pid) return;
    if (doc) out.docs[pid] = q;
    if (want[pid]) (out.rows[pid] = out.rows[pid] || []).push(q);
    if (!doc && !out.heads[pid] && live(q)) out.heads[pid] = q;
  });
  return out;
}

/* library.js's readers of a cell: `libS`, `libOn` (blank is on), `libTrue`, `libNum` (absent stays absent), `libN`. */
const digestLibS_ = v => (v === undefined || v === null ? '' : String(v));
const digestLibOn_ = v => /^(|true|yes|1|y|on)$/.test(digestLibS_(v).toLowerCase().trim());
const digestLibTrue_ = v => /^(true|yes|1|y|on)$/.test(digestLibS_(v).toLowerCase().trim());
const digestLibNum_ = v => {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return isFinite(n) ? n : null;
};
/* find.js's `spellKey_` and `asList_`. */
const digestSpell_ = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]/g, '');
const digestList_ = v => (Array.isArray(v) ? v : v == null || v === false ? [] : [v]).map(it => String(it == null ? '' : it).trim()).filter(Boolean);

/* A QUESTION ROW AS `questionItems` MAKES IT AN ITEM: the cells the facets read, by the item's names. */
function digestTagItem_(q) {
  return { src: q, subject: digestLibS_(q.subject), documentType: digestLibS_(q.document_type), keystage: digestLibS_(q.key_stage),
           bandType: digestLibS_(q.band_type), bandValue: digestLibS_(q.band_value), tier: digestLibS_(q.tier),
           examBoard: digestTagSource_(q) ? '' : digestLibS_(q.exam_board), examWave: digestLibS_(q.exam_wave), year: digestLibS_(q.year), sub: digestLibS_(q.name) };
}
/* `levelOf_` and `ksFallback_`. */
function digestTagLevel_(it) {
  const band = it.bandType === 'stage' && it.bandValue ? String(it.bandValue) : '';
  let own = band || String(it.src.level || '').trim();
  if (!own) {
    const yr = it.bandType === 'year' ? Number(it.bandValue) : NaN;
    if (yr >= 1 && yr <= 11) own = yr <= 6 ? 'SATs' : yr <= 9 ? 'KS3' : 'GCSE';
    else {
      const ks = digestTagStages_(it).filter(k => /^ks[1-5]$/i.test(k)).sort();
      const k = ks.length ? ks[ks.length - 1] : '';
      own = k ? ({ ks1: 'SATs', ks2: 'SATs', ks3: 'KS3', ks4: 'GCSE', ks5: 'A-Level' }[digestSpell_(k)] || k) : '';
    }
  }
  const l = digestLevelsIn_(own);
  return l.length > 1 ? l : (l[0] || '');
}
/* find.js's `LEVEL_TABLE` and `levelsIn_` (O1), copied: Apps Script cannot load find.js. check-schema asks both copies every
   level cell in the library and its range fixtures, and fails on any difference. */
const DIGEST_LEVELS = [
  { level: 'SATs', rung: 1, says: ['KS1', 'KS2', 'KS1 SATs', 'KS2 SATs'] }, { level: '11+', rung: 0, says: [] },
  { level: 'KS3', rung: 2, says: [] }, { level: 'GCSE', rung: 3, says: ['KS4'] }, { level: 'Functional Skills L2', rung: 0, says: [] },
  { level: 'A-Level', rung: 4, says: ['Alevel', 'A level', 'KS5'] }, { level: 'AS', rung: 0, says: ['AS level', 'AS-level'] },
  { level: 'Theory test', rung: 0, says: [] },
];
function digestLevelsIn_(cell) {
  const key = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9+]/g, '');
  const find = v => DIGEST_LEVELS.find(l => key(l.level) === key(v) || l.says.some(s => key(s) === key(v)));
  const out = [];
  const add = v => { if (v && out.indexOf(v) === -1) out.push(v); };
  const pair = t => {
    const e = t.split(/\s*[–—/]\s*|\s+-\s+|\s+to\s+/i);
    if (e.length === 2 && find(e[0]) && find(e[1])) return [find(e[0]), find(e[1]), t.indexOf('/') !== -1];
    for (let i = t.indexOf('-'); i > 0; i = t.indexOf('-', i + 1)) {
      const a = find(t.slice(0, i)), b = find(t.slice(i + 1));
      if (a && b) return [a, b, false];
    }
    return null;
  };
  String(Array.isArray(cell) ? cell.join(',') : cell == null ? '' : cell).split(',').forEach(atom => {
    const t = atom.trim();
    if (!t) return;
    const l = find(t);
    if (l) { add(l.level); return; }
    const p = pair(t);
    if (!p) { add(t); return; }
    const a = p[0], b = p[1];
    if (p[2] || !a.rung || !b.rung) { add(a.level); add(b.level); return; }
    const lo = Math.min(a.rung, b.rung), hi = Math.max(a.rung, b.rung);
    DIGEST_LEVELS.filter(e => e.rung >= lo && e.rung <= hi).forEach(e => add(e.level));
  });
  return out;
}
const digestTagStages_ = it => String(it.keystage || '').split(',').map(s => s.trim()).filter(Boolean);
/* `satsStagesOf_`, asked only of a SATs row. */
function digestTagSats_(it) {
  if (digestList_(digestTagLevel_(it)).indexOf('SATs') === -1) return [];
  const yr = it.bandType === 'year' ? Number(it.bandValue) : NaN;
  if (yr >= 1 && yr <= 6) return [yr <= 2 ? 'KS1' : 'KS2'];
  const named = /\bks\s*([12])\b/i.exec(String((it.bandType === 'stage' && it.bandValue) || it.src.level || ''));
  if (named) return ['KS' + named[1]];
  const out = [];
  digestTagStages_(it).forEach(k => { const m = /^ks\s*([12])$/i.exec(k); if (m && out.indexOf('KS' + m[1]) < 0) out.push('KS' + m[1]); });
  return out.sort();
}
/* `yearOf`, `seriesOf_`, `waveOf` and `waveFromDoc_`: the sitting as "Summer 2024", read as `sittingOf_` splits it. */
function digestTagYearOf_(it) {
  const own = String(it.year || '').trim(), inOwn = own.match(/\b(19|20)\d{2}\b/);
  if (inOwn) return inOwn[0];
  if (own && own.length <= 9 && !/\s/.test(own)) return own;
  const m = String(it.examWave || '').match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : '';
}
function digestTagSeries_(m) {
  const n = Number(m);
  if (!isFinite(n) || n < 1 || n > 12) return '';
  return n >= 5 && n <= 7 ? 'Summer' : n >= 10 && n <= 12 ? 'Autumn' : DIGEST_MONTHS[n - 1];
}
const digestTagMonthAt_ = w => DIGEST_MONTHS.findIndex(m => m.toLowerCase().startsWith(String(w).toLowerCase().slice(0, 3)));
function digestTagWave_(it, T) {
  const raw = String(it.examWave || '').trim(), q = it.src;
  if (!raw) {
    if (String(it.documentType || q.document_type || '').toLowerCase() !== 'past paper') return '';
    const doc = T.docs[S(q.paper_id)] || {};
    const named = /\s[—–]\s([A-Za-z]{3,9})\s+((?:19|20)\d{2})\s*$/.exec(String(doc.name || q.name || ''));
    const mth = Number(q.month || doc.month || 0) || (named ? digestTagMonthAt_(named[1]) + 1 : 0);
    const yr = digestTagYearOf_(it) || String(doc.year || '').trim() || (named ? named[2] : '');
    const series = digestTagSeries_(mth);
    return series && /^(19|20)\d{2}$/.test(yr) ? series + ' ' + yr : '';
  }
  const phase = raw.match(/^(first|second|third)\s+wave$/i);
  if (phase) {
    const yr = digestTagYearOf_(it);
    const series = digestTagSeries_(Number(q.month || 0)) || (/^first$/i.test(phase[1]) ? 'Summer' : 'Autumn');
    return yr ? series + ' ' + yr : raw;
  }
  const said = raw.match(/^([A-Za-z]{3,9})\s+((?:19|20)\d{2})$/);
  if (said) { const i = digestTagMonthAt_(said[1]); return i < 0 ? raw : digestTagSeries_(i + 1) + ' ' + said[2]; }
  const long = raw.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b[^]*?\b((?:19|20)\d{2})\b/);
  if (long) { const i = DIGEST_MONTHS.findIndex(m => m.slice(0, 3) === long[1]); return i < 0 ? long[2] : digestTagSeries_(i + 1) + ' ' + long[2]; }
  const iso = raw.match(/\b((?:19|20)\d{2})-(\d{2})-\d{2}\b/);
  if (iso) return digestTagSeries_(parseInt(iso[2], 10)) + ' ' + iso[1];
  const bare = raw.match(/\b(19|20)\d{2}\b/);
  return bare ? bare[0] : raw;
}
function digestTagYear_(it, T) {
  const w = String(digestTagWave_(it, T) || '').trim();
  const m = /^(.*\S)\s+((?:19|20)\d{2})$/.exec(w);
  return m ? m[2] : /^(19|20)\d{2}$/.test(w) ? w : '';
}
/* `sittingMonth_`. */
function digestTagMonth_(it, T) {
  if (!digestTagYear_(it, T)) return '';
  const q = it.src, doc = T.docs[S(q.paper_id)] || {};
  const ofDate = v => { const m = /\b(?:19|20)\d{2}-(\d{2})-\d{2}\b/.exec(String(v || '')); return m ? Number(m[1]) : 0; };
  const ofWord = v => {
    const i = DIGEST_MONTHS.findIndex(n => n.slice(0, 3).toLowerCase() === String(v || '').slice(0, 3).toLowerCase());
    return i < 0 ? 0 : i + 1;
  };
  const ofName = v => { const m = /\s[—–]\s(?:\d{1,2}\s+)?([A-Za-z]{3,9})\s+(?:19|20)\d{2}\s*$/.exec(String(v || '')); return m ? ofWord(m[1]) : 0; };
  const ofWave = v => { const m = /^([A-Za-z]{3,9})\s+(?:19|20)\d{2}$/.exec(String(v || '').trim()); return m ? ofWord(m[1]) : ofDate(v); };
  const n = ofName(doc.name || q.name || it.sub) || Number(q.month || 0) || ofDate(q.exam_date) || Number(doc.month || 0)
    || ofDate(doc.exam_date) || ofWave(it.examWave);
  return n >= 1 && n <= 12 ? DIGEST_MONTHS[n - 1] : '';
}
/* A 5-A-DAY's DAY, from its id — `fiveADayOf_`. */
function digestTagFive_(q) {
  if (String(q.document_type || '') !== '5-a-day') return null;
  const m = /^P-CBM-5AD-[A-Z+]+-(\d{2})(\d{2})$/.exec(String(q.paper_id || ''));
  const month = m ? DIGEST_MONTHS[Number(m[1]) - 1] : '';
  return month ? { month: month, day: Number(m[2]) } : null;
}
/* `nameForms_`: the rungs a paper's name is shortened by. */
const DIGEST_TAG_CUT = new RegExp('\\s[\\u2014\\u2013]\\s|\\s\\u00b7\\s(?=(?:(?:19|20)\\d{2}|' + DIGEST_MONTHS.join('|') + ')$)');
function digestTagForms_(s) {
  const full = String(s == null ? '' : s).trim(), out = [];
  const cut = re => { const m = re.exec(full); if (!m || !m.index) return; const v = full.slice(0, m.index).trim(); if (v && v !== full && out.indexOf(v) === -1) out.push(v); };
  cut(DIGEST_TAG_CUT);
  cut(/\s*[:(]/);
  out.sort((a, b) => a.length - b.length);
  const q = /\s*[:(]/.exec(full), d = DIGEST_TAG_CUT.exec(full);
  if (q && q.index && d && q.index < d.index) { const v = full.slice(0, q.index).trim() + full.slice(d.index); if (v !== full && out.indexOf(v) === -1) out.splice(1, 0, v); }
  out.push(full);
  return out;
}
/* `facetSay_`'s one way of saying a value: its first letter capitalised, unless it is a single lower-case letter or a roman numeral. */
const digestSay_ = v => { const t = String(v == null ? '' : v).trim(); return /^(?:[a-z]|[ivx]+)$/.test(t) ? t : t.charAt(0).toUpperCase() + t.slice(1); };
/* THE ANSWERS OF THE FACETS ASKED BEFORE Paper that a paper's head row gives — `cardList_`'s chips, read off one row a paper. */
function digestTagBefore_(it, T) {
  const five = digestTagFive_(it.src);
  return { subject: digestList_(it.subject), documentType: digestList_(it.documentType),
           fiveLevel: digestList_(five ? it.tier : ''), fiveMonth: digestList_(five ? five.month : ''), fiveDay: digestList_(five ? five.day + ' ' + five.month : ''),
           level: digestList_(digestTagLevel_(it)), keystage: digestTagKeystage_(it),
           yearGroup: digestList_(it.bandValue && it.bandType === 'year' ? 'Year ' + it.bandValue : ''),
           bandValue: digestList_(it.bandValue && it.bandType === 'grade' ? 'Grade ' + it.bandValue : ''),
           examBoard: digestList_(it.examBoard), tier: digestList_(it.tier), examYear: digestList_(digestTagYear_(it, T)), examMonth: digestList_(digestTagMonth_(it, T)) };
}
const digestTagKeystage_ = it => { const s = digestTagSats_(it); return s.length ? s : digestTagStages_(it); };
/* `cardList_` + `facetShort_`: the paper said as its Paper button would be once every question before it was answered the card's way — `Paper 1`. */
function digestTagPaper_(it, T) {
  const pid = S(it.src.paper_id);
  if (!pid) return '';
  T.paperSaid = T.paperSaid || {};
  if (pid in T.paperSaid) return T.paperSaid[pid];
  const nameOf = id => digestSay_(String((T.docs[id] || {}).name || id).trim());
  const forms0 = digestTagForms_(nameOf(pid));
  if (forms0.length < 2) return (T.paperSaid[pid] = nameOf(pid));
  if (!T.before) { T.before = {}; Object.keys(T.heads).forEach(p => { T.before[p] = digestTagBefore_(digestTagItem_(T.heads[p]), T); }); }
  const mine = digestTagBefore_(it, T);
  const sib = Object.keys(T.heads).filter(p => Object.keys(mine).every(k => !mine[k].length
    || (T.before[p][k] || []).some(v => mine[k].some(w => digestSpell_(v) === digestSpell_(w)))));
  if (sib.indexOf(pid) < 0) sib.push(pid);
  /* `shortLabels_`: the first rung at which every name among them is told apart. */
  const forms = sib.map(v => digestTagForms_(nameOf(v)));
  let deepest = 0, show = '';
  forms.forEach(f => { deepest = Math.max(deepest, f.length); });
  for (let rung = 0; rung < deepest && !show; rung++) {
    const at = forms.map(f => f[Math.min(rung, f.length - 1)]);
    if (new Set(at.map(digestSpell_)).size === at.length) show = at[sib.indexOf(pid)];
  }
  return (T.paperSaid[pid] = show || nameOf(pid));
}
/* `partSplit_`, with the question's own numeral decision (`partNumerals_`): `ai` is [a] [i], AQA's `1` is [.1], a lone `ii` a numeral when every part of the question is one. */
function digestTagSplit_(q, T) {
  const bare = p => String(p == null ? '' : p).trim().toLowerCase().replace(/[()\s]/g, '');
  const sib = (T.rows[S(q.paper_id)] || [q]).filter(o => o.kind !== 'preamble' && o.kind !== 'document' && digestLibOn_(o.active)
    && digestLibS_(o.question) === digestLibS_(q.question));
  const numerals = sib.every(o => { const s = bare(o.part); return !s || DIGEST_ROMAN.test(s); });
  const split = (part, num) => {
    const s = bare(part);
    if (!s) return { part: '', sub: '' };
    if (/^\d+$/.test(s)) return { part: '.' + Number(s), sub: '' };
    if (num && DIGEST_ROMAN.test(s)) return { part: '', sub: s };
    const n = /^(\d+)(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i.exec(s);
    if (n) return { part: '.' + Number(n[1]), sub: n[2] };
    const m = /^([a-z])(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/.exec(s);
    return m ? { part: m[1], sub: m[2] || '' } : null;
  };
  return split(q.part, numerals) || split(q.part, true) || { part: '', sub: '' };
}
/* `needsIndex_`/`needsOf_`: the paper's kit, then the question's, then the printed sheet — the calculator in `NEED_WORDS`' words. */
function digestTagNeeds_(q, T) {
  const out = [], add = v => { v = ({ 'no calculator': 'Non-calculator', calculator: 'Calculator allowed' })[String(v || '').trim().toLowerCase()] || v; if (v && out.indexOf(v) === -1) out.push(v); };
  digestList_(String((T.docs[S(q.paper_id)] || {}).needs || '').split(',')).forEach(add);
  digestList_(digestLibS_(q.needs).split(',')).forEach(add);
  if (digestLibTrue_(q.needs_print) || digestLibTrue_(q.print_required)) add('Printed sheet');
  return out;
}

/* EVERY TAG THE SITE'S CARD WEARS FOR THIS QUESTION ROW, in its order, each `{ kind, text }` — `tagRow_`'s walk and its one dedupe: § */
function digestCardTags_(q, T) {
  if (!q || !T) return [];
  const it = digestTagItem_(q), pid = S(q.paper_id), five = digestTagFive_(q);
  const lv = digestTagLevel_(it), split = digestTagSplit_(q, T);
  const marks = Number(digestLibS_(q.marks).replace(/[^0-9.-]/g, '')) || 0;
  /* EACH FACET'S ANSWERS (`facetOwn_`, `tagOf` for the card's own page), in the words the value is. */
  const of = {
    /* `KIND_UNDER` (find.js, 546): a question is Practice as well as Questions. */
    forLabel: () => 'Learning', kindLabel: () => ['Practice', 'Questions'],
    subject: () => it.subject, documentType: () => (DIGEST_DOC_TYPE_UNDER[it.documentType] ? [DIGEST_DOC_TYPE_UNDER[it.documentType], it.documentType] : it.documentType),
    fiveLevel: () => (five ? it.tier : ''), fiveMonth: () => (five ? five.month : ''), fiveDay: () => (five ? five.day + ' ' + five.month : ''),
    level: () => lv, keystage: () => digestTagKeystage_(it),
    yearGroup: () => (it.bandValue && it.bandType === 'year' ? 'Year ' + it.bandValue : ''),
    bandValue: () => (it.bandValue && it.bandType === 'grade' ? 'Grade ' + it.bandValue : ''),
    examBoard: () => it.examBoard, tier: () => it.tier,
    examYear: () => digestTagYear_(it, T), examMonth: () => digestTagMonth_(it, T),
    paperId: () => pid, qNumber: () => (digestLibS_(q.question) ? 'Q' + digestLibS_(q.question) : ''), qPart: () => split.part, qSub: () => split.sub,
    marks: () => (marks > 0 ? marks + ' mark' + (marks === 1 ? '' : 's') : ''), needs: () => digestTagNeeds_(q, T),
    accuracy: () => (digestLibTrue_(q.verified) ? 'Accuracy verified' : 'Accuracy unverified'), source: () => digestTagSource_(q),
  };
  const say = { paperId: () => digestTagPaper_(it, T) };
  /* `tagRow_`'s dedupe: a word already said, an id already said, or a tag that is only earlier tags side by side (`tagMadeOf_`). */
  const madeOf = (text, said) => {
    const t = text.toLowerCase(), parts = said.map(w => w.toLowerCase()).filter(Boolean);
    const from = i => i === t.length || parts.some(p => t.startsWith(p, i) && (i + p.length === t.length || (t[i + p.length] === ' ' && from(i + p.length + 1))));
    return parts.length > 1 && t.indexOf(' ') > 0 && from(0);
  };
  const out = [], words = Object.create(null), ids = Object.create(null), said = [];
  (T.facets || DIGEST_TAG_FACETS).forEach(f => {
    let vals;
    try { vals = digestList_(of[f[0]]()); } catch (err) { vals = []; }
    vals.forEach(raw => {
      let text = raw;
      try { text = String((say[f[0]] ? say[f[0]](raw) : digestSay_(raw)) || raw).trim(); } catch (err) { text = raw; }
      const w = text.toLowerCase();
      if ((/[A-Za-z]/.test(text) && (words[w] || madeOf(text, said))) || (/[A-Za-z]/.test(raw) && ids[raw])) return;
      words[w] = 1; ids[raw] = 1; said.push(text);
      out.push({ kind: f[1], text: text });
    });
  });
  return out;
}

/* THE ROWS ASKED FOR, AND THE PREAMBLES OF THEIR PAPERS — one line each, found by its text and parsed alone. § */
function digestLibraryFind_(text, ids) {
  const bounds = at => {
    const a = text.lastIndexOf('\n', at) + 1;
    let b = text.indexOf('\n', at);
    if (b === -1) b = text.length;
    return [a, b];
  };
  const parse = line => { try { return JSON.parse(line.replace(/,?\s*$/, '')); } catch (err) { return null; } };
  const rows = {}, papers = [];
  (ids || []).forEach(id => {
    const at = text.indexOf('"row_id":' + JSON.stringify(id));
    if (at === -1) return;
    const ab = bounds(at), q = parse(text.slice(ab[0], ab[1]));
    if (!q || S(q.row_id) !== id) return;
    rows[id] = q;
    const pid = S(q.paper_id || q.paper);
    if (pid && papers.indexOf(pid) === -1) papers.push(pid);
  });
  const pre = [];
  const tags = papers.map(pid => '"paper_id":' + JSON.stringify(pid));
  const mark = '"kind":"preamble"';
  for (let at = text.indexOf(mark); tags.length && at !== -1; ) {
    const ab = bounds(at), line = text.slice(ab[0], ab[1]);
    if (tags.some(t => line.indexOf(t) !== -1)) {
      const p = parse(line);
      if (p && p.kind === 'preamble' && ON_(p.active)) pre.push(p);
    }
    at = text.indexOf(mark, ab[1]);
  }
  /* AND EACH ROW'S TAGS, AS ITS CARD WEARS THEM (`digestCardTags_`); a failure costs the tags, never the email. */
  const worn = {};
  try {
    const T = digestTagIndex_(text, papers, digestFacetOrder_());
    Object.keys(rows).forEach(id => { worn[id] = digestCardTags_(rows[id], T); });
  } catch (err) { /* the cards fall back to what their labels say */ }
  return { rows: rows, pre: pre, tags: worn };
}

/* THE PREAMBLES IN FRONT OF A QUESTION, OUTERMOST FIRST — `stemIndex_` and `preamble_` (js/find.js) for one question: § */
function digestStemRows_(q, pre) {
  const bare = v => S(v).toLowerCase().replace(/[()\s]/g, '');
  const pidOf = one => S(one && (one.paper_id || one.paper));
  const scopeOf = one => {
    const num = S(one.question), part = bare(one.part);
    if (num && /^[a-z]$/.test(part)) return 'l|' + num + '|' + part;
    if (num) return 'q|' + num;
    if (S(one.section)) return 's|' + S(one.section);
    return 'p';
  };
  /* A PART'S LETTER, READ AS `qRefBits_` READS IT: "d(ii)" and "dii" are (d); "ii" alone is a numeral. */
  const letterOf = part => {
    const s = bare(part);
    if (!s || /^(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/.test(s)) return '';
    const m = /^([a-z]?)(i{1,3}|iv|vi{0,3}|ix|xi{0,3})?$/.exec(s);
    return m ? m[1] : '';
  };
  const pid = pidOf(q), num = S(q.question), letter = letterOf(q.part);
  const want = ['p'];
  if (S(q.section)) want.push('s|' + S(q.section));
  if (num) { want.push('q|' + num); if (letter) want.push('l|' + num + '|' + letter); }
  const out = [];
  want.forEach(w => (pre || []).filter(one => pidOf(one) === pid && scopeOf(one) === w)
    .sort((a, b) => (N(a.sort_order) || 0) - (N(b.sort_order) || 0))
    .forEach(one => { if (S(one.html) || S(one.diagram)) out.push(one); }));
  return out;
}
/* THE LIBRARY'S MARKUP AS TEXT — `aiPlain_` (js/keypad.js) without a DOMParser, which Apps Script has not got: § */
function digestPlain_(html) {
  return S(html)
    .replace(/<sup>([^<]*)<\/sup>\s*(?:&frasl;|\u2044)\s*<sub>([^<]*)<\/sub>/g, '($1)/($2)')
    .replace(/<sup>([^<]*)<\/sup>/g, '^($1)')
    .replace(/<(br|\/p|\/li|\/div|\/tr)\b[^>]*>/gi, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/?[a-z][^<>]*>/gi, '')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => {
      if (e.charAt(0) === '#') {
        const n = /^#x/i.test(e) ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
      }
      return Object.prototype.hasOwnProperty.call(DIGEST_ENTITIES, e) ? DIGEST_ENTITIES[e] : m;
    })
    .replace(/[ \t\u00a0]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim();
}

/* `checkSundayEmail` — ONE CHECK THE OWNER RUNS FROM THE EDITOR, AND IT CHANGES NOTHING (12 Oct) § */
function checkSundayEmail() {
  const lines = [];
  const say = s => { lines.push(s); };
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const now = new Date();
  let cfg = {};
  try { cfg = config(); } catch (err) { say('The config tab could not be read (' + S(err && err.message || err) + '), so this is the defaults.'); }
  /* THE HOUR THE TRIGGER WAS BOOKED AT, not the cell's (the review of 12 Oct): the cell changed after
     installing moves nothing, and this said "installed, at about 20:00" over a trigger firing at 18:00. */
  const mode = digestMode_(cfg), hour = digestBookedHour_(cfg), cellHour = digestHour_(cfg), reserve = digestReserve_(cfg);
  say('Backend ' + BACKEND_VERSION + ' — the code this trigger runs, as saved in this editor.');

  const sun = digestScheduled_(DIGEST_RUN), booked = digestBooked_();
  let old = 0;
  DIGEST_RETIRED_RUNS.forEach(fn => { old += Number(digestScheduled_(fn)) || 0; });
  /* AN HOUR NOBODY RECORDED IS NOT THE CELL'S HOUR: a trigger booked by a backend from before the record fires
     at whatever the cell said then, and this said "about 21:00" over a trigger firing at 18:00. */
  const unknownHour = booked < 0 && !!sun;
  say('THE EMAIL: ' + (mode === 'send' ? 'ON — it emails parents'
      : mode === 'preview' ? 'PREVIEW — it writes the digest_log tab and emails nobody'
      : 'OFF — nothing is sent') + ' (weekly_digest is "' + S(cfg.weekly_digest) + '"). '
    + (unknownHour ? 'The hour it goes at on Sundays was not recorded — see THE HOUR BOOKED below.'
       : 'It goes on Sundays at about ' + hour + ':00, London time.')
    + (mode === 'send' ? '' : ' Set weekly_digest to send on the config tab to email parents.'));

  /* ONE TRIGGER (18 Oct): the email's, and nothing beside it. An old one still booked — the AI marking
     passes', or the after-session check's — fires into a function that is gone and fails, so it is a WARNING. */
  say('THE TRIGGER: the Sunday email is ' + (sun === null ? 'unknown (the triggers could not be listed)'
      : sun === 1 ? 'installed' : sun ? 'installed ' + sun + ' times (the next admin page load leaves one)'
      : 'NOT installed (the next admin page load books it)') + ', and it is the only trigger the email has. '
    + (old ? 'WARNING: ' + plural(old, 'old trigger') + ' that nothing runs any more (' + DIGEST_RETIRED_RUNS.join(', ')
        + ') ' + (old === 1 ? 'is' : 'are') + ' still booked and will fail — the next admin page load removes '
        + (old === 1 ? 'it' : 'them') + '.'
      : 'No old trigger is booked.'));

  /* THE HOUR BOOKED, ON A LINE OF ITS OWN (18 Oct). § */
  say('THE HOUR BOOKED: ' + (booked >= 0
      ? 'The setup booked the email for about ' + booked + ':00 on Sundays, London time (recorded in Script Properties as '
        + DIGEST_BOOKED + ').' + (booked !== cellHour
          ? ' WARNING: weekly_digest_hour on the config tab now says ' + cellHour + ', but the email still goes at about ' + booked
            + ':00 — the next admin page load moves it to ' + cellHour + ':00.'
          : ' The config tab says the same.')
      : unknownHour ? 'NOT recorded — the trigger was booked by an older backend, and Apps Script cannot read a trigger’s hour back. '
        + 'WARNING: the next admin page load re-books it at ' + cellHour + ':00 (weekly_digest_hour) and the hour is recorded.'
      : 'nothing is booked yet; the next admin page load books ' + cellHour + ':00 (weekly_digest_hour on the config tab).'));

  const quota = digestQuota_();
  say('MAIL: ' + plural(quota, 'email') + ' left in today’s quota; the Sunday run keeps ' + reserve + ' back for PIN resets and notices.');

  /* THE LIBRARY, AS THE RUN FETCHES IT — the one part of this nobody can see from the editor, and what
     prints each question as it is on the site. */
  const lib = digestLibrary_(S(cfg.site_url) || SITE_URL);
  say(lib.error ? 'THE QUESTION LIBRARY: NOT fetched — ' + lib.error + '.'
    : 'THE QUESTION LIBRARY: fetched ' + (lib.size / 1e6).toFixed(1) + ' million characters in '
      + (lib.ms / 1000).toFixed(1) + ' s from ' + lib.url + '.');

  const week = digestWeek_(now);
  const noTab = digestNoSubmissions_();
  if (noTab) {
    say('THIS WEEK: ' + noTab);
  } else {
    let plan = null;
    try { plan = digestPlanNow_(week); }
    catch (err) { say('THIS WEEK: could not be planned (' + S(err && err.message || err) + ').'); }
    if (plan) {
      const reached = plan.learners.filter(L => !L.why);
      say('THIS WEEK (' + digestSpan_(week) + ', so far): ' + plural(plan.learners.length, 'learner') + ' sent answers; '
        + reached.length + ' of them will have a parent emailed (' + plural(plan.emails.length, 'email') + ').');
      plan.learners.filter(L => L.why).forEach(L => {
        say('  NOT REACHED — ' + (S(L.first) || 'a learner with no first name') + ': ' + digestWhyNot_(L) + '.');
      });
      /* AND WHO GETS NOTHING BECAUSE THERE IS NOTHING YET (the review of 12 Oct). § */
      const did = {};
      plan.learners.forEach(L => { did[L.id] = 1; });
      let people = [];
      try { people = read(TAB.people).rows; } catch (err) { people = []; }
      const idle = [];
      people.forEach(p => {
        const id = S(p && p.person_id);
        if (!id || did[id]) return;
        if (digestReach_(id, acceptedParents).to.length) idle.push(S(p.first_name) || 'a learner with no first name');
      });
      if (idle.length) say('  NO ANSWERS YET — ' + idle.join(', ') + ': a parent can be emailed, but no email goes unless '
        + (idle.length === 1 ? 'they answer' : 'each answers') + ' a question by about ' + hour + ':00 on Sunday.');
    }
  }
  say('Nothing was changed: no row written, no email sent, no trigger booked.');
  Logger.log(lines.join('\n'));
  return { lines: lines };
}
/* WHY A LEARNER WILL NOT BE REACHED, IN THE OWNER'S WORDS — from `digestPlan_`'s reasons, naming each
   parent by first name. */
function digestWhyNot_(L) {
  if (!(L.skipped || []).length) return /people tab/.test(S(L.why)) ? 'not on the people tab' : 'no parent has accepted a link to them';
  const said = { 'no email address': 'has no email address', 'email not confirmed': 'has not confirmed their email address',
                 'asked not to get it': 'said no to these emails', 'same address as another parent': 'shares an address with another parent' };
  return L.skipped.map(p => 'parent ' + (S(p.first) || 'with no first name') + ' ' + (said[p.why] || p.why)).join('; ');
}


/* ---------- "SEND LAST WEEK": AN ADMIN'S PRESS ON A PARENT'S CARD, AND THE EDITOR'S TWO (378) ---------- */
/* The last whole Monday–Sunday to the parents named, whatever weekly_digest says — the press is the yes. § */
function digestSendNow_(parentIds, now) {
  let cfg = {};
  try { cfg = config(); } catch (err) { cfg = {}; }
  const ids = (parentIds || []).map(S).filter(Boolean);
  const fail = e => ids.map(id => ({ id: id, error: e }));
  if (!digestLog_().sheet) return fail('The sheet has no digest_log tab. Open the site once as an admin to add it. Nothing was sent.');
  const noSubmissions = digestNoSubmissions_();
  if (noSubmissions) return fail(noSubmissions);
  const week = digestWeekToSend_(now);
  const span = digestShortSpan_(week);
  let lib = null;
  try { lib = digestEmailLibrary_(week, read(TAB.submissions).rows, cfg); }
  catch (err) { lib = { rows: {}, pre: [], error: S(err && err.message || err) }; }
  const plan = digestPlanNow_(week, now, lib);
  const names = list => list.length < 2 ? list.join('') : list.slice(0, -1).join(', ') + ' and ' + list[list.length - 1];
  return ids.map(id => {
    const P = findPerson('', id);
    if (!P || S(P.person_id) !== id) return { id: id, error: 'We could not find that parent — nothing was sent.' };
    const first = digestSafe_(P.first_name) ? S(P.first_name) : (S(P.handle) ? '@' + S(P.handle) : 'They');
    if (!S(P.email)) return { id: id, error: first + ' has no email address — add it with Edit' };
    const kids = childrenOf(id).filter(k => S(k.person_id) !== id);
    const kidName = k => (digestSafe_(k.first_name) ? S(k.first_name) : 'their child');
    if (!kids.length) return { id: id, error: first + ' has no child linked — add one with Edit' };
    const mine = plan.emails.filter(m => S(m.parent_id) === id);
    if (!mine.length) {
      /* A CHILD WHO WORKED BUT CANNOT BE SENT TO THIS PARENT says why; otherwise it was a quiet week. */
      const held = plan.learners.map(L => (L.skipped || []).find(p => p.id === id)).filter(Boolean)[0];
      const why = { 'email not confirmed': first + '’s email address is not confirmed yet — nothing was sent',
                    'asked not to get it': first + ' asked not to get these emails (Settings → Notifications) — nothing was sent',
                    'same address as another parent': first + ' shares an email address with another parent, who gets it — nothing was sent' };
      if (held) return { id: id, error: why[held.why] || (first + ': ' + held.why + ' — nothing was sent') };
      return { id: id, success: true, sent: 0, said: 'Nothing to send: ' + names(kids.map(kidName)) + ' did no questions ' + span };
    }
    const mailed = digestMail_(mine, {
      mode: 'send', again: true, note: 'sent by hand', reserve: digestReserve_(cfg), readLog: digestLog_, brand: plan.look.brand,
      find: (log, m) => digestLogFind_(log, week.start, m.learner_id, m.parent_id),
      put: (log, row, m, v) => digestLogPut_(log, row, week.start, m.learner_id, m.parent_id, v),
      heldNote: 'daily mail quota — press Send last week again tomorrow',
    });
    const count = mine.reduce((n, m) => n + (Number(m.count) || 0), 0);
    if (mailed.sent === mine.length) {
      return { id: id, success: true, sent: mailed.sent, questions: count,
               said: 'Sent to ' + first + ' — ' + count + ' question' + (count === 1 ? '' : 's') + ' (' + span + ')' };
    }
    const part = mailed.sent ? ' (' + mailed.sent + ' of ' + mine.length + ' went)' : '';
    if (mailed.held) return { id: id, error: 'Not sent to ' + first + ' — today’s mail quota is used up; press again tomorrow' + part };
    if (mailed.busy) return { id: id, error: 'The log was busy — press again in a minute' + part };
    return { id: id, error: 'The email to ' + first + ' failed — see the digest_log tab' + part };
  });
}
/* `12–18 Oct`, or `28 Sep – 4 Oct` across a month. */
function digestShortSpan_(week) {
  const full = digestSpan_(week);
  return week.start.slice(0, 7) === week.end.slice(0, 7) ? (+week.start.slice(8, 10)) + '–' + full.split(' – ')[1] : full;
}
/* THE EDITOR'S FALLBACK: `sendLastWeekTo('@handle')` or an email or a person id, from a line of your own. */
function sendLastWeekTo(handleOrEmail) {
  const want = typeof handleOrEmail === 'string' ? norm(handleOrEmail).replace(/^@/, '') : '';
  if (!want) throw new Error('sendLastWeekTo needs a parent: write sendLastWeekTo("@handle") in a function of your own and run that, or run sendLastWeekToAll.');
  const P = read(TAB.people).rows.find(r => norm(r.handle) === want || norm(r.email) === want || norm(r.person_id) === want);
  if (!P) throw new Error('Nobody on the people tab has the handle, email or id "' + handleOrEmail + '". Nothing was sent.');
  const got = digestSendNow_([S(P.person_id)], new Date())[0];
  console.log(got.said || got.error);
  return got;
}
/* EVERY PARENT (role client) WITH A CHILD LINKED, last week, one line each. */
function sendLastWeekToAll() {
  const ids = read(TAB.people).rows.filter(r => hasRole(r, 'client') && S(r.person_id) && childrenOf(S(r.person_id)).length)
    .map(r => S(r.person_id));
  const out = digestSendNow_(ids, new Date());
  out.forEach(got => console.log(got.id + ': ' + (got.said || got.error)));
  return out;
}
