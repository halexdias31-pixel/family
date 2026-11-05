# Split plan (generated, not performed)

Written by `node tools/health.js --plan` (tools/structure.js). Every file over 800 lines, cut into files of 800 or fewer, grouped by what the functions are named (their prefix) and who calls whom. The pieces of a `js/` file take its place in `index.html`'s list, in the order shown: any statement that runs at load and needs a name from a later piece has been moved into that later piece, so load order stays valid (the same rule `node js/check.js` enforces). Run `node js/check.js` after carrying out any part of it.

structure: 0% of the way from the 2026-11-05 baseline to the targets (file lines over 800: 48337/48337, function lines over 80: 7060/7060, extra variants: 133/133, one-offs: 515/515)

| File | Lines | Pieces |
|---|---|---|
| `js/find.js` | 12232 | 18 |
| `js/games.js` | 6446 | 12 |
| `js/me.js` | 4890 | 7 |
| `backend/dopost.gs` | 4636 | 3 |
| `js/shell.js` | 3968 | 6 |
| `js/posts.js` | 2610 | 5 |
| `backend/content.gs` | 2435 | 4 |
| `js/book.js` | 2255 | 3 |
| `backend/digest.gs` | 1796 | 3 |
| `js/keypad.js` | 1786 | 3 |
| `backend/constants.gs` | 1728 | 5 |
| `js/mat.js` | 1700 | 3 |
| `js/arcade.js` | 1510 | 3 |
| `backend/doget.gs` | 1436 | 2 |
| `backend/setup.gs` | 1351 | 3 |
| `js/board.js` | 1317 | 2 |
| `backend/people.gs` | 1279 | 3 |
| `backend/booking.gs` | 1232 | 3 |
| `js/layout.js` | 1184 | 2 |
| `js/records.js` | 1180 | 3 |
| `backend/core.gs` | 1074 | 2 |
| `js/receipt.js` | 1052 | 4 |
| `js/submit.js` | 1037 | 2 |
| `js/racer.js` | 971 | 2 |

## js/find.js (12232 lines → 18 files)

2 load-time statement(s) moved to a later piece so what they read is already declared.

