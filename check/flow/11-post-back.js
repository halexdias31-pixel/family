check('the camera asks for nothing until somebody swipes up to it', async () => {
  const bad = [];
  const pat = { name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] };

  /* ---------- SIGNED IN, NO FESTIVE CARD: THE ONE THAT WAS REPORTED ---------------------------- */
  {
    const b = camBoot_({ user: pat });
    await wait(400);
    if (!b.w.__t || typeof b.w.feedCamAt_ !== 'function') {
      return ['the app did not load, so the camera was NOT checked — not a pass'];
    }
    if (!b.w.document.getElementById('cam-view')) {
      return ['no viewfinder was drawn for somebody signed in, so there was nothing to catch starting — not a pass'];
    }
    if (b.at() !== 'feed') bad.push(`the app opened on ${b.at()}, not the feed, so this was not the first load reported`);
    if (b.gum.asks) {
      bad.push(`opening the app asked for the camera ${b.gum.asks} time(s) — it is one swipe UP from the front door and nobody swiped`);
    }
    if (b.page() !== b.cam() + 1) bad.push(`the feed opened on page ${b.page()}, not the newest post at ${b.cam() + 1}`);
    const before = b.gum.asks;
    b.w.__t.repaint(); await wait(CAM_SLIDE); await woken_();
    if (b.gum.asks !== before) bad.push('a repaint on the front door asked for the camera');

    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.asks === before + 1);
    if (b.gum.asks !== before + 1) bad.push(`swiping up to the camera asked ${b.gum.asks - before} time(s), not once`);
    if (b.gum.open !== 1) bad.push(`swiping up to the camera left ${b.gum.open} stream(s) open, not one`);
    b.w.__t.goPage('feed', b.cam() + 1); await wait(CAM_SLIDE); await woken_();
    if (b.gum.live()) bad.push('swiping back down to the newest post left the camera looking');
    /* PARKED, NOT STOPPED (427): a stop makes the next swipe a new getUserMedia, which an iPhone asks about every time. */
    if (b.gum.open !== 1) bad.push(`swiping back down to the newest post left ${b.gum.open} stream(s) open, not the one parked`);
    if (b.w.localStorage.getItem('family:cam') !== 'granted') bad.push('a granted camera was not remembered on the device');

    /* AWAY AND BACK, ON A POST: the column remembers where it was, and that is not the camera. */
    b.w.__t.go('stuff'); await wait(CAM_SLIDE); await woken_();
    b.w.__t.go('feed'); await wait(CAM_SLIDE); await woken_();
    if (b.gum.asks !== before + 1) bad.push('coming back to the feed on the newest post asked for the camera again');

    /* AWAY AND BACK, ON THE CAMERA PAGE: that IS arriving at it, and it starts — the camera has
       started on arrival rather than on a tap since the note over `camStart_` was written. */
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.live() === 1);
    if (b.gum.asks !== before + 1) bad.push(`swiping back up to the camera asked again (${b.gum.asks - before} asks) — the answer was yes and the stream was kept`);
    if (b.gum.live() !== 1) bad.push('swiping back up to the camera did not switch the kept stream back on');
    b.w.__t.go('stuff'); await wait(CAM_SLIDE); await woken_();
    if (b.gum.live()) bad.push('leaving the feed from the camera page left the camera looking');
    b.w.__t.go('feed'); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.live() === 1);
    if (b.gum.asks !== before + 1) bad.push(`coming back to the feed on the camera page asked ${b.gum.asks - before - 1} more time(s) — it should wake the kept stream`);
    if (b.gum.open !== 1 || b.gum.live() !== 1) bad.push(`coming back to the camera page left ${b.gum.open} stream(s) open and ${b.gum.live()} looking, not one`);
    const shoot = b.w.document.getElementById('cam-shoot');
    if (!shoot || shoot.disabled) bad.push('the woken camera left the shutter greyed');
    /* THE PAGE GOING LETS IT GO FOR REAL. */
    b.w.dispatchEvent(new b.w.Event('pagehide')); await wait(50);
    if (b.gum.open) bad.push(`the page going left ${b.gum.open} stream(s) open`);
  }

  /* ---------- SIGNED OUT ------------------------------------------------------------------------ */
  {
    const b = camBoot_({});
    await wait(400);
    if (b.gum.asks) bad.push('signed out, opening the app asked for the camera');
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_();
    if (b.gum.asks) bad.push('signed out, the camera page asked for a camera it draws no viewfinder for');
  }

  /* ---------- REFUSED, THEN A REPAINT § */
  {
    const b = camBoot_({ user: pat, refuse: true });
    await wait(400);
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.asks === 1);
    if (b.gum.asks !== 1) bad.push(`refused: swiping up asked ${b.gum.asks} time(s), not once`);
    b.w.__t.repaint(); await wait(CAM_SLIDE); await woken_();
    if (b.gum.asks !== 1) bad.push('refused: a repaint on the camera page asked again — a prompt nobody swiped for');
    const on = b.w.document.getElementById('cam-on');
    if (!on || on.hidden) bad.push('refused: after a repaint the card has no `Try the camera again`');
    const said = (b.w.document.getElementById('cam-said') || {}).textContent || '';
    if (!said.trim()) bad.push('refused: after a repaint the card no longer says why the camera did not start');
    if (b.w.localStorage.getItem('family:cam') !== 'refused') bad.push('refused: the refusal was not remembered on the device');
    if (on) { b.w.__t.ACTIONS['cam-on'](on); await wait(50); }
    if (b.gum.asks !== 2) bad.push('refused: `Try the camera again` did not ask again');
    /* A NO IS KEPT (427): swiping away and back is not somebody asking, only the retry is. */
    b.w.__t.goPage('feed', b.cam() + 1); await wait(CAM_SLIDE); await woken_();
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await wait(300);
    if (b.gum.asks !== 2) bad.push(`refused: swiping down and back up asked again (${b.gum.asks} asks) — a no is remembered`);
    const on2 = b.w.document.getElementById('cam-on');
    if (!on2 || on2.hidden) bad.push('refused: back on the camera page there is no `Try the camera again`');
  }

  /* ---------- A REFUSAL SURVIVES A RELOAD, AND THE RETRY IS THE ONLY WAY PAST IT (427) ---------- */
  {
    const b = camBoot_({ user: pat, store: { 'family:cam': 'refused' } });
    await wait(400);
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await wait(300);
    if (b.gum.asks) bad.push(`reloaded after a refusal: swiping up asked ${b.gum.asks} time(s), not none`);
    const off = (b.w.document.getElementById('cam-off') || {}).textContent || '';
    if (!/did not start/.test(off)) bad.push('reloaded after a refusal: the viewfinder does not say the camera did not start');
    const on = b.w.document.getElementById('cam-on');
    if (!on || on.hidden) bad.push('reloaded after a refusal: no `Try the camera again`');
    if (on) { b.w.__t.ACTIONS['cam-on'](on); await camAsked_(() => b.gum.open === 1); }
    if (b.gum.asks !== 1) bad.push(`reloaded after a refusal: \`Try the camera again\` asked ${b.gum.asks} time(s), not once`);
    if (b.gum.open !== 1) bad.push('reloaded after a refusal: the retry was granted and no stream opened');
    if (b.w.localStorage.getItem('family:cam') !== 'granted') bad.push('reloaded after a refusal: the granted retry did not replace the kept no');
  }

  /* ---------- THE BROWSER'S OWN ANSWER, WHERE IT GIVES ONE ---------------------------------------- */
  {
    const b = camBoot_({ user: pat, perm: 'denied' });
    await wait(400);
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await wait(300);
    if (b.gum.asks) bad.push(`permissions say denied: swiping up asked ${b.gum.asks} time(s), not none`);
    const on = b.w.document.getElementById('cam-on');
    if (!on || on.hidden) bad.push('permissions say denied: no `Try the camera again`');
    if (on) { b.w.__t.ACTIONS['cam-on'](on); await camAsked_(() => b.gum.asks === 1); }
    if (b.gum.asks !== 1) bad.push('permissions say denied: `Try the camera again` did not ask');
  }
  {
    const b = camBoot_({ user: pat, perm: 'granted', store: { 'family:cam': 'refused' } });
    await wait(400);
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_(); await camAsked_(() => b.gum.asks === 1);
    if (b.gum.asks !== 1 || b.gum.open !== 1) bad.push(`permissions say granted: swiping up asked ${b.gum.asks} time(s) and opened ${b.gum.open}, not once each — a kept no is overruled`);
  }

  /* ---------- THE PROMPT STILL UP WHEN A REPAINT LANDS § */
  {
    const b = camBoot_({ user: pat, slow: true });
    await wait(400);
    b.w.__t.goPage('feed', b.cam()); await wait(CAM_SLIDE); await woken_();
    b.w.__t.repaint(); await wait(50);
    if (b.gum.asks !== 1) bad.push(`a repaint while the prompt was up asked again — ${b.gum.asks} asks for one card`);
    if (b.gum.hold) { b.gum.hold(); await wait(50); }
    if (b.gum.open !== 1) bad.push(`the prompt answered left ${b.gum.open} stream(s) open, not one`);
    const v = b.w.document.getElementById('cam-view');
    if (!v || !v.srcObject) bad.push('the stream granted after a repaint went to the card that was replaced, not the one on the screen');
  }
  return bad;
});

