# DNA to protein (GCSE Biology chapter 10, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_dna.py
#
# WHAT IT SHOWS. A length of DNA as a ladder of base pairs, A with T and C with G, each base its own
# colour. A gene is bracketed. A frame three bases wide slides along it, and for each triplet one amino
# acid (a bead, named) joins a chain underneath: ATG Met, GGC Gly, TCA Ser, TGG Trp. The chain folds
# into a protein shape. Then [H] a mutation: one base changes, its triplet now codes a different amino
# acid, and the bead changes colour — why a mutation can change a protein. The still is the chain built.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2 = cb_kit.r2

T = 28.0
S = [0, 4, 8, 16, 21]
A = cb_kit.Anim('dna', 'bdn', T, still=S[3] - .5)
A.rule('.an-dna { --bdn-A: #ff7b72; --bdn-T: #6fa8dc; --bdn-C: #3ddc84; --bdn-G: #ffb454; }')
A.rule('.bdn-A { fill: var(--bdn-A); } .bdn-T { fill: var(--bdn-T); } .bdn-C { fill: var(--bdn-C); } .bdn-G { fill: var(--bdn-G); }')
A.rule('.bdn-bb { stroke: var(--paper); stroke-opacity: .7; stroke-width: 2; } .bdn-rung { stroke: var(--paper); stroke-opacity: .25; }')
A.rule('.bdn-svg .bdn-b { font-size: 10.5px; font-weight: 700; fill: var(--bg); } .bdn-svg .bdn-lb { font-size: 11px; }')
A.rule('.bdn-fr { fill: none; stroke: var(--gold); stroke-width: 2; } .bdn-br { fill: none; stroke: var(--gold); stroke-width: 1.4; }')
A.rule('.bdn-aa { stroke: var(--paper); stroke-width: 1; } .bdn-a1 { fill: #c3e88d; } .bdn-a2 { fill: #9ec5e8; } .bdn-a3 { fill: #ff8fc4; } .bdn-a4 { fill: #e2cfa6; } .bdn-a5 { fill: var(--coral); }')
A.rule('.bdn-link { stroke: var(--paper); stroke-opacity: .6; stroke-width: 1.5; }')
A.head('From DNA to protein')
SEQ = 'CATGGGCTCATGGA'
PAIR = {'A': 'T', 'T': 'A', 'C': 'G', 'G': 'C'}
X0, DX, Y1, Y2 = 22, 14.2, 44, 80
A.put('<path class="bdn-bb" d="M%d %dH%dM%d %dH%d"/>' % (X0 - 8, Y1 - 9, X0 + DX * 13 + 8, X0 - 8, Y2 + 9, X0 + DX * 13 + 8))
base = lambda b, x, y: '<rect class="bdn-%s" x="%s" y="%d" width="12" height="16" rx="2"/><text class="bdn-b" x="%s" y="%d">%s</text>' % (b, r2(x - 6), y - 8, r2(x), y + 4, b)
for i, b in enumerate(SEQ):
    x = X0 + DX * i
    m = '<path class="bdn-rung" d="M%s %dV%d"/>' % (r2(x), Y1, Y2) + base(b, x, Y1) + base(PAIR[b], x, Y2)
    if i == 7:
        A.put('<g>' + m + '</g>', A.win(0, S[4] + .4, .3))
        A.put('<g><path class="bdn-rung" d="M%s %dV%d"/>' % (r2(x), Y1, Y2) + base('A', x, Y1) + base('T', x, Y2) + '</g>', A.win(S[4] + .4, T - .7, .3))
    else:
        A.put(m)
# the gene: bases 1..12
A.put('<path class="bdn-br" d="M%s 28V24H%sV28"/>' % (r2(X0 + DX - 6), r2(X0 + DX * 12 + 6)), A.win(S[1], T - .7))
A.group(A.win(S[1], S[2]), '<text class="bdn-lb" x="120" y="104">one gene</text>')
# the reading frame and the chain
AA = [('Met', 'bdn-a1'), ('Gly', 'bdn-a2'), ('Ser', 'bdn-a3'), ('Trp', 'bdn-a4')]
fx0 = X0 + DX * 1 - 7
A.put('<rect class="bdn-fr" x="%s" y="32" width="%s" height="20" rx="3"/>' % (r2(fx0), r2(DX * 3)),
      A.path([(S[2] + .3 + 2 * k, DX * 3 * k, 0) for k in range(4)] + [(S[3] - .3, DX * 9, 0)], show=(S[2], S[3] - .2)))
CY = 128
for k, (name, cls) in enumerate(AA):
    x = 60 + 40 * k
    t = S[2] + 1 + 2 * k
    link = '<path class="bdn-link" d="M%d %dH%d"/>' % (x - 40, CY, x) if k else ''
    end = (100 - x + 6 * (k % 2), -10 + 14 * (k // 2))
    A.put('<g>%s<circle class="bdn-aa %s" cx="%d" cy="%d" r="12"/><text class="bdn-b" x="%d" y="%d">%s</text></g>' % (link, cls, x, CY, x, CY + 4, name),
          [(0, 0, 0, 0, .4), (t, 0, 0, 0, .4), (t + .5, 1, 0, 0, 1), (S[3], 1, 0, 0, 1), (S[3] + 2, 1, end[0] * .0, 0, 1), (T - .7, 1, 0, 0, 1), (T - .2, 0, 0, 0, 1)])
# the mutation: base 7 (in the Ser triplet, TCA) becomes A: TCA → ACA, Ser → Thr
A.put('<g><circle class="bdn-aa bdn-a5" cx="140" cy="%d" r="12"/><text class="bdn-b" x="140" y="%d">Thr</text></g>' % (CY, CY + 4), A.pop(S[4] + 1, T - .7))
A.group(A.win(S[3], S[4] - .2), '<text class="bdn-lb" x="120" y="160">a chain of amino acids → a protein</text>')
A.group(A.win(S[4], T - .7), '<text class="bdn-lb" x="120" y="160">TCA → ACA: Ser becomes Thr</text>')
A.caption(S[0], S[1] - .3, 'DNA: two strands; bases pair', 'A with T, C with G')
A.caption(S[1], S[2] - .3, 'A gene is a section of DNA', 'that codes for one protein')
A.caption(S[2], S[3] - .3, 'Each three bases code for', 'one amino acid')
A.caption(S[3], S[4] - .3, 'In order, the amino acids make', 'one particular protein')
A.caption(S[4], T - .7, '[H] A mutation changes a base,', 'so an amino acid may change')

html, css = A.build('TB-GCSE-BIO', 10, 'DNA to protein', 'DNA|Gene|A mutation changes the base sequence',
                    'bases read in threes, each triplet an amino acid; a mutation changes one')
anim_row.write_anim('dna', html=html, css=css)
