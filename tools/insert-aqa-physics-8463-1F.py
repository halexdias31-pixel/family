#!/usr/bin/env python3
"""AQA GCSE Physics 8463/1F, June 2024 — 61 question rows into data/questions.json.

WHY THIS IS A SCRIPT AND NOT A HAND EDIT. CLAUDE.md: "Every number in a transcription is checked
against the paper's own stated total ... and the insert script asserts it before writing a row."
The cover says 100 and the margin boxes say 8, 10, 11, 9, 8, 9, 9, 7, 10, 10, 9.

WHERE EVERY ANSWER CAME FROM. `Mark scheme (Foundation)_ Paper 1 - June 2024 (2).pdf`, AQA's own
8463/1F scheme — read, not derived.

THE TIER OVERLAP IS THREE WHOLE QUESTIONS AGAIN. 09, 10 and 11 here are 01, 02 and 03 of 8463/1H,
word for word; question 5 is 1H's question 8 with the specific heat capacity written 1010 J/kg °C
instead of 1.01 kJ/kg °C, and question 7 is 1H's question 10 with different numbers in the fuse
calculation. Both schemes were read side by side. Transcribed again rather than cross-referenced —
a row belongs to the paper a student is holding.

NOTHING IS DRAWN ON THIS PAPER. Its eighteen figures are photographs and apparatus drawings, two
sets of field-pattern and circuit-symbol options, a thermistor graph read at two temperatures, and
an I-V characteristic read at one — and not one is a picture the row's own words determine. What
each SHOWS is written into its question, with the values the scheme itself quotes off the two
graphs: 200 ohms at 15 degrees, and 0.17 A at 3.0 V.
"""
import json, datetime, pathlib

PAPER = 'P-AQA-8463-2406-1F'
DOC = dict(paper_id=PAPER, subject='Physics', key_stage='KS4', band_type='stage',
           band_value='GCSE', tier='Foundation', level='GCSE', company='AQA', exam_board='AQA',
           spec_code='8463/1F', exam_wave='First wave', year='2024', month='5', paper='1',
           exam_date='2024-05-22', document_type='Past paper', name='Paper 1 — June 2024',
           active='True', trackable='True', printable='False')

E = 'Energy'; EL = 'Electricity'; PM = 'Particle Model of Matter'; AT = 'Atomic Structure'
F = 'Forces'

T1 = ('<table><tr><th>Volume of water in cm<sup>3</sup></th>'
      '<th>Volume of water and ring in cm<sup>3</sup></th>'
      '<th>Volume of ring in cm<sup>3</sup></th></tr>'
      '<tr><td>5.0</td><td>5.4</td><td><b>X</b></td></tr></table>')
T2 = ('<table><tr><th>Number of counts in 1 minute</th><th>No material</th>'
      '<th>One sheet of paper</th><th>Thick aluminium sheet</th></tr>'
      '<tr><td>No rock</td><td>21</td><td>20</td><td>22</td></tr>'
      '<tr><td>Rock A</td><td>450</td><td>448</td><td>18</td></tr>'
      '<tr><td>Rock B</td><td>385</td><td>387</td><td>356</td></tr>'
      '<tr><td>Rock C</td><td>870</td><td>21</td><td>20</td></tr>'
      '<tr><td>Rock D</td><td>620</td><td>473</td><td>214</td></tr></table>')
T3 = ('<table><tr><th>Potential difference in volts</th><th>1st reading</th><th>2nd reading</th>'
      '<th>3rd reading</th><th>Mean</th></tr>'
      '<tr><td>6.0</td><td>0.26</td><td>0.21</td><td>0.25</td><td><b>X</b></td></tr></table>')
T4 = ('<table><tr><th>Method</th><th>Energy stored per 100 kg of water in kJ</th>'
      '<th>Percentage of stored energy wasted</th><th>Installation</th></tr>'
      '<tr><td>A: Increasing water temperature by 80 °C</td><td>33 600</td><td>40%</td>'
      '<td>Anywhere</td></tr>'
      '<tr><td>B: Pumping water uphill to a height of 500 m</td><td>490</td><td>25%</td>'
      '<td>High mountains</td></tr></table>')

