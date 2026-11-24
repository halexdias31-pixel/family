"""A paper's figure that is a PICTURE (a raster image pasted into the PDF), kept as that picture: the figures stage's
`figure_script` for what tools/pdf_figure.py cannot draw (it takes vector line-work only and reports a raster it meets).

    python3 tools/pdf_raster.py <pdf> <page>:<x0>,<y0>,<x1>,<y1> [<page>:<x0>,<y0>,<x1>,<y1> ...] <label words>

page counts from 1, the box is in PDF points. Each box is rendered from the page in grey, at twice the one width
(svgplot.W), and the boxes are stacked one under another in a single SVG `W` wide, each on a white ground so it reads
on the dark card as on paper. The label is the figure's accessible name. Printed to stdout, as figkit's scripts print.
Used by the Physics & Maths Tutor topic sets (24 Nov), whose figures are photographs and scans of the boards' own.
"""
import base64
import os
import sys

import pymupdf

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from svgplot import W                       # noqa: E402

GAP = 6


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def raster(pdf, boxes, label):
    doc = pymupdf.open(pdf)
    parts, y = [], 0
    for page, box in boxes:
        r = pymupdf.Rect(*box)
        zoom = 2 * W / max(1.0, r.width)
        pix = doc[page - 1].get_pixmap(matrix=pymupdf.Matrix(zoom, zoom), clip=r, colorspace=pymupdf.csGRAY)
        h = round(W * r.height / max(1.0, r.width))
        data = base64.b64encode(pix.tobytes('png')).decode('ascii')
        parts.append('<rect x="0" y="%d" width="%d" height="%d" fill="#fff"/>' % (y, W, h)
                     + '<image x="0" y="%d" width="%d" height="%d" href="data:image/png;base64,%s"/>' % (y, W, h, data))
        y += h + GAP
    y -= GAP
    return ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">' % (W, y, esc(label))) + ''.join(parts) + '</svg>'


def main(argv):
    if len(argv) < 3:
        raise SystemExit(__doc__)
    # the label is every word after the boxes: the figures stage splits a script's line at its spaces
    pdf, boxes, words = argv[0], [], []
    for a in argv[1:]:
        page, _, box = a.partition(':')
        if not words and page.isdigit() and box.count(',') == 3:
            boxes.append((int(page), [float(v) for v in box.split(',')]))
        else:
            words.append(a)
    sys.stdout.write(raster(pdf, boxes, ' '.join(words) or 'Figure'))


if __name__ == '__main__':
    main(sys.argv[1:])
