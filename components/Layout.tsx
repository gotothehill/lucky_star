
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { storageService } from '../services/storage';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const data = storageService.loadData();
  
  const navItems = [
    { path: '/', label: '首页', icon: 'fa-home' },
    { path: '/ai', label: 'AI咨询', icon: 'fa-robot' },
    { path: '/messages', label: '消息中心', icon: 'fa-bell' },
    { path: '/profile', label: '个人中心', icon: 'fa-user' },
  ];

  const handleLogout = () => {
    if (confirm('确认要退出并清除所有本地数据吗？此操作不可撤销。')) {
      localStorage.clear();
      window.location.hash = '#/welcome';
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      {/* PC Side Navigation */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 sticky top-0 h-screen z-50">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
              <i className="fas fa-star text-slate-950 text-xl"></i>
            </div>
            <span className="text-xl font-serif font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">幸运星</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                  isActive 
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-900/10' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <i className={`fas ${item.icon} text-lg w-6 text-center ${isActive ? 'text-amber-400' : 'group-hover:text-amber-200'}`}></i>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 space-y-4 border-t border-slate-800/50">
          <Link to="/profile" className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-800/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shadow-inner">
              {data.currentUser?.avatar || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate text-slate-200">{data.currentUser?.nickname || '未登录'}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">{data.currentUser?.sunSign}</p>
            </div>
          </Link>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-all group"
          >
            <i className="fas fa-sign-out-alt w-6 text-center group-hover:scale-110 transition-transform"></i>
            <span className="text-xs font-bold uppercase tracking-widest">退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-12 py-6 md:py-10 pb-24 md:pb-10">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex justify-around items-center py-3 z-50 px-4 rounded-t-3xl shadow-2xl">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-amber-400' : 'text-slate-500'}`}
            >
              <i className={`fas ${item.icon} text-xl`}></i>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
