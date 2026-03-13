import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  set,
  push,
  onValue,
  onChildAdded,
  onChildRemoved,
  remove,
  Database,
  Unsubscribe,
  onDisconnect,
  get,
  serverTimestamp,
} from 'firebase/database';
import { environment } from '../environments/environment';
import { GameMessage } from '../models/message.model';

export interface FirebaseEvent {
  type: 'message' | 'player-connected' | 'player-disconnected' | 'error' | 'open';
  playerId?: string;
  data?: GameMessage;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class FirebaseService implements OnDestroy {
  private app: FirebaseApp;
  private db: Database;
  private gameCode = '';
  private role: 'host' | 'player' | null = null;
  private playerId = '';
  private unsubs: Unsubscribe[] = [];

  private events$ = new Subject<FirebaseEvent>();
  readonly events = this.events$.asObservable();

  constructor(private zone: NgZone) {
    this.app = initializeApp(environment.firebase);
    this.db = getDatabase(this.app);
  }

  /**
   * HOST: Create a game room in Firebase and listen for players + messages
   */
  async createHost(gameCode: string): Promise<string> {
    this.gameCode = gameCode;
    this.role = 'host';

    const gameRef = ref(this.db, `games/${gameCode}`);

    // Initialize the game room
    await set(gameRef, {
      host: true,
      createdAt: Date.now(),
    });

    // Clean up game room when host disconnects
    onDisconnect(gameRef).remove();

    // Listen for players joining
    const playersRef = ref(this.db, `games/${gameCode}/players`);
    const unsubAdd = onChildAdded(playersRef, (snapshot) => {
      this.zone.run(() => {
        this.events$.next({
          type: 'player-connected',
          playerId: snapshot.key!,
        });
      });
    });
    this.unsubs.push(unsubAdd);

    const unsubRemove = onChildRemoved(playersRef, (snapshot) => {
      this.zone.run(() => {
        this.events$.next({
          type: 'player-disconnected',
          playerId: snapshot.key!,
        });
      });
    });
    this.unsubs.push(unsubRemove);

    // Listen for messages from players → host
    const toHostRef = ref(this.db, `games/${gameCode}/toHost`);
    const unsubMessages = onChildAdded(toHostRef, (snapshot) => {
      this.zone.run(() => {
        const val = snapshot.val();
        if (val) {
          this.events$.next({
            type: 'message',
            playerId: val.playerId,
            data: val.message as GameMessage,
          });
          // Remove processed message
          remove(snapshot.ref);
        }
      });
    });
    this.unsubs.push(unsubMessages);

    this.events$.next({ type: 'open', playerId: 'host' });
    return gameCode;
  }

  /**
   * PLAYER: Connect to an existing game room
   */
  async connectToHost(gameCode: string): Promise<void> {
    this.gameCode = gameCode.toUpperCase();
    this.role = 'player';

    // Verify game exists
    const gameRef = ref(this.db, `games/${this.gameCode}/host`);
    const snapshot = await get(gameRef);
    if (!snapshot.exists()) {
      throw new Error('Game not found. Check the PIN and try again.');
    }

    // Register this player with a unique ID
    const playersRef = ref(this.db, `games/${this.gameCode}/players`);
    const playerRef = push(playersRef);
    this.playerId = playerRef.key!;
    await set(playerRef, { joinedAt: Date.now() });

    // Remove player entry on disconnect
    onDisconnect(playerRef).remove();

    // Listen for messages from host → all players
    const toPlayersRef = ref(this.db, `games/${this.gameCode}/toPlayers`);
    const unsubMessages = onChildAdded(toPlayersRef, (snapshot) => {
      this.zone.run(() => {
        const val = snapshot.val();
        if (val) {
          this.events$.next({
            type: 'message',
            playerId: 'host',
            data: val as GameMessage,
          });
        }
      });
    });
    this.unsubs.push(unsubMessages);

    // Listen for game room being removed (host disconnected)
    const hostRef = ref(this.db, `games/${this.gameCode}/host`);
    const unsubHost = onValue(hostRef, (snapshot) => {
      if (!snapshot.exists() && this.role === 'player') {
        this.zone.run(() => {
          this.events$.next({ type: 'player-disconnected', playerId: 'host' });
        });
      }
    });
    this.unsubs.push(unsubHost);

    this.events$.next({ type: 'open', playerId: this.playerId });
  }

  /**
   * HOST: Send a message to all players.
   * Writes to toPlayers/ so all player listeners pick it up.
   */
  async broadcast(message: GameMessage): Promise<void> {
    if (this.role === 'host') {
      const toPlayersRef = ref(this.db, `games/${this.gameCode}/toPlayers`);
      await push(toPlayersRef, message);
    } else if (this.role === 'player') {
      // Player sends to host
      const toHostRef = ref(this.db, `games/${this.gameCode}/toHost`);
      await push(toHostRef, { playerId: this.playerId, message });
    }
  }

  /**
   * Get this player's unique Firebase ID (used to identify answers)
   */
  getPlayerId(): string {
    return this.playerId;
  }

  /**
   * Clean up all listeners and remove game data
   */
  destroy(): void {
    this.unsubs.forEach((unsub) => unsub());
    this.unsubs = [];

    if (this.role === 'host' && this.gameCode) {
      const gameRef = ref(this.db, `games/${this.gameCode}`);
      remove(gameRef);
    }

    this.gameCode = '';
    this.role = null;
    this.playerId = '';
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
