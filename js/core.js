/* @family. — core.js ONE FILE, SPLIT. § */
/* SHARED:BEGIN — data/settings/settings.json (and default-pictures.json as `pictures`), written by `node tools/build.js`; edit the json, never this. */
const SHARED_SETTINGS = {"tz":"Europe/London","days":[["m","Monday"],["tu","Tuesday"],["w","Wednesday"],["th","Thursday"],["f","Friday"],["sa","Saturday"],["su","Sunday"]],"hours":[9,10,11,12,13,14,15,16,17,18,19,20],"roles":{"ids":{"admin":{"label":"Admin","aliases":["administrator"],"rank":"admin","tier":"admin","self":false},"tutor":{"label":"Tutor","aliases":["teacher"],"rank":"staff","tier":"member","self":true,"pending":true},"client":{"label":"Client","aliases":["parent","guardian"],"app":"parent","rank":"client","tier":"member","self":true},"student":{"label":"Student","aliases":["kid","child","pupil"],"app":"kid","rank":"student","tier":"child","self":true},"contact":{"label":"Contact","aliases":[],"rank":"contact","tier":"anyone","self":false,"signIn":false}},"default":"client","guest":{"rank":"out","tier":"anyone","as":"child","keeps":false},"ranks":["contact","student","client","staff","admin"],"tiers":["anyone","member","child","admin"],"titles":{"head of boxing":"Head of Boxing","coach":"Coach"},"may":{"admin":{"tiers":["admin"]},"owner":{"tiers":["admin"],"owner":true},"prices":{"notTiers":["child","anyone"]},"staff":{"rank":"staff"},"signedIn":{"notTiers":["anyone"]},"grownUp":{"tiers":["member","admin"]}},"see":{"roles":["child","family","tutor","admin"],"words":{"student":"child","client":"family","member":"family","family":"family","staff":"tutor","tutor":"tutor","apprentice":"tutor","admin":"admin","business":"admin","site":"admin"}},"notify":["client","student","tutor","admin"],"form":["student","client","tutor","admin","contact"]},"limits":{"photoMax":8,"jobMax":6,"libraryCards":5,"favLinksMax":10,"favTitleMax":80,"favUrlMax":2000,"digestWordMax":300},"siteRules":{"ids":["mag-items","speed-long","hear-lang","tap-44","search-icon","whole-widgets","library-one-card","tell-admin","kjv-admin","finder-members","admin-cols","people-no-merge","items-no-move","form-save-row"],"locked":["hear-lang","admin-cols","people-no-merge","items-no-move","form-save-row"]},"submissionsPerPost":25,"answerTextMax":20000,"calendar":{"breaks":[{"name":"October half-term","sheet":"October Half Term","kind":"half","starts":"10-26"},{"name":"Christmas holidays","sheet":"Christmas Holiday","kind":"holiday","starts":"12-19"},{"name":"February half-term","sheet":"February Half Term","kind":"half","starts":"02-13"},{"name":"Easter holidays","sheet":"Easter Holiday","kind":"holiday","starts":"03-27"},{"name":"May half-term","sheet":"May Half Term","kind":"half","starts":"05-22"},{"name":"Summer holidays","sheet":"Summer Holiday","kind":"holiday","starts":"07-22"}],"kinds":{"term":{"say":"term","words":[]},"half-term":{"say":"half term","also":["half term"],"words":["half\\s*term"]},"holiday":{"say":"holiday","words":["holiday","christmas","easter","summer break","break"]}},"exams":[{"id":"sats","name":"SATs","key":"exam_sats_start","at":"05-11"},{"id":"elevenplus","name":"11+","key":"exam_11plus_start","at":"09-12"},{"id":"gcse","name":"GCSE exams","key":"exam_gcse_start","at":"05-11"},{"id":"alevel","name":"A-level exams","key":"exam_alevel_start","at":"05-11"}]},"levels":{"list":[{"level":"SATs","rung":1,"stages":["KS1","KS2"],"tiers":[],"says":["KS1","KS2","KS1 SATs","KS2 SATs"]},{"level":"11+","rung":0,"stages":["KS2"],"tiers":[],"says":[]},{"level":"KS3","rung":2,"stages":["KS3"],"tiers":[],"says":[]},{"level":"GCSE","rung":3,"stages":["KS4"],"tiers":["Foundation","Higher","Foundation Plus","Higher Plus"],"says":["KS4"]},{"level":"Functional Skills L2","rung":0,"stages":["KS4"],"tiers":[],"says":[]},{"level":"Level 2 Certificate","rung":0,"stages":["KS4"],"tiers":[],"says":["L2 Certificate"]},{"level":"A-Level","rung":4,"stages":["KS5"],"tiers":[],"says":["Alevel","A level","KS5"]},{"level":"AS","rung":0,"stages":["KS5"],"tiers":[],"says":["AS level","AS-level"]},{"level":"Theory test","rung":0,"ladder":false,"stages":[],"tiers":[],"says":[]},{"level":"ESL","rung":0,"ladder":false,"stages":[],"tiers":["A1","A2","B1","B2","C1","C2"],"says":["EFL","ESOL","CEFR"]},{"level":"University","rung":5,"stages":[],"tiers":["FHEQ 4","FHEQ 5","FHEQ 6","FHEQ 7"],"says":["Degree","Undergraduate","FHEQ","MSOR"]},{"level":"BNCC","rung":0,"ladder":false,"stages":[],"tiers":["1º ano","2º ano","3º ano","4º ano","5º ano","6º ano","7º ano","8º ano","9º ano"],"says":["Brazil","Brasil","Ensino Fundamental"]},{"level":"ENEM","rung":0,"ladder":false,"stages":[],"tiers":[],"says":[]},{"level":"Australian Curriculum","rung":0,"ladder":false,"stages":[],"tiers":["Foundation Year","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9","Year 10"],"says":["Australia","ACARA","F-10"]}],"quals":{"list":["Doctorate","Master's degree","PGCE","Bachelor's degree","Foundation Degree","HND","HNC","Diploma","Access to HE","International Baccalaureate","A-Level","T Level","BTEC","AS","IGCSE","GCSE","Certificate","11+","SATs","Entry Level","Enhanced","Standard","Basic"],"says":{"Degree":"Bachelor's degree","BA":"Bachelor's degree","BSc":"Bachelor's degree","Undergraduate":"Bachelor's degree","University":"Bachelor's degree","Masters":"Master's degree","MA":"Master's degree","MSc":"Master's degree","PhD":"Doctorate","IB":"International Baccalaureate"}}},"library":{"show":["generated","past-papers"]},"pictures":["fox","owl","cat","dino","robot","rocket","planet","football","guitar","palette"]};
/* THE ROLE HELPERS BOTH SIDES SHARE (one role check, owner 21 Nov): copied by tools/cards-gen.js into the SHARED block of js/core.js and
   backend/constants.gs, after SHARED_SETTINGS. Edit here, never there; tools/one-role.js fails the build on a twin anywhere else. Plain ES2017. */
