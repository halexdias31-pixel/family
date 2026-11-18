"""Queue item 3 (owner-queue, 18 Nov): the questions that name a Figure the site did not have, each figure redrawn
from its own paper's vectors by tools/pdf-figure.py and written as the row's `diagram`.

WHERE THE FIGURES CAME FROM: each paper's own question paper, the PDF at the `source_url` on its document card
(D-<paper id>), downloaded into a scratch folder and passed as --pdfs. The box of each figure was found from its
caption ("Fig. 18.1") by pdf-figure.region() and every drawing was looked at against the printed page at phone width;
the boxes below are the ones that were checked, frozen so a re-run draws the same figure.

WHAT IS NOT HERE, ON PURPOSE: a figure the paper prints as a photograph or raster (a micrograph, a gel, AQA's 2022-23
scanned graphs), a figure in a separate resource booklet (OCR geography), and a figure whose shading is a clipped
hatch pattern that does not survive as paths. Those rows keep their reason in validate-questions.

    node tools/content.js library join
    python3 tools/draw-figures-q3.py --pdfs <folder of P-*.pdf>
    node tools/content.js library split
"""
import argparse, html as _html, json, pathlib, re, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import importlib.util
_spec = importlib.util.spec_from_file_location('pdf_figure', pathlib.Path(__file__).parent / 'pdf-figure.py')
PF = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(PF)
import pymupdf

FILE = pathlib.Path(__file__).resolve().parent.parent / 'data/questions.json'

