"use client";

import { MapContainer } from "@/components/map/map-container";
import { RouteSearch } from "@/components/route/route-search";
import { BusInfo } from "@/components/bus/bus-info";
import { SOSButton } from "@/components/safety/sos-button";
import { Header } from "@/components/layout/header";
import { InstallPrompt } from "@/components/layout/install-prompt";
import { DataSourceIndicator } from "@/components/layout/data-source-indicator";
import { useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export default function Home() {
  const setMapCenter = useAppStore((state) => state.setMapCenter);
  const setMapZoom = useAppStore((state) => state.setMapZoom);
  const setBuses = useAppStore((state) => state.setBuses);

  useEffect(() => {
    // Auto-detect user's location and center map
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([longitude, latitude]);
          setMapZoom(12);
          console.log("User location detected:", { latitude, longitude });
        },
        (error) => {
          console.log("Location detection failed, using default:", error);
          // Fallback to India center if location fails
          setMapCenter([78.9629, 20.5937]); // Center of India
          setMapZoom(5);
        }
      );
    } else {
      // Fallback to India center if geolocation not supported
      setMapCenter([78.9629, 20.5937]);
      setMapZoom(5);
    }

    // Register service worker for offline functionality
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }
  }, [setMapCenter, setMapZoom]);

  // Real-time bus position updates with Socket.IO
  useEffect(() => {
    // Fetch buses immediately on mount
    const fetchBuses = async () => {
      try {
        const response = await fetch("/api/buses");
        if (response.ok) {
          const buses = await response.json();
          setBuses(buses);
        }
      } catch (error) {
        console.error("Failed to fetch buses:", error);
      }
    };

    fetchBuses(); // Initial fetch

    // Try to establish Socket.IO connection for real-time updates
    let socket: any = null;
    let cleanup: (() => void) | null = null;
    
    try {
      const { onBusPositions } = require('@/lib/socket');
      
      // Listen for real-time bus position updates
      cleanup = onBusPositions((buses: any[]) => {
        console.log('📡 Received real-time bus update via Socket.IO:', buses.length, 'buses');
        setBuses(buses);
      });
      
      console.log('✅ Socket.IO real-time updates enabled');
    } catch (error) {
      console.log('⚠️ Socket.IO not available, falling back to polling');
      
      // Fallback to polling if Socket.IO fails
      const interval = setInterval(fetchBuses, 5000);
      cleanup = () => clearInterval(interval);
    }

    // Cleanup on unmount
    return () => {
      if (cleanup) cleanup();
    };
  }, [setBuses]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <Header />
      
      {/* Main Map Container */}
      <MapContainer />
      
      {/* Search Overlay */}
      <div className="absolute top-20 left-4 right-4 z-10 md:left-8 md:right-auto md:w-96">
        <RouteSearch />
      </div>
      
      {/* Bus Info Panel */}
      <div className="absolute bottom-4 left-4 right-4 z-10 md:left-8 md:right-auto md:w-96">
        <BusInfo />
      </div>
      
      {/* SOS Floating Action Button */}
      <div className="absolute bottom-4 right-4 z-20">
        <SOSButton />
      </div>

      {/* Data Source Indicator */}
      <DataSourceIndicator />

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
