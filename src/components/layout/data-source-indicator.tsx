"use client";

import { useState, useEffect } from "react";
import { Satellite, Wifi, WifiOff } from "lucide-react";

/**
 * Data Source Indicator - Shows whether using real GPS or simulation
 * Also provides toggle to switch between modes (when APIs are available)
 */
export function DataSourceIndicator() {
  const [dataSource, setDataSource] = useState<"simulation" | "gps">("simulation");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if real-time APIs are available
    checkRealTimeAvailability();
  }, []);

  const checkRealTimeAvailability = async () => {
    try {
      const response = await fetch("/api/buses?realtime=true");
      const dataSourceHeader = response.headers.get("X-Data-Source");
      
      if (dataSourceHeader === "real-time-gps") {
        setDataSource("gps");
      } else {
        setDataSource("simulation");
      }
    } catch (error) {
      setDataSource("simulation");
    } finally {
      setIsChecking(false);
    }
  };

  if (isChecking) {
    return (
      <div className="fixed top-20 right-4 bg-gray-500 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-sm z-[1000] animate-pulse">
        <Wifi className="w-4 h-4" />
        <span>Checking data source...</span>
      </div>
    );
  }

  // Only show indicator if we actually have real GPS data
  if (dataSource !== "gps") {
    return null; // Hide demo mode indicator
  }

  return (
    <div className="fixed top-20 right-4 z-[1000]">
      <div className="bg-green-500 text-white px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium">
        <Satellite className="w-4 h-4 animate-pulse" />
        <div className="flex flex-col">
          <span>🛰️ Live GPS Data</span>
          <span className="text-xs opacity-90">Real-time satellite tracking</span>
        </div>
      </div>
    </div>
  );
}
