// Socket.IO Server for Real-time Bus Updates
// This provides WebSocket communication for instant updates

import { Server as HTTPServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

let io: SocketIOServer | undefined;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!io) {
    // @ts-ignore
    const httpServer: HTTPServer = res.socket.server;
    
    io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Handle real-time bus position updates
    io.on("connection", (socket) => {
      console.log("✅ Client connected:", socket.id);

      // Send initial connection confirmation
      socket.emit("connected", { message: "Real-time connection established" });

      // Listen for bus position updates (from transit authorities)
      socket.on("bus-update", (data) => {
        // Broadcast bus updates to all connected clients
        io?.emit("bus-positions", data);
      });

      // Listen for crowd reports from users
      socket.on("crowd-report", (data) => {
        console.log("Crowd report received:", data);
        // Broadcast crowd updates to all clients
        io?.emit("crowd-update", data);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        console.log("❌ Client disconnected:", socket.id);
      });
    });

    // @ts-ignore
    res.socket.server.io = io;

    console.log("🚀 Socket.IO server initialized");
  }

  res.end();
}
