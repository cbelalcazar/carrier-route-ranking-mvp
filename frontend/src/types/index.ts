import { z } from 'zod';

export const CarrierSchema = z.object({
  name: z.string(),
  trucks_per_day: z.number().min(0),
});

export const SearchResponseSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  carriers: z.array(CarrierSchema),
});

export type Carrier = z.infer<typeof CarrierSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

export interface CityCoords {
  lat: number;
  lng: number;
  name: string;
}
