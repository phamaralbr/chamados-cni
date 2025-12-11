export interface Ticket {
  id: number;
  title: string;
  description: string;
  category: string;
}

export interface MockData {
  tickets: Ticket[];
  categories: Array<{ label: string; value: string }>;
}
