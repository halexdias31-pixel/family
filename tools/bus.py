# Long division — the bus stop, by chunking and digit by digit (KS2 Maths chapter 1, How many fit?).
# Writes its whole row of data/textbooks.json through tools/anim_row.py. THIS SCRIPT IS THE ROW'S SOURCE:
# change it and re-run, never the row. Run: python3 tools/bus.py
#
# WHAT IT SHOWS. The SATs arithmetic paper's last questions are four-digit-by-two-digit long divisions, and
# the method children are taught is CHUNKING under a bus stop: take away a big, easy chunk of the divisor
# (30 × 12), then another, until what is left is smaller than the divisor; the chunks added are the
# quotient and what is left is the remainder. It is How Many Fit?'s measuring, done in big handfuls, so it
# hangs on that chapter. Three examples on one 39s loop:
#   432 ÷ 12 = 36            two chunks, 30 and 6, nothing left
#   487 ÷ 15 = 32 r 7        two chunks, and 7 is less than 15: the remainder, also written 32 7/15
#   744 ÷ 6 = 124            short division, digit by digit: each remainder carried to the next digit
# Each step writes its line and then says it in words at the foot; the quotient is written over the bus
# stop last, in gold, and the sum ends the example. Colours: the chunks' "30 × 12" labels are this
# drawing's blue (the divisor, as in How Many Fit?), a carried remainder is coral, the answer gold.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from anim_row import num

P = 'bs'
W, VH = 240, 196
DX = 19                     # one digit column
C1 = 116                    # the ones column of the dividend
YQ, YBAR, YDV = 31, 37, 57  # the quotient's line, the bus stop's roof, the dividend's
ROW = 22                    # one line of working
YSAY, YSUM = 168, 189
L = anim_row.Loop(P, [12, 15, 12])


def col(i):
    """The x of the i-th column counted left from the ones (0 = ones)."""
    return C1 - DX * i


def number(s, y, cls='bs-dg', right=0):
    """A number written one digit a column, its last digit in column `right`."""
    n = len(s)
    return ''.join('<text class="%s" x="%s" y="%s">%s</text>' % (cls, num(col(right + n - 1 - i)), num(y), ch) for i, ch in enumerate(s))


def stop(divisor, dividend):
    n = len(dividend)
    xl = col(n - 1) - DX * .75
    return ('<text class="bs-dg bs-end" x="%s" y="%s">%s</text>' % (num(xl - 7), YDV, divisor)
            + '<path class="bs-stop" d="M%s %sq6 -10 0 -21.5H%s"/>' % (num(xl), YDV + 4, num(col(0) + DX * .7))
            + number(dividend, YDV))


def say(a, b, text):
    return L.step(a, b, '<text class="bs-say" x="%s" y="%s">%s</text>' % (W / 2, YSAY, text))


def chunked(k, d, n, chunks, rem, tail):
    """Chunking: take away chunk × d, line by line, until less than d is left."""
    L.at(k)
    p = [stop(str(d), str(n))]
    left, y, t = n, YDV, .6
    p.append(say(t, t + 1.6, 'How many %ds fit into %d?' % (d, n)))
    t += 1.8
    for c in chunks:
        take = c * d
        left -= take
        p.append(L.step(t, None, '<text class="bs-dg" x="%s" y="%s">−</text>%s<text class="bs-ch" x="%s" y="%s">%d × %d</text>' % (
            num(col(len(str(n))) + 2), y + ROW, number(str(take), y + ROW), 190, y + ROW, c, d)))
        p.append(say(t, t + 2.4, 'take away %d lots of %d: %d' % (c, d, take)))
        p.append(L.step(t + 1.0, None, '<path class="bs-ln" d="M%s %sH%s"/>%s' % (
            num(col(len(str(n)) - 1) - 9), y + ROW + 6, num(col(0) + 9), number(str(left), y + 2 * ROW))))
        y += 2 * ROW
        t += 2.6
    if rem:
        p.append(L.step(t, None, '<text class="bs-r" x="%s" y="%s">%d &lt; %d</text>' % (190, y, left, d)))
        p.append(say(t, t + 2, '%d is less than %d: the remainder' % (left, d)))
        t += 2.2
    q = sum(chunks)
    p.append(L.step(t, None, '<text class="bs-ch bs-plus" x="%s" y="%s">%s = %d</text>' % (194, YQ, ' + '.join(map(str, chunks)), q)))
    p.append('<g class="bs-pop"%s>%s</g>' % (L.st(t + .5), number(str(q), YQ, 'bs-dg bs-g') + (
        '<text class="bs-g bs-rq" x="%s" y="%s">r%d</text>' % (num(col(0) + 17), YQ, rem) if rem else '')))
    p.append(say(t + .5, t + 2.6 if rem else None, 'add the chunks: %s' % ' + '.join(map(str, chunks)) + ' = %d' % q))
    p.append(L.step(t + 1.3, None, tail))
    if rem:
        # THE REMAINDER AS A FRACTION: 7 left over is 7 of the next 15 — How Many Fit?'s overhang, in numbers.
        p.append(L.step(t + 2.6, None, '<text class="bs-say" x="%s" y="%s">%d r %d = %d</text>%s' % (
            W / 2 - 12, YSAY, q, rem, q, L.frac(W / 2 + 41, YSAY - 4, rem, d, 11, 'bs-g'))))
    assert t + (2.6 if rem else 1.3) + 1.8 < L.L[k] - L.fade, 'example %d is too long for its scene' % (k + 1)
    return L.scene(k, ''.join(p))