# (paper, caption, page 1-based, box in PDF points x0 y0 x1 y1, outlines only)
FIGS = [
    ('P-OCR-H420-1706-02', 'Fig. 18', 17, (48, 184.8, 546.3, 560.8), False),
    ('P-OCR-H420-1706-02', 'Fig. 19.2', 21, (174.5, 159.4, 420.7, 384.1), False),
    ('P-OCR-H420-1706-02', 'Fig. 19.3', 22, (146.1, 182, 438.6, 580), False),
    ('P-OCR-H420-1706-02', 'Fig. 21', 28, (101.3, 92.6, 500, 488.2), False),
    ('P-OCR-H420-1806-01', 'Fig. 16.1', 13, (110.4, 147.3, 485, 406.5), False),
    ('P-OCR-H420-1806-01', 'Fig. 17.1', 15, (151.3, 85.1, 431.1, 313.6), False),
    ('P-OCR-H420-1806-01', 'Fig. 17.2', 16, (74.6, 91.4, 520.8, 268.5), False),
    ('P-OCR-H420-1806-01', 'Fig. 19.2', 22, (82.7, 129, 510.7, 293), False),
    ('P-OCR-H420-1806-02', 'Fig. 17', 12, (34.5, 128.6, 557.2, 326.2), False),
    ('P-OCR-H420-1806-02', 'Fig. 20.1', 22, (27.8, 161.8, 562.9, 467.4), False),
    ('P-OCR-H420-1906-01', 'Fig. 16', 10, (110.7, 138.8, 484.6, 370.1), False),
    ('P-OCR-H420-1906-01', 'Fig. 19.2', 22, (34.3, 194.2, 558.8, 442.6), False),
    ('P-OCR-H420-1906-01', 'Fig. 20.1', 24, (75.5, 125.8, 383.7, 391.2), False),
    ('P-OCR-H420-1906-01', 'Fig. 21.1', 28, (72.3, 86.8, 369.6, 215.2), False),
    ('P-OCR-H420-1906-01', 'Fig. 21.2', 29, (117.9, 179.7, 531.6, 485.4), False),
    ('P-OCR-H420-1906-01', 'Fig. 22.1', 31, (47.8, 127.9, 547.5, 499.4), False),
    ('P-OCR-H420-1906-01', 'Fig. 22.2', 33, (87.9, 86.8, 507.3, 361.3), False),
    ('P-OCR-H420-2011-01', 'Fig. 16.1', 12, (80.3, 140.9, 514.5, 351.2), False),
    ('P-OCR-H420-2011-01', 'Fig. 17.2', 18, (99.9, 229.8, 495.6, 440.8), False),
    ('P-OCR-H420-2111-01', 'Fig. 16.1', 13, (83.5, 141.9, 375.8, 379.6), False),
    ('P-OCR-H420-2111-01', 'Fig. 16.2', 14, (95.7, 88.9, 363.5, 307.1), False),
    ('P-OCR-H420-2111-01', 'Fig. 18.2', 20, (97.5, 101.4, 496.7, 343.9), False),
    ('P-OCR-H420-2111-02', 'Fig. 20.2', 24, (98.2, 116.6, 434.8, 331.7), False),
    ('P-OCR-H420-2206-02', 'Fig. 16.2', 10, (95, 140.7, 526.8, 202.1), False),
    ('P-OCR-H420-2206-02', 'Fig. 16.3', 10, (95, 252, 526.8, 544.7), False),
    ('P-OCR-H420-2206-03', 'Fig. 1.1', 2, (72.3, 138.4, 543.1, 468.2), False),
    ('P-OCR-H420-2206-03', 'Fig. 1.2', 3, (95, 114.7, 410.8, 336.7), False),
    ('P-OCR-H420-2206-03', 'Fig. 4.2', 17, (117.6, 86.4, 353.5, 275.3), False),
    ('P-OCR-H420-2306-01', 'Fig. 16.1', 12, (95, 203.8, 498.8, 733), False),
    ('P-OCR-H420-2306-01', 'Fig. 16.2', 14, (102.8, 112.8, 545.2, 323.7), False),
    ('P-OCR-H420-2306-01', 'Fig. 16.3', 16, (66.3, 161.8, 529, 481.7), False),
    ('P-OCR-H420-2306-01', 'Fig. 19.1', 26, (106.3, 347.9, 545, 615), False),
    ('P-OCR-H420-2306-01', 'Fig. 19.3', 28, (95, 112.7, 425.9, 366.9), False),
    ('P-OCR-H420-2306-02', 'Fig. 17.2', 18, (55.8, 112.7, 537.9, 331.2), False),
    ('P-OCR-H420-2306-02', 'Fig. 18.1', 19, (72.5, 141.2, 406, 253.4), False),
    ('P-OCR-H420-2306-02', 'Fig. 18.2', 20, (72.3, 153.4, 246.1, 356.8), False),
    ('P-OCR-H420-2306-02', 'Fig. 19.2', 24, (117.6, 283.4, 284, 405.9), False),
    ('P-OCR-H420-2306-03', 'Fig. 1.2', 4, (95, 164.4, 454.8, 378.3), False),
    ('P-OCR-H420-2306-03', 'Fig. 2.1', 5, (117.6, 296.9, 351.7, 563.8), False),
    ('P-OCR-H420-2306-03', 'Fig. 2.2', 6, (95, 112.8, 203.1, 243.1), False),
    ('P-OCR-H420-2306-03', 'Fig. 2.4', 8, (117.6, 216.8, 463.2, 506.4), False),
    ('P-OCR-H420-2306-03', 'Fig. 4.4', 15, (117.6, 149.8, 541.8, 338), False),
    ('P-OCR-H556-1806-03', 'Fig. 1.1', 2, (185.8, 246.6, 384.2, 451.6), False),
    ('P-OCR-H556-1806-03', 'Fig. 3.2', 9, (248.9, 372.9, 346.4, 464.3), False),
    ('P-OCR-H556-1806-03', 'Fig. 4.2', 11, (86, 97.4, 497.8, 492.5), False),
    ('P-OCR-H556-1806-03', 'Fig. 5.1', 13, (70.1, 101.4, 528.1, 292.2), False),
    ('P-OCR-H556-1806-03', 'Fig. 5.3', 13, (127.8, 540.6, 468.3, 719.5), False),
    ('P-OCR-H556-1806-03', 'Fig. 5.4', 14, (211.6, 337.6, 388.4, 456.8), False),
    ('P-OCR-H556-1806-03', 'Fig. 6.2', 16, (132.8, 363.6, 462.5, 468.4), False),
    ('P-OCR-H556-1906-01', 'Fig. 16.2', 10, (95.9, 385.9, 494.5, 566.8), False),
    ('P-OCR-H556-1906-01', 'Fig. 18.1', 14, (74.3, 153.4, 256.3, 330.4), False),
    ('P-OCR-H556-1906-01', 'Fig. 18.3', 16, (148.7, 370.6, 446.9, 576.1), False),
    ('P-OCR-H556-1906-01', 'Fig. 20.1', 20, (151.3, 142.6, 440.1, 463.3), False),
    ('P-OCR-H556-1906-01', 'Fig. 20.2', 21, (174.6, 346.2, 414.5, 522.5), False),
    ('P-OCR-H556-1906-01', 'Fig. 21', 22, (166.5, 140.4, 423.6, 383), False),
    ('P-OCR-H556-1906-01', 'Fig. 22.1', 24, (95.6, 142.6, 390, 259.2), False),
    ('P-OCR-H556-1906-01', 'Fig. 22.2', 25, (96.7, 103.6, 350.6, 338.3), False),
    ('P-OCR-H556-1906-02', 'Fig. 16.1', 10, (96.9, 194.6, 440, 285.4), False),
    ('P-OCR-H556-1906-02', 'Fig. 17.1', 14, (144.1, 101.4, 451.4, 191.5), False),
    ('P-OCR-H556-1906-02', 'Fig. 17.2', 14, (226, 350.7, 365.2, 499), False),
    ('P-OCR-H556-1906-02', 'Fig. 18.2', 16, (59.7, 335.5, 535, 555.2), False),
    ('P-OCR-H556-1906-02', 'Fig. 18.3', 17, (122.4, 473.8, 329.8, 574.6), False),
    ('P-OCR-H556-1906-02', 'Fig. 19.2', 18, (190.3, 334, 421, 548.2), False),
    ('P-OCR-H556-1906-02', 'Fig. 22.2', 24, (146.5, 271.5, 443.1, 487.8), False),
    ('P-OCR-H556-1906-02', 'Fig. 22.4', 26, (99.8, 101.4, 240.8, 226.3), False),
    ('P-OCR-H556-2111-02', 'Fig. 24', 28, (133.3, 90.6, 456.3, 258), False),
    ('P-OCR-H556-2306-02', 'Fig. 16.2', 10, (73.7, 294.1, 557, 429.4), False),
    ('P-OCR-H556-2506-01', 'Fig. 16.1', 12, (72.3, 190.8, 392.6, 396.4), False),
    ('P-OCR-J247-1806-03', 'Fig. 19.2', 21, (79, 157.4, 516.3, 408.7), False),
    ('P-OCR-J247-2011-01', 'Fig. 20.2', 22, (118.1, 114.9, 509.9, 271.1), False),
    ('P-OCR-J247-2011-01', 'Fig. 21.2', 24, (95, 322, 365, 409), True),
    ('P-OCR-J247-2011-01', 'Fig. 22.1', 26, (72.3, 99.8, 458.8, 368.4), False),
    ('P-OCR-J247-2011-01', 'Fig. 22.2', 27, (117.6, 86.8, 504.1, 366.1), False),
    ('P-OCR-J247-2011-02', 'Fig. 16.2', 12, (98, 318.9, 474.5, 509.9), False),
    ('P-OCR-J247-2011-02', 'Fig. 22.1', 28, (163.2, 94.4, 431.6, 337.7), False),
    ('P-OCR-J247-2011-02', 'Fig. 22.2', 29, (54.4, 240.5, 540, 505.8), False),
    ('P-OCR-J247-2011-02', 'Fig. 23.2', 32, (102.8, 353.6, 408.2, 628.4), False),
    ('P-OCR-J247-2011-02', 'Fig. 23.3', 34, (93.3, 155.6, 506.2, 426.5), False),
    ('P-OCR-J247-2011-04', 'Fig. 16.1', 10, (163.2, 140.9, 431.6, 384.2), False),
    ('P-OCR-J247-2011-04', 'Fig. 16.2', 11, (55, 238.3, 540.6, 503.8), False),
    ('P-OCR-J247-2011-04', 'Fig. 17.2', 14, (95, 358.2, 402.8, 633), False),
    ('P-OCR-J247-2011-04', 'Fig. 17.3', 16, (95, 151.8, 507.9, 422.7), False),
    ('P-OCR-J247-2011-04', 'Fig. 20.2', 26, (95.3, 489.3, 447.1, 645.6), False),
    ('P-OCR-J247-2011-04', 'Fig. 21.1', 30, (95, 101.4, 423.6, 303.8), False),
    ('P-OCR-J247-2011-04', 'Fig. 21.2', 31, (95, 140.7, 361.9, 442.9), False),
    ('P-OCR-J247-2111-01', 'Fig. 16.1', 10, (117.6, 393.2, 378.9, 533.3), False),
    ('P-OCR-J247-2111-01', 'Fig. 18.1', 14, (118.1, 88.9, 338.7, 309.5), False),
    ('P-OCR-J247-2111-01', 'Fig. 20.1', 19, (104.2, 101.7, 490.5, 154), False),
    ('P-OCR-J247-2111-01', 'Fig. 20.2', 20, (117.6, 190.2, 355.8, 650.6), False),
    ('P-OCR-J247-2111-03', 'Fig. 21.1', 25, (95, 138.4, 450, 434), False),
    ('P-OCR-J247-2111-03', 'Fig. 22.1', 26, (118.1, 88.9, 338.7, 309.5), False),
    ('P-OCR-J247-2206-01', 'Fig. 17.1', 12, (261.7, 114.7, 380.9, 244.9), False),
    ('P-OCR-J247-2206-01', 'Fig. 17.2', 13, (95, 153.9, 439.5, 402.8), False),
    ('P-OCR-J247-2206-01', 'Fig. 23.1', 22, (75.9, 138.8, 519.3, 401.1), False),
    ('P-OCR-J247-2206-01', 'Fig. 23.2', 22, (105, 525, 450, 745), False),
    ('P-OCR-J247-2306-03', 'Fig. 25.1', 26, (95.3, 424.5, 491.5, 608.6), False),
    ('P-OCR-J247-2306-03', 'Fig. 25.2', 26, (95.3, 424.5, 491.5, 608.6), False),
    ('P-OCR-J247-2506-01', 'Fig. 22.1', 22, (70, 428, 528, 680), False),
    ('P-OCR-J247-2506-02', 'Fig. 16.1', 9, (100, 172, 495, 458), False),
    ('P-OCR-J247-2506-02', 'Fig. 16.2', 11, (70, 148, 400, 356), False),
    ('P-OCR-J247-2506-03', 'Fig. 20.1', 18, (72.3, 179.9, 206, 320), False),
    ('P-OCR-J247-2506-03', 'Fig. 20.2', 19, (72.3, 140.4, 367.6, 316.2), False),
    ('P-OCR-J247-2506-03', 'Fig. 21.1', 20, (202.2, 140.8, 394.1, 326.8), False),
    ('P-OCR-J247-2506-03', 'Fig. 21.2', 21, (60, 135, 540, 355), False),
    ('P-OCR-J248-1906-02', 'Fig. 16.1', 8, (95, 192.9, 471.9, 341.2), False),
    ('P-OCR-J248-1906-02', 'Fig. 16.2', 9, (95.4, 114.4, 307.2, 233.5), False),
    ('P-OCR-J248-2011-02', 'Fig. 18.2', 14, (96.5, 416.5, 470.3, 532.7), False),
    ('P-OCR-J248-2111-02', 'Fig. 18.1', 14, (95, 218.9, 524.6, 452.9), False),
    ('P-OCR-J248-2111-02', 'Fig. 18.2', 15, (94.9, 250, 412.9, 496.8), False),
    ('P-OCR-J249-1906-04', 'Fig. 18.1', 12, (217.8, 171.4, 424.8, 312.7), False),
    ('P-OCR-J249-1906-04', 'Fig. 18.2', 12, (204.5, 449.4, 399.2, 628.1), False),
    ('P-OCR-J249-1906-04', 'Fig. 18.4', 14, (98, 126.3, 482.8, 249.7), False),
    ('P-OCR-J249-1906-04', 'Fig. 18.5', 14, (105.2, 357.6, 490.1, 480.9), False),
    ('P-OCR-J249-1906-04', 'Fig. 21.3', 19, (98, 474.3, 337.4, 602), False),
    ('P-OCR-J249-1906-04', 'Fig. 22.1', 20, (75.3, 86.8, 259, 202.4), False),
    ('P-OCR-J249-1906-04', 'Fig. 24.2', 28, (74.7, 127.2, 521.9, 343.8), False),
    ('P-OCR-J249-2011-01', 'Fig. 17.1', 12, (228.7, 130.4, 367.1, 205.4), False),
    ('P-OCR-J249-2111-01', 'Fig. 16.1', 10, (206.4, 178.7, 388.3, 344.4), False),
    ('P-OCR-J249-2111-01', 'Fig. 16.2', 10, (195.1, 516.4, 398.3, 676.8), False),
    ('P-OCR-J249-2111-01', 'Fig. 17.1', 12, (197.1, 142.5, 399.9, 274.5), False),
    ('P-OCR-J249-2111-01', 'Fig. 24.2', 24, (97.4, 400.9, 388.5, 543.5), False),
    ('P-OCR-J249-2111-02', 'Fig. 18.1', 15, (98.2, 90.6, 490.7, 218.1), False),
    ('P-OCR-J249-2111-02', 'Fig. 18.2', 15, (98.2, 315.7, 490.7, 443.2), False),
    ('P-OCR-J249-2111-02', 'Fig. 20.1', 20, (100.7, 311.6, 378.9, 550.1), False),
    ('P-OCR-J249-2111-02', 'Fig. 22.1', 24, (186.3, 298.6, 409, 436.3), False),
    ('P-OCR-J249-2111-04', 'Fig. 16.1', 10, (186.9, 346.4, 408.4, 484.5), False),
    ('P-OCR-J249-2111-04', 'Fig. 20.1', 18, (72.3, 114.9, 378.2, 294), False),
    ('P-OCR-J249-2206-02', 'Fig. 16.1', 13, (95, 112.4, 447.6, 229.7), False),
    ('P-OCR-J249-2206-02', 'Fig. 16.2', 13, (100.7, 310.9, 494.6, 622.3), False),
    ('P-OCR-J249-2206-02', 'Fig. 21.2', 27, (117.7, 140.6, 412, 431.7), False),
    ('P-OCR-J249-2406-04', 'Fig. 18.2', 16, (72.3, 395.9, 331.2, 627.6), False),
    ('P-OCR-J249-2406-04', 'Fig. 22.1', 28, (145.5, 114.4, 449.8, 303.1), False),
    ('P-OCR-J249-2406-04', 'Fig. 22.2', 30, (72.3, 348.2, 466.7, 487.4), False),
]

