import { useEffect, useMemo, useState } from "react";
import { FreeformModeConfig, CellConfig, MergeInfo, CellStyle } from "./types";
import { coordsToCell, cellToCoords, translateFormula } from "./utils/cellReference";
import { CellEditor } from "./CellEditor";
import { InlineCellEditor } from "./InlineCellEditor";
import { FormulaBar } from "./FormulaBar";
import { TableToolbar } from "./TableToolbar";
import { CellContextMenu } from "./CellContextMenu";
import { MergeCellDialog } from "./MergeCellDialog";
import { FormatPanel } from "./FormatPanel";
import { StylePanel } from "./StylePanel";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { useClipboard } from "./hooks/useClipboard";
import { getMergeInfo, canMerge, isCellInMerge, getCellsInMerge, getCellRange } from "./utils/mergeCells";
import { formatCellValue } from "./utils/cellFormatter";

interface FreeformModeTableProps {
  config: FreeformModeConfig;
  data?: any[];
  onCellUpdate?: (cellAddress: string, config: CellConfig) => void;
}

export function FreeformModeTable({ config, data, onCellUpdate }: FreeformModeTableProps) {
  const [localCells, setLocalCells] = useState<Record<string, CellConfig>>(config.cells || {});
  const [grid, setGrid] = useState(config.grid);
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [inlineEditCell, setInlineEditCell] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [showStyleDialog, setShowStyleDialog] = useState(false);

  useEffect(() => {
    setLocalCells(config.cells || {});
    setGrid(config.grid);
  }, [config]);

  const rows = grid.rows || 20;
  const cols = grid.columns || 10;

  const cellValues = useMemo(() => {
    const values: Record<string, any> = {};
    if (data && Array.isArray(data)) {
      for (const row of data) {
        if (row && typeof row === "object") {
          for (const [cellAddr, value] of Object.entries(row)) {
            if (cellAddr && /^[A-Z]+\d+$/.test(cellAddr)) {
              values[cellAddr] = value;
            }
          }
        }
      }
    }
    return values;
  }, [data]);

  const getCellValue = (cellAddr: string): any => {
    if (cellAddr in cellValues) {
      const value = cellValues[cellAddr];
      if (value === null || value === undefined) return "";
      return value;
    }
    const cellConfig = localCells[cellAddr];
    if (cellConfig && cellConfig.type === "static") {
      return cellConfig.content ?? "";
    }
    return "";
  };

  const getFormattedCellValue = (cellAddr: string): string => {
    const value = getCellValue(cellAddr);

    // If value is an array, it shouldn't be displayed - this indicates a bug
    // Arrays should have been filled into individual cells
    if (Array.isArray(value)) {
      console.warn(`Cell ${cellAddr} contains an array - this should not happen. Array values should be in filled cells.`);
      return ""; // Don't display arrays
    }

    const cellConfig = localCells[cellAddr];
    if (cellConfig?.formatting) {
      return formatCellValue(value, cellConfig.formatting);
    }
    return value === null || value === undefined ? "" : String(value);
  };

  const getCellStyle = (cellConfig: CellConfig | undefined): React.CSSProperties => {
    if (!cellConfig?.formatting?.style) {
      return {};
    }

    const style = cellConfig.formatting.style;
    const cssStyle: React.CSSProperties = {};

    if (style.background_color) {
      cssStyle.backgroundColor = style.background_color;
    }
    if (style.text_color) {
      cssStyle.color = style.text_color;
    }
    if (style.font_family) {
      cssStyle.fontFamily = style.font_family;
    }
    if (style.font_size) {
      cssStyle.fontSize = `${style.font_size}px`;
    }
    if (style.font_weight) {
      cssStyle.fontWeight = style.font_weight;
    }
    if (style.font_style) {
      cssStyle.fontStyle = style.font_style;
    }
    if (style.text_align) {
      cssStyle.textAlign = style.text_align;
    }
    if (style.vertical_align) {
      cssStyle.verticalAlign = style.vertical_align;
    }

    // Handle borders
    if (style.border_style && style.border_style !== "none") {
      const borderWidth = style.border_width || 1;
      const borderColor = style.border_color || "#000000";
      const borderStyle = style.border_style;

      if (style.border_top !== false) {
        cssStyle.borderTop = `${borderWidth}px ${borderStyle} ${borderColor}`;
      }
      if (style.border_right !== false) {
        cssStyle.borderRight = `${borderWidth}px ${borderStyle} ${borderColor}`;
      }
      if (style.border_bottom !== false) {
        cssStyle.borderBottom = `${borderWidth}px ${borderStyle} ${borderColor}`;
      }
      if (style.border_left !== false) {
        cssStyle.borderLeft = `${borderWidth}px ${borderStyle} ${borderColor}`;
      }
    }

    return cssStyle;
  };

  const getCellType = (cellAddr: string): string | null => {
    return localCells[cellAddr]?.type || null;
  };

  const updateCell = (cellAddr: string, newConfig: CellConfig) => {
    setLocalCells((prev) => ({ ...prev, [cellAddr]: newConfig }));
    onCellUpdate?.(cellAddr, newConfig);
  };

  const clearCell = (cellAddr: string) => {
    const newConfig: CellConfig = { type: "static", content: "" };
    updateCell(cellAddr, newConfig);
  };

  const deleteCell = (cellAddr: string) => {
    setLocalCells((prev) => {
      const next = { ...prev };
      delete next[cellAddr];
      return next;
    });
    onCellUpdate?.(cellAddr, { type: "static", content: "" });
  };

  const shiftCellsByRow = (startRow: number, delta: number) => {
    setLocalCells((prev) => {
      const entries = Object.entries(prev);
      const updated: Record<string, CellConfig> = {};
      for (const [addr, cfg] of entries) {
        const { row, col } = cellToCoords(addr);
        if (row >= startRow) {
          const newAddr = coordsToCell(row + delta, col);
          updated[newAddr] = cfg;
        } else {
          updated[addr] = cfg;
        }
      }
      return updated;
    });
  };

  const shiftCellsByCol = (startCol: number, delta: number) => {
    setLocalCells((prev) => {
      const entries = Object.entries(prev);
      const updated: Record<string, CellConfig> = {};
      for (const [addr, cfg] of entries) {
        const { row, col } = cellToCoords(addr);
        if (col >= startCol) {
          const newAddr = coordsToCell(row, col + delta);
          updated[newAddr] = cfg;
        } else {
          updated[addr] = cfg;
        }
      }
      return updated;
    });
  };

  const insertRow = () => {
    if (!selectedCell) return;
    const { row } = cellToCoords(selectedCell);
    shiftCellsByRow(row, 1);
    setGrid((prev) => ({ ...prev, rows: (prev.rows || 0) + 1 }));
  };

  const insertCol = () => {
    if (!selectedCell) return;
    const { col } = cellToCoords(selectedCell);
    shiftCellsByCol(col, 1);
    setGrid((prev) => ({ ...prev, columns: (prev.columns || 0) + 1 }));
  };

  const deleteRow = () => {
    if (!selectedCell) return;
    const { row } = cellToCoords(selectedCell);
    setLocalCells((prev) => {
      const entries = Object.entries(prev);
      const updated: Record<string, CellConfig> = {};
      for (const [addr, cfg] of entries) {
        const { row: r, col } = cellToCoords(addr);
        if (r === row) continue;
        if (r > row) {
          const newAddr = coordsToCell(r - 1, col);
          updated[newAddr] = cfg;
        } else {
          updated[addr] = cfg;
        }
      }
      return updated;
    });
    setGrid((prev) => ({ ...prev, rows: Math.max(1, (prev.rows || 1) - 1) }));
  };

  const deleteCol = () => {
    if (!selectedCell) return;
    const { col } = cellToCoords(selectedCell);
    setLocalCells((prev) => {
      const entries = Object.entries(prev);
      const updated: Record<string, CellConfig> = {};
      for (const [addr, cfg] of entries) {
        const { row, col: c } = cellToCoords(addr);
        if (c === col) continue;
        if (c > col) {
          const newAddr = coordsToCell(row, c - 1);
          updated[newAddr] = cfg;
        } else {
          updated[addr] = cfg;
        }
      }
      return updated;
    });
    setGrid((prev) => ({ ...prev, columns: Math.max(1, (prev.columns || 1) - 1) }));
  };

  // Build merge map from cell configs
  const mergeMap = useMemo(() => {
    const map: Record<string, MergeInfo> = {};
    for (const [cellAddr, cellConfig] of Object.entries(localCells)) {
      if (cellConfig.merge_info && cellConfig.merge_info.master_cell) {
        const masterCell = cellConfig.merge_info.master_cell;
        // Validate master_cell is a valid cell reference
        if (masterCell && /^[A-Z]+\d+$/i.test(masterCell)) {
          map[masterCell] = cellConfig.merge_info;
        }
      }
    }
    return map;
  }, [localCells]);

  // Get merge info for a cell
  const getMergeInfoForCell = (cellAddr: string): MergeInfo | null => {
    if (!cellAddr || !/^[A-Z]+\d+$/i.test(cellAddr)) {
      return null;
    }
    // Check if this cell is a master cell
    if (mergeMap[cellAddr]) {
      return mergeMap[cellAddr];
    }
    // Check if this cell is part of any merge
    for (const mergeInfo of Object.values(mergeMap)) {
      if (mergeInfo.master_cell && /^[A-Z]+\d+$/i.test(mergeInfo.master_cell)) {
        try {
          if (isCellInMerge(cellAddr, mergeInfo)) {
            return mergeInfo;
          }
        } catch (e) {
          // Skip invalid merge info
          continue;
        }
      }
    }
    return null;
  };

  // Check if cell is master of a merge
  const isMasterCell = (cellAddr: string): boolean => {
    return mergeMap[cellAddr] !== undefined;
  };

  // Check if cell is part of a merge (but not master)
  const isMergedCell = (cellAddr: string): boolean => {
    const mergeInfo = getMergeInfoForCell(cellAddr);
    if (!mergeInfo) return false;
    return mergeInfo.master_cell !== cellAddr;
  };

  // Merge cells
  const mergeCells = (cells: string[]) => {
    if (!canMerge(cells)) {
      alert("Selected cells must form a rectangular region to merge");
      return;
    }

    const mergeInfo = getMergeInfo(cells);
    if (!mergeInfo) return;

    const masterCell = mergeInfo.master_cell;
    setLocalCells((prev) => {
      const updated = { ...prev };

      // Get master cell config or create new one
      const masterConfig = updated[masterCell] || { type: "static", content: "" };

      // Set merge info on master cell
      updated[masterCell] = {
        ...masterConfig,
        merge_info: mergeInfo,
      };

      // Remove merge info from other cells in the range (they become part of the merge)
      for (const cell of cells) {
        if (cell !== masterCell && updated[cell]) {
          const cellConfig = { ...updated[cell] };
          delete cellConfig.merge_info;
          updated[cell] = cellConfig;
        }
      }

      return updated;
    });

    // Update master cell via callback
    const masterConfig = localCells[masterCell] || { type: "static", content: "" };
    onCellUpdate?.(masterCell, { ...masterConfig, merge_info: mergeInfo });
    setShowMergeDialog(false);
  };

  const handleMergeClick = () => {
    if (!selectedCell) return;
    setShowMergeDialog(true);
  };

  const handleFormatClick = () => {
    setShowFormatDialog(true);
  };

  const handleStyleClick = () => {
    setShowStyleDialog(true);
  };

  const handleContextMenu = (e: React.MouseEvent, cellAddr: string) => {
    e.preventDefault();
    setSelectedCell(cellAddr);
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleFormattingChange = (newFormatting: any) => {
    if (!selectedCell) return;
    const cellConfig = localCells[selectedCell] || { type: "static", content: "" };
    updateCell(selectedCell, { ...cellConfig, formatting: newFormatting });
  };

  // Unmerge cell
  const unmergeCell = (cellAddr: string) => {
    const mergeInfo = getMergeInfoForCell(cellAddr);
    if (!mergeInfo) return;

    const masterCell = mergeInfo.master_cell;
    setLocalCells((prev) => {
      const updated = { ...prev };

      // Remove merge info from master cell
      if (updated[masterCell]) {
        const masterConfig = { ...updated[masterCell] };
        delete masterConfig.merge_info;
        updated[masterCell] = masterConfig;
      }

      return updated;
    });

    // Update master cell via callback
    const masterConfig = localCells[masterCell];
    if (masterConfig) {
      const { merge_info, ...rest } = masterConfig;
      onCellUpdate?.(masterCell, rest);
    }
  };

  const { copyCell, pasteCell } = useClipboard(localCells);
  const [copiedSourceCell, setCopiedSourceCell] = useState<string | null>(null);

  const handleDelete = (cell: string) => {
    deleteCell(cell);
  };

  const handleCopy = (cell: string) => {
    const cellConfig = localCells[cell];
    if (cellConfig?.type === "formula") {
      setCopiedSourceCell(cell);
    } else {
      setCopiedSourceCell(null);
    }
    copyCell(cell);
  };

  const handlePaste = (cell: string) => {
    const cfg = pasteCell(cell);
    if (cfg) {
      let translatedConfig = { ...cfg };

      if (cfg.type === "formula" && cfg.formula && copiedSourceCell) {
        const translatedFormula = translateFormula(
          cfg.formula,
          copiedSourceCell,
          cell
        );
        translatedConfig = {
          ...cfg,
          formula: translatedFormula,
        };
      }

      updateCell(cell, translatedConfig);
    }
  };

  const { handleKeyDown } = useKeyboardNavigation({
    rows,
    cols,
    selectedCell,
    onSelect: setSelectedCell,
    onEnterEdit: (cell) => setInlineEditCell(cell),
    onDelete: handleDelete,
    onCopy: handleCopy,
    onPaste: handlePaste,
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleKeyDown]);

  const availableCells = Object.keys(localCells);

  return (
    <div className="freeform-table-container">
      <TableToolbar
        selectedCell={selectedCell}
        cellType={selectedCell ? getCellType(selectedCell) : null}
        hasMerge={selectedCell ? getMergeInfoForCell(selectedCell) !== null : false}
        onClear={() => selectedCell && clearCell(selectedCell)}
        onDelete={() => selectedCell && deleteCell(selectedCell)}
        onInsertRow={insertRow}
        onInsertCol={insertCol}
        onDeleteRow={deleteRow}
        onDeleteCol={deleteCol}
        onMerge={handleMergeClick}
        onUnmerge={() => selectedCell && unmergeCell(selectedCell)}
        onFormat={handleFormatClick}
        onStyle={handleStyleClick}
      />
      <FormulaBar
        cellAddress={selectedCell}
        cellConfig={selectedCell ? localCells[selectedCell] : null}
        displayValue={selectedCell ? getCellValue(selectedCell) : ""}
        onEdit={() => selectedCell && setEditingCell(selectedCell)}
      />

      <div className="table-wrapper overflow-auto border rounded mt-2">
        <table className="freeform-table border-collapse w-full">
          <thead>
            <tr>
              <th className="w-12 p-2 bg-gray-100 border sticky left-0 z-10"></th>
              {Array.from({ length: cols }, (_, i) => (
                <th key={i} className="w-24 p-2 bg-gray-100 border text-center">
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, rowIdx) => (
              <tr key={rowIdx}>
                <td className="w-12 p-2 bg-gray-100 border sticky left-0 z-10 text-center font-semibold">
                  {rowIdx + 1}
                </td>
                {Array.from({ length: cols }, (_, colIdx) => {
                  const cellAddr = coordsToCell(rowIdx, colIdx);
                  const mergeInfo = getMergeInfoForCell(cellAddr);
                  const isMerged = isMergedCell(cellAddr);

                  // Skip rendering if this cell is part of a merge but not the master
                  if (isMerged) {
                    return null;
                  }

                  const masterCellAddr = mergeInfo?.master_cell || cellAddr;
                  const value = getFormattedCellValue(masterCellAddr);
                  const cellType = getCellType(masterCellAddr);
                  const isSelected = selectedCell === cellAddr || (mergeInfo && isCellInMerge(selectedCell || "", mergeInfo));
                  const isEditing = editingCell === cellAddr;
                  const isInline = inlineEditCell === cellAddr;
                  const cellConfig = localCells[masterCellAddr];
                  const cellStyle = getCellStyle(cellConfig);

                  const bg =
                    cellType === "query"
                      ? "bg-purple-50"
                      : cellType === "formula"
                      ? "bg-green-50"
                      : "bg-white";

                  const colspan = mergeInfo?.colspan || 1;
                  const rowspan = mergeInfo?.rowspan || 1;

                  return (
                    <td
                      key={colIdx}
                      colSpan={colspan}
                      rowSpan={rowspan}
                      style={cellStyle}
                      className={`p-1 border min-w-[100px] ${isSelected ? "outline outline-2 outline-blue-400" : ""} ${bg} cursor-pointer hover:bg-gray-50 relative`}
                      onClick={() => setSelectedCell(masterCellAddr)}
                      onDoubleClick={() => setInlineEditCell(masterCellAddr)}
                      onContextMenu={(e) => handleContextMenu(e, masterCellAddr)}
                    >
                      {isEditing ? (
                        <div className="absolute z-50 bg-white border rounded shadow-lg p-2" style={{ minWidth: "320px", left: "100%", top: 0, marginLeft: "4px" }}>
                          <CellEditor
                            cellConfig={cellConfig || null}
                            cellAddress={masterCellAddr}
                            onSave={(cfg) => {
                              updateCell(masterCellAddr, cfg);
                              setEditingCell(null);
                            }}
                            onCancel={() => setEditingCell(null)}
                            onDelete={() => {
                              deleteCell(masterCellAddr);
                              setEditingCell(null);
                            }}
                            availableCells={availableCells}
                          />
                        </div>
                      ) : isInline ? (
                        <InlineCellEditor
                          initialValue={cellConfig?.type === "formula" ? cellConfig.formula || "" : String(value || "")}
                          onSubmit={(val) => {
                            const trimmed = val || "";
                            const existingConfig = localCells[masterCellAddr] || {};
                            if (trimmed.startsWith("=")) {
                              updateCell(masterCellAddr, {
                                ...existingConfig,
                                type: "formula",
                                formula: trimmed,
                              });
                            } else {
                              updateCell(masterCellAddr, {
                                ...existingConfig,
                                type: "static",
                                content: trimmed,
                              });
                            }
                            setInlineEditCell(null);
                          }}
                          onCancel={() => setInlineEditCell(null)}
                          onTab={() => {
                            setInlineEditCell(null);
                            const { col } = cellToCoords(masterCellAddr);
                            const nextCol = Math.min(cols - 1, col + 1);
                            setSelectedCell(coordsToCell(rowIdx, nextCol));
                          }}
                          onShiftTab={() => {
                            setInlineEditCell(null);
                            const { col } = cellToCoords(masterCellAddr);
                            const prevCol = Math.max(0, col - 1);
                            setSelectedCell(coordsToCell(rowIdx, prevCol));
                          }}
                        />
                      ) : (
                        <div className="text-sm">
                          {value}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {contextMenu && selectedCell && (
        <CellContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          cellConfig={localCells[selectedCell] || null}
          hasMerge={getMergeInfoForCell(selectedCell) !== null}
          onMerge={handleMergeClick}
          onUnmerge={() => {
            unmergeCell(selectedCell);
            setContextMenu(null);
          }}
          onFormat={handleFormatClick}
          onStyle={handleStyleClick}
          onClose={() => setContextMenu(null)}
        />
      )}

      {showMergeDialog && selectedCell && (
        <MergeCellDialog
          startCell={selectedCell}
          endCell={selectedCell}
          onConfirm={mergeCells}
          onCancel={() => setShowMergeDialog(false)}
        />
      )}

      {showFormatDialog && selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Format Cell</h3>
            <FormatPanel
              formatting={localCells[selectedCell]?.formatting}
              previewValue={getCellValue(selectedCell)}
              onChange={handleFormattingChange}
            />
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowFormatDialog(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showStyleDialog && selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Style Cell</h3>
            <StylePanel
              formatting={localCells[selectedCell]?.formatting}
              onChange={handleFormattingChange}
            />
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowStyleDialog(false)}
                className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

