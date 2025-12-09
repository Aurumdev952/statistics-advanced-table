import { useCallback } from "react";
import { cellToCoords, coordsToCell } from "../utils/cellReference";

interface KeyboardNavOptions {
  rows: number;
  cols: number;
  selectedCell: string | null;
  onSelect: (cell: string) => void;
  onEnterEdit: (cell: string) => void;
  onDelete: (cell: string) => void;
  onCopy: (cell: string) => void;
  onPaste: (cell: string) => void;
}

export function useKeyboardNavigation({
  rows,
  cols,
  selectedCell,
  onSelect,
  onEnterEdit,
  onDelete,
  onCopy,
  onPaste,
}: KeyboardNavOptions) {
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

  const moveSelection = useCallback(
    (dRow: number, dCol: number) => {
      if (!selectedCell) return;
      const { row, col } = cellToCoords(selectedCell);
      const nextRow = clamp(row + dRow, 0, rows - 1);
      const nextCol = clamp(col + dCol, 0, cols - 1);
      const nextCell = coordsToCell(nextRow, nextCol);
      onSelect(nextCell);
    },
    [selectedCell, rows, cols, onSelect]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputElement = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      
      if (isInputElement) {
        return;
      }

      if (!selectedCell) return;
      
      if (e.key === "ArrowUp") {
        e.preventDefault();
        moveSelection(-1, 0);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        moveSelection(1, 0);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        moveSelection(0, -1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        moveSelection(0, 1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        onEnterEdit(selectedCell);
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          moveSelection(0, -1);
        } else {
          moveSelection(0, 1);
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (!isInputElement) {
          e.preventDefault();
          onDelete(selectedCell);
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        onCopy(selectedCell);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        onPaste(selectedCell);
      }
    },
    [selectedCell, moveSelection, onEnterEdit, onDelete, onCopy, onPaste]
  );

  return { handleKeyDown, moveSelection };
}

