-- migration_010_impersonation_log.sql
-- Audit trail for owner support access.
--
-- The admin dashboard can generate a one-time login link for any customer's
-- account so the owner can fix things for them. That's the highest-privilege
-- action in the app, and the Privacy Policy tells customers that access to
-- production data is limited — so every use gets recorded here.
--
-- No RLS policies are granted: this table is written and read exclusively by
-- the service-role client behind the ADMIN_EMAIL gate. With RLS enabled and no
-- policies, ordinary logged-in users can't read it at all.

create table if not exists admin_impersonations (
  id uuid primary key default gen_random_uuid(),
  admin_email text not null,
  business_id uuid,
  business_name text,
  owner_email text,
  created_at timestamptz not null default now()
);

create index if not exists admin_impersonations_created_idx
  on admin_impersonations(created_at desc);

alter table admin_impersonations enable row level security;
