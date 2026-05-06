import { useEffect, useState } from "react";
import { BadgeIndianRupee, Megaphone, Package } from "lucide-react";
import { api, getId, type AppContent, type Product, type Promotion } from "@/lib/api";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const isActive = (item: { isActive?: boolean; is_active?: boolean }) => item.isActive ?? item.is_active ?? false;
const imageUrl = (item: AppContent) => item.imageUrl || item.image_url || "";

const LiveMarketplaceSection = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [content, setContent] = useState<AppContent[]>([]);

  useEffect(() => {
    const loadLiveData = () => Promise.all([
      api.products.list(),
      api.promotions.list(),
      api.content.list(),
    ]).then(([productResult, promoResult, contentResult]) => {
      setProducts((productResult || []).filter((product) => product.status === "active").slice(0, 6));
      setPromotions((promoResult || []).filter((promo) => isActive(promo)).slice(0, 3));
      setContent((contentResult || []).filter((item) => isActive(item)).slice(0, 4));
    }).catch(() => {
      setProducts([]);
      setPromotions([]);
      setContent([]);
    });

    loadLiveData();
    const interval = window.setInterval(loadLiveData, 30000); // Increased to 30 seconds to reduce frequency
    return () => window.clearInterval(interval);
  }, []);

  if (!products.length && !promotions.length && !content.length) return null;

  const banner = content.find((item) => item.type === "banner");
  const stories = content.filter((item) => item.type !== "banner");

  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase text-primary">Live from admin</p>
            <h2 className="mt-2 text-2xl font-extrabold text-foreground md:text-3xl">Fresh updates in the user app</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Products, offers, banners, and stories published by the admin appear here from Supabase.
            </p>
          </div>
        </div>

        {banner && (
          <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
              <div className="p-6 md:p-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  <Megaphone className="h-3.5 w-3.5" />
                  Active banner
                </div>
                <h3 className="text-2xl font-extrabold text-foreground">{banner.title}</h3>
                {banner.subtitle && <p className="mt-2 text-muted-foreground">{banner.subtitle}</p>}
              </div>
              {imageUrl(banner) ? (
                <img src={imageUrl(banner)} alt={banner.title} className="h-56 w-full object-cover md:h-full" />
              ) : (
                <div className="flex min-h-56 items-center justify-center bg-secondary">
                  <LeafMark />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-border bg-card shadow-sm">
            <div className="border-b border-border p-4">
              <h3 className="font-extrabold text-foreground">Available Products</h3>
              <p className="text-sm text-muted-foreground">Inventory managed from the admin dashboard.</p>
            </div>
            <div className="grid gap-3 p-4 sm:grid-cols-2">
              {products.map((product) => (
                <div key={getId(product)} className="rounded-md border border-border p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-end justify-between">
                    <p className="text-sm font-bold text-muted-foreground">{product.quantity} {product.unit}</p>
                    <p className="text-lg font-extrabold text-foreground">{money(product.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border p-4">
                <h3 className="font-extrabold text-foreground">Active Discounts</h3>
              </div>
              <div className="divide-y divide-border">
                {promotions.map((promo) => (
                <div key={getId(promo)} className="flex items-center justify-between gap-3 p-4">
                    <div>
                      <p className="font-bold text-foreground">{promo.title}</p>
                      <p className="text-xs text-muted-foreground">{promo.code || "No coupon code"}</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <BadgeIndianRupee className="h-5 w-5" />
                    </div>
                  </div>
                ))}
                {!promotions.length && <p className="p-4 text-sm font-semibold text-muted-foreground">No live discounts.</p>}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border p-4">
                <h3 className="font-extrabold text-foreground">Stories and Articles</h3>
              </div>
              <div className="divide-y divide-border">
                {stories.map((item) => (
                  <div key={getId(item)} className="p-4">
                    <p className="text-xs font-extrabold uppercase text-primary">{item.type}</p>
                    <p className="mt-1 font-bold text-foreground">{item.title}</p>
                    {item.subtitle && <p className="mt-1 text-sm text-muted-foreground">{item.subtitle}</p>}
                  </div>
                ))}
                {!stories.length && <p className="p-4 text-sm font-semibold text-muted-foreground">No stories or articles published.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const LeafMark = () => (
  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
    <Package className="h-8 w-8" />
  </div>
);

export default LiveMarketplaceSection;
