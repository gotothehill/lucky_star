
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChartWheel from '../components/ChartWheel';
import { storageService } from '../services/storage';

const BirthChart: React.FC = () => {
  const navigate = useNavigate();
  const data = storageService.loadData();
  const user = data.currentUser;

  if (!user) return null;

  return (
    <div className="space-y-10 animate-fade-in pb-20 md:pb-0 max-w-7xl mx-auto">
      <header className="flex items-center gap-8 bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800/50 shadow-xl">
        <button onClick={() => navigate(-1)} className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500 transition-all shadow-inner group">
           <i className="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i>
        </button>
        <div>
          <h1 className="font-serif text-4xl font-bold text-amber-100 tracking-wide">本命星盘解析</h1>
          <p className="text-slate-500 text-sm mt-2 flex items-center gap-2">
            <i className="fas fa-clock text-slate-700"></i>
            数据源：{user.birthInfo.birthDate} {user.birthInfo.birthTime} • {user.birthInfo.birthLocation}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Chart Visualization */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-slate-900/40 p-12 rounded-[3.5rem] border border-slate-800 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] relative group">
            <div className="absolute inset-0 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
            <ChartWheel />
            <div className="absolute inset-x-0 bottom-8 flex justify-center">
               <div className="bg-slate-950/90 px-5 py-2 rounded-full border border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] shadow-xl">
                 普拉西多分宫制 (Placidus)
               </div>
            </div>
          </div>
          
          {/* Quick Stats Highlights */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '太阳人格', val: user.sunSign, color: 'text-amber-500', icon: 'fa-sun', bg: 'bg-amber-500/10 border-amber-500/30' },
              { label: '月亮情感', val: user.moonSign, color: 'text-indigo-400', icon: 'fa-moon', bg: 'bg-indigo-500/10 border-indigo-500/30' },
              { label: '上升面具', val: user.ascendantSign, color: 'text-emerald-400', icon: 'fa-chevron-up', bg: 'bg-emerald-500/10 border-emerald-500/30' }
            ].map(s => (
              <div key={s.label} className={`p-5 rounded-3xl border transition-all hover:scale-105 shadow-xl ${s.bg}`}>
                  <p className="text-[10px] text-slate-500 uppercase mb-3 tracking-widest font-bold">{s.label}</p>
                  <div className="flex items-center gap-3">
                    <i className={`fas ${s.icon} ${s.color} text-lg`}></i>
                    <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                  </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Interpretations */}
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-slate-900/40 rounded-[3rem] border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-10 space-y-12">
              <section className="space-y-5">
                <h3 className="text-amber-500 text-2xl font-bold flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shadow-inner">
                    <i className="fas fa-sun"></i>
                  </div>
                  核心人格：你的生命能量
                </h3>
                <p className="text-slate-300 leading-relaxed text-xl font-light">
                  你的太阳位于 **{user.sunSign}**，这赋予了你极强的意志力和独特的个人魅力。在社交场合中，你总能散发出自信的光芒。你天生具备领导者的气质，是一个极具行动力的灵魂。
                </p>
              </section>

              <section className="space-y-5">
                <h3 className="text-indigo-400 text-2xl font-bold flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center shadow-inner">
                    <i className="fas fa-moon"></i>
                  </div>
                  内在情感：你的安全感来源
                </h3>
                <p className="text-slate-300 leading-relaxed text-xl font-light">
                  你的月亮星座落在了 **{user.moonSign}**，这意味着你的安全感来源于内在的情感稳定与归属感。你可能比外表看上去更加敏感，在处理亲密关系时，你渴望深度的灵魂共鸣。
                </p>
              </section>

              {/* Beginner-friendly Takeaways */}
              <section className="p-8 bg-slate-950/50 rounded-[2rem] border border-slate-800 space-y-4">
                 <h4 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <i className="fas fa-bolt text-amber-500"></i> 小白快速看点
                 </h4>
                 <div className="flex flex-wrap gap-3">
                    <span className="px-4 py-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-xl text-sm font-medium">🔥 火象能量充沛</span>
                    <span className="px-4 py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-xl text-sm font-medium">💰 搞钱能力极强</span>
                    <span className="px-4 py-2 bg-pink-500/10 text-pink-300 border border-pink-500/20 rounded-xl text-sm font-medium">✨ 极具人际魅力</span>
                    <span className="px-4 py-2 bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-xl text-sm font-medium">🪐 土星回归预警</span>
                 </div>
              </section>

              <div className="pt-4">
                <button 
                  onClick={() => navigate('/transit')}
                  className="w-full bg-gradient-to-r from-slate-800 to-slate-950 border border-slate-700 p-8 rounded-[2rem] text-amber-400 font-bold hover:from-slate-700 hover:to-slate-900 transition-all flex items-center justify-center gap-4 shadow-2xl group"
                >
                    <i className="fas fa-scroll text-xl group-hover:rotate-12 transition-transform"></i>
                    <span className="text-lg uppercase tracking-widest">查看 2024-2025 流年深度报告</span>
                    <i className="fas fa-arrow-right text-xs opacity-50"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BirthChart;
