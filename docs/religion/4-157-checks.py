# unified.py — 4:157 v13: one model, all checks.  python3.13 unified.py
from z3 import *
import z3, itertools
V={}
def b(n):
    if n not in V: V[n]=Bool(n)
    return V[n]
def S_(*n): return [b(x) for x in n]
F=[]; J={}
def j(name,f): J[name]=f

# ================= FORK (readings) — BelQ is now DEFINED, ¬Kil derived (R1)
I,S,Cruc,Kil,Orth,Ahm,Rev,NoR=S_('I','S','Cruc','Kil','Orth','Ahm','Rev','NoR')
F+=[PbEq([(r,1) for r in [Orth,Ahm,Rev,NoR]],1), Implies(Kil,Cruc),
    Implies(And(I,Orth),Not(Cruc)), Implies(And(I,Ahm),And(Cruc,Not(Kil))), Implies(S,Not(Kil))]
BelQ=b('BelQ'); F.append(BelQ==And(I,Or(Orth,Ahm,S)))       # holds 4:157 in a death-denying sense
Concede=And(Cruc,Kil)

# ================= SOURCES & DENIALS (facts block; R5 dependence, R8 'adala)
src=['Paul','Jos','Tac','Talm']; nonC=['Jos','Tac','Talm']
gap={'Paul':20,'Jos':60,'Tac':85,'Talm':200,'Hadith':210}
t=Real('t'); F.append(t>0)
Ev,HadithOK,SP,DenyS,KeepOther,Emb=S_('Ev','HadithOK','SpecialPleading','DenyS','KeepOtherSahih','Emb')
AdalaCirc=b('AdalaCirc')
D={x:b('Deny_'+x) for x in src}; Dep={x:b('Dep_'+x) for x in nonC}
reasons=['Late','Hearsay','Partisan','Interpolated','Adala','Theol']  # R15 Theol: 'theology not history'
R={(r,x):b(f'{r}_{x}') for r in reasons for x in src}
for x in src:
    F.append(Implies(D[x],Or(*[R[(r,x)] for r in reasons])))
    F.append(R[('Late',x)]==(gap[x]>t))
    if x!='Paul': F.append(Not(R[('Partisan',x)]))
    if x!='Jos':  F.append(Not(R[('Interpolated',x)]))
    if x in ('Jos','Tac'): F.append(Not(R[('Theol',x)]))   # R15: neither writes as a believer
    for r in ['Late','Hearsay','Partisan','Interpolated','Theol']:   # Theol hits the eschatological return hadith too
        hits=(gap['Hadith']>t) if r=='Late' else BoolVal(True)
        F.append(Implies(And(R[(r,x)],Ev,hits),Not(HadithOK)))
    F.append(Implies(R[('Adala',x)],AdalaCirc))            # "narrator must be Muslim" presupposes Islam
Cnt={x:Not(D[x]) for x in src}
indep=[And(Cnt[x],Not(Dep[x])) for x in nonC]
HistCK=b('HistCK')
F+=[Implies(Or(PbGe([(c,1) for c in indep+[Cnt['Paul']]],2), And(Cnt['Paul'],Emb)),HistCK),
    Implies(Not(HadithOK),Not(S)), Implies(Not(Ev),SP), Implies(And(DenyS,KeepOther),SP),
    Implies(DenyS,Not(S))]
j('Emb (crucified messiah a scandal: 1 Cor 1:23, Deut 21:23)',Emb)
SelfDefeat=Not(HadithOK)

# ================= MASTER
Faith,Out_any,CumAll,New,Circ=S_('Faith','Out_any','CumAll','New','Circ')
F.append(Implies(AdalaCirc,Circ)); F.append(Implies(Circ,Faith))
outs=['I','P','S','Pr','C','M','E','K']
esc=['Taw','Barn','Poss','Fall','NatMis','Burden','Ijma','Swoon','TestArb','Muh','IslM','AllUnc','Jos420']  # R14–16
O={x:b('Out_'+x) for x in outs+esc}
F+=[Out_any==Or(*O.values(),CumAll,New), Implies(BelQ,Or(Out_any,Faith))]
# substitution (4:157 "made to appear"), miracles ADMITTED (no methodological naturalism, R4)
Sub,SubFits,PriorSub,SubWins,MN=S_('Sub','SubFits','PriorSub','SubWins','MN')
F+=[Implies(Sub,SubFits),Implies(And(SubFits,Not(PriorSub)),Not(SubWins)),
    Implies(PriorSub,Circ),Implies(SubWins,Out_any)]
j('¬PriorSub (no independent prior for a swap)',Not(PriorSub))
j('¬MN (miracles not excluded)',Not(MN))
# B1
Op,Bel,Neut,NeutYes,Uniq,PTMI=S_('Op_I','Bel_I','Neut_I','NeutYes_I','Uniq_I','PTM_I')
F+=[Implies(O['I'],Or(Op,And(Uniq,Not(PTMI)))),Implies(Op,Or(Bel,Neut)),Implies(Bel,Not(Op)),
    Implies(Neut,NeutYes),Implies(Uniq,PTMI)]
j('¬NeutYes_I',Not(NeutYes))
# B2
ps=['Rum','Lahab','Badr','Hud','Phar','Const']; crit=['Spec','Pre','Imp','NSF','Una']
P={(c,p):b(c+'_'+p) for c in crit for p in ps}; Sp={p:b('S_'+p) for p in ps}
Strong,CumBigP=S_('Strong','CumBig_P')
F+=[Sp[p]==And(*[P[(c,p)] for c in crit]) for p in ps]+[Strong==Or(*Sp.values()),Implies(O['P'],Or(Strong,CumBigP))]
for c,p in [('Una','Rum'),('Imp','Rum'),('Imp','Lahab'),('Spec','Badr'),('NSF','Hud'),('Spec','Phar'),('Imp','Phar'),('Pre','Const'),('NSF','Const')]:
    j(f'¬{c}({p})',Not(P[(c,p)]))
j('¬CumBig_P',Not(CumBigP))
# B3
cs=['Emb','Exp','Bang','Sea','Mtn','Iron','Fing']
C3={(k,c):b(k+'_'+c) for k in ['CR','NK','Acc'] for c in cs}; H={c:b('H_'+c) for c in cs}; NetPos=b('NetPos')
F+=[H[c]==And(C3[('CR',c)],C3[('NK',c)],C3[('Acc',c)]) for c in cs]+[Implies(NetPos,Or(*H.values())),Implies(O['S'],NetPos)]
for k,c in [('NK','Emb'),('Acc','Emb'),('CR','Exp'),('CR','Bang'),('NK','Bang'),('NK','Sea'),('Acc','Mtn'),('CR','Iron'),('CR','Fing')]:
    j(f'¬{k}({c})',Not(C3[(k,c)]))
# B4
Fact,Strict,Loose,Var,Lost,Uth,ImpPr,TestPr,PTMPr=S_('Fact','Strict','Loose','Var','Lost','Uth','Imp_Pr','Test_Pr','PTM_Pr')
F+=[Implies(O['Pr'],Or(And(Strict,ImpPr),And(Loose,TestPr),And(Fact,Not(PTMPr)))),Implies(Fact,PTMPr),
    Implies(Or(Var,Lost),Not(Strict)),Implies(Loose,Not(TestPr)),Implies(Uth,Not(ImpPr))]
j('Var',Var); j('Lost',Lost); j('Uth',Uth)
# B5
Char,SinMist,QAC,Ummi,Illit,Gent,Apoc,Oral,ImpC=S_('Char','SinMist','QA_C','Ummi','Illit','Gent','Apoc','Oral','Imp_C')
F+=[Implies(O['C'],Or(And(Char,Not(SinMist),Not(QAC)),And(Ummi,ImpC))),Implies(And(Char,Not(SinMist)),QAC),
    Implies(QAC,Faith),Implies(Ummi,Or(Illit,Gent)),Implies(Gent,Not(ImpC)),Implies(And(Illit,Apoc,Oral),Not(ImpC))]
j('Apoc',Apoc); j('Oral',Oral)
# B6 (+ R6: swoon argued from the Gospels is a historical route)
HStd,CrS,AccK=S_('HStd','CrS','AccK')
F+=[Implies(Or(O['M'],O['Swoon']),And(HStd,Ev)),Implies(And(HStd,Ev,CrS),AccK),Implies(AccK,Kil)]
j('CrS',CrS)
# B7
Exp,Shar,Rel,Conf,Fitra,Dec=S_('Exp','Shar','Rel','Conf','Fitra','Dec')
F+=[Implies(O['E'],Or(And(Exp,Shar,Rel),And(Fitra,Dec))),Implies(Exp,Not(Shar)),Implies(And(Conf,Ev),Not(Rel))]
j('Conf',Conf); j('¬Dec',Not(Dec))
# B8
Cons,HumCons,ImpK,Spr,Pop=S_('Cons','HumCons','Imp_K','Spr','Pop')
F+=[Implies(O['K'],Or(And(Cons,ImpK),And(Spr,Not(Pop)))),Implies(And(Cons,HumCons),Not(ImpK)),Implies(Spr,Pop)]
j('HumCons',HumCons)
# ESCAPES as candidate reasons (R2): each has its own close, tested for non-vacuity
EventSupp,BarnEarly,PossRaises,FallEven,IjmaIndep,RejRivals=S_('EventSupp','Barn_Early','PossRaises','FallEven','IjmaIndep','RejRivals')
F+=[Implies(O['Taw'],EventSupp),            # mass transmission only helps if it reaches AD 30
    Implies(O['Barn'],BarnEarly),
    Implies(O['Poss'],PossRaises),           # "God could" must raise probability to outweigh
    Implies(O['Fall'],FallEven),             # "history fallible" must make it ~50/50
    Implies(Or(O['NatMis'],O['Burden']),PriorSub),  # look-alike / shift burden still need a prior for the swap
    Implies(O['Ijma'],IjmaIndep),
    Implies(O['TestArb'],Not(RejRivals))]    # (R3) no standard → no ground to reject NT/rivals on the cross
j('¬EventSupp (Taw reaches 7th c., not AD 30)',Not(EventSupp))
j('¬Barn_Early (Barnabas 14th–16th c.)',Not(BarnEarly))
j('¬PossRaises',Not(PossRaises)); j('¬FallEven',Not(FallEven))
j('¬IjmaIndep (ijmāʿ rests on the Qur\'an)',Not(IjmaIndep))
NOMA,NoProb,PopCons,TestArb=S_('NOMA','NoProb','PopCons','TestArb')
F+=[Implies(NOMA,Faith),Implies(NoProb,Faith)]
# R3: rejecting the test but still rejecting rival accounts of the cross: preference rests on the Qur'an
F+=[Implies(And(BelQ,Not(Kil)),RejRivals),Implies(And(TestArb,RejRivals),Or(Circ,SP))]
# outcome
UserH,Against,MoreR=S_('UserH','Against','MoreR')
F+=[Against==And(HistCK,Not(Concede)),                      # R1: against history needs history
    Implies(And(UserH,Against,Not(Out_any),Ev),MoreR)]       # R1: MoreR needs ¬Out_any
# R14 muhaymin 5:48: the Qur'an's right to correct earlier books is itself a Qur'anic claim
MuhIndep,SurvHigh=S_('MuhIndep','SurvHigh')
F+=[Implies(O['Muh'],MuhIndep), Implies(O['IslM'],EventSupp),   # R16 isnad method: superior or not, no chain reaches AD 30
    Implies(O['AllUnc'],FallEven),                                 # R16 "all history uncertain" = Fall
    Implies(O['Jos420'],SurvHigh)]                                 # R15 Josephus Life 420-1: 1 of 3 survived WITH care
j('¬MuhIndep (correction authority rests on the Qur\'an)',Not(MuhIndep))
j('¬SurvHigh (Life 420–421: 2 of 3 died despite treatment)',Not(SurvHigh))
# R12 schema: an independent reason must be testable; if shared with rival scriptures it falls under the parity bound (CumAll)
NewTU=b('NewTestUnshared'); F.append(Implies(New,NewTU))
j('¬CumAll',Not(CumAll)); j('UserH',UserH); j('¬NewTestUnshared (no testable reason unique to the Qur\'an named)',Not(NewTU))

