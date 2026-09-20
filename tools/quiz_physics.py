"""
PHYSICS -- the nine AQA units, three levels each.

EVERY CALCULATION IS ARITHMETIC SOMEBODY CAN CHECK, and the distractors are the wrong answers
people actually get: the inverse square law halved instead of quartered, efficiency the wrong way
up, a half forgotten in ½mv². A distractor nobody would choose makes a four-option question a
one-option question.
"""
from quizwrite import quiz

# -------------------------------------------------------------------- Energy

quiz('Physics', 'Energy', 'KS3', [
    {'ask': 'Which energy store does a stretched spring have?',
     'choices': ['Elastic potential', 'Kinetic', 'Chemical', 'Thermal'],
     'answer': 'Elastic potential',
     'why': 'Stretching or squashing something springy stores energy in the elastic potential store, '
            'and it is returned when the spring goes back to its original shape.'},
    {'ask': 'Energy cannot be created or destroyed, only...',
     'answer': 'Transferred',
     'accept': 'transferred|transfered|moved|transferred from one store to another|changed|'
               'transferred between stores|stored|dissipated',
     'why': 'That is conservation of energy. It is never used up — it ends up somewhere, usually '
            'spread out as heat in the surroundings, where it is much harder to use.'},
    {'ask': 'Which of these is a renewable energy resource?',
     'choices': ['Wind', 'Coal', 'Natural gas', 'Nuclear fuel'],
     'answer': 'Wind',
     'why': 'Renewable means it is replenished as fast as it is used. Wind, solar, hydro, tidal, '
            'wave, geothermal and biofuel are renewable; the fossil fuels and nuclear fuel are not.'},
    {'ask': 'How is energy transferred from a hot radiator to the air by conduction?',
     'choices': ['Particles vibrate and pass energy to neighbouring particles',
                 'Warm air rises and cool air sinks',
                 'Infrared radiation travels across a vacuum',
                 'The radiator gives off light'],
     'answer': 'Particles vibrate and pass energy to neighbouring particles',
     'why': 'Conduction needs particles in contact, so it works best in solids. Convection is the '
            'moving fluid, and radiation is the only one that crosses empty space.'},
    {'ask': 'Why does loft insulation reduce heat loss from a house?',
     'choices': ['It traps air, which is a poor conductor',
                 'It reflects all the heat back',
                 'It is very heavy',
                 'It absorbs the heat permanently'],
     'answer': 'It traps air, which is a poor conductor',
     'why': 'Air conducts badly, and trapping it stops convection currents carrying the energy away. '
            'Most insulation works this way, including double glazing and a woolly jumper.'},
])

quiz('Physics', 'Energy', 'GCSE-F', [
    {'ask': 'A 2 kg object moves at 3 m/s. What is its kinetic energy?',
     'choices': ['9 J', '18 J', '6 J', '3 J'],
     'answer': '9 J',
     'why': 'E = ½mv² = 0.5 × 2 × 3² = 0.5 × 2 × 9 = 9 J. '
            'Forgetting the half gives 18, and squaring after multiplying gives something else again '
            '— square the speed first.'},
    {'ask': 'A 5 kg mass is lifted 2 m. What is the gain in gravitational potential energy? '
            '(g = 9.8 N/kg)',
     'choices': ['98 J', '10 J', '49 J', '980 J'],
     'answer': '98 J',
     'why': 'E = mgh = 5 × 9.8 × 2 = 98 J. The height is the VERTICAL distance — the length '
            'of a ramp is not h.'},
    {'ask': 'A device takes in 200 J and usefully transfers 150 J. What is its efficiency?',
     'choices': ['75%', '133%', '50%', '25%'],
     'answer': '75%',
     'why': 'Efficiency = useful ÷ total = 150 ÷ 200 = 0.75, so 75%. Over 100% means the '
            'division is upside down, which is the commonest slip here.'},
    {'ask': 'What is the unit of power?',
     'choices': ['Watt', 'Joule', 'Newton', 'Volt'],
     'answer': 'Watt',
     'why': 'Power is energy transferred per second, so one watt is one joule per second. The joule '
            'is the energy itself.'},
    {'ask': 'Name one way energy is wasted in a moving machine.',
     'answer': 'Friction',
     'accept': 'friction|heating by friction|heat|thermal energy|air resistance|drag|sound|'
               'heating due to friction|resistance',
     'why': 'Friction and air resistance both heat the surroundings, and some energy goes as sound. '
            'Lubrication and streamlining reduce them — you cannot remove them.'},
])

quiz('Physics', 'Energy', 'GCSE-H', [
    {'ask': 'A 0.5 kg ball falls 20 m. Ignoring air resistance, how fast is it moving? (g = 9.8 N/kg)',
     'choices': ['19.8 m/s', '392 m/s', '14 m/s', '9.9 m/s'],
     'answer': '19.8 m/s',
     'why': 'All the gravitational store becomes kinetic, so mgh = ½mv² and the mass '
            'cancels: v² = 2gh = 2 × 9.8 × 20 = 392, so v = √392 = 19.8 m/s. '
            'Forgetting the square root gives 392.'},
    {'ask': 'What is specific heat capacity?',
     'choices': ['The energy needed to raise 1 kg of a substance by 1 °C',
                 'The energy needed to melt 1 kg of a substance',
                 'The energy stored in 1 kg of a substance',
                 'The temperature a substance reaches when heated'],
     'answer': 'The energy needed to raise 1 kg of a substance by 1 °C',
     'why': 'E = mcΔθ. Water’s is unusually high at 4200 J/kg°C, which is why it '
            'is used in heating systems and why the sea warms so slowly.'},
    {'ask': 'How much energy raises 2 kg of water by 10 °C? (c = 4200 J/kg°C)',
     'choices': ['84 000 J', '8 400 J', '42 000 J', '840 000 J'],
     'answer': '84 000 J',
     'why': 'E = mcΔθ = 2 × 4200 × 10 = 84 000 J. Δθ is the CHANGE in '
            'temperature, not the final temperature.'},
    {'ask': 'What is specific latent heat?',
     'choices': ['The energy needed to change the state of 1 kg with no temperature change',
                 'The energy needed to raise 1 kg by 1 °C',
                 'The energy lost by 1 kg as it cools',
                 'The energy stored in a hot object'],
     'answer': 'The energy needed to change the state of 1 kg with no temperature change',
     'why': 'During melting or boiling the temperature holds flat, because the energy is breaking '
            'the forces between particles rather than making them move faster. That flat section on '
            'a heating graph is the latent heat being supplied.'},
    {'ask': 'A motor transfers 600 J in 5 s. What is its power?',
     'choices': ['120 W', '3000 W', '0.008 W', '605 W'],
     'answer': '120 W',
     'why': 'P = E ÷ t = 600 ÷ 5 = 120 W. Multiplying gives 3000, which would be an '
            'enormous power for a small motor — a sanity check catches it.'},
])

# ---------------------------------------------------------------- Electricity