# (q, part, marks, answer_type, topics, figure, html, answer, examiner_note)
Q = [
("1","1",1,"short",EL,"diagram", "<p><b>Figure 1</b> is a drawing of a static electricity generator: a rubber belt turned by a motor, carrying charge up to a metal dome on a column. As the belt moves, charge is transferred from the belt to the dome.</p><p><b>Figure 2</b> shows a student touching the metal dome. The dome is negatively charged and the student's hair is standing on end.</p><p>Complete the sentence. Choose the answer from the box: <i>negative &nbsp; neutral &nbsp; positive</i></p><p>When the student touches the negatively charged metal dome the student's hair gains a ............... charge.</p>",
 "negative", "Figures 1 and 2 are artwork in the PDF; what they show is stated in the question."),
("1","2",1,"short",EL,"", "<p>Complete the sentence. Choose the answer from the box: <i>attraction &nbsp; gravity &nbsp; repulsion</i></p><p>The hair on the student's head stands up because the strands of hair experience forces of ............... .</p>",
 "repulsion — every strand has the same charge", ""),
("1","3",1,"short",EL,"diagram", "<p>Which of the following diagrams shows the electric field pattern around the negatively charged metal dome? The options are a sphere with straight field lines drawn radially, differing in which way the arrowheads point and whether the lines are radial at all. Tick <b>one</b> box.</p>",
 "The one with straight radial lines pointing INWARDS, towards the dome — a field line points the way a positive charge would be pushed, and a negative charge attracts one",
 "The field-pattern options are artwork in the PDF and the answer is a drawing in the scheme; both are described rather than reproduced."),
("1","4",1,"short",EL,"diagram", "<p><b>Figure 3</b> shows the negatively charged metal dome and an earthed conductor a short distance away from it, with air in the gap.</p><p>The air between the dome and the earthed conductor is an insulator.</p><p>Complete the sentence. Choose the answer from the box: <i>efficiency &nbsp; resistance &nbsp; temperature</i></p><p>The air between the dome and the earthed conductor has a high ............... .</p>",
 "resistance", "Figure 3 is artwork in the PDF; what it shows is stated in the question."),
("1","5",1,"short",EL,"", "<p>The earthed conductor is moved closer to the metal dome. A spark jumps from the dome to the earthed conductor.</p><p>Complete the sentence. Choose the answer from the box: <i>earthed &nbsp; ionised &nbsp; neutral</i></p><p>The spark jumps because the air around the charged dome has become ............... .</p>",
 "ionised", ""),
("1","6",1,"short",EL,"", "<p>Which particles are transferred when the spark jumps from the negatively charged metal dome to the earthed conductor? Tick <b>one</b> box.</p><ul><li>Electrons</li><li>Neutrons</li><li>Protons</li></ul>",
 "Electrons", ""),
("1","7",2,"calculation",EL,"", "<p>The potential difference between the metal dome and earth is 300 000 V. When the spark jumps there is a charge flow of 0.000 002 C.</p><p>Calculate the energy transferred by the spark. Use the equation:</p><p>energy transferred = charge flow × potential difference</p>",
 "0.6 J — 0.000 002 × 300 000", ""),

("2","1",1,"short",EL,"diagram", "<p><b>Figure 4</b> is a photograph of a student putting a coin into a vending machine that sells food. The vending machine is connected to the mains electricity supply.</p><p>What is the frequency of the mains electricity supply in the UK? Tick <b>one</b> box.</p><ul><li>50 hertz</li><li>60 hertz</li><li>100 hertz</li></ul>",
 "50 hertz", "Figure 4 is a photograph in the PDF and is not transcribed."),
("2","2",1,"short",EL,"", "<p>What is the potential difference of the mains electricity supply in the UK? Tick <b>one</b> box.</p><ul><li>12 volts</li><li>230 volts</li><li>20 000 volts</li></ul>",
 "230 volts", ""),
("2","3",2,"calculation",EL,"", "<p>The vending machine identifies the value of the coin by measuring the resistance of the coin. The machine applies a potential difference of 0.45 V across the coin. The current in the coin is 0.75 A.</p><p>Calculate the resistance of the coin. Use the equation:</p><p>resistance = potential difference ÷ current</p>",
 "0.60 Ω — 0.45 ÷ 0.75", ""),
("2","4",1,"short",EL,"diagram", "<p>The temperature inside the vending machine is monitored using an electrical circuit. <b>Figure 5</b> shows part of it: a battery with a thermistor and a 200 Ω resistor in series.</p><p>The circuit symbol for the thermistor in <b>Figure 5</b> is wrong.</p><p>What is the circuit symbol for a thermistor? The options are variations on a rectangle with a line through it. Tick <b>one</b> box.</p>",
 "A rectangle with a line entering at the bottom left, running up and then turning to the right along the top — the resistor box with the diagonal-and-foot marking that means temperature-dependent",
 "Figure 5 and the symbol options are artwork in the PDF and the answer is a drawing in the scheme; both are described rather than reproduced."),
("2","5",1,"short",EL,"diagram", "<p>How could the potential difference (pd) across the resistor be calculated? Tick <b>one</b> box.</p><ul><li>pd across battery − pd across thermistor</li><li>pd across battery + pd across thermistor</li><li>pd across battery × pd across thermistor</li><li>pd across battery ÷ pd across thermistor</li></ul>",
 "pd across battery − pd across thermistor — in a series circuit the two pds add up to the supply pd", ""),
("2","6",2,"explain",EL,"diagram", "<p>The battery in <b>Figure 5</b> supplies 3.0 V and the fixed resistor is 200 Ω.</p><p>At one temperature, the thermistor in <b>Figure 5</b> has a resistance of 200 Ω.</p><p>What is the potential difference across the thermistor at this temperature? Give a reason for your answer. Tick <b>one</b> box.</p><ul><li>0.0 V</li><li>1.0 V</li><li>1.5 V</li><li>2.0 V</li></ul>",
 "1.5 V, because the thermistor has the same resistance as the resistor — so the potential difference is shared equally between them, and each gets half of the 3.0 V", ""),
("2","7",2,"calculation",EL,"graph", "<p><b>Figure 6</b> is a graph of the resistance of the thermistor against temperature: the resistance falls steeply as the temperature rises, passing 600 Ω at 10 °C and 200 Ω at 15 °C.</p><p>When the temperature of the thermistor is 10 °C, the resistance of the thermistor is 600 Ω.</p><p>Calculate the change in resistance when the temperature increased from 10 °C to 15 °C.</p>",
 "400 Ω — the resistance at 15 °C is 200 Ω, and 600 − 200 = 400",
 "Figure 6 is a graph in the PDF; the value at 15 °C is the mark scheme's own reading."),

("3","1",1,"short",F,"diagram", "<p>In a ride at a theme park, a person is strapped into a pod that is attached to two stretched bungee cords. The bungee cords behave like springs. <b>Figure 7</b> is a photograph of a person using the ride, held down at ground level with the two cords running up to towers on either side.</p><p>How is the extension of each bungee cord calculated? Tick <b>one</b> box.</p><ul><li>stretched length + original length</li><li>stretched length − original length</li><li>stretched length × original length</li><li>stretched length ÷ original length</li></ul>",
 "stretched length − original length", "Figure 7 is a photograph in the PDF and is not transcribed."),
("3","2",2,"calculation",F,"", "<p>Before the pod is released, the extension of each bungee cord is 7.5 m.</p><p>spring constant of the bungee cord = 800 N/m</p><p>Calculate the elastic potential energy stored in each stretched bungee cord. Use the equation:</p><p>elastic potential energy = 0.5 × spring constant × (extension)<sup>2</sup></p>",
 "22 500 J — 0.5 × 800 × 7.5²", ""),
("3","3",2,"calculation",E,"", "<p>The maximum speed of the pod is 15 m/s. The mass of the pod is 240 kg.</p><p>Calculate the maximum kinetic energy of the pod. Use the equation:</p><p>kinetic energy = 0.5 × mass × (speed)<sup>2</sup></p>",
 "27 000 J — 0.5 × 240 × 15²", ""),
("3","4",1,"short",E,"", "<p>Which equation links gravitational field strength (<i>g</i>), gravitational potential energy (<i>E</i><sub>p</sub>), height (<i>h</i>) and mass (<i>m</i>)? Tick <b>one</b> box.</p><ul><li>E<sub>p</sub> = m × g ÷ h</li><li>E<sub>p</sub> = m ÷ (g × h)</li><li>E<sub>p</sub> = m × g × h</li></ul>",
 "E_p = m × g × h", ""),
("3","5",3,"calculation",E,"", "<p>The pod has 24 000 J of gravitational potential energy when at its maximum height. The mass of the pod is 240 kg.</p><p>gravitational field strength = 9.8 N/kg</p><p>Calculate the maximum height reached by the pod.</p>",
 "10.2 m — 24 000 = 240 × 9.8 × h, so h = 24 000 ÷ 2352. 10 m is accepted.", ""),
("3","6",2,"short",E,"", "<p>Why is the maximum gravitational potential energy of the pod less than the initial elastic potential energy of the bungee cords? Tick <b>two</b> boxes.</p><ul><li>Energy is created.</li><li>Energy is destroyed.</li><li>Energy is transferred to the surroundings.</li><li>Work is done against air resistance.</li><li>Work is done by the force of gravity.</li><li>Work is done by the person in the pod.</li></ul>",
 "Energy is transferred to the surroundings; work is done against air resistance", ""),

("4","1",1,"short",PM,"diagram", "<p><b>Figure 8</b> shows a measuring cylinder containing some water. It is graduated from 0.0 at the bottom to 10.0 at the top, with a line every 0.2 cm<sup>3</sup>.</p><p>What range of volumes can be measured using the measuring cylinder? Tick <b>one</b> box.</p><ul><li>0.0 to 0.2 cm<sup>3</sup></li><li>0.0 to 2.0 cm<sup>3</sup></li><li>0.0 to 10.0 cm<sup>3</sup></li></ul>",
 "0.0 to 10.0 cm³ — the range is the whole scale; 0.2 cm³ is the resolution",
 "Figure 8 is artwork in the PDF; what it shows is stated in the question."),
("4","2",1,"short",PM,"", "<p>A student used the measuring cylinder to measure the volume of a metal ring. The student tied the metal ring to some very thin string and lowered the ring into the measuring cylinder. The student could have used thick string instead of thin string.</p><p>How would using thick string have affected the measured volume of the metal ring? Tick <b>one</b> box.</p><ul><li>The measured volume would be smaller.</li><li>The measured volume would not be affected.</li><li>The measured volume would be larger.</li></ul>",
 "The measured volume would be larger — the string itself displaces water too", ""),
("4","3",1,"calculation",PM,"", "<p><b>Table 1</b> shows the results.</p>" + T1 + "<p>Calculate value <b>X</b> in <b>Table 1</b>.</p>",
 "0.4 cm³ — 5.4 − 5.0", ""),
("4","4",1,"short",PM,"", "<p>The student measured the volume of the ring three times. The results were all the same.</p><p>Which of the following describes the student's results? Tick <b>one</b> box.</p><ul><li>The results are anomalies.</li><li>The results are repeatable.</li><li>The results contain random errors.</li></ul>",
 "The results are repeatable", ""),
("4","5",1,"short",PM,"diagram", "<p>The student used a balance to measure the mass of the ring. <b>Figure 9</b> is a photograph of the balance. The student noticed that the balance had a reading of 0.02 g when there was no object on it.</p><p>How should the student correct this error after the mass of the ring had been measured? Tick <b>one</b> box.</p><ul><li>Add 0.02 to the measurement</li><li>Divide the measurement by 0.02</li><li>Multiply the measurement by 0.02</li><li>Subtract 0.02 from the measurement</li></ul>",
 "Subtract 0.02 from the measurement — it is a zero error and every reading is 0.02 g too big",
 "Figure 9 is a photograph in the PDF and is not transcribed."),
("4","6",1,"short",PM,"", "<p>Write down the equation which links density (ρ), mass (<i>m</i>) and volume (<i>V</i>).</p>",
 "density = mass ÷ volume, or ρ = m ÷ V", ""),
("4","7",3,"calculation",PM,"", "<p>A different metal ring has a volume of 0.3 cm<sup>3</sup>. The density of this ring is 22 g/cm<sup>3</sup>.</p><p>Calculate the mass of this ring. Give your answer in grams.</p>",
 "6.6 g — 22 = m ÷ 0.3, so m = 22 × 0.3", ""),

("5","1",1,"short",PM,"diagram", "<p>A student investigated how the pressure in a fixed mass of air varies with the volume of the air. <b>Figure 10</b> shows the equipment used: a sealed syringe with its nozzle connected to a pressure gauge. When the plunger was pushed slowly into the syringe, the temperature of the air stayed the same.</p><p>How did pushing the plunger in affect the volume of air in the syringe? Tick <b>one</b> box.</p><ul><li>The volume decreased.</li><li>The volume stayed the same.</li><li>The volume increased.</li></ul>",
 "The volume decreased", "Figure 10 is artwork in the PDF; what it shows is stated in the question."),
("5","2",1,"short",PM,"", "<p>How did pushing the plunger in affect the distance between the air particles in the syringe? Tick <b>one</b> box.</p><ul><li>The distance decreased.</li><li>The distance stayed the same.</li><li>The distance increased.</li></ul>",
 "The distance decreased", ""),
("5","3",1,"short",PM,"", "<p>How did pushing the plunger in affect the frequency of collisions between the air particles and the syringe walls? Tick <b>one</b> box.</p><ul><li>The frequency of collisions decreased.</li><li>The frequency of collisions stayed the same.</li><li>The frequency of collisions increased.</li></ul>",
 "The frequency of collisions increased", ""),
("5","4",1,"short",PM,"", "<p>How did pushing the plunger in affect the air pressure in the syringe? Tick <b>one</b> box.</p><ul><li>The air pressure decreased.</li><li>The air pressure stayed the same.</li><li>The air pressure increased.</li></ul>",
 "The air pressure increased", ""),
("5","5",1,"short",PM,"diagram", "<p>A fire piston is a special type of syringe that can be used to start fires. <b>Figure 11</b> shows one: a narrow cylinder with a plunger, and a small piece of cotton wool in the bottom. The plunger is pushed quickly downwards and compresses the air. When the air is compressed quickly, the temperature of the air increases.</p><p>How does an increase in temperature affect the mean speed of the air particles inside the syringe? Tick <b>one</b> box.</p><ul><li>The mean speed of the particles decreases.</li><li>The mean speed of the particles does not change.</li><li>The mean speed of the particles increases.</li></ul>",
 "The mean speed of the particles increases",
 "Figure 11 is artwork in the PDF; what it shows is stated in the question."),
("5","6",3,"calculation",PM,"", "<p>When the air is hot enough, a small piece of cotton wool in the piston catches fire. The energy transferred to the air in the piston is 0.0130 J. The mass of air in the piston is 2.60 × 10<sup>−8</sup> kg.</p><p>specific heat capacity of air = 1010 J/kg °C</p><p>Calculate the temperature change of the air. Use the Physics Equations Sheet.</p>",
 "495 °C — 0.0130 = 2.60 × 10⁻⁸ × 1010 × Δθ, so Δθ = 0.0130 ÷ 2.626 × 10⁻⁵", ""),

("6","1",2,"short",AT,"", "<p>A teacher measured the background radiation in a laboratory.</p><p>Which sources of background radiation are natural and which are man-made? Tick <b>one</b> box in each row: <b>cosmic rays</b>, <b>medical X-rays</b>, <b>nuclear accidents</b>, <b>radon gas</b>.</p>",
 "Natural: cosmic rays and radon gas. Man-made: medical X-rays and nuclear accidents. Two or three right scores 1 of the 2.", ""),
("6","2",2,"explain",AT,"diagram", "<p>The teacher measured the radiation emitted by four different types of radioactive rock. <b>Figure 12</b> shows the equipment: a detector clamped above a bench, with a rock placed below it and a space for a sheet of material in between. Each rock was placed below the detector one at a time and the radiation recorded as counts in 1 minute, with different materials between rock and detector.</p><p><b>Table 2</b> shows the results.</p>" + T2 + "<p>Which radioactive rock emitted <b>only</b> alpha radiation? Give a reason for your answer. Tick <b>one</b> box: <b>Rock A</b>, <b>Rock B</b>, <b>Rock C</b> or <b>Rock D</b>.</p>",
 "Rock C — one sheet of paper dropped its count from 870 to 21, the background level, because alpha is stopped by paper and is the least penetrating",
 "Figure 12 is artwork in the PDF; what it shows is stated in the question."),
("6","3",2,"explain",AT,"", "<p>Which radioactive rock emitted <b>only</b> beta radiation? Give a reason for your answer. Tick <b>one</b> box: <b>Rock A</b>, <b>Rock B</b>, <b>Rock C</b> or <b>Rock D</b>.</p>",
 "Rock A — paper made almost no difference (450 to 448) but thick aluminium dropped it to 18, the background level, because beta is stopped by aluminium and not by paper", ""),
("6","4",1,"short",AT,"", "<p>The teacher took safety precautions during the experiment.</p><p>Which precaution would prevent the teacher from becoming <b>contaminated</b> by the radioactive rocks? Tick <b>one</b> box.</p><ul><li>Displaying the radiation hazard symbol</li><li>Handling the rocks with clean hands</li><li>Wearing protective gloves</li></ul>",
 "Wearing protective gloves — contamination is getting the radioactive material itself on you", ""),
("6","5",1,"short",AT,"", "<p>What is the activity of each rock after one half-life? Tick <b>one</b> box.</p><ul><li>The activity is a quarter of the original activity.</li><li>The activity is half the original activity.</li><li>The activity is double the original activity.</li><li>The activity is zero.</li></ul>",
 "The activity is half the original activity", ""),
("6","6",1,"short",AT,"", "<p>How does the activity of a radioactive source affect the risk of harm from the source? Tick <b>one</b> box.</p><ul><li>The smaller the activity, the greater the risk of harm.</li><li>The activity does not affect the risk of harm.</li><li>The greater the activity, the greater the risk of harm.</li></ul>",
 "The greater the activity, the greater the risk of harm", ""),

("7","1",1,"short",EL,"diagram", "<p>An electrical appliance is connected to the mains electricity supply using a three-core cable. <b>Figure 13</b> shows one, cut back to reveal three insulated wires inside an outer sheath.</p><p>What colour is the insulation covering the <b>live</b> wire inside the cable? Tick <b>one</b> box.</p><ul><li>Blue</li><li>Brown</li><li>Green and yellow</li><li>Orange</li></ul>",
 "Brown", "Figure 13 is artwork in the PDF; what it shows is stated in the question."),
("7","2",1,"short",EL,"", "<p>What colour is the insulation covering the <b>neutral</b> wire inside the cable? Tick <b>one</b> box.</p><ul><li>Blue</li><li>Brown</li><li>Green and yellow</li><li>Orange</li></ul>",
 "Blue", ""),
("7","3",1,"short",EL,"diagram", "<p>The plug connected to the cable contains a fuse. A fuse contains a wire that is designed to melt when the current is too great.</p><p>What is the circuit symbol for a fuse? The options are variations on a rectangle with a line through or beside it. Tick <b>one</b> box.</p>",
 "A rectangle with a horizontal line drawn through it, the line continuing out of both ends",
 "The symbol options are artwork in the PDF and the answer is a drawing in the scheme; both are described rather than reproduced."),
("7","4",2,"calculation",EL,"", "<p>The wire in the fuse melts when there is a charge flow of 2.0 C in a time of 0.40 s.</p><p>Calculate the current in the wire when it melts. Use the equation:</p><p>current = charge flow ÷ time</p>",
 "5.0 A — 2.0 ÷ 0.40", ""),
("7","5",3,"calculation",PM,"", "<p>The mass of the wire is 0.016 g.</p><p>specific latent heat of fusion of the wire = 60 000 J/kg</p><p>Calculate the change in thermal energy needed to melt the wire. Use the Physics Equations Sheet.</p>",
 "0.96 J — convert 0.016 g to 1.6 × 10⁻⁵ kg first, then E = 0.000016 × 60 000", ""),
("7","6",1,"short",E,"", "<p>The fuse transfers some energy to the surroundings as it melts.</p><p>How does transferring energy to the surroundings affect the total energy needed to melt the fuse? Tick <b>one</b> box.</p><ul><li>The total energy will be smaller.</li><li>The total energy will be the same.</li><li>The total energy will be greater.</li></ul>",
 "The total energy will be greater", ""),

("8","1",2,"calculation",EL,"diagram", "<p>A student had an unknown electrical component inside a sealed box. <b>Figure 14</b> shows the circuit used to identify it: a cell, a variable resistor, an ammeter in series with the sealed box, and a voltmeter across it. The student varied the potential difference across the component and measured the current.</p><p><b>Table 3</b> shows the results when the potential difference was 6.0 V.</p>" + T3 + "<p>Calculate value <b>X</b> in <b>Table 3</b>.</p>",
 "0.24 A — (0.26 + 0.21 + 0.25) ÷ 3. Treating 0.21 as an anomaly and taking (0.26 + 0.25) ÷ 2 = 0.255 also scores both marks.",
 "Figure 14 is artwork in the PDF; what it shows is stated in the question."),
("8","2",3,"calculation",EL,"graph", "<p><b>Figure 15</b> shows the results as a graph of current against potential difference. The line passes through the origin, rises steeply at first and then bends over so that it gets less steep as the potential difference increases; at 3.0 V the current is 0.17 A.</p><p>Calculate the power of the component when the potential difference across the component is 3.0 V. Use <b>Figure 15</b> and the equation:</p><p>power = potential difference × current</p>",
 "0.51 W — read 0.17 A off the graph at 3.0 V, then 3.0 × 0.17. Any current from 0.16 to 0.18 A is accepted.",
 "Figure 15 is a graph in the PDF; the current at 3.0 V is the mark scheme's own reading."),
("8","3",1,"short",EL,"graph", "<p>Complete the sentence. Choose the answer from the box: <i>decreases &nbsp; stays the same &nbsp; increases</i></p><p>As the potential difference across the component increases, the gradient of the graph ............... .</p>",
 "decreases", ""),
("8","4",1,"short",EL,"graph", "<p>What is the component in the sealed box? Tick <b>one</b> box.</p><ul><li>Diode</li><li>Filament lamp</li><li>Resistor at constant temperature</li></ul>",
 "Filament lamp — the curve bends over because the filament heats up and its resistance rises", ""),

("9","1",1,"short",E,"diagram", "<p><b>Figure 16</b> is a photograph of a wind turbine. Wind turbines may generate electricity when the electricity is not needed. Two methods that can be used to store the energy from the turbine are:</p><p><b>Method A:</b> Heating water to a high temperature.<br><b>Method B:</b> Pumping water uphill into a reservoir.</p><p>Which energy store increases when water is heated?</p>",
 "The thermal (internal) energy store — or the kinetic store of the water particles",
 "Figure 16 is a photograph in the PDF and is not transcribed."),
("9","2",1,"short",E,"", "<p>Which energy store increases when water is pumped uphill into a reservoir?</p>",
 "The gravitational potential energy store", ""),
("9","3",4,"written",E,"", "<p><b>Table 4</b> shows information about the two methods of storing energy.</p>" + T4 + "<p>Compare the advantages and disadvantages of the two methods of storing energy. Include calculations in your answer.</p>",
 "Level-marked out of 4, and Level 2 needs a calculation that compares the two. Method A: useful energy per 100 kg = 20 160 kJ, wasted = 13 440 kJ, efficiency 60%; it stores far more energy per 100 kg and can be installed anywhere, but the hot water needs insulating. Method B: useful = 367.5 kJ, wasted = 122.5 kJ, efficiency 75%; more efficient, but it needs a high mountain site.", ""),
("9","4",4,"explain",E,"", "<p>Decreasing the amount of carbon dioxide released by different activities will help slow down climate change. Transport and generating electricity are the two activities that released the largest amounts of carbon dioxide in the UK in 2018.</p><p>Explain <b>one</b> change that would reduce the amount of carbon dioxide released by <b>each</b> activity.</p>",
 "Transport: stop burning petrol or diesel, and use electric or hydrogen cars, a bicycle, public transport or walking instead. Generating electricity: stop using coal, oil or gas, and use renewables or nuclear instead — or use fewer appliances, to cut the demand for electricity generated from fossil fuels. Two marks for each activity.", ""),

("10","1",3,"short",AT,"diagram", "<p>The process of nuclear fission is used in nuclear power stations. <b>Figure 17</b> shows the process: a neutron striking a uranium nucleus, which splits into two smaller nuclei and releases three more neutrons and a burst of radiation.</p><p>Complete the sentences. Choose answers from the box: <i>electrons &nbsp; gamma rays &nbsp; neutrons &nbsp; nuclei &nbsp; protons</i></p><p>In nuclear power stations, energy is released from uranium ............... .<br>The uranium in <b>Figure 17</b> splits into two parts and releases three ............... .<br>The process of nuclear fission releases electromagnetic radiation in the form of ............... .</p>",
 "nuclei; neutrons; gamma rays — this order only",
 "Figure 17 is artwork in the PDF; what it shows is stated in the question."),
("10","2",1,"short",E,"", "<p>Write down the equation which links energy (<i>E</i>), power (<i>P</i>) and time (<i>t</i>).</p>",
 "energy = power × time, or E = P × t", ""),
("10","3",3,"calculation",E,"", "<p>A nuclear power station has a power output of 500 MW. Calculate the energy output in 3600 s. Give your answer in J.</p>",
 "1 800 000 000 000 J, or 1.8 × 10¹² J — 500 MW is 500 000 000 W, and 500 000 000 × 3600", ""),
("10","4",1,"short",AT,"", "<p>Radioactive waste produced by nuclear power stations has a long half-life.</p><p>Suggest <b>one</b> precaution taken to reduce the hazard caused by radioactive waste from power stations.</p>",
 "Any one of: bury it; put it in cooling ponds; transport it in secure vessels; store it in metal containers; cover it in concrete", ""),
("10","5",2,"calculation",E,"", "<p>Nuclear power stations do not generate electricity every day of the year. One nuclear power station generated electricity for 92% of a year.</p><p>one year = 365 days</p><p>Calculate the number of days during the year that the nuclear power station generated electricity.</p>",
 "335.8 days — 92 ÷ 100 × 365. 335 and 336 are accepted.", ""),

("11","1",6,"written",EL,"circuit", "<p>A student investigated how the length of a wire affects the resistance of the wire at constant temperature. <b>Figure 18</b> shows the circuit used: a cell, an ammeter, and a length of resistance wire laid along a metre rule with two crocodile clips on it, with a voltmeter across the clipped section.</p><p>The student plotted a graph of resistance against the length of wire.</p><p>Describe a method the student could have used to collect the data needed to plot the graph.</p>",
 "Level-marked out of 6. Measure the length of wire between the crocodile clips with the ruler; vary the length by moving the clips; measure the current with the ammeter and the potential difference with the voltmeter; record both for each length; use V = IR to calculate the resistance for each length. Also: repeat and take means, remove anomalies, keep the current low so the wire does not heat up, and disconnect the circuit between readings.",
 "Figure 18 is artwork in the PDF; what it shows is stated in the question."),
("11","2",1,"short",EL,"graph", "<p>Which graph shows the relationship between the resistance of a wire at constant temperature and its length? Tick <b>one</b> box.</p>",
 "The straight line through the origin — resistance is directly proportional to length",
 "The graphs to choose between are artwork in the PDF. The mark scheme prints the answer as a straight line from the origin, resistance against length."),
("11","3",2,"explain",EL,"", "<p>The student used a cell that had a potential difference of 1.50 V.</p><p>Explain why the cell was not an electrical hazard to the student in the investigation.</p>",
 "The potential difference is very low, so there is no risk of an electric shock (and the wire will not get hot enough to burn)", ""),
]

