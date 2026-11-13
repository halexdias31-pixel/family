/* ---------- A TUTOR'S JOBS AND INTRO VIDEO (owner, 8 Nov): jobs added like qualifications, a video uploaded rather than linked */
const JOBS_FIELDS_ = [].concat(...[1, 2, 3, 4, 5, 6].map(n => ['role', 'where', 'from', 'to'].map(k => 'job_' + n + '_' + k)));
const JOBS_TUTOR_ = { name: 'Ada Tutor', personId: 'P9', role: 'tutor', roles: ['tutor'], token: 'tk',
  profile: { first_name: 'Ada', last_name: 'Tutor', email: 'ada@example.org', video_file: '' } };
check('Jobs: Add a job opens one line (role, where, from–to), Save posts it, and the public tutor card shows it as a pill', async () => {
  const { w, sent } = boot({ payload: Object.assign(payload(), { profileFields: { 'Jobs': JOBS_FIELDS_ } }),
    reply: b => b.action === 'myProfile' ? { error: 'That action is not recognised.' } : { success: true, changed: 1 } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(JSON.parse(JSON.stringify(JOBS_TUTOR_)));
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const shelf = d.querySelector('#s-account .job-shelf');
  if (!shelf) return ['there is no jobs shelf on Settings — Jobs was NOT checked'];
  const add = shelf.querySelector('[data-do="shelf-more"]');
  if (!add || !/Add a job/.test(add.textContent + ' ' + (add.getAttribute('aria-label') || ''))) bad.push('the shelf has no "Add a job" tile');
  const first = shelf.querySelector('.job-slot');
  if (!first || !first.hidden) bad.push('an empty jobs card shows a blank line before Add a job is pressed');
  if (add) t.ACTIONS['shelf-more'](add);
  if (!first || first.hidden) return bad.concat(['Add a job did not open a line']);
  const vals = { job_1_role: 'Maths teacher', job_1_where: 'A secondary school', job_1_from: '2019', job_1_to: 'now' };
  Object.keys(vals).forEach(f => {
    const box = first.querySelector('[data-me="' + f + '"]');
    if (!box) { bad.push('the line has no ' + f + ' box'); return; }
    box.value = vals[f];
    box.dispatchEvent(new w.Event('input', { bubbles: true }));
  });
  const form = shelf.closest('.me-form');
  sent.length = 0;
  try { w.meSave_(form); } catch (e) { bad.push('Save threw: ' + e.message); }
  await wait(400);
  const post = sent.find(b => b.action === 'updateProfile');
  if (!post) bad.push('Save posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no updateProfile');
  else Object.keys(vals).forEach(f => { if ((post.fields || {})[f] !== vals[f]) bad.push('Save posted ' + f + ' as ' + JSON.stringify((post.fields || {})[f])); });
  /* THE PUBLIC CARD: the row's jobs as pills, in the jobs colour family. */
  const row = { title: 'Ada Tutor', personId: 'P-jobs', listed: true, rate: 14, jobs: [{ role: 'Maths teacher', where: 'A secondary school', from: '2019', to: 'now' }] };
  const html = w.eval('profJobs_')(row);
  if (!/prof-jobs/.test(html) || !/Maths teacher · A secondary school · 2019–now/.test(html)) bad.push('the card drew the job as ' + JSON.stringify(html.slice(0, 200)));
  if (w.eval('profJobs_')({ jobs: [] }) !== '') bad.push('a tutor with no jobs gets a Jobs caption');
  return bad;
});

check('Intro video: the Photos card uploads a file in parts (videoPart), refuses an over-size clip before sending, and Watch intro plays it on the card', async () => {
  const parts = [];
  const { w, sent } = boot({ payload: Object.assign(payload(), { profileFields: { 'Photos': ['photo', 'photos_1'] } }),
    reply: b => {
      if (b.action === 'myProfile') return { error: 'That action is not recognised.' };
      if (b.action === 'videoPart') { parts.push(b); return b.part === b.parts - 1 ? { success: true, done: true, videoFile: 'FILE-ID-1' } : { success: true }; }
      return { success: true };
    } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(JSON.parse(JSON.stringify(JOBS_TUTOR_)));
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const pick = () => d.querySelector('#s-account .vid-pick');
  if (!pick()) return ['there is no video picker on the Photos card — the upload was NOT checked'];
  if (d.querySelector('#s-account [data-me="video"]')) bad.push('the Photos card still asks for a video link');
  const inp = pick().querySelector('input[type="file"].vid-in');
  if (!inp || inp.getAttribute('accept') !== 'video/*') bad.push('the picker is not a video/* file input');
  const choose = file => {
    const i = pick().querySelector('.vid-in');
    Object.defineProperty(i, 'files', { value: [file], configurable: true });
    i.dispatchEvent(new w.Event('change', { bubbles: true }));
  };
  /* TOO BIG: refused on the phone, nothing sent. */
  const big = new w.File(['x'], 'big.mp4', { type: 'video/mp4' });
  Object.defineProperty(big, 'size', { value: 150 * 1024 * 1024 });
  sent.length = 0;
  choose(big);
  await wait(4500);
  if (sent.some(b => b.action === 'videoPart')) bad.push('a 150 MB clip was sent rather than refused on the phone');
  if (!/100 MB/.test(String((pick().querySelector('.vid-said') || {}).textContent))) bad.push('the over-size clip was not refused in words: ' + JSON.stringify((pick().querySelector('.vid-said') || {}).textContent));
  /* A SMALL CLIP OVER TWO PARTS: 4 MB and the rest, the last answering with the file id. */
  const bytes = new Uint8Array(4 * 1024 * 1024 + 1000);
  choose(new w.File([bytes], 'hello.mp4', { type: 'video/mp4' }));
  for (let i = 0; i < 40 && !d.querySelector('#s-account .vid-pick[data-file="FILE-ID-1"]'); i++) await wait(250);
  if (parts.length !== 2) bad.push('the clip went in ' + parts.length + ' parts, not 2');
  else {
    if (parts.some(p => p.upload !== parts[0].upload || p.size !== bytes.length || p.parts !== 2)) bad.push('the parts disagree on upload, size or count');
    if (parts[0].part !== 0 || parts[1].part !== 1) bad.push('the parts were not numbered 0 and 1');
    if (!/^video\//.test(parts[0].mime)) bad.push('the part was sent as ' + parts[0].mime);
  }
  if (!pick() || pick().dataset.file !== 'FILE-ID-1') bad.push('the picker did not take the saved file id');
  else if (!pick().querySelector('iframe[src*="FILE-ID-1/preview"]')) bad.push('the Photos card does not play the uploaded video');
  /* THE PUBLIC CARD: Watch intro opens the Drive player in place. */
  const tiles = w.eval('tile_')(w.eval('tutorOpts_')({ name: 'Bo', row: { personId: 'P-x', listed: true, videoFile: 'FILE-ID-2' } }));
  const host = d.createElement('div');
  host.className = 'card';
  host.innerHTML = '<div class="tile-row">' + tiles + '</div>';
  d.body.appendChild(host);
  const watch = host.querySelector('[data-do="intro-play"]');
  if (!watch) bad.push('the tutor card has no Watch intro tile for an uploaded video');
  else {
    t.ACTIONS['intro-play'](watch);
    if (!host.querySelector('.vid-frame iframe[src*="FILE-ID-2/preview"]')) bad.push('Watch intro did not open the player on the card');
  }
  return bad;
});
