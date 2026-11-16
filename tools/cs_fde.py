# Fetch, decode, execute (GCSE Computer Science, chapter 1 Systems architecture). Run: python3 tools/cs_fde.py
# A three-line program in memory, LDA 4, ADD 5, HLT, with 7 and 5 as data. Each step moves one value between memory and
# the registers PC, MAR, MDR, CIR and ACC; the registers are shown as they end, ACC holding 7 + 5 = 12. Drawn in the one
# animation format (16 Nov, tools/sa_draw.py).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

MEM = [(0, 'LDA 4'), (1, 'ADD 5'), (2, 'HLT'), (4, '7'), (5, '5')]
STEPS = [('fetch', 'PC → MAR, memory[0] → MDR → CIR, PC + 1'), ('decode', 'LDA 4: load from 4'),
         ('execute', '4 → MAR, memory[4] → MDR → ACC = 7'), ('fetch', 'PC → MAR, memory[1] → MDR → CIR, PC + 1'),
         ('decode', 'ADD 5: add from 5'), ('execute', '5 → MAR, memory[5] → MDR, ACC + MDR → ACC = 12')]
REGS = [('PC', '0 → 1 → 2'), ('MAR', '0, 4, 1, 5'), ('MDR', 'LDA 4, 7, ADD 5, 5'), ('CIR', 'LDA 4 → ADD 5'), ('ACC', '7 → 12')]
d = Svg(400, 250)
d.text(52, 16, 'memory', size=12)
for k, (a, v) in enumerate(MEM):
    d.text(22, 38 + k * 22, str(a), size=11)
    d.rect(32, 24 + k * 22, 62, 20, 'pt', rx=2)
    d.text(63, 38 + k * 22, v, 'cool' if a < 3 else '', size=11)
for k, (r, v) in enumerate(REGS):
    d.g('s%d' % (k + 1) if k < 4 else 's6')
    d.text(150, 38 + k * 22, r, 'hot', anchor='end', size=11)
    d.rect(156, 24 + k * 22, 228, 20, 'pt', rx=2)
    d.text(270, 38 + k * 22, v, size=11)
    d.end()
for k, (kind, say) in enumerate(STEPS):
    d.g('s%d' % min(8, k + 3))
    d.text(16, 150 + k * 16, kind, 'hot' if kind == 'execute' else 'cool', anchor='start', size=11)
    d.text(80, 150 + k * 16, say, anchor='start', size=11)
    d.end()
anim_row.write_sa('fde', d.svg('Fetch, decode, execute: LDA 4 then ADD 5 leave 12 in the accumulator'))
