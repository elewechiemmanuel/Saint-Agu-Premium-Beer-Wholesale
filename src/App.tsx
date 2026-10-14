import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc,
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';

interface Product {
  id: string;
  sku: string;
  name: string;
  brewery: string;
  stock: number;
  sellingPrice: number;
}

interface CartItem extends Product {
  quantity: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface Sale {
  id: string;
  receiptNumber?: string;
  cashierEmail?: string;
  cashierName?: string;
  customerName?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'POS';
  items: {
    id: string;
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  grandTotal: number;
  formattedDate?: string;
  createdAt: any;
}

const INITIAL_PRODUCTS = [
  { id: 'prod-01', sku: 'HNK-01', name: 'Heineken Premium Lager (Crate)', brewery: 'Nigerian Breweries', stock: 150, sellingPrice: 35000 },
  { id: 'prod-02', sku: 'GLD-02', name: 'Gulder Lager Beer (Crate)', brewery: 'Nigerian Breweries', stock: 120, sellingPrice: 32000 },
  { id: 'prod-03', sku: 'STR-03', name: 'Star Lager Beer (Crate)', brewery: 'Nigerian Breweries', stock: 200, sellingPrice: 31000 },
  { id: 'prod-04', sku: 'GNS-04', name: 'Guinness Foreign Extra Stout (Crate)', brewery: 'Guinness Nigeria', stock: 95, sellingPrice: 38000 },
  { id: 'prod-05', sku: 'LGD-05', name: 'Legend Extra Stout (Crate)', brewery: 'Nigerian Breweries', stock: 80, sellingPrice: 29500 },
  { id: 'prod-06', sku: 'HRO-06', name: 'Hero Premium Lager (Crate)', brewery: 'International Breweries', stock: 140, sellingPrice: 29000 },
  { id: 'prod-07', sku: 'TRP-07', name: 'Trophy Extra Special Stout (Crate)', brewery: 'International Breweries', stock: 110, sellingPrice: 29500 },
  { id: 'prod-08', sku: 'BDW-08', name: 'Budweiser Lager Beer (Crate)', brewery: 'International Breweries', stock: 75, sellingPrice: 36000 }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // UI Navigation
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory' | 'customers' | 'reports'>('pos');
  
  // Firestore collections
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // POS states
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'POS'>('Cash');
  const [seeding, setSeeding] = useState(false);

  // Completed Receipt Modal State
  const [completedSale, setCompletedSale] = useState<any | null>(null);

  // New Product state
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newBrewery, setNewBrewery] = useState('');
  const [newStock, setNewStock] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // New Customer state
  const [custNameInput, setCustNameInput] = useState('');
  const [custPhoneInput, setCustPhoneInput] = useState('');
  const [custEmailInput, setCustEmailInput] = useState('');
  const [custAddressInput, setCustAddressInput] = useState('');

  // Editing price state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editPriceValue, setEditPriceValue] = useState('');

  const seedDatabase = async () => {
    try {
      setSeeding(true);
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach((prod) => {
        const docRef = doc(db, 'products', prod.id);
        batch.set(docRef, prod, { merge: true });
      });
      await batch.commit();
    } catch (err) {
      console.error('Error seeding database:', err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'user');
          } else {
            setUserRole('user');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('user');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items: Product[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Product[];
      
      if (items.length === 0 && userRole === 'admin') {
        seedDatabase();
      } else {
        setProducts(items);
      }
    }, (error) => {
      console.error("Error fetching products:", error);
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const custs: Customer[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Customer[];
      setCustomers(custs);
    }, (error) => {
      console.error("Error fetching customers:", error);
    });

    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const salesData: Sale[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Sale[];
      salesData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setSales(salesData);
    }, (error) => {
      console.error("Error fetching sales:", error);
    });

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubSales();
    };
  }, [user, userRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError('Invalid email or password. Please try again.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleQuantityChange = (id: string, value: string) => {
    const parsedQty = parseFloat(value);
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: isNaN(parsedQty) ? 0 : parsedQty }
          : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const receiptNum = `RCPT-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date();

    const saleRecord = {
      receiptNumber: receiptNum,
      cashierName: userRole === 'admin' ? 'Super Admin' : (user?.email?.split('@')[0] || 'Cashier'),
      cashierEmail: user?.email || 'sales@saintagu.com',
      customerName: customerName || 'Walk-in Customer',
      paymentMethod: paymentMethod,
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.sellingPrice,
        totalPrice: i.sellingPrice * i.quantity
      })),
      grandTotal: calculateTotal(),
      formattedDate: `${now.toLocaleDateString()}, ${now.toLocaleTimeString()}`
    };

    try {
      await addDoc(collection(db, 'sales'), {
        ...saleRecord,
        createdAt: serverTimestamp()
      });

      setCompletedSale(saleRecord);
      setCart([]);
      setCustomerName('');
      setPaymentMethod('Cash');
    } catch (err) {
      console.error('Error completing sale:', err);
      alert('Failed to complete sale. Please check connection/permissions.');
    }
  };

  const print58mmReceipt = () => {
    if (!completedSale) return;

    const printWindow = window.open('', '_blank', 'width=380,height=650');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${completedSale.receiptNumber || 'RCPT'}</title>
          <style>
            @page { size: 58mm auto; margin: 0; }
            body {
              width: 58mm;
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              color: #000;
              margin: 0;
              padding: 4px;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
            table { width: 100%; border-collapse: collapse; margin: 4px 0; }
            th, td { text-align: left; padding: 2px 0; font-size: 11px; }
            .right { text-align: right; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="center bold" style="font-size: 12px;">SAINT AGU PREMIUM BEER WHOLESALE</div>
          <div class="center" style="font-size: 10px;">No. 19 Musa Amidu Street, Ijegun</div>
          <div class="center" style="font-size: 10px;">Tel: 08100431436</div>
          <div class="line"></div>
          <div>Date: <span style="float: right;">${completedSale.formattedDate}</span></div>
          <div>Receipt: <span style="float: right;">${completedSale.receiptNumber}</span></div>
          <div>Cashier: <span style="float: right;">${completedSale.cashierName}</span></div>
          <div class="line"></div>
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">Item</th>
                <th style="width: 15%;" class="center">Qty</th>
                <th style="width: 22%;" class="right">Price</th>
                <th style="width: 23%;" class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${completedSale.items.map((item: any) => `
                <tr>
                  <td>\${item.name}</td>
                  <td class="center">\${item.quantity}</td>
                  <td class="right">\${item.unitPrice.toLocaleString()}</td>
                  <td class="right">\${item.totalPrice.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="line"></div>
          <div>Total: <span style="float: right; font-weight: bold;">₦${completedSale.grandTotal.toLocaleString()}</span></div>
          <div>Paid (${completedSale.paymentMethod}): <span style="float: right;">₦${completedSale.grandTotal.toLocaleString()}</span></div>
          <div>Change: <span style="float: right;">₦0</span></div>
          <div class="line"></div>
          <div class="center" style="margin-top: 8px;">Thank you for your patronage!</div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    try {
      await addDoc(collection(db, 'products'), {
        sku: newSku || `SKU-${Date.now().toString().slice(-4)}`,
        name: newName,
        brewery: newBrewery || 'General Supplier',
        stock: parseFloat(newStock) || 0,
        sellingPrice: parseFloat(newPrice) || 0
      });

      setNewSku('');
      setNewName('');
      setNewBrewery('');
      setNewStock('');
      setNewPrice('');
      alert('Product added successfully!');
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Permission denied or failed to add product.');
    }
  };

  const handleUpdatePrice = async (productId: string) => {
    const updatedPrice = parseFloat(editPriceValue);
    if (isNaN(updatedPrice) || updatedPrice <= 0) return;

    try {
      await updateDoc(doc(db, 'products', productId), {
        sellingPrice: updatedPrice
      });
      setEditingPriceId(null);
      setEditPriceValue('');
    } catch (err) {
      console.error('Error updating price:', err);
      alert('Permission denied.');
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custNameInput || !custPhoneInput) return;

    try {
      await addDoc(collection(db, 'customers'), {
        name: custNameInput,
        phone: custPhoneInput,
        email: custEmailInput || '',
        address: custAddressInput || '',
        createdAt: serverTimestamp()
      });

      setCustNameInput('');
      setCustPhoneInput('');
      setCustEmailInput('');
      setCustAddressInput('');
      alert('Customer created successfully!');
    } catch (err) {
      console.error('Error adding customer:', err);
      alert('Failed to add customer.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-lg font-medium">Loading Saint Agu Wholesale System...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Saint Agu Wholesale</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to access POS & Inventory</p>
          </div>

          {loginError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sales@saintagu.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition shadow-md"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Saint Agu Premium Beer Wholesale</h1>
          <p className="text-xs text-slate-500">
            Role: <span className="font-semibold uppercase text-blue-600">{userRole}</span> ({user.email})
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'pos' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            POS / Sale
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'inventory' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Products & Stock
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'customers' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Customers
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
              activeTab === 'reports' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Reports
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Sign Out
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {activeTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">Beverage Catalog</h2>
                {userRole === 'admin' && (
                  <button
                    onClick={seedDatabase}
                    disabled={seeding}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow transition"
                  >
                    {seeding ? 'Seeding...' : '⚡ Seed Catalog Items'}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.length === 0 ? (
                  <p className="text-sm text-slate-500 col-span-2">Loading catalog or seeding initial inventory...</p>
                ) : (
                  products.map((product) => (
                    <div 
                      key={product.id}
                      className="border border-slate-200 rounded-lg p-4 flex flex-col justify-between hover:border-blue-500 transition"
                    >
                      <div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{product.sku}</span>
                        <h3 className="font-bold text-slate-800 mt-1">{product.name}</h3>
                        <p className="text-xs text-slate-500">{product.brewery}</p>
                        <p className="text-sm font-bold text-slate-900 mt-2">
                          ₦{(product.sellingPrice || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">/ Crate</span>
                        </p>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-3 w-full bg-slate-900 hover:bg-blue-600 text-white text-xs font-medium py-2 rounded transition"
                      >
                        + Add to Sale
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Current Order / Cart</h2>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Buyer Name</label>
                  <input
                    type="text"
                    list="customer-list"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer or Select..."
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                  />
                  <datalist id="customer-list">
                    {customers.map((c) => (
                      <option key={c.id} value={c.name}>{c.phone ? `${c.name} (${c.phone})` : c.name}</option>
                    ))}
                  </datalist>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">
                    Cart is empty. Click "+ Add to Sale" on any drink.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.id} className="border-b border-slate-100 pb-3 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-slate-800 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400">₦{item.sellingPrice.toLocaleString()} per unit</p>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 bg-slate-50 p-2 rounded-lg">
                          <div className="flex items-center gap-1">
                            <label className="text-xs font-medium text-slate-500">Qty:</label>
                            <input
                              type="number"
                              step="any"
                              min="0.01"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              placeholder="0.5"
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-center text-sm font-bold text-slate-900"
                            />
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, '0.5')}
                              className="px-2 py-1 text-xs font-semibold bg-slate-200 hover:bg-blue-600 hover:text-white rounded"
                            >
                              1/2
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, '1')}
                              className="px-2 py-1 text-xs font-semibold bg-slate-200 hover:bg-blue-600 hover:text-white rounded"
                            >
                              1
                            </button>
                          </div>

                          <span className="text-sm font-bold text-slate-900">
                            ₦{(item.sellingPrice * item.quantity || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-4 mt-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Cash', 'Bank Transfer', 'POS'] as const).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-1.5 px-2 rounded text-xs font-bold border transition ${
                          paymentMethod === method
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-slate-600">Grand Total:</span>
                  <span className="text-xl font-extrabold text-emerald-600">
                    ₦{calculateTotal().toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition shadow-md"
                >
                  Complete Checkout
                </button>
              </div>
            </div>
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            {userRole === 'admin' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Add New Product to Inventory</h2>
                <form onSubmit={handleAddProduct} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">SKU Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HNK-09"
                      value={newSku}
                      onChange={(e) => setNewSku(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Amstel Malta (Crate)"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Brewery / Supplier</label>
                    <input
                      type="text"
                      placeholder="e.g. Nigerian Breweries"
                      value={newBrewery}
                      onChange={(e) => setNewBrewery(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Selling Price (₦) *</label>
                    <input
                      type="number"
                      required
                      placeholder="30000"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-5 flex justify-end">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition shadow-sm text-sm"
                    >
                      + Add Product
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Beverage Inventory & Price Control</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-xs text-slate-500 font-semibold uppercase">
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Product Name</th>
                      <th className="py-3 px-4">Brewery</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Selling Price</th>
                      {userRole === 'admin' && <th className="py-3 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">{prod.sku}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{prod.name}</td>
                        <td className="py-3 px-4 text-slate-500">{prod.brewery}</td>
                        <td className="py-3 px-4 font-bold text-slate-700">{prod.stock} Units</td>
                        <td className="py-3 px-4 font-bold text-emerald-600">
                          {editingPriceId === prod.id && userRole === 'admin' ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editPriceValue}
                                onChange={(e) => setEditPriceValue(e.target.value)}
                                className="w-28 px-2 py-1 border border-blue-500 rounded text-sm text-slate-900 bg-white font-bold"
                              />
                              <button
                                onClick={() => handleUpdatePrice(prod.id)}
                                className="bg-emerald-600 text-white text-xs px-2 py-1 rounded font-bold hover:bg-emerald-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingPriceId(null)}
                                className="bg-slate-200 text-slate-700 text-xs px-2 py-1 rounded font-bold hover:bg-slate-300"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            `₦${(prod.sellingPrice || 0).toLocaleString()}`
                          )}
                        </td>
                        {userRole === 'admin' && (
                          <td className="py-3 px-4 text-right">
                            {editingPriceId !== prod.id && (
                              <button
                                onClick={() => {
                                  setEditingPriceId(prod.id);
                                  setEditPriceValue(prod.sellingPrice.toString());
                                }}
                                className="bg-slate-100 hover:bg-blue-50 text-blue-600 text-xs font-bold py-1 px-3 rounded border border-slate-200 transition"
                              >
                                ✎ Edit Price
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Register New Customer</h2>
              <form onSubmit={handleAddCustomer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Customer / Business Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chief Okonkwo Stores"
                    value={custNameInput}
                    onChange={(e) => setCustNameInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 08031234567"
                    value={custPhoneInput}
                    onChange={(e) => setCustPhoneInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="customer@gmail.com"
                    value={custEmailInput}
                    onChange={(e) => setCustEmailInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Market Road, Onitsha"
                    value={custAddressInput}
                    onChange={(e) => setCustAddressInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded text-sm text-slate-900 bg-white"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition shadow-sm text-sm"
                  >
                    + Register Customer
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Registered Wholesale Customers</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-xs text-slate-500 font-semibold uppercase">
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {customers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400 text-sm">
                          No customers registered yet.
                        </td>
                      </tr>
                    ) : (
                      customers.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-700">{c.phone}</td>
                          <td className="py-3 px-4 text-slate-500">{c.email || 'N/A'}</td>
                          <td className="py-3 px-4 text-slate-500">{c.address || 'N/A'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Revenue</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  ₦{sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Transactions</p>
                <p className="text-2xl font-black text-blue-600 mt-1">{sales.length}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase">Average Order Value</p>
                <p className="text-2xl font-black text-purple-600 mt-1">
                  ₦{sales.length > 0 
                    ? Math.round(sales.reduce((sum, s) => sum + (s.grandTotal || 0), 0) / sales.length).toLocaleString() 
                    : 0}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Detailed Sales Log</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50 text-xs text-slate-500 font-semibold uppercase">
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Items Sold & Qty</th>
                      <th className="py-3 px-4">Cashier</th>
                      <th className="py-3 px-4 text-right">Grand Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {sales.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                          No sales transactions logged yet.
                        </td>
                      </tr>
                    ) : (
                      sales.map((sale) => {
                        let dateStr = 'Recent';
                        let timeStr = '';
                        if (sale.formattedDate && sale.formattedDate.includes(',')) {
                          const parts = sale.formattedDate.split(',');
                          dateStr = parts[0];
                          timeStr = parts[1];
                        } else if (sale.createdAt?.seconds) {
                          const d = new Date(sale.createdAt.seconds * 1000);
                          dateStr = d.toLocaleDateString();
                          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }

                        return (
                          <tr key={sale.id} className="hover:bg-slate-50 align-top">
                            <td className="py-3 px-4 text-xs font-medium text-slate-600">
                              <div className="font-bold text-slate-800">{dateStr}</div>
                              <div className="text-slate-400">{timeStr}</div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-800">{sale.customerName || 'Walk-in Customer'}</td>
                            <td className="py-3 px-4">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                sale.paymentMethod === 'Bank Transfer'
                                  ? 'bg-purple-100 text-purple-700'
                                  : sale.paymentMethod === 'POS'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}>
                                {sale.paymentMethod || 'Cash'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <ul className="space-y-1 text-xs">
                                {sale.items?.map((item, idx) => (
                                  <li key={idx} className="text-slate-700">
                                    <span className="font-bold text-slate-900">{item.quantity}x</span> {item.name} 
                                    <span className="text-slate-400"> (@ ₦{(item.unitPrice || 0).toLocaleString()})</span>
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="py-3 px-4 text-xs text-slate-500">{sale.cashierEmail || 'Admin'}</td>
                            <td className="py-3 px-4 text-right font-extrabold text-emerald-600">
                              ₦{(sale.grandTotal || 0).toLocaleString()}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {completedSale && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm text-slate-800 font-mono text-xs">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl font-bold">
                ✓
              </div>
              <h2 className="text-lg font-bold font-sans text-slate-900">Sale Completed</h2>
              <p className="text-xs text-slate-400 font-sans">Receipt #{completedSale.receiptNumber}</p>
            </div>

            <div className="border-t border-slate-800 my-3"></div>

            <div className="text-center font-bold text-slate-900 text-xs uppercase mb-1">
              SAINT AGU PREMIUM BEER WHOLESALE
            </div>
            <div className="text-center text-slate-600 text-[11px] leading-tight">
              No. 19 Musa Amidu Street, Ijegun<br />
              Tel: 08100431436
            </div>

            <div className="space-y-1 my-3 text-[11px]">
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-semibold">{completedSale.formattedDate}</span>
              </div>
              <div className="flex justify-between">
                <span>Receipt:</span>
                <span className="font-semibold">{completedSale.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Cashier:</span>
                <span className="font-semibold">{completedSale.cashierName}</span>
              </div>
            </div>

            <table className="w-full text-left my-2 border-collapse text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-900 font-bold">
                  <th className="py-1">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Price</th>
                  <th className="py-1 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedSale.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1 font-medium">{item.name}</td>
                    <td className="py-1 text-center">{item.quantity}</td>
                    <td className="py-1 text-right">{item.unitPrice.toLocaleString()}</td>
                    <td className="py-1 text-right font-semibold">{item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 border-t border-slate-200 pt-2 my-2 text-[11px]">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Total:</span>
                <span>₦{completedSale.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Paid ({completedSale.paymentMethod}):</span>
                <span>₦{completedSale.grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Change:</span>
                <span>₦0</span>
              </div>
            </div>

            <div className="text-center text-slate-600 my-4 text-[11px]">
              Thank you for your patronage!
            </div>

            <div className="border-t border-slate-800 mb-5"></div>

            <div className="flex gap-3 font-sans">
              <button
                type="button"
                onClick={print58mmReceipt}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-lg transition text-xs flex items-center justify-center gap-1.5 shadow"
              >
                🖨️ Print
              </button>
              <button
                type="button"
                onClick={() => setCompletedSale(null)}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-lg transition text-xs shadow"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}