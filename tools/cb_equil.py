# Equilibrium and Le Chatelier's principle (GCSE Chemistry chapter 8, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_equil.py
#
# WHAT IT SHOWS. The Haber reaction, N₂ + 3H₂ ⇌ 2NH₃ (forward exothermic), as molecules counted on each
# side, with the two arrows' lengths as the forward and backward rates. At equilibrium the arrows match
# and the counts hold. Each change the chapter names is applied once and the system is seen to shift
# against it: pressure up → towards fewer gas molecules (4 → 2), more ammonia; temperature up → the
# endothermic (backward) way, less ammonia; ammonia removed → more is made to replace it. The still is
# the pressure shift, the chapter's [H] worked line.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2, arrow = cb_kit.r2, cb_kit.arrow

T = 30.0
S = [0, 6, 13, 20, 26]
A = cb_kit.Anim('equil', 'ceq', T, still=S[1] + 5)
A.rule('.an-equil { --ceq-n: #6fa8dc; --ceq-h: #f4f1e8; --ceq-a: #8fd18a; }')
A.rule('.ceq-n { fill: var(--ceq-n); } .ceq-h { fill: var(--ceq-h); } .ceq-am { fill: var(--ceq-a); }')
A.rule('.ceq-svg .ceq-eq { font-size: 13px; font-weight: 700; }')
A.rule('.ceq-svg .ceq-ch { font-size: 13px; font-weight: 700; fill: var(--coral); }')
A.rule('.ceq-svg .ceq-lab { font-size: 11px; fill-opacity: .85; }')
A.rule('.ceq-fw { color: var(--gold); } .ceq-bw { color: var(--paper); }')
A.rule('.ceq-side { fill: var(--paper); fill-opacity: .05; stroke: var(--paper); stroke-opacity: .3; }')
A.head("Equilibrium shifts")
A.put('<text class="ceq-eq" x="120" y="36">N₂ + 3H₂ ⇌ 2NH₃</text>')
A.put('<rect class="ceq-side" x="8" y="48" width="88" height="84" rx="4"/><rect class="ceq-side" x="144" y="48" width="88" height="84" rx="4"/>')
A.put('<text class="ceq-lab" x="52" y="146">reactants</text><text class="ceq-lab" x="188" y="146">ammonia</text>')


def react(x, y, k):        # alternate N2 and H2 icons
    if k % 4 == 0: return '<circle class="ceq-n" cx="%s" cy="%s" r="5"/><circle class="ceq-n" cx="%s" cy="%s" r="5"/>' % (r2(x - 4), y, r2(x + 4), y)
    return '<circle class="ceq-h" cx="%s" cy="%s" r="3.5"/><circle class="ceq-h" cx="%s" cy="%s" r="3.5"/>' % (r2(x - 3), y, r2(x + 3), y)


def nh3(x, y):
    return '<circle class="ceq-am" cx="%s" cy="%s" r="5.5"/><circle class="ceq-h" cx="%s" cy="%s" r="3"/><circle class="ceq-h" cx="%s" cy="%s" r="3"/><circle class="ceq-h" cx="%s" cy="%s" r="3"/>' % (
        r2(x), y, r2(x - 6), y + 4, r2(x + 6), y + 4, r2(x), y - 6)


RS = [(20 + 21 * (k % 4), 62 + 22 * (k // 4)) for k in range(16)]
PS = [(158 + 22 * (k % 4), 64 + 22 * (k // 4)) for k in range(16)]
# counts per stage: (reactant icons, ammonia icons, forward length, backward length)
ST = [(8, 4, 30, 30), (5, 7, 42, 22), (5, 7, 30, 30), (9, 3, 22, 42), (9, 3, 30, 30), (9, 0, 42, 16), (7, 3, 30, 30)]
TIMES = [0, S[1] + 1.5, S[1] + 4.5, S[2] + 1.5, S[2] + 4.5, S[3] + .5, S[3] + 3]
END = [TIMES[1], TIMES[2], TIMES[3], TIMES[4], TIMES[5], TIMES[6], T - .7]
for k in range(16):
    a, b = [], []
    for st, (nr, na, _, _) in enumerate(ST):
        a.append(k < nr); b.append(k < na)

    def track(flags):
        pts, f = [], .5
        for st, on in enumerate(flags):
            t0 = TIMES[st]
            pts.append((t0 + (f if st else 0), 1 if on else 0, 0, 0, 1))
            pts.append((END[st], 1 if on else 0, 0, 0, 1))
        return pts
    x, y = RS[k]
    A.put('<g>' + react(x, y, k) + '</g>', None if all(a[:-1]) and a[-1] else track(a))
    x, y = PS[k]
    if any(b): A.put('<g>' + nh3(x, y) + '</g>', track(b))
# the two rate arrows: forward (gold, right) and backward (paper, left), a length per stage
for st, (_, _, fw, bw) in enumerate(ST):
    t0, t1 = TIMES[st], END[st]
    A.group(A.win(t0 + (.4 if st else 0), t1, .4) if (st or t1 < T) else None,
            arrow(120 - fw / 2, 82, 120 + fw / 2, 82, 'ceq-ar ceq-fw'), arrow(120 + bw / 2, 100, 120 - bw / 2, 100, 'ceq-ar ceq-bw'))
A.group(A.win(S[1], S[2] - .3), '<text class="ceq-ch" x="120" y="164">pressure ↑</text>')
A.group(A.win(S[2], S[3] - .3), '<text class="ceq-ch" x="120" y="164">temperature ↑</text>')
A.group(A.win(S[3], T - .7), '<text class="ceq-ch" x="120" y="164">ammonia removed</text>')
A.caption(S[0], S[1] - .3, 'Equilibrium: forward and back', 'at the same rate')
A.caption(S[1], S[2] - .3, 'More pressure: it shifts to', 'fewer molecules (4 → 2)')
A.caption(S[2], S[3] - .3, 'Hotter: it shifts the endo-', 'thermic way — less ammonia')
A.caption(S[3], T - .7, 'Take ammonia away: more is', 'made to replace it')

html, css = A.build('TB-GCSE-CHEM', 8, 'Equilibrium', "Equilibrium|Le Chatelier's principle|Reversible reaction",
                    'N₂ + 3H₂ ⇌ 2NH₃ shifting against pressure, temperature and removal')
anim_row.write_anim('equil', html=html, css=css)
