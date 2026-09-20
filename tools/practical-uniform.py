"""
MAKE THE PRACTICALS REPEATABLE BY ANYBODY.

REPORTED AS "it seems you speciallised the practicles for me and my situation. it needs to be more
systematic and uniform like repeatable for anyone."

MEASURED BEFORE ANYTHING WAS WRITTEN, because "feels specialised" is not something to guess at.
Four things, and only one of them is prose:

  * `age_min` ON 16 OF 57 AND `wow` ON 16 OF 57 -- and it is the SAME sixteen, the set that came
    out of one chat transcript about one learner. Two columns that exist on a subset make two kinds
    of card down one column: eleven that say "7+ / worth opening a session with" and forty-six that
    say neither. That is the uniformity complaint in its measurable form.
  * TWO PRACTICALS NAMED AFTER ONE TOWN'S PARK AND RIVER -- "Perimeter of Wandle Park", "Flow rate
    of the River Wandle". A method that names a place only works for somebody standing in it.
  * NOTES ADDRESSING ONE PERSON AND ONE SESSION -- "before HE is watching", "This is the one to open
    with", "THE MOST VALUABLE ONE IN THE SET".
  * A PRACTICAL BUILT AROUND WHAT ONE HOUSE HAS -- "Fish behaviour logging".

`age_min` IS NOT `level` RESTATED, AND THAT WAS CHECKED RATHER THAN ASSUMED. `level: 'GCSE'` carries
ages 6, 8, 9, 13 and 14 across the sixteen rows that have both -- the volcano is GCSE content about
rates and ratio that a six-year-old can pour. So `level` is the spec content and `age_min` is the
youngest child who can DO it, and they are two facts. Storing one as the other would be the
`needs_print` / `print_required` fault this repository records three times.

SO THE RULE IS STATED RATHER THAN THE VALUES GUESSED. Where nobody has made a narrower judgement,
the youngest child who can do a practical is the youngest in the band it is set for -- which is
`level`'s own lower bound. The sixteen that carry a judgement keep it; this script never overwrites
one, and asserts that it did not.

`wow` IS A JUDGEMENT AND IS WRITTEN OUT ONE ROW AT A TIME. It cannot be derived: it answers "is
there anything to SEE", and a titration and an electrolysis are the same level, the same venue and
the same subject with completely different answers. A closed list of five, the same vocabulary
`check-practicals.js` already enforces. Nothing here is computed from a word in the name -- that is
the substring fault this repository records, where `/required practical/` matched
"AQA-aligned, NOT a required practical" and put a gold flag on five cards that say they are not one.
"""
import json
import os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PATH = os.path.join(HERE, 'data', 'practicals.json')

# ---------- THE AGE RULE, WHICH IS ONE LINE AND A TABLE --------------------------------------------
# The lower end of the band the practical is set for. `level` is a closed vocabulary of five values
# and this covers all five; an unknown one is a failure rather than a default, because a default
# here is a number printed on a card that nobody chose.
BAND_FLOOR = {'KS2': 7, 'KS3': 11, 'GCSE': 14, 'A-level': 16}


def age_from_level(level):
    first = str(level).split('–')[0].split('-')[0].strip()
    if first == 'A':                      # 'A-level' split on the hyphen
        first = 'A-level'
    assert first in BAND_FLOOR, 'no floor for level %r' % level
    return BAND_FLOOR[first]


# ---------- IS THERE ANYTHING TO SEE ---------------------------------------------------------------
# One line per row, written by looking at what the practical actually does. The card reads the top
# two values to print "Worth opening a session with", which is a fact about CHOOSING between
# practicals -- so a column that is blank on forty-six of them is a feature that works for eleven.
WOW = {
    # Physics -- mostly instruments and readings; the wave and light ones are the two you watch.
    'PR-PH01': 'low', 'PR-PH02': 'low', 'PR-PH03': 'low', 'PR-PH04': 'medium',
    'PR-PH05': 'medium', 'PR-PH06': 'medium', 'PR-PH07': 'medium',
    'PR-PH08': 'medium-high', 'PR-PH09': 'medium-high', 'PR-PH10': 'medium',
    # Chemistry -- a colour change or a gas is the whole of it.
    'PR-CH01': 'medium', 'PR-CH02': 'medium', 'PR-CH03': 'high', 'PR-CH04': 'low',
    'PR-CH05': 'medium', 'PR-CH06': 'high', 'PR-CH07': 'high', 'PR-CH08': 'medium',
    # Biology -- seeing a cell and a food test going orange are the two that land.
    'PR-BI01': 'high', 'PR-BI02': 'medium-high', 'PR-BI03': 'low', 'PR-BI04': 'high',
    'PR-BI05': 'medium', 'PR-BI06': 'medium', 'PR-BI07': 'medium-high',
    'PR-BI08': 'low', 'PR-BI09': 'medium', 'PR-BI10': 'low',
    # The rest -- measuring the planet with a shadow is the highest thing in the file.
    'PR-FN01': 'very high', 'PR-FN02': 'very high', 'PR-FN03': 'medium-high',
    'PR-FN04': 'very high', 'PR-FN05': 'high', 'PR-FN06': 'high', 'PR-FN07': 'medium',
    'PR-FN08': 'high', 'PR-FN09': 'medium', 'PR-FN10': 'medium-high', 'PR-FN11': 'high',
    'PR-FN12': 'medium', 'PR-FN13': 'high',
}