1. **find-stuff-division.js** — 797 lines. What it does: the `stuff…`, `division…`, `topics…`, `s…` functions. Biggest: `stuffItemsRaw_`, `stuffWindow_`, `stuffAheadJobs_`, `stuffFiltered`, `stuffFillOne_`, `stuffEdgeFill_`. Calls out to other pieces 91 time(s).
2. **find-bible-retired.js** — 787 lines. What it does: the `bible…`, `retired…`, `stuff…`, `surface…` functions. Biggest: `RETIRED_FACETS`, `stuffQuestion`, `bibleIndex_`, `bibleVerseCard_`, `surfaceSvg_`, `toggleFav`. Calls out to other pieces 40 time(s).
3. **find-finder-card.js** — 783 lines. What it does: the `finder…`, `card…`, `paint…`, `filter…` functions. Biggest: `paintStuff`, `finderScreen_`, `fillStuffPages`, `cardFigFit_`, `paintDocket`, `finderMembersCard_`. Calls out to other pieces 117 time(s).
4. **find-question-kinds.js** — 798 lines. What it does: the `question…`, `kinds…`, `answer…`, `say…` functions. Biggest: `KINDS`, `questionItems`, `answerParts_`, `thingCard_`, `projectPart_`, `sayLine_`. Calls out to other pieces 68 time(s).
5. **find-facet-ans.js** — 793 lines. What it does: the `facet…`, `ans…`, `kind…` functions. Biggest: `facetTally_`, `tellApart_`, `ansBox_`, `choiceBox_`, `kindMap_`, `ansRead_`. Calls out to other pieces 49 time(s).
6. **find-hist-account.js** — 796 lines. What it does: the `hist…`, `account…`, `insert…`, `ms…` functions. Biggest: `accountPages_`, `practicalCard_`, `practicalPart_`, `MS_LOOK`, `msFragSvg_`, `histCard_`. Calls out to other pieces 26 time(s).
7. **find-facets-lib.js** — 766 lines. What it does: the `facets…`, `lib…`, `part…`, `wave…` functions. Biggest: `FACETS`, `waveOf`, `partPlan_`, `libLanded_`, `sittingMonth_`, `preamble_`. Calls out to other pieces 54 time(s).
8. **find-boxer-stem.js** — 784 lines. What it does: the `boxer…`, `stem…`, `q…` functions. Biggest: `pageParts_`, `fightCard_`, `boxerFigure_`, `boxerTape_`, `boxerRecord_`, `boxerCard_`. Calls out to other pieces 44 time(s).
9. **find-typeset-order.js** — 773 lines. What it does: the `typeset…`, `order…`, `tb…`, `multi…` functions. Biggest: `typeset_`, `orderBox_`, `multiOf_`, `tbSections_`, `doneWordsPlain_`, `orderSeq_`. Calls out to other pieces 18 time(s).
10. **find-mark-sub.js** — 774 lines. What it does: the `mark…`, `sub…`, `cells…` functions. Biggest: `markRule_`, `markAnswer_`, `markNorm_`, `markExprParse_`, `markExpr_`, `markTerms_`. Calls out to other pieces 9 time(s).
11. **find-pad.js** — 777 lines. What it does: the `pad…` functions. Biggest: `padGrid_`, `PAD_DRAW`, `padWrap_`, `padSegs_`, `padTargets_`, `padPath_`. Calls out to other pieces 21 time(s).
12. **find-draw-mag.js** — 769 lines. What it does: the `draw…`, `mag…` functions. Biggest: `drawMarker_`, `magShow_`, `drawFig_`, `magCopy_`, `magHide_`, `magCardTile_`. Calls out to other pieces 3 time(s).
13. **find-pad-2.js** — 795 lines. What it does: the `pad…` functions. Biggest: `padLand_`, `padLoupe_`, `padStraighten_`, `padJudge_`, `padCommit_`, `padShapeOf_`. Calls out to other pieces 173 time(s).
14. **find-pad-uses.js** — 787 lines. What it does: the `pad…`, `uses…`, `chunk…`, `fig…` functions. Biggest: `figsBefore_`, `chunkHtml_`, `TAG_OF`, `packBlocks_`, `padRepaint_`, `padProtSvg_`. Calls out to other pieces 79 time(s).
15. **find-dock-read.js** — 445 lines. What it does: the `dock…`, `read…`, `levels…`, `layout…` functions. Biggest: `layout`, `readAloudLines_`, `docketSave`, `levelsIn_`, `myResultNew_`, `LEVEL_TABLE`. Calls out to other pieces 20 time(s).
16. **find-bundle.js** — 296 lines. What it does: the `bundle…` functions. Biggest: `bundleBuild_`, `bundleCard_`, `bundleTitle_`, `bundleStrayLine_`, `laminatePrice`, `bundlePriceLine_`. Calls out to other pieces 15 time(s).
17. **find-pane.js** — 235 lines. What it does: the `pane…` functions. Biggest: `paneReach_`, `paneWatch_`, `paneFloor_`, `paneStep_`, `paneOnGlass_`, `PANE_WATCH`. Calls out to other pieces 2 time(s).
18. **find-meas.js** — 277 lines. What it does: the `meas…` functions. Biggest: `measDraw_`, `measOpen_`, `measGeom_`, `measSnap_`, `measUp_`, `measFig_`. Calls out to other pieces 1 time(s).

## js/games.js (6446 lines → 12 files)

