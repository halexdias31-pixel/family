"""
CHEMISTRY -- the eleven AQA units, three levels each.

THE ARITHMETIC IN EVERY CALCULATION QUESTION IS DONE HERE, not remembered. A quiz that marks a
child wrong is the failure CLAUDE.md calls the worse of the two, and a mole calculation typed out
from memory is exactly where a digit slips. `check-quizzes.js` recomputes the ones it can.
"""
from quizwrite import quiz

# --------------------------------------------- Atomic Structure & Periodic Table

quiz('Chemistry', 'Atomic Structure & the Periodic Table', 'KS3', [
    {'ask': 'Which particle in an atom has a negative charge?',
     'choices': ['Electron', 'Proton', 'Neutron', 'Nucleus'],
     'answer': 'Electron',
     'why': 'Protons are positive, neutrons have no charge, electrons are negative. An atom has '
            'equal numbers of protons and electrons, so overall it is neutral.'},
    {'ask': 'Where in the atom is nearly all the mass?',
     'choices': ['In the nucleus', 'In the electrons',
                 'Spread evenly through the atom', 'In the outer shell'],
     'answer': 'In the nucleus',
     'why': 'Protons and neutrons each have a mass of 1; an electron is about 1/1836 of that. The '
            'nucleus is tiny compared with the atom and holds essentially all of it.'},
    {'ask': 'What is an element?',
     'choices': ['A substance made of only one type of atom',
                 'Two or more substances mixed together',
                 'Two or more elements chemically joined',
                 'Anything that can be separated by filtering'],
     'answer': 'A substance made of only one type of atom',
     'why': 'A compound is elements chemically bonded — hard to separate. A mixture is just things '
            'together — easy to separate. An element is neither: one kind of atom, and nothing '
            'chemical will break it down.'},
    {'ask': 'Elements in the same group of the periodic table have the same number of what?',
     'answer': 'Electrons in the outer shell',
     'accept': 'outer electrons|electrons in the outer shell|outer shell electrons|'
               'electrons in their outer shell|outer electron|valence electrons|outer shell',
     'why': 'The group number IS the number of outer electrons for the main groups — and because '
            'reactions are about outer electrons, that is why a group behaves alike.'},
    {'ask': 'Which of these is a metal?',
     'choices': ['Iron', 'Oxygen', 'Sulfur', 'Chlorine'],
     'answer': 'Iron',
     'why': 'Metals are on the left and middle of the periodic table. They conduct electricity and '
            'heat, are malleable, and form positive ions by losing electrons.'},
])

quiz('Chemistry', 'Atomic Structure & the Periodic Table', 'GCSE-F', [
    {'ask': 'An atom has mass number 23 and atomic number 11. How many neutrons does it have?',
     'choices': ['12', '11', '23', '34'],
     'answer': '12',
     'why': 'Neutrons = mass number − atomic number = 23 − 11 = 12. The atomic number is '
            'the protons, and the mass number counts protons and neutrons together.'},
    {'ask': 'What are isotopes?',
     'choices': ['Atoms of the same element with different numbers of neutrons',
                 'Atoms of the same element with different numbers of protons',
                 'Atoms of different elements with the same mass',
                 'Atoms that have lost an electron'],
     'answer': 'Atoms of the same element with different numbers of neutrons',
     'why': 'Change the protons and you have changed the element. Neutrons change the mass and '
            'nothing else, so isotopes react identically — the chemistry is all in the electrons.'},
    {'ask': 'Why are Group 0 elements unreactive?',
     'choices': ['They have a full outer shell of electrons',
                 'They have only one outer electron',
                 'They are all gases',
                 'Their atoms are too heavy to react'],
     'answer': 'They have a full outer shell of electrons',
     'why': 'A full outer shell is a stable arrangement, so there is nothing to gain by reacting. '
            'Every other group reacts in order to reach that same arrangement.'},
    {'ask': 'Going DOWN Group 1, the elements become...',
     'choices': ['more reactive', 'less reactive',
                 'less metallic', 'harder to cut'],
     'answer': 'more reactive',
     'why': 'A Group 1 atom reacts by LOSING its outer electron. Further down, that electron is in a '
            'shell further from the nucleus and shielded by more inner shells, so it is more easily '
            'lost. Group 7 is the other way round, for the mirror-image reason.'},
    {'ask': 'Write the electronic structure of an atom with 11 electrons.',
     'answer': '2,8,1',
     'accept': '2,8,1|2.8.1|2 8 1|2,8,1.',
     'why': 'Shells fill 2 then 8 then 8. Two outer electrons left over after 2 and 8 would be '
            'wrong — 11 − 10 = 1, so the outer shell holds one, which is why sodium is in '
            'Group 1.'},
])

quiz('Chemistry', 'Atomic Structure & the Periodic Table', 'GCSE-H', [
    {'ask': 'Chlorine has isotopes of mass 35 (75%) and 37 (25%). What is its relative atomic mass?',
     'choices': ['35.5', '36.0', '35.0', '37.0'],
     'answer': '35.5',
     'why': 'A weighted mean: (35×75 + 37×25) ÷ 100 = (2625 + 925) ÷ 100 = 35.5. '
            'A plain average of 35 and 37 would give 36 — the abundances are the whole point.'},
    {'ask': 'What did Rutherford’s alpha scattering experiment show?',
     'choices': ['The mass and positive charge are concentrated in a tiny nucleus',
                 'Electrons are spread through a ball of positive charge',
                 'Atoms are indivisible',
                 'Electrons orbit at fixed distances'],
     'answer': 'The mass and positive charge are concentrated in a tiny nucleus',
     'why': 'Most alpha particles went straight through, so the atom is mostly empty; a few bounced '
            'back, so something small, heavy and positive is in there. That killed the plum pudding '
            'model. Bohr then added the fixed shells.'},
    {'ask': 'Why are transition metals often used as catalysts?',
     'choices': ['They can exist in more than one oxidation state',
                 'They have very low melting points',
                 'They are all magnetic',
                 'They react quickly with water'],
     'answer': 'They can exist in more than one oxidation state',
     'why': 'Being able to change charge and change back is what lets a catalyst take part in a '
            'reaction and be returned unchanged at the end.'},
    {'ask': 'Chlorine is added to potassium bromide solution. What happens?',
     'choices': ['The chlorine displaces the bromine, and the solution turns orange',
                 'Nothing happens',
                 'The bromine displaces the chlorine',
                 'A white precipitate forms'],
     'answer': 'The chlorine displaces the bromine, and the solution turns orange',
     'why': 'Chlorine is higher in Group 7, so it is more reactive and takes the electron. '
            'Cl₂ + 2KBr → 2KCl + Br₂, and the bromine released is orange-brown.'},
    {'ask': 'Why was Mendeleev’s periodic table accepted even though some elements were in the '
            'wrong order by atomic weight?',
     'choices': ['He left gaps and correctly predicted the properties of undiscovered elements',
                 'He listed more elements than anyone else',
                 'He arranged them alphabetically',
                 'He knew about protons'],
     'answer': 'He left gaps and correctly predicted the properties of undiscovered elements',
     'why': 'A prediction that later comes true is far stronger evidence than a tidy arrangement. '
            'The out-of-order pairs were explained later, when the table turned out to be ordered by '
            'proton number rather than weight.'},
])

# ------------------------------------------------------------ Bonding & Structure

quiz('Chemistry', 'Bonding & Structure', 'KS3', [
    {'ask': 'What holds the atoms together in a compound?',
     'choices': ['Chemical bonds', 'Gravity', 'Static electricity only', 'Magnetism'],
     'answer': 'Chemical bonds',
     'why': 'Bonds form when atoms transfer or share electrons to get a stable outer shell. Breaking '
            'them needs energy, which is why compounds are hard to split up.'},
    {'ask': 'Sodium chloride is made of sodium and chlorine. What type of substance is it?',
     'choices': ['A compound', 'A mixture', 'An element', 'An isotope'],
     'answer': 'A compound',
     'why': 'The atoms are chemically joined, so the properties are nothing like the elements: '
            'sodium is a reactive metal, chlorine a poisonous gas, and together they are table salt.'},
    {'ask': 'What does the formula H₂O tell you?',
     'choices': ['Two hydrogen atoms joined to one oxygen atom',
                 'Two hydrogen and two oxygen atoms',
                 'One hydrogen and two oxygen atoms',
                 'Hydrogen and oxygen mixed together'],
     'answer': 'Two hydrogen atoms joined to one oxygen atom',
     'why': 'The small number applies to the symbol before it, and no number means one. So H₂O '
            'is two hydrogens and one oxygen.'},
    {'ask': 'Why can metals be bent and hammered into shape?',
     'choices': ['The layers of atoms can slide over each other',
                 'The atoms are very far apart',
                 'The bonds between atoms are weak',
                 'They are made of molecules'],
     'answer': 'The layers of atoms can slide over each other',
     'why': 'The bonding is not directional — a sea of shared electrons holds the whole lattice — so '
            'sliding a layer does not break anything. In an ionic lattice sliding puts like charges '
            'together, which is why salt shatters instead.'},
    {'ask': 'Which state of matter has particles that are close together but able to move past one '
            'another?',
     'choices': ['Liquid', 'Solid', 'Gas', 'None of them'],
     'answer': 'Liquid',
     'why': 'Solid: close and fixed in place. Liquid: close but free to move, which is why it flows '
            'and takes the shape of its container. Gas: far apart and moving fast in all directions.'},
])

