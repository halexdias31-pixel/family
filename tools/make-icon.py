#!/usr/bin/env python3
"""icon.png — the brand mark, drawn from the site's own font and the site's own palette.

WHY IT IS DRAWN AND NOT DOWNLOADED. index.html has carried the whole argument for this file for
weeks and says outright that all three of its consumers point at a 404: `<link rel="icon">`, the
`apple-touch-icon` iOS reads at Add-to-Home-Screen, and the `icons` array inside the manifest data
URI. Every host but GitHub is blocked from the agent environment by network policy -- measured, not
assumed: upload.wikimedia.org and drive.google.com both answer `connect_rejected` -- so "an image
off the internet" was never available, and a Drive-hosted one is a third-party request for the tab
icon on every cold load that 404s the day the sharing changes. The mark is two characters of the
site's own typeface on the site's own ground, which needs no network at all and cannot go stale.

`@` ALONE, BECAUSE A FAVICON IS A MARK RATHER THAN A WORD. `@family.` set at 16px is a smear. The
`@` is the brand's own first character, it is the one glyph in the name that reads at 16px, and in
Cascadia's cut it is distinctive enough not to read as a generic email sign.

THE PALETTE IS INVERTED AND THAT IS A MEASUREMENT RATHER THAN A PREFERENCE. Everywhere else in this
app gold is the one thing to look at on black, so gold-on-black was written first -- and rendered at
the four sizes its three consumers actually ask for (512, 180, 32, 16) it is a dim smudge at 16px,
which is a favicon failing at the one size that decides whether anybody finds the tab. What carries
at 16px is the GROUND, because a 16px tile is about 250 pixels and a glyph in it is about forty. So
the tile is gold and the `@` is cut out of it in black: the brand's own accent, doing at 16px the
job the black ground does at 512. Screenshotted at all four sizes, both ways round, before choosing.

MASKABLE IS WHY THE GLYPH IS NOT BIGGER, AND THE GUARANTEE IS A CIRCLE RATHER THAN A SQUARE. The
manifest declares `icon.png` for purpose `any` AND for purpose `maskable`, and a maskable icon is
cropped by the platform to a shape it chooses -- Android guarantees only a centred circle of 80% of
the width. The first version fitted the ink inside that circle's INSCRIBED SQUARE, which is the
conservative reading and cost a third of the mark: Cascadia's `@` is a monospace glyph and so is
much taller than it is wide, so sizing by its larger dimension left it 39% x 56% of the icon. The
constraint that is actually true is the ink box's own half-diagonal against the circle's radius,
which takes the same glyph to 46% x 66% with nothing at risk of being cropped. The ground is
full-bleed either way, because a padded ground shows the platform's own colour in the corners.

THE FONT IS THE SITE'S OWN, decompressed from fonts/family-code.woff2 rather than approximated with
a system face. A mark drawn in DejaVu on a site set in Cascadia is a mark that does not belong to
it, and the whole point of self-hosting the typeface was that the site has one face rather than
whatever a machine happens to have.

Rebuild with:  python3 tools/make-icon.py
"""
import io, os, sys
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WOFF2 = os.path.join(HERE, 'fonts', 'family-code.woff2')
OUT   = os.path.join(HERE, 'icon.png')

W      = 512          # what the manifest declares, and the largest any consumer asks for
GROUND = '#ffb454'    # --gold in style.css. The tile, because the tile is what reads at 16px
INK    = (0, 0, 0)    # --bg   in style.css
SAFE_R = 0.8 * W / 2  # 204.8px -- the radius of the circle a maskable icon is guaranteed to keep
MARK   = '@'
WEIGHT = 700          # the heaviest the variable axis carries; a light @ closes up at 16px


def ttf_bytes():
    """woff2 -> ttf in memory. PIL cannot read woff2; fontTools can, and writes a real ttf."""
    f = TTFont(WOFF2)                      # needs brotli, which is installed
    buf = io.BytesIO()
    f.save(buf)
    return buf.getvalue()


def pick_size(ttf):
    """The largest point size whose INK BOX still fits inside the maskable circle.

    Measured rather than derived from the em square: a glyph's ink is a fraction of its em and the
    fraction differs per glyph, so asking for a 410px em gives a mark well under 410px of actual
    ink. The test is the box's half-diagonal against the radius -- the corner is the only part of a
    rectangle that can leave a circle, so anything nearer the centre than that is safe."""
    path = os.path.join(os.path.dirname(OUT), '.family-code-tmp.ttf')
    with open(path, 'wb') as fh:
        fh.write(ttf)
    try:
        best, lo, hi = None, 8, W * 3
        while lo <= hi:
            mid = (lo + hi) // 2
            fnt = ImageFont.truetype(path, mid)
            try:
                fnt.set_variation_by_axes([WEIGHT])
            except Exception:
                pass
            l, t, r, b = fnt.getbbox(MARK)
            half = (((r - l) / 2) ** 2 + ((b - t) / 2) ** 2) ** 0.5
            if half <= SAFE_R:
                best = (mid, fnt, (l, t, r, b))
                lo = mid + 1
            else:
                hi = mid - 1
        return best
    finally:
        os.path.exists(path) and os.remove(path)


def main():
    if not os.path.exists(WOFF2):
        sys.exit('fonts/family-code.woff2 is not there, so there is no face to draw with')
    picked = pick_size(ttf_bytes())
    if not picked:
        sys.exit('no point size fits the safe circle -- the glyph is missing from the subset')
    size, fnt, (l, t, r, b) = picked

    img = Image.new('RGB', (W, W), GROUND)
    d = ImageDraw.Draw(img)
    # Centre the INK, not the em box: a glyph's bearings are not symmetrical, and centring the em
    # leaves the mark visibly off-centre at 16px, where one pixel is a twentieth of the icon.
    d.text(((W - (r - l)) / 2 - l, (W - (b - t)) / 2 - t), MARK, font=fnt, fill=INK)
    img.save(OUT, 'PNG', optimize=True)

    print('icon.png  %dx%d  mark "%s" at %dpt, ink %dx%d (%.0f%% x %.0f%% of the icon), '
          'half-diagonal %.0fpx of a %.0fpx safe radius  %d bytes'
          % (W, W, MARK, size, r - l, b - t, 100 * (r - l) / W, 100 * (b - t) / W,
             ((((r - l) / 2) ** 2 + ((b - t) / 2) ** 2) ** 0.5), SAFE_R, os.path.getsize(OUT)))


if __name__ == '__main__':
    main()
