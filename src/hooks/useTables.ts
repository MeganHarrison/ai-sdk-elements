import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface DatabaseTable {
  name: string;
  sql: string;
}

export function useTables() {
  return useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await apiClient.database.getTables();
      if (!response.success) {
        throw new Error(response.error || 'Failed to load tables');
      }
      return response.tables || [];
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}