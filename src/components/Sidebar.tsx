import React, { useState } from 'react';
import { Project, User as AppUser } from '../types';
import { FhaLogo } from './FhaLogo';
import { 
  LayoutDashboard, 
  HardHat, 
  UserCheck, 
  CreditCard, 
  Award, 
  FileSpreadsheet, 
  MessageSquare, 
  AlertTriangle,
  Building,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Users,
  Layers,
  Menu
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingAlertsCount: number;
  pendingOnboardingCount: number;
  pendingValuationsCount: number;
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  theme?: 'light' | 'dark';
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  pendingAlertsCount,
  pendingOnboardingCount,
  pendingValuationsCount,
  projects,
  onSelectProject,
  currentUser,
  onLogout,
  theme = 'dark'
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Base list of all possible menu items
  const allMenuItems = [
    { id: 'dashboard', name: 'Executive Dashboard', icon: LayoutDashboard, roles: ['MD', 'PM', 'FD', 'CT', 'CONTRACTOR'] },
    { id: 'projects', name: 'Project Delivery & PM', icon: HardHat, roles: ['MD', 'PM', 'QS', 'RE', 'CONTRACTOR'] },
    { id: 'estates', name: 'All Estates Directory', icon: Layers, roles: ['MD', 'PM', 'QS', 'RE', 'FD', 'CT'] },
    { id: 'onboarding', name: 'Contractor Onboarding', icon: UserCheck, count: pendingOnboardingCount, roles: ['MD', 'PM'] },
    { id: 'valuations', name: 'Valuation & Payments', icon: CreditCard, count: pendingValuationsCount, roles: ['MD', 'PM', 'QS', 'RE', 'FD', 'CT', 'CONTRACTOR'] },
    { id: 'scorecards', name: 'Performance Scorecards', icon: Award, roles: ['MD', 'PM'] },
    { id: 'reports', name: 'Weekly Progress Reports', icon: FileSpreadsheet, roles: ['MD', 'PM', 'QS', 'RE', 'FD', 'CT'] },
    { id: 'assistant', name: 'Executive AI Assistant', icon: MessageSquare, highlight: true, roles: ['MD'] },
    { id: 'alerts', name: 'Risk & Exception Alerts', icon: AlertTriangle, count: pendingAlertsCount, urgent: true, roles: ['MD', 'PM'] },
    { id: 'users', name: 'Manage Users', icon: Users, roles: ['MD', 'PM'] },
  ];

  // Filter based on logged-in user role
  const userRole = currentUser?.role || 'MD';
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  // Filter projects for contractor to only show his company's projects
  const displayedProjects = userRole === 'CONTRACTOR'
    ? projects.filter(p => p.contractorId === currentUser?.contractorId)
    : projects;

  return (
    <aside 
      id="main-sidebar" 
      className={`${isCollapsed ? 'w-20' : 'w-80'} bg-slate-50 dark:bg-[#050505] border-r border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-100 flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden transition-all duration-300 ease-in-out`}
    >
      {/* Brand Header */}
      {isCollapsed ? (
        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col items-center gap-4 bg-slate-100/50 dark:bg-black/40">
          <div className="w-10 h-10 flex items-center justify-center" title="FEDERAL HOUSING AUTHORITY">
            <FhaLogo size={36} showText={false} />
          </div>
          <button 
            onClick={() => setIsCollapsed(false)} 
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 text-amber-500 hover:text-amber-400 rounded-lg transition"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-100/50 dark:bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <FhaLogo size={44} showText={false} />
            </div>
            <div>
              <h1 className="text-lg font-medium tracking-tight text-slate-900 dark:text-white leading-none font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                FHA MONITOR
              </h1>
              <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">Project Cockpit</p>
            </div>
          </div>
          <button 
            onClick={() => setIsCollapsed(true)} 
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <nav className="space-y-1.5">
          {!isCollapsed && (
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Workspaces & Workflows
            </div>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.name : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center px-1' : 'justify-between px-3'} py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : item.highlight
                    ? 'bg-slate-100 dark:bg-white/5 text-amber-500 dark:text-amber-400 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} relative w-full`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                  
                  {isCollapsed && item.count !== undefined && item.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-rose-600 text-white rounded-full text-[8px] font-extrabold border border-black shadow shadow-rose-600/50">
                      {item.count}
                    </span>
                  )}
                </div>
                
                {!isCollapsed && item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 text-[9px] rounded font-extrabold shrink-0 ${
                    item.urgent 
                      ? isActive 
                        ? 'bg-white/20 text-white font-extrabold'
                        : 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/20' 
                      : isActive
                        ? 'bg-white/20 text-white font-extrabold'
                        : 'bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Short-cut submenu: Quick Project Switcher */}
        {!isCollapsed && displayedProjects.length > 0 && (
          <div className="space-y-2">
            <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Estate Schemes Shortcuts
            </div>
            
            <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
              {displayedProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      p.status === 'Completed' ? 'bg-emerald-500' : p.status === 'Delayed' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    <span className="truncate">{p.estateName}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-400 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/40">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-4">
            <div 
              title={`${currentUser?.name} (${currentUser?.role})`}
              className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(0,80,130,0.2)] cursor-help"
            >
              {currentUser?.role || 'MD'}
            </div>
            <button 
              onClick={onLogout}
              title="Log Out"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2 p-2 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(0,80,130,0.2)]">
                {currentUser?.role || 'MD'}
              </div>
              <div className="overflow-hidden">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate">{currentUser?.name || 'Managing Director'}</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email || 'Adeyanju24@gmail.com'}</div>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              title="Log Out"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