/* ---------- POST, UNDER A POST, IS A TILE — AND KEEPS ITS MARK THROUGH THE WAIT § */
check('Post under a post is a tile, and a comment keeps its mark through the wait', async () => {
  const pat = { name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] };
  const p = payload();
  p.posts = [1, 2].map(i => ({ id: 'PO' + i, author: '@family.', handle: '@family.', avatar: '',
    image: '', media: [], caption: 'Post ' + i, body: '', location: '', when: '0' + i + '/09/2026',
    at: Date.UTC(2026, 8, i), pinned: false, active: true, waiting: false, refused: false,
    reactions: NO_REACTIONS_(), comments: { total: 0, list: [] } }));
  let refuse = true;
  const { w, sent } = boot({ payload: p,
    reply: b => (b.action === 'addComment' && refuse ? { error: 'That is too long to post.' } : { success: true }),
    before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(pat)); } catch (e) {} } });
  await wait(400);
  const d = w.document, bad = [];
  w.__t.go('feed'); await wait(700);
  const form = d.querySelector('#s-feed .cmt-form');
  if (!form) return ['there is no comment composer on the feed for somebody signed in — nothing to press'];
  const post = form.closest('[data-post]'), id = post ? post.dataset.post : '';
  const ctl = [...form.querySelectorAll('button, a')];
  const loose = ctl.filter(x => !x.classList.contains('tile'));
  if (loose.length) bad.push('the comment composer still has ' + loose.length + ' control(s) that are not tiles: '
    + loose.map(x => (x.dataset.do || x.tagName) + ' "' + x.textContent.trim() + '"').join(', '));
  if (ctl.length !== 1) bad.push('the comment composer has ' + ctl.length + ' controls, wanted one — Post');
  const tile = form.querySelector('.tile[data-do="cmt-add"]');
  if (!tile) return bad.concat(['there is no cmt-add tile in the comment composer']);
  if (!tile.classList.contains('cmt-go')) bad.push('the Post tile lost the `cmt-go` name it is found by');
  if (!id || tile.dataset.id !== id) bad.push('the Post tile carries data-id ' + JSON.stringify(tile.dataset.id) + ' under post ' + JSON.stringify(id));
  if (!tile.querySelector('svg.tile-i-send')) bad.push('the Post tile has no paper aeroplane — `send` is the mark for sending');
  if (!/^Post\b/.test(tile.getAttribute('aria-label') || '')) bad.push('the Post tile is named ' + JSON.stringify(tile.getAttribute('aria-label')) + ', not "Post…"');

  const box = form.querySelector('.cmt-text');
  sent.length = 0;
  tile.click(); await wait(400);   // past the dispatcher's 350 ms (534): typing takes longer than that
  if (sent.some(b => b.action === 'addComment')) bad.push('an empty comment box posted addComment');

  box.value = 'Lovely to see this.';
  tile.click();
  if (!tile.disabled || !tile.classList.contains('is-busy')) bad.push('pressed, the Post tile is not disabled and busy while it waits');
  if (!tile.querySelector('svg.tile-i-send')) bad.push('pressed, the Post tile\'s mark was written over — the old "Posting…" swap');
  await wait(300);
  const said = form.querySelector('.cmt-said');
  if (tile.disabled || tile.classList.contains('is-busy')) bad.push('after a refusal the Post tile is still busy or disabled');
  if (!tile.querySelector('svg.tile-i-send')) bad.push('after a refusal the Post tile has no mark — the restore put text back over it');
  if (!said || !/too long/.test(said.textContent)) bad.push('the server\'s refusal is not under the box: ' + JSON.stringify(said && said.textContent));

  refuse = false;
  sent.length = 0;
  await wait(100);   // 400 ms after the refused press: a person's second go (534)
  tile.click(); await wait(300);
  const c = sent.find(b => b.action === 'addComment');
  if (!c) bad.push('pressing Post with words in the box posted ' + JSON.stringify(sent.map(b => b.action)) + ', not addComment');
  else if (c.postId !== id || c.body !== 'Lovely to see this.' || c.personId !== 'P1')
    bad.push('addComment went out as ' + JSON.stringify({ postId: c.postId, body: c.body, personId: c.personId }));
  const after = d.querySelector('#s-feed .cmt-form .tile[data-do="cmt-add"]');
  if (!after || after.classList.contains('is-busy') || !after.querySelector('svg.tile-i-send'))
    bad.push('after a comment went through, the Post tile on the screen is missing, busy, or has lost its mark');
  return bad;
});

