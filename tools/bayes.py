# The Bayes splash (#splash-bayes): writes the <div> into index.html and the rules and @keyframes into
# style.css, both from the handful of numbers below. Run: python3 tools/bayes.py
#
# WHAT IT SHOWS, the classic test question every student gets wrong the first time: a test that is
# right nine times in ten, and a positive result that still means only a coin's worth of having it.
#   100 people, a 10 x 10 grid of grey dots;                       "100 people take a test"
#   the 10 who have it turn gold (the top row: ten in a hundred is one row in ten — the prior is
#   the area);                                                      "10 of them have it"
#   the test rings 9 of those 10 — the true positives;              "it finds 9 of those 10"
#   and rings 9 of the 90 who do not — the false positives;         "and wrongly flags 9 of 90"
#   everybody who tested negative leaves, and the 18 ringed dots slide into two rows of nine, the
#   gold ones over the grey ones, with P(has it | +) = 9 ÷ (9 + 9)  "9 of 18 positives · 50%"
#   then everyone goes back where they started, so 100% and 0% are the same picture.
#
# WHY THE SAME NINE TWICE. The point of the example is that a small error rate on a BIG group (10%
# of the 90 well) is as many people as a large hit rate on a SMALL group (90% of the 10 ill). Two
# rows of nine, one gold and one grey, of equal length, is that sentence as a picture — which is why
# the regrouping is the climax and the caption only confirms it.
#
# THE NUMBERS LIVE HERE AND NOWHERE ELSE. Every caption is built from them, and check-css.js
# recomputes TP / (TP + FP) from the markup — counting gold dots, rings and the four classes — and
# fails if a caption or a dot was edited by hand into disagreement.
#
# HOW IT MOVES — transform and opacity only, as every rebuilt splash: a person is a <g> with one of
# four classes, the four cells of the table a Bayes question is (by-tp, by-fn, by-fp, by-tn). The
# negatives fade; the positives carry `--go`, a translate in viewBox units (`transform-box: view-box`,
# as #splash-pyth's cells do), to their place in the two rows. The gold is a second circle over the
# grey one fading in; the ring scales in from 1.9x. One clock, T seconds, everything `infinite`.
import re, pathlib

PEOPLE = 100
COLS = 10
HAVE = 10                     # the prior: the whole top row
FN_COL = 6                    # the one with it whom the test misses
# The well people the test wrongly flags, (row, column): one per row, scattered, so the false positives
# read as chance landing anywhere rather than a pattern.
FP = [(1, 3), (2, 8), (3, 1), (4, 6), (5, 9), (6, 4), (7, 0), (8, 7), (9, 2)]

T = 9.6                       # seconds, one whole loop
STEP = 10                     # viewBox units between dots
R = 2.9                       # a dot
RING = 4.1                    # the test's ring round it — under half a STEP with its stroke,
                              # or two neighbours' rings touch and read as one chain
ROW_TP, ROW_FP = 34, 60       # where the two rows of positives land
LAB_TP, LAB_FP = 25, 51       # and the words over them
EQ1, EQ2 = 80, 92             # the two lines of the sum
VW, VH = 100, 100             # the grid is the whole box; the answer is laid out inside it

TP = HAVE - 1
assert len(FP) == len(set(FP)) and all(r >= 1 for r, _ in FP)     # every false positive is well
WELL = PEOPLE - HAVE
POST = TP / (TP + len(FP))

def pct(t): return ('%.2f' % (100 * t / T)).rstrip('0').rstrip('.') + '%'
def g(v): return ('%.2f' % v).rstrip('0').rstrip('.')
def xy(r, c): return 5 + STEP * c, 5 + STEP * r

# ---- the timeline, in seconds ----------------------------------------------------------------------
GOLD = (1.0, 1.4)             # the prior turns gold
LIT_TP = (2.6, 3.0)           # the test finds the ill
LIT_FP = (4.0, 4.4)           # and flags the well
OUT = (5.4, 5.9)              # the negatives leave
GO = (5.7, 6.5)               # the positives regroup
LAB = (6.4, 6.8)              # the rows are named and the sum written
HOLD = 8.9                    # until here
BACK = (9.0, 9.45)            # and everyone goes home
UNRING = (8.9, 9.1)           # the rings go first, IN PLACE — fading while they grew back to
                              # their 1.9x start read as a burst of bubbles over the regrouping
