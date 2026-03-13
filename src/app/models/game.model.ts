export type HostPhase = 'lobby' | 'question' | 'results' | 'leaderboard' | 'final';
export type PlayerPhase = 'joining' | 'lobby' | 'question' | 'answered' | 'results' | 'final';

export interface Player {
  peerId: string;
  name: string;
  score: number;
}

export interface PlayerAnswer {
  peerId: string;
  optionIndex: number;
  receivedAt: number;
}

export interface ScoreEntry {
  name: string;
  score: number;
  delta: number;
}
