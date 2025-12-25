
import { AppState, UserProfile, Conversation, ChatMessage } from '../types';

const STORAGE_KEY = 'lucky_star_app_data';

const DEFAULT_STATE: AppState = {
  currentUser: null,
  profiles: [],
  isVip: false,
  conversations: []
};

export const storageService = {
  saveData: (data: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  loadData: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_STATE;
  },

  clearAllData: () => {
    localStorage.removeItem(STORAGE_KEY);
    // 同时清除可能存在的其他残余数据
    localStorage.clear();
  },

  addProfile: (profile: UserProfile) => {
    const state = storageService.loadData();
    const newProfiles = [...state.profiles, profile];
    const newState = { 
        ...state, 
        profiles: newProfiles, 
        currentUser: state.currentUser || profile 
    };
    storageService.saveData(newState);
    return newState;
  },

  setCurrentUser: (id: string) => {
    const state = storageService.loadData();
    const user = state.profiles.find(p => p.id === id);
    if (user) {
      const newState = { ...state, currentUser: user };
      storageService.saveData(newState);
      return newState;
    }
    return state;
  },

  updateProfile: (id: string, updates: Partial<UserProfile>) => {
    const state = storageService.loadData();
    const newProfiles = state.profiles.map(p => p.id === id ? { ...p, ...updates } : p);
    let newCurrentUser = state.currentUser;
    if (newCurrentUser?.id === id) {
      newCurrentUser = { ...newCurrentUser, ...updates };
    }
    const newState = { ...state, profiles: newProfiles, currentUser: newCurrentUser };
    storageService.saveData(newState);
    return newState;
  },

  deleteProfile: (id: string) => {
    const state = storageService.loadData();
    const newProfiles = state.profiles.filter(p => p.id !== id);
    let newCurrentUser = state.currentUser;
    if (newCurrentUser?.id === id) {
        newCurrentUser = newProfiles.length > 0 ? newProfiles[0] : null;
    }
    const newState = { ...state, profiles: newProfiles, currentUser: newCurrentUser };
    storageService.saveData(newState);
    return newState;
  },

  updateVipStatus: (status: boolean) => {
    const state = storageService.loadData();
    const newState = { ...state, isVip: status };
    storageService.saveData(newState);
    return newState;
  },

  saveConversation: (profileId: string, messages: ChatMessage[]) => {
    const state = storageService.loadData();
    const convId = `conv_${profileId}`;
    const existingIdx = state.conversations.findIndex(c => c.id === convId);
    
    let newConversations = [...state.conversations];
    const conversation: Conversation = {
      id: convId,
      profileId,
      title: '星语咨询',
      messages,
      lastUpdated: Date.now()
    };

    if (existingIdx > -1) {
      newConversations[existingIdx] = conversation;
    } else {
      newConversations.push(conversation);
    }

    storageService.saveData({ ...state, conversations: newConversations });
  },

  getConversation: (profileId: string): Conversation | undefined => {
    const state = storageService.loadData();
    return state.conversations.find(c => c.profileId === profileId);
  }
};