1. **games-vid-end.js** — 800 lines. What it does: the `vid…`, `end…`, `c…`, `oth…` functions. Biggest: `vidPaint_`, `endTimesTables`, `startTimesTables`, `feedSlide`, `c4Paint`, `vidRow_`. Calls out to other pieces 7 time(s).
2. **games-init-chess.js** — 784 lines. What it does: the `init…`, `chess…`, `draw…`, `round…` functions. Biggest: `drawChess`, `chessShow_`, `timerTick`, `initMiniCalc`, `chessSound_`, `roundPaint`. Calls out to other pieces 72 time(s).
3. **games-ss-herd.js** — 800 lines. What it does: the `ss…`, `herd…`, `mz…`, `jam…` functions. Biggest: `HERD_BUILTIN`, `SS_SENTENCES`, `jamPaint`, `JAM_DECK`, `mzBuild_`, `ssPaint`. Calls out to other pieces 9 time(s).
4. **games-ws-taboo.js** — 736 lines. What it does: the `ws…`, `taboo…`, `art…`, `twq…` functions. Biggest: `TABOO_DECK`, `ART_DECK`, `WS_THEMES`, `wsBuild_`, `BOARD_GAMES`, `twqPaint`. Calls out to other pieces 24 time(s).
5. **games-media-cha.js** — 733 lines. What it does: the `media…`, `cha…`, `videos…`, `console…` functions. Biggest: `CHA_DECK`, `videosAll_`, `CONSOLE_GAMES`, `videosFound_`, `mediaFormHtml_`, `GS_PEOPLE`. Calls out to other pieces 26 time(s).
6. **games-imp-word.js** — 531 lines. What it does: the `imp…`, `word…` functions. Biggest: `IMP_DECK`, `WORD_GAMES`, `impPaint`, `wgPaint_`, `impCount_`, `impCards_`. Calls out to other pieces 10 time(s).
7. **games-party.js** — 159 lines. What it does: the `party…` functions. Biggest: `tabPaint`, `partyTick_`, `partyStop_`, `PARTY_GAMES`, `partyRun_`, `partyStart_`. Calls out to other pieces 7 time(s).
8. **games-scr-scrabble.js** — 464 lines. What it does: the `scr…`, `scrabble…` functions. Biggest: `scrabblePaint`, `scrIllegal_`, `scrRackHtml_`, `scrScore_`, `scrPlay_`, `scrCellsHtml_`. Calls out to other pieces 0 time(s).
9. **games-tmt.js** — 238 lines. What it does: the `tmt…` functions. Biggest: `tmtRow_`, `tmtHtml_`, `tmtSave_`, `tmtKeep_`, `tmtShut_`, `tmtRead_`. Calls out to other pieces 0 time(s).
10. **games-kt.js** — 262 lines. What it does: the `kt…` functions. Biggest: `ktViewHtml_`, `ktLine_`, `ktDone_`, `ktBoardHtml_`, `ktPaint_`, `KT_WORDS`. Calls out to other pieces 0 time(s).
11. **games-nes-emu.js** — 784 lines. What it does: the `nes…`, `emu…` functions. Biggest: `nesPadsPoll_`, `emuStart_`, `nesPadWire_`, `nesPaint_`, `nesStart_`, `nesAudio_`. Calls out to other pieces 8 time(s).
12. **games-csv.js** — 155 lines. What it does: the `csv…` functions. Biggest: `csvKeep_`, `csvPack_`, `csvDb_`, `csvLine_`, `csvBegin_`, `csvCapture_`. Calls out to other pieces 4 time(s).

## js/me.js (4890 lines → 7 files)

1. **me-me-signed.js** — 798 lines. What it does: the `me…`, `signed…`, `apply…`, `google…` functions. Biggest: `meSave_`, `signedOut_`, `signedIn_`, `meRest_`, `availGrid_`, `signInCard_`. Calls out to other pieces 29 time(s).
2. **me-send-people.js** — 797 lines. What it does: the `send…`, `people…`, `verify…`, `pin…` functions. Biggest: `send_`, `verifyFromLink_`, `paidFromLink_`, `uploadsHtml_`, `answerClaim_`, `kidListSec_`. Calls out to other pieces 12 time(s).
3. **me-avatar-profile.js** — 565 lines. What it does: the `avatar…`, `profile…`, `ps…`, `fig…` functions. Biggest: `profileRefresh_`, `wardrobeBody_`, `personFormHtml_`, `avatarSave`, `avatarDraw_`, `psResults_`. Calls out to other pieces 35 time(s).
4. **me-card.js** — 763 lines. What it does: the `card…` functions. Biggest: `cardSeatSync_`, `cardPatchRow_`, `CARD_SECTIONS`, `cardFetch_`, `cardEditForm_`, `cardEditNow_`. Calls out to other pieces 42 time(s).
5. **me-msg-dm.js** — 431 lines. What it does: the `msg…`, `dm…` functions. Biggest: `msgPost_`, `messagesHtml_`, `msgAttachHtml_`, `loadMessages`, `msgRead_`, `msgDay_`. Calls out to other pieces 0 time(s).
6. **me-field-settings.js** — 759 lines. What it does: the `field…`, `settings…`, `lib…`, `notify…` functions. Biggest: `fieldHtml`, `notifyCard_`, `settingsCards_`, `studentSetPages_`, `libraryShelf_`, `youSettingsPages_`. Calls out to other pieces 36 time(s).
7. **me-qual-pfp.js** — 777 lines. What it does: the `qual…`, `pfp…`, `fields…` functions. Biggest: `qualSlot_`, `fieldsHtml`, `photoPicker_`, `qualShelf_`, `qualCommit_`, `qualRedraw_`. Calls out to other pieces 19 time(s).

