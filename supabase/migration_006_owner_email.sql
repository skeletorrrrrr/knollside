-- Knollside — migration 006: store the business owner's email so the public
-- lead endpoint can notify them (it runs without an authenticated session and
-- can't read auth.users directly).
alter table businesses add column if not exists owner_email text;

-- Backfill existing businesses from auth.users.
update businesses b
set owner_email = u.email
from auth.users u
where b.owner_id = u.id and b.owner_email is null;