quiz('Chemistry', 'Bonding & Structure', 'GCSE-F', [
    {'ask': 'What happens to electrons when an ionic bond forms?',
     'choices': ['They are transferred from the metal to the non-metal',
                 'They are shared between the two atoms',
                 'They are transferred from the non-metal to the metal',
                 'They are released into the air'],
     'answer': 'They are transferred from the metal to the non-metal',
     'why': 'The metal loses electrons to become a positive ion and the non-metal gains them to '
            'become negative. The bond itself is the electrostatic attraction between those opposite '
            'charges, in every direction — which is why it makes a giant lattice.'},
    {'ask': 'Why does sodium chloride conduct electricity when molten but not when solid?',
     'choices': ['The ions are free to move when molten',
                 'It gains electrons when it melts',
                 'It becomes a metal when molten',
                 'Heat carries the current'],
     'answer': 'The ions are free to move when molten',
     'why': 'Conducting needs charged particles that can MOVE. In a solid the ions are locked in the '
            'lattice; melting or dissolving frees them.'},
    {'ask': 'What type of bond holds the atoms together in a molecule of chlorine, Cl₂?',
     'answer': 'Covalent',
     'accept': 'covalent|covalent bond|a covalent bond|single covalent bond',
     'why': 'Two non-metals share a pair of electrons. Neither has anything to give to the other, so '
            'sharing is the only way both reach a full outer shell.'},
    {'ask': 'Why does simple molecular carbon dioxide have a low boiling point?',
     'choices': ['The forces between the molecules are weak',
                 'The covalent bonds inside the molecules are weak',
                 'It has no bonds at all',
                 'Its molecules are very heavy'],
     'answer': 'The forces between the molecules are weak',
     'why': 'Boiling separates molecules from one another — it does not break the covalent bonds '
            'inside them. The intermolecular forces are weak, so very little energy is needed.'},
    {'ask': 'Diamond and graphite are both made only of carbon. Why is graphite soft?',
     'choices': ['Its layers have no bonds between them and can slide',
                 'Its carbon atoms have weaker covalent bonds',
                 'It contains no covalent bonds',
                 'Its atoms are further apart'],
     'answer': 'Its layers have no bonds between them and can slide',
     'why': 'Each carbon in graphite bonds to three others, leaving one electron free — which is why '
            'graphite also conducts. Diamond bonds all four, in a rigid 3-D network, so it is hard '
            'and does not conduct.'},
])

quiz('Chemistry', 'Bonding & Structure', 'GCSE-H', [
    {'ask': 'What is the charge on an aluminium ion?',
     'choices': ['3+', '3−', '1+', '2+'],
     'answer': '3+',
     'why': 'Aluminium is in Group 3, so it loses three electrons to empty its outer shell. Losing '
            'negatives leaves a 3+ charge.'},
    {'ask': 'Why can graphene and fullerenes be useful in nanotechnology?',
     'choices': ['They have a very high surface area to volume ratio',
                 'They are extremely heavy',
                 'They melt at low temperatures',
                 'They are ionic'],
     'answer': 'They have a very high surface area to volume ratio',
     'why': 'A huge surface for very little material makes them good catalysts and good at carrying '
            'other molecules — drug delivery. It is also the property that makes their health effects '
            'uncertain.'},
    {'ask': 'How does a polymer differ from a simple molecular substance in its melting point?',
     'choices': ['Polymers melt higher, because the molecules are much larger',
                 'Polymers melt lower, because they are less dense',
                 'They melt at the same temperature',
                 'Polymers do not melt at all'],
     'answer': 'Polymers melt higher, because the molecules are much larger',
     'why': 'Intermolecular forces are weak per unit but there is far more of each molecule to '
            'attract, so the total is large. Polymers are still molecular, so they melt far below a '
            'giant covalent structure.'},
    {'ask': 'Give the formula of magnesium oxide, given Mg forms Mg²⁺ and O forms '
            'O²⁻.',
     'answer': 'MgO',
     'accept': 'mgo|mg0',
     'why': 'The charges are 2+ and 2−, so one of each cancels out. A compound must be neutral '
            'overall, which is the rule that sets every ionic formula.'},
    {'ask': 'Why is a metal a good conductor of electricity?',
     'choices': ['Delocalised electrons are free to move through the structure',
                 'The positive ions move through the metal',
                 'The atoms vibrate and pass the current on',
                 'The metal is a giant covalent structure'],
     'answer': 'Delocalised electrons are free to move through the structure',
     'why': 'The outer electrons leave their atoms and belong to the whole lattice. They can drift, '
            'which carries a current, and they can also carry energy, which is why metals conduct '
            'heat as well.'},
])

# ---------------------------------------------------------- Quantitative Chemistry

quiz('Chemistry', 'Quantitative Chemistry', 'KS3', [
    {'ask': 'In a sealed flask, 10 g of a chemical reacts with 15 g of another. What is the total '
            'mass at the end?',
     'choices': ['25 g', '15 g', '10 g', 'It cannot be known'],
     'answer': '25 g',
     'why': 'Mass is conserved: no atoms are created or destroyed, only rearranged. Sealing the '
            'flask is what makes it obvious — in an open one an escaping gas would look like lost '
            'mass.'},
    {'ask': 'What is the relative formula mass of water, H₂O? (H = 1, O = 16)',
     'choices': ['18', '17', '19', '34'],
     'answer': '18',
     'why': '(2×1) + 16 = 18. Add every atom in the formula, counting each one as many times as '
            'the formula says.'},
    {'ask': 'Why does the mass seem to go DOWN when magnesium burns in an open crucible and some '
            'smoke escapes?',
     'choices': ['Some of the product has escaped as a gas or smoke',
                 'Mass is destroyed when things burn',
                 'The magnesium evaporates',
                 'Oxygen has negative mass'],
     'answer': 'Some of the product has escaped as a gas or smoke',
     'why': 'Nothing is destroyed — it has left the container. Weigh everything, including the gases, '
            'and the totals match. The same explanation, in reverse, is why magnesium usually gains '
            'mass: it has taken in oxygen from the air.'},
    {'ask': 'How many atoms are in one molecule of CO₂?',
     'choices': ['3', '2', '4', '1'],
     'answer': '3',
     'why': 'One carbon and two oxygens. The small 2 applies only to the O immediately before it.'},
    {'ask': 'What does it mean to say an equation is balanced?',
     'choices': ['There are the same number of each type of atom on both sides',
                 'Both sides have the same number of molecules',
                 'The reaction goes both ways',
                 'The masses are written in grams'],
     'answer': 'There are the same number of each type of atom on both sides',
     'why': 'Balancing is conservation of mass written down. You may change the big numbers in front '
            'of a formula but never the small ones inside it, because that would change the '
            'substance.'},
])

quiz('Chemistry', 'Quantitative Chemistry', 'GCSE-F', [
    {'ask': 'What is the relative formula mass of calcium carbonate, CaCO₃? '
            '(Ca = 40, C = 12, O = 16)',
     'choices': ['100', '68', '84', '116'],
     'answer': '100',
     'why': '40 + 12 + (3×16) = 40 + 12 + 48 = 100. The commonest slip is forgetting that the '
            '3 multiplies only the oxygen.'},
    {'ask': 'How many moles are in 36 g of water? (Mᵣ of H₂O = 18)',
     'choices': ['2', '0.5', '18', '648'],
     'answer': '2',
     'why': 'Moles = mass ÷ Mᵣ = 36 ÷ 18 = 2. If the answer comes out enormous you have '
            'multiplied instead of divided.'},
    {'ask': 'What is the mass of 0.5 moles of sodium chloride? (Mᵣ of NaCl = 58.5)',
     'choices': ['29.25 g', '117 g', '58.5 g', '11.7 g'],
     'answer': '29.25 g',
     'why': 'Mass = moles × Mᵣ = 0.5 × 58.5 = 29.25 g. Half a mole is half the mass of '
            'one mole, which is a useful check.'},
    {'ask': 'What is the concentration, in g/dm³, of 20 g of solute in 0.5 dm³ of solution?',
     'choices': ['40 g/dm³', '10 g/dm³', '20 g/dm³', '0.025 g/dm³'],
     'answer': '40 g/dm³',
     'why': 'Concentration = mass ÷ volume = 20 ÷ 0.5 = 40. Halving the volume doubles the '
            'concentration, so an answer smaller than 20 is the wrong way up.'},
    {'ask': 'How many cm³ are there in 1 dm³?',
     'answer': '1000',
     'accept': '1000|1,000|one thousand|1000 cm3|1000cm3',
     'why': 'A dm³ is a cube 10 cm on each side, so 10×10×10 = 1000 cm³. It is '
            'also exactly one litre.'},
])

