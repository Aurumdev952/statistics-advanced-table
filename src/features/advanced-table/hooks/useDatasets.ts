import { useQuery } from "@tanstack/react-query";
import { fetchDatasets, fetchDatasetSchema, DatasetListResponse, DatasetSchemaResponse } from "../api/datasets.api";

interface UseDatasetsOptions {
  search?: string;
  enabled?: boolean;
}

export function useDatasets(options: UseDatasetsOptions = {}) {
  const { search, enabled = true } = options;
  return useQuery<DatasetListResponse>({
    queryKey: ["datasets", search],
    queryFn: () => fetchDatasets({ search }),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}

export function useDatasetSchema(datasetId?: string) {
  return useQuery<DatasetSchemaResponse>({
    queryKey: ["dataset-schema", datasetId],
    queryFn: () => fetchDatasetSchema(datasetId || ""),
    enabled: !!datasetId,
    staleTime: 5 * 60 * 1000,
  });
}

