
CREATE TABLE IF NOT EXISTS public.paddle_customers (
  customer_id text PRIMARY KEY,
  email text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  environment text NOT NULL DEFAULT 'live',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.paddle_customers TO authenticated;
GRANT ALL ON public.paddle_customers TO service_role;

ALTER TABLE public.paddle_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own paddle customer"
  ON public.paddle_customers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages paddle customers"
  ON public.paddle_customers FOR ALL
  USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_paddle_customers_user_id ON public.paddle_customers(user_id);

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS scheduled_change_action text,
  ADD COLUMN IF NOT EXISTS scheduled_change_at timestamptz;
