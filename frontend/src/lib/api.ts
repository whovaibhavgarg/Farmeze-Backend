const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

const request = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  if (response.status === 204) return null as T;
  return response.json();
};

const STORE_PREFIX = "farmeze-demo-api:";

const now = () => new Date().toISOString();

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const seedProducts = (): Product[] => [
  { _id: "product-potatoes", name: "Potatoes", category: "Vegetables", description: "Fresh graded potatoes", unit: "kg", quantity: 500, price: 30, status: "active" },
  { _id: "product-onions", name: "Onions", category: "Vegetables", description: "Sorted onions for retail orders", unit: "kg", quantity: 350, price: 40, status: "active" },
];

const seedPromotions = (): Promotion[] => [
  { _id: "promo-fresh10", title: "Fresh harvest deal", code: "FRESH10", discountType: "percentage", discountValue: 10, isActive: true },
];

const seedContent = (): AppContent[] => [
  { _id: "content-banner", type: "banner", title: "Farm fresh produce delivered daily", subtitle: "Live stock from verified farmers", placement: "home", isActive: true },
  { _id: "content-story", type: "story", title: "Today's farmer spotlight", subtitle: "Meet suppliers behind the freshest batches", placement: "home", isActive: true },
];

const readStore = <T>(key: string, seed: () => T[]): T[] => {
  const storageKey = `${STORE_PREFIX}${key}`;
  const existing = localStorage.getItem(storageKey);
  if (existing) return JSON.parse(existing);
  const seeded = seed();
  localStorage.setItem(storageKey, JSON.stringify(seeded));
  return seeded;
};

const writeStore = <T>(key: string, rows: T[]) => {
  localStorage.setItem(`${STORE_PREFIX}${key}`, JSON.stringify(rows));
};

