
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl, { LngLat, Marker } from 'mapbox-gl';

interface MapProps {
  mapboxToken: string;
  onPinDrop: (lngLat: LngLat) => void;
  isInteractive: boolean;
  result?: {
    guess: LngLat;
    actual: LngLat;
  }
}

const Map: React.FC<MapProps> = ({ mapboxToken, onPinDrop, isInteractive, result }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [pin, setPin] = useState<Marker | null>(null);

  useEffect(() => {
    mapboxgl.accessToken = mapboxToken;
    if (map.current || !mapContainer.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 20],
      zoom: 1.5,
      projection: { name: 'globe' },
    });
    
    map.current.on('style.load', () => {
        map.current?.setFog({});
    });

    map.current.on('click', (e) => {
      if (!isInteractive) return;
      if (pin) pin.remove();
      const newPin = new mapboxgl.Marker({ color: '#3B82F6' })
        .setLngLat(e.lngLat)
        .addTo(map.current!);
      setPin(newPin);
      onPinDrop(e.lngLat);
    });

    return () => map.current?.remove();
  }, [mapboxToken]);

  useEffect(() => {
    if (map.current && result) {
        if(pin) pin.remove();

        new mapboxgl.Marker({ color: '#EF4444' }).setLngLat(result.guess).addTo(map.current);
        new mapboxgl.Marker({ color: '#22C55E' }).setLngLat(result.actual).addTo(map.current);

        const geojson: mapboxgl.GeoJSONSourceRaw['data'] = {
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [result.guess.lng, result.guess.lat],
                        [result.actual.lng, result.actual.lat]
                    ]
                },
                properties: {}
            }]
        };

        if (map.current.getSource('line')) {
            (map.current.getSource('line') as mapboxgl.GeoJSONSource).setData(geojson);
        } else {
            map.current.addSource('line', { type: 'geojson', data: geojson });
            map.current.addLayer({
                id: 'line-layer',
                type: 'line',
                source: 'line',
                paint: { 'line-width': 2, 'line-color': '#1F2937' }
            });
        }
        
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend(result.guess);
        bounds.extend(result.actual);
        map.current.fitBounds(bounds, { padding: 80, duration: 1000 });
    }
  }, [result, pin]);
  
  useEffect(() => {
    if (isInteractive && pin) {
        pin.remove();
        setPin(null);
    }
    if (isInteractive && map.current?.getSource('line')) {
        map.current.removeLayer('line-layer');
        map.current.removeSource('line');
    }
  }, [isInteractive, pin]);


  return <div ref={mapContainer} className="absolute inset-0" />;
};

export default Map;
