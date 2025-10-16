"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      socket = io({
        path: "/api/socket",
        addTrailingSlash: false,
      });

      socket.on("connect", () => {
        console.log("🔌 Socket.IO connected");
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        console.log("🔌 Socket.IO disconnected");
        setIsConnected(false);
      });

      socket.on("connected", (data) => {
        console.log("✅ Server confirmed:", data.message);
      });
    }

    return () => {
      // Don't disconnect on unmount (keep persistent connection)
      // socket?.disconnect();
    };
  }, []);

  return { socket, isConnected };
}

export function emitBusUpdate(data: any) {
  socket?.emit("bus-update", data);
}

export function emitCrowdReport(busId: string, crowdLevel: number) {
  socket?.emit("crowd-report", { busId, crowdLevel, timestamp: Date.now() });
}

export function onBusPositions(callback: (data: any) => void) {
  socket?.on("bus-positions", callback);
  return () => socket?.off("bus-positions", callback);
}

export function onCrowdUpdate(callback: (data: any) => void) {
  socket?.on("crowd-update", callback);
  return () => socket?.off("crowd-update", callback);
}
