'use client';
import React, { useEffect, useRef, memo } from 'react';

function MapComponent({ lat, lng, name, requests, volunteers, onMapClick, selectedLocation, routeCoordinates, tacticalMode, deviceLat, deviceLng }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const baseMarkerRef = useRef(null);
  const selectedMarkerRef = useRef(null);
  const deviceMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const routeGlowRef = useRef(null);
  const tileLayerRef = useRef(null);
  const onMapClickRef = useRef(onMapClick);

  // Keep callback reference updated without triggering effect re-runs
  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  // 1. Initialize Map Instance (Only runs once on mount)
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    const L = require('leaflet');
    
    // Fix default marker icon issues in Webpack/Next.js
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: true,
        zoomControl: true,
        doubleClickZoom: true,
        touchZoom: true,
        boxZoom: true,
        dragging: true,
        preferCanvas: true // Significant performance boost for complex leaflet layers
      }).setView([lat || 12.3275, lng || 76.6133], 13);

      const onMapClicked = (e) => {
        if (onMapClickRef.current) {
          onMapClickRef.current({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
      };
      map.on('click', onMapClicked);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Sync Map View Center smoothly when lat/lng changes
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const currentCenter = mapRef.current.getCenter();
    if (Math.abs(currentCenter.lat - lat) > 0.05 || Math.abs(currentCenter.lng - lng) > 0.05) {
      mapRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
    }
  }, [lat, lng]);

  // 3. Dynamic Map Theme based on Tactical Mode
  useEffect(() => {
    if (!mapRef.current) return;
    const L = require('leaflet');

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const tileUrl = tacticalMode
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

    const attribution = tacticalMode
      ? '&copy; OpenStreetMap contributors &copy; CARTO'
      : '&copy; OpenStreetMap contributors';

    tileLayerRef.current = L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(mapRef.current);
  }, [tacticalMode]);

  // 4. Sync Base Depot Marker
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;
    const L = require('leaflet');
    const map = mapRef.current;

    if (baseMarkerRef.current) {
      baseMarkerRef.current.remove();
    }
    const baseIcon = L.divIcon({
      className: 'base-station-marker',
      html: `<div style="display: flex; align-items: center; justify-content: center; width: 30px; height: 30px;"><i class="fas fa-map-pin" style="color: #ef4444; font-size: 26px; filter: drop-shadow(0 0 4px rgba(239,68,68,0.8));"></i></div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });
    baseMarkerRef.current = L.marker([lat, lng], { icon: baseIcon })
      .addTo(map)
      .bindPopup(`<b>📡 ResQ Link Resource Depot (${name || 'Depot'})</b><br>Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}<br>Status: Active Depot`);
  }, [lat, lng, name]);

  // 5. Sync Request, Volunteer, and Shelter Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = require('leaflet');

    // Clear old request, volunteer, and shelter markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Shelters
    const mockShelters = [
      { lat: (lat || 12.3275) + 0.003, lng: (lng || 76.6133) - 0.004, name: 'Mandya Emergency Shelter A', capacity: '120/150' },
      { lat: (lat || 12.3275) - 0.004, lng: (lng || 76.6133) + 0.005, name: 'MIMS Doctors Quarters Shelter', capacity: '85/100' }
    ];
    mockShelters.forEach(s => {
      const shelterIcon = L.divIcon({
        className: 'shelter-marker',
        html: `<div style="background: radial-gradient(circle at 30% 30%, #22c55e, #15803d); width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px rgba(34,197,94,0.8);"><i class="fas fa-home" style="color: white; font-size: 11px;"></i></div>`,
        iconSize: [24, 24]
      });
      const shelterMarker = L.marker([s.lat, s.lng], { icon: shelterIcon })
        .addTo(map)
        .bindPopup(`<b>🟢 Shelter: ${s.name}</b><br>Capacity: ${s.capacity}<br>Status: Operational`);
      markersRef.current.push(shelterMarker);
    });

    // Requests (Disaster zones)
    if (requests && requests.length > 0) {
      requests.forEach(req => {
        if (req.status !== 'resolved' && req.status !== 'fake') {
          const isVerified = req.verified !== false;
          const markerColor1 = isVerified ? '#ef4444' : '#f97316';
          const markerColor2 = isVerified ? '#b91c1c' : '#c2410c';
          const shadowColor = isVerified ? 'rgba(239,68,68,0.8)' : 'rgba(249,115,22,0.8)';
          const iconClass = isVerified ? 'fa-exclamation-triangle' : 'fa-phone-alt';

          const customIcon = L.divIcon({
            className: 'custom-request-marker',
            html: `<div style="background: radial-gradient(circle at 30% 30%, ${markerColor1}, ${markerColor2}); width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 10px ${shadowColor};"><i class="fas ${iconClass}" style="color: white; font-size: 10px;"></i></div>`,
            iconSize: [24, 24]
          });

          const hasOffset = req.publisherLat && req.publisherLng && (Math.abs(req.publisherLat - req.lat) > 0.00001 || Math.abs(req.publisherLng - req.lng) > 0.00001);

          const reqMarker = L.marker([req.lat, req.lng], { icon: customIcon })
            .addTo(map)
            .bindPopup(`
              <b>🚨 ${isVerified ? 'Disaster Zone' : 'Other Location (Unverified)'}: ${req.requestId || req.id} (${req.resourceType})</b><br>
              Severity: ${req.severity} | Affected: ${req.individualsAffected}<br>
              Priority Score: ${req.priorityScore}<br>
              Status: ${(req.status || '').toUpperCase()} (${isVerified ? 'VERIFIED' : 'UNVERIFIED'})<br>
              Target Location: ${Number(req.lat).toFixed(5)}, ${Number(req.lng).toFixed(5)}
              ${req.publisherLat && req.publisherLng ? `<br>Published From: ${Number(req.publisherLat).toFixed(5)}, ${Number(req.publisherLng).toFixed(5)}` : ''}
            `);
          markersRef.current.push(reqMarker);

          if (hasOffset) {
            const connectionLine = L.polyline([[req.publisherLat, req.publisherLng], [req.lat, req.lng]], {
              color: '#f59e0b',
              weight: 2,
              dashArray: '5, 8',
              opacity: 0.8
            }).addTo(map)
              .bindPopup(`<b>Broadcast Offset for ${req.requestId || req.id}</b><br>Device location is separate from pinned disaster target location.`);
            markersRef.current.push(connectionLine);

            const broadcastIcon = L.divIcon({
              className: 'broadcast-node-marker',
              html: `
                <div style="background: radial-gradient(circle at 30% 30%, #f59e0b, #d97706); width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 6px rgba(245,158,11,0.8);">
                  <i class="fas fa-satellite-dish" style="color: white; font-size: 6px;"></i>
                </div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            });
            const broadcastMarker = L.marker([req.publisherLat, req.publisherLng], { icon: broadcastIcon })
              .addTo(map)
              .bindPopup(`<b>📡 Broadcast Node (${req.requestId || req.id})</b><br>Lat: ${Number(req.publisherLat).toFixed(5)}<br>Lng: ${Number(req.publisherLng).toFixed(5)}`);
            markersRef.current.push(broadcastMarker);
          }
        }
      });
    }

    // Volunteers
    if (volunteers && volunteers.length > 0) {
      volunteers.forEach(v => {
        const icon = L.divIcon({
          className: 'volunteer-marker',
          html: `<div style="background: radial-gradient(circle at 30% 30%, #3b82f6, #1d4ed8); width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 8px rgba(59,130,246,0.8);"><i class="fas fa-user-shield" style="color: white; font-size: 10px;"></i></div>`,
          iconSize: [24, 24]
        });

        const volMarker = L.marker([v.lat, v.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>🔵 Rescue Team: ${v.name}</b><br>Role: ${v.role}<br>Status: ${(v.status || '').toUpperCase()}`);
        markersRef.current.push(volMarker);
      });
    }
  }, [lat, lng, requests, volunteers]);

  // 6. Draw Selected Location Marker dynamically
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = require('leaflet');

    if (selectedMarkerRef.current) {
      selectedMarkerRef.current.remove();
      selectedMarkerRef.current = null;
    }

    if (selectedLocation && selectedLocation.lat && selectedLocation.lng) {
      selectedMarkerRef.current = L.marker([selectedLocation.lat, selectedLocation.lng])
        .addTo(map)
        .bindPopup(`<b>Emergency Target Point</b><br>Lat: ${selectedLocation.lat.toFixed(6)}<br>Lng: ${selectedLocation.lng.toFixed(6)}`)
        .openPopup();
    }
  }, [selectedLocation]);

  // 7. Draw Device GPS (Publisher) marker dynamically
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = require('leaflet');

    if (deviceMarkerRef.current) {
      deviceMarkerRef.current.remove();
      deviceMarkerRef.current = null;
    }

    if (deviceLat && deviceLng) {
      const deviceIcon = L.divIcon({
        className: 'device-gps-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
            <div style="position: absolute; width: 24px; height: 24px; background: rgba(59, 130, 246, 0.4); border-radius: 50%;"></div>
            <div style="position: absolute; width: 14px; height: 14px; background: #2563eb; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 0 8px rgba(37,99,235,0.7);"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      deviceMarkerRef.current = L.marker([deviceLat, deviceLng], { icon: deviceIcon })
        .addTo(map)
        .bindPopup(`<b>📡 Your Device GPS (Publisher)</b><br>Lat: ${deviceLat.toFixed(6)}<br>Lng: ${deviceLng.toFixed(6)}<br>Status: GPS Tracking Active`);
    }
  }, [deviceLat, deviceLng]);

  // 8. Draw route polyline dynamically
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const L = require('leaflet');

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }
    if (routeGlowRef.current) {
      routeGlowRef.current.remove();
      routeGlowRef.current = null;
    }

    if (routeCoordinates && routeCoordinates.length > 0) {
      if (tacticalMode) {
        routeGlowRef.current = L.polyline(routeCoordinates, {
          color: '#39ff14',
          weight: 10,
          opacity: 0.3
        }).addTo(map);

        routePolylineRef.current = L.polyline(routeCoordinates, {
          color: '#39ff14',
          weight: 4,
          opacity: 1.0
        }).addTo(map);
      } else {
        routePolylineRef.current = L.polyline(routeCoordinates, {
          color: '#2563eb',
          weight: 4,
          opacity: 0.8
        }).addTo(map);
      }
      map.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });
    }
  }, [routeCoordinates, tacticalMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ width: '90%', position: 'relative', minHeight: '400px', height: '100%' }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />
      </div>
      <div style={{ width: '10%', background: 'transparent' }} />
    </div>
  );
}

export default memo(MapComponent);
