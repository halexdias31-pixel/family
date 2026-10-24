# Sampling methods (GCSE Psychology, Research methods): a population of 20, five of them in a smaller group (blue). In turn
# a random sample of 4, a stratified one (3 + 1, the groups' 15 : 5) and an opportunity one (the 4 nearest) light up.
# One keyframe serves all three, offset by a third of the loop. Writes the `samp` row. Run: python3 tools/ps_sampling.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

T = 9.0
BLUE = {3, 7, 11, 15, 19}   # every fourth, so one :nth-child(4n) rule colours them
PICK = {'r': {2, 9, 12, 18}, 's': {4, 7, 13, 16}, 'o': {0, 1, 5, 6}}
assert len(PICK['s'] & BLUE) * 20 == len(PICK['s']) * len(BLUE)   # stratified: the small group's share, 1 of 4
cells = []
for k in range(20):
    assert (k in BLUE) == ((k + 1) % 4 == 0)
    cls = ['sa-' + m for m in PICK if k in PICK[m]]
    cells.append('<i class="%s"></i>' % ' '.join(cls) if cls else '<i></i>')
html = '''<div id="splash-samp" aria-hidden="true">
    <div class="sa-g">%s</div>
    <div class="sa-t"><span>random</span><span>stratified</span><span>opportunity</span></div>
  </div>''' % ''.join(cells)
css = '''.sa-g{display:grid;grid-template-columns:repeat(5,1.1rem);gap:.55rem;justify-content:center}
.sa-g i{height:1.1rem;border-radius:50%%;background:#8a7a5c}
.sa-g :nth-child(4n){background:#4b6a8a}
.sa-r,.sa-s,.sa-o{animation:sa-on %(t)gs infinite}
.sa-t span{animation:sa-say %(t)gs infinite}
.sa-s,.sa-t span+span{animation-delay:-%(b)gs}
.sa-o,.sa-t span+span+span{animation-delay:-%(c)gs}
@keyframes sa-on{0%%,30%%{box-shadow:0 0 0 3px #f0b45f}33%%{box-shadow:none}}
@keyframes sa-say{0%%,30%%{opacity:1}33%%,100%%{opacity:0}}
.sa-t{display:grid;margin-top:.9rem;font:700 .76rem var(--mono);color:#f0b45f;text-align:center}
.sa-t span{grid-area:1/1}
@media (prefers-reduced-motion: reduce) {
  .sa-r,.sa-s,.sa-o,.sa-t span{animation:none}
}''' % {'t': T, 'b': 2 * T / 3, 'c': T / 3}
anim_row.write_anim('samp', html=html, css=css)
