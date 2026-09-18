#!/usr/bin/env python3
"""AQA GCSE Physics 8463/1H, June 2024 — 43 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the ten boxes down the margin say 10, 10, 9, 10, 13, 9, 8, 8, 11, 12. Both
are asserted below, so a dropped part or a misread mark count fails here rather than shipping.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Higher)_ Paper 1 - June 2024 (2).pdf`, which is AQA's
own 8463/1H scheme — read, not derived. The 2017 Highers are why that is the rule: four answers
there were subtly wrong because they were worked out rather than looked up.

THREE ANSWERS ARE PICTURES AND WERE RENDERED RATHER THAN GUESSED. 03.2 (which graph), 05.4 (draw a
thermistor) and 10.2 (draw a fuse) print a drawing in the scheme and nothing in the text layer. All
three were rendered at scale and looked at — "a screenshot is the last word on a drawing", which
this repository has now written five times.

AND WHAT THE FIGURES CARRY IS SAID RATHER THAN INVENTED. Six questions hang off a figure that is
artwork in the PDF: a circuit, two graphs a value is read off, a fission diagram. Those parts carry
`figure` so `check-library.js` counts them, and where the SCHEME states the value the figure would
have given (80 ohms at 20 degrees, 3 cm, 7.1e20 Bq) it is in `examiner_note` attributed to the
scheme — never written into the question as though the paper had printed it.
"""
import json, datetime, pathlib, sys

PAPER = 'P-AQA-8463-2406-1H'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Higher', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8463/1H', exam_wave='First wave', year='2024', month='5', paper='1',
           exam_date='2024-05-22', document_type='Past paper', name='Paper 1 — June 2024',
           active='True', trackable='True', printable='False')

E = 'Energy'; EL = 'Electricity'; PM = 'Particle Model of Matter'; F = 'Forces'; AT = 'Atomic Structure'

