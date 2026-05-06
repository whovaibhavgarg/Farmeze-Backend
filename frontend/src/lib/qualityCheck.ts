// Quality check logic - simulates backend API
export interface QualityCheckInput {
  product: "potato" | "onion";
  size: "small" | "medium" | "large";
  firmness: "good" | "average" | "soft";
  sprouting: boolean;
  rot: boolean;
  surfaceDefects?: "none" | "minor" | "major"; // potato only
  skinQuality?: "good" | "slightly_damaged" | "damaged"; // onion only
}

export interface QualityCheckResult {
  success: true;
  data: {
    product: string;
    qualityScore: number;
    grade: "A" | "B" | "C" | "Reject";
    suggestedPrice: number;
    reasons: string[];
    summary: string;
  };
}

const POTATO_PRICES: Record<string, number> = { A: 30, B: 24, C: 18, Reject: 0 };
const ONION_PRICES: Record<string, number> = { A: 40, B: 32, C: 25, Reject: 0 };

export function performQualityCheck(input: QualityCheckInput): QualityCheckResult {
  let score = 100;
  const reasons: string[] = [];

  // Size
  if (input.size === "small") { score -= 10; reasons.push("Small size: -10 points"); }
  else if (input.size === "medium") { score -= 5; reasons.push("Medium size: -5 points"); }
  else { reasons.push("Large size: no deduction"); }

  // Firmness
  if (input.firmness === "average") { score -= 10; reasons.push("Average firmness: -10 points"); }
  else if (input.firmness === "soft") { score -= 25; reasons.push("Soft texture: -25 points"); }
  else { reasons.push("Good firmness: no deduction"); }

  // Sprouting
  if (input.sprouting) { score -= 20; reasons.push("Sprouting detected: -20 points"); }

  // Rot
  if (input.rot) { score -= 30; reasons.push("Rot/Fungal issue: -30 points"); }

  // Product-specific
  if (input.product === "potato" && input.surfaceDefects) {
    if (input.surfaceDefects === "minor") { score -= 10; reasons.push("Minor surface defects: -10 points"); }
    else if (input.surfaceDefects === "major") { score -= 25; reasons.push("Major surface defects: -25 points"); }
    else { reasons.push("No surface defects: no deduction"); }
  }

  if (input.product === "onion" && input.skinQuality) {
    if (input.skinQuality === "slightly_damaged") { score -= 10; reasons.push("Slightly damaged skin: -10 points"); }
    else if (input.skinQuality === "damaged") { score -= 20; reasons.push("Damaged skin: -20 points"); }
    else { reasons.push("Good skin quality: no deduction"); }
  }

  score = Math.max(0, score);

  let grade: "A" | "B" | "C" | "Reject";
  if (score >= 80) grade = "A";
  else if (score >= 60) grade = "B";
  else if (score >= 40) grade = "C";
  else grade = "Reject";

  const prices = input.product === "potato" ? POTATO_PRICES : ONION_PRICES;
  const suggestedPrice = prices[grade];

  const summaries: Record<string, string> = {
    A: "Premium quality batch — ready for direct retail",
    B: "Standard market quality — suitable for general sale",
    C: "Lower grade — suitable for budget buyers or processing",
    Reject: "Rejected due to poor condition — not suitable for sale",
  };

  return {
    success: true,
    data: {
      product: input.product === "potato" ? "Potato" : "Onion",
      qualityScore: score,
      grade,
      suggestedPrice,
      reasons,
      summary: summaries[grade],
    },
  };
}
