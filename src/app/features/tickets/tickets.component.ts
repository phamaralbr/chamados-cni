import { Component, OnDestroy, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TicketsService } from './tickets.service';
import { Ticket, MockData } from './tickets.model';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tickets',
  standalone: true,
  templateUrl: './tickets.component.html',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DialogModule,
    FormsModule,
    IconFieldModule,
    InputIconModule,
  ],
})
export class TicketsComponent implements OnInit, OnDestroy {
  tickets: Ticket[] = [];
  sub: Subscription;
  showDialog = false;
  categories: Array<{ label: string; value: string }> = [];
  categoryFilterValue: string | null = null;

  form: { title: string; description: string; category: string | null } = {
    title: '',
    description: '',
    category: null,
  };

  constructor(
    private ticketsService: TicketsService,
    private messageService: MessageService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.sub = this.ticketsService.list().subscribe((list) => {
      this.tickets = list;
      this.cdr.markForCheck();
    });
  }

  ngOnInit(): void {
    this.http.get<MockData>('mock-data.json').subscribe((data) => {
      this.categories = data.categories;
    });
  }

  save() {
    const title = (this.form.title || '').trim();
    const description = (this.form.description || '').trim();

    if (!title || !description) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro de validação',
        detail: 'Título e descrição são obrigatórios.',
      });
      return;
    }

    const category = this.form.category || 'other';
    this.ticketsService.create({ title, description, category });
    this.messageService.add({
      severity: 'success',
      summary: 'Salvo',
      detail: 'Chamado criado com sucesso.',
    });

    // reset form and close dialog
    this.form = { title: '', description: '', category: null };
    this.showDialog = false;
  }

  clear(dt: any): void {
    dt.clear();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
