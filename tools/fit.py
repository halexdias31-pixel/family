# "How many fit?" — division as measuring (KS2 Maths chapter 1, and a loading splash): writes the whole
# drawing, its <div> and every rule and @keyframes, into its row of data/textbooks.json through
# tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row.
# Run: python3 tools/fit.py
#
# ASKED FOR AS "also i need an animationj to add to content cards. for the kids to see what i mean when i
# say how many 3s fit into 4 or how many of x number fits into y number." — the owner, 12 Oct.
#
# WHAT IT SHOWS. "How many 3s fit into 4" is division as MEASURING: lay copies of the divisor along the
# dividend and count them. The copy that does not fit whole is the remainder, and the part of it that
# does fit is the fraction — 4 ÷ 3 = 1 remainder 1 = 1⅓. The same picture is why dividing by a quarter
# makes more, not less. Four examples, the owner's own first:
#   4 ÷ 3 = 1⅓     one 3 fits; the next overhangs, goes red ("too far"), and only a third of it stays
#   12 ÷ 3 = 4     four 3s fit exactly, and the end of the bar lights gold
#   7 ÷ 2 = 3½     three 2s, and half of the fourth
#   1 ÷ ¼ = 4      four quarters fit into 1 — the fractions case, measured the same way
# Each one ends on the sentence a child would say and the sum it is. No sound and nobody talking, so the
# picture has to say all of it: a whole copy is counted above itself in gold, the dividend's end is a
# dashed wall, and the copy past it is red with the words "too far" over it until it is cut.
#
# A 3 HAS THREE PARTS FROM THE MOMENT IT LANDS. Every blue block is drawn as its own cells, one per unit
# of the bar, divided top to bottom — so when the overhang is cut to a dashed ghost, "one of its three
# cells is solid" is something the child has already seen, not a new idea arriving with the answer. Every
# divider runs the block's full height and nothing is ever written over one: the label sits in the
# middle cell, or, when a block has no middle cell (a 2), in the cell left of the middle. The first build
# centred the "2" on its divider and haloed it in blue, which left the divider two stubs either side of a
# digit — the cells the picture is about were the one thing a 2-block did not show. And a divider is a
# shade lighter than the black seam between two copies, so the cells of one copy never read as copies.
#
# THE OVERHANGING COPY'S "3" GOES BEFORE THE RED COMES. It sits at the middle of the whole block, which is
# past the wall, and in the first build it faded out WHILE the red faded in — the 2 of 7 ÷ 2, centred on
# the wall itself, was half blue and half red for a moment. So it lands as a 3 like every other, its
# label fades (half a second, `fit-ot`), and the red starts only once it is gone — `red` is at least
# `lab` + .5 in every example, and an assert below holds that.
#
# EVERY TEXT AT 10.5px OR MORE AT 320. The card is 236px wide there and the drawing is 240 units across,
# so a unit is 0.98px: nothing here is set under 11. The bar's numbers were 9 (8.8px) and the quarter
# inside each block 8 — legible to an adult at arm's length, not to a ten-year-old. The quarter marks
# under the bar are fractions written as a child writes one, over a line, not the font's ¼ glyph, which
# is a speck at this size.
#
# THE COLOURS: blue is the divisor (the thing being laid down), gold is the answer (the count, the
# fraction that fits, the end line of an exact fit, the answer in the sentence and the sum), red is
# "too far" — `--coral`, the app's own red for wrong, as a token. The blue is this drawing's own and is
# defined on its root, as every drawing's own colour is (CLAUDE.md). The bar and the words are the
# screen's paper on black, as every splash's words are.
#
# HOW IT MOVES — transform and opacity only, one 36s clock, everything infinite; check-css.js holds it
# to that (its seamless-loop registry, beside the coin, the sieve and Bayes). Every moving element shares
# one of four keyframes, and carries `--d`, a negative delay that puts that keyframe's switch at the
# moment it should happen: an element switches at time a when its delay is -((H - a) mod T). It then
# holds its new state for HOLD seconds — past the end of its example — and snaps back while its example
# is hidden, so no reset is ever seen. The four examples are four groups that cross-fade, each on its own
# keyframe (their lengths differ: the owner's example and 7 ÷ 2 get longer, for the overhang).
#
# LESS MOVEMENT: every animation off, and the base styles ARE the still — the first example's answer,
# whole: the bar, the one 3 counted, the third that fits under its gold ⅓, the dashed ghost of the rest,
# "One and a third 3s fit into 4" and 4 ÷ 3 = 1⅓. The three later examples and the overhang are opacity 0
# at rest; everything else is opacity 1 at rest.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from fractions import Fraction as Fr

