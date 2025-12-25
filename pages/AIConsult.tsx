
import React, { useState, useRef, useEffect } from 'react';
import { storageService } from '../services/storage';
import { askGeminiStream } from '../services/gemini';
import { ChatMessage, UserProfile } from '../types';

const SUGGESTIONS = [
  "我最近的感情运势如何？",
  "我适合什么样的职业发展方向？",
  "本月财运如何，有投资机会吗？",
  "如何提升我的个人魅力？",
  "我需要注意哪些健康问题？"
];

const AIConsult: React.FC = () => {
  const data = storageService.loadData();
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(data.currentUser);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProfile) {
      const conv = storageService.getConversation(selectedProfile.id);
      if (conv && conv.messages.length > 0) {
        setMessages(conv.messages);
      } else {
        const welcome: ChatMessage = {
          id: 'welcome',
          role: 'model',
          content: `你好，**${selectedProfile.nickname}**。我是你的专属占星师。针对你的 **${selectedProfile.sunSign}** 能量，我已准备好为你解读。今日星象对你而言意味着一段新的觉醒，你想了解具体的运势还是深度的星盘解惑？`,
          timestamp: Date.now()
        };
        setMessages([welcome]);
      }
    }
  }, [selectedProfile?.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || !selectedProfile || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now()
    };

    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now()
    };

    const currentHistory = messages;
    setMessages([...messages, userMsg, aiPlaceholder]);
    setInput('');
    setLoading(true);

    let fullContent = "";
    try {
      await askGeminiStream(text, selectedProfile, currentHistory, (chunk) => {
        fullContent += chunk;
        setMessages(prev => prev.map(m => 
          m.id === aiMsgId ? { ...m, content: fullContent } : m
        ));
      });
      
      const finalMessages = [...currentHistory, userMsg, { ...aiPlaceholder, content: fullContent }];
      storageService.saveConversation(selectedProfile.id, finalMessages);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const MarkdownView: React.FC<{ content: string }> = ({ content }) => {
    const processed = content
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400 px-1 font-bold">$1</strong>')
      .replace(/\n\n/g, '<div class="h-4"></div>')
      .replace(/\n/g, '<br/>')
      .replace(/### (.*?)(<br\/>|$)/g, '<h3 class="text-amber-100 font-bold mt-8 mb-3 text-xl border-l-4 border-amber-500 pl-4">$1</h3>')
      .replace(/- (.*?)(<br\/>|$)/g, '<div class="flex gap-2 items-start ml-2 mb-2"><span class="text-amber-500">•</span><span class="text-slate-300">$1</span></div>');

    return <div className="text-lg leading-relaxed font-light" dangerouslySetInnerHTML={{ __html: processed }} />;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-80px)] bg-slate-900/20 border border-slate-800/50 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.5)] animate-fade-in relative">
      
      {/* Top Profile Switcher */}
      <div className="p-5 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex gap-4 items-center overflow-x-auto no-scrollbar z-20">
        <div className="flex items-center gap-3 px-4 border-r border-slate-800 hidden md:flex">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <i className="fas fa-users text-amber-500 text-xs"></i>
            </div>
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">咨询档案:</span>
        </div>
        {data.profiles.map(p => (
          <button
            key={p.id}
            onClick={() => !loading && setSelectedProfile(p)}
            className={`flex-shrink-0 px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${
              selectedProfile?.id === p.id 
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-900/20 scale-105' 
              : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {p.nickname}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 md:p-12 space-y-12 scroll-smooth bg-slate-950/20"
      >
        <div className="max-w-4xl mx-auto space-y-12">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.role === 'model' && (
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center mr-4 mt-2 flex-shrink-0 shadow-lg shadow-indigo-900/20">
                      <i className="fas fa-magic text-white text-sm"></i>
                  </div>
              )}
              <div className={`max-w-[85%] md:max-w-[80%] rounded-[2rem] p-8 shadow-2xl relative ${
                msg.role === 'user' 
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 rounded-tr-none font-medium' 
                : 'bg-slate-800/40 border border-slate-700/50 text-slate-200 rounded-tl-none backdrop-blur-md'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-lg leading-relaxed">{msg.content}</p>
                ) : (
                  msg.content ? (
                    <MarkdownView content={msg.content} />
                  ) : (
                    <div className="flex gap-2 py-4">
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  )
                )}
                <div className={`absolute top-4 ${msg.role === 'user' ? '-right-2' : '-left-2'} opacity-10 text-4xl`}>
                    <i className={`fas ${msg.role === 'user' ? 'fa-quote-right' : 'fa-quote-left'}`}></i>
                </div>
              </div>
            </div>
          ))}
          
          {/* Follow-up Suggestions after AI response */}
          {!loading && messages.length > 0 && messages[messages.length-1].role === 'model' && (
             <div className="flex flex-wrap gap-3 justify-start pl-14 animate-fade-in delay-500">
                <p className="w-full text-[10px] text-slate-600 uppercase tracking-widest mb-1 ml-1">或许你还想问：</p>
                {SUGGESTIONS.slice(0, 3).map(s => (
                    <button 
                        key={s} 
                        onClick={() => handleSend(s)}
                        className="bg-slate-800/30 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/50 px-5 py-2 rounded-full text-xs text-slate-400 hover:text-amber-200 transition-all active:scale-95"
                    >
                        {s}
                    </button>
                ))}
             </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-8 md:p-12 bg-slate-900/90 border-t border-slate-800 backdrop-blur-2xl z-20">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex gap-4 bg-slate-950 border-2 border-slate-800 rounded-[2.5rem] p-3 focus-within:border-amber-500/50 transition-all shadow-2xl group">
            <input 
              className="flex-1 bg-transparent px-8 py-5 outline-none text-white text-lg placeholder:text-slate-700"
              placeholder={`在这里写下你想咨询的内容... (${selectedProfile?.nickname})`}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend(input)}
            />
            <button 
              disabled={!input.trim() || loading}
              onClick={() => handleSend(input)}
              className={`w-16 h-16 rounded-[1.8rem] flex items-center justify-center transition-all shadow-2xl ${
                input.trim() && !loading 
                ? 'bg-amber-500 text-slate-950 scale-100 hover:scale-105 active:scale-95' 
                : 'bg-slate-800 text-slate-600'
              }`}
            >
              <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'} text-2xl`}></i>
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
              <span className="w-12 h-px bg-slate-800"></span>
              <i className="fas fa-shield-alt text-slate-700"></i>
              <span>幸运星 AI 已根据星历数据就绪</span>
              <span className="w-12 h-px bg-slate-800"></span>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AIConsult;
