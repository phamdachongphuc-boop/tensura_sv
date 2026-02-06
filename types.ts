
export enum GameState {
  SERVER_SELECTION,
  AUTH, 
  MAIN_MENU,
  CHARACTER_CREATION,
  INTRO_SEQUENCE,
  PLAYING,
  ADMIN_PANEL, 
}

export type DifficultyLevel = 'EASY' | 'NORMAL' | 'HARD' | 'INSTANT_DEATH';

export interface ServerConfig {
  id: string;
  name: string;
  region: string;
  status: 'ONLINE' | 'MAINTENANCE' | 'FULL';
  description: string;
}

export const GAME_SERVERS: ServerConfig[] = [
  { id: 'sv1', name: 'S1: Jura Tempest', region: 'VN', status: 'ONLINE', description: 'Máy chủ khởi nguyên. Nơi Rimuru cai trị.' },
  { id: 'sv2', name: 'S2: Dwargon', region: 'VN', status: 'ONLINE', description: 'Vương quốc người lùn. Tập trung thợ rèn.' },
  { id: 'sv3', name: 'S3: Ingrassia', region: 'Global', status: 'ONLINE', description: 'Vương quốc loài người. Thương mại sất uất.' },
  { id: 'sv4', name: 'S4: Walpurgis', region: 'VIP', status: 'MAINTENANCE', description: 'Máy chủ sự kiện dành cho Ma Vương.' },
];

export interface UserProfile {
  username: string;
  createdAt: number;
  lastActive?: number; 
  isAdmin?: boolean;
  isBanned?: boolean;
  saveData?: SaveData;
}

export interface Mail {
  id: string;
  sender: string;
  title: string;
  content: string;
  type: 'TEXT' | 'SKILL' | 'ITEM';
  attachment?: string; 
  timestamp: number;
  isRead: boolean;
  isClaimed: boolean;
}

export interface Quest {
  id: string;
  name: string; 
  description: string; 
  current: number; 
  required: number; 
  unit: string; 
  isCompleted: boolean;
}

export interface CharacterAttributes {
  strength: number;
  magic: number;
  agility: number;
  defense: number;
}

export interface CharacterStatus {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  skills: string[]; 
  equippedSkills: string[]; 
  activeEffects: string[]; 
  inventory: string[]; 
  quests: Quest[]; 
  level: number;
  evolutionStage: string;
  difficulty: DifficultyLevel;
  isGodMode?: boolean;
}

export interface Character {
  name: string;
  race: string;
  uniqueSkill: string;
  reincarnationReason: string; 
  location: string; 
  attributes: CharacterAttributes;
  status: CharacterStatus;
  customAvatar?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface SaveData {
  character: Character;
  chatHistory: ChatMessage[];
  lastSaved: number;
}

export interface BattleLogEntry {
  turn: number; 
  actor: string; 
  skill: string; 
  description: string; 
  damage: number; 
}

export interface BattleMetadata {
  type: 'METADATA';
  p1_energy: number;
  p2_energy: number;
  p1_cooldowns: Record<string, number>;
  p2_cooldowns: Record<string, number>;
}

export interface BattleState {
  id: number;
  server_id: string;
  challenger: string;
  target: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'FINISHED';
  winner?: string;
  turn: string;
  logs: (BattleLogEntry | BattleMetadata)[]; 
  p1_hp: number;
  p1_max_hp: number;
  p2_hp: number;
  p2_max_hp: number;
  p1_energy?: number;
  p2_energy?: number;
  p1_cooldowns?: Record<string, number>;
  p2_cooldowns?: Record<string, number>;
  last_updated: number;
}