quiz('Chemistry', 'Quantitative Chemistry', 'GCSE-H', [
    {'ask': 'A reaction has a theoretical yield of 20 g but gives 15 g. What is the percentage yield?',
     'choices': ['75%', '80%', '133%', '5%'],
     'answer': '75%',
     'why': '15 ÷ 20 × 100 = 75%. Actual over theoretical, always — the other way up gives '
            'over 100%, which cannot happen.'},
    {'ask': 'Name one reason a reaction does not give a 100% yield.',
     'choices': ['The reaction is reversible, so it does not go to completion',
                 'Mass is destroyed during the reaction',
                 'The balanced equation is wrong',
                 'The reactants weigh more than the products'],
     'answer': 'The reaction is reversible, so it does not go to completion',
     'why': 'Three real reasons: the reaction is reversible, some product is lost on handling, or '
            'there are side reactions giving something else. None of them is mass disappearing.'},
    {'ask': 'In 2Mg + O₂ → 2MgO, how many moles of MgO are made from 0.4 moles of Mg?',
     'choices': ['0.4', '0.2', '0.8', '1.0'],
     'answer': '0.4',
     'why': 'The ratio of Mg to MgO in the equation is 2 : 2, which is 1 : 1 — so the moles of MgO '
            'equal the moles of Mg. Only the oxygen is in a different ratio.'},
    {'ask': 'What does "limiting reactant" mean?',
     'choices': ['The reactant that is completely used up, so it stops the reaction',
                 'The reactant present in the largest amount',
                 'The reactant with the highest relative formula mass',
                 'The reactant that is left over at the end'],
     'answer': 'The reactant that is completely used up, so it stops the reaction',
     'why': 'The one that runs out sets the amount of product, however much of the other you have. '
            'That is why the yield is always calculated from the limiting reactant and never from '
            'the one in excess.'},
    {'ask': 'What is atom economy a measure of?',
     'choices': ['The proportion of the reactant mass that ends up as the useful product',
                 'How fast a reaction goes',
                 'How much product you actually get compared with the theoretical maximum',
                 'The cost of the reactants'],
     'answer': 'The proportion of the reactant mass that ends up as the useful product',
     'why': 'Atom economy is about the EQUATION — how much of what you put in is, on paper, the thing '
            'you want. Percentage yield is about the reaction as it actually ran. A reaction can have '
            'a perfect yield and a terrible atom economy.'},
])

# ------------------------------------------------------------- Chemical Changes

quiz('Chemistry', 'Chemical Changes', 'KS3', [
    {'ask': 'What colour does universal indicator turn in a strong acid?',
     'choices': ['Red', 'Blue', 'Green', 'Purple'],
     'answer': 'Red',
     'why': 'Red is strongly acidic, green is neutral at pH 7, and blue to purple is alkaline. The '
            'scale runs 0 to 14.'},
    {'ask': 'Acid + alkali → salt + ?',
     'answer': 'Water',
     'accept': 'water|h2o|water only',
     'why': 'That is neutralisation. The H⁺ from the acid and the OH⁻ from the alkali join '
            'to make water, which is why the pH moves towards 7.'},
    {'ask': 'Which gas is given off when a metal reacts with an acid?',
     'choices': ['Hydrogen', 'Oxygen', 'Carbon dioxide', 'Nitrogen'],
     'answer': 'Hydrogen',
     'why': 'Metal + acid → salt + hydrogen. The test is a lit splint, which gives a squeaky '
            'pop. A carbonate plus an acid gives carbon dioxide instead, which puts a splint out.'},
    {'ask': 'Which of these is a sign that a chemical reaction has happened?',
     'choices': ['A new substance is formed that cannot easily be changed back',
                 'The substance changes shape',
                 'The substance is warmed up',
                 'The substance dissolves'],
     'answer': 'A new substance is formed that cannot easily be changed back',
     'why': 'Melting, dissolving and changing shape are physical changes — reversible, no new '
            'substance. A chemical change makes something different, usually with a temperature '
            'change, a gas, a colour change or a precipitate as the clue.'},
    {'ask': 'Which metal is MORE reactive than the others?',
     'choices': ['Magnesium', 'Copper', 'Silver', 'Gold'],
     'answer': 'Magnesium',
     'why': 'The reactivity series runs potassium, sodium, calcium, magnesium, aluminium, zinc, '
            'iron, copper, silver, gold. Copper, silver and gold are so unreactive that gold is '
            'found as the metal itself.'},
])

quiz('Chemistry', 'Chemical Changes', 'GCSE-F', [
    {'ask': 'What is oxidation in terms of electrons?',
     'choices': ['Loss of electrons', 'Gain of electrons',
                 'Loss of protons', 'Gain of oxygen only'],
     'answer': 'Loss of electrons',
     'why': 'OIL RIG — Oxidation Is Loss, Reduction Is Gain. Gaining oxygen is also oxidation, but '
            'the electron definition is the one that covers every case.'},
    {'ask': 'A more reactive metal will displace a less reactive one from its compound. What happens '
            'if iron is put into copper sulfate solution?',
     'choices': ['Copper is displaced and the blue solution fades',
                 'Nothing happens',
                 'Iron is displaced',
                 'The solution turns bright blue'],
     'answer': 'Copper is displaced and the blue solution fades',
     'why': 'Iron is above copper, so it takes the sulfate and pushes the copper out as metal. The '
            'blue colour is the copper ions in solution, so it fades as they leave.'},
    {'ask': 'Name the salt made from hydrochloric acid and sodium hydroxide.',
     'answer': 'Sodium chloride',
     'accept': 'sodium chloride|nacl|salt sodium chloride',
     'why': 'The metal comes from the alkali and the rest of the name from the acid: hydrochloric '
            'gives chlorides, sulfuric gives sulfates, nitric gives nitrates.'},
    {'ask': 'What is produced at the negative electrode during electrolysis of a molten ionic '
            'compound?',
     'choices': ['The metal', 'The non-metal', 'Water', 'Oxygen always'],
     'answer': 'The metal',
     'why': 'Positive ions are attracted to the negative electrode — and metals form positive ions. '
            'Opposites attract is the whole rule.'},
    {'ask': 'Why is aluminium extracted by electrolysis rather than by heating with carbon?',
     'choices': ['Aluminium is more reactive than carbon',
                 'Aluminium oxide does not melt',
                 'Carbon is too expensive',
                 'Aluminium is found as the pure metal'],
     'answer': 'Aluminium is more reactive than carbon',
     'why': 'Carbon can only displace a metal below it in the reactivity series. Iron is below '
            'carbon, so a blast furnace works; aluminium is above, so it will not let go of its '
            'oxygen and electrolysis is the only route.'},
])

quiz('Chemistry', 'Chemical Changes', 'GCSE-H', [
    {'ask': 'Write the half equation for what happens to a chloride ion at the positive electrode.',
     'choices': ['2Cl⁻ → Cl₂ + 2e⁻', 'Cl⁻ + e⁻ → Cl',
                 'Cl₂ + 2e⁻ → 2Cl⁻', '2Cl⁻ + 2e⁻ → Cl₂'],
     'answer': '2Cl⁻ → Cl₂ + 2e⁻',
     'why': 'At the positive electrode negative ions LOSE electrons — oxidation — so the electrons '
            'go on the right. Two ions are needed to make one Cl₂ molecule.'},
    {'ask': 'In the electrolysis of copper sulfate solution with inert electrodes, what is given off '
            'at the positive electrode?',
     'choices': ['Oxygen', 'Hydrogen', 'Copper', 'Sulfur'],
     'answer': 'Oxygen',
     'why': 'With no halide present, the OH⁻ from the water is discharged instead, giving '
            'oxygen. Copper is less reactive than hydrogen, so at the negative electrode it is the '
            'copper that is deposited rather than hydrogen.'},
    {'ask': 'What is the difference between a strong acid and a concentrated acid?',
     'choices': ['Strong means fully ionised; concentrated means a lot of acid per dm³',
                 'They mean the same thing',
                 'Strong means a lot of acid per dm³; concentrated means fully ionised',
                 'Strong acids have a higher pH'],
     'answer': 'Strong means fully ionised; concentrated means a lot of acid per dm³',
     'why': 'A dilute strong acid and a concentrated weak acid are both perfectly possible. Strength '
            'is about what proportion of the molecules split into ions; concentration is about how '
            'many there are.'},
    {'ask': 'The pH of a solution falls from 5 to 2. The hydrogen ion concentration has...',
     'choices': ['increased 1000 times', 'increased 3 times',
                 'decreased 1000 times', 'decreased 3 times'],
     'answer': 'increased 1000 times',
     'why': 'The pH scale is logarithmic — each whole unit is a factor of ten. Three units down is '
            '10³, so a thousandfold rise in H⁺.'},
    {'ask': 'In a titration, why is the conical flask swirled during the addition?',
     'choices': ['To mix the solutions so the end point is not missed',
                 'To keep the solution cool',
                 'To stop the burette leaking',
                 'To add oxygen to the reaction'],
     'answer': 'To mix the solutions so the end point is not missed',
     'why': 'Unmixed, a patch of unreacted acid can sit at the bottom and the indicator changes late '
            '— so the titre reads high. Adding dropwise near the end point is the other half of the '
            'same care.'},
])

# ---------------------------------------------------------------- Energy Changes