const fallback = {
  products: {
    list: () => readStore<Product>("products", seedProducts),
    create: (body: Partial<Product>) => {
      const rows = fallback.products.list();
      const created: Product = {
        _id: uid("product"),
        name: body.name || "Untitled product",
        category: body.category || "General",
        description: body.description || null,
        unit: body.unit || "kg",
        quantity: Number(body.quantity || 0),
        price: Number(body.price || 0),
        farmerId: body.farmerId || body.farmer_id || null,
        status: body.status || "active",
      };
      writeStore("products", [created, ...rows]);
      return created;
    },
    update: (id: string, body: Partial<Product>) => {
      const rows = fallback.products.list();
      const nextRows = rows.map((row) => (getId(row) === id ? { ...row, ...body } : row));
      writeStore("products", nextRows);
      return nextRows.find((row) => getId(row) === id) as Product;
    },
    delete: (id: string) => writeStore("products", fallback.products.list().filter((row) => getId(row) !== id)),
  },
  orders: {
    list: () => readStore<AppOrder>("orders", () => []),
    create: (body: Partial<AppOrder>) => {
      const rows = fallback.orders.list();
      const created: AppOrder = {
        _id: uid("order"),
        orderNumber: body.orderNumber || `ORD-${Date.now()}`,
        customerName: body.customerName || body.customer_name || "Customer",
        customerPhone: body.customerPhone || body.customer_phone || "",
        deliveryAddress: body.deliveryAddress || body.delivery_address || "",
        city: body.city || "",
        status: body.status || "new",
        paymentStatus: body.paymentStatus || body.payment_status || "unpaid",
        paymentMedium: body.paymentMedium || body.payment_medium || "cod",
        subtotal: Number(body.subtotal || 0),
        discountAmount: Number(body.discountAmount || body.discount_amount || 0),
        totalAmount: Number(body.totalAmount || body.total_amount || 0),
        notes: body.notes || null,
        items: body.items || [],
        createdAt: body.createdAt || new Date().toISOString(),
      };
      writeStore("orders", [created, ...rows]);
      return created;
    },
    update: (id: string, body: Partial<AppOrder>) => {
      const rows = fallback.orders.list();
      const nextRows = rows.map((row) => (getId(row) === id ? { ...row, ...body } : row));
      writeStore("orders", nextRows);
      return nextRows.find((row) => getId(row) === id) as AppOrder;
    },
    items: (id: string) => fallback.orderItems.list().filter((item) => (item.orderId || item.order_id) === id),
  },
  orderItems: {
    list: () => readStore<OrderItem>("order-items", () => []),
  },
  promotions: {
    list: () => readStore<Promotion>("promotions", seedPromotions),
    create: (body: Partial<Promotion>) => {
      const rows = fallback.promotions.list();
      const created: Promotion = {
        _id: uid("promo"),
        title: body.title || "Untitled discount",
        code: body.code || null,
        discountType: body.discountType || body.discount_type || "percentage",
        discountValue: Number(body.discountValue ?? body.discount_value ?? 0),
        isActive: body.isActive ?? body.is_active ?? true,
      };
      writeStore("promotions", [created, ...rows]);
      return created;
    },
    update: (id: string, body: Partial<Promotion>) => {
      const rows = fallback.promotions.list();
      const nextRows = rows.map((row) => (getId(row) === id ? { ...row, ...body } : row));
      writeStore("promotions", nextRows);
      return nextRows.find((row) => getId(row) === id) as Promotion;
    },
    delete: (id: string) => writeStore("promotions", fallback.promotions.list().filter((row) => getId(row) !== id)),
  },
  content: {
    list: () => readStore<AppContent>("content", seedContent),
    create: (body: Partial<AppContent>) => {
      const rows = fallback.content.list();
      const created: AppContent = {
        _id: uid("content"),
        type: body.type || "banner",
        title: body.title || "Untitled content",
        subtitle: body.subtitle || null,
        body: body.body || null,
        imageUrl: body.imageUrl || body.image_url || null,
        placement: body.placement || "home",
        isActive: body.isActive ?? body.is_active ?? true,
      };
      writeStore("content", [created, ...rows]);
      return created;
    },
    update: (id: string, body: Partial<AppContent>) => {
      const rows = fallback.content.list();
      const nextRows = rows.map((row) => (getId(row) === id ? { ...row, ...body } : row));
      writeStore("content", nextRows);
      return nextRows.find((row) => getId(row) === id) as AppContent;
    },
    delete: (id: string) => writeStore("content", fallback.content.list().filter((row) => getId(row) !== id)),
  },
  farmers: {
    list: () => readStore<Farmer>("farmers", () => []),
    create: (body: Partial<Farmer>) => {
      const rows = fallback.farmers.list();
      const created: Farmer = {
        _id: uid("farmer"),
        name: body.name || "Unnamed Farmer",
        location: body.location || "",
        phone: body.phone || "",
      };
      writeStore("farmers", [created, ...rows]);
      return created;
    },
  },
  inventoryEntries: {
    list: () => readStore<InventoryEntry>("inventory-entries", () => []),
    create: (body: Partial<InventoryEntry> & { farmerId?: string }) => {
      const rows = fallback.inventoryEntries.list();
      const created: InventoryEntry = {
        _id: uid("entry"),
        product: body.product || "Product",
        grade: body.grade || "A",
        quantity: Number(body.quantity || 0),
        type: body.type || "addition",
        createdAt: now(),
      };
      writeStore("inventory-entries", [created, ...rows]);
      return created;
    },
  },
  priceAdjustments: {
    list: () => readStore<PriceAdjustment>("price-adjustments", () => []),
    create: (body: Partial<PriceAdjustment>) => {
      const rows = fallback.priceAdjustments.list();
      const created: PriceAdjustment = { _id: uid("price"), ...body, createdAt: now() };
      writeStore("price-adjustments", [created, ...rows]);
      return created;
    },
  },
};

const withFallback = async <T>(remote: () => Promise<T>, local: () => T): Promise<T> => {
  try {
    return await remote();
  } catch {
    return local();
  }
};

export type OrderStatus = "new" | "approved" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "unpaid" | "refunded";
export type ContentType = "banner" | "story" | "article";

export interface Farmer {
  _id?: string;
  id?: string;
  name: string;
  location: string;
  phone: string;
}

export interface Product {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  description?: string | null;
  unit: string;
  quantity: number;
  price: number;
  farmerId?: string | null;
  farmer_id?: string | null;
  status: "active" | "draft" | "out_of_stock";
  imageUrl?: string | null;
  image_url?: string | null;
  farmer?: Farmer | null;
  farmers?: Farmer | null;
}

export interface AppOrder {
  _id?: string;
  id?: string;
  orderNumber?: string;
  order_number?: string;
  customerName?: string;
  customer_name?: string;
  customerPhone?: string | null;
  customer_phone?: string | null;
  deliveryAddress?: string | null;
  delivery_address?: string | null;
  city?: string | null;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  payment_status?: PaymentStatus;
  paymentMedium?: "cod" | "upi" | "card" | "wallet" | "bank_transfer";
  payment_medium?: "cod" | "upi" | "card" | "wallet" | "bank_transfer";
  subtotal: number;
  discountAmount?: number;
  discount_amount?: number;
  totalAmount?: number;
  total_amount?: number;
  notes?: string | null;
  createdAt?: string;
  created_at?: string;
}

export interface OrderItem {
  _id?: string;
  id?: string;
  orderId?: string;
  order_id?: string;
  productId?: string | null;
  product_id?: string | null;
  productName?: string;
  product_name?: string;
  quantity: number;
}

