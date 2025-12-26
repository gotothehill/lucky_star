
import { BirthInfo, FortuneData } from '../types';
import { ZODIAC_SIGNS } from '../constants';

// A simple deterministic mock for birth sign calculations
export const calculateSigns = (birthInfo: BirthInfo) => {
  const date = new Date(birthInfo.birthDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = parseInt(birthInfo.birthTime.split(':')[0]);

  const sunSignIndex = (month - 1 + (day > 20 ? 0 : -1) + 12) % 12;
  const sunSign = ZODIAC_SIGNS[sunSignIndex].name;
  
  const moonSign = ZODIAC_SIGNS[(sunSignIndex + 4) % 12].name;
  const ascSign = ZODIAC_SIGNS[(sunSignIndex + (hour % 12)) % 12].name;

  return { sunSign, moonSign, ascSign };
};

export const getDailyFortune = (sunSign: string): FortuneData => {
  const today = new Date().toDateString();
  const seed = sunSign + today;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const score = (h: number, range: number) => Math.abs(h % range) + 60;

  return {
    summary: score(hash, 30),
    love: score(hash * 2, 40),
    career: score(hash * 3, 40),
    wealth: score(hash * 4, 40),
    health: score(hash * 5, 40),
    academic: score(hash * 6, 40),
    luckyColor: ['紫色', '金黄色', '星空蓝', '翡翠绿'][Math.abs(hash % 4)],
    luckyNumber: (Math.abs(hash % 9) + 1).toString(),
    luckyDirection: ['正东', '西北', '东南', '正南'][Math.abs(hash % 4)],
    advice: "今日能量充沛，适合开启新的计划。在处理文书工作时需格外仔细，避免疏漏。",
    description: `✨ 今天${sunSign}的朋友们整体运势稳步上升，宇宙正赋予你前所未有的专注力。\n\n🤝 在人际交往中，你的魅力指数极高，容易得到贵人相助，适合进行深度的情感沟通或商务洽谈。\n\n💼 事业上可能会迎来一个小小的挑战，但这正是你展现专业能力的契机。保持冷静，你一定能找到完美的解决方案。`
  };
};

export interface TransitEvent {
  title: string;
  intensity: 'high' | 'medium' | 'low';
  description: string;
}

export const getTransitData = (sunSign: string, type: 'week' | 'month' | 'year') => {
  const events: TransitEvent[] = [
    { title: '金星进入财帛宫', intensity: 'high', description: '这对你的收入是个利好，可能会有意外的财务惊喜。' },
    { title: '水星逆行前期', intensity: 'medium', description: '注意沟通细节，合同签署需谨慎检查。' },
    { title: '水星顺行开启', intensity: 'high', description: '思维清晰度大幅提升，是推进创意项目的最佳时机。' }
  ];

  // Mock trend data (points)
  const count = type === 'week' ? 7 : type === 'month' ? 10 : 12;
  const trend = Array.from({ length: count }, (_, i) => ({
    label: type === 'week' ? `D${i+1}` : type === 'month' ? `${i*3+1}日` : `${i+1}月`,
    value: 60 + Math.random() * 35
  }));

  return { events, trend };
};
