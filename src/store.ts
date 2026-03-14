import { useState, useEffect } from 'react';
import { Wine, Sale, Category } from './types';

const STORAGE_KEYS = {
  WINES: 'vinostock_wines',
  SALES: 'vinostock_sales',
  CATEGORIES: 'vinostock_categories',
};

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Red Wine' },
  { id: '2', name: 'White Wine' },
  { id: '3', name: 'Rosé' },
  { id: '4', name: 'Sparkling' },
  { id: '5', name: 'Dessert Wine' },
];

export function useWineStore() {
  const [wines, setWines] = useState<Wine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedWines = localStorage.getItem(STORAGE_KEYS.WINES);
    const storedSales = localStorage.getItem(STORAGE_KEYS.SALES);
    const storedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);

    if (storedWines) setWines(JSON.parse(storedWines));
    if (storedSales) setSales(JSON.parse(storedSales));
    if (storedCategories) {
      setCategories(JSON.parse(storedCategories));
    } else {
      setCategories(INITIAL_CATEGORIES);
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    }
    setLoading(false);
  }, []);

  const saveWines = (newWines: Wine[]) => {
    setWines(newWines);
    localStorage.setItem(STORAGE_KEYS.WINES, JSON.stringify(newWines));
  };

  const saveSales = (newSales: Sale[]) => {
    setSales(newSales);
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(newSales));
  };

  const addWine = (wine: Omit<Wine, 'id'>) => {
    const newWine = { ...wine, id: crypto.randomUUID() };
    saveWines([...wines, newWine]);
  };

  const bulkAddWines = (newWinesData: Omit<Wine, 'id'>[]) => {
    const newWines = newWinesData.map(w => ({ ...w, id: crypto.randomUUID() }));
    saveWines([...wines, ...newWines]);
  };

  const updateWine = (id: string, updates: Partial<Wine>) => {
    const newWines = wines.map(w => w.id === id ? { ...w, ...updates } : w);
    saveWines(newWines);
  };

  const deleteWine = (id: string) => {
    saveWines(wines.filter(w => w.id !== id));
  };

  const updateSale = (id: string, updates: Partial<Sale>) => {
    const newSales = sales.map(s => s.id === id ? { ...s, ...updates } : s);
    saveSales(newSales);
  };

  const addSale = (sale: Omit<Sale, 'id' | 'timestamp'>) => {
    const newSale = {
      ...sale,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    // Update stock
    const updatedWines = wines.map(wine => {
      const saleItem = sale.items.find(item => item.wineId === wine.id);
      if (saleItem) {
        return { ...wine, stock: wine.stock - saleItem.quantity };
      }
      return wine;
    });

    saveWines(updatedWines);
    saveSales([newSale, ...sales]);
  };

  return {
    wines,
    sales,
    categories,
    loading,
    addWine,
    bulkAddWines,
    updateWine,
    deleteWine,
    addSale,
    updateSale,
  };
}
