import axios from 'axios';
import { CityCoords } from '../types';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

export const fetchCitySuggestions = async (query: string): Promise<CityCoords[]> => {
  if (!query || query.length < 3) return [];
  
  try {
    const response = await axios.get<NominatimResult[]>('https://nominatim.openstreetmap.org/search', {
      params: {
        format: 'json',
        q: query,
        countrycodes: 'us',
        limit: 5,
        featuretype: 'city'
      }
    });

    return response.data.map(item => ({
      name: item.display_name.split(',')[0] + ', ' + item.display_name.split(',')[1]?.trim(), // e.g. "Chicago, Illinois"
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    }));
  } catch (error) {
    console.error("Geocoding failed:", error);
    return [];
  }
};
