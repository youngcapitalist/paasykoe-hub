-- Drip upsert vaatii täyden unique-indeksin (PostgREST on_conflict).
create unique index if not exists lead_drip_enrollments_email_key_stream_key
  on public.lead_drip_enrollments (email_key, stream);
