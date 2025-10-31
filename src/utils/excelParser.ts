import * as XLSX from 'xlsx';
import { ProductRow, ParsedData, PlanStats } from '@/types/excel';

// Regex to match day columns: PROG, REAL, SET-UP, RAMP
const DAY_COLUMN_REGEX = /^(PROG|REAL|SET-UP|RAMP)$/i;

export const parseExcelFile = async (file: File, targetDate?: Date, shift?: string): Promise<ParsedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as any[][];

        // Find header row (contains PRODUTO and CÓDIGO)
        let headerRowIndex = -1;
        for (let i = 0; i < jsonData.length; i++) {
          const row = jsonData[i];
          const hasProduct = row.some((cell: any) => 
            String(cell).toUpperCase().includes('PRODUTO')
          );
          const hasCode = row.some((cell: any) => 
            String(cell).toUpperCase().includes('CÓDIGO') || 
            String(cell).toUpperCase().includes('CODIGO')
          );
          
          if (hasProduct && hasCode) {
            headerRowIndex = i;
            break;
          }
        }

        if (headerRowIndex === -1) {
          throw new Error('Header row not found (looking for PRODUTO and CÓDIGO columns)');
        }

        const headers = jsonData[headerRowIndex].map((h: any) => String(h).trim());
        
        // Get date row (one row above header)
        const dateRow = headerRowIndex > 0 ? jsonData[headerRowIndex - 1] : [];
        
  // Find columns that match the target date (map them to the PROG column of that date group)
  const targetDateColumns: number[] = [];
        if (targetDate) {
          console.log('🔍 Target Date:', targetDate);
          console.log('📅 Date Row:', dateRow);
          
          dateRow.forEach((cell: any, index: number) => {
            if (cell) {
              let cellDate: Date | null = null;
              
              // Try parsing as date object
              if (cell instanceof Date) {
                cellDate = cell;
              } else {
                // Try parsing string date (format: "23/out" or "23-Oct")
                const dateStr = String(cell).trim();
                
                // Match "23/out" format
                const matchPt = dateStr.match(/(\d+)\/(\w+)/);
                if (matchPt) {
                  const day = parseInt(matchPt[1]);
                  const monthStr = matchPt[2].toLowerCase();
                  const monthMapPt: { [key: string]: number } = {
                    'jan': 0, 'fev': 1, 'mar': 2, 'abr': 3, 'mai': 4, 'jun': 5,
                    'jul': 6, 'ago': 7, 'set': 8, 'out': 9, 'nov': 10, 'dez': 11
                  };
                  const month = monthMapPt[monthStr];
                  if (month !== undefined) {
                    const year = targetDate.getFullYear();
                    cellDate = new Date(year, month, day);
                  }
                }
                
                // Match "23-Oct" format
                const matchEn = dateStr.match(/(\d+)-(\w+)/);
                if (matchEn && !cellDate) {
                  const day = parseInt(matchEn[1]);
                  const monthStr = matchEn[2];
                  const monthMap: { [key: string]: number } = {
                    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                  };
                  const month = monthMap[monthStr];
                  if (month !== undefined) {
                    const year = targetDate.getFullYear();
                    cellDate = new Date(year, month, day);
                  }
                }
              }
              
              // Check if dates match (same day, month, year)
              if (cellDate) {
                if (
                  cellDate.getDate() === targetDate.getDate() &&
                  cellDate.getMonth() === targetDate.getMonth()
                ) {
                  // Robustly find the "PROG" column within the next few columns of this date group.
                  // Many sheets merge the date cell across PROG/REAL/SET-UP/RAMP.
                  const SEARCH_WINDOW = 6; // be generous
                  let progIdx: number | null = null;
                  for (let off = 0; off < SEARCH_WINDOW; off++) {
                    const j = index + off;
                    const h = headers[j];
                    if (!h) continue;
                    if (String(h).toUpperCase().trim() === 'PROG') {
                      progIdx = j;
                      break;
                    }
                  }
                  const chosenIndex = progIdx ?? index;
                  if (!targetDateColumns.includes(chosenIndex)) {
                    console.log(`✅ Found date group at index ${index}; using PROG column index ${chosenIndex}`);
                    targetDateColumns.push(chosenIndex);
                  }
                }
              }
            }
          });
          
          console.log('📊 Target Date Columns:', targetDateColumns.map(idx => `${idx}: ${headers[idx]}`));
        }
        
        // Parse data rows
        const dataRows: ProductRow[] = [];
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
          const row = jsonData[i];
          const rowObj: any = {};
          
          headers.forEach((header, colIndex) => {
            rowObj[header] = row[colIndex] !== undefined ? String(row[colIndex]).trim() : '';
          });

          // Keep a reference to the raw cells so we can access columns by index
          // This avoids collisions when headers repeat (e.g., multiple REAL/PROG per dia)
          rowObj.__cells = row;

          // Skip if PRODUTO is empty
          const produto = rowObj['PRODUTO'] || rowObj['Produto'] || '';
          if (!produto) continue;

          dataRows.push(rowObj as ProductRow);
        }

        // Filter by shift if specified
        let filteredRows = dataRows;
        if (shift) {
          console.log(`🔄 Filtering by shift: ${shift}`);
          console.log(`📊 Total rows before shift filter: ${dataRows.length}`);
          
          filteredRows = dataRows.filter(row => {
            const turno = String(row['TURNO'] || '').trim();
            const linha = row['LINHA'] || '';
            const produto = row['PRODUTO'] || '';
            
            // Log first few rows to debug
            if (dataRows.indexOf(row) < 10) {
              console.log(`Row ${dataRows.indexOf(row)}: LINHA=${linha}, TURNO="${turno}", Match=${turno === shift}`);
            }
            
            return turno === shift;
          });
          
          console.log(`📊 Total rows after shift filter: ${filteredRows.length}`);
        }

  // If target date specified, filter by active products on that date
        let activeProducts = filteredRows;
        if (targetDate && targetDateColumns.length > 0) {
          console.log(`🔎 Filtering ${filteredRows.length} rows by target date columns...`);

          activeProducts = filteredRows.filter(row => {
            const linha = row['LINHA'] || '';
            const produto = row['PRODUTO'] || '';
            const turno = row['TURNO'] || '';

            // Check if any of the matched columns for the target date has a meaningful value
            const hasValue = targetDateColumns.some(colIndex => {
              const header = headers[colIndex];
              const rawCells = (row as any).__cells as any[] | undefined;
              const cellValue = rawCells ? rawCells[colIndex] : undefined;
              const valueStr = String(cellValue ?? '').trim();

              // Only consider columns whose header is exactly PROG for the selected date
              if (String(header).toUpperCase() !== 'PROG') return false;

              if (valueStr === '' || valueStr === 'undefined' || valueStr === 'null') {
                return false;
              }

              // Parse integer strictly for PROG
              const digits = valueStr.match(/\d+/g);
              if (!digits) return false;
              const n = Number(digits.join(''));
              return !isNaN(n) && n > 0;
            });

            if (hasValue) {
              console.log(`✅ Active: ${linha} - ${produto} (Turno ${turno})`);
            }

            return hasValue;
          });

          console.log(`✅ Found ${activeProducts.length} active products for target date`);
        } else if (targetDate && targetDateColumns.length === 0) {
          console.warn('⚠️ No columns found for target date!');
        }

        // Show ALL active rows (no dedup), because multiple SKUs can run in the same line/day
        const uniqueRows = activeProducts.filter(row => {
          const produto = row['PRODUTO'] || '';
          const linha = row['LINHA'] || '';
          return Boolean(produto) && Boolean(linha);
        });
        console.log(`🎯 Final rows: ${uniqueRows.length} (all active SKUs for the day/turno)`);

        // ===== Aggregate stats: OP list, total HCs, and total program for the target day =====
          // ===== Helpers for aggregates =====
          // Safer integer parser: capture only the FIRST numeric token (avoids concatenating multiple numbers).
          const toInt = (val: unknown): number => {
            if (val === undefined || val === null) return 0;
            if (typeof val === 'number') return Math.round(val);
            const s = String(val).trim();
            // Match first number like "1.234" or "1234"
            const m = s.match(/\d{1,3}(?:[\.\s]\d{3})+|\d+/);
            if (!m) return 0;
            const digitsOnly = m[0].replace(/[^\d]/g, '');
            const n = Number(digitsOnly);
            return Number.isFinite(n) ? n : 0;
          };

          // Try to detect OP and HC columns by header names
          const findHeaderIndex = (predicate: (h: string) => boolean): number => {
            return headers.findIndex(h => predicate(String(h).toUpperCase().trim()));
          };

          const opColIdx = findHeaderIndex(h => h === 'OP' || h.includes('ORDEM'));
          const hcColIdx = findHeaderIndex(h => h === 'HC' || h === 'HCS' || h === 'HCs'.toUpperCase());

          const opSet = new Set<string>();
          let totalHCs = 0;
          uniqueRows.forEach(row => {
            const cells = (row as any).__cells as any[] | undefined;
            if (opColIdx >= 0) {
              const opRaw = cells ? cells[opColIdx] : row['OP'];
              const op = String(opRaw ?? '').trim();
              if (op) opSet.add(op);
            }
            if (hcColIdx >= 0) {
              const hcRaw = cells ? cells[hcColIdx] : row['HC'] || row['HCS'] || (row as any)['HCs'];
              totalHCs += toInt(hcRaw);
            }
          });

          // Sum PROG only for the target date columns whose header is exactly PROG
          let totalProg = 0;
          if (targetDateColumns.length > 0) {
            uniqueRows.forEach(row => {
              const cells = (row as any).__cells as any[] | undefined;
              if (!cells) return;
              targetDateColumns.forEach(colIdx => {
                const header = headers[colIdx];
                if (DAY_COLUMN_REGEX.test(String(header)) && String(header).toUpperCase() === 'PROG') {
                  totalProg += toInt(cells[colIdx]);
                }
              });
            });
          }

          // Also embed per-row values for OP, HCs and PROG_DIA so the UI can show columns
          uniqueRows.forEach(row => {
            const cells = (row as any).__cells as any[] | undefined;
            if (opColIdx >= 0) {
              const opRaw = cells ? cells[opColIdx] : row['OP'] || row['ORDEM'] || row['Ordem'];
              (row as any).OP = String(opRaw ?? '').trim();
            }
            if (hcColIdx >= 0) {
              const hcRaw = cells ? cells[hcColIdx] : row['HC'] || row['HCS'] || (row as any)['HCs'];
              (row as any).HCs = toInt(hcRaw);
            }
            if (targetDateColumns.length > 0 && cells) {
              let rowProg = 0;
              targetDateColumns.forEach(colIdx => {
                const header = headers[colIdx];
                if (String(header).toUpperCase() === 'PROG') {
                  rowProg += toInt(cells[colIdx]);
                }
              });
              (row as any).PROG_DIA = rowProg;
            }
          });

          const stats: PlanStats = {
            opList: Array.from(opSet),
            totalHCs,
            totalProg,
          };

        resolve({
          headers,
          allRows: uniqueRows,
          dayData: [],
          stats,
        });

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
};

