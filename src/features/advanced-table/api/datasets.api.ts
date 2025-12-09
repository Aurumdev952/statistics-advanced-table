import { apiFetchJson } from "@/utils/api";

export interface DatasetListItem {
  dataset_id: string;
  name: string;
  description?: string;
  schema_version?: number;
  columns_count?: number;
  origin?: string;
  institution_ids?: string[];
  institutions?: any[];
}

export interface DatasetListResponse {
  items: DatasetListItem[];
  total: number;
}

export interface DatasetSchemaResponse {
  columns: Array<{
    name: string;
    display_name?: string;
    data_type?: string;
    role?: string;
  }>;
  schema_version?: number;
}

export async function fetchDatasets(params: { search?: string } = {}): Promise<DatasetListResponse> {
  const query = params.search ? `?search=${encodeURIComponent(params.search)}` : "";
  return apiFetchJson<DatasetListResponse>(`/datasets${query}`);
}

export async function fetchDatasetSchema(datasetId: string): Promise<DatasetSchemaResponse> {
  return apiFetchJson<DatasetSchemaResponse>(`/datasets/${datasetId}`);
}

