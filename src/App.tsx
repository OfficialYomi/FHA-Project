import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import OnboardingView from './components/OnboardingView';
import ProjectsView from './components/ProjectsView';
import ValuationsView from './components/ValuationsView';
import ScorecardsView from './components/ScorecardsView';
import ReportsView from './components/ReportsView';
import RiskAlertsView from './components/RiskAlertsView';
import AiAssistantView from './components/AiAssistantView';
import EstatesView from './components/EstatesView';
import UsersView from './components/UsersView';
import LoginView from './components/LoginView';
import { 
  Project, 
  Contractor, 
  ValuationRequest, 
  ContractorScorecard, 
  RiskAlert,
  User
} from './types';
import { 
  Building, 
  ShieldAlert, 
  RefreshCw, 
  Grid
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const cached = localStorage.getItem('nhdp_user');
    return cached ? JSON.parse(cached) : null;
  });
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [valuations, setValuations] = useState<ValuationRequest[]>([]);
  const [scorecards, setScorecards] = useState<ContractorScorecard[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users list
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  // Load all overview data from custom express backend
  const fetchOverviewData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/overview');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects);
        setContractors(data.contractors);
        setValuations(data.valuations);
        setScorecards(data.scorecards);
        setAlerts(data.alerts);
      } else {
        console.error("Failed to load backend overview data");
      }
    } catch (error) {
      console.error("Error communicating with Express server:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
    fetchUsers();
  }, [currentUser]);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('nhdp_user', JSON.stringify(data.user));
          return { success: true };
        }
      }
      const errData = await response.json().catch(() => ({}));
      return { success: false, error: errData.error || 'Invalid credentials' };
    } catch (error) {
      console.error("Login communication error:", error);
      return { success: false, error: 'Database or server connection failure' };
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nhdp_user');
    setActiveTab('dashboard');
  };

  const handleCreateUser = async (userData: any) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (response.ok) {
        await fetchUsers();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleDeleteUser = async (usernameToDelete: string) => {
    try {
      const response = await fetch(`/api/users/${usernameToDelete}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await fetchUsers();
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || "Failed to delete user.");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // Module 2: Setup New Project
  const handleSetupProject = async (projectData: any) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  // Module 3 & 4: Progress stage tickoff & Photo Uploads
  const handleUpdateProject = async (projectId: string, updateData: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error updating project stages:", error);
    }
  };

  const handleAcceptProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/accept`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error accepting project:", error);
    }
  };

  const handleRejectProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/reject`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error rejecting project:", error);
    }
  };

  // Module 1: Submit Contractor Onboarding
  const handleOnboardContractor = async (contractorData: any) => {
    try {
      const response = await fetch('/api/contractors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contractorData)
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error on contractor submission:", error);
    }
  };

  // Module 1: Approve Contractor Onboarding
  const handleApproveContractor = async (contractorId: string) => {
    try {
      const response = await fetch(`/api/contractors/${contractorId}/approve`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error approving contractor:", error);
    }
  };

  // Module 7: Request Interim Valuation
  const handleRequestValuation = async (valData: any) => {
    try {
      const response = await fetch('/api/valuations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(valData)
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error creating valuation claim:", error);
    }
  };

  // Module 7: Approve/advance Valuation clearance stages
  const handleApproveValuation = async (valId: string, approvalData: any) => {
    try {
      const response = await fetch(`/api/valuations/${valId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalData)
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error certifying progress payment:", error);
    }
  };

  // Module 8: Score contractor performance
  const handleCreateScorecard = async (scorecardData: any) => {
    try {
      const response = await fetch('/api/scorecards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scorecardData)
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error creating scorecard:", error);
    }
  };

  // Module 10: Exception Action (query, withhold, etc)
  const handleTriggerAlertAction = async (alertId: string, actionType: 'query' | 'meeting' | 'withhold' | 'directive', details: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionType, details })
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error triggering executive action on exception:", error);
    }
  };

  // Module 10: Resolve risk alert
  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch(`/api/alerts/${alertId}/resolve`, {
        method: 'POST'
      });
      if (response.ok) {
        await fetchOverviewData();
      }
    } catch (error) {
      console.error("Error resolving exception:", error);
    }
  };

  // Navigation click routing
  const navigateToTab = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedProjectId(null); // Clear project deep workspace context
  };

  // Sidebar Project Selector click routing
  const handleSidebarProjectSelect = (projectId: string) => {
    setActiveTab('projects');
    setSelectedProjectId(projectId);
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-[#050505] font-sans overflow-hidden">
      
      {/* 1. Left Persistent Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={navigateToTab} 
        pendingAlertsCount={alerts.filter(a => !a.resolved).length}
        pendingOnboardingCount={contractors.filter(c => c.status === 'pending').length}
        pendingValuationsCount={valuations.filter(v => v.currentStage !== 'payment_released').length}
        projects={projects}
        onSelectProject={handleSidebarProjectSelect}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. Main Executive Command Cockpit (Right Frame) */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Program Branding Bar */}
        <header className="h-16 border-b border-white/10 shrink-0 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 z-10 print:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-black p-2 rounded flex items-center justify-center font-bold">
              <span className="text-sm leading-none font-bold">{currentUser.role[0]}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest leading-none">{currentUser.role} Desk</span>
                <span className="text-[10px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded uppercase">{currentUser.name}</span>
              </div>
              <h1 className="text-base font-medium text-white tracking-tight font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                National Housing Delivery Platform
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time telemetry connection status */}
            <div className="flex items-center gap-2 bg-white/5 text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-white/10 shadow-md">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="tracking-widest uppercase">SYSTEM SECURE</span>
            </div>

            {/* Quick Synchronize Database button */}
            <button 
              onClick={fetchOverviewData}
              title="Refresh Cockpit Telemetry"
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg border border-white/10 transition"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
            </button>
          </div>
        </header>

        {/* Dynamic Center Workstation with View Routing */}
        <main className="flex-1 overflow-y-auto bg-black/20 p-6 print:p-0">
          {isLoading && projects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <LoaderIndicator />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider animate-pulse">Initializing Executive Control Environment...</p>
            </div>
          ) : (
            <div className="animate-fade-in duration-300">
              {activeTab === 'dashboard' && (
                <DashboardView 
                  projects={projects}
                  alerts={alerts}
                  contractors={contractors}
                  valuations={valuations}
                  onSelectProject={handleSidebarProjectSelect}
                  onNavigateToTab={navigateToTab}
                  onUpdateProject={handleUpdateProject}
                  currentUser={currentUser}
                  onApproveValuation={handleApproveValuation}
                />
              )}

              {activeTab === 'onboarding' && (
                <OnboardingView 
                  contractors={contractors}
                  onOnboardContractor={handleOnboardContractor}
                  onApproveContractor={handleApproveContractor}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsView 
                  projects={projects}
                  contractors={contractors}
                  selectedProjectId={selectedProjectId}
                  onSelectProject={setSelectedProjectId}
                  onSetupProject={handleSetupProject}
                  onUpdateProject={handleUpdateProject}
                  currentUser={currentUser}
                  onAcceptProject={handleAcceptProject}
                  onRejectProject={handleRejectProject}
                />
              )}

              {activeTab === 'estates' && (
                <EstatesView 
                  projects={projects}
                  contractors={contractors}
                  onSelectProject={handleSidebarProjectSelect}
                />
              )}

              {activeTab === 'valuations' && (
                <ValuationsView 
                  valuations={valuations}
                  projects={projects}
                  onRequestValuation={handleRequestValuation}
                  onApproveValuation={handleApproveValuation}
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'scorecards' && (
                <ScorecardsView 
                  scorecards={scorecards}
                  contractors={contractors}
                  projects={projects}
                  onCreateScorecard={handleCreateScorecard}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView 
                  projects={projects}
                  alerts={alerts}
                  contractors={contractors}
                />
              )}

              {activeTab === 'alerts' && (
                <RiskAlertsView 
                  alerts={alerts}
                  onTriggerAlertAction={handleTriggerAlertAction}
                  onResolveAlert={handleResolveAlert}
                />
              )}

              {activeTab === 'users' && (
                <UsersView 
                  users={users}
                  currentUser={currentUser}
                  onCreateUser={handleCreateUser}
                  onDeleteUser={handleDeleteUser}
                />
              )}

              {activeTab === 'assistant' && (
                <AiAssistantView />
              )}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

// Simple loader helper
function LoaderIndicator() {
  return (
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-white/5" />
      <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin" />
    </div>
  );
}
