import { Server as HttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import type { RequestHandler } from "express";

export function setupSocketServer(httpServer: HttpServer, sessionMiddleware: RequestHandler): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || '*' 
        : '*',
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Use session middleware for socket.io authentication
  io.engine.use(sessionMiddleware as any);

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });

    // Add any socket event handlers here as needed
  });

  return io;
}

