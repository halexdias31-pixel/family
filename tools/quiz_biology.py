"""
BIOLOGY -- the seven AQA units, three levels each.

THE LEVELS ARE DIFFERENT QUESTIONS ABOUT THE SAME TOPIC, not the same question worded harder.
KS3 asks what a thing IS; Foundation asks what it does and what the words mean; Higher asks the
content that is Higher-only on the spec -- the inverse square law, monoclonal antibodies, negative
feedback, trophic efficiency -- because a Higher paper is not a Foundation paper with longer words.

EVERY `why` IS THE MECHANISM, NOT THE ANSWER REPEATED. CLAUDE.md records this line twice about the
practicals: a sentence saying "the rate rises with concentration" hands somebody the result of an
experiment they have not run. A quiz that only says "correct, it is 4" teaches nothing.
"""
from quizwrite import quiz

# ---------------------------------------------------------------- Cell Biology

quiz('Biology', 'Cell Biology', 'KS3', [
    {'ask': 'Which part of a cell controls what it does and holds the DNA?',
     'choices': ['Nucleus', 'Cell membrane', 'Cytoplasm', 'Mitochondria'],
     'answer': 'Nucleus',
     'why': 'The nucleus holds the chromosomes, and the chromosomes carry the instructions for '
            'every protein the cell can make — so it controls the cell by controlling what gets built.'},
    {'ask': 'Name one part a plant cell has that an animal cell does not.',
     'answer': 'Cell wall',
     'accept': 'cell wall|chloroplast|chloroplasts|permanent vacuole|vacuole|cellulose cell wall',
     'why': 'A plant cell has three an animal cell has not: a cellulose cell wall for support, '
            'chloroplasts for photosynthesis, and a permanent vacuole holding sap.'},
    {'ask': 'What is the job of the cell membrane?',
     'choices': ['It controls what enters and leaves the cell',
                 'It makes food for the cell',
                 'It holds the cell’s DNA',
                 'It releases energy from glucose'],
     'answer': 'It controls what enters and leaves the cell',
     'why': 'The membrane is partially permeable — small molecules like oxygen and water pass '
            'through it, larger ones do not. That selectivity is what keeps the inside different '
            'from the outside.'},
    {'ask': 'Which cell part releases energy from glucose in respiration?',
     'choices': ['Mitochondria', 'Ribosomes', 'Nucleus', 'Cell wall'],
     'answer': 'Mitochondria',
     'why': 'Aerobic respiration happens inside mitochondria, so a cell that needs a lot of energy '
            '— a muscle cell, a sperm cell — has a lot of them.'},
    {'ask': 'A red blood cell has no nucleus. Why is that useful?',
     'choices': ['It leaves more room for haemoglobin to carry oxygen',
                 'It makes the cell float',
                 'It stops the cell respiring',
                 'It lets the cell divide faster'],
     'answer': 'It leaves more room for haemoglobin to carry oxygen',
     'why': 'A red blood cell is a carrying bag. Losing the nucleus frees space for more '
            'haemoglobin — and the cost is that it cannot divide or repair itself, which is why '
            'they only last about four months.'},
])

quiz('Biology', 'Cell Biology', 'GCSE-F', [
    {'ask': 'Which of these is a prokaryotic cell?',
     'choices': ['A bacterial cell', 'A plant cell', 'An animal cell', 'A fungal cell'],
     'answer': 'A bacterial cell',
     'why': 'Prokaryotic means the DNA is not inside a nucleus — a bacterium has a single loop of '
            'DNA free in the cytoplasm, plus small rings called plasmids. Everything else on that '
            'list is eukaryotic.'},
    {'ask': 'What is diffusion?',
     'choices': ['The spreading of particles from high concentration to low concentration',
                 'The movement of water through a partially permeable membrane',
                 'The movement of particles against a concentration gradient',
                 'The splitting of a cell into two'],
     'answer': 'The spreading of particles from high concentration to low concentration',
     'why': 'Particles move randomly, so more of them happen to wander out of a crowded region '
            'than into it. Nothing pushes them — the net movement is just the odds, which is why '
            'diffusion needs no energy.'},
    {'ask': 'Osmosis is the movement of which substance?',
     'answer': 'Water',
     'accept': 'water|water molecules|h2o',
     'why': 'Osmosis is diffusion of water only, through a partially permeable membrane, from a '
            'dilute solution to a concentrated one.'},
    {'ask': 'A cell is 0.05 mm long and its image is 50 mm long. What is the magnification?',
     'choices': ['×1000', '×100', '×10', '×2.5'],
     'answer': '×1000',
     'why': 'Magnification = image ÷ real size, and both must be in the same units. '
            '50 ÷ 0.05 = 1000.'},
    {'ask': 'How many daughter cells does one cell produce by mitosis?',
     'choices': ['Two, genetically identical', 'Four, genetically identical',
                 'Two, genetically different', 'Four, genetically different'],
     'answer': 'Two, genetically identical',
     'why': 'The chromosomes are copied first and then one full set is pulled to each end, so both '
            'daughters get the same DNA. Mitosis is for growth and repair; it is meiosis that makes '
            'four different cells.'},
])

