import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { MapPin, Phone, User, ShieldCheck, ArrowLeft } from "lucide-react";

interface FarmerProfile {
  id: string;
  name: string;
  location: string;
  phone: string;
  created_at: string;
}

const FarmerCard = () => {
  const { id } = useParams<{ id: string }>();
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("farmers")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setFarmer(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading farmer card...</div>
      </div>
    );
  }

  if (!farmer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Farmer Not Found</h1>
          <p className="text-muted-foreground mb-4">This farmer profile doesn't exist or the link is invalid.</p>
          <Link to="/" className="text-primary hover:underline text-sm font-medium">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const memberSince = new Date(farmer.created_at).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Card */}
        <div className="relative overflow-hidden rounded-3xl bg-card border border-border shadow-2xl shadow-primary/10">
          {/* Header gradient */}
          <div className="h-28 bg-gradient-to-br from-primary via-primary/80 to-primary/60 relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxLjUiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvc3ZnPg==')] opacity-50" />
            <div className="absolute top-4 left-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                  <img src="/farmeze-icon.png" alt="Farmeze logo" className="w-5 h-5 object-cover" />
                </div>
                <span className="text-white/90 text-sm font-bold">Farmeze</span>
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-white/90 bg-white/20 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center -mt-12 relative z-10">
            <div className="w-24 h-24 rounded-2xl bg-secondary border-4 border-card flex items-center justify-center shadow-lg">
              <User className="w-10 h-10 text-primary" />
            </div>
          </div>

          {/* Info */}
          <div className="px-6 pt-4 pb-6 text-center">
            <h1 className="text-2xl font-extrabold text-foreground">{farmer.name}</h1>
            <div className="flex items-center justify-center gap-1.5 mt-1.5 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-sm">{farmer.location}</span>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3">
                <Phone className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Phone</p>
                  <p className="text-sm font-semibold text-foreground">{farmer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3">
                <MapPin className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Location</p>
                  <p className="text-sm font-semibold text-foreground">{farmer.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-muted/40 rounded-xl px-4 py-3">
                <Leaf className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Member Since</p>
                  <p className="text-sm font-semibold text-foreground">{memberSince}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Farmeze Verified Farmer</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
            <ArrowLeft className="w-3.5 h-3.5" /> Visit Farmeze
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default FarmerCard;