quiz('Physics', 'Electricity', 'KS3', [
    {'ask': 'What does an ammeter measure?',
     'choices': ['Current', 'Voltage', 'Resistance', 'Power'],
     'answer': 'Current',
     'why': 'An ammeter goes IN SERIES, because the current has to flow through it. A voltmeter goes '
            'in parallel, across the component.'},
    {'ask': 'In a series circuit with two identical bulbs, what happens if one bulb is removed?',
     'choices': ['The other goes out too', 'The other gets brighter',
                 'The other stays the same', 'The other flickers'],
     'answer': 'The other goes out too',
     'why': 'A series circuit is one loop, so a break anywhere stops the current everywhere. In '
            'parallel each bulb has its own path, so the others keep working.'},
    {'ask': 'What is the unit of current?',
     'answer': 'Amp',
     'accept': 'amp|amps|ampere|amperes|a|ampere (a)|amp (a)',
     'why': 'Current is the rate of flow of charge — one amp is one coulomb of charge passing per '
            'second.'},
    {'ask': 'Which material is a good conductor of electricity?',
     'choices': ['Copper', 'Plastic', 'Rubber', 'Glass'],
     'answer': 'Copper',
     'why': 'Metals have free electrons that can move through the structure, which is what a current '
            'is. Plastic, rubber and glass hold their electrons in place, so they are insulators — '
            'which is why wire is copper inside and plastic outside.'},
    {'ask': 'What does a fuse do?',
     'choices': ['Melts and breaks the circuit if the current is too high',
                 'Increases the current in a circuit',
                 'Stores charge for later',
                 'Measures the voltage'],
     'answer': 'Melts and breaks the circuit if the current is too high',
     'why': 'A thin wire that melts first is a deliberate weak point, so a fault cannot heat the '
            'cable enough to start a fire. A circuit breaker does the same job and can be reset.'},
])

quiz('Physics', 'Electricity', 'GCSE-F', [
    {'ask': 'A 12 V supply drives 3 A through a resistor. What is its resistance?',
     'choices': ['4 Ω', '36 Ω', '0.25 Ω', '15 Ω'],
     'answer': '4 Ω',
     'why': 'V = IR, so R = V ÷ I = 12 ÷ 3 = 4 Ω. Multiplying gives 36, which is the '
            'commonest slip on this triangle.'},
    {'ask': 'In a SERIES circuit, the current...',
     'choices': ['is the same everywhere', 'splits between the components',
                 'is largest near the battery', 'increases at each resistor'],
     'answer': 'is the same everywhere',
     'why': 'There is only one path, so the same charge passes every point. It is the potential '
            'difference that is shared out in series — and in parallel it is the other way round.'},
    {'ask': 'Two 6 Ω resistors are connected in series. What is the total resistance?',
     'choices': ['12 Ω', '3 Ω', '6 Ω', '36 Ω'],
     'answer': '12 Ω',
     'why': 'In series resistances simply add. In parallel the total is LESS than either one, '
            'because adding another path makes it easier for charge to flow.'},
    {'ask': 'What happens to the resistance of a thermistor as it gets hotter?',
     'choices': ['It decreases', 'It increases',
                 'It stays the same', 'It becomes zero'],
     'answer': 'It decreases',
     'why': 'That is what makes a thermistor useful in a thermostat — the current rises as it warms. '
            'An LDR does the same with light: brighter means lower resistance.'},
    {'ask': 'Which wire in a UK plug is brown?',
     'choices': ['Live', 'Neutral', 'Earth', 'Fuse wire'],
     'answer': 'Live',
     'why': 'Brown live, blue neutral, green-and-yellow earth. The live carries the alternating '
            'potential difference from the supply, which is why it is the dangerous one even when a '
            'switch is off.'},
])

quiz('Physics', 'Electricity', 'GCSE-H', [
    {'ask': 'A 2 kW heater runs for 3 hours. How much energy does it use in kWh?',
     'choices': ['6 kWh', '0.67 kWh', '600 kWh', '5 kWh'],
     'answer': '6 kWh',
     'why': 'E = P × t with power in kW and time in hours: 2 × 3 = 6 kWh. A kilowatt-hour '
            'is a unit of ENERGY, not power, which is why the electricity bill is in them.'},
    {'ask': 'Charge of 30 C flows in 10 s. What is the current?',
     'choices': ['3 A', '300 A', '0.33 A', '40 A'],
     'answer': '3 A',
     'why': 'Q = It, so I = Q ÷ t = 30 ÷ 10 = 3 A. One amp is one coulomb per second, which '
            'is the definition this rearrangement comes from.'},
    {'ask': 'What is the power of a device with a current of 4 A and a p.d. of 230 V?',
     'choices': ['920 W', '57.5 W', '234 W', '0.017 W'],
     'answer': '920 W',
     'why': 'P = VI = 230 × 4 = 920 W. P = I²R and P = V²/R are the other two forms, '
            'used when you know the resistance instead.'},
    {'ask': 'Why is the National Grid transmitted at very high potential difference?',
     'choices': ['To lower the current, so less energy is wasted heating the cables',
                 'To make the electricity travel faster',
                 'To increase the current so more power arrives',
                 'To reduce the voltage at the power station'],
     'answer': 'To lower the current, so less energy is wasted heating the cables',
     'why': 'For a given power, P = VI means raising V lowers I — and the heating loss is I²R, '
            'so halving the current quarters the loss. Step-up transformers at the station, '
            'step-down ones before homes.'},
    {'ask': 'Why does a wire get hot when a current flows through it?',
     'choices': ['Electrons collide with the ions in the wire, making them vibrate more',
                 'The electrons rub against the insulation',
                 'The voltage heats the wire directly',
                 'The wire expands and releases energy'],
     'answer': 'Electrons collide with the ions in the wire, making them vibrate more',
     'why': 'More vibration is a higher temperature. It is a waste in a cable and the whole point in '
            'a kettle or a filament lamp — the same physics, wanted or not.'},
])

# -------------------------------------------------------- Particle Model of Matter

quiz('Physics', 'Particle Model of Matter', 'KS3', [
    {'ask': 'In which state are the particles furthest apart?',
     'choices': ['Gas', 'Liquid', 'Solid', 'They are all the same'],
     'answer': 'Gas',
     'why': 'Gas particles are far apart and move quickly in all directions, which is why a gas fills '
            'its container and can be compressed. Solids and liquids are both close-packed.'},
    {'ask': 'What is density?',
     'choices': ['Mass divided by volume', 'Volume divided by mass',
                 'Mass multiplied by volume', 'Weight divided by area'],
     'answer': 'Mass divided by volume',
     'why': 'ρ = m/V. It is how much mass is packed into a given space, which is why a small '
            'dense object can outweigh a large light one.'},
    {'ask': 'Why does a gas exert pressure on its container?',
     'choices': ['Its particles collide with the walls',
                 'Its particles are attracted to the walls',
                 'The gas is heavier than air',
                 'The particles stick to each other'],
     'answer': 'Its particles collide with the walls',
     'why': 'Each collision is a tiny force; billions of them add up to a steady push. Heat the gas '
            'and the particles hit harder and more often, so the pressure rises.'},
    {'ask': 'What happens to the mass of a substance when it melts?',
     'choices': ['It stays the same', 'It increases', 'It decreases', 'It doubles'],
     'answer': 'It stays the same',
     'why': 'A change of state is a physical change — the same particles, rearranged. Nothing is '
            'added or removed, so the mass is conserved.'},
    {'ask': 'What is the name for a gas turning directly into a solid?',
     'choices': ['Sublimation', 'Evaporation', 'Condensation', 'Melting'],
     'answer': 'Sublimation',
     'why': 'Sublimation is used for both directions of the solid-gas change, skipping the liquid '
            'entirely. Dry ice does it at ordinary pressure.'},
])