quiz('Biology', 'Cell Biology', 'GCSE-H', [
    {'ask': 'An image is 30 mm wide at ×1500. What is the real width in micrometres?',
     'choices': ['20 µm', '2 µm', '200 µm', '45 µm'],
     'answer': '20 µm',
     'why': 'Real = image ÷ magnification = 30 ÷ 1500 = 0.02 mm. One millimetre is '
            '1000 µm, so 0.02 mm is 20 µm.'},
    {'ask': 'Active transport differs from diffusion because it...',
     'choices': ['moves substances against the concentration gradient and needs energy',
                 'moves substances down the concentration gradient and needs energy',
                 'moves only water molecules',
                 'happens only in plant cells'],
     'answer': 'moves substances against the concentration gradient and needs energy',
     'why': 'Going against the gradient is going against the odds, so something has to pay — ATP '
            'from respiration. That is why root hair cells, which take up minerals from very dilute '
            'soil water, are packed with mitochondria.'},
    {'ask': 'Which stem cells can become ANY type of cell?',
     'choices': ['Embryonic stem cells', 'Adult stem cells from bone marrow',
                 'Meristem cells in a leaf', 'Nerve cells'],
     'answer': 'Embryonic stem cells',
     'why': 'Embryonic stem cells are unspecialised and can differentiate into every cell type. '
            'Adult stem cells are more limited — bone marrow ones mainly form blood cells.'},
    {'ask': 'In which part of the cell cycle are the chromosomes copied?',
     'choices': ['Before mitosis, during interphase', 'During mitosis itself',
                 'After the cell has divided', 'During cytokinesis'],
     'answer': 'Before mitosis, during interphase',
     'why': 'A cell spends most of the cycle in interphase, growing, copying its DNA and making '
            'extra sub-cellular structures. Mitosis is only the separating.'},
    {'ask': 'Why does a large organism need an exchange surface rather than relying on diffusion '
            'across its outer surface?',
     'choices': ['Its surface area to volume ratio is too small',
                 'Its surface area to volume ratio is too large',
                 'Diffusion does not happen in large organisms',
                 'Its cells do not respire'],
     'answer': 'Its surface area to volume ratio is too small',
     'why': 'Volume grows faster than surface area as a thing gets bigger, so the outside cannot '
            'supply the inside. Lungs, gills and villi are all the same fix: fold the surface until '
            'the ratio works again.'},
])

# ---------------------------------------------------------------- Organisation

quiz('Biology', 'Organisation', 'KS3', [
    {'ask': 'Put these in order from smallest to largest: organ, cell, tissue, organ system.',
     'choices': ['Cell, tissue, organ, organ system', 'Cell, organ, tissue, organ system',
                 'Tissue, cell, organ, organ system', 'Cell, tissue, organ system, organ'],
     'answer': 'Cell, tissue, organ, organ system',
     'why': 'Cells of one type group into a tissue, tissues group into an organ, organs working '
            'together make a system. Each level is built from the one below it.'},
    {'ask': 'Which organ system carries oxygen around the body?',
     'choices': ['The circulatory system', 'The digestive system',
                 'The nervous system', 'The skeletal system'],
     'answer': 'The circulatory system',
     'why': 'The heart pumps blood through vessels, and the red blood cells in it carry oxygen from '
            'the lungs to every respiring cell.'},
    {'ask': 'Where is most food absorbed into the blood?',
     'choices': ['The small intestine', 'The stomach', 'The large intestine', 'The mouth'],
     'answer': 'The small intestine',
     'why': 'The small intestine is lined with villi — tiny folds that give it an enormous surface '
            'area, so digested food passes into the blood quickly.'},
    {'ask': 'What do we call a substance that speeds up a reaction in the body without being used up?',
     'answer': 'Enzyme',
     'accept': 'enzyme|an enzyme|enzymes|biological catalyst|catalyst',
     'why': 'Enzymes are biological catalysts. They are proteins, and they are not used up — one '
            'enzyme molecule can work on thousands of substrate molecules.'},
    {'ask': 'Which of these is an organ?',
     'choices': ['The heart', 'Muscle tissue', 'A red blood cell', 'The circulatory system'],
     'answer': 'The heart',
     'why': 'An organ is several tissues working together for one job. The heart is muscle tissue, '
            'nerve tissue and blood vessels together — one level above a tissue, one below a system.'},
])

quiz('Biology', 'Organisation', 'GCSE-F', [
    {'ask': 'Which enzyme breaks down starch?',
     'choices': ['Amylase', 'Protease', 'Lipase', 'Catalase'],
     'answer': 'Amylase',
     'why': 'Amylase is a carbohydrase and turns starch into maltose and then glucose. It is made '
            'in the salivary glands, the pancreas and the small intestine.'},
    {'ask': 'What does lipase break lipids down into?',
     'choices': ['Fatty acids and glycerol', 'Amino acids', 'Glucose', 'Simple sugars'],
     'answer': 'Fatty acids and glycerol',
     'why': 'A lipid is a glycerol molecule with three fatty acid chains attached, so breaking it '
            'apart gives exactly those two products back.'},
    {'ask': 'What is the job of bile?',
     'choices': ['It neutralises stomach acid and emulsifies fat',
                 'It digests protein into amino acids',
                 'It absorbs glucose into the blood',
                 'It breaks starch into sugar'],
     'answer': 'It neutralises stomach acid and emulsifies fat',
     'why': 'Bile is made in the liver and stored in the gall bladder. Emulsifying means breaking '
            'fat into droplets — more surface area for lipase to work on, so digestion is faster. '
            'Bile is not an enzyme.'},
    {'ask': 'Which blood vessel carries blood AWAY from the heart?',
     'answer': 'Artery',
     'accept': 'artery|arteries|an artery|the aorta|aorta|pulmonary artery',
     'why': 'Arteries carry blood away — the clue is the A. They have thick muscular walls because '
            'the blood leaving the heart is at high pressure. Veins carry it back.'},
    {'ask': 'Which chamber of the heart pumps blood to the whole body?',
     'choices': ['The left ventricle', 'The right ventricle',
                 'The left atrium', 'The right atrium'],
     'answer': 'The left ventricle',
     'why': 'The left ventricle has the thickest muscular wall of the four chambers, because it has '
            'to push blood all the way round the body. The right ventricle only reaches the lungs.'},
])

