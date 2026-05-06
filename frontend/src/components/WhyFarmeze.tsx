import { Heart, TrendingDown, Scale } from "lucide-react";

const reasons = [
  { icon: Heart, title: "Improves Customer Trust", desc: "Transparent grading builds confidence in produce quality." },
  { icon: TrendingDown, title: "Reduces Wastage", desc: "All grades find a market — nothing goes to waste needlessly." },
  { icon: Scale, title: "Supports Fair Pricing", desc: "Farmers get paid fairly based on actual produce quality." },
];

const WhyFarmeze = () => (
  <section className="py-16 bg-muted/40">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-foreground mb-10">Why Farmeze?</h2>
      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {reasons.map((r) => (
          <div key={r.title} className="flex items-start gap-4 glass-card p-5">
            <div className="w-10 h-10 rounded-lg bg-secondary flex-shrink-0 flex items-center justify-center">
              <r.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">{r.title}</h4>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyFarmeze;