const ROLES_ = SHARED_SETTINGS.roles;
const ROLE_IDS = Object.keys(ROLES_.ids);
const RANKS = ROLES_.ranks;
const ROLE_ALIASES = Object.fromEntries([].concat(...ROLE_IDS.map(r => (ROLES_.ids[r].aliases || []).map(a => [a, r]))));
const SEE_ROLES = ROLES_.see.roles;
const ROLE_THREE_ = ROLES_.see.words;
/* THE PERMISSION TIER A RANK HOLDS (actions.json `roles`); no rank is a guest. */
function rankTier_(rank) {
  const id = ROLE_IDS.find(r => ROLES_.ids[r].rank === rank);
  return id ? ROLES_.ids[id].tier : ROLES_.guest.tier;
}
/* A FIXED WORD (`roles.may`) for this tier, rank and owner-ness; undefined when the word is a permissions.json row instead. */
function mayWord_(what, tier, rank, isOwner) {
  const m = Object.prototype.hasOwnProperty.call(ROLES_.may, what) ? ROLES_.may[what] : null;
  if (!m) return undefined;
  let ok = m.rank ? !!rank && RANKS.indexOf(rank) >= RANKS.indexOf(m.rank)
    : m.tiers ? m.tiers.indexOf(tier) !== -1 : (m.notTiers || []).indexOf(tier) === -1;
  if (m.owner) ok = ok && !!isOwner;
  return ok;
}
/* SHARED:END */
/* WORDS:BEGIN — a copy of data/settings/words.json, written by `node tools/build.js`; edit the json, never this. */
const WORDS_FILE = {"accept-request":"Accept request","accepted-by":"Accepted by ","accepted-the-family-can-pay-and":"Accepted — the family can pay and confirm","account-made-sign-in-now-as":"Account made — sign in now as ","account-made-sign-in-now-with":"Account made — sign in now with your PIN. We have also emailed you a link to confirm your address.","account-made-sign-in-now-with-2":"Account made — sign in now with your PIN. Open the link we have emailed you before making ","add-them-to-that-account-and":"Add them to that account and the next booking will name them.","admin-earns":"Admin earns","ages-up-to":"Ages up to ","all-ages":"All ages","already-teaching":"Already teaching","email-does-not-look-right":"That email address does not look right.","handle-shape":"A handle is 3 to 30 characters, starts with a letter, and holds only letters, numbers, underscores and hyphens.","an-email-address-please-the-link":"An email address, please — the link goes to it.","anyone-in-particular":"Anyone in particular?","anything-else-we-should-know":"Anything else we should know","application-sent":"Application sent","applied-for":"Applied for","applied-the-family-picks":"Applied — the family picks","apply-again":"Apply again","apply-to-teach":"Apply to teach","are-you-providing-the-space":"Are you providing the space?","ask-to-join":"Ask to join","ask-us-to-add-them-and":"Ask us to add them and the next booking will name them.","asked-they-will-be-in-touch":"Asked — they will be in touch","asked-we-will-come-back-to":"Asked — we will come back to you","book-this":"Book this","booking-form":"Booking form","can-come":"Can come","cancellation-and-refunds":"Cancellation and refunds","card-dates":"Dates: {dates}","card-day-at-time":"{day} at {time}","card-subject-level":"{subject} ({level})","card-total":"Total: {total}","change-photo":"Change photo","client-i-book-and-pay":"Client — I book and pay","client-pays":"Client pays","clients-cannot-see-them-the-crossed":"Clients cannot see them. The crossed-out eye below puts them back on the site.","correct-check-the-spelling":"Correct (check the spelling: ","correct-every":"Correct — every ","could-not-make-the-picture":"Could not make the picture: ","could-not-reach-the-server":"Could not reach the server","could-not-share-it-press-and":"Could not share it — press and hold the picture to save it","decline-request":"Decline request","declined-by":"Declined by ","declined-the-family-has-been-told":"Declined — the family has been told","dictation-is-not-available-in-this":"Dictation is not available in this browser.","digest_footer":"Don’t want these any more? Just reply and say so.","digest_greeting":"Hi {parent},","digest_intro":"Here’s what {child} worked on this week: {count} ({span}).","digest_subject":"{child}’s week: {count}","draw-your-answer-first":"Draw your answer first","each-seat-pays":"Each seat pays","end-it":"End it?","every-hour-they-have-ticked-is":" Every hour they have ticked is outside ","extra-seats":"Extra seats","extra-subj":"Extra subj.","fill-a-cell-first":"Fill a cell first","getting-the-photo-ready":"Getting the photo ready…","hidden-from-clients":"Hidden from clients","home-visits":"Home visits","how-many-extra-seats":"How many extra seats?","how-would-you-like-to-book":"How would you like to book?","if-there-is-an-account-with":"If there is an account with that email, a new PIN is on its way.","image-saved-link-copied":"Image saved · link copied","instant-class":"Instant class","its-a-grown-ups-email":"It's a grown-up's email","just-you":"Just you","link-copied":"Link copied","mail-apply-approved":"Good news — your application to teach with {brand} has been approved. You are listed as a tutor now: sign in to fill in your card.","mail-apply-body":"Hello {first},\n\n{said}\n\n{site}\n","mail-apply-declined":"Thank you for applying to teach with {brand}. We are not able to take your application further this time.","mail-apply-interview":"Thank you for applying to teach with {brand}. We would like to talk to you — we will be in touch to arrange a time.","mail-apply-owner-body":"{who} has applied to teach: {subjects}.\n\nRead it and say yes, interview or no in the Business column:\n\n{site}\n","mail-apply-owner-subject":"A new application to teach","mail-apply-subject":"Your application to teach","mail-attempts-kid-body":"{said}If that was {first}, \"New PIN\" on their card on your account gives them a new one at once. If it was not, tell us.","mail-attempts-own-tail":"If that was not you, reply here.","mail-attempts-said":"Somebody has tried the {brand} PIN for {who} {n} times and got it wrong.\n\nSigning in is held up for a minute, and for longer on each wrong answer after that.\n","mail-attempts-subject":"Too many sign-in attempts","mail-child-made-body":"Hello,\n\n{first} has made an account on {brand} and gave this address as their grown-up's, because they have no email of their own.\n\nTheir account works already. If that is right, open this link to confirm your address (it also puts them on your {brand} parent account if you have one and have confirmed it):\n\n{link}\n\nThey sign in with their handle, {handle}, and the PIN they chose. Once you have opened the link, \"Forgotten your PIN?\" sends a new one to this address if they forget it.\n\nIf you have an {brand} parent account on this address and have confirmed it, opening the link also puts {first} on it. If you do not know who this is, ignore this email and nothing happens.","mail-child-made-subject":"{first} has made an {brand} account","mail-confirm-body":"Hello {first},\n\nConfirm your email address by opening this link:\n\n{link}\n\nYou can already sign in with this email address{handleSaid} and the PIN you chose — the link only confirms the address is yours. Until it is opened we send nothing else to this address.\n\nIf you did not make this account, do not open the link: use \"Forgotten your PIN?\" with this address instead — it takes the account over and signs everyone else out.","mail-confirm-or-handle":" (or your handle, {handle})","mail-confirm-parent-next":"\n\nOnce you have opened the link, your child makes their own account; find their handle on Student profiles and tap Add as my child, and they say yes.","mail-confirm-subject":"Confirm your {brand} account","mail-invite-body":"Hello {first},\n\nAn account has been made for you on {brand}.\n\nSign in at {site} with your email (or your handle, @{handle}) and the PIN {pin}\n\nChange the PIN under Settings → Signing in.","mail-invite-subject":"Your {brand} account","mail-move-body":"Hello,\n\nSomebody signed in to an {brand} account has asked to use this email address for it.\n\nIf that was you, open this link on a phone or computer where you are signed in to that account:\n\n{link}\n\nUntil it is opened, the account keeps its old address — sign in with that, or with your handle. The link works for {days} days.\n\nIf it was not you, ignore this email. Nothing changes, and the link does nothing for anybody who is not signed in to that account.","mail-move-subject":"Confirm your new {brand} email address","mail-pin-body":"Somebody asked for a new PIN on your {brand} account{byHandle}.\n\nYour new PIN is {pin}\n\nSign in with {signInWith} and this PIN. It works for a day; your old PIN keeps working too until you use this one. Change it under Settings → Signing in.\n\nOr open this link to sign in with it straight away — it works even if wrong PINs have locked the account:\n\n{link}\n\nIf this was not you, do nothing — your PIN has not changed, and whoever asked cannot read this email.","mail-pin-by-handle":", by your handle ({handle})","mail-pin-kid-body":"{first}{handleSaid} has no email of their own and asked for a new PIN.\n\nThe new PIN is {pin}\n\nPass it on to them. They sign in with their handle and this PIN; it works for a day, and their old PIN keeps working until they use this one. \"New PIN\" on their card in the people column gives a fresh one at once.\n\nOr open this link on their device to sign them in as {who} straight away:\n\n{link}\n\nIf they did not ask, do nothing — nothing has changed.","mail-pin-kid-subject":"A forgotten PIN: {who}","mail-pin-subject":"Your new {brand} PIN","mail-pin-with-email":"your email","mail-pin-with-handle":"your handle, {handle}, or your email","mail-sign-off":"— {brand}","make-an-account":"Make an account","make-my-account":"Make my account","making-a-picture-of-this-booking":"Making a picture of this booking…","making-a-picture-of-this-profile":"Making a picture of this profile…","making-it":"Making it…","no-children-are-on":"No children are on ","no-connection-that-hand-is-still":"No connection — that hand is still up.","no-free-hours-this-week":"No free hours this week","no-free-hours-this-week-2":"No free hours this week.","no-preference":"No preference","no-surcharge":"No surcharge","no-tutor-yet":"No tutor yet","no-we-book-the-room":"No — we book the room","nobody-yet":"Nobody yet","nobody-yet-just-open-it":"Nobody yet — just open it","none-yet":"None yet","not-deployed":"Not deployed: ","not-enough-answered-to-price-it":"Not enough answered to price it yet.","not-listed":"Not listed","not-offered":"Not offered","not-on-the-booking-form":"Not on the booking form","not-priced-yet":"Not priced yet","not-yet-have-another-go":"Not yet — have another go","nothing-changed":"Nothing changed","nothing-here-yet":"Nothing here yet.","nothing-was-added-a-qualification-needs":"Nothing was added — a qualification needs a subject and a level.","nothing-yet":"Nothing yet","on-the-list":"On the list","on-the-list-2":"On the list — ","online-safety":"Online safety","open":"Open — ","over-what-period":"Over what period?","paste-some-text-first":"Paste some text first","pay-and-confirm":"Pay and confirm","payment-cancelled-nothing-was-charged-your":"Payment cancelled — nothing was charged. Your booking is still waiting.","per-session":"Per session","photo-ready":"Photo ready.","pick-at-least-one-first":"Pick at least one first.","picture-removed":"Picture removed","picture-saved":"Picture saved","picture-saved-link-copied":"Picture saved · link copied","pin-or-date":"Pin or date","please-add":"Please add ","press-and-hold-the-picture-to":"Press and hold the picture to save it.","press-share-to-send-it":"Press Share to send it.","put-back":"Put back","put-back-as-it-was-your":"Put back as it was — your picture too","rest-of":"Rest of ","rest-of-this":"Rest of this ","room-and-fees":"Room and fees","room-saved":"Room saved","safer-recruitment":"Safer recruitment","save-or-cancel-the-card-you":"Save or cancel the card you are editing first.","saved-a-picture-of-this-booking":"Saved a picture of this booking","saved-for-everyone":"Saved for everyone","say-who-the-account-is-for":"Say who the account is for first — a parent or a student.","send-my-application":"Send my application","session-ended":"Session ended","share-this-booking":"Share this booking","shared-by":"Shared by","shared-with-tutor":"Shared with tutor","sign-in-to-book-your-account":"Sign in to book — your account is a few screens to the right.","sign-in-to-finish-your-booking":"Sign in to finish your booking — your payment is safe.","sign-in-to-open-a-session":"Sign in to open a session","sign-in-to-send-it":"Sign in to send it","sign-in-to-send-this-booking":"Sign in to send this booking — your answers are kept.","sign-in-to-send-your-working":"Sign in to send your working","sign-in-to-suggest-a-change":"Sign in to suggest a change.","signed-out":"Signed out","signed-out-please-sign-in-again":"Signed out — please sign in again","someone-else":"Someone else","something-already-going-or-a-new":"Something already going, or a new one?","something-went-wrong":"Something went wrong: ","something-went-wrong-there":"Something went wrong there.","start-a-new-one":"Start a new one","stripe-did-not-give-us-a":"Stripe did not give us a payment page.","student-im-learning":"Student — I'm learning","take-a-photo-of-your-working":"Take a photo of your working first","take-a-seat":"Take a seat","tap-to-choose":"Tap to choose","that-account-has-no-id-yet":"That account has no id yet — ask us.","that-class-has-gone":"That class has gone.","that-did-not-work":"That did not work.","that-did-not-work-everything-else":"That did not work. Everything else still works.","that-is-not-a-picture-take":"That is not a picture. Take a photo of the document.","that-is-the-most-this-card":"That is the most this card holds — 10 qualifications in all.","that-room-is-booked-every-hour":"That room is booked every hour.","that-session-is-not-in-this":"That session is not in this list any more","the-answers-are-still-on-their":"The answers are still on their way — a moment.","the-board-is-full-clear-it":"The board is full. Clear it to carry on.","the-phone-could-not-read-that":"The phone could not read that photo. Try another.","the-reply-was-not-valid-json":"The reply was not valid JSON (HTTP ","the-room":"The room","the-tutor-was-not-told-no":"The tutor was not told — no connection. Your card is still red.","there-is-no-booking-on-screen":"There is no booking on screen to share","there-is-nothing-to-share-on":"There is nothing to share on this card yet","they-tick-them-in-settings-under":" They tick them in Settings, under their week.","they-ticked-tutor-in-their-settings":"They ticked Tutor in their settings. Until you list them they are not on the site, cannot be booked and cannot take a session — the crossed-out eye below approves them.","this-booking-as-a-picture":"This booking, as a picture","this-browser-is-not-saving-what":"This browser is not saving what you type — leaving the page would lose it.","this-session-is-no-longer-yours":"This session is no longer yours.","turn-it-down":"Turn it down?","tutor-earns":"Tutor earns","type-the-letter":"Type the letter","type-the-letters-in-order-e":"Type the letters in order, e.g. B, A, C","type-your-email-address-or-your":"Type your email address or your handle first.","type-your-name-username-or-email":"Type your name, @username or email first.","video-removed":"Video removed","video-saved":"Video saved","waiting-for":"Waiting for ","waiting-list-class":"Waiting list class","watch-intro":"Watch intro","we-email-a-link-to-open":"We email a link to open. Then sign in with your handle or email and the PIN. A parent ","we-email-you-a-link-to":"We email you a link to open. Once you have opened it, find your child's handle on Student profiles ","we-would-like-to-talk-to":"We would like to talk to you about teaching — we will be in touch to arrange it.","what-are-we-working-on":"What are we working on?","what-level-the-highest-among-the":"What level? (the highest among the children)","when-could-you-come":"When could you come?","when-free":"When free","which-of-your-children-is-this":"Which of your children is this for?","who-is-in-it":"Who is in it","who-is-this-for":"Who is this for?","withdraw-from-this":"Withdraw from this","write-something-first":"Write something first","write-the":"Write the ","write-the-note-first":"Write the note first.","yes-no-room-hire":"Yes — no room hire","you-earn":"You earn","your-answer":"Your answer","your-answers-in-order":"Your answers, in order","your-application-to-teach-is-with":"Your application to teach is with us. We will be in touch.","your-application-to-teach-was-approved":"Your application to teach was approved.","your-application-to-teach-was-not":"Your application to teach was not taken further this time. You can apply again.","your-booking":"Your booking","your-first-and-last-name-please":"Your first and last name, please.","your-picture-is-still-saving-cancel":"Your picture is still saving — Cancel once it has.","your-seat":"Your seat","your-sessions":"Your sessions","err-not-signed-in":"Not signed in.","err-sign-in-first":"Sign in first.","err-busy":"Busy — try again in a moment.","err-person-not-found":"Person not found.","err-not-authorised":"Not authorised.","err-sign-in-again":"Please sign in again.","err-no-account":"We could not find your account.","err-job-not-found":"Job not found.","err-not-found":"Not found.","doesnt-matter":"Doesn't matter","err-no-column-admin":"The sheet has no column for: {cols}. Open the site once as an admin to add it — nothing was saved.","err-no-column-setup":"The sheet has no column for: {cols}. Run ?setup=1 — nothing was saved.","err-which-venue":"Which venue?","err-venue-no-price":"That venue has no price set for a shared session yet.","err-not-a-picture":"That is not a picture. Choose a photo from your phone.","err-picture-too-big":"That picture is too big. Try a smaller one.","err-no-such-person":"No such person.","err-no-session":"No session with that id.","err-no-free-handle":"No free handle could be made just now. Nothing was saved — try again.","err-email-on-many":"That email address is on more than one account — ask us to sort it out.","err-no-such-email":"No account has that email address.","err-no-that-person":"We could not find that person.","err-no-that-account":"We could not find that account.","err-needs-title":"It needs a title. Nothing was saved.","err-busy-press":"Busy — press it again in a moment.","err-busy-resend":"Busy — it will be sent again.","err-no-people-tab":"no people tab","err-not-in-session":"You're not part of this session.","dk-eink-sign-in":"Sign in","dk-say-now":"{name}: {first} next, {left} left.","dk-say-over":"{name}: all done.","dk-say-ticked":"Ticked {title}.","dk-say-added":"Added {title} to {name}.","dk-say-no-match":"Didn't find '{what}'.","dk-say-already":"{title} already done.","dk-say-and":"and","dk-overdue":"Overdue","dk-all-done":"All done.","dk-from":"from {at}","dk-not-week":"not this week","dk-before":"Goes before (names, commas; meal = every meal)","dk-missed":"Missed — new date?","dk-say-what":"Say what, after what=.","dk-addr-head":"Your private address","dk-addr-say":"Siri Shortcuts, ChatGPT or Gemini can read this address for what is next on your Docket. Add &do=done&what=shower to tick, &do=add&what=milk to add. Keep it secret; a new one stops the old one working.","dk-addr-new":"Make a new address","dk-addr-show":"Private address","err-docket-token":"That is not your docket address.","err-docket-owner":"Docket is the owner's alone.","err-docket-saved":"That was not saved — try again.","save":"Save","saved":"Saved","not-saved":"Not saved","try-again":"Try again","not-saved-try-again":"Not saved — try again.","too-many-wrong-pins-try-again-in":"Too many wrong PINs. Try again in ","could-not-save-the-picture":"Could not save the picture. ","bundle":"Bundle","game":"Game","kit":"Kit","equipment":"Equipment","stationery":"Stationery","consumable":"Consumable","made-to-order":"Made to order","thing":"Thing","trip":"Trip","buy":"Buy","earn-with-ticks":"Earn with ticks","unlock-by-level":"Unlock by level","borrow":"Borrow","given-out":"Given out","front-recto":"Front (recto)","back-verso":"Back (verso)","manuscript":"Manuscript","author":"Author","figure":"Figure","writing":"Writing","event":"Event","manuscripts":"Manuscripts","events":"Events","writings":"Writings","people":"People","deuterocanon":"Deuterocanon","battle-of-the-little-giants":"Battle of the Little Giants","st-valentine-s-day-massacre":"St Valentine's Day Massacre","wbss-final":"WBSS Final","c-1147-bc-ramesses-v":"c. 1147 BC, Ramesses V","number-plate-interior-bulbs":"Number plate & interior bulbs","national-archives":"National Archives","years-teaching":"years teaching","video-link":"video link","will-travel-km":"will travel (km)","favourite-colour":"favourite colour","venues-you-teach-at":"venues you teach at","your-manager":"your manager","where-you-teach":"Where you teach","about-you-as-a-tutor":"About you as a tutor","name":"name","openclass":"openClass","title":"title","label":"label","staff":"Staff","areas-you-teach-in":"Areas you teach in","one-line-about-you-30":"one line about you (30 characters)","extra-seat-share-of-your":"extra seat: share of your rate, 0–1 (0.5 = half)","family-s-share-of-an":"@family.'s share of an extra seat, 0–2 (blank = the usual)","venues":"Venues","subjects":"Subjects","levels":"Levels","receipts":"Receipts","booking":"Booking","questions":"Questions","answers":"Answers","margin-gap-px-0-4px":"margin:{gap}px 0 4px;font-size:{small}px;color:{faint}","practicals":"Practicals","projects":"Projects","library":"Library","inserts":"Inserts","specification":"Specification","timeline":"Timeline","symbol":"Symbol","atomic-number":"Atomic number","relative-atomic-mass":"Relative atomic mass","block":"Block","electron-configuration":"Electron configuration","discovered":"Discovered","also-called":"Also called","formula":"Formula","use":"Use","hazard":"Hazard","pattern":"Pattern","conditions":"Conditions","observations":"Observations","tools":"Tools","docket":"Docket","term-dates":"Term dates","title-2":"Title","place":"Place","date":"Date","time":"Time","the-time-is":"The time is","repeats":"Repeats","note":"Note","coming-soon":"Coming soon","profiles":"Profiles","role":"Role","date-of-birth-optional":"Date of birth (optional)","parents":"Parents","their-parent-optional":"Their parent (optional)","handle-theirs-to-change":"handle (theirs to change)","date-of-birth":"date of birth","pin":"PIN","you":"You","full-name":"full name","phone":"phone","email":"email","home-address":"home address","postcode":"postcode","documents":"Documents","photo-id-passport-or-driving":"photo ID — passport or driving licence","right-to-work-in-the":"right to work in the UK","right-to-work-document-passport":"right-to-work document — passport, share code or visa","what-you-teach":"What you teach","qualifications-degrees-teaching-qualifications-anything":"qualifications — degrees, teaching qualifications, anything relevant","a-qualification-certificate":"a qualification certificate","another-qualification-certificate-optional":"another qualification certificate (optional)","hourly-rate":"hourly rate (£)","checks":"Checks","enhanced-dbs-certificate-number":"enhanced DBS certificate number","issued-on":"issued on","i-consent-to-you-checking":"I consent to you checking it on the DBS Update Service","i-need-a-dbs-check":"I need a DBS check","when-and-where":"When and where","when-you-can-teach":"when you can teach","area-and-venues-you-can":"area and venues you can reach","experience":"experience","2-references":"2 references","relationship-to-you":"relationship to you","a-short-statement-why-you":"a short statement — why you want to teach","cv-link-optional":"CV link (optional)","i-agree-to-family-keeping":"I agree to @family. keeping these details and documents privately to consider my application, contacting my referees and checking my DBS.","who-is-the-account-for":"Who is the account for?","whose-email-will-you-give":"Whose email will you give?","pin-4-digits":"PIN — 4 digits","your-username-or-email":"Your username or email","current-pin":"current PIN","new-pin-4-numbers-not":"new PIN, 4 numbers, not 1234","new-pin-again":"new PIN again","settings":"Settings","kids-settings":"Kids settings","parent-settings":"Parent settings","tutor-settings":"Tutor settings","apprentice-settings":"Apprentice settings","biz-settings":"Biz settings","web-settings":"Web settings","signed-in":"Signed in","signing-in":"Signing in","your-role":"Your role","notifications":"Notifications","reading-aloud":"Reading aloud","work-on-file":"Work on file","progress":"Progress","brownie-points":"Brownie points","roadmap":"Roadmap","code-of-conduct":"Code of conduct","progress-sessions":"Progress: sessions","lego-piece-check":"LEGO piece check","staff-hub":"Staff hub","card-template":"Card template","needs-help":"Needs help","add-a-student":"Add a student","find-by-handle":"Find by handle","you-and-your-family-students":"You and your family (students)","manage-your-child":"Manage your child","every-student":"Every student","add-a-parent":"Add a parent","your-card-parent-profiles":"Your card (Parent profiles)","you-and-your-family-parents":"You and your family (parents)","parent-claims":"Parent claims","every-parent":"Every parent","stability":"Stability","rename-every-username":"Rename every username","build":"Build","things":"Things","shop":"Shop","partners":"Partners","who-their-person-id":"Who (their person id)","business":"Business","what-we-could-do-together":"What we could do together","terms":"Terms / %","status":"Status","food":"Food","name-2":"Name","price":"Price (£)","minutes-to-make":"Minutes to make","meal":"Meal","how":"How","tasks":"Tasks","done":"Done","notes":"Notes","archive":"Archive","archive-fields":"Fields, one a line (Card number: …)","archive-text":"Text","due":"Due","repeat":"Repeat","list":"List","person-id":"Person (id)","booking-id":"Booking (id)","item-id":"Item (id)","drive":"Drive","folder-id":"Folder id","what-goes-there":"What goes there","week":"Week","timetable":"Timetable","who":"Who","person-id-if-they-have":"Person id (if they have a file)","where":"Where","address":"Address","days-e-g-mon-fri":"Days (e.g. Mon-Fri, Mon)","start-hh-mm":"Start (HH:MM)","end-hh-mm":"End (HH:MM)","term":"Term","foods":"Foods","subject-or-module":"Subject or module","what-it-is":"What it is","how-much-a-number":"How much (a number)","of-what":"Of what","due-time":"Due time","of-the-grade":"% of the grade","mark":"Mark","link":"Link","car-or-car-part":"Car or car part?","brand":"Brand","model":"Model","generation":"Generation","phase":"Phase","market":"Market","years-made":"Years made","engine-size":"Engine size","valves":"Valves","version":"Version","fuel":"Fuel","part":"Part","price-band":"Price band","part-type":"Part type","socket-or-form-factor":"Socket or form factor","interface":"Interface","connects-to":"Connects to","what-sort":"What sort","system":"System","engine":"Engine","chemical-type":"Chemical type","group":"Group","period":"Period","state":"State","what-for":"What for","what-kind":"What kind","which":"Which","which-tool":"Which tool","religion":"Religion","work":"Work","source-text":"Source text","language":"Language","translation-or-edition":"Translation or edition","collection":"Collection","section":"Section","book":"Book","chapter":"Chapter","unit":"Unit","primary-or-secondary-source":"Primary or secondary source","kind-of-writing":"Kind of writing","shelf":"Shelf","subject":"Subject","fighter":"Fighter","decade":"Decade","division":"Division","round":"Round","result":"Result","winner":"Winner","required":"Required","level":"Level","key-stage":"Key stage","school-year":"School year","grade":"Grade","topic":"Topic","exam-board":"Exam board","exam-topic":"Exam topic","exam-sub-topic":"Exam sub-topic","tier":"Tier","year":"Year","month":"Month","day":"Day","paper":"Paper","paper-section":"Paper section","question":"Question","sub-part":"Sub-part","marks":"Marks","calculator":"Calculator","what-you-need":"What you need","source":"Source","answer-checked":"Answer checked","status-untried":"Unattempted","status-right":"Correct","status-part":"Part correct","status-wrong":"Incorrect","status-attempted":"Attempted","answer-hidden-say":"The answer is hidden","which-part":"Which part","era":"Era","material":"Material","format":"Format","years":"Years","from":"From","held-at":"Held at","found":"Found","dated":"Dated","side":"Side","theatre":"Theatre","who-for":"Who for","when":"When","who-with":"Who with","area":"Area","good-for":"Good for","holds":"Holds","sign-in-first":"Sign in first.","sign-in-first-2":"Sign in first.","your-result":"Result","your-attempt":"Attempted"};
/* WORDS:END */
/* ONE WORDS FILE (foundation 3): every label, button, message and caption is a key in data/settings/words.json.
   `text_(key)`; `{name}` in a word is filled from `vars`. A key that is missing reads as itself, so a gap shows. */
