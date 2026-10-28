# 496 — The Rules card

> "a list which shows me the unique rules which apply in some places and not others, and I can then decide whether to make it apply
> universally or not. And a button to undo in case I need it. I think this will force us to make the site even more stable."

## What it is

- `js/rules.js` (loaded after `shell`) holds `RULES`: every special case in the code, one row each — the exception said plainly,
  where it applies, what Universal does instead, and `lock` (a one-line reason) when it cannot be universal.
- Each exception's code path asks `ruleOn_(id)` — true while the exception is in force (the default), false once the admin made it
  universal. A locked rule, or an id nobody registered, is always in force. The two CSS-only rules (`tap-44`, `search-icon`) are said on
  the root as `data-uni` and undone by `:root[data-uni~="…"]` rules in style.css.
- **The Rules card** is on the Site column (admin only, `site:rules` in `CARD_REG`): one line a rule, an Exception / Universal switch
  (buttons: it is a form), locked rules showing "Locked: why". **Undo** (a tile) takes back the last rule change. The layout still has no
  undo (477); this undo is for rules only.
- Saved for everybody on config's `rules` row by `rulesSave` (admin only): `{set: {id: 'universal'}, hist: [{id, was, to, at}]}`, the
  last twenty changes kept for Undo. `rulesClean_` (core.gs) keeps only known, unlocked ids (`RULE_IDS`, `RULES_LOCKED` in
  constants.gs); `doGet` sends it as `rules`. A phone keeps a copy (`familyRules`) for the first paint.

## The rules (14, six locked)

| id | Exception | Universal |
|---|---|---|
| `tap-44` | keypad keys and multiple-choice options 44px, tiles 22px (487) | they shrink to 22px |
| `search-icon` | the search magnifier 18px, marks 10px (487) | 10px |
| `whole-widgets` | `WIDGET_WHOLE` cannot merge (480) | Merge on them |
| `library-one-card` | Library cards holds one card (489) | every slot, Add another |
| `tell-admin` | messages and posts say "Tell the admin" (494) | "Suggest a change"; the safeguarding path stays |
| `scripture-age` | Bible, Talmud, Quran 18+ (490) | no age limit |
| `kjv-admin` | the Bible admin-only (490) | anyone of age (id avoids the word: check-bible forbids it in backend code) |
| `finder-members` | signed out, the finders are "Members only" (400) | signed out sees them |
| `keep-basket` | locked: the basket is the one place an order is paid | |
| `admin-cols` | locked: a card moved onto an admin column vanishes for everyone else | |
| `people-no-merge` | locked: people cannot be stacked on one page | |
| `items-no-move` | locked: festive card, Camera, Daive's card have no moving code | |
| `form-save-row` | locked: joining a form's Save row broke a section's Save (489) | |
| `find-front` | locked: Find's front pages are drawn once with fixed ids | |

## Checks

`js/check-rules.js` (in check-all): every `ruleOn_` id registered, every rule asked somewhere, the backend's ids and locks the same as
the registry, and a list of exception markers (`in WIDGET_WHOLE`, `LAYOUT_KEEP.indexOf`, `'Tell the admin'`, a fixed scripture age, the
one-card shelf, the admin columns' gate, the members-only finder, the form's Save row) each beside its rule — a new special case without
a rule fails the build. Mutation: making `suggestTell_` ignore the rule failed it. Journey "the Rules card (496)" in check-flow: the
admin flips `tell-admin`, a client reloads to "Suggest a change", Undo restores it, a locked rule has no switch and the real backend
refuses it, a client cannot save. Backend and css 2026-10-28-rules.
