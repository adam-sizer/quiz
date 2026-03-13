import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HostGameService, HostGameState } from '../services/host-game.service';
import { QUIZZES } from '../data/quizzes';
import { Quiz } from '../models/quiz.model';
import { CountdownTimer } from '../shared/countdown-timer';

@Component({
  selector: 'app-host',
  imports: [CountdownTimer],
  template: `
    @switch (state().phase) {
      @case ('lobby') {
        <div class="host-screen lobby">
          @if (!state().gameCode) {
            <h2>Select a Quiz</h2>
            <div class="quiz-list">
              @for (quiz of quizzes; track quiz.id) {
                <button class="quiz-card" (click)="selectQuiz(quiz)">
                  <h3>{{ quiz.title }}</h3>
                  <p>{{ quiz.description }}</p>
                  <span class="question-count">{{ quiz.questions.length }} questions</span>
                </button>
              }
            </div>
          } @else {
            <div class="lobby-content">
              <h2>Game PIN</h2>
              <div class="game-code">{{ state().gameCode }}</div>
              <p class="join-url">Join at this app's URL and enter the code</p>

              <div class="players-section">
                <h3>Players ({{ state().players.length }})</h3>
                <div class="player-list">
                  @for (player of state().players; track player.playerId) {
                    <div class="player-chip">{{ player.name }}</div>
                  }
                  @if (state().players.length === 0) {
                    <p class="waiting">Waiting for players to join...</p>
                  }
                </div>
              </div>

              @if (state().players.length > 0) {
                <button class="btn btn-start" (click)="startGame()">Start Game</button>
              }

              <img class="dog-gif lobby-dog" src="https://media.giphy.com/media/mCRJDo24UvJMA/giphy.gif" alt="dancing dog" />
            </div>
          }
        </div>
      }

      @case ('thinking') {
        <div class="host-screen thinking">
          <span class="question-num">
            Question {{ state().currentQuestionIndex + 1 }} /
            {{ state().quiz!.questions.length }}
          </span>
          <h2 class="question-text">{{ currentQuestion()!.text }}</h2>
          <div class="thinking-countdown">
            <div class="thinking-number">{{ thinkingRemaining() }}</div>
            <p>Get ready...</p>
          </div>
          <img class="dog-gif thinking-dog" src="https://i.pinimg.com/originals/20/16/45/201645bdb77d9440ebf7f4387b4ef0c0.gif" alt="dancing dog" />
        </div>
      }

      @case ('question') {
        <div class="host-screen question">
          <div class="question-header">
            <span class="question-num">
              Question {{ state().currentQuestionIndex + 1 }} /
              {{ state().quiz!.questions.length }}
            </span>
            <app-countdown-timer
              [seconds]="currentQuestion()!.timeLimit"
              (expired)="onTimerExpired()"
            />
          </div>
          <h2 class="question-text">{{ currentQuestion()!.text }}</h2>
          <div class="options-grid">
            @for (option of currentQuestion()!.options; track $index) {
              <div class="option-card option-{{ $index }}">
                <span class="option-shape">{{ shapes[$index] }}</span>
                <span>{{ option.text }}</span>
              </div>
            }
          </div>
          <div class="answer-count">
            {{ state().answers.length }} / {{ state().players.length }} answered
          </div>
        </div>
      }

      @case ('results') {
        <div class="host-screen results">
          <div class="results-top">
            <div class="correct-section">
              <h2>Correct Answer</h2>
              <div class="correct-answer option-{{ currentQuestion()!.correctIndex }}">
                {{ currentQuestion()!.options[currentQuestion()!.correctIndex].text }}
              </div>
              @if (currentQuestion()!.explanation) {
                <div class="explanation">
                  <span class="explanation-label">Why?</span>
                  {{ currentQuestion()!.explanation }}
                </div>
              }
            </div>
            <div class="distribution-section">
              @for (option of currentQuestion()!.options; track $index) {
                <div class="dist-bar">
                  <div class="dist-label">{{ shapes[$index] }} {{ option.text }}</div>
                  <div class="dist-fill option-{{ $index }}" [style.width.%]="getAnswerPercent($index)">
                    {{ getAnswerCount($index) }}
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="leaderboard-section">
            <h3>Leaderboard</h3>
            <div class="score-list">
              @for (entry of state().scores; track entry.name; let i = $index) {
                <div class="score-row" [class.top-three]="i < 3">
                  <span class="rank">{{ i + 1 }}</span>
                  <span class="name">{{ entry.name }}</span>
                  <span class="score">{{ entry.score }}</span>
                  @if (entry.delta > 0) {
                    <span class="delta">+{{ entry.delta }}</span>
                  }
                </div>
              }
            </div>
          </div>

          <img class="dog-gif results-dog" src="https://i.pinimg.com/originals/20/16/45/201645bdb77d9440ebf7f4387b4ef0c0.gif" alt="party dog" />

          <button class="btn btn-next" (click)="nextOrFinish()">
            @if (isLastQuestion()) {
              See Final Results
            } @else {
              Next Question
            }
          </button>
        </div>
      }

      @case ('final') {
        <div class="host-screen final">
          <h2>Game Over!</h2>
          <img class="dog-gif winner-dog" src="https://media.giphy.com/media/5xaOcLGvzHxDKjR1LLq/giphy.gif" alt="winner dog" />
          <div class="podium">
            @for (entry of state().scores.slice(0, 3); track entry.name; let i = $index) {
              <div class="podium-place place-{{ i + 1 }}">
                <div class="podium-rank">{{ i === 0 ? '1st' : i === 1 ? '2nd' : '3rd' }}</div>
                <div class="podium-name">{{ entry.name }}</div>
                <div class="podium-score">{{ entry.score }} pts</div>
              </div>
            }
          </div>
          @if (state().scores.length > 3) {
            <div class="remaining-scores">
              @for (entry of state().scores.slice(3); track entry.name; let i = $index) {
                <div class="score-row">
                  <span class="rank">{{ i + 4 }}</span>
                  <span class="name">{{ entry.name }}</span>
                  <span class="score">{{ entry.score }}</span>
                </div>
              }
            </div>
          }
          <button class="btn btn-host" (click)="backToHome()">Play Again</button>
        </div>
      }
    }
  `,
  styles: `
    .host-screen {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
    }

    /* Dancing dogs */
    .dog-gif {
      border-radius: 12px;
      opacity: 0.9;
    }
    .lobby-dog {
      width: 150px;
      margin-top: 2rem;
    }
    .results-dog {
      width: 120px;
      margin: 1rem 0;
    }
    .winner-dog {
      width: 200px;
      margin: 0.5rem 0 1rem;
    }
    .thinking-dog {
      width: 140px;
      margin-top: 1.5rem;
    }

    /* Thinking */
    .thinking-countdown {
      margin: 1.5rem 0;
    }
    .thinking-number {
      font-size: 8rem;
      font-weight: 900;
      animation: pulse 1s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.8; }
    }

    /* Lobby */
    .quiz-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
      max-width: 900px;
      width: 100%;
      margin-top: 1.5rem;
    }
    .quiz-card {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      color: white;
      text-align: left;
      transition: transform 0.15s, border-color 0.15s;
    }
    .quiz-card:hover {
      transform: translateY(-3px);
      border-color: rgba(255, 255, 255, 0.5);
    }
    .quiz-card h3 { margin: 0 0 0.5rem; font-size: 1.3rem; }
    .quiz-card p { margin: 0; opacity: 0.8; font-size: 0.95rem; }
    .question-count {
      display: inline-block;
      margin-top: 0.75rem;
      padding: 0.25rem 0.75rem;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 20px;
      font-size: 0.85rem;
    }

    .game-code {
      font-size: 5rem;
      font-weight: 900;
      letter-spacing: 12px;
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem 2rem;
      border-radius: 16px;
      margin: 1rem 0;
    }
    .join-url {
      opacity: 0.7;
      font-size: 1.1rem;
    }
    .players-section { margin-top: 2rem; width: 100%; max-width: 600px; }
    .players-section h3 { font-size: 1.3rem; }
    .player-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      justify-content: center;
      margin-top: 1rem;
    }
    .player-chip {
      background: rgba(255, 255, 255, 0.15);
      padding: 0.5rem 1.2rem;
      border-radius: 24px;
      font-size: 1.1rem;
      animation: fadeIn 0.3s ease;
    }
    .waiting { opacity: 0.6; font-style: italic; }
    .btn-start {
      margin-top: 2rem;
      padding: 1rem 3rem;
      font-size: 1.4rem;
      background: #26890c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    }

    /* Question */
    .question-header {
      width: 100%;
      max-width: 800px;
    }
    .question-num {
      font-size: 1.1rem;
      opacity: 0.8;
      display: block;
      margin-bottom: 0.5rem;
    }
    .question-text {
      font-size: 2.2rem;
      margin: 1.5rem 0;
      max-width: 800px;
    }
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      width: 100%;
      max-width: 800px;
    }
    .option-card {
      padding: 1.5rem;
      border-radius: 8px;
      font-size: 1.3rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
    }
    .option-0 { background: #e21b3c; }
    .option-1 { background: #1368ce; }
    .option-2 { background: #d89e00; }
    .option-3 { background: #26890c; }
    .option-shape { font-size: 1.5rem; }
    .answer-count {
      margin-top: 1.5rem;
      font-size: 1.3rem;
      opacity: 0.8;
    }

    /* Results (merged with leaderboard) */
    .results-top {
      display: flex;
      gap: 2rem;
      width: 100%;
      max-width: 900px;
      align-items: flex-start;
      flex-wrap: wrap;
      justify-content: center;
    }
    .correct-section {
      flex: 1;
      min-width: 280px;
    }
    .correct-answer {
      font-size: 1.8rem;
      font-weight: bold;
      padding: 1rem 2rem;
      border-radius: 8px;
      margin: 1rem 0;
      color: white;
    }
    .explanation {
      background: rgba(255, 255, 255, 0.1);
      border-left: 4px solid #d89e00;
      padding: 0.75rem 1rem;
      border-radius: 0 8px 8px 0;
      text-align: left;
      font-size: 1.05rem;
      line-height: 1.5;
      margin-top: 0.5rem;
    }
    .explanation-label {
      font-weight: 900;
      color: #d89e00;
      margin-right: 0.5rem;
    }
    .distribution-section {
      flex: 1;
      min-width: 280px;
      text-align: left;
    }
    .dist-bar {
      margin-bottom: 0.75rem;
    }
    .dist-label {
      font-size: 1rem;
      margin-bottom: 0.25rem;
      opacity: 0.9;
    }
    .dist-fill {
      height: 36px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      padding-left: 0.75rem;
      color: white;
      font-weight: bold;
      min-width: 36px;
      transition: width 0.5s ease;
    }
    .leaderboard-section {
      width: 100%;
      max-width: 600px;
      margin-top: 1rem;
    }
    .leaderboard-section h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
    }

    /* Score list */
    .score-list {
      width: 100%;
      max-width: 600px;
    }
    .score-row {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      margin-bottom: 0.5rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      font-size: 1.2rem;
    }
    .score-row.top-three {
      background: rgba(255, 255, 255, 0.2);
      font-size: 1.3rem;
    }
    .rank {
      width: 40px;
      font-weight: bold;
      text-align: center;
    }
    .name { flex: 1; text-align: left; margin-left: 0.5rem; }
    .score { font-weight: bold; }
    .delta {
      margin-left: 0.75rem;
      color: #4caf50;
      font-size: 0.9em;
    }
    .btn-next, .btn-host {
      margin-top: 1.5rem;
      padding: 1rem 2.5rem;
      font-size: 1.2rem;
      background: #1368ce;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
    }
    .btn-host { background: #e21b3c; }

    /* Final */
    .podium {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      margin: 1rem 0;
    }
    .podium-place {
      background: rgba(255, 255, 255, 0.15);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      min-width: 150px;
    }
    .place-1 {
      order: 2;
      background: rgba(255, 215, 0, 0.3);
      border: 2px solid gold;
      transform: scale(1.1);
    }
    .place-2 { order: 1; background: rgba(192, 192, 192, 0.2); border: 2px solid silver; }
    .place-3 { order: 3; background: rgba(205, 127, 50, 0.2); border: 2px solid #cd7f32; }
    .podium-rank { font-size: 1.5rem; font-weight: 900; }
    .podium-name { font-size: 1.3rem; margin: 0.5rem 0; }
    .podium-score { opacity: 0.8; }
    .remaining-scores { width: 100%; max-width: 600px; }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `,
})
export class Host implements OnInit, OnDestroy {
  quizzes = QUIZZES;
  shapes = ['\u25B2', '\u25C6', '\u25CF', '\u25A0']; // triangle, diamond, circle, square

