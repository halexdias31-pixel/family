# Newton's second law with a pulley, drawn: 5 kg and 3 kg on a light string over a smooth pulley; each mass's weight
# and the one tension T drawn to scale on it; then they move off together with a = 2.45 m/s² — the heavier down, the
# lighter up, the wheel turning — as 5g − T = 5a and T − 3g = 3a say.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/411.
import math, sys
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, fade, captions, still_block

T = 12.0
G = 9.8
A = (5 - 3) * G / 8                                  # 2.45 m/s²
TEN = 3 * (G + A)                                    # 36.75 N
PX, PY, R = 150, 34, 24                              # the pulley
LX, RX = PX - R, PX + R                              # the two strands
Y0 = 100                                              # both masses' tops at the start
DROP = 36                                            # how far they move, px
K = 0.9                                              # px per newton
MOVE = (5.6, 8.0)


def tr(x, y): return 'translate(%.1fpx, %.1fpx)' % (x, y)


def arrow(cls, x, y, dy):
    """from (x, y), dy px long (up if negative), with its head"""
    tip = y + dy
    s = 1 if dy > 0 else -1
    return ('<g class="%s"><path class="apu-shaft %s-s" d="M%.1f %.1fV%.1f" pathLength="1"/><path class="apu-head" d="M%.1f %.1fl-4 %.1fh8z"/></g>'
            % (cls, cls, x, y, tip, x, tip, -7 * s))


def stations(fmt):
    # s ∝ t² from rest, constant acceleration: cubic-bezier(.33, 0, .67, .33) is exactly s²
    return [(0, fmt(0)), (MOVE[0], fmt(0) + ' animation-timing-function: cubic-bezier(.33, 0, .67, .33);'),
            (MOVE[1], fmt(1) + ' animation-timing-function: ease-in-out;'), (10.9, fmt(1) + ' animation-timing-function: ease-in-out;'), (11.7, fmt(0))]


css = [""".an-apulley { --apu-a: #6fa8dc; --apu-b: #6fd8c4; --apu-w: var(--coral); --apu-t: var(--gold); width: min(88vw, 22rem, 100%); text-align: center; }
.apu-svg { display: block; width: 100%; height: auto; }
.apu-beam { stroke: var(--dim); stroke-width: 3; }
.apu-wheel { fill: var(--raised); stroke: var(--ink); stroke-width: 2; }
.apu-spoke { stroke: var(--ink); stroke-opacity: .5; stroke-width: 1.4; }
.apu-mv { transform-box: view-box; transform-origin: 0 0; }
.apu-str { stroke: var(--ink); stroke-width: 1.4; }
.apu-ma { fill: var(--apu-a); }
.apu-mb { fill: var(--apu-b); }
.apu-kg { font: 700 12px var(--mono); fill: var(--bg); text-anchor: middle; dominant-baseline: central; }
.apu-shaft { fill: none; stroke-width: 2.4; stroke-dasharray: 1; }
.apu-head { stroke: none; }
.apu-w { stroke: var(--apu-w); fill: var(--apu-w); }
.apu-t { stroke: var(--apu-t); fill: var(--apu-t); }
.apu-lab { font: 700 11px var(--mono); stroke: none; }
.apu-eq { font: 700 12px var(--mono); fill: var(--ink); }
.apu-gold { fill: var(--gold); }
.apu-say { display: grid; margin-top: .5rem; font: 700 .82rem/1.35 var(--mono); color: var(--ink); }
.apu-say > span { grid-area: 1 / 1; }
.apu-say b { color: var(--gold); }"""]
for cls, at in [('apu-left', lambda f: 'transform: translateY(%.1fpx);' % (DROP * f)),
                ('apu-right', lambda f: 'transform: translateY(%.1fpx);' % (-DROP * f)),
                ('apu-sl', lambda f: 'transform: %s scaleY(%.1f);' % (tr(LX, PY), Y0 - PY + DROP * f)),
                ('apu-sr', lambda f: 'transform: %s scaleY(%.1f);' % (tr(RX, PY), Y0 - PY - DROP * f)),
                ('apu-spin', lambda f: 'transform: %s rotate(%.1fdeg);' % (tr(PX, PY), -math.degrees(DROP * f / R)))]:
    css.append('.%s { %s animation: %s %gs linear infinite; }' % (cls, at(0), cls, T))
    css.append(kf(cls, T, stations(at)))
