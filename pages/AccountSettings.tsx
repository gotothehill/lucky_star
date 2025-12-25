
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';

const AVATARS = ['🌟', '🌙', '☀️', '🪐', '☄️', '🌌', '🔭', '🧙', '🔮', '✨', '🦊', '🦁'];

const AccountSettings: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(storageService.loadData());
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🌟');

  useEffect(() => {
    if (data.currentUser) {
      setNickname(data.currentUser.nickname);
      setSelectedAvatar(data.currentUser.avatar || '🌟');
    }
  }, []);

  const handleSave = () => {
    if (!nickname.trim()) return;
    if (data.currentUser) {
      storageService.updateProfile(data.currentUser.id, { 
        nickname: nickname.trim(), 
        avatar: selectedAvatar 
      });
      navigate('/profile');
    }
  };

  return (
    <div className="p-4 space-y-6 bg-slate-950 min-h-screen">
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-900 border border-slate-800">
           <i className="fas fa-arrow-left"></i>
        </button>
        <h1 className="font-serif text-xl font-bold">账户设置</h1>
      </header>

      <section className="space-y-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <div>
          <label className="block text-xs text-slate-500 mb-2 uppercase tracking-wider">修改昵称</label>
          <input 
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 outline-none focus:border-amber-500 transition-all text-white"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            placeholder="输入新昵称"
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-4 uppercase tracking-wider">选择头像</label>
          <div className="grid grid-cols-4 gap-4">
            {AVATARS.map(ava => (
              <button 
                key={ava}
                onClick={() => setSelectedAvatar(ava)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all ${
                  selectedAvatar === ava 
                  ? 'bg-amber-500/20 border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                  : 'bg-slate-950 border border-slate-800'
                }`}
              >
                {ava}
              </button>
            ))}
          </div>
        </div>
      </section>

      <button 
        onClick={handleSave}
        className="w-full bg-amber-500 text-slate-900 font-bold p-4 rounded-2xl shadow-xl shadow-amber-900/10 active:scale-95 transition-all"
      >
        保存修改
      </button>
    </div>
  );
};

export default AccountSettings;
