/* THE TOOLS COLUMN STATES OF check/states.js for the cheat sheet maker, flyer maker, rewrite coach, timetable, calendar and touch typing — taken out in the 16 Nov cull; they went back inside `tools: [` there. */
    { name: 'the cheat sheet maker',
      /* `widgetsOf_`, NOT `allWidgets()` — the note over the flyer state below says why, and this state was still doing the thing it describes: § */
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
      },
      /* NO PREVIEW, AND THAT IS PART OF WHAT IS ASSERTED. § */
      expect: () => !document.querySelector('#s-tools .mat-sheet')
        && document.querySelector('#s-tools #mat-said b'),
      wants: 'the picker and the gauge, with no A4 preview on the card' },
    /* ---------- AND FILLED, WHICH IS THE CARD SOMEBODY ACTUALLY PRINTS FROM § */
    { name: 'the cheat sheet maker, five pieces ticked',
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
        const sub = document.querySelector('#s-tools #mat-subject');
        const lev = document.querySelector('#s-tools #mat-level');
        if (!sub || !lev) throw new Error('the cheat sheet maker has no subject or level select');
        sub.value = 'Maths'; sub.dispatchEvent(new Event('change', { bubbles: true }));
        lev.value = 'GCSE|H'; lev.dispatchEvent(new Event('change', { bubbles: true }));
        /* FIVE PIECES TICKED BY HAND — there is no Fill button any more (the owner took it off), so
           the pieces go on the way a person puts them on, through the list's own boxes. */
        /* A TOPIC AT A TIME NOW (`MAT_GROUPS`), and no GCSE topic holds five, so the ticks are taken across the topics the way a person would make a sheet — and the view § */
        const grp = document.querySelector('#s-tools #mat-group');
        if (!grp) throw new Error('the cheat sheet maker has no topic select');
        const topics = [...grp.options].map(o => o.value);
        let ticked = 0;
        for (const g of topics) {
          if (ticked >= 5) break;
          grp.value = g; grp.dispatchEvent(new Event('change', { bubbles: true }));
          const boxes = [...document.querySelectorAll('#s-tools .mat-list label:not(.off):not([data-id="M01"]) input:not(:checked)')]
            .slice(0, 5 - ticked);
          boxes.forEach(b => b.click());
          ticked += boxes.length;
        }
        if (ticked < 5) throw new Error('fewer than five pieces offered for GCSE Higher');
        grp.value = topics[0]; grp.dispatchEvent(new Event('change', { bubbles: true }));
      },
      expect: () => !document.querySelector('#s-tools #mat-fill, #s-tools #mat-clear')
        && document.querySelectorAll('#s-tools .mat-list input:checked').length >= 5
        && !document.querySelector('#s-tools #mat-go').disabled
        /* THE NEGATIVE NUMBER LINE IS ON THE GCSE LIST, and the list is not a scroller — it is the
           whole list, and the pane is what scrolls (see the note over the list in `initMat`). */
        && document.querySelector('#s-tools #mat-list label[data-id="M52"]:not(.off)')
        && !document.querySelector('#s-tools #mat-box .widget-squeeze')
        /* AND ASKED OF THE COMPUTED STYLE, NOT ONLY THE CLASS: § */
        && (() => {
          const list = document.querySelector('#s-tools #mat-list');
          for (let e = list; e && !e.matches('.card.is-widget'); e = e.parentElement) {
            if (/auto|scroll/.test(getComputedStyle(e).overflowY)) return false;
          }
          return true;
        })(),
      wants: 'a subject and a level chosen, five pieces ticked, no Fill or Clear, the negative number line offered, the list not a scroller, and Print ready',
      leave: () => {
        MAT_ON = []; MAT_SUBJECT = 'Maths'; MAT_LEVEL = 'all'; MAT_TIER = 'H'; MAT_EXAM = 'all';
        MAT_GROUP = ''; if (typeof MAT_KIND !== 'undefined') MAT_KIND = 'cheat';
        try { localStorage.removeItem('matChoice'); } catch (e) {}
        matPaint();
      } },
    /* ---------- AND EVERY VIEW OF IT FITS, WHICH IS WHAT THE OWNER ASKED § */
    { name: 'the cheat sheet maker, every subject, level and topic',
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'mat');
        if (n < 0) throw new Error('no cheat sheet widget in the roster');
        goPage('tools', n, true);
        if (!document.querySelector('#s-tools #mat-group')) throw new Error('the cheat sheet maker has no topic select');
      },
      expect: () => {
        const phone = (innerWidth === 320 && innerHeight === 568) || (innerWidth === 390 && innerHeight === 844);
        /* NOT WALKED AT ALL AWAY FROM THE PHONES. § */
        if (!phone) return !!document.querySelector('#s-tools #mat-group');
        const sub = document.querySelector('#s-tools #mat-subject');
        const lev = document.querySelector('#s-tools #mat-level');
        const box = document.querySelector('#s-tools #mat-box');
        const pane = box && box.closest('.pane');
        if (!sub || !lev || !pane) return false;
        const fire = (el, v) => { el.value = v; el.dispatchEvent(new Event('change', { bubbles: true })); };
        let miss = '', views = 0;
        for (const s of [...sub.options].map(o => o.value)) {
          fire(sub, s);
          for (const l of [...lev.options].map(o => o.value)) {
            fire(lev, l);
            const grp = document.querySelector('#s-tools #mat-group');
            const gs = grp && !grp.closest('[hidden]') ? [...grp.options].map(o => o.value) : [''];
            for (const g of gs) {
              if (g) fire(grp, g);
              views++;
              if (miss) continue;
              paneReach_([pane]);
              const zoom = Math.min(...[...pane.children].map(k => Number(k.style.zoom || 1)));
              const rows = document.querySelectorAll('#s-tools .mat-list label:not(.off)').length;
              /* FITS, OR SCROLLS TO ITS FOOT (533, D3): a view the floors hold at full size scrolls rather than being drawn under 11px words. */
              const over = pane.scrollHeight - pane.clientHeight > 2 && pane.style.overflowY !== 'auto';
              if (over || PANE_ZOOM_STEPS.indexOf(zoom) < 0 || rows > 8) {
                miss = `${s} · ${l} · ${g || '(one topic)'}: ${rows} rows, ${pane.scrollHeight}px in `
                     + `${pane.clientHeight}px at zoom ${zoom}`;
              }
            }
          }
        }
        window.MAT_FIT_MISS = miss;
        /* MORE THAN A HANDFUL OF VIEWS, or the walk did not walk — a select that lost its options
           would pass this with one view measured. */
        return !miss && views > 50;
      },
      wants: 'every subject × level × topic of the cheat sheet maker fitting its pane at 320x568 and 390x844, or scrolling to its foot, at a zoom on the ladder (window.MAT_FIT_MISS names the first that did not)',
      leave: () => {
        MAT_ON = []; MAT_SUBJECT = 'Maths'; MAT_LEVEL = 'all'; MAT_TIER = 'H'; MAT_EXAM = 'all';
        MAT_GROUP = ''; if (typeof MAT_KIND !== 'undefined') MAT_KIND = 'cheat';
        try { localStorage.removeItem('matChoice'); } catch (e) {}
        matPaint();
      } },
    /* ---------- AND THIS ONE IS NOT THERE FOR EVERYBODY § */
    /* ---------- THE PAGE NUMBER COMES FROM THE LIST THE COLUMN IS BUILT FROM § */
    { name: 'the flyer maker',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'flyers');
        if (n < 0) throw new Error('no flyer widget in the roster');
        goPage('tools', n, true);
      },
      /* THE SENTENCE IN PLACE OF THE PICTURE, and no picture — see `flyDraw`. */
      expect: () => !document.querySelector('#s-tools .fm-sheet')
        && document.querySelector('#s-tools #fm-said b'),
      wants: 'the flyer maker saying what will print, with no preview on the card' },

    /* ---------- THE REWRITE COACH, ONE FACT AT A TIME (519): the owner's "one question at a time on screen", at every width ---------- */
    { name: 'the Rewrite coach, one fact at a time',
      only: () => typeof isAdmin === 'function' && isAdmin(),
      enter: () => {
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'rewrite');
        if (n < 0) throw new Error('no Rewrite coach in the roster');
        goPage('tools', n, true);
        Object.assign(RW, RW_FRESH(), { text: 'The Septuagint is the oldest surviving Greek translation of the Hebrew Bible. It was made in Alexandria for Jews who spoke '
          + 'Greek rather than Hebrew. Scholars often abbreviate the Septuagint as LXX, the Roman numeral for seventy. Early Christians read the Septuagint as their Old Testament.' });
        rwRedraw_(true);
        const tap = a => { const el = document.querySelector('#s-tools #rw-box [data-do="' + a + '"]'); if (!el) throw new Error('no ' + a + ' tile'); el.click(); };
        tap('rw-ideas'); tap('rw-recall');
        RW.mine[0] = 'The Septuigint was the first translation of the Hebrew Bible into Greek.';
        rwRedraw_(true);
      },
      expect: () => document.querySelectorAll('#s-tools #rw-box [data-rw="mine"]').length === 1
        && /^1 of \d+$/.test((document.querySelector('#s-tools #rw-box .rw-step') || {}).textContent || '')
        && document.querySelector('#s-tools #rw-box .rw-spell')
        && document.querySelector('#s-tools #rw-box [data-do="rw-next"]'),
      wants: 'the Rewrite coach on one fact: "1 of N", a specific cue, one box with its score and a gentle spelling note, Back and Next' },

    /* ---------- A TIMETABLE WITH A WEEK IN IT § */
    { name: 'a timetable',
      enter: () => {
        const day = [
          { id: 'T1', at: '09:00', subject: 'Maths', note: 'Room 4 — Mr Patel' },
          { id: 'T2', at: '10:00', subject: 'English Literature and Language combined', note: '' },
          { id: 'T3', at: '11:15', subject: 'Chemistry', note: 'Bring the revision guide and a calculator, practical write-up due' },
          { id: 'T4', at: '13:30', subject: 'History', note: '' }];
        const week = { weekend: true,
          days: [day, [{ id: 'T5', at: '09:00', subject: 'Maths', note: '' }], [], [], [], [], []] };
        /* ON THE ACCOUNT WHEN SIGNED IN, on the device when not — the two homes `tmtRead_` has. */
        if (typeof USER !== 'undefined' && USER) USER.timetable = JSON.stringify(week);
        else localStorage.setItem(tmtKey_(), JSON.stringify(week));
        TMT_DAY = 0; TMT_OPEN = 'T3';
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'timetable');
        if (n < 0) throw new Error('no timetable widget in the roster');
        goPage('tools', n, true);
        initTimetable();
      },
      expect: () => document.querySelectorAll('#s-tools .tmt-box .tmt-day').length === 7
                    && document.querySelectorAll('#s-tools .tmt-box .tmt-row:not(.is-booked)').length === 3
                    && document.querySelector('#s-tools .tmt-box .tmt-ed .tmt-time'),
      wants: 'seven day chips, three lessons as lines and one open with its time box',
      leave: () => {
        localStorage.removeItem(tmtKey_());
        if (typeof USER !== 'undefined' && USER) delete USER.timetable;
        TMT_DAY = -1; TMT_OPEN = '';
        initTimetable();
      } },

    /* ---------- THE TIMETABLE WITH YOUR BOOKED SESSIONS LOCKED IN IT § */
    { name: 'a timetable with your sessions in it',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        window.__TMT_JOBS = { live: DATA.liveJobs, jobs: DATA.jobs };
        const mine = { id: 'J-TMT', jobId: 'J-TMT', subject: 'GCSE Physics, triple award', location: 'Colliers Wood Library',
          day: 'Monday, Saturday', time: '16:00', hours: 2, client: USER.name, tutor: 'Ada Tutor',
          status: 'active', dates: '', slots: [{ n: 1, client: USER.name, status: 'Booked' }] };
        DATA.liveJobs = DATA.jobs = [mine];
        USER.timetable = JSON.stringify({ weekend: false, days: [[
          { id: 'S1', at: '09:00', subject: 'Maths', note: 'Room 4' },
          { id: 'S2', at: '15:00', subject: 'English', note: '' },
          { id: 'S3', at: '18:00', subject: 'Swimming', note: 'Leisure centre' }], [], [], [], [], [], []] });
        TMT_DAY = 0; TMT_OPEN = '';
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'timetable');
        if (n < 0) throw new Error('no timetable widget in the roster');
        goPage('tools', n, true);
        initTimetable();
      },
      expect: () => document.querySelectorAll('#s-tools .tmt-box .tmt-day').length === 7
                    && document.querySelectorAll('#s-tools .tmt-box .tmt-row.is-booked[data-do="job"]').length === 1
                    && document.querySelectorAll('#s-tools .tmt-box .tmt-row:not(.is-booked)').length === 3,
      wants: 'seven chips, the booked session locked between three lessons',
      leave: () => {
        const was = window.__TMT_JOBS || {};
        DATA.liveJobs = was.live; DATA.jobs = was.jobs;
        delete USER.timetable;
        TMT_DAY = -1; TMT_OPEN = '';
        initTimetable();
      } },
    /* ---------- A CALENDAR WITH EVERY KIND OF DATE ON IT § */
    { name: 'a calendar with every kind of date',
      only: () => typeof USER !== 'undefined' && !!USER,
      enter: () => {
        const now = new Date(), y = now.getFullYear(), m = now.getMonth();
        const on = n => String(n).padStart(2, '0') + '/' + String(m + 1).padStart(2, '0') + '/' + y;
        window.__CAL_HELD = { live: DATA.liveJobs, jobs: DATA.jobs, intervals: DATA.intervals,
          closures: DATA.closures, exams: DATA.exams };
        DATA.liveJobs = DATA.jobs = [{ id: 'J-CAL', jobId: 'J-CAL', subject: 'Maths', time: '16:00', day: 'Monday',
          client: USER.name, tutor: 'Ada Tutor', status: 'active', dates: [on(6), on(13), on(20)].join(', '),
          location: 'Colliers Wood Library', slots: [] }];
        DATA.intervals = [{ term: 'Autumn 2', label: 'Autumn 2', kind: 'term', startDate: on(2), endDate: '19/12/' + (y + 1) },
          { term: 'Half Term', label: 'Half Term', kind: 'half-term', startDate: on(26), endDate: on(28) }];
        DATA.closures = [{ date: on(13), name: 'Staff training', kind: 'inset' }, { date: on(9), name: 'Bank holiday', kind: 'bank' }];
        DATA.exams = [{ personId: USER.personId, who: USER.name, label: 'Small exam', date: on(13), kind: 'mock' },
          { personId: USER.personId, who: USER.name, subject: 'Maths', label: 'Paper 1', date: on(15), kind: 'exam' }];
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'calendar');
        if (n < 0) throw new Error('no calendar widget in the roster');
        goPage('tools', n, true);
        initCalendar();
      },
      expect: () => document.querySelectorAll('#s-tools .cal-key-box .cal-key span').length === 8
                    && document.querySelector('#s-tools .cal-d .dot.session')
                    && document.querySelector('#s-tools .cal-d .dot.halfterm'),
      wants: 'a month with all eight kinds of dot and an eight-entry key under it',
      leave: () => {
        const h = window.__CAL_HELD || {};
        DATA.liveJobs = h.live; DATA.jobs = h.jobs; DATA.intervals = h.intervals;
        DATA.closures = h.closures; DATA.exams = h.exams;
        initCalendar();
      } },

    /* ---------- TOUCH TYPING, HALF WAY ALONG A LINE WITH A KEY WRONG § */
    { name: 'touch typing',
      enter: () => {
        localStorage.setItem(ktKey_(), JSON.stringify({ at: 3, open: 3, held: [3, 3, 3, 1, 0], best: 41, lines: 10 }));
        KT = null;
        const s = ktNow_();
        s.line = 'Quiet zebras jump over the Lazy fox at London';
        s.pos = 27; s.right = 27; s.wrong = 2; s.miss = 'k'; s.t0 = Date.now() - 6000; s.t1 = Date.now();
        s.said = 'Last line: 38 wpm, 95% right.';
        const n = widgetsOf_('tool').findIndex(w => String(w.id) === 'typing');
        if (n < 0) throw new Error('no typing widget in the roster');
        goPage('tools', n, true);
        initTyping();
        const line = document.querySelector('#s-tools .kt-box .kt-line');
        if (line) ACTIONS['kt-focus'](line);
      },
      expect: () => document.querySelectorAll('#s-tools .kt-box .kt-rung').length === 5
                    && document.querySelectorAll('#s-tools .kt-box .kt-rung:disabled').length === 1
                    && document.querySelectorAll('#s-tools .kt-box .kt-k').length === 34
                    && document.querySelector('#s-tools .kt-box .kt-k.next')
                    && document.querySelector('#s-tools .kt-box .kt-k.miss'),
      wants: 'five rungs with the last shut, a 34-key keyboard with the next key lit and a wrong one red',
      leave: () => {
        localStorage.removeItem(ktKey_());
        KT = null;
        document.activeElement && document.activeElement.blur && document.activeElement.blur();
        initTyping();
      } },

