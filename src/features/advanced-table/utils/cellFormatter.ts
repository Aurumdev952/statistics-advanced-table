import { NumberFormat, DateFormat, TextFormat, CellFormatting } from "../types";

/**
 * Format a number according to the specified format.
 */
export function formatNumber(value: number, format?: NumberFormat): string {
  if (value === null || value === undefined || isNaN(value)) {
    return String(value);
  }

  if (!format || !format.type) {
    return String(value);
  }

  switch (format.type) {
    case "currency": {
      const symbol = format.currency_symbol || "$";
      const decimalPlaces = format.decimal_places ?? 2;
      const withSeparator = format.thousands_separator ?? true;

      let formatted = value.toFixed(decimalPlaces);
      if (withSeparator) {
        const parts = formatted.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        formatted = parts.join(".");
      }
      return `${symbol}${formatted}`;
    }

    case "percentage": {
      const decimalPlaces = format.decimal_places ?? 2;
      return `${(value * 100).toFixed(decimalPlaces)}%`;
    }

    case "decimal": {
      const decimalPlaces = format.decimal_places ?? 2;
      const withSeparator = format.thousands_separator ?? true;

      let formatted = value.toFixed(decimalPlaces);
      if (withSeparator) {
        const parts = formatted.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        formatted = parts.join(".");
      }
      return formatted;
    }

    case "number": {
      const withSeparator = format.thousands_separator ?? true;
      if (withSeparator) {
        return value.toLocaleString();
      }
      return String(value);
    }

    default:
      return String(value);
  }
}

/**
 * Format a date according to the specified format.
 */
export function formatDate(value: Date | string, format?: DateFormat): string {
  if (!value) return "";

  let date: Date;
  if (typeof value === "string") {
    date = new Date(value);
    if (isNaN(date.getTime())) {
      return value; // Return original if not a valid date
    }
  } else {
    date = value;
  }

  if (!format || !format.type) {
    return date.toLocaleDateString();
  }

  switch (format.type) {
    case "date": {
      if (format.pattern) {
        // Simple pattern matching for common formats
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        return format.pattern
          .replace("YYYY", String(year))
          .replace("MM", month)
          .replace("DD", day)
          .replace("YY", String(year).slice(-2));
      }
      return date.toLocaleDateString();
    }

    case "datetime": {
      if (format.pattern) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return format.pattern
          .replace("YYYY", String(year))
          .replace("MM", month)
          .replace("DD", day)
          .replace("HH", hours)
          .replace("mm", minutes)
          .replace("ss", seconds);
      }
      return date.toLocaleString();
    }

    case "time": {
      if (format.pattern) {
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        return format.pattern
          .replace("HH", hours)
          .replace("mm", minutes)
          .replace("ss", seconds);
      }
      return date.toLocaleTimeString();
    }

    default:
      return date.toLocaleDateString();
  }
}

/**
 * Format text according to the specified transform.
 */
export function formatText(value: string, format?: TextFormat): string {
  if (!value || typeof value !== "string") {
    return String(value || "");
  }

  if (!format || !format.transform || format.transform === "none") {
    return value;
  }

  switch (format.transform) {
    case "uppercase":
      return value.toUpperCase();
    case "lowercase":
      return value.toLowerCase();
    case "capitalize":
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    default:
      return value;
  }
}

/**
 * Format a cell value according to its formatting configuration.
 */
export function formatCellValue(value: any, formatting?: CellFormatting): string {
  if (value === null || value === undefined) {
    return "";
  }

  // Apply number format if value is a number
  if (typeof value === "number" && formatting?.number_format) {
    return formatNumber(value, formatting.number_format);
  }

  // Apply date format if value is a date
  if ((value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)))) && formatting?.date_format) {
    return formatDate(value, formatting.date_format);
  }

  // Apply text format if value is a string
  if (typeof value === "string" && formatting?.text_format) {
    return formatText(value, formatting.text_format);
  }

  return String(value);
}

