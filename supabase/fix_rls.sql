-- 1. Enable RLS (just in case)
alter table businesses enable row level security;

-- 2. Drop existing policies to ensure a clean slate
drop policy if exists "Enable insert for all users" on businesses;
drop policy if exists "Enable read access for all users" on businesses;
drop policy if exists "Enable all access for all users" on businesses;

-- 3. Create a permissive policy for INSERT (allows anyone to add rows)
create policy "Enable insert for all users"
on businesses
for insert
with check (true);

-- 4. Create a permissive policy for SELECT (allows anyone to view rows)
create policy "Enable read access for all users"
on businesses
for select
using (true);