SAYS = [  # (text, in, out) — the first is up at 0% and back by 100%, so the seam is a held caption
  ('100 people take a test', None, 1.05),
  ('<b>%d</b> of them have it' % HAVE, 1.15, 2.5),
  ('it finds <b>%d</b> of those %d' % (TP, HAVE), 2.6, 3.9),
  ('and wrongly flags <i>%d</i> of %d' % (len(FP), WELL), 4.0, 6.3),
  ('<b>%d</b> of %d positives · %d%%' % (TP, TP + len(FP), round(100 * POST)), 6.5, HOLD),
]

# ---- the people ------------------------------------------------------------------------------------
tp_cols = [c for c in range(COLS) if c != FN_COL]
fp_sorted = sorted(FP, key=lambda rc: rc[1])
x0 = VW / 2 - STEP * (TP - 1) / 2                  # nine across, centred
target = {}
for i, c in enumerate(tp_cols): target[(0, c)] = (x0 + STEP * i, ROW_TP)
assert len(fp_sorted) == TP, 'the two rows are drawn the same length; change the layout before the numbers'
for i, rc in enumerate(fp_sorted): target[rc] = (x0 + STEP * i, ROW_FP)

people = []
for k in range(PEOPLE):
    r, c = divmod(k, COLS)
    x, y = xy(r, c)
    has = r == 0
    pos = (has and c != FN_COL) or (r, c) in FP
    cls = ('by-tp' if pos else 'by-fn') if has else ('by-fp' if pos else 'by-tn')
    inner = '<circle class="by-dot" cx="%s" cy="%s" r="%s"/>' % (g(x), g(y), g(R))
    if has: inner += '<circle class="by-gold" cx="%s" cy="%s" r="%s"/>' % (g(x), g(y), g(R))
    if pos: inner += '<circle class="by-ring" cx="%s" cy="%s" r="%s"/>' % (g(x), g(y), g(RING))
    style = ''
    if pos:
        tx, ty = target[(r, c)]
        style = ' style="--go: translate(%spx, %spx)"' % (g(tx - x), g(ty - y))
    people.append('      <g class="by-p %s"%s>%s</g>' % (cls, style, inner))

says = ''.join('<span class="by-s%d">%s</span>' % (i, s[0]) for i, s in enumerate(SAYS))

svg = '''  <!-- BAYES, with a hundred people. A test right nine times in ten, and a positive that still means
       only even odds: 9 true positives from the 10 who have it, 9 false ones from the 90 who do not.
       Written by tools/bayes.py — re-run it rather than editing these lines; check-css.js recomputes
       the posterior from the dots and the captions and fails if they disagree. -->
  <div id="splash-bayes" aria-hidden="true">
    <svg class="by-svg" viewBox="0 0 %(vw)s %(vh)s">
%(people)s
      <text class="by-lab by-lab-tp" x="50" y="%(ltp)s">have it, test +</text>
      <text class="by-lab by-lab-fp" x="50" y="%(lfp)s">don&#8217;t, test +</text>
      <text class="by-lab by-eq" x="50" y="%(eq1)s">P(has it | +)</text>
      <text class="by-lab by-eq" x="50" y="%(eq2)s">= <tspan class="by-eq-tp">%(tp)d</tspan> &#247; (<tspan class="by-eq-tp">%(tp)d</tspan> + <tspan class="by-eq-fp">%(fp)d</tspan>)</text>
    </svg>
    <div class="by-say">%(says)s</div>
    <div class="sp-sig">@family.</div>
  </div>''' % dict(vw=VW, vh=VH, people='\n'.join(people), ltp=LAB_TP, lfp=LAB_FP, eq1=EQ1, eq2=EQ2,
                  tp=TP, fp=len(FP), says=says)