quiz('Physics', 'Particle Model of Matter', 'GCSE-F', [
    {'ask': 'An object has a mass of 300 g and a volume of 100 cm³. What is its density?',
     'choices': ['3 g/cm³', '0.33 g/cm³', '30 000 g/cm³', '200 g/cm³'],
     'answer': '3 g/cm³',
     'why': 'ρ = m ÷ V = 300 ÷ 100 = 3 g/cm³. Mass on top, always — dividing the '
            'other way gives 0.33 and a unit nobody uses.'},
    {'ask': 'Why is a change of state a physical change?',
     'choices': ['The substance can be changed back and keeps the same mass',
                 'A new substance is formed',
                 'It needs no energy',
                 'The particles are destroyed'],
     'answer': 'The substance can be changed back and keeps the same mass',
     'why': 'Freeze water and you get the same water back. A chemical change makes something new, '
            'which is usually much harder to reverse.'},
    {'ask': 'On a heating graph, what is happening during a flat section?',
     'choices': ['The substance is changing state',
                 'The substance is cooling',
                 'Nothing is being heated',
                 'The thermometer is broken'],
     'answer': 'The substance is changing state',
     'why': 'Energy is still going in, but it is breaking the forces between particles rather than '
            'making them move faster — so the temperature does not rise until the change is complete.'},
    {'ask': 'What happens to the pressure of a fixed volume of gas when it is heated?',
     'choices': ['It increases', 'It decreases',
                 'It stays the same', 'It becomes zero'],
     'answer': 'It increases',
     'why': 'Hotter particles move faster, so they hit the walls more often and harder. A sealed can '
            'on a fire is exactly this, which is why the label says not to.'},
    {'ask': 'How would you measure the volume of an irregular solid?',
     'choices': ['By displacement, using a measuring cylinder of water',
                 'With a ruler',
                 'By weighing it',
                 'By heating it until it melts'],
     'answer': 'By displacement, using a measuring cylinder of water',
     'why': 'The object pushes aside its own volume of water, so the rise in the reading IS the '
            'volume. A ruler only works on a regular shape.'},
])

quiz('Physics', 'Particle Model of Matter', 'GCSE-H', [
    {'ask': 'How much energy is needed to melt 2 kg of ice? (specific latent heat of fusion = '
            '334 000 J/kg)',
     'choices': ['668 000 J', '167 000 J', '334 000 J', '336 000 J'],
     'answer': '668 000 J',
     'why': 'E = mL = 2 × 334 000 = 668 000 J. There is no Δθ in this formula, because '
            'the temperature does not change during melting.'},
    {'ask': 'Why does the internal energy of a substance rise when it is heated but the temperature '
            'does not, during boiling?',
     'choices': ['The potential energy of the particles rises as the forces between them are broken',
                 'The kinetic energy of the particles rises',
                 'The mass of the substance increases',
                 'The particles get bigger'],
     'answer': 'The potential energy of the particles rises as the forces between them are broken',
     'why': 'Internal energy is kinetic plus potential. Temperature measures the KINETIC part only, '
            'so energy going into the potential part is invisible on a thermometer.'},
    {'ask': 'A gas is compressed quickly. What happens to its temperature and why?',
     'choices': ['It rises, because work is done on the gas',
                 'It falls, because the volume is smaller',
                 'It stays the same, because no heat is added',
                 'It falls, because the particles have less room'],
     'answer': 'It rises, because work is done on the gas',
     'why': 'Doing work transfers energy just as heating does, so the internal energy goes up. It is '
            'why a bicycle pump gets warm — nothing has been heated from outside.'},
    {'ask': 'Why does increasing the volume of a gas at constant temperature lower its pressure?',
     'choices': ['The particles hit the walls less often',
                 'The particles move more slowly',
                 'There are fewer particles',
                 'The particles become heavier'],
     'answer': 'The particles hit the walls less often',
     'why': 'Constant temperature means the SPEED is unchanged — only the frequency of collisions '
            'falls, because there is further to travel between walls. pV is constant.'},
    {'ask': 'What is meant by the internal energy of a system?',
     'choices': ['The total kinetic and potential energy of all its particles',
                 'The heat supplied to it',
                 'Its temperature',
                 'The work done on it'],
     'answer': 'The total kinetic and potential energy of all its particles',
     'why': 'It is a property the system HAS. Heating and doing work are two ways of changing it — '
            'they are transfers, not stores.'},
])

# -------------------------------------------------------------------- Forces

quiz('Physics', 'Forces', 'KS3', [
    {'ask': 'What is the unit of force?',
     'choices': ['Newton', 'Joule', 'Watt', 'Kilogram'],
     'answer': 'Newton',
     'why': 'One newton accelerates one kilogram at one metre per second squared. Mass is in '
            'kilograms; weight, which is a force, is in newtons.'},
    {'ask': 'Which of these is a contact force?',
     'choices': ['Friction', 'Gravity', 'Magnetism', 'Electrostatic force'],
     'answer': 'Friction',
     'why': 'A contact force needs the objects to touch — friction, air resistance, tension, normal '
            'contact force. Gravity, magnetism and electrostatic forces all act at a distance.'},
    {'ask': 'A book rests on a table and does not move. What can you say about the forces on it?',
     'choices': ['They are balanced', 'There are no forces on it',
                 'Gravity is the only force', 'They are unbalanced upwards'],
     'answer': 'They are balanced',
     'why': 'Weight down, normal contact force up, equal in size. Balanced forces mean no change in '
            'motion — which includes staying still.'},
    {'ask': 'What is the weight of a 10 kg mass on Earth? (g = 10 N/kg)',
     'choices': ['100 N', '10 N', '1 N', '1000 N'],
     'answer': '100 N',
     'why': 'W = mg = 10 × 10 = 100 N. The mass would be 10 kg on the Moon too; the weight '
            'would be about 16 N, because g there is smaller.'},
    {'ask': 'A force is a vector. What does that mean?',
     'choices': ['It has both size and direction', 'It can only be positive',
                 'It is measured in newtons', 'It acts at a distance'],
     'answer': 'It has both size and direction',
     'why': 'Distance and speed are scalars — size only. Displacement, velocity, acceleration and '
            'force are vectors, which is why they are drawn as arrows.'},
])

