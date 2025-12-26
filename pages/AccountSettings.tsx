import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';
import { calculateSigns } from '../services/astrology';
import { BirthInfo } from '../types';
import CityAutocomplete from '../components/CityAutocomplete';
import { searchCities } from '../services/citySearch';

const AVATARS = ['⭐', '🌙', '☀️', '🌌', '☁️', '🌍', '🔮', '🤖', '🔐', '✅', '🦊', '🦁'];

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(storageService.loadData());

  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [birthTime, setBirthTime] = useState('12:00');
  const [locationName, setLocationName] = useState('北京');
  const [latitude, setLatitude] = useState(39.9042);
  const [longitude, setLongitude] = useState(116.4074);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (data.currentUser) {
      const user = data.currentUser;
      setNickname(user.nickname);
      setSelectedAvatar(user.avatar || AVATARS[0]);
      setBirthDate(user.birthInfo.birthDate);
      setBirthTime(user.birthInfo.birthTime);
      setLocationName(user.birthInfo.birthLocation);
      setLatitude(user.birthInfo.latitude ?? 39.9042);
      setLongitude(user.birthInfo.longitude ?? 116.4074);
    }
  }, [data.currentUser?.id]);

  const handleSave = async () => {
    if (!data.currentUser || !nickname.trim()) return;
    setSaving(true);
    let finalLat = latitude;
    let finalLng = longitude;
    if ((!finalLat && !finalLng) || !Number.isFinite(finalLat) || !Number.isFinite(finalLng)) {
      const [matched] = await searchCities(locationName, 1);
      if (matched) {
        finalLat = matched.latitude;
        finalLng = matched.longitude;
        setLatitude(finalLat);
        setLongitude(finalLng);
      }
    }

    const birthInfo: BirthInfo = {
      birthDate: birthDate,
      birthTime: birthTime,
      birthLocation: locationName,
      latitude: finalLat,
      longitude: finalLng,
    };

    const { sunSign, moonSign, ascSign } = calculateSigns(birthInfo);

    const newState = storageService.updateProfile(data.currentUser.id, {
      nickname: nickname.trim(),
      avatar: selectedAvatar,
      birthInfo,
      sunSign,
      moonSign,
      ascendantSign: ascSign,
    });

    setData(newState);
    setSaving(false);
    setStatus('已保存');
    setTimeout(() => setStatus(''), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/60 hover:text-amber-300 transition-all"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Account</p>
              <h1 className="text-3xl font-bold font-serif text-amber-100">账户基本设置</h1>
              <p className="text-slate-500 text-sm mt-1">在这里更新昵称、头像以及出生日期与地点。</p>
            </div>
          </div>
          {status && <span className="text-emerald-400 text-sm">{status}</span>}
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile summary */}
          <section className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl">
                {selectedAvatar}
              </div>
              <div>
                <p className="text-lg font-semibold">{nickname || '未命名'}</p>
                <p className="text-xs text-slate-500 mt-1">{data.currentUser?.sunSign || '未计算'} · 当前档案</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-400">
              <p><i className="fas fa-calendar-alt text-amber-400 mr-2"></i>{birthDate} {birthTime}</p>
              <p><i className="fas fa-map-marker-alt text-amber-400 mr-2"></i>{locationName}</p>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              修改出生信息会重新计算你的太阳/月亮/上升星座，用于首页、星盘、AI 解读等功能。
            </p>
          </section>

          {/* Form */}
          <section className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-10 shadow-2xl space-y-10">
            <div>
              <h2 className="text-xl font-bold text-amber-100">基础信息</h2>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">昵称</label>
                  <input
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:border-amber-500 text-white transition-all"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    placeholder="请输入昵称"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">头像</label>
                  <div className="grid grid-cols-6 gap-2">
                    {AVATARS.map(ava => (
                      <button
                        key={ava}
                        onClick={() => setSelectedAvatar(ava)}
                        className={`h-12 rounded-xl border flex items-center justify-center text-2xl transition-all ${
                          selectedAvatar === ava
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-[0_0_18px_rgba(245,158,11,0.25)]'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {ava}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-amber-100">出生信息</h2>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.3em]">用于重新计算星盘</span>
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">出生日期</label>
                  <input
                    type="date"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:border-amber-500 text-white transition-all"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">出生时间</label>
                  <input
                    type="time"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:border-amber-500 text-white transition-all"
                    value={birthTime}
                    onChange={e => setBirthTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">出生地点</label>
                  <CityAutocomplete
                    value={locationName}
                    onInputChange={(val) => {
                      setLocationName(val);
                      setLatitude(0);
                      setLongitude(0);
                    }}
                    onSelect={city => {
                      setLocationName(city.name);
                      setLatitude(city.latitude);
                      setLongitude(city.longitude);
                    }}
                    placeholder="输入城市名称（支持中文优先、拼音自动匹配）"
                    inputClassName="bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:border-amber-500 text-white transition-all"
                  />
                  <p className="text-[11px] text-slate-600">优先匹配中文，未命中会自动用拼音搜索，选中后经纬度自动带入。</p>
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500 font-bold">坐标(选填)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="0.0001"
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-amber-500 text-white transition-all"
                      value={latitude}
                      onChange={e => setLatitude(parseFloat(e.target.value) || 0)}
                      placeholder="纬度"
                    />
                    <input
                      type="number"
                      step="0.0001"
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3 outline-none focus:border-amber-500 text-white transition-all"
                      value={longitude}
                      onChange={e => setLongitude(parseFloat(e.target.value) || 0)}
                      placeholder="经度"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">如选择下拉城市，会自动填入坐标；自定义地点可手动录入经纬度。</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={saving || !nickname.trim()}
                className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold rounded-2xl shadow-[0_16px_30px_rgba(245,158,11,0.25)] hover:translate-y-[-1px] active:translate-y-[1px] transition-all disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
