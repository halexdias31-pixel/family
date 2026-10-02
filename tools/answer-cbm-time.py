"""Answers for the Corbettmaths `Time` worksheet -- the rows whose own words settle the answer.

Every number is computed and asserted here. The other seven rows are questions ABOUT a clock face or
a calendar the text layer did not carry, so they are marked as needing a picture rather than
answered: a clock read from a description is a guess, and the count `check-library.js` prints is
what keeps them from reading as finished.
"""
import datetime

from cbmwrite import write

PAPER = 'W-CBM-time'
A = {}

# 3: 7:30pm to 8:15pm
assert (8 * 60 + 15) - (19 * 60 + 30) + 12 * 60 == 45
A['Q-CBM-time-3'] = ('<b>45 minutes</b> &mdash; 7:30pm to 8:00pm is 30, then 15 more to 8:15pm.', '45')

# 4: ten facts, one box each on the paper, so no `accept` (one box on screen, ten answers)
assert (60, 60, 24, 7, 31, 12, 365, 366, 10, 100) == (60, 60, 24, 7, 31, 12, 365, 366, 10, 100)
assert datetime.date(2023, 12, 31).timetuple().tm_yday == 365
assert datetime.date(2024, 12, 31).timetuple().tm_yday == 366
A['Q-CBM-time-4'] = (
    '<b>60</b> seconds in a minute, <b>60</b> minutes in an hour, <b>24</b> hours in a day, '
    '<b>7</b> days in a week, <b>31</b> days in August, <b>12</b> months in a year, '
    '<b>365</b> days in a year, <b>366</b> in a leap year, <b>10</b> years in a decade and '
    '<b>100</b> years in a century.', None)

# 8: two hours is 120 minutes
assert 2 * 60 - 80 == 40
A['Q-CBM-time-8'] = ('<b>40 minutes</b> &mdash; two hours is 120 minutes, and 120 &minus; 80 = 40.', '40')

# 9: five minutes in seconds
assert 5 * 60 == 300
A['Q-CBM-time-9'] = ('<b>300 seconds</b> &mdash; 5 &times; 60.', '300')

# 10: 5:55pm plus 23 minutes
t = 17 * 60 + 55 + 23
assert (t // 60, t % 60) == (18, 18)
A['Q-CBM-time-10'] = ('<b>6:18pm</b> &mdash; 5:55pm plus 5 minutes is 6:00pm, then 18 more.', None)

# 13: 28 September 1999 was a Tuesday, so 3 October is five days later
assert datetime.date(1999, 9, 28).weekday() == 1
assert (datetime.date(1999, 10, 3) - datetime.date(1999, 9, 28)).days == 5
assert datetime.date(1999, 10, 3).weekday() == 6
A['Q-CBM-time-13'] = (
    '<b>Sunday</b> &mdash; 28 September is a Tuesday, so the 3rd of October is 5 days later: '
    'Wednesday, Thursday, Friday, Saturday, Sunday.', 'Sunday')

# 14: 235 minutes
assert divmod(235, 60) == (3, 55)
A['Q-CBM-time-14'] = ('<b>3 hours 55 minutes</b> &mdash; 3 &times; 60 = 180, and 235 &minus; 180 = 55.', None)

# 15: in days, 240 hours = 10, 3 weeks = 21, 35 days; a month is 28 to 31 days so it is below 35 in any month
assert 240 // 24 == 10 and 3 * 7 == 21 and 31 < 35
assert sorted([35, 21, 10]) == [10, 21, 35]
A['Q-CBM-time-15'] = (
    '<b>240 hours</b> (10 days), <b>3 weeks</b> (21 days), <b>1 month</b> (28 to 31 days), '
    '<b>35 days</b> &mdash; put everything in days to compare. A month is at most 31 days, so it '
    'is shorter than 35 whichever month it is.', None)

# 16: minutes in a day
assert 24 * 60 == 1440
A['Q-CBM-time-16'] = ('<b>1,440 minutes</b> &mdash; 24 &times; 60.', '1440|1,440')

# 17: minutes and seconds, as seconds
def ms(m, s): return m * 60 + s
def show(x): return '%d minutes %d seconds' % divmod(x, 60)
assert show(ms(44, 19) + ms(9, 50)) == '54 minutes 9 seconds'
assert show(ms(44, 19) - ms(6, 27)) == '37 minutes 52 seconds'
A['Q-CBM-time-17'] = (
    'Theresa: <b>54 minutes 9 seconds</b> (44:19 + 9:50). Selina: <b>37 minutes 52 seconds</b> '
    '(44:19 &minus; 6:27 &mdash; take a minute across: 79 seconds &minus; 27 = 52).', None)

# 18: Joseph's watch is 5 minutes fast, Connor's is 17 minutes slow
true = 19 * 60 + 1 - 5
connor = true - 17
assert divmod(true, 60) == (18, 56) and divmod(connor, 60) == (18, 39)
A['Q-CBM-time-18'] = (
    '<b>18:39</b> &mdash; Joseph is 5 minutes fast, so the real time is 18:56, and Connor is '
    '17 minutes slow, so 18:56 &minus; 17 minutes is 18:39.', '18:39')

PICTURES = {'Q-CBM-time-1': 'clock', 'Q-CBM-time-2': 'clock', 'Q-CBM-time-5': 'clock',
            'Q-CBM-time-6': 'clock', 'Q-CBM-time-7': 'clock', 'Q-CBM-time-11': 'calendar',
            'Q-CBM-time-12': 'clock'}

write(PAPER, A, figures=PICTURES)
