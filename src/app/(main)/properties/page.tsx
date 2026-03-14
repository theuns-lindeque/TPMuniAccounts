import React from 'react';
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { db } from '@/db';
import { buildings } from '@/db/schema';
import { Building2, Upload, MapPin, Hash, CircleDollarSign, Plus } from 'lucide-react';

export default async function PropertiesPage() {
  const allBuildings = await db.query.buildings.findMany({
    with: {
      utilityAccounts: true,
    },
    orderBy: (buildings, { asc }) => [asc(buildings.name)],
  });

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
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950/50 shadow-sm relative overflow-hidden">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[1px] h-10 bg-teal-500/20 translate-x-[-1px]"></div>
            <div className="absolute top-0 right-0 w-10 h-[1px] bg-teal-500/20 translate-y-[-1px]"></div>
          </div>

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
                    <MapPin size={12} className="text-teal-500" />
                    Street Address
                  </div>
                </th>
                <th className="px-6 py-4 font-bold text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Hash size={12} className="text-teal-500" />
                    Municipal Accounts
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
              {allBuildings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-700">
                        <Building2 size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-900 dark:text-slate-100 font-medium">No properties found</p>
                        <p className="text-xs text-slate-500">Start by uploading a municipal bill to create a property.</p>
                      </div>
                      <Link 
                        href="/upload" 
                        className="mt-2 inline-flex items-center gap-2 text-teal-500 hover:text-teal-600 text-xs font-bold uppercase tracking-widest transition-colors"
                      >
                        <Plus size={14} />
                        Register Property
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                allBuildings.map((building) => (
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
                      <div className="text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {building.address || '—'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1.5 cursor-default">
                        {building.utilityAccounts.length > 0 ? (
                          building.utilityAccounts.map((acc) => (
                            <span 
                              key={acc.id} 
                              className="inline-flex items-center px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] font-mono text-slate-500 dark:text-slate-400"
                              title={acc.type}
                            >
                              {acc.accountNumber}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-300 dark:text-slate-700 italic text-[11px]">No accounts linked</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="font-mono font-bold text-slate-900 dark:text-teal-400">
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

        {allBuildings.length > 0 && (
          <div className="mt-6 flex justify-between items-center px-2">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Showing {allBuildings.length} nodes in registry
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Vault Sync Active</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-20 pt-8 border-t border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 uppercase tracking-[0.2em] flex flex-col gap-2">
        <div className="flex justify-between">
          <p>Registry Layer: 0x8D32-B</p>
          <p>Status: OK</p>
        </div>
        <p className="opacity-50">Authorized Use Only. System v1.8-Edge</p>
      </footer>
    </div>
  );
}

