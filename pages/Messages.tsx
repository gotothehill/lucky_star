
import React from 'react';

const Messages: React.FC = () => {
  const notifications = [
    { id: 1, title: '运势更新', content: '你今日的幸运指数高达92%，是个适合表白的好日子！', time: '1小时前', icon: 'fa-star', color: 'text-amber-500' },
    { id: 2, title: '星象提醒', content: '水星即将进入逆行前期，请注意备份电子数据。', time: '昨天', icon: 'fa-moon', color: 'text-indigo-400' },
    { id: 3, title: '会员特惠', content: '您的试用会员即将到期，现在续费享5折优惠。', time: '2天前', icon: 'fa-crown', color: 'text-yellow-500' },
  ];

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 bg-slate-950 sticky top-0 border-b border-slate-800 text-center">
        <h1 className="font-serif text-lg font-bold">消息中心</h1>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex gap-4 mb-6">
            <button className="flex-1 bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex flex-col items-center gap-1">
                <i className="fas fa-bell text-amber-500"></i>
                <span className="text-xs">系统通知</span>
            </button>
            <button className="flex-1 bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex flex-col items-center gap-1">
                <i className="fas fa-comment-dots text-blue-500"></i>
                <span className="text-xs">互动私信</span>
            </button>
        </div>

        <div className="space-y-3">
          {notifications.map(n => (
            <div key={n.id} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex gap-4 transition-all hover:bg-slate-900 active:scale-95 cursor-pointer">
              <div className={`w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center flex-shrink-0 ${n.color} text-lg`}>
                <i className={`fas ${n.icon}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold">{n.title}</h4>
                  <span className="text-[10px] text-slate-600">{n.time}</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{n.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;
