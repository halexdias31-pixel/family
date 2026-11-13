# 1217 — the extra-seat money shared up the manager chain (13 Nov 2026)

The owner's rule: only EXTRA-SEAT money is shared; the 1-to-1 rate stays the tutor's. Every tutor gives up exactly
half of their extra-seat money, split up the manager chain by halving: the direct manager a quarter, the next half of
what is left, and so on; the admin (no manager) keeps the rest. The admin's own lessons have no cut. It replaces config
`B` and the per-tutor `extra_seat_cut`: an extra seat now costs the tutor's own extra-seat rate and nothing on top.

Why the tutor chooses: "a manager who poaches will lose tutors, so tutors choose." The admin can set it too.

- **One calculator.** `chainShares_` (js/core.js) walks `manager` (a person id on the people tab; blank is the admin)
  and stops at the admin, a missing person or a loop. `priceMoney_` pays the tutor half of the extra-seat money;
  `bookMoney_` takes the managers' parts after the discount (as the tutor's) and before @family.'s net, so card fees
  stay @family.'s. `bookShares_` carries the managers, so pays = tutor + managers + admin + fees to the penny.
  The backend stores what the phone sends and does no pricing, so no shared copy was needed.
- **Where it shows.** The admin's booking breakdown has a line per manager; the Staff hub's pricing bars a Managers
  part; the tutor's own Staff card a "Your manager" picker (`manager` section) with the split in words.
- **Backend.** `manager` column (SCHEMA people), `MANAGER_FIELD` in the tutor's rate group, `managerRefusal_`
  (never yourself, only a tutor or the admin), `manager` sent on each tutor by doGet.
- **Checks.** `check-manager-chain.js` (rule 4.13): the owner's examples, depths to 30, loops, a missing manager,
  admin lessons, the money to the penny, and the backend's refusals. Journey "manager chain (1217)" in 03-tutor-admin.
- **Not done.** The jobs row still keeps one `admin_profit` (managers included); paying managers out is the owner's.
