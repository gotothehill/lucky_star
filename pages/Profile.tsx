
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { calculateSigns } from '../services/astrology';
import { BirthInfo, Gender } from '../types';
import CityAutocomplete from '../components/CityAutocomplete';
import { searchCities } from '../services/citySearch';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(storageService.loadData());
  const [showAddModal, setShowAddModal] = useState(false);

  // 添加档案的表单状态
  const [newNickname, setNewNickname] = useState('');
  const [newGender, setNewGender] = useState<Gender>(Gender.OTHER);
  const [newBirthDate, setNewBirthDate] = useState('2000-01-01');
  const [newBirthTime, setNewBirthTime] = useState('12:00');
  const [newCityName, setNewCityName] = useState('北京');
  const [newLatitude, setNewLatitude] = useState(39.9042);
  const [newLongitude, setNewLongitude] = useState(116.4074);

  const toggleVip = () => {
    const newState = storageService.updateVipStatus(!data.isVip);
    setData(newState);
  };

  const handleSwitchProfile = (id: string) => {
    const newState = storageService.setCurrentUser(id);
    setData(newState);
  };

  const handleAddProfile = async () => {
    if (!newNickname.trim()) return;
    let finalLat = newLatitude;
    let finalLng = newLongitude;
    if ((!finalLat && !finalLng) || !Number.isFinite(finalLat) || !Number.isFinite(finalLng)) {
      const [matched] = await searchCities(newCityName, 1);
      if (matched) {
        finalLat = matched.latitude;
        finalLng = matched.longitude;
        setNewLatitude(finalLat);
        setNewLongitude(finalLng);
      }
    }
    const birthInfo: BirthInfo = {
      birthDate: newBirthDate,
      birthTime: newBirthTime,
      birthLocation: newCityName,
      latitude: finalLat,
      longitude: finalLng,
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
      if (window.confirm('确认清除所有数据并退出吗？这将重置您的所有设置且不可恢复。')) {
          storageService.clearAllData();
          // 强制返回根路径并重载
          window.location.replace('#/');
          window.location.reload();
      }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row items-center gap-8 md:bg-slate-900/30 p-10 rounded-[3rem] border border-slate-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[80px] rounded-full"></div>
        <div className="relative">
          <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-4 border-slate-900 shadow-2xl overflow-hidden flex items-center justify-center text-5xl shadow-inner">
             {data.currentUser?.avatar || '👤'}
          </div>
          {data.isVip && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center border-4 border-slate-950 text-sm shadow-xl animate-bounce">
                👑
              </div>
          )}
        </div>
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-4xl font-bold font-serif text-slate-100">{data.currentUser?.nickname || '星系访客'}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
             <span className="px-4 py-1.5 bg-slate-800 rounded-full text-xs text-slate-400 border border-slate-700 font-bold uppercase tracking-widest">{data.currentUser?.sunSign}</span>
             <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-full text-xs border border-indigo-500/20 font-bold uppercase tracking-widest">{data.isVip ? '黄金会员' : '普通用户'}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Col: Membership & Files */}
        <div className="lg:col-span-8 space-y-10">
          {/* Membership Card */}
          <section className={`p-10 rounded-[2.5rem] border transition-all relative overflow-hidden group ${data.isVip ? 'bg-gradient-to-br from-amber-600 to-amber-500 border-amber-400 shadow-2xl shadow-amber-900/20' : 'bg-slate-900/50 border-slate-800'}`}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-1000">
               <i className="fas fa-crown text-[10rem] text-white"></i>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-10">
              <div className="space-y-4">
                <h3 className={`text-2xl font-serif font-bold ${data.isVip ? 'text-slate-950' : 'text-amber-500'}`}>
                    {data.isVip ? '尊贵星辰黄金会员' : '开启您的星辰会员特权'}
                </h3>
                <p className={`text-lg font-light ${data.isVip ? 'text-slate-900/70' : 'text-slate-500'} max-w-lg`}>
                    {data.isVip ? '您已解锁无限次 AI 深度解析、流年运势对比及多档案同步功能。有效期至 2026-01-01。' : '开通会员，即可享受 24/7 AI 占星咨询，深度星盘解读与全方位运势预测。'}
                </p>
              </div>
              <button 
                onClick={toggleVip}
                className={`px-10 py-5 rounded-2xl font-bold shadow-2xl transition-all active:scale-95 whitespace-nowrap text-lg ${data.isVip ? 'bg-slate-950 text-white' : 'bg-amber-500 text-slate-950'}`}
              >
                {data.isVip ? '续费会员' : '立即解锁'}
              </button>
            </div>
          </section>

          {/* Archives */}
          <section className="space-y-6">
            <div className="flex justify-between items-center px-4">
              <h3 className="font-serif font-bold text-2xl text-slate-200">档案管理 ({data.profiles.length})</h3>
              <button 
                onClick={() => setShowAddModal(true)}
                className="text-amber-500 text-xs font-bold bg-amber-500/10 px-6 py-3 rounded-2xl border border-amber-500/30 hover:bg-amber-500/20 transition-all uppercase tracking-widest"
              >
                <i className="fas fa-plus mr-2"></i> 新增档案
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.profiles.map(p => (
                <div 
                  key={p.id} 
                  onClick={() => handleSwitchProfile(p.id)}
                  className={`p-8 rounded-[2.5rem] flex justify-between items-center border transition-all cursor-pointer group shadow-xl ${
                    data.currentUser?.id === p.id 
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-amber-900/10 ring-1 ring-amber-500/20' 
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-inner border border-slate-800">
                        {p.avatar || '⭐'}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-xl">{p.nickname}</p>
                        {p.isMain && <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-lg text-slate-500 font-bold uppercase tracking-widest border border-slate-700">本人</span>}
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-medium tracking-wide uppercase">{p.sunSign} • {p.birthInfo.birthDate}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${data.currentUser?.id === p.id ? 'bg-amber-500 text-slate-950 border-amber-400' : 'bg-slate-950 text-slate-700 border-slate-800'}`}>
                    <i className={`fas ${data.currentUser?.id === p.id ? 'fa-check' : 'fa-chevron-right'} text-sm`}></i>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Col: Settings */}
        <div className="lg:col-span-4 space-y-10">
           <section className="bg-slate-900/40 rounded-[3rem] overflow-hidden border border-slate-800 p-3 shadow-2xl">
            {[
              { label: '账户基本设置', icon: 'fa-user-cog', color: 'text-indigo-400', onClick: () => navigate('/settings/account') },
              { label: '隐私与数据中心', icon: 'fa-shield-alt', color: 'text-emerald-400' },
              { label: '系统通知偏好', icon: 'fa-bell', color: 'text-amber-400' },
              { 
                  label: '彻底清除并退出', 
                  icon: 'fa-power-off', 
                  color: 'text-rose-500', 
                  onClick: handleLogout,
                  extra: '不可撤销' 
              },
              { label: '关于幸运星 v1.2', icon: 'fa-info-circle', color: 'text-slate-600' },
            ].map(item => (
              <div 
                key={item.label} 
                onClick={item.onClick}
                className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-800/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl bg-slate-950 flex items-center justify-center ${item.color} shadow-inner group-hover:scale-110 transition-transform border border-slate-800/50`}>
                    <i className={`fas ${item.icon} text-lg`}></i>
                  </div>
                  <div>
                    <span className="text-base font-medium text-slate-200 block">{item.label}</span>
                    {item.extra && <span className="text-[10px] text-rose-500/50 font-bold uppercase tracking-widest">{item.extra}</span>}
                  </div>
                </div>
                <i className="fas fa-chevron-right text-slate-800 text-xs group-hover:translate-x-2 transition-transform group-hover:text-amber-500"></i>
              </div>
            ))}
          </section>

          <div className="text-center space-y-3 opacity-40">
             <div className="flex justify-center gap-6 text-xl text-slate-500">
                <i className="fab fa-instagram hover:text-amber-500 transition-colors cursor-pointer"></i>
                <i className="fab fa-twitter hover:text-amber-500 transition-colors cursor-pointer"></i>
                <i className="fab fa-weixin hover:text-amber-500 transition-colors cursor-pointer"></i>
             </div>
             <p className="text-[10px] text-slate-600 uppercase tracking-[0.4em] font-bold">LuckStar Universe © 2024</p>
          </div>
        </div>
      </div>

      {/* Add Profile Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md animate-fade-in" onClick={() => setShowAddModal(false)}></div>
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[3.5rem] p-12 relative z-10 animate-slide-up shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-serif text-3xl font-bold text-amber-100">建立星辰档案</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white transition-colors w-12 h-12 rounded-2xl hover:bg-slate-800 flex items-center justify-center">
                 <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">姓名 / 称呼</label>
                <input 
                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-amber-500/50 text-white text-lg transition-all shadow-inner"
                  placeholder="请输入姓名"
                  value={newNickname}
                  onChange={e => setNewNickname(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">性格极向 (性别)</label>
                <div className="flex gap-4">
                  {[
                    { label: '阳性', value: Gender.MALE },
                    { label: '阴性', value: Gender.FEMALE },
                    { label: '中性', value: Gender.OTHER },
                  ].map(g => (
                    <button 
                      key={g.value}
                      onClick={() => setNewGender(g.value)}
                      className={`flex-1 py-5 rounded-2xl border-2 transition-all text-sm font-bold tracking-widest ${newGender === g.value ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-lg shadow-amber-900/10' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">出生日期</label>
                  <input 
                    type="date"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-amber-500/50 text-white shadow-inner"
                    value={newBirthDate}
                    onChange={e => setNewBirthDate(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">出生时刻</label>
                  <input 
                    type="time"
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-amber-500/50 text-white shadow-inner"
                    value={newBirthTime}
                    onChange={e => setNewBirthTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">出生星区 (地点)</label>
                <CityAutocomplete
                  value={newCityName}
                  onSelect={city => {
                    setNewCityName(city.name);
                    setNewLatitude(city.latitude);
                    setNewLongitude(city.longitude);
                  }}
                  onInputChange={(val) => {
                    setNewCityName(val);
                    setNewLatitude(0);
                    setNewLongitude(0);
                  }}
                  placeholder="输入城市名称（支持中文/拼音）"
                  inputClassName="bg-slate-950 border-2 border-slate-800 rounded-2xl p-5 outline-none focus:border-amber-500/50 text-white shadow-inner"
                />
                <p className="text-[11px] text-slate-600">优先中文匹配，未命中会自动用拼音搜索，选中后经纬度自动带入。</p>
              </div>

              <button 
                onClick={handleAddProfile}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-6 rounded-2xl shadow-2xl shadow-amber-900/20 mt-6 hover:scale-[1.02] active:scale-[0.98] transition-all text-xl"
              >
                保存星辰档案
              </button>
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

export default Profile;
