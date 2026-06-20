import React from 'react';
import { 
  Home, Globe, IndianRupee, MapPin, AlertCircle, ThumbsUp, 
  BarChart3, Shield, Upload, FileText, X
} from 'lucide-react';
import type { UserRole } from '../types';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  userRole: UserRole;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  userRole,
  sidebarOpen,
  setSidebarOpen
}) => {
  const menuItems = [
    { id: 'landing', label: 'Home / Landing', icon: Home, roles: ['Citizen', 'MLA', 'Authority', 'Contractor', 'Auditor'] },
    { id: 'citizen-dash', label: 'Citizen Portal', icon: Globe, roles: ['Citizen', 'MLA', 'Authority', 'Contractor', 'Auditor'] },
    { id: 'fund-dash', label: 'Constituency Funds', icon: IndianRupee, roles: ['Citizen', 'MLA', 'Authority', 'Contractor', 'Auditor'] },
    { id: 'village-dash', label: 'Village Allocations', icon: MapPin, roles: ['Citizen', 'MLA', 'Authority', 'Contractor', 'Auditor'] },
    { id: 'raise-issue', label: 'Raise Public Issue', icon: AlertCircle, roles: ['Citizen', 'MLA', 'Authority', 'Contractor', 'Auditor'] },
    { id: 'vote-issue', label: 'Civic Voting Center', icon: ThumbsUp, roles: ['Citizen', 'MLA', 'Authority', 'Contractor', 'Auditor'] },
    { id: 'analytics', label: 'Smart Analytics', icon: BarChart3, roles: ['Citizen', 'MLA', 'Authority', 'Contractor', 'Auditor'] },
  ];

  const roleRestrictedItems = [
    { id: 'admin', label: 'MLA Admin Console', icon: Shield, roles: ['MLA', 'Auditor'] },
    { id: 'authority-review', label: 'Authority Panel', icon: FileText, roles: ['Authority', 'Auditor'] },
    { id: 'contractor-upload', label: 'Contractor Portal', icon: Upload, roles: ['Contractor', 'Auditor'] },
  ];

  const handleNavClick = (pageId: string) => {
    setActivePage(pageId);
    setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Shell */}
      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r border-slate-200 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2">
            <span className="text-xl">🇮🇳</span>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-white tracking-wider uppercase">Viksit Bharat 2047</span>
              <span className="text-[10px] text-saffron font-semibold tracking-tight">LOCAL GOVERNANCE</span>
            </div>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sidebar Nav Content */}
        <nav className="flex-1 px-3 py-4 space-y-7 overflow-y-auto">
          {/* Main Public Menu */}
          <div>
            <p className="px-3 mb-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Citizen Services</p>
            <ul className="space-y-1">
              {menuItems.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id || (item.id === 'citizen-dash' && activePage === 'project-details');
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleNavClick(item.id)}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors
                        ${isActive 
                          ? 'bg-slate-800 text-white border-l-2 border-saffron' 
                          : 'hover:bg-slate-800/50 hover:text-white text-slate-400'}
                      `}
                    >
                      <Icon size={16} className={isActive ? 'text-saffron' : 'text-slate-500'} />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Role Restricted Admin Menu */}
          <div>
            <p className="px-3 mb-2 text-[9px] font-bold text-slate-500 uppercase tracking-wider">Internal Portals</p>
            <ul className="space-y-1">
              {roleRestrictedItems.map(item => {
                const Icon = item.icon;
                const isAuthorized = item.roles.includes(userRole);
                const isActive = activePage === item.id;
                
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => isAuthorized ? handleNavClick(item.id) : null}
                      disabled={!isAuthorized}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all
                        ${!isAuthorized 
                          ? 'opacity-40 cursor-not-allowed text-slate-600' 
                          : isActive 
                            ? 'bg-slate-800 text-white border-l-2 border-emerald-500' 
                            : 'hover:bg-slate-800/50 hover:text-white text-slate-400'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={16} className={isActive ? 'text-emerald-500' : 'text-slate-500'} />
                        <span>{item.label}</span>
                      </div>
                      {!isAuthorized && (
                        <span className="text-[8px] px-1 py-0.2 rounded border border-slate-700 bg-slate-800 text-slate-500">Lock</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 text-center text-[10px] text-slate-500">
          <p>© Ministry of Panchayati Raj</p>
          <p className="text-slate-600 mt-0.5">Viksit Bharat Initiative</p>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
