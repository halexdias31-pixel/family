# BINDING CLAIMS v1 - Z3 checks. Run: python3.13 check.py
from z3 import *
# Claims (historical content only; miracles excluded for both sides)
C=['O_born_Mary','O_cruc_Pilate','O_suffered','O_buried',          # Creed
   'O_OT_detail',                                                    # e.g. Exodus as narrated, only binding IF detail-inerrancy binds
   'S_4_157_no_death_by_cruc','S_Haman_w_Pharaoh','S_Mary_sister_Aaron']
x={c:Bool('Contra_'+c) for c in C}          # Contradicted(c)
inB={c:Bool('Bind_'+c) for c in C}          # c in binding set
P=dict(
 P1_hist_cruc   = Bool('P1'),  # academic consensus: Jesus died by crucifixion under Pilate
 P2_all_verses  = Bool('P2'),  # Sunni consensus: denying any verse = kufr  -> every verse binding
 P3_denial_read = Bool('P3'),  # binding/mainstream reading of 4:157: Jesus did not die on the cross
 P4_creed_items = Bool('P4'),  # Creed items are binding for Orthodox
 P5_creed_ok    = Bool('P5'),  # history affirms/doesn't contradict born/crucified/suffered/buried
 P6_no_detail_inerrancy = Bool('P6'), # no ecumenical/dogmatic Orthodox definition binds every historical detail
 P7_OT_contra   = Bool('P7'),  # academic history contradicts some OT detail (e.g. Exodus as narrated)
)
O=[c for c in C if c.startswith('O_')]; S=[c for c in C if c.startswith('S_')]
ax=[
 Implies(P['P4_creed_items'],And([inB[c] for c in O[:4]])),
 Implies(P['P5_creed_ok'],And([Not(x[c]) for c in O[:4]])),
 Implies(P['P6_no_detail_inerrancy'],Not(inB['O_OT_detail'])),
 Implies(Not(P['P6_no_detail_inerrancy']),inB['O_OT_detail']),
 Implies(P['P7_OT_contra'],x['O_OT_detail']),
 Implies(P['P2_all_verses'],And([inB[c] for c in S])),
 Implies(And(P['P1_hist_cruc'],P['P3_denial_read']),x['S_4_157_no_death_by_cruc']),
]
thesis=And(And([Implies(inB[c],Not(x[c])) for c in O]), Or([And(inB[c],x[c]) for c in S]))
prem=list(P.values())
def chk(name,f):
    s=Solver(); s.add(f); r=s.check(); print(f'{name:55s}{r}'); return r
print('== validity (unsat = thesis follows) ==')
chk('V0 all premises -> thesis',And(ax+prem+[Not(thesis)]))
print('== consistency / non-vacuity (sat expected) ==')
chk('C1 axioms+premises consistent',And(ax+prem))
chk('C2 thesis jointly satisfiable',And(ax+prem+[thesis]))
print('== necessity: drop each premise (sat = premise needed) ==')
for k,v in P.items():
    rest=[p for p in prem if not eq(p,v)]
    chk(f'  without {k}',And(ax+rest+[Not(thesis)]))
print('== red-team scenarios ==')
# (a)/(g): detail-inerrancy binding -> Orthodox side also hit; Sunni side also hit (symmetric tu quoque)
chk('(a) not P6, P7 -> thesis fails? (unsat=fails)',And(ax+[p for p in prem if not eq(p,P['P6_no_detail_inerrancy'])]+[Not(P['P6_no_detail_inerrancy']),thesis]))
# (f): non-death reading of 4:157 (Ahmadi / swoon-free metaphorical) -> Sunni conjunct needs P3
chk('(f) not P3 -> Sunni conjunct still forced? (sat=not forced)',And(ax+[p for p in prem if not eq(p,P['P3_denial_read'])]+[Not(P['P3_denial_read'])]+[And([Not(x[c]) for c in S])]))
# honest marking of other Sunni items (not needed for thesis)
print('Other Sunni items: Haman_w_Pharaoh=DISPUTED (anachronism charge vs Egyptian hmn claim); Mary_sister_Aaron=NOT CONTRADICTED (idiom reading, Sahih Muslim 2135)')
