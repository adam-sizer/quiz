export type HostPhase = 'lobby' | 'thinking' | 'question' | 'results' | 'final';
export type PlayerPhase = 'joining' | 'lobby' | 'thinking' | 'question' | 'answered' | 'results' | 'final';

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
