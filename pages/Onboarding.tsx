
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { calculateSigns } from '../services/astrology';
import { Gender, BirthInfo } from '../types';
import CityAutocomplete from '../components/CityAutocomplete';
import { searchCities } from '../services/citySearch';

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.OTHER);
  const [birthDate, setBirthDate] = useState('1995-01-01');
  const [birthTime, setBirthTime] = useState('12:00');
  const [cityName, setCityName] = useState('北京');
  const [latitude, setLatitude] = useState(39.9042);
  const [longitude, setLongitude] = useState(116.4074);

  const handleSubmit = async () => {
    if (!nickname.trim()) return;
    let finalLat = latitude;
    let finalLng = longitude;
    if ((!finalLat && !finalLng) || !Number.isFinite(finalLat) || !Number.isFinite(finalLng)) {
      const [matched] = await searchCities(cityName, 1);
      if (matched) {
        finalLat = matched.latitude;
        finalLng = matched.longitude;
        setLatitude(finalLat);
        setLongitude(finalLng);
      }
    }
    const birthInfo: BirthInfo = {
      birthDate,
      birthTime,
      birthLocation: cityName,
      latitude: finalLat,
      longitude: finalLng,
    };

    const { sunSign, moonSign, ascSign } = calculateSigns(birthInfo);

    const newProfile = {
      id: Date.now().toString(),
      nickname,
      gender,
      birthInfo,
      isMain: true,
      sunSign,
      moonSign,
      ascendantSign: ascSign,
      avatar: '👤'
    };

    storageService.addProfile(newProfile);
    window.location.reload(); // 刷新以应用新状态
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 blur-[150px] rounded-full"></div>
      
      <div className="w-full max-w-5xl bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] flex flex-col md:flex-row overflow-hidden relative z-10 animate-fade-in">
        
        {/* Left Side: Branding (Visible on PC) */}
        <div className="hidden md:flex flex-col justify-between w-[40%] bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-16 border-r border-slate-800/50">
          <div className="space-y-6">
            <div className="w-16 h-16 bg-amber-500 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.3)] animate-float">
              <i className="fas fa-star text-slate-950 text-3xl"></i>
            </div>
            <h1 className="text-5xl font-serif font-bold text-amber-100 leading-tight">
              探索你的<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">星命轨迹</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed font-light">
              宇宙的律动在这一刻静止，让我们一同解读你出生瞬间的星空密码。
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex gap-2">
               {[1, 2].map(i => (
                 <div key={i} className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-12 bg-amber-500' : 'w-3 bg-slate-700'}`}></div>
               ))}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">Lucky Star Precision Astrology</p>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div className="flex-1 p-8 md:p-20 flex flex-col justify-center bg-slate-900/20">
          <div className="md:hidden flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg">
              <i className="fas fa-star text-slate-950"></i>
            </div>
            <h1 className="text-2xl font-bold font-serif text-amber-100">幸运星</h1>
          </div>

          <div className="max-w-md mx-auto w-full space-y-10">
            <header>
               <h2 className="text-3xl font-bold text-slate-50 font-serif">
                 {step === 1 ? '你是哪颗星？' : '星辰诞生的瞬间'}
               </h2>
               <p className="text-slate-500 mt-3">
                 {step === 1 ? '首先，请告诉我们该如何称呼你。' : '精准的出生数据是深度解读的基石。'}
               </p>
            </header>

            {step === 1 && (
              <div className="space-y-8 animate-slide-right">
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">你的昵称</label>
                  <input 
                    className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl p-5 focus:border-amber-500/50 outline-none text-white text-xl transition-all shadow-inner placeholder:text-slate-700"
                    placeholder="输入昵称..."
                    autoFocus
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                  />
                </div>
                
                <div className="space-y-4">
                  <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">你的性别</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: '男', value: Gender.MALE, icon: 'fa-mars' },
                      { label: '女', value: Gender.FEMALE, icon: 'fa-venus' },
                      { label: '保密', value: Gender.OTHER, icon: 'fa-genderless' },
                    ].map(g => (
                      <button 
                        key={g.value}
                        onClick={() => setGender(g.value)}
                        className={`py-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 group ${
                          gender === g.value 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                          : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <i className={`fas ${g.icon} text-xl group-hover:scale-110 transition-transform`}></i>
                        <span className="text-xs font-bold uppercase tracking-widest">{g.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  disabled={!nickname.trim()}
                  onClick={() => setStep(2)}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-20 text-slate-950 font-bold py-6 rounded-2xl shadow-[0_12px_24px_rgba(245,158,11,0.2)] mt-6 hover:translate-y-[-2px] active:translate-y-[1px] transition-all flex items-center justify-center gap-3 text-lg"
                >
                  继续开启星盘 <i className="fas fa-arrow-right text-sm"></i>
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-slide-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-3">
                      <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">出生日期</label>
                      <input 
                        type="date"
                        className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl p-5 focus:border-amber-500/50 outline-none text-white transition-all shadow-inner"
                        value={birthDate}
                        onChange={e => setBirthDate(e.target.value)}
                      />
                   </div>
                   <div className="space-y-3">
                      <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">出生时间</label>
                      <input 
                        type="time"
                        className="w-full bg-slate-950/50 border-2 border-slate-800 rounded-2xl p-5 focus:border-amber-500/50 outline-none text-white transition-all shadow-inner"
                        value={birthTime}
                        onChange={e => setBirthTime(e.target.value)}
                      />
                   </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">出生地点</label>
                  <CityAutocomplete
                    value={cityName}
                    onSelect={city => {
                      setCityName(city.name);
                      setLatitude(city.latitude);
                      setLongitude(city.longitude);
                    }}
                    onInputChange={(val) => {
                      setCityName(val);
                      setLatitude(0);
                      setLongitude(0);
                    }}
                    placeholder="输入城市名称（优先中文，自动支持拼音）"
                    inputClassName="bg-slate-950/50 border-2 border-slate-800 rounded-2xl p-5 focus:border-amber-500/50 text-white shadow-inner"
                  />
                  <p className="text-[11px] text-slate-600">
                    未命中中文时会自动用拼音匹配，选中后自动填入经纬度。
                  </p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 pt-4">
                  <button 
                    onClick={() => setStep(1)} 
                    className="flex-1 bg-slate-800/50 hover:bg-slate-700 py-5 rounded-2xl text-slate-300 font-bold transition-all flex items-center justify-center gap-2 border border-slate-700/50"
                  >
                    <i className="fas fa-arrow-left text-xs"></i> 返回修改
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    className="flex-[2] bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold py-5 rounded-2xl shadow-xl shadow-amber-900/20 hover:translate-y-[-2px] active:translate-y-[1px] transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    <i className="fas fa-star"></i> 生成我的档案
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-slide-right { animation: slideRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-slide-left { animation: slideLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideLeft {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Onboarding;
