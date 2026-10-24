# Paley's watch (Natural Theology, 1802): a stone on a heath needs no maker, a watch does; the eye is more intricate
# than any watch. Then the reply, also drawn: Hume's plant and Darwin's branching tree of natural selection.
# The whole row is this script's output (tools/anim_row.py, `whole=`); re-run it after any change. docs/history/418.
import sys, math
sys.path.insert(0, str(__import__('pathlib').Path(__file__).resolve().parent)); import anim_row
from anim_row import kf, captions, still_block

T = 17.0
END = T - 0.6
WX, WY = 112, 66
css = [""".an-pwatch { width: min(92vw, 23rem, 100%); }
.pwt-svg { display: block; width: 100%; height: auto; }
.pwt-ground { fill: none; stroke: rgb(111 216 140 / .5); stroke-width: 1.4; stroke-linecap: round; }
.pwt-stone { fill: rgb(244 241 232 / .28); stroke: var(--dim); stroke-width: 1; }
.pwt-case { fill: rgb(240 180 95 / .1); stroke: var(--gold); stroke-width: 2; }
.pwt-crown { fill: var(--gold); }
.pwt-face { fill: #1d1a14; stroke: none; }
.pwt-tick { stroke: var(--dim); stroke-width: 1; stroke-linecap: round; }
.pwt-hand { stroke: var(--ink); stroke-width: 1.4; stroke-linecap: round; transform-origin: 112px 66px; }
.pwt-gear { fill: none; stroke: var(--gold); stroke-width: 1.1; stroke-linejoin: round; }
.pwt-g1 { transform-origin: 106px 62px; animation: pwt-spin 6s linear infinite; }
.pwt-g2 { transform-origin: 120.5px 73px; animation: pwt-spin 4.2s linear infinite reverse; }
.pwt-h1 { animation: pwt-spin 4s linear infinite; }
.pwt-eye { fill: rgb(244 241 232 / .08); stroke: var(--ink); stroke-width: 1.4; }
.pwt-iris { fill: #6fa8dc; }
.pwt-pupil { fill: #000; }
.pwt-shine { fill: var(--ink); }
.pwt-tree { fill: none; stroke: rgb(111 216 140 / .9); stroke-width: 1.3; stroke-linecap: round; stroke-dasharray: 100; }
.pwt-lab { font: 700 7.5px var(--mono); text-anchor: middle; fill: var(--dim); }
.pwt-arrow { fill: none; stroke: var(--faint); stroke-width: 1.2; stroke-linecap: round; stroke-linejoin: round; }
.pwt-say { display: grid; margin-top: .55rem; font: 600 .82rem/1.4 var(--mono); color: var(--ink); text-align: center; }
.pwt-say > span { grid-area: 1 / 1; }
.pwt-say b { color: var(--gold); }
@keyframes pwt-spin { to { transform: rotate(360deg); } }"""]


def show(cls, at, d=0.5, fro='opacity: 0;', to='opacity: 1;', last=None):
    last = END if last is None else last
    css.append('.%s { animation: %s %gs ease-out infinite; }' % (cls, cls, T))
    css.append(kf(cls, T, [(at, fro), (at + d, to), (last, to), (last + .4, fro)]))


