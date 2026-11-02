const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

let uri = process.env.MONGODB_URI;
if (!uri) {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/MONGODB_URI=["']?([^"'\r\n]+)["']?/);
    if (match) uri = match[1];
  }
}

if (!uri) {
  uri = "mongodb+srv://okobizit_db_user:gEgpQgjQ3ROCM7dH@cluster0.ir3r065.mongodb.net/okobiz?retryWrites=true&w=majority&appName=Cluster0";
}

async function check() {
  console.log("Testing connection with URI:", uri.substring(0, 35) + "...");
  await mongoose.connect(uri, {
    dbName: "okobiz",
    serverSelectionTimeoutMS: 10000
  });
  console.log("Connected successfully to MongoDB Atlas database 'okobiz'!");

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log("Collections in 'okobiz':", collections.map(c => c.name));

  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    console.log(` - ${c.name}: ${count} documents`);
  }

  await mongoose.disconnect();
  console.log("\nAll verified!");
}

check().catch(err => {
  console.error("Verification failed:", err);
  process.exit(1);
});
