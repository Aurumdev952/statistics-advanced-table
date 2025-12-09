import { useState, useMemo } from "react";

const EXCEL_FUNCTIONS = [
  "SUM",
  "AVERAGE",
  "AVG",
  "MIN",
  "MAX",
  "COUNT",
  "IF",
  "IFS",
  "SWITCH",
  "MEDIAN",
  "STDEV",
  "VAR",
  "PERCENTILE",
] as const;

export function useFormulaAutocomplete(formula: string, cursorPosition: number) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const suggestions = useMemo(() => {
    if (!formula || cursorPosition < 0) {
      return [];
    }

    const beforeCursor = formula.slice(0, cursorPosition);
    const match = beforeCursor.match(/([A-Z_]*)$/i);
    if (!match) {
      return [];
    }

    const prefix = match[1].toUpperCase();
    if (prefix.length === 0) {
      return [];
    }

    return EXCEL_FUNCTIONS.filter((fn) => fn.startsWith(prefix)).slice(0, 10);
  }, [formula, cursorPosition]);

  const hasSuggestions = suggestions.length > 0;

  return {
    suggestions,
    selectedIndex,
    setSelectedIndex,
    hasSuggestions,
    selectSuggestion: (index: number) => {
      if (index >= 0 && index < suggestions.length) {
        return suggestions[index];
      }
      return null;
    },
  };
}

