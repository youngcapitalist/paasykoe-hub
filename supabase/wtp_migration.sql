-- WTP-funnel: lisää kentät valintakoe_hub_leads -tauluun.
-- Aja Supabase SQL Editorissa (jaettu projekti fskuareieemuefgxrwed).

alter table public.valintakoe_hub_leads
  add column if not exists wtp_score integer,
  add column if not exists offered_price_eur integer,
  add column if not exists offer_exam text;

create index if not exists valintakoe_hub_leads_wtp_score_idx
  on public.valintakoe_hub_leads (wtp_score);
