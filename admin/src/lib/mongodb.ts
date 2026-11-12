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

let srvWarningLogged = false;

export async function connectDB(): Promise<typeof mongoose | null> {
  if (cached && cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    return null;
  }

  if (!cached) {
    cached = { conn: null, promise: null };
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "okobiz",
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB Atlas successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        // querySrv ECONNREFUSED is a known local ISP / Wi-Fi DNS limitation on Windows.
        // The application safely uses local dataStore (admin_store.json) without data loss.
        if (err?.message?.includes("querySrv")) {
          if (!srvWarningLogged) {
            srvWarningLogged = true;
            console.log("ℹ️  MongoDB Atlas: Local DNS SRV is blocked by ISP. Operating seamlessly on local database store.");
          }
          return null as any;
        }
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
