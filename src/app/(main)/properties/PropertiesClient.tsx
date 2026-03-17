"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, Upload, MapPin, Hash, CircleDollarSign, Plus, X, Globe } from 'lucide-react';
import { createBuildingAction } from '@/app/(main)/actions/buildings';

const REGIONS = ['All', 'Gauteng', 'Eastern Cape', 'Western Cape', 'Students'] as const;

interface Building {
  id: string;
  name: string;
  address: string | null;
  municipalValue: string | null;
  region: 'Gauteng' | 'Eastern Cape' | 'Western Cape' | 'Students';
  utilityAccounts: {
    id: string;
    accountNumber: string;
    type: string;
  }[];
}

export default function PropertiesClient({ initialBuildings }: { initialBuildings: Building[] }) {
  const [selectedRegion, setSelectedRegion] = useState<typeof REGIONS[number]>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredBuildings = selectedRegion === 'All' 
    ? initialBuildings 
    : initialBuildings.filter(b => b.region === selectedRegion);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      address: formData.get('address') as string,
      municipalValue: formData.get('municipalValue') as string,
      region: formData.get('region') as any,
    };

    const result = await createBuildingAction(data);
    if (result.success) {
      setIsModalOpen(false);
      window.location.reload(); // Quick refresh to show new data
    } else {
      setError(result.error || 'Failed to create building');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-4 sm:p-8 font-sans">
      <header className="mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 dark:border-slate-800 pb-4 sm:pb-6 gap-6">
        <div>
          <div className="flex items-center gap-2 text-teal-500 mb-1">
            <Building2 size={14} className="sm:size-4" />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">Portfolio Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Properties</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white text-xs font-bold uppercase tracking-widest rounded transition-all hover:opacity-90 shadow-lg shadow-slate-500/10"
          >
            <Plus size={14} />
            Register Property
          </button>
          <Link 
            href="/upload?type=recovery" 
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-widest rounded transition-all border border-slate-200 dark:border-slate-700"
          >
            <Upload size={14} className="text-teal-500" />
            Upload Recovery
          </Link>
          <Link 
            href="/upload?type=bill" 
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold uppercase tracking-widest rounded transition-all shadow-lg shadow-teal-500/10"
          >
            <Upload size={14} />
            Upload Bills
          </Link>
        </div>
      </header>

      <main>
        {/* Region Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => setSelectedRegion(region)}
              className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                selectedRegion === region 
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950/50 shadow-sm relative overflow-hidden">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Building2 size={12} className="text-teal-500" />
                    Property Name
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Globe size={12} className="text-teal-500" />
                    Region
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-teal-500" />
                    Street Address
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <CircleDollarSign size={12} className="text-teal-500" />
                    Municipal Value
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {filteredBuildings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700">
                        <Building2 size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-900 dark:text-slate-100 font-medium">No properties found in {selectedRegion}</p>
                        <p className="text-xs text-slate-500">Register a new property to get started.</p>
                      </div>
                      <button 
                        onClick={() => setIsModalOpen(true)}
                        className="mt-2 inline-flex items-center gap-2 text-teal-500 hover:text-teal-600 text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        <Plus size={14} />
                        Register Property
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBuildings.map((building) => (
                  <tr key={building.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-all duration-200">
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                        {building.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">
                        UUID: {building.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {building.region}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-slate-600 dark:text-slate-400 max-w-xs truncate text-[13px]">
                        {building.address || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="font-mono font-bold text-slate-900 dark:text-teal-400 text-[13px]">
                        {building.municipalValue 
                          ? `R ${parseFloat(building.municipalValue).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          : '—'
                        }
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredBuildings.length > 0 && (
          <div className="mt-6 flex justify-between items-center px-2 text-[10px] font-mono text-slate-400 uppercase tracking-widest">
            <div>Showing {filteredBuildings.length} active nodes</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span>System Synchronized</span>
            </div>
          </div>
        )}
      </main>

      {/* Register Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Register New Property</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Property Name</label>
                <input required name="name" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Oak Ridge Office Park" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Street Address</label>
                <input name="address" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 123 Main St, Cape Town" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Region</label>
                  <select name="region" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none appearance-none">
                    {REGIONS.filter(r => r !== 'All').map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Municipal Value (ZAR)</label>
                  <input name="municipalValue" type="number" step="0.01" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="3200000.00" />
                </div>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 bg-teal-500 hover:bg-teal-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-teal-500/20 transition-all flex justify-center items-center gap-2"
              >
                {isSubmitting ? 'Registering...' : 'Complete Registration'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