/* ---------- A POST'S FACES, PRESSED, TAKEN BACK, AND ASKED WHO § */
check('a post\'s faces: a tap adds yours, the same tap takes it back, the total opens who reacted', async () => {
  const pat = { name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] };
  const FACES = ['👍', '❤️', '😂', '😮', '👏', '🎉'];
  const seed = () => {
    const p = payload();
    /* A PICTURE AND A CLIP, the two things a rebuilt post loses — see the last point above. */
    p.posts = [{ id: 'PO1', author: '@family.', handle: '@family.', avatar: '', image: 'data/reels/archetest.jpg',
      media: ['data/reels/archetest.jpg', 'data/reels/archetest.mp4'],
      caption: 'A Tuesday at the library', body: '', location: '', when: '01/09/2026',
      at: Date.UTC(2026, 8, 1), pinned: false, active: true, waiting: false, refused: false,
      reactions: { emoji: FACES.slice(), counts: [2, 1, 0, 0, 0, 0], total: 3, yours: '',
        /* A PARENT BY HER FIRST NAME, as `doGet` sends one to anybody but herself and an admin (342). */
        by: [{ name: 'Ada Tutor', emoji: '👍' }, { name: 'Priya', emoji: '👍' },
             { name: 'Carl', emoji: '❤️' }] },
      comments: { total: 0, list: [] } }];
    return p;
  };
  const bad = [];
  /* ONE SAVE CAN BE MADE TO FAIL, so the `.catch` undo's repaint is walked as well as the happy one. */
  let failNext = false;
  const { w, sent } = boot({ payload: seed(),
    reply: b => { if (b.action === 'reactPost' && failNext) { failNext = false; return { error: 'Could not save that' }; } },
    before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(pat)); } catch (e) {} } });
  await wait(400);
  const d = w.document;
  if (!w.__t) return ['the app did not load, so the reactions were NOT checked — not a pass'];
  w.__t.go('feed'); await wait(700); await woken_();

  const rows = () => [...d.querySelectorAll('#s-feed [data-post="PO1"] .reacts')];
  const face = e => d.querySelector(`#s-feed [data-post="PO1"] .react[data-emoji="${e}"]`);
  const count = e => { const n = face(e) && face(e).querySelector('.react-n'); return n ? n.textContent.trim() : ''; };
  const total = () => { const b = d.querySelector('#s-feed [data-post="PO1"] .post-when .react-who');
                        return b ? b.textContent.replace(/\s+/g, ' ').trim() : ''; };
  const shape = when => {
    const r = rows();
    if (r.length !== 1) { bad.push(`${when}: ${r.length} rows of faces on the post, not one`); return false; }
    const n = r[0].querySelectorAll('.react').length;
    if (n !== 6) bad.push(`${when}: the row holds ${n} faces, not the six it was sent`);
    return true;
  };
  if (!shape('drawn')) return bad.concat(['so nothing was pressed — not a pass']);
  if (total() !== '3 reactions') bad.push(`drawn, the time line says ${JSON.stringify(total())}, not "3 reactions"`);
  if (count('😂')) bad.push(`drawn, 😂 with nobody behind it shows ${JSON.stringify(count('😂'))} — a 0 is drawn as nothing`);
  if (d.querySelector('#s-feed .react.mine')) bad.push('drawn, a face is `.mine` before anybody signed in here pressed one');

  /* ---------- THE POST ITSELF, HELD BY IDENTITY THROUGH EVERY PRESS BELOW § */
  const held0 = () => {
    const art = d.querySelector('#s-feed [data-post="PO1"]');
    return { art, pane: art && art.closest('.pane'),
             media: art ? [...art.querySelectorAll('img.post-cell, img.post-pic, video')] : [] };
  };
  let kept = held0();
  if (kept.media.length !== 2) bad.push(`drawn, PO1 holds ${kept.media.length} pictures and clips, not the picture and the clip it was sent`);
  const same = when => {
    const now = held0();
    if (now.art !== kept.art) bad.push(`${when}, PO1 is a new <article> — a press on one face rebuilt the post, when only its faces and total changed`);
    else if (now.pane !== kept.pane) bad.push(`${when}, PO1's pane is a new element — a scrolled pane would be back at its top`);
    if (now.media.length !== kept.media.length || now.media.some((m, i) => m !== kept.media[i])) {
      bad.push(`${when}, PO1's picture and clip are new elements — a playing clip stops at 0:00 and a picture blanks and holds 4:5 until it is read again`);
    }
  };

  /* ---------- A TAP ADDS YOURS ------------------------------------------------------------------- */
  sent.length = 0;
  /* FOCUSED FIRST, as a keyboard, a switch or a screen reader's cursor has it when it presses. */
  face('😂').focus();
  face('😂').click(); await wait(50);
  shape('after a tap');
  const f = face('😂');
  if (!f) return bad.concat(['after a tap there is no 😂 on the post']);
  const held = () => { const a = d.activeElement;
                       return a && a.dataset && a.dataset.do === 'react' ? a.dataset.emoji : (a && a.tagName) || 'nothing'; };
  if (d.activeElement !== f) bad.push(`after Enter on a focused 😂, the focus is on ${held()} — not the 😂 that replaced it`);
  if (String(f.className).split(/\s+/)[1] !== 'mine') {
    bad.push(`after a tap, 😂 is ${JSON.stringify(f.className)} — \`mine\` must be its second class (ACCEPTED_TAP keys on it)`);
  }
  if (f.getAttribute('aria-pressed') !== 'true') bad.push(`after a tap, 😂 is aria-pressed=${JSON.stringify(f.getAttribute('aria-pressed'))}`);
  if (count('😂') !== '1') bad.push(`after a tap, 😂 counts ${JSON.stringify(count('😂'))}, not "1"`);
  if (total() !== '4 reactions') bad.push(`after a tap, the time line says ${JSON.stringify(total())}, not "4 reactions"`);
  if (!f.classList.contains('is-pop')) bad.push('after a tap, the face that landed is not marked to land (`is-pop`)');
  same('after a tap');
  const r1 = sent.find(b => b.action === 'reactPost');
  if (!r1) bad.push(`a tap on a face posted ${JSON.stringify(sent.map(b => b.action))}, not reactPost`);
  else if (r1.postId !== 'PO1' || r1.emoji !== '😂' || r1.personId !== 'P1')
    bad.push('reactPost went out as ' + JSON.stringify({ postId: r1.postId, emoji: r1.emoji, personId: r1.personId }));
  await wait(150);
  /* ONE PAINT, NOT EVERY ONE: the next redraw of the feed must not bounce the face again. */
  w.__t.repaint(); await wait(50);
  if (face('😂') && face('😂').classList.contains('is-pop')) bad.push('a later repaint landed 😂 again — `REACT_POP_` was not cleared');
  if (!face('😂') || !face('😂').classList.contains('mine')) bad.push('a later repaint lost yours');
  /* THAT REPAINT STANDS FOR A PAYLOAD LANDING, which does rebuild the post — so the elements held from
     here on are the ones it drew. */
  kept = held0();

  /* ---------- THE SAME TAP TAKES IT BACK --------------------------------------------------------- */
  sent.length = 0;
  /* FOCUSED AGAIN: the plain `repaint` above stands for a payload landing, which is not a press and
     hands nobody their focus back. */
  face('😂').focus();
  await wait(200);   // a second press, not a double tap's second half (534)
  face('😂').click(); await wait(50);
  shape('after taking it back');
  if (d.querySelector('#s-feed .react.mine')) bad.push('after taking it back, a face is still `.mine`');
  if (face('😂') && face('😂').getAttribute('aria-pressed') !== 'false') bad.push('after taking it back, 😂 is still pressed for a screen reader');
  if (count('😂')) bad.push(`after taking it back, 😂 still counts ${JSON.stringify(count('😂'))}`);
  if (face('😂') && face('😂').classList.contains('is-pop')) bad.push('taking it back landed the face — only a face added or moved to lands');
  if (total() !== '3 reactions') bad.push(`after taking it back, the time line says ${JSON.stringify(total())}, not "3 reactions"`);
  if (!sent.some(b => b.action === 'reactPost' && b.emoji === '😂')) bad.push('taking it back sent no reactPost');
  if (face('😂') && d.activeElement !== face('😂')) bad.push(`after taking 😂 back, the focus is on ${held()} — not on 😂`);
  same('after taking it back');
  await wait(150);

  /* ---------- A SAVE THAT FAILS IS PUT BACK, AND THE FOCUS STAYS THROUGH THE UNDO ------------------ */
  failNext = true;
  face('👏').focus();
  face('👏').click(); await wait(150);
  if (d.querySelector('#s-feed .react.mine')) bad.push('a failed save left a face `.mine` — the undo did not put it back');
  if (total() !== '3 reactions') bad.push(`after a failed save, the time line says ${JSON.stringify(total())}, not "3 reactions"`);
  if (face('👏') && d.activeElement !== face('👏')) bad.push(`after a failed save's undo, the focus is on ${held()} — not on 👏`);
  same('after a failed save\'s undo');

  /* ---------- THE TOTAL OPENS WHO REACTED -------------------------------------------------------- */
  /* AND A FACE PRESSED WHILE THE FOCUS WAS ELSEWHERE DOES NOT TAKE IT: a redraw must not pull focus
     off whatever somebody is in (the rule `ansSet_` and `qualRedraw_` follow). */
  if (d.activeElement && d.activeElement.blur) d.activeElement.blur();
  face('❤️').click(); await wait(150);          // now yours is ❤️: 👍 2, ❤️ 2 — a tie
  if (d.activeElement && d.activeElement.dataset && d.activeElement.dataset.do === 'react') {
    bad.push(`a face pressed with nothing focused pulled the focus onto ${held()}`);
  }
  const who = d.querySelector('#s-feed [data-post="PO1"] .post-when .react-who');
  if (!who) return bad.concat(['there is no total on the time line to open who reacted']);
  who.click(); await wait(100);
  const title = (d.getElementById('sheet-title') || {}).textContent || '';
  const sheet = d.getElementById('sheet');
  if (!sheet || sheet.classList.contains('hidden')) return bad.concat(['pressing the total opened no sheet']);
  if (title !== '4 reactions') bad.push(`the sheet is titled ${JSON.stringify(title)}, not "4 reactions"`);
  /* 453: IN THE POST CARD, under its own row, the post still drawn above it — not a page over the feed. */
  if (!sheet.closest('#s-feed [data-post="PO1"]')) bad.push('who reacted did not open inside the post card');
  else if (!d.querySelector('#s-feed [data-post="PO1"] .post-by') || d.querySelector('#s-feed [data-post="PO1"]').classList.contains('sheet-swap')) bad.push('who reacted hid the post it belongs to');
  if (d.body.classList.contains('sheet-open') || (d.getElementById('screen') || {}).inert) bad.push('who reacted took the screen over');
  const groups = () => [...d.querySelectorAll('#sheet-body .rx-group')].map(g => ({
    e: ((g.querySelector('.rx-pill .react-e') || {}).textContent || ''),
    n: ((g.querySelector('.rx-pill .react-n') || {}).textContent || ''),
    mine: !!g.querySelector('.rx-pill.mine'),
    names: [...g.querySelectorAll('.row')].map(x => x.textContent.replace(/\s+/g, ' ').trim()) }));
  const g1 = groups();
  if (g1.map(g => g.e + g.n).join(' ') !== '👍2 ❤️2') {
    bad.push(`the sheet's groups are ${JSON.stringify(g1.map(g => g.e + g.n))}, not 👍 2 then ❤️ 2 (a tie keeps the house order)`);
  }
  const heart = g1.find(g => g.e === '❤️');
  if (heart && !heart.mine) bad.push('in the sheet, ❤️ is yours and its pill is not the gold one');
  if (heart && !/^Pat Parent\s*you$/.test(heart.names[0] || '')) {
    bad.push(`under ❤️ the first name is ${JSON.stringify(heart.names[0])}, not you with "you" after it`);
  }
  if (g1.some(g => g.e === '👍' && g.mine)) bad.push('in the sheet, 👍 is drawn as yours');
  /* MOST FIRST, AND NOT THE HOUSE ORDER WEARING THAT NAME: 🎉 is last of the six and leads here. */
  const r = w.__t.DATA().posts[0].reactions;
  r.counts = [1, 2, 0, 0, 0, 3]; r.total = 6;
  w.__t.ACTIONS['who-reacted'](who); await wait(50);
  const g2 = groups();
  if (g2.map(g => g.e).join(' ') !== '🎉 ❤️ 👍') {
    bad.push(`with 🎉 3, ❤️ 2, 👍 1 the sheet's groups run ${JSON.stringify(g2.map(g => g.e))} — most first`);
  }
  if (!/…and 3 more/.test((d.getElementById('sheet-body') || {}).textContent || '')) {
    bad.push('three 🎉 with no names behind them lost "…and 3 more"');
  }

  /* ---------- SIGNED OUT ------------------------------------------------------------------------- */
  {
    const b = boot({ payload: seed() });
    await wait(400);
    b.w.__t.go('feed'); await wait(700); await woken_();
    const bd = b.w.document;
    const fx = bd.querySelector('#s-feed [data-post="PO1"] .react[data-emoji="👍"]');
    if (!fx) bad.push('signed out, the post draws no faces');
    else {
      b.sent.length = 0;
      fx.click(); await wait(100);
      if (b.sent.some(x => x.action === 'reactPost')) bad.push('signed out, a face posted reactPost');
      if (b.w.__t.AT() !== 'account') bad.push(`signed out, a face went to ${b.w.__t.AT()}, not to sign in`);
      if (bd.querySelector('.react.mine')) bad.push('signed out, a face became yours');
    }
    const t = bd.querySelector('#s-feed [data-post="PO1"] .post-when .react-who');
    if (!t) bad.push('signed out, there is no total on the time line');
    else {
      b.w.__t.ACTIONS['who-reacted'](t); await wait(50);
      const sh = bd.getElementById('sheet');
      if (!sh || sh.classList.contains('hidden') || !bd.querySelector('#sheet-body .rx-group')) {
        bad.push('signed out, the total did not open who reacted');
      }
    }
  }
  return bad;
});

