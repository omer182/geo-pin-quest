
import React, { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, PolylineF } from '@react-google-maps/api';

type LatLng = {
  lat: number;
  lng: number;
};

interface MapProps {
  googleMapsApiKey: string;
  onPinDrop: (latLng: LatLng) => void;
  isInteractive: boolean;
  selectedPin: LatLng | null;
  result?: {
    guess: LatLng;
    actual: LatLng;
  }
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 20,
  lng: 0
};

const mapOptions = {
    styles: [
        { featureType: "administrative", elementType: "all", stylers: [{ visibility: "off" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "road", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "water", elementType: "labels.text", stylers: [{ visibility: "off" }] },
    ],
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeId: 'satellite'
};

const Map: React.FC<MapProps> = ({ googleMapsApiKey, onPinDrop, isInteractive, selectedPin, result }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey,
    });

    const mapRef = useRef<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
        map.setZoom(2);
    }, []);

    const onUnmount = useCallback(() => {
        mapRef.current = null;
    }, []);

    const handleMapClick = (e: google.maps.MapMouseEvent) => {
        if (!isInteractive || !e.latLng) return;
        onPinDrop(e.latLng.toJSON());
    };
    
    useEffect(() => {
        if (result && mapRef.current && window.google) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(result.guess);
            bounds.extend(result.actual);
            mapRef.current.fitBounds(bounds, 80);
        }
    }, [result]);

    if (loadError) {
        return <div className="flex items-center justify-center h-full bg-red-100 text-red-700">Error loading map. Please check the API key.</div>;
    }

    if (!isLoaded) return <div className="flex items-center justify-center h-full">Loading Map...</div>;
    
    return (
        <div className="absolute inset-0">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={2}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={handleMapClick}
                options={mapOptions}
            >
                {isInteractive && selectedPin && (
                    <MarkerF position={selectedPin} />
                )}
                {result && (
                    <>
                        <MarkerF position={result.guess} label={{ text: "Your Guess", color: "white" }} />
                        <MarkerF position={result.actual} label={{ text: "Actual Location", color: "white" }} />
                        <PolylineF path={[result.guess, result.actual]} options={{ strokeColor: '#FFFFFF', strokeWeight: 2 }} />
                    </>
                )}
            </GoogleMap>
        </div>
    );
};

export default Map;
