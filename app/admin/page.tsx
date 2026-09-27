'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  products?: { name: string };
}

interface AdminOrder {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  shipping_fee: number;
  payment_method: string;
  status: string;
  shipping_address: string;
  city: string;
  phone: string;
  order_items?: OrderItem[];
}

interface AdminProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  stock_qty: number;
  is_available: boolean;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Fetch all orders and inventory items
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch orders with associated line items
      const { data: ordersData, error: ordersErr } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            unit_price
          )
        `)
        .order('created_at', { ascending: false });

      if (!ordersErr && ordersData) {
        setOrders(ordersData as AdminOrder[]);
      }

      // Fetch products
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('id, name, category, price, stock_qty, is_available')
        .order('id', { ascending: true });

      if (!prodErr && prodData) {
        setProducts(prodData as AdminProduct[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Update order status (Pending -> Dispatched -> Delivered -> Cancelled)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      showNotice(`Failed to update: ${error.message}`);
    } else {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
      showNotice(`Order marked as ${newStatus}`);
    }
  };

  // Update stock quantity
  const handleStockAdjust = async (productId: number, newQty: number) => {
    if (newQty < 0) return;
    const { error } = await supabase
      .from('products')
      .update({ stock_qty: newQty })
      .eq('id', productId);

    if (error) {
      showNotice(`Stock update failed: ${error.message}`);
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock_qty: newQty } : p))
      );
      showNotice('Stock inventory updated');
    }
  };

  // Toggle item availability
  const handleToggleAvailability = async (productId: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('products')
      .update({ is_available: !currentStatus })
      .eq('id', productId);

    if (error) {
      showNotice('Status toggle failed');
    } else {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, is_available: !currentStatus } : p))
      );
      showNotice(`Product is now ${!currentStatus ? 'Visible' : 'Hidden'}`);
    }
  };

  const filteredOrders = orders.filter((o) =>
    filterStatus === 'All' ? true : (o.status || 'Pending') === filterStatus
  );

  return (
    <main className="min-h-screen bg-[#121212] text-[#F3F2EE] font-sans antialiased p-6 sm:p-12">
      
      {/* Toast Notice */}
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-100 text-stone-950 px-4 py-3 rounded-2xl shadow-xl text-xs font-mono font-medium">
          {actionMessage}
        </div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-stone-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-wider font-mono">ZIEL STORE</span>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">Live store fulfillment & inventory controller</p>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xs uppercase tracking-wider font-mono text-stone-400 hover:text-white transition-colors"
          >
            ← View Storefront
          </Link>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 rounded-xl text-xs font-mono uppercase bg-stone-800 hover:bg-stone-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto my-6 flex space-x-3">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider transition-all ${
            activeTab === 'orders'
              ? 'bg-stone-100 text-stone-900 font-bold'
              : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider transition-all ${
            activeTab === 'inventory'
              ? 'bg-stone-100 text-stone-900 font-bold'
              : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
          }`}
        >
          Inventory & Stock ({products.length})
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-stone-500">Loading store records...</div>
        ) : activeTab === 'orders' ? (
          
          /* ORDERS TAB */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-xs font-mono text-stone-500 mr-2">Filter Status:</span>
              {['All', 'Pending', 'Dispatched', 'Delivered', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`text-xs font-mono px-3 py-1 rounded-lg border transition-colors ${
                    filterStatus === st
                      ? 'border-stone-400 bg-stone-800 text-white'
                      : 'border-stone-800 bg-stone-900 text-stone-500 hover:border-stone-700'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center text-xs font-mono text-stone-500 bg-stone-900/40 rounded-2xl border border-stone-800">
                No orders found under "{filterStatus}".
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 text-xs font-mono flex flex-col lg:flex-row justify-between gap-6"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-3">
                        <span className="text-base font-bold text-white tracking-wider">
                          {ord.order_number}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : ord.status === 'Dispatched'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {ord.status || 'Pending'}
                        </span>
                      </div>

                      <div className="text-stone-400 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
                        <div><strong className="text-stone-300">Date:</strong> {new Date(ord.created_at).toLocaleString()}</div>
                        <div><strong className="text-stone-300">Payment:</strong> {ord.payment_method.toUpperCase()}</div>
                        <div><strong className="text-stone-300">Phone:</strong> {ord.phone}</div>
                        <div><strong className="text-stone-300">City:</strong> {ord.city}</div>
                        <div className="sm:col-span-2"><strong className="text-stone-300">Address:</strong> {ord.shipping_address}</div>
                      </div>

                      {ord.order_items && ord.order_items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-stone-800/80">
                          <span className="text-[10px] text-stone-500 uppercase">Items ordered:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {ord.order_items.map((it) => (
                              <span key={it.id} className="bg-stone-800 text-stone-300 px-2 py-1 rounded-md text-[10px]">
                                {it.quantity}x (Product #{it.product_id}) — ${Number(it.unit_price).toFixed(2)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col justify-between items-end lg:items-end border-t lg:border-t-0 pt-4 lg:pt-0 border-stone-800 min-w-[200px]">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] text-stone-500 block uppercase">Total Revenue</span>
                        <span className="text-lg font-bold text-white">${Number(ord.total_amount).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <select
                          value={ord.status || 'Pending'}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          className="bg-stone-800 border border-stone-700 text-stone-200 text-xs rounded-xl px-3 py-2 focus:outline-none"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Dispatched">Dispatched</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          
          /* INVENTORY TAB */
          <div className="bg-stone-900/60 rounded-2xl border border-stone-800 overflow-hidden font-mono text-xs">
            <div className="grid grid-cols-12 bg-stone-900 p-4 font-bold border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
              <div className="col-span-5">Product</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Stock Control</div>
              <div className="col-span-1 text-right">Visibility</div>
            </div>

            <div className="divide-y divide-stone-800/60">
              {products.map((prod) => (
                <div key={prod.id} className="grid grid-cols-12 p-4 items-center gap-2">
                  <div className="col-span-5 font-semibold text-white">
                    {prod.name}
                    <span className="block text-[10px] font-normal text-stone-500">ID: #{prod.id}</span>
                  </div>
                  <div className="col-span-2 text-stone-400">{prod.category}</div>
                  <div className="col-span-2 text-stone-300 font-bold">${Number(prod.price).toFixed(2)}</div>
                  
                  {/* Stock adjuster */}
                  <div className="col-span-2 flex items-center space-x-2">
                    <button
                      onClick={() => handleStockAdjust(prod.id, (prod.stock_qty || 0) - 1)}
                      className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 flex items-center justify-center font-bold text-stone-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-stone-200">
                      {prod.stock_qty ?? 0}
                    </span>
                    <button
                      onClick={() => handleStockAdjust(prod.id, (prod.stock_qty || 0) + 1)}
                      className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 flex items-center justify-center font-bold text-stone-300"
                    >
                      +
                    </button>
                  </div>

                  {/* Availability toggle */}
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => handleToggleAvailability(prod.id, prod.is_available)}
                      className={`text-[10px] px-2.5 py-1 rounded-md uppercase font-bold transition-colors ${
                        prod.is_available
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800'
                          : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-800'
                      }`}
                    >
                      {prod.is_available ? 'Live' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}