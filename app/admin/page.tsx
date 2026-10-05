'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

const AUTHORIZED_ADMIN_EMAIL = 'thushanmanusha345@gmail.com';

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
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
  customer_email?: string | null;
  customer_name?: string | null;
  receipt_url?: string | null;
  coupon_code?: string | null;
  order_items?: OrderItem[];
}

interface AdminProduct {
  id: number;
  name: string;
  slug?: string;
  category: string;
  price: number;
  stock_qty: number;
  is_available: boolean;
  tagline?: string;
  description?: string;
  image_url?: string;
}

interface BatchRecord {
  id: number;
  batch_number: string;
  product_name: string;
  category: string;
  abv: string;
  harvest_date: string;
  bottling_date: string;
}

interface AdminCoupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'flat' | 'free_shipping';
  discount_value: number;
  min_spend: number;
  max_uses: number | null;
  times_used: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'analytics' | 'vouchers'>('orders');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [batches, setBatches] = useState<BatchRecord[]>([]);
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [actionMessage, showNotificationMessage] = useState<string | null>(null);
  const [previewSlipUrl, setPreviewSlipUrl] = useState<string | null>(null);

  // Product modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Wines',
    price: '',
    stock_qty: '',
    tagline: '',
    description: '',
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);

  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    category: 'Wines',
    price: '',
    stock_qty: '',
    tagline: '',
    description: '',
    image_url: '',
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Voucher modal
  const [isAddCouponOpen, setIsAddCouponOpen] = useState(false);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
  const [newCouponForm, setNewCouponForm] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_spend: '0',
    max_uses: '',
  });

  const showNotice = (msg: string) => {
    showNotificationMessage(msg);
    setTimeout(() => showNotificationMessage(null), 3500);
  };

  // Cryptographic Supabase Auth Verification
  useEffect(() => {
    async function verifySession() {
      const { data: { session } } = await supabase.auth.getSession();
      const email = session?.user?.email;

      if (session && email && email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setCurrentUserEmail(email);
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    }

    verifySession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      if (session && email && email.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setCurrentUserEmail(email);
        setIsAuthorized(true);
      } else {
        setCurrentUserEmail(null);
        setIsAuthorized(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const emailClean = inputEmail.trim().toLowerCase();

      if (emailClean !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setAuthError('Access Denied: This account is not registered as an authorized store administrator.');
        setAuthLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailClean,
        password: inputPassword,
      });

      if (error) {
        setAuthError(error.message);
        setIsAuthorized(false);
      } else if (data.session && data.user?.email?.toLowerCase() === AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
        setIsAuthorized(true);
        setCurrentUserEmail(data.user.email);
        setInputPassword('');
        showNotice('Secure administrator authentication verified!');
      } else {
        await supabase.auth.signOut();
        setAuthError('Unauthorized session.');
        setIsAuthorized(false);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthorized(false);
    setCurrentUserEmail(null);
    setInputEmail('');
    setInputPassword('');
    showNotice('Logged out of admin portal');
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
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

      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

      if (!prodErr && prodData) {
        setProducts(prodData as AdminProduct[]);
      }

      const { data: batchData } = await supabase
        .from('batches')
        .select('*')
        .order('id', { ascending: false });

      if (batchData) {
        setBatches(batchData as BatchRecord[]);
      }

      const { data: couponData, error: couponErr } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (!couponErr && couponData) {
        setCoupons(couponData as AdminCoupon[]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthorized) return;

    loadDashboardData();

    const ordersChannel = supabase
      .channel('realtime_admin_orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        async (payload) => {
          showNotice(`🔔 New incoming order: ${payload.new.order_number}`);

          const { data: newOrderData } = await supabase
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
            .eq('id', payload.new.id)
            .single();

          if (newOrderData) {
            setOrders((prev) => [newOrderData as AdminOrder, ...prev]);
          } else {
            setOrders((prev) => [payload.new as AdminOrder, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) =>
            prev.map((ord) => (ord.id === payload.new.id ? { ...ord, ...payload.new } : ord))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders((prev) => prev.filter((ord) => ord.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [isAuthorized]);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);

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

      if (targetOrder) {
        const recipientEmail = targetOrder.customer_email || (targetOrder.phone?.includes('@') ? targetOrder.phone : undefined);

        if (recipientEmail) {
          fetch('/api/notify-status-update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: targetOrder.order_number,
              customerName: targetOrder.customer_name || 'Valued Customer',
              customerEmail: recipientEmail,
              newStatus,
              totalAmount: targetOrder.total_amount,
            }),
          }).catch((err) => console.warn('Customer status email warning:', err));
        }
      }
    }
  };

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
      showNotice(`Product is now ${!currentStatus ? 'Live' : 'Hidden'}`);
    }
  };

  const handleOpenEditProduct = (prod: AdminProduct) => {
    setEditingProduct(prod);
    setEditForm({
      name: prod.name,
      category: prod.category || 'Wines',
      price: prod.price.toString(),
      stock_qty: (prod.stock_qty ?? 0).toString(),
      tagline: prod.tagline || '',
      description: prod.description || '',
      image_url: prod.image_url || '',
    });
    setEditImageFile(null);
  };

  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSubmittingEdit(true);

    try {
      let finalImageUrl = editForm.image_url;

      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop() || 'png';
        const cleanFileName = `prod_${editingProduct.id}_${Date.now()}.${fileExt}`.replace(/[^a-zA-Z0-9.-]/g, '_');

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(cleanFileName, editImageFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          showNotice(`Image upload warning: ${uploadErr.message}`);
        } else if (uploadData) {
          const { data: publicData } = supabase.storage
            .from('product-images')
            .getPublicUrl(cleanFileName);
          finalImageUrl = publicData?.publicUrl || finalImageUrl;
        }
      }

      const generatedSlug = editForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const updatePayload = {
        name: editForm.name.trim(),
        slug: generatedSlug,
        category: editForm.category,
        price: parseFloat(editForm.price) || 0,
        stock_qty: parseInt(editForm.stock_qty, 10) || 0,
        tagline: editForm.tagline.trim(),
        description: editForm.description.trim(),
        image_url: finalImageUrl,
      };

      const { data, error } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', editingProduct.id)
        .select()
        .single();

      if (error) {
        alert(`Update failed: ${error.message}`);
      } else if (data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? (data as AdminProduct) : p))
        );
        setEditingProduct(null);
        showNotice(`Updated "${updatePayload.name}" successfully!`);
      }
    } catch (err: any) {
      alert(`Error updating product: ${err.message || 'Unexpected failure'}`);
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);
    let imageUrl: string | null = null;

    try {
      if (productImageFile) {
        const fileExt = productImageFile.name.split('.').pop() || 'png';
        const cleanFileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.${fileExt}`.replace(/[^a-zA-Z0-9.-]/g, '_');

        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('product-images')
          .upload(cleanFileName, productImageFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          showNotice(`Image upload notice: ${uploadErr.message}`);
        } else if (uploadData) {
          const { data: publicData } = supabase.storage
            .from('product-images')
            .getPublicUrl(cleanFileName);
          imageUrl = publicData?.publicUrl || null;
        }
      }

      const baseSlug = newProductForm.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      const generatedSlug = `${baseSlug || 'product'}-${Date.now().toString().slice(-4)}`;

      const payload = {
        name: newProductForm.name.trim(),
        slug: generatedSlug,
        category: newProductForm.category,
        price: parseFloat(newProductForm.price) || 0,
        stock_qty: parseInt(newProductForm.stock_qty, 10) || 0,
        tagline: newProductForm.tagline.trim(),
        description: newProductForm.description.trim(),
        image_url: imageUrl || '/images/wine.jpg',
        is_available: true,
      };

      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert(`Failed to add product: ${error.message}`);
      } else if (data) {
        setProducts((prev) => [...prev, data as AdminProduct]);
        setIsAddProductOpen(false);
        setNewProductForm({
          name: '',
          category: 'Wines',
          price: '',
          stock_qty: '',
          tagline: '',
          description: '',
        });
        setProductImageFile(null);
        showNotice('New product published successfully!');
      }
    } catch (err: any) {
      alert(`Error: ${err.message || 'Unexpected failure'}`);
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingCoupon(true);

    try {
      const cleanCode = newCouponForm.code.trim().toUpperCase();

      const payload = {
        code: cleanCode,
        discount_type: newCouponForm.discount_type,
        discount_value: parseFloat(newCouponForm.discount_value) || 0,
        min_spend: parseFloat(newCouponForm.min_spend) || 0,
        max_uses: newCouponForm.max_uses ? parseInt(newCouponForm.max_uses, 10) : null,
        is_active: true,
      };

      const { data, error } = await supabase
        .from('coupons')
        .insert([payload])
        .select()
        .single();

      if (error) {
        alert(`Failed to create voucher: ${error.message}`);
      } else if (data) {
        setCoupons((prev) => [data as AdminCoupon, ...prev]);
        setIsAddCouponOpen(false);
        setNewCouponForm({
          code: '',
          discount_type: 'percentage',
          discount_value: '',
          min_spend: '0',
          max_uses: '',
        });
        showNotice(`Voucher "${cleanCode}" created successfully!`);
      }
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to create coupon'}`);
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleToggleCoupon = async (couponId: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('coupons')
      .update({ is_active: !currentStatus })
      .eq('id', couponId);

    if (error) {
      showNotice(`Update failed: ${error.message}`);
    } else {
      setCoupons((prev) =>
        prev.map((c) => (c.id === couponId ? { ...c, is_active: !currentStatus } : c))
      );
      showNotice(`Voucher status updated`);
    }
  };

  if (isAuthorized === null) {
    return (
      <main className="min-h-screen bg-[#121212] flex items-center justify-center font-mono text-xs text-stone-400">
        Verifying administrator credentials...
      </main>
    );
  }

  // Strict Login Gate
  if (!isAuthorized) {
    return (
      <main className="min-h-screen bg-[#121212] flex flex-col items-center justify-center p-6 text-[#F3F2EE] font-mono">
        <div className="w-full max-w-sm p-8 rounded-3xl bg-[#1A1918] border border-stone-800 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl mx-auto mb-3">
              🛡️
            </div>
            <h1 className="text-base font-bold uppercase tracking-wider text-white">ADMIN PORTAL LOGIN</h1>
            <p className="text-[11px] text-stone-400 mt-1">Authorized store management only</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-[11px] leading-relaxed">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                placeholder="admin@zielstore.com"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-700 bg-stone-900 text-white text-xs tracking-wider focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest text-stone-400 font-semibold mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-700 bg-stone-900 text-white text-xs tracking-wider focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading || !inputEmail.trim() || !inputPassword.trim()}
              className={`w-full py-3.5 rounded-xl text-xs uppercase tracking-widest font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors ${
                authLoading || !inputEmail.trim() || !inputPassword.trim() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {authLoading ? 'Verifying Session...' : 'AUTHENTICATE & ACCESS'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-800 text-center">
            <Link
              href="/"
              className="text-[11px] uppercase tracking-wider text-stone-400 hover:text-white transition-colors"
            >
              ← BACK TO STOREFRONT
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
  const totalPendingSlips = orders.filter((o) => o.receipt_url && o.status === 'Pending').length;
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const filteredOrders = orders.filter((o) =>
    filterStatus === 'All' ? true : (o.status || 'Pending') === filterStatus
  );

  return (
    <main className="min-h-screen bg-[#121212] text-[#F3F2EE] font-sans antialiased p-6 sm:p-12">
      {actionMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-100 text-stone-950 px-4 py-3 rounded-2xl shadow-xl text-xs font-mono font-medium flex items-center space-x-2">
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Slip Preview Modal */}
      {previewSlipUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewSlipUrl(null)}
        >
          <div
            className="max-w-2xl w-full bg-[#1A1918] border border-stone-800 p-6 rounded-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-white">Bank Transfer Slip</h3>
              <button onClick={() => setPreviewSlipUrl(null)} className="text-stone-400 hover:text-white text-sm">
                ✕ Close
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/40 rounded-xl p-2">
              <img
                src={previewSlipUrl}
                alt="Deposit Slip"
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditingProduct(null)}
        >
          <div
            className="max-w-md w-full bg-[#1A1918] border border-stone-800 p-6 sm:p-8 rounded-3xl shadow-2xl my-auto text-xs font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Edit Product</h3>
                <span className="text-[10px] text-stone-400">ID: #{editingProduct.id}</span>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Wines">Wines</option>
                    <option value="Soaps">Soaps</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  value={editForm.stock_qty}
                  onChange={(e) => setEditForm({ ...editForm, stock_qty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Tagline</label>
                <input
                  type="text"
                  value={editForm.tagline}
                  onChange={(e) => setEditForm({ ...editForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 border-t border-stone-800">
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Change Product Image</label>
                {editForm.image_url && (
                  <div className="flex items-center space-x-3 mb-2 p-2 bg-stone-900 rounded-xl border border-stone-800">
                    <img src={editForm.image_url} alt="Current" className="w-10 h-10 object-contain rounded bg-black/40 p-1" />
                    <span className="text-[10px] text-stone-400 truncate">Current Image Active</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setEditImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-[11px] text-stone-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-mono file:bg-amber-500 file:text-stone-950 file:cursor-pointer"
                />
                <span className="text-[9px] text-stone-500 mt-1 block">Leave empty to keep existing image.</span>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="w-1/3 py-3 rounded-xl uppercase tracking-widest font-bold bg-stone-800 text-stone-300 hover:bg-stone-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className={`w-2/3 py-3 rounded-xl uppercase tracking-widest font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors ${
                    submittingEdit ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submittingEdit ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddProductOpen(false)}
        >
          <div
            className="max-w-md w-full bg-[#1A1918] border border-stone-800 p-6 sm:p-8 rounded-3xl shadow-2xl my-auto text-xs font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Add New Product</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. King Coconut Wine Reserve"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Wines">Wines</option>
                    <option value="Soaps">Soaps</option>
                    <option value="Sets">Sets</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Price (USD) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="32.00"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Initial Stock Qty</label>
                <input
                  type="number"
                  placeholder="50"
                  value={newProductForm.stock_qty}
                  onChange={(e) => setNewProductForm({ ...newProductForm, stock_qty: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Batch No. 05 — Reserve"
                  value={newProductForm.tagline}
                  onChange={(e) => setNewProductForm({ ...newProductForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe the product and ingredients..."
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setProductImageFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-[11px] text-stone-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-mono file:bg-amber-500 file:text-stone-950 file:cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={submittingProduct}
                className={`w-full py-3.5 rounded-xl uppercase tracking-widest font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors mt-2 ${
                  submittingProduct ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submittingProduct ? 'Creating Product...' : 'Publish Product'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Voucher Modal */}
      {isAddCouponOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsAddCouponOpen(false)}
        >
          <div
            className="max-w-md w-full bg-[#1A1918] border border-stone-800 p-6 sm:p-8 rounded-3xl shadow-2xl my-auto text-xs font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Create Promotional Voucher</h3>
              <button onClick={() => setIsAddCouponOpen(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE15"
                  value={newCouponForm.code}
                  onChange={(e) => setNewCouponForm({ ...newCouponForm, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white font-bold tracking-wider uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Discount Type</label>
                  <select
                    value={newCouponForm.discount_type}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, discount_type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount ($)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">
                    {newCouponForm.discount_type === 'percentage' ? 'Percentage Off (%)' : 'Discount ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required={newCouponForm.discount_type !== 'free_shipping'}
                    disabled={newCouponForm.discount_type === 'free_shipping'}
                    placeholder={newCouponForm.discount_type === 'percentage' ? '15' : '5.00'}
                    value={newCouponForm.discount_type === 'free_shipping' ? '0' : newCouponForm.discount_value}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, discount_value: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500 disabled:opacity-40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Min Spend ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newCouponForm.min_spend}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, min_spend: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-stone-400 mb-1">Max Redemptions</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={newCouponForm.max_uses}
                    onChange={(e) => setNewCouponForm({ ...newCouponForm, max_uses: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingCoupon}
                className={`w-full py-3.5 rounded-xl uppercase tracking-widest font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors mt-2 ${
                  submittingCoupon ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submittingCoupon ? 'Creating Voucher...' : 'Publish Voucher'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center pb-8 border-b border-stone-800 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-wider font-mono">ZIEL STORE</span>
            <span className="text-[10px] uppercase font-mono tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Realtime Admin
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1 font-mono">Operator: {currentUserEmail}</p>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/" className="text-xs uppercase tracking-wider font-mono text-stone-400 hover:text-white transition-colors">
            ← Storefront
          </Link>
          <Link href="/verify" className="text-xs uppercase tracking-wider font-mono text-stone-400 hover:text-white transition-colors">
            Batch Registry
          </Link>
          <button onClick={loadDashboardData} className="px-4 py-2 rounded-xl text-xs font-mono uppercase bg-stone-800 hover:bg-stone-700 transition-colors">
            Refresh
          </button>
          <button onClick={handleAdminLogout} className="px-4 py-2 rounded-xl text-xs font-mono uppercase bg-rose-950/80 border border-rose-800 text-rose-300 hover:bg-rose-900 transition-colors">
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto my-6 flex justify-between items-center">
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider transition-all ${
              activeTab === 'orders' ? 'bg-stone-100 text-stone-900 font-bold' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider transition-all ${
              activeTab === 'inventory' ? 'bg-stone-100 text-stone-900 font-bold' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
            }`}
          >
            Inventory ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider transition-all ${
              activeTab === 'vouchers' ? 'bg-stone-100 text-stone-900 font-bold' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
            }`}
          >
            Vouchers ({coupons.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase font-mono tracking-wider transition-all ${
              activeTab === 'analytics' ? 'bg-stone-100 text-stone-900 font-bold' : 'bg-stone-900 text-stone-400 hover:bg-stone-800'
            }`}
          >
            Sales Analytics
          </button>
        </div>

        {activeTab === 'inventory' && (
          <button
            onClick={() => setIsAddProductOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs uppercase font-mono font-bold tracking-wider bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-md flex items-center space-x-1.5"
          >
            <span>+</span>
            <span>Add Product</span>
          </button>
        )}

        {activeTab === 'vouchers' && (
          <button
            onClick={() => setIsAddCouponOpen(true)}
            className="px-4 py-2.5 rounded-xl text-xs uppercase font-mono font-bold tracking-wider bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shadow-md flex items-center space-x-1.5"
          >
            <span>+</span>
            <span>Create Voucher</span>
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="py-20 text-center font-mono text-xs text-stone-500">Loading store records...</div>
        ) : activeTab === 'vouchers' ? (
          <div className="bg-stone-900/60 rounded-2xl border border-stone-800 overflow-hidden font-mono text-xs">
            <div className="grid grid-cols-12 bg-stone-900 p-4 font-bold border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
              <div className="col-span-3">Voucher Code</div>
              <div className="col-span-2">Benefit</div>
              <div className="col-span-2">Min Spend</div>
              <div className="col-span-3">Redemptions / Cap</div>
              <div className="col-span-2 text-right">Status</div>
            </div>

            {coupons.length === 0 ? (
              <div className="p-12 text-center text-stone-500">No promotional coupons created yet.</div>
            ) : (
              <div className="divide-y divide-stone-800/60">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="grid grid-cols-12 p-4 items-center gap-2">
                    <div className="col-span-3">
                      <span className="font-bold text-amber-400 text-sm tracking-wider block">{coupon.code}</span>
                      <span className="text-[10px] text-stone-500">Created {new Date(coupon.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="col-span-2 text-stone-200">
                      {coupon.discount_type === 'percentage' && `${coupon.discount_value}% OFF`}
                      {coupon.discount_type === 'flat' && `$${Number(coupon.discount_value).toFixed(2)} OFF`}
                      {coupon.discount_type === 'free_shipping' && 'FREE SHIPPING'}
                    </div>

                    <div className="col-span-2 text-stone-400">
                      {coupon.min_spend > 0 ? `$${Number(coupon.min_spend).toFixed(2)}` : 'None'}
                    </div>

                    <div className="col-span-3">
                      <span className="text-white font-semibold">{coupon.times_used}</span>
                      <span className="text-stone-500 text-[11px]">
                        {coupon.max_uses !== null ? ` / ${coupon.max_uses} used` : ' uses (No limit)'}
                      </span>
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => handleToggleCoupon(coupon.id, coupon.is_active)}
                        className={`text-[10px] px-3 py-1 rounded-md uppercase font-bold transition-colors ${
                          coupon.is_active
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-800'
                        }`}
                      >
                        {coupon.is_active ? 'Active' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'analytics' ? (
          <div className="space-y-6 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] uppercase text-stone-500 block mb-1">Gross Revenue</span>
                <span className="text-2xl font-bold text-white">${totalRevenue.toFixed(2)}</span>
                <span className="text-[10px] text-stone-400 block mt-1">Across all order records</span>
              </div>
              <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] uppercase text-stone-500 block mb-1">Total Orders</span>
                <span className="text-2xl font-bold text-white">{orders.length}</span>
                <span className="text-[10px] text-stone-400 block mt-1">Confirmed customer orders</span>
              </div>
              <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] uppercase text-stone-500 block mb-1">Average Order Value</span>
                <span className="text-2xl font-bold text-white">${avgOrderValue.toFixed(2)}</span>
                <span className="text-[10px] text-stone-400 block mt-1">Mean cart checkout value</span>
              </div>
              <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800">
                <span className="text-[10px] uppercase text-stone-500 block mb-1">Pending Slips</span>
                <span className="text-2xl font-bold text-amber-400">{totalPendingSlips}</span>
                <span className="text-[10px] text-stone-400 block mt-1">Awaiting payment verification</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Stock Level Summary</h3>
                <div className="space-y-2">
                  {products.map((p) => (
                    <div key={p.id} className="flex justify-between items-center border-b border-stone-800/60 pb-2">
                      <span className="text-stone-300 truncate max-w-[200px]">{p.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-stone-400">${Number(p.price).toFixed(2)}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (p.stock_qty || 0) <= 5 ? 'bg-rose-950 text-rose-300' : 'bg-stone-800 text-stone-300'
                        }`}>
                          {p.stock_qty ?? 0} in stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Registered Batches</h3>
                <div className="space-y-2">
                  {batches.map((b) => (
                    <div key={b.id} className="flex justify-between items-center border-b border-stone-800/60 pb-2">
                      <div>
                        <span className="text-amber-400 font-bold block">{b.batch_number}</span>
                        <span className="text-[10px] text-stone-400">{b.product_name}</span>
                      </div>
                      <span className="text-[10px] bg-stone-800 px-2 py-1 rounded text-stone-300">
                        {b.abv} ABV
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <span className="text-xs font-mono text-stone-500 mr-2">Filter Status:</span>
              {['All', 'Pending', 'Dispatched', 'Delivered', 'Cancelled', 'Freight Quote Pending'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`text-xs font-mono px-3 py-1 rounded-lg border transition-colors ${
                    filterStatus === st ? 'border-stone-400 bg-stone-800 text-white' : 'border-stone-800 bg-stone-900 text-stone-500 hover:border-stone-700'
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
                        <span className="text-base font-bold text-white tracking-wider">{ord.order_number}</span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : ord.status === 'Dispatched'
                            ? 'bg-blue-950 text-blue-300 border border-blue-800'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : ord.status === 'Freight Quote Pending'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {ord.status || 'Pending'}
                        </span>

                        {ord.receipt_url && (
                          <button
                            onClick={() => setPreviewSlipUrl(ord.receipt_url || null)}
                            className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
                          >
                            📷 View Slip
                          </button>
                        )}
                      </div>

                      <div className="text-stone-400 grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] pt-1">
                        <div><strong className="text-stone-300">Date:</strong> {new Date(ord.created_at).toLocaleString()}</div>
                        <div><strong className="text-stone-300">Payment:</strong> {ord.payment_method.toUpperCase()}</div>
                        <div><strong className="text-stone-300">Phone:</strong> {ord.phone}</div>
                        <div><strong className="text-stone-300">City / Country:</strong> {ord.city}</div>
                        {ord.coupon_code && (
                          <div><strong className="text-stone-300">Coupon:</strong> <span className="text-amber-400 font-bold">{ord.coupon_code}</span></div>
                        )}
                        <div className="sm:col-span-2"><strong className="text-stone-300">Address & Zone:</strong> {ord.shipping_address}</div>
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
                          <option value="Freight Quote Pending">Freight Quote Pending</option>
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
          <div className="bg-stone-900/60 rounded-2xl border border-stone-800 overflow-hidden font-mono text-xs">
            <div className="grid grid-cols-12 bg-stone-900 p-4 font-bold border-b border-stone-800 text-stone-400 uppercase text-[10px] tracking-wider">
              <div className="col-span-4">Product</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Price</div>
              <div className="col-span-2">Stock Control</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            <div className="divide-y divide-stone-800/60">
              {products.map((prod) => (
                <div key={prod.id} className="grid grid-cols-12 p-4 items-center gap-2">
                  <div className="col-span-4 flex items-center space-x-3">
                    {prod.image_url ? (
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-10 h-10 object-contain rounded-lg bg-stone-800/80 p-1 border border-stone-700/60 shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-stone-800 flex items-center justify-center text-stone-600 shrink-0">
                        📦
                      </div>
                    )}
                    <div className="truncate">
                      <span className="font-semibold text-white block truncate">{prod.name}</span>
                      <span className="text-[10px] text-stone-500">ID: #{prod.id}</span>
                    </div>
                  </div>

                  <div className="col-span-2 text-stone-400">{prod.category}</div>

                  <div className="col-span-2">
                    <span className="text-stone-300 font-bold">${Number(prod.price).toFixed(2)}</span>
                  </div>

                  <div className="col-span-2 flex items-center space-x-2">
                    <button
                      onClick={() => handleStockAdjust(prod.id, (prod.stock_qty || 0) - 1)}
                      className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 flex items-center justify-center font-bold text-stone-300"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-bold text-stone-200">{prod.stock_qty ?? 0}</span>
                    <button
                      onClick={() => handleStockAdjust(prod.id, (prod.stock_qty || 0) + 1)}
                      className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 flex items-center justify-center font-bold text-stone-300"
                    >
                      +
                    </button>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-2">
                    <button
                      onClick={() => handleOpenEditProduct(prod)}
                      className="text-[10px] px-2.5 py-1 rounded-md uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
                      title="Edit Product Details & Image"
                    >
                      ✏ Edit
                    </button>

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