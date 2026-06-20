import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import type { Project, Issue, Village } from '../types';
import { InteractiveMap } from '../components/InteractiveMap';
import { 
  Briefcase, CheckCircle, Clock, AlertTriangle, 
  ArrowRight, Search, Map 
} from 'lucide-react';

interface CitizenDashboardProps {
  setActivePage: (page: string) => void;
  setSelectedProjectId: (id: string) => void;
  refreshTrigger: number;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  setActivePage,
  setSelectedProjectId,
  refreshTrigger
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [selectedVillageFilter, setSelectedVillageFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      const projs = await db.getProjects();
      const iss = await db.getIssues();
      const vills = await db.getVillages();
      setProjects(projs);
      setIssues(iss);
      setVillages(vills);
    };
    fetchData();
  }, [refreshTrigger]);

  const handleProjectClick = (project: Project) => {
    setSelectedProjectId(project.id);
    setActivePage('project-details');
  };

  const handleIssueClick = (_issue: Issue) => {
    setActivePage('vote-issue');
  };

  const getVillageName = (villageId: string) => {
    return villages.find(v => v.id === villageId)?.name || 'Unknown Village';
  };

  // Filter logic
  const filteredProjects = projects.filter(proj => {
    const matchesVillage = selectedVillageFilter === 'all' || proj.village_id === selectedVillageFilter;
    const matchesCategory = selectedCategoryFilter === 'all' || proj.category === selectedCategoryFilter;
    const matchesSearch = proj.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          proj.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVillage && matchesCategory && matchesSearch;
  });

  // Basic stats
  const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
  const activeCount = projects.filter(p => p.status === 'UNDER_WORK').length;
  const delayedCount = projects.filter(p => {
    if (p.status !== 'UNDER_WORK') return false;
    if (!p.expected_end_date) return false;
    // Current simulated date is 2026-06-20
    return new Date(p.expected_end_date) < new Date('2026-06-20');
  }).length;

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-800 border border-green-200">COMPLETED</span>;
      case 'UNDER_WORK':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-yellow-100 text-yellow-800 border border-yellow-200">UNDER WORK</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-100 text-red-800 border border-red-200">REJECTED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-blue-100 text-blue-800 border border-blue-200">PENDING</span>;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-lg">
            <Briefcase size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Total Projects</p>
            <p className="text-lg md:text-xl font-extrabold text-slate-800 mt-1">{projects.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-emerald-500 uppercase leading-none">Completed Works</p>
            <p className="text-lg md:text-xl font-extrabold text-slate-800 mt-1">{completedCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-yellow-500 uppercase leading-none">Ongoing Works</p>
            <p className="text-lg md:text-xl font-extrabold text-slate-800 mt-1">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-red-500 uppercase leading-none">Delayed / Delayed Projects</p>
            <p className="text-lg md:text-xl font-extrabold text-slate-800 mt-1">{delayedCount}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Map & Filterable Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Map & Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map Container */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                <Map size={18} className="text-slate-600" />
                Constituency Project Map (OSM)
              </h2>
              <span className="text-[10px] text-slate-400 font-semibold">Interactive markers</span>
            </div>
            <div className="h-[350px] w-full rounded-xl overflow-hidden relative">
              <InteractiveMap 
                projects={projects}
                issues={issues}
                onProjectClick={handleProjectClick}
                onIssueClick={handleIssueClick}
              />
            </div>
          </div>

          {/* Projects List Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table Header / Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="font-bold text-slate-800 text-sm">Constituency Project Registry</h3>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-saffron w-40"
                  />
                </div>
                
                {/* Village Filter */}
                <select
                  value={selectedVillageFilter}
                  onChange={(e) => setSelectedVillageFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                >
                  <option value="all">All Villages</option>
                  {villages.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="Roads">Roads</option>
                  <option value="Water">Water</option>
                  <option value="Schools">Schools</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Streetlights">Streetlights</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-200 overflow-y-auto max-h-[350px]">
              {filteredProjects.length > 0 ? (
                filteredProjects.map(project => (
                  <div 
                    key={project.id} 
                    onClick={() => handleProjectClick(project)}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-800 text-xs group-hover:text-saffron transition-colors">{project.title}</h4>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {getVillageName(project.village_id)} | Category: <strong className="text-slate-500">{project.category}</strong>
                      </p>
                      <p className="text-xs text-slate-600 line-clamp-1 leading-normal max-w-lg">{project.description}</p>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6 text-right">
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Budget Allocated</p>
                        <p className="text-xs font-extrabold text-slate-800 mt-1">₹{project.budget_allocated.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="p-1 rounded bg-slate-100 text-slate-400 group-hover:bg-saffron group-hover:text-slate-950 transition-colors">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No projects match your current filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Bulletins & Quick Links */}
        <div className="space-y-6">
          {/* Civic Guidelines Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm tracking-wider uppercase text-saffron">Citizen Voice</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Viksit Bharat 2047 aims to build digital trust. Citizens can raise local, public grievances with exact geo-coordinates. Issues with 5 or more upvotes escalate automatically to the Divisional Commissioner.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => setActivePage('raise-issue')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-saffron text-slate-950 font-bold rounded-lg hover:bg-orange-400 transition-colors text-xs"
              >
                <span>Report Public Issue</span>
                <ArrowRight size={12} />
              </button>
              <button
                onClick={() => setActivePage('vote-issue')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 text-slate-200 font-semibold rounded-lg hover:bg-slate-700 transition-colors text-xs"
              >
                <span>Upvote Issues</span>
              </button>
            </div>
          </div>

          {/* Recent Active Issues Feed */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recent Local Issues</h3>
              <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-800 rounded font-semibold">{issues.length} Total</span>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-1">
              {issues.slice(0, 5).map(issue => (
                <div key={issue.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-slate-500">{getVillageName(issue.village_id)}</span>
                    <span className={`px-1.5 py-0.2 text-[8px] font-bold rounded ${
                      issue.urgency === 'CRITICAL' ? 'bg-red-100 text-red-800' 
                      : issue.urgency === 'HIGH' ? 'bg-orange-100 text-orange-800' 
                      : 'bg-blue-100 text-blue-800'
                    }`}>{issue.urgency}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-700 leading-tight line-clamp-1">{issue.title}</h4>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>👍 {issue.upvote_count} Upvotes</span>
                    <span className="font-semibold text-slate-500 uppercase text-[9px]">{issue.escalation_status}</span>
                  </div>
                </div>
              ))}
              <button
                onClick={() => setActivePage('vote-issue')}
                className="w-full text-center text-xs text-saffron font-bold hover:underline py-1 block"
              >
                View all active complaints
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CitizenDashboard;
