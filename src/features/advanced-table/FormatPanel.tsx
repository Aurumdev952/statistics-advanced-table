import { useState, useEffect } from "react";
import { CellFormatting, NumberFormat, DateFormat, TextFormat } from "./types";
import { formatCellValue } from "./utils/cellFormatter";

interface FormatPanelProps {
  formatting?: CellFormatting;
  previewValue?: any;
  onChange: (formatting: CellFormatting) => void;
}

export function FormatPanel({ formatting, previewValue, onChange }: FormatPanelProps) {
  const [numberFormat, setNumberFormat] = useState<NumberFormat | undefined>(formatting?.number_format);
  const [dateFormat, setDateFormat] = useState<DateFormat | undefined>(formatting?.date_format);
  const [textFormat, setTextFormat] = useState<TextFormat | undefined>(formatting?.text_format);

  useEffect(() => {
    const newFormatting: CellFormatting = {
      ...formatting,
      number_format: numberFormat,
      date_format: dateFormat,
      text_format: textFormat,
    };
    onChange(newFormatting);
  }, [numberFormat, dateFormat, textFormat]);

  const preview = formatCellValue(previewValue, {
    number_format: numberFormat,
    date_format: dateFormat,
    text_format: textFormat,
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold mb-2">Number Format</div>
        <select
          value={numberFormat?.type || "none"}
          onChange={(e) => {
            if (e.target.value === "none") {
              setNumberFormat(undefined);
            } else {
              setNumberFormat({ type: e.target.value as NumberFormat["type"] });
            }
          }}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="none">None</option>
          <option value="number">Number</option>
          <option value="decimal">Decimal</option>
          <option value="currency">Currency</option>
          <option value="percentage">Percentage</option>
        </select>

        {numberFormat?.type === "currency" && (
          <div className="mt-2">
            <label className="block text-xs mb-1">Currency Symbol</label>
            <input
              type="text"
              value={numberFormat.currency_symbol || "$"}
              onChange={(e) => setNumberFormat({ ...numberFormat, currency_symbol: e.target.value })}
              className="w-full px-2 py-1 border rounded text-sm"
              maxLength={3}
            />
          </div>
        )}

        {(numberFormat?.type === "decimal" || numberFormat?.type === "currency" || numberFormat?.type === "percentage") && (
          <div className="mt-2">
            <label className="block text-xs mb-1">Decimal Places</label>
            <input
              type="number"
              min="0"
              max="10"
              value={numberFormat.decimal_places ?? 2}
              onChange={(e) => setNumberFormat({ ...numberFormat, decimal_places: parseInt(e.target.value) || 0 })}
              className="w-full px-2 py-1 border rounded text-sm"
            />
          </div>
        )}

        {(numberFormat?.type === "number" || numberFormat?.type === "decimal" || numberFormat?.type === "currency") && (
          <div className="mt-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={numberFormat.thousands_separator ?? true}
                onChange={(e) => setNumberFormat({ ...numberFormat, thousands_separator: e.target.checked })}
              />
              Thousands Separator
            </label>
          </div>
        )}
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Date/Time Format</div>
        <select
          value={dateFormat?.type || "none"}
          onChange={(e) => {
            if (e.target.value === "none") {
              setDateFormat(undefined);
            } else {
              setDateFormat({ type: e.target.value as DateFormat["type"] });
            }
          }}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="none">None</option>
          <option value="date">Date</option>
          <option value="datetime">Date & Time</option>
          <option value="time">Time</option>
        </select>

        {dateFormat?.type && (
          <div className="mt-2">
            <label className="block text-xs mb-1">Pattern (optional)</label>
            <input
              type="text"
              value={dateFormat.pattern || ""}
              onChange={(e) => setDateFormat({ ...dateFormat, pattern: e.target.value })}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder={dateFormat.type === "date" ? "YYYY-MM-DD" : dateFormat.type === "datetime" ? "YYYY-MM-DD HH:mm:ss" : "HH:mm:ss"}
            />
            <div className="text-xs text-gray-500 mt-1">
              Use YYYY, MM, DD, HH, mm, ss for placeholders
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="text-sm font-semibold mb-2">Text Format</div>
        <select
          value={textFormat?.transform || "none"}
          onChange={(e) => {
            if (e.target.value === "none") {
              setTextFormat(undefined);
            } else {
              setTextFormat({ transform: e.target.value as TextFormat["transform"] });
            }
          }}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="none">None</option>
          <option value="uppercase">Uppercase</option>
          <option value="lowercase">Lowercase</option>
          <option value="capitalize">Capitalize</option>
        </select>
      </div>

      {previewValue !== undefined && (
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <div className="text-xs text-gray-600 mb-1">Preview:</div>
          <div className="text-sm font-mono">{preview}</div>
        </div>
      )}
    </div>
  );
}

