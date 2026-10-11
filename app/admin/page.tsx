'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

interface Order {
  id: string;
  order_number: string;
  customer_name?: string;
  city?: string;
  phone?: string;
  total_amount: number;
  payment_method: string;
  status: string;
  receipt_url?: string | null;
  created_at: string;
}

interface ProductItem {
  id: number;
  name: string;
  price: number;
  stock_qty: number;
  is_available: boolean;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: productsData } = await supabase
        .from('products')
        .select('id, name, price, stock_qty, is_available')
        .order('id', { ascending: true });

      if (ordersData) setOrders(ordersData);
      if (productsData) setProducts(productsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
    }
    setUpdatingId(null);
  };

  const updateProductStock = async (productId: number, newStock: number) => {
    setUpdatingId(productId);
    const { error } = await supabase
      .from('products')
      .update({ stock_qty: newStock })
      .eq('id', productId);

    if (!error) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock_qty: newStock } : p))
      );
    }
    setUpdatingId(null);
  };

  return (
    <main className="min-h-screen bg-[#141413] text-[#FAF9F5] p-6 sm:p-12 font-sans">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800 pb-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#C4883A]">
              Management Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              Ziel Store Admin
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchAdminData}
              className="px-4 py-2 rounded-xl text-xs font-mono border border-stone-700 bg-stone-900 hover:bg-stone-800"
            >
              Refresh Data
            </button>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-xs font-mono bg-[#C4883A] text-black font-bold hover:opacity-90"
            >
              View Storefront →
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center font-mono text-sm text-stone-500">
            Loading dashboard data...
          </div>
        ) : (
          <>
            {/* Product Inventory Overview */}
            <section className="space-y-4">
              <h2 className="text-lg font-medium text-stone-200">Inventory & Stock Quantities</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl border border-stone-800 bg-stone-900/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm">{prod.name}</span>
                        <span className="text-xs font-mono text-[#C4883A]">${prod.price}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between">
                      <span className="text-xs font-mono text-stone-400">Stock Qty:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateProductStock(prod.id, Math.max(0, prod.stock_qty - 1))}
                          disabled={updatingId === prod.id}
                          className="w-7 h-7 rounded border border-stone-700 flex items-center justify-center font-bold text-sm hover:bg-stone-800"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono text-sm font-bold">
                          {prod.stock_qty}
                        </span>
                        <button
                          onClick={() => updateProductStock(prod.id, prod.stock_qty + 1)}
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
            </section>

            {/* Orders Management */}
            <section className="space-y-4">
              <h2 className="text-lg font-medium text-stone-200">Customer Orders & Verification</h2>
              {orders.length === 0 ? (
                <div className="p-8 border border-stone-800 rounded-2xl text-center text-sm font-mono text-stone-500">
                  No customer orders recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto border border-stone-800 rounded-2xl">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-stone-900 border-b border-stone-800 text-stone-400">
                      <tr>
                        <th className="p-4">Order #</th>
                        <th className="p-4">Destination</th>
                        <th className="p-4">Total</th>
                        <th className="p-4">Payment</th>
                        <th className="p-4">Slip</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 bg-stone-950/40">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-stone-900/30">
                          <td className="p-4 font-bold text-stone-100">{ord.order_number}</td>
                          <td className="p-4 text-stone-300">{ord.city || 'N/A'}</td>
                          <td className="p-4 font-bold">${ord.total_amount}</td>
                          <td className="p-4 uppercase text-stone-400">{ord.payment_method}</td>
                          <td className="p-4">
                            {ord.receipt_url ? (
                              <a
                                href={ord.receipt_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#C4883A] underline"
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
                              onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                              disabled={updatingId === ord.id}
                              className="bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded px-2 py-1"
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
            </section>
          </>
        )}
      </div>
    </main>
  );
}