def solve(extra):
    s=Solver(); s.add(F+extra); return s.check()
def valid(prem,goal): return solve(list(prem)+[Not(goal)])==unsat
Jv=list(J.values())
ok=lambda x:'valid' if x else 'NOT VALID'
print('='*20,'MASTER')
print('derived  BelQ ⊢ ¬Kil:',ok(valid([],Implies(BelQ,Not(Kil)))))
G=And(Faith,Or(MoreR,SelfDefeat,SP,Circ))
print('BelQ ∧ Ev ⊢ Faith ∧ (MoreR ∨ SelfDefeat ∨ SP ∨ Circ):',ok(valid(Jv+[BelQ,Ev],G)))
print('BelQ ∧ Ev ∧ no denials ⊢ Faith ∧ MoreR:',ok(valid(Jv+[BelQ,Ev]+[Not(d) for d in D.values()],And(Faith,MoreR))))
print('  … even conceding Dep_x for all three non-Christian sources:',ok(valid(Jv+[BelQ,Ev]+list(Dep.values())+[Not(d) for d in D.values()],And(Faith,MoreR))))
print('consistent holding 4:157:',solve(Jv+[BelQ,Ev])==sat,'· dropping it:',solve(Jv+[Not(BelQ),Not(I),Concede,Ev])==sat)
base=Jv+[BelQ,Ev]+[Not(d) for d in D.values()]
alone=[n for n in J if not valid([v for k,v in J.items() if k!=n]+[BelQ,Ev]+[Not(d) for d in D.values()],And(Faith,MoreR))]
print('carry alone:',alone)
print('redundant (backed by others) or idle:',[n for n in J if n not in alone])

print('='*20,'FORK (no J restriction on choices; Ev a choice)')
costs={'AgainstHistory':Against,'¬I':Not(I),'Heterodox(Ahm/Rev)':Or(Ahm,Rev),'NoR':NoR,
       '¬S':Not(S),'SpecialPleading':SP,'SelfDefeat(¬HadithOK)':SelfDefeat,'Circ':Circ}
names=list(costs)
print('cost-free position (not conceding):',solve(Jv+[Not(c) for c in costs.values()]+[Not(Concede)])==sat)
print('cost-free position at all:',solve(Jv+[Not(c) for c in costs.values()])==sat)
mcs=[]
for k in range(1,len(names)+1):
    for sub in itertools.combinations(names,k):
        if any(set(m)<=set(sub) for m in mcs): continue
        if solve(Jv+[Not(costs[n]) for n in names if n not in sub])==sat: mcs.append(sub)
print('minimal ways out:'); [print('   ',' + '.join(m),'| still denies the death:', solve(Jv+[Not(costs[n]) for n in names if n not in m]+[Not(Concede)])==sat) for m in mcs]

print('='*20,'TRAPS')
print('T1 I∧Cruc∧¬Rev∧¬NoR ⊢ Ahm ∧ (Against∨¬Kil):',ok(valid(Jv,Implies(And(I,Cruc,Not(Rev),Not(NoR)),And(Ahm,Not(Kil))))))
print('T2 I∧S∧Ev, no denials ⊢ Against ∧ Faith:',ok(valid(Jv+[I,S,Ev]+[Not(d) for d in D.values()],And(Against,Faith))))
for pair in itertools.combinations(src,2):
    pass
t4=all(valid(Jv+[I,S,Ev]+[D[x] if x in pr else Not(D[x]) for x in src]+[Not(SP)] ,Or(Against,SelfDefeat,Circ)) for k in (1,2,3,4) for pr in itertools.combinations(src,k))
print('T4 denying ANY set of sources, even-handed ⊢ Against ∨ SelfDefeat ∨ Circ:',ok(t4))
t4b=all(valid(Jv+[I,S,Ev]+[D[x] if x in pr else Not(D[x]) for x in src]+list(Dep.values()),Against) for pr in itertools.combinations(nonC,2))
print('T4b HistCK survives losing any 2 non-Christian sources, all 3 conceded dependent:',ok(t4b))
pB,pK=Reals('pB pK'); s=Solver(); s.add(pB<=1-pK,pK>Q(1,2),pB>=Q(1,2)); print('T5 P(BelQ)≤1−P(Kil); P(Kil)>½ ⊢ P(BelQ)<½:',ok(s.check()==unsat))
pR=Real('pR'); s=Solver(); s.add(pR<=1,pR>=0); print('T5b (Rev reading: I does not entail ¬Kil, no cap) sat:',s.check()==sat)

print('='*20,'ESCAPES (each: goal holds; dropping its own close breaks it = non-vacuous)')
closes={'Muh':'¬MuhIndep (correction authority rests on the Qur\'an)','IslM':'¬EventSupp (Taw reaches 7th c., not AD 30)',
 'AllUnc':'¬FallEven','Jos420':'¬SurvHigh (Life 420–421: 2 of 3 died despite treatment)','Taw':'¬EventSupp (Taw reaches 7th c., not AD 30)','Barn':'¬Barn_Early (Barnabas 14th–16th c.)','Poss':'¬PossRaises',
 'Fall':'¬FallEven','NatMis':'¬PriorSub (no independent prior for a swap)','Burden':'¬PriorSub (no independent prior for a swap)',
 'Ijma':'¬IjmaIndep (ijmāʿ rests on the Qur\'an)','Swoon':'CrS'}
for e,c in closes.items():
    g=valid(base,And(Faith,MoreR))
    if c: nv=not valid([v for k,v in J.items() if k!=c]+[BelQ,Ev]+[Not(d) for d in D.values()]+[O[e],*[Not(O[x]) for x in O if x!=e]],And(Faith,MoreR))
    else: nv=not valid([BelQ,Ev,O[e]],And(Faith,MoreR))
    print(f'  {e:8} closed:',g,'| non-vacuous:',nv)
print('  TestArb ⊢ Circ ∨ SP:',ok(valid(Jv+[BelQ,TestArb],Or(Circ,SP))))
print('  NOMA ⊢ Faith; NoProb ⊢ Faith:',ok(valid([NOMA],Faith) and valid([NoProb],Faith)))
print('  PopCons idle (HistCK from sources):',ok(valid(base+[PopCons],And(Faith,MoreR))))
print('  MN dropped: goal under ¬MN:',ok(valid(base,And(Faith,MoreR))),'| rests on ¬PriorSub when Sub claimed:',
      not valid([v for k,v in J.items() if not k.startswith('¬PriorSub')]+[BelQ,Ev,Sub,O['NatMis']]+[Not(d) for d in D.values()],And(Faith,MoreR)))

print('='*20,'FACTS')
n3=PbGe([(D[x],1) for x in src],3)
print('F1 deny 3 ∧ Ev ∧ HadithOK ∧ ¬AdalaCirc ⊢ ⊥:',ok(solve(Jv+[n3,Ev,HadithOK,Not(AdalaCirc)])==unsat))
print('F2 deny 3 ∧ HadithOK ⊢ SP ∨ Circ:',ok(valid(Jv+[n3,HadithOK],Or(SP,Circ))))
print('F3 deny 3 ∧ Ev ∧ ¬AdalaCirc ⊢ ¬HadithOK ∧ ¬S:',ok(valid(Jv+[n3,Ev,Not(AdalaCirc)],And(SelfDefeat,Not(S)))))
print('F4 Late_Paul ∧ Ev ∧ HadithOK ⊢ ⊥:',ok(solve(Jv+[R[('Late','Paul')],Ev,HadithOK])==unsat))
print('F5 deny Paul (Dep conceded) ∧ Ev ⊢ SelfDefeat ∨ Circ:',ok(valid(Jv+[D['Paul'],Ev]+list(Dep.values()),Or(SelfDefeat,Circ))))
print('F6 DenyS ∧ KeepOther ⊢ SP:',ok(valid([DenyS,KeepOther],SP)))
print('F7 Adala reason ⊢ Circ:',ok(valid([R[('Adala','Paul')]],Circ)))
print('F8 Myth (Jesus never lived) ⊢ ¬I:',ok(valid([Implies(b('Myth'),Not(I)),b('Myth')],Not(I))))

print('='*20,'ROUNDS 11–16')
import math
# R11 parity bound on the cumulative case. LR_x = P(x|I)/P(x|¬I) <= 1/f_x, f_x = share of rival (mutually
# contradicting) revelation claims that show a reason of the same kind. Ev: equal prior over n claimants -> odds(I) <= 1/n.
# CumAll needs posterior odds(I) > 1 (T5: below that BelQ < 1/2). Independence assumed (favours M).
def cum(f,n):
    l={x:Real('lr_'+x) for x in f}; s=Solver()
    s.add([l[x]<=-math.log(f[x]) for x in f]+[l[x]>=0 for x in f]); s.add(Sum(*l.values())-math.log(n)>0)
    return s.check()==unsat     # True: CumAll impossible
fA={'I':0.2,'P':0.8,'S':0.8,'Pr':0.5,'C':0.8,'M':0.9,'E':0.9,'K':0.7}   # illustrative judgement (weak forms left after B1–B8)
nstar=math.prod(1/v for v in fA.values())
print(f'R11 parity: CumAll impossible iff prod(1/f_x) <= n ; with set A prod = {nstar:.0f}')
print('   n=50 closes:',cum(fA,50),'| n=20 closes:',cum(fA,20),'| f_I=0.01,n=50 closes:',cum({**fA,'I':0.01},50),' (non-tautological: numbers decide)')
print('   no parity bound (lr free) closes:',(lambda: (lambda s:(s.add(Real('z')>math.log(50)),s.check())[1])(Solver())==unsat)())
print('R12 New ⊢ NewTestUnshared (schema), goal rests on ¬NewTestUnshared:',
      ok(valid([Implies(New,NewTU),New],NewTU)), not valid([v for k,v in J.items() if not k.startswith('¬NewTest')]+[BelQ,Ev,New]+[Not(d) for d in D.values()],And(Faith,MoreR)))
q=Jv+[I,Orth,Not(S),Ev,Not(SP)]+[Not(d) for d in D.values()]
print('R13 Quranist (I∧Orth∧¬S) ⊢ Faith ∧ MoreR:',ok(valid(q,And(Faith,MoreR))),'| any ¬S position, no SP/Circ: Against ∨ Concede:',
      ok(valid(Jv+[Not(S),Ev,Not(SP),Not(Circ)]+[Not(d) for d in D.values()],Or(Against,Concede))))
print('R15 Theol_Paul ∧ Ev ⊢ ¬HadithOK:',ok(valid(Jv+[R[('Theol','Paul')],Ev],SelfDefeat)),
      '| deny Paul as theology, all Dep_x, Ev, HadithOK ⊢ Circ∨SP:',ok(valid(Jv+[D['Paul'],Ev,HadithOK]+list(Dep.values()),Or(Circ,SP))))

print('='*20,'v12 (fact-check + R17–19)')
# R17 sourced f_x (set G): counts over 15 major extant revelation-founded traditions (see facts.md):
# I: explicit inimitability challenge also in Babi (Bayan), Baha'i, LDS (D&C 67:6-7) -> 4/15
# C: "unlettered/uneducated recipient" also claimed for Joseph Smith, the Bab -> ~3/15 rounded .3
fG={'I':0.27,'P':0.8,'S':0.6,'Pr':0.5,'C':0.3,'M':0.9,'E':0.9,'K':0.5}
pG=math.prod(1/v for v in fG.values())
print(f'R17 set G prod = {pG:.0f} | n=15 (major only) closes:',cum(fG,15),'| n=100:',cum(fG,100),'| n=200:',cum(fG,200))
for n in (15,50,200,1000):
    rest=math.prod(1/v for k,v in fG.items() if k!='I')
    print(f'   n={n}: closes iff f_I >= {rest/n:.3f}' if rest/n<1 else f'   n={n}: cannot close for any f_I<=1 (rest={rest:.0f})')
