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
import { TicketsService, Ticket, MockData } from './tickets.service';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tickets',
  standalone: true,
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
  template: `
    <div class="flex flex-col gap-4">
      <div class="flex justify-end">
        <button
          pButton
          type="button"
          label="Novo Chamado"
          class="p-button-success"
          (click)="showDialog = true"
        ></button>
      </div>

      <section class="shadow rounded p-4">
        <p-table
          #dt1
          [value]="tickets"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[10, 25, 50]"
          [globalFilterFields]="['title', 'description', 'category']"
          class="w-full"
        >
          <ng-template #caption>
            <div class="flex gap-2">
              <h2 class="text-lg font-semibold mb-4">Chamados</h2>
              <p-iconfield iconPosition="left" class="ml-auto">
                <p-inputicon>
                  <i class="pi pi-search"></i>
                </p-inputicon>
                <input
                  pInputText
                  type="text"
                  (input)="dt1.filterGlobal($event.target.value, 'contains')"
                  placeholder="Buscar..."
                />
              </p-iconfield>
            </div>
          </ng-template>
          <ng-template pTemplate="header">
            <tr>
              <th pSortableColumn="id">ID <p-sortIcon field="id"></p-sortIcon></th>
              <th>Título</th>
              <th>Descrição</th>
              <th pSortableColumn="category">
                Categoria
                <!-- <p-sortIcon field="category"></p-sortIcon> -->
                <p-columnFilter
                  field="category"
                  matchMode="equals"
                  display="menu"
                  [showMatchModes]="false"
                  [showOperator]="false"
                  [showAddButton]="false"
                >
                  <ng-template #filter let-value let-filter="filterCallback">
                    <p-select
                      [ngModel]="categoryFilterValue"
                      (ngModelChange)="categoryFilterValue = $event; filter($event)"
                      [options]="categories"
                      placeholder="Filtrar"
                      [showClear]="true"
                      optionLabel="label"
                      optionValue="value"
                      style="min-width: 12rem"
                    ></p-select>
                  </ng-template>
                </p-columnFilter>
              </th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-item>
            <tr>
              <td>{{ item.id }}</td>
              <td>{{ item.title }}</td>
              <td>{{ item.description }}</td>
              <td>{{ item.category }}</td>
            </tr>
          </ng-template>
        </p-table>
      </section>
    </div>

    <p-dialog
      [(visible)]="showDialog"
      header="Criar novo chamado"
      [modal]="true"
      [draggable]="false"
      [style]="{ width: '32rem' }"
      [breakpoints]="{ '960px': '75vw', '640px': '90vw' }"
      [appendTo]="'body'"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="block font-medium mb-2">Título</label>
          <input
            pInputText
            type="text"
            [(ngModel)]="form.title"
            placeholder="Título do chamado"
            class="w-full"
          />
        </div>

        <div>
          <label class="block font-medium mb-2">Descrição</label>
          <textarea
            pInputTextarea
            [(ngModel)]="form.description"
            rows="4"
            placeholder="Descreva o problema"
            class="w-full"
          ></textarea>
        </div>

        <div>
          <label class="block font-medium mb-2">Categoria</label>
          <p-select
            [(ngModel)]="form.category"
            [options]="categories"
            [appendTo]="'body'"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecione"
            class="w-full"
          ></p-select>
        </div>
      </div>

      <ng-template pTemplate="footer">
        <button
          pButton
          type="button"
          label="Cancelar"
          class="p-button-secondary"
          (click)="showDialog = false"
        ></button>
        <button
          pButton
          type="button"
          label="Salvar"
          class="p-button-success"
          (click)="save()"
        ></button>
      </ng-template>
    </p-dialog>
  `,
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
    this.http.get<MockData>('/mock-data.json').subscribe((data) => {
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
