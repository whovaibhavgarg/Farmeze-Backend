import { useState } from "react";
import { ClipboardCheck, RotateCcw, Loader2, FlaskConical, Microscope, Gauge } from "lucide-react";
import { performQualityCheck, type QualityCheckInput, type QualityCheckResult } from "@/lib/qualityCheck";
import QualityResult from "./QualityResult";
import InspectionHistory, { type InspectionRecord } from "./InspectionHistory";
import { motion, AnimatePresence } from "framer-motion";

const QualityCheckForm = () => {
  const [product, setProduct] = useState<"potato" | "onion">("potato");
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [firmness, setFirmness] = useState<"good" | "average" | "soft">("good");
  const [sprouting, setSprouting] = useState(false);
  const [rot, setRot] = useState(false);
  const [surfaceDefects, setSurfaceDefects] = useState<"none" | "minor" | "major">("none");
  const [skinQuality, setSkinQuality] = useState<"good" | "slightly_damaged" | "damaged">("good");
  const [result, setResult] = useState<QualityCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<InspectionRecord[]>([]);
  const [step, setStep] = useState(1);

  const handleCheck = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const input: QualityCheckInput = {
      product,
      size,
      firmness,
      sprouting,
      rot,
      ...(product === "potato" ? { surfaceDefects } : { skinQuality }),
    };

    const res = performQualityCheck(input);
    setResult(res);
    setHistory((prev) => [
      {
        product: res.data.product,
        score: res.data.qualityScore,
        grade: res.data.grade,
        price: res.data.suggestedPrice,
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);
    setLoading(false);
    setStep(3);
  };

  const handleReset = () => {
    setProduct("potato");
    setSize("medium");
    setFirmness("good");
    setSprouting(false);
    setRot(false);
    setSurfaceDefects("none");
    setSkinQuality("good");
    setResult(null);
    setStep(1);
  };

  const selectBtn = (active: boolean) =>
    `px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
      active
        ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
        : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-muted"
    }`;

  const toggleBtn = (active: boolean) =>
    `px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
      active
        ? "bg-destructive/10 text-destructive border-destructive/40 shadow-md"
        : "bg-card text-foreground border-border hover:bg-muted"
    }`;

  return (
    <section id="quality-check" className="py-20 scroll-mt-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Section Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4">
            <Microscope className="w-3.5 h-3.5" />
            AI-POWERED GRADING ENGINE
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-foreground mb-3">
            Quality Inspection Lab
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Run a professional-grade quality assessment on your produce batch. Our scoring engine evaluates multiple parameters to determine the optimal grade and pricing.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[
            { num: 1, label: "Select & Configure" },
            { num: 2, label: "Review Parameters" },
            { num: 3, label: "Results" },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s.num
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-muted text-muted-foreground"
              }`}>
                {s.num}
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`w-8 md:w-16 h-0.5 rounded ${step > s.num ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-muted/30 px-6 md:px-8 py-5 border-b border-border flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Batch Inspection Form</h3>
              <p className="text-xs text-muted-foreground">Configure parameters for quality assessment</p>
            </div>
            <div className="ml-auto">
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary uppercase tracking-wider">
                Live Engine
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {/* Product Type */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-xs text-primary">1</span>
                Product Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { value: "potato" as const, emoji: "🥔", label: "Potato", sub: "Solanum tuberosum" },
                  { value: "onion" as const, emoji: "🧅", label: "Onion", sub: "Allium cepa" },
                ]).map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setProduct(p.value)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      product === p.value
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border hover:border-primary/30 bg-card"
                    }`}
                  >
                    <span className="text-3xl block mb-1">{p.emoji}</span>
                    <span className="font-bold text-foreground block">{p.label}</span>
                    <span className="text-[10px] text-muted-foreground italic">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Physical Parameters */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-xs text-primary">2</span>
                Physical Parameters
              </label>
              <div className="grid md:grid-cols-2 gap-6 bg-muted/20 rounded-xl p-5 border border-border/50">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Size</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["small", "medium", "large"] as const).map((s) => (
                      <button key={s} onClick={() => setSize(s)} className={selectBtn(size === s)}>
                        {s === "small" ? "S" : s === "medium" ? "M" : "L"} – {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Firmness</label>
                  <div className="flex gap-2 flex-wrap">
                    {(["good", "average", "soft"] as const).map((f) => (
                      <button key={f} onClick={() => setFirmness(f)} className={selectBtn(firmness === f)}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Condition-Specific */}
            <div className="mb-8">
              <label className="flex items-center gap-2 text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                <span className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center text-xs text-primary">3</span>
                {product === "potato" ? "Surface & Condition" : "Skin & Condition"}
              </label>
              <div className="grid md:grid-cols-2 gap-6 bg-muted/20 rounded-xl p-5 border border-border/50">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                    {product === "potato" ? "Surface Defects" : "Skin Quality"}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product === "potato"
                      ? (["none", "minor", "major"] as const).map((d) => (
                          <button key={d} onClick={() => setSurfaceDefects(d)} className={selectBtn(surfaceDefects === d)}>
                            {d.charAt(0).toUpperCase() + d.slice(1)}
                          </button>
                        ))
                      : (["good", "slightly_damaged", "damaged"] as const).map((q) => (
                          <button key={q} onClick={() => setSkinQuality(q)} className={selectBtn(skinQuality === q)}>
                            {q === "slightly_damaged" ? "Slight Dmg" : q.charAt(0).toUpperCase() + q.slice(1)}
                          </button>
                        ))
                    }
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Sprouting</label>
                    <div className="flex gap-2">
                      <button onClick={() => setSprouting(false)} className={selectBtn(!sprouting)}>No</button>
                      <button onClick={() => setSprouting(true)} className={toggleBtn(sprouting)}>⚠️ Yes</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Rot / Fungal</label>
                    <div className="flex gap-2">
                      <button onClick={() => setRot(false)} className={selectBtn(!rot)}>No</button>
                      <button onClick={() => setRot(true)} className={toggleBtn(rot)}>⚠️ Yes</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-border">
              <button
                onClick={() => { setStep(2); handleCheck(); }}
                disabled={loading}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all disabled:opacity-60 text-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Batch...
                  </>
                ) : (
                  <>
                    <Gauge className="w-4 h-4" />
                    Run Quality Analysis
                  </>
                )}
              </button>
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-card border border-border font-semibold text-foreground hover:bg-muted transition-all text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-8 glass-card p-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Analyzing Batch Quality</h3>
              <p className="text-sm text-muted-foreground">Running multi-parameter quality assessment...</p>
              <div className="mt-4 w-48 mx-auto h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <QualityResult result={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* History */}
        {history.length > 0 && (
          <div className="mt-8">
            <InspectionHistory history={history} onClear={() => setHistory([])} />
          </div>
        )}
      </div>
    </section>
  );
};

export default QualityCheckForm;
