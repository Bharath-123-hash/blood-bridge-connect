ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS age integer,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS notify_push boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_sms boolean NOT NULL DEFAULT false;