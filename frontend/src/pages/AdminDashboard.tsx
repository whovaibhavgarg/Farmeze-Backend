import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  api,
  getId,
  type AppContent,
  type AppOrder,
  type ContentType,
  type Farmer,
  type InventoryEntry,
  type OrderItem,
  type OrderStatus,
  type PaymentStatus,
  type PriceAdjustment,
  type Product,
  type Promotion,
} from "@/lib/api";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  BadgeIndianRupee,
  BarChart3,
  BookOpenText,
  Boxes,
  Check,
  ClipboardList,
  CreditCard,
  Image,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Minus,
  PackagePlus,
  PencilLine,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  Users,
} from "lucide-react";

type AdminView = "home" | "inventory" | "orders" | "management";
const money = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const orderNumber = (order: AppOrder) => order.orderNumber || order.order_number || "";
const customerName = (order: AppOrder) => order.customerName || order.customer_name || "";
const customerPhone = (order: AppOrder) => order.customerPhone || order.customer_phone || "";
const paymentStatus = (order: AppOrder) => order.paymentStatus || order.payment_status || "unpaid";
const paymentMedium = (order: AppOrder) => order.paymentMedium || order.payment_medium || "cod";
const totalAmount = (order: AppOrder) => order.totalAmount ?? order.total_amount ?? 0;
const createdAt = (value: { createdAt?: string; created_at?: string }) => value.createdAt || value.created_at || new Date().toISOString();
const farmerForProduct = (product: Product) => product.farmer || product.farmers || null;
const promoActive = (promotion: Promotion) => promotion.isActive ?? promotion.is_active ?? false;
const promoType = (promotion: Promotion) => promotion.discountType || promotion.discount_type || "percentage";
const promoValue = (promotion: Promotion) => promotion.discountValue ?? promotion.discount_value ?? 0;
const contentActive = (item: AppContent) => item.isActive ?? item.is_active ?? false;
const contentImage = (item: AppContent) => item.imageUrl || item.image_url || "";
const entryFarmer = (entry: InventoryEntry) => entry.farmer || entry.farmers || null;
const itemProductId = (item: OrderItem) => item.productId || item.product_id || null;
const adjustmentProductName = (item: PriceAdjustment) => item.productName || item.product_name || "";
const oldPrice = (item: PriceAdjustment) => item.oldPrice ?? item.old_price ?? 0;
const newPrice = (item: PriceAdjustment) => item.newPrice ?? item.new_price ?? 0;

const statusClass = (status: string) => {
  const styles: Record<string, string> = {
    active: "bg-primary/10 text-primary border-primary/20",
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    out_of_stock: "bg-red-50 text-red-700 border-red-100",
    new: "bg-blue-50 text-blue-700 border-blue-100",
    approved: "bg-violet-50 text-violet-700 border-violet-100",
    shipped: "bg-amber-50 text-amber-700 border-amber-100",
    delivered: "bg-primary/10 text-primary border-primary/20",
    cancelled: "bg-red-50 text-red-700 border-red-100",
    paid: "bg-primary/10 text-primary border-primary/20",
    unpaid: "bg-amber-50 text-amber-700 border-amber-100",
    refunded: "bg-slate-100 text-slate-700 border-slate-200",
  };
  return styles[status] || styles.draft;
};

const AdminDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<AdminView>("home");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [content, setContent] = useState<AppContent[]>([]);
  const [priceAdjustments, setPriceAdjustments] = useState<PriceAdjustment[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [setupError, setSetupError] = useState("");

  const [productForm, setProductForm] = useState({
    name: "",
    category: "",
    quantity: "0",
    price: "0",
    farmer_id: "",
    description: "",
  });

  const [promoForm, setPromoForm] = useState({
    title: "",
    code: "",
    discount_type: "percentage",
    discount_value: "10",
  });

  const [contentForm, setContentForm] = useState({
    type: "banner" as ContentType,
    title: "",
    subtitle: "",
    body: "",
    placement: "home",
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  const [farmerForm, setFarmerForm] = useState({
    name: "",
    location: "",
    phone: "",
  });

  const [priceForm, setPriceForm] = useState({
    product_id: "",
    new_price: "",
    reason: "",
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    setSetupError("");

    try {
      const [productResult, orderResult, promoResult, contentResult, priceResult, farmerResult, entryResult] = await Promise.all([
        api.products.list(),
        api.orders.list(),
        api.promotions.list(),
        api.content.list(),
        api.priceAdjustments.list(),
        api.farmers.list(),
        api.inventoryEntries.list(),
      ]);

      setProducts(productResult || []);
      setOrders(orderResult || []);
      setPromotions(promoResult || []);
      setContent(contentResult || []);
      setPriceAdjustments(priceResult || []);
      setFarmers(farmerResult || []);
      setEntries(entryResult || []);
    } catch (error) {
      setSetupError(error instanceof Error ? error.message : "MongoDB API is not running yet.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // Refresh orders automatically while the admin is viewing orders
    const interval = window.setInterval(() => {
      if (view === "orders") loadData();
    }, 15000);
    return () => window.clearInterval(interval);
  }, [view]);

  if (authLoading || !user || user.role !== "admin") return null;

  const showMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const totalStock = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
  const totalRevenue = orders.reduce((sum, order) => sum + Number(totalAmount(order) || 0), 0);
  const openOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length;
  const activePromos = promotions.filter((promo) => promoActive(promo)).length;
  const lowStock = products.filter((product) => product.quantity <= 20 || product.status === "out_of_stock").length;

  const chartData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => ({
      day,
      orders: Math.max(1, orders.length + index * 2),
      stock: Math.max(0, totalStock - index * 12),
    }));
  }, [orders.length, totalStock]);

  const filteredProducts = products.filter((product) => {
    const text = `${product.name} ${product.category} ${farmerForProduct(product)?.name || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const filteredOrders = orders.filter((order) => {
    const text = `${orderNumber(order)} ${customerName(order)} ${order.city} ${order.status}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const addProduct = async () => {
    if (!productForm.name || !productForm.category) return showMessage("Add product name and category first.");
    setSaving(true);
    try {
      await api.products.create({
        name: productForm.name,
        category: productForm.category,
        quantity: Number(productForm.quantity) || 0,
        price: Number(productForm.price) || 0,
        farmerId: productForm.farmer_id || null,
        description: productForm.description || null,
        status: Number(productForm.quantity) > 0 ? "active" : "out_of_stock",
        unit: "kg",
      });
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Product could not be added.");
    }
    setSaving(false);
    setProductForm({ name: "", category: "", quantity: "0", price: "0", farmer_id: "", description: "" });
    showMessage("Product added to inventory.");
    loadData();
  };

  const deleteProduct = async (id: string) => {
    setSaving(true);
    try {
      await api.products.delete(id);
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Product could not be deleted.");
    }
    setSaving(false);
    showMessage("Product deleted.");
    loadData();
  };

  const updateProductQuantity = async (product: Product, delta: number) => {
    const nextQuantity = Math.max(0, Number(product.quantity || 0) + delta);
    setSaving(true);
    try {
      await api.products.update(getId(product), {
        quantity: nextQuantity,
        status: nextQuantity > 0 ? "active" : "out_of_stock",
      });
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Quantity could not be updated.");
    }
    setSaving(false);
    showMessage(`${product.name} quantity updated.`);
    loadData();
  };

  const updateOrder = async (id: string, updates: Partial<AppOrder>) => {
    setSaving(true);
    try {
      await api.orders.update(id, updates);
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Order could not be updated.");
    }
    setSaving(false);
    showMessage("Order updated.");
    loadData();
  };

  const markDelivered = async (order: AppOrder) => {
    setSaving(true);
    let items: OrderItem[] = [];
    try {
      items = await api.orders.items(getId(order));
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Order items could not be loaded.");
    }

    for (const item of items) {
      const product = products.find((candidate) => getId(candidate) === itemProductId(item));
      if (!product) continue;
      const nextQuantity = Math.max(0, Number(product.quantity || 0) - Number(item.quantity || 0));
      try {
        await api.products.update(getId(product), {
          quantity: nextQuantity,
          status: nextQuantity > 0 ? "active" : "out_of_stock",
        });
      } catch (error) {
        setSaving(false);
        return showMessage(error instanceof Error ? error.message : "Stock could not be updated.");
      }
    }

    try {
      await api.orders.update(getId(order), { status: "delivered", paymentStatus: "paid" });
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Order could not be delivered.");
    }
    setSaving(false);
    showMessage("Order delivered and product stock reduced.");
    loadData();
  };

  const addPromotion = async () => {
    if (!promoForm.title) return showMessage("Add a discount title first.");
    setSaving(true);
    try {
      await api.promotions.create({
        title: promoForm.title,
        code: promoForm.code || null,
        discountType: promoForm.discount_type as "percentage" | "flat",
        discountValue: Number(promoForm.discount_value) || 0,
        isActive: true,
      });
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Discount could not be published.");
    }
    setSaving(false);
    setPromoForm({ title: "", code: "", discount_type: "percentage", discount_value: "10" });
    showMessage("Discount published.");
    loadData();
  };

  const togglePromotion = async (promotion: Promotion) => {
    setSaving(true);
    try {
      await api.promotions.update(getId(promotion), { isActive: !promoActive(promotion) });
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Discount could not be updated.");
    }
    setSaving(false);
    showMessage(promoActive(promotion) ? "Discount hidden from website." : "Discount published to website.");
    loadData();
  };

  const deletePromotion = async (id: string) => {
    setSaving(true);
    try {
      await api.promotions.delete(id);
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Discount could not be deleted.");
    }
    setSaving(false);
    showMessage("Discount deleted from website.");
    loadData();
  };

  const addContent = async () => {
    if (!contentForm.title) return showMessage("Add a title first.");
    setSaving(true);
    try {
      await api.content.create({
        type: contentForm.type,
        title: contentForm.title,
        subtitle: contentForm.subtitle || null,
        body: contentForm.body || null,
        imageUrl: imagePreview || null,
        placement: contentForm.placement,
        isActive: true,
      });
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Content could not be published.");
    }
    setSaving(false);
    setContentForm({ type: "banner", title: "", subtitle: "", body: "", placement: "home" });
    setImagePreview("");
    showMessage("Content published to the user app feed.");
    loadData();
  };

  const toggleContent = async (item: AppContent) => {
    setSaving(true);
    try {
      await api.content.update(getId(item), { isActive: !contentActive(item) });
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Content could not be updated.");
    }
    setSaving(false);
    showMessage(contentActive(item) ? "Content hidden from website." : "Content published to website.");
    loadData();
  };

  const deleteContent = async (id: string) => {
    setSaving(true);
    try {
      await api.content.delete(id);
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Content could not be deleted.");
    }
    setSaving(false);
    showMessage("Content deleted from website.");
    loadData();
  };

  const addFarmer = async () => {
    if (!farmerForm.name || !farmerForm.location || !farmerForm.phone) return showMessage("Please fill in all farmer details.");
    setSaving(true);
    try {
      await api.farmers.create({
        name: farmerForm.name,
        location: farmerForm.location,
        phone: farmerForm.phone,
      });
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Farmer could not be added.");
    }
    setSaving(false);
    setFarmerForm({ name: "", location: "", phone: "" });
    showMessage("Farmer added successfully.");
    loadData();
  };

  const adjustPrice = async () => {
    const product = products.find((item) => getId(item) === priceForm.product_id);
    const newPrice = Number(priceForm.new_price);
    if (!product || !newPrice) return showMessage("Choose a product and enter a new price.");

    setSaving(true);
    try {
      await api.products.update(getId(product), { price: newPrice });
      await api.priceAdjustments.create({
        productName: product.name,
        oldPrice: product.price,
        newPrice,
        reason: priceForm.reason || null,
      });
    } catch (error) {
      setSaving(false);
      return showMessage(error instanceof Error ? error.message : "Price could not be adjusted.");
    }
    setSaving(false);
    setPriceForm({ product_id: "", new_price: "", reason: "" });
    showMessage("Price adjusted and saved to history.");
    loadData();
  };

  const navItems = [
    { id: "home" as const, label: "Home", icon: LayoutDashboard },
    { id: "inventory" as const, label: "Inventory", icon: Boxes },
    { id: "orders" as const, label: "Orders", icon: ShoppingBag },
    { id: "management" as const, label: "Management", icon: Megaphone },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-3 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 shadow-sm overflow-hidden">
              <img src="/farmeze-icon.png" alt="Farmeze logo" className="h-6 w-6 object-cover" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold sm:text-lg">Farmeze Admin</p>
              <p className="hidden text-xs font-medium text-slate-500 sm:block">Products, orders, discounts, content</p>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate("/login");
            }}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-4 px-3 py-4 sm:px-6 lg:grid-cols-[220px_1fr] lg:gap-6 lg:py-6">
        <aside className="h-fit overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm lg:overflow-visible">
          <div className="flex min-w-max gap-1 lg:block lg:min-w-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`flex w-full items-center justify-center gap-2 rounded-md px-3 py-2.5 text-left text-sm font-bold transition lg:mb-1 lg:justify-start lg:gap-3 ${
                view === item.id ? "bg-primary text-primary-foreground" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
          </div>
        </aside>

        <section className="min-w-0">
          {setupError && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
              {setupError}
            </div>
          )}
          {message && (
            <div className="mb-4 rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm font-semibold text-primary">
              {message}
            </div>
          )}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">
                {view === "home" && "Home Dashboard"}
                {view === "inventory" && "Inventory Dashboard"}
                {view === "orders" && "Orders Page"}
                {view === "management" && "Management Page"}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {view === "home" && "Live quantities, product categories, recent orders, discounts, banners, and stories."}
                {view === "inventory" && "Add, delete, price, categorize, and assign farmer sources for every product."}
                {view === "orders" && "Approve, ship, deliver, and track payment state for each order."}
                {view === "management" && "Manage discounts, price adjustments, stories, articles, banners, farmers, products, and order data."}
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search admin data"
                className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
              Loading admin data...
            </div>
          ) : (
            <>
              {view === "home" && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                      { label: "Total Products", value: products.length, icon: Boxes, sub: `${totalStock} units available` },
                      { label: "Open Orders", value: openOrders, icon: ShoppingBag, sub: `${orders.length} total orders` },
                      { label: "Revenue", value: money(totalRevenue), icon: BadgeIndianRupee, sub: "From connected orders" },
                      { label: "Active Discounts", value: activePromos, icon: Megaphone, sub: `${content.filter((item) => contentActive(item)).length} live content items` },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-extrabold uppercase text-slate-500">{metric.label}</p>
                            <p className="mt-2 text-2xl font-extrabold">{metric.value}</p>
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <metric.icon className="h-5 w-5" />
                          </div>
                        </div>
                        <p className="mt-4 text-xs font-semibold text-slate-500">{metric.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid min-w-0 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <div>
                          <h2 className="font-extrabold">Orders and Stock Trend</h2>
                          <p className="text-sm text-slate-500">Dashboard signal for admin decisions.</p>
                        </div>
                        <BarChart3 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData} margin={{ left: -18, right: 12, top: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                            <Tooltip />
                            <Area type="monotone" dataKey="stock" stroke="#059669" fill="#d1fae5" strokeWidth={2} />
                            <Area type="monotone" dataKey="orders" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                      <div className="border-b border-slate-200 p-4">
                        <h2 className="font-extrabold">Recent Orders</h2>
                        <p className="text-sm text-slate-500">Latest customer activity.</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {orders.slice(0, 5).map((order) => (
                          <div key={getId(order)} className="flex items-center justify-between gap-3 p-4">
                            <div className="min-w-0">
                              <p className="truncate font-bold">{orderNumber(order)} - {customerName(order)}</p>
                              <p className="text-xs text-slate-500">{order.city || "No city"} / {paymentMedium(order).toUpperCase()}</p>
                            </div>
                            <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        ))}
                        {orders.length === 0 && <EmptyState label="No orders yet" />}
                      </div>
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-4 xl:grid-cols-3">
                    <SummaryPanel title="Products" items={products.map((p) => `${p.name} - ${p.category} - ${p.quantity} ${p.unit}`)} />
                    <SummaryPanel title="Discounts" items={promotions.map((p) => `${p.title} (${p.code || "no code"})`)} />
                    <SummaryPanel title="Banners and Stories" items={content.map((item) => `${item.type}: ${item.title}`)} />
                  </div>
                </div>
              )}

              {view === "inventory" && (
                <div className="grid min-w-0 gap-4 xl:grid-cols-[360px_1fr]">
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-4 font-extrabold">Add New Product</h2>
                    <FormInput label="Product Name" value={productForm.name} onChange={(value) => setProductForm({ ...productForm, name: value })} />
                    <FormInput label="Category" value={productForm.category} onChange={(value) => setProductForm({ ...productForm, category: value })} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <FormInput label="Quantity" type="number" value={productForm.quantity} onChange={(value) => setProductForm({ ...productForm, quantity: value })} />
                      <FormInput label="Price" type="number" value={productForm.price} onChange={(value) => setProductForm({ ...productForm, price: value })} />
                    </div>
                    <label className="mb-1 mt-3 block text-xs font-extrabold uppercase text-slate-500">Farmer Source</label>
                    <select
                      value={productForm.farmer_id}
                      onChange={(event) => setProductForm({ ...productForm, farmer_id: event.target.value })}
                      className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="">No farmer selected</option>
                      {farmers.map((farmer) => (
                        <option key={getId(farmer)} value={getId(farmer)}>{farmer.name} - {farmer.location}</option>
                      ))}
                    </select>
                    <FormTextarea label="Details" value={productForm.description} onChange={(value) => setProductForm({ ...productForm, description: value })} />
                    <button disabled={saving} onClick={addProduct} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                      <PackagePlus className="h-4 w-4" />
                      Add Product
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <DataHeader title="Products Inventory" subtitle={`${filteredProducts.length} matching products`} icon={Boxes} />
                    <div className="max-w-[calc(100vw-1.5rem)] overflow-x-auto sm:max-w-full">
                      <table className="w-full min-w-[760px] text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-extrabold uppercase text-slate-500">
                          <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Quantity</th><th className="p-3">Price</th><th className="p-3">Farmer</th><th className="p-3">Status</th><th className="p-3">Action</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredProducts.map((product) => (
                            <tr key={getId(product)} className="hover:bg-slate-50">
                              <td className="p-3"><p className="font-extrabold">{product.name}</p><p className="text-xs text-slate-500">{product.description || "No details"}</p></td>
                              <td className="p-3 font-semibold">{product.category}</td>
                              <td className="p-3 font-extrabold">{product.quantity} {product.unit}</td>
                              <td className="p-3 font-extrabold">{money(product.price)}</td>
                              <td className="p-3 text-slate-600">{farmerForProduct(product)?.name || "Not assigned"}</td>
                              <td className="p-3"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(product.status)}`}>{product.status.replaceAll("_", " ")}</span></td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-2">
                                  <button onClick={() => updateProductQuantity(product, -1)} className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                                    <Minus className="h-3.5 w-3.5" /> 1
                                  </button>
                                  <button onClick={() => updateProductQuantity(product, 1)} className="inline-flex h-8 items-center gap-1 rounded-md border border-primary/20 px-2 text-xs font-bold text-primary hover:bg-primary/10">
                                    <Plus className="h-3.5 w-3.5" /> 1
                                  </button>
                                  <button onClick={() => deleteProduct(getId(product))} className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2 text-xs font-bold text-red-700 hover:bg-red-50">
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {view === "orders" && (
                <div className="grid min-w-0 gap-4 xl:grid-cols-[320px_1fr]">
                  <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-1 font-extrabold">Customer Order Queue</h2>
                    <p className="mb-4 text-sm text-slate-500">
                      Orders created from the user app appear here automatically. Admin only changes fulfillment and payment state.
                    </p>
                    <div className="space-y-3">
                      {[
                        ["New", orders.filter((order) => order.status === "new").length, "bg-blue-50 text-blue-700"],
                        ["Approved", orders.filter((order) => order.status === "approved").length, "bg-violet-50 text-violet-700"],
                        ["Shipped", orders.filter((order) => order.status === "shipped").length, "bg-amber-50 text-amber-700"],
                        ["Delivered", orders.filter((order) => order.status === "delivered").length, "bg-primary/10 text-primary"],
                        ["Unpaid", orders.filter((order) => paymentStatus(order) === "unpaid").length, "bg-orange-50 text-orange-700"],
                      ].map(([label, count, className]) => (
                        <div key={label as string} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                          <span className="text-sm font-bold text-slate-700">{label}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-extrabold ${className}`}>{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                    <DataHeader title="Customer Order Details" subtitle="Approve, ship, deliver, and update payment for customer-created orders" icon={ClipboardList} />
                    <div className="max-w-[calc(100vw-1.5rem)] overflow-x-auto sm:max-w-full">
                      <table className="w-full min-w-[900px] text-sm">
                        <thead className="bg-slate-50 text-left text-xs font-extrabold uppercase text-slate-500">
                          <tr><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Order Status</th><th className="p-3">Payment</th><th className="p-3">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOrders.map((order) => (
                            <tr key={getId(order)} className="hover:bg-slate-50">
                              <td className="p-3"><p className="font-extrabold">{orderNumber(order)}</p><p className="text-xs text-slate-500">{new Date(createdAt(order)).toLocaleString()}</p></td>
                              <td className="p-3"><p className="font-bold">{customerName(order)}</p><p className="text-xs text-slate-500">{order.city || "No city"} / {customerPhone(order) || "No phone"}</p></td>
                              <td className="p-3 font-extrabold">{money(totalAmount(order))}</td>
                              <td className="p-3"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(order.status)}`}>{order.status}</span></td>
                              <td className="p-3"><span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${statusClass(paymentStatus(order))}`}>{paymentStatus(order)} / {paymentMedium(order)}</span></td>
                              <td className="p-3">
                                <div className="flex flex-wrap gap-2">
                                  <OrderAction label="Approved" icon={Check} onClick={() => updateOrder(getId(order), { status: "approved" })} />
                                  <OrderAction label="Shipped" icon={Truck} onClick={() => updateOrder(getId(order), { status: "shipped" })} />
                                  <OrderAction label="Delivered" icon={Check} onClick={() => markDelivered(order)} />
                                  <OrderAction label="Paid" icon={CreditCard} onClick={() => updateOrder(getId(order), { paymentStatus: "paid" })} />
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredOrders.length === 0 && (
                            <tr>
                              <td colSpan={6}>
                                <EmptyState label="No customer orders found" />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {view === "management" && (
                <div className="space-y-4">
                  <div className="grid min-w-0 gap-4 xl:grid-cols-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <h2 className="mb-4 flex items-center gap-2 font-extrabold"><Users className="h-5 w-5 text-primary" /> Add New Farmer</h2>
                      <FormInput label="Farmer Name" value={farmerForm.name} onChange={(value) => setFarmerForm({ ...farmerForm, name: value })} />
                      <FormInput label="Location" value={farmerForm.location} onChange={(value) => setFarmerForm({ ...farmerForm, location: value })} />
                      <FormInput label="Phone Number" value={farmerForm.phone} onChange={(value) => setFarmerForm({ ...farmerForm, phone: value })} />
                      <button onClick={addFarmer} disabled={saving} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                        <Plus className="h-4 w-4" /> Add Farmer
                      </button>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <h2 className="mb-4 flex items-center gap-2 font-extrabold"><Megaphone className="h-5 w-5 text-primary" /> Discounts</h2>
                      <FormInput label="Discount Title" value={promoForm.title} onChange={(value) => setPromoForm({ ...promoForm, title: value })} />
                      <div className="grid gap-3 sm:grid-cols-3">
                        <FormInput label="Code" value={promoForm.code} onChange={(value) => setPromoForm({ ...promoForm, code: value })} />
                        <div>
                          <label className="mb-1 mt-3 block text-xs font-extrabold uppercase text-slate-500">Type</label>
                          <select value={promoForm.discount_type} onChange={(event) => setPromoForm({ ...promoForm, discount_type: event.target.value })} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
                            <option value="percentage">Percent</option><option value="flat">Flat</option>
                          </select>
                        </div>
                        <FormInput label="Value" type="number" value={promoForm.discount_value} onChange={(value) => setPromoForm({ ...promoForm, discount_value: value })} />
                      </div>
                      <button onClick={addPromotion} disabled={saving} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                        <Plus className="h-4 w-4" /> Publish Discount
                      </button>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <h2 className="mb-4 flex items-center gap-2 font-extrabold"><PencilLine className="h-5 w-5 text-primary" /> Price Adjustments</h2>
                      <label className="mb-1 block text-xs font-extrabold uppercase text-slate-500">Product</label>
                      <select value={priceForm.product_id} onChange={(event) => setPriceForm({ ...priceForm, product_id: event.target.value })} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
                        <option value="">Select product</option>
                        {products.map((product) => <option key={getId(product)} value={getId(product)}>{product.name} - current {money(product.price)}</option>)}
                      </select>
                      <FormInput label="New Price" type="number" value={priceForm.new_price} onChange={(value) => setPriceForm({ ...priceForm, new_price: value })} />
                      <FormTextarea label="Reason" value={priceForm.reason} onChange={(value) => setPriceForm({ ...priceForm, reason: value })} />
                      <button onClick={adjustPrice} disabled={saving} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                        <PencilLine className="h-4 w-4" /> Update Price
                      </button>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <h2 className="mb-4 flex items-center gap-2 font-extrabold"><Image className="h-5 w-5 text-primary" /> Banners, Stories, Articles</h2>
                      <label className="mb-1 block text-xs font-extrabold uppercase text-slate-500">Content Type</label>
                      <select value={contentForm.type} onChange={(event) => setContentForm({ ...contentForm, type: event.target.value as ContentType })} className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm">
                        <option value="banner">Banner</option><option value="story">Story</option><option value="article">Article</option>
                      </select>
                      <FormInput label="Title" value={contentForm.title} onChange={(value) => setContentForm({ ...contentForm, title: value })} />
                      <FormInput label="Subtitle" value={contentForm.subtitle} onChange={(value) => setContentForm({ ...contentForm, subtitle: value })} />
                      <div>
                        <label className="mb-1 mt-3 block text-xs font-extrabold uppercase text-slate-500">Upload Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (event) => {
                            const file = event.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = () => {
                              if (typeof reader.result === "string") setImagePreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }}
                          className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none"
                        />
                        {imagePreview ? (
                          <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                            <p className="text-xs font-semibold text-slate-500">Preview</p>
                            <img src={imagePreview} alt="Preview" className="mt-2 max-h-44 w-full object-contain" />
                          </div>
                        ) : null}
                      </div>
                      <FormTextarea label="Body" value={contentForm.body} onChange={(value) => setContentForm({ ...contentForm, body: value })} />
                      <button onClick={addContent} disabled={saving} className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
                        <BookOpenText className="h-4 w-4" /> Publish Content
                      </button>
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                      <DataHeader title="Manage Discounts" subtitle="Publish, hide, or delete offers from the website" icon={Megaphone} />
                      <div className="divide-y divide-slate-100">
                        {promotions.map((promotion) => (
                          <div key={getId(promotion)} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="truncate font-extrabold text-slate-950">{promotion.title}</p>
                              <p className="text-xs font-semibold text-slate-500">
                                {promotion.code || "No code"} / {promoValue(promotion)}{promoType(promotion) === "percentage" ? "%" : " INR"}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => togglePromotion(promotion)} className="inline-flex h-8 items-center rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                                {promoActive(promotion) ? "Hide" : "Publish"}
                              </button>
                              <button onClick={() => deletePromotion(getId(promotion))} className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2 text-xs font-bold text-red-700 hover:bg-red-50">
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                        {promotions.length === 0 && <EmptyState label="No discounts yet" />}
                      </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                      <DataHeader title="Manage Website Content" subtitle="Control banners, stories, and articles across the website" icon={Image} />
                      <div className="divide-y divide-slate-100">
                        {content.map((item) => (
                          <div key={getId(item)} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold uppercase text-primary">{item.type}</p>
                              <p className="truncate font-extrabold text-slate-950">{item.title}</p>
                              <p className="truncate text-xs font-semibold text-slate-500">{item.subtitle || "No subtitle"}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => toggleContent(item)} className="inline-flex h-8 items-center rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
                                {contentActive(item) ? "Hide" : "Publish"}
                              </button>
                              <button onClick={() => deleteContent(getId(item))} className="inline-flex h-8 items-center gap-1 rounded-md border border-red-200 px-2 text-xs font-bold text-red-700 hover:bg-red-50">
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                        {content.length === 0 && <EmptyState label="No banners, stories, or articles yet" />}
                      </div>
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-4 xl:grid-cols-3">
                    <SummaryPanel title="All Farmers" items={farmers.map((farmer) => `${farmer.name} - ${farmer.location} - ${farmer.phone}`)} />
                    <SummaryPanel title="All Products" items={products.map((product) => `${product.name} - ${product.quantity} ${product.unit} - ${money(product.price)}`)} />
                    <SummaryPanel title="All Orders" items={orders.map((order) => `${orderNumber(order)} - ${customerName(order)} - ${order.status}`)} />
                  </div>

                  <div className="grid min-w-0 gap-4 xl:grid-cols-2">
                    <SummaryPanel title="Live Discounts" items={promotions.map((promo) => `${promo.title} - ${promo.code || "no code"} - ${promoValue(promo)}${promoType(promo) === "percentage" ? "%" : " INR"}`)} />
                    <SummaryPanel title="Price Adjustment History" items={priceAdjustments.map((item) => `${adjustmentProductName(item)}: ${money(oldPrice(item))} to ${money(newPrice(item))} - ${item.reason || "No reason"}`)} />
                    <SummaryPanel title="Recent Farmer Stock" items={entries.slice(0, 8).map((entry) => `${entry.product} grade ${entry.grade} - ${entry.quantity} kg - ${entryFarmer(entry)?.name || "unknown farmer"}`)} />
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

const FormInput = ({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) => (
  <div>
    <label className="mb-1 mt-3 block text-xs font-extrabold uppercase text-slate-500">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  </div>
);

const FormTextarea = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <div>
    <label className="mb-1 mt-3 block text-xs font-extrabold uppercase text-slate-500">{label}</label>
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={3}
      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    />
  </div>
);

const DataHeader = ({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: typeof Boxes }) => (
  <div className="flex items-center justify-between border-b border-slate-200 p-4">
    <div>
      <h2 className="font-extrabold">{title}</h2>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
    <Icon className="h-5 w-5 text-primary" />
  </div>
);

const OrderAction = ({ label, icon: Icon, onClick }: { label: string; icon: typeof Check; onClick: () => void }) => (
  <button onClick={onClick} className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
    <Icon className="h-3.5 w-3.5" />
    {label}
  </button>
);

const SummaryPanel = ({ title, items }: { title: string; items: string[] }) => (
  <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 p-4">
      <h2 className="font-extrabold">{title}</h2>
      <p className="text-sm text-slate-500">{items.length} records</p>
    </div>
    <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
      {items.length ? items.map((item) => <p key={item} className="p-3 text-sm font-semibold text-slate-700">{item}</p>) : <EmptyState label="No records yet" />}
    </div>
  </div>
);

const EmptyState = ({ label }: { label: string }) => (
  <div className="p-8 text-center text-sm font-bold text-slate-400">
    <AlertTriangle className="mx-auto mb-2 h-6 w-6" />
    {label}
  </div>
);

export default AdminDashboard;
