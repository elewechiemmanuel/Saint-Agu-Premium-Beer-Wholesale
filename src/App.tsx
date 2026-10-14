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
  setDoc,
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
  quantity: number; // Supports fractional numbers like 0.5, 1.5, etc.
}

// Initial seed data for Saint Agu Wholesale
const INITIAL_PRODUCTS = [
  { id: 'prod-01', sku: 'HNK-01', name: 'Heineken Premium Lager (Crate)', brewery: 'Nigerian Breweries', stock: 150, sellingPrice: 35000 },
  { id: 'prod-02', sku: 'GLD-02', name: 'Gulder Lager Beer (Crate)', brewery: 'Nigerian Breweries', stock: 120, sellingPrice: 32000 },
  { id: 'prod-03', sku: 'STR-03', name: 'Star Lager Beer (Crate)', brewery: 'Nigerian Breweries', stock: 200, sellingPrice: 31000 },
  { id: 'prod-04', sku: 'GNS-04', name: 'Guinness Foreign Extra Stout (Crate)', brewery: 'Guinness Nigeria', stock: 95, sellingPrice: 38000 },
  { id: 'prod-05', sku: 'LGD-05', name: 'Legend Extra Stout (Crate)', brewery: 'Guinness Nigeria', stock: 80, sellingPrice: 29500 },
  { id: 'prod-06', sku: 'HRO-06', name: 'Hero Premium Lager (Crate)', brewery: 'International Breweries', stock: 140, sellingPrice: 29000 },
  { id: 'prod-07', sku: 'TRP-07', name: 'Trophy Extra Special Stout (Crate)', brewery: 'International Breweries', stock: 110, sellingPrice: 29500 },
  { id: 'prod-08', sku: 'BDW-08', name: 'Budweiser Lager Beer (Crate)', brewery: 'International Breweries', stock: 75, sellingPrice: 36000 }
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Login form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // App UI & POS states
  const [activeTab, setActiveTab] = useState<'pos' | 'inventory'>('pos');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');
  const [seeding, setSeeding] = useState(false);

  // Function to seed products into Firestore
  const seedDatabase = async () => {
    try {
      setSeeding(true);
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach((prod) => {
        const docRef = doc(db, 'products', prod.id);
        batch.set(docRef, prod, { merge: true });
      });
      await batch.commit();
      setCheckoutSuccess('Catalog seeded successfully with wholesale products!');
      setTimeout(() => setCheckoutSuccess(''), 4000);
    } catch (err) {
      console.error('Error seeding database:', err);
    } finally {
      setSeeding(false);
    }
  };

  // 1. Listen for user authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role || 'cashier');
          } else {
            setUserRole('cashier');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole('cashier');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Subscribe to real-time products collection and auto-seed if empty
  useEffect(() => {
    if (!user) return;
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const items: Product[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      })) as Product[];
      
      // Auto-seed if collection is completely empty
      if (items.length === 0) {
        seedDatabase();
      } else {
        setProducts(items);
      }
    });

    return () => unsubProducts();
  }, [user]);

  // Handle Login submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setLoginError('Invalid email or password. Please try again.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    signOut(auth);
  };

  // POS Cart Functions
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

  // Allow fractional quantities (0.5, 1.5, 0.25, etc.)
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

  // Submit POS Checkout to Firestore
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    try {
      await addDoc(collection(db, 'sales'), {
        cashierEmail: user?.email,
        customerName: customerName || 'Walk-in Customer',
        items: cart.map((i) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.sellingPrice,
          totalPrice: i.sellingPrice * i.quantity
        })),
        grandTotal: calculateTotal(),
        createdAt: serverTimestamp()
      });

      setCheckoutSuccess('Transaction completed successfully!');
      setCart([]);
      setCustomerName('');
      setTimeout(() => setCheckoutSuccess(''), 4000);
    } catch (err) {
      console.error('Error logging transaction:', err);
      alert('Failed to complete transaction. Please check connection/permissions.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-lg font-medium">Loading Saint Agu Wholesale System...</p>
      </div>
    );
  }

  // 1. LOGIN SCREEN
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
                placeholder="admin@saintagu.com"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
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
                className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none font-medium"
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

  // 2. MAIN DASHBOARD & POS TERMINAL SCREEN
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navigation Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-sm gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Saint Agu Premium Beer Wholesale</h1>
          <p className="text-xs text-slate-500">
            Role: <span className="font-semibold uppercase text-blue-600">{userRole}</span> ({user.email})
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
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
        </div>

        <button 
          onClick={handleLogout}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          Sign Out
        </button>
      </header>

      {/* Main Container */}
      <main className="p-6 max-w-7xl mx-auto">
        {checkoutSuccess && (
          <div className="mb-4 bg-emerald-100 text-emerald-800 border border-emerald-300 p-4 rounded-xl text-center font-semibold">
            {checkoutSuccess}
          </div>
        )}

        {activeTab === 'pos' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Products Selection List */}
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

            {/* POS Cart & Checkout */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-4">Current Order / Cart</h2>

                {cart.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    Cart is empty. Click "+ Add to Sale" on any drink.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
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

                        {/* Fractional Quantity Input & Quick Buttons */}
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
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-center text-sm bg-white font-bold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                          </div>

                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, '0.5')}
                              className="px-2 py-1 text-xs font-semibold bg-slate-200 hover:bg-blue-600 hover:text-white rounded text-slate-800"
                            >
                              1/2
                            </button>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(item.id, '1')}
                              className="px-2 py-1 text-xs font-semibold bg-slate-200 hover:bg-blue-600 hover:text-white rounded text-slate-800"
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

              {/* Order Summary & Customer Name */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Buyer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Walk-in Customer"
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-sm text-slate-900 bg-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div className="flex justify-between items-center mb-4">
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
        ) : (
          /* Inventory Table View */
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Beverage Inventory & Pricing</h2>
                <p className="text-xs text-slate-500">Stock levels and selling price catalogue.</p>
              </div>
              {userRole === 'admin' && (
                <button
                  onClick={seedDatabase}
                  disabled={seeding}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow transition"
                >
                  {seeding ? 'Seeding...' : '⚡ Seed Default Products'}
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-xs text-slate-500 font-semibold uppercase">
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4">Brewery</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Selling Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">{prod.sku}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{prod.name}</td>
                      <td className="py-3 px-4 text-slate-500">{prod.brewery}</td>
                      <td className="py-3 px-4 font-bold text-slate-700">{prod.stock} Crates</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">₦{(prod.sellingPrice || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}