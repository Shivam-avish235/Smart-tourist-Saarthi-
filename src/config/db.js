import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const mongooseOptions = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            autoIndex: process.env.NODE_ENV !== 'production',
            retryWrites: true
        };

        let retries = 5;
        while (retries > 0) {
            try {
                const conn = await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
                console.log(`✅ MongoDB connected: ${conn.connection.host}`);
                
                // Add connection event listeners
                mongoose.connection.on('disconnected', () => {
                    console.log('MongoDB disconnected! Attempting to reconnect...');
                });

                mongoose.connection.on('error', (err) => {
                    console.error('MongoDB connection error:', err);
                });

                return true;
            } catch (error) {
                console.error(`Connection attempt failed (${retries} retries left):`, error.message);
                retries--;
                if (retries === 0) throw error;
                await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retrying
            }
        }
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        process.exit(1);
    }
};

export default connectDB;
