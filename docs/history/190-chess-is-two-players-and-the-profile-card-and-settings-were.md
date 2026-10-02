## Chess is two players, and the profile card and settings were tidied in the same batch

**Chess** lost its opponent and became a pass-the-phone game, with `js/check-chess.js` on the roster:
perft counts from the start position, Kiwipete and position 3 against the published numbers, plus
castling, en passant and promotion cases — the move generator is the half a player cannot see
failing. **The favicon is its own circle** (`favicon.png`, cut by `tools/make-favicon.py`), and the
triangle splash was redone.

**The settings form**: a qualification carries its received year (or Present) and two ticks —
teach, specialise — so the "What you teach" and "Studying now" pages are gone and `teaches_*` is
derived from the ticks; the phone is a country code plus a number packed into one cell; minimum and
maximum students are one `[] – []` row; Where and Where you are are one page; DofE Gold and Young
Citizens Bar Mock Trial are on the extra-qualifications list. **The profile card** puts the rate by
the name, reads `1–4 students` and `1+ hour`, and draws qualifications as chips. **Admin** has a card
for his cut on an extra child (`boss_rate` in config), and **tutors** have a draft agreement whose
tick cannot be undone (`agreement_signed_at`, `agreement_version`). **Messages** draw each person's
own photograph. **Herd Mentality, Charades and Articulate** each gained 400 prompts, with the
cross-deck duplicate rule still enforced.

**Needs `?setup=1` after the backend deploys**, for `people.quals`, `people.teaches_also`,
`people.agreement_signed_at`, `people.agreement_version`, `posts.media` and
`messages.attachments`.
