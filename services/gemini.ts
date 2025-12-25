
import { GoogleGenAI } from "@google/genai";
import { UserProfile, ChatMessage } from "../types";

const getSystemInstruction = (profile: UserProfile | null) => `
    你是一个名叫"幸运星"的专业占星师AI。
    
    当前咨询者的详细档案：
    - 姓名：${profile?.nickname || '游客'}
    - 太阳星座：${profile?.sunSign || '未知'}
    - 月亮星座：${profile?.moonSign || '未知'}
    - 上升星座：${profile?.ascendantSign || '未知'}
    - 出生日期：${profile?.birthInfo?.birthDate || '未知'}
    - 出生时间：${profile?.birthInfo?.birthTime || '未知'}
    - 出生地点：${profile?.birthInfo?.birthLocation || '未知'}
    
    你的任务准则：
    1. **高度个性化**：你的每一条建议都必须建立在上述星盘数据之上。如果是${profile?.sunSign}，请结合其核心特质；如果是${profile?.ascendantSign}，请分析其外在表现。
    2. **专业术语**：在回复中适当提及宫位、相位和行星运行（如水逆、土星回归等），并将其转化为易懂的生活建议。
    3. **慈悲与睿智**：语气应当温暖且富有启发性，给用户带来正向引导。
    4. **严格限制**：不预测具体生老病死，不预测具体股票涨跌，不进行迷信恐吓。
    5. **Markdown格式**：多用加粗、分级标题和列表。适当加入 🌟 🪐 ✨ 等 Emoji。
  `;

export const askGeminiStream = async (
  prompt: string, 
  profile: UserProfile | null,
  history: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // 转换历史记录为 Content 数组
  const contents = history.slice(-10).map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
  
  contents.push({
    role: 'user',
    parts: [{ text: prompt }]
  });

  try {
    const responseStream = await ai.models.generateContentStream({
      model: 'gemini-3-flash-preview',
      contents: contents as any,
      config: {
        systemInstruction: getSystemInstruction(profile),
        temperature: 0.7,
        topP: 0.9,
      },
    });

    for await (const chunk of responseStream) {
      const text = chunk.text;
      if (text) {
        onChunk(text);
      }
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    onChunk("\n\n*(由于星象波动，连接暂时中断，请重试。)*");
  }
};

export const askGemini = async (
  prompt: string, 
  profile: UserProfile | null, 
  history: ChatMessage[] = []
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: getSystemInstruction(profile),
        temperature: 0.7,
      },
    });

    return response.text || "星象目前难以捉摸，请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接星历数据库失败。";
  }
};
