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
  paintBoard_('tt-board', 'ttHighscore');
}
/* START, AGAIN AND GIVE UP: the sprint's buttons had no handler when games.js came back (12 Nov). */
on('tt-begin', () => startTimesTables());
on('tt-stop', () => endTimesTables());

function endTimesTables() {
  if (!ttState) return;
  clearInterval(ttState.timer);
  const score = ttState.score;
  const best = Math.max(Number(USER && USER.ttHighscore) || 0, score);
  ttState = null;

  $('tt-question')?.classList.add('hidden');
  const over = $('tt-over');
  if (over) {
    over.classList.remove('hidden');
    over.innerHTML = `
      <p class="mono tt-big">${score}</p>
      <p class="note game-said">${
        score === 0 ? 'None. It happens — try a slower start.'
      : score >= best && score > 0 && score > (Number(USER && USER.ttHighscore) || 0)
        ? 'A new best.'
      : 'Your best is ' + best + '.'}</p>
      ${tile_({ form: true, look: `btn`, attrs: `data-do="tt-begin"`, html: `Again` })}`;
  }

  /* Kept only if it beats the old one, and only for somebody signed in. § */
  if (USER && score > (Number(USER.ttHighscore) || 0)) {
    const was = Number(USER.ttHighscore) || 0;
    USER.ttHighscore = score;
    api({ action: 'saveTtHighscore',
      name: USER.name, personId: USER.personId, score })
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        if (typeof d.best === 'number') USER.ttHighscore = d.best;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        /* ---------- AND THE ROW THE BOARD READS, WHICH THIS NEVER TOUCHED § */
        const meRow = (DATA.students || []).concat(DATA.tutors || []).filter(mineIs_)[0];
        if (meRow) meRow.ttHighscore = Number(USER.ttHighscore) || 0;
        paintBoard_('tt-board', 'ttHighscore');
      })
      .catch(() => {
        /* Said quietly rather than left as a lie. A child told they set a record and finding it
           gone next visit has nothing to explain it. */
        USER.ttHighscore = was;
        const over2 = $('tt-over');
        if (over2) over2.insertAdjacentHTML('beforeend',
          '<p class="note game-said">Not saved — no connection.</p>');
      });
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
          return tile_({ form: true, look: 'ss-chip' + (used ? ' used' : ''), act: 'ss-word', data: { i }, pressed: used, label: w });
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
    body: `<p>Tap the first letter of a word, then its last.</p>
    <label class="mat-sel ws-top"><select id="ws-theme" data-do="ws-theme"
      aria-label="Which words"></select></label>
    <div id="ws-grid" class="ws"></div>
    <ul id="ws-words" class="ws-list"></ul>
    <p class="note game-said" id="ws-said"></p>
    ${tile_({ form: true, label: 'New puzzle', act: 'ws-again', kind: 'quiet' })}` },
  /* THE TIMES TABLES SPRINT, MOVED IN BY THE OWNER (461): its own card before; its best is still `saveTtHighscore`'s. */
  { k: 'tt', name: 'Times Tables Sprint', start: () => initTables(),
    stop: () => { if (typeof ttState !== 'undefined' && ttState) { clearInterval(ttState.timer); ttState = null; } },
    body: `<div id="tt-idle">
      <p>Sixty seconds. As many as you can.</p>
      ${tile_({ form: true, look: `btn`, attrs: `id="tt-play" data-do="tt-begin"`, html: `Start` })}
    </div>
    <div id="tt-question" class="hidden tt">
      <p class="mono tt-big" id="tt-q">—</p>
      <input id="tt-answer" inputmode="numeric" placeholder="answer" autocomplete="off">
      <p class="note game-said" id="tt-feedback"></p>
      ${rowLive('Time', '60', 'tt-time')}
      ${rowLive('Right', '0', 'tt-score')}
      ${tile_({ form: true, look: `btn quiet`, attrs: `data-do="tt-stop"`, html: `Give up` })}
    </div>
    <div id="tt-over" class="hidden"></div>
    <div id="tt-board" class="board"></div>` },
  { k: 'ss', name: 'Sentence Scramble', start: () => initScramble(), stop: () => {},
    body: `<p>Tap the words in order to put the sentence back together.</p>
    <label class="mat-sel ws-top"><select id="ss-level" data-do="ss-level"
      aria-label="Level"></select></label>
    <div id="ss-box"></div>
    <p class="note game-said" id="ss-said"></p>` },
];

/* A party game's body is its sentence and the frame `PARTY_GAMES[k].paint` fills — the same three
   elements for all four, so they are written once here rather than four times above. */