/* ---------- A POLL VOTE REDRAWS THE POLL, NOT THE COLUMN § */
check('a poll vote redraws only the poll, as a reaction redraws only its faces: the post, its picture and its clip stay', async () => {
  const pat = { name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] };
  const p = payload();
  p.posts = [{ id: 'PO1', author: '@family.', handle: '@family.', avatar: '', image: 'data/reels/archetest.jpg',
    media: ['data/reels/archetest.jpg', 'data/reels/archetest.mp4'],
    caption: 'Which day suits the club?', body: '', location: '', when: '01/09/2026',
    at: Date.UTC(2026, 8, 1), pinned: false, active: true, waiting: false, refused: false,
    poll: { options: ['Tuesday', 'Thursday'], counts: [2, 1], total: 3, yours: '' },
    reactions: NO_REACTIONS_(), comments: { total: 0, list: [] } }];
  let refuse = false;
  const { w, sent } = boot({ payload: p,
    reply: b => (b.action === 'votePoll' && refuse ? { error: 'The poll has closed.' } : undefined),
    before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(pat)); } catch (e) {} } });
  await wait(400);
  const d = w.document, bad = [];
  if (!w.__t) return ['the app did not load, so the poll was NOT checked — not a pass'];
  w.__t.go('feed'); await wait(700); await woken_();

  const row = c => d.querySelector(`#s-feed [data-post="PO1"] .poll-row[data-choice="${c}"]`);
  const tot = () => ((d.querySelector('#s-feed [data-post="PO1"] .poll-tot') || {}).textContent || '').replace(/\s+/g, ' ').trim();
  const grab = () => {
    const art = d.querySelector('#s-feed [data-post="PO1"]');
    return { art, pane: art && art.closest('.pane'),
             media: art ? [...art.querySelectorAll('img.post-cell, img.post-pic, video')] : [] };
  };
  const kept = grab();
  if (!kept.art || !row('Tuesday')) return ['the poll post drew no poll to vote in — nothing was pressed, not a pass'];
  if (kept.media.length !== 2) bad.push(`drawn, the poll post holds ${kept.media.length} pictures and clips, not the two it was sent`);
  const same = when => {
    const now = grab();
    if (now.art !== kept.art) bad.push(`${when}, the post is a new <article> — a vote rebuilt the post, when only its poll changed`);
    else if (now.pane !== kept.pane) bad.push(`${when}, the post's pane is a new element`);
    if (now.media.length !== kept.media.length || now.media.some((m, i) => m !== kept.media[i])) {
      bad.push(`${when}, the post's picture and clip are new elements — a playing clip stops and a picture blanks`);
    }
  };
  const on_ = () => { const a = d.activeElement; return a && a.dataset && a.dataset.do === 'vote' ? a.dataset.choice : (a && a.tagName) || 'nothing'; };

  /* ---------- A VOTE ---------------------------------------------------------------------------- */
  sent.length = 0;
  row('Tuesday').focus();
  row('Tuesday').click(); await wait(80);
  same('after a vote');
  if (!row('Tuesday') || !row('Tuesday').classList.contains('mine')) bad.push('after a vote, Tuesday is not ticked as yours');
  if (!/^4 votes/.test(tot())) bad.push(`after a vote, the poll says ${JSON.stringify(tot())}, not "4 votes…"`);
  const v = sent.find(b => b.action === 'votePoll');
  if (!v) bad.push(`a vote posted ${JSON.stringify(sent.map(b => b.action))}, not votePoll`);
  else if (v.postId !== 'PO1' || v.choice !== 'Tuesday' || v.personId !== 'P1')
    bad.push('votePoll went out as ' + JSON.stringify({ postId: v.postId, choice: v.choice, personId: v.personId }));
  if (row('Tuesday') && d.activeElement !== row('Tuesday')) bad.push(`after a vote, the focus is on ${on_()} — not on Tuesday`);

  /* ---------- A REFUSED VOTE IS PUT BACK, IN PLACE --------------------------------------------------- */
  refuse = true;
  row('Thursday').focus();
  row('Thursday').click(); await wait(200);
  same('after a refused vote\'s undo');
  if (!row('Tuesday') || !row('Tuesday').classList.contains('mine')) bad.push('after a refused vote, Tuesday is no longer yours — the undo did not put it back');
  if (row('Thursday') && row('Thursday').classList.contains('mine')) bad.push('after a refused vote, Thursday is still ticked');
  if (!/^4 votes/.test(tot())) bad.push(`after a refused vote, the poll says ${JSON.stringify(tot())}, not "4 votes…"`);
  const said = (d.getElementById('toast') || {}).textContent || '';
  if (!/closed/.test(said)) bad.push(`a refused vote said ${JSON.stringify(said)}, not the server's reason`);
  if (row('Thursday') && d.activeElement !== row('Thursday')) bad.push(`after a refused vote's undo, the focus is on ${on_()} — not on Thursday`);
  return bad;
});

/* ---------- A POST WITH NO DATE: THE FIRST FACE AND THE LAST TAKEN BACK MOVE NOTHING § */
check('a post with no date: its first face and its last taken back keep the post and its time line', async () => {
  const pat = { name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] };
  const p = payload();
  p.posts = [{ id: 'PO2', author: '@family.', handle: '@family.', avatar: '', image: 'data/reels/archetest.jpg',
    media: ['data/reels/archetest.jpg', 'data/reels/archetest.mp4'],
    caption: 'Typed into the sheet by hand', body: '', location: '', when: '', at: 0,
    pinned: false, active: true, waiting: false, refused: false,
    reactions: NO_REACTIONS_(), comments: { total: 0, list: [] } }];
  const { w, sent } = boot({ payload: p,
    before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(pat)); } catch (e) {} } });
  await wait(400);
  const d = w.document, bad = [];
  if (!w.__t) return ['the app did not load, so the undated post was NOT checked — not a pass'];
  w.__t.go('feed'); await wait(700); await woken_();

  const grab = () => {
    const art = d.querySelector('#s-feed [data-post="PO2"]');
    return { art, pane: art && art.closest('.pane'), line: art && art.querySelector('.post-when'),
             media: art ? [...art.querySelectorAll('img.post-cell, img.post-pic, video')] : [] };
  };
  const face = e => d.querySelector(`#s-feed [data-post="PO2"] .react[data-emoji="${e}"]`);
  const kept = grab();
  if (!kept.art || !face('👍')) return ['the undated post drew no faces to press — nothing was pressed, not a pass'];
  if (kept.media.length !== 2) bad.push(`drawn, the undated post holds ${kept.media.length} pictures and clips, not the two it was sent`);
  if (!kept.line) bad.push('drawn, the undated post with no reactions has no time line — the first face has nowhere to put its total, and the column is rebuilt');
  else if (kept.line.textContent.trim()) bad.push(`drawn, the undated post's line says ${JSON.stringify(kept.line.textContent.trim())} — nothing yet`);
  const same = when => {
    const now = grab();
    if (now.art !== kept.art) bad.push(`${when}, the undated post is a new <article> — the press rebuilt the column`);
    else if (now.pane !== kept.pane) bad.push(`${when}, the undated post's pane is a new element`);
    if (now.media.length !== kept.media.length || now.media.some((m, i) => m !== kept.media[i])) {
      bad.push(`${when}, the undated post's picture and clip are new elements — a clip back at 0:00, a picture blank`);
    }
    return now;
  };

  sent.length = 0;
  face('👍').click(); await wait(400);   // past the dispatcher's 350 ms (534)
  let now = same('after the first face');
  const said = now.line ? now.line.textContent.replace(/\s+/g, ' ').trim() : '';
  if (said !== '1 reaction') bad.push(`after the first face, the line says ${JSON.stringify(said)}, not "1 reaction"`);
  if (!face('👍') || !face('👍').classList.contains('mine')) bad.push('after the first face, 👍 is not yours');

  face('👍').click(); await wait(120);
  now = same('after the last face taken back');
  if (!now.line) bad.push('after the last face was taken back, the time line is gone — the card shrinks and the tile row jumps up');
  else if (now.line.textContent.trim()) bad.push(`after the last face was taken back, the line still says ${JSON.stringify(now.line.textContent.trim())}`);
  if (d.querySelector('#s-feed [data-post="PO2"] .react.mine')) bad.push('after taking it back, a face is still yours');
  const n = sent.filter(b => b.action === 'reactPost').length;
  if (n !== 2) bad.push(`two presses a second apart sent ${n} reactPost, not 2`);
  return bad;
});

