import { useState } from "react";
import { CellConfig } from "../types";

export function useClipboard(cells: Record<string, CellConfig>) {
  const [clipboard, setClipboard] = useState<CellConfig | null>(null);

  const copyCell = (cell: string) => {
    const config = cells[cell];
    if (!config) return;
    setClipboard(config);
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(config)).catch(() => {});
    }
  };

  const pasteCell = (target: string): CellConfig | null => {
    if (clipboard) {
      return { ...clipboard };
    }
    return null;
  };

  return { clipboard, copyCell, pasteCell };
}

