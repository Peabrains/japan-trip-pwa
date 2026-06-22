'use strict';

/* ============================================================
   CONFIG — fill in GAS_URL after deploying gas/Code.gs
   ============================================================ */
const Config = {
  GAS_URL:   '',          // ← paste your deployed GAS web app URL here
  TRIP_NAME: 'Japan Trip 2026',
  TRIP_DATE: '2027-04-10',
  BUDGET_MYR: 8000,       // total trip budget in MYR
  EXCHANGE_RATE_JPY: 33,  // 1 MYR = ~33 JPY (update before departure)
};

window.Config = Config;
