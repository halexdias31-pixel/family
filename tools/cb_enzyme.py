# Enzymes: lock and key, and denaturing (GCSE Biology chapter 3, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_enzyme.py
#
# WHAT IT SHOWS. An enzyme with a notch, its active site. A substrate the shape of the notch drifts in
# and fits; it is broken into two products that drift away, and the enzyme is left as it was, ready for
# the next. Beside it, a graph of rate against temperature with a marker climbing to the optimum. Past
# the optimum the enzyme's shape changes — the notch is twisted — and the next substrate no longer fits
# and bounces off: denatured. The still is the substrate in the active site.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2 = cb_kit.r2

T = 28.0
S = [0, 4, 8, 12, 17, 22]
A = cb_kit.Anim('enzyme', 'ben', T, still=S[1] + 2)
A.rule('.an-enzyme { --ben-e: #6fa8dc; --ben-s: #ff9e64; }')
A.rule('.ben-e { fill: var(--ben-e); } .ben-s { fill: var(--ben-s); } .ben-bad { fill: var(--ben-e); fill-opacity: .55; stroke: var(--coral); stroke-width: 1.5; }')
A.rule('.ben-ax { fill: none; stroke: var(--paper); stroke-opacity: .6; } .ben-cv { fill: none; stroke: var(--gold); stroke-width: 1.6; } .ben-mk { fill: var(--gold); }')
A.rule('.ben-svg .ben-lb { font-size: 11px; } .ben-svg .ben-sm { font-size: 10.5px; fill-opacity: .8; } .ben-svg .ben-no { font-size: 13px; font-weight: 700; fill: var(--coral); }')
A.head('Enzymes: lock and key')
EX, EY = 70, 116                  # enzyme centre; the notch opens upward at (EX, EY - 30)
ENZ = 'M%d %dc0 -36 22 -40 30 -40h0l12 18h16l12 -18c8 0 30 4 30 40c0 30 -26 44 -50 44s-50 -14 -50 -44z' % (EX - 50, EY)
BAD = 'M%d %dc0 -36 22 -40 30 -40l6 10l14 -2l6 14l14 -22c8 0 30 4 30 40c0 30 -26 44 -50 44s-50 -14 -50 -44z' % (EX - 50, EY)
A.put('<path class="ben-e" d="%s"/>' % ENZ, A.win(0, S[4] - .2, .8))
A.put('<path class="ben-bad" d="%s"/>' % BAD, A.win(S[4] - .2, T - .7, .8))
A.put('<text class="ben-lb" x="%d" y="%d">enzyme</text>' % (EX, EY + 12))
# the substrate: a trapezium the shape of the notch (top edge 40 wide, bottom 16)
SUB = 'M%d %dh40l-12 18h-16z' % (EX - 20, EY - 40)
left = 'M%d %dh20v18h-8z' % (EX - 20, EY - 40)
right = 'M%d %dh20l-12 18h-8z' % (EX, EY - 40)
A.put('<path class="ben-s" d="%s"/>' % SUB, A.path([(0, -40, -56), (S[1], 0, 0), (S[2] - .2, 0, 0)], show=(0, S[2] - .2)))
A.put('<path class="ben-s" d="%s"/>' % left, A.path([(S[2], 0, 0), (S[3] - .3, -40, -50)], show=(S[2] - .25, S[3] - .3)))
A.put('<path class="ben-s" d="%s"/>' % right, A.path([(S[2], 0, 0), (S[3] - .3, 44, -50)], show=(S[2] - .25, S[3] - .3)))
# a second substrate, after denaturing: comes in, does not fit, bounces off
A.put('<path class="ben-s" d="%s"/>' % SUB, A.path([(S[5], -40, -56), (S[5] + 2, -2, -12), (S[5] + 2.4, -2, -12), (S[5] + 4.4, -46, -40)], show=(S[5], T - .8)))
A.group(A.win(S[5] + 2.2, T - .7), '<text class="ben-no" x="%d" y="54">no fit</text>' % EX)
A.group(A.win(0, S[1] - .2), '<text class="ben-lb" x="%d" y="40">substrate</text>' % (EX - 30))
A.group(A.win(S[2], S[3] - .2), '<text class="ben-lb" x="%d" y="40">products</text>' % EX)
# the graph: rate against temperature
GX, GY, GW, GH = 150, 140, 80, 90
cv = 'M%d %dC%d %d %d %d %d %dC%d %d %d %d %d %d' % (GX, GY - 4, GX + 30, GY - 20, GX + 40, GY - 86, GX + 52, GY - 84, GX + 62, GY - 80, GX + 66, GY - 10, GX + 74, GY - 2)
A.put('<g><path class="ben-ax" d="M%d %dV%dH%d"/><path class="ben-cv" d="%s"/><text class="ben-sm" x="%d" y="%d">temperature</text><text class="ben-sm" x="%d" y="%d" transform="rotate(-90 %d %d)">rate</text></g>'
      % (GX, GY - GH, GY, GX + GW, cv, GX + 40, GY + 13, GX - 8, GY - 45, GX - 8, GY - 45))
A.put('<circle class="ben-mk" cx="%d" cy="%d" r="4"/>' % (GX, GY - 4),
      A.path([(0, 0, 0), (S[3], 0, 0), (S[3] + 2.5, 52, -80), (S[4] - .5, 52, -80), (S[4] + 2, 70, -76 + 70), (T - .8, 70, -6)], show=(0, T - .7)))
A.group(A.win(S[3] + 2.5, S[4]), '<text class="ben-sm" x="%d" y="%d">optimum</text>' % (GX + 52, GY - 92))
A.caption(S[0], S[1] - .3, 'The substrate fits the active', 'site, like a key in a lock')
A.caption(S[1], S[2] - .3, 'Only this shape fits:', 'enzymes are specific')
A.caption(S[2], S[3] - .3, 'It is broken into products;', 'the enzyme is not used up')
A.caption(S[3], S[4] - .3, 'Warmer is faster, up to', 'the optimum temperature')
A.caption(S[4], T - .7, 'Too hot: the active site changes', 'shape — the enzyme is denatured')

html, css = A.build('TB-GCSE-BIO', 3, 'Enzymes', 'Enzyme|Active site|Denatured|Above the optimum',
                    'substrate fits the active site; too hot, the shape changes and nothing fits')
anim_row.write_anim('enzyme', html=html, css=css)
