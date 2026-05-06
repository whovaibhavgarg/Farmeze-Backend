import { createContext, useContext, useState, type ReactNode } from "react";

export interface StockEntry {
  id: string;
  product: "Potatoes" | "Onions";
  grade: "A" | "B" | "C";
  quantity: number;
  farmerName: string;
  farmerLocation: string;
  farmerUsername: string;
  timestamp: string;
  type: "addition" | "subtraction";
  qrGenerated?: boolean;
}

export interface ProductSummary {
  name: string;
  emoji: string;
  totalStock: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  basePrice: number;
}

interface InventoryContextType {
  entries: StockEntry[];
  addEntry: (entry: Omit<StockEntry, "id" | "timestamp">) => void;
  getProductSummaries: () => ProductSummary[];
  getEntriesByFarmer: (username: string) => StockEntry[];
  markQrGenerated: (id: string) => void;
}

const InventoryContext = createContext<InventoryContextType>({
  entries: [],
  addEntry: () => {},
  getProductSummaries: () => [],
  getEntriesByFarmer: () => [],
  markQrGenerated: () => {},
});

export const useInventory = () => useContext(InventoryContext);

// Initial seed data
const seedEntries: StockEntry[] = [
  { id: "seed-1", product: "Potatoes", grade: "A", quantity: 220, farmerName: "Rajesh Kumar", farmerLocation: "Agra, UP", farmerUsername: "rajesh", timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(), type: "addition" },
  { id: "seed-2", product: "Potatoes", grade: "B", quantity: 180, farmerName: "Sunil Yadav", farmerLocation: "Nashik, MH", farmerUsername: "sunil", timestamp: new Date(Date.now() - 86400000).toLocaleString(), type: "addition" },
  { id: "seed-3", product: "Potatoes", grade: "C", quantity: 100, farmerName: "Priya Devi", farmerLocation: "Indore, MP", farmerUsername: "priya", timestamp: new Date(Date.now() - 43200000).toLocaleString(), type: "addition" },
  { id: "seed-4", product: "Onions", grade: "A", quantity: 140, farmerName: "Rajesh Kumar", farmerLocation: "Agra, UP", farmerUsername: "rajesh", timestamp: new Date(Date.now() - 86400000 * 2).toLocaleString(), type: "addition" },
  { id: "seed-5", product: "Onions", grade: "B", quantity: 130, farmerName: "Sunil Yadav", farmerLocation: "Nashik, MH", farmerUsername: "sunil", timestamp: new Date(Date.now() - 86400000).toLocaleString(), type: "addition" },
  { id: "seed-6", product: "Onions", grade: "C", quantity: 80, farmerName: "Priya Devi", farmerLocation: "Indore, MP", farmerUsername: "priya", timestamp: new Date(Date.now() - 43200000).toLocaleString(), type: "addition" },
];

let counter = 100;

export const InventoryProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<StockEntry[]>(seedEntries);

  const addEntry = (entry: Omit<StockEntry, "id" | "timestamp">) => {
    counter++;
    setEntries((prev) => [
      {
        ...entry,
        id: `entry-${counter}`,
        timestamp: new Date().toLocaleString(),
      },
      ...prev,
    ]);
  };

  const getProductSummaries = (): ProductSummary[] => {
    const products: Record<string, ProductSummary> = {
      Potatoes: { name: "Potatoes", emoji: "🥔", totalStock: 0, gradeA: 0, gradeB: 0, gradeC: 0, basePrice: 30 },
      Onions: { name: "Onions", emoji: "🧅", totalStock: 0, gradeA: 0, gradeB: 0, gradeC: 0, basePrice: 40 },
    };

    entries.forEach((e) => {
      const p = products[e.product];
      if (!p) return;
      const delta = e.type === "addition" ? e.quantity : -e.quantity;
      p.totalStock += delta;
      if (e.grade === "A") p.gradeA += delta;
      else if (e.grade === "B") p.gradeB += delta;
      else p.gradeC += delta;
    });

    // Clamp to 0
    Object.values(products).forEach((p) => {
      p.totalStock = Math.max(0, p.totalStock);
      p.gradeA = Math.max(0, p.gradeA);
      p.gradeB = Math.max(0, p.gradeB);
      p.gradeC = Math.max(0, p.gradeC);
    });

    return Object.values(products);
  };

  const getEntriesByFarmer = (username: string) =>
    entries.filter((e) => e.farmerUsername === username);

  const markQrGenerated = (id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, qrGenerated: true } : e))
    );
  };

  return (
    <InventoryContext.Provider value={{ entries, addEntry, getProductSummaries, getEntriesByFarmer, markQrGenerated }}>
      {children}
    </InventoryContext.Provider>
  );
};