quiz('Physics', 'Forces', 'GCSE-F', [
    {'ask': 'A 4 kg mass accelerates at 3 m/s². What is the resultant force?',
     'choices': ['12 N', '1.33 N', '7 N', '0.75 N'],
     'answer': '12 N',
     'why': 'F = ma = 4 × 3 = 12 N. Divide instead and the answer is smaller than either '
            'number, which is a quick sign it is wrong.'},
    {'ask': 'What does the gradient of a distance-time graph represent?',
     'choices': ['Speed', 'Acceleration', 'Distance', 'Force'],
     'answer': 'Speed',
     'why': 'Distance ÷ time IS speed, and that is what a gradient is. On a VELOCITY-time graph '
            'the gradient is acceleration and the area is distance — two different graphs, two '
            'different meanings.'},
    {'ask': 'What is terminal velocity?',
     'choices': ['The steady speed reached when air resistance equals weight',
                 'The fastest an object can ever go',
                 'The speed at which an object hits the ground',
                 'The speed at the start of a fall'],
     'answer': 'The steady speed reached when air resistance equals weight',
     'why': 'Air resistance grows with speed, so a falling object reaches a speed where the two '
            'forces balance. Balanced forces mean no acceleration — so it keeps falling, at a '
            'constant speed.'},
    {'ask': 'How much work is done lifting a 20 N weight through 3 m?',
     'choices': ['60 J', '6.7 J', '23 J', '17 J'],
     'answer': '60 J',
     'why': 'W = Fs = 20 × 3 = 60 J. Work done is energy transferred, which is why both are '
            'measured in joules.'},
    {'ask': 'A spring extends 4 cm under a force of 8 N. What is the spring constant in N/m?',
     'choices': ['200 N/m', '32 N/m', '2 N/m', '0.5 N/m'],
     'answer': '200 N/m',
     'why': 'F = ke, so k = F ÷ e — but e must be in METRES: 4 cm = 0.04 m, and '
            '8 ÷ 0.04 = 200 N/m. Leaving it in centimetres gives 2, which is the trap.'},
])

quiz('Physics', 'Forces', 'GCSE-H', [
    {'ask': 'What is the momentum of a 1500 kg car travelling at 20 m/s?',
     'choices': ['30 000 kg m/s', '75 kg m/s', '1520 kg m/s', '300 000 kg m/s'],
     'answer': '30 000 kg m/s',
     'why': 'p = mv = 1500 × 20 = 30 000 kg m/s. Momentum is a vector, so direction matters when '
            'two objects collide.'},
    {'ask': 'Why does a crumple zone reduce the force in a crash?',
     'choices': ['It increases the time taken to stop, so the rate of change of momentum is smaller',
                 'It reduces the mass of the car',
                 'It reduces the momentum before the crash',
                 'It makes the car stop faster'],
     'answer': 'It increases the time taken to stop, so the rate of change of momentum is smaller',
     'why': 'F = Δp/Δt. The change in momentum is fixed — the car is stopping either way — '
            'so the only thing that can be changed is the time. Airbags, seatbelts and crash mats '
            'all do the same thing.'},
    {'ask': 'An object accelerates from 5 m/s to 15 m/s in 4 s. What is its acceleration?',
     'choices': ['2.5 m/s²', '5 m/s²', '3.75 m/s²', '1.25 m/s²'],
     'answer': '2.5 m/s²',
     'why': 'a = Δv ÷ t = (15 − 5) ÷ 4 = 10 ÷ 4 = 2.5 m/s². Using the '
            'final velocity instead of the change gives 3.75.'},
    {'ask': 'Using v² − u² = 2as, what is the final speed of an object starting from '
            'rest and accelerating at 4 m/s² over 8 m?',
     'choices': ['8 m/s', '64 m/s', '32 m/s', '16 m/s'],
     'answer': '8 m/s',
     'why': 'u = 0, so v² = 2 × 4 × 8 = 64, and v = √64 = 8 m/s. Missing the '
            'square root gives 64.'},
    {'ask': 'What does Newton’s third law say?',
     'choices': ['Every action has an equal and opposite reaction, on a different object',
                 'A resultant force causes acceleration',
                 'An object stays still unless a force acts',
                 'Momentum is always conserved'],
     'answer': 'Every action has an equal and opposite reaction, on a different object',
     'why': 'The two forces act on DIFFERENT objects, which is why they do not cancel out. If they '
            'acted on the same one nothing could ever accelerate.'},
])

# --------------------------------------------------------------------- Waves

quiz('Physics', 'Waves', 'KS3', [
    {'ask': 'What is the wavelength of a wave?',
     'choices': ['The distance from one peak to the next', 'The height of a peak',
                 'The number of waves per second', 'The speed of the wave'],
     'answer': 'The distance from one peak to the next',
     'why': 'Wavelength is a distance, measured in metres. The height is the amplitude and the '
            'number per second is the frequency — three different measurements of one wave.'},
    {'ask': 'Sound is which type of wave?',
     'choices': ['Longitudinal', 'Transverse',
                 'Electromagnetic', 'It is not a wave'],
     'answer': 'Longitudinal',
     'why': 'In a longitudinal wave the particles vibrate along the direction the wave travels, '
            'making compressions and rarefactions. That is also why sound needs a medium and cannot '
            'cross a vacuum.'},
    {'ask': 'What is the unit of frequency?',
     'answer': 'Hertz',
     'accept': 'hertz|hz|hertz (hz)|herz',
     'why': 'One hertz is one wave per second. A 50 Hz mains supply changes direction fifty times a '
            'second.'},
    {'ask': 'What happens to light when it passes from air into glass?',
     'choices': ['It slows down and changes direction', 'It speeds up',
                 'It stops', 'It changes colour'],
     'answer': 'It slows down and changes direction',
     'why': 'That is refraction. The bending happens because one side of the beam enters the denser '
            'material first and slows before the other — which is also why a beam hitting head-on '
            'does not bend at all.'},
    {'ask': 'What does the law of reflection say?',
     'choices': ['The angle of incidence equals the angle of reflection',
                 'The angle of incidence is twice the angle of reflection',
                 'Light always reflects straight back',
                 'The angle depends on the colour'],
     'answer': 'The angle of incidence equals the angle of reflection',
     'why': 'Both angles are measured from the NORMAL — the line at right angles to the surface — '
            'not from the surface itself.'},
])

quiz('Physics', 'Waves', 'GCSE-F', [
    {'ask': 'A wave has frequency 50 Hz and wavelength 4 m. What is its speed?',
     'choices': ['200 m/s', '12.5 m/s', '54 m/s', '0.08 m/s'],
     'answer': '200 m/s',
     'why': 'v = fλ = 50 × 4 = 200 m/s. Dividing gives 12.5, which is the slip to watch '
            'for.'},
    {'ask': 'Which of these is a transverse wave?',
     'choices': ['A water wave', 'A sound wave',
                 'An ultrasound wave', 'A wave on a slinky being pushed'],
     'answer': 'A water wave',
     'why': 'In a transverse wave the vibration is at right angles to the travel. Water waves and all '
            'electromagnetic waves are transverse; sound and ultrasound are longitudinal.'},
    {'ask': 'What is the amplitude of a wave?',
     'choices': ['The maximum displacement from the rest position',
                 'The distance between two peaks',
                 'The number of waves per second',
                 'The total height from trough to peak'],
     'answer': 'The maximum displacement from the rest position',
     'why': 'From the middle to a peak, not from trough to peak — that measurement is twice the '
            'amplitude. Larger amplitude means a louder sound or a brighter light.'},
    {'ask': 'A wave has a period of 0.2 s. What is its frequency?',
     'choices': ['5 Hz', '0.2 Hz', '20 Hz', '0.8 Hz'],
     'answer': '5 Hz',
     'why': 'f = 1 ÷ T = 1 ÷ 0.2 = 5 Hz. Period and frequency are reciprocals — one is '
            'seconds per wave and the other is waves per second.'},
    {'ask': 'Waves transfer energy without transferring what?',
     'answer': 'Matter',
     'accept': 'matter|material|mass|particles|substance|the medium|water|the material',
     'why': 'A float on a pond bobs up and down but does not travel with the wave. The particles '
            'oscillate about a fixed position; only the energy moves along.'},
])