  state = signal<HostGameState>({
    phase: 'lobby',
    gameCode: '',
    quiz: null,
    currentQuestionIndex: -1,
    players: [],
    answers: [],
    questionStartTime: 0,
    scores: [],
  });

  thinkingRemaining = signal(3);
  private thinkingInterval: ReturnType<typeof setInterval> | null = null;
  private sub?: Subscription;

  constructor(
    private gameService: HostGameService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.sub = this.gameService.state.subscribe((s) => {
      this.state.set(s);
      if (s.phase === 'thinking') {
        this.startThinkingCountdown(3);
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
      }
    }, 1000);
  }

  private clearThinkingTimer(): void {
    if (this.thinkingInterval) {
      clearInterval(this.thinkingInterval);
      this.thinkingInterval = null;
    }
  }

  async selectQuiz(quiz: Quiz): Promise<void> {
    await this.gameService.createGame(quiz);
  }

  startGame(): void {
    this.gameService.startGame();
  }

  onTimerExpired(): void {
    this.gameService.endQuestion();
  }

  nextOrFinish(): void {
    this.gameService.nextOrFinish();
  }

  isLastQuestion(): boolean {
    const s = this.state();
    return s.currentQuestionIndex >= s.quiz!.questions.length - 1;
  }

  currentQuestion() {
    const s = this.state();
    return s.quiz?.questions[s.currentQuestionIndex] ?? null;
  }

  getAnswerCount(optionIndex: number): number {
    return this.state().answers.filter((a) => a.optionIndex === optionIndex).length;
  }

  getAnswerPercent(optionIndex: number): number {
    const total = this.state().answers.length;
    if (total === 0) return 0;
    return (this.getAnswerCount(optionIndex) / total) * 100;
  }

  backToHome(): void {
    this.gameService.reset();
    this.router.navigate(['/']);
  }
}
