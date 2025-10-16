"use client";

import { useEffect, useRef, useState } from "react";
import Map, { Marker, Source, Layer, NavigationControl } from "react-map-gl";
import { useAppStore } from "@/store/app-store";
import { Bus } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import { motion } from "framer-motion";
import type { Bus as BusType } from "@/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export function MapContainer() {
  const mapRef = useRef<any>(null);
  const mapCenter = useAppStore((state) => state.mapCenter);
  const mapZoom = useAppStore((state) => state.mapZoom);
  const buses = useAppStore((state) => state.buses);
  const currentRoute = useAppStore((state) => state.currentRoute);
  const setSelectedBus = useAppStore((state) => state.setSelectedBus);
  const [viewState, setViewState] = useState({
    longitude: mapCenter[0],
    latitude: mapCenter[1],
    zoom: mapZoom,
  });

  // Update viewState when mapCenter or mapZoom changes
  useEffect(() => {
    setViewState({
      longitude: mapCenter[0],
      latitude: mapCenter[1],
      zoom: mapZoom,
    });
  }, [mapCenter, mapZoom]);

  // Route layer style
  const routeLayerStyle = {
    id: "route",
    type: "line" as const,
    paint: {
      "line-color": "#3b82f6",
      "line-width": 4,
      "line-opacity": 0.8,
    },
  };

  const getCrowdColor = (crowdLevel: number) => {
    if (crowdLevel <= 40) return "#10b981";
    if (crowdLevel <= 70) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="h-full w-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="bottom-right" />

        {/* Draw route if available */}
        {currentRoute && currentRoute.coordinates && (
          <Source
            id="route-source"
            type="geojson"
            data={{
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: currentRoute.coordinates,
              },
            }}
          >
            <Layer {...routeLayerStyle} />
          </Source>
        )}

        {/* Bus markers */}
        {buses.map((bus: BusType) => (
          <Marker
            key={bus.id}
            longitude={bus.location.longitude}
            latitude={bus.location.latitude}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedBus(bus);
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
              className="relative cursor-pointer"
            >
              {/* Pulse ring for active buses */}
              <div
                className="absolute inset-0 rounded-full animate-pulse-ring"
                style={{
                  backgroundColor: getCrowdColor(bus.crowdLevel),
                  opacity: 0.4,
                }}
              />
              {/* Bus icon */}
              <div
                className="relative rounded-full p-2 shadow-lg"
                style={{
                  backgroundColor: getCrowdColor(bus.crowdLevel),
                  transform: `rotate(${bus.heading}deg)`,
                }}
              >
                <Bus className="h-4 w-4 text-white" />
              </div>
              {/* Route number badge */}
              <div className="absolute -top-2 -right-2 bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 text-xs font-bold shadow-md border-2 border-current">
                {bus.routeNumber}
              </div>
            </motion.div>
          </Marker>
        ))}
      </Map>
    </div>
  );
}
