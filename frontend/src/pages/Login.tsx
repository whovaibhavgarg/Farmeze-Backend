import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { LogIn, User, Lock, Mail, MapPin, Phone, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [tab, setTab] = useState<"login" | "signup" | "admin">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [adminPw, setAdminPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login, loginAsAdmin, signup } = useAuth();
  const navigate = useNavigate();

  const handleFarmerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    setSubmitting(true);
    const err = await login(email, password);
    setSubmitting(false);
    if (err) { setError(err); } else { navigate("/farmer"); }
  };

  const handleFarmerSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim() || !name.trim() || !location.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setSubmitting(true);
    const err = await signup(email, password, name, location, phone);
    setSubmitting(false);
    if (err) { setError(err); } else {
      setSuccess("Account created! You are now logged in.");
      setTimeout(() => navigate("/farmer"), 1500);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!adminPw.trim()) { setError("Enter admin password."); return; }
    const err = loginAsAdmin(adminPw);
    if (err) { setError(err); } else { navigate("/admin"); }
  };

  const inputCls = "w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

  const tabs = [
    { key: "login" as const, label: "Farmer Login", icon: LogIn },
    { key: "signup" as const, label: "Farmer Signup", icon: UserPlus },
    { key: "admin" as const, label: "Admin", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-lg shadow-slate-200/20 mb-4 overflow-hidden">
            <img src="/farmeze-icon.png" alt="Farmeze logo" className="w-12 h-12 object-cover" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Farmeze</h1>
          <p className="text-muted-foreground text-sm mt-1">Smart Quality Grading & Inventory Management</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-muted/50 rounded-xl p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setError(""); setSuccess(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                tab === t.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          {tab === "login" && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Farmer Login</h2>
              <p className="text-sm text-muted-foreground mb-6">Sign in with your registered email</p>
              <form onSubmit={handleFarmerLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all text-sm disabled:opacity-50">
                  <LogIn className="w-4 h-4" /> {submitting ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </>
          )}

          {tab === "signup" && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Create Farmer Account</h2>
              <p className="text-sm text-muted-foreground mb-6">Register to start selling your produce</p>
              <form onSubmit={handleFarmerSignup} className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="e.g. Rajesh Kumar" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" placeholder="e.g. Agra, UP" value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="tel" placeholder="e.g. 9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" placeholder="farmer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
                {success && <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg font-medium">✅ {success}</p>}
                <button type="submit" disabled={submitting} className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all text-sm disabled:opacity-50">
                  <UserPlus className="w-4 h-4" /> {submitting ? "Creating account..." : "Create Account"}
                </button>
              </form>
            </>
          )}

          {tab === "admin" && (
            <>
              <h2 className="text-xl font-bold text-foreground mb-1">Admin Login</h2>
              <p className="text-sm text-muted-foreground mb-6">Enter admin password to access the dashboard</p>
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">Admin Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="password" placeholder="Enter admin password" value={adminPw} onChange={(e) => setAdminPw(e.target.value)} className={inputCls} />
                  </div>
                </div>
                {error && <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">{error}</p>}
                <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all text-sm">
                  <LogIn className="w-4 h-4" /> Access Admin Panel
                </button>
              </form>
              <p className="text-xs text-muted-foreground mt-4 text-center">Demo password: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">admin123</code></p>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          <a href="/" className="text-primary hover:underline">← Back to Home</a>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
