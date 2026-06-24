import mongoose from "mongoose";
import { initSocket } from "../socket/socket.js";

export const initializeServer = async (app) => {
  try {
    const mongooseOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      autoIndex: process.env.NODE_ENV !== "production",
      retryWrites: true,
    };

    await mongoose.connect(process.env.MONGO_URI, mongooseOptions);

    console.log("✅ MongoDB connected successfully");
    console.log(`✅ Environment: ${process.env.NODE_ENV || "development"}`);

    // Socket disabled for Vercel deployment
    initSocket();

    return true;
  } catch (error) {
    console.error("Failed to initialize server:", error);
    throw error;
  }
};