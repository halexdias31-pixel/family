# -*- coding: utf-8 -*-
"""AQA GCSE English Language 8700/1, June 2025 — Source A, from the Insert.

The text is real, supplied by the site's owner from the printed insert. What did NOT survive the
copy is the LINE NUMBERING, and on this paper that matters more than on any other: every reading
question on Paper 1 points at lines ("read again lines 1 to 6", "look in detail at lines 10 to 19").
Numbering the lines as they happen to wrap here would produce numbers that are not AQA's, and a
question pointing at the wrong six lines is the worst kind of wrong — it reads perfectly sensibly.
So the prose is faithful, the numbers are absent, and the row says so.
"""
import json

P = '/home/user/family/data/questions.json'
PID = 'P-AQA-8700-2506-1'
NAME = 'Paper 1: Explorations in Creative Reading and Writing — June 2025'

PARAS = [
 'From 10.17 that night, information about Midwich became episodic. Its telephones remained dead. '
 'The bus that should have passed through it failed to reach its destination, and a truck that went '
 'to look for the bus did not return. Someone in Oppley reported a house on fire in Midwich, with, '
 'apparently, nothing being done about it. The Trayne fire engine turned out &ndash; and thereafter '
 'failed to make any reports. The Trayne police station despatched a car to find out what had '
 'happened to the fire engine, and that, too, vanished into silence. Constable Gobby was sent off '
 'on his bicycle to Midwich; and no more was heard of him, either&hellip;',

 'The early morning of the 27th was an affair of slatternly<sup>*</sup> rags soaking in a dishwater '
 'sky, with a grey light weakly filtering through. Nevertheless, in Oppley cocks crowed and other '
 'birds welcomed the dawn more melodiously. In Midwich, however, no birds sang. In Oppley, as in '
 'other places, hands were soon reaching out to silence alarm clocks, but in Midwich the clocks '
 'rattled on until they ran down. For Midwich lay entranced.',

 'While the rest of the world began to fill the morning with clamour, Midwich slept on. Its men and '
 'women, its horses, cows and sheep; its pigs, its poultry, its larks, moles and mice all lay still. '
 'There was a pocket of silence in Midwich, broken only by the rustling of the leaves, the chiming '
 'of the church clock, and the gurgle of the River Opple as it slid over the weir beside the mill.',

 'And while the dawn was still a poor, weak thing, an olive-green van, with the words '
 '&lsquo;Post Office Telephones&rsquo; just discernible on it, set out from Trayne with the object '
 'of putting the rest of the world in touch with Midwich again.',

 'In Stouch it paused at the village phone box to enquire whether Midwich had yet shown any signs '
 'of life. Midwich had not; it was still as deeply incommunicado as it had been since 10.17 the '
 'previous night. The van restarted and rattled on through the uncertainly gathering daylight.',

 'A little out of Stouch the van swung sharply to the right and bounced along the byroad to Midwich '
 'for half a mile or so. Then it rounded a corner to encounter a situation which called for all of '
 'the driver&rsquo;s presence of mind.',

 'He had a sudden view of a fire engine, half keeled over, with its nearside wheels in the ditch, '
 'and a black saloon car which had climbed halfway up the bank on the other side a few yards '
 'further on, with a man and a bicycle lying half in the ditch behind it. He pulled hard over, '
 'attempting an S-turn which would avoid both vehicles. But before he could complete it his own van '
 'ran on to the narrow verge, bumped along for a few more yards, then ploughed to a stop, with its '
 'side in the hedge.',

 'Half an hour later, the first bus of the day rattled round the same corner to jam itself neatly '
 'into the gap between the fire engine and the van and block the road completely.',

 'The mail van was the first vehicle to stop without becoming involved. One of its occupants got '
 'out and walked forward to investigate the disorder. He was just approaching the rear of the '
 'stationary bus when, without any warning, he quietly folded up and dropped to the ground. The '
 'driver&rsquo;s jaw fell open and he stared. Then, looking beyond his fallen companion, he saw the '
 'heads of some of the bus passengers, all quite motionless. He reversed hastily, turned and made '
 'for Oppley and the nearest telephone.',
]

INSERT = (
  '<h4>Insert &mdash; Source A</h4>'
  '<p class="src-what">20th century prose fiction &middot; <i>The Midwich Cuckoos</i> by John '
  'Wyndham &middot; an extract from near the beginning of a novel written in 1957</p>'
  '<p class="src-set">This extract is taken from near the beginning of a novel by John Wyndham. '
  'The story begins on the night of 26th September in the quiet village of Midwich.</p>'
  + ''.join('<p>%s</p>' % p for p in PARAS)
  + '<p class="src-foot">* <b>slatternly</b> &mdash; adjective meaning dirty or untidy</p>'
  + '<p class="src-foot"><b>The line numbers are not here.</b> The printed insert numbers the lines '
    'and every reading question points at them &mdash; &ldquo;lines 1 to 6&rdquo;, &ldquo;lines 10 '
    'to 19&rdquo;. Numbering these as they happen to wrap would give numbers that are not '
    'AQA&rsquo;s, and a question pointing at the wrong six lines reads perfectly sensibly. Paste the '
    'numbered version over this row when you have it.</p>')

def main():
    lines = open(P).read().split('\n')
    rows = [json.loads(l.rstrip(',')) for l in lines[1:] if l.strip() not in (']', '')]
    ids = {r['row_id'] for r in rows}
    assert not [r for r in rows if r.get('paper_id') == PID], 'that paper is already in here'

    base = {
      'paper_id': PID, 'active': 'True', 'name': NAME,
      'subject': 'English Language', 'resource_type': 'Past paper', 'key_stage': 'KS4',
      'band_type': 'stage', 'band_value': 'GCSE', 'level': 'GCSE',
      'company': 'AQA', 'exam_board': 'AQA', 'spec_code': '8700-01-01',
      'year': '2025', 'month': '6', 'exam_wave': 'First wave', 'paper': '1',
      'needs_print': 'True',
    }

    paper = dict(base)
    paper.update({'row_id': 'D-' + PID, 'kind': 'paper', 'total_marks': '80'})

    stem = dict(base)
    stem.update({
      'row_id': 'S-' + PID + '-A', 'kind': 'stem', 'section': 'Section A: Reading',
      'html': INSERT,
      'examiner_note': 'LINE NUMBERS NOT RECOVERED — the printed insert numbers its lines and every '
                       'reading question on this paper refers to them. The prose is complete.',
    })
    for r in (paper, stem):
        assert r['row_id'] not in ids, r['row_id']
        ids.add(r['row_id'])

    rows += [stem, paper]
    assert len({r['row_id'] for r in rows}) == len(rows)
    out = ['['] + [json.dumps(r, ensure_ascii=False) + ',' for r in rows]
    out[-1] = out[-1][:-1]
    out.append(']')
    open(P, 'w').write('\n'.join(out) + '\n')
    print('added', NAME, '— the insert, and the paper row. No questions: I do not have that paper.')

main()
