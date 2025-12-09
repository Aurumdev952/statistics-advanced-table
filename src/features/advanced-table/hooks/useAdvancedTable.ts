import { useQuery } from "@tanstack/react-query";
import { AdvancedTableConfig } from "../types";
import { getAccessToken } from "@/features/auth";
import { API_CONFIG } from "@/utils/constants";

interface UseAdvancedTableOptions {
  config: AdvancedTableConfig;
  filters?: any[];
  enabled?: boolean;
}

export function useAdvancedTable({ config, filters = [], enabled = true }: UseAdvancedTableOptions) {
  return useQuery({
    queryKey: ["advanced-table", config, filters],
    queryFn: async () => {
      const accessToken = getAccessToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}/visualization/data`, {
        method: "POST",
        headers,
        body: JSON.stringify([
          {
            config,
            filters,
          },
        ]),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch advanced table data");
      }

      const data = await response.json();
      return data.components || data;
    },
    enabled,
  });
}

