import React from 'react';
import { Menu, User } from 'lucide-react';
import type { UserRole, Profile } from '../types';
import { SIMULATED_USERS, isSupabaseConfigured } from '../services/db';

interface NavbarProps {
  currentUser: Profile | null;
  onUserChange: (userId: string) => void;
  setSidebarOpen: (open: boolean) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onUserChange,
  setSidebarOpen,
  activePage
}) => {
  const getPageTitle = () => {
    switch (activePage) {
      case 'landing': return 'Viksit Bharat Local Governance 2047';
      case 'citizen-dash': return 'Citizen Governance Portal';
      case 'fund-dash': return 'Constituency Fund Transparency';
      case 'village-dash': return 'Village Budgets & Performance';
      case 'project-details': return 'Project Work Details & Audits';
      case 'raise-issue': return 'Raise Public Issue / Complaint';
      case 'vote-issue': return 'Citizen Civic Voting Center';
      case 'admin': return 'MLA Constituency Admin Console';
      case 'contractor-upload': return 'Contractor Digital Upload Portal';
      case 'authority-review': return 'District Authority Review Panel';
      case 'analytics': return 'Smart AI Anomaly Analytics';
      default: return 'Local Governance Dashboard';
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'MLA': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Authority': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contractor': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Auditor': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <header className="h-16 px-4 flex items-center justify-between border-b border-slate-200 bg-white shadow-sm sticky top-0 z-30">
      {/* Mobile Toggle & Title */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setSidebarOpen(true)}
          className="p-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-bold text-slate-800 text-sm md:text-base leading-tight">
            {getPageTitle()}
          </h1>
          <div className="hidden md:flex items-center gap-1.5 mt-0.5">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></span>
            <span className="text-[10px] text-slate-500">
              {isSupabaseConfigured 
                ? 'Database Connected: Supabase Cloud' 
                : 'Prototype Mode: Local Simulation Database Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Profile & Switcher */}
      <div className="flex items-center gap-3">
        {/* Connection status for mobile */}
        <div className="md:hidden flex items-center justify-center p-1 rounded-full bg-slate-100">
          <span className={`inline-block w-2.5 h-2.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-orange-500'}`} title={isSupabaseConfigured ? 'Supabase Active' : 'Simulation Mode'} />
        </div>

        {/* Simulated Role Selection */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm">
          <User size={14} className="text-slate-500 hidden sm:inline" />
          <div className="flex flex-col sm:mr-1">
            <label className="text-[8px] text-slate-400 font-bold uppercase leading-none">Demonstration Persona</label>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => onUserChange(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none p-0 cursor-pointer focus:ring-0"
            >
              {SIMULATED_USERS.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          {currentUser && (
            <span className={`hidden md:inline px-2 py-0.5 text-[10px] font-bold rounded-full border ${getRoleBadgeColor(currentUser.role)}`}>
              {currentUser.role}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
