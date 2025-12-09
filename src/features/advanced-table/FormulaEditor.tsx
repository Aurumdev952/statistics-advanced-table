import { useState, useRef, useEffect } from "react";
import { useFormulaAutocomplete } from "./hooks/useFormulaAutocomplete";
import { coordsToCell } from "./utils/cellReference";

interface FormulaEditorProps {
  formula: string;
  onChange: (formula: string) => void;
  onBlur?: () => void;
  onInsertCell?: (cell: string) => void;
  availableCells?: string[];
}

export function FormulaEditor({
  formula,
  onChange,
  onBlur,
  onInsertCell,
  availableCells = [],
}: FormulaEditorProps) {
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { suggestions, selectedIndex, setSelectedIndex, hasSuggestions, selectSuggestion } =
    useFormulaAutocomplete(formula, cursorPos);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setSelectionRange(cursorPos, cursorPos);
    }
  }, [cursorPos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const newCursorPos = e.target.selectionStart || 0;
    onChange(newValue);
    setCursorPos(newCursorPos);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (hasSuggestions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        return;
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        return;
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        const suggestion = selectSuggestion(selectedIndex);
        if (suggestion) {
          const beforeCursor = formula.slice(0, cursorPos);
          const match = beforeCursor.match(/([A-Z_]*)$/i);
          if (match) {
            const prefix = match[1];
            const newFormula = formula.slice(0, cursorPos - prefix.length) + suggestion + "(" + formula.slice(cursorPos);
            onChange(newFormula);
            const newPos = cursorPos - prefix.length + suggestion.length + 1;
            setCursorPos(newPos);
            setTimeout(() => {
              if (inputRef.current) {
                inputRef.current.setSelectionRange(newPos, newPos);
              }
            }, 0);
          }
        }
        return;
      }
    }

    if (e.key === "Escape") {
      e.stopPropagation();
      onBlur?.();
    }
  };

  const handleCellClick = (cell: string) => {
    if (onInsertCell) {
      onInsertCell(cell);
    }
  };

  return (
    <div className="formula-editor">
      <input
        ref={inputRef}
        type="text"
        value={formula}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        onSelect={(e) => {
          const target = e.target as HTMLInputElement;
          setCursorPos(target.selectionStart || 0);
        }}
        placeholder="Enter formula (e.g., =A1+B2)"
        className="w-full px-2 py-1 border rounded"
      />
      {hasSuggestions && (
        <div className="autocomplete-dropdown absolute bg-white border rounded shadow-lg z-50 max-h-40 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-2 py-1 cursor-pointer ${
                index === selectedIndex ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
              onClick={() => {
                const beforeCursor = formula.slice(0, cursorPos);
                const match = beforeCursor.match(/([A-Z_]*)$/i);
                if (match) {
                  const prefix = match[1];
                  const newFormula = formula.slice(0, cursorPos - prefix.length) + suggestion + "(" + formula.slice(cursorPos);
                  onChange(newFormula);
                  setCursorPos(cursorPos - prefix.length + suggestion.length + 1);
                }
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      {availableCells.length > 0 && (
        <div className="cell-picker mt-2">
          <div className="text-sm font-semibold mb-1">Available Cells:</div>
          <div className="flex flex-wrap gap-1">
            {availableCells.map((cell) => (
              <button
                key={cell}
                type="button"
                onClick={() => handleCellClick(cell)}
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                {cell}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

