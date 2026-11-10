# LeadsDashboard patch — Lataukset-osio

Korvaa kurssisivun `src/pages/LeadsDashboard.tsx` (tai vastaava) tällä tiedostolla.

Lisää erillisen **Lataukset**-osion, jossa näkyy:
- mikä koe (A/B/C/E/F)
- mitä latasi (esim. edellisen vuoden koe PDF)
- liikenne (Google / Bing / …)
- email + aika

## Live heti (ilman kurssirepoa)

1. Hub: `/admin/liidit?token=…`
2. Supabase Edge: `founder-leads?token=…`

Token: `founder_dashboard_tokens` tai env `ADMIN_DASHBOARD_SECRET`.
