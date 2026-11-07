/* post-content.gs: doPost's handlers for posts, comments, polls, messages, suggestions and media (1130).
   Named in `postActions_()`, dopost.gs, after its gate; § notes: docs/notes/backend/dopost.gs.md. */

/* ---------- THE LINK EDITOR IS GONE AND IT NEVER HAD A DOOR § */

/* fetch an image so a canvas can use it ------------------------------------------------ A browser cannot draw a Drive photo onto a canvas it intends to export. § */
function postImageData_(body, action, began) {
  const url = S(body.url);
  if (!/^https?:\/\//i.test(url)) return jsonOut({ error: 'Not a URL.' });
  try {
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    if (res.getResponseCode() !== 200) return jsonOut({ error: 'Image fetch returned ' + res.getResponseCode() });
    const blob = res.getBlob();
    // Guard the response size: a data URI is base64, so it's a third larger again, and a huge
    // one would blow the execution's memory for the sake of a picture in a shared note.
    if (blob.getBytes().length > 3 * 1024 * 1024) return jsonOut({ error: 'Image too large to share.' });
    return jsonOut({ success: true,
      dataUri: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()) });
  } catch (err) {
    return jsonOut({ error: 'Could not fetch that image: ' + err });
  }
}

/* ---------- THREE RESOURCE HANDLERS WERE HERE § */

/* --- a post edited: its author while it waits; once up, only an admin's pin and date (413) --- */
function postEditPost_(body, action, began) {
  const t = read(TAB.posts);
  const r = rowById_(t, 'post_id', body.id, body.rowIndex);
  if (!r) return jsonOut({ error: 'No post with that id — it may have been deleted.' });
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  const admin = rankAtLeast_(me, 'admin');
  const state = postState_(r);
  const fields0 = body.fields || {};
  /* WHAT THIS PERSON MAY CHANGE ON THIS POST, NOW: the words while it waits and is theirs; the pin and the date for an admin. */
  const may = [];
  if (state === 'pending' && postIsBy_(r, me)) may.push('caption', 'body', 'location', 'poll');
  if (admin) may.push('pinned', 'posted_on', 'creation_date');
  const asked = Object.keys(fields0).filter(f => POST_EDITABLE.indexOf(f) !== -1);
  const barred = asked.filter(f => may.indexOf(f) === -1);
  if (barred.length) {
    return jsonOut({ error: state === 'up'
      ? 'A post cannot be changed once it is up. Delete it and post again. Nothing was changed.'
      : state === 'refused' ? 'That post was not put up, so it cannot be changed. Nothing was changed.'
      : 'Only the person who posted it can change it while it waits. Nothing was changed.' });
  }
  const fields = {};
  asked.forEach(f => { fields[f] = fields0[f]; });

  /* THE POLL IS NOT FREELY EDITABLE. § */
  if (fields.poll !== undefined) {
    const was = S(r.poll), now = S(fields.poll);
    if (was !== now) {
      const cast = read(TAB.post_votes).rows
        .filter(v => S(v.post_id) === S(r.post_id)).length;
      if (cast) {
        return jsonOut({ error: 'This poll has ' + cast + ' vote' + (cast === 1 ? '' : 's')
          + '. Changing the options would strand them — delete the post and repost, or leave '
          + 'the options as they are.' });
      }
    }
  }

  const wrote = [];
  Object.keys(fields).forEach(f => {
    if (POST_EDITABLE.indexOf(f) === -1) return;
    let v = fields[f];
    /* Written as the same WORDS the sheet already holds. TRUE_ reads 'TRUE', 'yes', '1' and
       a real boolean alike, so writing the word keeps every reader agreeing. */
    if (f === 'pinned' || f === 'active') v = TRUE_(v) ? 'TRUE' : 'FALSE';
    /* A date typed by hand. § */
    /* The form calls it `posted_on` because that is what it has always been called on the
       phone. Where it LANDS is whichever column this sheet keeps. */
    /* THE NAME THE FORM USES IS NOT THE NAME OF THE COLUMN. § */
    let col = f;
    if (f === 'posted_on' || f === 'creation_date') {
      if (!S(v)) return;
      const when = sheetDate(v);
      if (!when) { wrote.push('!posted_on'); return; }
      v = when;
      col = dateCol_(t);
    }
    setCell(t, r, col, v);
    wrote.push(col);
  });

  if (wrote.indexOf('!posted_on') !== -1) {
    return jsonOut({ error: 'That date did not make sense — use DD/MM/YYYY. Everything else '
      + 'was saved.' });
  }
  clearCache();
  return jsonOut({ success: true, wrote });
}

