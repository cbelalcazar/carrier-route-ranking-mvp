import type { CityCoords } from '../types';

export const CITY_DB: Record<string, CityCoords> = {
  "new york": { lat: 40.7128, lng: -74.0060, name: "New York, NY" },
  "new york, ny": { lat: 40.7128, lng: -74.0060, name: "New York, NY" },
  "nyc": { lat: 40.7128, lng: -74.0060, name: "New York, NY" },
  "washington dc": { lat: 38.9072, lng: -77.0369, name: "Washington, DC" },
  "washington, dc": { lat: 38.9072, lng: -77.0369, name: "Washington, DC" },
  "dc": { lat: 38.9072, lng: -77.0369, name: "Washington, DC" },
  "san francisco": { lat: 37.7749, lng: -122.4194, name: "San Francisco, CA" },
  "san francisco, ca": { lat: 37.7749, lng: -122.4194, name: "San Francisco, CA" },
  "sf": { lat: 37.7749, lng: -122.4194, name: "San Francisco, CA" },
  "los angeles": { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
  "los angeles, ca": { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
  "la": { lat: 34.0522, lng: -118.2437, name: "Los Angeles, CA" },
  "chicago": { lat: 41.8781, lng: -87.6298, name: "Chicago, IL" },
  "chicago, il": { lat: 41.8781, lng: -87.6298, name: "Chicago, IL" },
  "miami": { lat: 25.7617, lng: -80.1918, name: "Miami, FL" },
  "miami, fl": { lat: 25.7617, lng: -80.1918, name: "Miami, FL" },
  "austin": { lat: 30.2672, lng: -97.7431, name: "Austin, TX" },
  "austin, tx": { lat: 30.2672, lng: -97.7431, name: "Austin, TX" },
  "dallas": { lat: 32.7767, lng: -96.7970, name: "Dallas, TX" },
  "dallas, tx": { lat: 32.7767, lng: -96.7970, name: "Dallas, TX" },
};

export const UI_SUGGESTIONS = [
  "New York, NY", "Washington, DC", "San Francisco, CA", "Los Angeles, CA",
  "Chicago, IL", "Miami, FL", "Austin, TX", "Dallas, TX",
];
