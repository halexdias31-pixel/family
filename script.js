const API = 'https://script.google.com/macros/s/AKfycbyINfTA44t4ibW6ihxADTwCo1CxCP8v6UA_SR_4GiCQuR7Q4cRNWnlkOdb2xQaSoGzk/exec';
let DATA = {};
let USER = null; // set on login: { name }

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
const drive = url => { const m = (url||'').match(/\/d\/([\w-]+)/); return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400` : url; };
const empty = (arr, msg) => arr?.length ? arr.map : () => `<p class="muted">${msg}</p>`;

/* ---------- INIT ---------- */
async function init() {
  // Restore login from this browser session (survives the Stripe redirect / refresh)
  try {
    const saved = localStorage.getItem('familyUser');
    if (saved) USER = JSON.parse(saved);
  } catch {}

  // If returning from Stripe checkout (?paid=1&ref=...), finalize the booking now.
  const params = new URLSearchParams(location.search);
  const justPaid = params.get('paid') === '1' && params.get('ref');
  if (justPaid) {
    try {
      const res = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'finalizeBooking', ref: params.get('ref') }) })).json();
      // If we weren't still logged in, restore login from who booked
      if (!USER && res && res.clientName) {
        try {
          const lr = await (await fetch(API, { method: 'POST', body: JSON.stringify({ action: 'relogin', name: res.clientName }) })).json();
          if (lr && lr.success) {
            USER = { name: lr.name, role: (lr.role||'parent').toLowerCase(), kids: lr.kids||[], parent: lr.parent||'', profile: lr.profile||null, topics: lr.topics||'', friends: lr.friends||'', handle: lr.handle||'', highscore: lr.highscore||0, tick1: lr.tick1||'', tick2: lr.tick2||'', tick3: lr.tick3||'', notepad: lr.notepad||'' };
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
    const text = (items || []).filter(Boolean).map(esc).join(', ');
    return (text || extra) ? `<p class="attr-line">${text}${extra ? ' ' + extra : ''}</p>` : '';
  },
  img: (src, style = '') => src ? `<img src="${drive(src)}" alt=""${style ? ` style="${style}"` : ''}>` : '',

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
    const norm = s => String(s || '').toLowerCase().trim();
    const isOwn = USER && USER.role === 'tutor' && it.type === 'tutor' && norm(it.title) === norm(USER.name);
    // Tutor progress (level + high score) — shown quietly at the BOTTOM in gray so it doesn't
    // read as ranking/status between tutors to clients.
    const stats = (it.type === 'tutor' && (it.topics || it.highscore))
      ? `<div class="tutor-stats">Lv ${levelInfo(it.topics).level} · 🎮 ${it.highscore || 0}</div>`
      : '';
    return `<div class="card${isOwn ? ' own-profile' : ''}" data-card-id="${it.id}">
    ${isOwn ? `<button type="button" class="edit-profile-btn" title="Edit your profile">✎ Edit</button>` : ''}
    ${tpl.img(it.image)}
    <h3>${esc(it.title)}</h3>
    <p class="sub">${esc(it.subtitle)}</p>
    <p class="desc">${esc(it.description)}</p>
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
    ${it.price ? `<p class="sub">£${esc(it.price)}</p>` : ''}
    ${it.description ? `<p class="desc">${esc(it.description)}</p>` : ''}
    <button type="button" class="action buy-item-btn" data-item="${esc(it.id)}" data-name="${esc(it.name)}">Buy</button>
  </div>`,

  friendCard: (s, isChild = false) => {
    const menuTotal = (DATA.dropdowns?.topics || []).length;
    const done = String(s.topics || '').split(',').map(x => x.trim()).filter(Boolean).length;
    const pct = menuTotal ? Math.round(done / menuTotal * 100) : 0;
    const lvl = levelInfo(s.topics);
    return `<div class="card" style="text-align:left">
      ${isChild ? '' : `<button type="button" class="remove-friend-btn" data-handle="${esc(s.handle)}" title="Remove">✕</button>`}
      <h3>${esc(s.name)} <span class="lb-lvl">Lv ${lvl.level}</span></h3>
      <p class="sub">${esc(s.handle)}</p>
      <div class="friend-bar"><div class="friend-bar-fill" style="width:${pct}%"></div></div>
      ${tpl.tagRow([`${done}/${menuTotal} topics`, `🎮 ${s.highscore || 0}`])}
    </div>`;
  },

  // Arcade game card (Flappy-style canvas)
  gameCard: () => `<div class="card" style="text-align:center">
    <h3 class="gold" style="margin-bottom:8px">Flappy Maths</h3>
    <canvas id="flappy-canvas" width="280" height="360" style="width:100%;max-width:280px;background:#0a0a0a;border:1px solid var(--border);border-radius:8px;cursor:pointer"></canvas>
    <p style="margin:10px 0 0">Score: <b id="flappy-score" style="color:#fff">0</b>${canTrack() ? ` · Best: <b id="flappy-best" style="color:var(--gold)">${USER.highscore || 0}</b>` : ''}</p>
    <p id="flappy-msg" class="muted" style="font-size:var(--fs-xs);min-height:14px;margin-top:6px">Click the game to start</p>
  </div>`,

  // Kid's checklist: ONE CARD PER GRADE (each its own card in the grid)
  // Compact GCSE calculator that fits in a card (basic + √, x², trig, brackets, π)
  // Student notepad tool — saves to the person's `notepad` cell. Any logged-in user.
  notepadCard: () => USER ? `<div class="card" style="text-align:left">
    <h3 class="gold" style="margin-bottom:8px">Notepad</h3>
    <textarea id="notepad-text" class="notepad-area" placeholder="Jot notes here...">${esc(USER.notepad || '')}</textarea>
    <button type="button" id="save-notepad-btn" class="action" style="width:100%;margin-top:10px">Save Notes</button>
  </div>` : '',

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
    const prog = canTrack() ? parseProgress() : {};
    const rows = item.topics.map(t => {
      const p = prog[t.toLowerCase()] || {};
      return `<div class="check-row">
        <span class="check-topic">${esc(t)}</span>
        <label class="mini-check"><input type="checkbox" class="topic-cb cb-tick1" data-topic="${esc(t)}" ${p.t1?'checked':''}></label>
        <label class="mini-check"><input type="checkbox" class="topic-cb cb-tick2" data-topic="${esc(t)}" ${p.t2?'checked':''}></label>
        <label class="mini-check"><input type="checkbox" class="topic-cb cb-tick3" data-topic="${esc(t)}" ${p.t3?'checked':''}></label>
      </div>`;
    }).join('');
    return `<div class="card grade-card" style="text-align:left">
      <h3 class="gold" style="margin-bottom:4px">${esc(item.subject)} · ${esc(item.bandLabel)}</h3>
      <div class="check-list">${rows}</div>
      <button type="button" class="action save-topics-btn" style="width:100%;margin-top:12px">Save</button>
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
    const mySlot = slots.find(s => norm(s.client) === myName);          // am I in this class?
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

  // Pull #tags and @mentions out of caption text → array of tokens
  extractTokens: text => (String(text || '').match(/[#@][\w.]+/g) || []),
  // Caption with the tokens (and dates/brackets) stripped, for the plain text line
  cleanCaption: text => String(text || '')
    .replace(/\.[^/.]+$/, '').replace(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/, '').replace(/\[.*?\]/, '')
    .replace(/[#@][\w.]+/g, '').replace(/^[-–—\s]+|[-–—\s]+$/g, '').trim(),

  socialPost: post => {
    const caption = tpl.cleanCaption(post.rawName);
    const tokens  = tpl.extractTokens(post.rawName);
    // location + date via the shared tagRow; #tags/@mentions as plain text
    const hashtags = tokens.map(tk => esc(tk)).join(', ');
    const tagRow = tpl.tagRow([
      post.location ? `${post.location}` : '',
      post.label ? `${post.label}` : '',
    ], hashtags);
    return `<div class="card social-post">
      <div class="social-header">
        <div class="social-avatar">@</div>
        <span class="social-username">@family.</span>
        <button type="button" data-share-url="https://drive.google.com/file/d/${post.id}/view" class="social-share-btn">⎘</button>
      </div>
      <img class="social-img" src="https://drive.google.com/thumbnail?id=${post.id}&sz=w800" alt="Gallery Post" loading="lazy">
      <div class="social-body">
        ${caption ? `<p class="desc" style="margin:0 0 8px">${esc(caption)}</p>` : ''}
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
    const kidStats = USER.role === 'kid'
      ? `<div class="friend-bar"><div class="friend-bar-fill" style="width:${levelInfo(USER.topics).pct}%"></div></div>
         ${tpl.tagRow([`Lv ${levelInfo(USER.topics).level}`, `🎮 ${USER.highscore || 0}`])}` : '';
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
    <p class="sentence" style="line-height:2.2;margin-bottom:15px;text-align:left">
      I want <strong>tuition</strong> for
      <span class="custom-select-wrapper" id="subject-wrapper">
        <span class="inline-select pick c-level" id="subject-display" style="cursor:pointer">Select Subjects ⌄</span>
        <span class="custom-dropdown hidden" id="subject-dropdown"></span>
      </span>
      (<select id="c-level" class="pick c-level"></select>)
      delivered @ <select id="c-location" class="pick c-service"></select>
      for <input type="number" id="c-qty" class="num c-qty" value="1" min="1" max="4" style="width:40px"><sup id="qty-sup" class="qty-sup c-qty"></sup> student
      for <select id="c-interval" class="pick"></select>
      <span class="muted" style="font-size:0.9em;white-space:nowrap">(<span id="term-display" style="font-weight:bold;color:#fff"></span> · <span id="weeks-display" style="font-weight:bold;color:#fff">0</span> weeks)</span>
      <span id="dates-display" class="muted" style="font-size:0.8em;display:block;margin-top:4px"></span>
      <input type="hidden" id="c-weeks" value="0">
      at <select id="c-time" class="pick"></select>
      on <select id="c-day" class="pick"></select>
      with <select id="c-tutor" class="pick"></select>.
    </p>
    <div class="total"><h2 style="font-size:var(--fs-lg);margin:15px 0">Total: £<span id="total">0.00</span></h2></div>

    <div class="calc-breakdown">
      <p class="muted breakdown-heading">Live formula <span id="formula-source" class="formula-source"></span></p>
      <div id="calc-formula" class="formula"></div>
      <p class="muted breakdown-heading">Breakdown</p>
      <div id="calc-receipt" class="receipt"></div>
    </div>

    <p id="home-note" class="muted hidden" style="font-size:var(--fs-sm);margin:10px 0 0">At-home lessons require a group of 4 students.</p>

    <div id="checkout-area" class="checkout" style="display:flex;flex-direction:column;gap:8px"></div>
  </div>`
};

/* ---------- RENDER ---------- */
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
  // Logged-in user's own classes (confirmed or pending) float to the top
  const rank = j => classState(j) ? 1 : 0;
  const sorted = [...items].sort((a, b) => rank(b) - rank(a));
  const cards = sorted.map(j => tpl.jobCard(j, false, classState(j))).join('');
  html('classes', tpl.builderCard() + cards);
  // The builder card was just rebuilt — repopulate its dropdowns and intervals so the
  // calculator works after any re-render (e.g. login), not just on first load.
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
function checklistItems() {
  const checklists = DATA.dropdowns?.checklists || {};
  const items = [];
  Object.keys(checklists).forEach(subject => {
    const bands = checklists[subject];
    Object.keys(bands).sort((a,b)=>+a-+b).forEach(band => {
      items.push({
        subject, band: String(band),
        bandLabel: subject === 'Reading' ? `Stage ${band}` : `Grade ${band}`,
        topics: bands[band]
      });
    });
  });
  return items;
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

// Progression: XP = number of topics with any progress. Every 5 = +1 level.
const TOPICS_PER_LEVEL = 5;
function topicCount(topicsStr) {
  return String(topicsStr || '').split(',').map(s => s.trim()).filter(Boolean).length;
}
function levelInfo(topicsStr) {
  const xp = topicCount(topicsStr);
  const level = Math.floor(xp / TOPICS_PER_LEVEL) + 1;
  const intoLevel = xp % TOPICS_PER_LEVEL;
  const pct = Math.round(intoLevel / TOPICS_PER_LEVEL * 100);
  return { xp, level, intoLevel, toNext: TOPICS_PER_LEVEL, pct };
}

// Arcade section: the game card (high scores show on student/friend cards)
function renderArcade() {
  const el = $('arcade-content');
  if (!el) return;
  el.innerHTML = tpl.gameCard();
  initFlappy();  // wire up the canvas game
}

// --- Flappy Maths: simple one-button canvas game ---
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
    bird: { x: 60, y: H/2, vy: 0, r: 9 },
    pipes: [], score: 0, running: false, dead: false, raf: null, frame: 0
  };
  const GRAV = 0.45, FLAP = -7, GAP = 110, PIPE_W = 42, SPEED = 2;

  const reset = () => {
    S.bird.y = H/2; S.bird.vy = 0; S.pipes = []; S.score = 0; S.frame = 0; S.dead = false;
    $('flappy-score').textContent = '0';
  };
  const spawnPipe = () => {
    const top = 40 + Math.random() * (H - GAP - 110);
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

  const parseDate = name => {
    const match = (name||'').match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (!match) return { ts: 0, label: '', year: '' };
    let [, d, m, y] = match;
    if (y.length === 2) y = '20' + y;
    const postDate = new Date(y, m - 1, d);
    const year = String(y);
    const diff = Math.floor((Date.now() - postDate.setHours(0,0,0,0)) / 86400000);
    const label = diff <= 0 ? 'Today' : diff === 1 ? 'Yesterday'
      : diff < 7 ? `${diff} days ago` : diff < 30 ? `${Math.floor(diff/7)} weeks ago`
      : diff < 365 ? `${Math.floor(diff/30)} months ago` : `${Math.floor(diff/365)} years ago`;
    return { ts: postDate.getTime(), label, year };
  };

  GALLERY_POSTS = galleryData
    .map(p => {
      const name = typeof p === 'object' ? p.name : '';
      const locMatch = (name||'').match(/\[(.*?)\]/);
      return { ...(typeof p === 'object' ? p : { id: p }), ...parseDate(name), location: locMatch?.[1]?.trim() || '', rawName: name };
    })
    .sort((a, b) => b.ts - a.ts);  // newest first

  renderFilterBar('post');
  applyFilter('post');
}

/* ---------- DROPDOWNS ---------- */
function fillDropdowns() {
  const d = DATA.dropdowns || {};

  // Standard selects. Time & day keep raw values (for multiplier matching) but show friendly labels.
  const selects = [
    ['c-level', d.levels], ['c-location', d.locations],
    ['c-day', d.days, null, fmtDay], ['c-time', d.times, null, fmtTime],
  ];
  selects.forEach(([id, list, first, labelFn]) => fill(id, list, first, labelFn));

  // Tutor preference: "No preference" first, then each tutor by name
  const tutorNames = (DATA.tutors || []).map(t => t.title).filter(Boolean);
  fill('c-tutor', tutorNames, 'No preference');

  // Checkbox dropdowns
  const checkboxDrops = [
    ['subject-dropdown', d.subjects, 'subj-cb'],
    ['dash-topic-dropdown', d.subjects, 'dash-topic-cb'],
  ];
  checkboxDrops.forEach(([id, list, cls]) => {
    if ($(id)) $(id).innerHTML = (list||[]).map(s => `<label><input type="checkbox" class="${cls}" value="${esc(s)}"> ${esc(s)}</label>`).join('');
  });
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

function initIntervals() {
  const sel = $('c-interval');
  if (!sel) return;
  const intervals = getAcademicIntervals();
  if (!intervals.length) { sel.innerHTML = '<option value="">No terms</option>'; return; }
  sel.innerHTML = intervals
    .map(i => `<option value="${esc(i.name)}" data-weeks="${i.weeks}" data-term="${esc(i.name)}"
        data-end="${esc(i.endDate)}" data-lastmon="${esc(i.lastMon)}" data-lastsun="${esc(i.lastSun)}">${esc(i.label)}</option>`)
    .join('');
  syncWeeks();
}

function syncWeeks() {
  const sel = $('c-interval');
  if (!sel?.options.length) return;
  const opt = sel.options[sel.selectedIndex];
  $('weeks-display').textContent = opt.dataset.weeks;
  if ($('term-display')) $('term-display').textContent = opt.dataset.term;
  // Show the actual session dates: every occurrence of the chosen day, up to the term end
  if ($('dates-display')) {
    const dates = computeSessionDates(val('c-day'), opt.dataset.end);
    if (dates.length) {
      $('dates-display').textContent = `${dates.length} session${dates.length>1?'s':''}: ${dates.map(fmtDate).join(', ')}`;
    } else {
      const end = fmtDate(opt.dataset.end);
      $('dates-display').textContent = end ? `ends ${end}` : '';
    }
  }
  $('c-weeks').value = opt.dataset.weeks;
  calc();
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
  const profit = (lam, mu, beta, eps, eta, alpha, gamma, n) => {
    const K = gamma * eta * alpha * lam * mu;
    return K * (1 + beta * (n - 1)) - K * eps * (1 - beta * (n - 1));
  };
  // λ=1.5 μ=12 β=0.25 ε=0.9 η=1.1 α=1.1 γ=0.9 n=2 → K=19.60 → 24.50 − 13.23 = 11.27
  const got = profit(1.5, 12, 0.25, 0.9, 1.1, 1.1, 0.9, 2), want = 11.27;
  if (Math.abs(got - want) > 0.01) console.error(`⚠ Profit formula drift: expected ${want}/h, got ${got.toFixed(2)}/h`);
}

function quote() {
  const m = DATA.multipliers || {};
  const k = DATA.constants || {};
  const v = k.vars || {};
  // Read constants by symbol, with name fallbacks (robust to encoding / which column held the symbol)
  const cv = (...keys) => { for (const key of keys) { const x = parseFloat(v[key]); if (!isNaN(x)) return x; } return 0; };
  const lam  = cv('λ', 'lambda', 'constant 3', 'constant3');
  const mu   = cv('μ', 'mu', 'minimum wage', 'min wage', 'minimumwage');
  const beta = cv('β', 'beta', 'constant 1', 'constant1');
  const eps  = cv('ε', 'epsilon', 'constant 2', 'constant2');
  const lookup = (group, value) => parseFloat((m[group] || {})[value]) || 1;

  const subjects = Array.from(document.querySelectorAll('.subj-cb:checked')).map(cb => cb.value).filter(Boolean);
  const n = Math.max(1, parseInt(val('c-qty')) || 1);
  const weeks = parseFloat(val('c-weeks')) || 1;

  // Venue rate V: match the chosen location to its venue row's per-hour cost (case-insensitive)
  const loc = val('c-location');
  const norm = s => String(s || '').toLowerCase().trim();
  const venue = (DATA.venues || []).find(x => norm(x.title) === norm(loc));
  const V = venue ? (parseFloat(venue.bestRate) || 0) : 0;

  // Multipliers: η = subject (highest among chosen), α = day, γ = time. Default 1 if unset.
  const eta   = subjects.reduce((max, s) => Math.max(max, parseFloat((m.subjects || {})[s]) || 0), 0) || 1;
  const alpha = lookup('days',  val('c-day'));   // α harder day
  const gamma = lookup('times', val('c-time'));  // γ easier time

  // --- Core rate K = γ·η·α·λ·μ ; Client = K + Kβ(n−1) + V ---
  const K = gamma * eta * alpha * lam * mu;
  const baseFirst = K;                  // first student
  const baseExtra = K * beta * (n - 1); // extra students
  const perHour = baseFirst + baseExtra + V;

  const hoursPerWeek = 2;
  const total = perHour * hoursPerWeek * weeks;

  // Client-facing breakdown lines
  const lines = [
    { label: `Tuition (1 student)`, amount: baseFirst, cls: 'c-base' },
    n > 1 ? { label: `Extra students (×${n - 1})`, amount: baseExtra, cls: 'c-qty' } : null,
    V ? { label: `Venue (${esc(loc)})`, amount: V, cls: 'c-service' } : null,
  ].filter(Boolean);

  // Adjustment badges: show day (α) and time (γ) as % when not neutral
  const adjustments = [
    { label: 'Day',  value: val('c-day'),  mult: alpha, cls: 'c-day' },
    { label: 'Time', value: val('c-time'), mult: gamma, cls: 'c-time' },
    { label: 'Subject', value: subjects.join(', '), mult: eta, cls: 'c-level' },
  ].filter(a => a.value && a.mult !== 1);

  // --- Internal profit (hidden): K(1 + β(n−1)) − Kε(1 − β(n−1))  (V cancels) ---
  const profitPerHour = K * (1 + beta * (n - 1)) - K * eps * (1 - beta * (n - 1));
  const profitTotal = profitPerHour * hoursPerWeek * weeks;

  return {
    perHour, total: total.toFixed(2), weeks, n, V, eta, alpha, gamma, lines, adjustments,
    baseFirst, baseExtra, perStudentStep: K * beta,  // £ each extra student adds per hour
    profitPerHour, profitTotal: profitTotal.toFixed(2),
    summary: { service: val('c-service'), level: val('c-level'), subject: subjects.join(', '), location: loc, day: val('c-day'), time: val('c-time'), students: n, interval: val('c-interval'), weeks }
  };
}

function calc() {
  const q = quote();
  if ($('total')) $('total').textContent = q.total;

  // Superscript next to student count: cumulative extra £/h for the added students (+3, +6, ...)
  if ($('qty-sup')) {
    const extra = Math.round(q.perStudentStep * (q.n - 1));
    $('qty-sup').textContent = q.n > 1 && extra > 0 ? `+${extra}` : '';
  }

  // Live formula: per-hour pieces summed, then × hours × weeks (client never sees T)
  if ($('calc-formula')) {
    const pieces = q.lines.map(l => `<span class="${l.cls}">£${l.amount.toFixed(2)}</span>`).join(' + ');
    $('calc-formula').innerHTML = `( ${pieces} ) <span class="c-base">× 2h × ${q.weeks}wk</span>`;
  }
  // Show the formula text straight from the sheet, so the displayed rule always matches the source
  const fSrc = $('formula-source'), ftext = (DATA.constants || {}).clientFormula;
  if (fSrc && ftext) fSrc.textContent = `(${ftext})`;

  // Receipt: per-hour line items + adjustment badges + total
  if ($('calc-receipt')) {
    const lineRows = q.lines.map(l =>
      `<div class="receipt-row">
        <span class="receipt-label">${l.label}</span>
        <span class="receipt-pct ${l.cls}">£${l.amount.toFixed(2)}/h</span>
      </div>`).join('');

    const adjRows = q.adjustments.map(a =>
      `<div class="receipt-row">
        <span class="receipt-label">${esc(a.label)}: <b>${esc(a.value)}</b></span>
        <span class="receipt-pct ${a.cls}">${pct(a.mult)}</span>
      </div>`).join('');

    const meta = `<div class="receipt-row">
        <span class="receipt-label">Duration</span>
        <span class="receipt-pct c-base">2h × ${q.weeks} weeks</span>
      </div>`;

    $('calc-receipt').innerHTML = lineRows + adjRows + meta
      + `<div class="receipt-row receipt-total"><span>Total</span><span>£${q.total}</span></div>`;
  }
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
    text: x => (x.rawName + ' ' + (x.location||'')),
    fields: {
      year:     { label: 'Year',     opts: () => uniq(GALLERY_POSTS.map(p => p.year)).sort().reverse(), match: (x,v) => norm(x.year) === v },
      location: { label: 'Location', opts: () => uniq(GALLERY_POSTS.map(p => p.location)), match: (x,v) => norm(x.location) === v },
    }
  },
  tool: {
    target: 'checklist-content',
    source: () => checklistItems(),
    // Calculator card always first, then the filtered checklist band cards
    render: items => { html('checklist-content',
      tpl.calcToolCard() + tpl.notepadCard() + (items.length ? items.map(tpl.checklistBandCard).join('')
        : '<div class="card"><p class="muted">No topics match.</p></div>')); initMiniCalc(); },
    text: x => (x.subject + ' ' + x.bandLabel + ' ' + x.topics.join(' ')),
    fields: {
      subject: { label: 'Subject', opts: () => Object.keys(DATA.dropdowns?.checklists || {}), match: (x,v) => norm(x.subject) === v },
      level:   { label: 'Level',   opts: () => uniq(checklistItems().map(i => i.bandLabel)), match: (x,v) => norm(x.bandLabel) === v },
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
// When 'Home' is the location, the kid count minimum jumps to 4 (max is always 4)
function enforceHomeRule() {
  const qty = $('c-qty');
  if (!qty) return;
  const home = isHome(val('c-location'));
  qty.min = home ? 4 : 1;
  if (home && (parseInt(qty.value) || 0) < 4) qty.value = 4;
  const note = $('home-note');
  if (note) note.classList.toggle('hidden', !home);
}

['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
  const id = e.target.id;
  if (id === 'c-interval' || id === 'c-day') syncWeeks();
  if (id === 'c-location' || id === 'c-qty') enforceHomeRule();
  if (e.target.closest('#new-job')) calc();

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
  if (t.id === 'book-btn') {
    if (!USER) { $('go-login-btn')?.click(); return; }
    const q = quote();
    if (isHome(q.summary.location) && q.summary.students < 4) {
      t.textContent = 'Home lessons need 4 students';
      setTimeout(() => t.textContent = 'Lock in & Book', 2500);
      return;
    }
    // Compute the actual session dates (every chosen-day occurrence until term end) to store in the sheet
    const sel = $('c-interval');
    const endDate = sel?.options[sel.selectedIndex]?.dataset.end || '';
    const dates = computeSessionDates(q.summary.day, endDate).map(fmtDate);
    const chosenTutor = val('c-tutor');   // '' = No preference
    const booking = { ...q.summary, price: q.total, profit: q.profitTotal,
      clientName: USER.name, clientContact: USER.role || '', dates: dates.join(', '),
      requestedTutor: chosenTutor };
    // Go to Stripe checkout; the job is created only after payment succeeds (on return).
    t.textContent = 'Redirecting to payment...';
    t.disabled = true;
    fetch(API, { method: 'POST', body: JSON.stringify({ action: 'createCheckout', ...booking }) })
      .then(r => r.json())
      .then(d => {
        if (d.url) { window.location.href = d.url; }       // → Stripe checkout page
        else { t.textContent = d.error || 'Payment error'; t.disabled = false; }
      })
      .catch(() => { t.textContent = 'Connection error'; t.disabled = false; });
  }

  // Client requests to join an existing class (takes an empty slot)
  if (t.classList.contains('join-job-btn')) {
    if (!USER) { $('go-login-btn')?.click(); return; }
    const jobId = t.dataset.job;
    post({ action: 'joinJob', jobId, clientName: USER.name }, t, '✅ Requested');
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

  // Save notepad
  if (t.id === 'save-notepad-btn') {
    if (!USER) return;
    const notes = $('notepad-text').value;
    post({ action: 'saveNotepad', name: USER.name, notepad: notes }, t, '✅ Saved');
    USER.notepad = notes;
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

  // Kid/tutor saves their checklist → three independent lists (tick1/tick2/tick3 columns)
  if (t.id === 'save-topics-btn' || t.classList.contains('save-topics-btn')) {
    if (!canTrack()) { t.textContent = 'Log in as a student or tutor to save'; setTimeout(() => t.textContent = 'Save', 1800); return; }
    // Start from existing state (so topics filtered off-screen aren't lost)
    const map = parseProgress();
    const setFlag = (cls, flag) => document.querySelectorAll(cls).forEach(cb => {
      const k = cb.dataset.topic.toLowerCase();
      map[k] = map[k] || { t1:false, t2:false, t3:false };
      map[k][flag] = cb.checked;
    });
    setFlag('.cb-tick1', 't1'); setFlag('.cb-tick2', 't2'); setFlag('.cb-tick3', 't3');
    // Build the three comma lists (original-case topic names come from the checkbox text isn't stored,
    // so we use the lowercased key; topics are matched case-insensitively on read)
    const listFor = flag => Object.entries(map).filter(([,v]) => v[flag]).map(([k]) => k).join(', ');
    const tick1 = listFor('t1'), tick2 = listFor('t2'), tick3 = listFor('t3');
    post({ action: 'saveTopics', name: USER.name, tick1, tick2, tick3 }, t, '✅ Saved');
    USER.tick1 = tick1; USER.tick2 = tick2; USER.tick3 = tick3;
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
        USER = { name: d.name, role: (d.role || 'parent').toLowerCase(), kids: d.kids || [], parent: d.parent || '', profile: d.profile || null, topics: d.topics || '', friends: d.friends || '', handle: d.handle || '', highscore: d.highscore || 0, tick1: d.tick1 || '', tick2: d.tick2 || '', tick3: d.tick3 || '', notepad: d.notepad || '' };
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
    renderClasses();                      // access card reverts to login; clears highlighting
    renderCards('tutors', DATA.tutors);   // People: drop friend cards/edit buttons
    renderChecklist();                    // Checklist: back to default view
    renderArcade();                       // Arcade: drop personal best display
    renderCheckout();
  }

  // Custom multi-select dropdowns
  if (t.closest('#subject-display') || t.closest('#dash-topic-display')) {
    t.closest('.custom-select-wrapper').querySelector('.custom-dropdown').classList.toggle('hidden');
  } else if (!t.closest('.custom-select-wrapper')) {
    document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.add('hidden'));
  }

  // Checkbox sync
  const cbMap = { 'subj-cb': ['subject-display', 'Select Subjects ⌄'], 'dash-topic-cb': ['dash-topic-display', 'Select Topics ⌄'] };
  for (const [cls, [displayId, def]] of Object.entries(cbMap)) {
    if (t.classList.contains(cls)) {
      const checked = Array.from(document.querySelectorAll(`.${cls}:checked`)).map(cb => cb.value);
      if ($(displayId)) $(displayId).textContent = checked.length ? checked.join(', ') + ' ⌄' : def;
      if (cls === 'subj-cb') calc();
    }
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
