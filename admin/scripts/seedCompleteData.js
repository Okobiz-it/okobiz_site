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

// Read mockData.ts and extract objects cleanly
const mockDataPath = path.resolve(__dirname, "..", "..", "client", "src", "data", "mockData.ts");
const mockContent = fs.readFileSync(mockDataPath, "utf8");

// Helper function to extract array from TS file content using regex or safe eval
function extractArray(content, varName) {
  const startIdx = content.indexOf(`export const ${varName}`);
  if (startIdx === -1) return [];
  const equalIdx = content.indexOf("=", startIdx);
  const openBracket = content.indexOf("[", equalIdx);
  
  // Find matching closing bracket
  let depth = 0;
  let endBracket = -1;
  let inString = false;
  let stringChar = "";
  let inBacktick = false;

  for (let i = openBracket; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i - 1] : "";

    if (inBacktick) {
      if (char === "`" && prevChar !== "\\") {
        inBacktick = false;
      }
      continue;
    }

    if (inString) {
      if (char === stringChar && prevChar !== "\\") {
        inString = false;
      }
      continue;
    }

    if (char === "`") {
      inBacktick = true;
      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      stringChar = char;
      continue;
    }

    if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;
      if (depth === 0) {
        endBracket = i;
        break;
      }
    }
  }

  if (endBracket === -1) return [];
  const arrayCode = content.substring(openBracket, endBracket + 1);

  // Safely evaluate arrayCode into JavaScript object
  try {
    const fn = new Function(`return (${arrayCode});`);
    return fn();
  } catch (err) {
    console.error(`Failed to parse ${varName}:`, err.message);
    return [];
  }
}

async function run() {
  console.log("Extracting mock datasets from mockData.ts...");
  const sampleThemes = extractArray(mockContent, "SAMPLE_THEMES");
  const completedProjects = extractArray(mockContent, "COMPLETED_PROJECTS");
  const sampleBlogs = extractArray(mockContent, "SAMPLE_BLOGS");
  const galleryItems = extractArray(mockContent, "GALLERY_ITEMS");
  const clientPartners = extractArray(mockContent, "CLIENT_PARTNERS");
  const teamMembers = extractArray(mockContent, "TEAM_MEMBERS");
  const legalAdvisors = extractArray(mockContent, "LEGAL_ADVISORS");

  console.log(`Parsed:
  - Themes: ${sampleThemes.length}
  - Completed Projects: ${completedProjects.length}
  - Blogs: ${sampleBlogs.length}
  - Gallery Items: ${galleryItems.length}
  - Client Partners: ${clientPartners.length}
  - Team Members: ${teamMembers.length}
  - Legal Advisors: ${legalAdvisors.length}
  `);

  // Connect to MongoDB
  console.log("Connecting to MongoDB Atlas (okobiz)...");
  await mongoose.connect(uri, {
    dbName: "okobiz",
    serverSelectionTimeoutMS: 10000
  });
  console.log("Connected successfully!");

  const db = mongoose.connection.db;

  // Helper upsert
  async function upsertCollection(colName, items, idKey = "_id") {
    if (!items || items.length === 0) return;
    const col = db.collection(colName);
    let count = 0;
    for (const it of items) {
      const id = it[idKey] || it._id;
      if (!id) continue;
      await col.updateOne(
        { _id: id },
        { $set: { ...it, _id: id } },
        { upsert: true }
      );
      count++;
    }
    const total = await col.countDocuments();
    console.log(`✔ Collection '${colName}': Upserted ${count} items. Total in Mongo: ${total}`);
  }

  // 1. Gallery Items
  const formattedGallery = galleryItems.map((g, idx) => ({
    _id: g._id || "gal-" + (idx + 1),
    title: g.title,
    category: g.category || "Events",
    imageUrl: g.imageUrl,
    description: g.description || "",
    order: idx + 1,
    featured: idx < 6,
    createdAt: new Date().toISOString()
  }));
  await upsertCollection("galleryitems", formattedGallery);

  // 2. Themes / Portfolio Items
  // Combine SAMPLE_THEMES and COMPLETED_PROJECTS as ThemeItems in MongoDB
  const formattedThemes = [
    ...sampleThemes.map((t, idx) => ({
      _id: t._id || "thm-" + (idx + 1),
      websiteTitle: t.websiteTitle,
      category: t.category,
      clientName: "",
      mediaType: "image",
      price: t.price || 15000,
      discountPrice: t.discountPrice || 12000,
      websiteLink: t.websiteLink || "",
      photo: t.photo,
      video: "",
      videoThumbnail: "",
      popularBadge: Boolean(t.popularBadge),
      featuredBadge: Boolean(t.featuredBadge),
      description: t.description || "",
      challenge: "",
      solution: "",
      features: t.features || [],
      createdAt: t.createdAt ? new Date(t.createdAt) : new Date()
    })),
    ...completedProjects.map((p, idx) => ({
      _id: p._id || "proj-" + (idx + 1),
      websiteTitle: p.title,
      category: p.category,
      clientName: p.clientName || "",
      mediaType: p.mediaType || "image",
      price: 25000,
      discountPrice: 20000,
      websiteLink: p.liveUrl || "",
      photo: p.thumbnail,
      video: p.videoUrl || "",
      videoThumbnail: p.videoThumbnail || p.thumbnail,
      popularBadge: Boolean(p.isFeatured),
      featuredBadge: Boolean(p.isFeatured),
      description: p.shortDescription || p.fullDescription || "",
      challenge: p.challenge || "",
      solution: p.solution || "",
      features: p.features || [],
      createdAt: new Date()
    }))
  ];
  await upsertCollection("themeitems", formattedThemes);

  // 3. Blog Items
  const formattedBlogs = sampleBlogs.map((b, idx) => ({
    _id: b._id || "blg-" + (idx + 1),
    title: b.title,
    content: b.content,
    category: b.category || "Technology",
    author: b.author || "okobiz Editorial",
    photo: b.photo,
    createdAt: b.createdAt ? new Date(b.createdAt) : new Date(),
    commentsCount: (b.comments && (b.comments.length || b.comments.leanth)) || 0,
    isPublished: true
  }));
  await upsertCollection("blogitems", formattedBlogs);

  // 4. Client Partners
  const formattedClients = clientPartners.map((c, idx) => ({
    _id: "c-" + (idx + 1),
    name: c.name,
    image: c.image,
    websiteLink: "",
    order: idx + 1,
    isActive: true
  }));
  await upsertCollection("clientpartners", formattedClients);

  // 5. Team Members
  const formattedTeam = [
    ...teamMembers.map((m, idx) => ({
      _id: "tm-" + (idx + 1),
      name: m.name,
      designation: m.designation,
      image: m.image,
      type: "team",
      order: idx + 1
    })),
    ...legalAdvisors.map((m, idx) => ({
      _id: "adv-" + (idx + 1),
      name: m.name,
      designation: m.designation,
      image: m.image,
      type: "advisor",
      order: teamMembers.length + idx + 1
    }))
  ];
  await upsertCollection("teammembers", formattedTeam);

  // Update admin_store.json with these full datasets for seamless offline fallback
  const storePath = path.join(__dirname, "..", "data", "admin_store.json");
  const store = JSON.parse(fs.readFileSync(storePath, "utf8"));
  store.gallery = formattedGallery;
  store.themes = formattedThemes;
  store.blogs = formattedBlogs;
  store.clients = formattedClients;
  store.team = formattedTeam;
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf8");
  console.log("✔ admin_store.json updated with complete dataset.");

  await mongoose.disconnect();
  console.log("\nComplete sync to MongoDB Atlas finished successfully!");
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
