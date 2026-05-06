-- Keep the products table in sync when farmers submit stock entries.
-- Existing inventory_entries remain as audit/history; products.quantity is the live user-app stock.

CREATE OR REPLACE FUNCTION public.sync_inventory_entry_to_product()
RETURNS TRIGGER AS $$
DECLARE
  delta INTEGER;
BEGIN
  delta := CASE WHEN NEW.type = 'addition' THEN NEW.quantity ELSE -NEW.quantity END;

  UPDATE public.products
  SET
    quantity = GREATEST(0, quantity + delta),
    status = CASE WHEN GREATEST(0, quantity + delta) > 0 THEN 'active' ELSE 'out_of_stock' END,
    updated_at = now()
  WHERE lower(name) = lower(NEW.product);

  IF NOT FOUND AND NEW.type = 'addition' THEN
    INSERT INTO public.products (name, category, quantity, price, farmer_id, status)
    VALUES (NEW.product, 'Vegetables', NEW.quantity, 0, NEW.farmer_id, 'active');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS sync_inventory_entries_to_products ON public.inventory_entries;

CREATE TRIGGER sync_inventory_entries_to_products
  AFTER INSERT ON public.inventory_entries
  FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_entry_to_product();