# (q, part, marks, answer_type, topics, figure, html, answer, examiner_note)
Q = [
("1","1",1,"short",E,"", "<p>Wind turbines may generate electricity when the electricity is not needed. Two methods that can be used to store the energy from the turbine are:</p><p><b>Method A:</b> Heating water to a high temperature.<br><b>Method B:</b> Pumping water uphill into a reservoir.</p><p>Which energy store increases when water is heated?</p>",
 "Thermal (internal) energy store — or the kinetic store of the water particles", ""),
("1","2",1,"short",E,"", "<p>Which energy store increases when water is pumped uphill into a reservoir?</p>",
 "Gravitational potential energy store", ""),
("1","3",4,"written",E,"", "<p><b>Table 1</b> shows information about the two methods of storing energy.</p><table><tr><th>Method</th><th>Energy stored per 100 kg of water in kJ</th><th>Percentage of stored energy wasted</th><th>Installation</th></tr><tr><td>A: Increasing water temperature by 80 °C</td><td>33 600</td><td>40%</td><td>Anywhere</td></tr><tr><td>B: Pumping water uphill to a height of 500 m</td><td>490</td><td>25%</td><td>High mountains</td></tr></table><p>Compare the advantages and disadvantages of the two methods of storing energy. Include calculations in your answer.</p>",
 "Level-marked out of 4. Method A: useful energy per 100 kg = 20 160 kJ, wasted = 13 440 kJ, efficiency 60%; stores far more energy per 100 kg, but the hot water needs insulating. Method B: useful = 367.5 kJ, wasted = 122.5 kJ, efficiency 75%; more efficient, but needs a high mountain site. A Level 2 answer uses the table in a calculation that compares the two.", ""),
("1","4",4,"explain",E,"", "<p>Decreasing the amount of carbon dioxide released by different activities will help slow down climate change. Transport and generating electricity are the two activities that released the largest amounts of carbon dioxide in the UK in 2018.</p><p>Explain <b>one</b> change that would reduce the amount of carbon dioxide released by <b>each</b> activity.</p>",
 "Transport: stop burning petrol or diesel, and use electric or hydrogen cars, a bicycle, public transport or walking instead. Generating electricity: stop using coal, oil or gas, and use renewables or nuclear instead — or use fewer appliances, to cut the demand for electricity generated from fossil fuels. Two marks for each activity.", ""),

("2","1",3,"short",AT,"diagram", "<p>The process of nuclear fission is used in nuclear power stations. <b>Figure 2</b> shows the process of nuclear fission.</p><p>Complete the sentences. Choose answers from the box.</p><p><i>electrons &nbsp; gamma rays &nbsp; neutrons &nbsp; nuclei &nbsp; protons</i></p><p>In nuclear power stations, energy is released from uranium ............... .<br>The uranium in <b>Figure 2</b> splits into two parts and releases three ............... .<br>The process of nuclear fission releases electromagnetic radiation in the form of ............... .</p>",
 "nuclei; neutrons; gamma (rays) — this order only", "Figure 2, the fission diagram, is artwork in the PDF and is not transcribed."),
("2","2",1,"short",E,"", "<p>Write down the equation which links energy (<i>E</i>), power (<i>P</i>) and time (<i>t</i>).</p>",
 "energy = power × time, or E = P × t", ""),
("2","3",3,"calculation",E,"", "<p>A nuclear power station has a power output of 500 MW. Calculate the energy output in 3600 s. Give your answer in J.</p>",
 "1 800 000 000 000 J, or 1.8 × 10^12 J", ""),
("2","4",1,"short",AT,"", "<p>Radioactive waste produced by nuclear power stations has a long half-life. Suggest <b>one</b> precaution taken to reduce the hazard caused by radioactive waste from power stations.</p>",
 "Any one of: bury it; put it in cooling ponds; transport it in secure vessels; store it in metal containers; cover it in concrete", ""),
("2","5",2,"calculation",AT,"", "<p>Nuclear power stations do not generate electricity every day of the year. One nuclear power station generated electricity for 92% of a year.</p><p>one year = 365 days</p><p>Calculate the number of days during the year that the nuclear power station generated electricity.</p>",
 "335.8 days (335 or 336 also accepted)", ""),

("3","1",6,"written",EL,"circuit", "<p>A student investigated how the length of a wire affects the resistance of the wire at constant temperature. <b>Figure 3</b> shows the circuit used.</p><p>The student plotted a graph of resistance against the length of wire. Describe a method the student could have used to collect the data needed to plot the graph.</p>",
 "Level-marked out of 6. Measure the length of wire between the crocodile clips with a ruler; vary the length by moving the clips; measure the current with an ammeter and the potential difference with a voltmeter; record both for each length; use V = IR to calculate the resistance for each length. Also: repeat and mean the readings, remove anomalies, keep the current low so the wire does not heat, and disconnect the circuit between readings.",
 "Figure 3, the circuit diagram, is artwork in the PDF and is not transcribed."),
("3","2",1,"short",EL,"graph", "<p>Which graph shows the relationship between the resistance of a wire at constant temperature and its length?</p><p>Tick one box.</p>",
 "The straight line through the origin — resistance is directly proportional to length",
 "The four graphs to choose between are artwork in the PDF. The mark scheme prints the answer as a straight line from the origin, resistance against length, which was read off a render of the scheme rather than described from memory."),
("3","3",2,"explain",EL,"", "<p>The student used a cell that had a potential difference of 1.50 V. Explain why the cell was not an electrical hazard to the student in the investigation.</p>",
 "The potential difference is very low, so there is no risk of electric shock", ""),

("4","1",3,"explain",EL,"photo", "<p>A static electricity generator has a rubber belt turned by a motor, and as the belt moves charge is transferred from the belt to the metal dome. <b>Figure 5</b> shows a student touching the metal dome. The dome is negatively charged.</p><p>Explain why the student’s hair stands up on end.</p>",
 "Electrons are transferred to the student, so her hair is negatively charged, and like charges repel", "Figures 4 and 5 are photographs in the PDF and are not transcribed."),
("4","2",1,"short",EL,"", "<p>The charged metal dome creates an electric field. What is an electric field?</p>",
 "The region around a charged object where another charged object experiences a force", ""),
("4","3",1,"short",EL,"", "<p>How does the electric field strength vary as the distance from the charged metal dome increases?</p>",
 "It decreases", ""),
("4","4",4,"calculation",EL,"diagram", "<p><b>Figure 6</b> shows the negatively charged metal dome and an earthed conductor. When the earthed conductor is moved towards the metal dome, there is a spark between the dome and the earthed conductor.</p><p>The spark transfers 0.60 J of energy, and 2.0 µC of charge is transferred from the dome to the earthed conductor. Calculate the potential difference between the metal dome and the earthed conductor.</p>",
 "300 000 V", "Figure 6 is artwork in the PDF and is not transcribed."),
("4","5",1,"short",EL,"", "<p>Which of the following changes would increase the distance a spark can jump between the dome and the earthed conductor? Tick one box.</p><ul><li>Decreased charge on the metal dome</li><li>Decreased electric field strength</li><li>Decreased electrical resistance of air</li><li>Decreased potential difference</li></ul>",
 "Decreased electrical resistance of air", ""),

("5","1",2,"short",EL,"", "<p>A vending machine is connected to the mains electricity supply. What is the frequency and the potential difference of the mains electricity supply in the UK?</p>",
 "Frequency = 50 Hz; potential difference = 230 V", ""),
("5","2",4,"calculation",EL,"", "<p>The vending machine identifies the value of a coin by measuring the resistance of the coin. The power dissipated by the coin is 340 mW when the current in the coin is 0.75 A. Calculate the resistance of the coin.</p>",
 "0.60 Ω", ""),
("5","3",1,"short",EL,"", "<p>Coins that are dirty are not recognised by the vending machine. Suggest <b>one</b> reason why.</p>",
 "The dirt changes the measured resistance of the coin, so it does not match the resistance expected for that coin", ""),
("5","4",1,"drawing",EL,"circuit", "<p><b>Figure 8</b> shows part of a different circuit that is used to monitor the temperature inside the vending machine. The circuit symbol for a thermistor has not been included.</p><p>Draw the circuit symbol for a thermistor in the box below.</p>",
 "The resistor rectangle with a diagonal line drawn across it, turning horizontal at the lower left",
 "Figure 8 is a circuit diagram in the PDF and is not transcribed. The symbol was read off a render of the mark scheme."),
("5","5",5,"calculation",EL,"graph", "<p><b>Figure 9</b> shows how the resistance of the thermistor varies with temperature. The cooling system inside the vending machine turns on when the temperature of the thermistor is above 20 °C.</p><p>Determine the potential difference across the thermistor when the temperature is 20 °C.</p>",
 "2.0 V (1.8 V to 2.2 V accepted)",
 "Figure 9 is a graph in the PDF and is not transcribed, and Figure 8 carries the rest of the circuit. The mark scheme's own working gives the values the two figures supply: the thermistor reads about 80 ohms at 20 degrees Celsius, the fixed resistor is 400 ohms, and the supply is 12 V."),

("6","1",1,"short",E,"photo", "<p>In a ride at a theme park, a person is strapped into a pod that is attached to two stretched bungee cords. The bungee cords behave like springs.</p><p>Which energy store increases as the bungee cords are stretched?</p>",
 "Elastic potential energy store", "Figure 10 is a photograph in the PDF and is not transcribed."),
("6","2",6,"calculation",E + ', ' + F,"", "<p>When the pod is released, the pod accelerates upwards. Before the pod is released the extension of each of the two bungee cords is 8.0 m. The spring constant of each bungee cord is 735 N/m. The mass of the pod is 240 kg.</p><p>gravitational field strength = 9.8 N/kg</p><p>Calculate the maximum height reached by the pod.</p>",
 "20 m. One cord stores 0.5 × 735 × 8.0² = 23 520 J, so the two store 47 040 J; 47 040 = 240 × 9.8 × h", ""),
("6","3",2,"explain",E,"", "<p>The actual maximum height reached by the pod will be lower than the correct answer to Question 06.2 Explain why.</p>",
 "Air resistance opposes the pod's motion upwards, so not all of the elastic potential energy is transferred to the gravitational potential store", ""),

("7","1",1,"short",PM,"diagram", "<p>A student used a measuring cylinder containing some water to measure the volume of a metal ring. When measuring the volume, the student’s eye was in line with the level of the water.</p><p>Which type of error would have been caused if the student’s eye was not in line with the level of the water? Tick one box.</p><ul><li>Random error</li><li>Systematic error</li><li>Zero error</li></ul>",
 "Random error", "Figure 11 is artwork in the PDF and is not transcribed."),
("7","2",1,"short",PM,"", "<p>The student tied a piece of thick string to the metal ring and lowered the ring into the water. Suggest <b>one</b> reason why the student should have used thin string instead of thick string.</p>",
 "Thin string would affect the volume measurement less — it displaces less water", ""),
("7","3",1,"short",PM,"", "<p><b>Table 2</b> shows the results.</p><table><tr><th>Volume of water in cm³</th><th>Volume of water and ring in cm³</th><th>Volume of ring in cm³</th></tr><tr><td>5.0</td><td>5.4</td><td>0.4</td></tr></table><p>The true volume of the ring was 0.44 cm³. Even without using the string, the measuring cylinder could not give an accurate value for the volume of the ring. Give <b>one</b> reason why.</p>",
 "The measuring cylinder cannot be read to two decimal places — its resolution is 0.2 cm³", ""),
("7","4",1,"short",PM,"", "<p>The student used a balance to measure the mass of the ring. After the ring was removed from the balance, the reading on the balance was 0.02 g. How could the student use the readings from the balance to determine the correct mass of the ring?</p>",
 "Subtract 0.02 g from the measured value", ""),
("7","5",4,"calculation",PM,"", "<p>The student determined that the density of the ring was 21 500 kg/m³. The volume of the ring was 0.44 cm³. Calculate the mass of the ring. Give your answer in kg.</p>",
 "0.00946 kg, or 9.46 × 10^−3 kg", ""),

("8","1",3,"explain",PM,"diagram", "<p>A student investigated how the pressure in a fixed mass of air varies with the volume of the air. When the plunger was pushed slowly into the syringe, the pressure in the syringe increased. The temperature of the air remained constant.</p><p>Explain why the pressure increased.</p>",
 "The air particles are closer together, so the frequency of collisions between the particles and the syringe walls increases, giving a larger total force on a smaller surface area",
 "Figure 12 is artwork in the PDF and is not transcribed."),
("8","2",1,"short",PM,"diagram", "<p>A fire piston is a special type of syringe that can be used to start fires. The plunger is pushed quickly downwards and compresses the air. When the air is compressed quickly, the temperature of the air increases.</p><p>How does an increase in temperature affect the air particles inside the piston? Tick one box.</p><ul><li>The mean kinetic energy of the particles increases.</li><li>The mean potential energy of the particles increases.</li><li>The mean separation of the particles increases.</li></ul>",
 "The mean kinetic energy of the particles increases", "Figure 13 is artwork in the PDF and is not transcribed."),
("8","3",4,"calculation",PM + ', ' + E,"", "<p>When the air is hot enough, a small piece of cotton wool in the piston catches fire. The energy transferred to the air in the piston is 0.0130 J. The mass of air in the piston is 2.60 × 10⁻⁸ kg.</p><p>specific heat capacity of air = 1.01 kJ/kg °C</p><p>Calculate the temperature change of the air.</p>",
 "495 °C", ""),

("9","1",3,"explain",AT,"graph", "<p>A teacher investigated the radiation emitted by two different radioactive sources, A and B, measuring the count rate at different distances for each source. <b>Figure 15</b> shows the results.</p><p>Explain how <b>Figure 15</b> shows that Source A only emits alpha radiation.</p>",
 "Radiation from Source A travels about 3 cm in air, after which the count rate falls to the background level, because alpha radiation has a short range in air",
 "Figures 14 and 15 are artwork in the PDF and are not transcribed. The 3 cm is the mark scheme's own reading of Figure 15."),
("9","2",2,"explain",AT,"", "<p><b>Figure 15</b> can not be used to determine if Source B emits beta radiation or gamma radiation. Explain how an absorbing material could be used to show which type of radiation is emitted by Source B.</p>",
 "Use an aluminium sheet, which beta radiation will not penetrate but gamma will — so only gamma gets through", ""),
("9","3",1,"short",AT,"", "<p>The teacher took safety precautions during the experiment. Suggest <b>one</b> safety precaution the teacher would have taken to reduce the radiation dose the teacher received.</p>",
 "Any one of: increase the distance between source and teacher; limit the exposure time; use tongs or forceps; wear a lead apron; keep the source in a box unless in use; stand behind a safety screen; point the source away", ""),
("9","4",1,"short",AT,"", "<p>Suggest <b>one</b> safety precaution that the teacher would have taken to avoid becoming contaminated.</p>",
 "Wear gloves, an apron or a lab coat, or handle the source with tongs or forceps", ""),
("9","5",4,"calculation",AT,"graph", "<p><b>Figure 16</b> shows how the number of atoms of a radioactive element in a sample varied with time. Activity is the rate at which a source of unstable nuclei decays.</p><p>Determine the activity of the radioactive sample at 300 seconds. Give the unit.</p>",
 "7.1 × 10²⁰ becquerel (Bq) — anything from 6.5 to 7.6 × 10²⁰ is accepted. Draw a tangent to the curve at 300 s and find its gradient.",
 "Figure 16 is a graph in the PDF and is not transcribed. The value is the mark scheme's own."),

("10","1",1,"short",EL,"", "<p>The live wire in a three-core cable is connected to a fuse inside a plug. A fuse contains a wire that is designed to melt when the current gets too great.</p><p>What colour is the insulation covering the live wire in a three-core cable?</p>",
 "Brown", ""),
("10","2",1,"drawing",EL,"", "<p>Draw the circuit symbol for a fuse in the box below.</p>",
 "A rectangle with a horizontal line drawn through it, the line continuing out of both ends",
 "The symbol was read off a render of the mark scheme."),
("10","3",4,"calculation",EL,"", "<p>The fuse wire melts when there is a charge flow of 2.0 C for 400 ms. Calculate the current in the fuse wire.</p>",
 "5.0 A", ""),
("10","4",4,"calculation",PM,"", "<p>When the fuse wire is at its melting point, the additional energy needed to melt the wire is 1.02 J.</p><p>specific latent heat of fuse wire = 60 kJ/kg</p><p>Calculate the mass of the fuse wire.</p>",
 "1.7 × 10⁻⁵ kg", ""),
("10","5",2,"explain",E + ', ' + PM,"", "<p>The calculation in Question 10.4 assumes there is no energy transferred to the surroundings. How would the time taken for the wire to melt be affected if some energy was transferred to the surroundings? Give a reason for your answer. Tick one box.</p><ul><li>Time taken would decrease</li><li>Time taken would stay the same</li><li>Time taken would increase</li></ul>",
 "Time taken would increase, because more energy would need to be transferred in total", ""),
]

