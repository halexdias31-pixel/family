# Independent and dependent variables (GCSE Psychology, Research methods): the IV is switched between two levels, the
# DV follows a moment later, the extraneous variable stays put. Writes the `ivdv` row. Run: python3 tools/ps_variables.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

html = '''<div id="splash-ivdv" aria-hidden="true">
    <div class="iv-r"><b>IV</b><i></i><span>changed</span></div>
    <div class="iv-r"><b>DV</b><i></i><span>measured</span></div>
    <div class="iv-r"><b>EV</b><i></i><span>kept the same</span></div>
  </div>'''
css = '''.iv-r{display:flex;align-items:center;gap:.6rem;margin:.5rem 0;font:700 .74rem var(--mono);color:var(--paper)}
.iv-r i{width:7rem;height:.8rem;border-radius:3px;background:#241f18}
.iv-r i::before{content:"";display:block;height:100%;width:50%;background:#5c544a;transform-origin:left}
.iv-r span{font-weight:400;color:#f0ece08c}
.iv-r:first-child i::before{background:#f0b45f;animation:iv-sw 5s infinite}
.iv-r:nth-child(2) i::before{background:#6fa8dc;animation:iv-sw 5s .6s infinite}
@keyframes iv-sw{0%,40%{transform:scaleX(.5)}50%,90%{transform:scaleX(1.8)}}
@media (prefers-reduced-motion: reduce) {
  .iv-r i::before{animation:none}
}'''
anim_row.write_anim('ivdv', html=html, css=css)
