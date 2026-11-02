const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

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

const mapPath = path.resolve(__dirname, "cloudinary_url_map.json");
let urlMap = {};
if (fs.existsSync(mapPath)) {
  urlMap = JSON.parse(fs.readFileSync(mapPath, "utf8"));
}

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

async function main() {
  const assetsDir = path.resolve(__dirname, "..", "..", "client", "public", "assets");
  const files = fs.readdirSync(assetsDir);
  const mediaExts = new Set([".png", ".jpg", ".jpeg", ".webp", ".svg", ".webm"]);

  console.log(`Checking ${files.length} files in ${assetsDir}...`);
  let uploadCount = 0;

  for (const f of files) {
    const ext = path.extname(f).toLowerCase();
    if (!mediaExts.has(ext)) continue;

    const webPath = `/assets/${f}`;
    if (urlMap[webPath]) {
      // already uploaded
      continue;
    }

    const fullPath = path.join(assetsDir, f);
    const stat = fs.statSync(fullPath);
    if (stat.size > 200 * 1024 * 1024) continue;

    const rawBuffer = fs.readFileSync(fullPath);
    const resourceType = ext === ".webm" || ext === ".mp4" ? "video" : (ext === ".pdf" ? "raw" : "image");
    const baseName = path.basename(f, ext).replace(/[^a-zA-Z0-9_-]/g, "_");

    console.log(`[Uploading ${++uploadCount}] ${f} (${(stat.size / 1024).toFixed(1)} KB)`);

    let finalBuffer = rawBuffer;
    if (resourceType === "image") {
      finalBuffer = await compressImageBuffer(rawBuffer, ext);
      console.log(`  -> Compressed: ${(finalBuffer.length / 1024).toFixed(1)} KB`);
    }

    try {
      const cUrl = await uploadBufferToCloudinary(finalBuffer, baseName, resourceType);
      urlMap[webPath] = cUrl;
      console.log(`  -> Live Cloudinary URL: ${cUrl}`);
    } catch (e) {
      console.error(`  -> Failed to upload ${f}:`, e.message);
    }
  }

  fs.writeFileSync(mapPath, JSON.stringify(urlMap, null, 2), "utf8");
  console.log(`\nDone! Total entries in cloudinary_url_map.json: ${Object.keys(urlMap).length}`);
}

main().catch(console.error);
