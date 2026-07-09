const API = 'https://script.google.com/macros/s/AKfycbyINfTA44t4ibW6ihxADTwCo1CxCP8v6UA_SR_4GiCQuR7Q4cRNWnlkOdb2xQaSoGzk/exec';
let DATA = {};
let USER = null; // set on login: { name }
let NOTEPAD_TIMER = null;   // debounce timer for notepad auto-save

const isHome = loc => /home/i.test(loc || '');
// Normalise any time value to a friendly 12-hour label: "09:00"/Date/ISO → "9am", "13:30" → "1:30pm"
const fmtTime = t => {
  let s = String(t ?? '').trim();
  if (!s) return '';
  let h, min;
  const m = s.match(/(\d{1,2}):(\d{2})/);            // HH:MM anywhere in the string
  if (m) { h = +m[1]; min = +m[2]; }
  else {
    const d = new Date(s);
    if (isNaN(d)) return s;
    h = d.getHours(); min = d.getMinutes();
  }
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return min ? `${h12}:${String(min).padStart(2,'0')}${ampm}` : `${h12}${ampm}`;
};
// Day → plural, capitalised: "thursday"/"thursdays" → "Thursdays"
const fmtDay = day => {
  const s = String(day || '').trim();
  if (!s) return 'TBD';
  const base = s.replace(/s$/i, '');
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase() + 's';
};
// Weeks → whole number (round down; you can't bill a partial week)
const fmtWeeks = w => { const n = Math.floor(parseFloat(w) || 0); return n > 0 ? n : ''; };
// Date → short DD/MM/YY. Handles "22/07/2026", Date objects, and long GMT strings.
const fmtDate = v => {
  const s = String(v ?? '').trim();
  if (!s) return '';
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);   // already DD/MM/YYYY
  if (m) { const y = m[3].slice(-2); return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${y}`; }
  const d = new Date(s);
  if (isNaN(d)) return s;
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`;
};