# ---------- AND THE PROSE THAT ONLY WORKS FOR ONE PERSON IN ONE TOWN --------------------------------
# Each is old -> new, applied to whichever field holds it, and every one is asserted to have been
# found. A replacement that silently matches nothing is the shape this repository records every time
# a rule is written from the instance that prompted it.
EDITS = [
    ('PR-FN09', 'name', 'Perimeter of Wandle Park with a trundle wheel',
                        'Perimeter of a park with a trundle wheel'),
    ('PR-FN10', 'name', 'Flow rate of the River Wandle', 'Flow rate of a river'),
    ('PR-FN10', 'aim',  'Estimate how much water passes a point on the Wandle every second.',
                        'Estimate how much water passes a point on a river every second.'),
    ('PR-FN10', 'steps', 'Compare with the Environment Agency figure for the Wandle.',
                         'Compare with the Environment Agency gauging figure for that river, if it has one.'),
    ('PR-FN10', 'notes',
     'The Wandle runs straight past the Sainsbury’s footbridge — the landmark data already has it.',
     'Pick the stretch before the session and check the bank is fenced or gently shelving.'),
    ('PR-CH08', 'notes', 'Ties neatly to a trip along the Wandle — pond, tap and bottled water side by side.',
                         'Ties neatly to a walk to the nearest pond — pond, tap and bottled water side by side.'),
    ('PR-BI09', 'notes', 'Wandle Park or Colliers Wood Recreation Ground both work.',
                         'Any park or playing field with two plainly different areas — mown and unmown, sun and shade.'),
    ('PR-FN01', 'steps', 'Britannia Point in Colliers Wood is 59.5 m over 17 storeys.',
                         'A tower block whose storey count you can see works: about 3.5 m a storey.'),
    # ONE PERSON AND ONE SESSION, in three places.
    ('PR-HM07', 'notes', 'Build it and focus it before he is watching, or the first look is a disappointment.',
                         'Build it and focus it before the session, or the first look is a disappointment.'),
    ('PR-HM01', 'notes', 'This is the one to open with.',
                         'A good one to open with: it is over in seconds and it buys attention for the measuring.'),
    ('PR-HM05', 'notes', 'THE MOST VALUABLE ONE IN THE SET for teaching method, and the least impressive to look at.',
                         'THE BEST ONE HERE FOR TEACHING METHOD, and the least impressive to look at.'),
    ('PR-HM09', 'log', 'How many were over the limit — most of Merton and Wandsworth is 20 mph',
                       'How many were over the limit — check the sign for the street you are on'),
    # BUILT AROUND WHAT ONE HOUSE HAS. The kit already said "a fish tank, or a pond, or birds through
    # a window", so only the name and the aim were narrower than the row underneath them.
    ('PR-HM10', 'name', 'Fish behaviour logging', 'Animal behaviour logging'),
]


def main():
    lines = open(PATH, encoding='utf-8').read().rstrip('\n').split('\n')
    assert lines[0].strip() == '[', 'line 1 is not a bare ['
    assert lines[-1].strip() == ']', 'the file does not end with a bare ]'
    rows = [json.loads(l.strip().rstrip(',')) for l in lines[1:-1] if l.strip()]
    by = {r['practical_id']: r for r in rows}

    ages = wows = 0
    kept_age = kept_wow = 0
    for r in rows:
        if str(r.get('age_min') or '').strip():
            kept_age += 1
        else:
            r['age_min'] = age_from_level(r.get('level'))
            ages += 1
        if str(r.get('wow') or '').strip():
            kept_wow += 1
        else:
            assert r['practical_id'] in WOW, 'no wow written for ' + r['practical_id']
            r['wow'] = WOW[r['practical_id']]
            wows += 1

    for pid, field, old, new in EDITS:
        r = by.get(pid)
        assert r is not None, 'no such practical: ' + pid
        assert old in str(r.get(field) or ''), 'not found in %s.%s: %r' % (pid, field, old[:50])
        r[field] = str(r[field]).replace(old, new)

    # ---------- AND NOTHING MAY BE LEFT BLANK ON EITHER COLUMN ------------------------------------
    for r in rows:
        assert str(r.get('age_min') or '').strip(), r['practical_id'] + ' still has no age_min'
        assert str(r.get('wow') or '').strip(), r['practical_id'] + ' still has no wow'
    # AND NO PLACE NAME SURVIVES. The sweep that found them, run again as a refusal.
    LOCAL = ('Wandle', 'Colliers Wood', 'Britannia Point', 'Wandsworth', 'Croydon', 'Merton')
    for r in rows:
        for k, v in r.items():
            if isinstance(v, str):
                for w in LOCAL:
                    assert w not in v, '%s.%s still names %s' % (r['practical_id'], k, w)

    body = ',\n'.join(json.dumps(r, ensure_ascii=False) for r in rows)
    open(PATH, 'w', encoding='utf-8').write('[\n' + body + '\n]\n')
    print('%d rows' % len(rows))
    print('  age_min : %d filled from the level band, %d judgements kept' % (ages, kept_age))
    print('  wow     : %d written out, %d kept' % (wows, kept_wow))
    print('  prose   : %d edits, every one found' % len(EDITS))


if __name__ == '__main__':
    main()
