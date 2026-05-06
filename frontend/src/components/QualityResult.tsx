import type { QualityCheckResult } from "@/lib/qualityCheck";
import { CheckCircle, AlertTriangle, XCircle, Info, Award, TrendingUp, IndianRupee, FileCheck } from "lucide-react";
import { motion } from "framer-motion";

const gradeConfig = {
  A: { cls: "grade-a", icon: CheckCircle, label: "Premium", bg: "bg-grade-a/10", ring: "ring-grade-a/30" },
  B: { cls: "grade-b", icon: Info, label: "Standard", bg: "bg-grade-b/10", ring: "ring-grade-b/30" },
  C: { cls: "grade-c", icon: AlertTriangle, label: "Economy", bg: "bg-grade-c/10", ring: "ring-grade-c/30" },
  Reject: { cls: "grade-reject", icon: XCircle, label: "Rejected", bg: "bg-grade-reject/10", ring: "ring-grade-reject/30" },
};

const QualityResult = ({ result }: { result: QualityCheckResult }) => {
  const { data } = result;
  const config = gradeConfig[data.grade];
  const Icon = config.icon;

  const scoreColor =
    data.qualityScore >= 80 ? "text-grade-a" :
    data.qualityScore >= 60 ? "text-grade-b" :
    data.qualityScore >= 40 ? "text-grade-c" : "text-grade-reject";

  return (
    <div className="glass-card overflow-hidden">
      {/* Header banner */}
      <div className={`px-6 py-4 border-b border-border flex items-center gap-3 ${config.bg}`}>
        <div className={`w-10 h-10 rounded-xl ${config.bg} ring-2 ${config.ring} flex items-center justify-center`}>
          <FileCheck className={`w-5 h-5 ${config.cls.replace("grade-", "text-grade-")}`} />
        </div>
        <div>
          <h3 className="font-bold text-foreground">Quality Assessment Report</h3>
          <p className="text-xs text-muted-foreground">Analysis completed • {new Date().toLocaleTimeString()}</p>
        </div>
        <span className={`ml-auto grade-badge ${config.cls} text-sm`}>
          <Icon className="w-4 h-4 mr-1" />
          Grade {data.grade} — {config.label}
        </span>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Score Circle */}
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4 }}
              className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center ring-4 ${config.ring} ${config.bg}`}
            >
              <span className={`text-4xl font-black ${scoreColor}`}>{data.qualityScore}</span>
              <span className="text-xs text-muted-foreground font-medium">out of 100</span>
              <div className="absolute -top-1 -right-1">
                <div className={`w-8 h-8 rounded-full ${config.bg} ring-2 ring-card flex items-center justify-center`}>
                  <Award className={`w-4 h-4 ${scoreColor}`} />
                </div>
              </div>
            </motion.div>
            <p className="text-sm font-bold text-foreground mt-3">{data.product}</p>
            <p className="text-xs text-muted-foreground">{data.summary}</p>
          </div>

          {/* Key Metrics */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Key Metrics</h4>
            {[
              { icon: Award, label: "Quality Grade", value: `Grade ${data.grade}`, sub: config.label },
              { icon: IndianRupee, label: "Suggested Price", value: `₹${data.suggestedPrice}/kg`, sub: "Market price" },
              { icon: TrendingUp, label: "Quality Score", value: `${data.qualityScore}/100`, sub: data.qualityScore >= 80 ? "Excellent" : data.qualityScore >= 60 ? "Good" : "Needs improvement" },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <m.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className="font-bold text-foreground text-sm">{m.value}</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{m.sub}</span>
              </div>
            ))}
          </div>

          {/* Deduction Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Score Breakdown</h4>
            <div className="space-y-1.5 bg-muted/20 rounded-xl p-4 border border-border/50">
              {data.reasons.map((r, i) => {
                const isDeduction = r.includes("-");
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`text-xs flex items-start gap-2 py-1.5 px-2 rounded-lg ${
                      isDeduction ? "bg-destructive/5" : "bg-primary/5"
                    }`}
                  >
                    <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      isDeduction ? "bg-destructive" : "bg-primary"
                    }`} />
                    <span className={isDeduction ? "text-destructive" : "text-foreground"}>{r}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            💡 In production, each inspected batch is automatically added to grade-wise inventory with farmer traceability and QR code attached.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QualityResult;
