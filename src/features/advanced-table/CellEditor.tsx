import { useState, useEffect } from "react";
import { CellConfig, CellType, CellFormatting } from "./types";
import { FormulaEditor } from "./FormulaEditor";
import { QueryCellEditor } from "./QueryCellEditor";
import { FormatPanel } from "./FormatPanel";
import { StylePanel } from "./StylePanel";

interface CellEditorProps {
  cellConfig: CellConfig | null;
  cellAddress: string;
  onSave: (config: CellConfig) => void;
  onCancel: () => void;
  onDelete?: () => void;
  availableCells?: string[];
}

export function CellEditor({
  cellConfig,
  cellAddress,
  onSave,
  onCancel,
  onDelete,
  availableCells = [],
}: CellEditorProps) {
  const [type, setType] = useState<CellType>(cellConfig?.type || "static");
  const [content, setContent] = useState<any>(cellConfig?.content ?? "");
  const [formula, setFormula] = useState<string>(cellConfig?.formula ?? "");
  const [showQueryEditor, setShowQueryEditor] = useState(type === "query");
  const [formatting, setFormatting] = useState<CellFormatting | undefined>(cellConfig?.formatting);
  const [activeTab, setActiveTab] = useState<"content" | "format">("content");

  useEffect(() => {
    if (cellConfig) {
      setType(cellConfig.type);
      setContent(cellConfig.content ?? "");
      setFormula(cellConfig.formula ?? "");
      setShowQueryEditor(cellConfig.type === "query");
      setFormatting(cellConfig.formatting);
    }
  }, [cellConfig]);

  const handleSave = () => {
    const newConfig: CellConfig = {
      type,
      ...(type === "static" ? { content } : {}),
      ...(type === "formula" ? { formula } : {}),
      ...(type === "query" ? { query: cellConfig?.query } : {}),
      ...(formatting ? { formatting } : {}),
    };
    onSave(newConfig);
  };

  const handleInsertCell = (cell: string) => {
    if (type === "formula") {
      const currentFormula = formula || "=";
      const newFormula = currentFormula.endsWith("=") ? currentFormula + cell : currentFormula + cell;
      setFormula(newFormula);
    }
  };

  return (
    <div className="cell-editor p-4 border rounded bg-white shadow-lg min-w-[360px] space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Cell {cellAddress}</div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("static")}
            className={`px-3 py-1 rounded text-xs ${type === "static" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Static
          </button>
          <button
            type="button"
            onClick={() => setType("formula")}
            className={`px-3 py-1 rounded text-xs ${type === "formula" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Formula
          </button>
          <button
            type="button"
            onClick={() => {
              setType("query");
              setShowQueryEditor(true);
            }}
            className={`px-3 py-1 rounded text-xs ${type === "query" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            Query
          </button>
        </div>
      </div>

      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`px-4 py-2 text-sm ${activeTab === "content" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
        >
          Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("format")}
          className={`px-4 py-2 text-sm ${activeTab === "format" ? "border-b-2 border-blue-500 font-semibold" : ""}`}
        >
          Format & Style
        </button>
      </div>

      {activeTab === "content" && (
        <>
          {type === "static" && (
            <div className="space-y-2">
              <div className="text-sm font-semibold">Value</div>
              <input
                type="text"
                value={content}
                onChange={(e) => {
                  e.stopPropagation();
                  setContent(e.target.value);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter value"
              />
            </div>
          )}

          {type === "formula" && (
            <div className="space-y-2">
              <div className="text-sm font-semibold">Formula</div>
              <FormulaEditor
                formula={formula}
                onChange={setFormula}
                onInsertCell={handleInsertCell}
                availableCells={availableCells}
              />
            </div>
          )}

          {type === "query" && (
            <div className="space-y-2">
              {showQueryEditor ? (
                <QueryCellEditor
                  queryConfig={cellConfig?.query || null}
                  onSave={(queryConfig) => {
                    const newConfig: CellConfig = {
                      type: "query",
                      query: queryConfig,
                    };
                    onSave(newConfig);
                    setShowQueryEditor(false);
                  }}
                  onCancel={() => setShowQueryEditor(false)}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    {cellConfig?.query?.dataset_id ? `Dataset: ${cellConfig.query.dataset_id}` : "Not configured"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQueryEditor(true)}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                  >
                    Edit Query
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {activeTab === "format" && (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          <FormatPanel
            formatting={formatting}
            previewValue={type === "static" ? content : undefined}
            onChange={setFormatting}
          />
          <div className="border-t pt-4">
            <StylePanel
              formatting={formatting}
              onChange={setFormatting}
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-between pt-2">
        <button
          type="button"
          onClick={onDelete}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Delete
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

