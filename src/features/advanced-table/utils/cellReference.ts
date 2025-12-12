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

export function translateCellReference(
  ref: string,
  sourceCell: string,
  targetCell: string
): string {
  try {
    const sourceCoords = cellToCoords(sourceCell);
    const targetCoords = cellToCoords(targetCell);

    const rowOffset = targetCoords.row - sourceCoords.row;
    const colOffset = targetCoords.col - sourceCoords.col;

    const parsed = parseCellReference(ref);

    const newRow = parsed.rowAbsolute ? parsed.row : parsed.row + rowOffset;
    const newCol = parsed.colAbsolute ? parsed.col : parsed.col + colOffset;

    const finalRow = Math.max(0, newRow);
    const finalCol = Math.max(0, newCol);

    return coordsToCell(finalRow, finalCol, parsed.rowAbsolute, parsed.colAbsolute);
  } catch (error) {
    return ref;
  }
}

export function translateRangeReference(
  rangeStr: string,
  sourceCell: string,
  targetCell: string
): string {
  try {
    const { start, end } = parseRange(rangeStr);
    const translatedStart = translateCellReference(start, sourceCell, targetCell);
    const translatedEnd = translateCellReference(end, sourceCell, targetCell);
    return `${translatedStart}:${translatedEnd}`;
  } catch (error) {
    return rangeStr;
  }
}

export function translateFormula(
  formula: string,
  sourceCell: string,
  targetCell: string
): string {
  if (!formula || !formula.startsWith("=")) {
    return formula;
  }

  try {
    const formulaBody = formula.substring(1);

    const cellRefPattern = /(\$?[A-Z]+\$?\d+)/gi;
    const rangePattern = /(\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+)/gi;

    let translated = formulaBody;

    translated = translated.replace(rangePattern, (match) => {
      return translateRangeReference(match, sourceCell, targetCell);
    });

    translated = translated.replace(cellRefPattern, (match) => {
      if (!isRange(match)) {
        return translateCellReference(match, sourceCell, targetCell);
      }
      return match;
    });

    return `=${translated}`;
  } catch (error) {
    return formula;
  }
}

