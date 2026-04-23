import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { CityCoords } from '../types';
import L from 'leaflet';

const createLabelIcon = (label: string, color: string) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="flex flex-col items-center">
          <div class="bg-white px-2 py-0.5 rounded shadow-lg border border-slate-200 text-[10px] font-black text-slate-700 whitespace-nowrap mb-1 uppercase tracking-widest">${label}</div>
          <div class="relative flex items-center justify-center">
            <div class="absolute w-5 h-5 bg-${color}-500/30 rounded-full animate-ping"></div>
            <div class="w-2.5 h-2.5 bg-${color}-600 rounded-full border-2 border-white shadow-md"></div>
          </div>
         </div>`,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

interface MapProps {
  origin?: CityCoords;
  destination?: CityCoords;
}

// Senior Logic: Synthetic Route Generation (Simulating 3 fastest routes)
const generateAltRoutes = (start: CityCoords, end: CityCoords) => {
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  
  // Offset factors for alternative curves
  const offset = 0.5; 

  return [
    // Route 1: Direct (Main)
    { positions: [[start.lat, start.lng], [end.lat, end.lng]], color: "#2D7DFA", weight: 5, opacity: 0.8, dash: "" },
    
    // Route 2: North/East Alternative
    { 
      positions: [[start.lat, start.lng], [midLat + offset, midLng + offset], [end.lat, end.lng]], 
      color: "#2D7DFA", weight: 3, opacity: 0.4, dash: "10, 10" 
    },
    
    // Route 3: South/West Alternative
    { 
      positions: [[start.lat, start.lng], [midLat - offset, midLng - offset], [end.lat, end.lng]], 
      color: "#2D7DFA", weight: 3, opacity: 0.4, dash: "10, 10" 
    }
  ];
};

function MapController({ origin, destination }: MapProps) {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    if (origin && destination) {
      const bounds = L.latLngBounds([origin.lat, origin.lng], [destination.lat, destination.lng]);
      map.fitBounds(bounds, { 
        padding: [100, 100], 
        maxZoom: 6,
        animate: true,
        duration: 1.2
      });
    } else if (origin) {
      map.setView([origin.lat, origin.lng], 6, { animate: true });
    } else if (destination) {
      map.setView([destination.lat, destination.lng], 6, { animate: true });
    }
  }, [origin, destination, map]);

  return null;
}

export default function RouteMap({ origin, destination }: MapProps) {
  const defaultCenter: [number, number] = [39.8283, -98.5795];
  
  const routes = (origin && destination) ? generateAltRoutes(origin, destination) : [];

  return (
    <div className="w-full h-full bg-[#f4f7f9]">
      <MapContainer 
        center={defaultCenter} 
        zoom={4} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', background: '#f4f7f9' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution='&copy; CARTO'
        />
        
        <MapController origin={origin} destination={destination} />

        {origin && (
          <Marker position={[origin.lat, origin.lng]} icon={createLabelIcon(origin.name, 'blue')}>
            <Popup className="font-sans font-bold">Node: {origin.name}</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={createLabelIcon(destination.name, 'indigo')}>
            <Popup className="font-sans font-bold">Node: {destination.name}</Popup>
          </Marker>
        )}

        {routes.map((route, idx) => (
          <Polyline 
            key={idx}
            positions={route.positions as L.LatLngExpression[]} 
            pathOptions={{
              color: route.color,
              weight: route.weight,
              opacity: route.opacity,
              dashArray: route.dash
            }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
