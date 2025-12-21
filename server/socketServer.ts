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

  // Use session middleware for socket.io authentication (if provided)
  // Note: Socket.IO session middleware is optional - collaboration works without it
  // Skip session middleware for now to avoid compatibility issues
  // Sessions are handled at the HTTP level, Socket.IO connections don't require it

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Handle joining collaboration room for an idea
    socket.on("join_idea_room", (ideaId: string) => {
      const room = `idea:${ideaId}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room: ${room}`);
      
      // Notify others in the room (optional - for active user tracking)
      socket.to(room).emit("user_joined", { socketId: socket.id });
    });

    // Handle leaving collaboration room
    socket.on("leave_idea_room", (ideaId: string) => {
      const room = `idea:${ideaId}`;
      socket.leave(room);
      console.log(`[Socket] ${socket.id} left room: ${room}`);
      
      // Notify others in the room
      socket.to(room).emit("user_left", { socketId: socket.id });
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

