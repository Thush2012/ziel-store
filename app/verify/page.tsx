'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

interface BatchRecord {
  batch_number: string;
  product_name: string;
  category: string;
  harvest_date: string;
  bottling_date: string;
  abv: string;
  ph_level: number;
  aging_months: number;
  origin_region: string;
  tasting_notes: string;
  lab_certified: boolean;
}

export default function VerifyPage() {
  const [inputBatch, setInputBatch] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BatchRecord | null>(null);
  const [searched, setSearched] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputBatch.trim()) return;

    setLoading(true);
    setSearched(true);
    setResult(null);

    const cleanInput = inputBatch.trim().toUpperCase();

    try {
      const { data, error } = await supabase
        .from('batches')
        .select('*')
        .ilike('batch_number', cleanInput)
        .single();

      if (!error && data) {
        setResult(data as BatchRecord);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#121212] text-[#F3F2EE] font-mono p-6 sm:p-12 flex flex-col justify-between">
      <header className="max-w-4xl mx-auto w-full flex justify-between items-center pb-8 border-b border-stone-800">
        <Link href="/" className="text-sm uppercase tracking-wider font-bold hover:text-amber-400 transition-colors">
          ← Ziel Store
        </Link>
        <span className="text-[10px] uppercase tracking-widest text-stone-500">
          Authenticity & Quality Registry
        </span>
      </header>

      <div className="max-w-2xl mx-auto w-full my-auto py-12">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-2xl mx-auto mb-4">
            ⚜️
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-light tracking-tight text-white mb-2">
            Verify Batch Authenticity
          </h1>
          <p className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
            Enter the batch identifier printed on your bottle neck tag or soap packaging to inspect fermentation logs, lab test certification, and origin.
          </p>
        </div>

        <form onSubmit={handleVerify} className="flex gap-2 max-w-md mx-auto mb-8">
          <input
            type="text"
            required
            placeholder="e.g. BATCH-04 or ZG-01"
            value={inputBatch}
            onChange={(e) => setInputBatch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-stone-700 bg-stone-900 text-white text-xs tracking-wider uppercase focus:outline-none focus:border-amber-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl text-xs uppercase tracking-widest font-bold bg-amber-500 text-stone-950 hover:bg-amber-400 transition-colors shrink-0 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Verify'}
          </button>
        </form>

        {searched && !loading && !result && (
          <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 text-center max-w-md mx-auto">
            <span className="text-2xl block mb-2">⚠️</span>
            <p className="text-xs text-rose-300 font-semibold mb-1">Batch Record Not Found</p>
            <p className="text-[11px] text-stone-400">
              No laboratory registration matching "{inputBatch.toUpperCase()}". Please confirm the code printed on the physical label.
            </p>
          </div>
        )}

        {result && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#1A1918] border border-amber-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-start border-b border-stone-800 pb-4 mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold block mb-1">
                  Verified Genuine Product
                </span>
                <h2 className="text-xl font-sans font-medium text-white">{result.product_name}</h2>
                <span className="text-xs text-stone-400">Batch Code: {result.batch_number}</span>
              </div>
              {result.lab_certified && (
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
                  ✓ Lab Certified
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mb-6">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block">Harvest Date</span>
                <span className="text-stone-200 font-semibold">{result.harvest_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block">Bottling Date</span>
                <span className="text-stone-200 font-semibold">{result.bottling_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block">Origin</span>
                <span className="text-stone-200 font-semibold">{result.origin_region}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block">ABV / Strength</span>
                <span className="text-stone-200 font-semibold">{result.abv}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block">pH Balance</span>
                <span className="text-stone-200 font-semibold">{result.ph_level}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 block">Maturation</span>
                <span className="text-stone-200 font-semibold">{result.aging_months} Months</span>
              </div>
            </div>

            {result.tasting_notes && (
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs">
                <span className="text-[10px] uppercase tracking-wider text-amber-500 block font-semibold mb-1">
                  Sensory & Chemical Notes
                </span>
                <p className="text-stone-300 leading-relaxed italic">
                  "{result.tasting_notes}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="text-center text-[10px] text-stone-600 uppercase tracking-widest pt-8 border-t border-stone-900">
        Ziel Store Quality Control Laboratory • Western Province, Sri Lanka
      </footer>
    </main>
  );
}