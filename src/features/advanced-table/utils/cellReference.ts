export interface CellCoords {
  row: number;
  col: number;
}

export interface ParsedCellRef {
  row: number;
  col: number;
  rowAbsolute: boolean;
  colAbsolute: boolean;
}

export function cellToCoords(cell: string): CellCoords {
  const match = cell.match(/^\$?([A-Z]+)\$?(\d+)$/i);
  if (!match) {
    throw new Error(`Invalid cell reference: ${cell}`);
  }

  const colStr = match[1].toUpperCase();
  const rowStr = match[2];

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  col -= 1;

  const row = parseInt(rowStr, 10) - 1;

  return { row, col };
}

export function coordsToCell(row: number, col: number, rowAbs = false, colAbs = false): string {
  let colStr = "";
  let colNum = col + 1;

  while (colNum > 0) {
    colNum -= 1;
    colStr = String.fromCharCode(65 + (colNum % 26)) + colStr;
    colNum = Math.floor(colNum / 26);
  }

  const rowStr = String(row + 1);

  let result = "";
  if (colAbs) result += "$";
  result += colStr;
  if (rowAbs) result += "$";
  result += rowStr;

  return result;
}

export function parseCellReference(ref: string): ParsedCellRef {
  const match = ref.match(/^(\$?)([A-Z]+)(\$?)(\d+)$/i);
  if (!match) {
    throw new Error(`Invalid cell reference: ${ref}`);
  }

  const colAbs = match[1] === "$";
  const colStr = match[2].toUpperCase();
  const rowAbs = match[3] === "$";
  const rowStr = match[4];

  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 64);
  }
  col -= 1;

  const row = parseInt(rowStr, 10) - 1;

  return {
    row,
    col,
    rowAbsolute: rowAbs,
    colAbsolute: colAbs,
  };
}

export function parseRange(range: string): { start: string; end: string } {
  const parts = range.split(":");
  if (parts.length !== 2) {
    throw new Error(`Invalid range: ${range}`);
  }
  return { start: parts[0], end: parts[1] };
}

export function expandRange(range: string): string[] {
  try {
    const { start, end } = parseRange(range);
    const startCoords = cellToCoords(start);
    const endCoords = cellToCoords(end);

    const cells: string[] = [];
    const minRow = Math.min(startCoords.row, endCoords.row);
    const maxRow = Math.max(startCoords.row, endCoords.row);
    const minCol = Math.min(startCoords.col, endCoords.col);
    const maxCol = Math.max(startCoords.col, endCoords.col);

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        cells.push(coordsToCell(row, col));
      }
    }

    return cells;
  } catch (error) {
    return [];
  }
}

export function isCellReference(str: string): boolean {
  return /^\$?[A-Z]+\$?\d+$/i.test(str);
}

export function isRange(str: string): boolean {
  return /^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+$/i.test(str);
}

