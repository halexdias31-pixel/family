/* ==== js/one-place.js ==== */
/* js/one-place.js: the owner's inbox — the questions data/settings/owner-questions.json, the answers the owner_answers tab — and What's missing under it. */
const OQ = { list: null, answers: null, error: '', asking: false, watching: false };

function oqStart_() {
  if (OQ.asking || OQ.list) return;
  OQ.asking = true;
  const list = fetch('data/settings/owner-questions.json' + (typeof deployStamp_ === 'function' ? deployStamp_() : ''), { cache: 'default' })
    .then(r => r.json()).then(j => { OQ.list = Array.isArray(j && j.questions) ? j.questions : []; })
    .catch(() => { OQ.list = []; OQ.error = 'The questions could not be fetched — check the connection.'; });
  const got = api({ action: 'listOwnerAnswers', name: USER && USER.name })
    .then(d => { OQ.answers = oqOf_(d && !d.error ? d.answers : []); if (d && d.error) OQ.error = String(d.error); })
    .catch(() => { OQ.answers = {}; OQ.error = 'The answers could not be fetched — the questions show unanswered.'; });
  Promise.all([list, got]).then(() => { OQ.asking = false; checksDraw_(); });
}
const oqOf_ = rows => { const o = {}; (Array.isArray(rows) ? rows : []).forEach(r => { if (r && r.id) o[r.id] = r; }); return o; };

/* ONE LINE PER QUESTION: its words, its answers as form buttons, Something else with its box; nothing appears or moves on a press. */
function oqItem_(q) {
  const a = (OQ.answers || {})[q.id] || (q.status === 'answered' ? { choice: q.answer || 'note', note: q.note || '' } : null);
  const opts = Object.keys(q.options || {}).filter(k => q.options[k]);
  const said = a ? 'Answered: ' + (a.choice === 'note' ? '' : '(' + a.choice + ') ' + ((q.options || {})[a.choice] || '')) + (a.note ? ' “' + a.note + '”' : '') : '';
  return cardBlock_({ type: 'group', look: 'oq-item', attrs: { 'data-oq': q.id }, blocks: [
    { type: 'group', tag: 'p', look: 'oq-q', inner: (q.philosophy ? qtag_('Philosophy') + ' ' : '') + esc(q.question) },
    { type: 'tiles', tiles: opts.map(k => ({ form: true, kind: a && a.choice === k ? '' : 'quiet', label: k + ') ' + q.options[k], act: 'oq-answer', data: { id: q.id, choice: k } })) },
    { type: 'field', blocks: [{ type: 'control', tag: 'input', attrs: { type: 'text', 'data-oq-note': true, value: (a && a.note) || '', placeholder: 'Something else…', maxlength: 500,
      'aria-label': q.question + ' — something else', autocomplete: 'off' } }] },
    { type: 'tiles', tiles: [{ form: true, kind: 'quiet', label: 'Send note', act: 'oq-answer', data: { id: q.id, choice: 'note' } }] },
    { type: 'group', tag: 'p', look: 'me-said oq-said', text: said || '\u00a0' }] });
}
/* THE INBOX: the five open questions that settle most (philosophy first, then `settles`, then file order); answered fold away. */
const OQ_SHOWN = 5;
const oqDone_ = q => q.status === 'answered' || !!(OQ.answers || {})[q.id];
const oqWeight_ = q => (q.philosophy ? 100 : 0) + (Number(q.settles) || 0);
function oqInbox_() {
  if (!OQ.list) { oqStart_(); return cardBlock_({ type: 'group', tag: 'h4', text: 'Owner questions' }) + (typeof loading_ === 'function' ? loading_() : ''); }
  const open = OQ.list.filter(q => !oqDone_(q)).map((q, i) => ({ q, i })).sort((x, y) => oqWeight_(y.q) - oqWeight_(x.q) || x.i - y.i).map(x => x.q);
  const done = OQ.list.filter(oqDone_);
  return cardBlocks_([{ type: 'group', tag: 'h4', text: 'Owner questions · ' + open.length + ' open' + (open.length > OQ_SHOWN ? ', ' + OQ_SHOWN + ' shown' : '') },
    OQ.error ? { type: 'group', tag: 'p', look: 'me-said', text: OQ.error } : null]) + open.slice(0, OQ_SHOWN).map(oqItem_).join('')
    + (done.length ? cardBlock_({ type: 'group', tag: 'details', look: 'oq-done', blocks: [{ type: 'group', tag: 'summary', text: 'Answered · ' + done.length }], inner: done.map(oqItem_).join('') }) : '');
}

/* THE ONE CARD (rule 1.75, no scores): the owner's inbox, then What's missing. */
function checksInner_() {
  return cardBlocks_([{ type: 'group', look: 'qtags', inner: qtag_('Business') + qtag_('Admin only') }, { type: 'msgHead', text: 'Owner questions' }]) + oqInbox_();
}
function checksCard_() {
  if (!(typeof may_ === 'function' && may_('admin'))) return '';
  let more = '';
  try { more = typeof missingCard_ === 'function' && missingFor_() ? missingCard_() : ''; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'checks detail'); }
  return card_(cardBlock_({ type: 'group', look: 'checks-card', attrs: { 'data-checks': true }, inner: checksInner_() }) + more);
}
const checksDraw_ = () => { document.querySelectorAll('[data-checks]').forEach(c => { cardFill_(c, checksInner_()); }); };

on('oq-answer', el => {
  if (!may_('admin')) return;
  const id = el.dataset.id, choice = el.dataset.choice, box = el.closest('.oq-item');
  if (!box || !OQ.answers) { toast(text_('the-answers-are-still-on-their')); return; }
  const note = String((box.querySelector('[data-oq-note]') || {}).value || '').trim();
  if (choice === 'note' && !note) { toast(text_('write-the-note-first')); return; }
  send_({ action: 'saveItem', item: 'ownerAnswer', name: USER && USER.name, id, choice, note },
        { button: el, where: box.querySelector('.oq-said'), busy: 'Saving…' })
    .then(d => { OQ.answers[id] = (d && d.answer) || { id, choice, note }; checksDraw_(); })
    .catch(() => { /* send_ already said why in the line */ });
});

/* CHECKS REGISTERS ITSELF as a health card (`healthCardOf_`, missing.js) once every file has run, whatever the load order. */
setTimeout(() => { if (typeof HEALTH_MORE_ !== 'undefined') HEALTH_MORE_.checks = checksCard_; }, 0);

;
/* ==== js/games.js ==== */
/* @family. — games.js THE CONSOLE AND THE WORD GAMES (owner, 12 Nov: back under Games in Find), from the games.js of docs/history/1110. */


/* ---------- TIMES TABLES SPRINT § */
/* THE SPRINT IN PLAY, or null between rounds. */
let ttState = null;
const ttQuestion = () => ({ a: 1 + Math.floor(Math.random() * 12),
                            b: 1 + Math.floor(Math.random() * 12) });

function ttAsk() {
  ttState.cur = ttQuestion();
  const q = $('tt-q');
  if (q) q.textContent = `${ttState.cur.a} × ${ttState.cur.b}`;
}

function startTimesTables() {
  if (!$('tt-q')) return;
  clearInterval(ttState && ttState.timer);     // a second Start must not run two clocks
  ttState = { score: 0, left: 60, cur: ttQuestion(), timer: null, asked: 0 };

  $('tt-idle')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
  $('tt-question')?.classList.remove('hidden');   // the line that was missing entirely
  $('tt-score').textContent = '0';
  $('tt-time').textContent = '60';
  $('tt-feedback').textContent = '';
  ttAsk();

  const input = $('tt-answer');
  input.value = '';
  kpRender_(input);
  input.focus();

  ttState.timer = setInterval(() => {
    if (!ttState) return;
    ttState.left--;
    const t = $('tt-time');
    if (t) { t.textContent = ttState.left; t.classList.toggle('bad', ttState.left <= 10); }
    if (ttState.left <= 0) endTimesTables();
  }, 1000);

  /* Checked on every keystroke, with no Enter to press. § */
  input.oninput = () => {
    if (!ttState) return;
    /* Named `answer`, not `val`. There is a global `val()` that reads an input by id, and a local
       shadowing it inside a function that also reads inputs is a trap set for whoever edits this
       next. */
    const answer = parseInt(input.value, 10);
    if (isNaN(answer)) return;
    if (answer === ttState.cur.a * ttState.cur.b) {
      ttState.score++;
      ttState.asked++;
      $('tt-score').textContent = ttState.score;
      $('tt-feedback').textContent = '✓';
      ttAsk();
      input.value = '';
      kpRender_(input);
    }
  };
}

/**
 * SIXTY SECONDS, UP. Called by the clock and by the give-up button, and safe to call twice —
 * the interval is cleared first, so a tap landing in the same tick as the timeout cannot run
 * this over the top of itself.
 */
/* The screen is redrawn every time Arcade is opened, so the sprint starts again from its idle state — and a clock left running behind a screen that no longer has § */
function initTables() {
  if (!$('tt-idle')) return;
  if (ttState) { clearInterval(ttState.timer); ttState = null; }
  $('tt-idle')?.classList.remove('hidden');
  $('tt-question')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
}
/* START, AGAIN AND GIVE UP: the sprint's buttons had no handler when games.js came back (12 Nov). */
on('tt-begin', () => startTimesTables());
on('tt-stop', () => endTimesTables());

function endTimesTables() {
  if (!ttState) return;
  clearInterval(ttState.timer);
  const score = ttState.score;
  ttState = null;

  /* NO BOARD AND NO KEPT BEST (rule 1.53): the round says how many were right, and nothing is saved. */
  $('tt-question')?.classList.add('hidden');
  const over = $('tt-over');
  if (over) {
    over.classList.remove('hidden');
    over.innerHTML = `
      <p class="mono tt-big">${score}</p>
      <p class="note game-said">${score === 0 ? 'None. It happens — try a slower start.' : score + ' right.'}</p>
      ${tile_({ form: true, look: `btn`, attrs: `data-do="tt-begin"`, html: `Again` })}`;
  }
}

/* ---------- HERD MENTALITY § */
const HERD_BUILTIN = [
  'Name something you would find in a school bag.',
  'Name a subject that should not exist.',
  'Name something that is always late.',
  'Name a snack that is worth the money.',
  'Name something you would take to a desert island.',
  'Name an animal that would be rubbish as a pet.',
  'Name something everybody says they will do and nobody does.',
  'Name the best day of the week.',
  'Name something that is better cold than hot.',
  'Name a smell that reminds you of school.',
  'Name something you always lose.',
  'Name a film everybody has seen.',
  'Name something that is harder than it looks.',
  'Name a word people spell wrong.',
  'Name something you would never share.',
  'Name a place that is always too cold.',
  'Name something that takes far too long.',
  'Name a sound that makes everybody look up.',
  'Name something you own too many of.',
  'Name a rule everybody breaks.',

  /* ---------- AND EIGHTY MORE, SO THE DECK IS A HUNDRED — AND FOUR HUNDRED MORE AT THE FOOT -- § */
  'Name a biscuit.', 'Name a flavour of crisps.', 'Name something people put on toast.',
  'Name a sandwich filling.', 'Name a vegetable children leave on the side of the plate.',
  'Name a topping on a pizza.', 'Name something people put on chips.',
  'Name a pudding that is better with custard.', 'Name a drink for a cold day.',
  'Name a food that is better the next day.',
  'Name something you would never eat for breakfast.', 'Name something that melts too quickly.',
  'Name an animal you would see at the zoo.', 'Name a bird you see in a garden.',
  'Name an animal that is faster than you.', 'Name a farm animal.', 'Name a sea creature.',
  'Name something a dog does that a cat never would.',
  'Name something a teacher says every day.', 'Name something everybody wants the last one of.',
  'Name something you are not allowed to bring into school.',
  'Name a PE activity nobody looks forward to.',
  'Name something every classroom has on the wall.', 'Name an excuse for late homework.',
  'Name something that happens on the last day of term.',
  'Name something sold at a school fair.', 'Name something written on a whiteboard.',
  'Name something everybody borrows and never gives back.',
  'Name a chore nobody volunteers for.', 'Name something found down the back of a sofa.',
  'Name something everybody keeps in a kitchen drawer.',
  'Name something that is always running out.', 'Name a noise a house makes at night.',
  'Name something you would find in a shed.',
  'Name something that only works if you give it a thump.',
  'Name something you would use to prop a door open.', 'Name something you do before bed.',
  'Name something that makes a room feel cosy.', 'Name something the weather ruins.',
  'Name something you need when it rains.', 'Name a month with nothing good in it.',
  'Name something you would find on a British beach.', 'Name something you do on a wet Sunday.',
  'Name a kind of shop on every high street.', 'Name something you see from a bus window.',
  'Name something that is always too hot to eat straight away.',
  'Name something you hear at a railway station.', 'Name something that only happens in summer.',
  'Name something you pack and never use.', 'Name a way to pass the time on a long journey.',
  'Name something that goes wrong on a car journey.', 'Name something you would take camping.',
  'Name a country with better weather than here.', 'Name a way to travel.', 'Name a board game.',
  'Name a playground game.', 'Name a sport played with a ball.',
  'Name something you only ever use once a year.', 'Name a card game.',
  'Name something that is always missing a piece.',
  'Name an instrument that is loud to practise.', 'Name something that takes ages to dry.',
  'Name a number between one and ten.', 'Name something that is always covered in fingerprints.',
  'Name a fairy tale.', 'Name a nursery rhyme.', 'Name a superhero.',
  'Name something that is always tangled.', 'Name a job that starts very early.',
  'Name something that is impossible to open.', 'Name something that is always sticky.',
  'Name something that is never as good as the advert.',
  'Name something that is never charged when you need it.', 'Name something in a first aid kit.',
  'Name something everybody pretends to enjoy.',
  'Name something people say when they are not listening.',
  'Name a phrase adults use far too often.', 'Name something you cannot do quietly.',
  'Name something that is worth queueing for.', 'Name something that is easier with two people.',
  'Name something yellow.', 'Name something round.', 'Name a fruit you would find in a lunchbox.',
  'Name something you eat with a spoon.', 'Name something you eat with your hands.',
  'Name a breakfast cereal.', 'Name a flavour of ice cream.', 'Name a kind of cake.',
  'Name something you would find at a birthday party.', 'Name something you blow.',
  'Name something that bounces.', 'Name something that floats.', 'Name something that sinks.',
  'Name something that rolls.', 'Name something with wheels.', 'Name something with wings.',
  'Name something with a tail.', 'Name something with stripes.', 'Name something with buttons.',
  'Name something with a lid.', 'Name something with a handle.', 'Name something with keys.',
  'Name something that beeps.', 'Name something that ticks.', 'Name something that buzzes.',
  'Name something that rings.', 'Name something that squeaks.',
  'Name something that smells horrible.', 'Name something that is soft.',
  'Name something that is prickly.', 'Name something that is slimy.',
  'Name something that is shiny.', 'Name something that is heavy.',
  'Name something that is very light.', 'Name something that is cold to touch.',
  'Name something that is very quiet.', 'Name something that is very small.',
  'Name something that is enormous.', 'Name something that is very long.',
  'Name something that is always wet.', 'Name something that is red.',
  'Name something that is blue.', 'Name something that is orange.', 'Name something that is purple.',
  'Name something that is black and white.', 'Name something that is brown.',
  'Name something made of wood.', 'Name something made of glass.', 'Name something made of plastic.',
  'Name something made of metal.', 'Name something made of rubber.', 'Name something you can fold.',
  'Name something you can pour.', 'Name something you can squeeze.', 'Name something you can climb.',
  'Name something you can throw.', 'Name something you can catch.', 'Name something you can ride.',
  'Name something you can plant.', 'Name something you can wear on your head.',
  'Name something you can wear on your feet.', 'Name something you wear to the beach.',
  'Name something people wear to a wedding.', 'Name something you wear to bed.',
  'Name a part of your face.', 'Name a part of your body that you have two of.',
  'Name something you do with your feet.', 'Name something you do when you are bored.',
  'Name something you do when you are nervous.', 'Name something you do when you are happy.',
  'Name something you do in the bath.', 'Name something you do at the park.',
  'Name something you do at the beach.', 'Name something you do in the snow.',
  'Name something you do on a sunny day.', 'Name something you do at a sleepover.',
  'Name something you do after school.', 'Name something you do on your birthday.',
  'Name something you do when you cannot sleep.', 'Name something that makes you laugh.',
  'Name something that makes you sneeze.', 'Name something that makes you jump.',
  'Name something that makes you yawn.', 'Name something that makes you hungry.',
  'Name something that makes you thirsty.', 'Name something that is scary in the dark.',
  'Name something that is fun to do with a friend.', 'Name something you find in a fridge.',
  'Name something you find in a bathroom.', 'Name something you find in a garden.',
  'Name something you find in a park.', 'Name something you find in a playground.',
  'Name something you find in a library.', 'Name something you find in a hospital.',
  'Name something you find at a funfair.', 'Name something you find in a forest.',
  'Name something you find in the sky.', 'Name something you find under the sea.',
  'Name something you find in space.', 'Name something you find in a castle.',
  'Name something you find in a toy box.', 'Name something you find in a toolbox.',
  'Name something you find in a handbag.', 'Name something you find in your pocket.',
  'Name something you find in a classroom.', 'Name something you find in a sports bag.',
  'Name something you find on a desk.', 'Name something you find on a Christmas tree.',
  'Name something you find at a bus stop.', 'Name something you find in a cinema.',
  'Name something you find in a swimming pool.', 'Name something you find at a football match.',
  'Name something you find on a pirate ship.', 'Name something you find in a haunted house.',
  'Name something you find in a spaceship.', 'Name an animal that lives in the jungle.',
  'Name an animal that lives in the Arctic.', 'Name an animal that lives in a tree.',
  'Name an animal that can swim.', 'Name an animal that can climb.', 'Name an animal that hops.',
  'Name an animal that is very slow.', 'Name an animal that is very small.',
  'Name an animal with a long neck.', 'Name an animal with a long tail.',
  'Name an animal with big ears.', 'Name an animal that is black and white.',
  'Name an animal people are scared of.', 'Name an animal that sleeps all day.',
  'Name an animal you might see in a garden.', 'Name an animal in a nursery rhyme.',
  'Name a baby animal.', 'Name an insect.', 'Name a creepy-crawly.', 'Name a dinosaur.',
  'Name a dog\'s name.', 'Name a cat\'s name.', 'Name a name for a goldfish.',
  'Name something a dog chews.', 'Name something a cat chases.', 'Name a job where you help people.',
  'Name a job where you work outside.', 'Name a job where you work with animals.',
  'Name a job you would like to try for a day.', 'Name a job in a hospital.',
  'Name a job in a school.', 'Name a job where you drive.', 'Name a job on a film set.',
  'Name a famous wizard.', 'Name a famous bear.', 'Name a famous mouse.', 'Name a famous pig.',
  'Name a famous duck.', 'Name a cartoon character.', 'Name a character from a fairy tale.',
  'Name a baddie from a film.', 'Name a princess.', 'Name a monster.', 'Name a robot from a film.',
  'Name a character in a Christmas story.', 'Name a Roald Dahl book.',
  'Name a film with animals in it.', 'Name a film that makes people cry.',
  'Name a film with a song everybody knows.', 'Name a TV show for children.',
  'Name a cartoon on TV.', 'Name a song everybody knows the words to.',
  'Name a song you sing at a party.', 'Name a dance.', 'Name a musical instrument you blow.',
  'Name a musical instrument with strings.', 'Name a sport you do in water.',
  'Name a sport you do on your own.', 'Name a sport with a net.', 'Name a sport in the Olympics.',
  'Name a sport people watch on TV.', 'Name a football team.', 'Name something a footballer does.',
  'Name something at sports day.', 'Name a game you play in the car.',
  'Name a game you play at Christmas.', 'Name a game you play with dice.',
  'Name a game with a chasing part.', 'Name a toy that needs batteries.',
  'Name a toy that is older than you.', 'Name a type of puzzle.', 'Name something you build with.',
  'Name something you colour with.', 'Name something you draw.', 'Name something that has a face but is not a person.',
  'Name a number people think is lucky.', 'Name a number bigger than a hundred.',
  'Name a word that rhymes with light.', 'Name a word that starts with Z.',
  'Name a word that means big.', 'Name a word that means happy.', 'Name a word you shout.',
  'Name something you say on the phone.', 'Name something you say when you meet someone.',
  'Name something you say when you are sorry.', 'Name something you say when you hurt yourself.',
  'Name something parents say too often.', 'Name something children say too often.',
  'Name something teachers say when it is noisy.', 'Name something you say at the dinner table.',
  'Name a way to say hello.', 'Name a greeting in another language.', 'Name a country.',
  'Name a country in Europe.', 'Name a famous building.', 'Name a place people visit in London.',
  'Name a planet.', 'Name something in the solar system.', 'Name something about the Moon.',
  'Name something you see in winter.', 'Name something you see in spring.',
  'Name something you see in autumn.', 'Name something you do on a bike.', 'Name a day people look forward to.',
  'Name something you celebrate.', 'Name a festival.', 'Name something you eat at a party.',
  'Name something you eat on bonfire night.', 'Name something you eat at the cinema.',
  'Name something you eat at the seaside.', 'Name something you eat for lunch.',
  'Name something you eat for tea.', 'Name something you eat cold.', 'Name something you dip.',
  'Name something you peel.', 'Name something you crunch.', 'Name something you bake.',
  'Name something you fry.', 'Name something you boil.', 'Name something you grate.',
  'Name something you put in soup.', 'Name something you put in a smoothie.',
  'Name something you put on a pizza that is a bit odd.', 'Name something you put in a pie.',
  'Name something on a burger.', 'Name a fruit.', 'Name a vegetable.', 'Name a berry.',
  'Name a nut.', 'Name something made from eggs.', 'Name something made from milk.',
  'Name something made from flour.', 'Name something made with chocolate.', 'Name a crunchy snack.',
  'Name a drink.', 'Name a juice.', 'Name a sauce.', 'Name something that is sour.',
  'Name something that is salty.', 'Name something that is sweet.',
  'Name a food that is bright green.', 'Name a food that is white.', 'Name a food children hate.',
  'Name a food people argue about.', 'Name something that goes with fish.',
  'Name something that goes with beans.', 'Name something in a picnic basket.',
  'Name a room in a house.', 'Name something in a bedroom.', 'Name something in a kitchen.',
  'Name something in a living room.', 'Name something on a wall.', 'Name something on a shelf.',
  'Name something in a cupboard.', 'Name something under a bed.',
  'Name something by the front door.', 'Name something you plug in.',
  'Name something that needs batteries.', 'Name something with a switch.',
  'Name something that goes round and round.', 'Name something that goes up and down.',
  'Name something that opens and shuts.', 'Name something you turn.', 'Name something you push.',
  'Name something you press.', 'Name something you tie.', 'Name something you zip.',
  'Name something you wash.', 'Name something you fix.', 'Name something you share.',
  'Name something you collect.', 'Name something you count.', 'Name something you keep in a box.',
  'Name something you keep in your bag.', 'Name something you keep in a drawer.',
  'Name something you forget to bring.', 'Name something you lose at school.',
  'Name something that breaks easily.', 'Name something that gets dirty quickly.',
  'Name something that goes mouldy.', 'Name something that needs a password.',
  'Name something that is hard to carry.', 'Name something that is hard to draw.',
  'Name something that is hard to spell.', 'Name something that is hard to say.',
  'Name something that is easy to learn.', 'Name something you learn in primary school.',
  'Name something you learn to do as a baby.', 'Name something you learn to ride.',
  'Name a times table people find hard.', 'Name a school subject with lots of homework.',
  'Name something in a science lab.', 'Name something you do in art.',
  'Name something you do in music.', 'Name something you learn in history.',
  'Name something you learn in geography.', 'Name a school rule.', 'Name a school club.',
  'Name something in a school assembly.', 'Name something teachers carry.',
  'Name a reason to go to the office at school.', 'Name something that happens on a snow day.',
  'Name something you see on the way to school.', 'Name something in a fairy tale forest.',
  'Name something a witch has.', 'Name something a pirate has.', 'Name something a knight has.',
  'Name something a clown has.', 'Name something a chef has.', 'Name something a doctor has.',
  'Name something a builder has.', 'Name something a firefighter has.',
  'Name something a baby needs.', 'Name something a dog needs.', 'Name something a snowman has.',
  'Name something a superhero wears.', 'Name something the tooth fairy leaves.',
  'Name something the Easter bunny brings.', 'Name something on a birthday cake.',
  'Name something in a party bag.', 'Name a fancy dress costume.',
  'Name something scary at Halloween.', 'Name something you see at a firework display.',
  'Name something you see at a circus.', 'Name something you see at the aquarium.',
  'Name something you see at a train station.', 'Name something you see in a garden centre.',
  'Name something you see at the vet.', 'Name something you see in the countryside.',
  'Name something you see on a motorway.', 'Name something you see in a river.',
  'Name something you see at night.', 'Name something you hear in the morning.',
  'Name something you hear at the seaside.', 'Name something you hear in a classroom.',
  'Name something you hear in a kitchen.', 'Name something you hear at a football match.',
  'Name something that comes in pairs.', 'Name something that comes in a tin.',
  'Name something that comes in a jar.', 'Name something that comes in a box.',
  'Name something that has a hole in it.', 'Name something that has a lot of legs.',
  'Name something that has feathers.', 'Name something that has scales.',
  'Name something that has a shell.', 'Name something that grows.', 'Name something that shrinks.',
  'Name something that changes colour.', 'Name something that goes pop.',
  'Name something that goes bang.', 'Name something that falls from the sky.',
  'Name something that flies.', 'Name something that swims.', 'Name something that crawls.',
  'Name something that glows in the dark.', 'Name something that is always cold.',
  'Name something that is always hot.', 'Name something that is always changing.',
  'Name something that is always full.', 'Name something that is always empty.',
  'Name something you should not touch.', 'Name something you should never run with.',
  'Name something you should always wash.', 'Name something that is good for you.',
  'Name something that keeps you warm.', 'Name something that keeps you cool.',
  'Name something that keeps you dry.', 'Name something that wakes you up.',
  'Name something that cheers you up.', 'Name something you do to get fit.',
  'Name something you do to relax.', 'Name something that is nice to give.',
  'Name something that is nice to hear.', 'Name something that is nice to smell.',
  'Name a way to say thank you.', 'Name a way to make a friend.', 'Name a good name for a robot.',
  'Name a good name for a dragon.', 'Name a good name for a unicorn.',
  'Name a good name for a spaceship.', 'Name a good name for a band.',
  'Name a good name for a café.', 'Name a good name for a school hamster.',
  'Name a good name for a new sweet.'
];

let herd = null;

/* FISHER–YATES, NOT `sort(() => Math.random() - 0.5)`. § */
function herdShuffle_(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function herdPack_() {
  /* THE SHEET FIRST, AND ONLY IF IT SAYS ANYTHING. § */
  const rows = ((typeof DATA !== 'undefined' && DATA.herd) || [])
    .filter(r => r && r.active !== false && String(r.question || '').trim())
    .map(r => String(r.question).trim());
  return rows.length ? rows : HERD_BUILTIN;
}

/* ---------- THERE IS NO ROUND, AND THERE NEVER SHOULD HAVE BEEN ONE § */
function initHerd() {
  if (!$('herd-q')) return;
  herd = { pack: herdShuffle_(herdPack_()), at: 0 };
  herdPaint();
}

function herdPaint() {
  const q = $('herd-q');
  if (!q || !herd) return;
  q.textContent = herd.pack[herd.at] || '';
}

on('herd-next', () => {
  if (!herd) return;
  herd.at++;
  /* RESHUFFLED WHEN IT RUNS OUT, silently. Nothing says so, because nothing needs to: five hundred
     questions later is not a moment anybody is keeping track of. */
  if (herd.at >= herd.pack.length) {
    herd.pack = herdShuffle_(herdPack_());
    herd.at = 0;
  }
  herdPaint();
});

/* SENTENCE SCRAMBLE — the words of one sentence, cut up and shuffled; tap them back into order. § */
const SS_BANDS = [['KS2', 'KS2 · ages 7–11'], ['KS3', 'KS3 · ages 11–14'], ['KS4', 'KS4 · GCSE']];

const SS_SENTENCES = {
  /* KS2 — simple and compound sentences, fronted adverbials with their comma, relative clauses,
     apostrophes, questions, commands and exclamations: what the Year 3–6 grammar list asks for. */
  KS2: [
    'My sister plays the piano every evening.',
    'The hungry fox crept towards the henhouse.',
    'We packed our bags because the bus was leaving early.',
    'After lunch, the children played football on the field.',
    'Can you pass me the salt, please?',
    'Remember to close the door when you leave.',
    'What a beautiful rainbow that is!',
    'The boy who lost his shoe hopped all the way home.',
    'Our class visited the museum, which was full of dinosaur bones.',
    'Mum’s car would not start this morning.',
    'The dog’s tail wagged when he saw his lead.',
    'Although it was raining, we went for a walk.',
    'I could not sleep, so I read my book.',
    'The swimmers dived into the pool at the sound of the whistle.',
    'Please wash your hands before dinner.',
    'The children’s paintings were hung in the hall.',
    'If you are tired, you should go to bed.',
    'Grandpa told us a story about a dragon.',
    'The cake, which Dad baked, was delicious.',
    'Our teacher smiled because everyone had finished their work.',
    'Have you ever seen a shooting star?',
    'The kite flew high above the trees.',
    'Lily’s brother is taller than her.',
    'The farmer fed the pigs before breakfast.',
    'Carefully, she carried the eggs across the kitchen.',
    'There are seven days in a week.',
    'Tom kicked the ball and it smashed the window.',
    ['The baby giggled when the puppy licked her face.',
     'The puppy giggled when the baby licked her face.'],
    'We will visit our cousins in the summer holidays.',
    'My favourite subject at school is science.',
    'The moon lit up the path through the woods.',
    'When the bell rang, everyone rushed outside.',
    'Have you finished your homework yet?',
    'The giant’s footsteps shook the ground.',
    'Stop running in the corridor!',
    'Ben, who is my best friend, lives next door.',
    'The flowers grew tall because they had lots of sunshine.',
    'She wasn’t hungry, so she didn’t eat her lunch.',
    'Owls hunt for mice at night.',
    'The pirate buried his treasure on a deserted island.',
    'I’ve lost my pencil case again!',
    'The bus driver waited for the last passenger.',
    'Despite the wind, the boat reached the harbour safely.',
    'Those muddy boots belong to my dad.',
    'A spider spun a web in the corner of the room.',
    'We clapped at the end of the show.',
    'Where did you put the scissors?',
    'The rabbit hopped out of its burrow and sniffed the air.',
    'Everyone cheered as the winner crossed the line.',
    'My grandma knits warm jumpers for the whole family.',
    'The library is closed on Sundays.',
    'Because he was late, Sam ran to school.',
    'The ice cream melted in the hot sun.',
    'Our neighbour’s cat climbed onto the shed roof.',
    'How many legs does a spider have?',
    'The knight drew his sword and charged at the dragon.',
    'Mum asked me to tidy my bedroom.',
    ['The leaves turn orange and fall in autumn.', 'The leaves fall and turn orange in autumn.'],
    'It was so cold that the pond froze.',
    'The hedgehog curled into a tight ball.',
    'Did you remember to feed the fish?',
    'Running across the playground, Mia tripped over her laces.',
    'The postman left a parcel by the front door.',
    'Is it your turn to walk the dog?',
    'The tallest tower in the city has fifty floors.',
    'Wait for the green man before you cross.',
  ],
  /* KS3 — subordinate and relative clauses, the passive, conditionals, semicolons, inversion for
     emphasis, and lists with their commas. */
  KS3: [
    'The cake sank because the oven had not been heated properly.',
    'Having finished the race, the runners collapsed onto the grass.',
    'The castle, which was built in 1066, still stands today.',
    'If I had known about the party, I would have come.',
    'The novel was written by a teenager in just six weeks.',
    'She was nervous; nevertheless, she stepped onto the stage.',
    'Not only did he win, but he also broke the record.',
    'The volcano erupted without warning, destroying several villages.',
    'Although the film was long, nobody in the audience left early.',
    'The detective examined the footprints that had been left in the mud.',
    'Climate change is affecting wildlife all over the world.',
    'My uncle, a keen gardener, grows his own vegetables.',
    'Whoever finishes first will receive a prize.',
    'The students were told to bring a calculator and a ruler.',
    'Unless you apologise, she will never speak to you again.',
    'The bridge, which had stood for centuries, collapsed in the flood.',
    'Rarely have I seen such a spectacular sunset.',
    'The ancient Egyptians built pyramids as tombs for their kings.',
    'We could hear the waves crashing against the rocks below.',
    'The scientist, who had worked through the night, made a breakthrough.',
    'Despite being injured, the goalkeeper refused to leave the pitch.',
    ['The museum is closed while the new gallery is being built.',
     'The new gallery is closed while the museum is being built.'],
    'Tired and hungry, the explorers set up camp for the night.',
    'The more you practise, the better you become.',
    'Shakespeare wrote many of his plays for the Globe Theatre.',
    'The puppy, which had been abandoned, was adopted by a kind family.',
    'As soon as the alarm sounded, the building was evacuated.',
    'The witness claimed that she had seen a man running away.',
    ['Plants need light, water and carbon dioxide to grow.',
     'Plants need light, carbon dioxide and water to grow.'],
    'The teacher, smiling, handed back the test papers.',
    ['Neither the coach nor the players expected the result.',
     'Neither the players nor the coach expected the result.'],
    'The village was cut off after heavy snow blocked the roads.',
    'Some people believe that the house is haunted.',
    'The athlete trained every day so that she could compete in the Olympics.',
    'Wearing a disguise, the spy slipped past the guards.',
    'The town’s oldest resident celebrated her hundredth birthday.',
    'It is important to drink plenty of water during exercise.',
    'The storm had passed, but fallen trees blocked every road.',
    'When the curtain rose, the audience fell silent.',
    'The fossil, discovered by a schoolgirl, is millions of years old.',
    ['You should revise regularly rather than cramming the night before.',
     'You should regularly revise rather than cramming the night before.'],
    'The cheetah is the fastest land animal in the world.',
    'Should you need any help, please ask a member of staff.',
    'The ship sank after it struck an iceberg.',
    ['Many of the trees in the forest were planted a century ago.',
     'Many of the trees were planted in the forest a century ago.'],
    'The company apologised for the delay and offered a refund.',
    'Having read the instructions, I assembled the bookshelf.',
    'There is no evidence that the vaccine causes harm.',
    'The poem describes a soldier’s memories of the war.',
    'Because the river had flooded, the match was postponed.',
    'The headteacher announced that the school would close early.',
    'Hardly anyone noticed when the lights went out.',
    'The recipe calls for two eggs, flour and a pinch of salt.',
    'The orchestra played so beautifully that some people cried.',
    'Our planet is the only one known to support life.',
  ],
  /* KS4 — the sentences a GCSE essay is built from: participle and absolute phrases, the subjunctive,
     inversion after a negative, colons and semicolons, and the vocabulary of literature and science
     answers. */
  KS4: [
    'Had the government acted sooner, thousands of lives might have been saved.',
    'The evidence suggests that the fire was started deliberately.',
    'Macbeth’s ambition, fuelled by the witches’ prophecy, leads to his downfall.',
    'It is essential that every student submit their coursework on time.',
    'The writer uses pathetic fallacy to reflect the character’s despair.',
    'Not until the final chapter is the murderer’s identity revealed.',
    'Social media, despite its benefits, can have a harmful effect on teenagers.',
    ['The results were inconclusive; further research is therefore required.',
     'The results were inconclusive; therefore further research is required.'],
    ['Whereas the first poem celebrates nature, the second presents it as threatening.',
     'Whereas the second poem celebrates nature, the first presents it as threatening.'],
    'Scrooge, once bitter and lonely, is transformed by the end.',
    'The protesters demanded that the factory be closed immediately.',
    'Only by working together can we solve the climate crisis.',
    'The narrator’s use of the first person creates a sense of intimacy.',
    'Inflation rose sharply, causing the price of food to increase.',
    'Were the bridge to collapse, the town would be cut off completely.',
    'The data, which was collected over ten years, reveals a clear trend.',
    'Although she was offered a promotion, she chose to retire.',
    'The author presents the city as a place of danger and corruption.',
    'The candidate who receives the most votes will become mayor.',
    'Language is constantly evolving, as new words enter everyday use.',
    'The theme of isolation is explored throughout the play.',
    'Under no circumstances should the fire doors be left open.',
    'The reaction speeds up when the temperature is increased.',
    'In the final stanza, the speaker reflects on what has been lost.',
    'Priestley uses the Inspector as a mouthpiece for his own views.',
    'The industrial revolution transformed the way people lived and worked.',
    'So convincing was his argument that the jury acquitted him.',
    ['The juxtaposition of light and dark highlights the contrast between good and evil.',
     'The juxtaposition of dark and light highlights the contrast between good and evil.'],
    'What the tragedy ultimately reveals is the destructive power of jealousy.',
    'Exercise not only improves fitness but also reduces stress.',
    'The colonies gained independence after decades of resistance.',
    'Despite repeated warnings, the climbers continued towards the summit.',
    'Her refusal to conform makes her a symbol of rebellion.',
    'The lower the temperature, the slower the particles move.',
    'Having been rejected by society, the creature seeks revenge.',
    'It could be argued that the ending is deliberately ambiguous.',
    'The report, published last week, criticises the government’s response.',
    'Never before had the village witnessed such a celebration.',
    'The metaphor suggests that memory is both fragile and precious.',
    'Carbon dioxide is released when fossil fuels are burned.',
    'If the treaty had been signed, the war might have been avoided.',
    'The speaker’s tone shifts from anger to acceptance.',
    'Unemployment, which had been falling, began to rise again.',
    'The poet’s use of enjambment mirrors the flow of the river.',
    'Tybalt’s death marks the turning point of the play.',
    'Antibiotics are ineffective against viruses because viruses lack cells.',
    'To what extent is Lady Macbeth responsible for the murder?',
    'The government introduced the policy, hoping to reduce traffic.',
    'The setting, a remote island, heightens the sense of danger.',
    'Few could have predicted how quickly the empire would fall.',
    'Although widely praised, the film failed to make a profit.',
    'The second law of thermodynamics states that entropy always increases.',
  ],
};

/* THE WORDS OF AN ENTRY, AS CHIPS. Split on spaces and nothing else, so a comma or a full stop stays
   on the word it was printed against — which is what a strip of cut paper does. */
function ssOrders_(entry) {
  return (Array.isArray(entry) ? entry : [entry]).map(s => String(s).trim().split(/\s+/));
}

/* RIGHT IF IT IS ANY OF THE STATED ORDERS, compared word by word as TEXT rather than chip by chip, so
   two chips that both say "the" are interchangeable — which they are on paper too. */
function ssRight_(entry, words) {
  const got = (words || []).join(' ');
  return ssOrders_(entry).some(o => o.join(' ') === got);
}

/* HOW MANY WORDS FROM THE START ARE RIGHT, against whichever stated order agrees for longest. That is
   the one hint the card gives, and it is the one a teacher gives: "you're right up to here". */
function ssPrefix_(entry, words) {
  let best = 0;
  ssOrders_(entry).forEach(o => {
    let n = 0;
    while (n < o.length && n < words.length && o[n] === words[n]) n++;
    if (n > best) best = n;
  });
  return best;
}

/* ONE PILE PER BAND, dealt from the top and shuffled again when it runs out — the promise `impDraw_`
   makes: no sentence comes round twice until the band has. */
const SS_PILE = {};
function ssDraw_(band) {
  const list = SS_SENTENCES[band] || SS_SENTENCES.KS2;
  if (!SS_PILE[band] || !SS_PILE[band].length) SS_PILE[band] = herdShuffle_(list.map((_, i) => i));
  return list[SS_PILE[band].pop()];
}

function ssBand_(b) {
  if (b !== undefined) {
    try { localStorage.setItem('ss-band', b); } catch (e) {}
    return b;
  }
  let v = 'KS2';
  try { v = localStorage.getItem('ss-band') || 'KS2'; } catch (e) {}
  return SS_SENTENCES[v] ? v : 'KS2';
}

let SS = null;

/* SHUFFLED UNTIL IT IS NOT ALREADY RIGHT. A deal that came out in order is a sentence handed over
   solved, and with five words that is one deal in a hundred and twenty. */
function ssDeal_(band) {
  const entry = ssDraw_(band);
  const words = ssOrders_(entry)[0];
  let chips = herdShuffle_(words);
  for (let i = 0; i < 20 && ssRight_(entry, chips); i++) chips = herdShuffle_(words);
  SS = { band: band, entry: entry, chips: chips, picked: [], verdict: '', said: '' };
}

/* DRAWN FROM THE STATE, the `REEL_HELD` rule, and EVERY CONTROL IS BUILT HERE — the Scrabble
   lesson: Check is not on the page until there is a sentence to check. */
function ssPaint() {
  const box = $('ss-box'), said = $('ss-said'), sel = $('ss-level');
  if (!box || !SS) return;
  if (sel) sel.value = SS.band;
  const right = SS.verdict === 'right';
  const words = SS.picked.map(i => SS.chips[i]);
  const all = SS.picked.length === SS.chips.length;
  box.innerHTML = `<p class="ss-built${right ? ' is-right' : ''}${SS.verdict === 'wrong' ? ' is-wrong' : ''}">`
    + (words.length ? esc(words.join(' ')) : '<span class="ss-empty">Tap the first word</span>')
    + `</p>`
    /* NO CHIPS ONCE IT IS RIGHT. § */
    + (right ? '' : `<div class="ss-chips">`
      + SS.chips.map((w, i) => {
          const used = SS.picked.indexOf(i) !== -1;
          return tile_({ form: true, look: 'prof-tag is-sm', act: 'ss-word', data: { i }, pressed: used, label: w });
        }).join('')
      + `</div>`)
    + `<div class="ss-acts">`
    + (right
        ? `${tile_({ form: true, label: 'Next sentence', act: 'ss-next' })}`
        : `${tile_({ form: true, look: `btn`, attrs: `data-do="ss-check"${all ? '' : ' disabled'}`, html: `Check` })}`
          + `${tile_({ form: true, label: 'Skip', act: 'ss-new', kind: 'quiet' })}`)
    + `</div>`;
  if (said) said.textContent = SS.said;
}

function initScramble() {
  if (!$('ss-box')) return;
  const sel = $('ss-level');
  if (sel && !sel.options.length) {
    sel.innerHTML = SS_BANDS.map(b => `<option value="${b[0]}">${esc(b[1])}</option>`).join('');
  }
  if (!SS) ssDeal_(ssBand_());
  ssPaint();
}

on('ss-word', el => {
  if (!SS || SS.verdict === 'right') return;
  const i = parseInt(el.getAttribute('data-i'), 10);
  if (!(i >= 0 && i < SS.chips.length)) return;
  const at = SS.picked.indexOf(i);
  if (at === -1) SS.picked.push(i); else SS.picked.splice(at, 1);
  SS.verdict = ''; SS.said = '';
  ssPaint();
});
on('ss-check', () => {
  if (!SS || SS.picked.length !== SS.chips.length) return;
  const words = SS.picked.map(i => SS.chips[i]);
  if (ssRight_(SS.entry, words)) {
    SS.verdict = 'right';
    SS.said = 'That’s it.';
  } else {
    const n = ssPrefix_(SS.entry, words);
    SS.verdict = 'wrong';
    SS.said = n === 0 ? 'Not quite — the first word isn’t right. Tap a word to take it back.'
      : 'Not quite — the first ' + (n === 1 ? 'word is' : n + ' words are') + ' right.'
        + ' Tap a word to take it back.';
  }
  ssPaint();
});
/* NEXT AND SKIP ARE THE SAME DEAL WITH DIFFERENT WORDS ON THEM: § */
on('ss-next', () => { ssDeal_(SS ? SS.band : ssBand_()); ssPaint(); });
on('ss-new', () => { ssDeal_(SS ? SS.band : ssBand_()); ssPaint(); });
on('ss-level', el => {
  const b = SS_SENTENCES[el.value] ? el.value : 'KS2';
  ssBand_(b);
  ssDeal_(b);
  ssPaint();
});

/* WORD SEARCH — a grid of letters with a list of words hidden in it. § */
const WS_DIRS = { e: [1, 0], s: [0, 1], se: [1, 1], ne: [1, -1],
                  w: [-1, 0], n: [0, -1], nw: [-1, -1], sw: [-1, 1] };
const WS_FORWARD = ['e', 's', 'se'];

/* EVERY THEME SAYS ITS OWN SIZE, HOW MANY WORDS, AND WHETHER THEY ONLY READ FORWARDS, because "for younger" is a fact about the theme rather than a second § */
const WS_THEMES = [
  { id: 'y34', name: 'Years 3–4 spellings', young: true, size: 8, n: 6, words: [
    'accident', 'actual', 'address', 'answer', 'appear', 'arrive', 'believe', 'bicycle', 'breath',
    'build', 'busy', 'business', 'calendar', 'caught', 'centre', 'century', 'certain', 'circle',
    'complete', 'consider', 'continue', 'decide', 'describe', 'early', 'earth', 'eight', 'enough',
    'exercise', 'extreme', 'famous', 'February', 'forward', 'fruit', 'grammar', 'group', 'guard',
    'guide', 'heard', 'height', 'history', 'imagine', 'increase', 'interest', 'island', 'learn',
    'length', 'library', 'material', 'medicine', 'mention', 'minute', 'natural', 'naughty', 'notice',
    'occasion', 'often', 'opposite', 'ordinary', 'peculiar', 'perhaps', 'popular', 'position',
    'possess', 'possible', 'potatoes', 'pressure', 'probably', 'promise', 'purpose', 'quarter',
    'question', 'recent', 'regular', 'reign', 'remember', 'sentence', 'separate', 'special',
    'straight', 'strange', 'strength', 'suppose', 'surprise', 'though', 'thought', 'through',
    'various', 'weight', 'woman', 'women'] },
  { id: 'animals', name: 'Animals', young: true, size: 8, n: 6, words: [
    'badger', 'beaver', 'camel', 'cheetah', 'dolphin', 'eagle', 'ferret', 'gerbil', 'giraffe',
    'gorilla', 'hamster', 'hedgehog', 'jaguar', 'koala', 'leopard', 'lizard', 'lobster', 'meerkat',
    'octopus', 'ostrich', 'otter', 'panda', 'parrot', 'penguin', 'pigeon', 'rabbit', 'reindeer',
    'salmon', 'squirrel', 'tiger', 'toucan', 'turtle', 'walrus', 'weasel', 'whale', 'zebra'] },
  { id: 'sci2', name: 'Science, KS2', young: true, size: 8, n: 6, words: [
    'magnet', 'light', 'shadow', 'mirror', 'plant', 'root', 'stem', 'flower', 'seed', 'pollen',
    'force', 'gravity', 'friction', 'circuit', 'battery', 'switch', 'bulb', 'wire', 'solid',
    'liquid', 'melt', 'freeze', 'rock', 'soil', 'fossil', 'skeleton', 'muscle', 'teeth', 'lungs',
    'habitat', 'planet', 'orbit', 'moon', 'sound', 'vibrate', 'magnify'] },
  { id: 'y56', name: 'Years 5–6 spellings', young: true, size: 10, n: 7, words: [
    'amateur', 'ancient', 'apparent', 'attached', 'available', 'average', 'awkward', 'bargain',
    'bruise', 'category', 'cemetery', 'committee', 'community', 'conscience', 'conscious',
    'correspond', 'criticise', 'curiosity', 'definite', 'desperate', 'determined', 'develop',
    'dictionary', 'disastrous', 'embarrass', 'equipment', 'especially', 'exaggerate', 'excellent',
    'existence', 'familiar', 'foreign', 'forty', 'frequently', 'government', 'guarantee', 'harass',
    'hindrance', 'identity', 'immediate', 'individual', 'interfere', 'interrupt', 'language',
    'leisure', 'lightning', 'marvellous', 'muscle', 'necessary', 'neighbour', 'nuisance', 'occupy',
    'occur', 'parliament', 'persuade', 'physical', 'prejudice', 'privilege', 'profession',
    'programme', 'queue', 'recognise', 'recommend', 'relevant', 'restaurant', 'rhyme', 'rhythm',
    'sacrifice', 'secretary', 'shoulder', 'signature', 'sincere', 'soldier', 'stomach',
    'sufficient', 'suggest', 'symbol', 'system', 'thorough', 'twelfth', 'variety', 'vegetable',
    'vehicle', 'yacht'] },
  { id: 'sci34', name: 'Science, KS3–4', young: false, size: 10, n: 8, words: [
    'atom', 'element', 'compound', 'molecule', 'electron', 'proton', 'neutron', 'nucleus',
    'isotope', 'enzyme', 'osmosis', 'diffusion', 'mitosis', 'chromosome', 'velocity', 'momentum',
    'energy', 'current', 'voltage', 'resistance', 'wavelength', 'frequency', 'catalyst',
    'reaction', 'oxidation', 'acid', 'alkali', 'neutral', 'density', 'pressure', 'organism',
    'ecosystem', 'predator', 'species', 'hormone', 'insulin', 'glucose', 'vaccine', 'antibody',
    'bacteria', 'virus', 'gene', 'protein', 'neuron'] },
  { id: 'maths', name: 'Maths', young: false, size: 10, n: 8, words: [
    'fraction', 'decimal', 'percent', 'integer', 'prime', 'factor', 'multiple', 'square', 'cube',
    'radius', 'diameter', 'triangle', 'polygon', 'angle', 'parallel', 'vertex', 'volume', 'area',
    'perimeter', 'symmetry', 'equation', 'formula', 'gradient', 'sequence', 'ratio', 'average',
    'median', 'mode', 'range', 'algebra', 'quadratic', 'tangent', 'sine', 'cosine', 'vector',
    'hexagon', 'pentagon', 'circle', 'cylinder', 'product', 'quotient', 'inverse'] },
  { id: 'geog', name: 'Geography', young: false, size: 10, n: 8, words: [
    'river', 'mountain', 'valley', 'volcano', 'glacier', 'desert', 'climate', 'weather', 'erosion',
    'delta', 'estuary', 'tributary', 'meander', 'continent', 'country', 'capital', 'equator',
    'latitude', 'longitude', 'ocean', 'island', 'tsunami', 'earthquake', 'tectonic', 'magma',
    'rainforest', 'tundra', 'savanna', 'population', 'migration', 'settlement', 'urban', 'rural',
    'contour', 'compass', 'monsoon', 'drought', 'flood', 'coast'] },
];

/* A COPY OF `HANDLE_BLOCKED` FROM backend/constants.gs, and `check-widgets.js` fails if the two differ. § */
const WS_NOT = [
  'anal', 'anus', 'arse', 'bastard', 'bitch', 'bollock', 'boner', 'clit', 'cock', 'coon', 'cum',
  'cunt', 'dick', 'dildo', 'dyke', 'fag', 'fanny', 'fuck', 'gash', 'gook', 'incest', 'jizz',
  'kike', 'knob', 'minge', 'nigg', 'nonce', 'paedo', 'pedo', 'penis', 'piss', 'porn', 'prick',
  'pussy', 'queer', 'rape', 'retard', 'scrote', 'semen', 'sex', 'shag', 'shit', 'slag', 'slut',
  'smeg', 'spastic', 'spic', 'sperm', 'tits', 'titty', 'tosser', 'tranny', 'twat', 'vagina',
  'wank', 'whore', 'wog', 'nazi', 'hitler', 'kkk', 'isis', 'suicide', 'selfharm',
];

/* THE LETTERS OF A WORD, which is what goes in the grid: capitals, nothing but A to Z. */
const wsKey_ = w => String(w).toUpperCase().replace(/[^A-Z]/g, '');

/* DOES THE GRID SPELL ANYTHING ON `WS_NOT`, read from every cell in every one of the eight
   directions. */
function wsRude_(grid, size) {
  const bad = WS_NOT.map(wsKey_);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      for (const k of Object.keys(WS_DIRS)) {
        const [dx, dy] = WS_DIRS[k];
        let s = '';
        for (let i = 0, cx = x, cy = y; i < 8 && cx >= 0 && cy >= 0 && cx < size && cy < size;
             i++, cx += dx, cy += dy) s += grid[cy * size + cx];
        if (bad.some(b => s.startsWith(b))) return true;
      }
    }
  }
  return false;
}

/* ONE PUZZLE. Longest words first, because they are the hard ones to fit and a short word fits in whatever is left. § */
function wsBuild_(theme) {
  const size = theme.size, dirs = theme.young ? WS_FORWARD : Object.keys(WS_DIRS);
  const words = theme.words.filter(w => { const k = wsKey_(w); return k.length >= 3 && k.length <= size; });
  for (let attempt = 0; attempt < 60; attempt++) {
    const grid = new Array(size * size).fill('');
    const placed = [];
    /* THE DEAL IS THE FIRST `n` OF A SHUFFLE, AND ONLY THE DEAL IS PLACED LONGEST-FIRST. § */
    const pool = [];
    let full = 0;
    for (const w of herdShuffle_(words)) {
      if (pool.length >= theme.n * 3) break;
      if (wsKey_(w).length === size) { if (full) continue; full++; }
      pool.push(w);
    }
    const byLen = (a, b) => wsKey_(b).length - wsKey_(a).length;
    pool.splice(0, theme.n, ...pool.slice(0, theme.n).sort(byLen));
    for (const word of pool) {
      if (placed.length >= theme.n) break;
      const key = wsKey_(word);
      if (placed.some(p => p.key.indexOf(key) !== -1 || key.indexOf(p.key) !== -1)) continue;
      for (let t = 0; t < 150; t++) {
        const [dx, dy] = WS_DIRS[dirs[Math.floor(Math.random() * dirs.length)]];
        const x0 = Math.floor(Math.random() * size), y0 = Math.floor(Math.random() * size);
        const x1 = x0 + dx * (key.length - 1), y1 = y0 + dy * (key.length - 1);
        if (x1 < 0 || y1 < 0 || x1 >= size || y1 >= size) continue;
        const cells = [];
        let ok = true;
        for (let i = 0; i < key.length; i++) {
          const at = (y0 + dy * i) * size + (x0 + dx * i);
          if (grid[at] && grid[at] !== key[i]) { ok = false; break; }
          cells.push(at);
        }
        if (!ok) continue;
        cells.forEach((at, i) => { grid[at] = key[i]; });
        placed.push({ word: word, key: key, cells: cells, found: false });
        break;
      }
    }
    if (placed.length < theme.n) continue;
    const empty = [];
    grid.forEach((c, i) => { if (!c) empty.push(i); });
    for (let r = 0; r < 40; r++) {
      empty.forEach(i => { grid[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26)); });
      if (!wsRude_(grid, size)) {
        placed.sort((a, b) => a.word.localeCompare(b.word));
        return { theme: theme.id, size: size, grid: grid, words: placed, got: [], sel: null, said: '' };
      }
    }
  }
  return null;
}

const wsTheme_ = id => WS_THEMES.find(t => t.id === id) || WS_THEMES[0];

function wsThemeId_(id) {
  if (id !== undefined) {
    try { localStorage.setItem('ws-theme', id); } catch (e) {}
    return id;
  }
  let v = WS_THEMES[0].id;
  try { v = localStorage.getItem('ws-theme') || v; } catch (e) {}
  return wsTheme_(v).id;
}

let WS = null;

function wsDeal_(id) {
  WS = wsBuild_(wsTheme_(id));
  if (!WS) WS = { theme: id, size: 0, grid: [], words: [], got: [], sel: null,
                  said: 'That puzzle would not fit together. Press New puzzle.' };
}

/* THE CELLS FROM ONE TAP TO ANOTHER, or null if the two are not on one line — across, down, or a
   true diagonal. The same cell twice is not a line either. */
function wsLine_(size, a, b) {
  const ax = a % size, ay = (a / size) | 0, bx = b % size, by = (b / size) | 0;
  const dx = Math.sign(bx - ax), dy = Math.sign(by - ay);
  const nx = Math.abs(bx - ax), ny = Math.abs(by - ay);
  if (a === b || (nx && ny && nx !== ny)) return null;
  const len = Math.max(nx, ny) + 1, out = [];
  for (let i = 0; i < len; i++) out.push((ay + dy * i) * size + (ax + dx * i));
  return out;
}

/* THE SECOND TAP. Read either way, because a child who taps the last letter first has still found
   the word — and in an older puzzle the word may be written backwards anyway. */
function wsPick_(i) {
  const g = WS;
  if (!g || !g.size || !(i >= 0 && i < g.grid.length)) return;
  if (g.words.every(w => w.found)) return;
  if (g.sel === null) { g.sel = i; g.said = ''; return; }
  if (g.sel === i) { g.sel = null; g.said = ''; return; }
  const cells = wsLine_(g.size, g.sel, i);
  if (!cells) { g.sel = i; g.said = 'Not in a straight line — that letter is the new start.'; return; }
  const s = cells.map(c => g.grid[c]).join('');
  const r = s.split('').reverse().join('');
  const hit = g.words.find(w => !w.found && (w.key === s || w.key === r));
  g.sel = null;
  if (!hit) { g.said = 'That’s not one of the words.'; return; }
  hit.found = true;
  hit.cells = cells;
  cells.forEach(c => { if (g.got.indexOf(c) === -1) g.got.push(c); });
  const left = g.words.filter(w => !w.found).length;
  g.said = left ? 'Found ' + hit.word + '. ' + left + ' to go.'
                : 'All ' + g.words.length + ' found!';
}

function wsPaint() {
  const box = $('ws-grid'), list = $('ws-words'), said = $('ws-said'), sel = $('ws-theme');
  if (!box || !WS) return;
  if (sel) sel.value = WS.theme;
  const done = WS.words.length && WS.words.every(w => w.found);
  box.style.setProperty('--ws-n', String(WS.size || 1));
  box.innerHTML = WS.grid.map((c, i) => {
    const cls = ['ws-c'];
    if (WS.got.indexOf(i) !== -1) cls.push('got');
    if (WS.sel === i) cls.push('sel');
    return tile_({ form: true, look: cls.join(' '), act: 'ws-cell', data: { i }, pressed: WS.sel === i, off: done, label: c });
  }).join('');
  if (list) {
    list.innerHTML = WS.words.map(w => w.found
      ? `<li class="got"><s>${esc(w.word)}</s></li>` : `<li>${esc(w.word)}</li>`).join('');
  }
  if (said) said.textContent = WS.said;
}

function initWordSearch() {
  if (!$('ws-grid')) return;
  const sel = $('ws-theme');
  if (sel && !sel.options.length) {
    const group = (young, label) => `<optgroup label="${label}">`
      + WS_THEMES.filter(t => t.young === young)
          .map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')
      + '</optgroup>';
    sel.innerHTML = group(true, 'Younger — words read forwards')
                  + group(false, 'Older — words go any way');
  }
  if (!WS) wsDeal_(wsThemeId_());
  wsPaint();
}

on('ws-cell', el => { wsPick_(parseInt(el.getAttribute('data-i'), 10)); wsPaint(); });
on('ws-again', () => { wsDeal_(WS ? WS.theme : wsThemeId_()); wsPaint(); });
on('ws-theme', el => { wsDeal_(wsThemeId_(wsTheme_(el.value).id)); wsPaint(); });

/* ARTICULATE — describe it without saying it. § */
const ART_DECK = {
  Object: ['umbrella', 'kettle', 'stapler', 'ladder', 'trampoline', 'harmonica', 'wheelbarrow',
           'telescope', 'zip', 'hoover', 'candle', 'passport', 'skateboard', 'saucepan',
           'toothbrush', 'seatbelt', 'chandelier', 'padlock', 'compass', 'radiator',
           'hourglass', 'lawnmower', 'wheelie bin', 'megaphone', 'jigsaw puzzle', 'escalator',
           'washing line', 'hammock', 'weathervane', 'drawing pin',
           'toaster', 'microwave', 'fridge', 'dishwasher', 'washing machine', 'calculator', 'ruler',
           'rubber', 'sellotape', 'scissors', 'glue stick', 'paperclip', 'envelope', 'stamp',
           'postcard', 'calendar', 'alarm clock', 'doorbell', 'letterbox', 'doormat', 'coat hanger',
           'clothes peg', 'ironing board', 'frying pan', 'rolling pin', 'whisk', 'colander',
           'cheese grater', 'tin opener', 'teapot', 'mug', 'lunchbox', 'flask', 'backpack',
           'suitcase', 'wallet', 'keyring', 'torch', 'battery', 'plug', 'remote control',
           'headphones', 'microphone', 'keyboard', 'computer mouse', 'printer', 'lamp', 'pillow',
           'duvet', 'curtain', 'sponge', 'flannel', 'hairdryer', 'comb', 'mirror', 'tweezers',
           'plaster', 'thermometer', 'stethoscope', 'crutches', 'highchair', 'bunk bed', 'sofa',
           'beanbag', 'deckchair', 'parasol', 'bucket and spade', 'goggles'
  ],
  Nature: ['avalanche', 'hedgehog', 'thunderstorm', 'coral reef', 'acorn', 'glacier', 'moth',
           'quicksand', 'rainbow', 'beaver', 'tide', 'fossil', 'cactus', 'eclipse', 'swamp',
           'pollen', 'volcano', 'otter', 'frost', 'mushroom',
           'badger', 'waterfall', 'dandelion', 'tadpole', 'whirlpool', 'icicle', 'puffin',
           'nettle', 'sand dune', 'conker',
           'earthquake', 'tornado', 'hurricane', 'tsunami', 'lightning', 'fog', 'drizzle',
           'hailstone', 'snowflake', 'puddle', 'rock pool', 'cave', 'cliff', 'island', 'desert',
           'meadow', 'pond', 'stream', 'geyser', 'lava', 'crater', 'meteor', 'comet',
           'shooting star', 'full moon', 'sunrise', 'sunset', 'dew', 'breeze', 'gale', 'drought',
           'flood', 'iceberg', 'seaweed', 'starfish', 'seahorse', 'walrus', 'polar bear', 'reindeer',
           'fox', 'mole', 'woodlouse', 'ladybird', 'dragonfly', 'slug', 'beetle', 'ant', 'wasp',
           'grasshopper', 'robin', 'swan', 'eagle', 'pigeon', 'seagull', 'crow', 'parrot', 'toucan',
           'ostrich', 'hummingbird', 'panda', 'koala', 'hippo', 'rhino', 'cheetah', 'leopard',
           'wolf', 'deer'
  ],
  Action: ['juggling', 'whispering', 'sneezing', 'hitchhiking', 'tiptoeing', 'yawning',
           'hibernating', 'shrugging', 'wrestling', 'queueing', 'gargling', 'skimming a stone',
           'blushing', 'haggling', 'eavesdropping', 'sprinting', 'knitting', 'shivering',
           'applauding', 'daydreaming',
           'whistling', 'somersaulting', 'sleepwalking', 'abseiling', 'tying a shoelace',
           'blowing out candles', 'plaiting hair', 'revising', 'snorkelling', 'sulking',
           'bouncing', 'tickling', 'winking', 'stretching', 'kneeling', 'crawling', 'hopping',
           'skipping', 'galloping', 'marching', 'limping', 'waddling', 'wobbling', 'shuffling',
           'clapping', 'pointing', 'nodding', 'bowing', 'curtseying', 'saluting', 'waving',
           'hugging', 'snoring', 'humming', 'chewing', 'nibbling', 'slurping', 'sipping', 'munching',
           'blinking', 'frowning', 'squinting', 'sniffing', 'scratching', 'hiding', 'peeping',
           'tidying', 'dusting', 'sprinkling', 'spreading', 'grating', 'unwrapping', 'folding',
           'sharpening', 'colouring', 'doodling', 'scribbling', 'spelling', 'counting', 'measuring',
           'weighing', 'rhyming', 'guessing', 'cheating', 'bragging', 'apologising', 'complaining',
           'interrupting', 'fidgeting', 'dawdling', 'rummaging', 'recycling', 'volunteering',
           'hula hooping', 'leapfrogging'
  ],
  World: ['Iceland', 'the Sahara', 'Mount Everest', 'the Amazon', 'Venice', 'the Great Wall',
          'Antarctica', 'Tokyo', 'the Nile', 'Stonehenge', 'the Alps', 'Cairo', 'New Zealand',
          'the Panama Canal', 'Lisbon', 'the Dead Sea', 'Kenya', 'Niagara Falls', 'Sicily',
          'the Arctic Circle',
           'the Eiffel Tower', 'Loch Ness', 'the Grand Canyon', 'Big Ben', 'Machu Picchu',
           'the Channel Tunnel', 'the Colosseum', 'the Taj Mahal', 'the Lake District',
           'the Sydney Opera House',
          'Paris', 'Rome', 'New York', 'the London Eye', 'Buckingham Palace',
          'the Statue of Liberty', 'the Pyramids', 'the Leaning Tower of Pisa',
          'the Great Barrier Reef', 'the Mississippi', 'the Thames', 'the Pacific Ocean',
          'the Mediterranean', 'the North Pole', 'the South Pole', 'the Equator', 'Australia',
          'Canada', 'Brazil', 'Mexico', 'Egypt', 'India', 'China', 'Japan', 'Greece', 'Spain',
          'Scotland', 'Wales', 'Ireland', 'Jamaica', 'Hawaii', 'Hollywood', 'Mount Kilimanjaro',
          'Ben Nevis', 'Snowdon', 'the Himalayas', 'the Rocky Mountains', 'the Andes', 'Siberia',
          'the Outback', 'the Serengeti', 'the Galapagos Islands', 'Amsterdam', 'Berlin',
          'Barcelona', 'Edinburgh Castle', 'Blackpool Tower', 'the Angel of the North',
          'Hadrian\'s Wall', 'the Isle of Wight', 'Cornwall', 'the Giant\'s Causeway', 'Mount Fuji',
          'the Golden Gate Bridge', 'the White House', 'Mount Rushmore', 'Uluru', 'the Caribbean',
          'Rio de Janeiro', 'Greenland', 'Timbuktu', 'Hong Kong', 'Tower Bridge',
          'St Paul\'s Cathedral', 'Windsor Castle', 'the Shard', 'the Norwegian fjords'
  ],
  Person: ['a lifeguard', 'a blacksmith', 'a referee', 'an astronaut', 'a plumber', 'a busker',
           'a detective', 'a midwife', 'a lighthouse keeper', 'a beekeeper', 'a paramedic',
           'a librarian', 'a sculptor', 'a chimney sweep', 'a surgeon', 'a tour guide',
           'a lollipop lady', 'an archaeologist', 'a barista', 'a train driver',
           'a window cleaner', 'a magician', 'a vet', 'a shepherd', 'a park ranger',
           'a goalkeeper', 'a puppeteer', 'a weather forecaster', 'a caretaker',
           'a stunt double',
           'a nurse', 'a dentist', 'a pilot', 'a firefighter', 'a police officer', 'a postman',
           'a farmer', 'a chef', 'a baker', 'a butcher', 'a builder', 'an electrician',
           'a carpenter', 'a hairdresser', 'a teacher', 'a head teacher', 'a dinner lady',
           'a gardener', 'a zookeeper', 'a pirate', 'a knight', 'a king', 'a queen', 'a princess',
           'a wizard', 'a fortune teller', 'a clown', 'an acrobat', 'a ringmaster', 'a ballerina', 'a DJ',
           'a newsreader', 'a journalist', 'a photographer', 'an author', 'a poet', 'a scientist',
           'an inventor', 'an explorer', 'a mountaineer', 'a sailor', 'a spy', 'a judge', 'a mayor',
           'a prime minister', 'a bus driver', 'a taxi driver', 'a lorry driver', 'a mechanic',
           'a pharmacist', 'an optician', 'a cashier', 'a shopkeeper', 'a waiter', 'a jockey',
           'a cowboy', 'a lumberjack', 'a fisherman', 'a scuba diver', 'a babysitter', 'a twin',
           'a grandma', 'a pen pal', 'a toddler', 'a teenager', 'a football manager'
  ],
  Random: ['jet lag', 'a leap year', 'homesickness', 'a power cut', 'déjà vu', 'the alphabet',
           'a rumour', 'a traffic jam', 'small talk', 'a nickname', 'bad luck', 'an alibi',
           'a bargain', 'a heatwave', 'stage fright', 'a countdown', 'an echo', 'a punchline',
           'a shortcut', 'a coincidence',
           'a tongue twister', 'a time capsule', 'a sleepover', 'a riddle', 'a head start',
           'a false alarm', 'a cliffhanger', 'an apology', 'a wild goose chase',
           'a wrong number',
           'a secret', 'a surprise', 'a promise', 'a joke', 'a nightmare', 'a wish', 'half term',
           'a fire drill', 'a school report', 'a hiccup', 'the giggles', 'brain freeze',
           'pins and needles', 'butterflies in your stomach', 'a lucky charm', 'a high five',
           'a thumbs up', 'a group photo', 'a password', 'a spelling test', 'a penalty shoot-out',
           'a world record', 'a to-do list', 'a shopping list', 'a recipe', 'a timetable',
           'a deadline', 'the weekend', 'Monday morning', 'a bank holiday', 'midnight',
           'the dawn chorus', 'a lie-in', 'a nap', 'bedtime', 'a bedtime story', 'a happy ending',
           'a plot twist', 'a spoiler', 'a sequel', 'an encore', 'a standing ovation', 'a mascot',
           'a trophy', 'a medal', 'a certificate', 'a gold star', 'beginner\'s luck',
           'a second chance', 'a fresh start', 'musical chairs', 'pass the parcel',
           'a treasure hunt', 'a secret code', 'an emoji', 'the internet', 'gravity', 'electricity',
           'friendship', 'kindness', 'patience', 'courage', 'curiosity', 'boredom', 'excitement',
           'teamwork', 'a compliment'
  ],
};

/* CHARADES — the same round, mimed instead of described. § */
const CHA_DECK = {
  /* THIRTY EACH ONCE (four hundred more were added later, plus `Animal` and `Sport`, which are things a body can SHOW), AND `Action` IS THE ONE THAT HAD TO BE § */
  Film: [
    'Jurassic Park', 'Finding Nemo', 'Toy Story', 'Paddington', 'The Lion King', 'Frozen',
    'Harry Potter', 'Shrek', 'E.T. the Extra-Terrestrial', 'The Wizard of Oz', 'Mary Poppins',
    'Chitty Chitty Bang Bang', '101 Dalmatians', 'Wallace and Gromit', 'Chicken Run',
    'Despicable Me', 'Ratatouille', 'Up', 'The Incredibles', 'Ice Age', 'Star Wars',
    'The Sound of Music', 'Peter Pan', 'Moana', 'Kung Fu Panda', 'How to Train Your Dragon',
    'Babe', 'Nanny McPhee', 'Madagascar', 'Night at the Museum',
    'Cars', 'Coco', 'Encanto', 'Inside Out', 'Zootropolis', 'Tangled', 'Aladdin',
    'The Little Mermaid', 'Beauty and the Beast', 'Cinderella', 'Snow White and the Seven Dwarfs',
    'Sleeping Beauty', 'Mulan', 'Pinocchio', 'Dumbo', 'Bambi', 'Lady and the Tramp', 'Robin Hood',
    'The Aristocats', 'Hercules', 'Tarzan', 'Lilo and Stitch', 'Brave', 'WALL-E', 'Monsters Inc',
    'A Bug\'s Life', 'Luca', 'Turning Red', 'Soul', 'Onward', 'Elemental', 'Big Hero 6',
    'Wreck-It Ralph', 'Bolt', 'Minions', 'The Secret Life of Pets', 'Sing', 'Trolls',
    'The Lego Movie', 'Cloudy with a Chance of Meatballs', 'Rio', 'Happy Feet', 'Megamind',
    'Bee Movie', 'Shark Tale', 'The Boss Baby', 'Puss in Boots', 'Spider-Man', 'Batman', 'Superman',
    'Annie', 'Oliver!', 'The Greatest Showman', 'Grease', 'Hook', 'Jumanji', 'Back to the Future',
    'Honey I Shrunk the Kids', 'Free Willy', 'Beethoven', 'Stuart Little', 'The Karate Kid',
    'Cool Runnings', 'Space Jam', 'The Parent Trap', 'The Goonies', 'Flushed Away', 'Early Man',
    'My Neighbour Totoro', 'Sonic the Hedgehog'
  ],
  TV: [
    'Bake Off', 'Doctor Who', 'Strictly Come Dancing', 'Blue Peter', 'Top Gear',
    'Only Fools and Horses', 'Match of the Day', 'Ninja Warrior', 'Peppa Pig', 'Postman Pat',
    'Fireman Sam', 'Thomas the Tank Engine', 'Bob the Builder', 'Teletubbies', 'Shaun the Sheep',
    'Horrible Histories', 'Mr Tumble', 'Robot Wars', 'Rastamouse', 'Art Attack',
    'SpongeBob SquarePants', 'Scooby Doo', 'Tom and Jerry', 'The Simpsons', 'Danger Mouse',
    'Mr Bean', 'Gladiators', 'Dragons Den', 'The Repair Shop', 'The Crystal Maze',
    'Bluey', 'Paw Patrol', 'Hey Duggee', 'In the Night Garden', 'Something Special', 'Balamory',
    'Tweenies', 'Noddy', 'The Clangers', 'The Wombles', 'Pingu', 'Bananas in Pyjamas', 'Pokémon',
    'Newsround', 'Countryfile', 'Gardeners\' World', 'Antiques Roadshow', 'Blue Planet',
    'Springwatch', 'Top of the Pops', 'EastEnders', 'Coronation Street', 'Emmerdale', 'Neighbours',
    'Casualty', 'Dad\'s Army', 'Fawlty Towers', 'Blackadder', 'Grange Hill', 'Tracy Beaker',
    'Thunderbirds', 'Ben and Holly\'s Little Kingdom', 'Octonauts', 'Sarah and Duck', 'Numberblocks',
    'Mister Maker', 'Andy\'s Dinosaur Adventures', 'Britain\'s Got Talent',
    'The Great British Sewing Bee', 'The Masked Singer', 'Dancing on Ice', 'Changing Rooms',
    'Grand Designs', 'Total Wipeout', 'Record Breakers', 'The Muppet Show', 'Sesame Street',
    'Fraggle Rock', 'Power Rangers', 'Teenage Mutant Ninja Turtles'
  ],
  Book: [
    'Matilda', 'The Gruffalo', 'Treasure Island', 'The Hobbit', 'Robinson Crusoe',
    'Charlie and the Chocolate Factory', 'James and the Giant Peach', 'The BFG',
    'Fantastic Mr Fox', 'The Twits', 'The Lion the Witch and the Wardrobe', 'The Jungle Book',
    'Alice in Wonderland', 'The Wind in the Willows', 'Winnie the Pooh',
    'The Very Hungry Caterpillar', 'Where the Wild Things Are', 'The Railway Children',
    'The Secret Garden', 'Swallows and Amazons', 'Black Beauty', 'The Tiger Who Came to Tea',
    'Room on the Broom', 'The Worst Witch', 'Horrid Henry', 'Diary of a Wimpy Kid',
    'Stig of the Dump', 'The Iron Man', 'Around the World in Eighty Days', 'The Cat in the Hat',
    'Charlotte\'s Web', 'The Borrowers', 'The Tale of Peter Rabbit',
    'The Owl Who Was Afraid of the Dark', 'Dear Zoo', 'We\'re Going on a Bear Hunt',
    'The Snail and the Whale', 'Stick Man', 'Zog', 'The Smartest Giant in Town', 'Tiddler',
    'Superworm', 'The Highway Rat', 'Monkey Puzzle', 'Each Peach Pear Plum', 'Pippi Longstocking',
    'Heidi', 'Oliver Twist', 'Great Expectations', 'The Famous Five', 'The Secret Seven',
    'Malory Towers', 'The Magic Faraway Tree', 'The Little Prince', 'Gulliver\'s Travels',
    'Moby Dick', 'Frankenstein', 'Kidnapped', 'The Three Musketeers', 'War Horse',
    'Private Peaceful', 'Holes', 'Wonder', 'The Midnight Gang', 'Gangsta Granny', 'Billionaire Boy',
    'Mr Stink', 'The Witches', 'The Enormous Crocodile', 'George\'s Marvellous Medicine',
    'Danny the Champion of the World', 'Esio Trot', 'The Magic Finger', 'Percy Jackson',
    'Tom\'s Midnight Garden', 'The Enormous Turnip', 'The Little Red Hen',
    'Goldilocks and the Three Bears', 'The Three Little Pigs', 'Jack and the Beanstalk',
    'Little Red Riding Hood', 'Hansel and Gretel', 'Rapunzel', 'The Ugly Duckling',
    'The Princess and the Pea'
  ],
  Song: [
    'Happy Birthday', 'Twinkle Twinkle Little Star', 'YMCA', 'We Will Rock You',
    'Row Row Row Your Boat', 'The Hokey Cokey', 'The Wheels on the Bus',
    'Head Shoulders Knees and Toes', 'If You Are Happy and You Know It',
    'Old MacDonald Had a Farm', 'Incy Wincy Spider', 'I Am a Little Teapot', 'Five Little Ducks',
    'Ten Green Bottles', 'One Man Went to Mow', 'The Grand Old Duke of York',
    'London Bridge is Falling Down', 'Baa Baa Black Sheep', 'Humpty Dumpty',
    'Hickory Dickory Dock', 'Jack and Jill', 'Pop Goes the Weasel', 'Twist and Shout',
    'The Animals Went in Two by Two', 'You Are My Sunshine', 'The Macarena',
    'Singing in the Rain', 'Yellow Submarine', 'Walking on Sunshine', 'Here Comes the Sun',
    'Mary Had a Little Lamb', 'Hey Diddle Diddle', 'Little Bo Peep', 'Little Miss Muffet',
    'Hot Cross Buns', 'Oranges and Lemons', 'Ring a Ring o\' Roses', 'The Farmer\'s in His Den',
    'Polly Put the Kettle On', 'Sing a Song of Sixpence', 'Three Blind Mice', 'Rock-a-bye Baby',
    'Wind the Bobbin Up', 'Miss Polly Had a Dolly', 'Five Little Speckled Frogs',
    'Five Little Monkeys Jumping on the Bed', 'Ten in the Bed', 'Baby Shark', 'Let It Go',
    'Old King Cole', 'Doctor Foster', 'Little Jack Horner', 'Pat-a-Cake', 'This Old Man',
    'Here We Go Round the Mulberry Bush', 'Bingo', 'Five Currant Buns', 'Alice the Camel',
    'Dancing Queen', 'Don\'t Stop Me Now', 'Shake It Off', 'Happy', 'Can\'t Stop the Feeling',
    'Uptown Funk', 'Who Let the Dogs Out', 'I\'m a Believer', 'Stayin\' Alive', 'Hey Jude',
    'Octopus\'s Garden', 'All You Need Is Love', 'Let It Be', 'Somewhere Over the Rainbow',
    'The Lion Sleeps Tonight', 'Hakuna Matata', 'Under the Sea', 'A Whole New World',
    'How Far I\'ll Go', 'We Don\'t Talk About Bruno', 'Supercalifragilisticexpialidocious',
    'The Bare Necessities', 'I Just Can\'t Wait to Be King', 'You\'ve Got a Friend in Me',
    'Circle of Life', 'Let\'s Go Fly a Kite', 'Do-Re-Mi'
  ],
  Action: [
    'building a flat-pack wardrobe', 'walking a dog that will not walk',
    'carrying too many shopping bags', 'putting up a tent in the wind', 'trying to open a jar',
    'wrapping an awkward present', 'getting chewing gum off a shoe', 'parallel parking',
    'changing a duvet cover', 'steering a shopping trolley with a wonky wheel',
    'getting stuck halfway out of a jumper', 'blowing up a balloon until it goes pop',
    'eating a chip that is far too hot', 'untangling a pair of headphones',
    'doing up a tie for the first time', 'catching a spider under a glass to put it outside',
    'carrying a full mug of tea across a room', 'swatting a fly that keeps landing on you',
    'pulling on a pair of wet wellies', 'cleaning a window that is still smeary',
    'painting a ceiling and getting drips on your face', 'peeling a satsuma in one long piece',
    'hunting for your keys at the bottom of a deep bag',
    'skipping with a rope that keeps catching your feet',
    'washing up in rubber gloves that are too big', 'fishing the last crisp out of the packet',
    'running for a train and just missing it', 'threading a needle and missing every time',
    'icing a cake with a wobbly hand', 'folding a big map back up the way it was',
    'flipping a pancake', 'walking across an icy pavement', 'blowing bubbles',
    'building a sandcastle before the tide comes in', 'mowing the lawn',
    'planting a seed and watering it', 'hanging out the washing on a windy day', 'ironing a shirt',
    'hoovering under the sofa', 'making a bed', 'washing a car', 'changing a light bulb',
    'taking a selfie', 'posting a letter', 'walking on hot sand without shoes',
    'walking through deep mud', 'playing hide and seek', 'brushing a horse', 'milking a cow',
    'feeding the ducks', 'flying a kite', 'kneading bread dough', 'chopping onions and crying',
    'eating a big plate of spaghetti', 'eating a sandwich that is too big to bite',
    'drinking through a straw', 'licking an ice cream before it drips',
    'opening a window that is stuck', 'wading into a cold sea', 'pumping up a bike tyre',
    'squeezing onto a crowded bus', 'finding a seat in a dark cinema',
    'trying to sneeze and it will not come', 'putting on sun cream', 'lifting a very heavy rucksack',
    'climbing into a sleeping bag', 'rowing a boat', 'catching a boot on a fishing line',
    'hammering a nail and hitting your thumb', 'sawing a plank of wood', 'painting a fence',
    'hanging wallpaper', 'washing a dog that does not want a bath', 'carrying a sleeping baby',
    'pushing a pram up a hill', 'feeding a baby with a spoon', 'spinning a plate on a stick',
    'walking along a tightrope', 'standing still as a statue', 'conducting an orchestra',
    'playing the drums', 'playing the violin', 'playing the piano', 'playing the trumpet',
    'playing the guitar', 'singing into a hairbrush', 'dancing at a disco', 'sweeping the floor',
    'mopping a slippery floor', 'scrubbing a very dirty pan', 'setting the table',
    'carrying a tray of drinks', 'cracking an egg into a bowl', 'stirring a giant pot of soup',
    'typing a very long email', 'sending a text with cold fingers',
    'reading a newspaper in the wind', 'knocking over a line of dominoes',
    'making a paper aeroplane', 'putting on gloves that are too tight',
    'walking in shoes that are too big', 'trying on a hat in a mirror', 'sewing on a button',
    'hanging a picture straight', 'looking for the TV remote', 'trying to get a signal on a phone',
    'hailing a taxi', 'directing traffic', 'getting a splinter out',
    'stepping on a building brick in bare feet', 'eating a slice of lemon', 'digging a hole',
    'picking apples from a tree', 'watering the garden with a hose'
  ],
  Animal: [
    'a kangaroo', 'a penguin', 'an elephant', 'a monkey', 'a giraffe', 'a snake', 'a crab', 'a frog',
    'a chicken', 'a gorilla', 'a lion', 'a crocodile', 'a flamingo', 'a rabbit', 'a horse', 'an owl',
    'a bat', 'a butterfly', 'a spider', 'a bee', 'a duck', 'a dog', 'a cow', 'a pig', 'a sheep',
    'a tortoise', 'a snail', 'a seal', 'a dolphin', 'a shark', 'an octopus', 'a jellyfish',
    'a peacock', 'a sloth', 'a meerkat', 'a bear', 'a tiger', 'a camel', 'a squirrel', 'a chameleon',
    'a woodpecker', 'a caterpillar', 'a worm', 'a mouse'
  ],
  Sport: [
    'football', 'tennis', 'golf', 'cricket', 'rugby', 'basketball', 'netball', 'swimming', 'fencing',
    'archery', 'ten-pin bowling', 'darts', 'snooker', 'table tennis', 'badminton', 'canoeing',
    'sailing', 'surfing', 'skiing', 'snowboarding', 'ice skating', 'cycling', 'weightlifting',
    'horse riding', 'javelin', 'shot put', 'hurdles', 'long jump', 'a relay race', 'a sack race',
    'an egg and spoon race', 'a three-legged race', 'tug of war', 'hockey', 'baseball', 'volleyball',
    'karate', 'yoga', 'rock climbing', 'water polo', 'curling', 'boxing'
  ],
}

/* ONE ROUND, TWO GAMES. § */
/* NINETY AND A HUNDRED AND EIGHTY, ASKED FOR IN THOSE WORDS: § */
const ROUND_GAMES = {
  art: { secs: 90, deck: () => ART_DECK, name: 'Articulate',
         say: 'Describe it. Not the word, not a rhyme, not the initials.' },
  cha: { secs: 180, deck: () => CHA_DECK, name: 'Charades',
         say: 'Act it out. No words, no sounds, no pointing.' },
};

function roundClock_(secs) {
  const n = Math.max(0, secs | 0);
  return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
}

/* ONE STATE PER GAME, not one shared. Both cards can be on the screen at once — they are two pages
   of the same column — and a single state would have the second one wiping the first's clock. */
const roundAt = { art: null, cha: null };

function roundPick_(k) {
  /* THE CATEGORY IS CHOSEN FOR YOU, and that is the change the owner asked for: § */
  const deck = ROUND_GAMES[k].deck();
  const cats = Object.keys(deck);
  return cats[Math.floor(Math.random() * cats.length)];
}

function roundStop_(k) {
  const s = roundAt[k];
  if (s && s.timer) { clearInterval(s.timer); s.timer = 0; }
}

/* DRAWN FROM THE STATE, never patched by the handler that changed it — the `REEL_HELD` rule. § */
/* EVERY COPY OF THE CARD (Find draws one, a page ahead may hold another): an id names the first alone, so a press on the second changed nothing (owner, 12 Nov). */
function roundPaint(k) {
  const all = id => [...document.querySelectorAll('[id="' + id + '"]')];
  const cards = all(k + '-card'), saids = all(k + '-said'), lefts = all(k + '-left'), gots = all(k + '-got');
  cards.forEach((card, i) => roundPaintOne_(k, card, saids[i], lefts[i], gots[i]));
}
function roundPaintOne_(k, card, said, left, got) {
  const g = ROUND_GAMES[k];
  if (!card || !g) return;
  const s = roundAt[k];
  /* GOT IT AND PASS ARE DRAWN FROM THE START, greyed until Start (the owner, 6 Nov): never hidden, so nothing moves. */
  document.querySelectorAll('[data-do="rg-next"][data-g="' + k + '"]').forEach(b => b.setAttribute('aria-disabled', s && s.phase === 'go' ? 'false' : 'true'));
  if (!s || s.phase === 'idle') {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="rg-begin" data-g="${esc(k)}"`, html: `Start` })}`;
    if (said) said.textContent = g.say;
    if (left) left.textContent = roundClock_(g.secs);
    if (got) got.textContent = '0';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-cat-of">${esc(s.cat)}</p>`;
    if (said) said.textContent = 'Start again for another.';
    if (left) left.textContent = roundClock_(0);
    return;
  }
  card.innerHTML = `<p class="art-cat-of">${esc(s.cat)}</p>
    <p class="art-word">${esc(s.word || '')}</p>`;
  if (said) said.textContent = g.say;
  if (left) left.textContent = roundClock_(s.left);
  if (got) got.textContent = String(s.score);
}

function roundNext_(k) {
  const s = roundAt[k];
  if (!s) return;
  /* DEALT FROM A SHUFFLED PILE, refilled when it empties, so one round cannot show a word twice — which is the whole reason a category does not have to be enormous § */
  if (!s.pile.length) s.pile = herdShuffle_(ROUND_GAMES[k].deck()[s.cat] || []);
  s.word = s.pile.pop() || '';
}

function initRound(k) {
  if (!$(k + '-card')) return;
  roundStop_(k);
  roundAt[k] = null;
  roundPaint(k);
}

on('rg-begin', el => {
  const k = el.getAttribute('data-g');
  const g = ROUND_GAMES[k];
  if (!g) return;
  roundStop_(k);
  const cat = roundPick_(k);
  roundAt[k] = { phase: 'go', cat: cat, score: 0, left: g.secs, word: '',
                 pile: herdShuffle_(g.deck()[cat] || []), timer: 0 };
  roundNext_(k);
  roundAt[k].timer = setInterval(() => {
    const s = roundAt[k];
    if (!s || s.phase !== 'go') return;
    s.left--;
    if (s.left <= 0) { s.phase = 'done'; roundStop_(k); }
    roundPaint(k);
  }, 1000);
  roundPaint(k);
});

/* GOT IT AND PASS ARE THE SAME MOVE with one number different, so they are one handler — two would
   be two places to get "deal the next one" wrong. */
on('rg-next', el => {
  const k = el.getAttribute('data-g');
  const s = roundAt[k];
  if (!s || s.phase !== 'go') return;
  if (el.getAttribute('data-got') === '1') s.score++;
  roundNext_(k);
  roundPaint(k);
});

on('rg-again', el => {
  const k = el.getAttribute('data-g');
  if (!ROUND_GAMES[k]) return;
  roundStop_(k);
  roundAt[k] = null;
  roundPaint(k);
});

/* IMPOSTER — three or more people, one phone, one word that everybody knows but one of them. § */
const IMP_MIN = 3, IMP_MAX = 12;

/* A CARD IS WHAT ITS PICTURE SHOWS — A THING, A FACE, A GESTURE OR A SIGN — AND NEVER AN IDEA. § */
const IMP_DECK = {
  Food: { sym: '😋', cards: [
    '🍕 pizza', '🍔 burger', '🍟 chips', '🥪 sandwich', '🍝 spaghetti', '🌭 hot dog', '🍲 soup',
    '🍛 curry', '🍣 sushi', '🌮 tacos', '🍜 noodles', '🍚 rice', '🥟 dumplings', '🥧 pie',
    '🍗 chicken leg', '🍳 fried egg', '🌯 burrito', '🥙 kebab', '🥩 steak', '🍫 chocolate', '🍬 sweets',
    '🍭 lollipop', '🍪 cookie', '🧁 cupcake', '🍩 doughnut', '🍿 popcorn', '🍰 cake', '🧇 waffle',
    '🥞 pancakes', '🧆 falafel',
  ] },
  'Fruit and veg': { sym: '🥗', cards: [
    '🍎 apple', '🍌 banana', '🍊 orange', '🍓 strawberry', '🍇 grapes', '🥕 carrot',
    '🍉 watermelon', '🍍 pineapple', '🍅 tomato', '🥒 cucumber', '🍐 pear', '🍋 lemon', '🍒 cherry',
    '🥦 broccoli', '🌽 sweetcorn', '🥔 potato', '🥭 mango', '🍑 peach', '🥝 kiwi', '🥥 coconut',
    '🥬 lettuce', '🧅 onion', '🍄 mushroom', '🥑 avocado', '🌶️ chilli', '🍈 melon', '🧄 garlic',
    '🥜 peanuts', '🍠 sweet potato', '🍆 aubergine',
  ] },
  'In the kitchen': { sym: '🥘', cards: [
    '🍽️ plate', '🥣 bowl', '🥄 spoon', '🍴 cutlery', '🔪 knife', '🥢 chopsticks',
    '🥓 bacon', '☕ cup', '🥛 milk', '🥚 egg', '🧀 cheese', '🍞 bread', '🧈 butter', '🧂 salt',
    '🥫 tin', '🍯 honey', '🧊 ice cube', '🧃 juice box', '🍼 baby bottle', '🧽 sponge', '🚰 tap',
    '⏲️ timer', '🧯 fire extinguisher', '🥤 fizzy drink', '🥡 takeaway', '🥐 croissant', '🥯 bagel',
    '🥖 baguette', '🥨 pretzel', '🗑️ bin',
  ] },
  'At home': { sym: '🏠', cards: [
    '🛏️ bed', '🛋️ sofa', '🛁 bath', '📺 television', '🚪 door', '🪑 chair', '🚽 toilet', '🔑 key',
    '🧼 soap', '🧶 wool', '⏰ alarm clock', '🚿 shower', '🧻 toilet roll', '☎️ telephone',
    '⌨️ keyboard', '💻 laptop', '🖼️ picture', '✉️ letter', '📰 newspaper', '🧳 suitcase',
    '🪒 razor', '🕰️ clock', '💳 credit card', '🖨️ printer', '📦 parcel', '📱 mobile phone',
    '🧺 basket', '🖥️ computer', '📷 camera', '👪 family',
  ] },
  Toolbox: { sym: '🧰', cards: [
    '🔨 hammer', '🔧 spanner', '🔦 torch', '🔋 batteries', '💡 light bulb', '🔒 padlock',
    '🧱 brick', '🪓 axe', '🔍 magnifying glass', '⛓️ chain', '🔩 nuts and bolts', '⛏️ pickaxe',
    '🏗️ crane', '🥽 safety goggles', '🦺 hi-vis vest', '🚧 roadworks', '⚙️ cog', '🗜️ clamp',
    '🛢️ barrel', '🧲 magnet', '🔌 plug', '📌 drawing pin', '🧷 safety pin', '⚖️ scales',
    '⛑️ helmet', '📏 ruler', '✂️ scissors', '🖌️ paintbrush', '⏱️ stopwatch', '🧭 compass',
  ] },
  Clothes: { sym: '👚', cards: [
    '🧦 socks', '🧕 headscarf', '👖 jeans', '👗 dress', '🩳 shorts', '🧥 coat', '👢 boots',
    '👟 trainers', '👞 shoes', '🧣 scarf', '🧤 gloves', '🧢 cap', '🕶️ sunglasses', '👓 glasses',
    '🩱 swimming costume', '🩲 pants', '👔 tie', '👠 high heels', '⌚ watch', '💍 ring',
    '👜 handbag', '👛 purse', '🎩 top hat', '👘 kimono', '🥻 sari', '👳 turban', '🥾 walking boots',
    '🎽 vest', '🥼 lab coat', '🎀 bow',
  ] },
  'The body': { sym: '🧍', cards: [
    '👃 nose', '👁️ eye', '👂 ear', '👄 mouth', '👅 tongue', '🦷 tooth', '🧠 brain', '🦴 bone',
    '💀 skull', '🦵 leg', '🦶 foot', '👣 footprints', '✋ hand', '😷 face mask', '☝️ finger', '✊ fist',
    '💪 muscles', '💅 nails', '❤️ heart', '🩸 blood', '🧔 beard', '👩‍🦱 curly hair',
    '👩‍🦰 red hair', '👨‍🦲 bald head', '🩹 plaster', '💉 injection', '🦠 germs', '💊 medicine',
    '🩺 stethoscope', '🦻 hearing aid',
  ] },
  Feelings: { sym: '🎭', cards: [
    '😀 happy', '😢 sad', '😭 crying', '😂 laughing', '😠 angry', '😨 scared', '😱 screaming',
    '😮 surprised', '😴 asleep', '🤢 sick', '🤒 poorly', '🤕 hurt', '🥵 hot', '🥶 cold', '😵 dizzy',
    '😍 in love', '😎 cool', '🤪 silly', '🤔 thinking', '😟 worried', '😳 embarrassed',
    '🤩 excited', '😒 grumpy', '😑 bored', '😬 nervous', '😜 cheeky', '🤧 sneezing', '🥱 yawning',
    '🤫 quiet', '🤨 suspicious',
  ] },
  Actions: { sym: '🚶', cards: [
    '🏃 running', '🛌 sleeping', '🛀 having a bath', '👋 waving', '✍️ writing',
    '🤳 taking a selfie', '🤗 hugging', '🤷 shrugging', '🤦 facepalm', '🙇 bowing', '🧎 kneeling',
    '👉 pointing', '👊 fist bump', '🙌 cheering', '🤞 fingers crossed', '👌 OK sign',
    '✌️ peace sign', '👎 thumbs down', '🗣️ talking', '💆 massage', '🙏 praying',
    '😘 blowing a kiss', '🧘 yoga', '🤝 shaking hands', '🙅 saying no', '💇 getting a haircut',
    '👍 thumbs up', '⛹️ bouncing a ball', '😉 winking', '👏 clapping',
  ] },
  People: { sym: '👥', cards: [
    '👩‍🏫 teacher', '👨‍⚕️ doctor', '👩‍🚒 firefighter', '👮 police officer', '👨‍🌾 farmer',
    '👩‍🍳 chef', '👨‍✈️ pilot', '👷 builder', '👩‍🔬 scientist', '👨‍🎨 artist', '👩‍🔧 mechanic',
    '🕵️ detective', '👨‍⚖️ judge', '👨‍💼 office worker', '👩‍💻 computer programmer', '👩‍🏭 welder',
    '💂 soldier', '🤡 clown', '🤠 cowboy', '🤹 juggler', '🏇 jockey', '👨 man', '👨‍🎤 rock star',
    '👶 baby', '👦 boy', '👧 girl', '👵 grandma', '👴 grandad', '👩‍🎓 student', '🤰 pregnant woman',
  ] },
  'Wild animals': { sym: '🐯', cards: [
    '🐘 elephant', '🦁 lion', '🐒 monkey', '🦒 giraffe', '🦧 orangutan', '🦓 zebra', '🐼 panda',
    '🦘 kangaroo', '🐊 crocodile', '🐻 bear', '🦛 hippo', '🦏 rhino', '🐨 koala', '🐪 camel',
    '🦊 fox', '🦉 owl', '🐿️ squirrel', '🐗 boar', '🦇 bat', '🦡 badger', '🦅 eagle',
    '🦩 flamingo', '🦍 gorilla', '🐃 buffalo', '🦢 swan', '🦥 sloth', '🦨 skunk', '🦦 otter',
    '🦝 raccoon', '🐆 leopard',
  ] },
  'Pets and farm animals': { sym: '🐾', cards: [
    '🐕 dog', '🐈 cat', '🐇 rabbit', '🐹 hamster', '🐟 fish', '🐎 horse', '🐄 cow', '🐖 pig',
    '🐑 sheep', '🐔 chicken', '🦆 duck', '🐁 mouse', '🐤 chick', '🐐 goat', '🐦 bird', '🦜 parrot',
    '🐀 rat', '🦃 turkey', '🐂 bull', '🐓 cockerel', '🦙 llama', '🐏 ram', '🦎 lizard', '🐍 snake',
    '🕊️ dove', '🦮 guide dog', '🐩 poodle', '🦚 peacock', '🐢 tortoise', '🐣 hatching chick',
  ] },
  'At the seaside': { sym: '🌊', cards: [
    '🦈 shark', '🐬 dolphin', '🐳 whale', '🐙 octopus', '🦀 crab', '🦞 lobster', '🦐 prawn',
    '🦑 squid', '🐡 pufferfish', '🐠 tropical fish', '🦪 oyster', '🐚 shell', '🐧 penguin',
    '🏖️ beach', '🏝️ island', '🌅 sunset', '🤿 snorkel', '🎢 roller coaster', '⚓ anchor', '🎣 fishing rod',
    '⛵ sailing boat', '🛥️ motor boat', '🎡 big wheel', '🎠 merry-go-round', '🏊 swimming', '🏄 surfing',
    '🍦 ice cream', '👙 bikini', '👒 sun hat', '👡 sandals',
  ] },
  Nature: { sym: '🏞️', cards: [
    '🌋 volcano', '⛰️ mountain', '🏜️ desert', '🌳 tree', '🌲 pine tree', '🌴 palm tree',
    '🌵 cactus', '🌸 blossom', '🌻 sunflower', '🌹 rose', '🌷 tulip', '🌼 flower', '🦂 scorpion',
    '🌾 wheat', '🍂 autumn leaves', '🦔 hedgehog', '🍀 four-leaf clover', '🌰 conker', '🌱 seedling',
    '🔥 fire', '🐝 bee', '🐞 ladybird', '🦋 butterfly', '🐜 ant', '🐌 snail', '🐛 caterpillar',
    '🦗 grasshopper', '🕷️ spider', '🕸️ cobweb', '🦟 mosquito',
  ] },
  'Space and weather': { sym: '🔭', cards: [
    '☀️ sun', '🌙 moon', '🌕 full moon', '☂️ umbrella', '⭐ star', '🌠 shooting star', '☄️ comet',
    '🪐 Saturn', '🌍 Earth', '🚀 rocket', '🛸 flying saucer', '🛰️ satellite', '👩‍🚀 astronaut',
    '👽 alien', '🌌 Milky Way', '📡 satellite dish', '🌈 rainbow', '☁️ cloud', '🌧️ rain', '🌨️ snow',
    '❄️ snowflake', '⚡ lightning', '⛈️ thunderstorm', '🌪️ tornado', '🌬️ wind', '🌫️ fog',
    '🌡️ thermometer', '☃️ snowman', '🌄 sunrise', '💧 raindrop',
  ] },
  'Fairy tales': { sym: '🧚', cards: [
    '🏰 castle', '🐉 dragon', '🧙‍♀️ witch', '🧙‍♂️ wizard', '👻 ghost', '🦄 unicorn', '🧜‍♀️ mermaid',
    '👸 princess', '🤴 prince', '👑 crown', '⚔️ sword', '🛡️ shield', '🏹 bow and arrow', '🐺 wolf',
    '🧞 genie', '🧝 elf', '🧛 vampire', '🧟 zombie', '🤥 Pinocchio', '🧹 broomstick',
    '🔮 crystal ball', '🗡️ dagger', '💎 diamond', '🗝️ old key', '📜 scroll', '🏴‍☠️ pirate flag',
    '🐸 frog', '💰 money bag', '⚰️ coffin', '👹 monster',
  ] },
  Countries: { sym: '🌐', cards: [
    '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland', '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales', '🇫🇷 France', '🇪🇸 Spain', '🇮🇪 Ireland',
    '🇺🇸 America', '🇦🇺 Australia', '🇮🇹 Italy', '🇨🇳 China', '🇯🇵 Japan', '🇮🇳 India',
    '🇪🇬 Egypt', '🇩🇪 Germany', '🇨🇦 Canada', '🇯🇲 Jamaica', '🇲🇽 Mexico', '🇬🇷 Greece',
    '🇧🇷 Brazil', '🇨🇭 Switzerland', '🇳🇱 Holland', '🇳🇿 New Zealand', '🇵🇱 Poland',
    '🇿🇦 South Africa', '🇰🇪 Kenya', '🇵🇹 Portugal', '🇵🇰 Pakistan', '🇳🇬 Nigeria',
    '🇹🇭 Thailand', '🇵🇪 Peru',
  ] },
  'Around town': { sym: '🏘️', cards: [
    '🏥 hospital', '🛒 supermarket', '🏫 school', '⛪ church', '🚏 bus stop', '🏨 hotel',
    '🏤 post office', '🎪 circus', '📮 postbox', '🛍️ shopping bags', '🚦 traffic lights', '🏦 bank',
    '🏛️ museum', '🏪 corner shop', '🏕️ campsite', '⛽ petrol station', '🚉 train station',
    '🏟️ stadium', '⛲ fountain', '🅿️ car park', '🏭 factory', '🕌 mosque', '🕍 synagogue',
    '🛕 temple', '🏧 cash machine', '🚻 public toilets', '🏙️ city', '🏢 office block',
    '🌉 bridge', '💈 barber’s',
  ] },
  Sport: { sym: '🏅', cards: [
    '⚽ football', '🎾 tennis', '🏏 cricket', '🏉 rugby', '🏀 basketball', '🥊 boxing', '⛳ golf',
    '🥋 karate', '🏑 hockey', '🏒 ice hockey', '🏸 badminton', '⚾ baseball',
    '🏈 American football', '🏐 volleyball', '🏆 trophy', '🤸 gymnastics', '🥍 lacrosse',
    '⛸️ ice skating', '⛷️ skiing', '🏂 snowboarding', '🥌 curling', '🤺 fencing',
    '🏋️ weightlifting', '🚣 rowing', '🚴 cycling', '🧗 climbing', '🤼 wrestling',
    '🚵 mountain biking', '🤾 handball', '🤽 water polo',
  ] },
  School: { sym: '🎒', cards: [
    '✏️ pencil', '🖊️ pen', '🖋️ fountain pen', '🖍️ crayons', '🎨 paints', '📖 book', '📓 notebook',
    '⚛️ atom', '📝 notepad', '💯 hundred', '🌟 gold star', '🔤 alphabet', '🔢 numbers',
    '🙋 hands up', '🔬 microscope', '🧪 test tube', '🧬 DNA', '🗺️ map', '📎 paper clip',
    '📋 clipboard', '📅 calendar', '🔖 bookmark', '🧮 abacus', '📐 set square', '📊 bar chart',
    '📈 graph', '📁 folder', '🍱 lunchbox', '🧫 petri dish', '🏷️ label',
  ] },
  Transport: { sym: '🚥', cards: [
    '🚗 car', '🚕 taxi', '🚓 police car', '🏎️ racing car', '🚌 bus', '🚐 minibus', '🚛 lorry',
    '🚨 siren', '🚜 tractor', '🚒 fire engine', '🚑 ambulance', '🚲 bicycle', '🏍️ motorbike',
    '🛵 moped', '🛺 tuk-tuk', '🚂 train', '🚅 bullet train', '🚇 underground', '🚝 monorail',
    '🚋 tram', '🛤️ train track', '✈️ aeroplane', '🚁 helicopter', '🚡 cable car', '🛶 canoe',
    '🚤 speedboat', '⛴️ ferry', '🛳️ cruise ship', '🚢 ship', '🦽 wheelchair',
  ] },
  Celebrations: { sym: '🎈', cards: [
    '🎂 birthday cake', '🎁 presents', '🐰 Easter bunny', '🥳 party', '🎊 confetti', '🎄 Christmas',
    '🎅 Father Christmas', '🤶 Mrs Claus', '👼 angel', '🎃 Halloween', '💌 love letter',
    '💒 wedding', '👰 bride', '🤵 groom', '💐 bouquet', '🎆 fireworks', '🎇 sparkler',
    '🧨 firecracker', '🪔 Diwali', '🕎 Hanukkah', '🏮 lantern', '🕺 disco', '🎓 graduation',
    '🦌 reindeer', '✨ sparkles', '💘 Valentine’s Day', '💏 kiss', '🎖️ medal', '🕯️ candle',
    '💑 couple',
  ] },
  'Toys and games': { sym: '🎲', cards: [
    '🧸 teddy bear', '🎎 dolls', '🤖 robot', '🦕 dinosaur', '🦖 T-Rex', '🦸 superhero', '🪁 kite',
    '🪀 yo-yo', '🥎 ball', '🥏 frisbee', '🔫 water pistol', '🛷 sledge', '🪂 parachute',
    '🧩 jigsaw', '♟️ chess', '🃏 playing cards', '🎮 controller', '🕹️ joystick', '🎱 pool',
    '🛹 skateboard', '🛴 scooter', '🎳 skittles', '🏓 table tennis', '🎯 dartboard', '🦹 villain',
    '👾 space invader', '♠️ spades', '♣️ clubs', '⛺ tent', '🥅 goal',
  ] },
  Music: { sym: '🎶', cards: [
    '🎸 guitar', '🥁 drums', '🎹 piano', '🎻 violin', '🎺 trumpet', '🎷 saxophone', '🪕 banjo',
    '📯 horn', '🔔 bell', '🔁 repeat', '🎤 microphone', '🎧 headphones', '📻 radio', '💿 CD',
    '🔊 speaker', '📣 megaphone', '⏩ fast forward', '💃 dancer', '🎼 treble clef',
    '👩‍🎤 pop star', '🩰 ballet', '🎫 ticket', '▶️ play button', '⏸️ pause button', '🔇 mute',
    '⏹️ stop button', '🤘 rock on', '⏪ rewind', '🔀 shuffle', '⏺️ record button',
  ] },
  'Signs and symbols': { sym: '🔣', cards: [
    '🛑 stop', '⛔ no entry', '⚠️ warning', '♻️ recycling', '#️⃣ hashtag', '🚼 baby changing',
    '🚭 no smoking', '📵 no phones', '🚳 no bikes', '🚸 children crossing', '✅ tick', '❌ cross',
    '❓ question mark', '❗ exclamation mark', '➕ plus', '➖ minus', '🟥 square', '➗ divide',
    '⭕ circle', '🆘 SOS', '🆕 new', '🏁 chequered flag', '🏳️ white flag', 'ℹ️ information',
    '⬆️ arrow', '🔺 triangle', '♾️ infinity', '☢️ radioactive', '🚮 litter', '📶 signal',
  ] },
};

/* EVERY CARD AS `[category, word, picture]`, read out of '🍕 pizza' at its first space — see "a card is written as it is drawn" over `IMP_DECK`. § */
function impCards_() {
  const all = [];
  Object.keys(IMP_DECK).forEach(c => ((IMP_DECK[c] || {}).cards || []).forEach(s => {
    const str = String(s), sp = str.indexOf(' ');
    const sym = sp > 0 ? str.slice(0, sp) : '';
    all.push(sym && !/[A-Za-z]/.test(sym) ? [c, str.slice(sp + 1), sym] : [c, str, '']);
  }));
  return all;
}

/* ONE PILE OF EVERY (category, word) PAIR, shuffled once and dealt from the top, so no word comes round twice until the whole deck has — which is the same § */
let IMP_PILE = [];
function impDraw_() {
  if (!IMP_PILE.length) IMP_PILE = herdShuffle_(impCards_());
  return IMP_PILE.pop();
}

/* HOW MANY PLAY IS KEPT ON THE DEVICE, because it is the same four people at the same table next
   week. The try is the house rule for storage: a browser that refuses it still gets a game. */
function impCount_(n) {
  if (n !== undefined) {
    try { localStorage.setItem('imp-n', String(n)); } catch (e) {}
    return n;
  }
  let v = 4;
  try { v = parseInt(localStorage.getItem('imp-n'), 10) || 4; } catch (e) {}
  return Math.max(IMP_MIN, Math.min(IMP_MAX, v));
}

/* ---------- READ ALOUD, FOR THE ONES WHO CANNOT READ YET § */
function impCanSay_() { return canSay_(); }
function impAloud_(on) {
  if (on !== undefined) {
    try { localStorage.setItem('imp-aloud', on ? '1' : '0'); } catch (e) {}
    return on;
  }
  let v = false;
  try { v = localStorage.getItem('imp-aloud') === '1'; } catch (e) {}
  return v && impCanSay_();
}
function impHush_() { hush_(); }
/* THE VOICE IS `say_`'s (shell.js), shared with a question's Read aloud since 394; quieter here, because the phone is passed round a table. */
function impSay_(text) {
  if (!impAloud_()) return;
  say_(text, { rate: 0.9, volume: 0.6 });
}

/* `phase` IS ONE OF idle · deal · play · reveal, and `at` is whose turn it is to look while dealing. § */
const IMP_IDLE = () => ({ phase: 'idle', n: 0, at: 0, shown: false, imp: 0, first: 0, cat: '', word: '',
                          sym: '', catSym: '' });
let IMP = IMP_IDLE();

/* ---------- A SECOND TAP IS NOT A SECOND PRESS § */
const IMP_GAP = 600;
let IMP_PRESSED = -Infinity;
function impTooSoon_(e) {
  if (!e) return false;
  try { return performance.now() - IMP_PRESSED < IMP_GAP; } catch (err) { return false; }
}
function impPressed_(e) {
  if (!e) return;
  try { IMP_PRESSED = performance.now(); } catch (err) {}
}

function impDeal_(n) {
  const [cat, word, sym] = impDraw_();
  IMP = { phase: 'deal', n: n, at: 0, shown: false,
          imp: Math.floor(Math.random() * n), first: Math.floor(Math.random() * n),
          cat: cat, word: word, sym: sym || '', catSym: (IMP_DECK[cat] || {}).sym || '' };
}

/* THE SLOTS EVERY SCREEN FROM THE FIRST HAND-OVER TO "Reveal" IS DRAWN IN — see "the big line and the button do not move" above: § */
function impFrame_(sym, big, small, button, foot, imp) {
  return `<p class="imp-sym${imp ? ' is-imp' : ''}" aria-hidden="true">${esc(sym)}</p>
    <p class="art-word imp-big">${esc(big)}</p>
    <p class="art-cat-of imp-lab">${esc(small)}</p>
    ${button}${foot || ''}`;
}
/* THE MARK BESIDE THE WORD, NOT INSTEAD OF IT — `tile_`'s own rule turned round, because a gold button that a reader reads and a non-reader recognises has to § */
const impShow_ = () => `${tile_({ form: true, look: `art-go imp-go`, attrs: `data-do="imp-show"`, html: `${tileIcon_('show')}<span>Show</span>` })}`;
const impHideBtn_ = () => `${tile_({ form: true, look: `art-go imp-go`, attrs: `data-do="imp-hide"`, html: `${tileIcon_('hide')}<span>Hide</span>` })}`;
const impReveal_ = () => `${tile_({ form: true, look: `art-go imp-go`, attrs: `data-do="imp-reveal"`, html: `<span>Reveal</span>` })}`;

/* ---------- READ ALOUD IS A TILE, THE REELS' SOUND TILE'S OWN PAIR § */
const impAloudTile_ = on => tile_({ icon: on ? 'sound' : 'mute', label: on ? 'Read aloud on' : 'Read aloud off',
                                    act: 'imp-aloud', cls: 'imp-aloud', on: !!on, pressed: !!on });

/* DRAWN FROM THE STATE, the `REEL_HELD` rule — the handlers change `IMP` and ask for a paint, and nothing is ever patched onto the element. § */
function impPaint() {
  const card = $('imp-card'), acts = $('imp-acts');
  if (!card) return;
  const s = IMP;
  const player = i => 'Player ' + (i + 1);
  if (acts) acts.innerHTML = '';
  if (s.phase === 'idle') {
    const n = impCount_();
    const on = impAloud_();
    card.innerHTML = `<p class="art-cat-of">Players</p>
      <div class="imp-count">
        ${tile_({ form: true, look: `imp-step`, attrs: `data-do="imp-count" data-d="-1" aria-label="One player fewer"           ${n <= IMP_MIN ? 'disabled' : ''}`, html: `&minus;` })}
        <span class="art-score" id="imp-n">${n}</span>
        ${tile_({ form: true, look: `imp-step`, attrs: `data-do="imp-count" data-d="1" aria-label="One player more"           ${n >= IMP_MAX ? 'disabled' : ''}`, html: `+` })}
      </div>
      ${impCanSay_() ? impAloudTile_(on) : ''}
      ${tile_({ form: true, look: `art-go`, attrs: `data-do="imp-begin"`, html: `Deal` })}`;
    return;
  }
  const aloud = impAloud_();
  const room = aloud ? '<span class="imp-foot" aria-hidden="true"></span>' : '';
  if (s.phase === 'deal' && !s.shown) {
    card.innerHTML = impFrame_('', player(s.at), '', impShow_(), room);
    return;
  }
  /* THE IMPOSTER'S CARD CARRIES THE CATEGORY'S PICTURE where everybody else's carries the word's — see "every card has a picture" above: § */
  if (s.phase === 'deal') {
    const me = s.at === s.imp;
    card.innerHTML = impFrame_(me ? s.catSym : s.sym, me ? 'Imposter' : s.word, me ? s.cat : '', impHideBtn_(),
      aloud ? tile_({ icon: 'speak', label: 'Listen', act: 'imp-listen', tone: 'listen' }) : '', me);
    return;
  }
  if (s.phase === 'play') {
    card.innerHTML = impFrame_(s.catSym, player(s.first) + ' starts', s.cat, impReveal_(), room);
    return;
  }
  /* THE REVEAL: who, and the word with its picture. § */
  card.innerHTML = `<p class="art-over">Imposter</p>
    <p class="art-score">${esc(player(s.imp))}</p>
    <p class="imp-sym" aria-hidden="true">${esc(s.sym)}</p>
    <p class="art-word">${esc(s.word)}</p>`;
  if (acts) {
    acts.innerHTML = `${tile_({ form: true, label: 'Deal', act: 'imp-again' })}
      ${tile_({ form: true, label: 'Players', act: 'imp-players', kind: 'quiet' })}`;
  }
}

function initImposter() {
  if (!$('imp-card')) return;
  impPaint();
}

/* A WORD LEFT UP WHEN THE COLUMN GOES IS A WORD THE NEXT PERSON SEES, so leaving hides it. § */
function impHide_() {
  impHush_();
  /* AND REPAINTED, not just forgotten: the column is still in the document off to one side, so a
     word left in its markup is a word the next repaint of anything is not obliged to remove. */
  if (IMP.phase === 'deal' && IMP.shown) { IMP.shown = false; impPaint(); }
}

on('imp-count', el => {
  const d = parseInt(el.getAttribute('data-d'), 10) || 0;
  impCount_(Math.max(IMP_MIN, Math.min(IMP_MAX, impCount_() + d)));
  impPaint();
});
on('imp-aloud', () => { impAloud_(!impAloud_()); impPaint(); });
on('imp-begin', (el, e) => { impHush_(); impPressed_(e); impDeal_(impCount_()); impPaint(); });
/* SHOW, HIDE AND REVEAL TAKE `(el, e)` FOR `impTooSoon_` — see "a second tap is not a second press" —
   and so do the reveal's Deal and Players, below. */
on('imp-show', (el, e) => {
  if (IMP.phase !== 'deal' || IMP.shown) return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP.shown = true;
  impPaint();
});
/* THE ONLY PLACE ANYTHING IS SPOKEN, and only with the card up — so only by the person who pressed Show. § */
on('imp-listen', () => {
  if (IMP.phase !== 'deal' || !IMP.shown) return;
  impHush_();
  impSay_(IMP.at === IMP.imp ? 'Imposter' : String(IMP.word));
});
/* HUSHED BEFORE THE GUARD, so a second tap that is ignored still stops the voice — which is never
   wrong when the phone may be on its way to somebody else. */
on('imp-hide', (el, e) => {
  impHush_();
  if (IMP.phase !== 'deal' || !IMP.shown) return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP.shown = false;
  if (IMP.at < IMP.n - 1) IMP.at++;
  else IMP.phase = 'play';
  impPaint();
});
/* GUARDED BEFORE THE HUSH, the other way round from Hide. § */
on('imp-reveal', (el, e) => {
  if (IMP.phase !== 'play') return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  impHush_();
  IMP.phase = 'reveal';
  impPaint();
});
/* `imp-again` IS THE REVEAL'S "Deal" — it was "Play again" until the 11 Oct trim — and deals for the same number of players without going back through the setup § */
on('imp-again', (el, e) => {
  impHush_();
  if (impTooSoon_(e)) return;
  impPressed_(e);
  impDeal_(IMP.n || impCount_());
  impPaint();
});
on('imp-players', (el, e) => {
  impHush_();
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP = IMP_IDLE();
  impPaint();
});

/* FOUR CLASSROOM GAMES — Just a Minute, Taboo, Hot Seat and 20 Questions. § */
/* ---------- THE DECKS § */
const JAM_DECK = [
  'My perfect Saturday', 'The best invention ever', 'Breakfast', 'My dream holiday',
  'Rainy days', 'Forests', 'Learning to ride a bike', 'Space travel', 'The perfect sandwich',
  'Why homework exists', 'Being the youngest', 'Being the oldest', 'Snow days', 'Board games',
  'The seaside', 'The perfect pet', 'Pets I would like', 'Things that make me laugh', 'Ice cream flavours',
  'Superheroes', 'If I ruled the world', 'Inventing a new sport', 'My bedroom', 'Going underground',
  'The smell of rain', 'Shoes', 'Grandparents', 'Camping', 'The moon', 'Wild animals', 'Nature walks',
  'Video games', 'Bath time', 'Autumn leaves', 'Sleep', 'Musical instruments',
  'The journey to school', 'Tidying up', 'Splashing about', 'Animals in the sea', 'Animals at night', 'The ocean floor',
  'Trees', 'My favourite colour', 'Hats', 'Birds in the garden', 'Things I would invent', 'Time travel',
  'Being invisible for a day', 'Flying cars', 'The best smell in the world', 'Cooking',
  'Gardening', 'Maths', 'Why we go to school', 'My favourite animal', 'Mobile phones', 'Tiny things', 'The sun',
  'Mountains', 'Rivers', 'Treasure', 'Things that need batteries', 'A day without screens', 'Ghost stories', 'The Romans',
  'The ancient Egyptians', 'Things that fly', 'Farm animals', 'Big cats', 'The jungle', 'The Arctic',
  'My best friend', 'Lucky things', 'Keeping a secret', 'Making new friends', 'Being brave', 'Things I am good at', 'Something I would like to learn', 'Old toys', 'Staying up late',
  'Farms', 'Circuses', 'Theme parks', 'Roller coasters', 'Running', 'Dancing', 'Singing',
  'Drawing', 'Reading', 'Writing stories', 'Comics', 'Cartoons', 'Haircuts', 'Teeth',
  'My favourite book', 'Manners', 'Shopping', 'Money', 'Saving up', 'Pocket money', 'Chores', 'Weather',
  'Thunder', 'Windy days', 'Summer holidays', 'The first day of school', 'Lost property',
  'Lunchtime', 'Packed lunches', 'School dinners', 'Digging in the garden', 'Origami',
  'Lego', 'Slime', 'Magic tricks', 'Quiet places', 'Building a den', 'Picnics', 'Big cities',
  'Bread', 'Cheese', 'Getting up in the morning', 'Vegetables I like', 'Vegetables I do not like', 'Fruit',
  'Cereal', 'Toast', 'Soup', 'Puddings', 'Sweets', 'Biscuits', 'My best day ever',
  'The worst present I ever got', 'What I want to be when I grow up', 'Holidays at home',
  'Car journeys', 'Aeroplanes', 'Boats', 'Buses', 'Lazy Sundays', 'Tall buildings', 'Museums',
  'Football boots', 'Pet fish', 'My favourite film', 'Cats', 'Sports day', 'Hamsters', 'School trips',
  'Fairy tales', 'People I look up to', 'Bugs in the garden', 'Stars', 'Planets', 'Saving the planet', 'Swimming lessons',
  'Mysteries', 'Kings and queens', 'Puzzles', 'Myths and legends', 'Numbers', 'Shapes', 'Team games',
  'Hot places', 'Seasons', 'Winter', 'Spring', 'Summer', 'Autumn',
];

/* TABOO: THE WORD, THEN THE FIVE YOU MAY NOT SAY. The five are the words anybody would reach for
   first — which is the whole game — so they are the obvious ones, not the clever ones. */
const TABOO_DECK = [
  ['pizza', 'cheese', 'Italy', 'slice', 'tomato', 'topping'],
  ['library', 'books', 'borrow', 'quiet', 'read', 'shelves'],
  ['birthday', 'cake', 'candles', 'party', 'present', 'age'],
  ['snowman', 'snow', 'carrot', 'winter', 'build', 'melt'],
  ['space suit', 'space', 'astronaut', 'helmet', 'wear', 'moon'],
  ['dinosaur', 'extinct', 'T. rex', 'fossil', 'reptile', 'Jurassic'],
  ['penalty kick', 'football', 'goal', 'spot', 'shoot', 'keeper'],
  ['eye patch', 'pirate', 'eye', 'cover', 'black', 'one'],
  ['toothpaste', 'teeth', 'brush', 'tube', 'mint', 'white'],
  ['volcanic eruption', 'lava', 'mountain', 'explode', 'ash', 'hot'],
  ['cornflakes', 'cereal', 'breakfast', 'milk', 'bowl', 'corn'],
  ['ice skates', 'ice', 'rink', 'blades', 'skate', 'boots'],
  ['jelly beans', 'sweets', 'jelly', 'beans', 'colourful', 'chewy'],
  ['rainforest', 'trees', 'Amazon', 'jungle', 'wet', 'animals'],
  ['homework', 'school', 'teacher', 'evening', 'worksheet', 'due'],
  ['pencil case', 'pens', 'school', 'zip', 'bag', 'pencils'],
  ['hula hoop', 'hips', 'spin', 'circle', 'plastic', 'wiggle'],
  ['cobweb', 'spider', 'web', 'dust', 'corner', 'sticky'],
  ['bicycle', 'pedal', 'wheels', 'ride', 'helmet', 'bike'],
  ['popcorn', 'cinema', 'corn', 'pop', 'butter', 'snack'],
  ['ghost', 'scary', 'haunted', 'boo', 'sheet', 'spirit'],
  ['castle', 'king', 'tower', 'moat', 'drawbridge', 'stone'],
  ['rocket', 'space', 'launch', 'blast off', 'astronaut', 'fly'],
  ['dragon', 'fire', 'wings', 'breathe', 'myth', 'scales'],
  ['sticky tape', 'stick', 'roll', 'clear', 'wrap', 'Sellotape'],
  ['lifejacket', 'boat', 'float', 'water', 'safety', 'wear'],
  ['pyjamas', 'bed', 'sleep', 'night', 'wear', 'clothes'],
  ['zebra', 'stripes', 'horse', 'Africa', 'black', 'white'],
  ['scrambled eggs', 'eggs', 'breakfast', 'toast', 'mix', 'yellow'],
  ['hospital', 'doctor', 'nurse', 'ill', 'ward', 'ambulance'],
  ['combine harvester', 'farm', 'wheat', 'field', 'machine', 'crops'],
  ['robot', 'machine', 'metal', 'beep', 'computer', 'program'],
  ['unicorn', 'horn', 'horse', 'magic', 'rainbow', 'myth'],
  ['scuba tank', 'diving', 'air', 'underwater', 'oxygen', 'back'],
  ['raincoat', 'rain', 'wet', 'coat', 'hood', 'waterproof'],
  ['throne', 'king', 'queen', 'chair', 'royal', 'sit'],
  ['carrot', 'orange', 'vegetable', 'rabbit', 'root', 'eat'],
  ['magnet', 'attract', 'metal', 'fridge', 'north', 'pull'],
  ['tape measure', 'measure', 'metres', 'long', 'ruler', 'centimetres'],
  ['skeleton', 'bones', 'body', 'skull', 'Halloween', 'ribs'],
  ['cocoon', 'caterpillar', 'butterfly', 'silk', 'change', 'wrap'],
  ['train', 'track', 'station', 'carriage', 'railway', 'driver'],
  ['safari', 'Africa', 'animals', 'jeep', 'lions', 'wild'],
  ['sunflower', 'yellow', 'tall', 'seeds', 'petals', 'flower'],
  ['bathtub', 'water', 'bubbles', 'wash', 'bathroom', 'soak'],
  ['honey', 'bee', 'sweet', 'sticky', 'jar', 'golden'],
  ['clock', 'time', 'hands', 'tick', 'hour', 'wall'],
  ['moustache', 'face', 'hair', 'lip', 'beard', 'shave'],
  ['lettuce', 'salad', 'green', 'leaves', 'vegetable', 'rabbit'],
  ['treasure map', 'X', 'pirate', 'dig', 'gold', 'island'],
  ['microscope', 'small', 'lens', 'science', 'look', 'cells'],
  ['banana', 'yellow', 'fruit', 'peel', 'monkey', 'bunch'],
  ['scarecrow', 'farm', 'birds', 'straw', 'field', 'crows'],
  ['roller blades', 'skates', 'wheels', 'roll', 'boots', 'skating'],
  ['suit of armour', 'knight', 'metal', 'wear', 'castle', 'protect'],
  ['lemon', 'yellow', 'sour', 'fruit', 'juice', 'citrus'],
  ['firework', 'bang', 'sky', 'night', 'November', 'sparkle'],
  ['midnight snack', 'night', 'food', 'kitchen', 'sleep', 'eat'],
  ['school bus', 'yellow', 'children', 'ride', 'driver', 'morning'],
  ['paintbrush', 'paint', 'art', 'bristles', 'colour', 'canvas'],
  ['zip wire', 'slide', 'rope', 'fast', 'harness', 'trees'],
  ['igloo', 'ice', 'snow', 'house', 'cold', 'dome'],
  ['boomerang', 'Australia', 'throw', 'come back', 'curved', 'wood'],
  ['spaceship', 'alien', 'fly', 'space', 'UFO', 'rocket'],
  ['tooth fairy', 'tooth', 'pillow', 'money', 'night', 'fairy'],
  ['toffee apple', 'apple', 'sticky', 'sweet', 'stick', 'fair'],
  ['strawberry', 'red', 'fruit', 'seeds', 'cream', 'summer'],
  ['climbing frame', 'climb', 'playground', 'bars', 'monkey', 'park'],
  ['hot chocolate', 'drink', 'warm', 'cocoa', 'mug', 'marshmallows'],
  ['magic wand', 'magic', 'wizard', 'spell', 'stick', 'wave'],
  ['garden', 'grass', 'flowers', 'outside', 'plants', 'shed'],
  ['bakery', 'bread', 'cakes', 'shop', 'oven', 'bake'],
  ['swimming pool', 'water', 'swim', 'dive', 'lane', 'chlorine'],
  ['broccoli', 'green', 'vegetable', 'tree', 'healthy', 'florets'],
  ['tractor', 'farm', 'field', 'drive', 'wheels', 'plough'],
  ['alien', 'space', 'green', 'Mars', 'UFO', 'planet'],
  ['handbag', 'bag', 'carry', 'purse', 'shoulder', 'strap'],
  ['football pitch', 'grass', 'goal', 'lines', 'play', 'match'],
  ['snowball', 'snow', 'throw', 'cold', 'round', 'fight'],
  ['school bell', 'ring', 'school', 'break', 'loud', 'lesson'],
  ['marshmallow', 'soft', 'pink', 'white', 'toast', 'sweet'],
  ['abacus', 'beads', 'count', 'maths', 'wires', 'add'],
  ['zoo', 'animals', 'cages', 'visit', 'keeper', 'lion'],
  ['blanket', 'bed', 'warm', 'cover', 'wool', 'snuggle'],
  ['bubblegum', 'chew', 'blow', 'pink', 'sticky', 'pop'],
  ['egg cup', 'egg', 'boiled', 'breakfast', 'cup', 'spoon'],
  ['bookcase', 'books', 'shelves', 'wood', 'library', 'furniture'],
  ['traffic lights', 'red', 'green', 'amber', 'road', 'stop'],
  ['gravy', 'sauce', 'roast', 'brown', 'meat', 'dinner'],
  ['rollercoaster', 'ride', 'fast', 'theme park', 'loop', 'scream'],
  ['potato', 'chips', 'vegetable', 'mash', 'jacket', 'crisps'],
  ['cardigan', 'wool', 'jumper', 'buttons', 'wear', 'knit'],
  ['bridge', 'river', 'cross', 'over', 'water', 'road'],
  ['rainstorm', 'rain', 'wet', 'clouds', 'umbrella', 'heavy'],
  ['satchel', 'bag', 'leather', 'school', 'strap', 'books'],
  ['surfboard', 'waves', 'sea', 'beach', 'stand', 'ride'],
  ['playground', 'swings', 'slide', 'school', 'break', 'play'],
  ['nest', 'bird', 'eggs', 'tree', 'twigs', 'build'],
  ['leaf', 'tree', 'green', 'autumn', 'fall', 'plant'],
  ['oasis', 'desert', 'water', 'palm', 'sand', 'island'],
  ['pillow fight', 'pillow', 'feathers', 'bed', 'hit', 'sleepover'],
  ['mud', 'dirty', 'wet', 'brown', 'puddle', 'pig'],
  ['crisps', 'packet', 'salt', 'potato', 'crunch', 'snack'],
  ['wooden spoon', 'spoon', 'stir', 'kitchen', 'wood', 'cooking'],
  ['snowboard', 'snow', 'mountain', 'board', 'ski', 'slope'],
  ['cupcake', 'cake', 'icing', 'small', 'bake', 'sprinkles'],
  ['birdhouse', 'bird', 'box', 'garden', 'nest', 'wood'],
  ['lily pad', 'pond', 'frog', 'float', 'leaf', 'water'],
  ['map', 'directions', 'country', 'lost', 'paper', 'roads'],
  ['grandad', 'old', 'grandma', 'family', 'dad', 'grandparent'],
  ['bus stop', 'wait', 'bus', 'sign', 'road', 'shelter'],
  ['ketchup', 'red', 'sauce', 'tomato', 'chips', 'bottle'],
  ['science fair', 'science', 'experiment', 'school', 'project', 'show'],
  ['doorknob', 'door', 'handle', 'turn', 'open', 'round'],
  ['hot-water bottle', 'warm', 'bed', 'rubber', 'cold', 'fill'],
  ['fingerprint', 'finger', 'print', 'police', 'clue', 'swirl'],
  ['stopwatch', 'time', 'race', 'seconds', 'start', 'clock'],
  ['bookworm', 'read', 'books', 'worm', 'library', 'love'],
  ['greenhouse', 'glass', 'plants', 'garden', 'warm', 'grow'],
  ['cuckoo clock', 'bird', 'time', 'Switzerland', 'wooden', 'hour'],
  ['water bottle', 'drink', 'plastic', 'fill', 'thirsty', 'lid'],
  ['snowdrop', 'flower', 'white', 'winter', 'spring', 'snow'],
  ['goldfish', 'orange', 'bowl', 'pet', 'swim', 'memory'],
  ['tennis racket', 'ball', 'strings', 'hit', 'court', 'sport'],
  ['skyscraper', 'tall', 'building', 'city', 'floors', 'lift'],
  ['rubber duck', 'bath', 'yellow', 'toy', 'float', 'quack'],
  ['sunglasses', 'sun', 'eyes', 'dark', 'summer', 'wear'],
  ['shepherd’s pie', 'potato', 'mince', 'meat', 'oven', 'dinner'],
  ['moon landing', 'moon', 'astronaut', 'Apollo', 'step', 'space'],
  ['pin cushion', 'pins', 'sewing', 'needle', 'soft', 'prick'],
  ['braces', 'teeth', 'metal', 'dentist', 'straighten', 'smile'],
  ['cardboard box', 'cardboard', 'brown', 'packing', 'move', 'square'],
];

/* HOT SEAT: THINGS, NOT IDEAS. The class shouts clues at somebody who cannot see the word, so it has
   to be a thing everybody in the room can describe in a hurry. */
const HOT_DECK = [
  'pineapple', 'sledge', 'lantern', 'footstool', 'mittens', 'lobster', 'saxophone', 'windmill',
  'fire engine', 'wardrobe', 'doughnut', 'tiara', 'paddling pool', 'snorkel', 'coconut',
  'treehouse', 'jet ski', 'yo-yo', 'wellington boots', 'xylophone', 'raft', 'pumpkin',
  'scooter', 'spanner', 'radish', 'watermelon', 'cauliflower', 'bagpipes', 'snowplough',
  'ferris wheel', 'hot-air balloon', 'cannon', 'parachute', 'shopping basket', 'apron',
  'tambourine', 'tuba', 'sausage', 'meringue', 'kiwi fruit', 'avocado', 'mango', 'cherry',
  'grapes', 'plum', 'pepper', 'cucumber', 'sweetcorn', 'peas', 'fish pie', 'lasagne',
  'burrito', 'crumpet', 'fish and chips', 'hosepipe', 'flapjack', 'trifle', 'custard',
  'porridge', 'muffin', 'croissant', 'bagel', 'pretzel', 'waffle', 'smoothie', 'milkshake',
  'lemonade', 'orange juice', 'kazoo', 'cello', 'flute', 'recorder', 'harp', 'banjo',
  'accordion', 'maracas', 'triangle', 'cymbals', 'ukulele', 'drumsticks', 'helicopter',
  'canoe', 'tram', 'police car', 'motorbike', 'lorry', 'ferry', 'cable car', 'go-kart',
  'tandem', 'unicycle', 'roller skates', 'pogo stick', 'space hopper', 'helter-skelter',
  'climbing wall', 'bowling ball', 'dartboard', 'chessboard', 'playing cards', 'dice',
  'marbles', 'teddy bear', 'rocking horse', 'doll’s house', 'toy garage', 'kaleidoscope',
  'magnifying glass', 'binoculars', 'globe', 'atlas', 'dictionary', 'encyclopaedia',
  'notebook', 'pencil sharpener', 'protractor', 'set square', 'highlighter', 'crayon',
  'felt-tip pen', 'chalk', 'blackboard', 'easel', 'paint palette', 'clay', 'glitter',
  'tinsel', 'bauble', 'stocking', 'wreath', 'snow globe', 'cracker', 'paper chain', 'stilts',
  'bus ticket', 'feather duster', 'nutcracker', 'tutu', 'gazebo', 'fountain', 'bird table',
];

/* 20 QUESTIONS: A PERSON, A PLACE OR A THING, and the people are from history lessons and books rather than from this week's news — a living celebrity is a card § */
const TWQ_DECK = {
  Person: [
    'Isaac Newton', 'Florence Nightingale', 'Albert Einstein', 'William Shakespeare',
    'Queen Victoria', 'Henry VIII', 'Charles Darwin', 'Marie Curie', 'Neil Armstrong',
    'Amelia Earhart', 'Leonardo da Vinci', 'Mary Seacole', 'Julius Caesar', 'Cleopatra',
    'Tutankhamun', 'Rosa Parks', 'Nelson Mandela', 'Martin Luther King', 'Emmeline Pankhurst',
    'Winston Churchill', 'Isambard Kingdom Brunel', 'Ada Lovelace', 'Alan Turing',
    'Grace Darling', 'Guy Fawkes', 'King Arthur', 'Father Christmas', 'Charles Dickens',
    'Sherlock Holmes', 'Boudicca', 'Thomas Edison', 'Galileo', 'Christopher Columbus',
    'Beatrix Potter', 'Roald Dahl', 'Mozart', 'Elizabeth I', 'Louis Braille', 'Sir Francis Drake',
    'Mickey Mouse', 'Wonder Woman', 'Anne Frank', 'Jane Austen', 'Captain Cook',
  ],
  Place: [
    'Mars', 'Jupiter', 'Saturn', 'Venus', 'Neptune', 'Africa', 'Lapland', 'London', 'Cardiff',
    'Disneyland', 'a dentist’s waiting room', 'a lifeboat station', 'a fish market', 'a fire station',
    'an attic', 'a bamboo forest', 'a coral island', 'a farmyard',
    'a football stadium', 'a swimming baths', 'a canal boat', 'a space station',
    'a log cabin', 'a bus garage', 'an aquarium', 'a toy shop', 'a post office',
    'a seesaw', 'a vegetable patch', 'a haunted house', 'the top of a mountain',
    'the bottom of the sea', 'a matchbox', 'a supermarket checkout', 'a laundrette',
    'a car wash', 'a petrol station', 'a harbour', 'a pet shop', 'a sweet shop',
    'an ice rink', 'a village hall', 'a cruise ship', 'a recording studio',
  ],
  Thing: [
    'a cork', 'a teaspoon', 'a safety pin', 'a paper clip', 'a fork', 'a door handle',
    'a flower pot', 'a light switch', 'a piggy bank', 'a crown', 'a sugar cube', 'a pine cone',
    'a pine needle', 'a pebble', 'a seashell', 'a raindrop', 'a cloud', 'a pair of glasses',
    'a thimble', 'a key', 'a coin', 'a banknote', 'a tennis ball', 'a rugby ball',
    'a cricket bat', 'a golf club', 'a hockey stick', 'a frisbee', 'a bowl of cereal',
    'a slice of toast', 'a boiled egg', 'an apple core', 'a peach stone', 'a jam jar',
    'a cup of tea', 'a glass of milk', 'a bar of soap', 'a towel', 'a sock', 'a woolly hat',
    'a nail file', 'a car tyre', 'a traffic cone', 'a lunch tray',
  ],
};

const PARTY = { jam: null, tab: null, hot: null, twq: null };
const PARTY_TICK = {};

/* EVERY ROUND IS DEALT FROM A SHUFFLED PILE, refilled when it runs out — `herdShuffle_` for the
   reason its own note gives — so nothing comes round twice until everything has. */
const PARTY_PILE = {};
function partyDraw_(key, list) {
  if (!PARTY_PILE[key] || !PARTY_PILE[key].length) PARTY_PILE[key] = herdShuffle_(list);
  return PARTY_PILE[key].pop();
}

function partyMs_(s) { return s ? (s.ends ? Math.max(0, s.ends - Date.now()) : (s.left || 0)) : 0; }
function partyClock_(s) { return roundClock_(Math.ceil(partyMs_(s) / 1000)); }

/* WHERE A STOP CAME FROM: § */
function partyHere_(k) {
  if (typeof AT === 'undefined') return true;
  const scr = document.getElementById('s-' + AT);
  return !!(scr && scr.querySelector('#' + k + '-card'));
}

function partyRun_(k) {
  const s = PARTY[k];
  if (!s) return;
  clearInterval(PARTY_TICK[k]);
  s.run = true;
  s.ends = Date.now() + s.left;
  PARTY_TICK[k] = setInterval(() => partyTick_(k), 250);
}

function partyHold_(k) {
  clearInterval(PARTY_TICK[k]);
  PARTY_TICK[k] = 0;
  const s = PARTY[k];
  if (s && s.ends) { s.left = partyMs_(s); s.ends = 0; }
}

/* THE TICK WRITES THE CLOCK AND NOTHING ELSE. § */
function partyTick_(k) {
  const s = PARTY[k];
  if (!s || !s.ends) { partyHold_(k); return; }
  if (partyMs_(s) <= 0) {
    partyHold_(k);
    s.left = 0;
    s.run = false;
    PARTY_GAMES[k].end(s);
    PARTY_GAMES[k].paint();
    return;
  }
  const c = $(k + '-left');
  if (c) c.textContent = partyClock_(s);
}

/* THE WIDGET'S `start`: redraw what is in progress, and set a clock running again if a repaint is
   all that stopped it. */
function partyStart_(k) {
  const s = PARTY[k];
  if (s && s.run && !s.ends && s.left > 0) partyRun_(k);
  if (PARTY_GAMES[k]) PARTY_GAMES[k].paint();
}

/* THE WIDGET'S `stop`. § */
function partyStop_(k) {
  partyHold_(k);
  if (partyHere_(k)) return;
  const s = PARTY[k];
  if (!s) return;
  s.run = false;
  if (k === 'twq' && s.phase === 'shown') s.phase = 'hand';
  if (PARTY_GAMES[k]) PARTY_GAMES[k].paint();
}

on('party-resume', el => {
  const k = el.getAttribute('data-g');
  const s = PARTY[k];
  if (!s || s.phase !== 'go' || s.left <= 0) return;
  partyRun_(k);
  PARTY_GAMES[k].paint();
});

/* ONE PAINT FOR THE PAUSED CARD, because all four timed games pause the same way and say nothing secret while they do. § */
function partyHeld_(k, head, line, go) {
  return `<p class="art-cat-of">${esc(head)}</p>
    <p class="party-clock" id="${esc(k)}-left">${partyClock_(PARTY[k])}</p>
    ${line ? `<p class="imp-pass">${esc(line)}</p>` : ''}
    ${tile_({ form: true, look: `art-go`, attrs: `data-do="party-resume" data-g="${esc(k)}"`, html: `${esc(go || 'Resume')}` })}`;
}

function partyBits_(k) {
  return { card: $(k + '-card'), acts: $(k + '-acts'), said: $(k + '-said') };
}

/* ---------- JUST A MINUTE § */
function jamPaint() {
  const { card, acts, said } = partyBits_('jam');
  if (!card) return;
  const s = PARTY.jam;
  if (!s) {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="jam-begin"`, html: `Start` })}`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Talk for a minute. No hesitation, no repetition, no deviation.';
    return;
  }
  const t = s.tally;
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-word">${esc(s.topic)}</p>
      <p class="party-sum">Hesitation ${t.h} &middot; Repetition ${t.r} &middot; Deviation ${t.d}</p>`;
    if (acts) acts.innerHTML = `${tile_({ form: true, label: 'Next topic', act: 'jam-begin' })}`;
    if (said) said.textContent = '';
    return;
  }
  if (!s.run) {
    card.innerHTML = partyHeld_('jam', 'Paused', s.topic);
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = '';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">Talk about</p>
    <p class="art-word">${esc(s.topic)}</p>
    <p class="party-clock" id="jam-left">${partyClock_(s)}</p>`;
  if (acts) {
    acts.innerHTML = `<div class="btn-row">
      ${tile_({ form: true, look: `btn quiet party-call`, attrs: `data-do="jam-call" data-c="h"`, html: `Hesitation<b>${t.h}</b>` })}
      ${tile_({ form: true, look: `btn quiet party-call`, attrs: `data-do="jam-call" data-c="r"`, html: `Repetition<b>${t.r}</b>` })}
      ${tile_({ form: true, look: `btn quiet party-call`, attrs: `data-do="jam-call" data-c="d"`, html: `Deviation<b>${t.d}</b>` })}
    </div>`;
  }
  if (said) said.textContent = 'Tap one when somebody catches the speaker out.';
}

on('jam-begin', () => {
  partyHold_('jam');
  PARTY.jam = { phase: 'go', topic: partyDraw_('jam', JAM_DECK), left: 60000, ends: 0, run: false,
                tally: { h: 0, r: 0, d: 0 } };
  partyRun_('jam');
  jamPaint();
});
on('jam-call', el => {
  const s = PARTY.jam;
  const c = el.getAttribute('data-c');
  if (!s || s.phase !== 'go' || !s.run || !(c in s.tally)) return;
  s.tally[c]++;
  jamPaint();
});

/* GOT IT AND PASS DRAWN FROM THE START (owner, 6 Nov: Taboo, Hot Seat as Articulate): greyed until the round runs, never hidden. */
function partyPair_(act, yes, live) {
  return `<div class="btn-row">
      ${tile_({ form: true, label: yes, act, data: { got: '1' }, off: !live })}
      ${tile_({ form: true, label: 'Pass', act, data: { got: '0' }, kind: 'quiet', off: !live })}
    </div>`;
}

/* ---------- TABOO § */
function tabPaint() {
  const { card, acts, said } = partyBits_('tab');
  if (!card) return;
  const s = PARTY.tab;
  if (!s) {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="tab-begin"`, html: `Start` })}`;
    if (acts) acts.innerHTML = partyPair_('tab-next', 'Correct', false);
    if (said) said.textContent = 'Whoever is watching listens for a word from the list.';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-over">correct &middot; ${s.passed} passed</p>`;
    if (acts) acts.innerHTML = `${tile_({ form: true, label: 'Next round', act: 'tab-begin' })}`;
    if (said) said.textContent = '';
    return;
  }
  if (!s.run) {
    /* THE WORD IS NOT ON A PAUSED CARD: whoever picks the phone up next may be on the other side. */
    card.innerHTML = partyHeld_('tab', 'Paused', s.score + ' correct so far');
    if (acts) acts.innerHTML = partyPair_('tab-next', 'Correct', false);
    if (said) said.textContent = '';
    return;
  }
  const [word, ...ban] = s.card;
  card.innerHTML = `<p class="art-cat-of">Describe</p>
    <p class="art-word">${esc(word)}</p>
    <p class="art-over">Don’t say</p>
    <ul class="tab-ban">${ban.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    <p class="party-clock" id="tab-left">${partyClock_(s)}</p>`;
  if (acts) {
    acts.innerHTML = partyPair_('tab-next', 'Correct', true);
  }
  if (said) said.textContent = s.score + ' correct so far.';
}

on('tab-begin', () => {
  partyHold_('tab');
  PARTY.tab = { phase: 'go', card: partyDraw_('tab', TABOO_DECK), score: 0, passed: 0,
                left: 60000, ends: 0, run: false };
  partyRun_('tab');
  tabPaint();
});
on('tab-next', el => {
  const s = PARTY.tab;
  if (!s || s.phase !== 'go' || !s.run) return;
  if (el.getAttribute('data-got') === '1') s.score++; else s.passed++;
  s.card = partyDraw_('tab', TABOO_DECK);
  tabPaint();
});

/* ---------- HOT SEAT § */
function hotPaint() {
  const { card, acts, said } = partyBits_('hot');
  if (!card) return;
  const s = PARTY.hot;
  if (!s) {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="hot-begin"`, html: `Start` })}`;
    if (acts) acts.innerHTML = partyPair_('hot-next', 'Got it', false);
    if (said) said.textContent = 'Whoever is in the hot seat sits with their back to the screen.';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-over">guessed</p>`;
    if (acts) acts.innerHTML = `${tile_({ form: true, label: 'Next player', act: 'hot-begin' })}`;
    if (said) said.textContent = '';
    return;
  }
  if (!s.run) {
    card.innerHTML = partyHeld_('hot', s.left < 60000 ? 'Paused' : 'Ready',
      'Hold the phone up so only the class can see it.', 'Show the word');
    if (acts) acts.innerHTML = partyPair_('hot-next', 'Got it', false);
    if (said) said.textContent = 'The one in the hot seat does not look.';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">Clues for</p>
    <p class="art-word hot-word">${esc(s.word)}</p>
    <p class="party-clock" id="hot-left">${partyClock_(s)}</p>`;
  if (acts) {
    acts.innerHTML = partyPair_('hot-next', 'Got it', true);
  }
  if (said) said.textContent = s.score + ' guessed so far.';
}

on('hot-begin', () => {
  partyHold_('hot');
  PARTY.hot = { phase: 'go', word: partyDraw_('hot', HOT_DECK), score: 0, left: 60000, ends: 0,
                run: false };
  hotPaint();
});
on('hot-next', el => {
  const s = PARTY.hot;
  if (!s || s.phase !== 'go' || !s.run) return;
  if (el.getAttribute('data-got') === '1') s.score++;
  s.word = partyDraw_('hot', HOT_DECK);
  hotPaint();
});

/* ---------- 20 QUESTIONS § */
const TWQ_MAX = 20;

function twqPaint() {
  const { card, acts, said } = partyBits_('twq');
  if (!card) return;
  const s = PARTY.twq;
  if (!s) {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="twq-begin"`, html: `Choose a secret` })}`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'One of you holds the phone and answers; everybody else asks.';
    return;
  }
  if (s.phase === 'hand') {
    card.innerHTML = `<p class="imp-pass">Hand the phone to <b>whoever answers</b></p>
      ${tile_({ form: true, look: `art-go`, attrs: `data-do="twq-show"`, html: `Show me` })}`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Nobody else looks.';
    return;
  }
  if (s.phase === 'shown') {
    card.innerHTML = `<p class="art-cat-of">${esc(s.cat)}</p>
      <p class="art-word">${esc(s.word)}</p>
      ${tile_({ form: true, look: `art-go`, attrs: `data-do="twq-hide"`, html: `Hide it` })}`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Remember it, then hide it.';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">${s.asked >= TWQ_MAX ? 'Out of questions' : 'It was'}</p>
      <p class="art-word">${esc(s.word)}</p>
      <p class="art-over">${s.asked} of ${TWQ_MAX} questions asked</p>`;
    if (acts) acts.innerHTML = `${tile_({ form: true, label: 'Play again', act: 'twq-begin' })}`;
    if (said) said.textContent = '';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">It’s a ${esc(s.cat.toLowerCase())}</p>
    <p class="art-score">${s.asked} <span class="party-of">of ${TWQ_MAX}</span></p>
    <p class="art-over">questions asked</p>`;
  if (acts) {
    acts.innerHTML = `<div class="btn-row">
      ${tile_({ form: true, label: 'Yes', act: 'twq-ask' })}
      ${tile_({ form: true, label: 'No', act: 'twq-ask' })}
    </div>
    ${tile_({ form: true, label: 'Reveal', act: 'twq-reveal', kind: 'quiet', cls: 'party-more' })}`;
  }
  if (said) said.textContent = 'Answer each question, then tap how you answered.';
}

on('twq-begin', () => {
  const [cat, word] = partyDraw_('twq', Object.keys(TWQ_DECK)
    .reduce((all, c) => all.concat(TWQ_DECK[c].map(w => [c, w])), []));
  PARTY.twq = { phase: 'hand', cat: cat, word: word, asked: 0 };
  twqPaint();
});
on('twq-show', () => { if (PARTY.twq && PARTY.twq.phase === 'hand') { PARTY.twq.phase = 'shown'; twqPaint(); } });
on('twq-hide', () => { if (PARTY.twq && PARTY.twq.phase === 'shown') { PARTY.twq.phase = 'play'; twqPaint(); } });
on('twq-ask', () => {
  const s = PARTY.twq;
  if (!s || s.phase !== 'play') return;
  s.asked++;
  if (s.asked >= TWQ_MAX) s.phase = 'done';
  twqPaint();
});
on('twq-reveal', () => { if (PARTY.twq && PARTY.twq.phase === 'play') { PARTY.twq.phase = 'done'; twqPaint(); } });


/* WHAT EACH GAME DOES WHEN ITS CLOCK RUNS OUT, and how it draws. Read by the tick, `partyStart_` and
   `partyStop_`, so a fifth timed game is a row here. */
const PARTY_GAMES = {
  jam: { paint: jamPaint, end: s => { s.phase = 'done'; } },
  tab: { paint: tabPaint, end: s => { s.phase = 'done'; } },
  hot: { paint: hotPaint, end: s => { s.phase = 'done'; } },
  twq: { paint: twqPaint, end: () => {} },
};

/* WORD GAMES — Articulate, Charades, Taboo, Hot Seat, Just a Minute, 20 Questions, Imposter, Herd Mentality, Word Search and Sentence Scramble (441) in one widget. § */
const WORD_GAMES = [
  { k: 'art', name: 'Articulate', start: () => initRound('art'), stop: () => roundStop_('art'),
    body: `<p>Describe it without saying it. Ninety seconds.</p>
    <div id="art-card" class="art"></div>
    <div class="art-row">
      ${tile_({ form: true, label: 'Got it', act: 'rg-next', data: { g: 'art', got: '1' } })}
      ${tile_({ form: true, label: 'Pass', act: 'rg-next', data: { g: 'art', got: '0' }, kind: 'quiet' })}
    </div>
    <p class="art-meta"><span id="art-left">1:30</span> left &middot;
      <b id="art-got">0</b> so far</p>
    <p class="note" id="art-said"></p>
    ${tile_({ form: true, label: 'New round', act: 'rg-again', data: { g: 'art' }, kind: 'quiet' })}` },
  { k: 'cha', name: 'Charades', start: () => initRound('cha'), stop: () => roundStop_('cha'),
    body: `<p>Act it out. No words, no sounds. Three minutes.</p>
    <div id="cha-card" class="art"></div>
    <div class="art-row">
      ${tile_({ form: true, label: 'Got it', act: 'rg-next', data: { g: 'cha', got: '1' } })}
      ${tile_({ form: true, label: 'Pass', act: 'rg-next', data: { g: 'cha', got: '0' }, kind: 'quiet' })}
    </div>
    <p class="art-meta"><span id="cha-left">3:00</span> left &middot;
      <b id="cha-got">0</b> so far</p>
    <p class="note" id="cha-said"></p>
    ${tile_({ form: true, label: 'New round', act: 'rg-again', data: { g: 'cha' }, kind: 'quiet' })}` },
  { k: 'tab', name: 'Taboo', party: true,
    body: `<p>Describe the word without the words under it. Sixty seconds.</p>` },
  { k: 'hot', name: 'Hot Seat', party: true,
    body: `<p>The class gives clues; the one in the hot seat guesses. Sixty seconds.</p>` },
  { k: 'jam', name: 'Just a Minute', party: true,
    body: `<p>Talk about the topic for sixty seconds without stopping.</p>` },
  { k: 'twq', name: '20 Questions', party: true,
    body: `<p>Twenty yes-or-no questions to find a person, a place or a thing.</p>` },
  { k: 'imp', name: 'Imposter', start: () => initImposter(), stop: () => impHide_(),
    /* NO NOTE LINE UNDER THE CARD. § */
    body: `<div id="imp-card" class="art"></div>
    <div id="imp-acts" class="art-row"></div>` },
  /* HERD MENTALITY, MOVED IN BY THE OWNER — "heard mentality is a word game so should go there." § */
  { k: 'herd', name: 'Herd Mentality', start: () => initHerd(), stop: () => {},
    body: `<div id="herd-card" class="herd-card">
    <p>Everybody answers. You want to match the room, not be right.</p>
    <p class="herd-q" id="herd-q"></p>
    ${tile_({ form: true, label: 'Next question', act: 'herd-next' })}
    </div>` },
  /* WORD SEARCH AND SENTENCE SCRAMBLE, MOVED IN BY THE OWNER (441) — their own cards before; nothing runs between taps, so no stop. */
  { k: 'ws', name: 'Word Search', start: () => initWordSearch(), stop: () => {},
    body: cardBlocks_([
      { type: 'box', tag: 'p', text: 'Tap the first letter of a word, then its last.' },
      { type: 'field', look: 'mat-sel ws-top', cap: '', blocks: [{ type: 'control', tag: 'select', attrs: { id: 'ws-theme', 'data-do': 'ws-theme', 'aria-label': 'Which words' } }] },
      { type: 'box', id: 'ws-grid', look: 'ws' },
      { type: 'box', tag: 'ul', id: 'ws-words', look: 'ws-list' },
      { type: 'box', tag: 'p', id: 'ws-said', look: 'note game-said' },
      tile_({ form: true, label: 'New puzzle', act: 'ws-again', kind: 'quiet' })]) },
  /* THE TIMES TABLES SPRINT, MOVED IN BY THE OWNER (461): its own card before; no board and no kept best (rule 1.53). */
  { k: 'tt', name: 'Times Tables Sprint', start: () => initTables(),
    stop: () => { if (typeof ttState !== 'undefined' && ttState) { clearInterval(ttState.timer); ttState = null; } },
    body: cardBlocks_([
      { type: 'box', id: 'tt-idle', parts: [{ type: 'box', tag: 'p', text: 'Sixty seconds. As many as you can.' },
        tile_({ form: true, look: 'btn', id: 'tt-play', act: 'tt-begin', label: 'Start' })] },
      { type: 'box', id: 'tt-question', look: 'hidden tt', parts: [
        { type: 'box', tag: 'p', id: 'tt-q', look: 'mono tt-big', text: '—' },
        kpField_('tt', '', 'maths', 0, 'answer', null, { id: 'tt-answer', 'data-do': 'tt-answer' }),
        { type: 'box', tag: 'p', id: 'tt-feedback', look: 'note game-said' },
        rowLive('Time', '60', 'tt-time'), rowLive('Right', '0', 'tt-score'),
        tile_({ form: true, look: 'btn quiet', act: 'tt-stop', label: 'Give up' })] },
      { type: 'box', id: 'tt-over', look: 'hidden' }]) },
  { k: 'ss', name: 'Sentence Scramble', start: () => initScramble(), stop: () => {},
    body: cardBlocks_([
      { type: 'box', tag: 'p', text: 'Tap the words in order to put the sentence back together.' },
      { type: 'field', look: 'mat-sel ws-top', cap: '', blocks: [{ type: 'control', tag: 'select', attrs: { id: 'ss-level', 'data-do': 'ss-level', 'aria-label': 'Level' } }] },
      { type: 'box', id: 'ss-box' },
      { type: 'box', tag: 'p', id: 'ss-said', look: 'note game-said' }]) },
];

/* A party game's body is its sentence and the frame `PARTY_GAMES[k].paint` fills — the same three
   elements for all four, so they are written once here rather than four times above. */
function wgBody_(g) {
  if (!g.party) return g.body;
  return g.body + cardBlocks_([{ type: 'box', id: g.k + '-card', look: 'art' }, { type: 'box', id: g.k + '-acts', look: 'party-acts' },
    { type: 'box', tag: 'p', id: g.k + '-said', look: 'note game-said' }]);
}

function wgGame_(k) { return WORD_GAMES.find(g => g.k === k) || WORD_GAMES[0]; }

/* REMEMBERED ON THE DEVICE, `ws-theme`'s rule: the game a family played last week is the one they
   open to, and a remembered key nothing answers any more falls back to the first. */
function wgChosen_() {
  let k = '';
  try { k = localStorage.getItem('wg-game') || ''; } catch (e) {}
  return wgGame_(k).k;
}

/* WHAT THE WIDGET'S MARKUP CARRIES — read by the getter on the `wordgames` entry in map.js, so a
   repaint puts the chosen game's card down with everything else rather than an empty slot. */
function wgOptions_() {
  const k = wgChosen_();
  return WORD_GAMES.map(x =>
    `<option value="${esc(x.k)}"${x.k === k ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
}
function wgSlot_() {
  const g = wgGame_(wgChosen_());
  return `<div data-g="${esc(g.k)}" class="wg-game">${wgBody_(g)}</div>`;
}

/* THE PICKER AND THE CHOSEN GAME'S CARD, AND NOTHING THAT RUNS — the widget's declared `draw`, which the builder uses to draw it before anybody arrives § */
function wgPaint_() {
  const slots = document.querySelectorAll('#wg-slot');
  if (!slots.length) return false;
  const g = wgGame_(wgChosen_());
  /* EVERY COPY, the Games card and a starred one on Saved (441), so a pick on one is not undone by the other. */
  document.querySelectorAll('#wg-pick').forEach(sel => { if (sel.value !== g.k) sel.innerHTML = wgOptions_(); });
  /* REBUILT ONLY WHEN THE GAME CHANGED. § */
  slots.forEach(slot => {
    const now = slot.firstElementChild;
    if (!now || now.getAttribute('data-g') !== g.k) slot.innerHTML = wgSlot_();
  });
  return g;
}
function initWordGames() {
  const g = wgPaint_();
  if (!g) return;
  if (g.party) partyStart_(g.k);
  else g.start();
}

function wordGamesStop_() {
  WORD_GAMES.forEach(g => {
    try { if (g.party) partyStop_(g.k); else g.stop(); }
    catch (e) { console.warn('[word games]', g.k, e); }
  });
}

on('wg-pick', el => {
  const k = wgGame_(el.value).k;
  try { localStorage.setItem('wg-game', k); } catch (e) {}
  /* THE OLD GAME IS STOPPED AFTER ITS CARD HAS LEFT THE DOCUMENT, which is the order that makes its own stop read it as "the column is gone": § */
  document.querySelectorAll('#wg-slot').forEach(x => { x.innerHTML = ''; });
  wordGamesStop_();
  initWordGames();
});

/* LINKED PICTURES (570): tap two matching pictures that a line with at most two turns can join, through empty squares or round the edge. */
const LK_W = 6, LK_H = 6, LK_PICS = ['🍎', '🐟', '⭐', '🌙', '🔔', '🎈', '🌵', '🐢', '🍄'];
let LK = null;
function lkNew_() {
  const n = LK_W * LK_H, cells = [];
  for (let i = 0; i < n; i++) cells.push(LK_PICS[Math.floor(i / 2) % LK_PICS.length]);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = cells[i]; cells[i] = cells[j]; cells[j] = t; }
  LK = { cells, pick: -1, left: n };
}
/* THE GRID WITH A BORDER OF EMPTY SQUARES, so a line may run round the outside; a breadth-first walk counting turns. */
function lkJoins_(a, b) {
  const W = LK_W + 2, H = LK_H + 2, at = i => (Math.floor(i / LK_W) + 1) * W + (i % LK_W) + 1;
  const free = p => { const x = p % W - 1, y = Math.floor(p / W) - 1; return x < 0 || y < 0 || x >= LK_W || y >= LK_H || !LK.cells[y * LK_W + x]; };
  const s = at(a), t = at(b), D = [[1, 0], [-1, 0], [0, 1], [0, -1]], best = {};
  const q = D.map((d, k) => [s, k, 0]);
  while (q.length) {
    const [p, k, turns] = q.shift();
    const x = p % W + D[k][0], y = Math.floor(p / W) + D[k][1];
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const np = y * W + x;
    if (np === t) return true;
    if (!free(np)) continue;
    for (let k2 = 0; k2 < 4; k2++) {
      const nt = turns + (k2 === k ? 0 : 1), key = np * 4 + k2;
      if (nt > 2 || (key in best && best[key] <= nt)) continue;
      best[key] = nt; q.push([np, k2, nt]);
    }
  }
  return false;
}
function lkPaint_() {
  if (!LK) lkNew_();
  document.querySelectorAll('.lk-grid').forEach(g => {
    g.innerHTML = LK.cells.map((c, i) => tile_({ form: true, look: 'lk-sq' + (i === LK.pick ? ' on' : ''), act: 'lk-sq', data: { i }, off: !c, aria: c ? 'picture ' + (i + 1) : 'empty', html: c })).join('');
  });
  document.querySelectorAll('.lk-tiles').forEach(x => { x.innerHTML = tile_({ icon: 'again', label: 'New board', act: 'lk-new' }); });
  document.querySelectorAll('.lk-left').forEach(x => { x.textContent = LK.left ? LK.left / 2 + ' pairs left' : 'Cleared. Well done.'; });
}
on('lk-sq', el => {
  const i = +el.getAttribute('data-i');
  if (!LK || !LK.cells[i]) return;
  if (LK.pick === -1 || LK.pick === i) { LK.pick = LK.pick === i ? -1 : i; return lkPaint_(); }
  const a = LK.pick;
  if (LK.cells[a] === LK.cells[i] && lkJoins_(a, i)) { LK.cells[a] = LK.cells[i] = ''; LK.left -= 2; LK.pick = -1; }
  else LK.pick = i;
  lkPaint_();
});
on('lk-new', () => { lkNew_(); lkPaint_(); });

/* THE GUESSER (570): the site asks yes-or-no questions and names the person you picked from a small list of figures from history. */
const GS_PEOPLE = [
  { n: 'Julius Caesar', a: ['ancient', 'ruler', 'soldier', 'europe'] },
  { n: 'Cleopatra', a: ['ancient', 'ruler', 'woman', 'africa'] },
  { n: 'Elizabeth I', a: ['ruler', 'woman', 'europe', 'britain'] },
  { n: 'Henry VIII', a: ['ruler', 'europe', 'britain'] },
  { n: 'Isaac Newton', a: ['science', 'europe', 'britain'] },
  { n: 'Marie Curie', a: ['science', 'woman', 'europe', 'modern'] },
  { n: 'Charles Darwin', a: ['science', 'europe', 'britain', 'traveller'] },
  { n: 'Florence Nightingale', a: ['woman', 'europe', 'britain', 'medicine'] },
  { n: 'Mary Seacole', a: ['woman', 'britain', 'medicine', 'traveller'] },
  { n: 'Napoleon Bonaparte', a: ['ruler', 'soldier', 'europe'] },
  { n: 'Winston Churchill', a: ['ruler', 'soldier', 'europe', 'britain', 'modern', 'writer'] },
  { n: 'William Shakespeare', a: ['writer', 'europe', 'britain'] },
  { n: 'Christopher Columbus', a: ['europe', 'traveller'] },
  { n: 'Genghis Khan', a: ['ruler', 'soldier', 'asia'] },
  { n: 'Mahatma Gandhi', a: ['asia', 'modern', 'writer'] },
  { n: 'Nelson Mandela', a: ['ruler', 'africa', 'modern'] },
  { n: 'Leonardo da Vinci', a: ['science', 'artist', 'europe'] },
  { n: 'Ada Lovelace', a: ['science', 'woman', 'europe', 'britain'] },
  { n: 'Confucius', a: ['ancient', 'asia', 'writer'] },
  { n: 'Martin Luther King Jr.', a: ['modern', 'writer', 'america'] },
];
const GS_ASK = { ancient: 'Did they live more than 2,000 years ago?', ruler: 'Did they rule or lead a country?', soldier: 'Did they lead armies?',
  woman: 'Are they a woman?', europe: 'Were they from Europe?', britain: 'Were they British or English?', science: 'Are they known for science or invention?',
  medicine: 'Are they known for caring for the sick?', traveller: 'Did they make a famous journey?', writer: 'Are they known for their writing or speeches?',
  modern: 'Were they alive in the 20th century?', asia: 'Were they from Asia?', africa: 'Were they from Africa?', artist: 'Were they an artist?', america: 'Were they from America?' };
let GS = null;
function gsNew_() { GS = { left: GS_PEOPLE.slice(), asked: [], q: '' }; gsNext_(); }
/* THE QUESTION THAT SPLITS WHAT IS LEFT MOST EVENLY. */
function gsNext_() {
  GS.q = '';
  if (GS.left.length <= 1) return;
  let best = 1e9;
  Object.keys(GS_ASK).forEach(k => {
    if (GS.asked.indexOf(k) !== -1) return;
    const yes = GS.left.filter(p => p.a.indexOf(k) !== -1).length, d = Math.abs(GS.left.length - 2 * yes);
    if (yes && yes < GS.left.length && d < best) { best = d; GS.q = k; }
  });
}
function gsPaint_() {
  if (!GS) gsNew_();
  const said = !GS.left.length ? 'I give up. You beat me.'
    : !GS.q ? 'You are thinking of ' + GS.left[0].n + '.' + (GS.left.length > 1 ? ' Or ' + GS.left.slice(1).map(p => p.n).join(', or ') + '.' : '')
    : GS_ASK[GS.q];
  const tiles = GS.q ? tile_({ icon: 'tick', label: 'Yes', act: 'gs-say', data: { y: '1' } }) + tile_({ icon: 'close', label: 'No', act: 'gs-say', data: { y: '0' } })
    + tile_({ icon: 'suggest', label: 'Not sure', act: 'gs-say', data: { y: '?' } }) : '';
  document.querySelectorAll('.gs-box').forEach(b => {
    b.innerHTML = `<p class="gs-q">${esc(said)}</p><div class="tile-row">${tiles}${tile_({ icon: 'again', label: 'Start again', act: 'gs-new' })}</div>`;
  });
}
on('gs-say', el => {
  if (!GS || !GS.q) return;
  const y = el.getAttribute('data-y'), k = GS.q;
  GS.asked.push(k);
  if (y !== '?') GS.left = GS.left.filter(p => (p.a.indexOf(k) !== -1) === (y === '1'));
  gsNext_(); gsPaint_();
});
on('gs-new', () => { gsNew_(); gsPaint_(); });

/* ---------- FLABBY PIRD (back 15 Nov 2026 from receipt.js before 133b259): a canvas, a tap or the space bar; the round's count on the glass, nothing kept and no board (rule 1.53). */
/* THE GAMES AND TOOLS, carried over. § */

/* SIZE A CANVAS TO ITS BOX, or wait until it has one. § */
function fitCanvas_(canvas, again) {
  const box = canvas.getBoundingClientRect();
  if (!box.width || !box.height) {
    /* NOT AN ERROR, just early. One retry on the next frame, and one more after a beat for the
       carousel's scroll to settle — after that something is genuinely wrong and retrying for ever
       would be a loop nobody can see. */
    if (again && !canvas.dataset.waiting) {
      canvas.dataset.waiting = '1';
      requestAnimationFrame(() => {
        delete canvas.dataset.waiting;
        again();
      });
    }
    return false;
  }
  delete canvas.dataset.waiting;

  /* ON A PHONE THE BOX IS IN CSS PIXELS and the screen has more than that. § */
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = Math.round(box.width), h = Math.round(box.height);
  if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  /* Guarded because a context is not guaranteed — a browser with the canvas turned off returns null, and a harness returns a stub with only what it was asked for. § */
  if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  /* What the game should use for its own maths: the box, not the backing store. */
  canvas.dataset.w = w;
  canvas.dataset.h = h;
  return true;
}
/* `still`: DRAWN AHEAD OF ITS ARRIVAL (`flappyStill_`, the widget's declared `draw`) — the board, the canvas fitted to its box and one frame of the scene, and § */
function flappyStill_() { return initFlappy(true); }
function initFlappy(still) {
  const canvas = $('flappy-canvas');
  if (!canvas) return still ? false : undefined;

  /* THE BOARD IS DRAWN HERE because `startScreen_` calls this on every paint of the column, so it picks up the payload the moment `load()` lands and again whenever § */

  /* THE ELEMENT'S OWN SIZE, not its box. § */
  /* MEASURED WHEN IT HAS A SIZE, and measured again when that changes. § */
  /* A STILL DRAWING DOES NOT WAIT FOR A BOX: § */
  if (!fitCanvas_(canvas, still ? null : () => initFlappy(still))) return still ? false : undefined;

  const ctx = canvas.getContext('2d');
  /* THE BOX, not the backing store. Those differ by the pixel ratio now, and using the backing
     store would put the bird three times too far right on a phone. */
  const W = Number(canvas.dataset.w) || canvas.width;
  const H = Number(canvas.dataset.h) || canvas.height;
  /* ---------- BLUE SKY, GREEN PIPES, AND A BIRD § */
  const SKY = token_('--fp-sky', 'black');   // the sky, flat, as the original's is
  const CLOUD = token_('--fp-cloud', 'black');
  const BUSH = token_('--fp-bush', 'black');   // the band of scrub between the sky and the floor
  const GRASS = token_('--fp-grass', 'black');
  const GRASS_D = token_('--fp-grass-d', 'black');
  const SAND = token_('--fp-sand', 'black');   // the floor
  const SAND_D = token_('--fp-sand-d', 'black');   // its hatch, which is the thing that makes the floor move
  const PIPE = token_('--fp-pipe', 'black');
  const PIPE_L = token_('--fp-pipe-l', 'black');
  const PIPE_D = token_('--fp-pipe-d', 'black');
  const EDGE = token_('--fp-edge', 'black');   // one outline for everything drawn on top of the sky
  const BODY = token_('--fp-body', 'black');
  const BELLY = token_('--fp-belly', 'black');
  const WING = token_('--fp-wing', 'black');
  const EYE = token_('--fp-eye', 'black');
  const BEAK = token_('--fp-beak', 'black');

  // reset any previous loop — but not from a still drawing, which the builder makes only of a game running nowhere
  if (!still && flappyState?.raf) cancelAnimationFrame(flappyState.raf);
  const S = flappyState = {
    bird: { x: 60, y: H/2, vy: 0, r: 9 },
    pipes: [], score: 0, running: false, dead: false, raf: null, frame: 0
  };
  /* SCALED FROM THE WIDTH, which is the axis this game is played along. § */
  const k = W / 300;
  /* THE GAP IS 98, NOT 110: § */
  const GRAV = 0.45 * k, FLAP = -7 * k, GAP = 98 * k, PIPE_W = 42 * k, SPEED = 2 * k;
  /* THE FLOOR IS PART OF THE GAME NOW rather than a stripe painted over the bottom of it. § */
  const GROUND = Math.max(8, Math.round(H * 0.09));
  const FLOOR = H - GROUND;
  S.bird.r = 9 * k;
  S.bird.x = 60 * k;
  S.bird.y = FLOOR / 2;

  const reset = () => {
    S.bird.y = FLOOR/2; S.bird.vy = 0; S.pipes = []; S.score = 0; S.frame = 0; S.dead = false;
  };
  const spawnPipe = () => {
    /* The margins scale too, or on a tall canvas every pipe would cluster at the top. */
    const top = 40 * k + Math.random() * Math.max(10, FLOOR - GAP - 110 * k);
    S.pipes.push({ x: W, top, scored: false });
  };
  const flap = () => {
    if (S.dead) { reset(); S.running = true; $('flappy-msg').textContent = '\u00a0'; loop(); return; }
    if (!S.running) { S.running = true; $('flappy-msg').textContent = '\u00a0'; loop(); }
    S.bird.vy = FLAP;
  };
  const gameOver = () => {
    S.dead = true; S.running = false;
    $('flappy-msg').textContent = `Game over — score ${S.score}. Tap to retry.`;
    /* NOTHING IS SAVED AND THERE IS NO BEST OR BOARD (rule 1.53). */
  };

  const loop = () => {
    if (!S.running) return;
    S.frame++;
    // physics
    S.bird.vy += GRAV; S.bird.y += S.bird.vy;
    if (S.frame % 90 === 0) spawnPipe();
    S.pipes.forEach(p => p.x -= SPEED);
    S.pipes = S.pipes.filter(p => p.x + PIPE_W > 0);
    // collisions + scoring
    for (const p of S.pipes) {
      if (!p.scored && p.x + PIPE_W < S.bird.x) { p.scored = true; S.score++; }
      const inX = S.bird.x + S.bird.r > p.x && S.bird.x - S.bird.r < p.x + PIPE_W;
      const hitY = S.bird.y - S.bird.r < p.top || S.bird.y + S.bird.r > p.top + GAP;
      if (inX && hitY) return gameOver();
    }
    if (S.bird.y + S.bird.r > FLOOR || S.bird.y - S.bird.r < 0) return gameOver();
    // draw
    sky();
    S.pipes.forEach(pipe);
    bird();
    hud();
    S.raf = requestAnimationFrame(loop);
  };

  /* PAINTED RATHER THAN CLEARED — `clearRect` leaves the canvas transparent and the app's black shows through, which is what once made this a bird in a cave. § */
  function sky() {
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, W, FLOOR);
    clouds();
    bushes();
    ground();
  }

  /* ---------- THREE LAYERS AT THREE SPEEDS, WHICH IS THE WHOLE BACKGROUND § */
  function clouds() {
    const r = Math.max(8, W * 0.075);
    const span = W + r * 6;
    const off = (S.frame * SPEED / 3) % span;
    ctx.fillStyle = CLOUD;
    for (let i = 0; i < 3; i++) {
      const cx = ((i * span / 3 - off) % span + span) % span - r * 3;
      const cy = FLOOR * (0.15 + 0.13 * (i % 2));
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.arc(cx + r, cy - r * 0.4, r * 0.78, 0, Math.PI * 2);
      ctx.arc(cx + r * 1.9, cy, r * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* A SCALLOPED BAND ALONG THE TOP OF THE FLOOR. § */
  function bushes() {
    const h = Math.max(6, FLOOR * 0.06);
    const r = h * 0.75;
    const span = r * 2;
    const off = (S.frame * SPEED / 2) % span;
    ctx.fillStyle = BUSH;
    ctx.beginPath();
    ctx.moveTo(-span, FLOOR);
    for (let x = -off - span; x < W + span; x += span) ctx.arc(x + r, FLOOR, r, Math.PI, 0);
    ctx.lineTo(W + span, FLOOR);
    ctx.closePath();
    ctx.fill();
  }

  function ground() {
    const grass = Math.max(3, Math.round(GROUND * 0.28));
    ctx.fillStyle = SAND;
    ctx.fillRect(0, FLOOR, W, GROUND);
    /* THE HATCH. Leaning parallelograms, scrolling at the pipes' own speed — the floor is the one
       layer the bird is actually travelling over, so it is the one that must not lag. */
    ctx.fillStyle = SAND_D;
    const step = Math.max(8, W * 0.05);
    const off = (S.frame * SPEED) % step;
    for (let x = -off - step; x < W + step; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.lineTo(x + step * 0.34, FLOOR + grass);
      ctx.lineTo(x + step * 0.6, FLOOR + grass);
      ctx.lineTo(x + step * 0.26, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = GRASS;
    ctx.fillRect(0, FLOOR, W, grass);
    ctx.fillStyle = GRASS_D;
    ctx.fillRect(0, FLOOR + grass - Math.max(1, grass * 0.25), W, Math.max(1, grass * 0.25));
    ctx.fillStyle = EDGE;
    ctx.fillRect(0, FLOOR, W, Math.max(1, k));
  }

  /* ---------- A PIPE IS A TUBE WITH A MOUTH § */
  function pipe(p) {
    const capH = Math.max(6, PIPE_W * 0.26);
    const capW = PIPE_W * 1.18;
    const capX = p.x - (capW - PIPE_W) / 2;
    const line = Math.max(1, PIPE_W * 0.05);
    const tube = (x, y, w, h) => {
      if (h <= 0) return;
      ctx.fillStyle = PIPE;
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = PIPE_L;
      ctx.fillRect(x + w * 0.13, y, w * 0.17, h);
      ctx.fillStyle = PIPE_D;
      ctx.fillRect(x + w * 0.74, y, w * 0.26, h);
      ctx.strokeStyle = EDGE;
      ctx.lineWidth = line;
      ctx.strokeRect(x + line / 2, y, w - line, h);
    };
    tube(p.x, -line, PIPE_W, p.top - capH + line);
    tube(capX, p.top - capH, capW, capH);
    tube(p.x, p.top + GAP + capH, PIPE_W, FLOOR - p.top - GAP - capH);
    tube(capX, p.top + GAP, capW, capH);
  }

  /* THE SCORE IS ON THE SCREEN. § */
  function hud() {
    /* BIG, CENTRED AND OUTLINED, which is where the original keeps it and is also the only place a white number survives: § */
    const px = Math.max(14, Math.round(W / 9));
    const face = 'ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.lineJoin = 'round';
    ctx.font = `700 ${px}px ${face}`;
    ctx.textAlign = 'center';
    ctx.lineWidth = Math.max(2, px * 0.14);
    ctx.strokeStyle = EDGE;
    ctx.strokeText(String(S.score), W / 2, px * 1.3);
    ctx.fillStyle = WING;
    ctx.fillText(String(S.score), W / 2, px * 1.3);
  }

  /* ---------- THE BIRD, AND THE TWO THINGS THAT MAKE IT ONE § */
  function bird() {
    const r = S.bird.r;
    const tilt = Math.max(-0.5, Math.min(1.2, (S.bird.vy / (9 * k)) * 0.85));
    const beat = S.running ? Math.sin(S.frame * 0.35) * r * 0.3 : r * 0.1;
    ctx.save();
    ctx.translate(S.bird.x, S.bird.y);
    ctx.rotate(tilt);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = EDGE;
    ctx.lineWidth = Math.max(1, r * 0.15);
    ctx.fillStyle = BODY;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.15, r, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = BELLY;
    ctx.beginPath();
    ctx.ellipse(r * 0.2, r * 0.4, r * 0.58, r * 0.32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = WING;
    ctx.beginPath();
    ctx.ellipse(-r * 0.22, beat, r * 0.55, r * 0.33, -0.25, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = EYE;
    ctx.beginPath();
    ctx.arc(r * 0.5, -r * 0.4, r * 0.33, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = EDGE;
    ctx.beginPath();
    ctx.arc(r * 0.62, -r * 0.4, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BEAK;
    ctx.beginPath();
    ctx.moveTo(r * 0.85, -r * 0.12);
    ctx.lineTo(r * 1.75, r * 0.1);
    ctx.lineTo(r * 0.85, r * 0.42);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // idle draw (bird sitting) — with the score, so the panel never shows a blank corner
  sky();
  bird();
  hud();
  /* A STILL DRAWING STOPS HERE — see `flappyStill_`. Nothing below may run for somebody not looking. */
  if (still) return;

  /* ---------- THE FLAP LANDS ON THE FINGER GOING DOWN § */
  canvas.onclick = null;
  canvas.onpointerdown = e => {
    if (e.isPrimary === false) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    flap();
  };
  // space/arrow to flap (only when arcade canvas exists)
  /* ---------- NOT WHILE SOMEBODY IS TYPING § */
  S.keyHandler = e => {
    if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
    const t = e.target;
    if (t && t.closest && (t.isContentEditable || t.closest('input, textarea, select, [contenteditable]'))) return;
    if ($('flappy-canvas')) { e.preventDefault(); flap(); }
  };
  document.removeEventListener('keydown', window._flappyKey || (()=>{}));
  window._flappyKey = S.keyHandler;
  document.addEventListener('keydown', window._flappyKey);
}

/* THE CONSOLE PLAYS EVERY GAME (441): the person's game files, Flabby Pird and the Colliers Wood racer, one picker — the board games' shape (414). */
const CONSOLE_GAMES = [
  { k: 'file', name: 'Game files', start: () => { nesPaint_(); nesPadWatch_(); }, still: () => nesPaint_(),
    stop: () => { nesStop_(); nesPadUnwatch_(); },
    body: `<p class="cs-one" title="NES, SNES, Game Boy, Game Boy Color, Game Boy Advance, N64 and DS">NES to DS games you own; they stay on this device.</p>
    <div id="nes-box" class="nes-box"></div>` },
  /* A HANDHELD FOR THE BIRD: the canvas sits in a body of its own, and its tap and space bar are `initFlappy`'s. */
  { k: 'flabby', name: 'Flabby Pird', start: () => initFlappy(), still: () => flappyStill_(),
    stop: () => { if (flappyState && flappyState.raf) { cancelAnimationFrame(flappyState.raf); flappyState.raf = null; } },
    body: `<p>Harder than it looks.</p>
    <div class="cs-body cs-hand"><canvas id="flappy-canvas" class="flappy"></canvas>
    <p class="note flappy-msg" id="flappy-msg">Tap to play</p></div>` },
  /* A WIDE SCREEN FOR THE RACER; racer.js draws into `race-box` (426). */
  { k: 'racer', name: 'Colliers Wood racer', start: () => window.initRacer?.(), still: () => window.raceStill_?.(),
    stop: () => window.racerStop_?.(),
    body: `<div class="cs-body cs-wide race"><div id="race-box" class="race-box"></div></div>` },
  /* TWO SMALL ONES (570): linked pictures and the guesser; nothing runs between taps, so stopping stops nothing. */
  { k: 'link', name: 'Linked pictures', start: () => lkPaint_(), still: () => lkPaint_(), stop: () => {},
    body: `<p>Join two the same with a line of up to two turns.</p>
    <div class="lk-grid"></div><p class="note lk-left"></p>
    <div class="tile-row lk-tiles"></div>` },
  { k: 'guess', name: 'I can guess', start: () => gsPaint_(), still: () => gsPaint_(), stop: () => {},
    body: `<p>Think of someone from history: ${GS_PEOPLE.map(p => p.n).join(', ')}. I will ask until I know.</p>
    <div class="gs-box"></div>` },
];
function csGame_(k) { return CONSOLE_GAMES.find(g => g.k === k) || CONSOLE_GAMES[0]; }
/* REMEMBERED ON THE DEVICE under `cs-game`, `bg-game`'s rule. */
function csChosen_() {
  let k = '';
  try { k = localStorage.getItem('cs-game') || ''; } catch (e) {}
  return csGame_(k).k;
}
function csOptions_() {
  const k = csChosen_();
  return CONSOLE_GAMES.map(x =>
    `<option value="${esc(x.k)}"${x.k === k ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
}
function csSlot_() {
  const g = csGame_(csChosen_());
  return `<div data-g="${esc(g.k)}" class="cs-game">${g.body}</div>`;
}
/* THE PICKER AND THE CHOSEN GAME'S MARKUP; rebuilt only when the game changed, so a running emulator keeps its box. */
/* EVERY COPY — the Games card and a starred one on Saved — so a pick on one is not undone by the other. */
function csPaint_() {
  const slots = document.querySelectorAll('#cs-slot');
  if (!slots.length) return false;
  const g = csGame_(csChosen_());
  document.querySelectorAll('#cs-pick').forEach(sel => { if (sel.value !== g.k) sel.innerHTML = csOptions_(); });
  slots.forEach(slot => {
    const now = slot.firstElementChild;
    if (!now || now.getAttribute('data-g') !== g.k) slot.innerHTML = csSlot_();
  });
  return g;
}
function initConsole() { const g = csPaint_(); if (g) g.start(); }
function consoleStill_() { const g = csPaint_(); if (g) g.still(); }
function consoleStop_() {
  CONSOLE_GAMES.forEach(g => { try { g.stop(); } catch (e) { console.warn('[console]', g.k, e); } });
}
on('cs-pick', el => {
  const k = csGame_(el.value).k;
  try { localStorage.setItem('cs-game', k); } catch (e) {}
  consoleStop_();
  document.querySelectorAll('#cs-slot').forEach(x => { x.innerHTML = ''; });
  initConsole();
});

/* ---------- CONSOLE: an NES player, and only the player (docs/history/389; SNES, Game Boy and N64 files too, 391) */
/* The engine is jsnes (Apache-2.0), fetched only when Play is pressed. The game file is the person's own:
   picked from their device, kept in this device's IndexedDB, never uploaded or sent. */
const NES_LIB = 'https://cdn.jsdelivr.net/npm/jsnes@2.1.0/dist/jsnes.min.js';
const NES_LIB_2 = 'https://unpkg.com/jsnes@2.1.0/dist/jsnes.min.js';
const NES_DB = 'family-console', NES_HZ = 60.0988;
const NES_ = { nes: null, rom: null, saved: null, running: false, raf: 0, last: 0, acc: 0, ctx: null, img: null,
  u32: null, audio: null, node: null, ring: null, rd: 0, wr: 0, keys: {}, pads: {}, touch: {}, held: {}, lib: null,
  sys: 'nes', kind: null, axes: [0, 0, 0, 0] };
/* NES buttons in jsnes's numbering, so every input source speaks one language. */
const NES_B = { a: 0, b: 1, select: 2, start: 3, up: 4, down: 5, left: 6, right: 7 };
/* KEYS BY WHERE THEY ARE (`e.code`), per system (419): arrows and WASD steer, Z/X are B/A, Q/E the shoulders, I/J/K/L a diamond of face buttons (N64: the C buttons). */
const NES_KEY_MOVE = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
const NES_KEY_MID = { Enter: 'start', NumpadEnter: 'start', ShiftLeft: 'select', ShiftRight: 'select' };
const NES_KEY_TWO = { KeyZ: 'b', KeyK: 'b', KeyX: 'a', KeyL: 'a', Space: 'a' };
const NES_KEY_LR = { KeyQ: 'l', KeyE: 'r' };
const NES_KEY_FOUR = { KeyZ: 'b', KeyK: 'b', KeyX: 'a', KeyL: 'a', Space: 'a', KeyC: 'y', KeyJ: 'y', KeyV: 'x', KeyI: 'x' };
/* N64 in RetroPad names: its A is RetroPad B and its B is RetroPad Y (391); Z is L2; the right stick is the C buttons. No Select. */
const NES_KEY_N64 = { KeyX: 'b', Space: 'b', KeyZ: 'y', KeyC: 'l2', ShiftLeft: 'l2', ShiftRight: 'l2', KeyQ: 'l', KeyE: 'r',
  KeyI: 'cu', KeyK: 'cd', KeyJ: 'cl', KeyL: 'cr', Enter: 'start', NumpadEnter: 'start' };
const NES_KEYMAP = {
  nes: Object.assign({}, NES_KEY_MOVE, NES_KEY_TWO, NES_KEY_MID), gb: Object.assign({}, NES_KEY_MOVE, NES_KEY_TWO, NES_KEY_MID),
  gbc: Object.assign({}, NES_KEY_MOVE, NES_KEY_TWO, NES_KEY_MID), gba: Object.assign({}, NES_KEY_MOVE, NES_KEY_TWO, NES_KEY_LR, NES_KEY_MID),
  snes: Object.assign({}, NES_KEY_MOVE, NES_KEY_FOUR, NES_KEY_LR, NES_KEY_MID), nds: Object.assign({}, NES_KEY_MOVE, NES_KEY_FOUR, NES_KEY_LR, NES_KEY_MID),
  n64: Object.assign({}, NES_KEY_MOVE, NES_KEY_N64) };
/* A BROWSER THAT SENDS NO `code` is read by the letter instead. */
const NES_KEY_OF = { ' ': 'Space', Spacebar: 'Space', Enter: 'Enter', Shift: 'ShiftLeft', ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight' };
function nesKeyFor_(e, sys) {
  const map = NES_KEYMAP[sys] || NES_KEYMAP.nes;
  const code = (e && e.code) || NES_KEY_OF[e && e.key] || (/^[a-z]$/i.test((e && e.key) || '') ? 'Key' + e.key.toUpperCase() : '');
  return map[code] || null;
}
/* WHAT THE LEGEND CALLS EACH BUTTON on that system, in the order it lists them. */
const NES_KEY_SAY = { a: 'A', b: 'B', x: 'X', y: 'Y', l: 'L', r: 'R', start: 'Start', select: 'Select' };
const NES_KEY_SAY_N64 = { b: 'A', y: 'B', l2: 'Z', l: 'L', r: 'R', cu: 'C↑', cd: 'C↓', cl: 'C←', cr: 'C→', start: 'Start' };
const NES_KEY_NAME = { Space: 'Space', Enter: 'Enter', ShiftLeft: 'Shift', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
/* [what it does, the keys] for the legend: the steering first, then each button with every key that presses it. */
function nesKeyRows_(sys) {
  const map = NES_KEYMAP[sys] || NES_KEYMAP.nes, say = sys === 'n64' ? NES_KEY_SAY_N64 : NES_KEY_SAY;
  const rows = [[sys === 'n64' ? 'Stick' : 'Move', ['↑ ↓ ← →', 'W A S D']]];
  Object.keys(say).forEach(btn => {
    const keys = Object.keys(map).filter(c => map[c] === btn && !NES_KEY_MOVE[c] && c !== 'NumpadEnter' && c !== 'ShiftRight')
      .map(c => NES_KEY_NAME[c] || c.replace(/^Key/, ''));
    if (keys.length) rows.push([say[btn], keys]);
  });
  return rows;
}
function nesLegendHtml_(sys) {
  return nesKeyRows_(sys).map(([what, keys]) =>
    `<span class="nes-lg"><span class="nes-lg-k">${keys.map(k => `<kbd>${esc(k)}</kbd>`).join('')}</span><span class="nes-lg-v">${esc(what)}</span></span>`).join('');
}

/* THE ONE PLACE INDEXEDDB IS TOUCHED. Any failure (private window, blocked storage) is "no file kept"; a full device is remembered as `NES_.fullDb` (399). */
function nesDb_(mode, fn) {
  NES_.fullDb = false;
  const quota = e => { if (e && /quota/i.test(e.name || '')) NES_.fullDb = true; };
  return new Promise(res => {
    try {
      const rq = indexedDB.open(NES_DB, 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('rom');
      rq.onerror = () => res(null);
      rq.onsuccess = () => {
        try {
          const tx = rq.result.transaction('rom', mode), r = fn(tx.objectStore('rom'));
          tx.oncomplete = () => { res(r && 'result' in r ? r.result : true); rq.result.close(); };
          tx.onerror = tx.onabort = () => { quota(tx.error); res(null); rq.result.close(); };
        } catch (e) { quota(e); res(null); }
      };
    } catch (e) { res(null); }
  });
}
const nesKept_ = () => nesDb_('readonly', s => s.get('last'));
const nesKeep_ = (bytes, kind) => nesDb_('readwrite', s => { s.put(kind || 'nes', 'kind'); return s.put(bytes, 'last'); });
const nesForgetDb_ = () => nesDb_('readwrite', s => { s.delete('kind'); return s.delete('last'); });
const nesKind_ = () => nesDb_('readonly', s => s.get('kind'));

/* iNES: "NES" then 0x1A, and at least one 16 KB bank after the 16-byte header. */
function nesValid_(u8) {
  return !!u8 && u8.length >= 16 + 16384 && u8[0] === 0x4e && u8[1] === 0x45 && u8[2] === 0x53 && u8[3] === 0x1a;
}

function nesPaint_() {
  const box = $('nes-box');
  if (!box) return;
  /* NOT REDRAWN WHILE A GAME PLAYS (478): the tiles rewritten under a running core cost a layout per call and gave nothing. */
  if (NES_.running && box.querySelector('.nes-wrap')) return;
  if (!USER) { box.innerHTML = empty_('Sign in to use the console.'); return; }
  if (!box.querySelector('.nes-wrap')) {
    box.innerHTML = `<div class="nes-wrap" id="nes-wrap">
      <span class="ds-part ds-lid" aria-hidden="true"><i class="ds-grille"></i><i class="ds-grille ds-grille-r"></i></span><span class="ds-part ds-base" aria-hidden="true"><i class="ds-power"></i></span>
      <span class="ds-part ds-cover ds-cover-a" aria-hidden="true"></span><span class="ds-part ds-cover ds-cover-b" aria-hidden="true"></span><span class="ds-part ds-hinge" id="ds-hinge" aria-hidden="true"></span>
      <div class="nes-stage" id="nes-stage"><canvas id="nes-canvas" class="nes-canvas" width="256" height="240"></canvas><span class="nes-hinge" id="nes-hinge" aria-hidden="true"></span><div class="nes-ctl nes-deco" id="nes-deco" aria-hidden="true"></div></div>
      <div class="nes-legend" id="nes-legend" aria-label="Keys" hidden></div>
      <div class="nes-ctl nes-pad" id="nes-pad" aria-hidden="true">${nesPadHtml_(NES_.sys)}</div>
    </div>
    <p id="nes-padnote" hidden>Controller connected</p>
    <div class="tile-row" id="nes-tiles"></div>
    ` + cardBlocks_([{ type: 'box', tag: 'p', id: 'nes-say', look: 'note', live: 'status' }, { type: 'box', tag: 'p', id: 'nes-kept', hidden: true },
      { type: 'box', tag: 'p', id: 'nes-sysnote', hidden: true }, { type: 'control', attrs: { type: 'file', id: 'nes-file', class: 'nes-file', accept: NES_ACCEPT } }]);
    nesPadWire_($('nes-pad'));
    nesModeWire_($('nes-wrap'));
    nesSeen_($('nes-wrap'));
    /* A REDRAWN SCREEN KEEPS A RUNNING GAME: EmulatorJS's own box moves into the new stage rather than being lost with the old one. */
    const host = EMU_.ejs && EMU_.ejs.elements && EMU_.ejs.elements.parent;
    if (host && $('nes-stage')) $('nes-stage').appendChild(host);
  }
  nesSysSet_(NES_.sys);
  nesBlit_();
  nesRowPaint_();
  csvLine_();
  if (NES_.saved == null) Promise.all([nesKept_(), nesKind_()]).then(([b, k]) => {
    NES_.saved = b ? new Uint8Array(b) : false; NES_.kind = typeof k === 'string' ? k : null;
    /* THE KEPT GAME'S SHAPE AND PAD NOW, not when Play is pressed: the stage changes shape once, before anyone is looking at a game (419). */
    if (NES_.saved && NES_DIMS[NES_.kind] && !NES_.rom && !EMU_.ejs) nesSysSet_(NES_.kind);
    nesRowPaint_(); });
}

/* THE CONSOLE'S TILES AS `tile_` OPTIONS: the same tiles playing or not (419), so the row never grows under a thumb; Forget is greyed with nothing kept. */
function nesOpts_() {
  const have = NES_.rom || NES_.saved, keys = nesLegendOn_();
  return [NES_.running ? { icon: 'pause', label: 'Pause', act: 'nes-pause' } : { icon: 'play', label: 'Play', act: 'nes-play', note: have ? '' : 'choose a game file' },
    { icon: 'open', label: 'Choose file', act: 'nes-pick' },
    { icon: 'bin', label: 'Forget file', act: 'nes-forget', off: !have, note: have ? '' : 'nothing kept' },
    nesMode_() === 'touch' ? null : { icon: 'keys', label: 'Keys', act: 'nes-keys', on: keys, pressed: keys, note: keys ? 'hide the key list' : 'show the key list' }];
}
/* THE ROW, REPAINTED; the padlock is the widget's (`gameLockTile_`, 461). */
function nesRowPaint_() {
  const t = $('nes-tiles');
  if (!t) return;
  t.innerHTML = tile_(nesOpts_());
  nesPadShow_();
}

const nesSay_ = s => { const p = $('nes-say'); if (p) p.textContent = s || ''; };

/* THE SCRIPT, ONCE, from the pinned CDN and then its mirror. */
function nesLib_() {
  if (window.jsnes && window.jsnes.NES) return Promise.resolve(window.jsnes);
  if (NES_.lib) return NES_.lib;
  const one = src => new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = () => (window.jsnes && window.jsnes.NES ? ok(window.jsnes) : no(new Error('no engine')));
    s.onerror = () => { s.remove(); no(new Error('engine did not load')); };
    document.head.appendChild(s);
  });
  NES_.lib = one(NES_LIB).catch(() => one(NES_LIB_2)).catch(e => { NES_.lib = null; throw e; });
  return NES_.lib;
}

/* SOUND MUST BE MADE INSIDE THE TAP on iOS, so this runs synchronously in every handler that may start a game. */
function nesAudio_() {
  try {
    if (!NES_.audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      NES_.audio = new AC();
      NES_.ring = new Float32Array(8192 * 2); NES_.rd = NES_.wr = 0;
      const node = NES_.audio.createScriptProcessor(1024, 0, 2);
      node.onaudioprocess = e => {
        const L = e.outputBuffer.getChannelData(0), R = e.outputBuffer.getChannelData(1), n = NES_.ring.length;
        for (let i = 0; i < L.length; i++) {
          if (NES_.rd !== NES_.wr && NES_.running) { L[i] = NES_.ring[NES_.rd]; R[i] = NES_.ring[NES_.rd + 1]; NES_.rd = (NES_.rd + 2) % n; }
          else { L[i] = 0; R[i] = 0; }
        }
      };
      node.connect(NES_.audio.destination);
      NES_.node = node;
    }
    if (NES_.audio.state === 'suspended') NES_.audio.resume();
  } catch (e) {}
}
function nesSample_(l, r) {
  const n = NES_.ring.length, nx = (NES_.wr + 2) % n;
  if (nx === NES_.rd) return;   // full: drop rather than lag
  NES_.ring[NES_.wr] = l; NES_.ring[NES_.wr + 1] = r; NES_.wr = nx;
}

function nesFrame_(buf) {
  if (!NES_.u32) return;
  for (let i = 0; i < 61440; i++) NES_.u32[i] = 0xff000000 | buf[i];
  nesBlit_();
}
function nesBlit_() {
  const c = $('nes-canvas');
  if (!c || !NES_.img) return;
  const g = c.getContext('2d');
  if (g) g.putImageData(NES_.img, 0, 0);
}

function nesStart_(bytes) {
  const stage = $('nes-stage');
  if (!stage) return;
  const sys = nesSys_(bytes, NES_.kind);
  if (!sys) { nesSay_(NES_NOT); return; }
  if (sys !== 'nes') { emuStart_(bytes, sys); return; }
  emuEnd_(); nesSysSet_('nes');
  nesSay_('');
  waiting_(stage);
  nesLib_().then(lib => {
    loaded_(stage);
    nesStop_();
    try {
      NES_.nes = new lib.NES({ onFrame: nesFrame_, onAudioSample: NES_.ring ? nesSample_ : null,
        emulateSound: !!NES_.ring, sampleRate: NES_.audio ? NES_.audio.sampleRate : 48000 });
      NES_.nes.loadROM(bytes);
    } catch (e) { NES_.nes = null; nesSay_('This game file could not be started: ' + (e && e.message || e)); return; }
    NES_.rom = bytes;
    NES_.img = $('nes-canvas').getContext('2d').createImageData(256, 240);
    NES_.u32 = new Uint32Array(NES_.img.data.buffer);
    nesGo_();
    csvBegin_(bytes, 'nes', 'nes', csvApplyNes_);
  }).catch(() => { loaded_(stage); nesSay_('The console could not load. Check the connection and press Play again.'); });
}

function nesGo_() {
  if (EMU_.ejs) { emuGo_(); return; }
  if (!NES_.nes || NES_.running) return;
  nesRun_(true); NES_.last = 0; NES_.acc = 0;
  const loop = t => {
    if (!NES_.running) return;
    NES_.raf = requestAnimationFrame(loop);
    if (!$('nes-canvas')) { nesStop_(); return; }
    const dt = NES_.last ? Math.min(100, t - NES_.last) : 1000 / NES_HZ;
    NES_.last = t; NES_.acc += dt;
    nesPadsPoll_();
    let n = 0;
    while (NES_.acc >= 1000 / NES_HZ && n < 3) {
      try { NES_.nes.frame(); } catch (e) { nesStop_(); nesSay_('The game stopped: ' + (e && e.message || e)); return; }
      NES_.acc -= 1000 / NES_HZ; n++;
    }
    if (n === 3) NES_.acc = 0;
  };
  NES_.raf = requestAnimationFrame(loop);
  nesRowPaint_();
}
/* PAUSED, NOT ENDED: the game stays in memory and Play carries on from here. */
function nesStop_(force) {
  const was = NES_.running;
  nesRun_(false);
  cancelAnimationFrame(NES_.raf);
  NES_.held = {}; NES_.keys = {}; NES_.codes = {}; NES_.touch = {};
  if (NES_.nes) Object.values(NES_B).forEach(b => { try { NES_.nes.buttonUp(1, b); } catch (e) {} });
  if (EMU_.ejs) emuPause_(force);
  else if (was && NES_.nes) csvKeep_(force);
  if (was) nesRowPaint_();
}

/* EVERY SOURCE (keys, pad, touch) IS OR-ED, then only changes reach the engine. */
function nesSync_() {
  nesLight_();
  if (EMU_.ejs) { emuSync_(); return; }
  if (!NES_.nes) return;
  Object.keys(NES_B).forEach(k => {
    const on = !!(NES_.keys[k] || NES_.pads[k] || NES_.touch[k]);
    if (on === !!NES_.held[k]) return;
    NES_.held[k] = on;
    try { on ? NES_.nes.buttonDown(1, NES_B[k]) : NES_.nes.buttonUp(1, NES_B[k]); } catch (e) {}
  });
}

/* THE DRAWN BUTTONS LIGHT UNDER THE KEYS AND A CONTROLLER (437), so a key list's "X  A" is seen pressing the console's A; touched only when what is held changes. */
function nesLight_() {
  const held = Object.assign({}, NES_.keys, NES_.pads), sig = Object.keys(held).sort().join();
  if (sig === NES_.lit) return;
  NES_.lit = sig;
  const d = $('nes-deco');
  if (d) d.querySelectorAll('[data-k]').forEach(el => el.classList.toggle('is-down', el.dataset.k === 'dpad'
    ? ['up', 'down', 'left', 'right'].some(k => held[k]) : !!held[el.dataset.k]));
}

/* EVERY PAD, EVERY FRAME, connected event or not: Safari shows a pad only after a press with the page focused (390). Nintendo positions: right face A, bottom B. */
function nesPadsPoll_() {
  const p = {}, axes = [0, 0, 0, 0];
  let any = false;
  try {
    [...(navigator.getGamepads ? navigator.getGamepads() : [])].forEach(g => {
      if (!g || g.connected === false) return;
      any = true;
      const b = i => !!(g.buttons && g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.5));
      const ax = g.axes || [], x = Math.abs(ax[0] || 0) > 0.25 ? ax[0] : 0, y = Math.abs(ax[1] || 0) > 0.25 ? ax[1] : 0, std = g.mapping === 'standard';
      const four = NES_FOUR[NES_.sys], stick = NES_.sys !== 'n64';
      if (four) { if (b(1)) p.a = 1; if (b(0)) p.b = 1; if (b(3)) p.x = 1; if (b(2)) p.y = 1; }
      else { if (b(1) || b(3)) p.a = 1; if (b(0) || b(2)) p.b = 1; }
      if (b(4)) p.l = 1;
      if (b(5)) p.r = 1;
      if (std && b(6)) p.l2 = 1;
      if (std && b(7)) p.r2 = 1;
      if (b(10)) p.l3 = 1;
      if (b(11)) p.r3 = 1;
      if (b(9) || (!std && b(7))) p.start = 1;
      if (b(8) || (!std && b(6))) p.select = 1;
      if (b(12) || (stick && y < -0.5)) p.up = 1;
      if (b(13) || (stick && y > 0.5)) p.down = 1;
      if (b(14) || (stick && x < -0.5)) p.left = 1;
      if (b(15) || (stick && x > 0.5)) p.right = 1;
      const dz = v => (Math.abs(v || 0) > 0.25 ? Math.max(-1, Math.min(1, v)) : 0);
      if (!axes[0] && !axes[1]) { axes[0] = x; axes[1] = y; }
      if (!axes[2] && !axes[3]) { axes[2] = dz(ax[2]); axes[3] = dz(ax[3]); }
      /* A HAT SWITCH on axis 9 (many non-standard pads): -1 is up, clockwise in steps of 2/7, above 1 is centred. */
      const h = ax[9];
      if (!std && typeof h === 'number' && h >= -1.05 && h <= 1.05) {
        const s = Math.round((h + 1) * 3.5) % 8;
        if (s === 7 || s <= 1) p.up = 1;
        if (s >= 1 && s <= 3) p.right = 1;
        if (s >= 3 && s <= 5) p.down = 1;
        if (s >= 5 && s <= 7) p.left = 1;
      }
    });
  } catch (e) {}
  const wasStart = !!(NES_.pads && NES_.pads.start), was = Object.keys(NES_.pads || {}).length;
  NES_.pads = p; NES_.axes = axes;
  if (Object.keys(p).length && !was) { nesAudio_(); emuWake_(); }   // any press is a gesture enough to wake the sound

  if (any !== !!NES_.padOn) { NES_.padOn = any; nesPadShow_(); }
  if (p.start && !wasStart && !NES_.running) nesPadPlay_();
  nesSync_();
}

/* A CONTROLLER'S START BEGINS PLAY with a kept game; with none, it can only say so — a file picker needs a tap. */
function nesPadPlay_() {
  if (NES_.nes || EMU_.ready) { nesAudio_(); nesGo_(); return; }
  if (EMU_.ejs) return;
  const bytes = NES_.rom || NES_.saved;
  if (bytes) { nesAudio_(); nesStart_(bytes); return; }
  nesSay_('Controller connected. Choose a game file to play.');
}

/* WHILE NOTHING RUNS the game loop does not poll, so this does, for as long as the console is drawn. */
function nesPadWatch_() {
  if (NES_.watch) return;
  const tick = () => {
    if (!$('nes-wrap')) { NES_.watch = 0; return; }
    if (!NES_.running || EMU_.ejs) nesPadsPoll_();
    NES_.watch = requestAnimationFrame(tick);
  };
  NES_.watch = requestAnimationFrame(tick);
}
function nesPadUnwatch_() { cancelAnimationFrame(NES_.watch); NES_.watch = 0; }

/* TOUCH OR KEYS (419): a coarse pointer starts on the touch pad, a fine one on keys; a finger on the console or a key while it plays changes it. */
function nesMode_() {
  if (!NES_.mode) {
    let coarse = false;
    try { coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches); } catch (e) {}
    const touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
    NES_.mode = coarse && touch ? 'touch' : 'keys';
  }
  return NES_.mode;
}
function nesModeSet_(m) {
  if (nesMode_() === m) return;
  NES_.mode = m;
  nesPadShow_(); nesRowPaint_();
}
function nesModeWire_(w) {
  if (!w) return;
  w.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') nesModeSet_('touch'); }, true);
}
/* THE KEY LIST: hidden until the Keys tile asks, on every system, and not remembered (481): a "show" kept from before 478 was still showing it. */
try { localStorage.removeItem('nes-keys'); } catch (e) {}
function nesLegendOn_() {
  return nesMode_() === 'keys' && NES_.legend === true;
}
on('nes-keys', () => {
  NES_.legend = !nesLegendOn_();
  nesPadShow_(); nesRowPaint_();
});

/* THE TOUCH PAD on touch with no controller, from the first paint, so nothing moves when a game starts (419); the key list beside it. */
function nesPadShow_() {
  const pad = $('nes-pad'), lg = $('nes-legend'), w = $('nes-wrap');
  if (!pad) return;
  /* THE DS ALWAYS WEARS ITS BUTTONS (478): its pad is the lower shell, pressed by a finger or a mouse alike. */
  const on = NES_.sys === 'nds' || (nesMode_() === 'touch' && !NES_.padOn);
  pad.classList.toggle('on', on);
  if (w) { w.classList.toggle('nes-has-pad', on); w.classList.toggle('nes-has-deco', !on); }
  if (lg) {
    if (lg.dataset.sys !== NES_.sys) { lg.dataset.sys = NES_.sys; lg.innerHTML = nesLegendHtml_(NES_.sys); }
    lg.hidden = !nesLegendOn_();
    if (w) w.classList.toggle('nes-has-legend', !lg.hidden);
  }
  const n = $('nes-padnote');
  if (n) n.hidden = !NES_.padOn;
}

function nesPadWire_(pad) {
  if (!pad) return;
  const dirs = (el, e) => {
    const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const dead = r.width * 0.15;
    return { left: dx < -dead, right: dx > dead, up: dy < -dead, down: dy > dead };
  };
  /* ONE ENTRY PER FINGER, so two held buttons stay held while a third comes and goes; each finger is captured by the pad itself (419). */
  const ptrs = new Map();
  const redo = () => {
    const t = {};
    ptrs.forEach(v => Object.keys(v.keys).forEach(k => { if (v.keys[k]) t[k] = 1; }));
    NES_.touch = t; nesSync_();
    pad.querySelectorAll('[data-k]').forEach(el => el.classList.toggle('is-down', el.dataset.k === 'dpad'
      ? ['up', 'down', 'left', 'right'].some(d => t[d]) : !!t[el.dataset.k]));
  };
  /* A FINGER SLID FROM ONE FACE BUTTON ONTO ANOTHER presses the one it is on now; the D-pad keeps the finger that started on it. */
  const under = e => { const el = document.elementFromPoint(e.clientX, e.clientY); const k = el && el.closest && el.closest('[data-k]'); return k && pad.contains(k) ? k : null; };
  pad.addEventListener('pointerdown', e => {
    const k = e.target.closest('[data-k]');
    if (!k) return;
    e.preventDefault(); emuWake_();
    try { pad.setPointerCapture(e.pointerId); } catch (err) {}
    ptrs.set(e.pointerId, { el: k, keys: k.dataset.k === 'dpad' ? dirs(k, e) : { [k.dataset.k]: true } });
    redo();
  });
  pad.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId);
    if (!p) return;
    if (p.el.dataset.k === 'dpad') { p.keys = dirs(p.el, e); redo(); return; }
    const k = under(e);
    if (k && k !== p.el && k.dataset.k !== 'dpad') { p.el = k; p.keys = { [k.dataset.k]: true }; redo(); }
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n =>
    pad.addEventListener(n, e => { if (ptrs.delete(e.pointerId)) redo(); }));
  pad.addEventListener('contextmenu', e => e.preventDefault());
  /* NO SELECTING, MAGNIFYING OR DOUBLE-TAP ZOOM under a held thumb (iOS starts those from touch events, not pointer ones). */
  pad.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); }, { passive: false });
}

/* A PAD KEY PRESSED WITH NO GAME RUNNING says what to do, rather than nothing (owner, 12 Nov). */
document.addEventListener('click', e => {
  const k = e.target && e.target.closest && e.target.closest('.nes-pad [data-k]');
  if (!k || NES_.nes || EMU_.ready) return;
  document.querySelectorAll('[id="nes-kept"]').forEach(n => { n.hidden = false; n.textContent = 'Choose a game file you own to play it.'; });
});
on('nes-play', () => {
  nesAudio_(); emuWake_();
  if (NES_.nes || EMU_.ready) { nesGo_(); return; }
  if (EMU_.ejs) return;   // still loading: it starts by itself
  const bytes = NES_.rom || NES_.saved;
  if (bytes) { nesStart_(bytes); return; }
  /* NOTHING TO PLAY YET: say so on every copy, then open the chooser (a press always answers, owner 12 Nov). */
  document.querySelectorAll('[id="nes-kept"]').forEach(n => { n.hidden = false; n.textContent = 'Choose a game file you own to play it.'; });
  const f = $('nes-file');
  if (f) f.click();
});
on('nes-pick', () => { nesAudio_(); const f = $('nes-file'); if (f) f.click(); });
on('nes-pause', () => nesStop_());
on('nes-forget', () => {
  nesStop_();
  emuEnd_();
  NES_.nes = null; NES_.rom = null; NES_.saved = false; NES_.kind = null; NES_.img = null; NES_.u32 = null;
  const c = $('nes-canvas'); if (c) c.getContext('2d').clearRect(0, 0, 256, 240);
  nesForgetDb_().then(() => { nesRowPaint_(); nesSay_('Forgotten. The file is no longer kept on this device.'); });
});

document.addEventListener('change', e => {
  if (!e.target || e.target.id !== 'nes-file') return;
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  f.arrayBuffer().then(ab => {
    const u8 = new Uint8Array(ab), sys = nesSys_(u8, f.name);
    if (!sys) { nesSay_(NES_NOT); return; }
    nesStop_(); emuEnd_();
    NES_.nes = null; NES_.rom = null; NES_.saved = u8; NES_.kind = sys;
    /* put() copies the bytes as it is called, so no second copy is made first: a DS file can be 256 MB (399). */
    nesKeep_(ab, sys).then(ok => { if (ok || !NES_.fullDb) return; nesSay_(NES_ROOM); nesForgetDb_(); });
    nesStart_(u8);
  }).catch(() => nesSay_('That file could not be read.'));
});

/* KEYS ONLY WHILE A GAME RUNS, and the arrows and Space neither turn the column nor scroll the page under it; a shortcut with Ctrl, Alt or Cmd is the browser's. */
['keydown', 'keyup'].forEach(type => document.addEventListener(type, e => {
  if (!NES_.running) return;
  const k = nesKeyFor_(e, NES_.sys);
  if (!k) return;
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  const down = type === 'keydown';
  if (down && (e.ctrlKey || e.metaKey || e.altKey)) return;
  e.preventDefault(); e.stopPropagation();
  if (down && nesMode_() !== 'keys') nesModeSet_('keys');
  /* BY KEY, so Z let go while K still holds B leaves B held. */
  const code = e.code || e.key, codes = NES_.codes || (NES_.codes = {});
  if (!!codes[code] === down) return;   // a held key repeating
  if (down) codes[code] = k; else delete codes[code];
  const keys = {};
  Object.keys(codes).forEach(c => { keys[codes[c]] = true; });
  NES_.keys = keys; nesSync_();
}, true));
/* A KEY LET GO WHILE THE WINDOW HAD NO FOCUS never sends its keyup: nothing stays held after a switch away. */
window.addEventListener('blur', () => { NES_.codes = {}; if (Object.keys(NES_.keys).length) { NES_.keys = {}; nesSync_(); } });

/* ---------- THE REST OF THE APP HOLDS STILL WHILE A GAME PLAYS (419): the builder, every other widget, and the looping animations. */
function nesRun_(on) {
  NES_.running = !!on;
  nesQuiet_(NES_.running);
}
function nesQuiet_(on) {
  if (!!on === !!NES_.quiet) return;
  NES_.quiet = !!on;
  try { document.body.classList.toggle('nes-on', NES_.quiet); } catch (e) {}
  if (NES_.quiet) {
    /* THE BUILDER'S OWN HOLD (shell.js), taken only if nobody else holds it, and given back the same way. */
    if (!window.__aheadHold) { window.__aheadHold = true; NES_.aheadHeld = true; }
    try { toolsStop_(e => String(e.w.id) === 'console', () => false); } catch (e) {}
    return;
  }
  if (NES_.aheadHeld) { NES_.aheadHeld = false; window.__aheadHold = false; try { aheadKick_(); } catch (e) {} }
  /* AFTER THIS TASK: a pause can come from inside `toolsStop_` (the column being left), which must finish first. */
  setTimeout(() => {
    if (NES_.quiet) return;
    try { if (WIDGET_COLS.indexOf(AT) !== -1) widgetsWake_(widgetsOn_(AT), AT, true); widgetsGlass_(true); } catch (e) {}
  }, 0);
}

document.addEventListener('visibilitychange', () => { if (document.hidden) nesStop_(true); });
/* OFF THE SCREEN IS PAUSED (478): a console scrolled or slid out of view stops running the core for nobody. */
function nesSeen_(w) {
  if (!w || w.seen_ || typeof window.IntersectionObserver !== 'function') return;
  w.seen_ = true;
  try { new window.IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && NES_.running && e.target.isConnected) nesStop_(); })).observe(w); } catch (e) {}
}
window.addEventListener('gamepadconnected', () => { NES_.padOn = true; nesPadShow_(); nesPadWatch_(); });
window.addEventListener('gamepaddisconnected', () => nesPadsPoll_());

/* ---------- THE OTHER SYSTEMS (391): SNES, Game Boy / Color / Advance, N64 and DS (399), the person's own files.
   EmulatorJS (GPL-3.0) and its cores, pinned, fetched only when one is played. */
const NES_ACCEPT = '.nes,.sfc,.smc,.gb,.gbc,.gba,.z64,.n64,.v64,.nds,application/octet-stream,*&#47;*';
const NES_ROOM = "This device hasn't room to keep the file — pick it each time.";
const NES_NOT = 'That is not a console game file — it should be a .nes, .sfc/.smc, .gb/.gbc/.gba, .z64/.n64/.v64 or .nds file.';
/* THE DS HINGE (437, 481): melonDS leaves this many black rows between its screens; the two halves and the hinge are drawn over exactly them (90 is a real DS Lite's spacing), so no game pixel is covered and the pen lands where put. */
const NES_GAP = 90;
/* Each system's picture in pixels, for the stage's shape and the full-screen fit. DS: its two 256x192 screens stacked, top above bottom, the hinge's rows between. */
const NES_DIMS = { nes: [256, 240], snes: [256, 224], gb: [160, 144], gbc: [160, 144], gba: [240, 160], n64: [320, 240], nds: [256, 384 + NES_GAP] };
/* THE SHAPE A TELEVISION SHOWED (446): a home console's pixels were wider than tall, so its picture is 4:3; a handheld's are square. */
const NES_SHOW = { nes: 4 / 3, snes: 4 / 3, n64: 4 / 3 };
const nesShow_ = sys => NES_SHOW[sys] || NES_DIMS[sys][0] / NES_DIMS[sys][1];
/* Systems with four face buttons read a controller by position (right A, bottom B, top X, left Y); two-button ones fold them onto A and B. */
const NES_FOUR = { snes: 1, n64: 1, nds: 1 };
/* THE ONE LINE UNDER A HEAVY SYSTEM, said plainly: these run on the page's one thread, and a slow laptop or an older phone shows it (419). */
const NES_SLOW = { n64: 'N64 games need a fast device; older phones may stutter.',
  nds: 'DS games need a fast device; on an older laptop or phone they may run slow. Closing other tabs helps.' };

/* WHICH SYSTEM, from the bytes first (header magic and checksums), then the file's extension. Nothing of any game is kept here. */
function nesSys_(u8, hint) {
  if (!u8 || u8.length < 512) return null;
  const ext = String(hint || '').toLowerCase().replace(/^.*\./, '');
  if (u8[0] === 0x4e && u8[1] === 0x45 && u8[2] === 0x53 && u8[3] === 0x1a) return nesValid_(u8) ? 'nes' : null;
  if (nesDs_(u8)) return 'nds';
  const w = (u8[0] << 24 | u8[1] << 16 | u8[2] << 8 | u8[3]) >>> 0;
  if (w === 0x80371240 || w === 0x37804012 || w === 0x40123780) return 'n64';   // big-endian, byte-swapped, little-endian
  if (u8.length >= 0xc0 && u8[0xb2] === 0x96 && u8[3] === 0xea) return 'gba';   // fixed byte, and a branch as the first word
  if (u8.length >= 0x8000) {
    let x = 0;
    for (let i = 0x134; i <= 0x14c; i++) x = (x - u8[i] - 1) & 0xff;
    if (x === u8[0x14d] && (u8[0x100] === 0x00 || u8[0x100] === 0xc3)) return u8[0x143] & 0x80 ? 'gbc' : 'gb';
    const off = u8.length % 1024 === 512 ? 512 : 0;
    const ok = at => { const b = off + at; return b + 0x20 <= u8.length && ((u8[b + 0x1c] | u8[b + 0x1d] << 8) ^ (u8[b + 0x1e] | u8[b + 0x1f] << 8)) === 0xffff; };
    if (ok(0x7fc0) || ok(0xffc0)) return 'snes';
  }
  const by = { sfc: 'snes', smc: 'snes', snes: 'snes', gb: 'gb', gbc: 'gbc', gba: 'gba', z64: 'n64', n64: 'n64', v64: 'n64', nds: 'nds' };
  return by[ext] || (by[hint] ? hint : null);
}

/* A DS CARTRIDGE HEADER: the logo's fixed checksum 0xCF56 at 0x15C, and the header's own CRC-16 (over 0-0x15D) at 0x15E. */
function nesDs_(u8) {
  if (u8.length < 0x200 || u8[0x15c] !== 0x56 || u8[0x15d] !== 0xcf) return false;
  let c = 0xffff;
  for (let i = 0; i < 0x15e; i++) { c ^= u8[i]; for (let j = 0; j < 8; j++) c = c & 1 ? (c >>> 1) ^ 0xa001 : c >>> 1; }
  return c === (u8[0x15e] | u8[0x15f] << 8);
}

/* THE TOUCH PAD per system: shoulders, a face diamond on SNES and DS, A, B, Z and C on N64 (no Select: it has none).
   `drawn`: the same buttons as pictures beside the screen while keys play (437), spans. */
function nesPadHtml_(sys, drawn) {
  const tag = drawn ? 'span' : 'button', type = drawn ? '' : ' type="button"';
  const k = (key, label, cls) => `<${tag}${type} class="nes-key ${cls || 'nes-round'}" data-k="${key}">${label}</${tag}>`;
  const mid = `<div class="nes-mid">${sys === 'n64' ? '' : k('select', 'Select', 'nes-small')}${k('start', 'Start', 'nes-small')}</div>`;
  const dpad = `<div class="nes-dpad${sys === 'n64' ? ' nes-stick' : ''}" data-k="dpad"></div>`;
  let top = '', face;
  if (sys === 'snes' || sys === 'nds') {
    top = k('l', 'L', 'nes-small nes-l') + k('r', 'R', 'nes-small nes-r');
    face = `<div class="nes-face">${k('x', 'X', 'nes-round nes-n nes-x')}${k('y', 'Y', 'nes-round nes-w nes-y')}${k('a', 'A', 'nes-round nes-e nes-a')}${k('b', 'B', 'nes-round nes-s nes-b')}</div>`;
  } else if (sys === 'n64') {
    top = k('l', 'L', 'nes-small nes-l') + k('l2', 'Z', 'nes-small nes-z') + k('r', 'R', 'nes-small nes-r');
    face = `<div class="nes-right"><div class="nes-ab">${k('y', 'B', 'nes-round nes-b')}${k('b', 'A', 'nes-round nes-a')}</div>`
      + `<div class="nes-face nes-c">${k('cu', 'C↑', 'nes-c1 nes-n')}${k('cl', 'C←', 'nes-c1 nes-w')}${k('cr', 'C→', 'nes-c1 nes-e')}${k('cd', 'C↓', 'nes-c1 nes-s')}</div></div>`;
  } else {
    if (sys === 'gba') top = k('l', 'L', 'nes-small nes-l') + k('r', 'R', 'nes-small nes-r');
    face = `<div class="nes-ab">${k('b', 'B', 'nes-round nes-b')}${k('a', 'A', 'nes-round nes-a')}</div>`;
  }
  return (top ? `<div class="nes-shoulders">${top}</div>` : '') + dpad + mid + face;
}

/* ONE SYSTEM AT A TIME on the stage: its shape, its pad, and the N64 line about older phones. */
function nesSysSet_(sys) {
  NES_.sys = sys || 'nes';
  const s = $('nes-stage'), pad = $('nes-pad'), note = $('nes-sysnote'), wrap = $('nes-wrap');
  if (wrap) { wrap.dataset.sys = NES_.sys; wrap.style.setProperty('--ds-gap', String(NES_GAP)); }   // its pad's height; the DS's gap rows, style.css
  /* `--nes-ar` too: the stage's width is capped by the screen's height through it (style.css), so a tall DS picture fits a laptop's screen. */
  if (s) { const ar = nesShow_(NES_.sys); s.style.aspectRatio = String(ar); s.style.setProperty('--nes-ar', String(ar)); s.dataset.sys = NES_.sys; }
  if (pad && pad.dataset.sys !== NES_.sys) {
    pad.dataset.sys = NES_.sys; pad.innerHTML = nesPadHtml_(NES_.sys);
  }
  const deco = $('nes-deco');
  if (deco && deco.dataset.sys !== NES_.sys) { deco.dataset.sys = NES_.sys; deco.innerHTML = nesPadHtml_(NES_.sys, true); NES_.lit = null; nesLight_(); }
  /* THE HINGE over the DS's black rows between its screens, as fractions of the stage so it follows any size. */
  const hinge = $('nes-hinge');
  if (hinge) { const [, h] = NES_DIMS[NES_.sys]; hinge.style.top = (NES_.sys === 'nds' ? 19200 / h : 0) + '%'; hinge.style.height = (NES_.sys === 'nds' ? 100 * NES_GAP / h : 0) + '%'; }
  if (note) { note.hidden = !EMU_HEAVY[NES_.sys]; note.textContent = NES_SLOW[NES_.sys] || ''; }
  nesPadShow_();
}

/* ---------- EMULATORJS, ONCE, with its menus, start button, own keys and own pad switched off: the Console's tiles and inputs drive it. */
const EMU_VER = '4.2.3';
const EMU_CDN = ['https://cdn.jsdelivr.net/npm/', 'https://unpkg.com/'];
const EMU_SRC = ['storage.js', 'gamepad.js', 'nipplejs.js', 'shaders.js', 'GameManager.js', 'compression.js', 'emulator.js'];
/* Gambatte for Game Boy and Color, mGBA for Advance (mGBA refused a Game Boy file in the test, 391). Safari on iPhone and iPad gets parallel_n64, as EmulatorJS itself chooses there. */
const EMU_CORE = { snes: 'snes9x', gb: 'gambatte', gbc: 'gambatte', gba: 'mgba', n64: 'mupen64plus_next', nds: 'melonds' };
/* RetroPad numbering (libretro): every input source's names land here. 16-23 are the sticks, sent as two half-axes each. */
const EMU_IDX = { b: 0, y: 1, select: 2, start: 3, up: 4, down: 5, left: 6, right: 7, a: 8, x: 9, l: 10, r: 11, l2: 12, r2: 13, l3: 14, r3: 15 };
const EMU_ = { ejs: null, ready: false, sys: null, key: '', base: null, lib: null, held: {}, ax: [] };

function emuLib_() {
  if (window.EmulatorJS && EMU_.base) return Promise.resolve(EMU_.base);
  if (EMU_.lib) return EMU_.lib;
  const one = src => new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.async = false; s.crossOrigin = 'anonymous';
    s.onload = ok;
    s.onerror = () => { s.remove(); no(new Error('engine did not load')); };
    document.head.appendChild(s);
  });
  const from = cdn => EMU_SRC.reduce((p, f) => p.then(() => one(cdn + '@emulatorjs/emulatorjs@' + EMU_VER + '/data/src/' + f)), Promise.resolve())
    .then(() => { if (!window.EmulatorJS) throw new Error('no engine'); emuQuiet_(); EMU_.base = cdn; return cdn; });
  EMU_.lib = from(EMU_CDN[0]).catch(() => from(EMU_CDN[1])).catch(e => { EMU_.lib = null; throw e; });
  return EMU_.lib;
}

/* TWO EMULATORJS COSTS ON A SLOW LAPTOP (419): its controller poll, a 10 ms timer though its controls are off (the Console polls
   each frame), and 64 ms of sound, which crackles at a DS or N64 game's first slow frame: 128. */
function emuQuiet_() {
  try {
    const G = window.GamepadHandler;
    if (G && !G.quiet_) { G.quiet_ = true; G.prototype.loop = function () {}; }
  } catch (e) {}
  try {
    const M = window.EJS_GameManager;
    if (M && !M.quiet_ && typeof M.prototype.getRetroArchCfg === 'function') {
      M.quiet_ = true;
      const cfg = M.prototype.getRetroArchCfg;
      M.prototype.getRetroArchCfg = function () {
        const s = cfg.call(this);
        return EMU_HEAVY[EMU_.sys] ? String(s).replace(/audio_latency = \d+/, 'audio_latency = 128') : s;
      };
    }
  } catch (e) {}
}
const EMU_HEAVY = { nds: 1, n64: 1 };
/* NOTHING EXTRA PER FRAME (481): EmulatorJS's own defaults, written down so a later version cannot turn them on; its five-minute save timer off, as the Console saves at a pause. */
const EMU_LEAN = { rewindEnabled: 'disabled', shader: 'disabled', 'save-save-interval': '0' };
/* THREADS NEED A CROSS-ORIGIN-ISOLATED PAGE, and GitHub Pages sends no COOP/COEP headers: the core runs on the page's one thread.
   On an isolated page the threaded build is taken, and melonDS draws 3D on its own thread. */
const emuThreads_ = () => !!(window.crossOriginIsolated && typeof SharedArrayBuffer === 'function');

/* A NAME FOR THE BATTERY SAVE, from the bytes, so two games never share one; the file's own name is never used. */
function emuName_(u8, sys) {
  let h = 0x811c9dc5;
  for (let i = 0; i < u8.length; i += 1 + (u8.length >> 22)) { h ^= u8[i]; h = Math.imul(h, 0x01000193) >>> 0; }
  return 'game-' + h.toString(16) + '-' + u8.length.toString(16) + '.' + ({ snes: 'sfc', gb: 'gb', gbc: 'gbc', gba: 'gba', n64: 'z64', nds: 'nds' })[sys];
}

const emuIos_ = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const NES_NO_DS_IOS = 'DS games do not run on an iPhone or iPad yet. They play on a computer, or on an Android phone or tablet.';
function emuStart_(bytes, sys) {
  const stage = $('nes-stage');
  if (!stage) return;
  const name = emuName_(bytes, sys);
  if (EMU_.ejs && EMU_.key === name) { emuGo_(); return; }
  /* NOT THE DS ON AN IPHONE OR IPAD (446): "ds isn't working on my iPad" — melonDS stops there with no word, so a plain one is said instead. */
  if (sys === 'nds' && emuIos_()) { nesStop_(); emuEnd_(); nesSysSet_(sys); nesRowPaint_(); nesSay_(NES_NO_DS_IOS); return; }
  nesStop_(); NES_.nes = null; emuEnd_();
  nesSysSet_(sys); nesSay_('');
  NES_.rom = bytes;
  waiting_(stage);
  emuLib_().then(cdn => {
    if (!$('nes-stage')) return;
    const ios = emuIos_();
    const core = sys === 'n64' && ios ? 'parallel_n64' : EMU_CORE[sys], pkg = cdn + '@emulatorjs/core-' + core + '@' + EMU_VER + '/';
    const files = { [core + '.json']: pkg + 'reports/' + core + '.json' };
    const threads = emuThreads_();
    (threads ? ['-thread-wasm.data', '-thread-legacy-wasm.data'] : ['-wasm.data', '-legacy-wasm.data']).forEach(t => { files[core + t] = pkg + core + t; });
    const host = document.createElement('div');
    host.id = 'emu-host'; host.className = 'emu-host';
    $('nes-stage').appendChild(host);
    const none = { 0: {}, 1: {}, 2: {}, 3: {} };
    const ejs = new window.EmulatorJS('#emu-host', {
      gameUrl: bytes, gameName: name, system: core, dataPath: cdn + '@emulatorjs/emulatorjs@' + EMU_VER + '/data/',
      filePaths: files, startOnLoad: true, defaultControllers: none, noAutoFocus: true, disableLocalStorage: true,
      volume: 1, threads, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--on-gold').trim(), buttonOpts: {}, cheats: [],
      defaultOptions: Object.assign({}, EMU_LEAN, sys === 'nds' ? Object.assign({ melonds_screen_gap: String(NES_GAP) }, threads ? { melonds_threaded_renderer: 'enabled' } : {}) : {}) });
    EMU_.ejs = ejs; EMU_.sys = sys; EMU_.key = name; EMU_.ready = false; EMU_.held = {}; EMU_.ax = [];
    const fail = m => { if (EMU_.ejs !== ejs) return; loaded_($('nes-stage')); emuEnd_(); nesRowPaint_(); nesSay_('This game file could not be started: ' + (m || 'the engine stopped') + '.'); };
    const said = ejs.startGameError.bind(ejs);
    ejs.startGameError = m => { try { said(m); } catch (e) {} fail(String(m || '').replace(/\s+/g, ' ')); };
    ejs['on']('start', () => {   // EmulatorJS's own event, not a tile
      if (EMU_.ejs !== ejs) return;
      loaded_($('nes-stage'));
      EMU_.ready = true;
      try { ejs.gameManager.setKeyboardEnabled(false); } catch (e) {}
      ejs.enableMouseLock = false;   // a DS screen is touched where it is, so a mouse click must not capture the pointer (399)
      if (sys === 'nds') emuTouch_(ejs.canvas);
      if (!$('nes-wrap') || document.hidden) { try { ejs.pause(true); } catch (e) {} nesRun_(false); }
      else nesRun_(true);
      emuWake_(); nesRowPaint_();
      csvBegin_(bytes, sys, name, csvApplyEmu_);
    });
  }).catch(() => { loaded_(stage); emuEnd_(); nesRowPaint_(); nesSay_('The console could not load. Check the connection and press Play again.'); });
}

/* A FINGER IS THE DS PEN: the core reads only the mouse, so the first finger on its picture is passed on as one (399). */
function emuTouch_(c) {
  if (!c || c.dataset.touch) return;
  c.dataset.touch = '1';
  let id = null;
  const as = (type, t) => c.dispatchEvent(new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: t.clientX, clientY: t.clientY, button: 0, buttons: type === 'mouseup' ? 0 : 1 }));
  const mine = e => [...e.changedTouches].find(t => t.identifier === id);
  c.addEventListener('touchstart', e => {
    e.preventDefault(); emuWake_();
    if (id !== null) return;
    const t = e.changedTouches[0]; id = t.identifier; as('mousemove', t); as('mousedown', t);
  }, { passive: false });
  c.addEventListener('touchmove', e => { e.preventDefault(); const t = mine(e); if (t) as('mousemove', t); }, { passive: false });
  ['touchend', 'touchcancel'].forEach(n => c.addEventListener(n, e => { const t = mine(e); if (t) { id = null; as('mouseup', t); } }));
}

function emuGo_() {
  if (!EMU_.ready || NES_.running) return;
  try { EMU_.ejs.play(true); } catch (e) { return; }
  nesRun_(true); emuWake_(); nesRowPaint_();
}
/* PAUSE KEEPS THE BATTERY SAVE: the cartridge's memory is written to this device's IndexedDB (EmulatorJS's own) at every pause. */
function emuPause_(force) {
  if (!EMU_.ready) return;
  emuSync_(true);
  try { EMU_.ejs.pause(true); } catch (e) {}
  try { EMU_.ejs.gameManager.saveSaveFiles(); } catch (e) {}
  csvKeep_(force);
}
/* THE SOUND WAKES INSIDE A TAP: iOS starts EmulatorJS's audio suspended, and its own "click to resume" box is hidden with its menus. */
function emuWake_() {
  try {
    const al = EMU_.ejs && EMU_.ejs.Module && EMU_.ejs.Module.AL;
    if (al && al.currentCtx) al.currentCtx.sources.forEach(c => { const x = c.gain && c.gain.context; if (x && x.state === 'suspended') x.resume(); });
    if (al && al.currentCtx && al.currentCtx.audioCtx && al.currentCtx.audioCtx.state === 'suspended') al.currentCtx.audioCtx.resume();
  } catch (e) {}
}
function emuEnd_() {
  if (EMU_.ready) csvKeep_(true);
  const ejs = EMU_.ejs;
  EMU_.ejs = null; EMU_.ready = false; EMU_.sys = null; EMU_.key = ''; EMU_.held = {}; EMU_.ax = [];
  if (ejs) {
    try { if (ejs.started) ejs.gameManager.saveSaveFiles(); } catch (e) {}
    try { ejs.callEvent('exit'); } catch (e) {}
  }
  const h = $('emu-host'); if (h) h.remove();
}

/* EVERY SOURCE OR-ED, then only changes reach the core. On N64 the arrows and the touch D-pad steer the stick, which is how its games are driven. */
function emuSync_(off) {
  const g = EMU_.ready && EMU_.ejs && EMU_.ejs.gameManager;
  if (!g) return;
  const src = k => !off && !!(NES_.keys[k] || NES_.pads[k] || NES_.touch[k]);
  const n64 = EMU_.sys === 'n64', dig = k => !off && !!(NES_.keys[k] || NES_.touch[k]);
  Object.keys(EMU_IDX).forEach(k => {
    const on = n64 && /^(up|down|left|right)$/.test(k) ? !off && !!NES_.pads[k] : src(k);
    if (on === !!EMU_.held[k]) return;
    EMU_.held[k] = on;
    try { g.simulateInput(0, EMU_IDX[k], on ? 1 : 0); } catch (e) {}
  });
  const pa = off ? [0, 0, 0, 0] : NES_.axes || [0, 0, 0, 0], one = (p, m) => (dig(p) ? 1 : 0) - (dig(m) ? 1 : 0);
  const lx = n64 && one('right', 'left') ? one('right', 'left') : pa[0], ly = n64 && one('down', 'up') ? one('down', 'up') : pa[1];
  const rx = one('cr', 'cl') || pa[2], ry = one('cd', 'cu') || pa[3];
  [lx, ly, rx, ry].forEach((v, i) => {
    const plus = Math.round(Math.max(0, v) * 0x7fff), minus = Math.round(Math.max(0, -v) * 0x7fff), at = 16 + i * 2;
    if (EMU_.ax[at] !== plus) { EMU_.ax[at] = plus; try { g.simulateInput(0, at, plus); } catch (e) {} }
    if (EMU_.ax[at + 1] !== minus) { EMU_.ax[at + 1] = minus; try { g.simulateInput(0, at + 1, minus); } catch (e) {} }
  });
}


/* ---------- A CONSOLE GAME KEEPS ITS PROGRESS (446): the battery save and a save state, per game file, on this device and on the account. */
/* Keyed by a hash of the file's bytes; the file itself is never stored with a save nor sent. One save per game, the latest. */
const CSV_DB = 'family-console-saves';
const CSV_ = { hash: '', sys: '', at: 0, where: '', said: '', sent: '', timer: 0, rom: null, took: 0 };
/* ONE SAVE A MINUTE AT MOST (478): a DS state is megabytes, read, zipped and posted on the page's one thread, so a pause, a slide or a scroll does not each take one. Leaving always does. */
const CSV_EVERY = 60000;

/* SHA-256 where the browser has it; the same bytes give the same key on every device. A plain-http page falls back to a longer FNV. */
function csvHash_(u8) {
  const fnv = () => { let a = 0x811c9dc5, b = 0x01000193 ^ u8.length;
    for (let i = 0; i < u8.length; i++) { a = Math.imul(a ^ u8[i], 0x01000193) >>> 0; b = Math.imul(b ^ u8[i], 0x5bd1e995) >>> 0; }
    return Promise.resolve(('0000000' + a.toString(16)).slice(-8) + ('0000000' + b.toString(16)).slice(-8) + ('0000000' + u8.length.toString(16)).slice(-8)); };
  try {
    if (!(window.crypto && crypto.subtle)) return fnv();
    return crypto.subtle.digest('SHA-256', u8).then(d => [...new Uint8Array(d)].slice(0, 16).map(x => ('0' + x.toString(16)).slice(-2)).join('')).catch(fnv);
  } catch (e) { return fnv(); }
}

/* Its own database, so the kept game file's store is never upgraded under it. Any failure is "nothing kept on this device". */
function csvDb_(mode, fn) {
  return new Promise(res => {
    try {
      const rq = indexedDB.open(CSV_DB, 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('save');
      rq.onerror = () => res(null);
      rq.onsuccess = () => {
        try {
          const tx = rq.result.transaction('save', mode), r = fn(tx.objectStore('save'));
          tx.oncomplete = () => { res(r && 'result' in r ? r.result : true); rq.result.close(); };
          tx.onerror = tx.onabort = () => { res(null); rq.result.close(); };
        } catch (e) { res(null); }
      };
    } catch (e) { res(null); }
  });
}

/* THE GAME AS IT IS NOW, read at once (before a pause or an exit changes it): EmulatorJS's own state and save file, or jsnes's JSON. */
function csvCapture_() {
  if (!CSV_.hash) return null;
  let sram = null, state = null;
  if (EMU_.ejs && EMU_.ready && EMU_.key === CSV_.rom) {
    const g = EMU_.ejs.gameManager;
    try { const f = g.getSaveFile(); if (f && f.length) sram = new Uint8Array(f); } catch (e) {}
    try { if (!g.supportsStates || g.supportsStates()) { const s = g.getState(); if (s && s.length) state = new Uint8Array(s); } } catch (e) {}
  } else if (NES_.nes && NES_.rom && CSV_.rom === 'nes') {
    try { state = new TextEncoder().encode(JSON.stringify(NES_.nes.toJSON())); } catch (e) {}
  } else return null;
  return sram || state ? { hash: CSV_.hash, sys: CSV_.sys, at: Date.now(), sram, state } : null;
}

/* AT EVERY PAUSE AND LEAVE: kept on this device. The account copy (`consoleSave`/`consoleLoad`) was retired from the server in a3a28da, so a save never leaves the device. */
function csvKeep_(force) {
  if (!force && CSV_.took && Date.now() - CSV_.took < CSV_EVERY) return;
  const rec = csvCapture_();
  if (!rec) return;
  CSV_.took = Date.now();
  csvDb_('readwrite', s => s.put(rec, rec.hash)).then(ok => { if (ok) { CSV_.at = rec.at; CSV_.where = 'device'; csvLine_(); } });
}

/* THE DEVICE'S SAVE, as raw bytes; nothing at all is a fresh game. */
function csvFind_(hash) {
  return csvDb_('readonly', s => s.get(hash)).then(r => (r && r.hash === hash ? r : null));
}

/* A GAME STARTING: its key, then its save put back. `rom` is EmulatorJS's game name, or 'nes'; a game swapped meanwhile is left alone. */
function csvBegin_(bytes, sys, rom, apply) {
  CSV_.hash = ''; CSV_.sys = sys; CSV_.rom = rom; CSV_.at = 0; CSV_.where = ''; CSV_.said = ''; CSV_.sent = ''; CSV_.took = 0;
  csvLine_();
  return csvHash_(bytes).then(h => {
    if (CSV_.rom !== rom) return null;
    CSV_.hash = h;
    return csvFind_(h);
  }).then(rec => {
    if (!rec || CSV_.rom !== rom || rec.hash !== CSV_.hash) return;
    try { apply(rec); } catch (e) { return; }
    CSV_.at = rec.at; CSV_.where = rec.account ? 'account' : 'device'; csvLine_();
  });
}
/* EMULATORJS: the battery file written where the core reads it and read again, then the state on top. */
function csvApplyEmu_(rec) {
  const g = EMU_.ejs && EMU_.ejs.gameManager;
  if (!g) return;
  if (rec.sram && rec.sram.length) { try { g.FS.writeFile(g.getSaveFilePath(), rec.sram); g.loadSaveFiles(); } catch (e) {} }
  if (rec.state && rec.state.length) g.loadState(rec.state);
}
function csvApplyNes_(rec) {
  if (rec.state && NES_.nes) NES_.nes.fromJSON(JSON.parse(new TextDecoder().decode(rec.state)));
}

/* THE QUIET LINE UNDER THE CONSOLE: when the game was last kept and where, or why it could not be. */
function csvLine_() {
  const p = $('nes-kept');
  if (!p) return;
  let s = CSV_.said;
  if (!s && CSV_.at && CSV_.hash) {
    const m = Math.round((Date.now() - CSV_.at) / 60000);
    s = 'Saved ' + (m < 1 ? 'just now' : m === 1 ? '1 min ago' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' days ago')
      + (CSV_.where === 'account' ? ' to your account' : ' on this device');
  }
  p.textContent = s || '';
  p.hidden = !s;
  clearTimeout(CSV_.timer);
  if (s && !CSV_.said) CSV_.timer = setTimeout(csvLine_, 30000);
}

;
/* ==== js/racer.js ==== */
/* @family. — racer.js THE COLLIERS WOOD RACER (426; back 15 Nov 2026, a Console game): OSM streets at DEM heights in WebGL; plays `?race=1`'s map, else data/race-map.json. */
/* The map is built by the backend's `buildRaceMap_` and fetched from `?race=1`; until then data/race-map.json plays (464). x metres east, y north, h above sea. */

/* THE LOOP, BY ROAD NAME: each name's middle is a waypoint, visited in order round their centre. Names OSM may not have
   are skipped; with fewer than three the loop goes round the map's major roads instead. */
const RACE_ROUTE = ['High Street Colliers Wood', 'Christchurch Road', 'Merantun Way', 'Merton High Street'];
const RACE_GATE_M = 110;          // a checkpoint every 110 m along the loop
const RACE_DT = 1 / 60;           // the physics step, seconds
const RACE_G = 9.81;
/* The scene's own colours (sky, grass, asphalt, brick); the HUD's are the app's tokens, in style.css. */
const RACE_COL = {
  sky: [0.62, 0.78, 0.9], grass: [0.36, 0.55, 0.3], road: [0.27, 0.27, 0.29], kerb: [0.6, 0.6, 0.58],
  line: [0.92, 0.92, 0.88], water: [0.25, 0.45, 0.62], roof: [0.38, 0.33, 0.31],
  walls: [[0.62, 0.36, 0.27], [0.72, 0.56, 0.42], [0.84, 0.8, 0.72], [0.55, 0.53, 0.52], [0.66, 0.44, 0.33]],
  /* COLLIERS WOOD'S OWN (500): London stock and red brick terraces, white render, pale-brick flats, grey retail sheds,
     the station's Portland stone, the church's ragstone; slate roofs on houses, flat grey ones on the rest. */
  kinds: { house: [[0.72, 0.6, 0.42], [0.6, 0.33, 0.25], [0.86, 0.84, 0.8], [0.66, 0.52, 0.38], [0.55, 0.3, 0.24]],
    flat: [[0.78, 0.72, 0.6], [0.7, 0.7, 0.7], [0.62, 0.42, 0.32]], shop: [[0.62, 0.64, 0.66], [0.78, 0.78, 0.76], [0.5, 0.52, 0.56]],
    ind: [[0.56, 0.58, 0.6], [0.66, 0.62, 0.55]], station: [[0.86, 0.83, 0.73]], church: [[0.56, 0.54, 0.5]] },
  slate: [0.3, 0.32, 0.36], flatroof: [0.48, 0.48, 0.47],
  areas: { res: [0.45, 0.52, 0.38], ind: [0.5, 0.49, 0.47], retail: [0.56, 0.55, 0.53], lot: [0.4, 0.4, 0.41],
    park: [0.33, 0.58, 0.27], wood: [0.2, 0.4, 0.2], pitch: [0.4, 0.66, 0.32], water: [0.25, 0.45, 0.62] },
  /* The ground's layers, bottom to top (511): one road surface, pavement and kerb where OSM has a footway, white markings. */
  surf: { res: [0.45, 0.52, 0.38], ind: [0.5, 0.49, 0.47], retail: [0.56, 0.55, 0.53], lot: [0.4, 0.4, 0.41], park: [0.33, 0.58, 0.27],
    wood: [0.2, 0.4, 0.2], pitch: [0.4, 0.66, 0.32], water: [0.25, 0.45, 0.62], rail: [0.45, 0.41, 0.37], rails: [0.62, 0.62, 0.64],
    pave: [0.62, 0.61, 0.58], kerb: [0.78, 0.77, 0.74], road: [0.27, 0.27, 0.29], mark: [0.92, 0.92, 0.88] },
  roundel: [0.86, 0.1, 0.12], bar: [0.0, 0.1, 0.53], sign: [0.95, 0.95, 0.92],
  car: [0.85, 0.66, 0.16], glass: [0.12, 0.14, 0.18], tyre: [0.08, 0.08, 0.08], gate: [0.95, 0.74, 0.2],
};
const RACE_SUN = (() => { const v = [0.45, 0.8, 0.35], l = Math.hypot(v[0], v[1], v[2]); return v.map(x => x / l); })();

const RACE = {
  map: null, world: null, built: null, asking: null, err: '', building: null,
  gl: null, running: false, raf: 0, last: 0, acc: 0, hudAt: 0,
  keys: {}, touch: {},
  car: { x: 0, y: 0, th: 0, v: 0, h: 0, pitch: 0, steer: 0 },
  cam: null,
  lap: { next: 1, start: 0, paused: 0, best: 0, last: 0, laps: 0 },
};

/* ---------- THE MAP, ASKED FOR ONCE ---------- */
function raceFetch_() {
  if (RACE.map || RACE.asking) return RACE.asking;
  RACE.err = '';
  RACE.asking = fetch(API + '?race=1', { cache: 'no-store' })
    .then(r => r.json())
    .then(d => {
      RACE.built = !!(d && d.built && d.race);
      /* A BACKEND MAP WITHOUT PARKS AND LANDMARKS loses to the shipped Colliers Wood that has them (500). */
      if (RACE.built && Array.isArray(d.race.areas)) { raceAdopt_(d.race); return; }
      if (RACE.built) return raceShipped_().then(() => { if (!RACE.map || RACE.map.practice || !RACE.map.areas) raceAdopt_(d.race); }, () => raceAdopt_(d.race));
      if (d && d.error) RACE.err = String(d.error);
      return raceShipped_();
    }, err => { RACE.err = 'The map could not be loaded — ' + why_(err); return raceShipped_(); })
    .catch(err => { RACE.err = RACE.err || 'The map could not be loaded — ' + why_(err); })
    .then(() => { RACE.asking = null; racePaint_(); });
  return RACE.asking;
}

/* NOTHING BUILT IS NEVER AN EMPTY CARD (464): the repository's map — practice streets, or Colliers Wood once tools/race_map.py has run. */
function raceShipped_() {
  return fetch(RACE_SHIPPED + deployStamp_(), { cache: 'no-cache' }).then(r => r.json()).then(m => {
    if (m && Array.isArray(m.pts) && m.pts.length && Array.isArray(m.roads) && m.roads.length) raceAdopt_(m);
  });
}
const RACE_SHIPPED = 'data/race-map.json';


function raceAdopt_(map) {
  RACE.map = map;
  RACE.world = raceWorld_(map);
  raceReset_();
  /* A NEW WORLD IS A NEW CANVAS: `raceGl_` lets the old context go and uploads this world's mesh. */
  const box = $('race-box');
  if (box) box.dataset.view = '';
}

/* ---------- THE WORLD: POINTS, ROADS, GROUND, BUILDINGS, THE LOOP ---------- */
function raceWorld_(map) {
  const P = (map.pts || []).length / 3 | 0;
  const px = new Float64Array(P), py = new Float64Array(P), ph = new Float64Array(P);
  for (let i = 0; i < P; i++) { px[i] = map.pts[3 * i] / 10; py[i] = map.pts[3 * i + 1] / 10; ph[i] = map.pts[3 * i + 2] / 10; }
  const roads = (map.roads || []).map(r => ({ name: String(r[0] || ''), kind: String(r[1] || ''), w: Math.max(3, (r[2] || 60) / 10),
    lanes: r[3] || 0, one: !!r[4], idx: (r[5] || []).filter(i => i >= 0 && i < P) })).filter(r => r.idx.length > 1);
  const g = map.grid || { x0: 0, y0: 0, cell: 40, nx: 1, ny: 1, h: [0] };
  const G = { x0: g.x0 / 10, y0: g.y0 / 10, cell: g.cell || 40, nx: g.nx || 1, ny: g.ny || 1, h: (g.h || [0]).map(v => v / 10) };
  const W = { px, py, ph, P, roads, G, segs: [], hash: new Map(), bhash: new Map(), bld: [], water: [], areas: [], marks: [] };

  /* THE GROUND between the grid's points, bilinear; outside the grid it holds the edge. */
  W.ground = (x, y) => {
    const fx = Math.min(Math.max((x - G.x0) / G.cell, 0), G.nx - 1.0001), fy = Math.min(Math.max((y - G.y0) / G.cell, 0), G.ny - 1.0001);
    const i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j, i1 = Math.min(i + 1, G.nx - 1), j1 = Math.min(j + 1, G.ny - 1), H = G.h;
    return (H[j * G.nx + i] || 0) * (1 - u) * (1 - v) + (H[j * G.nx + i1] || 0) * u * (1 - v) + (H[j1 * G.nx + i] || 0) * (1 - u) * v + (H[j1 * G.nx + i1] || 0) * u * v;
  };
  W.half = [Math.max(G.nx - 1, 1) * G.cell / 2, Math.max(G.ny - 1, 1) * G.cell / 2];
  W.mid = [G.x0 + W.half[0], G.y0 + W.half[1]];

  /* EVERY SEGMENT IN A 25 m HASH, so "which road am I on" asks a handful, not thousands. */
  const C = 25, cellOf = (x, y) => Math.floor(x / C) + ':' + Math.floor(y / C);
  roads.forEach((r, ri) => {
    for (let k = 0; k + 1 < r.idx.length; k++) {
      const a = r.idx[k], b = r.idx[k + 1], s = W.segs.length;
      W.segs.push([a, b, ri]);
      const pad = r.w / 2 + 6;
      for (let cx = Math.floor((Math.min(px[a], px[b]) - pad) / C); cx <= Math.floor((Math.max(px[a], px[b]) + pad) / C); cx++) {
        for (let cy = Math.floor((Math.min(py[a], py[b]) - pad) / C); cy <= Math.floor((Math.max(py[a], py[b]) + pad) / C); cy++) {
          const key = cx + ':' + cy;
          if (!W.hash.has(key)) W.hash.set(key, []);
          W.hash.get(key).push(s);
        }
      }
    }
  });
  /* THE NEAREST ROAD: distance from its centre line, its height there, and which road. */
  W.roadAt = (x, y) => {
    const list = W.hash.get(cellOf(x, y));
    if (!list) return null;
    let best = null;
    for (const s of list) {
      const [a, b, ri] = W.segs[s];
      const dx = px[b] - px[a], dy = py[b] - py[a], l2 = dx * dx + dy * dy || 1;
      const t = Math.min(1, Math.max(0, ((x - px[a]) * dx + (y - py[a]) * dy) / l2));
      const d = Math.hypot(x - px[a] - dx * t, y - py[a] - dy * t);
      if (!best || d - roads[ri].w / 2 < best.d - roads[best.ri].w / 2) best = { d, ri, h: ph[a] + (ph[b] - ph[a]) * t, road: roads[ri] };
    }
    return best;
  };
  /* THE SURFACE UNDER A WHEEL: the road's own height on it, the ground away from it, and a blend across the verge. */
  W.heightAt = (x, y) => {
    const r = W.roadAt(x, y), gh = W.ground(x, y);
    if (!r) return gh;
    const edge = r.road.w / 2 + 1.5, out = edge + 5;
    if (r.d <= edge) return r.h;
    if (r.d >= out) return gh;
    const f = (r.d - edge) / (out - edge);
    return r.h * (1 - f) + gh * f;
  };

  (map.water || []).forEach(wt => {
    const c = wt[2] || [], line = [];
    for (let i = 0; i + 1 < c.length; i += 2) line.push([c[i] / 10, c[i + 1] / 10]);
    if (line.length > 1) W.water.push({ name: String(wt[0] || ''), w: (wt[1] || 80) / 10, line });
  });
  /* PARKS, WOODS, PONDS, CAR PARKS, RETAIL AND HOMES as flat fills on the ground, bottom to top as the file orders them (500). */
  (map.areas || []).forEach(a => {
    const c = a[1] || [], ring = [];
    for (let i = 0; i + 1 < c.length; i += 2) ring.push([c[i] / 10, c[i + 1] / 10]);
    if (ring.length >= 3 && RACE_COL.areas[a[0]]) W.areas.push({ kind: String(a[0]), ring });
  });
  /* THE LANDMARKS a local would name: a post where each stands, its name on the HUD when near (500). */
  (map.marks || []).forEach(m => W.marks.push({ name: String(m[0] || ''), kind: String(m[1] || ''), x: (m[2] || 0) / 10, y: (m[3] || 0) / 10 }));
  /* A BUILDING: its OSM outline, eaves height and roof (shape, ridge, planes as triangles) and its colours (511). An old row is [h, ring, kind]. */
  const hex = (s, or) => (/^[0-9a-f]{6}$/i.test(s || '') ? [0, 2, 4].map(k => parseInt(s.slice(k, k + 2), 16) / 255) : or);
  (map.bld || []).forEach((b, bi) => {
    const c = b[1] || [], ring = [];
    for (let i = 0; i + 1 < c.length; i += 2) ring.push([c[i] / 10, c[i + 1] / 10]);
    if (ring.length < 3) return;
    const xs = ring.map(p => p[0]), ys = ring.map(p => p[1]);
    const box = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
    const grounds = ring.map(p => W.ground(p[0], p[1]));
    const kind = RACE_COL.kinds[b[2]] ? b[2] : 'house', pal = RACE_COL.kinds[kind];
    const ex = b[4] || [], extra = [];
    for (let i = 0; i + 1 < ex.length; i += 2) extra.push([ex[i] / 10, ex[i + 1] / 10]);
    const rf = Array.isArray(b[3]) ? b[3] : null;
    const o = { h: Math.max(2.2, (b[0] || 75) / 10), kind, ring, box, base: Math.min(...grounds) - 1, top: Math.max(...grounds), i: bi,
      roof: rf ? { shape: rf[0] | 0, h: (rf[1] || 0) / 10, ox: (rf[2] || 0) / 10, oy: (rf[3] || 0) / 10, ux: (rf[4] || 1000) / 1000, uy: (rf[5] || 0) / 1000,
        hw: Math.max(0.1, (rf[6] || 1) / 10), hl: Math.max(0.1, (rf[7] || 1) / 10) } : null,
      extra, tris: Array.isArray(b[5]) ? b[5] : null, wall: hex(b[6], pal[bi % pal.length]),
      roofCol: hex(b[7], kind === 'house' ? RACE_COL.slate : RACE_COL.flatroof), minh: (b[8] || 0) / 10 };
    W.bld.push(o);
    for (let cx = Math.floor(box[0] / C); cx <= Math.floor(box[2] / C); cx++) {
      for (let cy = Math.floor(box[1] / C); cy <= Math.floor(box[3] / C); cy++) {
        const key = cx + ':' + cy;
        if (!W.bhash.has(key)) W.bhash.set(key, []);
        W.bhash.get(key).push(o);
      }
    }
  });
  /* THE FLAT LAYERS tools/race_map.py triangulated once: parks, water, pavement, kerb, ONE road surface, markings (511). */
  W.surf = (Array.isArray(map.surf) ? map.surf : []).filter(L => Array.isArray(L) && RACE_COL.surf[L[0]] && Array.isArray(L[1]) && Array.isArray(L[2]));
  /* INSIDE A BUILDING: an even-odd ray cast against the few in the car's cell. */
  W.inBuilding = (x, y) => {
    const list = W.bhash.get(cellOf(x, y));
    if (!list) return false;
    return list.some(o => {
      if (x < o.box[0] || x > o.box[2] || y < o.box[1] || y > o.box[3]) return false;
      let inside = false;
      for (let i = 0, j = o.ring.length - 1; i < o.ring.length; j = i++) {
        const a = o.ring[i], b = o.ring[j];
        if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
      }
      return inside;
    });
  };

  W.route = raceRoute_(W);
  W.gates = raceGates_(W);
  W.mesh = raceMesh_(W);
  return W;
}

/* ---------- THE LOOP: SHORTEST PATHS BETWEEN THE WAYPOINTS, AVOIDING ROAD ALREADY DRIVEN ---------- */
function raceRoute_(W) {
  const { px, py, P, roads } = W;
  const adj = Array.from({ length: P }, () => []);
  roads.forEach(r => {
    for (let k = 0; k + 1 < r.idx.length; k++) {
      const a = r.idx[k], b = r.idx[k + 1], d = Math.hypot(px[b] - px[a], py[b] - py[a]);
      adj[a].push([b, d]); adj[b].push([a, d]);
    }
  });
  const used = new Set(), ek = (a, b) => a < b ? a + '-' + b : b + '-' + a;
  const path = (from, to) => {
    const dist = new Float64Array(P).fill(Infinity), prev = new Int32Array(P).fill(-1), heap = [];
    /* A BINARY HEAP: a real map has thousands of points, and a linear scan per pop is their square. */
    const push = q => {
      heap.push(q);
      for (let i = heap.length - 1; i > 0;) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; }
    };
    const pop = () => {
      const top = heap[0], last = heap.pop();
      if (heap.length) {
        heap[0] = last;
        for (let i = 0; ;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
          if (r < heap.length && heap[r][0] < heap[m][0]) m = r;
          if (m === i) break;
          [heap[m], heap[i]] = [heap[i], heap[m]]; i = m;
        }
      }
      return top;
    };
    dist[from] = 0; push([0, from]);
    while (heap.length) {
      const [d, a] = pop();
      if (d > dist[a]) continue;
      if (a === to) break;
      for (const [b, l] of adj[a]) {
        const nd = d + l * (used.has(ek(a, b)) ? 5 : 1);
        if (nd < dist[b]) { dist[b] = nd; prev[b] = a; push([nd, b]); }
      }
    }
    if (from !== to && prev[to] < 0) return null;
    const out = [to];
    while (out[0] !== from) out.unshift(prev[out[0]]);
    return out;
  };
  const near = (x, y, ok) => {
    let best = -1, bd = Infinity;
    for (let i = 0; i < P; i++) { if (ok && !ok[i]) continue; const d = Math.hypot(px[i] - x, py[i] - y); if (d < bd) { bd = d; best = i; } }
    return best;
  };
  const key = s => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  let way = [];
  RACE_ROUTE.forEach(name => {
    const mine = roads.filter(r => key(r.name) === key(name));
    if (!mine.length) return;
    const on = new Uint8Array(P);
    let sx = 0, sy = 0, n = 0;
    mine.forEach(r => r.idx.forEach(i => { on[i] = 1; sx += px[i]; sy += py[i]; n++; }));
    way.push(near(sx / n, sy / n, on));
  });
  if (way.length < 3) {
    const major = new Uint8Array(P);
    let any = false;
    roads.forEach(r => { if (/^(trunk|primary|secondary|tertiary)$/.test(r.kind)) r.idx.forEach(i => { major[i] = 1; any = true; }); });
    way = [45, 135, 225, 315].map(a => near(W.mid[0] + Math.sin(a * Math.PI / 180) * W.half[0] * 0.45,
                                            W.mid[1] + Math.cos(a * Math.PI / 180) * W.half[1] * 0.45, any ? major : null));
  }
  way = way.filter((v, i, a) => v >= 0 && a.indexOf(v) === i);
  /* ROUND THEIR CENTRE, so the loop goes round rather than back and forth. */
  const cx = way.reduce((s, i) => s + px[i], 0) / (way.length || 1), cy = way.reduce((s, i) => s + py[i], 0) / (way.length || 1);
  way.sort((a, b) => Math.atan2(px[a] - cx, py[a] - cy) - Math.atan2(px[b] - cx, py[b] - cy));
  let route = [];
  for (let k = 0; k < way.length; k++) {
    const leg = path(way[k], way[(k + 1) % way.length]);
    if (!leg) continue;
    for (let i = 0; i + 1 < leg.length; i++) used.add(ek(leg[i], leg[i + 1]));
    route = route.concat(route.length ? leg.slice(1) : leg);
  }
  if (route.length < 2 && roads.length) route = roads.slice().sort((a, b) => b.idx.length - a.idx.length)[0].idx.slice();
  return route;
}

/* THE CHECKPOINTS: one every RACE_GATE_M along the loop, each facing the way the loop goes there; gate 0 is the start. */
function raceGates_(W) {
  const r = W.route, out = [];
  if (r.length < 2) return out;
  let run = RACE_GATE_M;
  for (let k = 0; k + 1 < r.length; k++) {
    const a = r[k], b = r[k + 1];
    const seg = Math.hypot(W.px[b] - W.px[a], W.py[b] - W.py[a]);
    if (run >= RACE_GATE_M || k === 0) {
      const hit = W.roadAt(W.px[a], W.py[a]);
      out.push({ x: W.px[a], y: W.py[a], th: Math.atan2(W.px[b] - W.px[a], W.py[b] - W.py[a]), w: hit ? hit.road.w : 7, pt: a });
      run = 0;
    }
    run += seg;
  }
  /* A last gate too near the start is the start itself. */
  if (out.length > 2 && Math.hypot(out[out.length - 1].x - out[0].x, out[out.length - 1].y - out[0].y) < RACE_GATE_M / 2) out.pop();
  return out;
}

/* ---------- THE MESH, LIT ON THE CPU: x, h, -y and a colour per vertex, in 200 m tiles so what is past the fog is not drawn ---------- */
const RACE_TILE = 200;            // metres a side of one drawing tile
const RACE_LIFT = 0.12;           // the flat layers ride this far over the ground's own triangles
function raceMesh_(W) {
  /* ONE GROWING Float32Array PER LAYER AND TILE, written in place: an array per vertex froze the phone. */
  const buckets = new Map();
  let cur = null, layer = '', big = false;
  let last = null;
  const bucket = (x, y) => {
    const tx = big ? 0 : Math.floor(x / RACE_TILE), ty = big ? 0 : Math.floor(-y / RACE_TILE);
    if (last && last.layer === layer && last.big === big && last.tx === tx && last.ty === ty) return last;
    const key = layer + '|' + (big ? 'all' : tx + ':' + ty);
    let b = buckets.get(key);
    if (!b) { b = { layer, big, tx, ty, v: new Float32Array(4096), at: 0 }; buckets.set(key, b); }
    return (last = b);
  };
  /* A point is given as [x east, y north, h]; GL wants [x, h, -y]. The light is worked out here, once, with the normal facing up. */
  const tri = (a, b, c, col, n) => {
    let nx, ny, nz;
    if (n) { nx = n[0]; ny = n[1]; nz = n[2]; }
    else {
      const ux = b[0] - a[0], uy = b[2] - a[2], uz = a[1] - b[1], wx = c[0] - a[0], wy = c[2] - a[2], wz = a[1] - c[1];
      nx = uy * wz - uz * wy; ny = uz * wx - ux * wz; nz = ux * wy - uy * wx;
      const l = (ny < 0 ? -1 : 1) * (Math.hypot(nx, ny, nz) || 1);
      nx /= l; ny /= l; nz /= l;
    }
    const k = 0.55 + 0.45 * Math.max(0, nx * RACE_SUN[0] + ny * RACE_SUN[1] + nz * RACE_SUN[2]);
    const r = col[0] * k, g = col[1] * k, bl = col[2] * k;
    const B = cur || bucket((a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3);
    if (B.at + 18 > B.v.length) { const nv = new Float32Array(B.v.length * 2); nv.set(B.v); B.v = nv; }
    const v = B.v;
    v[B.at++] = a[0]; v[B.at++] = a[2]; v[B.at++] = -a[1]; v[B.at++] = r; v[B.at++] = g; v[B.at++] = bl;
    v[B.at++] = b[0]; v[B.at++] = b[2]; v[B.at++] = -b[1]; v[B.at++] = r; v[B.at++] = g; v[B.at++] = bl;
    v[B.at++] = c[0]; v[B.at++] = c[2]; v[B.at++] = -c[1]; v[B.at++] = r; v[B.at++] = g; v[B.at++] = bl;
  };
  const quad = (a, b, c, d, col, n) => { tri(a, b, c, col, n); tri(a, c, d, col, n); };
  const order = [];
  const mark = (name, fn) => { layer = name; if (order.indexOf(name) < 0) order.push(name); fn(); cur = null; big = false; };
  /* One thing in one tile: a building's walls and roof stay together however its corners fall. */
  const whole = (x, y, fn) => { cur = bucket(x, y); fn(); cur = null; };

  mark('ground', () => {
    const G = W.G;
    for (let j = 0; j + 1 < G.ny; j++) for (let i = 0; i + 1 < G.nx; i++) {
      const p = (a, b) => [G.x0 + a * G.cell, G.y0 + b * G.cell, G.h[b * G.nx + a]];
      const shade = 0.94 + 0.06 * ((i * 7 + j * 13) % 5) / 4;
      const col = RACE_COL.grass.map(c => c * shade);
      quad(p(i, j), p(i + 1, j), p(i + 1, j + 1), p(i, j + 1), col);
    }
  });
  /* A STRIP along a polyline: half-width `hw`, height from `hOf`, mitred at each joint (a backend-built map has no surface). */
  const strip = (line, hw, hOf, col) => {
    const n = line.length, L = [], R = [];
    for (let k = 0; k < n; k++) {
      const a = line[Math.max(0, k - 1)], b = line[Math.min(n - 1, k + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const h = hOf(k);
      L.push([line[k][0] - dy * hw, line[k][1] + dx * hw, h]);
      R.push([line[k][0] + dy * hw, line[k][1] - dx * hw, h]);
    }
    for (let k = 0; k + 1 < n; k++) quad(L[k], R[k], R[k + 1], L[k + 1], col, [0, 1, 0]);
  };
  const up = [0, 1, 0];
  if (W.surf.length) {
    W.surf.forEach(L => mark(L[0], () => {
      const v = L[1], t = L[2], col = RACE_COL.surf[L[0]], P = [];
      for (let i = 0; i + 1 < v.length; i += 2) P.push([v[i] / 10, v[i + 1] / 10, W.ground(v[i] / 10, v[i + 1] / 10) + RACE_LIFT]);
      for (let k = 0; k + 2 < t.length; k += 3) {
        const a = P[t[k]], b = P[t[k + 1]], c = P[t[k + 2]];
        if (!a || !b || !c) continue;
        big = Math.max(Math.abs(a[0] - b[0]), Math.abs(a[0] - c[0]), Math.abs(a[1] - b[1]), Math.abs(a[1] - c[1])) > RACE_TILE / 2;
        tri(a, b, c, col, up);
      }
    }));
  } else {
    mark('area', () => W.areas.forEach(a => {
      const ring = raceCcw_(a.ring), col = RACE_COL.areas[a.kind];
      const P = ring.map(p => [p[0], p[1], W.ground(p[0], p[1]) + RACE_LIFT]);
      big = true;
      raceEar_(ring).forEach(t => tri(P[t[0]], P[t[1]], P[t[2]], col, up));
    }));
    mark('water', () => W.water.forEach(wt => strip(wt.line, wt.w / 2, k => W.ground(wt.line[k][0], wt.line[k][1]) + RACE_LIFT, RACE_COL.water)));
    mark('road', () => W.roads.forEach(r => strip(r.idx.map(i => [W.px[i], W.py[i]]), r.w / 2, k => W.ph[r.idx[k]] + RACE_LIFT, RACE_COL.road)));
  }
  /* THE ROOF OVER A POINT: eaves plus the slope times the distance in from the nearest eave line, as the shape says. */
  const roofZ = (o, top, x, y) => {
    const R = o.roof;
    if (!R || !R.shape) return top;
    const dx = x - R.ox, dy = y - R.oy, u = dx * R.ux + dy * R.uy, v = -dx * R.uy + dy * R.ux, s = R.h / R.hw;
    if (R.shape === 1) return top + s * Math.max(0, R.hw - Math.abs(v));
    if (R.shape === 2) return top + s * Math.max(0, Math.min(R.hw - Math.abs(v), R.hl - Math.abs(u)));
    return top + R.h * Math.min(1, Math.max(0, (R.hw - v) / (2 * R.hw)));
  };
  mark('bld', () => W.bld.forEach(o => whole((o.box[0] + o.box[2]) / 2, (o.box[1] + o.box[3]) / 2, () => {
    const top = o.top + o.h, base = o.minh ? o.top + o.minh : o.base, col = o.wall;
    if (o.tris) {
      /* THE RING IS COUNTER-CLOCKWISE (the builder's), its roof's cut points already in it: each wall's top follows the roof. */
      const all = o.ring.concat(o.extra), Z = all.map(p => roofZ(o, top, p[0], p[1]));
      for (let i = 0; i < o.ring.length; i++) {
        const j = (i + 1) % o.ring.length, a = o.ring[i], b = o.ring[j];
        const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, n = [dy / l, 0, dx / l];
        quad([a[0], a[1], base], [b[0], b[1], base], [b[0], b[1], Z[j]], [a[0], a[1], Z[i]], col, n);
      }
      for (let k = 0; k + 2 < o.tris.length; k += 3) {
        const i0 = o.tris[k], i1 = o.tris[k + 1], i2 = o.tris[k + 2], A = all[i0], B = all[i1], Cc = all[i2];
        if (A && B && Cc) tri([A[0], A[1], Z[i0]], [B[0], B[1], Z[i1]], [Cc[0], Cc[1], Z[i2]], o.roofCol);
      }
      return;
    }
    const ring = raceCcw_(o.ring);
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
      quad([a[0], a[1], base], [b[0], b[1], base], [b[0], b[1], top], [a[0], a[1], top], col, [dy / l, 0, dx / l]);
    }
    raceEar_(ring).forEach(t => tri([ring[t[0]][0], ring[t[0]][1], top], [ring[t[1]][0], ring[t[1]][1], top], [ring[t[2]][0], ring[t[2]][1], top], o.roofCol, up));
  })));
  /* A POST AT EACH LANDMARK: the station's red roundel and blue bar; a white sign for the rest. */
  const cube = (x0, y0, z0, x1, y1, z1, col) => {
    const c = (x, y, z) => [x, y, z];
    quad(c(x0, y0, z1), c(x1, y0, z1), c(x1, y1, z1), c(x0, y1, z1), col, [0, 1, 0]);
    quad(c(x0, y0, z0), c(x1, y0, z0), c(x1, y0, z1), c(x0, y0, z1), col, [0, 0, 1]);
    quad(c(x1, y1, z0), c(x0, y1, z0), c(x0, y1, z1), c(x1, y1, z1), col, [0, 0, -1]);
    quad(c(x0, y1, z0), c(x0, y0, z0), c(x0, y0, z1), c(x0, y1, z1), col, [-1, 0, 0]);
    quad(c(x1, y0, z0), c(x1, y1, z0), c(x1, y1, z1), c(x1, y0, z1), col, [1, 0, 0]);
  };
  mark('marks', () => W.marks.forEach(m => whole(m.x, m.y, () => {
    const g = W.ground(m.x, m.y), x = m.x, y = m.y;
    cube(x - 0.15, y - 0.15, g, x + 0.15, y + 0.15, g + 6, RACE_COL.kerb);
    if (m.kind === 'tube') {
      cube(x - 1.4, y - 0.12, g + 6, x + 1.4, y + 0.12, g + 8.8, RACE_COL.roundel);
      cube(x - 1.9, y - 0.2, g + 7.05, x + 1.9, y + 0.2, g + 7.75, RACE_COL.bar);
    } else {
      cube(x - 2, y - 0.1, g + 6, x + 2, y + 0.1, g + 7.4, m.kind === 'park' ? RACE_COL.areas.park : RACE_COL.sign);
    }
  })));
  /* ONE BUFFER: each layer's tiles end to end, the layers in drawing order. `ranges` is a layer's whole span; `tiles` its pieces. */
  let n = 0;
  buckets.forEach(b => { n += b.at; });
  const data = new Float32Array(n), ranges = {}, tiles = {};
  let at = 0;
  order.forEach(name => {
    const s = at / 6;
    tiles[name] = [];
    buckets.forEach(b => {
      if (b.layer !== name || !b.at) return;
      data.set(b.v.subarray(0, b.at), at);
      tiles[name].push({ big: b.big, x: (b.tx + 0.5) * RACE_TILE, y: (b.ty + 0.5) * RACE_TILE, first: at / 6, count: b.at / 6 });
      at += b.at;
    });
    ranges[name] = [s, at / 6 - s];
  });
  return { data, ranges, tiles, order };
}

/* Counter-clockwise, seen from above (x east, y north). */
function raceCcw_(ring) {
  let a = 0;
  for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; a += p[0] * q[1] - q[0] * p[1]; }
  return a < 0 ? ring.slice().reverse() : ring;
}

/* EAR CLIPPING for a roof: an L-shaped house has a corner a fan would draw across. Triangles as index triples. */
function raceEar_(ring) {
  const idx = ring.map((_, i) => i), out = [];
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  let guard = ring.length * ring.length;
  while (idx.length > 3 && guard-- > 0) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
      const a = ring[i0], b = ring[i1], c = ring[i2];
      if (cross(a, b, c) <= 0) continue;
      const inside = idx.some(j => j !== i0 && j !== i1 && j !== i2 && cross(a, b, ring[j]) >= 0 && cross(b, c, ring[j]) >= 0 && cross(c, a, ring[j]) >= 0);
      if (inside) continue;
      out.push([i0, i1, i2]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push(idx.slice());
  else for (let k = 1; k + 1 < idx.length; k++) out.push([idx[0], idx[k], idx[k + 1]]);
  return out;
}

/* ---------- THE CAR ---------- */
function raceReset_() {
  const W = RACE.world, c = RACE.car;
  const g = W && W.gates[0];
  c.x = g ? g.x : 0; c.y = g ? g.y : 0; c.th = g ? g.th : 0; c.v = 0; c.steer = 0;
  c.h = W ? W.heightAt(c.x, c.y) : 0; c.pitch = 0;
  RACE.cam = null; RACE.prev = null;
  RACE.lap = { next: 1, start: 0, paused: 0, best: raceBest_(), last: 0, laps: 0 };
}

function raceBest_() {
  try { return Number(localStorage.getItem('race-best')) || 0; } catch (e) { return 0; }
}

/* ONE STEP OF dt SECONDS. Throttle, brakes, rolling and air drag, and the slope: g times the grade along the car is felt
   as speed lost uphill and gained down. */
function raceStep_(dt) {
  const W = RACE.world, c = RACE.car;
  if (!W) return;
  const k = RACE.keys, t = RACE.touch;
  const go = !!(k.up || t.go), back = !!(k.down), brake = !!(k.brake || t.brake);
  const want = (k.right || t.right ? 1 : 0) - (k.left || t.left ? 1 : 0);
  c.steer += Math.max(-dt * 4, Math.min(dt * 4, want - c.steer));
  const fx = Math.sin(c.th), fy = Math.cos(c.th);
  const ahead = W.heightAt(c.x + fx * 1.5, c.y + fy * 1.5), behind = W.heightAt(c.x - fx * 1.5, c.y - fy * 1.5);
  const grade = (ahead - behind) / 3;
  const road = W.roadAt(c.x, c.y);
  const onRoad = !!road && road.d <= road.road.w / 2 + 0.5;
  let a = -RACE_G * grade / Math.sqrt(1 + grade * grade);
  if (go) a += c.v < -0.3 ? 8 : 3.6 * Math.max(0, 1 - c.v / 42);
  if (back) a += c.v > 0.3 ? -8 : (c.v > -7 ? -2.5 : 0);
  const roll = (onRoad ? 0.12 : 1.6) + (onRoad ? 0.0009 : 0.004) * c.v * c.v;
  const stop = (brake ? 11 : 0) + roll;
  const v0 = c.v + a * dt;
  /* Brakes and rolling oppose the motion and stop it; they never push it backwards. */
  c.v = Math.abs(v0) <= stop * dt && !go && !back ? (Math.abs(a) > stop ? v0 - Math.sign(v0) * stop * dt : 0) : v0 - Math.sign(v0) * stop * dt;
  const turn = 0.55 / (1 + Math.abs(c.v) / 14);
  c.th += c.v / 2.6 * Math.tan(c.steer * turn) * dt;
  const nx = c.x + Math.sin(c.th) * c.v * dt, ny = c.y + Math.cos(c.th) * c.v * dt;
  const out = Math.abs(nx - W.mid[0]) > W.half[0] || Math.abs(ny - W.mid[1]) > W.half[1];
  if (out || W.inBuilding(nx, ny)) c.v *= -0.25;
  else { c.x = nx; c.y = ny; }
  c.h = W.heightAt(c.x, c.y);
  c.pitch = Math.atan(grade);
  raceGateCheck_();
}

/* THE CAR AS SEEN: between the last two physics steps by how far into the next one the clock is, so a 50, 75 or 120 Hz screen
   never shows the same place twice and then a jump (511). */
function raceSeen_() {
  const c = RACE.car, p = RACE.prev;
  if (!p || !RACE.running) return c;
  const f = Math.min(1, Math.max(0, RACE.acc / RACE_DT)), mix = (a, b) => a + (b - a) * f;
  let d = c.th - p.th;
  d -= Math.round(d / (2 * Math.PI)) * 2 * Math.PI;
  return { x: mix(p.x, c.x), y: mix(p.y, c.y), h: mix(p.h, c.h), th: p.th + d * f, pitch: mix(p.pitch, c.pitch), v: c.v };
}

function raceGateCheck_() {
  const W = RACE.world, c = RACE.car, L = RACE.lap;
  if (!W || W.gates.length < 2) return;
  const now = raceNow_();
  if (!L.start && Math.abs(c.v) > 0.5) L.start = now;
  const g = W.gates[L.next % W.gates.length];
  if (Math.hypot(c.x - g.x, c.y - g.y) > Math.max(9, g.w / 2 + 4)) return;
  if (L.next % W.gates.length === 0) {
    L.last = now - L.start; L.laps++; L.start = now;
    if (!L.best || L.last < L.best) { L.best = L.last; try { localStorage.setItem('race-best', String(Math.round(L.best))); } catch (e) {} }
    L.next = 1;
  } else L.next++;
}

const raceNow_ = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());

/* ---------- THE RENDERER: one shader, lit vertices, fog ---------- */
function raceGl_(canvas) {
  if (RACE.gl && RACE.gl.canvas === canvas && !RACE.gl.ctx.isContextLost()) return RACE.gl;
  /* LOST (iPad Safari drops a context under memory pressure): nothing is drawn until `webglcontextrestored`. */
  if (RACE.gl && RACE.gl.canvas === canvas) return null;
  /* ASKED ONCE PER CANVAS: a browser without WebGL says so on the card, not sixty times a second. */
  if (RACE.noGl === canvas) return null;
  /* A REPAINT MADE A NEW CANVAS: the old one's context is let go now, not whenever the collector gets to it (browsers cap them). */
  try { const lose = RACE.gl && RACE.gl.ctx.getExtension('WEBGL_lose_context'); if (lose && RACE.gl.canvas !== canvas) lose.loseContext(); } catch (e) {}
  RACE.gl = null;
  let ctx = null;
  try { ctx = canvas.getContext('webgl', { antialias: true, alpha: false }) || canvas.getContext('experimental-webgl'); } catch (e) { ctx = null; }
  if (!ctx || !ctx.createShader) {
    RACE.noGl = canvas;
    const stage = canvas.closest('.race-stage');
    if (stage && !stage.querySelector('.race-nogl')) stage.insertAdjacentHTML('beforeend', '<p class="note race-nogl">This browser cannot draw in 3D.</p>');
    return null;
  }
  const sh = (type, src) => { const s = ctx.createShader(type); ctx.shaderSource(s, src); ctx.compileShader(s); return s; };
  const prog = ctx.createProgram();
  ctx.attachShader(prog, sh(ctx.VERTEX_SHADER, 'attribute vec3 aP;attribute vec3 aC;uniform mat4 uVP;uniform mat4 uM;uniform vec3 uEye;'
    + 'varying vec3 vC;varying float vF;void main(){vec4 w=uM*vec4(aP,1.0);vC=aC;'
    + 'vF=clamp((length(w.xyz-uEye)-140.0)/420.0,0.0,1.0);gl_Position=uVP*w;}'));
  ctx.attachShader(prog, sh(ctx.FRAGMENT_SHADER, 'precision mediump float;uniform vec3 uFog;varying vec3 vC;varying float vF;'
    + 'void main(){gl_FragColor=vec4(mix(vC,uFog,vF),1.0);}'));
  ctx.linkProgram(prog);
  if (!ctx.getProgramParameter(prog, ctx.LINK_STATUS)) return null;
  const buf = data => { const b = ctx.createBuffer(); ctx.bindBuffer(ctx.ARRAY_BUFFER, b); ctx.bufferData(ctx.ARRAY_BUFFER, data, ctx.STATIC_DRAW); return { b, n: data.length / 6 }; };
  const G = {
    canvas, ctx, prog,
    aP: ctx.getAttribLocation(prog, 'aP'), aC: ctx.getAttribLocation(prog, 'aC'),
    uVP: ctx.getUniformLocation(prog, 'uVP'), uM: ctx.getUniformLocation(prog, 'uM'),
    uEye: ctx.getUniformLocation(prog, 'uEye'), uFog: ctx.getUniformLocation(prog, 'uFog'),
    world: buf(RACE.world.mesh.data), car: buf(raceCarMesh_()), gate: buf(raceGateMesh_()),
  };
  ctx.enable(ctx.DEPTH_TEST);
  RACE.gl = G;
  return G;
}

/* A BOX as lit triangles in model space (x right, y up, z forward). */
function raceBox_(v, x0, y0, z0, x1, y1, z1, col) {
  const P = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  [[0, 1, 2, 3, [0, 0, -1]], [5, 4, 7, 6, [0, 0, 1]], [4, 0, 3, 7, [-1, 0, 0]], [1, 5, 6, 2, [1, 0, 0]], [3, 2, 6, 7, [0, 1, 0]], [4, 5, 1, 0, [0, -1, 0]]]
    .forEach(f => {
      const n = f[4], l = 0.55 + 0.45 * Math.max(0, n[0] * RACE_SUN[0] + n[1] * RACE_SUN[1] - n[2] * RACE_SUN[2]);
      [[f[0], f[1], f[2]], [f[0], f[2], f[3]]].forEach(t => t.forEach(i => v.push(P[i][0], P[i][1], P[i][2], col[0] * l, col[1] * l, col[2] * l)));
    });
}
function raceCarMesh_() {
  const v = [];
  raceBox_(v, -0.9, 0.3, -2.1, 0.9, 1.0, 2.1, RACE_COL.car);
  raceBox_(v, -0.75, 1.0, -1.2, 0.75, 1.5, 0.8, RACE_COL.glass);
  [[-0.95, -1.35], [0.95, -1.35], [-0.95, 1.35], [0.95, 1.35]].forEach(([x, z]) => raceBox_(v, x - 0.15, 0, z - 0.35, x + 0.15, 0.7, z + 0.35, RACE_COL.tyre));
  return new Float32Array(v);
}
/* A GATE five metres wide in model space; drawn scaled to the road it stands on. */
function raceGateMesh_() {
  const v = [];
  raceBox_(v, -2.7, 0, -0.2, -2.3, 4, 0.2, RACE_COL.gate);
  raceBox_(v, 2.3, 0, -0.2, 2.7, 4, 0.2, RACE_COL.gate);
  raceBox_(v, -2.7, 3.4, -0.15, 2.7, 4, 0.15, RACE_COL.line);
  return new Float32Array(v);
}

/* ---------- MATRICES (column-major, as GL reads them) ---------- */
function raceMul_(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
    o[c * 4 + r] = s;
  }
  return o;
}
function racePersp_(fov, asp, n, f) {
  const t = 1 / Math.tan(fov / 2);
  return new Float32Array([t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]);
}
function raceLook_(e, c, up) {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const nrm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const z = nrm(sub(e, c)), x = nrm(crs(up, z)), y = crs(z, x);
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]);
}
/* A MODEL MATRIX: heading th from north clockwise, pitch up the slope, at [x, h, -y]; `s` widens it sideways. */
function raceModel_(x, y, h, th, pitch, s) {
  const f = [Math.sin(th) * Math.cos(pitch), Math.sin(pitch), -Math.cos(th) * Math.cos(pitch)];
  const r = [Math.cos(th), 0, Math.sin(th)];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const k = s || 1;
  return new Float32Array([r[0] * k, r[1] * k, r[2] * k, 0, u[0], u[1], u[2], 0, f[0], f[1], f[2], 0, x, h, -y, 1]);
}

function raceDraw_() {
  const box = $('race-box'), canvas = box && box.querySelector('.race-gl');
  if (!canvas || !RACE.world) return;
  const G = raceGl_(canvas);
  if (G) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const ctx = G.ctx, W = RACE.world, c = raceSeen_();
    /* THE CAMERA EASES AT THE SAME RATE AT ANY FRAME RATE (511): a fixed share per frame shook on a 120 Hz screen and lagged at 30. */
    const now = raceNow_(), dt = Math.min(0.1, Math.max(0, (now - (RACE.drawAt || now)) / 1000));
    RACE.drawAt = now;
    const fx = Math.sin(c.th), fy = Math.cos(c.th);
    const want = [c.x - fx * 9, c.y - fy * 9];
    const eye = [want[0], Math.max(W.ground(want[0], want[1]) + 1.8, c.h + 3.2), -want[1]];
    const ease = 1 - Math.pow(0.82, dt * 60);
    RACE.cam = RACE.cam && dt > 0 ? RACE.cam.map((q, i) => q + (eye[i] - q) * ease) : (RACE.cam && !dt ? RACE.cam : eye);
    /* DRAWN ROUND THE CAMERA: the world is moved by the whole metres under it, so every number the GPU sees is small. */
    const O = [Math.round(RACE.cam[0]), 0, Math.round(RACE.cam[2])], rel = p => [p[0] - O[0], p[1], p[2] - O[2]];
    const look = [c.x + fx * 4, c.h + 1.2, -(c.y + fy * 4)];
    const vp = raceMul_(racePersp_(62 * Math.PI / 180, w / h, 0.8, 700), raceLook_(rel(RACE.cam), rel(look), [0, 1, 0]));
    ctx.viewport(0, 0, w, h);
    ctx.clearColor(RACE_COL.sky[0], RACE_COL.sky[1], RACE_COL.sky[2], 1);
    ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT);
    ctx.useProgram(G.prog);
    ctx.uniformMatrix4fv(G.uVP, false, vp);
    ctx.uniform3fv(G.uEye, rel(RACE.cam));
    ctx.uniform3fv(G.uFog, RACE_COL.sky);
    const draw = (b, m, first, count) => {
      ctx.bindBuffer(ctx.ARRAY_BUFFER, b.b);
      ctx.enableVertexAttribArray(G.aP); ctx.vertexAttribPointer(G.aP, 3, ctx.FLOAT, false, 24, 0);
      ctx.enableVertexAttribArray(G.aC); ctx.vertexAttribPointer(G.aC, 3, ctx.FLOAT, false, 24, 12);
      ctx.uniformMatrix4fv(G.uM, false, m);
      ctx.drawArrays(ctx.TRIANGLES, first || 0, count === undefined ? b.n : count);
    };
    const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -O[0], 0, -O[2], 1]);
    const model = (x, y, hh, th, pitch, k) => { const m = raceModel_(x, y, hh, th, pitch, k); m[12] -= O[0]; m[14] -= O[2]; return m; };
    /* ONLY THE TILES NEAR ENOUGH TO SEE: the fog is whole by 560 m, so a tile whose nearest corner is further is not drawn. */
    const T = W.mesh.tiles || {}, far = 560 + RACE_TILE * 0.75;
    let drawn = 0;
    const layer = name => (T[name] || []).forEach(t => {
      if (!t.big && Math.hypot(t.x - RACE.cam[0], t.y - RACE.cam[2]) > far) return;
      draw(G.world, I, t.first, t.count); drawn += t.count;
    });
    /* THE GROUND WRITES DEPTH; WHAT LIES FLAT ON IT DOES NOT, painted bottom to top over it, so no two layers ever fight for a pixel (511). */
    layer('ground');
    ctx.enable(ctx.POLYGON_OFFSET_FILL);
    ctx.polygonOffset(-1, -4);
    ctx.depthMask(false);
    (W.mesh.order || []).forEach(name => { if (name !== 'ground' && name !== 'bld' && name !== 'marks') layer(name); });
    ctx.depthMask(true);
    ctx.disable(ctx.POLYGON_OFFSET_FILL);
    layer('bld');
    layer('marks');
    RACE.drawn = drawn;
    const g = W.gates[RACE.lap.next % (W.gates.length || 1)];
    if (g) draw(G.gate, model(g.x, g.y, W.heightAt(g.x, g.y) + RACE_LIFT, g.th, 0, Math.max(1, (g.w + 2) / 5)));
    draw(G.car, model(c.x, c.y, c.h + RACE_LIFT, c.th, c.pitch, 1));
  }
  raceMini_(box);
}

/* THE LITTLE MAP: every road drawn once into a hidden canvas, then turned under the car each frame. */
function raceMini_(box) {
  const cv = box.querySelector('.race-mini');
  const W = RACE.world;
  if (!cv || RACE.noMini === cv) return;
  let ctx = null;
  try { ctx = cv.getContext('2d'); } catch (e) { ctx = null; }
  if (!ctx || !ctx.drawImage) { RACE.noMini = cv; return; }
  const S = 0.25, px = 96;
  if (!W.miniCanvas) {
    const off = document.createElement('canvas');
    off.width = Math.ceil(W.half[0] * 2 * S) + 2; off.height = Math.ceil(W.half[1] * 2 * S) + 2;
    const o = off.getContext('2d');
    if (!o) return;
    o.lineCap = 'round'; o.lineJoin = 'round';
    const X = x => (x - W.mid[0] + W.half[0]) * S, Y = y => (W.mid[1] + W.half[1] - y) * S;
    const line = (pts, wd, col) => { o.strokeStyle = col; o.lineWidth = wd; o.beginPath(); pts.forEach((p, k) => (k ? o.lineTo : o.moveTo).call(o, X(p[0]), Y(p[1]))); o.stroke(); };
    W.areas.forEach(a => {
      const c = RACE_COL.areas[a.kind];
      o.fillStyle = '#' + c.map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
      o.beginPath(); a.ring.forEach((p, k) => (k ? o.lineTo : o.moveTo).call(o, X(p[0]), Y(p[1]))); o.closePath(); o.fill();
    });
    W.water.forEach(wt => line(wt.line, Math.max(1.5, wt.w * S), token_('--race-water', 'blue')));
    W.roads.forEach(r => line(r.idx.map(i => [W.px[i], W.py[i]]), Math.max(1.2, r.w * S), token_('--race-road', 'grey')));
    line(W.route.map(i => [W.px[i], W.py[i]]), 2, token_('--race-route', 'gold'));
    W.miniCanvas = off;
  }
  if (cv.width !== px * 2) { cv.width = px * 2; cv.height = px * 2; }
  const c = RACE.car;
  ctx.setTransform(2, 0, 0, 2, 0, 0);
  ctx.clearRect(0, 0, px, px);
  ctx.save();
  ctx.translate(px / 2, px / 2);
  ctx.rotate(-c.th);
  ctx.drawImage(W.miniCanvas, -(c.x - W.mid[0] + W.half[0]) * S, -(W.mid[1] + W.half[1] - c.y) * S);
  ctx.restore();
  ctx.fillStyle = token_('--race-route', 'gold');
  ctx.beginPath(); ctx.moveTo(px / 2, px / 2 - 6); ctx.lineTo(px / 2 + 4, px / 2 + 4); ctx.lineTo(px / 2 - 4, px / 2 + 4); ctx.closePath(); ctx.fill();
}

/* THE NUMBERS OVER THE ROAD, ten times a second rather than sixty: text that changes every frame is a layout every frame. */
function raceHud_(force) {
  const now = raceNow_();
  if (!force && now - RACE.hudAt < 100) return;
  RACE.hudAt = now;
  const box = $('race-box');
  if (!box || !RACE.world) return;
  const c = RACE.car, W = RACE.world, L = RACE.lap;
  const r = W.roadAt(c.x, c.y);
  const fx = Math.sin(c.th), fy = Math.cos(c.th);
  const grade = (W.heightAt(c.x + fx * 4, c.y + fy * 4) - W.heightAt(c.x - fx * 4, c.y - fy * 4)) / 8 * 100;
  const set = (k, t) => { const el = box.querySelector('[data-hud="' + k + '"]'); if (el && el.textContent !== t) el.textContent = t; };
  const clock = ms => { const s = Math.max(0, ms) / 1000; return Math.floor(s / 60) + ':' + (s % 60).toFixed(1).padStart(4, '0'); };
  set('mph', Math.round(Math.abs(c.v) * 2.23694) + ' mph');
  set('road', r && r.d <= r.road.w / 2 + 3 ? (r.road.name || 'Unnamed road') : 'Off the road');
  let near = '', nd = 220;
  W.marks.forEach(m => { const d = Math.hypot(m.x - c.x, m.y - c.y); if (d < nd) { nd = d; near = m.name; } });
  set('near', near ? 'Near ' + near : '');
  set('alt', c.h.toFixed(1) + ' m · ' + (grade >= 0 ? '+' : '') + grade.toFixed(1) + '%');
  set('gate', 'Gate ' + (L.next % (W.gates.length || 1) || W.gates.length) + '/' + W.gates.length);
  set('time', clock(L.start ? (L.paused || now) - L.start : 0) + (L.best ? ' · best ' + clock(L.best) : ''));
}

/* ---------- THE LOOP ---------- */
function raceFrame_(t) {
  RACE.raf = 0;
  if (!RACE.running) return;
  const box = $('race-box');
  /* OFF THE GLASS IS PAUSED: another page of Games, another column, or a hidden tab costs nothing. */
  if (!box || !box.isConnected || document.hidden) { racePause_(); return; }
  const now = raceNow_();
  RACE.acc = Math.min(RACE.acc + (now - (RACE.last || now)) / 1000, RACE_DT * 15);
  RACE.last = now;
  while (RACE.acc >= RACE_DT) { RACE.prev = Object.assign({}, RACE.car); raceStep_(RACE_DT); RACE.acc -= RACE_DT; }
  raceDraw_();
  raceHud_();
  RACE.raf = requestAnimationFrame(raceFrame_);
}

function raceGo_() {
  if (!RACE.world || RACE.running) return;
  RACE.running = true; RACE.last = 0; RACE.acc = 0;
  /* THE LAP CLOCK STOOD STILL WHILE PAUSED. */
  if (RACE.lap.start && RACE.lap.paused) RACE.lap.start += raceNow_() - RACE.lap.paused;
  RACE.lap.paused = 0;
  raceTiles_();
  RACE.raf = requestAnimationFrame(raceFrame_);
}
function racePause_() {
  if (RACE.running) RACE.lap.paused = raceNow_();
  RACE.running = false;
  if (RACE.raf) cancelAnimationFrame(RACE.raf);
  RACE.raf = 0; RACE.keys = {}; RACE.touch = {};
  document.querySelectorAll('.race-pad.on').forEach(b => b.classList.remove('on'));
  raceTiles_();
}

/* ---------- THE CARD ---------- */
function initRacer() {
  raceFetch_();
  racePaint_();
}
/* DRAWN AHEAD (the widget's `draw`): the card's markup from what is already here — no fetch, no frame. */
function raceStill_() { racePaint_(true); }
function racerStop_() { racePause_(); }

function racePaint_(still) {
  const box = $('race-box');
  if (!box) return;
  if (!RACE.world) {
    box.dataset.view = RACE.asking ? 'wait' : 'none';
    /* NO MAP AT ALL (the backend and the shipped file both failed): the reason, said. */
    box.innerHTML = RACE.asking ? loading_()
      : `<p class="note">${esc(RACE.err || 'The map could not be loaded.')}</p>`;
    return;
  }
  if (box.dataset.view !== 'drive' || !box.querySelector('.race-gl')) {
    box.dataset.view = 'drive';
    box.innerHTML = `<div class="race-stage" data-noswipe>
        <canvas class="race-gl" role="button" tabindex="0" data-do="race-go" aria-label="The road ahead"></canvas>
        <canvas class="race-mini" aria-hidden="true"></canvas>
        <div class="race-hud" aria-live="off"><b data-hud="mph">0 mph</b><span data-hud="road"></span><span data-hud="near"></span><span data-hud="alt"></span></div>
        <div class="race-lap"><span data-hud="gate"></span><span data-hud="time"></span></div>
      </div>
      <div class="race-pads" data-noswipe>
        ${tile_({ form: true, look: 'race-pad', attrs: 'data-pad="left"', aria: 'Steer left', html: '&#9664;' })}
        ${tile_({ form: true, look: 'race-pad', attrs: 'data-pad="right"', aria: 'Steer right', html: '&#9654;' })}
        <span></span>
        ${tile_({ form: true, look: 'race-pad', attrs: 'data-pad="brake"', aria: 'Brake', label: 'Brake' })}
        ${tile_({ form: true, look: 'race-pad is-go', attrs: 'data-pad="go"', aria: 'Accelerate', label: 'Go' })}
      </div>
      <p class="race-keys">&#8593; W go · &#8595; S reverse · &#8592; &#8594; A D steer · Space brake</p>
      <div class="tile-row race-tiles"></div>
      ${raceAttr_()}`;
    racePads_(box);
    raceGlWatch_(box.querySelector('.race-gl'));
  }
  raceTiles_();
  const attr = box.querySelector('.race-attr');
  if (attr) attr.outerHTML = raceAttr_();
  raceHud_(true);
  /* ONE STILL FRAME, so the card shows the street before anybody presses Drive. */
  if (!still) requestAnimationFrame(() => { if (!RACE.running) raceDraw_(); });
}

/* WHOSE MAP: OSM's line on a real one; the practice streets say they are invented and that the real map is not built yet. */
function raceAttr_() {
  const m = RACE.map || {};
  if (m.practice) {
    return `<p class="race-attr">Practice streets, invented — the Colliers Wood map has not been built yet.</p>`;
  }
  return `<p class="race-attr"><a href="https://www.openstreetmap.org/copyright" rel="noopener">${
    esc(m.osm || 'Map data © OpenStreetMap contributors (ODbL)')}</a> · heights ${esc(m.dem || 'DEM')}</p>`;
}

/* A LOST CONTEXT IS ASKED BACK (preventDefault) and the world uploaded again when it returns. */
function raceGlWatch_(canvas) {
  if (!canvas) return;
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); racePause_(); });
  canvas.addEventListener('webglcontextrestored', () => { RACE.gl = null; if (!RACE.running) raceDraw_(); });
}

function raceTiles_() {
  const box = $('race-box'), row = box && box.querySelector('.race-tiles');
  if (!row) return;
  row.innerHTML = (RACE.running ? tile_({ icon: 'pause', label: 'Pause', act: 'race-pause' })
                                : tile_({ icon: 'play', label: 'Drive', act: 'race-go' }))
    + tile_({ icon: 'undo', label: 'Back to the start', act: 'race-restart' });
}

/* THE PEDALS: pointer events with capture, so a thumb that slides off a pedal still lets go of it. */
function racePads_(box) {
  const pads = box.querySelector('.race-pads');
  if (!pads) return;
  const held = new Map();
  const sync = () => {
    const t = {};
    held.forEach(k => { t[k] = true; });
    RACE.touch = t;
    pads.querySelectorAll('.race-pad').forEach(b => b.classList.toggle('on', !!t[b.dataset.pad]));
  };
  pads.addEventListener('pointerdown', e => {
    const b = e.target.closest('[data-pad]');
    if (!b) return;
    e.preventDefault();
    try { b.setPointerCapture(e.pointerId); } catch (err) {}
    held.set(e.pointerId, b.dataset.pad);
    raceGo_();
    sync();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => pads.addEventListener(n, e => { if (held.delete(e.pointerId)) sync(); }));
  pads.addEventListener('contextmenu', e => e.preventDefault());
}

const RACE_KEYS = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down',
                    ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ' ': 'brake' };
/* KEYS ONLY WHILE DRIVING, and then the arrows steer rather than turn the column. */
['keydown', 'keyup'].forEach(type => document.addEventListener(type, e => {
  if (!RACE.running) return;
  const k = RACE_KEYS[e.key];
  if (!k || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName || '')) return;
  e.preventDefault(); e.stopPropagation();
  RACE.keys[k] = type === 'keydown';
}, true));
document.addEventListener('visibilitychange', () => { if (document.hidden && RACE.running) racePause_(); });

on('race-go', () => raceGo_());
on('race-pause', () => racePause_());
on('race-restart', () => { raceReset_(); raceHud_(true); if (!RACE.running) raceDraw_(); });

;
/* ==== js/boardgames.js ==== */
/* @family. — boardgames.js THE BOARD GAMES (414, 461; back 15 Nov 2026): Chess, Maze, Connect 4, Othello, Scrabble; chess rules from attic/js/chess-engine.js, boards from games.js before 133b259. */

const START = 'rnbqkbnrpppppppp________________________________PPPPPPPPRNBQKBNR'.split('');

const CH_WHITE = 'w', CH_BLACK = 'b';
const isWhite = p => p !== '_' && p === p.toUpperCase();
const colourOf = p => p === '_' ? null : (isWhite(p) ? CH_WHITE : CH_BLACK);

/* A position is the board plus the four things you cannot see on it: § */
function newGame() {
  return {
    board: START.slice(),
    turn: CH_WHITE,
    castle: { K: true, Q: true, k: true, q: true },   // K/Q = white king/queen side
    ep: -1,                                            // square a pawn may be captured on, or -1
    halfmove: 0,                                       // for the fifty-move rule
  };
}

const file = i => i % 8;
const rank = i => Math.floor(i / 8);
const onBoard = (f, r) => f >= 0 && f < 8 && r >= 0 && r < 8;
const idx = (f, r) => r * 8 + f;

/* ---------- MOVES A PIECE COULD MAKE, ignoring whether the king is left in check § */
function pseudoMoves(pos, from) {
  const b = pos.board, p = b[from];
  if (p === '_') return [];
  const me = colourOf(p);
  const f = file(from), r = rank(from);
  const out = [];
  const add = (tf, tr, opts) => {
    if (!onBoard(tf, tr)) return false;
    const to = idx(tf, tr);
    const t = b[to];
    if (t !== '_' && colourOf(t) === me) return false;      // own piece blocks
    out.push({ from, to, ...(opts || {}) });
    return t === '_';                                        // may continue if empty
  };
  const ray = (df, dr) => {
    for (let k = 1; k < 8; k++) if (!add(f + df * k, r + dr * k)) break;
  };

  const up = me === CH_WHITE ? -1 : 1;                          // white moves toward rank 0
  switch (p.toLowerCase()) {
    case 'p': {
      const one = idx(f, r + up);
      if (onBoard(f, r + up) && b[one] === '_') {
        // Promotion: a pawn reaching the last rank must become something.
        const last = (me === CH_WHITE && r + up === 0) || (me === CH_BLACK && r + up === 7);
        if (last) 'QRBN'.split('').forEach(q => out.push({ from, to: one, promote: q }));
        else out.push({ from, to: one });

        const startRank = me === CH_WHITE ? 6 : 1;
        const two = idx(f, r + up * 2);
        if (r === startRank && b[two] === '_') out.push({ from, to: two, double: true });
      }
      // Captures, including en passant — the one capture that lands on an empty square.
      [-1, 1].forEach(df => {
        const tf = f + df, tr = r + up;
        if (!onBoard(tf, tr)) return;
        const to = idx(tf, tr);
        const t = b[to];
        if (t !== '_' && colourOf(t) !== me) {
          const last = tr === 0 || tr === 7;
          if (last) 'QRBN'.split('').forEach(q => out.push({ from, to, promote: q }));
          else out.push({ from, to });
        } else if (to === pos.ep) {
          out.push({ from, to, enpassant: true });
        }
      });
      break;
    }
    case 'n':
      [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]
        .forEach(([df, dr]) => add(f + df, r + dr));
      break;
    case 'b': [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([a,c]) => ray(a,c)); break;
    case 'r': [[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,c]) => ray(a,c)); break;
    case 'q': [[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]].forEach(([a,c]) => ray(a,c)); break;
    case 'k':
      [[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]].forEach(([df,dr]) => add(f+df, r+dr));
      break;
  }
  return out;
}

/** Is `sq` attacked by `by`? Asked of the king's square to find check. */
function attacked(pos, sq, by) {
  for (let i = 0; i < 64; i++) {
    const p = pos.board[i];
    if (p === '_' || colourOf(p) !== by) continue;
    /* Pawns are the exception: § */
    if (p.toLowerCase() === 'p') {
      const up = by === CH_WHITE ? -1 : 1;
      const f = file(i), r = rank(i);
      if ((onBoard(f-1, r+up) && idx(f-1, r+up) === sq) ||
          (onBoard(f+1, r+up) && idx(f+1, r+up) === sq)) return true;
      continue;
    }
    if (pseudoMoves(pos, i).some(m => m.to === sq)) return true;
  }
  return false;
}

const kingSquare = (pos, side) =>
  pos.board.indexOf(side === CH_WHITE ? 'K' : 'k');

const inCheck = (pos, side) =>
  attacked(pos, kingSquare(pos, side), side === CH_WHITE ? CH_BLACK : CH_WHITE);

/** Play a move and hand back a NEW position. Nothing mutates, so undo is free and search is safe. */
function play(pos, m) {
  const n = {
    board: pos.board.slice(),
    turn: pos.turn === CH_WHITE ? CH_BLACK : CH_WHITE,
    castle: { ...pos.castle },
    ep: -1,
    halfmove: pos.halfmove + 1,
  };
  const p = n.board[m.from];
  const isPawn = p.toLowerCase() === 'p';
  if (isPawn || n.board[m.to] !== '_') n.halfmove = 0;

  n.board[m.to] = m.promote ? (isWhite(p) ? m.promote : m.promote.toLowerCase()) : p;
  n.board[m.from] = '_';

  // En passant: the captured pawn is not on the square you landed on.
  if (m.enpassant) n.board[idx(file(m.to), rank(m.from))] = '_';
  if (m.double) n.ep = idx(file(m.from), (rank(m.from) + rank(m.to)) / 2);

  // Castling moves the rook too.
  if (m.castle === 'K') { n.board[63] = '_'; n.board[61] = 'R'; }
  if (m.castle === 'Q') { n.board[56] = '_'; n.board[59] = 'R'; }
  if (m.castle === 'k') { n.board[7]  = '_'; n.board[5]  = 'r'; }
  if (m.castle === 'q') { n.board[0]  = '_'; n.board[3]  = 'r'; }

  /* Rights are lost by the king or rook MOVING, and also by a rook being captured on its home
     square — the second is the one implementations forget. */
  if (p === 'K') { n.castle.K = n.castle.Q = false; }
  if (p === 'k') { n.castle.k = n.castle.q = false; }
  if (m.from === 63 || m.to === 63) n.castle.K = false;
  if (m.from === 56 || m.to === 56) n.castle.Q = false;
  if (m.from === 7  || m.to === 7)  n.castle.k = false;
  if (m.from === 0  || m.to === 0)  n.castle.q = false;

  return n;
}

/** Every LEGAL move for the side to play — pseudo-moves, minus those that leave the king in check. */
function legalMoves(pos) {
  const side = pos.turn;
  const out = [];
  for (let i = 0; i < 64; i++) {
    if (pos.board[i] === '_' || colourOf(pos.board[i]) !== side) continue;
    for (const m of pseudoMoves(pos, i)) {
      if (!inCheck(play(pos, m), side)) out.push(m);
    }
  }

  /* Castling, which has four conditions and is where most implementations leak:
     the right survives, the squares between are empty, the king is not in check now, and it does
     not PASS THROUGH or land on an attacked square. */
  const them = side === CH_WHITE ? CH_BLACK : CH_WHITE;
  const k = kingSquare(pos, side);
  const safe = sq => !attacked(pos, sq, them);
  if (!inCheck(pos, side)) {
    if (side === CH_WHITE && k === 60) {
      if (pos.castle.K && pos.board[61] === '_' && pos.board[62] === '_'
          && pos.board[63] === 'R' && safe(61) && safe(62))
        out.push({ from: 60, to: 62, castle: 'K' });
      if (pos.castle.Q && pos.board[59] === '_' && pos.board[58] === '_' && pos.board[57] === '_'
          && pos.board[56] === 'R' && safe(59) && safe(58))
        out.push({ from: 60, to: 58, castle: 'Q' });
    }
    if (side === CH_BLACK && k === 4) {
      if (pos.castle.k && pos.board[5] === '_' && pos.board[6] === '_'
          && pos.board[7] === 'r' && safe(5) && safe(6))
        out.push({ from: 4, to: 6, castle: 'k' });
      if (pos.castle.q && pos.board[3] === '_' && pos.board[2] === '_' && pos.board[1] === '_'
          && pos.board[0] === 'r' && safe(3) && safe(2))
        out.push({ from: 4, to: 2, castle: 'q' });
    }
  }
  return out;
}

/** Checkmate, stalemate, or neither. No legal moves plus check is mate; without check it's a draw. */
function outcome(pos) {
  if (legalMoves(pos).length) return null;
  return inCheck(pos, pos.turn) ? 'mate' : 'stalemate';
}


/* THE GAME IN PLAY and the solid glyphs for both sides (the colour comes from CSS); these sat in receipt.js before 133b259. */
let CHESS = null, CHESS_PICK = -1, CHESS_HIST = [], CHESS_PROMO = null, CHESS_LAST = null, CHESS_ARM = 0;
const GLYPH = { K:'♚',Q:'♛',R:'♜',B:'♝',N:'♞',P:'♟', k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟' };

/* ---------- CHESS, TWO PLAYERS ROUND ONE PHONE § */
const CH_FILES = 'abcdefgh';
const CH_NAME = { p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king' };
const chSide_ = s => s === CH_WHITE ? 'White' : 'Black';
const chSq_ = i => CH_FILES[file(i)] + (8 - rank(i));
/* ---------- THE BOARD MOVES LIKE A BOARD (429, "make it more cinematic") ---------- */
/* WHAT THE LAST PRESS DID, for the next draw to show ONCE: a glide, a capture, a check, an ending. A draw for any other reason (a pick, a note) shows the position still. */
let CHESS_FX = null;
/* THE BOARD TURNS TO FACE WHOEVER IS TO MOVE, if asked; per device, a convenience (`chess-turns`). Off, White stays at the foot as it always did. */
let CHESS_TURNS = (() => { try { return localStorage.getItem('chess-turns') === '1'; } catch (e) { return false; } })();
let CHESS_FACE_T = 0;
/* REDUCED MOTION MOVES INSTANTLY: no glide, no shake, no fall — the ending is drawn as it ends. Asked through the app's one `motionOK_` (537). */
/* A GLIDE TAKES LONGER THE FURTHER IT GOES, but never long enough to wait for: a rook across the board is 380ms. */
const chessGlideMs_ = (a, b) => Math.min(380, 170 + 32 * Math.hypot(file(a) - file(b), rank(a) - rank(b)));
const CH_ROOK = { K: [63, 61], Q: [56, 59], k: [7, 5], q: [0, 3] };
const CH_END_SAID = { mate: 'Checkmate', stalemate: 'Stalemate', fifty: 'Draw', material: 'Draw' };
function chessReset_() {
  CHESS = newGame(); CHESS_HIST = []; CHESS_PICK = -1; CHESS_PROMO = null; CHESS_LAST = null; CHESS_ARM = 0;
  CHESS_FX = null;
}
function initChess() {
  if (!$('chess-board')) return;
  if (!CHESS) chessReset_();
  drawChess();
}
/* THE GAME IS OVER, and why. § */
function chessEnd_(pos) {
  const end = outcome(pos);
  if (end) return end;
  if (pos.halfmove >= 100) return 'fifty';
  const rest = pos.board.filter(p => p !== '_' && p.toLowerCase() !== 'k');
  if (!rest.length || (rest.length === 1 && /[bn]/i.test(rest[0]))) return 'material';
  return null;
}
function chessStatus_() {
  const end = chessEnd_(CHESS);
  const side = chSide_(CHESS.turn), other = chSide_(CHESS.turn === CH_WHITE ? CH_BLACK : CH_WHITE);
  if (end === 'mate') return `Checkmate — ${other} wins.`;
  if (end === 'stalemate') return `Stalemate — ${side} has no legal move. A draw.`;
  if (end === 'fifty') return 'A draw — 50 moves each with no capture and no pawn move.';
  if (end === 'material') return 'A draw — neither side has enough left to checkmate.';
  if (CHESS_PROMO) return `${side} — promote the pawn to:`;
  return inCheck(CHESS, CHESS.turn) ? `${side} to move — check!` : `${side} to move`;
}
/* THE ROW UNDER THE BOARD IS TILES — the board is a thing. Drawn here and not in the widget's markup because tiles.js loads after map.js. */
function chessTiles_() {
  return tile_({ icon: 'undo', label: 'Undo', note: 'take back the last move', act: 'chess-undo', off: !CHESS_HIST.length })
    + tile_({ icon: 'turn', label: chessTurnSaid_(), act: 'chess-turn', on: CHESS_TURNS, pressed: CHESS_TURNS })
    + tile_({ icon: 'again', label: 'New game', act: 'chess-new' });
}
const chessTurnSaid_ = () => CHESS_TURNS ? 'The board turns to face each player' : 'The board stays with White at the foot';
function drawChess(note) {
  if (!CHESS) return;
  const fx = CHESS_FX; CHESS_FX = null;
  const moving = !!fx && motionOK_();
  const end = chessEnd_(CHESS);
  const mine = CHESS_PICK >= 0 ? legalMoves(CHESS).filter(m => m.from === CHESS_PICK) : [];
  const checked = inCheck(CHESS, CHESS.turn) ? kingSquare(CHESS, CHESS.turn) : -1;
  const board = CHESS.board.map((p, i) => {
    const cls = ['sq', 'chess-sq', (file(i) + rank(i)) % 2 ? 'dk' : 'lt'];
    if (i === CHESS_PICK) cls.push('pick');
    /* A CAPTURE IS RINGED AND A QUIET MOVE IS A DOT — and en passant is a capture that lands on an
       empty square, so it is asked of the move rather than of what is standing on the square. */
    const hit = mine.find(m => m.to === i);
    if (hit) cls.push(p !== '_' || hit.enpassant ? 'take' : 'can');
    if (CHESS_LAST && (i === CHESS_LAST.from || i === CHESS_LAST.to)) cls.push('last');
    if (i === CHESS_LAST?.to) cls.push('last-to');
    if (i === checked) cls.push('chk');
    if (i === checked && moving && fx.check) cls.push('is-new');
    const fell = end === 'mate' && i === checked;
    if (fell) cls.push('fell');
    if (p !== '_') cls.push(isWhite(p) ? 'wp' : 'bp');
    const who = p === '_' ? '' : ', ' + (isWhite(p) ? 'white ' : 'black ') + CH_NAME[p.toLowerCase()];
    /* THE PIECE IS ITS OWN BOX so it can travel over the squares without the square going with it. */
    return tile_({ form: true, look: cls.join(' '), act: 'chess-sq', data: { sq: i }, aria: chSq_(i) + who,
      html: p === '_' ? '' : `<span class="pc${fell ? ' fallen' : ''}">${GLYPH[p]}</span>` });
  }).join('');
  /* PROMOTION IS ASKED, NOT ASSUMED. § */
  const promo = CHESS_PROMO ? 'QRBN'.split('').map(q => {
    const g = CHESS.turn === CH_WHITE ? q : q.toLowerCase();
    return tile_({ form: true, look: 'btn quiet chess-pro ' + (CHESS.turn === CH_WHITE ? 'wp' : 'bp'), act: 'chess-promo',
      data: { p: q }, aria: CH_NAME[q.toLowerCase()], html: GLYPH[g] });
  }).join('') : '';
  const armed = Date.now() - CHESS_ARM < 3000;
  document.querySelectorAll('.chess-game').forEach(root => {
    const b = root.querySelector('.chess');
    if (b) {
      b.innerHTML = board;
      /* THE ENDING IS THE BOARD'S OWN LAYERS (`data-end`, ::before and ::after), not a child: every child of a board is a square (check/ui.js). */
      b.classList.toggle('is-over', !!end);
      b.classList.toggle('is-mate', end === 'mate');
      if (end) b.setAttribute('data-end', CH_END_SAID[end] || 'Draw'); else b.removeAttribute('data-end');
      b.classList.toggle('is-fresh', moving && !!fx.end);
      if (moving) chessShow_(b, fx);
    }
    const s = root.querySelector('.chess-say');
    if (s) { s.textContent = note || chessStatus_(); s.classList.toggle('is-note', !!note); }
    const pr = root.querySelector('.chess-promo'); if (pr) { pr.innerHTML = promo; pr.hidden = !promo; }
    const ctl = root.querySelector('.chess-ctl');
    if (ctl) {
      ctl.hidden = !!promo;
      if (!ctl.querySelector('.tile')) ctl.innerHTML = chessTiles_();
      tileSet_(ctl.querySelector('[data-do="chess-undo"]'), { off: !CHESS_HIST.length });
      tileSet_(ctl.querySelector('[data-do="chess-turn"]'), { label: chessTurnSaid_(), on: CHESS_TURNS, pressed: CHESS_TURNS });
      tileSet_(ctl.querySelector('[data-do="chess-new"]'), { label: armed ? 'Tap again to start over' : 'New game', on: armed });
    }
  });
  chessFace_(moving && fx.glides ? Math.max(...fx.glides.map(g => chessGlideMs_(g[0], g[1]))) + 90 : 0);
}
/* THE SCALE AT EACH STEP OF THE TURN: a square turned by θ fits its old box at 1 / (|cos θ| + |sin θ|). Same easing as the stylesheet's turn, so they keep step. */
const CHESS_TURN_KEYS = Array.from({ length: 13 }, (_, k) => {
  const th = Math.PI * k / 12;
  return { transform: `scale(${(1 / (Math.abs(Math.cos(th)) + Math.abs(Math.sin(th)))).toFixed(3)})`, offset: k / 12 };
});
/* ---------- THE BOARD TURNS AFTER THE PIECE HAS LANDED, never under it. A game that is over stays as it ended. ---------- */
function chessFace_(wait) {
  clearTimeout(CHESS_FACE_T);
  const turn = () => {
    const end = CHESS && chessEnd_(CHESS);
    const flip = !!(CHESS && CHESS_TURNS && CHESS.turn === CH_BLACK);
    document.querySelectorAll('.chess-game .chess').forEach(b => {
      if (b.classList.contains('is-flipped') === flip || (end && CHESS_TURNS)) return;
      b.classList.toggle('is-flipped', flip);
      /* DRAWN BACK AS IT TURNS, exactly as far as keeps a turned square inside its own footprint, so no corner covers the words or leaves the screen. */
      /* ITS TIME AND CURVE ARE THE BOARD'S OWN `--chess-turn`/`--chess-ease`, the ones its rotate transition uses, so the two never part (537). */
      if (motionOK_() && typeof b.animate === 'function') {
        const cs = getComputedStyle(b), sec = parseFloat(cs.getPropertyValue('--chess-turn'));
        b.animate(CHESS_TURN_KEYS, { duration: isFinite(sec) ? sec * 1000 : MOTION_.move,
                                     easing: cs.getPropertyValue('--chess-ease').trim() || MOTION_.spring });
      }
    });
  };
  /* A BOARD JUST REDRAWN IS STYLED FIRST, so its new pieces turn with it rather than starting the turn already turned. */
  if (wait > 0) CHESS_FACE_T = setTimeout(turn, wait);
  else { document.querySelectorAll('.chess-game .chess').forEach(b => void b.offsetWidth); turn(); }
}
/* ---------- WHAT A MOVE LOOKS LIKE: transforms and opacity only, so a phone composites it and paints nothing. ---------- */
function chessShow_(b, fx) {
  if (typeof b.animate !== 'function') return;
  const sq = i => b.querySelector(`[data-sq="${i}"]`);
  let land = 0;
  (fx.glides || []).forEach(([a, z]) => {
    const from = sq(a), to = sq(z), pc = to && to.querySelector('.pc');
    if (!from || !pc) return;
    const ra = from.getBoundingClientRect(), rz = to.getBoundingClientRect();
    if (!ra.width) return;                                   // a copy that is not drawn has nothing to see
    const dx = ra.left - rz.left, dy = ra.top - rz.top, ms = chessGlideMs_(a, z);
    land = Math.max(land, ms);
    to.classList.add('mv');
    /* LIFTED, CARRIED, SET DOWN: a little bigger in the middle of the journey, as a hand lifts a piece. */
    const an = pc.animate([
      { transform: `translate(${dx}px, ${dy}px)` },
      { transform: `translate(${dx / 2}px, ${dy / 2}px) scale(1.14)`, offset: 0.5 },
      { transform: 'none' }], { duration: ms, easing: MOTION_.spring });
    const done = () => to.classList.remove('mv');
    an.onfinish = done; an.oncancel = done;
  });
  /* A CAPTURE: the taken piece holds its square until the taker arrives, then is knocked away, and the board jolts once. */
  if (fx.took >= 0 && fx.gone && !fx.back) {
    const at = sq(fx.took);
    if (at) {
      const g = document.createElement('span');
      g.className = 'pc ghost ' + (isWhite(fx.gone) ? 'wp' : 'bp');
      g.setAttribute('aria-hidden', 'true');
      g.textContent = GLYPH[fx.gone];
      at.prepend(g);
      const knock = MOTION_.enter, hit = land ? Math.max(0.5, (land - 40) / (land + knock)) : 0;
      const an = g.animate([
        { opacity: 1, transform: 'none' },
        { opacity: 1, transform: 'none', offset: hit },
        { opacity: 0, transform: 'scale(.5) rotate(-18deg)' }], { duration: land + knock, easing: MOTION_.in, fill: 'forwards' });
      const gone = () => g.remove();
      an.onfinish = gone; an.oncancel = gone;
      b.animate([
        { transform: 'none' }, { transform: 'translate(-3px, 1px)' }, { transform: 'translate(3px, -1px)' },
        { transform: 'translate(-1px, 0)' }, { transform: 'none' }], { duration: knock, delay: Math.max(0, land - 30) });
    }
  }
  /* AN UNDONE CAPTURE COMES BACK, faded up where it stood. */
  if (fx.back && fx.took >= 0) {
    const pc = sq(fx.took)?.querySelector('.pc');
    if (pc) pc.animate([{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }],
                       { duration: MOTION_.move, delay: land * 0.5, easing: MOTION_.out, fill: 'backwards' });
  }
  /* CHECK: the king flinches as the threat lands; the ring that pulses round it is the stylesheet's (`.chk.is-new`). */
  if (fx.check) {
    const k = b.querySelector('.chk .pc');
    if (k) k.animate([
      { transform: 'none' }, { transform: 'translateX(-.06em) rotate(-6deg)' }, { transform: 'translateX(.06em) rotate(5deg)' },
      { transform: 'translateX(-.03em) rotate(-2deg)' }, { transform: 'none' }], { duration: MOTION_.move * 1.5, delay: land });
  }
}
/* ---------- AND WHAT IT SOUNDS LIKE, through the marking sounds' own context (`markHear_`, submit.js), woken by this press. ---------- */
/* A KNOCK OF WOOD for a move, a deeper one for a capture, two rising notes for check, three falling for mate. Quiet: two people are talking over this board. */
const CHESS_TONES = {
  move:  [['triangle', 196, 0, 0.09, 0.07]],
  take:  [['triangle', 131, 0, 0.16, 0.09], ['triangle', 262, 0, 0.06, 0.04]],
  check: [['sine', 659, 0, 0.12, 0.03], ['sine', 988, 0.1, 0.2, 0.03]],
  mate:  [['sine', 523, 0, 0.22, 0.035], ['sine', 392, 0.18, 0.26, 0.035], ['sine', 262, 0.4, 0.6, 0.04]],
};
function chessSound_(kind, wait) {
  const notes = CHESS_TONES[kind];
  if (!notes || typeof markHear_ !== 'function') return;
  const ac = markHear_();
  if (!ac) return;
  const go = () => {
    try {
      if (ac.state !== 'running') return;
      const t0 = ac.currentTime + 0.02 + (wait || 0) / 1000;
      let end = t0;
      notes.forEach(([type, f, at, len, peak]) => {
        const a = t0 + at, z = a + len;
        const g = ac.createGain();
        g.gain.setValueAtTime(0, a);
        g.gain.linearRampToValueAtTime(peak, a + 0.006);
        g.gain.exponentialRampToValueAtTime(peak / 1000, z);
        g.connect(ac.destination);
        const o = ac.createOscillator();
        o.type = type;
        o.frequency.setValueAtTime(f, a);
        o.connect(g);
        o.start(a);
        o.stop(z + 0.02);
        end = Math.max(end, z);
      });
      if (typeof markRest_ === 'function') markRest_(Math.max(0, end - ac.currentTime) * 1000 + MARK_REST_MS);
    } catch (e) {}
  };
  if (ac.state === 'running') { go(); return; }
  try { const p = ac.resume(); if (p && typeof p.then === 'function') p.then(go, () => {}); } catch (e) {}
}
function chessPlay_(m) {
  const took = m.enpassant ? idx(file(m.to), rank(m.from)) : (CHESS.board[m.to] !== '_' ? m.to : -1);
  const fx = { glides: [[m.from, m.to]].concat(m.castle ? [CH_ROOK[m.castle]] : []),
               took: took, gone: took >= 0 ? CHESS.board[took] : '' };
  CHESS_HIST.push({ pos: CHESS, last: CHESS_LAST, fx: fx });
  CHESS = play(CHESS, m);
  CHESS_LAST = { from: m.from, to: m.to };
  CHESS_PICK = -1; CHESS_PROMO = null; CHESS_ARM = 0;
  const end = chessEnd_(CHESS), check = !end && inCheck(CHESS, CHESS.turn);
  CHESS_FX = Object.assign({}, fx, { end: end, check: check });
  drawChess();
  /* HEARD AS THE PIECE LANDS, not as the finger lifts. */
  const land = motionOK_() ? Math.max(...fx.glides.map(g => chessGlideMs_(g[0], g[1]))) : 0;
  chessSound_(end === 'mate' ? 'mate' : check ? 'check' : took >= 0 ? 'take' : 'move', land);
}
/* A TAP. Three things it can mean and they are tried in the order a player means them: § */
on('chess-sq', el => {
  if (!CHESS) chessReset_();
  const i = Number(el.dataset.sq);
  if (chessEnd_(CHESS)) return drawChess('The game is over — New game to play again.');
  if (CHESS_PROMO) return drawChess();
  const moves = legalMoves(CHESS);
  if (CHESS_PICK >= 0) {
    const hits = moves.filter(m => m.from === CHESS_PICK && m.to === i);
    if (hits.length) {
      if (hits.some(m => m.promote)) { CHESS_PROMO = { from: CHESS_PICK, to: i }; return drawChess(); }
      return chessPlay_(hits[0]);
    }
  }
  const p = CHESS.board[i];
  if (p !== '_' && colourOf(p) === CHESS.turn) {
    CHESS_PICK = CHESS_PICK === i ? -1 : i;        // the same piece again puts it back down
    if (CHESS_PICK >= 0 && !moves.some(m => m.from === i))
      return drawChess(`That ${CH_NAME[p.toLowerCase()]} has no legal move${inCheck(CHESS, CHESS.turn) ? ' — you are in check' : ''}.`);
    return drawChess();
  }
  const wasPicked = CHESS_PICK >= 0;
  CHESS_PICK = -1;
  if (wasPicked) return drawChess(inCheck(CHESS, CHESS.turn) ? 'Not legal — you are in check.' : 'That piece cannot go there.');
  if (p !== '_') return drawChess(`It is ${chSide_(CHESS.turn)}'s move.`);
  drawChess();
});
on('chess-promo', el => {
  if (!CHESS_PROMO) return drawChess();
  const m = legalMoves(CHESS).find(x => x.from === CHESS_PROMO.from && x.to === CHESS_PROMO.to && x.promote === el.dataset.p);
  if (m) chessPlay_(m); else { CHESS_PROMO = null; drawChess(); }
});
/* UNDO takes back one move, either side's — two people at one board agree on that out loud, and an app that refused it would be stricter than the table. § */
on('chess-undo', () => {
  if (!CHESS) return;
  if (CHESS_PROMO) { CHESS_PROMO = null; CHESS_PICK = -1; return drawChess(); }
  const h = CHESS_HIST.pop();
  /* THE MOVE GOES BACK THE WAY IT CAME, and what it took is put back on its square. */
  if (h) {
    CHESS = h.pos; CHESS_LAST = h.last;
    if (h.fx) CHESS_FX = { glides: h.fx.glides.map(([a, z]) => [z, a]), took: h.fx.took, back: true };
  }
  CHESS_PICK = -1; CHESS_ARM = 0;
  drawChess();
});
/* TURN THE BOARD: a switch, saying the state it is in. On, the board turns now if it is Black's move, and after every move from here. */
on('chess-turn', () => {
  CHESS_TURNS = !CHESS_TURNS;
  if (typeof keepPut_ === 'function') keepPut_('chess-turns', CHESS_TURNS ? '1' : null, true);
  if (!CHESS) chessReset_();
  drawChess(CHESS_TURNS ? 'The board turns with each move.' : 'White stays at the foot.');
});
/* NEW GAME THROWS A GAME AWAY, so a game in progress asks twice — the line above the board says so and goes back
   by itself. A finished game or an empty board starts over at once: there is nothing to lose. */
on('chess-new', () => {
  const live = CHESS && CHESS_HIST.length && !chessEnd_(CHESS);
  if (live && Date.now() - CHESS_ARM >= 3000) {
    CHESS_ARM = Date.now();
    setTimeout(() => drawChess(), 3100);
    return drawChess('Tap New game again to start over.');
  }
  chessReset_();
  drawChess();
});
/* CONNECT 4, OTHELLO AND HERD MENTALITY THREE GAMES, ONE SHAPE. § */

/* ---------- CONNECT 4 § */
const C4_W = 7, C4_H = 6;
let c4 = null;
/* THE TWO SIDES, NAMED ONCE. § */
const C4_NAME = { 1: 'Red', 2: 'Yellow' };
function initConnect4() {
  const host = $('c4-board');
  if (!host) return;
  /* REBUILT FROM NOTHING EVERY TIME THE WIDGET OPENS. § */
  /* `last` IS THE COUNTER JUST PLAYED, which is the one that falls — see `c4Paint`. `win` is the
     line that ended the game, which is ringed. */
  c4 = { cells: new Array(C4_W * C4_H).fill(0), turn: 1, over: false, said: 'Red starts — tap a column.',
         last: null, win: null };
  c4Paint();
}
const c4At = (x, y) => c4.cells[y * C4_W + x];
/* THE LOWEST EMPTY SQUARE IN A COLUMN, or -1 when it is full. Everything else asks this. */
function c4Drop_(cells, x) {
  for (let y = C4_H - 1; y >= 0; y--) if (!cells[y * C4_W + x]) return y;
  return -1;
}
/* FOUR IN A LINE THROUGH A SQUARE, checked in the four directions that matter. § */
function c4Line_(cells, x, y, who) {
  const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]];
  const won = [];
  dirs.forEach(([dx, dy]) => {
    const line = [y * C4_W + x];
    for (const s of [1, -1]) {
      for (let i = 1; i < 4; i++) {
        const nx = x + dx * i * s, ny = y + dy * i * s;
        if (nx < 0 || nx >= C4_W || ny < 0 || ny >= C4_H) break;
        if (cells[ny * C4_W + nx] !== who) break;
        line.push(ny * C4_W + nx);
      }
    }
    if (line.length >= 4) line.forEach(i => { if (won.indexOf(i) < 0) won.push(i); });
  });
  return won;
}
function c4Play_(x) {
  if (!c4 || c4.over) return;
  const y = c4Drop_(c4.cells, x);
  /* A FULL COLUMN PLAYS NOTHING, SO NOTHING FALLS: `last` is not set, and the paint that showed the
     previous counter has already spent it — see `c4Paint`. */
  if (y < 0) { c4.said = 'That column is full.'; return; }
  c4.cells[y * C4_W + x] = c4.turn;
  c4.last = { x, y };
  const line = c4Line_(c4.cells, x, y, c4.turn);
  if (line.length) {
    c4.over = true;
    c4.win = line;
    c4.said = C4_NAME[c4.turn] + ' wins.';
  } else if (c4.cells.every(Boolean)) {
    c4.over = true; c4.said = 'Full board — a draw.';
  } else {
    c4.turn = c4.turn === 1 ? 2 : 1;
    c4.said = C4_NAME[c4.turn] + '\u2019s go.';
  }
}
/* ---------- THE COUNTER FALLS, AND THE FOUR THAT WON ARE RINGED § */
function c4Paint() {
  const host = $('c4-board');
  if (!host || !c4) return;
  const last = c4.last;
  c4.last = null;
  const win = c4.win || [];
  let html = '';
  for (let y = 0; y < C4_H; y++) {
    for (let x = 0; x < C4_W; x++) {
      const v = c4At(x, y);
      const fell = last && last.x === x && last.y === y;
      /* THE WHOLE COLUMN IS ONE TARGET, so every square in it carries the same `data-x` and the
         same label. A screen reader hears "column 4" six times rather than 42 unnamed squares. */
      /* HOW FAR IT FELL is a class (`c4-f1`…`c4-f6`), which style.css turns into the fall's length. */
      html += tile_({ form: true, look: 'c4-cell' + (v ? (v === 1 ? ' p1' : ' p2') : '') + (fell ? ' c4-new c4-f' + (y + 1) : '')
        + (win.indexOf(y * C4_W + x) >= 0 ? ' c4-win' : ''), act: 'c4-play', data: { x }, aria: 'Column ' + (x + 1), off: !!c4.over, html: '' });
    }
  }
  host.innerHTML = html;
  const said = $('c4-said');
  if (said) {
    const draw = c4.over && !win.length;
    said.innerHTML = (draw ? '' : `<i class="c4-turn ${c4.turn === 1 ? 'p1' : 'p2'}" aria-hidden="true"></i>`)
      + esc(c4.said);
  }
}
on('c4-play', el => {
  c4Play_(Number(el.getAttribute('data-x')));
  c4Paint();
});
on('c4-again', () => { initConnect4(); });
/* ---------- OTHELLO § */
const OTH_N = 8;
let oth = null;
const OTH_NAME = { 1: 'Red', 2: 'Blue' };
function initOthello() {
  if (!$('oth-board')) return;
  const cells = new Array(OTH_N * OTH_N).fill(0);
  const m = OTH_N / 2;
  cells[(m - 1) * OTH_N + (m - 1)] = 2; cells[(m - 1) * OTH_N + m] = 1;
  cells[m * OTH_N + (m - 1)] = 1;       cells[m * OTH_N + m] = 2;
  oth = { cells, turn: 1, over: false, said: 'Red starts.' };
  othPaint();
}
function othFlips_(cells, i, who) {
  if (cells[i]) return [];
  const x0 = i % OTH_N, y0 = (i / OTH_N) | 0, them = who === 1 ? 2 : 1, out = [];
  for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
    if (!dx && !dy) continue;
    const run = [];
    let x = x0 + dx, y = y0 + dy;
    while (x >= 0 && x < OTH_N && y >= 0 && y < OTH_N && cells[y * OTH_N + x] === them) {
      run.push(y * OTH_N + x); x += dx; y += dy;
    }
    /* THE LINE ONLY COUNTS IF IT IS CLOSED BY ONE OF YOURS. A run that walks off the edge, or into
       an empty square, brackets nothing — which is the half of this rule that is easy to forget. */
    if (run.length && x >= 0 && x < OTH_N && y >= 0 && y < OTH_N && cells[y * OTH_N + x] === who) {
      out.push(...run);
    }
  }
  return out;
}
const othMoves_ = (cells, who) => {
  const out = [];
  for (let i = 0; i < cells.length; i++) if (othFlips_(cells, i, who).length) out.push(i);
  return out;
};
const othScore_ = cells => cells.reduce((a, v) => (v === 1 ? [a[0] + 1, a[1]] : v === 2 ? [a[0], a[1] + 1] : a), [0, 0]);
function othPlay_(i, who) {
  const flips = othFlips_(oth.cells, i, who);
  if (!flips.length) return false;
  oth.cells[i] = who;
  flips.forEach(j => { oth.cells[j] = who; });
  return true;
}
/* WHOSE TURN IT IS NEXT, which is not simply "the other one". */
function othAdvance_() {
  const other = oth.turn === 1 ? 2 : 1;
  if (othMoves_(oth.cells, other).length) { oth.turn = other; oth.said = OTH_NAME[other] + '\u2019s go.'; return; }
  if (othMoves_(oth.cells, oth.turn).length) {
    oth.said = OTH_NAME[other] + ' has no move \u2014 ' + OTH_NAME[oth.turn] + ' goes again.';
    return;                                            // the same player goes again
  }
  oth.over = true;
  const [b, w] = othScore_(oth.cells);
  oth.said = b === w ? `Level, ${b}\u2013${w}.`
           : b > w ? `Red wins, ${b}\u2013${w}.` : `Blue wins, ${w}\u2013${b}.`;
}
function othPaint() {
  const host = $('oth-board');
  if (!host || !oth) return;
  let html = '';
  for (let i = 0; i < oth.cells.length; i++) {
    const v = oth.cells[i];
    html += tile_({ form: true, look: 'oth-cell' + (v === 1 ? ' p1' : v === 2 ? ' p2' : ''), act: 'oth-play', data: { i },
      aria: 'Row ' + (((i / OTH_N) | 0) + 1) + ' column ' + ((i % OTH_N) + 1), off: !!(v || oth.over), html: '' });
  }
  host.innerHTML = html;
  const [b, w] = othScore_(oth.cells);
  const sc = $('oth-score'); if (sc) sc.textContent = b + ' \u2013 ' + w;
  const said = $('oth-said'); if (said) said.textContent = oth.said;
}
on('oth-play', el => {
  if (!oth || oth.over) return;
  /* THE TAP IS ALWAYS ANSWERED, and what it says is the rule rather than the answer: "nothing to
     trap there" is true of every illegal square and names none of the legal ones. */
  if (!othPlay_(Number(el.getAttribute('data-i')), oth.turn)) {
    oth.said = 'Nothing to trap there \u2014 ' + OTH_NAME[oth.turn] + ' again.';
    othPaint();
    return;
  }
  othAdvance_();
  othPaint();
});
on('oth-again', () => { initOthello(); });
/* ---------- MAZE § */
const MAZE_N = 11;
/* ONE BIT PER WALL, so a cell is a number and carving is two lines. Read as compass points
   everywhere below, which is why the pad's buttons carry the same four letters. */
const MZ_N = 1, MZ_E = 2, MZ_S = 4, MZ_W = 8;
const MZ_DIRS = {
  n: { dx: 0, dy: -1, bit: MZ_N, back: MZ_S },
  e: { dx: 1, dy: 0, bit: MZ_E, back: MZ_W },
  s: { dx: 0, dy: 1, bit: MZ_S, back: MZ_N },
  w: { dx: -1, dy: 0, bit: MZ_W, back: MZ_E }
};
let maze = null;
const mzAt_ = (x, y) => y * MAZE_N + x;
const mzIn_ = (x, y) => x >= 0 && x < MAZE_N && y >= 0 && y < MAZE_N;
/* EVERY WALL UP, THEN A WALK THAT KNOCKS THEM DOWN. Iterative rather than recursive: a 121-cell
   maze is fine either way and a bigger one would not be, and a stack written out is a stack you can
   see the size of. */
function mzBuild_() {
  const cells = new Array(MAZE_N * MAZE_N).fill(MZ_N | MZ_E | MZ_S | MZ_W);
  const seen = new Array(MAZE_N * MAZE_N).fill(false);
  const stack = [[0, 0]];
  seen[0] = true;
  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    /* THE NEIGHBOURS NOT YET REACHED, shuffled, because taking them in a fixed order carves the
       same maze every time and taking the first one always carves a staircase. */
    const open = Object.keys(MZ_DIRS).filter(k => {
      const d = MZ_DIRS[k];
      return mzIn_(x + d.dx, y + d.dy) && !seen[mzAt_(x + d.dx, y + d.dy)];
    });
    if (!open.length) { stack.pop(); continue; }
    const k = open[Math.floor(Math.random() * open.length)];
    const d = MZ_DIRS[k];
    const nx = x + d.dx, ny = y + d.dy;
    /* BOTH SIDES OF THE SAME WALL. A wall belongs to two cells and removing it from one leaves a
       door you can walk through in one direction only — which draws correctly and plays wrongly. */
    cells[mzAt_(x, y)] &= ~d.bit;
    cells[mzAt_(nx, ny)] &= ~d.back;
    seen[mzAt_(nx, ny)] = true;
    stack.push([nx, ny]);
  }
  return cells;
}
/* THE FEWEST MOVES THERE ARE. Breadth-first, so the first time the exit is reached is by the
   shortest route — depth-first would find A route and call it the answer. */
function mzShortest_(cells) {
  const dist = new Array(MAZE_N * MAZE_N).fill(-1);
  const q = [0];
  dist[0] = 0;
  for (let i = 0; i < q.length; i++) {
    const at = q[i], x = at % MAZE_N, y = (at / MAZE_N) | 0;
    Object.keys(MZ_DIRS).forEach(k => {
      const d = MZ_DIRS[k];
      if (cells[at] & d.bit) return;                       // a wall is not a way out
      const nx = x + d.dx, ny = y + d.dy;
      if (!mzIn_(nx, ny) || dist[mzAt_(nx, ny)] !== -1) return;
      dist[mzAt_(nx, ny)] = dist[at] + 1;
      q.push(mzAt_(nx, ny));
    });
  }
  return dist[MAZE_N * MAZE_N - 1];
}
/* ---------- A MAZE IS KEPT UNTIL IT IS FINISHED, OR UNTIL `New maze` § */
function initMaze() {
  if (!$('maze-grid')) return;
  if (!maze || maze.over) mzDeal_();
  mazePaint();
}
function mzDeal_() {
  const cells = mzBuild_();
  /* NOTHING SAID AT THE START, because the line under the heading already says where you are going and this sat under it repeating it word for word -- which is the § */
  maze = { cells, x: 0, y: 0, moves: 0, best: mzShortest_(cells),
           trail: { 0: true }, over: false, said: '' };
}
function mzMove_(k) {
  if (!maze || maze.over) return;
  const d = MZ_DIRS[k];
  if (!d) return;
  /* A WALL STOPS YOU AND SAYS NOTHING. § */
  if (maze.cells[mzAt_(maze.x, maze.y)] & d.bit) return;
  const nx = maze.x + d.dx, ny = maze.y + d.dy;
  if (!mzIn_(nx, ny)) return;
  maze.x = nx; maze.y = ny;
  maze.moves++;
  maze.trail[mzAt_(nx, ny)] = true;
  if (nx === MAZE_N - 1 && ny === MAZE_N - 1) {
    maze.over = true;
    maze.said = maze.moves === maze.best
      ? 'Out in ' + maze.moves + ' — the shortest way there is.'
      : 'Out in ' + maze.moves + '. The shortest way is ' + maze.best + '.';
  }
}
function mazePaint() {
  const host = $('maze-grid');
  if (!host || !maze) return;
  let html = '';
  for (let y = 0; y < MAZE_N; y++) {
    for (let x = 0; x < MAZE_N; x++) {
      const v = maze.cells[mzAt_(x, y)];
      /* THE WALLS ARE `mz-n`/`mz-e`/`mz-s`/`mz-w`, AND THEY WERE `wn`/`we`/`ws`/`ww`. § */
      const cls = ['mz-cell'];
      if (v & MZ_N) cls.push('mz-n');
      if (v & MZ_E) cls.push('mz-e');
      if (v & MZ_S) cls.push('mz-s');
      if (v & MZ_W) cls.push('mz-w');
      if (maze.trail[mzAt_(x, y)]) cls.push('been');
      if (x === maze.x && y === maze.y) cls.push('you');
      if (x === MAZE_N - 1 && y === MAZE_N - 1) cls.push('out');
      html += '<i class="' + cls.join(' ') + '"></i>';
    }
  }
  /* NOT A LIST OF 121 SQUARES TO A SCREEN READER. § */
  host.innerHTML = html;
  host.setAttribute('aria-label',
    'Maze, row ' + (maze.y + 1) + ' of ' + MAZE_N + ', column ' + (maze.x + 1) + ' of ' + MAZE_N
    + (maze.over ? ', out' : ''));
  const said = $('maze-said'); if (said) said.textContent = maze.said;
  const n = $('maze-moves'); if (n) n.textContent = String(maze.moves);
}
on('maze-go', el => { mzMove_(el.getAttribute('data-d')); mazePaint(); });
on('maze-again', () => { mzDeal_(); mazePaint(); });
/* SCRABBLE — two, three or four people, one phone. § */
const SCR_N = 15;
/* THE STANDARD ENGLISH SET — 100 tiles, and the two blanks are the empty string. § */
const SCR_SET = [
  ['A', 9, 1], ['B', 2, 3], ['C', 2, 3], ['D', 4, 2], ['E', 12, 1], ['F', 2, 4], ['G', 3, 2],
  ['H', 2, 4], ['I', 9, 1], ['J', 1, 8], ['K', 1, 5], ['L', 4, 1], ['M', 2, 3], ['N', 6, 1],
  ['O', 8, 1], ['P', 2, 3], ['Q', 1, 10], ['R', 6, 1], ['S', 4, 1], ['T', 6, 1], ['U', 4, 1],
  ['V', 2, 4], ['W', 2, 4], ['X', 1, 8], ['Y', 2, 4], ['Z', 1, 10], ['', 2, 0],
];
const SCR_VALUE = {};
/* ---------- THE PREMIUM SQUARES, BUILT FROM ONE QUADRANT § */
const SCR_QUAD = [
  'T..d...T',
  '.D...t..',
  '..D...d.',
  'd..D...d',
  '....D...',
  '.t...t..',
  '..d...d.',
  'T..d...D',
];
function scrPrem_(i) {
  const r = (i / SCR_N) | 0, c = i % SCR_N;
  return SCR_QUAD[Math.min(r, SCR_N - 1 - r)][Math.min(c, SCR_N - 1 - c)];
}
const SCR_MID = ((SCR_N * SCR_N) - 1) / 2;
let scrabble = null;
/* Fisher-Yates, for the reason `herdShuffle_` gives: `sort(() => Math.random() - .5)` is the famous
   wrong one and deals the same few orders far too often. */
function scrShuffle_(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}
function scrBag_() {
  const bag = [];
  SCR_SET.forEach(t => { for (let i = 0; i < t[1]; i++) bag.push(t[0]); });
  return scrShuffle_(bag);
}
function scrDraw_(g, rack) {
  while (rack.length < 7 && g.bag.length) rack.push(g.bag.pop());
}
function scrNew_(n) {
  const g = { bag: scrBag_(), players: [], turn: 0, board: new Array(SCR_N * SCR_N).fill(null),
              placed: [], sel: null, swap: null, blank: null, first: true,
              handover: false, passes: 0, over: false, said: '' };
  for (let i = 0; i < n; i++) {
    const rack = [];
    scrDraw_(g, rack);
    g.players.push({ name: 'Player ' + (i + 1), rack, score: 0 });
  }
  return g;
}
function scrPlace_(g, i, rackIndex) {
  const p = g.players[g.turn];
  const letter = p.rack[rackIndex];
  g.board[i] = { letter: letter || '?', blank: letter === '', fresh: true, from: rackIndex };
  g.placed.push(i);
}
function scrRecall_(g) {
  g.placed.forEach(i => { g.board[i] = null; });
  g.placed = [];
  g.sel = null;
  g.blank = null;
}
/* ---------- THE RULES THAT ARE NOT A MATTER OF OPINION § */
function scrIllegal_(g) {
  if (!g.placed.length) return 'Put some tiles down first.';
  const rows = {}, cols = {};
  g.placed.forEach(i => { rows[(i / SCR_N) | 0] = 1; cols[i % SCR_N] = 1; });
  const oneRow = Object.keys(rows).length === 1, oneCol = Object.keys(cols).length === 1;
  if (!oneRow && !oneCol) return 'All your tiles have to be in one row or one column.';

  /* NO GAPS, counting the tiles that were already there — a word may bridge a letter somebody else
     played, and that is not a gap. */
  const step = oneRow ? 1 : SCR_N;
  const sorted = g.placed.slice().sort((a, b) => a - b);
  for (let i = sorted[0]; i <= sorted[sorted.length - 1]; i += step) {
    if (!g.board[i]) return 'There is a gap in your word.';
  }

  if (g.first) {
    if (g.placed.indexOf(SCR_MID) < 0) return 'The first word has to cover the middle square.';
    if (g.placed.length < 2) return 'The first word needs at least 2 letters.';
    return '';
  }
  /* AND IT HAS TO TOUCH SOMETHING. After the first move a word floating on its own is the one
     mistake that looks perfectly reasonable on screen. */
  const touches = g.placed.some(i => {
    const r = (i / SCR_N) | 0, c = i % SCR_N;
    return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].some(([rr, cc]) => {
      if (rr < 0 || cc < 0 || rr >= SCR_N || cc >= SCR_N) return false;
      const t = g.board[rr * SCR_N + cc];
      return !!t && !t.fresh;
    });
  });
  return touches ? '' : 'Your word has to touch a tile that is already down.';
}
/* ---------- WHAT IT SCORES § */
function scrWordAt_(g, i, step) {
  let start = i;
  while (start - step >= 0 && scrSameLine_(start, start - step, step) && g.board[start - step]) {
    start -= step;
  }
  const out = [];
  for (let j = start; j < SCR_N * SCR_N && g.board[j]; j += step) {
    out.push(j);
    if (!scrSameLine_(j, j + step, step)) break;
  }
  return out;
}
/* A STEP OF 1 MAY NOT CROSS A ROW END, which an index alone cannot say — 14 and 15 are adjacent
   numbers and opposite ends of the board. */
function scrSameLine_(a, b, step) {
  if (b < 0 || b >= SCR_N * SCR_N) return false;
  return step === SCR_N || ((a / SCR_N) | 0) === ((b / SCR_N) | 0);
}
function scrScoreWord_(g, idx) {
  let sum = 0, mult = 1;
  idx.forEach(i => {
    const t = g.board[i];
    let v = t.blank ? 0 : (SCR_VALUE[t.letter] || 0);
    if (t.fresh) {
      const p = scrPrem_(i);
      if (p === 'd') v *= 2;
      else if (p === 't') v *= 3;
      else if (p === 'D') mult *= 2;
      else if (p === 'T') mult *= 3;
    }
    sum += v;
  });
  return sum * mult;
}
function scrScore_(g) {
  const rows = {}, cols = {};
  g.placed.forEach(i => { rows[(i / SCR_N) | 0] = 1; cols[i % SCR_N] = 1; });
  const acrossMain = Object.keys(rows).length === 1 && g.placed.length > 1;
  const main = acrossMain ? scrWordAt_(g, g.placed[0], 1) : scrWordAt_(g, g.placed[0], SCR_N);
  const words = [];
  if (main.length > 1) words.push(main);
  /* A one-tile move belongs to both directions and neither is "the main word", so both are gathered
     the same way as a cross word and the pair is scored once each. */
  g.placed.forEach(i => {
    const cross = acrossMain || g.placed.length === 1 ? scrWordAt_(g, i, SCR_N) : scrWordAt_(g, i, 1);
    if (cross.length > 1 && !words.some(w => w[0] === cross[0] && w.length === cross.length)) {
      words.push(cross);
    }
    if (g.placed.length === 1) {
      const other = scrWordAt_(g, i, 1);
      if (other.length > 1 && !words.some(w => w[0] === other[0] && w.length === other.length)) {
        words.push(other);
      }
    }
  });
  let total = words.reduce((n, w) => n + scrScoreWord_(g, w), 0);
  /* SEVEN TILES IS FIFTY, which is the game's own number and the thing everybody plays for. */
  if (g.placed.length === 7) total += 50;
  return { total, words: words.length };
}
function scrPlay_(g) {
  const why = scrIllegal_(g);
  if (why) { g.said = why; return; }
  const { total } = scrScore_(g);
  const p = g.players[g.turn];
  p.score += total;
  /* THE RACK LOSES THE TILES THAT WENT DOWN, by index, highest first — splicing low-to-high moves
     every index after the one removed and takes the wrong tile off next. */
  g.placed.map(i => g.board[i].from).sort((a, b) => b - a).forEach(n => { p.rack.splice(n, 1); });
  g.placed.forEach(i => { g.board[i].fresh = false; delete g.board[i].from; });
  const bingo = g.placed.length === 7;
  g.placed = [];
  g.sel = null;
  g.first = false;
  g.passes = 0;
  scrDraw_(g, p.rack);
  g.said = p.name + ' scored ' + total + (bingo ? ' — all 7, 50 on top.' : '.');
  /* THE GAME ENDS WHEN SOMEBODY GOES OUT AND THERE IS NOTHING LEFT TO DRAW. § */
  if (!p.rack.length && !g.bag.length) { scrFinish_(g, p); return; }
  scrNext_(g);
}
function scrFinish_(g, out) {
  let picked = 0;
  g.players.forEach(q => {
    if (q === out) return;
    const left = q.rack.reduce((n, l) => n + (SCR_VALUE[l] || 0), 0);
    q.score -= left;
    picked += left;
  });
  if (out) out.score += picked;
  g.over = true;
  g.handover = false;
  const best = g.players.slice().sort((a, b) => b.score - a.score);
  g.said = best[0].score === best[1].score
    ? 'A draw on ' + best[0].score + '.'
    : best[0].name + ' wins on ' + best[0].score + '.';
}
function scrNext_(g) {
  g.turn = (g.turn + 1) % g.players.length;
  g.sel = null;
  g.blank = null;
  g.swap = null;
  /* THE HAND-OVER IS THE STATE, not a message. Until the next player taps, the rack is not drawn at
     all — a rack you can read on the way past is a rack that is not secret. */
  g.handover = true;
}
function scrPass_(g) {
  scrRecall_(g);
  g.passes++;
  g.said = g.players[g.turn].name + ' passed.';
  /* TWICE ROUND AND NOBODY CAN MOVE. The printed rules end it after six scoreless turns; two
     passes each is the same idea at any number of players and needs no second counter. */
  if (g.passes >= g.players.length * 2) { scrFinish_(g, null); return; }
  scrNext_(g);
}
function scrSwapDo_(g) {
  const p = g.players[g.turn];
  const marked = (g.swap || []).slice().sort((a, b) => b - a);
  if (!marked.length) { g.swap = null; g.said = ''; return; }
  if (marked.length > g.bag.length) {
    g.said = 'Only ' + g.bag.length + ' left in the bag — you can swap that many.';
    return;
  }
  const back = marked.map(n => p.rack[n]);
  marked.forEach(n => { p.rack.splice(n, 1); });
  scrDraw_(g, p.rack);
  back.forEach(l => g.bag.push(l));
  scrShuffle_(g.bag);
  g.passes++;
  g.said = p.name + ' swapped ' + back.length + '.';
  if (g.passes >= g.players.length * 2) { scrFinish_(g, null); return; }
  scrNext_(g);
}
function initScrabble() {
  if (!$('scr-board')) return;
  scrabblePaint();
}
function scrCellsHtml_(g) {
  let html = '';
  for (let i = 0; i < SCR_N * SCR_N; i++) {
    const t = g ? g.board[i] : null;
    const p = scrPrem_(i);
    const cls = ['scr-sq'];
    if (p === 'T') cls.push('tw'); else if (p === 'D') cls.push('dw');
    else if (p === 't') cls.push('tl'); else if (p === 'd') cls.push('dl');
    if (i === SCR_MID) cls.push('mid');
    if (t) cls.push('has');
    if (t && t.fresh) cls.push('new');
    const v = t && !t.blank ? (SCR_VALUE[t.letter] || 0) : 0;
    /* ---------- A SQUARE IS ONLY A CONTROL WHILE THERE IS A GAME § */
    if (!g) { html += '<i class="' + cls.join(' ') + '"></i>'; continue; }
    html += tile_({ form: true, look: cls.join(' '), act: 'scr-cell', data: { i },
      aria: 'Row ' + (((i / SCR_N) | 0) + 1) + ' column ' + ((i % SCR_N) + 1) + (t ? ', ' + (t.blank ? 'blank as ' : '') + t.letter : ''),
      html: t ? esc(t.letter) + (v ? '<i>' + v + '</i>' : '') : '' });
  }
  return html;
}
function scrRackHtml_(g) {
  const p = g.players[g.turn];
  if (g.handover) {
    return '<p class="scr-hand">Hand the phone to <b>' + esc(p.name) + '</b>.</p>'
      + '' + tile_({ form: true, label: 'I have it', act: 'scr-hand' }) + '';
  }
  /* ---------- TWENTY-SIX LETTERS, AND NOT AS TWENTY-SIX BUTTONS § */
  if (g.blank !== null) {
    let opts = '<option value="">The blank is…</option>';
    for (let n = 0; n < 26; n++) {
      const l = String.fromCharCode(65 + n);
      opts += '<option value="' + l + '">' + l + '</option>';
    }
    return '<p class="scr-say">What is the blank?</p>'
      + formSelect_('class="scr-sel" data-do="scr-blank" aria-label="What the blank stands for"', opts);
  }
  /* ---------- A TILE THAT IS ON THE BOARD IS NOT ON THE RACK § */
  const used = {};
  g.placed.forEach(i => { used[g.board[i].from] = 1; });

  let html = '<div class="scr-rack">';
  p.rack.forEach((l, n) => {
    const marked = g.swap && g.swap.indexOf(n) >= 0;
    const gone = !!used[n];
    html += tile_({ form: true, look: 'scr-tile' + (g.sel === n ? ' on' : '') + (marked ? ' mark' : '') + (gone ? ' used' : ''),
      act: 'scr-rack', data: { i: n }, aria: gone ? 'That tile is on the board' : l ? 'Tile ' + l : 'Blank tile',
      html: gone || !l ? '' : esc(l) + '<i>' + (SCR_VALUE[l] || 0) + '</i>' });
  });
  html += '</div>';
  return html;
}
function scrabblePaint() {
  const host = $('scr-board');
  if (!host) return;
  const g = scrabble;
  host.innerHTML = scrCellsHtml_(g);

  const who = $('scr-who');
  const rack = $('scr-rack-box');
  const acts = $('scr-acts');
  const said = $('scr-said');
  const start = $('scr-start');

  if (!g) {
    if (start) start.hidden = false;
    if (who) who.textContent = '';
    if (rack) rack.innerHTML = '';
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = '';
    return;
  }
  /* THE PLAYER-COUNT ROW COMES BACK WHEN THE GAME IS OVER, because at that point "2, 3 or 4 players" IS "new game" and a second control saying so is a second thing § */
  if (start) start.hidden = !g.over;

  if (who) {
    who.innerHTML = g.players.map((p, n) =>
      '<span class="scr-p' + (n === g.turn && !g.over ? ' on' : '') + '">'
      + esc(p.name) + ' <b>' + p.score + '</b></span>').join('');
  }
  if (rack) rack.innerHTML = g.over ? '' : scrRackHtml_(g);
  if (acts) {
    /* BUILT, NOT HIDDEN. See the note beside the empty div in map.js: a hidden control is still a
       control to anything that presses the page, and four of these do nothing between turns. */
    /* EVERY ACTION WRITTEN OUT AS A LITERAL, not built from a list. § */
    const playLabel = g.swap
      ? (g.swap.length ? 'Swap ' + g.swap.length : 'Cancel swap')
      : 'Play';
    acts.innerHTML = (g.over || g.handover || g.blank !== null) ? ''
      : tile_({ form: true, look: 'scr-act', act: 'scr-play', label: playLabel })
      + tile_({ form: true, look: 'scr-act', act: 'scr-recall', label: 'Take back' })
      + tile_({ form: true, look: 'scr-act', act: 'scr-swap', label: 'Swap' })
      + tile_({ form: true, look: 'scr-act', act: 'scr-pass', label: 'Pass' })
      + tile_({ form: true, look: 'scr-act', act: 'scr-again', label: 'New game' });
  }
  if (said) {
    said.textContent = g.said
      || (g.over ? '' : (g.bag.length + ' left in the bag.'));
  }
}
on('scr-new', el => {
  const n = Math.max(2, Math.min(4, Number(el.getAttribute('data-n')) || 2));
  scrabble = scrNew_(n);
  scrabblePaint();
});
on('scr-again', () => { scrabble = null; scrabblePaint(); });
on('scr-hand', () => {
  if (!scrabble) return;
  scrabble.handover = false;
  scrabble.said = '';
  scrabblePaint();
});
on('scr-rack', el => {
  const g = scrabble;
  if (!g || g.over || g.handover || g.blank !== null) return;
  const n = Number(el.getAttribute('data-i'));
  /* A TILE ALREADY ON THE BOARD CANNOT BE PICKED UP TWICE — take it off the square to get it back,
     which is the same gesture as on the table. */
  if (g.placed.some(i => g.board[i].from === n)) return;
  if (g.swap) {
    const at = g.swap.indexOf(n);
    if (at >= 0) g.swap.splice(at, 1); else g.swap.push(n);
  } else {
    g.sel = g.sel === n ? null : n;
  }
  scrabblePaint();
});
on('scr-cell', el => {
  const g = scrabble;
  if (!g || g.over || g.handover || g.blank !== null || g.swap) return;
  const i = Number(el.getAttribute('data-i'));
  const t = g.board[i];
  /* TAP A TILE YOU JUST PUT DOWN AND IT COMES BACK. A committed one does not, which is what `fresh`
     already says — so there is no separate list of what may be picked up. */
  if (t) {
    if (!t.fresh) return;
    g.board[i] = null;
    g.placed = g.placed.filter(x => x !== i);
    g.said = '';
    scrabblePaint();
    return;
  }
  if (g.sel === null) { g.said = 'Pick a tile first.'; scrabblePaint(); return; }
  const letter = g.players[g.turn].rack[g.sel];
  scrPlace_(g, i, g.sel);
  g.said = '';
  /* A BLANK IS NOT A LETTER UNTIL SOMEBODY SAYS SO, and it is worth nought whatever they say. § */
  if (letter === '') g.blank = i; else g.sel = null;
  scrabblePaint();
});
on('scr-play', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  if (g.swap) { scrSwapDo_(g); scrabblePaint(); return; }
  scrPlay_(g);
  scrabblePaint();
});
on('scr-recall', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  scrRecall_(g);
  g.said = '';
  scrabblePaint();
});
on('scr-swap', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  scrRecall_(g);
  g.swap = g.swap ? null : [];
  g.said = g.swap ? 'Tap the tiles to put back, then Swap.' : '';
  scrabblePaint();
});
on('scr-pass', () => {
  const g = scrabble;
  if (!g || g.over || g.handover) return;
  scrPass_(g);
  scrabblePaint();
});
/* BOARD GAMES (414, 461) — Connect 4, Othello, Scrabble, Chess and Maze in one widget, built as the word games are (238). Two players or more on one phone, so none needs a `stop`. */
const BOARD_GAMES = [
  /* CHESS AND THE MAZE, MOVED IN BY THE OWNER (461): their own cards before. Each keeps its game in memory (`CHESS`, `maze`), so a switch loses nothing. */
  { k: 'chess', name: 'Chess', start: () => initChess(),
    body: `<div class="chess-game">
    <p class="chess-say" id="chess-say" aria-live="polite">White to move</p>
    <div id="chess-board" class="chess"></div>
    <div class="btn-row chess-promo" hidden></div>
    <div class="tile-row chess-ctl"></div>
  </div>` },
  { k: 'maze', name: 'Maze', start: () => initMaze(),
    body: `<p>Top left to bottom right. Tap the arrows, or use the arrow keys.</p>
    <div id="maze-grid" class="mz" role="img"></div>
    <div class="mz-pad">
      ${tile_({ form: true, look: 'mz-key up', act: 'maze-go', data: { d: 'n' }, aria: 'Up', html: '&#9650;' })}
      ${tile_({ form: true, look: 'mz-key left', act: 'maze-go', data: { d: 'w' }, aria: 'Left', html: '&#9664;' })}
      ${tile_({ form: true, look: 'mz-key right', act: 'maze-go', data: { d: 'e' }, aria: 'Right', html: '&#9654;' })}
      ${tile_({ form: true, look: 'mz-key down', act: 'maze-go', data: { d: 's' }, aria: 'Down', html: '&#9660;' })}
    </div>
    <p class="note game-said" id="maze-said"></p>
    <p class="game-said">Moves: <b id="maze-moves">0</b></p>
    ${tile_({ form: true, label: 'New maze', act: 'maze-again', kind: 'quiet' })}` },
  { k: 'c4', name: 'Connect 4', start: () => initConnect4(),
    body: `<p>2 players, 1 phone. Red starts. Tap a column; 4 in a line, any direction.</p>
    <div id="c4-board" class="c4"></div>
    <p class="note game-said" id="c4-said"></p>
    ${tile_({ form: true, label: 'New game', act: 'c4-again', kind: 'quiet' })}` },
  { k: 'oth', name: 'Othello', start: () => initOthello(),
    body: `<p>2 players, 1 phone. Red starts. Trap a line of the other colour between 2
       of yours.</p>
    <div id="oth-board" class="oth"></div>
    ${rowLive('Red \u2013 Blue', '2 \u2013 2', 'oth-score')}
    <p class="note game-said" id="oth-said"></p>
    ${tile_({ form: true, label: 'New game', act: 'oth-again', kind: 'quiet' })}` },
  /* SCRABBLE KEEPS ITS GAME across a switch: its state is `scrabble`, and `initScrabble` only paints it. The action row is built by `scrabblePaint`, empty until there is a turn. */
  { k: 'scr', name: 'Scrabble', start: () => initScrabble(),
    body: `<p>2 to 4 players, 1 phone. Words stand unless somebody challenges them —
       that part is yours.</p>
    <div id="scr-who" class="scr-who"></div>
    <div id="scr-board" class="scr"></div>
    <div id="scr-rack-box" class="scr-box"></div>
    <div id="scr-acts" class="scr-acts"></div>
    <p class="note game-said" id="scr-said"></p>
    <div id="scr-start" class="btn-row">
      ${tile_({ form: true, label: '2 players', act: 'scr-new', data: { n: '2' } })}
      ${tile_({ form: true, label: '3', act: 'scr-new', data: { n: '3' } })}
      ${tile_({ form: true, label: '4', act: 'scr-new', data: { n: '4' } })}
    </div>` },
];
function bgGame_(k) { return BOARD_GAMES.find(g => g.k === k) || BOARD_GAMES[0]; }
/* REMEMBERED ON THE DEVICE under `bg-game`, `wg-game`'s rule. */
function bgChosen_() {
  let k = '';
  try { k = localStorage.getItem('bg-game') || ''; } catch (e) {}
  return bgGame_(k).k;
}
function bgOptions_() {
  const k = bgChosen_();
  return BOARD_GAMES.map(x =>
    `<option value="${esc(x.k)}"${x.k === k ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
}
function bgSlot_() {
  const g = bgGame_(bgChosen_());
  return `<div data-g="${esc(g.k)}" class="bg-game">${g.body}</div>`;
}
/* THE PICKER AND THE CHOSEN BOARD'S MARKUP — the widget's `draw`; rebuilt only when the game changed. */
function bgPaint_() {
  const slot = $('bg-slot'), sel = $('bg-pick');
  if (!slot) return false;
  const g = bgGame_(bgChosen_());
  if (sel && sel.value !== g.k) sel.innerHTML = bgOptions_();
  const now = slot.firstElementChild;
  if (!now || now.getAttribute('data-g') !== g.k) slot.innerHTML = bgSlot_();
  return g;
}
function initBoardGames() {
  const g = bgPaint_();
  if (g) g.start();
}
/* NOTHING RUNS BETWEEN MOVES, so leaving stops nothing; declared so the widget has the word games' shape. */
function boardGamesStop_() {}
on('bg-pick', el => {
  const k = bgGame_(el.value).k;
  try { localStorage.setItem('bg-game', k); } catch (e) {}
  const slot = $('bg-slot');
  if (slot) slot.innerHTML = '';
  initBoardGames();
});

/* THE LOOSE LINES THE BOARDS NEED: the tiles' values, the maze's arrow keys, the Scrabble blank's letter. */
document.addEventListener('keydown', e => {
  if (!maze || maze.over) return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const t = e.target;
  if (t && (t.isContentEditable || (t.closest && t.closest('input, textarea, select')))) return;
  const k = { ArrowUp: 'n', ArrowRight: 'e', ArrowDown: 's', ArrowLeft: 'w' }[e.key];
  if (!k || !mzInFront_()) return;
  e.preventDefault();
  e.stopPropagation();
  mzMove_(k);
  mazePaint();
});
SCR_SET.forEach(t => { SCR_VALUE[t[0]] = t[2]; });
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="scr-blank"]');
  if (!el) return;
  const g = scrabble;
  if (!g || g.blank === null) return;
  const l = String(el.value || '').toUpperCase();
  if (!/^[A-Z]$/.test(l)) return;
  const t = g.board[g.blank];
  if (t) t.letter = l;
  g.blank = null;
  g.sel = null;
  scrabblePaint();
});
/* THE ARROW KEYS, AND ONLY WHERE THE MAZE IS THE THING IN FRONT OF YOU: its grid on the column in front, no sheet over it. */
function mzInFront_() {
  if (typeof AT === 'undefined') return false;
  const sheet = $('sheet');
  if (sheet && !sheet.classList.contains('hidden')) return false;
  return [...document.querySelectorAll('[id="maze-grid"]')].some(g => !!(g.closest('.screen') && g.closest('.screen').id === 's-' + AT));
}

;
/* ==== js/pixel.js ==== */
/* @family. — pixel.js THE PIXEL EDITOR, A TOOL (547): bare bones -- a grid, a colour, pen or eraser, Clear and a PNG. This device only (`pixelArt`). */

/* THREE GRID SIZES, square. The owner asked for bare bones (30 Oct): nothing past what coddy's maker has at its plainest. */
const PXE_SIZES = [8, 16, 32];
const PXE_KEY = 'pixelArt';
/* ONE PICTURE PER DEVICE: { n, colour, tool, px: ['' | '#rrggbb', ...] } row by row; '' is see-through. */
let PXE = null;
const pxeHex_ = v => (/^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v).toLowerCase() : '');
/* THE FIRST COLOUR IN THE HAND: the site's own ink on gold (black), read off its token and written out long, as a colour box needs. */
function pxeInk_() {
  let v = '';
  try { v = getComputedStyle(document.documentElement).getPropertyValue('--on-gold').trim(); } catch (e) { v = ''; }
  return pxeHex_(/^#[0-9a-f]{3}$/i.test(v) ? v.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3') : v);
}
function pxeLoad_() {
  if (PXE) return PXE;
  let got = null;
  try { got = JSON.parse(localStorage.getItem(PXE_KEY) || 'null'); } catch (e) { got = null; }
  const n = got && PXE_SIZES.indexOf(Number(got.n)) >= 0 ? Number(got.n) : 16;
  const px = new Array(n * n).fill('');
  if (got && Array.isArray(got.px)) got.px.slice(0, n * n).forEach((c, i) => { px[i] = pxeHex_(c); });
  PXE = { n, colour: pxeHex_(got && got.colour) || pxeInk_(), tool: got && got.tool === 'eraser' ? 'eraser' : 'pen', px };
  return PXE;
}
function pxeKeep_() { try { localStorage.setItem(PXE_KEY, JSON.stringify(PXE)); } catch (e) { /* storage blocked: the picture lives until the page goes */ } }

function pxeHtml_() {
  pxeLoad_();
  const cells = PXE.px.map((c, i) => `<span class="pxe-c" data-pxe="${i}"${c ? ` style="background:${c}"` : ''}></span>`).join('');
  return `<div class="pxe">
    ${formLine_('Grid', formSelect_(`data-pxe-set="n" aria-label="Grid"`, PXE_SIZES.map(s => `<option value="${s}"${s === PXE.n ? ' selected' : ''}>${s} × ${s}</option>`).join('')), 'pxe-line')}
    ${formLine_('Colour', formInput_(`type="color" data-pxe-set="colour" value="${esc(PXE.colour)}" aria-label="Colour"`), 'pxe-line')}
    <div class="tile-row">${
      /* ONE TILE SAYS WHICH IS IN THE HAND AND SWAPS IT: every press changes something (owner, 12 Nov). */
      PXE.tool === 'eraser' ? tile_({ icon: 'close', label: 'Eraser', note: 'tap for the pen', act: 'pxe-tool', data: { tool: 'pen' }, on: true })
        : tile_({ icon: 'pen', label: 'Pen', note: 'tap for the eraser', act: 'pxe-tool', data: { tool: 'eraser' }, on: true })}${
      tile_({ icon: 'bin', label: 'Clear', note: 'every square', act: 'pxe-clear' })}${
      tile_({ icon: 'save', label: 'Export PNG', note: 'the picture', act: 'pxe-png' })}</div>
    <div class="pxe-grid" style="grid-template-columns:repeat(${PXE.n}, 1fr)" aria-label="${esc(PXE.n + ' by ' + PXE.n + ' grid')}">${cells}</div>
  </div>`;
}
function pxePaint_() { document.querySelectorAll('[id="pxe-box"]').forEach(el => { el.innerHTML = pxeHtml_(); }); }
function initPixel_() { pxePaint_(); }

/* THE PICTURE, one PNG pixel per square times a whole number, so it stays sharp: 512 px a side; see-through squares stay see-through. */
function pxeCanvas_() {
  pxeLoad_();
  const k = Math.floor(512 / PXE.n), cv = document.createElement('canvas');
  cv.width = cv.height = k * PXE.n;
  const g = cv.getContext && cv.getContext('2d');
  if (!g) return cv;
  PXE.px.forEach((c, i) => { if (c) { g.fillStyle = c; g.fillRect((i % PXE.n) * k, Math.floor(i / PXE.n) * k, k, k); } });
  return cv;
}

/* A FILE HANDED TO THE PHONE TO KEEP; revoked later, as a download can start after the click returns. */
function saveBlob_(blob, name) {
  const href = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = href; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 60000);
}

/* ---------- PAINTING: a press paints the square under it, and a drag paints every square it crosses (the grid takes the drag, never the column). */
let PXE_DOWN = false;
function pxeAt_(e) {
  const hit = (document.elementFromPoint && document.elementFromPoint(e.clientX, e.clientY)) || e.target;
  const c = hit && hit.closest ? hit.closest('[data-pxe]') : null;
  if (!c) return;
  const i = Number(c.dataset.pxe), v = PXE.tool === 'eraser' ? '' : PXE.colour;
  if (PXE.px[i] === v) return;
  PXE.px[i] = v;
  c.style.background = v;
}
document.addEventListener('pointerdown', e => {
  if (!(e.target && e.target.closest && e.target.closest('.pxe-grid'))) return;
  pxeLoad_();
  PXE_DOWN = true;
  e.preventDefault();
  pxeAt_(e);
});
document.addEventListener('pointermove', e => { if (PXE_DOWN) pxeAt_(e); });
function pxeUp_() { if (!PXE_DOWN) return; PXE_DOWN = false; pxeKeep_(); }
document.addEventListener('pointerup', pxeUp_);
document.addEventListener('pointercancel', pxeUp_);

/* THE FORM'S TWO ROWS: a new grid size starts a blank picture of that size; the colour is kept as it is picked. */
document.addEventListener('change', e => {
  const s = e.target && e.target.closest ? e.target.closest('[data-pxe-set]') : null;
  if (!s) return;
  pxeLoad_();
  if (s.dataset.pxeSet === 'n' && PXE_SIZES.indexOf(Number(s.value)) >= 0 && Number(s.value) !== PXE.n) {
    PXE.n = Number(s.value); PXE.px = new Array(PXE.n * PXE.n).fill(''); pxeKeep_(); pxePaint_(); return;
  }
  if (s.dataset.pxeSet === 'colour' && pxeHex_(s.value)) { PXE.colour = pxeHex_(s.value); PXE.tool = 'pen'; pxeKeep_(); pxePaint_(); }
});

on('pxe-tool', el => { pxeLoad_().tool = el.dataset.tool === 'eraser' ? 'eraser' : 'pen'; pxeKeep_(); pxePaint_(); });
on('pxe-clear', () => { const p = pxeLoad_(); p.px = new Array(p.n * p.n).fill(''); pxeKeep_(); pxePaint_(); });
on('pxe-png', () => {
  const cv = pxeCanvas_();
  try {
    cv.toBlob(b => { if (b) { saveBlob_(b, 'pixel-art-' + PXE.n + 'x' + PXE.n + '.png'); toast('Picture saved'); } }, 'image/png');
  } catch (e) { toast('The picture could not be made here.'); }
});

;
