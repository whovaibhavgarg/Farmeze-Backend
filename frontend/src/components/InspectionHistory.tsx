import { Trash2 } from "lucide-react";

export interface InspectionRecord {
  product: string;
  score: number;
  grade: string;
  price: number;
  timestamp: string;
}

const gradeClass: Record<string, string> = {
  A: "grade-a",
  B: "grade-b",
  C: "grade-c",
  Reject: "grade-reject",
};

const InspectionHistory = ({
  history,
  onClear,
}: {
  history: InspectionRecord[];
  onClear: () => void;
}) => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-foreground">Inspection History</h3>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Clear
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 text-muted-foreground font-medium">Product</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Score</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Grade</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Price</th>
            <th className="text-left py-2 text-muted-foreground font-medium">Time</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h, i) => (
            <tr key={i} className="border-b border-border/50 last:border-0">
              <td className="py-2.5 font-medium text-foreground">{h.product}</td>
              <td className="py-2.5 text-foreground">{h.score}</td>
              <td className="py-2.5">
                <span className={`grade-badge text-xs ${gradeClass[h.grade] || ""}`}>
                  {h.grade}
                </span>
              </td>
              <td className="py-2.5 text-foreground">₹{h.price}/kg</td>
              <td className="py-2.5 text-muted-foreground text-xs">{h.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default InspectionHistory;