function text_(key, vars) {
  const w = WORDS_FILE[key];
  const s = typeof w === 'string' ? w : key;
  return vars ? s.replace(/\{(\w+)\}/g, (all, k) => (vars[k] == null ? all : String(vars[k]))) : s;
}

/* THE RULES. Carried over whole. § */

/* The small things everything above leans on. § */

const norm = s => String(s || '').toLowerCase().trim();

/* EVERY FILE OF OUR OWN IS ASKED FOR WITH THE DEPLOY'S STAMP (546): the browser keeps an exact URL for a while, */
/* so an unstamped one would never refresh after a deploy. `check-cache.js` holds every fetch to it. */
const deployStamp_ = () => (window.LOAD ? '?t=' + window.LOAD : '');


const esc = s  => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* A ROW: A LABEL ON THE LEFT, A VALUE ON THE RIGHT § */
const row = (label, value, extra) => {
  const v = String(value == null ? '' : value);
  /* MONEY, A COUNT, A DATE, A PERCENTAGE — anything whose characters want to line up under one another. § */
  const looksNumeric = /^[£$€]?[\d.,\s—–-]+%?$/.test(v.trim()) || /^\d/.test(v.trim());
  const cls = ['v', looksNumeric ? 'mono' : '', extra || ''].filter(Boolean).join(' ');
  return rowOf_('row', label, { look: cls, text: v });
};
/* THE ROW'S PARTS AS DATA, drawn by the one card maker's group block: a label span (none when `label` is false), then the value span. */
const rowOf_ = (rowCls, label, v) => cardBlock_({ type: 'group', look: rowCls, blocks: [
  label === false ? null : { type: 'group', tag: 'span', look: 'k', text: label == null ? '' : String(label) },
  Object.assign({ type: 'group', tag: 'span' }, v)] });