/* ---------- UTILS ---------- */
const $   = id => document.getElementById(id);
const esc = s  => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Site-wide rule: any @mention or #hashtag in text is coloured blue, like social media.
// Always escapes first, so it's safe to use anywhere user/sheet text is rendered.
const escTokens = s => esc(s).replace(/([#@][\w.]+)/g, '<span class="token">$1</span>');
const val = id => ($(id) || {}).value || '';
// Who participates in the checklist + arcade (topics, levels, highscores): kids AND tutors.
const canTrack = () => !!USER && (USER.role === 'kid' || USER.role === 'tutor');

// Checklist progress: three independent columns tick1/tick2/tick3, each a comma list of topic names.
// A topic present in tickN's list = that box checked. Returns { topicLower: {t1,t2,t3} }.
function parseProgress() {
  const listToSet = str => new Set(String(str || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean));
  const s1 = listToSet(USER?.tick1), s2 = listToSet(USER?.tick2), s3 = listToSet(USER?.tick3);
  const keys = new Set([...s1, ...s2, ...s3]);
  const out = {};
  keys.forEach(k => out[k] = { t1: s1.has(k), t2: s2.has(k), t3: s3.has(k) });
  return out;
}
const html = (el, content) => { if ($(el)) $(el).innerHTML = content; };
const tog = (el, force) => $(el)?.classList.toggle('hidden', force);
// Turn a Google Drive share link into a direct thumbnail URL.
// Handles both /file/d/FILEID/... and open?id=FILEID / ?id=FILEID formats.
// Anything that isn't a Drive link is passed through untouched.
const drive = url => {
  const s = String(url || '');
  const m = s.match(/\/d\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400` : s;
};
const empty = (arr, msg) => arr?.length ? arr.map : () => `<p class="muted">${msg}</p>`;

/* ---------- INIT ---------- */
async function init() {
  const params = new URLSearchParams(location.search);
  // Restore login from this browser session (survives the Stripe redirect / refresh)
  try {
    const saved = localStorage.getItem('familyUser');
    if (saved) USER = JSON.parse(saved);
  } catch {}

  // Returning after paying for an added student (?addpaid=1&ref=...)
  if (params.get('addpaid') === '1' && params.get('ref')) {
    try {
      await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'finalizeAddStudent', ref: params.get('ref') }) });
    } catch {}
    history.replaceState({}, '', location.pathname);
    const banner = $('health-banner');
    if (banner) { banner.textContent = '✅ Student added and paid — they\'re confirmed in the class.'; banner.classList.remove('hidden'); }
  } else if (params.get('addpaid') === '0') {
    history.replaceState({}, '', location.pathname);
  }

  // A parent landed on a split pay-share link (?pay_share=ORDERREF) → send them to pay their share.
  if (params.get('pay_share')) {
    const orderRef = params.get('pay_share');
    history.replaceState({}, '', location.pathname);
    try {
      const d = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'payShare', splitRef: orderRef }) })).json();
      if (d.url) { window.location.href = d.url; return; }
    } catch {}
  }
  // Returning after paying a share (?sharepaid=1&ref=...) → mark it paid, maybe confirm the class.
  const sharePaid = params.get('sharepaid') === '1' && params.get('ref');
  if (sharePaid) {
    try {
      const d = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'finalizeShare', ref: params.get('ref') }) })).json();
      history.replaceState({}, '', location.pathname);
      const banner = $('health-banner');
      if (banner) {
        banner.textContent = d.allPaid
          ? '✅ Share paid — the class is now fully funded and confirmed!'
          : '✅ Your share is paid. Waiting on the remaining parents.';
        banner.classList.remove('hidden');
      }
    } catch {}
  }

  // If returning from Stripe checkout (?paid=1&ref=...), finalize the booking now.
  const justPaid = params.get('paid') === '1' && params.get('ref');
  if (justPaid) {
    try {
      const res = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'finalizeBooking', ref: params.get('ref') }) })).json();
      // If we weren't still logged in, restore login from who booked
      if (!USER && res && res.clientName) {
        try {
          const lr = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'relogin', name: res.clientName }) })).json();
          if (lr && lr.success) {
            USER = { name: lr.name, role: (lr.role||'parent').toLowerCase(), kids: lr.kids||[], parent: lr.parent||'', profile: lr.profile||null, topics: lr.topics||'', friends: lr.friends||'', handle: lr.handle||'', highscore: lr.highscore||0, ttHighscore: lr.ttHighscore||0, xp: lr.xp||0, credits: lr.credits||0, tick1: lr.tick1||'', tick2: lr.tick2||'', tick3: lr.tick3||'', notepad: lr.notepad||'' };
            try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
          }
        } catch {}
      }
    } catch {}
    history.replaceState({}, '', location.pathname);
  } else if (params.get('paid') === '0') {
    history.replaceState({}, '', location.pathname);
  }
  try {
    DATA = await (await fetch(API)).json();
    if (DATA.error) throw new Error(DATA.error);
    renderHealth();
    if (justPaid) {
      const banner = $('health-banner');
      if (banner) { banner.textContent = '✅ Payment received — your booking is confirmed.'; banner.classList.remove('hidden'); }
    }
    renderHeaderAuth();
    renderCards('tutors', DATA.tutors);
    renderCards('venues', DATA.venues);
    renderClasses();
    renderLinks();
    renderShop();
    renderChecklist();
    renderArcade();
    renderGallery(DATA.gallery);
    fillDropdowns();
    initIntervals();
    verifyFormula();
    ['tutor','venue','class','link'].forEach(renderFilterBar);
    calc();
  } catch (e) {
    // Show a load error in the health banner (no full-screen loader anymore)
    const banner = $('health-banner');
    if (banner) {
      banner.innerHTML = `⚠ <b>Couldn't load site data.</b> ${esc(e.message)}`;
      banner.classList.remove('hidden');
    }
  }
}

/* ---------- TEMPLATES ---------- */
const tpl = {
  tag: t => `<span class="tag">${esc(t)}</span>`,
  // Flat label row: renders the items as plain comma-separated text (no bordered boxes),
  // consistent with the standardised flat text look. `extra` (e.g. hashtag spans) still appended.
  tagRow: (items, extra = '') => {
    const text = (items || []).filter(Boolean).map(escTokens).join(', ');
    return (text || extra) ? `<p class="attr-line">${text}${extra ? ' ' + extra : ''}</p>` : '';
  },
  // If an image fails to load (bad/expired Drive link), remove it rather than showing
  // the browser's broken-image icon. Applies everywhere tpl.img is used.
  img: (src, style = '') => src
    ? `<img src="${drive(src)}" alt="" loading="lazy" onerror="this.remove()"${style ? ` style="${style}"` : ''}>`
    : '',

  actionBtn: it => it.link
    ? `<a href="${esc(it.link)}" target="_blank" style="text-decoration:none;width:100%"><button type="button" class="action" style="width:100%">${esc(it.actionText || 'Book Session')}</button></a>`
    : it.mediaUrl
      ? `<button type="button" class="action" data-video="${esc(it.mediaUrl)}" data-title="${esc(it.title)}">${esc(it.actionText || 'View')}</button>`
      : '',

  schedule: hours => {
    if (!hours) return '';
    const rows = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
      .map(d => {
        const s = hours[`${d.toLowerCase()}_start`], e = hours[`${d.toLowerCase()}_end`];
        return s && e ? `<li><b>${d}:</b> ${esc(s)} – ${esc(e)}</li>` : '';
      }).filter(Boolean).join('');
    return rows ? `<ul class="details" style="margin-top:15px;border-top:1px solid var(--border);padding-top:15px">
      <p class="muted" style="margin:0 0 5px;font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:1px">Operating Hours</p>
      ${rows}</ul>` : '';
  },

  card: it => {
    const norm = s => String(s || '').toLowerCase().trim().replace(/\s+/g, ' ');
    // Match the logged-in tutor to their own card by full name, name-without-spaces, or first name.
    const myName = norm(USER?.name);
    const myNameNoSpace = myName.replace(/\s+/g, '');
    const cardName = norm(it.title);
    const cardNameNoSpace = cardName.replace(/\s+/g, '');
    const nameMatches = myName && (myName === cardName || myNameNoSpace === cardNameNoSpace
      || cardName.startsWith(myName) || myName.startsWith(cardName.split(' ')[0]));
    const isOwn = USER && USER.role === 'tutor' && it.type === 'tutor' && nameMatches;
    // Tutor progress (level + high score) — shown quietly at the BOTTOM in gray so it doesn't
    // read as ranking/status between tutors to clients.
    const st = statsOf(it);
    const stats = (it.type === 'tutor' && (st.xp || it.highscore || st.credits))
      ? `<div class="tutor-stats">Lv ${st.level} · ${st.xp} XP · 🪙 ${st.credits} · 🎮 ${it.highscore || 0}</div>`
      : '';
    return `<div class="card${isOwn ? ' own-profile' : ''}" data-card-id="${it.id}">
    ${isOwn ? `<div style="display:flex;gap:8px;margin-bottom:8px">
      <button type="button" class="edit-profile-btn" title="Edit your profile" style="flex:1">✎ Edit</button>
      <button type="button" id="logout-btn" class="ghost" style="flex:1;margin:0;padding:8px">Log Out</button>
    </div>` : ''}
    ${tpl.img(it.image)}
    <h3>${esc(it.title)}</h3>
    <p class="sub">${esc(it.subtitle)}</p>
    <p class="desc">${escTokens(it.description)}</p>
    ${tpl.tagRow(it.tags)}
    ${tpl.schedule(it.hours)}
    ${tpl.actionBtn(it)}
    ${stats}
  </div>`;
  },

  // A single friend's card (shows their level, checklist progress, and arcade high score)
  // Shop item card: image, name, price, description, Buy button (payment wired later)
  shopCard: (it) => `<div class="card" style="text-align:left">
    ${it.image ? tpl.img(it.image) : ''}
    <h3>${esc(it.name)}</h3>
    ${it.price ? `<p class="sub">${esc(it.unit || '')}${esc(it.price)}</p>` : ''}
    ${it.description ? `<p class="desc">${escTokens(it.description)}</p>` : ''}
    <button type="button" class="action buy-item-btn" data-item="${esc(it.id)}" data-name="${esc(it.name)}">Buy</button>
  </div>`,

  friendCard: (s, isChild = false) => {
    const st = statsOf(s);
    return `<div class="card" style="text-align:left">
      ${isChild ? '' : `<button type="button" class="remove-friend-btn" data-handle="${esc(s.handle)}" title="Remove">✕</button>`}
      <h3>${esc(s.name)} <span class="lb-lvl">Lv ${st.level}</span></h3>
      <p class="sub">${esc(s.handle)}</p>
      ${tpl.tagRow([`${st.xp} XP`, `🪙 ${st.credits} credits`, `🎮 ${s.highscore || 0}`])}
    </div>`;
  },

  // Arcade game card (Flappy-style canvas)
  gameCard: () => `<div class="card" style="text-align:center">
    <h3 class="gold" style="margin-bottom:8px">Flabby Pird</h3>
    <canvas id="flappy-canvas" width="170" height="300" style="background:#0a0a0a;border:1px solid var(--border);border-radius:8px;cursor:pointer;display:block;margin:0 auto"></canvas>
    <p style="margin:10px 0 0">Score: <b id="flappy-score" style="color:#fff">0</b>${canTrack() ? ` · Best: <b id="flappy-best" style="color:var(--gold)">${USER.highscore || 0}</b>` : ''}</p>
    <p id="flappy-msg" class="muted" style="font-size:var(--fs-xs);min-height:14px;margin-top:6px">Click the game to start</p>
  </div>`,

  // Kid's checklist: ONE CARD PER GRADE (each its own card in the grid)
  // Compact GCSE calculator that fits in a card (basic + √, x², trig, brackets, π)
  // Student notepad tool — saves to the person's `notepad` cell. Any logged-in user.
  // Notepad is always visible (simplest design). Saves automatically as you type, like the tickboxes.
  notepadCard: () => `<div class="card" style="text-align:left">
    <h3 class="gold" style="margin-bottom:8px">Notepad</h3>
    <textarea id="notepad-text" class="notepad-area" placeholder="Jot notes here..." ${USER ? '' : 'disabled'}>${esc(USER?.notepad || '')}</textarea>
    <p class="muted" id="notepad-status" style="font-size:var(--fs-xs);margin:6px 0 0;min-height:1em">${USER ? '' : 'Log in to save your notes.'}</p>
  </div>`,

  // Times-tables sprint: 60 seconds, random questions up to 12×12. Score = correct answers.
  timesTableCard: () => `<div class="card" style="text-align:left">
    <h3 class="gold" style="margin-bottom:8px">Times Tables Sprint</h3>
    <p class="muted" style="font-size:var(--fs-xs);margin:0 0 10px">60 seconds. As many as you can.</p>
    <div id="tt-idle">
      <button type="button" id="tt-start" class="action" style="width:100%">Start</button>
      ${canTrack() ? `<p class="muted" style="font-size:var(--fs-xs);margin:8px 0 0">Best: <b style="color:var(--gold)">${USER.ttHighscore || 0}</b></p>` : ''}
    </div>
    <div id="tt-play" class="hidden">
      <p style="display:flex;justify-content:space-between;font-size:var(--fs-sm);margin:0 0 8px">
        <span>Time: <b id="tt-time" style="color:#fff">60</b>s</span>
        <span>Score: <b id="tt-score" style="color:var(--gold)">0</b></span>
      </p>
      <p id="tt-question" style="font-size:26px;text-align:center;margin:12px 0;color:#fff"></p>
      <input id="tt-answer" type="number" inputmode="numeric" placeholder="Answer" style="width:100%;padding:10px;text-align:center;font-size:18px">
      <p id="tt-feedback" class="muted" style="font-size:var(--fs-xs);min-height:1em;margin:6px 0 0;text-align:center"></p>
    </div>
    <div id="tt-over" class="hidden" style="text-align:center">
      <p style="font-size:var(--fs-lg);margin:10px 0">You got <b id="tt-final" style="color:var(--gold)">0</b></p>
      <p id="tt-best-msg" class="muted" style="font-size:var(--fs-xs);min-height:1em"></p>
      <button type="button" id="tt-again" class="action" style="width:100%;margin-top:8px">Play again</button>
    </div>
  </div>`,

  // Simple 25-minute countdown timer with an alarm.
  timerCard: () => `<div class="card" style="text-align:left">
    <h3 class="gold" style="margin-bottom:8px">Timer</h3>
    <p id="timer-display" style="font-size:34px;text-align:center;margin:10px 0;color:#fff;letter-spacing:2px">25:00</p>
    <div style="display:flex;gap:6px">
      <button type="button" id="timer-toggle" class="action" style="flex:1;margin:0">Start</button>
      <button type="button" id="timer-reset" class="ghost" style="flex:1;margin:0">Reset</button>
    </div>
    <p id="timer-msg" class="muted" style="font-size:var(--fs-xs);min-height:1em;margin:8px 0 0;text-align:center"></p>
  </div>`,

  calcToolCard: () => `<div class="card mini-calc" style="text-align:left">
    <h3 class="gold" style="margin-bottom:8px">Calculator</h3>
    <input id="mc-display" class="mc-display" value="0" readonly>
    <div class="mc-grid mc-fns">
      <button type="button" class="mc-btn fn" data-mc="sin(">sin</button>
      <button type="button" class="mc-btn fn" data-mc="cos(">cos</button>
      <button type="button" class="mc-btn fn" data-mc="tan(">tan</button>
      <button type="button" class="mc-btn fn" data-mc="sqrt(">√</button>
      <button type="button" class="mc-btn fn" data-mc="^2">x²</button>
      <button type="button" class="mc-btn fn" data-mc="^">xʸ</button>
      <button type="button" class="mc-btn fn" data-mc="(">(</button>
      <button type="button" class="mc-btn fn" data-mc=")">)</button>
      <button type="button" class="mc-btn fn" data-mc="pi">π</button>
      <button type="button" class="mc-btn del" data-mc="del">DEL</button>
    </div>
    <div class="mc-grid mc-nums">
      <button type="button" class="mc-btn" data-mc="7">7</button>
      <button type="button" class="mc-btn" data-mc="8">8</button>
      <button type="button" class="mc-btn" data-mc="9">9</button>
      <button type="button" class="mc-btn op" data-mc="/">÷</button>
      <button type="button" class="mc-btn" data-mc="4">4</button>
      <button type="button" class="mc-btn" data-mc="5">5</button>
      <button type="button" class="mc-btn" data-mc="6">6</button>
      <button type="button" class="mc-btn op" data-mc="*">×</button>
      <button type="button" class="mc-btn" data-mc="1">1</button>
      <button type="button" class="mc-btn" data-mc="2">2</button>
      <button type="button" class="mc-btn" data-mc="3">3</button>
      <button type="button" class="mc-btn op" data-mc="-">−</button>
      <button type="button" class="mc-btn" data-mc="0">0</button>
      <button type="button" class="mc-btn" data-mc=".">.</button>
      <button type="button" class="mc-btn eq" data-mc="=">=</button>
      <button type="button" class="mc-btn op" data-mc="+">+</button>
    </div>
    <p class="muted" style="font-size:var(--fs-xs);margin:8px 0 0">Degrees mode</p>
  </div>`,

  // One checklist band card (subject + grade/stage) with two checkboxes per topic.
  // `item` = { subject, band, bandLabel, topics }. Uses current USER progress.
  checklistBandCard: (item) => {
    const myHandle = canTrack() ? String(USER.handle || '').toLowerCase().trim() : '';
    // A box is checked if my handle appears in that topic's tickN handle-list.
    const iAmIn = (cellStr) => {
      if (!myHandle) return false;
      return String(cellStr || '').split(/[,\n]/).map(s => s.trim().toLowerCase())
        .some(h => h && h === myHandle);
    };
    const rows = item.topics.map(tp => {
      const box = (n, cell) => `<label class="mini-check"><input type="checkbox" class="topic-cb"
        data-row="${tp.rowIndex}" data-tick="${n}" ${iAmIn(cell) ? 'checked' : ''} ${myHandle ? '' : 'disabled'}></label>`;
      return `<div class="check-row">
        ${tp.link
          ? `<a class="check-topic" href="${esc(tp.link)}" target="_blank" rel="noopener">${esc(tp.name)}</a>`
          : `<span class="check-topic">${esc(tp.name)}</span>`}
        ${box(1, tp.tick1)}${box(2, tp.tick2)}${box(3, tp.tick3)}
      </div>`;
    }).join('');
    return `<div class="card grade-card" style="text-align:left">
      <h3 class="gold" style="margin-bottom:4px">${esc(item.subject)} · ${esc(item.bandLabel)}</h3>
      <div class="check-list">${rows}</div>
    </div>`;
  },

  // The same card switched into edit mode (inputs in place of display fields)
  profileEditCard: (p = {}) => `<div class="card own-profile editing">
    <h3 class="gold" style="margin-bottom:12px">Editing your profile</h3>
    <label class="edit-label">Photo URL</label>
    <input id="pf-photo" class="edit-input" value="${esc(p.photo || '')}">
    <label class="edit-label">Tagline</label>
    <textarea id="pf-description" class="edit-input" rows="2">${esc(p.description || '')}</textarea>
    <label class="edit-label">Adjectives</label>
    <div style="display:flex;gap:6px">
      <input id="pf-adj1" class="edit-input" placeholder="patient" value="${esc(p.adjective_1 || '')}">
      <input id="pf-adj2" class="edit-input" placeholder="driven"  value="${esc(p.adjective_2 || '')}">
      <input id="pf-adj3" class="edit-input" placeholder="precise" value="${esc(p.adjective_3 || '')}">
    </div>
    <label class="edit-label">Location</label>
    <input id="pf-location" class="edit-input" value="${esc(p.location || '')}">
    <label class="edit-label">Intro video URL</label>
    <input id="pf-video" class="edit-input" value="${esc(p.video || '')}">
    <div style="display:flex;gap:8px;margin-top:14px">
      <button type="button" id="save-profile-btn" class="action" style="flex:1">Save</button>
      <button type="button" id="cancel-profile-btn" class="ghost" style="padding:11px">Cancel</button>
    </div>
  </div>`,

  jobCard: (j, isDash = false, state = '') => {
    const norm = s => String(s || '').toLowerCase().trim();
    const slots = j.slots || [];
    const isTutor = USER && USER.role === 'tutor' && norm(j.requestedTutor) === norm(USER.name);
    const myName = USER ? norm(USER.name) : '';
    const mySlot = USER ? slots.find(s => norm(s.client) === myName && myName) : null;   // logged out = none
    const emptySlot = slots.find(s => !String(s.client||'').trim());    // is there room?
    const canJoin = USER && USER.role !== 'tutor' && !mySlot && emptySlot && norm(j.status) === 'ongoing';

    const stateBadge = mySlot ? `<span class="badge mine-badge">Yours</span>`
      : norm(j.status) === 'unstarted' ? `<span class="badge pending-badge">Unstarted</span>` : '';

    const attrRow = tpl.tagRow([
      j.level ? `Level: ${j.level}` : '', j.subject || '',
      `${j.location || 'Online'}`, fmtWeeks(j.weeks) ? `${fmtWeeks(j.weeks)} wks` : '',
    ]);

    // Slot list — the tutor sees every client + status + controls; a client sees their own row + chat.
    let slotRows = '';
    if (isTutor) {
      slotRows = slots.filter(s => String(s.client||'').trim()).map(s => {
        const st = s.status || 'Requested';
        const controls = /request|negotiat/i.test(st)
          ? `<div style="display:flex;gap:6px;margin-top:6px">
               <button type="button" class="action slot-act" data-job="${j.id}" data-slot="${s.n}" data-status="Active" style="margin:0;padding:6px 10px">Accept</button>
               <button type="button" class="ghost slot-act" data-job="${j.id}" data-slot="${s.n}" data-status="Declined" style="margin:0;padding:6px 10px">Decline</button>
             </div>` : '';
        const chat = tpl.slotChat(j, s);
        return `<div class="slot-row"><b>${esc(s.client)}</b> — ${esc(st)}${controls}${chat}</div>`;
      }).join('');
    } else if (mySlot) {
      slotRows = `<div class="slot-row">Your status: <b>${esc(mySlot.status || 'Requested')}</b>${tpl.slotChat(j, mySlot)}</div>`;
    }

    // Actions
    let action = '';
    if (canJoin) {
      action = `<button type="button" class="action join-job-btn" data-job="${j.id}">Request to Join</button>`;
    } else if (!USER && !isDash) {
      action = `<button type="button" class="action book-btn-inline" ${j.spotsLeft<=0?'disabled':''}>${j.spotsLeft<=0?'Full':'Book Now'}</button>`;
    }

    // Add-a-student: a booker already in this job can add another student to an empty slot mid-term.
    // Shows the extra-student cost for the REMAINING weeks. (Request → tutor accepts → then pay.)
    let addStudent = '';
    if (USER && mySlot && emptySlot && norm(j.status) === 'ongoing') {
      const add = priceAddStudent(j);
      addStudent = `<div style="margin-top:10px;border-top:1px dashed var(--border);padding-top:8px">
        <p class="muted" style="font-size:var(--fs-xs);margin:0 0 6px">Add another student for the remaining ${add.weeksLeft} week${add.weeksLeft==1?'':'s'}: <b style="color:#fff">£${add.cost.toFixed(2)}</b></p>
        <button type="button" class="ghost add-student-btn" data-job="${j.id}" style="margin:0;padding:6px 12px;width:100%">Add a student (£${add.cost.toFixed(2)})</button>
      </div>`;
    }
    // Counter-offer (client 1 or tutor, only while Pending)
    const isClient1 = mySlot && mySlot.n === 1;
    const counter = ((isClient1 || isTutor) && norm(j.status) === 'unstarted')
      ? `<div class="counter-box" style="margin-top:10px;border-top:1px dashed var(--border);padding-top:8px">
           <input type="text" id="counter-time-${j.id}" placeholder="Propose new time" style="width:100%;padding:6px;font-size:var(--fs-sm);margin-bottom:6px">
           <button type="button" class="ghost counter-btn" data-job="${j.id}" style="margin:0;padding:6px 12px;width:100%">Send counter-offer</button>
         </div>` : '';

    const cls = mySlot ? 'mine-class' : norm(j.status) === 'pending' ? 'pending-class' : '';
    return `<div class="card ${cls}">
      ${stateBadge}
      <h3>${esc(j.title) || 'Session'}</h3>
      <p class="sub">${esc(fmtDay(j.day))} @ ${esc(fmtTime(j.time) || 'TBD')}</p>
      <p class="cap">👥 ${esc(j.capacity)}</p>
      ${attrRow}
      ${slotRows}
      ${action}
      ${addStudent}
      ${counter}
    </div>`;
  },

  // A slot's chat thread + reply box (shown to the tutor per slot, and to the client for their own slot)
  slotChat: (j, s) => `<div class="chat-box" style="margin-top:8px;border-top:1px dashed var(--border);padding-top:8px;text-align:left">
    <p class="muted" style="font-size:var(--fs-xs);white-space:pre-line;margin-bottom:6px">${esc(s.chat) || 'No messages yet.'}</p>
    <div style="display:flex;gap:5px">
      <input type="text" id="slotchat-${j.id}-${s.n}" placeholder="Message..." style="flex:1;padding:6px;font-size:var(--fs-xs)">
      <button type="button" class="action slot-chat-btn" data-job="${j.id}" data-slot="${s.n}" style="margin:0;padding:6px 10px;width:auto">Send</button>
    </div>
  </div>`,

  // One card per category, listing all links in that category as rows
  linkGroupCard: (category, links) => `<div class="card link-group">
    <h3 class="gold">${esc(category)}</h3>
    <ul class="link-list">
      ${links.map(l => `<li>
        <a href="${esc(l.url)}" target="_blank" rel="noopener" class="link-row">
          ${esc(l.title)}<span class="link-arrow">↗</span>
        </a>
        ${l.description ? `<p class="desc link-desc">${esc(l.description)}</p>` : ''}
      </li>`).join('')}
    </ul>
  </div>`,

  // The filename is the caption. Only the file extension is removed — everything else,
  // including brackets, dates and tokens, is ordinary text.
  cleanCaption: text => String(text || '').replace(/\.[^/.]+$/, '').trim(),

  socialPost: post => {
    const caption = tpl.cleanCaption(post.rawName);
    const tagRow = tpl.tagRow([post.label ? `${post.label}` : '']);
    return `<div class="card social-post">
      <div class="social-header">
        <div class="social-avatar">@</div>
        <span class="social-username">@family.</span>
        <button type="button" data-share-url="https://drive.google.com/file/d/${post.id}/view" class="social-share-btn">⎘</button>
      </div>
      <img class="social-img" src="https://drive.google.com/thumbnail?id=${post.id}&sz=w800" alt="Gallery Post" loading="lazy" onerror="this.closest('.social-post')?.remove()">
      <div class="social-body">
        ${caption ? `<p class="desc" style="margin:0 0 8px">${escTokens(caption)}</p>` : ''}
        ${tagRow}
      </div>
    </div>`;
  },

  // Access card: login form when logged out, personal dashboard when logged in.
  // Lives in the Classes & Booking grid so access sits with booking.
  // Login form card (shown in People when logged out)
  loginCard: () => `<div class="card" id="login-card">
      <h3 class="gold mb-md">Login</h3>
      <div class="checkout stack">
        <input type="text" id="auth-email" placeholder="Full Name">
        <input type="password" id="auth-pin" placeholder="PIN">
        <button type="button" id="auth-btn" class="action">Enter</button>
      </div>
      <p id="auth-msg" class="err mt-sm"></p>
    </div>`,

  // A logged-in parent/kid's own account card in People (their details + logout).
  // Kids also get their level/high score here since they take part in topics/arcade.
  accountCard: () => {
    const roleLabel = { parent: 'Parent', kid: 'Student' }[USER.role] || 'Member';
    const st = statsOf(USER);
    const kidStats = USER.role === 'kid'
      ? tpl.tagRow([`Lv ${st.level}`, `${st.xp} XP`, `🪙 ${st.credits} credits`, `🎮 ${USER.highscore || 0}`]) : '';
    return `<div class="card own-profile" id="account-card" style="text-align:left">
      <h3 class="gold" style="margin-bottom:4px">${esc(USER.name)}</h3>
      <p class="sub">${roleLabel}${USER.handle ? ' · ' + esc(USER.handle) : ''}</p>
      ${kidStats}
      <p class="muted" style="font-size:var(--fs-xs);margin:10px 0">${
        USER.role === 'kid'
          ? 'Your checklist, friends and classes are in their sections below.'
          : 'Your children and classes are shown below.'
      }</p>
      <button type="button" id="logout-btn" class="ghost" style="width:100%">Log Out</button>
    </div>`;
  },

  builderCard: () => `<div class="card" id="new-job">
    <h3 class="gold" style="margin-bottom:15px">Build a Session</h3>
    <input type="hidden" id="c-service" value="Tuition">

    <!-- Each lesson is fully independent: its own subject, tutor, term, and split. -->
    <p class="sentence" style="line-height:2.2;text-align:left;margin:0 0 4px">I want tuition:</p>

    <div id="lessons"></div>
    <button type="button" id="add-lesson-btn" class="ghost" style="width:100%;margin:10px 0">＋ Add another lesson</button>

    <div class="total"><h2 style="font-size:var(--fs-lg);margin:15px 0">Order total: £<span id="total">0.00</span></h2></div>

    <div class="calc-breakdown">
      <p class="muted breakdown-heading">Breakdown</p>
      <div id="calc-receipt" class="receipt"></div>
    </div>

    <p id="home-note" class="muted hidden" style="font-size:var(--fs-sm);margin:10px 0 0">At-home lessons require a group of 4 students.</p>

    <div id="checkout-area" class="checkout" style="display:flex;flex-direction:column;gap:8px"></div>
  </div>`,

  // One lesson block (repeatable). `i` = block index, used to keep field ids unique.
  lessonBlock: (i) => `<div class="lesson-block" data-lesson="${i}" style="border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px;text-align:left">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
      <span class="muted" style="font-size:var(--fs-xs)">Lesson ${i + 1}</span>
      ${i > 0 ? `<button type="button" class="remove-lesson-btn" data-lesson="${i}" style="background:none;border:none;color:var(--muted);cursor:pointer;font-size:16px">×</button>` : ''}
    </div>
    <p class="sentence" style="line-height:2.2;text-align:left;margin:0">
      <strong>tuition</strong> of
      <span class="custom-select-wrapper">
        <span class="inline-select pick l-subject-display" data-lesson="${i}" style="cursor:pointer">Select Subjects ⌄</span>
        <span class="custom-dropdown hidden l-subject-dropdown" data-lesson="${i}"></span>
      </span>
      with <select class="pick l-level" data-lesson="${i}"></select>
      delivered @ <select class="pick l-location" data-lesson="${i}"></select>
      for <input type="number" class="num l-qty" data-lesson="${i}" value="1" min="1" max="4" style="width:40px"> student
      with <select class="pick l-tutor" data-lesson="${i}"></select>
      at <select class="pick l-time" data-lesson="${i}"></select>
      on <select class="pick l-day" data-lesson="${i}"></select>
      for <select class="pick l-interval" data-lesson="${i}"></select>
      <span class="muted l-weeks-label" data-lesson="${i}" style="font-size:0.85em"></span>,
      split with <select class="pick l-split" data-lesson="${i}"></select> other people.
    </p>
  </div>`,
};

/* ---------- RENDER ---------- */
// Persistent header auth: shows who's logged in (logout lives on their profile card).
function renderHeaderAuth() {
  const el = $('header-auth');
  if (!el) return;
  el.innerHTML = USER
    ? `<span class="muted" style="font-size:var(--fs-sm)">${esc(USER.name)}</span>`
    : '';
}

function renderCards(id, items = []) {
  let cardsHtml = items.length ? items.map(tpl.card).join('') : '<p class="muted">Nothing yet.</p>';

  // People section: the login card (logged out) or the person's own account card (logged in).
  if (id === 'tutors') {
    if (!USER) {
      // Not logged in → login card leads the People grid
      cardsHtml = tpl.loginCard() + cardsHtml;
    } else if (USER.role !== 'tutor') {
      // Parent/kid have no profile card, so give them their own editable account card here
      cardsHtml = tpl.accountCard() + cardsHtml;
    }
    // Tutor: their existing card in the list already shows the ✎ Edit button (no extra card)
  }

  // In the People section, a logged-in kid also sees a friend search + their friend cards
  if (id === 'tutors' && USER && USER.role === 'kid') {
    const norm = s => String(s || '').toLowerCase().trim();
    const handles = friendHandles().map(norm);
    const friends = (DATA.students || []).filter(s => handles.includes(norm(s.handle)));
    const friendCards = friends.map(tpl.friendCard).join('');
    cardsHtml += `<div class="card friend-search-card" style="text-align:left">
        <h3 class="gold" style="margin-bottom:8px">Add a Friend</h3>
        <input id="friend-search" class="edit-input" placeholder="Exact name e.g. LuccaD" style="margin-bottom:8px">
        <button type="button" id="add-friend-btn" class="action" style="width:100%">Add Friend</button>
        <p id="friend-msg" class="muted" style="font-size:var(--fs-xs);min-height:14px;margin-top:8px"></p>
      </div>` + friendCards;
  }
  // A logged-in parent sees their children's profile cards
  if (id === 'tutors' && USER && USER.role === 'parent') {
    const norm = s => String(s || '').toLowerCase().trim();
    const kidNames = (USER.kids || []).map(norm);
    const myKids = (DATA.students || []).filter(s => kidNames.includes(norm(s.name)) || kidNames.includes(norm(s.handle)));
    cardsHtml += myKids.map(s => tpl.friendCard(s, true)).join('');
  }

  html(id, cardsHtml);
}

function renderClasses(items = DATA.clientClasses || []) {
  const norm = s => String(s || '').toLowerCase().trim();
  const iAmIn = j => USER && (j.slots || []).some(s => norm(s.client) === norm(USER.name));
  // Visible if it has open spots, OR it's the logged-in user's own class (so they see their booking even when full)
  const visible = items.filter(j => (j.spotsLeft > 0) || iAmIn(j));
  // The user's own classes float to the top
  const rank = j => classState(j) ? 1 : 0;
  const sorted = [...visible].sort((a, b) => rank(b) - rank(a));
  const cards = sorted.map(j => tpl.jobCard(j, false, classState(j))).join('');
  html('classes', tpl.builderCard() + cards);
  fillDropdowns();
  initIntervals();
  renderCheckout();
  enforceHomeRule();
}

// Relationship of a job to the logged-in user:
//   'confirmed' → their class (blue)   'pending' → potential/awaiting tutor accept (grey)   '' → not theirs
function classState(j) {
  if (!USER) return '';
  const norm = s => String(s || '').toLowerCase().trim();
  const status = norm(j.status);
  if (USER.role === 'tutor') {
    if (norm(j.requestedTutor) !== norm(USER.name)) return '';
    return status === 'ongoing' ? 'confirmed' : 'pending';  // not yet started = grey
  }
  // Parent/kid: am I in any slot of this class?
  const mySlot = (j.slots || []).find(s => norm(s.client) === norm(USER.name));
  if (!mySlot) return '';
  return status === 'unstarted' ? 'pending' : 'confirmed';
}

// Back-compat boolean (used by onLogin filter)
function isMyClass(j) { return classState(j) !== ''; }

// Column health-check banner: warns if the sheet is missing columns the code needs.
function renderHealth() {
  const el = $('health-banner');
  if (!el) return;
  const h = DATA.health;
  if (!h || h.ok) { el.classList.add('hidden'); return; }
  const lines = h.missing.map(m =>
    `<b>${esc(m.group)}</b>: ${m.columns.map(c => `<code>${esc(c)}</code>`).join(', ')}`
  ).join('<br>');
  el.innerHTML = `⚠ <b>Sheet health warning</b> — the code expects columns that aren't in the sheet ` +
    `(likely a rename or deletion). Affected features may not work until these are restored:<br>${lines}`;
  el.classList.remove('hidden');
}

// After a successful login: re-render sections; the login card in People becomes the user's own card
function onLogin() {
  renderHeaderAuth();                   // persistent top-right Log Out
  renderCards('tutors', DATA.tutors);  // People: login card → own account card / tutor edit
  renderChecklist();                   // Checklist section
  renderArcade();                      // Arcade game
  renderClasses();                     // Classes & Booking (user's classes highlight blue)
  renderCheckout();
  $('tutors').closest('section').scrollIntoView({ behavior: 'smooth' });
}

// Tools section: a calculator card + the maths checklist (grade cards).
// Grade cards can be filtered by subject/tier/grade via the database-driven filter bar.
// Build the flat list of checklist band-items (one per subject+band) for the shared filter system.
// Each item also carries the distinct values of the per-topic fields, so the shared filter
// can match a band if ANY of its topics has the chosen company / tier / keystage / stage.
function checklistItems() {
  const checklists = DATA.dropdowns?.checklists || {};
  const items = [];
  const cap = s => String(s||'').charAt(0).toUpperCase() + String(s||'').slice(1);
  const distinctOf = (topics, key) => [...new Set(topics.map(t => String(t[key]||'').trim()).filter(Boolean).map(s=>s.toLowerCase()))];
  Object.keys(checklists).forEach(subject => {
    const bands = checklists[subject];
    Object.keys(bands).sort((a,b)=>+a-+b).forEach(band => {
      const entry = bands[band];
      const topics = entry.topics || [];
      // The label uses whichever banding column the sheet actually used for these rows.
      const bandField = entry.bandField || '';
      items.push({
        subject, band: String(band),
        bandLabel: `${cap(bandField)} ${band}`.trim(),
        topics,
        // field value-sets for filtering (a band matches if any topic has the value)
        companies: distinctOf(topics, 'company'),
        tiers:     distinctOf(topics, 'tier'),
        keystages: distinctOf(topics, 'keystage'),
        stages:    distinctOf(topics, 'stage'),
        grades:    distinctOf(topics, 'grade')
      });
    });
  });
  return items;
}
// All distinct values of a per-topic field across every topic (for filter dropdown options)
function allTopicFieldValues(key) {
  const checklists = DATA.dropdowns?.checklists || {};
  const vals = new Set();
  Object.values(checklists).forEach(bands => Object.values(bands).forEach(entry =>
    (entry.topics || []).forEach(t => { const x = String(t[key]||'').trim(); if (x) vals.add(x); })));
  return [...vals];
}

// Tools section: calculator card is fixed; the checklist band cards go through the shared filter.
function renderChecklist() {
  const el = $('checklist-content');
  if (!el) return;
  renderFilterBar('tool');   // shared filter bar (search + subject/level dropdowns)
  applyFilter('tool');       // shared filter renders the band cards into #checklist-content
  initMiniCalc();
}

// Compact calculator logic (degrees; uses math.js if present, else Function eval fallback)
function initMiniCalc() {
  const disp = $('mc-display');
  if (!disp) return;
  let expr = '';
  const render = () => disp.value = expr || '0';
  window._mcClick = (v) => {
    if (v === '=') {
      try {
        let s = expr.replace(/π/g,'pi');
        // degree trig
        s = s.replace(/\b(sin|cos|tan)\(/g, '$1(DEG*');
        let result;
        if (window.math) {
          result = window.math.evaluate(s, { pi: Math.PI, DEG: Math.PI/180 });
        } else {
          s = s.replace(/pi/g, Math.PI).replace(/DEG/g, Math.PI/180)
               .replace(/sqrt/g,'Math.sqrt').replace(/sin/g,'Math.sin').replace(/cos/g,'Math.cos').replace(/tan/g,'Math.tan').replace(/\^/g,'**');
          result = Function('"use strict";return (' + s + ')')();
        }
        expr = String(Math.round(result * 1e10) / 1e10);
      } catch { expr = 'Error'; }
    } else if (v === 'del') {
      expr = (expr === 'Error') ? '' : expr.slice(0, -1);
    } else {
      if (expr === 'Error' || expr === '0') expr = '';
      expr += v;
    }
    render();
  };
  render();
}

// Progression. XP = number of topics ticked (stored in the sheet's `xp` column).
// Level is DERIVED from XP: every 10 XP = 1 level (so each tick is +0.1 of a level).
// Credits are a spendable currency (stored in `credits`) — 1 earned per tick, spent in the Shop.
const XP_PER_LEVEL = 10;
function levelFromXp(xp) {
  return +( (Number(xp) || 0) / XP_PER_LEVEL ).toFixed(1);   // e.g. 23 xp → level 2.3
}
// Stats for a person object coming from the backend (or the logged-in USER)
function statsOf(p) {
  const xp = Number(p?.xp) || 0;
  return { xp, level: levelFromXp(xp), credits: Number(p?.credits) || 0 };
}

// --- Times Tables Sprint: 60s, random questions up to 12×12 ---
let ttState = null;
function startTimesTables() {
  const q = () => ({ a: 1 + Math.floor(Math.random()*12), b: 1 + Math.floor(Math.random()*12) });
  ttState = { score: 0, left: 60, cur: q(), timer: null };
  $('tt-idle')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
  $('tt-play')?.classList.remove('hidden');
  $('tt-score').textContent = '0';
  $('tt-time').textContent = '60';
  $('tt-question').textContent = `${ttState.cur.a} × ${ttState.cur.b}`;
  const input = $('tt-answer');
  input.value = ''; input.focus();

  ttState.timer = setInterval(() => {
    ttState.left--;
    $('tt-time').textContent = ttState.left;
    if (ttState.left <= 0) endTimesTables();
  }, 1000);

  input.oninput = () => {
    const val = parseInt(input.value);
    if (isNaN(val)) return;
    if (val === ttState.cur.a * ttState.cur.b) {
      ttState.score++;
      $('tt-score').textContent = ttState.score;
      $('tt-feedback').textContent = '✓';
      ttState.cur = q();
      $('tt-question').textContent = `${ttState.cur.a} × ${ttState.cur.b}`;
      input.value = '';
    }
  };
}
function endTimesTables() {
  if (!ttState) return;
  clearInterval(ttState.timer);
  const score = ttState.score;
  $('tt-play')?.classList.add('hidden');
  $('tt-over')?.classList.remove('hidden');
  $('tt-final').textContent = score;
  // Save a new personal best
  if (canTrack() && score > (USER.ttHighscore || 0)) {
    USER.ttHighscore = score;
    try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
    $('tt-best-msg').textContent = '🎉 New personal best!';
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'saveTtHighscore', name: USER.name, score }) }).catch(()=>{});
  } else if (canTrack()) {
    $('tt-best-msg').textContent = `Best: ${USER.ttHighscore || 0}`;
  }
  ttState = null;
}

