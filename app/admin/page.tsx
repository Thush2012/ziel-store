'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  shipping_fee: number;
  payment_method: string;
  status: string;
  shipping_address: string;
  city: string;
  phone: string;
  receipt_url: string | null;
  created_at: string;
  coupon_code: string | null;
}

interface ProductItem {
  id: number;
  name: string;
  price: number;
  stock_qty: number;
  is_available: boolean;
  category?: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, price, stock_qty, is_available, category')
        .order('id', { ascending: true });

      if (!ordersError && ordersData) setOrders(ordersData as Order[]);
      if (!productsError && productsData) setProducts(productsData as ProductItem[]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    }
    setUpdatingId(null);
  };

  const handleUpdateStock = async (productId: number, newStock: number) => {
    setUpdatingId(productId);
    const { error } = await supabase
      .from('products')
      .update({ stock_qty: Math.max(0, newStock) })
      .eq('id', productId);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock_qty: Math.max(0, newStock) } : p))
      );
    }
    setUpdatingId(null);
  };

  return (
    <main className="min-h-screen bg-[#141413] text-[#FAF9F5] p-6 sm:p-12 font-sans select-none">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C4883A] font-semibold">
              Ziel Operations Control
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Store Management Console
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 rounded-xl text-xs font-mono border border-stone-700 bg-stone-900/80 hover:bg-stone-800 transition-colors"
            >
              Refresh Data ↻
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-mono bg-[#C4883A] text-black font-bold hover:bg-[#d4994d] transition-colors"
            >
              Storefront →
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 border-b border-stone-800 pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'orders'
                ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 text-xs font-mono uppercase tracking-wider rounded-lg transition-all ${
              activeTab === 'inventory'
                ? 'bg-stone-800 text-stone-100 font-bold border border-stone-700'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Stock & Products ({products.length})
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center font-mono text-xs text-stone-500">
            Fetching records from Supabase...
          </div>
        ) : (
          <>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="p-12 border border-stone-800 rounded-2xl text-center text-xs font-mono text-stone-500">
                    No orders recorded yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-stone-800 rounded-2xl">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-stone-900 border-b border-stone-800 text-stone-400">
                        <tr>
                          <th className="p-4">Order Ref</th>
                          <th className="p-4">Destination</th>
                          <th className="p-4">Phone</th>
                          <th className="p-4">Total</th>
                          <th className="p-4">Payment</th>
                          <th className="p-4">Slip</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Update</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-800/60 bg-stone-950/40">
                        {orders.map((ord) => (
                          <tr key={ord.id} className="hover:bg-stone-900/30">
                            <td className="p-4 font-bold text-stone-100">{ord.order_number}</td>
                            <td className="p-4 text-stone-300 max-w-[200px] truncate" title={ord.shipping_address}>
                              {ord.city}
                            </td>
                            <td className="p-4 text-stone-400">{ord.phone || 'N/A'}</td>
                            <td className="p-4 font-bold text-[#FAF9F5]">${ord.total_amount}</td>
                            <td className="p-4 uppercase text-stone-400">{ord.payment_method}</td>
                            <td className="p-4">
                              {ord.receipt_url ? (
                                <a
                                  href={ord.receipt_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#C4883A] underline font-bold"
                                >
                                  View Slip ↗
                                </a>
                              ) : (
                                <span className="text-stone-600">None</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ord.status === 'Approved'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : ord.status === 'Pending'
                                  ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                  : 'bg-stone-800 text-stone-300'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td className="p-4">
                              <select
                                value={ord.status}
                                onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
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

            {/* Inventory Tab */}
            {activeTab === 'inventory' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#C4883A] block">
                          {prod.category || 'Product'}
                        </span>
                        <h3 className="font-bold text-sm text-stone-100 mt-0.5">{prod.name}</h3>
                      </div>
                      <span className="text-xs font-mono font-semibold">${prod.price}</span>
                    </div>

                    <div className="mt-6 pt-3 border-t border-stone-800 flex items-center justify-between">
                      <span className="text-xs font-mono text-stone-400">Available Stock:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateStock(prod.id, prod.stock_qty - 1)}
                          disabled={updatingId === prod.id || prod.stock_qty <= 0}
                          className="w-7 h-7 rounded border border-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-800 disabled:opacity-40"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono text-sm font-bold">
                          {prod.stock_qty}
                        </span>
                        <button
                          onClick={() => handleUpdateStock(prod.id, prod.stock_qty + 1)}
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
    </main>
  );
}