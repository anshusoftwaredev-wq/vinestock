export interface Wine {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  sku: string;
  volume: string; // e.g., "750ml"
  origin: string;
}

export interface SaleItem {
  wineId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: SaleItem[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'upi';
}

export interface Category {
  id: string;
  name: string;
}