/* ---------- THE TWO SHAPES THE FIRST TWO COULD NOT MAKE § */



function bookableSpaces() {
  const out = [];
  (DATA.venues || []).forEach(v => {
    if (v.rooms && v.rooms.length) {
      v.rooms.forEach(r => out.push({
        label: v.title + ' \u2014 ' + r.name, venue: v.title, room: r.name,
        rate: r.rate, concession: r.concession, min: r.min, max: r.max, image: v.image,
        avail: r.avail, busy: r.busy || {}, rowIndex: r.rowIndex, fields: r.fields,
        minHours: v.minHours, maxHours: v.maxHours, takesAllSeats: !!v.takesAllSeats
      }));
    } else {
      out.push({ label: v.title, venue: v.title, room: '',
                 rate: Number(v.bestRate) || 0, concession: 0,
                 min: v.minCapacity || 1, max: v.maxCapacity, image: v.image,
                 avail: v.avail, minHours: v.minHours, maxHours: v.maxHours,
                 takesAllSeats: !!v.takesAllSeats });
    }
  });
  return out;
}


/* ---------- THE DAYS NOBODY IS TAUGHT, AS A LOOKUP § */
let CLOSED_ = { of: null, at: {} };
function closedOn_(d) {
  const list = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.closures)) ? DATA.closures : [];
  if (CLOSED_.of !== list) {
    const at = {};
    list.forEach(c => { const x = parseDMY(c && c.date); if (x) at[x.getTime()] = c; });
    CLOSED_ = { of: list, at };
  }
  const k = new Date(d); k.setHours(0, 0, 0, 0);
  return CLOSED_.at[k.getTime()] || null;
}

