
-- 1. Trigger: create profile on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Trigger: cascade strategic objectives to all teams
CREATE OR REPLACE TRIGGER trg_create_tactical_objectives
  AFTER INSERT ON public.objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.create_tactical_objectives();

-- 3. Trigger: update tactical titles when strategic is updated
CREATE OR REPLACE TRIGGER trg_update_tactical_objectives
  AFTER UPDATE ON public.objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_tactical_objectives();

-- 4. Trigger: create tactical objectives for new teams
CREATE OR REPLACE TRIGGER trg_create_tactical_for_new_team
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.create_tactical_for_new_team();

-- 5. Trigger: delete tactical objectives when strategic is deleted
CREATE OR REPLACE FUNCTION public.delete_tactical_objectives()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.type = 'estrategico' AND OLD.parent_objective_id IS NULL THEN
    DELETE FROM public.objectives WHERE parent_objective_id = OLD.id;
  END IF;
  RETURN OLD;
END;
$$;

CREATE OR REPLACE TRIGGER trg_delete_tactical_objectives
  BEFORE DELETE ON public.objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_tactical_objectives();

-- 6. Add updated_by_name to kr_history
ALTER TABLE public.kr_history ADD COLUMN IF NOT EXISTS updated_by_name text;

-- 7. Trigger: auto-update updated_at on key_results
CREATE OR REPLACE TRIGGER update_key_results_updated_at
  BEFORE UPDATE ON public.key_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Trigger: auto-update updated_at on objectives
CREATE OR REPLACE TRIGGER update_objectives_updated_at
  BEFORE UPDATE ON public.objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
