import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';

// Fix for default markers in react-leaflet
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    }
  });
  return null;
}

const MapPicker = ({ initialLat, initialLng, onLocationChange, height = '300px' }) => {
  const [position, setPosition] = useState(
    initialLat && initialLng ? [Number(initialLat), Number(initialLng)] : [-7.0, 110.0]
  );

  const handleLocationSelect = (latlng) => {
    setPosition([latlng.lat, latlng.lng]);
    onLocationChange(latlng.lat, latlng.lng);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={position}
        zoom={10}
        style={{ height, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        <Marker position={position} />
      </MapContainer>
      <p className="text-xs text-gray-500 mt-1">
        Klik di peta untuk memilih lokasi. Koordinat: {position[0].toFixed(6)}, {position[1].toFixed(6)}
      </p>
    </div>
  );
};

export default MapPicker;