quiz('Chemistry', 'Energy Changes', 'KS3', [
    {'ask': 'A reaction makes the test tube feel hot. What kind of reaction is it?',
     'choices': ['Exothermic', 'Endothermic', 'Reversible', 'Neutral'],
     'answer': 'Exothermic',
     'why': 'Exo means out — energy leaves the reaction and warms the surroundings, which is what '
            'your hand feels. Endothermic takes energy in, so it feels cold.'},
    {'ask': 'Which of these is an exothermic process?',
     'choices': ['Burning fuel', 'Melting ice',
                 'Photosynthesis', 'Thermal decomposition'],
     'answer': 'Burning fuel',
     'why': 'Combustion releases energy — that is the point of a fuel. Melting, photosynthesis and '
            'thermal decomposition all need energy putting in.'},
    {'ask': 'Name one everyday use of an exothermic reaction.',
     'answer': 'Hand warmer',
     'accept': 'hand warmer|hand warmers|handwarmer|self heating can|self-heating can|burning fuel|'
               'combustion|fuel|heating|burning|a fire|fire|central heating',
     'why': 'Hand warmers and self-heating cans use an exothermic reaction deliberately. Sports '
            'injury packs use the opposite — an endothermic one that draws heat out.'},
    {'ask': 'What happens to the temperature of the surroundings during an endothermic reaction?',
     'choices': ['It falls', 'It rises', 'It stays the same', 'It rises then falls'],
     'answer': 'It falls',
     'why': 'The reaction takes energy IN from the surroundings, so the surroundings lose it. That is '
            'why an endothermic mixture feels cold.'},
    {'ask': 'Why does a fire need energy to start even though burning gives out energy?',
     'choices': ['Energy is needed first to break the bonds in the fuel',
                 'Fires only release energy after ten minutes',
                 'The match adds fuel',
                 'Oxygen has to be heated to react'],
     'answer': 'Energy is needed first to break the bonds in the fuel',
     'why': 'Breaking bonds always takes energy in; making them always gives energy out. A fire has '
            'to be started because the breaking comes first — after that, the energy released keeps '
            'it going.'},
])

quiz('Chemistry', 'Energy Changes', 'GCSE-F', [
    {'ask': 'On a reaction profile for an exothermic reaction, where are the products?',
     'choices': ['Lower than the reactants', 'Higher than the reactants',
                 'At the same level as the reactants', 'At the top of the curve'],
     'answer': 'Lower than the reactants',
     'why': 'The drop IS the energy released. Endothermic profiles go up, because energy has been '
            'taken in and stored in the products.'},
    {'ask': 'What is activation energy?',
     'choices': ['The minimum energy needed for particles to react when they collide',
                 'The energy released by a reaction',
                 'The energy stored in the products',
                 'The difference between reactants and products'],
     'answer': 'The minimum energy needed for particles to react when they collide',
     'why': 'It is the hump on the profile. A collision with less than that just bounces — which is '
            'why raising the temperature speeds a reaction up, since more particles clear the hump.'},
    {'ask': 'Breaking bonds is...',
     'choices': ['endothermic', 'exothermic', 'neither', 'always exothermic in fuels'],
     'answer': 'endothermic',
     'why': 'Breaking takes energy in; making gives energy out. Whether the whole reaction is exo or '
            'endo depends on which of the two is bigger.'},
    {'ask': 'A reaction releases more energy making bonds than it takes breaking them. The reaction '
            'is...',
     'choices': ['exothermic', 'endothermic', 'at equilibrium', 'impossible'],
     'answer': 'exothermic',
     'why': 'More out than in means the surplus leaves as heat. That is the bond-energy way of '
            'saying what the profile shows by going downhill.'},
    {'ask': 'Name one use of an endothermic reaction.',
     'answer': 'Sports injury cold pack',
     'accept': 'cold pack|sports injury pack|instant cold pack|ice pack|cooling pack|'
               'sports injury cold pack|chemical cold pack|cooling an injury',
     'why': 'A cold pack uses an endothermic process to take heat out of an injury. It is the exact '
            'mirror of a hand warmer.'},
])

quiz('Chemistry', 'Energy Changes', 'GCSE-H', [
    {'ask': 'Bond energies: breaking takes 2500 kJ, making releases 2800 kJ. What is the overall '
            'energy change?',
     'choices': ['−300 kJ, exothermic', '+300 kJ, endothermic',
                 '−300 kJ, endothermic', '+5300 kJ, exothermic'],
     'answer': '−300 kJ, exothermic',
     'why': 'Energy change = bonds broken − bonds made = 2500 − 2800 = −300 kJ. A '
            'negative answer means energy left the reaction, so it is exothermic — the sign is the '
            'answer to the second half of the question.'},
    {'ask': 'In a chemical cell, what determines the size of the voltage produced?',
     'choices': ['The difference in reactivity between the two metals',
                 'The size of the electrodes',
                 'The colour of the electrolyte',
                 'The temperature of the room only'],
     'answer': 'The difference in reactivity between the two metals',
     'why': 'The further apart the two metals are in the reactivity series, the bigger the potential '
            'difference. Two of the same metal gives no voltage at all.'},
    {'ask': 'What is an advantage of a hydrogen fuel cell over a rechargeable battery?',
     'choices': ['It does not run down or need recharging while fuel is supplied',
                 'It produces no water',
                 'Hydrogen is easy to store',
                 'It works without oxygen'],
     'answer': 'It does not run down or need recharging while fuel is supplied',
     'why': 'A fuel cell keeps going as long as hydrogen and oxygen arrive, and the only product is '
            'water. The real problems are storing hydrogen safely and making it without using '
            'fossil fuels.'},
    {'ask': 'What is the overall reaction in a hydrogen fuel cell?',
     'choices': ['2H₂ + O₂ → 2H₂O', 'H₂ + O₂ → H₂O₂',
                 '2H₂O → 2H₂ + O₂', 'H₂ + O → H₂O'],
     'answer': '2H₂ + O₂ → 2H₂O',
     'why': 'Hydrogen is oxidised to water, and the energy released drives the current. It is '
            'combustion with the energy taken as electricity rather than as heat.'},
    {'ask': 'Why does a reaction profile for a catalysed reaction have a lower hump?',
     'choices': ['The catalyst provides a different route with a lower activation energy',
                 'The catalyst releases energy into the reaction',
                 'The catalyst lowers the energy of the products',
                 'The catalyst removes some of the reactants'],
     'answer': 'The catalyst provides a different route with a lower activation energy',
     'why': 'The reactants and products sit exactly where they did — the overall energy change is '
            'unchanged. Only the path between them is easier, so more collisions succeed.'},
])

# -------------------------------------------------------------- Rate of Reaction

quiz('Chemistry', 'Rate of Reaction', 'KS3', [
    {'ask': 'Which of these makes a reaction go faster?',
     'choices': ['Raising the temperature', 'Using larger lumps',
                 'Using a more dilute acid', 'Cooling the mixture'],
     'answer': 'Raising the temperature',
     'why': 'Hotter particles move faster, so they collide more often and harder. The other three all '
            'slow a reaction down.'},
    {'ask': 'Why does powdered chalk react faster with acid than a single lump?',
     'choices': ['The powder has a larger surface area', 'The powder is heavier',
                 'The powder is a different chemical', 'Powder dissolves the acid'],
     'answer': 'The powder has a larger surface area',
     'why': 'A reaction can only happen where the two substances touch. Grinding a lump up exposes '
            'the inside, so far more particles are available to collide at once.'},
    {'ask': 'What is a catalyst?',
     'choices': ['A substance that speeds up a reaction without being used up',
                 'A substance that slows a reaction down',
                 'A substance that is used up in a reaction',
                 'A type of acid'],
     'answer': 'A substance that speeds up a reaction without being used up',
     'why': 'Because it is not used up, a tiny amount works over and over — which is why catalysts '
            'are worth their cost in industry.'},
    {'ask': 'How could you measure how fast a reaction that gives off a gas is going?',
     'choices': ['Measure the volume of gas collected each minute',
                 'Measure the colour of the liquid',
                 'Measure the temperature of the room',
                 'Count the bubbles that burst'],
     'answer': 'Measure the volume of gas collected each minute',
     'why': 'Rate is an amount per unit time, so you need a quantity you can measure repeatedly. Gas '
            'volume in a syringe, or mass lost on a balance, both work.'},
    {'ask': 'Two reactions produce the same amount of gas. One finishes in 20 s and one in 60 s. '
            'Which is faster?',
     'choices': ['The 20 s one', 'The 60 s one',
                 'They are the same speed', 'It cannot be known'],
     'answer': 'The 20 s one',
     'why': 'Same amount, less time, so more per second. A steeper line on a graph of gas against '
            'time means exactly this.'},
])

quiz('Chemistry', 'Rate of Reaction', 'GCSE-F', [
    {'ask': 'According to collision theory, a reaction happens when particles...',
     'choices': ['collide with at least the activation energy',
                 'collide at any speed',
                 'are heated above 100 °C',
                 'are in the same state of matter'],
     'answer': 'collide with at least the activation energy',
     'why': 'Both halves matter — they must meet AND meet hard enough. Every factor that speeds a '
            'reaction up works by changing the frequency of collisions, their energy, or both.'},
    {'ask': '48 cm³ of gas is produced in 60 seconds. What is the mean rate?',
     'choices': ['0.8 cm³/s', '1.25 cm³/s', '8 cm³/s', '2880 cm³/s'],
     'answer': '0.8 cm³/s',
     'why': '48 ÷ 60 = 0.8. Rate is always amount ÷ time — dividing the other way gives '
            'seconds per cm³, which is a different quantity.'},
    {'ask': 'On a graph of gas volume against time, what does the line doing when the reaction has '
            'finished?',
     'choices': ['It becomes horizontal', 'It becomes steeper',
                 'It goes downwards', 'It stops being drawn'],
     'answer': 'It becomes horizontal',
     'why': 'No more gas is being made, so the volume stops changing. The steepest part is at the '
            'start, where the reactants are most concentrated.'},
    {'ask': 'Increasing the concentration of a solution speeds up a reaction because...',
     'choices': ['there are more particles in the same volume, so collisions are more frequent',
                 'the particles move faster',
                 'the activation energy is lowered',
                 'the particles are bigger'],
     'answer': 'there are more particles in the same volume, so collisions are more frequent',
     'why': 'Concentration changes how CROWDED it is, not how fast the particles move. Temperature is '
            'the one that changes speed — and it raises both frequency and energy, which is why it '
            'has such a large effect.'},
    {'ask': 'In the reaction of sodium thiosulfate with acid, what is observed?',
     'choices': ['The solution turns cloudy as sulfur is formed',
                 'A gas is given off and the mixture fizzes',
                 'The solution turns bright blue',
                 'A metal is deposited'],
     'answer': 'The solution turns cloudy as sulfur is formed',
     'why': 'Timing how long a cross beneath the flask takes to disappear is the classic rate '
            'experiment — the cloudiness is a precipitate of sulfur, so the time is a measure of '
            'the rate.'},
])

