-- FallØut offline ticketing portal — database schema
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: every statement is guarded.
--
-- Model in one line: an EVENT has many TICKETS, each ticket carries one random
-- token that becomes its QR, and a ticket is spent the moment it is scanned.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table if not exists public.events (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  name          text not null,
  event_date    date,
  venue         text,
  city          text,
  -- Long unguessable string. Anyone holding it can read this event's numbers,
  -- which is how an organiser gets a live view without us creating them a login.
  share_token   text unique not null default encode(gen_random_bytes(24), 'hex'),
  is_open       boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Tickets
-- ---------------------------------------------------------------------------
create table if not exists public.tickets (
  id            uuid primary key default gen_random_uuid(),
  event_id      uuid not null references public.events(id) on delete cascade,

  -- This is the only thing inside the QR. It carries no name, no category and
  -- no price, so a photographed QR tells a forger nothing about how to make one.
  token         text unique not null default encode(gen_random_bytes(16), 'hex'),

  buyer_name    text not null,
  buyer_phone   text,

  category      text not null,            -- GA, Fan Pit, Backstage, GA Group of 3
  phase         text,                     -- Early Bird, Phase 1, Final Phase
  admits        integer not null default 1 check (admits > 0),
  amount        numeric(10, 2) not null check (amount >= 0),

  collected_by  text,                     -- who took the cash
  payment_note  text,                     -- UPI ref, "cash at Andheri", anything

  issued_at     timestamptz not null default now(),
  issued_by     text,

  -- Null means unused. Set once, at the door.
  used_at       timestamptz,
  used_by       text,

  cancelled_at  timestamptz,
  notes         text
);

create index if not exists tickets_event_idx on public.tickets (event_id);
create index if not exists tickets_token_idx on public.tickets (token);
create index if not exists tickets_issued_idx on public.tickets (event_id, issued_at desc);

-- ---------------------------------------------------------------------------
-- Access rules
--
-- Everything here is closed by default. Signed-in staff do the work; the public
-- gets nothing directly and reaches summary numbers only through the function
-- further down, which checks the share token itself.
-- ---------------------------------------------------------------------------
alter table public.events  enable row level security;
alter table public.tickets enable row level security;

drop policy if exists "staff read events"   on public.events;
drop policy if exists "staff write events"  on public.events;
drop policy if exists "staff read tickets"  on public.tickets;
drop policy if exists "staff write tickets" on public.tickets;
drop policy if exists "staff edit tickets"  on public.tickets;

create policy "staff read events"
  on public.events for select
  to authenticated using (true);

create policy "staff write events"
  on public.events for insert
  to authenticated with check (true);

create policy "staff read tickets"
  on public.tickets for select
  to authenticated using (true);

create policy "staff write tickets"
  on public.tickets for insert
  to authenticated with check (true);

create policy "staff edit tickets"
  on public.tickets for update
  to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- Redeeming a ticket
--
-- Done in the database rather than the scanner so that two phones cannot both
-- accept the same QR while they are online. The first update wins; the second
-- gets back already_used along with the time it was first let in.
-- ---------------------------------------------------------------------------
create or replace function public.redeem_ticket(p_token text, p_gate text default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  t public.tickets%rowtype;
begin
  select * into t from public.tickets where token = p_token;

  if not found then
    return json_build_object('status', 'not_found');
  end if;

  if t.cancelled_at is not null then
    return json_build_object('status', 'cancelled', 'ticket', row_to_json(t));
  end if;

  if t.used_at is not null then
    return json_build_object('status', 'already_used', 'ticket', row_to_json(t));
  end if;

  update public.tickets
     set used_at = now(), used_by = p_gate
   where id = t.id and used_at is null
  returning * into t;

  if not found then
    -- Someone else redeemed it between the read and the write.
    select * into t from public.tickets where token = p_token;
    return json_build_object('status', 'already_used', 'ticket', row_to_json(t));
  end if;

  return json_build_object('status', 'ok', 'ticket', row_to_json(t));
end;
$$;

revoke all on function public.redeem_ticket(text, text) from public, anon;
grant execute on function public.redeem_ticket(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Organiser view
--
-- Takes the event's share token and returns counts and totals only. No names,
-- no phone numbers, nothing that would matter if the link were forwarded on.
-- ---------------------------------------------------------------------------
create or replace function public.event_summary(p_share_token text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  e public.events%rowtype;
begin
  select * into e from public.events where share_token = p_share_token;

  if not found then
    return json_build_object('status', 'not_found');
  end if;

  return json_build_object(
    'status', 'ok',
    'event', json_build_object(
      'name', e.name, 'event_date', e.event_date,
      'venue', e.venue, 'city', e.city
    ),
    'totals', (
      select json_build_object(
        'tickets',   count(*),
        'admits',    coalesce(sum(admits), 0),
        'amount',    coalesce(sum(amount), 0),
        'checked_in',count(*) filter (where used_at is not null),
        'admitted',  coalesce(sum(admits) filter (where used_at is not null), 0)
      )
      from public.tickets
      where event_id = e.id and cancelled_at is null
    ),
    'breakdown', (
      select coalesce(json_agg(row_to_json(b) order by b.phase, b.category), '[]'::json)
      from (
        select phase, category,
               count(*)                                        as tickets,
               coalesce(sum(admits), 0)                        as admits,
               coalesce(sum(amount), 0)                        as amount,
               count(*) filter (where used_at is not null)     as checked_in
        from public.tickets
        where event_id = e.id and cancelled_at is null
        group by phase, category
      ) b
    )
  );
end;
$$;

grant execute on function public.event_summary(text) to anon, authenticated;