quiz('Biology', 'Organisation', 'GCSE-H', [
    {'ask': 'Why does an enzyme stop working when it is heated too far?',
     'choices': ['Its active site changes shape so the substrate no longer fits',
                 'It is used up by the reaction',
                 'It turns into a different enzyme',
                 'The substrate evaporates'],
     'answer': 'Its active site changes shape so the substrate no longer fits',
     'why': 'Heat breaks the bonds holding the protein folded. The active site is a shape, so once '
            'the shape has gone the enzyme is denatured — and unlike cooling, that does not reverse.'},
    {'ask': 'An enzyme works fastest at pH 2. Where in the body is it most likely to be found?',
     'choices': ['The stomach', 'The small intestine', 'The mouth', 'The liver'],
     'answer': 'The stomach',
     'why': 'The stomach makes hydrochloric acid, so its enzyme — protease, called pepsin — has an '
            'optimum around pH 2. The small intestine is alkaline, so its enzymes peak near pH 8.'},
    {'ask': 'Coronary heart disease is caused by...',
     'choices': ['fatty material building up in the coronary arteries',
                 'a faulty heart valve leaking',
                 'too few red blood cells',
                 'the heart beating irregularly'],
     'answer': 'fatty material building up in the coronary arteries',
     'why': 'The coronary arteries supply the heart muscle itself. Narrow them and the muscle gets '
            'less oxygen, so it respires less and can eventually die — which is a heart attack. A '
            'stent widens them; a statin slows the build-up.'},
    {'ask': 'Give one advantage of a mechanical heart valve over a biological one.',
     'choices': ['It lasts much longer', 'It needs no drugs afterwards',
                 'It is quieter', 'It grows with the patient'],
     'answer': 'It lasts much longer',
     'why': 'Mechanical valves last decades but the patient must take anti-clotting drugs for life, '
            'because blood clots on the artificial surface. Biological valves need no such drugs and '
            'wear out in about 12–15 years — the trade-off is the whole decision.'},
    {'ask': 'What is the name for the volume of blood the heart pumps in one minute?',
     'choices': ['Cardiac output', 'Stroke volume', 'Heart rate', 'Blood pressure'],
     'answer': 'Cardiac output',
     'why': 'Cardiac output = stroke volume × heart rate. Stroke volume is one beat; the rate '
            'is beats per minute; multiply them and you have a minute’s worth.'},
])

# ------------------------------------------------------- Infection & Response

quiz('Biology', 'Infection & Response', 'KS3', [
    {'ask': 'What is a pathogen?',
     'choices': ['A microorganism that causes disease', 'A type of white blood cell',
                 'A medicine that kills bacteria', 'A chemical made by the liver'],
     'answer': 'A microorganism that causes disease',
     'why': 'Pathogen just means disease-causer. Bacteria, viruses, fungi and protists can all be '
            'pathogens — most microorganisms are harmless or useful.'},
    {'ask': 'Which of these diseases is caused by a virus?',
     'choices': ['Measles', 'Salmonella food poisoning', 'Athlete’s foot', 'Malaria'],
     'answer': 'Measles',
     'why': 'Measles is viral. Salmonella is a bacterium, athlete’s foot is a fungus and '
            'malaria is a protist — four different kinds of pathogen, one for each on that list.'},
    {'ask': 'Name one way your body stops pathogens getting in before they reach your blood.',
     'answer': 'Skin',
     'accept': 'skin|the skin|mucus|nose hairs|nose|cilia|stomach acid|acid|tears|scab|clotting',
     'why': 'These are the barriers, and they work before any immune response: unbroken skin, mucus '
            'and cilia in the airway, stomach acid, and tears carrying an enzyme that kills bacteria.'},
    {'ask': 'Which blood cells fight infection?',
     'choices': ['White blood cells', 'Red blood cells', 'Platelets', 'Plasma'],
     'answer': 'White blood cells',
     'why': 'White blood cells engulf pathogens, make antibodies and make antitoxins. Red cells '
            'carry oxygen, platelets clot and plasma is the liquid that carries everything.'},
    {'ask': 'Why should you finish a course of antibiotics even when you feel better?',
     'choices': ['Some bacteria may survive and could become resistant',
                 'The tablets go off if you keep them',
                 'Antibiotics stop working against viruses',
                 'It makes the infection last longer'],
     'answer': 'Some bacteria may survive and could become resistant',
     'why': 'Feeling better means most bacteria are dead, not all. The survivors are the hardiest, '
            'and letting exactly those breed is how a resistant strain gets started.'},
])

quiz('Biology', 'Infection & Response', 'GCSE-F', [
    {'ask': 'Antibiotics are used to treat...',
     'choices': ['bacterial infections only', 'viral infections only',
                 'both bacterial and viral infections', 'fungal infections only'],
     'answer': 'bacterial infections only',
     'why': 'A virus reproduces inside your own cells, so a drug that killed it would have to '
            'damage them too. That is why there is no antibiotic for a cold — and why prescribing '
            'one does nothing but breed resistance.'},
    {'ask': 'How does a vaccine make you immune?',
     'choices': ['A small amount of dead or inactive pathogen makes white blood cells produce antibodies',
                 'It kills every pathogen already in the body',
                 'It gives you antibodies made by someone else',
                 'It stops pathogens entering the body'],
     'answer': 'A small amount of dead or inactive pathogen makes white blood cells produce antibodies',
     'why': 'The dead pathogen still carries its antigens, so the body practises on something that '
            'cannot make you ill. Memory cells stay behind, so the real infection meets a response '
            'that is already fast.'},
    {'ask': 'Which pathogen causes malaria?',
     'choices': ['A protist', 'A bacterium', 'A virus', 'A fungus'],
     'answer': 'A protist',
     'why': 'Malaria is a protist spread by mosquitoes, which act as the vector. Stopping the '
            'mosquito — nets, draining standing water — is as much a control as any drug.'},
    {'ask': 'What is the name of the plant disease that causes patches of discoloured leaves and '
            'is caused by a virus?',
     'answer': 'Tobacco mosaic virus',
     'accept': 'tobacco mosaic virus|tmv|tobacco mosaic|mosaic virus',
     'why': 'TMV gives a distinctive mosaic pattern of discolouration. Less chlorophyll means less '
            'photosynthesis, so the plant grows badly.'},
    {'ask': 'Where was the antibiotic penicillin first discovered?',
     'choices': ['In mould growing on a culture plate', 'In the bark of a willow tree',
                 'In foxglove leaves', 'In sea water'],
     'answer': 'In mould growing on a culture plate',
     'why': 'Alexander Fleming noticed Penicillium mould had killed the bacteria around it. '
            'Aspirin came from willow and digitalis from foxgloves — most drugs started in a living '
            'thing.'},
])

