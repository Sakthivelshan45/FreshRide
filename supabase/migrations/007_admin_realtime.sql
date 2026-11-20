-- Enable admin Realtime sync without changing any table columns.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'orders'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'business_enquiries'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.business_enquiries;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles AS profile
    WHERE profile.id = (SELECT auth.uid())
      AND profile.is_admin IS TRUE
  );
$function$;

ALTER FUNCTION public.is_current_user_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_current_user_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_current_user_admin()));

DROP POLICY IF EXISTS "Admins can receive admin Realtime broadcasts" ON realtime.messages;
CREATE POLICY "Admins can receive admin Realtime broadcasts"
  ON realtime.messages
  FOR SELECT
  TO authenticated
  USING (
    extension = 'broadcast'
    AND (SELECT realtime.topic()) IN (
      'admin:orders',
      'admin:enquiries',
      'admin:customers',
      'admin:dashboard'
    )
    AND (SELECT public.is_current_user_admin())
  );

CREATE OR REPLACE FUNCTION public.broadcast_admin_deletes()
RETURNS trigger
SECURITY DEFINER
LANGUAGE plpgsql
SET search_path = ''
AS $function$
DECLARE
  topic_name text;
  topic_names text[];
BEGIN
  CASE TG_TABLE_NAME
    WHEN 'orders' THEN
      topic_names := ARRAY['admin:orders', 'admin:customers', 'admin:dashboard'];
    WHEN 'business_enquiries' THEN
      topic_names := ARRAY['admin:enquiries', 'admin:dashboard'];
    WHEN 'profiles' THEN
      topic_names := ARRAY['admin:customers'];
    ELSE
      RAISE EXCEPTION 'Unsupported admin Realtime table: %', TG_TABLE_NAME;
  END CASE;

  FOREACH topic_name IN ARRAY topic_names LOOP
    PERFORM realtime.broadcast_changes(
      topic_name,
      TG_OP,
      TG_OP,
      TG_TABLE_NAME,
      TG_TABLE_SCHEMA,
      NEW,
      OLD
    );
  END LOOP;

  RETURN NULL;
END;
$function$;

ALTER FUNCTION public.broadcast_admin_deletes() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.broadcast_admin_deletes() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS broadcast_admin_order_deletes ON public.orders;
CREATE TRIGGER broadcast_admin_order_deletes
  AFTER DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_admin_deletes();

DROP TRIGGER IF EXISTS broadcast_admin_enquiry_deletes ON public.business_enquiries;
CREATE TRIGGER broadcast_admin_enquiry_deletes
  AFTER DELETE ON public.business_enquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_admin_deletes();

DROP TRIGGER IF EXISTS broadcast_admin_profile_deletes ON public.profiles;
CREATE TRIGGER broadcast_admin_profile_deletes
  AFTER DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.broadcast_admin_deletes();
