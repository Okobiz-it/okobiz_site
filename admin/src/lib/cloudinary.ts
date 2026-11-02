import { v2 as cloudinary } from "cloudinary";
import sharp from "sharp";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dccui8s58",
  api_key: process.env.CLOUDINARY_API_KEY || "767929161499491",
  api_secret: process.env.CLOUDINARY_API_SECRET || "iYSZfjkpTof49FIT2rW7wBPoUco",
  secure: true
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  resource_type?: string;
}

export async function compressImage(buffer: Buffer, mimeType?: string): Promise<Buffer> {
  try {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Do not process SVG or unsupported formats with raster pipeline
    if (metadata.format === "svg") {
      return buffer;
    }

    let pipeline = image;
    // Scale down oversized images gracefully (max 2048px on longest edge)
    if ((metadata.width && metadata.width > 2048) || (metadata.height && metadata.height > 2048)) {
      pipeline = pipeline.resize({
        width: 2048,
        height: 2048,
        fit: "inside",
        withoutEnlargement: true
      });
    }

    if (metadata.format === "png") {
      return await pipeline.png({ quality: 80, compressionLevel: 8 }).toBuffer();
    } else if (metadata.format === "webp") {
      return await pipeline.webp({ quality: 80 }).toBuffer();
    } else {
      return await pipeline.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
    }
  } catch (err: any) {
    console.warn("Sharp compression skipped (using original buffer):", err.message);
    return buffer;
  }
}

export async function uploadToCloudinary(
  buffer: Buffer,
  options: {
    folder?: string;
    resource_type?: "auto" | "image" | "video" | "raw";
    public_id?: string;
    compress?: boolean;
    mimeType?: string;
  } = {}
): Promise<CloudinaryUploadResult> {
  let uploadBuffer = buffer;
  const resourceType = options.resource_type || "auto";

  // Compress image if resource_type is image or auto
  if (options.compress !== false && (resourceType === "image" || resourceType === "auto")) {
    uploadBuffer = await compressImage(uploadBuffer, options.mimeType);
  }

  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder: options.folder || "okobiz",
      resource_type: resourceType,
      public_id: options.public_id,
      overwrite: true
    };

    if (resourceType === "image" || resourceType === "auto") {
      uploadOptions.transformation = [
        { quality: "auto:good", fetch_format: "auto" }
      ];
    } else if (resourceType === "video") {
      uploadOptions.transformation = [
        { quality: "auto", video_codec: "auto" }
      ];
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Cloudinary returned empty result"));
        }
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          format: result.format,
          bytes: result.bytes,
          resource_type: result.resource_type
        });
      }
    );

    uploadStream.end(uploadBuffer);
  });
}

export async function deleteFromCloudinary(urlOrPublicId: string): Promise<boolean> {
  if (!urlOrPublicId) return false;

  // Never delete static default brochure
  if (urlOrPublicId.includes("okobiz_profile-DvU1SuUS.pdf")) {
    return true;
  }

  // Local filesystem cleanup if stored in /uploads
  if (!urlOrPublicId.includes("cloudinary.com")) {
    try {
      if (urlOrPublicId.startsWith("/uploads/") || urlOrPublicId.includes("uploads/")) {
        const fs = await import("fs");
        const path = await import("path");
        const cleanPath = urlOrPublicId.replace(/^\/?/, "");
        const adminPath = path.join(process.cwd(), "public", cleanPath);
        if (fs.existsSync(adminPath)) fs.unlinkSync(adminPath);
        const clientPath = path.resolve(process.cwd(), "..", "client", "public", cleanPath);
        if (fs.existsSync(clientPath)) fs.unlinkSync(clientPath);
      }
    } catch (e) {
      console.warn("Failed to delete local backup file:", e);
    }
    return true;
  }

  try {
    let resourceType: "image" | "video" | "raw" = "image";
    if (urlOrPublicId.includes("/video/upload/")) {
      resourceType = "video";
    } else if (urlOrPublicId.includes("/raw/upload/")) {
      resourceType = "raw";
    }

    // Also delete any local backup in /uploads/ if the filename exists
    try {
      const filenameMatch = urlOrPublicId.match(/\/([^/?#]+\.[a-zA-Z0-9]+)(?:[?#]|$)/);
      if (filenameMatch && filenameMatch[1]) {
        const fs = await import("fs");
        const path = await import("path");
        const adminPath = path.join(process.cwd(), "public", "uploads", filenameMatch[1]);
        if (fs.existsSync(adminPath)) fs.unlinkSync(adminPath);
        const clientPath = path.resolve(process.cwd(), "..", "client", "public", "uploads", filenameMatch[1]);
        if (fs.existsSync(clientPath)) fs.unlinkSync(clientPath);
      }
    } catch (e) {}

    if (resourceType === "raw") {
      // For raw files (e.g. PDFs), Cloudinary public_ids retain their extension
      const match = urlOrPublicId.match(/\/upload\/(?:v\d+\/)?([^?#]+)/);
      if (match && match[1]) {
        const publicIdWithExt = decodeURIComponent(match[1]);
        const res = await cloudinary.uploader.destroy(publicIdWithExt, {
          resource_type: "raw",
          invalidate: true
        });
        if (res && res.result === "ok") {
          console.log(`Cloudinary raw asset deleted successfully: ${publicIdWithExt}`);
          return true;
        }
        // Fallback: try without extension if it was created without extension
        const publicIdNoExt = publicIdWithExt.replace(/\.[^.]+$/, "");
        if (publicIdNoExt !== publicIdWithExt) {
          const res2 = await cloudinary.uploader.destroy(publicIdNoExt, {
            resource_type: "raw",
            invalidate: true
          });
          if (res2 && res2.result === "ok") {
            console.log(`Cloudinary raw asset deleted successfully (no-ext): ${publicIdNoExt}`);
            return true;
          }
        }
      }
    } else {
      // For images and videos, public IDs typically omit the extension
      const match = urlOrPublicId.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (match && match[1]) {
        const publicId = decodeURIComponent(match[1]);
        const res = await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
          invalidate: true
        });
        return res?.result === "ok";
      }
    }
  } catch (err: any) {
    console.warn("Failed to delete asset from Cloudinary:", err.message);
  }
  return false;
}

export default cloudinary;
