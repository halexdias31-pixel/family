# Cheaper to work on: comments a line or two, the story in docs/notes

The owner, 18 Oct: *"Also is there anything you can do to the code to make usage of Claude substantially
cheaper? If so please do it. And I mean do it to the max so my Claude usage rate drops as much as
possible."*

## What it cost

Every byte an agent reads is paid for, and most of the bytes here were comments. Measured over 350b21d
with acorn: comments were 74% of js/find.js, 78% of js/shell.js, 80% of js/book.js and 75% of
style.css; across the site's JavaScript about half, and the backend about half. A single Read of a
function brought its whole history with it, every time, for every agent.

## What changed

- **`tools/comments.js`.** Any comment whose source text (delimiters included) is over 240 characters
  becomes one line: its headline and ` §`. The headline is a banner's title (keeping its `---------- `
  lead, because check-chess and check-loading cut blocks at banners), otherwise the first sentence of
  20 characters or more, at most 160, never stopped inside a quote, a code span or an aside. `//`
  stays `//`, `/* */` stays `/* */`, `<!-- -->` stays HTML; a comment alone on its lines stays alone
  at its indent, a trailing one stays trailing.
- **The proof is in the tool.** After rewriting, a JS or GS file's token stream — each token's text and
  whether a line break stands before it, so ASI and `return` are covered — must equal the original's;
  CSS and HTML must be equal with comments removed and whitespace normalised, and every inline script
  token-equal. Otherwise the file is not written and the tool exits 1.
- **Nothing is lost.** The full original text goes, verbatim, to `docs/notes/<path>.md` under a
  `### <headline>` heading and the name it sat in. Append-only; a second run changes nothing.
- **Kept verbatim whatever their length:** linter and tool directives, licences, source maps (the
  `KEEP` list at the top of the tool, a reason each).
- **`js/check-comments.js`** (in check-all's fast set) fails on a comment over 240 characters and
  names `node tools/comments.js` as the fix.
- **CLAUDE.md**: comments say WHY in a line or two; the story goes in docs/history; "match the density
  of the file you are in" is gone.

## For the next change

Write the reason in the code in a line or two. If it needs a paragraph — what broke, what was tried,
what the owner said — that paragraph is a docs/history note, and the comment points at its number.