# R18 Talmud disputed (Schaefer vs Maier): master must not need Talm
print('R18 master with Talm conceded dependent AND Jos, Tac dependent: (covered by MASTER line "even conceding Dep_x")')
print('='*20,'v13 A: METRICS (applied evenly)')
# Sides on the one question "did Jesus die on the cross (AD 30)?":
#  K = crucifixion-death side: Paul (c.50s, met Peter & James, Gal 1:18-19), Mark, Josephus Ant.18.63-64, Tacitus Ann.15.44 (Talm excluded)
#  Q = 4:157 side: the Qur'an (610-632, ~580-600 yrs after), Basilides via Irenaeus AH 1.24.4 (docetic, fl. c.117-138; presupposes the cross scene)
# scores are counts/years taken from facts.md; NOT judgement letters.
metrics=['Eyewit','Early','MultiAtt','Hostile','Isnad','Tawatur','Consensus','IntCons','Prophecy','LitUniq','Experience','Embarr']
sc={  # (K, Q): higher = better for that side; Early given as -years
 'Eyewit':(2,0),      # K: Paul reports Peter, James (eyewitness contact); Q: no human eyewitness ("God saw" = Circ, handled below)
 'Early':(-20,-90),   # K: Paul ~20y; Q: earliest non-death source Basilides ~90-110y; Qur'an ~580y
 'MultiAtt':(4,2),    # K: Paul, Mark, Jos, Tac (Talm dropped); Q: Qur'an, Basilides (not independent of Mark: Simon of Cyrene)
 'Hostile':(2,0),     # K: Tacitus (hostile), Josephus (non-Christian); Q: none
 'Isnad':(0,0),       # no chain reaches AD 30 on either side (¬EventSupp)
 'Tawatur':(1,0),     # mass transmission of the EVENT: K the universal early creed (1 Cor 15:3); Q tawatur is of the TEXT 600y later
 'Consensus':(1,0),   # critical scholars across faiths (Crossan, Ehrman, Eddy&Boyd) vs ijma (= Circ when used for the event)
 'Embarr':(1,0),      # crucified messiah a scandal (1 Cor 1:23, Deut 21:23); no embarrassment on Q side
}
verdict={'Eyewit':'FavK','Early':'FavK','MultiAtt':'FavK','Hostile':'FavK','Isnad':'Self','Tawatur':'FavK',
 'Consensus':'FavK','Embarr':'FavK','IntCons':'PTM','Prophecy':'PTM','LitUniq':'PTM','Experience':'Circ'}
# Self: applied evenly the metric scores 0 for both on the EVENT and, used to deny the K sources, hits the hadith (F1-F9)
# PTM: rival scriptures score as well (B1, B2, R17-19: Bab, D&C 67, Vedic recitation, Mormon testimony); Circ: rests on the Qur'an's own authority
m157={m:b('M157_'+m) for m in metrics}          # metric m, applied evenly, makes 4:157 more credible than Kil
scK={m:Int('sK_'+m) for m in sc}; scQ={m:Int('sQ_'+m) for m in sc}
MT=[]
for m,(k,q) in sc.items(): MT+=[scK[m]==k, scQ[m]==q]
for m in metrics:
    v=verdict[m]
    if v in('FavK','Self') and m in sc: MT.append(Implies(m157[m],scQ[m]>scK[m]))   # evenly: Q must outscore K
    if v=='Self': MT.append(Implies(m157[m],Not(HadithOK)))                            # and denying K by it costs hadith
    if v=='PTM': MT.append(Implies(m157[m],b('Rivals_'+m)))                            # would equally certify rivals
    if v=='Circ':MT.append(Implies(m157[m],Circ))
RivPTM=[b('Rivals_'+m) for m in metrics if verdict[m]=='PTM']
# a metric that certifies mutually contradicting scriptures equally cannot rank them (Ev): it is not a discriminator
MT+=[Implies(And(r,Ev),b('NoRank')) for r in RivPTM]
Any157=Or(*[And(m157[m],Not(b('NoRank')) if verdict[m]=='PTM' else BoolVal(True)) for m in metrics])
goalA=Not(And(Any157,Ev,HadithOK,Not(Circ)))
print('A  no metric, applied evenly, gives 4:157 > crucifixion:',ok(valid(F+MT+[Ev],Implies(And(HadithOK,Not(Circ)),Not(Any157)))))
print('   consistent (table + model):',solve(F+MT+[Ev])==sat)
# non-vacuity: change any one K score to lose to Q -> that metric could favour 4:157
nvA=[]
for m in sc:
    if verdict[m]!='FavK': continue
    MT2=[c for c in MT if not (str(c).startswith('sK_'+m+' =='))]+[scK[m]==scQ[m]-1]
    nvA.append(solve(F+MT2+[Ev,HadithOK,Not(Circ),m157[m]])==sat)
print('   non-vacuous: flipping each FavK score lets that metric favour 4:157:',all(nvA),f'({sum(nvA)}/{len(nvA)})')
nvP=[solve(F+[c for c in MT if not (is_app_of(c,Z3_OP_IMPLIES) and eq(c.arg(0),m157[m]))]+[Ev,HadithOK,Not(Circ),m157[m],Not(b('NoRank'))])==sat for m in metrics if verdict[m] in('PTM','Circ')]
print('   non-vacuous: dropping each PTM/Circ row lets that metric favour 4:157:',all(nvP),f'({sum(nvP)}/{len(nvP)})')
print('   uneven (¬Ev) metric use is SP:',ok(valid(F,Implies(Not(Ev),SP))))
print('   NOTE cumulative: metrics are not summed here; the many-weak-reasons route is C1 (depends on n)')

print('='*20,'v13 B: STRENGTH')
# atoms over (I, DD = death-denying reading, Kil). I∧DD entails ¬Kil (model: I∧Orth→¬Cruc, I∧Ahm→¬Kil, S→¬Kil)
atoms=list(itertools.product([0,1],repeat=3)); p={a:Real('p%d%d%d'%a) for a in atoms}
PB=[p[a]>=0 for a in atoms]+[Sum(*p.values())==1, p[(1,1,1)]==0]
P=lambda f:Sum(*[p[a] for a in atoms if f(*a)])
PKil=P(lambda i,d,k:k==1); PIDD=P(lambda i,d,k:i==1 and d==1); PI=P(lambda i,d,k:i==1)
print('B  P(Kil) > ½ ⊢ P(I ∧ DD) < ½:',ok(valid(PB+[PKil>0.5],PIDD<0.5)))
print('   P(I∧DD) ≤ 1 − P(Kil):',ok(valid(PB,PIDD<=1-PKil)))
print('   with DD fixed (classical/Ahmadi reading, P(DD)=1): P(I) < ½:',ok(valid(PB+[PKil>0.5,P(lambda i,d,k:d==1)==1],PI<0.5)))
print('   non-vacuous: drop "I∧DD → ¬Kil" → not valid:',not valid([c for c in PB if not eq(c,p[(1,1,1)]==0)]+[PKil>0.5],PIDD<0.5))
print('   honest limit: Rev/NoR reader, P(I) ≥ ½ still possible:',solve(PB+[PKil>0.5,PI>=0.5])==sat)
print('   illustrative: P(Kil)=0.95 ⊢ P(I∧DD) ≤ 0.05:',ok(valid(PB+[PKil==0.95],PIDD<=0.05)))

print('='*20,'v13 C: NO FLIP')
BibErr,InerrB,CoreC,Res,QErr,FoundI,FoundCm,FoundCi=S_('BibErr','InerrB','CoreC','Res','QErr','FoundIslam','FoundCmin','FoundCinerr')
NF=[CoreC==And(Kil,b('Proclaimed')), b('Proclaimed'),            # Jesus died, was proclaimed risen (1 Cor 15:3-4)
    Implies(BibErr,Not(InerrB)), Implies(QErr,Not(I)),
    FoundI==I, FoundCm==CoreC, FoundCi==And(CoreC,InerrB)]
G=F+Jv+NF
print('C1 BibErr ⊬ ¬Kil (tu quoque cannot rescue 4:157):',ok(not valid(G+[BibErr],Not(Kil))))
print('   BibErr ∧ Deny_Paul ∧ Ev, Jos/Tac not dependent ⊢ HistCK (death still attested):',ok(valid(G+[BibErr,D['Paul'],Ev,Not(D['Jos']),Not(D['Tac']),Not(Dep['Jos']),Not(Dep['Tac'])],HistCK)))
print('   BibErr ∧ BelQ ∧ Ev, no denials ⊢ Faith ∧ MoreR (master unchanged):',ok(valid(base+NF+[BibErr],And(Faith,MoreR))))
print('C2 asymmetric cost: QErr ⊢ ¬FoundIslam:',ok(valid(NF+[QErr],Not(FoundI))),'| BibErr ⊬ ¬FoundCmin:',ok(not valid(NF+[BibErr],Not(FoundCm))),
      '| BibErr ⊢ ¬FoundCinerr:',ok(valid(NF+[BibErr],Not(FoundCi))))
print('   minimal-core: Kil ⊢ FoundCmin possible (consistent with BibErr):',solve(G+[BibErr,Kil,FoundCm])==sat)
print('   inerrantist: BibErr hits inerrancy but still ⊬ ¬Kil:',ok(not valid(G+[BibErr,Not(FoundCi)],Not(Kil))))
print('   symmetric stake (honest): ¬Kil ⊢ ¬FoundCmin (1 Cor 15:14-17) — both sides bet on Kil:',ok(valid(NF+[Not(Kil)],Not(FoundCm))))
# Faith-Beyond vs Faith-Against
FB,FA=S_('FaithBeyond','FaithAgainst')
HistRes=b('HistDecidesRes')    # can neutral history settle the resurrection? (disputed; Ehrman: no; Licona: yes)
GnoMN=[c for c in G if not eq(c,Not(MN))]
FF=[FA==And(HistCK,Not(Kil)) , FB==And(Res,Not(HistRes),Kil), Implies(MN,And(Not(Res),Not(Sub)))]
print('C3 Christian (Kil ∧ Res, HistCK) not FaithAgainst:',ok(valid(G+FF+[Kil,Res,HistCK],Not(FA))))
print('   M (BelQ, HistCK) ⊢ FaithAgainst:',ok(valid(G+FF+[BelQ,HistCK],FA)))
print('   if he adopts MN to make Res "against": MN ⊢ ¬Sub too (his substitution miracle) and Kil untouched:',
      ok(valid(GnoMN+FF+[MN],Not(Sub))), ok(not valid(GnoMN+FF+[MN],Not(Kil))))
print('   (sanity: MN-check run without the ¬MN judgement; consistent:',solve(GnoMN+FF+[MN])==sat,')')
print('   (tautology flag: C3 first two lines follow from the definition of FaithAgainst; substance = HistCK attests Kil, no source attests ¬Res)')
print('   if HistDecidesRes (disputed) the Christian is NOT FaithBeyond, but still not FaithAgainst unless history says ¬Res:',
      solve(G+FF+[Kil,Res,HistCK,HistRes])==sat and valid(G+FF+[Kil,Res,HistCK,HistRes],Not(FA)))
used=set()
def walk(e):
    if is_const(e) and e.decl().kind()==Z3_OP_UNINTERPRETED: used.add(str(e))
    for c in e.children(): walk(c)
for f in F+Jv+MT+NF+FF: walk(f)
print('vars in no constraint (unconstrained):',sorted(set(V)-used))
print('='*20,'counts: constraints',len(F)+len(J),'vars',len(V))

# ================= v14 PARITY (C1 without n). Kinds M uses: I inimit, P prophecy, Pr preservation,
# C character/unlettered, Sp spread, K consistency, S science, E experience.
print('='*20,'v14 PARITY')
KND=['I','P','Pr','C','Sp','K','S','E']
RIV={'LDS':['I','P','C','Sp','K','E'],          # D&C 67:6-7; D&C 87; Smith's schooling; growth; apologists; Moroni 10:4
     'Bahai':['I','P','Pr','C','Sp','K','S','E'],  # Iqan "verses" proof; tablets to kings; autograph MSS; no schooling; spread; claimed; science+religion; experience
     'NT':['P','Pr','C','Sp','K','E']}          # Matt fulfilment formulas; ~5800 Gk MSS; Acts 4:13; spread; claimed; experience
