# Milgram's obedience study (GCSE Psychology, Social influence), drawn as the generator's dial only: 30 switches from
# 15 to 450 volts in 15-volt steps, lit one by one, under the prod "please continue". No learner is drawn: the study is
# about the teacher. 300 V is where every participant was still going; 65% went to 450 V. Run: python3 tools/ps_milgram.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

STEPS = 450 // 15          # 30 switches
html = '''<div id="splash-milg" aria-hidden="true">
    <div class="mg-m"><i></i></div>
    <div class="mg-s"><b>15 V</b><b>300 V<b>450 V</b></b></div>
    <div class="mg-t">"Please continue."</div>
    <div class="mg-c">all 40 reached 300 V; 65% went to 450 V</div>
  </div>'''
css = '''.mg-m{width:15rem;height:.9rem;border:2px solid #5c544a;border-radius:4px}
.mg-m i{display:block;height:100%%;background:#f0b45f;transform-origin:left;animation:mg-up 9s steps(%(k)d,jump-end) infinite}
@keyframes mg-up{0%%{transform:scaleX(%(a).4f)}85%%,100%%{transform:scaleX(1);background:#e06c5a}}
.mg-s{display:flex;width:15rem;margin-top:.3rem}
.mg-s b{flex:2;text-align:left}
.mg-s b+b{flex:1}
.mg-s b b{float:right}
.mg-s,.mg-c{font:.62rem var(--mono);color:#f0ece099;text-align:center}
.mg-t{margin:.7rem 0 .4rem;font:italic 600 .8rem var(--mono);color:var(--paper);text-align:center}
@media (prefers-reduced-motion: reduce) {
  .mg-m i{animation:none}
}''' % {'k': STEPS - 1, 'a': 1 / STEPS}
anim_row.write_anim('milg', html=html, css=css)