/* ---------- AND THE WEEKS THEY FALL IN STILL COUNT AS WEEKS § */
function computeSessionDates(dayName, endDateStr, startDateStr) {
  const DAYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const target = DAYS.indexOf(String(dayName||'').toLowerCase().replace(/s$/,''));
  const end = parseDMY(endDateStr);
  if (target < 0 || !end) return [];
  const today = new Date(); today.setHours(0,0,0,0);
  const winStart = parseDMY(startDateStr);
  const d = (winStart && winStart > today) ? new Date(winStart) : new Date(today);
  while (d.getDay() !== target) d.setDate(d.getDate()+1);
  const out = [];
  while (d <= end && out.length < 60) {
    if (!closedOn_(d)) out.push(new Date(d));
    d.setDate(d.getDate()+7);
  }
  return out;
}


/* FORMATS (owner, 8 Nov): one helper each, and check-format fails on a hand-formatted value. Times are 24-hour: 16:00. */
const fmtTime_ = t => {
  if (t instanceof Date || typeof t === 'number') { const d = new Date(t); return isNaN(d) ? '' : String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  const s = String(t ?? '').trim();
  if (!s) return '';
  /* A BARE HOUR ("9", a sheet's 16) IS THAT HOUR ON THE DOT. */
  if (/^\d{1,2}$/.test(s)) return s.padStart(2, '0') + ':00';
  let h, min;
  const m = s.match(/(\d{1,2}):(\d{2})\s*([ap]m)?/i);
  const a = m ? null : s.match(/^(\d{1,2})\s*([ap]m)$/i);
  if (m) { h = +m[1]; min = +m[2]; if (m[3]) h = h % 12 + (/p/i.test(m[3]) ? 12 : 0); }
  else if (a) { h = +a[1] % 12 + (/p/i.test(a[2]) ? 12 : 0); min = 0; }
  else { const d = new Date(s); if (isNaN(d)) return s; h = d.getHours(); min = d.getMinutes(); }
  return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
};
/* A VALUE THAT IS MISSING READS "—" (owner 65a, 9 Nov), the one way; 0 is a value and shows. */
/* A CANVAS PAINTS IN THE THEME'S OWN TOKENS (owner, 10 Nov): `token_('--bg', 'black')`; the keyword is only for a page whose css never came. */
function token_(name, or) {
  try { return String(getComputedStyle(document.documentElement).getPropertyValue(name) || '').trim() || or; } catch (e) { return or; }
}
const dash_ = v => (v === undefined || v === null || String(v).trim() === '' ? '—' : v);
/* A whole-hour span, 24-hour: 09:00–10:00. */
const fmtHours_ = (a, b) => fmtTime_(a + ':00') + '–' + fmtTime_(b + ':00');
/* ONE PLURAL (job R, 21 Nov): the word for n of a thing, `many` for an irregular (copy, copies); tools/one-plural.js keeps it the only one. */
const plural_ = (n, one, many) => (n === 1 ? one : many || one + 's');
/* Money always with pence: £12.00, and a minus sign before the pound. */
/* ONE FORMATTER FOR MONEY (foundation 3): `fmtMoney_(n)` £12.00; `fmtMoney_(n, 'hour')` £12.00/h. A price shown at all is the caller's may_('prices'). */
function fmtMoney_(n, style) {
  const v = Number(n) || 0, m = (v < 0 ? '−' : '') + '£' + Math.abs(v).toFixed(2);
  return style === 'hour' ? m + '/h' : m;
}
/* Days of the week, short, Monday first: Mon Tue Wed Thu Fri Sat Sun. */
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const fmtDay_ = v => {
  if (v instanceof Date) return isNaN(v) ? '' : DAYS_SHORT[(v.getDay() + 6) % 7];
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v ?? '').trim());
  if (iso) return fmtDay_(new Date(+iso[1], +iso[2] - 1, +iso[3]));
  const s = String(v ?? '').trim().toLowerCase();
  const pre = { m: 0, tu: 1, w: 2, th: 3, f: 4, sa: 5, su: 6 };
  if (s in pre) return DAYS_SHORT[pre[s]];
  const i = DAYS_SHORT.findIndex(d => s.slice(0, 3) === d.toLowerCase());
  return i === -1 ? String(v ?? '') : DAYS_SHORT[i];
};


