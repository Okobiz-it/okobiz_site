const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://okobizit_db_user:gEgpQgjQ3ROCM7dH@cluster0.ir3r065.mongodb.net/okobiz?retryWrites=true&w=majority&appName=Cluster0";

const storePath = path.join(__dirname, "..", "data", "admin_store.json");
const store = JSON.parse(fs.readFileSync(storePath, "utf8"));

async function sync() {
  console.log("Connecting to MongoDB Atlas at okobiz...");
  await mongoose.connect(MONGODB_URI, {
    dbName: "okobiz",
    serverSelectionTimeoutMS: 10000
  });
  console.log("Connected successfully to MongoDB Atlas database 'okobiz'!\n");

  const db = mongoose.connection.db;

  // 1. Admin User
  const adminCol = db.collection("adminusers");
  const existingAdmin = await adminCol.findOne({ email: "admin@okobiz.com" });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await adminCol.insertOne({
      _id: "usr-" + Date.now(),
      email: "admin@okobiz.com",
      password: hashedPassword,
      name: "Super Admin",
      role: "superadmin",
      createdAt: new Date()
    });
    console.log("✔ Admin User seeded: admin@okobiz.com / admin123");
  } else {
    console.log("✔ Admin User already exists in MongoDB");
  }

  // Helper sync collection
  async function syncCollection(colName, items) {
    if (!items || items.length === 0) return;
    const col = db.collection(colName);
    let inserted = 0;
    let updated = 0;

    for (const item of items) {
      const filter = { _id: item._id };
      const res = await col.updateOne(
        filter,
        { $set: { ...item } },
        { upsert: true }
      );
      if (res.upsertedCount > 0) inserted++;
      else if (res.modifiedCount > 0) updated++;
    }
    const total = await col.countDocuments();
    console.log(`✔ Collection '${colName}': ${total} total documents (${inserted} newly inserted, ${updated} updated)`);
  }

  // 2. Hero Slides
  await syncCollection("heroslides", store.heroSlides);

  // 3. Clients
  await syncCollection("clientpartners", store.clients);

  // 4. Themes / Portfolio Projects
  await syncCollection("themeitems", store.themes);

  // 5. Blogs
  await syncCollection("blogitems", store.blogs);

  // 6. Gallery Items
  await syncCollection("galleryitems", store.gallery || [
    { _id: "gal-1", title: "Annual Tech Innovation Summit & Award Ceremony", category: "Achievements", imageUrl: "/assets/about-33-B_PGTXVg.webp", description: "Celebrating our milestones and stellar client success stories.", order: 1, featured: true, createdAt: new Date() },
    { _id: "gal-2", title: "okobiz Core Engineering & Creative Team", category: "Team Moments", imageUrl: "/assets/clientsfotter-o_Y4RCBU.webp", description: "Collaboration and team unity at the heart of our software architecture.", order: 2, featured: true, createdAt: new Date() },
    { _id: "gal-3", title: "Creative Brainstorming & UI/UX Design Sprint", category: "Office Life", imageUrl: "/assets/about-BPfvng5e.webp", description: "Designing intuitive client experiences, wireframes, and modern concepts.", order: 3, featured: false, createdAt: new Date() },
    { _id: "gal-4", title: "High-Performance Web Architecture Session", category: "Projects", imageUrl: "/assets/web-2-DujjTO8C.webp", description: "Deep dive into Next.js server components and distributed backends.", order: 4, featured: true, createdAt: new Date() },
    { _id: "gal-5", title: "Motion Graphics & 3D Visual Rendering Lab", category: "Projects", imageUrl: "/assets/graphic-2-C80LdtU9.jpeg", description: "Crafting micro-animations, 3D brand visuals, and digital promotional assets.", order: 5, featured: false, createdAt: new Date() },
    { _id: "gal-6", title: "Digital Marketing Strategy & Conversion Workshop", category: "Events", imageUrl: "/assets/digital-2-snBkV2Qy.jpeg", description: "Audience analytics, conversion rate optimization, and ad campaigns analysis.", order: 6, featured: false, createdAt: new Date() }
  ]);

  // 7. Team Members
  await syncCollection("teammembers", store.team);

  // 8. Services
  await syncCollection("serviceitems", store.services);

  // 9. FAQs
  await syncCollection("faqitems", store.faqs);

  // 10. Media
  await syncCollection("mediaassets", store.media);

  // 11. Inquiries
  await syncCollection("inquiries", store.inquiries);

  // 12. Settings
  if (store.settings) {
    const settingsCol = db.collection("sitesettings");
    await settingsCol.updateOne(
      { siteName: "okobiz" },
      { $set: store.settings },
      { upsert: true }
    );
    console.log("✔ Collection 'sitesettings': Synced company settings and statistics");
  }

  console.log("\nAll data has been successfully verified & synced to MongoDB Atlas database 'okobiz'!");
  await mongoose.disconnect();
  process.exit(0);
}

sync().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
