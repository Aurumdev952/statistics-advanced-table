import { useEffect, useMemo, useState, useCallback, memo } from "react";
import { QueryCellConfig } from "./types";
import { useDatasets, useDatasetSchema } from "./hooks/useDatasets";

interface QueryBuilderProps {
  initialConfig: QueryCellConfig | null;
  onSave: (config: QueryCellConfig) => void;
  onCancel: () => void;
}

interface MeasureRowProps {
  measure: QueryCellConfig['measures'][0];
  index: number;
  datasetsData: any;
  datasetsLoading: boolean;
  updateMeasure: (index: number, updates: Partial<QueryCellConfig['measures'][0]>) => void;
  removeMeasure: (index: number) => void;
  toggleMeasureFilters: (index: number) => void;
  expandedFilters: Record<number, boolean>;
  updateMeasureFilter: (measureIndex: number, filterIndex: number, key: string, value: any) => void;
  removeMeasureFilter: (measureIndex: number, filterIndex: number) => void;
}

const allAggregations = [
  { value: "sum", label: "Sum", numeric: true },
  { value: "avg", label: "Average", numeric: true },
  { value: "mean", label: "Mean", numeric: true },
  { value: "min", label: "Min", numeric: true, all: true },
  { value: "max", label: "Max", numeric: true, all: true },
  { value: "count", label: "Count", all: true },
  { value: "count_distinct", label: "Count Distinct", all: true },
  { value: "median", label: "Median", numeric: true },
  { value: "std", label: "Std Dev", numeric: true },
  { value: "var", label: "Variance", numeric: true },
  { value: "quantile", label: "Quantile", numeric: true },
];

const operators = ["eq", "ne", "gt", "gte", "lt", "lte", "in", "not_in", "contains"];

const getAvailableFunctions = (dataType?: string): Array<{ value: string; label: string }> => {
  if (!dataType) {
    return allAggregations.map(a => ({ value: a.value, label: a.label }));
  }

  const numericTypes = ["integer", "float"];
  const isNumeric = numericTypes.includes(dataType);

  return allAggregations
    .filter(a => a.all || (isNumeric && a.numeric))
    .map(a => ({ value: a.value, label: a.label }));
};