/* THE ROLES ARE settings.json `roles` (owner, 17 Nov): ROLES_, ROLE_IDS, ROLE_ALIASES, RANKS and rankTier_ are the SHARED block's (data/settings/roles.js). */
const roleAliases_ = () => { try { return (DATA && DATA.roleAliases) || ROLE_ALIASES; } catch (e) { return ROLE_ALIASES; } };

const roleOf = r => roleAliases_()[norm(r)] || norm(r);


/* `u` IS WHOSE ROLES: the viewer by default; a settings card passes `whose_()` (the admin's lens, data-who.js). */
const heldRoles = (u = USER) => (u && (u.roles || [u.role]) || []).map(x => String(x).toLowerCase());


const hasRole = (r, u = USER) => heldRoles(u).some(h => roleOf(h) === roleOf(r));


const uniq = arr => [...new Set((arr||[]).filter(Boolean))];


const hashOf = str => {                       // FNV-1a: small, fast, well-spread
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};


/* ONE DATE READER, ONE TODAY, ONE TIME ZONE (owner, 20 Nov; tools/date-cases.js holds both copies to one table).
   `dateOf_(v)` reads a Date, ms, DD/MM/YY(YY), ISO yyyy-mm-dd and either with a time; day first, never month first, so
   25/10/26 is 25 October and 10/25/26 is nothing. A day that does not exist is null, never rolled on. By default the day
   at local midnight; `keepTime` keeps the clock. An ISO stamp with Z or an offset is that instant. */
