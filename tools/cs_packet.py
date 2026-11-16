# Packet switching (GCSE Computer Science, chapter 4 Networks). Run: python3 tools/cs_packet.py
# HELLO! is split into numbered packets, 1HE 2LL 3O!, each sent its own way through routers R1 to R4 from A to B; they
# arrive out of order, 2, 1, 3, and are put back in order by number. Drawn in the one animation format (16 Nov).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

NODES = {'A': (40, 80), 'R1': (140, 35), 'R2': (140, 125), 'R3': (260, 35), 'R4': (260, 125), 'B': (360, 80)}
LINKS = ['A R1', 'A R2', 'R1 R3', 'R2 R4', 'R1 R4', 'R2 R3', 'R3 B', 'R4 B']
PACKETS = [('1HE', 'A R1 R3 B'), ('2LL', 'A R2 R4 B'), ('3O!', 'A R2 R3 B')]
ARRIVE = [1, 0, 2]
d = Svg(400, 250)
for l in LINKS:
    (x1, y1), (x2, y2) = (NODES[n] for n in l.split())
    d.line(x1, y1, x2, y2, 'pt', 'stroke-opacity:.5')
for k, (p, route) in enumerate(PACKETS):
    pts = [NODES[n] for n in route.split()]
    d.g('s%d' % (k + 2))
    d.path('M' + ' L'.join('%g,%g' % (x, y + (k - 1) * 4) for x, y in pts), 'pt hot mv-flow', 'stroke-width:2')
    d.end()
for n, (x, y) in NODES.items():
    d.circle(x, y, 15, 'pt' + (' cool' if n in 'AB' else ''), 'fill:var(--bg)')
    d.text(x, y + 4, n, 'cool' if n in 'AB' else '', size=11)
d.g('s1'); d.text(200, 172, 'split into numbered packets, each sent its own way')
for k, (p, _) in enumerate(PACKETS): d.box(150 + k * 36, 180, 32, 18, p, 'hot', size=10, rx=3)
d.end()
d.g('s5'); d.text(200, 220, 'they arrive out of order: 2, 1, 3', size=11); d.end()
d.g('s7'); d.text(200, 240, 'put back in order by number: HELLO!', 'cool'); d.end()
anim_row.write_sa('packet', d.svg('HELLO! is sent as three numbered packets by different routes and put back in order'))
