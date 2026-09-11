CREATE TABLE public.visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  neighborhood TEXT NOT NULL,
  voter_name TEXT,
  notes TEXT,
  president_choice TEXT NOT NULL,
  president_other TEXT,
  governor_choice TEXT NOT NULL,
  governor_other TEXT,
  federal_choice TEXT NOT NULL,
  federal_other TEXT,
  state_choice TEXT NOT NULL,
  state_other TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.visits TO authenticated;
GRANT ALL ON public.visits TO service_role;

ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own visits" ON public.visits
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own visits" ON public.visits
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own visits" ON public.visits
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own visits" ON public.visits
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX visits_user_visited_idx ON public.visits (user_id, visited_at DESC);
CREATE INDEX visits_neighborhood_idx ON public.visits (user_id, neighborhood);