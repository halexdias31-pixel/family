# Tick the Docket with Siri

Say "Hey Siri, Docket done", then say what you've done: "water, protein and floss". Siri ticks each one and reads back one sentence, for example
"Ticked Water, Protein and Floss. Didn't find 'flos'." Something already ticked in this 8-hour third is read back as "already done" and not ticked again.

You can separate things with commas, "and", "&", "plus" or new lines. Each part ticks the closest match on your Docket.

## Make the Shortcut once (iPhone)

1. Open the **Shortcuts** app and tap **+** to make a new shortcut. Name it **Docket done** (this is what you'll say to Siri).
2. Add the action **Dictate Text**. (Set Stop Listening to "After Pause".)
3. Add the action **URL**. In it, paste your private Docket address from **Tools › Docket**, then type `&do=done&what=` at the end, and after that
   insert the **Dictated Text** variable (tap the variable bar above the keyboard).
4. Add the action **Get Contents of URL** (it uses the URL from step 3; the method is GET).
5. Add the action **Speak Text** and choose **Contents of URL**. (Or **Show Result** if you'd rather read it.)
6. Tap **Done**. Try it: "Hey Siri, Docket done", then "water and floss".

## Good to know

- The address is a secret: anyone with it can read and tick your Docket. Don't share it or paste it in messages. If it gets out, make a new one in
  **Tools › Docket**; the old one stops working at once, and you paste the new one into the Shortcut.
- Two more Shortcuts work the same way: end the address with `&do=add&what=` to add a thing, or with nothing extra to hear what's next.
