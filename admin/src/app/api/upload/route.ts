import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import MediaAsset from "@/models/MediaAsset";
import { uploadToCloudinary, deleteFromCloudinary } from "@/lib/cloudinary";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200 MB
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const customName = formData.get("name") as string;
    const previousUrl = (formData.get("previousUrl") as string) || "";

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    const originalName = file.name;
    const ext = path.extname(originalName).toLowerCase();
    const safeBaseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFilename = safeBaseName + "_" + Date.now() + ext;

    // Detect media category
    let mediaType: "image" | "pdf" | "video" = "image";
    let cloudinaryResourceType: "image" | "video" | "raw" = "image";

    if (ext === ".pdf") {
      mediaType = "pdf";
      cloudinaryResourceType = "raw";
    } else if ([".mp4", ".webm", ".mov", ".ogg", ".avi", ".mkv"].includes(ext)) {
      mediaType = "video";
      cloudinaryResourceType = "video";
    }

    // Enforce file size limits: 5MB for images, 200MB for videos, 50MB for PDFs
    if (mediaType === "image" && file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, message: "Image exceeds the maximum upload limit of 5MB." },
        { status: 400 }
      );
    }

    if (mediaType === "video" && file.size > MAX_VIDEO_SIZE) {
      return NextResponse.json(
        { success: false, message: "Video exceeds the maximum upload limit of 200MB." },
        { status: 400 }
      );
    }

    if (mediaType === "pdf" && file.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { success: false, message: "PDF exceeds the maximum upload limit of 50MB." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let publicUrl = "";
    let publicId = "";
    const publicIdName =
      cloudinaryResourceType === "raw" || mediaType === "pdf"
        ? `${safeBaseName}_${Date.now()}${ext}`
        : `${safeBaseName}_${Date.now()}`;

    // 1. Upload to Cloudinary with compression
    try {
      const cloudRes = await uploadToCloudinary(buffer, {
        folder: "okobiz",
        resource_type: cloudinaryResourceType,
        public_id: publicIdName,
        compress: mediaType === "image",
        mimeType: file.type
      });
      publicUrl = cloudRes.secure_url;
      publicId = cloudRes.public_id;
    } catch (cloudErr: any) {
      console.warn("Cloudinary upload failed, falling back to local file system:", cloudErr.message);
    }

    // 2. Local fallback/backup save
    try {
      const adminUploadsDir = path.join(process.cwd(), "public", "uploads");
      if (!fs.existsSync(adminUploadsDir)) {
        fs.mkdirSync(adminUploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(adminUploadsDir, uniqueFilename), buffer);

      const clientUploadsDir = path.resolve(process.cwd(), "..", "client", "public", "uploads");
      if (!fs.existsSync(clientUploadsDir)) {
        fs.mkdirSync(clientUploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(clientUploadsDir, uniqueFilename), buffer);

      if (!publicUrl || mediaType === "pdf") {
        publicUrl = "/uploads/" + uniqueFilename;
      }
    } catch (localErr: any) {
      console.warn("Local file backup skipped:", localErr.message);
    }

    const mediaRecord = {
      _id: "med-" + Date.now(),
      name: customName || originalName,
      filename: uniqueFilename,
      path: publicUrl,
      type: mediaType,
      size: file.size,
      mimeType: file.type || "application/octet-stream",
      url: publicUrl,
      publicId: publicId,
      createdAt: new Date().toISOString()
    };

    // Store in dataStore
    const store = getDataStore();
    if (!store.media) store.media = [];
    store.media.unshift(mediaRecord);
    saveDatastore(store);

    // Store in MongoDB Atlas
    try {
      const db = await connectDB();
      if (db) {
        await MediaAsset.create({
          ...mediaRecord,
          createdAt: new Date()
        });
        console.log("Uploaded compressed asset recorded in MongoDB Atlas:", publicUrl);
      }
    } catch (dbErr: any) {
      console.warn("Notice: Failed to record media asset in MongoDB Atlas:", dbErr.message);
    }

    // 3. If previousUrl was provided, purge it from Cloudinary and local backup now that new asset is successfully stored
    if (previousUrl && !previousUrl.includes("okobiz_profile-DvU1SuUS.pdf")) {
      try {
        await deleteFromCloudinary(previousUrl);
        console.log("Successfully purged previous asset on re-upload:", previousUrl);
      } catch (delErr: any) {
        console.warn("Notice: Error purging previous asset on re-upload:", delErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      media: mediaRecord
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ success: false, message: err.message || "File upload failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let targetUrl = searchParams.get("url") || "";
    if (!targetUrl) {
      try {
        const body = await req.json();
        targetUrl = body.url;
      } catch (e) {}
    }

    if (!targetUrl) {
      return NextResponse.json({ success: false, message: "No url provided for deletion" }, { status: 400 });
    }

    const deleted = await deleteFromCloudinary(targetUrl);
    return NextResponse.json({ success: true, deleted, message: "Asset cleanup completed" });
  } catch (err: any) {
    console.error("Asset deletion error:", err);
    return NextResponse.json({ success: false, message: err.message || "Deletion failed" }, { status: 500 });
  }
}
