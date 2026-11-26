/* js/core.js */
const SHARED_SETTINGS = {"tz":"Europe/London","days":[["m","Monday"],["tu","Tuesday"],["w","Wednesday"],["th","Thursday"],["f","Friday"],["sa","Saturday"],["su","Sunday"]],"hours":[9,10,11,12,13,14,15,16,17,18,19,20],"roles":{"ids":{"admin":{"label":"Admin","aliases":["administrator"],"rank":"admin","tier":"admin","self":false},"tutor":{"label":"Tutor","aliases":["teacher"],"rank":"staff","tier":"member","self":true,"pending":true},"client":{"label":"Client","aliases":["parent","guardian"],"app":"parent","rank":"client","tier":"member","self":true},"student":{"label":"Student","aliases":["kid","child","pupil"],"app":"kid","rank":"student","tier":"child","self":true},"contact":{"label":"Contact","aliases":[],"rank":"contact","tier":"anyone","self":false,"signIn":false}},"default":"client","guest":{"rank":"out","tier":"anyone"},"ranks":["contact","student","client","staff","admin"],"tiers":["anyone","member","child","admin"],"titles":{"head of boxing":"Head of Boxing","coach":"Coach"},"may":{"admin":{"tiers":["admin"]},"owner":{"tiers":["admin"],"owner":true},"prices":{"notTiers":["child"]},"staff":{"rank":"staff"},"signedIn":{"notTiers":["anyone"]},"grownUp":{"tiers":["member","admin"]}},"see":{"roles":["child","family","tutor","admin"],"words":{"student":"child","client":"family","member":"family","family":"family","staff":"tutor","tutor":"tutor","apprentice":"tutor","admin":"admin","business":"admin","site":"admin"}},"notify":["client","student","tutor","admin"],"form":["student","client","tutor","admin","contact"]},"limits":{"photoMax":8,"jobMax":6,"libraryCards":5,"favLinksMax":10,"favTitleMax":80,"favUrlMax":2000,"digestWordMax":300},"siteRules":{"ids":["mag-items","speed-long","hear-lang","tap-44","search-icon","whole-widgets","library-one-card","tell-admin","kjv-admin","finder-members","keep-basket","admin-cols","people-no-merge","items-no-move","form-save-row"],"locked":["hear-lang","keep-basket","admin-cols","people-no-merge","items-no-move","form-save-row"]},"submissionsPerPost":25,"answerTextMax":20000,"calendar":{"breaks":[{"name":"October half-term","sheet":"October Half Term","kind":"half","starts":"10-26"},{"name":"Christmas holidays","sheet":"Christmas Holiday","kind":"holiday","starts":"12-19"},{"name":"February half-term","sheet":"February Half Term","kind":"half","starts":"02-13"},{"name":"Easter holidays","sheet":"Easter Holiday","kind":"holiday","starts":"03-27"},{"name":"May half-term","sheet":"May Half Term","kind":"half","starts":"05-22"},{"name":"Summer holidays","sheet":"Summer Holiday","kind":"holiday","starts":"07-22"}],"kinds":{"term":{"say":"term","words":[]},"half-term":{"say":"half term","also":["half term"],"words":["half\\s*term"]},"holiday":{"say":"holiday","words":["holiday","christmas","easter","summer break","break"]}},"exams":[{"id":"sats","name":"SATs","key":"exam_sats_start","at":"05-11"},{"id":"elevenplus","name":"11+","key":"exam_11plus_start","at":"09-12"},{"id":"gcse","name":"GCSE exams","key":"exam_gcse_start","at":"05-11"},{"id":"alevel","name":"A-level exams","key":"exam_alevel_start","at":"05-11"}]},"levels":{"list":[{"level":"SATs","rung":1,"stages":["KS1","KS2"],"tiers":[],"says":["KS1","KS2","KS1 SATs","KS2 SATs"]},{"level":"11+","rung":0,"stages":["KS2"],"tiers":[],"says":[]},{"level":"KS3","rung":2,"stages":["KS3"],"tiers":[],"says":[]},{"level":"GCSE","rung":3,"stages":["KS4"],"tiers":["Foundation","Higher","Foundation Plus","Higher Plus"],"says":["KS4"]},{"level":"Functional Skills L2","rung":0,"stages":["KS4"],"tiers":[],"says":[]},{"level":"Level 2 Certificate","rung":0,"stages":["KS4"],"tiers":[],"says":["L2 Certificate"]},{"level":"A-Level","rung":4,"stages":["KS5"],"tiers":[],"says":["Alevel","A level","KS5"]},{"level":"AS","rung":0,"stages":["KS5"],"tiers":[],"says":["AS level","AS-level"]},{"level":"Theory test","rung":0,"ladder":false,"stages":[],"tiers":[],"says":[]},{"level":"ESL","rung":0,"ladder":false,"stages":[],"tiers":["A1","A2","B1","B2","C1","C2"],"says":["EFL","ESOL","CEFR"]},{"level":"University","rung":5,"stages":[],"tiers":["FHEQ 4","FHEQ 5","FHEQ 6","FHEQ 7"],"says":["Degree","Undergraduate","FHEQ","MSOR"]},{"level":"BNCC","rung":0,"ladder":false,"stages":[],"tiers":["1º ano","2º ano","3º ano","4º ano","5º ano","6º ano","7º ano","8º ano","9º ano"],"says":["Brazil","Brasil","Ensino Fundamental"]},{"level":"ENEM","rung":0,"ladder":false,"stages":[],"tiers":[],"says":[]},{"level":"Australian Curriculum","rung":0,"ladder":false,"stages":[],"tiers":["Foundation Year","Year 1","Year 2","Year 3","Year 4","Year 5","Year 6","Year 7","Year 8","Year 9","Year 10"],"says":["Australia","ACARA","F-10"]}],"quals":{"list":["Doctorate","Master's degree","PGCE","Bachelor's degree","Foundation Degree","HND","HNC","Diploma","Access to HE","International Baccalaureate","A-Level","T Level","BTEC","AS","IGCSE","GCSE","Certificate","11+","SATs","Entry Level","Enhanced","Standard","Basic"],"says":{"Degree":"Bachelor's degree","BA":"Bachelor's degree","BSc":"Bachelor's degree","Undergraduate":"Bachelor's degree","University":"Bachelor's degree","Masters":"Master's degree","MA":"Master's degree","MSc":"Master's degree","PhD":"Doctorate","IB":"International Baccalaureate"}}},"pictures":["fox","owl","cat","dino","robot","rocket","planet","football","guitar","palette"]};
const ROLES_ = SHARED_SETTINGS.roles;
const ROLE_IDS = Object.keys(ROLES_.ids);
const RANKS = ROLES_.ranks;
const ROLE_ALIASES = Object.fromEntries([].concat(...ROLE_IDS.map(r => (ROLES_.ids[r].aliases || []).map(a => [a, r]))));
const SEE_ROLES = ROLES_.see.roles;
const ROLE_THREE_ = ROLES_.see.words;
function rankTier_(rank) {
const id = ROLE_IDS.find(r => ROLES_.ids[r].rank === rank);
return id ? ROLES_.ids[id].tier : ROLES_.guest.tier;
}
function mayWord_(what, tier, rank, isOwner) {
const m = Object.prototype.hasOwnProperty.call(ROLES_.may, what) ? ROLES_.may[what] : null;
if (!m) return undefined;
let ok = m.rank ? !!rank && RANKS.indexOf(rank) >= RANKS.indexOf(m.rank)
: m.tiers ? m.tiers.indexOf(tier) !== -1 : (m.notTiers || []).indexOf(tier) === -1;
if (m.owner) ok = ok && !!isOwner;
return ok;
}
const WORDS_FILE = {"accept-request":"Accept request","accepted-by":"Accepted by ","accepted-the-family-can-pay-and":"Accepted — the family can pay and confirm","account-made-sign-in-now-as":"Account made — sign in now as ","account-made-sign-in-now-with":"Account made — sign in now with your PIN. We have also emailed you a link to confirm your address.","account-made-sign-in-now-with-2":"Account made — sign in now with your PIN. Open the link we have emailed you before making ","add-them-to-that-account-and":"Add them to that account and the next booking will name them.","add-to-basket":"Add to basket","admin-earns":"Admin earns","ages-up-to":"Ages up to ","all-ages":"All ages","already-in-your-basket":"Already in your basket","already-teaching":"Already teaching","email-does-not-look-right":"That email address does not look right.","handle-shape":"A handle is 3 to 30 characters, starts with a letter, and holds only letters, numbers, underscores and hyphens.","an-email-address-please-the-link":"An email address, please — the link goes to it.","anyone-in-particular":"Anyone in particular?","anything-else-we-should-know":"Anything else we should know","application-sent":"Application sent","applied-for":"Applied for","applied-the-family-picks":"Applied — the family picks","apply-again":"Apply again","apply-to-teach":"Apply to teach","are-you-providing-the-space":"Are you providing the space?","ask-to-join":"Ask to join","ask-us-to-add-them-and":"Ask us to add them and the next booking will name them.","asked-they-will-be-in-touch":"Asked — they will be in touch","asked-we-will-come-back-to":"Asked — we will come back to you","book-this":"Book this","booking-form":"Booking form","can-come":"Can come","cancellation-and-refunds":"Cancellation and refunds","card-dates":"Dates: {dates}","card-day-at-time":"{day} at {time}","card-subject-level":"{subject} ({level})","card-total":"Total: {total}","change-photo":"Change photo","client-i-book-and-pay":"Client — I book and pay","client-pays":"Client pays","clients-cannot-see-them-the-crossed":"Clients cannot see them. The crossed-out eye below puts them back on the site.","correct-check-the-spelling":"Correct (check the spelling: ","correct-every":"Correct — every ","could-not-make-the-picture":"Could not make the picture: ","could-not-reach-the-server":"Could not reach the server","could-not-share-it-press-and":"Could not share it — press and hold the picture to save it","decline-request":"Decline request","declined-by":"Declined by ","declined-the-family-has-been-told":"Declined — the family has been told","dictation-is-not-available-in-this":"Dictation is not available in this browser.","digest_footer":"Don’t want these any more? Just reply and say so.","digest_greeting":"Hi {parent},","digest_intro":"Here’s what {child} worked on this week: {count} ({span}).","digest_subject":"{child}’s week: {count}","draw-your-answer-first":"Draw your answer first","each-seat-pays":"Each seat pays","end-it":"End it?","every-hour-they-have-ticked-is":" Every hour they have ticked is outside ","extra-seats":"Extra seats","extra-subj":"Extra subj.","fill-a-cell-first":"Fill a cell first","getting-the-photo-ready":"Getting the photo ready…","hidden-from-clients":"Hidden from clients","home-visits":"Home visits","how-many-extra-seats":"How many extra seats?","how-would-you-like-to-book":"How would you like to book?","if-there-is-an-account-with":"If there is an account with that email, a new PIN is on its way.","image-saved-link-copied":"Image saved · link copied","in-your-basket":"In your basket","instant-class":"Instant class","its-a-grown-ups-email":"It's a grown-up's email","just-you":"Just you","link-copied":"Link copied","mail-apply-approved":"Good news — your application to teach with {brand} has been approved. You are listed as a tutor now: sign in to fill in your card.","mail-apply-body":"Hello {first},\n\n{said}\n\n{site}\n","mail-apply-declined":"Thank you for applying to teach with {brand}. We are not able to take your application further this time.","mail-apply-interview":"Thank you for applying to teach with {brand}. We would like to talk to you — we will be in touch to arrange a time.","mail-apply-owner-body":"{who} has applied to teach: {subjects}.\n\nRead it and say yes, interview or no in the Business column:\n\n{site}\n","mail-apply-owner-subject":"A new application to teach","mail-apply-subject":"Your application to teach","mail-attempts-kid-body":"{said}If that was {first}, \"New PIN\" on their card on your account gives them a new one at once. If it was not, tell us.","mail-attempts-own-tail":"If that was not you, reply here.","mail-attempts-said":"Somebody has tried the {brand} PIN for {who} {n} times and got it wrong.\n\nSigning in is held up for a minute, and for longer on each wrong answer after that.\n","mail-attempts-subject":"Too many sign-in attempts","mail-child-made-body":"Hello,\n\n{first} has made an account on {brand} and gave this address as their grown-up's, because they have no email of their own.\n\nTheir account works already. If that is right, open this link to confirm your address (it also puts them on your {brand} parent account if you have one and have confirmed it):\n\n{link}\n\nThey sign in with their handle, {handle}, and the PIN they chose. Once you have opened the link, \"Forgotten your PIN?\" sends a new one to this address if they forget it.\n\nIf you have an {brand} parent account on this address and have confirmed it, opening the link also puts {first} on it. If you do not know who this is, ignore this email and nothing happens.","mail-child-made-subject":"{first} has made an {brand} account","mail-confirm-body":"Hello {first},\n\nConfirm your email address by opening this link:\n\n{link}\n\nYou can already sign in with this email address{handleSaid} and the PIN you chose — the link only confirms the address is yours. Until it is opened we send nothing else to this address.\n\nIf you did not make this account, do not open the link: use \"Forgotten your PIN?\" with this address instead — it takes the account over and signs everyone else out.","mail-confirm-or-handle":" (or your handle, {handle})","mail-confirm-parent-next":"\n\nOnce you have opened the link, your child makes their own account; find their handle on Student profiles and tap Add as my child, and they say yes.","mail-confirm-subject":"Confirm your {brand} account","mail-invite-body":"Hello {first},\n\nAn account has been made for you on {brand}.\n\nSign in at {site} with your email (or your handle, @{handle}) and the PIN {pin}\n\nChange the PIN under Settings → Signing in.","mail-invite-subject":"Your {brand} account","mail-move-body":"Hello,\n\nSomebody signed in to an {brand} account has asked to use this email address for it.\n\nIf that was you, open this link on a phone or computer where you are signed in to that account:\n\n{link}\n\nUntil it is opened, the account keeps its old address — sign in with that, or with your handle. The link works for {days} days.\n\nIf it was not you, ignore this email. Nothing changes, and the link does nothing for anybody who is not signed in to that account.","mail-move-subject":"Confirm your new {brand} email address","mail-pin-body":"Somebody asked for a new PIN on your {brand} account{byHandle}.\n\nYour new PIN is {pin}\n\nSign in with {signInWith} and this PIN. It works for a day; your old PIN keeps working too until you use this one. Change it under Settings → Signing in.\n\nOr open this link to sign in with it straight away — it works even if wrong PINs have locked the account:\n\n{link}\n\nIf this was not you, do nothing — your PIN has not changed, and whoever asked cannot read this email.","mail-pin-by-handle":", by your handle ({handle})","mail-pin-kid-body":"{first}{handleSaid} has no email of their own and asked for a new PIN.\n\nThe new PIN is {pin}\n\nPass it on to them. They sign in with their handle and this PIN; it works for a day, and their old PIN keeps working until they use this one. \"New PIN\" on their card in the people column gives a fresh one at once.\n\nOr open this link on their device to sign them in as {who} straight away:\n\n{link}\n\nIf they did not ask, do nothing — nothing has changed.","mail-pin-kid-subject":"A forgotten PIN: {who}","mail-pin-subject":"Your new {brand} PIN","mail-pin-with-email":"your email","mail-pin-with-handle":"your handle, {handle}, or your email","mail-sign-off":"— {brand}","make-an-account":"Make an account","make-my-account":"Make my account","making-a-picture-of-this-booking":"Making a picture of this booking…","making-a-picture-of-this-profile":"Making a picture of this profile…","making-it":"Making it…","no-children-are-on":"No children are on ","no-connection-that-hand-is-still":"No connection — that hand is still up.","no-free-hours-this-week":"No free hours this week","no-free-hours-this-week-2":"No free hours this week.","no-preference":"No preference","no-surcharge":"No surcharge","no-tutor-yet":"No tutor yet","no-we-book-the-room":"No — we book the room","nobody-yet":"Nobody yet","nobody-yet-just-open-it":"Nobody yet — just open it","none-yet":"None yet","not-deployed":"Not deployed: ","not-enough-answered-to-price-it":"Not enough answered to price it yet.","not-listed":"Not listed","not-offered":"Not offered","not-on-the-booking-form":"Not on the booking form","not-priced-yet":"Not priced yet","not-yet-have-another-go":"Not yet — have another go","nothing-changed":"Nothing changed","nothing-here-yet":"Nothing here yet.","nothing-in-that-bundle-can-be":"Nothing in that bundle can be printed","nothing-was-added-a-qualification-needs":"Nothing was added — a qualification needs a subject and a level.","nothing-yet":"Nothing yet","on-the-list":"On the list","on-the-list-2":"On the list — ","online-safety":"Online safety","open":"Open — ","over-what-period":"Over what period?","paste-some-text-first":"Paste some text first","pay-and-confirm":"Pay and confirm","payment-cancelled-nothing-was-charged-your":"Payment cancelled — nothing was charged. Your booking is still waiting.","per-session":"Per session","photo-ready":"Photo ready.","pick-at-least-one-first":"Pick at least one first.","picture-removed":"Picture removed","picture-saved":"Picture saved","picture-saved-link-copied":"Picture saved · link copied","pin-or-date":"Pin or date","please-add":"Please add ","press-and-hold-the-picture-to":"Press and hold the picture to save it.","press-share-to-send-it":"Press Share to send it.","put-back":"Put back","put-back-as-it-was-your":"Put back as it was — your picture too","rest-of":"Rest of ","rest-of-this":"Rest of this ","room-and-fees":"Room and fees","room-saved":"Room saved","safer-recruitment":"Safer recruitment","save-or-cancel-the-card-you":"Save or cancel the card you are editing first.","saved-a-picture-of-this-booking":"Saved a picture of this booking","saved-for-everyone":"Saved for everyone","say-who-the-account-is-for":"Say who the account is for first — a parent or a student.","send-my-application":"Send my application","session-ended":"Session ended","share-this-booking":"Share this booking","shared-by":"Shared by","shared-with-tutor":"Shared with tutor","sign-in-to-book-your-account":"Sign in to book — your account is a few screens to the right.","sign-in-to-finish-your-booking":"Sign in to finish your booking — your payment is safe.","sign-in-to-open-a-session":"Sign in to open a session","sign-in-to-send-it":"Sign in to send it","sign-in-to-send-this-booking":"Sign in to send this booking — your answers are kept.","sign-in-to-send-your-working":"Sign in to send your working","sign-in-to-suggest-a-change":"Sign in to suggest a change.","signed-out":"Signed out","signed-out-please-sign-in-again":"Signed out — please sign in again","someone-else":"Someone else","something-already-going-or-a-new":"Something already going, or a new one?","something-went-wrong":"Something went wrong: ","something-went-wrong-there":"Something went wrong there.","start-a-new-one":"Start a new one","stripe-did-not-give-us-a":"Stripe did not give us a payment page.","student-im-learning":"Student — I'm learning","take-a-photo-of-your-working":"Take a photo of your working first","take-a-seat":"Take a seat","tap-to-choose":"Tap to choose","that-account-has-no-id-yet":"That account has no id yet — ask us.","that-class-has-gone":"That class has gone.","that-did-not-work":"That did not work.","that-did-not-work-everything-else":"That did not work. Everything else still works.","that-is-not-a-picture-take":"That is not a picture. Take a photo of the document.","that-is-the-most-this-card":"That is the most this card holds — 10 qualifications in all.","that-room-is-booked-every-hour":"That room is booked every hour.","that-session-is-not-in-this":"That session is not in this list any more","the-answers-are-still-on-their":"The answers are still on their way — a moment.","the-board-is-full-clear-it":"The board is full. Clear it to carry on.","the-phone-could-not-read-that":"The phone could not read that photo. Try another.","the-reply-was-not-valid-json":"The reply was not valid JSON (HTTP ","the-room":"The room","the-tutor-was-not-told-no":"The tutor was not told — no connection. Your card is still red.","there-is-no-booking-on-screen":"There is no booking on screen to share","there-is-nothing-to-share-on":"There is nothing to share on this card yet","they-tick-them-in-settings-under":" They tick them in Settings, under their week.","they-ticked-tutor-in-their-settings":"They ticked Tutor in their settings. Until you list them they are not on the site, cannot be booked and cannot take a session — the crossed-out eye below approves them.","this-booking-as-a-picture":"This booking, as a picture","this-browser-is-not-saving-what":"This browser is not saving what you type — leaving the page would lose it.","this-session-is-no-longer-yours":"This session is no longer yours.","turn-it-down":"Turn it down?","tutor-earns":"Tutor earns","type-the-letter":"Type the letter","type-the-letters-in-order-e":"Type the letters in order, e.g. B, A, C","type-your-email-address-or-your":"Type your email address or your handle first.","type-your-name-username-or-email":"Type your name, @username or email first.","video-removed":"Video removed","video-saved":"Video saved","waiting-for":"Waiting for ","waiting-list-class":"Waiting list class","watch-intro":"Watch intro","we-email-a-link-to-open":"We email a link to open. Then sign in with your handle or email and the PIN. A parent ","we-email-you-a-link-to":"We email you a link to open. Once you have opened it, find your child's handle on Student profiles ","we-would-like-to-talk-to":"We would like to talk to you about teaching — we will be in touch to arrange it.","what-are-we-working-on":"What are we working on?","what-level-the-highest-among-the":"What level? (the highest among the children)","when-could-you-come":"When could you come?","when-free":"When free","which-of-your-children-is-this":"Which of your children is this for?","who-is-in-it":"Who is in it","who-is-this-for":"Who is this for?","withdraw-from-this":"Withdraw from this","write-something-first":"Write something first","write-the":"Write the ","write-the-note-first":"Write the note first.","yes-no-room-hire":"Yes — no room hire","you-earn":"You earn","your-answer":"Your answer","your-answers-in-order":"Your answers, in order","your-application-to-teach-is-with":"Your application to teach is with us. We will be in touch.","your-application-to-teach-was-approved":"Your application to teach was approved.","your-application-to-teach-was-not":"Your application to teach was not taken further this time. You can apply again.","your-booking":"Your booking","your-first-and-last-name-please":"Your first and last name, please.","your-picture-is-still-saving-cancel":"Your picture is still saving — Cancel once it has.","your-seat":"Your seat","your-sessions":"Your sessions","err-not-signed-in":"Not signed in.","err-sign-in-first":"Sign in first.","err-busy":"Busy — try again in a moment.","err-person-not-found":"Person not found.","err-not-authorised":"Not authorised.","err-sign-in-again":"Please sign in again.","err-no-account":"We could not find your account.","err-job-not-found":"Job not found.","err-post-gone":"That post is gone.","err-not-found":"Not found.","doesnt-matter":"Doesn't matter","err-no-column-admin":"The sheet has no column for: {cols}. Open the site once as an admin to add it — nothing was saved.","err-no-column-setup":"The sheet has no column for: {cols}. Run ?setup=1 — nothing was saved.","err-which-venue":"Which venue?","err-venue-no-price":"That venue has no price set for a shared session yet.","err-not-a-picture":"That is not a picture. Choose a photo from your phone.","err-picture-too-big":"That picture is too big. Try a smaller one.","err-no-such-person":"No such person.","err-no-session":"No session with that id.","err-no-post":"No post with that id.","err-no-free-handle":"No free handle could be made just now. Nothing was saved — try again.","err-email-on-many":"That email address is on more than one account — ask us to sort it out.","err-no-such-email":"No account has that email address.","err-no-that-person":"We could not find that person.","err-no-that-account":"We could not find that account.","err-needs-title":"It needs a title. Nothing was saved.","err-busy-press":"Busy — press it again in a moment.","err-busy-resend":"Busy — it will be sent again.","err-no-people-tab":"no people tab","err-not-in-session":"You're not part of this session.","dk-eink-sign-in":"Sign in","dk-say-now":"{name}: {first} next, {left} left.","dk-say-over":"{name}: all done.","dk-say-ticked":"Ticked {title}.","dk-say-added":"Added {title} to {name}.","dk-say-no-match":"Nothing unticked matches \"{what}\".","dk-overdue":"Overdue","dk-all-done":"All done.","dk-say-what":"Say what, after what=.","dk-addr-head":"Your private address","dk-addr-say":"Siri Shortcuts, ChatGPT or Gemini can read this address for what is next on your Docket. Add &do=done&what=shower to tick, &do=add&what=milk to add. Keep it secret; a new one stops the old one working.","dk-addr-new":"Make a new address","dk-addr-show":"Private address","err-docket-token":"That is not your docket address.","err-docket-owner":"Docket is the owner's alone.","err-docket-saved":"That was not saved — try again.","save":"Save","saved":"Saved","not-saved":"Not saved","try-again":"Try again","not-saved-try-again":"Not saved — try again.","too-many-wrong-pins-try-again-in":"Too many wrong PINs. Try again in ","could-not-save-the-picture":"Could not save the picture. ","bundle":"Bundle","game":"Game","kit":"Kit","equipment":"Equipment","stationery":"Stationery","consumable":"Consumable","made-to-order":"Made to order","thing":"Thing","trip":"Trip","buy":"Buy","earn-with-ticks":"Earn with ticks","unlock-by-level":"Unlock by level","borrow":"Borrow","given-out":"Given out","front-recto":"Front (recto)","back-verso":"Back (verso)","manuscript":"Manuscript","author":"Author","figure":"Figure","writing":"Writing","event":"Event","manuscripts":"Manuscripts","events":"Events","writings":"Writings","people":"People","deuterocanon":"Deuterocanon","battle-of-the-little-giants":"Battle of the Little Giants","st-valentine-s-day-massacre":"St Valentine's Day Massacre","wbss-final":"WBSS Final","c-1147-bc-ramesses-v":"c. 1147 BC, Ramesses V","number-plate-interior-bulbs":"Number plate & interior bulbs","national-archives":"National Archives","years-teaching":"years teaching","video-link":"video link","will-travel-km":"will travel (km)","favourite-colour":"favourite colour","venues-you-teach-at":"venues you teach at","your-manager":"your manager","where-you-teach":"Where you teach","about-you-as-a-tutor":"About you as a tutor","name":"name","openclass":"openClass","title":"title","label":"label","staff":"Staff","areas-you-teach-in":"Areas you teach in","one-line-about-you-30":"one line about you (30 characters)","extra-seat-share-of-your":"extra seat: share of your rate, 0–1 (0.5 = half)","family-s-share-of-an":"@family.'s share of an extra seat, 0–2 (blank = the usual)","venues":"Venues","subjects":"Subjects","levels":"Levels","receipts":"Receipts","booking":"Booking","questions":"Questions","answers":"Answers","margin-gap-px-0-4px":"margin:{gap}px 0 4px;font-size:{small}px;color:{faint}","practicals":"Practicals","projects":"Projects","library":"Library","inserts":"Inserts","specification":"Specification","timeline":"Timeline","symbol":"Symbol","atomic-number":"Atomic number","relative-atomic-mass":"Relative atomic mass","block":"Block","electron-configuration":"Electron configuration","discovered":"Discovered","also-called":"Also called","formula":"Formula","use":"Use","hazard":"Hazard","pattern":"Pattern","conditions":"Conditions","observations":"Observations","tools":"Tools","docket":"Docket","title-2":"Title","place":"Place","date":"Date","time":"Time","the-time-is":"The time is","repeats":"Repeats","note":"Note","games":"Games","coming-soon":"Coming soon","profiles":"Profiles","role":"Role","date-of-birth-optional":"Date of birth (optional)","parents":"Parents","their-parent-optional":"Their parent (optional)","handle-theirs-to-change":"handle (theirs to change)","date-of-birth":"date of birth","pin":"PIN","you":"You","full-name":"full name","phone":"phone","email":"email","home-address":"home address","postcode":"postcode","documents":"Documents","photo-id-passport-or-driving":"photo ID — passport or driving licence","right-to-work-in-the":"right to work in the UK","right-to-work-document-passport":"right-to-work document — passport, share code or visa","what-you-teach":"What you teach","qualifications-degrees-teaching-qualifications-anything":"qualifications — degrees, teaching qualifications, anything relevant","a-qualification-certificate":"a qualification certificate","another-qualification-certificate-optional":"another qualification certificate (optional)","hourly-rate":"hourly rate (£)","checks":"Checks","enhanced-dbs-certificate-number":"enhanced DBS certificate number","issued-on":"issued on","i-consent-to-you-checking":"I consent to you checking it on the DBS Update Service","i-need-a-dbs-check":"I need a DBS check","when-and-where":"When and where","when-you-can-teach":"when you can teach","area-and-venues-you-can":"area and venues you can reach","experience":"experience","2-references":"2 references","relationship-to-you":"relationship to you","a-short-statement-why-you":"a short statement — why you want to teach","cv-link-optional":"CV link (optional)","i-agree-to-family-keeping":"I agree to @family. keeping these details and documents privately to consider my application, contacting my referees and checking my DBS.","who-is-the-account-for":"Who is the account for?","whose-email-will-you-give":"Whose email will you give?","pin-4-digits":"PIN — 4 digits","your-username-or-email":"Your username or email","current-pin":"current PIN","new-pin-4-numbers-not":"new PIN, 4 numbers, not 1234","new-pin-again":"new PIN again","settings":"Settings","kids-settings":"Kids settings","parent-settings":"Parent settings","tutor-settings":"Tutor settings","apprentice-settings":"Apprentice settings","biz-settings":"Biz settings","web-settings":"Web settings","signed-in":"Signed in","signing-in":"Signing in","your-role":"Your role","notifications":"Notifications","reading-aloud":"Reading aloud","work-on-file":"Work on file","progress":"Progress","brownie-points":"Brownie points","roadmap":"Roadmap","code-of-conduct":"Code of conduct","progress-sessions":"Progress: sessions","lego-piece-check":"LEGO piece check","staff-hub":"Staff hub","card-template":"Card template","needs-help":"Needs help","add-a-student":"Add a student","find-by-handle":"Find by handle","you-and-your-family-students":"You and your family (students)","manage-your-child":"Manage your child","every-student":"Every student","add-a-parent":"Add a parent","your-card-parent-profiles":"Your card (Parent profiles)","you-and-your-family-parents":"You and your family (parents)","parent-claims":"Parent claims","every-parent":"Every parent","stability":"Stability","rename-every-username":"Rename every username","build":"Build","posts":"Posts","things":"Things","shop":"Shop","partners":"Partners","who-their-person-id":"Who (their person id)","business":"Business","what-we-could-do-together":"What we could do together","terms":"Terms / %","status":"Status","food":"Food","name-2":"Name","price":"Price (£)","minutes-to-make":"Minutes to make","meal":"Meal","how":"How","tasks":"Tasks","done":"Done","notes":"Notes","due":"Due","repeat":"Repeat","list":"List","person-id":"Person (id)","booking-id":"Booking (id)","item-id":"Item (id)","drive":"Drive","folder-id":"Folder id","what-goes-there":"What goes there","week":"Week","who":"Who","person-id-if-they-have":"Person id (if they have a file)","where":"Where","address":"Address","days-e-g-mon-fri":"Days (e.g. Mon-Fri, Mon)","start-hh-mm":"Start (HH:MM)","end-hh-mm":"End (HH:MM)","term":"Term","foods":"Foods","subject-or-module":"Subject or module","what-it-is":"What it is","how-much-a-number":"How much (a number)","of-what":"Of what","due-time":"Due time","of-the-grade":"% of the grade","mark":"Mark","link":"Link","car-or-car-part":"Car or car part?","brand":"Brand","model":"Model","generation":"Generation","phase":"Phase","market":"Market","years-made":"Years made","engine-size":"Engine size","valves":"Valves","version":"Version","fuel":"Fuel","part":"Part","price-band":"Price band","part-type":"Part type","socket-or-form-factor":"Socket or form factor","interface":"Interface","connects-to":"Connects to","what-sort":"What sort","system":"System","engine":"Engine","chemical-type":"Chemical type","group":"Group","period":"Period","state":"State","what-for":"What for","what-kind":"What kind","which":"Which","which-tool":"Which tool","religion":"Religion","work":"Work","source-text":"Source text","language":"Language","translation-or-edition":"Translation or edition","collection":"Collection","section":"Section","book":"Book","chapter":"Chapter","unit":"Unit","primary-or-secondary-source":"Primary or secondary source","kind-of-writing":"Kind of writing","shelf":"Shelf","subject":"Subject","fighter":"Fighter","decade":"Decade","division":"Division","round":"Round","result":"Result","winner":"Winner","required":"Required","level":"Level","key-stage":"Key stage","school-year":"School year","grade":"Grade","topic":"Topic","exam-board":"Exam board","exam-topic":"Exam topic","exam-sub-topic":"Exam sub-topic","tier":"Tier","year":"Year","month":"Month","day":"Day","paper":"Paper","paper-section":"Paper section","question":"Question","sub-part":"Sub-part","marks":"Marks","calculator":"Calculator","what-you-need":"What you need","source":"Source","answer-checked":"Answer checked","status-untried":"Unattempted","status-right":"Correct","status-part":"Part correct","status-wrong":"Incorrect","status-attempted":"Attempted","answer-hidden-say":"The answer is hidden","which-part":"Which part","era":"Era","material":"Material","format":"Format","years":"Years","from":"From","held-at":"Held at","found":"Found","dated":"Dated","side":"Side","theatre":"Theatre","how-you-get-it":"How you get it","price-2":"Price","who-for":"Who for","theme":"Theme","which-posts":"Which posts","who-posted":"Who posted","when":"When","who-with":"Who with","area":"Area","good-for":"Good for","holds":"Holds","sign-in-first":"Sign in first.","sign-in-first-2":"Sign in first.","your-result":"Result","your-attempt":"Attempted"};
function text_(key, vars) {
const w = WORDS_FILE[key];
const s = typeof w === 'string' ? w : key;
return vars ? s.replace(/\{(\w+)\}/g, (all, k) => (vars[k] == null ? all : String(vars[k]))) : s;
}
const norm = s => String(s || '').toLowerCase().trim();
const deployStamp_ = () => (window.LOAD ? '?t=' + window.LOAD : '');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const row = (label, value, extra) => {
const v = String(value == null ? '' : value);
const looksNumeric = /^[£$€]?[\d.,\s—–-]+%?$/.test(v.trim()) || /^\d/.test(v.trim());
const cls = ['v', looksNumeric ? 'mono' : '', extra || ''].filter(Boolean).join(' ');
return rowOf_('row', label, { look: cls, text: v });
};
const rowOf_ = (rowCls, label, v) => cardBlock_({ type: 'group', look: rowCls, blocks: [
label === false ? null : { type: 'group', tag: 'span', look: 'k', text: label == null ? '' : String(label) },
Object.assign({ type: 'group', tag: 'span' }, v)] });
const rowLive = (label, value, id, extra) =>
rowOf_('row', label, { look: ['v', 'mono', extra || ''].filter(Boolean).join(' '), id: String(id), text: String(value == null ? '' : value) });
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
const fmtTime_ = t => {
if (t instanceof Date || typeof t === 'number') { const d = new Date(t); return isNaN(d) ? '' : String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
const s = String(t ?? '').trim();
if (!s) return '';
if (/^\d{1,2}$/.test(s)) return s.padStart(2, '0') + ':00';
let h, min;
const m = s.match(/(\d{1,2}):(\d{2})\s*([ap]m)?/i);
const a = m ? null : s.match(/^(\d{1,2})\s*([ap]m)$/i);
if (m) { h = +m[1]; min = +m[2]; if (m[3]) h = h % 12 + (/p/i.test(m[3]) ? 12 : 0); }
else if (a) { h = +a[1] % 12 + (/p/i.test(a[2]) ? 12 : 0); min = 0; }
else { const d = new Date(s); if (isNaN(d)) return s; h = d.getHours(); min = d.getMinutes(); }
return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
};
function token_(name, or) {
try { return String(getComputedStyle(document.documentElement).getPropertyValue(name) || '').trim() || or; } catch (e) { return or; }
}
const dash_ = v => (v === undefined || v === null || String(v).trim() === '' ? '—' : v);
const fmtHours_ = (a, b) => fmtTime_(a + ':00') + '–' + fmtTime_(b + ':00');
const plural_ = (n, one, many) => (n === 1 ? one : many || one + 's');
function fmtMoney_(n, style) {
const v = Number(n) || 0, m = (v < 0 ? '−' : '') + '£' + Math.abs(v).toFixed(2);
return style === 'hour' ? m + '/h' : m;
}
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
const roleAliases_ = () => { try { return (DATA && DATA.roleAliases) || ROLE_ALIASES; } catch (e) { return ROLE_ALIASES; } };
const roleOf = r => roleAliases_()[norm(r)] || norm(r);
const heldRoles = (u = USER) => (u && (u.roles || [u.role]) || []).map(x => String(x).toLowerCase());
const hasRole = (r, u = USER) => heldRoles(u).some(h => roleOf(h) === roleOf(r));
const uniq = arr => [...new Set((arr||[]).filter(Boolean))];
const hashOf = str => {
let h = 2166136261;
for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
return h >>> 0;
};
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
const loose = !iso && !dmy && t.match(/(?:^|[^\d\/\-.])(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4}|\d{2})(?![\d\/\-.])/);
if (iso && iso[7]) d = new Date(t);
else if (iso) d = at(+iso[1], +iso[2], +iso[3], iso[4], iso[5], iso[6]);
else if (dmy) d = at(dmy[3].length === 2 ? 2000 + (+dmy[3]) : +dmy[3], +dmy[2], +dmy[1], dmy[4], dmy[5], dmy[6]);
else if (loose) d = at(loose[3].length === 2 ? 2000 + (+loose[3]) : +loose[3], +loose[2], +loose[1]);
else if (!/[A-Za-z]/.test(t)) d = null;
else d = new Date(t);
}
if (!d || isNaN(d)) return null;
if (!keepTime) d.setHours(0, 0, 0, 0);
return d;
}
const tz_ = () => SHARED_SETTINGS.tz;
function todayIso_(at) {
const d = at == null ? new Date() : (at instanceof Date ? at : new Date(at));
return new Intl.DateTimeFormat('en-CA', { timeZone: tz_(), year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
function parseDMY(s) { return dateOf_(s); }
const fmtDmy_ = v => {
if (v instanceof Date || typeof v === 'number') { const d = new Date(v); return isNaN(d) ? '' : `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)}`; }
const s = String(v ?? '').trim();
if (!s) return '';
const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
if (iso) return `${iso[3].padStart(2,'0')}/${iso[2].padStart(2,'0')}/${iso[1].slice(-2)}`;
const m = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
if (m) { const y = m[3].slice(-2); return `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}/${y}`; }
const d = new Date(s);
return isNaN(d) ? s : fmtDmy_(d);
};
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
if (want === norm('At home')) return all.find(x => x.takesAllSeats) || null;
return all.find(x => norm(x.label) === want) || null;
}
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
if (!may_('prices')) return false;
const sp = (typeof spaceFor === 'function') ? spaceFor(name) : null;
if (sp) return !(Number(sp.rate) > 0);
const v = (DATA.venues || []).find(x => norm(x.title) === norm(name));
return !!v && !(Number(v.bestRate) > 0);
}
function seatLimits(space, tutor, loc) {
const v = (DATA.constants || {}).vars || {};
const houseMax = Number(v.max_students_per_job) || 0;
let max = 99, min = 1;
const why = { max: '', min: '' };
const capMax = (n, reason) => { if (n > 0 && n < max) { max = n; why.max = reason; } };
const capMin = (n, reason) => { if (n > 0 && n > min) { min = n; why.min = reason; } };
if (!space && loc) space = spaceFor(loc);
if (space) { capMax(Number(space.max), space.label || 'this venue');
capMin(Number(space.min), space.label || 'this venue'); }
if (tutor) { capMax(Number(tutor.maxStudents) || 1, tutor.title);
capMin(Number(tutor.minStudents), tutor.title); }
capMax(houseMax, 'your limit');
if (loc && takesAllSeats_(loc)) { min = max; why.min = 'a home session'; }
if (min > max) min = max;
return { max, min, why };
}
const NONE_LABEL = '\u2014\u2014\u2014';
const val = id => ($(id) || {}).value || '';
const tutorHeld_ = () => hasRole('tutor');
const rank_ = (u = USER) => {
if (!u) return '';
if (RANKS.indexOf(String(u.rank || '')) !== -1) return u.rank;
const id = ROLE_IDS.find(r => hasRole(r, u) && !(ROLES_.ids[r].pending && u.tutorPending)) || ROLES_.default;
return ROLES_.ids[id].rank;
};
const rankAtLeast_ = (want, u = USER) => !!u && RANKS.indexOf(rank_(u)) >= RANKS.indexOf(want);
const KID_ASK_PARENT = 'A parent books and pays for sessions — ask yours to book this one.';
function levelPriced(name) {
const t = (DATA.multipliers || {}).levels || {};
return Object.prototype.hasOwnProperty.call(t, name) && String(t[name]).trim() !== '';
}
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
photos: photos.map(S).filter((v, i, all) => /^https?:\/\//i.test(v) && v !== face && all.indexOf(v) === i).slice(0, m.photos || Infinity),
tags: [r.adjective_1, r.adjective_2, r.adjective_3].map(S).filter(Boolean),
description: S(r.headline) ? '“' + S(r.headline).replace(/^["“”']+|["“”']+$/g, '') + '”' : '',
town: S(r.town),
rate: N(r.rate_per_hour),
yrsExp: S(r.years_experience),
minStudents: N(r.min_students) || 1, maxStudents: N(r.max_students),
minHours: N(r.min_hours) || 1, maxHours: N(r.max_hours),
ageMin: ageOut_(r.age_min), ageMax: ageOut_(r.age_max),
extraSeat: N(r.extra_seat_rate)
};
}
;
/* js/draw.js */
const drawRatio_ = cap => Math.min((typeof window !== 'undefined' && window.devicePixelRatio) || 1, cap || 3);
function drawFit_(canvas, o) {
o = o || {};
const box = canvas.getBoundingClientRect();
if (!box.width || !box.height) {
if (o.again && !canvas.dataset.waiting) {
canvas.dataset.waiting = '1';
requestAnimationFrame(() => { delete canvas.dataset.waiting; o.again(); });
}
return null;
}
delete canvas.dataset.waiting;
const dpr = drawRatio_(o.cap), w = Math.round(box.width), h = Math.round(box.height);
const bw = Math.max(1, Math.round(w * dpr)), bh = Math.max(1, Math.round(h * dpr));
if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
canvas.dataset.w = w; canvas.dataset.h = h;
let ctx = null;
if (!o.gl) {
try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
return { w, h, dpr, ctx };
}
function drawFixed_(canvas, w, h, cap) {
const dpr = drawRatio_(cap), bw = Math.round(w * dpr), bh = Math.round(h * dpr);
if (canvas.width !== bw || canvas.height !== bh) { canvas.width = bw; canvas.height = bh; }
let ctx = null;
try { ctx = canvas.getContext('2d'); } catch (e) { ctx = null; }
if (ctx && ctx.setTransform) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
return ctx ? { w, h, dpr, ctx } : null;
}
function drawClear_(ctx, w, h, fill) {
ctx.clearRect(0, 0, w, h);
if (fill) { ctx.fillStyle = fill; ctx.fillRect(0, 0, w, h); }
}
const DRAW_LOOPS = new Map();
let DRAW_RAF = 0, DRAW_LAST = 0;
const drawNow_ = () => (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now());
function drawTick_() {
DRAW_RAF = 0;
const now = drawNow_(), dt = DRAW_LAST ? Math.min(0.25, (now - DRAW_LAST) / 1000) : 0;
DRAW_LAST = now;
DRAW_LOOPS.forEach((L, key) => {
let go = false;
try { go = L.frame(now, dt) !== false; } catch (e) { go = false; if (typeof oops_ === 'function') oops_(e, 'draw:' + key); }
if (!go && DRAW_LOOPS.get(key) === L) DRAW_LOOPS.delete(key);
});
if (DRAW_LOOPS.size) DRAW_RAF = requestAnimationFrame(drawTick_);
else DRAW_LAST = 0;
}
function drawLoop_(key, frame, stop) {
DRAW_LOOPS.set(key, { frame, stop });
if (!DRAW_RAF) DRAW_RAF = requestAnimationFrame(drawTick_);
}
function drawStop_(key) {
DRAW_LOOPS.delete(key);
if (!DRAW_LOOPS.size && DRAW_RAF) { cancelAnimationFrame(DRAW_RAF); DRAW_RAF = 0; DRAW_LAST = 0; }
}
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => {
if (!document.hidden) return;
[...DRAW_LOOPS].forEach(([key, L]) => { drawStop_(key); if (L.stop) L.stop(); });
});
;
/* js/input.js */
const inputTyping_ = t => !!(t && (t.isContentEditable || (t.closest && t.closest('input, textarea, select, [contenteditable], .kp-in, [data-kpb]'))));
const inputBare_ = e => !(e.metaKey || e.ctrlKey || e.altKey);
function inputKeys_(map, fn, o) {
o = o || {};
const h = e => {
const a = map[e.key] !== undefined ? map[e.key] : map[e.code];
if (a === undefined || !inputBare_(e) || inputTyping_(e.target) && !o.inField) return;
if (o.when && !o.when(e)) return;
if (fn(a, e.type === 'keydown', e) === false) return;
e.preventDefault();
if (o.stop !== false) e.stopPropagation();
};
document.addEventListener('keydown', h, !!o.capture);
if (o.up) document.addEventListener('keyup', h, !!o.capture);
return () => { document.removeEventListener('keydown', h, !!o.capture); if (o.up) document.removeEventListener('keyup', h, !!o.capture); };
}
function inputHold_(root, attr, on) {
const held = new Map();
const sync = e => { const s = {}; held.forEach(k => { s[k] = true; }); on(s, e); };
root.addEventListener('pointerdown', e => {
const b = e.target.closest('[' + attr + ']');
if (!b || !root.contains(b)) return;
e.preventDefault();
try { b.setPointerCapture(e.pointerId); } catch (err) { }
held.set(e.pointerId, b.getAttribute(attr));
sync(e);
});
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => root.addEventListener(n, e => { if (held.delete(e.pointerId)) sync(e); }));
root.addEventListener('contextmenu', e => e.preventDefault());
return held;
}
function inputDrag_(start, move, end, o) {
o = o || {};
const go = new Map();
document.addEventListener('pointerdown', e => {
const g = start(e);
if (!g) return;
if (o.capture && g.el && g.el.setPointerCapture) { try { g.el.setPointerCapture(e.pointerId); } catch (err) { } }
if (e.cancelable) e.preventDefault();
go.set(e.pointerId, g);
}, !!o.early);
document.addEventListener('pointermove', e => {
const g = go.get(e.pointerId);
if (!g) return;
if (e.cancelable) e.preventDefault();
if (move) move(g, e);
}, { capture: !!o.early, passive: false });
['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, e => {
const g = go.get(e.pointerId);
if (!g) return;
go.delete(e.pointerId);
if (end) end(g, e);
}, !!o.early));
return go;
}
;
/* js/kinds.js */
const ITEM_KINDS = {"kinds":{"bookform":{"source":"the booking form (js/book-*.js)","find":{"group":"Booking","label":"Booking form","under":"Booking","draw":"none"},"see":{"who":"anyone"},"forms":{"booking":{"ask":"find","say":"Booking, asked in Find one field a step in this order (owner, 13 Nov); each field is a BOOK_STEPS question (book-steps.js) or the hour grid (days, slots). given: the site answers it (bookPrefill_), still a chip. many: several answers, a tap ticks; need: how many before Next. rows: the order the booking card lists them (BOOK_STEPS). A field's `step` is its booking question as data, read by formSteps_ (form.js): q, short (words keys or text); list (fixed options) or from (a source: clients, children, openJobs, subjects, levels, tutors, venues, intervals, seats, hourGrid); when/unless (conditions that empty the list), may (a permission); filter (a row field that must be set, or a named test), label (the row field, or fields in turn, or a named function), sort (a row field), first/last (options put before/after), then (a named step over the whole list); say (an option's shown text: a map, or a named function); check (why an answer is refused), off (why an option is greyed), fallback, lock, set: named functions in BOOK_FNS (book-steps.js). Any name is looked up there first, else read as a row field.","fields":[{"f":"how","given":true,"step":{"q":"how-would-you-like-to-book","short":"Kind","list":["instant-class","waiting-list-class"],"set":"howSet"}},{"f":"client","step":{"q":"who-is-this-for","short":"For","from":"clients","may":"admin","label":"name","then":"meFirstNobody","fallback":"me","check":"needsSomebody","set":"kidsFor"}},{"f":"joining","given":true,"step":{"q":"something-already-going-or-a-new","short":"Class","when":"how","from":"openJobs","filter":"sameKind","label":"openClass","first":["start-a-new-one"],"set":"joiningSet"}},{"f":"subjects","many":true,"need":1,"step":{"q":"what-are-we-working-on","short":"Subject","from":"subjects","label":"name"}},{"f":"level","step":{"q":"what-level-the-highest-among-the","short":"Level","from":"levels"}},{"f":"tutor","step":{"q":"anyone-in-particular","short":"Tutor","unless":"waiting","from":"tutors","filter":"title","label":"title","first":["no-preference"],"say":"tutorListed","fallback":"waitNoPreference","check":"teaches"}},{"f":"loc","step":{"q":"Where?","short":"Venue","only":"wait, tutoring","from":"venues","label":"label","wrap":true,"check":"roomHolds","set":"homeHostsItself"}},{"f":"hosting","step":{"q":"are-you-providing-the-space","short":"Space","only":"wait, tutoring","unless":["waiting","atHome"],"list":["No","Yes"],"filter":"roomCosts","say":{"Yes":"yes-no-room-hire","No":"no-we-book-the-room"},"fallback":"atHomeYes"}},{"f":"interval","many":true,"step":{"q":"over-what-period","short":"Term","from":"intervals","label":["label","term"],"fallback":"waitTerm","filter":["label","term"]}},{"f":"days","need":1,"ask":"Which day?"},{"f":"slots","many":true,"need":1,"ask":"What time? Each tag is one hour.","grid":true,"step":{"q":"When?","short":"When","unless":"waiting","from":"hourGrid","grid":"hours","week":true}},{"f":"avail","many":true,"grid":true,"step":{"q":"when-could-you-come","short":"when-free","only":"wait","grid":"blocks","week":true}},{"f":"kids","many":true,"step":{"q":"which-of-your-children-is-this","short":"Child","unless":"waiting","from":"children","last":["someone-else"],"set":"seatsFollowKids"}},{"f":"n","step":{"q":"how-many-extra-seats","short":"extra-seats","from":"seats","say":"extraSeats","lock":"homeSeats","off":"overCap","check":"seatLimits"}}],"look":"book-step","rows":["client","how","kids","joining","subjects","level","tutor","loc","hosting","n","interval","slots","avail"]}}},"tutor":{"shape":"Card","bodyAs":"person","source":"Ledger people tab (role tutor)","loader":"payload -> find-aloud.js","sample":"check/fixture.json tutors","sheet":{"tab":"people","columns":["personId","title","tags","titles","venues","rate","listed"],"never":["pin"],"via":"person","id":"person_id","list":{"keep":["* staff"],"out":{"personId":"person_id","name":"* name","handle":"handle","rank":"* rank","termsVersion":"agreement_version","termsAt":"agreement_signed_at whenS","dbsCheckedOn":"dbs_checked_on iso","dbsNumber":"dbs_number"}},"show":["person_id","role","first_name","handle","photo","photos","video","headline","adjective_1","adjective_2","adjective_3","years_experience","focus","borough","town","city","travel_km","rate_per_hour","extra_seat_rate","min_students","max_students","availability","listed","avatar","dbs_checked"]},"find":{"group":"Booking","label":"Staff","under":["Booking","Profiles"],"draw":"findTutorCard_","facets":["forLabel","kindLabel","kindOwn","profileType"]},"card":{"look":"is-widget is-prof","quals":{"_about":"THE CARD SHOWS ONLY THE BEST AT A LEVEL (owner, 18 Nov): at most this many per level row, by grade (`grades`, higher first; ties keep stored order); a level not named shows all. Everything stays stored.","A-Level":2,"GCSE":5,"grades":{"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"A*":8.5,"A":7,"B":6,"C":4.5,"D":3,"E":2}},"id":["personId","id"],"name":"title","nameTag":false,"tags":["tags","titles"],"links":["venues"],"lines":true,"off":"kcUnlisted_(row)","parts":["note","places","hours","about","words","photos","jobs","quals"],"picture":"profFace_(entry, 96)","tagLook":"prof-tags prof-who-tags","pills":"profPills_(item, entryRow)","tagRows":"profTagRows_(raw)"},"live":{"money":"kcTutorMoney_(row)","say":"kcTutorSay_(row)"},"see":{"who":"anyone","hide":{"prices":["rate","rate_per_hour","extra_seat_rate","extra_seat_cut"],"admin":["note"]}},"forms":{"card-edit":{"attr":"data-me","draft":false,"fields":"list","say":"the tutor card's edit form (cardEditForm_): its sections' names, typed by rules; a price only for may_('prices')."},"card-seat":{"attr":"data-pound","draft":false,"say":"the extra seat in pounds, kept as the share in the hidden twin (type `shown`: `show` draws the stored value, `store` turns what is typed back); @family.'s share only for an admin.","fields":[{"f":"extra_seat_rate","type":"shown","as":"money","twin":"data-me","show":"cardSeatShown_","store":"cardSeatShare_"},{"f":"extra_seat_cut","type":"shown","as":"money","twin":"data-me","show":"cardSeatShown_","store":"cardSeatShare_","may":"admin"}]},"card-where":{"attr":"data-me","draft":false,"say":"Where you teach: an area a tick, rewriting the hidden venues_ok, saved by the card's Save.","fields":[{"f":"venues_ok","type":"hidden"},{"f":"areas","type":"ticks","attr":"data-where-area","label":"Areas you teach in","look":"many-list where-areas"}]}},"fields":{"headline":{"label":"one line about you (30 characters)","chars":30},"extra_seat_rate":{"label":"extra seat: share of your rate, 0–1 (0.5 = half)","min":0,"max":1,"step":0.05},"extra_seat_cut":{"label":"@family.'s share of an extra seat, 0–2 (blank = the usual)","labelLocked":"@family.'s share of an extra seat — set by @family. (blank = the usual)","min":0,"max":2,"step":0.01,"pad":"decimal"}}},"venue":{"source":"Ledger venues + rooms tabs (data/settings/venues.json)","loader":"payload -> find-aloud.js","sample":"check/fixture.json venues","sheet":{"tab":"venues","columns":["name","focus","borough","city","tags","maxCapacity","bestRate"],"also":["rooms"],"id":"venue_id"},"find":{"group":"Venues","label":"Venues","under":"Booking","facets":["forLabel","kindLabel","kindOwn","venueArea","venueFor","venueSize"]},"shape":"Card","bodyAs":"reference","card":{"look":"venue-door","tags":["focus","borough","city","tags"],"lines":true,"parts":[{"list":["rooms"]}],"picture":"kcVenuePic_(item, entry)"},"live":{"rooms":"kcRooms_(row)"},"see":{"who":"anyone","hide":{"prices":["price","cost_per_hour","travel_cost"]}}},"subject":{"source":"payload (Ledger people/pricing)","loader":"subjectRows() -> find-aloud.js","find":{"group":"Booking","label":"Subjects","under":"Booking","facets":[]},"shape":"Card","bodyAs":"reference","card":{"look":"is-subject","tags":["levels","focus"],"lines":true,"liveTags":{"tutors":3},"parts":[{"list":["surcharge","levels","noTutors"]}]},"live":{"levels":"kcLevels_(row)","tutors":"kcTutorNames_(row)"},"see":{"who":"anyone"}},"level":{"source":"payload (Ledger people/pricing)","loader":"find-aloud.js","find":{"group":"Booking","label":"Levels","under":"Booking","facets":["forLabel","kindLabel","kindOwn"]},"shape":"Card","bodyAs":"reference","card":{"look":"is-level","tags":["subjects","focus"],"lines":true,"liveTags":{"tutors":3},"parts":[{"list":["surcharge","subjects","tutors","listed"]}]},"live":{"subjects":"kcSubjects_(row)","tutors":"kcTutorNames_(row)"},"see":{"who":"anyone"}},"booking":{"source":"Ledger events + receipts tabs","loader":"backend booking.gs -> book-*.js (myJobs_ -> findMineItems_)","sample":"check/fixture.json liveJobs","sheet":{"tab":"jobs","columns":["job_id","subject","level","tutor","venue","price","unit","rate","weeks","client","slots"],"also":["receipts"],"id":"job_id","owner":["booked_by","client_hosts"]},"find":{"group":"Booking","label":"Receipts","under":"Booking","entries":{"receipt":{},"offBooking":{"label":"Booking","draw":""}},"facets":[]},"shape":"Card","bodyAs":"record","card":{"card":"receipt","id":["id","jobId","job_id"],"facts":true,"tags":["subject","level","tutor","venue"],"record":{"name":[["subject","=Session"],["level"]],"pills":["=Booking","subject","tutor:name","when","money.rate"],"status":{"fact":"paid","look":{"Unpaid":"is-new"}},"sum":["who","weeks","money.total"]},"tool":"jobPage_(raw)","letter":{"say":"THE BOOKING AS AN EMAIL SAYS IT (owner, 23 Nov: EVERY EMAIL CARD IS THE SITE CARD): renderCard with inline \"text\" draws the site card's own parts in the site card's order (`cardSiteParts_`: the record's name, the tags, the pills, the status, the sum), each a bullet line through the words file where `words` says how; a part with no way said is the site's alone (its Booking label, the tutor, the paid pill). A `money.*` part is a price, never said to a child or when prices are off. tools/one-email-card.js holds it.","bullet":"• ","aliases":{"say":"A FIELD BY ANOTHER COLUMN'S NAME (unify job J): cardLetterRow_ reads the field, or failing it the first of these the row has (a Jobs row says weekday and start_time).","day":["weekday"],"time":["start_time"]},"rows":{"say":"A LETTER THAT SAYS LESS (unify job J): cardLetterRow_(kind, src, name) and the card draw only these of the site card's parts; without a name, every part `words` says.","cancelled":["name","when"]},"words":{"say":"HOW THE EMAIL SAYS A SITE PART, keyed by the site card's part and never an order of its own: `word` the words file's line, `need` the row's fields, `alone` the field said when the rest are missing.","name":{"word":"card-subject-level","need":["subject","level"],"alone":"subject"},"venue":{"need":["location"],"alone":"location"},"when":{"word":"card-day-at-time","need":["day","time"],"date":true,"alone":"any"},"weeks":{"word":"card-dates","need":["dates"]},"money.total":{"word":"card-total","need":["price"],"money":true,"as":{"price":"total"}}}}},"live":{"money":"kcBookingMoney_(row)"},"see":{"who":"self, family, staff, admin","hide":{"prices":["rate","total","price_total","tutor_pay","travel_paid","admin_profit","gross","tutor_payout","venue_cost","materials_charge","materials_cost","tickets_cost","card_fees","discount_value","net_profit"],"admin":["tutor_pay","admin_profit","net_profit","venue_cost","card_fees"]}}},"question":{"source":"data/questions.json + data-private + Ledger lib_questions","loader":"js/data.js, js/library.js","sheet":{"tab":"lib_questions","columns":["row_id","id","paper_id","question","part","year"],"id":"id","blob":true,"lib":{"name":"questions","order":1,"file":"data/questions.json","prefix":"q","key":["row_id"],"joined":{"say":"THE PAPER'S CARD, NOT COPIED (owner, 17 Nov): these fields are stored once, on the paper's own row (kind document, same paper_id), and joined onto each of its questions as the file is read (js/library.js libJoinPaper_, the backend's copy in cards-gen.gs). A question keeps one only where it differs (an override); null is none though the paper has one. source_id is read as source_id || paper_id, and dropped where it equals paper_id (21 Nov).","from":"document","by":"paper_id","fields":["name","subject","key_stage","band_type","band_value","company","exam_board","level","document_type","trackable","printable","source_url","year","paper","month","exam_wave","tier","spec_code","source_id","exam_date","pages","print_required"]},"private":["html","lead","diagram","answer","accept","choices","choice_right","order_ends","cells","mark_words","draw_answer","examiner_note","examiner_report","guide"]}},"find":{"group":"Learning","label":"Questions","under":"Practice","entries":{"question":{},"answer":{"label":"Answers"}},"facets":["forLabel","kindLabel","kindOwn","subject","documentType","level","keystage","yearGroup","bandValue","examBoard","tier","examYear","examMonth","examDay","verified","paperId","paperSection","qNumber","qPart","qSub","marks","needCalc","needs","myAttempt","source"]},"shape":"Card","bodyAs":"question","card":{"look":"qCardLook_(entry)","lookElse":"qb","id":["row_id","id"],"nameTag":false,"tagLook":"qcard-tags","name":"qCardName_(row)","tags":["subject","exam_board","level","key_stage","year"],"links":["paper_id"],"keep":"qCardKeep_(entry)","data":"kcQData_(item, entry)","question":{"stem":"qCardPic_(entry)","box":{"embed":"qsheet","look":"qsheet-embed"},"actions":"qCardTiles_(entry)","parts":{"say":"THE ONE QUESTION CARD'S PARTS, IN ORDER (owner, 22 Nov: the Sunday email draws what the site draws, nothing of its own): the picture, the tags, the stem's words, the part's words, the options of a pick question, what they answered, the verdict, then the answer. The email's card (digest.gs digestCardMaker_) is made in this order and no other; `site` is the element each part is on the site's card, which tools/one-question-card.js holds both to. No name line: the site's card has none (its number and marks are tags).","order":["pic","tags","stem","words","choices","theirs","verdict","answer"],"site":{"pic":".kc-pic > *","tags":".kc-tags .qtag","stem":".qsheet-stem","words":".qsheet.qtext","choices":".qp-optlist","theirs":".qp-ans","verdict":".qp-verdict","answer":".qans-card"}}},"toolRow":true,"letter":{"say":"THE QUESTION CARD AS THE SUNDAY EMAIL DRAWS IT (57a-62a): renderCard with an inline ink fills these styles, {token} from the email ink and the sizes here; mail clients read inline styles only.","labels":{"theirs":"Their answer","right":"Answer"},"sizes":{"radius":0,"round":999,"gap":14,"rule":"#171717","small":12,"body":16},"cut":2,"perLine":60,"cls":{"tag":"gi","verdict":"gi"},"styles":{"card":"border-bottom:1px solid {rule};border-radius:{radius}","cell":"padding:{gap}px 0;font-size:{body}px","pic":"margin:0 0 {gap}px","tags":"font-size:{small}px;line-height:24px;margin:0 0 {gap}px","tag":"color:{hue};border:1px solid{edge};border-radius:{round}px;padding:0 6px","label":"margin:{gap}px 0 4px;font-size:{small}px;color:{faint}","box":"border:1px solid {paneLine};border-radius:{round}px;padding:4px 14px;color:{ink}","value":"margin:0;color:{ink}","line":"margin:0","stem":"margin:0 0 10px;color:{dim}","words":"margin:0","choices":"margin:{gap}px 0 0","choice":"margin:0 0 4px;color:{ink}","pick":"font-size:{small}px;font-weight:bold;color:{tone}","verdict":"margin:{gap}px 0 0;font-weight:bold;color:{tone}"}}},"see":{"who":"anyone"}},"practical":{"source":"data/practicals.json + data-private + Ledger lib_practicals","loader":"js/library.js libPractical_","sheet":{"tab":"lib_practicals","columns":["practical_id","subject","level","exam_board","practical_type","excluded"],"id":"id","blob":true,"lib":{"name":"practicals","order":3,"file":"data/practicals.json","prefix":"pr","key":["practical_id"],"private":["aim","outcome","safety","maths_link","equipment","steps","notes","science","log","variables","diagram","risks"]}},"find":{"group":"Learning","label":"Practicals","under":"Library","facets":["forLabel","kindLabel","kindOwn","subject","documentType","required","level","topic","examBoard","needs"]},"shape":"Card","bodyAs":"reference","card":{"look":"prac kc-facts","id":["id","practical_id"],"tags":["subject","level","board","exam_board","documentType","practical_type"],"lines":true,"off":"excluded","parts":["practical"]},"see":{"who":"anyone"}},"project":{"source":"data/projects.json + data-private + Ledger lib_projects","loader":"js/library.js libProject_","sheet":{"tab":"lib_projects","columns":["project_id","subject","level","exam_board","project_type"],"id":"id","blob":true,"lib":{"name":"projects","order":4,"file":"data/projects.json","prefix":"pj","key":["project_id"],"private":["materials","steps","safety","share"]}},"find":{"group":"Learning","label":"Projects","under":"Library","facets":["forLabel","kindLabel","kindOwn","documentType","subject","level","topic","examBoard"]},"shape":"Card","bodyAs":"reference","card":{"look":"prac proj lib-c kc-facts","id":["id","project_id"],"tags":["subject","level","board","exam_board","documentType","project_type"],"lines":true,"parts":["project"]},"see":{"who":"anyone"}},"content":{"source":"data/textbooks.json + Ledger lib_content","loader":"js/library.js -> find-facets.js","sheet":{"tab":"lib_content","columns":["book_id","chapter","subject","level","keystage","board","tier"],"id":"id","blob":true,"lib":{"name":"textbooks","order":2,"file":"data/textbooks.json","prefix":"ct","key":["book_id","chapter"],"skip":"anim","private":["idea","words","points","formulas","diagram"]}},"find":{"group":"Learning","label":"Library","facets":["forLabel","kindLabel","subject","histKind","wWork","documentType","level","keystage","yearGroup","topic","examBoard","specTopic","specPoint","tier"]},"shape":"Card","bodyAs":"reference","card":{"look":"prac tb ct lib-c","id":"kcContentId_(row)","tags":["subject","level","keystage","board","tier"],"lines":true,"parts":["topic"],"slots":{"say":"THE TOPIC CARD (rule 1.80, owner 17 Nov): three slots in this order, an empty one hidden: the idea in one line; the animation or figure; the content, everything the topic needs and nothing else. Read by contentBody_ (find-facets.js) and histTopicBody_ (history-topics.js, each History card: its `idea`, the timeline or picture, the content); tools/content/library.js drive-pack refuses a card that breaks it.","order":["idea","figure","content"],"idea":"idea","figure":["anims","diagram"],"content":["words","formulas","points"],"refuse":["Worked example","Common mistake","Check","Example","Exam tip","Tip","Quick question","Question"]}},"see":{"who":"anyone"}},"insert":{"source":"data/inserts.json + Ledger lib_inserts","loader":"js/library.js -> find-history.js","sheet":{"tab":"lib_inserts","columns":["insert_id","subject","boards","levels"],"id":"id","blob":true,"lib":{"name":"inserts","order":5,"file":"data/inserts.json","prefix":"in","key":["insert_id"],"newer":true,"private":["source_text"]}},"find":{"group":"Learning","label":"Inserts","facets":["forLabel","kindLabel","subject","level","keystage","examBoard","tier"],"under":"Practice"},"shape":"Card","bodyAs":"reference","card":{"look":"insh","id":["id","insert_id"],"tags":["subject","boards","board","levels","level"],"links":["forPapers"],"lines":true,"entryTags":{"sheets":2},"parts":["insert"]},"see":{"who":"anyone"}},"spec":{"source":"data/specs.json","loader":"js/library.js -> find-history.js","find":{"group":"Learning","label":"Specification","under":"Library","facets":["forLabel","kindLabel","kindOwn","subject","level","keystage","examBoard","tier"]},"shape":"Card","bodyAs":"reference","card":{"look":"insh spec-sheet","name":"code","tags":["board","qualification","subject","level"],"lines":true,"parts":["spec"]},"see":{"who":"anyone"}},"manuscript":{"source":"data/manuscripts.json","loader":"js/library.js HIST_DB -> find-history.js histItem_","find":{"group":"Learning","label":"Library","facets":["forLabel","kindLabel","subject","shelf","histKind","wLanguage","histEra","histMaterial","histFormat","histRepository","histSide","histFound","histDated"]},"shape":"Card","bodyAs":"reference","card":{"look":"hdb hdb-msc lib-c","tags":["language","material","script"],"links":["writings"],"picture":"kcMsPic_(item, entry)"},"see":{"who":"anyone"}},"figure":{"shape":"Card","bodyAs":"person","source":"data/figures.json (+ portraits.json)","loader":"js/library.js HIST_DB -> histItem_ as kind people","find":{"group":"Learning","label":"Library","facets":["forLabel","kindLabel","subject","shelf","histKind","documentType","fighter","decade","division","histEra","histRole","personName","personYears","personFrom"]},"card":{"look":"person lib-c","card":"people","when":"hdb","tags":["roles","eras"],"links":["writings","events"]},"see":{"who":"anyone"}},"boxer":{"shape":"Card","bodyAs":"person","source":"data/boxers.json","loader":"js/library.js libExtrasBoxing_ -> find-aloud.js","find":{"group":"Learning","label":"Library","facets":["forLabel","kindLabel","subject","shelf","histKind","documentType","fighter","decade","division","histEra","histRole","personName","personYears","personFrom"]},"card":{"look":"person lib-c","card":"people","id":["id","boxer_id"],"tags":["country","bestDivision","best_division","stance"]},"see":{"who":"anyone"}},"writing":{"source":"data/writings.json","loader":"js/library.js HIST_DB -> find-history.js histItem_","find":{"group":"Learning","label":"Library","facets":[]},"shape":"Card","bodyAs":"reference","card":{"look":"hdb lib-c","tags":["language","genre"],"links":["author_id","manuscripts"]},"see":{"who":"anyone"}},"event":{"source":"data/timeline.json","loader":"js/library.js HIST_DB -> find-history.js histItem_","find":{"group":"Learning","label":"Library","entries":{"event":{},"timeline":{"label":"Timeline","under":"Library"}},"facets":["forLabel","kindLabel","subject","shelf","histKind","histEra","histTheatre"]},"shape":"Card","bodyAs":"reference","card":{"look":"hdb lib-c","tags":["era","theatre"],"links":["figures","writings"]},"see":{"who":"anyone"}},"fight":{"source":"data/fights.json","loader":"js/library.js libExtrasBoxing_ -> find-aloud.js","find":{"group":"Learning","label":"Library","facets":["forLabel","kindLabel","subject","shelf","documentType","fighter","examMonth","examYear","decade","division","boutRound","boutMethod","boutWinner","boutEvent","examDay"]},"card":{"look":"fight","id":["id","fight_id"],"name":"kcFightName_(row)","nameTag":false,"lines":true,"tags":["division"],"links":["aId","bId","boxer_a_id","boxer_b_id"],"body":"fightBody_(row)"},"see":{"who":"anyone"}},"libcard":{"source":"a library card: one passage of a text collection (js/bible.js, talmud.js, quran.js, works.js, hadith.js, texts.js, pdtexts.js, orthodox.js, hymns.js)","find":{"group":"Learning","label":"Library","entries":{"bible":{},"talmud":{},"quran":{},"worktext":{},"hadith":{},"writ":{},"pdtext":{},"orthotext":{},"hymn":{}}},"see":{"who":"anyone"}},"mech":{"source":"data/mechanics/*.json","loader":"js/mechanics.js","find":{"group":"Learning","label":"Library","facets":["forLabel","kindLabel","subject","shelf","mMake","mModel","mGen","mEngine","documentType","mSystem","pcType","pcSocket","pcIface","pcLinks","mPhase","mMarket","mYears","mSize","mValves","mBadge","mFuel","mPart","mPrice"]},"shape":"Card","bodyAs":"reference","card":{"look":"mech","from":"mech","tags":["system","type","make"],"links":["fits"],"nameTag":false,"lines":true,"picture":"kcMechPic_(item)","parts":[{"text":"does","look":"mech-does"}]},"see":{"who":"anyone"}},"chem":{"source":"data/chemistry/*.json","loader":"js/chemistry.js","find":{"group":"Learning","label":"Library","facets":["forLabel","kindLabel","subject","documentType","cCategory","cGroup","cPeriod","cState"]},"shape":"Card","bodyAs":"reference","card":{"look":"tx kc-facts","from":"chem","tags":["category","type","block","state"],"lines":true,"parts":[{"paras":["fields",{"each":"examples","f":"equation"},"source"]}],"fields":{"say":"THE CARD'S FACT LINES (unify job J, master decides card fields): in this order, each `label` then the row's `f`, an empty one left out. Read by chemBody_ through cardFieldsOf_ (js/cards-render.js); tools/card-fields.js fails a field list written anywhere else.","list":[{"label":"Symbol","f":"symbol"},{"label":"Atomic number","f":"number"},{"label":"Relative atomic mass","f":"mass"},{"label":"Block","f":"block"},{"label":"Electron configuration","f":"config"},{"label":"Discovered","f":"discovered"},{"label":"Also called","f":"also"},{"label":"Formula","f":"formula"},{"label":"Use","f":"use"},{"label":"Hazard","f":"hazard"},{"label":"Pattern","f":"pattern"},{"label":"Conditions","f":"conditions"},{"label":"Observations","f":"observations"}]}},"see":{"who":"anyone"}},"hist":{"source":"one file a topic, data/library/history/<id>.json: its timeline, people, sources and items, a card each","loader":"js/history-topics.js","find":{"group":"Learning","label":"Library","facets":["forLabel","kindLabel","subject","histKind","histPart","level","keystage"]},"shape":"Card","bodyAs":"reference","card":{"look":"lib-c kc-facts","from":"hist","tags":["topicName","partName"],"lines":true,"picture":"histTopicPic_(raw)","parts":["history"]},"see":{"who":"anyone"}},"tool":{"source":"js/map.js WIDGETS (kind tool)","find":{"group":"Tools","label":"Tools","under":"Tools"},"see":{"who":"anyone"},"entries":{"docket":{"say":"Docket (owner, 18 Nov; one list, names only, 25 Nov night): the owner's one list like Google Tasks — a title, an 8h repeat or a date, ticked; kept in their own `todo` cell; js/map.js dkCard_ draws it","who":"owner"},"assignments":{"say":"Assignments (owner, 18 Nov): anybody signed in keeps their school or uni work — its fields, lists and form are the `assignment` kind below; kept in their own `assignments` cell (assignmentsSave), loaded many at once by `assignmentsImport`, read by `assignmentsOf` for a parent, a booked tutor or the admin. js/map.js WIDGETS.","who":"signedIn"}}},"docket":{"shape":"Card","bodyAs":"item","list":{"name":"Docket","say":"ONE LIST KIND (owner, 22 Nov, UNIFY NEXT 6; one list, names only, owner 25 Nov night): the owner's own lists are one kind of list, each item tidied by the one tidy (post-account.gs listTidy_). The Docket keeps its storage, the owner's `todo` cell as { v, lists: [{ name: \"Docket\", items }] } (one list); an item is its title, an 8h repeat or none, a date or none, and its done state; a save keeps what the cell had (`save: as-is`), the import makes each item whole; a one-off ticked before today leaves (`gone`).","store":{"cell":"todo","wrap":"lists"},"most":300,"need":["title"],"save":"as-is","gone":{"done":"done","on":"doneOn","daily":"repeat"},"fields":[{"f":"title","type":"text","max":300},{"f":"date","type":"date"},{"f":"repeat","type":"choice","options":["8h"],"def":""},{"f":"done","type":"flag","off":{"f":"repeat","is":"8h"}},{"f":"doneOn","type":"text","max":13},{"f":"runs","type":"number","min":0,"max":100000,"say":"minutes it runs by itself once started (owner, 25 Nov night: the one hidden number); within Now the most first (js/map.js dkSort_)"}]},"source":"the owner's Docket (owner, 20 Nov; one list, names only, 25 Nov night): their own `todo` cell, read by js/map.js dkItems_ as one card, drawn by dkCard_ like Google Tasks: each item one line, its tick and title, sorted by dkSort_ (Overdue, then the 8-hourly not yet done this third, then dated one-offs by date, then undated, then a folded Done (n)); a tapped line shows only Edit (its name) and Delete; a quick add at the foot (rules.json 1.82)","find":{"group":"Tools","label":"Docket","under":"Tools","draw":"dkCard_","facets":["forLabel","kindLabel","toolName"]},"see":{"who":"owner"},"forms":{"docket-address":{"draft":false,"attr":"data-dka","say":"the owner's private plain-text address (owner, 21 Nov): the Docket's Private address tile opens it; the backend's doGet `?docket=<token>` answers the Docket's open items as text, `&do=done&what=` ticks, `&do=add&what=` adds. Make a new address (action docketAddress, renew) kills the old token.","fields":[{"f":"address","type":"text","label":"Your private address","input":"url"}]},"docket-item":{"draft":false,"attr":"data-dke","say":"a docket item's name (owner, 25 Nov night: names only): its Edit tile opens this form in its line, Save under it, saved whole through dkSave_.","fields":[{"f":"title","type":"text","label":"Title"}]}}},"game":{"source":"js/map.js WIDGETS (kind game)","find":{"group":"Games","label":"Games","under":"Games"},"see":{"who":"anyone"}},"soon":{"source":"tiers.json: a switched-off widget","find":{"group":"Coming soon","label":"Coming soon","under":"Coming soon"},"see":{"who":"anyone"}},"person":{"shape":"Card","bodyAs":"person","source":"Ledger people tab","loader":"payload -> find-doors.js","sample":"check/fixture.json everyone","sheet":{"tab":"people","columns":["personId","first","last","handle","role","email","dob"],"never":["pin"],"id":"person_id","owner":["person_id"],"kindBy":{"column":"role","match":"tutor","kind":"tutor"},"show":["person_id","role","first_name","last_name","handle","email","phone","date_of_birth","photo","avatar","favourite_colour","xp","credits","children","joined_on","exam_small_date","exam_big_date"]},"find":{"group":"Profiles","label":"Profiles","under":"Profiles","facets":["forLabel","kindLabel","profileType"]},"card":{"look":"is-prof kc-facts","id":["personId","id"],"name":"fmtName_(row)","tags":["role","handle"],"lines":true,"parts":["door","facts"],"picture":"profFace_(entry, 160)","tiles":"peopleOpts_(raw)"},"see":{"who":"self, family, staff, admin","hide":{"prices":["rate_per_hour","extra_seat_rate","extra_seat_cut"]}},"forms":{"person-add":{"attr":"data-pa","fields":[{"f":"first","type":"text","ph":"First name"},{"f":"last","type":"text","ph":"Last name"},{"f":"role","type":"choice","label":"Role","draft":false},{"f":"email","type":"text","input":"email","ph":"Email","phKid":"Email (optional)"},{"f":"dob","type":"date","label":"Date of birth (optional)"}],"draft":"form"},"person-form":{"attr":"data-pf","fields":[{"f":"first","type":"text","ph":"First name","row":"names"},{"f":"last","type":"text","ph":"Last name","row":"names"},{"f":"roles","type":"ticks","attr":"data-pf-role","label":"Role","look":"pf-roles","tickLook":""},{"f":"email","type":"text","input":"email","ph":"Email (optional)"},{"f":"dob","type":"date","label":"Date of birth (optional)"},{"f":"parents","type":"ticks","attr":"data-pf-parent","label":"Parents","draft":false,"look":"pf-ticks","tickLook":""},{"f":"parent","type":"choice","label":"Their parent (optional)","draft":false}],"draft":"form"},"person-edit":{"attr":"data-pe","fields":[{"f":"first_name","type":"text"},{"f":"last_name","type":"text"},{"f":"handle","type":"text","label":"handle (theirs to change)","readonly":true},{"f":"dob","type":"date","label":"date of birth"},{"f":"email","type":"text","input":"email"},{"f":"phone","type":"phone","input":"tel"},{"f":"address","type":"text"},{"f":"postcode","type":"text"}],"draft":"form"},"settings":{"attr":"data-me","draft":"set","fields":"groups","say":"Settings cards: the backend's field groups; a timetable group is the week grid, lib/qual/job/photo names their shelves, dob_* the three boxes, phone the code and number, photo the picture."},"library-card":{"attr":"data-me","draft":"set","say":"one library card on the shelf; a library PIN is not a sign-in PIN and keeps no draft (setDraftOk_).","fields":[{"f":"lib{n}_name","type":"text","ph":"Library name","look":"lib-name","quiet":true},{"f":"lib{n}_pin","type":"text","label":"PIN","look":"lib-pin","quiet":true,"blank":true},{"f":"lib{n}_no","type":"text","ph":"Card number","look":"lib-no","quiet":true}]},"job":{"attr":"data-me","draft":"set","say":"one job on the shelf: role, where, from–to.","fields":[{"f":"job_{n}_role","type":"text","ph":"role","max":80},{"f":"job_{n}_where","type":"text","ph":"where","max":80},{"f":"job_{n}_from","type":"text","ph":"from","max":80},{"f":"job_{n}_to","type":"text","ph":"to, or now","max":80}]},"dob":{"attr":"data-me","draft":"set","say":"a date of birth as three boxes.","fields":[{"f":"dob_d","type":"text","ph":"DD","max":2,"pad":"numeric"},{"f":"dob_m","type":"text","ph":"MM","max":2,"pad":"numeric"},{"f":"dob_y","type":"text","ph":"YYYY","max":4,"pad":"numeric"}]},"family-pick":{"attr":"data-fam-q","draft":false,"say":"a family picker: a name looked up, not work, retyped in a second.","fields":[{"f":"{scope}","type":"search","ph":"name or @handle","want":"{want}"}]},"notify":{"attr":"data-do","draft":false,"say":"Notifications: each tick a setNotify the moment it is ticked (formToggle_).","fields":[{"f":"kinds","type":"toggles"}]},"apply-teach":{"attr":"data-app","gaps":[{"say":"your full name","all":["fullName:filled"]},{"say":"your phone number","all":["phone:filled"]},{"say":"your email address","all":["email:email"]},{"say":"your home address and postcode","all":["address:filled","postcode:postcode"]},{"say":"your date of birth","all":["dob:isodate"]},{"say":"a photo of your ID","all":["idDoc:image"]},{"say":"a photo of your right-to-work document","all":["rtwDoc:image"]},{"say":"the subjects and levels you teach","all":["subjects:filled"]},{"say":"your qualifications, listed and with at least one photo","all":["qualifications:filled","qualDocs:pics"]},{"say":"whether you have the right to work in the UK","all":["rightToWork:yesno"]},{"say":"your enhanced DBS number and the Update Service tick, or \"I need one\"","any":[["dbsNeeded:yes"],["dbsNumber:filled","dbsUpdate:yes"]]},{"say":"2 references, each with a name, relationship, email and phone","all":["ref1Name:filled","ref1Relationship:filled","ref1Email:email","ref1Phone:filled","ref2Name:filled","ref2Relationship:filled","ref2Email:email","ref2Phone:filled"]},{"say":"when you can teach","all":["availability:filled"]},{"say":"your hourly rate","all":["rate:rate"]},{"say":"a short statement","all":["statement:filled"]},{"say":"the consent tick","all":["consent:yes"]}],"draft":"form","say":"Apply to teach (400): one sheet, kept as drafts until it is sent.","fields":[{"f":"","type":"head","label":"You"},{"f":"fullName","type":"text","label":"full name"},{"f":"phone","type":"text","input":"tel","label":"phone","row":"r1"},{"f":"email","type":"text","input":"email","label":"email","row":"r1"},{"f":"address","type":"long","label":"home address"},{"f":"postcode","type":"text","label":"postcode","caps":true,"row":"r2"},{"f":"dob","type":"date","label":"date of birth","row":"r2"},{"f":"","type":"head","label":"Documents"},{"f":"idDoc","type":"doc","label":"photo ID — passport or driving licence"},{"f":"rightToWork","type":"choice","label":"right to work in the UK","options":[["","Choose"],["yes","Yes"],["no","No"]]},{"f":"rtwDoc","type":"doc","label":"right-to-work document — passport, share code or visa"},{"f":"","type":"head","label":"What you teach"},{"f":"subjects","type":"subjects"},{"f":"qualifications","type":"long","label":"qualifications — degrees, teaching qualifications, anything relevant"},{"f":"qual0","type":"doc","label":"a qualification certificate"},{"f":"qual1","type":"doc","label":"another qualification certificate (optional)"},{"f":"qual2","type":"doc","label":"another qualification certificate (optional)"},{"f":"rate","type":"money","input":"number","label":"hourly rate (£)","min":"1","step":"0.5"},{"f":"","type":"head","label":"Checks"},{"f":"dbsNumber","type":"text","label":"enhanced DBS certificate number","row":"r3"},{"f":"dbsIssued","type":"date","label":"issued on","row":"r3"},{"f":"dbsUpdate","type":"tick","label":"I consent to you checking it on the DBS Update Service"},{"f":"dbsNeeded","type":"tick","label":"I need a DBS check"},{"f":"","type":"head","label":"When and where"},{"f":"availability","type":"timetable","label":"when you can teach"},{"f":"area","type":"text","label":"area and venues you can reach"},{"f":"experience","type":"long","label":"experience"},{"f":"","type":"head","label":"2 references"},{"f":"ref1Name","type":"text","label":"name","row":"a1"},{"f":"ref1Relationship","type":"text","label":"relationship to you","row":"a1"},{"f":"ref1Email","type":"text","input":"email","label":"email","row":"b1"},{"f":"ref1Phone","type":"text","input":"tel","label":"phone","row":"b1"},{"f":"ref2Name","type":"text","label":"name","row":"a2"},{"f":"ref2Relationship","type":"text","label":"relationship to you","row":"a2"},{"f":"ref2Email","type":"text","input":"email","label":"email","row":"b2"},{"f":"ref2Phone","type":"text","input":"tel","label":"phone","row":"b2"},{"f":"statement","type":"long","label":"a short statement — why you want to teach"},{"f":"cvLink","type":"text","input":"url","label":"CV link (optional)","ph":"https://…"},{"f":"consent","type":"tick","label":"I agree to @family. keeping these details and documents privately to consider my application, contacting my referees and checking my DBS."}]},"sign-join":{"ask":"find","say":"Make an account, asked in Find one field a step (owner, 16 Nov: one form): who it is for, whose email, the names, the email and a 4-digit PIN; sent as the existing `register`. The PIN is held in memory for the call only, never stored. only: asked when an earlier answer is this.","send":{"say":"make-my-account"},"fields":[{"f":"who","type":"choice","label":"Who is the account for?","note":"Both are free; teaching starts with \"Apply to teach\" once you are in.","options":[{"v":"parent","say":"client-i-book-and-pay"},{"v":"student","say":"student-im-learning"}]},{"f":"kid","type":"choice","only":{"who":"student"},"label":"Whose email will you give?","options":[{"v":"own","t":"My own email"},{"v":"grown-up","say":"its-a-grown-ups-email"}]},{"f":"first","type":"text","ph":"First name"},{"f":"last","type":"text","ph":"Last name"},{"f":"email","type":"text","input":"email","ph":"Email"},{"f":"pin","type":"pin","label":"PIN — 4 digits"}],"draft":"ask"},"sign-in":{"ask":"find","say":"Signing in, Find's first step (owner, 13 Nov): the name typed on the blank tag, then the PIN a digit a tag; sent as `verifyLogin` on the last digit. The digits are never kept.","fields":[{"f":"who","type":"text","ph":"Username or email","label":"Your username or email"},{"f":"pin","type":"pin"}]},"pin-change":{"ask":"find","say":"Settings' Signing in card (owner, 16 Nov: one form): your PIN now, the new one, and it again, a digit a tag; sent as the existing `changePin`. The digits are held for the call only, never stored.","send":{"t":"Save"},"back":"one","fields":[{"f":"now","type":"pin","label":"current PIN"},{"f":"new","type":"pin","label":"new PIN, 4 numbers, not 1234"},{"f":"again","type":"pin","label":"new PIN again"}]}},"facts":{"say":"WHAT THE OWNER STATES ABOUT A PERSON (owner, 16 Nov): one row a fact, {who, what, value, as_of}. `what` is one of `keys`; a value may be a range (\"7-8\"). Values age by themselves (`ages`): school_year goes up one each 1 September after as_of, age one each year after as_of. Shown on the person's card to staff (tutors) and admins only (`see`), never to a child or another family. Sent as backend payload `personFacts`; kept in the items tab as kind `fact` (17 Nov). A PIN is never a fact.","row":{"who":"person id (P010)","what":"a key from `keys`","value":"text; a range is \"a-b\"","as_of":"date (yyyy-mm-dd)"},"keys":["age","school_year","course","board","set_texts","school","subjects","target_grade","needs","business","ventures","notes"],"ages":{"school_year":"september","age":"year"},"see":["admin","staff"],"store":{"tab":"facts","payload":"personFacts","until":"events record","say":"moved to the items tab (ledger.moved `fact`, 17 Nov): still read and written as core.gs read('facts')"}}},"setting":{"source":"js/me-settings.js","find":{"group":"Settings","label":"Settings","under":"Settings","entries":{"setting":{},"history":{"say":"History (owner, 18 Nov): every student's card in Settings › Student — pick a day, see its questions, marks and the Sunday email's own summary (`history` action: digestLearners_ + digestSummary_ over one day). js/work-file.js historyCard_."}}},"see":{"who":"anyone"},"cardsSay":"THE SETTINGS CARDS (job E, 20 Nov): the one list of fixed card ids; each card carries its id as data-card (renderCard spec.card). col is its account type's group, only marks the one place a setting is edited, say is Find's line. THE ONE REGISTRY (unify batch 9, was setting-for.json): its order is Find's order; a `type:<T>` row is an account type (col its group, label the group's name, admin an admin's); `under` lists the other types a card is found under (menu grouping, never who sees it, which is permissions.json), `find` its name in Find when not its title, notes the why. The set:<col>:<group> groups the payload draws are written out; CARD_DYN (find-doors.js) is only the fallback for one not listed.","cardSay":"ONE SETTINGS CARD (owner, 22 Nov, after PR 670's four shapes): every settings card is the one `cardType` (never `card`, which names a kind's card spec and would make ITEM_MAPS draw every setting empty, 23 Nov) — a title, a stack of rows, optional buttons — drawn by setCard_ (js/me-shelves.js) and marked data-shape. A row is one of `rows`: text (a fact), field (a box typed into or picked), item (a list entry that opens on tap); setCard_ marks each row data-row. A card that saves as you type is listed in `typed` (ids) or `typedBy` (id patterns): a field behaviour, not another card. tools/one-settings-card.js fails on a second card type or a fourth row kind.","cardType":"Card","rows":["text","field","item"],"typed":["acct:pin","acct:roles","acct:notify","set:notify","acct:voice"],"typedBy":["^set:","^own:"],"cards":[{"id":"type:Student","col":"account","label":"Kids settings","notes":"the Student account type; its cards are the account column's."},{"id":"type:Parent","col":"family","label":"Parent settings","notes":"the Parent account type; its cards are the family column's."},{"id":"type:Staff","col":"staff","label":"Tutor settings","notes":"the Staff account type; its cards are the staff column's."},{"id":"type:Apprentice","col":"apprentice","label":"Apprentice settings","notes":"the Apprentice account type; who opens it is permissions.json's see rows (tutor, admin)."},{"id":"type:Admin","col":"","label":"","notes":"the Admin account type, a tag only."},{"id":"type:Business","col":"biz","label":"Biz settings","admin":true,"notes":"the Business account type: the business's own data, an admin's (permissions.json)."},{"id":"type:Site","col":"site","label":"Web settings","admin":true,"notes":"the Site account type, an admin's (permissions.json)."},{"id":"own:account:picture","under":["Student","Parent","Staff","Apprentice","Admin"],"notes":"everybody's picture."},{"id":"own:account:figure","under":["Student","Parent","Staff","Apprentice","Admin"],"find":"Your figure","notes":"the figure drawn for you; its card has no title of its own."},{"id":"own:account:name","under":["Student","Parent","Staff","Apprentice","Admin"],"notes":"first and last name, one item for every account type."},{"id":"own:account:handle","under":["Student","Parent","Staff","Apprentice","Admin"],"find":"Handle","notes":"the @handle; its card has no title of its own."},{"id":"set:account:about-you","under":["Student"],"find":"Date of birth","notes":"identity: a few words about you, next to your name."},{"id":"set:account:contact-address","under":["Student","Parent","Staff","Apprentice","Admin"],"notes":"email, phone and address are everybody's."},{"id":"acct:signed-in","col":"account","label":"Signed in","say":"Sign in, or who is signed in on this phone and Sign out.","under":["Student","Parent","Staff","Apprentice","Admin"],"notes":"every account signs in and out the same way: one item, found under each account type (owner, 7 Nov)."},{"id":"acct:pin","col":"account","label":"Signing in","only":"your PIN","say":"Change the PIN you sign in with.","under":["Student","Parent","Staff","Apprentice","Admin"],"notes":"every account has a PIN."},{"id":"acct:roles","col":"account","label":"Your role","only":"your role","say":"Whether this account is a student's or a parent's.","under":["Student","Parent","Staff","Apprentice","Admin"],"notes":"which roles this account holds."},{"id":"staff:apply","col":"staff","label":"Apply to teach","say":"Ask to teach with us; the admin says yes or no.","under":["Student","Parent","Staff"],"notes":"Apply to teach: a signed-in grown-up with no staff role (permissions.json see rows; never a child, 4h)."},{"id":"acct:notify","col":"account","label":"Notifications","only":"which emails you get","say":"Which emails we send you.","under":["Student","Parent","Staff","Apprentice","Admin"],"find":"Notifications","notes":"which emails you get; one Notifications item with the phone's (acct:push), same name merges."},{"id":"set:notify","under":["Admin","Business"],"find":"Notifications","notes":"what needs an admin, merged by name into the one Notifications item."},{"id":"acct:voice","col":"account","label":"Reading aloud","say":"How questions sound when they are read aloud on this device.","under":["Student","Parent","Staff","Apprentice","Admin"],"notes":"reading aloud is a setting of this device, whoever holds it."},{"id":"acct:workfile","col":"account","label":"Work on file","say":"Pages you scanned or photographed, kept on your account.","under":["Student","Staff"],"notes":"a student's scanned pages on their account; a tutor's card opens each booked student's (owner, 11 Nov)."},{"id":"acct:progress","col":"account","label":"Progress","say":"Your streak, marks and grade, each source question by question, and any day's answers.","under":["Student"],"find":"Progress","notes":"ONE card (4g, owner 20 Nov): streak, last 7 days, marks and grade; a row per source opening question by question; then the day view (History). It replaced History, Questions, Recent activity, Work on next, Grade estimate and the per-source cards."},{"id":"acct:brownie","col":"account","label":"Brownie points","say":"A placeholder: points for good work.","under":["Student"],"notes":"role-specific, a student's: progress after the account items."},{"id":"acct:roadmap","col":"account","label":"Roadmap","say":"A placeholder: how much of the syllabus is left.","under":["Student"]},{"id":"acct:conduct","col":"account","label":"Code of conduct","say":"A placeholder: the code of conduct.","under":["Student"]},{"id":"acct:prog-sessions","col":"account","label":"Progress: sessions","say":"Your booked and past sessions.","under":["Student"]},{"id":"set:staff:about-you","under":["Staff"],"find":"About your teaching","notes":"Staff card parts in the order a family reads the card (CARD_SECTIONS): words, rate, photos, qualifications, where, when."},{"id":"set:staff:your-rate-and-group-size","under":["Staff"]},{"id":"set:staff:photos","under":["Staff"]},{"id":"set:staff:qualifications","under":["Staff"]},{"id":"set:staff:where-you-teach","under":["Staff"]},{"id":"set:staff:when-i-can-teach","under":["Staff"]},{"id":"staff:lego","col":"staff","label":"LEGO piece check","say":"Count a trade-in set's pieces from photos, against its parts list.","under":["Staff","Admin"],"find":"LEGO piece check","notes":"a trade-in set's pieces counted from photos, a batch at a time, against its parts list (lego.js, owner 12 Nov)."},{"id":"staff:hub","col":"staff","label":"Staff hub","only":"your rate and hours","say":"Your terms, weekly hours, prices and statement as a tutor.","under":["Staff"],"notes":"the staff hub after the card parts."},{"id":"appr:blurb","col":"apprentice","label":"Apprentice settings","say":"Work experience with us: a placeholder until it is built.","under":["Apprentice"],"find":"Work experience","notes":"the apprentice placeholder; its card has no title of its own."},{"id":"site:digest","under":["Business"],"find":"Weekly email","notes":"the Sunday email to parents as the backend sends it (digestPreview); found under Business, an admin's only (owner, 8 Nov)."},{"id":"site:digest-words","under":["Business"],"find":"Weekly email's words","notes":"the subject, greeting, first and last lines of that email, beside its look (owner, 8 Nov)."},{"id":"site:inbox","under":["Business"],"find":"Email","notes":"the last four emails in the admin Gmail, read-only, a static overview (owner, 11 Nov: back from the old site)."},{"id":"site:template","col":"site","label":"Card template","say":"The one template every card is drawn by, and the fixed sizes and colours.","under":["Business"],"find":"Card template","notes":"the one template every card is drawn by, shown as a live sample with its parts named, and the fixed scale read from style.css (owner, 11 Nov)."},{"id":"door:notify","under":["Business"],"notes":"who sees the Notifications door under Business (its card is set:notify, which keeps its own place)."},{"id":"biz:settings","under":["Business"],"find":"Business settings","notes":"every business setting in one list (owner, 9 Nov): share B, fees, discounts, rates, then venues and rooms; bookings only read them."},{"id":"ppl:students:help","col":"students","label":"Needs help","say":"Students who have asked for help with a question."},{"id":"ppl:students:add","col":"students","label":"Add a student","say":"Make an account for a new student."},{"id":"ppl:students:search","col":"students","label":"Find by handle","say":"Find a student by their handle, to add them as your child."},{"id":"ppl:students:family","col":"students","label":"You and your family (students)","say":"You and the children linked to you."},{"id":"ppl:students:manage","col":"students","label":"Manage your child","say":"Link your child's account to yours, or answer a link."},{"id":"ppl:students:all","col":"students","label":"Every student","say":"Every student account."},{"id":"ppl:parents:add","col":"parents","label":"Add a parent","say":"Make an account for a new parent."},{"id":"ppl:parents:you","col":"parents","label":"Your card (Parent profiles)","say":"Your own card as a parent."},{"id":"ppl:parents:family","col":"parents","label":"You and your family (parents)","say":"The parents linked to you."},{"id":"ppl:parents:claims","col":"parents","label":"Parent claims","say":"Parents asking to be linked to a child."},{"id":"ppl:parents:all","col":"parents","label":"Every parent","say":"Every parent account."},{"id":"site:stability","col":"site","label":"Stability","say":"How stable the code is, scored from its exceptions, special cases and dead code."},{"id":"site:rename","col":"site","label":"Rename every username","say":"Move everybody onto the username format, once: preview the list, then apply."},{"id":"biz:build","col":"site","label":"Build","say":"Which version of the site and backend is running."},{"id":"set:staff:jobs","notes":"a settings group (setCardId_), known by its id; no row of tags, so under its own type only."}]},"health":{"source":"site health (js/health*.js)","find":{"group":"Settings","label":"Settings","under":"Settings"},"see":{"who":"admin"}},"post":{"source":"Ledger posts tabs","loader":"backend get-posts.gs -> find-doors.js","sample":"check/fixture.json posts","sheet":{"tab":"posts","columns":["text","caption","title","location","authorId"],"id":"post_id","owner":["posted_by"]},"find":{"group":"Posts","label":"Posts","under":"Posts","entries":{"post":{},"offPosts":{}},"facets":["forLabel","kindLabel","postState","postBy","postWhen"],"onCard":false},"shape":"Card","bodyAs":"record","card":{"look":"post-fc","record":{"name":[["text","caption","title","=Post"]],"nameMax":80},"tags":["location"],"links":["authorId"]},"see":{"who":"signedIn"}},"product":{"shape":"Card","bodyAs":"item","source":"Ledger shop tab (data/settings/shop.json, data/shop-additions.json)","loader":"backend get-shop.gs -> find-aloud.js findMineItems_ (its Find entry is its row)","sample":"check/fixture.json shop","sheet":{"tab":"shop","columns":["name","shopKind","shopHow","shopBrand","shopTheme","shopFor","cost","level","image"],"id":"item_id"},"find":{"group":"Shop","label":"Things","under":"Shop","draw":"findShopCard_","entries":{"shop":{},"offShop":{"label":"Shop","draw":""}},"facets":["forLabel","kindLabel","kindOwn","documentType","shopHow","shopPrice","mMake","shopFor","shopTheme"]},"card":{"card":"shop","from":"entry","id":["key","name"],"tags":["documentType","shopHow","shopPrice","mMake","shopTheme","shopFor"],"facts":true,"tagLook":"qcard-tags","look":{"wearable":"is-wear","off":"is-off"},"picture":"image","price":true},"see":{"who":"anyone"}},"paper":{"source":"data/questions.json paper_id (+ data/expected-papers.json)","shape":"Card","bodyAs":"question","find":{"facets":["paperId"]},"see":{"who":"anyone"}},"partner":{"shape":"Card","bodyAs":"item","source":"the owner's business partners (owner, 17 Nov); rows in the items tab","sheet":{"tab":"partners","id":"partner_id","columns":["partner_id","who","business","together","terms","status"]},"find":{"group":"Life","label":"Partners","under":"Settings","from":"store","new":"New partner","facets":["forLabel","kindLabel","partnerStatus"],"facetCols":{"partnerStatus":"status"}},"card":{"look":"kc-facts","lines":true,"name":"business","tags":["status"],"links":["who"]},"see":{"who":"admin"},"forms":{"partner-new":{"ask":"find","store":true,"skip":true,"send":{"t":"Save"},"say":"the \"New partner\" card in Find (form.js storeSend_): one field a step, any left empty, sent as the one action `item` (mode write).","fields":[{"f":"who","type":"text","label":"Who (their person id)"},{"f":"business","type":"text","label":"Business"},{"f":"together","type":"long","label":"What we could do together"},{"f":"terms","type":"text","label":"Terms / %"},{"f":"status","type":"choice","label":"Status","options":[{"v":"idea","t":"Idea"},{"v":"talking","t":"Talking"},{"v":"agreed","t":"Agreed"},{"v":"running","t":"Running"},{"v":"ended","t":"Ended"}]}]}}},"food":{"shape":"Card","bodyAs":"item","list":{"name":"Food","say":"ONE LIST KIND (UNIFY NEXT 6): kept as rows of the items tab (`food`), each write tidied by listTidy_ as it is sent (`save: as-is`, only the fields sent).","store":{"tab":"food"},"save":"as-is","fields":[{"f":"name","type":"text","max":300},{"f":"shop","type":"text","max":200},{"f":"price","type":"text","max":40},{"f":"minutes","type":"text","max":40},{"f":"meal","type":"choice","options":["breakfast","lunch","dinner","snack"],"def":""},{"f":"how","type":"text","max":8000}]},"source":"the owner's food: what, where, cost, time (owner, 17 Nov); rows in the items tab","sheet":{"tab":"food","id":"food_id","columns":["food_id","name","shop","price","minutes","meal","how"]},"find":{"group":"Life","label":"Food","under":"Settings","from":"store","new":"New food","facets":["forLabel","kindLabel","foodMeal","foodShop"],"facetCols":{"foodMeal":"meal","foodShop":"shop"}},"card":{"look":"kc-facts","lines":true,"name":"name","tags":["meal","shop"]},"see":{"who":"owner"},"forms":{"food-new":{"ask":"find","store":true,"skip":true,"send":{"t":"Save"},"say":"the \"New food\" card in Find (form.js storeSend_): one field a step, any left empty, sent as the one action `item` (mode write).","fields":[{"f":"name","type":"text","label":"Name"},{"f":"shop","type":"text","label":"Shop"},{"f":"price","type":"text","label":"Price (£)","min":0,"step":0.01},{"f":"minutes","type":"text","label":"Minutes to make","min":0},{"f":"meal","type":"choice","label":"Meal","options":[{"v":"breakfast","t":"Breakfast"},{"v":"lunch","t":"Lunch"},{"v":"dinner","t":"Dinner"},{"v":"snack","t":"Snack"}]},{"f":"how","type":"long","label":"How"}]}}},"task":{"shape":"Card","bodyAs":"item","list":{"name":"Tasks","say":"ONE LIST KIND (UNIFY NEXT 6): kept as rows of the items tab (`tasks`), each write tidied by listTidy_ as it is sent (`save: as-is`, only the fields sent).","store":{"tab":"tasks"},"save":"as-is","fields":[{"f":"title","type":"text","max":300},{"f":"notes","type":"text","max":8000},{"f":"due","type":"date"},{"f":"repeat","type":"choice","options":["never","daily","weekly","monthly","yearly"],"def":""},{"f":"list","type":"text","max":80},{"f":"done","type":"choice","options":["no","yes"],"def":""}]},"source":"the owner's tasks (owner, 17 Nov); rows in the items tab","sheet":{"tab":"tasks","id":"task_id","columns":["task_id","title","notes","due","repeat","list","done","person_id","booking_id","item_id"]},"find":{"group":"Life","label":"Tasks","under":"Settings","from":"store","new":"New task","facets":["forLabel","kindLabel","taskList","taskRepeat","taskDone"],"facetCols":{"taskList":"list","taskRepeat":"repeat","taskDone":"done"}},"card":{"look":"kc-facts","lines":true,"name":"title","tags":["list","due"],"links":["person_id","booking_id","item_id"],"tick":{"f":"done","on":"yes","off":"no","label":"Done"}},"see":{"who":"admin"},"forms":{"task-new":{"ask":"find","store":true,"skip":true,"send":{"t":"Save"},"say":"the \"New task\" card in Find (form.js storeSend_): one field a step, any left empty, sent as the one action `item` (mode write).","fields":[{"f":"title","type":"text","label":"Title"},{"f":"notes","type":"long","label":"Notes"},{"f":"due","type":"date","label":"Due"},{"f":"repeat","type":"choice","label":"Repeat","options":[{"v":"never","t":"Never"},{"v":"daily","t":"Daily"},{"v":"weekly","t":"Weekly"},{"v":"monthly","t":"Monthly"},{"v":"yearly","t":"Yearly"}]},{"f":"list","type":"text","label":"List"},{"f":"done","type":"choice","label":"Done","options":[{"v":"no","t":"No"},{"v":"yes","t":"Yes"}]},{"f":"person_id","type":"text","label":"Person (id)"},{"f":"booking_id","type":"text","label":"Booking (id)"},{"f":"item_id","type":"text","label":"Item (id)"}]}}},"drive_area":{"shape":"Card","bodyAs":"item","source":"the owner's Google Drive areas (owner, 17 Nov); rows in the items tab","sheet":{"tab":"drive_areas","id":"area_id","columns":["area_id","name","folder_id","what"]},"find":{"group":"Life","label":"Drive","under":"Settings","from":"store","new":"New Drive area","facets":["forLabel","kindLabel"],"facetCols":{}},"card":{"look":"kc-facts","lines":true,"name":"name","tags":["folder_id"]},"see":{"who":"admin"},"forms":{"drive_area-new":{"ask":"find","store":true,"skip":true,"send":{"t":"Save"},"say":"the \"New Drive area\" card in Find (form.js storeSend_): one field a step, any left empty, sent as the one action `item` (mode write).","fields":[{"f":"name","type":"text","label":"Name"},{"f":"folder_id","type":"text","label":"Folder id"},{"f":"what","type":"long","label":"What goes there"}]}}},"session":{"shape":"Card","bodyAs":"item","source":"the owner's weekly timetable of sessions (owner, 17 Nov): who, where, which days, start-end, this term; rows in the items tab. Plain record, not a booking: no price, no sync.","sheet":{"tab":"sessions","id":"session_id","columns":["session_id","who","person_id","place","address","days","start","end","term","notes"]},"find":{"group":"Life","label":"Week","under":"Settings","from":"store","new":"New session","facets":["forLabel","kindLabel"],"facetCols":{}},"card":{"look":"kc-facts","lines":true,"name":"who","tags":["days","start"]},"see":{"who":"admin"},"forms":{"session-new":{"ask":"find","store":true,"skip":true,"send":{"t":"Save"},"say":"the \"New session\" card in Find: one field a step, sent as item write.","fields":[{"f":"who","type":"text","label":"Who"},{"f":"person_id","type":"text","label":"Person id (if they have a file)"},{"f":"place","type":"text","label":"Where"},{"f":"address","type":"text","label":"Address"},{"f":"days","type":"text","label":"Days (e.g. Mon-Fri, Mon)"},{"f":"start","type":"text","label":"Start (HH:MM)"},{"f":"end","type":"text","label":"End (HH:MM)"},{"f":"term","type":"text","label":"Term"},{"f":"notes","type":"long","label":"Notes"}]}}},"fooddb":{"source":"data/settings/foods.json (the kind tree and its foods)","loader":"js/chemistry.js FOOD","find":{"group":"Tools","label":"Foods","under":"Tools","facets":["forLabel","kindLabel"]},"shape":"Card","bodyAs":"reference","card":{"look":"kc-facts","from":"food","tags":["path"],"lines":true,"parts":[{"text":"path"},{"text":"note"},{"tags":"foods"}]},"see":{"who":"owner"}},"assignment":{"shape":"Card","bodyAs":"item","list":{"name":"Assignments","say":"ONE LIST KIND (UNIFY NEXT 6): kept in the person's own `assignments` cell as { v, assignments: [...] }, saved whole (`save: whole`): every field written, a status one of the four, a mark only once marked. assignments with a `trackOnly` field set (noAI: no generative AI) are tracked here and nothing more: the card says so and nothing on the site helps with their content.","store":{"cell":"assignments","wrap":"assignments"},"most":300,"need":["title"],"save":"whole","trackOnly":[{"field":"noAI","say":"No generative AI: tracked only, never help with its content"}],"fields":[{"f":"noAI","type":"flag"},{"f":"id","type":"id","max":40},{"f":"title","type":"text","max":200},{"f":"course","type":"text","max":120},{"f":"kind","type":"word","max":30},{"f":"amount","type":"number","min":0,"max":1000000},{"f":"unit","type":"word","max":30},{"f":"due","type":"date"},{"f":"time","type":"time"},{"f":"weight","type":"number","min":0,"max":100},{"f":"status","type":"choice","word":true,"options":["not-started","in-progress","submitted","marked"],"def":"not-started"},{"f":"mark","type":"text","max":40,"only":{"f":"status","is":"marked"}},{"f":"note","type":"text","max":4000},{"f":"link","type":"url","max":500}]},"source":"the person's own `assignments` cell (JSON), drawn by the Assignments tool (js/map.js asg*); no Find card of its own","say":"ONE ASSIGNMENT (owner, 18 Nov). Its `kind`, `unit` and `status` are the fixed lists in the form's options (a choice, never free text); the backend keeps whatever word it is sent (post-account.gs assignmentsTidy_), status one of the four. The tool groups them Overdue / This week / Later / Done by `due`.","see":{"who":"self, family, staff, admin"},"forms":{"assignment-new":{"ask":"card","store":true,"skip":true,"back":"one","send":{"t":"Save"},"say":"the Assignments tool's form (js/map.js asgSend_): one field a step, any but the title left empty; the whole list is sent as `assignmentsSave`.","fields":[{"f":"title","type":"text","label":"Title","ph":"Title"},{"f":"course","type":"text","label":"Subject or module","ph":"Subject or module"},{"f":"kind","label":"What it is","options":[{"v":"essay","t":"Essay"},{"v":"coursework","t":"Coursework"},{"v":"project","t":"Project"},{"v":"exam","t":"Exam"},{"v":"test","t":"Test"},{"v":"homework","t":"Homework"},{"v":"presentation","t":"Presentation"},{"v":"report","t":"Report"},{"v":"lab","t":"Lab"},{"v":"reading","t":"Reading"},{"v":"revision","t":"Revision"},{"v":"other","t":"Other"}]},{"f":"amount","type":"text","label":"How much (a number)","ph":"How much","min":0},{"f":"unit","label":"Of what","options":[{"v":"words","t":"words"},{"v":"pages","t":"pages"},{"v":"slides","t":"slides"},{"v":"minutes","t":"minutes"},{"v":"hours","t":"hours"},{"v":"questions","t":"questions"},{"v":"marks","t":"marks"},{"v":"chapters","t":"chapters"}]},{"f":"due","type":"date","label":"Due"},{"f":"time","type":"time","label":"Due time"},{"f":"weight","type":"text","label":"% of the grade","ph":"% of the grade","min":0,"max":100},{"f":"status","label":"Status","options":[{"v":"not-started","t":"Not started"},{"v":"in-progress","t":"In progress"},{"v":"submitted","t":"Submitted"},{"v":"marked","t":"Marked"}]},{"f":"mark","type":"text","label":"Mark","ph":"Mark, e.g. 68% or A","only":{"status":"marked"}},{"f":"note","type":"long","label":"Note","ph":"Note"},{"f":"link","type":"text","label":"Link","ph":"https://…","pad":"url"}]}}}},"doors":[{"name":"Practice","built":true,"practice":true},{"name":"Library","built":true},{"name":"Videos"},{"name":"Coming soon"},{"name":"Posts"},{"name":"Profiles"},{"name":"Booking"},{"name":"Shop"},{"name":"Settings"},{"name":"Tools"},{"name":"Games"}],"facets":[{"field":"mScope","label":"Car or car part?","read":{"by":"fn","col":"mechScope_","tag":false,"choose":true},"sort_order":24.581,"note":"mechanics (owner, 7 Nov): a car, or a car part (a part then answers the cars it fits)","active":true},{"field":"mMake","label":"Brand","read":{"by":"mech","col":"mMake","or":"shopBrand"},"sort_order":24.582,"note":"ONE BRAND (UNIFY AFTER 3, 23 Nov): a car's brand (a part answers the brands it fits) and a shop thing's maker, one facet; was mMake and shopBrand","active":true},{"field":"mModel","label":"Model","read":{"by":"mech","col":"mModel"},"sort_order":24.583,"note":"mechanics (batch E): a car's model","active":true},{"field":"mGen","label":"Generation","read":{"by":"mech","col":"mGen"},"sort_order":24.584,"note":"mechanics (batch E): a car's generation (III, Mk7)","active":true},{"field":"mPhase","label":"Phase","read":{"by":"mech","col":"mPhase"},"sort_order":24.611,"note":"mechanics (batch E): a facelift phase, a tag","active":true},{"field":"mMarket","label":"Market","read":{"by":"mech","col":"mMarket"},"sort_order":24.612,"note":"mechanics (batch E): where the car was sold, a tag","active":true},{"field":"mYears","label":"Years made","read":{"by":"mech","col":"mYears"},"sort_order":24.613,"note":"mechanics (batch E): the years this car and engine were sold, a tag","active":true},{"field":"mSize","label":"Engine size","read":{"by":"mech","col":"mSize"},"sort_order":24.614,"note":"mechanics (batch E): litres, a tag","active":true},{"field":"mValves","label":"Valves","read":{"by":"mech","col":"mValves"},"sort_order":24.615,"note":"mechanics (batch E): valves, a tag","active":true},{"field":"mBadge","label":"Version","read":{"by":"mech","col":"mBadge"},"sort_order":24.616,"note":"mechanics (batch E): the badge (TCe 100, TDI), a tag","active":true},{"field":"mFuel","label":"Fuel","read":{"by":"mech","col":"mFuel"},"sort_order":24.617,"note":"mechanics (batch E): petrol or diesel","active":true},{"field":"mPart","label":"Part","sort_order":24.618,"note":"mechanics and PC parts (batch E): the part's name, a tag","active":true},{"field":"mPrice","label":"Price band","read":{"by":"own","col":"parts.value"},"sort_order":24.619,"note":"mechanics (batch E): a rough UK parts price band, a tag","active":true},{"field":"pcType","label":"Part type","read":{"by":"own","col":"pc.type"},"sort_order":24.601,"note":"PC parts (batch E): CPU, Motherboard, RAM, GPU, Storage, PSU, Case, Cooling, Cables, OS media","active":true},{"field":"pcSocket","label":"Socket or form factor","read":{"by":"own","col":"pc.socket"},"sort_order":24.602,"note":"PC parts (batch E): AM5, ATX, M.2 2280, 2.5-inch","active":true},{"field":"pcIface","label":"Interface","read":{"by":"own","col":"pc.iface"},"sort_order":24.603,"note":"PC parts (batch E): PCIe, SATA, DDR5, USB","active":true},{"field":"pcLinks","label":"Connects to","read":{"by":"own","col":"pc.links"},"sort_order":24.604,"note":"PC parts (batch E): the parts it plugs into","active":true},{"field":"mSystem","label":"System","read":{"by":"row","col":"mSystem"},"sort_order":24.6,"note":"a mechanics card (548): the car system a part, job or symptom belongs to","active":true},{"field":"mEngine","label":"Engine","read":{"by":"mech","col":"mEngine"},"sort_order":24.585,"note":"a mechanics card (548, batch E): the engine code (D4F, K9K); a part answers the engines it fits","active":true},{"field":"cCategory","label":"Chemical type","read":{"by":"row","col":"cCategory"},"sort_order":24.65,"note":"a chemistry card (550): an element's category, a substance's or a reaction's type","active":true},{"field":"cGroup","label":"Group","read":{"by":"row","col":"cGroup"},"sort_order":24.66,"note":"a chemistry element (550): its group in the periodic table","active":true},{"field":"cPeriod","label":"Period","read":{"by":"row","col":"cPeriod"},"sort_order":24.67,"note":"a chemistry element (550): its period","active":true},{"field":"cState","label":"State","read":{"by":"row","col":"cState"},"sort_order":24.68,"note":"a chemistry card (550): state at 20 °C","active":true},{"field":"forLabel","label":"What for","sort_order":10,"note":"what the thing is for (a group of kinds); NOT ASKED since 24 Nov (queue item 9: one opening question, What kind) — kept as a reader for Booking's door and card tags","active":false},{"field":"kindLabel","label":"What kind","sort_order":20,"note":"THE ONE OPENING QUESTION (queue item 9, 24 Nov): one flat set of answers, the kinds.json doors — Questions, Answers, Inserts (was Practice; 610), Library (practicals since 15 Nov, projects since 7 Nov, boxers, bouts and the Bible are in the Library; Content until 490). Answers keeps a question's answer pages; its answers are ordered by the kinds tab","active":true},{"field":"kindOwn","label":"Which","sort_order":20.5,"note":"the kind under a kind (610); asked again (owner, 24 Nov: the main menu holds Practice, not Questions, Answers and Inserts): Questions, Answers and Inserts under Practice","active":true},{"field":"toolName","label":"Which tool","read":{"by":"fn","col":"toolNameOf_","choose":true},"sort_order":20.4,"note":"under Tools (owner, 20 Nov): each tool its own tag — a widget by its name, any other kind there by its label (Docket, Foods); asked however lopsided","active":true},{"field":"wReligion","label":"Religion","read":{"by":"writing","col":"religion"},"sort_order":24.03,"note":"every religious writing (546): the religion it belongs to, its registry topic (Christianity, Judaism, Islam, Ancient Egyptian religion); asked first in Religious Studies","active":true},{"field":"wWork","label":"Work","read":{"by":"writing","col":"work"},"sort_order":24.05,"note":"every writing (520): the Bible, the Quran, the Talmud, the Hadith, a hymnal, a play, any work","active":true},{"field":"wSource","label":"Source text","read":{"by":"writing","col":"source"},"sort_order":24.07,"note":"every writing (owner, 29 Oct): the original a Text was made from, its base by Collection: Hebrew Masoretic Text, Greek Septuagint, Greek New Testament, Arabic, Babylonian Talmud (Bavli); asked before the Translation","active":true},{"field":"wLanguage","label":"Language","sort_order":24.08,"note":"every writing (546): the language a text is written in (Greek, Hebrew, English), its own question, never merged with whose translation","active":true},{"field":"wText","label":"Translation or edition","sort_order":24.1,"note":"every writing (520, 546): whose translation or edition (King James Version (1611)); its language is the Language question","active":true},{"field":"wCollection","label":"Collection","read":{"by":"writing","col":"collection"},"sort_order":24.045,"note":"every writing (520, 600): a group of works, asked before Work: Rabbinic, Second Temple, Kabbalah, Hadith, the testament, an anthology, Hymns, Deuterocanon / Apocrypha / Anagignoskomena","active":true},{"field":"wSection","label":"Section","read":{"by":"writing","col":"section"},"sort_order":24.06,"note":"every writing (520): a group of books above Book (Torah, Gospels), a Talmud order, a juz, a hymnal section","active":true},{"field":"wBook","label":"Book","read":{"by":"writing","col":"book"},"sort_order":24.3,"note":"every writing (520): a book of the Bible, a tractate, a hadith book, a volume","active":true},{"field":"wChapter","label":"Chapter","read":{"by":"writing","col":"chapter"},"sort_order":24.35,"note":"every writing (520): chapter, surah, act, poem, perek; drawn as a grid when its answers are numbers","active":true},{"field":"wUnit","label":"Unit","read":{"by":"writing","col":"unit"},"sort_order":24.4,"note":"every writing (520): the card itself: a verse, ayah, hadith, daf side, scene, stanza, hymn","active":true},{"field":"wAuthor","label":"Author","read":{"by":"writing","col":"author"},"sort_order":24.09,"note":"every writing (520): who wrote it, where the index says","active":true},{"field":"wPrimacy","label":"Primary or secondary source","read":{"by":"writing","col":"primacy"},"sort_order":24.51,"note":"every writing (owner, 7 Nov): Primary for an original text, Secondary for a later study of it","active":true},{"field":"wForm","label":"Kind of writing","read":{"by":"writing","col":"form"},"sort_order":24.085,"note":"every writing (520): play, novel, poem, hymn, canon law, homily","active":true},{"field":"shelf","label":"Shelf","read":{"by":"row","col":"shelf"},"sort_order":24,"note":"which shelf of the Library: Boxing, or Writings, where every written work is (520); Physical Education is Boxing only (7 Nov)","active":true},{"field":"subject","label":"Subject","read":{"by":"row","col":"subject"},"sort_order":22,"note":"asked first after What kind (494): \"the library should go subject first\"; every Library item carries one (scripture is Religious Studies)","active":true},{"field":"fighter","label":"Fighter","sort_order":34.1,"note":"a bout's two corners, and a boxer's own name (445)","active":true},{"field":"decade","label":"Decade","read":{"by":"fn","col":"decadesOf_"},"sort_order":35,"note":"an era before a weight","active":true},{"field":"division","label":"Division","read":{"by":"row","col":"division"},"sort_order":36,"note":"boxers and bouts only; the coverage rule hides it elsewhere","active":true},{"field":"boutRound","label":"Round","sort_order":36.1,"note":"the round a bout ended in (445)","active":true},{"field":"boutMethod","label":"Result","read":{"by":"fight","col":"method"},"sort_order":36.2,"note":"how a bout ended: KO, TKO, decision (445)","active":true},{"field":"boutWinner","label":"Winner","read":{"by":"fn","col":"boutWinner_"},"sort_order":36.3,"note":"who won a bout -- a tag since the fight card lost its A v B title (490)","active":true},{"field":"boutEvent","label":"Event","read":{"by":"fight","col":"event"},"sort_order":36.4,"note":"the night a bout was billed as (490)","active":true},{"field":"required","label":"Required","sort_order":39,"note":"Required practical, Extra or Not for now; practicals only, so the coverage rule keeps it off the first screen","active":true},{"field":"documentType","label":"What sort","read":{"by":"fn","col":"sortOf_"},"sort_order":55,"note":"ONE WHAT SORT (UNIFY AFTER 3, 23 Nov): every item's own sort, one facet: a paper's document type, a project's and a practical's type, a boxing card's Fighters or Fights, a shop thing's kind, a mechanics or chemistry card's kind (Exam topics for a lesson written to a spec); was seven facets. histKind stays the History taxonomy's own level (a boxer is a Figure and a Fighter). the errand: revising a topic and sitting a mock want different questions after this one. ONE QUESTION SET (owner, 23 Nov: UNIFY item 3): a paper, a worksheet, an exercise, a 5-a-day are one sort, Question set (tools/lib/sets.js); the board or source, year, tier and paper are its tags; was PAPER TYPES (Exam paper: Past paper, Specimen paper), whose word mismatch hid every exam paper","active":true},{"field":"level","label":"Level","read":{"by":"fn","col":"levelOf_"},"sort_order":50,"note":"which qualification; band_type stage wins over the level column","active":true},{"field":"keystage","label":"Key stage","sort_order":60,"note":"a comma in the cell is a list: a sheet may be KS1 and KS2","active":true},{"field":"yearGroup","label":"School year","sort_order":70,"note":"band_type year. Not \"Year\" — that is the year a paper was sat","active":true},{"field":"bandValue","label":"Grade","sort_order":80,"note":"band_type grade","active":true},{"field":"topic","label":"Topic","sort_order":100,"note":"hundreds of answers, so the 40-answer cap keeps it quiet until the list is small enough to name one","active":true},{"field":"examBoard","label":"Exam board","read":{"by":"fn","col":"boardOf_"},"sort_order":110,"note":"","active":true},{"field":"specTopic","label":"Exam topic","sort_order":111,"note":"a content card written to one board's spec (16 Nov): the spec's own numbered topic, read from data/spec/<board>-<code>.json by its spec_ref; such a card answers no Topic, so its board is asked first","active":true},{"field":"specPoint","label":"Exam sub-topic","sort_order":112,"note":"the spec's numbered sub-topic under Spec topic (4.1.1 Cell structure), from the same file","active":true},{"field":"tier","label":"Tier","sort_order":120,"note":"Foundation or Higher","active":true},{"field":"examYear","label":"Year","read":{"by":"fn","col":"itemYear_"},"sort_order":130,"note":"the year of the sitting, else the year a bout was fought (one Year since step 9, 22 Nov: boutYear merged in), newest first","active":true},{"field":"examMonth","label":"Month","sort_order":132,"note":"May, June, November — the month and never the season; any item's own date too (a 5-a-day's); a bout's month too (boutMonth merged in, step 9)","active":true},{"field":"examDay","label":"Day","read":{"by":"fn","col":"itemDate_.day"},"sort_order":133,"note":"the day of the month of any item's own date (a 5-a-day's 5 October is 5)","active":true},{"field":"paperId","label":"Paper","sort_order":140,"note":"the id decides who answers; the document's name is what is said, shortened against the names beside it","active":true},{"field":"paperSection","label":"Paper section","sort_order":141,"note":"a paper sat in sections (9MA0 Paper 3: A Statistics, B Mechanics); an ordinary facet, asked whenever it splits (owner, 15 Nov)","active":true},{"field":"qNumber","label":"Question","sort_order":142,"note":"Q1, Q2 …; the coverage and 40-answer rules hold it back until a paper or a day is chosen","active":true},{"field":"qPart","label":"Part","read":{"by":"fn","col":"qSplitOf_.part"},"sort_order":144,"note":"the part's letter, as the paper prints it","active":true},{"field":"qSub","label":"Sub-part","read":{"by":"fn","col":"qSplitOf_.sub"},"sort_order":145,"note":"the roman numeral, as the paper prints it","active":true},{"field":"marks","label":"Marks","sort_order":148,"note":"what a question is worth","active":true},{"field":"needCalc","label":"Calculator","sort_order":149,"note":"its own step (owner, R204): Calculator allowed or Non-calculator, so What you need (compasses, the printed sheet) is a step apart","active":true},{"field":"needs","label":"What you need","sort_order":150,"note":"a comma-list: compasses and the printed sheet at once; the calculator is its own step, Calculator","active":true},{"field":"source","label":"Source","read":{"by":"fn","col":"sourceOf_"},"sort_order":160,"note":"who made a worksheet (Corbettmaths, 1st Class Maths); a board's own paper has none and a maker's sheet has no exam board (O3)","active":true},{"field":"verified","label":"Answer checked","read":{"by":"fn","col":"verifyTags_.verified"},"sort_order":136,"note":"Verified only when the answer was checked against the official scheme AND the question type is complete and machine-marked (388); one tag, not two (owner, 10 Nov); asked before Paper, Question and Part (owner, 29 Oct); OFF 24 Nov (owner, UNIFY item 4: answer checked is the library's bookkeeping, kept out of what a child sees)","active":false},{"field":"myTried","label":"Attempted","read":{"by":"fn","col":"myTriedOf_"},"sort_order":155.5,"note":"TWO MENUS (owner, 25 Nov): Attempted or Unattempted, the signed-in person's latest answer to the part, by statusOf_ and the words status-*","active":true},{"field":"myResult","label":"Result","read":{"by":"fn","col":"myResultOf_"},"sort_order":156,"note":"TWO MENUS (owner, 25 Nov): an attempted, marked part's result, Correct / Part correct / Incorrect, by statusOf_ and the words status-*; asked only of attempted parts (others have none)","active":true},{"field":"histKind","label":"What sort","sort_order":24.04,"note":"history database only (459, 461): which table, and the timelines (batch F); a history topic (16 Nov, data/library/history/) answers its own name","active":true},{"field":"histPart","label":"Which part","sort_order":24.045,"note":"a history topic's card (16 Nov, js/history-topics.js): its timeline, a person, a source or an item","active":true},{"field":"histEra","label":"Era","read":{"by":"fn","col":"histErasOf_"},"sort_order":37.2,"note":"history database only: Ancient, Medieval, Early modern, Modern, from the row's years (histEras_)","active":true},{"field":"histMaterial","label":"Material","read":{"by":"hist","col":"material"},"sort_order":37.4,"note":"manuscripts only: papyrus, parchment, paper","active":true},{"field":"histFormat","label":"Format","read":{"by":"hist","col":"format"},"sort_order":37.5,"note":"manuscripts only: codex, roll, fragment","active":true},{"field":"histRole","label":"Role","sort_order":37.7,"note":"historical figures only: a list cell, one tag each","active":true},{"field":"personName","label":"Who","sort_order":37.705,"note":"a person (batch D): their name, the card's only title","active":true},{"field":"personYears","label":"Years","read":{"by":"fn","col":"personYears_"},"sort_order":37.71,"note":"a person (batch D), boxer or figure: born–died","active":true},{"field":"personFrom","label":"From","sort_order":37.72,"note":"a person (batch D): a boxer's country, a figure's birthplace","active":true},{"field":"histRepository","label":"Held at","read":{"by":"hist","col":"repository"},"sort_order":37.9,"note":"manuscripts only: the library or museum that holds it","active":true},{"field":"histFound","label":"Found","read":{"by":"fn","col":"msFound_"},"sort_order":37.93,"note":"manuscripts only (owner, 7 Nov: facts as tags): where and when it was found, the first line of its provenance","active":true},{"field":"histDated","label":"Dated","read":{"by":"fn","col":"msDated_"},"sort_order":37.94,"note":"manuscripts only (owner, 7 Nov: facts as tags): the date it is dated to, as the row says it","active":true},{"field":"histSide","label":"Side","read":{"by":"row","col":"msSide"},"sort_order":37.92,"note":"drawn manuscripts only (507): Front (recto) or Back (verso), one card a side","active":true},{"field":"histTheatre","label":"Theatre","read":{"by":"hist","col":"theatre"},"sort_order":37.95,"note":"events and timelines only (461): Europe, Pacific, Africa, Atlantic, Home front, Diplomacy","active":true},{"field":"shopHow","label":"How you get it","read":{"by":"row","col":"shopHow"},"sort_order":38.2,"note":"shop items only (499): buy, earn with ticks, unlock by level, borrow","active":true},{"field":"shopPrice","label":"Price","read":{"by":"row","col":"shopPrice"},"sort_order":38.3,"note":"shop items only (499): a band from its price","active":true},{"field":"shopFor","label":"Who for","read":{"by":"row","col":"shopFor"},"sort_order":38.5,"note":"shop items only (499): who it is for when not everybody","active":true},{"field":"shopTheme","label":"Theme","read":{"by":"row","col":"shopTheme"},"sort_order":38.6,"note":"shop items only (740): its theme, from the shop tab's theme column; empty is no tag","active":true},{"field":"postState","label":"Which posts","read":{"by":"row","col":"postState"},"sort_order":20.6,"note":"a post (batch C): Approved, Waiting for approval or Deleted; only an admin is sent the last two","active":true},{"field":"postBy","label":"Who posted","read":{"by":"row","col":"postBy"},"sort_order":20.61,"note":"a post (batch C): its author","active":true},{"field":"postWhen","label":"When","read":{"by":"row","col":"postWhen"},"sort_order":20.62,"note":"a post (batch C): a time frame, Today to Older","active":true},{"field":"profileType","label":"Who","read":{"by":"row","col":"profileType"},"sort_order":20.64,"note":"a profile (batch C): Parent, Student, Tutor; an admin also Over/Under 18, Apprentice, Admin","active":true},{"field":"settingFor","label":"Who for","read":{"by":"row","col":"settingFor"},"sort_order":20.65,"note":"a settings card (batch C): Student, Parent, Staff, Apprentice, Admin","active":true},{"field":"venueArea","label":"Area","read":{"by":"row","col":"venueArea"},"sort_order":20.696,"note":"a venue (Find › Venues): its borough, else its city","active":true},{"field":"venueFor","label":"Good for","read":{"by":"row","col":"venueFor"},"sort_order":20.697,"note":"a venue: its focus list off the venues tab","active":true},{"field":"venueSize","label":"Holds","read":{"by":"row","col":"venueSize"},"sort_order":20.698,"note":"a venue: up to how many students, and how many rooms","active":true},{"field":"partnerStatus","label":"Status","sort_order":20.71,"note":"a partner (owner, 17 Nov): idea, talking, agreed, running, ended","active":true},{"field":"foodMeal","label":"Meal","sort_order":20.72,"note":"a food (owner, 17 Nov): breakfast, lunch, dinner, snack","active":true},{"field":"foodShop","label":"Shop","sort_order":20.73,"note":"a food: where it is bought","active":true},{"field":"taskList","label":"List","sort_order":20.74,"note":"a task (owner, 17 Nov): its list","active":true},{"field":"taskRepeat","label":"Repeats","sort_order":20.75,"note":"a task: never, daily, weekly, monthly, yearly","active":true},{"field":"taskDone","label":"Done","sort_order":20.76,"note":"a task: yes or no","active":true}]};
const CARD_TAGS = {"max":6,"kinds":[{"kind":"subject","fields":["subject","wReligion"]},{"kind":"level","fields":["level","keystage","yearGroup","bandValue"]},{"kind":"board","fields":["examBoard","source"]},{"kind":"sort","fields":["documentType","practicalType","projectType","boxKind","mKind","pcType","cCategory","wForm","profileType","toolName"]},{"kind":"number","fields":["qNumber","qPart","qSub"],"join":true},{"kind":"marks","fields":["marks"]},{"kind":"price","fields":["price"]}]};
;
/* js/cards-render.js */
function cardRuns_(v) {
if (v == null) return '';
if (Array.isArray(v)) return v.map(cardRuns_).join('');
if (typeof v !== 'object') return esc(String(v));
if (Array.isArray(v.levels)) return `<sup class="prof-lv">&nbsp;${v.levels.map(l => `<span>${cardRuns_({ marked: l })}</span>`).join(', ')}</sup>`;
if (v.iso != null) { const said = cardRuns_({ marked: v.iso }), cut = cardLastGap_(said), sup = cardRuns_(v.sup), sub = cardRuns_(v.sub);
return `${cut > 0 ? said.slice(0, cut) + ' ' : ''}<span class="prof-q-end">${said.slice(cut + 1)}<span class="prof-iso">${sup ? `<sup>${sup}</sup>` : ''}${sub ? `<sub>${sub}</sub>` : ''}</span></span>`; }
if (v.b != null) return `<b>${cardRuns_(v.b)}</b>`;
if (v.i != null) return `<i>${cardRuns_(v.i)}</i>`;
if (v.sup != null) return `<sup>${cardRuns_(v.sup)}</sup>`;
if (v.sub != null) return `<sub>${cardRuns_(v.sub)}</sub>`;
if (v.math != null) return `<span class="kc-math">${cardRuns_(v.math)}</span>`;
if (v.mono != null) return `<span class="mono">${cardRuns_(v.mono)}</span>`;
if (v.link != null) { const h = String(v.href || ''); if (!/^(https:|mailto:|tel:|docs\/|data\/)/i.test(h)) return cardRuns_(v.link);
return `<a${v.look === 'link' ? ' class="link"' : ''} href="${esc(h)}"${v.out ? ' target="_blank" rel="noopener"' : ''}${v.act ? ` data-do="${esc(v.act)}"` : ''}>${cardRuns_(v.link)}</a>`; }
if (v.br) return '<br>';
if (v.ln != null) return `<span class="kc-ln" aria-label="line ${esc(String(v.ln))}">${esc(String(v.ln))}</span>`;
if (v.typeset != null && !v.frac && cardHasMarkup_(v.typeset)) { const h = cardRuns_(cardMarkupRuns_(v.typeset));
return `<span class="kc-math">${typeof typeset_ === 'function' ? typeset_(h) : h}</span>`; }
if (v.typeset != null) return `<span class="kc-math">${v.frac ? cardFrac_(String(v.typeset)) : typeof typeset_ === 'function' ? typeset_(esc(String(v.typeset))) : esc(String(v.typeset))}</span>`;
if (v.badge != null) return `<span class="kc-badge"${v.hint ? ` title="${esc(v.hint)}"` : ''}>${esc(String(v.badge))}</span>`;
if (v.marked != null) return typeof mark === 'function' ? mark(String(v.marked)) : esc(String(v.marked));
if (v.word && /^(subject|venue|level)$/.test(v.word)) return `<span class="${v.word}">${cardRuns_(v.text)}</span>`;
if (v.span != null && /^[a-z][\w -]*$|^$/.test(String(v.span))) return `<span${v.span ? ` class="${esc(v.span)}"` : ''}>${cardRuns_(v.text)}</span>`;
if (v.tone) return `<span class="${esc('is-' + v.tone)}">${cardRuns_(v.text)}</span>`;
return cardRuns_(v.text);
}
const CARD_ENT = { frasl: '\u2044', times: '\u00d7', pi: '\u03c0', minus: '\u2212', ne: '\u2260', nbsp: '\u00a0', plusmn: '\u00b1', radic: '\u221a',
rho: '\u03c1', theta: '\u03b8', lambda: '\u03bb', infin: '\u221e', lt: '<', gt: '>', amp: '&', hellip: '\u2026', rarr: '\u2192', prime: '\u2032',
int: '\u222b', asymp: '\u2248', cup: '\u222a', cap: '\u2229', mu: '\u03bc', sigma: '\u03c3', epsilon: '\u03b5', alpha: '\u03b1', phi: '\u03c6',
omega: '\u03c9', tau: '\u03c4', Delta: '\u0394', Phi: '\u03a6', rsquo: '\u2019', lsquo: '\u2018', delta: '\u03b4', Omega: '\u03a9', Sigma: '\u03a3', eta: '\u03b7', gamma: '\u03b3', beta: '\u03b2', nu: '\u03bd', psi: '\u03c8', ndash: '\u2013', le: '\u2264', ge: '\u2265', deg: '\u00b0', frac12: '\u00bd', divide: '\u00f7', quot: '"' };
const cardHasMarkup_ = s => /<\/?(i|b|sup|sub|span)\b[^>]*>|&[a-z]+;|&#\d+;/i.test(String(s || ''));
function cardMarkupRuns_(s) {
const top = [], stack = [{ runs: top }];
const put = r => stack[stack.length - 1].runs.push(r);
const txt = t => t && put(t.replace(/&([a-z]+);|&#(\d+);/gi, (m, n, d) => d ? String.fromCharCode(Number(d)) : (CARD_ENT[n] != null ? CARD_ENT[n] : CARD_ENT[n.toLowerCase()] != null ? CARD_ENT[n.toLowerCase()] : m)));
String(s || '').split(/(<\/?[a-z]+\b[^>]*>)/i).forEach(part => {
const t = /^<(\/?)([a-z]+)\b([^>]*)>$/i.exec(part);
if (!t) return txt(part);
const tag = t[2].toLowerCase();
if (!t[1]) { const cls = /insh-rad/.test(t[3]) ? 'insh-rad' : /overline/.test(t[3]) ? 'kc-over' : '';
return stack.push({ tag, cls, runs: [] }); }
if (stack.length < 2) return;
const o = stack.pop(), inner = o.runs;
put(o.tag === 'i' ? { i: inner } : o.tag === 'b' ? { b: inner } : o.tag === 'sup' ? { sup: inner } : o.tag === 'sub' ? { sub: inner }
: o.cls ? { span: o.cls, text: inner } : inner);
});
while (stack.length > 1) { const o = stack.pop(); put(o.runs); }
return top;
}
const CARD_SUB = '₀₁₂₃₄₅₆₇₈₉ₐₑₒₓₙₛₜ', CARD_SUB_AS = '0123456789aeoxnst';
const cardSub_ = html => String(html).replace(/[₀-₉ₐₑₒₓₙₛₜ]+/g, run => '<sub>' + [...run].map(c => CARD_SUB_AS[CARD_SUB.indexOf(c)]).join('') + '</sub>');
const cardFrac_ = s => cardSub_(typeof typeset_ === 'function' ? typeset_(esc(s).replace(/\//g, '&frasl;')) : esc(s));
function cardLastGap_(html) {
let depth = 0, at = -1;
for (let i = 0; i < html.length; i++) {
if (html[i] === '<') { const end = html.indexOf('>', i); if (end < 0) break; depth += html[i + 1] === '/' ? -1 : html[end - 1] === '/' ? 0 : 1; i = end; }
else if (html[i] === ' ' && depth <= 0) at = i;
}
return at;
}
const cardAttrs_ = d => Object.keys(d || {}).map(k => ` data-${esc(k)}="${esc(String(d[k]))}"`).join('');
function cardPic_(p) {
if (!p) return '';
if (p.src) return `<img${p.look ? ` class="${esc(p.look)}"` : ''} src="${esc(p.src)}" alt="${esc(p.alt || '')}" loading="lazy" decoding="async">`;
if (p.video) return `<video src="${esc(p.video)}" muted playsinline loop aria-label="${esc(p.alt || '')}"></video>`;
if (Array.isArray(p.pix)) return `<figure class="person-pic">${pixSvg_(p.pix, p.alt, p.flip, p.none ? ' is-none' : '')}</figure>`;
if (p.svg && /^\s*<(svg|figure)\b[\s\S]*<\/svg>[\s\S]*$/.test(String(p.svg))) return String(p.svg);
return '';
}
function pixSvg_(rows, name, flip, cls) {
const byC = {};
(rows || []).forEach((line, y) => {
for (let x = 0; x < line.length;) {
const c = line[x];
let w = 1;
while (line[x + w] === c) w++;
if (c !== '.') (byC[c] = byC[c] || []).push(`M${x} ${y}h${w}v1h-${w}z`);
x += w;
}
});
const paths = Object.keys(byC).map(c => `<path class="pp-${c}" d="${byC[c].join('')}"/>`).join('');
return `<svg class="pp${cls || ''}" viewBox="0 0 16 16" shape-rendering="crispEdges" role="img" aria-label="${esc(name || '')}">${
flip ? `<g transform="translate(16 0) scale(-1 1)">${paths}</g>` : paths}</svg>`;
}
const ART_TAGS = /^(path|circle|ellipse|rect|g)$/;
const artPaint_ = v => (/^--pfp-[a-z-]+$/.test(String(v)) ? `var(${v})` : v);
const artShapes_ = list => (list || []).filter(o => o && ART_TAGS.test(o.t)).map(o => `<${o.t}${Object.keys(o).filter(k => k !== 't' && k !== 'kids')
.map(k => ` ${esc(k)}="${esc(k === 'fill' || k === 'stroke' ? artPaint_(o[k]) : o[k])}"`).join('')}${o.kids ? `>${artShapes_(o.kids)}</${o.t}>` : '/>'}`).join('');
const artSvg_ = (art, ground, size) => `<svg class="pfp-art" viewBox="0 0 48 48" width="${esc(size)}" height="${esc(size)}" aria-hidden="true">`
+ `<circle cx="24" cy="24" r="24" fill="${esc(artPaint_(ground))}"/>${artShapes_(art)}</svg>`;
function renderFace_(f) {
if (f.src != null) return `<img class="${esc(f.cls)}" src="${esc(f.src)}" alt="${esc(f.alt || '')}"${f.eager ? '' : ' loading="lazy"'} decoding="async">`;
if (f.art) return `<span class="${esc(f.cls)} face-pic">${artSvg_(f.art, f.ground, f.size)}</span>`;
return `<span class="${esc(f.cls)}">${esc(f.text || '')}</span>`;
}
function cardTag_(t, i) {
t = typeof t === 'string' ? { text: t } : (t || {});
const n = t.colour === false ? null : t.colour != null ? t.colour : t.pill ? null : i ? 1 : 0;
return `<span class="${t.base ? esc(t.base) : t.pill ? 'prof-tag' : 'qtag'}${t.look ? ' ' + esc(t.look) : ''}"${n != null ? ` data-tag="${esc(n)}"` : ''}${
t.say ? ` role="img" aria-label="${esc(t.say)}" title="${esc(t.say)}"` : t.title ? ` title="${esc(t.title)}"` : ''}${
t.act ? ` data-do="${esc(t.act)}" role="button" tabindex="0"` : ''}${t.label ? ` aria-label="${esc(t.label)}"` : ''}${t.hidden ? ' aria-hidden="true"' : ''}${cardAttrs_(t.data)}>${cardRuns_(t.text)}${
t.x && typeof tile_ === 'function' ? tile_({ icon: 'close', label: t.x.label || '', act: t.x.act || t.act, data: t.x.data || t.data, cls: 'chip-x' }) : ''}</span>`;
}
const renderTags = (tags, look, keep) => ((tags || []).length || keep ? `<div class="qtags${look ? ' ' + esc(look) : ''}">${(tags || []).map(cardTag_).join(keep ? ' ' : '')}</div>` : '');
function cardControl_(c) {
c = Object.assign({}, c || {});
if (c.draft && typeof draftVal_ === 'function') { c.drafted = draftAttr_(c.draft.surface, c.draft.id, c.value); c.value = draftVal_(c.draft.surface, c.draft.id, c.value); }
const id = c.id ? ` id="${esc(c.id)}"` : '', name = c.name ? ` name="${esc(c.name)}"` : '', act = c.act ? ` data-do="${esc(c.act)}"` : '';
const more = id + name + act + (c.look ? ` class="${esc(c.look)}"` : '') + cardAttrs_(c.data) + (c.off ? ' disabled' : '') + (c.required ? ' required' : '') + (c.aria ? ` aria-label="${esc(c.aria)}"` : '') + (c.drafted ? ' ' + c.drafted : '');
if (c.kind === 'select') return `<select${more}>${(c.options || []).map(o => { o = typeof o === 'object' ? o : { value: o, text: o };
return `<option value="${esc(o.value)}"${cardAttrs_(o.data)}${String(o.value) === String(c.value) ? ' selected' : ''}>${esc(o.text == null ? o.value : o.text)}</option>`; }).join('')}</select>`;
if (c.kind === 'textarea') return `<textarea rows="${Number(c.rows) || 3}" placeholder="${esc(c.placeholder || '')}"${more}>${esc(c.value || '')}</textarea>`;
if (c.kind === 'check') return `<input type="checkbox"${c.value ? ' checked' : ''}${more}>`;
const type = /^(number|date|time|email|tel|password|search|file)$/.test(c.kind) ? c.kind : 'text';
return `<input type="${type}" value="${esc(c.value == null ? '' : c.value)}" placeholder="${esc(c.placeholder || '')}"${
c.min != null ? ` min="${esc(c.min)}"` : ''}${c.max != null ? ` max="${esc(c.max)}"` : ''}${c.step != null ? ` step="${esc(c.step)}"` : ''}${more}>`;
}
function cardAnswer_(b) {
const at = ` data-q="${esc(b.q || '')}"`;
if (b.variant === 'choices') return `<div class="kc-answer is-choices"${at}>${tile_((b.choices || []).map((c, i) =>
({ form: true, look: 'btn quiet kc-choice', label: typeof c === 'object' ? c.text : c, act: b.act || 'answer-pick', data: { i, q: b.q || '' } })))}</div>`;
if (b.variant === 'essay') return `<div class="kc-answer is-essay"${at}>${cardControl_({ kind: 'textarea', rows: 8, name: 'essay', placeholder: b.placeholder || '' })}</div>`;
const box = cardControl_({ kind: 'text', name: 'answer', placeholder: b.placeholder || '', aria: 'your answer', data: b.variant === 'pad' ? { pad: '1' } : null });
return `<div class="kc-answer is-${b.variant === 'pad' ? 'pad' : 'text'}"${at}>${box}</div>`;
}
const CARD_EMBEDS = {};
function cardEmbed_(b) {
const make = CARD_EMBEDS[b.tool];
let inner = '';
try { inner = make ? make(b.args || {}) : ''; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'embed:' + b.tool); }
return `<div class="kc-embed${b.look ? ' ' + esc(b.look) : ''}" data-embed="${esc(b.tool || '')}"${cardAttrs_(b.data)}>${inner || ''}</div>`;
}
function cardTree_(nodes, fold, top) {
const one = n => { const head = `<span class="kc-tree-k">${cardRuns_(n.label)}</span>`;
const inner = (n.text != null && n.text !== '' ? `<span class="kc-tree-v">${cardRuns_(n.text)}</span>` : '')
+ ((n.tiles || []).length ? tileWrap_(tile_(n.tiles)) : '')
+ (n.more ? `<p class="kc-tree-more">${cardRuns_(n.more)}</p>` : '') + cardTree_(n.kids, false, false);
return fold && top ? `<details class="kc-tree-sec"><summary class="kc-h">${cardRuns_(n.label)}</summary>${inner}</details>`
: `<li class="kc-tree-n">${head}${inner}</li>`; };
const list = (nodes || []).map(one).join('');
return !list ? '' : fold && top ? list : `<ul class="kc-tree">${list}</ul>`;
}
const cardGrid_ = b => `<div class="kc-grid-wrap"><div class="kc-grid" role="table" aria-label="${esc(b.caption || '')}">${(b.cells || []).map(c =>
`<div class="kc-cell kc-c${Math.min(18, Number(c.col) || 1)} kc-r${Math.min(10, Number(c.row) || 1)}">${
(c.parts || []).map((t, i) => `<span class="kc-cell-${i}">${esc(String(t == null ? '' : t))}</span>`).join('')}</div>`).join('')}</div></div>`;
function cardChoice_(o) {
if (o.box) { const b = o.box;
const at = `${b.id ? ` id="${esc(b.id)}"` : ''} class="${esc(b.cls || '')}" inputmode="${esc(b.inputmode || 'text')}" autocomplete="off"
  autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="${esc(b.enterkeyhint || 'next')}" data-1p-ignore data-lpignore="true" aria-label="${esc(b.label || '')}"${b.placeholder ? ` placeholder="${esc(b.placeholder)}"` : ''}`
+ ['min', 'max', 'step'].map(k => (b[k] != null && b[k] !== '' ? ` ${k}="${esc(String(b[k]))}"` : '')).join('');
if (b.lines) return `<label class="counted row${o.look ? ' ' + esc(o.look) : ''}"><textarea${at} rows="${esc(String(b.lines))}">${esc(b.value || '')}</textarea></label>`;
return answerBox_(`${at} type="${esc(b.type || 'text')}" value="${esc(b.value || '')}"`, o.look || ''); }
const d = o.data || {};
const attrs = (o.act ? ` data-do="${esc(o.act)}"` : '') + Object.keys(d).map(k => d[k] === true ? ` data-${esc(k)}` : ` data-${esc(k)}="${esc(String(d[k]))}"`).join('')
+ (o.label ? ` aria-label="${esc(o.label)}"` : '') + (o.pressed ? ' aria-pressed="true"' : '') + (o.disabled ? ' aria-disabled="true"' : '');
return answerTag_(o.marked && typeof mark === 'function' ? mark(o.text) : esc(String(o.text == null ? '' : o.text)), attrs, o.look || '');
}
function cardChoices_(b) {
const inner = (b.ask ? `<p class="book-ask">${esc(b.ask)}</p>` : '')
+ (b.rows || []).map(r => answersRow_((r.options || []).map(cardChoice_).join(''), r.look ? esc(r.look) : '', r.id ? esc(r.id) : '')).join('')
+ (b.wait && typeof loading_ === 'function' ? loading_() : '') + cardBlocks_(b.then);
return b.id ? `<div id="${esc(b.id)}" class="kc-choices">${inner}</div>` : inner;
}
const CARD_BLOCKS = {
text: b => [].concat(b.paras || [b.text]).filter(p => p != null && p !== '').map(p => `<p class="kc-line${b.tone ? ' ' + esc('is-' + b.tone) : ''}${b.look ? ' ' + esc(b.look) : ''}"${
b.act ? ` data-do="${esc(b.act)}"` : ''}>${cardRuns_(p)}</p>`).join(''),
tags: b => ((b.tags || []).length ? `<div class="qtags${b.look ? ' ' + esc(b.look) : ''}">${b.tags.map(cardTag_).join('')}</div>` : ''),
photos: b => { const all = (b.srcs || []).filter(Boolean);
return all.length ? `<div class="prof-photos">${all.map(u => `<span class="prof-shot"><img src="${esc(u)}" alt="" loading="lazy" decoding="async" onerror="this.parentNode.remove()"></span>`).join('')}</div>` : ''; },
hours: b => `<div class="prof-week prof-hours" data-avail="${esc(b.count || 0)}" aria-label="${esc(b.say || '')}">${
(b.free || []).length ? `<p class="prof-hour-line">${b.free.map(d => cardTag_({ pill: true, look: 'prof-day', text: d })).join('<span class="prof-sep"> </span>')}</p>` : ''}${
(b.busy || []).length ? `<p class="prof-key prof-busy">${cardRuns_(b.busyLabel || text_('already-teaching'))} ${b.busy.map(d => cardTag_({ pill: true, look: 'prof-day', text: d })).join('<span class="prof-sep"> </span>')}</p>` : ''}</div>`,
figure: b => { const p = cardPic_(b); return p ? `<figure class="kc-fig">${p}${b.caption ? `<figcaption>${cardRuns_(b.caption)}</figcaption>` : ''}</figure>` : ''; },
table: b => `<table class="kc-table">${(b.head || []).length ? `<thead><tr>${b.head.map(h => `<th>${cardRuns_(h)}</th>`).join('')}</tr></thead>` : ''}<tbody>${
(b.rows || []).map(r => `<tr>${r.map(c => `<td>${cardRuns_(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`,
list: b => { const items = b.items || [];
if (items.some(x => x && typeof x === 'object' && 'label' in x)) return items.map(x =>
`<div class="row"><span class="k">${esc(x.label)}</span><span class="v${x.tone ? ' ' + esc(x.tone) : ''}">${cardRuns_(x.value)}</span></div>`).join('');
const tag = b.ordered ? 'ol' : 'ul';
return items.length ? `<${tag} class="kc-list${b.look ? ' ' + esc(b.look) : ''}">${items.map(x => `<li>${cardRuns_(x)}</li>`).join('')}</${tag}>` : ''; },
answer: cardAnswer_,
formRow: b => `<label class="kc-form-row"><span class="k">${cardRuns_(b.label || '')}</span>${cardControl_(b.control)}</label>`,
embed: cardEmbed_,
section: b => `<section class="kc-sec${b.look ? ' ' + esc(b.look) : ''}"${b.live ? ' aria-live="polite"' : ''}>${b.head ? `<h4 class="kc-h${b.headLook ? ' ' + esc(b.headLook) : ''}">${cardRuns_(b.head)}</h4>` : ''}${(b.blocks || []).map(cardBlock_).join('')}</section>`,
tree: b => cardTree_(b.nodes, !!b.fold, true),
timeline: b => ((b.events || []).length ? `<ol class="kc-tl"${b.label ? ` aria-label="${esc(b.label)}"` : ''}>${b.events.map(e => `<li class="kc-tl-stop"><span class="kc-tl-when">${esc(e.when || '')}</span>`
+ `<div class="kc-tl-what"><b>${cardRuns_(e.title)}</b>${e.text ? `<p>${cardRuns_(e.text)}</p>` : ''}${e.who ? `<p class="kc-tl-who">${cardRuns_(e.who)}</p>` : ''}</div></li>`).join('')}</ol>` : ''),
grid: cardGrid_,
choices: cardChoices_,
card: b => (b.spec ? renderCard(b.spec) : ''),
tiles: b => ((b.tiles || []).length ? tileWrap_(tile_(b.tiles), b.look ? esc(b.look) : '') : ''),
who: b => `<div class="row${b.look ? ' ' + esc(b.look) : ''}">${b.face && typeof personFace_ === 'function' ? personFace_(b.face.who || {}, b.face.o || {}) : ''}<p class="${esc(b.whoLook || 'who')}"><b>${cardRuns_(b.name)}</b>${
b.handle ? `<span class="prof-handle">@${esc(b.handle)}</span>` : ''}</p>${(b.tiles || []).length ? tileWrap_(tile_(b.tiles)) : ''}</div>`,
tickCell: b => `<label class="${esc(b.look || '')}"${b.label ? ` aria-label="${esc(b.label)}"` : ''}>${cardControl_(Object.assign({ kind: 'check' }, b.control || {}))}</label>`,
media: b => { const u = String(b.src || ''), look = b.look ? ` class="${esc(b.look)}"` : '', name = esc(b.title || '');
if (!/^(https:|data\/|docs\/|[\w-]+\.(png|jpe?g|svg|webp|gif)$)/i.test(u) && !(b.kind === 'image' && /^(http:|data:image\/)/i.test(u))) return '';
if (b.kind === 'video') return `<video${look} src="${esc(u)}" controls playsinline preload="metadata"></video>`;
if (b.kind === 'image') return `<img${look} src="${esc(u)}" alt="${name}"${b.async ? ' decoding="async"' : ''}>`;
return `<iframe${look} src="${esc(u)}" title="${name}" loading="lazy" allow="${esc(b.allow || 'encrypted-media; picture-in-picture')}"${b.full ? ' allowfullscreen' : ''}></iframe>`; },
drawing: b => cardDraw_(b.node),
status: b => `<p class="note${b.saved ? ' me-said' : ''}${b.look ? ' ' + esc(b.look) : ''}"${b.id ? ` id="${esc(b.id)}"` : ''}${b.live ? ' aria-live="polite"' : ''}>${cardRuns_(b.text == null ? '' : b.text)}</p>`,
wait: b => `<div class="kc-wait${b.look ? ' ' + esc(b.look) : ''}"${cardAttrs_(b.data)}${b.on ? ' aria-busy="true"' : ''}>${b.on && typeof loading_ === 'function' ? loading_() : ''}</div>`,
};
const cardLockMark_ = () => `<span class="card-lock" title="Locked" aria-label="Locked">${typeof tileIcon_ === 'function' ? tileIcon_('lock') : ''}</span>`;
const CARD_DRAW_ELS = /^(svg|g|defs|clipPath|path|rect|line|circle|ellipse|polygon|polyline|text|figure|div|image)$/;
function cardDraw_(n) {
if (n == null) return '';
if (Array.isArray(n)) return n.map(cardDraw_).join('');
if (typeof n !== 'object' || !CARD_DRAW_ELS.test(n.el)) return '';
const a = n.a || {}, attrs = Object.keys(a).filter(k => /^[a-zA-Z][\w:-]*$/.test(k) && !/^on/i.test(k) && a[k] != null && a[k] !== '')
.map(k => ` ${k}="${esc(String(a[k]))}"`).join('');
return `<${n.el}${attrs}>${n.text != null ? esc(String(n.text)) : ''}${n.inner || ''}${cardDraw_(n.kids)}</${n.el}>`;
}
function cardBlock_(b) {
if (b == null || b === '') return '';
if (typeof b === 'string') return CARD_BLOCKS.text({ text: b });
const r = CARD_BLOCKS[b.type];
try { return r ? r(b) : ''; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'block:' + b.type); return ''; }
}
const cardBlocks_ = bs => [].concat(bs == null ? [] : bs).map(cardBlock_).join('');
function renderCard(spec) {
spec = spec || {};
if (spec.inline) return cardLetter_(spec);
const kind = spec.kind || 'thing', name = spec.name || ((spec.tags || [])[0] && ((spec.tags[0].text != null ? spec.tags[0].text : spec.tags[0]))) || '';
const said = t => String(typeof t === 'object' ? t.text : t).trim().toLowerCase();
const tags = (spec.tags || []).filter(t => t != null && t !== '' && (typeof t !== 'object' || (t.text != null && t.text !== '')))
.filter((t, i, all) => !i || said(t) !== said(all[0]));
const body = (spec.body || []).map(cardBlock_).join('');
const x = Object.assign({}, spec.item || {}, { kind, key: spec.key || '', row: spec.row || { title: typeof name === 'string' ? name : '' } });
let row = '';
const tr = spec.toolRow ? { look: 'qt-row', key: spec.toolRow.key || '' } : null;
const cut = spec.cut || {}, lines = body + (cut.lines || '');
try { row = typeof kcActRow_ === 'function' ? kcActRow_(x, '', tile_(spec.tiles || []) + (cut.tiles || ''), tr) : tileWrap_(tile_(spec.tiles || []), 'kc-row'); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'card:tiles'); }
const cls = 'card fc kc kc-' + kind + (spec.look ? ' ' + spec.look : '') + (spec.off ? ' is-off' : '');
return `<div class="${esc(cls)}"${spec.id ? ` id="${esc(spec.id)}"` : ''}${spec.card ? ` data-card="${esc(spec.card)}"` : ''}${spec.shape ? ` data-shape="${esc(spec.shape)}"` : ''}${cardAttrs_(spec.data)} aria-label="${esc(typeof name === 'string' ? name : '')}">`
+ `<div class="kc-pic">${cardPic_(spec.picture)}</div><div class="kc-head"></div>`
+ `<div class="kc-tags"${spec.tagsId ? ` id="${esc(spec.tagsId)}"` : ''}>${renderTags(tags, spec.tagLook, spec.tagsKeep)}${(spec.tagRows || []).map(CARD_BLOCKS.tags).join('')}</div>`
+ `<div class="kc-lines">${lines || (spec.empty ? `<p class="kc-line kc-empty">${esc(spec.empty)}</p>` : '')}</div>${cut.form ? `<div class="kc-form">${cut.form}</div>` : ''}`
+ `<div class="kc-act">${row}</div></div>`;
}
const cardLetterOf_ = kind => (((ITEM_KINDS.kinds[kind] || {}).card || {}).letter || {});
function cardSiteParts_(kind) {
const c = (ITEM_KINDS.kinds[kind] || {}).card || {}, R = c.record || {};
if (c.question && c.question.parts) return c.question.parts.order.slice();
return [...new Set([].concat(R.name ? ['name'] : [], c.tags || [], R.pills || [], R.status ? [R.status.fact] : [], R.sum || []))];
}
function cardLetterParts_(kind, use) {
const L = cardLetterOf_(kind), only = use ? (L.rows || {})[use] || [] : null;
return cardSiteParts_(kind).filter(p => p !== 'say' && (L.words || {})[p] && (!only || only.indexOf(p) >= 0));
}
function cardLetterRow_(kind, src, use) {
const L = cardLetterOf_(kind), s = src || {}, al = L.aliases || {};
const want = [...new Set(cardLetterParts_(kind, use).flatMap(p => L.words[p].need || []))];
return Object.assign({}, ...want.map(f => ({ [f]: s[f] !== undefined ? s[f] : s[[].concat(al[f] || []).find(a => s[a] !== undefined)] })));
}
const cardFieldsOf_ = (kind, row) => ((((ITEM_KINDS.kinds[kind] || {}).card || {}).fields || {}).list || [])
.map(x => ({ label: x.label, value: (row || {})[x.f] })).filter(x => x.value || x.value === 0);
function cardLetterLines_(kind, row, see, use) {
const L = cardLetterOf_(kind), r = row || {}, s = see || {}, str = v => String(v == null ? '' : v).trim();
const kid = s.kid === true || s.child === true || [].concat(s.roles || [], s.role || []).join(',').split(/[,\s]+/).some(v => /^(kid|child|student)$/i.test(v));
return cardLetterParts_(kind, use).map(p => {
const l = L.words[p];
if (/^money\./.test(p) && (kid || s.prices === false)) return null;
const said = {}, as = l.as || {};
(l.need || []).forEach(f => { const v = str(r[f]); if (!v || (l.money && !isFinite(Number(r[f])))) return;
said[as[f] || f] = l.date ? fmtDate_(r[f], f) : l.money ? fmtMoney_(r[f]) : v; });
const got = (l.need || []).map(f => said[as[f] || f]).filter(Boolean);
const line = l.word && got.length === (l.need || []).length ? text_(l.word, said) : l.alone === 'any' ? got[0] || '' : l.alone ? said[l.alone] || '' : '';
return line ? { part: p, line: line } : null;
}).filter(Boolean);
}
function cardLetter_(spec) {
const L = cardLetterOf_(spec.kind), I = spec.inline, cut = spec.cut || {};
if (I === 'text') return cardLetterLines_(spec.kind, spec.row, spec.see, spec.use).map(l => (L.bullet || '') + l.line).join('\n');
const Z = Object.assign({}, L.sizes, I);
const st = (k, more) => String((L.styles || {})[k] || '').replace(/\{(\w+)\}/g, (m, n) => { const v = more && n in more ? more[n] : Z[n]; return v == null ? '' : v; });
const cl = k => ((L.cls || {})[k] ? ` class="${esc(L.cls[k])}"` : '');
const p = (k, inner, more) => `<p${cl(k)} style="${st(k, more)}">${inner}</p>`;
const tag = t => { t = typeof t === 'object' ? t : { text: t }; const hue = (I.hues || {})[t.colour];
return `<span${cl('tag')} style="${st('tag', { hue: hue || I.dim, edge: hue ? '' : ' ' + I.chip })}">${cardRuns_(t.text).replace(/ /g, ' ')}</span>`; };
const fact = x => p('label', cardRuns_(x.label)) + (x.box
? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${esc(I.box || '')}" style="${st('box')}">${x.cut != null ? x.cut : cardRuns_(x.value)}</td></tr></table>`
: p('value', x.cut != null ? x.cut : cardRuns_(x.value)));
const one = b => (b && b.type === 'text' ? p(b.look || 'line', cardRuns_(b.text), { tone: b.tone }) : b && b.type === 'list' ? (b.items || []).map(fact).join('')
: b && b.type === 'html' ? (b.html ? `<div style="${st(b.look || 'line')}">${b.html}</div>` : '') : cardBlock_(b));
const mark = n => (n ? `<!--part:${esc(n)}-->` : '');
const block = b => { const h = one(b); return h && b && b.part ? mark(b.part) + h : h; };
const tags = (spec.tags || []).filter(t => t != null && t !== '');
const parts = { pic: cut.pic ? mark(spec.marked && 'pic') + `<div style="${st('pic')}">${cut.pic}</div>` : '', head: spec.name ? mark(spec.marked && 'head') + p('head', cardRuns_(spec.name)) : '',
tags: tags.length ? mark(spec.marked && 'tags') + `<div style="${st('tags')}">${tags.map(tag).join(' ')}</div>` : '', lines: (cut.lines || '') + (spec.body || []).map(block).join('') };
return `<table role="presentation" class="kc" width="100%" cellpadding="0" cellspacing="0" border="0" style="${st('card')}"><tr><td style="${st('cell')}">`
+ ['pic', 'head', 'tags', 'lines'].map(k => parts[k]).join('') + '</td></tr></table>';
}
const CARD_KINDS = {};
function cardKind_(kind, build) { CARD_KINDS[kind] = build; }
function cardOfKind_(x) {
let spec = null;
try { spec = CARD_KINDS[x.kind](x); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'spec:' + x.kind); }
return spec ? renderCard(Object.assign({ kind: x.kind, key: x.key, row: x.row, item: x }, spec)) : '';
}
const qTables_ = h => String(h).replace(/<table\b/gi, '<div class="q-tscroll"><table').replace(/<\/table>/gi, '</table></div>');
const paperCells_ = (cls, c, kTag, tail) => `<div class="bk-row ${cls}"><span class="bk-n">${c[0]}</span>${kTag || `<span class="bk-k">${c[1]}</span>`}`
+ `<span class="bk-v">${c[2]}</span><span class="bk-m">${c[3]}</span><span class="bk-r">${c[4]}</span><span class="bk-t">${c[5]}</span>${tail || ''}</div>`;
function paperRow_(r) {
const cls = [r.blank ? 'is-blank' : '', r.day ? 'bk-day' : '', r.end ? 'bk-end' : '', r.free ? 'bk-free' : '', r.wide ? 'is-wide' : '',
r.strip ? 'bk-wk' : '', r.strip && r.shut ? 'is-shut' : '', r.strip && r.off ? 'is-off' : '', r.tally ? 'bk-tally' : '', r.cls || ''].filter(Boolean).join(' ');
const has = v => v != null && String(v).trim() !== '';
const value = r.tick !== undefined
? `${has(r.v) ? `<span class="bk-when">${esc(r.v)}</span> ` : ''}<span class="bk-tick${r.tick ? ' on' : ''}" role="img" aria-label="${r.tick ? 'done' : 'not yet'}">✓</span>`
: r.strip ? r.strip : r.sel ? r.sel : r.tally ? r.tally
: r.hourCells ? `<span class="bk-hrs">${r.hourCells.map(h => `<span class="bk-hr${h.on ? ' on' : ''}">${esc(h.h)}</span>`).join('')}</span>`
: r.dates ? `<span class="bk-dates">${esc(r.v)}</span>` : esc(r.v);
const bare = (!r.id || !!r.open || !!r.strip) && !has(r.mul) && !has(r.rate) && !has(r.total);
const heads = !!r.open || !!r.strip || !!r.tally;
return paperCells_(esc(cls) + (bare ? ' is-bare' : '') + (heads ? ' is-head' : ''),
[esc(r.n), esc(r.k), heads && r.dash != null && String(r.v) === r.dash ? '' : value, esc(r.mul), esc(r.rate), esc(r.total)],
r.ctl && r.sel ? `<label for="${esc(r.ctl)}" class="bk-k">${esc(r.k)}</label>` : '', r.open || '')
+ (r.say ? `<p class="bk-say${r.say.warn ? ' is-warn' : ''}">${esc(r.say.text)}</p>` : '');
}
const paperTotal_ = (k, t, cls) => paperCells_('rc-total' + (cls ? ' ' + esc(cls) : ''), ['', esc(k), '', '', '', esc(t)]);
const paperHead_ = () => paperCells_('is-cols', ['', '', '', '×', '+/h', '=']);
function paperDoc_(r) {
const head = !!(r.cols && (r.rows || []).length);
const lines = (r.lines || []).filter(Boolean).length && typeof qtag_ === 'function'
? `<div class="qtags qcard-tags">${(r.lines || []).map((l, i) => (l ? qtag_(esc(l), ` data-tag="${[6, 9, 4][i] || 0}"`) : '')).join('')}</div>` : '';
return `<div class="rc${r.done ? ' is-done' : ''}" data-state="receipt${r.done ? ' done' : ''}"><div class="rc-head">${lines}</div>${head ? '' : '<div class="rc-rule"></div>'}`
+ `<div class="bk">${head ? paperHead_() : ''}${(r.rows || []).join('')}${r.before || ''}${r.noTotal ? '' : paperTotal_(r.totalLabel || 'Cost', r.total || '')}`
+ (r.more || []).map(m => paperTotal_(m.k, m.t, 'rc-more' + (m.cls ? ' ' + m.cls : ''))).join('')
+ `${r.moreSay ? `<p class="bk-say rc-money-say">${esc(r.moreSay)}</p>` : ''}</div>`
+ `${r.roster ? '<div class="rc-rule"></div>' + r.roster : ''}<div class="rc-rule"></div>${r.foot || ''}${r.ref ? `<p class="rc-ref">${esc(r.ref)}</p>` : ''}</div>`;
}
const paperRoster_ = b => `<div class="rost">${(b.slots || []).map(sl => `<div class="rost-slot${sl.filled ? ' on' : ''}${sl.tutor ? ' tut' : ''}"><span class="rost-pic">${
sl.filled ? (sl.face || '') : '<span class="rost-plus">+</span>'}</span><span class="rost-name">${esc(sl.said)}</span>${sl.filled ? `<span class="rost-role">${esc(sl.role)}</span>` : ''}</div>`).join('')}</div>`;
const paperWhenCould_ = b => `<div class="wc">${(b.slots || []).map(s => `<div class="wc-row${s.all ? ' is-all' : ''}"><span class="wc-n">${esc(s.n)}/${esc(b.people)}</span>`
+ `<span class="wc-slot">${esc(s.slot)}</span><i data-f="${esc(s.f)}"></i></div>`).join('')}</div>`;
const paperHours_ = cols => `<div class="slot-row slot-head" aria-hidden="true"><span class="slot-day"></span><div class="slot-hours">${cols.map(h => `<span class="slot-hh">${esc(h)}</span>`).join('')}</div></div>`;
const paperWeek_ = b => `<div class="slot-grid">${paperHours_(b.cols || [])}${(b.days || []).map(d => `<div class="slot-row"><span class="slot-day">${esc(d.label)}</span><div class="slot-hours">${d.cells || ''}</div></div>`).join('')}</div>`;
const paperStrip_ = b => (b.head === 'ruler' ? `<span class="wk-hh wk-rule" aria-hidden="true">${esc(b.from)} – ${esc(b.to)}</span>`
: b.head === 'cols' ? `<span class="wk-hh" aria-hidden="true">${(b.cols || []).map(h => `<span class="slot-hh">${esc(h)}</span>`).join('')}</span>` : '')
+ `<span class="slot-hours">${b.cells || ''}</span>`;
function paperSelect_(b) {
const opt = o => `<option value="${esc(o.value)}"${o.on ? ' selected' : ''}${o.off ? ' disabled' : ''}>${esc(o.text)}</option>`;
const sel = `<select class="bk-sel" id="${esc(b.id)}" data-do="book-set" data-step="${esc(b.step)}"${b.off ? ' disabled' : ''} aria-label="${esc(b.aria)}">${(b.options || []).map(opt).join('')}</select>`;
return b.face == null ? sel : `<span class="bk-face${b.set ? ' is-set' : ''}"><span class="bk-said" aria-hidden="true">${esc(b.face)}</span>${sel}</span>`;
}
const paperSet_ = b => `<span class="bk-set">${esc(b.text)}</span>`;
const paperInput_ = b => `<input class="bk-in${b.wide ? ' bk-in-l' : ''}"${b.id ? ` id="${esc(b.id)}"` : ''}${b.act ? ` data-do="${esc(b.act)}"` : ''}${b.field ? ` data-field="${esc(b.field)}"` : ''} type="${b.kind === 'number' ? 'number' : 'text'}"`
+ `${b.kind === 'number' ? ' inputmode="decimal" min="0" max="100" step="1"' : ''} value="${esc(b.value == null ? '' : b.value)}" placeholder="${esc(b.placeholder || '')}"${b.off ? ' disabled' : ''} aria-label="${esc(b.aria || '')}">`;
const paperNote_ = b => `<p class="note${b.look ? ' ' + esc(b.look) : ''}"${b.live ? ' aria-live="polite"' : ''}${b.alert ? ' role="alert"' : ''}>${cardRuns_(b.text)}</p>`;
const paperLinks_ = b => `<p class="note policy-links">${esc(b.say || '')}${(b.links || []).map(l => `<a href="${esc(l.href)}" data-do="file-view" target="_blank" rel="noopener">${esc(l.text)}</a>`).join(' · ')}</p>`;
const paperBox_ = b => `<div${b.id ? ` id="${esc(b.id)}"` : ''} class="${esc(b.look || '')}">${b.inner || ''}</div>`;
const BOX_TAGS = { div: 1, p: 1, ul: 1, span: 1 };
const cardBox_ = b => { const t = BOX_TAGS[b.tag] ? b.tag : 'div';
return `<${t}${b.id ? ` id="${esc(b.id)}"` : ''}${b.look ? ` class="${esc(b.look)}"` : ''}${b.hidden ? ' hidden' : ''}${b.live ? ` role="${esc(b.live)}"` : ''}${b.label ? ` aria-label="${esc(b.label)}"` : ''}>`
+ (b.text != null ? cardRuns_(b.text) : '') + [].concat(b.parts || []).map(x => (typeof x === 'string' ? x : cardBlock_(x))).join('') + `</${t}>`; };
CARD_BLOCKS.box = cardBox_;
Object.assign(CARD_BLOCKS, { paperRow: paperRow_, paperDoc: paperDoc_, paperRoster: paperRoster_, paperWhenCould: paperWhenCould_, paperWeek: paperWeek_,
paperStrip: paperStrip_, paperSelect: paperSelect_, paperSet: paperSet_, paperInput: paperInput_, paperNote: paperNote_, paperLinks: paperLinks_, paperBox: paperBox_ });
const paperSnap_ = b => `<svg xmlns="http://www.w3.org/2000/svg" width="${Number(b.cw) || 1}" height="${Number(b.ch) || 1}" viewBox="0 0 ${(Number(b.cw) || 1) / (Number(b.k) || 1)} ${(Number(b.ch) || 1) / (Number(b.k) || 1)}">`
+ `<style>${String(b.css || '').replace(/<\//g, '<\\/')}</style><foreignObject x="0" y="0" width="${Number(b.w) || 1}" height="${Number(b.h) || 1}">${b.xml || ''}</foreignObject></svg>`;
const paperWhy_ = b => `<form class="req-why" data-id="${esc(b.id)}"><label>Why not? ${formInput_('name="why" maxlength="200" placeholder="optional, one line" autocomplete="off"')}</label>${tile_({ form: true, submit: true, label: 'Decline' })}</form>`;
Object.assign(CARD_BLOCKS, { paperSnap: paperSnap_, paperWhy: paperWhy_ });
const kcfAttrs_ = a => Object.keys(a || {}).filter(k => /^[a-z][\w:-]*$/i.test(k) && !/^on/i.test(k) && a[k] != null && a[k] !== false)
.map(k => (a[k] === true ? ` ${k}` : ` ${k}="${esc(String(a[k]))}"`)).join('');
const CARD_UNESC_ = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const cardUnesc_ = v => String(v).replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (m, e) => (e[0] === '#'
? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : CARD_UNESC_[e.toLowerCase()]));
function cardAttrsOf_(s) {
if (s && typeof s === 'object') return s;
const a = {}, re = /([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g; let m;
while ((m = re.exec(String(s || '')))) { if (Object.prototype.hasOwnProperty.call(a, m[1])) continue;
const v = m[2] != null ? m[2] : m[3] != null ? m[3] : m[4]; a[m[1]] = v == null ? true : cardUnesc_(v); }
return a;
}
const kcfOpts_ = opts => (opts || []).map(o => (o && o.group != null ? `<optgroup label="${esc(o.group)}">${kcfOpts_(o.options)}</optgroup>`
: `<option value="${esc(o.value == null ? '' : o.value)}"${cardAttrs_(o.data)}${o.on ? ' selected' : ''}${o.off ? ' disabled' : ''}>${esc(o.text == null ? (o.value == null ? '' : o.value) : o.text)}</option>`)).join('');
const kcfControl_ = b => (b.tag === 'select' ? `<select${kcfAttrs_(b.attrs)}>${b.options ? kcfOpts_(b.options) : (b.inner || '')}</select>` : b.tag === 'textarea' ? `<textarea${kcfAttrs_(b.attrs)}>${esc(b.value == null ? '' : b.value)}</textarea>` : `<input${kcfAttrs_(b.attrs)}>`);
const kcfPart_ = x => (Array.isArray(x) ? x.map(kcfPart_).join('') : x == null || x === false ? '' : typeof x === 'string' ? x : cardBlock_(x));
const kcfKids_ = b => (b.text != null ? cardRuns_(b.text) : '') + cardBlocks_(b.blocks) + (b.inner || '') + kcfPart_(b.parts || []);
const kcfField_ = b => `<label class="field${b.look ? ' ' + esc(b.look) : ''}"${kcfAttrs_(b.attrs)}>${
b.caps ? b.caps.map((c, i) => `<span class="${i ? 'q-cap-cert' : 'q-cap-std'}">${esc(c)}</span>`).join('') : b.cap != null && b.cap !== '' ? `<span>${esc(b.cap)}</span>` : ''}${kcfKids_(b)}</label>`;
const kcfTickB_ = b => `<label class="check${b.look ? ' ' + esc(b.look) : ''}"${kcfAttrs_(b.labelAttrs)}><input${kcfAttrs_(Object.assign({ type: 'checkbox' }, b.attrs))}><span class="box"></span><span>${cardRuns_(b.text)}</span></label>`;
const kcfMany_ = b => `<div class="field many"><span class="many-cap">${esc(b.label)}</span>${kcfControl_(b.hidden || {})}<details class="many-d" data-many="${esc(b.key)}"${b.open ? ' open' : ''}>`
+ `<summary class="many-sum${b.said ? '' : ' is-unset'}" aria-label="${esc(b.label + ': ' + (b.said || 'nothing chosen'))}">${esc(b.said || text_('tap-to-choose'))}</summary>`
+ `<div class="many-list" role="group" aria-label="${esc(b.label)}">${(b.ticks || []).map(kcfTickB_).join('')}</div></details></div>`;
const kcfGroup_ = b => { const tag = /^(span|p|details|summary|label|h2|h3|h4|section|b|i|small|sup|mark|ol|ul|li|a|img)$/.test(b.tag) ? b.tag : 'div';
if (/^\s*(javascript|vbscript):/i.test(String((b.attrs || {}).href || (b.attrs || {}).src || ''))) return '';
const open = `<${tag}${b.id ? ` id="${esc(b.id)}"` : ''}${b.look != null ? ` class="${esc(b.look)}"` : ''}${kcfAttrs_(b.attrs)}>`;
if (tag === 'img') return open;
return `${open}${kcfKids_(b)}${
(b.tiles || []).length && typeof tile_ === 'function' ? tile_(b.tiles) : ''}</${tag}>`; };
Object.assign(CARD_BLOCKS, { control: kcfControl_, field: kcfField_, tick: kcfTickB_, many: kcfMany_, group: kcfGroup_ });
const CARD_OPEN = new Set();
const cardFold_ = (key, head, blocks, look) => { const kids = [].concat(blocks || []).filter(Boolean);
return { type: 'group', tag: 'details', look: 'kc-fold' + (look ? ' ' + look : ''), attrs: { 'data-fold-key': key, open: CARD_OPEN.has(key) },
blocks: [{ type: 'group', tag: 'summary', look: 'kc-fold-sum', blocks: [head] }].concat(kids.length ? [{ type: 'group', look: 'kc-fold-in', blocks: kids }] : []) }; };
if (typeof document !== 'undefined') document.addEventListener('toggle', e => { const el = e.target, k = el && el.getAttribute && el.getAttribute('data-fold-key');
if (k) { if (el.open) CARD_OPEN.add(k); else CARD_OPEN.delete(k); } }, true);
if (typeof document !== 'undefined') document.addEventListener('click', e => { const lab = e.target && e.target.closest && e.target.closest('.kc-fold-sum label.check');
const inp = lab && lab.querySelector('input'); if (!inp || inp.disabled) return;
e.preventDefault(); inp.checked = !inp.checked; inp.dispatchEvent(new Event('change', { bubbles: true })); }, true);
const answerTag_ = (inner, attrs, cls) => `<div class="counted row tap${cls ? ' ' + cls : ''}" role="button" tabindex="0"${attrs || ''}><span class="k">${inner}</span></div>`;
const answersRow_ = (tags, cls, id) => `<div${id ? ` id="${id}"` : ''} class="answers${cls ? ' ' + cls : ''}">${tags || ''}</div>`;
const answerBox_ = (attrs, cls) => `<label class="counted row${cls ? ' ' + cls : ''}"><input${attrs || ''}></label>`;
const msgBox_ = b => `<div class="${esc(b.look || '')}"${cardAttrs_(b.data)}>${(b.parts || []).join('')}</div>`;
const msgHead_ = b => { const h = b.h === 4 ? 'h4' : 'h3'; return `<${h}${b.look ? ` class="${esc(b.look)}"` : ''}>${cardRuns_(b.text)}</${h}>`; };
const msgText_ = b => `<p class="${esc(b.look || '')}">${b.marked ? cardRuns_({ marked: b.text }) : cardRuns_(b.text)}</p>`;
Object.assign(CARD_BLOCKS, { msgBox: msgBox_, msgHead: msgHead_, msgText: msgText_ });
;
/* js/core-price.js */
function activePromoFactor(ctx) {
const promos = DATA.promotions || [];
let factor = 1;
promos.forEach(p => {
if (promoApplies(p, ctx)) factor *= (parseFloat(p.value) || 1);
});
return factor;
}
function promoApplies(p, ctx) {
if (!p || !p.active) return false;
switch (String(p.type || '').toLowerCase()) {
case 'bulk': return ctx.lessonCount >= (parseFloat(p.threshold) || 999);
case 'multi_student': return ctx.n >= (parseFloat(p.threshold) || 999);
case 'long_term': return ctx.weeks >= (parseFloat(p.threshold) || 999);
default: return false;
}
}
const pence_ = x => Math.round((Number(x) || 0) * 100) / 100;
const RATE_KEYS_ = ['base', 'subject', 'complexity', 'level', 'daytime', 'students'];
function runningAfter(key, L) {
let p = L.chargeRate || 0;
const step = { subject: L.avgSubject, complexity: L.fSubjectCount,
level: L.L, daytime: (Number(L.D) || 1) * (Number(L.T) || 1), students: L.fChildrenAll };
for (const k of RATE_KEYS_) {
if (k !== 'base') p = pence_(p * (Number(step[k]) || 1));
if (k === key) return p;
}
p += L.hosting ? 0 : (L.venueRate || 0);
if (key === 'venue') return p;
if (key === 'host') return p;
p *= (L.hoursPerWeek || 0) || 1;
if (key === 'hoursweek') return p;
p *= (L.weeksBooked || 0) || 1;
if (key === 'term') return p;
p /= (L.splitShares || 1);
return p;
}
function subjectMult(name) {
const m = DATA.multipliers || {};
const table = m.subjects || m.subjectsEta || {};
const q = num(table[name]);
return (isNaN(q) || q <= 0) ? 1 : q;
}
function levelMult(name) {
const q = num(((DATA.multipliers || {}).levels || {})[name]);
return (isNaN(q) || q <= 0) ? 1 : q;
}
const STAFF_SEAT_MAX_ = () => askProps_('extra_seat_rate').max;
const CUT_MAX_ = () => askProps_('extra_seat_cut').max;
function seatShare_(tutorRow, c, B) {
const v = ((typeof DATA !== 'undefined' && DATA && DATA.constants) || {}).vars || {};
const cv = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
if (c === undefined) c = cv('c', 'extra child rate', 'extra_child_rate');
if (B === undefined) B = cv('B', 'boss rate', 'boss_rate');
const asFraction = (x, fallback) => (x > 0 && x <= 2) ? x : fallback;
const seatTop = x => Math.min(x, STAFF_SEAT_MAX_());
const seatOwn = !!tutorRow && Number(tutorRow.extraSeat) > 0;
const cRaw = seatOwn ? Number(tutorRow.extraSeat) : c;
const cUsed = seatTop(asFraction(cRaw, 0));
return { cRaw, bRaw: B, seatOwn, cutOwn: false, cUsed, bUsed: 0 };
}
function seatCutOf_(v) {
const s = typeof v === 'number' ? String(v) : String(v == null ? '' : v).trim();
if (!/^\d*\.?\d+$/.test(s)) return NaN;
const x = Number(s);
return x <= CUT_MAX_() ? x : NaN;
}
function bookMoney_(m) {
m = m || {};
const pos = x => { const v = Number(x); return isFinite(v) && v > 0 ? v : 0; };
const teaching = pos(m.tutorPay) + pos(m.profit);
const venue = pos(m.venue);
const gross = teaching + venue;
const d = m.discount || {};
const discountType = d.type === '%' ? '%' : (d.type === '£' ? '£' : '');
const discountValue = discountType ? pos(d.value) : 0;
const asked = !discountValue ? 0
: discountType === '%' ? teaching * Math.min(discountValue, 100) / 100
: discountValue;
const tutor = pos(m.tutorPay), p = pos(m.feePct) / 100, f = pos(m.feeFixed);
const discount = Math.min(Math.round(asked * 100) / 100, teaching);
const scale = teaching > 0 ? 1 - discount / teaching : 1;
const tutorPayout = Math.round(tutor * scale * 100) / 100;
const charged = Math.round((gross - discount) * 100) / 100;
const cardFees = charged > 0 ? Math.round((charged * p + f) * 100) / 100 : 0;
const seatMoney = pos(m.seatMoney) * scale;
const managers = ((m.chain && m.chain.managers) || []).map(x => ({ id: x.id, name: x.name, share: x.share,
amount: Math.round(seatMoney * x.share * 100) / 100 }));
const managerTotal = Math.round(managers.reduce((a, x) => a + x.amount, 0) * 100) / 100;
const net = Math.round((charged - tutorPayout - venue - cardFees - managerTotal) * 100) / 100;
return { managers, managerTotal, seatMoney,
gross, discount, discountType, discountValue, discountCode: String(d.code || ''),
absorbedBy: discount ? text_('shared-with-tutor') : '',
charged, teaching, tutorPayout, venue, cardFees, net, margin: charged > 0 ? net / charged : 0,
};
}
const CHAIN_GIVE = 0.5;
function chainShares_(tutorId, people) {
const byId = {};
(people || []).forEach(p => { if (p && p.personId) byId[String(p.personId)] = p; });
const boss = p => !!p && String(p.role || '') === 'Admin';
const me = byId[String(tutorId || '')];
if (boss(me)) return { tutor: 1, managers: [], admin: 0 };
const managers = [], seen = {};
seen[String(tutorId || '')] = 1;
let left = CHAIN_GIVE, m = String((me && me.manager) || '').trim();
while (m && byId[m] && !boss(byId[m]) && !seen[m]) {
managers.push({ id: m, name: String(byId[m].title || m), share: left / 2 });
left -= left / 2;
seen[m] = 1;
m = String(byId[m].manager || '').trim();
}
return { tutor: 1 - CHAIN_GIVE, managers, admin: left };
}
function bookShares_(L) {
const e = L && L.earn;
if (!e || !(Number(L.total) > 0)) return null;
const n = Math.max(1, Number(L.splitShares) || 1), p2 = x => Math.round((Number(x) || 0) / n * 100) / 100;
const pays = p2(e.charged), tutor = p2(e.tutorPayout), fees = p2(e.venue + e.cardFees);
const managers = (e.managers || []).map(x => ({ name: x.name, share: x.share, amount: p2(x.amount) }));
const up = managers.reduce((a, x) => a + x.amount, 0);
return { pays, tutor, fees, managers, admin: Math.round((pays - tutor - fees - up) * 100) / 100 };
}
function rateBase(L, key) {
const at = RATE_KEYS_.indexOf(key);
return at > 0 ? runningAfter(RATE_KEYS_[at - 1], L) : runningAfter('students', L);
}
function priced_(v) {
if (v === null || v === undefined || String(v).trim() === '') return undefined;
const n = Number(String(v).replace(/[^0-9.-]/g, ''));
return isFinite(n) ? n : undefined;
}
function cardSeatParts_(rate, seat, cut) {
const s = seatShare_({ extraSeat: seat, extraSeatCut: cut });
return { k: s.cUsed, g: s.bUsed, kOwn: s.seatOwn, gOwn: s.cutOwn, kx: pence_(rate * s.cUsed), gx: pence_(rate * s.bUsed) };
}
const cardGroupTotal_ = (rate, seat, cut, n) => runningAfter('students',
{ chargeRate: rate, fChildrenAll: priceSeats_({ extraSeat: seat, extraSeatCut: cut }, undefined, undefined, Math.max(1, n)).fSeats });
function priceKnobs_() {
const m = DATA.multipliers || {};
const v = (DATA.constants || {}).vars || {};
const cv = (...keys) => { for (const key of keys) { const x = num(v[key]); if (!isNaN(x)) return x; } return 0; };
const cvD = (key, dflt, ...alts) => { for (const key2 of [key, ...alts]) { const x = num(v[key2]); if (!isNaN(x)) return x; } return dflt; };
const sur = (group, value) => {
if (group === 'levels') return levelMult(value);
const x = num((m[group] || {})[value]);
return (isNaN(x) || x <= 0) ? 1 : x;
};
const openRate = () => cvD('open_tutor_rate', 10);
return { cv, cvD, sur, openRate };
}
function priceSpec_(spec) {
const endDate = spec.endDate || '';
return {
subjects: spec.subjects || [],
n: Math.max(1, parseInt(spec.n) || 1),
weeks: parseFloat(spec.weeks) || 1,
interval: spec.interval || '',
endDate,
startDate: spec.startDate || '',
lastSun: spec.lastSun || endDate,
loc: spec.loc || '',
day: spec.day || '',
time: spec.time || '',
level: spec.level || '',
tutor: spec.tutor || '',
splitOthers: parseInt(spec.splitOthers) || 0,
i: spec.i,
hosting: spec.hosting,
};
}
function priceRates_(spec, q, knobs) {
const { cv, cvD, sur } = knobs;
const venue = (DATA.venues || []).find(x => norm(x.title) === norm(q.loc));
const space = spaceFor(q.loc);
const venueRate = space ? space.rate : (venue ? (parseFloat(venue.bestRate) || 0) : 0);
const V = q.hosting ? 0 : venueRate;
const tutorRow = spec.tutorRow || (q.tutor ? (DATA.tutors || []).find(t => norm(t.title) === norm(q.tutor)) : null);
const tutorRate = Number(tutorRow && tutorRow.rate) || 0;
const chargeRate = tutorRate > 0 ? tutorRate : knobs.openRate();
const usingTutorRate = tutorRate > 0;
const M = tutorRate || cv('M', 'minimum wage', 'min wage', 'μ', 'mu');
const wMul = cvD('w', 1, 'wage multiplier', 'W', 'λ', 'lambda');
const L = sur('levels', q.level);
const worstOf = (group, csv) => String(csv || '').split(',').map(x => x.trim()).filter(Boolean)
.reduce((hi, one) => Math.max(hi, sur(group, one)), 1);
const D = worstOf('days', q.day);
const T = worstOf('times', q.time);
const subjAdds = q.subjects.map(subjectMult);
const k = Math.max(1, subjAdds.length);
const avgSubject = subjAdds.length ? subjAdds.reduce((x, y) => x + y, 0) / k : 1;
const s = cv('s', 'subject count rate', 'subject_count_rate');
const c = cv('c', 'extra child rate', 'extra_child_rate');
const B = cv('B', 'boss rate', 'boss_rate');
const b = cv('b', 'bulk discount rate', 'bulk_discount_rate');
const a = cv('a', 'advance booking rate', 'early booking rate');
const h = num(spec.hours) > 0 ? num(spec.hours) : 0;
return { venueRate, V, tutorRow, chargeRate, usingTutorRate, M, wMul, L, D, T, k, avgSubject, s, c, B, b, a, h };
}
function priceDates_(spec, q) {
const runList = spec.runs && spec.runs.length ? spec.runs
: String(q.day || '').split(',').map(x => x.trim()).filter(Boolean).map(d => ({ dayName: d }));
const DAY_FROM_PREFIX = { m:'Monday', tu:'Tuesday', w:'Wednesday', th:'Thursday',
f:'Friday', sa:'Saturday', su:'Sunday' };
const bookedDays = [...new Set(runList
.map(r => r.dayName || DAY_FROM_PREFIX[r.day] || '')
.filter(Boolean))];
const windows = (spec.windows && spec.windows.length) ? spec.windows
: [{ startDate: q.startDate, lastSun: q.lastSun }];
const seenDay = {};
const sessionDates = spec.sessionDates ? spec.sessionDates.slice() : bookedDays
.map(d => windows
.map(w => computeSessionDates(d, w.lastSun || w.endDate, w.startDate))
.reduce((all, list) => all.concat(list), []))
.reduce((all, list) => all.concat(list), [])
.filter(dt => { const k = dt.getTime(); if (seenDay[k]) return false; seenDay[k] = 1; return true; })
.sort((a, b) => a - b);
const slots = spec.slots || sessionDates.length || 0;
const weeksLeft = q.interval ? (parseFloat(spec.weeks) || 0) : 0;
const W = slots;
const firstDate = sessionDates[0] || null;
const A = firstDate ? Math.max(0, Math.floor((firstDate - new Date()) / (7 * 864e5))) : 0;
return { runList, bookedDays, sessionDates, slots, weeksLeft, W, firstDate, A };
}
function priceSeats_(tutorRow, c, B, n) {
const { cRaw, bRaw, cutOwn, cUsed, bUsed } = seatShare_(tutorRow, c, B);
const ignored = [];
if (cRaw > 2) ignored.push(`c ${cRaw}`);
if (bRaw > 2 || bRaw < 0) ignored.push(cutOwn ? `their cut ${bRaw}` : `B ${bRaw}`);
const seatSource = ignored.length
? `ignoring ${ignored.join(' and ')} — not fractions`
: ((tutorRow && Number(tutorRow.extraSeat) > 0) ? `tutor ${cUsed}` : `config ${cUsed}`)
+ (cutOwn ? ` + their cut ${bUsed}` : ` + B ${bUsed}`);
const fSeats = 1 + (cUsed + bUsed) * (n - 1);
return { cUsed, bUsed, seatSource, fSeats };
}
function priceWaitlist_(spec, knobs) {
const seats = Math.max(1, parseInt(spec.seats) || 1);
const tutor = knobs.openRate();
if (tutor <= 0) return null;
const hourly = (num(spec.room) || 0) + tutor + knobs.cv('waitlist_extra_seat') * (seats - 1);
const hours = knobs.cv('h') || 2;
const perSeatHour = Math.round((hourly / seats) * 100) / 100;
return { seats, hours, hourlyWhole: Math.round(hourly * 100) / 100, perSeatHour,
perSeatSession: Math.round(perSeatHour * hours * 100) / 100 };
}
function priceFrom(spec) {
spec = spec || {};
const knobs = priceKnobs_();
if (spec.waitlist) return priceWaitlist_(spec, knobs);
const q = priceSpec_(spec);
const { subjects, n, weeks, interval, endDate, startDate, lastSun, loc, day, time, level, tutor, splitOthers, i, hosting } = q;
const { venueRate, V, tutorRow, chargeRate, usingTutorRate, M, wMul, L, D, T, k, avgSubject, s, c, B, b, a, h } = priceRates_(spec, q, knobs);
const { runList, bookedDays, sessionDates, slots, weeksLeft, W, firstDate, A } = priceDates_(spec, q);
const baseHourly = chargeRate * avgSubject * L * D * T;
const fSubjects = 1 + s * (k - 1);
const { cUsed, bUsed, seatSource, fSeats } = priceSeats_(tutorRow, c, B, n);
const fBulk = 1;
const fAdvance = 1;
const discountFactor = fBulk * fAdvance;
const discountFloored = false;
const F = 0;
const perChildHourly = baseHourly;
const R = baseHourly * fSubjects;
const addSubjects = R - baseHourly;
const addChildren = R * (fSeats - 1);
const fSubjectCount = fSubjects, fChildrenAll = fSeats;
const promoAdj = activePromoFactor({ subjects, n, weeks: W, day, time, level,
lessonCount: spec.lessonCount || 1 });
const { weeksBooked, hoursTotal, splitShares, chargePerHour, tutorPay, profitTotal, venueTotal,
cost, tutorHourly, belowMinWage, mo, total, wholeTotal, shareAmount } = priceMoney_(spec, knobs,
{ R, fSeats, discountFactor, promoAdj, V, splitOthers, bookedDays, sessionDates, slots,
chargeRate, avgSubject, L, D, T, fSubjects, cUsed, bUsed, M, tutorRow,
rows: { chargeRate, avgSubject, fSubjectCount: fSubjects, L, D, T, fChildrenAll: fSeats, n } });
return {
i, total, weeks, slots, n, V, loc, day, time, level, subjects, tutor, interval, endDate, startDate, lastSun,
slotsKnown: spec.slotsKnown !== false && slots > 0,
weeksLeft,
provisional: !sessionDates.length && slots > 0,
runs: runList,
venueRate, hosting, seatSource,
hoursPerWeek: num(spec.hoursPerWeek) || 0, weeksBooked,
fBulk, fAdvance, A,
chargeRate,
sessionDates, firstDate,
M, wMul, L, D, T, avgSubject, k, s, c, B, b, a, h, A, W,
usingTutorRate,
perChildHourly, addSubjects, addChildren, fSubjectCount, fChildrenAll, fBulk, fAdvance,
discountFactor, discountFloored, F, R,
chargePerHour, hoursTotal, tutorPay, venueTotal, cost, tutorHourly, belowMinWage,
promoAdj, splitOthers, splitShares, shareAmount, profitTotal, wholeTotal,
earn: mo,
summary: { service: (typeof document !== 'undefined' ? val('c-service') : ''), level,
subject: subjects.join(', '), location: loc, day, time, students: n,
interval, weeks, requestedTutor: tutor }
};
}
function priceMoney_(spec, knobs, p) {
const { R, fSeats, discountFactor, promoAdj, V, splitOthers, bookedDays, sessionDates, slots,
chargeRate, avgSubject, L, D, T, fSubjects, cUsed, bUsed, M } = p;
const runsPerWeek = Math.max(1, bookedDays.length || 1);
const weeksBooked = sessionDates.length
? Math.max(1, Math.round(sessionDates.length / runsPerWeek))
: (slots ? Math.round(slots / runsPerWeek) : 0);
const hoursTotal = (num(spec.hoursPerWeek) || 0) * weeksBooked;
const splitShares = splitOthers + 1;
const rate = pence_(runningAfter('students', p.rows) * discountFactor * promoAdj);
const chargePerHour = (rate + V) / splitShares;
const teachTotal = hoursTotal ? chargePerHour * hoursTotal : null;
const r = pence_(runningAfter('daytime', p.rows) * discountFactor * promoAdj);
const chain = chainShares_(p.tutorRow && p.tutorRow.personId, (typeof DATA !== 'undefined' && DATA && DATA.tutors) || []);
const seatHour = pence_(r * cUsed * Math.max(0, (p.rows.n || 1) - 1));
const tutorHour = pence_(r + seatHour * chain.tutor);
const tutorPay = Math.min(tutorHour, rate) * hoursTotal;
const profitTotal = rate * hoursTotal - tutorPay;
const venueTotal = V * hoursTotal;
const cost = tutorPay + venueTotal;
const tutorHourly = hoursTotal ? tutorPay / hoursTotal : 0;
const belowMinWage = M > 0 && tutorHourly > 0 && tutorHourly < M;
const mo = bookMoney_({
hours: hoursTotal,
tutorPay, profit: profitTotal, venue: venueTotal,
discount: spec.discount || null, seatMoney: seatHour * hoursTotal, chain,
feePct: knobs.cvD('card_fee_pct', 0), feeFixed: knobs.cvD('card_fee_fixed', 0),
});
const total = teachTotal === null ? null : mo.charged / splitShares;
const wholeTotal = total === null ? null : mo.charged;
return { weeksBooked, hoursTotal, splitShares, chargePerHour, tutorPay, profitTotal, venueTotal,
cost, tutorHourly, belowMinWage, mo, total, wholeTotal, shareAmount: total };
}
;
/* js/predicates.js */
const isQ_ = x => !!x && x.kind === 'question';
const isContent_ = x => !!x && x.kind === 'content';
const isFight_ = x => !!x && x.kind === 'fight';
const isProject_ = x => !!x && x.kind === 'project';
const isShop_ = x => !!x && x.kind === 'shop';
const isPractical_ = x => !!x && x.kind === 'practical';
const isManuscript_ = x => !!x && x.kind === 'manuscript';
const isPerson_ = x => !!x && x.kind === 'people';
const isBoxer_ = x => isPerson_(x) && x.boxKind === 'Fighters';
const isBible_ = x => !!x && x.kind === 'bible';
const isWriting_ = x => !!x && x.kind === 'writing';
const isMeCard_ = x => !!x && x.kind === 'me';
const isPreamble_ = r => !!r && r.kind === 'preamble';
const isDocument_ = r => !!r && r.kind === 'document';
const isCheckbox_ = el => !!el && el.type === 'checkbox';
const isSteadyPointer_ = c => !!c && (c.type === 'mouse' || c.type === 'pen');
const isPenPointer_ = c => !!c && c.type === 'pen';
const isTouchPointer_ = c => !!c && c.type === 'touch';
const isFileBox_ = el => !!el && el.type === 'file';
const isHiddenBox_ = el => !!el && el.type === 'hidden';
;
/* js/predicates-marks.js */
const isPrint_ = c => !!c && c.kind === 'print';
const isTutorsCol_ = col => col === 'tutors';
const isStudentsCol_ = col => col === 'students';
const isAtHost_ = h => !!h && h.id === 's-' + AT;
const isToast_ = el => !!el && el.id === 'toast';
const SIGN_IN_BOXES = ['in-name'];
const isSignInBox_ = el => !!el && SIGN_IN_BOXES.indexOf(el.id) !== -1;
const MEASURE_TOOLS = ['measure', 'ruler', 'protractor'];
const isMeasureTool_ = id => MEASURE_TOOLS.indexOf(id) !== -1;
const CHOICE_MARKERS = ['choice', 'order'];
const isChoiceMarker_ = kind => CHOICE_MARKERS.indexOf(kind) !== -1;
const chipsOn_ = (fs, field) => (fs || []).filter(f => f && f.field === field);
const findIs_ = id => (typeof finderOf_ === 'function' ? !!finderOf_(id) : id === FIND_HOME_);
const FIND_HOME_ = 'stuff';
;
/* js/predicates-fig.js */
const FIG_WORDS = /\b(grid|diagrams?|shapes?|tables?|graphs?|charts?|histogram|pictogram|figure|drawn|shown|below|number line|axes|axis|scatter|spinner|protractor|coordinate grid|scale drawing)\b/i;
const FIG_NOT_WORDS = /\b(in figures|national grid|periodic tables?|below (?:the )?(?:surface|water|sea|ground|zero|freezing)|[xy]\s*-?\s*axis|significant figures?|figures? (?:on|of) )/gi;
const figWords_ = r => !!r && FIG_WORDS.test(String((r.html || '') + ' ' + (r.lead || '')).replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(FIG_NOT_WORDS, ' '));
const figPictured_ = r => !!r && ((typeof r.diagram === 'string' && r.diagram.trim() !== '') ||
(' ' + String(r.lib_has || '') + ' ').indexOf(' diagram ') !== -1 ||
/<(table|svg|img)\b/i.test(String(r.html || '') + String(r.lead || '')) || !!r.cells || !!r.surface || figPictured_(r.row));
const figUndrawn_ = (r, around) => figWords_(r) && !figPictured_(r) && !(around || []).some(figPictured_);
;
/* js/fig-place.js */
const FP_SKIP = 'defs, clipPath, mask, marker, pattern, symbol';
const FP_NUM = /^[−–-]?\d+(\.\d+)?$/;
const FP_GAP = 1.2;
function fpSeen_(el) {
for (let n = el; n && n.tagName !== 'svg'; n = n.parentElement) {
const cs = getComputedStyle(n);
if (cs.display === 'none' || Number(cs.opacity) === 0) return false;
}
return true;
}
function fpInk_(el, inv) {
const bb = el.getBBox();
if (!bb.width) return null;
const fs = parseFloat(getComputedStyle(el).fontSize) || 12;
const m = inv.multiply(el.getScreenCTM());
const lines = Math.max(1, Math.round(bb.height / (fs * 1.15)));
const desc = lines === 1 && /[gjpqy(),;]/.test(el.textContent);
const top = bb.y + (lines === 1 ? bb.height - 0.96 * fs : 0.1 * fs), bot = bb.y + bb.height - (desc ? 0 : 0.2 * fs);
const xs = [m.a * bb.x + m.c * top + m.e, m.a * (bb.x + bb.width) + m.c * bot + m.e];
const ys = [m.b * bb.x + m.d * top + m.f, m.b * (bb.x + bb.width) + m.d * bot + m.f];
return { fs, x0: Math.min(xs[0], xs[1]), x1: Math.max(xs[0], xs[1]), y0: Math.min(ys[0], ys[1]), y1: Math.max(ys[0], ys[1]) };
}
function fpInk2_(svg, inv) {
const cells = new Map(), axes = [];
svg.querySelectorAll('line, path, polyline, polygon, rect, circle, ellipse').forEach(g => {
if (g.closest(FP_SKIP) || g.classList.contains('grid') || !fpSeen_(g)) return;
const cs = getComputedStyle(g);
if (cs.stroke === 'none' || !(parseFloat(cs.strokeWidth) > 0.05) || Number(cs.strokeOpacity) === 0) return;
let len; try { len = g.getTotalLength(); } catch (e) { return; }
if (!(len > 0)) return;
const m = inv.multiply(g.getScreenCTM()), n = Math.min(4000, Math.ceil(len));
let a = null, b = null;
for (let i = 0; i <= n; i++) {
const p = g.getPointAtLength(len * i / n), x = m.a * p.x + m.c * p.y + m.e, y = m.b * p.x + m.d * p.y + m.f;
const k = Math.floor(x / 8) + ',' + Math.floor(y / 8);
(cells.get(k) || cells.set(k, []).get(k)).push(x, y);
if (i === 0) a = { x, y }; if (i === n) b = { x, y };
}
if (g.tagName === 'line' && a && b) {
if (Math.abs(a.y - b.y) < 0.5) axes.push({ h: true, at: a.y, lo: Math.min(a.x, b.x), hi: Math.max(a.x, b.x) });
else if (Math.abs(a.x - b.x) < 0.5) axes.push({ h: false, at: a.x, lo: Math.min(a.y, b.y), hi: Math.max(a.y, b.y) });
}
});
return { cells, axes };
}
function fpOnInk_(ink, b) {
for (let cx = Math.floor(b.x0 / 8); cx <= Math.floor(b.x1 / 8); cx++) for (let cy = Math.floor(b.y0 / 8); cy <= Math.floor(b.y1 / 8); cy++) {
const p = ink.cells.get(cx + ',' + cy);
if (p) for (let i = 0; i < p.length; i += 2) if (p[i] > b.x0 && p[i] < b.x1 && p[i + 1] > b.y0 && p[i + 1] < b.y1) return true;
}
return false;
}
const fpMeet_ = (a, b) => Math.min(a.x1, b.x1) > Math.max(a.x0, b.x0) && Math.min(a.y1, b.y1) > Math.max(a.y0, b.y0);
const fpGrow_ = (b, g) => ({ x0: b.x0 - g, x1: b.x1 + g, y0: b.y0 - g, y1: b.y1 + g });
const fpAt_ = (b, dx, dy) => ({ x0: b.x0 + dx, x1: b.x1 + dx, y0: b.y0 + dy, y1: b.y1 + dy, fs: b.fs });
function fpUndo_(svg) {
svg.querySelectorAll('[data-fp]').forEach(t => {
const was = t.getAttribute('data-fp');
if (was === '-') t.removeAttribute('transform'); else t.setAttribute('transform', was);
t.removeAttribute('data-fp');
});
svg.querySelectorAll('[data-fp-hid]').forEach(t => { t.style.display = ''; t.removeAttribute('data-fp-hid'); });
}
function fpMove_(l, dx, dy) {
if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return;
const t = l.el;
if (!t.hasAttribute('data-fp')) t.setAttribute('data-fp', t.getAttribute('transform') || '-');
const was = t.getAttribute('data-fp');
l.dx += dx; l.dy += dy;
t.setAttribute('transform', `translate(${l.dx.toFixed(2)} ${l.dy.toFixed(2)})` + (was === '-' ? '' : ' ' + was));
l.b = fpAt_(l.b, dx, dy);
}
function fpHide_(l) { l.el.style.display = 'none'; l.el.setAttribute('data-fp-hid', '1'); l.gone = true; }
function fpAxes_(labels, ink) {
const H = ink.axes.filter(a => a.h), V = ink.axes.filter(a => !a.h);
const own = new Set();
const cx = b => (b.x0 + b.x1) / 2, cy = b => (b.y0 + b.y1) / 2;
H.forEach(ax => {
const vx = V.find(v => v.lo - 1 <= ax.at && v.hi + 1 >= ax.at && v.at >= ax.lo - 1 && v.at <= ax.hi + 1);
const row = labels.filter(l => !own.has(l) && FP_NUM.test(l.s) && Math.abs(cy(l.b) - ax.at) < 1.8 * l.b.fs
&& cx(l.b) >= ax.lo - l.b.fs && cx(l.b) <= ax.hi + l.b.fs && !(vx && Math.abs(cx(l.b) - vx.at) < 0.3 * l.b.fs && Number(l.s.replace(/[−–]/, '-')) !== 0));
if (row.length < 2) return;
const above = row.filter(l => cy(l.b) < ax.at).length > row.length / 2;
row.forEach(l => { own.add(l); fpMove_(l, 0, above ? ax.at - FP_GAP - l.b.y1 : ax.at + FP_GAP - l.b.y0); });
fpThin_(row, 'x');
});
V.forEach(ax => {
const row = labels.filter(l => !own.has(l) && FP_NUM.test(l.s) && Math.abs(cx(l.b) - ax.at) < 2.5 * l.b.fs
&& cy(l.b) >= ax.lo - l.b.fs && cy(l.b) <= ax.hi + l.b.fs);
if (row.length < 2) return;
const right = row.filter(l => cx(l.b) > ax.at).length > row.length / 2;
row.forEach(l => { own.add(l); fpMove_(l, right ? ax.at + FP_GAP - l.b.x0 : ax.at - FP_GAP - l.b.x1, 0); });
fpThin_(row, 'y');
});
H.forEach(h => V.forEach(v => {
if (v.lo - 1 > h.at || v.hi + 1 < h.at || v.at < h.lo - 1 || v.at > h.hi + 1) return;
const near = labels.filter(l => !l.gone && /^[O0]$/.test(l.s) && Math.abs(cx(l.b) - v.at) < 2 * l.b.fs && Math.abs(cy(l.b) - h.at) < 2 * l.b.fs);
near.slice(1).forEach(fpHide_);
if (near[0]) { own.add(near[0]); fpMove_(near[0], v.at - FP_GAP - near[0].b.x1, h.at + FP_GAP - near[0].b.y0); }
if (near[0]) labels.forEach(l => { if (l !== near[0] && !l.gone && own.has(l) && fpMeet_(fpGrow_(l.b, 0.5), near[0].b)) fpHide_(l); });
}));
return own;
}
function fpThin_(row, k) {
const lo = k === 'x' ? 'x0' : 'y0', hi = k === 'x' ? 'x1' : 'y1';
row.sort((a, b) => a.b[lo] - b.b[lo]);
for (let step = 1; step <= row.length; step++) {
const keep = row.filter((l, i) => i % step === (row.length - 1) % step || step === 1);
const ok = keep.every((l, i) => !i || keep[i - 1].b[hi] + 0.3 * l.b.fs <= l.b[lo]);
if (ok) { row.forEach(l => { if (keep.indexOf(l) < 0) fpHide_(l); }); return; }
}
}
function fpOne_(svg) {
let inv; try { inv = svg.getScreenCTM().inverse(); } catch (e) { return false; }
const labels = [];
svg.querySelectorAll('text').forEach(el => {
if (el.closest(FP_SKIP) || !el.textContent.trim() || el.parentElement.closest('text') || !fpSeen_(el)) return;
const b = fpInk_(el, inv);
if (b) labels.push({ el, b, s: el.textContent.trim().replace(/\s+/g, ' '), dx: 0, dy: 0 });
});
if (!labels.length) return true;
const ink = fpInk2_(svg, inv);
const vb = svg.viewBox && svg.viewBox.baseVal && svg.viewBox.baseVal.width ? svg.viewBox.baseVal : null;
const axisOwn = fpAxes_(labels, ink);
const live = labels.filter(l => !l.gone);
const inside = b => !vb || (b.x0 >= vb.x && b.x1 <= vb.x + vb.width && b.y0 >= vb.y && b.y1 <= vb.y + vb.height);
const clear = (l, b, done) => inside(b) && !fpOnInk_(ink, fpGrow_(b, FP_GAP)) && !done.some(d => fpMeet_(fpGrow_(b, FP_GAP), d.b));
const done = [], todo = [];
live.forEach(l => (clear(l, l.b, live.filter(o => o !== l)) ? done : todo).push(l));
todo.sort((a, b) => (axisOwn.has(a) ? 0 : 1) - (axisOwn.has(b) ? 0 : 1));
todo.forEach(l => {
const R = 1.6 * l.b.fs;
let best = null;
for (let r = 1; r <= R && !best; r += 1) {
const n = Math.max(8, Math.round(r * 1.5));
for (let i = 0; i < n; i++) {
const a = (i / n) * 2 * Math.PI, dx = r * Math.cos(a), dy = r * Math.sin(a);
if (clear(l, fpAt_(l.b, dx, dy), done)) { best = [dx, dy]; break; }
}
}
if (best) fpMove_(l, best[0], best[1]);
else if (axisOwn.has(l)) { fpHide_(l); return; }
done.push(l);
});
return true;
}
function figPlace_(root) {
const r = root && root.querySelectorAll ? root : (typeof document !== 'undefined' && document.querySelectorAll ? document : null);
if (!r) return;
r.querySelectorAll('figure > svg, .qpad-art > svg:first-child').forEach(svg => {
const t = svg.querySelector('text');
if (!t) return;
const key = getComputedStyle(t).fontSize;
if (svg.getAttribute('data-fp-at') === key) return;
if (!svg.getBoundingClientRect().width) return;
fpUndo_(svg);
try { if (fpOne_(svg)) svg.setAttribute('data-fp-at', key); } catch (e) { fpUndo_(svg); }
});
}
try {
if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined' && window.SVGGraphicsElement && window.SVGGraphicsElement.prototype.getBBox) {
let due = false;
const soon = () => { if (due) return; due = true; requestAnimationFrame(() => { due = false; try { figPlace_(document); } catch (e) { } }); };
new MutationObserver(ms => { if (ms.some(m => m.addedNodes.length)) soon(); }).observe(document.documentElement, { childList: true, subtree: true });
addEventListener('resize', soon);
if (document.fonts) { document.fonts.ready.then(soon); document.fonts.addEventListener && document.fonts.addEventListener('loadingdone', soon); }
}
} catch (e) { }
;
/* js/price-rows.js */
const PRICE_ROWS = [
{ key: 'term', label: 'Time interval', kind: 'total-mult', group: 'shape',
control: 'l-interval',
value: L => L.interval || (L.weeksBooked ? L.weeksBooked + ' weeks' : ''),
scale: L => L.weeksBooked || L.weeksLeft || 0,
idle: L => '',
show: L => !!L.W },
{ key: 'base', label: 'Tuition', kind: 'rate-add', group: 'rate',
control: 'l-tutor',
value: L => L.tutor || text_('no-preference'),
perHour: L => L.chargeRate || 0,
isBase: true, show: L => true },
{ key: 'subject', label: 'Subject', kind: 'rate-mult', group: 'rate',
control: 'subject-picker',
value: L => (L.subjects || []).join(', '),
mult: L => L.avgSubject,
of: L => rateBase(L, 'subject') },
{ key: 'complexity', label: 'Extra subjects', row: text_('extra-subj'), kind: 'rate-mult', group: 'rate',
control: null,
value: L => String(Math.max(0, (L.k || 1) - 1)),
mult: L => L.fSubjectCount,
of: L => rateBase(L, 'complexity') },
{ key: 'level', label: 'Level', kind: 'rate-mult', group: 'rate',
control: 'l-level',
value: L => L.level || '',
mult: L => L.L,
of: L => rateBase(L, 'level') },
{ key: 'daytime', label: 'Day & time', kind: 'rate-mult', group: 'rate',
control: null,
value: L => '',
mult: L => (Number(L.D) || 1) * (Number(L.T) || 1),
of: L => rateBase(L, 'daytime'),
show: () => false },
{ key: 'students', label: text_('extra-seats'), kind: 'rate-mult', group: 'rate',
control: 'l-qty',
value: L => String(Math.max(0, (L.n || 1) - 1))
+ (may_('admin') && L.seatSource ? ' ' + cardBlock_({ type: 'group', tag: 'span', look: 'note', text: L.seatSource }) : ''),
mult: L => L.fChildrenAll,
of: L => rateBase(L, 'students') },
{ key: 'venue', label: 'Venue', kind: 'rate-add', group: 'rate',
control: 'l-location',
value: L => L.loc || '',
perHour: L => (L.hosting ? 0 : L.venueRate) || 0,
atCost: true },
{ key: 'host', label: 'Host', row: 'Space', kind: 'rate-add', group: 'rate',
control: 'host-toggle',
perHour: L => (L.hosting && L.venueRate) ? -L.venueRate : 0,
atCost: true,
show: L => false },
];
function priceCells(row, L, fmt) {
const { esc } = fmt;
const out = { mul: '', rate: '', total: '' };
const hours = L.hoursTotal || 0;
const over = (perHour, atCost) => perHour * hours
* (atCost ? 1 : (L.discountFactor || 1) * (L.promoAdj || 1));
const known = hours > 0;
const signed = (x, unit) => (x === 0 ? dash_()
: (x > 0 ? '+ ' : '− ') + fmtMoney_(Math.abs(x)) + (unit || ''));
const isRateRow = ['base','subject','complexity','level','daytime','students','venue','host'].includes(row.key);
const running = () => {
if (isRateRow || known) return { total: fmtMoney_(runningAfter(row.key, L)) };
const why = !L.hoursPerWeek ? 'tick some hours'
: !L.weeksBooked ? 'pick a time interval'
: '';
return { total: (row.key === 'hoursweek' && why) ? cardBlock_({ type: 'group', tag: 'span', look: 'note', text: why }) : dash_() };
};
if (row.kind === 'total-mult') {
const f = row.scale(L);
if (!f || (f === 1 && !row.unit)) {
out.mul = row.idle ? row.idle(L) : '';
return out;
}
out.mul = '× ' + Number(f).toFixed(f % 1 ? (f * 100 % 1 ? 3 : 2) : 0);
if (row.perHour) {
const per = row.perHour(L);
if (per) out.rate = signed(per, '/h');
}
Object.assign(out, running());
return out;
}
if (row.kind === 'rate-mult') {
const m = Number(row.mult(L));
if (row.key === 'level' && (!L.tutor || /^no preference$/i.test(L.tutor)) && L.level) {
const at = row.of(L) * (m || 1);
out.mul = m && m !== 1 ? '× ' + Number(m).toFixed(m % 1 ? (m * 100 % 1 ? 3 : 2) : 0) : '';
out.rate = fmtMoney_(at, 'hour');
Object.assign(out, running());
return out;
}
if (!m || m === 1) { out.mul = row.value && row.value(L) ? dash_() : ''; return out; }
const base = row.of(L);
const perHour = pence_(runningAfter(row.key, L) - base);
out.mul = '× ' + Number(m).toFixed(m % 1 ? (m * 100 % 1 ? 3 : 2) : 0);
out.rate = signed(perHour, '/h');
Object.assign(out, running());
return out;
}
const perHour = row.perHour(L);
if (!perHour) {
Object.assign(out, running());
return out;
}
out.mul = '';
out.rate = row.isBase ? fmtMoney_(perHour, 'hour') : signed(perHour, '/h');
Object.assign(out, running());
return out;
}
const subjectIn_ = s => String(s || '').replace(/\s*\([^)]*\)/, '').trim();
const levelIn_ = s => (String(s || '').match(/\(([^)]+)\)/) || [, ''])[1].trim();
function subjectRows() {
return (DATA.dropdowns?.subjects || []).map(name => {
const tutors = (DATA.tutors || []).filter(t =>
(t.teaches || []).some(x => norm(subjectIn_(x)) === norm(name)));
const levels = uniq(tutors.flatMap(t => (t.teaches || [])
.filter(x => norm(subjectIn_(x)) === norm(name))
.map(x => levelIn_(x))));
const focus = ((DATA.dropdowns || {}).focus || {}).subject || {};
return { name, mult: subjectMult(name), tutors, levels,
focus: focus[name] || '', rowIndex: null, type: 'subject' };
});
}
function levelRows() {
const listed = (DATA.dropdowns || {}).levels || [];
const priced = Object.keys((DATA.multipliers || {}).levels || {});
const taught = uniq((DATA.tutors || []).flatMap(t =>
(t.teaches || []).map(x => levelIn_(x))));
const names = uniq([...listed, ...taught, ...priced].filter(Boolean));
return names.map(name => {
const tutors = (DATA.tutors || []).filter(t =>
(t.teaches || []).some(x => norm(levelIn_(x)) === norm(name)));
const subjects = uniq(tutors.flatMap(t => (t.teaches || [])
.filter(x => norm(levelIn_(x)) === norm(name))
.map(x => subjectIn_(x))));
const focus = ((DATA.dropdowns || {}).focus || {}).level || {};
return {
name,
mult: levelMult(name),
priced: levelPriced(name),
listed: listed.some(l => norm(l) === norm(name)),
tutors, subjects,
focus: focus[name] || '', rowIndex: null, type: 'level',
};
});
}
;
/* js/data-who.js */
let DATA = {};
let USER = null;
try { USER = JSON.parse(localStorage.getItem('familyUser') || 'null'); } catch { }
const WIDGET_HOME = {};
const $ = id => {
const el = document.getElementById(id);
if (!el || typeof AT === 'undefined' || !AT) return el;
const scr = document.getElementById('s-' + AT);
if (!scr || scr.contains(el)) return el;
try {
const mine = scr.querySelector('#' + CSS.escape(id));
if (mine) return mine;
const slot = el.closest && el.closest('.widget-slot');
const home = slot && WIDGET_HOME[slot.id];
const host = home && home !== AT && document.getElementById('s-' + home);
if (!host || host.contains(el)) return el;
return host.querySelector('#' + CSS.escape(id)) || el;
} catch { return el; }
};
const initial = s => (String(s ?? '').match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase();
const brand = (k, or) => ((DATA.brand || {})[k] || (DATA.policy || {})[k] || or || '');
const isWearable = x => {
const k = norm(x && (x.kind || x.kindRaw));
return k === 'wearable' || k === 'avatar';
};
const roleFor_ = (u = USER) => (!u ? ROLES_.guest.tier : rankTier_(rank_(u)));
const may_ = (what, u = USER) => {
if (what === 'prices' && u && u.lockedPreview) return may_('prices', u.realViewer);
const r = roleFor_(u), fixed = mayWord_(what, r, u ? rank_(u) : '', !!(u && u.owner));
if (fixed !== undefined) return fixed;
return typeof can_ === 'function' ? can_(r, 'action', what) : r === 'admin';
};
let LENS = null;
const whose_ = () => (LENS && may_('admin') ? LENS : USER);
const lensOn_ = () => !!USER && whose_() !== USER;
const whoseAtLeast_ = want => rankAtLeast_(want, whose_());
;
/* js/data.js */
const API = 'https://script.google.com/macros/s/AKfycbyDr5ZsF63_zfgx3tlhqPF3H7U8zSY8TjB8EKY30ZWxBfDIR0QztN4B64V9c-mud7Go/exec';
const SITE_VERSION = window.SITE_STAMP || 'local';
function cssVersion() {
try {
const v = getComputedStyle(document.documentElement)
.getPropertyValue('--css-version').trim().replace(/^["']|["']$/g, '');
return v || '(older than versioning)';
} catch { return '(unknown)'; }
}
function dataRowsClean_(d) {
const out = {};
if (!d || typeof d !== 'object') return out;
const isRow = x => !!x && typeof x === 'object' && !Array.isArray(x);
Object.keys(d).forEach(k => {
const v = d[k];
if (!Array.isArray(v)) return;
const rows = v.some(isRow);
const kept = v.filter(x => x != null && (!rows || isRow(x)));
if (kept.length !== v.length) { out[k] = v.length - kept.length; d[k] = kept; }
});
return out;
}
function jsonp(url) {
return new Promise((ok, no) => {
const name = '__fam' + Date.now() + Math.floor(Math.random() * 1000);
const tag = document.createElement('script');
const done = () => { delete window[name]; tag.remove(); };
window[name] = d => { done(); ok({ __jsonp: d }); };
tag.onerror = () => { done(); no(new Error('the backend did not load as a script')); };
tag.src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + name;
document.head.appendChild(tag);
});
}
let LATER_ASK = null, LATER_IN = false;
function laterFiles_() {
if (LATER_ASK) return LATER_ASK;
const lazy = (typeof window !== 'undefined' && Array.isArray(window.LAZY)) ? window.LAZY : [];
const later = (typeof window !== 'undefined' && Array.isArray(window.LATER)) ? window.LATER.filter(f => lazy.indexOf(f) === -1) : [];
LATER_ASK = batchFiles_(later, 'later').then(ok => {
if (ok) { LATER_IN = true; return; }
LATER_ASK = null;
laterFiles_.tries = (laterFiles_.tries || 0) + 1;
setTimeout(() => laterFiles_().then(() => {
if (!LATER_IN || typeof LOADED === 'undefined' || !LOADED) return;
try { adoptMarks_(); } catch (e) { oops_(e, 'data:laterIn'); }
try { repaint(); } catch (e) { oops_(e, 'data:laterIn'); }
}), Math.min(30000, 1000 * Math.pow(2, laterFiles_.tries - 1)));
});
return LATER_ASK;
}
let LAZY_ASK = null;
function lazyFiles_() {
if (LAZY_ASK) return LAZY_ASK;
const lazy = (typeof window !== 'undefined' && Array.isArray(window.LAZY)) ? window.LAZY : [];
LAZY_ASK = laterFiles_().then(() => (LATER_IN ? batchFiles_(lazy, 'lazy') : false)).then(ok => {
if (!ok) { LAZY_ASK = null; return; }
lazyFiles_.in = true;
try { if (typeof STALE !== 'undefined' && STALE[AT] && LOADED) repaint(); } catch (e) { oops_(e, 'data:lazyIn'); }
});
return LAZY_ASK;
}
function filesIn_() { return LATER_IN && (!(Array.isArray(window.LAZY) && window.LAZY.length) || !!lazyFiles_.in); }
function batchFiles_(want, bundle) {
const off = Array.isArray(window.OFF) ? window.OFF : [];
const list = (Array.isArray(window.FILES) ? window.FILES : want).filter(f => want.indexOf(f) !== -1 && off.indexOf(f) === -1);
if (!list.length || typeof document === 'undefined' || typeof fetch !== 'function') return Promise.resolve(true);
if (bundle && window.BUNDLE) {
return fetch('bundle/' + bundle + '.js' + deployStamp_()).then(r => (r.ok ? r.text() : null)).catch(() => null).then(src => {
if (src === null) return batchFiles_(want);
const s = document.createElement('script');
s.text = src + '\n//# sourceURL=bundle/' + bundle + '.js';
document.head.appendChild(s);
return true;
});
}
return Promise.all(list.map(f => fetch('js/' + f + '.js' + deployStamp_()).then(r => (r.ok ? r.text() : null)).catch(() => null)))
.then(texts => {
const gone = list.filter((f, i) => texts[i] === null);
if (gone.length) { try { gone.forEach(f => window.__missing(f)); } catch (e) { } return false; }
texts.forEach((src, i) => {
const s = document.createElement('script');
s.text = src + '\n//# sourceURL=js/' + list[i] + '.js';
document.head.appendChild(s);
});
return true;
});
}
const DATA_FILE_MEMO = new Map(), DATA_FILE_WHY = {};
function dataFile_(path, o) {
o = o || {};
const as = o.as === 'text' ? 'text' : 'json';
if (o.memo && DATA_FILE_MEMO.has(as + path)) return DATA_FILE_MEMO.get(as + path);
const ask = new Promise((done, no) => {
const what = o.what || path;
const miss = why => { DATA_FILE_WHY[path] = why; if (o.fail) no(new Error(why)); else done(null); };
if (typeof fetch !== 'function') return miss('nothing to fetch with');
let over = false, ab = null;
try { if (typeof AbortController === 'function') ab = new AbortController(); } catch (e) { }
const ms = o.wait || 20000;
const t = setTimeout(() => { over = true; try { if (ab) ab.abort(); } catch (e) { } miss(what + ' did not arrive in ' + Math.round(ms / 1000) + ' seconds'); }, ms);
const url = path + (o.stamp === false || /^https?:/.test(path) ? '' : deployStamp_());
const opt = { cache: o.cache || 'default' };
if (ab) opt.signal = ab.signal;
Promise.resolve().then(() => fetch(url, opt))
.then(r => { if (!r || !r.ok) throw new Error(what + ' answered ' + (r ? r.status : 'nothing')); return as === 'text' ? r.text() : r.json(); })
.then(v => { clearTimeout(t); if (!over) { delete DATA_FILE_WHY[path]; done(v); } },
e => { clearTimeout(t); if (!over) miss((e && e.message) || String(e)); });
});
if (o.memo) { DATA_FILE_MEMO.set(as + path, ask); ask.then(v => { if (v === null) DATA_FILE_MEMO.delete(as + path); }, () => DATA_FILE_MEMO.delete(as + path)); }
return ask;
}
let MISSING_KEYS = {};
let LOADED = false;
let LOAD_FAILED = '';
let LIBRARY_FAILED = '';
let LOAD_SLOW = false;
function nameBesideHandle_(name, handle) {
const n = String(name || ''), h = String(handle || '').replace(/^@/, '');
if (!h) return n;
const tail = ' (@' + h + ')';
return n.slice(-tail.length).toLowerCase() === tail.toLowerCase() ? n.slice(0, -tail.length) : n;
}
const capFirst_ = s => (/^@/.test(String(s || '')) ? String(s) : String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1));
const nameKid_ = p => {
const rs = [].concat(p.roles || [], p.role || [], p.type || []).map(r => String(r).toLowerCase());
return p.kid === true || p.child === true || rs.some(r => r === 'kid' || r === 'child' || r === 'student');
};
function qualLevel_(v) {
const t = String(v == null ? '' : v).trim(), k = x => String(x).toLowerCase().replace(/[^a-z0-9+]/g, '');
if (!t) return '';
const Q = SHARED_SETTINGS.levels.quals, want = k(t);
const inList = Q.list.find(x => k(x) === want);
if (inList) return inList;
const say = Object.keys(Q.says).find(x => k(x) === want);
if (say) return Q.says[say];
const lib = SHARED_SETTINGS.levels.list.find(l => k(l.level) === want || (l.says || []).some(x => k(x) === want));
return lib && Q.list.indexOf(lib.level) >= 0 ? lib.level : t;
}
function qualRank_(v) {
const i = SHARED_SETTINGS.levels.quals.list.indexOf(qualLevel_(v));
return i < 0 ? 999 : i;
}
function fmtName_(person, style) {
const p = person && typeof person === 'object' ? person : { name: person };
const first = String(p.first_name || p.firstName || '').trim(), last = String(p.last_name || p.lastName || '').trim();
const full = nameBesideHandle_(String(p.name || p.title || (first + ' ' + last)).trim(), p.handle);
const w = full.split(/\s+/).filter(Boolean);
if (style === 'first') return capFirst_(first || (/[@(]/.test(full) ? full : w[0] || ''));
if (style === 'full' && !nameKid_(p)) return capFirst_(full);
if (first && last) return capFirst_(first) + ' ' + last.charAt(0).toUpperCase() + '.';
if (w.length < 2 || /[@(]/.test(full)) return capFirst_(full);
return capFirst_(w[0]) + ' ' + w[w.length - 1].charAt(0).toUpperCase() + '.';
}
try {
const p = USER && USER.profile, first = String((p && p.first_name) || '').trim();
const rs = USER ? (Array.isArray(USER.roles) && USER.roles.length ? USER.roles : [USER.role]).map(String) : [];
const kid = rs.indexOf('kid') !== -1
&& !rs.some(x => x === 'admin' || x === 'parent' || (x === 'tutor' && !USER.tutorPending));
if (USER && kid && first && String(USER.name || '').indexOf(first + ' ') === 0
&& String(USER.name).indexOf('(@') === -1) USER.name = first;
} catch (e) { }
const KEEP_MEM = new Map();
const KEEP_UNKEPT = new Set();
let KEEP_SAID = false;
const KEEP_RECORD = new Set();
function keepPut_(k, v, quiet) {
const put = () => { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); };
if (quiet === true) { try { put(); return true; } catch (e) { return false; } }
KEEP_MEM.set(k, v);
if (quiet === 'record') KEEP_RECORD.add(k);
const waits = v !== null && typeof keepWaits_ === 'function' && keepWaits_(k);
if (!waits) {
try { put(); KEEP_UNKEPT.delete(k); return true; } catch (e) { }
try { if (v !== null && ((typeof splashForget_ === 'function' && splashForget_()) || payloadForget_())) { put(); KEEP_UNKEPT.delete(k); return true; } } catch (e) { }
}
KEEP_UNKEPT.add(k);
if (quiet !== 'record' && !KEEP_SAID && v !== null && String(v).trim()) {
KEEP_SAID = true;
try { if (typeof toast === 'function') toast(text_('this-browser-is-not-saving-what')); } catch (e) { }
}
return false;
}
const keepHeld_ = k => (KEEP_UNKEPT.has(k) ? KEEP_MEM.get(k) : undefined);
const KEEP = {
familyUser: { scope: 'user', clearOnSignOut: true },
favs: { scope: 'user', clearOnSignOut: true },
surfaceFace: { scope: 'user', clearOnSignOut: true },
familyCardEdit: { scope: 'user', clearOnSignOut: true },
'payload:kept': { scope: 'user', clearOnSignOut: true },
'kept:': { scope: 'user', clearOnSignOut: true },
'asst:': { scope: 'user', clearOnSignOut: true },
familyHandles: { scope: 'user', clearOnSignOut: true },
familyAdminHint: { scope: 'user', clearOnSignOut: true },
'ans:': { scope: 'user' }, 'pad:': { scope: 'user' }, 'board:': { scope: 'user' }, 'part:': { scope: 'user' }, 'aiMark:': { scope: 'user' },
'ansAt:': { scope: 'user' }, 'ansDirty:': { scope: 'user' }, 'done:': { scope: 'user' },
'subLast:': { scope: 'user' }, 'subQ:': { scope: 'user' }, 'subBefore:': { scope: 'user' }, 'subMigrated:': { scope: 'user' },
'draft:': { scope: 'user', ttl: 30 * 24 * 60 * 60 * 1000 },
'familyTermShift:': { scope: 'user' },
familyGone: { scope: 'device', ttl: 60 * 60 * 1000 }, familyGoneKeys: { scope: 'device' }, familySwitched: { scope: 'device' },
familyDevice: { scope: 'device' }, familyField: { scope: 'device' }, came_from: { scope: 'device' },
familyTab: { scope: 'device' }, familyTabAt: { scope: 'device' }, 'arrival:shape': { scope: 'device' }, familyAheadSlow: { scope: 'device' },
familyCart: { scope: 'device' }, familyHelpHand: { scope: 'device' }, familyLayout: { scope: 'device' }, familyRules: { scope: 'device' },
familyWords: { scope: 'device' }, pixelArt: { scope: 'device' }, speedWpm: { scope: 'device' }, speedDraft: { scope: 'device' },
'chess-turns': { scope: 'device' }, 'bg-game': { scope: 'device' }, 'wg-game': { scope: 'device' }, 'cs-game': { scope: 'device' },
'ss-band': { scope: 'device' }, 'ws-theme': { scope: 'device' }, 'imp-n': { scope: 'device' }, 'imp-aloud': { scope: 'device' }, 'race-best': { scope: 'device' },
'nes-keys': { scope: 'device' }, 'mark-sound': { scope: 'device' }, 'voice:name': { scope: 'device' },
splashAnims: { scope: 'device' }, splashOff: { scope: 'device' }, 'splashAnim:': { scope: 'device' },
familyVerify: { scope: 'session' }, familyPaid: { scope: 'session' },
};
const KEEP_ODD = new Set();
function keepSpec_(k) {
k = String(k);
if (Object.prototype.hasOwnProperty.call(KEEP, k)) return KEEP[k];
const pre = Object.keys(KEEP).find(p => p.slice(-1) === ':' && k.indexOf(p) === 0);
return pre ? KEEP[pre] : null;
}
const keepStore_ = k => ((keepSpec_(k) || {}).scope === 'session' ? sessionStorage : localStorage);
const keep_ = {
get(k) {
const held = keepHeld_(k);
if (held !== undefined) return held;
try { return keepStore_(k).getItem(k); } catch (e) { return undefined; }
},
json(k, none) { try { const v = JSON.parse(keep_.get(k) || 'null'); return v == null ? none : v; } catch (e) { return none; } },
put(k, v, how) {
if (!keepSpec_(k)) { if (v !== null && draftNever_(k)) return false; if (!KEEP_ODD.has(k)) { KEEP_ODD.add(k); console.warn('keep_: unregistered key ' + k); } }
if (keepStore_(k) !== localStorage) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); return true; } catch (e) { return false; } }
return keepPut_(k, v === null ? null : String(v), how === 'loud' ? undefined : how || true);
},
del(k, how) { return keep_.put(k, null, how); },
keys(pre) {
const out = [];
try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf(pre || '') === 0) out.push(k); } } catch (e) { return out; }
return out;
},
signOut() {
Object.keys(KEEP).filter(n => KEEP[n].clearOnSignOut).forEach(n => {
(n.slice(-1) === ':' ? keep_.keys(n) : [n]).forEach(k => keep_.del(k));
});
},
};
function saveUser_() {
try { return keep_.put('familyUser', JSON.stringify(USER, (n, v) => (n && draftNever_(n) ? undefined : v))); } catch (e) { return false; }
}
function keepRetry_() {
[...KEEP_UNKEPT].sort((a, b) => KEEP_RECORD.has(b) - KEEP_RECORD.has(a)).forEach(k => {
const v = KEEP_MEM.get(k);
if (v !== null && v !== undefined && typeof keepWaits_ === 'function' && keepWaits_(k)) return;
try { if (v === null || v === undefined) localStorage.removeItem(k); else localStorage.setItem(k, v); KEEP_UNKEPT.delete(k); } catch (e) { }
});
}
function keepAtRisk_() {
keepRetry_();
return [...KEEP_UNKEPT].filter(k => {
if (KEEP_RECORD.has(k)) return false;
const v = KEEP_MEM.get(k);
if (v === null || v === undefined || !String(v).trim() || v === '[]') return false;
try { if (typeof ansOnAccount_ === 'function' && ansOnAccount_(k)) return false; } catch (e) { }
return true;
});
}
const keepLeaving_ = () => { keepRetry_(); };
window.addEventListener('pagehide', keepLeaving_);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') keepLeaving_(); });
window.addEventListener('beforeunload', e => {
if (!keepAtRisk_().length) return;
e.preventDefault();
e.returnValue = '';
});
const DRAFT_DEVICE_MS = 6 * 60 * 60 * 1000;
const ANS_GONE_KEYS = 'familyGoneKeys';
const DRAFT_KEEP_MS = KEEP['draft:'].ttl;
const DRAFT_SENT_MS = 10 * 60 * 1000;
const DRAFT_MAX = 200;
const DRAFT_NEVER = /(^|[^a-z])(pin(code|no|num|number)?|password|passcode|passwd|cvc|cvv|csc|card_?(no|num|number)|sort_?code|security_?code|account_?(no|num|number)|iban)(\d|[^a-z]|$)/i;
function draftNever_(name) { return DRAFT_NEVER.test(String(name).replace(/([a-z\d])([A-Z])/g, '$1_$2')); }
function draftWho_() {
try { if (USER && (USER.personId || USER.name)) return 'u:' + (USER.personId || USER.name); } catch (e) { }
return 'device';
}
const draftKey_ = (surface, id, who) => 'draft:' + (who || draftWho_()) + ':' + surface + ':' + (id == null ? '' : id);
const draftSame_ = (a, b) => String(a == null ? '' : a).replace(/\r\n?/g, '\n') === String(b == null ? '' : b).replace(/\r\n?/g, '\n');
const DRAFT_SENDING = new Map();
function draftParse_(raw) {
try {
const d = JSON.parse(raw);
return d && typeof d === 'object' && typeof d.v === 'string' ? d : null;
} catch (e) { return null; }
}
function draftRaw_(k) {
let raw = keep_.get(k);
if (raw === undefined) raw = KEEP_MEM.has(k) ? KEEP_MEM.get(k) : null;
return raw === null || raw === undefined ? null : draftParse_(raw);
}
function draftHeld_(k) {
try {
let raw;
try { raw = ansRec_(ANS_GONE_KEYS); } catch (e) { raw = keep_.get(ANS_GONE_KEYS); }
const map = JSON.parse(raw || '{}');
return !!(map && map[k]);
} catch (e) { return false; }
}
function draftOld_(k, d, now) {
if (d.sent && !DRAFT_SENDING.has(k) && !(now - (Number(d.sent) || 0) < DRAFT_SENT_MS)) return true;
const device = /^draft:device:/.test(k) && !draftHeld_(k);
return !(now - (Number(d.at) || 0) < (device ? DRAFT_DEVICE_MS : DRAFT_KEEP_MS));
}
function draftRead_(surface, id, was, who) {
const k = draftKey_(surface, id, who);
const d = draftRaw_(k);
if (!d) return null;
if (draftOld_(k, d, Date.now())) { draftDrop_(surface, id, who); return null; }
if (d.sent && !DRAFT_SENDING.has(k)) return null;
if (was !== undefined && typeof d.from === 'string' && !draftSame_(d.from, was)) return null;
return d.v;
}
function draftMark_(k, v, quiet) {
if (quiet === true || !/^draft:device:/.test(k) || typeof ansGoneMark_ !== 'function') return;
const was = v === null ? null : draftRaw_(k);
ansGoneMark_(k, v, false, was ? was.v : null);
}
function draftKeep_(surface, id, v, quiet, from) {
if (draftNever_(String(surface) + ':' + String(id == null ? '' : id))) return false;
if (v === null || v === undefined) return draftDrop_(surface, id);
const d = { v: String(v), at: Date.now() };
if (from !== undefined && from !== null) d.from = String(from);
const k = draftKey_(surface, id);
draftMark_(k, d.v, quiet);
return keepPut_(k, JSON.stringify(d), quiet);
}
function draftDrop_(surface, id, who) {
const k = draftKey_(surface, id, who);
DRAFT_SENDING.delete(k);
draftMark_(k, null);
let had = KEEP_MEM.has(k);
if (!had) had = typeof keep_.get(k) === 'string';
return had ? keepPut_(k, null) : true;
}
const draftIs_ = (d, v) => v === undefined || String(d.v).trim() === String(v).trim();
function draftSent_(surface, id, v) {
const k = draftKey_(surface, id), d = draftRaw_(k);
if (!d || !draftIs_(d, v)) return;
d.sent = Date.now();
DRAFT_SENDING.set(k, d.v);
keepPut_(k, JSON.stringify(d));
}
let DRAFT_LEAVING = false;
window.addEventListener('pagehide', () => { DRAFT_LEAVING = true; });
window.addEventListener('pageshow', () => { DRAFT_LEAVING = false; });
function draftSentBack_(surface, id, v) {
if (DRAFT_LEAVING) return;
const k = draftKey_(surface, id), d = draftRaw_(k);
if (v === undefined || draftIs_({ v: DRAFT_SENDING.get(k) || '' }, v)) DRAFT_SENDING.delete(k);
if (!d || !d.sent || !draftIs_(d, v)) return;
delete d.sent;
keepPut_(k, JSON.stringify(d));
}
function draftAttr_(surface, id, was) {
const w = was === null || was === undefined ? '' : String(was);
let held = false;
try { const d = draftRead_(surface, id, w); held = d !== null && !draftSame_(d, w); } catch (e) { }
return ' data-draft="' + esc(surface + ':' + (id == null ? '' : id)) + '"' + (w ? ' data-draft-was="' + esc(w) + '"' : '')
+ (held ? ' data-draft-held' : '');
}
function draftVal_(surface, id, was) {
const w = was === null || was === undefined ? '' : String(was);
const d = draftRead_(surface, id, w);
if (d === null) return w;
if (draftSame_(d, w)) { draftDrop_(surface, id); return w; }
return d;
}
function draftFrom_(el) {
if (!el || !el.getAttribute) return;
const spec = el.getAttribute('data-draft');
if (!spec || /^(password|file|hidden)$/i.test(el.type || '')) return;
const at = spec.indexOf(':');
const surface = at < 0 ? spec : spec.slice(0, at), id = at < 0 ? '' : spec.slice(at + 1);
const box = String(el.type || '').toLowerCase() === 'checkbox';
const v = box ? (el.checked ? '1' : '0') : String(el.value == null ? '' : el.value);
const was = el.hasAttribute('data-draft-was') ? el.getAttribute('data-draft-was') : (box ? '0' : '');
if (draftSame_(v, was)) draftDrop_(surface, id); else draftKeep_(surface, id, v, false, was);
}
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
try { draftFrom_(e.target && e.target.closest && e.target.closest('[data-draft]')); } catch (err) { }
}));
function draftSweep_() {
try {
const now = Date.now(), all = keep_.keys('draft:'), live = [];
all.forEach(k => {
const d = draftParse_(keep_.get(k));
if (!d || draftOld_(k, d, now)) keep_.del(k); else live.push([k, Number(d.at) || 0]);
});
live.sort((a, b) => b[1] - a[1]).slice(DRAFT_MAX).forEach(x => keep_.del(x[0]));
} catch (e) { }
}
draftSweep_();
window.addEventListener('storage', e => {
const k = e && e.key;
if (!k || k.indexOf('draft:') !== 0) return;
try {
KEEP_UNKEPT.delete(k);
KEEP_MEM.delete(k);
const pre = 'draft:' + draftWho_() + ':';
if (k.indexOf(pre) !== 0) return;
const spec = k.slice(pre.length);
const old = draftParse_(e.oldValue), now = draftParse_(e.newValue);
const v = now && !now.sent ? now.v : null;
document.querySelectorAll('[data-draft]').forEach(el => {
if (el.getAttribute('data-draft') !== spec || /^(password|file|hidden)$/i.test(el.type || '')) return;
const box = String(el.type || '').toLowerCase() === 'checkbox';
const saved = el.hasAttribute('data-draft-was') ? el.getAttribute('data-draft-was') : (box ? '0' : '');
if (now && typeof now.from === 'string' && !draftSame_(now.from, saved)) return;
const cur = box ? (el.checked ? '1' : '0') : String(el.value == null ? '' : el.value);
const want = v !== null ? v : (old && draftSame_(cur, old.v) ? saved : null);
if (want === null || draftSame_(cur, want)) return;
if (box) el.checked = want === '1'; else el.value = want;
});
if (spec === 'book:form' && typeof bookElsewhere_ === 'function') bookElsewhere_(v, old ? old.v : null);
} catch (err) { }
});
const myRole_ = () => roleFor_();
const can_ = (role, kind, action) => {
try {
const row = ((((typeof DATA !== 'undefined' && DATA && DATA.permissions) || {})[kind] || {})[action]);
if (row && typeof row[role] === 'boolean') return row[role];
} catch (e) { }
return role === 'admin';
};
const roleThree_ = w => ROLE_THREE_[roleOf(String(w || '').trim())] || '';
function seeRoles_() {
if (!USER) return [];
let words = [];
try { words = [rank_()].concat(heldRoles().filter(h => roleThree_(h) !== 'tutor' || !USER.tutorPending)); } catch (e) { words = []; }
if (roleThree_(rank_()) === 'child') return ['child'];
return SEE_ROLES.filter(r => r !== 'child' && words.some(w => roleThree_(w) === r));
}
const seeMay_ = key => seeRoles_().some(r => can_(r, 'see', key));
const uiMay_ = key => { try { if (!((DATA && DATA.permissions) || {}).ui) return rankAtLeast_('client'); } catch (e) { return false; } return can_(myRole_(), 'ui', key); };
;
/* js/data-text.js */
const LAW_CLASS = {
green: 'w-green', blue: 'w-blue', 'blue-soft': 'w-blue-soft',
purple: 'w-purple',
pink: 'w-pink',
red: 'w-red', amber: 'w-amber', dim: 'w-dim', ink: '',
};
const LAW_LISTS = {
subjects: () => [],
tutors: d => (d.tutors || []).map(t => t.title),
venues: d => (d.venues || []).map(v => v.title),
clients: d => [...new Set((d.liveJobs || d.jobs || []).flatMap(j => (j.slots || []).map(s => s && s.client)).filter(Boolean))],
wearables: d => (d.shop || []).filter(isWearable).map(x => x.name),
};
LAW_LISTS.wearable = LAW_LISTS.wearables;
function lawList(name) {
const f = Object.prototype.hasOwnProperty.call(LAW_LISTS, norm(name)) ? LAW_LISTS[norm(name)] : null;
return f ? f(DATA || {}) : [];
}
const rxSafe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const LAW_KINDS = {
prefix: (out, law, wrap) => out.replace(new RegExp('(^|[\\s(])(' + rxSafe(law.match) + '[\\w-]+)', 'g'), (all, before, hit) => before + wrap(hit)),
list: (out, law, wrap) => lawList(law.match).filter(Boolean).map(String).sort((a, b) => b.length - a.length)
.reduce((o, word) => o.replace(new RegExp('\\b' + rxSafe(esc(word)) + '\\b', 'gi'), wrap), out),
word: (out, law, wrap) => out.replace(new RegExp('\\b' + rxSafe(esc(law.match)) + '\\b', 'gi'), wrap),
regex: (out, law, wrap) => { try { return out.replace(new RegExp(law.match, 'g'), wrap); } catch (e) { return out; } },
};
function mark(text) {
let out = esc(text ?? '');
const laws = (DATA.laws || []);
if (!laws.length || !out) return out;
const parked = [];
const park = html => '\u0000' + (parked.push(html) - 1) + '\u0000';
laws.forEach(law => {
const cls = LAW_CLASS[norm(law.colour)];
if (cls === undefined) return;
const wrap = m => park(cardBlock_({ type: 'group', tag: 'span', look: cls, inner: m }));
const how = Object.prototype.hasOwnProperty.call(LAW_KINDS, law.kind) ? LAW_KINDS[law.kind] : null;
if (how) out = how(out, law, wrap);
});
return out.replace(/\u0000(\d+)\u0000/g, (all, i) => parked[i]);
}
const MONTH_NAMES = ['January','February','March','April','May','June',
'July','August','September','October','November','December'];
function parseWhen(v) { return dateOf_(v, true); }
function ago(value) {
const d = parseWhen(value);
if (!d) return String(value ?? '');
const secs = (Date.now() - d.getTime()) / 1000;
if (secs < 0) return fmtDate_(d);
if (secs < 45) return 'just now';
const mins = Math.floor(secs / 60);
if (mins < 60) return mins <= 1 ? 'a minute ago' : mins + ' minutes ago';
const hours = Math.floor(mins / 60);
if (hours < 24) return hours === 1 ? 'an hour ago' : hours + ' hours ago';
const days = Math.floor(hours / 24);
if (days === 1) return 'yesterday';
if (days < 7) return days + ' days ago';
if (days < 14) return 'a week ago';
if (days < 28) return Math.floor(days / 7) + ' weeks ago';
if (days < 60) return 'a month ago';
return fmtDate_(d);
}
const PAYLOAD_KEY = 'payload:kept';
let PAYLOAD_TEXT = null, PAYLOAD_KEPT_TRIED = false, PAYLOAD_OWED = null;
function payloadOwed_() { const o = PAYLOAD_OWED; PAYLOAD_OWED = null; if (o && o.f.who === payloadFor_().who) payloadKeep_(o.t, o.f); }
function payloadOwe_(d) { if (PAYLOAD_TEXT && d && !d.error) { PAYLOAD_OWED = { t: PAYLOAD_TEXT, f: payloadFor_() }; setTimeout(payloadOwed_, 1000); } PAYLOAD_TEXT = null; }
function payloadFind_() {
try { if (typeof FINDER !== 'undefined' && STALE[FINDER.id]) { paint(FINDER.id); PRE_PAYLOAD.delete(FINDER.id); } } catch (e) { oops_(e, 'shell:keptFind'); }
}
addEventListener('pagehide', payloadOwed_);
const PAYLOAD_SECRET = /^(token|tokens|pin|pins|pin_?hash|pinhash|password|secret|session_?key|api_?key)$/i;
const payloadFor_ = () => { try { return { who: USER && USER.personId ? String(USER.personId) : '', build: String(window.BUILD_STAMP || '') }; } catch (e) { return { who: '', build: '' }; } };
function payloadKeep_(text, f) {
try {
const d = JSON.parse(text);
if (!d || d.error) return;
f = f || payloadFor_();
keep_.put(PAYLOAD_KEY, JSON.stringify({ who: f.who, build: f.build, at: Date.now(), d }, (k, v) => (PAYLOAD_SECRET.test(k) ? undefined : v)));
} catch (e) { payloadForget_(); }
}
function payloadKept_() {
try {
const k = JSON.parse(keep_.get(PAYLOAD_KEY) || 'null'), f = payloadFor_();
if (!k || !k.d || typeof k.d !== 'object' || k.who !== f.who || k.build !== f.build) return null;
return k.d;
} catch (e) { payloadForget_(); return null; }
}
function payloadForget_() {
PAYLOAD_OWED = null; PAYLOAD_TEXT = null;
const kept = keptForget_();
const had = typeof keep_.get(PAYLOAD_KEY) === 'string';
keep_.del(PAYLOAD_KEY);
return had || kept;
}
const KEPT_PREFIX = 'kept:', KEPT_MAX = 200000;
const keptKey_ = body => { const b = Object.assign({}, body); delete b.token; return KEPT_PREFIX + payloadFor_().who + ':' + JSON.stringify(b); };
function keptGet_(k, anyBuild) {
try { const o = JSON.parse(keep_.get(k) || 'null'); return o && (anyBuild || o.build === payloadFor_().build) && o.d && typeof o.d === 'object' ? o.d : null; } catch (e) { return null; }
}
function keptPut_(k, text) {
if (!text || text.length > KEPT_MAX) return;
try { keepPut_(k, JSON.stringify({ build: payloadFor_().build, at: Date.now(), d: JSON.parse(text, (n, v) => (PAYLOAD_SECRET.test(n) ? undefined : v)) }), true); } catch (e) { }
}
function keptForget_() {
const ks = [];
ks.push(...keep_.keys(KEPT_PREFIX)); ks.forEach(k => keep_.del(k));
return ks.length > 0;
}
let TAP_AT = 0;
['pointerdown', 'click'].forEach(t => addEventListener(t, () => { TAP_AT = Date.now(); }, true));
function libraryQuiet_() {
const t0 = Date.now();
return new Promise(ok => {
const k = () => {
let built = false;
try { built = typeof FINDER !== 'undefined' && AT === FINDER.id && !!finderTagsAt_(); } catch (e) { built = false; }
if (!built || Date.now() - TAP_AT > 1500 || Date.now() - t0 > 10000) ok(); else setTimeout(k, 300);
};
k();
});
}
function finderSoon_(F, fn) {
if (typeof inFinder_ === 'function') return inFinder_(F, fn);
laterFiles_().then(() => { try { if (typeof inFinder_ === 'function') inFinder_(F, fn); } catch (e) { } });
return undefined;
}
;
/* js/library.js */
let LIBRARY_ROWS = null;
const libS = v => (v === undefined || v === null ? '' : String(v));
const libN = v => { const n = Number(String(v).replace(/[^0-9.-]/g, '')); return isFinite(n) ? n : 0; };
const libNum = v => {
if (v === undefined || v === null || String(v).trim() === '') return null;
const n = Number(String(v).replace(/[^0-9.-]/g, ''));
return isFinite(n) ? n : null;
};
const libOn = v => {
const s = String(v === undefined || v === null ? '' : v).toLowerCase().trim();
return s === '' || s === 'true' || s === 'yes' || s === '1' || s === 'y' || s === 'on';
};
const libTrue = v => {
const s = String(v === undefined || v === null ? '' : v).toLowerCase().trim();
return s === 'true' || s === 'yes' || s === '1' || s === 'y' || s === 'on';
};
function kitParse_(cell) {
return libS(cell).split('|').map(s => s.trim()).filter(Boolean).map(item => {
const at = item.lastIndexOf('\u00d7');
if (at <= 0) return { name: item, qty: '' };
const name = item.slice(0, at).trim();
const qty = item.slice(at + 1).trim();
return name ? { name: name, qty: qty } : { name: item, qty: '' };
});
}
const LIB_ANSWER = 20000, LIB_BODY = 90000;
async function libFile_(early, path, what) {
if (!early) return dataFile_(path, { wait: LIB_ANSWER + LIB_BODY, fail: true, what });
const res = await libWithin_(early, what, LIB_ANSWER);
if (!res) throw new Error(what + ' did not come back');
if (!res.ok) throw new Error(what + ' answered ' + res.status);
return libWithin_(res.json(), what, LIB_BODY);
}
function choiceKeys_(raw) {
return String(raw == null ? '' : raw).split('|').map(w => w.split(',').map(t => (t = t.trim(), /^[A-Z]$/.test(t) ? t.charCodeAt(0) - 64 : /^\d+$/.test(t) ? +t : 0))
.filter(n => n > 0)).filter(w => w.length);
}
function libWithin_(p, what, ms) {
let t;
const late = new Promise((u, no) => { t = setTimeout(() => no(new Error(what + ' did not arrive in ' + Math.round(ms / 1000) + ' seconds')), ms); });
return Promise.race([Promise.resolve(p), late]).finally(() => clearTimeout(t));
}
let LIBRARY_ASK = null, LIBRARY_EXTRA_ASK = null;
function libraryRows_() {
if (LIBRARY_ROWS) return Promise.resolve(LIBRARY_ROWS);
if (!LIBRARY_ASK) LIBRARY_ASK = libraryRowsAsk_().finally(() => { LIBRARY_ASK = null; });
return LIBRARY_ASK;
}
function libPaperEach_(rows, join, each) {
if (!join || !Array.isArray(join.fields) || !Array.isArray(rows)) return rows;
const card = new Map();
rows.forEach(r => { if (r && r.kind === join.from) card.set(r[join.by], r); });
rows.forEach(r => {
const c = r && r.kind !== join.from && card.get(r[join.by]);
if (c) join.fields.forEach(f => each(r, c, f));
});
return rows;
}
function libJoinPaper_(rows, join) {
return libPaperEach_(rows, join, (r, c, f) => { if (r[f] === null) delete r[f]; else if (r[f] === undefined && c[f] !== undefined) r[f] = c[f]; });
}
function libStripPaper_(rows, join) {
return libPaperEach_(rows, join, (r, c, f) => {
if (r[f] === undefined) { if (c[f] !== undefined) r[f] = null; } else if (r[f] === c[f]) delete r[f];
});
}
const LIB_JOIN = () => (((((typeof ITEM_KINDS !== 'undefined' && ITEM_KINDS.kinds.question) || {}).sheet || {}).lib || {}).joined || null);
function libIntern_(rows) {
const pool = new Map();
rows.forEach(r => {
if (!r || typeof r !== 'object') return;
for (const k in r) {
const v = r[k];
if (typeof v !== 'string' || v.length > 32) continue;
const had = pool.get(v);
if (had === undefined) pool.set(v, v); else r[k] = had;
}
});
return rows;
}
async function libStatus_() {
try { const f = await dataFile_('data/question-status.json', { wait: LIB_ANSWER, what: 'the question status file' }); return (f && f.status) || {}; } catch (e) { return {}; }
}
const qStatus_ = x => libS((x && x.row && x.row.q_status) || (x && x.q_status));
const qOffered_ = x => qStatus_(x) !== 'broken' || (typeof myRole_ === 'function' && myRole_() === 'admin');
async function libraryRowsAsk_() {
let rows = null;
const status = libStatus_();
try {
const early = window.BOOT_LIB || null;
window.BOOT_LIB = null;
rows = await libFile_(early, 'data/questions.json', 'the question file');
} catch (e) {
LIBRARY_FAILED = why_(e);
}
if (Array.isArray(rows)) { const st = await status; rows.forEach(r => { const v = r && st[r.row_id]; if (v) r.q_status = v; }); }
LIBRARY_ROWS = Array.isArray(rows) ? libIntern_(libJoinPaper_(rows, LIB_JOIN())) : [];
if (Array.isArray(rows)) LIBRARY_FAILED = '';
return LIBRARY_ROWS;
}
const LIB_EXTRA = ['boxers', 'fights', 'cheatsheet', 'practicals', 'projects', 'textbooks', 'inserts',
'manuscripts', 'figures', 'writings', 'timeline', 'portraits', 'timelines', 'specs'];
let LIBRARY_EXTRA = null;
const HIST_DB = [
{ file: 'manuscripts', prefix: 'MS-', kind: 'manuscript', years: ['date_from', 'date_to'], icon: 'doc', sub: ['repository', 'date_text'], links: ['writings'] },
{ file: 'figures', prefix: 'FIG-', kind: 'figure', years: ['born_year', 'died_year'], icon: 'flag', sub: [], links: ['writings', 'events'] },
{ file: 'writings', prefix: 'WR-', kind: 'writing', years: ['date_from', 'date_to'], icon: 'book', sub: ['title_original', 'date_text'], links: ['manuscripts', 'author_id'] },
{ file: 'timeline', prefix: 'EV-', kind: 'event', years: ['date_from', 'date_to'], icon: 'flag', sub: ['date_text', 'theatre'], links: ['writings', 'figures'] },
];
function libraryExtraRows_() {
if (LIBRARY_EXTRA) return Promise.resolve(LIBRARY_EXTRA);
if (!LIBRARY_EXTRA_ASK) LIBRARY_EXTRA_ASK = libraryExtraAsk_(LIB_EXTRA).then(out => (LIBRARY_EXTRA = out)).finally(() => { LIBRARY_EXTRA_ASK = null; });
return LIBRARY_EXTRA_ASK;
}
let SETTINGS_ROWS = null, SETTINGS_ASK = null;
function settingsRows_() {
if (SETTINGS_ROWS) return Promise.resolve(SETTINGS_ROWS);
if (!SETTINGS_ASK) SETTINGS_ASK = libraryExtraAsk_(typeof SETTINGS_TABS === 'undefined' ? [] : SETTINGS_TABS)
.then(out => (SETTINGS_ROWS = out)).finally(() => { SETTINGS_ASK = null; });
return SETTINGS_ASK;
}
function libraryHere_() { return !!(LIBRARY_ROWS && LIBRARY_EXTRA); }
let LIBRARY_LATE = false;
async function libraryExtraAsk_(names) {
const out = {};
await Promise.all(names.map(async name => {
let rows = null;
try {
const early = (window.BOOT_LIB_EXTRA || {})[name] || null;
if (window.BOOT_LIB_EXTRA) window.BOOT_LIB_EXTRA[name] = null;
rows = await libFile_(early, 'data/' + name + '.json', name);
} catch (e) { rows = null; }
out[name] = Array.isArray(rows) ? rows : [];
}));
return out;
}
function libPractical_(r) {
const id = libS(r.practical_id).trim();
return {
id: id, name: libS(r.name), subject: libS(r.subject), level: libS(r.level),
board: libS(r.exam_board), specRef: libS(r.spec_ref),
compliance: libS(r.compliance),
required: libS(r.compliance) === 'AQA required practical',
practicalType: libS(r.practical_type),
topics: libS(r.topics), aim: libS(r.aim), outcome: libS(r.outcome),
venue: libS(r.venue), feasible: libS(r.feasible),
groupSize: libN(r.group_size), minutes: libN(r.minutes),
safety: libS(r.safety), mathsLink: libS(r.maths_link),
equipment: kitParse_(libS(r.equipment)),
steps: libS(r.steps).split('|').map(s => s.trim()).filter(Boolean),
itemIds: libS(r.item_ids),
notes: libS(r.notes),
order: libS(r.sort_order) === '' ? null : libN(r.sort_order),
ageMin: libNum(r.age_min), hazard: libS(r.hazard), wow: libS(r.wow),
science: libS(r.science),
log: libS(r.log).split('|').map(t => t.trim()).filter(Boolean),
variables: libS(r.variables).split('|').map(t => t.trim()).filter(Boolean),
diagram: libS(r.diagram),
risks: libS(r.risks).split('|').map(t => t.trim()).filter(Boolean),
costPerRun: libNum(r.cost_per_run_gbp), setupCost: libNum(r.setup_cost_gbp),
excluded: libS(r.excluded_reason),
reconsiderAt: libNum(r.reconsider_at_age),
libHas: libS(r.lib_has).trim(),
};
}
function libProject_(r) {
const id = libS(r.project_id).trim();
return {
id: id, name: libS(r.name), summary: libS(r.summary),
subject: libS(r.subject), level: libS(r.level),
ageMin: libNum(r.age_min), ageMax: libNum(r.age_max), sessions: libNum(r.sessions),
makes: libS(r.makes), topics: libS(r.topics),
materials: kitParse_(libS(r.materials)),
steps: libS(r.steps).split('|').map(s => s.trim()).filter(Boolean),
safety: libS(r.safety), share: libS(r.share),
order: libS(r.sort_order) === '' ? null : libN(r.sort_order),
projectType: libS(r.project_type).trim().toLowerCase() || 'project',
board: libS(r.exam_board).trim(), specRef: libS(r.spec_ref).trim(),
libHas: libS(r.lib_has).trim(),
};
}
function libTbItem_(s) {
const t = libS(s).trim(), higher = /^\[H\]\s*/.test(t), body = t.replace(/^\[H\]\s*/, '');
const at = body.indexOf(' — ');
return at < 0 ? { name: '', text: body, higher: higher }
: { name: body.slice(0, at).trim(), text: body.slice(at + 3).trim(), higher: higher };
}
function libChapterBody_(r) {
const list = v => libS(v).split('|').map(s => s.trim()).filter(Boolean).map(libTbItem_);
return { idea: libS(r.idea).trim(), words: list(r.words), formulas: list(r.formulas),
points: list(r.points).map(p => ({ text: (p.name ? p.name + ' — ' : '') + p.text, higher: p.higher })),
diagram: libS(r.diagram), libHas: libS(r.lib_has).trim() };
}
function libraryExtras_(d, extra) {
if (!d || !extra) return d;
libExtrasSheets_(d, extra);
libExtrasBooks_(d, extra);
libExtrasData_(d, extra);
libExtrasBoxing_(d, extra);
return d;
}
function libExtrasSheets_(d, extra) {
if (extra.cheatsheet && extra.cheatsheet.length) {
const out = [];
extra.cheatsheet.forEach(r => {
const id = libS(r.part_id).trim();
if (!id || !libOn(r.active)) return;
out.push({
id: id, name: libS(r.name), levels: libS(r.levels), tier: libS(r.tier),
subject: libS(r.subject),
heightMm: libS(r.height_mm) === '' ? null : libN(r.height_mm),
half: libS(r.half_width) === '' ? null : libOn(r.half_width),
startOn: libOn(r.start_on),
inExam: libS(r.in_exam) === '' ? null : libOn(r.in_exam),
order: libS(r.sort_order) === '' ? null : libN(r.sort_order),
});
});
d.cheatsheet = out;
}
if (extra.practicals && extra.practicals.length) {
const out = [];
extra.practicals.forEach(r => {
const id = libS(r.practical_id).trim();
if (!id || !libOn(r.active)) return;
out.push(libPractical_(r));
});
d.practicals = out;
}
if (extra.projects && extra.projects.length) {
const out = [];
extra.projects.forEach(r => {
const id = libS(r.project_id).trim();
if (!id || !libOn(r.active)) return;
out.push(libProject_(r));
});
d.projects = out;
}
}
function libExtrasBooks_(d, extra) {
if (extra.textbooks && extra.textbooks.length) {
const books = {}, order = [], sa = {};
extra.textbooks.forEach(r => {
const id = libS(r.book_id).trim();
if (!id || !libOn(r.active)) return;
if (libS(r.anim).trim()) { if (/^\s*<svg class="sa[ "]/.test(libS(r.html))) (sa[id + '#' + libN(r.chapter)] = sa[id + '#' + libN(r.chapter)] || []).push({ id: libS(r.anim).trim(), title: libS(r.title), about: libS(r.about), svg: libS(r.html) }); return; }
if (!books[id]) { books[id] = { id: id, chapters: [] }; order.push(id); }
const b = books[id], n = libN(r.chapter);
const own = { subject: libS(r.subject).trim(), level: libS(r.level).trim(),
keystage: libS(r.keystage).trim(), board: libS(r.board).trim(), spec: libS(r.spec).trim() };
if (n === 0) {
Object.assign(b, own, { name: libS(r.title), summary: libS(r.summary) });
return;
}
b.chapters.push(Object.assign({ n: n, title: libS(r.title), higher: /^higher$/i.test(libS(r.tier).trim()), tier: libS(r.tier).trim(), own: own,
topics: libS(r.topics), specRef: libS(r.spec_ref).trim(), pending: /^true$/i.test(libS(r.lib_pending).trim()),
years: libS(r.year_group).split(',').map(t => t.trim()).filter(t => /^\d{1,2}$/.test(t)) },
libChapterBody_(r)));
});
d.textbooks = order.map(id => books[id]).filter(b => b.name)
.map(b => Object.assign(b, { chapters: b.chapters.sort((p, q) => p.n - q.n).map(c => {
['subject', 'level', 'keystage', 'board', 'spec'].forEach(k => { c[k] = c.own[k] || b[k] || ''; });
c.bookId = b.id;
c.anims = sa[b.id + '#' + c.n] || [];
delete c.own;
return c;
}) }));
}
}
function libExtrasData_(d, extra) {
if (extra.inserts && extra.inserts.length) {
const list = v => libS(v).split(',').map(t => t.trim()).filter(Boolean);
d.inserts = extra.inserts.filter(r => r && libS(r.insert_id).trim() && libOn(r.active)).map(r => ({
kind: 'attachment', of: libS(r.of).trim(),
id: libS(r.insert_id).trim(), name: libS(r.name), summary: libS(r.summary),
subject: libS(r.subject).trim(), levels: list(r.level), keystage: libS(r.keystage).trim(),
boards: list(r.board), tiers: list(r.tier),
forSubjects: list(r.for_subjects), forLevels: list(r.for_levels), forTiers: list(r.for_tiers),
verified: libOn(r.verified), verifiedNote: libS(r.verified_note),
official: Array.isArray(r.official) ? r.official.filter(o => o && o.url) : [],
sections: Array.isArray(r.sections) ? r.sections : [],
table: libS(r.table).trim(), elements: Array.isArray(r.elements) ? r.elements : [],
forPapers: list(r.for_papers), sources: list(r.sources), lineNumbers: libOn(r.line_numbers),
sourceText: libS(r.source_text), libHas: libS(r.lib_has).trim(), pending: libOn(r.lib_pending),
}));
}
if (extra.specs && extra.specs.length) d.specs = extra.specs.filter(r => r && r.id && r.url && Array.isArray(r.sections));
if (extra.portraits && extra.portraits.length) d.portraits = extra.portraits.filter(r => r && r.id && Array.isArray(r.px)); if (extra.timelines && extra.timelines.length) d.timelines = extra.timelines.filter(r => r && r.id && Array.isArray(r.events));
HIST_DB.forEach(t => {
if (!extra[t.file] || !extra[t.file].length) return;
d[t.file] = extra[t.file].filter(r => r && libS(r.id).trim()).map(r => {
const o = {};
Object.keys(r).forEach(k => { o[k] = t.years.indexOf(k) >= 0 ? libNum(r[k]) : Array.isArray(r[k]) ? r[k].map(libS) : libS(r[k]).trim(); });
return o;
});
});
}
function libExtrasBoxing_(d, extra) {
const libLook = v => libS(v).trim().toLowerCase();
if (extra.boxers && extra.boxers.length) {
const out = [];
extra.boxers.forEach(r => {
if (!libS(r.name) || !libOn(r.active)) return;
out.push({
id: libS(r.boxer_id), name: libS(r.name), nickname: libS(r.nickname),
sex: libS(r.sex), country: libS(r.country), bornIn: libS(r.born_in),
stance: libS(r.stance), dob: libS(r.dob), dod: libS(r.dod),
heightCm: libNum(r.height_cm), reachCm: libNum(r.reach_cm),
divisions: libS(r.divisions), bestDivision: libS(r.best_division),
activeFrom: libS(r.active_from), activeTo: libS(r.active_to), status: libS(r.status),
wins: libNum(r.wins), winsKo: libNum(r.wins_ko),
losses: libNum(r.losses), lossesKo: libNum(r.losses_ko),
draws: libNum(r.draws), noContests: libNum(r.no_contests), recordAsOf: libS(r.record_as_of),
worldTitles: libS(r.world_titles), lineal: libTrue(r.lineal),
hallOfFame: libTrue(r.hall_of_fame), ringRank: libS(r.ring_rank),
promoter: libS(r.promoter), trainer: libS(r.trainer),
notableWins: libS(r.notable_wins), notableLosses: libS(r.notable_losses),
image: libS(r.image).trim(), imageCredit: libS(r.image_credit).trim(), notes: libS(r.notes),
look: { skin: libLook(r.look_skin), hair: libLook(r.look_hair),
hairColour: libLook(r.look_hair_colour), facial: libLook(r.look_facial) },
trunks: libLook(r.trunks_usual),
});
});
d.boxers = out;
}
if (extra.fights && extra.fights.length) {
const out = [];
extra.fights.forEach(r => {
if (!libOn(r.active)) return;
const a = libS(r.boxer_a), b = libS(r.boxer_b);
if (!a || !b) return;
out.push({
id: libS(r.fight_id), rivalryId: libS(r.rivalry_id),
boutNo: libN(r.bout_no), boutTotal: libN(r.bout_total), series: libS(r.series),
event: libS(r.event_name),
aId: libS(r.boxer_a_id), a: a, bId: libS(r.boxer_b_id), b: b,
date: libS(r.date).slice(0, 10),
venue: libS(r.venue), city: libS(r.city), country: libS(r.country),
division: libS(r.division), titles: libS(r.titles), rounds: libN(r.scheduled_rounds),
result: libS(r.result), winnerId: libS(r.winner_id), winner: libS(r.winner),
method: libS(r.method), endRound: libN(r.end_round),
scorecards: libS(r.scorecards), attendance: libS(r.attendance), notes: libS(r.notes),
video: libS(r.video_url) || libS(r.video_search_url),
verified: libOn(r.verified),
trunksA: libLook(r.trunks_a), trunksB: libLook(r.trunks_b),
});
});
out.sort((p, q) => libS(p.date).localeCompare(libS(q.date)));
d.fights = out;
}
}
function libQuestion_(r) {
const docRow = norm(r.kind) === 'document';
return {
id: libS(r.row_id), paper: libS(r.paper_id),
sourceId: libS(r.source_id || r.paper_id),
q: libS(r.question), part: libS(r.part), kind: norm(r.kind) || 'question',
section: libS(r.section), marks: libN(r.marks),
placeholder: String(r.placeholder) === 'True',
figure: libS(r.figure), diagram: libS(r.diagram) || libTwinSvg_(r),
needs: libS(r.needs),
isDoc: docRow,
images: libS(r.images),
lead: libS(r.lead), html: libS(r.html),
lines: libS(r.lines), order: libN(r.sort_order),
sourceLines: libS(r.source_lines).trim(), sourceLinesWithheld: libS(r.source_lines_withheld).trim(),
company: libS(r.company),
answer: libS(r.answer), answerType: norm(r.answer_type),
surface: norm(r.surface),
uses: libS(r.uses),
accept: libS(r.accept),
cells: libS(r.cells),
markWords: libS(r.mark_words),
drawAnswer: libS(r.draw_answer),
choices: libS(r.choices).split('|').map(t => t.trim()).filter(Boolean),
choiceRight: choiceKeys_(r.choice_right)[0] || [],
choiceWays: choiceKeys_(r.choice_right),
orderEnds: libS(r.order_ends).split('|').map(t => t.trim()).filter(Boolean),
needsPrint: libTrue(r.needs_print) || libTrue(r.print_required),
examinerNote: libS(r.examiner_note), examinerReport: libS(r.examiner_report),
guide: libS(r.guide),
name: libS(r.name), subject: libS(r.subject),
documentType: libS(r.document_type), keystage: libS(r.key_stage),
bandType: libS(r.band_type), bandValue: libS(r.band_value),
tier: libS(r.tier), examBoard: libS(r.exam_board),
examWave: libS(r.exam_wave), year: libS(r.year),
row: r,
libHas: libS(r.lib_has).trim(),
};
}
function libraryInto_(d, rows) {
if (!d || !Array.isArray(rows)) return d;
const cfg = (d.constants && d.constants.vars) || {};
const qs = [];
const held = new Set();
rows.forEach(r => { if (r && norm(r.kind) === 'question' && libOn(r.active)) held.add(libS(r.paper_id)); });
rows.forEach(r => {
if (!libS(r.row_id) || !libOn(r.active)) return;
if (norm(r.kind) === 'document' && !held.has(libS(r.paper_id))) return;
qs.push(libQuestion_(r));
});
d.questions = qs;
return d;
}
const LIB = { pending: new Set(), flying: new Set(), gone: new Set(), failed: '',
timer: 0, filled: new Set(), gen: 0, ahead: {}, disk: null, diskP: null, ledger: '' };
const LIB_PER_ASK = 50;
const LIB_AHEAD = 10;
const LIB_AHEAD_BATCH = 24;
const LIB_DISK_MAX = 800;
const LIB_DISK_DB = 'family-lib';
const libWaits_ = o => !!o && libS(o.lib_has !== undefined ? o.lib_has : o.libHas).trim() !== '';
function libHasField_(o, f) {
if (!o) return false;
if (libS(o[f]).trim()) return true;
return (' ' + libS(o.lib_has !== undefined ? o.lib_has : o.libHas) + ' ').indexOf(' ' + f + ' ') !== -1;
}
function libTwinSvg_(r) {
const h = libS(r && r.diagram_twin).trim();
if (!/^[0-9a-f]{12}$/.test(h)) return '';
const m = /^(\d+)x(\d+)$/.exec(libS(r.diagram_twin_wh).trim()), w = m ? +m[1] : 340, ht = m ? +m[2] : 255;
return cardBlock_({ type: 'drawing', node: { el: 'svg', a: { class: 'qtwin', xmlns: 'http://www.w3.org/2000/svg', viewBox: `0 0 ${w} ${ht}`, width: w, role: 'img', 'aria-label': 'Figure' },
kids: { el: 'image', a: { href: `data/diagrams/${h}.png`, width: w, height: ht } } } });
}
const libWireQ_ = r => 'q:' + libS(r && (r.same_as || r.row_id || r.id)).trim();
const LIB_SAME = new WeakMap();
function libSameOf_(list) {
if (!Array.isArray(list)) return new Map();
let m = LIB_SAME.get(list);
if (!m) { m = new Map(); list.forEach(o => { const k = libS(o && o.same_as).trim(); if (k) m.set(k, (m.get(k) || []).concat(o)); }); LIB_SAME.set(list, m); }
return m;
}
const LIB_INDEX = new WeakMap();
function libIndexOf_(list, idOf) {
if (!Array.isArray(list)) return new Map();
let m = LIB_INDEX.get(list);
if (!m) { m = new Map(); list.forEach(o => { const k = idOf(o); if (k && !m.has(k)) m.set(k, o); }); LIB_INDEX.set(list, m); }
return m;
}
const libSigned_ = () => typeof USER !== 'undefined' && !!USER && !!USER.token;
const libMayAsk_ = () => libSigned_() || (typeof guestLibrary_ === 'function' && guestLibrary_());
const libWho_ = () => (libSigned_() ? USER.token : '');
function libAsk_(ids) {
if (!libMayAsk_()) return;
(ids || []).forEach(t => { if (t && (libSigned_() || !/^q:/.test(t) || (typeof guestPractice_ === 'function' && guestPractice_())) && !LIB.flying.has(t) && !LIB.gone.has(t)) LIB.pending.add(t); });
if (!LIB.pending.size || LIB.timer || LIB.failed) return;
LIB.timer = setTimeout(libPump_, 0);
}
function libPump_() {
LIB.timer = 0;
if (!libMayAsk_() || !LIB.pending.size) return;
if (!LIB.disk) {
if (!LIB.diskP) LIB.diskP = libDiskLoad_().then(() => { if (!LIB.timer) LIB.timer = setTimeout(libPump_, 0); });
return;
}
libFromDisk_();
if (!LIB.pending.size) return;
while (LIB.pending.size) {
const all = [...LIB.pending], pre = String(all[0]).split(':')[0] + ':';
libSend_(all.filter(t => String(t).indexOf(pre) === 0).slice(0, LIB_PER_ASK));
}
}
const LIB_KIND_ = { q: 'question', ct: 'content', pr: 'practical', pj: 'project', in: 'insert' };
function libSend_(ids) {
ids.forEach(t => { LIB.pending.delete(t); LIB.flying.add(t); });
const who = libWho_();
send(Object.assign({ action: 'item', door: 'get', kind: LIB_KIND_[String(ids[0]).split(':')[0]], personId: (USER && USER.personId) || '', ids: ids },
who ? {} : { device: typeof oopsDevice_ === 'function' ? oopsDevice_() : '' }))
.then(d => {
if (libWho_() !== who) return;
libMerge_((d && d.items) || {});
libDiskPut_((d && d.items) || {}, d && d.gen);
((d && d.missing) || []).forEach(t => LIB.gone.add(t));
})
.catch(err => {
if (libWho_() !== who) return;
LIB.failed = libWhyNot_(err);
ids.forEach(t => LIB.pending.add(t));
})
.then(() => {
ids.forEach(t => LIB.flying.delete(t));
libLanded_();
if (LIB.pending.size && !LIB.failed) LIB.timer = setTimeout(libPump_, 0);
});
}
function libLedgerGen_() {
return String(LIB.ledger || (typeof DATA !== 'undefined' && DATA && DATA.libGen) || '');
}
function idbTx_(db, store, mode, fn, opts) {
return new Promise((ok, no) => {
const rq = indexedDB.open(db, 1);
rq.onupgradeneeded = () => { try { rq.result.createObjectStore(store, opts); } catch (e) { } };
rq.onerror = () => no(rq.error);
rq.onsuccess = () => {
try {
const t = rq.result.transaction(store, mode), r = fn(t.objectStore(store));
t.oncomplete = () => { ok(r && 'result' in r ? r.result : true); rq.result.close(); };
t.onerror = t.onabort = () => { no(t.error); rq.result.close(); };
} catch (e) { no(e); }
};
});
}
function libDisk_() {
try {
if (typeof indexedDB === 'undefined' || !indexedDB) return null;
const tx = (mode, fn) => Promise.resolve().then(() => idbTx_(LIB_DISK_DB, 'items', mode, fn, { keyPath: 'id' }));
return {
all: () => tx('readonly', st => st.getAll()),
put: recs => tx('readwrite', st => { recs.forEach(r => st.put(r)); }),
drop: ids => tx('readwrite', st => { ids.forEach(id => st.delete(id)); }),
clear: () => tx('readwrite', st => { st.clear(); }),
};
} catch (e) { return null; }
}
function libDiskLoad_() {
const disk = libDisk_();
if (!disk) { LIB.disk = new Map(); return Promise.resolve(); }
return Promise.resolve().then(() => disk.all()).then(recs => {
const m = new Map(), stale = [], who = (USER && USER.personId) || '', gen = libLedgerGen_();
(recs || []).forEach(r => { if (r && r.id && r.who === who && (!gen || r.gen === gen)) m.set(r.id, r); else if (r && r.id) stale.push(r.id); });
LIB.disk = m;
if (stale.length) try { disk.drop(stale).catch(() => {}); } catch (e) { }
}).catch(() => { LIB.disk = new Map(); });
}
function libFromDisk_() {
const gen = libLedgerGen_(), who = (USER && USER.personId) || '';
if (!gen || !LIB.disk || !LIB.disk.size) return;
const hit = {};
[...LIB.pending].forEach(t => { const r = LIB.disk.get(t); if (r && r.gen === gen && r.who === who && r.item) { hit[t] = r.item; LIB.pending.delete(t); } });
if (!Object.keys(hit).length) return;
libMerge_(hit);
if (typeof libLanded_ === 'function') libLanded_();
}
function libDiskPut_(items, gen) {
try {
const g = String(gen || libLedgerGen_() || '');
if (!g || !LIB.disk) return;
const disk = libDisk_();
if (g !== libLedgerGen_() || [...LIB.disk.values()].some(r => r.gen !== g)) {
const old = [...LIB.disk.values()].filter(r => r.gen !== g).map(r => r.id);
old.forEach(id => LIB.disk.delete(id));
if (disk && old.length) disk.drop(old).catch(() => {});
}
LIB.ledger = g;
const who = (USER && USER.personId) || '', now = Date.now();
const recs = Object.keys(items || {}).map(id => ({ id: id, gen: g, who: who, at: now, item: items[id] }));
if (!recs.length) return;
recs.forEach(r => LIB.disk.set(r.id, r));
let drop = [];
if (LIB.disk.size > LIB_DISK_MAX) {
const pin = typeof window.offPinned_ === 'function' ? window.offPinned_() : new Set();
drop = [...LIB.disk.values()].filter(r => !pin.has(r.id)).sort((a, b) => a.at - b.at).slice(0, LIB.disk.size - LIB_DISK_MAX).map(r => r.id);
drop.forEach(id => LIB.disk.delete(id));
}
if (disk) { disk.put(recs).catch(() => {}); if (drop.length) disk.drop(drop).catch(() => {}); }
} catch (e) { }
}
function libDiskClear_() {
LIB.disk = null; LIB.diskP = null; LIB.ledger = '';
try { const disk = libDisk_(); if (disk) disk.clear().catch(() => {}); } catch (e) { }
}
function libWhyNot_(err) {
const why = String((err && err.message) || err || '');
if (/does not have `\w+`|unknown action/i.test(why)) {
return (may_('admin'))
? 'The library needs the latest backend — deploy it.' : 'The library is being updated — try again later.';
}
return why || 'the library did not answer';
}
function libFill_(r, c) {
if (!r || !c) return;
const keys = Object.keys(c);
keys.forEach(k => { r[k] = c[k]; });
if (!LIB.filled.has(r)) { r.__libHas = r.lib_has; r.__libKeys = keys; }
else r.__libKeys = [...new Set((r.__libKeys || []).concat(keys))];
delete r.lib_has;
LIB.filled.add(r);
}
function libMerge_(items) {
const ids = Object.keys(items || {});
if (!ids.length) return;
const ex = (typeof LIBRARY_EXTRA !== 'undefined' && LIBRARY_EXTRA) || {};
const D = (typeof DATA !== 'undefined' && DATA) || {};
ids.forEach(t => {
const c = items[t], m = /^(q|ct|pr|pj|in):(.+)$/.exec(t);
if (!m || !c || typeof c !== 'object') return;
const id = m[2];
if (m[1] === 'in') {
const r = libIndexOf_(ex.inserts, o => libS(o.insert_id).trim()).get(id);
if (r) libFill_(r, c);
const ins = (D.inserts || []).find(o => o.id === id);
if (ins) { ins.sourceText = libS(c.source_text); ins.libHas = ''; }
} else if (m[1] === 'q') {
const own = libIndexOf_(LIBRARY_ROWS, o => libS(o.row_id)).get(id);
[own].concat(libSameOf_(LIBRARY_ROWS).get(id) || []).forEach(r => {
if (!r) return;
libFill_(r, c);
const rid = libS(r.row_id);
const q = libIndexOf_(D.questions, o => libS(o.id)).get(rid);
if (q) Object.assign(q, libQuestion_(r));
if (typeof questionContent_ === 'function' && typeof libItemByKey_ === 'function') {
const it = libItemByKey_('q:' + rid);
if (it && q) Object.assign(it, questionContent_(q));
}
});
} else if (m[1] === 'pr' || m[1] === 'pj') {
const col = m[1] === 'pr' ? 'practical_id' : 'project_id';
const r = libIndexOf_(ex[m[1] === 'pr' ? 'practicals' : 'projects'], o => libS(o[col]).trim()).get(id);
if (!r) return;
libFill_(r, c);
const p = libIndexOf_(D[m[1] === 'pr' ? 'practicals' : 'projects'], o => libS(o.id)).get(id);
if (p) Object.assign(p, m[1] === 'pr' ? libPractical_(r) : libProject_(r));
} else {
const r = libIndexOf_(ex.textbooks, o => (libS(o.anim).trim() ? '' : libS(o.book_id).trim() + '#' + libS(o.chapter).trim())).get(id);
if (!r) return;
libFill_(r, c);
const at = id.lastIndexOf('#');
const b = (D.textbooks || []).find(x => x.id === id.slice(0, at));
const ch = b && (b.chapters || []).find(x => String(x.n) === String(libN(id.slice(at + 1))));
if (ch) Object.assign(ch, libChapterBody_(r));
}
});
LIB.gen++;
}
function libForget_() {
const D = (typeof DATA !== 'undefined' && DATA) || {};
LIB.filled.forEach(r => {
(r.__libKeys || []).forEach(k => { delete r[k]; });
r.lib_has = r.__libHas;
delete r.__libHas; delete r.__libKeys;
try {
if (r.row_id !== undefined) {
const q = libIndexOf_(D.questions, o => libS(o.id)).get(libS(r.row_id));
if (q) Object.assign(q, libQuestion_(r));
} else if (r.practical_id !== undefined) {
const p = libIndexOf_(D.practicals, o => libS(o.id)).get(libS(r.practical_id).trim());
if (p) Object.assign(p, libPractical_(r));
} else if (r.project_id !== undefined) {
const p = libIndexOf_(D.projects, o => libS(o.id)).get(libS(r.project_id).trim());
if (p) Object.assign(p, libProject_(r));
} else if (r.book_id !== undefined) {
const b = (D.textbooks || []).find(x => x.id === libS(r.book_id).trim());
const ch = b && (b.chapters || []).find(x => x.n === libN(r.chapter));
if (ch) Object.assign(ch, libChapterBody_(r));
} else if (r.insert_id !== undefined) {
const ins = (D.inserts || []).find(o => o.id === libS(r.insert_id).trim());
if (ins) { ins.sourceText = ''; ins.libHas = libS(r.lib_has).trim(); }
}
} catch (e) { }
});
LIB.filled.clear(); LIB.pending.clear(); LIB.flying.clear(); LIB.gone.clear();
LIB.failed = '';
libDiskClear_();
clearTimeout(LIB.timer); LIB.timer = 0;
LIB.gen++;
}
function libRetry_() {
LIB.failed = '';
if (typeof libLanded_ === 'function') libLanded_();
if (LIB.pending.size && !LIB.timer) LIB.timer = setTimeout(libPump_, 0);
}
try { window.addEventListener('online', () => { if (LIB.failed) libRetry_(); }); } catch (e) { }
;
/* js/qtypes.js */
const QENGINE = {"types":{"value":{"checker":"number","moved":true,"face":"type","label":"Single value","padLayer":"maths","surface":"{typed}, maths keys","tiles":["Figure","Check"],"marked":"accept: the number by value, a band `a to b`, a name in front (`x = 9`) allowed","tolerance":"as the scheme writes it; a band where it prints one","wrong":"Not yet, box stays editable","right":"Correct + marks","phone":"Keypad, not the phone keyboard","pc":"Typed; Enter is Check","need":["accept"]},"unit":{"checker":"number","moved":true,"face":"type","label":"Value with a unit","padLayer":"maths","surface":"{typed}, maths keys with the unit row","tiles":["Figure","Check"],"marked":"accept: the number, its unit optional unless the scheme needs it (√, π, a rate)","tolerance":"cm2 = cm² = cm^2; a wrong unit is wrong","wrong":"Not yet","right":"Correct + marks","phone":"Unit keys on the pad","pc":"Typed","need":["accept"]},"fraction":{"checker":"number","moved":true,"face":"type","label":"Fraction or mixed number","padLayer":"maths","surface":"{typed}, stacked as typed","tiles":["Figure","Check"],"marked":"accept by value (2/5 = 6/15 = 0.4); `rule: mixed` when the form is asked","tolerance":"equal value unless simplest/mixed form is asked","wrong":"Not yet","right":"Correct + marks","phone":"Fraction key on the pad","pc":"Typed 1 3/4","need":["accept","formRule"]},"multi":{"checker":"number","moved":true,"face":"type","label":"Several values","padLayer":"maths","surface":"One box (owner, 20 Nov): the values typed in it with commas or spaces","tiles":["Figure","Check"],"marked":"accept list as a set, or `rule:` clauses (count, each, sum, set …)","tolerance":"order-free unless the scheme orders","wrong":"Not yet","right":"Correct + marks","phone":"✓ sends","pc":"Enter sends","need":["accept"]},"measure":{"checker":"number","moved":true,"face":"type","label":"Measure from a figure","padLayer":"maths","surface":"{typed} beside the figure; a protractor or ruler laid on the figure (385)","tiles":["Figure","Protractor / Ruler (as asked)","Check"],"marked":"accept as a band (`a to b`); an angle survives the screen, a length needs a stated scale","tolerance":"the scheme's ± (often 2 mm / 2°)","wrong":"Not yet","right":"Correct + marks","phone":"One finger drags the tool, two turn it, or its round handle; it snaps onto a corner and along an arm","pc":"Drag; the handle or the wheel turns it; typed","need":["accept","band"]},"expr":{"checker":"expression","moved":true,"face":"type","label":"Expression or equation","padLayer":"maths","surface":"{typed}, maths keys with letters and powers","tiles":["Figure","Check"],"marked":"`rule: expr`/`eqn` by value at six points; a form question (simplify, factorise) matched as written","tolerance":"any equivalent form unless the form is the question","wrong":"Not yet","right":"Correct + marks","phone":"x², √, π keys","pc":"Typed x^2","need":["accept","exprRule"]},"coords":{"checker":"number","moved":true,"face":"type","label":"Coordinates","padLayer":"maths","surface":"Two boxes in brackets (362)","tiles":["Figure","Check"],"marked":"accept as an ordered pair","tolerance":"exact; a graph reading as a band","wrong":"Not yet","right":"Correct + marks","phone":"Minus key on the pad","pc":"Typed","need":["accept"]},"draw":{"checker":"points","moved":true,"face":"draw","label":"Draw on the figure","surface":"{pen}: the figure with its frame (grid x,y, number line, or angle round a centre for a clock, dial or pie), every tap snapped to the frame","tiles":"{penTiles}","marked":"draw_answer in the one form: points, lines, curves and regions in the frame (find-pen.js drawOne_), one marker (DRAW_MARK), part marks a piece; AI only for a shape-only sketch (`ai`)","tolerance":"half a step of the frame (a grid square, unless the frame says its step)","wrong":"Not yet, part marks","right":"Correct · by the drawing","phone":"{penPhone}","pc":"{penPc}","need":["draw_answer"]},"choose1":{"checker":"choice","moved":true,"face":"type","padLayer":"letters","label":"Choose one","surface":"The options listed A, B, C; the one box, its keypad only the option letters","tiles":["the options"],"marked":"choice_right","tolerance":"none","wrong":"The tapped option red, the right one shown","right":"The option gold","phone":"Tap","pc":"Click","need":["choices","choice_right"]},"chooseN":{"checker":"choice","moved":true,"face":"type","padLayer":"letters","label":"Choose several","surface":"The options listed A, B, C; the one box, its keypad only the option letters (A,D: sorted, no repeats); the count to pick is said","tiles":["the options"],"marked":"choice_right, all of them","tolerance":"order-free","wrong":"Wrong picks red","right":"All gold","phone":"Tap each","pc":"Click each","need":["choices","choice_right"]},"match":{"checker":"choice","moved":false,"face":"type","label":"Match or sort into groups","surface":"A table, a box an answer (owner, 23 Nov), or lines drawn on the figure in place (402)","tiles":["Figure","Check"],"marked":"cells, each by markAnswer_; or draw_answer `join` (a stroke from one box to its partner)","tolerance":"a cell holding a list is a set","wrong":"n of m answers right","right":"Correct — every answer","phone":"Each box's keypad","pc":"Typed; Tab between boxes","need":["cells|draw_answer"]},"order":{"checker":"choice","moved":true,"face":"type","padLayer":"letters","label":"Put in order","surface":"The items listed A, B, C between the two ends (order_ends); the one box, the letters tapped in sequence (B,D,A,C)","tiles":["Clear","Check"],"marked":"choice_right as the permutation","tolerance":"none","wrong":"Not yet","right":"Correct","phone":"Tap item, it takes the next slot","pc":"Click","need":["choices","choice_right","order_ends"]},"label":{"checker":"choice","moved":false,"face":"type","label":"Label a diagram","surface":"{pen}, or a table, a box a label","tiles":"{penTiles}","marked":"cells (a label per place) or draw_answer `inside`; written labels are not read","tolerance":"a label inside its region","wrong":"Not yet","right":"Correct + marks","phone":"{penPhone}","pc":"{penPc}","need":["draw_answer|cells|accept"]},"table":{"checker":"number","moved":true,"face":"type","label":"Fill table cells","surface":"The table, each empty cell the one answer box (owner, 23 Nov): the question's own table, or one drawn a row an entry; tapped in any order","tiles":["Figure","Check"],"marked":"cells, a cell at a time by markAnswer_ (find-cells.js markCells_); rows (or columns) the child writes whole match the key's in any order, every other cell by its place","tolerance":"per cell, as value","wrong":"n of m cells right","right":"Correct — every cell","phone":"Each cell's keypad from its own answer","pc":"Typed; Tab between cells","need":["cells"]},"reason":{"checker":"words","moved":true,"face":"type","label":"Explanation or reasoning","surface":"{typed}, letter keys, wrapping","tiles":["Figure","Check","AI (only when the rule cannot give every mark)"],"marked":"mark_words: the verdict and the figure that decides it, a point a mark; AI last","tolerance":"a No stopped by its own punctuation is the verdict","wrong":"n of m marks, the missing point not shown","right":"Full marks","phone":"Letter keys","pc":"Typed","need":["mark_words|accept"]},"words":{"checker":"words","moved":true,"face":"type","label":"Short words (1–2 marks)","surface":"{typed}, letter keys","tiles":["Figure","Check"],"marked":"accept, else mark_words (key words, a point a mark); AI only after","tolerance":"case, punctuation and a full stop ignored","wrong":"Not yet","right":"Correct + marks","phone":"Letter keys","pc":"Typed","need":["accept|mark_words"]},"essay":{"checker":"none","moved":false,"face":"type","label":"Essay","padLayer":"sheet","surface":"A sheet, word count under it","tiles":["Figure","Check (AI)"],"marked":"AI against the scheme (answer), clamped to the marks","tolerance":"the scheme's levels","wrong":"Marks and one sentence why","right":"Marks and one sentence why","phone":"The phone keyboard","pc":"Typed","need":["answer","marks"]}},"phrases":{"typed":"One box on the site's keypad","pen":"Its figure under the pen, in place on the card: its own, or the stem's (the stem's words carried onto the card above it), else a made-up grid. One figure, no second copy, no Draw switch, no box or keypad; Check under the part's words","penTiles":["Figure","Point","Line","Curve","Shade","Compass","Undo","Check"],"penPhone":"Finger draws, two fingers pan; the loupe follows the finger","penPc":"Mouse or stylus on a lazy brush (368); the ruler snaps to the grid"},"row":["read","measure","calc"],"buttons":["qp-check|qp-cells-check|pad-check|qp-noscheme|qp-send:send:Check","read-aloud:speak:Read aloud","card-share:share:Share","qt-pen/pen:pen:Pen","qt-inst/measure:ruler:Measure","pad-undo:undo:Undo","qt-calc:calc:Calculator"],"cut":["find-top","fav"]};
const qtPhrase_ = v => Array.isArray(v) || typeof v !== 'string' ? v
: /^\{(\w+)\}$/.test(v) && Array.isArray(QENGINE.phrases[v.slice(1, -1)]) ? QENGINE.phrases[v.slice(1, -1)]
: v.replace(/^\{(\w+)\}/, (m, k) => (k in QENGINE.phrases ? QENGINE.phrases[k] : m));
const QTYPE_PROTOCOL = Object.fromEntries(Object.entries(QENGINE.types).map(([t, p]) =>
[t, Object.fromEntries(Object.entries(p).map(([k, v]) => [k, qtPhrase_(v)]))]));
const qtS_ = v => (v == null ? '' : String(v)).trim();
const qtText_ = r => [r.lead, r.html].map(h => qtS_(h).replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' '))
.join(' ').replace(/\s+/g, ' ').toLowerCase();
const qtWays_ = r => qtS_(r.accept).split('|').map(w => w.trim()).filter(Boolean);
const qtRules_ = r => qtWays_(r).filter(w => /^rule:/i.test(w)).map(w => w.replace(/^rule:\s*/i, ''));
const qtPlain_ = r => qtWays_(r).filter(w => !/^rule:/i.test(w));
function qtDrawKinds_(r) {
const raw = qtS_(r.draw_answer);
if (!raw) return [];
try {
const d = JSON.parse(raw);
if (Array.isArray(d.pieces)) return d.pieces.map(p => qtS_(p && (p.as || p.is)));
return (Array.isArray(d.items) ? d.items : []).map(i => qtS_(i && (i.k || i.kind)));
} catch (e) { return ['?']; }
}
const QT_UNIT = /^[£$€]\s*[\d.]|^[-−]?[\d.]+\s*p$|^[-−]?[\d.,\s]*\d\s*(%|°|(mm|cm|km|kg|mg|ml|cl|litres?|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?|degrees?|pence|pounds?|euros?|dollars?|newtons?|units?|cubes?|coins?|people|kj|kw|hz|pa|kpa|mph|km\/h|m\/s|g\/cm|kg\/m|ω|ohms?|°c)\b|(cm|mm|m)\^?[23²³]|(mm|cm|km|ml|kg|mg)(?![a-z]))|^[-−]?[\d.,\s]*\d\s+[mglshnjwvp]\b/i;
const QT_COORD = /^\(\s*[-−]?[\d.\/]+\s*,\s*[-−]?[\d.\/]+\s*\)$/;
const QT_FRAC = /^[-−]?(\d+\s+)?\d+\s*[\/⁄]\s*\d+$|^[-−]?\d*\s*[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]$/;
const QT_ROMAN = /^[ivxlcdm]+$/i;
const QT_V = '(?:^|[^a-z])[a-z](?![a-z])';
const QT_V0 = '[a-z](?![a-z])';
const QT_ALG = new RegExp(QT_V + '[\\^²³]|[\\d)]' + QT_V0 + '|' + QT_V + '\\(|' + QT_V + '\\s*[-+−×*\\/]\\s*[\\d(]|'
+ QT_V + '\\s*[-+−×*\\/]\\s*' + QT_V0 + '|[\\d)]\\s*[-+−×*\\/]\\s*' + QT_V0 + '|√' + QT_V0, 'i');
function qtExpr_(w) {
const s = w.replace(/π|pi\b/gi, '').trim();
if (!/[a-z]/i.test(s) || /^[a-z]\s*=\s*[-−]?[\d.\/\s]+$/i.test(s) || QT_UNIT.test(s)) return false;
return QT_ALG.test(s) || /^[-−]?\d*[a-z]$/i.test(s) && s.length > 1 || /=/.test(s) && /[a-z]/i.test(s.split('=')[1] || '');
}
function qtSplit_(s) {
return [].concat(...String(s).split(/\s*,\s*/).map(v => (/\d|^[a-z]{1,2}\s+(and|&)\s+[a-z]{1,2}$/i.test(v)
? v.replace(/^and\s+/i, '').split(/\s+and\s+|\s*&\s*/) : [v])));
}
function qtValues_(r) {
for (const b of qtRules_(r)) {
if (/(?:^|,)\s*(expr|eqn)\s|(?:^|,)\s*points\b|^peel\b|^levels\b/.test(b)) continue;
const set = /(?:^|,)\s*set\s+([^,]+)/.exec(b);
if (set) return set[1].split('/').length;
const c = /(?:^|,)\s*count\s+(\d+)/.exec(b);
if (c && +c[1] >= 2) return +c[1];
if (!c) return 0;
}
const split = w => {
const s = w.replace(/^\((.*)\)$/, '$1');
if (/\d,\d{3}(?!\d)/.test(s) || !/,|\sand\s|&/.test(s)) return 1;
const parts = qtSplit_(s);
return parts.length >= 2 && parts.length <= 16 && parts.every(v => /^[-a-z]{0,2}\s*=?\s*[-\d.\/⁄£$%°a-z²³√π −]{1,14}$/i.test(v) && v.split(' ').length <= 3) ? parts.length : 1;
};
const ways = qtPlain_(r);
if (!ways.length) return 1;
const n = split(ways[0]);
return n >= 2 && ways.every(w => { const m = split(w); return m === 1 || m === n; }) ? n : 1;
}
const QT_CELL_EMPTY = /^(?:\s|&nbsp;| )*$/;
const qtCellText_ = h => String(h || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;| /g, ' ').replace(/&minus;|−|&ndash;|–/g, '-')
.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().toLowerCase();
function qtCellRead_(t) {
const rows = [...String(t).matchAll(/<tr[\s\S]*?<\/tr>/g)].map(m => [m.index, m.index + m[0].length]);
const tds = [...String(t).matchAll(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g)].map(m => {
const r = rows.findIndex(([a, b]) => m.index >= a && m.index < b);
return { r, at: m.index, end: m.index + m[0].length, open: 2 + m[1].length + m[2].length, inner: m[3], blank: QT_CELL_EMPTY.test(m[3]) };
});
tds.forEach((d, i) => { d.c = i && tds[i - 1].r === d.r ? tds[i - 1].c + 1 : 0; });
return tds;
}
function qtCellPlaces_(html, cells) {
const n = (cells || []).length;
if (!n) return null;
const asked = cells.map(c => !!c.ways);
for (const t of String(html || '').match(/<table[\s\S]*?<\/table>/g) || []) {
const tds = qtCellRead_(t), blanks = tds.map((d, i) => (d.blank ? i : -1)).filter(i => i >= 0);
const corner = blanks.length === n + 1 && blanks[0] === 0 && tds[0].r === 0;
if (blanks.length === n || corner) {
const at = corner ? blanks.slice(1) : blanks;
return { table: t, tds, at: at.map((i, k) => (asked[k] ? i : -1)), token: at.map(() => ''), by: 'blanks' };
}
const lab = c => /^\(\s*[a-z0-9]{1,5}\s*\)$/i.test(c.label) ? c.label.replace(/\s+/g, '') : '';
const tok = cells.map((c, k) => {
if (!asked[k] || !lab(c)) return -1;
const hit = tds.map((d, i) => (d.inner.replace(/<[^>]*>/g, '').replace(/\s+/g, '').indexOf(lab(c)) >= 0 ? i : -1)).filter(i => i >= 0);
return hit.length === 1 ? hit[0] : -2;
});
if (asked.some(Boolean) && tok.every((i, k) => !asked[k] || i >= 0) && new Set(tok.filter(i => i >= 0)).size === tok.filter(i => i >= 0).length) {
return { table: t, tds, at: tok.map((i, k) => (asked[k] ? i : -1)), token: cells.map(c => lab(c)), by: 'labels' };
}
const rowAt = cells.map((c, k) => {
if (!asked[k]) return -1;
const name = qtCellText_(c.label);
const heads = tds.filter(d => d.c === 0 && qtCellText_(d.inner) === name);
if (heads.length !== 1) return -2;
const mine = tds.map((d, i) => (d.r === heads[0].r && d.blank ? i : -1)).filter(i => i >= 0);
return mine.length ? mine[mine.length - 1] : -2;
});
if (asked.some(Boolean) && rowAt.every((i, k) => !asked[k] || i >= 0) && new Set(rowAt.filter(i => i >= 0)).size === rowAt.filter(i => i >= 0).length) {
return { table: t, tds, at: rowAt, token: cells.map(() => ''), by: 'rows' };
}
}
return null;
}
const QT_FACES = ['type', 'draw'];
function qtFace_(x) {
const r = (x && x.row) || x || {};
const cells = qtS_(r.cells) ? qtS_(r.cells).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, '&').split(';').length : 0;
const choices = Array.isArray(r.choices) ? r.choices : qtS_(r.choices).split('|').filter(c => c.trim());
const values = qtWays_(r).length ? qtValues_(r) : 1;
if (cells) return { face: 'type', cells: cells, values: cells };
if (choices.length >= 2) return { face: 'type', letters: choices.length, values: values };
if (qtS_(r.draw_answer || r.drawAnswer)) return { face: 'draw', values: 1 };
if (qtRules_(r).some(b => /^(peel|levels)\b/i.test(b))) return { face: 'type', sheet: true, values: 1 };
return { face: 'type', values: values };
}
const QT_DRAW_WORDS = [
['match', /\bmatch\b|\bdraw (one |a )?lines? from each\b|\bjoin each\b/],
['table', /\bcomplete the (\w+ )?table\b/],
['chooseN', /\b(circle|underline|tick) (the|all|each|two|three|four|one)\b/],
['label', /\blabel\b/],
];
const QT_DRAW_FIRST = ['match', 'table', 'chooseN'];
const QT_DRAWN = { drawing: 1, annotate: 1 };
const QT_MEASURE = /\bmeasure (the |this |each |angle |accurately )?(size|length|angle|distance|width|height|line|side|perimeter|bearing)s?\b|\buse (a|your) (ruler|protractor|angle measurer) to (find|measure)\b/;
const QT_WORDED = { explain: 1, proof: 1, written: 1 };
const QT_REASON_WORDS = /\b(explain|show that|prove|give (a |your )?reasons?|giving (a |your )?reasons?|comment|interpret|describe|justify|why|evaluate|discuss|compare|suggest|assess|criticise|state, giving)\b/;
function qtFormula_(ans) {
const h = ((/<b>([\s\S]*?)<\/b>/.exec(qtS_(ans)) || [])[1]) || '';
return /=|&frasl;|&radic;|\u221a|\u2044|<su[pb]>|&pi;|\u03c0/.test(h) && !/[a-z]{3,}/i.test(h.replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' '));
}
function qType_(x) {
const r = (x && x.row) || x || {};
const t = qtS_(r.answer_type).toLowerCase();
const words = qtText_(r);
const choices = qtS_(r.choices).split('|').filter(c => c.trim());
if (choices.length >= 2) {
if (t === 'order') return 'order';
return qtS_(r.choice_right).split('|')[0].split(',').filter(n => n.trim()).length >= 2 ? 'chooseN' : 'choose1';
}
if (qtS_(r.cells)) return /\b(match|join|sort|venn|pairs?)\b/.test(words) || /venn/i.test(qtS_(r.figure)) ? 'match'
: t === 'annotate' || /\blabel\b/.test(words) ? 'label' : 'table';
const surf = qtS_(r.surface).toLowerCase();
const boxed = !qtS_(r.draw_answer) && (qtWays_(r).length || qtS_(r.mark_words));
if ((QT_DRAWN[t] || (surf && surf !== 'text')) && !boxed) {
const k = qtDrawKinds_(r);
const said = QT_DRAW_WORDS.find(w => w[1].test(words));
if (said && QT_DRAW_FIRST.indexOf(said[0]) !== -1) return said[0];
if (k.indexOf('join') !== -1) return 'match';
if (!k.length && ((said && said[0] === 'label') || t === 'annotate')) return 'label';
return 'draw';
}
const plain = qtPlain_(r), first = plain[0] || '', rules = qtRules_(r).join(', ');
const marks = Number(r.marks) || 0;
if (QT_WORDED[t] && marks >= 6 && !/math|statistic/i.test(qtS_(r.subject))) return 'essay';
if (QT_MEASURE.test(words.replace(/\bused to measure\b/g, '')) && !QT_WORDED[t]) return 'measure';
const short = marks <= 2 && !QT_REASON_WORDS.test(words);
if (QT_WORDED[t] && !qtWays_(r).length) return short && t !== 'explain' && t !== 'proof' ? 'words' : 'reason';
if (!qtWays_(r).length) {
if (qtS_(r.mark_words)) return short ? 'words' : 'reason';
if (QT_REASON_WORDS.test(words)) return 'reason';
const a = qtS_(r.answer).replace(/<[^>]*>/g, ' ').replace(/&[a-z0-9#]+;/gi, ' ');
if (qtFormula_(r.answer)) return 'value';
return !/\d/.test(a) && /[a-z]{3,}/i.test(a) ? 'words' : 'value';
}
if (/(?:^|,)\s*(expr|eqn)\s/.test(rules)) return 'expr';
if (/(?:^|,)\s*mixed\b/.test(rules)) return 'fraction';
if (/(?:^|,)\s*points\b/.test(rules) && !plain.length) return short ? 'words' : 'reason';
if (QT_COORD.test(first)) return 'coords';
if (qtFace_(r).values !== 1) return 'multi';
if (QT_FRAC.test(first)) return 'fraction';
if (qtExpr_(first)) return 'expr';
if (/^[-−\d.\s]*[a-z]?\s*[<>≤≥]/i.test(first) && /[a-z]/i.test(first)) return 'expr';
if (plain.some(w => QT_UNIT.test(w.replace(/^[-−\d.\s]+to\s+/i, '')) && /[a-z£$€%°]/i.test(w.replace(/^[a-z]\s*=\s*/i, '')))) return 'unit';
if (/[a-z]{3,}/i.test(first) && !QT_ROMAN.test(first)) return 'words';
return 'value';
}
const QT_FORM = /\b(simplify|simplest|factori[sz]e|expand|multiply out|in the form|standard form|surd|as a (single )?power of)\b/;
const QT_NEED = {
exprRule: r => QT_FORM.test(qtText_(r)) || /[<>≤≥]/.test(qtPlain_(r)[0] || '') || /(?:^|,)\s*(expr|eqn)\s/.test(qtRules_(r).join(', ')),
formRule: r => !/\bmixed number\b/.test(qtText_(r)) || /(?:^|,)\s*mixed\b/.test(qtRules_(r).join(', ')),
band: r => qtWays_(r).some(w => /\bto\b|\.\.|±|^rule:/i.test(w)) || qtWays_(r).length >= 3,
convert: () => false,
};
function qtNeedMet_(r, need) {
if (QT_NEED[need]) return QT_NEED[need](r);
return need.split('|').some(f => qtS_(r[f]) !== '');
}
function qtDrawn_(x) {
const r = (x && x.row) || x || {};
const surf = qtS_(r.surface).toLowerCase();
if (!(QT_DRAWN[qtS_(r.answer_type).toLowerCase()] || (surf && surf !== 'text'))) return false;
return !qtS_(r.choices) && !qtS_(r.cells);
}
function qtIncomplete_(x) {
const r = (x && x.row) || x || {};
const p = QTYPE_PROTOCOL[qType_(r)];
return p ? p.need.filter(n => !qtNeedMet_(r, n)) : ['type'];
}
function qtMarker_(x) {
const r = (x && x.row) || x || {};
if (qtS_(r.choices) && qtS_(r.choice_right)) return qtS_(r.answer_type).toLowerCase() === 'order' ? 'order' : 'choice';
if (qtS_(r.cells)) return 'cells';
if (qtS_(r.draw_answer)) return 'draw';
if (qtS_(r.accept)) return 'accept';
if (qtS_(r.mark_words)) return 'words';
return 'save';
}
function qtMachine_(x) { return qtMarker_(x) !== 'save'; }
const qtKeys_ = t => (QTYPE_PROTOCOL[t] && QTYPE_PROTOCOL[t].padLayer) || 'letters';
;
/* js/settings.js */
const SETTINGS_TABS = ['settings/brand', 'settings/laws',
'settings/facts',
'settings/spotlight', 'settings/card-fields',
'settings/default-pictures', 'settings/permissions', 'settings/screens-moved', 'settings/labels',
'settings/confusables', 'settings/marking'];
const setNorm_ = v => libS(v).toLowerCase().trim();
const setRow_ = i => i + 2;
function setMoved_(d, extra) {
const moved = {};
(extra['settings/screens-moved'] || []).forEach(r => { const id = libS(r && r.screen), to = libS(r && r.to); if (id && to) moved[id] = to; });
if (Object.keys(moved).length) d.columnsMoved = moved;
}
function setBrand_(d, extra) {
const brand = extra['settings/brand'];
if (brand && brand.length) {
d.brand = d.brand || {};
brand.forEach(r => {
const k = libS(r.key).trim();
if (k) d.brand[k] = libS(r.value);
});
}
}
function setLaws_(d, extra) {
const laws = extra['settings/laws'];
if (laws && laws.length) {
d.laws = laws
.filter(r => (libS(r.match) || setNorm_(r.kind) === 'list') && libOn(r.active))
.map(r => ({
kind: setNorm_(r.kind) || 'word',
match: libS(r.match),
colour: setNorm_(r.colour) || 'ink',
weight: libN(r.weight) || 0,
}))
.sort((a, b) => b.weight - a.weight);
}
}
function setFacts_(d, extra) {
const facts = extra['settings/facts'];
if (facts && facts.length) {
d.facts = facts
.map((r, i) => ({ r: r, i: i }))
.filter(x => (libS(x.r.heading) || libS(x.r.clip)) && libOn(x.r.active))
.map(x => ({
subject: libS(x.r.subject),
heading: libS(x.r.heading),
body: libS(x.r.body),
pic: libS(x.r.pic),
clip: libS(x.r.clip),
age: libS(x.r.age),
order: libN(x.r.sort_order) || 0,
row: setRow_(x.i),
}))
.sort((a, b) => (a.order - b.order) || (a.row - b.row));
}
}
;
/* js/settings-read.js */
function setSpot_(d, extra) {
const spot = extra['settings/spotlight'];
if (spot && spot.length) {
d.spotlightFile = spot
.filter(r => libS(r.item_id) && libOn(r.on))
.map(r => libS(r.item_id));
}
}
function setConfusables_(d, extra) {
const confusables = extra['settings/confusables'];
if (confusables && confusables.length) d.confusables = confusables.filter(r => libS(r.words).trim()).map(r => ({ words: libS(r.words) }));
}
function setMarking_(d, extra) {
const rows = extra['settings/marking'];
if (rows && rows.length) d.marking = rows.filter(r => r && libS(r.kind)).map(r => Object.assign({}, r));
}
function setFor_(d) {
const cards = (typeof ITEM_KINDS !== 'undefined' && (ITEM_KINDS.kinds.setting || {}).cards) || [];
const rows = cards.filter(r => r && r.id && (/^type:/.test(r.id) || (r.under || []).length));
if (rows.length) d.settingFor = Object.fromEntries(rows.map((r, i) => { const t = /^type:/.test(r.id);
return [r.id, { under: [].concat(r.under || []), name: r.find || '', rank: i, col: t ? r.col || '' : '', label: t ? r.label || '' : '', admin: t && r.admin === true, peek: t && r.peek === true }]; }));
}
function setCardFields_(d, extra) {
const rows = extra['settings/card-fields'];
const list = v => libS(v).split(',').map(t => t.trim()).filter(Boolean);
if (rows && rows.length) d.cardFields = Object.fromEntries(rows.filter(r => libS(r.kind).trim()).map(r => [libS(r.kind).trim(),
{ cls: libS(r.cls).trim(), pic: list(r.pic), title: list(r.title), tags: list(r.tags), lines: list(r.lines), tiles: list(r.tiles) }]));
if (rows && rows.length) d.cardLook = Object.fromEntries(rows.filter(r => libS(r.kind).trim()).map(r => [libS(r.kind).trim(), { facts: r.facts === true || libOn(r.facts), icon: libS(r.icon).trim() }]));
}
function setDefaultPictures_(d, extra) {
const pics = extra['settings/default-pictures'] || [];
d.defaultPictures = Array.isArray(pics) ? pics.map(r => libS(r.picture).trim()).filter(Boolean) : [];
}
function setPermissions_(d, extra) {
const perms = extra['settings/permissions'];
if (perms && perms.length) d.permissions = perms.filter(r => libS(r.action).trim() && libS(r.role).trim()).reduce((o, r) => {
const k = libS(r.kind).trim() || 'action';
((o[k] = o[k] || {})[libS(r.action).trim()] = o[k][libS(r.action).trim()] || {})[libS(r.role).trim()] = r.allow === true || libOn(r.allow);
return o;
}, {});
}
function setLabels_(d, extra) {
const labels = extra['settings/labels'];
if (!labels || !labels.length) return;
d.labels = {};
labels.forEach(r => {
const o = d.labels;
if (libOn(r.active) && libS(r.group) && libS(r.key) && libS(r.label)) (o[libS(r.group)] = o[libS(r.group)] || {})[libS(r.key)] = text_(libS(r.label));
});
}
const labelOf_ = (group, key, fallback) => {
try { const g = DATA && DATA.labels && DATA.labels[group]; return (g && g[key]) || fallback; } catch (e) { return fallback; }
};
function settingsInto_(d, extra) {
if (!d || !extra) return d;
setBrand_(d, extra); setMoved_(d, extra); setLaws_(d, extra); setFacts_(d, extra);
setSpot_(d, extra); setConfusables_(d, extra); setMarking_(d, extra); setFor_(d); setCardFields_(d, extra);
setDefaultPictures_(d, extra); setPermissions_(d, extra); setLabels_(d, extra);
return d;
}
;
/* js/shell-boot.js */
const OOPS = { sent: new Set(), n: 0, max: 10, told: 0 };
function oopsDevice_() {
try {
let d = keep_.get('familyDevice');
if (!d) { d = 'D' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); if (!keep_.put('familyDevice', d)) return 'nostore'; }
return d;
} catch (e) { return 'nostore'; }
}
function oopsHtml_() {
return renderCard({ kind: 'oops', look: 'oops', tags: [{ text: 'This part did not load', colour: 0 }] });
}
function oops_(err, where, host, o) {
o = o || {};
if (err && typeof err === 'object') { if (err.__oops) return; try { err.__oops = true; } catch (e) { } }
const msg = String((err && err.message) || err || 'unknown').replace(/\x22[^\x22]*\x22|\x60[^\x60]*\x60|(^|[^\w])\x27[^\x27]*\x27(?=[^\w]|$)/g, (m0, pre) => (pre || '') + '[quoted]').replace(/\s+/g, ' ').slice(0, 300);
where = String(where || 'unknown').slice(0, 120);
try { console.error('[' + where + ']', err); } catch (e) { }
if (host && host.nodeType === 1) { try { host.innerHTML = oopsHtml_(); host.removeAttribute('aria-busy'); } catch (e) { } }
else if (o.toast && Date.now() - OOPS.told > 5000 && typeof toast === 'function') {
OOPS.told = Date.now();
try { toast(text_('something-went-wrong-there')); } catch (e) { }
}
const key = msg + '|' + where;
if (OOPS.sent.has(key) || OOPS.n >= OOPS.max || typeof API !== 'string' || typeof fetch !== 'function' || typeof backendFetch_ !== 'function') return;
OOPS.sent.add(key); OOPS.n++;
const body = { action: 'clientError', message: msg, where: where, version: typeof SITE_VERSION === 'string' ? SITE_VERSION : '',
screen: typeof AT === 'string' ? AT : '', device: oopsDevice_() };
try { backendFetch_(body, { quiet: true }); }
catch (e) { }
}
window.addEventListener('error', e => oops_(e && (e.error || e.message), 'onerror', null, { toast: true }));
window.addEventListener('unhandledrejection', e => oops_(e && e.reason, 'promise', null, { toast: true }));
const FIELD = { on: Math.random() < 0.1, longs: 0, longMs: 0, find: 0, t0: Date.now() };
function fieldDevice_() {
try {
const w = Math.min(screen.width || 0, screen.height || 0), mem = navigator.deviceMemory || 0, cpu = navigator.hardwareConcurrency || 0;
return (w && w < 600 ? 'phone' : w < 1000 ? 'tablet' : 'desk') + '-' + (mem ? mem + 'gb' : 'gb') + '-' + (cpu ? cpu + 'c' : 'c');
} catch (e) { return 'unknown'; }
}
function fieldRow_() {
const nav = (performance.getEntriesByType && performance.getEntriesByType('navigation')[0]) || {};
const r = (typeof USER !== 'undefined' && USER) ? String(USER.rank || USER.role || 'student').toLowerCase() : 'out';
return { version: typeof SITE_VERSION === 'string' ? SITE_VERSION : '', rank: r, device: fieldDevice_(),
load_ms: Math.round(nav.loadEventEnd || 0), find_ms: FIELD.find, long_tasks: FIELD.longs, long_ms: Math.round(FIELD.longMs),
heap_mb: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 104857.6) / 10 : '', errors: OOPS.n };
}
function fieldSend_(final) {
if (!FIELD.on || FIELD.sent || typeof API !== 'string' || typeof fetch !== 'function' || typeof backendFetch_ !== 'function') return;
FIELD.sent = true;
let q = [];
q = keep_.json('familyField', []);
q.push(fieldRow_());
if (q.length < 3 && !final) { if (!keep_.put('familyField', JSON.stringify(q.slice(-5)))) FIELD.lost = (FIELD.lost || 0) + 1; return; }
if (!keep_.del('familyField')) FIELD.lost = (FIELD.lost || 0) + 1;
try { backendFetch_({ action: 'healthLog', device: fieldDevice_(), rows: q.slice(-5) }, { quiet: true, keepalive: true }); }
catch (e) { FIELD.lost = (FIELD.lost || 0) + 1; }
}
if (FIELD.on) {
try { new window.PerformanceObserver(l => l.getEntries().forEach(e => { FIELD.longs++; FIELD.longMs += e.duration; })).observe({ type: 'longtask', buffered: true }); } catch (e) { FIELD.longs = -1; }
const look = setInterval(() => { try {
if (!FIELD.find && document.querySelector('#s-stuff [data-do="facet-pick"]')) FIELD.find = Date.now() - FIELD.t0;
if (FIELD.find || Date.now() - FIELD.t0 > 60000) { clearInterval(look); setTimeout(() => fieldSend_(false), 2000); }
} catch (e) { clearInterval(look); } }, 500);
try { addEventListener('pagehide', () => fieldSend_(true)); } catch (e) { FIELD.lost = (FIELD.lost || 0) + 1; }
}
function oopsTry_(where, fn, host) {
try { return fn(); } catch (err) { oops_(err, where, host); return undefined; }
}
const TIER_CORE_WIDGETS = [];
const TIER_LAZY_WIDGETS = ['console', 'wordgames', 'boardgames', 'pixel'];
const TIER_OFF_WIDGETS = [];
const TIER_CORE_KINDS = ['question', 'content', 'insert', 'practical', 'project', 'level'];
const tierCore_ = (what, id) => (what === 'kind' ? TIER_CORE_KINDS : TIER_CORE_WIDGETS).indexOf(String(id)) !== -1;
const TIER_RUN = { depth: 0 };
function tierRun_(where, fn, self, args, fallback, host) {
const W = typeof window !== 'undefined' ? window : null;
let keep = null;
if (W && !TIER_RUN.depth) {
keep = { t: W.setTimeout, i: W.setInterval, r: W.requestAnimationFrame };
const wrap = real => function (cb) {
const a = Array.prototype.slice.call(arguments);
if (typeof cb === 'function') a[0] = function () { return tierRun_(where, cb, this, arguments); };
return real.apply(W, a);
};
W.setTimeout = wrap(keep.t); W.setInterval = wrap(keep.i);
if (typeof keep.r === 'function') W.requestAnimationFrame = wrap(keep.r);
}
TIER_RUN.depth++;
try { return fn.apply(self, args || []); }
catch (err) { oops_(err, where, typeof host === 'function' ? host() : host); return typeof fallback === 'function' ? fallback(err) : fallback; }
finally {
TIER_RUN.depth--;
if (keep) { W.setTimeout = keep.t; W.setInterval = keep.i; if (typeof keep.r === 'function') W.requestAnimationFrame = keep.r; }
}
}
function tierOff_(w) {
['start', 'draw', 'stop'].forEach(k => { if (typeof w[k] === 'function') w[k] = () => (k === 'draw' ? false : undefined); });
Object.defineProperty(w, 'html', { configurable: true, enumerable: true, get() {
const say = typeof brand === 'function' ? brand('widgetOff', 'Coming soon') : 'Coming soon';
return cardBlock_({ type: 'group', tag: 'p', look: 'note widget-off', text: say });
} });
try { Object.defineProperty(w, '__tier', { value: 'off' }); } catch (e) { }
}
function tierGuardWidgets_(list) {
(Array.isArray(list) ? list : []).forEach(w => {
if (!w || typeof w !== 'object' || w.__tier || tierCore_('widget', w.id)) return;
if (TIER_OFF_WIDGETS.indexOf(String(w.id)) !== -1) return tierOff_(w);
const where = 'widget:' + w.id;
const slot = () => (w.into && typeof document !== 'undefined' ? document.getElementById(w.into) : null);
['start', 'draw', 'stop'].forEach(k => {
const f = w[k];
if (typeof f === 'function') w[k] = function () { return tierRun_(where, f, this, arguments, k === 'draw' ? false : undefined, k === 'start' ? slot : null); };
});
if (TIER_LAZY_WIDGETS.indexOf(String(w.id)) !== -1) tierLazy_(w, slot);
const d = Object.getOwnPropertyDescriptor(w, 'html');
if (d && typeof d.get === 'function') {
Object.defineProperty(w, 'html', { configurable: true, enumerable: d.enumerable, get() { return tierRun_(where, d.get, this, [], oopsHtml_); } });
}
try { Object.defineProperty(w, '__tier', { value: 'secondary' }); } catch (e) { }
});
return list;
}
function tierLazy_(w, slot) {
const ready = () => typeof lazyFiles_ !== 'function' || !!lazyFiles_.in;
const g = { start: w.start, draw: w.draw, stop: w.stop };
if (g.draw) w.draw = function () { return ready() ? g.draw.apply(this, arguments) : false; };
if (g.stop) w.stop = function () { return ready() ? g.stop.apply(this, arguments) : undefined; };
if (g.start) w.start = function () {
if (ready()) return g.start.apply(this, arguments);
const self = this, a = arguments, el = slot();
if (el && !el.firstChild) el.innerHTML = loading_();
lazyFiles_().then(() => { const s = slot(); if (s && s.isConnected) g.start.apply(self, a); });
return undefined;
};
}
document.documentElement.classList.add('flow');
const TABS = [
{ id: 'stuff', icon: '🔎', label: 'Find', title: 'Find' },
];
const settingGroupList_ = () => { let t = {}; try { t = (DATA && DATA.settingFor) || {}; } catch (e) { t = {}; }
return Object.keys(t).filter(k => /^type:/.test(k) && t[k].col).map(k => ({ id: t[k].col, label: t[k].label || '', admin: !!t[k].admin, cards: true, group: true })); };
const settingGroupOf_ = id => settingGroupList_().find(g => g.id === id) || null;
const TAB_HOME = 'stuff';
function screenMoved_() { try { return (DATA && DATA.columnsMoved) || {}; } catch (e) { return {}; } }
const AWAY_AGAIN = 6 * 60 * 1000;
const SCREENS = {};
function screen(id, draw) { SCREENS[id] = { draw }; }
let AT = TAB_HOME;
let KEPT_GONE = '';
try {
const kept = keep_.get('familyTab');
const was = kept;
const when = Number(keep_.get('familyTabAt') || 0);
if (was && TABS.some(t => t.id === was) && when && Date.now() - when < AWAY_AGAIN) AT = was;
else if (was && when && Date.now() - when < AWAY_AGAIN) KEPT_GONE = was;
} catch { }
function tabStampLeft_() {
if (keep_.get('familyTab') === AT) keep_.put('familyTabAt', String(Date.now()));
}
window.addEventListener('pagehide', tabStampLeft_);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') tabStampLeft_(); });
let PREV_AT = '';
function nothingHere(whenEmpty, needsLibrary) {
const asking = retrying_();
if (asking && !LIBRARY_FAILED) return loading_();
const why = (asking ? '' : LOAD_FAILED) || LIBRARY_FAILED;
if (why) {
return empty_('Couldn’t load.') + tileRow_(tile_({ icon: 'again', label: text_('try-again'), act: 'retry' }));
}
if (needsLibrary && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null) {
return loading_();
}
return empty_(whenEmpty);
}
function loading_() {
return cardBlock_({ type: 'group', look: 'loading', attrs: { role: 'status', 'aria-label': 'Loading' }, blocks: [{ type: 'group', tag: 'span' }] });
}
const SHAPE_KEY = 'arrival:shape', SHAPE_PAGES = 6;
const shapeWidth_ = () => { try { return 'n' + innerWidth; } catch (e) { return ''; } };
function shapeAll_() { return keep_.json(SHAPE_KEY, {}); }
function shapeOf_(id) { const w = shapeWidth_(), all = shapeAll_(), hs = all.at === w && all[id]; return Array.isArray(hs) && hs.some(h => h > 0) ? hs : null; }
function waitShape_(id) {
const hs = shapeOf_(id) || [0];
return hs.map(h => cardBlock_({ type: 'group', tag: 'section', look: 'page',
blocks: [{ type: 'group', look: 'pane', attrs: h ? { 'data-keep': true, style: '--keep-h:' + h + 'px' } : null, inner: loading_() }] })).join('');
}
function shapeHold_(el, id) {
const hs = shapeOf_(id);
if (!hs || !el || (LOADED && LATER_IN)) return;
el.querySelectorAll(':scope > .page > .pane').forEach((p, i) => {
if (hs[i] && p.querySelector(':scope > .loading:only-child')) { p.setAttribute('data-keep', ''); p.style.setProperty('--keep-h', hs[i] + 'px'); }
});
}
function shapeSave_() {
try {
const w = shapeWidth_(), old = shapeAll_(), out = { at: w };
TABS.forEach(t => {
const el = $('s-' + t.id);
const panes = el ? [].slice.call(el.querySelectorAll(':scope > .page > .pane'), 0, SHAPE_PAGES) : [];
const was = (old.at === w && old[t.id]) || [];
const hs = panes.map((p, i) => (p.querySelector(':scope > .loading:only-child') ? (was[i] || 0) : Math.round(p.getBoundingClientRect().height)));
if (hs.some(h => h > 0)) out[t.id] = hs;
});
keepPut_(SHAPE_KEY, JSON.stringify(out), true);
} catch (e) { }
}
function waiting_(el) {
if (!el || !el.setAttribute) return;
el.setAttribute('aria-busy', 'true');
el.insertAdjacentHTML('afterbegin', loading_());
}
function loaded_(el) {
if (!el || !el.removeAttribute) return;
el.removeAttribute('aria-busy');
const dots = el.querySelectorAll(':scope > .loading');
if (!dots.length) return;
dots.forEach(l => l.remove());
[].forEach.call(el.children, arrive_);
}
function arrive_(el) {
if (!el || !el.classList || el.classList.contains('loading') || el.classList.contains('arrive')) return;
el.classList.add('arrive');
setTimeout(() => el.classList.remove('arrive'), 700);
}
function arriveWatch_() {
if (typeof MutationObserver !== 'function' || !document.body) return;
new MutationObserver(ms => {
const t = performance.now();
ms.forEach(m => {
let was = false;
m.removedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('loading')) was = true; });
let words = false;
m.addedNodes.forEach(n => {
if (n.nodeType === 3 && was && n.textContent.trim()) words = true;
if (n.nodeType !== 1) return;
if (was && !m.target.classList.contains('pane')) arrive_(n);
if (n.tagName === 'IMG') n.arriveT = t;
else if (n.firstElementChild) n.querySelectorAll('img').forEach(i => { i.arriveT = t; });
});
if (was && m.target.classList.contains('pane') && !m.target.querySelector(':scope > .loading')) arrive_(m.target);
else if (words && !m.target.classList.contains('screen')) arrive_(m.target);
});
}).observe(document.body, { childList: true, subtree: true });
document.addEventListener('load', e => {
const i = e.target;
if (i && i.tagName === 'IMG' && i.arriveT && performance.now() - i.arriveT > 80) arrive_(i);
}, true);
}
if (document.body) arriveWatch_(); else document.addEventListener('DOMContentLoaded', arriveWatch_);
function arrivePages_(el, was) {
if (!was) return;
const pages = el.querySelectorAll(':scope > .page > .pane');
was.forEach((html, i) => {
const pane = pages[i];
if (!pane) return;
if (html === null) { if (!pane.querySelector(':scope > .loading')) arrive_(pane); return; }
[].forEach.call(pane.children, card => {
if (slotIn_(card) || html.indexOf(card.outerHTML) !== -1) return;
if (!card.children.length) { arrive_(card); return; }
[].forEach.call(card.children, k => { if (!slotIn_(k) && html.indexOf(k.outerHTML) === -1) arrive_(k); });
});
});
}
const slotIn_ = el => el.classList.contains('widget-slot') || !!el.querySelector('.widget-slot');
function waitingPages_(el) {
if (!el.querySelector('.loading')) return null;
const was = new Map();
el.querySelectorAll(':scope > .page > .pane').forEach((pane, i) => {
if (!pane.querySelector('.loading')) return;
was.set(i, pane.querySelector(':scope > .loading:only-child') ? null : pane.innerHTML);
});
return was.size ? was : null;
}
function retrying_() {
try { return !!LOAD_FAILED && typeof reconnecting_ === 'function' && reconnecting_(); }
catch (e) { return false; }
}
function awaiting_() {
try {
if (!LOADED) return true;
return retrying_() && !RECONNECT.shown;
} catch (e) { return typeof LOADED !== 'undefined' && !LOADED; }
}
;
/* js/shell-go.js */
function go(id, remember, instant) {
if (!TABS.some(t => t.id === id) && typeof oldBranch_ === 'function' && oldBranch_(id)) return;
const tab = TABS.find(t => t.id === id)
|| TABS.find(t => t.id === TAB_HOME)
|| TABS[0];
const was = AT;
AT = tab.id;
if (was && was !== AT) PREV_AT = was;
if (remember !== false) {
try {
keep_.put('familyTab', AT);
keep_.put('familyTabAt', String(Date.now()));
} catch { }
}
const from = TABS.findIndex(t => t.id === was), to = TABS.findIndex(t => t.id === AT);
const way = (was && was !== AT) ? (to > from ? 1 : -1) : 0;
if (way) AHEAD.dir.x = way;
oopsTry_('go:glass', bootGlass_);
oopsTry_('go:neighbours', paintNeighbours);
oopsTry_('go:place', () => placeCells('x', instant));
const painted = !screenHasMarkup_(AT) || !!STALE[AT];
if (painted) oopsTry_('go:paint:' + AT, () => paint(AT));
if (was !== AT && typeof widgetsBeforeSlide_ === 'function') oopsTry_('go:beforeSlide', () => widgetsBeforeSlide_(AT));
if (typeof window.camStop_ === 'function' && typeof window.camOn_ === 'function' && window.camOn_()) window.camStop_(false, true);
if (typeof window.reelsStop_ === 'function') window.reelsStop_();
if (was !== AT && typeof pinHideAll_ === 'function') pinHideAll_();
if (was !== AT || painted) afterSlide_(() => startScreen_(AT, true), 'start');
aheadKick_(AHEAD_QUIET);
const finder = typeof finderOf_ === 'function' ? finderOf_(AT) : null;
if (finder) {
const host = $('s-' + finder.id);
const drawn = host && host.querySelector('.page[data-filled]');
if (instant || !drawn) oopsTry_('go:fill:' + finder.id, () => finderSoon_(finder, fillStuffPages));
else afterSlide_(() => finderSoon_(finder, fillStuffPages), 'fill:' + finder.id);
}
oopsTry_('go:pager', () => paintPager(AT, instant));
oopsTry_('go:flow', () => { topbarPaint_(); if (was && was !== AT) $('s-' + AT).scrollIntoView({ block: 'start' }); });
}
const SCREEN_HOOKS = {
biz: { started: [() => typeof window.bizStart_ === 'function' && window.bizStart_()] },
};
function startScreen_(id, arriving) {
if (typeof reconnectKeep_ === 'function' && reconnectKeep_(id)) return;
if (typeof padHold_ === 'function' && padHold_(id)) return;
if (!arriving && ['saved', 'stuff'].indexOf(id) !== -1 && typeof settingsKeep_ === 'function' && settingsKeep_(id)) return;
const H = SCREEN_HOOKS[id] || {};
if (H.start && H.start(arriving)) { }
else if (typeof WIDGET_COLS !== 'undefined' && WIDGET_COLS.indexOf(id) !== -1 && typeof widgetsWake_ === 'function') {
const ws = widgetsOn_(id);
if (ws.length) { widgetsWake_(ws, id, arriving); if (id === AT) placeCells('y', true, 0, id); }
}
if (H.regrow && id === AT) placeCells('y', true, 0, id);
(H.started || []).forEach(f => f());
}
function bootGlass_() {
if (!PRE_PAYLOAD.size || typeof GLASS === 'undefined') return;
const ti = TABS.findIndex(t => t.id === AT);
if (ti < 0) return;
const k = 1;
TABS.forEach((t, i) => {
if (t.id === AT || Math.abs(i - ti) > k || !PRE_PAYLOAD.has(t.id) || !STALE[t.id]) return;
paint(t.id);
if (!STALE[t.id] && PAGER[t.id]) paintPager(t.id, true);
});
}
function screenHasMarkup_(id) {
const el = document.getElementById('s-' + id);
return !!(el && el.firstElementChild);
}
function paintNeighbours() {
TABS.forEach((t, i) => {
const id = t.id;
if (id === AT) return;
const el = $('s-' + id);
if (!el || el.firstChild) return;
paint(id);
if (PAGER[id]) paintPager(id, true);
});
}
let STALE = {};
let ACT_EPOCH = 0;
let DRAW_EPOCH = 0;
function markStale_(ids) {
[].concat(ids).forEach(id => { if (id) STALE[id] = 1; });
if (typeof aheadKick_ === 'function') aheadKick_();
}
let REPAINT_MARK = 1;
const PRE_PAYLOAD = new Set();
const PAINT_N = {};
function placeKeep_(el) {
const out = [];
el.querySelectorAll('*').forEach(n => {
if (!n.scrollTop && !n.scrollLeft) return;
const path = [];
for (let x = n; x && x !== el; x = x.parentElement) path.unshift([...x.parentElement.children].indexOf(x) + ':' + x.tagName);
out.push({ path: path, top: n.scrollTop, left: n.scrollLeft });
});
const f = document.activeElement;
return { boxes: out, focus: f && f.id && el.contains(f) ? f.id : '' };
}
function placeBack_(el, kept) {
kept.boxes.forEach(k => {
let n = el;
for (const step of k.path) {
const [i, tag] = step.split(':');
n = n && n.children[+i];
if (!n || n.tagName !== tag) return;
}
n.scrollTop = k.top; n.scrollLeft = k.left;
});
if (kept.focus) { const f = document.getElementById(kept.focus); if (f && el.contains(f)) try { f.focus({ preventScroll: true }); } catch (e) { } }
}
function paint(id, fresh, o) {
if (typeof settingsKeep_ === 'function' && settingsKeep_(id)) { STALE[id] = 1; return; }
if (typeof findKeep_ === 'function' && findKeep_(id)) { STALE[id] = 1; return; }
if (typeof reconnectKeep_ === 'function' && reconnectKeep_(id)) { STALE[id] = 1; return; }
if (typeof padHold_ === 'function' && padHold_(id)) { STALE[id] = 1; return; }
const mark = STALE[id];
delete STALE[id];
const pre = PRE_PAYLOAD.has(id);
$('s-' + id)?.classList.toggle('paged', !!PAGER[id]);
const el = $('s-' + id);
const s = SCREENS[id];
if (!el) return;
let html;
try {
html = s ? s.draw() : (filesIn_() ? null : waitShape_(id));
} catch (err) {
if (!filesIn_() && err instanceof ReferenceError) { el.innerHTML = waitShape_(id); STALE[id] = 1; return; }
oops_(err, 'draw:' + id);
el.innerHTML = cardBlock_({ type: 'group', look: 'pane', inner: renderCard({ kind: 'oops', look: 'draw-oops', tags: [{ text: 'This screen did not draw', colour: 0 }] }) });
return;
}
const want = (o && o.land && mark !== 1) ? 'maybe' : mark;
if (want === 'maybe' && !fresh && html !== null && !PRE_PAYLOAD.has(id)
&& !(typeof finderOf_ === 'function' && finderOf_(id))
&& el.DRAWN && el.DRAWN.html === html && el.DRAWN.epoch === ACT_EPOCH && el.firstElementChild) {
if (typeof widgetsReveil_ === 'function') widgetsReveil_(id, false);
return 'kept';
}
const held = !fresh && typeof widgetsHeld_ === 'function' ? widgetsHeld_(id, pre) : [];
const waited = waitingPages_(el);
const kept = pre ? null : placeKeep_(el);
el.innerHTML = html !== null
? html
: empty_();
el.DRAWN = { html: html, epoch: ACT_EPOCH };
PRE_PAYLOAD.delete(id);
PAINT_N[id] = (PAINT_N[id] || 0) + 1;
if (held.length) {
const left = widgetsBack_(id, held);
if (typeof finderOf_ === 'function' && finderOf_(id)) WIDGET_HELD[id] = left;
}
shapeHold_(el, id);
arrivePages_(el, waited);
if (kept) placeBack_(el, kept);
el.PG_SIG = null;
if (typeof PLACED_ONCE !== 'undefined' && PLACED_ONCE && !(o && o.ahead)) {
placeCells('y', true, 0, id);
}
if (typeof afterSlide_ === 'function' && typeof paneWatch_ === 'function' && !(o && o.ahead)) {
afterSlide_(() => paneWatch_($('s-' + id)), 'panes:' + id);
}
}
;
/* js/shell-layout.js */
const repaint = (instant) => {
const who = typeof widgetWho_ === 'function' ? widgetWho_() : '';
if (REPAINT_WHO !== null && who !== REPAINT_WHO) {
ACT_EPOCH++;
if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => widgetsReveil_(c, true));
}
REPAINT_WHO = who;
DRAW_EPOCH++;
TABS.forEach(t => { if (t.id !== AT) STALE[t.id] = STALE[t.id] === 1 ? 1 : REPAINT_MARK; });
if (typeof widgetsReveil_ === 'function') WIDGET_COLS.forEach(c => { if (c !== AT && STALE[c]) widgetsReveil_(c, false); });
const land = REPAINT_MARK === 'maybe' && !(typeof WIDGET_COLS !== 'undefined' && WIDGET_COLS.indexOf(AT) !== -1)
&& !(typeof finderOf_ === 'function' && finderOf_(AT));
const kept = paint(AT, !land, land ? { land: true } : undefined) === 'kept';
if (!kept && typeof startScreen_ === 'function') startScreen_(AT);
paintNeighbours();
paintPager(AT, true);
placeCells('x', instant !== false);
if (typeof aheadKick_ === 'function') aheadKick_();
};
let REPAINT_WHO = null;
const glassRows_ = () => 2;
let GLASS = { at: null, cols: [], pages: [] };
function placeGrid() { return flowPlace_(); }
;
/* js/shell-pages.js */
function pageWrite_(el, st) {
const was = el.PG;
if (!was) { el.style.position = 'static'; el.style.transform = 'none'; }
if (!was || was.on !== st.on) {
el.classList.toggle('on', st.on);
el.style.pointerEvents = 'auto';
el.inert = false;
}
if (!was || was.op !== st.op) el.style.opacity = st.op;
if (!was || was.vis !== st.vis) el.style.visibility = st.vis;
el.PG = st;
}
const flowHome_ = () => (TABS.some(t => t.id === FIND_HOME_) ? FIND_HOME_ : AT);
function flowPlace_() {
topbarPaint_();
const home = flowHome_();
TABS.forEach(t => {
const host = $('s-' + t.id);
if (!host) return;
if (host.style.cssText) host.style.cssText = '';
host.classList.toggle('hidden', t.id !== AT && t.id !== home);
host.classList.toggle('is-front', t.id === AT);
host.PLACED_P = PAGE[t.id] || 0;
host.querySelectorAll(':scope > .page').forEach((el, pos) => pageWrite_(el,
{ on: logIndex_(t.id, pos) === (PAGE[t.id] || 0), op: '1', vis: 'visible' }));
});
const front = $('s-' + AT);
GLASS = { at: AT, cols: [AT], pages: front ? [...front.querySelectorAll(':scope > .page.on')] : [], reach: 0 };
}
let FLOW_FRAME = 0, FLOW_TURNING = false;
function flowScrolled_() {
FLOW_FRAME = 0;
const id = flowHome_(), host = $('s-' + id);
if (!host || host.classList.contains('hidden') || !PAGER[id]) return;
const pages = host.querySelectorAll(':scope > .page'), line = innerHeight / 4;
let at = -1;
for (let pos = 0; pos < pages.length && at < 0; pos++) {
const r = pages[pos].getBoundingClientRect();
if (r.height && r.bottom > line) at = pos;
}
if (at < 0) return;
FLOW_TURNING = true;
try { if (logIndex_(id, at) !== (PAGE[id] || 0)) goPage(id, logIndex_(id, at)); } finally { FLOW_TURNING = false; }
if (typeof flowMore_ === 'function' && document.documentElement.scrollHeight - window.scrollY - innerHeight < innerHeight) flowMore_(id);
}
addEventListener('scroll', () => { if (!FLOW_FRAME) FLOW_FRAME = requestAnimationFrame(flowScrolled_); }, { passive: true });
function flowShow_(id, n) {
if (FLOW_TURNING) return;
afterSlide_(() => {
const host = $('s-' + id), el = host && host.querySelectorAll(':scope > .page')[domIndex_(id, n)];
if (el && (PAGE[id] || 0) === n) el.scrollIntoView({ block: 'start' });
}, 'flow-show');
}
function topbarPaint_() {
const mark = document.querySelector('#topbar > .logo'), name = brand('name', '@family.');
if (mark && mark.textContent !== name) mark.textContent = name;
}
let PLACE_WANT = null;
let PLACED_ONCE = false;
let PLACE_FRAME = 0;
function placeCells(which, instant, dragPx, id) {
if (dragPx) return placeNow_(which, instant, dragPx, id);
if (typeof readAloudStray_ === 'function') readAloudStray_();
if (typeof qLockStray_ === 'function') qLockStray_();
if (typeof magStray_ === 'function') magStray_();
if (typeof gameLockStray_ === 'function') gameLockStray_();
if (!PLACED_ONCE) { PLACED_ONCE = true; return placeNow_(which, instant, 0, id); }
if (!PLACE_WANT) {
PLACE_WANT = { which, instant: !!instant, id };
} else {
PLACE_WANT.instant = PLACE_WANT.instant && !!instant;
if (which) PLACE_WANT.which = which;
if (id !== undefined) PLACE_WANT.id = id;
}
if (PLACE_FRAME) return;
PLACE_FRAME = requestAnimationFrame(() => {
PLACE_FRAME = 0;
const w = PLACE_WANT;
PLACE_WANT = null;
if (w) placeNow_(w.which, w.instant, 0, w.id);
});
}
function placeNow_(which, instant, dragPx, id) {
placeGrid(instant, dragPx ? { which, px: dragPx } : null);
if (dragPx) return;
if (typeof widgetsGlass_ === 'function') widgetsGlass_();
if (typeof paneWatch_ === 'function') paneWatch_($('s-' + AT));
if (typeof window.picsAhead_ === 'function') window.picsAhead_(AT);
const mine = TABS.map(t => $('s-' + t.id));
document.querySelectorAll('#screen > .screen').forEach(el => {
if (mine.indexOf(el) === -1) {
el.style.display = 'none';
el.classList.add('hidden');
}
});
}
const PAGER = {
stuff: () => (typeof finderPageCount_ === 'function' ? finderPageCount_('stuff') : 1),
};
function pagerNames(id) {
const v = PAGER[id];
return typeof v === 'function' ? v() : (v || []);
}
const PAGE_HOME = {
};
function applyBrandIcon_() {
[['favicon', 'favicon.png?v=1106'], ['favicon-ios', 'icon.png?v=1106']].forEach(([id, file]) => {
const el = document.getElementById(id);
if (el && el.getAttribute('href') !== file) el.setAttribute('href', file);
});
}
const PAGE = { feed: 0, stuff: 0, reel: 0, make: 0,
saved: 0, tutors: 0, students: 0, parents: 0, spotlight: 0, shop: 0, res: 0 };
const PAGE_KEEP = {};
const PAGE_LO = {};
const domIndex_ = (id, i) => {
const keep = PAGE_KEEP[id] || 0;
if (i < keep) return i;
const d = i - (PAGE_LO[id] || 0);
return d < keep ? -1 : d;
};
const logIndex_ = (id, p) => (p < (PAGE_KEEP[id] || 0) ? p : p + (PAGE_LO[id] || 0));
const PAGE_OPENED = {};
function pageHome_(id) {
if (PAGE_OPENED[id]) return;
const home = PAGE_HOME[id];
if (!home) { PAGE_OPENED[id] = true; return; }
if (pageCount(id) < 2) return;
if (!LOADED) return;
PAGE_OPENED[id] = true;
const n = home();
PAGE[id] = Math.max(0, Math.min(n, Math.max(0, pageCount(id) - 1)));
}
let COUNT_HOLD = null;
const COUNT_MEMO = new Map();
const pageCount = id => {
if (COUNT_HOLD && COUNT_HOLD.has(id)) return COUNT_HOLD.get(id);
const host = typeof finderOf_ === 'function' && finderOf_(id) ? null : document.getElementById('s-' + id);
const k = host && host.firstElementChild;
const m = k ? COUNT_MEMO.get(id) : null;
let n;
if (m && m.k === k && m.len === host.childElementCount) n = m.n;
else {
const v = pagerNames(id);
n = typeof v === 'number' ? Math.max(0, v | 0) : v.length;
if (k) COUNT_MEMO.set(id, { k: k, len: host.childElementCount, n: n });
}
if (COUNT_HOLD) COUNT_HOLD.set(id, n);
return n;
};
let AFTER_SLIDE = null;
const AFTER_SLIDE_JOBS = new Map();
let AFTER_SLIDE_HELD = 0;
function afterSlide_(fn, key) {
AFTER_SLIDE_JOBS.set(key || fn, fn);
if (AFTER_SLIDE) clearTimeout(AFTER_SLIDE);
AFTER_SLIDE = setTimeout(function run() {
const now = performance.now();
AFTER_SLIDE_HELD = 0;
const wait = 0;
if (wait) { AFTER_SLIDE = setTimeout(run, wait); return; }
AFTER_SLIDE_HELD = 0;
const jobs = [...AFTER_SLIDE_JOBS.values()];
AFTER_SLIDE_JOBS.clear();
const mark = {};
AFTER_SLIDE = mark;
const next = () => {
const f = jobs.shift();
if (f) oopsTry_('afterSlide', f);
if (jobs.length) { setTimeout(next, 0); return; }
if (AFTER_SLIDE === mark) AFTER_SLIDE = null;
if (typeof aheadKick_ === 'function') aheadKick_();
};
next();
}, 0);
}
const AHEAD = { open: false, pre: false, opened: 0, input: 0, booked: 0, timer: 0, dir: { x: 0, y: {} }, stuck: new Set(), running: false };
const AHEAD_SLOW = new Set();
const AHEAD_QUIET = 400, AHEAD_QUIET_SLOW = 1000, AHEAD_SLOW_MS = 150;
const AHEAD_SLOW_KEY = 'familyAheadSlow';
try { (JSON.parse(keep_.get(AHEAD_SLOW_KEY) || '[]') || []).forEach(k => { if (typeof k === 'string') AHEAD_SLOW.add(k); }); } catch (e) { }
function aheadSlowKeep_() {
keep_.put(AHEAD_SLOW_KEY, JSON.stringify([...AHEAD_SLOW].filter(k => /^(paint|widget):/.test(k))));
}
window.__aheadLog = [];
['pointerdown', 'pointermove', 'wheel', 'keydown'].forEach(t =>
addEventListener(t, () => { AHEAD.input = performance.now(); }, { capture: true, passive: true }));
addEventListener('pointerup', () => { AHEAD.input = performance.now(); aheadKick_(AHEAD_QUIET); }, { capture: true, passive: true });
document.addEventListener('focusout', () => { AHEAD.stuck.clear(); aheadKick_(AHEAD_QUIET); });
document.addEventListener('visibilitychange', () => { if (!document.hidden) aheadKick_(); });
function aheadOpen_() {
const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f => setTimeout(f, 16));
raf(() => raf(() => { AHEAD.open = true; AHEAD.opened = performance.now(); AHEAD.input = Math.max(AHEAD.input, AHEAD.opened); aheadKick_(); }));
}
function aheadPreOpen_() {
try { if (navigator.connection && navigator.connection.saveData) return; } catch (e) { }
const raf = typeof requestAnimationFrame === 'function' ? requestAnimationFrame : (f => setTimeout(f, 16));
raf(() => raf(() => { if (AHEAD.open) return; AHEAD.pre = true; AHEAD.input = Math.max(AHEAD.input, performance.now()); aheadKick_(); }));
}
function aheadGate_() {
if (!(AHEAD.open || AHEAD.pre) || document.hidden || window.__aheadHold) return -1;
const now = performance.now();
if (GLASS.at !== AT || PLACE_FRAME) return 50;
if (AFTER_SLIDE || AFTER_SLIDE_JOBS.size || (typeof TOOLS_WAIT !== 'undefined' && TOOLS_WAIT.length)) return 150;
const a = document.activeElement;
if (a && a.matches && a.matches(TYPING_)) return -1;
if (typeof PAD_GO !== 'undefined' && PAD_GO) return -1;
if (inputWaiting_()) return 50;
return 0;
}
function inputWaiting_() {
try { return !!(navigator.scheduling && navigator.scheduling.isInputPending && navigator.scheduling.isInputPending({ includeContinuous: true })); }
catch (e) { return false; }
}
function aheadKick_(ms) {
if (AHEAD.timer || AHEAD.booked) return;
AHEAD.timer = setTimeout(aheadCheck_, ms == null ? 30 : Math.max(16, ms));
}
function aheadCheck_() {
AHEAD.timer = 0;
if (AHEAD.booked) return;
const g = aheadGate_();
if (g < 0) return;
if (g > 0) { AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, Math.max(16, g))); return; }
const quiet = performance.now() - AHEAD.input;
if (quiet < AHEAD_QUIET) { AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, AHEAD_QUIET - quiet + 5)); return; }
const pick = aheadPick_(quiet >= AHEAD_QUIET_SLOW);
if (!pick.job) {
if (pick.slow) AHEAD.timer = setTimeout(aheadCheck_, Math.min(200, AHEAD_QUIET_SLOW - quiet + 5));
return;
}
AHEAD.booked = 1;
if (typeof requestIdleCallback === 'function') requestIdleCallback(aheadSlice_);
else setTimeout(aheadSlice_, 60);
}
function aheadSlice_() {
AHEAD.booked = 0;
const g = aheadGate_();
const quiet = performance.now() - AHEAD.input;
if (g !== 0 || quiet < AHEAD_QUIET) { aheadKick_(g > 0 ? g : AHEAD_QUIET - quiet); return; }
const job = aheadPick_(quiet >= AHEAD_QUIET_SLOW).job;
if (!job) { aheadKick_(AHEAD_QUIET_SLOW - quiet); return; }
const t0 = performance.now();
AHEAD.running = job.key || true;
let left = false;
try { left = job.run() === false; }
catch (e) { left = true; try { console.warn('[ahead]', job.key, e); } catch (x) { oops_(x, 'shell:aheadSlice_') } }
finally { AHEAD.running = false; }
const ms = performance.now() - t0;
const was = AHEAD_SLOW.has(job.key);
if (ms > AHEAD_SLOW_MS) AHEAD_SLOW.add(job.key); else AHEAD_SLOW.delete(job.key);
if (was !== AHEAD_SLOW.has(job.key) && /^(paint|widget):/.test(job.key)) aheadSlowKeep_();
if (left || aheadStill_(job)) AHEAD.stuck.add(job.key);
const log = window.__aheadLog;
log.push({ key: job.key, ms: Math.round(ms * 10) / 10, t: Math.round(t0), quiet: Math.round(quiet),
after: !!(AFTER_SLIDE || AFTER_SLIDE_JOBS.size) });
if (log.length > 200) log.splice(0, log.length - 200);
aheadKick_(0);
}
function aheadStill_(job) {
try { return aheadJobs_(true).some(j => j.key === job.key); } catch (e) { return false; }
}
const AHEAD_KINDS = [];
const AHEAD_RANK = ['paint', 'fill', 'widget', 'pics', 'reels', 'centre', 'bible'];
function aheadJobs_(all) {
const out = [];
AHEAD_KINDS.forEach(k => { try { (k() || []).forEach(j => { if (AHEAD.open || j.pre) out.push(j); }); } catch (e) { } });
return all ? out : out.filter(j => !AHEAD.stuck.has(j.key));
}
function aheadDist_(id, page) {
const ti = TABS.findIndex(t => t.id === AT), ci = TABS.findIndex(t => t.id === id);
if (ci < 0 || ti < 0) return Infinity;
const dc = ci - ti;
let d = Math.abs(dc);
if (dc && AHEAD.dir.x && Math.sign(dc) === AHEAD.dir.x) d -= 0.5;
if (page != null) {
const dp = page - (PAGE[id] || 0);
d += Math.abs(dp);
const dy = AHEAD.dir.y[id] || 0;
if (dp && dy && Math.sign(dp) === dy) d -= 0.5;
}
return d;
}
function aheadPick_(slowOk) {
let best = null, slow = false;
aheadJobs_(false).forEach(j => {
if ((AHEAD_SLOW.has(j.key) || j.cold) && !slowOk) { slow = true; return; }
if (!best || j.d < best.d - 1e-9
|| (Math.abs(j.d - best.d) < 1e-9 && AHEAD_RANK.indexOf(j.kind) < AHEAD_RANK.indexOf(best.kind))) best = j;
});
return { job: best, slow: slow };
}
AHEAD_KINDS.push(() => TABS.filter(t => t.id !== AT && STALE[t.id] && $('s-' + t.id)).map(t => ({
key: 'paint:' + t.id, kind: 'paint', d: aheadDist_(t.id, null),
cold: PRE_PAYLOAD.has(t.id),
run: () => aheadPaint_(t.id),
})));
function aheadPaint_(id) {
const host = $('s-' + id);
if (!host || id === AT) return;
paint(id, false, { ahead: true });
if (STALE[id]) return false;
PRE_PAYLOAD.delete(id);
if (PAGER[id] && host.querySelector(':scope > .page')) {
pageHome_(id);
PAGE[id] = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
}
const F = typeof finderOf_ === 'function' ? finderOf_(id) : null;
if (F && typeof stuffOnGlass_ === 'function' && stuffOnGlass_(id)) {
try { finderSoon_(F, () => { if ($(id + '-controls')) stuffBandFill_(); }); } catch (e) { }
}
if (typeof paneWatch_ === 'function') paneWatch_(host);
drawnScreen_(id);
}
function drawnScreen_(id) {
const H = SCREEN_HOOKS[id] || {};
if (H.drawn) H.drawn();
}
function paintPager(id, instant) {
if (!PAGER[id]) return;
const host = $('s-' + id);
if (!host || !host.querySelector(':scope > .page')) return;
pageHome_(id);
const n = Math.max(0, Math.min(pageCount(id) - 1, PAGE[id] || 0));
PAGE[id] = n;
placeCells('y', instant, 0, id);
}
function goPage(id, to, instant) {
if (!PAGER[id]) return;
const F = typeof finderOf_ === 'function' ? finderOf_(id) : null;
return finderSoon_(F, () => goPageHere_(id, to, instant, F));
}
function goPageHere_(id, to, instant, F) {
const n = Math.max(0, Math.min(pageCount(id) - 1, to));
const was = PAGE[id] || 0;
if (n === was && !instant) return;
PAGE[id] = n;
if (n !== was) AHEAD.dir.y[id] = n > was ? 1 : -1;
aheadKick_(AHEAD_QUIET);
if (F && typeof stuffWindow_ === 'function') { try { stuffWindow_(); } catch (e) { oops_(e, 'shell:goPage') } }
const bare = !!F && n > 0 && (() => {
const host = $('s-' + id);
const el = host && host.querySelectorAll(':scope > .page')[domIndex_(id, n)];
return !el || el.dataset.filled !== '1';
})();
const edge = !!F && n !== was && Math.abs(n - was) <= glassRows_() && typeof stuffEdgeFill_ === 'function';
const above = !!F && (bare || (edge && n < was));
const ref = above && $('s-' + id) ? $('s-' + id).querySelectorAll(':scope > .page')[domIndex_(id, n)] : null;
const top0 = ref ? (typeof stuffTop_ === 'function' ? stuffTop_(ref) : ref.offsetTop) : 0;
if (bare) fillStuffPages();
else if (F && typeof libAhead_ === 'function') { try { libAhead_(); } catch (e) { oops_(e, 'shell:goPage') } }
if (edge) { try { stuffEdgeFill_(n, n > was ? 1 : -1); } catch (e) { oops_(e, 'shell:goPage') } }
if (ref && typeof stuffKeepPlace_ === 'function') stuffKeepPlace_($('s-' + id), top0 - (typeof stuffTop_ === 'function' ? stuffTop_(ref) : ref.offsetTop));
if (typeof widgetsNear_ === 'function') widgetsNear_(id);
const H = SCREEN_HOOKS[id] || {};
if (H.paged) H.paged(n);
if (id === AT) placeCells('y', instant);
if (F && !bare) afterSlide_(() => finderSoon_(F, fillStuffPages), 'fill:' + id);
if (H.slid) H.slid(n);
paintPager(id);
flowShow_(id, n);
}
;
/* js/shell-click.js */
const CAN_HOVER_ = '(hover: hover) and (pointer: fine)', COARSE_ = '(pointer: coarse)';
function adoptMarks_() {
try { if (typeof adoptFavourites_ === 'function') adoptFavourites_(); } catch (e) { oops_(e, 'shell:adoptMarks_') }
try { if (typeof subAdopt_ === 'function') subAdopt_(); } catch (e) { oops_(e, 'shell:adoptMarks_') }
try { if (typeof answersPull_ === 'function') answersPull_(); } catch (e) { oops_(e, 'shell:adoptMarks_') }
}
const rowsOne_ = c => (typeof tileRowsJoin_ === 'function' ? tileRowsJoin_(c) : c);
const pages = (id, cards) =>
cards.map(c => cardBlock_({ type: 'group', tag: 'section', look: 'page', blocks: [{ type: 'group', look: 'pane', inner: rowsOne_(c) }] })).join('');
const emptyCard_ = (title, card) => {
const t = String(title || ''), s = typeof suggestOpts_ === 'function' ? suggestOpts_('widget', 'empty:' + t.toLowerCase().replace(/[^a-z0-9]+/g, '-'), t) : null;
return renderCard({ kind: 'empty', card: card || '', look: 'is-empty', tags: [{ text: t, colour: 0 }], tiles: [].concat(s || []) });
};
const stack = (id, cards) =>
cardBlock_({ type: 'group', tag: 'section', look: 'page', blocks: [{ type: 'group', look: 'pane', inner: rowsOne_(cards.join('')) }] });
function paneOf_(el) {
if (!el) return null;
const found = el.querySelector(':scope > .pane');
if (found) return found;
const pane = document.createElement('div');
pane.className = 'pane';
el.appendChild(pane);
return pane;
}
let sheetOnClose = null;
let sheetStep = null;
let PRESSED_ = null;
['pointerdown', 'click', 'keydown'].forEach(t => addEventListener(t, e => {
const el = e.target;
if (el && el.closest && !el.closest('#sheet') && el.closest('#screen')) PRESSED_ = el;
}, true));
let SHEET_HERE_ = null;
const SHEET_HOSTS_ = '.post, .rc, .widget-slot, .cpn, .card, .pane';
let SHEET_EL_ = null, SHEET_AT_ = null;
const sheetEl_ = () => SHEET_EL_ || (SHEET_EL_ = document.getElementById('sheet'));
const sheetFront_ = () => {
const pg = document.querySelector('#s-' + AT + ' .page.on') || document.querySelector('#s-' + AT);
return pg && (pg.querySelector(':scope > .pane') || pg);
};
function sheetWhere_() {
const want = SHEET_HERE_; SHEET_HERE_ = null;
let from = want ? want.el : PRESSED_;
if (from && (!from.isConnected || !from.closest('#s-' + AT))) from = null;
let host = from && from.closest(SHEET_HOSTS_);
if (!host) host = sheetFront_();
const swap = !!(want && want.swap);
if (want && want.beside && host) return { host, after: host, swap: false };
const row = host && from && from.closest('.tile-row, .post-acts, .post-when');
const after = !swap && row && host.contains(row) && row !== host ? row : null;
return { host, after, swap };
}
function sheetPlace_(where) {
const sh = sheetEl_();
const w = where || sheetWhere_();
document.querySelectorAll('.sheet-host').forEach(h => h.classList.remove('sheet-host', 'sheet-swap'));
SHEET_AT_ = { post: w.host && w.host.dataset ? w.host.dataset.post || '' : '', swap: w.swap };
if (!w.host) return;
if (w.after) w.after.after(sh); else w.host.appendChild(sh);
w.host.classList.add('sheet-host');
if (w.swap) w.host.classList.add('sheet-swap');
}
function sheetKeep_() {
const sh = sheetEl_();
if (!sh || sh.classList.contains('hidden')) return;
if (sh.isConnected && sh.closest('#screen')) return;
const at = SHEET_AT_ || {};
const host = (at.post && document.querySelector('#s-' + AT + ' [data-post="' + CSS.escape(at.post) + '"]')) || sheetFront_();
if (!host) { if (!sh.isConnected && $('sheet-home')) $('sheet-home').after(sh); return; }
host.appendChild(sh);
host.classList.add('sheet-host');
if (at.swap) host.classList.add('sheet-swap');
}
try {
new MutationObserver(sheetKeep_).observe(document.documentElement, { childList: true, subtree: true });
} catch (err) { }
function sheetShow_(title, html, onClose, step) {
if (sheetOnClose) { const f = sheetOnClose; sheetOnClose = null; try { f(); } catch (err) { oops_(err, 'shell:sheetShow_') } }
sheetStep = typeof step === 'function' ? step : null;
const sh = sheetEl_();
sheetOutStop_(sh);
const where = sheetWhere_();
const fill = () => {
sheetPlace_(where);
sh.querySelector('#sheet-title').textContent = title;
sh.querySelector('#sheet-body').innerHTML = html;
sh.classList.remove('hidden');
};
const at = where.host && (where.after || where.host);
if (sh.classList.contains('hidden') && at && at.closest('#screen')) expand_([at], fill, { content: () => [sh] });
else fill();
sheetOnClose = onClose || null;
try { sh.scrollIntoView({ block: 'nearest' }); } catch (err) { }
try { placeCells(undefined, true); } catch (err) { oops_(err, 'shell:sheetShow_') }
}
let SHEET_OUT_ = null;
function sheetOutStop_(sh) {
if (!SHEET_OUT_) return;
SHEET_OUT_.cancel(); SHEET_OUT_ = null;
sh.classList.remove('is-leaving');
}
function sheetHide_() {
sheetStep = null;
const sh = sheetEl_();
if (SHEET_OUT_) return;
const was = !sh.classList.contains('hidden');
sh.classList.add('hidden');
const f = sheetOnClose; sheetOnClose = null;
if (f) { try { f(); } catch (err) { console.error('[sheet onClose]', err); } }
const home = () => {
sh.querySelector('#sheet-body').innerHTML = '';
SHEET_AT_ = null;
document.querySelectorAll('.sheet-host').forEach(h => h.classList.remove('sheet-host', 'sheet-swap'));
if ($('sheet-home')) $('sheet-home').after(sh);
};
const placed = () => { if (was) { try { placeCells(undefined, true); } catch (err) { oops_(err, 'shell:sheetHide_') } } };
if (!sh.classList.contains('hidden')) { placed(); return; }
const host = sh.closest('.sheet-host');
if (!was || !sh.closest('#screen') || !expandMoves_(sh) || !MOTION_.exit) { home(); placed(); return; }
sh.classList.remove('hidden');
sh.classList.add('is-leaving');
const swap = !!(host && host.classList.contains('sheet-swap'));
SHEET_OUT_ = expandOut_([sh], () => {
SHEET_OUT_ = null;
sh.classList.remove('is-leaving');
sh.classList.add('hidden');
home();
}, { anchors: [sh], content: swap ? () => [...host.children].filter(c => c !== sh) : null, done: placed });
}
const STEPS_ = [];
let STEP_SEQ_ = 0, STEP_QUIET_ = 0, STEP_SHEET_ = 0;
const stepScroll_ = () => {
const root = document.scrollingElement || document.documentElement;
const out = [[root, root.scrollTop]];
document.querySelectorAll('#s-' + AT + ' .pane, #s-' + AT + ' .page.on').forEach(el => { if (el.scrollTop) out.push([el, el.scrollTop]); });
return out;
};
const stepScrollBack_ = list => (list || []).forEach(([el, top]) => { try { if (el && el.isConnected) el.scrollTop = top; } catch (e) { } });
const stepTop_ = () => (STEPS_.length ? STEPS_[STEPS_.length - 1] : null);
function openStep_(o) {
const opt = o || {};
const scroll = stepScroll_();
if (opt.html != null && STEP_SHEET_ && STEPS_.some(s => s.id === STEP_SHEET_)) {
if (opt.el) SHEET_HERE_ = { el: opt.el, beside: !!opt.beside };
sheetShow_(opt.title || '', opt.html, opt.onClose, opt.wheel);
return STEP_SHEET_;
}
const id = ++STEP_SEQ_;
const step = { id, scroll, undo: opt.undo || null, sheet: opt.html != null, dead: false };
STEPS_.push(step);
stepPushHist_(id);
if (step.sheet) { STEP_SHEET_ = id; if (opt.el) SHEET_HERE_ = { el: opt.el, beside: !!opt.beside }; sheetShow_(opt.title || '', opt.html, opt.onClose, opt.wheel); }
else if (typeof opt.draw === 'function') {
const host = (opt.el && opt.el.closest && opt.el.closest(SHEET_HOSTS_)) || null;
if (host && host.isConnected) expand_([host], opt.draw, { content: () => (host.isConnected ? [host] : []) }); else opt.draw();
}
return id;
}
function stepRun_(s, undo) {
if (s.sheet) { if (STEP_SHEET_ === s.id) { STEP_SHEET_ = 0; if (undo) sheetHide_(); } }
else if (undo && typeof s.undo === 'function') { try { s.undo(); } catch (e) { oops_(e, 'shell:stepRun_'); } }
const sc = s.scroll;
stepScrollBack_(sc);
requestAnimationFrame(() => stepScrollBack_(sc));
[250, 600].forEach(ms => setTimeout(() => stepScrollBack_(sc), ms));
}
const STEP_WAIT_ = [];
function stepPushHist_(id) {
if (STEP_QUIET_) { STEP_WAIT_.push(id); return; }
try { history.pushState({ familyStep: id }, ''); } catch (e) { }
}
function stepBackQuiet_() { STEP_QUIET_++; try { history.back(); } catch (e) { STEP_QUIET_--; } }
function stepDone_(id, undo) {
const i = STEPS_.findIndex(s => s.id === id && !s.dead);
if (i < 0) return;
const s = STEPS_[i];
if (i === STEPS_.length - 1) {
STEPS_.pop();
let n = 1;
while (STEPS_.length && stepTop_().dead) { STEPS_.pop(); n++; }
stepRun_(s, undo);
for (let k = 0; k < n; k++) stepBackQuiet_();
} else { s.dead = true; stepRun_(s, undo); }
}
function closeStep_(id) {
const want = id || STEP_SHEET_;
if (want) stepDone_(want, true);
else if (!sheetEl_().classList.contains('hidden')) sheetHide_();
}
addEventListener('popstate', () => {
if (STEP_QUIET_) {
STEP_QUIET_--;
if (!STEP_QUIET_) STEP_WAIT_.splice(0).forEach(id => { if (STEPS_.some(s => s.id === id && !s.dead)) stepPushHist_(id); });
return;
}
let s = STEPS_.pop();
while (s && s.dead) s = STEPS_.pop();
if (s) stepRun_(s, true);
});
function foldStep_(d) {
if (d.stepId) return;
d.stepId = openStep_({ undo: () => {
d.stepId = 0;
if (!d.isConnected || !d.open) return;
d.expandOut = expandOut_([...d.children].filter(c => c.tagName !== 'SUMMARY'), () => { d.open = false; }, { anchors: [d] });
} });
}
function foldShut_(d) { const id = d.stepId; d.stepId = 0; if (id) stepDone_(id, false); }
const EXPAND_FOLLOW_ = 24;
const expandMoves_ = el => !!(el && typeof el.animate === 'function' && motionOK_() && MOTION_.move > 0);
function expandFollowers_(anchors) {
const out = new Set();
anchors.forEach(a => {
for (let n = a; n && n.parentElement && out.size < EXPAND_FOLLOW_; n = n.parentElement) {
if (n.matches('.page, .screen, #screen, body')) break;
for (let s = n.nextElementSibling; s && out.size < EXPAND_FOLLOW_; s = s.nextElementSibling) out.add(s);
}
});
return [...out];
}
const expandCancel_ = (el, key) => { const a = el && el[key]; if (a) { try { a.cancel(); } catch (e) { } el[key] = null; } };
function expand_(anchors, mutate, o) {
const opt = o || {};
const list = [].concat(anchors).filter(a => a && a.isConnected);
if (!list.length || !expandMoves_(list[0])) { mutate(); return; }
const follow = expandFollowers_(list);
const before = follow.map(f => f.getBoundingClientRect().top);
follow.forEach(f => expandCancel_(f, 'expandFlip'));
mutate();
follow.forEach((f, i) => {
if (!f.isConnected || !f.getClientRects().length) return;
const dy = before[i] - f.getBoundingClientRect().top;
if (Math.abs(dy) < 1) return;
const z = f.currentCSSZoom || 1;
f.expandFlip = f.animate([{ translate: `0 ${dy / z}px` }, { translate: '0 0' }], { duration: MOTION_.move, easing: MOTION_.spring });
});
const shown = typeof opt.content === 'function' ? opt.content() : opt.content;
[].concat(shown || []).forEach(c => {
if (!c || !c.isConnected || !c.getClientRects().length) return;
expandCancel_(c, 'expandIn');
c.expandIn = c.animate([{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }, { opacity: 1, clipPath: 'inset(0 0 0 0)' }],
{ duration: MOTION_.move, easing: MOTION_.spring });
});
}
function expandOut_(leaving, mutate, o) {
const opt = o || {};
const els = [].concat(leaving).filter(e => e && e.isConnected && e.getClientRects().length);
const end = () => { mutate(); if (opt.done) opt.done(); };
if (!els.length || !expandMoves_(els[0]) || !MOTION_.exit) { end(); return null; }
els.forEach(e => expandCancel_(e, 'expandIn'));
const fades = els.map(e => e.animate([{ opacity: 1 }, { opacity: 0 }], { duration: MOTION_.exit, easing: MOTION_.in, fill: 'forwards' }));
const job = { done: false, cancel() { if (job.done) return; job.done = true; fades.forEach(f => { try { f.cancel(); } catch (e) { } }); } };
const finish = () => {
if (job.done) return;
job.done = true;
expand_(opt.anchors || els, () => { mutate(); fades.forEach(f => { try { f.cancel(); } catch (e) { } }); }, { content: opt.content });
if (opt.done) opt.done();
};
Promise.all(fades.map(f => f.finished)).then(finish, finish);
return job;
}
addEventListener('click', e => {
if (e.defaultPrevented || e.button) return;
const s = e.target && e.target.closest && e.target.closest('summary');
const d = s && s.parentElement;
if (!d || d.tagName !== 'DETAILS' || d.querySelector(':scope > summary') !== s) return;
const ctl = e.target.closest('a, button, input, textarea');
if (ctl && s.contains(ctl)) return;
if (!d.isConnected) return;
if (!expandMoves_(d)) { const was = d.open; setTimeout(() => { if (d.open && !was) foldStep_(d); else if (!d.open && was) foldShut_(d); }, 0); return; }
e.preventDefault();
if (d.expandOut && !d.expandOut.done) { d.expandOut.cancel(); d.expandOut = null; return; }
const kids = () => [...d.children].filter(c => c !== s);
if (!d.open) { expand_([d], () => { d.open = true; }, { content: kids }); foldStep_(d); }
else { d.expandOut = expandOut_(kids(), () => { d.open = false; }, { anchors: [d] }); foldShut_(d); }
});
function motionOK_() {
try { return !matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return true; }
}
const MOTION_FALL_ = { press: 0, quick: 120, enter: 220, exit: 180, move: 280, mark: 1300,
out: 'cubic-bezier(.2, .8, .2, 1)', in: 'cubic-bezier(.4, 0, 1, 1)', spring: 'cubic-bezier(.2, .9, .3, 1)' };
let MOTION_READ_ = null;
function motionRead_() {
if (MOTION_READ_) return MOTION_READ_;
let cs = null;
try { cs = getComputedStyle(document.documentElement); } catch (e) { }
const v = k => (cs && cs.getPropertyValue(k) || '').trim();
if (!v('--dur-move')) return MOTION_FALL_;
const ms = s => { const n = parseFloat(s); return !isFinite(n) ? 0 : /ms$/.test(s) ? n : n * 1000; };
const got = {};
Object.keys(MOTION_FALL_).forEach(k => {
const raw = typeof MOTION_FALL_[k] === 'number' ? v('--dur-' + k) : v('--ease-' + k);
got[k] = !raw ? MOTION_FALL_[k] : typeof MOTION_FALL_[k] === 'number' ? ms(raw) : raw;
});
return (MOTION_READ_ = got);
}
const MOTION_ = {};
const MOTION_MOVES_ = ['quick', 'enter', 'exit', 'move'];
Object.keys(MOTION_FALL_).forEach(k => Object.defineProperty(MOTION_, k, { enumerable: true,
get: () => (MOTION_MOVES_.indexOf(k) !== -1 && !motionOK_() ? 0 : motionRead_()[k]) }));
try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { MOTION_READ_ = null; }); } catch (e) { }
const PRESS_AGAIN_MS = 350;
const PRESS_REPEAT_ = new Set(['kp-key', 'cal-back', 'cal-fwd', 'tal-size',
'pad-undo', 'sp-ctl', 'feed-tap', 'rw-next', 'rw-back', 'speed-back']);
const PRESS_LAST_ = new Map();
const PRESS_OUT_ = new Map();
let PRESS_ACTING_ = null;
function pressKey_(el) {
let k = (String(el.getAttribute('class') || '').trim().split(/\s+/)[0] || el.tagName) + ':' + (el.getAttribute('data-do') || '');
for (const a of el.attributes) if (/^data-/.test(a.name) && !/^data-(do|sure|armed|repeat)$/.test(a.name)) k += '|' + a.name + '=' + a.value;
return k;
}
function pressLive_(el, key) {
if (!el || el.isConnected) return el || null;
const k = key || pressKey_(el);
return [...document.querySelectorAll('[data-do="' + el.getAttribute('data-do') + '"]')].find(c => pressKey_(c) === k) || null;
}
function pressAgain_(el) {
if (el.hasAttribute('data-repeat') || PRESS_REPEAT_.has(el.getAttribute('data-do'))) return false;
const key = pressKey_(el), now = performance.now();
const out = PRESS_OUT_.get(key);
if (out) for (const o of out.keys()) if (o === el || !o.isConnected) return true;
const last = PRESS_LAST_.get(key);
if (last && now - last.t < PRESS_AGAIN_MS && (last.el === el || !last.el.isConnected)) return true;
if (PRESS_LAST_.size > 64) PRESS_LAST_.forEach((v, k) => { if (now - v.t >= PRESS_AGAIN_MS) PRESS_LAST_.delete(k); });
PRESS_LAST_.set(key, { t: now, el });
return false;
}
function pressOut_(key, el, p, ms) {
const out = PRESS_OUT_.get(key) || new Map();
PRESS_OUT_.set(key, out);
out.set(el, (out.get(el) || 0) + 1);
if (el && !el.hasAttribute('aria-busy')) { el.setAttribute('aria-busy', 'true'); el.PRESS_BUSY = true; }
let bell = 0, gone = false;
const done = () => {
if (gone) return;
gone = true; clearTimeout(bell);
const n = (out.get(el) || 1) - 1;
if (n > 0) { out.set(el, n); return; }
out.delete(el);
if (!out.size && PRESS_OUT_.get(key) === out) PRESS_OUT_.delete(key);
if (el && el.PRESS_BUSY) { el.PRESS_BUSY = false; el.removeAttribute('aria-busy'); }
};
bell = setTimeout(done, (ms || API_DEADLINE_MS) + 1000);
Promise.resolve(p).then(done, done);
}
function pressFree_() { PRESS_ACTING_ = null; }
const API_DEADLINE_MS = 60000;
const API_LONG_ = {
libImportDrive: 6 * 60000,
};
function why_(err) {
const msg = String((err && err.message) || err || '').trim();
if (msg && !/^(TypeError|Failed to fetch|NetworkError|Load failed)/i.test(msg)) return msg;
const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
return offline
? 'No connection — this phone is offline. Nothing was saved.'
: 'The server did not answer, so nothing was saved. Try again in a minute.';
}
function backendFetch_(body, o) {
o = o || {};
const opt = body == null ? { cache: 'no-store' } : { method: 'POST', cache: 'no-store', body: JSON.stringify(body) };
if (o.keepalive) opt.keepalive = true;
if (o.signal) opt.signal = o.signal;
const asked = fetch(API + (o.query || ''), opt);
return o.quiet ? Promise.resolve(asked).catch(() => null) : asked;
}
function api(body, opts) {
const b = Object.assign({}, body);
if (!b.token && typeof USER === 'object' && USER && USER.token) b.token = USER.token;
const keep = !!(opts && opts.keepalive);
const wait = API_LONG_[b.action] || API_DEADLINE_MS;
let stop = null, bell = 0;
try { if (!keep && typeof AbortController === 'function') stop = new AbortController(); } catch (e) { stop = null; }
const late = keep ? null : new Promise((u, no) => { bell = setTimeout(() => {
const e = new Error('The server did not answer within ' + (wait > API_DEADLINE_MS ? Math.round(wait / 60000) + ' minutes' : 'a minute')
+ '. It may still have been saved — look before trying again.');
e.name = 'TimeoutError';
try { if (stop) stop.abort(); } catch (err) { }
no(e);
}, wait); });
const asked = backendFetch_(b, { keepalive: keep, signal: stop ? stop.signal : null })
.then(r => r.text().then(txt => {
try { return JSON.parse(txt); } catch (e) { }
const m = txt.match(/<div[^>]*>([^<]{10,400})<\/div>/i)
|| txt.match(/>\s*(TypeError|ReferenceError|Exception|Error)([^<]{0,300})</i);
const said = m ? (m[1] + (m[2] || '')).replace(/\s+/g, ' ').trim()
: txt.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
throw new Error('Backend: ' + (said || ('HTTP ' + r.status)));
}))
.then(d => {
if (d && d.unwritten && d.unwritten.length) {
banner('Some values were not saved: '
+ d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
+ ' — those columns are not in the sheet.');
}
if (d && d.why === 'signed-out' && typeof USER === 'object' && USER && USER.token === b.token) {
const gone = typeof whoIs_ === 'function' ? whoIs_() : '';
if (typeof signedOut_ === 'function') { try { signedOut_({ ended: true }); } catch (e) { } }
else { USER = null; keep_.signOut(); try { repaint(); } catch (e) { oops_(e, 'shell:api') } }
try {
const rec = gone ? JSON.stringify({ who: gone, at: Date.now() }) : '';
if (rec) keep_.put('familyGone', rec, 'record');
} catch (e) { }
try { if (typeof ansSavedPaint_ === 'function') ansSavedPaint_(); } catch (e) { oops_(e, 'shell:api') }
toast(text_('signed-out-please-sign-in-again'));
}
return d || {};
});
if (keep) return asked;
asked.catch(() => { });
const p = Promise.race([asked, late]).finally(() => clearTimeout(bell));
if (PRESS_ACTING_) pressOut_(PRESS_ACTING_.key, PRESS_ACTING_.el, p, wait);
return p;
}
function apiKept_(body, use, after) {
const run = (d, old) => { use(d, old); if (typeof after === 'function') after(); };
const k = keptKey_(body), kept = keptGet_(k);
const shown = kept ? JSON.stringify(kept) : null;
if (kept) { Promise.resolve().then(() => run(kept, true)).catch(e => oops_(e, 'shell:kept')); }
return api(body).then(d => {
if (!d || d.error) { if (!kept) run(d || {}, false); return d; }
const t = JSON.stringify(d);
if (t !== shown) keptPut_(k, t);
run(d, false);
return d;
}, err => { if (kept) return kept; throw err; });
}
function send(body) {
return api(body).then(d => {
if (d && d.error && /unknown action|not recognis/i.test(String(d.error))) {
const act = (String(d.error).match(/:\s*(\w+)/) || [])[1] || 'that action';
const has = (DATA.features || []).indexOf(act) !== -1;
throw new Error(has
? act + ' is not working — the backend knows it but returned an error'
: 'The backend does not have `' + act + '` yet. Paste the newest .gs files into Apps '
+ 'Script and deploy. Live version: ' + (DATA.version || 'unknown'));
}
if (d && d.error) { const e = new Error(d.error); e.reply = d; throw e; }
return d;
});
}
function tell_(el, state, words) {
const msg = words == null ? '' : String(words);
if (!el) { if (msg) toast(msg); return; }
if (words === undefined || (el.matches && el.matches('button, .btn, .tile'))) { el.classList.toggle('is-busy', state === 'busy'); return; }
if (el.textContent !== msg) el.textContent = msg;
if (state && msg) el.setAttribute('data-tell', state); else el.removeAttribute('data-tell');
}
const TOASTS_ = [];
const TOAST_MAX_ = 3;
const toastMs_ = s => Math.min(7000, 2000 + 50 * String(s).length);
function toastHost_() {
let h = $('toasts');
if (!h) {
h = document.createElement('div');
h.id = 'toasts';
h.setAttribute('role', 'status');
h.setAttribute('aria-live', 'polite');
document.body.appendChild(h);
}
return h;
}
const toastMoves_ = el => motionOK_() && typeof el.animate === 'function';
function toastStack_() {
let up = 0;
for (let i = TOASTS_.length - 1; i >= 0; i--) {
const t = TOASTS_[i];
t.el.style.translate = up ? `0 ${-up}px` : '';
if (!t.leaving) up += t.el.offsetHeight + 6;
}
}
function toastEnter_(t) {
if (t.anim) { try { t.anim.cancel(); } catch (e) { } t.anim = null; }
if (!toastMoves_(t.el)) return;
t.anim = t.el.animate([{ opacity: 0, transform: 'translateY(.5rem) scale(.97)' }, { opacity: 1, transform: 'none' }],
{ duration: MOTION_.enter, easing: MOTION_.spring });
}
function toastLeave_(t) {
if (t.leaving) return;
t.leaving = true;
clearTimeout(t.timer);
const gone = () => {
t.el.remove();
const i = TOASTS_.indexOf(t);
if (i > -1) TOASTS_.splice(i, 1);
if (isToast_(t.el)) { t.el.removeAttribute('id'); const n = TOASTS_.filter(x => !x.leaving).pop(); if (n) n.el.id = 'toast'; }
toastStack_();
};
if (t.anim) { try { t.anim.cancel(); } catch (e) { } t.anim = null; }
if (!toastMoves_(t.el) || !MOTION_.exit) { gone(); return; }
t.anim = t.el.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(.35rem) scale(.97)' }],
{ duration: MOTION_.exit, easing: MOTION_.in, fill: 'forwards' });
t.anim.finished.then(gone, gone);
}
function toast(msg) {
const text = String(msg == null ? '' : msg);
const host = toastHost_();
const last = TOASTS_[TOASTS_.length - 1];
let t = last && !last.leaving && last.text === text ? last : null;
if (!t) {
TOASTS_.forEach(x => { if (isToast_(x.el)) x.el.removeAttribute('id'); });
const el = document.createElement('div');
el.id = 'toast';
el.className = 'toast';
el.textContent = text;
host.appendChild(el);
t = { el, text, timer: 0, anim: null, leaving: false };
TOASTS_.push(t);
const live = TOASTS_.filter(x => !x.leaving);
live.slice(0, Math.max(0, live.length - TOAST_MAX_)).forEach(toastLeave_);
}
clearTimeout(t.timer);
t.timer = setTimeout(() => toastLeave_(t), toastMs_(text));
toastEnter_(t);
toastStack_();
}
function canSay_() {
try { return !!(window.speechSynthesis && window.SpeechSynthesisUtterance); } catch (e) { return false; }
}
function hush_() {
try { if (canSay_()) window.speechSynthesis.cancel(); } catch (e) { oops_(e, 'shell:hush_') }
}
const VOICE_GOOD = [[/\b(natural|neural|online)\b/i, 60], [/siri/i, 50], [/\b(enhanced|premium)\b/i, 45],
[/\b(daniel|arthur|oliver|serena|kate)\b/i, 30], [/^google uk english (male|female)\b/i, 20]];
const VOICE_BAD = /espeak|\bfred\b|compact|albert|bad news|bahh|bells|boing|bubbles|cellos|zarvox|trinoids|whisper|wobble|jester|organ|superstar|junior|ralph|kathy|good news|deranged|hysterical/i;
const voiceLang_ = v => String((v && v.lang) || '').replace('_', '-').toLowerCase();
function voiceScore_(v, lang) {
const want = String(lang || 'en-GB').toLowerCase(), l = voiceLang_(v), name = String((v && v.name) || '');
if (l.slice(0, 2) !== want.slice(0, 2)) return -1000;
let s = l === want ? 300 : (want.slice(0, 2) === 'en' && l === 'en-us') ? 200 : 100;
s += Math.max(0, ...VOICE_GOOD.filter(g => g[0].test(name)).map(g => g[1]));
if (VOICE_BAD.test(name)) s -= 200;
return s;
}
function voicesAll_() {
try { const ss = window.speechSynthesis; return (ss && typeof ss.getVoices === 'function' && ss.getVoices()) || []; } catch (e) { return []; }
}
function voicesRanked_(lang, list) {
return (list || voicesAll_()).map((v, i) => ({ v, i, s: voiceScore_(v, lang) })).filter(x => x.s > -1000)
.sort((a, b) => b.s - a.s || a.i - b.i).map(x => x.v);
}
function voicePick_(lang, list) { return voicesRanked_(lang, list)[0] || null; }
keep_.del('voice:name');
const SAY_SUP = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
const SAY_VULGAR = { '½': 'one half', '⅓': 'one third', '⅔': 'two thirds', '¼': 'one quarter', '¾': 'three quarters', '⅕': 'one fifth', '⅛': 'one eighth' };
const SAY_DEN = { 2: ['half', 'halves'], 3: ['third', 'thirds'], 4: ['quarter', 'quarters'], 5: ['fifth', 'fifths'],
6: ['sixth', 'sixths'], 8: ['eighth', 'eighths'], 10: ['tenth', 'tenths'] };
const SAY_ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
function sayMaths_(t) {
return String(t == null ? '' : t)
.replace(/[½⅓⅔¼¾⅕⅛]/g, c => ' ' + SAY_VULGAR[c] + ' ')
.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => { const n = m.split('').map(c => SAY_SUP[c]).join('');
return n === '2' ? ' squared ' : n === '3' ? ' cubed ' : ' to the power of ' + n + ' '; })
.replace(/(^|[^\d\/])(\d{1,2})\s*\/\s*(\d{1,2})(?![\d\/])/g, (m, a, n, d) => {
const w = SAY_DEN[+d], k = +n;
return a + (w && k >= 1 && k < +d ? SAY_ONES[k] + ' ' + w[k > 1 ? 1 : 0] : n + ' over ' + d); })
.replace(/÷/g, ' divided by ').replace(/×/g, ' times ').replace(/−/g, ' minus ').replace(/±/g, ' plus or minus ')
.replace(/≤/g, ' is less than or equal to ').replace(/≥/g, ' is greater than or equal to ')
.replace(/≠/g, ' is not equal to ').replace(/≈/g, ' is approximately ').replace(/√\s*/g, ' the square root of ')
.replace(/π/g, ' pi ').replace(/∞/g, ' infinity ').replace(/°/g, ' degrees ')
.replace(/\s+([,.?!:;])/g, '$1').replace(/\s+/g, ' ').trim();
}
function sayChunks_(text, max) {
max = max || 180;
const out = [], all = String(text == null ? '' : text).replace(/\s+/g, ' ').trim();
if (all.length <= max) return all ? [all] : [];
all.replace(/([.?!])\s+(?=[A-Z0-9“\u0022\u0027(£¿¡])/g, '$1\u0001').split('\u0001').forEach(s => {
while (s.length > max) {
let cut = s.lastIndexOf(', ', max);
if (cut < max / 3) cut = s.lastIndexOf(' ', max);
if (cut < 1) cut = max;
out.push(s.slice(0, cut + 1).trim()); s = s.slice(cut + 1).trim();
}
if (s) out.push(s);
});
return out;
}
const SAY_RATE = 0.9, SAY_PITCH = 0.95;
function say_(text, o) {
o = o || {};
try {
const lang = /^[a-z]{2}-[A-Z]{2}$/.test(String(o.lang || '')) ? o.lang : 'en-GB';
const parts = sayChunks_(/^en/.test(lang) ? sayMaths_(text) : String(text));
if (!parts.length || !canSay_()) { if (o.onend) o.onend(); return null; }
const ss = window.speechSynthesis, voice = voicePick_(lang);
let u = null;
parts.forEach((p, i) => {
u = new window.SpeechSynthesisUtterance(p);
u.lang = voice && voice.lang ? String(voice.lang).replace('_', '-') : lang;
if (voice) u.voice = voice;
u.rate = o.rate || SAY_RATE;
u.pitch = SAY_PITCH;
u.volume = o.volume == null ? 1 : o.volume;
if (i === 0 && o.onstart) u.onstart = o.onstart;
if (i === parts.length - 1 && o.onend) { u.onend = o.onend; u.onerror = o.onend; }
ss.speak(u);
});
return u;
} catch (e) { return null; }
}
const ACTIONS = {};
const SLOW_ACTS_ = new Set(['card-share', 'card-cancel']);
function on(name, fn) {
ACTIONS[name] = function (el) { ACT_EPOCH++; if (!SLOW_ACTS_.has(name) || !el || !el.setAttribute) return fn.apply(this, arguments);
const a = [...arguments], key = pressKey_(el); el.setAttribute('aria-busy', 'true');
requestAnimationFrame(() => setTimeout(() => { const live = pressLive_(el, key);
try { if (live) { a[0] = live; fn.apply(this, a); } } finally { el.removeAttribute('aria-busy'); } })); };
}
on('retry', () => { LOADED = false; LOAD_FAILED = ''; LIBRARY_FAILED = '';
LIBRARY_ROWS = null;
banner(''); bootLoaded_(false); repaint(); load(); });
let CLICK_LOG = false;
function clicks(on) {
CLICK_LOG = (on === undefined) ? !CLICK_LOG : !!on;
console.log(CLICK_LOG
? 'Watching presses. Tap something. `clicks(false)` to stop.'
: 'Stopped watching presses.');
return CLICK_LOG;
}
let PRESS_MOVED = false;
let PRESSED = null;
let PRESSED_OFF = 0;
const PRESS_SEL_ = '[data-do], .tab, button, a[href], summary, label, [role="button"]';
function pressMark_(t) {
pressClear_();
const el = t && t.closest && t.closest(PRESS_SEL_);
if (!el || el.disabled || el.getAttribute('aria-disabled') === 'true') return;
PRESSED = el;
el.classList.add('is-pressed');
}
function pressClear_() {
clearTimeout(PRESSED_OFF);
if (PRESSED) { try { PRESSED.classList.remove('is-pressed'); } catch (e) { oops_(e, 'shell:pressClear_') } }
PRESSED = null;
}
function pressDone_() {
const was = PRESSED;
requestAnimationFrame(() => requestAnimationFrame(() => { if (PRESSED === was) pressClear_(); }));
}
addEventListener('pointerdown', e => {
if (!e.isPrimary) return;
if (e.pointerType === 'mouse' && e.buttons !== 1) return;
pressMark_(e.target);
}, { passive: true, capture: true });
addEventListener('pointercancel', pressClear_, { passive: true });
addEventListener('pointerup', e => {
if (!e.isPrimary || !PRESSED) return;
pressDone_();
clearTimeout(PRESSED_OFF);
PRESSED_OFF = setTimeout(pressClear_, 1200);
}, { passive: true, capture: true });
document.addEventListener('touchstart', () => {}, { passive: true });
;
/* js/shell-api.js */
const FIELD_ACTS_ = 'select, label, summary, input[type="checkbox"], input[type="radio"]';
addEventListener('mousedown', e => {
if (!PRESS_MOVED) return;
if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
}, true);
document.addEventListener('click', e => {
if (PRESS_MOVED) {
PRESS_MOVED = false;
pressClear_();
if (e.target && e.target.closest && e.target.closest(FIELD_ACTS_)) e.preventDefault();
if (CLICK_LOG) console.log('[click] swallowed — the finger moved, so this was a swipe');
return;
}
pressDone_();
if (CLICK_LOG) {
const d = e.target.closest('[data-do]');
console.log('[click]', {
pressed: e.target.tagName + (e.target.className ? '.' + String(e.target.className).split(' ')[0] : ''),
nearestAction: d ? d.dataset.do : '(nothing carries a data-do)',
handlerRegistered: d ? !!ACTIONS[d.dataset.do] : false,
handledByChange: !!(d && (d.tagName === 'SELECT' || isCheckbox_(d))),
});
}
const tab = e.target.closest('.tab');
if (tab) { go(tab.dataset.tab); return; }
if (e.target.closest('#sheet-close')) { closeStep_(); return; }
const doer = e.target.closest('[data-do]');
if (doer && (doer.tagName === 'SELECT' || isCheckbox_(doer))) return;
if (doer && ACTIONS[doer.dataset.do]) {
if (pressAgain_(doer)) {
if (CLICK_LOG) console.log('[click] dropped — the same control again, or its request is still out');
return;
}
if (e.isTrusted && PRESS_AFTER_PAINT_.has(doer.dataset.do)) { pressAfterPaint_(doer, e); return; }
pressAct_(doer, e);
}
});
const PRESS_AFTER_PAINT_ = new Set(['facet-pick', 'facet-skip', 'filter-drop', 'filter-clear']);
let PRESS_SOON_ = null;
function pressAfterPaint_(doer, e) {
const key = pressKey_(doer);
if (PRESS_SOON_) return;
PRESS_SOON_ = { el: doer, key };
doer.classList.add('is-pressed');
requestAnimationFrame(() => setTimeout(() => {
PRESS_SOON_ = null;
const live = pressLive_(doer, key);
if (live) pressAct_(live, e);
else if (CLICK_LOG) console.log('[click] dropped — its control is no longer on the screen');
}, 0));
}
function pressAct_(doer, e) {
const acting = PRESS_ACTING_ = { key: pressKey_(doer), el: doer };
try {
const got = ACTIONS[doer.dataset.do](doer, e);
if (got && typeof got.then === 'function' && PRESS_ACTING_ === acting) pressOut_(acting.key, doer, got);
} catch (err) {
oops_(err, 'act:' + doer.dataset.do);
toast(text_('that-did-not-work-everything-else'));
} finally { PRESS_ACTING_ = null; }
}
addEventListener('keydown', e => {
if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.matches && e.target.matches('[role=button][data-do]:not(button)')) {
e.preventDefault(); e.target.click(); return;
}
if (e.key === 'Escape' && !$('sheet').classList.contains('hidden')) { closeStep_(); return; }
});
function loadRepairs_(d) {
d.questions = d.questions || [];
d.dropdowns = d.dropdowns || {};
d.dropdowns.checklists = d.dropdowns.checklists || {};
}
async function filesOnly_() {
try {
if (DATA && DATA.questions && DATA.questions.length) return;
} catch (e) { return; }
const d = {};
try { await laterFiles_(); } catch (e) { }
try {
libraryInto_(d, await libraryRows_());
libraryExtras_(d, await libraryExtraRows_());
settingsInto_(d, await settingsRows_());
} catch (e) { }
loadRepairs_(d);
loadRowsClean_(d);
DATA = d;
try { applyBrandIcon_(); } catch (e) { oops_(e, 'shell:filesOnly_') }
}
async function bootJson_(res) {
if (!res || typeof res.text !== 'function') return res.json();
const body = await res.text();
PAYLOAD_TEXT = body;
try { return JSON.parse(body); }
catch (e) {
const said = String(body.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 160);
const no = new Error(text_('the-reply-was-not-valid-json') + res.status + ')'
+ (said ? ': ' + said : ': it was empty'));
no.page = /^\s*</.test(body);
throw no;
}
}
const RECONNECT = {
timer: 0,
at: 0,
tries: 0,
since: 0,
flying: 0,
asked: 0,
due: false,
seq: 0,
shown: 0,
shownFor: null,
banner: false,
hold: null,
kept: null,
};
const RECONNECT_SOON = 3000;
const RECONNECT_STEPS = [10000, 30000, 60000, 120000];
const RECONNECT_TELL = 120000;
const RECONNECT_FLICK = 5000;
function reconnectAdmin_() {
try {
return (typeof may_ === 'function' && may_('admin'))
|| (typeof hasRole === 'function' && hasRole('admin'));
} catch (e) { return false; }
}
function reconnectSay_(text) {
const el = document.getElementById('reconnect');
if (el && el.textContent !== text) el.textContent = text;
}
function reconnecting_() {
try { return RECONNECT.tries > 0; } catch (e) { return false; }
}
function reconnectBook_(wait) {
const R = RECONNECT;
clearTimeout(R.timer);
R.at = Date.now() + wait;
R.timer = setTimeout(() => { R.timer = 0; reconnectAsk_('timer'); }, wait);
}
function reconnectStop_() {
const R = RECONNECT;
clearTimeout(R.timer);
R.timer = 0; R.tries = 0; R.since = 0; R.due = false;
reconnectSay_('');
}
function reconnectDone_() {
const had = RECONNECT.banner;
RECONNECT.banner = false;
reconnectStop_();
const el = document.getElementById('banner');
if (had && el && /^(Could not reach the backend|The server said)/.test(el.textContent || '')) banner('');
}
function reconnectFail_(err, how) {
const R = RECONNECT;
if (how === 'ours') {
reconnectStop_();
R.banner = reconnectAdmin_();
return R.banner;
}
const now = Date.now();
if (!R.tries) R.since = now;
R.tries++;
const timeout = (err && err.name === 'AbortError') || String((err && err.message) || err) === 'timeout';
const slowest = RECONNECT_STEPS[RECONNECT_STEPS.length - 1];
let wait = how === 'refused' ? slowest
: R.tries === 1 ? (timeout ? 0 : RECONNECT_SOON)
: RECONNECT_STEPS[Math.min(R.tries - 2, RECONNECT_STEPS.length - 1)];
const left = R.since + RECONNECT_TELL - now;
if (left > 0 && wait > left) wait = left;
R.due = false;
reconnectBook_(wait);
const late = now - R.since >= RECONNECT_TELL;
const tell = reconnectAdmin_()
&& (how === 'refused' || !!(err && err.page) || location.protocol === 'file:' || late);
if (tell) R.banner = true;
reconnectSay_(tell ? '' : late ? 'Can’t reach the server — still trying.' : 'Reconnecting…');
return tell;
}
function reconnectAsk_(why) {
const R = RECONNECT;
if (!R.tries && !R.due) return;
if (R.flying) { R.due = true; return; }
if (document.hidden) { R.due = true; return; }
if (why === 'back' && !R.due && Date.now() - R.asked < RECONNECT_FLICK) {
const end = R.asked + RECONNECT_FLICK;
if (!R.timer || R.at > end) reconnectBook_(Math.max(0, end - Date.now()));
return;
}
clearTimeout(R.timer);
R.timer = 0; R.due = false;
load(true);
}
addEventListener('online', () => reconnectAsk_('online'));
document.addEventListener('visibilitychange', () => { if (!document.hidden) reconnectAsk_('back'); });
function loadWho_() {
const q = [];
if (USER && USER.personId) q.push('person=' + encodeURIComponent(USER.personId));
if (USER && USER.name) q.push('name=' + encodeURIComponent(USER.name));
if (USER && USER.token) q.push('token=' + encodeURIComponent(USER.token));
return q.length ? '?' + q.join('&') : '';
}
function loadStale_(n, who) {
const R = RECONNECT;
const now = loadWho_();
if (who === now && n > R.shown) return false;
if (R.shownFor !== now) R.due = true;
return true;
}
const TYPING_ = 'textarea, input[type="text"], input[type="search"], input[type="email"], '
+ 'input[type="tel"], input[type="number"], input:not([type]), [contenteditable="true"], select';
function typingBox_() {
const a = document.activeElement;
if (!a || !a.matches || !a.matches(TYPING_)) return null;
const s = a.closest ? a.closest('.screen') : null;
const id = s ? String(s.id).replace(/^s-/, '') : '';
const finder = findIs_(id);
return finder && !(a.closest && a.closest('.widget-slot')) ? null : a;
}
function landRepaint_(draw) {
const R = RECONNECT;
R.hold = typingBox_();
REPAINT_MARK = 'maybe';
try { (typeof draw === 'function' ? draw : repaint)(); } finally { R.hold = null; REPAINT_MARK = 1; }
DRAW_EPOCH++;
if (typeof aheadKick_ === 'function') aheadKick_();
}
function reconnectKeep_(id) {
try {
const box = RECONNECT.hold;
if (!box || document.activeElement !== box) return false;
const host = document.getElementById('s-' + id);
if (!host || !host.contains(box)) return false;
RECONNECT.kept = box;
return true;
} catch (e) { return false; }
}
document.addEventListener('focusout', () => {
if (!RECONNECT.kept) return;
setTimeout(() => {
const box = RECONNECT.kept;
if (!box) return;
const a = document.activeElement;
if (a === box && box.isConnected) return;
const host = box.isConnected && box.closest ? box.closest('[id^="s-"]') : null;
if (host && a && a !== box && host.contains(a) && a.matches && a.matches(TYPING_)) { RECONNECT.kept = a; return; }
RECONNECT.kept = null;
try { if (isAtHost_(host) && STALE[AT]) repaint(); } catch (e) { oops_(e, 'shell:reconnectKeep_') }
}, 400);
});
function loadRowsClean_(d) {
let gone = {};
try { gone = dataRowsClean_(d); } catch (e) { oops_(e, 'load:clean'); return; }
const keys = Object.keys(gone);
if (keys.length) oops_(new Error(keys.map(k => k + ' ' + gone[k]).join(', ') + ' malformed row(s) dropped'), 'load:rows');
}
;
/* js/shell-load.js */
async function load(again) {
const R = RECONNECT;
if (!again) reconnectStop_();
if (!again && !PAYLOAD_KEPT_TRIED) {
PAYLOAD_KEPT_TRIED = true;
const kept = payloadKept_();
if (kept) loadOnce_(false, ++R.seq, kept).catch(() => {});
}
R.asked = Date.now();
R.flying++;
try { await loadOnce_(again, ++R.seq); }
finally {
R.flying--;
if (!R.flying && R.due) reconnectAsk_('owed');
}
}
function dataProxy_(d) {
return new Proxy(d, {
get(t, k) {
if (typeof k === 'string' && !(k in t) && k !== 'then') MISSING_KEYS[k] = (MISSING_KEYS[k] || 0) + 1;
return t[k];
}
});
}
let LIBRARY_FOR = null;
async function libraryLate_(d) {
try {
const rows = await libraryRows_(), extra = await libraryExtraRows_();
await libraryQuiet_();
if (LIBRARY_FOR !== d) return;
libraryInto_(d, rows);
libraryExtras_(d, extra);
loadRowsClean_(d);
DATA = dataProxy_(d);
} catch (e) { }
LIBRARY_LATE = false;
if (LIBRARY_FAILED) banner('The questions did not load — ' + LIBRARY_FAILED + '. Everything else is here; reload the page to try again.');
try { if (typeof finderForgetFound_ === 'function') finderForgetFound_(); if (typeof subMigrate_ === 'function') { subMigrate_(); subPush_(true); } landRepaint_(); if (!LOAD_FAILED && typeof findPlaceBack_ === 'function') findPlaceBack_(); }
catch (e) { oops_(e, 'load:library-paint'); }
setTimeout(shapeSave_, 4000);
}
let FIRST_PAINT_DONE = false;
async function loadOnce_(again, n, kept) {
let reached = false;
let got = false;
const who = loadWho_();
try {
let d; if (kept) { d = kept; window.PAYLOAD_KEPT = true; } else {
d = await loadFetch_(who);
reached = true;
window.PAYLOAD_IN = true; }
if (loadStale_(n, who)) return;
if (!kept) payloadOwe_(d);
if (d && !d.error) {
if (!(await loadTakeData_(d, n, who))) return;
got = true;
RECONNECT.shown = n; RECONNECT.shownFor = who;
setTimeout(shapeSave_, 4000);
adoptMarks_();
applyBrandIcon_();
if (!kept) loadNotices_(d);
}
else {
LOAD_FAILED = String(d.error || 'the server refused the request');
await filesOnly_();
if (reconnectFail_(null, 'refused')) banner('The server said: ' + (d.error || 'something went wrong'));
}
} catch (err) {
if (!got && loadStale_(n, who)) return;
LOAD_FAILED = String((err && err.message) || err || 'could not reach the backend');
await filesOnly_();
if (reconnectFail_(err, reached ? 'ours' : 'way')) loadFailBanner_(err, reached);
}
if (again && !got && LOADED && reconnecting_()) return;
loadFinish_(kept);
}
async function loadFetch_(who) {
const bust = (who ? '&' : '?') + '_=' + Date.now();
clearTimeout(earlyTimer);
earlyTimer = setTimeout(() => {
if (LOADED) return;
filesOnly_().then(() => {
if (LOADED) return;
try { repaint(); } catch (e) { oops_(e, 'shell:loadOnce_') }
}).catch(() => {});
}, who ? EARLY_AFTER : 0);
let bell;
const deadline = new Promise((unused, no) => {
bell = setTimeout(() => {
const e = new Error('timeout');
e.name = 'AbortError';
no(e);
}, 60000);
});
const early = window.BOOT_GET || null;
window.BOOT_GET = null;
let res;
try {
res = await Promise.race([
early
? early.then(r => (r && r.ok ? r : (location.protocol === 'file:'
? jsonp(API + who + bust)
: backendFetch_(null, { query: who + bust }))))
: location.protocol === 'file:'
? jsonp(API + who + bust)
: backendFetch_(null, { query: who + bust }),
deadline]);
} finally {
clearTimeout(bell);
}
if (res && res.__jsonp) {
const got = res.__jsonp;
res = { ok: true, status: 200, statusText: 'OK', json: () => got };
}
let bodyBell;
return await Promise.race([bootJson_(res), new Promise((u, no) => { bodyBell = setTimeout(() => no(new Error('timeout')), 60000); })])
.finally(() => clearTimeout(bodyBell));
}
async function loadTakeData_(d, n, who) {
await laterFiles_();
const late = !libraryHere_();
try {
if (!late) {
libraryInto_(d, await libraryRows_());
libraryExtras_(d, await libraryExtraRows_());
}
settingsInto_(d, await settingsRows_());
} catch (e) { }
loadRepairs_(d);
if (loadStale_(n, who)) return false;
loadRowsClean_(d);
DATA = dataProxy_(d);
LIBRARY_LATE = late;
LIBRARY_FOR = d;
if (late) libraryLate_(d);
LOAD_FAILED = '';
return true;
}
function loadNotices_(d) {
if (LOAD_SLOW) banner('');
reconnectDone_();
if (d.unwritten && d.unwritten.length) {
banner('The sheet is missing columns: '
+ d.unwritten.map(x => x.tab + '.' + x.field).join(', ')
+ '. Anything saved to them is discarded.');
}
if (LIBRARY_FAILED && !LIBRARY_LATE) {
banner('The questions did not load — ' + LIBRARY_FAILED
+ '. Everything else is here; reload the page to try again.');
}
if (USER && typeof profileRefresh_ === 'function') profileRefresh_();
const NEEDS = ['post:save', 'post:delete'];
const missing = NEEDS.filter(f => (d.features || []).indexOf(f) === -1);
if (missing.length) {
banner('The backend at this URL is ' + (d.version || 'an unknown version')
+ ', which cannot ' + missing.join(', ') + '. Either that deployment is old, or '
+ 'this site is pointed at the wrong one — check the id in API against the '
+ 'Deployment ID in Manage deployments.');
}
}
function loadFailBanner_(err, reached) {
const el = $('banner');
if (el) {
el.classList.remove('hidden');
el.removeAttribute('data-do');
const msg = String((err && err.message) || err || '');
const why = /Unexpected token|not valid JSON/.test(msg)
? 'The backend answered with a web page instead of data. Open it in a tab and read what '
+ 'it says — “Authorization is required” means the scopes changed and nobody has '
+ 'consented yet: run authoriseDrive from the Apps Script editor, accept the prompt with '
+ 'every box ticked, and deploy a new version once its last line says READY.'
: location.protocol === 'file:'
? 'This page was opened from a file, so the browser blocked the request before it left — '
+ 'that is what “Failed to fetch” in no time at all means, and nothing is wrong with the '
+ 'backend. Serve the folder instead: in VS Code, right-click index.html → Open with '
+ 'Live Server. The address then starts http:// and everything works.'
: /Failed to fetch|NetworkError|Load failed/.test(msg)
? 'The reply never arrived, so this URL is not being served. Check Manage deployments: the '
+ 'one under ACTIVE is the only one that answers, an archived id looks exactly like '
+ 'this, and “Only myself” access does too.'
: /^timeout$/.test(msg)
? 'The backend took longer than a minute, again and again. One slow answer is a payload '
+ 'built cold (after clearPayloadCache) and the next ask gets the copy it kept; minutes of '
+ 'them is the script itself — open it in a tab and see how long it takes.'
: 'Something else went wrong on the way.';
el.innerHTML = cardRuns_(['Could not reach the backend.' + (reached ? '' : ' Still trying by itself.'), { br: 1 }])
+ qtag_(esc(why))
+ cardRuns_([{ br: 1 }, { link: 'Open it in a tab', href: API, look: 'link', out: true }, ' — the page itself will say which it is.', { br: 1 },
{ span: '', text: msg + ' · site ' + SITE_VERSION + ' · css ' + cssVersion() }]);
}
}
function loadFinish_(kept) {
LOADED = true;
bootLoaded_(true);
try { const k = KEPT_GONE; if (k && !LOAD_FAILED && AT === TAB_HOME && typeof oldBranch_ === 'function' && oldBranch_(k)) KEPT_GONE = ''; } catch (e) { oops_(e, 'shell:keptGone_') }
const first = !FIRST_PAINT_DONE && !LOAD_FAILED;
if (first) TABS.forEach(t => { if (t.id !== AT && screenHasMarkup_(t.id)) PRE_PAYLOAD.add(t.id); });
if (!LOAD_FAILED) FIRST_PAINT_DONE = true;
landRepaint_();
if (first) {
PRE_PAYLOAD.forEach(id => { if (STALE[id]) STALE[id] = 1; });
GLASS.cols.forEach(id => {
if (id === AT || !STALE[id]) return;
paint(id);
if (!STALE[id]) { PRE_PAYLOAD.delete(id); if (PAGER[id]) paintPager(id, true); }
});
aheadOpen_(); if (kept) payloadFind_();
}
if (typeof window.openSharedPost === 'function') window.openSharedPost();
try { openSharedTutor(); } catch (e) { oops_(e, 'shell:loadOnce_') }
try { if (typeof window.pushLanding_ === 'function') window.pushLanding_(); } catch (e) { oops_(e, 'shell:loadOnce_') }
if (!LOAD_FAILED && !LIBRARY_LATE && typeof findPlaceBack_ === 'function') findPlaceBack_();
}
const EARLY_AFTER = 15000;
let earlyTimer = null;
function bootLoaded_(on) {
clearTimeout(earlyTimer);
try { document.documentElement.classList.toggle('is-loaded', !!on); } catch (e) { oops_(e, 'shell:bootLoaded_') }
if (on) try { const b = $('boot-slow'); if (b) { b.className = 'hidden'; b.textContent = ''; } } catch (e) { }
}
function splashForget_() {
const gone = [];
try {
for (const k of keep_.keys('')) {
if (k && (k === 'splashAnims' || k === 'splashOff' || k.indexOf('splashAnim:') === 0)) gone.push(k);
}
gone.forEach(k => keep_.del(k));
} catch (e) { }
return gone.length > 0;
}
function banner(msg) {
const el = $('banner');
if (!msg) { el.classList.add('hidden'); el.removeAttribute('data-do'); return; }
el.textContent = msg;
el.removeAttribute('data-do');
el.classList.remove('hidden');
}
;
/* js/shell-hold.js */
const QUIET_FIELD = { autocomplete: 'off', autocorrect: 'off', autocapitalize: 'off',
'data-lpignore': 'true', 'data-1p-ignore': 'true', 'data-form-type': 'other', 'data-bwignore': 'true' };
function quietField_(el) {
if (!el || !el.setAttribute || !/^(INPUT|TEXTAREA)$/.test(el.tagName)) return;
Object.keys(QUIET_FIELD).forEach(k => { if (el.getAttribute(k) !== QUIET_FIELD[k]) el.setAttribute(k, QUIET_FIELD[k]); });
if (String(el.type).toLowerCase() === 'password' || /pin/i.test(el.id || '')) el.setAttribute('autocomplete', 'one-time-code');
if (el.tagName === 'INPUT' && el.getAttribute('spellcheck') !== 'false') el.setAttribute('spellcheck', 'false');
if (el.hasAttribute('list')) el.removeAttribute('list');
}
function quietFields_(root) {
try {
if (!root) return;
quietField_(root);
if (root.querySelectorAll) [].forEach.call(root.querySelectorAll('input,textarea'), quietField_);
} catch (e) { }
}
try {
quietFields_(document.documentElement);
new MutationObserver(ms => ms.forEach(m => [].forEach.call(m.addedNodes || [], quietFields_)))
.observe(document.documentElement, { childList: true, subtree: true });
} catch (e) { }
document.addEventListener('dblclick', e => { try { e.preventDefault(); } catch (err) { oops_(err, 'shell:quietFields_') } }, { passive: false });
;
/* js/rules.js */
const RULES = [
{ id: 'tap-44', say: 'Keypad keys, multiple-choice options and every Check/Send stay 44px, as every tile now is (950)', where: 'A question\'s pages (487, 508)',
uni: 'They shrink to the 36px tile size.' },
{ id: 'search-icon', say: 'The search box\'s magnifier stays 18px while every other mark is 16px', where: 'Find (487)',
uni: 'The magnifier is 16px like every tile\'s mark.' },
{ id: 'whole-widgets', say: 'Reels cannot be merged', where: 'Widget columns (480)',
uni: 'They get Merge with the card above like every other widget.' },
{ id: 'library-one-card', say: 'Library cards holds one card, with no Add another', where: 'Settings (489)',
uni: 'Several cards, with Add another, like every other list.' },
{ id: 'tell-admin', say: 'Posts say "Tell the admin" instead of "Suggest a change"', where: 'Posts (494)',
uni: 'They say "Suggest a change" like everything else; the admin is still emailed at once.' },
{ id: 'kjv-admin', say: 'The Bible is shown to admins only', where: 'Find (490, 504)',
uni: 'Anyone of age sees it, like the Talmud and the Quran.', flip: true },
{ id: 'finder-members', say: 'Signed out, Find answers only Settings (Sign in and Join), Booking (its steps; Send asks you to sign in) and the library (never questions or Practice)', where: 'Find (C+, 1040)',
uni: 'Signed out, Find answers everything, as signed in.' },
{ id: 'keep-basket', say: 'The basket can never be deleted', where: 'Shop (462)',
uni: 'Delete on it like every other widget.', lock: 'It is the one place a shop order is paid; without it nobody could pay.' },
{ id: 'admin-cols', say: 'Business and Site cards stay on those 2 columns and admin-only columns made past Site (508), and no other card moves onto them', where: 'Business and Site (491)',
uni: 'Any card moves to any column.', lock: 'A card moved onto an admin column would vanish for everyone but an admin.' },
{ id: 'people-no-merge', say: 'A card drawn a page a person (Tutor directory, Every student, Every parent) cannot be merged', where: 'Profile columns (480)',
uni: 'Merge on them too.', lock: 'A merged card is one page, and people cannot be stacked on one.' },
{ id: 'items-no-move', say: 'The Camera and What\'s missing have Delete but no move tiles', where: 'Feed and Find (487, 525)',
uni: 'Move tiles like every card.', lock: 'Their column\'s own code places them; there is nothing to move them with yet.' },
{ id: 'form-save-row', say: 'A settings form keeps its own Save row instead of joining the card\'s tile row', where: 'Settings (489)',
uni: 'One joined row like every other card.', lock: 'Joining it moved Add a qualification and broke a section\'s own Save.' },
{ id: 'mag-items', say: 'The Magnifier is on Find\'s items (questions, library cards, scripture), not on people, shop or feed cards', where: 'Every card\'s tile row (463, 502)',
uni: 'A Magnifier on every card.' },
{ id: 'speed-long', say: 'Speed read is on long words (content, practicals, projects, a Bible verse), not on a question', where: 'Every card\'s tile row (403, 502)',
uni: 'Speed read on a question\'s words too.' },
{ id: 'hear-lang', say: 'Hear it is only on Spanish, French, German and Russian content cards', where: 'Content cards (427)',
uni: 'Hear it on every card.', lock: 'It reads the foreign-language half of each line; nothing else has one.' },
];
const RULE_OF_ = id => RULES.find(r => r.id === id) || null;
const RULES_STORE = 'familyRules';
const RULES_HIST_MAX = 20;
let RULES_MEMO = { src: undefined, out: null };
let RULES_KEPT;
function rulesSane_(v) {
let o = v;
if (typeof o === 'string') { try { o = JSON.parse(o); } catch (e) { return null; } }
if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
const set = {}, s = o.set && typeof o.set === 'object' ? o.set : {};
Object.keys(s).forEach(k => { const r = RULE_OF_(k); if (r && !r.lock && s[k] === 'universal') set[k] = 'universal'; });
const ok = x => x === 'exception' || x === 'universal';
const hist = (Array.isArray(o.hist) ? o.hist : []).filter(h => h && RULE_OF_(h.id) && !RULE_OF_(h.id).lock && ok(h.was) && ok(h.to))
.slice(-RULES_HIST_MAX).map(h => ({ id: String(h.id), was: h.was, to: h.to, at: String(h.at || '').slice(0, 40) }));
return { set: set, hist: hist };
}
function rulesKept_() {
if (RULES_KEPT !== undefined) return RULES_KEPT;
try { RULES_KEPT = rulesSane_(keep_.get(RULES_STORE)); } catch (e) { RULES_KEPT = null; }
return RULES_KEPT;
}
function rulesNow_() {
let sent = false, src;
try { sent = !!DATA && Object.prototype.hasOwnProperty.call(DATA, 'rules'); src = sent ? DATA.rules : undefined; } catch (e) { sent = false; }
if (!sent) return rulesKept_();
if (src === RULES_MEMO.src) return RULES_MEMO.out;
const out = rulesSane_(src);
RULES_MEMO = { src: src, out: out };
RULES_KEPT = out;
keep_.put(RULES_STORE, out ? JSON.stringify(out) : null);
rulesMark_();
return out;
}
function ruleOn_(id) {
const r = RULE_OF_(id);
if (!r || r.lock) return true;
const s = rulesNow_();
const marked = !!(s && s.set && s.set[id] === 'universal');
return r.flip ? marked : !marked;
}
function rulesMark_() {
try {
const uni = [];
if (!ruleOn_('tap-44')) uni.push('tap-44');
if (!ruleOn_('search-icon')) uni.push('search-icon');
if (uni.length) document.documentElement.setAttribute('data-uni', uni.join(' '));
else document.documentElement.removeAttribute('data-uni');
} catch (e) { }
}
rulesMark_();
;
/* js/cards-people.js */
function passFor_(name) {
const n = norm(name);
if (!n) return null;
return (DATA.tutors || []).find(t => norm(t.title) === n) || null;
}
function meCard(given) {
if (!USER) return '';
const face = String((USER.profile || {}).photo || USER.photo || '');
const mine = given || passFor_(USER.name);
if (mine) {
return findCard({ kind: 'tutor', row: mine });
}
return renderCard(shapeCard_('person', { kind: 'me', look: 'is-widget', name: USER.name, picture: profFace_({ kind: 'me', key: USER.personId, row: { image: face, personId: USER.personId } }),
tags: [{ text: nameBesideHandle_(USER.name, USER.handle), colour: 0 }], body: USER.handle ? [{ type: 'text', look: 'prof-handle', text: '@' + USER.handle }] : [] }));
}
function profList_(v) {
const seen = new Set();
return (Array.isArray(v) ? v : String(v == null ? '' : v).split(','))
.map(x => String(x == null ? '' : x).trim()).filter(Boolean)
.filter(x => { const k = x.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}
function teachGroups_(list) {
const out = [], at = {};
profList_(list).forEach(p => {
const subject = subjectIn_(p), level = levelIn_(p), k = norm(subject);
if (!k) return;
if (!at[k]) out.push(at[k] = { subject, levels: [] });
if (level && !at[k].levels.some(l => norm(l) === norm(level))) at[k].levels.push(level);
});
return out;
}
const teachChip_ = (g, main) => ({ pill: true, look: main ? 'is-main' : '', text: [{ marked: g.subject }, g.levels.length ? { levels: g.levels } : ''] });
const profQualV_ = v => String(v == null ? '' : v).trim();
const profQualNow_ = p => /^present$/i.test(profQualV_(p.received));
function profQualSay_(p) {
const v = k => profQualV_(p[k]);
return [v('subject'), v('level'), v('grade') && 'grade ' + v('grade'), v('board') && 'at ' + v('board'),
profQualNow_(p) ? 'studying now' : v('received')].filter(Boolean).join(', ');
}
function profQualChip_(p) {
const v = k => profQualV_(p[k]);
const subject = v('subject'), level = norm(v('level')) === norm(subject) ? '' : v('level'), grade = v('grade'), say = profQualSay_(p);
const low = grade ? { marked: grade } : profQualNow_(p) ? { i: 'studying' } : null;
if (p.kind === 'cert' || !(level || low)) return { pill: true, say, text: { marked: [subject, level, grade].filter(Boolean).join(' ') } };
return { pill: true, look: 'prof-q', say, text: { iso: subject, sup: level ? { marked: level } : null, sub: low } };
}
const profTagRow_ = (look, tags) => (tags.length ? { type: 'tags', look: 'prof-tags prof-teach ' + look, tags } : null);
function profQuals_(t, kind) {
const parts = Array.isArray(t.qualsParts) ? t.qualsParts.filter(p => p && profQualV_(p.subject)) : [];
if (!parts.length) return [profTagRow_('prof-quals', profList_(t.quals).map(text => ({ pill: true, text })))];
const at = {}, rows = [];
parts.map(p => Object.assign({}, p, { level: qualLevel_(p.level) })).forEach(p => {
const k = p.level;
if (!at[k]) rows.push(at[k] = { rank: qualRank_(k), list: [] });
at[k].list.push(p);
});
return rows.map((r, i) => [r, i]).sort((a, b) => (a[0].rank - b[0].rank) || (a[1] - b[1])).map(([r]) => {
const Q = (((typeof ITEM_KINDS !== 'undefined' && ITEM_KINDS.kinds[kind || 'tutor']) || {}).card || {}).quals || {}, cap = Number(Q[r.list[0].level]) || 0;
const g = p => { const v = (Q.grades || {})[profQualV_(p.grade).toUpperCase()]; return v == null ? -1 : Number(v); };
const list = cap ? r.list.map((p, i) => [p, i]).sort((a, b) => (g(b[0]) - g(a[0])) || (a[1] - b[1])).slice(0, cap)
.sort((a, b) => a[1] - b[1]).map(a => a[0]) : r.list;
const seen = {}, groups = [];
list.forEach(p => { const k = norm(profQualV_(p.subject)); if (!seen[k]) groups.push(seen[k] = []); seen[k].push(p); });
return profTagRow_('prof-quals', [].concat(...groups).map(profQualChip_));
});
}
const profJobSay_ = j => [j.role, j.where, [j.from, j.to].filter(Boolean).join('–')].map(v => String(v || '').trim()).filter(Boolean).join(' · ');
function profJobs_(t) {
const says = (Array.isArray(t.jobs) ? t.jobs : []).filter(j => j && !String(j.to || '').trim()).map(profJobSay_).filter(Boolean);
return profTagRow_('prof-jobs', says.map(text => ({ pill: true, text })));
}
function profRange_(lo, hi, one, many) {
const a = Number(lo) || 0, b = Number(hi) || 0;
if (a <= 1 && !b) return '';
const word = n => n === 1 ? one : many;
if (a && b && a !== b) return a + '–' + b + ' ' + word(b);
if (a && b) return a + ' ' + word(a);
if (a) return a + '+ ' + word(a);
return 'up to ' + b + ' ' + word(b);
}
function profAge_(v) {
const s = String(v == null ? '' : v).trim();
if (/^adults?$/i.test(s) || /^18\s*\+$/.test(s)) return Infinity;
return /^\d{1,3}$/.test(s) ? (Number(s) || null) : null;
}
function profAges_(t) {
let a = profAge_(t.ageMin), b = profAge_(t.ageMax);
if (a == null && b == null) return '';
if (a != null && b != null && a > b) { const x = a; a = b; b = x; }
if (a === Infinity) return 'Adults';
if (a == null) return b === Infinity ? text_('all-ages') : text_('ages-up-to') + b;
if (b == null || b === Infinity) return 'Ages ' + a + '+';
return a === b ? 'Age ' + a : 'Ages ' + a + '–' + b;
}
function profFacts_(t) {
const y = String(t.yrsExp == null ? '' : t.yrsExp).trim();
const exp = !y || y === '0' ? '' : /^\d+$/.test(y) ? (y === '1' ? '1 year' : y + ' years') : y;
return [exp ? exp + ' experience' : '',
profAges_(t),
profRange_(t.minStudents, t.maxStudents, 'student', 'students'),
profRange_(t.minHours, t.maxHours, 'hour', 'hours')].filter(Boolean);
}
function profPlaces_(names) {
return profTagRow_('prof-places', (names || []).map(text => ({ pill: true, text })));
}
function profAvail_(t) {
if (!t || typeof weekGrid_ !== 'function' || typeof availSet_ !== 'function') return null;
if (t.avail === undefined) return null;
const on = availSet_(t.avail);
const ticked = Object.keys(on);
if (!ticked.length) {
return { type: 'text', look: 'prof-say prof-nohours', text: 'Hasn\u2019t set usual hours yet \u2014 ask for any hour; they accept or decline.'
+ (typeof may_ === 'function' && may_('admin') ? text_('they-tick-them-in-settings-under') : '') };
}
const busy = {};
const b = t.busy;
if (Array.isArray(b)) b.forEach(c => { busy[norm(c)] = true; });
else if (b && typeof b === 'object') Object.keys(b).forEach(c => { if (b[c]) busy[norm(c)] = b[c]; });
const hours = (typeof SLOT_HOURS !== 'undefined' && SLOT_HOURS.length) ? SLOT_HOURS : SHARED_SETTINGS.hours;
const SD = (typeof SLOT_DAYS !== 'undefined' && SLOT_DAYS) || [];
const days = SD.map(([p, label]) => {
const cells = hours.map(h => {
const code = p + String(h).padStart(2, '0');
return { h, code, lit: !!on[code] && !busy[code], busy: !!on[code] && !!busy[code] };
});
return { label, hours: cells };
}).filter(d => d.hours.some(c => c.lit || c.busy));
if (!days.length) {
return { type: 'text', look: 'prof-say prof-hid prof-nofree', text: text_('no-free-hours-this-week-2') + (typeof may_ === 'function' && may_('admin')
? text_('every-hour-they-have-ticked-is') + fmtDate_(hours[0], 'hours', hours[hours.length - 1]) + ', the hours a session can be booked at.' : '') };
}
const hoursOn = which => days.map(d => {
const hs = d.hours.filter(which).map(c => fmtDate_(c.h, 'hours', c.h + 1));
return hs.length ? fmtDate_(d.label, 'day') + ' ' + hs.join(', ') : '';
}).filter(Boolean).join('; ');
const said = hoursOn(c => c.lit);
const taught = hoursOn(c => c.busy);
const line = which => profDaysRun_(SD.map(([p, label]) => {
const d = days.find(x => x.label === label);
const hs = d ? d.hours.filter(which).map(c => c.h) : [], spans = [];
hs.forEach(h => { const l = spans[spans.length - 1]; if (l && l[1] === h) l[1] = h + 1; else spans.push([h, h + 1]); });
return { day: fmtDate_(label, 'day'), hours: spans.length ? profSpan_(spans[0]) + (spans.length > 1 ? ' +' + (spans.length - 1) : '') : '' };
}));
return { type: 'hours', count: ticked.length, free: line(c => c.lit), busy: line(c => c.busy),
say: (said ? 'Available ' + said : text_('no-free-hours-this-week')) + (taught ? '. Already teaching ' + taught : '') };
}
function profDaysRun_(week) {
const same = list => list.length && list[0].hours && list.every(d => d.hours === list[0].hours);
const none = list => list.every(d => !d.hours);
if (week.length === 7) {
const wd = week.slice(0, 5), we = week.slice(5);
if (same(week)) return ['Every day ' + week[0].hours];
const W = same(wd) ? 'Weekdays ' + wd[0].hours : '', E = same(we) ? 'Weekends ' + we[0].hours : '';
if ((W || none(wd)) && (E || none(we)) && (W || E)) return [W, E].filter(Boolean);
}
const out = [];
week.forEach((d, i) => {
const l = out[out.length - 1];
if (d.hours && l && l.hours === d.hours && l.at === i - 1) { l.to = d.day; l.at = i; }
else if (d.hours) out.push({ from: d.day, to: '', hours: d.hours, at: i });
});
return out.map(r => r.from + (r.to ? '–' + r.to : '') + ' ' + r.hours);
}
const profRunsSay_ = runs => profDaysRun_(((typeof SLOT_DAYS !== 'undefined' && SLOT_DAYS) || []).map(([, label]) => ({ day: fmtDate_(label, 'day'),
hours: runs.filter(r => r.dayName === label).map(r => fmtDate_(r.hour, 'hours', r.hour + r.hours)).join(', ') })));
const profSpan_ = ([a, b]) => fmtDate_(a, 'hours', b);
function profSeat_(t) {
if (!(Number(t.rate) > 0) || typeof seatShare_ !== 'function') return 0;
const s = seatShare_(t);
return Math.round(Number(t.rate) * (s.cUsed + s.bUsed) * 100) / 100;
}
function rateRange_(t) {
const r = Number(t && t.rate);
if (!(r > 0)) return '';
const say = n => fmtMoney_(n);
const max = Math.round(Number(t.maxStudents)) || 1, seat = profSeat_(t);
return max > 1 && seat > 0 ? say(r) + '–' + fmtMoney_(r + seat * (max - 1), 'hour').slice(1) : fmtMoney_(r, 'hour');
}
function profFace_(x, size) {
const t = kcRow_(x), k = typeof picKind_ === 'function' ? picKind_(t.image) : (t.image ? 'photo' : '');
if (k === 'photo') return { src: pic(t.image), alt: '' };
const svg = k === 'basic' && typeof pfpArt_ === 'function' ? pfpArt_(pfpChoice_(t.image), size || 96) : '';
return { svg: svg || (typeof kcPicOr_ === 'function' ? kcPicOr_(x, '') : '') };
}
const profPill_ = (text, colour, look) => ({ pill: true, text, colour, look });
const profNote_ = t => (t.listed === false ? (t.pending ? text_('they-ticked-tutor-in-their-settings')
: text_('clients-cannot-see-them-the-crossed')) : '');
const profRoleWords_ = t => (profList_(t.titles).length ? profList_(t.titles) : [t.role || '']).filter(v => v && !/^tutor$/i.test(String(v).trim()));
const profPills_ = (it, t) => [profPill_(fmtName_(t), 0, 'prof-tag-name')].concat(profRoleWords_(t).map(v => profPill_(v, 1)),
'rate' in ((it.live || {}).money || {}) ? [profPill_(it.live.money.rate, 4, 'prof-tag-rate')] : [], t.activity ? [profPill_(t.activity, 3, 'prof-act')] : [],
t.listed === false ? [profPill_(t.pending ? 'asked to tutor' : 'not listed', 9, 'prof-off')] : []);
function profTagRows_(t) {
const main = profList_(t.teachesSpec || t.teachesMain), also = profList_(t.teaches).filter(v => !main.includes(v));
return [main.length ? { look: 'prof-tags prof-teach', tags: teachGroups_(main).map(g => teachChip_(g, true)) } : null,
also.length ? { look: 'prof-tags prof-teach', tags: teachGroups_(also).map(g => teachChip_(g, false)) } : null,
profTagRow_('prof-facts', profFacts_(t).map(text => ({ pill: true, text })))].filter(Boolean);
}
;
/* js/cards-parts.js */
const KC_PARTS = ['pic', 'head', 'tags', 'lines', 'act'];
let CARD_VIEWER;
const KC_BARE = { cls: '', pic: ['kindPic'], title: ['name'], tags: ['facets'], lines: [], tiles: [] };
const kcRow_ = x => (x && x.row) || {};
const kcPct_ = m => (typeof m !== 'number' || !isFinite(m) ? '' : m === 1 ? dash_() : (m > 1 ? '+' : '−') + Math.abs(Math.round((m - 1) * 100)) + '%');
const KC_FIELDS = {
kindPic: () => '',
name: x => cardBlock_({ type: 'group', tag: 'h3', text: x.name || '' }),
ownPic: x => (x.kcOwn || {}).pic || '',
ownHead: x => (x.kcOwn || {}).head || '',
ownTags: x => (x.kcOwn || {}).tags || (kcField_('facets') || (() => ''))(x),
ownLines: x => (x.kcOwn || {}).lines || '',
};
const kcField_ = k => KC_FIELDS[k] || (window.KC_FIELDS_MORE || {})[k];
const KC_DEFAULT = {
tutor: { cls: 'is-widget is-prof', pic: [], title: [], tags: [], lines: [], tiles: ['book-with:book:Book'] },
venue: { cls: 'venue-door', pic: [], title: [], tags: [], lines: [], tiles: [] },
level: { cls: 'is-level', pic: [], title: [], tags: [], lines: [], tiles: ['book-with:book:Book'] },
subject: { cls: 'is-subject', pic: [], title: [], tags: [], lines: [], tiles: ['book-with:book:Book'] },
manuscript: { cls: 'hdb hdb-msc lib-c', pic: [], title: [], tags: [], lines: [], tiles: ['file-view:ext:Source'] },
writing: { cls: 'hdb lib-c', pic: [], title: [], tags: [], lines: [], tiles: [] },
event: { cls: 'hdb lib-c', pic: [], title: [], tags: [], lines: [], tiles: ['file-view:ext:Source'] },
people: { cls: 'person lib-c', pic: [], title: [], tags: [], lines: [], tiles: [] },
post: { cls: 'post-fc', pic: [], title: [], tags: [], lines: [], tiles: ['react:heart:Like'] },
receipt: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: ['job-pay:pound:Pay'] },
question: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
answer: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
shop: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: ['cart-add:cart:Buy'] },
practical: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
project: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
content: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
insert: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
spec: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
timeline: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
fight: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
bible: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
talmud: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
quran: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
worktext: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
hadith: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
writ: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
pdtext: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
orthotext: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
hymn: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
mech: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
chem: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
hist: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
soon: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
person: { cls: 'is-prof', pic: [], title: [], tags: [], lines: [], tiles: [] },
setting: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
health: { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] },
offPosts: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
offShop: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
offBooking: { cls: '', pic: [], title: [], tags: [], lines: [], tiles: [] },
};
const KC_OWN_SPEC = { cls: '', pic: ['ownPic'], title: ['ownHead'], tags: ['ownTags'], lines: ['ownLines'], tiles: [] };
function kcSpec_(kind) {
const rows = (typeof DATA !== 'undefined' && DATA && DATA.cardFields) || KC_DEFAULT;
return rows[kind] || KC_BARE;
}
function kcOffOpts_(x, html) {
const s = x && x.key ? kcSpec_(x.kind) : null;
if (!s || !(s.tiles || []).length) return [];
return s.tiles.map(t => { const [act, icon, label] = String(t).split(':');
return new RegExp('data-do="' + act + '"').test(html) ? null : { icon, label: label || act, act, off: true, cls: 'kc-off' }; }).filter(Boolean);
}
const KC_VOID = /^(area|base|br|col|embed|hr|img|input|link|meta|source|track|wbr)$/;
const KC_ATTRS = '((?:\\s+[^\\s=>\\/]+(?:\\s*=\\s*(?:"[^"]*"|\'[^\']*\'|[^\\s>]+))?)*)';
function kcKids_(html) {
const re = new RegExp('<!--[\\s\\S]*?-->|<(\\/?)([a-zA-Z][\\w-]*)' + KC_ATTRS + '\\s*(\\/?)>', 'g'), out = [];
let depth = 0, start = 0, top = null;
const loose = to => { if (html.slice(start, to).trim()) out.push({ tag: '', cls: '', html: html.slice(start, to), inner: '' }); };
for (let m; (m = re.exec(html));) {
if (!m[2]) continue;
const tag = m[2].toLowerCase(), close = !!m[1], self = !close && (!!m[4] || KC_VOID.test(tag));
if (!close && depth === 0) { loose(m.index); top = { tag, cls: (/\bclass\s*=\s*"([^"]*)"/.exec(m[3]) || [, ''])[1], attrs: m[3], at: m.index, from: re.lastIndex }; start = m.index; }
if (self) { if (depth === 0) { out.push(Object.assign(top, { html: m[0], inner: '' })); top = null; start = re.lastIndex; } continue; }
if (!close) { depth++; continue; }
if (depth === 0) continue;
if (--depth === 0 && top) { out.push(Object.assign(top, { html: html.slice(top.at, re.lastIndex), inner: html.slice(top.from, m.index) })); top = null; start = re.lastIndex; }
}
loose(html.length);
return out;
}
function kcSplit_(html) {
const els = kcKids_(String(html || '')), card = els.length === 1 ? els[0] : null;
if (!card || card.tag !== 'div') return null;
const parts = { cls: card.cls, attrs: String(card.attrs || '').replace(/\s+class\s*=\s*"[^"]*"/, ''), pic: '', head: '', tags: '', lines: '' };
const walk = list => list.forEach(k => {
const c = ' ' + k.cls + ' ';
if (/ (thing|[\w]+-body) /.test(c) && !/ kc-items /.test(c) && k.tag === 'div') return walk(kcKids_(k.inner));
if (!parts.pic && (/^(img|svg|figure|canvas)$/.test(k.tag) || /[ -](pic|art) /.test(c))) parts.pic = k.html;
else if (!parts.head && (/^h[1-4]$/.test(k.tag) || / ([\w-]+-)?(head|title) /.test(c))) parts.head = k.html;
else if (/ [\w-]*tags /.test(c)) parts.tags = !parts.tags ? k.html : /<\/div>\s*$/.test(parts.tags) ? parts.tags.replace(/<\/div>\s*$/, m => k.inner + m) : parts.tags + k.html;
else parts.lines += k.html;
});
walk(kcKids_(card.inner));
return parts;
}
const KC_TILE_RE = /<(button|a)\b[^>]*\bclass="tile\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g;
const kcAct_ = t => (/\bdata-do="([^"]*)"/.exec(t) || [])[1] || '';
const KC_MAIN_ACTS = ['find-open', 'book-with'];
function kcFour_(x, rest, main) {
const all = String(rest || '').match(KC_TILE_RE) || [];
const spec = x && x.kind ? kcSpec_(x.kind) : KC_BARE;
const first = String((spec.tiles || [])[0] || '').split(':')[0];
const pick = test => { const t = all.find(test); if (t) all.splice(all.indexOf(t), 1); return t || ''; };
main = main || pick(t => first && kcAct_(t) === first) || pick(t => /\bis-(submit|buy)\b/.test(t))
|| pick(t => KC_MAIN_ACTS.indexOf(kcAct_(t)) >= 0) || pick(t => !/^(fav|card-share|find-top|rep-flag|game-lock)$/.test(kcAct_(t)) && !/\bis-(admin|danger)\b/.test(t));
if (!(x && x.key)) return cardBlock_({ type: 'group', tag: 'span', look: 'kc-four', inner: String(rest || '').replace(KC_TILE_RE, t => (/\sdisabled[\s>]/.test(t) && !/data-do="rep-flag"/.test(t) ? '' : t)) });
const star = '';
const lead = main || pick(t => kcAct_(t) === 'card-share') || tile_({ icon: 'share', label: 'Share', act: 'card-share', off: !(x && x.key), data: { key: (x && x.key) || '' } });
const left = all.reduce((h, t) => h.replace(t, ''), [main, lead, star].reduce((h, t) => (t ? h.replace(t, '') : h), String(rest || '')));
return cardBlock_({ type: 'group', tag: 'span', look: 'kc-four', inner: lead + star + all.join('') + left });
}
function kcActRow_(x, html, own, o) {
o = o || {};
if (/class="[^"]*\bkc-four\b/.test(html)) return '';
let rest = own || '';
try { rest += x && x.key && typeof cardRow_ === 'function' ? cardRow_(x, true) : ''; } catch (e) { oops_(e, 'card:tiles'); }
const real = (String(own || '').match(KC_TILE_RE) || []).map(kcAct_);
rest = rest.replace(KC_TILE_RE, t => (/\bkc-off\b/.test(t) && real.indexOf(kcAct_(t)) >= 0 ? '' : t));
return cardBlock_({ type: 'group', look: 'tile-row kc-row' + (o.look ? ' ' + o.look : ''), attrs: { 'data-key': o.look ? String(o.key || '') : null },
inner: (f => (o.look === 'qt-row' && typeof qtAll_ === 'function' ? f.replace(/^(<span[^>]*>)([\s\S]*)(<\/span>)$/, (m, a, b, c) => a + qtAll_(b) + c) : f))(kcFour_(x, rest + tile_(kcOffOpts_(x, rest)), o.main)) });
}
function kcHoist_(html, panel) {
if (new RegExp('class="[^"]*\\b(' + (panel ? '' : 'kc-four|') + 'kc-items)\\b').test(html)) return { lines: html, tiles: '' };
let tiles = '';
const lines = kcKids_(String(html || '')).map(k => {
if (k.tag === 'div' && / tile-row /.test(' ' + k.cls + ' ')) { tiles += k.inner; return ''; }
return k.html;
}).join('');
return { lines, tiles };
}
const kcSays_ = (tags, name) => norm(String(tags || '').replace(/<[^>]+>/g, ' ').replace(/&#0*39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')).indexOf(norm(name)) >= 0;
function kcTagFirst_(tags, name) {
const tag = `${qtag_(`${esc(name)}`, ` data-tag="0"`)}`;
return /^\s*<(div|span) class="[^"]*\bqtags\b[^"]*"[^>]*>/.test(tags || '') ? String(tags).replace(/^(\s*<(?:div|span) class="[^"]*\bqtags\b[^"]*"[^>]*>)/, m => m + tag) : cardBlock_({ type: 'group', look: 'qtags', inner: tag }) + (tags || '');
}
const KC_TAG_MAX = 30;
const KC_WHOLE_KINDS = ['question', 'answer', 'setting', 'health'];
const kcAttrsOf_ = at => { const a = {};
String(at || '').replace(/([\w:-]+)(?:="([^"]*)")?/g, (m, k, v) => { if (!(k in a)) a[k] = v == null ? true
: v.replace(/&quot;/g, '"').replace(/&#0*39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'); return m; }); return a; };
function kcTidy_(tags, lines, name) {
const words = h => String(h || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&[a-z#0-9]+;/g, ' ').trim();
const moved = [];
tags = String(tags || '').replace(/<span class="qtag\b[^"]*"([^>]*)>((?:(?!<\/?span\b)[\s\S])*)<\/span>/g, (m, at, inner) =>
(/data-tag="0"/.test(at) || words(inner).length <= KC_TAG_MAX ? m : (moved.push(cardBlock_({ type: 'group', tag: 'p', look: 'kc-credit', inner })), '')));
lines = String(lines || '').replace(/<h([1-4])\b([^>]*)>([\s\S]*?)<\/h\1>/g, (m, n, at, inner) => {
if (name && norm(words(inner)) === norm(name)) return '';
const a = kcAttrsOf_(at);
return cardBlock_({ type: 'group', tag: 'p', look: 'kc-h' + (a.class ? ' ' + a.class : ''), attrs: Object.assign(a, { class: null, role: 'heading', 'aria-level': n }), inner });
});
return { tags, lines: lines + moved.join('') };
}
function kcPicked_() {
const f0 = typeof STUFF !== 'undefined' && STUFF && STUFF.filters, f = Array.isArray(f0) ? f0 : [];
const said = new Set();
f.filter(c => c && !c.any).forEach(c => { said.add(norm(String(c.value))); try { if (typeof chipShow_ === 'function') said.add(norm(String(chipShow_(c) || ''))); } catch (e) { oops_(e, 'card:chip'); } });
said.delete('');
return said;
}
function kcUnpicked_(html) {
const said = kcPicked_();
if (!said.size) return html;
return String(html || '').replace(/<span class="(?:qtag|prof-tag)(?![^"]*prof-tag-name)[^"]*"[^>]*>([^<]*)<\/span>/g, (m, t) => (said.has(norm(t.replace(/&amp;/g, '&'))) ? '' : m));
}
function kcPicOr_(x, html) {
html = String(html || '');
if (KC_PERSON_KINDS.indexOf(x && x.kind) < 0) return kcRealPic_(html) ? html : '';
if (html.trim()) return html;
const art = typeof PFP_ART === 'object' && PFP_ART ? PFP_ART : {};
const named = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.defaultPictures) ? DATA.defaultPictures : []).filter(n => art[n]);
const list = named.length ? named : (typeof PFP_PICTURES !== 'undefined' ? PFP_PICTURES : []).filter(n => art[n]);
if (!list.length || typeof pfpArt_ !== 'function') return '';
const r = kcRow_(x), k = String(r.personId || (x && (x.key || x.name)) || ''); let h = 0;
for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
return pfpArt_(list[h % list.length], 96);
}
const kcRealPic_ = h => /<(img|video|picture)\b|mfrclip-|class="(mech|tl)-pic"/.test(String(h || ''));
const kcSurcharge_ = (t, kind) => { if (kind === 'level' && !t.priced) return { label: 'Surcharge', value: text_('not-priced-yet'), tone: 'bad' };
return kcPct_(t.mult) || t.mult === 1 ? { label: t.mult === 1 ? text_('no-surcharge') : 'Surcharge', value: kcPct_(t.mult) } : null; };
const REFERENCE_LINES_ = {
surcharge: (t, L, k) => kcSurcharge_(t, k),
levels: (t, L) => (L.levels.length ? { label: 'Levels', value: L.levels.join(', ') } : null),
noTutors: (t, L) => (L.tutors.length ? null : { label: 'Tutors', value: text_('none-yet'), tone: 'bad' }),
subjects: (t, L) => (L.subjects.length ? { label: 'Subjects', value: L.subjects.map((v, i) => [i ? ', ' : '', { word: 'subject', text: v }]) } : { label: 'Subjects', value: text_('none-yet'), tone: 'bad' }),
tutors: (t, L) => { const n = L.tutors.length; return { label: 'Tutors', value: n ? String(n) : (typeof NO_TUTOR === 'string' ? NO_TUTOR : text_('none-yet')), tone: n ? '' : 'bad' }; },
listed: t => (t.listed ? null : { label: text_('booking-form'), value: text_('not-offered'), tone: 'bad' }),
rooms: (t, L) => L.rooms.map(o => { const say = [o.seats ? 'up to ' + o.seats : '', 'price' in o ? (o.price ? fmtMoney_(o.price, 'hour') : 'free') : ''].filter(Boolean).join(' · ');
return say ? { label: o.label, value: say } : null; })
};
const kcListOf_ = v => (Array.isArray(v) ? v : []).filter(Boolean);
const KIND_ARG_ = /^[A-Za-z_$][\w$]*$/;
function kindGlobal_(n) { if (!KIND_ARG_.test(n)) return null; try { const f = eval(n); return typeof f === 'function' ? f : null; } catch (e) { return null; } }
function kindHook_(spec, empty) {
if (spec == null) return null;
const m = /^([A-Za-z_$][\w$]*)\((.*)\)$/.exec(String(spec));
if (!m) return c => (c.row || {})[spec];
const args = m[2].split(',').map(a => a.trim()).filter(Boolean).map(a => (KIND_ARG_.test(a) ? c => c[a] : (v => () => v)(JSON.parse(a))));
let fn = null;
return c => { fn = fn || kindGlobal_(m[1]); return fn ? fn(...args.map(g => g(c))) : empty; };
}
const KIND_EMPTY_ = { name: '', id: '', body: [], picture: null, pills: [], tagRows: [], tiles: [], sheet: [], tool: '', keep: null, data: null, look: '', off: false };
const kindCtx_ = (it, x, pic) => ({ item: it, entry: x, raw: it.raw, row: it.raw, live: it.live, entryRow: kcRow_(x), pic });
function itemMapOfKind_(k) {
const K = ITEM_KINDS.kinds[k], c = K.card, see = K.see || {}, hide = see.hide || {}, H = f => kindHook_(c[f], KIND_EMPTY_[f]);
const M = { facetOrder: (K.find || {}).facets || [] };
['card', 'tags', 'links', 'lines', 'nameTag', 'tagLook', 'entryTags', 'liveTags', 'facts', 'toolRow'].forEach(f => { if (c[f] !== undefined) M[f] = c[f]; });
if ((K.find || {}).onCard === false) M.facets = false;
if (hide.prices) M.childHides = hide.prices;
if (hide.admin) M.adminOnly = hide.admin;
if (Array.isArray(c.id)) M.id = c.id; else if (c.id) { const h = H('id'); M.id = r => h({ row: r }); }
if (c.name) { const h = H('name'); M.name = r => h({ row: r }); }
if (c.body) { const h = H('body'); M.body = (r, live) => h({ row: r, live }); }
if (c.off) { const h = H('off'); M.off = r => !!h({ row: r }); }
if (c.from) M.from = c.from === 'entry' ? x => x : c.from;
if (c.when) M.when = x => !!x[c.when];
if (c.look && typeof c.look === 'object') M.look = (it, x) => Object.keys(c.look).filter(f => x[f]).map(f => c.look[f]).join(' ');
else if (c.look) { const h = /\(/.test(c.look) ? H('look') : null; M.look = h ? (it, x) => h(kindCtx_(it, x)) || c.lookElse || '' : c.look; }
['picture', 'pills', 'tagRows', 'tiles', 'keep', 'data', 'tool', 'sheet'].forEach(f => { if (c[f]) { const h = H(f); M[f] = (it, x, pic) => h(kindCtx_(it, x, pic)); } });
if (c.parts) M.body = (r, live) => (K.bodyAs === 'reference' ? referenceBody_ : personBody_)(r, live, k);
else if (c.record) { const R = c.record; M.name = r => recordName_(R, r);
if (R.pills) M.pills = it => recordPills_(R, it); if (R.sum) M.body = (r, live) => recordSum_(R, r, live); }
else if (c.question) { const Q = c.question, stem = kindHook_(Q.stem, null), act = kindHook_(Q.actions, []);
M.picture = (it, x) => stem(kindCtx_(it, x)); M.sheet = (it, x, pic) => questionBox_(Q, x, pic); M.tiles = (it, x) => act(kindCtx_(it, x)); }
else if ((K.find || {}).from === 'store') { M.body = r => itemLines_(r, k); M.sheet = (it, x) => storeSheet_(it, x); M.tiles = (it, x) => storeTiles_(it, x); }
if (c.picture && !/\(/.test(c.picture)) M.picture = (it, x) => (x[c.picture] && typeof pic === 'function' ? { src: pic(x[c.picture]), look: 'thing-pic', alt: '' } : null);
else if (!c.picture && K.bodyAs === 'person') M.picture = it => (typeof personPicSpec_ === 'function' ? personPicSpec_(it.raw.id, it.name) : null);
if (c.price) M.pills = (it, x) => itemFacets_(M, x).concat([].concat(shopPriceTag_(x) || []).map(t => Object.assign({}, t, { data: Object.assign({}, t.data, { f: 'price' }) })));
if (K.live) { M.live = {}; Object.keys(K.live).forEach(f => { const h = kindHook_(K.live[f], null); M.live[f] = r => h({ row: r }); }); }
return M;
}
const ITEM_MAPS = Object.fromEntries(Object.keys(ITEM_KINDS.kinds).filter(k => ITEM_KINDS.kinds[k].card).map(k => [k, itemMapOfKind_(k)]));
function kcMsPic_(it, x) { const svg = typeof msFragSvg_ === 'function' ? msFragSvg_(it.raw, x && x.msSideIx) : ''; return svg ? { svg, alt: it.name } : null; }
function kcMechPic_(it) { return Array.isArray(it.raw.px) && typeof mechPic_ === 'function' ? { svg: mechPic_(it.raw.px, it.name), alt: it.name } : null; }
function kcFightName_(r) { return [r.a || r.boxer_a, r.b || r.boxer_b].filter(Boolean).join(' and '); }
function kcContentId_(r) { return r.id || [r.bookId || r.book_id, r.n == null ? r.chapter : r.n].filter(v => v != null && v !== '').join('-'); }
function kcLevels_(r) { return kcListOf_(r.levels); }
function kcSubjects_(r) { return Array.isArray(r.subjects) ? r.subjects : []; }
function kcTutorNames_(r) { return (Array.isArray(r.tutors) ? r.tutors : []).map(y => y.title); }
function kcRooms_(r) { return Array.isArray(r.rooms) && r.rooms.length ? r.rooms.slice(0, 4).map(o => ({ label: o.name || 'Room', seats: o.max, price: o.rate }))
: [{ label: text_('the-room'), seats: r.maxCapacity, price: r.bestRate }]; }
function kcVenuePic_(it, x) { const pix = typeof VENUE_PIX === 'object' && typeof venueShape_ === 'function' ? VENUE_PIX[venueShape_(it.raw)] : null; return pix ? { pix, alt: x.name } : null; }
function qCardName_(r) { return r.question != null && String(r.question) !== '' ? 'Q' + r.question + (typeof qPartName_ === 'function' ? qPartName_(r.part) : '') : ''; }
function kcQData_(it, x) { return { part: x.key || '', of: it.id || x.key || '', state: 'fav' }; }
function kcUnlisted_(r) { return r.listed === false; }
function kcTutorMoney_(r) { return r.rate ? { rate: typeof rateRange_ === 'function' ? rateRange_(r) : '' } : {}; }
function kcTutorSay_(r) { return { note: typeof profNote_ === 'function' ? profNote_(r) : '' }; }
function kcBookingMoney_(r) { const rate = Number(r.rate) || (/hour/i.test(String(r.unit || '')) ? Number(r.price) : 0) || 0;
return { rate: rate > 0 ? fmtMoney_(rate, 'hour') : '', total: r.price !== '' && r.price != null && isFinite(Number(r.price)) ? fmtMoney_(Number(r.price)) + ' in all' : '' }; }
const shopPriceTag_ = x => { const myLevel = Math.floor((Number(typeof USER !== 'undefined' && USER && USER.xp) || 0) / 10), free = x.cost === 0;
const credits = typeof collCredits_ === 'function' ? collCredits_() : 0, afford = !free && !x.pence && credits >= x.cost;
if (x.pence && typeof may_ === 'function' && !may_('prices')) return null;
if (x.level > 0) return { text: myLevel >= x.level ? 'Level ' + x.level + ' — yours' : 'Level ' + x.level, look: 'price ' + (myLevel >= x.level ? 'can' : ''), colour: false };
return x.cost === undefined ? null : { text: free ? 'free' : x.pence ? fmtMoney_(x.cost / 100) : x.cost + ' credits', look: 'price ' + (free ? 'free' : afford ? 'can' : ''), colour: false }; };
const itemLive_ = (r, M) => { const v = {}; Object.keys(M.live || {}).forEach(f => { v[f] = M.live[f](r); });
const hide = (typeof may_ === 'function' && !may_('prices') ? M.childHides || [] : []).concat(typeof may_ === 'function' && may_('admin') ? [] : M.adminOnly || []);
const strip = o => { if (Array.isArray(o)) o.forEach(strip); else if (o && typeof o === 'object') hide.forEach(k => { delete o[k]; }); };
if (hide.length) Object.keys(v).forEach(f => strip(v[f]));
return v; };
const itemList_ = v => (Array.isArray(v) ? v : String(v == null ? '' : v).split('|')).map(t => String(t).trim()).filter(Boolean);
function item_(raw, kind) {
const r = raw || {}, M = ITEM_MAPS[kind] || {}, words = col => [...new Set((M[col] || []).flatMap(c => itemList_(r[c])))];
const lines = typeof HIST_LINES === 'object' && HIST_LINES[kind] ? HIST_LINES[kind].map(([label, col]) => ({ label, value: String((typeof col === 'function' ? col(r) : r[col]) || '') })).filter(l => l.value.trim()) : [];
const live = itemLive_(r, M), own = M.body ? M.body(r, live) : null, body = Array.isArray(own) ? own : lines.length ? [{ type: 'list', items: lines }] : [];
const id = typeof M.id === 'function' ? String(M.id(r) || '') : (M.id || ['id']).map(c => String(r[c] == null ? '' : r[c]).trim()).find(Boolean) || '';
return { id, kind, name: String((M.name && M.name(r)) || r.title || r.name || r.title_english || r.title_original || r.handle || id || ''),
tags: words('tags'), body, links: words('links'), raw: r, live };
}
function cardOfItem_(it, x) {
const M = ITEM_MAPS[it.kind] || {}, own = x || { kind: it.kind, key: '', name: it.name };
if (M.keep) M.keep(it, own);
const facets = itemFacets_(M, own);
const more = tagsKept_(Object.keys(M.entryTags || {}).flatMap(f => (own[f] || []).map(t => ({ field: f, text: t, colour: M.entryTags[f], data: { f } })))
.concat(Object.keys(M.liveTags || {}).flatMap(f => ((it.live || {})[f] || []).map(t => ({ field: f, text: t, colour: M.liveTags[f], data: { f } })))));
const pic = M.picture ? M.picture(it, own) : null, pills = M.pills ? M.pills(it, own) : null;
const tool = M.tool ? itemTool_(M.tool(it, own), cardBlocks_(it.body), !!M.facts) : null, name = it.name || own.name || '';
const look = [(typeof M.look === 'function' ? M.look(it, own) : M.look) || '', tool ? tool.cls : '', M.facts ? 'kc-facts' : ''].filter(Boolean).join(' ');
const tags = Array.isArray(pills) ? pills : (M.nameTag === false && facets.length ? [] : [{ text: name, colour: 0 }]).concat(facets, more);
const body = tool ? [] : M.sheet ? M.sheet(it, own, pic) : M.lines ? it.body : [];
return shapeCard_(it.kind, { look, name, row: own.row || {}, ...(M.off ? { off: !!M.off(it.raw || {}) } : {}), picture: pic,
body, ...(tool ? { cut: tool } : {}), ...(M.facts && !tool && !body.length ? { empty: kcEmpty_() } : {}),
...(M.data || (tool && tool.state) ? { data: Object.assign(M.data ? M.data(it, own) : {}, tool && tool.state ? { state: tool.state } : {}) } : {}), ...(M.tagLook ? { tagLook: M.tagLook } : {}),
...(M.tiles ? { tiles: M.tiles(it, own) } : {}), ...(M.toolRow ? { toolRow: { key: own.key || '' } } : {}),
...(M.tagRows ? { tagRows: M.tagRows(it, own) } : {}),
tags: M.facts ? itemFactsTags_(tags, name) : tags });
}
const kindShape_ = k => { const h = ((typeof ITEM_KINDS !== 'undefined' && ITEM_KINDS.kinds[k]) || {}).shape; return typeof h === 'string' ? h : ''; };
const CARD_SLOTS_ = { Card: ['look', 'name', 'row', 'off', 'picture', 'tags', 'tagLook', 'tagRows', 'body', 'tiles', 'cut', 'empty', 'toolRow'] };
function shapeCard_(kind, s) {
const shape = kindShape_(kind), keep = CARD_SLOTS_[shape];
if (!keep) return s;
const out = { shape, data: Object.assign({ 'item-kind': kind }, s.data || {}) };
keep.concat('kind', 'key', 'id', 'card', 'item').forEach(f => { if (s[f] !== undefined) out[f] = s[f]; });
return out;
}
function itemFacets_(M, own) {
let f0 = [];
try { f0 = M.facets !== false && typeof tagList_ === 'function' && own.key ? tagList_(own) : []; } catch (e) { if (typeof oops_ === 'function') oops_(e, 'item:tags'); }
if (!Array.isArray(f0)) return [];
const at = f => { const i = (M.facetOrder || []).indexOf(f); return i < 0 ? 1e6 : i; };
return f0.map((t, i) => [t, i]).sort((a, b) => (at(a[0].field) - at(b[0].field)) || (a[1] - b[1])).map(p => p[0]);
}
function itemFactsTags_(tags, name) {
const said = kcPicked_(), lead = tags.length && tags[0].colour === 0 && String(tags[0].text) === name;
const rest = (lead ? tags.slice(1) : tags).filter(t => !said.has(norm(String(t.text))));
return (name && !kcSays_(rest.map(t => esc(String(t.text))).join('  '), name) ? [{ text: name, colour: 0 }] : []).concat(rest)
.filter(t => t.colour === 0 || String(t.text).trim().length <= KC_TAG_MAX);
}
function itemTool_(html, lead, facts) {
const cut = kcSplit_(String(html || '').trim()) || { cls: '', lines: String(html || '') };
const hoist = kcHoist_(lead + cut.lines);
const out = { cls: String(cut.cls || '').split(/\s+/).filter(c => c && !/^(card|fc|kc)$/.test(c)).join(' '), lines: hoist.lines, form: '', tiles: hoist.tiles,
state: (/\sdata-state="([^"]*)"/.exec(cut.attrs || '') || [])[1] || '' };
if (!facts) { out.lines = kcTidy_('', out.lines, '').lines; return out; }
const f = kcFacts_(out.lines);
if (f.form) { out.lines = ''; out.form = f.form; } else out.lines = (f.lines || kcEmptyLine_()) + (f.src ? kcSrc_(f.src) : '');
out.tiles += f.tiles;
kcFactsWatch_();
return out;
}
const itemMapOf_ = x => { const ks = Object.keys(ITEM_MAPS).filter(k => (ITEM_MAPS[k].card || k) === x.kind);
return ks.find(k => ITEM_MAPS[k].when && ITEM_MAPS[k].when(x)) || ks.find(k => !ITEM_MAPS[k].when) || ks[0]; };
const itemOfEntry_ = x => { const k = itemMapOf_(x), f = ITEM_MAPS[k].from; return x.shape || item_((typeof f === 'function' ? f(x) : x[f || 'row']) || {}, k); };
[...new Set(Object.keys(ITEM_MAPS).map(k => ITEM_MAPS[k].card || k))].forEach(c => cardKind_(c, x => cardOfItem_(itemOfEntry_(x), x)));
function personFacts_(id, now) {
const F = ITEM_KINDS.kinds.person.facts, d = now || new Date();
return (typeof DATA === 'object' && DATA && Array.isArray(DATA.personFacts) ? DATA.personFacts : []).filter(f => f && String(f.who) === String(id) && F.keys.indexOf(f.what) >= 0)
.map(f => ({ what: f.what, value: factAged_(f, F.ages[f.what], d) }));
}
function factAged_(f, how, now) {
const at = new Date(f.as_of), v = String(f.value == null ? '' : f.value);
if (!how || isNaN(at)) return v;
let n = 0;
if (how === 'year') n = Math.max(0, Math.floor((now - at) / 31557600000));
else for (let y = at.getFullYear(); y <= now.getFullYear(); y++) { const s = new Date(y, 8, 1); if (s > at && s <= now) n++; }
return n ? v.replace(/\d+/g, x => String(Number(x) + n)) : v;
}
const PERSON_PARTS_ = {
note: (t, L) => (((L || {}).say || {}).note ? { type: 'text', look: 'prof-say prof-hid', text: L.say.note } : null),
places: t => profPlaces_([String(t.town || '').trim()].filter(Boolean)),
hours: t => profAvail_(t),
about: t => (t.description ? { type: 'text', look: 'prof-say cut2', act: 'cut-open', text: t.description } : null),
words: t => { const w = profList_(t.tags).slice(0, 3); return w.length ? { type: 'text', look: 'prof-words', text: w.map((v, i) => (i ? [{ i: '·' }, { b: v }] : [{ b: v }])) } : null; },
photos: t => (Array.isArray(t.photos) && t.photos.length ? { type: 'photos', srcs: t.photos.map(u => pic(u)), more: 4 } : null),
jobs: t => profJobs_(t),
quals: (t, L, k) => profQuals_(t, k),
door: t => (typeof personDoorBody_ === 'function' ? personDoorBody_(t) : []),
facts: (t, L, k) => { const F = ITEM_KINDS.kinds[k].facts, facts = typeof may_ === 'function' && F.see.some(w => may_(w)) ? personFacts_(t.personId || t.id) : [];
return facts.length ? { type: 'list', items: facts.map(f => ({ label: f.what.replace(/_/g, ' '), value: f.value })) } : null; }
};
const REFERENCE_DRAWERS_ = { spec: 'specBody_', insert: 'insertBody_', topic: 'contentBody_', practical: 'practicalBody_', project: 'projectBody_', history: 'histTopicBody_' };
const referencePart_ = (p, r, L, k) => {
if (typeof p === 'string') { if (p === 'insert' && typeof insWant_ === 'function') insWant_(r); const f = kindGlobal_(REFERENCE_DRAWERS_[p]); return f ? f(r) : []; }
if (p.text) return r[p.text] ? Object.assign({ type: 'text', text: r[p.text] }, p.look ? { look: p.look } : {}) : null;
if (p.tags) return (r[p.tags] || []).length ? { type: 'tags', tags: r[p.tags] } : null;
if (p.paras) return { type: 'text', paras: [].concat(...p.paras.map(q => (q === 'fields' ? cardFieldsOf_(k, r).map(x => x.label + ' ' + x.value)
: typeof q === 'object' ? (r[q.each] || []).map(e => String(e[q.f] || '')) : [r[q] || '']))) };
return p.list ? { type: 'list', items: [].concat(...p.list.map(n => [].concat(REFERENCE_LINES_[n](r, L, k)))).filter(Boolean) } : null;
};
const referenceBody_ = (r, live, k) => ITEM_KINDS.kinds[k].card.parts.flatMap(p => [].concat(referencePart_(p, r, live, k))).filter(Boolean);
const RECORD_FACTS_ = {
when: j => (typeof rcpWhen_ === 'function' ? rcpWhen_(j) : ''),
paid: j => (typeof rcpPaid_ === 'function' ? rcpPaid_(j) : ''),
who: j => (j.slots || []).map(sl => sl && sl.client).filter(Boolean).map(n => fmtName_(n)).join(', ') || (j.client ? fmtName_(j.client) : ''),
weeks: j => { const n = Number(j.weeks || (typeof jobDates_ === 'function' ? jobDates_(j).length : 0)) || 0; return n ? n + (n === 1 ? ' week' : ' weeks') : ''; }
};
const recordWord_ = (w, r, live) => { const s = String(w), c = s.split(':');
if (s[0] === '=') return s.slice(1);
if (c[1] === 'name') return r[c[0]] ? fmtName_(r[c[0]]) : '';
if (s.indexOf('.') > 0) return s.split('.').reduce((o, f) => (o || {})[f], live) || '';
return RECORD_FACTS_[s] ? RECORD_FACTS_[s](r) : r[s]; };
const recordName_ = (R, r) => { const n = (R.name || []).map(p => [].concat(p).map(w => recordWord_(w, r, {})).find(Boolean)).filter(Boolean).join(' · ');
return R.nameMax ? String(n).slice(0, R.nameMax) : n; };
const recordPills_ = (R, it) => { const st = R.status ? recordWord_(R.status.fact, it.raw, it.live) : '';
return R.pills.map(w => ({ text: recordWord_(w, it.raw, it.live), colour: false }))
.concat(R.status ? [{ text: st, colour: false, look: (R.status.look || {})[st] || '' }] : []).filter(t => t.text); };
const recordSum_ = (R, r, live) => { const said = R.sum.map(w => recordWord_(w, r, live)).filter(Boolean).join(' · ');
return said ? [{ type: 'group', tag: 'p', look: 'rc-sum', text: said }] : []; };
const personBody_ = (r, live, k) => ITEM_KINDS.kinds[k].card.parts.flatMap(p => [].concat(PERSON_PARTS_[p](r, live, k))).filter(Boolean);
const questionBox_ = (Q, x, pic) => [{ type: 'embed', tool: Q.box.embed, look: Q.box.look, args: { key: x.key || '', pic: !!pic } }];
;
/* js/cards-make.js */
const KC_LOOK_DEFAULT = Object.fromEntries(Object.entries({ receipt: 'pound', shop: 'cart', practical: 'tools', project: 'spark', content: 'doc', insert: 'doc', timeline: 'line', fight: 'hand', bible: 'doc', talmud: 'doc', quran: 'doc', worktext: 'doc', hadith: 'doc', writ: 'doc', pdtext: 'doc', orthotext: 'doc', hymn: 'sound', chem: 'spark', soon: 'spark', person: '', setting: 'tools', health: 'tick', offPosts: 'spark', offShop: 'cart', offBooking: 'book' }).map(([k, icon]) => [k, { facts: true, icon }]));
const KC_PERSON_KINDS = ['tutor', 'person', 'people'];
const kcLook_ = kind => ((typeof DATA !== 'undefined' && DATA && DATA.cardLook) || KC_LOOK_DEFAULT)[kind] || {};
const kcEmpty_ = () => (typeof NOTHING_YET === 'string' ? NOTHING_YET : '');
const kcEmptyLine_ = () => cardBlock_({ type: 'text', look: 'kc-empty', text: kcEmpty_() });
const kcSrc_ = src => cardBlock_({ type: 'group', look: 'kc-src', attrs: { hidden: true }, inner: src });
const KC_FORM_SEL = 'input:not([type="hidden"]), select, textarea, form, .kc-items';
const KC_BLOCK = /^(P|LI|DIV|SECTION|ARTICLE|TR|DT|DD|H[1-6]|BLOCKQUOTE|PRE|UL|OL|DL|TABLE|FIGCAPTION|HEADER|FOOTER)$/;
function kcFacts_(html) {
const out = { lines: '', tiles: '', form: '', src: '' };
if (typeof document === 'undefined' || !String(html || '').trim()) return out;
const t = document.createElement('template');
t.innerHTML = html;
if (!t.content || !t.content.querySelector) return out;
if (t.content.querySelector(KC_FORM_SEL)) { const h = t.content.querySelector('h1, h2, h3, h4'); if (h) h.remove(); out.form = t.innerHTML; return out; }
t.content.querySelectorAll('[data-do], a[href], button').forEach(el => { if (el.parentNode && !el.closest('[data-kc-took]')) { el.setAttribute('data-kc-took', ''); out.tiles += el.outerHTML; el.remove(); } });
out.tiles = out.tiles.replace(/ data-kc-took=""/g, '');
const wait = t.content.querySelector('.loading');
const said = [];
const walk = node => {
let buf = '';
const flush = () => { const s = buf.replace(/\s+/g, ' ').trim(); if (s) said.push(s); buf = ''; };
node.childNodes.forEach(n => {
if (n.nodeType === 3) { buf += n.nodeValue; return; }
if (n.nodeType !== 1 || /^(SCRIPT|STYLE|SVG|IMG|CANVAS|VIDEO|TEMPLATE)$/i.test(n.nodeName) || n.hidden || n.classList.contains('loading')) return;
if (n.nodeName === 'BR' || n.nodeName === 'HR') { flush(); return; }
if (n.nodeName === 'TR') { flush(); const s = [...n.children].map(c => c.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).join(': '); if (s) said.push(s); return; }
if (KC_BLOCK.test(n.nodeName)) { flush(); walk(n); return; }
buf += ' ' + n.textContent + ' ';
});
flush();
};
walk(t.content);
out.lines = said.length ? cardBlock_({ type: 'text', paras: said }) : wait ? wait.outerHTML : '';
out.src = t.innerHTML;
return out;
}
function kcFactsWatch_() {
if (kcFactsWatch_.on || typeof MutationObserver === 'undefined' || typeof document === 'undefined' || !document.body) return;
kcFactsWatch_.on = true;
let busy = false;
const sync = (card, tiles) => { const t = document.createElement('template'); t.innerHTML = tiles;
t.content.querySelectorAll('[data-do]').forEach(n => { const old = card.querySelector(`:scope > .kc-act [data-do="${n.getAttribute('data-do')}"]`); if (old) old.replaceWith(n); }); };
const redo = src => { const card = src.closest('.card.kc'), box = card && card.querySelector(':scope > .kc-lines'); if (!box) return;
const f = kcFacts_(src.innerHTML); box.firstChild && [...box.children].filter(k => k !== src).forEach(k => k.remove());
box.insertAdjacentHTML('afterbegin', f.lines || kcEmptyLine_());
if (f.tiles) { src.innerHTML = f.src; sync(card, f.tiles); } };
const rewrap = (card, gone) => { const parts = gone.filter(n => n.nodeType === 1 && /^kc-(pic|head|tags|lines|form|act)$/.test(n.className)); if (!parts.length) return;
const f = kcFacts_(card.innerHTML), lines = parts.find(n => n.className === 'kc-lines'), form = parts.find(n => n.className === 'kc-form');
if (f.form && !form && lines) { lines.className = 'kc-form'; lines.innerHTML = f.form; }
else if (f.form && form) form.innerHTML = f.form;
else if (lines) lines.innerHTML = (f.lines || kcEmptyLine_()) + (f.src ? kcSrc_(f.src) : '');
card.replaceChildren(...parts); if (f.tiles) sync(card, f.tiles); };
new MutationObserver(list => { if (busy) return; busy = true; const seen = new Set();
try {
list.forEach(m => { const el = m.target.nodeType === 1 ? m.target : m.target.parentElement;
if (el && el.matches && el.matches('.card.kc.kc-facts') && m.removedNodes.length && !el.querySelector(':scope > .kc-act')) { rewrap(el, [...m.removedNodes]); return; }
const src = el && el.closest && el.closest('.kc-src'); if (src) seen.add(src); });
seen.forEach(redo);
} catch (e) { oops_(e, 'card:facts'); } finally { busy = false; } }).observe(document.body, { subtree: true, childList: true, characterData: true });
}
function findCard(x, credits) {
if (x && x.kind && CARD_KINDS[x.kind] && !x.kcPanel && !x.ownCard) return cardOfKind_(x);
const own = x && !x.kcOwn && x.kind && (window.KC_OWN || {})[x.kind];
if (own) {
let got = '';
try { got = own(x, credits); } catch (e) { oops_(e, 'card:' + x.kind); }
if (typeof got !== 'string' || !got || /^\s*<div class="card fc kc\b/.test(got)) return got || '';
const els = kcKids_(got), many = els.length > 1 && els.every(k => k.tag === 'div' && / card /.test(' ' + k.cls + ' '));
const cuts = (many ? els.map(k => k.html) : [got]).map(kcSplit_);
return cuts.every(Boolean) ? cuts.map(cut => findCard(Object.assign({}, x, { kcOwn: cut }))).join('') : got;
}
const it = x && (x.row || x.kcOwn) ? x : { kind: 'subject', row: x || {} };
const t = kcRow_(it), name = it.name || t.title || t.name || '';
const one = it.name ? it : Object.assign({}, it, { name });
const s = it.kcOwn && (it.kcPanel || kcSpec_(it.kind) === KC_BARE) ? KC_OWN_SPEC : kcSpec_(it.kind);
const run = list => (list || []).map(k => { try { const f = kcField_(k); return f ? f(one) || '' : ''; } catch (e) { oops_(e, 'card:' + k); return ''; } }).join('');
const parts = { pic: run(s.pic), head: run(s.title), tags: run(s.tags), lines: run(s.lines), act: '' };
parts.pic = kcPicOr_(one, parts.pic);
parts.tags = it.kcPanel ? parts.tags : kcUnpicked_(parts.tags);
if (!parts.tags.trim() && name) parts.tags = cardBlock_({ type: 'tags', tags: [String(name)] });
if (name && parts.head && !kcSays_(parts.tags, name)) parts.tags = kcTagFirst_(parts.tags, name);
parts.head = '';
const hoist = kcHoist_(parts.lines, it.kcPanel);
parts.lines = hoist.lines;
parts.act = kcActRow_(one, it.kcPanel ? '' : parts.lines, hoist.tiles);
let facts = null;
if (kcLook_(it.kind).facts || (it.kcPanel && KC_FORMY.test(parts.lines))) {
facts = kcFacts_(parts.lines);
if (facts.form) { parts.lines = ''; parts.form = facts.form; kcFactsWatch_(); }
else { parts.lines = (facts.lines || kcEmptyLine_()) + (facts.src ? kcSrc_(facts.src) : ''); kcFactsWatch_(); }
if (facts.tiles) parts.act = kcActRow_(one, '', hoist.tiles + facts.tiles);
parts.tags = kcTidy_(parts.tags, '', name).tags;
}
if (!facts && KC_WHOLE_KINDS.indexOf(it.kind) < 0) { const tidy = kcTidy_(parts.tags, parts.lines, name); parts.tags = tidy.tags; parts.lines = tidy.lines; }
const off = (facts ? ' kc-facts' : '') + (it.kind === 'tutor' && t.listed === false ? ' is-off' : '') + (it.cardCls ? ' ' + esc(it.cardCls) : '');
const attrs = {};
Object.keys(it.cardData || {}).forEach(k => { attrs['data-' + k] = it.cardData[k] == null ? '' : String(it.cardData[k]); });
const mine = it.kcOwn || {}, ownCls = String(mine.cls || '').split(/\s+/).filter(c => c && !/^(card|fc|kc)$/.test(c)).join(' ');
const ownAttrs = cardAttrsOf_(mine.attrs || '');
Object.keys(ownAttrs).forEach(k => { if (!(k in attrs)) attrs[k] = ownAttrs[k]; });
if (!('aria-label' in ownAttrs) && !('aria-label' in attrs)) attrs['aria-label'] = String(name);
return cardBlock_({ type: 'group', look: `card fc kc kc-${it.kind || 'thing'}${s.cls ? ' ' + s.cls : ''}${ownCls ? ' ' + ownCls : ''}${off}`, attrs,
blocks: (parts.form ? ['pic', 'head', 'tags', 'lines', 'form', 'act'] : KC_PARTS).map(p => ({ type: 'group', look: 'kc-' + p, inner: parts[p] })) });
}
function qtag_(inner, attrs, cls, base) { return cardBlock_({ type: 'group', tag: 'span', look: (base || 'qtag') + (cls ? ' ' + cls : ''), attrs: cardAttrsOf_(attrs), inner }); }
const KC_FORMY = /<(input(?![^>]*type="hidden")|select|textarea|form)\b|\bkc-items\b/;
function card_(html, kind, called) {
const cut = kcSplit_(String(html || '').trim());
if (!cut) return String(html || '');
const face = !cut.pic && /<img\b[^>]*>/.exec(cut.head || '');
if (face) cut.pic = face[0];
if (cut.pic && !kcRealPic_(cut.pic)) { cut.lines = cut.pic + cut.lines; cut.pic = ''; }
const name = String((/<h[1-4]\b[^>]*>([\s\S]*?)<\/h[1-4]>/.exec(cut.head || '') || [])[1] || cut.head || '').replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
return findCard({ kind: kind || 'panel', kcOwn: cut, kcPanel: true, name: name || String(called || '') });
}
on('set-listed', el => {
const on = !el.classList.contains('on');
tileSet_(el, { label: on ? 'Listed' : text_('not-listed'), on,
note: on ? 'clients can see them' : 'clients cannot see them' });
api({ action: 'item', door: 'save', item: 'listed',
adminName: USER.name, name: USER.name,
who: el.dataset.who, whoId: el.dataset.pid || '', on })
.then(d => {
if (d && d.error) throw new Error(d.error);
toast(on ? 'Listed' : text_('hidden-from-clients'));
const id = el.dataset.pid || '';
const t = (DATA.tutors || []).find(x => (id && String(x.personId) === id)
|| norm(x.title) === norm(el.dataset.who));
if (t) { t.listed = on; t.pending = false; }
})
.catch(err => {
tileSet_(el, { label: !on ? 'Listed' : text_('not-listed'), on: !on,
note: !on ? 'clients can see them' : 'clients cannot see them' });
toast(why_(err));
});
});
document.addEventListener('change', e => {
const el = e.target.closest('[data-do]');
if (!el || !ACTIONS[el.dataset.do]) return;
if (el.tagName !== 'SELECT' && !isCheckbox_(el)) return;
try {
ACTIONS[el.dataset.do](el, e);
} catch (err) {
console.error('[' + el.dataset.do + ']', err);
toast(el.dataset.do + ' — ' + why_(err));
}
});
let BOOK_PREFILLED = false;
function bookPrefill_() {
if (BOOK_PREFILLED || !USER) return;
BOOK_PREFILLED = true;
const done = id => { BOOKING.done = uniq((BOOKING.done || []).concat([id])); };
const only = st => { try { return (st.options() || []).filter(Boolean); } catch (e) { return []; } };
if (!BOOKING.how) BOOKING.how = text_('instant-class');
if (!BOOKING.joining) BOOKING.joining = NEW_LIST;
if (!BOOKING.loc) BOOKING.loc = ((bookableSpaces().find(x => x.takesAllSeats) || {}).label) || '';
const seats = only(bookStep_('n'));
if (!BOOKING.n && seats.length) BOOKING.n = seats[0];
const chip = f => ((typeof STUFF !== 'undefined' && STUFF.filters) || []).filter(x => x && x.field === f && !x.any).map(x => String(x.value))[0] || '';
if (!(BOOKING.subjects || []).length && chip('subject')) { BOOKING.subjects = [chip('subject')]; done('subjects'); }
if (!BOOKING.level && chip('level')) BOOKING.level = chip('level');
if (!BOOKING.tutor && only(bookStep_('tutor'))[0] === text_('no-preference')) BOOKING.tutor = text_('no-preference');
const terms = only(bookStep_('interval'));
if (!(BOOKING.interval || []).length && terms.length) { BOOKING.interval = [terms[0]]; done('interval'); }
const named = only(bookStep_('kids')).filter(k => k !== UNNAMED);
const kid = named.length === 1 ? named[0] : '';
if (!(BOOKING.kids || []).length && kid) { BOOKING.kids = [kid]; done('kids'); }
}
on('book-with', el => {
closeStep_();
const d = (el && el.dataset) || {};
if (d.tutor) BOOKING.tutor = d.tutor;
if (d.subject && !(BOOKING.subjects || []).length) { BOOKING.subjects = [d.subject]; BOOKING.done = uniq((BOOKING.done || []).concat(['subjects'])); }
if (d.level && !BOOKING.level) BOOKING.level = d.level;
finderSet_(FINDERS.stuff, { filters: [{ field: DOOR_FIELD, value: 'Booking' }], show: true });
go('stuff');
});
;
/* js/form.js */
const FORM_SPECS = {"kinds":["text","number","money","choice","toggle","date","time","picture","list","pin","slider","phone","file","tick","hidden","long","ticks","toggles","search","timetable","many","doc","head","subjects","shelf","dob","shown"],"rules":[{"kind":"list","match":"^(qual_\\d+|job_\\d+|lib\\d+_|photo_\\d+)|^video$|^venues_ok$"},{"kind":"picture","match":"^photo$"},{"kind":"toggle","match":"^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)"},{"kind":"date","match":"_date$|^date_of_birth$|^dob_[dmy]$"},{"kind":"time","match":"^(m|tu|w|th|f|sa|su)\\d\\d$"},{"kind":"money","match":"rate|price|cost|fee|seat_cut"},{"kind":"number","match":"hours|km|fraction|pages|year|students|days|weeks|count|level_required|age_|_cut$"},{"kind":"choice","match":"^(borough|city|town|focus|favourite_colour)$"},{"kind":"text","match":""}],"cards":{"signing-in":{"title":"Signing in","ask":"pin-change","said":"pin-said"}}};
const FORM_TESTS = {
filled: v => String(v == null ? '' : v).trim() !== '',
email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim()),
postcode: v => /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(String(v || '').trim()),
isodate: v => /^\d{4}-\d\d-\d\d$/.test(String(v || '').trim()),
image: v => /^data:image\//i.test(String(v || '')),
pics: v => [].concat(v || []).some(x => /^data:image\//i.test(String(x || ''))),
yes: v => v === true || /^true$/i.test(String(v || '')),
yesno: v => /^(yes|no)$/i.test(String(v || '').trim()),
rate: v => Number(v) > 0 && Number(v) < 1000,
};
function formGaps_(gaps, body) {
const ok = t => { const [f, test] = t.split(':'); return FORM_TESTS[test](body[f]); };
return (gaps || []).filter(g => !(g.any ? g.any.some(l => l.every(ok)) : (g.all || []).every(ok))).map(g => g.say);
}
function phoneCodes_() {
const c = typeof PHONE_CODES !== 'undefined' ? PHONE_CODES : (typeof DATA !== 'undefined' && DATA ? DATA.phoneCodes : null);
return Array.isArray(c) && c.length ? c : ['+44'];
}
function phoneOut(cellValue) {
const codes = phoneCodes_();
let v = String(cellValue == null ? '' : cellValue).trim().replace(/^00/, '+');
if (!v) return { phone_cc: codes[0], phone_no: '' };
if (v[0] === '+') {
const digits = v.slice(1).replace(/\D/g, '');
const cc = codes.filter(c => digits.indexOf(c.slice(1)) === 0).sort((a, b) => b.length - a.length)[0];
if (cc) return { phone_cc: cc, phone_no: v.replace(/^\+\s*/, '').replace(new RegExp('^' + cc.slice(1)), '').trim() };
const m = v.match(/^\+(\d{1,4})\s*(.*)$/);
return { phone_cc: m ? '+' + m[1] : codes[0], phone_no: m ? m[2].trim() : v };
}
return { phone_cc: codes[0], phone_no: v.replace(/^0(?=\d)/, '') };
}
function phoneIn(fields) {
const t = x => String(x == null ? '' : x).trim();
const cc = /^\+\d{1,4}$/.test(t(fields.phone_cc)) ? t(fields.phone_cc) : phoneCodes_()[0];
let no = t(fields.phone_no);
const ccd = cc.slice(1);
if (/^(\+|00)/.test(no)) no = no.replace(/^(\+|00)\s*/, '').replace(new RegExp('^' + ccd + '\\s*'), '');
no = no.replace(/[^\d ]/g, ' ').replace(/\s+/g, ' ').trim();
if (cc !== '+39') no = no.replace(/^0(?=\d)/, '');
return no ? cc + ' ' + no : '';
}
const HANDLE_SHAPE = /^[a-z][a-z0-9_-]{2,29}$/;
const handleTyped_ = v => String(v == null ? '' : v).trim().replace(/^@/, '').toLowerCase();
function handleFold_(v) {
return String(v == null ? '' : v).toLowerCase()
.replace(/[^a-z0-9]/g, '')
.replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a')
.replace(/5/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/9/g, 'g');
}
FORM_SPECS.forms = Object.assign({}, ...Object.keys(ITEM_KINDS.kinds).map(k => Object.fromEntries(Object.entries(ITEM_KINDS.kinds[k].forms || {}).map(([id, f]) => [id, Object.assign({ item: k }, f)]))));
const formAsks_ = id => ((FORM_SPECS.forms[id] || {}).fields || []).map(x => x.f);
const formAsk_ = (id, f) => ((FORM_SPECS.forms[id] || {}).fields || []).find(x => x.f === f) || {};
const formArr_ = v => v == null ? [] : Array.isArray(v) ? v : [v];
function formSteps_(id, fns) {
const spec = FORM_SPECS.forms[id] || {}, fn = n => typeof n === 'string' && typeof fns[n] === 'function' ? fns[n] : null;
const pick = (row, by) => { const f = fn(by); if (f) return f(row); if (row == null || typeof row !== 'object') return row;
return formArr_(by).map(k => row[k]).find(v => v != null && v !== '') || ''; };
const holds = c => { const f = fn(c); return f ? !!f() : !!(typeof BOOKING === 'object' && BOOKING[c]); };
return (spec.rows || []).map(f => {
const s = (formAsk_(id, f).step) || {}, st = { id: f, label: text_(s.q || f), short: s.short ? text_(s.short) : '' };
['only', 'wrap', 'week', 'grid'].forEach(k => { if (s[k] != null) st[k] = s[k]; });
['fallback', 'lock', 'set', 'off'].forEach(k => { if (fn(s[k])) st[k] = fn(s[k]); });
if (fn(s.check)) st.why = fn(s.check);
if (fn(s.say)) st.label_ = fn(s.say);
else if (s.say && typeof s.say === 'object') st.label_ = v => text_(s.say[v] || v);
st.options = () => {
if (formArr_(s.when).some(c => !holds(c)) || formArr_(s.unless).some(holds)) return [];
if (s.may && !(typeof may_ === 'function' && may_(s.may))) return [];
let rows = s.list ? s.list.map(w => text_(w)) : s.from ? (fns.from[s.from] || (() => []))() || [] : [];
if (s.filter) rows = rows.filter(r => !!pick(r, s.filter));
if (s.sort) rows = rows.slice().sort((a, b) => String(pick(a, s.sort)).localeCompare(String(pick(b, s.sort))));
let out = rows.map(r => s.label ? pick(r, s.label) : r);
out = formArr_(s.first).map(w => text_(w)).concat(out, formArr_(s.last).map(w => text_(w)));
return fn(s.then) ? fn(s.then)(out) : out;
};
return st;
});
}
const FORM_RULES_ =FORM_SPECS.rules.map(r => ({ kind: r.kind, re: new RegExp(r.match) }));
const formKind_ = f => (FORM_RULES_.find(r => r.re.test(String(f || ''))) || { kind: 'text' }).kind;
function formField_(f, value, o) {
return fieldHtml(f, value, o);
}
const formToggle_ = t => cardBlock_(formToggleB_(t));
function formToggleB_(t) {
const attrs = { type: 'checkbox', 'data-do': t.act == null ? '' : String(t.act) };
Object.keys(t.data || {}).forEach(k => { attrs['data-' + k] = String(t.data[k] == null ? '' : t.data[k]); });
attrs.checked = !!t.on;
if (t.off) attrs.disabled = true;
return ({ type: 'group', tag: 'label', look: 'check role-pick' + (t.cls ? ' ' + t.cls : ''), blocks: [{ type: 'control', attrs },
{ type: 'group', tag: 'span', look: 'box' },
{ type: 'group', tag: 'span', look: 'role-pick-say', text: [{ b: t.label }, ' ', { span: 'qtag', text: t.note || '' }] }] });
}
function formCard_(spec) {
return setCard_(formCardSpec_(spec));
}
function formCardSpec_(spec) {
const s = Object.assign({}, (spec && spec.id && FORM_SPECS.cards[spec.id]) || {}, spec || {});
const read = s.mode === 'read';
const all = read ? [].concat(...Object.keys(s.groups || {}).map(g => s.groups[g] || [])) : null;
const opts = Object.assign({ head: false, attr: 'data-me', groups: s.groups }, s.fieldOpts || {}, read ? { readonly: all } : {});
const fields = s.groups ? formOf_('settings', null, opts) : '';
const asked = s.ask ? askArea_(s.ask) : '';
const ticks = (s.toggles || []).map(t => formToggleB_(read ? Object.assign({}, t, { off: true }) : t));
const save = read ? '' : s.save && s.save.act ? tile_(s.save) : s.save;
const after = [s.said ? { type: 'status', id: s.said } : '', s.after || ''];
const card = { card: s.card, title: s.title, attrs: s.attrs, state: s.state, lead: s.lead, save: save, after: after };
if (s.groups) return Object.assign(card, { form: [fields], formAttrs: s.formAttrs, foot: read ? '' : s.foot });
return Object.assign(card, { body: [s.body || '', asked, ticks, s.tail || ''] });
}
const formInput_ = a => cardBlock_({ type: 'control', attrs: cardAttrsOf_(a) });
const formSelect_ = (a, opts) => cardBlock_({ type: 'control', tag: 'select', attrs: cardAttrsOf_(a), inner: opts });
const formArea_ = (a, text) => cardBlock_({ type: 'control', tag: 'textarea', attrs: cardAttrsOf_(a), value: text == null ? '' : String(text) });
const formHidden_ = (a, v, more) => formInput_(`type="hidden" ${a} value="${esc(v == null ? '' : String(v))}"${more || ''}`);
const formFile_ = (cls, accept) => formInput_(`type="file" class="${cls}" accept="${accept}" hidden`);
const formLine_ = (label, box, cls) => cardBlock_({ type: 'field', look: cls || '', cap: label, inner: box });
const formTick_ = (a, say, cls, la) => cardBlock_({ type: 'group', tag: 'label', look: 'check' + (cls ? ' ' + cls : ''), attrs: cardAttrsOf_(la),
blocks: [{ type: 'control', attrs: cardAttrsOf_('type="checkbox" ' + a) }, { type: 'group', tag: 'span', look: 'box' }], inner: say });
function formPhone_(cc, no, ccOpts, noAttrs) {
return formLine_('', formSelect_(`data-me="${cc}" aria-label="Country code"`, ccOpts))
+ formLine_('', formInput_(`type="tel" data-me="${no}" inputmode="tel" autocomplete="off" ${noAttrs || ''}`));
}
const formMay_ = x => (!x.may || (typeof may_ === 'function' && may_(x.may))) && (x.type !== 'money' || typeof may_ !== 'function' || may_('prices'));
const FORM_DRAFTS_ = { text: 1, number: 1, money: 1, date: 1, choice: 1, long: 1, phone: 1 };
const formDraftKey_ = (id, o, f) => id + ':' + ((o && o.draftId) || '') + ':' + f;
function formDraftDrop_(id, o) {
if (typeof draftDrop_ !== 'function' || typeof draftKey_ !== 'function') return;
try {
const pre = draftKey_('form', formDraftKey_(id, o, '')), keys = [];
keys.push(...keep_.keys(pre));
keys.forEach(k => draftDrop_('form', k.slice(draftKey_('form', '').length)));
} catch (e) { }
}
const formName_ = (f, o) => String(f || '').replace(/\{(\w+)\}/g, (m, k) => String(((o && o.vars) || {})[k] == null ? '' : o.vars[k]));
function formShownStore_(id, f, typed, ctx, was) {
const x = ((FORM_SPECS.forms[id] || {}).fields || []).find(y => y.type === 'shown' && y.f === f);
return x ? window[x.store](f, typed, ctx, was) : typed;
}
function formFieldOf_(spec, x, v, o, id) {
const a = x.attr || spec.attr, f = formName_(x.f, o), val = v == null ? '' : String(v), ro = x.readonly ? ' disabled' : '';
const more = (o.with && o.with(f, x)) || {};
if (more.label) x = Object.assign({}, x, { label: more.label });
if (x.type === 'shown') {
const seen = Object.assign({}, x, { type: x.as || 'text' });
return (formMay_(seen) ? formFieldOf_(spec, seen, window[x.show](f, o.ctx, val), o, id) : '') + formHidden_(`${x.twin}="${esc(f)}"`, val);
}
const draw = FORM_TYPE_[x.type];
if (draw) return draw(spec, x, f, val, o, more);
const dk = spec.draft === 'form' && x.draft !== false && !x.readonly && FORM_DRAFTS_[x.type] ? formDraftKey_(id, o, f) : '';
const was = dk && o.was ? String(o.was(f) == null ? '' : o.was(f)) : val;
const da = dk ? draftAttr_('form', dk, was) : '';
const dv = dk ? draftVal_('form', dk, was) : was;
const shown = dk && dv !== was ? dv : val;
const ph = (o.kid && x.phKid) || x.ph;
if (spec.draft !== 'form') {
const extra = [more.extra || '', x.input ? `type="${x.input}"` : '', x.quiet ? 'spellcheck="false"' : '', 'autocomplete="off"',
x.max ? `maxlength="${x.max}"` : '', x.pad ? `inputmode="${x.pad}" size="${x.max}"` : '', x.blank ? 'placeholder=" "' : '',
x.quiet && ph ? `aria-label="${esc(ph)}"` : ''].filter(Boolean).join(' ');
return formField_(f, val, Object.assign({ attr: a, draft: spec.draft === 'set' ? undefined : false, readonly: !!x.readonly, label: x.label,
placeholder: ph, options: typeof o.options === 'function' ? o.options(f) : null }, more, { extra }));
}
if (x.type === 'choice') return formLine_(x.label || '', cardBlock_({ type: 'control', tag: 'select', attrs: Object.assign({ [a]: f }, cardAttrsOf_(da)),
options: (x.options || (o.options || {})[f] || []).map(c => Array.isArray(c) ? { value: c[0], text: c[1], on: c[0] === shown } : c) }));
if (x.type === 'date') return formLine_(x.label || '', formInput_(`type="date" ${a}="${f}" value="${esc(shown)}"${ro}${da}`));
if (x.type === 'long') return formLine_(x.label || '', formArea_(`${a}="${f}" rows="3"${ro}${da}`, shown));
const kind = x.input || (x.type === 'money' || x.type === 'number' ? 'number' : '');
const bounds = (x.min ? ` min="${x.min}"` : '') + (x.step ? ` step="${x.step}"` : '') + (x.type === 'money' ? ' inputmode="decimal"' : '')
+ (x.caps ? ' autocapitalize="characters"' : '');
return formLine_(x.label || (ph ? '' : fieldLabel(f)), formInput_(`${a}="${f}"${ph ? ` placeholder="${esc(ph)}"` : ''} autocomplete="off"${kind ? ` type="${kind}"` : ''}${bounds} value="${esc(shown)}"${ro}${da}`));
}
function formTicksOf_(spec, x, f, o, id) {
const a = x.attr || spec.attr, keep = spec.draft === 'form' && x.draft !== false;
const ticks = ((o.options || {})[f] || []).map(c => {
const on = c[2] ? '1' : '0', dk = keep ? formDraftKey_(id, o, f + '.' + c[0]) : '';
const da = dk ? draftAttr_('form', dk, on) : '';
const now = dk ? draftVal_('form', dk, on) : on;
return formTick_(`${a}="${esc(c[0])}"${now === '1' ? ' checked' : ''}${x.readonly || o.locked ? ' disabled' : ''}${da}`,
typeof c[1] === 'string' ? cardRuns_({ span: '', text: c[1] }) : c[1].html, x.tickLook == null ? 'many-opt' : x.tickLook);
}).join('');
return cardBlock_({ type: 'group', look: x.look || 'f-ticks', attrs: { role: 'group', 'aria-label': x.label || f }, inner: ticks });
}
function formTickOf_(spec, x, f, val, o, id) {
const a = x.attr || spec.attr, on = TRUEish_(val) ? '1' : '0';
const dk = spec.draft === 'form' && x.draft !== false ? formDraftKey_(id, o, f) : '';
const da = dk ? draftAttr_('form', dk, on) : '';
const now = dk ? draftVal_('form', dk, on) : on;
return formTick_(`${a}="${esc(f)}"${now === '1' ? ' checked' : ''}${da}`, cardRuns_({ span: '', text: x.label || '' }));
}
const FORM_TYPE_ = {
head: (s, x) => cardBlock_({ type: 'group', tag: 'h4', look: null, text: x.label }),
hidden: (s, x, f, v) => formHidden_(`${x.attr || s.attr}="${esc(f)}"`, v),
search: (s, x, f, v, o) => formLine_(x.label || o.label || '', formInput_(`${x.attr || s.attr}="${esc(f)}" data-fam-want="${esc(formName_(x.want, o))}" type="search" autocomplete="off" placeholder="${esc(x.ph || '')}"`)),
toggles: (s, x, f, v, o) => ((o.options || {})[f] || []).map(formToggle_).join(''),
ticks: (s, x, f, v, o) => formTicksOf_(s, x, f, o, o.formId),
tick: (s, x, f, v, o) => formTickOf_(s, x, f, v, o, o.formId),
doc: (s, x, f, v, o) => cardBlock_({ type: 'group', look: 'field apply-doc', attrs: { 'data-doc': f }, blocks: [
{ type: 'group', tag: 'span', look: null, text: x.label },
{ type: 'group', look: 'btn-row', tiles: [{ form: true, kind: 'quiet', label: (o.docs || {})[f] ? text_('change-photo') : 'Choose photo', act: x.act || 'apply-pick' }] },
{ type: 'group', tag: 'p', look: 'note apply-doc-said', text: (o.docs || {})[f] ? text_('photo-ready') : '' },
{ type: 'control', attrs: { type: 'file', class: 'apply-in', accept: 'image/*', hidden: true } }] }),
timetable: (s, x, f, v, o) => {
const codes = o.codes || (typeof availCodes_ === 'function' ? availCodes_() : []);
return codes.length ? cardBlock_({ type: 'group', look: 'app-week', inner: availGrid_(codes, o.raw || {}, o.readonly || [], !!o.mine) })
: '';
},
subjects: (s, x, f, v, o) => Array.from({ length: x.rows || (typeof APP_SUBJECT_ROWS !== 'undefined' ? APP_SUBJECT_ROWS : 3) }, (_, i) => {
const noOther = b => { b.blocks[0].options = b.blocks[0].options.filter(c => c.value !== QUAL_OTHER); return b; };
return cardBlock_({ type: 'group', look: 'q-row', blocks: [noOther(qualPick_({ 'data-app-subj': String(i) }, '', QUAL_SUBJECTS, i ? 'Another subject' : 'Subject', 'Choose')),
noOther(qualPick_({ 'data-app-level': String(i) }, '', QUAL_LEVELS, 'Level', 'Choose'))] });
}).join(''),
};
const formListOf_ = (spec, o) => Array.isArray(spec.fields) ? spec.fields : (o.fields || []).map(f => ({ f, type: formKind_(f) }));
function formOf_(id, values, o) {
o = Object.assign({}, o || {}, { formId: id });
const spec = FORM_SPECS.forms[id];
if (!spec) return '';
if (spec.fields === 'groups') return formGroupsOf_(spec, o.groups || {}, o);
const get = typeof values === 'function' ? values : f => (values || {})[f];
const list = formListOf_(spec, o).filter(x => formMay_(x) && (o.skip || []).indexOf(x.f) === -1 && (!o.only || o.only.indexOf(x.f) !== -1));
const one = x => {
if (x.type === 'timetable' && !FORM_TYPE_.timetable(spec, x, x.f, '', o)) return formFieldOf_(spec, Object.assign({}, x, { type: 'long' }), get(x.f, x), o, id);
const box = formFieldOf_(spec, x, get(formName_(x.f, o), x), o, id);
return x.look && x.type !== 'ticks' ? cardBlock_({ type: 'group', look: x.look, inner: box }) : box;
};
const out = [];
list.forEach((x, i) => {
if (x.row && list[i - 1] && list[i - 1].row === x.row) return;
const row = x.row ? list.filter(y => y.row === x.row) : null;
out.push(row ? cardBlock_({ type: 'group', look: 'f-row', attrs: { style: '--n:' + row.length }, inner: row.map(one).join('') }) : one(x));
});
return out.join('');
}
function formGroupsOf_(spec, groups, o) {
const head = o.head === false ? '' : o.head || 'h2';
const value = o.value || (() => '');
const plain = (f, extra) => {
const x = { f, type: formKind_(f) };
if (!formMay_(x)) return '';
return formField_(f, value(f), Object.assign({ attr: o.attr || spec.attr, label: ROW_LABEL[f], options: o.options ? o.options(f) : null,
suggest: o.suggest ? o.suggest(f) : null, readonly: (o.readonly || []).indexOf(f) !== -1 }, extra));
};
const own = (o.attr || spec.attr) === 'data-me';
return Object.keys(groups).map(g => {
const list = (groups[g] || []).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
const timetable = isTimetable_(list);
const library = !timetable && isLibrary_(list);
const quals = !timetable && isQuals_(list);
const jobs = !timetable && isJobs_(list);
const wantsDob = !timetable && (list.indexOf('date_of_birth') !== -1 || isDob_(list));
const wantsPhone = !timetable && list.indexOf('phone') !== -1;
const photos = !timetable && isPhotos_(list);
const picture = !timetable && own && list.indexOf('photo') !== -1;
const rest = list.filter(f => !(library && isLibraryCard_(f)) && !(quals && isQualField_(f)) && !(jobs && isJobField_(f))
&& !(photos && (isPhotoField_(f) || f === 'video')) && !(picture && f === 'photo')
&& !(wantsDob && (f === 'date_of_birth' || isDobBox_(f))));
const body = timetable
? availGrid_(list, o.raw || {}, o.readonly || [], own)
: (picture ? photoPicker_(value) : '')
+ (library ? libraryShelf_(list, value) : '')
+ (quals ? qualShelf_(list, value) : '')
+ (jobs ? jobShelf_(list, value) : '')
+ (wantsDob ? dobBoxes_(value) : '')
+ fieldRows_(rest, (f, extra) => f === 'phone' && wantsPhone ? phoneField_(value) : plain(f, extra))
+ (photos ? videoPicker_(value) + photoShelf_(list, value) : '');
return (head ? cardBlock_({ type: 'group', tag: head, look: null, blocks: [{ type: 'group', tag: 'span', look: null, text: g }] }) : '') + body;
}).join('');
}
const FORM_FIELDS_ = Object.assign({}, ...Object.keys(ITEM_KINDS.kinds).map(k => ITEM_KINDS.kinds[k].fields || {}));
const askProps_ = f => FORM_FIELDS_[f] || {};
const FORM_ASK_ = {};
const askHook_ = id => FORM_ASK_[id] || {};
const ASK = {};
const askKeeps_ = (id, x) => (FORM_SPECS.forms[id] || {}).draft === 'ask' && x.type !== 'pin' && !draftNever_(x.f);
const askDrafts_ = id => ((FORM_SPECS.forms[id] || {}).fields || []).filter(x => askKeeps_(id, x));
function askReset_(id, pre) {
const s = { v: Object.assign({}, pre || {}), done: {}, pin: [], more: '' };
askDrafts_(id).forEach(x => { const d = draftRead_('ask', id + ':' + x.f); if (d !== null && d !== undefined) { s.v[x.f] = d; s.done[x.f] = true; } });
ASK[id] = s;
}
const askOf_ = id => (askHook_(id).state ? askHook_(id).state() : ASK[id] || (askReset_(id), ASK[id]));
const askDone_ = id => { askDrafts_(id).forEach(x => draftDrop_('ask', id + ':' + x.f)); ASK[id] = { v: {}, done: {}, pin: [], more: '' }; };
const askSpecs_ = id => (FORM_SPECS.forms[id] || {}).fields || [];
const askFields_ = id => askSpecs_(id).filter(x => (!x.only || Object.keys(x.only).every(k => String(askOf_(id).v[k]) === String(x.only[k])))
&& (!askHook_(id).asks || askHook_(id).asks(x)));
const askPassed_ = (id, x) => !!askOf_(id).done[x.f] || (!!x.given && !!askOf_(id).v[x.f]);
const askAt_ = id => askFields_(id).find(x => !askPassed_(id, x)) || null;
const askSay_ = c => (c.say ? text_(c.say) : c.t || c.v);
const askEls_ = id => [...document.querySelectorAll('.ask-set')].filter(el => el.dataset.ask === id);
function askPaint_(id) {
if (askHook_(id).paint) return askHook_(id).paint();
const els = askEls_(id);
if (els.length) els.forEach(el => { el.innerHTML = askAreaInner_(id); });
else finderEach_(() => paintStuff());
}
const askAreaInner_ = id => renderTags(askChips_(id), 'chips', true) + cardBlocks_(askMenu_(id) || []);
const askArea_ = id => cardBlock_({ type: 'group', look: 'ask-set', attrs: { 'data-ask': id }, inner: askAreaInner_(id) });
const askLook_ = id => (FORM_SPECS.forms[id] || {}).look || 'ask-pick';
function askTags_(id, x, o) {
o = o || {};
const h = askHook_(id), val = o.value != null ? o.value : askOf_(id).v[x.f];
if (x.type === 'pin') return { look: 'is-grid sign-pin', options: '0123456789'.split('').map(d => ({ text: d, act: o.act || 'ask-digit', data: { form: id, f: x.f, d: d, repeat: true } })) };
if (x.type === 'text' || x.type === 'date' || x.type === 'time' || x.type === 'long') return { look: 'sign-type', box: { id: o.id != null ? o.id : 'ask-' + id + '-' + x.f, cls: o.cls || 'ask-box',
value: val || '', label: x.label || x.ph || '', placeholder: x.ph || '', inputmode: x.pad || (x.input === 'email' ? 'email' : 'text'),
type: x.type === 'date' || x.type === 'time' ? x.type : x.min != null || x.max != null ? 'number' : 'text', min: x.min, max: x.max, step: x.step, lines: x.type === 'long' ? 3 : 0 } };
const list = h.options ? h.options(x) : (x.options || []).map(c => ({ v: c.v, text: askSay_(c), on: String(val) === String(c.v) }));
const shown = x.many && !x.grid ? list.filter(c => !c.on) : list;
return { look: askLook_(id) + (x.grid ? ' is-grid' : ''), options: shown.map(c => ({
text: (x.grid && c.on ? '✓ ' : '') + c.text + (c.off ? ' · ' + c.off : c.note ? ' · ' + c.note : ''), act: o.act || 'ask-pick',
data: { form: id, f: x.f, v: c.v }, pressed: !!c.on, disabled: !!c.off, look: ((c.on ? 'is-on' : '') + (c.off ? ' is-off' : '')).trim() })) };
}
const askSaid_ = (id, x) => {
if (askHook_(id).said) return askHook_(id).said(x);
const c = (x.options || []).find(k => String(k.v) === String(askOf_(id).v[x.f]));
return x.type === 'pin' ? '*'.repeat(SIGN_PIN_LEN) : c ? askSay_(c) : String(askOf_(id).v[x.f] || '');
};
function askMenu_(id, o) {
o = o || {};
const spec = FORM_SPECS.forms[id] || {}, x = askAt_(id), h = askHook_(id);
if (!x) return spec.send ? [{ type: 'choices', ask: o.done || '', rows: [{ look: 'sign-more', options: [{ text: spec.send.say ? text_(spec.send.say) : spec.send.t, act: 'ask-send', data: { form: id } }] }] }] : null;
if (askOf_(id).more === x.f) return [{ type: 'choices', rows: [] }];
const pin = x.type === 'pin' ? askOf_(id).pin.length : 0, tags = askTags_(id, x);
const skip = spec.skip ? [{ text: 'Skip', act: 'ask-skip', data: { form: id, f: x.f }, label: 'Leave this empty for now' }] : [];
return [{ type: 'choices', ask: x.note || '',
rows: [tags.box ? { look: 'sign-who', options: [tags].concat(skip) } : Object.assign({}, tags, { options: tags.options.concat(skip) })] }];
}
function askChips_(id, look) {
return askFields_(id).filter(x => askPassed_(id, x)).map(x => {
const h = askHook_(id), text = askSaid_(id, x) || 'None', label = 'Change ' + (x.label || (h.label && h.label(x)) || x.ph || x.f);
return { base: 'chip', look: look || 'sm ask-chip', text: text, act: 'ask-back', data: { form: id, f: x.f }, label: label, x: { label: label }, colour: false };
}).concat(askMoreChips_(id, look));
}
function askMoreChips_(id, look) {
const x = askAt_(id);
if (!x || askOf_(id).more !== x.f) return [];
const tag = (text, act, label) => ({ base: 'chip', look: (look || 'sm ask-chip') + ' ask-more', text: text, act: act, data: { form: id, f: x.f }, label: label, colour: false });
return [tag('and', 'ask-and', 'And another'), tag('.', 'ask-next', 'Done, move on')];
}
function askSet_(id, f, v) {
const s = askOf_(id), x = formAsk_(id, f), h = askHook_(id);
if (!askOk_(x, v)) return;
s.v[f] = v; s.done[f] = true;
if (askKeeps_(id, x)) draftKeep_('ask', id + ':' + f, v);
if (h.set) h.set(x, v);
askPaint_(id);
}
function askBack_(id, f) {
const s = askOf_(id), h = askHook_(id), all = askSpecs_(id), at = all.findIndex(x => x.f === f);
if (at === -1) return;
s.more = ''; s.pin = [];
((FORM_SPECS.forms[id] || {}).back === 'one' ? [all[at]] : all.slice(at)).forEach(x => { delete s.done[x.f]; if (h.clear) h.clear(x); else if (x.type === 'pin') delete s.v[x.f]; });
askPaint_(id);
}
const FORM_SEND_ = {};
on('ask-pick', el => {
const id = el.dataset.form, f = el.dataset.f, v = el.dataset.v, x = formAsk_(id, f), h = askHook_(id), s = askOf_(id);
if (h.pick && h.pick(x, v)) return askPaint_(id);
if (x.many) {
const had = h.had ? h.had(x) : (s.v[f] || []);
if (!x.grid && had.map(String).indexOf(String(v)) >= 0) { s.more = f; return askPaint_(id); }
if (h.toggle) h.toggle(x, v);
else { const list = s.v[f] || [], at = list.indexOf(v); if (at === -1) list.push(v); else list.splice(at, 1); s.v[f] = list; }
s.more = f;
return askPaint_(id);
}
const no = h.off && v ? String(h.off(x, v) || '') : '';
if (no) { toast(v + ' ' + no); return; }
askSet_(id, f, v || '');
});
on('ask-next', el => {
const id = el.dataset.form, x = formAsk_(id, el.dataset.f), h = askHook_(id), s = askOf_(id);
const had = h.had ? h.had(x) : (s.v[x.f] || []);
if (had.length < (x.need || 0)) { toast(text_('pick-at-least-one-first')); return; }
s.done[x.f] = true; s.more = '';
if (h.next) h.next(x);
askPaint_(id);
});
on('ask-and', el => {
const id = el.dataset.form, x = formAsk_(id, el.dataset.f), h = askHook_(id);
askOf_(id).more = '';
if (h.and) h.and(x);
askPaint_(id);
});
on('ask-back', el => askBack_(el.dataset.form, el.dataset.f));
on('ask-skip', el => { const id = el.dataset.form; askOf_(id).done[el.dataset.f] = true; askOf_(id).more = ''; askPaint_(id); });
on('ask-digit', el => {
const id = el.dataset.form, x = askAt_(id), s = askOf_(id), d = String(el.dataset.d || '');
if (!x || x.type !== 'pin' || x.f !== el.dataset.f || !/^\d$/.test(d)) return;
s.pin.push(d);
if (s.pin.length < SIGN_PIN_LEN) { askPaint_(id); return; }
const pin = s.pin.join('');
s.pin = [];
askSet_(id, x.f, pin);
});
on('ask-send', el => { const id = el.dataset.form; if (FORM_SEND_[id]) FORM_SEND_[id](Object.assign({}, askOf_(id).v), el); });
document.addEventListener('input', e => {
const t = e.target;
if (!t || !t.classList || !t.classList.contains('ask-box')) return;
const rest = String(t.id || '').slice(4), cut = rest.lastIndexOf('-'), id = rest.slice(0, cut), f = rest.slice(cut + 1);
const x = formAsk_(id, f);
if (askKeeps_(id, x)) draftKeep_('ask', id + ':' + f, t.value);
});
document.addEventListener('keydown', e => {
const t = e.target;
if (!t || !t.classList || !t.classList.contains('ask-box') || !/^Enter$/.test(e.key)) return;
if (t.tagName === 'TEXTAREA' && !(e.ctrlKey || e.metaKey)) return;
e.preventDefault();
const rest = String(t.id || '').slice(4), cut = rest.lastIndexOf('-'), v = String(t.value || '').trim();
if (!v) { toast(text_('type-your-name-username-or-email')); return; }
askSet_(rest.slice(0, cut), rest.slice(cut + 1), v);
});
document.addEventListener('change', e => {
const t = e.target;
if (!t || !t.classList || !t.classList.contains('ask-box') || (t.type !== 'date' && t.type !== 'time') || !t.value) return;
const rest = String(t.id || '').slice(4), cut = rest.lastIndexOf('-');
askSet_(rest.slice(0, cut), rest.slice(cut + 1), t.value);
});
function askOk_(x, v) {
if (!x || (x.min == null && x.max == null) || v === '' || v == null) return true;
const n = Number(v);
if (isFinite(n) && (x.min == null || n >= Number(x.min)) && (x.max == null || n <= Number(x.max))) return true;
toast(x.max != null ? 'A number from ' + (x.min != null ? x.min : 0) + ' to ' + x.max + ', please.' : 'A number from ' + x.min + ' up, please.');
return false;
}
const STORE_KINDS_ = Object.keys(ITEM_KINDS.kinds).filter(k => (ITEM_KINDS.kinds[k].find || {}).from === 'store');
const STORE_ROWS_ = {};
const storeWho_ = () => (typeof USER === 'object' && USER ? String(USER.personId || USER.name || '') : '');
const storeFormOf_ = k => Object.keys(ITEM_KINDS.kinds[k].forms || {}).find(id => ITEM_KINDS.kinds[k].forms[id].store) || '';
const storeFacets_ = () => STORE_KINDS_.flatMap(k => Object.keys(ITEM_KINDS.kinds[k].find.facetCols || {}));
function storePull_(k) {
const who = storeWho_();
if ((STORE_ROWS_[k] && STORE_ROWS_[k].who === who) || typeof api !== 'function') return;
STORE_ROWS_[k] = { who, rows: [] };
Promise.resolve(api({ action: 'item', mode: 'read', kind: k })).then(d => {
if (!STORE_ROWS_[k] || STORE_ROWS_[k].who !== who) return;
STORE_ROWS_[k].rows = d && d.ok && Array.isArray(d.items) ? d.items : [];
if (STORE_ROWS_[k].rows.length && typeof lateCame_ === 'function') lateCame_();
}).catch(() => { delete STORE_ROWS_[k]; });
}
function storeItems_() {
return STORE_KINDS_.filter(k => typeof kindSees_ === 'function' && kindSees_({ kind: k })).flatMap(k => {
const f = ITEM_KINDS.kinds[k].find, cols = f.facetCols || {};
storePull_(k);
const entry = (row, id) => { const shape = item_(row, k);
return Object.assign({ kind: k, name: shape.name, key: k + ':' + id, sub: '', image: '', row, shape, text: Object.values(row).join(' ') },
...Object.keys(cols).map(c => ({ [c]: String(row[cols[c]] == null ? '' : row[cols[c]]) }))); };
const fresh = Object.assign(entry({}, 'new'), { name: f.new, storeNew: true });
fresh.shape = Object.assign({}, fresh.shape, { name: f.new });
return [fresh].concat(((STORE_ROWS_[k] || {}).rows || []).map(it => entry(it.data || {}, it.id)));
});
}
function itemLines_(r, k) {
const fields = (FORM_SPECS.forms[storeFormOf_(k)] || {}).fields || [];
return [{ type: 'list', items: fields.map(x => { const v = String(r[x.f] == null ? '' : r[x.f]), c = (x.options || []).find(o => String(o.v) === v);
return { label: x.label || x.f, value: c ? c.t : v }; }).filter(l => l.value.trim()) }];
}
const STORE_EDIT_ = {};
function storeEditForm_(k, id, row) {
const base = storeFormOf_(k), fid = base + '@' + id;
if (!FORM_SPECS.forms[fid]) {
FORM_SPECS.forms[fid] = Object.assign({}, FORM_SPECS.forms[base]);
FORM_SEND_[fid] = v => storeSend_(fid, v, id);
}
if (!ASK[fid]) {
const pre = {};
FORM_SPECS.forms[base].fields.forEach(x => { if (row[x.f] != null && row[x.f] !== '') pre[x.f] = String(row[x.f]); });
askReset_(fid, pre);
FORM_SPECS.forms[base].fields.forEach(x => { ASK[fid].done[x.f] = true; });
}
return fid;
}
function storeSheet_(it, x) {
const k = it.kind, id = x && x.key ? String(x.key).slice(k.length + 1) : '';
if (x && !x.storeNew && !STORE_EDIT_[k + ':' + id]) return it.body;
const fid = x && x.storeNew ? storeFormOf_(k) : storeEditForm_(k, id, it.raw || {});
return fid ? [{ type: 'group', look: 'store-form', inner: askArea_(fid) }] : [];
}
function storeTiles_(it, x) {
if (!x || x.storeNew) return [];
const k = it.kind, id = String(x.key).slice(k.length + 1), t = (ITEM_KINDS.kinds[k].card || {}).tick, on = t && String((it.raw || {})[t.f]) === String(t.on);
return [{ icon: 'edit', label: STORE_EDIT_[k + ':' + id] ? 'Close' : 'Edit', act: 'store-edit', data: { kind: k, id } }]
.concat(t ? [{ label: (on ? '✓ ' : '') + t.label, act: 'store-tick', pressed: on, data: { kind: k, id } }] : []);
}
const storeRow_ = (k, id) => (((STORE_ROWS_[k] || {}).rows || []).find(r => String(r.id) === String(id)) || {}).data || {};
function storeWrite_(k, item) {
return Promise.resolve(api({ action: 'item', mode: 'write', kind: k, item })).then(d => {
if (!d || !d.ok) { toast((d && d.error) || 'Not saved.'); return false; }
delete STORE_ROWS_[k];
if (typeof lateCame_ === 'function') lateCame_();
return true;
}).catch(e => { toast(String((e && e.message) || e)); return false; });
}
function storeSend_(fid, v, id) {
const k = FORM_SPECS.forms[fid].item, key = [].concat(ITEM_KINDS.kinds[k].sheet.id)[0], item = Object.assign({}, v);
item[key] = id || item[key] || k + '-' + Date.now().toString(36);
if (id) FORM_SPECS.forms[fid].fields.forEach(x => { if (item[x.f] == null) item[x.f] = ''; });
return storeWrite_(k, item).then(ok => { if (!ok) return; askDone_(fid); if (id) { delete ASK[fid]; delete STORE_EDIT_[k + ':' + id]; } toast(text_('saved')); });
}
STORE_KINDS_.forEach(k => { const id = storeFormOf_(k); if (id) FORM_SEND_[id] = v => storeSend_(id, v); });
on('store-edit', el => { const key = el.dataset.kind + ':' + el.dataset.id;
if (STORE_EDIT_[key]) delete STORE_EDIT_[key]; else STORE_EDIT_[key] = true;
delete ASK[storeFormOf_(el.dataset.kind) + '@' + el.dataset.id];
if (typeof lateCame_ === 'function') lateCame_(); });
on('store-tick', el => { const k = el.dataset.kind, id = el.dataset.id, t = ITEM_KINDS.kinds[k].card.tick, key = [].concat(ITEM_KINDS.kinds[k].sheet.id)[0];
storeWrite_(k, { [key]: id, [t.f]: String(storeRow_(k, id)[t.f]) === String(t.on) ? t.off : t.on }); });
;
/* js/me-account.js */
function versionSaid_() {
const f = DATA.fileVersions || {};
const names = Object.keys(f);
const newest = names.map(k => f[k]).sort().pop();
const stale = names.length < 2 ? [] : names.filter(k => f[k] !== newest);
const failed = ((DATA.setup && DATA.setup.jobs) || []).filter(j => j && j.error);
return cardBlocks_([{ type: 'group', tag: 'p', look: 'build-said', text: ['@family. · Merton & Wandsworth', { br: true },
'site ' + SITE_VERSION + ' · css ' + cssVersion(), { br: true }, 'backend ' + dash_(DATA.version)] },
stale.length ? { type: 'group', tag: 'p', look: 'build-said is-warn', text: text_('not-deployed') + stale.map(k => k + '.gs (' + f[k] + ')').join(', ')
+ '. Paste ' + (stale.length === 1 ? 'that file' : 'those files') + ' into Apps Script.' } : null,
failed.length ? { type: 'group', tag: 'p', look: 'build-said is-warn', text: 'Failing: ' + failed.map(j => j.id + ' (' + String(j.error).slice(0, 120) + ')').join('; ')
+ '.' } : null]);
}
const APP_SUBJECT_ROWS = 3;
function profileAge_(p) {
const q = p || {};
const y = Number(q.dob_y), m = Number(q.dob_m) || 1, d = Number(q.dob_d) || 1;
if (y > 1900 && (typeof dobReal_ !== 'function' || dobReal_(q))) {
const now = new Date();
return now.getFullYear() - y - ((now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) ? 1 : 0);
}
const a = String(q.age == null ? '' : q.age).match(/^\s*(\d{1,3})\s*$/);
return a ? Number(a[1]) : null;
}
function applyAdult_() {
const age = profileAge_(whose_() && whose_().profile);
return age !== null && age >= 18;
}
function applyOpts_() {
if (!whose_() || whoseAtLeast_('staff')) return null;
if (profileAge_(whose_().profile) === null)
return { icon: 'join', label: text_('apply-to-teach'), note: 'add your date of birth first', act: 'apply-open', off: true };
if (!applyAdult_()) return null;
const st = whose_().application && whose_().application.status;
if (st === 'new' || st === 'interview')
return { icon: 'join', label: text_('application-sent'), note: st === 'interview' ? 'we will arrange a talk' : 'we will be in touch', act: 'apply-open', off: true };
return { icon: 'join', label: st === 'declined' ? text_('apply-again') : text_('apply-to-teach'), note: st === 'approved' ? 'approved' : '', act: 'apply-open' };
}
const APPLY_DOCS = {};
const APPLY_QUAL_SLOTS = 3;
function applyKnown_() {
const q = (whose_() && whose_().profile) || {};
const pad = n => String(n).padStart(2, '0');
const dob = Number(q.dob_y) > 1900 && (typeof dobReal_ !== 'function' || dobReal_(q)) ? q.dob_y + '-' + pad(Number(q.dob_m) || 1) + '-' + pad(Number(q.dob_d) || 1) : '';
return { fullName: [q.first_name, q.last_name].filter(Boolean).join(' '), email: q.email || '', phone: q.phone || '', dob };
}
function applyFormHtml_() { return cardBlock_(applyFormSpec_()); }
function applyFormSpec_() {
return { type: 'group', look: 'me-form app-form', inner: formOf_('apply-teach', applyKnown_(), { docs: APPLY_DOCS, draftId: String((whose_() && whose_().personId) || '') })
+ cardBlock_({ type: 'group', look: 'btn-row', tiles: [{ form: true, label: text_('send-my-application'), act: 'apply-send' }] })
+ cardBlock_({ type: 'status', saved: true, look: 'apply-said', live: true }) };
}
const applyMissing_ = b => formGaps_(FORM_SPECS.forms['apply-teach'].gaps, b);
function applyFormOpen_() {
if (!whose_() || whoseAtLeast_('staff') || profileAge_(whose_().profile) === null || !applyAdult_()) return false;
const st = whose_().application && whose_().application.status;
return st !== 'new' && st !== 'interview';
}
on('apply-open', () => { const f = document.querySelector('.apply-card .app-form'); if (f) f.scrollIntoView({ block: 'start', behavior: 'smooth' }); });
on('apply-pick', el => { const d = el.closest('.apply-doc'), inp = d && d.querySelector('.apply-in'); if (inp) inp.click(); });
document.addEventListener('change', e => {
const inp = e.target;
if (!inp || !inp.matches || !inp.matches('.apply-in')) return;
const file = (inp.files || [])[0], slot = inp.closest('.apply-doc');
inp.value = '';
if (!file || !slot) return;
const said = slot.querySelector('.apply-doc-said'), say = m => { if (said) tell_(said, 'info', m); };
if (!/^image\//.test(file.type || '')) { say(text_('that-is-not-a-picture-take')); return; }
say(text_('getting-the-photo-ready'));
photoShrink_(file).then(data => {
if (!data || !/^data:image\//.test(data)) { say(text_('the-phone-could-not-read-that')); return; }
APPLY_DOCS[slot.dataset.doc] = data;
const b = slot.querySelector('[data-do="apply-pick"]');
if (b) b.textContent = text_('change-photo');
say(text_('photo-ready'));
}).catch(() => say(text_('the-phone-could-not-read-that')));
});
on('apply-send', el => {
const f = el.closest('.app-form');
if (!f || !USER) return;
const v = k => { const b = f.querySelector(`[data-app="${k}"]`); return !b ? '' : isCheckbox_(b) ? (b.checked ? 'TRUE' : '') : String(b.value || '').trim(); };
const subjects = Array.from({ length: APP_SUBJECT_ROWS }, (_, i) => {
const s_ = (f.querySelector(`[data-app-subj="${i}"]`) || {}).value || '', l = (f.querySelector(`[data-app-level="${i}"]`) || {}).value || '';
return s_ ? s_ + (l ? ' (' + l + ')' : '') : '';
}).filter(Boolean).join(', ');
const hours = [].filter.call(f.querySelectorAll('.app-week input[type="checkbox"]'), b => b.checked).map(b => b.dataset.me).join(',');
const body = { action: 'applyTeach', personId: (USER && USER.personId) || '', subjects, qualifications: v('qualifications'), dbsNumber: v('dbsNumber'), dbsIssued: v('dbsIssued'),
dbsNeeded: v('dbsNeeded'), dbsUpdate: v('dbsUpdate'), rightToWork: v('rightToWork'), experience: v('experience'), availability: hours || v('availability'),
area: v('area'), fullName: v('fullName'), phone: v('phone'), email: v('email'), address: v('address'), postcode: v('postcode'), dob: v('dob'), rate: v('rate'),
ref1Name: v('ref1Name'), ref1Relationship: v('ref1Relationship'), ref1Email: v('ref1Email'), ref1Phone: v('ref1Phone'),
ref2Name: v('ref2Name'), ref2Relationship: v('ref2Relationship'), ref2Email: v('ref2Email'), ref2Phone: v('ref2Phone'),
idDoc: APPLY_DOCS.idDoc || '', rtwDoc: APPLY_DOCS.rtwDoc || '',
qualDocs: Array.from({ length: APPLY_QUAL_SLOTS }, (_, i) => APPLY_DOCS['qual' + i]).filter(Boolean),
statement: v('statement'), cvLink: v('cvLink'), consent: v('consent') };
const gap = applyMissing_(body);
if (gap.length) { const said = f.querySelector('.apply-said'); if (said) tell_(said, 'error', text_('please-add') + gap.join(', ') + '. Nothing was sent.'); return; }
send_(body, { button: el, where: f.querySelector('.apply-said'), saying: 'Sending…' })
.then(d => {
USER.application = d.application || { status: 'new', at: Date.now() };
Object.keys(APPLY_DOCS).forEach(k => { delete APPLY_DOCS[k]; });
formDraftDrop_('apply-teach', { draftId: String((whose_() && whose_().personId) || '') });
saveUser_();
toast(text_('application-sent'));
try { paint('stuff'); } catch (e) { oops_(e, 'me:applyFormHtml_') }
})
.catch(() => {});
});
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); });
on('forgot-pin', el => {
const who = ((($('in-name') || {}).value || '').trim() || (typeof SIGN !== 'undefined' ? SIGN.who : '')).trim();
if (!who) { toast(text_('type-your-email-address-or-your')); return; }
send_({ action: 'forgotPin', who }, { button: el, busy: 'Sending\u2026' })
.then(d => toast((d && d.message)
|| text_('if-there-is-an-account-with')))
.catch(() => {});
});
document.addEventListener('input', e => {
const t = e.target;
if (isSignInBox_(t) && t.hasAttribute('aria-invalid')) t.removeAttribute('aria-invalid');
});
function signOut_() {
const tok = USER && USER.token;
let last = Promise.resolve();
try { if (typeof answersPush_ === 'function') last = answersPush_(true); } catch (err) { oops_(err, 'me:googleSignedIn_') }
let subs = Promise.resolve();
try {
if (typeof subDrain_ === 'function') subs = subDrain_(USER && USER.personId, tok, typeof answersCan_ === 'function' && answersCan_('submitAnswer'));
} catch (err) { }
Promise.all([Promise.resolve(last).catch(() => {}), Promise.resolve(subs).catch(() => {})]).then(() => { try { if (tok) api({ action: 'signOut', token: tok }); } catch (err) { } });
signedOut_();
toast(text_('signed-out'));
}
on('signout', () => signOut_());
function signedOut_(opts) {
opts = opts || {};
const was = USER;
let wasAdmin = false;
try { wasAdmin = (typeof may_ === 'function' && may_('admin')) || (typeof hasRole === 'function' && hasRole('admin')); } catch (e) { oops_(e, 'me:signedOut_') }
USER = null; LENS = null;
if (typeof SIGN !== 'undefined' && !opts.quiet) { SIGN.who = ''; SIGN.dots = 0; SIGN.pin = []; SIGN.wrong = false; SIGN.known = null; SIGN.card = ''; }
keep_.signOut();
payloadForget_();
if (typeof window.offForget_ === 'function') window.offForget_();
try {
const states = typeof finderStates_ === 'function' ? finderStates_()
: (typeof STUFF !== 'undefined' ? [STUFF] : []);
states.forEach(st => {
if (opts.keepFind) { }
else if (opts.ended && was && !wasAdmin) st.whose = String(was.personId || was.name || '');
else st.whose = '';
});
if (opts.ended && was && !wasAdmin && typeof FINDERS !== 'undefined') Object.keys(FINDERS).forEach(id => { FINDERS[id].st.whoseAt = PAGE[id] || 0; });
if (!opts.keepFind && !(opts.ended && was && !wasAdmin) && typeof finderSet_ === 'function') {
Object.keys(FINDERS).forEach(id => finderSet_(FINDERS[id], { paint: false }));
}
} catch (err) { }
FAVS = new Set();
try { if (typeof subForget_ === 'function') subForget_(); } catch (e) { oops_(e, 'me:signedOut_') }
try { if (typeof kpClose_ === 'function') kpClose_(); } catch (e) { oops_(e, 'me:signedOut_') }
try { if (typeof window.camStop_ === 'function') window.camStop_(); } catch (e) { oops_(e, 'me:signedOut_') }
try { if (typeof KP_UNDO !== 'undefined') KP_UNDO.clear(); } catch (e) { oops_(e, 'me:signedOut_') }
try { if (typeof closeStep_ === 'function') closeStep_(); } catch (e) { oops_(e, 'me:signedOut_') }
try {
DATA.submissions = { for: '', mine: {} };
DATA.family = []; DATA.familyFor = '';
DATA.favourites = []; DATA.everyone = [];
} catch (e) { }
try { DATA.films = []; delete DATA.filmsSync; } catch (e) { oops_(e, 'me:signedOut_') }
try { if (typeof libForget_ === 'function') libForget_(); } catch (e) { oops_(e, 'me:signedOut_') }
try { if (typeof stuffForget_ === 'function') stuffForget_(); } catch (e) { oops_(e, 'me:signedOut_') }
try { if (typeof answersForget_ === 'function') answersForget_(); } catch (e) { oops_(e, 'me:signedOut_') }
try { if (typeof padWhoChanged_ === 'function') padWhoChanged_(); } catch (e) { oops_(e, 'me:signedOut_') }
try { if (typeof bookFollow_ === 'function') bookFollow_(!!opts.quiet); } catch (e) { oops_(e, 'me:signedOut_') }
if (!opts.quiet) repaint();
}
function signedIn_(d, typed) {
const EXTRA = ['submissions', 'favourites', 'family', 'familyFor', 'answers'];
const got = {};
const me = Object.assign({}, d);
EXTRA.forEach(k => { if (k in me) { got[k] = me[k]; delete me[k]; } });
const pid = String(me.personId || '');
const fromNobody = !USER;
const over = !fromNobody && (String(USER.personId || '') !== pid || !pid);
const finders_ = () => (typeof finderStates_ === 'function' ? finderStates_()
: (typeof STUFF !== 'undefined' ? [STUFF] : []));
let whose = '';
try { whose = String((finders_().find(st => st && st.whose) || {}).whose || ''); } catch (e) { }
const backAt = {};
try { if (fromNobody && whose && whose === pid) Object.keys(FINDERS).forEach(id => { backAt[id] = FINDERS[id].st.whoseAt; }); } catch (e) { }
if (fromNobody) signedOut_({ quiet: true, keepFind: !whose || whose === pid });
else if (over) signedOut_({ quiet: true });
try { finders_().forEach(st => { st.whose = ''; st.whoseAt = 0; }); } catch (e) { }
USER = me; LENS = null;
if (!USER.name) USER.name = me.handle || typed || '';
saveUser_();
try { if (over && typeof ansSwitchedIn_ === 'function') ansSwitchedIn_(pid); } catch (e) { oops_(e, 'me:signedIn_') }
try { if (typeof padWhoChanged_ === 'function') padWhoChanged_(); } catch (e) { oops_(e, 'me:signedIn_') }
try { if (typeof bookFollow_ === 'function') bookFollow_(); } catch (e) { oops_(e, 'me:signedIn_') }
try {
if (got.submissions && typeof got.submissions === 'object' && String(got.submissions.for || '') === pid) DATA.submissions = got.submissions;
if (Array.isArray(got.favourites)) {
DATA.favourites = got.favourites;
if (typeof adoptFavourites_ === 'function') adoptFavourites_();
}
if (Array.isArray(got.family) && String(got.familyFor || '') === pid) { DATA.family = got.family; DATA.familyFor = pid; }
} catch (e) { }
try { if (got.answers && typeof got.answers === 'object' && typeof answersAdopt_ === 'function') answersAdopt_(pid, got.answers); } catch (e) { oops_(e, 'me:signedIn_') }
try { if (pid && typeof answersClaim_ === 'function') answersClaim_(pid, !fromNobody); } catch (e) { oops_(e, 'me:signedIn_') }
try { if (typeof answersPull_ === 'function') answersPull_(true); } catch (e) { oops_(e, 'me:signedIn_') }
try { if (typeof subAdopt_ === 'function') subAdopt_(); } catch (e) { oops_(e, 'me:signedIn_') }
repaint();
Object.keys(backAt).forEach(id => { if (backAt[id] > 0) { try { goPage(id, backAt[id], true); } catch (e) { oops_(e, 'me:signedIn_') } } });
load();
afterSignIn_(d);
}
function signInForgetOld_() {
keep_.del('familyHandles'); keep_.del('familyAdminHint');
}
signInForgetOld_();
const REG_PIN = /^\d{4}$/;
const REG_NOTE = {
parent: text_('we-email-you-a-link-to')
+ 'and tap Add as my child.',
student: text_('we-email-a-link-to-open')
+ 'can also make your account, on Students.',
};
const registerSpec_ = () => ({ kind: 'panel', look: 'reg-card', name: text_('make-an-account'), tags: [text_('make-an-account')],
tiles: [{ icon: 'plus', label: text_('make-an-account'), act: 'sign-join' }] });
function registerCard_() { return renderCard(registerSpec_()); }
const signForgotSpec_ = () => ({ kind: 'panel', look: 'reg-card sign-forgot', name: 'Forgot PIN', tags: [{ text: 'Forgot PIN' }],
body: [{ type: 'text', look: 'note', text: 'We email a link to reset your PIN to the address on this account.' }],
tiles: [{ icon: 'send', label: 'Email me the link', act: 'forgot-pin' }] });
const signJoinStart_ = who => askReset_('sign-join', String(who || '').indexOf('@') > 0 ? { email: who } : who ? { first: String(who).replace(/^@+/, '') } : {});
FORM_SEND_['sign-join'] = (v, el) => {
const who = v.who, first = String(v.first || '').trim(), last = String(v.last || '').trim(), email = String(v.email || '').trim(), pin = String(v.pin || '');
const kid = who === 'student' && v.kid === 'grown-up';
if (who !== 'parent' && who !== 'student') { toast(text_('say-who-the-account-is-for')); return askBack_('sign-join', 'who'); }
if (!first || !last) { toast(text_('your-first-and-last-name-please')); return askBack_('sign-join', first ? 'last' : 'first'); }
if (!FORM_TESTS.email(email)) {
toast(kid ? 'A grown-up\'s email address, please — the link goes to them.' : text_('an-email-address-please-the-link'));
return askBack_('sign-join', 'email');
}
if (!REG_PIN.test(pin)) { toast('A PIN is 4 digits.'); return askBack_('sign-join', 'pin'); }
const body = { action: 'register', who, first_name: first, last_name: last, pin };
if (kid) body.parent_email = email; else body.email = email;
const from = cameFrom_(); if (from) body.from = from;
send_(body, { button: el, busy: text_('making-it') })
.then(d => {
askDone_('sign-join');
const handle = String((d && d.handle) || '');
const said = kid && handle ? '@' + handle : email, box = $('in-name'); if (box) box.value = said;
signAfterJoin_(said);
toast(kid ? text_('account-made-sign-in-now-as') + (handle ? '@' + handle : 'your handle')
+ ' with your PIN. Your grown-up has been sent a link to confirm.'
: who === 'parent'
? text_('account-made-sign-in-now-with-2')
+ 'your child\'s account.'
: text_('account-made-sign-in-now-with'));
})
.catch(() => {});
};
const CAME_FROM_KEY = 'came_from';
function cameFromSave_() {
try {
const f = String(new URLSearchParams(location.search).get('from') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);
if (f) keep_.put(CAME_FROM_KEY, f);
} catch (e) { }
}
const cameFrom_ = () => keep_.get(CAME_FROM_KEY) || '';
cameFromSave_();
;
/* js/me-messages.js */
function verifyFromLink_(again) {
let token = again || '';
if (!token) try {
const q = new URLSearchParams(location.search);
token = (q.get('verify') || '').trim();
if (!token) return;
q.delete('verify');
const rest = q.toString();
history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
} catch (e) { if (!token) return; }
send_({ action: 'verifyEmail', token, session: (USER && USER.token) || '' })
.then(d => {
if (d && d.moved) {
accountChanged_();
if (USER) {
USER.profile = Object.assign({}, USER.profile || {}, { email: String(d.email || ''), email_moving: '' });
saveUser_();
try { repaint(true); } catch (e) { oops_(e, 'me:verifyFromLink_') }
}
toast('Your email is ' + (d.email || 'changed') + ' now — sign in with it from here on.');
return;
}
const first = d && d.name ? fmtName_(d.name, 'first') : '';
if (d && d.noEmail && d.parentPending) {
const who = first || 'They';
openStep_({ title: 'Confirmed — one more step', html: cardBlock_({ type: 'text', look: 'note', paras: [
[who + ' can sign in now', d.handle ? [' as ', { b: '@' + d.handle }] : '', ' with their PIN.'],
[{ b: 'They are not on your account yet.' }, ' The @family. account on your email has not been confirmed, so we did not put '
+ (first || 'them') + ' on it.'],
'Open the "Confirm your @family. account" email we sent you — or sign in and press "Send the link again" — then add '
+ (first || 'them') + ' with "Add your child" on Students. They say yes, and they are on your account.',
'Did you never make an account here? Then somebody else did, with your email. Use "Forgotten your PIN?" with your email to take it back — it signs them out.'] })
+ tile_({ form: true, label: 'Done', act: 'sheet-done', kind: 'quiet' }) });
try { if (USER) load(); } catch (e) { oops_(e, 'me:verifyFromLink_') }
} else if (d && d.noEmail) {
toast('Confirmed — ' + (first || 'they') + ' can sign in now'
+ (d.handle ? ' as @' + d.handle : '') + ' with their PIN'
+ (d.linkedTo ? ', and is on your account.' : '.'));
try { if (USER) load(); } catch (e) { oops_(e, 'me:verifyFromLink_') }
} else {
const me = !!(USER && d && ((d.handle && d.handle === USER.handle) || (d.name && d.name === USER.name)));
if (me) {
accountChanged_();
USER.pendingEmail = '';
saveUser_();
try { repaint(true); } catch (e) { oops_(e, 'me:verifyFromLink_') }
}
toast('Email confirmed' + (first ? ', ' + first : '')
+ (!me ? ' — now sign in with it and your PIN.'
: mayAddChild_() ? ' — you can add your child on Student profiles now.' : '.'));
}
try { if (!USER) go('account'); } catch (e) { oops_(e, 'me:verifyFromLink_') }
})
.catch(err => {
const d = err && err.reply;
if (!d || d.why !== 'sign-in-first') return;
keep_.put('familyVerify', token);
try { go('account'); } catch (e) { oops_(e, 'me:verifyFromLink_') }
});
}
let ACCOUNT_AT_ = 0;
function accountChanged_() { ACCOUNT_AT_ = Date.now(); }
function afterSignIn_(d) {
if (d && (d.childrenHeld || d.pinCleared || d.pinLink || d.moveDropped || d.handleMoved) && d.message) {
openStep_({ title: d.pinCleared ? 'Your PIN has changed' : d.childrenHeld ? 'Signed in — one thing to know'
: d.handleMoved ? 'Your handle has changed' : 'Signed in', html: cardBlock_({ type: 'text', look: 'note', text: d.message }) + tile_({ form: true, label: 'Done', act: 'sheet-done', kind: 'quiet' }) });
}
let waiting = '';
waiting = keep_.get('familyVerify') || ''; keep_.del('familyVerify');
if (waiting) verifyFromLink_(waiting);
try { if (keep_.get(PAID_KEY_)) paidFromLink_(); } catch (e) { }
}
function pinFromLink_() {
let key = '';
try {
const q = new URLSearchParams(location.search);
key = (q.get('signin') || '').trim();
if (!key) return;
q.delete('signin');
const rest = q.toString();
history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
} catch (e) { if (!key) return; }
send_({ action: 'pinLink', key })
.then(d => {
if (!d || !d.success) { toast((d && d.error) || 'That link did not work.'); return; }
signedIn_(d);
})
.catch(() => {});
}
const PAID_KEY_ = 'familyPaid';
let PAID_ASKING_ = '';
function paidFromLink_() {
let ref = '';
try {
const q = new URLSearchParams(location.search);
const paid = q.get('paid');
ref = (q.get('ref') || '').trim();
if (paid !== null || ref) {
q.delete('paid'); q.delete('ref');
const rest = q.toString();
history.replaceState(null, '', location.pathname + (rest ? '?' + rest : '') + location.hash);
if (paid !== '1' || !ref) { toast(text_('payment-cancelled-nothing-was-charged-your')); return; }
keep_.put(PAID_KEY_, ref);
}
} catch (e) { }
if (!ref) ref = keep_.get(PAID_KEY_) || '';
if (!ref || PAID_ASKING_ === ref) return;
if (!USER || !USER.token) {
toast(text_('sign-in-to-finish-your-booking'));
try { go('account'); } catch (e) { oops_(e, 'me:paidFromLink_') }
return;
}
if (!may_('prices')) { toast('A parent paid for this — they sign in to finish the booking.'); return; }
PAID_ASKING_ = ref;
const forget = () => { keep_.del(PAID_KEY_); };
api({ action: 'finalizePayment', ref })
.then(d => {
PAID_ASKING_ = '';
if (d && d.why === 'signed-out') return;
if (d && d.why === 'busy') { toast(d.error || 'Busy — open the site again in a moment to finish.'); return; }
if (!d || !d.success) {
forget();
toast('Payment not confirmed — ' + ((d && d.error) || 'the server did not say why') + ' Nothing was booked.');
return;
}
forget();
toast(d.alreadyDone ? 'Payment already received — you\'re booked' : 'Payment received — you\'re booked');
const open = () => { if (!(d.jobId && openJob_(d.jobId, true))) go('booking'); };
load().then(open, open);
})
.catch(err => { PAID_ASKING_ = ''; toast(why_(err) + ' Your payment is safe — open the site again to finish booking.'); });
}
function claimCard_(c) {
return card_(cardBlock_({ type: 'msgBox', parts: [cardBlock_({ type: 'msgHead', text: c.from + ' says they are your parent' }),
tileRow_(tile_([{ form: true, label: 'Yes', act: 'claim-yes', data: { row: c.rowIndex } },
{ form: true, label: 'No', act: 'claim-no', data: { row: c.rowIndex }, kind: 'quiet' }]), 'btn-row')] }));
}
function mayAddChild_() {
const held = typeof heldRoles === 'function' ? heldRoles() : [];
return held.indexOf('client') !== -1 || held.indexOf('parent') !== -1 || held.indexOf('admin') !== -1;
}
function kidAddSec_() {
return cardBlock_({ type: 'msgBox', look: 'kid-sec kid-add', parts: [cardBlock_({ type: 'msgHead', h: 4, look: 'kid-h', text: 'Add your child' }),
cardBlock_({ type: 'msgText', look: 'note', text: 'Your child makes their own account (Make an account). Then search their handle at the top of '
+ tabLabel_('students', 'Student profile') + ' and tap Add as my child on their card. They say yes before anything is linked.' })] });
}
;
/* js/me-roles.js */
function pinSlip_(first, handle, pin) {
return cardBlock_({ type: 'section', look: 'pin-slip', live: true, blocks: [
{ type: 'text', look: 'pin-slip-k', text: (first || 'They') + ' signs in with' }, { type: 'text', look: 'pin-slip-v', text: '@' + handle },
{ type: 'text', look: 'pin-slip-k', text: 'and the PIN' }, { type: 'text', look: 'pin-slip-v', text: String(pin) }] });
}
const rolesDrawn_ = (draw, look) => { let inner = '';
try { inner = String(draw() || ''); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'settings:drawn'); }
return { type: 'group', look: 'kc-set' + (look ? ' ' + look : ''), inner }; };
function pendingAddr_() { return (whose_() && whose_().pendingEmail) ? String(whose_().pendingEmail) : ''; }
const RESEND_LINK = { icon: 'send', label: 'Send the link again', note: 'to confirm your email', act: 'resend-link' };
function mailHeldNote_() {
const at = pendingAddr_();
return at ? cardBlock_({ type: 'text', look: 'said mail-held wrap-any', text: ['We will email you once you open the link we sent to ', { b: at }, '.'] }) : '';
}
function movingNote_(p) {
const to = p && p.email_moving ? String(p.email_moving) : '';
if (!to) return '';
const was = String((p && p.email) || '');
return cardBlock_({ type: 'text', look: 'said mail-moving wrap-any', text: ['Your email changes to ', { b: to },
' once you open the link we sent there, on a phone where you are signed in.'].concat(was ? [' Until then it is still ', { b: was },
' — sign in with that, or your handle. Type it back here to keep it.'] : []) });
}
function kidHeldSec_() {
return { type: 'section', look: 'kid-sec kid-held', head: 'Add your child', headLook: 'kid-h', blocks: [
{ type: 'text', look: 'note wrap-any', text: ['Open the link we emailed to ', { b: pendingAddr_() }, ' first, then you can add your child.'] },
{ type: 'tiles', tiles: [RESEND_LINK] }] };
}
function kidsLinked_() {
const me = String((USER && USER.personId) || '');
const mine = !!(me && DATA.familyFor && String(DATA.familyFor) === me);
return (mine && Array.isArray(DATA.family) ? DATA.family : [])
.filter(f => f && f.personId && f.title && f.relation === 'child' && String(f.personId) !== me);
}
function kidListSec_(held) {
const kids = kidsLinked_();
if (!kids.length) {
return { type: 'section', look: 'kid-sec kid-list', blocks: [typeof awaiting_ === 'function' && awaiting_() ? { type: 'wait', on: true }
: { type: 'text', look: 'empty', text: 'No child linked yet.' }] };
}
return { type: 'section', look: 'kid-sec kid-list', blocks: kids.map(f => {
const first = String(nameBesideHandle_(f.title, f.handle) || f.title).trim();
return { type: 'who', look: 'kid-item', whoLook: 'kid-who', name: first, handle: f.handle || '',
face: { who: { pic: f.image, avatar: f.avatar, handle: f.handle, name: first, personId: f.personId }, o: { cls: 'kid-face', none: 'prof-none', size: 36 } },
tiles: held ? [] : [{ icon: 'key', label: 'New PIN', note: 'to sign in with', act: 'kid-pin', data: { id: f.personId, name: first.split(' ')[0] } }] };
}) };
}
function childManageCard_() {
const held = !!pendingAddr_();
return setCard_({ hook: 'kid-manage', title: text_('manage-your-child'), body: [kidListSec_(held), held ? kidHeldSec_() : rolesDrawn_(kidAddSec_)] });
}
function heldBy_(err) {
const d = err && err.reply;
if (!USER || !d || d.why !== 'unconfirmed' || !d.pendingEmail) return;
USER.pendingEmail = String(d.pendingEmail);
saveUser_();
try { repaint(true); } catch (e) { oops_(e, 'me:heldBy_') }
}
on('resend-link', el => {
if (!USER) { toast(text_('err-sign-in-first')); return; }
send_({ action: 'resendLink', personId: USER.personId || '' }, { button: el })
.then(d => {
toast(d.message || 'A new link is on its way.');
if (d.why === 'confirmed' && USER) {
accountChanged_();
USER.pendingEmail = '';
saveUser_();
try { repaint(true); } catch (e) { oops_(e, 'me:heldBy_') }
}
})
.catch(() => {});
});
on('kid-pin', el => {
const id = el.getAttribute('data-id') || '', who = el.getAttribute('data-name') || 'them';
if (!id) { toast(text_('that-account-has-no-id-yet')); return; }
const row = el.closest('.tile-row') || el;
document.querySelectorAll('.kid-pin-ask').forEach(x => x.remove());
row.insertAdjacentHTML('afterend', cardBlock_({ type: 'section', look: 'kid-pin-ask', blocks: [
{ type: 'text', look: 'note', text: 'A new PIN for ' + who + ': their old PIN stops working, and they are signed out everywhere. You will see the new one once, to give them.' },
{ type: 'tiles', tiles: [{ form: true, label: 'Make a new PIN', act: 'kid-pin-go', data: { id: id, name: who } }] }] }));
});
on('kid-pin-go', el => {
if (!USER) { toast(text_('err-sign-in-first')); return; }
const id = el.getAttribute('data-id') || '';
send_({ action: 'resetPin', personId: USER.personId || '', targetId: id },
{ button: el, busy: text_('making-it') })
.then(d => {
const body = el.closest('.kid-pin-ask');
if (body) body.innerHTML = pinSlip_(d.first || el.getAttribute('data-name'), d.handle, d.pin)
+ cardBlock_({ type: 'text', look: 'note', text: 'Write it down or read it to them — it is not shown again. They can change it under Kids settings once they are in.' });
})
.catch(() => {});
});
on('sheet-done', () => closeStep_());
const answerClaim_ = (el, accept) => {
if (!USER) { toast(text_('err-sign-in-first')); return; }
const row = el.getAttribute('data-row');
send_({
action: 'answerClaim',
name: USER.name, personId: (USER && USER.personId) || '',
rowIndex: row, accept: accept,
}, { button: el, busy: accept ? 'Linking…' : 'Saying no…' }).then(() => {
toast(accept ? 'Linked. They can book for you now.' : 'Turned down.');
if (Array.isArray(DATA.claims)) DATA.claims = DATA.claims.filter(c => String(c.rowIndex) !== String(row));
if (typeof AT !== 'undefined' && AT === 'parents') repaint(true); else markStale_('parents');
load();
}).catch(() => {});
};
on('claim-yes', el => answerClaim_(el, true));
on('claim-no', el => answerClaim_(el, false));
let HANDLE_SAID = { pid: '', text: '' };
const GROUPS_OLD_ = { 'About you': ['first_name', 'last_name', 'photo'],
'Where': ['borough', 'city'], 'Contact': ['email', 'phone'] };
function myGroups_() {
const role = roleOf((whose_() && whose_().role) || '');
const has = g => !!(g && Object.keys(g).length);
return (role === 'client' && has(DATA.clientFields)) ? DATA.clientFields
: (role === 'student' && has(DATA.studentFields)) ? DATA.studentFields
: has(DATA.profileFields) ? DATA.profileFields
: GROUPS_OLD_;
}
function notLibrary_(groups) {
const out = {};
Object.keys(groups || {}).forEach(g => {
const left = (groups[g] || []).filter(f => !isLibraryCard_(f) && RETIRED_FIELDS_.indexOf(f) === -1);
if (left.length) out[g] = left;
});
return out;
}
const libFieldsOf_ = groups => [].concat(...Object.keys(groups || {}).map(g => groups[g] || [])).filter(isLibraryCard_);
function voiceCard_() {
if (!canSay_()) return '';
return setCard_({ card: 'acct:voice', title: text_('reading-aloud'), body: [{ type: 'text', text: 'Questions are read in this device\'s calmest natural voice.' }], actions: [{ icon: 'speak', label: 'Hear a sample', note: 'the reading voice', act: 'voice-try' }] });
}
const VOICE_SAMPLE = 'Hello. This is how your questions will be read. For example: x² ÷ 4 is less than 3/4.';
on('voice-try', () => { hush_(); say_(VOICE_SAMPLE); });
const rankOffCard_ = (title, say, tiles, look) => renderCard({ kind: 'rank', card: '-', look: look || 'rank-off', tags: [{ text: /people-none/.test(look || '') ? text_('nobody-yet') : /^Sign in/.test(say || '') ? text_('signed-out') : text_('nothing-yet'), colour: 0 }], body: say ? [{ type: 'text', text: say, look: 'note' }] : [], tiles: tiles || [] });
const padlockCard_ = say => renderCard({ kind: 'rank', card: '-', look: 'rank-off col-lock', tags: [{ text: 'Locked', colour: 0 }], body: say ? [{ type: 'text', text: say, look: 'note' }] : [] });
const signedOutCard_ = title => rankOffCard_(title, 'Sign in on ' + tabLabel_('account', text_('kids-settings')) + ' first.');
const LOCK_AS_ = { staff: { rank: 'staff', role: 'Tutor', roles: ['tutor'] }, family: { rank: 'client', role: 'Client', roles: ['client'] },
account: { rank: 'student', role: 'Student', roles: ['student'] } };
function lockedAs_(col, draw) {
const real = USER;
let out = [];
USER = Object.assign({ name: '', handle: '', personId: '', email: '', profile: {}, lockedPreview: true, realViewer: real }, LOCK_AS_[col] || {});
try { out = (draw() || []).filter(Boolean); } catch (e) { out = []; } finally { USER = real; }
return out.map(lockCard_);
}
function lockCard_(h) {
return String(h).replace(/^(\s*<div\b[^>]*\bclass="(?:card|own-set)\b[^"]*)"/, '$1 is-locked"')
.replace(/^(\s*<div\b[^>]*>)/, (m, open) => open + cardLockMark_())
.replace(/<(input|select|textarea|button)\b(?![^>]*\sdisabled\b)/g, '<$1 disabled')
.replace(/<a\b([^>]*)\shref="[^"]*"/g, '<a$1 aria-disabled="true"')
.replace(/(<[a-z]+\b[^>]*?)\sid="/g, '$1 data-lock-id="');
}
const lockedOwnCards_ = col => (OWN_SEC_OF_SET_[col] || []).map(k => setCard_({ card: '-', title: OWN_SEC_TITLE_[k] || k, data: { 'lay-card': 'own:' + col + ':' + k } }));
const LOCKED_DRAW_ = {
staff: () => lockedOwnCards_('staff').concat([setCard_({ card: 'staff:hub', title: 'Staff hub', body: [rolesDrawn_(() => (typeof window.hubBlock_ === 'function' ? window.hubBlock_() : ''))] })]).concat(settingsCards_(settingsSplit_().staff, '', 'staff')),
family: () => lockedOwnCards_('family').concat(settingsCards_(settingsSplit_().parent, '', 'family')),
account: () => lockedOwnCards_('account').concat(youSettingsPages_()),
};
const lockedPages_ = col => lockedAs_(col, LOCKED_DRAW_[col]);
function familyPages_() {
const title = tabLabel_('family', text_('parent-settings'));
if (!whose_()) return [signedOutCard_(title)].concat(lockedPages_('family'));
if (!whoseAtLeast_('client')) return [padlockCard_('Parent settings are for parents.')].concat(lockedPages_('family'));
const out = ownCardSetPage_('family').concat(settingsCards_(settingsSplit_().parent, '', 'family'));
return out.length ? out : [rankOffCard_(title, NOTHING_YET + ' Your details are on ' + tabLabel_('account', text_('kids-settings')) + '.', null, 'set-none')];
}
function applyCard_() {
const open = typeof applyFormOpen_ === 'function' && applyFormOpen_();
const body = open ? applyFormHtml_() : typeof applyOpts_ === 'function' && applyOpts_() ? tileRow_(tile_(applyOpts_()), 'apply-tiles') : '';
return body ? [setCard_({ card: 'staff:apply', hook: 'apply-card', title: text_('apply-to-teach'), data: { yours: '1' }, state: lensOn_() ? 'locked' : '',
body: [{ type: 'text', look: 'note', text: 'Teach with us: tell us what you teach, and we will be in touch.' }, rolesDrawn_(() => body)] })] : [];
}
function staffPages_() {
const title = tabLabel_('staff', text_('tutor-settings'));
if (!whose_()) return [signedOutCard_(title)].concat(lockedPages_('staff'));
if (!whoseAtLeast_('staff')) return [padlockCard_('Tutor settings are for tutors.')].concat(applyCard_(), lockedPages_('staff'));
const hub = typeof window.hubBlock_ === 'function' ? window.hubBlock_() : '';
const warn = typeof window.hubWarn_ === 'function' ? window.hubWarn_() : '';
const top = hub ? [setCard_({ card: 'staff:hub', title: 'Staff hub', body: [rolesDrawn_(() => warn + hub)] })] : [];
const out = ownCardSetPage_('staff').concat(top, typeof window.legoCards_ === 'function' ? window.legoCards_() : [], settingsCards_(settingsSplit_().staff, '', 'staff'));
return out.length ? out : [rankOffCard_('', NOTHING_YET, null, 'rank-off set-none')];
}
function apprenticePages_() {
return [setCard_({ card: 'appr:blurb', body: [{ type: 'text', look: 'note', text: brand('apprentice_blurb', 'Work experience with us. Coming soon.') }] })];
}
function adminPages_() {
if (!(typeof may_ === 'function' && may_('admin'))) return [];
return typeof window.bizPages_ === 'function' ? window.bizPages_() : [];
}
function sitePages_() {
if (!(typeof may_ === 'function' && may_('admin'))) return [];
return (typeof window.siteBizPages_ === 'function' ? window.siteBizPages_() : [])
.concat(typeof window.inboxCard_ === 'function' ? [window.inboxCard_()] : [])
.concat(STABILITY_SHOWN ? [stabilityCard_()] : [])
.concat([siteTplCard_(), siteRenameCard_()])
.concat([setCard_({ card: 'biz:build', title: 'Build', body: [rolesDrawn_(versionSaid_, 'me-build')] })]);
}
const SITE_TPL_PARTS_ = ['Picture — only if real', 'Tags — the name first', 'Content', 'Buttons — round; hold or hover for the word'];
const SITE_TPL_SCALE_ = [['Text', ['--fs-small', '--fs-title', '--fs-body']], ['Spacing', ['--s0', '--s1', '--s2', '--s3', '--s4', '--s5', '--s6']],
['Button', ['--tile', '--tile-i', '--tap']], ['Picture', ['--pic-s', '--pic-l', '--pic-h']], ['Corners', ['--r-ui', '--r-round', '--r-box']],
['Colours', ['--bg', '--raised', '--line', '--ink', '--dim', '--faint', '--gold', '--good', '--warn', '--bad', '--paper', '--paper-ink']]];
const siteTok_ = k => { try { return dash_(getComputedStyle(document.documentElement).getPropertyValue(k).trim()); } catch (e) { return dash_(''); } };
CARD_EMBEDS['tpl-sample'] = () => renderCard({ kind: 'panel', look: 'tpl-sample', name: 'A sample card', picture: { src: 'icon.png', alt: 'A sample picture' },
tags: [{ text: 'A sample card' }, { text: 'A tag' }], body: [{ type: 'text', text: 'What the thing holds, in plain words, centred.' }] });
function siteTplCard_() {
return setCard_({ card: 'site:template', title: text_('card-template'), body: [
{ type: 'text', look: 'note', text: 'Every card on the site is drawn by this one template: picture, tags, content, buttons, top to bottom on one centre line.' },
{ type: 'embed', tool: 'tpl-sample' },
{ type: 'list', ordered: true, look: 'tpl-parts', items: SITE_TPL_PARTS_ },
{ type: 'text', look: 'note', text: 'The fixed scale, as the page has it now:' }]
.concat(...SITE_TPL_SCALE_.map(([name, list]) => [{ type: 'text', look: 'tpl-group', text: name }, { type: 'list', look: 'tpl-row', items: list.map(t => t + ' ' + siteTok_(t)) }])) });
}
const RENAME = { list: null, seed: 0, busy: false, said: '' };
function siteRenameCard_() {
const rows = (RENAME.list || []).map(p => (p.name || p.personId) + ': ' + (p.from ? '@' + p.from : '(none)') + ' → ' + (p.to ? '@' + p.to : 'could not make one'));
const tiles = [{ icon: 'show', label: 'Preview list', act: 'rename-preview' }]
.concat(RENAME.list ? [{ icon: 'save', label: 'Apply', act: 'rename-apply' }] : []);
return setCard_({ card: 'site:rename', title: text_('rename-every-username'), actions: tiles, body: [
{ type: 'text', look: 'note', text: 'Everybody gets a new username in the site\'s username format (being decided). Old usernames stop working — tell people their new one.' }]
.concat(RENAME.said ? [{ type: 'text', look: 'note', text: RENAME.said }] : [])
.concat(rows.length ? [{ type: 'list', look: 'rename-list', items: rows }] : []) });
}
const renameAsk_ = (el, dry) => {
if (RENAME.busy) return;
RENAME.busy = true;
send_({ action: 'renameAllUsernames', token: (USER && USER.token) || '', dryRun: dry, seed: dry ? undefined : RENAME.seed }, { button: el })
.then(d => {
RENAME.list = Array.isArray(d.list) ? d.list : []; RENAME.seed = Number(d.seed) || 0;
RENAME.said = dry ? RENAME.list.length + ' people — nothing changed yet.' : (d.renamed || 0) + ' usernames changed.';
})
.catch(() => {})
.then(() => { RENAME.busy = false; lensRedraw_(); });
};
on('rename-preview', el => renameAsk_(el, true));
on('rename-apply', el => {
if (!RENAME.list || !RENAME.seed) return;
if (!sure_(el, 'Rename everybody?')) return;
renameAsk_(el, false);
});
const STABILITY_SHOWN = false;
const STAB = { got: null, failed: false, asked: false, all: false };
function stabilityCard_() {
if (!STAB.asked) {
STAB.asked = true;
dataFile_('data/stability.json')
.then(j => { STAB.got = j && typeof j.score === 'number' ? j : null; STAB.failed = !STAB.got; lensRedraw_(); });
}
const s = STAB.got;
if (!s) return setCard_({ card: 'site:stability', hook: 'stability-card', title: 'Stability', body: [STAB.failed ? { type: 'paperNote', alert: true, text: 'The score could not be read. Run node tools/stability.js and push.' } : { type: 'wait', on: true }] });
const sig = (s.signals || []).filter(x => x.off > 0);
return setCard_({ card: 'site:stability', hook: 'stability-card', title: 'Stability', body: [{ type: 'text', look: 'stab-score', text: String(s.score) + '%' },
{ type: 'list', ordered: true, look: 'stab-top', items: (STAB.all ? sig : sig.slice(0, 3)).map(x => x.label + ': ' + x.count + ' −' + x.off) },
sig.length > 3 ? { type: 'tiles', tiles: [{ icon: STAB.all ? 'hide' : 'show', label: STAB.all ? 'Show the top 3' : 'Show every signal', act: 'stab-all' }] } : null] });
}
on('stab-all', () => { STAB.all = !STAB.all; lensRedraw_(); });
const ROLE_PICKS = [
['tutor', 'Tutor', 'You teach here. Teaching starts with "Apply to teach" on Tutor settings.'],
['client', 'Client', 'A parent or payer. You book and pay for sessions.'],
['student', 'Student', 'You are the one learning. Only @family. can change a student account back.'],
];
function rolesSaid_() {
if (!whose_()) return '';
if (whoseAtLeast_('admin')) return '';
if (whose_().tutorPending && hasRole('tutor', whose_()))
return 'Tutor is waiting for ' + brand('name', '@family.') + ' to approve you. Until then you are not on the site and '
+ 'cannot be booked — fill in your teaching pages meanwhile.';
if (whoseAtLeast_('staff')) return 'You teach here. Your hours, pricing and terms are in the Staff hub on ' + tabLabel_('staff', text_('tutor-settings')) + '.';
if (rank_(whose_()) === 'student') return 'A parent links you to their account from theirs.';
return '';
}
const rolesPickable_ = () => !!whose_() && rank_(whose_()) === 'client';
function rolesCard_() {
const name = brand('name', '@family.');
const can = rolesPickable_() ? ROLE_PICKS.filter(([r]) => r !== 'tutor') : [];
const picks = can.length ? [{ type: 'formRow', label: 'You are', control: { kind: 'select', look: 'role-pick-in', aria: 'Your role', value: 'client',
options: can.map(([r, label]) => ({ value: r, text: label, data: { 'role-pick': r } })) } },
{ type: 'tiles', tiles: [{ icon: 'save', label: text_('save'), act: 'roles-save' }] }] : [];
const said = rolesSaid_();
return setCard_({ card: 'acct:roles', title: 'Your roles', state: lensOn_() ? 'locked' : '', body: picks.concat(picks.length || said ? [{ type: 'paperNote', look: 'roles-said', live: true, text: said }] : []) });
}
const rolesPicked_ = card => {
const b = card.querySelector('[data-role-pick]:checked');
if (!b) return [];
return [b.dataset.rolePick].concat(USER && USER.tutorPending && tutorHeld_() ? ['tutor'] : []);
};
on('roles-save', el => {
const card = el.closest('.card');
if (!USER || !card) return;
const said = card.querySelector('.roles-said');
const roles = rolesPicked_(card);
if (!roles.length) return;
send_({ action: 'setMyRoles', name: USER.name, personId: USER.personId || '', roles },
{ button: el, where: said || undefined, saying: 'Saving…', lock: card })
.then(d => {
USER.role = d.role || USER.role;
USER.roles = Array.isArray(d.roles) ? d.roles : USER.roles;
USER.tutorPending = !!d.tutorPending;
if (d.rank) USER.rank = String(d.rank);
if (d.notify) USER.profile = Object.assign({}, USER.profile || {}, { notify: d.notify });
saveUser_();
toast(d.changed ? 'Role saved' : text_('nothing-changed'));
if (d.changed) { try { repaint(true); } catch (e) { oops_(e, 'me:rolesCard_') } try { load(); } catch (e) { oops_(e, 'me:rolesCard_') } }
const now = document.querySelector('.roles-card .roles-said');
if (now) now.textContent = d.changed && rolesPickable_() && !USER.tutorPending ? text_('saved') : rolesSaid_();
})
.catch(err => {
if (!err || !err.refused) return;
const live = document.querySelector('#s-stuff .roles-card') || card;
[].forEach.call(live.querySelectorAll('[data-role-pick]'), b => { b.selected = b.dataset.rolePick === 'client'; });
});
});
let NOTIFY_SAID = { pid: '', text: '' };
const notifyList_ = () => {
const n = whose_() && whose_().profile && whose_().profile.notify;
return n && Array.isArray(n.kinds) ? n : null;
};
function notifyCard_() {
const f = (DATA && Array.isArray(DATA.features)) ? DATA.features : [];
const n = notifyList_();
const said = t => cardBlock_({ type: 'paperNote', look: 'notify-said', live: true, text: t });
let inner, toggles = [], tail = '';
if (f.indexOf('notify:save') === -1 && (f.length || LOADED)) {
inner = cardBlock_({ type: 'text', look: 'empty', text: 'Email choices are not switched on yet.' });
}
else if (!n) inner = said('Your choices are on their way from the sheet.');
else if (!n.to) {
const kid = heldRoles(whose_()).map(roleOf).indexOf('student') !== -1;
inner = cardBlock_({ type: 'text', look: 'empty', text: kid ? 'No email address, so no emails.' : 'No email address yet — add one on your Contact card.' });
}
else if (!n.kinds.length) {
inner = cardBlock_({ type: 'text', look: 'empty', text: 'No email choices yet.' });
} else {
const opt = n.kinds.filter(k => !k.essential), must = n.kinds.filter(k => k.essential);
const mine = NOTIFY_SAID.pid && NOTIFY_SAID.pid === String(whose_().personId || '') ? NOTIFY_SAID.text : '';
inner = '';
toggles = opt.map(k => ({ act: 'notify-pick', cls: 'notify-pick', data: { kind: k.kind }, on: k.on, label: k.label,
note: (k.note || '') + (k.idle ? ' — ' + String(k.idle).toLowerCase() : '') }));
tail = cardBlocks_(must.length ? [{ type: 'text', look: 'notify-cap', text: 'Always sent' }, { type: 'list', look: 'notify-always', items: must.map(k => k.label) }] : [])
+ said(mine);
}
if (typeof window.pushBody_ === 'function') tail += window.pushBody_();
return formCard_({ title: text_('notifications'), body: inner + formOf_('notify', null, { options: { kinds: toggles || [] } }), tail: tail, save: false, card: 'acct:notify' });
}
const notifyOnNow_ = kind => {
const n = notifyList_();
const k = n && n.kinds.find(x => x.kind === kind);
return !!(k && k.on);
};
on('notify-pick', el => {
if (!USER || !el || el.disabled) return;
const card = el.closest('.card');
const said = card && card.querySelector('.notify-said');
const kind = String(el.dataset.kind || '');
const want = !!el.checked;
const n = notifyList_();
const label = ((n && n.kinds.find(x => x.kind === kind)) || {}).label || 'That email';
const W = whose_();
send_(Object.assign({ action: 'item', door: 'save', item: 'notify', name: USER.name, personId: USER.personId || '', kind: kind, on: want }, W === USER ? {} : { targetId: W.personId || '' }),
{ where: said || undefined, saying: 'Saving…', lock: el.closest('label') || el })
.then(d => {
const on = d && typeof d.on === 'boolean' ? d.on : want;
const held = notifyList_();
if (held && held.kinds.some(x => x.kind === kind)) {
W.profile = Object.assign({}, W.profile, { notify: Object.assign({}, held, {
kinds: held.kinds.map(x => x.kind === kind && !x.essential ? Object.assign({}, x, { on: on }) : x) }) });
} else if (d && d.notify) W.profile = Object.assign({}, W.profile || {}, { notify: d.notify });
if (W === USER) saveUser_();
NOTIFY_SAID = { pid: String(W.personId || ''),
text: on ? label + ' is on.' : label + ' is off — we will not email you that.' };
const live = document.querySelector('#s-stuff .notify-card') || card;
const box = live && live.querySelector('[data-kind="' + kind + '"]');
if (box) box.checked = on;
const line = live && live.querySelector('.notify-said');
if (line) line.textContent = NOTIFY_SAID.text;
toast(text_('saved'));
})
.catch(() => {
const live = document.querySelector('#s-stuff .notify-card [data-kind="' + kind + '"]') || el;
live.checked = notifyOnNow_(kind);
});
});
function availGrid_(codes, p, readonly, mine) {
const ro = f => readonly.indexOf(f) !== -1;
const was = f => (TRUEish_(p[f]) ? '1' : '0');
const keep = f => !!mine && !ro(f) && typeof draftVal_ === 'function';
const on = f => (keep(f) ? draftVal_('set', f, was(f)) : was(f)) === '1';
const days = [['m', 'Mon'], ['tu', 'Tue'], ['w', 'Wed'], ['th', 'Thu'],
['f', 'Fri'], ['sa', 'Sat'], ['su', 'Sun']]
.map(([prefix, label]) => ({
label: label,
hours: codes.filter(c => c.replace(/\d+$/, '') === prefix)
.sort((a, b) => Number(a.slice(prefix.length)) - Number(b.slice(prefix.length)))
.map(c => ({ code: c, h: Number(c.slice(prefix.length)) })),
}))
.filter(d => d.hours.length);
if (!days.length) return '';
return cardBlock_({ type: 'paperBox', look: 'me-week', inner: weekGrid_(days, (h, d) => cardBlock_({ type: 'tickCell', look: 'hr' + (on(h.code) ? ' on' : '') + (ro(h.code) ? ' shut' : ''),
label: d.label + ' ' + h.h + ':00', control: { value: on(h.code), off: ro(h.code), data: { me: h.code }, drafted: keep(h.code) ? draftAttr_('set', h.code, was(h.code)) : '' } })) });
}
const STAFF_GROUPS_ = ['Your rate and group size', 'Qualifications', 'Jobs', 'Availability', 'When I can teach'];
function staffField_(f, g) {
const sets = [DATA.clientFields, DATA.studentFields].filter(x => x && Object.keys(x).length);
if (!sets.length) return STAFF_GROUPS_.indexOf(g) !== -1;
return !sets.some(x => Object.keys(x).some(k => (x[k] || []).indexOf(f) !== -1));
}
function parentOnly_(f) {
const c = DATA.clientFields, k = DATA.studentFields, has = x => x && Object.keys(x).length, inn = x => Object.keys(x).some(g => (x[g] || []).indexOf(f) !== -1);
return !!(has(c) && has(k) && inn(c) && !inn(k));
}
function settingsSplit_() {
const shown = notLibrary_(cardSettingsGroups_(myGroups_(), ownCardFields_()));
if (typeof window.hubFor_ === 'function' && window.hubFor_() && cardMine_()) Object.keys(shown).forEach(g => { if (isTimetable_(shown[g])) delete shown[g]; });
const out = { you: {}, parent: {}, staff: {} };
Object.keys(shown).forEach(g => {
if (!shown[g].length) return;
const mine = shown[g].filter(f => !staffField_(f, g)), staff = shown[g].filter(f => staffField_(f, g));
const kid = mine.filter(f => !parentOnly_(f)), par = mine.filter(parentOnly_);
if (kid.length) out.you[g] = kid;
if (par.length) out.parent[g] = par;
if (staff.length) out.staff[mine.length ? labelOf_('staff-group', g, g) : g] = staff;
});
return out;
}
function settingsCards_(shown, moved, col) {
const p = whose_().profile || {};
const readonly = (DATA.profileReadonly || []).concat('extra_seat_cut').filter(fieldReadonly_);
const mail = list => (list || []).indexOf('email') !== -1;
const one = (g, list, top, lid) => setHeldSay_(formCard_({ title: g, lead: (top || '') + shareBarFor_(list, p),
attrs: lid ? ` data-lay-card="${esc(lid)}"` : '',
groups: { [g]: list },
fieldOpts: {
value: f => (f === 'email' && p.email_moving) ? p.email_moving : (p[f] ?? ''),
raw: p,
readonly: readonly,
options: fieldOptions_,
},
save: mail(list) && p.email_moving ? tile_(RESEND_LINK) : false,
foot: (mail(list) ? movingNote_(p) : '') + cardBlock_(meSaidB_('')) }));
const out = [];
Object.keys(shown).forEach((g, k) => {
const list = shown[g] || [], top = k === 0 ? moved : '';
out.push(one(g, list, top, col ? setCardId_(col, g) : ''));
});
return out;
}
const setCardId_ = (col, g) => 'set:' + [col, g].map(x => String(x).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 28) || 'x').join(':');
const tabLabel_ = (id, or) => ((typeof settingGroupOf_ === 'function' && settingGroupOf_(id)) || {}).label || or;
const homeCol_ = () => may_('staff') ? 'tutors' : may_('grownUp') ? 'parents' : 'students';
const PEOPLE_COL_LINK = { parents: 'child' };
function peopleBelong_(col, family) {
if (!USER) return false;
const rel = r => (family || []).some(f => f && f.relation === r);
if (col === homeCol_()) return true;
if (isTutorsCol_(col)) return !!(typeof cardMine_ === 'function' && cardMine_());
return rel(Object.prototype.hasOwnProperty.call(PEOPLE_COL_LINK, col) ? PEOPLE_COL_LINK[col] : 'parent');
}
function ownCardSetPage_(setCol) {
const face = FACE_OF_SET_[setCol];
if (!whose_() || !face || typeof ownCardSections_ !== 'function') return [];
const secs = ownCardSections_(face);
if (!secs.length) return [];
const mine = typeof myCardRow_ === 'function' ? myCardRow_(whose_()) : null;
const row = face === 'tutors' ? (cardMine_() || mine) : mine;
if (!row || !row.personId || !cardMayEdit_(row)) return [];
return cardEditCards_(row, cardOwnOpen_(row), secs, setCol).map(h => (lensOn_() && /data-sec="picture"|class="vid-/.test(h) ? lockCard_(h) : h));
}
function cardOwnOpen_(t) {
const now = cardEditNow_();
if (now && now.pid === String(t.personId)) { now.col = 'settings'; return now; }
const e = CARD_EDIT = cardEditFresh_(t.personId);
e.pic0 = cardPicNow_(t);
e.fig0 = String(whose_().avatar || ''); e.cr0 = Number(whose_().credits || 0); e.h0 = String(whose_().handle || whose_().name || '');
cardRemember_(e);
return e;
}
function youSettingsPages_() {
if (!whose_()) return [];
const shown = settingsSplit_().you;
const pages = settingsCards_(shown, '', 'account');
pages.push(formCard_({ id: 'signing-in', card: 'acct:pin', state: lensOn_() ? 'locked' : '' }));
pages.push(rolesCard_());
pages.push(notifyCard_());
const voice = voiceCard_();
if (voice) pages.push(voice);
return pages;
}
function studentSetPages_() {
if (!whose_()) {
const reg = typeof registerCard_ === 'function' ? [registerCard_()] : [];
return reg.concat(lockedPages_('account'));
}
const who = nameBesideHandle_(whose_().name, whose_().handle) || 'you';
const top = setCard_({ card: 'acct:signed-in', title: 'Signed in', state: lensOn_() ? 'locked' : '', body: [tileRow_(tile_({ icon: 'out', label: 'Sign out', act: 'signout' })
+ (typeof pendingAddr_ === 'function' && pendingAddr_() && typeof RESEND_LINK !== 'undefined' ? tile_(RESEND_LINK) : ''), '', true),
typeof mailHeldNote_ === 'function' ? mailHeldNote_() : ''] });
const coming = typeof awaiting_ === 'function' && awaiting_() ? [loading_()] : [];
const all = typeof progressCards_ === 'function' ? progressCards_() : [];
const prog = all.map(c => String(c).replace(/^(\s*<div class="card fc kc)\b/, '$1 prog-w')), wait = coming.length || !(typeof progressComing_ === 'function' && progressComing_()) ? coming : [loading_()];
return [top].concat(ownCardSetPage_('account'), youSettingsPages_(),
/^(student|staff)$/.test(rank_(whose_())) && typeof workFileCard_ === 'function' ? [workFileCard_()].filter(Boolean) : [],
soonCards_(),
prog, wait);
}
const SOON_CARDS = [
['soon-brownie', text_('brownie-points'), 'Points you earn for good work. Coming soon.'],
['soon-roadmap', 'Roadmap', 'How much of your syllabus is left, subject by subject. Coming soon.'],
['soon-conduct', text_('code-of-conduct'), 'How we treat each other here. Coming soon.'],
];
const soonCards_ = () => SOON_CARDS.map(([c, h, p]) => renderCard({ kind: 'soon', card: c.replace(/^soon-/, 'acct:'), look: 'soon-card ' + c, tags: [{ text: h, colour: 0 }], body: [{ type: 'text', text: p }] }));
;
/* js/me-send.js */
function send_(body, o) {
o = o || {};
const btn = o.button;
const say = msg => {
const el = o.where && (typeof o.where === 'string' ? $(o.where) : o.where);
if (el) el.textContent = msg; else if (btn || navigator.onLine !== false) toast(msg);
};
if (btn) { btn.disabled = !btn.hasAttribute('data-unlocked'); tell_(btn, 'busy');
if (o.busy && !btn.classList.contains('tile')) { btn.dataset.was = btn.textContent; btn.textContent = o.busy; } }
if (o.saying) say(o.saying);
const box = o.lock
? (typeof o.lock === 'string' ? $(o.lock) : o.lock)
: btn && btn.closest('.me-form, .rc, #sheet-body, .card');
const had = document.activeElement;
const locked = [];
if (box) {
[].forEach.call(box.querySelectorAll('input, select, textarea, button'), el => {
if (el === btn || el.disabled || el.hasAttribute('data-unlocked')) return;
el.disabled = true;
locked.push(el);
});
box.classList.add('is-sending');
}
const done = () => {
locked.forEach(el => { el.disabled = false; });
locked.length = 0;
if (box) box.classList.remove('is-sending');
if (had && had.focus && document.contains(had)) { try { had.focus(); } catch (e) { } }
if (!btn) return;
btn.disabled = false;
tell_(btn, '');
if (btn.dataset.was) { btn.textContent = btn.dataset.was; delete btn.dataset.was; }
};
return api(body)
.then(d => {
if (!d || d.error) {
const refusal = new Error((d && d.error) || text_('that-did-not-work'));
refusal.refused = !!(d && d.error);
refusal.reply = d || null;
throw refusal;
}
done();
return d;
})
.catch(err => {
done();
say(typeof why_ === 'function' ? why_(err) : String(err && err.message || err));
err.handled = true;
throw err;
});
}
;
/* js/me-shelves.js */
const FIELD_IS_BOOL = /^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)/;
const FIELD_IS_DECIMAL = /rate|price|cost|hours|km|fraction/;
const FIELD_IS_NUMERIC = /pages|year|students|days|weeks|count|level_required/;
const FIELD_IS_DATE = /_date$/;
const FIELD_LISTS_ = {
favourite_colour: ['Red', 'Orange', 'Yellow', 'Green', 'Teal', 'Blue', 'Navy', 'Purple', 'Pink',
'Brown', 'Black', 'White', 'Grey', 'Gold', 'Silver'],
};
const QUAL_SUBJECTS = [
'Accounting', 'Ancient History', 'Arabic', 'Archaeology', 'Art and Design', 'Biology',
'Business Studies', 'Chemistry', 'Chinese', 'Citizenship', 'Classical Civilisation', 'Combined Science',
'Computer Science', 'Dance', 'Design and Technology', 'Drama', 'Economics', 'Education',
'Electronics', 'Engineering', 'English Language', 'English Literature', 'Film Studies',
'Food Preparation and Nutrition', 'French', 'Further Maths', 'Geography', 'Geology', 'German',
'Greek', 'History', 'Italian', 'Latin', 'Law', 'Maths', 'Media Studies', 'Medicine', 'Music',
'Philosophy', 'Physical Education', 'Physics', 'Politics', 'Portuguese', 'Psychology',
'Religious Studies', 'Russian', 'Sociology', 'Spanish', 'Statistics', 'Theology',
'PGCE', 'QTS', 'DBS', 'First Aid', 'DofE Gold',
];
const QUAL_LEVELS = SHARED_SETTINGS.levels.quals.list;
const QUAL_GRADES = [
'9', '8', '7', '6', '5', '4', '3', '2', '1', 'A*', 'A', 'B', 'C', 'D', 'E', 'U',
'Distinction*', 'Distinction', 'Merit', 'Pass',
'First', '2:1', '2:2', 'Third',
];
const FIELD_MULTI = { venues_ok: true };
function fieldOptions_(f) {
const v = (typeof DATA !== 'undefined' && DATA && DATA.validations) || {};
const dd = (typeof DATA !== 'undefined' && DATA && DATA.dropdowns) || {};
const got = x => (x && x.length ? x : null);
const first = String(f).replace(/^qual_\d+/, 'qual_1');
if (/^qual_\d+$/.test(String(f))) return QUAL_SUBJECTS;
if (/^qual_\d+_level$/.test(String(f))) return QUAL_LEVELS;
if (/^qual_\d+_grade$/.test(String(f))) return QUAL_GRADES;
return got(v[f]) || FIELD_LISTS_[f] || got(v[first])
|| (f === 'venues_ok' ? got((typeof DATA !== 'undefined' && DATA && DATA.venues || [])
.map(x => x && x.title).filter(Boolean)) : null)
|| null;
}
const setDraftOk_ = name => typeof draftAttr_ === 'function'
&& !/pin/i.test(String(name)) && !/^(lib\d+_|qual_)/.test(String(name));
const SET_HELD_SAY = 'Not saved yet — what you typed here before is still in its box. Save keeps it.';
const meAttrs_ = (...parts) => { const a = {};
parts.join(' ').replace(/([\w:-]+)(?:="([^"]*)")?/g, (m, k, v) => { if (!(k in a)) a[k] = v == null ? true : cardUnesc_(v); return m; }); return a; };
const meSaidB_ = text => ({ type: 'status', saved: true, text });
function setHeldSay_(html) {
const empty = cardBlock_(meSaidB_(''));
return /\sdata-draft-held\b/.test(html) ? html.replace(empty, cardBlock_(meSaidB_(SET_HELD_SAY))) : html;
}
function fieldHtml(name, value, o) {
o = o || {};
const pr = askProps_(name);
if ((pr.label || pr.min != null || pr.max != null) && !o.label && !o.placeholder) {
o = Object.assign({}, o, { label: (o.readonly && pr.labelLocked) || pr.label,
extra: (o.extra || '') + ` type="number"${pr.min != null ? ` min="${pr.min}"` : ''}${pr.max != null ? ` max="${pr.max}"` : ''}${pr.step != null ? ` step="${pr.step}"` : ''}${pr.pad ? ` inputmode="${pr.pad}"` : ''}` });
}
if (pr.chars) o = Object.assign({}, o, { label: o.label || pr.label, extra: (o.extra || '') + ` maxlength="${pr.chars}"` });
const attr = o.attr || 'data-me';
const label = o.label || fieldLabel(name);
const ro = !!o.readonly;
const v0 = value ?? '';
const keep = attr === 'data-me' && !ro && o.draft !== false && setDraftOk_(name);
const saved = FIELD_IS_BOOL.test(name) ? (TRUEish_(v0) ? '1' : '0') : String(v0);
const da = keep ? draftAttr_('set', name, saved) : '';
const dv = keep ? draftVal_('set', name, saved) : saved;
const v = keep && !FIELD_IS_BOOL.test(name) ? dv : v0;
if (FIELD_IS_BOOL.test(name)) {
return cardBlock_({ type: 'tick', text: label, attrs: meAttrs_(`${attr}="${esc(name)}" ${(keep ? dv === '1' : TRUEish_(v)) ? 'checked' : ''}
             ${ro ? 'disabled' : ''}${da}`) });
}
if (FIELD_MULTI[name] && (o.options || []).length) {
const got = profList_(v);
const on = x => got.some(g => norm(g) === norm(x));
const opts = (o.options || []).slice();
got.forEach(g => { if (!opts.some(x => norm(x) === norm(g))) opts.push(g); });
const said = got.join(', ');
const key = attr + ':' + name;
return cardBlock_({ type: 'many', label, key, said, open: MANY_OPEN_ === key,
hidden: { attrs: meAttrs_(`type="hidden" ${attr}="${esc(name)}" value="${esc(said)}"${da}`) },
ticks: opts.map(x => ({ look: 'many-opt', text: x, attrs: { 'data-many-of': name, value: x, checked: on(x), disabled: ro } })) });
}
const opts = name === 'manager'
? managerOptions_(String((o.raw && o.raw.person_id) || (whose_() || {}).personId || '')) : (o.options || []);
const ov = x => String(x && typeof x === 'object' ? x.v : x), ot = x => String(x && typeof x === 'object' ? x.t : x);
if (opts.length) {
const ph = o.placeholder || '';
return cardBlock_({ type: 'field', cap: ph ? '' : label, blocks: [{ type: 'control', tag: 'select',
attrs: meAttrs_(`${attr}="${esc(name)}" ${ro ? 'disabled' : ''}${ph ? ` aria-label="${esc(ph)}"` : ''}${da}`),
options: [{ value: '', text: ph || (name === 'manager' ? MANAGER_NONE : NONE_LABEL) }].concat(
(v !== '' && v != null && !opts.some(x => ov(x) === String(v)) ? [String(v)] : [])
.concat(opts).map(x => ({ value: ov(x), text: ot(x), on: String(v) === ov(x) }))) }] });
}
if (FIELD_IS_DATE.test(name)) {
return meBox_(label, `type="date" ${attr}="${esc(name)}" value="${esc(String(v))}"
             ${ro ? 'disabled' : ''} ${o.extra || ''}${da}`);
}
const pad = FIELD_IS_DECIMAL.test(name) ? 'decimal'
: FIELD_IS_NUMERIC.test(name) ? 'numeric' : '';
const hint = o.placeholder || '';
return meBox_(hint ? '' : label, `${attr}="${esc(name)}" value="${esc(String(v))}" ${ro ? 'disabled' : ''}
           ${hint ? `placeholder="${esc(hint)}"` : ''} ${o.extra || ''}
           ${pad ? `inputmode="${pad}"` : ''}${pad === 'numeric' && !/\btype=/.test(o.extra || '') ? ' type="number" min="0" step="1"' : ''}${da}`);
}
const meBox_ = (cap, attrs, look) => cardBlock_({ type: 'field', cap, look, blocks: [{ type: 'control', attrs: meAttrs_(attrs) }] });
let MANY_OPEN_ = '';
document.addEventListener('toggle', e => {
const d = e.target;
if (!d || !d.matches || !d.matches('details.many-d')) return;
const k = d.dataset.many || '';
if (d.open && MANY_OPEN_ !== k && typeof tickListShow_ === 'function') {
tickListShow_(() => ({ list: d.querySelector('.many-list'), head: d.querySelector('summary') }),
() => d.isConnected && d.open);
}
if (d.open) MANY_OPEN_ = k;
else if (MANY_OPEN_ === k && d.isConnected) MANY_OPEN_ = '';
}, true);
document.addEventListener('change', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('input[type="checkbox"][data-many-of]')) return;
const field = t.closest('.many');
const box = field && field.querySelector(':scope > input[type="hidden"]');
if (!box) return;
const got = [...field.querySelectorAll('input[type="checkbox"][data-many-of]')]
.filter(c => c.checked).map(c => c.value);
box.value = got.join(', ');
const spec = box.getAttribute('data-draft');
if (spec && typeof draftKeep_ === 'function') {
try {
const at = spec.indexOf(':'), surface = spec.slice(0, at), id = spec.slice(at + 1);
const was = box.getAttribute('data-draft-was') || '';
if (typeof draftSame_ === 'function' && draftSame_(box.value, was)) draftDrop_(surface, id);
else draftKeep_(surface, id, box.value, false, was);
} catch (err) { }
}
const sum = field.querySelector('summary');
const cap = field.querySelector('.many-cap');
if (sum) {
sum.textContent = box.value || text_('tap-to-choose');
sum.classList.toggle('is-unset', !got.length);
sum.setAttribute('aria-label', ((cap && cap.textContent) || '') + ': ' + (box.value || 'nothing chosen'));
}
});
document.addEventListener('change', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('.hr > input[type="checkbox"]')) return;
t.parentNode.classList.toggle('on', t.checked);
});
const ADJECTIVE_FIELDS = ['adjective_1', 'adjective_2', 'adjective_3'];
const FIELD_ROWS = [
{ fields: ['first_name', 'last_name'] },
{ fields: ADJECTIVE_FIELDS, cap: 'you, in 3 words',
ph: ['word 1', 'word 2', 'word 3'] },
{ fields: ['min_students', 'max_students'], cap: 'students', ph: ['min', 'max'], dash: true },
{ fields: ['age_min', 'age_max'], cap: 'ages you teach', ph: ['youngest', 'oldest'], dash: true },
{ fields: ['min_hours', 'max_hours'], cap: 'session, in hours', ph: ['shortest', 'longest'], dash: true },
];
const ROW_LABEL = new Proxy({}, { get: (t, k) => (typeof k !== 'string' ? undefined
: labelOf_('row-label', k, typeof DATA !== 'undefined' && DATA && DATA.labels && DATA.labels['row-label'] ? undefined : k.replace(/_/g, ' '))) });
const MANAGER_NONE = '@family. (the admin)';
function managerOptions_(self) {
return ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || [])
.filter(t => t && t.personId && String(t.personId) !== String(self || '') && t.role !== 'Admin')
.map(t => ({ v: String(t.personId), t: String(t.title || t.personId) }));
}
function fieldRows_(list, one) {
const out = [], done = new Set();
list.forEach(f => {
if (done.has(f)) return;
const row = FIELD_ROWS.find(r => r.fields.indexOf(f) !== -1 && r.fields.every(x => list.indexOf(x) !== -1));
if (!row) { out.push(one(f, {})); return; }
row.fields.forEach(x => done.add(x));
const boxes = row.fields.map((x, i) => one(x, row.cap ? { placeholder: row.ph[i] } : {}))
.join(row.dash ? cardBlock_({ type: 'group', tag: 'span', look: 'f-dash', attrs: { 'aria-hidden': 'true' }, text: '–' }) : '');
out.push(row.cap ? fieldCap_(row.cap, boxes, row.dash ? ' is-range' : '', row.fields.length)
: cardBlock_({ type: 'group', look: 'f-row', attrs: { 'data-n': row.fields.length }, inner: boxes }));
});
return out.join('');
}
const fieldCap_ = (cap, boxes, cls, n) => cardBlock_({ type: 'group', look: 'f-rowwrap', blocks: [{ type: 'group', tag: 'span', look: 'dob-cap', text: cap },
{ type: 'group', look: 'f-row' + (cls || ''), attrs: { 'data-n': n || 1 }, inner: boxes }] });
const isTimetable_ = list => (list || []).length > 12
&& (list || []).every(f => /^(m|tu|w|th|f|sa|su)\d\d$/.test(f));
const isLibraryCard_ = f => /^lib\d+_(name|no|pin)$/.test(String(f || ''));
const RETIRED_FIELDS_ = ['library_note'];
const isDobBox_ = f => /^dob_[dmy]$/.test(String(f || ''));
const isDob_ = list => (list || []).some(isDobBox_);
function dobReal_(value) {
const n = f => Number(String((typeof value === 'function' ? value(f) : (value || {})[f]) || '').replace(/\D/g, ''));
const d = n('dob_d'), m = n('dob_m'), y = n('dob_y');
if (!d || !m || y < 1900) return false;
const when = new Date(y, m - 1, d);
if (when.getMonth() !== m - 1 || when.getDate() !== d || when.getTime() > Date.now()) return false;
return !(d === 1 && m === 1 && y === 2000);
}
function dobBoxes_(value) {
const real = dobReal_(value);
const box = f => formOf_('dob', g => (real ? value(g) : ''), { only: [f] });
return cardBlock_({ type: 'group', look: 'dob-row', attrs: { role: 'group', 'aria-label': 'Date of birth' }, blocks: [
{ type: 'group', tag: 'span', look: 'dob-cap', text: text_('date-of-birth') },
{ type: 'group', look: 'dob-boxes', inner: box('dob_d') + box('dob_m') + box('dob_y') }] });
}
const isLibrary_ = list => (list || []).some(isLibraryCard_);
function shelfSlots_(nums, filled, draw, noun) {
let last = 0;
nums.forEach((n, i) => { if (filled(n)) last = i + 1; });
const show = Math.min(nums.length, Math.max(1, last));
return nums.map((n, i) => draw(n, i >= show)).join('') + (show < nums.length ? shelfAdd_(noun || 'another') : '');
}
const shelfAdd_ = (noun, act, o, row) => cardBlock_({ type: 'group', look: 'tile-row set-adds' + (row ? ' ' + row : ''), tiles: [Object.assign({ icon: 'plus', label: 'Add ' + (/^an? |^another$/.test(noun) ? noun : 'a ' + noun),
act: act || 'shelf-more', cls: act ? '' : 'shelf-more' }, o || {})] });
const shelfDrop_ = (noun, act) => tile_({ icon: 'bin', label: 'Remove ' + noun, act: act || 'shelf-drop', cls: 'set-drop' });
const setKind_ = () => (typeof ITEM_KINDS !== 'undefined' && ITEM_KINDS.kinds.setting) || {};
const setTyped_ = id => { const S = setKind_(), k = String(id || ''); return (S.typed || []).indexOf(k) >= 0 || (S.typedBy || []).some(m => new RegExp(m).test(k)); };
const setRowKind_ = h => (/<(input|select|textarea)\b/i.test(h) ? 'field' : /<(a|button)\b|\bdata-act=|\bclass="[^"]*\btile\b/i.test(h) ? 'item' : 'text');
function setCardRow_(part) {
const h = [].concat(part == null ? [] : part).map(b => (typeof b === 'string' ? b : cardBlock_(b))).join('');
if (!h.trim()) return '';
const k = setRowKind_(h);
if (typeof document === 'undefined') return h.replace(/^(\s*<[a-zA-Z][\w-]*)/, '$1 data-row="' + k + '"');
const t = document.createElement('template'); t.innerHTML = h;
[...t.content.childNodes].forEach(n => { if (n.nodeType === 3 && n.textContent.trim()) { const p = document.createElement('p'); p.className = 'kc-line'; n.replaceWith(p); p.appendChild(n); } });
[...t.content.children].forEach(e => e.setAttribute('data-row', k));
return t.innerHTML;
}
const setFormB_ = o => ({ type: 'group', look: 'me-form kc-fields', attrs: meAttrs_(o.formAttrs || ''), parts: [o.form, o.foot == null ? meSaidB_('') : o.foot] });
const setEmptyTiles_ = title => { const t = String(title || ''); return [].concat((typeof suggestOpts_ === 'function' && suggestOpts_('widget', 'empty:' + t.toLowerCase().replace(/[^a-z0-9]+/g, '-'), t)) || []); };
function setCard_(o) {
const data = Object.assign(cardDataOf_(o.attrs), o.data || {}), typed = setTyped_(o.card || data['lay-card']);
const parts = [].concat(o.lead || [], o.form == null ? [].concat(o.body == null ? [] : o.body) : [setFormB_(o)], o.after || []);
let inner = parts.map(setCardRow_).join('');
if (!inner.replace(/<[^>]*>/g, '').trim() && !/<(input|select|textarea|button|img|svg)\b/i.test(inner)) inner += setCardRow_({ type: 'text', look: 'kc-empty', text: text_('nothing-here-yet') });
const h = renderCard({ kind: 'setting', shape: setKind_().cardType || 'Card', card: o.card || '', look: [typed ? 'set-typed' : '', o.hook || '', o.state === 'empty' ? 'is-empty' : ''].filter(Boolean).join(' '),
name: o.title || '', tags: o.tags || (o.title ? [o.title] : []), data, picture: o.picture, tiles: o.actions || (o.state === 'empty' ? setEmptyTiles_(o.title) : []), off: o.state === 'off',
cut: o.save ? { tiles: o.save } : null,
body: [{ type: 'group', look: 'kc-set', inner }] });
return o.state === 'locked' && typeof lockCard_ === 'function' ? lockCard_(h) : h;
}
const cardDataOf_ = attrs => { const a = cardAttrsOf_(attrs || ''), d = {};
Object.keys(a).forEach(k => { if (/^data-/.test(k)) d[k.slice(5)] = a[k] === true ? '' : a[k]; }); return d; };
const shelfFilled_ = (value, names) => names.some(f => String(value(f) ?? '').trim() !== '');
on('shelf-more', el => {
const shelf = el.closest('.lib-shelf');
const next = shelf && shelf.querySelector('.lib-card[hidden]');
if (next) {
next.hidden = false;
const box = next.querySelector('input, select');
try { if (box) box.focus({ preventScroll: true }); } catch { }
}
if (!shelf || !shelf.querySelector('.lib-card[hidden]')) (el.closest('.set-adds') || el).remove();
});
on('shelf-drop', el => {
const line = el.closest('.lib-card'), shelf = el.closest('.lib-shelf');
if (!line || !shelf || !sure_(el, 'Remove?')) return;
line.querySelectorAll('input, select').forEach(i => { i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
line.hidden = true;
shelf.appendChild(line);
const add = shelf.querySelector('.shelf-more');
if (add) { const row = add.closest('.set-adds'); if (row) shelf.appendChild(row); }
else shelf.insertAdjacentHTML('beforeend', shelfAdd_(shelf.dataset.noun || 'another'));
});
const isQualField_ = f => /^qual_\d+(_level|_board|_grade|_received|_teach|_spec)?$/.test(String(f || ''));
const isQuals_ = list => (list || []).some(isQualField_);
const QUAL_KEYS = ['', '_level', '_grade', '_board', '_received', '_spec', '_teach'];
const QUAL_CERT_SUBJECTS_ = QUAL_SUBJECTS.slice(QUAL_SUBJECTS.indexOf('PGCE'));
const QUAL_CERT_LEVELS_ = QUAL_LEVELS.filter(l => ['Basic', 'Standard', 'Enhanced'].indexOf(l) >= 0);
function qualShelf_(list, value) {
const nums = [...new Set((list || []).filter(isQualField_)
.map(f => String(f).match(/^qual_(\d+)/)[1]))];
const v = (i, k) => String(value('qual_' + i + (k || '')) ?? '').trim();
const filled = i => ['', '_level', '_board', '_grade', '_received'].some(k => v(i, k) !== '');
const groups = [];
const byKey = {};
nums.filter(filled).forEach(i => {
const key = norm(v(i)) || ('#' + i);
if (!byKey[key]) { byKey[key] = { subject: v(i), slots: [] }; groups.push(byKey[key]); }
byKey[key].slots.push(i);
});
const pool = nums.filter(i => !filled(i));
const mine = groups.map(g => g.subject).filter(Boolean);
const wide = g => Math.min(18, Math.max(3, String(g.subject || '').length)) + 1;
const empty = !groups.length;
return cardBlock_({ type: 'group', look: 'q-shelf' + (empty ? ' is-empty' : ''), blocks: [
empty ? { type: 'group', tag: 'p', look: 'q-hint', text: 'Add what you studied and the certificates you hold — the subject, then the level.' } : null,
{ type: 'group', look: 'q-list', inner: groups.map(g => cardBlock_({ type: 'group', look: 'q-subj', attrs: { 'data-qw': wide(g) },
inner: g.slots.map((i, n) => qualSlot_(i, value, { first: n === 0, mine })).join('') })).join('') },
{ type: 'group', look: 'q-pool', attrs: { hidden: true }, inner: pool.map(i => qualSlot_(i, value, { mine })).join('') }],
inner: shelfAdd_('qualification', 'qual-add', { off: !pool.length, data: { unlocked: '' },
note: pool.length ? pool.length + ' more fit' : '10 is the most' }, 'q-adds') });
}
function qualSlot_(i, value, o) {
o = o || {};
const f = k => 'qual_' + i + k;
const val = k => String(value(f(k)) ?? '').trim();
const q = { subject: val(''), level: val('_level'), grade: val('_grade'), board: val('_board'),
received: val('_received'), spec: TRUEish_(val('_spec')) };
q.teach = q.spec || TRUEish_(val('_teach'));
q.first = !!o.first;
const tv = qualTeachKey_(q);
const cyc = { type: 'field', cap: 'Teaching', look: 'q-f q-cyc', blocks: [{ type: 'control', tag: 'select', attrs: { class: 'q-teach', 'data-unlocked': true, 'aria-label': 'Teaching' },
options: QUAL_TEACH_OPTS_.map(([k, say]) => ({ value: k, text: say, on: k === tv })) }] };
const said = qualSay_(q);
const hide = (k, on) => ({ type: 'control', attrs: { type: 'hidden', 'data-me': f(k), value: on ? 'TRUE' : 'FALSE' } });
return cardBlock_({ type: 'group', look: 'q-slot' + (qualIsCert_(q) ? ' is-cert' : ''), attrs: { 'data-slot': i, 'data-first': q.first ? '1' : null }, blocks: [
hide('_spec', q.spec), hide('_teach', q.teach)], inner:
tile_({ form: true, look: 'q-line', act: 'qual-open', data: { at: i }, attrs: 'data-unlocked aria-expanded="false"', aria: said, title: said, html: qualFace_(q) })
+ tile_({ form: true, look: 'q-mark-b', act: 'qual-teach', data: { face: 1, at: i }, attrs: 'data-unlocked', aria: 'Teaching: ' + qualTeachWord_(q) + ', tap to change', html: qualTeachVal_(q) })
+ cardBlock_({ type: 'group', look: 'q-ed', blocks: [
{ type: 'group', look: 'q-row', blocks: [
qualPick_({ 'data-me': f(''), class: 'q-name' }, q.subject, QUAL_SUBJECTS, 'Subject', 'Choose', o.mine),
qualPick_({ 'data-me': f('_level') }, qualLevel_(q.level), QUAL_LEVELS, 'Level', 'Choose')] },
{ type: 'group', look: 'q-row', blocks: [
qualPick_({ 'data-me': f('_grade') }, q.grade, QUAL_GRADES, 'Grade', text_('none-yet'), null, 'q-f q-grade'),
{ type: 'field', look: 'q-f', caps: ['Finished', 'Year'], blocks: [{ type: 'control', tag: 'select', attrs: { 'data-me': f('_received') },
options: qualYears_(q.received).map(y => ({ value: y, text: y === 'Present' ? 'Still studying' : y, on: y === q.received }))
.concat([{ value: '', text: 'Not sure', on: !q.received }]) }] },
{ type: 'field', look: 'q-f q-school', caps: ['School, college or uni', 'Issued by'], blocks: [{ type: 'control',
attrs: { type: 'text', 'data-me': f('_board'), value: q.board, autocomplete: 'off' } }] }] },
cyc,
{ type: 'group', look: 'tile-row q-tiles', tiles: [{ icon: 'save', label: 'Done', act: 'qual-done', data: { unlocked: '', at: i } },
{ icon: 'bin', label: 'Remove', note: [q.subject, q.level].filter(Boolean).join(' ') || 'this one', act: 'qual-drop',
data: { unlocked: '', at: i } }] }] }) });
}
function qualFace_(q) {
const who = q.first || q.fresh ? (q.subject || (q.fresh ? 'New qualification' : '')) : '';
const cert = qualIsCert_(q);
return cardRuns_([{ span: 'q-who' + (q.subject ? '' : ' is-none'), text: who }, { span: 'q-note', text: qualIso_(q) },
{ span: 'q-mark', text: cert ? '' : q.spec ? { span: 'prof-tag is-sm', text: 'Teach' } : q.teach ? { span: 'q-can', text: 'Can teach' } : '' }]);
}
const qualTeachKey_ = q => q.spec ? 'spec' : q.teach ? 'teach' : 'no';
const QUAL_TEACH_OPTS_ = [['teach', 'Can teach'], ['spec', 'Teaches'], ['no', 'Not teaching']];
function qualTeachWord_(q) { return q.spec ? 'Teaches' : q.teach ? 'Can teach' : 'Not teaching'; }
function qualTeachVal_(q) {
return cardRuns_({ span: 'q-cyc-v is-' + qualTeachKey_(q), text: qualTeachWord_(q) });
}
function qualIsCert_(q) {
const isIn = (list, x) => !!x && list.some(y => norm(y) === norm(x));
return isIn(QUAL_CERT_SUBJECTS_, q.subject) || isIn(QUAL_CERT_LEVELS_, q.level);
}
function qualIso_(q) {
const level = norm(q.level) === norm(q.subject) ? '' : (q.level || '');
const low = q.grade ? q.grade : /^present$/i.test(q.received || '') ? { i: 'studying' } : '';
if (qualIsCert_(q) || !(level || low)) return { span: 'q-plain', text: [level, q.grade].filter(Boolean).join(' ') };
return { span: 'prof-iso', text: [level ? { sup: level } : '', low ? { sub: low } : ''] };
}
function qualSay_(q) {
const base = typeof profQualSay_ === 'function' ? profQualSay_(q)
: [q.subject, q.level, q.grade && 'grade ' + q.grade, q.board && 'at ' + q.board, q.received].filter(Boolean).join(', ');
return (base || 'New qualification') + (q.spec ? ', teach' : q.teach ? ', can teach' : '');
}
const QUAL_OTHER = '__other';
function qualPick_(attrs, v, list, cap, none, mine, look) {
v = String(v ?? '');
const has = x => !!v && norm(x) === norm(v);
const yours = [...new Set((mine || []).filter(Boolean))];
const opts = (v && !list.some(has) && !yours.some(has) ? [v] : []).concat(list);
let chosen = false;
const opt = x => {
const on = !chosen && has(x);
if (on) chosen = true;
return { value: x, on };
};
const body = yours.length
? [{ group: 'Your subjects', options: yours.map(opt) }, { group: 'Every subject', options: opts.map(opt) }]
: opts.map(opt);
return { type: 'field', cap, look: look || 'q-f', blocks: [{ type: 'control', tag: 'select', attrs,
options: [{ value: '', text: none }].concat(body, [{ value: QUAL_OTHER, text: 'Something else…' }]) }] };
}
document.addEventListener('change', e => {
const sel = e.target;
if (!sel || sel.tagName !== 'SELECT' || sel.value !== QUAL_OTHER || !sel.closest('.q-shelf')) return;
const box = document.createElement('input');
box.type = 'text'; box.autocomplete = 'off'; box.placeholder = 'Type it here';
[...sel.attributes].forEach(a => box.setAttribute(a.name, a.value));
sel.replaceWith(box);
qualDirty_(box);
try { box.focus({ preventScroll: true }); } catch { }
}, true);
function qualRead_(slot) {
const i = slot.dataset.slot;
const get = k => {
const b = slot.querySelector('[data-me="qual_' + i + k + '"]');
const x = String(b ? b.value : '').trim();
return x === QUAL_OTHER ? '' : x;
};
const q = { subject: get(''), level: get('_level'), grade: get('_grade'), board: get('_board'),
received: get('_received'), spec: TRUEish_(get('_spec')) };
q.teach = q.spec || TRUEish_(get('_teach'));
q.first = !!slot.dataset.first;
q.fresh = !!slot.dataset.new;
return q;
}
function qualFaceNow_(slot) {
const line = slot && slot.querySelector(':scope > .q-line');
if (!line) return;
const q = qualRead_(slot);
slot.classList.toggle('is-cert', qualIsCert_(q));
line.innerHTML = qualFace_(q);
const said = qualSay_(q);
line.setAttribute('aria-label', said);
line.setAttribute('title', said);
const lab = 'Teaching: ' + qualTeachWord_(q) + ', tap to change';
slot.querySelectorAll('[data-do="qual-teach"]').forEach(b => {
b.setAttribute('aria-label', lab);
const v = b.querySelector('.q-cyc-v');
if (v) v.outerHTML = qualTeachVal_(q);
});
}
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
const t = e.target;
const slot = t && t.closest && t.closest('.q-shelf .q-slot');
if (slot) qualFaceNow_(slot);
}));
function qualNext_(sel) {
setTimeout(() => {
if (sel && sel.isConnected && !sel.disabled) { try { sel.focus({ preventScroll: true }); } catch (e) { } }
}, 0);
}
document.addEventListener('change', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('[data-me]') || t.value === QUAL_OTHER) return;
const slot = t.closest('.q-shelf .q-slot.is-open');
if (!slot) return;
const q = qualRead_(slot);
if (slot.dataset.new && q.subject && !q.level && t.matches('.q-name')) {
qualNext_(slot.querySelector('select[data-me$="_level"]'));
return;
}
qualCommit_(slot);
});
const qualDirty_ = el => { const f = el && el.closest('.me-form'); if (f) f.dataset.dirty = '1'; };
const qualClean_ = el => { const f = el && el.closest('.me-form'); if (f && !f.closest('.card-ed')) delete f.dataset.dirty; };
function qualValues_(slot) {
const out = {};
const i = slot.dataset.slot;
QUAL_KEYS.forEach(k => { const b = slot.querySelector('[data-me="qual_' + i + k + '"]'); out['qual_' + i + k] = b ? b.value : ''; });
return out;
}
const qualBlank_ = slot => {
const out = {};
QUAL_KEYS.forEach(k => { out['qual_' + slot.dataset.slot + k] = /_spec$|_teach$/.test(k) ? 'FALSE' : ''; });
return out;
};
function qualSet_(slot, vals) {
Object.keys(vals).forEach(f => { const b = slot.querySelector('[data-me="' + f + '"]'); if (b) b.value = vals[f]; });
}
function qualRedraw_(shelf, over, open) {
if (!shelf || !shelf.isConnected) return null;
const had = shelf.contains(document.activeElement);
const vals = {}, list = [];
shelf.querySelectorAll('[data-me]').forEach(b => { list.push(b.dataset.me); vals[b.dataset.me] = b.value; });
Object.assign(vals, over || {});
const hold = document.createElement('div');
hold.innerHTML = qualShelf_(list, f => vals[f] ?? '');
const next = hold.firstElementChild;
shelf.replaceWith(next);
const again = open != null && next.querySelector('.q-list .q-slot[data-slot="' + open + '"]');
if (again) {
qualOpen_(again);
if (had) { try { again.querySelector('.q-line').focus({ preventScroll: true }); } catch (e) { } }
} else if (typeof placeCells === 'function') { try { placeCells('y', true, 0, qualColumn_(next)); } catch (e) { oops_(e, 'me:qualRedraw_') } }
const ed = next.closest('.card-ed .me-form');
if (ed && typeof cardKeep_ === 'function') cardKeep_(ed);
return next;
}
const qualColumn_ = el => colOfEl_(el) || 'staff';
function qualOver_(shelf) {
const over = {};
shelf.querySelectorAll('.q-slot.is-open').forEach(s => {
if (s.dataset.new) return Object.assign(over, qualBlank_(s));
try { Object.assign(over, JSON.parse(s.dataset.was || '{}')); } catch (e) { }
});
return over;
}
function qualOpen_(slot) {
const shelf = slot && slot.closest('.q-shelf');
if (!shelf) return;
slot.classList.add('is-open');
const line = slot.querySelector(':scope > .q-line');
if (line) line.setAttribute('aria-expanded', 'true');
if (!slot.dataset.was) slot.dataset.was = JSON.stringify(slot.dataset.new ? qualBlank_(slot) : qualValues_(slot));
qualDirty_(slot);
if (typeof placeCells === 'function') { try { placeCells('y', true, 0, qualColumn_(slot)); } catch (e) { oops_(e, 'me:qualOpen_') } }
}
on('qual-open', el => {
if (qualWhenSaved_(el)) return;
const slot = el.closest('.q-slot'), shelf = el.closest('.q-shelf');
if (!slot || !shelf) return;
if (slot.classList.contains('is-open')) return qualDone_(slot);
qualReopen_(shelf, slot);
});
function qualReopen_(shelf, slot) {
const i = slot.dataset.slot, pooled = !!slot.closest('.q-pool');
const next = qualRedraw_(shelf, qualOver_(shelf), pooled ? null : i);
const again = next && next.querySelector('.q-slot[data-slot="' + i + '"]');
if (again && pooled) qualStart_(next, again);
return again;
}
on('qual-done', el => { if (qualWhenSaved_(el)) return; const slot = el.closest('.q-slot'); if (slot) qualDone_(slot); });
function qualDone_(slot) {
const shelf = slot.closest('.q-shelf');
if (!shelf) return;
const q = qualRead_(slot);
if (slot.dataset.new && !(q.subject && q.level)) {
qualClean_(shelf);
qualRedraw_(shelf, qualBlank_(slot));
if (q.subject || q.level) toast(text_('nothing-was-added-a-qualification-needs'));
return;
}
qualCommit_(slot, () => { qualClean_(shelf); qualRedraw_(shelf); });
}
let QUAL_SAVING = null, QUAL_NEXT = null;
function qualSave_(el) {
const ed = el && el.closest && el.closest('.card-ed .me-form');
if (ed && typeof cardKeep_ === 'function') { ed.dataset.dirty = '1'; cardKeep_(ed); return Promise.resolve(true); }
const p = meSave_(el);
QUAL_SAVING = p;
const clear = () => { if (QUAL_SAVING === p) QUAL_SAVING = null; };
p.then(clear, clear);
return p;
}
function qualWhenSaved_(el) {
if (!QUAL_SAVING || !el) return false;
const act = el.dataset.do, v = el.dataset.v || '';
const slot = el.closest('.q-slot'), i = slot ? slot.dataset.slot : '';
const form = el.closest('.me-form');
const mine = QUAL_NEXT = {};
QUAL_SAVING.then(ok => {
if (QUAL_NEXT !== mine) return;
QUAL_NEXT = null;
if (!ok) return;
const shelf = (form && form.isConnected && form.querySelector('.q-shelf')) || document.querySelector('#s-stuff .q-shelf');
if (!shelf) return;
const again = act === 'qual-add' ? shelf.querySelector('[data-do="qual-add"]')
: shelf.querySelector('.q-slot[data-slot="' + i + '"] [data-do="' + act + '"]' + (v ? '[data-v="' + v + '"]' : ''));
if (again && !again.disabled && ACTIONS[act]) ACTIONS[act](again);
}, () => {});
return true;
}
function qualCommit_(slot, after) {
const shelf = slot.closest('.q-shelf');
if (!shelf) return;
const i = slot.dataset.slot;
const q = qualRead_(slot);
if (!q.subject || !q.level) {
if (!slot.dataset.new) toast(q.subject ? 'Choose a level — nothing was saved.' : 'Choose a subject — nothing was saved.');
return;
}
if (qualIsCert_(q)) {
qualSet_(slot, { ['qual_' + i + '_grade']: '', ['qual_' + i + '_spec']: 'FALSE', ['qual_' + i + '_teach']: 'FALSE' });
qualFaceNow_(slot);
}
if (JSON.stringify(qualValues_(slot)) === slot.dataset.was) { if (after) after(); return; }
let was = {};
try { was = JSON.parse(slot.dataset.was || '{}'); } catch (e) { }
const moved = !!slot.dataset.new || norm(was['qual_' + i] || '') !== norm(q.subject);
qualSave_(slot.querySelector('[data-do="qual-done"]') || slot).then(ok => {
if (!ok || !slot.isConnected) return;
slot.dataset.was = JSON.stringify(qualValues_(slot));
delete slot.dataset.new;
if (after) return after();
qualDirty_(slot);
if (moved) qualRedraw_(shelf, null, i);
});
}
const QUAL_CYCLE_ = { no: 'teach', teach: 'spec', spec: 'no' };
on('qual-teach', el => {
if (qualWhenSaved_(el)) return;
let slot = el.closest('.q-slot');
const shelf = el.closest('.q-shelf'), face = !!el.dataset.face;
if (!slot || !shelf) return;
if (!face && !slot.classList.contains('is-open')) {
slot = qualReopen_(shelf, slot);
if (!slot) return;
}
const q = qualRead_(slot);
if (qualIsCert_(q)) return;
qualTeachTo_(slot, el, face, QUAL_CYCLE_[qualTeachKey_(q)]);
});
;
/* js/me-settings.js */
document.addEventListener('change', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('.q-shelf select.q-teach')) return;
let slot = t.closest('.q-slot');
const shelf = t.closest('.q-shelf'), v = t.value;
if (slot && !slot.classList.contains('is-open')) slot = qualReopen_(shelf, slot);
if (!slot || qualIsCert_(qualRead_(slot))) return;
qualTeachTo_(slot, t, false, v);
});
function qualTeachTo_(slot, el, face, v) {
const i = slot.dataset.slot;
qualSet_(slot, { ['qual_' + i + '_spec']: v === 'spec' ? 'TRUE' : 'FALSE',
['qual_' + i + '_teach']: v === 'no' ? 'FALSE' : 'TRUE' });
qualFaceNow_(slot);
slot.querySelectorAll('select.q-teach').forEach(sel => { sel.value = v; });
if (face && !slot.classList.contains('is-open')) { qualSave_(slot).then(ok => { if (ok && slot.isConnected) slot.dataset.was = JSON.stringify(qualValues_(slot)); }); return; }
qualDirty_(el);
qualCommit_(slot);
}
function qualTake_(shelf) {
const slot = shelf && shelf.querySelector('.q-pool > .q-slot');
if (!slot) toast(text_('that-is-the-most-this-card'));
return slot || null;
}
on('qual-add', el => {
if (qualWhenSaved_(el)) return;
const shelf = el.closest('.q-shelf');
if (!shelf) return;
const next = qualRedraw_(shelf, qualOver_(shelf));
const slot = qualTake_(next);
if (slot) qualStart_(next, slot);
});
function qualStart_(next, slot) {
qualSet_(slot, qualBlank_(slot));
slot.dataset.new = '1';
const group = document.createElement('div');
group.className = 'q-subj is-new';
group.appendChild(slot);
next.querySelector('.q-list').appendChild(group);
qualFaceNow_(slot);
qualOpen_(slot);
try { slot.scrollIntoView({ block: 'nearest' }); } catch (e) { }
qualNext_(slot.querySelector('select.q-name'));
}
function qualRemove_(el, slots, said) {
const shelf = el.closest('.q-shelf');
if (!shelf || !slots.length) return;
const was = slots.map(qualValues_);
slots.forEach(s => qualSet_(s, qualBlank_(s)));
qualSave_(el).then(ok => {
if (ok) { if (!el.closest('.card-ed')) toast(said); qualRedraw_(shelf); }
else slots.forEach((s, n) => qualSet_(s, was[n]));
});
}
on('qual-drop', el => {
if (qualWhenSaved_(el)) return;
const slot = el.closest('.q-slot'), shelf = el.closest('.q-shelf');
if (!slot || !shelf || !sure_(el, 'Remove?')) return;
if (slot.dataset.new) { qualClean_(shelf); qualRedraw_(shelf, qualBlank_(slot)); return; }
const q = qualRead_(slot);
let was = {};
try { was = JSON.parse(slot.dataset.was || '{}'); } catch (e) { }
const i = slot.dataset.slot;
const name = [was['qual_' + i] || q.subject, was['qual_' + i + '_level'] || q.level].filter(Boolean).join(' ');
qualRemove_(el, [slot], 'Removed ' + (name || 'that qualification') + '.');
});
function phoneField_(value) {
const cc = String(value('phone_cc') || '') || phoneCodes_()[0];
const phoneNo = String(value('phone_no') || (value('phone_cc') ? '' : value('phone')) || '');
const codes = phoneCodes_().slice();
if (codes.indexOf(cc) === -1) codes.unshift(cc);
return fieldCap_('phone', formPhone_('phone_cc', 'phone_no', kcfOpts_(codes.map(x => ({ value: x, on: x === cc }))),
`placeholder="Number" value="${esc(draftVal_('set', 'phone_no', phoneNo))}"${draftAttr_('set', 'phone_no', phoneNo)}`), ' is-phone', 2);
}
function qualYears_(current) {
const now = new Date().getFullYear(), out = ['Present'];
for (let y = now; y >= now - 60; y--) out.push(String(y));
if (current && out.indexOf(String(current)) === -1) out.splice(1, 0, String(current));
return out;
}
function libraryShelf_(list, value) {
const all = [...new Set((list || []).filter(isLibraryCard_)
.map(f => String(f).match(/^lib(\d+)_/)[1]))];
const has = i => shelfFilled_(value, ['lib' + i + '_name', 'lib' + i + '_no', 'lib' + i + '_pin']);
const nums = !(typeof ruleOn_ !== 'function' || ruleOn_('library-one-card')) ? all : all.length ? [all.find(has) || all[0]] : [];
const slot = (i, hide) => cardBlock_({ type: 'group', look: 'lib-card', attrs: { hidden: !!hide }, blocks: [
{ type: 'group', look: 'lib-face', attrs: { role: 'group', 'aria-label': 'Library card ' + i }, inner:
cardBlock_({ type: 'group', tag: 'span', look: 'lib-cap', attrs: { 'aria-hidden': 'true' }, text: 'Library card' })
+ formOf_('library-card', value, { vars: { n: i }, skip: ['lib{n}_no'] }) + cardBlock_(libBarsSpec_(value('lib' + i + '_no')))
+ formOf_('library-card', value, { vars: { n: i }, only: ['lib{n}_no'] }) }] });
return cardBlock_({ type: 'group', look: 'lib-shelf', attrs: { 'data-noun': 'library card' }, inner: shelfSlots_(nums, has, slot, 'library card') });
}
function libBarsOf_(no) {
const s = String(no ?? '').trim();
const w = [];
if (!s) { for (let i = 0; i < 24; i++) w.push(2, 2); w.pop(); return w; }
let h = hashOf(s) || 0x9e3779b9;
const next = n => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return 1 + (h % n); };
w.push(1, 1, 1, 2);
let at = 5;
while (at < 84) { const bar = next(4), gap = next(3); w.push(bar, gap); at += bar + gap; }
w.push(1, 1, 1);
return w;
}
function libBarsSpec_(no) {
const w = libBarsOf_(no);
let x = 0, d = '';
w.forEach((n, i) => { if (i % 2 === 0) d += 'M' + x + ' 0h' + n + 'v1h-' + n + 'z'; x += n; });
const blank = !String(no ?? '').trim();
return { type: 'drawing', node: { el: 'svg', a: { class: 'lib-bars' + (blank ? ' is-blank' : ''), viewBox: '0 0 ' + x + ' 1', preserveAspectRatio: 'none',
'shape-rendering': 'crispEdges', 'aria-hidden': 'true', focusable: 'false' }, kids: [{ el: 'path', a: { fill: 'currentColor', d } }] } };
}
const libBars_ = no => cardBlock_(libBarsSpec_(no));
document.addEventListener('input', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('.lib-no input')) return;
const bars = t.closest('.lib-face') && t.closest('.lib-face').querySelector('.lib-bars');
if (bars) bars.outerHTML = libBars_(t.value);
});
function libFit_(pane) {
try {
const first = pane.querySelector('.lib-face');
const shelf = first && first.closest('.lib-shelf');
if (!shelf) return;
shelf.style.removeProperty('--lib-w');
const faces = [...shelf.querySelectorAll('.lib-card:not([hidden]) > .lib-face')];
if (!faces.length || !(pane.clientHeight > 0)) return;
for (let pass = 0; pass < 3; pass++) {
const over = pane.scrollHeight - pane.clientHeight;
if (!(over > 2)) return;
const h = faces[0].getBoundingClientRect().height;
const band = parseFloat(String(getComputedStyle(faces[0]).gridTemplateRows).split(/\s+/)[2]) || 0;
const give = Math.min(band, over / faces.length + 0.5);
if (!(h > 0) || !(give > 0.5)) return;
shelf.style.setProperty('--lib-w', ((h - give) * 85.6 / 54).toFixed(2) + 'px');
}
} catch (e) { }
}
function libCardsDraw_(into) {
if (!into) return;
const held = into.querySelector('.me-form[data-dirty], .me-form.is-sending');
if (held) return;
const note = text => cardBlock_({ type: 'group', tag: 'p', look: 'note', text });
if (!whose_()) { into.innerHTML = note('Sign in and your library cards are kept here.'); return; }
const list = libFieldsOf_(myGroups_());
if (!list.length && typeof awaiting_ === 'function' && awaiting_()) { into.innerHTML = loading_(); return; }
if (!list.length) {
into.innerHTML = note(OLD_SERVER_SAY_);
return;
}
const p = whose_().profile || {};
into.innerHTML = cardBlock_({ type: 'group', look: 'me-form', inner: libraryShelf_(list, f => p[f] ?? '') + cardBlock_(meSaidB_('')) });
}
function initLibCards_() { libCardsDraw_($('lib-box')); }
function libCardsRedraw_() {
document.querySelectorAll('[id="lib-box"]').forEach(into => {
if (!into.contains(document.activeElement)) libCardsDraw_(into);
});
}
const AUTOSAVE_MS = 800;
const AUTOSAVE_T = new WeakMap();
const AUTOSAVE_FORMS_ = '.set-typed .me-form, #lib-box .me-form';
function autosaveLater_(form) {
clearTimeout(AUTOSAVE_T.get(form));
AUTOSAVE_T.set(form, setTimeout(() => autosaveNow_(form), AUTOSAVE_MS));
}
function autosaveHear_(e) {
const box = e.target;
if (!box || !box.closest || !box.matches('input, select, textarea') || isFileBox_(box) || box.classList.contains('ask-box')) return;
const form = box.closest(AUTOSAVE_FORMS_);
if (!form || !USER) return;
form.dataset.dirty = '1';
autosaveLater_(form);
}
function autosaveNow_(form) {
if (!form.isConnected) return;
if (form.classList.contains('is-sending')) { autosaveLater_(form); return; }
try { if (form.closest('.card-ed')) cardSave_(form, true); else meSave_(form, true); } catch (x) { oops_(x, 'me:autosaveNow_'); }
}
function autosaveTick_(form, word) {
const said = form.querySelector('.me-said');
if (said) tell_(said, 'saved', '\u2713 ' + (word || text_('saved')));
form.classList.add('is-saved');
if (!form.contains(document.activeElement)) delete form.dataset.dirty;
}
function autosaveFailed_(err) {
toast(typeof why_ === 'function' ? why_(err) : text_('not-saved-try-again'));
}
document.addEventListener('input', autosaveHear_, true);
document.addEventListener('change', autosaveHear_, true);
function profileSave_(form, o) {
o = o || {};
return new Promise(resolve => {
[form, o.el].forEach(x => { const f0 = x && x.closest && x.closest('.me-form'); if (f0) clearTimeout(AUTOSAVE_T.get(f0)); });
if (!USER) { toast(text_('err-sign-in-first')); return resolve(null); }
const said = Object.prototype.hasOwnProperty.call(o, 'said') ? o.said : (form && form.querySelector('.me-said'));
const say = (cls, msg) => { if (!o.auto) toast(msg); if (said) tell_(said, cls, msg); };
let fields = o.fields, seatNo = '';
if (!fields) {
const busy = form === document.body ? '' : form.querySelector('.pfp.is-sending') ? 'Your picture is still saving'
: form.querySelector('.is-sending') || form.classList.contains('is-sending') ? 'Part of your card is still saving' : '';
if (busy) { if (o.auto) autosaveLater_(form); else say('info', busy + ' — Save once it has.'); return resolve(null); }
if (qualNameless_(form)) { say('info', QUAL_NAMELESS_SAY_); return resolve(null); }
if (cardQualHole_(form, o.base || (whose_() || {}).profile || {})) { say('info', CARD_LEVELLESS_SAY_); return resolve(null); }
const now = cardFormVals_(form, !o.base);
fields = o.base ? cardChanged_(o.base, now) : now;
seatNo = cardSeatRefusal_(form, fields);
if (seatNo && !Object.keys(fields).length) { say('error', seatNo + ' Nothing was saved.'); return resolve(null); }
if (o.base && !Object.keys(fields).length) return resolve({ nothing: true });
}
const W = whose_();
const go = () => {
send_({ action: 'item', door: 'save', item: 'profile', name: USER.name, personId: USER.personId || '',
target: o.target.name, targetId: o.target.id, fields },
o.how || (o.auto ? { where: said } : Object.assign({ button: o.el || form, busy: 'Saving…', where: said }, o.lock ? { lock: o.lock } : {})))
.then(d => {
if (o.own) { W.profile = (d && d.profile) ? d.profile : Object.assign({}, W.profile || {}, fields); if (d && d.name) W.name = d.name; }
const word = ((d && d.said) || text_('saved')) + (seatNo ? (d && d.refused ? ' ' : ' — the rest. Not saved: ') + seatNo : '');
const r = { d, fields, word, seatNo };
if (o.done) o.done(r);
if (o.own && W === USER) saveUser_();
if (o.toast !== false) toast(word);
const tick = Object.prototype.hasOwnProperty.call(o, 'tick') ? o.tick : form;
if (o.auto && tick) autosaveTick_(tick, word);
if (o.after) o.after(r);
resolve(r);
})
.catch(err => { if (o.auto) autosaveFailed_(err); if (o.failed) o.failed(err); resolve(null); });
};
if (o.gate) o.gate(fields, go, () => resolve(null), said); else go();
});
}
function fieldReadonly_(f) {
return (((typeof DATA !== 'undefined' && DATA && DATA.profileReadonly) || []).indexOf(f) !== -1) || (f === 'extra_seat_cut' && !may_('admin'));
}
function meSave_(el, auto) {
const box = el.closest('.me-form') || el.closest('#sheet-body') || el.closest('.widget-slot') || document.body;
const form = el.closest('.me-form');
const quiet = !!box.querySelector('.q-shelf');
const W = whose_() || {};
return profileSave_(box, { el, auto, own: true, target: { name: W.name, id: W.personId || '' }, tick: !quiet && form,
gate: (fields, go, stop, said) => {
if (profileShapeOk_()) return go();
const packed = Object.keys(fields).some(k => PACKED_FIELD_.test(k));
const blocked = () => { if (said) said.textContent = OLD_SERVER_SAY_
+ ' Until then this card is not sent, because its boxes may be empty and saving would wipe what the sheet holds.'; };
if (PROFILE_SERVER_OLD) { if (packed) { blocked(); return stop(); } return go(); }
if (said) tell_(said, 'error', 'Your saved details are still loading from the sheet, so nothing was sent. Try again in a moment.');
profileRefresh_(true, () => (packed ? blocked() : go()));
stop();
},
done: ({ d, fields, word }) => {
const W = whose_();
Object.keys(fields).forEach(f => { try { draftDrop_('set', f); } catch (e) { oops_(e, 'me:meSave_') } });
if (d && d.pendingEmail !== undefined) { accountChanged_(); W.pendingEmail = String(d.pendingEmail || ''); }
if (box.closest('#sheet-body') && !auto) closeStep_();
if (form && !(auto && form.contains(document.activeElement))) delete form.dataset.dirty;
const said = box.querySelector('.me-said');
if (said) tell_(said, 'info', quiet ? '' : word);
},
after: ({ d, word }) => {
const col = colOfEl_(form) || 'account';
const at = [...document.querySelectorAll('#s-' + col + ' .me-form')].indexOf(form);
const lineAt = () => at < 0 ? null
: (document.querySelectorAll('#s-' + col + ' .me-form')[at] || {}).querySelector?.('.me-said');
if (d && d.said && !(auto && form && form.dataset.dirty)) {
try { paint(col); placeCells('y', true, 0, col); } catch (e) { oops_(e, 'me:meSave_') }
const el2 = lineAt(); if (el2) el2.textContent = word;
}
if (!d || d.changed === undefined || d.changed > 0) sayAfterLoad_(lineAt, quiet ? '' : word);
} }).then(r => !!r);
}
const QUAL_NAMELESS_SAY_ = 'Choose a subject for each qualification first — nothing was saved.';
function qualNameless_(box) {
return [...box.querySelectorAll('.q-shelf .q-slot')].some(slot => {
const n = slot.querySelector('[data-me="qual_' + slot.dataset.slot + '"]');
return !(n && String(n.value || '').trim())
&& [...slot.querySelectorAll('[data-me]')].some(b => !isHiddenBox_(b) && String(b.value || '').trim());
});
}
function sayAfterLoad_(find, text) {
Promise.resolve(load()).then(() => setTimeout(() => {
const el = find(); if (el) el.textContent = text;
}, 0), () => {});
}
const PACKED_FIELD_ = /^(phone_(cc|no)|dob_[dmy]|qual_\d+(_|$)|lib\d+_|photos_\d+|(m|tu|w|th|f|sa|su)\d{1,2})$|^(qual_\d+_\w+|lib\d+_\w+)$/;
let PROFILE_SERVER_OLD = false;
const OLD_SERVER_SAY_ = 'The server in Apps Script is older than this site. Update the backend (pull from GitHub, then Deploy \u2192 Manage deployments \u2192 New version).';
const KEEP_FORMS_ = '#s-stuff .me-form, #s-saved .widget-slot .me-form';
document.addEventListener('input', e => {
const f = e.target && e.target.closest && e.target.closest(KEEP_FORMS_);
if (f) f.dataset.dirty = '1';
});
document.addEventListener('change', e => {
const f = e.target && e.target.closest && e.target.closest(KEEP_FORMS_);
if (f) f.dataset.dirty = '1';
});
function settingsKeep_(id) {
if (['tutors', 'students', 'parents'].indexOf(id) !== -1 && USER) {
const acc = $('s-' + id);
return !!(acc && acc.querySelector('.card-ed .me-form[data-dirty], .is-sending .card-ed, .me-form[data-dirty], .me-form.is-sending'));
}
if (['saved', 'stuff'].indexOf(id) !== -1 && USER) {
const col = $('s-' + id);
return !!(col && col.querySelector(id === 'stuff' ? '.me-form[data-dirty], .me-form.is-sending, .is-sending .card-ed' : '.widget-slot .me-form[data-dirty], .widget-slot .me-form.is-sending'));
}
return false;
}
let PROFILE_ASKING = false;
function profileShapeOk_() {
const p = whose_() && whose_().profile;
return !!p && Object.prototype.hasOwnProperty.call(p, 'phone_cc');
}
function profileRefresh_(loud, onOld) {
if (!USER || !USER.token || PROFILE_ASKING) return;
PROFILE_ASKING = true;
const askedAt = Date.now();
return api({ action: 'item', door: 'get', kind: 'profile', name: USER.name, personId: USER.personId || '' })
.then(d => {
PROFILE_ASKING = false;
if (askedAt < ACCOUNT_AT_) { if (d && d.success) profileRefresh_(loud, onOld); return; }
if (d && d.error && /unknown action|not recognis/i.test(String(d.error))) {
PROFILE_SERVER_OLD = true;
if (typeof onOld === 'function') return onOld();
if (loud) toast(OLD_SERVER_SAY_);
return;
}
if (!d || !d.success || !d.profile || !USER) {
if (loud && d && d.error) toast(d.error);
return;
}
if (USER.personId && String(d.personId) !== String(USER.personId)) return;
if (!USER.personId) USER.personId = d.personId;
USER.profile = d.profile;
if (d.agreementSignedAt !== undefined) {
USER.agreementSignedAt = d.agreementSignedAt; USER.agreementVersion = d.agreementVersion;
}
const roleWas = JSON.stringify([!!USER.owner, USER.rank, USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || ''),
String(USER.name || ''), USER.children, USER.kids, String(USER.handle || '')]);
if (d.role) USER.role = d.role;
if (Array.isArray(d.roles) && d.roles.length) USER.roles = d.roles;
if (d.tutorPending !== undefined) USER.tutorPending = !!d.tutorPending;
if (d.owner !== undefined) USER.owner = !!d.owner;
if (d.rank) USER.rank = String(d.rank);
if (d.application !== undefined) USER.application = d.application;
if (d.pendingEmail !== undefined) USER.pendingEmail = String(d.pendingEmail || '');
if (d.name) USER.name = String(d.name);
['children', 'kids', 'parents', 'siblings'].forEach(k => { if (Array.isArray(d[k])) USER[k] = d[k]; });
if (d.handle && USER.handle && String(d.handle) !== String(USER.handle)) {
HANDLE_SAID = { pid: String(USER.personId || ''), text: 'You were @' + USER.handle + '.' };
try { toast('Your handle is @' + d.handle + ' now'); } catch (e) { oops_(e, 'me:profileRefresh_') }
}
if (d.handle) USER.handle = String(d.handle);
const roleMoved = JSON.stringify([!!USER.owner, USER.rank, USER.role, USER.roles, !!USER.tutorPending, String(USER.pendingEmail || ''),
String(USER.name || ''), USER.children, USER.kids, String(USER.handle || '')]) !== roleWas;
saveUser_();
const land = typeof landRepaint_ === 'function' ? landRepaint_ : (f => (f || repaint)());
if (roleMoved) { try { land(); } catch (e) { oops_(e, 'me:profileRefresh_') } return; }
if (CARD_EDIT && CARD_EDIT.own) { try { land(() => paint(SET_OF_FACE_[CARD_EDIT.col] || 'account')); } catch (e) { oops_(e, 'me:profileRefresh_') } }
PEOPLE_COLS_.forEach(c => {
if (typeof screenHasMarkup_ === 'function' && screenHasMarkup_(c))
try { land(() => { paint(c); placeCells('y', true, 0, c); }); } catch (e) { }
});
try { land(() => libCardsRedraw_()); } catch (e) { oops_(e, 'me:profileRefresh_') }
})
.catch(() => { PROFILE_ASKING = false; });
}
FORM_SEND_['pin-change'] = (v, el) => {
const said = $('pin-said');
if (!USER) { if (said) tell_(said, 'error', text_('err-sign-in-first')); return; }
if (!v.now || !v.new) { if (said) tell_(said, 'info', 'Type your PIN now and the new one.'); return; }
if (v.new !== v.again) { if (said) tell_(said, 'info', 'The 2 new PINs do not match.'); askBack_('pin-change', 'new'); askBack_('pin-change', 'again'); return; }
const lock = el && el.closest && el.closest('.ask-set');
send_({ action: 'changePin', name: USER.name, personId: (USER && USER.personId) || '', currentPin: v.now, newPin: v.new },
{ button: el, busy: 'Changing…', where: 'pin-said', lock: lock })
.then(d => {
if (d && d.token) {
USER.token = d.token;
saveUser_();
}
askDone_('pin-change'); askPaint_('pin-change');
if (said) tell_(said, 'saved', 'Changed.');
toast('PIN changed');
if (el && el.closest && el.closest('#sheet-body')) closeStep_();
})
.catch(() => {});
};
const CARD_SECTIONS = [
{ id: 'picture', bare: true, fields: ['photo'] },
{ id: 'name', bare: true, fields: ['first_name', 'last_name'] },
{ id: 'handle', own: true, cap: 'Handle' },
{ id: 'seat', cap: 'Rate and extra seat', fields: ['rate_per_hour', 'extra_seat_rate'] },
{ id: 'size', cap: 'Class size', fields: ['min_students', 'max_students'] },
{ id: 'manager', cap: 'Your manager', fields: ['manager'] },
{ id: 'headline', fields: ['headline'] },
{ id: 'photos', cap: 'Photographs', fields: [], match: /^photos_\d+$/ },
{ id: 'words', fields: ADJECTIVE_FIELDS },
{ id: 'glance', cap: 'At a glance', fields: ['years_experience', 'favourite_colour', 'age_min', 'age_max', 'min_hours', 'max_hours'] },
{ id: 'quals', cap: 'Qualifications', match: /^qual_\d+(_level|_board|_grade|_received|_teach|_spec)?$/ },
{ id: 'jobs', cap: 'Jobs', match: /^job_\d+_(role|where|from|to)$/ },
{ id: 'where', fields: ['venues_ok', 'travel_km'] },
{ id: 'week', cap: 'Available', match: /^(m|tu|w|th|f|sa|su)\d\d$/ },
];
function cardSent_() {
const g = (typeof DATA !== 'undefined' && DATA && DATA.profileFields) || {};
return [].concat(...Object.keys(g).map(k => g[k] || [])).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
}
function cardSections_(o) {
o = o || {};
const sent = o.sent || cardSent_();
return CARD_SECTIONS.filter(s => (s.own ? !!o.own : (!o.bare || !!s.bare))).map(s => Object.assign({}, s, {
list: (s.fields || []).filter(f => sent.indexOf(f) !== -1).concat(s.match ? sent.filter(f => s.match.test(f)) : []),
})).filter(s => s.own || s.list.length);
}
const cardFields_ = () => [].concat(...cardSections_().map(s => s.list));
function ownCardSections_(col) {
const g = myGroups_();
const sent = [].concat(...Object.keys(g).map(k => g[k] || [])).filter(f => RETIRED_FIELDS_.indexOf(f) === -1);
const all = cardSections_({ own: true, sent, bare: !cardMine_() });
const you = all.filter(s => OWN_CARD_SECTIONS_.indexOf(s.id) !== -1);
const staff = all.filter(s => OWN_CARD_SECTIONS_.indexOf(s.id) === -1 && s.list.length);
if (!col) return you.concat(staff);
return (isStudentsCol_(col) ? you : []).concat(isTutorsCol_(col) && cardMine_() ? staff : []);
}
const OWN_CARD_SECTIONS_ = ['picture', 'name', 'handle'];
const OWN_SEC_TITLE_ = { picture: 'Picture', name: 'Name', handle: 'Handle', seat: 'Rate and extra seat', cut: "@family.'s share", size: 'Class size', manager: 'Your manager', headline: 'Headline',
photos: 'Photographs', words: '3 words', glance: 'At a glance', quals: 'Qualifications', jobs: 'Jobs', where: text_('where-you-teach'), week: 'Available' };
const OWN_SEC_OF_SET_ = { account: OWN_CARD_SECTIONS_, family: [],
staff: ['seat', 'size', 'manager', 'headline', 'photos', 'words', 'glance', 'quals', 'jobs', 'where', 'week'] };
const ownCardFields_ = () => [].concat(...ownCardSections_().map(s => s.list));
const isJobField_ = f => /^job_\d+_(role|where|from|to)$/.test(String(f || ''));
const isJobs_ = list => (list || []).some(isJobField_);
function jobShelf_(list, value, o) {
const nums = [...new Set((list || []).filter(isJobField_).map(f => String(f).match(/^job_(\d+)_/)[1]))];
let last = 0;
nums.forEach((n, i) => { if (shelfFilled_(value, ['job_' + n + '_role', 'job_' + n + '_where'])) last = i + 1; });
const box = (n, k) => formOf_('job', f => String(value(f) || ''), { vars: { n }, only: ['job_{n}_' + k], with: () => ((o || {}).draft === false ? { draft: false } : {}) });
const slot = (n, i) => ({ type: 'group', look: 'lib-card job-slot', attrs: { hidden: i >= last }, inner: box(n, 'role') + box(n, 'where')
+ cardBlock_({ type: 'group', tag: 'span', look: 'job-when', inner: box(n, 'from') + cardBlock_({ type: 'group', tag: 'span', look: 'job-dash', text: '–' }) + box(n, 'to') })
+ shelfDrop_('job') });
return cardBlock_({ type: 'group', look: 'lib-shelf job-shelf', attrs: { 'data-noun': 'job' }, inner: cardBlocks_(nums.map(slot)) + (last < nums.length ? shelfAdd_('job') : '') });
}
const jobCount_ = val => [1, 2, 3, 4, 5, 6].filter(n => String(val('job_' + n + '_role') || val('job_' + n + '_where') || '').trim()).length;
const VIDEO_MAX_MB_ = 100, VIDEO_MAX_S_ = 75, VIDEO_PART_ = 4 * 1024 * 1024;
const introSrc_ = id => 'https://drive.google.com/file/d/' + encodeURIComponent(String(id || '')) + '/preview';
function videoPicker_(value, said) {
const id = String(value('video_file') || '').trim();
return cardBlock_({ type: 'group', look: 'vid-pick', attrs: { 'data-file': id }, blocks: [
{ type: 'group', look: 'ce-line', blocks: [{ type: 'group', tag: 'span', look: 'ce-k', text: 'Intro video' }, { type: 'group', tag: 'span', look: 'ce-v', text: id ? 'uploaded' : 'none' }] },
id ? { type: 'group', look: 'vid-frame', blocks: [{ type: 'media', src: introSrc_(id), title: 'Your intro video', allow: 'autoplay; fullscreen', full: true }] } : null,
{ type: 'group', look: 'tile-row', tiles: [{ icon: 'plus', label: id ? 'Change video' : 'Upload video', note: 'about a minute', act: 'vid-pick' },
{ icon: 'bin', label: 'Remove', act: 'vid-remove', off: !id }] },
{ type: 'group', tag: 'p', look: 'note vid-said', text: said || (id ? 'Parents can watch this on your card.' : 'A short clip saying hello: about a minute, 100 MB at most.') },
{ type: 'control', attrs: { type: 'file', class: 'vid-in', accept: 'video/*', hidden: true } }] });
}
const vidSay_ = (box, msg) => { const p = box && box.querySelector('.vid-said'); if (p) p.textContent = msg; };
function vidTake_(box, id, msg) {
if (USER) USER.profile = Object.assign({}, USER.profile || {}, { video_file: id });
const row = USER && ((DATA && DATA.tutors) || []).find(t => t && t.personId === USER.personId);
if (row) row.videoFile = id;
if (box) box.outerHTML = videoPicker_(f => (f === 'video_file' ? id : ''), msg);
}
on('vid-pick', el => { const inp = el.closest('.vid-pick') && el.closest('.vid-pick').querySelector('.vid-in'); if (inp) inp.click(); });
on('vid-remove', el => {
const box = el.closest('.vid-pick');
if (!USER || !box || !sure_(el, 'Remove?')) return;
send_({ action: 'videoPart', name: USER.name, personId: USER.personId, remove: true }, { button: el, where: box.querySelector('.vid-said'), saying: 'Removing…', lock: box })
.then(() => { vidTake_(box, '', 'Removed.'); toast(text_('video-removed')); }).catch(() => { });
});
function vidLength_(file) {
return new Promise(ok => {
try {
const v = document.createElement('video'), url = URL.createObjectURL(file);
const end = s => { URL.revokeObjectURL(url); ok(s); };
const k = setTimeout(() => end(0), 4000);
v.preload = 'metadata';
v.onloadedmetadata = () => { clearTimeout(k); const s = Number(v.duration); end(isFinite(s) ? s : 0); };
v.onerror = () => { clearTimeout(k); end(0); };
v.src = url;
} catch (e) { ok(0); }
});
}
const vidB64_ = blob => new Promise((ok, no) => {
const r = new FileReader();
r.onload = () => ok(String(r.result).split(',')[1] || '');
r.onerror = () => no(new Error('the phone could not read the video'));
r.readAsDataURL(blob);
});
function vidRefusal_(file, secs) {
if (!file || !/^video\//.test(file.type || '') && !/\.(mov|mp4|m4v|webm)$/i.test(file.name || '')) return 'That is not a video. Choose a video from your phone.';
if (file.size > VIDEO_MAX_MB_ * 1024 * 1024) return 'That video is ' + Math.ceil(file.size / 1048576) + ' MB — 100 MB at most. Trim it to about a minute.';
if (secs > VIDEO_MAX_S_) return 'That video runs ' + Math.round(secs) + ' seconds — about a minute at most. Trim it and choose it again.';
return '';
}
async function vidUpload_(box, file) {
const parts = Math.max(1, Math.ceil(file.size / VIDEO_PART_)), upload = 'u' + Date.now().toString(36);
const btn = box.querySelector('[data-do="vid-pick"]');
let d = null;
for (let i = 0; i < parts; i++) {
const data = await vidB64_(file.slice(i * VIDEO_PART_, Math.min(file.size, (i + 1) * VIDEO_PART_)));
d = await send_({ action: 'videoPart', name: USER.name, personId: USER.personId, upload, part: i, parts, size: file.size,
mime: file.type || 'video/mp4', data }, { button: btn, where: box.querySelector('.vid-said'), saying: 'Uploading… ' + Math.round(i / parts * 100) + '%', lock: box });
}
return d;
}
document.addEventListener('change', e => {
const inp = e.target;
if (!inp || !inp.matches || !inp.matches('.vid-in')) return;
const file = (inp.files || [])[0];
inp.value = '';
const box = inp.closest('.vid-pick');
if (!file || !box || !USER) return;
vidSay_(box, 'Checking the video…');
vidLength_(file).then(secs => {
const no = vidRefusal_(file, secs);
if (no) { vidSay_(box, no); return; }
return vidUpload_(box, file).then(d => {
const id = String((d && d.videoFile) || '');
if (!id) { vidSay_(box, 'The video went but no file came back. Try again.'); return; }
vidTake_(box, id, 'Saved. Parents can watch this on your card.');
toast(text_('video-saved'));
});
}).catch(() => { });
});
;
/* js/me-fields.js */
const isPhotoField_ = f => /^photos_\d+$/.test(String(f));
const isPhotos_ = list => (list || []).some(isPhotoField_);
function photoShelf_(list, value, o) {
const nums = (list || []).filter(isPhotoField_).map(f => String(f).match(/^photos_(\d+)$/)[1]);
return cardBlock_({ type: 'group', look: 'lib-shelf ph-shelf', attrs: { 'data-noun': 'photo' }, inner: shelfSlots_(nums,
i => shelfFilled_(value, ['photos_' + i]),
(i, hide) => {
const v = String(value('photos_' + i) || '').trim();
return cardBlock_({ type: 'group', look: 'lib-card ph-slot', attrs: { hidden: !!hide },
inner: cardBlock_({ type: 'group', tag: 'span', look: 'ph-thumb', blocks: [v ? phThumb_(v) : null] })
+ fieldHtml('photos_' + i, v, { placeholder: 'Photo', draft: (o || {}).draft, extra: 'type="hidden"' })
+ cardBlock_({ type: 'group', look: 'tile-row', inner: tile_({ icon: 'plus', label: v ? text_('change-photo') : 'Choose photo', act: 'ph-pick' }) + shelfDrop_('photo') })
+ cardBlock_({ type: 'group', tag: 'p', look: 'note ph-said' }) + formFile_('ph-in', 'image/*') });
}, 'photo') });
}
const phThumb_ = v => ({ type: 'media', kind: 'image', src: pic(v), title: '', async: true });
document.addEventListener('input', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('.ph-slot input')) return;
const thumb = t.closest('.ph-slot').querySelector('.ph-thumb');
const v = String(t.value || '').trim();
if (thumb) thumb.innerHTML = /^https?:\/\/\S+$/i.test(v) ? cardBlock_(phThumb_(v)) : '';
});
const PHOTO_EDGE_ = 1200;
function photoShrink_(file) {
return new Promise(done => {
try {
const url = URL.createObjectURL(file), img = new Image();
img.onload = () => {
const w = img.naturalWidth || 1, h = img.naturalHeight || 1, k = Math.min(1, PHOTO_EDGE_ / Math.max(w, h));
const cv = document.createElement('canvas');
cv.width = Math.max(1, Math.round(w * k)); cv.height = Math.max(1, Math.round(h * k));
try { cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); done(cv.toDataURL('image/jpeg', 0.82)); } catch (e) { done(null); }
URL.revokeObjectURL(url);
};
img.onerror = () => { URL.revokeObjectURL(url); done(null); };
img.src = url;
} catch (e) { done(null); }
});
}
on('ph-pick', el => { const slot = el.closest('.ph-slot'), inp = slot && slot.querySelector('.ph-in'); if (inp) inp.click(); });
document.addEventListener('change', e => {
const inp = e.target;
if (!inp || !inp.matches || !inp.matches('.ph-in')) return;
const file = (inp.files || [])[0], slot = inp.closest('.ph-slot');
inp.value = '';
if (!file || !slot || !whose_()) return;
const said = slot.querySelector('.ph-said'), say = m => { if (said) tell_(said, 'info', m); };
if (!/^image\//.test(file.type || '')) { say('That is not a picture. Choose a photo from your phone.'); return; }
say(text_('getting-the-photo-ready'));
photoShrink_(file).then(data => {
if (!data || !/^data:image\/jpeg/.test(data)) { say(text_('the-phone-could-not-read-that')); return; }
return send_({ action: 'photoFile', name: USER.name, personId: USER.personId, data },
{ button: slot.querySelector('[data-do="ph-pick"]'), where: said, saying: 'Uploading…', lock: slot }).then(d => {
const url = String((d && d.url) || ''), box = slot.querySelector('input[data-me]');
if (!url || !box) { say('The photo went but no link came back. Try again.'); return; }
box.value = url;
box.dispatchEvent(new Event('input', { bubbles: true }));
say('Uploaded. Press Save to keep it on your card.');
});
}).catch(() => { });
});
function photoPicker_(value, said, o) {
const v = String(value('photo') || '').trim();
const K = picKindRow_(v);
const chosen = K ? K.chosen(v) : '';
const opt = n => {
const label = PFP_ART[n].name;
return tile_({ label: label, act: 'pfp-choose', data: { pic: n }, on: chosen === n, pressed: chosen === n, cls: 'pfp-opt',
face: pfpArt_(n, 40) });
};
const face = { type: 'group', tag: 'span', look: 'pfp-face', inner: pfpFace_(v) };
const fold = !!(o && o.fold);
const rest = [{ type: 'group', look: 'pfp-side', blocks: [{ type: 'group', look: 'tile-row', tiles: [
uiMay_('upload-photo') ? { icon: 'photo', label: 'Choose photo', act: 'pfp-pick' } : null,
{ icon: 'bin', label: 'Remove', act: 'pfp-remove', off: !v }].filter(Boolean) }] },
{ type: 'group', tag: 'p', look: 'note pfp-said', text: said || pfpSaid_(v) }];
const file = uiMay_('upload-photo') ? formFile_('pfp-in', 'image/*') : '';
return fold
? cardBlock_({ type: 'group', tag: 'details', look: 'pfp ce-fold', attrs: { 'data-fold': 'picture', open: true }, blocks: [
{ type: 'group', tag: 'summary', look: 'ce-line', blocks: [{ type: 'group', tag: 'span', look: 'ce-k', text: 'Picture' }, face] }].concat(rest), inner: file })
: cardBlock_({ type: 'group', look: 'pfp', blocks: [face].concat(rest), inner: file });
}
function pfpSaid_(v) {
const K = picKindRow_(v);
if (K) return K.said(v);
return 'No picture yet, so your card shows your initial. Choose one, or a photo.';
}
function pfpFace_(v) {
const me = whose_() || {};
return personFace_({ pic: v, personId: me.personId, handle: me.handle,
name: (me.profile && me.profile.first_name) || me.name || '?' },
{ cls: 'pfp-pic', none: 'pfp-none', size: 88, alt: 'Your profile picture', eager: true });
}
function pfpRing_(box, name) {
if (!box) return;
box.querySelectorAll('.pfp-opt').forEach(b => {
const on = !!name && b.dataset.pic === name;
b.classList.toggle('on', on);
b.setAttribute('aria-pressed', on ? 'true' : 'false');
});
}
const PFP_SINCE = '2026-10-10-h-pictures';
function pfpKept_(chose) {
const v = String((typeof DATA !== 'undefined' && DATA && DATA.version) || '');
const old = !!chose && /^\d{4}-\d\d-\d\d/.test(v) && v < PFP_SINCE;
return 'Your picture is unchanged.' + (old
? ' The server has not been updated for the pictures yet; until it is, a photo still works.' : '');
}
const PFP_SIZE = 600;
function pfpPrepare_(file) {
if (typeof camItemOf_ !== 'function') return Promise.resolve(null);
return camItemOf_(file).then(it => {
if (!it || it.kind !== 'image' || !it.data) return null;
return new Promise(done => {
const img = new Image();
img.onload = () => {
const w = img.naturalWidth || 1, h = img.naturalHeight || 1, s = Math.min(w, h);
const out = Math.max(1, Math.min(PFP_SIZE, s));
const cv = document.createElement('canvas');
cv.width = cv.height = out;
try {
cv.getContext('2d').drawImage(img, (w - s) / 2, (h - s) / 2, s, s, 0, 0, out, out);
done(cv.toDataURL('image/jpeg', 0.85));
} catch (e) { done(null); }
};
img.onerror = () => done(null);
img.src = it.data;
});
}).catch(() => null);
}
function pfpTake_(box, url, said) {
if (!USER) return;
USER.profile = Object.assign({}, USER.profile || {}, { photo: url });
USER.photo = url;
saveUser_();
['tutors', 'people', 'students', 'clients', 'family', 'everyone'].forEach(k => ((DATA && DATA[k]) || []).forEach(r => {
if (r && USER.personId && (r.personId === USER.personId || r.person_id === USER.personId || r.id === USER.personId)) {
if ('image' in r) r.image = url;
if ('photo' in r) r.photo = url;
}
}));
const onCard = !!(box && box.closest && box.closest('.card-ed'));
if (box && box.parentNode) box.outerHTML = photoPicker_(f => (f === 'photo' ? url : ''), said, { fold: onCard });
try { if (typeof window.postFacesMine_ === 'function') window.postFacesMine_(); } catch (e) { oops_(e, 'me:pfpTake_') }
if (onCard) return;
}
on('pfp-pick', el => {
const inp = el.closest('.pfp') && el.closest('.pfp').querySelector('.pfp-in');
if (inp) inp.click();
});
on('pfp-remove', el => {
const box = el.closest('.pfp');
if (!USER || !box || !sure_(el, 'Remove?')) return;
send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, remove: true },
{ button: el, where: box.querySelector('.pfp-said'), saying: 'Removing…', lock: box })
.then(d => { const got = (d && d.photo) || ''; pfpTake_(box, got, 'Removed. ' + pfpSaid_(got)); toast(text_('picture-removed')); })
.catch(() => { const said = box.querySelector('.pfp-said'); if (said) said.textContent += ' ' + pfpKept_(); });
});
on('pfp-choose', el => {
const box = el.closest('.pfp');
const name = String(el.dataset.pic || '');
if (!USER || !box || !pfpChoice_(PFP_PREFIX + name)) return;
const choice = PFP_PREFIX + name;
const said = box.querySelector('.pfp-said');
const was = String((USER.profile && USER.profile.photo) || '').trim();
if (pfpChoice_(was) === name) { if (said) tell_(said, 'info', 'Already chosen. ' + pfpSaid_(was)); return; }
const face = box.querySelector('.pfp-face');
if (face) face.innerHTML = pfpFace_(choice);
pfpRing_(box, name);
send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, choice },
{ button: el, where: said, saying: 'Saving…', lock: box })
.then(d => {
const got = String((d && d.photo) || '');
pfpTake_(box, got, (pfpChoice_(got) === name ? 'Saved. ' : 'The server kept something else. ') + pfpSaid_(got));
toast(text_('picture-saved'));
})
.catch(() => {
if (face) face.innerHTML = pfpFace_(was);
pfpRing_(box, pfpChoice_(was));
if (said) tell_(said, 'info', String(said.textContent || '').trim() + ' ' + pfpKept_(true));
});
});
document.addEventListener('change', e => {
const inp = e.target;
if (!inp || !inp.matches || !inp.matches('.pfp-in')) return;
const file = (inp.files || [])[0];
inp.value = '';
const box = inp.closest('.pfp');
if (!file || !box || !USER) return;
const said = box.querySelector('.pfp-said');
const btn = box.querySelector('[data-do="pfp-pick"]');
if (said) tell_(said, 'info', 'Getting it ready…');
pfpPrepare_(file).then(data => {
if (!data) { if (said) tell_(said, 'info', 'That file is not a picture this phone can read. Try another.'); return; }
const face = box.querySelector('.pfp-face');
if (face) face.innerHTML = cardBlock_({ type: 'media', kind: 'image', look: 'pfp-pic', src: data, title: 'Your profile picture', async: true });
pfpRing_(box, '');
return send_({ action: 'savePhoto', name: USER.name, personId: USER.personId, data },
{ button: btn, where: said, saying: 'Saving…', lock: box })
.then(d => { const got = (d && d.photo) || ''; pfpTake_(box, got, 'Saved. ' + pfpSaid_(got)); toast(text_('picture-saved')); })
.catch(() => {
const was = (USER.profile && USER.profile.photo) || '';
if (face) face.innerHTML = pfpFace_(was);
pfpRing_(box, pfpChoice_(was));
if (said) tell_(said, 'info', String(said.textContent || '').trim() + ' ' + pfpKept_());
});
});
});
function availCodes_() {
const groups = (DATA && DATA.profileFields) || {};
const hit = Object.keys(groups).find(g => isTimetable_(groups[g]));
return hit ? groups[hit] : [];
}
const TRUEish_ = v => v === true || /^(true|yes|1|✓)$/i.test(String(v ?? '').trim());
;
/* js/me-card.js */
function cardMine_() {
if (!whose_() || typeof mineIs_ !== 'function') return null;
return ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).find(t => t && t.personId && mineIs_(t, whose_())) || null;
}
function cardSettingsGroups_(groups, on) {
on = new Set(on || cardFields_());
const out = {};
Object.keys(groups || {}).forEach(g => {
const left = (groups[g] || []).filter(f => !on.has(f));
if (left.length) out[g] = left;
});
return out;
}
let CARD_EDIT = null;
let CARD_EDIT_READ = '';
const CARD_EDIT_KEY = 'familyCardEdit';
function cardEditFresh_(pid) {
const me = String((whose_() && whose_().personId) || '');
const own = !!me && String(pid) === me;
return { who: me, pid: String(pid), own, col: own ? 'settings' : undefined, base: null, asking: false, err: '' };
}
function cardEditNow_() {
if (!whose_()) { CARD_EDIT = null; CARD_EDIT_READ = ''; return null; }
const me = String(whose_().personId || '');
if (CARD_EDIT && CARD_EDIT.who !== me) CARD_EDIT = null;
if (!CARD_EDIT && CARD_EDIT_READ !== me) {
CARD_EDIT_READ = me;
try {
const k = JSON.parse(keep_.get(CARD_EDIT_KEY) || 'null');
if (k && k.pid && k.who && k.who === me) {
CARD_EDIT = cardEditFresh_(k.pid);
if (!CARD_EDIT.own && PEOPLE_COLS_.indexOf(k.col) !== -1) CARD_EDIT.col = k.col;
if (typeof k.pic === 'string') CARD_EDIT.pic0 = k.pic;
if (typeof k.fig === 'string') CARD_EDIT.fig0 = k.fig;
if (typeof k.hd === 'string') CARD_EDIT.h0 = k.hd;
if (typeof k.cr === 'number') CARD_EDIT.cr0 = k.cr;
}
} catch (e) { }
}
return CARD_EDIT;
}
function cardRemember_(e) {
const k = { who: e.who, pid: e.pid, col: e.col || cardColOf_(e) };
if (typeof e.pic0 === 'string') k.pic = e.pic0;
if (typeof e.fig0 === 'string') k.fig = e.fig0;
if (typeof e.cr0 === 'number') k.cr = e.cr0;
keep_.put(CARD_EDIT_KEY, JSON.stringify(k));
}
function cardForget_() { keep_.del(CARD_EDIT_KEY); }
function cardMayEdit_(t) {
if (!whose_() || !t || !t.personId) return false;
return String(t.personId) === String(whose_().personId || '');
}
const PEOPLE_COLS_ = ['tutors', 'students', 'parents'];
const SET_OF_FACE_ = { tutors: 'staff', students: 'account', parents: 'family' };
const FACE_OF_SET_ = { staff: 'tutors', account: 'students', family: 'parents' };
const faceOfCol_ = c => FACE_OF_SET_[c] || c;
const cardColOf_ = e => (e && e.own ? '' : 'tutors');
const colOfEl_ = el => String(((el && el.closest && el.closest('#screen > .screen')) || {}).id || '').replace(/^s-/, '');
function cardEditing_(t, col) {
const e = cardEditNow_();
return !!(e && t && t.personId && String(t.personId) === e.pid && cardMayEdit_(t) && (!col || (e.col || cardColOf_(e)) === col));
}
function cardEditOpts_(x) {
const t = (x && x.row) || {};
if (!x || !x.account || !cardMayEdit_(t)) return null;
const own = String(t.personId) === String((whose_() || {}).personId || '');
const col = x.col || (own ? homeCol_() : 'tutors');
if (cardEditing_(t, col)) return null;
if (own && !x.settings) return null;
if (own ? !ownCardSections_(col).length : !isTutorsCol_(col)) return null;
return ({ icon: 'edit', label: 'Edit', note: own ? (isTutorsCol_(col) && may_('staff') ? 'your tutor card' : 'your card') : 'their card', act: 'card-edit',
tone: own ? '' : 'admin', data: { pid: t.personId, col } });
}
const CARD_BOOL_ = /^(m|tu|w|th|f|sa|su)\d\d$|^qual_\d+_(teach|spec)$/;
function cardSame_(f, a, b) {
if (CARD_BOOL_.test(f)) return TRUEish_(a) === TRUEish_(b);
return String(a == null ? '' : a).trim() === String(b == null ? '' : b).trim();
}
function cardFormVals_(form, raw) {
const out = {};
form.querySelectorAll('[data-me]').forEach(b => {
if (b.disabled) return;
const v = isCheckbox_(b) ? (b.checked ? 'TRUE' : 'FALSE') : String(b.value || '').trim();
out[b.dataset.me] = v === QUAL_OTHER && !raw ? '' : v;
});
return out;
}
const CARD_HOUR_ = /^(m|tu|w|th|f|sa|su)\d\d$/;
const CARD_WHOLE_ = [CARD_HOUR_, /^photos_\d+$/, /^qual_\d+(_\w+)?$/];
function cardChanged_(base, now) {
const out = {};
const moved = Object.keys(now).filter(f => !cardSame_(f, now[f], base[f]));
moved.forEach(f => { out[f] = now[f]; });
CARD_WHOLE_.forEach(re => {
if (moved.some(f => re.test(f))) Object.keys(now).forEach(f => { if (re.test(f)) out[f] = now[f]; });
});
return out;
}
function cardDraft_(pid) {
try { const s = draftRead_('card', pid); return s ? JSON.parse(s) : null; } catch (x) { return null; }
}
function cardValues_(e, base, sec) {
const vals = Object.assign({}, base);
let held = 0;
const d = cardDraft_(e.pid + (sec ? ':' + sec : ''));
if (d && d.v) {
Object.keys(d.v).forEach(f => {
if (d.from && Object.prototype.hasOwnProperty.call(d.from, f) && !cardSame_(f, d.from[f], base[f])) return;
vals[f] = d.v[f]; held++;
});
}
return { vals, held };
}
const CARD_DRAWN = new Map();
let CARD_DRAW_N = 0;
function cardDrawn_(base) {
const n = String(++CARD_DRAW_N);
CARD_DRAWN.set(n, base);
if (CARD_DRAWN.size > 64) {
const live = new Set([...document.querySelectorAll('.card-ed .me-form[data-draw]')].map(f => f.dataset.draw));
[...CARD_DRAWN.keys()].forEach(k => { if (Number(k) <= CARD_DRAW_N - 32 && !live.has(k)) CARD_DRAWN.delete(k); });
}
return n;
}
function cardKeep_(form) {
const e = CARD_EDIT;
const card = form && form.closest('.card-ed');
const base = form && CARD_DRAWN.get(form.dataset.draw || '');
if (!e || !USER || !card || !base || card.dataset.pid !== e.pid) return;
const key = e.pid + (card.dataset.sec ? ':' + card.dataset.sec : '');
const now = cardFormVals_(form), v = {}, from = {};
Object.keys(now).forEach(f => {
if (cardSame_(f, now[f], base[f])) return;
v[f] = now[f];
from[f] = base[f] == null ? '' : String(base[f]);
});
try {
if (Object.keys(v).length) draftKeep_('card', key, JSON.stringify({ v, from }));
else draftDrop_('card', key);
} catch (x) { }
}
function cardBaseNow_(e) {
if (!e) return null;
if (e.own) return profileShapeOk_() ? whose_().profile : null;
return e.base;
}
function cardFetch_(e) {
if (!e || CARD_EDIT !== e || e.asking || e.err || cardBaseNow_(e)) return;
if (e.own) {
if (PROFILE_SERVER_OLD) { e.err = OLD_SERVER_SAY_; cardRepaint_(); return; }
const p = profileRefresh_(false, () => { e.err = OLD_SERVER_SAY_; });
if (!p) return;
e.asking = true;
p.then(() => {
e.asking = false;
if (CARD_EDIT !== e) return;
if (!cardBaseNow_(e) && !e.err) e.err = 'Your details did not arrive from the server, so there is nothing to edit yet. Cancel, and try again in a moment.';
cardRepaint_();
});
return;
}
e.asking = true;
api({ action: 'item', door: 'get', kind: 'card', ids: [e.pid], name: USER.name, personId: USER.personId || '', target: e.pid })
.then(d => {
e.asking = false;
if (CARD_EDIT !== e) return;
if (d && d.success && d.profile && Object.prototype.hasOwnProperty.call(d.profile, 'phone_cc')) e.base = d.profile;
else e.err = (d && d.error) || OLD_SERVER_SAY_;
cardRepaint_();
}, () => {
e.asking = false;
if (CARD_EDIT !== e) return;
e.err = 'The server did not answer, so their details are not here to edit. Cancel, and try again in a moment.';
cardRepaint_();
});
}
function cardRepaint_() { PEOPLE_COLS_.concat(Object.keys(FACE_OF_SET_)).forEach(c => { try { paint(c); } catch (x) { oops_(x, 'me:cardRepaint_') } }); }
const mcG_ = (tag, look, o) => cardBlock_(Object.assign({ type: 'group', tag, look }, o || {}));
const mcNote_ = (look, text) => cardBlock_({ type: 'msgText', look: 'note ' + look, text: text || '' });
function cardEditHtml_(t) {
const e = cardEditNow_();
const pid = String(t.personId);
const head = { type: 'msgHead', text: [(profRoleWords_(t).join(' · ') || 'Profile') + ' ', { span: 'ce-what', text: '· editing' }] };
const base = cardBaseNow_(e);
const card = inner => setCard_({ body: [{ type: 'group', look: 'is-widget card-ed', attrs: { 'data-pid': pid }, parts: inner },
{ type: 'tiles', look: 'ce-tiles', tiles: cardSaveOpts_(pid, !base) }] });
if (!base) {
if (!e.err) setTimeout(() => cardFetch_(e), 0);
return card([head, e.err ? meSaidB_(e.err) : { type: 'wait', on: true }]);
}
const { vals, held } = cardValues_(e, base);
return card([head, { type: 'group', look: 'me-form', attrs: { 'data-draw': cardDrawn_(base) }, parts: [cardEditForm_(t, e, vals), meSaidB_(held ? SET_HELD_SAY : '')] }]);
}
function cardEditCards_(t, e, secs, setCol) {
const pid = String(t.personId);
const base = cardBaseNow_(e);
if (!base && !e.err) setTimeout(() => cardFetch_(e), 0);
return secs.map(s => {
const title = OWN_SEC_TITLE_[s.id] || s.cap || s.id;
const card = { title, hook: 'card-ed',
attrs: ` data-pid="${esc(pid)}" data-sec="${esc(s.id)}" data-lay-card="own:${esc(setCol)}:${esc(s.id)}" aria-label="${esc(title)}"` };
if (!base) return setCard_(Object.assign(card, { body: e.err ? meSaidB_(e.err) : { type: 'wait', on: true }, save: cardCancelTile_(pid) }));
const { vals, held } = cardValues_(e, base, s.id);
return setCard_(Object.assign(card, { form: cardEditForm_(t, e, vals, [s]), formAttrs: ` data-draw="${cardDrawn_(base)}"`,
save: cardCancelTile_(pid), foot: meSaidB_(held ? SET_HELD_SAY : '') }));
});
}
function cardSaveOpts_(pid, saveOff) {
return [{ icon: 'save', label: text_('save'), note: 'every change', act: 'card-save', off: !!saveOff, data: { pid } }, cardCancelOpts_(pid)];
}
const cardCancelOpts_ = pid => ({ icon: 'close', label: 'Cancel', note: 'put it back', act: 'card-cancel', data: { pid } });
const cardCancelTile_ = pid => tile_(cardCancelOpts_(pid));
const CE_OPEN = new Set();
document.addEventListener('toggle', e => {
const d = e.target;
if (!d || !d.matches || !d.matches('details.ce-fold')) return;
const k = d.dataset.fold || '';
if (d.open) CE_OPEN.add(k); else if (d.isConnected) CE_OPEN.delete(k);
}, true);
document.addEventListener('click', e => {
const s = e.target && e.target.closest && e.target.closest('details.ce-fold > summary');
if (s) e.preventDefault();
}, true);
const ceFold_ = (key, label, val, body) => mcG_('details', 'ce-fold', { attrs: { 'data-fold': key, open: true },
inner: mcG_('summary', 'ce-line', { inner: mcG_('span', 'ce-k', { text: label }) + mcG_('span', 'ce-v', { inner: val }) }) + mcG_('div', 'ce-body', { inner: body }) });
const ceCount_ = (n, one, many) => n ? n + ' ' + (n === 1 ? one : many) : 'none';
function ceSums_(form) {
const sec = id => form.querySelector('.ce-sec[data-sec="' + id + '"]');
const ph = sec('photos'), v = ph && ph.querySelector('details[data-fold="photos"] > summary .ce-v');
if (v) v.textContent = cePhotoSay_([...ph.querySelectorAll('.ph-slot input')].filter(i => String(i.value).trim()).length,
String((ph.querySelector('.vid-pick') || { dataset: {} }).dataset.file || '').trim());
const jb = sec('jobs'), jv = jb && jb.querySelector('details[data-fold="jobs"] > summary .ce-v');
if (jv) jv.textContent = ceCount_(jobCount_(f => (jb.querySelector('[data-me="' + f + '"]') || {}).value), 'job', 'jobs');
const q = sec('quals'), qv = q && q.querySelector('details[data-fold="quals"] > summary .ce-v');
const gl = sec('glance'), gv = gl && gl.querySelector('details[data-fold="glance"] > summary .ce-v');
if (gv) gv.textContent = ceGlanceSay_(f => (gl.querySelector('[data-me="' + f + '"]') || {}).value);
const wh = sec('where'), wv = wh && wh.querySelector('details[data-fold="where"] > summary .ce-v');
if (wv) wv.textContent = ceCount_(profList_((wh.querySelector('[data-me="venues_ok"]') || {}).value).length, 'venue', 'venues');
if (qv) qv.textContent = ceCount_(q.querySelectorAll('.q-list .q-slot:not([data-new])').length, 'held', 'held');
}
function ceGlanceSay_(get) {
const g = f => String(get(f) == null ? '' : get(f)).trim();
const range = (a, b, unit) => (g(a) || g(b)) ? (g(a) || '?') + '–' + (g(b) || '?') + unit : '';
return [g('years_experience') ? g('years_experience') + ' yrs' : '', g('favourite_colour'),
range('age_min', 'age_max', ''), range('min_hours', 'max_hours', ' h')].filter(Boolean).join(' · ') || 'none';
}
const ceAreaOf_ = v => String((v && (v.borough || v.city)) || '').trim() || 'Elsewhere';
function ceAreas_() {
const by = {};
((typeof DATA !== 'undefined' && DATA && DATA.venues) || []).forEach(v => { if (v && v.title) (by[ceAreaOf_(v)] = by[ceAreaOf_(v)] || []).push(v.title); });
return by;
}
function ceWhere_(L, val, box) {
const got = profList_(val('venues_ok')), by = ceAreas_(), has = t => got.some(g => norm(g) === norm(t));
const ro = fieldReadonly_('venues_ok');
const ticks = L.indexOf('venues_ok') === -1 ? '' : formOf_('card-where', { venues_ok: got.join(', ') }, { locked: ro,
options: { areas: Object.keys(by).sort().map(a => [a, { html: mcG_('span', null, { text: a }) + ' ' + qtag_(esc(ceCount_(by[a].length, 'venue', 'venues'))) }, by[a].some(has)]) } });
return ceFold_('where', 'Areas', esc(ceCount_(got.length, 'venue', 'venues')), ticks)
+ fieldRows_(L.filter(f => f !== 'venues_ok'), box);
}
document.addEventListener('change', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('input[data-where-area]')) return;
const sec = t.closest('.ce-sec'), hid = sec && sec.querySelector('input[data-me="venues_ok"]');
if (!hid) return;
const mine = ceAreas_()[t.getAttribute('data-where-area')] || [];
const keep = profList_(hid.value).filter(g => !mine.some(m => norm(m) === norm(g)));
hid.value = (t.checked ? keep.concat(mine) : keep).join(', ');
const v = sec.querySelector('details[data-fold="where"] > summary .ce-v');
if (v) v.textContent = ceCount_(profList_(hid.value).length, 'venue', 'venues');
});
const cePhotoSay_ = (n, video) => ceCount_(n, 'photo', 'photos') + (video ? ' · video' : '');
const CARD_SECTION = {
picture: (L, c) => c.e.own ? photoPicker_(c.val, '', { fold: true }) : cardFaceOnly_(c.t),
handle: () => cardHandleHtml_(),
photos: (L, c) => ceFold_('photos', 'Photos', esc(cePhotoSay_(c.filled(/^photos_\d+$/), String(c.val('video_file')).trim())),
(c.e.own ? videoPicker_(c.val) : '') + fieldRows_(L.filter(f => !isPhotoField_(f) && !(c.e.own && f === 'video')), c.box) + (isPhotos_(L) ? photoShelf_(L, c.val, { draft: false }) : '')),
jobs: (L, c) => ceFold_('jobs', 'Jobs', esc(ceCount_(jobCount_(c.val), 'job', 'jobs')), jobShelf_(L, c.val, { draft: false })),
quals: (L, c) => ceFold_('quals', 'Qualifications', esc(ceCount_(c.filled(/^qual_\d+$/), 'held', 'held')), qualShelf_(L, c.val)),
week: (L, c) => availGrid_(L, c.vals, c.ro, false), seat: (L, c) => cardRateHtml_(L, c.val, c.box, c.e),
cut: (L, c) => cardCutHtml_(L, c.val, c.box), size: (L, c) => cardSizeHtml_(L, c.val, c.box),
manager: (L, c) => ceFold_('manager', 'Your manager', esc(chainSay_(c.t, c.val('manager'))), fieldRows_(L, c.box)),
glance: (L, c) => ceFold_('glance', 'At a glance', esc(ceGlanceSay_(c.val)), fieldRows_(L, c.box)), where: (L, c) => ceWhere_(L, c.val, c.box),
};
function chainSay_(t, manager) {
const id = String((t && t.personId) || (whose_() || {}).personId || 'me');
t = t || ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).find(x => x && String(x.personId) === id) || null;
const tutors = ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).filter(x => x && String(x.personId) !== id);
const me = { personId: id, manager: String(manager || ''), role: (t && t.role) || 'Tutor', title: 'You' };
const c = chainShares_(id, tutors.concat([me]));
const pc = x => (Math.round(x * 1000) / 10) + '%';
if (c.tutor === 1) return 'Your extra seats are all yours.';
return 'Of your extra-seat money: you ' + pc(c.tutor) + ', ' + c.managers.map(m => m.name + ' ' + pc(m.share)).concat(['@family. ' + pc(c.admin)]).join(', ') + '.';
}
const CARD_RATE_SECTION = { seat: { line: '.ce-seat', say: (rate, seat) => cardSeatSay_(rate, seat) },
cut: { line: '.ce-cut', say: (rate, seat, cut) => cardCutSay_(rate, cut) }, size: { sizeLine: true } };
function cardEditForm_(t, e, vals, only) {
const val = f => (vals[f] == null ? '' : vals[f]);
const ro = (DATA && DATA.profileReadonly) || [];
const box = (f, extra) => formOf_('card-edit', val, { fields: [f], options: fieldOptions_, with: () => Object.assign({ label: ROW_LABEL[f],
readonly: fieldReadonly_(f),
raw: { person_id: (t && t.personId) || (whose_() || {}).personId || '' } }, extra) });
return (only || (e.own ? ownCardSections_() : cardSections_())).map(s => {
const L = s.list;
const filled = re => L.filter(f => re.test(f) && String(val(f)).trim() !== '').length;
const draw = Object.prototype.hasOwnProperty.call(CARD_SECTION, s.id) ? CARD_SECTION[s.id] : null;
const body = draw ? draw(L, { t, e, val, vals, ro, box, filled }) : fieldRows_(L, box);
return mcG_('div', 'ce-sec', { attrs: { 'data-sec': s.id }, inner: body });
}).join('');
}
function cardSeatUsual_(rate) {
const u = seatShare_(null);
return { extra_seat_rate: pence_(rate * u.cUsed), extra_seat_cut: pence_(rate * u.bUsed) };
}
const cardSeatPh_ = rate => rate > 0 ? 'usual' : '';
function cardSeatShown_(f, rate, frac) {
if (!(rate > 0)) return '';
const s = seatShare_({ extraSeat: frac, extraSeatCut: frac });
if (f === 'extra_seat_cut') return s.cutOwn ? pence_(s.bRaw * rate).toFixed(2) : '';
return s.seatOwn ? pence_(s.cRaw * rate).toFixed(2) : '';
}
function cardSeatShare_(f, typed, rate, was) {
const s = String(typed == null ? '' : typed).trim(), P = num(s);
const cell = String(was == null ? '' : was).trim();
const usual = s === '' || isNaN(P) || (f === 'extra_seat_rate' && P === 0);
if (cardSeatShown_(f, rate, cell) === (usual ? '' : pence_(P).toFixed(2))) return cell;
return usual ? '' : String(Math.round(P / rate * 1e6) / 1e6);
}
const cardSeatTop_ = f => askProps_(f).max;
const cardSeatOff_ = (f, v) => { const x = num(v); return !isNaN(x) && (x < 0 || x > cardSeatTop_(f)); };
const cardSeatOffSay_ = (rate, f) => f === 'extra_seat_cut'
? "@family.'s part is " + fmtMoney_(0) + ' to ' + fmtMoney_(pence_(rate * CUT_MAX_()), 'hour') + ' — twice the rate.'
: 'An extra seat adds ' + fmtMoney_(0) + ' to ' + fmtMoney_(pence_(rate * STAFF_SEAT_MAX_()), 'hour') + ' — at most what the first student pays.';
function cardSeatSay_(rate, seat) {
if (!(rate > 0)) return 'An extra seat is priced from the rate — set it first.';
if (cardSeatOff_('extra_seat_rate', seat)) return esc(cardSeatOffSay_(rate, 'extra_seat_rate'));
const p = cardSeatParts_(rate, seat, '');
return mcG_('span', 'prof-seat', { text: '+' + fmtMoney_(p.kx, 'hour') }) + ' a seat' + (p.kOwn ? '' : ', usual');
}
function cardShareBar_(rate, seat, cut) {
if (!(rate > 0)) return '';
const p = cardSeatParts_(rate, seat, cut), blocks = [['shb-first', rate, 'first seat'], ['shb-seat', p.kx, 'another seat'], ['shb-fam', p.gx, '@family.']];
const all = blocks.reduce((t, b) => t + b[1], 0) || 1;
return blocks.map(([k, v, say], i) => (i ? mcG_('span', 'shb-plus', { attrs: { 'aria-hidden': 'true' }, text: '+' }) : '')
+ mcG_('span', 'shb-blk ' + k, { attrs: { style: 'flex-grow:' + (v / all).toFixed(4) }, text: [{ b: fmtMoney_(v) }, { span: 'shb-say', text: say }] })).join('');
}
const shareBarBox_ = (cut, inner) => mcG_('div', 'share-bar', { attrs: { role: 'img', 'aria-label': 'Who gets what for a second student', 'aria-live': 'polite', 'data-cut': String(cut || '') }, inner });
const mcLive_ = (look, inner) => mcG_('span', look, { attrs: { 'aria-live': 'polite' }, inner });
function cardCutSay_(rate, cut) {
if (!(rate > 0)) return "@family.'s part is priced from the rate — set it first.";
if (cardSeatOff_('extra_seat_cut', cut)) return esc(cardSeatOffSay_(rate, 'extra_seat_cut'));
const p = cardSeatParts_(rate, '', cut);
return mcG_('span', 'prof-seat', { text: '+' + fmtMoney_(p.gx, 'hour') }) + ' a seat' + (p.gOwn ? '' : ', usual');
}
function cardSizeSay_(rate, seat, cut, lo, hi) {
if (!(rate > 0)) return 'Set a rate and the class prices show here.';
const top = Math.max(1, Math.round(num(hi)) || 1), bottom = Math.max(1, Math.round(num(lo)) || 1);
const at = n => n + ': ' + fmtMoney_(cardGroupTotal_(rate, seat, cut, n));
return esc([...new Set([bottom, top])].sort((x, y) => x - y).map(at).join(' · ') + '/h');
}
function cardRateHtml_(L, val, box, e) {
const has = f => L.indexOf(f) !== -1;
if (!has('rate_per_hour') || !has('extra_seat_rate')) return fieldRows_(L, box);
const rate = num(val('rate_per_hour'));
const live = rate > 0;
const own = !!(e && e.own);
const u = live ? cardSeatUsual_(rate) : null;
const pound = formOf_('card-seat', val, { ctx: rate, only: ['extra_seat_rate'],
with: () => ({ label: own ? 'yours, £/h' : 'theirs, £/h', readonly: !live,
extra: `type="number" min="0" max="${live ? pence_(rate * STAFF_SEAT_MAX_()) : 0}" step="0.01" placeholder="${esc(cardSeatPh_(rate))}"` }) });
const bar = own || (typeof may_ === 'function' && may_('admin'))
? shareBarBox_(val('extra_seat_cut'), cardShareBar_(rate, val('extra_seat_rate'), val('extra_seat_cut'))) : '';
return box('rate_per_hour', {}) + bar
+ ceFold_('seat', 'Extra seat', mcLive_('ce-seat', cardSeatSay_(rate, val('extra_seat_rate'))),
pound)
+ fieldRows_(L.filter(f => f !== 'rate_per_hour' && f !== 'extra_seat_rate'), box);
}
function cardCutHtml_(L, val, box) {
if (L.indexOf('extra_seat_cut') === -1) return '';
const rate = num(val('rate_per_hour'));
const live = rate > 0, mayCut = may_('admin');
const u = live ? cardSeatUsual_(rate) : null;
const p = cardSeatParts_(rate, '', val('extra_seat_cut'));
const body = mayCut
? formOf_('card-seat', val, { ctx: rate, only: ['extra_seat_cut'],
with: () => ({ label: "@family.'s, £/h", readonly: !live,
extra: `type="number" min="0" max="${live ? pence_(rate * CUT_MAX_()) : 0}" step="0.01" inputmode="decimal" placeholder="${esc(cardSeatPh_(rate))}"` }) })
: '';
return mcG_('span', 'ce-rate', { attrs: { hidden: true, 'data-rate': String(rate || 0) } })
+ ceFold_('cut', "@family.'s share", mcLive_('ce-cut', cardCutSay_(rate, val('extra_seat_cut'))), body)
+ fieldRows_(L.filter(f => f !== 'extra_seat_cut'), box);
}
function cardSizeHtml_(L, val, box) {
const rate = num(val('rate_per_hour'));
return mcG_('span', 'ce-rate', { attrs: { hidden: true, 'data-rate': String(rate || 0), 'data-seat': String(val('extra_seat_rate')), 'data-cut': String(val('extra_seat_cut')) } })
+ ceFold_('size', 'Class size', mcLive_('ce-size', cardSizeSay_(rate, val('extra_seat_rate'), val('extra_seat_cut'), val('min_students'), val('max_students'))),
fieldRows_(L, box));
}
function cardSeatSync_(form, t, ev) {
const sec = t && t.closest && t.closest(Object.keys(CARD_RATE_SECTION).map(k => '.ce-sec[data-sec="' + k + '"]').join(', '));
if (!sec || !form.contains(sec)) return;
const id = sec.dataset.sec;
const rateBox = sec.querySelector('[data-me="rate_per_hour"]');
const mark = sec.querySelector('.ce-rate');
const rate = num(rateBox ? rateBox.value : (mark ? mark.dataset.rate : ''));
if (CARD_RATE_SECTION[id] && CARD_RATE_SECTION[id].sizeLine) {
const v = f => (sec.querySelector('[data-me="' + f + '"]') || {}).value;
const line = sec.querySelector('.ce-size');
if (line && mark) line.innerHTML = cardSizeSay_(rate, mark.dataset.seat, mark.dataset.cut, v('min_students'), v('max_students'));
return;
}
const hid = f => sec.querySelector('input[type="hidden"][data-me="' + f + '"]');
const base = CARD_DRAWN.get(form.dataset.draw || '') || {};
const share = b => {
const f = b.dataset.pound, h = hid(f);
if (h && !h.disabled && rate > 0) h.value = formShownStore_('card-seat', f, b.value, rate, base[f]);
};
if (t.dataset && t.dataset.pound) {
t.dataset.typed = '1';
share(t);
if (ev === 'change' && t.dataset.pound === 'extra_seat_rate' && String(t.value).trim() !== '' && num(t.value) === 0) t.value = '';
}
if (t === rateBox) {
sec.querySelectorAll('[data-pound]').forEach(b => {
b.disabled = !(rate > 0);
b.max = String(rate > 0 ? pence_(rate * cardSeatTop_(b.dataset.pound)) : 0);
b.placeholder = cardSeatPh_(rate);
if (b.dataset.typed) { share(b); return; }
const h = hid(b.dataset.pound);
b.value = cardSeatShown_(b.dataset.pound, rate, h ? h.value : '');
});
}
const seat = hid('extra_seat_rate'), cut = hid('extra_seat_cut');
const bar = sec.querySelector('.share-bar');
if (bar) bar.innerHTML = cardShareBar_(rate, seat ? seat.value : '', cut ? cut.value : bar.dataset.cut);
const how = CARD_RATE_SECTION[id] || {}, line = how.line && sec.querySelector(how.line);
if (line) line.innerHTML = how.say(rate, seat ? seat.value : '', cut ? cut.value : '');
}
function cardSeatRefusal_(form, fields) {
const off = [];
[['seat', 'extra_seat_rate'], ['cut', 'extra_seat_cut']].forEach(([id, f]) => {
const sec = form.querySelector('.ce-sec[data-sec="' + id + '"]');
if (!sec || !Object.prototype.hasOwnProperty.call(fields, f) || !cardSeatOff_(f, fields[f])) return;
const rb = sec.querySelector('[data-me="rate_per_hour"]'), mark = sec.querySelector('.ce-rate');
const rate = num(rb ? rb.value : (mark ? mark.dataset.rate : ''));
if (!(rate > 0)) return;
delete fields[f];
off.push(cardSeatOffSay_(rate, f));
});
return off.join(' ');
}
function cardHandleHtml_() {
const said = (HANDLE_SAID.pid && HANDLE_SAID.pid === String(whose_().personId || '') && HANDLE_SAID.text)
|| 'Your handle is the first and last letter of your first name and the year you joined. If somebody '
+ 'had it already, more letters of your first name were added, and then a number.';
return ceFold_('handle', 'Handle', mcLive_('handle-now', mcG_('span', 'handle-at', { attrs: { 'aria-hidden': 'true' }, text: '@' })
+ mcG_('span', 'handle-shown', { text: (whose_() && whose_().handle) || '' })), mcNote_('handle-said', said));
}
function cardFaceOnly_(t) {
const first = String(t.title || '').trim().split(/\s+/)[0] || 'They';
return mcG_('div', 'ce-pic', { inner: personFace_({ pic: t.image, avatar: t.avatar, handle: t.handle, name: t.title,
personId: t.personId }, { cls: 'prof-pic', none: 'prof-none', size: 52, eager: true }) });
}
function cardPatchTutor_(pid, all, sent) {
const row = ((DATA && DATA.tutors) || []).find(r => r && String(r.personId) === String(pid));
if (!row) return;
const has = k => Object.prototype.hasOwnProperty.call(sent, k);
const txt = v => String(v == null ? '' : v).trim();
if (has('first_name') || has('last_name')) row.title = (txt(all.first_name) + ' ' + txt(all.last_name)).trim() || row.title;
Object.assign(row, tutorCardOf_(Object.assign({ photo: row.image }, all)));
if (has('extra_seat_cut')) { const x = seatCutOf_(all.extra_seat_cut); row.extraSeatCut = isNaN(x) ? '' : x; }
if (has('venues_ok')) row.venues = profList_(all.venues_ok);
const hours = Object.keys(sent).filter(f => CARD_HOUR_.test(f));
if (hours.length) {
const a = Object.assign({}, row.avail || {});
hours.forEach(f => { a[f] = TRUEish_(sent[f]) ? 'TRUE' : ''; });
row.avail = a;
}
}
const CARD_LEVELLESS_SAY_ = 'Choose a level for each qualification first — nothing was saved.';
function cardQualHole_(form, base) {
return [...form.querySelectorAll('.q-shelf .q-list .q-slot')].some(slot => {
const q = qualRead_(slot);
return !!q.subject && !q.level
&& (!!slot.dataset.new || !!String(base['qual_' + slot.dataset.slot + '_level'] || '').trim());
});
}
function cardClose_(e, pane, sec) {
if (e && e.step) { const id = e.step; e.step = 0; stepDone_(id, false); }
try { draftDrop_('card', e.pid + (sec ? ':' + sec : '')); } catch (x) { oops_(x, 'me:cardClose_') }
if (CARD_EDIT === e && e.own && whose_()) {
Object.assign(e, { pic0: cardPicNow_(), h0: String(whose_().handle || whose_().name || '') });
cardRemember_(e);
} else { if (CARD_EDIT === e) CARD_EDIT = null; cardForget_(); }
(pane || document).querySelectorAll('.card-ed' + (sec ? '[data-sec="' + sec + '"]' : '') + ' .me-form[data-dirty]').forEach(f => { delete f.dataset.dirty; });
if (sec) cardSecRedraw_(pane, sec);
cardRepaint_();
}
function cardSecRedraw_(pane, sec) {
const el = (pane || document).querySelector('.card-ed[data-sec="' + sec + '"]'), form = el && el.querySelector('.me-form');
if (!form) return;
try {
const box = document.createElement('div');
box.innerHTML = ownCardSetPage_(colOfEl_(el)).find(h => h.indexOf('data-sec="' + sec + '"') !== -1) || '';
const fresh = box.querySelector('.me-form');
if (fresh) form.replaceWith(fresh);
} catch (x) { }
}
on('card-edit', el => {
if (!USER) return;
const pid = String(el.dataset.pid || '');
const t = ((DATA && DATA.tutors) || []).find(r => r && String(r.personId) === pid)
|| (pid && pid === String(USER.personId || '') && typeof myCardRow_ === 'function' ? myCardRow_() : null);
if (!t || !cardMayEdit_(t)) return;
const col = PEOPLE_COLS_.indexOf(el.dataset.col) !== -1 ? el.dataset.col : (faceOfCol_(colOfEl_(el)) || 'tutors');
const open = document.querySelector('.card-ed .me-form[data-dirty]');
const openAt = open && (open.closest('.card-ed').dataset.pid + '|' + faceOfCol_(colOfEl_(open)));
if (openAt && openAt !== pid + '|' + col) { toast(text_('save-or-cancel-the-card-you')); return; }
if (CARD_EDIT && CARD_EDIT.pid === pid && (CARD_EDIT.col || cardColOf_(CARD_EDIT)) === col) return;
CARD_EDIT = cardEditFresh_(pid);
CARD_EDIT.col = col;
if (CARD_EDIT.own) CARD_EDIT.pic0 = cardPicNow_(t);
if (CARD_EDIT.own) CARD_EDIT.h0 = String(USER.handle || USER.name || '');
cardRemember_(CARD_EDIT);
const e = CARD_EDIT;
e.step = openStep_({ el, draw: cardRepaint_, undo: () => {
e.step = 0;
if (CARD_EDIT !== e) return;
const c = document.querySelector('.card-ed [data-do="card-cancel"][data-pid="' + CSS.escape(e.pid) + '"]') || document.querySelector('.card-ed [data-do="card-cancel"]');
if (c) c.click(); else cardClose_(e);
} });
});
function cardPicNow_(t) {
const p = (whose_() && whose_().profile) || {};
const v = Object.prototype.hasOwnProperty.call(p, 'photo') ? p.photo
: (whose_() && whose_().photo != null ? whose_().photo : (t && t.image));
return String(v == null ? '' : v).trim();
}
function cardSelfSaved_(e) {
if (!e || !e.own || !USER) return [];
const h0 = typeof e.h0 === 'string' ? e.h0 : String(USER.handle || USER.name || '');
const out = [];
if (typeof e.pic0 === 'string' && cardPicNow_() !== e.pic0) out.push('picture');
if (typeof e.h0 === 'string' && String(USER.handle || USER.name || '') !== e.h0) out.push('handle');
return out;
}
function cardSelfSay_(e) {
const l = cardSelfSaved_(e);
if (!l.length) return '';
const list = l.length === 1 ? l[0] : l.slice(0, -1).join(', ') + ' and ' + l[l.length - 1];
return 'Your ' + list + (l.length === 1 ? ' was saved as you chose it.' : ' were saved as you chose them.');
}
on('card-save', el => { cardSave_(el, false); });
function cardSave_(el, auto) {
const e = cardEditNow_();
const pane = el.closest('.pane');
const card = (el.closest('.card-ed')) || (pane && pane.querySelector('.card-ed'));
const form = card && card.querySelector('.me-form');
const sec = (card && card.dataset.sec) || '';
if (!e || !USER || !form || card.dataset.pid !== e.pid || String(el.dataset.pid || card.dataset.pid || '') !== e.pid) return;
const base = CARD_DRAWN.get(form.dataset.draw || '');
if (!base) { clearTimeout(AUTOSAVE_T.get(form)); cardRepaint_(); return; }
const t = ((DATA && DATA.tutors) || []).find(r => r && String(r.personId) === e.pid) || {};
const W = whose_();
profileSave_(form, { el, auto, base, own: e.own, lock: pane, target: { name: e.own ? W.name : (t.title || ''), id: e.pid },
done: ({ fields }) => {
cardPatchTutor_(e.pid, Object.assign({}, base, fields), fields);
if (auto) CARD_DRAWN.set(form.dataset.draw || '', Object.assign({}, base, fields));
},
after: ({ d, word, seatNo }) => {
if (auto) return;
cardClose_(e, pane, sec);
const part = (d && d.refused) || seatNo;
if (!d || d.changed === undefined || d.changed > 0) {
if (part) sayAfterLoad_(() => document.querySelector('.card-ed[data-pid="' + e.pid + '"][data-sec="' + sec + '"] .me-said'), word);
else { try { load(); } catch (x) { oops_(x, 'me:cardSelfSay_') } }
}
} })
.then(r => { if (r && r.nothing && !auto) { toast(cardSelfSay_(e) || 'Nothing had changed'); cardClose_(e, pane, sec); } });
}
on('card-cancel', el => {
const e = cardEditNow_();
const pane = el.closest('.pane');
const card = el.closest('.card-ed'), sec = (card && card.dataset.sec) || '';
if (!e || (pane && pane.classList.contains('is-sending'))) return;
if (pane && pane.querySelector('.card-ed .pfp.is-sending')) { toast(text_('your-picture-is-still-saving-cancel')); return; }
const was = typeof e.pic0 === 'string' ? e.pic0 : null;
const picBack = !!((!sec || sec === 'picture') && e.own && was != null && USER && cardPicNow_() !== was);
if (!picBack) { cardClose_(e, pane, sec); return; }
const form = (card || pane) && (card || pane).querySelector((card ? '' : '.card-ed ') + '.me-form');
const said = form && form.querySelector('.me-said');
profileSave_(form, { fields: { photo: was }, target: { name: USER.name, id: e.pid }, said, how: { button: el, where: said, lock: pane }, toast: false, tick: null,
done: ({ d }) => {
const got = (d && d.profile && d.profile.photo != null) ? String(d.profile.photo) : was;
if (d && d.profile) USER.profile = Object.assign({}, USER.profile || {}, d.profile);
pfpTake_(null, got);
cardClose_(e, pane, sec);
toast(text_('put-back-as-it-was-your'));
},
failed: () => {
const why = String((said && said.textContent) || '').trim();
cardClose_(e, pane, sec);
toast('Everything else is put back, but not your picture' + (why ? ': ' + why : '.'));
} });
});
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
const t = e.target;
const form = t && t.closest && t.closest('.card-ed .me-form');
if (!form) return;
form.dataset.dirty = '1';
cardSeatSync_(form, t, ev);
cardKeep_(form);
ceSums_(form);
}));
let PEOPLE_FORM_ = null;
const peopleRolePicks_ = () => 'student client tutor'.split(' ').map(r => (ROLE_PICKS.find(x => x[0] === r) || [r, r]).slice(0, 2))
.concat([['admin', 'Admin']]);
const peopleMay_ = () => typeof may_ === 'function' && may_('admin') && !!USER;
const peopleSelf_ = p => !!(USER && p && p.personId && String(p.personId) === String(USER.personId || ''));
function peopleOpts_(p) {
if (!peopleMay_() || !p || !p.personId || peopleSelf_(p)) return null;
const first = String(nameBesideHandle_(p.title, p.handle) || p.title || '').trim().split(' ')[0] || 'them';
return [typeof personEdMay_ === 'function' && personEdMay_() ? { icon: 'edit', label: 'Edit', note: 'their details', act: 'person-edit', tone: 'admin',
data: { id: p.personId, name: p.title || '' } } : null,
{ icon: 'bin', label: 'Delete', note: 'their account', act: 'person-del', tone: 'danger', data: { id: p.personId, name: first } },
{ icon: 'key', label: 'Show PIN', note: 'tap again to hide', act: 'pin-show', tone: 'admin', data: { id: p.personId } },
/^Client\b/.test(String(p.role || '')) ? { icon: 'send', label: 'Send last week', note: 'their child’s work, Mon–Sun',
act: 'digest-send-now', tone: 'admin', data: { id: p.personId } } : null];
}
const PEOPLE_ADD_ = { tutors: { role: 'tutor', say: 'Add a tutor' }, students: { role: 'student', say: text_('add-a-student') },
parents: { role: 'client', say: text_('add-a-parent') } };
function shareBarFor_(list, p) {
const has = f => (list || []).indexOf(f) !== -1;
if (!has('rate_per_hour') || !has('extra_seat_rate')) return '';
p = p || {};
return shareBarBox_(p.extra_seat_cut, cardShareBar_(num(p.rate_per_hour), p.extra_seat_rate, p.extra_seat_cut));
}
document.addEventListener('input', e => {
const form = e.target && e.target.closest && e.target.closest('.set-typed');
const bar = form && form.querySelector(':scope > .share-bar');
if (!bar) return;
const v = f => { const b = form.querySelector('[data-me="' + f + '"]'); return b ? b.value : ''; };
const cut = form.querySelector('[data-me="extra_seat_cut"]') ? v('extra_seat_cut') : bar.dataset.cut;
bar.innerHTML = cardShareBar_(num(v('rate_per_hour')), v('extra_seat_rate'), cut);
});
document.addEventListener('change', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('select[data-me="manager"]')) return;
const sec = t.closest('.ce-sec'), line = sec && sec.querySelector('details[data-fold="manager"] > summary .ce-v');
if (line) line.textContent = chainSay_(null, t.value);
});
;
/* js/me-people.js */
const pplG_ = (look, inner, more) => cardBlock_(Object.assign({ type: 'group', look, inner: [].concat(inner == null ? [] : inner).join('') }, more || {}));
const pplP_ = (look, text, more) => cardBlock_(Object.assign({ type: 'group', tag: 'p', look, text }, more || {}));
const pplCard_ = (hook, title, body, data) => setCard_({ hook, title, data, body: [].concat(body) });
function peopleAddPage_(col) {
if (!peopleMay_()) return '';
col = PEOPLE_ADD_[col] ? col : 'students';
const F = PEOPLE_FORM_, plus = addCard_({ act: 'person-add', label: PEOPLE_ADD_[col].say, data: { col } });
if (F && !F.id && (F.col || 'students') !== col) return plus;
if (F && !F.id && F.made) {
return pplCard_('person-made', F.made.first + ' is on the people tab', [pinSlip_(F.made.first, F.made.handle, F.made.pin),
pplP_('note', 'Write it down or read it to them — the PIN is not shown again.'),
tile_({ form: true, label: 'Done', act: 'person-cancel', kind: 'quiet' })]);
}
if (F && !F.id) return personFormHtml_(F);
return plus;
}
const PSEARCH_ALL_ = {};
const psState_ = col => PSEARCH_ALL_[col] || (PSEARCH_ALL_[col] = { q: '', asked: '', child: null, busy: false });
const PSEARCH_ = psState_('students');
const psFold_ = handleTyped_;
function psPublic_() {
const pool = [].concat(DATA.tutors || [], (typeof may_ === 'function' && may_('admin') && Array.isArray(DATA.everyone)) ? DATA.everyone : [],
Array.isArray(DATA.family) ? DATA.family : []);
const seen = {};
return pool.filter(p => p && p.handle && p.title && !seen[psFold_(p.handle)] && (seen[psFold_(p.handle)] = 1));
}
function psCard_(who, tiles) {
const first = String(nameBesideHandle_(who.title, who.handle) || who.title || '').trim();
return pplG_('ps-hit', [personFace_({ pic: who.image, avatar: who.avatar, handle: who.handle, name: first, personId: who.personId },
{ cls: 'kid-face', none: 'prof-none', size: 36 }),
pplP_('kid-who', [{ b: first }, { span: 'prof-handle', text: '@' + who.handle }], { inner: who.role ? qtag_(esc(who.role), '', 'ps-role') : '' }),
tiles ? pplG_('tile-row', tiles) : '']);
}
const psMayChild_ = () => typeof may_ === 'function' && may_('grownUp');
const psChildCol_ = col => isStudentsCol_(col) && psMayChild_();
function psResults_(col) {
const S = psState_(col || 'students'), q = psFold_(S.q);
if (!q) return '';
const pub = psPublic_().filter(p => psFold_(p.handle).indexOf(q) === 0).slice(0, 8);
const out = pub.map(p => psCard_(p, ''));
const exact = S.asked && S.asked === q;
if (S.busy) out.push(loading_());
else if (exact && S.child) {
const c = S.child, linked = kidsLinked_().some(f => String(f.personId) === String(c.personId));
out.push(psCard_({ title: c.first, handle: c.handle, avatar: c.avatar, personId: c.personId, role: 'Student' },
linked ? '' : tile_({ icon: 'join', label: 'Add as my child', note: 'they say yes first', act: 'ps-add-child',
data: { handle: c.handle } })));
}
if (!out.length) out.push(pplP_('note ps-none', exact ? 'Nobody has that handle.' : 'Nobody’s handle starts with that.'));
return out.join('');
}
function peopleSearchPage_(col) {
if (!USER) return '';
const c = col || 'students', S = psState_(c);
return pplCard_('ps-card', '', [
pplG_('ps-bar', searchPill_(`data-psearch aria-label="Find someone by handle" placeholder="@handle" autocapitalize="off" spellcheck="false" enterkeyhint="search" value="${esc(S.q)}"`)),
pplG_('ps-out', psResults_(c), { attrs: { 'aria-live': 'polite' } })], { 'ps-col': c });
}
const psColOf_ = el => { const card = el && el.closest ? el.closest('.ps-card') : null; return (card && card.getAttribute('data-ps-col')) || 'students'; };
let PS_PLACE_T_ = 0;
function psPaint_(col) {
const c = col || 'students';
document.querySelectorAll('.ps-card[data-ps-col="' + c + '"] .ps-out').forEach(out => { out.innerHTML = psResults_(c); });
clearTimeout(PS_PLACE_T_);
PS_PLACE_T_ = setTimeout(() => { try { if (typeof placeCells === 'function') placeCells(); } catch (e) { oops_(e, 'me:psPaint_') } }, 300);
}
document.addEventListener('input', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('[data-psearch]')) return;
const col = psColOf_(t);
psState_(col).q = t.value;
psPaint_(col);
});
document.addEventListener('keydown', e => {
const t = e.target;
if (e.key !== 'Enter' || !t || !t.matches || !t.matches('[data-psearch]')) return;
e.preventDefault();
psFind_(t);
});
function psFind_(el) {
const col = psColOf_(el);
if (!USER || !psChildCol_(col)) return;
const S = psState_(col), card = el && el.closest ? el.closest('.ps-card') : null, box = card && card.querySelector('[data-psearch]');
if (box) S.q = box.value;
const q = psFold_(S.q);
if (!HANDLE_SHAPE.test(q)) { toast(text_('handle-shape')); return; }
Object.assign(S, { asked: q, child: null, busy: true });
psPaint_(col);
send_({ action: 'findChild', personId: USER.personId || '', handle: q }, { button: box || el })
.then(d => { S.child = (d && d.child && d.child.handle) ? d.child : null; })
.catch(() => { S.asked = ''; })
.then(() => { S.busy = false; psPaint_(col); });
}
on('ps-add-child', el => {
if (!USER || !psMayChild_()) { toast(text_('err-sign-in-first')); return; }
const handle = el.getAttribute('data-handle') || '';
if (!handle) return;
send_({ action: 'claimChild', name: USER.name, personId: USER.personId || '', handle }, { button: el })
.then(() => { toast('Asked. They will see it when they next sign in.'); PSEARCH_.child = null; PSEARCH_.asked = ''; psPaint_('students'); load(); })
.catch(heldBy_);
});
function personFormFor_(p, col) {
const F = PEOPLE_FORM_;
return F && F.id && p && p.personId && String(p.personId) === F.id && (!col || !F.col || F.col === col) && peopleMay_() ? personFormHtml_(F) : '';
}
function personFormHtml_(F) {
const head = F.id ? 'Edit ' + ((F.data && F.data.person && F.data.person.firstName) || 'them') : 'A new person', pid = { pid: F.id };
if (!F.data) {
if (!F.asked && !F.err) { F.asked = true; setTimeout(() => personFetch_(F), 0); }
return pplCard_('person-form', head, F.err ? tile_({ form: true, label: 'Close', act: 'person-cancel', kind: 'quiet' }) : loading_(), pid);
}
const p = F.data.person || { firstName: '', lastName: '', roles: [F.role || 'student'], email: '', dob: '', parentIds: [] };
const choices = Array.isArray(F.data.parents) ? F.data.parents : [];
const nameOf = id => (choices.find(c => c.personId === id) || {}).name || id;
const has = (p.parentIds || []).filter(Boolean);
const kid = (p.roles || []).indexOf('student') !== -1;
const pv = { first: p.firstName, last: p.lastName, email: p.email, dob: p.dob };
const fo = { draftId: F.id || 'new', options: { roles: peopleRolePicks_().map(([r, label]) => [r, label, (p.roles || []).indexOf(r) !== -1]),
parents: has.map(id => [id, nameOf(id), true]),
parent: [['', 'None']].concat(choices.filter(c => has.indexOf(c.personId) === -1).map(c => [c.personId, c.name])) } };
return pplCard_('person-form', head, [
formOf_('person-form', pv, Object.assign({ skip: ['parents', 'parent'] }, fo)),
pplG_('pf-parents', formOf_('person-form', pv, Object.assign({ only: ['parents', 'parent'],
with: f => f === 'parent' && has.length ? { label: 'Another parent' } : {} }, fo)), { attrs: { hidden: !kid } }),
pplP_('note pf-said', '', { attrs: { 'aria-live': 'polite' } }),
pplG_('pf-go', [tile_({ form: true, label: F.id ? text_('save') : 'Add them', act: 'person-save' }),
tile_({ form: true, label: 'Cancel', act: 'person-cancel', kind: 'quiet' })])], pid);
}
function peopleRedraw_() {
PEOPLE_COLS_.forEach(c => { if (typeof AT !== 'undefined' && AT === c) repaint(true); else markStale_(c); });
}
function personFetch_(F) {
send_({ action: 'item', door: 'get', kind: 'person', ids: F.id ? [F.id] : [], personId: (USER && USER.personId) || '', targetId: F.id })
.then(d => { if (PEOPLE_FORM_ !== F) return; F.data = { person: d.person || null, parents: d.parents || [] }; peopleRedraw_(); })
.catch(e => { if (PEOPLE_FORM_ !== F) return; F.err = (e && e.message) || 'That could not be opened.'; peopleRedraw_(); });
}
on('person-add', el => {
if (!peopleMay_()) return;
const col = PEOPLE_ADD_[el && el.dataset && el.dataset.col] ? el.dataset.col : 'students';
PEOPLE_FORM_ = { id: '', col, role: PEOPLE_ADD_[col].role };
peopleRedraw_();
});
on('person-cancel', () => { PEOPLE_FORM_ = null; peopleRedraw_(); });
document.addEventListener('change', e => {
const t = e.target;
if (!t || !t.matches || !t.matches('.person-form [data-pf-role="student"]')) return;
const box = t.closest('.person-form').querySelector('.pf-parents');
if (box) box.hidden = !t.checked;
});
function peoplePut_(card, gone) {
const id = String(gone || (card && card.personId) || '');
if (!id || !DATA) return;
const tut = (DATA.tutors || []).find(t => t && String(t.personId) === id);
if (Array.isArray(DATA.tutors) && gone) DATA.tutors = DATA.tutors.filter(t => !(t && String(t.personId) === id));
else if (tut) Object.assign(tut, { title: card.title, handle: card.handle });
const list = Array.isArray(DATA.everyone) ? DATA.everyone.filter(p => !(p && String(p.personId) === id)) : [];
if (!gone && !tut) list.push(card);
DATA.everyone = list;
}
on('person-save', el => {
const F = PEOPLE_FORM_, form = el.closest('.person-form');
if (!F || !form || !peopleMay_()) return;
const val = k => ((form.querySelector('[data-pf="' + k + '"]') || {}).value || '').trim();
const roles = [...form.querySelectorAll('[data-pf-role]')].filter(x => x.checked).map(x => x.getAttribute('data-pf-role'));
const said = form.querySelector('.pf-said');
if (!val('first') || !val('last')) { if (said) tell_(said, 'info', 'A first name and a last name, please.'); return; }
if (!roles.length) { if (said) tell_(said, 'info', 'Tick at least one role.'); return; }
const parentIds = roles.indexOf('student') === -1 ? []
: [...form.querySelectorAll('[data-pf-parent]')].filter(x => x.checked).map(x => x.getAttribute('data-pf-parent'))
.concat(val('parent') ? [val('parent')] : []);
send_({ action: 'item', door: 'save', item: 'person', personId: USER.personId || '', targetId: F.id, firstName: val('first'),
lastName: val('last'), roles, email: val('email'), dob: val('dob'), parentIds },
{ button: el, where: said, lock: form })
.then(d => {
peoplePut_(d.person);
formDraftDrop_('person-form', { draftId: F.id || 'new' });
if (!F.id) { PEOPLE_FORM_ = { id: '', made: { first: d.first || val('first'), handle: d.handle || '', pin: d.pin || '' } }; }
else { PEOPLE_FORM_ = null; toast(text_('saved')); }
peopleRedraw_();
load();
})
.catch(() => {});
});
on('digest-send-now', el => {
if (!peopleMay_()) return;
const id = el.getAttribute('data-id') || '';
if (!id) return;
send_({ action: 'digestSendNow', personId: USER.personId || '', targetId: id }, { button: el })
.then(d => toast((d && d.said) || 'Sent.'))
.catch(() => {});
});
function pinHideAll_() {
document.querySelectorAll('.person-pin').forEach(n => n.remove());
}
on('pin-show', el => {
if (!peopleMay_()) return;
const id = el.getAttribute('data-id') || '';
const row = el.closest('.tile-row');
if (!id || !row) return;
const shown = row.nextElementSibling;
if (shown && shown.classList.contains('person-pin')) { shown.remove(); return; }
send_({ action: 'pinShow', personId: USER.personId || '', targetId: id }, { button: el })
.then(d => {
if (!d || !row.isConnected) return;
pinHideAll_();
const line = document.createElement('p');
line.className = 'note person-pin';
line.setAttribute('data-id', id);
line.innerHTML = cardRuns_(d.pin ? ['PIN ', { b: String(d.pin) }] : String(d.said || 'No PIN'));
row.after(line);
})
.catch(() => {});
});
on('person-del', el => {
if (!peopleMay_()) return;
const id = el.getAttribute('data-id') || '';
if (!id) return;
if (!sure_(el, 'Tap again to confirm')) return;
send_({ action: 'item', door: 'delete', item: 'person', personId: USER.personId || '', targetId: id }, { button: el })
.then(() => {
peoplePut_(null, id);
if (PEOPLE_FORM_ && PEOPLE_FORM_.id === id) PEOPLE_FORM_ = null;
toast((el.getAttribute('data-name') || 'They') + ' is deleted.');
peopleRedraw_();
load();
})
.catch(() => {});
});
let PERSON_ED_ = null;
const personEdMay_ = () => peopleMay_() && typeof uiMay_ === 'function' && uiMay_('edit-person');
const PE_BOXES_ = [['first_name', 'firstName'], ['last_name', 'lastName'], ['email', 'email'], ['phone', 'phone'], ['address', 'address'], ['postcode', 'postcode']];
const peNameOf_ = (id, d) => ((((DATA && DATA.everyone) || []).find(p => p && String(p.personId) === String(id)) || {}).title)
|| ((((d && d.parents) || []).find(c => c.personId === id)) || {}).name || id;
function personEdHtml_(p) {
const F = PERSON_ED_;
if (!F || !p || !p.personId || String(p.personId) !== F.id || !personEdMay_()) return '';
const done = tile_({ form: true, label: 'Done', act: 'person-edit-done', kind: 'quiet' });
const at = { attrs: { 'data-pid': F.id } };
if (!F.data) return pplG_('pe-form', F.err ? [pplP_('note pe-said', F.err), done] : loading_(), at);
const q = F.data.person || {};
const tutor = (q.roles || []).indexOf('tutor') !== -1;
const qv = f => f === 'handle' ? (q.handle ? '@' + q.handle : '') : q[(PE_BOXES_.find(b => b[0] === f) || [f, f])[1]] || '';
return pplG_('pe-form', [formOf_('person-edit', qv, { draftId: F.id }),
peFamHtml_(F), peNotifyHtml_(F),
tutor ? pplP_('note pe-fam', (q.listed === '' || TRUEish_(q.listed) ? 'Listed' : text_('not-listed')) + ': the eye on their tutor card changes it') : '',
pplP_('note pe-said', '', { attrs: { 'aria-live': 'polite' } }), done], at);
}
function peNotifyHtml_(F) {
const n = F.data && F.data.notify, opt = ((n && n.kinds) || []).filter(k => k && !k.essential);
if (!opt.length) return '';
return pplG_('pe-notify', [pplP_('note pe-fam', 'Notifications they get'), formOf_('notify', null, { options: { kinds: opt.map(k => ({ act: 'pe-notify', data: { kind: k.kind },
on: !!k.on, label: k.label, note: k.note || '' })) } })]);
}
on('pe-notify', el => {
const F = PERSON_ED_, kind = String((el && el.dataset.kind) || ''), want = !!(el && el.checked);
if (!F || !F.data || !kind || !personEdMay_()) return;
const said = el.closest('.pe-form') && el.closest('.pe-form').querySelector('.pe-said');
send_({ action: 'item', door: 'save', item: 'notify', personId: (USER && USER.personId) || '', targetId: F.id, kind, on: want }, { where: said || undefined, saying: 'Saving…', lock: el.closest('label') || el })
.then(d => {
const on = d && typeof d.on === 'boolean' ? d.on : want;
if (PERSON_ED_ === F && F.data.notify) F.data.notify = Object.assign({}, F.data.notify, { kinds: (F.data.notify.kinds || []).map(k => k.kind === kind ? Object.assign({}, k, { on }) : k) });
el.checked = on;
if (said) tell_(said, 'saved', text_('saved'));
})
.catch(e => { el.checked = !want; if (said) tell_(said, 'error', why_(e)); });
});
function peFields_(form) {
const v = f => { const b = form.querySelector('[data-pe="' + f + '"]'); return b && !b.disabled ? String(b.value || '').trim() : null; };
const out = {};
PE_BOXES_.forEach(([f]) => { if (f !== 'phone' && v(f) !== null) out[f] = v(f); });
const ph = v('phone');
if (ph !== null) Object.assign(out, phoneOut(ph));
const dob = v('dob');
if (dob !== null) { const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob) || ['', '', '', '']; out.dob_y = m[1]; out.dob_m = m[2]; out.dob_d = m[3]; }
return out;
}
const PE_WAIT_ = new WeakMap();
const peLater_ = form => { clearTimeout(PE_WAIT_.get(form)); PE_WAIT_.set(form, setTimeout(() => peSave_(form), 700)); };
function peSave_(form) {
const F = PERSON_ED_;
if (!form.isConnected || !F || !F.data || form.dataset.pid !== F.id || !personEdMay_()) return;
if (form.classList.contains('is-sending')) { peLater_(form); return; }
const fields = peFields_(form), said = form.querySelector('.pe-said'), key = JSON.stringify(fields);
if (key === F.sent) return;
form.classList.add('is-sending');
profileSave_(form, { fields, target: { name: F.name || '', id: F.id }, said, how: { where: said }, toast: false, tick: null,
done: ({ word }) => { F.sent = key; F.moved = true; formDraftDrop_('person-edit', { draftId: F.id }); if (said) tell_(said, 'saved', '✓ ' + word); } })
.then(() => form.classList.remove('is-sending'));
}
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
const form = e.target && e.target.closest && e.target.closest('.pe-form');
if (form && e.target.hasAttribute('data-pe')) peLater_(form);
}));
function peRedraw_() {
peopleRedraw_();
try { if (typeof paintStuff === 'function' && typeof FINDER !== 'undefined') inFinder_(FINDER, () => paintStuff(true)); } catch (e) { oops_(e, 'person-edit:redraw'); }
}
on('person-edit', el => {
if (!personEdMay_()) return;
const id = el.getAttribute('data-id') || '';
if (!id) return;
if (PERSON_ED_ && PERSON_ED_.id === id) return;
if (PERSON_ED_) peDone_();
const F = { id, name: el.getAttribute('data-name') || '', data: null };
F.step = openStep_({ el, draw: () => { PERSON_ED_ = F; peRedraw_(); }, undo: () => { F.step = 0; if (PERSON_ED_ === F) peDone_(); } });
send_({ action: 'item', door: 'get', kind: 'person', ids: [id], personId: USER.personId || '', targetId: id })
.then(d => { if (PERSON_ED_ !== F) return; F.data = { person: d.person || {}, parents: d.parents || [], notify: d.notify || null }; peRedraw_(); })
.catch(e => { if (PERSON_ED_ !== F) return; F.err = (e && e.message) || 'Their details could not be opened.'; peRedraw_(); });
});
function peDone_() {
const F = PERSON_ED_;
document.querySelectorAll('.pe-form').forEach(f => { clearTimeout(PE_WAIT_.get(f)); peSave_(f); });
PERSON_ED_ = null;
if (F && F.step) { const id = F.step; F.step = 0; stepDone_(id, false); }
peRedraw_();
if (F && F.moved && typeof load === 'function') load();
}
on('person-edit-done', () => peDone_());
const FAM_WANT_ = { student: /student/i, client: /client|parent/i, any: /(?:)/ };
const famIs_ = (p, want) => (FAM_WANT_[want] || FAM_WANT_.client).test(String((p && p.role) || ''));
function famHits_(q, want, skip) {
q = String(q || '').trim().toLowerCase().replace(/^@/, '');
if (!q) return [];
return ((DATA && DATA.everyone) || []).filter(p => p && p.personId && famIs_(p, want) && (skip || []).indexOf(String(p.personId)) === -1
&& [p.title, p.name, p.handle].filter(Boolean).join(' ').toLowerCase().indexOf(q) !== -1).slice(0, 6);
}
const FAM_ACT_ = { pa: { act: 'pa-pick', skip: () => ((PERSON_ADD_ && PERSON_ADD_.picked) || []).map(x => x.id) },
pe: { act: 'pe-link', skip: () => peLinked_().concat([String((PERSON_ED_ || {}).id || '')]) },
lens: { act: 'lens-pick', skip: () => [String((USER || {}).personId || '')] } };
const famPick_ = (scope, want, label) => pplG_('fam-pick', [formOf_('family-pick', null, { vars: { scope, want }, label }),
pplG_('tile-row fam-hits', '', { attrs: { 'data-fam-hits': scope } })]);
document.addEventListener('input', e => {
const box = e.target;
if (!box || !box.matches || !box.matches('[data-fam-q]')) return;
const scope = box.getAttribute('data-fam-q'), want = box.getAttribute('data-fam-want');
const out = box.closest('.fam-pick') && box.closest('.fam-pick').querySelector('.fam-hits');
if (!out) return;
const at = FAM_ACT_[scope] || FAM_ACT_.pe;
out.innerHTML = famHits_(box.value, want, at.skip()).map(p => tile_({ form: true, kind: 'quiet', label: fmtName_(p) + (p.handle ? ' @' + p.handle : ''),
act: at.act, data: { id: p.personId, name: fmtName_(p), want } })).join('');
});
let PERSON_ADD_ = null;
const personAddMay_ = () => peopleMay_() && typeof uiMay_ === 'function' && uiMay_('add-person');
const PA_ROLES_ = [['student', 'Student'], ['client', 'Parent'], ['tutor', 'Tutor'], ['contact', 'Contact']];
const paState_ = () => PERSON_ADD_ || (PERSON_ADD_ = { role: 'student', v: {}, picked: [] });
function paPickedHtml_(F) {
return pplG_('pa-picked', F.picked.map(x => pplG_('tile-row', [cardBlock_({ type: 'group', tag: 'span', look: 'note', text: x.name }),
tile_({ form: true, kind: 'quiet', label: 'Remove', act: 'pa-unpick', data: { id: x.id } })])));
}
function personAddCard_() {
if (!personAddMay_()) return '';
const F = paState_();
if (F.made) {
return pplCard_('is-prof pa-card', F.made.first + ' is added', [
F.made.pin ? pinSlip_(F.made.first, F.made.handle, F.made.pin) + pplP_('note', 'Write it down or read it to them — the PIN is not shown again.')
: pplP_('note', `The PIN went to ${F.made.email}, with the handle @${F.made.handle}.`),
F.made.said ? pplP_('note', F.made.said) : '',
tile_({ form: true, label: 'Add another', act: 'pa-again', kind: 'quiet' })]);
}
const kid = F.role === 'student', tutor = F.role === 'tutor';
return pplCard_('is-prof pa-card', 'Add a person', [formOf_('person-add', Object.assign({}, F.v, { role: F.role }), { kid, options: { role: PA_ROLES_ }, was: () => '' }),
tutor ? '' : famPick_('pa', kid ? 'client' : 'student', kid ? 'Their parent' : 'Their child') + paPickedHtml_(F),
pplP_('note pa-said', '', { attrs: { 'aria-live': 'polite' } }),
pplG_('pf-go', tile_({ form: true, label: 'Add them', act: 'pa-save' }))]);
}
const paRedraw_ = () => { try { if (typeof paintStuff === 'function' && typeof FINDER !== 'undefined') inFinder_(FINDER, () => paintStuff(true)); } catch (e) { oops_(e, 'add-person:redraw'); } };
['input', 'change'].forEach(ev => document.addEventListener(ev, e => {
const k = e.target && e.target.getAttribute && e.target.getAttribute('data-pa');
if (!k) return;
const F = paState_();
if (k !== 'role') { F.v[k] = e.target.value; return; }
if (ev !== 'change' || e.target.value === F.role) return;
F.role = e.target.value; F.picked = [];
paRedraw_();
}));
const paPickedPaint_ = el => { const box = el && el.closest('.pa-card'), at = box && box.querySelector('.pa-picked'); if (at) at.outerHTML = paPickedHtml_(paState_()); };
on('pa-pick', el => {
const F = paState_(), id = el.getAttribute('data-id') || '', card = el.closest('.pa-card');
if (!id || F.picked.some(x => x.id === id)) return;
F.picked.push({ id, name: el.getAttribute('data-name') || id });
const q = card && card.querySelector('[data-fam-q]'), hits = card && card.querySelector('.fam-hits');
if (q) q.value = '';
if (hits) hits.innerHTML = '';
paPickedPaint_(q || card);
});
on('pa-unpick', el => { const F = paState_(), id = el.getAttribute('data-id'); F.picked = F.picked.filter(x => x.id !== id); paPickedPaint_(el); });
on('pa-again', () => { PERSON_ADD_ = null; paRedraw_(); });
on('pa-save', el => {
const F = paState_(), card = el.closest('.pa-card');
if (!card || !personAddMay_()) return;
const val = k => String(F.v[k] || (card.querySelector('[data-pa="' + k + '"]') || {}).value || '').trim(), said = card.querySelector('.pa-said');
if (!val('first') || !val('last')) { if (said) tell_(said, 'info', 'A first name and a last name, please.'); return; }
if (F.role !== 'student' && !val('email')) { if (said) tell_(said, 'info', 'An email, please — the PIN goes there.'); return; }
const ids = F.picked.map(x => x.id);
send_({ action: 'item', door: 'save', item: 'person', personId: USER.personId || '', targetId: '', firstName: val('first'), lastName: val('last'),
roles: [F.role], email: val('email'), dob: val('dob'), parentIds: F.role === 'student' ? ids : [], invite: false },
{ button: el, where: said, lock: card })
.then(d => {
const pid = String((d.person && d.person.personId) || '');
formDraftDrop_('person-add');
peoplePut_(d.person);
const kids = F.role === 'client' && pid ? ids : [];
return Promise.all(kids.map(cid => send_({ action: 'linkChild', personId: USER.personId || '', parentId: pid, childId: cid })
.then(() => '', e => (e && e.message) || 'a link failed')))
.then(fails => {
const bad = fails.filter(Boolean);
PERSON_ADD_ = { role: F.role, v: {}, picked: [], made: { first: d.first || val('first'), handle: d.handle || '', pin: d.pin || '', email: val('email'),
said: bad.length ? 'Made, but not linked to every child: ' + bad[0] : '' } };
paRedraw_();
load();
});
})
.catch(() => {});
});
const peLinked_ = () => { const q = (PERSON_ED_ && PERSON_ED_.data && PERSON_ED_.data.person) || {}; return [].concat(q.parentIds || [], q.childIds || []).map(String); };
function peFamHtml_(F) {
const q = (F.data && F.data.person) || {}, roles = q.roles || [];
const side = (say, key, want, mine, add) => {
const ids = (q[key] || []).filter(Boolean);
if (!ids.length && roles.indexOf(mine) === -1) return '';
return pplP_('note pe-fam', say) + ids.map(id => pplG_('tile-row', [cardBlock_({ type: 'group', tag: 'span', look: 'note', text: fmtName_(peNameOf_(id, F.data)) }),
tile_({ form: true, kind: 'quiet', label: 'Remove', act: 'pe-unlink', data: { id, side: key } })])).join('') + famPick_('pe', want, add);
};
return pplG_('pe-fambox', [side('Linked parents', 'parentIds', 'client', 'student', text_('add-a-parent')), side('Linked children', 'childIds', 'student', 'client', 'Add a child')]);
}
const peFamPaint_ = form => { const at = form && form.querySelector('.pe-fambox'); if (at && PERSON_ED_) at.outerHTML = peFamHtml_(PERSON_ED_); };
const peWho_ = (F, other, side) => (side === 'parentIds' ? { parentId: other, childId: F.id } : { parentId: F.id, childId: other });
function peFamSend_(el, action, side, after) {
const F = PERSON_ED_, other = el.getAttribute('data-id') || '', form = el.closest('.pe-form');
if (!F || !F.data || !other || !form || !personEdMay_()) return;
const said = form.querySelector('.pe-said');
send_(Object.assign({ action, personId: USER.personId || '' }, peWho_(F, other, side)), { button: el, where: said })
.then(() => { const p = F.data.person; p[side] = after(p[side] || [], other); F.moved = true; if (said) tell_(said, 'info', '✓ Saved'); peFamPaint_(form); })
.catch(() => {});
}
on('pe-link', el => peFamSend_(el, 'linkChild', el.getAttribute('data-want') === 'client' ? 'parentIds' : 'childIds', (l, id) => l.concat([id])));
on('pe-unlink', el => sure_(el, 'Tap again to confirm') && peFamSend_(el, 'adminUnlinkFamily', el.getAttribute('data-side') || '', (l, id) => l.filter(x => String(x) !== id)));
;
/* js/messages.js */
function pic(url) {
const u = String(url || '').trim();
if (!u) return '';
const id = (u.match(/\/file\/d\/([\w-]{20,})/) || u.match(/[?&]id=([\w-]{20,})/) || [])[1];
return id ? 'https://lh3.googleusercontent.com/d/' + id + '=w1200' : u;
}
const profileOf_ = id => { const r = id && ['people', 'tutors', 'family', 'students', 'clients', 'everyone'].map(k => ((DATA || {})[k] || []).find(x => x && String(x.personId || x.person_id || '') === String(id))).find(Boolean);
return r ? { pic: r.image != null ? r.image : r.photo, avatar: r.avatar, handle: r.handle } : null; };
const CAM_VID_MAX = 20 * 1048576;
function camItemOf_(file) {
return new Promise(done => {
const type = String((file && file.type) || '');
if (/^video\//i.test(type)) {
if (file.size > CAM_VID_MAX) { done(null); return; }
const r = new FileReader();
r.onload = () => done({ kind: 'video', data: String(r.result || '') });
r.onerror = () => done(null);
try { r.readAsDataURL(file); } catch (e) { done(null); }
return;
}
if (!/^image\//i.test(type)) { done(null); return; }
let url = '';
try { url = URL.createObjectURL(file); } catch (e) { done(null); return; }
const img = new Image();
img.onload = () => {
const k = Math.min(1, 1600 / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
const cv = document.createElement('canvas');
cv.width = Math.max(1, Math.round(img.naturalWidth * k));
cv.height = Math.max(1, Math.round(img.naturalHeight * k));
cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
URL.revokeObjectURL(url);
try { done({ kind: 'image', data: cv.toDataURL('image/jpeg', 0.85) }); } catch (e) { done(null); }
};
img.onerror = () => { URL.revokeObjectURL(url); done(null); };
img.src = url;
});
}
function stamp_() {
return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}
const tutorLink_ = t => location.origin + location.pathname + '?tutor=' + encodeURIComponent(String((t && t.handle) || ''));
let TUTOR_PNG_BUSY = false;
on('tutor-share', el => {
const handle = String(el.dataset.handle || '');
if (!handle || TUTOR_PNG_BUSY) return;
const t = (DATA.tutors || []).find(x => x && String(x.handle || '') === handle)
|| (USER && USER.handle === handle ? tutorPngMe_() : { handle, title: '@' + handle });
const url = tutorLink_({ handle });
TUTOR_PNG_BUSY = true;
toast(text_('making-a-picture-of-this-profile'));
tutorPng_(t)
.then(blob => tutorPngHand_(blob, handle + '-profile.png', url, t.title || '@' + handle, el.closest && el.closest('.card, .qcard')))
.catch(rcShareFail_)
.then(() => { TUTOR_PNG_BUSY = false; }, () => { TUTOR_PNG_BUSY = false; });
});
function tutorPngMe_() {
const p = (USER && USER.profile) || {};
return { handle: USER.handle, title: USER.name, image: p.photo || USER.photo || '', avatar: USER.avatar || '',
personId: USER.personId, role: 'Tutor', description: p.headline ? '"' + p.headline + '"' : '' };
}
function tutorPngHand_(blob, name, url, title, at) {
const file = typeof File === 'function' ? new File([blob], name, { type: 'image/png' }) : null;
const can = !!(file && navigator.share && navigator.canShare
&& (() => { try { return navigator.canShare({ files: [file] }); } catch (e) { return false; } })());
const save = () => {
const href = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = href; a.download = name;
document.body.appendChild(a); a.click(); a.remove();
setTimeout(() => URL.revokeObjectURL(href), 60000);
const copy = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(url) : Promise.reject();
return copy.then(() => toast(text_('image-saved-link-copied')), () => toast('Image saved · ' + url));
};
if (!can) return save();
const offer = () => (at && typeof rcOffer_ === 'function' ? rcOffer_(blob, name, at, title) : save());
if (navigator.userActivation && !navigator.userActivation.isActive) return offer();
return navigator.share({ files: [file], title }).catch(e => { if (!e || e.name !== 'AbortError') return e && e.name === 'NotAllowedError' ? offer() : save(); });
}
function tutorPng_(t) {
const host = document.createElement('div');
host.className = 'tpng-host';
host.setAttribute('aria-hidden', 'true');
const was = CARD_VIEWER; CARD_VIEWER = 'public';
try { host.innerHTML = findCard({ kind: 'tutor', key: t.title || '', name: t.title || '', row: t }); } finally { CARD_VIEWER = was; }
const card = host.firstElementChild;
if (!card) return Promise.reject(new Error('no card'));
host.style.width = tpngWidth_(t) + 'px';
document.body.appendChild(host);
return tpngInline_(card).then(() => rcPng_(card)).then(r => r.blob)
.then(b => { host.remove(); return b; }, e => { host.remove(); throw e; });
}
function tpngWidth_(t) {
const px = el => { const w = el ? parseFloat(getComputedStyle(el).width) : 0; return w > 0 ? w : 0; };
const cards = [...document.querySelectorAll('.card.is-prof')].filter(el => !el.closest('.tpng-host') && px(el));
const own = h => ((h.querySelector('.prof-handle') || {}).textContent || '') === '@' + (t && t.handle);
const shown = cards.find(own) || cards[0];
if (shown) return px(shown);
const any = [...document.querySelectorAll('.screen .card, section .card')].find(el => !el.closest('.tpng-host') && px(el));
return any ? px(any) : 24 * (parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
}
function tpngInline_(card) {
const asData = src => fetch(src, { mode: 'cors' }).then(r => (r.ok ? r.blob() : Promise.reject(new Error(r.status))))
.then(b => new Promise((ok, no) => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.onerror = () => no(fr.error); fr.readAsDataURL(b); }));
const safe = src => { try { return asData(src); } catch (e) { return Promise.reject(e); } };
const imgs = [...card.querySelectorAll('img')].map(img => {
const src = img.getAttribute('src') || '';
const got = /^data:/.test(src) ? Promise.resolve(src) : safe(img.src);
return got.then(d => { img.removeAttribute('loading'); img.setAttribute('src', d);
return img.decode ? img.decode().catch(() => img.remove()) : null; }, () => { img.remove(); });
});
const maps = [...card.querySelectorAll('.prof-heat')].map(heat => {
const drop = () => {
const cap = heat.previousElementSibling, next = heat.nextElementSibling;
heat.remove();
if (cap && cap.classList.contains('prof-cap') && !(next && next.classList.contains('prof-tags'))) cap.remove();
};
const tiles = heat.querySelector('.heat-tiles');
const css = tiles ? tiles.style.backgroundImage : '';
const urls = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m => m[1]);
if (!urls.length) { drop(); return null; }
return Promise.all(urls.map(safe)).then(ds => {
tiles.style.backgroundImage = ds.map(d => 'url("' + d + '")').join(',');
return Promise.all(ds.map(d => { const i = new Image(); i.src = d; return i.decode ? i.decode() : null; }));
}).catch(drop);
});
const fonts = document.fonts && document.fonts.ready ? document.fonts.ready.catch(() => {}) : null;
return Promise.all(imgs.concat(maps, [fonts]));
}
let TUTOR_LINK_DONE = false;
function openSharedTutor() {
if (TUTOR_LINK_DONE) return;
let h = '';
try { h = String(new URLSearchParams(location.search).get('tutor') || '').replace(/^@+/, '').toLowerCase(); } catch (e) { h = ''; }
if (!h) { TUTOR_LINK_DONE = true; return; }
const t = (DATA.tutors || []).find(x => x && x.listed !== false && String(x.handle || '').toLowerCase() === h);
if (!t) return;
TUTOR_LINK_DONE = true;
const item = { kind: 'tutor', name: t.title, key: t.title, row: t };
openStep_({ title: t.title, html: cardBlock_({ type: 'group', look: 'tutor-link', inner: (typeof findCard === 'function' ? findCard(item) : '') + tileRow_(tile_(tutorOpts_(item))) }) });
}
;
/* js/links.js */
const PFP_PICTURES = SHARED_SETTINGS.pictures;
const PFP_PREFIX = 'pfp:';
const PFP_ART = {
fox: { name: 'Fox', ground: '--pfp-blue', art: [
{ t: 'path', d: 'M11 9l9 9-6 7z', fill: '--pfp-fox' },
{ t: 'path', d: 'M37 9l-9 9 6 7z', fill: '--pfp-fox' },
{ t: 'path', d: 'M13.5 13l4.5 5-3 3.5z', fill: '--pfp-fox-dark' },
{ t: 'path', d: 'M34.5 13L30 18l3 3.5z', fill: '--pfp-fox-dark' },
{ t: 'path', d: 'M10 20q14-8 28 0l-3 12-11 8-11-8z', fill: '--pfp-fox' },
{ t: 'path', d: 'M15 29l9 11 9-11q-9 4-18 0z', fill: '--pfp-white' },
{ t: 'circle', cx: '18.5', cy: '25', r: '2', fill: '--pfp-ink' },
{ t: 'circle', cx: '29.5', cy: '25', r: '2', fill: '--pfp-ink' },
{ t: 'circle', cx: '24', cy: '37', r: '2', fill: '--pfp-ink' }] },
owl: { name: 'Owl', ground: '--pfp-teal', art: [
{ t: 'path', d: 'M12 18l2-9 6 6z', fill: '--pfp-owl' },
{ t: 'path', d: 'M36 18l-2-9-6 6z', fill: '--pfp-owl' },
{ t: 'ellipse', cx: '24', cy: '27', rx: '13', ry: '14', fill: '--pfp-owl' },
{ t: 'ellipse', cx: '24', cy: '33', rx: '7.5', ry: '7', fill: '--pfp-owl-pale' },
{ t: 'circle', cx: '18.5', cy: '22', r: '5.2', fill: '--pfp-white' },
{ t: 'circle', cx: '29.5', cy: '22', r: '5.2', fill: '--pfp-white' },
{ t: 'circle', cx: '18.5', cy: '22.5', r: '2.6', fill: '--pfp-ink' },
{ t: 'circle', cx: '29.5', cy: '22.5', r: '2.6', fill: '--pfp-ink' },
{ t: 'path', d: 'M21.5 27h5L24 31z', fill: '--pfp-beak' }] },
cat: { name: 'Cat', ground: '--pfp-pink', art: [
{ t: 'path', d: 'M11 22l2-13 9 6z', fill: '--pfp-slate' },
{ t: 'path', d: 'M37 22l-2-13-9 6z', fill: '--pfp-slate' },
{ t: 'path', d: 'M14 18l1-5 4 3z', fill: '--pfp-pink-pale' },
{ t: 'path', d: 'M34 18l-1-5-4 3z', fill: '--pfp-pink-pale' },
{ t: 'ellipse', cx: '24', cy: '27', rx: '14', ry: '12', fill: '--pfp-slate' },
{ t: 'ellipse', cx: '18.5', cy: '25', rx: '2.2', ry: '3', fill: '--pfp-lime' },
{ t: 'ellipse', cx: '29.5', cy: '25', rx: '2.2', ry: '3', fill: '--pfp-lime' },
{ t: 'ellipse', cx: '18.5', cy: '25.3', rx: '.9', ry: '2.3', fill: '--pfp-ink' },
{ t: 'ellipse', cx: '29.5', cy: '25.3', rx: '.9', ry: '2.3', fill: '--pfp-ink' },
{ t: 'path', d: 'M22 30h4l-2 2.4z', fill: '--pfp-pink-pale' },
{ t: 'path', d: 'M8 30l9 1M8 34l9-1.5M40 30l-9 1M40 34l-9-1.5', stroke: '--pfp-white', 'stroke-width': '1.3', 'stroke-linecap': 'round' }] },
dino: { name: 'Dinosaur', ground: '--pfp-yellow', art: [
{ t: 'path', d: 'M15 23l2-4 2 4zM20 20l2-4.5 2 4.5zM25 19.5l2-4 2 4z', fill: '--pfp-green-dark' },
{ t: 'path', d: 'M7 26q4 6 9 2', stroke: '--pfp-green', 'stroke-width': '4.5', fill: 'none', 'stroke-linecap': 'round' },
{ t: 'ellipse', cx: '22', cy: '29', rx: '11', ry: '8', fill: '--pfp-green' },
{ t: 'path', d: 'M26 25q2-11 10-12 6 0 5.5 5.5-.5 3.5-6.5 3.5L31 29z', fill: '--pfp-green' },
{ t: 'rect', x: '15', y: '34', width: '4.5', height: '7', rx: '2', fill: '--pfp-green-dark' },
{ t: 'rect', x: '24', y: '34', width: '4.5', height: '7', rx: '2', fill: '--pfp-green-dark' },
{ t: 'circle', cx: '36.5', cy: '16.5', r: '1.7', fill: '--pfp-ink' },
{ t: 'path', d: 'M37 20.5h3', stroke: '--pfp-ink', 'stroke-width': '1.2', 'stroke-linecap': 'round' }] },
robot: { name: 'Robot', ground: '--pfp-coral', art: [
{ t: 'path', d: 'M24 13V9', stroke: '--pfp-aerial', 'stroke-width': '2' },
{ t: 'circle', cx: '24', cy: '8', r: '2.4', fill: '--pfp-red' },
{ t: 'rect', x: '9', y: '19', width: '3.5', height: '9', rx: '1.5', fill: '--pfp-steel' },
{ t: 'rect', x: '35.5', y: '19', width: '3.5', height: '9', rx: '1.5', fill: '--pfp-steel' },
{ t: 'rect', x: '12', y: '13', width: '24', height: '21', rx: '5', fill: '--pfp-steel-pale' },
{ t: 'circle', cx: '18.5', cy: '22', r: '3.6', fill: '--pfp-ink' },
{ t: 'circle', cx: '29.5', cy: '22', r: '3.6', fill: '--pfp-ink' },
{ t: 'circle', cx: '18.5', cy: '22', r: '2.2', fill: '--pfp-cyan' },
{ t: 'circle', cx: '29.5', cy: '22', r: '2.2', fill: '--pfp-cyan' },
{ t: 'rect', x: '17', y: '27.5', width: '14', height: '3.6', rx: '1.6', fill: '--pfp-ink' },
{ t: 'path', d: 'M20.5 27.5v3.6M24 27.5v3.6M27.5 27.5v3.6', stroke: '--pfp-steel-pale', 'stroke-width': '1' },
{ t: 'rect', x: '16', y: '35', width: '16', height: '7', rx: '2', fill: '--pfp-steel' }] },
rocket: { name: 'Rocket', ground: '--pfp-night', art: [
{ t: 'circle', cx: '11', cy: '14', r: '1.2', fill: '--pfp-white' },
{ t: 'circle', cx: '37.5', cy: '12', r: '1', fill: '--pfp-white' },
{ t: 'circle', cx: '38', cy: '33', r: '1.2', fill: '--pfp-white' },
{ t: 'circle', cx: '9.5', cy: '31', r: '1', fill: '--pfp-white' },
{ t: 'path', d: 'M19.5 33q4.5 12 9 0z', fill: '--pfp-flame' },
{ t: 'path', d: 'M21.8 33q2.2 6.5 4.4 0z', fill: '--pfp-flame-hot' },
{ t: 'path', d: 'M17.5 25L11 34l6.5-1.5zM30.5 25L37 34l-6.5-1.5z', fill: '--pfp-red' },
{ t: 'path', d: 'M24 6q7 7 7 19v8H17v-8q0-12 7-19z', fill: '--pfp-hull' },
{ t: 'path', d: 'M24 6q5 4.5 6.3 10H17.7Q19 10.5 24 6z', fill: '--pfp-red' },
{ t: 'circle', cx: '24', cy: '22.5', r: '3.6', fill: '--pfp-window', stroke: '--pfp-rim', 'stroke-width': '1.4' }] },
planet: { name: 'Planet', ground: '--pfp-violet', art: [
{ t: 'circle', cx: '10', cy: '12', r: '1.1', fill: '--pfp-white' },
{ t: 'circle', cx: '38', cy: '38', r: '1.1', fill: '--pfp-white' },
{ t: 'circle', cx: '36', cy: '10', r: '.9', fill: '--pfp-white' },
{ t: 'ellipse', cx: '24', cy: '25', rx: '17', ry: '5.5', transform: 'rotate(-18 24 25)', fill: 'none', stroke: '--pfp-yellow', 'stroke-width': '2.6' },
{ t: 'circle', cx: '24', cy: '24', r: '10', fill: '--pfp-planet' },
{ t: 'path', d: 'M15 21q9 3 18-1M14.5 27q9 3 19-1', stroke: '--pfp-planet-band', 'stroke-width': '2', fill: 'none', 'stroke-linecap': 'round' },
{ t: 'path', d: 'M7.83 30.25A17 5.5-18 0 0 40.17 19.75', fill: 'none', stroke: '--pfp-yellow', 'stroke-width': '2.6' }] },
football: { name: 'Football', ground: '--pfp-pitch', art: [
{ t: 'circle', cx: '24', cy: '24', r: '14', fill: '--pfp-white', stroke: '--pfp-ink', 'stroke-width': '1.6' },
{ t: 'path', d: 'M24 18.5l5.2 3.8-2 6.1h-6.4l-2-6.1z', fill: '--pfp-ink' },
{ t: 'path', d: 'M24 18.5V11M29.2 22.3l7-2.3M27.2 28.4l4.3 6M20.8 28.4l-4.3 6M18.8 22.3l-7-2.3', stroke: '--pfp-ink', 'stroke-width': '1.4' },
{ t: 'path', d: 'M20.5 10.6L24 11l3.5-.4L24 10z', fill: '--pfp-ink' },
{ t: 'path', d: 'M36.6 17.7l-.4 4.5 1.6 1.1q.4-3-1.2-5.6zM34.4 33.6l-2.9-.7-1.6 2.6q2.8-.3 4.5-1.9zM13.6 33.6l2.9-.7 1.6 2.6q-2.8-.3-4.5-1.9zM11.4 17.7l.4 4.5-1.6 1.1q-.4-3 1.2-5.6z', fill: '--pfp-ink' }] },
guitar: { name: 'Guitar', ground: '--pfp-brick', art: [
{ t: 'g', transform: 'rotate(35 24 24)', kids: [
{ t: 'rect', x: '22.4', y: '5', width: '3.2', height: '18', fill: '--pfp-wood' },
{ t: 'rect', x: '21', y: '2.5', width: '6', height: '5.5', rx: '1.2', fill: '--pfp-wood-dark' },
{ t: 'circle', cx: '24', cy: '23', r: '6.4', fill: '--pfp-wood-pale' },
{ t: 'circle', cx: '24', cy: '32', r: '8.2', fill: '--pfp-wood-pale' },
{ t: 'circle', cx: '24', cy: '26.5', r: '2.6', fill: '--pfp-wood-dark' },
{ t: 'rect', x: '20.5', y: '33.5', width: '7', height: '2', rx: '1', fill: '--pfp-wood-dark' },
{ t: 'path', d: 'M23.2 6v28M24.8 6v28', stroke: '--pfp-string', 'stroke-width': '.6' }] }] },
palette: { name: 'Paint palette', ground: '--pfp-sky', art: [
{ t: 'path', d: 'M24 9c11 0 18 7 17 15-1 6-7 5-9 9-2 5-6 7-10 6C13 38 7 31 8 23 9 15 15 9 24 9z', fill: '--pfp-board' },
{ t: 'ellipse', cx: '27', cy: '32', rx: '3', ry: '2.4', fill: '--pfp-sky' },
{ t: 'circle', cx: '16', cy: '19.5', r: '3.2', fill: '--pfp-red' },
{ t: 'circle', cx: '22.5', cy: '14.5', r: '3.2', fill: '--pfp-yellow' },
{ t: 'circle', cx: '30.5', cy: '15', r: '3.2', fill: '--pfp-green' },
{ t: 'circle', cx: '35.5', cy: '21.5', r: '3.2', fill: '--pfp-paint-blue' },
{ t: 'circle', cx: '14', cy: '27.5', r: '3.2', fill: '--pfp-purple' }] },
};
function pfpChoice_(v) {
const m = /^pfp:([a-z]+)$/.exec(String(v == null ? '' : v).trim().toLowerCase());
if (!m) return '';
return PFP_PICTURES.indexOf(m[1]) !== -1 && Object.prototype.hasOwnProperty.call(PFP_ART, m[1]) ? m[1] : '';
}
function picKind_(v) {
const s = String(v == null ? '' : v).trim();
if (!s) return '';
const c = pfpChoice_(s);
if (c) return 'basic';
if (/^(https?:)?\/\//i.test(s) || /^data:image\//i.test(s)) return 'photo';
if (!/^[a-z][\w+.-]*:/i.test(s) && !/[|\s]/.test(s)) return 'photo';
return '';
}
function pfpArt_(name, size) {
const p = PFP_ART[name];
return p ? artSvg_(p.art, p.ground, size || 40) : '';
}
function pfpDefault_(key) {
const k = String(key || ''); if (!k) return '';
const named = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.defaultPictures) ? DATA.defaultPictures : []).filter(n => PFP_ART[n]);
const list = named.length ? named : PFP_PICTURES.filter(n => PFP_ART[n]);
let h = 0; for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) >>> 0;
return list.length ? list[h % list.length] : '';
}
const PIC_KINDS = {
photo: { face: (v, cls, size, o) => renderFace_({ cls, src: pic(v), alt: o.alt, eager: o.eager }),
said: () => 'Your photo is your picture.', chosen: () => '' },
basic: { face: (v, cls, size) => renderFace_({ cls, art: PFP_ART[pfpChoice_(v)].art, ground: PFP_ART[pfpChoice_(v)].ground, size }),
said: v => 'The ' + PFP_ART[pfpChoice_(v)].name.toLowerCase() + ' is your picture.', chosen: v => pfpChoice_(v) },
};
const picKindRow_ = v => (Object.prototype.hasOwnProperty.call(PIC_KINDS, picKind_(v)) ? PIC_KINDS[picKind_(v)] : null);
function personFace_(who, o) {
who = who || {}; o = o || {};
const v = String(who.pic == null ? '' : who.pic).trim();
const kind = picKind_(v);
const cls = o.cls || 'face';
const size = o.size || 40;
const name = String(who.name || who.handle || '').trim();
const mine = typeof USER !== 'undefined' && USER && USER.personId && who.personId
&& String(who.personId) === String(USER.personId);
if (Object.prototype.hasOwnProperty.call(PIC_KINDS, kind)) return PIC_KINDS[kind].face(v, cls, size, o);
const d = pfpDefault_(who.personId || name);
if (d) return renderFace_({ cls: cls + (o.none ? ' ' + o.none : ''), art: PFP_ART[d].art, ground: PFP_ART[d].ground, size });
return renderFace_({ cls: cls + (o.none ? ' ' + o.none : ''), text: initial(name) });
}
const levelFromXp = xp => Math.floor((Number(xp) || 0) / 10);
;
/* js/qaliases.js */
const QALIAS = {"Q-1CM-direct-and-inverse-proportion-9aii":{"to":"Q-1CM-direct-and-inverse-proportion-9","slot":1,"of":2},"Q-1CM-direct-and-inverse-proportion-9bii":{"to":"Q-1CM-direct-and-inverse-proportion-9b","slot":1,"of":2},"Q-1CM-direct-and-inverse-proportion-9cii":{"to":"Q-1CM-direct-and-inverse-proportion-9c","slot":1,"of":2},"Q-1CM-direct-and-inverse-proportion-9dii":{"to":"Q-1CM-direct-and-inverse-proportion-9d","slot":1,"of":2},"Q-1CM-interpreting-histograms-1aii":{"to":"Q-1CM-interpreting-histograms-1","slot":1,"of":4},"Q-1CM-interpreting-histograms-1aiii":{"to":"Q-1CM-interpreting-histograms-1","slot":2,"of":4},"Q-1CM-interpreting-histograms-1aiv":{"to":"Q-1CM-interpreting-histograms-1","slot":3,"of":4},"Q-1CM-similar-areas-and-volumes-6aii":{"to":"Q-1CM-similar-areas-and-volumes-6","slot":1,"of":2},"Q-1CM-standard-form-13bii":{"to":"Q-1CM-standard-form-13b","slot":1,"of":2},"Q-1MA1-1905-1H-11aii":{"to":"Q-1MA1-1905-1H-11a","slot":1,"of":3},"Q-1MA1-1905-1H-11aiii":{"to":"Q-1MA1-1905-1H-11a","slot":2,"of":3},"Q-1MA1-1905-1H-1aii":{"to":"Q-1MA1-1905-1H-1a","slot":1,"of":2},"Q-1MA1-1906-2H-11aii":{"to":"Q-1MA1-1906-2H-11a","slot":1,"of":6},"Q-1MA1-1906-2H-11aiii":{"to":"Q-1MA1-1906-2H-11a","slot":2,"of":6},"Q-1MA1-1906-2H-11aiv":{"to":"Q-1MA1-1906-2H-11a","slot":3,"of":6},"Q-1MA1-1906-2H-11av":{"to":"Q-1MA1-1906-2H-11a","slot":4,"of":6},"Q-1MA1-1906-2H-11avi":{"to":"Q-1MA1-1906-2H-11a","slot":5,"of":6},"Q-1MA1-2005-1H-12aii":{"to":"Q-1MA1-2005-1H-12a","slot":1,"of":6},"Q-1MA1-2005-1H-12aiii":{"to":"Q-1MA1-2005-1H-12a","slot":2,"of":6},"Q-1MA1-2005-1H-12aiv":{"to":"Q-1MA1-2005-1H-12a","slot":3,"of":6},"Q-1MA1-2005-1H-12av":{"to":"Q-1MA1-2005-1H-12a","slot":4,"of":6},"Q-1MA1-2005-1H-12avi":{"to":"Q-1MA1-2005-1H-12a","slot":5,"of":6},"Q-1MA1-2006-2H-4aii":{"to":"Q-1MA1-2006-2H-4a","slot":1,"of":4},"Q-1MA1-2006-2H-4aiii":{"to":"Q-1MA1-2006-2H-4a","slot":2,"of":4},"Q-1MA1-2006-2H-4aiv":{"to":"Q-1MA1-2006-2H-4a","slot":3,"of":4},"Q-1MA1-2406-2F-24aii":{"to":"Q-1MA1-2406-2F-24a","slot":1,"of":3},"Q-1MA1-2406-2F-24aiii":{"to":"Q-1MA1-2406-2F-24a","slot":2,"of":3},"Q-1MA1-2406-2H-11aii":{"to":"Q-1MA1-2406-2H-11a","slot":1,"of":5},"Q-1MA1-2406-2H-11aiii":{"to":"Q-1MA1-2406-2H-11a","slot":2,"of":5},"Q-1MA1-2406-2H-11aiv":{"to":"Q-1MA1-2406-2H-11a","slot":3,"of":5},"Q-1MA1-2406-2H-11av":{"to":"Q-1MA1-2406-2H-11a","slot":4,"of":5},"Q-1MA1-2406-2H-5aii":{"to":"Q-1MA1-2406-2H-5a","slot":1,"of":3},"Q-1MA1-2406-2H-5aiii":{"to":"Q-1MA1-2406-2H-5a","slot":2,"of":3},"Q-1MA1-2406-3F-13b":{"to":"Q-1MA1-2406-3F-13","slot":1,"of":6},"Q-1MA1-2406-3F-13c":{"to":"Q-1MA1-2406-3F-13","slot":2,"of":6},"Q-1MA1-2406-3F-13d":{"to":"Q-1MA1-2406-3F-13","slot":3,"of":6},"Q-1MA1-2406-3F-13e":{"to":"Q-1MA1-2406-3F-13","slot":4,"of":6},"Q-1MA1-2406-3F-13f":{"to":"Q-1MA1-2406-3F-13","slot":5,"of":6},"Q-9MA0-2406-P2-15":{"to":"Q-9MA0-2406-P2-15a"},"Q-9MA031-2206-5cii":{"to":"Q-9MA031-2206-5c","slot":1,"of":4},"Q-9MA031-2206-5ciii":{"to":"Q-9MA031-2206-5c","slot":2,"of":4},"Q-9MA031-2206-5civ":{"to":"Q-9MA031-2206-5c","slot":3,"of":4},"Q-AQA-7357-2206-1-13a-stem":{"to":"Q-AQA-7357-2206-1-13a"},"Q-AQA-7357-2306-2-17a":{"to":"Q-AQA-7357-2306-2-17ai"},"Q-AQA-7408-2406-3A-025ii":{"to":"Q-AQA-7408-2406-3A-025","slot":1,"of":2},"Q-AQA-8461-2406-1F-012ii":{"to":"Q-AQA-8461-2406-1F-012","slot":1,"of":2},"Q-AQA-8461-2406-1F-031ii":{"to":"Q-AQA-8461-2406-1F-031","slot":1,"of":2},"Q-AQA-8461-2406-1H-072ii":{"to":"Q-AQA-8461-2406-1H-072","slot":1,"of":2},"Q-AQA-8462-2406-1F-043ii":{"to":"Q-AQA-8462-2406-1F-043","slot":1,"of":2},"Q-AQA-8462-2406-1F-062ii":{"to":"Q-AQA-8462-2406-1F-062","slot":1,"of":3},"Q-AQA-8462-2406-1F-062iii":{"to":"Q-AQA-8462-2406-1F-062","slot":2,"of":3},"Q-AQA-8462-2406-2F-053ii":{"to":"Q-AQA-8462-2406-2F-053","slot":1,"of":2},"Q-AQA-8463-2406-2F-032ii":{"to":"Q-AQA-8463-2406-2F-032","slot":1,"of":2},"Q-CBM-5AD-F-0601-6aii":{"to":"Q-CBM-5AD-F-0601-6","slot":1,"of":6},"Q-CBM-5AD-F-0601-6aiii":{"to":"Q-CBM-5AD-F-0601-6","slot":2,"of":6},"Q-CBM-5AD-F-0601-6aiv":{"to":"Q-CBM-5AD-F-0601-6","slot":3,"of":6},"Q-CBM-5AD-F-0601-6av":{"to":"Q-CBM-5AD-F-0601-6","slot":4,"of":6},"Q-CBM-5AD-F-0601-6avi":{"to":"Q-CBM-5AD-F-0601-6","slot":5,"of":6},"Q-CBM-5AD-F-0607-5aii":{"to":"Q-CBM-5AD-F-0607-5","slot":1,"of":4},"Q-CBM-5AD-F-0607-5aiii":{"to":"Q-CBM-5AD-F-0607-5","slot":2,"of":4},"Q-CBM-5AD-F-0607-5aiv":{"to":"Q-CBM-5AD-F-0607-5","slot":3,"of":4},"Q-CBM-5AD-F-0619-3aii":{"to":"Q-CBM-5AD-F-0619-3","slot":1,"of":3},"Q-CBM-5AD-F-0619-3aiii":{"to":"Q-CBM-5AD-F-0619-3","slot":2,"of":3},"Q-CBM-5AD-F-0620-6aii":{"to":"Q-CBM-5AD-F-0620-6","slot":1,"of":2},"Q-CBM-5AD-F-0710-2aii":{"to":"Q-CBM-5AD-F-0710-2","slot":1,"of":3},"Q-CBM-5AD-F-0710-2aiii":{"to":"Q-CBM-5AD-F-0710-2","slot":2,"of":3},"Q-CBM-5AD-F-0726-4aii":{"to":"Q-CBM-5AD-F-0726-4","slot":1,"of":5},"Q-CBM-5AD-F-0726-4aiii":{"to":"Q-CBM-5AD-F-0726-4","slot":2,"of":5},"Q-CBM-5AD-F-0726-4aiv":{"to":"Q-CBM-5AD-F-0726-4","slot":3,"of":5},"Q-CBM-5AD-F-0726-4av":{"to":"Q-CBM-5AD-F-0726-4","slot":4,"of":5},"Q-CBM-5AD-F-0731-2aii":{"to":"Q-CBM-5AD-F-0731-2","slot":1,"of":3},"Q-CBM-5AD-F-0731-2aiii":{"to":"Q-CBM-5AD-F-0731-2","slot":2,"of":3},"Q-CBM-5AD-F-0804-3aii":{"to":"Q-CBM-5AD-F-0804-3","slot":1,"of":4},"Q-CBM-5AD-F-0804-3aiii":{"to":"Q-CBM-5AD-F-0804-3","slot":2,"of":4},"Q-CBM-5AD-F-0804-3aiv":{"to":"Q-CBM-5AD-F-0804-3","slot":3,"of":4},"Q-CBM-5AD-F-0903-3bii":{"to":"Q-CBM-5AD-F-0903-3"},"Q-CBM-5AD-F-0903-3biii":{"to":"Q-CBM-5AD-F-0903-3"},"Q-CBM-5AD-F-0903-3biv":{"to":"Q-CBM-5AD-F-0903-3"},"Q-CBM-5AD-F-0910-2aii":{"to":"Q-CBM-5AD-F-0910-2"},"Q-CBM-5AD-F-0910-2aiii":{"to":"Q-CBM-5AD-F-0910-2"},"Q-CBM-5AD-F-0910-2aiv":{"to":"Q-CBM-5AD-F-0910-2"},"Q-CBM-5AD-F-1004-3aii":{"to":"Q-CBM-5AD-F-1004-3","slot":1,"of":3},"Q-CBM-5AD-F-1004-3aiii":{"to":"Q-CBM-5AD-F-1004-3","slot":2,"of":3},"Q-CBM-5AD-F-1007-2aii":{"to":"Q-CBM-5AD-F-1007-2","slot":1,"of":4},"Q-CBM-5AD-F-1007-2aiii":{"to":"Q-CBM-5AD-F-1007-2","slot":2,"of":4},"Q-CBM-5AD-F-1007-2aiv":{"to":"Q-CBM-5AD-F-1007-2","slot":3,"of":4},"Q-CBM-5AD-F-1017-4aii":{"to":"Q-CBM-5AD-F-1017-4","slot":1,"of":7},"Q-CBM-5AD-F-1017-4aiii":{"to":"Q-CBM-5AD-F-1017-4","slot":2,"of":7},"Q-CBM-5AD-F-1017-4aiv":{"to":"Q-CBM-5AD-F-1017-4","slot":3,"of":7},"Q-CBM-5AD-F-1017-4av":{"to":"Q-CBM-5AD-F-1017-4","slot":4,"of":7},"Q-CBM-5AD-F-1017-4avi":{"to":"Q-CBM-5AD-F-1017-4","slot":5,"of":7},"Q-CBM-5AD-F-1017-4avii":{"to":"Q-CBM-5AD-F-1017-4","slot":6,"of":7},"Q-CBM-5AD-F-1025-3aii":{"to":"Q-CBM-5AD-F-1025-3","slot":1,"of":3},"Q-CBM-5AD-F-1025-3aiii":{"to":"Q-CBM-5AD-F-1025-3","slot":2,"of":3},"Q-CBM-sequences-10b":{"to":"Q-CBM-sequences-10","slot":1,"of":2},"Q-CBM-sequences-11b":{"to":"Q-CBM-sequences-11","slot":1,"of":2},"Q-CBM-sequences-12b":{"to":"Q-CBM-sequences-12","slot":1,"of":2},"Q-CBM-sequences-13b":{"to":"Q-CBM-sequences-13","slot":1,"of":2},"Q-CBM-sequences-1b":{"to":"Q-CBM-sequences-1","slot":1,"of":2},"Q-CBM-sequences-2b":{"to":"Q-CBM-sequences-2","slot":1,"of":3},"Q-CBM-sequences-2c":{"to":"Q-CBM-sequences-2","slot":2,"of":3},"Q-CBM-sequences-3b":{"to":"Q-CBM-sequences-3","slot":1,"of":2},"Q-CBM-sequences-4b":{"to":"Q-CBM-sequences-4","slot":1,"of":2},"Q-P-AQA-8700-2506-1-1":{"to":"Q-AQA-8700-2506-1-1"},"Q-P-AQA-8700-2506-1-2":{"to":"Q-AQA-8700-2506-1-2"},"Q-P-AQA-8700-2506-1-3":{"to":"Q-AQA-8700-2506-1-3"},"Q-P-AQA-8700-2506-1-4":{"to":"Q-AQA-8700-2506-1-4"},"Q-P-AQA-8700-2506-1-5":{"to":"Q-AQA-8700-2506-1-5"},"Q-R0372-1":{"to":"Q-AQA-8700-2406-2-1"},"Q-R0372-2":{"to":"Q-AQA-8700-2406-2-2"},"Q-R0372-3":{"to":"Q-AQA-8700-2406-2-3"},"Q-R0372-4":{"to":"Q-AQA-8700-2406-2-4"},"Q-R0372-5":{"to":"Q-AQA-8700-2406-2-5"},"Q-R0373-1":{"to":"Q-AQA-8700-2406-1-1"},"Q-R0373-2":{"to":"Q-AQA-8700-2406-1-2"},"Q-R0373-3":{"to":"Q-AQA-8700-2406-1-3"},"Q-R0373-4":{"to":"Q-AQA-8700-2406-1-4"},"Q-R0373-5":{"to":"Q-AQA-8700-2406-1-5"},"Q-R0375-1":{"to":"Q-AQA-8700-2311-2-1"},"Q-R0375-2":{"to":"Q-AQA-8700-2311-2-2"},"Q-R0375-3":{"to":"Q-AQA-8700-2311-2-3"},"Q-R0375-4":{"to":"Q-AQA-8700-2311-2-4"},"Q-R0375-5":{"to":"Q-AQA-8700-2311-2-5"},"Q-R0376-1":{"to":"Q-AQA-8700-2311-1-1"},"Q-R0376-2":{"to":"Q-AQA-8700-2311-1-2"},"Q-R0376-3":{"to":"Q-AQA-8700-2311-1-3"},"Q-R0376-4":{"to":"Q-AQA-8700-2311-1-4"},"Q-R0376-5":{"to":"Q-AQA-8700-2311-1-5"},"Q-R0377-1":{"to":"Q-AQA-8700-2011-2-1"},"Q-R0377-2":{"to":"Q-AQA-8700-2011-2-2"},"Q-R0377-3":{"to":"Q-AQA-8700-2011-2-3"},"Q-R0377-4":{"to":"Q-AQA-8700-2011-2-4"},"Q-R0377-5":{"to":"Q-AQA-8700-2011-2-5"},"Q-R0378-1":{"to":"Q-AQA-8700-2011-1-1"},"Q-R0378-2":{"to":"Q-AQA-8700-2011-1-2"},"Q-R0378-3":{"to":"Q-AQA-8700-2011-1-3"},"Q-R0378-4":{"to":"Q-AQA-8700-2011-1-4"},"Q-R0378-5":{"to":"Q-AQA-8700-2011-1-5"},"Q-R0379-1":{"to":"Q-AQA-8700-1811-2-1"},"Q-R0379-2":{"to":"Q-AQA-8700-1811-2-2"},"Q-R0379-3":{"to":"Q-AQA-8700-1811-2-3"},"Q-R0379-4":{"to":"Q-AQA-8700-1811-2-4"},"Q-R0379-5":{"to":"Q-AQA-8700-1811-2-5"},"Q-R0380-1":{"to":"Q-AQA-8700-1811-1-1"},"Q-R0380-2":{"to":"Q-AQA-8700-1811-1-2"},"Q-R0380-3":{"to":"Q-AQA-8700-1811-1-3"},"Q-R0380-4":{"to":"Q-AQA-8700-1811-1-4"},"Q-R0380-5":{"to":"Q-AQA-8700-1811-1-5"},"Q-R0383-1":{"to":"Q-AQA-8700-2211-2-1"},"Q-R0383-2":{"to":"Q-AQA-8700-2211-2-2"},"Q-R0383-3":{"to":"Q-AQA-8700-2211-2-3"},"Q-R0383-4":{"to":"Q-AQA-8700-2211-2-4"},"Q-R0383-5":{"to":"Q-AQA-8700-2211-2-5"},"Q-R0384-1":{"to":"Q-AQA-8700-2206-2-1"},"Q-R0384-2":{"to":"Q-AQA-8700-2206-2-2"},"Q-R0384-3":{"to":"Q-AQA-8700-2206-2-3"},"Q-R0384-4":{"to":"Q-AQA-8700-2206-2-4"},"Q-R0384-5":{"to":"Q-AQA-8700-2206-2-5"},"Q-R0388-1":{"to":"Q-AQA-8700-2211-1-1"},"Q-R0388-2":{"to":"Q-AQA-8700-2211-1-2"},"Q-R0388-3":{"to":"Q-AQA-8700-2211-1-3"},"Q-R0388-4":{"to":"Q-AQA-8700-2211-1-4"},"Q-R0388-5":{"to":"Q-AQA-8700-2211-1-5"},"Q-R0389-1":{"to":"Q-AQA-8700-2206-1-1"},"Q-R0389-2":{"to":"Q-AQA-8700-2206-1-2"},"Q-R0389-3":{"to":"Q-AQA-8700-2206-1-3"},"Q-R0389-4":{"to":"Q-AQA-8700-2206-1-4"},"Q-R0389-5":{"to":"Q-AQA-8700-2206-1-5"},"Q-R0390-1":{"to":"Q-AQA-8700-1911-2-1"},"Q-R0390-2":{"to":"Q-AQA-8700-1911-2-2"},"Q-R0390-3":{"to":"Q-AQA-8700-1911-2-3"},"Q-R0390-4":{"to":"Q-AQA-8700-1911-2-4"},"Q-R0390-5":{"to":"Q-AQA-8700-1911-2-5"},"Q-R0391-1":{"to":"Q-AQA-8700-1911-1-1"},"Q-R0391-2":{"to":"Q-AQA-8700-1911-1-2"},"Q-R0391-3":{"to":"Q-AQA-8700-1911-1-3"},"Q-R0391-4":{"to":"Q-AQA-8700-1911-1-4"},"Q-R0391-5":{"to":"Q-AQA-8700-1911-1-5"},"Q-R0393-1":{"to":"Q-AQA-8700-1711-2-1"},"Q-R0393-2":{"to":"Q-AQA-8700-1711-2-2"},"Q-R0393-3":{"to":"Q-AQA-8700-1711-2-3"},"Q-R0393-4":{"to":"Q-AQA-8700-1711-2-4"},"Q-R0393-5":{"to":"Q-AQA-8700-1711-2-5"},"Q-R0394-1":{"to":"Q-AQA-8700-1806-2-1"},"Q-R0394-2":{"to":"Q-AQA-8700-1806-2-2"},"Q-R0394-3":{"to":"Q-AQA-8700-1806-2-3"},"Q-R0394-4":{"to":"Q-AQA-8700-1806-2-4"},"Q-R0394-5":{"to":"Q-AQA-8700-1806-2-5"},"Q-R0395-1":{"to":"Q-AQA-8700-1706-2-1"},"Q-R0395-2":{"to":"Q-AQA-8700-1706-2-2"},"Q-R0395-3":{"to":"Q-AQA-8700-1706-2-3"},"Q-R0395-4":{"to":"Q-AQA-8700-1706-2-4"},"Q-R0395-5":{"to":"Q-AQA-8700-1706-2-5"},"Q-R0396-1":{"to":"Q-AQA-8700-1711-1-1"},"Q-R0396-2":{"to":"Q-AQA-8700-1711-1-2"},"Q-R0396-3":{"to":"Q-AQA-8700-1711-1-3"},"Q-R0396-4":{"to":"Q-AQA-8700-1711-1-4"},"Q-R0396-5":{"to":"Q-AQA-8700-1711-1-5"},"Q-R0397-1":{"to":"Q-AQA-8700-1806-1-1"},"Q-R0397-2":{"to":"Q-AQA-8700-1806-1-2"},"Q-R0397-3":{"to":"Q-AQA-8700-1806-1-3"},"Q-R0397-4":{"to":"Q-AQA-8700-1806-1-4"},"Q-R0397-5":{"to":"Q-AQA-8700-1806-1-5"},"Q-R0398-1":{"to":"Q-AQA-8700-1706-1-1"},"Q-R0398-2":{"to":"Q-AQA-8700-1706-1-2"},"Q-R0398-3":{"to":"Q-AQA-8700-1706-1-3"},"Q-R0398-4":{"to":"Q-AQA-8700-1706-1-4"},"Q-R0398-5":{"to":"Q-AQA-8700-1706-1-5"},"Q-STA-KS1-2026-P2-15b":{"to":"Q-STA-KS1-2026-P2-15","slot":1,"of":3},"Q-STA-KS1-2026-P2-15c":{"to":"Q-STA-KS1-2026-P2-15","slot":2,"of":3},"Q-STA-KS1-2026-P2-20b":{"to":"Q-STA-KS1-2026-P2-20","slot":1,"of":2},"Q-STA-KS2-2019-P2-14b":{"to":"Q-STA-KS2-2019-P2-14","slot":1,"of":3},"Q-STA-KS2-2019-P2-14c":{"to":"Q-STA-KS2-2019-P2-14","slot":2,"of":3},"Q-STA-KS2-2019-P2-1b":{"to":"Q-STA-KS2-2019-P2-1","slot":1,"of":3},"Q-STA-KS2-2019-P2-1c":{"to":"Q-STA-KS2-2019-P2-1","slot":2,"of":3},"Q-STA-KS2-2019-P2-5b":{"to":"Q-STA-KS2-2019-P2-5","slot":1,"of":3},"Q-STA-KS2-2019-P2-5c":{"to":"Q-STA-KS2-2019-P2-5","slot":2,"of":3},"Q-STA-KS2-2019-P3-11b":{"to":"Q-STA-KS2-2019-P3-11","slot":1,"of":3},"Q-STA-KS2-2019-P3-11c":{"to":"Q-STA-KS2-2019-P3-11","slot":2,"of":3},"Q-STA-KS2-2019-P3-12b":{"to":"Q-STA-KS2-2019-P3-12","slot":1,"of":2},"Q-STA-KS2-2019-P3-5b":{"to":"Q-STA-KS2-2019-P3-5","slot":1,"of":3},"Q-STA-KS2-2019-P3-5c":{"to":"Q-STA-KS2-2019-P3-5","slot":2,"of":3},"Q-STA-KS2-2019-P3-7bii":{"to":"Q-STA-KS2-2019-P3-7b","slot":1,"of":3},"Q-STA-KS2-2019-P3-7biii":{"to":"Q-STA-KS2-2019-P3-7b","slot":2,"of":3},"Q-STA-KS2-2024-P2-11b":{"to":"Q-STA-KS2-2024-P2-11","slot":1,"of":2},"Q-STA-KS2-2024-P2-4b":{"to":"Q-STA-KS2-2024-P2-4","slot":1,"of":2},"Q-STA-KS2-2024-P2-5b":{"to":"Q-STA-KS2-2024-P2-5","slot":1,"of":3},"Q-STA-KS2-2024-P2-5c":{"to":"Q-STA-KS2-2024-P2-5","slot":2,"of":3},"Q-STA-KS2-2024-P2-8b":{"to":"Q-STA-KS2-2024-P2-8","slot":1,"of":2},"Q-STA-KS2-2024-P3-23b":{"to":"Q-STA-KS2-2024-P3-23","slot":1,"of":3},"Q-STA-KS2-2024-P3-23c":{"to":"Q-STA-KS2-2024-P3-23","slot":2,"of":3},"Q-STA-KS2-2024-P3-9b":{"to":"Q-STA-KS2-2024-P3-9","slot":1,"of":3},"Q-STA-KS2-2024-P3-9c":{"to":"Q-STA-KS2-2024-P3-9","slot":2,"of":3},"Q-STA-KS2-2025-GPS1-38b":{"to":"Q-STA-KS2-2025-GPS1-38","slot":1,"of":2}};
function qAliasMine_(mine, map) {
const out = {}, cells = {};
const A = map || {};
Object.keys(mine || {}).forEach(k => {
const g = mine[k], m = /^q:([^#]+)(#.*)?$/.exec(String(k));
const a = m ? A[m[1]] : null;
if (!a || !a.to || !g) {
const was = out[k];
if (!was || (Number(was.at) || 0) <= (Number(g && g.at) || 0)) out[k] = g;
return;
}
const to = 'q:' + a.to + (m[2] || '');
if (a.slot === undefined || a.slot === null) {
const was = out[to] || mine[to];
if (!was || (Number(was.at) || 0) < (Number(g.at) || 0)) out[to] = g;
else out[to] = was;
return;
}
(cells[to] = cells[to] || []).push({ slot: Number(a.slot), of: Number(a.of) || 0, g: g });
});
Object.keys(cells).forEach(to => {
const own = out[to] || (mine || {})[to], parts = cells[to];
const ownAt = own ? Number(own.at) || 0 : -1;
const whole = own && String(own.answer || '').indexOf(' ; ') !== -1;
if (whole && parts.every(p => (Number(p.g.at) || 0) <= ownAt)) { out[to] = own; return; }
const of = Math.max.apply(null, parts.map(p => p.of).concat(parts.map(p => p.slot + 1)));
const val = whole ? String(own.answer).split(' ; ') : [own ? String(own.answer || '') : ''];
const at = val.map((v, i) => (own && (whole || i === 0) ? ownAt : -1));
const ver = val.map(() => (own ? String(own.verdict || '') : ''));
while (val.length < of) { val.push(''); at.push(-1); ver.push(''); }
parts.forEach(p => {
const t = Number(p.g.at) || 0;
if (t >= at[p.slot]) { val[p.slot] = String(p.g.answer || ''); at[p.slot] = t; ver[p.slot] = String(p.g.verdict || ''); }
});
const filled = val.filter(v => String(v).trim()).length;
const verdict = filled === of && ver.every(v => v === 'right') ? 'right' : ver.some(v => v === 'wrong') ? 'wrong' : '';
const last = parts.reduce((b, p) => ((Number(p.g.at) || 0) > (Number(b.at) || 0) ? p.g : b), own || parts[0].g);
out[to] = { answer: val.join(' ; '), verdict: verdict, at: Math.max.apply(null, at.concat(0)), id: String(last.id || '') };
});
return out;
}
function qAliasKey_(k) {
const m = /^q:(.+)$/.exec(String(k || '')), a = m && typeof QALIAS === 'object' ? QALIAS[m[1]] : null;
return a && a.to ? 'q:' + a.to : String(k || '');
}
;
/* js/resource.js */
const FIELD_LABEL = {
band_type: 'grade or stage', band_value: 'which one', key_stage: 'key stage',
exam_board: 'exam board', exam_wave: 'exam wave', document_type: 'type',
print_required: 'needs printing', level_required: 'unlocks at level',
pages_checked: 'page count checked', trackable: 'can be ticked off',
library_card: 'card number', library_pin: 'PIN',
exam_small_date: 'small exam', exam_big_date: 'big exam',
};
const fieldLabel = f => FIELD_LABEL[f] || String(f).replace(/_/g, ' ');
let CART = keep_.json('familyCart', []);
const cartSave = () => { keep_.put('familyCart', JSON.stringify(CART)); };
function cartPrice_(src) {
const n = Number(src && src.price) || 0;
return String((src && src.unit) || '').trim() === 'p'
? { cost: 0, money: Math.round(n) / 100 }
: { cost: n, money: 0 };
}
function cartUnits_() {
let moved = false;
CART.forEach(c => {
if (!isShop_(c) || !(Number(c.cost) > 0) || Number(c.money) > 0) return;
const src = ((typeof DATA !== 'undefined' && DATA.shop) || []).find(x => norm(x.name) === norm(c.key));
if (!src || String(src.unit || '').trim() !== 'p') return;
Object.assign(c, cartPrice_(src));
moved = true;
});
if (moved) cartSave();
}
const CART_ADD_OWN = { bundle: el => cartAddBundle_(el) };
on('cart-add', el => {
if (!USER) { toast(text_('err-sign-in-first')); go('account'); return; }
if (Object.prototype.hasOwnProperty.call(CART_ADD_OWN, el.dataset.kind)) { CART_ADD_OWN[el.dataset.kind](el); return; }
const key = el.dataset.key;
const kind = ['topic', 'print', 'shop'].includes(el.dataset.kind) ? el.dataset.kind : 'shop';
if (CART.some(c => c.key === key && c.kind === kind)) { toast(text_('already-in-your-basket')); return; }
{
const src = (DATA.shop || []).find(x => norm(x.name) === norm(key));
if (!src) return;
CART.push(Object.assign({ key, name: src.name, kind }, cartPrice_(src)));
}
cartSave();
tileSet_(el, { label: text_('in-your-basket'), note: '', on: true, off: true });
toast('In your basket — ' + CART.length + ' ' + plural_(CART.length, 'item'));
});
function cartAddBundle_(el) {
const ids = String(el.dataset.ids || '').split(',').map(s => s.trim()).filter(Boolean);
const from = String(el.dataset.key || '');
const offered = [].concat(typeof bundleOf_ === 'function' ? bundleOf_() || [] : []);
const b = offered.find(x => x && x.ids.join(',') === ids.join(',')) || null;
const shortOf = {};
if (b && b.ids.join(',') === ids.join(',')) {
b.printable.forEach(p => { shortOf[p.id] = p.short || p.label; });
}
let added = 0;
let had = 0;
ids.forEach(id => {
const doc = typeof docById_ === 'function' ? docById_(id) : null;
if (!doc || !canPrint_(doc)) return;
if (CART.some(c => isPrint_(c) && String(c.key) === id)) { had++; return; }
CART.push({ key: id, kind: 'print', name: paperLabel_(id), short: shortOf[id] || '',
pages: Number(doc.pages) || 0, cost: 0, from: from });
added++;
});
if (!added && !had) { toast(text_('nothing-in-that-bundle-can-be')); return; }
cartSave();
if (typeof cartPaint_ === 'function') cartPaint_();
tileSet_(el, { label: text_('in-your-basket'), note: '', on: true, off: true });
toast(!added ? text_('already-in-your-basket')
: added + ' ' + plural_(added, 'paper') + ' in your basket'
+ (had ? ' — ' + had + ' already there' : ''));
}
on('cart-open', () => {
const n = typeof widgetPagesOf_ === 'function'
? widgetPagesOf_('shop').findIndex(w => (w.parts || [w]).some(x => String(x.id) === 'cart')) : -1;
go('shop');
if (n >= 0) goPage('shop', n, true);
});
on('cart-laminate', el => {
const line = CART.find(c => c.key === el.dataset.key && c.kind === el.dataset.kind);
if (!line) return;
line.laminate = el.dataset.on === '1';
cartSave();
if (typeof cartPaint_ === 'function') cartPaint_();
toast(line.laminate ? 'Laminated' : 'Back to plain paper');
});
on('cart-drop', el => {
if (!sure_(el, 'Take out?')) return;
CART = CART.filter(c => !(c.key === el.dataset.key && c.kind === el.dataset.kind));
cartSave();
if (typeof cartPaint_ === 'function') cartPaint_();
});
;
/* js/arcade.js */
function widgetFor_(w) {
if (!w) return false;
if (w.admin && !(typeof may_ === 'function' && may_('admin'))) return false;
if (w.tutor && !(typeof may_ === 'function' && may_('staff'))) return false;
if (w.signedIn && !(typeof USER !== 'undefined' && USER)) return false;
const e = typeof ITEM_KINDS === 'object' && ((ITEM_KINDS.kinds[w.kind] || {}).entries || {})[w.id];
if (e && e.who && e.who !== 'anyone' && !String(e.who).split(',').some(x => typeof may_ === 'function' && may_(x.trim()))) return false;
return true;
}
function widgetsOf_(kind) {
if (typeof allWidgets !== 'function') return [];
return allWidgets()
.filter(w => w.kind === kind)
.filter(widgetFor_);
}
const widgetPagesOf_ = kind => widgetsOf_(kind);
const WIDGET_KEY = w => 'w:' + String(w.id);
function widgetOnColumn_(w, own) {
const held = typeof gameLocked_ === 'function' && gameLocked_(w.id), name = w.name || w.title || w.label || '';
return renderCard({ kind: 'panel', look: 'is-widget' + (held ? ' is-locked' : ''), name, tags: name ? [name] : [],
body: [widgetSlot_(w, name)], tiles: widgetTiles_(w, own) });
}
const widgetTiles_ = (w, own) => [].concat(typeof favOpts_ === 'function' ? [favOpts_({ key: WIDGET_KEY(w), kind: 'widget' }),
typeof gameLockOpts_ === 'function' ? gameLockOpts_(w.id) : null, typeof suggestOpts_ === 'function' ? suggestOpts_('widget', String(w.id), w.name || w.title || w.label || '') : null] : [],
own === true && typeof wordsOpts_ === 'function' ? wordsOpts_('w:' + String(w.id)) || [] : []).filter(Boolean);
function widgetSlot_(w, name) {
const waits = typeof w.start === 'function' && typeof loading_ === 'function';
const html = typeof wordsIn_ === 'function' ? wordsIn_('w:' + String(w.id), w.html) : w.html;
return { type: 'group', id: 'wgt-' + String(w.id), look: 'widget-slot', attrs: { role: 'region', 'aria-label': String(w.name || w.id), 'aria-busy': waits ? 'true' : null },
inner: (typeof kcTidy_ === 'function' ? kcTidy_('', html, name).lines : String(html || '')) + (waits ? loading_() : '') };
}
let TOOLS_ON = [];
function widgetWho_() {
try { return typeof USER !== 'undefined' && USER ? String(USER.personId || USER.name || '') : ''; }
catch (e) { return ''; }
}
function widgetsReveilAll_(col) {
const host = document.getElementById('s-' + col);
if (!host) return [];
const all = typeof allWidgets === 'function' ? allWidgets() : [];
return [...host.querySelectorAll('.widget-slot[id^="wgt-"]')].map(slot => {
const id = slot.id.slice(4);
const w = all.find(x => String(x.id) === id);
return w ? { w, slot } : null;
}).filter(Boolean);
}
function widgetsReveil_(col, who) {
if (WIDGET_COLS.indexOf(col) === -1 || typeof loading_ !== 'function') return;
const me = widgetWho_();
(who ? widgetsReveilAll_(col) : widgetsOn_(col).map(w => ({ w, slot: slotOn_(col, String(w.id)) }))).forEach(({ w, slot }) => {
if (typeof w.start !== 'function' && typeof w.draw !== 'function') return;
if (!slot || slot.getAttribute('aria-busy')) return;
if (TOOLS_ON.some(e => e.slot === slot)) return;
if (who ? slot.WHO === me : (w.pure || (slot.OWN !== undefined && slot.OWN === me))) return;
slot.innerHTML = w.html;
waiting_(slot);
delete slot.AHEAD;
delete slot.WHO;
delete slot.LENT;
delete slot.OWN;
});
}
function widgetsHeld_(col, pre) {
const who = widgetWho_();
const run = TOOLS_ON.filter(e => e.col === col && e.slot && e.slot.isConnected && e.who === who && (!pre || e.slot.UP_PAID));
const pure = [];
widgetsOn_(col).forEach(w => {
if (!w.pure) return;
const sl = slotOn_(col, String(w.id));
if (sl && sl.AHEAD && sl.AHEAD.who === who && !run.some(e => e.slot === sl)) pure.push({ w, col, slot: sl, who });
});
return run.concat(pure);
}
const WIDGET_HELD = {};
function widgetsBack_(col, held) {
return held.filter(e => {
const fresh = slotOn_(col, String(e.w.id));
if (fresh && fresh !== e.slot) fresh.replaceWith(e.slot);
return !fresh;
});
}
const FIND_WIDGET_GROUPS = { videos: 'Videos', reels: 'Tools', newspaper: 'Tools', shopfind: 'Tools', cart: 'Shop' };
function findWidgetList_() {
return allWidgets().filter(w => w && w.kind !== 'reel').filter(widgetFor_);
}
function finderWidgets_(col) {
return widgetsReveilAll_(col).map(e => e.w).filter((w, i, a) => a.indexOf(w) === i).filter(widgetFor_);
}
const WIDGET_COLS = ['stuff'];
function widgetsOn_(col) {
return col === 'stuff' ? finderWidgets_(col) : [];
}
function slotOn_(col, id) {
const host = col && document.getElementById('s-' + col);
if (!host) return null;
const want = 'wgt-' + id;
try { return host.querySelector('#' + CSS.escape(want)); }
catch (e) { return [...host.querySelectorAll('.widget-slot')].find(el => el.id === want) || null; }
}
let TOOLS_WAIT = [];
let TOOLS_WAKE = 0;
const WIDGET_UPS = {};
function widgetAdoptable_(w, slot) {
const a = slot && slot.AHEAD;
return !!(a && !w.stop && slot.isConnected && a.who === widgetWho_() && a.act === ACT_EPOCH
&& a.draw === DRAW_EPOCH && a.ups === (WIDGET_UPS[String(w.id)] || 0));
}
function widgetUp_(w, col) {
const id = String(w.id);
const slot = col ? slotOn_(col, id) : $('wgt-' + id);
const adopt = widgetAdoptable_(w, slot);
TOOLS_ON.push({ w, col, slot, who: widgetWho_() });
if (slot && col) WIDGET_HOME[slot.id] = col;
if (slot) { slot.WHO = widgetWho_(); delete slot.AHEAD; delete slot.LENT; slot.UP_PAID = typeof FIRST_PAINT_DONE !== 'undefined' && !!FIRST_PAINT_DONE; }
WIDGET_UPS[id] = (WIDGET_UPS[id] || 0) + 1;
try { if (!adopt && w.start) w.start(); }
catch (e) { oops_(e, 'widget:' + id, slot); }
finally {
if (typeof loaded_ === 'function') {
loaded_(slot);
widgetCopies_(id).forEach(el => { if (el !== slot && widgetLit_(el)) { loaded_(el); el.LENT = true; } });
}
}
}
function widgetCopies_(id) {
return WIDGET_COLS.map(c => slotOn_(c, id)).filter(Boolean);
}
function widgetLit_(el) {
try { return typeof GLASS !== 'undefined' && GLASS.pages.indexOf(el.closest('.page')) !== -1; } catch (e) { return false; }
}
function widgetDown_(e) {
try { e.w.stop && e.w.stop(); } catch (err) {}
if (e.slot && WIDGET_HOME[e.slot.id] === e.col) delete WIDGET_HOME[e.slot.id];
}
function widgetsWake_(list, col, arriving) {
const ids = new Set(list.map(w => String(w.id)));
const keep = e => !ids.has(String(e.w.id)) || (arriving && e.col === col && e.slot && e.slot.isConnected);
toolsStop_(keep, q => !ids.has(String(q.w.id)));
const up = list.filter(w => !TOOLS_ON.some(e => String(e.w.id) === String(w.id)));
if (!arriving) { up.forEach(w => widgetUp_(w, col)); return; }
const veiled = w => { const sl = slotOn_(col, String(w.id)); return !sl || !!sl.getAttribute('aria-busy') || !!sl.LENT; };
const adopt = up.filter(w => widgetAdoptable_(w, slotOn_(col, String(w.id))));
adopt.forEach(w => widgetUp_(w, col));
const rest = up.filter(w => adopt.indexOf(w) === -1);
const now = rest.filter(w => veiled(w) && widgetDistance_(w, col) <= 1);
now.forEach(w => widgetUp_(w, col));
rest.filter(w => now.indexOf(w) === -1).forEach(w => TOOLS_WAIT.push({ w, col }));
if (TOOLS_WAIT.length) widgetsLater_();
}
function widgetDistance_(w, col) {
try {
const slot = slotOn_(col, String(w.id)), host = $('s-' + col);
const pg = slot && slot.closest('.page');
if (!pg || !host) return 0;
const i = [...host.querySelectorAll(':scope > .page')].indexOf(pg);
return i < 0 ? 0 : Math.abs(i - domIndex_(col, PAGE[col] || 0));
} catch (e) { return 0; }
}
function widgetRank_(q) {
let lit = false;
try {
const slot = slotOn_(q.col, String(q.w.id));
lit = !!(slot && typeof GLASS !== 'undefined' && GLASS.pages.indexOf(slot.closest('.page')) !== -1);
} catch (e) {}
return (lit ? 0 : 1000) + widgetDistance_(q.w, q.col);
}
let TOOLS_BUSY_SINCE = 0;
function widgetsLater_() {
if (TOOLS_WAKE) return;
TOOLS_WAKE = setTimeout(function step() {
TOOLS_WAKE = 0;
if (!TOOLS_WAIT.length) return;
const now = performance.now();
const busy = typeof GLASS !== 'undefined' && GLASS.at !== AT;
if (busy && !(TOOLS_BUSY_SINCE && now - TOOLS_BUSY_SINCE > 1500)) {
if (!TOOLS_BUSY_SINCE) TOOLS_BUSY_SINCE = now;
TOOLS_WAKE = setTimeout(step, 60); return;
}
if (!busy) TOOLS_BUSY_SINCE = 0;
const rank = new Map(TOOLS_WAIT.map(q => [q, widgetRank_(q)]));
TOOLS_WAIT.sort((a, b) => rank.get(a) - rank.get(b));
const next = TOOLS_WAIT.shift();
if (!TOOLS_ON.some(e => String(e.w.id) === String(next.w.id))) {
widgetUp_(next.w, next.col);
if (next.col !== AT && typeof placeCells === 'function') placeCells('y', true);
}
if (TOOLS_WAIT.length) TOOLS_WAKE = setTimeout(step, 16);
}, 0);
}
function widgetsNear_(col) {
if (!TOOLS_WAIT.length) return;
const now = TOOLS_WAIT.filter(q => {
if (q.col !== col || widgetDistance_(q.w, col) > 1) return false;
const sl = slotOn_(q.col, String(q.w.id));
return !sl || !!sl.getAttribute('aria-busy') || !!sl.LENT || widgetAdoptable_(q.w, sl);
});
if (!now.length) return;
TOOLS_WAIT = TOOLS_WAIT.filter(q => now.indexOf(q) === -1);
now.forEach(q => { if (!TOOLS_ON.some(e => String(e.w.id) === String(q.w.id))) widgetUp_(q.w, q.col); });
}
function toolsStop_(keep, wait) {
TOOLS_WAIT = wait ? TOOLS_WAIT.filter(wait) : [];
if (!TOOLS_WAIT.length) {
if (TOOLS_WAKE) { clearTimeout(TOOLS_WAKE); TOOLS_WAKE = 0; }
TOOLS_BUSY_SINCE = 0;
}
const off = keep ? TOOLS_ON.filter(e => !keep(e)) : TOOLS_ON;
TOOLS_ON = keep ? TOOLS_ON.filter(keep) : [];
off.forEach(widgetDown_);
}
function widgetsGlass_(settled) {
if (typeof GLASS === 'undefined' || !GLASS || GLASS.at !== AT) return;
const lit = new Set(GLASS.pages);
const glassy = (col, slot) => col !== AT && !!slot && slot.isConnected && lit.has(slot.closest('.page'));
const front = new Set(WIDGET_COLS.indexOf(AT) !== -1 ? widgetsOn_(AT).map(w => String(w.id)) : []);
const ti = TABS.findIndex(t => t.id === AT);
const far = c => Math.abs(TABS.findIndex(t => t.id === c) - ti);
const beside = new Map();
GLASS.cols.filter(c => c !== AT && WIDGET_COLS.indexOf(c) !== -1)
.sort((a, b) => far(a) - far(b) || TABS.findIndex(t => t.id === a) - TABS.findIndex(t => t.id === b))
.forEach(col => widgetsOn_(col).forEach(w => {
const id = String(w.id);
if (typeof w.start !== 'function') return;
const slot = slotOn_(col, id);
if (!glassy(col, slot)) return;
if (!beside.has(id)) beside.set(id, []);
beside.get(id).push({ w, col });
}));
const who = widgetWho_();
const keep = e => (e.col === AT ? front.has(String(e.w.id)) && (!e.slot || e.slot.isConnected)
: glassy(e.col, e.slot) && e.who === who);
const wait = q => (q.col === AT ? front.has(String(q.w.id)) : glassy(q.col, slotOn_(q.col, String(q.w.id))));
if (!settled && TOOLS_ON.some(e => !keep(e))) afterSlide_(widgetsSettle_, 'glass');
toolsStop_(settled ? keep : () => true, wait);
beside.forEach((copies, id) => {
if (front.has(id)) {
if (TOOLS_ON.some(e => String(e.w.id) === id && e.col === AT)) copies.forEach(c => {
const sl = slotOn_(c.col, id);
if (sl && sl.getAttribute('aria-busy') && typeof loaded_ === 'function') { loaded_(sl); sl.LENT = true; }
});
return;
}
if (TOOLS_ON.some(e => String(e.w.id) === id && keep(e))) {
copies.forEach(c => { const sl = slotOn_(c.col, id); if (sl && sl.getAttribute('aria-busy') && typeof loaded_ === 'function') { loaded_(sl); sl.LENT = true; } });
return;
}
if (TOOLS_WAIT.some(q => String(q.w.id) === id)) return;
TOOLS_WAIT.push({ w: copies[0].w, col: copies[0].col });
});
if (TOOLS_WAIT.length) widgetsLater_();
}
function widgetsSettle_() { widgetsGlass_(true); }
function aheadDrawWidget_(w, col) {
const id = String(w.id);
const slot = slotOn_(col, id);
if (!slot || !slot.getAttribute('aria-busy')) return;
const had = Object.prototype.hasOwnProperty.call(WIDGET_HOME, slot.id) ? WIDGET_HOME[slot.id] : undefined;
WIDGET_HOME[slot.id] = col;
let drawn = true;
try { drawn = (typeof w.draw === 'function' ? w.draw() : w.start()) !== false; }
catch (e) { drawn = false; try { console.warn('[widget ahead]', id, e); } catch (x) {} }
finally { if (had === undefined) delete WIDGET_HOME[slot.id]; else WIDGET_HOME[slot.id] = had; }
if (!drawn) { slot.NOAHEAD = true; return; }
if (typeof loaded_ === 'function') loaded_(slot);
delete slot.LENT;
slot.AHEAD = { who: widgetWho_(), act: ACT_EPOCH, draw: DRAW_EPOCH, ups: WIDGET_UPS[id] || 0, pure: !!w.pure };
slot.WHO = widgetWho_();
}
function aheadWidgetJobs_() {
const out = [];
const front = new Set(WIDGET_COLS.indexOf(AT) !== -1 ? widgetsOn_(AT).map(w => String(w.id)) : []);
WIDGET_COLS.forEach(col => {
if (col === AT || STALE[col] || !TABS.some(t => t.id === col)) return;
const host = document.getElementById('s-' + col);
if (!host || !host.firstElementChild) return;
let pages = null;
widgetsOn_(col).forEach(w => {
const id = String(w.id);
if (typeof w.start !== 'function' || (w.stop && typeof w.draw !== 'function')) return;
if (front.has(id)) return;
if (TOOLS_ON.some(e => String(e.w.id) === id) || TOOLS_WAIT.some(q => String(q.w.id) === id)) return;
const slot = slotOn_(col, id);
if (!slot || !slot.getAttribute('aria-busy') || slot.NOAHEAD) return;
if (!pages) pages = [...host.querySelectorAll(':scope > .page')];
const pos = pages.indexOf(slot.closest('.page'));
const dp = pos < 0 ? 0 : Math.abs(logIndex_(col, pos) - (PAGE[col] || 0));
out.push({ key: 'widget:' + col + ':' + id, kind: 'widget', d: aheadDist_(col, null) + Math.min(15, dp) / 16, pre: !!w.pure,
run: () => aheadDrawWidget_(w, col) });
});
});
return out;
}
AHEAD_KINDS.push(aheadWidgetJobs_);
function widgetsBeforeSlide_(col) {
if (WIDGET_COLS.indexOf(col) === -1) return;
widgetsOn_(col).forEach(w => {
const id = String(w.id);
if (typeof w.start !== 'function' || (w.stop && typeof w.draw !== 'function')) return;
if (TOOLS_ON.some(e => String(e.w.id) === id)) return;
const slot = slotOn_(col, id);
if (!slot || !slot.getAttribute('aria-busy') || slot.NOAHEAD || widgetDistance_(w, col) !== 0) return;
aheadDrawWidget_(w, col);
});
}
const progressToday_ = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
const progressDaysSaid_ = n => (n === 0 ? 'today' : n + (n === 1 ? ' day' : ' days'));
function tdEaster_(yy) {
const D = (y, m, d) => new Date(y, m, d);
const a = yy % 19, b = Math.floor(yy / 100), c = yy % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
return D(yy, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1);
}
function tdYear_(y) {
const D = (yy, m, d) => new Date(yy, m, d), add = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const nth = (yy, mo, wd, n) => {
if (n > 0) { const d = D(yy, mo, 1); return add(d, ((wd - d.getDay() + 7) % 7) + 7 * (n - 1)); }
const d = D(yy, mo + 1, 0); return add(d, -((d.getDay() - wd + 7) % 7));
};
const fri = d => add(d, -((d.getDay() - 5 + 7) % 7)), mon = d => add(d, (8 - d.getDay()) % 7);
const octMon = nth(y, 9, 1, -1), octHalf = octMon.getDate() + 4 > 31 ? add(octMon, -7) : octMon;
let xmas = fri(D(y, 11, 21)); if (xmas.getDate() < 16) xmas = D(y, 11, 20);
let jan = mon(D(y + 1, 0, 2)); if (jan.getDate() <= 3 && D(y + 1, 0, 1).getDay() % 6 === 0) jan = add(jan, 1);
const feb = mon(D(y + 1, 1, 12)), eas = tdEaster_(y + 1), gf = add(eas, -2), em = add(eas, 1);
const floor = mon(em < D(y + 1, 2, 29) ? em : D(y + 1, 2, 29)), early = add(gf, -11), easStart = early > floor ? early : floor;
const springEnd = gf < easStart ? add(gf, -1) : add(easStart, -3), summer = add(easStart, 14) > em ? add(easStart, 14) : add(em, 1);
const may = nth(y + 1, 4, 1, -1), jul = tdJul_(y + 1);
const terms = [['Autumn 1', tdYear0_(y), add(octHalf, -3)], ['Autumn 2', add(octHalf, 7), xmas], ['Spring 1', jan, add(feb, -3)],
['Spring 2', add(feb, 7), springEnd], ['Summer 1', summer, add(may, -3)], ['Summer 2', add(may, 7), jul]];
const hols = SHARED_SETTINGS.calendar.breaks, summerHols = hols[hols.length - 1];
const out = [];
terms.forEach((t, i) => {
out.push({ name: t[0], kind: 'term', from: t[1], to: t[2] });
if (i < hols.length - 1) out.push({ name: hols[i].name, kind: hols[i].kind, from: add(t[2], 1), to: add(terms[i + 1][1], -1) });
});
out.push({ name: summerHols.name, kind: summerHols.kind, from: add(jul, 1), to: add(tdYear0_(y + 1), -1) });
return out;
}
function tdJul_(y) { const d = new Date(y, 6, 22); return d.getDay() % 6 ? d : new Date(y, 6, d.getDay() ? 21 : 20); }
function tdYear0_(y) {
let d = new Date(y, 8, 1 + ((3 - new Date(y, 8, 1).getDay() + 7) % 7));
if (d.getDate() > 5) { d = new Date(y, 8, 1); while (d.getDay() === 0 || d.getDay() > 4) d.setDate(d.getDate() + 1); }
return d;
}
const tdKey_ = () => 'familyTermShift:' + ((typeof USER !== 'undefined' && USER && USER.personId) || 'anon');
function tdShift_() { try { const o = JSON.parse(keep_.get(tdKey_()) || 'null'); return { s: +(o && o.s) || 0, e: +(o && o.e) || 0 }; } catch (e) { return { s: 0, e: 0 }; } }
function tdSchoolDays_(d, n) { let x = new Date(d.getTime()); const st = n < 0 ? -1 : 1; for (let k = Math.abs(n); k > 0;) { x.setDate(x.getDate() + st); if (x.getDay() % 6) k--; } return x; }
function termDatesRows_(today) {
const t = today || progressToday_(), y = t.getMonth() >= 7 ? t.getFullYear() : t.getFullYear() - 1, sh = tdShift_();
const all = tdYear_(y - 1).concat(tdYear_(y), tdYear_(y + 1)).map(x => Object.assign({}, x));
all.forEach((x, i) => {
if (x.kind !== 'term') return;
if (sh.s) { x.from = tdSchoolDays_(x.from, sh.s); if (all[i - 1]) all[i - 1].to = new Date(x.from.getFullYear(), x.from.getMonth(), x.from.getDate() - 1); }
if (sh.e) { x.to = tdSchoolDays_(x.to, sh.e); if (all[i + 1]) all[i + 1].from = new Date(x.to.getFullYear(), x.to.getMonth(), x.to.getDate() + 1); }
});
const i = all.findIndex(x => x.from <= t && t <= x.to);
return all.slice(Math.max(0, i), Math.max(0, i) + (TD_MORE ? 10 : 4)).map((x, k) => Object.assign(x, { now: k === 0 && i >= 0 }));
}
const tdDay_ = d => fmtDate_(d, 'day') + ' ' + fmtDate_(d);
function tdLine_(x) {
const back = new Date(x.to.getFullYear(), x.to.getMonth(), x.to.getDate() + 1);
while (back.getDay() % 6 === 0) back.setDate(back.getDate() + 1);
const v = x.kind === 'term' ? `${tdDay_(x.from)} – last day of term ${tdDay_(x.to)}` : `from ${tdDay_(x.from)} · first day back ${tdDay_(back)}`;
return progRow_((x.now ? 'Now: ' : '') + x.name, v, '', `td-${x.kind}${x.now ? ' td-now' : ''}`);
}
const progRow_ = (k, v, vLook, rowLook) => ({ type: 'group', look: 'row' + (rowLook ? ' ' + rowLook : ''), blocks: [{ type: 'group', tag: 'span', look: 'k', text: String(k) },
Object.assign({ type: 'group', tag: 'span', look: 'v' + (vLook ? ' ' + vLook : '') }, v && typeof v === 'object' && v.type ? { blocks: [v] } : { text: String(v) })] });
let TD_MORE = false;
function paintTermDates_() {
const rows = termDatesRows_(), sh = tdShift_();
const adj = (id, v, label) => progRow_(label, { type: 'control', tag: 'select', attrs: { class: 'td-adj', 'data-td': id, 'aria-label': label },
options: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(n => ({ value: String(n), on: n === v, text: n ? (n > 0 ? n + ' later' : -n + ' earlier') : 'as usual' })) });
const blocks = rows.map(tdLine_).concat(adj('s', sh.s, 'My school starts'), adj('e', sh.e, 'My school ends'),
{ type: 'tiles', tiles: [{ icon: TD_MORE ? 'up' : 'down', label: TD_MORE ? 'Fewer' : 'Later', note: TD_MORE ? 'the next four' : 'the year ahead', act: 'td-more' }] });
document.querySelectorAll('.td-box').forEach(box => {
box.removeAttribute('aria-busy');
box.innerHTML = cardBlocks_(blocks);
});
}
on('td-more', () => { TD_MORE = !TD_MORE; paintTermDates_(); });
document.addEventListener('change', e => {
const el = e.target && e.target.closest && e.target.closest('.td-adj');
if (!el) return;
const o = tdShift_(); o[el.dataset.td] = Number(el.value) || 0;
keep_.put(tdKey_(), JSON.stringify(o));
paintTermDates_();
});
function progressPresses_() {
const who = typeof whoIs_ === 'function' ? whoIs_() : '';
if (!who) return [];
const pid = USER && USER.personId ? String(USER.personId) : '';
const out = {};
try {
const s = DATA && DATA.submissions;
if (pid && s && String(s.for || '') === pid && s.mine && typeof s.mine === 'object') {
Object.keys(s.mine).forEach(k => {
const e = s.mine[k];
if (e && String(e.answer || '').trim()) out[k] = { v: String(e.verdict || ''), at: Number(e.at) || 0 };
});
}
} catch (e) {}
try {
const all = typeof subAll_ === 'function' ? subAll_(who) : {};
Object.keys(all).forEach(k => {
const e = all[k];
if (!e || typeof e.a !== 'string' || !e.a.trim()) return;
const at = Number(e.at) || 0;
if (!out[k] || out[k].at <= at) out[k] = { v: String(e.v || ''), at: at };
});
} catch (e) {}
return Object.keys(out).map(k => ({ key: k, v: out[k].v, at: out[k].at }));
}
function progressScore_(v) {
if (v === 'right') return { got: 1, of: 1 };
if (v === 'wrong') return { got: 0, of: 1 };
const m = /^(?:ai|rule):(\d{1,3})\/(\d{1,3})$/.exec(String(v || ''));
return m && +m[2] > 0 ? { got: Math.min(+m[1], +m[2]), of: +m[2] } : null;
}
const progressDay_ = ms => { const d = new Date(ms); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
const progressPaperOf_ = x => String((x && x.row && x.row.paper_id) || (x && x.sub) || '');
function progressSeries_(x) {
const subj = String(x.subject || ''), board = String(x.examBoard || (x.row && x.row.exam_board) || '');
const co = String(x.company || (x.row && x.row.company) || '');
if (board) return (subj ? subj + ' ' : '') + 'past papers';
return [co, co.toLowerCase().indexOf(subj.toLowerCase()) === -1 ? subj : '', 'sets'].filter(Boolean).join(' ');
}
function progressStats_() {
const presses = progressPresses_();
const index = new Map();
let items = [];
try { items = (typeof stuffItemsAll_ === 'function' ? stuffItemsAll_() : []) || []; } catch (e) { items = []; }
items.forEach(x => { if (x && x.kind === 'question') index.set(String(x.key || x.name), x); });
const topics = {}, days = {}, papers = {};
let right = 0, got = 0, of = 0;
const recent = [];
presses.forEach(p => {
const x = index.get(p.key.replace(/#[^#]*$/, ''));
const sc = progressScore_(p.v);
const ok = !!(sc && sc.got === sc.of);
if (sc) { got += sc.got; of += sc.of; if (ok) right++; }
if (p.at > 0) { const d = progressDay_(p.at); days[d] = (days[d] || 0) + 1; }
recent.push({ x: x, p: p, sc: sc, ok: ok });
if (!x) return;
const pid = progressPaperOf_(x);
if (pid) {
const pp = papers[pid] || (papers[pid] = { id: pid, x: x, done: {}, got: 0, of: 0, at: 0 });
pp.done[String(x.key || x.name)] = sc || { sent: 1 };
if (sc) { pp.got += sc.got; pp.of += sc.of; }
if (p.at > pp.at) pp.at = p.at;
}
let ts = Array.isArray(x.topic) ? x.topic : topicAtoms_(x.topic || (x.row && x.row.topics) || '');
if (!ts.length) ts = [String(x.subject || 'Other')];
ts.forEach(t => {
const o = topics[t] || (topics[t] = { topic: t, n: 0, right: 0, marked: 0, got: 0, of: 0, miss: null });
o.n++;
if (sc) { o.marked++; o.got += sc.got; o.of += sc.of; if (ok) o.right++; else if (!o.miss || p.at > o.miss.at) o.miss = { key: p.key, at: p.at }; }
});
});
recent.sort((a, b) => b.p.at - a.p.at);
let streak = 0;
const t0 = new Date(); t0.setHours(12, 0, 0, 0);
for (let i = days[progressDay_(t0.getTime())] ? 0 : 1; i < 400; i++) {
if (!days[progressDay_(t0.getTime() - i * 864e5)]) break;
streak++;
}
let week = 0, weekDays = 0;
for (let i = 0; i < 7; i++) { const n = days[progressDay_(t0.getTime() - i * 864e5)] || 0; week += n; if (n) weekDays++; }
const list = Object.keys(topics).map(k => topics[k]).sort((a, b) => b.n - a.n || a.topic.localeCompare(b.topic));
const weak = list.filter(o => o.of > 0 && o.got < o.of)
.sort((a, b) => a.got / a.of - b.got / b.of || b.of - a.of || a.topic.localeCompare(b.topic)).slice(0, 3);
const inPaper = {}, inSeries = {};
const started = new Set(Object.keys(papers));
items.forEach(x => {
if (!x || x.kind !== 'question') return;
const pid = progressPaperOf_(x);
if (!pid) return;
(inPaper[pid] = inPaper[pid] || []).push(x);
const sr = progressSeries_(x);
(inSeries[sr] = inSeries[sr] || new Set()).add(pid);
});
const series = {};
Object.keys(papers).forEach(pid => {
const pp = papers[pid];
pp.all = (inPaper[pid] || [pp.x]).slice().sort((a, b) => String(a.qNumber || a.name).localeCompare(String(b.qNumber || b.name), undefined, { numeric: true })
|| String(a.qPart || '').localeCompare(String(b.qPart || '')));
const sr = progressSeries_(pp.x);
(series[sr] = series[sr] || { name: sr, papers: [], at: 0 }).papers.push(pp);
if (pp.at > series[sr].at) series[sr].at = pp.at;
});
const seriesList = Object.keys(series).map(k => {
const sr = series[k];
sr.papers.sort((a, b) => b.at - a.at);
sr.untouched = [...(inSeries[k] || [])].filter(pid => !started.has(pid)).length;
return sr;
}).sort((a, b) => b.at - a.at);
return { n: presses.length, right: right, got: got, of: of, topics: list, weak: weak, papers: papers,
series: seriesList, recent: recent.slice(0, 3), streak: streak, week: week, weekDays: weekDays };
}
const progressPct_ = (a, b) => (b > 0 ? Math.round(100 * a / b) : 0);
const progressCard_ = (look, name, body, more) => setCard_(Object.assign({ card: 'acct:' + look, hook: look, title: name, body }, more || {}));
const PROG_OPEN = new Set();
document.addEventListener('toggle', e => {
const el = e.target;
if (!el || !el.classList || !el.classList.contains('prog-paper')) return;
const k = el.getAttribute('data-paper') || '';
if (el.open) PROG_OPEN.add(k); else PROG_OPEN.delete(k);
}, true);
function progressPaperName_(x) {
return String((x.row && x.row.name) || x.sub || x.name || 'A paper');
}
function progressSourceRow_(sr) {
let got = 0, of = 0, left = 0;
const lines = sr.papers.slice(0, 15).map(pp => {
const total = pp.all.length, done = Object.keys(pp.done).length, l = Math.max(0, total - done);
got += pp.got; of += pp.of; left += l;
const sums = (pp.of ? pp.got + '/' + pp.of + ' marks · ' : '') + (l ? l + ' left' : 'all done');
const qs = pp.all.map(q => {
const k = String(q.key || q.name), sc = pp.done[k];
const v = !sc ? 'not done' : sc.sent ? 'sent' : sc.of > 1 ? sc.got + '/' + sc.of : sc.got ? 'right' : 'wrong';
const tone = !sc || sc.sent ? '' : sc.got === sc.of ? ' is-good' : ' is-bad';
return progRow_('Q' + (q.qNumber != null && q.qNumber !== '' ? q.qNumber + (q.qPart || '') : q.name), v, `prog-v${tone}`);
});
return progressOpen_('paper:' + pp.id, progRow_(progressPaperName_(pp.x), sums), [{ type: 'group', look: 'prog-qs', blocks: qs }]);
});
const untouched = sr.untouched ? [progRow_('Not started', sr.untouched + (sr.untouched === 1 ? ' paper' : ' papers'))] : [];
const name = sr.name.charAt(0).toUpperCase() + sr.name.slice(1);
const sums = (of ? progressPct_(got, of) + '% marks · ' : '') + (left ? left + ' left' : 'all done');
return progressOpen_('src:' + sr.name, progRow_(name, sums), [{ type: 'group', look: 'prog-qs', blocks: lines.concat(untouched) }], 'prog-src');
}
const progressOpen_ = (k, sum, blocks, look) => ({ type: 'group', tag: 'details', look: 'prog-paper' + (look ? ' ' + look : ''), attrs: { 'data-paper': k, open: PROG_OPEN.has(k) },
blocks: [Object.assign(sum, { tag: 'summary' })].concat(blocks) });
const PROG_GCSE_STEPS = [[80, '9'], [70, '8'], [60, '7'], [50, '6'], [40, '5'], [30, '4'], [20, '3'], [12, '2'], [5, '1']];
const PROG_ALEVEL_STEPS = [[80, 'A*'], [70, 'A'], [60, 'B'], [50, 'C'], [40, 'D'], [30, 'E']];
const PROG_SATS_STEPS = [[75, 'greater depth'], [55, 'expected standard']];
function progressLevel_(x) {
const r = x.row || {};
const said = [x.tier, x.bandValue, r.band_value, r.level, r.key_stage, x.keystage].map(v => String(v || '')).join(' ');
if (/a-?level|\bas\b/i.test(said)) return 'alevel';
if (/ks2|sats/i.test(said) || /standards & testing/i.test(String(x.company || r.company || ''))) return 'sats';
if (/ks4|gcse|foundation|higher/i.test(said)) return 'gcse';
return '';
}
function progressGrade_(steps, pct, low) {
const s = steps.find(([at]) => pct >= at);
return s ? s[1] : low;
}
function progressGrades_(st) {
const by = {};
Object.keys(st.papers).forEach(pid => {
const pp = st.papers[pid];
if (!pp.of) return;
const x = pp.x, subj = String(x.subject || 'Other');
const lv = String(x.examBoard || (x.row && x.row.exam_board) || '') ? progressLevel_(x) : '';
const grade = x.bandType === 'grade' && x.bandValue ? String(x.bandValue) : '';
if (!lv && !grade) return;
const k = subj + '|' + (lv || 'grade');
const o = by[k] || (by[k] = { subj: subj, lv: lv, got: 0, of: 0, n: 0, best: 0 });
o.got += pp.got; o.of += pp.of; o.n++;
if (!lv && pp.got / pp.of >= 0.7 && +grade > o.best) o.best = +grade;
});
const rows = Object.keys(by).map(k => by[k]).filter(o => o.lv || o.best).map(o => {
const pct = progressPct_(o.got, o.of);
const g = o.lv === 'gcse' ? 'grade ' + progressGrade_(PROG_GCSE_STEPS, pct, 'U')
: o.lv === 'alevel' ? progressGrade_(PROG_ALEVEL_STEPS, pct, 'U')
: o.lv === 'sats' ? progressGrade_(PROG_SATS_STEPS, pct, 'working towards')
: 'working at grade ' + o.best;
const label = o.subj + (o.lv === 'gcse' ? ' GCSE' : o.lv === 'alevel' ? ' A-level' : o.lv === 'sats' ? ' SATs' : ' worksheets');
return [label, g];
});
return rows;
}
function progressSessions_() {
const jobs = typeof myJobs_ === 'function' ? myJobs_() : [];
const ahead = [], past = [];
const t0 = progressToday_();
jobs.forEach(j => {
if (/cancel/i.test(String(j.status || '')) || typeof jobOn_ !== 'function') return;
for (let i = -28; i <= 28; i++) {
const d = new Date(t0.getTime()); d.setDate(d.getDate() + i);
let on = false;
try { on = jobOn_(j, d); } catch (e) { on = false; }
if (on) (i >= 0 ? ahead : past).push({ d: d, j: j });
}
});
ahead.sort((a, b) => a.d - b.d); past.sort((a, b) => b.d - a.d);
return { ahead: ahead.slice(0, 3), past: past.slice(0, 3) };
}
function progressSessionsCard_(ss) {
if (!ss.ahead.length && !ss.past.length) return setCard_({ card: 'acct:prog-sessions', title: 'Sessions', state: 'empty' });
const when = s => fmtDate_(s.d, 'day') + ' ' + fmtDate_(s.d) + (s.j.time ? ' · ' + fmtDate_(s.j.time, 'time') : '');
const row = s => progRow_(when(s), s.j.title || s.j.subject || 'Session');
return progressCard_('prog-sessions', 'Sessions', ss.ahead.map(row).concat(ss.past.map(row)),
{ actions: [{ icon: 'book', label: 'Sessions', note: 'on Book', act: 'prog-sessions' }] });
}
function progressCards_() {
const signed = typeof USER !== 'undefined' && !!USER;
return [progressAllCard_(), progressSessionsCard_(signed ? progressSessions_() : { ahead: [], past: [] })];
}
const progressOfWhom_ = () => (typeof USER !== 'undefined' && USER && !USER.lockedPreview && rank_(whose_()) === 'student' ? String((whose_() && whose_().personId) || USER.personId || '') : '');
function progressAllSpec_(of) {
const signed = typeof USER !== 'undefined' && !!USER;
const st = signed ? progressStats_() : { n: 0, weak: [], series: [], papers: {}, topics: [], recent: [] };
of = of == null ? progressOfWhom_() : of;
const top = st.n ? [progRow_('Streak', st.streak ? progressDaysSaid_(st.streak) : 'none yet'),
progRow_('Last 7 days', `${st.week} on ${progressDaysSaid_(st.weekDays)}`),
progRow_('Marks', st.of ? st.got + ' of ' + st.of + ' (' + progressPct_(st.got, st.of) + '%)' : 'none marked yet', '', 'prog-tot')]
.concat(progressGrades_(st).map(([k, g]) => progRow_('Grade · ' + k, g, '', 'prog-tot')),
st.weak.length ? [progRow_('Work on next', st.weak.map(o => o.topic).join(', '))] : []) : [];
const src = st.series.slice(0, 8).map(progressSourceRow_);
const day = of && typeof histBody_ === 'function' ? [{ type: 'group', look: 'prog-day', blocks: [{ type: 'msgHead', text: 'Day by day' }].concat(histBody_(of)) }] : [];
if (!top.length && !src.length && !day.length) return null;
return { card: 'acct:progress', hook: 'prog-all', title: 'Progress', data: of ? { of, hist: 1 } : {}, body: top.concat(src, day) };
}
function progressAllCard_(of) {
const spec = progressAllSpec_(of);
return setCard_(spec || { card: 'acct:progress', title: 'Progress', state: 'empty' });
}
const progressComing_ = () => typeof USER !== 'undefined' && !!USER && ((typeof awaiting_ === 'function' && awaiting_())
|| (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null && !LIBRARY_FAILED));
on('prog-sessions', () => { go('booking'); });
;
/* js/overworld.js */
const FEED_PICS = {};
function feedPicture(query) {
const q = String(query || '').trim();
if (!q) return Promise.resolve(null);
if (FEED_PICS[q] !== undefined) return Promise.resolve(FEED_PICS[q]);
const key = ((DATA.constants || {}).vars || {}).giphy_key;
const url = key
? 'https://api.giphy.com/v1/gifs/search?api_key=' + encodeURIComponent(key)
+ '&q=' + encodeURIComponent(q)
+ '&limit=1&rating=g&lang=en'
: 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*'
+ '&generator=search&gsrnamespace=6&gsrlimit=1'
+ '&gsrsearch=' + encodeURIComponent('filetype:bitmap ' + q)
+ '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=900';
return dataFile_(url, { fail: true })
.then(d => {
let out = null;
if (key) {
const g = (d.data || [])[0];
if (g) out = { src: (g.images && g.images.downsized_medium || {}).url || '',
by: 'GIPHY' };
} else {
const pages = ((d.query || {}).pages) || {};
const first = Object.keys(pages).map(k => pages[k])[0];
const info = first && (first.imageinfo || [])[0];
if (info) {
const meta = info.extmetadata || {};
out = {
src: info.thumburl || info.url,
by: String((meta.Artist || {}).value || '').replace(/<[^>]*>/g, '').trim().slice(0, 60)
|| 'Wikimedia Commons',
};
}
}
FEED_PICS[q] = out && out.src ? out : null;
return FEED_PICS[q];
})
.catch(() => null);
}
function drawFeed() {
const host = $('feed-screen');
if (!host) return;
FEED_AT = Math.max(0, FEED_AT);
const it = feedItem(FEED_AT);
if (!it) return;
host.innerHTML = (window.feedSlide || (() => ''))(it);
const vid = host.querySelector('video.feed-vid');
if (vid && typeof window.reelPlay_ === 'function') window.reelPlay_(vid);
const at = FEED_AT;
if (it.pic) feedPicture(it.pic).then(found => {
if (!found || at !== FEED_AT) return;
const art = host.querySelector('.feed-art');
if (!art) return;
const img = new Image();
img.onload = () => {
if (at !== FEED_AT) return;
art.style.backgroundImage = `url("${found.src}")`;
art.classList.add('has-photo');
const cred = host.querySelector('.feed-credit');
if (cred && found.by) cred.textContent = found.by;
};
img.src = found.src;
});
}
on('feed-tap', (el, e) => {
const box = el.getBoundingClientRect();
const x = (e && e.clientX !== undefined ? e.clientX : box.right) - box.left;
FEED_AT += (x < box.width * 0.3 && FEED_AT > 0) ? -1 : 1;
drawFeed();
});
let flappyState = null;
function noSwipe_(t) {
const n = t && t.closest ? t.closest('[data-noswipe]') : null;
return !!n && !(n.classList && n.classList.contains('qpad-ink') && !n.closest('.qpad.is-drawing'));
}
const PADLOCK = { game: '', q: '' };
const padHere_ = () => String(typeof AT !== 'undefined' ? AT : '') + ':' + String((typeof PAGE !== 'undefined' && PAGE[AT]) || 0);
const gameLocked_ = id => !!PADLOCK.game && PADLOCK.game.split('@')[0] === String(id);
const gameLockLook_ = on => ({ icon: on ? 'lock' : 'unlock', label: on ? 'Locked' : 'Lock',
note: on ? 'tap to let the page move' : 'hold it still to select text', on, pressed: on });
function gameLockOpts_(id) {
return (Object.assign(gameLockLook_(gameLocked_(id)), { act: 'game-lock', cls: 'game-lock', data: { w: id } }));
}
function gameLockSet_(v) {
PADLOCK.game = v || '';
document.querySelectorAll('.game-lock').forEach(el => {
const on = gameLocked_(el.getAttribute('data-w'));
tileSet_(el, gameLockLook_(on));
const w = el.closest('.is-widget'), row = el.closest('.tile-row');
if (w) w.classList.toggle('is-locked', on);
const card = w || el.closest('.card') || (row && row.previousElementSibling);
if (card) card.classList.toggle('is-held', on);
});
pageHold_(!!PADLOCK.game);
}
on('game-lock', el => {
const id = el.getAttribute('data-w');
gameLockSet_(gameLocked_(id) ? '' : id + '@' + padHere_());
});
function gameLockStray_() { if (PADLOCK.game && PADLOCK.game.split('@')[1] !== padHere_()) gameLockSet_(''); }
document.addEventListener('visibilitychange', () => { if (document.hidden && PADLOCK.game) gameLockSet_(''); });
const PAD_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown', 'Home', 'End', ' '];
function padStop_(e) {
if (!e.cancelable) return;
if (e.type === 'keydown') {
const t = e.target;
if (PAD_KEYS.indexOf(e.key) < 0 || (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))) return;
}
e.preventDefault();
}
let PAD_HOLD = false;
function pageHold_(on) {
if (!!on === PAD_HOLD) return;
PAD_HOLD = !!on;
document.documentElement.classList.toggle('padlocked', PAD_HOLD);
['touchmove', 'wheel'].forEach(n => (on ? addEventListener : removeEventListener)(n, padStop_, { passive: false }));
(on ? addEventListener : removeEventListener)('keydown', padStop_);
}
let RESHAPE = 0;
function reshaped_() {
clearTimeout(RESHAPE);
RESHAPE = setTimeout(() => { try { placeCells('x', true); } catch (err) {} }, 100);
}
addEventListener('resize', reshaped_, { passive: true });
addEventListener('orientationchange', reshaped_, { passive: true });
if (window.visualViewport) {
visualViewport.addEventListener('resize', reshaped_, { passive: true });
}
function bootFailed(err, when) {
try {
const box = document.getElementById('screen') || document.body;
const line = (look, text) => ({ type: 'group', tag: 'p', look, text });
const said = [line('boot-fail-head', 'The app stopped while ' + String(when) + '.'), line('boot-fail-why', why_(err)),
err && err.stack ? line('boot-fail-why boot-fail-stack', String(err.stack).split('\n').slice(0, 4).join('\n')) : null,
line('boot-fail-ver', 'site ' + SITE_VERSION + ' · css ' + cssVersion())].filter(Boolean);
if (typeof cardBlock_ === 'function') box.innerHTML = cardBlock_({ type: 'group', look: 'boot-fail', blocks: said });
else box.textContent = said.map(p => p.text).join('\n');
} catch (e2) {
}
try { console.error('@family. stopped while ' + when, err); } catch (e3) {}
}
let toldYou = false;
addEventListener('error', e => {
if (e && e.target && e.target !== window && e.target.tagName) {
const src = e.target.currentSrc || e.target.src || '';
console.warn('[load]', e.target.tagName, src);
if (e.target.tagName === 'SCRIPT') {
banner('A part of the app did not load: ' + (src.split('/').pop().split('?')[0] || 'unknown')
+ ' — and everything listed after it in index.html is missing too. Check that file is '
+ 'there and that its name matches the list in index.html exactly.');
}
return;
}
if (toldYou) return;
toldYou = true;
const msg = String((e && e.error && e.error.message) || (e && e.message) || 'something went wrong');
console.error('[window]', (e && e.error) || msg);
banner(text_('something-went-wrong') + msg
+ (/^Script error/i.test(msg)
? ' — the browser will not say more than that when the app is opened from a file rather '
+ 'than from a web address. The console has the real one.'
: ''));
});
const SHEET_FLICK = { live: false, id: 0, x: 0, y: 0, at: 0 };
addEventListener('pointerdown', e => {
if (!e.isPrimary || typeof sheetStep !== 'function' || !sheetStep) return;
if ($('sheet').classList.contains('hidden')) return;
if (e.pointerType === 'mouse' && e.buttons !== 1) return;
if (e.target.closest?.('input, textarea, select, button, a') || noSwipe_(e.target)) return;
SHEET_FLICK.live = true; SHEET_FLICK.id = e.pointerId;
SHEET_FLICK.x = e.clientX; SHEET_FLICK.y = e.clientY; SHEET_FLICK.at = Date.now();
}, { passive: true });
addEventListener('pointerup', e => {
if (!SHEET_FLICK.live || e.pointerId !== SHEET_FLICK.id) return;
SHEET_FLICK.live = false;
if (typeof sheetStep !== 'function' || !sheetStep) return;
const dx = e.clientX - SHEET_FLICK.x, dy = e.clientY - SHEET_FLICK.y;
if (Math.abs(dy) < 60 || Math.abs(dy) < Math.abs(dx) * 1.4) return;
if (Date.now() - SHEET_FLICK.at > 750) return;
const body = $('sheet-body');
if (body) {
const room = body.scrollHeight - body.clientHeight;
const pos = body.scrollTop;
if (dy < 0 && room - pos > 2) return;
if (dy > 0 && pos > 2) return;
}
try { sheetStep(dy > 0 ? -1 : 1); } catch (err) {}
}, { passive: true });
;
/* js/select.js */
const SELECT_IN = '#sheet-body, .widget-full, .card, .cpn, .screen';
const SELECT_CARD = '#sheet-body, .widget-full, .card, .cpn';
let selTouched = null;
let selLastBox = null;
let selLastAt = 0;
document.addEventListener('pointerdown', e => { selTouched = e.target; },
{ capture: true, passive: true });
document.addEventListener('keydown', e => {
if (e.key !== 'a' && e.key !== 'A') return;
if (!(e.ctrlKey || e.metaKey) || e.shiftKey || e.altKey) return;
const on = document.activeElement;
if (on && (/^(INPUT|TEXTAREA|SELECT)$/.test(on.tagName) || on.isContentEditable)) return;
const box = selectBoxFor_();
if (!box) return;
e.preventDefault();
selectContents_(box);
selLastBox = box;
selLastAt = Date.now();
});
function selectBoxFor_() {
const again = selLastBox && (Date.now() - selLastAt) < 2000 && document.contains(selLastBox);
if (again) {
return selLastBox.parentElement ? selLastBox.parentElement.closest(SELECT_IN) : null;
}
const on = document.activeElement;
const near = (on && on !== document.body && document.contains(on)) ? on
: ((selTouched && document.contains(selTouched)) ? selTouched : null);
const box = near && near.closest ? near.closest(SELECT_CARD) : null;
return box || selWidestOnScreen_();
}
function selWidestOnScreen_() {
const h = window.innerHeight || 0;
let best = null, most = 0;
document.querySelectorAll('#screen .widget-full, #screen .card, #screen .cpn').forEach(el => {
if (el.classList.contains('hidden') || !el.getClientRects().length) return;
const r = el.getBoundingClientRect();
const seen = Math.max(0, Math.min(r.bottom, h) - Math.max(r.top, 0));
const worth = el.classList.contains('widget-full') ? seen * 1.5 : seen;
if (worth > most) { most = worth; best = el; }
});
return best;
}
function selectContents_(box) {
const sel = window.getSelection && window.getSelection();
if (!sel) return;
try {
const r = document.createRange();
r.selectNodeContents(box);
sel.removeAllRanges();
sel.addRange(r);
} catch (err) {
}
}
;
/* js/tiles.js */
const TILE_CONE_ = '<path d="M2.5 6.5h3l4-3.5v11l-4-3.5h-3z"/>';
const TILE_WAVES_ = '<path d="M12 6.2a3.2 3.2 0 0 1 0 4.6"/><path d="M14 4a6 6 0 0 1 0 9"/>';
const TILE_ICONS = {
play: '<path d="M5 3.5v11l9-5.5z"/>',
more: '<circle cx="4" cy="8.5" r=".9"/><circle cx="9" cy="8.5" r=".9"/><circle cx="14" cy="8.5" r=".9"/>',
up: '<path d="M9 14.5v-12"/><path d="m4.5 7 4.5-4.5 4.5 4.5"/>',
down: '<path d="M9 2.5v12"/><path d="m4.5 10 4.5 4.5 4.5-4.5"/>',
left: '<path d="M15 8.5h-12"/><path d="m7.5 4 -4.5 4.5 4.5 4.5"/>',
right: '<path d="M3 8.5h12"/><path d="m10.5 4 4.5 4.5-4.5 4.5"/>',
'col-left': '<path d="M15.5 2.5v12"/><path d="M12 8.5h-9.5"/><path d="m6.5 4.5 -4 4 4 4"/>',
'col-right': '<path d="M2.5 2.5v12"/><path d="M6 8.5h9.5"/><path d="m11.5 4.5 4 4-4 4"/>',
split: '<path d="M2.5 4.5h5v9h-5z"/><path d="M10.5 4.5h5v9h-5z"/>',
merge: '<path d="M2.5 4.5h13v9h-13z"/><path d="M9 6.5v5"/>',
pause: '<path d="M6 3.5v10"/><path d="M12 3.5v10"/>',
doc: '<path d="M4.5 2.5h6l3 3v10h-9z"/><path d="M10.5 2.5v3.5h3"/>',
print: '<path d="M5.5 6.5v-4h7v4"/><path d="M3.5 6.5h11v4h-11z"/><path d="M5.5 10.5h7v4h-7z"/>',
code: '<path d="M6.5 5.5 2.5 9l4 3.5"/><path d="m11.5 5.5 4 3.5-4 3.5"/>',
cart: '<path d="M1.5 2.5h2l2 8h8"/><path d="m4.6 4.5h11l-1.4 4.5h-8.6"/>'
+ '<circle cx="6.5" cy="14" r="1.2"/><circle cx="12.5" cy="14" r="1.2"/>',
open: '<path d="M9.5 2.5h4v4"/><path d="M13.5 2.5 7 9"/>'
+ '<path d="M12.5 10v3.5h-10v-10H6"/>',
book: '<path d="M2.5 3.5h5a2 2 0 0 1 2 2v9a2 2 0 0 0-2-2h-5z"/>'
+ '<path d="M15.5 3.5h-5a2 2 0 0 0-2 2v9a2 2 0 0 1 2-2h5z"/>',
wear: '<path d="M6 2.5 3 4v4h2v6h6V8h2V4l-3-1.5a2.2 2.2 0 0 1-4 0z"/>',
heart: '<path d="M9 15S2 10.6 2 6.2A3.6 3.6 0 0 1 9 4.6a3.6 3.6 0 0 1 7 1.6C16 10.6 9 15 9 15z"/>',
pound: '<path d="M12.5 4.2A3 3 0 0 0 7 5.5V13c0 1-.6 1.8-1.5 2h9"/><path d="M4.5 9h6"/>',
star: '<path d="m9 2.5 2 4.3 4.5.6-3.3 3.2.8 4.6L9 13l-4 2.2.8-4.6L2.5 7.4 7 6.8z"/>',
home: '<path d="M2.5 8.5 9 3l6.5 5.5"/><path d="M4.5 7v7.5h9V7"/><path d="M7.5 14.5v-4h3v4"/>',
flag: '<path d="M4 15.5v-13"/><path d="M4 3h9l-2 3 2 3H4"/>',
suggest: '<path d="M3.5 2.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H8.5l-4 3.5v-3.5h-1A1.5 1.5 0 0 1 2 11V4a1.5 1.5 0 0 1 1.5-1.5z"/><path d="m6 10.5.5-2 4-4 1.5 1.5-4 4z"/>',
door: '<path d="M3.5 15.5h11"/><path d="M5 15.5v-13h8v13"/><path d="M5 2.5l5 1.5v12"/><circle cx="8.6" cy="9.5" r=".5"/>',
spot: '<path d="M2.5 7v4h2.5l7 3.5v-11L5 7z"/><path d="M5.5 11l1 4h2l-1-3.5"/><path d="M14.5 7.5v3"/>',
edit: '<path d="M11.5 2.8 14.2 5.5 6 13.7l-3.4.7.7-3.4z"/><path d="m10.2 4.1 2.7 2.7"/>',
bin: '<path d="M2.8 4.5h12.4"/><path d="M6.5 4.5V2.8h5v1.7"/>'
+ '<path d="M4.5 4.5 5.3 15h7.4l.8-10.5"/>',
undo: '<path d="M2.8 8.5h8a3.5 3.5 0 1 1 0 7H6"/><path d="M5.5 5.5 2.5 8.5l3 3"/>',
show: '<path d="M1.5 8.5S4.2 4 9 4s7.5 4.5 7.5 4.5S13.8 13 9 13s-7.5-4.5-7.5-4.5z"/>'
+ '<circle cx="9" cy="8.5" r="2.2"/>',
tick: '<path d="M3.5 9.5l3.5 3.5 7.5-8"/>',
hand: '<path d="M6 9V4a1 1 0 0 1 2 0v4M8 8V3a1 1 0 0 1 2 0v5M10 8V3.5a1 1 0 0 1 2 0V9M12 9V5.5a1 1 0 0 1 2 0V11a4.5 4.5 0 0 1-4.5 4.5h-.5a4.5 4.5 0 0 1-3.6-1.8L3.6 10.6a1 1 0 0 1 1.6-1.2L6 10.4"/>',
hide: '<path d="M3 3.5 15 14"/>'
+ '<path d="M7 5.1A7.7 7.7 0 0 1 9 4c4.8 0 7.5 4.5 7.5 4.5a14 14 0 0 1-2.6 2.9"/>'
+ '<path d="M11.4 10.6A2.2 2.2 0 0 1 7.5 8.9"/>'
+ '<path d="M12 12.4A7.6 7.6 0 0 1 9 13c-4.8 0-7.5-4.5-7.5-4.5a14 14 0 0 1 3.3-3.4"/>',
close: '<path d="M4 4.5 14 14"/><path d="M14 4.5 4 14"/>',
lock: '<rect x="4" y="8" width="10" height="6.8" rx="1.5"/>'
+ '<path d="M6.2 8V6a2.8 2.8 0 0 1 5.6 0v2"/>',
unlock: '<rect x="4" y="8" width="10" height="6.8" rx="1.5"/>'
+ '<path d="M6.2 8V6a2.8 2.8 0 0 1 5.6 0"/>',
share: '<path d="M9 11.5V2.5"/><path d="M5.8 5.7 9 2.5l3.2 3.2"/>'
+ '<path d="M3.5 9.5v5a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-5"/>',
send: '<path d="M16 2.5 2.5 7.8l5.4 2.3z"/><path d="M16 2.5 10.2 16l-2.3-5.9z"/>'
+ '<path d="M7.9 10.1 16 2.5"/>',
save: '<path d="M3.5 9.5 7.3 13.3 14.8 4.8"/>',
plus: '<path d="M9 3.5v11"/><path d="M3.5 9h11"/>',
photo: '<rect x="2.5" y="5.5" width="13" height="9" rx="1.5"/><path d="M6.5 5.5 7.5 3.5h3l1 2"/>'
+ '<circle cx="9" cy="10" r="2.4"/>',
out: '<path d="M8.5 2.5h-5v13h5"/><path d="M7.5 9h8.5"/><path d="m13 6 3 3-3 3"/>',
in: '<path d="M9.5 2.5h5v13h-5"/><path d="M2 9h8.5"/><path d="m7.5 6 3 3-3 3"/>',
key: '<circle cx="5.5" cy="9" r="3"/><path d="M8.5 9h7"/><path d="M13.5 9v2.5"/>'
+ '<path d="M11.2 9v1.8"/>',
join: '<circle cx="7" cy="5.5" r="2.6"/><path d="M2 15.5a5 5 0 0 1 10 0"/>'
+ '<path d="M14 6v5"/><path d="M11.5 8.5h5"/>',
full: '<path d="M2.5 6.5v-4h4"/><path d="M11.5 2.5h4v4"/>'
+ '<path d="M15.5 11.5v4h-4"/><path d="M6.5 15.5h-4v-4"/>',
unfull: '<path d="M6.5 2.5v4h-4"/><path d="M11.5 2.5v4h4"/>'
+ '<path d="M15.5 11.5h-4v4"/><path d="M2.5 11.5h4v4"/>',
sync: '<path d="M3.1 6.3a6.3 6.3 0 0 1 10.4-2.35L16.7 7"/><path d="M16.7 2.8V7h-4.2"/>'
+ '<path d="M14.9 10.7a6.3 6.3 0 0 1-10.4 2.35L1.3 10"/><path d="M1.3 14.2V10h4.2"/>',
search: '<circle cx="7.6" cy="7.4" r="4.9"/><path d="m11.2 11 4.6 4.5"/>',
grid: '<path d="M2.5 2.5h13v12h-13z"/><path d="M2.5 6.5h13M2.5 10.5h13M6.8 2.5v12M11.2 2.5v12"/>',
table: '<path d="M2 3h14v11h-14z"/><path d="M2 6.7h14M2 10.3h14M7 3v11"/>',
tools: '<path d="M3 14.5 9.5 8"/><path d="M11.5 2.5a3 3 0 0 0 3.6 3.9l-2.3 2.3-2.6-.8-.8-2.6z"/><path d="M10 11l4.5 4.5M12.5 9l2 2"/>',
calc: '<rect x="4" y="1.5" width="10" height="14" rx="1.2"/><rect x="6" y="3.5" width="6" height="3"/><path d="M6.5 9h.1M9 9h.1M11.5 9h.1M6.5 11.5h.1M9 11.5h.1M11.5 11.5h.1M6.5 14h.1M9 14h.1M11.5 14h.1"/>',
zoom: '<circle cx="7.6" cy="7.4" r="4.9"/><path d="m11.2 11 4.6 4.5M5.3 7.4h4.6M7.6 5.1v4.6"/>',
film: '<rect x="2.5" y="2.5" width="13" height="12" rx="1.5"/>'
+ '<path d="M5.5 2.5v12M12.5 2.5v12M2.5 6.5h3M2.5 10.5h3M12.5 6.5h3M12.5 10.5h3"/>',
ext: '<path d="M8 3.5H3.5v11h11V10"/><path d="M10.5 2.5h5v5"/><path d="m15.5 2.5-7 7"/>',
pen: '<path d="M12.6 2.6 15 5 7.2 12.8l-3.2.8.8-3.2z"/>'
+ '<path d="M9 15.2c1.6-1.2 2.6.6 4 0s1.8-1 2.6-1"/>',
ruler: '<g transform="rotate(-38 9 8.5)"><rect x="1.5" y="5.8" width="15" height="5.4" rx="1"/>'
+ '<path d="M4.5 5.8v2.2M7.5 5.8v1.4M10.5 5.8v2.2M13.5 5.8v1.4"/></g>',
dot: '<circle cx="9" cy="9" r="2.6"/><path d="M9 2.5v3M9 12.5v3M2.5 9h3M12.5 9h3"/>',
shade: '<rect x="3" y="3" width="12" height="12"/><path d="M3 9 9 3M3 15 15 3M9 15l6-6"/>',
line: '<path d="M3.5 14.5 14.5 3.5"/><circle cx="3.5" cy="14.5" r="1.4"/><circle cx="14.5" cy="3.5" r="1.4"/>',
protractor: '<path d="M2 13.5h14M2 13.5a7 7 0 0 1 14 0"/><path d="M9 13.5 13 8.2M9 6.5v1.6M4.1 8.6l1.1 1.1M13.9 8.6l-1.1 1.1"/>',
compass: '<circle cx="9" cy="3" r="1.3"/><path d="M8.4 4.2 4.2 15.5"/><path d="M9.6 4.2 13.8 15.5"/>'
+ '<path d="M5.6 11.6c2.2 1.3 4.6 1.3 6.8 0"/>',
spark: '<path d="M8 3c.5 3.3 2.2 5 5.5 5.5-3.3.5-5 2.2-5.5 5.5-.5-3.3-2.2-5-5.5-5.5 3.3-.5 5-2.2 5.5-5.5z"/>'
+ '<path d="M14.5 1.8v3.4M12.8 3.5h3.4"/>',
figure: '<rect x="2" y="2.5" width="14" height="12" rx="1.5"/><path d="m2.5 13 4.5-5 3.5 3.5 2-2 3 3.2"/>'
+ '<circle cx="12" cy="6" r="1.2"/>',
speak: TILE_CONE_ + TILE_WAVES_,
sound: TILE_CONE_ + TILE_WAVES_,
mute: TILE_CONE_ + '<path d="M2.5 2.5 15.5 14.5"/>',
frac: '<rect x="6" y="1.5" width="6" height="4.5" rx=".8"/><path d="M3 8.5h12"/><rect x="6" y="11" width="6" height="4.5" rx=".8"/>',
power: '<rect x="2" y="6.5" width="8" height="8" rx="1"/><rect x="11.5" y="2" width="4.5" height="4.5" rx=".8"/>',
root: '<path d="M1.5 9.5 3.5 8.5 6 14.5 9 2.5h7.5"/><rect x="10" y="6" width="5.5" height="7" rx=".8"/>',
integral: '<path d="M3.5 15c1.6.6 2.6-.2 3-2.2l1.6-8.6c.4-2 1.4-2.8 3-2.2"/><rect x="11" y="7" width="5" height="6" rx=".8"/>',
newline: '<path d="M15 2.5v7H3.5"/><path d="M7 6 3.5 9.5 7 13"/>',
turn: '<path d="M6 15V3"/><path d="M3 6l3-3 3 3"/><path d="M12 3v12"/><path d="M9 12l3 3 3-3"/>',
again: '<path d="M14.8 9.5A5.8 5.8 0 1 1 13 5"/><path d="M13.4 1.6v3.6H9.8"/>',
mic: '<rect x="6.5" y="1.5" width="5" height="8.5" rx="2.5"/><path d="M3.8 8a5.2 5.2 0 0 0 10.4 0"/><path d="M9 13.2v2.3"/>',
speed: '<path d="M9 1.5v3.5"/><path d="M9 12v3.5"/><path d="M2 8.5h4.5"/><path d="M8 8.5h2"/><path d="M11.5 8.5h4.5"/>',
};
function searchPill_(attrs, cls) {
return `<label class="search-pill${cls ? ' ' + cls : ''}">${tileIcon_('search')}<input type="search" autocomplete="off" enterkeyhint="search" ${attrs}></label>`;
}
function tileIcon_(name) {
const d = TILE_ICONS[name];
if (!d) return '';
return `<svg class="tile-i tile-i-${esc(name)}" viewBox="0 0 18 17" aria-hidden="true"
    focusable="false" fill="none" stroke="currentColor" stroke-width="1.4"
    stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
}
function tile_(o) {
if (Array.isArray(o)) return o.map(tile_).join('');
if (!o) return '';
if (o.form) return `<button type="${o.submit ? 'submit' : 'button'}" class="${esc(o.look || 'btn' + (o.kind ? ' ' + o.kind : '') + (o.cls ? ' ' + o.cls : ''))}"${
o.act ? ` data-do="${esc(o.act)}"` : ''}${Object.keys(o.data || {}).map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('')}${
o.id ? ` id="${esc(o.id)}"` : ''}${o.title ? ` title="${esc(o.title)}"` : ''}${o.aria ? ` aria-label="${esc(o.aria)}"` : ''}${
o.pressed != null ? ` aria-pressed="${o.pressed ? 'true' : 'false'}"` : ''}${o.off ? ' disabled' : ''}${o.hidden ? ' hidden' : ''}${o.attrs ? ' ' + o.attrs : ''}>${
o.html != null ? o.html : esc(o.label == null ? '' : String(o.label))}</button>`;
if (o.send) o = Object.assign({ icon: 'send', label: 'Check' }, o, { cls: ((o.cls || '') + ' is-submit').trim() });
const cls = 'tile' + (o.tone ? ' is-' + o.tone : '') + (o.on ? ' on' : '') + (o.cls ? ' ' + o.cls : '');
const name = o.label + (o.note ? ' · ' + o.note : '');
const word = String(o.word || o.label || '').split(' ')[0];
const attrs = ` title="${esc(name)}" aria-label="${esc(name)}" data-w="${esc(word)}"`;
const body = o.face || tileIcon_(o.icon) || `<span class="tile-k">${esc(o.label)}</span>`;
if (o.href && !o.leave && /^https:\/\//i.test(String(o.href))) return tile_(Object.assign({}, o, { href: '', act: 'file-view', data: Object.assign({ url: o.href, title: o.label }, o.data || {}) }));
if (o.href && /^https?:\/\//i.test(String(o.href))) {
return `<a class="${cls}" href="${esc(o.href)}"${attrs}
      target="_blank" rel="noopener">${body}</a>`;
}
const data = Object.keys(o.data || {})
.map(k => ` data-${k}="${esc(String(o.data[k]))}"`).join('');
const pressed = o.pressed != null ? ` aria-pressed="${o.pressed ? 'true' : 'false'}"` : '';
if (o.tone === 'admin' && !(typeof may_ === 'function' && may_('admin'))) return '';
const barred = '';
return `<button type="button" class="${cls}" data-do="${esc(o.act)}"${data}${attrs}${pressed}${barred}${o.off ? ' disabled' : ''}
    >${body}</button>`;
}
const TILE_HOLD = { t: 0, el: null, shown: false };
function tileWordShow_(el) {
const word = el.getAttribute('data-w') || el.getAttribute('aria-label') || '';
if (!word) return;
const r = el.getBoundingClientRect();
let tip = document.querySelector('.tile-word');
if (!tip) { tip = document.createElement('span'); tip.className = 'tile-word'; tip.setAttribute('aria-hidden', 'true'); document.body.appendChild(tip); }
tip.textContent = word;
tip.style.left = (r.left + r.width / 2) + 'px';
tip.style.top = r.top + 'px';
TILE_HOLD.shown = true;
}
function tileWordHide_() {
clearTimeout(TILE_HOLD.t); TILE_HOLD.el = null;
const tip = typeof document !== 'undefined' && document.querySelector('.tile-word');
if (tip) tip.remove();
}
if (typeof document !== 'undefined' && document.addEventListener) {
document.addEventListener('pointerdown', e => {
const el = e.target && e.target.closest && e.target.closest('.tile');
tileWordHide_(); TILE_HOLD.shown = false;
if (!el) return;
TILE_HOLD.el = el;
TILE_HOLD.t = setTimeout(() => { if (TILE_HOLD.el === el) tileWordShow_(el); }, 500);
}, { passive: true });
['pointerup', 'pointercancel', 'scroll'].forEach(k => document.addEventListener(k, () => {
clearTimeout(TILE_HOLD.t);
if (TILE_HOLD.shown) setTimeout(tileWordHide_, 900);
}, { passive: true, capture: true }));
document.addEventListener('click', e => {
if (!TILE_HOLD.shown || !(e.target && e.target.closest && e.target.closest('.tile'))) return;
TILE_HOLD.shown = false; e.preventDefault(); e.stopPropagation();
}, true);
document.addEventListener('contextmenu', e => { if (e.target && e.target.closest && e.target.closest('.tile')) e.preventDefault(); });
}
const NOTHING_YET = text_('nothing-here-yet');
const NO_TUTOR = text_('no-tutor-yet');
function empty_(text) {
return CARD_BLOCKS.text({ text: String(text || NOTHING_YET), look: 'empty' });
}
function addCard_(o) {
const s = typeof suggestOpts_ === 'function' ? suggestOpts_('card', 'add:' + o.act, o.label) : null;
return renderCard({ kind: 'add', look: 'add-card', tags: [{ text: o.label, colour: 0 }], tiles: [{ icon: 'plus', label: o.label, act: o.act, data: o.data }].concat(s || []) });
}
function tileSet_(el, o) {
if (!el) return;
if (o.label != null) {
const name = o.label + (o.note ? ' · ' + o.note : '');
el.setAttribute('title', name);
el.setAttribute('aria-label', name);
}
if (o.icon) {
const old = el.querySelector('.tile-i');
if (old) old.outerHTML = tileIcon_(o.icon);
}
if (o.on != null) el.classList.toggle('on', !!o.on);
if (o.pressed != null) el.setAttribute('aria-pressed', o.pressed ? 'true' : 'false');
if (o.off != null) el.disabled = !!o.off;
}
function favOpts_(x) {
return x ? null : null;
}
function shopOpts_(x) {
const inCart = CART.some(c => c.key === x.key && isShop_(c));
return { icon: 'cart', label: inCart ? text_('in-your-basket') : text_('add-to-basket'), tone: 'buy', on: inCart,
note: inCart ? '' : (x.cost ? x.cost + ' credits' : 'free'), act: 'cart-add', off: !USER || inCart, data: { key: x.key, kind: 'shop' } };
}
function isMe_(x) {
if (!USER) return false;
const id = (x.row && x.row.personId) || '';
if (id && USER.personId) return String(id) === String(USER.personId);
return norm(x.name) === norm(USER.name);
}
function bookOpts_(x) {
const t = (x && x.row) || {};
return !isMe_(x) && !!may_('prices') && t.listed !== false ? { icon: 'book', label: 'Book', tone: 'buy',
act: 'book-with', data: { tutor: x.name || '' } } : null;
}
function tutorOpts_(x) {
const t = x.row || {};
return [ bookOpts_(x),
String(t.videoFile || '').trim() ? { icon: 'play', label: text_('watch-intro'), act: 'intro-play', data: { file: t.videoFile } }
: /^https?:\/\//i.test(String(t.mediaUrl || '')) ? { icon: 'play', label: text_('watch-intro'), href: t.mediaUrl } : null,
typeof cardEditOpts_ === 'function' ? cardEditOpts_(x) : null,
USER && isMe_(x) && may_('staff') && t.handle ? { icon: 'share', label: 'Share my profile', note: 'your link', act: 'tutor-share', data: { handle: t.handle } } : null,
x.key ? { icon: t.listed === false ? 'hide' : 'show', label: t.listed === false ? text_('not-listed') : 'Listed', tone: 'admin',
on: t.listed !== false, act: 'set-listed', note: t.listed === false ? 'clients cannot see them' : 'clients can see them',
data: { who: x.key, pid: (x.row && x.row.personId) || '' } } : null];
}
function subjectOpts_(x) {
return { icon: 'book', label: text_('book-this'), act: 'book-with', data: { name: '', subject: x.name || '' } };
}
function levelOpts_(x) {
const t = x.row || {};
return { icon: 'book', label: t.listed === false ? text_('not-on-the-booking-form') : text_('book-this'),
note: t.listed === false ? 'add it to the options tab' : '',
off: t.listed === false,
act: 'book-with', data: { name: '', level: x.name || '' } };
}
const CARD_CORE_ = ['share', 'fav', 'suggest', 'top'];
const CARD_EXTRAS_ = { shop: shopOpts_, tutor: tutorOpts_, subject: x => tile_(subjectOpts_(x)),
level: x => tile_(levelOpts_(x)), receipt: x => tile_(jobOpts_(x)), talmud: x => tile_(window.talmudOpts_(x)) };
function cardCore_(x) {
const one = {
share: () => tile_({ icon: 'share', label: 'Share', act: 'card-share', data: { key: x.key } }),
fav: () => tile_(favOpts_(x)),
suggest: () => (typeof suggestOptsFor_ === 'function' ? tile_(suggestOptsFor_(x)) : ''),
top: () => tile_({ icon: 'up', label: 'Top', act: 'find-top' }) };
return x.key ? CARD_CORE_.map(k => one[k]()).join('') : '';
}
function cardExtras_(x) {
const fn = CARD_EXTRAS_[x.kind] || (window.CARD_EXTRAS_MORE || {})[x.kind];
if (typeof fn !== 'function') return x.lead || '';
const r = fn(x);
return (x.lead || '') + (typeof r === 'string' ? r : tile_(r));
}
function cardRow_(x, flat) {
const hear = typeof hearItOpts_ === 'function' ? hearItOpts_(x) : null;
const mine = (h => h + (typeof kcOffOpts_ === 'function' ? tile_(kcOffOpts_(x, h)) : ''))(cardCore_(x) + cardExtras_(x)
+ tile_(hear || (typeof readAloudOpts_ === 'function' && !isQ_(x) ? readAloudOpts_(x) : null))
+ tile_([typeof speedOpts_ === 'function' ? speedOpts_(x) : null, typeof magCardOpts_ === 'function' ? magCardOpts_(x) : null, finderOpenOpts_(x)]) + (x.more || '')
+ (x.key && !isMeCard_(x) && !isQ_(x) ? tile_(typeof gameLockOpts_ === 'function' ? gameLockOpts_('c:' + x.key) : null) : ''));
if (flat) return mine;
if (!mine) return '';
return tileRow_(mine, '', isMeCard_(x));
}
const TILE_RE_ = /<(button|a)\b[^>]*\bclass="tile\b[^"]*"[^>]*>[\s\S]*?<\/\1>/g;
const TILE_ADMIN_ORDER_ = ['card-edit', 'set-listed'];
const tileIsAdmin_ = t => /\bclass="tile\b[^"]*\bis-(admin|danger)\b/.test(t);
const tileAct_ = t => (t.match(/\bdata-do="([^"]*)"/) || [])[1] || '';
function tileAdminRank_(t) {
if (/\bclass="tile\b[^"]*\bis-danger\b/.test(t)) return 99;
const i = TILE_ADMIN_ORDER_.indexOf(tileAct_(t));
return i === -1 ? TILE_ADMIN_ORDER_.length : i;
}
const tileWrap_ = (inner, cls) => `<div class="tile-row${cls ? ' ' + cls : ''}">${inner}</div>`;
function tileRow_(html, cls, own) {
const src = String(html || '');
const wrap = inner => tileWrap_(inner, cls);
const all = src.match(TILE_RE_) || [];
const admin = own ? [] : all.filter(tileIsAdmin_);
if (!admin.length) return wrap(src);
const viewer = all.filter(t => admin.indexOf(t) === -1);
const rest = all.reduce((s, t) => s.replace(t, ''), src)
.replace(/<span class="tile-group is-admin"[^>]*>\s*<\/span>/g, '').trim();
const sorted = admin.map((t, i) => [t, i]).sort((a, b) => tileAdminRank_(a[0]) - tileAdminRank_(b[0]) || a[1] - b[1]).map(p => p[0]);
const group = list => (list.length ? `<span class="tile-group is-admin" role="group" aria-label="Admin">${list.join('')}</span>` : '');
const brk = '<span class="tile-break" aria-hidden="true"></span>';
return wrap(viewer.join('') + rest + group(sorted));
}
const coreIn_ = row => !!row.querySelector('[data-do="card-share"]');
function tileRowsJoin_(html) {
const h = String(html == null ? '' : html);
if (h.indexOf('tile-row') === h.lastIndexOf('tile-row') || typeof document === 'undefined') return h;
let t;
try { t = document.createElement('template'); t.innerHTML = h; } catch (e) { return h; }
let joined = 0;
const group = (from, into, first) => {
const g = document.createElement('span');
g.className = ['tile-group'].concat([...from.classList].filter(c => c !== 'tile-row')).join(' ');
[...from.attributes].forEach(a => { if (a.name !== 'class') g.setAttribute(a.name, a.value); });
while (from.firstChild) g.appendChild(from.firstChild);
if (first) into.insertBefore(g, into.firstChild); else into.appendChild(g);
from.remove();
joined++;
};
const formOwn = typeof ruleOn_ !== 'function' || ruleOn_('form-save-row');
t.content.querySelectorAll('.tile-row').forEach(row => {
const prev = row.previousElementSibling;
if (!prev || prev.hidden || prev.classList.contains('tile-row') || prev.matches('.merged-part, .widget-slot') || row.classList.contains('wgt-foot') || (formOwn && row.parentElement && row.parentElement.closest('.me-form'))) return;
const last = e => { let k = e.lastElementChild; while (k && k.tagName === 'P' && !k.textContent.trim()) k = k.previousElementSibling; return k; };
let d = prev;
while (last(d) && !d.classList.contains('tile-row') && !d.matches('.merged-part, .widget-slot, .rep-box, ' + (formOwn ? '.me-form, form, ' : '') + '[class*="qual"], ul, ol, table')) d = last(d);
if (d !== prev && d.classList.contains('tile-row') && !d.classList.contains('person-tiles')) group(row, d, coreIn_(row));
});
t.content.querySelectorAll('.tile-row').forEach(row => {
const prev = row.previousElementSibling;
if (!prev || !prev.classList.contains('tile-row') || !row.parentNode || (formOwn && prev.closest('.me-form')) || prev.classList.contains('person-tiles')) return;
group(prev, row, !coreIn_(row));
});
t.content.querySelectorAll('.kc-row').forEach(r => { const more = r.querySelector(':scope > .kc-four');
if (more) [...r.children].filter(k => k !== more).forEach(k => { more.appendChild(k); joined++; }); });
return joined ? t.innerHTML : h;
}
on('intro-play', el => {
const card = el.closest('.card') || el.parentNode;
if (!card) return;
const was = card.querySelector('.vid-frame.intro');
if (was) { was.remove(); return; }
const f = document.createElement('div');
f.className = 'vid-frame intro';
f.innerHTML = `<iframe src="${esc(introSrc_(el.dataset.file))}" title="Intro video" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
const row = el.closest('.tile-row');
if (row && row.parentNode) row.parentNode.insertBefore(f, row.nextSibling); else card.appendChild(f);
});
;
/* js/tiles-jobs.js */
function jobOpts_(x) {
const j = x.row || {};
const id = String(j.id || j.jobId || '');
if (!id || !USER) return null;
const mine = (j.slots || []).some(sl => norm(sl.client) === norm(USER.name));
const asked = requestAsked_(j);
const answer = asked && (norm(asked) === norm(USER.name) || (typeof may_ === 'function' && may_('admin')))
? [{ icon: 'tick', label: text_('accept-request'), tone: 'buy', note: 'it becomes a booking', act: 'job-request-answer', data: { id: id, yes: '1' } },
{ icon: 'close', label: text_('decline-request'), note: 'a line why, if you like', act: 'job-request-answer', data: { id: id, yes: '' } }]
: null;
if (!mine) return [answer, jobApplyOpts_(j, id), answer || !may_('prices') ? null : joinOpts_(j, id)];
const paid = (j.slots || []).some(sl =>
norm(sl.client) === norm(USER.name) && /^(paying|booked)$/i.test(String(sl.status || '')));
const owed = typeof jobAccepted_ === 'function' && jobAccepted_(j) && !paid;
return [jobChooseOpts_(j, id),
owed && !!may_('prices') ? { icon: 'pound', label: text_('pay-and-confirm'), tone: 'buy',
note: typeof fmtMoney_ === 'function' ? fmtMoney_(j.price || 0) : '', act: 'job-pay', data: { id: id } } : null,
{ icon: 'undo', label: text_('withdraw-from-this'), act: 'job-leave', data: { id: id, paid: paid ? '1' : '' } }];
}
const jobOpenToTutors_ = j => !!(j && j.stealable) && !(j.tutorSlots || []).some(sl => /^confirmed$/i.test(String(sl.status || '')));
function jobApplyOpts_(j, id) {
if (!USER || !jobOpenToTutors_(j) || !(typeof may_ === 'function' && may_('staff'))) return null;
if ((j.tutorSlots || []).some(sl => norm(sl.name) === norm(USER.name))) return null;
return ({ icon: 'join', label: text_('apply-to-teach'), tone: 'buy', note: 'the family picks', act: 'job-apply', data: { id: id } });
}
function jobChooseOpts_(j, id) {
if (!jobOpenToTutors_(j) || !may_('prices')) return null;
return (j.tutorSlots || []).filter(sl => sl && sl.name && /^applied$/i.test(String(sl.status || '')))
.map(sl => ({ icon: 'tick', label: 'Choose ' + fmtName_(sl.name), tone: 'buy', note: 'they teach it',
act: 'job-choose', data: { id: id, tutor: String(sl.name) } }));
}
function requestAsked_(j) {
if (!j || j.stealable) return '';
const t = (j.tutorSlots || []).find(sl => /^applied$/i.test(String(sl.status || '')));
return t ? String(t.name || '') : '';
}
function requestSaid_(j) {
if (!j) return '';
const asked = requestAsked_(j);
if (asked) return text_('waiting-for') + asked + ' to accept or decline.';
const evs = j.events || [];
const last = evs.filter(e => e.role === 'tutor' && (e.action === 'Decline' || e.action === 'Accept')).pop();
if (!last) return '';
if (last.action === 'Decline' && norm(last.target) === norm(last.actor) && !(j.tutorSlots || []).length) {
return text_('declined-by') + last.actor + (last.message && last.message !== 'declined the request' ? ': \u201c' + last.message + '\u201d' : '.');
}
if (last.action === 'Accept' && /^accepted the request/.test(String(last.message || ''))) {
return text_('accepted-by') + last.actor + '.';
}
return '';
}
function joinOpts_(j, id) {
if (!j || !j.canAsk || !id) return null;
return norm(j.kind) === 'waitlist'
? { icon: 'join', label: text_('take-a-seat'), tone: 'buy', note: 'charged once it fills',
act: 'job-take-seat', data: { id: id } }
: ({ icon: 'join', label: text_('ask-to-join'), tone: 'buy', note: 'the family say yes first',
act: 'job-join', data: { id: id } });
}
function jobAdminOpts_(j, stage, accepted) {
const id = String((j && (j.id || j.jobId)) || '');
if (!id) return null;
const ask = stage === 'application' || stage === 'waitlist';
return [ask ? { icon: 'tick', label: 'Accept', tone: 'buy', note: 'settles the terms', act: 'job-answer', data: { id: id, yes: '1' } } : null,
ask ? { icon: 'close', label: 'Decline', note: 'turns it down', act: 'job-answer', data: { id: id, yes: '' } } : null,
{ icon: 'bin', label: 'Delete', tone: 'danger', note: 'ends it for everybody', act: 'job-delete', data: { id: id } }];
}
on('noop', () => {});
;
/* js/missing.js */
const MISSING = { list: null, asking: false, all: false, memo: { rows: null, list: null, out: null } };
const MISSING_SERIES = { June: ['5', '6'], November: ['11'] };
const MISSING_CODE = /^([1-9]\d?)([FH]?)$/;
const MISSING_SITTING = /^(June|November) (\d{4})$/;
const MISSING_STAGE = { KS4: 'GCSE', KS5: 'A-Level' };
const MISSING_SHOWN = q => q.board !== 'OCR' && (q.board !== 'Edexcel' || q.subject === 'Maths');
const MISSING_OPEN = new Set();
document.addEventListener('toggle', e => {
const el = e.target;
if (!el || !el.classList || !el.classList.contains('miss-q')) return;
const k = el.getAttribute('data-q') || '';
if (el.open) MISSING_OPEN.add(k); else MISSING_OPEN.delete(k);
}, true);
const MISSING_ID = 'item:stuff:missing-papers';
const missingFor_ = () => may_('admin');
function missingLead_() { return []; }
const missingLeadN_ = () => 0;
function missingLeadCards_() {
if (!missingFor_()) return [];
const h = typeof itemMark_ === 'function' ? itemMark_(MISSING_ID, missingCard_()) : missingCard_();
return [typeof suggestRowIn_ === 'function' ? suggestRowIn_(h, 'widget', 'missing-papers', 'What’s missing') : h];
}
const HEALTH_MORE_ = { bizcheck: () => (typeof window.bizCheckCard_ === 'function' ? window.bizCheckCard_() : '') };
function healthCardOf_(which) {
if (HEALTH_MORE_[which]) return HEALTH_MORE_[which]();
const all = (() => { try { return missingLeadCards_(); } catch (e) { oops_(e, 'health card'); return []; } })();
return all.join('') || renderCard({ kind: 'panel', body: [{ type: 'text', look: 'empty', text: typeof NOTHING_YET === 'string' ? NOTHING_YET : text_('nothing-yet') }] });
}
const healthCardSpec_ = (body, look, name) => renderCard({ kind: 'panel', look: look || 'logic-card', name, tags: [name || 'What’s missing'], body });
function missingAsk_() {
if (MISSING.list || MISSING.asking || typeof fetch !== 'function') return;
MISSING.asking = true;
dataFile_('data/settings/expected-papers.json')
.then(d => {
MISSING.asking = false;
MISSING.list = Array.isArray(d) ? d : [];
missingRepaint_();
});
}
function missingRepaint_() {
const el = document.getElementById('miss-body');
if (!el) return;
const html = cardBlocks_(missingBody_());
if (missingWaits_()) return;
const kept = [...el.querySelectorAll('.tile-group')];
el.innerHTML = html;
el.removeAttribute('aria-busy');
if (kept.length) {
let row = [...el.children].filter(c => c.classList.contains('tile-row')).pop();
if (!row) { row = document.createElement('div'); row.className = 'tile-row'; el.after(row); }
kept.forEach(g => row.appendChild(g));
}
}
function missingEntry_(e) {
if (!e || typeof e !== 'object' || Array.isArray(e)) return null;
const s = v => String(v == null ? '' : v).trim();
const codes = a => (Array.isArray(a) ? a : []).map(s).filter(p => MISSING_CODE.test(p));
const sits = a => (Array.isArray(a) ? a : []).map(s).filter(v => MISSING_SITTING.test(v));
const board = s(e.board), level = s(e.level), subject = s(e.subject), papers = codes(e.papers);
const from = Number(e.from), to = Number(e.to);
if (!board || !level || !subject || !papers.length || !(from >= 2000 && to >= from && to - from <= 50)) return null;
const series = (Array.isArray(e.series) && e.series.length ? e.series : ['June']).map(s).filter(x => MISSING_SERIES[x]);
const skip = new Set(sits(e.skip));
let sittings = [];
for (let y = from; y <= to; y++) series.forEach(x => sittings.push(x + ' ' + y));
sits(e.also).forEach(x => { if (sittings.indexOf(x) === -1) sittings.push(x); });
const when = x => { const m = MISSING_SITTING.exec(x); return Number(m[2]) * 2 + (m[1] === 'November' ? 1 : 0); };
sittings = sittings.filter(x => !skip.has(x)).sort((a, b) => when(a) - when(b));
const papersIn = {};
const pi = e.papers_in && typeof e.papers_in === 'object' && !Array.isArray(e.papers_in) ? e.papers_in : {};
Object.keys(pi).forEach(k => { if (MISSING_SITTING.test(k) && codes(pi[k]).length) papersIn[k] = codes(pi[k]); });
return { board, level, subject, spec: s(e.spec).toUpperCase(), label: s(e.label) || [board, level, subject].join(' '),
papers, sittings, papersIn };
}
function missingCover_(r) {
if (!r || !libIsDoc_(r) || !String(r.exam_board || '').trim()) return null;
const t = v => String(v == null ? '' : v).trim(), name = t(r.name), m = t(r.month);
const year = t(r.year) || ((/\b(20\d\d)\b/.exec(name) || [])[1] || '');
const series = m === '11' ? 'November' : MISSING_SERIES.June.indexOf(m) !== -1 ? 'June'
: /\bNovember\b/i.test(name) ? 'November' : /\b(May|June)\b/i.test(name) ? 'June' : '';
let paper = t(r.paper);
const named = /\bPaper (\d{1,2})\b/i.exec(name);
if (named && (!paper || named[1].indexOf(paper) === 0)) paper = named[1];
const tier = (t(r.tier).charAt(0) || ((/\d([FH])$/i.exec(t(r.spec_code)) || [])[1] || '')).toUpperCase();
if (!year || !series || !paper) return null;
const levels = (t(r.level) || MISSING_STAGE[t(r.key_stage)] || '').split(',').map(t).filter(Boolean);
return { board: t(r.exam_board), levels, subject: t(r.subject), spec: t(r.spec_code).toUpperCase(),
sitting: series + ' ' + year, paper, tier, id: t(r.paper_id) };
}
const missingOf_ = (q, c) => c.board === q.board && c.levels.indexOf(q.level) !== -1 && c.subject === q.subject
&& (!q.spec || !c.spec || c.spec.indexOf(q.spec) === 0);
const missingOwns_ = (quals, q, c) => missingOf_(q, c) && (!!c.spec || quals.find(x => missingOf_(x, c)) === q);
const missingIs_ = (c, code) => {
const m = MISSING_CODE.exec(code);
return !!m && c.paper === m[1] && (!m[2] || c.tier === m[2]);
};
function missingGaps_(quals, rows) {
rows = Array.isArray(rows) ? rows : [];
const covers = rows.map(missingCover_).filter(Boolean);
const pending = new Set();
rows.forEach(r => { if (r && r.paper_id && libTrue(r.lib_pending)) pending.add(String(r.paper_id)); });
const docs = new Set(rows.filter(r => r && libIsDoc_(r) && r.paper_id).map(r => String(r.paper_id)));
const out = quals.map(q => {
const mine = covers.filter(c => missingOwns_(quals, q, c));
let want = 0;
const gaps = q.sittings.map(s => {
const papers = q.papersIn[s] || q.papers;
want += papers.length;
return { sitting: s, papers: papers.filter(code => !mine.some(c => c.sitting === s && missingIs_(c, code))) };
}).filter(g => g.papers.length);
const missing = gaps.reduce((n, g) => n + g.papers.length, 0);
const waiting = new Set(mine.filter(c => pending.has(c.id)).map(c => c.id)).size;
return { q, gaps, want, missing, waiting };
});
return { quals: out, waiting: [...docs].filter(id => pending.has(id)).length };
}
function missingNow_() {
const rows = typeof libDocRows_ === 'function' ? libDocRows_() : [];
const memo = MISSING.memo;
if (memo.rows === rows && memo.list === MISSING.list && memo.out) return memo.out;
const read = (MISSING.list || []).map(missingEntry_);
const known = read.filter(Boolean), quals = known.filter(MISSING_SHOWN);
const out = Object.assign(missingGaps_(quals, rows), { unread: read.length - known.length });
MISSING.memo = { rows: rows, list: MISSING.list, out: out };
return out;
}
const missingPapers_ = codes => (codes.length > 1 ? 'Papers ' : 'Paper ') + codes.join(', ');
const missingKV_ = (k, v) => [{ type: 'group', tag: 'span', look: 'k', text: k }, { type: 'group', tag: 'span', look: 'v', text: v }];
function missingQual_(g) {
if (!g.missing) return { type: 'group', look: 'miss-done', blocks: [{ type: 'list', items: [{ label: g.q.label, value: 'complete' + (g.waiting ? ' · ' + g.waiting + ' waiting' : '') }] }] };
const say = g.missing === g.want ? 'none yet' : g.missing + ' missing';
const lines = g.gaps.map(x => ({ label: x.sitting, value: missingPapers_(x.papers) }));
if (g.waiting) lines.push({ label: 'Waiting for their words', value: String(g.waiting) });
const id = g.q.label;
return { type: 'group', tag: 'details', look: 'miss-q', attrs: { 'data-q': id, open: MISSING_OPEN.has(id) }, blocks: [
{ type: 'group', tag: 'summary', look: 'row', blocks: missingKV_(g.q.label, say) },
{ type: 'group', look: 'miss-gaps', blocks: [{ type: 'list', items: lines }] }] };
}
const missingWaits_ = () => MISSING.list === null || (typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS === null);
function missingBody_() {
missingAsk_();
if (missingWaits_()) return [{ type: 'wait', on: true }];
const r = missingNow_();
const unread = r.unread ? { type: 'group', tag: 'p', look: 'note', text: `${r.unread} ${r.unread === 1 ? 'line' : 'lines'} of expected-papers.json not understood.` } : null;
if (!r.quals.length) return [{ type: 'group', tag: 'p', look: 'note', text: 'Nothing listed to expect yet.' }, unread].filter(Boolean);
const papers = r.quals.reduce((n, g) => n + g.missing, 0), gaps = r.quals.filter(g => g.missing).length;
const say = (papers ? papers + ' ' + (papers === 1 ? 'paper' : 'papers') + ' missing in ' + gaps + ' of ' + r.quals.length
: 'All ' + r.quals.length + ' complete') + (r.waiting ? ' · ' + r.waiting + ' waiting for words' : '');
return [{ type: 'group', tag: 'p', look: 'miss-sum', text: say }].concat(MISSING.all ? r.quals.map(missingQual_) : [],
[{ type: 'tiles', tiles: [{ icon: MISSING.all ? 'up' : 'down', label: MISSING.all ? 'Fewer' : 'The list', act: 'miss-all' }] }, unread]).filter(Boolean);
}
if (typeof on === 'function') on('miss-all', () => { MISSING.all = !MISSING.all; missingRepaint_(); });
const missingBox_ = () => { const body = missingBody_(); return { type: 'group', id: 'miss-body', attrs: { 'aria-busy': missingWaits_() ? 'true' : null }, blocks: body }; };
function missingCard_() {
return healthCardSpec_([missingBox_()], 'miss-card', 'What’s missing');
}
;
/* js/boot.js */
try {
go(AT, false);
} catch (err) {
bootFailed(err, 'drawing the first screen');
try { placeCells('x', true); } catch (err2) { oops_(err2, 'boot:top') }
}
try { laterFiles_(); } catch (e) { }
load();
try { settingsRows_(); laterFiles_().then(() => { try { libraryRows_(); libraryExtraRows_(); lazyFiles_(); } catch (e) { } }); } catch (e) { }
const bootIdle_ = f => { try { (window.requestIdleCallback || (g => setTimeout(g, 1)))(() => { try { f(); } catch (e) { } }, { timeout: 2000 }); } catch (e) { } };
bootIdle_(() => aheadPreOpen_());
bootIdle_(() => splashForget_());
try { verifyFromLink_(); } catch (e) { oops_(e, 'boot:top') }
try { pinFromLink_(); } catch (e) { oops_(e, 'boot:top') }
try { paidFromLink_(); } catch (e) { oops_(e, 'boot:top') }
;
