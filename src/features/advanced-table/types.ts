export type CellType = "static" | "query" | "formula";

export interface FillModeConfig {
  enabled: boolean;
  direction?: "horizontal" | "vertical";
  target_range?: {
    start_cell: string;
    end_cell: string;
  };
  overflow_behavior?: "truncate" | "extend" | "error";
  return_dimension?: boolean;
  return_measure?: boolean;
}

export interface QueryCellConfig {
  measures?: Array<{
    dataset_id: string;
    field: string;
    func?: string;
    alias?: string;
    quantile?: number;
    group_by?: string;
    filters?: Array<{
      field: string;
      op: string;
      value?: any;
      values?: any[];
      case_sensitive?: boolean;
    }>;
  }>;
  derived_columns?: Array<{
    dataset_id: string;
    name: string;
    formula: string;
    data_type?: string;
    formatting?: Record<string, any>;
  }>;
  formula?: string;
  fill_mode?: FillModeConfig;
}

export interface DisplaySettings {
  row_heights?: Record<string, number>;
  column_widths?: Record<string, number>;
  frozen_rows?: number[];
  frozen_columns?: number[];
}

export interface FreeformModeConfig {
  grid: {
    rows: number;
    columns: number;
  };
  cells: Record<string, CellConfig>;
  display_settings?: DisplaySettings;
}

export interface AdvancedTableConfig {
  component_type: "advanced-table";
  mode: "freeform" | "dataset";
  freeform?: FreeformModeConfig;
  dataset?: Record<string, any>;
}

export interface CellCoordinates {
  row: number;
  col: number;
}

export interface CellReference {
  cell: string;
  row: number;
  col: number;
  rowAbsolute: boolean;
  colAbsolute: boolean;
}

export interface MergeInfo {
  master_cell: string;
  colspan: number;
  rowspan: number;
}

export interface NumberFormat {
  type?: "currency" | "percentage" | "number" | "decimal";
  currency_symbol?: string;
  decimal_places?: number;
  thousands_separator?: boolean;
}

export interface DateFormat {
  type?: "date" | "datetime" | "time";
  pattern?: string;
}

export interface TextFormat {
  transform?: "uppercase" | "lowercase" | "capitalize" | "none";
}

export interface CellStyle {
  background_color?: string;
  text_color?: string;
  font_family?: string;
  font_size?: number;
  font_weight?: "normal" | "bold" | "lighter" | "bolder" | number;
  font_style?: "normal" | "italic" | "oblique";
  text_align?: "left" | "center" | "right" | "justify";
  vertical_align?: "top" | "middle" | "bottom";
  border_style?: "none" | "solid" | "dashed" | "dotted" | "double";
  border_width?: number;
  border_color?: string;
  border_top?: boolean;
  border_right?: boolean;
  border_bottom?: boolean;
  border_left?: boolean;
}

export interface CellFormatting {
  number_format?: NumberFormat;
  date_format?: DateFormat;
  text_format?: TextFormat;
  style?: CellStyle;
}

export interface CellConfig {
  type: CellType;
  content?: any;
  formula?: string;
  query?: QueryCellConfig;
  formatting?: CellFormatting;
  merge_info?: MergeInfo;
}