# row -> the figures its words name, in the order they name them
ROWS = {
    'Q-OCR-H420-1706-02-18bv': ['Fig. 18'],
    'Q-OCR-H420-1706-02-19a': ['Fig. 19.2'],
    'Q-OCR-H420-1706-02-19bi': ['Fig. 19.3'],
    'Q-OCR-H420-1706-02-19bii': ['Fig. 19.3'],
    'Q-OCR-H420-1706-02-21d': ['Fig. 21'],
    'Q-OCR-H420-1806-01-16c': ['Fig. 16.1'],
    'Q-OCR-H420-1806-01-17b': ['Fig. 17.1'],
    'Q-OCR-H420-1806-01-17ci': ['Fig. 17.2'],
    'Q-OCR-H420-1806-01-19b': ['Fig. 19.2'],
    'Q-OCR-H420-1806-02-17bi': ['Fig. 17'],
    'Q-OCR-H420-1806-02-20aii': ['Fig. 20.1'],
    'Q-OCR-H420-1806-02-20aiii': ['Fig. 20.1'],
    'Q-OCR-H420-1906-01-16ai': ['Fig. 16'],
    'Q-OCR-H420-1906-01-16aii': ['Fig. 16'],
    'Q-OCR-H420-1906-01-16aiii': ['Fig. 16'],
    'Q-OCR-H420-1906-01-16aiv': ['Fig. 16'],
    'Q-OCR-H420-1906-01-19cii': ['Fig. 19.2'],
    'Q-OCR-H420-1906-01-20ai': ['Fig. 20.1'],
    'Q-OCR-H420-1906-01-21aii': ['Fig. 21.1'],
    'Q-OCR-H420-1906-01-21bi': ['Fig. 21.2'],
    'Q-OCR-H420-1906-01-22a': ['Fig. 22.1'],
    'Q-OCR-H420-1906-01-22c': ['Fig. 22.2'],
    'Q-OCR-H420-2011-01-16ai': ['Fig. 16.1'],
    'Q-OCR-H420-2011-01-17c': ['Fig. 17.2'],
    'Q-OCR-H420-2111-01-16ai': ['Fig. 16.1'],
    'Q-OCR-H420-2111-01-16aii': ['Fig. 16.1'],
    'Q-OCR-H420-2111-01-16bi': ['Fig. 16.2', 'Fig. 16.1'],
    'Q-OCR-H420-2111-01-16biii': ['Fig. 16.2'],
    'Q-OCR-H420-2111-01-18c': ['Fig. 18.2'],
    'Q-OCR-H420-2111-02-20c': ['Fig. 20.2'],
    'Q-OCR-H420-2206-02-16bi': ['Fig. 16.3', 'Fig. 16.2'],
    'Q-OCR-H420-2206-02-16bii': ['Fig. 16.2'],
    'Q-OCR-H420-2206-02-16biv': ['Fig. 16.3'],
    'Q-OCR-H420-2206-03-01a': ['Fig. 1.1'],
    'Q-OCR-H420-2206-03-01c': ['Fig. 1.2'],
    'Q-OCR-H420-2206-03-04aii': ['Fig. 4.2'],
    'Q-OCR-H420-2306-01-16ai': ['Fig. 16.1'],
    'Q-OCR-H420-2306-01-16aiii': ['Fig. 16.2', 'Fig. 16.1'],
    'Q-OCR-H420-2306-01-16ci': ['Fig. 16.3'],
    'Q-OCR-H420-2306-01-19bi': ['Fig. 19.1'],
    'Q-OCR-H420-2306-01-19cii': ['Fig. 19.3'],
    'Q-OCR-H420-2306-02-17c': ['Fig. 17.2'],
    'Q-OCR-H420-2306-02-18b': ['Fig. 18.1'],
    'Q-OCR-H420-2306-02-18cii': ['Fig. 18.2'],
    'Q-OCR-H420-2306-02-19cii': ['Fig. 19.2'],
    'Q-OCR-H420-2306-03-01c': ['Fig. 1.2'],
    'Q-OCR-H420-2306-03-02aii': ['Fig. 2.1'],
    'Q-OCR-H420-2306-03-02b': ['Fig. 2.2'],
    'Q-OCR-H420-2306-03-02dii': ['Fig. 2.4'],
    'Q-OCR-H420-2306-03-04biii': ['Fig. 4.4'],
    'Q-OCR-H556-1806-03-01a': ['Fig. 1.1'],
    'Q-OCR-H556-1806-03-03bi': ['Fig. 3.2'],
    'Q-OCR-H556-1806-03-04bii': ['Fig. 4.2'],
    'Q-OCR-H556-1806-03-04cii': ['Fig. 4.2'],
    'Q-OCR-H556-1806-03-05aii': ['Fig. 5.3'],
    'Q-OCR-H556-1806-03-05aiii': ['Fig. 5.1'],
    'Q-OCR-H556-1806-03-05b': ['Fig. 5.4'],
    'Q-OCR-H556-1806-03-06aii': ['Fig. 6.2'],
    'Q-OCR-H556-1906-01-16biii': ['Fig. 16.2'],
    'Q-OCR-H556-1906-01-18b': ['Fig. 18.1'],
    'Q-OCR-H556-1906-01-18ci': ['Fig. 18.3'],
    'Q-OCR-H556-1906-01-18cii': ['Fig. 18.3'],
    'Q-OCR-H556-1906-01-20b': ['Fig. 20.1'],
    'Q-OCR-H556-1906-01-20c': ['Fig. 20.2'],
    'Q-OCR-H556-1906-01-21b': ['Fig. 21'],
    'Q-OCR-H556-1906-01-22a': ['Fig. 22.1'],
    'Q-OCR-H556-1906-01-22b': ['Fig. 22.2'],
    'Q-OCR-H556-1906-02-16a': ['Fig. 16.1'],
    'Q-OCR-H556-1906-02-17ai': ['Fig. 17.1'],
    'Q-OCR-H556-1906-02-17aii': ['Fig. 17.1'],
    'Q-OCR-H556-1906-02-17b': ['Fig. 17.2'],
    'Q-OCR-H556-1906-02-18ci': ['Fig. 18.2'],
    'Q-OCR-H556-1906-02-18civ': ['Fig. 18.3'],
    'Q-OCR-H556-1906-02-19a': ['Fig. 19.2'],
    'Q-OCR-H556-1906-02-22ai': ['Fig. 22.2'],
    'Q-OCR-H556-1906-02-22c': ['Fig. 22.4'],
    'Q-OCR-H556-2111-02-24b': ['Fig. 24'],
    'Q-OCR-H556-2306-02-16d': ['Fig. 16.2'],
    'Q-OCR-H556-2506-01-16ai': ['Fig. 16.1'],
    'Q-OCR-H556-2506-01-16aiii': ['Fig. 16.1'],
    'Q-OCR-J247-1806-03-19aii': ['Fig. 19.2'],
    'Q-OCR-J247-2011-01-20cii': ['Fig. 20.2'],
    'Q-OCR-J247-2011-01-21b': ['Fig. 21.2'],
    'Q-OCR-J247-2011-01-22g': ['Fig. 22.2', 'Fig. 22.1'],
    'Q-OCR-J247-2011-02-16b': ['Fig. 16.2'],
    'Q-OCR-J247-2011-02-22a': ['Fig. 22.1'],
    'Q-OCR-J247-2011-02-22c': ['Fig. 22.2'],
    'Q-OCR-J247-2011-02-23ai': ['Fig. 23.2'],
    'Q-OCR-J247-2011-02-23bi': ['Fig. 23.3'],
    'Q-OCR-J247-2011-02-23bii': ['Fig. 23.3'],
    'Q-OCR-J247-2011-04-16a': ['Fig. 16.1'],
    'Q-OCR-J247-2011-04-16c': ['Fig. 16.2'],
    'Q-OCR-J247-2011-04-17ai': ['Fig. 17.2'],
    'Q-OCR-J247-2011-04-17bi': ['Fig. 17.3'],
    'Q-OCR-J247-2011-04-17bii': ['Fig. 17.3'],
    'Q-OCR-J247-2011-04-20cii': ['Fig. 20.2'],
    'Q-OCR-J247-2011-04-21e': ['Fig. 21.1'],
    'Q-OCR-J247-2011-04-21f': ['Fig. 21.2'],
    'Q-OCR-J247-2111-01-16bi': ['Fig. 16.1'],
    'Q-OCR-J247-2111-01-16bii': ['Fig. 16.1'],
    'Q-OCR-J247-2111-01-18ai': ['Fig. 18.1'],
    'Q-OCR-J247-2111-01-20ai': ['Fig. 20.1'],
    'Q-OCR-J247-2111-01-20ci': ['Fig. 20.2'],
    'Q-OCR-J247-2111-03-21c': ['Fig. 21.1'],
    'Q-OCR-J247-2111-03-22ai': ['Fig. 22.1'],
    'Q-OCR-J247-2206-01-17ai': ['Fig. 17.1'],
    'Q-OCR-J247-2206-01-17aii': ['Fig. 17.1'],
    'Q-OCR-J247-2206-01-17c': ['Fig. 17.2'],
    'Q-OCR-J247-2206-01-23ai': ['Fig. 23.1'],
    'Q-OCR-J247-2206-01-23aii': ['Fig. 23.2'],
    'Q-OCR-J247-2306-03-25b': ['Fig. 25.1', 'Fig. 25.2'],
    'Q-OCR-J247-2506-01-22bii': ['Fig. 22.1'],
    'Q-OCR-J247-2506-02-16bii': ['Fig. 16.1'],
    'Q-OCR-J247-2506-02-16di': ['Fig. 16.2'],
    'Q-OCR-J247-2506-03-18a-3': ['Fig. 20.1'],
    'Q-OCR-J247-2506-03-18a-4': ['Fig. 21.1'],
    'Q-OCR-J247-2506-03-18b-3': ['Fig. 20.2'],
    'Q-OCR-J247-2506-03-18c-3': ['Fig. 21.2'],
    'Q-OCR-J248-1906-02-16a': ['Fig. 16.1'],
    'Q-OCR-J248-1906-02-16b': ['Fig. 16.2'],
    'Q-OCR-J248-2011-02-18a': ['Fig. 18.2'],
    'Q-OCR-J248-2111-02-18bii': ['Fig. 18.1'],
    'Q-OCR-J248-2111-02-18f': ['Fig. 18.2'],
    'Q-OCR-J249-1906-04-18a': ['Fig. 18.1'],
    'Q-OCR-J249-1906-04-18b': ['Fig. 18.2'],
    'Q-OCR-J249-1906-04-18ei': ['Fig. 18.4', 'Fig. 18.5'],
    'Q-OCR-J249-1906-04-18eiii': ['Fig. 18.4'],
    'Q-OCR-J249-1906-04-21cii': ['Fig. 21.3'],
    'Q-OCR-J249-1906-04-22': ['Fig. 22.1'],
    'Q-OCR-J249-1906-04-24b': ['Fig. 24.2'],
    'Q-OCR-J249-2011-01-17ai': ['Fig. 17.1'],
    'Q-OCR-J249-2011-01-17biii': ['Fig. 17.1'],
    'Q-OCR-J249-2111-01-16a': ['Fig. 16.1'],
    'Q-OCR-J249-2111-01-16bi': ['Fig. 16.2'],
    'Q-OCR-J249-2111-01-17': ['Fig. 17.1'],
    'Q-OCR-J249-2111-01-24a': ['Fig. 24.2'],
    'Q-OCR-J249-2111-02-18c': ['Fig. 18.1', 'Fig. 18.2'],
    'Q-OCR-J249-2111-02-20b': ['Fig. 20.1'],
    'Q-OCR-J249-2111-02-22aii': ['Fig. 22.1'],
    'Q-OCR-J249-2111-04-16aii': ['Fig. 16.1'],
    'Q-OCR-J249-2111-04-20c': ['Fig. 20.1'],
    'Q-OCR-J249-2206-02-16c': ['Fig. 16.1', 'Fig. 16.2'],
    'Q-OCR-J249-2206-02-21bi': ['Fig. 21.2'],
    'Q-OCR-J249-2406-04-18a': ['Fig. 18.2'],
    'Q-OCR-J249-2406-04-19a-4': ['Fig. 22.1'],
    'Q-OCR-J249-2406-04-19ci-2': ['Fig. 22.1'],
    'Q-OCR-J249-2406-04-19e': ['Fig. 22.2'],
}


