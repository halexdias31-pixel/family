# 1201 — offline mode: a paper on the device (12 Nov 2026)

Owner decision, 11 Nov (docs/decisions.md): download a paper, answer and rule-mark it with no connection, sync when
back online; AI marking waits until online.

**One tile, one store, one queue.** Every question part's row has a "Make available offline" tile behind ⋯
(`offline` in `QT_ROW` and `data/settings/qengine.json`, drawn by `offTileOpts_` in js/offline.js; signed in and on a
paper only). A tap:

1. records the paper and the wire id of every row that has words under `kept:<person>:offline:papers` (the kept-reply
   store, `keptGet_(k, true)` reads it across builds);
2. asks `libItems` for the rows the library's own IndexedDB copy (447) does not hold. Those ids are pinned:
   `libDiskPut_` never evicts them to stay under `LIB_DISK_MAX`;
3. registers sw.js and puts this build's code files, everything this visit loaded and the paper's PNG figure twins
   into the `family-offline` store.

**sw.js answers fetches again, network first.** 98 (9 Nov) took the fetch handler out so every visit loads the
current files. That still holds: the worker asks the network first and keeps a copy only once a `family-offline` store
exists; the store answers only when the fetch fails. check-cache.js now holds that shape instead of "no fetch handler".
The worker is registered only by a download (or by turning notifications on, `swReg_`), never by index.html.

**Offline**, the page opens from the store, draws the kept payload (1070) and the library's copy; Find's front shows an
"On this device" card listing the papers (Open filters Find to the paper) and one line: "Offline · Last synced … ·
N waiting to sync". Rule-marked parts mark on the device as always and queue in `subQueue_`. An AI part says "Will mark
when online" (`offAiHold_`), queues its press as `sent`, and waits in `kept:<person>:offline:ai`.

**Back online** the `online` event pushes the queue (idempotent by event id, `subApply_`), marks each waiting AI part
whose card is on the glass (`offAiFlush_`, also from `aiDecided_` after a payload lands and every 10 s), and stamps
"Last synced". A background request nobody pressed no longer toasts "Nothing was saved" while offline (`send_`).

**Privacy.** Words stay in the library's copy, filed under the signed-in person; sign-out clears it (`libDiskClear_`),
the `kept:` records (`keptForget_`) and the worker's store (`offForget_`).

**Limits.** A paper's list goes if the browser's storage fills (`payloadForget_` drops every `kept:` record first). A new
Ledger generation drops the device's words; the next visit online fetches them again (`offTopUp_`). An AI part waits
until its card is drawn online. A lazy widget's file is kept only if the build's file list names it (all of FILES are).

Check: `check/offline.js` (browser, `--slow`): downloads a worksheet and a paper, `context.setOffline(true)`, reloads,
marks two parts, holds an AI part, comes back online and counts every submission arriving exactly once.