function wgBody_(g) {
  if (!g.party) return g.body;
  return g.body + `
    <div id="${g.k}-card" class="art"></div>
    <div id="${g.k}-acts" class="party-acts"></div>
    <p class="note game-said" id="${g.k}-said"></p>`;
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

/* THE CONSOLE PLAYS EVERY GAME (441): the person's game files, Flabby Pird and the Colliers Wood racer, one picker — the board games' shape (414). */
const CONSOLE_GAMES = [
  { k: 'file', name: 'Game files', start: () => { nesPaint_(); nesPadWatch_(); }, still: () => nesPaint_(),
    stop: () => { nesStop_(); nesPadUnwatch_(); },
    body: `<p class="cs-one" title="NES, SNES, Game Boy, Game Boy Color, Game Boy Advance, N64 and DS">NES to DS games you own; they stay on this device.</p>
    <div id="nes-box" class="nes-box"></div>` },
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
    <p class="note" id="nes-say" role="status"></p>
    <p id="nes-kept" hidden></p>
    <p id="nes-sysnote" hidden></p>
    <input type="file" id="nes-file" class="nes-file" accept="${NES_ACCEPT}">`;
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
const NES_NAME = { nes: 'NES', snes: 'SNES', gb: 'Game Boy', gbc: 'Game Boy Color', gba: 'Game Boy Advance', n64: 'N64', nds: 'DS' };

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
const CSV_MAX = 2 * 1024 * 1024;   // the backend's CONSOLE_SAVE_MAX: an account keeps 2 MB per game once packed
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

/* gzip, then base64, for the account; a browser with no CompressionStream keeps its saves on the device only. */
function csvPack_(u8) {
  if (!u8 || !u8.length) return Promise.resolve('');
  const loop = a => { let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); };
  /* THE BROWSER'S OWN BASE64 off the script's thread where it can (478); the string loop where it cannot. */
  const b64 = a => new Promise(ok => {
    try {
      const r = new window.FileReader();
      r.onload = () => { const u = String(r.result || ''), i = u.indexOf(','); ok(i < 0 ? loop(a) : u.slice(i + 1)); };
      r.onerror = () => ok(loop(a));
      r.readAsDataURL(new window.Blob([a]));
    } catch (e) { ok(loop(a)); }
  });
  try {
    if (typeof window.CompressionStream !== 'function') return Promise.resolve('');
    return new window.Response(new Blob([u8]).stream().pipeThrough(new window.CompressionStream('gzip'))).arrayBuffer().then(ab => b64(new Uint8Array(ab))).catch(() => '');
  } catch (e) { return Promise.resolve(''); }
}
function csvUnpack_(s) {
  if (!s) return Promise.resolve(null);
  try {
    if (typeof window.DecompressionStream !== 'function') return Promise.resolve(null);
    const bin = atob(s), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new window.Response(new Blob([u8]).stream().pipeThrough(new window.DecompressionStream('gzip'))).arrayBuffer().then(ab => new Uint8Array(ab)).catch(() => null);
  } catch (e) { return Promise.resolve(null); }
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

/* AT EVERY PAUSE AND LEAVE: on this device first, then, signed in, on the account. A save the same as the last one sent is not sent again. */
function csvKeep_(force) {
  if (!force && CSV_.took && Date.now() - CSV_.took < CSV_EVERY) return;
  const rec = csvCapture_();
  if (!rec) return;
  CSV_.took = Date.now();
  csvDb_('readwrite', s => s.put(rec, rec.hash)).then(ok => { if (ok) { CSV_.at = rec.at; CSV_.where = 'device'; csvLine_(); } });
  if (typeof USER !== 'object' || !USER || !USER.token) return;
  Promise.all([csvPack_(rec.sram), csvPack_(rec.state)]).then(([sram, state]) => {
    if (!sram && !state) return;
    const sig = rec.hash + sram.length + ':' + state.length + ':' + sram.slice(-64) + state.slice(-64);
    if (sig === CSV_.sent) { CSV_.where = 'account'; csvLine_(); return; }
    /* OVER THE CAP: refused here, politely, before anything is sent; the device copy stands. */
    if (Math.floor((sram.length + state.length) * 3 / 4) > CSV_MAX) { CSV_.said = 'Too big for your account (over 2 MB), so it is kept on this device only.'; csvLine_(); return; }
    return api({ action: 'consoleSave', personId: USER.personId || '', hash: rec.hash, sys: rec.sys, at: rec.at, sram, state }).then(d => {
      if (d && d.error) { CSV_.said = String(d.error); csvLine_(); return; }
      CSV_.sent = sig; CSV_.said = ''; CSV_.at = rec.at; CSV_.where = 'account'; csvLine_();
    });
  }).catch(() => { CSV_.said = ''; csvLine_(); });
}

/* THE NEWEST OF THE DEVICE'S AND THE ACCOUNT'S, as raw bytes; nothing at all is a fresh game. */
function csvFind_(hash) {
  const mine = csvDb_('readonly', s => s.get(hash)).then(r => (r && r.hash === hash ? r : null));
  const theirs = (typeof USER === 'object' && USER && USER.token)
    ? api({ action: 'consoleLoad', personId: USER.personId || '', hash }).then(d => {
      const v = d && d.save;
      if (!v || !(v.sram || v.state)) return null;
      return Promise.all([csvUnpack_(v.sram), csvUnpack_(v.state)]).then(([sram, state]) => ({ hash, sys: v.sys, at: Number(v.at) || 0, sram, state, account: true }));
    }).catch(() => null)
    : Promise.resolve(null);
  return Promise.all([mine, theirs]).then(([a, b]) => (a && b ? (b.at > a.at ? b : a) : a || b));
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
