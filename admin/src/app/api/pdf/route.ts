import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import crypto from "crypto";

function getCloudinarySignedUrl(publicId: string): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "dccui8s58";
  const apiKey = process.env.CLOUDINARY_API_KEY || "767929161499491";
  const apiSecret = process.env.CLOUDINARY_API_SECRET || "iYSZfjkpTof49FIT2rW7wBPoUco";

  const timestamp = Math.floor(Date.now() / 1000);
  const expiresAt = timestamp + 3600;
  const toSign = `expires_at=${expiresAt}&format=pdf&public_id=${publicId}&timestamp=${timestamp}&type=upload${apiSecret}`;
  const signature = crypto.createHash("sha1").update(toSign).digest("hex");

  return `https://api.cloudinary.com/v1_1/${cloudName}/raw/download?timestamp=${timestamp}&public_id=${encodeURIComponent(
    publicId
  )}&format=pdf&type=upload&expires_at=${expiresAt}&signature=${signature}&api_key=${apiKey}`;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get("url");
    const download = searchParams.get("download") === "1";

    if (!targetUrl) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    // Determine filename
    let filename = "okobiz_official_credentials.pdf";
    try {
      const cleanUrl = targetUrl.split("?")[0];
      const rawName = cleanUrl.split("/").pop();
      if (rawName && rawName.trim()) {
        const decoded = decodeURIComponent(rawName);
        filename = decoded.toLowerCase().endsWith(".pdf") ? decoded : `${decoded}.pdf`;
      }
    } catch (e) {}

    const disposition = download ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`;

    // 1. Check local file system first
    const localCandidates = [
      path.join(process.cwd(), "public", "uploads", filename),
      path.join(process.cwd(), "public", "assets", filename),
      path.join(process.cwd(), "public", filename),
      path.resolve(process.cwd(), "..", "client", "public", "uploads", filename),
      path.resolve(process.cwd(), "..", "client", "public", "assets", filename)
    ];

    for (const candPath of localCandidates) {
      if (fs.existsSync(candPath)) {
        try {
          const fileBuffer = fs.readFileSync(candPath);
          return new Response(fileBuffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": disposition,
              "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
          });
        } catch (readErr) {
          console.warn("Local file read error, falling back to network fetch:", readErr);
        }
      }
    }

    // 2. If it's a Cloudinary URL, fetch using authenticated signed download URL
    if (targetUrl.includes("res.cloudinary.com")) {
      try {
        const match = targetUrl.match(/okobiz\/[^?]+/);
        const publicId = match ? match[0] : `okobiz/${filename}`;

        const signedUrl = getCloudinarySignedUrl(publicId);
        const cloudRes = await fetch(signedUrl);

        if (cloudRes.ok) {
          const buffer = await cloudRes.arrayBuffer();
          return new Response(buffer, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": disposition,
              "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
          });
        }
      } catch (cloudErr) {
        console.warn("Signed Cloudinary download attempt failed:", cloudErr);
      }
    }

    // 3. Fallback standard upstream fetch
    let fetchUrl = targetUrl;
    if (targetUrl.startsWith("/")) {
      const host = req.headers.get("host") || "localhost:3000";
      const protocol = req.headers.get("x-forwarded-proto") || "http";
      fetchUrl = `${protocol}://${host}${targetUrl}`;
    }

    const upstreamRes = await fetch(fetchUrl);
    if (upstreamRes.ok) {
      const buffer = await upstreamRes.arrayBuffer();
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": disposition,
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch PDF document", details: `Upstream returned status ${upstreamRes.status}` },
      { status: upstreamRes.status }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process PDF" }, { status: 500 });
  }
}
