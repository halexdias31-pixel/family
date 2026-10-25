# Synaptic transmission (GCSE Psychology, Brain and neuropsychology): an impulse lights the end of one neuron, three
# neurotransmitter packets cross the gap, and the receptor side of the next lights. Writes the `syn` row. Run: python3 tools/ps_synapse.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row

GAP = 3.0   # rem between the two neurons
dots = ''.join('<i style="--i:%d"></i>' % k for k in range(3))
html = '''<div id="splash-syn" aria-hidden="true">
    <div class="sy-r"><b></b>%s<s></s></div>
    <div class="sy-s">impulse, neurotransmitter, receptor</div>
  </div>''' % dots
css = '''.sy-r{position:relative;width:%(w)grem;height:3.6rem}
.sy-r b,.sy-r s{position:absolute;top:0;bottom:0;width:5rem;background:#2b3a4f;border:2px solid #6fa8dc;animation:sy-lit 4s infinite}
.sy-r b{left:0;border-radius:0 50%% 50%% 0}
.sy-r s{right:0;border-radius:50%% 0 0 50%%;animation-delay:1.6s}
.sy-r i{position:absolute;left:4.6rem;top:calc(.7rem + var(--i)*.9rem);padding:.225rem;border-radius:50%%;background:#f0b45f;animation:sy-go 4s calc(var(--i)*.15s) infinite}
@keyframes sy-lit{40%%{background:#2b3a4f}10%%,25%%{background:#6fa8dc}}
@keyframes sy-go{0%%,18%%{opacity:0}22%%{opacity:1;transform:none}50%%{opacity:1;transform:translateX(%(g)grem)}58%%,100%%{opacity:0;transform:translateX(%(g)grem)}}
.sy-s{margin-top:.8rem;font:.72rem var(--mono);color:#f0ece08c;text-align:center}
@media (prefers-reduced-motion: reduce) {
  .sy-r b,.sy-r s,.sy-r i{animation:none;opacity:1}
}''' % {'w': 10 + GAP, 'g': GAP + .1}
anim_row.write_anim('syn', html=html, css=css)
