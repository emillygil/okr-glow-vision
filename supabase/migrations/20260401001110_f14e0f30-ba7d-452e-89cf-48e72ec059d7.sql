
-- Add parent_objective_id and team_id to objectives for cascading tactical objectives
ALTER TABLE public.objectives ADD COLUMN parent_objective_id uuid REFERENCES public.objectives(id) ON DELETE CASCADE;
ALTER TABLE public.objectives ADD COLUMN team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE;

-- Add new fields to key_results
ALTER TABLE public.key_results ADD COLUMN measurement_method text;
ALTER TABLE public.key_results ADD COLUMN data_source text;
ALTER TABLE public.key_results ADD COLUMN update_frequency text DEFAULT 'mensal';
ALTER TABLE public.key_results ADD COLUMN base_value numeric DEFAULT 0;
ALTER TABLE public.key_results ADD COLUMN parent_kr_id uuid REFERENCES public.key_results(id) ON DELETE CASCADE;

-- Add month to kr_history
ALTER TABLE public.kr_history ADD COLUMN month text;

-- Function to create tactical objectives for all teams when a strategic objective is created
CREATE OR REPLACE FUNCTION public.create_tactical_objectives()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.type = 'estrategico' AND NEW.parent_objective_id IS NULL THEN
    INSERT INTO public.objectives (title, type, period_id, created_by, parent_objective_id, team_id)
    SELECT NEW.title, 'tatico', NEW.period_id, NEW.created_by, NEW.id, t.id
    FROM public.teams t;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to update tactical objectives when strategic objective is updated
CREATE OR REPLACE FUNCTION public.update_tactical_objectives()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.type = 'estrategico' AND NEW.parent_objective_id IS NULL THEN
    UPDATE public.objectives
    SET title = NEW.title, updated_at = now()
    WHERE parent_objective_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

-- Function to create tactical objectives for a new team
CREATE OR REPLACE FUNCTION public.create_tactical_for_new_team()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.objectives (title, type, period_id, created_by, parent_objective_id, team_id)
  SELECT o.title, 'tatico', o.period_id, o.created_by, o.id, NEW.id
  FROM public.objectives o
  WHERE o.type = 'estrategico' AND o.parent_objective_id IS NULL;
  RETURN NEW;
END;
$$;

-- Triggers
CREATE TRIGGER trg_create_tactical_objectives
  AFTER INSERT ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION public.create_tactical_objectives();

CREATE TRIGGER trg_update_tactical_objectives
  AFTER UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION public.update_tactical_objectives();

CREATE TRIGGER trg_create_tactical_for_new_team
  AFTER INSERT ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.create_tactical_for_new_team();

-- RLS: Operators can view objectives for their team (tactical) - already have SELECT for authenticated
-- No additional RLS needed since authenticated users can already view all objectives
