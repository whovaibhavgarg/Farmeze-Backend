
-- Create farmers profile table
CREATE TABLE public.farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory entries table
CREATE TABLE public.inventory_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE CASCADE NOT NULL,
  product TEXT NOT NULL CHECK (product IN ('Potatoes', 'Onions')),
  grade TEXT NOT NULL CHECK (grade IN ('A', 'B', 'C')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  type TEXT NOT NULL CHECK (type IN ('addition', 'subtraction')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_entries ENABLE ROW LEVEL SECURITY;

-- Farmers table policies
CREATE POLICY "Anyone can view farmer profiles" ON public.farmers FOR SELECT USING (true);
CREATE POLICY "Farmers can insert their own profile" ON public.farmers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Farmers can update their own profile" ON public.farmers FOR UPDATE USING (auth.uid() = user_id);

-- Inventory entries policies
CREATE POLICY "Anyone can view inventory entries" ON public.inventory_entries FOR SELECT USING (true);
CREATE POLICY "Farmers can add inventory entries" ON public.inventory_entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.farmers WHERE farmers.id = farmer_id AND farmers.user_id = auth.uid())
);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_farmers_updated_at
  BEFORE UPDATE ON public.farmers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
