
import React, { useState, useRef, useEffect } from 'react';
import { storageService } from '../services/storage';
import { askGeminiStream } from '../services/gemini';
import { ChatMessage, UserProfile } from '../types';

const BASE_SUGGESTIONS = [
  '我最近的感情走向如何？需要注意哪些相处雷区？',
  '工作/事业上有什么机会或转型窗口？',
  '本月财运怎样？投资理财要规避什么风险？',
  '如何提升个人魅力和人际关系？',
  '健康方面近期需要特别注意什么？',
  '适合我的学习/考证节奏和领域有哪些？',
  '如何利用本命盘优势规划下半年？',
  '与伴侣的相处加分项和避雷点是什么？',
  '有没有适合的旅行/迁移时机？',
  '近期整体运势的重点和盲点各是什么？'
];

const TOPIC_SUGGESTIONS: { keywords: string[]; questions: string[] }[] = [
  {
    keywords: ['感情', '恋爱', '婚', '桃花', '关系', '伴侣', '暧昧'],
    questions: [
      '我们的关系下一阶段的关键点是什么？',
      '沟通上需要调整的地方有哪些？',
      '什么时候是推进关系/求婚/表白的窗口期？',
      '我应该如何化解近期的情感矛盾？'
    ]
  },
  {
    keywords: ['事业', '工作', '职', '晋升', 'offer', '面试', '跳槽'],
    questions: [
      '我适合在现阶段做岗位/行业转型吗？',
      '近期的职场贵人和机会点在哪里？',
      '面对工作压力有什么行之有效的调整方案？',
      '怎样规划下一个里程碑（升职/加薪）？'
    ]
  },
  {
    keywords: ['财', '投资', '理财', '收入', '钱', '副业'],
    questions: [
      '现在适合进取型投资还是稳健型？',
      '本月的破财风险点在哪，需要避开什么？',
      '如何分配主业与副业的精力比例？',
      '我适合什么样的理财节奏？'
    ]
  },
  {
    keywords: ['健康', '睡眠', '饮食', '运动', '作息', '身体'],
    questions: [
      '近期健康需要重点关注的部位或习惯是什么？',
      '怎样调整作息和饮食更有利于恢复能量？',
      '本周适合的运动/放松方式有哪些？',
      '哪些压力源最需要先释放？'
    ]
  },
  {
    keywords: ['家', '家庭', '父母', '孩子', '婚姻'],
    questions: [
      '家庭沟通如何更顺畅、减少摩擦？',
      '亲密关系里如何保持边界感？',
      '近期家庭决策（买房/搬家）有什么参考建议？',
      '如何兼顾自我成长与家庭责任？'
    ]
  },
  {
    keywords: ['学', '考试', '考证', '学习', '研究', '出国'],
    questions: [
      '现在适合加速学习还是巩固基础？',
      '近期备考/学习的最佳节奏是什么？',
      '是否适合申请出国/进修的时机？',
      '如何找到能量匹配的学习方法？'
    ]
  },
  {
    keywords: ['旅行', '搬家', '迁移', '留学', '签证'],
    questions: [
      '近期是否有适合出行或搬迁的时间窗？',
      '去哪些方向更有启发与安全感？',
      '如何降低旅行/迁移决策的风险？',
      '需要提前做好哪些准备？'
    ]
  },
  {
    keywords: [],
    questions: [
      '我本命盘的优势如何更好被利用？',
      '本周需要注意的运势盲区是什么？',
      '有哪些适合当下的小目标可以先落地？',
      '如何保持情绪稳态，避免过度内耗？'
    ]
  }
];

const pickSuggestions = (context: string, rotateSeed?: number) => {
  const text = (context || '').toLowerCase();
  const ordered: string[] = [];

  const matchedTopics = TOPIC_SUGGESTIONS.filter(topic =>
    topic.keywords.some(k => text.includes(k.toLowerCase()))
  );

  if (matchedTopics.length > 0) {
    // 1) 首选最相关主题的高优问题
    ordered.push(...matchedTopics[0].questions.slice(0, 3));
    // 2) 其他可能相关的主题各取 1-2 个补充问题
    matchedTopics.slice(1).forEach(t => ordered.push(...t.questions.slice(0, 2)));
  }

  // 3) 兜底基础问题池
  ordered.push(...BASE_SUGGESTIONS);

  const unique = Array.from(new Set(ordered));
  if (unique.length === 0) return [];

  const offset = rotateSeed === undefined ? Math.floor(Math.random() * unique.length) : rotateSeed % unique.length;
  const rotated = unique.slice(offset).concat(unique.slice(0, offset));
  return rotated.slice(0, 5);
};

const AIConsult: React.FC = () => {
  const data = storageService.loadData();
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(data.currentUser);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(() => pickSuggestions('', Date.now()));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedProfile) {
      const conv = storageService.getConversation(selectedProfile.id);
      if (conv && conv.messages.length > 0) {
        setMessages(conv.messages);
        const last = conv.messages[conv.messages.length - 1];
        const lastUser = [...conv.messages].reverse().find(m => m.role === 'user');
        setSuggestions(pickSuggestions(lastUser?.content || last?.content || selectedProfile.sunSign || '', Date.now()));
      } else {
        const welcome: ChatMessage = {
          id: 'welcome',
          role: 'model',
          content: `你好，**${selectedProfile.nickname}**。我是你的专属占星师。针对你的 **${selectedProfile.sunSign}** 能量，我已准备好为你解读。今日星象对你而言意味着一段新的觉醒，你想了解具体的运势还是深度的星盘解惑？`,
          timestamp: Date.now()
        };
        setMessages([welcome]);
        setSuggestions(pickSuggestions(selectedProfile.sunSign || '', Date.now()));
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
    setSuggestions(pickSuggestions(text, Date.now()));
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
      setSuggestions(pickSuggestions(`${text} ${fullContent}`, Date.now()));
    } catch(e) {
      console.error(e);
      setSuggestions(pickSuggestions(text, Date.now()));
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
      .replace(/- (.*?)(<br\/>|$)/g, '<div class="flex gap-2 items-start ml-2 mb-2"><span class="text-amber-500">&bull;</span><span class="text-slate-300">$1</span></div>');

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
                <div className="w-full flex items-center gap-2 mb-1 ml-1">
                  <p className="text-[10px] text-slate-600 uppercase tracking-widest">或许你还想问：</p>
                  <button
                    onClick={() => setSuggestions(pickSuggestions(messages[messages.length-1]?.content || selectedProfile?.sunSign || '', Date.now()))}
                    className="text-[10px] text-amber-300 hover:text-amber-100 transition-colors underline-offset-4"
                  >
                    换一批
                  </button>
                </div>
                {suggestions.map(s => (
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