quiz('Chemistry', 'Rate of Reaction', 'GCSE-H', [
    {'ask': 'How do you find the rate at a particular moment from a curved rate graph?',
     'choices': ['Draw a tangent at that point and find its gradient',
                 'Divide the final volume by the final time',
                 'Measure the height of the curve at that point',
                 'Find the area under the curve'],
     'answer': 'Draw a tangent at that point and find its gradient',
     'why': 'The mean rate is the overall gradient; the rate AT a moment is the gradient of the '
            'curve there, which is what a tangent measures. On a curve those two are different '
            'numbers.'},
    {'ask': 'What does Le Chatelier’s principle say happens if the pressure is increased on a '
            'gaseous equilibrium?',
     'choices': ['The position shifts towards the side with fewer molecules of gas',
                 'The position shifts towards the side with more molecules of gas',
                 'The equilibrium is unaffected by pressure',
                 'Both forward and backward reactions stop'],
     'answer': 'The position shifts towards the side with fewer molecules of gas',
     'why': 'The system opposes the change, and making fewer gas molecules lowers the pressure again. '
            'If both sides have equal numbers of gas molecules, pressure changes nothing.'},
    {'ask': 'A forward reaction is exothermic. What happens to the yield if the temperature is '
            'raised?',
     'choices': ['It decreases, because the equilibrium shifts in the endothermic direction',
                 'It increases, because the reaction goes faster',
                 'It stays the same',
                 'It increases, because heat favours exothermic reactions'],
     'answer': 'It decreases, because the equilibrium shifts in the endothermic direction',
     'why': 'The system opposes the rise by absorbing energy, which means going backwards. Note the '
            'trap: the reaction gets FASTER and the YIELD gets smaller — rate and yield are two '
            'different questions.'},
    {'ask': 'What does it mean to say a reaction is at dynamic equilibrium?',
     'choices': ['Both reactions are still happening, at the same rate',
                 'Both reactions have stopped',
                 'The amounts of reactant and product are equal',
                 'The forward reaction has finished'],
     'answer': 'Both reactions are still happening, at the same rate',
     'why': 'Dynamic means nothing has stopped — molecules are converting in both directions '
            'constantly, and the concentrations hold steady because the two rates match. It does '
            'not mean equal amounts.'},
    {'ask': 'Why does a catalyst not change the position of an equilibrium?',
     'choices': ['It speeds up the forward and backward reactions equally',
                 'It is used up before equilibrium is reached',
                 'It only works on the forward reaction',
                 'It changes the activation energy of only one direction'],
     'answer': 'It speeds up the forward and backward reactions equally',
     'why': 'The lower-energy route works in both directions, so equilibrium arrives sooner and in '
            'exactly the same place. A catalyst buys time, not yield.'},
])

# ------------------------------------------------------------- Chemical Analysis

quiz('Chemistry', 'Chemical Analysis', 'KS3', [
    {'ask': 'What is a pure substance?',
     'choices': ['A single element or compound, not mixed with anything else',
                 'Anything that is safe to drink',
                 'A substance that dissolves in water',
                 'Anything found in nature'],
     'answer': 'A single element or compound, not mixed with anything else',
     'why': 'Chemistry uses pure in a stricter sense than a label on a bottle does. Pure orange '
            'juice is a mixture; pure water is one compound and nothing else.'},
    {'ask': 'In chromatography, what happens to the substance that is MOST attracted to the paper?',
     'choices': ['It travels the shortest distance', 'It travels the furthest',
                 'It stays dissolved in the solvent', 'It does not move at all'],
     'answer': 'It travels the shortest distance',
     'why': 'A substance is pulled two ways — the solvent carries it up, the paper holds it back. '
            'The more the paper wins, the less far it goes.'},
    {'ask': 'Why is the starting line in chromatography drawn in pencil?',
     'choices': ['Pencil does not dissolve in the solvent',
                 'Pencil is easier to see',
                 'Pen is too thick',
                 'Pencil makes the paper absorb faster'],
     'answer': 'Pencil does not dissolve in the solvent',
     'why': 'An ink line would run up the paper with the samples and separate into its own spots, '
            'which is exactly what the experiment is trying to measure elsewhere.'},
    {'ask': 'A substance melts sharply at exactly 80 °C. What does that suggest?',
     'choices': ['It is pure', 'It is a mixture',
                 'It is a metal', 'It contains water'],
     'answer': 'It is pure',
     'why': 'A pure substance melts and boils at a fixed temperature. A mixture melts over a range '
            'and usually lower than the pure substance — which is why salt on a road stops ice '
            'forming.'},
    {'ask': 'How would you test for carbon dioxide?',
     'choices': ['Bubble it through limewater and see if it turns cloudy',
                 'Put a lit splint in it',
                 'Hold damp litmus paper in it',
                 'See if it relights a glowing splint'],
     'answer': 'Bubble it through limewater and see if it turns cloudy',
     'why': 'Limewater is calcium hydroxide solution; CO₂ makes insoluble calcium carbonate, '
            'which is the cloudiness. The other three are the tests for hydrogen, chlorine and '
            'oxygen.'},
])

quiz('Chemistry', 'Chemical Analysis', 'GCSE-F', [
    {'ask': 'What is the test for oxygen?',
     'choices': ['It relights a glowing splint', 'It gives a squeaky pop with a lit splint',
                 'It turns limewater cloudy', 'It bleaches damp litmus paper'],
     'answer': 'It relights a glowing splint',
     'why': 'A glowing splint has stopped flaming but is still hot; extra oxygen is enough to '
            'restart it. Hydrogen is the squeaky pop, CO₂ the limewater, chlorine the bleaching.'},
    {'ask': 'A spot travels 4 cm and the solvent front travels 8 cm. What is the Rₑ value?',
     'choices': ['0.5', '2', '4', '32'],
     'answer': '0.5',
     'why': 'Rₑ = distance moved by the spot ÷ distance moved by the solvent = 4 ÷ 8 = '
            '0.5. It is always between 0 and 1, so an answer above 1 is the division the wrong way '
            'up.'},
    {'ask': 'Why can Rₑ values identify a substance?',
     'choices': ['For a given solvent and paper, a substance always gives the same value',
                 'Every substance has an Rₑ of exactly 1',
                 'Rₑ depends only on the colour',
                 'Rₑ is the same in every solvent'],
     'answer': 'For a given solvent and paper, a substance always gives the same value',
     'why': 'The conditions are part of the measurement — change the solvent and the values all '
            'change, which is why a reference sample is run on the same paper.'},
    {'ask': 'What colour flame does sodium give in a flame test?',
     'choices': ['Yellow', 'Lilac', 'Crimson', 'Green'],
     'answer': 'Yellow',
     'why': 'Lithium crimson, sodium yellow, potassium lilac, calcium orange-red, copper green. '
            'Sodium is so bright it can mask the others, which is a real limitation of the test.'},
    {'ask': 'A chromatogram of ink shows four spots. Is the ink pure?',
     'choices': ['No, it is a mixture of at least four substances',
                 'Yes, pure substances give several spots',
                 'It cannot be told from a chromatogram',
                 'Yes, provided the spots are the same colour'],
     'answer': 'No, it is a mixture of at least four substances',
     'why': 'One spot means one substance. Four spots is four things travelling at four different '
            'rates — and it is at least four, because two substances can share an Rₑ value.'},
])

quiz('Chemistry', 'Chemical Analysis', 'GCSE-H', [
    {'ask': 'How do you test for a carbonate ion?',
     'choices': ['Add dilute acid and test the gas with limewater',
                 'Add sodium hydroxide and warm it',
                 'Add silver nitrate and dilute nitric acid',
                 'Add barium chloride and dilute hydrochloric acid'],
     'answer': 'Add dilute acid and test the gas with limewater',
     'why': 'Carbonates fizz with acid, giving CO₂, which turns limewater cloudy. The other '
            'three are the tests for ammonium, halides and sulfates.'},
    {'ask': 'Silver nitrate solution is added to a halide. A cream precipitate forms. Which halide is it?',
     'choices': ['Bromide', 'Chloride', 'Iodide', 'Fluoride'],
     'answer': 'Bromide',
     'why': 'Chloride is white, bromide cream, iodide yellow — three shades that darken down the '
            'group. Dilute nitric acid is added first to remove carbonates, which would give their '
            'own precipitate.'},
    {'ask': 'A white precipitate forms with barium chloride and dilute hydrochloric acid. Which ion '
            'is present?',
     'choices': ['Sulfate', 'Carbonate', 'Chloride', 'Nitrate'],
     'answer': 'Sulfate',
     'why': 'Barium sulfate is insoluble, so it drops out as a white solid. The acid is there to '
            'remove any carbonate first, which would otherwise give a white precipitate too.'},
    {'ask': 'Give one advantage of instrumental methods such as flame emission spectroscopy.',
     'choices': ['They are accurate, sensitive and rapid, and work on tiny samples',
                 'They need no electricity',
                 'They are cheaper than a flame test',
                 'They do not need a reference sample'],
     'answer': 'They are accurate, sensitive and rapid, and work on tiny samples',
     'why': 'They also identify several ions in one mixture, which a flame test cannot — sodium '
            'swamps everything. The cost is expensive equipment and trained operators.'},
    {'ask': 'Sodium hydroxide is added to a solution and a blue precipitate forms. Which metal ion '
            'is present?',
     'choices': ['Copper(II)', 'Iron(II)', 'Iron(III)', 'Calcium'],
     'answer': 'Copper(II)',
     'why': 'Copper(II) blue, iron(II) green, iron(III) brown, and calcium, magnesium and '
            'aluminium all white — with aluminium alone redissolving in excess sodium hydroxide, '
            'which is how it is told from the other two.'},
])