function dateOf_(v, keepTime) {
  if (v == null || v === '') return null;
  let d = null;
  if (v instanceof Date) d = new Date(v.getTime());
  else if (typeof v === 'number') d = v > 0 ? new Date(v) : null;
  else {
    const t = String(v).trim();
    const at = (y, mo, da, h, mi, se) => {
      const x = new Date(y, mo - 1, da, +(h || 0), +(mi || 0), +(se || 0));
      return x.getFullYear() === y && x.getMonth() === mo - 1 && x.getDate() === da ? x : null;
    };
    const iso = t.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/i);
    const dmy = t.match(/^(?:[A-Za-z]+,?\s+)?(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2}|\d{4})(?:[\s,T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    /* A day written inside other words ("25/10/2026 (half term)"); never the tail of an ISO date, which once read 2026-10-25 as 26/10/25. */
    const loose = !iso && !dmy && t.match(/(?:^|[^\d\/\-.])(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4}|\d{2})(?![\d\/\-.])/);
    if (iso && iso[7]) d = new Date(t);
    else if (iso) d = at(+iso[1], +iso[2], +iso[3], iso[4], iso[5], iso[6]);
    else if (dmy) d = at(dmy[3].length === 2 ? 2000 + (+dmy[3]) : +dmy[3], +dmy[2], +dmy[1], dmy[4], dmy[5], dmy[6]);
    else if (loose) d = at(loose[3].length === 2 ? 2000 + (+loose[3]) : +loose[3], +loose[2], +loose[1]);
    else if (!/[A-Za-z]/.test(t)) d = null;            // digits we cannot read day-first: never new Date()'s month-first guess
    else d = new Date(t);                              // a sheet's Date as text ("Sun Oct 25 2026 …"), "25 Oct 2026"
  }
  if (!d || isNaN(d)) return null;
  if (!keepTime) d.setHours(0, 0, 0, 0);
  return d;
}
/* The site's one time zone, data/settings/settings.json `tz`; read when asked, so the backend's file order never matters. */
const tz_ = () => SHARED_SETTINGS.tz;
/* yyyy-mm-dd of that instant (now when none) in the one time zone: the day on a London wall, whatever the machine's clock says. */
function todayIso_(at) {
  const d = at == null ? new Date() : (at instanceof Date ? at : new Date(at));
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz_(), year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
/* The old name, kept for its callers (core-price.js, book-*.js, booking.gs `P.parseDMY`). */
function parseDMY(s) { return dateOf_(s); }


/* Dates always DD/MM/YY (08/11/26), from a Date, ms, ISO or an already-British string. */
const fmtDmy_ = v => {
  if (v instanceof Date || typeof v === 'number') { const d = new Date(v); return isNaN(d) ? '' : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`; }
  const s = String(v ?? '').trim();
  if (!s) return '';
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) return `${iso[3].padStart(2,'0')}/${iso[2].padStart(2,'0')}/${iso[1].slice(-2)}`;
  const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);   // already DD/MM/YYYY
  if (m) { const y = m[3].slice(-2); return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${y}`; }
  const d = new Date(s);
  return isNaN(d) ? s : fmtDmy_(d);
};
/* ONE FORMATTER FOR DATES AND TIMES (foundation 3): `fmtDate_(v)` 08/11/26; style 'time' 16:00, 'day' Mon,
   'hours' 09:00–10:00 (v and `b` whole hours). The four pieces above are its parts, used by nothing else. */
function fmtDate_(v, style, b) {
  if (style === 'time') return fmtTime_(v);
  if (style === 'day') return fmtDay_(v);
  if (style === 'hours') return fmtHours_(v, b);
  return fmtDmy_(v);
}


function num(raw) {
  if (typeof raw === 'number') return raw;
  const t = String(raw == null ? '' : raw).trim().replace(/[£$,\s]/g, '');
  if (!t) return NaN;
  const frac = t.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
  if (frac) { const den = parseFloat(frac[2]); return den === 0 ? NaN : parseFloat(frac[1]) / den; }
  if (t.endsWith('%')) { const p = parseFloat(t); return isNaN(p) ? NaN : p / 100; }
  return parseFloat(t);
}


function spaceFor(label) {
  const want = norm(label);
  const all = bookableSpaces();
  /* An older saved "At home" answer is the venue row marked `takes_all_seats`, found by its field. */
  if (want === norm('At home')) return all.find(x => x.takesAllSeats) || null;
  return all.find(x => norm(x.label) === want) || null;
}


/* A VENUE WHOSE ROW SAYS `takes_all_seats` (owner, 8 Nov: the client's house): a field, never a name — same as `takesAllSeats_` in booking.gs. */
function takesAllSeats_(loc) {
  const want = norm(loc || '');
  if (!want) return false;
  const sp = spaceFor(loc);
  if (sp) return !!sp.takesAllSeats;
  const v = (DATA.venues || []).find(x => norm(x.title) === want);
  return !!(v && v.takesAllSeats);
}

function isHome(loc) {
  const name = String(loc || '');
  if (takesAllSeats_(name)) return true;
  /* A CHILD IS SENT NO RATES (398), so "no rate" is not "a home" to her phone. */
  if (!may_('prices')) return false;
  const sp = (typeof spaceFor === 'function') ? spaceFor(name) : null;
  if (sp) return !(Number(sp.rate) > 0);
  const v = (DATA.venues || []).find(x => norm(x.title) === norm(name));
  return !!v && !(Number(v.bestRate) > 0);
}


/* ---------- AND A THIRD THING BOUNDS A SEAT COUNT: WHERE THE SESSION IS § */
function seatLimits(space, tutor, loc) {
  const v = (DATA.constants || {}).vars || {};
  const houseMax = Number(v.max_students_per_job) || 0;

  let max = 99, min = 1;
  const why = { max: '', min: '' };
  const capMax = (n, reason) => { if (n > 0 && n < max) { max = n; why.max = reason; } };
  const capMin = (n, reason) => { if (n > 0 && n > min) { min = n; why.min = reason; } };

  /* HOME AND ONLINE ARE VENUE ROWS LIKE ANY OTHER (owner, 8 Nov): their seats come from the row. */
  if (!space && loc) space = spaceFor(loc);
  if (space) { capMax(Number(space.max), space.label || 'this venue');
                    capMin(Number(space.min), space.label || 'this venue'); }
  /* MAX SEATS = THE SMALLER OF TUTOR AND PLACE (owner, 7 Nov); "No preference" has no tutor row, so the place alone. */
  /* A TUTOR WITH NO CAPACITY SET HOLDS 1 SEAT (owner, 7 Nov). */
  if (tutor)  { capMax(Number(tutor.maxStudents) || 1, tutor.title);
                capMin(Number(tutor.minStudents), tutor.title); }
  capMax(houseMax, 'your limit');
  /* AT HOME THE BOOKING TAKES EVERY SEAT THE TUTOR HOLDS (owner, 8 Nov): the floor is the cap, priced for all. */
  if (loc && takesAllSeats_(loc)) { min = max; why.min = 'a home session'; }
  if (min > max) min = max;

  return { max, min, why };
}


/* THE EIGHT THAT WERE NEVER CARRIED OVER. § */

/* One word for "nothing chosen yet", everywhere. The form had four — "Choose ⌄", "All Levels", an
   empty option and "No preference" — which read as four different states rather than one. */
const NONE_LABEL = '\u2014\u2014\u2014';

/** The value of an input by id, or ''. Reads a control that may not be on screen without throwing. */
const val = id => ($(id) || {}).value || '';

/* Who takes part in the checklist and the arcade: students, tutors and admins. A parent has no
   topics to tick and no score to keep. */

/* An admin is a tutor with extra powers, so everywhere gated on "tutor" admits an admin too. § */
/* AND NOT A TUTOR WHO HAS ONLY TICKED THE BOX. § */
const tutorHeld_ = () => hasRole('tutor');

/* ---------- ONE RANK PER ACCOUNT (400): student < client < staff < admin, as `rankOf` (people.gs) ----------
   The server's word when the sign-in reply carried one; worked out from the roles for a copy kept before it did. */
const rank_ = (u = USER) => {
  if (!u) return '';
  if (RANKS.indexOf(String(u.rank || '')) !== -1) return u.rank;
  const id = ROLE_IDS.find(r => hasRole(r, u) && !(ROLES_.ids[r].pending && u.tutorPending)) || ROLES_.default;
  return ROLES_.ids[id].rank;
};
/* AT LEAST THIS RANK; nobody signed in holds none. `u` as `heldRoles`. */
const rankAtLeast_ = (want, u = USER) => !!u && RANKS.indexOf(rank_(u)) >= RANKS.indexOf(want);

/* ---------- A CHILD IS SHOWN NO PRICE (398) — the owner: "Kids' profiles shouldn't be able to see tutors' prices." */
/* Asked as `!may_('prices')` (data-who.js), the phone's half of `whoMay_(row, 'prices')` (people.gs). */
/* WHAT SHE IS TOLD WHERE A PRICE OR A PAY BUTTON WOULD BE — the backend's `KID_ASK_PARENT` says the same. */
const KID_ASK_PARENT = 'A parent books and pays for sessions — ask yours to book this one.';


/* WHETHER A LEVEL HAS ACTUALLY BEEN PRICED, which `levelMult` cannot say — it answers 1 for a level set to 1 on purpose and 1 for a level nobody has ever § */
function levelPriced(name) {
  const t = (DATA.multipliers || {}).levels || {};
  return Object.prototype.hasOwnProperty.call(t, name) && String(t[name]).trim() !== '';
}



/* ---------- ONE PERSON ROW, ONE TUTOR CARD (owner, 17 Nov): the server's `tutorOut_` and the site's `cardPatchTutor_` both read a row by this. */
/* Copied to the backend by tools/cards-gen.js. A row is the sheet's (`jobs` JSON, `photos` piped) or the form's (`job_N_*`, `photos_N`). */
function ageRank_(v) {
  const s = String(v ?? '').trim();
  if (!s) return null;
  if (/^adults?$/i.test(s) || /^18\s*\+$/.test(s)) return Infinity;
  if (!/^\d{1,3}$/.test(s)) return NaN;
  return Number(s) || null;
}
function ageOut_(v) {
  const n = ageRank_(v);
  return n === Infinity ? 'Adults' : (n == null || isNaN(n)) ? '' : n;
}
function tutorCardOf_(r, max) {
  const S = v => String(v ?? '').trim();
  const N = v => { const x = parseFloat(String(v ?? '').replace(/[£$,\s]/g, '')); return isNaN(x) ? 0 : x; };
  const m = max || {}, keys = Object.keys(r || {});
  let jobs = [];
  if ('jobs' in r) { try { jobs = JSON.parse(S(r.jobs) || '[]'); } catch (err) { jobs = []; } }
  else jobs = keys.map(k => (/^job_(\d+)_role$/.exec(k) || [])[1]).filter(Boolean).sort((a, b) => a - b)
    .map(n => ({ role: r['job_' + n + '_role'], where: r['job_' + n + '_where'], from: r['job_' + n + '_from'], to: r['job_' + n + '_to'] }));
  const face = S(r.photo);
  const photos = 'photos' in r ? S(r.photos).split('|')
    : keys.filter(k => /^photos_\d+$/.test(k)).sort((a, b) => a.slice(7) - b.slice(7)).map(k => r[k]);
  return {
    image: S(r.photo), mediaUrl: S(r.video), videoFile: S(r.video_file),
    jobs: (Array.isArray(jobs) ? jobs : []).map(o => ({ role: S((o || {}).role), where: S((o || {}).where), from: S((o || {}).from), to: S((o || {}).to) }))
      .filter(o => o.role || o.where).slice(0, m.jobs || Infinity),
    /* THE OTHER PHOTOGRAPHS, links only, without the face. */
    photos: photos.map(S).filter((v, i, all) => /^https?:\/\//i.test(v) && v !== face && all.indexOf(v) === i).slice(0, m.photos || Infinity),
    tags: [r.adjective_1, r.adjective_2, r.adjective_3].map(S).filter(Boolean),
    /* THE HEADLINE IN QUOTATION MARKS (owner, 17 Nov), added once here, never doubled. */
    description: S(r.headline) ? '“' + S(r.headline).replace(/^["“”']+|["“”']+$/g, '') + '”' : '',
    /* THE ONE PLACE A CARD SAYS (owner, 18 Nov): their town, not the venues they picked. */
    town: S(r.town),
    rate: N(r.rate_per_hour),
    yrsExp: S(r.years_experience),
    /* 0 means "no limit set"; blank means "no view", and the smallest real booking is one student for one hour. */
    minStudents: N(r.min_students) || 1, maxStudents: N(r.max_students),
    minHours: N(r.min_hours) || 1, maxHours: N(r.max_hours),
    ageMin: ageOut_(r.age_min), ageMax: ageOut_(r.age_max),
    extraSeat: N(r.extra_seat_rate)
  };
}