/* LETTING A POST THROUGH, OR TURNING IT DOWN -------------------------------------------- The other half of anybody being able to post. § */
function postApprovePost_(body, action, began) {
  const t = read(TAB.posts);
  const r = rowById_(t, 'post_id', body.id, body.rowIndex);
  if (!r) return jsonOut({ error: 'No post with that id.' });
  if (t.headers.indexOf('approved') < 0) {
    return jsonOut({ error: 'The posts tab has no `approved` column. Open the site once as an admin — '
      + 'nothing was changed.' });
  }
  const yes = TRUE_(body.on);
  const by = S(body.adminName) || S(body.name);
  setCell(t, r, 'approved', yes ? '' : 'REFUSED');
  setCell(t, r, 'approved_by', by);
  setCell(t, r, 'approved_on', new Date());
  clearCache();

  /* TELL WHOEVER POSTED IT, either way. Somebody who put up a photograph and heard nothing
     assumes it was lost; somebody told it was turned down can ask why, which is a conversation
     and not a mystery. */
  const who = findPerson(S(r.author));
  /* `posts` — news about something they made, theirs to turn off (`posts_email`). The post itself is
     on the Posts screen either way. */
  if (who) notify(personDisplayName(who),
    yes ? 'Your post is up' : 'Your post was not put up',
    yes ? 'It is on the Posts screen now.\n\n— @family.'
        : 'It has not been put up. If you would like to know why, just reply.\n\n— @family.', 'posts');

  return jsonOut({ success: true, approved: yes });
}

/* admin deletes a post — `active` FALSE, for the same reason a resource is --------------- Likes, votes and reactions are all rows elsewhere pointing at this § */
function postDeletePost_(body, action, began) {
  const t = read(TAB.posts);
  const r = rowById_(t, 'post_id', body.id, body.rowIndex);
  if (!r) return jsonOut({ error: 'No post with that id.' });
  /* AN ADMIN, ANY POST; ANYBODY ELSE, THEIR OWN — and only to take it down; putting one back is the admin's (413). */
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  const on = TRUE_(body.on);
  if (!rankAtLeast_(me, 'admin') && (on || !postIsBy_(r, me))) {
    return jsonOut({ error: 'Only the person who posted it, or an admin, can delete a post.' });
  }
  setCell(t, r, 'active', on ? 'TRUE' : 'FALSE');
  clearCache();
  return jsonOut({ success: true, active: on });
}

/* posting ------------------------------------------------------------------------------- An admin picks a photograph on their phone and it lands in the Drive § */
function postAddPost_(body, action, began) {
  /* WHO IT IS, FIRST — BEFORE A BYTE GOES INTO DRIVE. § */
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  const iAmAdmin = rankAtLeast_(me, 'admin');
  if (!rankAtLeast_(me, 'client')) return jsonOut({ error: CHILD_NO_UPLOAD, why: 'child' });
  /* A FOLDER ONLY FOR PICTURES (448): a words-only post keeps nothing in Drive. */
  const hasPics = !!(S(body.data) || S(body.image) || (Array.isArray(body.media) && body.media.some(x => S(x).trim())));
  const folder = hasPics ? getPostFolder() : null;
  if (hasPics && !folder) {
    return jsonOut({ error: 'No posts folder. Add a row to the config tab: '
      + 'key `posts_folder`, value the id from the folder URL.' });
  }

  /* ---------- SEVERAL PICTURES AND CLIPS, AND THE FIRST IS STILL WHERE IT ALWAYS WAS § */
  const stamp = new Date().getTime();
  let n = 0;
  /* `driveKeep_` in content.gs, shared with `savePhoto` — the sharing line is written once. */
  const keep_ = raw => driveKeep_(folder, raw, 'post-' + stamp + '-' + (n++));
  const rest = (Array.isArray(body.media) ? body.media : []).filter(x => S(x).trim());
  /* A LIST WITH NOWHERE TO GO IS REFUSED BEFORE ANYTHING IS UPLOADED. § */
  const tp = read(TAB.posts);
  if (rest.length && tp.headers.indexOf('media') < 0) {
    return jsonOut({ error: 'The posts tab has no media column yet, so only one picture could '
      + 'be kept. Run ?setup=1 once, then post again.' });
  }
  /* THE CAPS AND THE QUEUE, BEFORE ANYTHING IS KEPT — `postMediaRefusal_` and `postsWaitingFor_` in content.gs say why each exists. § */
  const refused = postMediaRefusal_([S(body.data), S(body.image)].concat(rest));
  if (refused) return jsonOut({ error: refused });
  if (!iAmAdmin && postsWaitingFor_(tp, me) >= POST_WAITING_MAX) {
    return jsonOut({ error: 'You have ' + POST_WAITING_MAX + ' posts waiting to be approved. '
      + 'Once one of them has been looked at you can post again. Nothing was posted.' });
  }
  let url = '';
  const more = [];
  try {
    url = keep_(S(body.data));
    rest.forEach(x => { const u = keep_(x); if (u) more.push(u); });
  } catch (err) {
    return jsonOut({ error: 'Could not save the picture. ' + driveTrouble_(err, iAmAdmin) });
  }
  /* THE FIRST MAY HAVE COME IN THE LIST, from a phone that sent nothing else. */
  if (!url && more.length) url = more.shift();
  /* WORDS ALONE ARE A POST (448): the composer has no picker; Photos is the camera's. */
  if (!url && !S(body.caption) && !S(body.body) && !S(body.poll)) return jsonOut({ error: 'A post needs a picture or some words.' });

  /* WHO IT IS FROM, which is not the same as who pressed the button. § */
  /* `me` and `iAmAdmin` were worked out here; they are at the top of the action now, so the
     limits above could use them before anything was uploaded. */
  /* POSTING AS THE BUSINESS IS AN ADMIN'S TO DO. § */
  const asBrand = iAmAdmin && norm(body.postAs) !== 'me';
  const t = tp;
  addRow(t, {
    post_id: 'PO' + new Date().getTime(),
    author: asBrand ? brandName() : (personDisplayName(me) || S(body.name)),
    posted_by: personDisplayName(me) || S(body.name),
    image: url,
    image_w: Math.max(0, Math.round(Number(body.imageW) || 0)) || '',
    image_h: Math.max(0, Math.round(Number(body.imageH) || 0)) || '',
    media: more.join(' | '),
    caption: S(body.caption),
    body: S(body.body),
    location: S(body.location),
    poll: S(body.poll),
    /* The FILE's date, not the clock's. They are the same second for something uploaded now,
       and different for anything ever moved or re-uploaded — so reading it from the file is
       the version that stays true. */
    /* WHEN THE PHOTOGRAPH WAS MADE, from the file itself — not the moment somebody pressed Post. § */
    creation_date: (function () {
      try {
        const id = (url.match(/\/d\/([\w-]+)/) || [])[1];
        return id ? DriveApp.getFileById(id).getDateCreated() : new Date();
      } catch (err) { return new Date(); }
    })(),
    uploaded_date: new Date(),
    active: 'TRUE',
    /* YOURS GOES UP. EVERYBODY ELSE'S WAITS. § */
    approved: iAmAdmin ? '' : 'PENDING',
  });
  clearCache();

  /* SOMEBODY HAS TO KNOW IT IS WAITING, or it waits for ever. § */
  /* `approvals` — the admin's to turn off (`approvals_email`), and the card says what that costs: the
     post then waits until somebody opens Posts. */
  if (!iAmAdmin) {
    notify(adminName_(), 'A post is waiting for you',
      personDisplayName(me) + ' has posted a photograph.\n\n'
      + (S(body.caption) ? '"' + S(body.caption) + '"\n\n' : '')
      + 'It is not visible to anybody until you let it through. Open @family. and press the '
      + 'post to approve or turn it down.', 'approvals');
  }

  return jsonOut({ success: true, image: url, media: [url].concat(more), pending: !iAmAdmin });
}

