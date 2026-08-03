-- Knollside — migration 003: add optional customer comments to leads.
alter table leads add column if not exists comments text;
