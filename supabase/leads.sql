-- Tasotestin liiditaulu Supabaseen.
-- Turvallinen myös JAETUSSA projektissa: oma taulunimi + RLS, joka sallii
-- vain rivin lisäyksen julkisella (publishable/anon) avaimella.
-- Aja tämä Supabasen SQL-editorissa (Dashboard → SQL Editor → New query).

create table if not exists public.paasykoe_leads (
  id            bigint generated always as identity primary key,
  email         text not null,
  name          text,
  -- ensisijainen hakukohde (liidiryhmä)
  preferred_code   text,
  preferred_field  text,
  -- testin suositus (voi poiketa valitusta)
  recommended_code  text,
  recommended_field text,
  pain_key      text,
  scores        jsonb,
  source        text default 'tasotesti',
  created_at    timestamptz not null default now()
);

-- Nopeampi haku liidiryhmittäin
create index if not exists paasykoe_leads_preferred_code_idx on public.paasykoe_leads (preferred_code);
create index if not exists paasykoe_leads_created_at_idx on public.paasykoe_leads (created_at desc);

-- RLS päälle. Tämä koskee VAIN tätä taulua — ei vaikuta jaetun kannan
-- muihin tauluihin mitenkään.
alter table public.paasykoe_leads enable row level security;

-- Salli VAIN rivin lisäys julkisella (anon/publishable) avaimella.
-- Luku, muokkaus ja poisto eivät onnistu tällä avaimella, joten sivuston
-- avain ei pääse käsiksi imperiumin muihin tauluihin.
drop policy if exists "paasykoe_leads_insert_anon" on public.paasykoe_leads;
create policy "paasykoe_leads_insert_anon"
  on public.paasykoe_leads
  for insert
  to anon, authenticated
  with check (true);
