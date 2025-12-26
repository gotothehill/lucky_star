import { pinyin } from 'pinyin-pro';

export interface CityRecord {
  name: string;
  country: string;
  subcountry?: string;
  geonameid?: number;
  latitude: number;
  longitude: number;
  alternatenames?: string;
}

type ProcessedCity = {
  city: CityRecord;
  tokens: string[];
  pinyinTokens: string[];
};

const normalize = (val?: string) => (val || '').trim();
const toPinyin = (val: string) =>
  pinyin(val, { toneType: 'none', type: 'string' }).replace(/\s+/g, '').toLowerCase();

let processedCache: Promise<ProcessedCity[]> | null = null;

const loadCities = async (): Promise<ProcessedCity[]> => {
  if (!processedCache) {
    processedCache = import('../data/world-cities.json').then(mod => {
      const list = (mod.default || mod) as CityRecord[];
      return list.map(city => {
        const rawTokens = [
          city.name,
          city.country,
          city.subcountry,
          ...(city.alternatenames ? city.alternatenames.split(',') : []),
        ]
          .map(normalize)
          .filter(Boolean);

        const tokens = rawTokens.map(t => t.toLowerCase());
        const pinyinTokens = rawTokens.map(toPinyin);

        return { city, tokens, pinyinTokens };
      });
    });
  }
  return processedCache;
};

const scoreMatch = (token: string, q: string) => {
  if (!token || !q) return 0;
  if (token === q) return 200; // perfect same token
  if (token.startsWith(q)) return 140 - Math.min(token.length, 50) * 0.5; // prefix with shorter higher
  const idx = token.indexOf(q);
  if (idx >= 0) return 100 - idx * 1.5 - Math.min(token.length, 50) * 0.2; // substring
  return 0;
};

export const searchCities = async (query: string, limit = 8): Promise<CityRecord[]> => {
  const q = query.trim();
  if (!q) return [];

  const hasChinese = /[\u4e00-\u9fa5]/.test(q);
  const qLower = q.toLowerCase();
  const qPinyin = toPinyin(q);
  const cities = await loadCities();

  const scored = cities
    .map(item => {
      const nameLower = item.city.name.toLowerCase();
      const isChina = (item.city.country || '').toLowerCase().includes('china');

      const tokenScores = item.tokens.map(t => scoreMatch(t, qLower));
      const pinyinScores = item.pinyinTokens.map(t => scoreMatch(t, qPinyin));

      const bestToken = Math.max(0, ...tokenScores);
      const bestPinyin = Math.max(0, ...pinyinScores);

      // If中文，优先中文匹配；否则综合
      let best = hasChinese ? Math.max(bestToken * 1.2, bestPinyin) : Math.max(bestToken, bestPinyin);

      // 强制提升：名字完全相等
      if (nameLower === qLower) best += 200;
      // 同城前缀提升
      if (item.city.name.toLowerCase().startsWith(qLower)) best += 80;
      if (item.city.name.toLowerCase().includes(qLower)) best += 40;
      // 国家为中国时稍微提升
      if (isChina) best += 10;
      // 名称越短越靠前
      best += Math.max(0, 30 - Math.min(item.city.name.length, 30));

      return { city: item.city, score: best };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score || a.city.name.length - b.city.name.length);

  return scored.slice(0, limit).map(r => r.city);
};
