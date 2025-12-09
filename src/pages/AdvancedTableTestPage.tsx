import { useState } from "react";
import { FreeformModeTable } from "@/features/advanced-table/FreeformModeTable";
import { useAdvancedTable } from "@/features/advanced-table";
import { AdvancedTableConfig, CellConfig } from "@/features/advanced-table/types";

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

