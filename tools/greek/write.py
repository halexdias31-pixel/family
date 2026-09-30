"""Edexcel GCSE Greek (1GK0) Paper 1, Listening — the QUESTIONS, with no answers yet.

The owner: "i dont care that we dont have the audio at the moment. we can do that later. but at
least we can do questions". So every question row carries the paper's own words and an EMPTY
answer. Nothing is guessed: a listening answer is a fact about a recording nobody here has heard,
and the mark scheme (1GK0_1F_msc / 1GK0_1H_msc) is not in Drive either. When the audio and the
schemes arrive, `answer` and `accept` are filled from the scheme and nothing else moves.

One paper-scoped preamble per paper says the recording is not here, marked `placeholder: True` so
`check-library.js` lists it with the other stand-ins until it is replaced.

The two covers disagree with their filenames, and the cover wins where it can:
  1GK0_1F_que_20190615.pdf  cover: Friday 14 June 2019 — sat that day, so exam_date is set.
  1GK0_1H_que_20201117.pdf  cover: Friday 12 June 2020. The June 2020 series was cancelled, and
      Edexcel sat its June 2020 papers in the November 2020 series instead — which is what the
      filename's date is. So it is filed as November 2020 with NO exam_date: the day it was sat
      is not printed anywhere we have.

Replaces every row whose paper_id starts with PREFIX and nothing else, so a re-run is safe.
    python3 tools/greek/write.py
"""
import json, pathlib, html as H
ROOT = pathlib.Path(__file__).resolve().parents[2]
TARGET = ROOT / 'data' / 'questions.json'
PREFIX = 'P-1GK0-'

def e(s): return H.escape(s, quote=False)
def ul(xs): return '<ul>' + ''.join('<li>' + e(x) + '</li>' for x in xs) + '</ul>'
def opts(xs):   # a lettered option list, as the paper prints it
    return '<ul>' + ''.join('<li><b>%s</b> %s</li>' % ('ABCDEFG'[i], e(x)) for i, x in enumerate(xs)) + '</ul>'
def box(words, cols=3):
    rows = [words[i:i + cols] for i in range(0, len(words), cols)]
    return '<table>' + ''.join('<tr>' + ''.join('<td>%s</td>' % e(w) for w in r) + '</tr>' for r in rows) + '</table>'
BLANK = '……………'

def paper(pid, doc, parts):
    rows = []
    base = {k: doc[k] for k in ('paper_id', 'subject', 'key_stage', 'band_type', 'band_value', 'tier',
                                'level', 'company', 'exam_board', 'spec_code', 'exam_wave', 'year',
                                'month', 'paper', 'document_type', 'name', 'active')}
    d = dict(doc); d['row_id'] = 'D-' + pid; d['kind'] = 'document'
    rows.append(d)
    rows.append(dict(base, row_id='Q-' + pid[2:] + '-AUDIO', kind='preamble', placeholder='True',
        html='<p><b>This is a listening paper and the recording is not in the app yet.</b> The '
             'questions are here to read and answer; each extract is played twice in the exam. '
             'Answers will be added with the mark scheme.</p>'))
    total = 0
    for p in parts:
        if p['kind'] == 'preamble':
            rows.append(dict(base, row_id='Q-%s-%s' % (pid[2:], p['q']), kind='preamble',
                             question=p['q'], section=p['section'], html=p['html']))
            continue
        rid = 'Q-%s-%s%s' % (pid[2:], p['q'], p.get('part', ''))
        rows.append(dict(base, row_id=rid, kind='question', question=p['q'], part=p.get('part', ''),
            section=p['section'], marks=str(p['marks']), html=p['html'], answer='', accept='',
            answer_type=p.get('type', 'short'), topics='', figure='', diagram='', placeholder=''))
        total += p['marks']
    assert total == int(doc['total_marks']), '%s sums to %d, cover says %s' % (pid, total, doc['total_marks'])
    ids = [r['row_id'] for r in rows]
    assert len(ids) == len(set(ids)), pid + ': duplicate row_id'
    return rows

def Q(q, sec, marks, html, part='', type='short'):
    return dict(kind='question', q=q, section=sec, marks=marks, html=html, part=part, type=type)
def P(q, sec, html):
    return dict(kind='preamble', q=q, section=sec, html=html)

COMMON = dict(subject='Greek', key_stage='KS4', band_type='stage', band_value='GCSE', level='GCSE',
              company='Edexcel', exam_board='Edexcel', document_type='Past paper', paper='1',
              active='True', total_marks='50', trackable='True', printable='False', needs='')

