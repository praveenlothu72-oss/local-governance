import { useState, useEffect } from 'react';
import { db, isSupabaseConfigured, supabase } from './services/db';
import type { Profile } from './types';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DemoHelper from './components/DemoHelper';

// Pages
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import CitizenDashboard from './pages/CitizenDashboard';
import FundTransparency from './pages/FundTransparency';
import VillageAllocation from './pages/VillageAllocation';
import ProjectDetails from './pages/ProjectDetails';
import IssueCenter from './pages/IssueCenter';
import AdminDashboard from './pages/AdminDashboard';
import ContractorPortal from './pages/ContractorPortal';
import AuthorityPanel from './pages/AuthorityPanel';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

function App() {
  const [activePage, setActivePage] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [issueCenterTab, setIssueCenterTab] = useState<'vote' | 'raise'>('vote');
  
  const [guestMode, setGuestMode] = useState<boolean>(() => {
    const activeId = localStorage.getItem('gov_active_user_id');
    return activeId === 'guest';
  });

  // Load profile and sync with Supabase session transitions
  useEffect(() => {
    const fetchUser = async () => {
      const user = await db.getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, _session) => {
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            const user = await db.getCurrentUser();
            setCurrentUser(user);
            setGuestMode(false);
          } else if (event === 'SIGNED_OUT') {
            setCurrentUser(null);
            setGuestMode(false);
          }
        }
      );
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [refreshTrigger]);

  const handleUserChange = (userId: string) => {
    const newProfile = db.switchSimulatedUser(userId);
    setCurrentUser(newProfile);
    setGuestMode(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSignOut = async () => {
    await db.signOutUser();
    setCurrentUser(null);
    setGuestMode(false);
    setActivePage('landing');
    setRefreshTrigger(prev => prev + 1);
  };

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSetPageWithTab = (pageId: string) => {
    if (pageId === 'raise-issue') {
      setActivePage('vote-issue');
      setIssueCenterTab('raise');
    } else if (pageId === 'vote-issue') {
      setActivePage('vote-issue');
      setIssueCenterTab('vote');
    } else {
      setActivePage(pageId);
    }
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'landing':
        return <LandingPage setActivePage={handleSetPageWithTab} />;
      case 'citizen-dash':
        return (
          <CitizenDashboard
            setActivePage={handleSetPageWithTab}
            setSelectedProjectId={setSelectedProjectId}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'fund-dash':
        return <FundTransparency refreshTrigger={refreshTrigger} />;
      case 'village-dash':
        return (
          <VillageAllocation
            setActivePage={handleSetPageWithTab}
            setSelectedProjectId={setSelectedProjectId}
            refreshTrigger={refreshTrigger}
          />
        );
      case 'project-details':
        return (
          <ProjectDetails
            projectId={selectedProjectId}
            setActivePage={handleSetPageWithTab}
            currentUser={currentUser}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
          />
        );
      case 'vote-issue':
        return (
          <IssueCenter
            currentUser={currentUser}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
            activeTab={issueCenterTab}
            setActiveTab={setIssueCenterTab}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
          />
        );
      case 'contractor-upload':
        return (
          <ContractorPortal
            currentUser={currentUser}
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
            setActivePage={handleSetPageWithTab}
          />
        );
      case 'authority-review':
        return (
          <AuthorityPanel
            refreshTrigger={refreshTrigger}
            triggerRefresh={triggerRefresh}
            setActivePage={handleSetPageWithTab}
          />
        );
      case 'analytics':
        return <AnalyticsDashboard refreshTrigger={refreshTrigger} />;
      default:
        return <LandingPage setActivePage={handleSetPageWithTab} />;
    }
  };

  if (currentUser === null && !guestMode) {
    return (
      <AuthPage 
        onLoginSuccess={() => {
          setRefreshTrigger(prev => prev + 1);
        }} 
        onBypassGuest={() => {
          db.switchSimulatedUser('guest');
          setGuestMode(true);
          setActivePage('landing');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans antialiased text-slate-800">
      
      {/* Sidebar Navigation */}
      <Sidebar
        activePage={activePage === 'vote-issue' && issueCenterTab === 'raise' ? 'raise-issue' : activePage}
        setActivePage={handleSetPageWithTab}
        userRole={currentUser?.role || 'Citizen'}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar Header */}
        <Navbar
          currentUser={currentUser}
          onUserChange={handleUserChange}
          setSidebarOpen={setSidebarOpen}
          activePage={activePage === 'vote-issue' && issueCenterTab === 'raise' ? 'raise-issue' : activePage}
          onSignOut={handleSignOut}
          onSignIn={() => setGuestMode(false)}
        />

        {/* Dynamic Page Scroll Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 focus:outline-none">
          {renderActivePage()}
        </main>
      </div>

      {/* Floating Demo Pitch Guide Widget */}
      <DemoHelper
        activePage={activePage === 'vote-issue' && issueCenterTab === 'raise' ? 'raise-issue' : activePage}
        setActivePage={handleSetPageWithTab}
        currentUserId={currentUser?.id || ''}
        onUserChange={handleUserChange}
        triggerRefresh={triggerRefresh}
      />
    </div>
  );
}

export default App;