/* ---------- TWO QUICK TAPS: ONE SAVE AT A TIME, AND THE PAGE AND THE SERVER END THE SAME § */
check('two quick taps on a post: one save at a time, a refusal puts back what the server holds, and the page and the server agree', async () => {
  const pat = { name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] };
  const p = payload();
  p.posts = [{ id: 'PO1', author: '@family.', handle: '@family.', avatar: '', image: '', media: [],
    caption: 'Which paper next week?', body: '', location: '', when: '01/09/2026',
    at: Date.UTC(2026, 8, 1), pinned: false, active: true, waiting: false, refused: false,
    poll: { options: ['Paper 1', 'Paper 2', 'Paper 3'], counts: [1, 1, 0], total: 2, yours: '' },
    reactions: { emoji: ['👍', '❤️', '😂', '😮', '👏', '🎉'], counts: [3, 1, 0, 0, 0, 0], total: 4, yours: '',
      by: [{ name: 'Ada Tutor', emoji: '👍' }] },
    comments: { total: 0, list: [] } }];
  const bad = [];
  /* THE SERVER, TWICE: what Pat holds on each after the same requests. */
  const held = { now: { react: '', vote: '' }, old: { react: '', vote: '' } };
  const key = b => (b.action === 'reactPost' ? 'react' : 'vote');
  const field = b => (b.action === 'reactPost' ? 'emoji' : 'choice');
  const queue = [];
  const { w } = boot({ payload: p,
    reply: b => {
      if (b.action !== 'reactPost' && b.action !== 'votePoll') return undefined;
      if (queue.some(x => !x.done && x.b.action === b.action)) {
        bad.push(`a second ${b.action} went out while the first was unanswered — two saves of one post at once`);
      }
      return new Promise(res => queue.push({ b, res, done: false }));
    },
    before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(pat)); } catch (e) {} } });
  await wait(400);
  const d = w.document;
  if (!w.__t) return ['the app did not load, so quick taps were NOT checked — not a pass'];
  w.__t.go('feed'); await wait(700); await woken_();

  /* EACH REQUEST IN TURN, BY THE NEXT POLICY ('ok' or 'no'), until nothing has been asked for a while. */
  const play = async policy => {
    const got = [];
    let idle = 0;
    while (idle < 6 && got.length < 10) {
      await wait(30);
      const next = queue.find(x => !x.done);
      if (!next) { idle++; continue; }
      idle = 0; next.done = true;
      const how = policy[got.length] || 'ok';
      got.push(next.b);
      if (how === 'no') { next.res({ error: next.b.action === 'reactPost' ? 'Sign in to react.' : 'The poll has closed.' }); continue; }
      const k = key(next.b), v = next.b[field(next.b)];
      held.now[k] = typeof next.b.want === 'string' ? next.b.want : (held.now[k] === v ? '' : v);
      held.old[k] = held.old[k] === v ? '' : v;
      next.res({ success: true, [field(next.b)]: held.now[k] });
    }
    return got;
  };
  const card = () => d.querySelector('#s-feed [data-post="PO1"]');
  const face = e => card() && card().querySelector(`.react[data-emoji="${e}"]`);
  const row = c => card() && card().querySelector(`.poll-row[data-choice="${c}"]`);
  const mineFace = () => { const m = card() && card().querySelector('.react.mine'); return m ? m.dataset.emoji : ''; };
  const mineVote = () => { const m = card() && card().querySelector('.poll-row.mine'); return m ? m.dataset.choice : ''; };
  const total = () => { const b = card() && card().querySelector('.post-when .react-who'); return b ? b.textContent.replace(/\s+/g, ' ').trim() : ''; };
  const votes = () => ((card() && card().querySelector('.poll-tot')) || {}).textContent || '';
  const agree = (when, k, shown) => {
    if (held.now[k] !== shown || held.old[k] !== shown) {
      bad.push(`${when}: the page shows ${JSON.stringify(shown) || 'nothing'} as yours, the server holds ${JSON.stringify(held.now[k])} (and ${JSON.stringify(held.old[k])} on a backend from before \`want\`) — a reload would show something else`);
    }
  };
  /* TWO PRESSES WHILE THE FIRST SAVE IS OUT, 360 ms apart: closer than 350 ms the dispatcher counts them as one double tap (534). */
  const twice = async (a, b2) => { a().click(); await wait(360); b2().click(); };

  /* ---------- 🎉 TWICE, BOTH REFUSED ------------------------------------------------------------ */
  await twice(() => face('🎉'), () => face('🎉'));
  let got = await play(['no', 'no']);
  if (mineFace()) bad.push(`🎉 twice, both refused: ${mineFace()} is still yours — the second refusal put back the first tap's reaction`);
  if (total() !== '4 reactions') bad.push(`🎉 twice, both refused: the line says ${JSON.stringify(total())}, not "4 reactions"`);
  if (!/Sign in to react/.test((d.getElementById('toast') || {}).textContent || '')) bad.push('🎉 twice, both refused: the server\'s reason was not said');
  if (got.length !== 1) bad.push(`🎉 twice, both refused: ${got.length} saves went — the second tap only took back an unsaved one, so one`);
  agree('🎉 twice, both refused', 'react', mineFace());

  /* ---------- 😂 TWICE, THE FIRST REFUSED, THE SECOND ACCEPTED ----------------------------------- */
  await twice(() => face('😂'), () => face('😂'));
  got = await play(['no', 'ok']);
  agree('😂 twice, the first save refused and the second accepted', 'react', mineFace());
  if (total() !== '4 reactions') bad.push(`😂 twice, the first refused: the line says ${JSON.stringify(total())}, not "4 reactions"`);

  /* ---------- 👏 TWICE, BOTH ACCEPTED ----------------------------------------------------------- */
  await twice(() => face('👏'), () => face('👏'));
  got = await play(['ok', 'ok']);
  agree('👏 twice, both accepted', 'react', mineFace());
  if (mineFace()) bad.push(`👏 twice, both accepted: ${mineFace()} is yours — the second tap took it back`);
  if (got.length !== 2) bad.push(`👏 twice, both accepted: ${got.length} saves went, not 2`);
  else if (got[1].want !== '' || got[1].emoji !== '👏') {
    bad.push(`👏 twice: the second save went as ${JSON.stringify({ emoji: got[1].emoji, want: got[1].want })} — want '' (and 👏 for a backend that toggles)`);
  }

  /* ---------- 👍 THEN ❤️ QUICKLY --------------------------------------------------------------- */
  await twice(() => face('👍'), () => face('❤️'));
  got = await play([]);
  if (mineFace() !== '❤️') bad.push(`👍 then ❤️ quickly: ${JSON.stringify(mineFace())} is yours, not ❤️`);
  if (total() !== '5 reactions') bad.push(`👍 then ❤️ quickly: the line says ${JSON.stringify(total())}, not "5 reactions"`);
  agree('👍 then ❤️ quickly', 'react', mineFace());

  /* ---------- A POLL: PAPER 3 TWICE, BOTH REFUSED; THEN PAPER 1 AND PAPER 2 QUICKLY ------------------ */
  await twice(() => row('Paper 3'), () => row('Paper 3'));
  got = await play(['no', 'no']);
  if (mineVote()) bad.push(`Paper 3 twice, both refused: ${mineVote()} is still ticked`);
  if (!/^2 votes/.test(votes().trim())) bad.push(`Paper 3 twice, both refused: the poll says ${JSON.stringify(votes().trim())}, not "2 votes"`);
  agree('Paper 3 twice, both refused', 'vote', mineVote());
  await twice(() => row('Paper 1'), () => row('Paper 2'));
  got = await play([]);
  if (mineVote() !== 'Paper 2') bad.push(`Paper 1 then Paper 2 quickly: ${JSON.stringify(mineVote())} is ticked, not Paper 2`);
  agree('Paper 1 then Paper 2 quickly', 'vote', mineVote());
  return bad;
});

check('the friend search still works for a student', async () => {
  /* THE OTHER HALF OF GUARDING THE CHILDREN LIST. § */
  const p = payload();
  p.students = [{ name: 'Ben', handle: 'ben', xp: 10, highscore: 3, siblings: [], friends: '' },
                { name: 'Cy', handle: 'cy', xp: 4, highscore: 1, siblings: [], friends: '' }];
  const { w } = boot({ payload: p });
  await wait(300);
  w.__t.USER({ name: 'Ben Pupil', personId: 'PS', handle: 'ben', role: 'kid',
               roles: ['kid'], friends: '' });
  const found = (w.__t.whoami() && (p.students || []).find(s => s.handle === 'cy'));
  return found ? [] : ['a student cannot look up another child by handle — the friend list is unusable'];
});

check('the app still loads when opened from a file', async () => {
  /* A PAGE OPENED FROM A FILE HAS NO ORIGIN, and the browser refuses `fetch` to anywhere else before a single byte leaves — instantly, with "Failed to fetch". § */
  const fs2 = require('fs');
  const shell = require('../tools/piece-src.js').pieceSrc('shell', path.join(dir, '..'));
  const data = fs2.readFileSync(path.join(dir, 'data.js'), 'utf8');
  const bad = [];
  if (!/function jsonp\(/.test(data)) {
    bad.push('there is no jsonp() — a page opened from a file cannot reach the backend at all');
  }
  if (!/location\.protocol === 'file:'/.test(shell)) {
    bad.push('load() does not notice it is on a file:// page, so it uses fetch and is refused');
  }
  if (!/__jsonp/.test(shell)) {
    bad.push('nothing unwraps the jsonp reply, so the payload arrives and is dropped');
  }
  return bad;
});

/* ---------- NOTHING OFFERS TO INSTALL, AND THE BROWSER IS NOT LEFT TO OFFER IT EITHER § */
check('nothing offers to install, and the browser is not left to offer it either', async () => {
  const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
  const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Mobile Safari/537.36';
  const PARENT = { name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] };
  const phones = [
    ['somebody signed out on an iPhone', IPHONE, null],
    ['a parent signed in on an iPhone', IPHONE, PARENT],
    ['somebody signed out on Android', ANDROID, null],
    ['a parent signed in on Android', ANDROID, PARENT],
  ];
  /* A FEW WORDS EITHER SIDE, not the sentence: § */
  const WORDS = new RegExp('.{0,30}(' + [
    'install', '\\bapps?\\b', 'shortcut', '\\bicon on', 'standalone', 'bookmark',
    '(?:on|onto|to) (?:your|the) (?:phone|home|dock)', 'home ?(?:screen|row|page)', 'add to (?:your )?home',
    'full ?-?screen', 'one tap', 'address bar',
    /* AND THE DESKTOP'S WORDS, which the round-3 review drew on a card and the list did not hold:
       "Save it to your device / Launch it from your start screen". Measured: in none of the screens. */
    'start ?(?:screen|menu)', '(?:to|on) your (?:device|desktop|laptop|computer)', 'launch it',
    '(?:add|save|pin|put|keep|get|use) @family\\.',
  ].join('|') + ').{0,30}', 'gi');
  const ALL = { childList: true, subtree: true, attributes: true, characterData: true };
  const name_ = n => !n || !n.tagName ? String(n && n.nodeName || '?')
    : n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (typeof n.className === 'string' && n.className
      ? '.' + n.className.trim().split(/\s+/).join('.') : '');

  const ask = async ([who, ua, user]) => {
    const bad = [];
    const { w, errs } = boot({ before: win => {
      /* BEFORE THE APP RUNS, because a phone is a phone from its first line — anything asking the user agent at load must already get this answer — and somebody signed § */
      Object.defineProperty(win.navigator, 'userAgent', { value: ua, configurable: true });
      if (user) win.localStorage.setItem('familyUser', JSON.stringify(user));
    } });
    const t = w.__t;
    if (!t || !t.ACTIONS || !t.TABS) return [who + ': the app did not finish loading'];
    if (!!user !== !!t.whoami()) {
      bad.push(who + ': the app reads this visitor as signed ' + (t.whoami() ? 'in' : 'out')
             + ', so this person was NOT asked about — not a pass');
    }
    /* WHAT `<body>` HELD BEFORE THE APP DID ANYTHING. § */
    const born = new Set(w.document.body.children);

    /* 2. QUIET FIRST. */
    let moved = 0;
    const settle = new w.MutationObserver(rs => { moved += rs.length; });
    settle.observe(w.document.documentElement, ALL);
    const from = Date.now();
    let quiet = false;
    /* THIRTY SECONDS, NOT TEN. § */
    /* AND THE APP'S OWN DEFERRED WORK DONE: § */
    while (!quiet && Date.now() - from < 30000) { moved = 0; await wait(500); quiet = !moved && !t.trailWide() && t.quiet(); }
    settle.disconnect();
    if (!quiet) {
      bad.push(who + ': the page never stayed still for half a second in thirty, so a redraw for the offer '
             + 'could not be told from one of its own — NOT checked');
      return bad;
    }

    /* 3. THE OFFER AS CHROME SENDS IT: cancelable, with the `prompt()` that opens the real install
       dialog and the `userChoice` it settles. */
    let prompted = 0;
    const offer = new w.Event('beforeinstallprompt', { cancelable: true });
    offer.prompt = () => { prompted++; return Promise.resolve(); };
    offer.userChoice = Promise.resolve({ outcome: 'accepted' });
    const seen = [];
    const watch = new w.MutationObserver(rs => { seen.push.apply(seen, rs); });
    watch.observe(w.document.documentElement, ALL);
    w.dispatchEvent(offer);
    await wait(3500);
    seen.push.apply(seen, watch.takeRecords());
    watch.disconnect();

    if (!offer.defaultPrevented) {
      bad.push(who + ': `beforeinstallprompt` was not cancelled, so Chrome slides up its own "Add to '
             + 'Home screen" bar — a suggester the owner asked to have gone, in the browser\'s handwriting');
    }
    if (seen.length) {
      const where = [...new Set(seen.map(r => name_(r.target)))];
      bad.push(who + ': in the 3.5 s after the install offer arrived the page changed ' + seen.length
             + ' thing(s), on ' + where.slice(0, 4).join(', ') + (where.length > 4 ? ' and more' : '')
             + ' — a still page moved for an offer, and nothing may make one');
    }
    if (Object.prototype.hasOwnProperty.call(t.ACTIONS, 'install')) {
      bad.push(who + ': a door called `install` is still wired — a handler kept for an install button, '
             + 'so the browser\'s offer is being held for something that may not be drawn');
    }

    /* 4. EVERY SCREEN, read off `TABS` like the other walks here, and then the whole body. */
    for (const id of t.TABS.map(x => x.id)) {
      try { t.go(id, false, true); } catch (e) { bad.push(who + ': ' + id + ' threw: ' + e.message); }
    }
    await wait(300);
    const body = w.document.body;
    if (body.querySelector('[data-do="install"]')) bad.push(who + ': something draws an install button');
    if (w.document.getElementById('install-bar')) bad.push(who + ': the install bar is back on the page');
    [...body.children].filter(e => !born.has(e)).forEach(e => {
      bad.push(who + ': <' + name_(e) + '> now hangs off <body>, which the page did not start with — "'
             + e.textContent.replace(/\s+/g, ' ').trim().slice(0, 80) + '"');
    });
    const said = [...new Set(body.textContent.replace(/\s+/g, ' ').match(WORDS) || [])];
    said.slice(0, 4).forEach(s => bad.push(who + ': the page says "…' + s.trim() + '…" — an install suggestion'));

    /* 5. LAST, so a prompt raised late — on a timer, or on the way past a screen — is counted. */
    if (prompted) {
      bad.push(who + ': the browser\'s install dialog was opened ' + prompted + ' time(s) without anybody '
             + 'choosing Install from the browser menu');
    }
    if (errs.length) bad.push(who + ': errors: ' + errs.join(' | '));
    return bad;
  };
  return [].concat(...await Promise.all(phones.map(ask)));
});

