import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { FundAllocation, Village, Project } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { IndianRupee, PieChartIcon, BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';

interface FundTransparencyProps {
  refreshTrigger: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#e53e3e'];

export const FundTransparency: React.FC<FundTransparencyProps> = ({ refreshTrigger }) => {
  const [allocations, setAllocations] = useState<FundAllocation[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const allocs = await db.getFundAllocations();
      const vills = await db.getVillages();
      const projs = await db.getProjects();
      setAllocations(allocs);
      setVillages(vills);
      setProjects(projs);
    };
    fetchData();
  }, [refreshTrigger]);

  const totalFundsReceived = 1000000000; // 100 Crores
  const totalAllocated = allocations.reduce((acc, curr) => acc + curr.allocated_amount, 0);
  const totalUsed = projects.reduce((acc, curr) => acc + curr.amount_spent, 0);
  const remainingInConstituency = totalFundsReceived - totalAllocated;

  // Chart Data 1: Village wise Allocation
  const villageChartData = villages.map(v => {
    const villageAlloc = allocations
      .filter(a => a.village_id === v.id)
      .reduce((acc, curr) => acc + curr.allocated_amount, 0);
    const villageUsed = projects
      .filter(p => p.village_id === v.id)
      .reduce((acc, curr) => acc + curr.amount_spent, 0);

    return {
      name: v.name.replace(' Village', ''),
      Allocated: villageAlloc,
      Spent: villageUsed
    };
  });

  // Chart Data 2: Category wise Allocation & Spending
  const categoryAllocationsMap: { [key: string]: { allocated: number, spent: number } } = {};
  allocations.forEach(a => {
    if (!categoryAllocationsMap[a.category]) {
      categoryAllocationsMap[a.category] = { allocated: 0, spent: 0 };
    }
    categoryAllocationsMap[a.category].allocated += a.allocated_amount;
  });

  projects.forEach(p => {
    if (!categoryAllocationsMap[p.category]) {
      categoryAllocationsMap[p.category] = { allocated: 0, spent: 0 };
    }
    categoryAllocationsMap[p.category].spent += p.amount_spent;
  });

  const categoryChartData = Object.keys(categoryAllocationsMap).map(key => ({
    name: key,
    value: categoryAllocationsMap[key].spent || categoryAllocationsMap[key].allocated // Show spent, fallback to alloc
  })).filter(c => c.value > 0);

  // Format currency for human readability in Crores / Lakhs
  const formatINR = (value: number) => {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${value.toLocaleString('en-IN')}`;
  };

  const getPercentageUsed = (allocated: number, used: number) => {
    if (allocated === 0) return 0;
    return Math.min(Math.round((used / allocated) * 100), 100);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1 */}
        <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-3 relative overflow-hidden">
          <div className="absolute right-2 -bottom-2 opacity-5 text-white">
            <IndianRupee size={80} />
          </div>
          <p className="text-[10px] font-bold text-saffron uppercase tracking-wider leading-none">Total Constituency Fund</p>
          <h3 className="text-xl md:text-2xl font-black">{formatINR(totalFundsReceived)}</h3>
          <p className="text-[10px] text-slate-400">Financial Year 2025-26 | Approved by State</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Allocated to Villages</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-800">{formatINR(totalAllocated)}</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>{((totalAllocated / totalFundsReceived) * 100).toFixed(1)}% allocated from treasury</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Total Funds Spent</p>
          <h3 className="text-xl md:text-2xl font-black text-slate-800">{formatINR(totalUsed)}</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            <span>{((totalUsed / totalAllocated) * 100).toFixed(1)}% utilization of allocated funds</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none">Unallocated Treasury Balance</p>
          <h3 className="text-xl md:text-2xl font-black text-emerald-600">{formatINR(remainingInConstituency)}</h3>
          <p className="text-[10px] text-slate-400">Retained in District Reserve for emergencies</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Village Allocation Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <BarChart3 className="text-slate-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Village-wise Allocation vs Expenditure</h3>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={villageChartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis tickFormatter={(val) => `₹${val / 10000000}Cr`} stroke="#64748b" />
                <Tooltip formatter={(value: any) => formatINR(value)} labelStyle={{ fontWeight: 'bold' }} />
                <Legend />
                <Bar dataKey="Allocated" fill="#1e3a8a" name="Allocated Budget" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Spent" fill="#ea580c" name="Amount Spent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category spending Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <PieChartIcon className="text-slate-600" size={18} />
            <h3 className="font-bold text-slate-800 text-sm">Development Category Spending</h3>
          </div>
          <div className="h-64 w-full flex flex-col md:flex-row items-center justify-center text-xs">
            {categoryChartData.length > 0 ? (
              <>
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={75}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryChartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => formatINR(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 flex flex-col gap-2 p-2 max-h-56 overflow-y-auto">
                  {categoryChartData.map((item, idx) => (
                    <div key={item.name} className="flex items-center justify-between text-slate-600 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{formatINR(item.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-slate-400 text-center py-10">No categories allocated yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Category-wise Spending Progress Bars */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <TrendingUp size={18} className="text-slate-600" />
            Budget Utilization Progress by Category
          </h3>
          <span className="text-[10px] text-slate-400 font-bold uppercase">Real-Time Sync</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.keys(categoryAllocationsMap).map((cat) => {
            const allocVal = categoryAllocationsMap[cat].allocated;
            const spentVal = categoryAllocationsMap[cat].spent;
            const percentage = getPercentageUsed(allocVal, spentVal);
            
            return (
              <div key={cat} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{cat}</span>
                  <span className="text-slate-500 font-medium">
                    {formatINR(spentVal)} of {formatINR(allocVal)} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage > 100 ? 'bg-red-500' 
                      : percentage === 100 ? 'bg-emerald-500' 
                      : 'bg-blue-600'
                    }`} 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                {percentage > 100 && (
                  <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
                    ⚠️ ALERT: Budget overspent by {percentage - 100}%! Flags generated in AI engine.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audit & Trust Section */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4">
        <div className="p-3 bg-emerald-600 text-white rounded-xl">
          <ShieldCheck size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-slate-800 text-sm">Blockchain-Inspired Audit Trail Active</h4>
          <p className="text-xs text-slate-600 leading-normal">
            Every transaction, project launch, and status update undergoes digital signature verification. State Auditors have access to read-only logs that track historical budget records. View logs inside the MLA Console or Auditor Dashboard.
          </p>
        </div>
      </div>
    </div>
  );
};
export default FundTransparency;