# ----------------------------------------------------------- Separating Mixtures

quiz('Chemistry', 'Separating Mixtures', 'KS3', [
    {'ask': 'Which method separates sand from water?',
     'choices': ['Filtration', 'Distillation', 'Chromatography', 'Evaporation'],
     'answer': 'Filtration',
     'why': 'Sand is insoluble, so its particles are too big to pass through the filter paper while '
            'water molecules go straight through. Filtration only works on something undissolved.'},
    {'ask': 'How would you get salt back from salty water?',
     'choices': ['Evaporate the water', 'Filter it',
                 'Use a magnet', 'Add more water'],
     'answer': 'Evaporate the water',
     'why': 'Dissolved salt passes through a filter with the water, so filtering does nothing. '
            'Evaporating drives the water off and leaves the salt behind as crystals.'},
    {'ask': 'What is the residue in filtration?',
     'choices': ['The solid left in the filter paper', 'The liquid that passes through',
                 'The dissolved substance', 'The filter paper itself'],
     'answer': 'The solid left in the filter paper',
     'why': 'Residue stays, filtrate passes through. Which one you want decides whether you keep the '
            'paper or the beaker.'},
    {'ask': 'Distillation separates two liquids using a difference in what?',
     'answer': 'Boiling point',
     'accept': 'boiling point|boiling points|boiling temperature|their boiling points|bp',
     'why': 'The one with the lower boiling point turns to vapour first, travels to the condenser and '
            'is collected. Filtration and chromatography use different properties entirely.'},
    {'ask': 'What is a solvent?',
     'choices': ['The liquid a substance dissolves in', 'The substance that dissolves',
                 'A mixture of a solid and a liquid', 'A solid that will not dissolve'],
     'answer': 'The liquid a substance dissolves in',
     'why': 'Solute dissolves in solvent to make a solution. In salty water the salt is the solute '
            'and the water is the solvent.'},
])

quiz('Chemistry', 'Separating Mixtures', 'GCSE-F', [
    {'ask': 'Why is crystallisation better than simple evaporation for getting pure crystals?',
     'choices': ['Slow cooling lets larger, purer crystals form',
                 'It works faster',
                 'It needs no heat at all',
                 'It removes insoluble impurities'],
     'answer': 'Slow cooling lets larger, purer crystals form',
     'why': 'Evaporating to dryness traps impurities in the solid. Heating to saturation and then '
            'cooling slowly gives the crystals time to form in an orderly way, leaving impurities '
            'in the remaining liquid.'},
    {'ask': 'In fractional distillation of a liquid mixture, what comes off first?',
     'choices': ['The liquid with the lowest boiling point',
                 'The liquid with the highest boiling point',
                 'The densest liquid', 'The liquid present in the greatest amount'],
     'answer': 'The liquid with the lowest boiling point',
     'why': 'It vaporises at the lowest temperature, so as the mixture is heated it leaves first. '
            'The fractionating column lets the higher-boiling vapours condense and fall back.'},
    {'ask': 'Which separation method would you use for a mixture of coloured dyes?',
     'choices': ['Chromatography', 'Filtration', 'Distillation', 'Crystallisation'],
     'answer': 'Chromatography',
     'why': 'The dyes are all dissolved, so filtration cannot touch them, and their boiling points '
            'are too close for distillation. Chromatography separates them on how strongly each is '
            'attracted to the paper.'},
    {'ask': 'In distillation, what is the purpose of the condenser?',
     'choices': ['To cool the vapour back into a liquid', 'To heat the mixture',
                 'To filter out solids', 'To measure the boiling point'],
     'answer': 'To cool the vapour back into a liquid',
     'why': 'Cold water runs through the outer jacket — in at the bottom, out at the top, so the '
            'jacket stays full. Without it the vapour escapes and nothing is collected.'},
    {'ask': 'How could you separate iron filings from sand?',
     'answer': 'Use a magnet',
     'accept': 'magnet|use a magnet|with a magnet|magnetism|a magnet',
     'why': 'Iron is magnetic and sand is not, so one property separates them without any chemistry '
            'at all. Choosing the method means finding the property that differs.'},
])

quiz('Chemistry', 'Separating Mixtures', 'GCSE-H', [
    {'ask': 'Why can fractional distillation separate liquids with very similar boiling points when '
            'simple distillation cannot?',
     'choices': ['The column gives repeated evaporation and condensation up its length',
                 'The column is heated more strongly',
                 'The column removes the solvent',
                 'The column filters the vapour'],
     'answer': 'The column gives repeated evaporation and condensation up its length',
     'why': 'Each cycle enriches the vapour a little in the more volatile component. A tall column '
            'is many small separations stacked, which is what makes a fine difference workable.'},
    {'ask': 'In the distillation of sea water, where should the thermometer bulb be placed?',
     'choices': ['At the entrance to the condenser',
                 'In the liquid being heated',
                 'Inside the collecting flask',
                 'Touching the bottom of the flask'],
     'answer': 'At the entrance to the condenser',
     'why': 'You are measuring the temperature of the VAPOUR leaving, because that is what is being '
            'collected. In the liquid it reads the mixture, which is not the same thing.'},
    {'ask': 'A solution is filtered, then the filtrate is crystallised. What has been separated?',
     'choices': ['An insoluble solid first, then the dissolved solid from the solvent',
                 'Two dissolved solids from each other',
                 'Two liquids from each other',
                 'A gas from a liquid'],
     'answer': 'An insoluble solid first, then the dissolved solid from the solvent',
     'why': 'Filtration only removes what is undissolved, so anything in solution passes through and '
            'has to be dealt with separately. Two steps, two different properties.'},
    {'ask': 'Why is paper chromatography described as having a stationary and a mobile phase?',
     'choices': ['The paper stays still while the solvent moves through it',
                 'The spots stay still while the paper moves',
                 'The paper moves while the solvent stays still',
                 'Both phases move at the same speed'],
     'answer': 'The paper stays still while the solvent moves through it',
     'why': 'Separation comes from how each substance divides between the two — held by the '
            'stationary phase or carried by the mobile one. That balance is what the Rₑ value '
            'measures.'},
    {'ask': 'Potable water is not pure water. Why not?',
     'choices': ['It still contains dissolved salts and other substances at safe levels',
                 'It contains bacteria',
                 'It has been distilled',
                 'It contains no oxygen'],
     'answer': 'It still contains dissolved salts and other substances at safe levels',
     'why': 'Potable means safe to drink, which is a standard about harm. Pure means one substance '
            'only — and distilled water, which is pure, tastes flat and is not what anybody supplies.'},
])

# ------------------------------------------------------------- Organic Chemistry

quiz('Chemistry', 'Organic Chemistry', 'KS3', [
    {'ask': 'What is crude oil mainly made of?',
     'choices': ['Hydrocarbons', 'Metals', 'Salts', 'Carbohydrates'],
     'answer': 'Hydrocarbons',
     'why': 'A hydrocarbon contains hydrogen and carbon only. Crude oil is a mixture of thousands of '
            'them, formed from the remains of ancient plankton.'},
    {'ask': 'Crude oil is a...',
     'choices': ['finite resource', 'renewable resource',
                 'pure substance', 'metal ore'],
     'answer': 'finite resource',
     'why': 'It takes millions of years to form, so it is being used far faster than it is made. '
            'Finite is the reason for both the price and the search for alternatives.'},
    {'ask': 'Which gas is produced when a hydrocarbon burns completely?',
     'choices': ['Carbon dioxide and water vapour', 'Carbon monoxide only',
                 'Hydrogen only', 'Nitrogen'],
     'answer': 'Carbon dioxide and water vapour',
     'why': 'Complete combustion oxidises every carbon to CO₂ and every hydrogen to H₂O. '
            'With too little oxygen you get carbon monoxide and soot instead.'},
    {'ask': 'What is the name for the process that separates crude oil into fractions?',
     'answer': 'Fractional distillation',
     'accept': 'fractional distillation|fractional distilation|distillation|fractionation',
     'why': 'Different hydrocarbons have different boiling points, so they condense at different '
            'heights up the column — shorter chains near the cool top, longer ones at the hot bottom.'},
    {'ask': 'Why is carbon monoxide dangerous?',
     'choices': ['It is toxic and cannot be seen or smelled',
                 'It burns explosively',
                 'It turns the air acidic',
                 'It damages the ozone layer'],
     'answer': 'It is toxic and cannot be seen or smelled',
     'why': 'It binds to haemoglobin better than oxygen does, so the blood stops carrying oxygen. '
            'Having no colour and no smell is what makes it a killer rather than a hazard.'},
])

