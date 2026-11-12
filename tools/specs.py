#!/usr/bin/env python3
"""Writes data/spec/<board>-<code>.json, one file per exam specification, from the boards' public PDFs.

Usage: python3 -I tools/specs.py <dir of PDFs named <id>.pdf>   (fetch them from each SPECS url first)
Each file: board, qualification, level, subject, code, url (the official PDF), sections and points
(id, short official wording, parent). Wording is cut short; the PDF linked is the full text.
Then writes data/specs.json, the index Find reads (one row per spec, the points inline).
Points link to lessons/questions only through a coverage mapping (data/spec-map/*.json) when one exists.
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'spec')
AQA = 'https://filestore.aqa.org.uk/resources/'
PE = 'https://qualifications.pearson.com/content/dam/pdf/'
OCR = 'https://www.ocr.org.uk/Images/'
GOV = 'https://assets.publishing.service.gov.uk/media/'

# id, board, qualification, level, subject, code, url, mode, options
SPECS = [
    ('aqa-8461', 'AQA', 'GCSE', 'GCSE', 'Biology', '8461', AQA + 'biology/specifications/AQA-8461-SP-2016.PDF', 'num', {}),
    ('aqa-8462', 'AQA', 'GCSE', 'GCSE', 'Chemistry', '8462', AQA + 'chemistry/specifications/AQA-8462-SP-2016.PDF', 'num', {}),
    ('aqa-8463', 'AQA', 'GCSE', 'GCSE', 'Physics', '8463', AQA + 'physics/specifications/AQA-8463-SP-2016.PDF', 'num', {}),
    ('aqa-8464', 'AQA', 'GCSE', 'GCSE', 'Combined Science', '8464', AQA + 'science/specifications/AQA-8464-SP-2016.PDF', 'num', {'tops': ['4', '5', '6']}),
    ('aqa-8700', 'AQA', 'GCSE', 'GCSE', 'English Language', '8700', AQA + 'english/specifications/AQA-8700-SP-2015.PDF', 'num', {'tops': ['3']}),
    ('aqa-8702', 'AQA', 'GCSE', 'GCSE', 'English Literature', '8702', AQA + 'english/specifications/AQA-8702-SP-2015.PDF', 'num', {'tops': ['3']}),
    ('aqa-8145', 'AQA', 'GCSE', 'GCSE', 'History', '8145', AQA + 'history/specifications/AQA-8145-SP-2016.PDF', 'num', {'tops': ['3']}),
    ('aqa-8035', 'AQA', 'GCSE', 'GCSE', 'Geography', '8035', AQA + 'geography/specifications/AQA-8035-SP-2016.PDF', 'num', {}),
    ('aqa-8062', 'AQA', 'GCSE', 'GCSE', 'Religious Studies', '8062', AQA + 'rs/specifications/AQA-8062-SP-2016.PDF', 'num', {}),
    ('aqa-8132', 'AQA', 'GCSE', 'GCSE', 'Business', '8132', AQA + 'business/specifications/AQA-8132-SP-2017.PDF', 'num', {}),
    ('aqa-8182', 'AQA', 'GCSE', 'GCSE', 'Psychology', '8182', AQA + 'psychology/specifications/AQA-8182-SP-2017.PDF', 'num', {}),
    ('aqa-8192', 'AQA', 'GCSE', 'GCSE', 'Sociology', '8192', AQA + 'sociology/specifications/AQA-8192-SP-2017.PDF', 'num', {}),
    ('aqa-8582', 'AQA', 'GCSE', 'GCSE', 'Physical Education', '8582', AQA + 'pe/specifications/AQA-8582-SP-2016.PDF', 'num', {}),
    ('aqa-8382', 'AQA', 'GCSE', 'GCSE', 'Statistics', '8382', AQA + 'mathematics/specifications/AQA-8382-SP-2017.PDF', 'num', {}),
    ('aqa-7402', 'AQA', 'A-level', 'A-Level', 'Biology', '7402', AQA + 'biology/specifications/AQA-7401-7402-SP-2015.PDF', 'num', {}),
    ('aqa-7405', 'AQA', 'A-level', 'A-Level', 'Chemistry', '7405', AQA + 'chemistry/specifications/AQA-7404-7405-SP-2015.PDF', 'num', {}),
    ('aqa-7408', 'AQA', 'A-level', 'A-Level', 'Physics', '7408', AQA + 'physics/specifications/AQA-7407-7408-SP-2015.PDF', 'num', {}),
    ('aqa-7357', 'AQA', 'A-level', 'A-Level', 'Maths', '7357', AQA + 'mathematics/specifications/AQA-7357-SP-2017.PDF', 'num',
     {'cell': r'([A-S]\d{1,2})', 'cell_parent': 'letter'}),
    ('aqa-7182', 'AQA', 'A-level', 'A-Level', 'Psychology', '7182', AQA + 'psychology/specifications/AQA-7181-7182-SP-2015.PDF', 'num', {'tops': ['4']}),
    ('aqa-7192', 'AQA', 'A-level', 'A-Level', 'Sociology', '7192', AQA + 'sociology/specifications/AQA-7191-7192-SP-2015.PDF', 'num', {'tops': ['4']}),
    ('aqa-7037', 'AQA', 'A-level', 'A-Level', 'Geography', '7037', AQA + 'geography/specifications/AQA-7037-SP-2016.PDF', 'num', {}),
    ('aqa-7042', 'AQA', 'A-level', 'A-Level', 'History', '7042', AQA + 'history/specifications/AQA-7041-7042-SP-2015.PDF', 'raw',
     {'pt': r'^([12][A-T]) ([A-Z].+)$', 'pt_parent': 'first', 'fixed': {'1': 'Component 1: Breadth study', '2': 'Component 2: Depth study'}}),
    ('aqa-7132', 'AQA', 'A-level', 'A-Level', 'Business', '7132', AQA + 'business/specifications/AQA-7131-7132-SP-2015.PDF', 'num', {}),
    ('aqa-7136', 'AQA', 'A-level', 'A-Level', 'Economics', '7136', AQA + 'economics/specifications/AQA-7135-7136-SP-2015.PDF', 'num', {'tops': ['4']}),
    ('aqa-7152', 'AQA', 'A-level', 'A-Level', 'Politics', '7152', AQA + 'politics/specifications/AQA-7152-SP-2017.PDF', 'num', {}),
    ('aqa-7062', 'AQA', 'A-level', 'A-Level', 'Religious Studies', '7062', AQA + 'rs/specifications/AQA-7062-SP-2016.PDF', 'num', {'tops': ['3']}),
    ('aqa-7172', 'AQA', 'A-level', 'A-Level', 'Philosophy', '7172', AQA + 'philosophy/specifications/AQA-7172-SP-2017.PDF', 'num', {}),
    ('edexcel-1ma1', 'Edexcel', 'GCSE', 'GCSE', 'Maths', '1MA1',
     PE + 'GCSE/mathematics/2015/specification-and-sample-assesment/gcse-maths-2015-specification.pdf', 'cell',
     {'cell': r'([NARGPS]\d{1,2}[a-z]?)', 'prefer': 'last', 'cell_parent': 'map',
      'sections': {'N': 'Number', 'A': 'Algebra', 'R': 'Ratio, proportion and rates of change', 'G': 'Geometry and measures',
                   'P': 'Probability', 'S': 'Statistics'}}),
    ('edexcel-9ma0', 'Edexcel', 'A-level', 'A-Level', 'Maths', '9MA0',
     PE + 'A%20Level/Mathematics/2017/specification-and-sample-assesment/a-level-l3-mathematics-specification-issue4.pdf', 'table',
     {'fixed': {'2': 'Algebra and functions', 'S2': 'Data presentation and interpretation', 'M9': 'Moments'}}),
    ('edexcel-8ma0', 'Edexcel', 'AS', 'AS', 'Maths', '8MA0',
     PE + 'A%20Level/Mathematics/2017/specification-and-sample-assesment/as-l3-mathematics-specification.pdf', 'table',
     {'fixed': {'2': 'Algebra and functions', 'S2': 'Data presentation and interpretation'}}),
    ('edexcel-1sc0', 'Edexcel', 'GCSE', 'GCSE', 'Combined Science', '1SC0',
     PE + 'GCSE/Science/2016/Specification/gcse-combinedscience-spec.pdf', 'cell',
     {'cell': r'(\d{1,2}\.\d{1,2})', 'lead': r'^\s{0,3}', 'cell_parent': 'topic', 'upper': True, 'topic_re': r'^\s*Topic (\d{1,2}) [–-] (.+?)\s*$'}),
    ('edexcel-1gk0', 'Edexcel', 'GCSE', 'GCSE', 'Greek', '1GK0',
     PE + 'GCSE/Greek/2017/specification-and-sample-assessments/specification-gcse2017-l12-greek-issue5.pdf', 'raw',
     {'sec': r'^Theme (\d): (.+)$'}),
    ('ocr-h240', 'OCR', 'A-level', 'A-Level', 'Maths', 'H240', OCR + '308723-specification-accredited-a-level-gce-mathematics-a-h240.pdf', 'raw',
     {'pt': r'^([123]\.\d\d) ([A-Z].+)$', 'pt_parent': 'first', 'fixed': {'1': 'Pure mathematics', '2': 'Statistics', '3': 'Mechanics'}}),
    ('ocr-h420', 'OCR', 'A-level', 'A-Level', 'Biology', 'H420', OCR + '687834-download-a-level-specification.pdf', 'raw',
     {'sec': r'^Module (\d) [–-] (.+)$', 'pt': r'^(\d\.\d\.\d) ([A-Z].+)$', 'pt_parent': 'first'}),
    ('ocr-h432', 'OCR', 'A-level', 'A-Level', 'Chemistry', 'H432', OCR + '171720-specification-accredited-a-level-gce-chemistry-a-h432.pdf', 'raw',
     {'sec': r'^Module (\d) [–-] (.+)$', 'pt': r'^(\d\.\d\.\d) ([A-Z].+)$', 'pt_parent': 'first'}),
    ('ocr-h556', 'OCR', 'A-level', 'A-Level', 'Physics', 'H556', OCR + '171726-specification-accredited-a-level-gce-physics-a-h556.pdf', 'raw',
     {'sec': r'^Module (\d) [–-] (.+)$', 'pt': r'^(\d\.\d\.\d) ([A-Z].+)$', 'pt_parent': 'first'}),
    ('ocr-j247', 'OCR', 'GCSE', 'GCSE', 'Biology', 'J247', OCR + '234594-specification-accredited-gcse-gateway-science-suite-biology-a-j247.pdf', 'raw',
     {'sec': r'^Topic (B\d): (.+)$', 'pt': r'^(B\d\.\d) ([A-Z].+)$', 'pt_parent': 'dot'}),
    ('ocr-j248', 'OCR', 'GCSE', 'GCSE', 'Chemistry', 'J248', OCR + '234598-specification-accredited-gcse-gateway-science-suite-chemistry-a-j248.pdf', 'raw',
     {'sec': r'^Topic (C\d): (.+)$', 'pt': r'^(C\d\.\d) ([A-Z].+)$', 'pt_parent': 'dot'}),
    ('ocr-j249', 'OCR', 'GCSE', 'GCSE', 'Physics', 'J249', OCR + '234600-specification-accredited-gcse-gateway-science-suite-physics-a-j249.pdf', 'raw',
     {'sec': r'^Topic (P\d): (.+)$', 'pt': r'^(P\d\.\d) ([A-Z].+)$', 'pt_parent': 'dot'}),
    ('ocr-j352', 'OCR', 'GCSE', 'GCSE', 'English Literature', 'J352', OCR + '168995-specification-accredited-gcse-english-literature-j352.pdf', 'contents',
     {}),
    ('ocr-h472', 'OCR', 'A-level', 'A-Level', 'English Literature', 'H472', OCR + '171200-specification-accredited-a-level-gce-english-literature-h472.pdf', 'contents',
     {}),
    ('ocr-h573', 'OCR', 'A-level', 'A-Level', 'Religious Studies', 'H573', OCR + '242913-specification-accredited-a-level-gce-religious-studies-h573.pdf', 'contents',
     {}),
    ('ocr-h567', 'OCR', 'A-level', 'A-Level', 'Psychology', 'H567', OCR + '171732-specification-accredited-a-level-gce-psychology-h567.pdf', 'contents',
     {}),
    ('ocr-j203', 'OCR', 'GCSE', 'GCSE', 'Psychology', 'J203', OCR + '309306-specification-accredited-gcse-psychology-j203.pdf', 'contents',
     {}),
    ('ocr-h481', 'OCR', 'A-level', 'A-Level', 'Geography', 'H481', OCR + '223012-specification-accredited-a-level-gce-geography-h481.pdf', 'contents',
     {}),
    ('sta-ks2-maths', 'Standards & Testing Agency', 'KS2 SATs', 'KS2', 'Maths', 'KS2 maths',
     GOV + '5a822bbded915d74e62362a2/2016_KS2_Mathematics_framework_PDFA_V5.pdf', 'cell',
     {'cell': r'([3-6](?:N|C|F|R|A|M|G|P|S)\d{1,2}[a-z]?)', 'lead': r'(?:^|\s{2,})', 'cell_parent': 'map', 'strip_year': True,
      'sections': {'N': 'Number and place value', 'C': 'Calculations', 'F': 'Fractions, decimals and percentages',
                   'R': 'Ratio and proportion', 'A': 'Algebra', 'M': 'Measurement', 'G': 'Geometry', 'P': 'Geometry: position and direction',
                   'S': 'Statistics'}}),
    ('sta-ks2-reading', 'Standards & Testing Agency', 'KS2 SATs', 'KS2', 'English Language', 'KS2 reading',
     GOV + '5a82454eed915d74e3402a2a/2016_KS2_Englishreading_framework_PDFA_V3.pdf', 'cell',
     {'cell': r'(2[a-h])', 'lead': r'^\s{0,6}', 'cell_parent': 'one', 'one': 'Content domain'}),
    ('sta-ks2-gps', 'Standards & Testing Agency', 'KS2 SATs', 'KS2', 'English Language', 'KS2 grammar, punctuation and spelling',
     GOV + '5a82cc1ded915d74e34039f1/2016_KS2_EnglishGPS_framework_PDFA_V9.pdf', 'raw',
     {'sec': r'^(G\d+): (.+)$', 'pt': r'^(G\d+\.\d+[a-z]?): (.+?)(?:TS|T|S)?$', 'pt_parent': 'dot'}),
]
NUM_H = re.compile(r'^ {0,3}(\d{1,2}(?:\.\d{1,2}){1,3})\.?\s{1,12}([A-Z(][^.]{2,110}?)\s*(?:\.{3,}.*|\s{3,}\d+)?$')
NUM_TOP = re.compile(r'^\s{0,4}(\d{1,2})\s{1,8}([A-Z][A-Za-z ,’\'&()-]{3,80}?)\s{2,}\d+\s*$')
MAX = 140


def short(t):
    t = re.sub(r'\s+', ' ', t).strip().rstrip(';,:')
    if len(t) <= MAX:
        return t
    return t[:MAX].rsplit(' ', 1)[0].rstrip(';,:') + '…'


def text(pdf, layout):
    args = ['pdftotext'] + (['-layout'] if layout else []) + [pdf, '-']
    return subprocess.run(args, capture_output=True, text=True, check=True).stdout.split('\n')


def cell_at(lines, i, start, stop_re, row_re=None):
    """The words of one table cell: from column `start` on line i, down its own column (a column or two of slack) to the next row."""
    first = lambda l, c: re.split(r'\s{3,}', l[c:].strip())[0]
    out = [first(lines[i], start)]
    for l in lines[i + 1:i + 14]:
        if not l.strip() or (row_re and row_re.search(l[:start + 2])):
            break
        c = next((c for c in range(max(0, start - 2), start + 3) if c < len(l) and l[c] != ' ' and (c == 0 or l[c - 1] == ' ')), None)
        if c is None:
            if l[:start].strip():
                continue
            break
        if stop_re.match(l[c:]):
            break
        out.append(first(l, c))
    return ' '.join(out)


def cells(lines, o, sections, points):
    rx = re.compile(o.get('lead', r'^\s{0,3}') + o['cell'] + r'\s{1,}(?=\S)')
    stop = re.compile(o['cell'] + r'\s{2,}')
    row_re = re.compile(o.get('lead', r'^\s{0,3}') + o['cell'] + r'\s')
    topic_re = re.compile(o['topic_re']) if o.get('topic_re') else None
    topic = ''
    found = {}
    for i, l in enumerate(lines):
        if topic_re:
            m = topic_re.match(l)
            if m and 'Topic' not in m.group(2):
                topic = 'T' + m.group(1)
                sections.setdefault(topic, short(m.group(2)))
        for m in rx.finditer(l):
            pid = m.group(1)
            words = cell_at(lines, i, m.end(), stop, row_re)
            if len(words) < 6 or (o.get('upper') and not words[:1].isupper()) or (topic_re and not topic):
                continue
            if pid in found and o.get('prefer') != 'last':
                continue
            found[pid] = (words, topic)
    for pid, (words, topic) in found.items():
        cp = o.get('cell_parent')
        if cp == 'map':
            letter = re.sub(r'^\d', '', pid)[0]
            par = letter
            sections.setdefault(par, o['sections'][letter])
        elif cp == 'letter':
            par = next((k for k, v in sections.items() if v.startswith(pid[0] + ':')), '')
        elif cp == 'topic':
            par = topic
        else:
            par = 'D'
            sections.setdefault('D', o.get('one', 'Content'))
        points.append({'id': pid, 'text': short(words), 'parent': par})


def num(lines, o, sections, points):
    seen, early = {}, {}
    tops = {}
    for i, l in enumerate(lines):
        m = NUM_H.match(l) or re.match(r'^\s{0,6}(\d{1,2}\.\d{1,2})\s{1,8}(.+?)\s{3,}\d+\s*$', l)
        if m:
            early.setdefault(m.group(1), m.group(2).strip())
        m = NUM_TOP.match(l)
        if m and i < 400:
            tops.setdefault(m.group(1), m.group(2).strip())
        m = NUM_H.match(l)
        if m and i > 120 and m.group(1) not in seen:
            seen[m.group(1)] = m.group(2).strip()
    count = {}
    for k in seen:
        count[k.split('.')[0]] = count.get(k.split('.')[0], 0) + 1
    want = o.get('tops') or [max(count, key=count.get)] if count else []
    for k, t in seen.items():
        parts = k.split('.')
        if parts[0] not in want:
            continue
        if len(parts) == 2:
            sections[k] = short(t)
        else:
            par = '.'.join(parts[:-1])
            while par not in seen and par.count('.') > 1:
                par = '.'.join(par.split('.')[:-1])
            points.append({'id': k, 'text': short(t), 'parent': par})
    for p in points:
        top2 = '.'.join(p['id'].split('.')[:2])
        if top2 not in sections and top2 in early:
            sections[top2] = short(early[top2])
        if p['parent'] not in sections and not any(q['id'] == p['parent'] for q in points):
            p['parent'] = top2 if top2 in sections else ''
    order = lambda k: [int(x) if x.isdigit() else 0 for x in k.split('.')]
    for k in sorted(sections, key=order):
        sections[k] = sections.pop(k)


def table(lines, o, sections, points):
    """Edexcel A-level maths: topic number and name in the first column, points `n.m` beside them."""
    rx = re.compile(r'^(\s{0,3}(\d{1,2}))?\s{2,}(\d{1,2}\.\d{1,2})\s{2,}(?=[A-Z])')
    stop = re.compile(r'^\s*(\d{1,2}\s+)?\d{1,2}\.\d{1,2}\s{2,}')
    part, seen_first = '', 0
    sections.update(o.get('fixed') or {})
    for i, l in enumerate(lines):
        m = rx.match(l)
        if not m:
            continue
        pid = m.group(3)
        if pid == '1.1':
            seen_first += 1
            part = '' if seen_first == 1 else 'S'
        topic = pid.split('.')[0]
        pre = part if not part or int(topic) <= 5 else 'M'
        sec = pre + topic
        if seen_first > 2:
            break
        if m.group(2):
            name = [l2.split('   ')[0].strip() for l2 in lines[i + 1:i + 8] if l2[:1].strip() and not re.match(r'^\d', l2)]
            if name:
                sections.setdefault(sec, short(' '.join(name[:4])))
        words = cell_at(lines, i, m.end(), stop, stop)
        if sec not in sections:
            sections[sec] = 'Topic ' + topic
        if len(words) >= 12 and words[:1].isupper() and not any(p['id'] == pre + pid for p in points):
            points.append({'id': pre + pid, 'text': short(words), 'parent': sec})
    for k in [k for k in sections if not any(p['parent'] == k for p in points)]:
        sections.pop(k)


def raw(lines, o, sections, points):
    sec = re.compile(o['sec']) if o.get('sec') else None
    pt = re.compile(o['pt']) if o.get('pt') else None
    for k, v in (o.get('fixed') or {}).items():
        sections[k] = v
    seen = set()
    for l in lines:
        l = re.sub(r'[\x00-\x1f]', ' ', l).strip()
        l = re.sub(r'\s+', ' ', l)
        m = sec.match(l) if sec else None
        if m and len(m.group(2).strip()) > 3 and m.group(1) not in sections:
            sections[m.group(1)] = short(m.group(2))
            continue
        m = pt.match(l) if pt else None
        if m and m.group(1) not in seen and len(m.group(2)) > 3:
            pid = m.group(1)
            seen.add(pid)
            par = pid.split('.')[0] if o.get('pt_parent') == 'dot' else pid[0]
            points.append({'id': pid, 'text': short(m.group(2)), 'parent': par})


def coverage(sid):
    """The site's lessons/questions per spec point, if a coverage branch has written a mapping for this spec."""
    for name in (sid + '.json',):
        p = os.path.join(ROOT, 'data', 'spec-map', name)
        if os.path.exists(p):
            try:
                return json.load(open(p))
            except ValueError:
                return {}
    return {}


