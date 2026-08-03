-- Knollside — migration 008: seed starter data for all industries, including
-- the 6 new presets and the "other" custom option (which supports a blank or
-- generic sample start via businesses.starter_mode).

alter table businesses add column if not exists starter_mode text default 'template';

create or replace function handle_new_business()
returns trigger as $$
begin
  case new.industry
    when 'mechanics' then new.labor_rate := 95; new.quantity_type := 'hours';
    when 'cleaning' then new.labor_rate := 0.05; new.quantity_type := 'area';
    when 'landscaping' then new.labor_rate := 0; new.quantity_type := 'count';
    when 'roofing' then new.labor_rate := 3; new.quantity_type := 'area';
    when 'plumbing' then new.labor_rate := 120; new.quantity_type := 'hours';
    when 'hvac' then new.labor_rate := 110; new.quantity_type := 'hours';
    when 'electrical' then new.labor_rate := 115; new.quantity_type := 'hours';
    when 'pest_control' then new.labor_rate := 0; new.quantity_type := 'count';
    when 'moving' then new.labor_rate := 120; new.quantity_type := 'hours';
    when 'other' then new.labor_rate := 10; new.quantity_type := 'area';
    else new.labor_rate := 12; new.quantity_type := 'area';
  end case;
  return new;
end;
$$ language plpgsql security definer;

create or replace function seed_new_business_children()
returns trigger as $$
begin
  -- "other" with blank mode seeds nothing at all.
  if new.industry = 'other' and coalesce(new.starter_mode, 'template') = 'blank' then
    return new;
  end if;

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

  elsif new.industry = 'roofing' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Asphalt shingle', 4.5, 0), (new.id, 'Metal', 9, 1), (new.id, 'Tile', 12, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Low slope', 0, 0), (new.id, 'Medium slope', 1, 1), (new.id, 'Steep slope', 2.5, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Tear-off / removal', 1.5, 'unit', 'sq ft', 0), (new.id, 'Gutter replacement', 8, 'unit', 'linear ft', 1);

  elsif new.industry = 'plumbing' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Leak repair', 0, 0), (new.id, 'Water heater install', 0, 1), (new.id, 'Drain cleaning', 0, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Residential', 0, 0), (new.id, 'Commercial', 25, 1), (new.id, 'Emergency / after-hours', 75, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Parts & materials', 80, 'flat', '', 0), (new.id, 'Permit fee', 60, 'flat', '', 1);

  elsif new.industry = 'hvac' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Tune-up / maintenance', 0, 0), (new.id, 'Repair', 0, 1), (new.id, 'New system install', 0, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Central air', 0, 0), (new.id, 'Heat pump', 15, 1), (new.id, 'Ductless mini-split', 20, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Refrigerant', 120, 'flat', '', 0), (new.id, 'New thermostat', 180, 'flat', '', 1);

  elsif new.industry = 'electrical' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Outlet / switch install', 0, 0), (new.id, 'Panel upgrade', 0, 1), (new.id, 'Lighting install', 0, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Residential', 0, 0), (new.id, 'Commercial', 30, 1), (new.id, 'Emergency / after-hours', 80, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Materials & fixtures', 100, 'flat', '', 0), (new.id, 'Permit fee', 75, 'flat', '', 1);

  elsif new.industry = 'pest_control' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'General pest treatment', 120, 0), (new.id, 'Termite treatment', 400, 1), (new.id, 'Rodent control', 200, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Small home', 0, 0), (new.id, 'Large home', 40, 1), (new.id, 'Commercial', 100, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Follow-up visit', 60, 'unit', 'each', 0), (new.id, 'Exterior barrier', 80, 'flat', '', 1);

  elsif new.industry = 'moving' then
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Local move', 0, 0), (new.id, 'Loading / unloading only', 0, 1), (new.id, 'Junk hauling', 0, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, '2 movers', 0, 0), (new.id, '3 movers', 50, 1), (new.id, '4 movers', 100, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Packing materials', 75, 'flat', '', 0), (new.id, 'Truck fee', 150, 'flat', '', 1);

  elsif new.industry = 'other' then
    -- generic sample set (blank mode already returned above)
    insert into items (business_id, name, base_price, sort_order) values
      (new.id, 'Sample item 1', 50, 0), (new.id, 'Sample item 2', 75, 1), (new.id, 'Sample item 3', 100, 2);
    insert into options (business_id, name, upcharge, sort_order) values
      (new.id, 'Standard', 0, 0), (new.id, 'Premium', 20, 1), (new.id, 'Deluxe', 50, 2);
    insert into addons (business_id, name, price, billing_type, unit_label, sort_order) values
      (new.id, 'Add-on 1', 25, 'flat', '', 0), (new.id, 'Add-on 2', 15, 'unit', 'each', 1), (new.id, 'Add-on 3', 40, 'flat', '', 2);

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