quiz('Physics', 'Waves', 'GCSE-H', [
    {'ask': 'Sound travels at 340 m/s. What is the wavelength of a 170 Hz note?',
     'choices': ['2 m', '0.5 m', '57 800 m', '510 m'],
     'answer': '2 m',
     'why': 'λ = v ÷ f = 340 ÷ 170 = 2 m. Multiplying gives 57 800 m, which is plainly '
            'not a sound wavelength — a sanity check catches it.'},
    {'ask': 'What happens to a wave that meets a boundary at an angle and enters a slower medium?',
     'choices': ['It refracts towards the normal', 'It refracts away from the normal',
                 'It is always totally reflected', 'It continues in a straight line'],
     'answer': 'It refracts towards the normal',
     'why': 'Slower means towards the normal; faster means away. Slowing down on entering water or '
            'glass is why a straw looks bent.'},
    {'ask': 'Why can ultrasound be used to see inside the body?',
     'choices': ['It partly reflects at each boundary between different tissues',
                 'It passes straight through every tissue',
                 'It is absorbed by bone only',
                 'It ionises the tissue'],
     'answer': 'It partly reflects at each boundary between different tissues',
     'why': 'The time each echo takes to return gives the depth of that boundary. It is non-ionising, '
            'which is why it is used on a foetus where X-rays would not be.'},
    {'ask': 'Which electromagnetic waves are most dangerous because they are ionising?',
     'choices': ['Ultraviolet, X-rays and gamma rays',
                 'Radio waves and microwaves',
                 'Infrared and visible light',
                 'Microwaves only'],
     'answer': 'Ultraviolet, X-rays and gamma rays',
     'why': 'They are the highest-frequency end of the spectrum, so they carry the most energy per '
            'photon — enough to knock electrons off atoms and damage DNA.'},
    {'ask': 'Put these in order of INCREASING wavelength: X-rays, radio waves, visible light.',
     'choices': ['X-rays, visible light, radio waves',
                 'Radio waves, visible light, X-rays',
                 'Visible light, X-rays, radio waves',
                 'X-rays, radio waves, visible light'],
     'answer': 'X-rays, visible light, radio waves',
     'why': 'The spectrum runs radio, microwave, infrared, visible, ultraviolet, X-ray, gamma — '
            'wavelength falling and frequency rising along it. Increasing wavelength is that list '
            'read backwards.'},
])

# ----------------------------------------------------------- Atomic Structure

quiz('Physics', 'Atomic Structure', 'KS3', [
    {'ask': 'What is at the centre of an atom?',
     'choices': ['The nucleus', 'An electron shell', 'A neutron only', 'Empty space'],
     'answer': 'The nucleus',
     'why': 'The nucleus holds the protons and neutrons, and is about 1/10000 of the size of the '
            'atom. The electrons occupy the rest.'},
    {'ask': 'What is radioactive decay?',
     'choices': ['An unstable nucleus giving out radiation to become more stable',
                 'An atom losing an electron',
                 'An atom being split by a scientist',
                 'A chemical reaction inside an atom'],
     'answer': 'An unstable nucleus giving out radiation to become more stable',
     'why': 'It is random — nothing makes a particular nucleus decay at a particular moment, and '
            'nothing outside it can speed it up or slow it down.'},
    {'ask': 'Which type of radiation is stopped by a sheet of paper?',
     'choices': ['Alpha', 'Beta', 'Gamma', 'None of them'],
     'answer': 'Alpha',
     'why': 'Alpha is stopped by paper, beta by a few millimetres of aluminium, gamma only reduced '
            'by thick lead or concrete. Alpha is the most ionising, which is exactly why it does not '
            'get far.'},
    {'ask': 'What is an alpha particle made of?',
     'choices': ['Two protons and two neutrons', 'One electron',
                 'A high-energy wave', 'One proton'],
     'answer': 'Two protons and two neutrons',
     'why': 'It is a helium nucleus. Beta is a fast electron from the nucleus, and gamma is an '
            'electromagnetic wave with no mass and no charge.'},
    {'ask': 'Name one source of background radiation.',
     'answer': 'Radon gas',
     'accept': 'radon|radon gas|rocks|the ground|soil|cosmic rays|space|the sun|food|'
               'medical x-rays|x-rays|buildings|nuclear waste|air travel',
     'why': 'Background radiation is around us all the time — mostly natural, from radon in rocks, '
            'cosmic rays and even food. It is why a measurement must have the background subtracted.'},
])

quiz('Physics', 'Atomic Structure', 'GCSE-F', [
    {'ask': 'What is half-life?',
     'choices': ['The time for half the unstable nuclei in a sample to decay',
                 'The time for a sample to become completely safe',
                 'Half the time a sample lasts',
                 'The time for the mass to halve'],
     'answer': 'The time for half the unstable nuclei in a sample to decay',
     'why': 'It can also be defined as the time for the count rate to fall by half. Because it is '
            'always a halving, a sample never reaches zero — it just becomes very small.'},
    {'ask': 'A sample has a count rate of 800 and a half-life of 2 days. What is the count rate '
            'after 6 days?',
     'choices': ['100', '400', '200', '133'],
     'answer': '100',
     'why': '6 days is three half-lives: 800 → 400 → 200 → 100. Dividing by three '
            'rather than halving three times gives 267, which is the commonest wrong route.'},
    {'ask': 'When a nucleus emits an alpha particle, what happens to its mass number?',
     'choices': ['It falls by 4', 'It falls by 2', 'It stays the same', 'It rises by 4'],
     'answer': 'It falls by 4',
     'why': 'An alpha is two protons and two neutrons, so the mass number drops by 4 and the atomic '
            'number by 2. Beta decay is different — mass unchanged, atomic number up by 1.'},
    {'ask': 'Which type of radiation is the most penetrating?',
     'choices': ['Gamma', 'Alpha', 'Beta', 'They are equal'],
     'answer': 'Gamma',
     'why': 'Penetration and ionising power run opposite ways: gamma ionises least, so it passes '
            'through most. Alpha ionises most and is stopped almost at once.'},
    {'ask': 'Why is a source with a long half-life a problem as waste?',
     'choices': ['It stays radioactive for a very long time and must be stored safely',
                 'It gives out much more radiation each second',
                 'It becomes more radioactive over time',
                 'It cannot be detected'],
     'answer': 'It stays radioactive for a very long time and must be stored safely',
     'why': 'Long half-life means low activity but for centuries; short half-life means high activity '
            'that fades fast. Which is more dangerous depends entirely on whether it is inside you.'},
])

