import { Server } from 'socket.io';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle emergency alerts
    socket.on('emergency-alert', (data) => {
      console.log('🚨 Emergency alert received:', data);
      
      // Broadcast to all connected clients (admin dashboards)
      socket.broadcast.emit('emergency-notification', {
        ...data,
        timestamp: new Date(),
        alertId: Math.random().toString(36).substr(2, 9)
      });
    });

    // Handle location updates
    socket.on('location-update', (data) => {
      console.log('📍 Location update received:', data);
      
      // Broadcast to admin dashboards
      socket.broadcast.emit('tourist-location-update', {
        ...data,
        timestamp: new Date()
      });
    });

    // Handle admin joining specific tourist room
    socket.on('join-tourist-room', (touristId) => {
      socket.join(`tourist-${touristId}`);
      console.log(`Admin joined room for tourist: ${touristId}`);
    });

    // Handle admin leaving tourist room
    socket.on('leave-tourist-room', (touristId) => {
      socket.leave(`tourist-${touristId}`);
      console.log(`Admin left room for tourist: ${touristId}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};