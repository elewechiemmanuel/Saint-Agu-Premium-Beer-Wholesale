import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  BarChart3, 
  LayoutDashboard, 
  LogOut, 
  Plus, 
  Trash2, 
  Search, 
  Printer, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Download, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  X,
  Receipt,
  PlusCircle,
  Phone,
  MapPin
} from 'lucide-react';

const BUSINESS_INFO = {
  name: 'Saint Agu Premium Beer Wholesale',
  shortName: 'Saint Agu Wholesale',
  address: 'No. 19 Musa Amidu Street, Ijegun, Satellite Town',
  phone: '08100431436',
  email: 'sales@saintaguwholesale.com'
};

const INITIAL_PRODUCTS = [
  // International Breweries Plc
  { id: 'ib-1', name: 'Trophy', price: 8800, stock: 120, brewery: 'International Breweries Plc', sku: 'IB-TRP-001' },
  { id: 'ib-2', name: 'Trophy Stout', price: 10000, stock: 85, brewery: 'International Breweries Plc', sku: 'IB-TST-002' },
  { id: 'ib-3', name: 'Trophy Can', price: 16500, stock: 45, brewery: 'International Breweries Plc', sku: 'IB-TCN-003' },
  { id: 'ib-4', name: 'Hero', price: 9000, stock: 150, brewery: 'International Breweries Plc', sku: 'IB-HER-004' },
  { id: 'ib-5', name: 'Budweiser', price: 11500, stock: 90, brewery: 'International Breweries Plc', sku: 'IB-BUD-005' },
  { id: 'ib-6', name: 'Flying Fish', price: 15000, stock: 35, brewery: 'International Breweries Plc', sku: 'IB-FLF-006' },
  { id: 'ib-7', name: 'Castle Lite', price: 10500, stock: 60, brewery: 'International Breweries Plc', sku: 'IB-CST-007' },

  // Nigeria Brewery Plc
  { id: 'nb-1', name: 'Goldberg', price: 9800, stock: 200, brewery: 'Nigeria Brewery Plc', sku: 'NB-GLD-001' },
  { id: 'nb-2', name: 'Goldberg Black', price: 15500, stock: 40, brewery: 'Nigeria Brewery Plc', sku: 'NB-GBLK-002' },
  { id: 'nb-3', name: 'Goldberg Can', price: 16500, stock: 55, brewery: 'Nigeria Brewery Plc', sku: 'NB-GCN-003' },
  { id: 'nb-4', name: 'Star', price: 13500, stock: 110, brewery: 'Nigeria Brewery Plc', sku: 'NB-STR-004' },
  { id: 'nb-5', name: 'Star Radler', price: 15000, stock: 80, brewery: 'Nigeria Brewery Plc', sku: 'NB-SRD-005' },
  { id: 'nb-6', name: 'Life', price: 10000, stock: 180, brewery: 'Nigeria Brewery Plc', sku: 'NB-LFE-006' },
  { id: 'nb-7', name: '33 Extra', price: 10000, stock: 160, brewery: 'Nigeria Brewery Plc', sku: 'NB-33E-007' },
  { id: 'nb-8', name: 'Amstel Malt', price: 15000, stock: 75, brewery: 'Nigeria Brewery Plc', sku: 'NB-AMT-008' },
  { id: 'nb-9', name: 'Maltina', price: 15000, stock: 140, brewery: 'Nigeria Brewery Plc', sku: 'NB-MLT-009' },
  { id: 'nb-10', name: 'Can Maltina', price: 14000, stock: 65, brewery: 'Nigeria Brewery Plc', sku: 'NB-CMT-010' },
  { id: 'nb-11', name: 'Maltina PET', price: 5500, stock: 220, brewery: 'Nigeria Brewery Plc', sku: 'NB-PMT-011' },
  { id: 'nb-12', name: 'Legend', price: 12500, stock: 50, brewery: 'Nigeria Brewery Plc', sku: 'NB-LGD-012' },
  { id: 'nb-13', name: 'Small Heineken', price: 19000, stock: 30, brewery: 'Nigeria Brewery Plc', sku: 'NB-SHNK-013' },
  { id: 'nb-14', name: 'Big Heineken', price: 14900, stock: 45, brewery: 'Nigeria Brewery Plc', sku: 'NB-BHNK-014' },
  { id: 'nb-15', name: 'Amstel Can', price: 14000, stock: 50, brewery: 'Nigeria Brewery Plc', sku: 'NB-ACN-015' },
  { id: 'nb-16', name: 'Fayrouz', price: 14000, stock: 60, brewery: 'Nigeria Brewery Plc', sku: 'NB-FYZ-016' },
  { id: 'nb-17', name: 'Fayrouz Can', price: 14000, stock: 20, brewery: 'Nigeria Brewery Plc', sku: 'NB-FCN-017' },
  { id: 'nb-18', name: 'Tiger', price: 16500, stock: 40, brewery: 'Nigeria Brewery Plc', sku: 'NB-TGR-018' },
  { id: 'nb-19', name: 'Desperados', price: 22000, stock: 25, brewery: 'Nigeria Brewery Plc', sku: 'NB-DSP-019' },
  { id: 'nb-20', name: 'Gulder', price: 12600, stock: 95, brewery: 'Nigeria Brewery Plc', sku: 'NB-GLD-020' },

  // Guinness
  { id: 'gn-1', name: 'Big Stout', price: 24500, stock: 15, brewery: 'Guinness', sku: 'GN-BST-001' },
  { id: 'gn-2', name: 'Medium Stout', price: 19000, stock: 70, brewery: 'Guinness', sku: 'GN-MST-002' },
  { id: 'gn-3', name: 'Small Stout', price: 19400, stock: 110, brewery: 'Guinness', sku: 'GN-SST-003' },
  { id: 'gn-4', name: 'Smirnoff Ice', price: 18000, stock: 50, brewery: 'Guinness', sku: 'GN-SMR-004' },
  { id: 'gn-5', name: 'Malta Guinness', price: 14500, stock: 130, brewery: 'Guinness', sku: 'GN-MGU-005' },
  { id: 'gn-6', name: 'Malta Guinness Can', price: 13500, stock: 85, brewery: 'Guinness', sku: 'GN-MGC-006' }
];

