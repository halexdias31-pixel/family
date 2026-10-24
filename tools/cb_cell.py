# Cell structure: animal, plant, bacterium (GCSE Biology chapter 1, and a loading splash) — docs/history/420.
# THIS SCRIPT IS THE ROW'S SOURCE: change it here and re-run, never the row. Run: python3 tools/cb_cell.py
#
# WHAT IT SHOWS. An animal cell is labelled part by part, each label naming its job (nucleus — holds the
# DNA; mitochondria — respiration; ribosomes — make proteins; membrane — controls what goes in and out).
# Then the same cell gains what only a plant cell has: a cellulose wall, a permanent vacuole, chloroplasts.
# Then a bacterium beside it, much smaller, with no nucleus — its DNA a loose loop, plus plasmids: the
# eukaryotic/prokaryotic difference the chapter opens with. The still is the plant cell, fully labelled.
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row, cb_kit
r2 = cb_kit.r2

T = 30.0
S = [0, 2.2, 4.4, 6.6, 8.8, 12, 14.2, 16.4, 20]
A = cb_kit.Anim('cell', 'bce', T, still=S[8] - .6)
A.rule('.an-cell { --bce-cy: #2f4a3a; --bce-nu: #b98cff; --bce-mi: #ff9e64; --bce-ch: #3ddc84; --bce-va: #6fa8dc; }')
A.rule('.bce-mem { fill: var(--bce-cy); stroke: var(--paper); stroke-width: 1.4; }')
A.rule('.bce-wall { fill: none; stroke: var(--gold); stroke-width: 3; }')
A.rule('.bce-nu { fill: var(--bce-nu); } .bce-mi { fill: var(--bce-mi); } .bce-ri { fill: var(--paper); } .bce-ch { fill: var(--bce-ch); } .bce-va { fill: var(--bce-va); fill-opacity: .55; }')
A.rule('.bce-ln { stroke: var(--paper); stroke-opacity: .7; stroke-width: .8; }')
A.rule('.bce-svg .bce-lb { font-size: 11px; text-anchor: start; } .bce-svg .bce-jb { font-size: 10.5px; text-anchor: start; fill: var(--gold); }')
A.rule('.bce-dna { fill: none; stroke: var(--bce-nu); stroke-width: 1.6; } .bce-pl { fill: none; stroke: var(--bce-nu); stroke-width: 1.2; }')
A.head('Inside a cell')
CX, CY = 66, 92
# the cell: animal (round) through step 4; plant box after; both share the inside
A.put('<ellipse class="bce-mem" cx="%d" cy="%d" rx="52" ry="58"/>' % (CX, CY), A.win(0, S[4] + 2.6, .6))
A.put('<rect class="bce-mem" x="%d" y="%d" width="104" height="116" rx="4"/>' % (CX - 52, CY - 58), A.win(S[4] + 2.6, T - .7, .6))
A.put('<rect class="bce-wall" x="%d" y="%d" width="112" height="124" rx="5"/>' % (CX - 56, CY - 62), A.pop(S[5], T - .7, s0=1.08))
A.put('<rect class="bce-va" x="%d" y="%d" width="40" height="70" rx="12"/>' % (CX - 4, CY - 34), A.pop(S[6], T - .7, s0=.6))
chl = ''.join('<ellipse class="bce-ch" cx="%d" cy="%d" rx="7" ry="4"/>' % (x, y) for x, y in [(28, 52), (100, 46), (24, 132), (104, 138), (52, 140)])
A.put('<g>' + chl + '</g>', A.pop(S[7], T - .7))
A.put('<circle class="bce-nu" cx="%d" cy="%d" r="15"/>' % (CX - 20, CY - 10))
A.put('<g>' + ''.join('<ellipse class="bce-mi" cx="%d" cy="%d" rx="8" ry="4" transform="rotate(%d %d %d)"/>' % (x, y, a, x, y) for x, y, a in [(40, 118, 30), (88, 64, -20), (70, 128, 10)]) + '</g>')
A.put('<g>' + ''.join('<circle class="bce-ri" cx="%d" cy="%d" r="1.6"/>' % (x, y) for x, y in [(30, 80), (34, 100), (48, 112), (60, 66), (82, 110), (36, 70), (54, 124), (96, 92)]) + '</g>')
LB = [  # (label, job, point on the cell, label y, step)
    ('nucleus', 'holds the DNA', (CX - 20, CY - 10), 30, S[0]),
    ('cytoplasm', 'reactions happen', (CX - 30, CY + 18), 56, S[1]),
    ('mitochondria', 'respiration', (88, 64), 82, S[2]),
    ('ribosomes', 'make proteins', (96, 92), 108, S[3]),
    ('cell membrane', 'controls entry', (CX + 50, CY + 20), 134, S[4]),
]
PL = [('cell wall', 'support', (CX + 56, CY - 40), 30, S[5]), ('vacuole', 'cell sap', (CX + 16, CY + 10), 82, S[6]), ('chloroplasts', 'photosynthesis', (104, 138), 134, S[7])]
for lab, job, (px, py), ly, t in LB:
    A.group(A.win(t + .2, S[5] - .3, .4), '<path class="bce-ln" d="M%d %dL134 %d"/>' % (px, py, ly - 4), '<text class="bce-lb" x="138" y="%d">%s</text><text class="bce-jb" x="138" y="%d">%s</text>' % (ly, lab, ly + 12, job))
for lab, job, (px, py), ly, t in PL:
    A.group(A.win(t + .2, S[8] - .3, .4), '<path class="bce-ln" d="M%d %dL134 %d"/>' % (px, py, ly - 4), '<text class="bce-lb" x="138" y="%d">%s</text><text class="bce-jb" x="138" y="%d">%s</text>' % (ly, lab, ly + 12, job))
# the bacterium: a capsule beside, its DNA loose
bac = ('<rect class="bce-mem" x="140" y="62" width="84" height="40" rx="20"/><rect class="bce-wall" x="137" y="59" width="90" height="46" rx="23"/>'
       '<path class="bce-dna" d="M160 82c6 -12 14 8 22 -4s14 10 22 0"/><circle class="bce-pl" cx="210" cy="72" r="4"/><circle class="bce-pl" cx="158" cy="94" r="3.5"/>')
A.group(A.win(S[8], T - .7), bac, '<text class="bce-lb" x="146" y="124">no nucleus:</text><text class="bce-jb" x="146" y="138">a loop of DNA</text><text class="bce-jb" x="146" y="152">+ plasmids</text>')
A.caption(S[0], S[5] - .3, 'An animal cell: each part', 'has a job')
A.caption(S[5], S[8] - .3, 'A plant cell adds a wall,', 'a vacuole and chloroplasts')
A.caption(S[8], T - .7, 'A bacterium is prokaryotic:', 'smaller, and no nucleus')

html, css = A.build('TB-GCSE-BIO', 1, 'Cell structure', 'Eukaryotic cell|Prokaryotic cell|Organelle|Plant cell extras',
                    'animal and plant cells labelled part by part, then a bacterium')
anim_row.write_anim('cell', html=html, css=css)
