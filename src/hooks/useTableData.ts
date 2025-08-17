import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface TableDataParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export function useTableData(tableName: string, params: TableDataParams) {
  return useQuery({
    queryKey: ['tableData', tableName, params],
    queryFn: () => apiClient.database.getTableData(tableName, params),
    staleTime: 30 * 1000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
}

export function useTableSchema(tableName: string) {
  return useQuery({
    queryKey: ['tableSchema', tableName],
    queryFn: () => apiClient.database.getTableSchema(tableName),
    staleTime: 5 * 60 * 1000, // Schema unlikely to change often
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
}

export function useTableList() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: () => apiClient.database.getTables(),
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}