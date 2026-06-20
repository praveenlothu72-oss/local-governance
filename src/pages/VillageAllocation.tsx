import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { Village, Project, Issue, FundAllocation } from '../types';
import { Star, MapPin, Briefcase, ArrowRight, ShieldAlert } from 'lucide-react';

interface VillageAllocationProps {
  setActivePage: (page: string) => void;
  setSelectedProjectId: (id: string) => void;
  refreshTrigger: number;
}

export const VillageAllocation: React.FC<VillageAllocationProps> = ({
  setActivePage,
  setSelectedProjectId,
  refreshTrigger
}) => {
  const [villages, setVillages] = useState<Village[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [allocations, setAllocations] = useState<FundAllocation[]>([]);
  const [selectedVillageId, setSelectedVillageId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const vills = await db.getVillages();
      const projs = await db.getProjects();
      const iss = await db.getIssues();
      const allocs = await db.getFundAllocations();
      setVillages(vills);
      setProjects(projs);
      setIssues(iss);
      setAllocations(allocs);
    };
    fetchData();
  }, [refreshTrigger]);

  const getVillageBudget = (villageId: string) => {
    return allocations
      .filter(a => a.village_id === villageId)
      .reduce((acc, curr) => acc + curr.allocated_amount, 0);
  };

  const getVillageSatisfaction = (villageId: string) => {
    const villageProjects = projects.filter(p => p.village_id === villageId && p.quality_rating !== null);
    if (villageProjects.length === 0) return 'No reviews';
    const sum = villageProjects.reduce((acc, curr) => acc + (curr.quality_rating || 0), 0);
    return (sum / villageProjects.length).toFixed(1);
  };

  const handleViewProjectDetails = (projId: string) => {
    setSelectedProjectId(projId);
    setActivePage('project-details');
  };

  const selectedVillage = villages.find(v => v.id === selectedVillageId);
  const selectedVillageProjects = projects.filter(p => p.village_id === selectedVillageId);
  const selectedVillageIssues = issues.filter(i => i.village_id === selectedVillageId);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      
      {/* Introduction */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
        <h2 className="font-bold text-slate-800 text-sm md:text-base">Village-Level Budget Allocation & Audit</h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Constituency resources are allocated directly to village committees. Tap on a village card to inspect line-item budgets, ongoing works, quality ratings, and unresolved public issues.
        </p>
      </div>

      {/* Grid of Villages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {villages.map(village => {
          const budget = getVillageBudget(village.id);
          const villageProjects = projects.filter(p => p.village_id === village.id);
          const ongoing = villageProjects.filter(p => p.status === 'UNDER_WORK').length;
          const completed = villageProjects.filter(p => p.status === 'COMPLETED').length;
          const complaints = issues.filter(i => i.village_id === village.id && i.status !== 'COMPLETED' && i.status !== 'REJECTED').length;
          const rating = getVillageSatisfaction(village.id);

          const isSelected = selectedVillageId === village.id;

          return (
            <div 
              key={village.id}
              onClick={() => setSelectedVillageId(isSelected ? null : village.id)}
              className={`
                bg-white p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4
                ${isSelected 
                  ? 'border-saffron ring-1 ring-orange-200 shadow-md' 
                  : 'border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md'}
              `}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-slate-600" />
                  <h3 className="font-bold text-slate-800 text-sm">{village.name}</h3>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">
                  <Star size={12} fill="currentColor" />
                  <span>{rating}</span>
                </div>
              </div>

              {/* Card Stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Allocated Budget</p>
                  <p className="font-extrabold text-slate-800 mt-1">₹{budget.toLocaleString('en-IN')}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Active / Total Projects</p>
                  <p className="font-extrabold text-slate-800 mt-1">{ongoing} / {villageProjects.length}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Completed Projects</p>
                  <p className="font-extrabold text-slate-800 mt-1">{completed}</p>
                </div>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Pending Complaints</p>
                  <p className="font-extrabold text-red-600 mt-1">{complaints}</p>
                </div>
              </div>

              {/* Click to expand details */}
              <div className="text-[10px] font-bold text-saffron flex items-center justify-between pt-2 border-t border-slate-100">
                <span>{isSelected ? 'Click to hide details' : 'Click to audit village works'}</span>
                <ArrowRight size={12} className={isSelected ? 'rotate-90 transition-transform' : 'transition-transform'} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Village details section */}
      {selectedVillage && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">{selectedVillage.name} Development Audit</h3>
              <p className="text-xs text-slate-400 mt-0.5">Population: {selectedVillage.population.toLocaleString()} citizens</p>
            </div>
            <button 
              onClick={() => setSelectedVillageId(null)}
              className="text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Close Details
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Projects list */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase size={14} className="text-slate-500" />
                Village Projects ({selectedVillageProjects.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                {selectedVillageProjects.length > 0 ? (
                  selectedVillageProjects.map(proj => (
                    <div 
                      key={proj.id} 
                      onClick={() => handleViewProjectDetails(proj.id)}
                      className="p-3 hover:bg-slate-100 transition-colors cursor-pointer flex justify-between items-center text-xs group"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-700 group-hover:text-saffron">{proj.title}</span>
                        <p className="text-[10px] text-slate-400">Category: {proj.category} | Spent: ₹{proj.amount_spent.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          proj.status === 'COMPLETED' ? 'bg-green-100 text-green-800' 
                          : proj.status === 'UNDER_WORK' ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                        }`}>{proj.status}</span>
                        <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-slate-400 text-xs">No projects allocated to this village yet.</p>
                )}
              </div>
            </div>

            {/* Issues list */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-slate-500" />
                Unresolved Village Issues ({selectedVillageIssues.filter(i => i.status !== 'COMPLETED').length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-slate-50">
                {selectedVillageIssues.length > 0 ? (
                  selectedVillageIssues.map(issue => (
                    <div 
                      key={issue.id} 
                      onClick={() => setActivePage('vote-issue')}
                      className="p-3 hover:bg-slate-100 transition-colors cursor-pointer flex justify-between items-center text-xs group"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-700 group-hover:text-saffron">⚠️ {issue.title}</span>
                        <p className="text-[10px] text-slate-400">Urgency: <strong className="text-slate-500">{issue.urgency}</strong> | Upvotes: {issue.upvote_count}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
                          issue.escalation_status === 'ESCALATED' ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                          : 'bg-slate-100 text-slate-800'
                        }`}>{issue.escalation_status}</span>
                        <ArrowRight size={12} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="p-4 text-center text-slate-400 text-xs">No active citizen complaints reported here.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default VillageAllocation;
