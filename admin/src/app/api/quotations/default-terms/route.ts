export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import SiteSetting from "@/models/SiteSetting";
import { DEFAULT_UNIFIED_TERMS_AND_CONDITIONS } from "@/components/quotation/quotation-defaults";

export async function GET() {
  try {
    let savedTerms: string | undefined;

    // 1. Try fetching from MongoDB SiteSetting
    try {
      const db = await connectDB();
      if (db) {
        const setting = await SiteSetting.findOne().lean();
        if (setting && (setting as any).defaultTermsAndConditions) {
          savedTerms = (setting as any).defaultTermsAndConditions;
        }
      }
    } catch (dbErr: any) {
      console.warn("MongoDB GET default terms warning:", dbErr.message);
    }

    // 2. Fallback to local dataStore if MongoDB returned nothing
    if (!savedTerms) {
      const store = getDataStore();
      if (store.settings && store.settings.defaultTermsAndConditions) {
        savedTerms = store.settings.defaultTermsAndConditions;
      }
    }

    return NextResponse.json({
      success: true,
      defaultTerms: savedTerms || DEFAULT_UNIFIED_TERMS_AND_CONDITIONS,
      isCustom: Boolean(savedTerms),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err.message,
        defaultTerms: DEFAULT_UNIFIED_TERMS_AND_CONDITIONS,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const defaultTerms = body.defaultTerms;

    if (typeof defaultTerms !== "string") {
      return NextResponse.json(
        { success: false, message: "Invalid defaultTerms: expected string" },
        { status: 400 }
      );
    }

    // 1. Always save to local dataStore for immediate offline/local reliability
    const store = getDataStore();
    if (!store.settings) {
      store.settings = {} as any;
    }
    store.settings.defaultTermsAndConditions = defaultTerms;
    saveDatastore(store);

    // 2. Save to MongoDB SiteSetting
    try {
      const db = await connectDB();
      if (db) {
        await SiteSetting.findOneAndUpdate(
          {},
          { $set: { defaultTermsAndConditions: defaultTerms } },
          { new: true, upsert: true }
        );
      }
    } catch (dbErr: any) {
      console.warn("MongoDB SiteSetting default terms update warning:", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "Default terms & conditions saved successfully",
      defaultTerms,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to save default terms" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

