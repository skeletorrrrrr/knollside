-- Knollside — migration 004: track whether a lead has been seen, separate
-- from its pipeline status. Existing leads default to unseen (false) so the
-- badge count is meaningful immediately.
alter table leads add column if not exists seen boolean not null default false;
