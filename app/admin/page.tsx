'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

interface OrderItem {
  id: string;
  order_number: string;
  customer_name?: string;
  shipping_address: string;
  city: string;
  phone: string;
  total_amount: number;
  shipping_fee: number;
  payment_method: string;
  receipt_url?: string | null;
  status: string;
  created_at: string;
  coupon_code?: string | null;
}

interface ProductItem {
  id: number;
  name: string;
  price: number;
  stock_qty: number;
  category: string;
  is_available: boolean;
  tagline?: string;
  description?: string;
  barcode?: string;
}

type Currency = 'USD' | 'LKR';

const LKR_RATE = 300.0;
const SECRET_KEY = 'thushanmanusha345@gmail.com';

export default function AdminDashboard() {
  // Authentication Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState(false);

  // Core Data
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('inventory');
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  // Currency Pair Toggle
  const [currency, setCurrency] = useState<Currency>('USD');

  // Filters & Previews
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeSlipUrl, setActiveSlipUrl] = useState<string | null>(null);

  // Barcode / Scanner State
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const barcodeBuffer = useRef<string>('');
  const barcodeTimer = useRef<NodeJS.Timeout | null>(null);

  // Edit / Create Product Modal
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState({
    id: 0,
    name: '',
    category: 'Wines',
    price: 25,
    stock_qty: 10,
    tagline: '',
    description: '',
    barcode: '',
  });

  // Verify Key on Load
  useEffect(() => {
    const saved = sessionStorage.getItem('ziel_admin_auth');
    if (saved === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim() === SECRET_KEY) {
      sessionStorage.setItem('ziel_admin_auth', 'true');
      setIsAuthenticated(true);
      setKeyError(false);
    } else {
      setKeyError(true);
      setKeyInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ziel_admin_auth');
    setIsAuthenticated(false);
    setKeyInput('');
  };

  // Handheld Hardware Barcode Scanner Listener
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === 'Enter') {
        if (barcodeBuffer.current.trim().length > 2) {
          handleScannedCode(barcodeBuffer.current.trim());
        }
        barcodeBuffer.current = '';
        return;
      }

      if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
        if (barcodeTimer.current) clearTimeout(barcodeTimer.current);
        barcodeTimer.current = setTimeout(() => {
          barcodeBuffer.current = '';
        }, 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, products]);

  // Load Data
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (ordersData) setOrders(ordersData as OrderItem[]);
      if (productsData) setProducts(productsData as ProductItem[]);
    } catch (err) {
      console.error('Data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Barcode Match Handler
  const handleScannedCode = (code: string) => {
    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode === code) ||
        p.id.toString() === code ||
        p.name.toLowerCase().includes(code.toLowerCase())
    );

    if (matched) {
      handleStockAdjust(matched.id, matched.stock_qty + 1);
      alert(`[BARCODE MATCH] Added +1 to stock for "${matched.name}". New Stock: ${matched.stock_qty + 1}`);
    } else {
      alert(`No product found for barcode: "${code}"`);
    }
  };

  // Webcam QR / Barcode Scanner
  const toggleCameraScanner = async () => {
    if (scannerActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
      setScannerActive(false);
      return;
    }

    setScannerActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert('Camera access denied or unavailable.');
      setScannerActive(false);
    }
  };

  const formatPrice = (usd: number) => {
    if (currency === 'LKR') {
      return `Rs. ${(usd * LKR_RATE).toLocaleString()}`;
    }
    return `$${usd.toFixed(2)}`;
  };

  // Order Status Handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (!error) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Stock Adjustment
  const handleStockAdjust = async (productId: number, newStock: number) => {
    setUpdatingId(productId);
    const validQty = Math.max(0, newStock);
    try {
      const { error } = await supabase.from('products').update({ stock_qty: validQty }).eq('id', productId);
      if (!error) {
        setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock_qty: validQty } : p)));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Product Edit Modal Setup
  const openEditProduct = (p: ProductItem) => {
    setEditingProduct(p);
    setProductForm({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      stock_qty: p.stock_qty,
      tagline: p.tagline || '',
      description: p.description || '',
      barcode: p.barcode || '',
    });
    setIsProductModalOpen(true);
  };

  const openNewProduct = () => {
    setEditingProduct(null);
    setProductForm({
      id: 0,
      name: '',
      category: 'Wines',
      price: 20,
      stock_qty: 10,
      tagline: '',
      description: '',
      barcode: '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    if (editingProduct) {
      // Update Existing
      const { error } = await supabase
        .from('products')
        .update({
          name: productForm.name,
          category: productForm.category,
          price: Number(productForm.price),
          stock_qty: Number(productForm.stock_qty),
          tagline: productForm.tagline,
          description: productForm.description,
          barcode: productForm.barcode || null,
        })
        .eq('id', editingProduct.id);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...productForm } : p))
        );
        setIsProductModalOpen(false);
      }
    } else {
      // Insert New Product
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: productForm.name,
            category: productForm.category,
            price: Number(productForm.price),
            stock_qty: Number(productForm.stock_qty),
            tagline: productForm.tagline,
            description: productForm.description,
            barcode: productForm.barcode || null,
            is_available: true,
          },
        ])
        .select('*')
        .single();

      if (!error && data) {
        setProducts((prev) => [...prev, data]);
        setIsProductModalOpen(false);
      }
    }
  };

  // Toggle Visibility
  const handleToggleAvailable = async (productId: number, current: boolean) => {
    setUpdatingId(productId);
    const { error } = await supabase.from('products').update({ is_available: !current }).eq('id', productId);
    if (!error) {
      setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, is_available: !current } : p)));
    }
    setUpdatingId(null);
  };

  // ==============================================================
  // 1. KEY GATE SCREEN (Shown if not unlocked)
  // ==============================================================
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#141413] text-[#FAF9F5] flex items-center justify-center p-6 select-none font-mono">
        <div className="w-full max-w-sm border border-stone-800 rounded-3xl p-8 bg-stone-900/60 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#C4883A]/20 flex items-center justify-center text-[#C4883A] text-lg font-bold">
              🔒
            </div>
            <h1 className="text-xs uppercase tracking-[0.3em] font-semibold text-stone-300">
              Enter the key
            </h1>
          </div>

          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <input
                type="password"
                required
                autoFocus
                placeholder="••••••••••••••••"
                value={keyInput}
                onChange={(e) => {
                  setKeyInput(e.target.value);
                  setKeyError(false);
                }}
                className={`w-full px-4 py-3 rounded-xl border text-xs bg-stone-950 focus:outline-none transition-colors text-center ${
                  keyError ? 'border-rose-600 text-rose-400' : 'border-stone-700 text-stone-100 focus:border-[#C4883A]'
                }`}
              />
              {keyError && (
                <span className="text-[10px] text-rose-500 block text-center mt-1.5 font-sans">
                  Invalid key entered. Please try again.
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-xs uppercase font-bold tracking-widest bg-[#C4883A] text-black hover:bg-[#d4994d] transition-colors shadow-lg"
            >
              Verify Key
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="text-[10px] text-stone-500 hover:text-stone-300 underline">
              ← Return to Ziel Storefront
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==============================================================
  // 2. UNLOCKED ADMIN OPERATIONS DASHBOARD
  // ==============================================================
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.city.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#141413] text-[#FAF9F5] p-6 sm:p-12 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-800 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4883A] font-semibold">
              Master Control Station
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Ziel Store Administration
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Currency Pair Switcher */}
            <div className="flex items-center bg-stone-900 border border-stone-700 rounded-xl p-0.5 font-mono text-xs">
              <button
                onClick={() => setCurrency('USD')}
                className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${
                  currency === 'USD' ? 'bg-[#C4883A] text-black' : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('LKR')}
                className={`px-3 py-1.5 rounded-lg transition-colors font-bold ${
                  currency === 'LKR' ? 'bg-[#C4883A] text-black' : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                LKR (Rs.)
              </button>
            </div>

            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-xl text-xs font-mono border border-stone-700 bg-stone-900 hover:bg-stone-800 transition-colors"
            >
              Sync Records ↻
            </button>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl text-xs font-mono bg-stone-800 border border-stone-700 text-stone-200 hover:bg-stone-700 transition-colors"
            >
              Storefront ↗
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl text-xs font-mono bg-rose-950/40 border border-rose-800 text-rose-300 hover:bg-rose-900/60 transition-colors font-semibold"
            >
              Sign Out ⎋
            </button>
          </div>
        </div>

        {/* View Switcher Tabs & Quick Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-3">
          <div className="flex space-x-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-lg uppercase tracking-wider transition-all ${
                activeTab === 'inventory'
                  ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Inventory & Products [{products.length}]
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg uppercase tracking-wider transition-all ${
                activeTab === 'orders'
                  ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Customer Orders [{orders.length}]
            </button>
          </div>

          {activeTab === 'inventory' && (
            <div className="flex items-center gap-2">
              <button
                onClick={toggleCameraScanner}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-semibold border transition-colors ${
                  scannerActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                    : 'bg-stone-900 border-stone-700 text-stone-300 hover:bg-stone-800'
                }`}
              >
                📷 {scannerActive ? 'Stop Scanner' : 'Barcode / QR Camera'}
              </button>

              <button
                onClick={openNewProduct}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-[#C4883A] text-black hover:bg-[#d4994d] transition-colors"
              >
                + New Product
              </button>
            </div>
          )}
        </div>

        {/* Camera Scanner Viewport */}
        {scannerActive && (
          <div className="p-4 border border-stone-700 rounded-2xl bg-stone-900/90 max-w-sm mx-auto text-center space-y-3 font-mono text-xs">
            <span className="text-stone-300 uppercase tracking-widest text-[10px]">
              Align product barcode / QR inside viewfinder
            </span>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center">
              <video ref={videoRef} className="w-full h-full object-cover" />
            </div>
            <p className="text-[10px] text-stone-500">
              Handheld USB / Bluetooth scanners can also scan directly at any time.
            </p>
          </div>
        )}

        {/* Manual Barcode Search / Intake Field */}
        {activeTab === 'inventory' && (
          <div className="flex items-center gap-2 max-w-md font-mono text-xs">
            <input
              type="text"
              placeholder="Type or scan barcode/ID to add stock..."
              value={barcodeQuery}
              onChange={(e) => setBarcodeQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleScannedCode(barcodeQuery);
                  setBarcodeQuery('');
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-900 text-stone-200 focus:outline-none focus:border-[#C4883A]"
            />
            <button
              onClick={() => {
                handleScannedCode(barcodeQuery);
                setBarcodeQuery('');
              }}
              className="px-4 py-2.5 rounded-xl font-bold bg-stone-800 hover:bg-stone-700 text-stone-200"
            >
              Intake +1
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-24 text-center font-mono text-xs text-stone-500">
            Fetching records from Supabase...
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* INVENTORY & PRODUCT EDITING VIEW                               */}
            {/* ============================================================== */}
            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className={`p-5 rounded-2xl border bg-stone-900/60 flex flex-col justify-between transition-all ${
                      prod.is_available ? 'border-stone-800' : 'border-rose-900/40 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C4883A] block">
                            {prod.category}
                          </span>
                          <h3 className="font-bold text-base text-stone-100 mt-0.5">{prod.name}</h3>
                          {prod.barcode && (
                            <span className="text-[10px] font-mono text-stone-400 block mt-0.5">
                              Barcode: {prod.barcode}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => openEditProduct(prod)}
                            className="text-[10px] font-mono uppercase px-2 py-0.5 rounded border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleToggleAvailable(prod.id, prod.is_available)}
                            disabled={updatingId === prod.id}
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold transition-colors ${
                              prod.is_available
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}
                          >
                            {prod.is_available ? 'Active' : 'Hidden'}
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between font-mono text-xs">
                        <span className="text-stone-400">Unit Retail Price:</span>
                        <span className="font-bold text-stone-200 text-sm">{formatPrice(prod.price)}</span>
                      </div>
                    </div>

                    {/* Stock Intake Level */}
                    <div className="mt-6 pt-3 border-t border-stone-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-stone-400">Stock Qty:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStockAdjust(prod.id, prod.stock_qty - 1)}
                          disabled={updatingId === prod.id || prod.stock_qty <= 0}
                          className="w-8 h-8 rounded-lg border border-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-800 disabled:opacity-30"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={prod.stock_qty}
                          onChange={(e) => handleStockAdjust(prod.id, parseInt(e.target.value) || 0)}
                          className="w-14 text-center font-mono text-sm font-bold bg-stone-800 rounded-lg py-1 border border-stone-700 text-stone-100"
                        />
                        <button
                          onClick={() => handleStockAdjust(prod.id, prod.stock_qty + 1)}
                          disabled={updatingId === prod.id}
                          className="w-8 h-8 rounded-lg border border-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-800"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ============================================================== */}
            {/* ORDERS TABLE VIEW                                              */}
            {/* ============================================================== */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
                  <input
                    type="text"
                    placeholder="Search order #, city, or phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full sm:w-80 px-4 py-2 rounded-xl border border-stone-700 bg-stone-900 text-stone-200 focus:outline-none focus:border-[#C4883A]"
                  />

                  <div className="flex items-center space-x-2">
                    <span className="text-stone-400">Status:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl border border-stone-700 bg-stone-900 text-stone-200 focus:outline-none"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Dispatched">Dispatched</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                {filteredOrders.length === 0 ? (
                  <div className="p-12 border border-stone-800 rounded-2xl text-center text-xs font-mono text-stone-500">
                    No matching orders found.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-stone-800 rounded-2xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-stone-900 border-b border-stone-800 text-stone-400">
                        <tr>
                          <th className="p-4">Order Ref</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">City</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Total ({currency})</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Deposit Slip</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60 bg-stone-950/40">
                        {filteredOrders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-stone-900/30">
                            <td className="p-4 font-bold text-stone-100">{ord.order_number}</td>
                            <td className="p-4 text-stone-400">
                              {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent'}
                            </td>
                            <td className="p-4 text-stone-300">{ord.city}</td>
                            <td className="p-4 text-stone-400">{ord.phone || 'N/A'}</td>
                            <td className="p-4 font-bold text-[#FAF9F5]">{formatPrice(ord.total_amount)}</td>
                            <td className="p-4 uppercase text-stone-400">{ord.payment_method}</td>
                            <td className="p-4">
                              {ord.receipt_url ? (
                                <button
                                  onClick={() => setActiveSlipUrl(ord.receipt_url || null)}
                                  className="text-[#C4883A] underline font-bold hover:text-amber-300"
                                >
                                  Inspect Slip ↗
                                </button>
                              ) : (
                                <span className="text-stone-600">None</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ord.status === 'Approved'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : ord.status === 'Pending'
                                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                    : 'bg-stone-800 text-stone-300'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <select
                                value={ord.status}
                                onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                                disabled={updatingId === ord.id}
                                className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-2 py-1 focus:outline-none"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Dispatched">Dispatched</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. PRODUCT CREATE / EDIT MODAL                                 */}
      {/* ============================================================== */}
      {isProductModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div
            className="relative max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-stone-100">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-stone-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-stone-400 uppercase text-[10px] mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. King Coconut Wine Reserve"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 uppercase text-[10px] mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                  >
                    <option value="Wines">Wines</option>
                    <option value="Soaps">Soaps</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 uppercase text-[10px] mb-1">Unit Price ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    step="0.5"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 uppercase text-[10px] mb-1">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={productForm.stock_qty}
                    onChange={(e) => setProductForm({ ...productForm, stock_qty: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 uppercase text-[10px] mb-1">Barcode / SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. 79357318"
                    value={productForm.barcode}
                    onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 uppercase text-[10px] mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Batch No. 04 — Reserve"
                  value={productForm.tagline}
                  onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 uppercase text-[10px] mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Artisanal formulation details..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 mt-2 rounded-xl font-bold bg-[#C4883A] text-black hover:bg-[#d4994d] transition-colors uppercase tracking-widest text-xs"
              >
                {editingProduct ? 'Save Product Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. DEPOSIT SLIP PROOF INSPECTOR                                */}
      {/* ============================================================== */}
      {activeSlipUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveSlipUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#C4883A] font-bold">
                Bank Deposit Slip Proof
              </span>
              <button
                onClick={() => setActiveSlipUrl(null)}
                className="text-stone-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-xl bg-black/40 p-2 flex items-center justify-center">
              <img
                src={activeSlipUrl}
                alt="Deposit Slip"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="mt-4 flex justify-between items-center font-mono">
              <a
                href={activeSlipUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs underline text-stone-400 hover:text-white"
              >
                Open in Full Window ↗
              </a>
              <button
                onClick={() => setActiveSlipUrl(null)}
                className="px-4 py-2 rounded-xl text-xs bg-stone-800 hover:bg-stone-700 text-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}