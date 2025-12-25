
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { UserProfile } from '../types';
import { askGemini } from '../services/gemini';

type MatchType = '恋爱' | '婚姻' | '友情' | '合作';

// 专用的 Markdown 渲染组件，支持加粗、标题、列表和换行
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const processed = content
    .replace(/\n\n/g, '<div class="h-4"></div>') // 双换行转间距
    .replace(/\n/g, '<br/>') // 单换行
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400">$1</strong>') // 加粗
    .replace(/### (.*?)(<br\/>|$)/g, '<h3 class="text-lg font-bold text-indigo-200 mt-6 mb-2 flex items-center gap-2">$1</h3>') // 三级标题
    .replace(/^\* (.*?)(<br\/>|$)/gm, '<div class="flex gap-2 my-2"><span class="text-indigo-400">•</span><span class="text-slate-300">$1</span></div>') // 无序列表
    .replace(/^(\d+)\. (.*?)(<br\/>|$)/gm, '<div class="flex gap-2 my-2"><span class="text-amber-500 font-bold">$1.</span><span class="text-slate-300">$2</span></div>'); // 有序列表

  return (
    <div 
      className="text-sm leading-relaxed text-slate-300 font-light" 
      dangerouslySetInnerHTML={{ __html: processed }} 
    />
  );
};

