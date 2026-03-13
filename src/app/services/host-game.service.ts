import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PeerService } from './peer.service';
import { Quiz } from '../models/quiz.model';
import { HostPhase, Player, PlayerAnswer, ScoreEntry } from '../models/game.model';
import { AnswerMessage, JoinMessage } from '../models/message.model';

export interface HostGameState {
  phase: HostPhase;
  gameCode: string;
  quiz: Quiz | null;
  currentQuestionIndex: number;
  players: Player[];
  answers: PlayerAnswer[];
  questionStartTime: number;
  scores: ScoreEntry[];
}

const INITIAL_STATE: HostGameState = {
  phase: 'lobby',
  gameCode: '',
  quiz: null,
  currentQuestionIndex: -1,
  players: [],
  answers: [],
  questionStartTime: 0,
  scores: [],
};

@Injectable({ providedIn: 'root' })
export class HostGameService {
  private state$ = new BehaviorSubject<HostGameState>({ ...INITIAL_STATE });
  readonly state = this.state$.asObservable();

  get snapshot(): HostGameState {
    return this.state$.value;
  }

  constructor(private peerService: PeerService) {
    this.peerService.events.subscribe((event) => {
      if (event.type === 'message' && event.data && event.peerId) {
        this.handleMessage(event.peerId, event.data);
      }
    });
  }

  async createGame(quiz: Quiz): Promise<string> {
    const gameCode = this.generateGameCode();
    await this.peerService.createHost(gameCode);
    this.update({ ...INITIAL_STATE, phase: 'lobby', gameCode, quiz });
    return gameCode;
  }

  startGame(): void {
    this.peerService.broadcast({ type: 'start' });
    this.nextQuestion();
  }

  nextQuestion(): void {
    const state = this.snapshot;
    const nextIndex = state.currentQuestionIndex + 1;
    const question = state.quiz!.questions[nextIndex];

    this.update({
      phase: 'question',
      currentQuestionIndex: nextIndex,
      answers: [],
      questionStartTime: Date.now(),
    });

    this.peerService.broadcast({
      type: 'question',
      index: nextIndex,
      text: question.text,
      options: question.options.map((o) => o.text),
      timeLimit: question.timeLimit,
    });
  }

  endQuestion(): void {
    const state = this.snapshot;
    const question = state.quiz!.questions[state.currentQuestionIndex];
    const timeLimitMs = question.timeLimit * 1000;

    // Calculate scores
    const updatedPlayers = state.players.map((player) => {
      const answer = state.answers.find((a) => a.peerId === player.peerId);
      let delta = 0;
      if (answer && answer.optionIndex === question.correctIndex) {
        const elapsed = answer.receivedAt - state.questionStartTime;
        delta = 1000 + Math.round(500 * Math.max(0, 1 - elapsed / timeLimitMs));
      }
      return { ...player, score: player.score + delta };
    });

    const scores: ScoreEntry[] = updatedPlayers
      .map((p) => {
        const answer = state.answers.find((a) => a.peerId === p.peerId);
        let delta = 0;
        if (answer && answer.optionIndex === question.correctIndex) {
          const elapsed = answer.receivedAt - state.questionStartTime;
          delta = 1000 + Math.round(500 * Math.max(0, 1 - elapsed / timeLimitMs));
        }
        return { name: p.name, score: p.score, delta };
      })
      .sort((a, b) => b.score - a.score);

    this.update({ phase: 'results', players: updatedPlayers, scores });

    this.peerService.broadcast({
      type: 'reveal',
      correctIndex: question.correctIndex,
      scores,
    });
  }

  showLeaderboard(): void {
    this.update({ phase: 'leaderboard' });
  }

  nextOrFinish(): void {
    const state = this.snapshot;
    if (state.currentQuestionIndex >= state.quiz!.questions.length - 1) {
      this.finishGame();
    } else {
      this.nextQuestion();
    }
  }

  private finishGame(): void {
    const state = this.snapshot;
    const finalScores = state.players
      .map((p) => ({ name: p.name, score: p.score, rank: 0 }))
      .sort((a, b) => b.score - a.score)
      .map((entry, i) => ({ ...entry, rank: i + 1 }));

    this.update({ phase: 'final', scores: finalScores.map((s) => ({ ...s, delta: 0 })) });

    this.peerService.broadcast({ type: 'game-over', finalScores });
  }

  private handleMessage(peerId: string, data: unknown): void {
    const msg = data as { type: string };
    if (msg.type === 'join') {
      this.handleJoin(peerId, data as JoinMessage);
    } else if (msg.type === 'answer') {
      this.handleAnswer(peerId, data as AnswerMessage);
    }
  }

  private handleJoin(peerId: string, msg: JoinMessage): void {
    const state = this.snapshot;
    if (state.phase !== 'lobby') return;

    const players = [...state.players, { peerId, name: msg.name, score: 0 }];
    this.update({ players });

    this.peerService.broadcast({
      type: 'player-joined',
      name: msg.name,
      playerCount: players.length,
    });
  }

  private handleAnswer(peerId: string, msg: AnswerMessage): void {
    const state = this.snapshot;
    if (state.phase !== 'question') return;
    if (msg.questionIndex !== state.currentQuestionIndex) return;
    if (state.answers.some((a) => a.peerId === peerId)) return;

    const answers = [...state.answers, { peerId, optionIndex: msg.optionIndex, receivedAt: Date.now() }];
    this.update({ answers });
  }

  private update(partial: Partial<HostGameState>): void {
    this.state$.next({ ...this.snapshot, ...partial });
  }

  private generateGameCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  reset(): void {
    this.peerService.destroy();
    this.state$.next({ ...INITIAL_STATE });
  }
}
