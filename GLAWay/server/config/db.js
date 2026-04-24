import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { runtimeConfig } from "./runtimeConfig.js";

let memoryServer;

const connectWithUri = async (uri) => {
  const conn = await mongoose.connect(uri);
  return conn;
};

export const connectDB = async () => {
  try {
    const conn = await connectWithUri(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    if (!runtimeConfig.allowMemoryDb) {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    }

    console.warn(`MongoDB connection failed: ${error.message}`);
    console.log("Falling back to an in-memory MongoDB instance");

    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    const conn = await connectWithUri(uri);
    console.log(`MongoDB memory server connected: ${conn.connection.host}`);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();

  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = undefined;
  }
};
