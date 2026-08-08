-- migration_009_publish.sql
-- Adds an explicit "published" state to businesses.
--
-- Before this, an estimator was live from the moment the account existed —
-- there was no moment where the owner deliberately turned it on, so the
-- Publish step of the setup wizard had nothing to actually do.
--
-- Existing businesses are backfilled to published = true so nobody's already-
-- embedded widget changes behavior. Only NEW signups start unpublished.

alter table businesses
  add column if not exists published boolean not null default false,
  add column if not exists published_at timestamptz;

-- Backfill: every business that exists as of this migration is already live.
update businesses
set published = true,
    published_at = coalesce(published_at, created_at)
where published = false;

-- New signups start unpublished and flip the flag from the Publish step.
alter table businesses alter column published set default false;
