-- Knollside — migration 007: don't imply a paid plan before the business picks
-- one. New businesses have no selected tier until they check out; status stays
-- 'trialing' as a free/unstarted state.
alter table businesses alter column subscription_tier drop not null;
alter table businesses alter column subscription_tier drop default;

-- Clear the misleading 'starter' default on businesses that never actually
-- subscribed (no Stripe subscription on file).
update businesses
set subscription_tier = null
where stripe_subscription_id is null;