## backend/dopost.gs (4636 lines → 3 files)

1. **dopost-login-answers.gs** — 571 lines. What it does: the `login…`, `answers…`, `client…`, `sign…` functions. Biggest: `signInRow_`, `submissionsAppend_`, `loginReplyFor_`, `clientError_`, `answersUpsert_`, `profileOf_`. Calls out to other pieces 0 time(s).
2. **dopost-do.gs** — 3595 lines (OVER 800: a single function or load-time knot; split it by hand). What it does: the `do…` functions. Biggest: `doPost`. Calls out to other pieces 30 time(s).
3. **dopost-ai-rewrite.gs** — 470 lines. What it does: the `ai…`, `rewrite…` functions. Biggest: `aiGemini_`, `aiMarkAsk_`, `assistAsk_`, `rewriteIdeasAsk_`, `aiThinking_`, `aiMarkEssay_`. Calls out to other pieces 0 time(s).

## js/shell.js (3968 lines → 6 files)

1 load-time statement(s) moved to a later piece so what they read is already declared.

1. **shell-paint-oops.js** — 791 lines. What it does: the `paint…`, `oops…`, `field…`, `build…` functions. Biggest: `paint`, `TABS`, `tierRun_`, `oops_`, `tierGuardWidgets_`, `paintPager`. Calls out to other pieces 63 time(s).
2. **shell-ahead-go.js** — 801 lines (OVER 800: a single function or load-time knot; split it by hand). What it does: the `ahead…`, `go…`, `apply…`, `per…` functions. Biggest: `go`, `goPage`, `columnsFor_`, `startScreen_`, `AXES`, `repaint`. Calls out to other pieces 69 time(s).
3. **shell-place-wide.js** — 739 lines. What it does: the `place…`, `wide…`, `arrive…` functions. Biggest: `placeGrid`, `placePages_`, `holdColumn_`, `placeCells`, `placeNow_`, `arriveWatch_`. Calls out to other pieces 81 time(s).
4. **shell-reconnect-col.js** — 743 lines. What it does: the `reconnect…`, `col…`, `expand…`, `page…` functions. Biggest: `PAGER`, `softDrag_`, `reconnectFail_`, `grabRow_`, `expand_`, `nothingHere`. Calls out to other pieces 35 time(s).
5. **shell-press-sheet.js** — 563 lines. What it does: the `press…`, `sheet…`, `toast…`, `api…` functions. Biggest: `api`, `closeSheet`, `shareCanvasPng_`, `openSheet`, `toast`, `say_`. Calls out to other pieces 24 time(s).
6. **shell-load.js** — 331 lines. What it does: the `load…` functions. Biggest: `loadOnce_`, `libraryLate_`, `load`, `dataProxy_`, `loadRowsClean_`, `loadWho_`. Calls out to other pieces 34 time(s).

## js/posts.js (2610 lines → 5 files)

1 load-time statement(s) moved to a later piece so what they read is already declared.

