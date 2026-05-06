import { Link, useLocation } from "react-router-dom";
import { Menu, X, LogIn } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/#quality-check", label: "Quality Check", isHash: true },
    { to: "/inventory", label: "Inventory" },
    { to: "/orders", label: "Orders" },
    { to: "/login", label: "Dashboard Login", isLogin: true },
  ];

  const handleHashClick = (hash: string) => {
    setMobileOpen(false);
    if (location.pathname === "/") {
      document.querySelector(hash.replace("/#", "#"))?.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = hash;
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
            <img src="/farmeze-icon.png" alt="Farmeze logo" className="w-6 h-6 object-cover" />
          </div>
          <span className="text-xl font-bold text-foreground">Farmeze</span>
          <span className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
            MVP Demo
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) =>
            l.isHash ? (
              <button
                key={l.label}
                onClick={() => handleHashClick(l.to)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {l.label}
              </button>
            ) : l.isLogin ? (
              <Link
                key={l.to}
                to={l.to}
                className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                {l.label}
              </Link>
            ) : (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === l.to
                    ? "text-primary bg-secondary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            )
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-muted">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-1">
          {links.map((l) =>
            l.isHash ? (
              <button
                key={l.label}
                onClick={() => handleHashClick(l.to)}
                className="block w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                {l.label}
              </button>
            ) : (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2 rounded-lg text-sm font-medium ${
                  l.isLogin
                    ? "bg-primary text-primary-foreground text-center mt-2"
                    : location.pathname === l.to ? "text-primary bg-secondary" : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {l.label}
              </Link>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
