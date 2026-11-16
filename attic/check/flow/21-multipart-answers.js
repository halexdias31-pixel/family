/* Journey taken out of check/flow/21-multipart-answers.js in the 16 Nov cull: the calendar. */
/* ---------- A PLAIN CALENDAR (466): NO TERM, SESSION, EXAM OR HOLIDAY IS LAID ON IT ---------- */
check('466: the calendar is a plain month — the days and today, with no term, half term, session, exam, closure or event on it, and no key', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document;
  if (typeof w.initCalendar !== 'function') return ['initCalendar is not reachable, so the calendar was NOT checked — not a pass'];
  const now = new Date(), y = now.getFullYear(), m = now.getMonth();
  const on = n => String(n).padStart(2, '0') + '/' + String(m + 1).padStart(2, '0') + '/' + y;
  const D = t.DATA();
  D.liveJobs = D.jobs = [{ id: 'J-CAL', jobId: 'J-CAL', subject: 'Maths', time: '16:00', day: 'Monday', client: 'Pat Parent', tutor: 'GeorgePovey',
    status: 'active', slots: [], dates: [on(3), on(17)].join(', '), location: 'Mitcham library' }];
  D.intervals = [{ term: 'Autumn 2', label: 'Autumn 2', kind: 'term', startDate: on(5), endDate: '19/12/' + (y + 1) },
    { term: 'October Half Term', label: 'October Half Term', kind: 'half-term', startDate: on(20), endDate: on(22) }];
  D.closures = [{ date: on(9), name: 'Early May bank holiday', kind: 'bank' }];
  D.exams = [{ personId: 'P1', who: 'Pat Parent', subject: '', label: 'Small exam', date: on(12), kind: 'mock' }];
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'client', roles: ['client'] });
  const host = await toolBox_(w, 'calendar', '#cal-body');
  if (!host) return ['the calendar did not draw on Tools — NOT checked'];
  w.initCalendar();
  const bad = [];
  const days = new Date(y, m + 1, 0).getDate();
  if (host.querySelectorAll('.cal-d').length !== days) bad.push('the month draws ' + host.querySelectorAll('.cal-d').length + ' days, wanted ' + days);
  if (!host.querySelector('.cal-d.cal-today')) bad.push('today is not marked');
  if (host.querySelector('.dot, .cal-dots, .cal-d.has, [data-do]')) bad.push('a day carries a mark or a control — the calendar is plain (466)');
  if (d.querySelector('.cal-key-box, .cal-key')) bad.push('a key is drawn under the month');
  if (['calendarMarks', 'calKey_'].some(f => typeof w[f] === 'function') || 'cal-day' in t.ACTIONS) bad.push('the calendar\'s marks, key or day sheet are still wired');
  return bad;
});

