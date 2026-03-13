import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { PlayerGameService, PlayerGameState } from '../services/player-game.service';
import { CountdownTimer } from '../shared/countdown-timer';

@Component({
  selector: 'app-player',
  imports: [CountdownTimer],
  template: `
    @switch (state().phase) {
      @case ('lobby') {
        <div class="player-screen lobby">
          <div class="check-mark">&#10003;</div>
          <h2>You're in!</h2>
          <p class="player-name">{{ state().playerName }}</p>
          <p class="waiting">Waiting for the host to start the game...</p>
          <img class="dog-gif" src="https://media.giphy.com/media/bbshzgyFQDqPHXBo4c/giphy.gif" alt="waiting dog" style="width: 120px; margin-top: 1.5rem;" />
        </div>
      }

      @case ('thinking') {
        <div class="player-screen thinking">
          <h2 class="question-text">{{ state().currentQuestion!.text }}</h2>
          <div class="thinking-countdown">
            <div class="thinking-number">{{ thinkingRemaining() }}</div>
            <p>Get ready...</p>
          </div>
          <img class="dog-gif" src="https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif" alt="thinking dog" style="width: 100px; margin-top: 1rem;" />
        </div>
      }

      @case ('question') {
        <div class="player-screen question">
          <app-countdown-timer [seconds]="state().currentQuestion!.timeLimit" (expired)="onTimerExpired()" />
          <h2 class="question-text">{{ state().currentQuestion!.text }}</h2>
          <div class="answer-grid">
            @for (option of state().currentQuestion!.options; track $index) {
              <button
                class="answer-btn option-{{ $index }}"
                (click)="selectAnswer($index)"
              >
                <span class="shape">{{ shapes[$index] }}</span>
                <span>{{ option }}</span>
              </button>
            }
          </div>
        </div>
      }

      @case ('answered') {
        <div class="player-screen answered">
          <div class="big-icon">&#128077;</div>
          <h2>Answer submitted!</h2>
          <p>Waiting for everyone else...</p>
          <img class="dog-gif" src="https://i.pinimg.com/originals/20/16/45/201645bdb77d9440ebf7f4387b4ef0c0.gif" alt="dancing dog" style="width: 100px; margin-top: 1rem;" />
        </div>
      }

      @case ('results') {
        <div class="player-screen results">
          @if (wasCorrect()) {
            <div class="result-icon correct">&#10003;</div>
            <h2>Correct!</h2>
          } @else {
            <div class="result-icon wrong">&#10007;</div>
            <h2>Wrong!</h2>
          }
          @if (state().lastDelta > 0) {
            <div class="points-earned">+{{ state().lastDelta }} points</div>
          }
          @if (state().lastExplanation) {
            <div class="explanation">
              <span class="explanation-label">Why?</span>
              {{ state().lastExplanation }}
            </div>
          }
          <div class="leaderboard-mini">
            @for (entry of state().scores.slice(0, 5); track entry.name; let i = $index) {
              <div class="score-row" [class.is-me]="entry.name === state().playerName">
                <span class="rank">{{ i + 1 }}</span>
                <span class="name">{{ entry.name }}</span>
                <span class="score">{{ entry.score }}</span>
              </div>
            }
          </div>
        </div>
      }

      @case ('final') {
        <div class="player-screen final">
          <h2>Game Over!</h2>
          <img class="dog-gif" src="https://media.giphy.com/media/5xaOcLGvzHxDKjR1LLq/giphy.gif" alt="celebration dog" style="width: 150px; margin-bottom: 1rem;" />
          <div class="final-rank">
            <div class="rank-number">#{{ state().finalRank }}</div>
            <div class="final-name">{{ state().playerName }}</div>
            <div class="final-score">{{ state().finalScore }} points</div>
          </div>
          <button class="btn btn-home" (click)="backToHome()">Play Again</button>
        </div>
      }
    }

    @if (state().error) {
      <div class="error-overlay">
        <div class="error-box">
          <h3>Connection Lost</h3>
          <p>{{ state().error }}</p>
          <button class="btn btn-home" (click)="backToHome()">Back to Home</button>
        </div>
      </div>
    }
  `,
  styles: `
    .player-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 1.5rem;
      text-align: center;
    }

    .dog-gif {
      border-radius: 10px;
      opacity: 0.9;
    }

    /* Lobby */
    .check-mark {
      font-size: 4rem;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #26890c;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .player-name {
      font-size: 1.5rem;
      font-weight: bold;
      margin: 0.5rem 0;
    }
    .waiting {
      opacity: 0.7;
      font-size: 1.1rem;
    }

    /* Thinking */
    .thinking-countdown {
      margin: 1.5rem 0;
    }
    .thinking-number {
      font-size: 6rem;
      font-weight: 900;
      animation: pulse 1s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.8; }
    }

    /* Question */
    .question-text {
      font-size: 1.4rem;
      margin: 1rem 0 1.5rem;
    }
    .answer-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      width: 100%;
      max-width: 500px;
    }
    .answer-btn {
      padding: 1.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: bold;
      color: white;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.1s, opacity 0.1s;
      min-height: 100px;
      justify-content: center;
    }
    .answer-btn:active {
      transform: scale(0.95);
    }
    .option-0 { background: #e21b3c; }
    .option-1 { background: #1368ce; }
    .option-2 { background: #d89e00; }
    .option-3 { background: #26890c; }
    .shape { font-size: 1.5rem; }

    /* Answered */
    .big-icon { font-size: 4rem; margin-bottom: 1rem; }

    /* Results */
    .result-icon {
      font-size: 3rem;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
    }
    .result-icon.correct { background: #26890c; }
    .result-icon.wrong { background: #e21b3c; }
    .points-earned {
      font-size: 2rem;
      font-weight: bold;
      color: #4caf50;
      margin: 0.5rem 0 1.5rem;
    }
    .explanation {
      background: rgba(255, 255, 255, 0.1);
      border-left: 4px solid #d89e00;
      padding: 0.6rem 0.75rem;
      border-radius: 0 8px 8px 0;
      text-align: left;
      font-size: 0.95rem;
      line-height: 1.4;
      margin-bottom: 1rem;
      width: 100%;
      max-width: 400px;
    }
    .explanation-label {
      font-weight: 900;
      color: #d89e00;
      margin-right: 0.4rem;
    }
    .leaderboard-mini {
      width: 100%;
      max-width: 400px;
    }
    .score-row {
      display: flex;
      align-items: center;
      padding: 0.6rem 0.75rem;
      margin-bottom: 0.4rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 6px;
    }
    .score-row.is-me {
      background: rgba(255, 255, 255, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.4);
    }
    .rank { width: 30px; font-weight: bold; text-align: center; }
    .name { flex: 1; text-align: left; margin-left: 0.5rem; }
    .score { font-weight: bold; }

    /* Final */
    .final-rank {
      background: rgba(255, 255, 255, 0.1);
      padding: 2rem;
      border-radius: 16px;
      margin: 1rem 0;
    }
    .rank-number {
      font-size: 4rem;
      font-weight: 900;
    }
    .final-name {
      font-size: 1.5rem;
      margin: 0.5rem 0;
    }
    .final-score {
      font-size: 1.2rem;
      opacity: 0.8;
    }

    .btn-home {
      margin-top: 1.5rem;
      padding: 0.8rem 2rem;
      font-size: 1.1rem;
      background: #1368ce;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    }

    /* Error overlay */
    .error-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
    }
    .error-box {
      background: #2a1052;
      padding: 2rem;
      border-radius: 16px;
      text-align: center;
      max-width: 350px;
    }
  `,
})
export class Player implements OnInit, OnDestroy {
  shapes = ['\u25B2', '\u25C6', '\u25CF', '\u25A0'];

