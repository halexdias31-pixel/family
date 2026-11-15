# BINDING CLAIMS v2 - Z3 checks. Run: python3.13 check_v2.py
from z3 import *
C=['O_born_Mary','O_cruc_Pilate','O_suffered','O_buried','O_OT_detail',
   'S_4_157','S_Haman_w_Pharaoh','S_Mary_sister_Aaron']
x={c:Bool('Contra_'+c) for c in C}; inB={c:Bool('Bind_'+c) for c in C}
O=[c for c in C if c.startswith('O_')]; S=[c for c in C if c.startswith('S_')]
# Readings of 4:157 a Muslim might hold. Fields: (denies death on cross?, accepted inside Sunnism?)
R=dict(Orth=(True,True),      # substitution, raised alive (Tabari, Ibn Kathir, Razi, Qurtubi)
       Shaltut=(True,True),   # natural death later, NOT on the cross (Shaltut, al-Fatawa)
       Ayoub=(False,False),   # verse denies Jews' agency, not the death (Ayoub 1980; Shi'i, not Sunni)
       Ahmadi=(False,False))  # survived cross, died later (rejected by Sunni bodies)
Rd=Datatype('Reading')
for r in R: Rd.declare(r)
Rd=Rd.create(); rv={r:getattr(Rd,r) for r in R}
read=Const('read',Rd)
deniesCross=lambda t: Or([t==rv[r] for r in R if R[r][0]])
sunniOK=lambda t: Or([t==rv[r] for r in R if R[r][1]])
P=dict(P1=Bool('P1'),P2=Bool('P2'),P3a=Bool('P3a'),P3b=Bool('P3b'),
       P4=Bool('P4'),P5=Bool('P5'),P6=Bool('P6'),P7=Bool('P7'))
# P3a: the verse text is binding; P3b: the person remains Sunni (reading must be Sunni-accepted)
ax=[Implies(P['P4'],And([inB[c] for c in O[:4]])),
    Implies(P['P5'],And([Not(x[c]) for c in O[:4]])),
    Implies(P['P6'],Not(inB['O_OT_detail'])),Implies(Not(P['P6']),inB['O_OT_detail']),
    Implies(P['P7'],x['O_OT_detail']),
    Implies(P['P2'],And([inB[c] for c in S])),
    Implies(P['P3a'],inB['S_4_157']),
    Implies(P['P3b'],sunniOK(read)),
    # the bound content of 4:157 is as the reader reads it; it is contradicted iff it denies death on the cross
    Implies(And(P['P1'],deniesCross(read)),x['S_4_157']),
    Implies(Not(deniesCross(read)),Not(x['S_4_157'])),
    Not(x['S_Mary_sister_Aaron']),   # idiom reading; not contradicted
   ]
thesis=And(And([Implies(inB[c],Not(x[c])) for c in O]),Or([And(inB[c],x[c]) for c in S]))
prem=list(P.values())
def chk(n,f,exp):
    s=Solver(); s.add(f); r=str(s.check()); flag='' if r==exp else '   <-- SURPRISE'
    print(f'{n:62s}{r:6s}(expect {exp}){flag}'); return r==exp
ok=True
print('== validity ==')
ok&=chk('V0 premises -> thesis',And(ax+prem+[Not(thesis)]),'unsat')
print('== consistency ==')
ok&=chk('C1 premises consistent',And(ax+prem),'sat')
ok&=chk('C2 thesis satisfiable',And(ax+prem+[thesis]),'sat')
print('== necessity (sat = needed) ==')
need={'P1':'sat','P2':'unsat','P3a':'unsat','P3b':'sat','P4':'unsat','P5':'sat','P6':'sat','P7':'unsat'}
# P2 and P3a each alone bind 4:157, so each is individually redundant given the other
for k,v in P.items():
    ok&=chk(f'  without {k}',And(ax+[p for p in prem if not eq(p,v)]+[Not(thesis)]),need[k])
ok&=chk('  without P2 and P3a (4:157 unbound)',And(ax+[p for p in prem if not(eq(p,P['P2']) or eq(p,P['P3a']))]+[Not(thesis)]),'sat')
print('== per reading (P3b dropped; unsat = thesis holds for that reading) ==')
exp={'Orth':'unsat','Shaltut':'unsat','Ayoub':'sat','Ahmadi':'sat'}
for r in R:
    ok&=chk(f'  reading={r:8s} sunni={R[r][1]!s:5s}',And(ax+[p for p in prem if not eq(p,P['P3b'])]+[read==rv[r],Not(thesis)]),exp[r])
print('== P3b: any Sunni-accepted reading that escapes? (unsat = none) ==')
ok&=chk('  P3b and reading does not deny death-on-cross',And(ax+prem+[Not(deniesCross(read))]),'unsat')
print('== red team ==')
ok&=chk('(a) not P6, P7 -> thesis possible? (unsat = thesis fails)',And(ax+[p for p in prem if not eq(p,P['P6'])]+[Not(P['P6']),thesis]),'unsat')
print('ALL AS EXPECTED' if ok else 'SURPRISES PRESENT')
