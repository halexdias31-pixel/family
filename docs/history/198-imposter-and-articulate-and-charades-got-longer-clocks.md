## Imposter, and Articulate and Charades got longer clocks

**Asked for as "add one of those word imposter games to games column" and "for articulate give like
90 seconds. for cherades give like 3 minutes."** `ROUND_GAMES` is 90 and 180 seconds now, drawn as
`m:ss` by `roundClock_`, because "180s left" is a number somebody has to divide.

**Imposter is dealt like the Scrabble rack.** Three to twelve players, one phone passed round. The
next player sees only "Hand the phone to Player 3" until they press Show me; everybody gets the word
except one, who is told only the category. Who speaks first is drawn from everybody, the imposter
included, because leaving them out tells the room who it is not. **Every control is built by
`impPaint`**, so nothing on the card can be pressed before there is a round. The round survives a
repaint, and `stop` HIDES a word left on the screen, because a column swiped away and back is how the
next person would otherwise see it. No score and no timer, which is Herd Mentality's argument.

**About half its words are also in Articulate or Charades, and `check-widgets.js` is not asked to
refuse that.** That rule exists because a word described and then mimed is one the room already
knows. Here the word is dealt at random from 242 and only one person is trying to work it out.

**`check-flow.js` deals a round of five through the handlers** and asks: exactly one imposter, every
other player shown one word, one category for all, nothing secret on the screen between two players,
leaving the column hides a shown word, and the reveal names the right player and word. Proved by
mutation: no imposter, and a stop that forgets instead of repainting.
