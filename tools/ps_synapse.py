# Synaptic transmission (GCSE Psychology, Brain and neuropsychology): an impulse reaches the end of one neuron,
# neurotransmitter crosses the gap, and the receptors of the next take it up. Writes the `sasyn` row in the one
# animation format (16 Nov). Run: python3 tools/ps_synapse.py
import sys, pathlib; sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent)); import anim_row
from sa_draw import Svg

d = Svg(400, 170)
d.path('M20,60 H150 C175,60 185,70 185,90 C185,110 175,120 150,120 H20')        # the end of the first neuron
d.path('M380,60 H250 C228,60 215,72 215,90 C215,108 228,120 250,120 H380')     # the next one, across the gap
d.g('s1'); d.arrow(30, 90, 120, 90, 'pt hot mv-flow'); d.text(70, 50, 'impulse', 'hot', size=11); d.end()
d.g('s2')
for y in (76, 90, 104):
    d.g('mv-slide', style='--x:28px;--y:0px'); d.circle(176, y, 4, 'fill cool'); d.end()
d.text(200, 40, 'neurotransmitter', 'cool', size=11)
d.end()
d.g('s3')
for y in (74, 90, 106): d.path('M216,%g h6' % y, 'pt cool', 'stroke-width:3')
d.text(300, 50, 'receptor', 'cool', size=11)
d.end()
d.g('s4'); d.arrow(280, 90, 370, 90, 'pt hot mv-flow'); d.end()
d.g('s5'); d.text(200, 156, 'impulse, neurotransmitter, receptor'); d.end()
anim_row.write_sa('syn', d.svg('An impulse releases neurotransmitter across the gap to the receptors of the next neuron'))
