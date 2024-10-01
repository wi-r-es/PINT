import React from 'react';
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: '400px',
  height: '400px'
};
const MAPS_API_KEY  = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const MapComponent = ({ location }) => {
  const [lat, lng] = location.split(' ').map(coord => parseFloat(coord.trim()));

  const center = {
    lat: lat,
    lng: lng
  };

  console.log(center);

  return (
    <LoadScript googleMapsApiKey={`${MAPS_API_KEY}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={10}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
};

export default MapComponent;