const Synastry: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(storageService.loadData());
  const [targetProfile, setTargetProfile] = useState<UserProfile | null>(null);
  const [matchType, setMatchType] = useState<MatchType>('恋爱');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    dimensions: { label: string; score: number }[];
    summary: string;
    advantage: string;
    challenge: string;
  } | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [aiReport, setAiReport] = useState<string | null>(null);

  const currentUser = data.currentUser;

  const startAnalysis = async () => {
    if (!targetProfile || !currentUser) return;
    setAnalyzing(true);
    setAiReport(null);
    setResult(null);
    
    // 模拟计算过程
    setTimeout(async () => {
      const baseScore = Math.floor(Math.random() * 25) + 70;
      const mockResult = {
        score: baseScore,
        dimensions: [
          { label: '情感契合', score: baseScore + (Math.random() * 10 - 5) },
          { label: '沟通共鸣', score: baseScore + (Math.random() * 10 - 5) },
          { label: '价值匹配', score: baseScore + (Math.random() * 10 - 5) },
          { label: '成长潜力', score: baseScore + (Math.random() * 10 - 5) },
        ],
        summary: `你们的${matchType}合盘显示出极强的互补性。${currentUser.sunSign}与${targetProfile.sunSign}的组合往往能碰撞出不一样的火花。`,
        advantage: "双方在精神世界有深度共鸣，能够给予对方足够的情感安全感。",
        challenge: "在日常琐事处理上可能存在节奏不一的情况，需要更多的包容。"
      };
      setResult(mockResult);
      setAnalyzing(false);

      // 异步获取 AI 深度建议，要求特定格式
      const prompt = `请作为专业占星师，深度分析这两个人的合盘关系。
      人A：${currentUser.nickname}，太阳${currentUser.sunSign}，月亮${currentUser.moonSign}，上升${currentUser.ascendantSign}。
      人B：${targetProfile.nickname}，太阳${targetProfile.sunSign}，月亮${targetProfile.moonSign}，上升${targetProfile.ascendantSign}。
      关系类型：${matchType}。
      
      请按以下格式输出：
      1. 开场白，亲切地称呼 A。
      2. 总体印象分析。
      3. ### 🪐 星盘深度解析：[一个富有诗意的标题]
      4. 使用列表（*）列出 2-3 个核心点（如情感链接、能量场）。
      5. ### 🌟 深度相处建议
      6. 使用数字列表（1. 2. 3.）给出具体的改进建议。
      7. 简短的结语。
      全文约300字，使用 Markdown 格式。`;
      
      const report = await askGemini(prompt, currentUser);
      setAiReport(report);
    }, 2500);
  };

  const otherProfiles = data.profiles.filter(p => p.id !== currentUser?.id);

  if (!currentUser) return null;

  return (
    <div className="p-4 space-y-6 min-h-screen bg-slate-950 pb-24">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800">
           <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="font-serif text-xl font-bold">合盘匹配分析</h1>
      </header>

      {/* Profile Selector Area */}
      <section className="flex items-center justify-around p-8 bg-slate-900/50 rounded-3xl border border-slate-800 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-500/10 text-8xl pointer-events-none">
          <i className={`fas fa-heart ${analyzing ? 'animate-ping' : ''}`}></i>
        </div>
        
        {/* Current User */}
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl border border-white/10">
                {currentUser.avatar || '🌟'}
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold">{currentUser.nickname}</p>
            <p className="text-[10px] text-slate-500">{currentUser.sunSign}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
            <div className={`w-12 h-0.5 rounded-full transition-all duration-1000 ${analyzing ? 'bg-pink-500 shadow-[0_0_10px_#ec4899]' : 'bg-slate-700'}`}></div>
            <i className={`fas fa-bolt ${analyzing ? 'text-amber-400 animate-pulse' : 'text-slate-800'}`}></i>
            <div className={`w-12 h-0.5 rounded-full transition-all duration-1000 ${analyzing ? 'bg-pink-500 shadow-[0_0_10px_#ec4899]' : 'bg-slate-700'}`}></div>
        </div>

        {/* Target Profile */}
        <div 
          className="flex flex-col items-center gap-3 relative z-10 cursor-pointer"
          onClick={() => !analyzing && setShowPicker(true)}
        >
          <div className={`w-20 h-20 rounded-full p-1 transition-all ${targetProfile ? 'bg-gradient-to-br from-pink-500 to-orange-400 shadow-lg shadow-pink-500/20' : 'bg-slate-800 border-2 border-dashed border-slate-700'}`}>
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl border border-white/5">
                {targetProfile ? (targetProfile.avatar || '⭐') : <i className="fas fa-plus text-slate-600"></i>}
            </div>
          </div>
          <div className="text-center">
            <p className={`text-sm font-bold ${!targetProfile ? 'text-slate-600' : ''}`}>{targetProfile ? targetProfile.nickname : '选择对象'}</p>
            <p className="text-[10px] text-slate-500">{targetProfile ? targetProfile.sunSign : '点击添加'}</p>
          </div>
        </div>
      </section>

      {!result && !analyzing && (
        <div className="animate-fade-in space-y-6">
            <div className="space-y-3">
                <label className="text-xs text-slate-500 uppercase tracking-widest block text-center">选择关系类型</label>
                <div className="grid grid-cols-4 gap-2">
                    {(['恋爱', '婚姻', '友情', '合作'] as MatchType[]).map(type => (
                        <button 
                            key={type} 
                            onClick={() => setMatchType(type)}
                            className={`py-3 rounded-xl text-xs font-bold border transition-all ${
                                matchType === type 
                                ? 'bg-pink-500 border-pink-400 text-white shadow-lg shadow-pink-900/20' 
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>
            
            <button 
                disabled={!targetProfile}
                onClick={startAnalysis}
                className="w-full bg-gradient-to-r from-pink-500 to-orange-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-bold p-5 rounded-2xl shadow-2xl shadow-pink-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
                {targetProfile ? (
                    <>
                        <i className="fas fa-magic"></i>
                        开启合盘深度分析
                    </>
                ) : '请先选择匹配对象'}
            </button>
        </div>
      )}

      {analyzing && (
          <div className="flex flex-col items-center py-12 space-y-6">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-star text-pink-500 animate-pulse"></i>
                </div>
            </div>
            <div className="text-center space-y-2">
                <p className="text-sm text-slate-300 font-medium">正在读取星界能量...</p>
                <p className="text-[10px] text-slate-600">正在生成您的专属解读报告</p>
            </div>
          </div>
      )}

      {result && (
          <div className="animate-fade-in space-y-6 pb-12">
            <div className="text-center bg-slate-900/30 p-8 rounded-[2.5rem] border border-slate-800 relative">
                <p className="text-slate-500 text-xs tracking-[0.2em] uppercase mb-2">综合配对指数</p>
                <div className="text-7xl font-serif font-bold bg-clip-text text-transparent bg-gradient-to-b from-pink-400 to-orange-600 my-4">
                    {result.score}
                </div>
                <div className="flex justify-center gap-2">
                    {[1,2,3,4,5].map(i => (
                        <i key={i} className={`fas fa-star text-sm ${i <= Math.round(result.score/20) ? 'text-pink-500' : 'text-slate-800'}`}></i>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {result.dimensions.map(d => (
                    <div key={d.label} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] text-slate-500">{d.label}</span>
                            <span className="text-[10px] text-pink-400 font-bold">{Math.floor(d.score)}%</span>
                        </div>
                        <div className="h-1 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-pink-500" style={{ width: `${d.score}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Deep Analysis Section - Updated Styling to match design */}
            <section className="bg-slate-900/40 border border-indigo-500/20 shadow-2xl shadow-indigo-500/5 p-6 rounded-[2rem] space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <i className="fas fa-magic text-white text-sm"></i>
                        </div>
                        <h3 className="font-bold text-slate-100 text-base">AI 星语深度解读</h3>
                    </div>
                    {!aiReport && <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>}
                </div>
                
                <div className="min-h-[200px]">
                  {aiReport ? (
                    <MarkdownRenderer content={aiReport} />
                  ) : (
                    <div className="space-y-3">
                      <div className="h-4 bg-slate-800/50 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-slate-800/50 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-slate-800/50 rounded w-5/6 animate-pulse"></div>
                      <div className="h-4 bg-slate-800/50 rounded w-4/5 animate-pulse"></div>
                    </div>
                  )}
                </div>
            </section>

            <div className="flex gap-3">
                <button 
                    onClick={() => {setResult(null); setAiReport(null);}} 
                    className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-2xl text-slate-400 font-bold text-xs hover:bg-slate-800 transition-colors"
                >
                    重新测算
                </button>
                <button className="flex-1 bg-amber-500 text-slate-900 p-4 rounded-2xl font-bold text-xs shadow-xl shadow-amber-900/20 active:scale-95 transition-all">
                    保存结果
                </button>
            </div>
          </div>
      )}

      {/* Profile Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center px-4 pb-6">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowPicker(false)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-6 relative z-10 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-amber-100 font-serif">选择匹配对象</h3>
              <button onClick={() => setShowPicker(false)} className="text-slate-500 w-8 h-8 rounded-full hover:bg-slate-800 flex items-center justify-center transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            {otherProfiles.length > 0 ? (
                <div className="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar pb-4">
                    {otherProfiles.map(p => (
                        <div 
                            key={p.id}
                            onClick={() => {setTargetProfile(p); setShowPicker(false); setResult(null);}}
                            className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between active:bg-slate-800 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl group-hover:bg-slate-700 transition-colors">
                                    {p.avatar || '⭐'}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-200">{p.nickname}</p>
                                    <p className="text-[10px] text-slate-500">{p.sunSign} • {p.birthInfo.birthDate}</p>
                                </div>
                            </div>
                            <i className="fas fa-chevron-right text-slate-700 text-xs group-hover:text-amber-500 transition-colors"></i>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mx-auto text-slate-700">
                      <i className="fas fa-user-plus text-2xl"></i>
                    </div>
                    <p className="text-slate-500 text-sm">目前还没有其他档案哦</p>
                    <button 
                        onClick={() => {setShowPicker(false); navigate('/profile');}}
                        className="bg-amber-500/10 text-amber-500 border border-amber-500/30 px-8 py-3 rounded-full text-xs font-bold hover:bg-amber-500/20 transition-all"
                    >
                        去添加档案
                    </button>
                </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Synastry;
