import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  History, 
  Plus, 
  Search, 
  Trash2, 
  Edit2, 
  Wine as WineIcon,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  X,
  Printer,
  CheckCircle2,
  FileUp,
  Download,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import { useWineStore } from './store';
import { Wine, SaleItem } from './types';

type Tab = 'dashboard' | 'inventory' | 'pos' | 'history';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const { wines, sales, categories, addWine, bulkAddWines, updateWine, deleteWine, addSale, updateSale } = useWineStore();

  return (
    <div className="flex h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#151619] text-white flex flex-col">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center">
            <WineIcon className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-serif font-bold tracking-tight">VinoStock</h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <SidebarItem 
            icon={<Package size={20} />} 
            label="Inventory" 
            active={activeTab === 'inventory'} 
            onClick={() => setActiveTab('inventory')} 
          />
          <SidebarItem 
            icon={<ShoppingCart size={20} />} 
            label="POS Billing" 
            active={activeTab === 'pos'} 
            onClick={() => setActiveTab('pos')} 
          />
          <SidebarItem 
            icon={<History size={20} />} 
            label="Sales History" 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
          />
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            System Online
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 bg-white border-b border-black/5 flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-2xl font-serif font-medium capitalize">{activeTab.replace('-', ' ')}</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">Wine Shop Admin</p>
              <p className="text-xs text-black/40">Sat, 14 Mar 2026</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#E6E6E6] flex items-center justify-center">
              <span className="text-sm font-bold">WA</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <Dashboard key="dashboard" wines={wines} sales={sales} />}
            {activeTab === 'inventory' && (
              <Inventory 
                key="inventory" 
                wines={wines} 
                categories={categories} 
                onAdd={addWine} 
                onUpdate={updateWine} 
                onDelete={deleteWine} 
                onBulkAdd={bulkAddWines}
              />
            )}
            {activeTab === 'pos' && <POS key="pos" wines={wines} onSale={addSale} onUpdateSale={updateSale} />}
            {activeTab === 'history' && <SalesHistory key="history" sales={sales} onUpdateSale={updateSale} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' 
          : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {active && <motion.div layoutId="active-pill" className="ml-auto"><ChevronRight size={16} /></motion.div>}
    </button>
  );
}