quiz('Biology', 'Infection & Response', 'GCSE-H', [
    {'ask': 'How are monoclonal antibodies produced?',
     'choices': ['A mouse lymphocyte is fused with a tumour cell to make a hybridoma',
                 'They are extracted from donated blood',
                 'Bacteria are genetically modified to make them',
                 'They are made by dissolving a pathogen in acid'],
     'answer': 'A mouse lymphocyte is fused with a tumour cell to make a hybridoma',
     'why': 'The lymphocyte makes the one antibody you want but will not divide; the tumour cell '
            'divides endlessly but makes nothing useful. The hybridoma does both, so you get an '
            'unlimited supply of a single specific antibody.'},
    {'ask': 'Why are monoclonal antibodies useful for targeting cancer cells?',
     'choices': ['They bind only to a specific antigen found on the cancer cell',
                 'They dissolve any cell they touch',
                 'They make the cancer cell divide more slowly on contact',
                 'They are absorbed only by fast-growing tissue'],
     'answer': 'They bind only to a specific antigen found on the cancer cell',
     'why': 'Specificity is the whole point — a drug or radioactive marker carried by the antibody '
            'is delivered to the cancer cell and not to healthy ones. In practice they have caused '
            'more side effects than expected, which is why they are less widely used than hoped.'},
    {'ask': 'In the first stage of testing a new drug, what is it tested on?',
     'choices': ['Cells, tissues and live animals', 'Healthy human volunteers',
                 'Patients with the disease', 'Computer models only'],
     'answer': 'Cells, tissues and live animals',
     'why': 'Preclinical testing checks toxicity and efficacy before any human is exposed. Only '
            'then do healthy volunteers get very low doses, and only then do patients get it in a '
            'clinical trial.'},
    {'ask': 'What is a double-blind trial?',
     'choices': ['Neither the patient nor the doctor knows who has the placebo',
                 'The patient does not know, but the doctor does',
                 'Nobody records the results until the end',
                 'The drug is tested twice on the same person'],
     'answer': 'Neither the patient nor the doctor knows who has the placebo',
     'why': 'If the doctor knows, their expectations can change how they assess the patient without '
            'anyone intending it. Blinding both sides is what stops the result being a measurement '
            'of what everybody hoped for.'},
    {'ask': 'A plant is short of magnesium ions. What visible symptom would you expect?',
     'choices': ['Yellow leaves, because it cannot make chlorophyll',
                 'Stunted growth, because it cannot make protein',
                 'Spots of mould on the leaves',
                 'Holes chewed in the leaves'],
     'answer': 'Yellow leaves, because it cannot make chlorophyll',
     'why': 'Magnesium sits at the centre of a chlorophyll molecule, so no magnesium means no green '
            'pigment — chlorosis. Nitrate deficiency is the other one: nitrate is needed for amino '
            'acids, so the plant is stunted rather than yellow.'},
])

# -------------------------------------------------------------- Bioenergetics

quiz('Biology', 'Bioenergetics', 'KS3', [
    {'ask': 'Complete the word equation: carbon dioxide + water → glucose + ?',
     'answer': 'Oxygen',
     'accept': 'oxygen|o2|oxygen gas',
     'why': 'That is photosynthesis. The oxygen comes from splitting the water, and it is released '
            'as a waste product — which is where nearly all the oxygen in the air came from.'},
    {'ask': 'Where in a plant cell does photosynthesis happen?',
     'choices': ['In the chloroplasts', 'In the nucleus',
                 'In the mitochondria', 'In the cell wall'],
     'answer': 'In the chloroplasts',
     'why': 'Chloroplasts contain chlorophyll, the green pigment that absorbs light. Leaf cells near '
            'the top of a leaf have the most, because that is where the light arrives.'},
    {'ask': 'What does a plant use the glucose it makes for?',
     'choices': ['Respiration, and for building starch and cellulose',
                 'Only for storing in the roots',
                 'Only for making oxygen',
                 'Nothing — it is a waste product'],
     'answer': 'Respiration, and for building starch and cellulose',
     'why': 'Glucose is the starting material for almost everything: respired for energy, stored as '
            'starch, built into cellulose for walls, and combined with nitrate to make proteins.'},
    {'ask': 'Respiration releases energy from glucose. Which gas does aerobic respiration need?',
     'choices': ['Oxygen', 'Carbon dioxide', 'Nitrogen', 'Hydrogen'],
     'answer': 'Oxygen',
     'why': 'Aerobic means with oxygen. Glucose + oxygen → carbon dioxide + water — the exact '
            'reverse of photosynthesis, which is why the two fit together so neatly.'},
    {'ask': 'Why do plants respire as well as photosynthesise?',
     'choices': ['Every living cell needs energy all the time, including at night',
                 'They only respire when there is no light',
                 'Respiration makes their food',
                 'It is how they take in water'],
     'answer': 'Every living cell needs energy all the time, including at night',
     'why': 'Plants respire day and night. In bright light photosynthesis is faster, so the net '
            'effect is oxygen out; in the dark only respiration is happening, so it is carbon '
            'dioxide out.'},
])

quiz('Biology', 'Bioenergetics', 'GCSE-F', [
    {'ask': 'Which is the correct symbol equation for photosynthesis?',
     'choices': ['6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
                 'C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O',
                 'CO₂ + H₂O → C₆H₁₂O₆ + O₂',
                 '6CO₂ + 6O₂ → C₆H₁₂O₆ + 6H₂O'],
     'answer': '6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
     'why': 'Glucose is C₆H₁₂O₆, so you need six carbons in and six waters to '
            'supply the twelve hydrogens. The second option is aerobic respiration — the same '
            'equation written backwards.'},
    {'ask': 'Name one limiting factor of photosynthesis.',
     'answer': 'Light intensity',
     'accept': 'light|light intensity|amount of light|temperature|carbon dioxide|carbon dioxide '
               'concentration|co2|co2 concentration|chlorophyll|amount of chlorophyll',
     'why': 'A limiting factor is whichever one is in shortest supply — raise it and the rate goes '
            'up, raise any other and nothing happens. That is why a greenhouse adds CO₂ and '
            'heat as well as light.'},
    {'ask': 'What is the product of anaerobic respiration in human muscle?',
     'choices': ['Lactic acid', 'Ethanol and carbon dioxide',
                 'Carbon dioxide and water', 'Glucose'],
     'answer': 'Lactic acid',
     'why': 'Without enough oxygen the glucose is only partly broken down, so much less energy is '
            'released and lactic acid builds up. Yeast does it differently — ethanol and carbon '
            'dioxide, which is fermentation.'},
    {'ask': 'Why does anaerobic respiration release less energy than aerobic respiration?',
     'choices': ['The glucose is not completely broken down',
                 'It happens at a lower temperature',
                 'It uses less glucose',
                 'It happens outside the cell'],
     'answer': 'The glucose is not completely broken down',
     'why': 'Aerobic respiration takes glucose all the way to carbon dioxide and water. Anaerobic '
            'stops at lactic acid, which still holds most of the energy — that is why it is a '
            'short-term option only.'},
    {'ask': 'Which piece of apparatus would you use to measure the rate of photosynthesis in pondweed?',
     'choices': ['A gas syringe or measuring cylinder collecting the oxygen given off',
                 'A thermometer in the water',
                 'A pH meter',
                 'A balance measuring the mass of the pondweed'],
     'answer': 'A gas syringe or measuring cylinder collecting the oxygen given off',
     'why': 'Rate means amount per unit time, so you need something that counts a product — oxygen '
            'bubbles, or the volume of gas collected. Temperature and pH are variables to control, '
            'not the measurement.'},
])

