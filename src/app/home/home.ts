import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <div class="home">
      <div class="logo">
        <h1>QuizBattle</h1>
        <p>Free multiplayer quiz game</p>
      </div>
      <div class="actions">
        <a routerLink="/host" class="btn btn-host">Host a Game</a>
        <a routerLink="/join" class="btn btn-join">Join a Game</a>
      </div>
    </div>
  `,
  styles: `
    .home {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 2rem;
    }
    .logo h1 {
      font-size: 4rem;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 4px;
    }
    .logo p {
      font-size: 1.2rem;
      opacity: 0.8;
      margin-top: 0.5rem;
    }
    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 3rem;
      width: 100%;
      max-width: 320px;
    }
    .btn {
      display: block;
      padding: 1.2rem 2rem;
      font-size: 1.3rem;
      font-weight: bold;
      text-align: center;
      text-decoration: none;
      border-radius: 8px;
      transition: transform 0.15s, box-shadow 0.15s;
      cursor: pointer;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
    }
    .btn-host {
      background: #e21b3c;
      color: white;
    }
    .btn-join {
      background: #1368ce;
      color: white;
    }
  `,
})
export class Home {}