HOLD = 10.5           # how long an element keeps its state after it switches: longer than any example
W, VH = 240, 170      # the viewBox
X0, X1 = 10.0, 230.0  # where the bar may run: the longest example fills it
Y_Q = 16              # the question's baseline
Y_N = 42              # the count's baseline, and "too far"'s
Y_NF = 38             # the line of the fraction named over the part that fits
BY, BH = 52.0, 24.0   # the blocks' row
RY, RH = 79.0, 16.0   # the bar's row
Y_LAB = 108           # the bar's numbers, when they are whole numbers
Y_LF, Y_LI = 108, 112  # ... and when some are fractions: the fractions' line, the whole numbers' baseline
Y_SAY = 135           # the sentence
Y_SUM = 162           # the sum
SEAM = .7             # half the black gap between two blocks, taken off each block's own ends
CH = .6               # the font's advance, in ems: Family Code is monospaced
FADE = .5             # the cross-fade between examples
NUM = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
PART = {2: 'a half', 3: 'a third', 4: 'a quarter'}

# n, b: the dividend and the divisor in the bar's units (a quarter is one unit of a bar of four).
# one: what one unit is (1, or ¼); word: the divisor said in words; length: seconds on screen;
# first, gap: when the first copy lands and how far apart; lab, red, cut: for the copy that overhangs,
# after it lands — when its label goes, when the overhang goes red, when it is cut to a ghost.
SCENES = [
    dict(n=4, b=3, one=Fr(1), word='3s', length=10, first=.8, gap=1.1, lab=1.0, red=1.5, cut=3.0),
    dict(n=12, b=3, one=Fr(1), word='3s', length=8, first=.8, gap=.8),
    dict(n=7, b=2, one=Fr(1), word='2s', length=10, first=.7, gap=.7, lab=.8, red=1.3, cut=2.6),
    dict(n=4, b=1, one=Fr(1, 4), word='quarters', length=8, first=.8, gap=.8),
]
T = sum(s['length'] for s in SCENES)
H = T - HOLD
assert max(s['length'] for s in SCENES) < HOLD < T - max(s['length'] for s in SCENES)


def r(v):
    s = ('%.2f' % v).rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s


def pct(t):
    return r(100.0 * t / T) + '%'


def at(a):
    """The --d that makes a shared keyframe switch at time a."""
    return ' style="--d:%ss"' % r(-((H - a) % T))


def spans(parts):
    return ''.join(p if isinstance(p, str) else '<tspan class="fit-%s">%s</tspan>' % p for p in parts)


def stack(cls, cx, ybar, num, den, fs, half):
    """A fraction written as a child writes one: over a line, its line at ybar."""
    return ('<g class="%s"><text x="%s" y="%s">%s</text><path class="fit-fl" d="M%s %sH%s"/>'
            '<text x="%s" y="%s">%s</text></g>') % (
        cls, r(cx), r(ybar - fs * .24), num, r(cx - half), r(ybar), r(cx + half), r(cx), r(ybar + fs * .94), den)


def frac_parts(q):
    """A quotient as (whole, fraction): 4/3 -> (1, 1/3)."""
    w = q.numerator // q.denominator
    return w, q - w


def say_of(s):
    q = Fr(s['n'] * s['one']) / (s['b'] * s['one'])
    w, f = frac_parts(q)
    if not f:
        head = 'Exactly ' + NUM[w].lower()
    else:
        head = NUM[w] + ' and ' + PART[f.denominator]
        assert f.numerator == 1
    return [('g', head), ' ', ('u', s['word']), ' fit into %s' % (s['n'] * s['one'])]


def sum_markup(s, y, fs, ffs):
    """The sum, token by token, each centred on its own x, so a font a shade wider or narrower than
    the one measured moves nothing out of line with its neighbour."""
    whole = s['n'] * s['one']
    div = s['b'] * s['one']
    w, f = frac_parts(Fr(whole) / div)
    toks = [('', str(whole)), ('o', '÷'), ('u', div if div.denominator > 1 else str(div)), ('o', '='), ('g', str(w))]
    if f:
        toks.append(('g', f))
    gap = fs * CH * .55
    items = []
    for cls, v in toks:
        if isinstance(v, Fr):
            items.append((cls, v, max(len(str(v.numerator)), len(str(v.denominator))) * CH * ffs + ffs * .5))
        else:
            items.append((cls, v, len(v) * CH * fs))
    width = sum(i[2] for i in items) + gap * (len(items) - 1)
    x = W / 2 - width / 2
    out, prev = [], None
    for cls, v, wd in items:
        if isinstance(v, Fr) and prev == 'g':          # a mixed number's fraction sits close to its whole
            x -= gap * .75
        cx = x + wd / 2
        if isinstance(v, Fr):
            out.append(stack('fit-' + cls, cx, y - fs * .37, v.numerator, v.denominator, ffs, (wd - ffs * .5) / 2 + 1))
        else:
            out.append('<text%s x="%s" y="%s">%s</text>' % (' class="fit-%s"' % cls if cls else '', r(cx), r(y), v))
        x += wd + gap
        prev = cls
    return ''.join(out)