def build(pdfdir):
    os.makedirs(OUT, exist_ok=True)
    index = []
    for sid, board, qual, level, subject, code, url, mode, o in SPECS:
        pdf = os.path.join(pdfdir, sid + '.pdf')
        if not os.path.exists(pdf):
            print('  skip ' + sid + ' (no PDF)')
            continue
        lines = text(pdf, mode != 'raw')
        lines = [re.sub(r'\b([B-HJ-Z]) ([a-z]{2,})', r'\1\2', l) for l in lines]
        sections, points = {}, []
        if mode == 'num':
            num(lines, o, sections, points)
            if o.get('cell'):
                cells(lines, o, sections, points)
        elif mode == 'cell':
            cells(lines, o, sections, points)
        elif mode == 'table':
            table(lines, o, sections, points)
        elif mode == 'contents':
            for m in (re.match(r'^\s+2[a-z]\.\s+Content of (.+?)\s{2,}\d+\s*$', l) for l in lines[:400]):
                if m and not re.search(r'(A Level|GCSE|AS Level) in', m.group(1)):
                    sections['C%d' % (len(sections) + 1)] = short(m.group(1))
        else:
            raw(lines, o, sections, points)
        cover = coverage(sid)
        for p in points:
            p['links'] = cover.get(p['id'], [])
        first = {}
        for n, p in enumerate(points):
            top = p['parent']
            while top not in sections and any(q['id'] == top for q in points):
                top = next(q['parent'] for q in points if q['id'] == top)
            first.setdefault(top, n)
        keys = list(sections)
        pos = {k: i for i, k in enumerate(keys)}
        keys.sort(key=lambda k: first.get(k, len(points) + pos[k]))
        sec_list = [{'id': k, 'title': sections[k]} for k in keys]
        row = {'id': sid, 'board': board, 'qualification': qual, 'level': level, 'subject': subject, 'code': code,
               'url': url, 'sections': sec_list, 'points': points}
        with open(os.path.join(OUT, sid + '.json'), 'w') as f:
            json.dump(row, f, indent=1, ensure_ascii=False)
            f.write('\n')
        index.append(row)
        print('  %-16s %3d sections %4d points' % (sid, len(sec_list), len(points)))
    with open(os.path.join(ROOT, 'data', 'specs.json'), 'w') as f:
        json.dump(index, f, separators=(',', ':'), ensure_ascii=False)
        f.write('\n')


if __name__ == '__main__':
    build(sys.argv[1] if len(sys.argv) > 1 else '.')