/* listing a tutor ------------------------------------------------------------------------- `listed` decides whether a tutor appears on the site at all. § */
/* ---------- IT LOOKED THE PERSON UP ITSELF, AND HALF THE ROSTER HAS NO `full_name` § */
function postSetListed_(body, action, began) {
  const t = read(TAB.people);
  const who = findPerson(S(body.who), S(body.whoId));
  if (!who) return jsonOut({ error: 'No such person.' });
  /* Written as the word rather than as a blank when off — blank already MEANS listed, for
     every row that predates the column, so an empty cell cannot also mean hidden. */
  setCell(t, who, 'listed', TRUE_(body.on) ? 'TRUE' : 'FALSE');
  clearCache();
  return jsonOut({ success: true, listed: TRUE_(body.on) });
}

/* ONE MESSAGE TO EVERYBODY WAS HERE ------------------------------------------------------- `broadcast` — `sendMessage` without the picker and without the § */

/* reacting ------------------------------------------------------------------------------- One per person per post, and it can be changed or taken back — the § */
function postReactPost_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Sign in to react.' });

  const post = read(TAB.posts).rows.find(x => S(x.post_id) === S(body.postId));
  if (!post) return jsonOut({ error: 'That post is gone.' });

  /* The emoji must be one this post OFFERS. § */
  const allowed = reactionSet(post);
  /* ---------- `want` IS THE FACE TO END ON, AND IT IS SET, NOT TOGGLED § */
  const setting = typeof body.want === 'string';
  const emoji = S(setting ? body.want : body.emoji).trim();
  if ((emoji || !setting) && allowed.indexOf(emoji) === -1) return jsonOut({ error: 'That is not one of them.' });

  /* ---------- UNDER THE SCRIPT LOCK, AND OVER EVERY ROW OF YOURS § */
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonOut({ error: 'Busy — press it again in a moment.', why: 'busy' });
  try {
    clearCache();
    const t = read(TAB.post_reactions);
    const mine = t.rows.filter(x => S(x.post_id) === S(body.postId)
                                 && S(x.person_id) === S(me.person_id));
    const keep = mine[0];
    const to = !setting && keep && S(keep.emoji) === emoji ? '' : emoji;   // the old toggle
    mine.slice(to ? 1 : 0).forEach(x => delRow(t, x));
    if (to && keep) {
      if (S(keep.emoji) !== to) {
        setCell(t, keep, 'emoji', to);
        setCell(t, keep, 'reacted_on', new Date());
      }
    } else if (to) {
      addRow(t, {
        reaction_id: 'RE' + new Date().getTime(),
        post_id: S(body.postId),
        person_id: S(me.person_id),
        emoji: to,
        reacted_on: new Date(),
      });
    }
    clearCache();
    return jsonOut({ success: true, emoji: to });
  } finally {
    lock.releaseLock();
  }
}