WORD = re.compile(r"[^\s|]+")


def trim(html, svg):
    """THE FIGURE'S LABELS, READ OUT AS WORDS: the paper's text layer put each axis number and label of the figure
    into the question as a paragraph of its own ("<p>100.0</p>", "<p>50.0 5.0 | 10.0 | 15.0</p>"). With the figure
    drawn they are noise, so a paragraph goes when every word of it is a word of the drawing's own labels and it is
    not a sentence (no full stop or question mark at its end). The caption ("Fig. 17.2") stays."""
    said = set(WORD.findall(' '.join(_html.unescape(t) for t in re.findall(r'<text[^>]*>([^<]*)</text>', svg))))
    def keep(m):
        t = re.sub(r'<[^>]+>', ' ', m.group(1))
        t = _html.unescape(t).strip()
        w = WORD.findall(t)
        if not w or re.match(r'(Fig\.|Figure)\s*\d', t) or re.search(r'[.?:]$', t) or len(t) > 120: return m.group(0)
        return '' if all(x in said for x in w) else m.group(0)
    return re.sub(r'<p>(.*?)</p>', keep, html)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--pdfs', required=True)
    a = ap.parse_args()
    figs = {(p, c): (pg, box, so) for p, c, pg, box, so in FIGS}
    docs = {}
    def page(p, n):
        if p not in docs: docs[p] = pymupdf.open(pathlib.Path(a.pdfs) / ('%s.pdf' % p))
        return docs[p][n - 1]
    lines = FILE.read_text(encoding='utf-8').split('\n')
    out, done, cut = [], set(), 0
    for line in lines:
        bare = line.strip()
        trailing = bare.endswith(',')
        if not bare.startswith('{'):
            out.append(line); continue
        row = json.loads(bare[:-1] if trailing else bare)
        rid = row.get('row_id', '')
        if rid in ROWS:
            p = row['paper_id']
            caps = ROWS[rid]
            label = '%s, redrawn from the paper' % ' and '.join(caps)
            assert not row.get('diagram') or 'redrawn from the paper' in row['diagram'], '%s already carries a diagram' % rid
            if len(caps) == 1:
                pg, box, so = figs[(p, caps[0])]
                row['diagram'] = PF.svg(page(p, pg), box, label, so)[0]
            else:
                row['diagram'] = PF.stack([(page(p, figs[(p, c)][0]), figs[(p, c)][1], c, figs[(p, c)][2]) for c in caps], label)
            before = row.get('html', '')
            row['html'] = trim(before, row['diagram'])
            cut += before != row['html']
            done.add(rid)
            out.append(json.dumps(row, ensure_ascii=False, separators=(',', ':')) + (',' if trailing else '')); continue
        out.append(line)
    missing = sorted(set(ROWS) - done)
    assert not missing, 'rows not found: %r' % missing
    FILE.write_text('\n'.join(out), encoding='utf-8')
    print('%d rows lost the figure\'s own labels, read out of the paper as loose paragraphs' % cut)
    print('%d rows gained a drawing, from %d figures on %d papers' % (len(done), len(FIGS), len({f[0] for f in FIGS})))


if __name__ == '__main__':
    main()
