import mongoose from 'mongoose';
import { initSocket } from '../socket/socket.js';

export const initializeServer = async (app) => {
    try {
        // Connect to MongoDB
        const mongooseOptions = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            autoIndex: process.env.NODE_ENV !== 'production',
            retryWrites: true
        };

        await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
        console.log('✅ MongoDB connected successfully');

        const PORT = process.env.PORT || 5000;

        // Start HTTP server
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`✅ Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Initialize Socket.io
        initSocket(server);

        // Handle graceful shutdown
        const gracefulShutdown = async () => {
            console.log('🛑 Received shutdown signal');
            
            try {
                // Close HTTP server
                await new Promise((resolve) => server.close(resolve));
                console.log('✅ HTTP server closed');

                // Close MongoDB connection
                await mongoose.connection.close();
                console.log('✅ MongoDB connection closed');

                process.exit(0);
            } catch (error) {
                console.error('Error during shutdown:', error);
                process.exit(1);
            }
        };

        // Setup shutdown handlers
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);

        return server;
    } catch (error) {
        console.error('Failed to initialize server:', error);
        process.exit(1);
    }
};