// --- Countdown timer with alarm ---
let timerState = { total: 25*60, left: 25*60, running: false, tick: null };
function initTimer() {
  timerState.running = false;
  clearInterval(timerState.tick);
  paintTimer();
}
function paintTimer() {
  const el = $('timer-display');
  if (!el) return;
  const m = Math.floor(timerState.left / 60), s = timerState.left % 60;
  el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  const btn = $('timer-toggle');
  if (btn) btn.textContent = timerState.running ? 'Pause' : 'Start';
}
function toggleTimer() {
  if (timerState.running) {
    clearInterval(timerState.tick);
    timerState.running = false;
  } else {
    if (timerState.left <= 0) timerState.left = timerState.total;
    timerState.running = true;
    timerState.tick = setInterval(() => {
      timerState.left--;
      if (timerState.left <= 0) {
        clearInterval(timerState.tick);
        timerState.running = false;
        timerState.left = 0;
        if ($('timer-msg')) $('timer-msg').textContent = '⏰ Time\'s up!';
        beep();
      }
      paintTimer();
    }, 1000);
    if ($('timer-msg')) $('timer-msg').textContent = '';
  }
  paintTimer();
}
// Short alarm tone via the Web Audio API (no sound file needed)
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach(delay => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.18);
      osc.start(ctx.currentTime + delay); osc.stop(ctx.currentTime + delay + 0.2);
    });
  } catch {}
}

