import React from 'react';
import { Project, User as AppUser } from '../types';
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
  LogOut,
  Users,
  Layers
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
  onLogout
}: SidebarProps) {
  
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
    <aside id="main-sidebar" className="w-80 bg-[#050505] border-r border-white/10 text-slate-100 flex flex-col shrink-0 h-screen sticky top-0 overflow-hidden">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10 flex items-center gap-3 bg-black/40">
        <div className="bg-amber-500 text-black p-2 rounded-lg font-bold flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-medium tracking-tight text-white leading-none font-serif" style={{ fontFamily: 'Georgia, serif' }}>
            FHA MONITOR
          </h1>
          <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mt-1">Project Cockpit</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <nav className="space-y-1.5">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Workspaces & Workflows
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : item.highlight
                    ? 'bg-white/5 text-amber-500 border border-white/10 hover:bg-white/10 hover:text-amber-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>
                
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 text-[9px] rounded font-extrabold ${
                    item.urgent 
                      ? isActive 
                        ? 'bg-black/20 text-black font-extrabold'
                        : 'bg-rose-500/15 text-rose-400 border border-rose-500/20' 
                      : isActive
                        ? 'bg-black/20 text-black font-extrabold'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Short-cut submenu: Quick Project Switcher */}
        {displayedProjects.length > 0 && (
          <div className="space-y-2">
            <div className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Estate Schemes Shortcuts
            </div>
            
            <div className="space-y-1 max-h-[180px] overflow-y-auto pr-1">
              {displayedProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-md text-[11px] font-medium text-slate-400 hover:bg-white/5 hover:text-white transition group text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      p.status === 'Completed' ? 'bg-emerald-400' : p.status === 'Delayed' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    <span className="truncate">{p.estateName}</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-slate-600 opacity-0 group-hover:opacity-100 transition" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-white/10 bg-black/40">
        <div className="flex items-center justify-between gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-black flex items-center justify-center font-bold text-xs shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              {currentUser?.role || 'MD'}
            </div>
            <div className="overflow-hidden">
              <div className="text-[11px] font-bold text-white truncate">{currentUser?.name || 'Managing Director'}</div>
              <div className="text-[9px] text-slate-400 truncate">{currentUser?.email || 'Adeyanju24@gmail.com'}</div>
            </div>
          </div>
          
          <button 
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 hover:bg-white/10 text-slate-400 hover:text-rose-400 rounded-lg transition shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
