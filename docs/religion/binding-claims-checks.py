# BINDING CLAIMS v3 - Z3 checks. Run: python3.13 binding-claims-checks.py
# Part A = v2 (binding sets, readings of 4:157). Part B = v3 (4:157 swap, neutral ground, exits).
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

# ===================== PART B (v3) =====================
B=lambda n: Bool(n)
Sunni,Neutral,SP,Circ,Faith=B('Sunni'),B('Neutral'),B('SP'),B('Circ'),B('Faith')
Seen,Rec,AccRec,Kil=B('Seen'),B('Rec'),B('AccRec'),B('Kil')       # Kil: Jesus killed on the cross
Bind,Swap,Undet,SrcQ=B('BindNotKil'),B('Swap'),B('Undetect_Swap'),B('SrcSwap_QuranOnly')
ContraS,Even,P6b=B('ContraS'),B('EvenReason'),B('P6')
Res,RecNotRes=B('Res'),B('RecNotRes')
BeyRes,AgRes,AgSwap=B('Beyond_Res'),B('Against_Res'),B('Against_Swap')
OAg=B('O_binding_needs_Against')                                  # any Orthodox binding claim needs an override
E1,E2,E3,E4,E5=[B('E%d'%i) for i in range(1,6)]
axB=[Implies(Seen,Rec),                                  # witnesses saw it -> recorded (Tacitus, Josephus, Paul, Gospels)
     Implies(And(AccRec,Rec,Not(Swap)),Kil),             # accepting the record = Kil, unless overridden:
     Implies(Swap,Not(Kil)) ,                            # ...the swap is exactly that override
     Implies(Sunni,Bind),                                # P2/P3a: Sunni binds ~Kil (4:157)
     ContraS==And(Bind,AccRec,Rec,Not(Swap)),            # binding claim contradicted by accepted record unless swap
     Implies(Swap,And(Undet,SrcQ)),                      # 4:157 shubbiha lahum: undetectable, Qur'an-only source
     AgSwap==Swap,                                       # swap cancels a recorded fact -> Against
     Implies(And(AgSwap,Undet),Faith),                   # undetectable override of record = faith over evidence
     Implies(And(Neutral,SrcQ,Swap),Circ),               # NEUTRAL GROUND: reason presupposing authority = Circ
     Implies(And(Not(AccRec),Not(Even)),SP),             # denying record w/o even-handed reason = special pleading
     Not(Even),                                          # P8: no even reason (crucifixion meets M's own historical standard)
     Not(RecNotRes), AgRes==RecNotRes, BeyRes==Not(RecNotRes),  # Res goes beyond the record, not against it
     Not(OAg),                                           # P5: Orthodox binding claims (cruc., died, buried) fit record
     Implies(E5,Not(P6b)), P6b,                          # E5 = Dositheus inference; P6 sourced (v2 O1)
     E1==And(Sunni,ContraS), E2==Swap, E3==Not(Sunni), E4==Not(AccRec),
     Seen]
print('== PART B (v3): 4:157 swap / neutral ground / exits ==')
ok&=chk('B-C1 v3 axioms consistent',And(axB),'sat')
ok&=chk('B-C2 v3 axioms + Sunni + Neutral consistent',And(axB+[Sunni,Neutral]),'sat')
# 1. Sunni claim consistent with record only if Swap
ok&=chk('B1 Sunni & AccRec & ~Swap -> ContraS',And(axB+[Sunni,AccRec,Not(Swap),Not(ContraS)]),'unsat')
ok&=chk('B1n  non-vacuous',And(axB+[Sunni,AccRec,Not(Swap)]),'sat')
ok&=chk('B2 Neutral & Swap -> Circ & Faith',And(axB+[Neutral,Swap,Not(And(Circ,Faith))]),'unsat')
ok&=chk('B2n  non-vacuous',And(axB+[Neutral,Swap]),'sat')
# unfalsifiable: any claim q, any record r with r -> ~q, survives an undetectable override
q,r,ov=Bools('q r ov')
ok&=chk('B3 override rescues ANY q against record (sat)',And(r,q,Implies(And(r,Not(ov)),Not(q)),ov),'sat')
ok&=chk('B3b without override q is refuted (unsat)',And(r,q,Implies(And(r,Not(ov)),Not(q)),Not(ov)),'unsat')
# asymmetry
ok&=chk('B4 Res is Beyond, not Against',And(axB+[Not(And(BeyRes,Not(AgRes)))]),'unsat')
ok&=chk('B4b Orthodox + Res on neutral ground, no Circ/Faith: possible',And(axB+[Neutral,Res,Not(Circ),Not(Faith),Not(OAg)]),'sat')
# 3. exits exhaustive
X=Or(E1,E2,E3,E4,E5)
ok&=chk('B5 Sunni M avoiding ContraS must take an exit (E2-E5)',And(axB+[Not(E1),Not(Or(E2,E3,E4,E5))]),'unsat')
ok&=chk('B5b exits exhaustive: E1|..|E5',And(axB+[Not(X)]),'unsat')
ok&=chk('B6 Sunni & Neutral & ~SP & ~Circ |- E1',And(axB+[Sunni,Neutral,Not(SP),Not(Circ),Not(E1)]),'unsat')
ok&=chk('B6n  non-vacuous (antecedent sat)',And(axB+[Sunni,Neutral,Not(SP),Not(Circ)]),'sat')
ok&=chk('B7 E2 & Neutral -> Circ',And(axB+[E2,Neutral,Not(Circ)]),'unsat')
ok&=chk('B8 E4 -> SP',And(axB+[E4,Not(SP)]),'unsat')
ok&=chk('B9 E3 -> ~Sunni',And(axB+[E3,Sunni]),'unsat')
ok&=chk('B10 E5 impossible given P6',And(axB+[E5]),'unsat')
for n,e in [('E1',E1),('E2',E2),('E3',E3),('E4',E4)]:
    ok&=chk(f'  {n} non-vacuous (reachable)',And(axB+[e]),'sat')
print('== red team (v3) ==')
ok&=chk('(b) drop Neutral: Sunni & ~SP & ~E1 possible (via Swap)',And(axB+[Sunni,Not(SP),Not(E1)]),'sat')
ok&=chk('(c) drop P8 (Even allowed): E4 without SP possible',And([a for a in axB if not eq(a,Not(Even))]+[E4,Not(SP)]),'sat')
print('ALL AS EXPECTED' if ok else 'SURPRISES PRESENT')
