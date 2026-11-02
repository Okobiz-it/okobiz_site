const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");

cloudinary.config({
  cloud_name: "dccui8s58",
  api_key: "767929161499491",
  api_secret: "iYSZfjkpTof49FIT2rW7wBPoUco",
  secure: true
});

const uri = "mongodb+srv://okobizit_db_user:gEgpQgjQ3ROCM7dH@cluster0.ir3r065.mongodb.net/okobiz?retryWrites=true&w=majority&appName=Cluster0";

// Helper: compress image buffer using sharp
async function compressImageBuffer(buffer, ext) {
  try {
    if (ext === ".svg") return buffer;
    const image = sharp(buffer);
    const meta = await image.metadata();

    let pipeline = image;
    if ((meta.width && meta.width > 2048) || (meta.height && meta.height > 2048)) {
      pipeline = pipeline.resize({ width: 2048, height: 2048, fit: "inside", withoutEnlargement: true });
    }

    if (ext === ".png") {
      return await pipeline.png({ quality: 80, compressionLevel: 8 }).toBuffer();
    } else if (ext === ".webp") {
      return await pipeline.webp({ quality: 80 }).toBuffer();
    } else if (ext === ".avif") {
      return await pipeline.avif({ quality: 75 }).toBuffer();
    } else {
      return await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    }
  } catch (err) {
    return buffer;
  }
}

// Helper: upload buffer to Cloudinary
function uploadBufferToCloudinary(buffer, publicId, resourceType = "image") {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: "okobiz/assets",
      resource_type: resourceType,
      public_id: publicId,
      overwrite: true
    };
    if (resourceType === "image") {
      uploadOptions.transformation = [{ quality: "auto:good", fetch_format: "auto" }];
    } else if (resourceType === "video") {
      uploadOptions.transformation = [{ quality: "auto" }];
    }

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
      if (err) return reject(err);
      resolve(res.secure_url);
    });
    stream.end(buffer);
  });
}

// Find physical file on disk given web path
function findLocalFile(webPath) {
  if (!webPath || typeof webPath !== "string") return null;
  const cleanPath = webPath.startsWith("/") ? webPath.slice(1) : webPath;

  const candidates = [
    path.resolve(__dirname, "..", "..", "client", "public", cleanPath),
    path.resolve(__dirname, "..", "..", "admin", "public", cleanPath),
    path.resolve(__dirname, "..", "..", "client", cleanPath),
    path.resolve(__dirname, "..", "..", "admin", cleanPath)
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c;
    }
  }
  return null;
}

