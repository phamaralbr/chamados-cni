import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'chamados',
    loadComponent: () =>
      import('./features/tickets/tickets.component').then((m) => m.TicketsComponent),
  },
  { path: '', pathMatch: 'full', redirectTo: 'chamados' },
  { path: '**', redirectTo: '' },
];