quiz('Biology', 'Bioenergetics', 'GCSE-H', [
    {'ask': 'A lamp is moved from 10 cm to 20 cm from a plant. By the inverse square law, the light '
            'intensity becomes...',
     'choices': ['a quarter of what it was', 'half of what it was',
                 'twice what it was', 'four times what it was'],
     'answer': 'a quarter of what it was',
     'why': 'Intensity ∝ 1/d². Doubling the distance spreads the same light over four '
            'times the area, so it is a quarter as intense — not half, which is the answer most '
            'people give first.'},
    {'ask': 'What is oxygen debt?',
     'choices': ['The extra oxygen needed after exercise to break down lactic acid',
                 'The oxygen used up during exercise',
                 'The oxygen a muscle stores before exercise',
                 'The carbon dioxide breathed out after exercise'],
     'answer': 'The extra oxygen needed after exercise to break down lactic acid',
     'why': 'It is why you keep breathing hard after you stop. The blood carries the lactic acid to '
            'the liver, where it is converted back to glucose — and that oxidation is the debt being '
            'repaid.'},
    {'ask': 'What is metabolism?',
     'choices': ['The sum of all the reactions in a cell or the body',
                 'The breakdown of glucose only',
                 'The rate at which the heart beats',
                 'The building of protein from amino acids'],
     'answer': 'The sum of all the reactions in a cell or the body',
     'why': 'It covers both directions — building starch, cellulose, lipids and proteins up, and '
            'breaking glucose and excess protein down. All of it is driven by energy from '
            'respiration.'},
    {'ask': 'Excess protein in the body is broken down. What is formed and where does it go?',
     'choices': ['Urea, formed in the liver and excreted by the kidneys',
                 'Ammonia, stored in the liver',
                 'Glucose, excreted in sweat',
                 'Lactic acid, broken down in the muscles'],
     'answer': 'Urea, formed in the liver and excreted by the kidneys',
     'why': 'Amino acids cannot be stored, so the amino group is removed — deamination — giving '
            'ammonia, which is toxic and is immediately converted to the much safer urea.'},
    {'ask': 'On a graph of photosynthesis rate against light intensity, the line levels off. What '
            'does that show?',
     'choices': ['Light is no longer the limiting factor',
                 'The plant has stopped respiring',
                 'Light intensity has stopped increasing',
                 'The plant has run out of chlorophyll'],
     'answer': 'Light is no longer the limiting factor',
     'why': 'A plateau means adding more of that factor changes nothing, so something else — '
            'temperature or carbon dioxide — has become the one in shortest supply.'},
])

# -------------------------------------------------- Homeostasis & Response

quiz('Biology', 'Homeostasis & Response', 'KS3', [
    {'ask': 'What is a reflex action?',
     'choices': ['An automatic response that does not involve conscious thought',
                 'A response you have to decide to make',
                 'A slow response controlled by hormones',
                 'A response that only happens while asleep'],
     'answer': 'An automatic response that does not involve conscious thought',
     'why': 'The signal takes a short cut through the spinal cord instead of going to the conscious '
            'brain, which is why it is fast — and being fast is exactly the point when the stimulus '
            'is a hot pan.'},
    {'ask': 'Which organ detects light?',
     'choices': ['The eye', 'The ear', 'The skin', 'The tongue'],
     'answer': 'The eye',
     'why': 'A sense organ contains receptor cells for one kind of stimulus. Light receptors are in '
            'the retina at the back of the eye.'},
    {'ask': 'Why do you shiver when you are cold?',
     'choices': ['Muscles contracting releases heat from respiration',
                 'It moves warm blood to the skin',
                 'It cools the body down faster',
                 'It stops sweat being produced'],
     'answer': 'Muscles contracting releases heat from respiration',
     'why': 'Shivering is muscles contracting and relaxing rapidly. Respiration is not fully '
            'efficient, so the extra respiration needed to power them releases heat — which is the '
            'point.'},
    {'ask': 'What is the name for keeping conditions inside the body steady?',
     'answer': 'Homeostasis',
     'accept': 'homeostasis|homoeostasis',
     'why': 'Temperature, water, blood glucose — all held near a set point, because enzymes only '
            'work properly within a narrow range.'},
    {'ask': 'Which system uses chemical messengers carried in the blood?',
     'choices': ['The endocrine system', 'The nervous system',
                 'The digestive system', 'The skeletal system'],
     'answer': 'The endocrine system',
     'why': 'Hormones travel in the blood, so they are slower than nerves but last longer and reach '
            'the whole body. Nerve impulses are fast, brief and precisely targeted — the two systems '
            'suit different jobs.'},
])

