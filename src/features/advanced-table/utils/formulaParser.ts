import { parseRange } from "./cellReference";

export interface FormulaToken {
  type: "number" | "string" | "cell_ref" | "range" | "identifier" | "operator";
  value: string | number;
}

export function tokenizeFormula(formula: string): FormulaToken[] {
  if (!formula || !formula.startsWith("=")) {
    return [];
  }

  formula = formula.slice(1).trim();
  const tokens: FormulaToken[] = [];
  let i = 0;

  while (i < formula.length) {
    if (/\s/.test(formula[i])) {
      i++;
      continue;
    }

    if (formula[i] === '"') {
      i++;
      const start = i;
      while (i < formula.length && formula[i] !== '"') {
        if (formula[i] === "\\" && i + 1 < formula.length) {
          i += 2;
        } else {
          i++;
        }
      }
      if (i >= formula.length) {
        throw new Error("Unclosed string literal");
      }
      tokens.push({ type: "string", value: formula.slice(start, i) });
      i++;
      continue;
    }

    if (/\d/.test(formula[i]) || (formula[i] === "." && /\d/.test(formula[i + 1]))) {
      const start = i;
      if (formula[i] === "-") i++;
      while (i < formula.length && (/\d/.test(formula[i]) || formula[i] === ".")) {
        i++;
      }
      const value = formula.slice(start, i);
      const numValue = value.includes(".") ? parseFloat(value) : parseInt(value, 10);
      tokens.push({ type: "number", value: numValue });
      continue;
    }

    if (/^\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+/i.test(formula.slice(i))) {
      const match = formula.slice(i).match(/^(\$?[A-Z]+\$?\d+:\$?[A-Z]+\$?\d+)/i);
      if (match) {
        tokens.push({ type: "range", value: match[1].toUpperCase() });
        i += match[1].length;
        continue;
      }
    }

    if (/^\$?[A-Z]+\$?\d+/i.test(formula.slice(i))) {
      const match = formula.slice(i).match(/^(\$?[A-Z]+\$?\d+)/i);
      if (match) {
        tokens.push({ type: "cell_ref", value: match[1].toUpperCase() });
        i += match[1].length;
        continue;
      }
    }

    if (/^[A-Z_][A-Z0-9_]*/i.test(formula.slice(i))) {
      const match = formula.slice(i).match(/^([A-Z_][A-Z0-9_]*)/i);
      if (match) {
        tokens.push({ type: "identifier", value: match[1].toUpperCase() });
        i += match[1].length;
        continue;
      }
    }

    if (/^(<=|>=|!=|==)/.test(formula.slice(i))) {
      const match = formula.slice(i).match(/^(<=|>=|!=|==)/);
      if (match) {
        tokens.push({ type: "operator", value: match[1] });
        i += match[1].length;
        continue;
      }
    }

    if (/[+\-*/^%(),=<>!]/.test(formula[i])) {
      tokens.push({ type: "operator", value: formula[i] });
      i++;
      continue;
    }

    throw new Error(`Unexpected character: ${formula[i]}`);
  }

  return tokens;
}

export function extractCellReferences(formula: string): string[] {
  if (!formula || !formula.startsWith("=")) {
    return [];
  }

  const tokens = tokenizeFormula(formula);
  const refs: string[] = [];

  for (const token of tokens) {
    if (token.type === "cell_ref") {
      refs.push(token.value as string);
    } else if (token.type === "range") {
      try {
        const { start, end } = parseRange(token.value as string);
        refs.push(start, end);
      } catch {
        // Ignore invalid ranges
      }
    }
  }

  return [...new Set(refs)];
}

export function validateFormula(formula: string): { valid: boolean; error?: string } {
  if (!formula) {
    return { valid: true };
  }

  if (!formula.startsWith("=")) {
    return { valid: false, error: "Formula must start with '='" };
  }

  try {
    tokenizeFormula(formula);
    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "Invalid formula" };
  }
}

