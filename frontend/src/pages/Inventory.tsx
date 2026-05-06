import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  BarChart3,
  Boxes,
  Clock,
  MapPin,
  Package,
  TrendingDown,
  TrendingUp,
  User,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { api, getId, type InventoryEntry, type Product } from "@/lib/api";
import { motion } from "framer-motion";

interface ProductSummary {
  id: string;
  name: string;
  category: string;
  totalStock: number;
  basePrice: number;
  unit: string;
  farmerName: string;
}

const getStatus = (stock: number) => {
  if (stock > 200) return { label: "In Stock", cls: "status-in-stock" };
  if (stock > 50) return { label: "Low Stock", cls: "status-low-stock" };
  return { label: "Out of Stock", cls: "status-out-of-stock" };
};

const Inventory = () => {
  const [entries, setEntries] = useState<InventoryEntry[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);

  useEffect(() => {
    const farmerName = (product: Product) => product.farmer?.name || product.farmers?.name || "Not assigned";
    const loadInventory = () => Promise.all([
      api.products.list(),
      api.inventoryEntries.list(),
    ]).then(([productResult, entryResult]) => {
      if (productResult) {
        setProducts(productResult.map((product) => ({
          id: getId(product),
          name: product.name,
          category: product.category,
          totalStock: product.quantity || 0,
          basePrice: product.price || 0,
          unit: product.unit || "kg",
          farmerName: farmerName(product),
        })));
      }
      if (entryResult) setEntries(entryResult);
    }).catch(() => {
      setProducts([]);
      setEntries([]);
    });

    loadInventory();
    // Disable frequent polling to prevent excessive refreshing
    // const interval = window.setInterval(loadInventory, 8000);
    // return () => window.clearInterval(interval);
  }, []);

  const totalStock = products.reduce((sum, product) => sum + product.totalStock, 0);
  const totalValue = products.reduce((sum, product) => sum + product.totalStock * product.basePrice, 0);
  const lowStockCount = products.filter((product) => product.totalStock <= 200 && product.totalStock > 0).length;

  const summaryCards = [
    { icon: Boxes, label: "Total Products", value: products.length, sub: "Active SKUs", accent: "text-primary" },
    { icon: Package, label: "Total Stock", value: `${totalStock} units`, sub: "From products table", accent: "text-primary" },
    { icon: BarChart3, label: "Inventory Value", value: `₹${totalValue.toLocaleString("en-IN")}`, sub: "Current listed value", accent: "text-grade-a" },
    { icon: AlertTriangle, label: "Low Stock Alerts", value: lowStockCount, sub: lowStockCount > 0 ? "Needs restocking" : "All good", accent: lowStockCount > 0 ? "text-grade-b" : "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-10">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link to="/" className="inline-flex w-fit items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-extrabold text-foreground md:text-3xl">Product Inventory Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Real-time stock levels from the same product data used by admin and the user app.</p>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {summaryCards.map((card, index) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                  <card.icon className={`h-4 w-4 ${card.accent}`} />
                </div>
                <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
              </div>
              <p className="text-2xl font-extrabold text-foreground">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-10">
          <h2 className="mb-4 text-lg font-bold text-foreground">Current Inventory</h2>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Product", "Category", "Total Stock", "Base Price", "Farmer", "Status"].map((heading) => (
                      <th key={heading} className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const status = getStatus(product.totalStock);
                    return (
                      <tr key={product.id} className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Package className="h-5 w-5 text-primary" />
                            <span className="font-bold text-foreground">{product.name}</span>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-muted-foreground">{product.category}</td>
                        <td className="p-4 text-lg font-bold text-foreground">{product.totalStock} {product.unit}</td>
                        <td className="p-4 font-medium text-foreground">₹{product.basePrice}/{product.unit}</td>
                        <td className="p-4 text-xs text-muted-foreground">{product.farmerName}</td>
                        <td className="p-4"><span className={`grade-badge text-xs ${status.cls}`}>{status.label}</span></td>
                      </tr>
                    );
                  })}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No products found. Add products from the admin dashboard.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">Farmer Stock Entries</h2>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">{entries.length} records</span>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {["Type", "Product", "Grade", "Quantity", "Farmer", "Location", "Date"].map((heading) => (
                      <th key={heading} className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {entries.length === 0 ? (
                    <tr><td colSpan={7} className="p-8 text-center">
                      <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
                      <p className="font-semibold text-foreground">No stock entries yet</p>
                      <p className="text-sm text-muted-foreground">Farmers need to submit stock via their dashboard.</p>
                    </td></tr>
                  ) : entries.map((entry) => (
                    <tr key={getId(entry)} className="border-b border-border/50 transition-colors last:border-0 hover:bg-muted/20">
                      <td className="p-4">
                        {entry.type === "addition" ? (
                          <span className="grade-badge grade-a inline-flex items-center gap-1 text-xs"><TrendingUp className="h-3 w-3" /> In</span>
                        ) : (
                          <span className="grade-badge grade-reject inline-flex items-center gap-1 text-xs"><TrendingDown className="h-3 w-3" /> Out</span>
                        )}
                      </td>
                      <td className="p-4 font-medium text-foreground">{entry.product}</td>
                      <td className="p-4"><span className={`grade-badge text-xs grade-${entry.grade.toLowerCase()}`}>Grade {entry.grade}</span></td>
                      <td className="p-4 font-bold text-foreground">{entry.quantity} kg</td>
                      <td className="p-4"><div className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-medium text-foreground">{entry.farmer?.name || entry.farmers?.name || "-"}</span></div></td>
                      <td className="p-4"><div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="h-3.5 w-3.5" /><span className="text-xs">{entry.farmer?.location || entry.farmers?.location || "-"}</span></div></td>
                      <td className="p-4 text-xs text-muted-foreground">{new Date(entry.createdAt || entry.created_at || Date.now()).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Inventory;
