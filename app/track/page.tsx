'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

interface TrackedOrder {
  order_number: string;
  status: string;
  created_at: string;
  total_amount: number;
  payment_method: string;
  city: string;
  shipping_address: string;
}

const STATUS_STEPS = [
  { key: 'Pending', label: 'Order Confirmed', desc: 'Received and awaiting processing / slip verification' },
  { key: 'Dispatched', label: 'Dispatched & Handed to Courier', desc: 'Package sealed and handed to logistics partner' },
  { key: 'Delivered', label: 'Successfully Delivered', desc: 'Package arrived at delivery address' },
];

export default function TrackOrderPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [orderQuery, setOrderQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [orderData, setOrderData] = useState<TrackedOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync theme with main storefront
  useEffect(() => {
    const savedTheme = localStorage.getItem('ziel_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('ziel_theme', next ? 'dark' : 'light');
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderQuery.trim().toUpperCase();
    if (!cleanId) return;

    setLoading(true);
    setErrorMessage(null);
    setOrderData(null);
    setSearched(true);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_number, status, created_at, total_amount, payment_method, city, shipping_address')
        .eq('order_number', cleanId)
        .maybeSingle();

      if (error) {
        setErrorMessage('Unable to look up order. Please check your network connection.');
      } else if (!data) {
        setErrorMessage(`No matching record found for "${cleanId}". Please verify the order number on your receipt.`);
      } else {
        setOrderData(data as TrackedOrder);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const normalized = (currentStatus || 'Pending').toLowerCase();

    if (normalized === 'cancelled') return 'cancelled';
    if (normalized === 'freight quote pending') return 'quote_pending';

    const orderHierarchy = ['pending', 'dispatched', 'delivered'];
    const currentIndex = orderHierarchy.indexOf(normalized);
    const stepIndex = orderHierarchy.indexOf(stepKey.toLowerCase());

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const bgMain = isDarkMode ? 'bg-[#141413] text-[#F0EFEA]' : 'bg-[#FAF9F5] text-[#1C1B1A]';
  const headerBg = isDarkMode ? 'bg-[#141413]/85 border-stone-800' : 'bg-[#FAF9F5]/90 border-[#E8E4DC]';
  const cardBg = isDarkMode ? 'bg-[#1A1918] border-stone-800' : 'bg-[#FFFFFF] border-[#E8E4DC]';
  const inputBg = isDarkMode ? 'bg-stone-900 border-stone-700 text-stone-100 focus:border-amber-400' : 'bg-[#FAF9F5] border-[#D9D4C7] text-[#1C1B1A] focus:border-[#1C1B1A]';

  return (
    <main className={`min-h-screen ${bgMain} font-sans antialiased transition-colors duration-300 selection:bg-stone-300 selection:text-stone-900 flex flex-col justify-between`}>
      {/* Top Header */}
      <header className={`sticky top-0 z-30 ${headerBg} backdrop-blur-md border-b px-4 sm:px-12 py-3.5 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="Ziel Store Logo"
              className="h-6 sm:h-8 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-sm sm:text-lg font-bold tracking-[0.05em] uppercase">
              ZIEL<span className={`font-light ml-1 ${isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}`}>STORE</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className={`p-1.5 sm:p-2 rounded-full border transition-all ${
              isDarkMode
                ? 'bg-stone-800 border-stone-700 text-amber-300 hover:bg-stone-700'
                : 'bg-[#EFECE6] border-[#D9D4C7] text-stone-700 hover:bg-[#E5E1D8]'
            }`}
            title="Toggle Light / Dark Mode"
          >
            <span className="text-xs sm:text-sm leading-none">{isDarkMode ? '☀️' : '🌙'}</span>
          </button>

          <Link
            href="/"
            className={`text-xs uppercase tracking-wider font-mono px-4 py-2 rounded-full border transition-all ${
              isDarkMode
                ? 'border-stone-700 hover:border-stone-500 text-stone-200 bg-stone-900'
                : 'border-[#D9D4C7] hover:border-[#1C1B1A] text-[#1C1B1A] bg-[#FFFFFF]'
            }`}
          >
            ← Back To Store
          </Link>
        </div>
      </header>

      {/* Main Track Section */}
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 py-12 sm:py-20 flex flex-col justify-center">
        <div className="text-center mb-8 sm:mb-12">
          <p className={`text-xs uppercase tracking-[0.25em] font-semibold mb-3 ${isDarkMode ? 'text-stone-500' : 'text-[#8C827A]'}`}>
            Live Logistics & Fulfillment
          </p>
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight">
            Track Your <span className={`italic font-normal ${isDarkMode ? 'text-amber-400' : 'text-[#C4883A]'}`}>Delivery</span>
          </h1>
          <p className={`text-xs sm:text-sm mt-3 max-w-md mx-auto leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-[#78716A]'}`}>
            Enter the unique order ID received upon checkout or from your PDF receipt (e.g., <span className="font-mono font-semibold">ZIEL-34821</span>).
          </p>
        </div>

        {/* Search Input Bar */}
        <form onSubmit={handleTrackSubmit} className="mb-10">
          <div className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <input
              type="text"
              required
              placeholder="e.g. ZIEL-12345"
              value={orderQuery}
              onChange={(e) => setOrderQuery(e.target.value.toUpperCase())}
              className={`flex-1 px-5 py-3.5 rounded-2xl border text-sm font-mono tracking-widest uppercase focus:outline-none transition-colors shadow-sm ${inputBg}`}
            />
            <button
              type="submit"
              disabled={loading || !orderQuery.trim()}
              className={`px-8 py-3.5 rounded-2xl text-xs uppercase tracking-widest font-semibold font-mono transition-all shadow-sm ${
                isDarkMode
                  ? 'bg-stone-100 text-stone-900 hover:bg-white'
                  : 'bg-[#1C1B1A] text-[#FAF9F5] hover:bg-[#C4883A]'
              } ${loading || !orderQuery.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Searching...' : 'Check Status'}
            </button>
          </div>
        </form>

        {/* Error Notice */}
        {errorMessage && (
          <div className="max-w-xl mx-auto w-full p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-rose-300 text-xs font-mono text-center mb-8">
            {errorMessage}
          </div>
        )}

        {/* Results Card */}
        {orderData && (
          <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${cardBg} transition-all space-y-6 animate-fadeIn`}>
            {/* Top Bar Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200/20 gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C827A] block">Order Identifier</span>
                <span className="text-xl font-bold font-mono tracking-wider text-current">{orderData.order_number}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-[10px] uppercase font-mono tracking-widest text-[#8C827A] block">Placed On</span>
                <span className="text-xs font-mono text-current">
                  {new Date(orderData.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </span>
              </div>
            </div>

            {/* Special States */}
            {orderData.status === 'Cancelled' ? (
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs font-mono text-center">
                This order has been cancelled. For inquiries regarding reversals or replacements, please contact our concierge team.
              </div>
            ) : orderData.status === 'Freight Quote Pending' ? (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 text-amber-300 text-xs font-mono text-center">
                This order is queued for custom commercial freight calculation. Our logistics manager is weighing your parcel and will reach out with the final airway bill.
              </div>
            ) : (
              /* Linear Progress Stepper */
              <div className="py-4">
                <div className="space-y-6">
                  {STATUS_STEPS.map((step, idx) => {
                    const stepState = getStepStatus(step.key, orderData.status);
                    const isDone = stepState === 'completed';
                    const isCurrent = stepState === 'current';

                    return (
                      <div key={step.key} className="flex items-start space-x-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                              isDone
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                ? 'bg-[#C4883A] text-white ring-4 ring-[#C4883A]/20'
                                : isDarkMode
                                ? 'bg-stone-800 text-stone-500 border border-stone-700'
                                : 'bg-[#EAE8E3] text-stone-400'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          {idx < STATUS_STEPS.length - 1 && (
                            <div
                              className={`w-0.5 h-10 my-1 ${
                                isDone ? 'bg-emerald-500' : isDarkMode ? 'bg-stone-800' : 'bg-stone-200'
                              }`}
                            />
                          )}
                        </div>

                        <div className="pt-1">
                          <h4 className={`text-sm font-semibold ${isCurrent ? (isDarkMode ? 'text-amber-400' : 'text-[#C4883A]') : ''}`}>
                            {step.label}
                          </h4>
                          <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-stone-400' : 'text-[#78716A]'}`}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Destination Metadata Grid */}
            <div className={`p-4 rounded-2xl border text-xs font-mono space-y-2 pt-3 ${
              isDarkMode ? 'bg-stone-900/60 border-stone-800 text-stone-300' : 'bg-[#FAF9F5] border-[#E8E4DC] text-[#1C1B1A]'
            }`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[#8C827A] block uppercase text-[10px]">Payment Type</span>
                  <span className="font-semibold uppercase">{orderData.payment_method}</span>
                </div>
                <div>
                  <span className="text-[#8C827A] block uppercase text-[10px]">Destination City</span>
                  <span className="font-semibold">{orderData.city}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[#8C827A] block uppercase text-[10px]">Delivery Route</span>
                  <span className="text-[#78716A]">{orderData.shipping_address}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Helper Note when nothing is searched yet */}
        {!searched && (
          <div className="text-center text-xs font-mono text-[#8C827A] mt-6">
            Need urgent delivery support? Contact <span className="underline">inquiries@zielstore.com</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className={`border-t py-8 px-6 text-center text-xs font-mono ${
        isDarkMode ? 'border-stone-800 text-stone-500' : 'border-[#E8E4DC] text-[#8C827A]'
      }`}>
        <p>© {new Date().getFullYear()} Ziel Store. Tracked Dispatch & Air Export.</p>
      </footer>
    </main>
  );
}