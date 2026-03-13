import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';
import Peer, { DataConnection } from 'peerjs';
import { GameMessage } from '../models/message.model';

const PEER_PREFIX = 'quizgame-';

export interface PeerEvent {
  type: 'message' | 'player-connected' | 'player-disconnected' | 'error' | 'open';
  peerId?: string;
  data?: GameMessage;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class PeerService {
  private peer: Peer | null = null;
  private connections = new Map<string, DataConnection>();
  private events$ = new Subject<PeerEvent>();

  readonly events = this.events$.asObservable();

  constructor(private zone: NgZone) {}

  createHost(gameCode: string): Promise<string> {
    const peerId = PEER_PREFIX + gameCode;
    return new Promise((resolve, reject) => {
      this.peer = new Peer(peerId);

      this.peer.on('open', (id) => {
        this.zone.run(() => {
          this.events$.next({ type: 'open', peerId: id });
          resolve(id);
        });
      });

      this.peer.on('connection', (conn) => {
        conn.on('open', () => {
          this.zone.run(() => {
            this.connections.set(conn.peer, conn);
            this.events$.next({ type: 'player-connected', peerId: conn.peer });
          });
        });

        conn.on('data', (data) => {
          this.zone.run(() => {
            this.events$.next({
              type: 'message',
              peerId: conn.peer,
              data: data as GameMessage,
            });
          });
        });

        conn.on('close', () => {
          this.zone.run(() => {
            this.connections.delete(conn.peer);
            this.events$.next({ type: 'player-disconnected', peerId: conn.peer });
          });
        });
      });

      this.peer.on('error', (err) => {
        this.zone.run(() => {
          this.events$.next({ type: 'error', error: err.message });
          reject(err);
        });
      });
    });
  }

  connectToHost(gameCode: string): Promise<void> {
    const hostPeerId = PEER_PREFIX + gameCode.toUpperCase();
    return new Promise((resolve, reject) => {
      this.peer = new Peer();

      this.peer.on('open', () => {
        const conn = this.peer!.connect(hostPeerId, { reliable: true });

        conn.on('open', () => {
          this.zone.run(() => {
            this.connections.set(hostPeerId, conn);
            this.events$.next({ type: 'open', peerId: this.peer!.id! });
            resolve();
          });
        });

        conn.on('data', (data) => {
          this.zone.run(() => {
            this.events$.next({
              type: 'message',
              peerId: hostPeerId,
              data: data as GameMessage,
            });
          });
        });

        conn.on('close', () => {
          this.zone.run(() => {
            this.events$.next({ type: 'player-disconnected', peerId: hostPeerId });
          });
        });

        conn.on('error', (err) => {
          this.zone.run(() => {
            this.events$.next({ type: 'error', error: err.message });
            reject(err);
          });
        });
      });

      this.peer.on('error', (err) => {
        this.zone.run(() => {
          this.events$.next({ type: 'error', error: err.message });
          reject(err);
        });
      });
    });
  }

  send(peerId: string, message: GameMessage): void {
    const conn = this.connections.get(peerId);
    if (conn?.open) {
      conn.send(message);
    }
  }

  broadcast(message: GameMessage): void {
    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  destroy(): void {
    this.connections.forEach((conn) => conn.close());
    this.connections.clear();
    this.peer?.destroy();
    this.peer = null;
  }
}