async function run() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(uri, { dbName: "okobiz", serverSelectionTimeoutMS: 15000 });
  console.log("Connected successfully to MongoDB Atlas database 'okobiz'!\n");

  const db = mongoose.connection.db;

  // 1. Gather all collections
  const themeCol = db.collection("themeitems");
  const blogCol = db.collection("blogitems");
  const galleryCol = db.collection("galleryitems");
  const clientCol = db.collection("clientpartners");
  const teamCol = db.collection("teammembers");
  const heroCol = db.collection("heroslides");
  const mediaCol = db.collection("mediaassets");

  const themes = await themeCol.find().toArray();
  const blogs = await blogCol.find().toArray();
  const gallery = await galleryCol.find().toArray();
  const clients = await clientCol.find().toArray();
  const team = await teamCol.find().toArray();
  const hero = await heroCol.find().toArray();
  const media = await mediaCol.find().toArray();

  // Set of all distinct local paths
  const localPaths = new Set();

  function checkAndAdd(val) {
    if (val && typeof val === "string" && !val.startsWith("http://") && !val.startsWith("https://")) {
      localPaths.add(val);
    }
  }

  themes.forEach(t => { checkAndAdd(t.photo); checkAndAdd(t.video); checkAndAdd(t.videoThumbnail); });
  blogs.forEach(b => checkAndAdd(b.photo));
  gallery.forEach(g => checkAndAdd(g.imageUrl));
  clients.forEach(c => checkAndAdd(c.image));
  team.forEach(m => checkAndAdd(m.image));
  hero.forEach(h => checkAndAdd(h.img));
  media.forEach(m => { checkAndAdd(m.path); checkAndAdd(m.url); });

  console.log(`Discovered ${localPaths.size} unique local assets across all collections in MongoDB:`);
  console.log(Array.from(localPaths));

  // 2. Upload and compress each unique asset to Cloudinary
  const urlMap = {};
  let uploadedCount = 0;
  let skippedCount = 0;

  for (const webPath of localPaths) {
    const filePath = findLocalFile(webPath);
    if (!filePath) {
      console.warn(`File not found on disk for web path: ${webPath}`);
      continue;
    }

    const ext = path.extname(filePath).toLowerCase();
    const baseName = path.basename(filePath, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const isVideo = [".mp4", ".webm", ".mov", ".ogg", ".avi"].includes(ext);
    const isPdf = ext === ".pdf";
    const resourceType = isVideo ? "video" : (isPdf ? "raw" : "image");

    console.log(`Processing [${resourceType}]: ${webPath} -> ${filePath}`);

    try {
      let buffer = fs.readFileSync(filePath);
      const originalSize = buffer.length;

      if (!isVideo && !isPdf) {
        buffer = await compressImageBuffer(buffer, ext);
        console.log(` - Compressed ${webPath}: ${(originalSize / 1024).toFixed(1)}KB -> ${(buffer.length / 1024).toFixed(1)}KB`);
      }

      const publicId = `${baseName}`;
      const cdnUrl = await uploadBufferToCloudinary(buffer, publicId, resourceType);
      console.log(` ✔ Uploaded to Cloudinary: ${cdnUrl}`);
      urlMap[webPath] = cdnUrl;
      uploadedCount++;
    } catch (err) {
      console.error(` ✖ Failed to upload ${webPath}:`, err.message);
    }
  }

  console.log(`\nUploaded ${uploadedCount} assets to Cloudinary!\n`);

  // 3. Update MongoDB Atlas collections with Cloudinary URLs
  console.log("Updating MongoDB Atlas collections with new Cloudinary CDN URLs...");

  // Themes
  for (const t of themes) {
    const updates = {};
    if (urlMap[t.photo]) updates.photo = urlMap[t.photo];
    if (urlMap[t.video]) updates.video = urlMap[t.video];
    if (urlMap[t.videoThumbnail]) updates.videoThumbnail = urlMap[t.videoThumbnail];

    if (Object.keys(updates).length > 0) {
      await themeCol.updateOne({ _id: t._id }, { $set: updates });
    }
  }

  // Blogs
  for (const b of blogs) {
    if (urlMap[b.photo]) {
      await blogCol.updateOne({ _id: b._id }, { $set: { photo: urlMap[b.photo] } });
    }
  }

  // Gallery
  for (const g of gallery) {
    if (urlMap[g.imageUrl]) {
      await galleryCol.updateOne({ _id: g._id }, { $set: { imageUrl: urlMap[g.imageUrl] } });
    }
  }

  // Clients
  for (const c of clients) {
    if (urlMap[c.image]) {
      await clientCol.updateOne({ _id: c._id }, { $set: { image: urlMap[c.image] } });
    }
  }

  // Team
  for (const m of team) {
    if (urlMap[m.image]) {
      await teamCol.updateOne({ _id: m._id }, { $set: { image: urlMap[m.image] } });
    }
  }

  // Hero
  for (const h of hero) {
    if (urlMap[h.img]) {
      await heroCol.updateOne({ _id: h._id }, { $set: { img: urlMap[h.img] } });
    }
  }

  // Media Assets
  for (const m of media) {
    const updates = {};
    if (urlMap[m.path]) updates.path = urlMap[m.path];
    if (urlMap[m.url]) updates.url = urlMap[m.url];
    if (Object.keys(updates).length > 0) {
      await mediaCol.updateOne({ _id: m._id }, { $set: updates });
    }
  }

  console.log("✔ All collections in MongoDB Atlas have been updated with Cloudinary URLs!");

  // Save urlMap for reference and offline store sync
  const mappingPath = path.join(__dirname, "cloudinary_url_map.json");
  fs.writeFileSync(mappingPath, JSON.stringify(urlMap, null, 2), "utf8");
  console.log(`✔ URL mapping saved to ${mappingPath}`);

  // Also update admin_store.json with Cloudinary URLs
  const storePath = path.join(__dirname, "..", "data", "admin_store.json");
  if (fs.existsSync(storePath)) {
    const store = JSON.parse(fs.readFileSync(storePath, "utf8"));
    if (store.themes) store.themes.forEach(t => { if (urlMap[t.photo]) t.photo = urlMap[t.photo]; if (urlMap[t.video]) t.video = urlMap[t.video]; if (urlMap[t.videoThumbnail]) t.videoThumbnail = urlMap[t.videoThumbnail]; });
    if (store.blogs) store.blogs.forEach(b => { if (urlMap[b.photo]) b.photo = urlMap[b.photo]; });
    if (store.gallery) store.gallery.forEach(g => { if (urlMap[g.imageUrl]) g.imageUrl = urlMap[g.imageUrl]; });
    if (store.clients) store.clients.forEach(c => { if (urlMap[c.image]) c.image = urlMap[c.image]; });
    if (store.team) store.team.forEach(m => { if (urlMap[m.image]) m.image = urlMap[m.image]; });
    if (store.heroSlides) store.heroSlides.forEach(h => { if (urlMap[h.img]) h.img = urlMap[h.img]; });
    if (store.media) store.media.forEach(m => { if (urlMap[m.path]) m.path = urlMap[m.path]; if (urlMap[m.url]) m.url = urlMap[m.url]; });
    fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
    console.log("✔ admin_store.json synced with Cloudinary URLs!");
  }

  await mongoose.disconnect();
  console.log("\nMigration completed successfully!");
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