function Dashboard({ wines, sales }: { wines: Wine[], sales: any[], key?: any }) {
  const totalStock = wines.reduce((acc, w) => acc + w.stock, 0);
  const lowStockCount = wines.filter(w => w.stock < 10).length;
  const todaySales = sales.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString());
  const revenue = todaySales.reduce((acc, s) => acc + s.totalAmount, 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Today's Revenue" value={`$${revenue.toLocaleString()}`} icon={<TrendingUp className="text-emerald-600" />} trend="+12%" />
        <StatCard title="Total Stock" value={totalStock.toString()} icon={<Package className="text-blue-600" />} />
        <StatCard title="Low Stock Items" value={lowStockCount.toString()} icon={<AlertTriangle className="text-amber-600" />} variant={lowStockCount > 0 ? 'warning' : 'default'} />
        <StatCard title="Today's Bills" value={todaySales.length.toString()} icon={<ShoppingCart className="text-purple-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
          <h3 className="text-lg font-serif font-medium mb-6">Recent Sales</h3>
          <div className="space-y-4">
            {sales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-[#F9F9F7] rounded-2xl">
                <div>
                  <p className="font-medium">Bill #{sale.id.slice(0, 8)}</p>
                  <p className="text-xs text-black/40">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#5A5A40]">${sale.totalAmount.toLocaleString()}</p>
                  <p className="text-xs uppercase tracking-wider text-black/40">{sale.paymentMethod}</p>
                </div>
              </div>
            ))}
            {sales.length === 0 && <p className="text-center py-8 text-black/40 italic">No sales recorded yet.</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5">
          <h3 className="text-lg font-serif font-medium mb-6">Low Stock Alerts</h3>
          <div className="space-y-4">
            {wines.filter(w => w.stock < 10).slice(0, 5).map((wine) => (
              <div key={wine.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-200 rounded-xl flex items-center justify-center text-amber-700">
                    <WineIcon size={20} />
                  </div>
                  <div>
                    <p className="font-medium">{wine.name}</p>
                    <p className="text-xs text-amber-700/60">{wine.volume} • {wine.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-700">{wine.stock} left</p>
                  <p className="text-xs text-amber-700/60">Restock needed</p>
                </div>
              </div>
            ))}
            {wines.filter(w => w.stock < 10).length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-black/20">
                <CheckCircle2 size={48} className="mb-2" />
                <p className="italic">All stock levels healthy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, trend, variant = 'default' }: { title: string, value: string, icon: React.ReactNode, trend?: string, variant?: 'default' | 'warning' }) {
  return (
    <div className={`p-6 rounded-3xl shadow-sm border ${variant === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-white border-black/5'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${variant === 'warning' ? 'bg-amber-200' : 'bg-[#F5F5F0]'}`}>
          {icon}
        </div>
        {trend && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>}
      </div>
      <p className={`text-sm font-medium ${variant === 'warning' ? 'text-amber-700/60' : 'text-black/40'}`}>{title}</p>
      <p className={`text-3xl font-serif font-bold mt-1 ${variant === 'warning' ? 'text-amber-700' : ''}`}>{value}</p>
    </div>
  );
}

function Inventory({ wines, categories, onAdd, onUpdate, onDelete, onBulkAdd }: { wines: Wine[], categories: any[], onAdd: any, onUpdate: any, onDelete: any, onBulkAdd: any, key?: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [search, setSearch] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const filteredWines = wines.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.sku.toLowerCase().includes(search.toLowerCase())
  );

  const handleBulkImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedWines = results.data.map((row: any) => ({
          name: row.name || 'Unknown Wine',
          category: row.category || 'Red Wine',
          price: Number(row.price) || 0,
          stock: Number(row.stock) || 0,
          sku: row.sku || `SKU-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
          volume: row.volume || '750ml',
          origin: row.origin || 'Unknown',
        }));
        onBulkAdd(importedWines);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      error: (error) => {
        console.error('CSV Parsing Error:', error);
        alert('Failed to parse CSV file. Please check the format.');
      }
    });
  };

  const downloadTemplate = () => {
    const csvContent = "name,category,price,stock,sku,volume,origin\nChateau Margaux,Red Wine,450.00,12,MAR-001,750ml,France\nCloudy Bay,White Wine,35.00,24,CLD-002,750ml,New Zealand";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "vinostock_template.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const wineData = {
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      sku: formData.get('sku') as string,
      volume: formData.get('volume') as string,
      origin: formData.get('origin') as string,
    };

    if (editingWine) {
      onUpdate(editingWine.id, wineData);
    } else {
      onAdd(wineData);
    }
    setIsModalOpen(false);
    setEditingWine(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleBulkImport}
          />
          <button 
            onClick={downloadTemplate}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black/60 border border-black/5 px-4 py-3 rounded-2xl hover:bg-[#F5F5F0] transition-colors"
          >
            <Download size={18} />
            Template
          </button>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-black/60 border border-black/5 px-4 py-3 rounded-2xl hover:bg-[#F5F5F0] transition-colors"
          >
            <FileUp size={18} />
            Bulk Import
          </button>
          <button 
            onClick={() => { setEditingWine(null); setIsModalOpen(true); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#5A5A40] text-white px-6 py-3 rounded-2xl hover:bg-[#4A4A35] transition-colors shadow-lg shadow-[#5A5A40]/20"
          >
            <Plus size={20} />
            Add Wine
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9F9F7] border-b border-black/5">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40">Product</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40">Category</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40">Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40">SKU</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredWines.map((wine) => (
                <tr key={wine.id} className="hover:bg-[#F9F9F7] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#F5F5F0] rounded-xl flex items-center justify-center text-[#5A5A40]">
                        <WineIcon size={20} />
                      </div>
                      <div>
                        <p className="font-medium">{wine.name}</p>
                        <p className="text-xs text-black/40">{wine.volume} • {wine.origin}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-[#F5F5F0] rounded-full text-xs font-medium">{wine.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold">${wine.price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${wine.stock < 10 ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                      <span className="font-medium">{wine.stock} units</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-black/40">{wine.sku}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingWine(wine); setIsModalOpen(true); }}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(wine.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredWines.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-black/40 italic">
                    No wines found. Add your first bottle!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h3 className="text-xl font-serif font-medium">{editingWine ? 'Edit Wine' : 'Add New Wine'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-[#F5F5F0] rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/40 mb-1">Wine Name</label>
                    <input name="name" defaultValue={editingWine?.name} required className="w-full px-4 py-3 bg-[#F5F5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/40 mb-1">Category</label>
                    <select name="category" defaultValue={editingWine?.category} className="w-full px-4 py-3 bg-[#F5F5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20">
                      {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/40 mb-1">SKU</label>
                    <input name="sku" defaultValue={editingWine?.sku} required className="w-full px-4 py-3 bg-[#F5F5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/40 mb-1">Price ($)</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingWine?.price} required className="w-full px-4 py-3 bg-[#F5F5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/40 mb-1">Initial Stock</label>
                    <input name="stock" type="number" defaultValue={editingWine?.stock} required className="w-full px-4 py-3 bg-[#F5F5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/40 mb-1">Volume (e.g. 750ml)</label>
                    <input name="volume" defaultValue={editingWine?.volume} required className="w-full px-4 py-3 bg-[#F5F5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-black/40 mb-1">Origin</label>
                    <input name="origin" defaultValue={editingWine?.origin} required className="w-full px-4 py-3 bg-[#F5F5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-colors">
                    {editingWine ? 'Update Wine' : 'Add to Inventory'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function POS({ wines, onSale, onUpdateSale }: { wines: Wine[], onSale: any, onUpdateSale: any, key?: any }) {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: <Banknote size={16} /> },
    { id: 'card', label: 'Card', icon: <CreditCard size={16} /> },
    { id: 'upi', label: 'UPI', icon: <QrCode size={16} /> },
  ] as const;

  const filteredWines = wines.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (wine: Wine) => {
    if (wine.stock <= 0) return;
    
    const existing = cart.find(item => item.wineId === wine.id);
    if (existing) {
      if (existing.quantity >= wine.stock) return;
      setCart(cart.map(item => 
        item.wineId === wine.id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } 
          : item
      ));
    } else {
      setCart([...cart, {
        wineId: wine.id,
        name: wine.name,
        quantity: 1,
        price: wine.price,
        total: wine.price
      }]);
    }
  };

  const removeFromCart = (wineId: string) => {
    setCart(cart.filter(item => item.wineId !== wineId));
  };

  const total = cart.reduce((acc, item) => acc + item.total, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const sale = {
      items: cart,
      totalAmount: total,
      paymentMethod
    };
    onSale(sale);
    setLastSale({ ...sale, id: crypto.randomUUID(), timestamp: Date.now() });
    setCart([]);
    setShowReceipt(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Hidden Printable Receipt */}
      <div id="print-section" className="hidden">
        {lastSale && (
          <div className="p-8 text-black font-sans max-w-[300px] mx-auto border border-black/10">
            <div className="text-center mb-6">
              <h1 className="text-xl font-serif font-bold">VinoStock</h1>
              <p className="text-xs">Premium Wine Boutique</p>
              <p className="text-[10px] mt-1">123 Vineyard Lane, Napa Valley</p>
            </div>
            
            <div className="border-b border-dashed border-black/20 pb-4 mb-4">
              <p className="text-xs">Date: {new Date(lastSale.timestamp).toLocaleString()}</p>
              <p className="text-xs">Bill ID: #{lastSale.id.slice(0, 8)}</p>
            </div>

            <div className="space-y-2 mb-6">
              {lastSale.items.map((item: any) => (
                <div key={item.wineId} className="flex justify-between text-xs">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${item.total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-black/20 pt-4 space-y-1">
              <div className="flex justify-between text-sm font-bold">
                <span>Total</span>
                <span>${lastSale.totalAmount.toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-center mt-6 italic">Thank you for your purchase!</p>
            </div>
          </div>
        )}
      </div>

      {/* Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={18} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-black/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {filteredWines.map((wine) => {
            const cartItem = cart.find(item => item.wineId === wine.id);
            const availableStock = wine.stock - (cartItem?.quantity || 0);

            return (
              <button 
                key={wine.id}
                onClick={() => addToCart(wine)}
                disabled={availableStock <= 0}
                className={`p-4 bg-white rounded-3xl border border-black/5 text-left transition-all hover:shadow-md hover:-translate-y-1 group ${availableStock <= 0 ? 'opacity-50 grayscale' : ''}`}
              >
                <div className="w-10 h-10 bg-[#F5F5F0] rounded-xl flex items-center justify-center text-[#5A5A40] mb-3 group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                  <WineIcon size={20} />
                </div>
                <p className="font-bold text-sm line-clamp-1">{wine.name}</p>
                <p className="text-xs text-black/40 mb-2">{wine.volume}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-[#5A5A40]">${wine.price.toFixed(2)}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${availableStock < 10 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {availableStock} left
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cart / Checkout */}
      <div className="bg-white rounded-3xl shadow-sm border border-black/5 flex flex-col h-[calc(100vh-12rem)] sticky top-28">
        <div className="p-6 border-b border-black/5">
          <h3 className="text-lg font-serif font-medium">Current Order</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map((item) => (
            <div key={item.wineId} className="flex items-center justify-between group">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.name}</p>
                <p className="text-xs text-black/40">{item.quantity} x ${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-sm">${item.total.toFixed(2)}</p>
                <button onClick={() => removeFromCart(item.wineId)} className="p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-black/20 italic">
              <ShoppingCart size={48} className="mb-2" />
              <p>Cart is empty</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-[#F9F9F7] border-t border-black/5 space-y-4">
          <div className="flex items-center justify-between text-black/40 text-sm">
            <span>Subtotal</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-black/40 text-sm">
            <span>Tax (0%)</span>
            <span>$0.00</span>
          </div>
          <div className="flex items-center justify-between text-xl font-serif font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2">
            {paymentMethods.map((method) => (
              <button 
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`py-3 rounded-xl flex flex-col items-center gap-1 transition-all ${paymentMethod === method.id ? 'bg-[#5A5A40] text-white shadow-md' : 'bg-white border border-black/5 text-black/40 hover:bg-[#F5F5F0]'}`}
              >
                {method.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{method.label}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-[#5A5A40] text-white rounded-2xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-colors disabled:opacity-50 disabled:shadow-none"
          >
            Complete Checkout
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && lastSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowReceipt(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-serif font-bold">Sale Completed!</h3>
                <p className="text-black/40 text-sm">Bill #{lastSale.id.slice(0, 8)}</p>
              </div>

              <div className="space-y-3 border-y border-dashed border-black/10 py-6 mb-6">
                {lastSale.items.map((item: any) => (
                  <div key={item.wineId} className="flex justify-between text-sm">
                    <span className="text-black/60">{item.name} x {item.quantity}</span>
                    <span className="font-bold">${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between text-xl font-bold mb-4">
                <span>Total Paid</span>
                <span>${lastSale.totalAmount.toFixed(2)}</span>
              </div>

              <div className="mb-8">
                <p className="text-[10px] font-bold uppercase tracking-wider text-black/40 mb-2">Change Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map((method) => (
                    <button 
                      key={method.id}
                      onClick={() => {
                        onUpdateSale(lastSale.id, { paymentMethod: method.id });
                        setLastSale({ ...lastSale, paymentMethod: method.id });
                      }}
                      className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${lastSale.paymentMethod === method.id ? 'bg-[#5A5A40] text-white' : 'bg-[#F5F5F0] text-black/40 hover:bg-[#E6E6E6]'}`}
                    >
                      {method.icon}
                      <span className="text-[10px] font-bold">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 py-3 bg-[#F5F5F0] text-black/60 rounded-xl font-bold hover:bg-[#E6E6E6] transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-[#5A5A40] text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  Print
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SalesHistory({ sales, onUpdateSale }: { sales: any[], onUpdateSale: any, key?: any }) {
  const paymentMethods = ['cash', 'card', 'upi'] as const;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-3xl shadow-sm border border-black/5 overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-[#F9F9F7] border-b border-black/5">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40">Date & Time</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40">Bill ID</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40">Items</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40">Method</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-black/40 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {sales.map((sale) => (
              <tr key={sale.id} className="hover:bg-[#F9F9F7] transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-sm">{new Date(sale.timestamp).toLocaleDateString()}</p>
                  <p className="text-xs text-black/40">{new Date(sale.timestamp).toLocaleTimeString()}</p>
                </td>
                <td className="px-6 py-4 font-mono text-xs text-black/40">#{sale.id.slice(0, 8)}</td>
                <td className="px-6 py-4">
                  <p className="text-sm">{sale.items.length} products</p>
                  <p className="text-xs text-black/40 truncate max-w-[200px]">
                    {sale.items.map((i: any) => i.name).join(', ')}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={sale.paymentMethod}
                    onChange={(e) => onUpdateSale(sale.id, { paymentMethod: e.target.value as any })}
                    className="bg-[#F5F5F0] rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 cursor-pointer border-none"
                  >
                    {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 text-right font-bold text-[#5A5A40]">${sale.totalAmount.toLocaleString()}</td>
              </tr>
            ))}
            {sales.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-black/40 italic">
                  No sales history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
