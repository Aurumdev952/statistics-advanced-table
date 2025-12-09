import { CellConfig } from "./types";

interface FormulaBarProps {
  cellAddress: string | null;
  cellConfig?: CellConfig | null;
  displayValue?: any;
  onEdit?: () => void;
}

export function FormulaBar({ cellAddress, cellConfig, displayValue, onEdit }: FormulaBarProps) {
  const type = cellConfig?.type;
  const label = type ? type.charAt(0).toUpperCase() + type.slice(1) : "";

  let content = "";
  if (type === "formula") {
    content = cellConfig?.formula ?? "";
  } else if (type === "query") {
    const query = cellConfig?.query;
    if (query) {
      const measures = query.measures?.filter(m => m.field).map(m => m.field).join(", ") || "";
      const formula = query.formula ? ` [${query.formula}]` : "";
      content = `Query: ${measures}${formula}`;
    } else {
      content = "Query: Not configured";
    }
  } else if (type === "static") {
    content = cellConfig?.content ?? "";
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-gray-100 rounded border">
      <div className="text-sm font-semibold min-w-[60px]">{cellAddress || ""}</div>
      {type && (
        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
          {label}
        </span>
      )}
      <div className="flex-1 text-sm truncate">
        {content || (cellAddress ? "Empty cell" : "No cell selected")}
      </div>
      <div className="text-sm text-gray-600 min-w-[120px] text-right">
        {displayValue === null || displayValue === undefined ? "" : String(displayValue)}
      </div>
      {cellAddress && onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Edit
        </button>
      )}
    </div>
  );
}

