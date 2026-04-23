import { useState, useMemo } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { CITY_DB } from '../constants/cities';
import { SearchResponseSchema, type SearchResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export function useCarrierSearch() {
  const [searchParams, setSearchParams] = useState<{ origin: string; dest: string } | null>(null);

  const originData = useMemo(() => 
    searchParams ? CITY_DB[searchParams.origin.toLowerCase().trim()] : null, 
  [searchParams]);
  
  const destData = useMemo(() => 
    searchParams ? CITY_DB[searchParams.dest.toLowerCase().trim()] : null, 
  [searchParams]);

  // React Query handles: loading, error, caching, and background refetching
  const { data, isLoading, isError, error } = useQuery<SearchResponse>({
    queryKey: ['carriers', searchParams?.origin, searchParams?.dest],
    queryFn: async () => {
      if (!searchParams) return { origin: '', destination: '', carriers: [] };
      
      const originSearch = CITY_DB[searchParams.origin.toLowerCase().trim()]?.name || searchParams.origin;
      const destSearch = CITY_DB[searchParams.dest.toLowerCase().trim()]?.name || searchParams.dest;

      const response = await axios.get(`${API_BASE_URL}/api/v1/search`, {
        params: { origin: originSearch, destination: destSearch },
        headers: {
          'X-API-Key': API_KEY
        }
      });
      
      // Zero-Trust Validation: Validate API response against schema
      return SearchResponseSchema.parse(response.data);
    },
    enabled: !!searchParams, // Only run query when we have params
  });

  const triggerSearch = (origin: string, dest: string) => {
    setSearchParams({ origin, dest });
  };

  return {
    originData,
    destData,
    loading: isLoading,
    error: isError ? (error as Error).message : null,
    data,
    search: triggerSearch
  };
}
