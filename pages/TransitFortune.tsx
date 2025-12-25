
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { getTransitData } from '../services/astrology';
import { askGemini } from '../services/gemini';

// 专用的 Markdown 渲染组件，支持加粗、标题、列表和换行
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const processed = content
    .replace(/\n\n/g, '<div class="h-3"></div>') // 双换行转间距
    .replace(/\n/g, '<br/>') // 单换行
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-200">$1</strong>') // 加粗
    .replace(/### (.*?)(<br\/>|$)/g, '<h3 class="text-md font-bold text-indigo-300 mt-4 mb-1">$1</h3>') // 三级标题
    .replace(/^\* (.*?)(<br\/>|$)/gm, '<div class="flex gap-2 my-1"><span class="text-indigo-400">•</span><span class="text-indigo-100/70">$1</span></div>');

  return (
    <div 
      className="text-sm leading-relaxed text-indigo-100/70 font-light" 
      dangerouslySetInnerHTML={{ __html: processed }} 
    />
  );
};

const TransitFortune: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'week' | 'month' | 'year'>('week');
  const [data, setData] = useState(storageService.loadData());
  const [transit, setTransit] = useState(getTransitData(data.currentUser?.sunSign || '', 'week'));
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const fetchAiAdvice = async (currentTab: string) => {
    const user = data.currentUser;
    if (!user) return;

    setLoadingAdvice(true);
    setAiAdvice('');

    const timeframeLabel = currentTab === 'week' ? '本周' : currentTab === 'month' ? '本月' : '本年度';
    const eventsSummary = transit.events.map(e => e.title).join('、');
    
    const prompt = `请作为一名资深占星师，为用户 ${user.nickname} 提供一份深度的${timeframeLabel}流年运势解读。
    用户星盘背景：太阳${user.sunSign}，月亮${user.moonSign}，上升${user.ascendantSign}。
    当前天象关键影响：${eventsSummary}。
    
    请结合用户的太阳、月亮和上升星座特质，深入分析这些天象如何与其本命盘互动。
    输出要求：
    1. 专业、具有启发性、语言优美。
    2. 包含 3-4 个段落。
    3. 使用 Markdown 格式（可以加粗关键词，使用列表）。
    4. 针对其性格弱点提供实操性的建议。
    字数要求：300字左右。`;

    try {
      const response = await askGemini(prompt, user);
      setAiAdvice(response);
    } catch (error) {
      setAiAdvice("星象能量目前较为混乱，AI 占星师暂时无法读取。请稍后再试。");
    } finally {
      setLoadingAdvice(false);
    }
  };

  useEffect(() => {
    const newTransit = getTransitData(data.currentUser?.sunSign || '', tab);
    setTransit(newTransit);
    fetchAiAdvice(tab);
  }, [tab]);

  if (!data.currentUser) return null;

  return (
    <div className="p-4 space-y-6 bg-slate-950 min-h-screen">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800">
           <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="font-serif text-xl font-bold">流年运势报告</h1>
      </header>

      {/* Tabs */}
      <div className="flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
        {[
          { label: '本周', val: 'week' },
          { label: '本月', val: 'month' },
          { label: '年度', val: 'year' },
        ].map(t => (
          <button 
            key={t.val}
            onClick={() => setTab(t.val as any)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === t.val ? 'bg-amber-500 text-slate-900 shadow-lg' : 'text-slate-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Trend Chart (Simple SVG Implementation) */}
      <section className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-sm font-bold text-slate-400">能量起伏趋势</h3>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {tab === 'week' ? '近期波动明显' : '整体呈上升态势'}
          </span>
        </div>
        <div className="h-40 relative flex items-end justify-between px-2">
            {transit.trend.map((point, i) => (
                <div key={i} className="flex flex-col items-center gap-2 group relative">
                    <div 
                        className="w-1.5 bg-gradient-to-t from-amber-500/20 to-amber-500 rounded-full transition-all group-hover:w-2"
                        style={{ height: `${point.value}%` }}
                    ></div>
                    <span className="text-[8px] text-slate-600">{point.label}</span>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all bg-slate-800 px-1.5 py-0.5 rounded text-[8px] font-bold border border-slate-700 pointer-events-none">
                        {Math.floor(point.value)}
                    </div>
                </div>
            ))}
            <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-800 -z-10 opacity-50"></div>
        </div>
      </section>

      {/* Key Transit Events */}
      <section className="space-y-3">
        <h3 className="font-serif text-lg text-amber-100 flex items-center gap-2">
           <i className="fas fa-satellite text-amber-500"></i>
           关键星象影响
        </h3>
        <div className="space-y-3">
          {transit.events.map((event, i) => (
            <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex gap-4 items-start">
               <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg ${
                 event.intensity === 'high' ? 'bg-amber-500/10 text-amber-500' : 'bg-indigo-500/10 text-indigo-400'
               }`}>
                  <i className={`fas ${event.intensity === 'high' ? 'fa-bolt' : 'fa-wave-square'}`}></i>
               </div>
               <div>
                  <h4 className="text-sm font-bold mb-1">{event.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{event.description}</p>
               </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Deep Analysis Section - Dynamic Content */}
      <section className="bg-indigo-950/20 border border-indigo-500/20 p-6 rounded-3xl space-y-4 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <i className="fas fa-star-and-crescent text-6xl text-indigo-400"></i>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${loadingAdvice ? 'bg-indigo-600 animate-pulse' : 'bg-indigo-500'}`}>
                <i className={`fas ${loadingAdvice ? 'fa-spinner fa-spin' : 'fa-magic'} text-white text-sm`}></i>
            </div>
            <h3 className="font-bold text-indigo-200">AI 星语深度建议</h3>
        </div>

        <div className="relative z-10 min-h-[150px]">
          {loadingAdvice ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-3 bg-indigo-500/10 rounded w-full"></div>
              <div className="h-3 bg-indigo-500/10 rounded w-5/6"></div>
              <div className="h-3 bg-indigo-500/10 rounded w-4/6"></div>
              <div className="h-3 bg-indigo-500/10 rounded w-full"></div>
            </div>
          ) : (
            <MarkdownRenderer content={aiAdvice || "点击上方标签，让我为你解读这一时期的星象能量..."} />
          )}
        </div>

        {!loadingAdvice && aiAdvice && (
          <p className="text-[10px] text-indigo-400/50 italic pt-2 border-t border-indigo-500/10">
            * 建议由专业占星 AI 基于您的 ${data.currentUser.sunSign}、${data.currentUser.moonSign} 及 ${data.currentUser.ascendantSign} 本命特征实时生成。
          </p>
        )}
      </section>

      <div className="flex gap-4 pb-8">
        <button className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-400 font-bold text-xs hover:bg-slate-800 transition-colors">分享报告</button>
        <button onClick={() => navigate('/ai')} className="flex-1 bg-amber-500 text-slate-900 p-4 rounded-2xl font-bold text-xs shadow-xl shadow-amber-900/20 active:scale-95 transition-all">
          咨询 AI 占星师
        </button>
      </div>
    </div>
  );
};

export default TransitFortune;
