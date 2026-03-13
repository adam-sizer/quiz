import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./home/home').then((m) => m.Home) },
  { path: 'host', loadComponent: () => import('./host/host').then((m) => m.Host) },
  { path: 'join', loadComponent: () => import('./player/player-join').then((m) => m.PlayerJoin) },
  { path: 'play', loadComponent: () => import('./player/player').then((m) => m.Player) },
  { path: '**', redirectTo: '' },
];
