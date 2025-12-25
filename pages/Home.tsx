
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { getDailyFortune } from '../services/astrology';
import { FortuneData } from '../types';
import { Link } from 'react-router-dom';
import { ZODIAC_SIGNS } from '../constants';

const Home: React.FC = () => {
  const [state, setState] = useState(storageService.loadData());
  const [fortune, setFortune] = useState<FortuneData | null>(null);

  useEffect(() => {
    if (state.currentUser) {
      setFortune(getDailyFortune(state.currentUser.sunSign));
    }
  }, [state.currentUser]);

  if (!state.currentUser) return null;

  const currentSign = ZODIAC_SIGNS.find(s => s.name === state.currentUser?.sunSign);

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Top Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-950 border border-slate-800/50 p-10 md:p-16 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-500/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="w-28 h-28 md:w-40 md:h-40 bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-500 rounded-[2.5rem] flex items-center justify-center border-4 border-slate-950 shadow-2xl transform hover:scale-105 transition-all duration-700">
            <span className="text-6xl md:text-8xl drop-shadow-2xl">{currentSign?.icon}</span>
          </div>
          
          <div className="text-center md:text-left space-y-4">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-50">{state.currentUser.nickname}</h1>
              <div className="flex gap-2">
                <span className="px-4 py-1.5 bg-amber-500 text-slate-950 rounded-full text-sm font-bold tracking-widest uppercase">
                  {state.currentUser.sunSign}
                </span>
                {state.isVip && (
                  <span className="px-4 py-1.5 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full text-sm font-bold tracking-widest uppercase flex items-center gap-2">
                    <i className="fas fa-crown text-[10px]"></i> VIP
                  </span>
                )}
              </div>
            </div>
            <p className="text-slate-400 max-w-2xl text-xl leading-relaxed font-light italic">
              "星辰的律动今日为你奏响序曲，{state.currentUser.sunSign}的力量正在觉醒。"
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
              <div className="flex items-center gap-3 text-sm text-slate-500 bg-slate-950/50 px-5 py-2.5 rounded-full border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                星图已根据你的经纬度实时校准
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left: Fortune Scores (Desktop 8 col) */}
        <div className="lg:col-span-8 space-y-10">
          {fortune && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Score Card */}
              <div className="md:col-span-5 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-10 rounded-[3rem] flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <p className="text-slate-500 text-xs tracking-[0.3em] uppercase mb-8 font-bold">综合运势走势</p>
                <div className="relative">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="88" fill="transparent" stroke="#1e293b" strokeWidth="10" />
                    <circle 
                      cx="96" cy="96" r="88" fill="transparent" stroke="url(#amberGradient)" strokeWidth="10" 
                      strokeDasharray={552} 
                      strokeDashoffset={552 - (552 * fortune.summary) / 100}
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
                    <span className="text-6xl font-serif font-bold text-amber-400">{fortune.summary}</span>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold mt-1">
                        <i className="fas fa-arrow-up"></i> 4%
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub Scores Grid */}
              <div className="md:col-span-7 grid grid-cols-2 gap-6">
                {[
                  { label: '情感', val: fortune.love, icon: 'fa-heart', color: 'from-pink-500 to-rose-400', shadow: 'shadow-pink-900/10' },
                  { label: '事业', val: fortune.career, icon: 'fa-briefcase', color: 'from-blue-500 to-indigo-400', shadow: 'shadow-indigo-900/10' },
                  { label: '财运', val: fortune.wealth, icon: 'fa-coins', color: 'from-yellow-500 to-amber-400', shadow: 'shadow-amber-900/10' },
                  { label: '健康', val: fortune.health, icon: 'fa-heartbeat', color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-900/10' }
                ].map(item => (
                  <div key={item.label} className={`bg-slate-900/40 border border-slate-800 p-6 rounded-[2rem] hover:border-slate-700 transition-all shadow-xl ${item.shadow}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center text-slate-950 text-xs`}>
                           <i className={`fas ${item.icon}`}></i>
                         </div>
                         <span className="text-sm font-bold text-slate-300">{item.label}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-500">{item.val}%</span>
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${item.color} transition-all duration-1000`} style={{ width: `${item.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interpretation Details */}
          <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[3rem] space-y-8 shadow-2xl">
            <div className="flex justify-between items-center">
                <h3 className="font-serif text-2xl font-bold flex items-center gap-4 text-amber-100">
                <i className="fas fa-feather-alt text-amber-500"></i>
                今日深度星启
                </h3>
                <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Updated: Today 00:00</span>
            </div>
            <div className="space-y-6 text-slate-300 leading-relaxed text-xl font-light">
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-amber-500">
                {fortune?.description}
              </p>
              <div className="mt-10 p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] flex items-start gap-6 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 scale-150 rotate-12 group-hover:scale-[2] transition-transform duration-1000">
                    <i className="fas fa-quote-right text-6xl text-amber-500"></i>
                 </div>
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-lightbulb text-amber-500 text-xl"></i>
                 </div>
                 <p className="italic text-amber-200 text-lg leading-relaxed relative z-10">"{fortune?.advice}"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions & Zodiac (Desktop 4 col) */}
        <div className="lg:col-span-4 space-y-10">
          {/* Quick Nav */}
          <div className="grid grid-cols-1 gap-6">
            <Link to="/ai" className="group bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[2.5rem] flex items-center gap-6 hover:bg-indigo-600/20 transition-all border-l-8 border-l-indigo-500 shadow-2xl relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-125 transition-transform duration-700">
                  <i className="fas fa-robot text-9xl"></i>
              </div>
              <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                <i className="fas fa-magic text-3xl"></i>
              </div>
              <div className="relative z-10">
                <span className="block text-xl font-bold text-indigo-100">咨询 AI 导师</span>
                <span className="text-xs text-indigo-400 font-medium uppercase tracking-widest mt-1">深度星盘智能解析</span>
              </div>
            </Link>
            
            <div className="grid grid-cols-2 gap-6">
               <Link to="/chart" className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-amber-500/30 transition-all shadow-xl group">
                  <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-950 transition-all shadow-inner">
                    <i className="fas fa-chart-pie text-xl"></i>
                  </div>
                  <span className="text-sm font-bold tracking-widest uppercase">本命星盘</span>
               </Link>
               <Link to="/synastry" className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col items-center gap-4 hover:border-pink-500/30 transition-all shadow-xl group">
                  <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-inner">
                    <i className="fas fa-heart text-xl"></i>
                  </div>
                  <span className="text-sm font-bold tracking-widest uppercase">合盘匹配</span>
               </Link>
            </div>
          </div>

          {/* Lucky Stats */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] shadow-xl">
             <div className="grid grid-cols-3 gap-4">
                {[
                { label: '幸运色', val: fortune?.luckyColor, icon: 'fa-palette' },
                { label: '幸运数', val: fortune?.luckyNumber, icon: 'fa-fingerprint' },
                { label: '幸运位', val: fortune?.luckyDirection, icon: 'fa-compass' }
                ].map(s => (
                <div key={s.label} className="text-center group">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-bold">{s.label}</p>
                    <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform shadow-inner">
                        <i className={`fas ${s.icon} text-slate-700 text-xs`}></i>
                    </div>
                    <p className="text-sm font-bold text-amber-200">{s.val}</p>
                </div>
                ))}
            </div>
          </div>

          {/* Zodiac Carousel */}
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-xl">
            <h3 className="font-serif text-xl font-bold text-slate-200">12星座广场</h3>
            <div className="grid grid-cols-3 gap-4">
              {ZODIAC_SIGNS.map(sign => (
                <div key={sign.name} className="flex flex-col items-center bg-slate-950/50 p-4 rounded-2xl border border-slate-800/50 hover:border-amber-500/40 hover:bg-slate-900 transition-all cursor-pointer group">
                  <span className="text-3xl mb-2 group-hover:scale-125 group-hover:rotate-12 transition-transform">{sign.icon}</span>
                  <span className="text-[10px] text-slate-500 font-bold tracking-tighter">{sign.name}</span>
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