# ---- the keyframes ---------------------------------------------------------------------------------
def fade(name, up, down, lo=0, hi=1, extra_lo='', extra_hi=''):
    """Off until up[0], on by up[1], on until down[0], off by down[1]."""
    a = 'opacity: %s;%s' % (lo, extra_lo)
    b = 'opacity: %s;%s' % (hi, extra_hi)
    return ('@keyframes %s { 0%%, %s { %s } %s, %s { %s } %s, 100%% { %s } }'
            % (name, pct(up[0]), a, pct(up[1]), pct(down[0]), b, pct(down[1]), a))

def ring(name, up):
    """Scales in from 1.9x as it appears; fades out at its own size; grows back while unseen."""
    return ('@keyframes %s { 0%%, %s { opacity: 0; transform: scale(1.9); } %s, %s { opacity: 1; transform: scale(1); } '
            '%s { opacity: 0; transform: scale(1); } 100%% { opacity: 0; transform: scale(1.9); } }'
            % (name, pct(up[0]), pct(up[1]), pct(UNRING[0]), pct(UNRING[1])))

frames = [
    fade('by-gold', GOLD, BACK),
    ring('by-lit1', LIT_TP),
    ring('by-lit2', LIT_FP),
    fade('by-lab', LAB, (HOLD, BACK[0])),
    # the negatives: on, leave, come back — so its "off" is in the middle
    '@keyframes by-out { 0%%, %s { opacity: 1; } %s, %s { opacity: 0; } %s, 100%% { opacity: 1; } }'
    % (pct(OUT[0]), pct(OUT[1]), pct(BACK[0] + 0.1), pct(BACK[1])),
    '@keyframes by-go { 0%%, %s { transform: translate(0px, 0px); animation-timing-function: ease-in-out; } '
    '%s, %s { transform: var(--go); animation-timing-function: ease-in-out; } %s, 100%% { transform: translate(0px, 0px); } }'
    % (pct(GO[0]), pct(GO[1]), pct(BACK[0]), pct(BACK[1])),
]
for i, (_, a, b) in enumerate(SAYS):
    if a is None:   # up at the start, and faded back in at the end of the loop
        frames.append('@keyframes by-s%d { 0%%, %s { opacity: 1; } %s, %s { opacity: 0; } 100%% { opacity: 1; } }'
                      % (i, pct(b), pct(b + 0.12), pct(BACK[1] - 0.05)))
    else:
        frames.append(fade('by-s%d' % i, (a, a + 0.15), (b, b + 0.12)))

say_sel = ', '.join('.by-s%d' % i for i in range(len(SAYS)))
say_rules = '\n'.join('.by-s%d { animation: by-s%d %gs linear infinite; }' % (i, i, T) for i in range(len(SAYS)))
last = len(SAYS) - 1

