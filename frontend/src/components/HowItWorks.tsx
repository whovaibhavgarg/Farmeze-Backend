import { motion } from "framer-motion";

const steps = [
  { num: "1", title: "Select Vegetable", desc: "Choose Potato or Onion" },
  { num: "2", title: "Enter Parameters", desc: "Size, firmness, defects & more" },
  { num: "3", title: "Calculate Score", desc: "Rule-based quality scoring" },
  { num: "4", title: "Get Grade & Price", desc: "A/B/C/Reject with pricing" },
  { num: "5", title: "Track Inventory", desc: "Monitor stock by grade" },
];

const HowItWorks = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-foreground mb-12">How It Works</h2>
      <div className="flex flex-wrap justify-center gap-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="glass-card p-5 w-full sm:w-44 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3 text-sm">
              {s.num}
            </div>
            <h4 className="font-semibold text-foreground text-sm mb-1">{s.title}</h4>
            <p className="text-xs text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