# ---- the paper says what it is out of, and so does every box down the margin ----
PER_QUESTION = {"1": 8, "2": 10, "3": 11, "4": 9, "5": 8, "6": 9,
                "7": 9, "8": 7, "9": 10, "10": 10, "11": 9}
got = {}
for q, part, marks, *_ in Q:
    got[q] = got.get(q, 0) + marks
assert got == PER_QUESTION, 'per-question totals disagree with the paper: %r' % (got,)
assert sum(got.values()) == 100, 'the paper is out of 100 and these sum to %d' % sum(got.values())

# ---- every number the scheme prints inside its own working, recomputed here ----
assert 0.000002 * 300000 == 0.6
assert 0.45 / 0.75 == 0.6
assert 600 - 200 == 400
assert 0.5 * 800 * 7.5 ** 2 == 22500
assert 0.5 * 240 * 15 ** 2 == 27000
assert round(24000 / (240 * 9.8), 1) == 10.2
assert round(5.4 - 5.0, 1) == 0.4
assert 22 * 0.3 == 6.6
assert round(0.0130 / (2.60e-8 * 1010)) == 495
assert 2.0 / 0.40 == 5.0
assert 0.016 / 1000 == 1.6e-5 and round(1.6e-5 * 60000, 2) == 0.96
assert round((0.26 + 0.21 + 0.25) / 3, 2) == 0.24
assert round(3.0 * 0.17, 2) == 0.51
assert 500e6 * 3600 == 1.8e12
assert round(92 / 100 * 365, 1) == 335.8
assert round(33600 * 0.60) == 20160 and round(33600 * 0.40) == 13440   # method A
assert round(490 * 0.75, 1) == 367.5 and round(490 * 0.25, 1) == 122.5  # method B
for _, _, _, _, topics, *_ in Q:
    assert ',' not in topics, topics

d = datetime.date.fromisoformat(DOC['exam_date'])
assert d.weekday() < 5 and d.year == 2024 and d.month == 5

rows = []
for q, part, marks, atype, topics, figure, html, answer, note in Q:
    r = dict(DOC)
    r.update(row_id='Q-AQA-8463-2406-1F-%02d%s' % (int(q), part), kind='question',
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