1. **posts-post-feed.js** — 786 lines. What it does: the `post…`, `feed…`, `pics…`, `comments…` functions. Biggest: `postPng_`, `postCard_`, `commentsHtml_`, `postRedraw_`, `postsBlocks`, `picsWant_`. Calls out to other pieces 22 time(s).
2. **posts-cam-ppng.js** — 767 lines. What it does: the `cam…`, `ppng…`, `stamp…`, `rec…` functions. Biggest: `camStart_`, `cameraCard`, `camStop_`, `camItemOf_`, `ppngWrap_`, `ppngImg_`. Calls out to other pieces 16 time(s).
3. **posts-poll-tutor.js** — 352 lines. What it does: the `poll…`, `tutor…` functions. Biggest: `poll`, `tpngInline_`, `tutorPngHand_`, `tutorPng_`, `tpngWidth_`, `voteMove_`. Calls out to other pieces 5 time(s).
4. **posts-reel.js** — 424 lines. What it does: the `reel…` functions. Biggest: `reelYtHeard_`, `reelTurn_`, `reelCards_`, `reelPlay_`, `reelYtBuild_`, `reelYtHello_`. Calls out to other pieces 0 time(s).
5. **posts-dm-asst.js** — 281 lines. What it does: the `dm…`, `asst…` functions. Biggest: `dmPages_`, `dmFace_`, `dmFoot_`, `dmSync_`, `daiveHtml_`, `dmTyping_`. Calls out to other pieces 0 time(s).

## backend/content.gs (2435 lines → 4 files)

1. **content-msg-claude.gs** — 749 lines. What it does: the `msg…`, `claude…`, `drive…`, `lib…` functions. Biggest: `uploadsCheck_`, `libImportDrive_`, `geocodeVenues`, `msgAttachSave_`, `driveTrouble_`, `postMediaRefusal_`. Calls out to other pieces 18 time(s).
2. **content-race-media.gs** — 564 lines. What it does: the `race…`, `media…`, `inbox…`, `console…` functions. Biggest: `raceBuild_`, `mediaWrite_`, `raceHeights_`, `inboxPart_`, `raceDemBatch_`, `raceMedian_`. Calls out to other pieces 7 time(s).
3. **content-films.gs** — 376 lines. What it does: the `films…` functions. Biggest: `filmsSync_`, `filmsList_`, `filmsUpsert_`, `filmsRoot_`, `filmsWalk_`, `filmsDescribe_`. Calls out to other pieces 0 time(s).
4. **content-lib-library.gs** — 746 lines. What it does: the `lib…`, `library…` functions. Biggest: `libCopy_`, `libDriveApply_`, `libDriveParse_`, `libContent_`, `libImport_`, `libTally_`. Calls out to other pieces 0 time(s).

## js/book.js (2255 lines → 3 files)

1 load-time statement(s) moved to a later piece so what they read is already declared.

1. **book-book-weekdays.js** — 797 lines. What it does: the `book…`, `weekdays…` functions. Biggest: `BOOK_STEPS`, `bookBreakdown`, `bookSpec`, `bookJoin_`, `bookBlocks`, `bookFieldsSaid_`. Calls out to other pieces 59 time(s).
2. **book-job-my.js** — 795 lines. What it does: the `job…`, `my…`, `booking…`, `breakdown…` functions. Biggest: `breakdownRows`, `jobRows`, `rosterHtml`, `jobReceipt`, `BOOKING`, `liveWidgets_`. Calls out to other pieces 23 time(s).
3. **book-slot-step.js** — 663 lines. What it does: the `slot…`, `step…`, `spine…`, `receipt…` functions. Biggest: `receiptRow`, `receiptHtml`, `slotGrid`, `stepRows_`, `stepSelect_`, `weekRows_`. Calls out to other pieces 19 time(s).

## backend/digest.gs (1796 lines → 3 files)

1. **digest-digest.gs** — 795 lines. What it does: the `digest…` functions. Biggest: `digestQuestions_`, `digestPlan_`, `digestRender_`, `digestPartOut_`, `digestSummary_`, `digestHtml_`. Calls out to other pieces 21 time(s).
2. **digest-digest-weekly.gs** — 793 lines. What it does: the `digest…`, `weekly…` functions. Biggest: `digestRun_`, `digestCardTags_`, `digestMail_`, `digestLibraryFind_`, `digestPreviewOut_`, `digestStemRows_`. Calls out to other pieces 16 time(s).
3. **digest-check-digest.gs** — 208 lines. What it does: the `check…`, `digest…`, `install…`, `send…` functions. Biggest: `checkSundayEmail`, `digestSendNow_`, `installWeeklyDigest_`, `removeWeeklyDigest`, `sendLastWeekTo`, `sendLastWeekToAll`. Calls out to other pieces 27 time(s).

## js/keypad.js (1786 lines → 3 files)

