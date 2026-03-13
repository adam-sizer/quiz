import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PeerService } from './peer.service';
import { PlayerPhase, ScoreEntry } from '../models/game.model';
import { HostMessage } from '../models/message.model';

export interface PlayerGameState {
  phase: PlayerPhase;
  playerName: string;
  currentQuestion: {
    index: number;
    text: string;
    options: string[];
    timeLimit: number;
  } | null;
  selectedAnswer: number | null;
  scores: ScoreEntry[];
  finalRank: number;
  finalScore: number;
  lastCorrectIndex: number | null;
  lastDelta: number;
  error: string | null;
}

const INITIAL_STATE: PlayerGameState = {
  phase: 'joining',
  playerName: '',
  currentQuestion: null,
  selectedAnswer: null,
  scores: [],
  finalRank: 0,
  finalScore: 0,
  lastCorrectIndex: null,
  lastDelta: 0,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class PlayerGameService {
  private state$ = new BehaviorSubject<PlayerGameState>({ ...INITIAL_STATE });
  readonly state = this.state$.asObservable();

  get snapshot(): PlayerGameState {
    return this.state$.value;
  }

  constructor(private peerService: PeerService) {
    this.peerService.events.subscribe((event) => {
      if (event.type === 'message' && event.data) {
        this.handleMessage(event.data as HostMessage);
      }
      if (event.type === 'player-disconnected') {
        this.update({ error: 'Host disconnected!' });
      }
      if (event.type === 'error') {
        this.update({ error: event.error ?? 'Connection error' });
      }
    });
  }

  async joinGame(gameCode: string, name: string): Promise<void> {
    this.update({ playerName: name, error: null });
    await this.peerService.connectToHost(gameCode);
    this.peerService.broadcast({ type: 'join', name });
    this.update({ phase: 'lobby' });
  }

  submitAnswer(optionIndex: number): void {
    const state = this.snapshot;
    if (state.phase !== 'question' || state.selectedAnswer !== null) return;

    this.update({ selectedAnswer: optionIndex, phase: 'answered' });

    this.peerService.broadcast({
      type: 'answer',
      questionIndex: state.currentQuestion!.index,
      optionIndex,
    });
  }

  private handleMessage(msg: HostMessage): void {
    switch (msg.type) {
      case 'start':
        this.update({ phase: 'lobby' });
        break;
      case 'question':
        this.update({
          phase: 'question',
          currentQuestion: {
            index: msg.index,
            text: msg.text,
            options: msg.options,
            timeLimit: msg.timeLimit,
          },
          selectedAnswer: null,
          lastCorrectIndex: null,
        });
        break;
      case 'reveal': {
        const myScore = msg.scores.find((s) => s.name === this.snapshot.playerName);
        this.update({
          phase: 'results',
          lastCorrectIndex: msg.correctIndex,
          scores: msg.scores,
          lastDelta: myScore?.delta ?? 0,
        });
        break;
      }
      case 'game-over': {
        const me = msg.finalScores.find((s) => s.name === this.snapshot.playerName);
        this.update({
          phase: 'final',
          finalRank: me?.rank ?? 0,
          finalScore: me?.score ?? 0,
          scores: msg.finalScores.map((s) => ({ ...s, delta: 0 })),
        });
        break;
      }
    }
  }

  private update(partial: Partial<PlayerGameState>): void {
    this.state$.next({ ...this.snapshot, ...partial });
  }

  reset(): void {
    this.peerService.destroy();
    this.state$.next({ ...INITIAL_STATE });
  }
}
