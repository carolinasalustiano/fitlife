
export enum ViewState {
  FEED = 'FEED',
  LOG_WORKOUT = 'LOG_WORKOUT',
  RANKING = 'RANKING',
  DASHBOARD = 'DASHBOARD',
  USER_PROFILE = 'USER_PROFILE',
  FRIENDS = 'FRIENDS',
  CHALLENGES = 'CHALLENGES'
}

export type RankingLevel = 'Fácil' | 'Intermediário' | 'Avançado';

export interface User {
  id: string;
  name: string;
  avatar: string;
  level?: number;
  isCurrentUser?: boolean;
  currentWeight?: number;
  initialWeight?: number;
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  user: User;
  createdAt?: string; // ISO string for sorting/calculations
  timeAgo: string;
  location?: string;
  image?: string;
  type?: string;
  title: string;
  stats?: {
    label: string;
    value: string;
    unit?: string;
  }[];
  likes: number;
  isLiked: boolean; // New field to track if current user liked
  comments: Comment[]; // Changed from number to Comment array
  xp?: number;
  workoutDetails?: {
    name: string;
    date: string;
    weight: string;
    sets: string;
  };
  incentives?: User[];
}

export interface RankingUser extends User {
  points: number;
  rank: number;
  stats: string;
  photos: number;
  trend?: 'up' | 'down' | 'same';
  leagueLevel: RankingLevel;
  isFriend?: boolean; // New field to track friendship status
  streak?: number;
  height?: number;
  bmi?: number;
}

export interface Challenge {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  participants: User[];
  creator: User;
  status: 'active' | 'upcoming' | 'completed';
  description?: string;
}