# The Settings spreadsheet's documentation tabs

**Thirty-seven tabs of design notes that no code has ever read.** They sat in the `Settings`
spreadsheet behind names beginning with an underscore, which is that file's own convention for
*read by nobody* — the third of the three tab colours CLAUDE.md records (green written by the app,
gold read by it, grey read by nobody).

**They are here because the spreadsheet is being deleted and this is the half of it that cannot be
regenerated.** The data tabs are rows a machine can rebuild from what the app does; these are
somebody sitting down and writing out *why* — the rule, the reason, and the file it lives in. That
is the same thing CLAUDE.md opens by saying is the most valuable thing in this repository, and it
was one delete away from going.

**Nothing reads them and nothing is meant to.** They are prose for a person, rendered from the
sheet's own columns into a table per tab, verbatim. Where a tab carried a title row above its
header — the `WIDGET` tabs did — that line is the sentence under the heading.

| | |
|---|---|
| `api.md` | **81 actions**: who may call each one, what it sends, what it returns, which tabs it touches and what it refuses. The most useful file here |
| `booking.md` · `finder.md` · `shell.md` · `posts.md` · `money.md` · `widgets-rules.md` | the rules each surface is built to, one row per rule, each with a `because` and a `source` |
| `search.md` · `result.md` · `post.md` · `profile.md` · `camera.md` · `reel.md` · `dm.md` · `cart.md` · `shop.md` · `calculator.md` · `timer.md` · `notepad.md` · `docket.md` · `mat.md` · `flyer.md` · `week.md` | one per widget, same shape |
| `style.md` · `geometry.md` · `surfaces.md` · `states.md` · `gestures.md` | the look: fifty tokens, the box model, what may open over what, what a screen does while it waits, what a finger does |
| `dictionary.md` | **67 columns** across the tabs — type, whether required, what is allowed, an example |
| `glossary.md` · `roles.md` · `kinds.md` · `nongoals.md` · `spine.md` · `components.md` | the vocabulary, who may do what, what the funnel sorts things into, what this app deliberately is not, the booking spine, and the component register |
| `rogue.md` | **13 lists that live in code and arguably should not** — each with a verdict (MOVE / DELETE / KEEP) and a reason. Written before any of this migration; worth reading against it |
| `sheet-readme.md` | the spreadsheet's own front page, explaining the tab colours |

**Some of it is out of date and that is fine.** `reel.md` says "NOT BUILT" about a column that is
built, `cart.md` describes a checkout that is still a toast. A design note that has been overtaken
is a record of what was intended, which is exactly what you want when you are wondering why
something is shaped the way it is. Nothing here is a specification anybody is obliged to follow.
