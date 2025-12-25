
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { calculateSigns } from '../services/astrology';
import { MOCK_CITIES } from '../constants';
import { BirthInfo, Gender } from '../types';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(storageService.loadData());
  const [showAddModal, setShowAddModal] = useState(false);

  // 添加档案的表单状态
  const [newNickname, setNewNickname] = useState('');
  const [newGender, setNewGender] = useState<Gender>(Gender.OTHER);
  const [newBirthDate, setNewBirthDate] = useState('2000-01-01');
  const [newBirthTime, setNewBirthTime] = useState('12:00');
  const [newCity, setNewCity] = useState(MOCK_CITIES[0]);

  const toggleVip = () => {
    const newState = storageService.updateVipStatus(!data.isVip);
    setData(newState);
  };

  const handleSwitchProfile = (id: string) => {
    const newState = storageService.setCurrentUser(id);
    setData(newState);
  };

  const handleAddProfile = () => {
    if (!newNickname.trim()) return;
    const birthInfo: BirthInfo = {
      birthDate: newBirthDate,
      birthTime: newBirthTime,
      birthLocation: newCity.name,
      latitude: newCity.lat,
      longitude: newCity.lng,
    };
    const { sunSign, moonSign, ascSign } = calculateSigns(birthInfo);
    const newProfile = {
      id: Date.now().toString(),
      nickname: newNickname,
      gender: newGender,
      birthInfo,
      isMain: false,
      sunSign,
      moonSign,
      ascendantSign: ascSign,
      avatar: '🌟'
    };
    const newState = storageService.addProfile(newProfile);
    setData(newState);
    setShowAddModal(false);
    setNewNickname('');
    setNewGender(Gender.OTHER);
  };

  const handleLogout = () => {
      if (confirm('确认清除所有数据并退出吗？这将重置您的所有设置。')) {
          localStorage.clear();
          window.location.hash = '#/welcome';
          window.location.reload();
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="flex flex-col md:flex-row items-center gap-8 md:bg-slate-900/30 p-8 rounded-[3rem] border border-slate-800/50">
        <div className="relative">
          <div className="w-32 h-32 rounded-[2rem] bg-slate-800 border-4 border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center text-5xl">
             {data.currentUser?.avatar || '👤'}
          </div>
          {data.isVip && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center border-4 border-slate-950 text-sm shadow-xl">
                👑
              </div>
          )}
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-bold font-serif text-slate-100">{data.currentUser?.nickname || '游客'}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
             <span className="px-3 py-1 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700">{data.currentUser?.sunSign}</span>
             <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs border border-indigo-500/20">{data.isVip ? '黄金会员' : '普通用户'}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Membership & Files */}
        <div className="lg:col-span-8 space-y-8">
          {/* Membership Card */}
          <section className={`p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group ${data.isVip ? 'bg-gradient-to-br from-amber-600 to-amber-500 border-amber-400 shadow-2xl shadow-amber-900/20' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <i className="fas fa-crown text-8xl text-white"></i>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
              <div>
                <h3 className={`text-xl font-bold ${data.isVip ? 'text-slate-950' : 'text-amber-500'}`}>
                    {data.isVip ? '尊贵星辰黄金会员' : '开启您的星辰之旅'}
                </h3>
                <p className={`mt-2 ${data.isVip ? 'text-slate-900/70' : 'text-slate-500'} max-w-md`}>
                    {data.isVip ? '您已解锁无限次 AI 深度解析、流年运势对比及多档案同步功能。有效期至 2026-01-01。' : '开通会员，即可享受 24/7 AI 占星咨询，深度星盘解读与全方位运势预测。'}
                </p>
              </div>
              <button 
                onClick={toggleVip}
                className={`px-8 py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95 whitespace-nowrap ${data.isVip ? 'bg-slate-950 text-white' : 'bg-amber-500 text-slate-950'}`}
              >
                {data.isVip ? '立即续费' : '解锁高级特权'}
              </button>
            </div>
          </section>

          {/* Archives */}
          <section className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <h3 className="font-bold text-lg text-slate-300">档案管理 ({data.profiles.length})</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="text-amber-500 text-sm font-bold bg-amber-500/10 px-5 py-2.5 rounded-2xl border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                <i className="fas fa-plus mr-2"></i> 新增档案
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.profiles.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleSwitchProfile(p.id)}
                  className={`p-6 rounded-[2rem] flex justify-between items-center border transition-all cursor-pointer group ${
                    data.currentUser?.id === p.id 
                    ? 'bg-amber-500/10 border-amber-500 shadow-xl shadow-amber-900/10' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                        {p.avatar || '⭐'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{p.nickname}</p>
                        {p.isMain && <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-lg text-slate-500 font-bold uppercase tracking-wider">本人</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{p.sunSign} • {p.birthInfo.birthDate}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${data.currentUser?.id === p.id ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-600'}`}>
                    <i className={`fas ${data.currentUser?.id === p.id ? 'fa-check' : 'fa-chevron-right'} text-xs`}></i>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Col: Settings */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-slate-900/40 rounded-[2.5rem] overflow-hidden border border-slate-800 p-2">
            {[
              { label: '账户基本设置', icon: 'fa-user-cog', color: 'text-indigo-400', onClick: () => navigate('/settings/account') },
              { label: '隐私与安全偏好', icon: 'fa-shield-alt', color: 'text-emerald-400' },
              { label: '通知提醒管理', icon: 'fa-bell', color: 'text-amber-400' },
              { label: '清除数据并退出', icon: 'fa-power-off', color: 'text-red-400', onClick: handleLogout },
              { label: '关于幸运星', icon: 'fa-info-circle', color: 'text-slate-500' },
            ].map(item => (
              <div 
                key={item.label} 
                onClick={item.onClick}
                className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-800/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center ${item.color} shadow-inner group-hover:scale-110 transition-transform`}>
                    <i className={`fas ${item.icon}`}></i>
                  </div>
                  <span className="text-sm font-medium text-slate-200">{item.label}</span>
                </div>
                <i className="fas fa-chevron-right text-slate-700 text-xs group-hover:translate-x-1 transition-transform"></i>
              </div>
            ))}
          </section>

          <div className="text-center space-y-2 opacity-50">
             <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Lucky Star Official App</p>
             <p className="text-[10px] text-slate-600 font-serif">Version 1.2.4 (PC Optimized)</p>
          </div>
        </div>
      </div>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[2.5rem] p-10 relative z-10 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-serif text-2xl font-bold text-amber-100">添加新档案</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors w-10 h-10 rounded-full hover:bg-slate-800 flex items-center justify-center">
                 <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">姓名</label>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 text-white shadow-inner"
                  placeholder="请输入档案名称"
                  value={newNickname}
                  onChange={e => setNewNickname(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">性别</label>
                <div className="flex gap-3">
                  {[
                    { label: '男', value: Gender.MALE },
                    { label: '女', value: Gender.FEMALE },
                    { label: '保密', value: Gender.OTHER },
                  ].map(g => (
                    <button 
                      key={g.value}
                      onClick={() => setNewGender(g.value)}
                      className={`flex-1 p-4 rounded-2xl border transition-all text-sm font-bold ${newGender === g.value ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">出生日期</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 text-white shadow-inner"
                    value={newBirthDate}
                    onChange={e => setNewBirthDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">出生时间</label>
                  <input 
                    type="time"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 text-white shadow-inner"
                    value={newBirthTime}
                    onChange={e => setNewBirthTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-500 uppercase tracking-widest font-bold">出生地点</label>
                <select 
                   className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 outline-none focus:border-amber-500 text-white cursor-pointer shadow-inner"
                   value={newCity.name}
                   onChange={e => setNewCity(MOCK_CITIES.find(c => c.name === e.target.value) || MOCK_CITIES[0])}
                >
                  {MOCK_CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <button 
                onClick={handleAddProfile}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-5 rounded-2xl shadow-2xl shadow-amber-900/20 mt-4 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                保存档案
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default Profile;
