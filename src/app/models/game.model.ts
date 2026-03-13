export type HostPhase = 'lobby' | 'question' | 'results' | 'leaderboard' | 'final';
export type PlayerPhase = 'joining' | 'lobby' | 'question' | 'answered' | 'results' | 'final';

export interface Player {
  playerId: string;
  name: string;
  score: number;
}

export interface PlayerAnswer {
  playerId: string;
  optionIndex: number;
  receivedAt: number;
}

export interface ScoreEntry {
  name: string;
  score: number;
  delta: number;
}
