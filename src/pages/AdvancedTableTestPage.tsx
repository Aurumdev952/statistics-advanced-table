import { useAdvancedTable } from "@/features/advanced-table";
import { FreeformModeTable } from "@/features/advanced-table/FreeformModeTable";
import { AdvancedTableConfig, CellConfig } from "@/features/advanced-table/types";
import { useState } from "react";

const exampleConfig: AdvancedTableConfig = {
  component_type: "advanced-table",
  mode: "freeform",
  freeform: {
    grid: {
      rows: 20,
      columns: 10,
    },
    cells: {
      A1: {
        type: "static",
        content: "Entry/Exit Statistics Report",
        merge_info: {
          master_cell: "A1",
          colspan: 3,
          rowspan: 1,
        },
        formatting: {
          style: {
            background_color: "#3b82f6",
            text_color: "#ffffff",
            font_size: 18,
            font_weight: "bold",
            text_align: "center",
            vertical_align: "middle",
          },
        },
      },
      A2: {
        type: "static",
        content: "Metric",
      },
      A3: {
        type: "static",
        content: "Total Entries",
      },
      A4: {
        type: "static",
        content: "Total Exits",
      },
      A5: {
        type: "static",
        content: "Net Flow",
      },
      A6: {
        type: "static",
        content: "Growth Rate",
      },
      B2: {
        type: "static",
        content: "Value",
      },
      B3: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
              ],
            },
          ],
        },
      },
      B4: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Exit",
                },
              ],
            },
          ],
        },
      },
      B5: {
        type: "formula",
        formula: "=B3-B4",
      },
      B6: {
        type: "formula",
        formula: "=IF(B4>0, (B3-B4)/B4*100, 0)",
        formatting: {
          number_format: {
            type: "percentage",
            decimal_places: 2,
          },
        },
      },
      // Formatted number example
      C3: {
        type: "static",
        content: 1234567.89,
        formatting: {
          number_format: {
            type: "currency",
            currency_symbol: "$",
            decimal_places: 2,
            thousands_separator: true,
          },
          style: {
            text_color: "#059669",
            font_weight: "bold",
          },
        },
      },
      // Date format example
      C4: {
        type: "static",
        content: "2024-01-15",
        formatting: {
          date_format: {
            type: "date",
            pattern: "YYYY-MM-DD",
          },
          style: {
            font_family: "Courier New",
          },
        },
      },
      // Text format example
      C5: {
        type: "static",
        content: "hello world",
        formatting: {
          text_format: {
            transform: "capitalize",
          },
          style: {
            text_align: "center",
            background_color: "#fef3c7",
          },
        },
      },
      // Styled cell with borders
      C6: {
        type: "static",
        content: "Styled Cell",
        formatting: {
          style: {
            background_color: "#fce7f3",
            text_color: "#831843",
            font_size: 14,
            font_weight: "bold",
            font_style: "italic",
            text_align: "center",
            vertical_align: "middle",
            border_style: "solid",
            border_width: 2,
            border_color: "#9f1239",
            border_top: true,
            border_right: true,
            border_bottom: true,
            border_left: true,
          },
        },
      },
      D2: {
        type: "static",
        content: "By Region",
      },
      D3: {
        type: "static",
        content: "EAC Entries",
      },
      D4: {
        type: "static",
        content: "Europe Entries",
      },
      D5: {
        type: "static",
        content: "Total",
      },
      E3: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "region1",
                  op: "eq",
                  value: "EAC",
                },
              ],
            },
          ],
        },
      },
      E4: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "region1",
                  op: "eq",
                  value: "Europe",
                },
              ],
            },
          ],
        },
      },
      E5: {
        type: "formula",
        formula: "=SUM(E3:E4)",
      },
      E6: {
        type: "formula",
        formula: "=IF(E5>0, E3/E5*100, 0)",
      },
      F6: {
        type: "static",
        content: "% EAC",
      },
      // Top Visiting Countries Report - Using Array Results Feature
      A8: {
        type: "static",
        content: "Top Visiting Countries Report",
        merge_info: {
          master_cell: "A8",
          colspan: 3,
          rowspan: 1,
        },
        formatting: {
          style: {
            background_color: "#3b82f6",
            text_color: "#ffffff",
            font_size: 16,
            font_weight: "bold",
            text_align: "center",
            vertical_align: "middle",
          },
        },
      },
      A9: {
        type: "static",
        content: "Rank",
        formatting: {
          style: {
            background_color: "#e5e7eb",
            font_weight: "bold",
            text_align: "center",
          },
        },
      },
      B9: {
        type: "static",
        content: "Country",
        formatting: {
          style: {
            background_color: "#e5e7eb",
            font_weight: "bold",
            text_align: "center",
          },
        },
      },
      C9: {
        type: "static",
        content: "Visitors",
        formatting: {
          style: {
            background_color: "#e5e7eb",
            font_weight: "bold",
            text_align: "center",
          },
        },
      },
      // Query cell that will return array of top 10 countries (dimension values)
      // This will automatically fill B10:B19 with country names
      B10: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              group_by: "nationality", // Group by nationality to get top countries
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
              ],
            },
          ],
          fill_mode: {
            enabled: true,
            direction: "vertical",
            target_range: {
              start_cell: "B10",
              end_cell: "B19",
            },
            overflow_behavior: "truncate",
            return_dimension: true, // Return country names
            return_measure: false,
          },
        },
      },
      // Query cells that use country names from B column as filters
      // Each cell references the country in the same row
      C10: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B10", // Cell reference to country name in B10
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C11: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B11", // Cell reference to country name in B11
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C12: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B12",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C13: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B13",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C14: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B14",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C15: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B15",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C16: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B16",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C17: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B17",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C18: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B18",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C19: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "B19",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      // Rank numbers (1-10) - these can be static or generated
      A10: {
        type: "static",
        content: "1",
      },
      A11: {
        type: "static",
        content: "2",
      },
      A12: {
        type: "static",
        content: "3",
      },
      A13: {
        type: "static",
        content: "4",
      },
      A14: {
        type: "static",
        content: "5",
      },
      A15: {
        type: "static",
        content: "6",
      },
      A16: {
        type: "static",
        content: "7",
      },
      A17: {
        type: "static",
        content: "8",
      },
      A18: {
        type: "static",
        content: "9",
      },
      A19: {
        type: "static",
        content: "10",
      },
      A20: {
        type: "static",
        content: "TOTAL",
        formatting: {
          style: {
            font_weight: "bold",
            background_color: "#dbeafe",
          },
        },
      },
      C20: {
        type: "formula",
        formula: "=SUM(C10:C19)",
        formatting: {
          style: {
            font_weight: "bold",
            background_color: "#dbeafe",
          },
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      // Feature Demo: Cell References in Query Filters
      A22: {
        type: "static",
        content: "Feature: Cell References in Filters",
        formatting: {
          style: {
            background_color: "#fef3c7",
            text_color: "#92400e",
            font_weight: "bold",
          },
        },
      },
      A23: {
        type: "static",
        content: "Minimum Visitors Threshold:",
      },
      B23: {
        type: "static",
        content: 5000,
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      A24: {
        type: "static",
        content: "Countries with visitors > threshold:",
      },
      B24: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "count",
                  op: "gt",
                  value: "B23", // Cell reference in filter - uses value from B23
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      A25: {
        type: "static",
        content: "Note: Change B23 to see filter update dynamically",
        formatting: {
          style: {
            font_size: 10,
            font_style: "italic",
            text_color: "#6b7280",
          },
        },
      },
      // Feature Demo: Formula Copying with Relative/Absolute References
      A27: {
        type: "static",
        content: "Feature: Formula Copying",
        formatting: {
          style: {
            background_color: "#dbeafe",
            text_color: "#1e40af",
            font_weight: "bold",
          },
        },
      },
      A28: {
        type: "static",
        content: "Source",
      },
      B28: {
        type: "static",
        content: "Relative Ref",
      },
      C28: {
        type: "static",
        content: "Absolute Row",
      },
      D28: {
        type: "static",
        content: "Absolute Col",
      },
      E28: {
        type: "static",
        content: "Fully Absolute",
      },
      A29: {
        type: "static",
        content: "Value 1",
      },
      A30: {
        type: "static",
        content: "Value 2",
      },
      A31: {
        type: "static",
        content: "Value 3",
      },
      B29: {
        type: "static",
        content: 10,
      },
      B30: {
        type: "static",
        content: 20,
      },
      B31: {
        type: "static",
        content: 30,
      },
      C29: {
        type: "formula",
        formula: "=B29*2", // Relative reference - will change when copied
      },
      C30: {
        type: "formula",
        formula: "=B30*2", // Copy C29 to C30 to see it becomes =B30*2
      },
      C31: {
        type: "formula",
        formula: "=B31*2", // Copy C29 to C31 to see it becomes =B31*2
      },
      D29: {
        type: "formula",
        formula: "=B$29*3", // Absolute row - row stays 29 when copied down
      },
      D30: {
        type: "formula",
        formula: "=B$29*3", // Copy D29 here - row stays 29
      },
      D31: {
        type: "formula",
        formula: "=B$29*3", // Copy D29 here - row stays 29
      },
      E29: {
        type: "formula",
        formula: "=$B29*4", // Absolute column - column stays B when copied right
      },
      F29: {
        type: "formula",
        formula: "=$B29*4", // Copy E29 here - column stays B
      },
      G29: {
        type: "formula",
        formula: "=$B29*4", // Copy E29 here - column stays B
      },
      H29: {
        type: "formula",
        formula: "=$B$29*5", // Fully absolute - stays $B$29 when copied anywhere
      },
      H30: {
        type: "formula",
        formula: "=$B$29*5", // Copy H29 here - stays $B$29
      },
      H31: {
        type: "formula",
        formula: "=$B$29*5", // Copy H29 here - stays $B$29
      },
      I30: {
        type: "formula",
        formula: "=$B$29*5", // Copy H29 here - stays $B$29
      },
      I31: {
        type: "formula",
        formula: "=$B$29*5", // Copy H29 here - stays $B$29
      },
      A33: {
        type: "static",
        content: "Instructions:",
        formatting: {
          style: {
            font_weight: "bold",
          },
        },
      },
      A34: {
        type: "static",
        content: "1. Copy C29 and paste to C30, C31 - see relative refs update",
      },
      A35: {
        type: "static",
        content: "2. Copy D29 and paste to D30, D31 - see row stays 29",
      },
      A36: {
        type: "static",
        content: "3. Copy E29 and paste to F29, G29 - see column stays B",
      },
      A37: {
        type: "static",
        content: "4. Copy H29 and paste anywhere - see it stays $B$29",
        formatting: {
          style: {
            font_size: 10,
            font_style: "italic",
            text_color: "#6b7280",
          },
        },
      },
      // Practical Example: Using Formula Copying for Country Percentages
      A39: {
        type: "static",
        content: "Practical Example: Country Percentages",
        formatting: {
          style: {
            background_color: "#d1fae5",
            text_color: "#065f46",
            font_weight: "bold",
          },
        },
      },
      A40: {
        type: "static",
        content: "Country",
      },
      B40: {
        type: "static",
        content: "Visitors",
      },
      C40: {
        type: "static",
        content: "% of Total",
      },
      A41: {
        type: "static",
        content: "USA",
      },
      B41: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "USA",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C41: {
        type: "formula",
        formula: "=IF($B$20>0, B41/$B$20*100, 0)", // Copy this formula down - $B$20 stays fixed, B41 updates
        formatting: {
          number_format: {
            type: "percentage",
            decimal_places: 2,
          },
        },
      },
      A42: {
        type: "static",
        content: "UK",
      },
      B42: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "UK",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C42: {
        type: "formula",
        formula: "=IF($B$20>0, B42/$B$20*100, 0)", // Copy C41 here - B41 becomes B42, $B$20 stays
        formatting: {
          number_format: {
            type: "percentage",
            decimal_places: 2,
          },
        },
      },
      A43: {
        type: "static",
        content: "France",
      },
      B43: {
        type: "query",
        query: {
          measures: [
            {
              dataset_id: "98522fd7-0604-46ea-af33-87df038cec3d",
              field: "count",
              func: "sum",
              filters: [
                {
                  field: "direction",
                  op: "eq",
                  value: "Entry",
                },
                {
                  field: "nationality",
                  op: "eq",
                  value: "France",
                },
              ],
            },
          ],
        },
        formatting: {
          number_format: {
            type: "number",
            thousands_separator: true,
          },
        },
      },
      C43: {
        type: "formula",
        formula: "=IF($B$20>0, B43/$B$20*100, 0)", // Copy C41 here - B41 becomes B43, $B$20 stays
        formatting: {
          number_format: {
            type: "percentage",
            decimal_places: 2,
          },
        },
      },
      A44: {
        type: "static",
        content: "Note: Copy C41 formula down to see relative/absolute refs in action",
        formatting: {
          style: {
            font_size: 10,
            font_style: "italic",
            text_color: "#6b7280",
          },
        },
      },
    },
  },
};

export default function AdvancedTableTestPage() {
  const [config, setConfig] = useState<AdvancedTableConfig>(exampleConfig);
  const { data, isLoading, error } = useAdvancedTable({
    config,
    enabled: true,
  });

  const handleCellUpdate = (cellAddress: string, cellConfig: CellConfig) => {
    const newConfig = { ...config };
    if (!newConfig.freeform) {
      newConfig.freeform = {
        grid: { rows: 20, columns: 10 },
        cells: {},
      };
    }
    newConfig.freeform.cells[cellAddress] = cellConfig;
    setConfig(newConfig);
  };

  // The hook returns data.components || data, so data is already the components object
  // Extract the first component from it
  const componentData = data && typeof data === 'object' && !Array.isArray(data)
    ? data[Object.keys(data)[0]]
    : data;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Advanced Table Test</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {isLoading && <div className="mb-4">Loading...</div>}

      {config.freeform && (
        <FreeformModeTable
          config={config.freeform}
          data={componentData?.data}
          onCellUpdate={handleCellUpdate}
        />
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Configuration (JSON)</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(config, null, 2)}
        </pre>
      </div>
    </div>
  );
}

