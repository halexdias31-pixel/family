# 417 — GCSE History: six new chapters and eight animations (2026-10-24)

**Asked for as** History (GCSE — the common AQA and Edexcel options): an inventory of what was there; chapters for
Medicine through time, Germany 1890–1945, the Cold War, Elizabethan England, Norman England, America and the causes
of the First World War, and a History skills chapter (source analysis by nature, origin and purpose; interpretations;
the "how far do you agree" essay); accurate dates, key terms and causation chains; animations — timelines, a
causation web, changing maps, a hyperinflation counter, a source-analysis zoom and a "how far" balance.

## What was there

`TB-GCSE-HIST`, ten chapters in the order of AQA 8145: 1 Skills and question types; 2 Kaiser and Weimar, 1890–1929;
3 Hitler's rise to power; 4 Life under the Nazis; 5 Peace treaties and the League; 6 The road to war; 7 Medicine,
c1000 to c1800; 8 Medicine since 1800; 9 Elizabeth, court and society; 10 Troubles at home and abroad. Seven key words
and five worked lines each, no topics (the question library has no History topics), no animations. Germany,
Conflict and tension 1918–39, Health and the people and Elizabethan England were covered; the Cold War, Norman
England, America, the First World War's causes and the essay and source skills in any depth were not.

## What is new

Six chapters, 11–16, AQA 8145 like the rest, each `lib_pending` (below), with seven to nine key words and five
worked lines:

| Ch | Title | Covers (and the Edexcel option it matches) |
|---|---|---|
| 11 | History skills: sources, interpretations, essays | NOP, content and context, utility, interpretations (differ, why, how convincing), the "how far" plan, PEEL |
| 12 | Causes of the First World War, 1894–1914 | MAIN, the alliances 1882–1907, the naval race, Schlieffen, Morocco 1905 and 1911, Bosnia 1908, Sarajevo and the July Crisis to 4 August |
| 13 | Cold War: conflict and tension, 1945–1972 | Yalta, Potsdam, the Iron Curtain speech, Truman and Marshall, the Blockade, NATO and the Warsaw Pact, Korea, Hungary and Prague, the Wall, Cuba (Superpower relations) |
| 14 | Norman England, c1066–c1100 | the claimants, Fulford, Stamford Bridge, Hastings, the revolts, the Harrying, castles, feudalism, Lanfranc, Domesday (Anglo-Saxon and Norman England) |
| 15 | America, 1840–1895: expansion and consolidation | Manifest Destiny, the Trail, the Mormons, the gold rush, Fort Laramie, the Civil War, the Homestead Act, the railroad, Little Bighorn, the Dawes Act, Wounded Knee (the American West) |
| 16 | Health and the people: factors and turning points | the factors, continuity, penicillin and sewers as causation chains, surgery's three problems, the "was war the main factor" judgement (Medicine in Britain) |

The cover's summary now names sixteen chapters and the Edexcel options that cover the same ground. Germany and
Elizabethan England already had their chapters, so they were upgraded with drawings, not rewritten.

## The animations

Eight, each a `tools/h_<topic>.py` writing its row through `tools/anim_row.py`, a splashes row each, hung on a key
word of its chapter:

| id | Script | Chapter, about | What it teaches |
|---|---|---|---|
| `hinf` | h_inflation.py | 2, Hyperinflation | the loaf in Berlin: 0.63 marks (1918), 163 (1922), 250 (Jan 1923), 3,465 (Jul), 1,512,000 (Sep), 201,000,000,000 (Nov), on a ×10-a-notch scale; then $1 = 4.2 trillion marks and the Rentenmark |
| `hweim` | h_weimar.py | 3, Depression | a time line 1919–33 as a causation chain: crises, Golden Years, the Crash, Nazi seats 12 → 107 → 230, 30 January 1933 |
| `hexp` | h_expand.py | 6, Anschluss and Sudetenland | a sketch map: the Saar, the Rhineland, Austria, the Sudetenland, the Czech lands and Memel, then Poland invaded |
| `hnop` | h_nop.py | 11, Nature, Origin, Purpose | Punch's "The Gap in the Bridge" (December 1919) on paper, a magnifier on N, O and P, then context and a judgement of its use |
| `hbal` | h_balance.py | 11, Judgement | "Versailles caused Weimar's crises, 1919–23": three weights each side, a criterion, "largely agree" and its limit |
| `hweb` | h_web.py | 12, MAIN | the four long-term causes join WAR with the link that says how, then Sarajevo and the July Crisis |
| `hcur` | h_curtain.py | 13, Iron Curtain | Europe as a tile map, one square a country so every name reads on a phone: satellites, Churchill's line, NATO, the Warsaw Pact, the Wall |
| `hmed` | h_medicine.py | 16, Turning point | eleven turning points from 1348 to 1948, each tagged with its factor |

- **The two maps are sketches, said so in their scripts.** The German one is borders simplified from longitude and
  latitude; the Cold War one is a tile map, chosen because twenty-four countries drawn to scale at 390 px leave the
  small ones unreadable. Neither claims to be surveyed.
- **Every number is one the chapter states** or a standard textbook figure (the bread prices, the seats), so the drawing
  and the words never disagree.
- The colours are each drawing's own custom properties (red for crisis and war, green for recovery, blue for the West);
  the source in `hnop` is paper, so it is drawn in the paper tokens.
- `SPLASH_CACHE_MAX` 200 000 → 400 000 (the same number 410 chose for GCSE Maths): the 37 rows come to about 264 000.
- Screenshots at 390 px, looked at, several moments of each: the loaf at 2.5 s, 9 s, 13 s; Weimar at 6 s and 15 s;
  the map at 11 s and 17 s; the Curtain at 7.5 s and 16 s; the web at 11 s and 16 s; NOP at 4, 7.5 and 10.5 s; the
  balance at 6.2 s and 15 s; the turning points at 16 s. Fixed from them: the Curtain's Trieste label shared the
  class `hcur-tr` with Turkey's tile, so Turkey turned blue at the start; the July Crisis label sat on the Sarajevo
  box; the November 1932 seats bar collided with July's.

## `lib_pending` — a new card before its words are imported

The words of a new chapter cannot be pushed from a session (397, 407): they go in a Drive import the owner taps. The
card goes by git and can arrive first. So a new card row carries `lib_pending: "True"`; the site shows its title,
tags and **Coming soon.** instead of the loader until `libItems` brings the words, and asks for them as for any card;
`check/lib-full.js` reads such a row with no words on this machine as a card only instead of failing ("run pull");
`check-textbooks` counts it rather than holding it to the key-word rules. docs/library.md has the convention, which
other sessions adding content use too. The words for chapters 11–16 are in `data-private/` on the machine that wrote
them and in an import file made by `drive-pack --ids TB-GCSE-HIST#11,…,#16`, outside the repository.

## Checks

- `check-flow`, new journey: a `lib_pending` History card, served card-only with `libItems` held, is the waiting
  card with its title, "Coming soon" and no loader; `ct:TB-GCSE-HIST#11` is asked for; when the reply comes it is
  drawn whole with its first key word. Proved by mutation (the Coming soon line removed: red, "it shows the loader").
- `check-textbooks` and `check-anims` green with the words, and again with `data-private/` moved away (seeded from the
  pinned commit, which has no chapters 11–16): "6 new chapter(s) (lib_pending) with no words on this machine".
- `check-anims`: each of the eight scripts re-run on a copy of the books leaves its row byte for byte.