/* saying something under a post ------------------------------------------------------------ THE SAME SHAPE AS A REACTION AND A VOTE, one column wider: § */
function postAddComment_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Sign in to comment.' });

  /* ---------- THE SAME THREE ANSWERS `doGet` GIVES, AND THEY ARE READ OFF THE SAME COLUMN § */
  const post = read(TAB.posts).rows.find(x => S(x.post_id) === S(body.postId));
  const state = post ? norm(post.approved) : '';
  const theirs = !!post && S(post.author) && findPerson(S(post.author))
    && S(findPerson(S(post.author)).person_id) === S(me.person_id);
  const seen = !!post && ON_(post.active) && state !== 'refused'
    && (state !== 'pending' || theirs || isAdminPerson(S(body.name)));
  if (!seen) return jsonOut({ error: 'That post is gone.' });

  const text = S(body.body).trim();
  if (!text) return jsonOut({ error: 'Nothing to say?' });
  if (text.length > 2000) {
    return jsonOut({ error: 'That is longer than 2,000 characters. Shorten it a little.' });
  }

  const t = read(TAB.post_comments);
  const id = 'CM' + new Date().getTime();
  addRow(t, {
    comment_id: id,
    post_id: S(body.postId),
    person_id: S(me.person_id),
    body: text,
    said_on: new Date(),
    active: 'TRUE',
  });
  clearCache();
  /* THE POST'S AUTHOR HEARS OF A REPLY (492) — not of their own. */
  const author = post && S(post.author) ? findPerson(S(post.author)) : null;
  if (author && S(author.person_id) !== S(me.person_id)) {
    pushTo_(author, 'posts', personDisplayName(me) + ' replied to your post', text, 'post:' + S(body.postId));
  }
  return jsonOut({ success: true, commentId: id });
}

/* taking one down --------------------------------------------------------------------------- A CELL, NOT A DELETED ROW, and the argument is the one `approved` § */
function postDeleteComment_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Sign in first.' });

  const t = read(TAB.post_comments);
  const row = t.rows.find(x => S(x.comment_id) === S(body.commentId));
  if (!row || !ON_(row.active)) return jsonOut({ error: 'That comment is gone.' });

  if (S(row.person_id) !== S(me.person_id) && !isAdminPerson(S(body.name))) {
    return jsonOut({ error: 'That is not yours to remove.' });
  }
  setCell(t, row, 'active', 'FALSE');
  clearCache();
  return jsonOut({ success: true });
}

/* voting in a poll ----------------------------------------------------------------------- One vote per person per post, and it can be changed. § */
function postVotePoll_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Sign in to vote.' });

  const post = read(TAB.posts).rows.find(x => S(x.post_id) === S(body.postId));
  if (!post) return jsonOut({ error: 'That post is gone.' });

  const opts = S(post.poll).split(',').map(x => x.trim()).filter(Boolean);
  /* `want` IS THE ANSWER TO END ON ('' for none), SET RATHER THAN TOGGLED, and `choice` alone the
     toggle for a phone from before it — `reactPost` above says why, and it is the same fault. */
  const setting = typeof body.want === 'string';
  const choice = S(setting ? body.want : body.choice).trim();
  /* The choice must be one of the OPTIONS. Without this anybody could post any string and it
     would appear as an answer nobody was offered. */
  if ((choice || !setting) && opts.indexOf(choice) === -1) return jsonOut({ error: 'That is not one of the answers.' });

  /* UNDER THE LOCK AND OVER EVERY ROW OF YOURS, as a reaction is. */
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonOut({ error: 'Busy — press it again in a moment.', why: 'busy' });
  try {
    clearCache();
    const t = read(TAB.post_votes);
    const mine = t.rows.filter(x => S(x.post_id) === S(body.postId)
                                 && S(x.person_id) === S(me.person_id));
    const keep = mine[0];
    /* Tapping the answer you already chose takes the vote back — the same gesture that cast it, which is how every poll a person has used already behaves. § */
    const to = !setting && keep && S(keep.choice) === choice ? '' : choice;
    mine.slice(to ? 1 : 0).forEach(x => delRow(t, x));
    if (to && keep) {
      if (S(keep.choice) !== to) {
        setCell(t, keep, 'choice', to);
        setCell(t, keep, 'voted_on', new Date());
      }
    } else if (to) {
      addRow(t, {
        vote_id: 'V' + new Date().getTime(),
        post_id: S(body.postId),
        person_id: S(me.person_id),
        choice: to,
        voted_on: new Date(),
      });
    }
    clearCache();
    return jsonOut({ success: true, choice: to });
  } finally {
    lock.releaseLock();
  }
}

