-- Valintakoe Hub -tasotestin liiditaulu Supabaseen.
-- Selkeästi nimetty (valintakoe_hub_leads) ja turvallinen myös JAETUSSA
-- projektissa: oma taulunimi + RLS, joka sallii vain rivin lisäyksen
-- julkisella (publishable/anon) avaimella.
-- Aja tämä Supabasen SQL-editorissa (Dashboard → SQL Editor → New query).

create table if not exists public.valintakoe_hub_leads (
  id            bigint generated always as identity primary key,
  email         text not null,
  name          text,
  -- Mikä koe sopii heille parhaiten (ihmisluettava, esim.
  -- "Valintakoe B — Lääketiede & hammaslääketiede")
  best_exam        text,
  -- Asiakkaan itse valitsema ensisijainen hakukohde (liidiryhmä)
  preferred_exam   text,
  -- Koneluettavat kentät ryhmittelyä ja automaatioita varten
  preferred_code   text,
  preferred_field  text,
  recommended_code  text,
  recommended_field text,
  pain_key      text,
  scores        jsonb,
  source        text default 'tasotesti',
  created_at    timestamptz not null default now()
);

-- Nopeampi haku liidiryhmittäin
create index if not exists valintakoe_hub_leads_preferred_code_idx on public.valintakoe_hub_leads (preferred_code);
create index if not exists valintakoe_hub_leads_recommended_code_idx on public.valintakoe_hub_leads (recommended_code);
create index if not exists valintakoe_hub_leads_created_at_idx on public.valintakoe_hub_leads (created_at desc);

-- RLS päälle. Koskee VAIN tätä taulua — ei vaikuta jaetun kannan muihin tauluihin.
alter table public.valintakoe_hub_leads enable row level security;

-- Salli VAIN rivin lisäys julkisella (anon/publishable) avaimella.
-- Luku, muokkaus ja poisto eivät onnistu tällä avaimella, joten sivuston
-- avain ei pääse käsiksi imperiumin muihin tauluihin.
drop policy if exists "valintakoe_hub_leads_insert_anon" on public.valintakoe_hub_leads;
create policy "valintakoe_hub_leads_insert_anon"
  on public.valintakoe_hub_leads
  for insert
  to anon, authenticated
  with check (true);
