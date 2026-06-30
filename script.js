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
const html = (el, content) => { if ($(el)) $(el).innerHTML = content; };
const tog = (el, force) => $(el)?.classList.toggle('hidden', force);
const drive = url => { const m = (url||'').match(/\/d\/([\w-]+)/); return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w400` : url; };
const empty = (arr, msg) => arr?.length ? arr.map : () => `<p class="muted">${msg}</p>`;

/* ---------- INIT ---------- */
async function init() {
  try {
    DATA = await (await fetch(API)).json();
    if (DATA.error) throw new Error(DATA.error);
    renderCards('tutors', DATA.tutors);
    renderCards('venues', DATA.venues);
    renderClasses();
    renderLinks();
    renderChecklist();
    renderArcade();
    renderGallery(DATA.gallery);
    fillDropdowns();
    initIntervals();
    verifyFormula();
    ['tutor','venue','class','link'].forEach(renderFilterBar);
    calc();
  } catch (e) {
    html('loader', `<h1 style="color:red">Error</h1><p class="muted">${esc(e.message)}</p>`);
    return;
  }
  $('loader').style.display = 'none';
}

/* ---------- TEMPLATES ---------- */
const tpl = {
  tag: t => `<span class="tag">${esc(t)}</span>`,
  // Standard rectangular-label row: takes a list of strings, drops empties, renders .tag boxes
  // in the shared .attr-tags flex row. Used by every card so labels look identical everywhere.
  tagRow: (items, extra = '') => {
    const tags = (items || []).filter(Boolean).map(t => `<span class="tag">${esc(t)}</span>`).join('');
    return (tags || extra) ? `<div class="attr-tags">${tags}${extra}</div>` : '';
  },
  img: (src, style = '') => src ? `<img src="${drive(src)}" alt=""${style ? ` style="${style}"` : ''}>` : '',

  actionBtn: it => it.link
    ? `<a href="${esc(it.link)}" target="_blank" style="text-decoration:none;width:100%"><button class="action" style="width:100%">${esc(it.actionText || 'Book Session')}</button></a>`
    : it.mediaUrl
      ? `<button class="action" data-video="${esc(it.mediaUrl)}" data-title="${esc(it.title)}">${esc(it.actionText || 'View')}</button>`
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
    return `<div class="card${isOwn ? ' own-profile' : ''}" data-card-id="${it.id}">
    ${isOwn ? `<button class="edit-profile-btn" title="Edit your profile">✎ Edit</button>` : ''}
    ${tpl.img(it.image)}
    <h3>${esc(it.title)}</h3>
    <p class="sub">${esc(it.subtitle)}</p>
    <p class="desc">${esc(it.description)}</p>
    ${tpl.tagRow(it.tags)}
    ${tpl.schedule(it.hours)}
    ${tpl.actionBtn(it)}
  </div>`;
  },

  // A single friend's card (shows their level, checklist progress, and arcade high score)
  friendCard: (s) => {
    const menuTotal = (DATA.dropdowns?.topics || []).length;
    const done = String(s.topics || '').split(',').map(x => x.trim()).filter(Boolean).length;
    const pct = menuTotal ? Math.round(done / menuTotal * 100) : 0;
    const lvl = levelInfo(s.topics);
    return `<div class="card" style="text-align:left">
      <button class="remove-friend-btn" data-handle="${esc(s.handle)}" title="Remove">✕</button>
      <h3>${esc(s.name)} <span class="lb-lvl">Lv ${lvl.level}</span></h3>
      <p class="sub">${esc(s.handle)}</p>
      <div class="friend-bar"><div class="friend-bar-fill" style="width:${pct}%"></div></div>
      ${tpl.tagRow([`${done}/${menuTotal} topics`, `🎮 ${s.highscore || 0}`])}
    </div>`;
  },

  // Arcade game card (Flappy-style canvas)
  gameCard: () => `<div class="card" style="text-align:center">
    <h3 class="gold" style="margin-bottom:8px">Flappy Maths</h3>
    <p class="muted" style="font-size:var(--fs-xs);margin:0 0 10px">Tap / click / space to flap. Avoid the pipes!</p>
    <canvas id="flappy-canvas" width="280" height="360" style="width:100%;max-width:280px;background:#0a0a0a;border:1px solid var(--border);border-radius:8px;cursor:pointer"></canvas>
    <p style="margin:10px 0 0">Score: <b id="flappy-score" style="color:#fff">0</b>${USER && USER.role === 'kid' ? ` · Best: <b id="flappy-best" style="color:var(--gold)">${USER.highscore || 0}</b>` : ''}</p>
    <p id="flappy-msg" class="muted" style="font-size:var(--fs-xs);min-height:14px;margin-top:6px">Click the game to start</p>
  </div>`,

  // Kid's checklist: ONE CARD PER GRADE (each its own card in the grid)
  checklistCard: (topicsStr = '') => {
    const have = String(topicsStr || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const byGrade = DATA.dropdowns?.topicsByGrade || {};
    const allTopics = DATA.dropdowns?.topics || [];
    const grades = Object.keys(byGrade).sort((a, b) => +a - +b);

    const cb = t => {
      const checked = have.includes(t.toLowerCase()) ? 'checked' : '';
      return `<label class="check-item"><input type="checkbox" class="topic-cb" value="${esc(t)}" ${checked}> ${esc(t)}</label>`;
    };

    if (!grades.length) {
      return allTopics.length
        ? `<div class="card" style="text-align:left"><h3 class="gold">Maths Topics</h3>
            <div class="check-list">${allTopics.map(cb).join('')}</div>
            <button id="save-topics-btn" class="action" style="width:100%;margin-top:14px">Save Checklist</button></div>`
        : '<div class="card"><p class="muted">No topics set up yet.</p></div>';
    }

    // One card per grade; any card's Save button saves the whole checklist
    return grades.map(gr => {
      const topics = byGrade[gr];
      const done = topics.filter(t => have.includes(t.toLowerCase())).length;
      const pct = Math.round(done / topics.length * 100);
      return `<div class="card grade-card" style="text-align:left">
        <h3 class="gold" style="margin-bottom:4px">Grade ${esc(gr)}</h3>
        <p class="muted" style="font-size:var(--fs-xs);margin:0 0 8px">${done}/${topics.length} done</p>
        <div class="friend-bar"><div class="friend-bar-fill" style="width:${pct}%"></div></div>
        <div class="check-list" style="margin-top:10px">${topics.map(cb).join('')}</div>
        <button class="action save-topics-btn" style="width:100%;margin-top:12px">Save</button>
      </div>`;
    }).join('');
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
      <button id="save-profile-btn" class="action" style="flex:1">Save</button>
      <button id="cancel-profile-btn" class="ghost" style="padding:11px">Cancel</button>
    </div>
  </div>`,

  jobCard: (j, isDash = false, state = '') => {
    const full = j.spotsLeft <= 0;
    const mine = state === 'confirmed';
    const pending = state === 'pending';
    const chatBox = isDash ? `
      <div class="chat-box" style="margin-top:15px;border-top:1px dashed var(--border);padding-top:10px;text-align:left">
        <p class="muted" style="font-size:var(--fs-sm);margin-bottom:8px"><strong>Latest update:</strong> <span class="chat-text">${esc(j.chat) || 'No messages yet.'}</span></p>
        <div style="display:flex;gap:5px">
          <input type="text" id="chat-input-${j.id}" placeholder="Type reply..." style="flex:1;padding:8px;font-size:var(--fs-sm)">
          <button class="action send-chat-btn" data-job="${j.id}" style="margin:0;padding:8px 15px;width:auto">Reply</button>
        </div>
      </div>` : '';
    // Tutors see who's in the class (the family/children)
    const tutorTag = (state && USER && USER.role === 'tutor' && j.clients)
      ? `<span class="tag">👪 ${esc(j.clients)}</span>` : '';
    const stateBadge = mine ? `<span class="badge mine-badge">Yours</span>`
      : pending ? `<span class="badge pending-badge">Pending</span>` : '';
    const attrRow = tpl.tagRow([
      j.level ? `Level: ${j.level}` : '',
      j.subject || '',
      `📍 ${j.location || 'Online'}`,
      fmtWeeks(j.weeks) ? `${fmtWeeks(j.weeks)} wks` : '',
    ], tutorTag);

    // Action area: tutor with a pending request gets Accept/Reject; otherwise normal Book/Full
    let action = '';
    if (pending && USER && USER.role === 'tutor') {
      action = `<div style="display:flex;gap:8px;margin-top:12px">
        <button class="action accept-job-btn" data-job="${j.id}">Accept</button>
        <button class="ghost reject-job-btn" data-job="${j.id}" style="margin:0;padding:11px">Decline</button>
      </div>`;
    } else if (!isDash) {
      action = `<button class="action" ${full ? 'disabled' : ''}>${full ? 'Full' : 'Book Now'}</button>`;
    }

    const cls = mine ? 'mine-class' : pending ? 'pending-class' : '';
    return `<div class="card ${cls}">
      ${stateBadge}
      <h3>${esc(j.title) || 'Session'}</h3>
      <p class="sub">${esc(fmtDay(j.day))} @ ${esc(fmtTime(j.time) || 'TBD')}</p>
      <p class="cap">👥 ${esc(j.capacity)}</p>
      ${attrRow}
      ${action}
      ${chatBox}
    </div>`;
  },

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
    // location + date via the shared tagRow; #tags/@mentions appended with their blue accent
    const hashtags = tokens.map(tk => `<span class="tag tag-social">${esc(tk)}</span>`).join('');
    const tagRow = tpl.tagRow([
      post.location ? `📍 ${post.location}` : '',
      post.label ? `🗓 ${post.label}` : '',
    ], hashtags);
    return `<div class="card social-post">
      <div class="social-header">
        <div class="social-avatar">@</div>
        <span class="social-username">@family.</span>
        <button data-share-url="https://drive.google.com/file/d/${post.id}/view" class="social-share-btn">⎘</button>
      </div>
      <img class="social-img" src="https://drive.google.com/thumbnail?id=${post.id}&sz=w800" alt="Gallery Post" loading="lazy">
      <div class="social-body">
        ${caption ? `<p class="desc" style="margin:0 0 8px">${esc(caption)}</p>` : ''}
        ${tagRow}
      </div>
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
      on <select id="c-day" class="pick"></select>.
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
  // In the People section, a logged-in kid also sees a friend search + their friend cards
  if (id === 'tutors' && USER && USER.role === 'kid') {
    const norm = s => String(s || '').toLowerCase().trim();
    const handles = friendHandles().map(norm);
    const friends = (DATA.students || []).filter(s => handles.includes(norm(s.handle)));
    const friendCards = friends.map(tpl.friendCard).join('');
    cardsHtml += `<div class="card friend-search-card" style="text-align:left">
        <h3 class="gold" style="margin-bottom:8px">Add a Friend</h3>
        <input id="friend-search" class="edit-input" placeholder="Exact name e.g. LuccaD" style="margin-bottom:8px">
        <button id="add-friend-btn" class="action" style="width:100%">Add Friend</button>
        <p id="friend-msg" class="muted" style="font-size:var(--fs-xs);min-height:14px;margin-top:8px"></p>
      </div>` + friendCards;
  }
  html(id, cardsHtml);
}

function renderClasses(items = DATA.clientClasses || []) {
  // Logged-in user's own classes (confirmed or pending) float to the top
  const rank = j => classState(j) ? 1 : 0;
  const sorted = [...items].sort((a, b) => rank(b) - rank(a));
  const cards = sorted.map(j => tpl.jobCard(j, false, classState(j))).join('');
  html('classes', tpl.builderCard() + cards);
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
    return status === 'confirmed' ? 'confirmed' : 'pending';  // requested but not yet accepted = grey
  }
  // Parent/kid: their family's classes
  const owner = norm(j.clients);
  const isMine = USER.role === 'kid' ? owner === norm(USER.parent) : owner === norm(USER.name);
  if (!isMine) return '';
  return status === 'pending' ? 'pending' : 'confirmed';
}

// Back-compat boolean (used by onLogin filter)
function isMyClass(j) { return classState(j) !== ''; }

// After a successful login: greet by role, surface the user's classes at the top of the live list (blue)
function onLogin() {
  renderCheckout();
  tog('login-section', true);
  tog('dashboard-section', false);

  const roleLabel = { tutor: 'Tutor', parent: 'Parent', kid: 'Student' }[USER.role] || 'Member';
  $('dash-greeting').textContent = `Welcome back, ${USER.name} (${roleLabel})`;

  if (USER.role === 'tutor') {
    html('dash-content', `<p class="muted">Your profile card in People has an ✎ Edit button. Your classes appear highlighted in Open Classes.</p>`);
  } else if (USER.role === 'kid') {
    html('dash-content', `<p class="muted">Your checklist and friends are in the Maths Checklist and People sections. Your classes appear highlighted in Open Classes.</p>`);
  } else {
    html('dash-content', `<p class="muted">Your family's classes appear highlighted at the top of Open Classes.</p>`);
  }

  // Render the always-present sections with login-aware content
  renderCards('tutors', DATA.tutors);  // People: tutors (+ kid's friends if applicable)
  renderChecklist();                   // Checklist section
  renderArcade();                      // Arcade game
  renderClasses();                     // Open Classes (user's float to top, blue)
  $('classes').closest('section').classList.remove('hidden');
  $('classes').closest('section').scrollIntoView({ behavior: 'smooth' });
}

