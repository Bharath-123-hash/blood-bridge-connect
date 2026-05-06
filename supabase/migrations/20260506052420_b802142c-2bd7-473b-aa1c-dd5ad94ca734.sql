-- Blood group enum
CREATE TYPE public.blood_group AS ENUM ('A+','A-','B+','B-','O+','O-','AB+','AB-');
CREATE TYPE public.urgency_level AS ENUM ('Critical','High','Moderate');
CREATE TYPE public.request_status AS ENUM ('open','fulfilled','cancelled');
CREATE TYPE public.response_status AS ENUM ('accepted','declined');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  blood_group public.blood_group,
  phone TEXT,
  area TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  last_donation_date DATE,
  available BOOLEAN NOT NULL DEFAULT true,
  donation_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by authenticated"
  ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users insert own profile"
  ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Emergency requests
CREATE TABLE public.emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital TEXT NOT NULL,
  blood_group public.blood_group NOT NULL,
  units INT NOT NULL DEFAULT 1,
  patient_info TEXT,
  urgency public.urgency_level NOT NULL DEFAULT 'High',
  area TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  contact_name TEXT,
  contact_phone TEXT,
  status public.request_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Requests viewable by authenticated"
  ON public.emergency_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can create requests"
  ON public.emergency_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Requester can update own request"
  ON public.emergency_requests FOR UPDATE TO authenticated USING (auth.uid() = requester_id);

-- Donor responses
CREATE TABLE public.donor_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.emergency_requests(id) ON DELETE CASCADE,
  donor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.response_status NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (request_id, donor_id)
);
ALTER TABLE public.donor_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donor sees own responses"
  ON public.donor_responses FOR SELECT TO authenticated
  USING (auth.uid() = donor_id OR auth.uid() IN (SELECT requester_id FROM public.emergency_requests WHERE id = request_id));
CREATE POLICY "Donor inserts own response"
  ON public.donor_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = donor_id);
CREATE POLICY "Donor updates own response"
  ON public.donor_responses FOR UPDATE TO authenticated USING (auth.uid() = donor_id);

-- Auto-profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.donor_responses;