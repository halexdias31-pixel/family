/* @family. — email.gs ONE EMAIL CARD (queue step 8, 22 Nov): every email the site sends is data —
   {subject, heading, cards[], lines[], button, footer} — made into its plain text and its HTML here and nowhere else, in the Sunday
   email's frame and inks (DIGEST_INK, cards-gen.gs). A card is {text, html}, the html the site's card as `renderCard` makes it (the
   digest's questions); the builders only say what goes in. tools/one-email.js holds every one to what it said before. */

/* THE PLAIN TEXT AND THE HTML OF ONE EMAIL. The text is its parts, a blank line between — so a body split at its blank lines into
   `lines` is the same text again. A `button` {label, href} is a line of its own in the text: "label: href". */
function emailOf_(e) {
  e = e || {};
  const ink = digestInk_();
  const lines = (e.lines || []).map(S), cards = e.cards || [];
  const btn = e.button && S(e.button.href) ? e.button : null;
  const text = [].concat(e.heading ? [S(e.heading)] : [], cards.map(c => S(c.text)).filter(Boolean), lines,
    btn ? [S(btn.label) + ': ' + S(btn.href)] : [], e.footer ? [S(e.footer)] : []).join('\n\n');
  const html = (e.heading ? emailP_(esc(S(e.heading)), 'font-size:16px;font-weight:bold;color:' + ink.gold) : '')
    + cards.map(c => S(c.html)).join('')
    + lines.map(l => emailP_(emailLinked_(l, ink))).join('')
    + (btn ? '<p style="margin:16px 0"><a href="' + esc(S(btn.href)) + '" style="display:inline-block;padding:8px 14px;border:1px solid ' + ink.gold
      + ';color:' + ink.gold + ';text-decoration:none">' + esc(S(btn.label)) + '</a></p>' : '')
    + (e.footer ? emailP_(esc(S(e.footer)), 'margin:24px 0 0;color:' + ink.dim + ';font-size:12px') : '');
  return { subject: S(e.subject), body: text, htmlBody: emailFrame_(html) };
}

/* A BODY OF PLAIN TEXT AS AN EMAIL'S LINES: split at its blank lines, so `emailOf_` gives the same text back. */
function emailLines_(body) { return S(body) ? S(body).split('\n\n') : []; }

/* ONE PARAGRAPH, as every email says one. */
function emailP_(t, st) { return '<p style="margin:0 0 12px;' + (st || '') + '">' + t + '</p>'; }

/* A LINE OF PLAIN TEXT AS HTML: escaped, its line breaks kept, and each web address the link it already was in the text. */
function emailLinked_(line, ink) {
  return S(line).split(/(https?:\/\/[^\s"'<>)]+)/).map((part, i) => i % 2
    ? '<a href="' + esc(part) + '" style="color:' + ink.gold + '">' + esc(part) + '</a>'
    : esc(part).replace(/\n/g, '<br>')).join('');
}

/* THE ONE FRAME: ONE TABLE THE WIDTH OF A PHONE, AT MOST 600 — the `width` for Outlook, which reads no max-width; every colour said,
   so a dark inbox inverts all of it or none (380). LIGHTENED (`digestSlim_`, 20 Nov): each style said more than once is said once,
   in the head, as a class. */
function emailFrame_(inner) {
  const ink = digestInk_();
  return digestSlim_(emailDarkDoc_(ink, '<table role="presentation" class="kb" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="' + ink.page + '" style="background:' + ink.page + '">'
    + '<tr><td align="center" class="kb" bgcolor="' + ink.page + '" style="padding:12px 8px;background:' + ink.page + '">'
    + '<table role="presentation" class="kb" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="' + ink.page + '" style="width:100%;max-width:600px">'
    + '<tr><td class="kb" bgcolor="' + ink.page + '" style="font-family:' + ink.mono + ';font-size:14px;line-height:1.5;color:' + ink.ink + ';text-align:left">'
    + '<div class="gs"><div class="gd">' + inner + '</div></div></td></tr></table></td></tr></table>'));
}

/* DARK EVERYWHERE (the owner, 20 Oct): said dark to every client, Outlook's [data-ogsb]/[data-ogsc] held; no Gmail-app gradient, which keeps the black but not the white words (380). */
function emailDarkDoc_(ink, inner) {
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

