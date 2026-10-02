## The first reel landed, and the service worker was eating it

**Two clips uploaded to the repository root — `archetest.MP4` and a TikTok id — 7.3 MB and 7.9 MB,
both H.264 in MP4, both already faststart.** `data/reels/README.md` had named the destination and
the spelling before either arrived (`data/reels/archetest.mp4`), so they are there, lowercased, and
the two `FEED_FACTS` clip fields point at them. `clipSrcs_` treats anything with a slash as an
address, so a repo path is **one rung, no Drive, no chrome** — which is what every other line of
that feature was written against.

**The name is the one the owner uploaded.** A 32-character id is unreadable in a source file and a
typo in it is invisible to a reader — but renaming a video nobody here can watch is inventing a
description of it, which is the fault this file records under the scatter graph and the curve read
by eye. The check below is what makes the ugly name safe: a typo now fails the build.

### `sw.js` answered a ranged request by throwing, and the column drew Google's player over a file that was there

**Measured before it was read about**, with a range-capable server and the real worker installed:
the column drew three slides, **one of them already fallen through to the iframe**, and the two
videos sat at `readyState: 0` with nothing playing. Two separate faults, both in `file()`:

| | |
|---|---|
| `Range: bytes=0-` | the server answers **206**, `res.ok` is true, and `Cache.put()` **throws on a partial response** — by specification. The throw is inside the try whose catch has no `held` to fall back to, so it rethrows, `respondWith` rejects, and the `<video>` reports an error |
| `Range: bytes=N-` | the conditional path answered **304** and handed back the WHOLE cached file to a request asking for everything after byte N. The log caught it outright: `304` against `bytes=0-3538943` |

**Proved both ways and it needs no codec**, which is what makes it a real measurement rather than a
reading: a page-level `fetch('data/reels/archetest.mp4', { headers: { Range: 'bytes=0-1023' } })`
**threw `Failed to fetch`** through the old worker and comes back `206, 1024 bytes, Content-Range:
bytes 0-1023/7680352` through the new one. The store holds 31 entries and **0 clips** either way —
before, because the put threw; after, because the worker never sees it.

**Two tests rather than one, because neither covers the other.** `req.destination` names what asked
— it catches the first media request, which on some browsers carries no Range header at all;
`req.headers.has('range')` catches everything else, whoever asked. Returning without
`respondWith` is the whole fix: the request goes to the network exactly as it would with no worker.
**And even repaired it would be wrong** — this store is about thirty-five files of code walked
linearly on every miss, and a sixteen-megabyte clip in it is a cost every visitor pays for a file
only the Reels column asks for.

### The iframe is Drive's player, and for a local file it was the same bytes through a worse door

**The container's Chromium is built WITHOUT the proprietary codecs** — `canPlayType('video/mp4;
codecs="avc1.42E01E"')` comes back empty — so a real H.264 clip errors for real here. That is
usually a limitation and this once it is the instrument: it is the first time this repository could
reach the `error` branch of `reelPlay_` at all, and what it showed is that the branch was wrong.

`clipFrame_` returned the address itself for anything with a slash in it. The whole reason a
`/preview` iframe is worth having is that it is a **different server doing a different thing** —
Drive hands a `<video>` a redirect and hands its own player a stream. Nothing of the kind is true
of a file beside this site: the same decoder on the same bytes, now with Google's chrome, no
autoplay, no mute, and the sound button removed on the way past. **So a dead local clip stays a
`<video>`**, and `.feed-vid` is transparent for exactly this reason — the slide underneath is
`.feed-art`'s own gradient with the subject's initial on it, which is a finished thing rather than
a hole.

**Proved in both directions in one run**: the local clip gives 3 videos and **0 iframes**, with the
browser naming the failure itself (`DEMUXER_ERROR_NO_SUPPORTED_STREAMS`); a bare Drive id — every
Google host is blocked from this environment, so the ladder really runs out — still gives 2 videos
and **1 iframe**. The sound button goes on both endings now rather than only the iframe one: a
control that does nothing is worse than no control.

### `node js/check-reels.js` — the README asked for this file and said when

*"A missing file is a dark reel. The path is not checked by anything yet, because there is nothing
here to check — the first clip that lands is when that check is worth writing."* Two landed.

**A dark reel is the worst shape this column has**, because nothing in the app can report it: the
ladder swaps the element for an iframe on the same address, so a clip whose path is one character
wrong reads as the feature half-working rather than as a file that is not there. Four questions,
each a fault that happened or nearly did:

| | |
|---|---|
| **the file is there** | a path typed by hand against a name nobody re-reads |
| **the spelling is exact** | both clips arrived as `.MP4`. A row saying `.mp4` works on every machine it is written on and 404s on Pages — **the `_scope.js` shape that `.nojekyll` closed, in a second column** |
| **a browser can play it** | read out of the container rather than off the extension: a `.mp4` holding HEVC plays on an iPhone and shows nothing on an Android |
| **`moov` before `mdat`** | the one that is invisible without opening the file. An MP4 whose index sits at the END cannot start until the whole file has arrived — eight megabytes before the first frame instead of a few hundred kilobytes. Every tool writes it either way and nothing about the file says which |

**Weight is printed and not refused** — 15.2 MB across the two — because "under about ten megabytes
is comfortable" is a judgement about somebody's data allowance, not a fault in the file.

**Proved by mutation four ways**: the row spelled `.MP4`, a path naming nothing, a copy rebuilt with
`mdat` before `moov`, and a copy with its `avc1` fourcc patched to `hvc1`. All four exit 1 and name
the row; the real files exit 0.

**What it cannot answer, said rather than implied.** Whether the picture DECODES is settled by a
phone, for the codec reason above. Reading the container is the half a checker can do.
