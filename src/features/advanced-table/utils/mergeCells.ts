import { cellToCoords, coordsToCell } from "./cellReference";
import { MergeInfo } from "../types";

/**
 * Get all cells in a rectangular range from start to end cell.
 */
export function getCellRange(startCell: string, endCell: string): string[] {
  if (!startCell || !endCell) {
    return [];
  }
  try {
    const start = cellToCoords(startCell);
    const end = cellToCoords(endCell);

    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    const cells: string[] = [];
    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        cells.push(coordsToCell(row, col));
      }
    }
    return cells;
  } catch (e) {
    return [];
  }
}

/**
 * Check if cells form a valid rectangular region that can be merged.
 */
export function canMerge(cells: string[]): boolean {
  if (cells.length < 2) return false;

  try {
    const coords = cells.map(cellToCoords);
    const rows = new Set(coords.map(c => c.row));
    const cols = new Set(coords.map(c => c.col));

    // Must form a rectangle (all combinations of rows and cols must be present)
    return cells.length === rows.size * cols.size;
  } catch (e) {
    return false;
  }
}

/**
 * Calculate merge info for a set of cells.
 * Assumes cells form a valid rectangular region.
 */
export function getMergeInfo(cells: string[]): MergeInfo | null {
  if (!canMerge(cells)) return null;

  try {
    const coords = cells.map(cellToCoords);
    const rows = coords.map(c => c.row);
    const cols = coords.map(c => c.col);

    const minRow = Math.min(...rows);
    const minCol = Math.min(...cols);
    const maxRow = Math.max(...rows);
    const maxCol = Math.max(...cols);

    const masterCell = coordsToCell(minRow, minCol);
    const colspan = maxCol - minCol + 1;
    const rowspan = maxRow - minRow + 1;

    return {
      master_cell: masterCell,
      colspan,
      rowspan,
    };
  } catch (e) {
    return null;
  }
}

/**
 * Check if a cell is part of a merge region.
 */
export function isCellInMerge(cell: string, mergeInfo: MergeInfo): boolean {
  if (!cell || !mergeInfo.master_cell) {
    return false;
  }
  try {
    const cellCoords = cellToCoords(cell);
    const masterCoords = cellToCoords(mergeInfo.master_cell);

    return (
      cellCoords.row >= masterCoords.row &&
      cellCoords.row < masterCoords.row + mergeInfo.rowspan &&
      cellCoords.col >= masterCoords.col &&
      cellCoords.col < masterCoords.col + mergeInfo.colspan
    );
  } catch (e) {
    return false;
  }
}

/**
 * Get all cells in a merge region.
 */
export function getCellsInMerge(mergeInfo: MergeInfo): string[] {
  if (!mergeInfo.master_cell) {
    return [];
  }
  try {
    const masterCoords = cellToCoords(mergeInfo.master_cell);
    const cells: string[] = [];

    for (let row = masterCoords.row; row < masterCoords.row + mergeInfo.rowspan; row++) {
      for (let col = masterCoords.col; col < masterCoords.col + mergeInfo.colspan; col++) {
        cells.push(coordsToCell(row, col));
      }
    }

    return cells;
  } catch (e) {
    return [];
  }
}