def gear(cx, cy, r, n):
    """A toothed wheel: n teeth, outer radius r, as one closed path, with its hub."""
    pts = []
    for k in range(n * 4):
        a = 2 * math.pi * k / (n * 4)
        rr = r if k % 4 in (1, 2) else r * 0.78
        pts.append('%.1f %.1f' % (cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return 'M%sZM%.1f %.1fm-1.8 0a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0 -3.6 0' % ('L'.join(pts), cx, cy)


# the stone dims when the watch is found; the watch's face opens on its works
css.append('.pwt-stonebox { opacity: .35; animation: pwt-stonebox %gs linear infinite; }' % T)
css.append(kf('pwt-stonebox', T, [(0.2, 'opacity: 0;'), (0.7, 'opacity: 1;'), (3.6, 'opacity: 1;'), (4.2, 'opacity: .35;'), (END, 'opacity: .35;'), (END + .4, 'opacity: 0;')]))
show('pwt-watch', 3.8, d=0.6, fro='opacity: 0; transform: translateY(-6px);', to='opacity: 1; transform: none;')
css.append('.pwt-facebox { opacity: 0; animation: pwt-facebox %gs linear infinite; }' % T)
css.append(kf('pwt-facebox', T, [(5.6, 'opacity: 1;'), (6.3, 'opacity: 0;'), (END, 'opacity: 0;'), (END + .4, 'opacity: 1;')]))
show('pwt-a1', 8.6)
show('pwt-eyebox', 8.9, d=0.6)
css.append('.pwt-tree { animation: pwt-tree %gs ease-out infinite; }' % T)
css.append(kf('pwt-tree', T, [(12.6, 'stroke-dashoffset: 100; opacity: 1;'), (14.0, 'stroke-dashoffset: 0; opacity: 1;'), (END, 'stroke-dashoffset: 0; opacity: 1;'), (END + .4, 'stroke-dashoffset: 0; opacity: 0;')]))
show('pwt-tl', 13.4)

say, say_css = captions('pwt', T, [
    (0, 3.8, 'A stone on a heath: for all we know, it has always lain there'),
    (3.8, 8.6, 'A watch: its parts framed and put together for a purpose. It must have had a <b>maker</b>'),
    (8.6, 12.4, 'Paley: the eye is more intricate than any watch, so nature too has a <b>designer</b>'),
    (12.4, T, 'Hume and Darwin: the world is as like a plant as a machine, and natural selection can build design'),
], end=END)
css.append(say_css)
css.append(still_block('pwatch'))

ticks = ''.join('M%.1f %.1fL%.1f %.1f' % (WX + 16 * math.cos(a), WY + 16 * math.sin(a), WX + 18.5 * math.cos(a), WY + 18.5 * math.sin(a))
                for a in [2 * math.pi * k / 12 for k in range(12)])
html = '''<div class="an-pwatch" aria-hidden="true">
  <svg class="pwt-svg" viewBox="0 0 240 112">
    <path class="pwt-ground" d="M4 100H236M20 100l-2-5M23 100l1-6M26 100l3-4M150 100l-2-5M153 100l1-6M156 100l3-4"/>
    <g class="pwt-stonebox">
      <path class="pwt-stone" d="M26 100q-2-12 12-14q16-1 18 8q2 6-4 6Z"/>
      <text class="pwt-lab" x="41" y="80">a stone</text>
    </g>
    <g class="pwt-watch">
      <rect class="pwt-crown" x="109" y="37" width="6" height="5" rx="1"/>
      <circle class="pwt-case" cx="%d" cy="%d" r="22"/>
      <path class="pwt-gear pwt-g1" d="%s"/>
      <path class="pwt-gear pwt-g2" d="%s"/>
      <g class="pwt-facebox">
        <circle class="pwt-face" cx="%d" cy="%d" r="20.5"/>
        <path class="pwt-tick" d="%s"/>
        <path class="pwt-hand" d="M112 66V54"/>
        <path class="pwt-hand pwt-h1" d="M112 66h9"/>
      </g>
      <text class="pwt-lab" x="112" y="109">a watch</text>
    </g>
    <path class="pwt-arrow pwt-a1" d="M140 66h18m-4 -3l4 3l-4 3"/>
    <g class="pwt-eyebox">
      <path class="pwt-eye" d="M168 66q22-22 44 0q-22 22-44 0Z"/>
      <circle class="pwt-iris" cx="190" cy="66" r="8"/>
      <circle class="pwt-pupil" cx="190" cy="66" r="3.6"/>
      <circle class="pwt-shine" cx="192.5" cy="63.5" r="1.3"/>
      <text class="pwt-lab" x="183" y="109">the eye</text>
    </g>
    <path class="pwt-tree" pathLength="100" d="M226 100V70M226 88l-7-8M226 80l7-9M219 80l-3-8M219 80l4-9M233 71l-3-8M233 71l5-6"/>
    <text class="pwt-lab pwt-tl" x="219" y="109">evolution</text>
  </svg>
  <div class="pwt-say">
%s
  </div>
</div>''' % (WX, WY, gear(106, 62, 9, 9), gear(120.5, 73, 6.5, 7), WX, WY, ticks, say)

anim_row.write_anim('pwatch', html=html, css='\n'.join(css),
                    whole={'book_id': 'TB-ALEVEL-PHIL', 'chapter': 2, 'title': "Paley's watch",
                           'about': 'Teleological argument|Paley'})
