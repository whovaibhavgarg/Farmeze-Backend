import { Link } from "react-router-dom";
import { ArrowRight, ClipboardCheck, LayoutDashboard, LogIn, Shield } from "lucide-react";
import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="inline-block mb-4 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            Farm-to-Customer Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground leading-tight mb-4">
            Smart Farm-to-Customer
            <br />
            <span className="text-primary">Quality Grading</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Transparent quality checks for potatoes and onions with grade-based pricing.
            Full traceability from farmer to your kitchen with QR codes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="#quality-check"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              <ClipboardCheck className="w-5 h-5" />
              Start Quality Check
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card border border-border font-semibold text-foreground hover:bg-muted transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              Inventory Dashboard
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/80 transition-all"
            >
              <Shield className="w-4 h-4" />
              Farmer / Admin Login
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
