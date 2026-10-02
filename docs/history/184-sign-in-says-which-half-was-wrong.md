## Sign-in says which half was wrong

**Asked for as *"make the error codes more specific. if its username not recognised then say that.
if pin wrong then say that. if its another error then say that."*** `verifyLogin` answers
`not-an-email`, `no-such-email`, `no-pin`, `wrong-pin`, the lock with its minutes, and `server` for
anything that throws after the PIN was right — each as a `why` code beside the sentence, and
`check-handles.js` asserts the codes. **The cost, said plainly**: anybody can now find out whether an
address has an account here, which is what the single sentence used to prevent. The throttle is what
still stands between a guesser and a PIN. A network failure was already its own sentence (`why_`).
