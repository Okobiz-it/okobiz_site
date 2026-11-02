import mongoose from "mongoose";
import dns from "dns";

// Ensure SRV DNS lookup succeeds reliably for MongoDB Atlas clusters across Windows networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://okobizit_db_user:gEgpQgjQ3ROCM7dH@cluster0.ir3r065.mongodb.net/okobiz?retryWrites=true&w=majority&appName=Cluster0";

interface GlobalWithMongoose {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const globalWithMongoose = global as unknown as GlobalWithMongoose;

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose | null> {
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (!cached) {
    cached = { conn: null, promise: null };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "okobiz",
      serverSelectionTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB Atlas (okobiz database) successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        console.warn("MongoDB connection warning:", err.message);
        return null as any;
      });
  }

  try {
    cached.conn = await cached.promise;
    if (!cached.conn) {
      cached.promise = null;
    }
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    return null;
  }
}
