# 461 — Daive: the assistant is a conversation like the others

The owner, looking at the Assistant card in Messages (star disc, its own bubbles, an "Ask a question…" box with a
gold Ask button): "the ai thing needs to follow the format of the other chats too. And it should be called Daive."

## What changed

- **Named Daive** wherever a person sees it: the conversation's title and pager name, the box's label, the backend's
  refusals ("Daive is busy…") and the prompt, which calls itself Daive and never names the company or model behind it.
- **Drawn as a conversation**: `daiveHtml_` (js/posts.js) is the same card a person's thread is — `.dm-head` with a
  `.dm-av` disc (a gold-filled "D", `.daive-av`), `.msg-body` filled by `messagesHtml_`, and a `.msg-form` with
  `.msg-text` and a `Send` `.msg-go`. The `.asst-*` look-alikes and their CSS are gone. Its only differences: no
  attach button, Send is `data-do="daive-send"`, and the day's count is a quiet `.msg-said.daive-left` under the box.
  Still page 0, pinned first; the card carries `data-daive="1"`.
- **Checks that want a person's thread skip it by that attribute**: `#s-dm .card:not([data-daive]) .msg-text` in
  check/states.js and the thread journey in check-flow.

## The two bugs in the screenshot

- **"5 of 5 questions left today" after an answer.** The phone moved its count only when the reply carried a
  numeric `left`, and believed nothing else; a reply without it (a deployment older than the stamp, or `left`
  arriving as text) answered the question and left the line at 5. Now an answer always costs one: the lower of
  "ours less one" and the server's number, coerced. The count is held in memory as well, for a phone whose storage
  refuses. Journey: the stub's first reply has no `left` and the line must read 4 of 5, and still after a repaint.
- **"Welcome to @family.— somebody to say why".** Not a broken string: the brand tab's `slogan` is
  "Somebody to say why.", and `asstFacts_` sent every brand key, so the model glued the slogan onto a greeting.
  The facts now skip slogan/tagline/motto/headline keys, URLs, colours, phone and site, and anything that looks
  like a placeholder (`{{…}}`, `[…]`, TODO, TBC, lorem…); the name goes in as "business name". The prompt says
  not to open with a welcome or the business's name and never to quote a slogan or tagline.

Versions `2026-10-26-a-daive` (all four stamps and css).