quiz('Biology', 'Homeostasis & Response', 'GCSE-F', [
    {'ask': 'Put the reflex arc in order: stimulus, response, receptor, effector, relay neurone, '
            'sensory neurone, motor neurone.',
     'choices': ['Stimulus, receptor, sensory neurone, relay neurone, motor neurone, effector, response',
                 'Stimulus, receptor, motor neurone, relay neurone, sensory neurone, effector, response',
                 'Receptor, stimulus, sensory neurone, motor neurone, relay neurone, effector, response',
                 'Stimulus, sensory neurone, receptor, relay neurone, effector, motor neurone, response'],
     'answer': 'Stimulus, receptor, sensory neurone, relay neurone, motor neurone, effector, response',
     'why': 'Sensory carries IN, motor carries OUT, relay joins them in the CNS. The effector is a '
            'muscle or a gland — whatever actually does the response.'},
    {'ask': 'Which hormone lowers blood glucose concentration?',
     'answer': 'Insulin',
     'accept': 'insulin',
     'why': 'Insulin is released by the pancreas when glucose is too high, and makes liver and '
            'muscle cells take glucose in and store it as glycogen. Glucagon does the opposite.'},
    {'ask': 'Type 1 diabetes is caused by...',
     'choices': ['the pancreas not producing enough insulin',
                 'the body cells not responding to insulin',
                 'eating too much sugar',
                 'the liver storing too much glycogen'],
     'answer': 'the pancreas not producing enough insulin',
     'why': 'Type 1 is a supply problem, so it is treated with insulin injections. Type 2 is a '
            'response problem — the insulin is there and the cells ignore it — so it is managed with '
            'diet and exercise.'},
    {'ask': 'Which gland is often called the "master gland"?',
     'choices': ['The pituitary gland', 'The thyroid gland',
                 'The pancreas', 'The adrenal gland'],
     'answer': 'The pituitary gland',
     'why': 'It sits in the brain and releases hormones that control other glands — so it acts on '
            'the body mostly by telling the thyroid, ovaries and testes what to do.'},
    {'ask': 'What happens to the blood vessels near the skin when you are too hot?',
     'choices': ['They widen, so more blood flows near the surface and more heat is lost',
                 'They narrow, so less heat is lost',
                 'They move closer to the bone',
                 'They stop carrying blood'],
     'answer': 'They widen, so more blood flows near the surface and more heat is lost',
     'why': 'That is vasodilation. The vessels themselves do not move — the arterioles supplying the '
            'surface capillaries simply widen, so more blood passes close to the air.'},
])

quiz('Biology', 'Homeostasis & Response', 'GCSE-H', [
    {'ask': 'What is negative feedback?',
     'choices': ['A change away from the set point triggers a response that reverses it',
                 'A change is made larger by the response',
                 'The body ignores small changes',
                 'Two hormones are released at the same time'],
     'answer': 'A change away from the set point triggers a response that reverses it',
     'why': 'It is the shape of every homeostatic system here — thyroxine, insulin and glucagon, '
            'temperature, water. Too high triggers lowering, too low triggers raising, so the level '
            'oscillates gently around a set point rather than drifting.'},
    {'ask': 'Which hormone controls the amount of water reabsorbed by the kidney?',
     'answer': 'ADH',
     'accept': 'adh|antidiuretic hormone|anti-diuretic hormone|anti diuretic hormone|vasopressin',
     'why': 'ADH is released by the pituitary when the blood is too concentrated. It makes the '
            'kidney tubules more permeable, so more water is reabsorbed and the urine is smaller in '
            'volume and more concentrated.'},
    {'ask': 'In the kidney, what happens during selective reabsorption?',
     'choices': ['All the glucose and some water and ions are taken back into the blood',
                 'Urea is taken back into the blood',
                 'Protein is filtered out of the blood',
                 'Water is removed from the blood'],
     'answer': 'All the glucose and some water and ions are taken back into the blood',
     'why': 'Filtration is indiscriminate — glucose, ions, water and urea all leave the blood. '
            'Reabsorption is where the choosing happens: glucose is far too valuable to lose, so all '
            'of it comes back, and urea is left to go.'},
    {'ask': 'A person is frightened. Which hormone is released and what does it do?',
     'choices': ['Adrenaline — it increases heart rate and delivers more oxygen and glucose to muscles',
                 'Insulin — it lowers blood glucose so the body can rest',
                 'Thyroxine — it slows the metabolic rate',
                 'ADH — it makes the kidneys produce more urine'],
     'answer': 'Adrenaline — it increases heart rate and delivers more oxygen and glucose to muscles',
     'why': 'It is the fight-or-flight response, from the adrenal glands. Everything it does points '
            'one way: more respiration in the muscles, right now.'},
    {'ask': 'Auxin collects on the shaded side of a shoot. What does the shoot do and why?',
     'choices': ['It bends towards the light, because auxin makes those cells elongate more',
                 'It bends away from the light, because auxin kills the shaded cells',
                 'It grows straight up, because auxin is spread evenly',
                 'It stops growing until the light is even'],
     'answer': 'It bends towards the light, because auxin makes those cells elongate more',
     'why': 'More elongation on the shaded side makes that side longer, so the shoot curves the '
            'other way — towards the light. In a root auxin does the reverse, inhibiting elongation, '
            'which is why roots grow down.'},
])

# ------------------------------------------------------------------- Ecology

quiz('Biology', 'Ecology', 'KS3', [
    {'ask': 'In the food chain grass → rabbit → fox, what is the rabbit?',
     'choices': ['A primary consumer', 'A producer', 'A predator only', 'A decomposer'],
     'answer': 'A primary consumer',
     'why': 'The producer is the grass, which makes its own food. The first thing to eat it is the '
            'primary consumer; the fox is the secondary consumer.'},
    {'ask': 'What does the arrow in a food chain show?',
     'choices': ['The direction energy is transferred', 'Which animal is bigger',
                 'Which animal hunts first', 'The order the animals appeared'],
     'answer': 'The direction energy is transferred',
     'why': 'The arrow points from the thing eaten to the thing eating it — energy flowing that way. '
            'Drawing it backwards is the commonest mistake in the whole topic.'},
    {'ask': 'What is a habitat?',
     'choices': ['The place where an organism lives',
                 'All the organisms living in one place',
                 'The food an organism eats',
                 'A group of the same species'],
     'answer': 'The place where an organism lives',
     'why': 'Habitat is the place; population is all of one species there; community is all the '
            'species together; ecosystem is the community plus the non-living conditions.'},
    {'ask': 'Name one thing plants compete with each other for.',
     'answer': 'Light',
     'accept': 'light|water|space|minerals|mineral ions|nutrients|room|sunlight',
     'why': 'Plants compete for light, space, water and mineral ions from the soil. Animals compete '
            'for food, water, territory and mates — different lists, because they need different '
            'things.'},
    {'ask': 'What do decomposers do?',
     'choices': ['Break down dead material and return nutrients to the soil',
                 'Eat live animals',
                 'Make food using sunlight',
                 'Stop plants growing too fast'],
     'answer': 'Break down dead material and return nutrients to the soil',
     'why': 'Bacteria and fungi recycle the elements locked up in dead bodies and waste. Without '
            'them nothing would be released back, and the nutrients would run out.'},
])

