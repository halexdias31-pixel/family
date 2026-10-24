# Asch's line study (GCSE Psychology, Social influence): the standard line and A, B, C; C matches. The group answers
# aloud in turn, all "A", the real participant (blue) sixth of seven, as in Asch's groups. Writes the `asch` row.
# The answers are one row revealed a seat at a time (steps), so they stay up together until the trial ends. Run: python3 tools/ps_asch.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

N = 7       # seats
REAL = 6    # the real participant's seat, counted from 1
html = '''<div id="splash-asch" aria-hidden="true">
    <div class="ah-l"><i></i><b>A</b><b>B</b><b>C</b></div>
    <div class="ah-a">%s</div>
    <div class="ah-p">%s</div>
  </div>''' % ('<b>A</b>' * N, '<u></u>' * N)
css = '''.ah-l{display:flex;align-items:flex-end;justify-content:center;gap:1.3rem;height:4.4rem}
.ah-l i,.ah-l b{width:3px;background:var(--paper)}
.ah-l i{height:3rem;margin-right:1.2rem}
.ah-l b{height:2rem;font:700 .7rem var(--mono);color:#6fa8dc;text-indent:.4rem}
.ah-l b+b{height:4.2rem}
.ah-l b+b+b{height:3rem}
.ah-a,.ah-p{display:flex;justify-content:center;gap:.5rem}
.ah-a{margin:1.1rem 0 .2rem;font:700 .72rem var(--mono);color:#f0b45f;animation:ah-say 7s steps({N},jump-end) infinite}
@keyframes ah-say{0%,93%,100%{clip-path:inset(0 100% 0 0)}70%,92%{clip-path:inset(0)}}
.ah-a b,.ah-p u{width:1.1rem;text-align:center}
.ah-p u{height:1.1rem;border-radius:50%;background:#5c544a}
.ah-a b:nth-child({R}){color:#6fa8dc}
.ah-p u:nth-child({R}){background:#6fa8dc}
@media (prefers-reduced-motion: reduce) {
  .ah-a{animation:none}
}'''.replace('{N}', str(N)).replace('{R}', str(REAL))
anim_row.write_anim('asch', html=html, css=css)