VER={('LDS','I'),('LDS','P'),('LDS','E'),('Bahai','I'),('Bahai','C'),('NT','P'),('NT','C'),('NT','Pr'),('NT','Sp')}  # verified this round
PEv,CumQ,SD=b('Ev'),b('CumAll'),b('StrongerDeg')
Kil_=b('Kil'); BelQ_=b('BelQ')
def parity(R,kinds,drop=None):
    Cum_R=b('CumAll_'+R); comp=[b(f'Comp_{R}_{x}') for x in KND]
    C=[Implies(BelQ_,Not(Kil_)), Implies(Cum_R,Kil_),             # rival scripture affirms the death (1 Ne 11:33; Gleanings XXXVI; Mark 15:37)
       Implies(CumQ,BelQ_),                                        # CumAll for the Qur'an = warrant for BelQ
       Implies(And(PEv,CumQ,*comp,Not(SD)),Cum_R)]                # same standard on the same kinds
    C+=[b(f'Comp_{R}_{x}') for x in kinds if x!=drop]
    return C
for R,k in RIV.items():
    full=set(k)==set(KND)
    v=valid(parity(R,k)+[PEv,CumQ],SD)
    print(f'  {R:6} covers {len(k)}/8 kinds ({"all" if full else "missing "+",".join(sorted(set(KND)-set(k)))}): Ev ∧ CumAll(Q) ⊢ StrongerDeg:',
          ('valid' if v else 'not derivable (expected: partial cover; bites only if his case rests on those kinds)') if v==full else 'UNEXPECTED')
nv=[not valid(parity('Bahai',KND,drop=x)+[PEv,CumQ],SD) for x in KND]
print('  non-vacuity (Bahai): drop any one Comp → not valid:',f'{sum(nv)}/8')
PB=parity('Bahai',KND); print('  dropping the parity rule itself → not valid:',ok(not valid(PB[:3]+PB[4:]+[PEv,CumQ],SD)),
      '| dropping Ev → not valid:',ok(not valid(PB+[CumQ],SD)))
print('  consistent (CumAll(Q) with StrongerDeg):',solve(parity('Bahai',KND)+[PEv,CumQ,SD])==sat)
print('  NOTE Bahai coverage of P,Pr,Sp,K,S is documented-as-claimed but not all re-verified here; LDS and NT give a verified subset')
# StrongerDeg: he must show, on a neutral metric, more degree on some kind
DG={x:b('Deg_'+x) for x in KND}
Unm,PTMd,Circ_=b('Unmeasurable'),b('PTM_deg'),b('Circ')
SDC=[SD==Or(*DG.values()),
     Implies(Or(DG['I'],DG['C'],DG['E'],DG['K']),Or(Circ_,Unm)),   # no neutral metric: literary/character/experience/consistency judged from inside
     Implies(Unm,b('Faith')),
     Implies(Or(DG['Pr'],DG['Sp']),PTMd), Not(PTMd)]               # real in degree (Birmingham MS; speed) but LR~1: preserved/spreading human texts too
open_=[Not(DG['P']),Not(DG['S'])]                                    # B2/B3 judgements: specificity/classical readings fail
print('  StrongerDeg ∧ ¬Faith ∧ ¬Circ ⊢ Deg_P ∨ Deg_S (only testable degree claims remain):',
      ok(valid(SDC+[SD,Not(b('Faith')),Not(Circ_)],Or(DG['P'],DG['S']))))
print('  with B2/B3 judgements (¬Deg_P, ¬Deg_S): StrongerDeg ⊢ Faith ∨ Circ:',ok(valid(SDC+open_+[SD],Or(b('Faith'),Circ_))))
print('  without them: StrongerDeg ∧ ¬Faith ∧ ¬Circ satisfiable (C1 OPEN, narrowed):',solve(SDC+[SD,Not(b('Faith')),Not(Circ_)])==sat)
print('  without ¬PTM_deg: preservation degree escapes:',solve(SDC[:-1]+open_+[SD,Not(b('Faith')),Not(Circ_)])==sat)
print('='*20,'v15 WIN CONDITION + METRICS (full list)')
# cat: K favours the death · T tie (cannot rank; reaches AD 30 on neither side) · P proves too much (rivals affirming the death score ≥; needs ¬Deg_m judgement) · C not evidential (Circ → Faith)
MET={'revelation':'C','prophet_truthful':'P','miracles':'P','isnad':'T','tawatur':'K','ijma':'K','eyewitness':'K','early_date':'K',
 'multiple_attest':'K','hostile_attest':'K','embarrassment':'K','coherence':'P','fulfilled_prophecy':'P','science':'P','inimitability':'P',
 'preservation':'P','spread_numbers':'K','moral_fruits':'P','martyrdom':'K','fitra_experience':'C','best_explanation':'K','occam':'K',
 'bayesian':'K','burden':'K','absence_of_swap_evidence':'K','archaeology':'T','manuscripts':'T','adala':'C','muhaymin_5_48':'C',
 'divine_honour':'C','roman_practice':'K','scholar_authority':'C'}
Ev15,HOK,Circ15,Faith15,SP15,BelQ15,Out15=b('Ev'),b('HadithOK'),b('Circ'),b('Faith'),b('SP'),b('BelQ'),b('Out_any')
W=[Implies(Circ15,Faith15)]; JW=[]; Win=b('Win'); winc=[]
sK={m:Int('sK_'+m) for m in MET}; sQ={m:Int('sQ_'+m) for m in MET}
Nm={m:b('Names_'+m) for m in MET}; Fav={m:b('Fav_'+m) for m in MET}; Evd={m:b('Evid_'+m) for m in MET}; Dg={m:b('Deg15_'+m) for m in MET}
for m,c in MET.items():
    W+=[Fav[m]==And(Evd[m],sQ[m]>sK[m])]
    if c=='C': W+=[Not(Evd[m]), Implies(Nm[m],Circ15)]
    else:
        W+=[Evd[m]]
        if c=='K': JW+=[sK[m]>sQ[m]]
        if c=='T': JW+=[sK[m]==sQ[m]]
        if c=='P': W+=[Or(Dg[m],sK[m]>=sQ[m])]; JW+=[Not(Dg[m])]
    winc.append(And(Nm[m],Ev15,Evd[m],Not(Fav[m])))
# schema: an unlisted metric
Nn,Evn,Favn,NTU=b('Names_new'),b('Evid_new'),b('Fav_new'),b('NewTestUnshared')
W+=[Implies(And(Nn,Not(Evn)),Circ15), Implies(Favn,And(Evn,NTU))]; JW+=[Not(NTU)]
winc.append(And(Nn,Ev15,Evn,Not(Favn)))
W+=[Win==Or(*winc), Implies(Out15,Or(*Nm.values(),Nn)), Implies(BelQ15,Or(Out15,Faith15))]
kinds={c:sum(1 for v in MET.values() if v==c) for c in 'KTPC'}
print(f'metrics: {len(MET)} + schema | K {kinds["K"]} · tie {kinds["T"]} · PTM {kinds["P"]} · Circ {kinds["C"]}')
A=W+JW
print('M1 no listed metric, applied evenly, favours 4:157:',ok(valid(A+[Ev15],And(*[Not(f) for f in Fav.values()]))))
w1=all(valid(A+[Nm[m],Ev15],Or(Win,Faith15)) for m in MET)
print('W1 for every m: Names(m) ∧ Ev ⊢ Win ∨ Faith (Win iff m evidential):',ok(w1),
      '| evidential m ⊢ Win:',ok(all(valid(A+[Nm[m],Ev15],Win) for m,c in MET.items() if c!='C')))
print('W2 BelQ ∧ names no metric ⊢ Faith:',ok(valid(A+[BelQ15,Not(Nn)]+[Not(x) for x in Nm.values()],Faith15)),
      '| non-vacuous (drop Out_any → Names link → not valid):',ok(not valid([w for w in A if not (is_app_of(w,Z3_OP_IMPLIES) and w.arg(0).eq(Out15))]+[BelQ15,Not(Nn)]+[Not(x) for x in Nm.values()],Faith15)))
print('W3 schema new metric: Names_new ∧ Ev ⊢ Win ∨ Faith:',ok(valid(A+[Nn,Ev15],Or(Win,Faith15))),
      '| without ¬NewTU judgement: Fav_new satisfiable (burden placement, OPEN):',solve(W+[x for x in JW if not x.eq(Not(NTU))]+[Nn,Ev15,Favn])==sat)
print('non-vacuity: Win satisfiable:',solve(A+[Ev15,Win])==sat,'| ¬Win satisfiable without a naming:',solve(A+[Not(Win)])==sat,
      '| ¬Ev ⊬ Win (naming unevenly is not a win, it is SP):',solve(A+[Nm['eyewitness'],Not(Ev15),Not(Win)])==sat)
nv=[]
for i,x in enumerate(JW[:-1]):
    rest=JW[:i]+JW[i+1:]
    nv.append(solve(W+rest+[Ev15,Or(*Fav.values())])==sat)
print('non-vacuity: dropping each table score/judgement lets some metric favour 4:157:',f'{sum(nv)}/{len(nv)}')
print('consistent (table + holding 4:157 + Ev):',solve(A+F+[Ev15,BelQ15])==sat)
print('rows resting on judgement ¬Deg_m (PTM):',[m for m,c in MET.items() if c=='P'])

# ================= v16 A: TESTIMONY (revelation as testimony; Bayes)
print('='*20,'v16 A: TESTIMONY')
p,h,Pb=Reals('pProphet hKil_given_notProphet pBelQ')
TA=[p>=0,p<=1,h>=0,h<=1,Pb>=0,Pb<=p]          # BelQ true needs Prophet true: P(BelQ) ≤ P(Prophet)
pK=h*(1-p)                                     # P(Kil|Prophet)=0 under a DD reading; else history decides
def rv(prem,goal):
    s=Solver(); s.add(prem+[Not(goal)]); return s.check()==unsat
print('A1 P(BelQ) > 1/2 ⊢ P(Prophet) > 1/2:',ok(rv(TA+[Pb>Q(1,2)],p>Q(1,2))))
print('A2 P(Prophet) ≤ 1/2 ⊢ P(Kil) ≥ h/2 (testimony overrides only to the degree p):',ok(rv(TA+[p<=Q(1,2)],pK>=h/2)))
O0,L,Rh=Reals('O0 Lreasons Rhist')             # posterior odds(Prophet) = O0 · L / Rh  (history counts against Prophet under DD)
TB=[O0>0,L>0,Rh>=1]
print('A3 odds(Prophet|all) > 1  ⟺  O0·L > Rh:',ok(rv(TB,(O0*L/Rh>1)==(O0*L>Rh))))
# L is a product of per-kind LRs assessed by the same METRICS (Ev): no kind enters L without an evenly applied metric
print('A4 L ≤ ∏ LR_kind with LR_kind from the METRICS kinds (B below); A3 is the crux test')
print('   non-vacuity: P(BelQ)>1/2 satisfiable when p high:',Solver().check(TA+[Pb>Q(3,4),p==Q(9,10)])==sat,
      '| A1 fails without Pb≤p:',Solver().check(TA[:-1]+[Pb>Q(1,2),p<=Q(1,2),Pb<=1])==sat)

# ================= v16 B: DEGREE (per-kind LR for Prophet, honest upper bounds)
print('='*20,'v16 B: DEGREE')
# verdict: Q vs best rival; LRmax = generous upper bound of P(kind-evidence|Prophet)/P(...|¬Prophet)
deg={'preservation':('STRONGER',2.0),'inimitability':('COMPARABLE',2.0),'prophecy':('COMPARABLE',2.0),
     'spread':('COMPARABLE',1.2),'character':('COMPARABLE',1.5)}
