import { UserProfile, ChatMessage } from "../types";

const API_URL = "https://api2.aigcbest.top/v1/chat/completions";
const MODEL = "gemini-3-flash-preview";
const API_KEY = import.meta.env.VITE_API_KEY as string | undefined;

const getSystemInstruction = (profile: UserProfile | null) => `
你是一位以温暖、走心著称的专业占星师 AI。

当前咨询者档案：
- 昵称：${profile?.nickname || "游客"}
- 太阳星座：${profile?.sunSign || "未知"}
- 月亮星座：${profile?.moonSign || "未知"}
- 上升星座：${profile?.ascendantSign || "未知"}
- 出生日期：${profile?.birthInfo?.birthDate || "未知"}
- 出生时间：${profile?.birthInfo?.birthTime || "未知"}
- 出生地点：${profile?.birthInfo?.birthLocation || "未知"}

你的任务准则：
1. **高度个性化**：所有建议需建立在上述星盘数据之上；结合 ${profile?.sunSign || "其太阳星座"} 的核心特质与 ${profile?.ascendantSign || "上升"} 的外在表现。
2. **专业术语**：适度提及宫位、相位与行运（如水逆、土星回归），并翻译成易懂的生活建议。
3. **慈悲与智慧**：语气温暖且有启发性，给用户正向引导。
4. **严守边界**：不预测具体生老病死，不预测具体股价涨跌，不做迷信恐吓。
5. **Markdown 排版**：善用加粗、标题与列表，适当加入 🌟 🪐 ✅ 等 Emoji。
`;

const buildMessages = (profile: UserProfile | null, history: ChatMessage[], prompt: string) => {
  const base = [{ role: "system", content: getSystemInstruction(profile) }];

  const mappedHistory = history.slice(-10).map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content
  }));

  return [...base, ...mappedHistory, { role: "user", content: prompt }];
};

const getAuthHeaders = () => {
  if (!API_KEY) {
    throw new Error("Missing API key");
  }
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  };
};

export const askGeminiStream = async (
  prompt: string,
  profile: UserProfile | null,
  history: ChatMessage[],
  onChunk: (chunk: string) => void
): Promise<void> => {
  const messages = buildMessages(profile, history, prompt);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        model: MODEL,
        messages,
        stream: true,
        temperature: 0.7,
        top_p: 0.9
      })
    });

    if (!response.ok || !response.body) {
      console.error("Gemini Streaming Error:", response.status, await response.text());
      onChunk("\n\n*(因星象波动，连接暂时中断，请重试。)*");
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;
        const dataStr = line.replace(/^data:\s*/, "");
        if (dataStr === "[DONE]") return;

        try {
          const payload = JSON.parse(dataStr);
          const delta =
            payload?.choices?.[0]?.delta?.content ??
            payload?.choices?.[0]?.message?.content;
          if (!delta) continue;

          let textChunk = "";
          if (typeof delta === "string") {
            textChunk = delta;
          } else if (Array.isArray(delta)) {
            textChunk = delta
              .map((part: any) => (typeof part === "string" ? part : part?.text ?? ""))
              .join("");
          }

          if (textChunk) {
            onChunk(textChunk);
          }
        } catch (err) {
          console.error("Stream parse error:", err);
        }
      }
    }
  } catch (error) {
    console.error("Gemini Streaming Error:", error);
    onChunk("\n\n*(因星象波动，连接暂时中断，请重试。)*");
  }
};

export const askGemini = async (
  prompt: string,
  profile: UserProfile | null,
  history: ChatMessage[] = []
): Promise<string> => {
  const messages = buildMessages(profile, history, prompt);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error("Gemini API Error:", response.status, await response.text());
      return "连接星历数据库失败。";
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (Array.isArray(content)) {
      return content
        .map((part: any) => (typeof part === "string" ? part : part?.text ?? ""))
        .join("");
    }

    return content || "星象目前难以揣摩，请稍后再试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "连接星历数据库失败。";
  }
};
