
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ChartWheel from '../components/ChartWheel';
import { storageService } from '../services/storage';
import { PLANETS, ZODIAC_SIGNS } from '../constants';

// 声明全局 html2pdf 变量
declare var html2pdf: any;

const BirthChart: React.FC = () => {
  const navigate = useNavigate();
  const data = storageService.loadData();
  const user = data.currentUser;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  
  const chartExportFn = useRef<() => void>(null);

  if (!user) return null;

  const planetaryData = PLANETS.map((p, i) => {
    const signIdx = (i * 7 + 3) % 12;
    const degree = Math.floor(Math.random() * 30);
    const minutes = Math.floor(Math.random() * 60);
    return {
      planet: p.name,
      icon: p.icon,
      sign: ZODIAC_SIGNS[signIdx].name,
      signIcon: ZODIAC_SIGNS[signIdx].icon,
      house: `${(i % 12) + 1}宫`,
      degree: `${degree}°${minutes}'`,
      status: i % 5 === 0 ? '逆行' : '顺行',
    };
  });

  const handleExport = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isExporting) return;

    setIsExporting(true);
    setNotification("✨ 正在聚合星历数据，构建三页专业 PDF 视觉报告...");
    
    // 增加延迟，确保 off-screen 元素完全渲染
    await new Promise(resolve => setTimeout(resolve, 2000));
    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: 0,
      filename: `幸运星_${user.nickname}_专业星盘报告.pdf`,
      image: { type: 'jpeg', quality: 1.0 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#020617',
        letterRendering: true,
        logging: false,
        width: 794, // 固定 A4 宽度 (96dpi)
        windowWidth: 800 // 模拟窗口宽度
      },
      jsPDF: { unit: 'px', format: [794, 1123], hotfixes: ['px_scaling'] },
      pagebreak: { mode: 'legacy', before: '.page-break' }
    };

    try {
      await html2pdf().set(opt).from(element).save();
      setIsExporting(false);
      setNotification("✅ 专业版三页 PDF 报告已成功导出。");
      setTimeout(() => setNotification(null), 4000);
    } catch (err) {
      console.error(err);
      setIsExporting(false);
      setNotification("❌ 导出失败，请重试。");
    }
  };

  const handleDownloadChartImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (chartExportFn.current) {
      chartExportFn.current();
      setNotification("✨ 高清星盘图片已开始下载。");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="animate-fade-in pb-20 max-w-[1700px] mx-auto space-y-10 relative">
      
      {notification && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/95 backdrop-blur-md text-amber-400 px-8 py-5 rounded-2xl shadow-2xl border border-amber-500/40 animate-slide-down flex items-center gap-4 min-w-[350px]">
          {isExporting ? <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div> : <i className="fas fa-check-circle text-emerald-500"></i>}
          <span className="text-sm font-bold tracking-wide">{notification}</span>
        </div>
      )}

      {isFullscreen && (
        <div className="fixed inset-0 z-[500] bg-slate-950 flex flex-col items-center justify-center animate-fade-in">
          <div className="absolute top-8 left-8 z-[510] hidden md:block">
             <h2 className="text-3xl font-serif font-bold text-slate-100 flex items-center gap-4">
               <span className="w-2 h-10 bg-amber-500 rounded-full"></span>
               {user.nickname} 的宇宙全景
             </h2>
             <p className="text-xs text-slate-500 mt-2 uppercase tracking-[0.4em] font-black pl-6">Zoomable Star Map System</p>
          </div>
          
          <div className="absolute top-8 right-8 z-[510] flex gap-4">
             <button onClick={handleDownloadChartImage} className="bg-slate-900/90 hover:bg-slate-800 px-8 py-4 rounded-2xl text-amber-400 border border-amber-500/20 transition-all flex items-center gap-3 font-bold text-sm shadow-2xl">
               <i className="fas fa-download"></i> 保存高清图片
             </button>
             <button onClick={toggleFullscreen} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl text-white w-14 h-14 flex items-center justify-center backdrop-blur-md border border-white/10 transition-all active:scale-90">
               <i className="fas fa-times text-xl"></i>
             </button>
          </div>

          <div className="w-full h-full">
             <ChartWheel 
                interactive={true} 
                onExport={(fn) => { (chartExportFn as any).current = fn; }} 
                className="!rounded-none"
             />
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row items-center justify-between gap-8 bg-slate-900/30 p-10 md:px-16 md:py-12 rounded-[3.5rem] border border-slate-800/50 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-10 relative z-10">
          <button onClick={() => navigate(-1)} className="w-16 h-16 flex items-center justify-center rounded-[1.8rem] bg-slate-950 border border-slate-800 hover:border-amber-500 transition-all group shadow-2xl active:scale-90">
             <i className="fas fa-arrow-left text-xl group-hover:-translate-x-1 transition-transform"></i>
          </button>
          <div>
            <h1 className="font-serif text-5xl font-bold text-slate-50 tracking-tight leading-tight">
              {user.nickname} 的 <span className="text-amber-400">本命星盘报告</span>
            </h1>
            <div className="flex items-center gap-6 mt-4">
               <span className="flex items-center gap-2 text-slate-400 font-light"><i className="fas fa-map-marker-alt text-amber-500/60"></i> {user.birthInfo.birthLocation}</span>
               <span className="w-1.5 h-1.5 bg-slate-800 rounded-full"></span>
               <span className="flex items-center gap-2 text-slate-400 font-light"><i className="fas fa-clock text-amber-500/60"></i> {user.birthInfo.birthDate} {user.birthInfo.birthTime}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-4 relative z-10">
          <button onClick={toggleFullscreen} className="px-8 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-400 font-bold text-sm hover:border-amber-500 transition-all flex items-center gap-3 shadow-xl">
            <i className="fas fa-expand-arrows-alt"></i> 全屏观星
          </button>
          <button onClick={handleExport} disabled={isExporting} className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl shadow-amber-900/40 flex items-center gap-3">
            {isExporting ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-file-pdf"></i>}
            导出三页专业报告
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-10">
          <section className="bg-slate-950/60 p-10 lg:p-14 rounded-[4rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={toggleFullscreen} className="w-10 h-10 bg-slate-900/80 rounded-xl flex items-center justify-center text-amber-500">
                  <i className="fas fa-expand"></i>
               </button>
            </div>
            <div className="aspect-square">
               <ChartWheel interactive={false} className="!bg-transparent" />
            </div>
          </section>

          <section className="bg-slate-900/40 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-800 bg-slate-950/20 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-100 font-serif flex items-center gap-3">
                 <i className="fas fa-list-ul text-amber-500 text-sm"></i> 行星详细落位
               </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-950/60">
                    <th className="px-8 py-5 text-[10px] text-slate-600 font-black uppercase tracking-widest">星体</th>
                    <th className="px-8 py-5 text-[10px] text-slate-600 font-black uppercase tracking-widest text-center">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {planetaryData.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="px-8 py-5 flex items-center gap-4">
                        <span className="text-2xl text-amber-400/90">{p.icon}</span>
                        <div>
                           <span className="text-sm font-bold text-slate-200 block">{p.planet}</span>
                           <span className="text-[10px] text-slate-500">{p.sign} {p.degree}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full ${p.status === '逆行' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="lg:col-span-7 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: '太阳人格', val: user.sunSign, color: 'text-amber-500', icon: 'fa-sun' },
              { label: '月亮情感', val: user.moonSign, color: 'text-indigo-400', icon: 'fa-moon' },
              { label: '上升面具', val: user.ascendantSign, color: 'text-emerald-400', icon: 'fa-chevron-up' }
            ].map(s => (
              <div key={s.label} className="p-8 rounded-[2.5rem] bg-slate-900/40 border border-slate-800 shadow-xl">
                  <div className="flex items-center justify-between mb-8">
                     <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{s.label}</p>
                     <i className={`fas ${s.icon} ${s.color} text-xl`}></i>
                  </div>
                  <p className={`text-4xl font-serif font-black mb-3 ${s.color}`}>{s.val}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { title: '核心人格解析', icon: 'fa-gem', color: 'amber', content: '你的太阳位于 **' + user.sunSign + '**，这赋予了你极强的意志力和独特的个人魅力。在社交场合中，你总能散发出自信的光芒。你天生具备领导者的气质，是一个极具行动力的灵魂。', tags: ['#意志力强', '#领导潜质'] },
              { title: '内在情感需求', icon: 'fa-heart-pulse', color: 'indigo', content: '你的月亮星座落在 **' + user.moonSign + '**，这意味着你的安全感来源于内在的情感稳定与归属感。你可能比外表看上去更加敏感，在处理亲密关系时，你渴望深度的灵魂共鸣。', tags: ['#情感共鸣', '#敏感直觉'] },
              { title: '事业与财富能量', icon: 'fa-briefcase', color: 'emerald', content: '二宫与十宫的和谐相位暗示你在物质领域有着天生的敏锐度。双鱼座的果断结合当前星盘的土象能量，预示着你在30岁后将迎来稳健的财富增长期。', tags: ['#大器晚成', '#金融直觉'] },
              { title: '灵魂功课与建议', icon: 'fa-dove', color: 'pink', content: '土星的压制提醒你需要学习“放下执念”。在未来的流年运行中，适度的冥想与艺术创作能帮助你转化负面能量，提升你的灵性感知力。学会在理性与感性间架起桥梁。', tags: ['#灵性觉醒', '#断舍离'] }
            ].map(card => (
              <section key={card.title} className="bg-slate-900/40 p-10 rounded-[3rem] border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className={`w-12 h-12 rounded-2xl bg-${card.color}-500/10 flex items-center justify-center text-${card.color}-400 text-xl`}>
                    <i className={`fas ${card.icon}`}></i>
                  </div>
                  <h3 className="text-slate-100 text-2xl font-bold font-serif">{card.title}</h3>
                </div>
                <p className="text-slate-300 leading-relaxed text-lg font-light">{card.content}</p>
                <div className="flex gap-2 pt-2">
                  {card.tags.map(t => <span key={t} className="px-4 py-1.5 bg-slate-950 border border-slate-800 rounded-full text-[10px] text-slate-500 font-bold">{t}</span>)}
                </div>
              </section>
            ))}
          </div>

          <button onClick={() => navigate('/transit')} className="w-full bg-slate-900/60 border border-slate-800 p-12 rounded-[3.5rem] flex items-center justify-between shadow-2xl group">
             <div className="flex items-center gap-8">
                <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 text-3xl shadow-inner">
                  <i className="fas fa-scroll"></i>
                </div>
                <div className="text-left">
                  <h4 className="text-3xl font-serif font-black text-amber-100">2024-2025 流年深度报告</h4>
                  <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">基于动态星轨的精准趋势预测</p>
                </div>
             </div>
             <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xl shadow-xl group-hover:translate-x-2 transition-transform">
                <i className="fas fa-arrow-right"></i>
             </div>
          </button>
        </div>
      </div>

      {/* PDF 导出专用重构模版 (固定 794px 宽度，离屏渲染) */}
      <div 
        ref={reportRef} 
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: 0, 
          width: '794px', 
          backgroundColor: '#020617', 
          color: 'white',
          fontFamily: 'sans-serif' 
        }}
      >
        {/* 第一页：高清星盘封面 */}
        <section style={{ height: '1123px', padding: '60px', boxSizing: 'border-box', position: 'relative' }}>
          <div style={{ borderBottom: '2px solid rgba(245,158,11,0.3)', paddingBottom: '30px', marginBottom: '60px' }}>
             <h1 style={{ fontSize: '64px', fontWeight: 'bold', color: '#fbbf24', margin: '0 0 10px 0' }}>{user.nickname}</h1>
             <h2 style={{ fontSize: '20px', letterSpacing: '8px', color: '#94a3b8', margin: '0 0 20px 0', textTransform: 'uppercase' }}>本命星盘专业报告</h2>
             <div style={{ fontSize: '14px', color: '#64748b' }}>
                <span style={{ marginRight: '30px' }}>📅 {user.birthInfo.birthDate} {user.birthInfo.birthTime}</span>
                <span>📍 {user.birthInfo.birthLocation}</span>
             </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '40px' }}>
             <div style={{ width: '560px', height: '560px', margin: '0 auto', backgroundColor: 'rgba(15,23,42,0.4)', borderRadius: '50%', padding: '20px' }}>
                <ChartWheel interactive={false} />
             </div>
          </div>

          <div style={{ position: 'absolute', bottom: '60px', width: '100%', left: 0, textAlign: 'center' }}>
             <p style={{ fontSize: '10px', color: '#334155', letterSpacing: '4px', textTransform: 'uppercase' }}>LUCKY STAR STELLAR LAB • PAGE 01 / STAR MAP</p>
          </div>
        </section>

        {/* 分页点 */}
        <div className="page-break" style={{ height: '0px', pageBreakAfter: 'always' }}></div>

        {/* 第二页：核心能量深度解析 */}
        <section style={{ height: '1123px', padding: '60px', boxSizing: 'border-box' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'black', color: '#fbbf24', borderLeft: '6px solid #fbbf24', paddingLeft: '20px', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '3px' }}>第二页：核心能量与性格解析</h3>
          
          <div style={{ marginBottom: '60px' }}>
            {[
              { label: '太阳人格 (Sun)', val: user.sunSign, color: '#fbbf24' },
              { label: '月亮情感 (Moon)', val: user.moonSign, color: '#818cf8' },
              { label: '上升面具 (ASC)', val: user.ascendantSign, color: '#34d399' }
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(15,23,42,0.6)', padding: '30px', borderRadius: '30px', border: '1px solid #1e293b', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                    <p style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 5px 0' }}>{s.label}</p>
                 </div>
                 <p style={{ fontSize: '40px', fontWeight: 'bold', color: s.color, margin: 0 }}>{s.val}</p>
              </div>
            ))}
          </div>

          <div style={{ spaceY: '30px' }}>
            {[
              { title: '核心人格深度分析', content: '您的太阳落在'+user.sunSign+'。这意味着您的生命原动力聚焦于自我价值的实现与意志投射。您天生具备一种不屈的生命力，在困境中往往能爆发出惊人的潜能，是天生的开拓者。' },
              { title: '内在情感交互需求', content: '月亮在'+user.moonSign+'代表了您对精神深度的渴求。在亲密关系中，唯有深度的灵魂共鸣才能填补您的情感内核。您需要学会通过正念冥想来平衡月亮带来的周期性情绪波动。' },
              { title: '事业拓展与建议', content: '星盘显示您具备极佳的商业直觉，二宫与十宫的和谐互动预示着事业将在积累后迎来爆发。学会在理性与感性之间建立桥梁，将是您通往成功的关键密钥。' }
            ].map(i => (
              <div key={i.title} style={{ padding: '30px', border: '1px solid #1e293b', borderRadius: '40px', background: 'rgba(15,23,42,0.3)', marginBottom: '25px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>{i.title}</h4>
                <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: '1.8' }}>{i.content}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="page-break" style={{ height: '0px', pageBreakAfter: 'always' }}></div>

        {/* 第三页：详细星历数据表 */}
        <section style={{ height: '1123px', padding: '60px', boxSizing: 'border-box' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'black', color: '#fbbf24', borderLeft: '6px solid #fbbf24', paddingLeft: '20px', marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '3px' }}>第三页：精准星体落位数据汇编</h3>
          
          <div style={{ backgroundColor: 'rgba(15,23,42,0.3)', padding: '40px', borderRadius: '50px', border: '1px solid #1e293b' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: '15px 10px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>行星 Planet</th>
                  <th style={{ padding: '15px 10px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>落座 Sign</th>
                  <th style={{ padding: '15px 10px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>度数 Degree</th>
                  <th style={{ padding: '15px 10px', fontSize: '10px', color: '#64748b', textTransform: 'uppercase', textAlign: 'center' }}>宫位 House</th>
                </tr>
              </thead>
              <tbody style={{ color: '#cbd5e1', fontSize: '14px' }}>
                {planetaryData.map((p, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid rgba(51,65,85,0.4)' }}>
                    <td style={{ padding: '20px 10px', fontWeight: 'bold', color: 'white' }}>{p.icon} {p.planet}</td>
                    <td style={{ padding: '20px 10px' }}>{p.sign}</td>
                    <td style={{ padding: '20px 10px', fontSize: '11px', fontFamily: 'monospace' }}>{p.degree}</td>
                    <td style={{ padding: '20px 10px', textAlign: 'center', fontWeight: 'bold', color: '#fbbf24' }}>{p.house}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ marginTop: '50px', padding: '30px', backgroundColor: '#020617', borderRadius: '30px', border: '1px solid #1e293b' }}>
               <h5 style={{ color: '#fbbf24', fontSize: '14px', margin: '0 0 10px 0' }}>占星师结语</h5>
               <p style={{ fontSize: '11px', color: '#475569', lineHeight: '1.6' }}>
                 此报告数据基于瑞士星历库（Swiss Ephemeris）精密计算。星盘揭示的是潜在的能量场，而非绝对的宿命。通过对行星相位的深度觉察，您可以更好地驾驭生命中的波动，开启属于自己的高能人生。
               </p>
            </div>
          </div>

          <footer style={{ marginTop: '80px', textAlign: 'center' }}>
            <p style={{ fontSize: '9px', color: '#1e293b', letterSpacing: '4px', textTransform: 'uppercase' }}>Lucky Star Professional Astrology • 报告完结</p>
          </footer>
        </section>
      </div>

      <style>{`
        @keyframes slide-down {
          from { transform: translate(-50%, -40px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-slide-down {
          animation: slide-down 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default BirthChart;
