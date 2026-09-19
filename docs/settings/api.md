# api

| id | action | who | sends | returns | reads_writes | refuses | notes | active |
|---|---|---|---|---|---|---|---|---|
| AP-01 | (transport) |  |  |  |  |  | Every write is a POST to one Apps Script URL with a JSON body and NO headers set. Setting Content-Type: application/json triggers a preflight OPTIONS request, which Apps Script does not answer — the request then fails with a CORS message that says nothing about the cause. | TRUE |
| AP-02 | (transport) |  |  |  |  |  | The reply is read as TEXT and parsed second. Apps Script answers an uncaught exception with an HTML page saying what went wrong; calling .json() on it throws 'Unexpected token <' and bins that page unread. | TRUE |
| AP-03 | (transport) |  |  |  |  |  | A reply carrying an `error` field is a failure even though the request succeeded. Checking only whether the request went through treats a refused sign-in as a signed-in state. | TRUE |
| AP-04 | (transport) |  |  |  |  |  | The read is a GET of the same URL and returns the whole database in one object. One round trip on a bad connection, then nothing. | TRUE |
| AP-05 | (transport) |  |  |  |  |  | Both directions use cache: 'no-store'. | TRUE |
| AP-06 | (auth) |  |  |  |  |  | accessDenied(action, body) runs once, before any handler. An action nobody has classified is REFUSED — a new handler is unreachable until somebody decides who it is for, rather than open until somebody notices. | TRUE |
| AP-07 | (auth) |  |  |  |  |  | `who` values: anyone = no account needed. self = any signed-in person, acting on their own row. admin = admin only. Anything else names the roles allowed. | TRUE |
| AP-08 | (files) |  |  |  |  |  | Two spreadsheets. SPREADSHEET_ID is the business database; SUBJECTS_ID holds boxers, fights, questions and cheatsheet. Every tab is reached through read(name), so callers never know which file a tab lives in. | TRUE |
| AP-10 | sendInvites | self | emails, jobId, name, personId | sent, success |  | Not signed in. \| That is more people than a session can hold. \| You can only invite somebody to a session you are in. |  | TRUE |
| AP-11 | openInvite | anyone | token |  | invites, jobs | That invitation has expired or was never sent. |  | TRUE |
| AP-12 | acceptInvite | anyone |  |  |  |  |  | TRUE |
| AP-13 | diagnosePeople | admin |  | duplicateNames, noId, noPin, success, total | people |  |  | TRUE |
| AP-14 | register | anyone | email, first_name, last_name, pin, ref | name, pending, success | people | Account created, but the confirmation email could not be sent. Please get in touch. \| Choose a PIN of 4 to 8 digits. \| Please give a first and last name. |  | TRUE |
| AP-15 | verifyEmail | anyone | token | name, success | people | No confirmation code. \| That confirmation link has already been used, or has expired. |  | TRUE |
| AP-16 | googleLogin | anyone | credential | success | people | Could not reach Google to check that sign-in. \| Google sign-in is not set up yet. \| No @family. account uses that Google address. Ask an admin to add it to your profile. |  | TRUE |
| AP-17 | signOut | self | name | success | people |  |  | TRUE |
| AP-18 | verifyLogin | anyone | name, pin | success | people | Name or PIN not recognised. \| Please confirm your email first — check your inbox for the link we sent. \| Too many attempts. Try again in a few minutes. |  | TRUE |
| AP-19 | getProfile | admin | target | name, personId, profile, role, success |  | Person not found. |  | TRUE |
| AP-20 | listPeople | admin |  | success | people |  |  | TRUE |
| AP-21 | updateProfile | self | fields, name, target, targetId | for, name, success | people | More than one account answers to " \| No profile named for that change. \| Not authorised to edit that profile. |  | TRUE |
| AP-22 | updateVenue | admin | fields, venue | success | venues | Venue not found. |  | TRUE |
| AP-23 | updateConfig | admin | key, value | key, success, value | config | No config key called " |  | TRUE |
| AP-24 | updatePricing | admin | kind, label, value | added, success | pricing, venues | No venue called " |  | TRUE |
| AP-25 | updateShop | admin | fields, rowIndex | name, success | shop | Item not found. |  | TRUE |
| AP-26 | deleteShopItem | admin | rowIndex | success | shop | Item not found. |  | TRUE |
| AP-27 | updateLink | admin |  |  | links |  |  | TRUE |
| AP-28 | addLink | admin | category, colour, name, rowIndex, url | _row, rowIndex, success |  | Link not found. |  | TRUE |
| AP-29 | deleteLink | admin | fields | success |  |  |  | TRUE |
| AP-30 | saveRoom | admin | availability, fields, name, venue | removed, success | rooms | Which room? |  | TRUE |
| AP-31 | updateTrip | admin | fields, rowIndex | name, success | trips | Trip not found. |  | TRUE |
| AP-32 | addTrip | admin | name | _row, rowIndex, success | trips |  |  | TRUE |
| AP-33 | imageData | anyone | url | data, dataUri, image, success |  | Could not fetch that image:  \| Image fetch returned  \| Image too large to share. |  | TRUE |
| AP-34 | updateResource | admin | fields, rowIndex | name, success | resources | Resource not found. |  | TRUE |
| AP-35 | editResource | admin | fields, id, rowIndex | name, success | resources | No resource with that id — it may have been deleted. |  | TRUE |
| AP-36 | deleteResource | admin | id, on, rowIndex | active, name, success | resources | No resource with that id. \| The resources tab has no `active` column. Run ensureSchema() |  | TRUE |
| AP-37 | editPost | admin | fields, id, rowIndex | success | post_votes, posts | No post with that id — it may have been deleted. \| That date did not make sense — use DD/MM/YYYY. Everything else  \| This poll has |  | TRUE |
| AP-38 | approvePost | admin | adminName, id, name, on, rowIndex | approved, success | posts | No post with that id. \| The posts tab has no `approved` column. Run ensureSchema() — |  | TRUE |
| AP-39 | deletePost | admin | id, on, rowIndex | active, success | posts | No post with that id. |  | TRUE |
| AP-40 | orderPrints | self | delivery, items, name, personId | cost, orderId, printed, success | orders, people, resources | None of those can be printed:\n \| Not signed in. \| Nothing to print. |  | TRUE |
| AP-41 | saveNotepad | self | notepad |  |  |  |  | TRUE |
| AP-42 | addPost | self | body, caption, data, image, location, name, personId, poll, postAs | image, pending, success, tab | posts | A post needs a picture. \| Could not save the picture.  \| No posts folder. Add a row to the config tab: |  | TRUE |
| AP-43 | scanPosts | admin |  | added, dated, folder, looked, success | posts | No posts folder. Add `posts_folder` to the config tab. |  | TRUE |
| AP-44 | setListed | admin | on, who | listed, success | people | No such person. |  | TRUE |
| AP-45 | reactPost | self | emoji, name, personId, postId | emoji, success | post_reactions, posts | Sign in to react. \| That is not one of them. \| That post is gone. |  | TRUE |
| AP-46 | votePoll | self | choice, name, personId, postId | choice, success | post_votes, posts | Sign in to vote. \| That is not one of the answers. \| That post is gone. |  | TRUE |
| AP-47 | folderFiles | admin |  | files, folder, success | posts | No posts folder. Add `posts_folder` to the config tab. |  | TRUE |
| AP-48 | sendMessage | self | body, name, personId, to, toId | success | messages | Not signed in. \| Nothing to send. \| One message every five minutes — |  | TRUE |
| AP-49 | messages | self | name, personId | gapMs, messages, success | messages | Not signed in. |  | TRUE |
| AP-50 | readMessage | self | messageId, name, personId | success | messages | Not found. \| Not signed in. \| Not yours to open. |  | TRUE |
| AP-51 | flagMessage | self | messageId, name, personId, reason | success | messages | Not found. \| Not signed in. \| Not yours to report. |  | TRUE |
| AP-52 | claimChild | self | firstName, lastName, name, personId | success | family, people | Both a first name and a last name, please. \| More than one student is called that. Ask us to link them. \| No student called " |  | TRUE |
| AP-53 | answerClaim | self | accept, name, personId, rowIndex | success | family | Not found. \| Not signed in. \| That request is not yours to answer. |  | TRUE |
| AP-54 | changePin | self | adminName, currentPin, name, newPin, personId | success | people | A PIN is 4 to 8 numbers. \| Not signed in. \| Pick something less guessable than that. |  | TRUE |
| AP-55 | redeem | self | cost, name, personId, resource | success | orders | Choose which paper you want. \| Not signed in. \| That needs |  | TRUE |
| AP-56 | orderPosted | admin | id, rowIndex | success | orders | Not found. |  | TRUE |
| AP-57 | saveExam | self | name, personId |  | exams | Not signed in. |  | TRUE |
| AP-58 | deleteExam | self | board, date, kind, label, name, rowIndex, subject | success |  | Not found. \| Not yours to remove. \| That date did not make sense. |  | TRUE |
| AP-59 | saveTodo | self | todo |  |  |  |  | TRUE |
| AP-60 | confirmDetails | self |  |  |  |  |  | TRUE |
| AP-61 | myReferral | self | name, personId | success | people | No such person. |  | TRUE |
| AP-62 | saveAvatar | self | avatar, name, personId | avatar, item, owned, success | people | No such item:  \| Person not found. \| The people tab has no `avatar` or `avatar_owned` column. Run |  | TRUE |
| AP-63 | saveFriends | self | friends |  |  |  |  | TRUE |
| AP-64 | saveScore | self | name, personId, score | beat, best, highscore, success | people | Person not found. |  | TRUE |
| AP-65 | saveTtHighscore | self |  |  |  |  |  | TRUE |
| AP-66 | saveTopics | self | name, personId, tick | success | people | Person not found. |  | TRUE |
| AP-67 | toggleTopicTick | self | checked, handle, id, name, personId, rowIndex, tick | success | people, resources | Bad tick request. \| Not signed in. \| You can only tick your own topics. |  | TRUE |
| AP-68 | toggleVenueComfort | self | checked, handle, venue | success | venues | Venue not found. |  | TRUE |
| AP-69 | createCheckout | self | jobId, name, requestId | Stripe, success, url | jobs, receipts | Could not reach Stripe:  \| Job not found. \| Nothing to pay for yet — the terms have to be agreed first. |  | TRUE |
| AP-70 | finalizePayment | self | ref | Stripe, alreadyDone, success | jobs | Could not confirm the payment with Stripe:  \| Stripe says that session has not been paid. |  | TRUE |
| AP-71 | markPaid | admin | adminName, how, jobId, name, requestId | alreadyPaid, how, paid, success | jobs | No session with that id. \| Nobody is in that session. \| That has not been accepted yet — |  | TRUE |
| AP-72 | move | self | adminName, counterpart, edits, jobId, move, name, requestId, role, text | duplicate, jobStatus, mine, participants, status, success | jobs | Job not found. \| No name given. \| That session is not open to other families. |  | TRUE |
| AP-73 | tutorMove | self | jobId, move, requestId, sender, text, tutor |  |  | Unknown tutor move. |  | TRUE |
| AP-74 | createJob | self | clientId, clientName, dates, day, forceItemId, hosting, hours, interval, kids, level, lines, location, message, n, name, openToOthers, personId, price, profit, requestId, requestedTutor, service, splitEmails, subject, time | receiptError, receiptId, success | jobs | You already have |  | TRUE |
| AP-75 | favourite | self | itemId, kind, name, on, personId | ok, on | favourites | Nothing to favourite. \| Sign in first. |  | TRUE |
| AP-76 | openWaitlist | admin | level, name, personId, requestId, venue | jobId, ok | jobs | A waiting list for  \| Not signed in. \| Only an admin can open a waiting list. |  | TRUE |
| AP-77 | joinWaitlist | self | availability, closesOn, level, name, personId, requestId, venue | full, jobId, joined, seats, success | jobs | Not signed in. \| That list is full — it will run once three of them have paid. \| That venue has no price set for a shared session yet. |  | TRUE |
| AP-78 | joinFestive | self | holidayId, kids, name, personId, requestId | full, jobId, joined, receiptError, receiptId, seats, success | jobs | Not signed in. \| That is full. \| That is not on at the moment — it may have finished, or the |  | TRUE |
| AP-79 | linkChild | admin | child, childId, parent, parentId |  | family | No child by that name. \| No parent by that name. \| That is the same person. |  | TRUE |
| AP-80 | unlinkChild | admin |  | alreadyLinked, child, parent, settled, success, unlinked |  | They are not linked. |  | TRUE |
| AP-81 | deleteJob | admin | adminName, jobId, name, requestId | alreadyEmpty, ended, success, who | jobs | No session with that id. |  | TRUE |
| AP-82 | debugTabs | admin |  | action, tabs, version | family | Unknown action: |  | TRUE |
