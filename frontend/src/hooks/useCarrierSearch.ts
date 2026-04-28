import { useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SearchResponseSchema, type SearchResponse, type CityCoords } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY || '';

export function useCarrierSearch() {
  const [searchParams, setSearchParams] = useState<{ origin: CityCoords; dest: CityCoords } | null>(null);

  const { data, isLoading, isError, error } = useQuery<SearchResponse>({
    queryKey: ['carriers', searchParams?.origin.name, searchParams?.dest.name],
    queryFn: async () => {
      if (!searchParams) return { origin: '', destination: '', carriers: [] };
      
      const response = await axios.get(`${API_BASE_URL}/api/v1/search`, {
        params: { origin: searchParams.origin.name, destination: searchParams.dest.name },
        headers: {
          'X-API-Key': API_KEY
        }
      });
      
      return SearchResponseSchema.parse(response.data);
    },
    enabled: !!searchParams,
  });

  const triggerSearch = (origin: CityCoords, dest: CityCoords) => {
    setSearchParams({ origin, dest });
  };

  return {
    originData: searchParams?.origin || null,
    destData: searchParams?.dest || null,
    loading: isLoading,
    error: isError ? (error as Error).message : null,
    data,
    search: triggerSearch
  };
}
