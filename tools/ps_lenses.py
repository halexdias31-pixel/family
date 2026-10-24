# Two lenses on one school (GCSE Sociology, Education): the functionalist lens (green) sees shared values and a fair
# race; the Marxist lens (orange) sees class reproduced and obedience taught. One keyframe, the second half a loop
# behind the first. Writes the `lens` row. Run: python3 tools/ps_lenses.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

T = 8.0
html = '''<div id="splash-lens" aria-hidden="true">
    <div class="le-r"><b>school</b><i></i><i class="le-2"></i></div>
    <div class="le-t"><span>functionalist: shared values, a fair race</span><span class="le-2">Marxist: class reproduced, obedience taught</span></div>
  </div>'''
css = '''.le-r{position:relative;display:grid;place-items:center;height:5rem}
.le-r b{padding:.7rem 1.1rem;border:2px solid #f0ece099;font:700 .8rem var(--mono);color:var(--paper)}
.le-r i{position:absolute;width:4.6rem;height:4.6rem;border:4px solid #6fd8a0;border-radius:50%%}
.le-r .le-2{border-color:#e8862c}
.le-r i,.le-t span{animation:le-on %(t)gs infinite}
#splash-lens .le-2{animation-delay:-%(h)gs}
@keyframes le-on{0%%,45%%,100%%{opacity:1}50%%,95%%{opacity:0}}
.le-t{display:grid;margin-top:.8rem;font:.7rem var(--mono);color:#6fd8a0;text-align:center}
.le-t span{grid-area:1/1}
.le-t .le-2{color:#e8862c}
@media (prefers-reduced-motion: reduce) {
  .le-r i,.le-t span{animation:none}
  .le-2{display:none}
}''' % {'t': T, 'h': T / 2}
anim_row.write_anim('lens', html=html, css=css)