quiz('Physics', 'Atomic Structure', 'GCSE-H', [
    {'ask': 'What is nuclear fission?',
     'choices': ['A large unstable nucleus splitting into two smaller ones',
                 'Two small nuclei joining together',
                 'A nucleus emitting an alpha particle',
                 'An electron being knocked off an atom'],
     'answer': 'A large unstable nucleus splitting into two smaller ones',
     'why': 'It usually needs a neutron to be absorbed first, and releases two or three more — which '
            'is the chain reaction. Fusion is the opposite and is what powers stars.'},
    {'ask': 'What do control rods do in a nuclear reactor?',
     'choices': ['Absorb neutrons to control the rate of the chain reaction',
                 'Slow the neutrons down so fission is more likely',
                 'Carry heat away to the boiler',
                 'Shield the workers from gamma rays'],
     'answer': 'Absorb neutrons to control the rate of the chain reaction',
     'why': 'Fewer neutrons means fewer fissions. The moderator is the different job — slowing '
            'neutrons so they are absorbed rather than passing through.'},
    {'ask': 'Why does nuclear fusion require extremely high temperatures and pressures?',
     'choices': ['To overcome the electrostatic repulsion between two positive nuclei',
                 'To break the nuclei into smaller pieces',
                 'To turn the fuel into a liquid',
                 'To produce enough neutrons'],
     'answer': 'To overcome the electrostatic repulsion between two positive nuclei',
     'why': 'Both nuclei are positive and repel hard at close range. Only at enormous speed do they '
            'get near enough for the strong nuclear force to take over — which is why fusion happens '
            'in stars and is so difficult on Earth.'},
    {'ask': 'A sample falls from 1600 counts/s to 200 counts/s in 12 hours. What is the half-life?',
     'choices': ['4 hours', '3 hours', '6 hours', '1.5 hours'],
     'answer': '4 hours',
     'why': '1600 → 800 → 400 → 200 is three halvings, and 12 ÷ 3 = 4 hours. '
            'Count the halvings first, then divide the time by that number.'},
    {'ask': 'What is the difference between contamination and irradiation?',
     'choices': ['Contamination is radioactive material getting on or in you; irradiation is being '
                 'exposed to the radiation',
                 'They are the same thing',
                 'Contamination is being exposed; irradiation is material getting on you',
                 'Contamination only happens with gamma rays'],
     'answer': 'Contamination is radioactive material getting on or in you; irradiation is being '
               'exposed to the radiation',
     'why': 'An irradiated object does not become radioactive and the exposure stops when the source '
            'is removed. Contamination travels with you and keeps decaying, which is why it is the '
            'harder problem.'},
])

# ------------------------------------------------ Magnetism & Electromagnetism

quiz('Physics', 'Magnetism & Electromagnetism', 'KS3', [
    {'ask': 'What happens when two north poles are brought together?',
     'choices': ['They repel', 'They attract', 'Nothing happens', 'They become south poles'],
     'answer': 'They repel',
     'why': 'Like poles repel, unlike poles attract. Repulsion is the only sure test for a magnet, '
            'because a magnet will attract an unmagnetised piece of iron too.'},
    {'ask': 'Which of these materials is magnetic?',
     'choices': ['Iron', 'Copper', 'Aluminium', 'Plastic'],
     'answer': 'Iron',
     'why': 'Iron, cobalt, nickel and steel are magnetic. Copper and aluminium are metals and '
            'conduct electricity well, but a magnet does not attract them.'},
    {'ask': 'How could you make an electromagnet stronger?',
     'choices': ['Add more turns of wire to the coil', 'Use a thinner wire',
                 'Reduce the current', 'Use a plastic core'],
     'answer': 'Add more turns of wire to the coil',
     'why': 'More turns, more current, or an iron core — all three strengthen it. The great advantage '
            'over a permanent magnet is that it can be switched off, which is what a scrapyard crane '
            'needs.'},
    {'ask': 'Which way does a compass needle point?',
     'choices': ['To the Earth’s magnetic north', 'Straight down',
                 'Towards the Sun', 'Towards the nearest metal'],
     'answer': 'To the Earth’s magnetic north',
     'why': 'A compass needle is a small magnet free to turn, so it lines up with the Earth’s '
            'field — which is evidence that the Earth’s core is magnetic.'},
    {'ask': 'Where is a magnet’s field strongest?',
     'choices': ['At the poles', 'In the middle', 'All over equally', 'Just outside the poles'],
     'answer': 'At the poles',
     'why': 'On a field diagram the lines are closest together at the poles, and how close the lines '
            'are is exactly what shows the strength.'},
])

quiz('Physics', 'Magnetism & Electromagnetism', 'GCSE-F', [
    {'ask': 'Which way do magnetic field lines point?',
     'choices': ['From north to south outside the magnet',
                 'From south to north outside the magnet',
                 'Always towards the magnet',
                 'Always away from the magnet'],
     'answer': 'From north to south outside the magnet',
     'why': 'Outside the magnet they run north to south; inside they complete the loop the other '
            'way. The direction is the way the north pole of a compass would point.'},
    {'ask': 'What is induced magnetism?',
     'choices': ['A magnetic material becoming a magnet when placed in a magnetic field',
                 'A magnet losing its magnetism when heated',
                 'A current being produced by a moving magnet',
                 'A magnet made by stroking with another magnet'],
     'answer': 'A magnetic material becoming a magnet when placed in a magnetic field',
     'why': 'Induced magnetism is always attraction, and it disappears when the field is removed — '
            'which is why a paper clip falls off as soon as the magnet is taken away.'},
    {'ask': 'What is the difference between a permanent magnet and an induced magnet?',
     'choices': ['A permanent magnet produces its own field all the time',
                 'An induced magnet is always stronger',
                 'A permanent magnet can be switched off',
                 'An induced magnet is made of copper'],
     'answer': 'A permanent magnet produces its own field all the time',
     'why': 'Permanent means its own field, always. Induced means borrowed from a nearby field and '
            'lost when that field goes.'},
    {'ask': 'What does the motor effect describe?',
     'choices': ['A current-carrying wire in a magnetic field experiences a force',
                 'A moving magnet produces a current in a wire',
                 'A magnet attracts iron filings',
                 'A current makes a wire hot'],
     'answer': 'A current-carrying wire in a magnetic field experiences a force',
     'why': 'The wire’s own field interacts with the magnet’s. Fleming’s left-hand '
            'rule gives the direction — first finger field, second finger current, thumb motion.'},
    {'ask': 'Around a straight wire carrying a current, the magnetic field is...',
     'choices': ['a series of concentric circles', 'straight lines along the wire',
                 'a single loop', 'the same shape as a bar magnet’s'],
     'answer': 'a series of concentric circles',
     'why': 'The circles get further apart with distance, so the field weakens. Reversing the current '
            'reverses the direction of the field.'},
])

