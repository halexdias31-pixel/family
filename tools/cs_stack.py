# Stacks and queues (GCSE Computer Science, chapter 9 Data structures). Run: python3 tools/cs_stack.py
# The same six operations on a stack (last in, first out) and a queue (first in, first out): push or enqueue A, B, C,
# take one, add D, take one. What each holds after each step is worked out below. Drawn in the one format (16 Nov).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

OPS = ['A', 'B', 'C', None, 'D', None]
d = Svg(400, 250)


def run(fifo):
    held, says = [], []
    for op in OPS:
        if op: held.append(op); says.append(('enqueue ' if fifo else 'push ') + op)
        else: says.append(('dequeue → ' if fifo else 'pop → ') + held.pop(0 if fifo else -1))
    return held, says


sh, ss = run(False)
qh, qs = run(True)
d.text(100, 18, 'stack · last in, first out', size=12)
d.text(300, 18, 'queue · first in, first out', size=12)
for k in range(6):
    d.g('s%d' % (k + 1))
    d.text(100, 40 + k * 18, ss[k], 'hot' if '→' in ss[k] else '', size=12)
    d.text(300, 40 + k * 18, qs[k], 'hot' if '→' in qs[k] else '', size=12)
    d.end()
d.g('s7')
d.path('M70,160 v80 h60 v-80')                        # the stack: an open box, the top open
for i, v in enumerate(sh): d.box(76, 212 - i * 26, 48, 22, v, 'cool', rx=3)
d.text(150, 230 - (len(sh) - 1) * 26, '← top', 'cool', anchor='start', size=11)
d.path('M220,190 h160 M220,222 h160')                 # the queue: a pipe, front on the left
for i, v in enumerate(qh): d.box(226 + i * 52, 195, 46, 22, v, 'cool', rx=3)
d.text(226, 240, 'front', 'cool', anchor='start', size=11)
d.end()
anim_row.write_sa('stack', d.svg('A stack takes the last item in first; a queue takes the first in first'))
