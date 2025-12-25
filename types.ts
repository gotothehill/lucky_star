
export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export interface BirthInfo {
  birthDate: string; // ISO Date
  birthTime: string; // HH:mm
  birthLocation: string;
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  id: string;
  nickname: string;
  gender?: Gender;
  birthInfo: BirthInfo;
  isMain: boolean;
  sunSign: string;
  moonSign: string;
  ascendantSign: string;
  avatar?: string; // 存储头像图标或Emoji
}

export interface FortuneData {
  summary: number; // 1-100
  love: number;
  career: number;
  wealth: number;
  health: number;
  academic: number;
  luckyColor: string;
  luckyNumber: string;
  luckyDirection: string;
  advice: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  profileId: string;
  title: string;
  messages: ChatMessage[];
  lastUpdated: number;
}

export interface AppState {
  currentUser: UserProfile | null;
  profiles: UserProfile[];
  isVip: boolean;
  conversations: Conversation[];
}
