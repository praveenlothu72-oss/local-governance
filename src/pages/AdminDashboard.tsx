import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { AuditLog, FundAllocation, Village } from '../types';
import { ShieldCheck, History, RefreshCw, Layers } from 'lucide-react';

interface AdminDashboardProps {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  refreshTrigger,
  triggerRefresh
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [allocations, setAllocations] = useState<FundAllocation[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'logs' | 'allocations'>('logs');

  useEffect(() => {
    const fetchData = async () => {
      const audit = await db.getAuditLogs();
      const alloc = await db.getFundAllocations();
      const vills = await db.getVillages();
      setLogs(audit);
      setAllocations(alloc);
      setVillages(vills);
    };
    fetchData();
  }, [refreshTrigger]);

  const totalFundsReceived = 1000000000; // 100 Crores
  const totalAllocated = allocations.reduce((acc, curr) => acc + curr.allocated_amount, 0);
  const remainingInConstituency = totalFundsReceived - totalAllocated;

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all mock database changes back to the default demo seed?')) {
      db.resetSimulationData();
      triggerRefresh();
      alert('Mock database has been reset successfully!');
    }
  };

  const getVillageName = (vId: string) => {
    return villages.find(v => v.id === vId)?.name || 'Unknown Village';
  };

  const formatINR = (value: number) => {
    return `₹${value.toLocaleString('en-IN')}`;
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto font-sans">
      
      {/* Header and Reset shortcut */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
            <ShieldCheck className="text-saffron" size={20} />
            MLA Constituency Admin Console
          </h2>
          <p className="text-xs text-slate-500">Authorized MLA and Auditor general audit panel for managing local constituency funds.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleResetData}
            className="flex items-center gap-2 py-2 px-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700 bg-white transition-colors"
          >
            <RefreshCw size={14} />
            <span>Reset Demo DB</span>
          </button>
        </div>
      </div>

      {/* Basic Metrics Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden">
          <p className="text-[10px] font-bold text-saffron uppercase">Constituency Fund Received</p>
          <h3 className="text-lg md:text-xl font-extrabold">{formatINR(totalFundsReceived)}</h3>
          <p className="text-[9px] text-slate-400">Total available for 2025-2026 allocation</p>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Allocated Budget</p>
          <h3 className="text-lg md:text-xl font-extrabold text-slate-800">{formatINR(totalAllocated)}</h3>
          <p className="text-[9px] text-slate-400">Total allocated to villages across categories</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Available Reserve Balance</p>
          <h3 className="text-lg md:text-xl font-extrabold text-emerald-600">{formatINR(remainingInConstituency)}</h3>
          <p className="text-[9px] text-slate-400">Balance in Indore treasury reserve</p>
        </div>
      </div>

      {/* Inner Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`
            px-4 py-2 font-bold text-xs transition-all border-b-2
            ${activeSubTab === 'logs' 
              ? 'border-saffron text-slate-800' 
              : 'border-transparent text-slate-400 hover:text-slate-600'}
          `}
        >
          <div className="flex items-center gap-1.5">
            <History size={14} />
            <span>Audit Trail Logs</span>
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('allocations')}
          className={`
            px-4 py-2 font-bold text-xs transition-all border-b-2
            ${activeSubTab === 'allocations' 
              ? 'border-saffron text-slate-800' 
              : 'border-transparent text-slate-400 hover:text-slate-600'}
          `}
        >
          <div className="flex items-center gap-1.5">
            <Layers size={14} />
            <span>Village Budgets Allocation List</span>
          </div>
        </button>
      </div>

      {/* Sub-tab 1: Logs */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3 p-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Blockchain Audit Trail Verification</h3>
          
          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[350px] pr-1">
            {logs.length > 0 ? (
              logs.map(log => (
                <div key={log.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{log.user_name}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border text-[9px] font-bold">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Entity: {log.entity_type} | ID: <span className="font-mono text-slate-500">{log.entity_id}</span>
                    </p>
                    <div className="p-2 rounded bg-slate-50 text-[10px] text-slate-600 flex flex-col gap-0.5">
                      <span><strong>New State:</strong> {JSON.stringify(log.new_value)}</span>
                      {log.old_value && <span><strong>Previous State:</strong> {JSON.stringify(log.old_value)}</span>}
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right shrink-0">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 text-xs py-8">No audit logs recorded.</p>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Fund allocations list */}
      {activeSubTab === 'allocations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-150 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Village Allocation List</h3>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-3">Village</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Allocated Amount</th>
                  <th className="p-3">Used Amount</th>
                  <th className="p-3">Financial Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allocations.map(alloc => (
                  <tr key={alloc.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800">{getVillageName(alloc.village_id)}</td>
                    <td className="p-3">{alloc.category}</td>
                    <td className="p-3 font-bold text-slate-700">{formatINR(alloc.allocated_amount)}</td>
                    <td className="p-3 text-slate-600">{formatINR(alloc.used_amount)}</td>
                    <td className="p-3 text-slate-400 font-mono">{alloc.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminDashboard;
