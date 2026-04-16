import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

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
    console.warn(`MongoDB connection failed: ${error.message}`);
    console.log("Falling back to an in-memory MongoDB instance for local development");

    memoryServer = await MongoMemoryServer.create();
    const uri = memoryServer.getUri();
    const conn = await connectWithUri(uri);
    console.log(`MongoDB memory server connected: ${conn.connection.host}`);
  }
};
