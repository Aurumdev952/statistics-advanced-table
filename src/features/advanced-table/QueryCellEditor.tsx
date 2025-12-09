import { QueryCellConfig } from "./types";
import { QueryBuilder } from "./QueryBuilder";

interface QueryCellEditorProps {
  queryConfig: QueryCellConfig | null;
  onSave: (config: QueryCellConfig) => void;
  onCancel: () => void;
}

export function QueryCellEditor({ queryConfig, onSave, onCancel }: QueryCellEditorProps) {
  return (
    <QueryBuilder
      initialConfig={queryConfig}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