Lmax=1.0
for k,(v,l) in deg.items(): Lmax*=l
print('  verdicts:',{k:v for k,(v,_) in deg.items()},'| ∏ LRmax =',Lmax)
lr={k:Real('LR_'+k) for k in deg}
DB=[And(lr[k]>=1,lr[k]<=deg[k][1]) for k in deg]
Lexpr=1
for k in deg: Lexpr=Lexpr*lr[k]
for (o0,rh,lab) in [(Q(1,15),19,'O0=1/15 (n=15 parity), P(Kil)=.95'),(Q(1,2),19,'O0=1/2, P(Kil)=.95'),
                    (Q(1,1),19,'O0=1 (no parity), P(Kil)=.95'),(Q(1,1),9,'O0=1, P(Kil)=.90'),(Q(1,15),9,'O0=1/15, P(Kil)=.90')]:
    s=Solver(); s.add(DB+[o0*Lexpr>rh]); r=s.check()
    print(f'  {lab}: some honest combination exceeds the historical ratio: {r==sat}')
print('  B-rel: preservation is of the TEXT after 632; it bears on AD 30 only via P(Prophet) (LR ≤ 2): a stronger degree is not a proof')

# ================= v16 C: GOD FACTOR
print('='*20,'v16 C: GOD FACTOR')
God,WhySwap,SubFits16,PriorSub16,SubWins16,Sub16,RaiseOK=S_('God','GodReasonForSwap','SubFits','PriorSub','SubWins','Sub','GodCouldRaise')
GC=[Implies(God,RaiseOK),                     # theism symmetric: if God acts, he could as well raise Jesus
    Implies(And(God,WhySwap),PriorSub16), Implies(WhySwap,Circ15),   # the only source of WhySwap is the Qur'an
    Implies(PriorSub16,Or(WhySwap,b('Circ'))), Implies(And(SubFits16,Not(PriorSub16)),Not(SubWins16)), Circ15==b('Circ')]
print('C1g God ∧ ¬Circ ⊢ ¬SubWins (theism alone does not favour a swap):',ok(valid(GC+[God,Not(Circ15),SubFits16],Not(SubWins16))))
print('C2g God ∧ WhySwap ⊢ Circ:',ok(valid(GC+[God,WhySwap],Circ15)))
print('C3g dropping ¬MN changes nothing (model already has ¬MN): God ∧ ¬MN ∧ ¬Circ ⊢ ¬SubWins:',ok(valid(GC+[God,Not(b('MN')),Not(Circ15),SubFits16],Not(SubWins16))))
print('   non-vacuity: drop WhySwap→Circ → God ∧ ¬Circ ∧ SubWins satisfiable:',Solver().check([g for g in GC if not g.eq(Implies(WhySwap,Circ15))]+[God,Not(Circ15),WhySwap,SubWins16])==sat)
print('   consistent:',Solver().check(GC+[God,RaiseOK])==sat)

# ================= v17: M-AI COUNTERS (steelman reply to v16)
print('='*20,'v17 COUNTERS')
def V_(prem,goal): s=Solver(); s.add(prem+[Not(goal)]); return s.check()==unsat
def SAT(c): s=Solver(); s.add(c); return s.check()==sat
# K1 inimitability: E_I = "no imitation ACCEPTED". LR_I = P(E_I|P)/P(E_I|¬P) ≤ 1/q, q = P(E_I|¬P)
q,lrI=Reals('q_acceptFail LR_I'); Neut=Bool('NeutralCriterion')
K1=[q>0,q<=1,lrI>0,lrI*q<=1, Implies(Not(Neut),q>=Q(1,2))]   # believer-set criteria: a human text fails acceptance ≥ ½ anyway
print('K1a ¬Neut ⊢ LR_I ≤ 2:',ok(V_(K1+[Not(Neut)],lrI<=2)))
print('K1b Neut ∧ q=1/50 ⊬ LR_I≤2 (LR 50 reachable only with a neutral criterion):',SAT(K1+[Neut,q==Q(1,50),lrI==50]))
print('   non-vacuous: drop ¬Neut→q≥½ ⇒ ¬Neut ∧ LR_I=50 sat:',SAT(K1[:-1]+[Not(Neut),q==Q(1,50),lrI==50]))
# K2 weighted prior: O0 = w_Q / Σ w_rivals (same metric each claimant)
wQ=Real('wQ'); ws=[Real(f'w{i}') for i in range(13)]       # 14 rivals minus LDS = 13
K2=[wQ>0]+[w>=0 for w in ws]
O0w=wQ/Sum(ws)
print('K2a O0=½ ⟺ Σw_rivals = 2·wQ:',ok(V_(K2+[Sum(ws)>0],(O0w==Q(1,2))==(Sum(ws)==2*wQ))))
print('K2b each rival ≥ wQ/4 (13 left after dropping LDS) ⊢ O0 ≤ 4/13 < ½:',ok(V_(K2+[w>=wQ/4 for w in ws],O0w<=Q(4,13))))
print('K2c O0=½ needs mean rival weight ≤ 2/13 of the Qur\'an\'s:',ok(V_(K2+[Sum(ws)==2*wQ],Sum(ws)/13<=wQ*Q(2,13))))
# K3 double counting: odds = O0·L·P(E|Sub)/P(E|¬P);  P(Sub|¬P)=ε≈0 ⇒ historical factor Rh' = P(E|Kil)/P(E|Sub)
eK,eS,eps,o0,LL=Reals('PE_Kil PE_Sub eps O0v Lv')
K3=[eK>0,eK<=1,eS>0,eS<=1,eps==0,o0>0,LL>0]
post=o0*LL*eS/((1-eps)*eK+eps*eS)
print('K3a ε=0 ⊢ odds = O0·L/(P(E|Kil)/P(E|Sub)): Rh\' is a LIKELIHOOD ratio, not P(Kil)/(1-P(Kil)):',ok(V_(K3,post==o0*LL/(eK/eS))))
print('K3b P(E|Sub)=P(E|Kil) ⊢ Rh\'=1 (history drops out; v16 Rh=19 double-counted the swap prior):',ok(V_(K3+[eS==eK],post==o0*LL)))
print('   non-vacuous: P(E|Sub)=P(E|Kil)/19 ⇒ Rh\'=19 sat:',SAT(K3+[eS*19==eK,post*19==o0*LL]))
# K4 dependence: LR(A∧B) = LR(A)·LR(B|A); can EXCEED ∏ when P(B|A,¬P) < P(B|¬P)
a1,a0,b1,b0,ab1,ab0=Reals('PA_P PA_nP PB_P PB_nP PAB_P PAB_nP')
K4=[x>0 for x in (a1,a0,b1,b0,ab1,ab0)]+[x<=1 for x in (a1,a0,b1,b0,ab1,ab0)]+[ab1<=a1,ab1<=b1,ab0<=a0,ab0<=b0]
print('K4a joint LR > product is SATISFIABLE (owner\'s "≤ product" claim FAILS in general):',SAT(K4+[ab1/ab0>(a1/a0)*(b1/b0)]))
print('K4b joint LR ≤ 1/P(A∧B|¬P): synergy still capped by the neutral-verdict term:',ok(V_(K4,ab1/ab0<=1/ab0)))
# K5 preservation: LR_Pr ≤ 2 bears on transmission T; content C needs P(C|T)
T5,C5=Bools('Preserved ContentTrue')
print('K5 Preserved ⊬ ContentTrue:',SAT([T5,Not(C5)]))

# ================= v17 SENSITIVITY
print('='*20,'v17 SENSITIVITY  odds = O0 · L_I · 7.2 / Rh   (7.2 = other LRmax: Pr2·P2·Sp1.2·K1.5)')
from fractions import Fraction as Fr
grid=[]
for o in (Fr(1,15),Fr(1,5),Fr(1,2),Fr(1)):
  for li in (2,10,50):
    row=[]
    for pk in (Fr(90,100),Fr(95,100),Fr(99,100)):
      rh=pk/(1-pk); od=o*li*Fr(36,5)/rh
      s=Solver(); s.add(O0==o,L==li*Q(36,5),Rh==rh); s.add(O0*L>Rh); w=s.check()==sat
      assert w==(od>1); row.append(f'{float(od):7.2f}{"P" if od>1 else "h"}')
    mark=' <== M-AI' if (o==Fr(1,2) and li in (10,50)) else ''
    print(f'  O0={str(o):>4} L_I={li:>2}: ',' '.join(row),mark)
print('  columns P(Kil)=.90/.95/.99 (Rh 9/19/99); P=Prophet wins, h=history wins')
print('  corrected Rh\'=1 (K3b): Prophet wins iff O0·L_I·7.2 > 1 — e.g. O0=1/15,L_I=2:',float(Fr(1,15)*2*Fr(36,5)))
print('  all-neutral (every LR=1 for lack of neutral criteria, Rh\'=1): odds = O0 — the prior alone decides')

# ================= v18 K6: TAWATUR TRAP (Razi, Mafatih al-Ghayb on 4:157)
print('='*20,'v18 K6 TAWATUR TRAP')
(Sub6,DivSub,Mass,TawAbs,TawAdi,KnowQ,Restrict,RIndep,Circ6,SP6,Age,AgeOK,Karama,Hikma,HikNarrow,
 SubBacksClaim,MisleadsRelig,TextTaw,Q159,Zann,Fraud,Mutaz,Qabih,Ascr,AdiFalse) = Bools(
 'Sub DivineLikeness MassSenseReport TawAbsolute TawAdi KnowQ_byTaw Restrict RestrictIndep Circ SP '
 'AgeOnly AgeKnownIndep KaramatOpen HikmaBroad HikmaNarrow SubBacksFalseClaim SubMisleadsAboutReligion '
 'TextNeedsGuard Pres15_9 WitnessZann HumanFraud Mutazili DeceptionQabih GodCausesErr AdiCanFail')
K6=[Implies(Sub6,Or(DivSub,Fraud)),                       # Razi: two ways (likeness cast | leaders' fraud)
    Implies(And(DivSub,Mass),Not(TawAbs)),                 # a false mass sense-report ⇒ tawatur not a guarantee
    Implies(KnowQ,Or(TawAbs,Restrict)),                    # Qur'an/miracles certain by tawatur ⇒ guarantee or restricted guarantee
    Implies(And(Restrict,Not(RIndep)),Or(Circ6,SP6)),
    Implies(And(Restrict,Age),AgeOK), Implies(Karama,Not(AgeOK)), Karama,   # Razi: age-limit needs proof; karamat keep it open
    Implies(RIndep,Or(And(Age,AgeOK),Hikma,HikNarrow,Q159)), Implies(Q159,Circ6),
    Implies(Hikma,Not(And(DivSub,MisleadsRelig)))]        # broad: God never mass-deceives in a way that misleads about religion
K6+=[Implies(DivSub,MisleadsRelig),                         # Sub's victims founded Christianity's central claim
     Implies(HikNarrow,Not(And(DivSub,SubBacksClaim))), Not(SubBacksClaim),  # narrow: no deception backing a false CLAIMANT; Sub backs none (judgement)
     Implies(And(TextTaw,Not(Hikma)),Or(Q159,HikNarrow)),  # the TEXT's tawatur needs broad hikma, 15:9 (Circ), or narrow hikma stretched to texts (judgement)
     Implies(Zann,Not(Mass)), Implies(Fraud,Not(DivSub)) , Implies(And(Mutaz,DivSub),And(Qabih,Not(DivSub)))]