export interface Promotion {
  _id?: string;
  id?: string;
  title: string;
  code?: string | null;
  discountType?: "percentage" | "flat";
  discount_type?: "percentage" | "flat";
  discountValue?: number;
  discount_value?: number;
  isActive?: boolean;
  is_active?: boolean;
}

export interface AppContent {
  _id?: string;
  id?: string;
  type: ContentType;
  title: string;
  subtitle?: string | null;
  body?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  placement: string;
  isActive?: boolean;
  is_active?: boolean;
}

export interface InventoryEntry {
  _id?: string;
  id?: string;
  product: string;
  grade: string;
  quantity: number;
  type: "addition" | "subtraction";
  createdAt?: string;
  created_at?: string;
  farmer?: Farmer | null;
  farmers?: Farmer | null;
}

export interface PriceAdjustment {
  _id?: string;
  id?: string;
  productName?: string;
  product_name?: string;
  oldPrice?: number;
  old_price?: number;
  newPrice?: number;
  new_price?: number;
  reason?: string | null;
  createdAt?: string;
  created_at?: string;
}

export const getId = (value: { _id?: string; id?: string }) => value._id || value.id || "";

export const api = {
  products: {
    list: () => withFallback(() => request<Product[]>("/products"), fallback.products.list),
    create: (body: Partial<Product>) => withFallback(() => request<Product>("/products", { method: "POST", body }), () => fallback.products.create(body)),
    update: (id: string, body: Partial<Product>) => withFallback(() => request<Product>(`/products/${id}`, { method: "PATCH", body }), () => fallback.products.update(id, body)),
    delete: (id: string) => withFallback(() => request<void>(`/products/${id}`, { method: "DELETE" }), () => fallback.products.delete(id)),
  },
  orders: {
    list: () => withFallback(() => request<AppOrder[]>("/orders"), fallback.orders.list),
    create: (body: Partial<AppOrder>) => withFallback(() => request<AppOrder>("/orders", { method: "POST", body }), () => fallback.orders.create(body)),
    update: (id: string, body: Partial<AppOrder>) => withFallback(() => request<AppOrder>(`/orders/${id}`, { method: "PATCH", body }), () => fallback.orders.update(id, body)),
    items: (id: string) => withFallback(() => request<OrderItem[]>(`/orders/${id}/items`), () => fallback.orders.items(id)),
  },
  promotions: {
    list: () => withFallback(() => request<Promotion[]>("/promotions"), fallback.promotions.list),
    create: (body: Partial<Promotion>) => withFallback(() => request<Promotion>("/promotions", { method: "POST", body }), () => fallback.promotions.create(body)),
    update: (id: string, body: Partial<Promotion>) => withFallback(() => request<Promotion>(`/promotions/${id}`, { method: "PATCH", body }), () => fallback.promotions.update(id, body)),
    delete: (id: string) => withFallback(() => request<void>(`/promotions/${id}`, { method: "DELETE" }), () => fallback.promotions.delete(id)),
  },
  content: {
    list: () => withFallback(() => request<AppContent[]>("/content"), fallback.content.list),
    create: (body: Partial<AppContent>) => withFallback(() => request<AppContent>("/content", { method: "POST", body }), () => fallback.content.create(body)),
    update: (id: string, body: Partial<AppContent>) => withFallback(() => request<AppContent>(`/content/${id}`, { method: "PATCH", body }), () => fallback.content.update(id, body)),
    delete: (id: string) => withFallback(() => request<void>(`/content/${id}`, { method: "DELETE" }), () => fallback.content.delete(id)),
  },
  farmers: {
    list: () => withFallback(() => request<Farmer[]>("/farmers"), fallback.farmers.list),
    create: (body: Partial<Farmer>) => withFallback(() => request<Farmer>("/farmers", { method: "POST", body }), () => fallback.farmers.create(body)),
  },
  inventoryEntries: {
    list: () => withFallback(() => request<InventoryEntry[]>("/inventory-entries"), fallback.inventoryEntries.list),
    create: (body: Partial<InventoryEntry>) => withFallback(() => request<InventoryEntry>("/inventory-entries", { method: "POST", body }), () => fallback.inventoryEntries.create(body)),
  },
  priceAdjustments: {
    list: () => withFallback(() => request<PriceAdjustment[]>("/price-adjustments"), fallback.priceAdjustments.list),
    create: (body: Partial<PriceAdjustment>) => withFallback(() => request<PriceAdjustment>("/price-adjustments", { method: "POST", body }), () => fallback.priceAdjustments.create(body)),
  },
};
