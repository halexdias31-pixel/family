/* @family. — backend/write-lock.gs THE ONE WRITE LOCK (unify batch 7): every write that holds the script lock takes it here,
   and the words every refusal and every Drive link share live beside it. tools/one-lock.js fails the build on a copy. */

/* THE HOLD: `fn` runs under the script lock and its answer is returned; a lock not had answers `opts.busy()`
   (default refuse_('err-busy', 'busy')). opts:
     wait        ms to try for the lock (5000);
     block       waitLock, and a lock not had goes ahead unlocked (the lock lapses on its own; the old behaviour);
     keepPayload true: a write made inside leaves the stored payload standing (POST_WROTE put back after the release, even on a throw);
                 'after': the same, but only once `fn` has returned. */
function withWriteLock_(fn, opts) {
  const o = opts || {};
  const lock = LockService.getScriptLock();
  if (o.block) { try { lock.waitLock(o.wait || 5000); } catch (e) { /* the lock lapses on its own; going ahead unlocked is the old behaviour */ } }
  else if (!lock.tryLock(o.wait || 5000)) return o.busy ? o.busy() : refuse_('err-busy', 'busy');
  const wroteBefore = POST_WROTE;
  let out;
  try {
    out = fn();
  } finally {
    if (o.block) { try { lock.releaseLock(); } catch (e) { /* the lock lapses on its own; going ahead unlocked is the old behaviour */ } }
    else lock.releaseLock();
    if (o.keepPayload === true && POST_WROTE && !wroteBefore) POST_WROTE = false;
  }
  if (o.keepPayload === 'after' && POST_WROTE && !wroteBefore) POST_WROTE = false;
  return out;
}

/* A REFUSAL THAT WROTE NOTHING SAYS SO, in these words. */
function nothingSaved_(msg) {
  return msg + ' Nothing was saved.';
}

/* A DRIVE FILE'S PAGE, by id. */
function driveFileUrl_(id) {
  return 'https://drive.google.com/file/d/' + id + '/view';
}
