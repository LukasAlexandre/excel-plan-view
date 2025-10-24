export interface ProductRow {
  LINHA: string;
  TURNO: string;
  CÓDIGO: string;
  PRODUTO: string;
  RATE?: string;
  [key: string]: any;
}

export interface DayData {
  day: string;
  dayName: string;
  date?: string;
  products: ProductRow[];
}

export interface ParsedData {
  headers: string[];
  allRows: ProductRow[];
  dayData: DayData[];
}

export interface ShiftSelection {
  shift: '1' | '2';
  date?: Date;
}

export interface DayColumns {
  dayIndex: number;
  columns: string[];
  date?: string;
}
