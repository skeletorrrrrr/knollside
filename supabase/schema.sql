-- Knollside — database schema (multi-industry).
-- Run this once in the Supabase SQL editor for a NEW project.
-- (If you already ran the original countertop-only schema, run
--  migration_002_multi_industry.sql instead of this file.)

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- businesses: the tenant. industry picks the starter template + labels;
-- quantity_type controls what the customer enters in the widget.
-- ---------------------------------------------------------------------------
create table businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade unique,
  name text not null default 'My Business',
  slug text not null unique,
  logo_url text,
  owner_email text,
  industry text not null default 'countertops',
  quantity_type text not null default 'area' check (quantity_type in ('area','hours','count','none')),
  labor_rate numeric not null default 12,
  min_price numeric not null default 0,
  spread_pct numeric not null default 10,
  subscription_tier text not null default 'starter' check (subscription_tier in ('starter','growth','pro')),
  subscription_status text not null default 'trialing',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default now()
);

-- items: the main priced thing (materials, services, packages, ...).
create table items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null default 'Untitled item',
  base_price numeric not null default 0,
  photo_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- options: a single-select modifier (edge finish, vehicle type, property type).
create table options (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null default 'Standard',
  upcharge numeric not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table addons (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  name text not null default 'New add-on',
  price numeric not null default 0,
  billing_type text not null default 'flat' check (billing_type in ('flat','unit')),
  unit_label text default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Leads store a SNAPSHOT of what was quoted, not just foreign keys.
create table leads (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references businesses(id) on delete cascade,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  comments text,
  item_name text,
  item_price_snapshot numeric,
  quantity numeric,
  option_name text,
  option_upcharge_snapshot numeric,
  addons_selected jsonb not null default '[]',
  estimate_low numeric,
  estimate_high numeric,
  status text not null default 'new' check (status in ('new','contacted','won','lost')),
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

create index items_business_idx on items(business_id);
create index options_business_idx on options(business_id);
create index addons_business_idx on addons(business_id);
create index leads_business_idx on leads(business_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: items/options/addons/business branding are publicly
-- readable (the widget needs them); writes are owner-only. Leads are public
-- insert, owner-only read/update.
-- ---------------------------------------------------------------------------
alter table businesses enable row level security;
alter table items enable row level security;
alter table options enable row level security;
alter table addons enable row level security;
alter table leads enable row level security;

create policy "public can read businesses" on businesses for select using (true);
create policy "owner can update own business" on businesses for update using (auth.uid() = owner_id);
create policy "owner can insert own business" on businesses for insert with check (auth.uid() = owner_id);

create policy "public can read items" on items for select using (true);
create policy "owner can write own items" on items for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "public can read options" on options for select using (true);
create policy "owner can write own options" on options for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "public can read addons" on addons for select using (true);
create policy "owner can write own addons" on addons for all
  using (business_id in (select id from businesses where owner_id = auth.uid()))
  with check (business_id in (select id from businesses where owner_id = auth.uid()));

create policy "anyone can submit a lead" on leads for insert with check (true);
create policy "owner can read own leads" on leads for select
  using (business_id in (select id from businesses where owner_id = auth.uid()));
create policy "owner can update own leads" on leads for update
  using (business_id in (select id from businesses where owner_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- Seeding: set business defaults BEFORE insert, seed child rows AFTER insert,
-- both branching on the chosen industry.
-- ---------------------------------------------------------------------------
create or replace function handle_new_business()
returns trigger as $$
begin
  if new.industry = 'mechanics' then
    new.labor_rate := 95; new.quantity_type := 'hours';
  elsif new.industry = 'cleaning' then
    new.labor_rate := 0.05; new.quantity_type := 'area';
  elsif new.industry = 'landscaping' then
    new.labor_rate := 0; new.quantity_type := 'count';
  else
    new.labor_rate := 12; new.quantity_type := 'area';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_business_defaults
  before insert on businesses
  for each row execute function handle_new_business();

create or replace function seed_new_business_children()
returns trigger as $$
begin
  if new.industry = 'mechanics' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Brake job (per axle)', 90, 0), (new.id, 'Oil & filter change', 40, 1), (new.id, 'Diagnostic', 110, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Sedan / compact', 0, 0), (new.id, 'SUV / truck', 15, 1), (new.id, 'Luxury / European', 35, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Shop supplies fee', 25, 'flat', '', 0), (new.id, 'Additional part', 60, 'unit', 'each', 1);
  elsif new.industry = 'cleaning' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Standard clean', 0.12, 0), (new.id, 'Deep clean', 0.22, 1), (new.id, 'Move-out clean', 0.30, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Apartment / condo', 0, 0), (new.id, 'House', 0.03, 1), (new.id, 'Office', 0.05, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Interior windows', 60, 'flat', '', 0), (new.id, 'Extra bathroom', 25, 'unit', 'each', 1);
  elsif new.industry = 'landscaping' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Mow & edge', 45, 0), (new.id, 'Full yard cleanup', 180, 1), (new.id, 'Hedge trimming', 90, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Small (under 1/4 acre)', 0, 0), (new.id, 'Medium (1/4-1/2 acre)', 20, 1), (new.id, 'Large (1/2+ acre)', 50, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Leaf removal', 75, 'flat', '', 0), (new.id, 'Mulch', 40, 'unit', 'cubic yard', 1);
  else
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Granite', 55, 0), (new.id, 'Quartz', 65, 1), (new.id, 'Marble', 85, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Straight', 0, 0), (new.id, 'Beveled', 4, 1), (new.id, 'Bullnose', 6, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Sink cutout', 150, 'flat', '', 0), (new.id, 'Backsplash', 18, 'unit', 'linear ft', 1);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_business_seeded
  after insert on businesses
  for each row execute function seed_new_business_children();
