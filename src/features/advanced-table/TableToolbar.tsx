interface TableToolbarProps {
  selectedCell: string | null;
  cellType?: string | null;
  hasMerge?: boolean;
  onClear: () => void;
  onDelete: () => void;
  onInsertRow: () => void;
  onInsertCol: () => void;
  onDeleteRow: () => void;
  onDeleteCol: () => void;
  onMerge?: () => void;
  onUnmerge?: () => void;
  onFormat?: () => void;
  onStyle?: () => void;
}

export function TableToolbar({
  selectedCell,
  cellType,
  hasMerge = false,
  onClear,
  onDelete,
  onInsertRow,
  onInsertCol,
  onDeleteRow,
  onDeleteCol,
  onMerge,
  onUnmerge,
  onFormat,
  onStyle,
}: TableToolbarProps) {
  return (
    <div className="flex items-center gap-2 mb-2 flex-wrap">
      <div className="px-2 py-1 text-sm border rounded bg-white">
        {selectedCell || "No cell"} {cellType ? `(${cellType})` : ""}
      </div>

      <div className="border-l h-6 mx-1" />

      {hasMerge ? (
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          onClick={onUnmerge}
          title="Unmerge Cells"
        >
          Unmerge
        </button>
      ) : (
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
          onClick={onMerge}
          disabled={!selectedCell}
          title="Merge Cells"
        >
          Merge
        </button>
      )}

      <button
        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        onClick={onFormat}
        disabled={!selectedCell}
        title="Format Cell"
      >
        Format
      </button>

      <button
        className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
        onClick={onStyle}
        disabled={!selectedCell}
        title="Style Cell"
      >
        Style
      </button>

      <div className="border-l h-6 mx-1" />

      <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300" onClick={onClear}>
        Clear
      </button>
      <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600" onClick={onDelete}>
        Delete Cell
      </button>

      <div className="border-l h-6 mx-1" />

      <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300" onClick={onInsertRow}>
        Insert Row
      </button>
      <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300" onClick={onInsertCol}>
        Insert Column
      </button>
      <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300" onClick={onDeleteRow}>
        Delete Row
      </button>
      <button className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300" onClick={onDeleteCol}>
        Delete Column
      </button>
    </div>
  );
}