check('each column opens on the page worth reading', async () => {
  /* THE ＋ CARD IS NOT THE FRONT PAGE. § */
  const { w } = boot();
  await wait(600);
  const bad = [];
  const at = w.__t.PAGE ? w.__t.PAGE() : null;
  if (!at) return [];                              // only checkable where PAGE is exported
  /* SAME RENAME, AND THIS ONE FAILED SILENTLY RATHER THAN LOUDLY. § */
  const host = w.document.getElementById('s-feed');
  if (!host) return ['there is no #s-feed — cannot tell which card the feed opens on'];
  const pages = host.querySelectorAll(':scope > .page');
  if (pages.length > 1) {
    const front = pages[at.feed || at.posts || 0];
    if (front && /New post/.test(front.textContent)) {
      bad.push('the Posts column opens on the ＋ New post card rather than on a post');
    }
  }
  return bad;
});

/* ---------- PROGRESS: BETWEEN SAVED AND TOOLS, AND WITH NOTHING TO COUNT, EVERY WIDGET ITS TITLE ALONE (435) ---------- */
const PROG_TITLES_ = ['Questions', 'Recent activity', 'Work on next', 'Grade estimate', 'Papers and worksheets', 'Sessions'];
check('461: the Progress column is dissolved into Student settings — no `progress` column, an old go("progress") lands on Student settings, a swipe off Saved lands on Book, and every progress widget is on Student settings, each empty one its title alone', async () => {
  const cols = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data', 'settings', 'columns.json'), 'utf8'));
  const { w } = boot({ serve: u => (/(^|\/)data\/settings\/columns\.json(\?|$)/.test(u) ? cols : undefined) });
  await wait(600);
  const t = w.__t, d = w.document;
  const bad = [];
  const ids = () => t.TABS.map(x => x.id);
  if (!bizApplied_(t)) return ['columns.json was not applied — the order a phone gets was NOT checked: ' + ids().join(', ')];
  if (ids().indexOf('progress') !== -1 || d.getElementById('s-progress')) bad.push('there is still a `progress` column');
  if (ids().join(' ') !== ORDER_392_.filter(id => id !== 'biz' && id !== 'site').join(' ')) bad.push('signed out, the row reads ' + ids().join(' ') + ' — wanted ' + ORDER_392_.filter(id => id !== 'biz' && id !== 'site').join(' '));
  t.go('progress', false, true);
  await wait(LEAVE_MS); await woken_();
  if (t.AT() !== 'account') bad.push('go("progress") landed on ' + t.AT() + ', wanted Student settings');
  const swipe = async from => {
    const at = d.querySelector('#s-' + from + ' .page .pane') || d.getElementById('s-' + from);
    at.dispatchEvent(new w.WheelEvent('wheel', { deltaX: 120, deltaY: 0, bubbles: true, cancelable: true }));
    await wait(LEAVE_MS); await woken_();
  };
  t.go('saved', false, true);
  await wait(LEAVE_MS); await woken_();
  await swipe('saved');
  if (t.AT() !== 'booking') bad.push('a sideways swipe off Saved landed on ' + t.AT() + ', wanted Book');
  const who = [['a student', { name: 'Test Student', personId: 'P9', role: 'student', roles: ['student'], token: 'tk' }],
    ['a parent', { name: 'Test Parent', personId: 'P8', role: 'parent', roles: ['parent'], token: 'tk' }],
    ['a tutor', { name: 'Test Tutor', personId: 'P7', role: 'tutor', roles: ['tutor'], token: 'tk' }],
    ['an admin', { name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk' }]];
  for (const [as, u] of who) {
    t.USER(u);
    w.paint('account');
    const host = d.getElementById('s-account');
    const cards = [...host.querySelectorAll(':scope > .page .card.prog-w')];
    const titles = cards.map(c => ((c.querySelector('h3') || {}).textContent || '').trim());
    if (titles.join('|') !== PROG_TITLES_.join('|')) bad.push(as + ': the progress widgets on Student settings read ' + JSON.stringify(titles) + ', wanted ' + JSON.stringify(PROG_TITLES_));
    if (t.pageCount('account') !== host.querySelectorAll(':scope > .page').length) bad.push(as + ': the pager counts ' + t.pageCount('account') + ' pages over ' + host.querySelectorAll(':scope > .page').length + ' drawn');
    cards.forEach((c, k) => {
      if (!c.classList.contains('is-empty') || [...c.children].filter(x => !x.classList.contains('tile-row')).length !== 1) bad.push(as + ': ' + titles[k] + ' is not its title alone');
    });
    if (d.querySelectorAll('.card.prog-w').length !== cards.length) bad.push(as + ': a progress widget is drawn somewhere else too');
  }
  t.USER(null);
  return bad;
});

/* ---------- YOUR JOURNEY IS PROGRESS'S CARD, IT FOLLOWS WHOEVER SIGNS IN, AND THE WEEKLY EMAIL'S CARD IS GONE § */
const JOURNEY_DAY_ = n => { const t = new Date(Date.now() + n * 864e5);
  return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0'); };
check('your exams: the big exam on the Countdowns widget on Tools (466) for a student and not on Settings, not for a parent, drawn again by a sign-in, a sign-out, a role and a saved exam date without a reload — and no weekly parent email card anywhere', async () => {
  const cols = BIZ_COLS_();
  /* `phone_cc` IS WHAT `profileShapeOk_` asks for before a Save is sent from a copy of your details. */
  const STUDENT = { name: 'Sam Student', personId: 'P-S9', role: 'student', roles: ['student'], token: 'tk-s9', handle: 'samstudent',
                    profile: { phone_cc: '+44', exam_small_date: '', exam_big_date: JOURNEY_DAY_(14), date_of_birth: '' } };
  const PARENT = { name: 'Pip Parent', personId: 'P-C8', role: 'client', roles: ['client'], token: 'tk-c8', handle: 'pipparent',
                   profile: { phone_cc: '+44' } };
  const ADMIN = { name: 'Ann Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk-admin', handle: 'annadmin',
                  profile: { phone_cc: '+44' } };
  let next = null, hold = false;
  const p = payload();
  /* A STUDENT'S ABOUT YOU, as `doGet` sends `studentFields`: the birthday and the two exams stay on Settings. */
  p.studentFields = { 'About you': ['date_of_birth', 'exam_small_date', 'exam_big_date'] };
  const { w, sent } = boot({ payload: p,
    serve: u => (hold && /script\.google\.com/.test(u) ? new Promise(() => {}) : BIZ_SERVE_(cols)(u)),
    reply: b => (b.action === 'verifyLogin' ? Object.assign({ success: true }, JSON.parse(JSON.stringify(next)))
      : b.action === 'setMyRoles' ? { success: true, changed: 1, role: b.roles[0], roles: b.roles }
      : b.action === 'updateProfile' ? { success: true, changed: 1, profile: Object.assign({}, (w.__t.whoami() || {}).profile, b.fields) }
      : undefined) });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(600);
  const t = w.__t, d = w.document;
  if (!t) return ['the app did not finish loading'];
  if (t.whoami()) return ['the journey meant to start signed out and somebody is signed in — NOT checked'];
  if (!bizApplied_(t)) return ['columns.json was not applied — NOT checked: ' + t.TABS.map(x => x.id).join(', ')];
  const doc = d.documentElement;
  hold = true;
  const bad = [];
  const settle = async () => { await wait(LEAVE_MS); await woken_(); };
  const go = async id => { t.go(id, false, true); await settle(); };
  const prog = () => d.getElementById('s-stuff');
  /* WHAT PROGRESS SHOWS, read off the column as drawn — never off `progressCards_()`, which would be asking
     the function the column is drawn from rather than whether it was drawn again. */
  const seen = () => {
    const h = prog(), j = h && h.querySelector('.cd-box');
    const big = j ? /Big exam\s*(\d+) days?/.exec(j.textContent) : null;
    return { journey: !!big, held: !big,
             count: big ? big[1] : '',
             pages: h ? h.querySelectorAll(':scope > .page').length : 0 };
  };
  /* THE WIDGET ON ITS OWN PAGE OF TOOLS, as a swipe arrives at it (466). */
  /* FIND IS FOR MEMBERS (400): signed out, `findGroup` stands a member in to look, and stands them down after (790). */
  const look = async () => { const was = t.whoami(); await toolBox_(w, 'countdowns', '.cd-box'); const s0 = seen(); if (!was && t.whoami()) t.USER(null); return s0; };
  const signIn = async (u, as) => {
    next = u;
    /* ON FIND (owner, 13 Nov): the handle in the name tag, then four digit tags. */
    const no = await findSign_(w, u.handle, '0000');
    if (no) return as + ': ' + no + ' — NOT checked';
    for (let n = 0; n < 50 && !(t.whoami() && t.whoami().personId === u.personId); n++) await wait(100);
    await settle();
    return t.whoami() && t.whoami().personId === u.personId ? '' : as + ' did not sign in — NOT checked';
  };
  const signOut = async () => {
    try { t.ACTIONS['signout'](d.createElement('button')); } catch (e) { return 'signout threw: ' + e.message; }
    await settle();
    return t.whoami() ? 'Sign out did not sign anybody out — NOT checked' : '';
  };

  /* 1. SIGNED OUT. */
  let s1 = await look();
  if (s1.journey || !s1.held) bad.push('signed out, Progress is ' + JSON.stringify(s1) + ' — wanted the placeholder');

  /* 2. A STUDENT SIGNS IN: their journey on Progress, and none on Settings. */
  let no = await signIn(STUDENT, 'the student');
  if (no) return bad.concat([no]);
  s1 = await look();
  if (!s1.journey || s1.held) bad.push('a student signed in, and Progress is ' + JSON.stringify(s1) + ' — wanted their journey, without a reload');
  if (s1.count !== '14') bad.push('the student\'s journey counts "' + s1.count + '" days to their big exam, wanted 14');
  if (prog().querySelector('.cd-box ' + PLACEHOLDER_KEYS_.split(', ').join(', .cd-box '))) bad.push('the student\'s countdowns have a control on them');
  await go('account');
  if (d.querySelector('#s-account .cd-box, #s-account .card.journey')) bad.push('a countdown is still drawn on Student settings — its one home is Tools (466)');

  /* 3. THE STUDENT'S ROLE BECOMES CLIENT — by @family., since a student has no picker (432) — and the column is drawn again: the placeholder. */
  const roles = d.querySelector('#s-account .roles-card');
  if (!roles) bad.push('the student\'s Settings has no roles card — the change of role was NOT checked');
  else {
    if (roles.querySelector('[data-role-pick]')) bad.push('a student is offered a role picker on Settings (432)');
    Object.assign(t.whoami(), { role: 'client', roles: ['client'], rank: 'client' });
    try { w.paint('account'); w.paint('account'); } catch (e) { bad.push('paint threw: ' + e.message); }
    await settle();
    if (!t.whoami() || t.whoami().role !== 'client') bad.push('the student did not become a client — NOT checked');
    else {
      s1 = await look();
      if (s1.journey || !s1.held) bad.push('the student became a client, and Progress is ' + JSON.stringify(s1) + ' — wanted the placeholder');
    }
  }

  /* 4. OUT FROM SPOTLIGHT, AND A PARENT IN: the placeholder, and no journey anywhere. */
  await go('spotlight');
  if ((no = await signOut())) return bad.concat([no]);
  s1 = await look();
  if (s1.journey || !s1.held) bad.push('signed out from Spotlight, Progress is ' + JSON.stringify(s1) + ' — wanted the placeholder');
  if ((no = await signIn(PARENT, 'the parent'))) return bad.concat([no]);
  for (const id of t.TABS.map(x => x.id)) { try { t.go(id, false, true); } catch (e) { bad.push('the parent: ' + id + ' threw: ' + e.message); } }
  s1 = await look();
  if (s1.journey || !s1.held) bad.push('a parent signed in, and Progress is ' + JSON.stringify(s1) + ' — wanted the placeholder');
  if ([...d.querySelectorAll('.cd-box, .card.journey')].some(c => /Big exam|Small exam/.test(c.textContent))) bad.push('a parent is shown an exam date of About you somewhere in the page');

  /* 5. THE PARENT SIGNS OUT ON PROGRESS, THE STUDENT IN AGAIN: the journey, on the same document. */
  if ((no = await signOut())) return bad.concat([no]);
  s1 = await look();
  if (s1.journey || !s1.held) bad.push('the parent signed out on Progress, and it shows ' + JSON.stringify(s1) + ' — wanted the placeholder there and then');
  if ((no = await signIn(STUDENT, 'the student, again'))) return bad.concat([no]);
  s1 = await look();
  if (!s1.journey || s1.held || s1.count !== '14') bad.push('the student signed in again after a sign-out, and Progress is ' + JSON.stringify(s1) + ' — wanted their journey at 14 days, without a reload');

  /* 6. THE BIG EXAM MOVED ON ABOUT YOU: Progress counts to the new date before anybody goes there. */
  await go('account');
  const exam = d.querySelector('#s-account [data-me="exam_big_date"]');
  const form = exam && exam.closest('.me-form');
  if (!exam || !form) bad.push('the student\'s Settings has no big-exam box — the saved date was NOT checked');
  else {
    /* SAVED AS TYPED (owner, 8 Nov): the input alone sends it. */
    const before = sent.length;
    exam.value = JOURNEY_DAY_(30);
    exam.dispatchEvent(new w.Event('input', { bubbles: true }));
    for (let n = 0; n < 30 && (t.whoami().profile || {}).exam_big_date !== JOURNEY_DAY_(30); n++) await wait(100);
    await wait(300);
    if (!sent.slice(before).some(b => b.action === 'updateProfile' && b.fields && b.fields.exam_big_date === JOURNEY_DAY_(30))) bad.push('Save on About you did not post the new big-exam date — NOT checked');
    else if (t.screenAt() !== 'account') bad.push('the Save moved the student off Settings, to ' + t.screenAt() + ' — the column beside was NOT checked');
    else {
      s1 = seen();
      if (s1.count !== '30') bad.push('the student saved their big exam 30 days out, and Progress (not in front, the payload held) still counts "' + s1.count + '"');
      s1 = await look();
      if (s1.count !== '30') bad.push('the student saved their big exam 30 days out and went to Progress, which counts "' + s1.count + '"');
    }
  }

  /* 7. AN ADMIN: no exams card on Settings, and the weekly email's card nowhere. */
  if ((no = await signOut())) return bad.concat([no]);
  if ((no = await signIn(ADMIN, 'the admin'))) return bad.concat([no]);
  for (const id of t.TABS.map(x => x.id)) { try { t.go(id, false, true); } catch (e) { bad.push('the admin: ' + id + ' threw: ' + e.message); } await wait(50); }
  await go('account');
  w.paint('account');
  if (d.querySelectorAll('#s-account .cd-box').length) bad.push('an admin\'s countdowns are drawn on Student settings');
  s1 = await look();
  /* NO EXAM DATE ON THE ADMIN'S PROFILE (435): no Big exam line. */
  if (s1.journey) bad.push('an admin with no exam date signed in, and Progress is ' + JSON.stringify(s1) + ' — wanted no Big exam line');
  const gone = d.querySelectorAll('.card.digest, [data-do="digest-preview"], .digest-mode, .digest-said');
  if (gone.length) bad.push('the weekly parent email card is still drawn for an admin: ' + [...gone].map(e => e.outerHTML.slice(0, 60)).join(' | '));
  if (/digest-preview|Weekly parent email/.test(d.documentElement.outerHTML)) bad.push('the page still names the weekly parent email card or its Preview');
  if (Object.prototype.hasOwnProperty.call(t.ACTIONS, 'digest-preview')) bad.push('a `digest-preview` handler is still wired — for a tile nothing draws');
  if (/digest/i.test(w.youSettingsPages_().join(''))) bad.push('`youSettingsPages_` still builds something of the weekly email\'s card');
  /* SINCE 547 the Site column's Weekly email card asks `digestPreview` for the email as is -- an admin's alone; nobody else may ask. */
  if (sent.some(b => b.action === 'digestPreview' && !(t.whoami() && /admin/i.test(String(t.whoami().role || ''))))) bad.push('somebody who is not an admin asked the server for digestPreview');
  if (d.documentElement !== doc) bad.push('the page was reloaded');
  return bad;
});

/* ---------- PROGRESS, BUILT (435): EMPTY IS EACH TITLE ALONE, AND ONE PRESS FILLS IT ---------- */
const PROG_Q_ = (id, n, topic, marks, extra) => Object.assign({ kind: 'question', key: 'q:' + id, name: 'Q' + n, qNumber: String(n), sub: 'Paper 1H — June 2024',
  subject: 'Maths', marks: marks, topic: [topic], documentType: 'Past paper', company: 'Edexcel', tier: 'Higher', keystage: 'KS4',
  row: { row_id: id, paper_id: 'P-PROG', subject: 'Maths', topics: topic, name: 'Paper 1H — June 2024', document_type: 'Past paper', key_stage: 'KS4' },
  html: '<p>Question ' + n + '.</p>' }, extra || {});
const PROG_ITEMS_ = () => [
  PROG_Q_('Q-PA', 1, 'Fractions', 1, { html: '<p>Half of 8.</p>', answer: '4', accept: '4' }),
  PROG_Q_('Q-PB', 2, 'Fractions', 1, { html: '<p>A third of 9.</p>', answer: '3', accept: '3' }),
  PROG_Q_('Q-PC', 3, 'Standard Form', 3, { html: '<p>Write 3000 in standard form.</p>' }),
  PROG_Q_('Q-PD', 4, 'Standard Form', 2),
  /* A GRADE 4 WORKSHEET OF A WORKSHEET SERIES, and one of its grade 5 siblings nobody has started. */
  PROG_Q_('Q-W4', 1, 'Ratio', 1, { sub: 'Ratio', documentType: 'Worksheet', company: '1st Class Maths', tier: 'Foundation', bandType: 'grade', bandValue: '4',
    row: { row_id: 'Q-W4', paper_id: 'P-W4', subject: 'Maths', topics: 'Ratio', name: 'Ratio (grade 4)', document_type: 'Worksheet', band_type: 'grade', band_value: '4' } }),
  PROG_Q_('Q-W5', 1, 'Ratio', 1, { sub: 'Ratio', documentType: 'Worksheet', company: '1st Class Maths', tier: 'Foundation', bandType: 'grade', bandValue: '5',
    row: { row_id: 'Q-W5', paper_id: 'P-W5', subject: 'Maths', topics: 'Ratio', name: 'Ratio (grade 5)', document_type: 'Worksheet', band_type: 'grade', band_value: '5' } })];
const progCard_ = (d, title) => [...d.querySelectorAll('#s-account .card.prog-w')].find(c => ((c.querySelector('h3') || {}).textContent || '').trim() === title) || null;
const progTxt_ = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
/* A ROW AS ITS LABEL AND ITS VALUE, a space between — `textContent` runs the two spans together. */
const progRow_ = el => (el ? [...el.children].map(c => c.textContent.replace(/\s+/g, ' ').trim()).join(' ') : '');
check('progress, empty: a signed-in learner with nothing answered sees each widget\'s title alone, and one press marks the column to be drawn again with it counted', async () => {
  const { w } = boot({ payload: Object.assign(payload(), { submissions: { for: 'P7', mine: {} } }), before: signedInAs_(ANS_ADA) });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(400);
  const t = w.__t, d = w.document;
  if (!t || !t.whoami() || t.whoami().personId !== 'P7') return ['the learner is not signed in — NOT checked'];
  const items = PROG_ITEMS_();
  w.stuffItemsAll_ = () => items;
  const bad = [];
  t.go('account', false, true);
  await wait(LEAVE_MS); await woken_();
  w.paint('account');
  for (const title of ['Questions', 'Recent activity', 'Work on next', 'Grade estimate', 'Papers and worksheets', 'Sessions']) {
    const c = progCard_(d, title);
    if (!c) bad.push('nothing answered, and Progress has no ' + title + ' widget');
    else if (!c.classList.contains('is-empty') || [...c.children].filter(x => !x.classList.contains('tile-row')).length !== 1) bad.push(title + ' is not its title alone with nothing answered: ' + progTxt_(c).slice(0, 80));
  }
  /* ITS ONE ROW IS EVERY CARD'S (Suggest a change, the padlock), nothing of its own (1 Nov). */
  if (d.querySelector('#s-account .prog-w [data-do]:not([data-do="rep-box"]):not([data-do="game-lock"])')) bad.push('the empty Progress has a control on it');
  if (d.querySelector('#s-account .prog-w .loading')) bad.push('the empty Progress is still waiting with the payload in');
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  const rec = w.subRecord_('ans:u:P7:q:Q-PA', '4', 'right', 'none');
  if (!rec) return bad.concat(['subRecord_ recorded nothing — the press was NOT checked']);
  t.go('account', false, true);
  await wait(LEAVE_MS); await woken_();
  const card = d.querySelector('#s-account .card.prog-answered');
  if (!card) bad.push('a press was made and Progress, visited again, still has no Questions card');
  else if (!/Fractions\s*1 of 1 right/.test(progTxt_(card))) bad.push('the Questions card does not count the press under Fractions: ' + progTxt_(card).slice(0, 120));
  if (!d.querySelector('#s-account .card.prog-series')) bad.push('a press on a past paper drew no series card');
  const weak = progCard_(d, 'Work on next');
  if (!weak || !weak.classList.contains('is-empty')) bad.push('everything is right and Work on next is not its title alone');
  t.USER(null);
  return bad;
});

/* THE POPULATED LEARNER: three presses on the account, two on the device (one older than the account's, one the library does not hold). */
const progPopulated_ = async (more) => {
  const DAY = 864e5, now = Date.now();
  const p = payload();
  const mine = Object.assign({}, p.jobs[2], { id: 'J-ADA', jobId: 'J-ADA', client: 'Ada Pupil', day: 'Mon', time: '16:00', title: 'A-Level Maths', status: 'active' });
  p.jobs = p.jobs.concat([mine]); p.liveJobs = p.jobs;
  p.submissions = { for: 'P7', mine: {
    'q:Q-PA': { answer: '4', verdict: 'right', at: now - 60000, id: '1760000000401-pr0001' },
    'q:Q-PB': { answer: '2', verdict: 'wrong', at: now - DAY, id: '1760000000402-pr0002' },
    'q:Q-PC': { answer: '3x10^3', verdict: 'ai:1/3', at: now - 120000, id: '1760000000403-pr0003' },
    'q:Q-W4': { answer: '2:3', verdict: 'right', at: now - 180000, id: '1760000000406-pr0006' } } };
  if (more) more(p);
  const seed = win => {
    signedInAs_(ANS_ADA)(win);
    win.localStorage.setItem('subLast:u:P7', JSON.stringify({
      'q:Q-PA': { a: '5', v: 'wrong', at: now - 3 * DAY, id: '1760000000404-pr0004' },
      'q:Q-GONE': { a: 'x', v: 'sent', at: now - 30000, id: '1760000000405-pr0005' } }));
  };
  const { w } = boot({ payload: p, before: seed });
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  await wait(400);
  const t = w.__t;
  if (!t || !t.whoami() || t.whoami().personId !== 'P7') return { w: null };
  const items = PROG_ITEMS_();
  w.stuffItemsAll_ = () => items;
  t.go('account', false, true);
  await wait(LEAVE_MS); await woken_();
  w.paint('account');
  return { w, t, d: w.document };
};
check('progress, populated: counts by topic from the account and the device, a streak, the weakest topic\'s Practise opening Find, and sessions past and to come', async () => {
  const { w, t, d } = await progPopulated_();
  if (!w) return ['the learner is not signed in — NOT checked'];
  const bad = [];
  const host = d.getElementById('s-account');
  const q = host.querySelector('.card.prog-answered');
  if (!q) return bad.concat(['Progress has no Questions card: ' + progTxt_(host).slice(0, 120)]);
  const tot = [...q.querySelectorAll('.row.prog-tot')].map(progRow_);
  if (tot.join(' | ') !== 'Answered 5 | Right 2 | Marks 3 of 6 (50%)') bad.push('the totals read ' + JSON.stringify(tot) + ', wanted Answered 5, Right 2, Marks 3 of 6 (50%)');
  if (q.querySelector('.prog-sum, .prog-big')) bad.push('the totals are boxes in a grid, not one line each');
  if (!/Fractions\s*1 of 2 right/.test(progTxt_(q))) bad.push('Fractions is not 1 of 2 right — the account\'s later press did not win over the device\'s: ' + progTxt_(q));
  if (!/Standard Form\s*0 of 1 right/.test(progTxt_(q))) bad.push('Standard Form is not 0 of 1 right: ' + progTxt_(q));
  if (t.pageCount('account') !== host.querySelectorAll(':scope > .page').length) bad.push('the pager counts ' + t.pageCount('account') + ' pages over ' + host.querySelectorAll(':scope > .page').length + ' drawn');
  const act = host.querySelector('.card.prog-activity');
  if (!act || !/Streak\s*2 days/.test(progTxt_(act))) bad.push('the activity card does not say a 2-day streak: ' + progTxt_(act).slice(0, 100));
  if (!act || !/Last 7 days\s*5 on 2 days/.test(progTxt_(act))) bad.push('the activity card does not say 5 on 2 days this week: ' + progTxt_(act).slice(0, 100));
  const weak = host.querySelector('.card.prog-weakest');
  const tiles = weak ? [...weak.querySelectorAll('.tile[data-do="prog-practise"]')] : [];
  if (tiles.map(b => b.dataset.topic).join('|') !== 'Standard Form|Fractions') bad.push('Work on next reads ' + JSON.stringify(tiles.map(b => b.dataset.topic)) + ', wanted Standard Form then Fractions');
  if (weak && weak.querySelector('button:not(.tile)')) bad.push('Work on next has a button that is not a tile');
  const ss = host.querySelector('.card.prog-sessions');
  if (!ss) bad.push('the learner has a Monday session and Progress has no Sessions card');
  else {
    if (!/Coming up/.test(progTxt_(ss)) || !/Done/.test(progTxt_(ss))) bad.push('the Sessions card does not show sessions to come and done: ' + progTxt_(ss).slice(0, 120));
    if (ss.querySelectorAll('.row').length !== 6) bad.push('the Sessions card has ' + ss.querySelectorAll('.row').length + ' rows, wanted the next three and the last three');
  }
  /* Only the progress widgets: Student settings now carries the owner's own Coming soon cards on purpose (562). */
  if ([...host.querySelectorAll('.prog-w')].some(c => /Not built yet|Coming soon/.test(progTxt_(c)))) bad.push('the placeholder words are still drawn');
  if (tiles[0]) {
    try { t.ACTIONS['prog-practise'](tiles[0]); } catch (e) { bad.push('prog-practise threw: ' + e.message); }
    await wait(LEAVE_MS); await woken_();
    if (t.AT() !== 'stuff') bad.push('Practise left the app on ' + t.AT() + ', wanted Find');
    /* THE TOPIC CHIP, OR — questions not answering Topic (`topicShown_`) — the question last got wrong, open in front. Never the whole library from the top. */
    const f = (t.STUFF().filters || []).slice();
    const on = d.querySelectorAll('#s-stuff > .page')[t.PAGE().stuff || 0];
    const chip = f.some(x => x.field === 'topic' && x.value === 'Standard Form');
    if (!chip && !(on && /3000 in standard form/.test(on.textContent))) bad.push('Practise on Standard Form opened Find on neither its chip nor the question got wrong: ' + JSON.stringify(f) + ' / ' + progTxt_(on).slice(0, 80));
  }
  const back = d.querySelector('#s-account .tile[data-do="prog-sessions"]');
  if (back) {
    try { t.ACTIONS['prog-sessions'](back); } catch (e) { bad.push('prog-sessions threw: ' + e.message); }
    await wait(LEAVE_MS); await woken_();
    if (t.AT() !== 'booking') bad.push('the Sessions tile left the app on ' + t.AT() + ', wanted Book');
  }
  t.USER(null);
  return bad;
});