const INITIAL_CUSTOMERS = [
  { id: 'c-1', name: 'Walk-in Customer', phone: '08100431436', address: 'Counter Sale', category: 'Retailer', totalSpent: 0, orderCount: 0 },
  { id: 'c-2', name: 'Alaba Bar & Lounge', phone: '08031234567', address: '12 Old Ojo Rd, Satellite Town', category: 'Wholesale Bar', totalSpent: 420000, orderCount: 5 },
  { id: 'c-3', name: 'Emeka Drinks Depot', phone: '08129876543', address: '4 Musa Amidu St, Ijegun', category: 'Sub-Distributor', totalSpent: 1150000, orderCount: 12 }
];

const INITIAL_SALES = [
  {
    id: 'INV-1001',
    date: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: 'Emeka Drinks Depot',
    customerId: 'c-3',
    cashier: 'Chief Cashier',
    paymentMethod: 'Bank Transfer',
    items: [
      { id: 'nb-1', name: 'Goldberg', price: 9800, qty: 10, total: 98000 },
      { id: 'ib-1', name: 'Trophy', price: 8800, qty: 10, total: 88000 }
    ],
    subtotal: 186000,
    discount: 2000,
    total: 184000,
    amountPaid: 184000,
    change: 0
  }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [sales, setSales] = useState(INITIAL_SALES);
  const [activeTab, setActiveTab] = useState('dashboard');

  // POS State
  const [cart, setCart] = useState([]);
  const [selectedBrewery, setSelectedBrewery] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [posCustomer, setPosCustomer] = useState(INITIAL_CUSTOMERS[0].id);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [posDiscount, setPosDiscount] = useState(0);
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Admin Stock / Price Modals
  const [isReceiveStockOpen, setIsReceiveStockOpen] = useState(false);
  const [isPriceAdjustOpen, setIsPriceAdjustOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [receiveQty, setReceiveQty] = useState('');
  const [receiveSupplier, setReceiveSupplier] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Customer Management Modals
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', address: '', category: 'Retailer' });
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState(null);

  const formatNaira = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'Price Not Set';
    return '₦' + Number(amount).toLocaleString('en-NG');
  };

  const metrics = useMemo(() => {
    const today = new Date().toDateString();
    const todaySales = sales.filter(s => new Date(s.date).toDateString() === today);
    const totalSalesToday = todaySales.reduce((acc, s) => acc + s.total, 0);
    const totalTransactionsToday = todaySales.length;
    const totalStockOnHand = products.reduce((acc, p) => acc + (p.stock || 0), 0);
    const totalInventoryValue = products.reduce((acc, p) => acc + ((p.stock || 0) * (p.price || 0)), 0);
    const lowStockCount = products.filter(p => p.stock < 30).length;

    return { totalSalesToday, totalTransactionsToday, totalStockOnHand, totalInventoryValue, lowStockCount };
  }, [sales, products]);

  const addToCart = (product) => {
    if (!product.price || product.price <= 0) {
      alert(`Cannot add "${product.name}". Selling price is not set!`);
      return;
    }
    if (product.stock <= 0) {
      alert(`"${product.name}" is out of stock!`);
      return;
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        if (existing.qty + 1 > product.stock) {
          alert(`Maximum stock limit of ${product.stock} crates reached!`);
          return prevCart;
        }
        return prevCart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1, total: (item.qty + 1) * item.price } : item);
      } else {
        return [...prevCart, { ...product, qty: 1, total: product.price }];
      }
    });
  };

  const updateCartQty = (id, newQty) => {
    const product = products.find(p => p.id === id);
    if (newQty > product.stock) {
      alert(`Only ${product.stock} crates available in stock.`);
      return;
    }
    if (newQty <= 0) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    setCart(prev => prev.map(item => item.id === id ? { ...item, qty: newQty, total: newQty * item.price } : item));
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const cartTotal = Math.max(0, cartSubtotal - Number(posDiscount || 0));
  const numericPaid = Number(amountPaidInput) || cartTotal;
  const computedChange = Math.max(0, numericPaid - cartTotal);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const customerObj = customers.find(c => c.id === posCustomer) || customers[0];

    const newInvoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString(),
      customerName: customerObj.name,
      customerId: customerObj.id,
      cashier: user?.name || 'Cashier',
      paymentMethod,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: Number(posDiscount || 0),
      total: cartTotal,
      amountPaid: numericPaid,
      change: computedChange
    };

    setProducts(prevProducts => prevProducts.map(p => {
      const cartItem = cart.find(ci => ci.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    }));

    setCustomers(prevCust => prevCust.map(c => {
      if (c.id === customerObj.id) {
        return { ...c, totalSpent: c.totalSpent + cartTotal, orderCount: c.orderCount + 1 };
      }
      return c;
    }));

    setSales(prev => [newInvoice, ...prev]);
    setActiveReceipt(newInvoice);

    setCart([]);
    setPosDiscount(0);
    setAmountPaidInput('');
  };

  const handleStockReceiveSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || !receiveQty || Number(receiveQty) <= 0) return;
    const addedQty = parseInt(receiveQty, 10);
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, stock: p.stock + addedQty } : p));
    setIsReceiveStockOpen(false);
    setSelectedProduct(null);
    setReceiveQty('');
    setReceiveSupplier('');
  };

  const handlePriceAdjustSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct || newPrice === '') return;
    const priceVal = parseFloat(newPrice);
    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? { ...p, price: isNaN(priceVal) ? null : priceVal } : p));
    setIsPriceAdjustOpen(false);
    setSelectedProduct(null);
    setNewPrice('');
  };

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!customerForm.name) return;
    const newCustomer = {
      id: `c-${Date.now()}`,
      name: customerForm.name,
      phone: customerForm.phone || BUSINESS_INFO.phone,
      address: customerForm.address || 'N/A',
      category: customerForm.category || 'Retailer',
      totalSpent: 0,
      orderCount: 0
    };
    setCustomers(prev => [...prev, newCustomer]);
    setCustomerForm({ name: '', phone: '', address: '', category: 'Retailer' });
    setIsCustomerModalOpen(false);
  };

  const handleDeleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
    setDeleteConfirmCustomer(null);
  };

  const exportSalesToCSV = () => {
    const headers = ['Invoice ID', 'Date', 'Customer', 'Cashier', 'Payment Method', 'Subtotal (NGN)', 'Discount (NGN)', 'Total Paid (NGN)'];
    const rows = sales.map(s => [
      s.id,
      new Date(s.date).toLocaleString(),
      `"${s.customerName}"`,
      `"${s.cashier}"`,
      s.paymentMethod,
      s.subtotal,
      s.discount,
      s.total
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Saint_Agu_Sales_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesBrewery = selectedBrewery === 'All' || p.brewery === selectedBrewery;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBrewery && matchesSearch;
    });
  }, [products, selectedBrewery, searchQuery]);

  const thermalPrintStyle = `
    @media print {
      @page {
        size: 58mm auto;
        margin: 0mm;
      }
      body * {
        visibility: hidden !important;
      }
      #receipt-print-area, #receipt-print-area * {
        visibility: visible !important;
      }
      #receipt-print-area {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 58mm !important;
        max-width: 58mm !important;
        padding: 3mm 2mm !important;
        margin: 0 !important;
        background: white !important;
        color: black !important;
        font-family: 'Courier New', Courier, monospace !important;
        font-size: 10px !important;
        line-height: 1.2 !important;
        box-shadow: none !important;
      }
      .no-print {
        display: none !important;
      }
    }
  `;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans antialiased">
        <style>{thermalPrintStyle}</style>
        <div className="max-w-md w-full space-y-6 bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-md relative overflow-hidden">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Building2 className="w-9 h-9 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">{BUSINESS_INFO.shortName}</h1>
              <p className="text-amber-500 font-bold text-xs tracking-wider uppercase mt-1">Wholesale POS & Stock Terminal</p>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl py-2 px-3 inline-flex items-center space-x-2 text-xs font-semibold text-amber-400">
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span>Hotline: {BUSINESS_INFO.phone}</span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
              {BUSINESS_INFO.address}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => setUser({ name: 'Manager (Admin)', role: 'admin' })}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-100 text-sm">Manager / Admin</p>
                  <p className="text-xs text-slate-400">Full control over pricing, stock & reports</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setUser({ name: 'Cashier', role: 'cashier' })}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-100 text-sm">POS Cashier</p>
                  <p className="text-xs text-slate-400">Process sales & print 58mm receipts</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      <style>{thermalPrintStyle}</style>

      {/* Main Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-slate-950" />
              </div>
              <div>
                <h1 className="font-black text-sm sm:text-base text-white tracking-tight">
                  {BUSINESS_INFO.shortName}
                </h1>
                <div className="flex items-center space-x-1.5 text-[11px] text-amber-400 font-bold">
                  <Phone className="w-3 h-3 text-amber-400 shrink-0" />
                  <span>TEL: {BUSINESS_INFO.phone}</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('pos')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeTab === 'pos' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>POS / Sale</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeTab === 'products' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Products & Stock</span>
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                  activeTab === 'customers' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Customers</span>
              </button>

              {user.role === 'admin' && (
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    activeTab === 'reports' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Reports</span>
                </button>
              )}
            </nav>

            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-200">{user.name}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-amber-500/20 capitalize font-mono">
                  {user.role}
                </span>
              </div>
              <button
                onClick={() => setUser(null)}
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Body View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 1: DASHBOARD                                                          */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">{BUSINESS_INFO.name}</h2>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    {BUSINESS_INFO.address}
                  </span>
                  <span className="flex items-center gap-1.5 font-bold text-amber-400">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    Phone: {BUSINESS_INFO.phone}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('pos')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg flex items-center space-x-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Open POS Terminal</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Today Revenue</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-amber-400 mt-2">{formatNaira(metrics.totalSalesToday)}</h3>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Stock Valuation</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mt-2">{formatNaira(metrics.totalInventoryValue)}</h3>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Crates On Hand</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mt-2">{metrics.totalStockOnHand} Crates</h3>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Low Stock Alert</span>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-white mt-2">{metrics.lowStockCount} Items</h3>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 2: POS TERMINAL                                                       */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search beverage name or SKU..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['All', 'International Breweries Plc', 'Nigeria Brewery Plc', 'Guinness'].map((brewery) => (
                    <button
                      key={brewery}
                      onClick={() => setSelectedBrewery(brewery)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        selectedBrewery === brewery ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {brewery === 'International Breweries Plc' ? 'Intl Breweries' : brewery === 'Nigeria Brewery Plc' ? 'Nigeria Brewery' : brewery}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Catalog */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  return (
                    <div
                      key={product.id}
                      onClick={() => !isOutOfStock && addToCart(product)}
                      className={`bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer ${
                        isOutOfStock ? 'border-rose-900/40 opacity-50 cursor-not-allowed' : 'border-slate-800 hover:border-amber-500/50'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-slate-400">{product.sku}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isOutOfStock ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {product.stock} Crates
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-100 text-sm mt-1">{product.name}</h4>
                        <p className="text-[11px] text-slate-400">{product.brewery}</p>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3">
                        <span className="font-black text-amber-400 text-sm">{formatNaira(product.price)}</span>
                        <button
                          disabled={isOutOfStock}
                          className="p-1.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Column */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 sticky top-20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-amber-500" />
                  <span>Wholesale Cart</span>
                </h3>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-xs text-rose-400 flex items-center gap-1 cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {/* Customer Selector */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Select Customer</label>
                <select
                  value={posCustomer}
                  onChange={(e) => setPosCustomer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                  ))}
                </select>
              </div>

              {/* Cart List */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 divide-y divide-slate-800/40">
                {cart.map(item => (
                  <div key={item.id} className="pt-2 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-xs text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-amber-400">{formatNaira(item.price)} / crate</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border border-slate-800 bg-slate-950 rounded-lg">
                        <button onClick={() => updateCartQty(item.id, item.qty - 1)} className="px-2 py-0.5 text-slate-400 hover:text-amber-400 text-xs">-</button>
                        <span className="px-2 text-xs font-bold text-white">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.id, item.qty + 1)} className="px-2 py-0.5 text-slate-400 hover:text-amber-400 text-xs">+</button>
                      </div>

                      <span className="font-bold text-xs text-white min-w-[65px] text-right">
                        {formatNaira(item.total)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Details */}
              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-200">{formatNaira(cartSubtotal)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Discount (₦)</span>
                  <input
                    type="number"
                    value={posDiscount}
                    onChange={(e) => setPosDiscount(e.target.value)}
                    placeholder="0"
                    className="w-24 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right text-xs text-slate-200"
                  />
                </div>

                <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-2">
                  <span>Total Payable</span>
                  <span className="text-base text-amber-400">{formatNaira(cartTotal)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Amount Tendered (₦)</label>
                    <input
                      type="number"
                      value={amountPaidInput}
                      onChange={(e) => setAmountPaidInput(e.target.value)}
                      placeholder={cartTotal.toString()}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Change / Balance</label>
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs font-mono font-bold text-emerald-400">
                      {formatNaira(computedChange)}
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['Cash', 'Bank Transfer', 'POS Terminal'].map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1 text-[10px] font-semibold rounded-lg border cursor-pointer ${
                          paymentMethod === method ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 shadow-lg cursor-pointer ${
                    cart.length > 0 ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Process & Print 58mm Receipt</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 3: PRODUCTS & STOCK                                                   */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Beverage Inventory & Pricing</h2>
                <p className="text-xs text-slate-400">Stock updates and price adjustments.</p>
              </div>
              {user.role === 'admin' && (
                <button
                  onClick={() => { setSelectedProduct(products[0]); setIsReceiveStockOpen(true); }}
                  className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Receive Shipment</span>
                </button>
              )}
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Brewery</th>
                    <th className="p-3 text-right">Stock</th>
                    <th className="p-3 text-right">Selling Price</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-400">{product.sku}</td>
                      <td className="p-3 font-bold text-slate-100">{product.name}</td>
                      <td className="p-3 text-slate-400">{product.brewery}</td>
                      <td className="p-3 text-right font-bold">{product.stock} Crates</td>
                      <td className="p-3 text-right font-bold text-amber-400">{formatNaira(product.price)}</td>
                      <td className="p-3 text-center space-x-2">
                        {user.role === 'admin' ? (
                          <>
                            <button
                              onClick={() => { setSelectedProduct(product); setReceiveQty(''); setIsReceiveStockOpen(true); }}
                              className="px-2 py-1 bg-slate-800 text-amber-400 rounded text-[10px] cursor-pointer"
                            >
                              + Stock
                            </button>
                            <button
                              onClick={() => { setSelectedProduct(product); setNewPrice(product.price || ''); setIsPriceAdjustOpen(true); }}
                              className="px-2 py-1 bg-slate-800 text-blue-400 rounded text-[10px] cursor-pointer"
                            >
                              Edit Price
                            </button>
                          </>
                        ) : (
                          <span className="text-slate-500 text-[10px]">View Only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 4: CUSTOMERS                                                          */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Wholesale Customer Records</h2>
                <p className="text-xs text-slate-400">Manage buyer accounts and phone contacts.</p>
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Customer</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customers.map((cust) => (
                <div key={cust.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400">
                      {cust.category}
                    </span>
                    {cust.id !== 'c-1' && (
                      <button onClick={() => setDeleteConfirmCustomer(cust)} className="text-slate-500 hover:text-rose-400 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-white">{cust.name}</h3>
                  <p className="text-xs text-amber-400 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {cust.phone}
                  </p>
                  <p className="text-xs text-slate-400">{cust.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* -------------------------------------------------------------------------- */}
        {/* TAB 5: REPORTS                                                            */}
        {/* -------------------------------------------------------------------------- */}
        {activeTab === 'reports' && user.role === 'admin' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-slate-900 p-5 rounded-2xl border border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white">Sales & Audit Reports</h2>
                <p className="text-xs text-slate-400">Review transaction ledger and export CSV.</p>
              </div>
              <button
                onClick={exportSalesToCSV}
                className="bg-amber-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV Report</span>
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Date / Time</th>
                    <th className="p-3">Invoice #</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Cashier</th>
                    <th className="p-3">Payment</th>
                    <th className="p-3 text-right">Total Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {sales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono text-slate-400">{new Date(s.date).toLocaleString()}</td>
                      <td className="p-3 font-bold text-slate-200 font-mono">{s.id}</td>
                      <td className="p-3 text-slate-300">{s.customerName}</td>
                      <td className="p-3 text-slate-400">{s.cashier}</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">{s.paymentMethod}</span></td>
                      <td className="p-3 text-right font-bold text-amber-400">{formatNaira(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* -------------------------------------------------------------------------- */}
      {/* MODAL: 58MM THERMAL RECEIPT DISPLAY & PRINTER AREA                        */}
      {/* -------------------------------------------------------------------------- */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 relative no-print shadow-2xl">
            <button
              onClick={() => setActiveReceipt(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <h3 className="font-bold text-white text-sm">Receipt Preview</h3>
              <p className="text-[11px] text-slate-400">Formatted for 58mm Thermal Printers</p>
            </div>

            {/* 58mm Thermal Receipt Printable Component Container */}
            <div className="flex justify-center bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div 
                id="receipt-print-area" 
                className="bg-white text-black font-mono text-[10px] leading-tight p-2 w-[58mm] max-w-[58mm] shadow-md border border-slate-200 rounded-sm"
              >
                {/* Header */}
                <div className="text-center space-y-0.5 border-b border-dashed border-black pb-2 mb-2">
                  <p className="font-bold text-[11px] leading-tight uppercase">{BUSINESS_INFO.name}</p>
                  <p className="text-[9px]">{BUSINESS_INFO.address}</p>
                  <p className="font-bold text-[10px]">TEL: {BUSINESS_INFO.phone}</p>
                  <p className="text-[9px] pt-1">{new Date(activeReceipt.date).toLocaleString()}</p>
                </div>

                {/* Invoice Meta */}
                <div className="border-b border-dashed border-black pb-2 mb-2 space-y-0.5 text-[9px]">
                  <div className="flex justify-between">
                    <span>INVOICE:</span>
                    <span className="font-bold">{activeReceipt.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CUSTOMER:</span>
                    <span className="font-bold truncate max-w-[100px]">{activeReceipt.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>CASHIER:</span>
                    <span>{activeReceipt.cashier}</span>
                  </div>
                </div>

                {/* Items List Header */}
                <div className="border-b border-black pb-1 mb-1 font-bold flex justify-between text-[9px]">
                  <span>ITEM</span>
                  <span>QTYxPRICE</span>
                  <span>TOTAL</span>
                </div>

                {/* Items Row */}
                <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
                  {activeReceipt.items.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <p className="font-bold text-[10px] leading-tight">{item.name}</p>
                      <div className="flex justify-between text-[9px] pl-1">
                        <span>{item.qty} crate{item.qty > 1 && 's'} x ₦{item.price.toLocaleString()}</span>
                        <span className="font-bold">₦{item.total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals Summary */}
                <div className="space-y-1 text-[10px] border-b border-dashed border-black pb-2 mb-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₦{activeReceipt.subtotal.toLocaleString()}</span>
                  </div>
                  {activeReceipt.discount > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-₦{activeReceipt.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-[11px] pt-0.5 border-t border-black">
                    <span>TOTAL:</span>
                    <span>₦{activeReceipt.total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-0.5 text-[9px]">
                    <span>Paid ({activeReceipt.paymentMethod}):</span>
                    <span>₦{(activeReceipt.amountPaid || activeReceipt.total).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[9px]">
                    <span>Change:</span>
                    <span>₦{(activeReceipt.change || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Footer Message */}
                <div className="text-center space-y-1 text-[9px] pt-1">
                  <p className="font-bold">*** THANK YOU FOR YOUR PATRONAGE ***</p>
                  <p>Order Line: {BUSINESS_INFO.phone}</p>
                  <p className="text-[8px]">No refund after crate inspection</p>
                </div>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Printer className="w-4 h-4" />
                <span>Print 58mm Thermal Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Receive Stock */}
      {isReceiveStockOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Stock Shipment Receiving</h3>
              <button onClick={() => setIsReceiveStockOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleStockReceiveSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Product Item</label>
                <select
                  value={selectedProduct.id}
                  onChange={(e) => {
                    const found = products.find(p => p.id === e.target.value);
                    if (found) setSelectedProduct(found);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.brewery}) - Stock: {p.stock} Crates</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Quantity Received (Crates)</label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 50"
                  value={receiveQty}
                  onChange={e => setReceiveQty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsReceiveStockOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl cursor-pointer">Save Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Adjust Price */}
      {isPriceAdjustOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Update Product Price</h3>
              <button onClick={() => setIsPriceAdjustOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePriceAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <p className="text-slate-300 font-bold text-sm">{selectedProduct.name}</p>
                <p className="text-slate-500 text-[11px]">{selectedProduct.brewery}</p>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">New Price per Crate (₦)</label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="e.g. 14000"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-sm font-mono font-bold"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button type="button" onClick={() => setIsPriceAdjustOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl cursor-pointer">Update Price</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Customer */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Register Customer Record</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Customer / Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Satellite Lounge Ltd"
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder={`e.g. ${BUSINESS_INFO.phone}`}
                  value={customerForm.phone}
                  onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Address / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Satellite Town, Lagos"
                  value={customerForm.address}
                  onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3">
                <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl cursor-pointer">Create Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete Customer Confirmation */}
      {deleteConfirmCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 space-y-4 text-center shadow-2xl">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Delete Customer Record?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <span className="text-slate-200 font-bold">{deleteConfirmCustomer.name}</span>?
              </p>
            </div>
            <div className="flex justify-center space-x-2 pt-2">
              <button onClick={() => setDeleteConfirmCustomer(null)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-xl cursor-pointer">Cancel</button>
              <button onClick={() => handleDeleteCustomer(deleteConfirmCustomer.id)} className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}