for cls, on in [('apu-w', 0.6), ('apu-t', 2.2)]:
    css.append('.%s-s { stroke-dashoffset: 0; animation: %s-s %gs ease-out infinite; }' % (cls, cls, T))
    css.append(kf(cls + '-s', T, [(on, 'stroke-dashoffset: 1;'), (on + 0.8, 'stroke-dashoffset: 0;')]))
    css.append('.%s { animation: %s %gs linear infinite; }' % (cls, cls, T))
    css.append(fade(cls, T, on, 11.5, f=0.2))
for k, on in enumerate([3.4, 4.2, 8.2]):
    css.append('.apu-e%d { animation: apu-e%d %gs linear infinite; }' % (k, k, T))
    css.append(fade('apu-e%d' % k, T, on, 11.5))
say_html, say_css = captions('apu', T, [
    (0, 3.4, 'Each mass feels its weight and the one tension T'),
    (3.4, 5.6, 'Resultant force = mass × acceleration, for each mass'),
    (5.6, 8.2, 'One string, one acceleration: 5 kg down, 3 kg up'),
    (8.2, T, 'Add: 2g = 8a, so <b>a = 2.45 m/s²</b> and T = 36.75 N')])
css += [say_css, still_block('apulley')]

ha, hb = 38, 28
spokes = ''.join('<line class="apu-spoke" x1="0" y1="0" x2="%.1f" y2="%.1f"/>' % (R * 0.8 * math.cos(a), R * 0.8 * math.sin(a)) for a in [k * math.pi / 3 for k in range(6)])
left = ('<rect class="apu-ma" x="%d" y="%d" width="40" height="%d" rx="2"/><text class="apu-kg" x="%d" y="%d">5 kg</text>' % (LX - 20, Y0, ha, LX, Y0 + ha // 2)
        + arrow('apu-t', LX - 26, Y0 + 8, -K * TEN) + arrow('apu-w', LX - 26, Y0 + 12, K * 5 * G)
        + '<text class="apu-lab apu-t" x="%d" y="%d" text-anchor="end">T</text><text class="apu-lab apu-w" x="%d" y="%d" text-anchor="end">5g</text>' % (LX - 32, Y0 - 14, LX - 32, Y0 + 56))
right = ('<rect class="apu-mb" x="%d" y="%d" width="34" height="%d" rx="2"/><text class="apu-kg" x="%d" y="%d">3 kg</text>' % (RX - 17, Y0, hb, RX, Y0 + hb // 2)
         + arrow('apu-t', RX + 24, Y0 + 8, -K * TEN) + arrow('apu-w', RX + 24, Y0 + 12, K * 3 * G)
         + '<text class="apu-lab apu-t" x="%d" y="%d">T</text><text class="apu-lab apu-w" x="%d" y="%d">3g</text>' % (RX + 30, Y0 - 14, RX + 30, Y0 + 38))
html = '''<div class="an-apulley" aria-hidden="true">
  <svg class="apu-svg" viewBox="0 0 300 228">
    <line class="apu-beam" x1="%d" y1="6" x2="%d" y2="6"/>
    <line class="apu-str" x1="%d" y1="6" x2="%d" y2="%d"/>
    <line class="apu-str apu-sl apu-mv" x1="0" y1="0" x2="0" y2="1" vector-effect="non-scaling-stroke"/>
    <line class="apu-str apu-sr apu-mv" x1="0" y1="0" x2="0" y2="1" vector-effect="non-scaling-stroke"/>
    <circle class="apu-wheel" cx="%d" cy="%d" r="%d"/>
    <g class="apu-spin apu-mv">%s</g>
    <g class="apu-left">%s</g>
    <g class="apu-right">%s</g>
    <text class="apu-eq apu-e0" x="8" y="210">5g − T = 5a</text>
    <text class="apu-eq apu-e1" x="292" y="210" text-anchor="end">T − 3g = 3a</text>
    <text class="apu-eq apu-gold apu-e2" x="150" y="225" text-anchor="middle">a = g ÷ 4 = 2.45 m/s²</text>
  </svg>
  <div class="apu-say">
%s
  </div>
</div>''' % (PX - 40, PX + 40, PX, PX, PY - R, PX, PY, R, spokes, left, right, say_html)

anim_row.write_anim('apulley', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-MATHS', 'chapter': 17, 'title': 'Two masses, one string',
                           'about': "Newton's second law|Connected particles"})
