-- Applied remotely via Supabase MCP; kept here for source control.
-- When a profile becomes paid/customer, exit all active/paused nurture streams.
CREATE OR REPLACE FUNCTION public.exit_nurture_on_paid_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
  became_paid boolean := false;
BEGIN
  became_paid := (
    NEW.is_customer IS TRUE
    OR COALESCE(NEW.subscription_tier, 'free') IN ('pro', 'vip', 'basic')
    OR NEW.manual_tier_override IS NOT NULL
    OR (NEW.exam_access_until IS NOT NULL AND NEW.exam_access_until > now())
    OR (NEW.vip_access_until IS NOT NULL AND NEW.vip_access_until > now())
  );

  IF NOT became_paid THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF (
      OLD.is_customer IS NOT DISTINCT FROM NEW.is_customer
      AND OLD.subscription_tier IS NOT DISTINCT FROM NEW.subscription_tier
      AND OLD.manual_tier_override IS NOT DISTINCT FROM NEW.manual_tier_override
      AND OLD.exam_access_until IS NOT DISTINCT FROM NEW.exam_access_until
      AND OLD.vip_access_until IS NOT DISTINCT FROM NEW.vip_access_until
    ) THEN
      RETURN NEW;
    END IF;
  END IF;

  SELECT lower(u.email) INTO user_email
  FROM auth.users u
  WHERE u.id = NEW.user_id;

  IF user_email IS NULL OR user_email = '' THEN
    RETURN NEW;
  END IF;

  UPDATE public.active_nurture_streams
  SET status = 'exited_by_purchase',
      updated_at = now()
  WHERE lower(email) = user_email
    AND status IN ('active', 'paused');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_exit_nurture_on_paid_profile ON public.profiles;
CREATE TRIGGER trg_exit_nurture_on_paid_profile
AFTER INSERT OR UPDATE OF is_customer, subscription_tier, manual_tier_override, exam_access_until, vip_access_until
ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.exit_nurture_on_paid_profile();
