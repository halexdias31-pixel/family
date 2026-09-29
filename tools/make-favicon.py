"""tools/make-favicon.py -- the tab icon, as a CIRCLE cut from icon.png.

ASKED FOR AS "make the favicon circular". A browser tab draws a favicon exactly as the file is, so
the only way to get a round one is a file whose corners are transparent.

WHY A SECOND FILE AND NOT A ROUND icon.png. icon.png has two other readers and both want a square:
the manifest declares it `purpose: maskable`, which REQUIRES a full-bleed tile (the platform cuts its
own shape out of it, and transparent corners show as black on Android); and iOS draws
`apple-touch-icon` onto its own rounded square, filling anything transparent with black. So a round
mark there would be a black-cornered tile on both home screens. The tab is the one surface that
shows the file as-is, so it is the one that gets the circle.

CUT FROM icon.png RATHER THAN DRAWN AGAIN, so the mark cannot drift from the one make-icon.py draws:
re-run this after that. The glyph is sized to fit the maskable safe circle, so a full-width circle
keeps every pixel of it. The edge is supersampled four times so it is round at 16px rather than a
staircase.
"""
import os
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, '..', 'icon.png')
OUT = os.path.join(HERE, '..', 'favicon.png')
SIZE, SS = 128, 4

def main():
    tile = Image.open(SRC).convert('RGBA').resize((SIZE, SIZE), Image.LANCZOS)
    big = Image.new('L', (SIZE * SS, SIZE * SS), 0)
    ImageDraw.Draw(big).ellipse((0, 0, SIZE * SS - 1, SIZE * SS - 1), fill=255)
    tile.putalpha(big.resize((SIZE, SIZE), Image.LANCZOS))
    tile.save(OUT, 'PNG', optimize=True)
    corner = tile.getpixel((0, 0))[3]
    assert corner == 0, 'the corner is not transparent, so the icon is not round'
    print('favicon.png  %dx%d, circular, corner alpha %d, %d bytes' % (SIZE, SIZE, corner, os.path.getsize(OUT)))

if __name__ == '__main__':
    main()
