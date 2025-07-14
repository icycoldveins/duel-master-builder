ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role access only"
  ON public.rate_limits
  FOR ALL
  USING (auth.role() = 'service_role'); 