1. **keypad-kp.js** — 794 lines. What it does: the `kp…` functions. Biggest: `kpEdit_`, `kpPad_`, `kpOpen_`, `KP_KEYS`, `kpLayout_`, `kpTypeset_`. Calls out to other pieces 25 time(s).
2. **keypad-ai.js** — 297 lines. What it does: the `ai…` functions. Biggest: `aiOff_`, `aiStageStart_`, `aiPlain_`, `aiKeptPaint_`, `ansMaths_`, `aiKeptView_`. Calls out to other pieces 1 time(s).
3. **keypad-kp-2.js** — 695 lines. What it does: the `kp…` functions. Biggest: `kpKeys_`, `kpHitWords_`, `kpEditEnd_`, `kpSiteEdit_`, `kpHitMaths_`, `kpHandles_`. Calls out to other pieces 52 time(s).

## backend/constants.gs (1728 lines → 5 files)

1. **constants-runnable-where.gs** — 735 lines. What it does: the `runnable…`, `where…`, `tab…`, `digest…` functions. Biggest: `WHERE`, `RUNNABLE`, `TAB`, `CHEATSHEET_DEFAULTS`, `AVATAR_ITEMS`, `NOTIFY_KINDS`. Calls out to other pieces 1 time(s).
2. **constants-config-migrations.gs** — 294 lines. What it does: the `config…`, `migrations…` functions. Biggest: `MIGRATIONS`, `CONFIG_DEFAULTS`, `LIB_FILES`, `CONFIG_RESEEDED`, `LIB_SOURCE_COMMIT`, `AI_THINKING_LEVELS`. Calls out to other pieces 0 time(s).
3. **constants-schema.gs** — 380 lines. What it does: the `schema…` functions. Biggest: `SCHEMA`. Calls out to other pieces 0 time(s).
4. **constants-profile.gs** — 163 lines. What it does: the `profile…` functions. Biggest: `PROFILE_GROUPS`, `FIELD_OPTIONS`, `TRIP_GROUPS`, `SHOP_GROUPS`, `POST_GROUPS`, `PRICING_COOLDOWN_DAYS`. Calls out to other pieces 0 time(s).
5. **constants-action.gs** — 156 lines. What it does: the `action…` functions. Biggest: `ACTION_ACCESS`. Calls out to other pieces 0 time(s).

## js/mat.js (1700 lines → 3 files)

1. **mat-mat.js** — 798 lines. What it does: the `mat…` functions. Biggest: `MAT_HTML`, `MAT_PARTS`, `matParts`, `matGraphs`, `matProtractor`, `matPtAt`. Calls out to other pieces 6 time(s).
2. **mat-mat-fr.js** — 789 lines. What it does: the `mat…`, `fr…`, `vs…` functions. Biggest: `matPaint`, `MAT_HTML_EN`, `matBlankPaint_`, `MAT_PARTS_EN`, `matHandRows_`, `matBlankSvg_`. Calls out to other pieces 45 time(s).
3. **mat-init.js** — 113 lines. What it does: the `init…` functions. Biggest: `initMat`. Calls out to other pieces 34 time(s).

## js/arcade.js (1510 lines → 3 files)

1. **arcade-calc-c.js** — 487 lines. What it does: the `calc…`, `c…` functions. Biggest: `calcKey`, `calcEval`, `calcTokens`, `CALC_KEYS`, `calcRowHtml`, `calcSay`. Calls out to other pieces 0 time(s).
2. **arcade-widgets-widget.js** — 506 lines. What it does: the `widgets…`, `widget…` functions. Biggest: `widgetsGlass_`, `widgetsLater_`, `aheadWidgetJobs_`, `widgetOnColumn_`, `widgetUp_`, `aheadDrawWidget_`. Calls out to other pieces 0 time(s).
3. **arcade-progress-td.js** — 517 lines. What it does: the `progress…`, `td…` functions. Biggest: `progressStats_`, `progressGradeCard_`, `tdYear_`, `progressPresses_`, `progressSeriesCard_`, `progressBigExam_`. Calls out to other pieces 0 time(s).

## backend/doget.gs (1436 lines → 2 files)