quiz('Chemistry', 'Organic Chemistry', 'GCSE-F', [
    {'ask': 'What is the general formula of an alkane?',
     'choices': ['CₙH₂ₙ₊₂', 'CₙH₂ₙ',
                 'CₙHₙ', 'CₙH₂ₙ₋₂'],
     'answer': 'CₙH₂ₙ₊₂',
     'why': 'Alkanes are saturated — single bonds only — so each carbon carries as many hydrogens as '
            'it can. CₙH₂ₙ is the alkene formula, which is two hydrogens short '
            'because of the double bond.'},
    {'ask': 'How many carbon atoms does propane have?',
     'choices': ['3', '2', '4', '1'],
     'answer': '3',
     'why': 'Meth 1, eth 2, prop 3, but 4. The prefix names the chain length, and the ending says '
            'which family.'},
    {'ask': 'What is the test for an alkene?',
     'choices': ['It turns bromine water from orange to colourless',
                 'It turns limewater cloudy',
                 'It gives a squeaky pop',
                 'It relights a glowing splint'],
     'answer': 'It turns bromine water from orange to colourless',
     'why': 'The bromine adds across the C=C double bond, so the colour disappears. An alkane has no '
            'double bond and leaves the bromine water orange.'},
    {'ask': 'Going UP the fractions from petrol to bitumen, the hydrocarbons become...',
     'choices': ['less volatile and more viscous', 'more volatile and less viscous',
                 'lighter in colour', 'easier to ignite'],
     'answer': 'less volatile and more viscous',
     'why': 'Longer chains have stronger intermolecular forces, so they boil higher, flow less '
            'easily and ignite less readily. Every one of those trends comes from the same cause.'},
    {'ask': 'What is cracking?',
     'choices': ['Breaking long hydrocarbon chains into shorter, more useful ones',
                 'Joining short chains into long ones',
                 'Burning crude oil to release energy',
                 'Separating crude oil into fractions'],
     'answer': 'Breaking long hydrocarbon chains into shorter, more useful ones',
     'why': 'Fractional distillation gives too much of the long fractions and not enough petrol. '
            'Cracking fixes the mismatch, and the alkenes it also produces are the raw material for '
            'polymers.'},
])

quiz('Chemistry', 'Organic Chemistry', 'GCSE-H', [
    {'ask': 'What is the functional group of an alcohol?',
     'choices': ['–OH', '–COOH', 'C=C', '–NH₂'],
     'answer': '–OH',
     'why': '–OH makes an alcohol, –COOH a carboxylic acid, C=C an alkene. The functional '
            'group is what the family’s reactions come from, whatever the chain length.'},
    {'ask': 'What is produced when ethanol is oxidised?',
     'choices': ['Ethanoic acid', 'Ethene', 'Ethane', 'Ethyl ethanoate'],
     'answer': 'Ethanoic acid',
     'why': 'It happens in air over time, which is why wine turns to vinegar. Ethanoic acid is what '
            'vinegar is.'},
    {'ask': 'Addition polymerisation requires the monomer to have...',
     'choices': ['a carbon-carbon double bond', 'two functional groups',
                 'an –OH group', 'at least six carbon atoms'],
     'answer': 'a carbon-carbon double bond',
     'why': 'The double bond opens and the units join in a chain, with no other product at all. '
            'Condensation polymerisation is the other kind — two functional groups and a small '
            'molecule such as water released each time.'},
    {'ask': 'Ethene reacts with steam to make which substance?',
     'choices': ['Ethanol', 'Ethane', 'Ethanoic acid', 'Ethyl ethanoate'],
     'answer': 'Ethanol',
     'why': 'Hydration, with a catalyst, at high temperature and pressure. The alternative route is '
            'fermenting sugar with yeast — cheaper and renewable, but slower and giving a less pure '
            'product.'},
    {'ask': 'Why are some polymers difficult to dispose of?',
     'choices': ['They are unreactive so they are not biodegradable',
                 'They dissolve in ground water',
                 'They give off toxic gas at room temperature',
                 'They react with soil minerals'],
     'answer': 'They are unreactive so they are not biodegradable',
     'why': 'The very inertness that makes a polymer useful — it does not rot, rust or react — is '
            'what leaves it in landfill for centuries. That is the trade-off the whole disposal '
            'problem rests on.'},
])

# ---------------------------------------------------- Chemistry of the Atmosphere

quiz('Chemistry', 'Chemistry of the Atmosphere', 'KS3', [
    {'ask': 'Roughly what percentage of the air is nitrogen?',
     'choices': ['80%', '20%', '50%', '1%'],
     'answer': '80%',
     'why': 'About 78% nitrogen and 21% oxygen, with argon, carbon dioxide and water vapour making '
            'up the rest. Carbon dioxide is only about 0.04%, which is why a small change in it '
            'matters so much proportionally.'},
    {'ask': 'Which gas do we need for respiration?',
     'choices': ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Argon'],
     'answer': 'Oxygen',
     'why': 'Aerobic respiration uses oxygen to release energy from glucose. Nitrogen is the '
            'commonest gas in air and is almost completely unreactive.'},
    {'ask': 'Name one greenhouse gas.',
     'answer': 'Carbon dioxide',
     'accept': 'carbon dioxide|co2|methane|ch4|water vapour|water vapor|nitrous oxide',
     'why': 'Carbon dioxide, methane and water vapour absorb the long-wavelength radiation the Earth '
            'gives off and re-emit some of it downwards, which keeps the surface warm.'},
    {'ask': 'What is the main cause of the rise in carbon dioxide over the last 200 years?',
     'choices': ['Burning fossil fuels', 'Volcanic eruptions',
                 'Plants dying', 'Changes in the Sun'],
     'answer': 'Burning fossil fuels',
     'why': 'Fossil fuels are carbon that was locked away for millions of years. Burning them '
            'returns it to the atmosphere far faster than photosynthesis and the oceans can take '
            'it out. Deforestation makes it worse by removing the things that would.'},
    {'ask': 'Which gas causes acid rain?',
     'choices': ['Sulfur dioxide', 'Carbon dioxide', 'Nitrogen', 'Oxygen'],
     'answer': 'Sulfur dioxide',
     'why': 'Sulfur impurities in fuel burn to sulfur dioxide, which dissolves in cloud water to '
            'make an acid. Oxides of nitrogen, made by the heat of an engine, do the same.'},
])

quiz('Chemistry', 'Chemistry of the Atmosphere', 'GCSE-F', [
    {'ask': 'Where is the oxygen in the Earth’s early atmosphere thought to have come from?',
     'choices': ['Photosynthesis by early algae and plants',
                 'Volcanic activity',
                 'Water evaporating from the oceans',
                 'Meteorite impacts'],
     'answer': 'Photosynthesis by early algae and plants',
     'why': 'The early atmosphere was mostly carbon dioxide with little or no oxygen. Algae appeared '
            'about 2.7 billion years ago and released oxygen as a waste product — the whole of the '
            'oxygen we breathe is biological in origin.'},
    {'ask': 'How did the amount of carbon dioxide in the atmosphere decrease over billions of years?',
     'choices': ['It dissolved in the oceans and was locked into rocks and fossil fuels',
                 'It escaped into space',
                 'It reacted with nitrogen',
                 'It was broken down by sunlight'],
     'answer': 'It dissolved in the oceans and was locked into rocks and fossil fuels',
     'why': 'Sedimentary rocks like limestone are carbon that came out of the air, and so are coal, '
            'oil and gas. Burning fossil fuels is putting some of it straight back.'},
    {'ask': 'Which of these is a consequence of global climate change?',
     'choices': ['Rising sea levels from melting ice and thermal expansion',
                 'A fall in the amount of nitrogen in the air',
                 'The Sun getting hotter',
                 'More argon in the atmosphere'],
     'answer': 'Rising sea levels from melting ice and thermal expansion',
     'why': 'Sea level rises two ways at once — ice that was on land adds water, and warmer water '
            'takes up more room. Changing rainfall patterns and shifting species are the other '
            'effects.'},
    {'ask': 'What is a carbon footprint?',
     'choices': ['The total greenhouse gases released over the whole life of a product or service',
                 'The mass of carbon in a fuel',
                 'The carbon dioxide in a room',
                 'The amount of carbon in the soil'],
     'answer': 'The total greenhouse gases released over the whole life of a product or service',
     'why': 'Whole life means making, using, transporting and disposing of it — so a product that is '
            'clean to use can still have a large footprint. Measuring every stage accurately is what '
            'makes it hard to pin down.'},
    {'ask': 'Why is carbon monoxide produced by incomplete combustion?',
     'choices': ['There is not enough oxygen to oxidise all the carbon fully',
                 'The fuel is burned at too high a temperature',
                 'The fuel contains carbon monoxide already',
                 'Water vapour gets in the way'],
     'answer': 'There is not enough oxygen to oxidise all the carbon fully',
     'why': 'Short of oxygen, some carbon reaches only CO and some none at all, which is the soot. '
            'That is why a blocked flue or a badly serviced boiler is dangerous.'},
])

