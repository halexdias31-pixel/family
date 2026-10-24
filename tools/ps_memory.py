# The multi-store model (GCSE Psychology, Memory): three stores in a row and three items. One is rehearsed into LTM,
# one decays in STM, one is displaced from STM by the next. Writes the `msm` row of data/textbooks.json.
# The stores are 4.4rem wide with a 1.4rem gap, so an item moves 5.8rem a store. Run: python3 tools/ps_memory.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

S = 5.8   # rem from one store's centre to the next
html = '''<div id="splash-msm" aria-hidden="true">
    <div class="ms-r"><b>sensory</b><b>STM</b><b>LTM</b><i></i><i></i><i></i></div>
    <div class="ms-s">rehearse, decay, displace</div>
  </div>'''
css = '''.ms-r{position:relative;display:flex;gap:1.4rem}
.ms-r b{width:4.4rem;padding:1.1rem 0 .5rem;border:2px solid #6fa8dc;font:700 .78rem var(--mono);color:var(--paper);text-align:center}
.ms-r i{position:absolute;left:1.9rem;top:.4rem;padding:.3rem;border-radius:50%;background:#f0b45f;animation:ms-a 7s infinite}
.ms-r i+i{left:1.2rem;animation-name:ms-d}
.ms-r i+i+i{left:2.6rem;animation-name:ms-x}
@keyframes ms-a{0%{opacity:0}6%{opacity:1;transform:none}22%,46%{transform:translateX({S}rem)}62%,94%{opacity:1;transform:translateX({L}rem)}100%{opacity:0;transform:translateX({L}rem)}}
@keyframes ms-d{0%,10%{opacity:0}16%{opacity:1;transform:none}32%,50%{opacity:1;transform:translateX({S}rem)}70%,100%{opacity:0;transform:translateX({S}rem) scale(.3)}}
@keyframes ms-x{0%,40%{opacity:0}46%{opacity:1;transform:none}58%,66%{opacity:1;transform:translateX({S}rem)}86%,100%{opacity:0;transform:translate({S}rem,3rem)}}
.ms-s{margin-top:.8rem;font:.72rem var(--mono);color:#f0ece08c;text-align:center}
@media (prefers-reduced-motion: reduce) {
  .ms-r i{animation:none}
}'''.replace('{S}', '%g' % S).replace('{L}', '%g' % (2 * S))
anim_row.write_anim('msm', html=html, css=css)