/* messages ------------------------------------------------------------------------------ Send, read, and flag. § */
function postSendMessage_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });

  const to = findPerson(S(body.to), S(body.toId));
  if (!to) return jsonOut({ error: 'We could not find who that was meant for.' });
  if (S(to.person_id) === S(me.person_id)) {
    return jsonOut({ error: 'That is you.' });
  }

  /* THE POLICY, asked once. Both directions are checked: a rule that lets somebody write but
     not be replied to is a rule that produces a one-sided conversation. */
  /* `actingRole_`, NOT `mainRole`: a Tutor box ticked in Settings and not yet approved is not a
     tutor for this question, or the tick would be a way to reach every family on the site. */
  if (!mayMessage(actingRole_(me), actingRole_(to)) || !seesPerson_(seesWhom_(me), to)) {
    return jsonOut({ error: 'You cannot message them directly. An admin can pass it on.' });
  }

  const text = S(body.body).trim();
  /* A MESSAGE MAY BE WORDS, FILES OR BOTH — a photograph with nothing said about it is still
     something sent. Only a message with neither is refused. */
  const files = (Array.isArray(body.files) ? body.files : []).filter(f => f && S(f.data));
  if (!text && !files.length) return jsonOut({ error: 'Nothing to send.' });
  if (files.length && !rankAtLeast_(me, 'client')) return jsonOut({ error: CHILD_NO_UPLOAD, why: 'files' });
  if (text.length > 2000) {
    return jsonOut({ error: 'That is longer than a message should be — 2,000 characters.' });
  }

  /* One every five minutes. Measured from THIS sender's last message to anybody, so a burst
     cannot be spread across recipients to get round it. */
  const t = read(TAB.messages);
  /* A FILE WITH NOWHERE TO GO IS REFUSED BEFORE ANYTHING IS UPLOADED — `addRow` would drop the column with a line in the log and the message would arrive without § */
  /* `admin` DECIDES WHETHER A REFUSAL CARRIES THE FIX — the parent is told it is the site's side
     and the owner is told what to open. See `msgNoColumn_` and `driveTrouble_` in content.gs. */
  const admin = hasRole(me, 'admin');
  if (files.length && t.headers.indexOf('attachments') < 0) return jsonOut(msgNoColumn_(admin));
  const mine = t.rows.filter(r => S(r.from_id) === S(me.person_id));
  const last = mine.reduce((newest, r) => {
    const at = sheetDate(r.sent_at);
    return (at && (!newest || at > newest)) ? at : newest;
  }, null);
  if (last) {
    const waited = Date.now() - last.getTime();
    if (waited < MESSAGE_GAP_MS) {
      const left = Math.ceil((MESSAGE_GAP_MS - waited) / 60000);
      return jsonOut({ error: 'One message every five minutes — ' + left
        + ' minute' + (left === 1 ? '' : 's') + ' to go.' });
    }
  }

  /* Uploaded AFTER every refusal above, so a message turned away by the gap leaves nothing
     behind in Drive. */
  const saved = msgAttachSave_(files, admin);
  /* EVERY REFUSAL FROM HERE ON IS ABOUT THE FILES, so every one offers "Words only". */
  if (saved.error) return jsonOut({ error: saved.error, why: 'files' });

  const id = 'M' + Date.now();
  const row = {
    message_id: id,
    from_id: S(me.person_id),
    to_id: S(to.person_id),
    sent_at: new Date(),
    body: text,
  };
  /* ---------- ONLY WHEN THERE IS SOMETHING TO PUT IN IT § */
  if (saved.list.length) row.attachments = msgAttachIn_(saved.list);
  addRow(t, row);
  clearCache();

  // They find out by email, because nobody sits on a tutoring site waiting for a message.
  const extra = saved.list.length
    ? '\n\n(' + saved.list.length + ' attachment' + (saved.list.length === 1 ? '' : 's')
      + ' — open it on the site.)' : '';
  /* `messages` — theirs to turn off (`messages_email`): the message is in their inbox on the site
     either way, and the sender is not told which. */
  notify(personDisplayName(to), 'A message from ' + personDisplayName(me),
    (text || 'Sent you ' + (saved.list.length === 1 ? 'a file.' : 'some files.'))
    + extra + '\n\n— reply on the site.', 'messages');
  pushTo_(to, 'messages', personDisplayName(me), text || 'Sent you a file.', 'dm:' + S(me.person_id));

  return jsonOut({ success: true, id: id, attachments: saved.list });
}

/* ---------- CHECK UPLOADS § */
function postCheckUploads_(body, action, began) {
  return jsonOut(uploadsCheck_());
}

/* Somebody's conversations. Only their own — an admin reading everything does it in the
   sheet, deliberately, rather than through an endpoint that could be pointed anywhere. */
function postMessages_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  const rows = messagesOf_(me);
  return jsonOut({ success: true, messages: rows, gapMs: MESSAGE_GAP_MS });
}