quiz('Physics', 'Magnetism & Electromagnetism', 'GCSE-H', [
    {'ask': 'What is the generator effect?',
     'choices': ['A potential difference is induced when a conductor moves through a magnetic field',
                 'A wire carrying a current experiences a force',
                 'A magnet attracts a piece of iron',
                 'A current makes a coil into a magnet'],
     'answer': 'A potential difference is induced when a conductor moves through a magnetic field',
     'why': 'It is the motor effect run backwards: motion in, electricity out. Either the conductor '
            'moves or the field changes — what matters is that the field through the circuit is '
            'changing.'},
    {'ask': 'Calculate the force on a 0.5 m wire carrying 3 A in a 0.4 T field, at right angles. '
            '(F = BIl)',
     'choices': ['0.6 N', '6 N', '2.4 N', '0.15 N'],
     'answer': '0.6 N',
     'why': 'F = BIl = 0.4 × 3 × 0.5 = 0.6 N. At right angles is required — a wire parallel '
            'to the field feels no force at all.'},
    {'ask': 'A step-up transformer has 100 turns on the primary and 500 on the secondary. The input '
            'is 20 V. What is the output?',
     'choices': ['100 V', '4 V', '500 V', '25 V'],
     'answer': '100 V',
     'why': 'Vₛ/Vₚ = nₛ/nₚ, so Vₛ = 20 × 500/100 = 100 V. More turns on '
            'the secondary means a higher voltage — which is what step-up means, so an answer below '
            '20 V is the ratio inverted.'},
    {'ask': 'A transformer is 100% efficient. What does that tell you about the power?',
     'choices': ['The power in equals the power out, so raising V lowers I',
                 'The current is the same on both sides',
                 'The voltage is the same on both sides',
                 'No energy is transferred'],
     'answer': 'The power in equals the power out, so raising V lowers I',
     'why': 'VₚIₚ = VₛIₛ. That is why the National Grid can transmit at very high '
            'voltage and low current, wasting far less energy in the cables.'},
    {'ask': 'Why does a transformer not work with direct current?',
     'choices': ['A steady current gives a steady field, and only a CHANGING field induces a p.d.',
                 'Direct current is too weak',
                 'The iron core only works with a.c.',
                 'Direct current cannot flow in a coil'],
     'answer': 'A steady current gives a steady field, and only a CHANGING field induces a p.d.',
     'why': 'Induction depends on the field through the secondary CHANGING. Alternating current '
            'reverses fifty times a second, so the field is never still.'},
])

# -------------------------------------------------------- Electromagnetic Waves

quiz('Physics', 'Electromagnetic Waves', 'KS3', [
    {'ask': 'Which of these can travel through a vacuum?',
     'choices': ['Light', 'Sound', 'Both equally', 'Neither'],
     'answer': 'Light',
     'why': 'Electromagnetic waves need no medium, which is why we can see the Sun. Sound needs '
            'particles to vibrate, so space is silent.'},
    {'ask': 'Which part of the electromagnetic spectrum can we see?',
     'choices': ['Visible light', 'Infrared', 'Ultraviolet', 'Microwaves'],
     'answer': 'Visible light',
     'why': 'Visible light is a very narrow band in the middle of the spectrum. Everything either '
            'side of it is real radiation we cannot see, which is why detectors are needed.'},
    {'ask': 'What are microwaves used for?',
     'choices': ['Cooking and satellite communication', 'Taking pictures of bones',
                 'Sterilising surgical instruments', 'Suntanning beds'],
     'answer': 'Cooking and satellite communication',
     'why': 'Microwaves are absorbed by water molecules in food, heating it from within, and they '
            'also pass through the atmosphere well — which is what makes them good for satellites.'},
    {'ask': 'Which radiation do we feel as heat from a fire?',
     'answer': 'Infrared',
     'accept': 'infrared|infra red|infra-red|ir|infrared radiation',
     'why': 'Every object emits infrared, and the hotter it is the more it emits. Thermal imaging '
            'cameras detect exactly this.'},
    {'ask': 'Why should you wear sunscreen?',
     'choices': ['It absorbs ultraviolet, which can damage skin cells',
                 'It reflects all visible light',
                 'It blocks infrared so you stay cool',
                 'It stops X-rays from the Sun'],
     'answer': 'It absorbs ultraviolet, which can damage skin cells',
     'why': 'Ultraviolet is ionising, so it can damage DNA and cause skin cancer. It is the '
            'high-frequency end of the spectrum where the danger starts.'},
])

quiz('Physics', 'Electromagnetic Waves', 'GCSE-F', [
    {'ask': 'All electromagnetic waves travel at the same speed in a vacuum. What speed?',
     'choices': ['3 × 10⁸ m/s', '340 m/s', '3 × 10⁶ m/s', '1500 m/s'],
     'answer': '3 × 10⁸ m/s',
     'why': 'Three hundred million metres per second. 340 m/s is the speed of sound in air, which is '
            'nearly a million times slower — hence the gap between lightning and thunder.'},
    {'ask': 'What are radio waves mainly used for?',
     'choices': ['Television and radio broadcasting', 'Cooking food',
                 'Medical imaging of bones', 'Detecting forged banknotes'],
     'answer': 'Television and radio broadcasting',
     'why': 'They have the longest wavelength, so they diffract around hills and buildings and travel '
            'a long way — which is what a broadcast needs.'},
    {'ask': 'Which electromagnetic wave is used to check for broken bones?',
     'choices': ['X-rays', 'Radio waves', 'Infrared', 'Microwaves'],
     'answer': 'X-rays',
     'why': 'X-rays pass through soft tissue and are absorbed by bone, so the bone shows as a '
            'shadow. They are ionising, which is why exposure is kept as low as possible.'},
    {'ask': 'What happens when an object absorbs electromagnetic radiation?',
     'choices': ['Its energy increases, often warming it',
                 'It reflects the same radiation back',
                 'It becomes radioactive',
                 'Its mass increases'],
     'answer': 'Its energy increases, often warming it',
     'why': 'Absorbed energy has to go somewhere. Emission is the reverse — a hot object gives out '
            'radiation, which is why a good absorber is also a good emitter.'},
    {'ask': 'Which colour of surface is the best absorber of infrared radiation?',
     'choices': ['Matt black', 'Shiny silver', 'Shiny white', 'Matt white'],
     'answer': 'Matt black',
     'why': 'Matt black absorbs best and also emits best; shiny silver reflects and emits least. That '
            'is why a solar panel is black and a survival blanket is silver.'},
])

quiz('Physics', 'Electromagnetic Waves', 'GCSE-H', [
    {'ask': 'What produces gamma rays?',
     'choices': ['Changes in the nucleus of an atom',
                 'Electrons moving between energy levels',
                 'A heated filament',
                 'An oscillating electrical circuit'],
     'answer': 'Changes in the nucleus of an atom',
     'why': 'Gamma comes from the nucleus; X-rays come from electrons being stopped suddenly. They '
            'overlap in wavelength, so it is the ORIGIN that tells them apart, not the frequency.'},
    {'ask': 'Why do radio waves diffract around hills more than visible light does?',
     'choices': ['Their wavelength is similar to the size of the obstacle',
                 'They travel faster',
                 'They carry more energy',
                 'They are longitudinal'],
     'answer': 'Their wavelength is similar to the size of the obstacle',
     'why': 'Diffraction is greatest when the wavelength and the gap or obstacle are comparable. '
            'Light’s wavelength is under a micrometre, so a hill is billions of times too big '
            'for it to bend around.'},
    {'ask': 'An object is in thermal equilibrium. What does that mean about its radiation?',
     'choices': ['It absorbs radiation at the same rate as it emits it',
                 'It absorbs no radiation at all',
                 'It emits no radiation at all',
                 'It only reflects radiation'],
     'answer': 'It absorbs radiation at the same rate as it emits it',
     'why': 'Its temperature stays constant because the two rates match. If absorption exceeds '
            'emission it warms — which is the whole mechanism of the greenhouse effect.'},
    {'ask': 'What happens to the intensity and wavelength of radiation emitted by an object as it '
            'gets hotter?',
     'choices': ['Intensity rises and the peak moves to shorter wavelengths',
                 'Intensity rises and the peak moves to longer wavelengths',
                 'Intensity falls and the peak moves to shorter wavelengths',
                 'Neither changes'],
     'answer': 'Intensity rises and the peak moves to shorter wavelengths',
     'why': 'It is why metal glows red, then orange, then white as it heats — the peak is climbing '
            'from infrared into and through the visible range.'},
    {'ask': 'Ultraviolet is used in security marking because...',
     'choices': ['special ink fluoresces under UV but is invisible in ordinary light',
                 'UV burns a mark into the surface',
                 'UV passes through metal',
                 'UV is the only radiation that reflects off ink'],
     'answer': 'special ink fluoresces under UV but is invisible in ordinary light',
     'why': 'Fluorescence absorbs ultraviolet and re-emits visible light. The same effect makes a '
            'white shirt glow under a nightclub lamp.'},
])

