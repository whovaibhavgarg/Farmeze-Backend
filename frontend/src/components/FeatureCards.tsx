import { ShieldCheck, Tags, Recycle } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: ShieldCheck,
    title: "Quality Inspection",
    desc: "Systematic parameter-based grading for every vegetable batch before sale.",
  },
  {
    icon: Tags,
    title: "Grade-Based Pricing",
    desc: "Fair pricing tied directly to quality grade — A, B, C or Reject.",
  },
  {
    icon: Recycle,
    title: "Reduced Food Waste",
    desc: "Lower-grade produce can still be sold at appropriate prices instead of discarded.",
  },
];

const FeatureCards = () => (
  <section className="py-16 bg-muted/40">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="glass-card p-6"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureCards;