css = '''/* ---------- BAYES, WITH A HUNDRED PEOPLE ---------------------------------------------------------
   ASKED FOR AS "add a bayesian maths animation". Written by tools/bayes.py, which holds the numbers
   and says what each moment teaches — re-run it rather than editing these lines. The prior is the
   gold row, the test's verdict is the ring, and the answer is two rows of nine of equal length:
   P(has it | +) = TP / (TP + FP) = 9 / 18, drawn before it is said.

   THE PALETTE IS THE SCREEN'S, not a component's own: gold is what has it, ink is everybody and the
   ring the test draws. No paper here — this is the black-and-gold screen, so tokens only.
   Transform and opacity only, one %(T)gs clock, every animation infinite; check-css and
   check-splash-loops both hold it to that. */
#splash-bayes { width: min(90vw, 20rem); }
#splash-bayes .by-svg { display: block; width: min(66vw, 14rem); height: auto; margin: 0 auto;
                        overflow: visible; }
.by-dot { fill: var(--ink); fill-opacity: .26; }
.by-gold { fill: var(--gold); opacity: 0; animation: by-gold %(T)gs linear infinite; }
/* THE RING SCALES ABOUT ITS OWN MIDDLE — `fill-box`, since the circle is drawn at its place in the
   grid and not at (0,0). */
.by-ring { fill: none; stroke: var(--ink); stroke-width: .9; opacity: 0;
           transform-box: fill-box; transform-origin: center; }
.by-tp .by-ring { animation: by-lit1 %(T)gs linear infinite; }
.by-fp .by-ring { animation: by-lit2 %(T)gs linear infinite; }
.by-fn, .by-tn { animation: by-out %(T)gs linear infinite; }
/* `--go` IS A translate IN viewBox UNITS, written per person by the generator; `view-box` and an
   origin at 0 0 make a px in it one unit of the drawing, so it scales with the svg. */
.by-tp, .by-fp { transform-box: view-box; transform-origin: 0 0;
                 animation: by-go %(T)gs linear infinite; }
.by-lab { font: 600 5.4px var(--mono); text-anchor: middle; fill: var(--dim); opacity: 0;
          animation: by-lab %(T)gs linear infinite; }
.by-lab-tp { fill: var(--gold); }
.by-eq { font-size: 7px; fill: var(--ink); }
.by-eq-tp { fill: var(--gold); }
/* ONE LINE PER MOMENT, stacked in one place, only the current one showing. Wider than the drawing
   so the longest line is never wrapped at 320. */
.by-say { position: relative; height: 1.2rem; margin-top: .55rem;
          font: 600 .76rem var(--mono); color: var(--ink); text-align: center; }
.by-say span { position: absolute; left: 0; right: 0; opacity: 0; white-space: nowrap; }
.by-say b { color: var(--gold); font-weight: 700; }
.by-say i { font-style: normal; font-weight: 700; }
%(say_rules)s
%(frames)s

/* LESS MOVEMENT: the answer, still — the two rows of nine, named, the sum and the last line. */
@media (prefers-reduced-motion: reduce) {
  .by-gold, .by-tp .by-ring, .by-fp .by-ring, .by-fn, .by-tn, .by-tp, .by-fp, .by-lab,
  %(say_sel)s { animation: none; }
  /* `.by-say .by-sN`, not `.by-sN`: the span rule that hides every line is one class heavier. */
  .by-gold, .by-ring, .by-lab, .by-say .by-s%(last)d { opacity: 1; }
  .by-fn, .by-tn { opacity: 0; }
  .by-tp, .by-fp { transform: var(--go); }
}

''' % dict(T=T, say_rules=say_rules, frames='\n'.join(frames), say_sel=say_sel, last=last)

root = pathlib.Path(__file__).resolve().parent.parent
html = (root / 'index.html').read_text()
pat = r'  <!-- BAYES, with a hundred people\.[\s\S]*?\n  </div>'
if re.search(pat, html):
    html = re.sub(pat, lambda m: svg, html, count=1)
else:   # first run: after the coin, which is its nearest relative
    anchor = '  <!-- A NUMBER LINE, with a marker walking along it. -->'
    assert anchor in html, 'nowhere to put #splash-bayes in index.html'
    html = html.replace(anchor, svg + '\n\n' + anchor, 1)
(root / 'index.html').write_text(html)

style = (root / 'style.css').read_text()
cpat = r'/\* -+ BAYES, WITH A HUNDRED PEOPLE -+[\s\S]*?(?=/\* -+ THE NUMBER LINE -+ \*/)'
if re.search(cpat, style):
    style = re.sub(cpat, lambda m: css, style, count=1)
else:
    anchor = '/* ---------- THE NUMBER LINE ---'
    assert anchor in style, 'nowhere to put the Bayes block in style.css'
    style = style.replace(anchor, css + anchor, 1)
(root / 'style.css').write_text(style)

print('%d people, %d have it; TP %d, FN %d, FP %d, TN %d; P(has it | +) = %d/%d = %.0f%%; loop %gs'
      % (PEOPLE, HAVE, TP, HAVE - TP, len(FP), WELL - len(FP), TP, TP + len(FP), 100 * POST, T))
