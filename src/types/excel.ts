export interface ProductRow {
  LINHA: string;
  TURNO: string;
  CÓDIGO: string;
  PRODUTO: string;
  RATE?: string;
  // Campos normalizados adicionados pelo parser (quando disponíveis)
  OP?: string;       // Ordem de Produção da linha/produto
  HCs?: number;      // Quantidade de HCs para a linha/produto
  PROG_DIA?: number; // Programação total para o produto no dia selecionado
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
  stats?: PlanStats;
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

export interface PlanStats {
  opList: string[]; // Distinct OPs present among active items
  totalHCs: number; // Sum of HC/HCs column across active items
  totalProg: number; // Sum of PROG for the target day only
}
