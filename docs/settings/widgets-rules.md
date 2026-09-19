# widgets-rules

| rule_id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| WG-001 | Widgets | (global) |  | rule | Tools and games are declared in WIDGETS in map.js, not in a tab. | It is the last place where adding something means editing JavaScript. Repeating unit is a widget; it should be a tab. | map.js WIDGETS | TRUE |
| WG-002 | Widgets | (global) |  | rule | A widget marked solid is shown whether or not it has data behind it. | A calculator is useful empty. A calendar is not. | map.js solid | TRUE |
| WG-003 | Widgets | (global) |  | rule | A widget marked admin is only offered to an admin. | The flyer maker is the only one. | map.js admin | TRUE |
| WG-004 | Widgets | (global) |  | rule | A widget is started by a named function, and appears in the funnel under Tools or Games by its kind. | It keeps a widget a row plus a function, rather than a screen. | map.js start, find.js KINDS | TRUE |
| WG-010 | Overworld | (global) |  | rule | The ground is rolled from a seed, so the same world is drawn every time without storing it. | Storing a generated world is storing something that can be recomputed exactly. | map.js | TRUE |
| WG-011 | Overworld | (global) |  | rule | Landmarks are real places with real coordinates. Their shape lives on their parts. | Nine of eleven landmarks carried an outline that was also on one of their parts, kept in step by hand. | landmarks tab, merged | TRUE |