def pr(n,x): print(n,x)
pr('K6a DivSub ∧ Mass ∧ KnowQ ⊢ Restrict (unrestricted tawatur gone):',ok(V_(K6+[DivSub,Mass,KnowQ],Restrict)))
pr('K6b … ∧ ¬RIndep ⊢ Circ ∨ SP:',ok(V_(K6+[DivSub,Mass,KnowQ,Not(RIndep)],Or(Circ6,SP6))))
pr('K6c age-limit escape (Razi rebuts it): Age ∧ ¬Hikma ∧ ¬HikNarrow ⊢ Circ ∨ SP:',ok(V_(K6+[DivSub,Mass,KnowQ,Not(Hikma),Not(HikNarrow)],Or(Circ6,SP6))))
pr('K6d broad hikma ∧ DivSub ⊢ ⊥ (Sub breaks the very rule that guards tawatur):',ok(V_(K6+[DivSub,Hikma],BoolVal(False))))
pr('K6e narrow hikma escape is CONSISTENT (no Circ, no SP):',SAT(K6+[DivSub,Mass,KnowQ,HikNarrow,RIndep,Not(Circ6),Not(SP6),Not(Hikma)]))
pr('   non-vacuous: drop ¬SubBacksClaim ⇒ narrow escape needs it:',ok(V_([k for k in K6 if not k.eq(Not(SubBacksClaim))]+[DivSub,HikNarrow,SubBacksClaim],BoolVal(False))))
AltQ,KnowNotAltQ=Bools('AlteredQ KnowNotAlteredQ')   # 'tawatur needs unaltered perception': the Qur'an's chain must also be known unaltered
K6f=[Implies(DivSub,Implies(KnowNotAltQ,Or(Restrict,Q159))), Implies(KnowQ,KnowNotAltQ)]
pr('K6f perception-altered escape: DivSub ∧ KnowQ ⊢ Restrict ∨ Circ (it restates the problem):',ok(V_(K6+K6f+[DivSub,KnowQ],Or(Restrict,Circ6))))
pr('   non-vacuous: without DivSub, KnowQ ∧ ¬Restrict ∧ ¬Circ sat:',SAT(K6+K6f+[Not(DivSub),KnowQ,Not(Restrict),Not(Circ6),TawAbs]))
pr('K6k text: TextTaw ∧ DivSub ∧ ¬HikNarrow ⊢ Circ (15:9) — Sub forbids broad hikma:',ok(V_(K6+[TextTaw,DivSub,Not(HikNarrow)],Circ6)))
pr('K6g Razi way 1 (fraud/few): Fraud ⊢ ¬DivSub; trap idle (TawAbs consistent):',SAT(K6+[Sub6,Fraud,KnowQ,TawAbs,Not(Circ6),Not(SP6)]))
pr('K6h zann (4:157 "only conjecture") ⊢ ¬Mass; trap idle:',SAT(K6+[DivSub,Zann,KnowQ,TawAbs,Not(Circ6),Not(SP6)]))
pr('K6i Mu\'tazili ∧ DivSub ⊢ ⊥ (deception qabih):',ok(V_(K6+[Mutaz,DivSub],BoolVal(False))))
pr('K6j Ash\'ari (¬Mutaz) ∧ DivSub ∧ GodCausesErr consistent (14:4 yudillu): theodicy only:',SAT(K6+[Not(Mutaz),DivSub,Ascr,Not(Hikma)]))
pr('K6 consistent with Sub ∧ KnowQ:',SAT(K6+[Sub6,KnowQ]))
pr('   non-vacuous K6a: drop the guarantee line ⇒ DivSub ∧ Mass ∧ KnowQ ∧ ¬Restrict sat:',SAT(K6[:1]+K6[2:]+[DivSub,Mass,KnowQ,Not(Restrict),TawAbs]))
pr('   non-vacuous K6d: drop DivSub→MisleadsRelig ⇒ broad hikma ∧ DivSub sat:',SAT([k for k in K6 if not k.eq(Implies(DivSub,MisleadsRelig))]+[DivSub,Hikma]))
# ================= v19 K7: M-AI COUNTERS TO K6 (steelman reply to v18)
print('='*20,'v19 K7 M-AI vs K6')
(Adi,AdiRare,Marker,KnowAdi,CertAbs,ChrAppAlt,ChrTawAbs,ChrRestrict,Corrected,UncorrMass,
 KilByFace,KilHostile,SubMir,KilMir,MirOK,PriorCost,Shub_imp,ObjIsRazis) = Bools(
 'AdiEpistemology AdiBreaksRare BreakHasMarker KnowledgeAdi CertaintyAbsolute ChrAcceptsLuke24_16 '
 'ChrTawAbs ChrRestrict AlterationCorrected UncorrectedMassFalseBelief KilRestsOnFaceRecog '
 'KilHostileSources SubNeedsMiracle KilNeedsMiracle MiraclesPossible SubPriorCost ShubbihaImpersonal RaziEndorsesObjection')
K7=[Implies(ChrAppAlt,Not(ChrTawAbs)),                 # Luke 24:16/John 20:14: God kept eyes from recognising ⇒ Christian cannot hold TawAbs either
    Implies(Not(ChrTawAbs),ChrRestrict),
    Implies(ChrAppAlt,Corrected),                      # Luke 24:31 eyes opened; John 20:16 recognised
    Implies(DivSub,UncorrMass),                        # Sub: false belief, mass, never corrected in-community (~600 y)
    Implies(And(Adi,AdiRare,Not(Marker)),And(KnowAdi,Not(CertAbs))),  # 'adat: ordinary knowledge survives as defeasible, not absolute
    Implies(KnowAdi,Not(TawAbs)),
    Implies(DivSub,SubMir), Not(KilMir), MirOK,        # both theists: miracles possible; Sub needs one AT the cross, Kil needs none
    Implies(And(SubMir,Not(KilMir)),PriorCost),
    Implies(Shub_imp,Or(Zann,Fraud)),                  # "shubbiha lahum" impersonal: the matter was made obscure to them
    Not(ObjIsRazis)]                                   # "al-su'al al-thani" is an objection Razi STATES, not his verdict
pr('K7a tu quoque: ChrAppAlt ⊢ ChrRestrict (Christian also lacks absolute tawatur):',ok(V_(K7,Implies(ChrAppAlt,ChrRestrict))))
pr('   non-vacuous: drop Luke-24 line ⇒ ChrAppAlt ∧ ChrTawAbs sat:',SAT(K7[1:]+[ChrAppAlt,ChrTawAbs]))
CR=[Implies(ChrRestrict,Not(UncorrMass))]               # Christian narrow rule: God may withhold recognition, never leaves a mass uncorrected false belief
pr('K7b asymmetry: Christian rule (no uncorrected mass false belief) ∧ DivSub ⊢ ⊥:',ok(V_(K6+K7+CR+[ChrAppAlt,DivSub],BoolVal(False))))
pr('   but Christian rule ∧ ChrAppAlt consistent (Luke 24 fits it):',SAT(K6+K7+CR+[ChrAppAlt,Not(DivSub)]))
pr('   and Muslim HikNarrow ∧ DivSub ∧ ChrAppAlt consistent (each rule fits its own book):',SAT(K6+K7+[ChrAppAlt,DivSub,HikNarrow,Not(Circ6),Not(SP6),Mass,KnowQ,RIndep]))
pr('K7c \'adat: Adi ∧ rare ∧ no marker ⊢ ¬TawAbs ∧ ¬CertAbs (knowledge stays, defeasible):',ok(V_(K7+[Adi,AdiRare,Not(Marker)],And(Not(TawAbs),Not(CertAbs),KnowAdi))))
pr('   consistent with DivSub ∧ KnowQ via Restrict(HikNarrow), no Circ/SP:',SAT(K6+K7+[Adi,AdiRare,Not(Marker),DivSub,Mass,KnowQ,HikNarrow,RIndep,Not(Circ6),Not(SP6)]))
pr('K7d parity on miracles: MirOK both ⊢ PriorCost for Sub (a miracle at the cross; Kil needs none):',ok(V_(K6+K7+[DivSub],PriorCost)))
pr('   non-vacuous: if Kil also needed a miracle, ¬PriorCost sat:',SAT([k for k in K7 if not k.eq(Not(KilMir))]+K6+[DivSub,KilMir,Not(PriorCost)]))
pr('K7e shubbiha impersonal ⊢ ¬DivSub ∨ ¬Mass (trap idle, K6g/h cost):',ok(V_(K6+K7+[Shub_imp],Or(Not(DivSub),Not(Mass)))))
pr('K7 consistent with Sub ∧ KnowQ ∧ ChrAppAlt:',SAT(K6+K7+[Sub6,KnowQ,ChrAppAlt]))
# ================= v20 K8: CHARACTER METRIC FAMILY (M-AI steelman)
print('='*20,'v20 K8 CHARACTER family')
CH=['amin','sincerity','ummi','fruits','modest','nogain','selfrebuke']
(Wit8,Acc8,RevG8,Proph8,Circ8,Faith8,Ev8,LateRule,AdmitK,AdmitCh,Late8,Emb8,Contested,Win8)=Bools(
 'Witness_AD30 Accurate RevelationGenuine Prophethood Circ8 Faith8 Ev8 LateRuleUsed AdmitK AdmitChar '
 'CharSourcesLate EmbEvenly CharContested Win8')
Hist8=Bool('HistFavoursKil8')
N8={m:Bool('Names_'+m) for m in CH}; Hon={m:Bool('Honest_'+m) for m in CH}; Fv={m:Bool('FavQ_'+m) for m in CH}
Dg8={m:Bool('Deg8_'+m) for m in CH}; sQ8={m:Int('sQ8_'+m) for m in CH}; sR8={m:Int('sRival_'+m) for m in CH}
K8=[Not(Wit8),                                   # c.570-632; ~600 y after AD 30: not a witness
    Implies(And(Acc8,Not(Wit8)),RevG8),          # accuracy about AD 30 only via revelation
    RevG8==Proph8, Implies(Circ8,Faith8),
    Late8,                                       # char reports: Ibn Ishaq d.~767 (via Ibn Hisham d.833), hadith 9th c.
    Implies(And(Ev8,LateRule),Not(AdmitCh)),     # 'too late/partisan' applied evenly removes the char reports
    Implies(And(Ev8,Not(LateRule)),AdmitK),      # no lateness rule ⇒ Paul (~20 y) admitted
    Implies(And(Ev8,AdmitK),Hist8),              # admitted K sources favour the death (METRICS K rows)
    Implies(Ev8,Emb8), Implies(Emb8,Hist8)]        # embarrassment criterion applied evenly: crucified messiah (1 Cor 1:23), earlier
for m in CH:
    K8+=[Implies(N8[m],Hon[m]),                  # each sub-metric supports at most honesty/sincerity
         Implies(Fv[m],And(AdmitCh,Or(And(Hon[m],Wit8),Acc8))),   # to favour 4:157 on AD30 it must give accuracy, not just honesty
         Implies(And(Fv[m],Acc8),Or(Circ8,And(Ev8,sQ8[m]>sR8[m],Dg8[m]))),  # prophethood shown by char: needs degree over rivals
         sR8[m]>=sQ8[m]]                          # parity: Smith, Bahá'u'lláh, Báb (shot 1850), Mani (d. prison 274/277), apostles/Paul
K8J=[Not(Dg8[m]) for m in CH]                    # JUDGEMENT: no neutral metric of degree (and contested: Qurayza, Aisha, gharaniq)
K8+=[Win8==And(*[Not(Fv[m]) for m in CH])]
pr('K8a sincerity ≠ accuracy: Honest ∧ ¬Witness ∧ Accurate ⊢ Prophethood (reduces to C1):',ok(V_(K8,Implies(Acc8,Proph8))))
pr('   non-vacuous: drop the "only via revelation" line ⇒ Accurate ∧ ¬Prophethood sat:',SAT([k for k in K8 if not k.eq(Implies(And(Acc8,Not(Wit8)),RevG8))]+[Acc8,Not(Proph8)]))
pr('K8b late-source parity: Ev ⊢ ¬AdmitChar ∨ HistFavoursKil (either the char reports go, or Paul stays):',ok(V_(K8,Implies(Ev8,Or(Not(AdmitCh),Hist8)))))
pr('K8c embarrassment applied evenly ⊢ HistFavoursKil (self-rebuke 80:1-10, 33:37 cuts for Kil, earlier):',ok(V_(K8,Implies(Ev8,Hist8))))
pr('   non-vacuous: drop Ev→Emb and Ev∧¬LateRule→AdmitK ⇒ Ev ∧ ¬HistFavoursKil sat:',SAT([k for k in K8 if not (k.eq(Implies(Ev8,Emb8)) or k.eq(Implies(And(Ev8,Not(LateRule)),AdmitK)))]+[Ev8,Not(Hist8)]))
for m in CH:
    assert V_(K8+K8J,Implies(And(N8[m],Ev8),Or(Win8,Faith8)))