  state = signal<PlayerGameState>({
    phase: 'joining',
    playerName: '',
    currentQuestion: null,
    selectedAnswer: null,
    scores: [],
    finalRank: 0,
    finalScore: 0,
    lastCorrectIndex: null,
    lastDelta: 0,
    lastExplanation: null,
    error: null,
  });

  thinkingRemaining = signal(3);
  private thinkingInterval: ReturnType<typeof setInterval> | null = null;

  private sub?: Subscription;

  constructor(
    private gameService: PlayerGameService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // If somehow navigated here without joining, redirect
    if (this.gameService.snapshot.phase === 'joining') {
      this.router.navigate(['/join']);
      return;
    }
    this.sub = this.gameService.state.subscribe((s) => {
      this.state.set(s);
      if (s.phase === 'thinking') {
        this.startThinkingCountdown(s.currentQuestion?.thinkingTime ?? 3);
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.clearThinkingTimer();
  }

  private startThinkingCountdown(seconds: number): void {
    this.clearThinkingTimer();
    this.thinkingRemaining.set(seconds);
    this.thinkingInterval = setInterval(() => {
      const remaining = this.thinkingRemaining() - 1;
      this.thinkingRemaining.set(remaining);
      if (remaining <= 0) {
        this.clearThinkingTimer();
        this.gameService.readyToAnswer();
      }
    }, 1000);
  }

  private clearThinkingTimer(): void {
    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
      this.thinkingInterval = null;
    }
  }

  selectAnswer(optionIndex: number): void {
    this.gameService.submitAnswer(optionIndex);
  }

  onTimerExpired(): void {
    // If player hasn't answered, just go to answered state to wait
    if (this.state().phase === 'question') {
      this.state.update((s) => ({ ...s, phase: 'answered' }));
    }
  }

  wasCorrect(): boolean {
    const s = this.state();
    return s.selectedAnswer !== null && s.selectedAnswer === s.lastCorrectIndex;
  }

  backToHome(): void {
    this.gameService.reset();
    this.router.navigate(['/']);
  }
}
