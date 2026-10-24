# Piaget's conservation of liquid (GCSE Psychology, Development): two equal short wide glasses; one is poured into a tall
# thin glass half as wide, so its level stands twice as high (3 x 2 = 1.5 x 4). Writes the `piag` row. Run: python3 tools/ps_piaget.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

WIDE, LOW = 3.0, 2.0       # rem: the short glasses and their level
THIN = WIDE / 2
HIGH = WIDE * LOW / THIN   # the same amount in the thin glass
assert WIDE * LOW == THIN * HIGH
html = '''<div id="splash-piag" aria-hidden="true">
    <div class="pg-r"><i><b></b></i><i><b></b></i><i><b></b></i></div>
    <div class="pg-s">same amount: "the tall one has more"</div>
  </div>'''
css = '''.pg-r{display:flex;align-items:flex-end;justify-content:center;gap:1.2rem}
.pg-r i{position:relative;width:%(w)grem;height:5rem;border:2px solid #f0ece099;border-top:0;border-radius:0 0 4px 4px}
.pg-r b{position:absolute;left:0;right:0;bottom:0;height:%(l)grem;background:#6fa8dc;transform-origin:bottom}
.pg-r i+i b{animation:pg-out 6s infinite}
.pg-r i+i+i{width:%(t)grem}
.pg-r i+i+i b{height:%(h)grem;animation-name:pg-in}
@keyframes pg-out{0%%,25%%,100%%{transform:none}55%%,90%%{transform:scaleY(0)}}
@keyframes pg-in{0%%,25%%,100%%{transform:scaleY(0)}55%%,90%%{transform:none}}
.pg-s{margin-top:.9rem;font:.72rem var(--mono);color:#f0ece08c;text-align:center}
@media (prefers-reduced-motion: reduce) {
  .pg-r i+i b{animation:none}
}''' % {'w': WIDE, 'l': LOW, 't': THIN, 'h': HIGH}
anim_row.write_anim('piag', html=html, css=css)