def short(k, d, n):
    """Digit by digit: each remainder carried, small, in front of the next digit."""
    L.at(k)
    p = [stop(str(d), str(n))]
    s, carry, t, q = str(n), 0, .6, ''
    p.append(say(t, t + 1.6, 'one digit at a time, left to right'))
    t += 1.8
    for i, ch in enumerate(s):
        cur = carry * 10 + int(ch)
        qd, carry = divmod(cur, d)
        q += str(qd)
        c = len(s) - 1 - i
        p.append('<text class="bs-dg bs-g bs-pop"%s x="%s" y="%s">%d</text>' % (L.st(t + .4), num(col(c)), YQ, qd))
        line = '%d ÷ %d = %d' % (cur, d, qd) + (' r %d' % carry if carry else '')
        p.append(say(t, t + 2.1, line))
        if carry and c > 0:
            p.append('<text class="bs-cy bs-fly"%s x="%s" y="%s">%d</text>' % (L.st(t + 1.0, t0='translate(-12px,0)'), num(col(c - 1) - 9.5), YDV - 9, carry))
        t += 2.3
    p.append(say(t, None, 'carry each remainder on'))
    p.append(L.step(t + .4, None, '<text class="bs-sum" x="%s" y="%s">%d ÷ %d = <tspan class="bs-g">%s</tspan></text>' % (W / 2, YSUM, n, d, int(q))))
    assert t + .4 + 1.5 < L.L[k] - L.fade
    return L.scene(k, ''.join(p))


def tail(n, d, q, rem=0):
    s = '<text class="bs-sum" x="%s" y="%s">%d ÷ %d = <tspan class="bs-g">%d%s</tspan></text>' % (
        W / 2, YSUM, n, d, q, ' r %d' % rem if rem else '')
    return s


scenes = [chunked(0, 12, 432, [30, 6], 0, tail(432, 12, 36)),
          chunked(1, 15, 487, [30, 2], 7, tail(487, 15, 32, 7)),
          short(2, 6, 744)]
html = ('<div class="an-bus" aria-hidden="true">\n  <svg class="bs-svg" viewBox="0 0 %d %d">\n%s\n  </svg>\n</div>'
        % (W, VH, '\n'.join('    ' + s for s in scenes)))

css = '''.an-bus { --bs-u: #6fa8dc; }
.bs-svg { display: block; width: min(88vw, 21rem); max-width: 100%; height: auto; }
.bs-svg text { font: 700 17px var(--mono); text-anchor: middle; fill: var(--paper); }
.bs-stop { fill: none; stroke: var(--paper); stroke-width: 1.6; stroke-linecap: round; }
.bs-svg .bs-end { text-anchor: end; }
.bs-ln { stroke: var(--paper); stroke-opacity: .7; stroke-width: 1.2; }
.bs-svg .bs-ch, .bs-svg .bs-r { font-size: 12px; fill: var(--bs-u); }
.bs-svg .bs-r { fill: var(--paper); fill-opacity: .8; }
.bs-svg .bs-plus { fill: var(--gold); }
.bs-svg .bs-cy { font-size: 10px; fill: var(--coral); }
.bs-svg .bs-g, .bs-g text { fill: var(--gold); }
.bs-svg .bs-rq { font-size: 13px; }
.bs-fr { color: var(--gold); }
.bs-fr path { stroke: currentColor; stroke-width: 1.2; }
.bs-svg .bs-fr text { font-size: 11px; }
.bs-svg .bs-say { font-size: 12px; }
.bs-svg .bs-sum { font-size: 16px; }
''' + L.css()

anim_row.write_anim('bus', html=html, css=css, whole=True, place=dict(
    book_id='TB-KS2-MATHS', chapter=1, title='Long division', about='Quotient|Remainder|Remainder as a fraction'))
