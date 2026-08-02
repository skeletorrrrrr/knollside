-- Knollside — migration 002: generalize from countertops-only to multi-industry.
-- Safe to run once on top of the original schema.sql. Renames stone-specific
-- columns to generic names, adds industry + quantity_type to businesses, and
-- replaces the seed trigger with one that branches by industry.

-- 1. businesses: add industry + how the main quantity input behaves
alter table businesses
  add column if not exists industry text not null default 'countertops',
  add column if not exists quantity_type text not null default 'area'
    check (quantity_type in ('area', 'hours', 'count', 'none'));

-- 2. materials -> generic "items". Rename the table and its stone-specific column.
alter table materials rename column price_per_sqft to base_price;
alter table materials rename to items;

-- 3. edges -> generic "options" (kept as a separate single-select dimension).
alter table edges rename column upcharge_per_sqft to upcharge;
alter table edges rename to options;

-- addons is already generic — no change needed.

-- 4. leads: the snapshot columns were named for stone. Rename to generic.
alter table leads rename column material_name to item_name;
alter table leads rename column material_price_snapshot to item_price_snapshot;
alter table leads rename column sqft to quantity;
alter table leads rename column edge_name to option_name;
alter table leads rename column edge_upcharge_snapshot to option_upcharge_snapshot;

-- 5. Replace the seed trigger: branch the starter data by the chosen industry.
--    We set labor_rate / quantity_type directly on NEW (this is a BEFORE-safe
--    pattern) rather than UPDATE-ing the same row we're inserting.
create or replace function handle_new_business()
returns trigger as $$
begin
  if new.industry = 'mechanics' then
    new.labor_rate := 95;
    new.quantity_type := 'hours';
  elsif new.industry = 'cleaning' then
    new.labor_rate := 0.05;
    new.quantity_type := 'area';
  elsif new.industry = 'landscaping' then
    new.labor_rate := 0;
    new.quantity_type := 'count';
  else
    new.labor_rate := 12;
    new.quantity_type := 'area';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- This function now needs to run BEFORE insert (it edits NEW), while the
-- child-row seeding needs to run AFTER insert (the business row must exist
-- first for the foreign keys). So we split into two triggers.
drop trigger if exists on_business_created on businesses;

create trigger on_business_defaults
  before insert on businesses
  for each row execute function handle_new_business();

create or replace function seed_new_business_children()
returns trigger as $$
begin
  if new.industry = 'mechanics' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Brake job (per axle)', 90, 0),
      (new.id, 'Oil & filter change', 40, 1),
      (new.id, 'Diagnostic', 110, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Sedan / compact', 0, 0),
      (new.id, 'SUV / truck', 15, 1),
      (new.id, 'Luxury / European', 35, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Shop supplies fee', 25, 'flat', '', 0),
      (new.id, 'Additional part', 60, 'unit', 'each', 1);

  elsif new.industry = 'cleaning' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Standard clean', 0.12, 0),
      (new.id, 'Deep clean', 0.22, 1),
      (new.id, 'Move-out clean', 0.30, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Apartment / condo', 0, 0),
      (new.id, 'House', 0.03, 1),
      (new.id, 'Office', 0.05, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Interior windows', 60, 'flat', '', 0),
      (new.id, 'Extra bathroom', 25, 'unit', 'each', 1);

  elsif new.industry = 'landscaping' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Mow & edge', 45, 0),
      (new.id, 'Full yard cleanup', 180, 1),
      (new.id, 'Hedge trimming', 90, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Small (under 1/4 acre)', 0, 0),
      (new.id, 'Medium (1/4-1/2 acre)', 20, 1),
      (new.id, 'Large (1/2+ acre)', 50, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Leaf removal', 75, 'flat', '', 0),
      (new.id, 'Mulch', 40, 'unit', 'cubic yard', 1);

  else
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Granite', 55, 0),
      (new.id, 'Quartz', 65, 1),
      (new.id, 'Marble', 85, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Straight', 0, 0),
      (new.id, 'Beveled', 4, 1),
      (new.id, 'Bullnose', 6, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Sink cutout', 150, 'flat', '', 0),
      (new.id, 'Backsplash', 18, 'unit', 'linear ft', 1);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_business_seeded
  after insert on businesses
  for each row execute function seed_new_business_children();
