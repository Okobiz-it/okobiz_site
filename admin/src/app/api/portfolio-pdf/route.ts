import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import SiteSetting from "@/models/SiteSetting";
import { deleteFromCloudinary } from "@/lib/cloudinary";

const DEFAULT_PORTFOLIO_PDF = {
  heading: "okobiz Official Profile & Credentials 2024",
  subheading: "Corporate capabilities brochure, technology stack & verified client references • PDF (2.8 MB)",
  pdfUrl: "/assets/okobiz_profile-DvU1SuUS.pdf",
  badge: ""
};

export async function GET() {
  try {
    const db = await connectDB();
    if (db) {
      const setting = await SiteSetting.findOne();
      if (setting && setting.portfolioPdf && setting.portfolioPdf.heading) {
        return NextResponse.json({
          success: true,
          data: {
            heading: setting.portfolioPdf.heading || DEFAULT_PORTFOLIO_PDF.heading,
            subheading: setting.portfolioPdf.subheading || DEFAULT_PORTFOLIO_PDF.subheading,
            pdfUrl: setting.portfolioPdf.pdfUrl || DEFAULT_PORTFOLIO_PDF.pdfUrl,
            badge: setting.portfolioPdf.badge !== undefined ? setting.portfolioPdf.badge : ""
          }
        });
      }
    }
  } catch (err: any) {
    console.warn("MongoDB GET portfolio-pdf error:", err.message);
  }

  const store = getDataStore();
  const pdfData = store.settings?.portfolioPdf || DEFAULT_PORTFOLIO_PDF;
  return NextResponse.json({
    success: true,
    data: {
      heading: pdfData.heading || DEFAULT_PORTFOLIO_PDF.heading,
      subheading: pdfData.subheading || DEFAULT_PORTFOLIO_PDF.subheading,
      pdfUrl: pdfData.pdfUrl || DEFAULT_PORTFOLIO_PDF.pdfUrl,
      badge: pdfData.badge !== undefined ? pdfData.badge : ""
    }
  });
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const updatedPdf = {
      heading: (body.heading || "").trim() || DEFAULT_PORTFOLIO_PDF.heading,
      subheading: (body.subheading || "").trim() || DEFAULT_PORTFOLIO_PDF.subheading,
      pdfUrl: (body.pdfUrl || "").trim() || DEFAULT_PORTFOLIO_PDF.pdfUrl,
      badge: body.badge !== undefined ? String(body.badge).trim() : ""
    };

    // Update DataStore
    const store = getDataStore();
    const oldPdfUrl = store.settings?.portfolioPdf?.pdfUrl;
    if (oldPdfUrl && oldPdfUrl !== updatedPdf.pdfUrl && !oldPdfUrl.includes("okobiz_profile-DvU1SuUS.pdf")) {
      deleteFromCloudinary(oldPdfUrl).catch((err) =>
        console.warn("Failed to delete old PDF from storage:", err.message)
      );
    }
    if (!store.settings) {
      store.settings = {
        siteName: "okobiz",
        contactPhone: "01973-590937",
        contactEmail: "info@okobiz.com",
        contactAddress: "House-24, Road-14, Sector-11, Uttara, Dhaka, Bangladesh",
        whatsappNumber: "+8801973590937",
        stats: {
          journeyStarted: "2018",
          happyClients: "150",
          teamMembers: "20",
          yearsOfExcellence: "6+"
        },
        portfolioPdf: updatedPdf
      };
    } else {
      store.settings.portfolioPdf = updatedPdf;
    }
    saveDatastore(store);

    // Update MongoDB Atlas
    const db = await connectDB();
    if (db) {
      try {
        await SiteSetting.findOneAndUpdate(
          {},
          { $set: { portfolioPdf: updatedPdf } },
          { new: true, upsert: true }
        );
      } catch (dbErr: any) {
        console.error("MongoDB SiteSetting portfolioPdf update error:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedPdf,
      message: "Portfolio PDF settings updated successfully"
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  return PUT(req);
}