pr('K8d every char sub-metric: Names_m ∧ Ev ⊢ Win ∨ Faith (7/7):',ok(all(V_(K8+K8J,Implies(And(N8[m],Ev8),Or(Win8,Faith8))) for m in CH)))
pr('K8e no sub-metric favours 4:157 except through Circ (Ev, ¬Deg): FavQ_m ⊢ Faith, 7/7:',ok(all(V_(K8+K8J+[Ev8],Implies(Fv[m],Faith8)) for m in CH)))
def drop8(m,par,deg): return [k for k in K8 if not (par and k.eq(sR8[m]>=sQ8[m]))]+[d for d in K8J if not (deg and d.eq(Not(Dg8[m])))]
pr('   non-vacuous: drop parity ∧ ¬Deg (per m) ⇒ FavQ_m ∧ ¬Faith sat, 7/7:',all(SAT(drop8(m,1,1)+[Ev8,Fv[m],Not(Faith8)]) for m in CH))
pr('   drop only parity ⇒ still blocked by ¬Deg; drop only ¬Deg ⇒ still blocked by parity (two independent locks):',
   ok(all(V_(drop8(m,1,0)+[Ev8],Implies(Fv[m],Faith8)) and V_(drop8(m,0,1)+[Ev8],Implies(Fv[m],Faith8)) for m in CH)))
pr('   even unlocked, FavQ_m ⊢ Prophethood (it is C1, not history), 7/7:',ok(all(V_(drop8(m,1,1),Implies(Fv[m],Proph8)) for m in CH)))
pr('K8 consistent (with BelQ15, Ev, holding 4:157 on Faith):',SAT(K8+K8J+[Ev8,Faith8,Hist8]+A+F+[Ev15,BelQ15]))
# ================= v22 K9: SUPERIORITY-IN-DEGREE (¬Deg) by metric
print('='*20,'v22 K9 SUPERIORITY metrics')
# per metric: (favours Muhammad over Smith?, Jesus/Christianity >= Muhammad on it?, evidential (not ad populum/might)?, bears on AD30?)
M9={'size':(1,1,0,0),'longevity':(1,1,0,0),'impact_Hart':(1,0,0,0),'political_military':(1,0,0,0),
    'speed':(1,0,0,0),'eloquence':(1,0,1,0),'no_failed_prophecy':(1,0,1,0),'moral_conduct':(0,0,1,0),
    'preservation':(1,0,1,0),'documented_life':(1,0,1,0),'finality_seal':(0,0,0,0),'coherence':(0,0,1,0),
    'quranic_status_of_Jesus':(0,1,1,0)}
(Ev9,Kil9,HistK9,Proph9,UseTest,TestQ,AgainstQ,SubT,Ahm9,MightRight,Mongol)=Bools(
 'Ev9 Kil9 HistFavoursKil9 Prophethood9 UseTestability Test_4_157 TestCountsAgainst Sub_untestable Ahm9 MightRight MongolsSup')
Sup={m:Bool('SupMetric_'+m) for m in M9}; FMS={m:Bool('FavMS_'+m) for m in M9}; FJ={m:Bool('FavJ_'+m) for m in M9}
EvM={m:Bool('Evid_'+m) for m in M9}; Rel={m:Bool('RelAD30_'+m) for m in M9}; HQ={m:Bool('HistFavQ_'+m) for m in M9}
RP={m:Bool('RaisesP_'+m) for m in M9}
K9F=[]                                                  # facts (table)
for m,(a,b,c,d) in M9.items():
    K9F+=[FMS[m]==BoolVal(bool(a)),FJ[m]==BoolVal(bool(b)),Rel[m]==BoolVal(bool(d))]
    if not c: K9F+=[Implies(Ev9,Not(EvM[m]))]         # success/assertion metrics: evenly, Rome/Mongols/'seal' claims (Bahá'í too) ⇒ not truth-evidence
K9=[Implies(And(Ev9,MightRight),Mongol), Implies(Ev9,Not(Mongol)),   # might-makes-right evenly crowns the Mongols: rejected
    Implies(Ev9,Not(MightRight)),
    HistK9, Implies(And(Ev9,UseTest),TestQ),              # testability applied evenly reaches 4:157 (a dated, public claim)
    Implies(And(TestQ,Ahm9),AgainstQ),                    # Ahm: tested, fails (Roman practice, K3 exception)
    Implies(And(TestQ,Not(Ahm9)),SubT),                   # Orth/Sub: not testable ⇒ earns no evidential credit
    Implies(SubT,Not(HQ['no_failed_prophecy']))]
for m in M9:
    K9+=[Implies(Sup[m],FMS[m]),                          # to be used against Smith, the metric must favour Muhammad over him
         Implies(HQ[m],And(EvM[m],Or(Rel[m],Proph9),Not(FJ[m]))),  # favours 4:157 on AD30 only if evidential, relevant (or via prophethood), and Jesus not ≥
         Implies(And(Ev9,EvM[m],Not(Rel[m])),Implies(HQ[m],Proph9)), # irrelevant-but-evidential: at most raises P(Prophet)
         Implies(And(Sup[m],EvM[m]),RP[m])]
K9+=[Implies(Sup['no_failed_prophecy'],UseTest)]          # beating Smith on Abraham papyri / D&C 84 IS the testability standard
goal=lambda m: Implies(And(Sup[m],Ev9),Or(FJ[m],Not(EvM[m]),Not(Rel[m])))
pr('K9a trap: SupMetric_m ∧ Ev ⊢ FavJ_m ∨ ¬Evid_m ∨ ¬RelAD30_m, 13/13:',ok(all(V_(K9+K9F,goal(m)) for m in M9)))
pr('   non-vacuous: drop the fact table ⇒ SupMetric ∧ Ev ∧ ¬goal sat, 13/13:',all(SAT(K9+[Sup[m],Ev9,Not(FJ[m]),EvM[m],Rel[m]]) for m in M9))
pr('K9b no metric gives history for 4:157 without prophethood: HistFavQ_m ∧ Ev ⊢ Prophethood, 13/13:',ok(all(V_(K9+K9F+[Ev9],Implies(HQ[m],Proph9)) for m in M9)))
pr('   non-vacuous: make m relevant to AD30 ⇒ HistFavQ ∧ ¬Prophethood sat (eloquence, fact rows dropped):',SAT(K9+[Ev9,HQ['eloquence'],Not(Proph9),Rel['eloquence'],EvM['eloquence'],Not(FJ['eloquence'])]))
pr('K9c testability boomerang: Sup(no_failed_prophecy) ∧ Ev ⊢ Test_4_157 ∧ (Ahm → counts against) ∧ (¬Ahm → no credit):',
   ok(V_(K9+K9F+[Sup['no_failed_prophecy'],Ev9],And(TestQ,Implies(Ahm9,AgainstQ),Implies(Not(Ahm9),Not(HQ['no_failed_prophecy']))))))
pr('   non-vacuous: drop Ev ⇒ Sup(nfp) ∧ ¬Test_4_157 sat:',SAT(K9+K9F+[Sup['no_failed_prophecy'],Not(Ev9),Not(TestQ)]))
pr('K9d ad populum: Ev ⊢ ¬MightRight and ¬Evid for size/longevity/impact/political/speed/seal:',ok(V_(K9+K9F+[Ev9],And(Not(MightRight),*[Not(EvM[m]) for m in M9 if not M9[m][2]]))))
pr('K9e Deg GRANTED (all evidential Sup true) is consistent with Kil ∧ HistFavoursKil ∧ ¬HistFavQ_m all m:',
   SAT(K9+K9F+[Ev9,Kil9]+[Sup[m] for m in M9 if M9[m][0]]+[Not(HQ[m]) for m in M9]))
pr('   and Deg granted ⊢ RaisesP for each evidential Sup (moves O0/C1 only):',ok(all(V_(K9+K9F+[Sup[m],EvM[m]],RP[m]) for m in M9 if M9[m][0] and M9[m][2])))
pr('K9 consistent (with BelQ15, Ev, Faith8):',SAT(K9+K9F+[Ev9,Faith8]+A+F+[Ev15,BelQ15]))
# ================= v24 FLIPS: comparative checkable history (Bible-only vs Qur'an-only)
print('='*20,'v24 FLIPS')
SH=['Exodus_drowning','Noah_flood','Adam','Jonah','Sodom','Abraham']   # both books affirm
FX={x:Bool('Flip_'+x) for x in SH}; QA={x:Bool('QAffirms_'+x) for x in SH}
HB={x:Bool('HitsB_'+x) for x in SH}; HQf={x:Bool('HitsQ_'+x) for x in SH}
L1=[]
for x in SH: L1+=[QA[x], Implies(FX[x],And(HB[x],Implies(QA[x],HQf[x])))]
pr('L1 shared: Flip_x ∧ QAffirms_x ⊢ HitsB_x ∧ HitsQ_x (tu quoque cancels), 6/6:',ok(all(V_(L1,Implies(FX[x],And(HB[x],HQf[x]))) for x in SH)))
pr('   non-vacuous: drop QAffirms ⇒ Flip ∧ ¬HitsQ sat:',SAT([k for k in L1 if not any(k.eq(QA[x]) for x in SH)]+[FX['Jonah'],Not(HQf['Jonah'])]))
# status: P problem, D disputed, A answered; core = touches CoreC (Kil ∧ proclaimed risen) / the book's own central claim on this question
BI={'Quirinius':('P',0),'Innocents':('D',0),'Matt27_52':('P',0),'Darkness':('D',0),'Judas_deaths':('D',0),
    'Darius_Mede':('P',0),'Belshazzar_king':('A',0)}
QI={'Q4_157':('P',1),'Haman':('P',0),'Mary_sister_Aaron':('A',0),'Samiri':('D',0),'DhulQarnayn':('D',0),
    'Seven_Sleepers':('D',0),'Clay_birds':('P',0),'Cradle_speech':('D',0),'Crucifixion_Egypt':('D',0)}
Kil24,BErr=Bools('Kil24 BibErrAny')
pr('L2 no Bible-only item touches CoreC (7/7); BibErr ⊬ ¬Kil:',ok(all(c==0 for s,c in BI.values()) and SAT([BErr,Kil24])))
wP,wD,wA,cB,wPQ,wDQ,wAQ,cQ=Ints('wP wD wA c wPQ wDQ wAQ cQ'); Ev24=Bool('Ev24')
def score(I,P,D,A,c): return Sum([{'P':P,'D':D,'A':A}[s]+c*k for s,k in I.values()])
Met=[wP>=wD,wD>=wA,wA>=0,cB>=0,wPQ>=wDQ,wDQ>=wAQ,wAQ>=0,cQ>=0,
     Implies(Ev24,And(wPQ==wP,wDQ==wD,wAQ==wA,cQ==cB))]   # Ev: one metric for both books
Flip24=score(QI,wPQ,wDQ,wAQ,cQ)<score(BI,wP,wD,wA,cB)        # Qur'an's differing claims rank better
pr('L3 Ev ⊢ ¬Flip (every even monotone metric ranks the Qur\'an\'s differing claims no better):',ok(V_(Met,Implies(Ev24,Not(Flip24)))))
pr('   non-vacuous: drop Ev (side-specific weights) ⇒ Flip sat:',SAT(Met+[Not(Ev24),Flip24]))
pr('   strict: Ev ∧ (wD>0 ∨ c>0) ⊢ Qur\'an strictly worse:',ok(V_(Met,Implies(And(Ev24,Or(wD>0,cB>0)),score(QI,wPQ,wDQ,wAQ,cQ)>score(BI,wP,wD,wA,cB)))))
QR=lambda: Sum([{'P':wPQ,'D':wDQ,'A':wAQ}[('D' if x in('Haman','Clay_birds') else s)]+cQ*k for x,(s,k) in QI.items()])
pr('   WEAK SPOT: reclassify Haman, Clay_birds to D ⇒ Flip sat under Ev (no longer a theorem):',SAT(Met+[Ev24,QR()<score(BI,wP,wD,wA,cB)]))
pr('   ... exact condition: Ev ⊢ (¬Flip ⟺ c + 4·wD ≥ 2·wP):',ok(V_(Met,Implies(Ev24,(QR()>=score(BI,wP,wD,wA,cB))==(cB+4*wD>=2*wP)))))
pr('   e.g. core weight c ≥ 2·wP (4:157 counts as two peripheral errors) ⊢ ¬Flip:',ok(V_(Met,Implies(And(Ev24,cB>=2*wP),Not(QR()<score(BI,wP,wD,wA,cB))))))
QI2=dict(QI); QI2['Q4_157']=('D',0)
pr('   honest limit: 4:157 demoted to disputed non-core ⇒ Ev ⊢ (¬Flip ⟺ 3·wD ≥ wP):',ok(V_(Met,Implies(Ev24,(score(QI2,wPQ,wDQ,wAQ,cQ)>=score(BI,wP,wD,wA,cB))==(3*wD>=wP)))))
pr('L consistent (with BelQ15, Ev):',SAT(L1+Met+[Ev24]+A+F+[Ev15,BelQ15]))
# ================= v24 H2H: head-to-head only (same event/person, the books differ; miracles bracketed)
print('='*20,'v24 H2H head-to-head')
# verdict: B / Q favoured by academic history, N neither/unknown; strength s (strong) / w (weak); core (bears on CoreC/4:157)
H2H={'death_4_157':('B','s',1),'Injil_given_vs_Gospels':('B','s',0),'Mary_temple_Zechariah':('B','s',0),
     'Abraham_Ishmael_Mecca':('B','w',0),'Haman_era':('B','w',0),'Saul_Gideon_water':('B','w',0),
     'Joseph_malik_vs_Pharaoh':('Q','w',0),'Flood_scope':('Q','w',0),
     'Mary_sister_Aaron_vs_Luke':('N','w',0),'Calf_Samiri_vs_Aaron':('N','w',0),'Birth_palm_vs_Bethlehem':('N','w',0),
     'Pharaoh_body_10_92':('N','w',0),'Adoption_wife_vs_daughter':('N','w',0),'Baker_crucified_vs_hanged':('N','w',0)}
