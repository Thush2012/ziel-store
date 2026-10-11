'use client';

import React, { useState, useEffect } from 'react';
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
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  // Filters & Search
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Slip Modal Preview
  const [activeSlipUrl, setActiveSlipUrl] = useState<string | null>(null);

  // New Product Modal State
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Wines',
    price: 25,
    stock_qty: 20,
    tagline: '',
    description: '',
  });

  useEffect(() => {
    loadData();
  }, []);

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
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
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

  const handleStockAdjust = async (productId: number, newStock: number) => {
    setUpdatingId(productId);
    const validQty = Math.max(0, newStock);
    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_qty: validQty })
        .eq('id', productId);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, stock_qty: validQty } : p))
        );
      }
    } catch (err) {
      console.error('Error updating stock:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePriceUpdate = async (productId: number, newPrice: number) => {
    if (isNaN(newPrice) || newPrice < 0) return;
    setUpdatingId(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ price: newPrice })
        .eq('id', productId);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, price: newPrice } : p))
        );
      }
    } catch (err) {
      console.error('Error updating price:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleAvailability = async (productId: number, currentAvailable: boolean) => {
    setUpdatingId(productId);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_available: !currentAvailable })
        .eq('id', productId);

      if (!error) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, is_available: !currentAvailable } : p))
        );
      }
    } catch (err) {
      console.error('Error toggling availability:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([
          {
            name: newProduct.name,
            category: newProduct.category,
            price: Number(newProduct.price),
            stock_qty: Number(newProduct.stock_qty),
            tagline: newProduct.tagline,
            description: newProduct.description,
            is_available: true,
          },
        ])
        .select('*')
        .single();

      if (!error && data) {
        setProducts((prev) => [...prev, data]);
        setIsAddProductOpen(false);
        setNewProduct({
          name: '',
          category: 'Wines',
          price: 25,
          stock_qty: 20,
          tagline: '',
          description: '',
        });
      }
    } catch (err) {
      console.error('Error creating product:', err);
    }
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4883A] font-semibold">
              Internal Control Station
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Ziel Store Operations
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl text-xs font-mono border border-stone-700 bg-stone-900 hover:bg-stone-800 transition-colors"
            >
              Sync Records ↻
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-mono bg-[#C4883A] text-black font-bold hover:bg-[#d4994d] transition-colors"
            >
              Open Storefront →
            </Link>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-3">
          <div className="flex space-x-2 font-mono text-xs">
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

          {activeTab === 'inventory' && (
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-mono uppercase tracking-wider font-bold bg-stone-100 text-stone-900 hover:bg-white transition-colors"
            >
              + Add New Product
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-24 text-center font-mono text-xs text-stone-500">
            Querying Supabase records...
          </div>
        ) : (
          <>
            {/* ============================================================== */}
            {/* ORDERS MANAGEMENT TAB                                         */}
            {/* ============================================================== */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {/* Search & Filter Sub-Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs">
                  <div className="relative flex-1 max-w-sm">
                    <input
                      type="text"
                      placeholder="Search order ref, city, or phone..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-stone-700 bg-stone-900 text-stone-200 focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-stone-400">Filter Status:</span>
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
                          <th className="p-4">Destination</th>
                          <th className="p-4">Contact</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Deposit Slip</th>
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
                            <td className="p-4 font-bold text-[#FAF9F5]">${ord.total_amount}</td>
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

            {/* ============================================================== */}
            {/* INVENTORY MANAGEMENT TAB                                      */}
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
                          <h3 className="font-bold text-sm text-stone-100 mt-0.5">{prod.name}</h3>
                        </div>

                        {/* Available/Visible Toggle */}
                        <button
                          onClick={() => handleToggleAvailability(prod.id, prod.is_available)}
                          disabled={updatingId === prod.id}
                          className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold transition-colors ${
                            prod.is_available
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                              : 'bg-rose-950 text-rose-400 border border-rose-800 hover:bg-rose-900'
                          }`}
                        >
                          {prod.is_available ? 'Active' : 'Hidden'}
                        </button>
                      </div>

                      {/* Editable Price Field */}
                      <div className="mt-3 flex items-center space-x-2 font-mono text-xs">
                        <span className="text-stone-400">Price (USD):</span>
                        <div className="flex items-center">
                          <span className="text-[#C4883A] mr-1">$</span>
                          <input
                            type="number"
                            defaultValue={prod.price}
                            onBlur={(e) => handlePriceUpdate(prod.id, parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 rounded bg-stone-800 border border-stone-700 text-stone-100 focus:outline-none focus:border-[#C4883A]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Stock Adjustment Controls */}
                    <div className="mt-6 pt-3 border-t border-stone-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-stone-400">Inventory Level:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleStockAdjust(prod.id, prod.stock_qty - 1)}
                          disabled={updatingId === prod.id || prod.stock_qty <= 0}
                          className="w-7 h-7 rounded border border-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-800 disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono text-sm font-bold">
                          {prod.stock_qty}
                        </span>
                        <button
                          onClick={() => handleStockAdjust(prod.id, prod.stock_qty + 1)}
                          disabled={updatingId === prod.id}
                          className="w-7 h-7 rounded border border-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-800"
                        >
                          +
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

      {/* ============================================================== */}
      {/* DEPOSIT SLIP INSPECTION MODAL                                  */}
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

            <div className="mt-4 flex justify-between items-center">
              <a
                href={activeSlipUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono underline text-stone-400 hover:text-white"
              >
                Open in Full Window ↗
              </a>
              <button
                onClick={() => setActiveSlipUrl(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-stone-800 hover:bg-stone-700 text-stone-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD NEW PRODUCT MODAL                                          */}
      {/* ============================================================== */}
      {isAddProductOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsAddProductOpen(false)}
        >
          <div
            className="relative max-w-md w-full bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-stone-100">Add New Catalog Product</h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="text-stone-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-stone-400 uppercase text-[10px] mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cask Aged Coconut Vinegar"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 uppercase text-[10px] mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                  >
                    <option value="Wines">Wines</option>
                    <option value="Soaps">Soaps</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 uppercase text-[10px] mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 uppercase text-[10px] mb-1">Initial Stock Qty</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={newProduct.stock_qty}
                  onChange={(e) => setNewProduct({ ...newProduct, stock_qty: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-stone-400 uppercase text-[10px] mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Batch No. 04 — Reserve"
                  value={newProduct.tagline}
                  onChange={(e) => setNewProduct({ ...newProduct, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-700 bg-stone-800 text-stone-100 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-2 rounded-xl font-bold bg-[#C4883A] text-black hover:bg-[#d4994d] transition-colors uppercase tracking-widest text-xs"
              >
                Create Product
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}