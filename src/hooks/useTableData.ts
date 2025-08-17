import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

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

// Mutation hooks for table data
export function useUpdateTableRow(tableName: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Record<string, unknown> }) =>
      apiClient.database.updateTableRow(tableName, id, data),
    onSuccess: () => {
      // Invalidate all queries for this table
      queryClient.invalidateQueries({ queryKey: ['tableData', tableName] });
      toast.success('Record updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update record');
    },
  });
}

export function useCreateTableRow(tableName: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.database.createTableRow(tableName, data),
    onSuccess: () => {
      // Invalidate all queries for this table
      queryClient.invalidateQueries({ queryKey: ['tableData', tableName] });
      toast.success('Record created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create record');
    },
  });
}

export function useDeleteTableRow(tableName: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string | number) =>
      apiClient.database.deleteTableRow(tableName, id),
    onSuccess: () => {
      // Invalidate all queries for this table
      queryClient.invalidateQueries({ queryKey: ['tableData', tableName] });
      toast.success('Record deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete record');
    },
  });
}