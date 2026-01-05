import { useState, useEffect } from 'react';

const GoogleMap = ({ location, onLocationSelect, latitude, longitude }) => {
  const [searchInput, setSearchInput] = useState(location || '');
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [selectedCoords, setSelectedCoords] = useState({
    lat: latitude || 40.7128,
    lng: longitude || -74.0060
  });

  // Load Google Maps script
  useEffect(() => {
    if (window.google && window.google.maps) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    }
  }, []);

  const initMap = () => {
    const mapElement = document.getElementById('google-map');
    if (!mapElement) return;

    const mapInstance = new window.google.maps.Map(mapElement, {
      zoom: 12,
      center: selectedCoords
    });

    const markerInstance = new window.google.maps.Marker({
      map: mapInstance,
      position: selectedCoords,
      draggable: true
    });

    // Handle marker drag
    markerInstance.addListener('dragend', () => {
      const pos = markerInstance.getPosition();
      setSelectedCoords({
        lat: pos.lat(),
        lng: pos.lng()
      });
      onLocationSelect({
        address: searchInput,
        latitude: pos.lat(),
        longitude: pos.lng()
      });
    });

    // Handle map click
    mapInstance.addListener('click', (e) => {
      markerInstance.setPosition(e.latLng);
      setSelectedCoords({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
      onLocationSelect({
        address: searchInput,
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng()
      });
    });

    setMap(mapInstance);
    setMarker(markerInstance);
  };

  const handleSearchLocation = async (e) => {
    if (e.key !== 'Enter') return;

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchInput }, (results, status) => {
      if (status === window.google.maps.GeocoderStatus.OK && results[0]) {
        const location = results[0].geometry.location;
        const coords = {
          lat: location.lat(),
          lng: location.lng()
        };

        setSelectedCoords(coords);
        map.setCenter(coords);
        map.setZoom(15);
        marker.setPosition(coords);

        onLocationSelect({
          address: results[0].formatted_address,
          latitude: coords.lat,
          longitude: coords.lng
        });

        setSearchInput(results[0].formatted_address);
      } else {
        alert('Location not found. Please try again.');
      }
    });
  };

  return (
    <div className="google-map-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter location and press Enter"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={handleSearchLocation}
          className="location-search-input"
        />
      </div>
      <div id="google-map" className="map-canvas"></div>
      <div className="coordinates-display">
        <p>Latitude: {selectedCoords.lat.toFixed(4)}</p>
        <p>Longitude: {selectedCoords.lng.toFixed(4)}</p>
      </div>
    </div>
  );
};

export default GoogleMap;
