import { Server } from 'socket.io';
import Tourist from '../models/Tourist.js';
import Incident from '../models/Incident.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('admin-connect', () => {
      socket.join('admin-room');
      console.log('Admin connected:', socket.id);
      sendDashboardUpdate();
    });

    socket.on('emergency-alert', async (data) => {
      try {
        const incident = new Incident({
          touristId: data.touristId,
          type: 'Panic Button',
          severity: 'Critical',
          location: { type: 'Point', coordinates: [data.location.lng, data.location.lat] },
          description: 'Emergency panic button activated',
        });
        await incident.save();

        await Tourist.findByIdAndUpdate(data.touristId, { status: 'emergency', riskLevel: 'High' });

        io.to('admin-room').emit('emergency-notification', {
          incidentId: incident._id,
          touristId: data.touristId,
          touristName: data.touristName,
          type: 'Panic Button',
          severity: 'Critical',
          location: data.location,
          timestamp: new Date(),
          alertId: Math.random().toString(36).substr(2, 9),
        });

        io.to('admin-room').emit('emergency-sound-alert', { type: 'critical', repeat: 3 });
      } catch (error) {
        console.error('Error handling emergency alert:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

async function sendDashboardUpdate() {
  try {
    const totalTourists = await Tourist.countDocuments();
    const activeTourists = await Tourist.countDocuments({ lastActiveAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } });
    const activeIncidents = await Incident.countDocuments({ status: { $in: ['New', 'Acknowledged', 'In Progress'] } });
    const highRiskTourists = await Tourist.countDocuments({ riskLevel: 'High' });
    io.to('admin-room').emit('dashboard-stats-update', {
      activeTourists,
      totalTourists,
      emergencyAlerts: activeIncidents,
      highRiskAreas: highRiskTourists,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error sending dashboard update:', error);
  }
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};