# -------------------------------------------------------------- Space Physics

quiz('Physics', 'Space Physics', 'KS3', [
    {'ask': 'What is at the centre of our Solar System?',
     'choices': ['The Sun', 'The Earth', 'The Moon', 'A black hole'],
     'answer': 'The Sun',
     'why': 'The planets orbit the Sun because of its gravity. The Moon orbits the Earth — a natural '
            'satellite of a planet rather than of the star.'},
    {'ask': 'What keeps a planet in orbit around the Sun?',
     'choices': ['Gravity', 'Magnetism', 'Air resistance', 'The solar wind'],
     'answer': 'Gravity',
     'why': 'Gravity pulls the planet towards the Sun while it moves sideways fast enough to keep '
            'missing. That constant change of direction is what an orbit is.'},
    {'ask': 'How long does the Earth take to orbit the Sun?',
     'choices': ['One year', 'One day', 'One month', 'Ten years'],
     'answer': 'One year',
     'why': 'One orbit is a year; one spin on its axis is a day. The Moon takes about a month to go '
            'round the Earth.'},
    {'ask': 'What is a galaxy?',
     'choices': ['A huge collection of billions of stars', 'A planet with rings',
                 'A group of eight planets', 'A very large star'],
     'answer': 'A huge collection of billions of stars',
     'why': 'Our galaxy is the Milky Way, and the Sun is one ordinary star in it. There are billions '
            'of galaxies in the observable universe.'},
    {'ask': 'Why can we see the Moon?',
     'choices': ['It reflects light from the Sun', 'It produces its own light',
                 'It burns hydrogen', 'It glows from heat'],
     'answer': 'It reflects light from the Sun',
     'why': 'The Moon is a cold rock. The phases are just how much of its sunlit half we can see '
            'from where we are.'},
])

quiz('Physics', 'Space Physics', 'GCSE-F', [
    {'ask': 'What force causes a cloud of dust and gas to form a star?',
     'choices': ['Gravity', 'The strong nuclear force',
                 'Magnetism', 'Electrostatic attraction'],
     'answer': 'Gravity',
     'why': 'Gravity pulls the nebula together, and the compression heats it. When it is hot enough, '
            'hydrogen nuclei fuse — and the star is born.'},
    {'ask': 'What is the main sequence stage of a star?',
     'choices': ['A long stable period where gravity is balanced by outward pressure from fusion',
                 'The stage just before a star forms',
                 'The final stage of a very large star',
                 'The stage when a star becomes a black hole'],
     'answer': 'A long stable period where gravity is balanced by outward pressure from fusion',
     'why': 'Two opposing effects hold it steady, which is why it lasts billions of years. The star '
            'changes only when the hydrogen begins to run out and the balance fails.'},
    {'ask': 'What will our Sun become after the red giant stage?',
     'choices': ['A white dwarf', 'A neutron star', 'A black hole', 'A supernova'],
     'answer': 'A white dwarf',
     'why': 'A star of our Sun’s size sheds its outer layers and the core shrinks to a white '
            'dwarf. Only much more massive stars explode as supernovae and leave a neutron star or '
            'a black hole.'},
    {'ask': 'What does red-shift tell us about distant galaxies?',
     'choices': ['They are moving away from us', 'They are moving towards us',
                 'They are made of red stars', 'They are very hot'],
     'answer': 'They are moving away from us',
     'why': 'The light is stretched to longer wavelengths, which is towards the red end. The further '
            'away a galaxy is, the faster it recedes — the evidence the universe is expanding.'},
    {'ask': 'Which theory is supported by red-shift and the cosmic microwave background?',
     'answer': 'The Big Bang',
     'accept': 'big bang|the big bang|big bang theory|the big bang theory|bigbang',
     'why': 'Both fit a universe that began in a very small dense region and has been expanding ever '
            'since. The microwave background is the afterglow, stretched into the microwave range by '
            'that expansion.'},
])

quiz('Physics', 'Space Physics', 'GCSE-H', [
    {'ask': 'Why does an object in a circular orbit accelerate even at constant speed?',
     'choices': ['Its direction, and so its velocity, is constantly changing',
                 'Its speed is secretly increasing',
                 'Gravity increases as it orbits',
                 'It is not accelerating'],
     'answer': 'Its direction, and so its velocity, is constantly changing',
     'why': 'Velocity is a vector, so changing direction IS changing velocity. Gravity provides the '
            'centripetal force, always at right angles to the motion — which turns it without '
            'speeding it up.'},
    {'ask': 'A satellite is moved to a higher orbit. What happens to its speed?',
     'choices': ['It must travel more slowly to stay in a stable orbit',
                 'It must travel faster',
                 'Its speed does not change',
                 'It cannot stay in orbit at all'],
     'answer': 'It must travel more slowly to stay in a stable orbit',
     'why': 'Gravity is weaker further out, so less centripetal force is available — and a slower '
            'speed is what that supports. That is also why higher orbits take longer.'},
    {'ask': 'How does a star of much greater mass than the Sun end its life?',
     'choices': ['As a supernova, leaving a neutron star or a black hole',
                 'As a white dwarf, then a black dwarf',
                 'By slowly cooling into a planet',
                 'By becoming a nebula only'],
     'answer': 'As a supernova, leaving a neutron star or a black hole',
     'why': 'The explosion is where elements heavier than iron are made and scattered — which is why '
            'there is iron in your blood and calcium in your bones.'},
    {'ask': 'Where did elements heavier than iron come from?',
     'choices': ['Supernova explosions', 'Fusion in main sequence stars',
                 'The Big Bang itself', 'Radioactive decay on planets'],
     'answer': 'Supernova explosions',
     'why': 'Fusion in a star only builds up as far as iron, because beyond that it takes energy in '
            'rather than releasing it. Only the violence of a supernova supplies that energy.'},
    {'ask': 'The Big Bang theory is supported by, among other things, the cosmic microwave background '
            'radiation. What is it?',
     'choices': ['Radiation left over from the early universe, stretched by expansion',
                 'Radiation given off by the Milky Way',
                 'Microwaves reflected from distant galaxies',
                 'Heat from the Sun spread through space'],
     'answer': 'Radiation left over from the early universe, stretched by expansion',
     'why': 'It comes from every direction almost equally, which is hard to explain any other way. '
            'It was gamma and X-ray at the start and has been stretched into the microwave range by '
            'the expansion since.'},
])
