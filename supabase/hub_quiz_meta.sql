-- Hub-liidit: pain_label + quiz_meta (aja jaetussa projektissa).
-- Migraatio: valintakoefpro/supabase/migrations/20260704153000_hub_liidit_kipu_wtp.sql

alter table public.valintakoe_hub_leads
  add column if not exists pain_label text,
  add column if not exists quiz_meta jsonb default '{}'::jsonb;
