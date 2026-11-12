import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

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
  if (cached && cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    console.error("MONGODB_URI environment variable is missing in .env.local!");
    return null;
  }

  if (!cached) {
    cached = { conn: null, promise: null };
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: "okobiz_site",
      serverSelectionTimeoutMS: 15000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB Atlas (okobiz_site) successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("MongoDB Atlas connection error:", err.message);
        if (cached) cached.promise = null;
        return null as any;
      });
  }

  try {
    cached.conn = await cached.promise;
    if (!cached.conn || cached.conn.connection.readyState !== 1) {
      cached.promise = null;
      cached.conn = null;
    }
    return cached.conn;
  } catch (e: any) {
    console.error("MongoDB connectDB error:", e?.message);
    cached.promise = null;
    cached.conn = null;
    return null;
  }
}