// Arcade section: the game card (high scores show on student/friend cards)
function renderArcade() {
  const el = $('arcade-content');
  if (!el) return;
  el.innerHTML = tpl.gameCard() + tpl.timesTableCard();
  initFlappy();  // wire up the canvas game
}

// --- Flabby Pird: simple one-button canvas game ---
let flappyState = null;
function initFlappy() {
  const canvas = $('flappy-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const GOLD = '#d4af37', BLUE = '#4f9eff', GREEN = '#3cb043';

  // reset any previous loop
  if (flappyState?.raf) cancelAnimationFrame(flappyState.raf);
  const S = flappyState = {
    bird: { x: 40, y: H/2, vy: 0, r: 7 },
    pipes: [], score: 0, running: false, dead: false, raf: null, frame: 0
  };
  const GRAV = 0.38, FLAP = -6, GAP = 95, PIPE_W = 28, SPEED = 1.7;

  const reset = () => {
    S.bird.y = H/2; S.bird.vy = 0; S.pipes = []; S.score = 0; S.frame = 0; S.dead = false;
    $('flappy-score').textContent = '0';
  };
  const spawnPipe = () => {
    const top = 30 + Math.random() * (H - GAP - 70);
    S.pipes.push({ x: W, top, scored: false });
  };
  const flap = () => {
    if (S.dead) { reset(); S.running = true; $('flappy-msg').textContent = ''; loop(); return; }
    if (!S.running) { S.running = true; $('flappy-msg').textContent = ''; loop(); }
    S.bird.vy = FLAP;
  };
  const gameOver = () => {
    S.dead = true; S.running = false;
    $('flappy-msg').textContent = `Game over — score ${S.score}. Click to retry.`;
    // Save score if a logged-in kid or tutor
    if (canTrack()) {
      const prev = USER.highscore || 0;
      if (S.score > prev) {
        USER.highscore = S.score;
        if ($('flappy-best')) $('flappy-best').textContent = S.score;
        fetch(API, { method:'POST', body: JSON.stringify({ action:'saveScore', name: USER.name, score: S.score }) })
          .then(() => {
            const norm = s => String(s||'').toLowerCase().trim();
            const meS = (DATA.students||[]).find(s => norm(s.handle) === norm(USER.handle)); if (meS) meS.highscore = S.score;
            const meT = (DATA.tutors||[]).find(x => norm(x.title) === norm(USER.name)); if (meT) meT.highscore = S.score;
            // No re-render mid-game — the "Best" display already updated; cards refresh naturally later
          });
        $('flappy-msg').textContent = `New best: ${S.score}! Click to retry.`;
      }
    }
  };

  const loop = () => {
    if (!S.running) return;
    S.frame++;
    // physics
    S.bird.vy += GRAV; S.bird.y += S.bird.vy;
    if (S.frame % 90 === 0) spawnPipe();
    S.pipes.forEach(p => p.x -= SPEED);
    S.pipes = S.pipes.filter(p => p.x + PIPE_W > 0);
    // collisions + scoring
    for (const p of S.pipes) {
      if (!p.scored && p.x + PIPE_W < S.bird.x) { p.scored = true; S.score++; $('flappy-score').textContent = S.score; }
      const inX = S.bird.x + S.bird.r > p.x && S.bird.x - S.bird.r < p.x + PIPE_W;
      const hitY = S.bird.y - S.bird.r < p.top || S.bird.y + S.bird.r > p.top + GAP;
      if (inX && hitY) return gameOver();
    }
    if (S.bird.y + S.bird.r > H || S.bird.y - S.bird.r < 0) return gameOver();
    // draw
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = GREEN;
    S.pipes.forEach(p => { ctx.fillRect(p.x, 0, PIPE_W, p.top); ctx.fillRect(p.x, p.top+GAP, PIPE_W, H-p.top-GAP); });
    ctx.fillStyle = GOLD;
    ctx.beginPath(); ctx.arc(S.bird.x, S.bird.y, S.bird.r, 0, Math.PI*2); ctx.fill();
    S.raf = requestAnimationFrame(loop);
  };

  // idle draw (bird sitting)
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = GOLD;
  ctx.beginPath(); ctx.arc(S.bird.x, S.bird.y, S.bird.r, 0, Math.PI*2); ctx.fill();

  canvas.onclick = flap;
  // space/arrow to flap (only when arcade canvas exists)
  S.keyHandler = e => { if ((e.code === 'Space' || e.code === 'ArrowUp') && $('flappy-canvas')) { e.preventDefault(); flap(); } };
  document.removeEventListener('keydown', window._flappyKey || (()=>{}));
  window._flappyKey = S.keyHandler;
  document.addEventListener('keydown', window._flappyKey);
}

// Current friend handles as an array (from USER.friends comma string)
function friendHandles() {
  return String(USER?.friends || '').split(',').map(s => s.trim()).filter(Boolean);
}
// Checkout depends on login state: prompt to log in, or show the booking button
function renderCheckout() {
  if (!$('checkout-area')) return;
  $('checkout-area').innerHTML = USER
    ? `<p class="muted" style="font-size:var(--fs-sm);margin:0">Booking as <b style="color:#fff">${esc(USER.name)}</b></p>
       <button type="button" id="book-btn" style="margin-top:5px">Lock in &amp; Book</button>`
    : `<p class="muted" style="font-size:var(--fs-sm);margin:0">Log in to book a session.</p>
       <button type="button" id="go-login-btn" class="action">Log in to Book</button>`;
}

function renderLinks(items = DATA.links || []) {
  if (!items.length) { html('links', '<p class="muted">No links found.</p>'); return; }
  // Group by category, preserving first-seen order
  const groups = {};
  items.forEach(l => { const c = l.category || 'General'; (groups[c] = groups[c] || []).push(l); });
  html('links', Object.entries(groups).map(([cat, links]) => tpl.linkGroupCard(cat, links)).join(''));
}

function renderShop(items = DATA.shop || []) {
  if (!items.length) { html('shop', '<p class="muted">No items in the shop yet.</p>'); return; }
  html('shop', items.map(tpl.shopCard).join(''));
}

let GALLERY_POSTS = [];  // parsed posts, kept for filtering

function renderGallery(galleryData = []) {
  if (!galleryData?.length) { html('gallery', '<p class="loader-text">No showcases active.</p>'); return; }

  // "3 days ago" style label from the file's own date (no filename parsing).
  const ageLabel = ts => {
    if (!ts) return '';
    const diff = Math.floor((Date.now() - new Date(ts).setHours(0,0,0,0)) / 86400000);
    return diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday'
      : diff < 7 ? `${diff} days ago` : diff < 30 ? `${Math.floor(diff/7)} weeks ago`
      : diff < 365 ? `${Math.floor(diff/30)} months ago` : `${Math.floor(diff/365)} years ago`;
  };

  GALLERY_POSTS = galleryData
    .map(p => {
      const obj = (typeof p === 'object') ? p : { id: p };
      const ts = obj.date ? new Date(obj.date).getTime() : 0;
      // The filename is just the caption now — no date, no location extracted from it.
      return { ...obj, ts, label: ageLabel(ts), year: ts ? String(new Date(ts).getFullYear()) : '', rawName: obj.name || '' };
    })
    .sort((a, b) => b.ts - a.ts);  // newest first

  renderFilterBar('post');
  applyFilter('post');
}

/* ---------- DROPDOWNS ---------- */
let LESSON_COUNT = 0;   // how many lesson blocks currently exist

function fillDropdowns() {
  const d = DATA.dropdowns || {};
  // Ensure at least one lesson block exists, then populate every block's dropdowns
  const wrap = $('lessons');
  if (wrap && !wrap.children.length) { wrap.innerHTML = tpl.lessonBlock(0); LESSON_COUNT = 1; }
  document.querySelectorAll('.lesson-block').forEach(b => fillLessonBlock(parseInt(b.dataset.lesson)));
}

// Populate one lesson block's dropdowns (level, location, day, time, subjects)
function fillLessonBlock(i) {
  const d = DATA.dropdowns || {};
  const set = (cls, list, labelFn) => {
    const el = document.querySelector(`.${cls}[data-lesson="${i}"]`);
    if (!el) return;
    const fmt = labelFn || (v => v);
    el.innerHTML = (list||[]).map(v => `<option value="${esc(v)}">${esc(fmt(v))}</option>`).join('');
  };
  set('l-level', d.levels);
  set('l-location', d.locations);
  set('l-day', d.days, fmtDay);
  set('l-time', d.times, fmtTime);
  // Tutor: "No preference" first, then each tutor
  const tutorEl = document.querySelector(`.l-tutor[data-lesson="${i}"]`);
  if (tutorEl) {
    const tutors = (DATA.tutors || []).map(t => t.title).filter(Boolean);
    tutorEl.innerHTML = `<option value="">No preference</option>` +
      tutors.map(nm => `<option value="${esc(nm)}">${esc(nm)}</option>`).join('');
  }
  // Term/interval: each lesson has its own
  const ivEl = document.querySelector(`.l-interval[data-lesson="${i}"]`);
  if (ivEl) {
    const intervals = getAcademicIntervals();
    ivEl.innerHTML = intervals.length
      ? intervals.map(iv => `<option value="${esc(iv.name)}" data-weeks="${iv.weeks}" data-term="${esc(iv.name)}" data-end="${esc(iv.endDate)}">${esc(iv.label)}</option>`).join('')
      : '<option value="">No terms</option>';
    syncBlockWeeks(i);
  }
  // Split: each lesson can be split with up to 3 others (0 = no split)
  const splitEl = document.querySelector(`.l-split[data-lesson="${i}"]`);
  if (splitEl) splitEl.innerHTML = [0,1,2,3].map(x => `<option value="${x}">${x}</option>`).join('');
  // Subject checkbox dropdown for this block
  const drop = document.querySelector(`.l-subject-dropdown[data-lesson="${i}"]`);
  if (drop) drop.innerHTML = (d.subjects||[]).map(s =>
    `<label><input type="checkbox" class="subj-cb" data-lesson="${i}" value="${esc(s)}"> ${esc(s)}</label>`).join('');
}

function fill(id, list = [], first, labelFn) {
  if (!$(id)) return;
  const fmt = labelFn || (v => v);
  $(id).innerHTML = (first ? `<option value="">${esc(first)}</option>` : '')
    + (list||[]).map(v => `<option value="${esc(v)}">${esc(fmt(v))}</option>`).join('');
}

/* ---------- ACADEMIC INTERVALS ---------- */
// Map the sheet's relative names to friendly dropdown labels
const INTERVAL_LABELS = {
  'current academic interval': 'This Term',
  'current academic interval -1': 'This Term (final weeks)',
  'next academic interval': 'Next Term',
  'next next academic interval': 'Term After',
};

function getAcademicIntervals() {
  // Read straight from the sheet (DATA.intervals). Weeks come pre-rounded from weeks_left_round_down.
  return (DATA.intervals || [])
    .filter(iv => iv.term || iv.rel)
    .map(iv => {
      const rel = String(iv.rel || '').toLowerCase().trim();
      const weeks = parseInt(parseFloat(iv.weeks)) || 0;   // sheet already rounded; just strip ".00"
      return {
        name:  iv.term || iv.rel,                              // value = actual term name
        label: INTERVAL_LABELS[rel] || iv.rel || iv.term,      // friendly dropdown label
        weeks,                                                 // whole weeks for billing + display
        endDate: iv.endDate || '', lastMon: iv.lastMon || '', lastSun: iv.lastSun || ''
      };
    });
}

function initIntervals() { /* intervals are populated per lesson block in fillLessonBlock now */ }

function syncWeeks() { calc(); }   // term is now per-lesson; order-level sync just recalcs

// Update a lesson block's weeks label from its own chosen term
function syncBlockWeeks(i) {
  const sel = document.querySelector(`.l-interval[data-lesson="${i}"]`);
  const label = document.querySelector(`.l-weeks-label[data-lesson="${i}"]`);
  if (!sel || !sel.options.length) return;
  const opt = sel.options[sel.selectedIndex];
  const weeks = opt?.dataset.weeks || '0';
  if (label) label.textContent = `(${weeks} weeks)`;
}

// Every date matching `dayName` from today until endDate (inclusive). Returns Date[].
function computeSessionDates(dayName, endDateStr) {
  const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const target = DAYS.indexOf(String(dayName||'').toLowerCase().replace(/s$/,''));
  if (target < 0 || !endDateStr) return [];
  // parse end date (DD/MM/YYYY or long string)
  let end;
  const m = String(endDateStr).match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
  if (m) { let y = m[3].length===2 ? '20'+m[3] : m[3]; end = new Date(+y, +m[2]-1, +m[1]); }
  else { end = new Date(endDateStr); }
  if (isNaN(end)) return [];
  const out = [];
  const d = new Date(); d.setHours(0,0,0,0);
  // advance to the next occurrence of the target weekday
  while (d.getDay() !== target) d.setDate(d.getDate()+1);
  while (d <= end && out.length < 60) { out.push(new Date(d)); d.setDate(d.getDate()+7); }
  return out;
}

/* ---------- CALCULATOR ----------
   PRICING FORMULA (per hour). Constants come from the sheet (category=variable);
   day/time/subject multipliers come from their dropdown rows.

   Core rate  K = γ·η·α·λ·μ
   where:  λ = min-wage multiplier   μ = minimum wage      β = extra-child reducer
           ε = tutor kickdown        η = subject (×)       α = harder day (×)
           γ = easier time (×)       n = number of kids    V = venue rate/h

   Client rate/hr = K + Kβ(n−1) + V
   Tutor cost/hr  = Kε − Kεβ(n−1) + V
   Profit/hr      = K(1 + β(n−1)) − Kε(1 − β(n−1))     (V cancels: client pays room hire)
   Total          = client rate/hr × 2h × weeks
------------------------------------------------------------------- */

// Convert a multiplier (1.1, 0.9, 1) into a signed percentage label, or '' if neutral
function pct(mult) {
  const p = Math.round((mult - 1) * 100);
  return p === 0 ? '' : (p > 0 ? `+${p}%` : `${p}%`);
}

// Self-check: verifies the profit formula still produces a known result. Logs if it drifts.
function verifyFormula() {
  const profit = (wageMult, minWage, extraChild, tutorShare, subjF, dayF, timeF, n) => {
    const baseRate = timeF * subjF * dayF * wageMult * minWage;
    const studentAdj = 1 + extraChild * (n - 1);
    return baseRate * studentAdj * (1 - tutorShare);   // per hour, symmetric
  };
  // γ=0.9 η=1.1 α=1.1 λ=1.5 μ=12 → baseRate=19.60; n=2 β=0.25 → studentAdj=1.25; ε=0.9 → ×0.1
  const got = profit(1.5, 12, 0.25, 0.9, 1.1, 1.1, 0.9, 2), want = 2.45;
  if (Math.abs(got - want) > 0.01) console.error(`⚠ Profit formula drift: expected ${want}/h, got ${got.toFixed(2)}/h`);
}

// Helper: read a field scoped to one lesson block by class + data-lesson index.
function lval(i, cls) {
  const el = document.querySelector(`.${cls}[data-lesson="${i}"]`);
  return el ? el.value : '';
}
function lsubjects(i) {
  return Array.from(document.querySelectorAll(`.subj-cb[data-lesson="${i}"]:checked`)).map(cb => cb.value).filter(Boolean);
}

// Price a single lesson block (index i). Weeks come from the order-level interval (shared).
function priceLesson(i) {
  const m = DATA.multipliers || {};
  const k = DATA.constants || {};
  const v = k.vars || {};
  const cv = (...keys) => { for (const key of keys) { const x = parseFloat(v[key]); if (!isNaN(x)) return x; } return 0; };
  const lookup = (group, value) => parseFloat((m[group] || {})[value]) || 1;
  const norm = s => String(s || '').toLowerCase().trim();

  const subjects = lsubjects(i);
  const n = Math.max(1, parseInt(lval(i, 'l-qty')) || 1);
  // Weeks come from THIS lesson's own term dropdown
  const ivSel = document.querySelector(`.l-interval[data-lesson="${i}"]`);
  const ivOpt = ivSel?.options[ivSel.selectedIndex];
  const weeks = parseFloat(ivOpt?.dataset.weeks) || 1;
  const interval = ivSel?.value || '';
  const endDate = ivOpt?.dataset.end || '';
  const loc = lval(i, 'l-location');
  const day = lval(i, 'l-day');
  const time = lval(i, 'l-time');
  const level = lval(i, 'l-level');
  const tutor = lval(i, 'l-tutor');
  const splitOthers = parseInt(lval(i, 'l-split')) || 0;   // per-lesson split

  const venue = (DATA.venues || []).find(x => norm(x.title) === norm(loc));
  const V = venue ? (parseFloat(venue.bestRate) || 0) : 0;

  // ---- Pricing factors (all from the sheet; set any to 1 to switch it off) ----
  const timeFactor    = lookup('times', time);   // γ  easier/harder time of day
  const subjectFactor = subjects.reduce((max, s) => Math.max(max, parseFloat((m.subjects || {})[s]) || 0), 0) || 1;  // η
  const dayFactor     = lookup('days',  day);     // α  harder day
  const wageMultiplier = cv('λ', 'lambda', 'constant 3', 'constant3');   // λ
  const minWage        = cv('μ', 'mu', 'minimum wage', 'min wage', 'minimumwage');  // μ
  const extraChildRate = cv('β', 'beta', 'constant 1', 'constant1');     // β
  const tutorShare     = cv('ε', 'epsilon', 'constant 2', 'constant2');  // ε
  const hoursPerWeek   = 2;

  // ---- The formula, in readable stages ----
  const baseRate   = timeFactor * subjectFactor * dayFactor * wageMultiplier * minWage;  // one student, one hour
  const studentAdj = 1 + extraChildRate * (n - 1);                                        // extra students
  const promoAdj   = activePromoFactor({ subjects, n, weeks, day, time, level, lessonCount: document.querySelectorAll('.lesson-block').length });

  const chargePerHour = baseRate * studentAdj * promoAdj;
  const total  = chargePerHour * hoursPerWeek * weeks + V;              // PRICE customer pays
  const cost   = baseRate * studentAdj * tutorShare * hoursPerWeek * weeks + V;  // COST to us
  const profitTotal = total - cost;                                     // PROFIT

  const splitShares = splitOthers + 1;
  const shareAmount = total / splitShares;
  return {
    i, total, weeks, n, V, loc, day, time, level, subjects, tutor, interval, endDate,
    baseRate, studentAdj, promoAdj, chargePerHour,
    splitOthers, splitShares, shareAmount, profitTotal,
    summary: { service: val('c-service'), level, subject: subjects.join(', '), location: loc, day, time, students: n, interval, weeks, requestedTutor: tutor }
  };
}

// Cost of ADDING ONE student to an existing job, for the weeks remaining.
// The extra-student cost is the β step: baseRate · β · hours · weeksLeft (venue not re-charged).
function priceAddStudent(job) {
  const m = DATA.multipliers || {};
  const v = (DATA.constants || {}).vars || {};
  const cv = (...keys) => { for (const key of keys) { const x = parseFloat(v[key]); if (!isNaN(x)) return x; } return 0; };
  const lookup = (group, value) => parseFloat((m[group] || {})[value]) || 1;

  const timeFactor    = lookup('times', job.time);
  const subjectFactor = parseFloat((m.subjects || {})[job.subject]) || 1;
  const dayFactor     = lookup('days', job.day);
  const wageMultiplier = cv('λ', 'lambda', 'constant 3', 'constant3');
  const minWage        = cv('μ', 'mu', 'minimum wage', 'min wage', 'minimumwage');
  const extraChildRate = cv('β', 'beta', 'constant 1', 'constant1');
  const hoursPerWeek   = 2;

  const weeksLeft = parseFloat(job.weeks) || 0;         // job.weeks = weeks_left
  const baseRate  = timeFactor * subjectFactor * dayFactor * wageMultiplier * minWage;
  const cost = baseRate * extraChildRate * hoursPerWeek * weeksLeft;   // marginal β step for remaining weeks
  return { cost, weeksLeft };
}

// ---- Promotions framework (empty for now) ----
// Each promotion is a sheet row (category = 'promo') with a condition and a multiplier.
// Returns the product of every active promo's multiplier (1 = no promotions active).
// ctx = { subjects, n, weeks, day, time, level, lessonCount } so conditions can check the booking.
function activePromoFactor(ctx) {
  const promos = DATA.promotions || [];
  let factor = 1;
  promos.forEach(p => {
    if (promoApplies(p, ctx)) factor *= (parseFloat(p.value) || 1);
  });
  return factor;
}
// Decides whether a promo applies to this booking. Extend as you add promo types.
function promoApplies(p, ctx) {
  if (!p || !p.active) return false;
  switch ((p.type || '').toLowerCase()) {
    case 'bulk':        return ctx.lessonCount >= (parseFloat(p.threshold) || 999);   // many lessons
    case 'multi_student': return ctx.n >= (parseFloat(p.threshold) || 999);           // many students
    case 'long_term':   return ctx.weeks >= (parseFloat(p.threshold) || 999);         // many weeks
    // add 'advance_booking', 'subject', 'day' etc. here later
    default: return false;
  }
}

// Order-level quote: price every lesson block, sum into an order total.
function quote() {
  const blocks = Array.from(document.querySelectorAll('.lesson-block')).map(b => parseInt(b.dataset.lesson));
  const lessons = blocks.map(priceLesson);
  const total = lessons.reduce((s, L) => s + L.total, 0);
  const profitTotal = lessons.reduce((s, L) => s + L.profitTotal, 0);
  return { lessons, total: total.toFixed(2), profitTotal: profitTotal.toFixed(2) };
}

function calc() {
  const q = quote();
  if ($('total')) $('total').textContent = q.total;

  if ($('calc-receipt')) {
    const lessonRows = q.lessons.map(L => {
      const label = `${L.subjects.join(', ') || 'Lesson'} · ${fmtDay(L.day) || '—'} ${fmtTime(L.time) || ''}`.trim();
      const shareLine = L.splitOthers >= 1
        ? `<div class="receipt-row" style="color:var(--gold)">
             <span class="receipt-label">↳ split ${L.splitShares} ways — your share</span>
             <span class="receipt-pct">£${L.shareAmount.toFixed(2)}</span>
           </div>` : '';
      return `<div class="receipt-row">
        <span class="receipt-label">${esc(label)} (${L.n} student${L.n>1?'s':''}, ${L.weeks} wks)</span>
        <span class="receipt-pct">£${L.total.toFixed(2)}</span>
      </div>${shareLine}`;
    }).join('');
    // What the booker pays now = sum of their own share of each lesson
    const bookerPays = q.lessons.reduce((s, L) => s + L.shareAmount, 0);
    const payRow = bookerPays.toFixed(2) !== q.total
      ? `<div class="receipt-row receipt-total" style="color:var(--gold)"><span>You pay now</span><span>£${bookerPays.toFixed(2)}</span></div>` : '';
    $('calc-receipt').innerHTML = lessonRows
      + `<div class="receipt-row receipt-total"><span>Order total</span><span>£${q.total}</span></div>`
      + payRow;
  }
  document.querySelectorAll('.lesson-block').forEach(b => enforceHomeRuleBlock(parseInt(b.dataset.lesson)));
}

/* ---------- API POST ---------- */
async function post(body, btn, okText) {
  btn.textContent = 'Working...';
  btn.disabled = true;
  try {
    const d = await (await fetch(API, { method: 'POST', body: JSON.stringify(body) })).json();
    btn.textContent = d.success ? okText : (d.error || 'Error');
    if (!d.success) btn.disabled = false;
  } catch {
    btn.textContent = 'Error';
    btn.disabled = false;
  }
}

/* ---------- FILTERING ----------
   Each section has a search box plus addable filter dropdowns (no separate menu).
   FILTER_DEFS lists which fields each section can filter on; users click "+ filter"
   to add one inline. Filtering is search-text AND all active dropdown values. */
const FILTER_DEFS = {
  tutor: {
    target: 'tutors',
    text: x => (x.title + x.subtitle + (x.tags||[]).join(' ')),
    fields: {
      subject:  { label: 'Subject',  opts: () => DATA.dropdowns?.subjects || [], match: (x,v) => (x.tags||[]).map(t=>t.toLowerCase()).includes(v) },
      city:     { label: 'City',     opts: () => uniq((DATA.tutors||[]).map(t=>t.city)),    match: (x,v) => norm(x.city) === v },
      borough:  { label: 'Borough',  opts: () => uniq((DATA.tutors||[]).map(t=>t.borough)), match: (x,v) => norm(x.borough) === v },
    }
  },
  venue: {
    target: 'venues',
    text: x => (x.title||''),
    fields: {
      borough: { label: 'Borough', opts: () => DATA.dropdowns?.boroughs || [], match: (x,v) => norm(x.borough) === v },
      city:    { label: 'City',    opts: () => uniq((DATA.venues||[]).map(t=>t.city)), match: (x,v) => norm(x.city) === v },
    }
  },
  class: {
    target: 'classes',
    text: x => (x.title + x.location + x.day + x.time),
    fields: {
      subject:  { label: 'Subject',  opts: () => DATA.dropdowns?.subjects || [],  match: (x,v) => norm(x.subject).includes(v) },
      location: { label: 'Location', opts: () => DATA.dropdowns?.locations || [], match: (x,v) => norm(x.location) === v },
    }
  },
  link: {
    target: 'links',
    text: x => (x.title + (x.description||'')),
    fields: {
      category: { label: 'Category', opts: () => DATA.dropdowns?.linkCategories || [], match: (x,v) => norm(x.category) === v },
    }
  },
  post: {
    target: 'posts',
    source: () => GALLERY_POSTS,
    render: items => html('gallery', items.length
      ? items.map(tpl.socialPost).join('')
      : '<p class="muted">No posts match.</p>'),
    text: x => x.rawName,
    fields: {
      year:     { label: 'Year',     opts: () => uniq(GALLERY_POSTS.map(p => p.year)).sort().reverse(), match: (x,v) => norm(x.year) === v },
    }
  },
  tool: {
    target: 'checklist-content',
    source: () => checklistItems(),
    // Calculator card always first, then the filtered checklist band cards
    render: items => { html('checklist-content',
      tpl.calcToolCard() + tpl.timerCard() + tpl.notepadCard()
      + (items.length ? items.map(tpl.checklistBandCard).join('')
        : '<div class="card"><p class="muted">No topics match.</p></div>'));
      initMiniCalc(); initTimer(); },
    text: x => (x.subject + ' ' + x.bandLabel + ' ' + x.topics.map(t => t.name).join(' ')),
    fields: {
      subject:      { label: 'Subject',       opts: () => Object.keys(DATA.dropdowns?.checklists || {}), match: (x,v) => norm(x.subject) === v },
      grade:        { label: 'Grade',          opts: () => uniq(allTopicFieldValues('grade')).sort((a,b)=>+a-+b), match: (x,v) => x.grades.includes(v) },
      keystage:     { label: 'Key stage',      opts: () => uniq(allTopicFieldValues('keystage')), match: (x,v) => x.keystages.includes(v) },
      tier:         { label: 'Higher/lower',   opts: () => uniq(allTopicFieldValues('tier')),     match: (x,v) => x.tiers.includes(v) },
      company:      { label: 'Company',        opts: () => uniq(allTopicFieldValues('company')),  match: (x,v) => x.companies.includes(v) },
      stage:        { label: 'Stage',          opts: () => uniq(allTopicFieldValues('stage')),    match: (x,v) => x.stages.includes(v) },
    }
  },
};

const norm = s => String(s || '').toLowerCase().trim();
const uniq = arr => [...new Set((arr||[]).filter(Boolean))];

// Active filters per section: { tutor: {subject:'maths'}, ... }
const activeFilters = {};

function renderFilterBar(prefix) {
  const def = FILTER_DEFS[prefix];
  const bar = $(`${prefix}-filters`);
  if (!def || !bar) return;
  const active = activeFilters[prefix] || (activeFilters[prefix] = {});

  // Which fields aren't active yet (can still be added)
  const available = Object.keys(def.fields).filter(f => !(f in active));

  const search = `<input type="text" id="${prefix}-search" class="filter" placeholder="Search ${def.target}..." value="${esc(val(`${prefix}-search`))}">`;

  const dropdowns = Object.keys(active).map(field => {
    const fd = def.fields[field];
    const opts = uniq(fd.opts()).map(o => `<option value="${esc(o)}" ${norm(active[field])===norm(o)?'selected':''}>${esc(o)}</option>`).join('');
    return `<span class="filter-chip-wrap">
      <select class="filter filter-dyn" data-prefix="${prefix}" data-field="${field}">
        <option value="">All ${esc(fd.label)}</option>${opts}
      </select>
      <button type="button" class="filter-remove" data-prefix="${prefix}" data-field="${field}" title="Remove filter">×</button>
    </span>`;
  }).join('');

  const addChip = available.length
    ? `<span class="filter-add-wrap">
        <button type="button" class="filter-add" data-prefix="${prefix}">+ Filter</button>
        <span class="filter-add-menu hidden" id="${prefix}-add-menu">
          ${available.map(f => `<button type="button" class="filter-add-opt" data-prefix="${prefix}" data-field="${f}">${esc(def.fields[f].label)}</button>`).join('')}
        </span>
      </span>` : '';

  bar.innerHTML = search + dropdowns + addChip;
}

function applyFilter(prefix) {
  const def = FILTER_DEFS[prefix];
  if (!def) return;
  const active = activeFilters[prefix] || {};
  const q = norm(val(`${prefix}-search`));
  const source = def.source ? def.source()
    : (DATA[def.target === 'classes' ? 'clientClasses' : def.target] || []);
  const items = source.filter(x => {
    if (q && !def.text(x).toLowerCase().includes(q)) return false;
    for (const [field, value] of Object.entries(active)) {
      if (value && !def.fields[field].match(x, norm(value))) return false;
    }
    return true;
  });
  if (def.render) def.render(items);
  else if (def.target === 'classes') renderClasses(items);
  else if (def.target === 'tutors' || def.target === 'venues') renderCards(def.target, items);
  else if (def.target === 'links') renderLinks(items);
}

/* ---------- EVENTS ---------- */
// When 'Home' is the location for a lesson block, that block's student min jumps to 4.
function enforceHomeRuleBlock(i) {
  const qty = document.querySelector(`.l-qty[data-lesson="${i}"]`);
  const locEl = document.querySelector(`.l-location[data-lesson="${i}"]`);
  if (!qty || !locEl) return;
  const home = isHome(locEl.value);
  qty.min = home ? 4 : 1;
  if (home && (parseInt(qty.value) || 0) < 4) qty.value = 4;
}
function enforceHomeRule() { /* legacy no-op; per-block version used now */ }

['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const id = e.target.id;

  // Notepad auto-saves shortly after you stop typing (debounced so we don't save every keystroke)
  if (id === 'notepad-text' && USER) {
    const status = $('notepad-status');
    if (status) status.textContent = 'Saving…';
    clearTimeout(NOTEPAD_TIMER);
    NOTEPAD_TIMER = setTimeout(() => {
      const notes = $('notepad-text')?.value ?? '';
      fetch(API, { method: 'POST', body: JSON.stringify({ action: 'saveNotepad', name: USER.name, notepad: notes }) })
        .then(() => { USER.notepad = notes; if (status) status.textContent = 'Saved'; })
        .catch(() => { if (status) status.textContent = 'Not saved — check connection'; });
    }, 900);
  }
  if (e.target.closest('#new-job')) calc();
  // Per-lesson term changed → update that block's weeks label
  if (e.target.classList.contains('l-interval')) { syncBlockWeeks(parseInt(e.target.dataset.lesson)); calc(); }

  // Search box typing
  const prefix = Object.keys(FILTER_DEFS).find(p => id === `${p}-search`);
  if (prefix) applyFilter(prefix);

  // A dynamic filter dropdown changed
  if (e.target.classList.contains('filter-dyn')) {
    const p = e.target.dataset.prefix, f = e.target.dataset.field;
    (activeFilters[p] = activeFilters[p] || {})[f] = e.target.value;
    applyFilter(p);
  }
}));

