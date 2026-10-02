## Mentos and cola was already a practical, and its row said three things that were not true

**Asked for as "Elephant toothpaste coke mentos volcanoa".** All three are already in
`data/practicals.json`: elephant's toothpaste is `PR-HM01`, the volcano `PR-HM11`, and the
Diet Coke geyser `PR-HM33`, "Mentos and cola". It came in with the twenty-five from the pasted
library and has a drawing, kit, six steps, four risks with what to do about each, things to change
and to measure, and a science paragraph about nucleation. A second row would be the duplicate this
file refuses for the lab and home versions of one practical, so no row was added.

**Reviewed against its own text, three cells contradicted the rest of the row:**

| | was | is | why |
|---|---|---|---|
| `topics` | Rate of Reaction, … | **Solubility, Particle Model of Matter**, Bar Charts & Pictograms, Units & Measures | the science paragraph opens *"Nothing is reacting here, which is the part almost everybody gets wrong"*. The Rate of Reaction tag filed it under that same misconception. The new tags are what it is about: a dissolved gas leaving solution, and gas under pressure |
| `venue` | home | **outdoors** | its safety line is *"Outdoors only"* and its risks say *"never indoors"*. `home` read as a front-room practical. `PR-HM04`, also outdoors-only, is already `outdoors` |
| `hazard` | none | **low** | a fountain several metres high, and a bottle that can fall over and spray sideways. `PR-HM15`, the balloon gas-pressure practical, is `low` |
| the £5 | `setup_cost_gbp` | **`cost_per_run_gbp`** | the kit page said *"About £5.00 of kit to set up, and it is bought once"*. That £5 is three two-litre bottles and a tube of mints, and one session uses all of them up. The cane, the tape measure and the phone are household things. The card strip now reads `£5.00 a run` |

**A screenshot of the kit page is what found the cost fault.** Nothing in the checks reads that
sentence. `tools/add-practicals-home-set.py` still holds the old values and has already drifted from
the file: its equipment cell predates the `× qty` pass. The data file is the source; that script is
a one-time writer and was not re-run.
