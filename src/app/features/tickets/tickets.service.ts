import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';
import { Ticket, MockData } from './tickets.model';

// export interface Ticket {
//   id: number;
//   title: string;
//   description: string;
//   category: string;
// }

// export interface MockData {
//   tickets: Ticket[];
//   categories: Array<{ label: string; value: string }>;
// }

@Injectable({ providedIn: 'root' })
export class TicketsService {
  private _tickets$ = new BehaviorSubject<Ticket[]>([]);
  private mockData$: Observable<MockData>;

  constructor(private http: HttpClient) {
    this.mockData$ = this.http.get<MockData>('mock-data.json').pipe(
      tap((data) => this._tickets$.next(data.tickets)),
      shareReplay(1)
    );
    // Ensure mock data is loaded
    this.mockData$.subscribe({
      error: (err) => console.error('Failed to load mock data:', err),
    });
  }

  list(): Observable<Ticket[]> {
    return this._tickets$.asObservable();
  }

  create(payload: Omit<Ticket, 'id'>) {
    const current = this._tickets$.value;
    const nextId = current.length ? Math.max(...current.map((t) => t.id)) + 1 : 1;
    const created: Ticket = { id: nextId, ...payload };
    this._tickets$.next([...current, created]);
    return created;
  }
}