def scene(k, s, S):
    n, b, one = s['n'], s['b'], s['one']
    nb = -(-n // b)                    # copies laid: every whole one, and the one that overhangs
    u = (X1 - X0) / (nb * b)           # one unit of the bar, in viewBox units
    xe = X0 + n * u                    # the end of the bar
    p = []
    p.append('<rect class="fit-bar" x="%s" y="%s" width="%s" height="%s"/>' % (r(X0), r(RY), r(n * u), r(RH)))
    p.append('<path class="fit-tk" d="%s"/>' % ''.join('M%s %sv%s' % (r(X0 + i * u), r(RY), r(RH)) for i in range(1, n)))
    # the bar's numbers: every unit, as the whole number or the fraction it is
    marks = [Fr(i) * one for i in range(n + 1)]
    fracs = any(m.denominator > 1 for m in marks)
    lab = ''
    for i, m in enumerate(marks):
        x = X0 + i * u
        end = ' class="fit-end"' if i == n else ''
        if m.denominator == 1:
            lab += '<text%s x="%s" y="%s">%s</text>' % (end, r(x), Y_LI if fracs else Y_LAB, m)
        else:
            lab += stack('fit-lf', x, Y_LF, m.numerator, m.denominator, 11, 5)
    p.append('<g class="fit-lab">%s</g>' % lab)
    p.append('<path class="fit-wall" d="M%s %sV%s"/>' % (r(xe), r(BY - 4), r(RY + RH + 1)))
    p.append('<text class="fit-q" x="%s" y="%s">%s</text>' % (r(W / 2), Y_Q, spans(['How many ', ('u', s['word']), ' fit into %s?' % (n * one)])))

    def label(x):
        """What is written on a copy that starts at x: its size, as a number, or as a fraction over a line —
        in its middle cell, or the one left of the middle, so no divider ever runs through it."""
        cx = x + ((b - 1) // 2 + .5) * u
        if one.denominator > 1:
            return stack('fit-bf', cx, BY + BH / 2, one.numerator, one.denominator, 10.8, 3.8)
        return '<text class="fit-bn" x="%s" y="%s">%s</text>' % (r(cx), r(BY + BH / 2 + 4.7), b)

    def cells(xs):
        return ''.join('M%s %sv%s' % (r(x), r(BY), r(BH)) for x in xs)

    t = S + s['first']
    last = t
    for i in range(nb):
        a = t
        x = X0 + i * b * u
        w = b * u
        fit = min(b, n - i * b)
        if fit == b:
            g = '<rect class="fit-b" x="%s" y="%s" width="%s" height="%s"/>' % (r(x + SEAM), r(BY), r(w - 2 * SEAM), r(BH))
            if b > 1:
                g += '<path class="fit-dv" d="%s"/>' % cells(x + j * u for j in range(1, b))
            g += label(x)
            p.append('<g class="fit-dr"%s>%s</g>' % (at(a), g))
            p.append('<text class="fit-n fit-pp"%s x="%s" y="%s">%d</text>' % (at(a + .45), r(x + w / 2), Y_N, i + 1))
            last = a + .45
            t += s['gap']
            continue
        # THE COPY THAT OVERHANGS. One block until it is cut — two rects with no edge between them, so it
        # lands looking like every other — then its label goes, the part past the wall turns red under
        # "too far", and at the cut that part fades to a dashed ghost and only what fits stays.
        xf = x + fit * u
        ow = w - fit * u
        lab_at, red, cut = a + s['lab'], a + s['red'], a + s['cut']
        over = '<rect class="fit-b" x="%s" y="%s" width="%s" height="%s"/>' % (r(xf), r(BY), r(ow - SEAM), r(BH))
        over += '<rect class="fit-no fit-fd"%s x="%s" y="%s" width="%s" height="%s"/>' % (at(red), r(xf), r(BY), r(ow - SEAM), r(BH))
        over += '<path class="fit-dv" d="%s"/>' % cells(x + j * u for j in range(fit, b))
        assert s['red'] >= s['lab'] + .5, 'example %d turns red while its label is still fading' % (k + 1)
        over += '<g class="fit-ot"%s>%s</g>' % (at(lab_at), label(x))
        tx = min(xf + ow / 2, W - 2 - 3.5 * CH * 11)
        over += '<text class="fit-tf fit-fd"%s x="%s" y="%s">too far</text>' % (at(red), r(tx), Y_N)
        g = '<rect class="fit-b" x="%s" y="%s" width="%s" height="%s"/>' % (r(x + SEAM), r(BY), r(fit * u - SEAM), r(BH))
        if fit > 1:
            g += '<path class="fit-dv" d="%s"/>' % cells(x + j * u for j in range(1, fit))
        g += '<g class="fit-ot"%s>%s</g>' % (at(cut), over)
        p.append('<g class="fit-dr"%s>%s</g>' % (at(a), g))
        gh = '<rect x="%s" y="%s" width="%s" height="%s"/>' % (r(xf), r(BY + .6), r(ow - SEAM - .6), r(BH - 1.2))
        if b - fit > 1:
            gh += '<path d="%s"/>' % ''.join('M%s %sv%s' % (r(x + j * u), r(BY + .6), r(BH - 1.2)) for j in range(fit + 1, b))
        p.append('<g class="fit-gh fit-fd"%s>%s</g>' % (at(cut), gh))
        f = Fr(fit, b)
        p.append(stack('fit-n fit-pp"%s' % at(cut + .45)[:-1], x + fit * u / 2, Y_NF, f.numerator, f.denominator, 11, 5))
        last = cut + .45
    if nb * b == n:
        p.append('<path class="fit-ok fit-fd"%s d="M%s %sV%s"/>' % (at(last), r(xe), r(BY - 4), r(RY + RH + 1)))
    said = last + .6
    p.append('<text class="fit-say fit-fd"%s x="%s" y="%s">%s</text>' % (at(said), r(W / 2), Y_SAY, spans(say_of(s))))
    p.append('<g class="fit-sum fit-fd"%s>%s</g>' % (at(said + .6), sum_markup(s, Y_SUM, 17, 11.5)))
    assert said + .6 + 1.5 < S + s['length'] - FADE, 'example %d leaves too little time to read its sum' % (k + 1)
    return '<g class="fit-s" style="--kf:fit-s%d">%s</g>' % (k + 1, ''.join(p))


body, starts, S = [], [], 0.0
for k, s in enumerate(SCENES):
    body.append('      ' + scene(k, s, S))
    starts.append(S)
    S += s['length']

# WRITTEN WITH index.html's INDENT, which is what anim_row takes off: the markup the eleven scripts before
# this one moved out of the page stood two spaces further in than the row keeps it.
html = ('<div class="an-fit" aria-hidden="true">\n'
        '    <svg class="fit-svg" viewBox="0 0 %d %d">\n%s\n    </svg>\n  </div>' % (W, VH, '\n'.join(body)))

# ---- the examples, cross-fading: each is up for its length, the next fading in as it fades out -----------
P0 = pct(H)
frames = []
for k, s in enumerate(SCENES):
    a, e = starts[k], starts[k] + s['length']
    if k == 0:
        frames.append('@keyframes fit-s1 { 0%%, %s { opacity: 1; } %s, %s { opacity: 0; } 100%% { opacity: 1; } }'
                      % (pct(e - FADE), pct(e), pct(T - FADE)))
    else:
        frames.append('@keyframes fit-s%d { 0%%, %s { opacity: 0; } %s, %s { opacity: 1; } %s, 100%% { opacity: 0; } }'
                      % (k + 1, pct(a - FADE), pct(a), pct(e - FADE), pct(e)))
# ---- and the four that every moving part shares, switching at H ------------------------------------------
frames += [
    # A COPY ARRIVES: it fades in over .3s while it drops the last 12 units, settling by .6s. The first
    # build faded it in over about a frame, so blocks blinked into place rather than arriving.
    '@keyframes fit-dr { 0%%, %s { opacity: 0; transform: translateY(-12px); } %s { opacity: 1; } %s, 100%% { opacity: 1; transform: none; } }'
    % (P0, pct(H + .3), pct(H + .6)),
    '@keyframes fit-fd { 0%%, %s { opacity: 0; } %s, 100%% { opacity: 1; } }' % (P0, pct(H + .45)),
    '@keyframes fit-ot { 0%%, %s { opacity: 1; } %s, 100%% { opacity: 0; } }' % (P0, pct(H + .5)),
    # A COUNT POPS: up from a third of its size, a quarter too big, and settles.
    '@keyframes fit-pp { 0%%, %s { opacity: 0; transform: scale(.3); } %s { opacity: 1; transform: scale(1.25); } %s, 100%% { opacity: 1; transform: none; } }'
    % (P0, pct(H + .25), pct(H + .45)),
]

css = '''.an-fit { --fit-u: #6fa8dc; }
.fit-svg { display: block; width: min(88vw, 21rem); max-width: 100%%; height: auto; }
.fit-svg text { font: 700 13px var(--mono); text-anchor: middle; fill: var(--paper); }
/* THE BAR STANDS OFF THE CARD: a tenth of paper over black, its edge and its units plainly drawn. */
.fit-bar { fill: var(--paper); fill-opacity: .1; stroke: var(--paper); stroke-opacity: .6; stroke-width: 1; }
.fit-tk { stroke: var(--paper); stroke-opacity: .4; stroke-width: 1; }
.fit-svg .fit-lab text { font-size: 11px; font-weight: 600; fill-opacity: .75; }
.fit-svg .fit-lab .fit-end { font-weight: 700; fill-opacity: 1; }
/* A QUARTER MARK IS AS BRIGHT AS A WHOLE ONE: its digits take the numbers' .75, and its line this. */
.fit-lf { color: color-mix(in srgb, var(--paper) 75%%, transparent); }
.fit-wall { stroke: var(--paper); stroke-opacity: .75; stroke-width: 1.2; stroke-dasharray: 2.5 2; }
.fit-ok { stroke: var(--gold); stroke-width: 2; }
.fit-b { fill: var(--fit-u); }
.fit-no { fill: var(--coral); }
/* A CELL PER UNIT, full height, plain from across a table — and lighter than the black seam between two
   copies, so the cells of one copy are never counted as copies. */
.fit-dv { stroke: var(--bg); stroke-opacity: .55; stroke-width: 1.1; }
.fit-svg .fit-bn { fill: var(--bg); }
.fit-svg .fit-bf text { font-size: 10.8px; fill: var(--bg); }
.fit-bf { color: var(--bg); }
.fit-gh { fill: none; stroke: var(--fit-u); stroke-opacity: .9; stroke-width: 1.2; stroke-dasharray: 3 2; }
.fit-svg .fit-n, .fit-svg .fit-n text { fill: var(--gold); }
.fit-svg .fit-n text, .fit-svg .fit-tf, .fit-svg .fit-lf text { font-size: 11px; }
.fit-svg .fit-tf { fill: var(--coral); }
.fit-fl { stroke: currentColor; stroke-width: 1.2; }
.fit-n { color: var(--gold); }
.fit-svg .fit-say { font-size: 11.5px; }
.fit-svg .fit-sum text { font-size: 17px; }
.fit-svg .fit-sum g text { font-size: 11.5px; }
.fit-svg .fit-g, .fit-svg .fit-g text { fill: var(--gold); }
.fit-svg .fit-u, .fit-svg .fit-u text { fill: var(--fit-u); }
.fit-svg .fit-o { fill-opacity: .55; }
.fit-g { color: var(--gold); } .fit-u { color: var(--fit-u); }
.fit-pp { transform-box: fill-box; transform-origin: center; }
/* AT REST, the still: the first example only, and the overhang already cut away. */
.fit-s ~ .fit-s, .fit-ot { opacity: 0; }
.fit-s { animation: %(T)ss linear infinite; animation-name: var(--kf); }
.fit-dr, .fit-fd, .fit-ot, .fit-pp { animation: %(T)ss cubic-bezier(.3, .7, .4, 1) infinite; animation-delay: var(--d); }
.fit-dr { animation-name: fit-dr; }
.fit-fd { animation-name: fit-fd; }
.fit-ot { animation-name: fit-ot; }
.fit-pp { animation-name: fit-pp; }
%(frames)s
@media (prefers-reduced-motion: reduce) {
  .an-fit .fit-s, .an-fit .fit-dr, .an-fit .fit-fd, .an-fit .fit-ot, .an-fit .fit-pp { animation: none; }
}''' % dict(T=r(T), frames='\n'.join(frames))

# INTO ITS ROW IN data/textbooks.json — see tools/anim_row.py.
anim_row.write_anim('fit', html=html, css=css)
print('fit: %d examples over %ss, html %d + css %d characters' % (len(SCENES), r(T), len(html), len(css)))