// Maths Checklist section: always the same grade cards. A logged-in kid's saved topics
// pre-tick their boxes (and they can save); for anyone else the boxes are simply unticked.
function renderChecklist() {
  const el = $('checklist-content');
  if (!el) return;
  const myTopics = (USER && USER.role === 'kid') ? USER.topics : '';
  el.innerHTML = tpl.checklistCard(myTopics);
}

// Progression: level from number of topics ticked (every 5 topics = +1 level)
const TOPICS_PER_LEVEL = 5;
function topicCount(topicsStr) { return String(topicsStr || '').split(',').map(s => s.trim()).filter(Boolean).length; }
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
    // Save score if a logged-in kid
    if (USER && USER.role === 'kid') {
      const prev = USER.highscore || 0;
      if (S.score > prev) {
        USER.highscore = S.score;
        if ($('flappy-best')) $('flappy-best').textContent = S.score;
        fetch(API, { method:'POST', body: JSON.stringify({ action:'saveScore', name: USER.name, score: S.score }) })
          .then(() => { const me = (DATA.students||[]).find(s => String(s.handle).toLowerCase() === String(USER.handle).toLowerCase()); if (me) me.highscore = S.score; if (USER.role === 'kid') renderCards('tutors', DATA.tutors); });
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
       <button id="book-btn" style="margin-top:5px">Lock in &amp; Book</button>`
    : `<p class="muted" style="font-size:var(--fs-sm);margin:0">Log in to book a session.</p>
       <button id="go-login-btn" class="action">Log in to Book</button>`;
}

function renderLinks(items = DATA.links || []) {
  if (!items.length) { html('links', '<p class="muted">No links found.</p>'); return; }
  // Group by category, preserving first-seen order
  const groups = {};
  items.forEach(l => { const c = l.category || 'General'; (groups[c] = groups[c] || []).push(l); });
  html('links', Object.entries(groups).map(([cat, links]) => tpl.linkGroupCard(cat, links)).join(''));
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
      <button class="filter-remove" data-prefix="${prefix}" data-field="${field}" title="Remove filter">×</button>
    </span>`;
  }).join('');

  const addChip = available.length
    ? `<span class="filter-add-wrap">
        <button class="filter-add" data-prefix="${prefix}">+ Filter</button>
        <span class="filter-add-menu hidden" id="${prefix}-add-menu">
          ${available.map(f => `<button class="filter-add-opt" data-prefix="${prefix}" data-field="${f}">${esc(def.fields[f].label)}</button>`).join('')}
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

document.addEventListener('click', e => {
  const t = e.target;

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
    $('login-section').scrollIntoView({ behavior: 'smooth' });
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
    post({ action: 'createJob', ...q.summary, price: q.total, profit: q.profitTotal, clientName: USER.name, clientContact: USER.role || '' }, t, '✅ Booked!');
  }

  // Chat reply
  if (t.classList.contains('send-chat-btn')) {
    const jobId = t.dataset.job;
    const input = $(`chat-input-${jobId}`);
    const message = input.value.trim();
    if (!message) return;
    const msg = `Me: ${message}`;
    post({ action: 'sendChat', jobId, message: msg }, t, 'Sent!');
    t.closest('.chat-box').querySelector('.chat-text').textContent = msg;
    input.value = '';
  }

  // Tutor accepts a pending requested job → turns blue
  if (t.classList.contains('accept-job-btn')) {
    const jobId = t.dataset.job;
    post({ action: 'acceptJob', jobId }, t, '✅ Accepted');
    // Optimistically update local state and re-render
    const job = (DATA.clientClasses || []).find(j => String(j.id) === String(jobId));
    if (job) { job.status = 'confirmed'; setTimeout(() => renderClasses(), 600); }
  }

  // Tutor declines a pending requested job → reopens to others
  if (t.classList.contains('reject-job-btn')) {
    const jobId = t.dataset.job;
    post({ action: 'rejectJob', jobId }, t, 'Declined');
    const job = (DATA.clientClasses || []).find(j => String(j.id) === String(jobId));
    if (job) { job.status = 'active'; job.requestedTutor = ''; setTimeout(() => renderClasses(), 600); }
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

  // Kid saves their checklist (ticked topics → comma-separated topics cell)
  if (t.id === 'save-topics-btn' || t.classList.contains('save-topics-btn')) {
    if (!USER || USER.role !== 'kid') { t.textContent = 'Log in as a student to save'; setTimeout(() => t.textContent = 'Save', 1800); return; }
    // Read ticks across ALL grade cards (the whole checklist), not just this card
    const ticked = Array.from(document.querySelectorAll('.topic-cb:checked')).map(cb => cb.value);
    const topicsStr = ticked.join(', ');
    post({ action: 'saveTopics', name: USER.name, topics: topicsStr }, t, '✅ Saved');
    USER.topics = topicsStr;
    setTimeout(() => renderChecklist(), 700);
    return;
  }

  // Tutor saves their edited profile
  // Tutor clicks Edit on their own Team card → swap that card to edit mode in place
  if (t.classList.contains('edit-profile-btn')) {
    const card = t.closest('.card');
    if (card) card.outerHTML = tpl.profileEditCard(USER.profile || {});
    return;
  }
  // Cancel editing → restore the normal Team section
  if (t.id === 'cancel-profile-btn') {
    applyFilter('tutor');
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
    // Update the live tutor record so the re-rendered card shows the new values immediately
    const norm = s => String(s || '').toLowerCase().trim();
    const me = (DATA.tutors || []).find(x => norm(x.title) === norm(USER.name));
    if (me) {
      me.description = profile.description ? `"${profile.description}"` : '';
      me.tags = [profile.adjective_1, profile.adjective_2, profile.adjective_3].filter(Boolean);
      me.image = profile.photo;
      me.mediaUrl = profile.video;
      me.subtitle = `📍 ${profile.location || 'London'}`;
    }
    setTimeout(() => applyFilter('tutor'), 700);
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
        USER = { name: d.name, role: (d.role || 'parent').toLowerCase(), kids: d.kids || [], parent: d.parent || '', profile: d.profile || null, topics: d.topics || '', friends: d.friends || '', handle: d.handle || '', highscore: d.highscore || 0 };
        $('auth-pin').value = '';
        onLogin();
      })
      .catch(() => { t.textContent = 'Enter'; t.disabled = false; $('auth-msg').textContent = 'Connection error.'; });
  }

  // Logout
  if (t.id === 'logout-btn') {
    USER = null;
    renderCheckout();
    tog('dashboard-section', true);
    tog('login-section', false);
    $('classes').closest('section').classList.remove('hidden');
    renderClasses();                      // clear role highlighting
    renderCards('tutors', DATA.tutors);   // People: drop friend cards/edit buttons
    renderChecklist();                    // Checklist: back to default view
    renderArcade();                       // Arcade: drop personal best display
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