hs,hw,hc,qs,qw,qc=Ints('hs hw hc qs qw qc'); EvH=Bool('EvH')
MetH=[hs>=hw,hw>=0,hc>=0,qs>=qw,qw>=0,qc>=0,Implies(EvH,And(qs==hs,qw==hw,qc==hc))]
def sc(side,s,w,c): return Sum([(s if st=='s' else w)+c*k for v,st,k in H2H.values() if v==side]+[IntVal(0)])
FlipH=sc('Q',qs,qw,qc)>sc('B',hs,hw,hc)
pr('H1 head-to-head tally B/Q/N:',[sum(1 for v in H2H.values() if v[0]==x) for x in 'BQN'])
pr('H2 Ev ⊢ ¬Flip on head-to-head claims (every even monotone metric):',ok(V_(MetH,Implies(EvH,Not(FlipH)))))
pr('   non-vacuous: drop Ev ⇒ Flip sat:',SAT(MetH+[Not(EvH),FlipH]))
pr('   strict: Ev ∧ hw>0 ⊢ Bible strictly ahead:',ok(V_(MetH,Implies(And(EvH,hw>0),sc('B',hs,hw,hc)>sc('Q',qs,qw,qc)))))
AllB=And(*[BoolVal(v!='Q') for v,_,_ in H2H.values()])
pr('H3 HONEST: "Bible not behind on EVERY head-to-head" is false (Joseph malik, flood scope):',SAT([Not(AllB)]))
pr('H4 robustness: drop 4:157 and Injil (worst case for Bible) ⇒ Ev ⊢ ¬Flip still (B weak 3+1 strong vs Q weak 2):',
   ok(V_(MetH,Implies(EvH,Not(Sum([(qs if st=='s' else qw) for x,(v,st,k) in H2H.items() if v=='Q'])>Sum([(hs if st=='s' else hw) for x,(v,st,k) in H2H.items() if v=='B' and x not in('death_4_157','Injil_given_vs_Gospels')]))))))
pr('H5 Q-won items touch CoreC: none ⇒ cannot flip 4:157:',ok(all(k==0 for v,s,k in H2H.values() if v=='Q')))

# ================= v27 H2H AUDIT (adversarial re-check, 15 Nov 2026) — SUPERSEDES the v24 H2H dict as the tally
print('='*20,'v27 H2H audited head-to-head')
# (verdict, strength s=external evidence / w=source-critical or reading-dependent, core, disputed)
H27={'death_4_157':('B','s',1,0),'Injil_given_vs_Gospels':('B','s',0,0),'Haman_era':('B','w',0,0),
     'Saul_Gideon_water':('B','w',0,1),'Abraham_Ishmael_Mecca':('B','w',0,1),'John_name_none_before':('B','w',0,1),
     'Israel_inherits_Egypt':('B','w',0,1),'Ahmad_foretold_61_6':('B','w',0,1),
     'Joseph_malik_vs_Pharaoh':('Q','w',0,1),'Flood_scope':('Q','w',0,1),'Exodus_small_band':('Q','w',0,1),
     'Mary_sister_Aaron_Imran':('N','w',0,0),'Calf_Samiri_vs_Aaron':('N','w',0,0),'Birth_palm_vs_Bethlehem':('N','w',0,0),
     'Pharaoh_body_10_92':('N','w',0,0),'Adoption_wife_vs_daughter':('N','w',0,0),'Baker_crucified_vs_hanged':('N','w',0,0),
     'Noah_son_drowned':('N','w',0,0),'Ark_Judi_vs_Ararat':('N','w',0,0),'Azar_vs_Terah':('N','w',0,0),
     'Midian_two_vs_seven':('N','w',0,0),'Joseph_parents_bow':('N','w',0,0),'Solomon_apostasy':('N','w',0,0)}
REMOVED27=['Mary_temple_Zechariah (Bible silent: one-book, not head-to-head)']
def sc27(side,s,w,c,keep=lambda x,d:True): return Sum([(s if st=='s' else w)+c*k for x,(v,st,k,d) in H27.items() if v==side and keep(x,d)]+[IntVal(0)])
Flip27=sc27('Q',qs,qw,qc)>sc27('B',hs,hw,hc)
T27=[sum(1 for v in H27.values() if v[0]==x) for x in 'BQN']
print('H1 audited tally B/Q/N:',T27,'| removed:',REMOVED27)
print('   B strong:',sum(1 for v in H27.values() if v[0]=='B' and v[1]=='s'),'· Q strong:',sum(1 for v in H27.values() if v[0]=='Q' and v[1]=='s'))
print('H2 Ev ⊢ ¬Flip (every even monotone metric):',ok(V_(MetH,Implies(EvH,Not(Flip27)))))
print('   non-vacuous: drop Ev ⇒ Flip sat:',SAT(MetH+[Not(EvH),Flip27]))
print('   strict: Ev ∧ hw>0 ⊢ Bible strictly ahead:',ok(V_(MetH,Implies(And(EvH,hw>0),sc27('B',hs,hw,hc)>sc27('Q',qs,qw,qc)))))
print('H3 HONEST: "history never favours the Qur\'an" is FALSE (3 weak Q items):',SAT([Not(And(*[BoolVal(v[0]!='Q') for v in H27.values()]))]))
print('H4 robustness: drop 4:157 and Injil ⇒ Ev ⊢ ¬Flip still:',
   ok(V_(MetH,Implies(EvH,Not(sc27('Q',qs,qw,qc)>sc27('B',hs,hw,hc,lambda x,d:x not in('death_4_157','Injil_given_vs_Gospels')))))))
print('H4b asymmetric worst case: drop every disputed B item, keep every disputed Q item ⇒ Ev ⊢ ¬Flip:',
   ok(V_(MetH,Implies(EvH,Not(sc27('Q',qs,qw,qc)>sc27('B',hs,hw,hc,lambda x,d:d==0))))))
print('   non-vacuous: H4b with 4:157 also dropped ⇒ Flip sat under Ev (limit shown):',
   SAT(MetH+[EvH,sc27('Q',qs,qw,qc)>sc27('B',hs,hw,hc,lambda x,d:d==0 and x!='death_4_157')]))
print('H5 Q-favoured items touch CoreC/4:157: none:',ok(all(k==0 for v,s,k,d in H27.values() if v=='Q')))
print('   every Q-favoured item is weak and disputed:',ok(all(s=='w' and d==1 for v,s,k,d in H27.values() if v=='Q')))
# claims about contemporaries' beliefs (historically checkable; NOT Bible-vs-Qur'an, so not in the tally)
BEL27={'Ezra_son_of_God_9_30':'Qdisfavoured_w_D','Mary_in_godhead_5_116_5_73':'N_D'}
print('BEL contemporaries-belief claims (outside tally):',BEL27)
print('H27 consistent (with BelQ15, Ev):',SAT(MetH+[EvH,Not(Flip27)]))

# ================= v28 H2H RE-VERIFIED (second independent fact-check, web sources, 15 Nov 2026) — SUPERSEDES H27 as the tally
print('='*20,'v28 H2H re-verified head-to-head')
H28=dict(H27)
del H28['Exodus_small_band']                 # 26:54 is Pharaoh's speech, not narration: Q makes no size claim ⇒ one-book (Bible-only) problem
H28['Israel_inherits_Egypt']=('N','w',0,1)   # tafsir itself cross-refers 26:59 to 7:137 (the land of Syria): reading too open to score
REMOVED28=REMOVED27+['Exodus_small_band (26:54 is Pharaoh speaking; Bible-only problem)']
def sc28(side,s,w,c,keep=lambda x,d:True): return Sum([(s if st=='s' else w)+c*k for x,(v,st,k,d) in H28.items() if v==side and keep(x,d)]+[IntVal(0)])
Flip28=sc28('Q',qs,qw,qc)>sc28('B',hs,hw,hc)
T28=[sum(1 for v in H28.values() if v[0]==x) for x in 'BQN']
print('H1 verified tally B/Q/N:',T28,'| removed:',REMOVED28)
print('   B strong:',sum(1 for v in H28.values() if v[0]=='B' and v[1]=='s'),'· Q strong:',sum(1 for v in H28.values() if v[0]=='Q' and v[1]=='s'))
print('H2 Ev ⊢ ¬Flip (every even monotone metric):',ok(V_(MetH,Implies(EvH,Not(Flip28)))))
print('   non-vacuous: drop Ev ⇒ Flip sat:',SAT(MetH+[Not(EvH),Flip28]))
print('   strict: Ev ∧ hw>0 ⊢ Bible strictly ahead:',ok(V_(MetH,Implies(And(EvH,hw>0),sc28('B',hs,hw,hc)>sc28('Q',qs,qw,qc)))))
print('H3 HONEST: "history never favours the Qur\'an" is FALSE (2 weak Q items):',SAT([Not(And(*[BoolVal(v[0]!='Q') for v in H28.values()]))]))
print('H4 drop 4:157 and Injil ⇒ Ev ⊢ ¬Flip still:',
   ok(V_(MetH,Implies(EvH,Not(sc28('Q',qs,qw,qc)>sc28('B',hs,hw,hc,lambda x,d:x not in('death_4_157','Injil_given_vs_Gospels')))))))
print('H4b worst case: drop every disputed B item, keep every disputed Q item ⇒ Ev ⊢ ¬Flip:',
   ok(V_(MetH,Implies(EvH,Not(sc28('Q',qs,qw,qc)>sc28('B',hs,hw,hc,lambda x,d:d==0))))))
print('H4c harsher: H4b AND drop 4:157 ⇒ Ev ⊢ ¬Flip (Injil s + Haman w ≥ 2w):',
   ok(V_(MetH,Implies(EvH,Not(sc28('Q',qs,qw,qc)>sc28('B',hs,hw,hc,lambda x,d:d==0 and x!='death_4_157'))))))
print('   limit: H4b AND drop 4:157 AND Injil ⇒ Flip sat under Ev:',
   SAT(MetH+[EvH,sc28('Q',qs,qw,qc)>sc28('B',hs,hw,hc,lambda x,d:d==0 and x not in('death_4_157','Injil_given_vs_Gospels'))]))
print('H5 Q-favoured items touch CoreC/4:157: none:',ok(all(k==0 for v,s,k,d in H28.values() if v=='Q')))
print('   every Q-favoured item is weak and disputed:',ok(all(s=='w' and d==1 for v,s,k,d in H28.values() if v=='Q')))
print('H28 consistent (with BelQ15, Ev):',SAT(MetH+[EvH,Not(Flip28)]))
