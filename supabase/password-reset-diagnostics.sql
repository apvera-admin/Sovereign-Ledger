-- Password Reset Diagnostics (SQL-only parts)
-- IMPORTANT:
-- Password reset email delivery itself is NOT configured by SQL in hosted Supabase.
-- You still must configure:
--   Authentication -> Email -> SMTP Settings
--   Authentication -> URL Configuration -> Redirect URLs

-- 1) Inspect auth users (recent first)
select
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at,
  last_sign_in_at
from auth.users
order by created_at desc
limit 200;

-- 2) Check one specific user by email (replace value)
-- select id, email, email_confirmed_at, confirmed_at, created_at
-- from auth.users
-- where lower(email) = lower('client@example.com');

-- 3) Optional: mark a specific user as email-confirmed (replace value)
-- Use only if you intentionally bypass email confirmation for a client account.
-- update auth.users
-- set
--   email_confirmed_at = coalesce(email_confirmed_at, now()),
--   confirmed_at = coalesce(confirmed_at, now()),
--   updated_at = now()
-- where lower(email) = lower('client@example.com');