// Safety net: block any accidental form submission from ever reloading the page
document.addEventListener('submit', e => e.preventDefault());

document.addEventListener('click', e => {
  const t = e.target;

  // Mini calculator buttons
  if (t.dataset && t.dataset.mc !== undefined) { window._mcClick?.(t.dataset.mc); return; }

  // Filter: toggle the "+ Filter" menu
  if (t.classList.contains('filter-add')) {
    $(`${t.dataset.prefix}-add-menu`)?.classList.toggle('hidden');
    return;
  }
  // Filter: pick a field to add
  if (t.classList.contains('filter-add-opt')) {
    const p = t.dataset.prefix, f = t.dataset.field;
    (activeFilters[p] = activeFilters[p] || {})[f] = '';
    renderFilterBar(p);
    applyFilter(p);
    return;
  }
  // Filter: remove an active filter
  if (t.classList.contains('filter-remove')) {
    const p = t.dataset.prefix, f = t.dataset.field;
    if (activeFilters[p]) delete activeFilters[p][f];
    renderFilterBar(p);
    applyFilter(p);
    return;
  }
  // Close any open filter menu when clicking elsewhere
  if (!t.classList.contains('filter-add')) {
    document.querySelectorAll('.filter-add-menu').forEach(m => m.classList.add('hidden'));
  }

  // Modal
  if (t.dataset.video) {
    $('modal-title').textContent = t.dataset.title || 'Intro';
    $('modal-frame').src = t.dataset.video;
    tog('modal', false);
  }
  if (t.classList.contains('modal-close') || t.id === 'modal') {
    tog('modal', true);
    $('modal-frame').src = '';
  }

  // Prompt login from the booking card
  if (t.id === 'go-login-btn') {
    ($('login-card') || $('tutors'))?.scrollIntoView({ behavior: 'smooth' });
    $('auth-email')?.focus();
  }

  // Book (requires login + home-group rule)
  // Add another lesson block
  if (t.id === 'add-lesson-btn') {
    if (LESSON_COUNT >= 5) return;   // sane cap
    const i = LESSON_COUNT;
    $('lessons').insertAdjacentHTML('beforeend', tpl.lessonBlock(i));
    fillLessonBlock(i);
    LESSON_COUNT++;
    calc();
    return;
  }
  // Remove a lesson block
  if (t.classList.contains('remove-lesson-btn')) {
    const i = t.dataset.lesson;
    const block = document.querySelector(`.lesson-block[data-lesson="${i}"]`);
    if (block) block.remove();
    calc();
    return;
  }

  if (t.id === 'book-btn') {
    if (!USER) { $('go-login-btn')?.click(); return; }
    const q = quote();
    if (!q.lessons.length) return;
    // Validate each lesson (home rule, subject chosen)
    for (const L of q.lessons) {
      if (!L.subjects.length) { t.textContent = 'Pick a subject for each lesson'; setTimeout(()=>t.textContent='Lock in & Book',2500); return; }
      if (isHome(L.loc) && L.n < 4) { t.textContent = 'Home lessons need 4 students'; setTimeout(()=>t.textContent='Lock in & Book',2500); return; }
    }
    // Build the list of lessons (each becomes its own job, with its own tutor, term, split)
    const lessons = q.lessons.map(L => {
      const dates = computeSessionDates(L.day, L.endDate).map(fmtDate);
      const lessonObj = { ...L.summary, price: L.total.toFixed(2), profit: L.profitTotal.toFixed(2),
        dates: dates.join(', ') };
      if (L.splitOthers >= 1) {
        lessonObj.split = true;
        lessonObj.splitShares = L.splitShares;
        lessonObj.shareAmount = L.shareAmount.toFixed(2);
      }
      return lessonObj;
    });
    // Booker pays the sum of their own share of each lesson
    const bookerPays = q.lessons.reduce((s, L) => s + L.shareAmount, 0).toFixed(2);
    const order = { action: 'createCheckout', clientName: USER.name, clientContact: USER.role || '',
      lessons, orderTotal: q.total, payNow: bookerPays };
    t.textContent = 'Redirecting to payment...';
    t.disabled = true;
    fetch(API, { method: 'POST', body: JSON.stringify(order) })
      .then(r => r.json())
      .then(d => {
        if (d.url) { window.location.href = d.url; }
        else { t.textContent = d.error || 'Payment error'; t.disabled = false; }
      })
      .catch(() => { t.textContent = 'Connection error'; t.disabled = false; });
    return;
  }

  // Client requests to join an existing class (takes an empty slot)
  if (t.classList.contains('join-job-btn')) {
    if (!USER) { $('go-login-btn')?.click(); return; }
    const jobId = t.dataset.job;
    post({ action: 'joinJob', jobId, clientName: USER.name }, t, '✅ Requested');
  }

  // Booker adds another student mid-job → creates a Requested slot with the add-cost stored.
  // Tutor accepts (existing slot-act), then the parent pays (see below).
  if (t.classList.contains('add-student-btn')) {
    if (!USER) { $('go-login-btn')?.click(); return; }
    const jobId = t.dataset.job;
    // Find the job to price the add
    const job = (DATA.clientClasses || []).find(j => String(j.id) === String(jobId));
    const add = job ? priceAddStudent(job) : { cost: 0 };
    post({ action: 'addStudent', jobId, clientName: USER.name, addCost: add.cost.toFixed(2) }, t, '✅ Requested — awaiting tutor');
  }

  // Pay for an accepted mid-job add
  if (t.classList.contains('pay-add-btn')) {
    const { job: jobId, slot } = t.dataset;
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'payAddStudent', jobId, slot }) })
      .then(r => r.json())
      .then(d => { if (d.url) window.location.href = d.url; else { t.textContent = d.error || 'Error'; } })
      .catch(() => { t.textContent = 'Connection error'; });
  }

  // Tutor accepts/declines a specific client slot
  if (t.classList.contains('slot-act')) {
    const { job: jobId, slot, status } = t.dataset;
    post({ action: 'slotAction', jobId, slot, newStatus: status }, t, /active/i.test(status) ? '✅ Accepted' : 'Declined');
  }

  // Counter-offer (client 1 or tutor) — propose a new time while job is Pending
  if (t.classList.contains('counter-btn')) {
    const jobId = t.dataset.job;
    const time = val(`counter-time-${jobId}`).trim();
    if (!time) return;
    post({ action: 'counterOffer', jobId, time }, t, '✅ Sent');
  }

  // Send a message to a client slot's chat thread
  if (t.classList.contains('slot-chat-btn')) {
    const { job: jobId, slot } = t.dataset;
    const input = $(`slotchat-${jobId}-${slot}`);
    const message = input.value.trim();
    if (!message) return;
    post({ action: 'slotChat', jobId, slot, sender: USER ? USER.name : 'User', message }, t, 'Sent');
    input.value = '';
  }

  // Shop: Buy button (payment not wired yet — placeholder confirmation)
  if (t.classList.contains('buy-item-btn')) {
    const name = t.dataset.name;
    t.textContent = 'Coming soon';
    setTimeout(() => t.textContent = 'Buy', 2000);
    return;
  }

  // Times Tables Sprint
  if (t.id === 'tt-start' || t.id === 'tt-again') { startTimesTables(); return; }

  // Timer
  if (t.id === 'timer-toggle') { toggleTimer(); return; }
  if (t.id === 'timer-reset') {
    clearInterval(timerState.tick);
    timerState.running = false;
    timerState.left = timerState.total;
    if ($('timer-msg')) $('timer-msg').textContent = '';
    paintTimer();
    return;
  }

  // Kid adds a friend by exact handle (e.g. "LuccaD")
  if (t.id === 'add-friend-btn') {
    const query = val('friend-search').trim();
    const msg = $('friend-msg');
    if (!query) return;
    const norm = s => String(s || '').toLowerCase().trim();
    // match against other students' handles (exact, case-insensitive)
    const match = (DATA.students || []).find(s => norm(s.handle) === norm(query) && norm(s.handle) !== norm(USER.handle));
    if (!match) { if (msg) msg.textContent = `No student found with the name "${query}".`; return; }
    const current = friendHandles();
    if (current.map(norm).includes(norm(match.handle))) { if (msg) msg.textContent = `${match.handle} is already your friend.`; return; }
    current.push(match.handle);
    USER.friends = current.join(', ');
    post({ action: 'saveFriends', name: USER.name, friends: USER.friends }, t, '✅ Added');
    if (msg) msg.textContent = '';
    $('friend-search').value = '';
    renderCards('tutors', DATA.tutors);
    return;
  }

  // Kid removes a friend
  if (t.classList.contains('remove-friend-btn')) {
    const handle = t.dataset.handle;
    const norm = s => String(s || '').toLowerCase().trim();
    USER.friends = friendHandles().filter(h => norm(h) !== norm(handle)).join(', ');
    post({ action: 'saveFriends', name: USER.name, friends: USER.friends }, t, '✓');
    renderCards('tutors', DATA.tutors);
    return;
  }

  // Student ticks/unticks a topic box → instantly write their handle to that topic row's tickN cell
  if (t.classList.contains('topic-cb')) {
    if (!canTrack() || !USER.handle) return;
    const { row: rowIndex, tick } = t.dataset;
    fetch(API, { method: 'POST', body: JSON.stringify({
      action: 'toggleTopicTick', rowIndex, tick, handle: USER.handle, checked: t.checked
    }) })
      .then(r => r.json())
      .then(d => {
        // Keep the local stats in step so the profile card shows the new XP/credits
        if (d && d.xp !== null && d.xp !== undefined) USER.xp = d.xp;
        if (d && d.credits !== null && d.credits !== undefined) USER.credits = d.credits;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        renderCards('tutors', DATA.tutors);   // refresh the profile card's Lv / XP / credits
      })
      .catch(() => {});
    return;
  }

  // Tutor saves their edited profile
  // Tutor clicks Edit on their own Team card → swap that card to edit mode in place
  if (t.classList.contains('edit-profile-btn')) {
    const card = t.closest('.card');
    if (card) card.outerHTML = tpl.profileEditCard(USER.profile || {});
    return;
  }
  // Cancel editing → restore just this card to display form (no section rebuild)
  if (t.id === 'cancel-profile-btn') {
    const norm = s => String(s || '').toLowerCase().trim();
    const me = (DATA.tutors || []).find(x => norm(x.title) === norm(USER.name));
    const card = t.closest('.card');
    if (card && me) card.outerHTML = tpl.card(me);
    return;
  }

  if (t.id === 'save-profile-btn') {
    const profile = {
      action: 'updateProfile',
      name: USER.name,
      description: val('pf-description'),
      adjective_1: val('pf-adj1'),
      adjective_2: val('pf-adj2'),
      adjective_3: val('pf-adj3'),
      location: val('pf-location'),
      photo: val('pf-photo'),
      video: val('pf-video'),
    };
    post(profile, t, '✅ Saved');
    if (USER.profile) Object.assign(USER.profile, profile);
    // Update the live tutor record so a later natural re-render shows new values
    const norm = s => String(s || '').toLowerCase().trim();
    const me = (DATA.tutors || []).find(x => norm(x.title) === norm(USER.name));
    if (me) {
      me.description = profile.description ? `"${profile.description}"` : '';
      me.tags = [profile.adjective_1, profile.adjective_2, profile.adjective_3].filter(Boolean);
      me.image = profile.photo;
      me.mediaUrl = profile.video;
      me.subtitle = `📍 ${profile.location || 'London'}`;
    }
    // Swap just this one card back to its display form (no whole-section rebuild)
    const card = t.closest('.card');
    if (card && me) card.outerHTML = tpl.card(me);
    return;
  }

  // Login — verify full name + PIN against the sheet
  if (t.id === 'auth-btn') {
    const name = val('auth-email'), pin = val('auth-pin');
    if (!name || !pin) { $('auth-msg').textContent = 'Please enter both fields.'; return; }
    $('auth-msg').textContent = '';
    t.textContent = 'Verifying...'; t.disabled = true;
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'verifyLogin', name, pin }) })
      .then(r => r.json())
      .then(d => {
        t.textContent = 'Enter'; t.disabled = false;
        if (!d.success) { $('auth-msg').textContent = d.error || 'Login failed.'; return; }
        USER = { name: d.name, role: (d.role || 'parent').toLowerCase(), kids: d.kids || [], parent: d.parent || '', profile: d.profile || null, topics: d.topics || '', friends: d.friends || '', handle: d.handle || '', highscore: d.highscore || 0, ttHighscore: d.ttHighscore || 0, xp: d.xp || 0, credits: d.credits || 0, tick1: d.tick1 || '', tick2: d.tick2 || '', tick3: d.tick3 || '', notepad: d.notepad || '' };
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        $('auth-pin').value = '';
        onLogin();
      })
      .catch(() => { t.textContent = 'Enter'; t.disabled = false; $('auth-msg').textContent = 'Connection error.'; });
  }

  // Logout
  if (t.id === 'logout-btn') {
    USER = null;
    try { localStorage.removeItem('familyUser'); } catch {}
    renderHeaderAuth();
    renderClasses();                      // access card reverts to login; clears highlighting
    renderCards('tutors', DATA.tutors);   // People: drop friend cards/edit buttons
    renderChecklist();                    // Checklist: back to default view
    renderArcade();                       // Arcade: drop personal best display
    renderCheckout();
  }

  // Custom multi-select dropdowns (per-lesson subject picker + dash topics)
  if (t.classList.contains('l-subject-display') || t.closest('#dash-topic-display')) {
    t.closest('.custom-select-wrapper').querySelector('.custom-dropdown').classList.toggle('hidden');
  } else if (!t.closest('.custom-select-wrapper')) {
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.add('hidden'));
  }

  // Subject checkbox sync (per lesson block) — update that block's display label + recalc
  if (t.classList.contains('subj-cb')) {
    const i = t.dataset.lesson;
    const checked = Array.from(document.querySelectorAll(`.subj-cb[data-lesson="${i}"]:checked`)).map(cb => cb.value);
    const disp = document.querySelector(`.l-subject-display[data-lesson="${i}"]`);
    if (disp) disp.textContent = checked.length ? checked.join(', ') + ' ⌄' : 'Select Subjects ⌄';
    calc();
  }
  // Dash topics (unchanged)
  if (t.classList.contains('dash-topic-cb')) {
    const checked = Array.from(document.querySelectorAll('.dash-topic-cb:checked')).map(cb => cb.value);
    if ($('dash-topic-display')) $('dash-topic-display').textContent = checked.length ? checked.join(', ') + ' ⌄' : 'Select Topics ⌄';
  }

  // Save checklist
  if (t.id === 'save-checklist-btn') {
    const selected = Array.from(document.querySelectorAll('.dash-topic-cb:checked')).map(cb => cb.value);
    console.log('Saving:', selected.join(', '));
    t.textContent = 'Saved!';
    setTimeout(() => t.textContent = 'Save Progress', 2000);
  }

  // Share button
  if (t.closest('.social-share-btn')) {
    const url = t.closest('.social-share-btn').dataset.shareUrl;
    navigator.share ? navigator.share({ title: '@family. Gallery', url }).catch(()=>{}) : (navigator.clipboard.writeText(url), alert('Image link copied!'));
  }
});

init();
