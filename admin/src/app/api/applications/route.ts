import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import JobApplication from "@/models/JobApplication";
import JobOpening from "@/models/JobOpening";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    const db = await connectDB();
    if (db) {
      if (id) {
        const app = await JobApplication.findById(id);
        if (app) return NextResponse.json({ success: true, data: app });
      }

      const query: any = {};
      if (jobId && jobId !== "all") query.jobId = jobId;
      if (status && status !== "all") query.status = status;

      const apps = await JobApplication.find(query).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, data: apps || [] });
    }
  } catch (err: any) {
    console.warn("MongoDB GET applications notice:", err.message);
  }

  // Fallback to dataStore
  const store = getDataStore();
  let list = store.jobApplications || [];
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");
  const status = searchParams.get("status");
  const id = searchParams.get("id");

  if (id) {
    const match = list.find((a: any) => a._id === id);
    return NextResponse.json({ success: !!match, data: match || null });
  }

  if (jobId && jobId !== "all") {
    list = list.filter((a: any) => a.jobId === jobId);
  }
  if (status && status !== "all") {
    list = list.filter((a: any) => a.status === status);
  }

  return NextResponse.json({ success: true, data: list });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, jobId, resumeUrl } = body;

    if (!name || !email || !phone || !jobId) {
      return NextResponse.json(
        { success: false, message: "Name, email, phone, and jobId are required." },
        { status: 400 }
      );
    }

    const store = getDataStore();

    // Resolve job title
    let jobTitle = body.jobTitle;
    if (!jobTitle) {
      const matchJob = (store.jobs || []).find((j: any) => j._id === jobId || j.slug === jobId);
      jobTitle = matchJob?.title || "Position Application";
    }

    const newApp = {
      _id: body._id || `app-${Date.now()}`,
      jobId,
      jobTitle,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      portfolioUrl: (body.portfolioUrl || "").trim(),
      githubUrl: (body.githubUrl || "").trim(),
      linkedinUrl: (body.linkedinUrl || "").trim(),
      resumeUrl: (resumeUrl || "").trim(),
      coverNote: (body.coverNote || "").trim(),
      experienceYears: (body.experienceYears || "").trim(),
      currentCompany: (body.currentCompany || "").trim(),
      expectedSalary: (body.expectedSalary || "").trim(),
      noticePeriod: (body.noticePeriod || "").trim(),
      status: "new" as const,
      notes: "",
      emailsSent: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!store.jobApplications) store.jobApplications = [];
    store.jobApplications.unshift(newApp);
    saveDatastore(store);

    let finalDoc = newApp;
    const db = await connectDB();
    if (db) {
      try {
        const created = await JobApplication.create(newApp);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB JobApplication create error:", dbErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully! Our talent acquisition team will review your credentials.",
      data: finalDoc
    });
  } catch (err: any) {
    console.error("Applications POST error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { _id, ...updates } = body;
    if (!_id) return NextResponse.json({ success: false, message: "Application ID is required" }, { status: 400 });

    const store = getDataStore();
    updates.updatedAt = new Date().toISOString();

    if (!store.jobApplications) store.jobApplications = [];
    const idx = store.jobApplications.findIndex((a: any) => a._id === _id);
    if (idx !== -1) {
      store.jobApplications[idx] = { ...store.jobApplications[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await JobApplication.findByIdAndUpdate(_id, updates, { new: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB JobApplication update error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (err: any) {
    console.error("Applications PUT error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const store = getDataStore();
    store.jobApplications = (store.jobApplications || []).filter((a: any) => a._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await JobApplication.deleteOne({ _id: id });
      } catch (dbErr: any) {
        console.error("MongoDB JobApplication delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Application deleted successfully" });
  } catch (err: any) {
    console.error("Applications DELETE error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
