-- Tasotestin liiditaulu Supabaseen.
-- Aja tämä Supabasen SQL-editorissa (Dashboard → SQL Editor → New query).

create table if not exists public.leads (
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
create index if not exists leads_preferred_code_idx on public.leads (preferred_code);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- RLS päälle. API-reitti käyttää service_role-avainta, joka ohittaa RLS:n,
-- joten erillistä insert-policya ei tarvita anonyymeille käyttäjille.
alter table public.leads enable row level security;
