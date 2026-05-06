-- Admin operations tables for products, orders, promotions, banners, stories, and articles.
-- These tables are intentionally additive so the existing farmer inventory flow keeps working.

CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'kg',
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  price NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  farmer_id UUID REFERENCES public.farmers(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'out_of_stock')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.app_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  delivery_address TEXT,
  city TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'approved', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'refunded')),
  payment_medium TEXT NOT NULL DEFAULT 'cod' CHECK (payment_medium IN ('cod', 'upi', 'card', 'wallet', 'bank_transfer')),
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.app_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
  line_total NUMERIC(10, 2) NOT NULL CHECK (line_total >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'flat')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value >= 0),
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.app_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('banner', 'story', 'article')),
  title TEXT NOT NULL,
  subtitle TEXT,
  body TEXT,
  image_url TEXT,
  link_url TEXT,
  placement TEXT NOT NULL DEFAULT 'home',
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.price_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  old_price NUMERIC(10, 2) NOT NULL CHECK (old_price >= 0),
  new_price NUMERIC(10, 2) NOT NULL CHECK (new_price >= 0),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_adjustments ENABLE ROW LEVEL SECURITY;

-- Public reads let the customer app reflect admin changes immediately.
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can view active promotions" ON public.promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view active app content" ON public.app_content FOR SELECT USING (is_active = true);
CREATE POLICY "Anyone can view orders for demo" ON public.app_orders FOR SELECT USING (true);
CREATE POLICY "Anyone can view order items for demo" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Anyone can view price adjustments for demo" ON public.price_adjustments FOR SELECT USING (true);

-- The current app uses a client-side admin password, so admin writes need permissive demo policies.
-- For production, replace these with Supabase auth role checks or Edge Functions.
CREATE POLICY "Demo admin can manage products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Demo admin can manage orders" ON public.app_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Demo admin can manage order items" ON public.order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Demo admin can manage promotions" ON public.promotions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Demo admin can manage app content" ON public.app_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Demo admin can manage price adjustments" ON public.price_adjustments FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_orders_updated_at
  BEFORE UPDATE ON public.app_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_app_content_updated_at
  BEFORE UPDATE ON public.app_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.products (name, category, description, quantity, price, status)
VALUES
  ('Potatoes', 'Vegetables', 'Fresh graded potatoes sourced from partner farmers.', 500, 30, 'active'),
  ('Onions', 'Vegetables', 'Sorted onions ready for retail and wholesale orders.', 350, 40, 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.promotions (title, code, discount_type, discount_value, is_active)
VALUES
  ('Fresh harvest deal', 'FRESH10', 'percentage', 10, true),
  ('Wholesale buyer offer', 'BULK250', 'flat', 250, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.app_content (type, title, subtitle, body, placement, is_active)
VALUES
  ('banner', 'Farm fresh produce delivered daily', 'Live stock from verified farmers', 'Show this banner on the user app home screen.', 'home', true),
  ('story', 'Today''s farmer spotlight', 'Meet suppliers behind the freshest batches', 'Short story content for the user app carousel.', 'home', true),
  ('article', 'How Farmeze grades produce', 'Quality grading improves trust and pricing', 'Article content managed from the admin panel.', 'home', true)
ON CONFLICT DO NOTHING;
