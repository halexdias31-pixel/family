# Pixels and colour depth (GCSE Computer Science, chapter 3 Data representation). Run: python3 tools/cs_pixel.py
# The same 8 × 8 picture twice: with 1 bit a pixel it has 2 colours (0, 1) and takes 8 × 8 × 1 = 64 bits; with 2 bits a
# pixel it has 4 colours (00 01 10 11) and takes 128. Drawn in the one animation format (16 Nov, tools/sa_draw.py).
import pathlib, sys; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import anim_row
from sa_draw import Svg

PIC = ['..3333..', '.322223.', '32122123', '32222223', '32122123', '32211223', '.322223.', '..3333..']
C = 12
d = Svg(400, 220)


def grid(x0, depth, step):
    d.g(step)
    for r, row in enumerate(PIC):
        for c, ch in enumerate(row):
            v = 0 if ch == '.' else int(ch)
            if depth == 1: v = 1 if v else 0
            cls = {0: 'pt', 1: 'fill', 2: 'fill cool', 3: 'fill hot'}[v if depth == 2 else (1 if v else 0)]
            d.rect(x0 + c * C, 30 + r * C, C - 1, C - 1, cls, style='stroke-opacity:.3' if v == 0 else '')
    d.end()


d.text(100, 18, '1 bit a pixel', size=12)
grid(52, 1, 's1')
d.g('s2'); d.text(100, 146, '2 colours: 0 1', 'cool'); d.end()
d.g('s3'); d.text(100, 168, '8 × 8 × 1 = 64 bits', 'hot'); d.end()
d.g('s4'); d.text(300, 18, '2 bits a pixel', size=12); d.end()
grid(252, 2, 's5')
d.g('s6'); d.text(300, 146, '4 colours: 00 01 10 11', 'cool'); d.end()
d.g('s7'); d.text(300, 168, '8 × 8 × 2 = 128 bits', 'hot'); d.end()
d.g('s8'); d.text(200, 205, 'more bits a pixel: more colours, a bigger file'); d.end()
anim_row.write_sa('pixel', d.svg('With 1 bit a pixel there are 2 colours; with 2 bits, 4 colours and twice the size'))