/* Marking one read. Only the recipient can — a sender marking their own message read would
   make the tick mean nothing. */
function postReadMessage_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Not signed in.' });
  const t = read(TAB.messages);
  const r = t.rows.find(x => S(x.message_id) === S(body.messageId));
  if (!r) return jsonOut({ error: 'Not found.' });
  if (S(r.to_id) !== S(me.person_id)) return jsonOut({ error: 'Not yours to open.' });
  if (!sheetDate(r.read_at)) { setCell(t, r, 'read_at', new Date()); clearCache(); }
  return jsonOut({ success: true });
}

/* Sending one on (413) is the one `suggest` since 494 (`report` since 486): an old phone's `flagMessage` goes the same way. It is NOT deleted. */
function postFlagMessage_(body, action, began) {
  body.kind = 'message'; body.itemId = S(body.messageId); body.note = S(body.reason); body.reason = 'other';
  return postReport_(body, 'report', began);
}

/* JOINING A WAITLIST --------------------------------------------------------------------- A DIFFERENT PRODUCT IN THE SAME SHAPE. § */
/* ---------- OPENING A WAITING LIST WITH NOBODY ON IT § */
/* ---------- STARRING SOMETHING, AND UNSTARRING IT § */
/* ---------- THE SHOP WINDOW, AND WHY A ROW IS SWITCHED OFF RATHER THAN DELETED § */
function postSpotlight_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Sign in first.' });
  if (!isAdminPerson(S(body.name))) return jsonOut({ error: 'Admins only.' });
  const kind = norm(body.kind), itemId = S(body.itemId);
  if (!kind || !itemId) return jsonOut({ error: 'Nothing to spotlight.' });

  const t = read(TAB.spotlight);
  const row = t.rows.find(r => norm(r.kind) === kind && key(r.item_id) === key(itemId));
  const on = TRUE_(body.on) ? 'TRUE' : '';
  if (row) {
    setCell(t, row, 'on', on);
    setCell(t, row, 'who', S(me.person_id));
    setCell(t, row, 'at', new Date());
  } else {
    addRow(t, {
      spot_id: 'S-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      kind: kind, item_id: itemId, on: on, who: S(me.person_id), at: new Date(),
    });
  }
  clearCache();
  return jsonOut({ success: true, on: !!on });
}

function postFavourite_(body, action, began) {
  const me = findPerson(S(body.name), S(body.personId));
  if (!me) return jsonOut({ error: 'Sign in first.' });
  const kind = norm(body.kind), itemId = S(body.itemId);
  if (!kind || !itemId) return jsonOut({ error: 'Nothing to favourite.' });

  const t = read(TAB.favourites);
  const mine = t.rows.find(r => key(r.person_id) === key(me.person_id)
    && norm(r.kind) === kind && key(r.item_id) === key(itemId));

  if (TRUE_(body.on)) {
    /* ALREADY THERE IS A SUCCESS, not an error. Two taps on a slow connection, or the same
       thing starred on a phone and a laptop, must not produce a complaint about something the
       person plainly wanted. */
    if (!mine) {
      addRow(t, {
        fav_id: 'F-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        person_id: S(me.person_id), kind: kind, item_id: itemId,
        at: new Date(),
      });
    }
  } else if (mine) {
    /* DELETED, NOT FLAGGED. An unfavourite leaves nothing worth keeping — there is no history
       anybody wants of things somebody stopped liking, and a tab full of dead rows makes the
       live ones slower to find. */
    delRow(t, mine);
  }
  clearCache();
  return jsonOut({ ok: true, on: TRUE_(body.on) });
}

/* ---------- SUGGEST A CHANGE (494): one `claude_notes` row ----------
   An admin's is open at once and in the Drive file; anybody else's waits (`pending`) for Confirm or Dismiss. */
function postReportQuestion_(body, action, began) {
  body.kind = 'question'; body.itemId = 'q:' + S(body.questionId).trim();
  return postSuggest_(body, 'suggest', began);
}

function postReport_(body, action, began) {
  return postSuggest_(body, 'suggest', began);
}

