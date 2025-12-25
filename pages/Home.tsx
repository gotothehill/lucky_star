
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { getDailyFortune } from '../services/astrology';
import { FortuneData } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { ZODIAC_SIGNS } from '../constants';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState(storageService.loadData());
  const [fortune, setFortune] = useState<FortuneData | null>(null);

  useEffect(() => {
    if (state.currentUser) {
      setFortune(getDailyFortune(state.currentUser.sunSign));
    }
  }, [state.currentUser]);

  const handleSwitchProfile = (id: string) => {
    const newState = storageService.setCurrentUser(id);
    setState(newState);
    setFortune(getDailyFortune(newState.currentUser?.sunSign || ''));
  };

  if (!state.currentUser) return null;

  const currentSign = ZODIAC_SIGNS.find(s => s.name === state.currentUser?.sunSign);
  const otherProfiles = state.profiles.filter(p => p.id !== state.currentUser?.id);

  // 幸运色背景映射
  const getColorValue = (colorName: string) => {
    const map: Record<string, string> = {
      '紫色': '#9333ea',
      '金黄色': '#fbbf24',
      '星空蓝': '#1e3a8a',
      '翡翠绿': '#059669',
      '红色': '#dc2626',
      '粉色': '#db2777',
      '青色': '#0891b2'
    };
    return map[colorName] || '#334155';
  };

  return (
    <div className="space-y-12 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* Top Hero Section */}
      <section className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-10 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-28 h-28 md:w-40 md:h-40 bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 rounded-[2.5rem] flex items-center justify-center border-4 border-slate-950 shadow-2xl transform hover:rotate-3 transition-all duration-700">
            <span className="text-6xl md:text-8xl drop-shadow-2xl">{currentSign?.icon}</span>
          </div>
          
          <div className="text-center md:text-left space-y-4">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
              <h1 className="text-4xl md:text-6xl font-serif font-bold text-slate-50 tracking-tight">{state.currentUser.nickname}</h1>
              <div className="flex gap-2">
                <span className="px-5 py-2 bg-slate-800 text-amber-500 border border-slate-700 rounded-full text-xs font-black tracking-widest uppercase shadow-lg">
                  {state.currentUser.sunSign}
                </span>
                {state.isVip && (
                  <span className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 border border-amber-300 rounded-full text-xs font-black tracking-widest uppercase flex items-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                    <i className="fas fa-crown text-[10px]"></i> VIP GOLD
                  </span>
                )}
              </div>
            </div>
            <p className="text-slate-400 max-w-2xl text-xl leading-relaxed font-light italic opacity-80">
              "星轨正在为此刻的你重排，{state.currentUser.sunSign}的本源之力已在此聚集。"
            </p>
          </div>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Core Fortune Data */}
        <div className="lg:col-span-8 space-y-12">
          {fortune && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Summary Score Card */}
              <div className="md:col-span-5 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-12 rounded-[3.5rem] flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <p className="text-slate-500 text-[10px] tracking-[0.5em] uppercase mb-10 font-black">今日综合运势指数</p>
                <div className="relative">
                  <svg className="w-52 h-52 transform -rotate-90">
                    <circle cx="104" cy="104" r="96" fill="transparent" stroke="#1e293b" strokeWidth="12" />
                    <circle 
                      cx="104" cy="104" r="96" fill="transparent" stroke="url(#amberGradient)" strokeWidth="12" 
                      strokeDasharray={603} 
                      strokeDashoffset={603 - (603 * fortune.summary) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                      <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#fbbf24" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-7xl font-serif font-black text-amber-400 drop-shadow-2xl">{fortune.summary}</span>
                  </div>
                </div>
              </div>

              {/* Sub Scores Grid */}
              <div className="md:col-span-7 grid grid-cols-2 gap-6">
                {[
                  { label: '情感', val: fortune.love, icon: 'fa-heart', color: 'from-pink-500 to-rose-400' },
                  { label: '事业', val: fortune.career, icon: 'fa-briefcase', color: 'from-blue-500 to-indigo-400' },
                  { label: '财运', val: fortune.wealth, icon: 'fa-coins', color: 'from-yellow-500 to-amber-400' },
                  { label: '健康', val: fortune.health, icon: 'fa-heartbeat', color: 'from-emerald-500 to-teal-400' }
                ].map(item => (
                  <div key={item.label} className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] hover:border-amber-500/30 transition-all shadow-xl group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-slate-950 text-[10px] shadow-lg`}>
                        <i className={`fas ${item.icon}`}></i>
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</span>
                    </div>
                    <div className="flex items-end mb-4">
                       <span className="text-5xl font-black text-slate-100 tracking-tighter group-hover:text-amber-200 transition-colors">
                        {item.val}<span className="text-base ml-1 text-slate-600 font-bold">%</span>
                       </span>
                    </div>
                    <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interpretation Card */}
          <div className={`bg-slate-900/40 border p-14 md:p-16 rounded-[4rem] space-y-10 shadow-2xl relative overflow-hidden transition-all duration-500 ${state.isVip ? 'border-amber-500/30 ring-1 ring-amber-500/5' : 'border-slate-800'}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-3xl font-bold flex items-center gap-5 text-amber-50">
                <i className="fas fa-feather-alt text-amber-500 text-3xl"></i>
                今日深度星启
                </h3>
            </div>
            
            <div className="space-y-12">
              <div className="text-slate-300 leading-[2] text-xl font-light">
                <p className="first-letter:text-7xl first-letter:font-serif first-letter:float-left first-letter:mr-5 first-letter:text-amber-500 first-letter:leading-none">
                  {fortune?.description}
                </p>
              </div>

              {/* VIP Private Insight Section */}
              <div className={`p-10 rounded-[3rem] border-2 relative overflow-hidden transition-all group ${state.isVip ? 'bg-gradient-to-br from-amber-500/5 via-slate-900/50 to-transparent border-amber-500/20' : 'bg-slate-950/40 border-slate-800/50'}`}>
                 <div className="flex items-center gap-5 mb-8">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${state.isVip ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-slate-600'}`}>
                       <i className={`fas ${state.isVip ? 'fa-bolt' : 'fa-lock'} text-xl`}></i>
                    </div>
                    <div>
                        <span className={`block text-[10px] font-black tracking-[0.3em] uppercase ${state.isVip ? 'text-amber-400' : 'text-slate-600'}`}>VIP 高阶运势秘语</span>
                    </div>
                 </div>

                 <div className={`space-y-6 relative transition-all duration-1000 ${state.isVip ? 'opacity-100' : 'blur-xl select-none grayscale'}`}>
                    <p className="text-slate-200 text-2xl leading-[1.8] italic font-light pl-8 border-l-2 border-amber-500/30">
                      "今日 16:24 后，火星的震颤将影响你的事业宫位。这并非挑衅，而是催促你做出决断的信号..."
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                       <span className="px-5 py-2 bg-amber-500/10 text-amber-500 rounded-xl text-[10px] font-black tracking-widest border border-amber-500/10">#火星共振</span>
                    </div>
                 </div>

                 {!state.isVip && (
                   <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-slate-950/30 backdrop-blur-sm">
                      <button 
                        onClick={() => navigate('/profile')}
                        className="bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 px-14 py-6 rounded-3xl font-black shadow-2xl hover:scale-105 transition-all text-xl"
                      >
                         <i className="fas fa-crown mr-2"></i> 解锁 VIP 深度报告
                      </button>
                   </div>
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Services & Relationship */}
        <div className="lg:col-span-4 space-y-10">
          
          {/* 核心服务矩阵 - 显性展示星盘和合盘 */}
          <section className="grid grid-cols-2 gap-4">
             <Link to="/chart" className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-amber-500/50 transition-all group shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <i className="fas fa-star-and-crescent text-xl"></i>
                </div>
                <div className="text-center">
                    <span className="block text-sm font-bold text-slate-100">本命星盘</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">深度宿命解析</span>
                </div>
             </Link>

             <Link to="/synastry" className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-pink-500/50 transition-all group shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-transparent"></div>
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                    <i className="fas fa-heart text-xl"></i>
                </div>
                <div className="text-center">
                    <span className="block text-sm font-bold text-slate-100">合盘匹配</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">测算默契缘分</span>
                </div>
             </Link>

             <Link to="/transit" className="bg-slate-900/60 border border-slate-800 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-emerald-500/50 transition-all group shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <i className="fas fa-chart-line text-xl"></i>
                </div>
                <div className="text-center">
                    <span className="block text-sm font-bold text-slate-100">流年趋势</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">掌握未来先机</span>
                </div>
             </Link>

             <Link to="/ai" className="bg-indigo-600 border border-indigo-400 p-6 rounded-[2.5rem] flex flex-col items-center gap-4 hover:bg-indigo-500 transition-all group shadow-2xl shadow-indigo-900/30">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                    <i className="fas fa-robot text-xl"></i>
                </div>
                <div className="text-center">
                    <span className="block text-sm font-bold text-white">AI 咨询</span>
                    <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest mt-1 block">对话占星大师</span>
                </div>
             </Link>
          </section>

          {/* Relationship Stickiness: Friends Quick View */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] space-y-8 shadow-xl">
            <div className="flex justify-between items-center px-2">
               <h3 className="font-serif text-xl font-bold text-slate-100">亲友运势速览</h3>
               <Link to="/profile" className="text-[10px] text-amber-500 uppercase tracking-widest font-black flex items-center gap-2">
                 管理 <i className="fas fa-plus"></i>
               </Link>
            </div>
            
            <div className="space-y-4">
              {otherProfiles.length > 0 ? (
                otherProfiles.map(p => {
                  const friendFortune = getDailyFortune(p.sunSign);
                  return (
                    <div 
                      key={p.id} 
                      onClick={() => handleSwitchProfile(p.id)}
                      className="bg-slate-950/40 border border-slate-800 p-5 rounded-[2rem] flex items-center justify-between hover:bg-slate-800 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform border border-slate-800">
                            {p.avatar || '👤'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-200 group-hover:text-amber-200">{p.nickname}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">{p.sunSign}</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <span className="block text-lg font-serif font-black text-emerald-400">{friendFortune.summary}分</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center space-y-4">
                   <p className="text-xs text-slate-600 font-medium">绑定亲友星座，同步关爱运势</p>
                   <button 
                     onClick={() => navigate('/profile')}
                     className="bg-amber-500/5 text-amber-500 border border-amber-500/20 px-8 py-2 rounded-full text-[10px] font-bold uppercase"
                   >
                     添加第一位亲友
                   </button>
                </div>
              )}
            </div>
          </div>

          {/* Lucky Stats */}
          <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] shadow-xl">
             <div className="grid grid-cols-3 gap-6">
                {[
                { 
                    label: '幸运色', 
                    val: fortune?.luckyColor, 
                    icon: 'fa-palette',
                    customBg: getColorValue(fortune?.luckyColor || '')
                },
                { label: '幸运数', val: fortune?.luckyNumber, icon: 'fa-fingerprint' },
                { 
                    label: '幸运位', 
                    val: state.isVip ? fortune?.luckyDirection : 'VIP可见', 
                    icon: 'fa-compass',
                    isLocked: !state.isVip
                }
                ].map(s => (
                <div key={s.label} className="text-center group relative">
                    <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] mb-4 font-black">{s.label}</p>
                    <div 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-2xl border border-slate-800/50`}
                        style={{ backgroundColor: s.customBg || 'rgba(15, 23, 42, 0.8)' }}
                    >
                        <i className={`fas ${s.isLocked ? 'fa-lock' : s.icon} ${s.customBg ? 'text-white' : 'text-slate-700'} text-lg`}></i>
                    </div>
                    <p className={`text-xs font-black tracking-widest ${s.isLocked ? 'text-slate-700' : 'text-amber-200'}`}>{s.val}</p>
                </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