export function QueryBuilder({ initialConfig, onSave, onCancel }: QueryBuilderProps) {
  const { data: datasetsData, isLoading: datasetsLoading } = useDatasets();

  const [measures, setMeasures] = useState(initialConfig?.measures || [{ dataset_id: "", field: "" }]);
  const [derivedColumns, setDerivedColumns] = useState(initialConfig?.derived_columns || []);
  const [formula, setFormula] = useState(initialConfig?.formula || "");

  // Track expanded filters per measure
  const [expandedFilters, setExpandedFilters] = useState<Record<number, boolean>>({});

  // Helper to get schema for a specific dataset
  const getSchemaForDataset = (datasetId: string | undefined) => {
    if (!datasetId) return null;
    // We'll use a hook per measure - but for now, we'll fetch on demand
    // This is a simplified approach - in production you might want to cache schemas
    return null;
  };

  const handleSave = () => {
    const config: QueryCellConfig = {
      measures: measures.filter((m) => m.dataset_id && m.field).map(m => ({
        dataset_id: m.dataset_id!,
        field: m.field!,
        func: m.func,
        alias: m.alias,
        quantile: m.quantile,
        filters: m.filters?.filter((f: any) => f.field) || [],
      })),
      derived_columns: derivedColumns.filter((dc) => dc.dataset_id && dc.name && dc.formula).map(dc => ({
        dataset_id: dc.dataset_id!,
        name: dc.name!,
        formula: dc.formula!,
        data_type: dc.data_type,
        formatting: dc.formatting,
      })),
      formula: formula.trim() || undefined,
    };
    onSave(config);
  };

  const updateMeasure = (index: number, updates: Partial<QueryCellConfig['measures'][0]>) => {
    const next = [...measures];
    next[index] = { ...next[index], ...updates };
    setMeasures(next);
  };

  const removeMeasure = (index: number) => {
    setMeasures(measures.filter((_, i) => i !== index));
    // Remove expanded state for this measure
    const newExpanded = { ...expandedFilters };
    delete newExpanded[index];
    setExpandedFilters(newExpanded);
  };

  const updateMeasureFilter = (measureIndex: number, filterIndex: number, key: string, value: any) => {
    const next = [...measures];
    const measure = next[measureIndex];
    const filters = measure.filters || [];
    if (!filters[filterIndex]) {
      filters[filterIndex] = { field: "", op: "eq", value: "" };
    }
    filters[filterIndex] = { ...filters[filterIndex], [key]: value };
    next[measureIndex] = { ...measure, filters };
    setMeasures(next);
  };

  const removeMeasureFilter = (measureIndex: number, filterIndex: number) => {
    const next = [...measures];
    const measure = next[measureIndex];
    const filters = (measure.filters || []).filter((_, i) => i !== filterIndex);
    next[measureIndex] = { ...measure, filters };
    setMeasures(next);
  };

  const toggleMeasureFilters = (index: number) => {
    setExpandedFilters({ ...expandedFilters, [index]: !expandedFilters[index] });
  };

  const updateDerived = (index: number, key: string, value: any) => {
    const next = [...derivedColumns];
    next[index] = { ...next[index], [key]: value };
    setDerivedColumns(next);
  };

  const removeDerived = (index: number) => {
    setDerivedColumns(derivedColumns.filter((_, i) => i !== index));
  };

  // Component to render a measure with its own dataset and filters
  const MeasureRow = memo(({
    measure,
    index,
    datasetsData,
    datasetsLoading,
    updateMeasure,
    removeMeasure,
    toggleMeasureFilters,
    expandedFilters,
    updateMeasureFilter,
    removeMeasureFilter
  }: MeasureRowProps) => {
    const { data: schemaData, isLoading: schemaLoading, error: schemaError } = useDatasetSchema(measure.dataset_id || undefined);

    const allColumns = useMemo(() => {
      if (!schemaData) return [];
      return schemaData.columns || [];
    }, [schemaData]);

    const selectedField = measure.field || "";
    const fieldColumn = allColumns.find(c => c.name === selectedField);
    const dataType = fieldColumn?.data_type;
    const availableFunctions = getAvailableFunctions(dataType);
    const currentFunc = measure.func || (availableFunctions.length > 0 ? availableFunctions[0].value : "count");
    const measureFilters = measure.filters || [];
    const isFiltersExpanded = expandedFilters[index] || false;

    const handleAliasChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      updateMeasure(index, { alias: e.target.value });
    }, [index, updateMeasure]);

    return (
      <div className="space-y-2 p-3 border rounded">
        <div className="flex gap-2 items-center flex-wrap">
          <select
            value={measure.dataset_id || ""}
            onChange={(e) => {
              const newDatasetId = e.target.value;
              updateMeasure(index, { dataset_id: newDatasetId, field: "" }); // Reset field when dataset changes
            }}
            className="px-3 py-2 border rounded w-48"
            disabled={datasetsLoading}
          >
            <option value="">Select dataset</option>
            {datasetsData?.items?.map((ds) => (
              <option key={ds.dataset_id} value={ds.dataset_id}>
                {ds.name}
              </option>
            ))}
          </select>
          <select
            value={selectedField}
            onChange={(e) => {
              const field = e.target.value;
              const newFieldColumn = allColumns.find(c => c.name === field);
              const newDataType = newFieldColumn?.data_type;
              const newAvailableFunctions = getAvailableFunctions(newDataType);
              const defaultFunc = newAvailableFunctions.length > 0 ? newAvailableFunctions[0].value : "count";
              updateMeasure(index, { field, func: defaultFunc });
            }}
            className="flex-1 px-3 py-2 border rounded min-w-[200px]"
            disabled={schemaLoading || !measure.dataset_id}
          >
            <option value="">Select field</option>
            {schemaLoading ? (
              <option disabled>Loading fields...</option>
            ) : schemaError ? (
              <option disabled>Error loading fields</option>
            ) : allColumns.length === 0 ? (
              <option disabled>No fields available</option>
            ) : (
              allColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))
            )}
          </select>
          <select
            value={currentFunc}
            onChange={(e) => updateMeasure(index, { func: e.target.value })}
            className="px-3 py-2 border rounded w-40"
            disabled={!selectedField}
          >
            {availableFunctions.map((func) => (
              <option key={func.value} value={func.value}>
                {func.label}
              </option>
            ))}
          </select>
          {currentFunc === "quantile" && (
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={measure.quantile ?? 0.5}
              onChange={(e) => {
                const quantile = parseFloat(e.target.value);
                updateMeasure(index, { quantile: isNaN(quantile) ? undefined : quantile });
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className="px-2 py-2 border rounded w-20"
              placeholder="0.5"
            />
          )}
          <input
            type="text"
            value={measure.alias || ""}
            onChange={handleAliasChange}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onFocus={(e) => e.stopPropagation()}
            className="px-3 py-2 border rounded w-32"
            placeholder="Alias"
          />
          <button
            type="button"
            className="text-sm text-blue-600 px-2 py-1"
            onClick={() => toggleMeasureFilters(index)}
          >
            {isFiltersExpanded ? "Hide" : "Show"} Filters
          </button>
          <button
            type="button"
            className="text-sm text-red-600 px-2 py-1"
            onClick={() => removeMeasure(index)}
          >
            Remove
          </button>
        </div>

        {isFiltersExpanded && (
          <div className="pl-2 border-l-2 border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-gray-700">Filters</div>
              <button
                type="button"
                className="text-xs text-blue-600 px-2 py-1"
                onClick={() => {
                  const filters = measure.filters || [];
                  updateMeasure(index, { filters: [...filters, { field: "", op: "eq", value: "" }] });
                }}
              >
                Add Filter
              </button>
            </div>
            {measureFilters.map((filter, filterIndex) => (
              <div key={filterIndex} className="grid grid-cols-4 gap-2 items-center">
                <select
                  value={filter.field || ""}
                  onChange={(e) => updateMeasureFilter(index, filterIndex, "field", e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                  disabled={schemaLoading || !measure.dataset_id}
                >
                  <option value="">Field</option>
                  {allColumns.map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name}
                    </option>
                  ))}
                </select>
                <select
                  value={filter.op || "eq"}
                  onChange={(e) => updateMeasureFilter(index, filterIndex, "op", e.target.value)}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {operators.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={filter.value ?? ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateMeasureFilter(index, filterIndex, "value", e.target.value);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="px-2 py-1 border rounded text-sm"
                  placeholder="Value"
                />
                <button
                  type="button"
                  className="text-xs text-red-600 px-2 py-1"
                  onClick={() => removeMeasureFilter(index, filterIndex)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Measures</div>
          <button
            type="button"
            className="text-sm text-blue-600 px-2 py-1"
            onClick={() => setMeasures([...measures, { dataset_id: "", field: "" }])}
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {measures.map((measure, index) => (
            <MeasureRow
              key={index}
              measure={measure}
              index={index}
              datasetsData={datasetsData}
              datasetsLoading={datasetsLoading}
              updateMeasure={updateMeasure}
              removeMeasure={removeMeasure}
              toggleMeasureFilters={toggleMeasureFilters}
              expandedFilters={expandedFilters}
              updateMeasureFilter={updateMeasureFilter}
              removeMeasureFilter={removeMeasureFilter}
            />
          ))}
        </div>
      </div>


      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">Derived Columns</div>
          <button
            type="button"
            className="text-sm text-blue-600 px-2 py-1"
            onClick={() => setDerivedColumns([...derivedColumns, { dataset_id: "", name: "", formula: "" }])}
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {derivedColumns.map((dc, index) => {
            const datasetName = datasetsData?.items?.find(ds => ds.dataset_id === dc.dataset_id)?.name || "";
            return (
              <div key={index} className="space-y-2 p-2 border rounded">
                <select
                  value={dc.dataset_id || ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateDerived(index, "dataset_id", e.target.value);
                  }}
                  className="w-full px-3 py-2 border rounded"
                  disabled={datasetsLoading}
                >
                  <option value="">Select dataset</option>
                  {datasetsData?.items?.map((ds) => (
                    <option key={ds.dataset_id} value={ds.dataset_id}>
                      {ds.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={dc.name || ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateDerived(index, "name", e.target.value);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Column name"
                />
                <input
                  type="text"
                  value={dc.formula || ""}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateDerived(index, "formula", e.target.value);
                  }}
                  onKeyDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 border rounded font-mono text-sm"
                  placeholder="Formula (can reference measures from any dataset)"
                />
                <div className="text-xs text-gray-500">
                  Available measures: {measures.filter(m => m.field).map(m => `${m.alias || m.field}${m.dataset_id ? ` (${datasetsData?.items?.find(ds => ds.dataset_id === m.dataset_id)?.name || ""})` : ""}`).join(", ") || "none"}
                </div>
                <button
                  type="button"
                  className="text-sm text-red-600 px-2 py-1"
                  onClick={() => removeDerived(index)}
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {(measures.filter(m => m.field).length > 0 || derivedColumns.filter(dc => dc.name).length > 0) && (
        <div>
          <div className="text-sm font-semibold mb-2">Formula</div>
          <div className="text-xs text-gray-600 mb-1">
            Optional formula to calculate the value. Can reference measure aliases (or field names if no alias) and derived column names.
          </div>
          <input
            type="text"
            value={formula}
            onChange={(e) => {
              e.stopPropagation();
              setFormula(e.target.value);
            }}
            onKeyDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className="w-full px-3 py-2 border rounded font-mono text-sm"
            placeholder="e.g., revenue - cost or profit"
          />
          <div className="mt-1 text-xs text-gray-500">
            Available: {[
              ...measures.filter(m => m.field).map(m => {
                const datasetName = datasetsData?.items?.find(ds => ds.dataset_id === m.dataset_id)?.name || "";
                return `${m.alias || m.field}${datasetName ? ` (${datasetName})` : ""}`;
              }),
              ...derivedColumns.filter(dc => dc.name).map(dc => {
                const datasetName = datasetsData?.items?.find(ds => ds.dataset_id === dc.dataset_id)?.name || "";
                return `${dc.name}${datasetName ? ` (${datasetName})` : ""}`;
              })
            ].join(", ") || "none"}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
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
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>
    </div>
  );
}