quiz('Biology', 'Ecology', 'GCSE-F', [
    {'ask': 'What is a quadrat used for?',
     'choices': ['Sampling the number of organisms in a known area',
                 'Measuring light intensity',
                 'Measuring the pH of soil',
                 'Catching small animals'],
     'answer': 'Sampling the number of organisms in a known area',
     'why': 'Counting everything is impossible, so you count a known area and scale up. Placing the '
            'quadrats randomly is what makes that scaling honest — choosing where to put them biases '
            'the answer.'},
    {'ask': 'Five quadrats of 1 m² contain 3, 5, 4, 6 and 2 daisies. Estimate the number in a '
            '200 m² field.',
     'choices': ['800', '400', '200', '4000'],
     'answer': '800',
     'why': 'Mean per m² = (3+5+4+6+2) ÷ 5 = 4. Then 4 × 200 = 800. Find the mean '
            'first, then scale — scaling one quadrat would be a guess with arithmetic on it.'},
    {'ask': 'Name one abiotic factor that affects a community.',
     'answer': 'Temperature',
     'accept': 'temperature|light|light intensity|water|moisture|ph|soil ph|wind|wind intensity|'
               'carbon dioxide|oxygen|mineral content|soil|rainfall',
     'why': 'Abiotic means non-living — temperature, light, moisture, pH, wind, gas levels. Biotic '
            'factors are the living ones: predators, food, disease, competition.'},
    {'ask': 'Which process removes carbon dioxide from the atmosphere?',
     'choices': ['Photosynthesis', 'Respiration', 'Combustion', 'Decay'],
     'answer': 'Photosynthesis',
     'why': 'Photosynthesis is the only one on that list that takes carbon dioxide in. The other '
            'three all release it — which is why the balance between them is the whole carbon cycle.'},
    {'ask': 'Why is biodiversity important?',
     'choices': ['A greater variety of species makes an ecosystem more stable',
                 'It makes ecosystems easier to count',
                 'It reduces the number of decomposers needed',
                 'It stops competition between species'],
     'answer': 'A greater variety of species makes an ecosystem more stable',
     'why': 'With many species, no one of them is essential to everything else — so losing one does '
            'not collapse the web. Low biodiversity means every link matters, which is fragile.'},
])

quiz('Biology', 'Ecology', 'GCSE-H', [
    {'ask': 'Roughly what percentage of biomass is transferred from one trophic level to the next?',
     'choices': ['About 10%', 'About 50%', 'About 90%', 'About 1%'],
     'answer': 'About 10%',
     'why': 'Most is lost as faeces, urea, and as heat from respiration; some of the level below is '
            'never eaten at all. That 90% loss each step is why food chains are rarely more than '
            'four or five links long.'},
    {'ask': 'A trophic level has 20 000 kJ of biomass. The one above has 1 800 kJ. What is the '
            'efficiency of transfer?',
     'choices': ['9%', '11%', '18%', '90%'],
     'answer': '9%',
     'why': '1800 ÷ 20000 = 0.09, so 9%. Efficiency is always the level above divided by the '
            'level below — getting it the other way up gives an answer over 100%, which is the tell.'},
    {'ask': 'Which conditions make decay fastest?',
     'choices': ['Warm, moist and with plenty of oxygen',
                 'Cold, dry and with plenty of oxygen',
                 'Warm, dry and with no oxygen',
                 'Cold, moist and with no oxygen'],
     'answer': 'Warm, moist and with plenty of oxygen',
     'why': 'Decomposers are living things respiring, so they want what any organism wants — warmth '
            'for enzyme activity, water, and oxygen. Freezing, drying and sealing food are the three '
            'ways of preserving it, and each removes one of those.'},
    {'ask': 'What does eutrophication do to a body of water?',
     'choices': ['Fertiliser causes algae to bloom, and their decay uses up the oxygen',
                 'It makes the water more acidic so fish cannot breathe',
                 'It removes all the nutrients so plants die',
                 'It raises the temperature until fish die'],
     'answer': 'Fertiliser causes algae to bloom, and their decay uses up the oxygen',
     'why': 'The chain matters: nutrients → algal bloom → light blocked → plants die '
            '→ decomposers multiply → oxygen used up → fish suffocate. The fertiliser '
            'never poisons anything directly.'},
    {'ask': 'Why can a pyramid of numbers be misleading where a pyramid of biomass is not?',
     'choices': ['One large producer such as a tree supports many consumers, so it is not pyramid-shaped',
                 'Numbers are harder to count accurately',
                 'Biomass is always measured in kilograms',
                 'Pyramids of number ignore decomposers'],
     'answer': 'One large producer such as a tree supports many consumers, so it is not pyramid-shaped',
     'why': 'A single oak feeding thousands of caterpillars gives an upside-down bar at the bottom. '
            'Biomass counts mass rather than individuals, so the tree outweighs the caterpillars and '
            'the pyramid comes out the right way up.'},
])

# ------------------------------------------------------ Inheritance & Evolution

