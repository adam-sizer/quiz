import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlayerGameService } from '../services/player-game.service';

@Component({
  selector: 'app-player-join',
  imports: [FormsModule],
  template: `
    <div class="join-screen">
      <h1>Join Game</h1>
      <form (ngSubmit)="join()">
        <input
          type="text"
          [(ngModel)]="gameCode"
          name="gameCode"
          placeholder="Game PIN"
          class="input-code"
          maxlength="6"
          required
          [disabled]="connecting()"
        />
        <input
          type="text"
          [(ngModel)]="playerName"
          name="playerName"
          placeholder="Your Name"
          class="input-name"
          maxlength="20"
          required
          [disabled]="connecting()"
        />
        @if (error()) {
          <div class="error">{{ error() }}</div>
        }
        <button type="submit" class="btn btn-join" [disabled]="connecting() || !gameCode || !playerName">
          {{ connecting() ? 'Connecting...' : 'Join!' }}
        </button>
      </form>
      <a class="back-link" routerLink="/">Back</a>
    </div>
  `,
  styles: `
    .join-screen {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
      text-align: center;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 2rem;
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      max-width: 320px;
    }
    input {
      padding: 1rem;
      font-size: 1.3rem;
      border: none;
      border-radius: 8px;
      text-align: center;
      font-weight: bold;
      color: #333;
    }
    .input-code {
      font-size: 1.8rem;
      letter-spacing: 6px;
      text-transform: uppercase;
    }
    .error {
      background: rgba(226, 27, 60, 0.8);
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.95rem;
    }
    .btn-join {
      padding: 1rem;
      font-size: 1.3rem;
      font-weight: bold;
      background: #26890c;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
    .btn-join:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .back-link {
      margin-top: 1.5rem;
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
    }
  `,
})
export class PlayerJoin {
  gameCode = '';
  playerName = '';
  connecting = signal(false);
  error = signal<string | null>(null);

  constructor(
    private gameService: PlayerGameService,
    private router: Router,
  ) {}

  async join(): Promise<void> {
    if (!this.gameCode || !this.playerName) return;
    this.connecting.set(true);
    this.error.set(null);
    try {
      await this.gameService.joinGame(this.gameCode.toUpperCase(), this.playerName);
      this.router.navigate(['/play']);
    } catch {
      this.error.set('Could not connect. Check the game PIN and try again.');
      this.connecting.set(false);
    }
  }
}
