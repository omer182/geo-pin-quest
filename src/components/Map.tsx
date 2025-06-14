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
    cityName?: string;
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
        // Hide all labels and unwanted elements
        { featureType: "all", elementType: "labels", stylers: [{ visibility: "off" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "road", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.locality", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.province", stylers: [{ visibility: "off" }] },
        
        // Hide ALL stroke elements including grid lines and lat/lng lines
        { elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
        
        // Hide any remaining administrative boundaries except countries
        { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
        
        // Simple clean colors - land and water only
        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5dc" }] }, // Light beige land
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#4682b4" }] }, // Steel blue water
        
        // ONLY show country borders - clean dark lines
        { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ visibility: "on", color: "#333333", weight: 1.2 }] },
        
        // Ensure no grid lines or coordinate lines are visible
        { featureType: "all", elementType: "geometry.stroke", stylers: [{ visibility: "off" }] },
        { featureType: "administrative.country", elementType: "geometry.stroke", stylers: [{ visibility: "on", color: "#333333", weight: 1.2 }] }, // Re-enable only country borders
    ],
    disableDefaultUI: true,
    zoomControl: true,
    mapTypeId: 'roadmap', // Use roadmap for cleaner styling control
    tilt: 0,
    showTrafficLayer: false,
    showTransitLayer: false,
    showBicyclingLayer: false,
    gestureHandling: 'greedy',
    backgroundColor: '#4682b4', // Ocean blue background
    minZoom: 1, // Allow world view
    maxZoom: 10, // Maximum zoom level for detailed view
    restriction: {
        latLngBounds: {
            north: 85,  // Maximum latitude
            south: -85, // Minimum latitude  
            west: -180, // Minimum longitude
            east: 180   // Maximum longitude
        },
        strictBounds: false // Allow some panning beyond bounds
    }
};

const Map: React.FC<MapProps> = ({ googleMapsApiKey, onPinDrop, isInteractive, selectedPin, result }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey,
        libraries: ['geometry'], // Add geometry library for distance calculations
    });

    const mapRef = useRef<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
        map.setZoom(2); // Start zoomed in 50% more than default (was 1, now 2)
        map.setTilt(0); // Flat map perspective
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
            // Create bounds that include both guess and actual location
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(result.guess);
            bounds.extend(result.actual);
            
            // Calculate distance between points to determine optimal zoom
            const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
                new window.google.maps.LatLng(result.guess.lat, result.guess.lng),
                new window.google.maps.LatLng(result.actual.lat, result.actual.lng)
            );
            
            // Adjust padding based on distance - closer points need more padding
            let padding = { top: 120, right: 120, bottom: 200, left: 120 };
            if (distance < 100000) { // Less than 100km apart
                padding = { top: 180, right: 180, bottom: 240, left: 180 };
            } else if (distance < 500000) { // Less than 500km apart
                padding = { top: 150, right: 150, bottom: 220, left: 150 };
            }
            
            // Use fitBounds with generous padding to ensure both points are always visible
            mapRef.current.fitBounds(bounds, padding);
            
            // Ensure we don't zoom in too much for very close points
            setTimeout(() => {
                if (mapRef.current && mapRef.current.getZoom()! > 8) {
                    mapRef.current.setZoom(8);
                }
            }, 100);
            
        } else if (!result && mapRef.current) {
            // Reset to default zoom view (50% more than original)
            mapRef.current.setCenter({ lat: 20, lng: 0 });
            mapRef.current.setZoom(2);
            mapRef.current.setTilt(0);
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
                zoom={2} // Start at 50% more zoom than default (was 1, now 2)
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
                        <MarkerF position={result.actual} label={{ text: result.cityName || "Actual Location", color: "white" }} />
                        <PolylineF 
                            path={[result.guess, result.actual]} 
                            options={{ 
                                strokeColor: '#FF0000', 
                                strokeWeight: 3,
                                strokeOpacity: 0.8 
                            }} 
                        />
                    </>
                )}
            </GoogleMap>
        </div>
    );
};

export default Map;