# ---------------------------------------------------------------- Foundation, June 2019
F = 'P-1GK0-1906-1F'
FDOC = dict(COMMON, paper_id=F, tier='Foundation', spec_code='1GK0/1F', exam_wave='First wave',
            year='2019', month='6', exam_date='2019-06-14',
            name='Paper 1: Listening — June 2019',
            source_url='https://drive.google.com/file/d/1--QAN8fBfAg6KGX9BBzAllehnkUPPf2Y/view')
cross3 = 'Listen to the recording and put a cross in each one of the three correct boxes.'
FP = [
  Q('1', 'A', 3, '<p><b>Lunch time.</b> What do your Greek friends have for lunch?</p><p>%s</p>'
     '<p><i>Example: Greek salad</i></p>%s' % (cross3, opts(['roast chicken', 'fish', 'kebab', 'cheese pie',
     'pasta', 'green beans', 'soup'])), type='short'),
  P('2', 'A', '<p><b>My first part-time job.</b> Andria, your exchange partner from Paphos, talks about '
     'her first part-time job. Listen to the recording and complete these statements by putting a cross '
     'in the correct box for each question.</p><p><i>Example: She works at a… hotel.</i></p>'),
  Q('2', 'A', 1, '<p>She works on…</p>' + opts(['Thursdays', 'Fridays', 'Saturdays', 'Sundays']), part='i'),
  Q('2', 'A', 1, '<p>She enjoys…</p>' + opts(['answering the phone', 'meeting new people',
     'learning new skills', 'practising foreign languages']), part='ii'),
  Q('2', 'A', 1, '<p>She finishes work at…</p>' + opts(['8:30pm', '10:00pm', '10:30pm', '11:00pm']), part='iii'),
  Q('3', 'A', 3, '<p><b>Youth Camp For Peace.</b> Panos and his friends — Panos, Fotini and Maria — are '
     'talking about an international peace camp. Who says what? Listen to the recording and put a cross '
     'next to each one of the three correct statements, in the column of the person who says it.</p>'
     '<p><i>Example: I meet people from all over the world — Panos.</i></p>' + opts(['I learn about the Olympic Games',
     'I learn about other cultures', 'I now realise how bad war is', 'I realise sport is important',
     'I enjoy going on trips nearby', 'I discuss world affairs', 'All lectures are in English'])),
  Q('4', 'A', 3, '<p><b>Improving our town.</b> During an online conversation, Minas, Efi and Dimitra, '
     'students in Greece, say how they think their town can be improved. What do they say? Listen to the '
     'recording and put a cross in each one of the three correct boxes, in the column of the person who '
     'says it.</p><p><i>Example: There are many old blocks of flats.</i></p>' + opts([
     "There aren't enough eating places", 'Festivals are rarely organised',
     'The area around the port needs cleaning up', 'Something has to be done about air pollution',
     'More green spaces are needed', 'We need more cycle paths around the port', 'Sports facilities are needed'])),
  P('5', 'A', '<p><b>School.</b> During an online conversation Sophia talks about her school in Cyprus. '
     'Listen to the recording and answer the following questions in English.</p>'),
  Q('5', 'A', 1, "<p>Where in Cyprus is Sophia's school located?</p>", part='a'),
  Q('5', 'A', 1, '<p>What does she think of her teachers?</p>', part='b'),
  Q('5', 'A', 2, '<p>What is her favourite subject and why?</p>', part='c', type='written'),
  P('6', 'A', '<p><b>Online activities.</b> During a conversation Eleanna and Vassilis say what they like '
     'doing online. Complete the sentences. Use the correct word or phrase from the box.</p>' + box([
     'watch films', 'write a blog', 'download music', 'use social media', 'shop online',
     'chat with friends', 'research for homework', 'play games'], 2)),
  Q('6', 'A', 1, '<p>Eleanna likes to <i>use social media</i> and to %s .</p>' % BLANK, part='a'),
  Q('6', 'A', 2, '<p>Vassilis likes to %s and to %s .</p>' % (BLANK, BLANK), part='b'),
  Q('7', 'A', 3, '<p><b>Volunteers needed.</b> When you are in Greece you hear this job advertisement on '
     'the radio. What does the advert say the applicant must be able to do? %s</p>'
     '<p><i>Example: work as a doctor</i></p>%s' % (cross3, opts(['apply online', 'work part-time',
     'treat tourists', 'support Doctors Without Borders', 'work nights', 'help unemployed people',
     'live in the city centre']))),
  P('8', 'A', '<p><b>Weather.</b> You are on holiday in Corfu at Easter and you hear the weather report '
     'on the radio. Listen to the weather report and answer the following questions in English.</p>'),
  Q('8', 'A', 1, '<p>Why is the good weather ideal for celebrating Easter?</p>', part='a'),
  Q('8', 'A', 1, '<p>What might happen in the afternoon?</p>', part='b'),
  Q('8', 'A', 1, '<p>How will people intending to travel by sea on Monday be affected by the weather?</p>', part='c'),
  P('9', 'A', "<p><b>A school exchange visit.</b> Elli's school hosted an exchange visit in Athens. Listen "
     'to the recording and complete the sentences by putting a cross in the correct box for each '
     'question.</p><p><i>Example: First of all the students of the two schools… introduced themselves on Skype.</i></p>'),
  Q('9', 'A', 1, '<p>The exchange trip was funded by…</p>' + opts(['the students themselves',
     'the European Union', 'the British Council', 'the city of Athens']), part='i'),
  Q('9', 'A', 1, '<p>On the first day the host school organised…</p>' + opts(['museum visits', 'a concert',
     'board games', 'a beach volleyball']), part='ii'),
  Q('9', 'A', 1, '<p>At the host school the British students…</p>' + opts(['played football at break time',
     'were taken on a tour of the school', 'made friends', 'learnt about Greek history']), part='iii'),
  Q('9', 'A', 1, '<p>On the last day the students…</p>' + opts(['had a group photo', 'had a farewell party',
     'were emotional', 'exchanged presents']), part='iv'),
  P('10', 'A', '<p><b>Looking for a job.</b> Stephanos and Yiannis are talking about a job opportunity. '
     'Listen to the conversation and answer the following questions in English.</p>'),
  Q('10', 'A', 1, '<p>When is the job for?</p>', part='a'),
  Q('10', 'A', 2, '<p>What type of job is available? Give two details.</p>', part='b', type='written'),
  Q('10', 'A', 1, '<p>What is Yiannis hoping for?</p>', part='c'),
  Q('11', 'A', 3, '<p><b>Creative recycling.</b> Maria and George are talking about recycling materials. '
     'What do they say? %s</p><p><i>Example: Maria made a piece of jewellery.</i></p>%s' % (cross3, opts([
     'Reducing waste is important.', 'S/he spent a lot of money.', 'Only certain materials are re-usable.',
     'You can sell what you make.', 'Creating makes you happy.',
     'S/he attended a workshop on reusing materials.', 'S/he teaches recycling.']))),
  P('12', 'A', '<p><b>A special offer.</b> You are in Greece for a gap year and you hear this advertisement '
     'on the radio. Listen to the advertisement and answer the following questions in English.</p>'),
  Q('12', 'A', 1, '<p>What is offered to people born in 1999?</p>', part='a'),
  Q('12', 'A', 1, '<p>How long is the offer open for?</p>', part='b'),
  Q('12', 'A', 1, '<p>What would you need to bring with you?</p>', part='c'),
  Q('12', 'A', 1, '<p>Why are you asked to visit the website?</p>', part='d'),
  P('13', 'B', '<p><b>Διακοπές.</b> Η Στέλλα, μια Ελληνίδα φίλη σου, σου μιλάει μέσω Skype για τις '
     'καλοκαιρινές της διακοπές.</p><p>Συμπλήρωσε τα κενά με μία ή περισσότερες λέξεις από τον πίνακα, '
     'όπως στο παράδειγμα. Οι λέξεις είναι περισσότερες από τα κενά.</p>' + box(['τα θαλασσινά',
     'τουριστικό', 'την Σκιάθο', 'πράσινο', 'μπάνιο', 'σπίτι', 'ξενοδοχείο', 'οι μεζέδες',
     'δεκαπέντε μέρες', 'την Σκόπελο', 'δέκα μέρες', 'ψάρεμα'])
     + '<p><i>Παράδειγμα: Το καλοκαίρι η Στέλλα θα επισκεφτεί την Σκόπελο.</i></p>'),
  Q('13', 'B', 1, '<p>Το νησί είναι %s</p>' % BLANK, part='a'),
  Q('13', 'B', 1, '<p>Η Στέλλα θα μείνει σε %s</p>' % BLANK, part='b'),
  Q('13', 'B', 1, '<p>Νωρίς το πρωί θα πηγαίνει για %s</p>' % BLANK, part='c'),
  Q('13', 'B', 1, '<p>Της αρέσουν %s</p>' % BLANK, part='d'),
  Q('13', 'B', 1, '<p>Οι διακοπές θα διαρκέσουν %s</p>' % BLANK, part='e'),
  P('14', 'B', '<p><b>Οι παλιοί μου συμμαθητές.</b> Ο Φώτης, ένας Έλληνας φίλος σου, μιλάει μέσω Skype για '
     'τους παλιούς του συμμαθητές. Τι λέει;</p><p>Επίλεξε από τις παρακάτω λέξεις: <b>πιστός, αστείος, '
     'αθλητικός</b> ή <b>εργατικός</b>. Κάθε λέξη μπορεί να χρησιμοποιηθεί περισσότερες από μία φορά.</p>'
     '<p><i>Παράδειγμα: Από μικρός ο Χάρης ήταν πολύ αθλητικός.</i></p>'),
  Q('14', 'B', 1, '<p>Ο Παύλος ήταν δημοφιλής, επειδή ήταν %s</p>' % BLANK, part='a'),
  Q('14', 'B', 1, '<p>Ο Θόδωρος ήταν %s</p>' % BLANK, part='b'),
  Q('14', 'B', 1, '<p>Ο Δημήτρης στο σχολείο ήταν %s</p>' % BLANK, part='c'),
  Q('14', 'B', 1, '<p>Ο Γιώργος ήταν %s</p>' % BLANK, part='d'),
  Q('14', 'B', 1, '<p>Ο Κώστας ήταν πάντα %s</p>' % BLANK, part='e'),
]