function postSuggest_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id) || !rankAtLeast_(me, 'student')) return jsonOut({ error: 'Sign in first.' });
  const kind = norm(body.kind);
  if (!REPORT_KIND_RE.test(kind)) return jsonOut({ error: 'Which thing? Nothing was sent.' });
  const item = S(body.itemId).trim();
  /* A SHOP ITEM'S ID IS ITS NAME (498), spaces and brackets and all: "Gooey Louie (board game)" was refused, so Suggest on the shop did nothing. */
  if (item.length > REPORT_FIELD_MAX || !/^[A-Za-z0-9][A-Za-z0-9 _.:|#\/()'&,+-]*$/.test(item) || (kind === 'question' && !/^q:./.test(item)))
    return jsonOut({ error: 'Which one? Nothing was sent.' });
  /* AN OLD PHONE'S REASON IS KEPT AS WORDS in front of the note. */
  const why = Object.prototype.hasOwnProperty.call(REPORT_REASONS, S(body.reason)) && S(body.reason) !== 'suggest' ? REPORT_REASONS[S(body.reason)] : '';
  const words = S(body.note).trim().slice(0, CLAUDE_NOTE_MAX);
  const note = [why, words].filter(Boolean).join(' — ');
  const people = kind === 'message' || kind === 'post';
  /* A MESSAGE MAY BE SENT WITHOUT WORDS (413): a child need not explain why one frightened them. */
  if (!note && !people && !(body.files && rankAtLeast_(me, 'admin'))) return jsonOut({ error: 'Write what should change first.' });
  const admin = rankAtLeast_(me, 'admin');
  let msg = null;
  if (kind === 'message') {
    msg = read(TAB.messages).rows.find(x => S(x.message_id) === item);
    if (!msg) return jsonOut({ error: 'Not found.' });
    if (S(msg.to_id) !== S(me.person_id) && !admin) return jsonOut({ error: 'Not yours to send on.' });
  }
  /* A PICTURE WITH IT (498): one image, shrunk on the phone, kept in the posts folder and named on the note as a link. */
  let pic = '';
  const img = S(body.image).trim();
  if (img) {
    if (!/^data:image\/(jpeg|png|webp);base64,/i.test(img) || img.length > SUGGEST_PIC_MAX) return jsonOut({ error: 'That picture could not be sent — try a smaller one.' });
    const folder = getPostFolder();
    if (!folder) return jsonOut({ error: 'No posts folder for the picture. Add `posts_folder` to the config tab.' });
    try { pic = driveKeep_(folder, img, 'suggest-' + Date.now()); } catch (err) { return jsonOut({ error: 'The picture could not be kept in Drive.' }); }
  }
  /* AND THE FUNNEL PATH ON FIND (498): which answers and words led to the card, so the note says which menu it meant. */
  const path = S(body.path).replace(/\s+/g, ' ').trim().slice(0, 300);
  /* FILES (515), an admin's alone: already in Drive by `suggestUpload`; the note names the folder and the files. */
  const filesLine = admin ? inboxLine_(body.files) : '';
  const noteAll = [note || (people ? 'A message they were sent' : ''), path ? 'Path: ' + path : '', pic ? 'Picture: ' + pic : '', filesLine].filter(Boolean).join('\n');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonOut({ error: 'Busy — try again in a moment.', why: 'busy' });
  let out = {}, made = null;
  const wroteBefore = POST_WROTE;
  try {
    clearCache();
    const t = read(TAB.claude_notes);
    if (!t.sheet) out = { error: 'Suggestions are not set up yet — an admin opening the site sets them up.', why: 'no-tab' };
    else {
      const pid = S(me.person_id), today = reportDay_(new Date()), key = kind + '|' + item;
      /* ONCE A DAY PER THING PER PERSON, while it waits: two taps are one suggestion. */
      const had = !admin && t.rows.find(r => S(r.made_by) === pid && S(r.item_id) === key && norm(r.status) === 'pending' && reportDay_(r.made_at) === today);
      if (had) out = { success: true, already: true };
      else {
        made = suggestRow_(t, pid, kind, item, reportCut_(body.label, REPORT_FIELD_MAX), noteAll, admin ? 'open' : 'pending');
        out = { success: true, serious: admin, id: made.note_id };
      }
    }
  } finally {
    lock.releaseLock();
  }
  if (made && admin) { clearCache(); out.notes = claudeNotesOpen_(); try { out.file = claudeNotesWrite_(out.notes); } catch (err) { out.fileError = S(err && err.message || err); } }
  if (made && !admin && POST_WROTE && !wroteBefore) POST_WROTE = false;
  /* `reported` — ESSENTIAL: a message sent on is a safeguarding matter and the admin is told at once (413). */
  if (made && msg && !admin) {
    notify(adminName_(), 'A message was sent to you to look at',
      'From ' + personDisplayName(me) + '\n\n' + (S(made.note) || 'No words given')
      + '\n\nMessage id: ' + item + '\n\nIt is still in the messages tab; it waits on Business → Suggestions.', 'reported');
  }
  return jsonOut(out);
}

/* ---------- FILES FOR CLAUDE (515): one part of one file into Drive "Claude inbox". Admin only, at the gate; nothing goes in the sheet. */
function postSuggestUpload_(body, action, began) {
  try { return jsonOut(inboxPart_(body)); } catch (err) { return jsonOut({ error: S(err && err.message || err) }); }
}

/* ---------- THE SUGGESTIONS WAITING, FOR THE BUSINESS COLUMN (494). Admin only, at the gate. ---------- */
function postListSuggestions_(body, action, began) {
  clearCache();
  const list = claudeNotesPending_();
  return jsonOut({ success: true, open: list.length, suggestions: list.slice(0, REPORTS_LIST_MAX), messages: flaggedMessages_() });
}

/* ---------- AND ONE DECIDED: confirm sends it to Notes for Claude, dismiss drops it ---------- */
function postDecideSuggestion_(body, action, began) {
  const how = norm(body.decision);
  if (how !== 'confirm' && how !== 'dismiss') return jsonOut({ error: 'Confirm or dismiss.' });
  /* A MESSAGE FLAGGED BEFORE 486 is closed on its own row: `flagged` CLEARED, kept for the record. */
  if (norm(body.kind) === 'message' && !/^N-/.test(S(body.id))) {
    const tm = read(TAB.messages);
    const mr = tm.rows.find(r => S(r.message_id) && S(r.message_id) === S(body.id));
    if (!mr) return jsonOut({ error: 'That message is not there any more.' });
    setCell(tm, mr, 'flagged', 'CLEARED');
    clearCache();
    return jsonOut({ success: true, id: S(mr.message_id), kind: 'message' });
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonOut({ error: 'Busy — try again in a moment.', why: 'busy' });
  let out = {};
  try {
    clearCache();
    const t = read(TAB.claude_notes);
    const row = t.sheet ? t.rows.find(r => S(r.note_id) && S(r.note_id) === S(body.id) && norm(r.status) === 'pending') : null;
    if (!row) out = { error: 'That suggestion is not there any more.' };
    else {
      setCells(t, row, how === 'confirm' ? { status: 'open' } : { status: 'dismissed', done_at: new Date() });
      out = { success: true, id: S(row.note_id), decision: how };
    }
  } finally {
    lock.releaseLock();
  }
  if (out.success) {
    clearCache();
    out.notes = claudeNotesOpen_();
    out.reportedItems = reportedItems_();
    if (how === 'confirm') { try { out.file = claudeNotesWrite_(out.notes); } catch (err) { out.fileError = S(err && err.message || err); } }
  }
  return jsonOut(out);
}

/* ---------- NOTES FOR CLAUDE (484): an admin's words on one widget or card, a row in `claude_notes` and the Drive file rewritten ---------- */
function postClaudeNoteAdd_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !rankAtLeast_(me, 'admin')) return jsonOut({ error: 'Not authorised.' });
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return jsonOut({ error: 'Busy — try again in a moment.', why: 'busy' });
  let out = {};
  try {
    clearCache();
    const t = read(TAB.claude_notes);
    if (!t.sheet) out = { error: 'Notes are not set up yet — an admin opening the site sets them up.', why: 'no-tab' };
    else if (action === 'claudeNoteAdd') {
      const note = S(body.note).trim().slice(0, CLAUDE_NOTE_MAX), item = S(body.itemId).trim().slice(0, 120);
      if (!note) out = { error: 'Write what should change first.' };
      else if (!item) out = { error: 'Which widget? Nothing was sent.' };
      else {
        const id = 'N-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        addRow(t, { note_id: id, made_at: new Date(), made_by: S(me.person_id), column: S(body.column).trim().slice(0, 40),
                    item_id: item, item_label: S(body.itemLabel).trim().slice(0, 200), note: note, status: 'open', done_at: '' });
        out = { success: true, id: id };
      }
    } else {
      const row = t.rows.find(r => S(r.note_id) && S(r.note_id) === S(body.id));
      if (!row) out = { error: 'That note is not there any more.' };
      else { setCells(t, row, { status: 'done', done_at: new Date() }); out = { success: true, id: S(row.note_id) }; }
    }
  } finally {
    lock.releaseLock();
  }
  if (out.success) {
    clearCache();
    out.notes = claudeNotesOpen_();
    try { out.file = claudeNotesWrite_(out.notes); } catch (err) { out.fileError = S(err && err.message || err); }
  }
  return jsonOut(out);
}