quiz('Biology', 'Inheritance & Evolution', 'KS3', [
    {'ask': 'Where in a cell is DNA found?',
     'choices': ['In the chromosomes inside the nucleus', 'In the cytoplasm only',
                 'In the cell membrane', 'In the mitochondria only'],
     'answer': 'In the chromosomes inside the nucleus',
     'why': 'A chromosome is one long DNA molecule coiled up. A human body cell has 23 pairs — one '
            'of each pair from each parent.'},
    {'ask': 'What is a gene?',
     'choices': ['A short section of DNA that codes for a protein',
                 'A whole chromosome',
                 'A type of cell',
                 'The male and female sex cells'],
     'answer': 'A short section of DNA that codes for a protein',
     'why': 'Gene → protein → characteristic. That chain is why a change in one gene can '
            'change something visible about a whole organism.'},
    {'ask': 'Which of these is an inherited characteristic?',
     'choices': ['Natural eye colour', 'A scar', 'A tattoo', 'Speaking French'],
     'answer': 'Natural eye colour',
     'why': 'Inherited characteristics are coded by genes passed from parents. The other three are '
            'acquired during life, so they are not passed on.'},
    {'ask': 'What are the sex cells in humans called?',
     'answer': 'Gametes',
     'accept': 'gametes|gamete|sperm and egg|egg and sperm|sperm and ova|sperm and ovum|sex cells',
     'why': 'The gametes are the sperm and the egg. Each carries half the usual number of '
            'chromosomes, so when they join the full number is restored.'},
    {'ask': 'Charles Darwin’s theory is called...',
     'choices': ['natural selection', 'inheritance of acquired characteristics',
                 'spontaneous generation', 'selective breeding'],
     'answer': 'natural selection',
     'why': 'Individuals vary; those best suited survive and breed; their offspring inherit those '
            'features. Lamarck’s idea — that a characteristic gained in life is passed on — is '
            'the one that turned out to be wrong.'},
])

quiz('Biology', 'Inheritance & Evolution', 'GCSE-F', [
    {'ask': 'An allele that is expressed even when only one copy is present is called...',
     'choices': ['dominant', 'recessive', 'homozygous', 'heterozygous'],
     'answer': 'dominant',
     'why': 'A recessive allele only shows when both copies are recessive. So a dominant '
            'characteristic can be carried by someone heterozygous, and a recessive one cannot be.'},
    {'ask': 'A person has the genotype Bb. Are they homozygous or heterozygous?',
     'answer': 'Heterozygous',
     'accept': 'heterozygous|hetrozygous|heterozygote',
     'why': 'Two different alleles is heterozygous; two the same — BB or bb — is homozygous.'},
    {'ask': 'Two heterozygous parents (Bb × Bb) have a child. What fraction of offspring would '
            'be expected to show the recessive characteristic?',
     'choices': ['1 in 4', '1 in 2', '3 in 4', 'None'],
     'answer': '1 in 4',
     'why': 'The Punnett square gives BB, Bb, Bb, bb. Only bb shows the recessive characteristic, so '
            '1 in 4 — and 3 in 4 show the dominant one.'},
    {'ask': 'How many chromosomes are in a human body cell?',
     'choices': ['46', '23', '92', '48'],
     'answer': '46',
     'why': '23 pairs, so 46 in total. A gamete has 23 — the single set — which is why a sperm and '
            'an egg together make 46 again.'},
    {'ask': 'What is selective breeding?',
     'choices': ['Humans choosing which organisms breed, to get a desired characteristic',
                 'Organisms choosing their own mates',
                 'Moving a gene from one organism to another',
                 'Making identical copies of an organism'],
     'answer': 'Humans choosing which organisms breed, to get a desired characteristic',
     'why': 'It is natural selection with a person doing the selecting. Repeated over generations it '
            'narrows the gene pool, which is why selectively bred animals are prone to inherited '
            'disease. Moving a gene is genetic engineering, and copying is cloning.'},
])

quiz('Biology', 'Inheritance & Evolution', 'GCSE-H', [
    {'ask': 'Cystic fibrosis is caused by a recessive allele. Two carriers have a child. What is the '
            'probability the child has the disorder?',
     'choices': ['25%', '50%', '75%', '0%'],
     'answer': '25%',
     'why': 'A carrier is heterozygous, so Ff × Ff gives FF, Ff, Ff, ff. Only ff has the '
            'disorder — 25% — while 50% are carriers like their parents and 25% carry nothing.'},
    {'ask': 'How does meiosis differ from mitosis?',
     'choices': ['It makes four genetically different cells with half the chromosome number',
                 'It makes two identical cells with half the chromosome number',
                 'It makes four identical cells with the full chromosome number',
                 'It makes two different cells with the full chromosome number'],
     'answer': 'It makes four genetically different cells with half the chromosome number',
     'why': 'Two divisions, one copying — that is what halves the number. The differences come from '
            'the pairs separating at random and from crossing over, which is where the variation in '
            'sexual reproduction comes from.'},
    {'ask': 'What is speciation?',
     'choices': ['Two populations become so different they can no longer interbreed successfully',
                 'One species becoming extinct',
                 'A species moving to a new habitat',
                 'A gene being transferred between two species'],
     'answer': 'Two populations become so different they can no longer interbreed successfully',
     'why': 'Isolation stops the gene pools mixing; different conditions select for different '
            'features; the differences accumulate. The test is fertile offspring — once that fails, '
            'they are two species.'},
    {'ask': 'Why is a bacterium that survives an antibiotic a problem?',
     'choices': ['It reproduces rapidly and passes the resistance on, so a resistant strain spreads',
                 'It becomes larger than other bacteria',
                 'It makes the antibiotic poisonous',
                 'It can no longer be killed by the immune system'],
     'answer': 'It reproduces rapidly and passes the resistance on, so a resistant strain spreads',
     'why': 'This is natural selection running in days rather than millennia, because bacteria '
            'divide so fast. The antibiotic does not cause the mutation — it selects the mutants that '
            'were already there.'},
    {'ask': 'In genetic engineering, what is used to cut a gene out of a chromosome?',
     'choices': ['Enzymes', 'Acid', 'Heat', 'Electricity'],
     'answer': 'Enzymes',
     'why': 'Restriction enzymes cut the DNA, leaving sticky ends; ligase joins the gene into a '
            'vector — a plasmid or a virus — which carries it into the target cell. Enzymes do both '
            'the cutting and the joining.'},
])
