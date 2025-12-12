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

const DimensionSelector = ({ datasetId, value, onChange }: { datasetId: string; value: string; onChange: (value: string) => void }) => {
  const { data: schemaData, isLoading: schemaLoading } = useDatasetSchema(datasetId);

  const dimensions = useMemo(() => {
    if (!schemaData) return [];
    return (schemaData.columns || []).filter((col: any) => col.role === "dimension");
  }, [schemaData]);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-2 py-1 text-xs border rounded w-full"
      disabled={schemaLoading || !datasetId}
    >
      <option value="">Select dimension</option>
      {schemaLoading ? (
        <option disabled>Loading...</option>
      ) : dimensions.length === 0 ? (
        <option disabled>No dimensions available</option>
      ) : (
        dimensions.map((col: any) => (
          <option key={col.name} value={col.name}>
            {col.display_name || col.name}
          </option>
        ))
      )}
    </select>
  );
};

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

const isValidCellReference = (value: string): boolean => {
  if (!value || typeof value !== "string") return false;
  const cellRefPattern = /^\$?[A-Z]+\$?\d+$/i;
  return cellRefPattern.test(value.trim());
};

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
  const [fillMode, setFillMode] = useState({
    enabled: initialConfig?.fill_mode?.enabled || false,
    direction: initialConfig?.fill_mode?.direction || "vertical",
    target_range: initialConfig?.fill_mode?.target_range || null,
    overflow_behavior: initialConfig?.fill_mode?.overflow_behavior || "truncate",
    return_dimension: initialConfig?.fill_mode?.return_dimension ?? true,
    return_measure: initialConfig?.fill_mode?.return_measure ?? false,
  });

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
      fill_mode: fillMode.enabled ? {
        enabled: true,
        direction: fillMode.direction,
        target_range: fillMode.target_range || undefined,
        overflow_behavior: fillMode.overflow_behavior,
        return_dimension: fillMode.return_dimension,
        return_measure: fillMode.return_measure,
      } : undefined,
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
                <div className="relative flex-1">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={filter.value ?? ""}
                      onChange={(e) => {
                        e.stopPropagation();
                        updateMeasureFilter(index, filterIndex, "value", e.target.value);
                      }}
                      onKeyDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                      className={`px-2 py-1 border rounded text-sm flex-1 ${
                        isValidCellReference(filter.value ?? "")
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Value or cell (e.g., 100 or A1)"
                    />
                    {isValidCellReference(filter.value ?? "") && (
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="text-xs text-green-600" title="Valid cell reference">
                          ✓
                        </span>
                      </div>
                    )}
                  </div>
                  {isValidCellReference(filter.value ?? "") && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      Cell reference: {filter.value?.toUpperCase()}
                    </div>
                  )}
                </div>
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

      <div className="space-y-3 p-3 border rounded bg-gray-50">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold">Fill Multiple Cells</label>
          <input
            type="checkbox"
            checked={fillMode.enabled}
            onChange={(e) => setFillMode({ ...fillMode, enabled: e.target.checked })}
            className="w-4 h-4"
          />
        </div>

        {fillMode.enabled && (
          <div className="space-y-2 pl-4 border-l-2 border-blue-300">
            <div className="space-y-1">
              <label className="text-xs text-gray-600">Fill Direction</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFillMode({ ...fillMode, direction: "vertical" })}
                  className={`px-3 py-1 text-xs rounded ${
                    fillMode.direction === "vertical"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  ↓ Vertical (Down)
                </button>
                <button
                  type="button"
                  onClick={() => setFillMode({ ...fillMode, direction: "horizontal" })}
                  className={`px-3 py-1 text-xs rounded ${
                    fillMode.direction === "horizontal"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  → Horizontal (Right)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-600">Group By Dimension</label>
              <div className="text-xs text-gray-500 mb-1">
                Select a dimension to group by (e.g., "nationality" for top countries)
              </div>
              {measures.length > 0 && measures[0].dataset_id && (
                <DimensionSelector
                  datasetId={measures[0].dataset_id}
                  value={measures[0].group_by || ""}
                  onChange={(dimension) => {
                    const updated = [...measures];
                    updated[0] = { ...updated[0], group_by: dimension };
                    setMeasures(updated);
                  }}
                />
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-600">Return Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={fillMode.return_dimension}
                    onChange={(e) => setFillMode({ ...fillMode, return_dimension: e.target.checked })}
                  />
                  Dimension Values
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={fillMode.return_measure}
                    onChange={(e) => setFillMode({ ...fillMode, return_measure: e.target.checked })}
                  />
                  Measure Values
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-600">Target Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={fillMode.target_range?.start_cell || ""}
                  onChange={(e) => setFillMode({
                    ...fillMode,
                    target_range: {
                      ...fillMode.target_range,
                      start_cell: e.target.value.toUpperCase(),
                      end_cell: fillMode.target_range?.end_cell || e.target.value.toUpperCase(),
                    },
                  })}
                  placeholder="A1"
                  className="px-2 py-1 text-xs border rounded w-20"
                  pattern="[A-Z]+\d+"
                />
                <span className="text-xs text-gray-500">to</span>
                <input
                  type="text"
                  value={fillMode.target_range?.end_cell || ""}
                  onChange={(e) => setFillMode({
                    ...fillMode,
                    target_range: {
                      ...fillMode.target_range,
                      end_cell: e.target.value.toUpperCase(),
                    },
                  })}
                  placeholder="A10"
                  className="px-2 py-1 text-xs border rounded w-20"
                  pattern="[A-Z]+\d+"
                />
              </div>
              <p className="text-xs text-gray-500">
                {fillMode.target_range
                  ? `Will fill ${fillMode.target_range.start_cell}:${fillMode.target_range.end_cell}`
                  : "Enter cell range (e.g., A1:A10)"}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-600">If array is larger than range</label>
              <select
                value={fillMode.overflow_behavior}
                onChange={(e) => setFillMode({
                  ...fillMode,
                  overflow_behavior: e.target.value as "truncate" | "extend" | "error",
                })}
                className="px-2 py-1 text-xs border rounded w-full"
              >
                <option value="truncate">Truncate (fill only selected range)</option>
                <option value="extend">Extend (fill beyond range if needed)</option>
                <option value="error">Show error</option>
              </select>
            </div>
          </div>
        )}
      </div>

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