# ---- the paper says what it is out of, and so does every question box down the margin ----
PER_QUESTION = {"1": 10, "2": 10, "3": 9, "4": 10, "5": 13, "6": 9, "7": 8, "8": 8, "9": 11, "10": 12}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())
d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 5

rows = []
for q, part, marks, atype, topics, figure, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8463-2406-1H-%02d%s' % (int(q), part), kind='question',
             question=q, part=part, section='', marks=str(marks), html=html,
             answer=answer, answer_type=atype, topics=topics, figure=figure,
             diagram='', diagram_by='', placeholder='')
    if note:
        r['examiner_note'] = note
    rows.append(r)

p = pathlib.Path('/home/user/family/data/questions.json')
lines = p.read_text().rstrip('\n').split('\n')
assert lines[0] == '[' and lines[-1] == ']'
seen = {json.loads(l.rstrip(','))['row_id'] for l in lines if '"row_id"' in l}
clash = seen & {r['row_id'] for r in rows}
assert not clash, 'row ids already in the file: %r' % sorted(clash)

lines[-2] += ','
for r in rows[:-1]:
    lines.insert(-1, json.dumps(r) + ',')
lines.insert(-1, json.dumps(rows[-1]))
p.write_text('\n'.join(lines) + '\n')
print('wrote %d question rows for %s, %d marks' % (len(rows), PAPER, sum(got.values())))
