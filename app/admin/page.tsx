'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Secret admin authentication token
const ADMIN_SECRET_KEY = 'thushanmanusha345@gmail.com';

type Currency = 'USD' | 'LKR' | 'EUR' | 'GBP';

interface CurrencyConfig {
  symbol: string;
  rate: number;
  decimals: number;
}

const CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: { symbol: '$', rate: 1.0, decimals: 2 },
  LKR: { symbol: 'Rs. ', rate: 300.0, decimals: 0 },
  EUR: { symbol: '€', rate: 0.92, decimals: 2 },
  GBP: { symbol: '£', rate: 0.78, decimals: 2 },
};

interface OrderItem {
  id: string;
  order_number: string;
  shipping_address: string;
  city: string;
  phone: string;
  total_amount: number;
  payment_method: string;
  receipt_url?: string | null;
  status: string;
  created_at: string;
}

interface ProductItem {
  id: number;
  name: string;
  price: number;
  stock_qty: number;
  category: string;
  is_available: boolean;
  tagline?: string;
}

export default function AdminDashboard() {
  // 1. Security Gatekeeper State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState('');
  const [keyError, setKeyError] = useState(false);

  // 2. Dashboard State
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  // Filters & Modal Previews
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [activeSlipUrl, setActiveSlipUrl] = useState<string | null>(null);

  // Stock Inbound Input Map
  const [stockAddAmount, setStockAddAmount] = useState<Record<number, number>>({});

  // QR / Barcode Scanner Modal State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [barcodeInputManual, setBarcodeInputManual] = useState('');
  const [scannerFeedback, setScannerFeedback] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Check persistent session on mount
  useEffect(() => {
    const savedSession = sessionStorage.getItem('ziel_admin_authenticated');
    if (savedSession === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch Supabase data once authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyInput.trim() === ADMIN_SECRET_KEY) {
      setIsAuthenticated(true);
      sessionStorage.setItem('ziel_admin_authenticated', 'true');
      setKeyError(false);
    } else {
      setKeyError(true);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('ziel_admin_authenticated');
    setIsAuthenticated(false);
    setKeyInput('');
  };

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
      console.error('Failed to load dashboard records:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amountUsd: number) => {
    const { symbol, rate, decimals } = CURRENCIES[currency];
    const converted = amountUsd * rate;
    return `${symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}`;
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (!error) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Error updating order:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Direct manual stock delta increment
  const handleAddStockAmount = async (productId: number) => {
    const amountToAdd = stockAddAmount[productId] || 0;
    if (amountToAdd <= 0) return;

    const currentProd = products.find((p) => p.id === productId);
    if (!currentProd) return;

    const newStock = currentProd.stock_qty + amountToAdd;
    setUpdatingId(productId);

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_qty: newStock })
        .eq('id', productId);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock_qty: newStock } : p))
        );
        setStockAddAmount((prev) => ({ ...prev, [productId]: 0 }));
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Scan match handler (by ID or exact product name match)
  const handleScannedCode = async (decodedText: string) => {
    const trimmed = decodedText.trim();
    const matchedProduct = products.find(
      (p) => String(p.id) === trimmed || p.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (matchedProduct) {
      const updatedStock = matchedProduct.stock_qty + 1;
      const { error } = await supabase
        .from('products')
        .update({ stock_qty: updatedStock })
        .eq('id', matchedProduct.id);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === matchedProduct.id ? { ...p, stock_qty: updatedStock } : p))
        );
        setScannerFeedback(`✓ Stock updated: +1 for ${matchedProduct.name} (Now: ${updatedStock})`);
      }
    } else {
      setScannerFeedback(`⚠️ Code "${trimmed}" not mapped to any known product ID.`);
    }
  };

  // Launch camera scanner inside modal
  useEffect(() => {
    if (isScannerOpen) {
      setScannerFeedback(null);
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 240, height: 240 } },
        false
      );

      scanner.render(
        (decodedText) => {
          handleScannedCode(decodedText);
        },
        (error) => {
          // scanner scanning pass
        }
      );

      scannerRef.current = scanner;

      return () => {
        scanner.clear().catch((e) => console.error(e));
      };
    }
  }, [isScannerOpen, products]);

  // =========================================================================
  // 1. KEY GATEKEEPER VIEW
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#141413] text-[#FAF9F5] flex items-center justify-center p-6 select-none font-mono">
        <div className="w-full max-w-sm bg-stone-900 border border-stone-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-800 border border-stone-700 flex items-center justify-center mx-auto text-xl">
            🔒
          </div>

          <div>
            <h2 className="text-sm uppercase tracking-[0.25em] text-stone-300 font-bold">
              Enter the key
            </h2>
            {keyError && (
              <p className="text-xs text-rose-500 mt-2 font-sans font-medium animate-shake">
                Incorrect key. Access denied.
              </p>
            )}
          </div>

          <form onSubmit={handleKeySubmit} className="space-y-4">
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
              className="w-full px-4 py-3 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 text-center tracking-widest text-sm focus:outline-none focus:border-[#C4883A]"
            />

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl font-bold bg-[#C4883A] text-black hover:bg-[#d4994d] transition-colors uppercase tracking-widest text-xs"
            >
              Verify & Enter
            </button>
          </form>

          <Link href="/" className="inline-block text-[11px] text-stone-500 hover:text-stone-300 underline">
            Return to Storefront
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED ADMIN DASHBOARD VIEW
  // =========================================================================
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
        
        {/* Top Header Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-stone-800 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4883A] font-semibold">
              Internal Control Station
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Ziel Store Operations
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Currency Selector */}
            <div className="flex items-center space-x-1.5 bg-stone-900 border border-stone-800 rounded-xl px-3 py-1.5 font-mono text-xs">
              <span className="text-stone-500 text-[10px] uppercase">Currency:</span>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent text-[#FAF9F5] font-bold focus:outline-none cursor-pointer"
              >
                <option value="USD" className="bg-stone-900">USD ($)</option>
                <option value="LKR" className="bg-stone-900">LKR (Rs.)</option>
                <option value="EUR" className="bg-stone-900">EUR (€)</option>
                <option value="GBP" className="bg-stone-900">GBP (£)</option>
              </select>
            </div>

            {/* Barcode/QR Scanner Trigger */}
            <button
              onClick={() => setIsScannerOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-mono font-bold border border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center space-x-2"
            >
              <span>📷</span>
              <span>Scan Barcode/QR</span>
            </button>

            <button
              onClick={loadData}
              className="px-3 py-2 rounded-xl text-xs font-mono border border-stone-700 bg-stone-900 hover:bg-stone-800 transition-colors"
            >
              Sync ↻
            </button>

            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl text-xs font-mono bg-[#C4883A] text-black font-bold hover:bg-[#d4994d] transition-colors"
            >
              Storefront →
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl text-xs font-mono uppercase tracking-wider text-rose-400 border border-rose-950 bg-rose-950/20 hover:bg-rose-950/50 transition-colors font-bold"
            >
              Log Out ✕
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-2 border-b border-stone-800 pb-3 font-mono text-xs">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg uppercase tracking-wider transition-all ${
              activeTab === 'orders'
                ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Orders [{orders.length}]
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg uppercase tracking-wider transition-all ${
              activeTab === 'inventory'
                ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Inventory Management [{products.length}]
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center font-mono text-xs text-stone-500">
            Querying Supabase backend...
          </div>
        ) : (
          <>
            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
                  <input
                    type="text"
                    placeholder="Search order ref, city, or phone..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="flex-1 max-w-sm px-4 py-2 rounded-xl border border-stone-700 bg-stone-900 text-stone-200 focus:outline-none"
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

                <div className="overflow-x-auto border border-stone-800 rounded-2xl">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-900 border-b border-stone-800 text-stone-400">
                      <tr>
                        <th className="p-4">Order Ref</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Destination</th>
                        <th className="p-4">Phone</th>
                        <th className="p-4">Total ({currency})</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">HNB Deposit Slip</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 bg-stone-950/40">
                      {filteredOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-900/30">
                          <td className="p-4 font-bold text-stone-100">{ord.order_number}</td>
                          <td className="p-4 text-stone-400">
                            {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : 'Recent'}
                          </td>
                          <td className="p-4 text-stone-300 max-w-[200px] truncate" title={ord.shipping_address}>
                            {ord.city}
                          </td>
                          <td className="p-4 text-stone-400">{ord.phone || 'N/A'}</td>
                          <td className="p-4 font-bold text-[#FAF9F5]">{formatPrice(ord.total_amount)}</td>
                          <td className="p-4 uppercase text-stone-400">{ord.payment_method}</td>
                          <td className="p-4">
                            {ord.receipt_url ? (
                              <button
                                onClick={() => setActiveSlipUrl(ord.receipt_url || null)}
                                className="text-[#C4883A] underline font-bold hover:text-amber-300"
                              >
                                View Slip ↗
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
              </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C4883A] block">
                            {prod.category} • ID: #{prod.id}
                          </span>
                          <h3 className="font-bold text-sm text-stone-100 mt-0.5">{prod.name}</h3>
                        </div>
                        <span className="text-xs font-mono font-bold text-[#C4883A]">
                          {formatPrice(prod.price)}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between text-xs font-mono">
                        <span className="text-stone-400">Current In Stock:</span>
                        <span className="font-bold text-base text-stone-100">{prod.stock_qty} units</span>
                      </div>
                    </div>

                    {/* Stock Inbound Receiving Input Field */}
                    <div className="pt-3 border-t border-stone-800/80 space-y-2">
                      <span className="text-[10px] font-mono uppercase text-stone-400 block font-semibold">
                        Receive Stock Inbound:
                      </span>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="1"
                          placeholder="+ Qty"
                          value={stockAddAmount[prod.id] || ''}
                          onChange={(e) =>
                            setStockAddAmount({
                              ...stockAddAmount,
                              [prod.id]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="flex-1 px-3 py-1.5 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 text-xs font-mono focus:outline-none"
                        />
                        <button
                          onClick={() => handleAddStockAmount(prod.id)}
                          disabled={updatingId === prod.id || !stockAddAmount[prod.id]}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono uppercase font-bold bg-[#C4883A] text-black hover:bg-[#d4994d] disabled:opacity-40 transition-colors"
                        >
                          + Add Stock
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 3. BARCODE & QR CODE SCANNER MODAL                                    */}
      {/* ===================================================================== */}
      {isScannerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono"
          onClick={() => setIsScannerOpen(false)}
        >
          <div
            className="relative max-w-lg w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
                  Inbound Barcode / QR Scanner
                </h3>
                <p className="text-[10px] text-stone-400">Point camera at bottle QR or use USB barcode scanner</p>
              </div>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="text-stone-400 hover:text-white text-base font-bold"
              >
                ✕
              </button>
            </div>

            {/* Video Viewport for Live Camera Feed */}
            <div id="qr-reader-container" className="rounded-2xl overflow-hidden bg-black" />

            {/* Hardware Scanner & Keyboard Input */}
            <div className="pt-2 border-t border-stone-800">
              <label className="block text-[10px] text-stone-400 uppercase mb-1">
                Or Input Barcode Code Directly:
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Scan or enter Product ID (e.g. 1)"
                  value={barcodeInputManual}
                  onChange={(e) => setBarcodeInputManual(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleScannedCode(barcodeInputManual);
                      setBarcodeInputManual('');
                    }
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 text-xs text-stone-100 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    handleScannedCode(barcodeInputManual);
                    setBarcodeInputManual('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#C4883A] text-black hover:bg-[#d4994d]"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Scan Status Feedback */}
            {scannerFeedback && (
              <div className="p-3 rounded-xl bg-stone-800/90 border border-stone-700 text-xs text-stone-200">
                {scannerFeedback}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. DEPOSIT SLIP INSPECTION MODAL                                      */}
      {/* ===================================================================== */}
      {activeSlipUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 font-mono"
          onClick={() => setActiveSlipUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs uppercase tracking-widest text-[#C4883A] font-bold">
                Bank Deposit Slip Proof
              </span>
              <button
                onClick={() => setActiveSlipUrl(null)}
                className="text-stone-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[65vh] overflow-auto rounded-xl bg-black/40 p-2 flex items-center justify-center">
              <img
                src={activeSlipUrl}
                alt="Deposit Slip"
                className="max-h-[60vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="mt-4 flex justify-between items-center">
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