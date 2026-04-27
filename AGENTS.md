## Database rules

- Every new Supabase table must have RLS policies for SELECT, INSERT, and UPDATE
- Always use `auth.uid() = user_id` pattern
- Never create a table without corresponding policies
