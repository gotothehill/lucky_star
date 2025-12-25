
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AIConsult from './pages/AIConsult';
import Onboarding from './pages/Onboarding';
import Profile from './pages/Profile';
import BirthChart from './pages/BirthChart';
import Synastry from './pages/Synastry';
import Messages from './pages/Messages';
import AccountSettings from './pages/AccountSettings';
import TransitFortune from './pages/TransitFortune';
import { storageService } from './services/storage';

const AppRoutes: React.FC = () => {
  const location = useLocation();
  const [hasUser, setHasUser] = useState<boolean | null>(null);

  useEffect(() => {
    const data = storageService.loadData();
    setHasUser(!!data.currentUser);
  }, [location.pathname]);

  if (hasUser === null) {
    return (
      <div className="bg-slate-950 h-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 mt-4 text-sm">正在连接星辰...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/welcome" 
        element={!hasUser ? <Onboarding /> : <Navigate to="/" replace />} 
      />
      
      <Route path="/" element={hasUser ? <Layout><Home /></Layout> : <Navigate to="/welcome" replace />} />
      <Route path="/ai" element={hasUser ? <Layout><AIConsult /></Layout> : <Navigate to="/welcome" replace />} />
      <Route path="/messages" element={hasUser ? <Layout><Messages /></Layout> : <Navigate to="/welcome" replace />} />
      <Route path="/profile" element={hasUser ? <Layout><Profile /></Layout> : <Navigate to="/welcome" replace />} />

      <Route path="/settings/account" element={hasUser ? <AccountSettings /> : <Navigate to="/welcome" replace />} />
      <Route path="/chart" element={hasUser ? <Layout><BirthChart /></Layout> : <Navigate to="/welcome" replace />} />
      <Route path="/synastry" element={hasUser ? <Layout><Synastry /></Layout> : <Navigate to="/welcome" replace />} />
      <Route path="/transit" element={hasUser ? <Layout><TransitFortune /></Layout> : <Navigate to="/welcome" replace />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  );
};

export default App;