/* ---------- THE FILMS, FILLED FROM THE NOTFLIX FOLDER § */
function postFilmsSync_(body, action, began) {
  const me = findPerson('', S(body.personId));
  if (!me || !hasRole(me, 'admin')) return jsonOut({ error: 'Only an admin can sync the films.' });
  let out;
  try { out = filmsSync_({ budgetMs: FILMS_SYNC_BUDGET_MS }); }
  catch (err) { return jsonOut({ error: 'The films could not be synced: ' + S(err && err.message || err) }); }
  if (out.error) return jsonOut({ error: out.error, why: out.why });
  return jsonOut(Object.assign({ success: true }, out, { films: filmsFor_(me), sync: filmsSyncSays_() }));
}

/* THE RACER'S MAP (426) — the gate already refused anybody not an admin. */
function postRaceBuild_(body, action, began) {
  let out;
  try { out = buildRaceMap_(''); }
  catch (err) { return jsonOut({ error: 'The map could not be built: ' + S(err && err.message || err) }); }
  if (out.error) return jsonOut({ error: out.error, more: !!out.more, tried: out.tried || [], notes: out.notes || [] });
  return jsonOut(Object.assign({ success: true }, out));
}

/* ---------- AN ADMIN'S REELS AND VIDEOS (404) — the gate already refused anybody not an admin. */
function postMediaSave_(body, action, began) {
  return jsonOut(mediaWrite_(action, body));
}
