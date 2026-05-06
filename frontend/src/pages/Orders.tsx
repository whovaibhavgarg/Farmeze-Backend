import { useEffect, useState } from "react";
import { BadgeIndianRupee, Package, ShoppingBag, User, MapPin, CreditCard } from "lucide-react";
import { api, getId, type AppOrder, type Product } from "@/lib/api";

const paymentMethods = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "wallet", label: "Wallet" },
] as const;

const badgeClass = (status: string) => {
  const map: Record<string, string> = {
    new: "bg-blue-50 text-blue-700 border-blue-100",
    approved: "bg-violet-50 text-violet-700 border-violet-100",
    shipped: "bg-amber-50 text-amber-700 border-amber-100",
    delivered: "bg-primary/10 text-primary border-primary/20",
    cancelled: "bg-red-50 text-red-700 border-red-100",
    unpaid: "bg-orange-50 text-orange-700 border-orange-100",
    paid: "bg-primary/10 text-primary border-primary/20",
  };
  return map[status] || "bg-slate-100 text-slate-700 border-slate-200";
};

const Orders = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AppOrder[]>([]);
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [paymentMedium, setPaymentMedium] = useState<"cod" | "upi" | "card" | "wallet">("cod");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const selectedProduct = products.find((product) => getId(product) === productId);
  const subtotal = selectedProduct ? Number(selectedProduct.price) * Number(quantity || 0) : 0;
  const totalAmount = subtotal;

  const loadData = async () => {
    setLoading(true);
    try {
      const [productResult, orderResult] = await Promise.all([api.products.list(), api.orders.list()]);
      setProducts(productResult || []);
      setOrders(orderResult || []);
    } catch {
      setProducts([]);
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = window.setInterval(loadData, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const updateOrderStatus = async (orderId: string, status: AppOrder['status']) => {
    setSubmitting(true);
    setMessage("");

    try {
      await api.orders.update(orderId, { status });
      await loadData();
      setMessage(`Order status updated to ${status}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update order status.");
    }

    setSubmitting(false);
  };

  const placeOrder = async () => {
    if (!customerName || !customerPhone || !deliveryAddress || !city || !productId || !quantity) {
      setMessage("Please fill in all order fields before placing the order.");
      return;
    }

    const quantityValue = Number(quantity);
    if (!quantityValue || quantityValue <= 0) {
      setMessage("Please enter a valid quantity.");
      return;
    }

    if (!selectedProduct) {
      setMessage("Please select a valid product.");
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      await api.orders.create({
        orderNumber: `ORD-${Date.now()}`,
        customerName,
        customerPhone,
        deliveryAddress,
        city,
        status: "new",
        paymentStatus: "unpaid",
        paymentMedium,
        subtotal,
        totalAmount,
        notes: notes || null,
        items: [
          {
            productId,
            productName: selectedProduct.name,
            quantity: quantityValue,
            price: selectedProduct.price,
          },
        ],
        createdAt: new Date().toISOString(),
      });
      setCustomerName("");
      setCustomerPhone("");
      setDeliveryAddress("");
      setCity("");
      setNotes("");
      setQuantity("1");
      setProductId("");
      setMessage("Order created successfully. It will appear on the admin website shortly.");
      await loadData();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not place order.");
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">Place an Order</h1>
          <p className="mt-2 text-muted-foreground">Create a sample customer order from the app and watch it appear in admin instantly.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Customer Name</label>
                <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Phone Number</label>
                <input value={customerPhone} onChange={(event) => setCustomerPhone(event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-foreground">Delivery Address</label>
                <input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">City</label>
                <input value={city} onChange={(event) => setCity(event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Product</label>
                <select value={productId} onChange={(event) => setProductId(event.target.value)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={getId(product)} value={getId(product)}>{product.name} — ₹{product.price} / {product.unit}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Quantity (kg)</label>
                <input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="1" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-foreground">Payment Method</label>
                <select value={paymentMedium} onChange={(event) => setPaymentMedium(event.target.value as any)} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
                  {paymentMethods.map((method) => (
                    <option key={method.value} value={method.value}>{method.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-foreground">Notes</label>
                <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>

            {message ? <p className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">{message}</p> : null}

            <button onClick={placeOrder} disabled={submitting} className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60">
              <ShoppingBag className="h-4 w-4" /> {submitting ? "Placing order..." : "Place Order"}
            </button>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Available Products</p>
                  <p className="text-xs text-muted-foreground">Orders are created from these product entries.</p>
                </div>
              </div>
              <div className="grid gap-3">
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No products available yet.</p>
                ) : (
                  products.map((product) => (
                    <div key={getId(product)} className="rounded-2xl border border-border p-4">
                      <p className="font-bold text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category} · ₹{product.price} / {product.unit}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Recent Orders</p>
                  <p className="text-xs text-muted-foreground">Open orders update automatically.</p>
                </div>
              </div>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading orders…</p>
              ) : orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">No orders placed yet.</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 6).map((order) => (
                    <div key={getId(order)} className="rounded-2xl border border-border p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-foreground">{order.orderNumber || order.order_number}</p>
                          <p className="text-xs text-muted-foreground">{order.customerName || order.customer_name} · {order.city}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(order.status)}`}>{order.status}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span>{order.paymentStatus || order.payment_status}</span>
                        <span>{order.paymentMedium || order.payment_medium}</span>
                        <span>₹{order.totalAmount ?? order.total_amount ?? 0}</span>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {order.status === "approved" ? (
                          <button
                            disabled={submitting}
                            onClick={() => updateOrderStatus(getId(order), "shipped")}
                            className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                          >
                            Mark shipped
                          </button>
                        ) : null}

                        {order.status === "shipped" ? (
                          <button
                            disabled={submitting}
                            onClick={() => updateOrderStatus(getId(order), "delivered")}
                            className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-60"
                          >
                            Mark delivered
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
