/* ---------- A TUTOR'S EXTRA PHOTOS ARE UPLOADED, NOT LINKED (owner, 8 Nov) */
check('Photos: an extra photo is chosen from the phone, sent once (photoFile) as a JPEG, and its link lands in the slot for Save; an old link still shows', async () => {
  const { w, sent } = boot({ payload: Object.assign(payload(), { profileFields: { 'Photos': ['photo', 'photos_1', 'photos_2'] } }),
    reply: b => {
      if (b.action === 'myProfile') return { error: 'That action is not recognised.' };
      if (b.action === 'photoFile') return { success: true, url: 'https://drive.google.com/file/d/PHOTO-ID-1/view' };
      return { success: true, changed: 1 };
    } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  const me = JSON.parse(JSON.stringify(JOBS_TUTOR_));
  me.profile.photos_1 = 'https://example.org/old.jpg';
  me.profile.phone_cc = '';  /* a profile the site trusts (`profileShapeOk_`), so the packed photos may be saved */
  t.USER(me);
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const shelf = d.querySelector('#s-account .ph-shelf');
  if (!shelf) return ['there is no photo shelf on Settings — the upload was NOT checked'];
  if (/Another photo link/.test(shelf.innerHTML)) bad.push('the shelf still asks for a pasted link');
  if (shelf.querySelector('.ph-slot input[type="url"]')) bad.push('a slot is still a link box');
  const old = shelf.querySelector('.ph-slot:not([hidden]) .ph-thumb img');
  if (!old || !/old\.jpg/.test(old.getAttribute('src') || '')) bad.push('an existing photo link no longer shows');
  /* THE CANVAS IS THE BROWSER'S; jsdom has none, so the redraw is stood in for. */
  w.eval('photoShrink_ = () => Promise.resolve("data:image/jpeg;base64,QUJD")');
  const add = shelf.querySelector('[data-do="shelf-more"]');
  if (add) t.ACTIONS['shelf-more'](add);
  const slot = [...shelf.querySelectorAll('.ph-slot')].find(s => !s.hidden && !s.querySelector('input[data-me]').value);
  if (!slot) return bad.concat(['Add a photo did not open an empty slot']);
  const inp = slot.querySelector('input[type="file"].ph-in');
  if (!inp || inp.getAttribute('accept') !== 'image/*') return bad.concat(['the slot has no image/* file input']);
  if (!slot.querySelector('[data-do="ph-pick"]')) bad.push('the slot has no Choose photo tile');
  sent.length = 0;
  Object.defineProperty(inp, 'files', { value: [new w.File(['x'], 'p.heic', { type: 'image/heic' })], configurable: true });
  inp.dispatchEvent(new w.Event('change', { bubbles: true }));
  await wait(500);
  const up = sent.filter(b => b.action === 'photoFile');
  if (up.length !== 1) bad.push('the photo went as ' + up.length + ' photoFile posts');
  else if (!/^data:image\/jpeg;base64,/.test(up[0].data)) bad.push('the photo was not sent as a JPEG');
  const box = slot.querySelector('input[data-me]');
  if (!box || !/PHOTO-ID-1/.test(box.value)) bad.push('the uploaded link did not land in the slot');
  if (!slot.querySelector('.ph-thumb img')) bad.push('the slot shows no preview of the uploaded photo');
  const form = shelf.closest('.me-form');
  sent.length = 0;
  try { w.meSave_(form); } catch (e) { bad.push('Save threw: ' + e.message); }
  await wait(400);
  const post = sent.find(b => b.action === 'updateProfile');
  const f = (post && post.fields) || {};
  if (!post) bad.push('Save posted no updateProfile: ' + JSON.stringify(sent.map(b => b.action)) + ' said ' + ((form.querySelector('.me-said') || {}).textContent || ''));
  else if (!Object.keys(f).some(k => /PHOTO-ID-1/.test(f[k]))) bad.push('Save did not keep the uploaded link: ' + JSON.stringify(f).slice(0, 200));
  return bad;
});

/* ---------- A NEW TUTOR'S STAFF COLUMN (8 Nov): no tutor row yet, and still Jobs, When I can teach and the rate's share bar */
check('New tutor: Settings › Staff shows Jobs and When I can teach before any tutor row exists, and typing a rate draws the @family share bar (tutor and admin)', async () => {
  const fx = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'check', 'fixture.json'), 'utf8'));
  const bad = [];
  for (const who of [JOBS_TUTOR_, Object.assign({}, JOBS_TUTOR_, { role: 'admin', roles: ['admin', 'tutor'] })]) {
    const { w } = boot({ payload: Object.assign(payload(), { tutors: [], profileFields: fx.profileFields, clientFields: fx.clientFields, studentFields: fx.studentFields }),
      reply: b => b.action === 'myProfile' ? { error: 'That action is not recognised.' } : { success: true } });
    await wait(300);
    const t = w.__t, d = w.document, as = who.role;
    t.USER(JSON.parse(JSON.stringify(who)));
    try { t.go('account', false, true); w.paint('account'); } catch (e) { bad.push(as + ': drawing settings threw: ' + e.message); continue; }
    await wait(300);
    const all = [...d.querySelectorAll('[id^="s-"]')];
    const find = sel => all.map(s => s.querySelector(sel)).find(Boolean);
    if (!find('.job-shelf')) bad.push(as + ': a new tutor has no Jobs card');
    if (!find('[data-me="m09"]')) bad.push(as + ': a new tutor has no When I can teach card');
    const rate = find('[data-me="rate_per_hour"]');
    if (!rate) { bad.push(as + ': there is no rate box'); continue; }
    const bar = rate.closest('.set-shape') && rate.closest('.set-shape').querySelector('.share-bar');
    if (!bar) { bad.push(as + ': the rate card has no share bar'); continue; }
    rate.value = '30';
    rate.dispatchEvent(new w.Event('input', { bubbles: true }));
    if (!/@family\./.test(bar.textContent) || !/30/.test(bar.textContent)) bad.push(as + ': typing a rate drew the bar as ' + JSON.stringify(bar.textContent.trim().slice(0, 120)));
  }
  return bad;
});
