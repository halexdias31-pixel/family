## corbettmaths.com is unreachable, and the URL pattern is the answer at the other end

**Reported with three real URLs and "the url of the files themselves follow a pattern. cant you use
this to extract all of the questions from this site?"** The pattern is real and useful. What stops
it is not addressing:

```
curl  https://corbettmaths.com/.../Jan-Foundation_Part1.pdf  →  CONNECT tunnel failed, 403
WebFetch same URL                                            →  EGRESS_BLOCKED
```

**Every host but GitHub and the MCP endpoints is denied at the proxy**, which this file already
records four times about Google and once about github.io. A pattern cannot help with a connection
that is refused before a path is ever sent.

**Where the pattern DOES help is at the owner's end**, and that is worth writing down rather than
just saying no: a loop over the pattern downloads the set in one go, and **the Drive connector is
not blocked** — which is how every other paper in this library arrived. The route is download,
drop in a Drive folder, and the transcription happens here exactly as it does for AQA.
