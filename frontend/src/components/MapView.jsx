import React from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapView({ trip }) {
  if (!trip?.route_geometry?.coordinates?.length) return <p>No route data available</p>;

  const positions = trip.route_geometry.coordinates;
  return (
    <div className="h-96 w-full">
      <MapContainer center={positions[0]} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={positions} color="blue" />
        {positions.map((pos, i) => (
          <Marker key={i} position={pos}>
            <Popup>{i === 0 ? 'Start' : i === positions.length-1 ? 'End' : `Point ${i}`}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
