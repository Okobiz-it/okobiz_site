import { NextResponse } from "next/server";
import { getDataStore, saveDatastore } from "@/lib/dataStore";
import { connectDB } from "@/lib/mongodb";
import JobOpening from "@/models/JobOpening";
import JobApplication from "@/models/JobApplication";
import { createSlug } from "@/lib/slug";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idOrSlug = searchParams.get("id") || searchParams.get("slug");
    const activeOnly = searchParams.get("active") === "true";

    const db = await connectDB();
    if (db) {
      if (idOrSlug) {
        const job = await JobOpening.findOne({
          $or: [{ _id: idOrSlug }, { slug: idOrSlug.toLowerCase() }]
        });
        if (job) {
          const obj = job.toObject ? job.toObject() : job;
          const applicantsCount = await JobApplication.countDocuments({ jobId: obj._id });
          return NextResponse.json({ success: true, data: { ...obj, applicantsCount } });
        }
      } else {
        const filter = activeOnly ? { status: "active" } : {};
        let jobs = await JobOpening.find(filter).sort({ order: 1, createdAt: -1 });

        if (!jobs || jobs.length === 0) {
          const store = getDataStore();
          if (store.jobs && store.jobs.length > 0) {
            try {
              await JobOpening.insertMany(store.jobs, { ordered: false });
            } catch (seedErr: any) {
              console.warn("MongoDB auto-seed jobs notice:", seedErr.message);
            }
            try {
              jobs = await JobOpening.find(filter).sort({ order: 1, createdAt: -1 });
            } catch (queryErr: any) {
              console.warn("MongoDB re-fetch jobs notice:", queryErr.message);
            }
          }
        }

        // Aggregate applicant counts safely
        let countMap = new Map<string, number>();
        try {
          if (jobs && jobs.length > 0) {
            const jobIds = jobs.map((j: any) => j._id);
            const counts = await JobApplication.aggregate([
              { $match: { jobId: { $in: jobIds } } },
              { $group: { _id: "$jobId", count: { $sum: 1 } } }
            ]);
            countMap = new Map(counts.map((c: any) => [c._id, c.count]));
          }
        } catch (aggErr: any) {
          console.warn("MongoDB aggregate applicant counts notice:", aggErr.message);
        }

        const mapped = (jobs || []).map((j: any) => {
          const obj = j.toObject ? j.toObject() : j;
          return {
            ...obj,
            applicantsCount: countMap.get(obj._id) || 0
          };
        });

        return NextResponse.json({ success: true, data: mapped });
      }
    }
  } catch (err: any) {
    console.warn("MongoDB GET jobs notice:", err.message);
  }

  // Fallback to local dataStore
  const store = getDataStore();
  let list = (store.jobs || []).map((j: any) => {
    const apps = (store.jobApplications || []).filter((a: any) => a.jobId === j._id);
    return {
      ...j,
      applicantsCount: apps.length
    };
  });

  const { searchParams } = new URL(req.url);
  const idOrSlug = searchParams.get("id") || searchParams.get("slug");
  const activeOnly = searchParams.get("active") === "true";

  if (activeOnly) {
    list = list.filter((j: any) => j.status === "active");
  }

  if (idOrSlug) {
    const match = list.find(
      (j: any) => j._id === idOrSlug || j.slug.toLowerCase() === idOrSlug.toLowerCase()
    );
    return NextResponse.json({ success: !!match, data: match || null });
  }

  return NextResponse.json({ success: true, data: list });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const store = getDataStore();

    let rawSlug = createSlug(body.slug || body.title || "");
    if (!rawSlug) {
      rawSlug = "job-" + Date.now();
    }

    const isSlugDuplicateInStore = (store.jobs || []).some(
      (j: any) => (j.slug && j.slug.toLowerCase() === rawSlug) || j._id === rawSlug
    );

    let isSlugDuplicateInDb = false;
    const db = await connectDB();
    if (db) {
      try {
        const existing = await JobOpening.findOne({
          $or: [{ slug: rawSlug }, { _id: rawSlug }]
        });
        if (existing) isSlugDuplicateInDb = true;
      } catch (dbErr: any) {
        console.warn("MongoDB check duplicate slug notice:", dbErr.message);
      }
    }

    if (isSlugDuplicateInStore || isSlugDuplicateInDb) {
      rawSlug = `${rawSlug}-${Date.now().toString().slice(-4)}`;
    }

    const newJob = {
      _id: body._id || `job-${Date.now()}`,
      title: (body.title || "Untitled Role").trim(),
      slug: rawSlug,
      department: body.department || "Engineering",
      employmentType: body.employmentType || "Full-time",
      workplaceType: body.workplaceType || "On-site",
      location: body.location || "Mirpur, Dhaka 1216",
      experience: body.experience || "2-4 Years",
      salary: body.salary || "Negotiable",
      vacancies: Number(body.vacancies) || 1,
      deadline: body.deadline || "",
      description: body.description || "",
      responsibilities: Array.isArray(body.responsibilities)
        ? body.responsibilities
        : typeof body.responsibilities === "string"
        ? body.responsibilities.split("\n").map((r: string) => r.trim()).filter(Boolean)
        : [],
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : typeof body.requirements === "string"
        ? body.requirements.split("\n").map((r: string) => r.trim()).filter(Boolean)
        : [],
      benefits: Array.isArray(body.benefits)
        ? body.benefits
        : typeof body.benefits === "string"
        ? body.benefits.split("\n").map((b: string) => b.trim()).filter(Boolean)
        : [],
      status: body.status || "active",
      order: Number(body.order) || (store.jobs?.length || 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!store.jobs) store.jobs = [];
    store.jobs.unshift(newJob);
    saveDatastore(store);

    let finalDoc = newJob;
    if (db) {
      try {
        const created = await JobOpening.create(newJob);
        if (created) finalDoc = created.toObject ? created.toObject() : created;
      } catch (dbErr: any) {
        console.error("MongoDB JobOpening create error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: finalDoc });
  } catch (err: any) {
    console.error("Jobs POST error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { _id, ...updates } = body;
    if (!_id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const store = getDataStore();

    if (!updates.slug && updates.title) {
      updates.slug = createSlug(updates.title);
    }

    if (updates.slug !== undefined) {
      const cleanSlug = createSlug(updates.slug);
      if (!cleanSlug) {
        return NextResponse.json({ success: false, message: "Job slug cannot be empty." }, { status: 400 });
      }

      const isDuplicateStore = (store.jobs || []).some(
        (j: any) => j._id !== _id && ((j.slug && j.slug.toLowerCase() === cleanSlug) || j._id === cleanSlug)
      );

      let isDuplicateDb = false;
      const db = await connectDB();
      if (db) {
        try {
          const existing = await JobOpening.findOne({
            $or: [{ slug: cleanSlug }, { _id: cleanSlug }],
            _id: { $ne: _id }
          });
          if (existing) isDuplicateDb = true;
        } catch (_) {}
      }

      if (isDuplicateStore || isDuplicateDb) {
        return NextResponse.json(
          { success: false, message: `The slug "${cleanSlug}" is already in use by another job.` },
          { status: 400 }
        );
      }
      updates.slug = cleanSlug;
    }

    if (updates.responsibilities && typeof updates.responsibilities === "string") {
      updates.responsibilities = updates.responsibilities.split("\n").map((r: string) => r.trim()).filter(Boolean);
    }
    if (updates.requirements && typeof updates.requirements === "string") {
      updates.requirements = updates.requirements.split("\n").map((r: string) => r.trim()).filter(Boolean);
    }
    if (updates.benefits && typeof updates.benefits === "string") {
      updates.benefits = updates.benefits.split("\n").map((b: string) => b.trim()).filter(Boolean);
    }

    updates.updatedAt = new Date().toISOString();

    if (!store.jobs) store.jobs = [];
    const idx = store.jobs.findIndex((j: any) => j._id === _id);
    if (idx !== -1) {
      store.jobs[idx] = { ...store.jobs[idx], ...updates };
      saveDatastore(store);
    }

    let updatedDoc = { _id, ...updates };
    const db = await connectDB();
    if (db) {
      try {
        const res = await JobOpening.findByIdAndUpdate(_id, updates, { new: true, upsert: true });
        if (res) updatedDoc = res.toObject ? res.toObject() : res;
      } catch (dbErr: any) {
        console.error("MongoDB JobOpening update error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, data: updatedDoc });
  } catch (err: any) {
    console.error("Jobs PUT error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const store = getDataStore();
    store.jobs = (store.jobs || []).filter((j: any) => j._id !== id);
    saveDatastore(store);

    const db = await connectDB();
    if (db) {
      try {
        await JobOpening.deleteOne({ _id: id });
        // Clean up applications for this job
        await JobApplication.deleteMany({ jobId: id });
      } catch (dbErr: any) {
        console.error("MongoDB JobOpening delete error:", dbErr.message);
      }
    }

    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (err: any) {
    console.error("Jobs DELETE error:", err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
