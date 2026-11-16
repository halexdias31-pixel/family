#!/usr/bin/env node
/* @family. — check-paper-orders.js EVERY ORDER OF A PAST PAPER'S ANSWERS REACHES ITS QUESTIONS (owner, 16 Nov: R0373).
   The walk is check-funnel.js's `paperOrders_`, run alone through the same jsdom harness. PAPER_ORDERS=n walks every nth paper (R0373 always). */
process.env.FUNNEL_ONLY = 'orders';
require('./check-funnel.js');
