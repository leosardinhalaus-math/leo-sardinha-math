-- Read-only access-policy audit. Run in Supabase SQL editor.
-- A PASS here checks configuration, not real two-account isolation.
WITH objs AS (
 SELECT c.relname, c.relrowsecurity
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relname IN ('player_profiles','game_stats') AND c.relkind='r'
), policies AS (
 SELECT tablename, cmd, array_to_string(roles,',') roles,
        coalesce(qual,'') qual, coalesce(with_check,'') chk
 FROM pg_policies WHERE schemaname='public'
)
SELECT o.relname AS table_name,
 o.relrowsecurity AS rls_enabled,
 EXISTS(SELECT 1 FROM policies WHERE tablename=o.relname AND cmd='SELECT'
  AND roles LIKE '%anon%' AND qual='true') AS public_read_declared,
 EXISTS(SELECT 1 FROM policies WHERE tablename=o.relname AND cmd='INSERT'
  AND roles LIKE '%authenticated%'
  AND chk LIKE '%auth.uid()%' AND chk LIKE '%user_id%') AS authenticated_insert_scoped,
 EXISTS(SELECT 1 FROM policies WHERE tablename=o.relname AND cmd='UPDATE'
  AND roles LIKE '%authenticated%'
  AND qual LIKE '%auth.uid()%' AND qual LIKE '%user_id%'
  AND chk LIKE '%auth.uid()%' AND chk LIKE '%user_id%') AS authenticated_update_scoped,
 NOT has_table_privilege('anon','public.'||o.relname,
  'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES') AS anonymous_write_revoked,
 NOT has_table_privilege('authenticated','public.'||o.relname,
  'DELETE,TRUNCATE,TRIGGER,REFERENCES') AS unsafe_authenticated_grants_revoked
FROM objs o ORDER BY o.relname;