export const exportToXLSX = (data: ProductRow[], filename: string) => {
  // Select only key columns
  const exportData = data.map(row => ({
    LINHA: row.LINHA || '',
    TURNO: row.TURNO || '',
    CÓDIGO: row.CÓDIGO || row['CODIGO'] || '',
    PRODUTO: row.PRODUTO || '',
    OP: (row as any).OP || '',
    HCs: (row as any).HCs ?? '',
    PROG_DIA: (row as any).PROG_DIA ?? '',
    RATE: row.RATE || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plan');
  XLSX.writeFile(wb, filename);
};

export const exportToCSV = (data: ProductRow[], filename: string) => {
  const exportData = data.map(row => ({
    LINHA: row.LINHA || '',
    TURNO: row.TURNO || '',
    CÓDIGO: row.CÓDIGO || row['CODIGO'] || '',
    PRODUTO: row.PRODUTO || '',
    OP: (row as any).OP || '',
    HCs: (row as any).HCs ?? '',
    PROG_DIA: (row as any).PROG_DIA ?? '',
    RATE: row.RATE || ''
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const csv = XLSX.utils.sheet_to_csv(ws);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

// JSON do plano (ajustado):
// - Sem linhas duplicadas
// - Agrupa múltiplos SKUs por linha e turno (até 5 por linha)
// Novo schema:
// {
//   "reportDate": "yyyy-MM-dd" (opcional),
//   "entries": [ { "linha": string, "turno": number, "hcs": number, "skus": string[] } ]
// }

// Helper para formatar data como yyyy-MM-dd
const toIsoDate = (d: Date | string | undefined): string | undefined => {
  if (!d) return undefined;
  if (typeof d === 'string') {
    // Se já for yyyy-MM-dd mantem; senão tenta DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const m = d.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const [, dd, mm, yyyy] = m;
      return `${yyyy}-${mm}-${dd}`;
    }
    return d;
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// Novo formato solicitado: linha, turno, codigo (múltiplos SKUs), hcs, programado no dia, rate
export type PlanJsonEntry = {
  linha: string;
  turno: number;
  codigo: string[];         // lista de SKUs
  hcs: number;              // agregado (máximo) por linha/turno
  programado_dia: number[]; // por SKU (alinhado ao índice de `codigo`)
  rate: string[];           // por SKU (alinhado ao índice de `codigo`)
};
export type PlanJsonPayload = { reportDate?: string; entries: PlanJsonEntry[] };

export const buildPlanJSONPayload = (
  data: ProductRow[],
  opts?: { reportDate?: Date | string; maxSkusPerLinha?: number }
): PlanJsonPayload => {
  const maxPerLinha = opts?.maxSkusPerLinha ?? 5; // "para um, coloque mais 4 skus" => total 5

  // Agrupa por (LINHA, TURNO)
  const map = new Map<string, PlanJsonEntry>();
  const normInt = (v: any): number => {
    if (v === undefined || v === null) return 0;
    if (typeof v === 'number') return Math.round(v);
    const n = Number(String(v).replace(/[^\d]/g, ''));
    return Number.isFinite(n) ? n : 0;
  };

  data
    .filter((row) => Boolean(row.LINHA) && Boolean(row.CÓDIGO || (row as any)['CODIGO']))
    .forEach((row) => {
      const linha = String(row.LINHA ?? '').trim();
      const turnoNum = normInt(row.TURNO);
      const hcRaw = (row as any).HCs ?? (row as any)['HC'] ?? (row as any)['HCS'];
      const hcs = normInt(hcRaw);
      const sku = String(row.CÓDIGO ?? (row as any)['CODIGO'] ?? '').trim();
      const progDia = normInt((row as any).PROG_DIA);
      const rate = String(row.RATE ?? '').trim();

      const key = `${linha}|${turnoNum}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          linha,
          turno: turnoNum,
          codigo: sku ? [sku] : [],
          hcs,
          programado_dia: sku ? [progDia] : [],
          rate: sku ? [rate] : [],
        });
      } else {
        // Mantém o maior HCs entre itens agrupados
        if (hcs > existing.hcs) existing.hcs = hcs;
        if (sku) {
          const idx = existing.codigo.indexOf(sku);
          if (idx === -1) {
            if (existing.codigo.length < maxPerLinha) {
              existing.codigo.push(sku);
              existing.programado_dia.push(progDia);
              existing.rate.push(rate);
            }
          } else {
            // Mesma SKU repetida: acumula programado e mantém primeiro rate não vazio
            existing.programado_dia[idx] += progDia;
            if (!existing.rate[idx] && rate) existing.rate[idx] = rate;
          }
        }
      }
    });

  const entries = Array.from(map.values());
  return {
    reportDate: toIsoDate(opts?.reportDate ?? new Date()),
    entries,
  };
};

export const stringifyPlanJSON = (
  data: ProductRow[],
  opts?: { reportDate?: Date | string; maxSkusPerLinha?: number; pretty?: boolean }
): string => {
  const payload = buildPlanJSONPayload(data, opts);
  return JSON.stringify(payload, null, opts?.pretty === false ? undefined : 2);
};

export const copyPlanJSONToClipboard = async (
  data: ProductRow[],
  opts?: { reportDate?: Date | string; maxSkusPerLinha?: number; pretty?: boolean }
) => {
  const json = stringifyPlanJSON(data, { ...opts, pretty: true });
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(json);
    return true;
  }
  // Fallback
  const ta = document.createElement('textarea');
  ta.value = json;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  return ok;
};

export const exportToPlanJSON = (
  data: ProductRow[],
  filename: string,
  opts?: { reportDate?: Date | string; maxSkusPerLinha?: number; pretty?: boolean }
) => {
  const json = stringifyPlanJSON(data, { ...opts, pretty: true });
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