1. **doget-submissions-films.gs** — 229 lines. What it does: the `submissions…`, `films…`, `family…`, `media…` functions. Biggest: `familyOf_`, `submissionsBuild_`, `filmShares_`, `filmsFor_`, `submissionsFor_`, `mediaOut_`. Calls out to other pieces 0 time(s).
2. **doget-do.gs** — 1207 lines (OVER 800: a single function or load-time knot; split it by hand). What it does: the `do…` functions. Biggest: `doGet`. Calls out to other pieces 9 time(s).

## backend/setup.gs (1351 lines → 3 files)

1. **setup-seed-tidy.gs** — 762 lines. What it does: the `seed…`, `tidy…`, `rename…`, `ensure…` functions. Biggest: `autoMigrate_`, `makeBrandAccount`, `ensureSchema_`, `renameValue_`, `authoriseDrive`, `seedHolidays`. Calls out to other pieces 1 time(s).
2. **setup-data-setup.gs** — 381 lines. What it does: the `data…`, `setup…` functions. Biggest: `dataProblems`, `setupStatus_`, `schemaGaps`, `setupOnAdminLoad_`, `setupTriggerWhen_`, `SETUP_CHECK_MS`. Calls out to other pieces 1 time(s).
3. **setup-check.gs** — 208 lines. What it does: the `check…` functions. Biggest: `checkEverything`, `checkPostsFolder`, `checkScopes`, `checkTabs`. Calls out to other pieces 0 time(s).

## js/board.js (1317 lines → 2 files)

1. **board-nb.js** — 795 lines. What it does: the `nb…` functions. Biggest: `nbDrawBook_`, `nbDrawPad_`, `nbDrawLoupe_`, `nbLay_`, `nbCache_`, `nbTap_`. Calls out to other pieces 12 time(s).
2. **board-nb-init.js** — 522 lines. What it does: the `nb…`, `init…` functions. Biggest: `nbDown_`, `nbUp_`, `nbInkMove_`, `nbGlide_`, `nbMultiMove_`, `nbMove_`. Calls out to other pieces 99 time(s).

## backend/people.gs (1279 lines → 3 files)

1. **people-admin-notify.gs** — 722 lines. What it does: the `admin…`, `notify…`, `name…`, `find…` functions. Biggest: `pricingRefusal_`, `adminPersonRefusal_`, `ensurePersonIds_`, `seesWhom_`, `findPerson`, `notifyOf_`. Calls out to other pieces 4 time(s).
2. **people-handle.gs** — 256 lines. What it does: the `handle…` functions. Biggest: `handleTrouble_`, `handleParts_`, `handleFirstSeen_`, `handleFriendsMove_`, `handleAnswers_`, `handleFold_`. Calls out to other pieces 0 time(s).
3. **people-kid.gs** — 301 lines. What it does: the `kid…` functions. Biggest: `kidNamesIndex_`, `kidNamesBack_`, `kidNamesOff_`, `kidNamesSpans_`, `kidPricesOff_`, `kidMemo_`. Calls out to other pieces 8 time(s).

## backend/booking.gs (1232 lines → 3 files)

1. **booking-school-booking.gs** — 446 lines. What it does: the `school…`, `booking…`, `operating…`, `write…` functions. Biggest: `schoolYear`, `operatingWindow`, `writeReceipt_`, `bankHolidays`, `discountRefusal_`, `logEvent`. Calls out to other pieces 2 time(s).
2. **booking-participants-space.gs** — 422 lines. What it does: the `participants…`, `space…`, `waitlist…`, `job…` functions. Biggest: `participantsOf`, `waitlistPrice`, `waitlistWhen`, `priceLooksWrong`, `payStatement_`, `busyHours`. Calls out to other pieces 4 time(s).
3. **booking-auth.gs** — 364 lines. What it does: the `auth…` functions. Biggest: `authWrong_`, `accessDenied`, `AUTH`, `authResetFind_`, `authResetTake_`, `authMoveFind_`. Calls out to other pieces 0 time(s).

## js/layout.js (1184 lines → 2 files)

