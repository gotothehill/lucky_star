
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: number;
  title: string;
  content: string;
  fullContent?: string;
  time: string;
  icon: string;
  color: string;
  type: 'system' | 'star' | 'vip';
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [selectedMsg, setSelectedMsg] = useState<Notification | null>(null);

  const notifications: Notification[] = [
    { 
      id: 1, 
      title: '今日运势更新', 
      content: '你今日的幸运指数高达92%，是个适合开启新计划的好日子！', 
      fullContent: '今天群星的力量在你的命宫交织。由于太阳与木星呈现和谐相位，你的自信心和表现欲将达到巅峰。建议在上午 10:00 左右处理重要的商务洽谈或进行情感告白，成功的概率将远超往常。别忘了佩戴一些金色的饰品来增强财运。',
      time: '1小时前', 
      icon: 'fa-star', 
      color: 'text-amber-500',
      type: 'star'
    },
    { 
      id: 2, 
      title: '天象紧急提醒', 
      content: '水星即将进入逆行前期，请注意备份电子数据及检查沟通细节。', 
      fullContent: '水星将在后天正式开启逆行。在接下来的 48 小时内，你可能会感受到沟通成本的明显增加。建议：\n1. 备份重要的手机和电脑数据。\n2. 仔细检查即将签署的合同条款。\n3. 与旧友取得联系，这可能是一个修复过去关系的好时机。',
      time: '昨天', 
      icon: 'fa-moon', 
      color: 'text-indigo-400',
      type: 'system'
    },
    { 
      id: 3, 
      title: '会员权益特惠', 
      content: '您的黄金会员权益即将到期，现在续费可享年终限定5折优惠。', 
      fullContent: '亲爱的幸运星用户，您的年度黄金会员将在 3 天后到期。作为老用户，我们为您准备了专属福利：立享年费 5 折优惠，并额外赠送 30 天 AI 深度解析额度。不要错过精准掌握未来一整年运势的机会！',
      time: '2天前', 
      icon: 'fa-crown', 
      color: 'text-yellow-500',
      type: 'vip'
    },
  ];

  return (
    <div className="flex flex-col space-y-6 animate-fade-in max-w-4xl mx-auto">
      <header className="p-8 bg-slate-900/30 rounded-[2.5rem] border border-slate-800/50 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
            <i className="fas fa-bell text-7xl text-amber-500"></i>
        </div>
        <h1 className="font-serif text-3xl font-bold text-amber-100">星际消息中心</h1>
        <p className="text-slate-500 text-sm mt-2 font-light">来自星系的实时动态与个人提醒</p>
      </header>

      <div className="p-4 space-y-6">
        <div className="flex gap-4">
            <button className="flex-1 bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-amber-500/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-lg group-hover:scale-110 transition-transform">
                    <i className="fas fa-bell"></i>
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">系统通知</span>
            </button>
            <button className="flex-1 bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-indigo-500/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <i className="fas fa-star"></i>
                </div>
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">运势日报</span>
            </button>
        </div>

        <div className="space-y-4">
          {notifications.map(n => (
            <div 
              key={n.id} 
              onClick={() => setSelectedMsg(n)}
              className="bg-slate-900/40 p-6 rounded-[2rem] border border-slate-800 flex gap-6 transition-all hover:bg-slate-800/60 active:scale-[0.98] cursor-pointer group shadow-xl"
            >
              <div className={`w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center flex-shrink-0 ${n.color} text-xl shadow-inner group-hover:scale-105 transition-transform`}>
                <i className={`fas ${n.icon}`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-slate-100 group-hover:text-amber-200 transition-colors">{n.title}</h4>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{n.time}</span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-light">{n.content}</p>
              </div>
              <div className="flex items-center text-slate-700 group-hover:text-amber-500 transition-colors">
                 <i className="fas fa-chevron-right text-xs"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Detail Modal */}
      {selectedMsg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md animate-fade-in" onClick={() => setSelectedMsg(null)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3rem] p-10 relative z-10 animate-slide-up shadow-2xl">
            <header className="flex items-center gap-6 mb-8">
              <div className={`w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center ${selectedMsg.color} text-3xl shadow-inner`}>
                <i className={`fas ${selectedMsg.icon}`}></i>
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-slate-50">{selectedMsg.title}</h3>
                <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-bold">{selectedMsg.time}</p>
              </div>
            </header>

            <div className="space-y-6">
              <p className="text-lg text-slate-300 leading-relaxed font-light italic">
                "{selectedMsg.content}"
              </p>
              <div className="h-px bg-slate-800 w-1/4 mx-auto"></div>
              <div className="text-slate-400 text-sm leading-relaxed space-y-4">
                 {selectedMsg.fullContent?.split('\n').map((line, i) => (
                   <p key={i}>{line}</p>
                 ))}
              </div>
            </div>

            <div className="mt-12 flex gap-4">
              <button 
                onClick={() => setSelectedMsg(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold py-4 rounded-2xl transition-all"
              >
                我知道了
              </button>
              {selectedMsg.type === 'star' && (
                <button 
                  onClick={() => {setSelectedMsg(null); navigate('/');}}
                  className="flex-1 bg-amber-500 text-slate-950 font-bold py-4 rounded-2xl shadow-xl shadow-amber-900/20 hover:scale-[1.02] transition-all"
                >
                  去主页查看
                </button>
              )}
              {selectedMsg.type === 'vip' && (
                <button 
                  onClick={() => {setSelectedMsg(null); navigate('/profile');}}
                  className="flex-1 bg-amber-500 text-slate-950 font-bold py-4 rounded-2xl shadow-xl shadow-amber-900/20 hover:scale-[1.02] transition-all"
                >
                  立即续费
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Messages;