quiz('Chemistry', 'Chemistry of the Atmosphere', 'GCSE-H', [
    {'ask': 'Why are peer-reviewed climate models more reliable than a single opinion?',
     'choices': ['Other scientists check the data and reasoning independently',
                 'They always give the same answer',
                 'They are produced by governments',
                 'They ignore uncertain data'],
     'answer': 'Other scientists check the data and reasoning independently',
     'why': 'Peer review is the mechanism that catches a mistake before it is believed. Early models '
            'were genuinely incomplete, and that is why reporting in the media — often simplified or '
            'biased — is not the same as the evidence.'},
    {'ask': 'What does "carbon neutral" mean?',
     'choices': ['Any carbon dioxide released is balanced by an equal amount removed',
                 'No carbon dioxide is released at all',
                 'Only carbon monoxide is released',
                 'The carbon is stored as a solid'],
     'answer': 'Any carbon dioxide released is balanced by an equal amount removed',
     'why': 'Burning a biofuel releases CO₂ the crop took in while growing, so in principle it '
            'balances. In practice the fuel used to farm and transport it has to be counted too.'},
    {'ask': 'Give one way a country could reduce its carbon footprint.',
     'choices': ['Use renewable energy sources instead of fossil fuels',
                 'Cut down more forest for farmland',
                 'Increase the use of coal-fired power',
                 'Export more manufactured goods'],
     'answer': 'Use renewable energy sources instead of fossil fuels',
     'why': 'Other real routes are carbon capture and storage, better efficiency, and carbon taxes. '
            'The obstacles are usually cost, the scientific work still needed, and whether people '
            'will change how they live.'},
    {'ask': 'Why do oxides of nitrogen form inside a car engine?',
     'choices': ['The high temperature makes nitrogen and oxygen from the air react',
                 'Nitrogen is present in petrol',
                 'The catalytic converter produces them',
                 'They come from the oil in the engine'],
     'answer': 'The high temperature makes nitrogen and oxygen from the air react',
     'why': 'Nitrogen is normally very unreactive; the heat of combustion is enough to overcome '
            'that. The nitrogen comes from the air drawn in, not from the fuel.'},
    {'ask': 'Particulates released by burning fuels cause...',
     'choices': ['global dimming and health problems such as lung damage',
                 'acid rain',
                 'the greenhouse effect',
                 'ozone depletion'],
     'answer': 'global dimming and health problems such as lung damage',
     'why': 'Solid particles reflect sunlight back into space, which is global dimming, and lodge in '
            'the lungs. Acid rain is sulfur dioxide and nitrogen oxides — a different pollutant with '
            'a different effect.'},
])

# ---------------------------------------------------------------- Using Resources

quiz('Chemistry', 'Using Resources', 'KS3', [
    {'ask': 'Which of these is a renewable resource?',
     'choices': ['Wood from a managed forest', 'Coal', 'Crude oil', 'Natural gas'],
     'answer': 'Wood from a managed forest',
     'why': 'Renewable means it is replaced at least as fast as it is used. Replanting is what makes '
            'wood renewable; fossil fuels take millions of years and are not.'},
    {'ask': 'Why is recycling metal better than extracting it from ore?',
     'choices': ['It uses much less energy and conserves the ore',
                 'Recycled metal is stronger',
                 'It produces more metal overall',
                 'It requires no sorting'],
     'answer': 'It uses much less energy and conserves the ore',
     'why': 'Extraction means mining, transporting and then reducing the ore — all of it expensive '
            'in energy. Melting scrap skips nearly all of that, and the ore is finite.'},
    {'ask': 'Name one thing added to water to make it safe to drink.',
     'answer': 'Chlorine',
     'accept': 'chlorine|chlorine gas|ozone|uv|ultraviolet|ultra violet light|uv light',
     'why': 'Sterilising kills microbes, using chlorine, ozone or ultraviolet light. Filtering comes '
            'first to remove solids — one step for the visible, one for the invisible.'},
    {'ask': 'What is potable water?',
     'choices': ['Water that is safe to drink', 'Water with nothing dissolved in it',
                 'Water taken from the sea', 'Water that has been boiled'],
     'answer': 'Water that is safe to drink',
     'why': 'Potable is a standard about safety, not purity — drinking water still contains '
            'dissolved salts, and that is fine.'},
    {'ask': 'Why do we treat waste water before returning it to rivers?',
     'choices': ['To remove harmful microbes and chemicals that would damage wildlife',
                 'To make it taste better',
                 'To make it colder',
                 'To add oxygen to the river'],
     'answer': 'To remove harmful microbes and chemicals that would damage wildlife',
     'why': 'Untreated sewage carries pathogens and feeds bacteria that then use up the river’s '
            'oxygen. Treatment screens the solids out, settles the sludge and digests it biologically.'},
])

quiz('Chemistry', 'Using Resources', 'GCSE-F', [
    {'ask': 'How is potable water usually produced in the UK?',
     'choices': ['Choose a fresh water source, filter it, then sterilise it',
                 'Distil sea water',
                 'Filter sea water only',
                 'Add salt then evaporate it'],
     'answer': 'Choose a fresh water source, filter it, then sterilise it',
     'why': 'The UK has enough rain, so fresh water is cheap to treat. Desalination — distillation '
            'or reverse osmosis — is only used where there is no fresh source, because it needs a '
            'great deal of energy.'},
    {'ask': 'What is a life cycle assessment?',
     'choices': ['An assessment of the environmental impact of a product at every stage of its life',
                 'A test of how long a product lasts',
                 'A measure of how much a product costs',
                 'A check on whether a product can be recycled'],
     'answer': 'An assessment of the environmental impact of a product at every stage of its life',
     'why': 'Raw materials, manufacturing, use, and disposal. Some of it is measurable — energy, '
            'water, waste — and some, such as the effect of a pollutant, is a judgement, which is '
            'why an LCA can be slanted to support a claim.'},
    {'ask': 'Rusting needs which two substances?',
     'choices': ['Water and oxygen', 'Water and carbon dioxide',
                 'Oxygen and nitrogen', 'Acid and oxygen'],
     'answer': 'Water and oxygen',
     'why': 'Remove either and iron does not rust, which is why oil, grease, paint and plastic all '
            'work as protection: they keep both out.'},
    {'ask': 'Why does galvanising protect iron even if the coating is scratched?',
     'choices': ['Zinc is more reactive, so it corrodes instead of the iron',
                 'Zinc seals the scratch automatically',
                 'Zinc is harder than iron',
                 'Zinc repels water'],
     'answer': 'Zinc is more reactive, so it corrodes instead of the iron',
     'why': 'That is sacrificial protection. Paint only works while it is intact; zinc goes on '
            'protecting after the barrier has failed, because the protection is chemical rather than '
            'physical.'},
    {'ask': 'What is an alloy?',
     'choices': ['A mixture of a metal with other elements',
                 'A pure metal',
                 'A metal compound',
                 'A metal that has been recycled'],
     'answer': 'A mixture of a metal with other elements',
     'why': 'The different-sized atoms disrupt the regular layers, so they cannot slide over each '
            'other. That is why an alloy is harder than the pure metal it is made from.'},
])

quiz('Chemistry', 'Using Resources', 'GCSE-H', [
    {'ask': 'What is phytomining?',
     'choices': ['Growing plants that absorb metal compounds, then burning them to get the ore',
                 'Using bacteria to produce a metal solution',
                 'Mining metal from the sea bed',
                 'Extracting metal using electricity'],
     'answer': 'Growing plants that absorb metal compounds, then burning them to get the ore',
     'why': 'The ash is a concentrated ore. Bioleaching is the other biological method, using '
            'bacteria to produce a leachate. Both are slower than mining but work on ores too low '
            'in metal to be worth digging up.'},
    {'ask': 'Why is a low-carbon steel softer and more easily shaped than a high-carbon steel?',
     'choices': ['Fewer carbon atoms disrupt the layers, so they slide more easily',
                 'It contains more iron atoms per gram',
                 'It has been heated for longer',
                 'It contains no impurities at all'],
     'answer': 'Fewer carbon atoms disrupt the layers, so they slide more easily',
     'why': 'High-carbon steel is hard and brittle; low-carbon is soft and easily shaped. Same two '
            'elements, different proportions, opposite properties.'},
    {'ask': 'What is the Haber process used to make?',
     'choices': ['Ammonia, for fertilisers', 'Sulfuric acid',
                 'Hydrogen, for fuel cells', 'Nitric acid'],
     'answer': 'Ammonia, for fertilisers',
     'why': 'N₂ + 3H₂ ⇌ 2NH₃, at about 450 °C, 200 atmospheres and an iron '
            'catalyst. Nitrogen from the air, hydrogen from natural gas.'},
    {'ask': 'The Haber process runs at 450 °C although a lower temperature would give a higher '
            'yield. Why?',
     'choices': ['A lower temperature would make the reaction far too slow',
                 'A lower temperature would damage the catalyst',
                 'The yield is actually higher at 450 °C',
                 'The nitrogen would liquefy'],
     'answer': 'A lower temperature would make the reaction far too slow',
     'why': 'It is a compromise, and that word is the point of the question: the forward reaction is '
            'exothermic, so cooling improves the yield and ruins the rate. 450 °C is a '
            'deliberate trade between the two, with the unreacted gases recycled.'},
    {'ask': 'An NPK fertiliser supplies which three elements?',
     'choices': ['Nitrogen, phosphorus and potassium',
                 'Nitrogen, phosphorus and potassium carbonate',
                 'Nitrate, potassium and calcium',
                 'Nitrogen, potassium and calcium'],
     'answer': 'Nitrogen, phosphorus and potassium',
     'why': 'They are the three elements plants take from soil in the largest amounts, and the ones '
            'a crop removes when it is harvested. N, P and K are their symbols.'},
])
