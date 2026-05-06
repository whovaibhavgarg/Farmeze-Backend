import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { api, getId, type InventoryEntry } from "@/lib/api";
import { motion } from "framer-motion";
import {
  LogOut, Plus, Package, MapPin, User, TrendingUp, Clock, Send,
} from "lucide-react";

const FarmerDashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<"Potatoes" | "Onions">("Potatoes");
  const [grade, setGrade] = useState<"A" | "B" | "C">("A");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "farmer")) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user?.farmerId) return;
    api.inventoryEntries
      .list()
      .then((data) => setEntries(data.filter((entry: any) => entry.farmerId === user.farmerId || entry.farmer_id === user.farmerId)))
      .catch(() => setEntries([]));
  }, [user?.farmerId]);

  if (authLoading || !user || user.role !== "farmer") return null;

  const additions = entries.filter((e) => e.type === "addition");
  const totalSupplied = additions.reduce((s, e) => s + e.quantity, 0);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) { setError("Please enter a valid quantity."); return; }

    setSubmitting(true);
    try {
      await api.inventoryEntries.create({
        farmerId: user.farmerId!,
        product,
        grade,
        quantity: qty,
        type: "addition",
      } as any);

      const products = await api.products.list();
      const existingProduct = products.find((item) => item.name.toLowerCase() === product.toLowerCase());
      if (existingProduct) {
        await api.products.update(getId(existingProduct), {
          quantity: Number(existingProduct.quantity || 0) + qty,
          status: "active",
        });
      } else {
        await api.products.create({
          name: product,
          category: "Vegetables",
          quantity: qty,
          price: 0,
          farmerId: user.farmerId!,
          status: "active",
          unit: "kg",
        });
      }
    } catch (apiError) {
      setSubmitting(false);
      setError(apiError instanceof Error ? apiError.message : "Stock submission failed.");
      return;
    }
    setSubmitting(false);

    setSuccess(`Successfully submitted ${qty} kg of Grade ${grade} ${product}!`);
    setQuantity("");
    setTimeout(() => setSuccess(""), 4000);

    // Refresh entries
    const data = await api.inventoryEntries.list();
    setEntries(data.filter((entry: any) => entry.farmerId === user.farmerId || entry.farmer_id === user.farmerId));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const selectCls = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium border transition-all cursor-pointer ${
      active
        ? "bg-primary text-primary-foreground border-primary shadow-sm"
        : "bg-card text-foreground border-border hover:bg-muted"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
              <img src="/farmeze-icon.png" alt="Farmeze logo" className="w-6 h-6 object-cover" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground">Farmeze</span>
              <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">Farmer</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-foreground">{user.displayName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <MapPin className="w-3 h-3" /> {user.location}
              </p>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">
            Welcome, {user.displayName} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Submit your produce and track your supply history.</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Package, label: "Total Supplied", value: `${totalSupplied} kg`, color: "text-primary" },
            { icon: TrendingUp, label: "Submissions", value: additions.length, color: "text-grade-a" },
            { icon: MapPin, label: "Location", value: user.location || "-", color: "text-grade-b" },
            { icon: User, label: "Phone", value: user.phone || "-", color: "text-primary" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-muted-foreground font-medium">{s.label}</span>
              </div>
              <p className="text-lg font-extrabold text-foreground">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Submit Stock Form */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Submit New Stock</h2>
              <p className="text-xs text-muted-foreground">Add produce to Farmeze inventory</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Product</label>
              <div className="flex gap-2">
                <button onClick={() => setProduct("Potatoes")} className={selectCls(product === "Potatoes")}>🥔 Potatoes</button>
                <button onClick={() => setProduct("Onions")} className={selectCls(product === "Onions")}>🧅 Onions</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Grade</label>
              <div className="flex gap-2">
                {(["A", "B", "C"] as const).map((g) => (
                  <button key={g} onClick={() => setGrade(g)} className={selectCls(grade === g)}>Grade {g}</button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-foreground mb-2">Quantity (kg)</label>
              <input
                type="number"
                min="1"
                placeholder="Enter quantity in kg"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg mt-4">{error}</p>}
          {success && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-grade-a bg-grade-a/10 px-3 py-2 rounded-lg mt-4 font-medium">
              ✅ {success}
            </motion.p>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all text-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? "Submitting..." : "Submit Stock"}
          </button>
        </motion.div>

        {/* Supply History */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">My Supply History</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-0.5 rounded-full font-medium ml-auto">
              {additions.length} entries
            </span>
          </div>

          {additions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No submissions yet</p>
              <p className="text-sm text-muted-foreground">Submit your first batch above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left p-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Product</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Grade</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Quantity</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                    <th className="text-left p-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {additions.map((e) => (
                    <tr key={getId(e)} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3 font-medium text-foreground">
                        {e.product === "Potatoes" ? "🥔" : "🧅"} {e.product}
                      </td>
                      <td className="p-3">
                        <span className={`grade-badge text-xs grade-${e.grade.toLowerCase()}`}>Grade {e.grade}</span>
                      </td>
                      <td className="p-3 font-bold text-foreground">{e.quantity} kg</td>
                      <td className="p-3 text-muted-foreground text-xs">{new Date(e.createdAt || e.created_at || Date.now()).toLocaleString()}</td>
                      <td className="p-3">
                        <span className="grade-badge text-xs grade-a">Accepted</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