# ---------------------------------------------------------------- Higher, November 2020
Hp = 'P-1GK0-2011-1H'
HDOC = dict(COMMON, paper_id=Hp, tier='Higher', spec_code='1GK0/1H', exam_wave='Second wave',
            year='2020', month='11', exam_date='',
            name='Paper 1: Listening — November 2020',
            source_url='https://drive.google.com/file/d/1RBEKxvJefCp-nhs8VhhiHR9oE2Mr4vkL/view')
HP = [
  P('1', 'A', '<p><b>Μια γιορτή.</b> Η Αγγέλα, μια Ελληνίδα φίλη σου, σου μιλάει μέσω Skype για μια γιορτή.</p>'
     '<p>Συμπλήρωσε τα κενά με μία λέξη ή φράση από τον πίνακα, όπως στο παράδειγμα. Οι λέξεις είναι '
     'περισσότερες από τα κενά.</p>' + box(['συγγενείς', 'ιδανικός', 'δέκα', 'το καθάρισμα', 'γενέθλια',
     'φίλοι', 'αρνί', 'το μαγείρεμα', 'βροχερός', 'την ονομαστική του γιορτή', 'δώδεκα', 'θαλασσινά'])
     + '<p><i>Παράδειγμα: Το Σάββατο ο πατέρας της Αγγέλας είχε την ονομαστική του γιορτή.</i></p>'),
  Q('1', 'A', 1, '<p>Πριν τη γιορτή η Αγγέλα βοήθησε με %s</p>' % BLANK, part='a'),
  Q('1', 'A', 1, '<p>Το κύριο πιάτο ήταν %s</p>' % BLANK, part='b'),
  Q('1', 'A', 1, '<p>Στο σπίτι τους πήγαν πολλοί %s</p>' % BLANK, part='c'),
  Q('1', 'A', 1, '<p>Ο καιρός ήταν %s</p>' % BLANK, part='d'),
  Q('1', 'A', 1, '<p>Η γιορτή κράτησε μέχρι τις %s</p>' % BLANK, part='e'),
  P('2', 'A', '<p><b>Τι επάγγελμα να διαλέξω;</b> Ο Θάνος, ένας Έλληνας φίλος σου, μιλάει μέσω Skype για '
     'την επιλογή επαγγέλματος. Τι λέει;</p><p>Επίλεξε από τις παρακάτω λέξεις: <b>δημοσιογράφος, μάγειρας, '
     'ηθοποιός</b> ή <b>πιλότος</b>. Κάθε λέξη μπορεί να χρησιμοποιηθεί περισσότερες από μία φορά.</p>'
     '<p><i>Παράδειγμα: Όταν ήταν μικρός, ο Θάνος ήθελε να γίνει ηθοποιός.</i></p>'),
  Q('2', 'A', 1, '<p>Ο πατέρας του είναι %s .</p>' % BLANK, part='a'),
  Q('2', 'A', 1, '<p>Οι γονείς του του πρότειναν να γίνει %s .</p>' % BLANK, part='b'),
  Q('2', 'A', 1, '<p>Ένας ξάδερφός του θα γίνει %s .</p>' % BLANK, part='c'),
  Q('2', 'A', 1, '<p>Ο Θάνος δούλεψε για δύο μήνες ως %s .</p>' % BLANK, part='d'),
  Q('2', 'A', 1, '<p>Τον χειμώνα θα δει πώς είναι να είσαι %s .</p>' % BLANK, part='e'),
  P('3', 'B', '<p><b>Pindos explorers.</b> Clio is talking about an activity she did at a summer camp. '
     'Listen to the recording and complete the sentences by putting a cross in the correct box for each '
     'question.</p><p><i>Example: The camp organised… a trip in the forest.</i></p>'),
  Q('3', 'B', 1, '<p>They learned about…</p>' + opts(['herbs and flowers', 'endangered species',
     'orienteering', 'local history']), part='i'),
  Q('3', 'B', 1, '<p>The water was…</p>' + opts(['contaminated', 'crystal clear', 'very cold', 'warm']), part='ii'),
  Q('3', 'B', 1, '<p>At night they slept…</p>' + opts(['outdoors', 'in a shelter', 'next to a lake',
     'on a campsite']), part='iii'),
  Q('3', 'B', 1, '<p>When they were making sleeping arrangements, they were…</p>' + opts(['miserable',
     'careless', 'sensible', 'tired']), part='iv'),
  Q('4', 'B', 3, '<p><b>A school visit.</b> During a Skype call, Martha tells you about a school visit. '
     'What does she say? %s</p><p><i>Example: They visited a boatyard.</i></p>%s' % (cross3, opts([
     'Their guide studied engineering.', 'Building a boat requires experience.',
     'The boatyard was established 60 years ago.', 'This boatyard is a family business.',
     'The wood is collected in autumn.', 'More craftsmen are needed.', 'Orders sometimes come from abroad.']))),
  P('5', 'B', '<p><b>We need your help!</b> While travelling in Greece you hear a radio announcement. What '
     'does it say? Listen to the radio announcement and put a cross in the correct box for each '
     'question.</p><p><i>Example: The council is urging residents to… save water.</i></p>'),
  Q('5', 'B', 1, '<p>Saving water…</p>' + opts(["is high on the government's agenda", 'also has financial benefits',
     'should be taught from a young age', 'helps the council to cut costs']), part='i'),
  Q('5', 'B', 1, '<p>Consumers are advised to…</p>' + opts(['use economy programmes', 'avoid overfilling the kettle',
     'fully load the dishwasher', 'turn off the tap when brushing teeth']), part='ii'),
  Q('5', 'B', 1, '<p>We can save water by…</p>' + opts(['collecting rainwater', 'watering plants in the evening',
     'using the hose pipe sensibly', 'installing a watering system']), part='iii'),
  P('6', 'B', '<p><b>Experience of flying.</b> You listen to a podcast during your Greek lesson. Natalia '
     'talks about her experience of flying. Listen to the podcast and answer the following questions in '
     'English.</p>'),
  Q('6', 'B', 1, '<p>What motivated Natalia to share her experience of flying?</p>', part='a'),
  Q('6', 'B', 1, '<p>What helped her forget her fear?</p>', part='b(i)'),
  Q('6', 'B', 1, '<p>Why?</p><p><i>(Why did that help her forget her fear?)</i></p>', part='b(ii)'),
  Q('6', 'B', 1, '<p>How did she overcome her fear during the flight?</p>', part='c(i)'),
  Q('6', 'B', 1, '<p>Why?</p><p><i>(Why did that help during the flight?)</i></p>', part='c(ii)'),
  P('7', 'B', '<p><b>A year abroad.</b> Marina, a Greek friend, talks to you via Skype about her plans for '
     'the following year. Listen to the recording and answer the following questions in English.</p>'),
  Q('7', 'B', 2, '<p>Why is Marina moving to Paris? Give two details.</p>', part='a', type='written'),
  Q('7', 'B', 1, '<p>Summarise her feelings about moving abroad.</p>', part='b'),
  Q('7', 'B', 1, '<p>How is she going to cover her day-to-day expenses?</p>', part='c'),
  Q('7', 'B', 1, '<p>Why was it easy to find part-time work in Paris?</p>', part='d'),
  P('8', 'B', '<p><b>Exams.</b> You are in Greece and you hear a programme on the radio. Listen to the radio '
     'programme and put a cross in the correct box for each question.</p>'
     '<p><i>Example: The programme aims to provide… last minute exam tips.</i></p>'),
  Q('8', 'B', 1, '<p>According to Mr Economou, students should…</p>' + opts(['revise for long hours',
     'sleep well', 'remain calm', 'be confident']), part='a(i)'),
  Q('8', 'B', 1, '<p>During revision students are advised to…</p>' + opts(['use flashcards', 'meditate',
     'take short breaks', 'listen to calm music']), part='a(ii)'),
  Q('8', 'B', 1, '<p>It is also important for students to…</p>' + opts(['make good notes',
     'find time for themselves', 'test their knowledge', 'study with friends']), part='a(iii)'),
  Q('8', 'B', 1, '<p>Research has shown that while revising it is beneficial to…</p>' + opts([
     'watch tutorial videos', 'type up ideas', 'research online', 'write notes on paper']), part='b(i)'),
  Q('8', 'B', 1, '<p>A new idea is to…</p>' + opts(['do yoga before exams', 'take a nap at lunchtime',
     'change the place you study frequently', 'use aromatherapy']), part='b(ii)'),
  Q('8', 'B', 1, '<p>During exams students are advised to…</p>' + opts(['drink plenty of water',
     'follow a healthy diet', 'feel self-confident', 'stay focused on the next exam']), part='b(iii)'),
  P('9', 'B', '<p><b>An interview with a musician.</b> While visiting Greece you hear this interview with '
     'Kostis on the radio. Listen to the interview and answer the following questions in English.</p>'),
  Q('9', 'B', 2, '<p>What does Kostis feel about his hometown? Give two details.</p>', part='a(i)', type='written'),
  Q('9', 'B', 1, '<p>Why did he go to Italy?</p>', part='a(ii)'),
  Q('9', 'B', 2, '<p>How did his experience in Italy shape his present career? Give two details.</p>',
     part='a(iii)', type='written'),
  Q('9', 'B', 2, '<p><i>The interview continues.</i></p><p>What were the main characteristics of his job '
     'when he returned to Greece? Give two details.</p>', part='b(i)', type='written'),
  Q('9', 'B', 2, '<p>Who advised him to make a career change and why?</p>', part='b(ii)', type='written'),
  Q('9', 'B', 1, '<p>How has this musician shown his artistic skills in other areas?</p>', part='b(iii)'),
  P('10', 'B', '<p><b>Foster care scheme.</b> You are listening to a radio announcement about a foster care '
     'scheme. Put a cross in each of the two correct boxes for each question.</p>'),
  Q('10', 'B', 2, '<p>What does it say about the scheme?</p><p><i>Example: It is a scheme for unaccompanied '
     'minors.</i></p>' + opts(['The idea for this programme was conceived in Greece.',
     'There are similar successful schemes in other countries.',
     'The organisation “Metadrasi” is funded by the government.',
     'The scheme provides psychological support.', 'The scheme has helped eight hundred children.']), part='i'),
  Q('10', 'B', 2, '<p>What do the applicants need to know before they apply?</p>' + opts([
     'Only families with children can apply.', 'Applicants can apply online.',
     'Applicants should live in Athens or Thessaloniki.', 'The foster family would have to cover all costs.',
     'The foster children will stay with the family for less than a year.']), part='ii'),
]

new = paper(F, FDOC, FP) + paper(Hp, HDOC, HP)
lines = TARGET.read_text().split('\n')
assert lines[0] == '['
body = [l.rstrip(',') for l in lines[1:] if l.strip() not in (']', '')]
keep = [l for l in body if not json.loads(l).get('paper_id', '').startswith(PREFIX)]
ids = {json.loads(l)['row_id'] for l in keep}
assert not ids & {r['row_id'] for r in new}, 'a Greek row_id collides with the library'
out = keep + [json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in new]
TARGET.write_text('[\n' + ',\n'.join(out) + '\n]\n')
print('wrote %d Greek rows (%d questions) across 2 papers' % (len(new), sum(r['kind'] == 'question' for r in new)))