1. **layout-layout-lay.js** — 765 lines. What it does: the `layout…`, `lay…`, `piece…` functions. Biggest: `layoutSane_`, `layMoveShow_`, `layoutTiles_`, `customTabsSync_`, `layAcross_`, `frontPageOf_`. Calls out to other pieces 26 time(s).
2. **layout-card-box.js** — 419 lines. What it does: the `card…`, `box…` functions. Biggest: `cardsOf_`, `CARD_REG`, `cardArrange_`, `cardAdminRow_`, `cardMergeGroups_`, `cardIdOf_`. Calls out to other pieces 47 time(s).

## js/records.js (1180 lines → 3 files)

1. **records-profit-biz.js** — 735 lines. What it does: the `profit…`, `biz…`, `reports…`, `apps…` functions. Biggest: `profitCards_`, `profitDefaults_`, `BIZ_PAGES`, `reportsInner_`, `bizFill_`, `profitLine_`. Calls out to other pieces 5 time(s).
2. **records-digest-lib.js** — 147 lines. What it does: the `digest…`, `lib…` functions. Biggest: `digestShownAsk_`, `libImpInner_`, `libImpStart_`, `libImpSaid_`, `digestWordsCard_`, `digestShownHtml_`. Calls out to other pieces 2 time(s).
3. **records-eink.js** — 298 lines. What it does: the `eink…` functions. Biggest: `einkPage_`, `paintEink_`, `einkDraw_`, `einkIconBits_`, `einkText_`, `einkLoad_`. Calls out to other pieces 0 time(s).

## backend/core.gs (1074 lines → 2 files)

1. **core-read-set.gs** — 785 lines. What it does: the `read…`, `set…`, `sheet…`, `cache…` functions. Biggest: `testCache`, `installSheetWatch_`, `jsonOut`, `sheetWatchStatus`, `setCells`, `cacheGet_`. Calls out to other pieces 0 time(s).
2. **core-quals-layout.gs** — 289 lines. What it does: the `quals…`, `layout…`, `venues…`, `photos…` functions. Biggest: `layoutClean_`, `venuesWrites_`, `phoneOut`, `qualsIn`, `qualsOut`, `teachesOf_`. Calls out to other pieces 1 time(s).

## js/receipt.js (1052 lines → 4 files)

1. **receipt-rc-feed.js** — 257 lines. What it does: the `rc…`, `feed…`, `glyph…`, `chess…` functions. Biggest: `rcPng_`, `rcClone_`, `rcFonts_`, `rcOffer_`, `rcStyle_`, `rcSave_`. Calls out to other pieces 0 time(s).
2. **receipt-draw.js** — 207 lines. What it does: the `draw…` functions. Biggest: `drawBooker_`, `bookerCard`, `drawBooker`. Calls out to other pieces 0 time(s).
3. **receipt-open-ask.js** — 245 lines. What it does: the `open…`, `ask…` functions. Biggest: `sure_`, `openJob_`, `askHow_`, `sureBack_`, `SURE_GAP_MS`. Calls out to other pieces 0 time(s).
4. **receipt-init.js** — 343 lines. What it does: the `init…` functions. Biggest: `initFlappy`, `fitCanvas_`, `flappyStill_`. Calls out to other pieces 0 time(s).

## js/submit.js (1037 lines → 2 files)

1. **submit-sub-mark.js** — 658 lines. What it does: the `sub…`, `mark…` functions. Biggest: `subMigrate_`, `markTone_`, `subAdopt_`, `subRecord_`, `subPush_`, `markSound_`. Calls out to other pieces 0 time(s).
2. **submit-rep-report.js** — 379 lines. What it does: the `rep…`, `report…` functions. Biggest: `repVideoFrames_`, `reportBoxHtml_`, `repSendFile_`, `reportPicShrink_`, `repVidsDraw_`, `repFilesAdd_`. Calls out to other pieces 0 time(s).

## js/racer.js (971 lines → 2 files)

1. **racer-race-racer.js** — 798 lines. What it does: the `race…`, `racer…` functions. Biggest: `raceMesh_`, `raceWorld_`, `raceRoute_`, `raceDraw_`, `raceGl_`, `raceMini_`. Calls out to other pieces 3 time(s).
2. **racer-race-init.js** — 173 lines. What it does: the `race…`, `init…` functions. Biggest: `racePaint_`, `racePads_`, `raceFrame_`, `raceBuildNow_`, `raceAttr_`, `raceTiles_`. Calls out to other pieces 28 time(s).
